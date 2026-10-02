import { createHash } from 'node:crypto';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';

/**
 * Prom reviews import (round 13 N2): 3–5 stars only, original date kept, labelled «Prom.ua ·
 * перенесено», matched to a product by SKU or exact name, otherwise a shop review. Preview first,
 * then «Підтвердити» (round 12 G8). Re-importing the same file adds nothing (sourceRef).
 */
export const PROM_COLUMNS = ['date', 'rating', 'author', 'text', 'product', 'ref'] as const;

/** RFC 4180: quoted fields, doubled quotes, commas and newlines inside quotes; `;` also accepted. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const delim = (src.split('\n')[0] ?? '').split(';').length > (src.split('\n')[0] ?? '').split(',').length ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (q) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && src[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((c) => c.trim())) rows.push(row); row = []; }
    else cell += ch;
  }
  row.push(cell); if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

function parseDate(s: string) {
  const t = s.trim();
  const m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(t); // 14.03.2025
  const d = m ? new Date(Date.UTC(+m[3]!, +m[2]! - 1, +m[1]!)) : new Date(t);
  return Number.isNaN(d.getTime()) || d.getTime() > Date.now() ? null : d;
}

export interface PreviewRow {
  line: number; status: 'import' | 'skip'; reason?: string;
  date: string | null; rating: number | null; author: string; text: string; product: { id: string; name: string } | null; ref: string;
}

export async function preview(csv: string): Promise<PreviewRow[]> {
  const rows = parseCsv(csv);
  if (!rows.length) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'csv', code: 'EMPTY' }]);
  const header = rows[0]!.map((h) => h.trim().toLowerCase());
  const idx = Object.fromEntries(PROM_COLUMNS.map((c) => [c, header.indexOf(c)]));
  if (idx.rating! < 0 || idx.text! < 0 || idx.author! < 0 || idx.date! < 0) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'csv', code: 'COLUMNS', params: { expected: PROM_COLUMNS } }]);
  const products = await prisma.product.findMany({ where: { deletedAt: null }, select: { id: true, sku: true, variants: { select: { sku: true } }, translations: { where: { locale: 'uk' }, select: { name: true } } } });
  const existing = new Set((await prisma.review.findMany({ where: { source: 'PROM', sourceRef: { not: null } }, select: { sourceRef: true } })).map((r) => r.sourceRef!));
  const seen = new Set<string>();
  const norm = (s: string) => s.toLowerCase().replace(/[«»"']/g, '').replace(/\s+/g, ' ').trim();

  return rows.slice(1).map((r, i) => {
    const get = (c: (typeof PROM_COLUMNS)[number]) => (idx[c]! >= 0 ? (r[idx[c]!] ?? '').trim() : '');
    const rating = Number(get('rating').replace(',', '.'));
    const date = parseDate(get('date'));
    const author = get('author'), text = get('text'), productRef = get('product');
    // The original id when Prom gives one; otherwise a hash of the review itself, so a re-import is recognised.
    const ref = `prom:${get('ref') || createHash('sha256').update(`${get('date')}|${author}|${text}`).digest('hex').slice(0, 16)}`;
    const p = productRef ? products.find((x) => x.sku === productRef || x.variants.some((v) => v.sku === productRef) || norm(x.translations[0]?.name ?? '') === norm(productRef)) : undefined;
    const base = { line: i + 2, date: date?.toISOString() ?? null, rating: Number.isFinite(rating) ? rating : null, author, text, product: p ? { id: p.id, name: p.translations[0]?.name ?? p.sku } : null, ref };
    const skip = (reason: string): PreviewRow => ({ ...base, status: 'skip', reason });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return skip('Оцінка не 1–5');
    if (rating < 3) return skip('Оцінка нижче 3 — не переносимо (раунд 13)');
    if (!date) return skip('Невірна дата');
    if (author.length < 2 || text.length < 2) return skip('Немає імені або тексту');
    if (existing.has(ref) || seen.has(ref)) return skip('Вже імпортовано');
    seen.add(ref);
    return { ...base, status: 'import' };
  });
}

export async function commit(csv: string, actor: { id: string; email: string }) {
  const rows = (await preview(csv)).filter((r) => r.status === 'import');
  await prisma.$transaction(async (tx) => {
    for (const r of rows) {
      await tx.review.create({
        data: {
          productId: r.product?.id ?? null, authorName: r.author, authorEmail: null, rating: r.rating!, body: r.text,
          // The owner has just reviewed every row in the preview; imports go straight to the site.
          status: 'APPROVED', source: 'PROM', sourceRef: r.ref, sourceDate: new Date(r.date!), createdAt: new Date(r.date!),
        },
      });
    }
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'review.imported', resourceType: 'Review', resourceLabel: `Prom: ${rows.length}`, after: { count: rows.length } }, tx);
  }, { timeout: 60_000 });
  return { imported: rows.length };
}
