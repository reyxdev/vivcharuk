import { createHash, randomUUID } from 'node:crypto';
import ExcelJS from 'exceljs';
import type { Prisma } from '@prisma/client';
import type { ProductDoc } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { getProduct, saveDraft } from './admin-products.service';

/**
 * Excel export and import of variants (37 §37.8, 23 §23.6.9, round 12 G8). Export mirrors import,
 * so export → edit → import is lossless. Matching is by variant SKU, never by name. A column absent
 * from the file is not touched; a present empty cell clears a field that may be empty. Nothing is
 * written until the dry run has been read and confirmed; the commit re-computes the diff and refuses
 * if it no longer matches what was shown (an order may have moved the stock meanwhile).
 *
 * A new variant SKU on a row whose «Артикул товару» exists adds that variant to the product's draft
 * (37 §37.8: «the paper notebook's stock is entered this way»); it reaches the site when the product
 * is published, like any edit in the editor. The «Варіант» cell names its options as the export
 * writes them («200×220 см · Сірий»). New products are still created in the panel.
 */

type Kind = 'money' | 'int' | 'text';
interface Col { key: string; header: string; width: number; editable?: { kind: Kind; nullable: boolean; perm?: string; inDraft?: boolean } }

export const COLUMNS: Col[] = [
  { key: 'product_sku', header: 'Артикул товару', width: 16 },
  { key: 'variant_sku', header: 'Артикул варіанта', width: 20 },
  { key: 'name', header: 'Назва', width: 34 },
  { key: 'variant', header: 'Варіант', width: 26 },
  { key: 'status', header: 'Статус', width: 12 },
  { key: 'price', header: 'Ціна, ₴', width: 12, editable: { kind: 'money', nullable: false, perm: 'products.manage_price', inDraft: true } },
  { key: 'compare_at', header: 'Стара ціна, ₴', width: 14, editable: { kind: 'money', nullable: true, perm: 'products.manage_price', inDraft: true } },
  { key: 'stock', header: 'Залишок', width: 10, editable: { kind: 'int', nullable: false, perm: 'products.manage_stock', inDraft: true } },
  { key: 'low_stock', header: 'Попередити при залишку', width: 14, editable: { kind: 'int', nullable: false, perm: 'products.manage_stock' } },
  { key: 'weight_g', header: 'Вага, г', width: 10, editable: { kind: 'int', nullable: true, inDraft: true } },
  { key: 'packed_weight_g', header: 'Вага в упаковці, г', width: 14, editable: { kind: 'int', nullable: true, inDraft: true } },
  { key: 'packed_length_cm', header: 'Упаковка: довжина, см', width: 14, editable: { kind: 'int', nullable: true, inDraft: true } },
  { key: 'packed_width_cm', header: 'Упаковка: ширина, см', width: 14, editable: { kind: 'int', nullable: true, inDraft: true } },
  { key: 'packed_height_cm', header: 'Упаковка: висота, см', width: 14, editable: { kind: 'int', nullable: true, inDraft: true } },
  { key: 'length_m', header: 'Метраж, м', width: 10, editable: { kind: 'int', nullable: true } },
  { key: 'ply', header: 'Товщина нитки', width: 14, editable: { kind: 'text', nullable: true } },
  { key: 'barcode', header: 'Штрихкод', width: 16, editable: { kind: 'text', nullable: true } },
];

// Column key → variant field, and the draft document field when the editor's working copy has one.
const FIELD: Record<string, { db: string; doc?: keyof ProductDoc['variants'][number] }> = {
  price: { db: 'priceMinor', doc: 'priceMinor' },
  compare_at: { db: 'compareAtMinor', doc: 'compareAtMinor' },
  stock: { db: 'stockQty', doc: 'stockQty' },
  low_stock: { db: 'lowStockAt' },
  weight_g: { db: 'weightGrams', doc: 'weightGrams' },
  packed_weight_g: { db: 'packedWeightGrams', doc: 'packedWeightGrams' },
  packed_length_cm: { db: 'packedLengthCm', doc: 'packedLengthCm' },
  packed_width_cm: { db: 'packedWidthCm', doc: 'packedWidthCm' },
  packed_height_cm: { db: 'packedHeightCm', doc: 'packedHeightCm' },
  length_m: { db: 'lengthMetres' },
  ply: { db: 'plyThickness' },
  barcode: { db: 'barcode' },
};

const STATUS = { DRAFT: 'Чернетка', ACTIVE: 'На сайті', ARCHIVED: 'Архів' } as const;

/** Strict money: «5 300», «5300», «5300.00», «5300,00» → kopecks; anything else is an error. */
export function parseMoney(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6 ? Math.round(v * 100) : null;
  const s = String(v).replace(/[  ]/g, ' ').trim();
  if (!/^(\d{1,3}( \d{3})+|\d+)([.,]\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s.replace(/ /g, '').replace(',', '.')) * 100);
}

export function parseInt0(v: unknown): number | null {
  const s = typeof v === 'number' ? String(v) : String(v).replace(/[   ]/g, '').trim();
  return /^\d{1,7}$/.test(s) ? Number(s) : null;
}

const variantInclude = {
  product: { select: { id: true, sku: true, status: true, isUniquePiece: true, allowsCustomSize: true, draftDocument: true, templateId: true, translations: { where: { locale: 'uk' as const }, select: { name: true } } } },
  options: { include: { optionValue: { select: { position: true, translations: { where: { locale: 'uk' as const }, select: { label: true } } } } } },
} satisfies Prisma.ProductVariantInclude;
type Variant = Prisma.ProductVariantGetPayload<{ include: typeof variantInclude }>;

const variantLabel = (v: Variant) => v.options.map((o) => o.optionValue.translations[0]?.label ?? '').filter(Boolean).join(' · ');

export async function exportXlsx(templateId?: string) {
  const variants = await prisma.productVariant.findMany({
    where: { deletedAt: null, product: { deletedAt: null, ...(templateId ? { templateId } : {}) } },
    include: variantInclude,
    orderBy: [{ product: { sku: 'asc' } }, { position: 'asc' }],
  });
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Вівчарик';
  const ws = wb.addWorksheet('Товари', { views: [{ state: 'frozen', xSplit: 3, ySplit: 1 }] });
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  for (const v of variants) {
    ws.addRow({
      product_sku: v.product.sku, variant_sku: v.sku, name: v.product.translations[0]?.name ?? '', variant: variantLabel(v), status: STATUS[v.product.status],
      price: v.priceMinor / 100, compare_at: v.compareAtMinor === null ? null : v.compareAtMinor / 100, stock: v.stockQty, low_stock: v.lowStockAt,
      weight_g: v.weightGrams, packed_weight_g: v.packedWeightGrams, packed_length_cm: v.packedLengthCm, packed_width_cm: v.packedWidthCm, packed_height_cm: v.packedHeightCm,
      length_m: v.lengthMetres, ply: v.plyThickness, barcode: v.barcode,
    });
  }
  // Grey headers are for reading only: the import ignores those columns.
  COLUMNS.forEach((c, i) => {
    const cell = ws.getRow(1).getCell(i + 1);
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.editable || c.key === 'variant_sku' ? 'FFF4D9B8' : 'FFE5E5E5' } };
    if (c.editable?.kind === 'money') ws.getColumn(i + 1).numFmt = '# ##0.00';
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };

  // Round 12 G9: the sizes and colours each template allows, spelled exactly as «Варіант» expects.
  const templates = await prisma.productTemplate.findMany({ where: templateId ? { id: templateId } : { isHidden: false }, orderBy: { createdAt: 'asc' }, select: { key: true, typePrefix: true, axes: true } });
  const types = await prisma.optionType.findMany({
    where: { key: { in: [...new Set(templates.flatMap((t) => t.axes))] } },
    select: { key: true, translations: { where: { locale: 'uk' }, select: { name: true } }, values: { where: { isHidden: false }, orderBy: { sortKey: 'asc' }, select: { key: true, translations: { where: { locale: 'uk' }, select: { label: true } } } } },
  });
  const ref = wb.addWorksheet('Довідник');
  ref.addRow(['Тип товару', 'Параметр', 'Можливі значення для стовпця «Варіант» (через « · »)']).font = { bold: true };
  for (const t of templates) {
    for (const axis of t.axes) {
      const ot = types.find((x) => x.key === axis);
      const values = ot?.values.filter((v) => axis !== 'size' || v.key.startsWith(`${t.key}-`)) ?? [];
      if (ot && values.length) ref.addRow([t.typePrefix, ot.translations[0]?.name ?? axis, values.map((v) => v.translations[0]?.label).filter(Boolean).join(' | ')]);
    }
  }
  ref.columns = [{ width: 18 }, { width: 14 }, { width: 120 }];
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export interface ImportRow {
  rowNumber: number; variantSku: string; productId: string | null; name: string; variant: string;
  action: 'update' | 'create' | 'unchanged' | 'error';
  changes: Record<string, [unknown, unknown]>;
  errors: string[]; warnings: string[];
}

type Actor = { id: string; email: string; permissions: Set<string> };

const cellValue = (c: ExcelJS.Cell): unknown => {
  const v = c.value;
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') {
    if ('result' in v) return (v as ExcelJS.CellFormulaValue).result ?? null;
    if ('richText' in v) return (v as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join('');
    if ('text' in v) return (v as { text: string }).text;
  }
  return v;
};
const blank = (v: unknown) => v === null || (typeof v === 'string' && v.trim() === '');

async function readSheet(file: Buffer) {
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.load(file as unknown as ExcelJS.Buffer); } catch { throw new AppError(422, 'VALIDATION_FAILED', 'NOT_XLSX'); }
  const ws = wb.worksheets[0];
  if (!ws) throw new AppError(422, 'VALIDATION_FAILED', 'NOT_XLSX');
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const byHeader = new Map(COLUMNS.flatMap((c) => [[norm(c.header), c], [c.key, c]] as const));
  const cols = new Map<number, Col>();
  const unknown: string[] = [];
  ws.getRow(1).eachCell((cell, n) => {
    const h = String(cellValue(cell) ?? '');
    const c = byHeader.get(norm(h));
    if (c) cols.set(n, c); else if (h.trim()) unknown.push(h.trim());
  });
  if (![...cols.values()].some((c) => c.key === 'variant_sku')) throw new AppError(422, 'VALIDATION_FAILED', 'NO_SKU_COLUMN');
  const rows: Array<{ rowNumber: number; values: Map<string, unknown> }> = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const values = new Map<string, unknown>();
    for (const [i, c] of cols) values.set(c.key, cellValue(row.getCell(i)));
    if ([...values.values()].every(blank)) return;
    rows.push({ rowNumber: n, values });
  });
  if (rows.length > 5000) throw new AppError(422, 'VALIDATION_FAILED', 'TOO_MANY_ROWS');
  return { columns: [...cols.values()], unknown, rows };
}

/** Dry run: the full diff, written to nothing. `hash` pins it for the commit. */
export async function dryRun(file: Buffer, actor: Actor) {
  const { columns, unknown, rows } = await readSheet(file);
  const editable = columns.filter((c) => c.editable);
  const allowed = editable.filter((c) => !c.editable!.perm || actor.permissions.has(c.editable!.perm));
  const skippedColumns = editable.filter((c) => !allowed.includes(c)).map((c) => c.header);
  const skus = rows.map((r) => String(r.values.get('variant_sku') ?? '').trim()).filter(Boolean);
  const variants = new Map((await prisma.productVariant.findMany({ where: { sku: { in: skus }, deletedAt: null, product: { deletedAt: null } }, include: variantInclude })).map((v) => [v.sku, v]));
  // Rows that would add a variant: their products' working documents and option labels.
  const cell = (v: Map<string, unknown>, k: string) => String(v.get(k) ?? '').trim();
  const newRows = rows.filter((r) => cell(r.values, 'variant_sku') && !variants.has(cell(r.values, 'variant_sku')));
  const pskus = [...new Set(newRows.map((r) => cell(r.values, 'product_sku')).filter(Boolean))];
  const products = new Map((await prisma.product.findMany({ where: { sku: { in: pskus }, deletedAt: null }, select: { id: true, sku: true, isUniquePiece: true, template: { select: { key: true, axes: true } }, translations: { where: { locale: 'uk' }, select: { name: true } } } })).map((p) => [p.sku, p]));
  const docs = new Map<string, ProductDoc>();
  for (const p of products.values()) docs.set(p.sku, (await getProduct(p.id)).document);
  const optionRows = products.size ? await prisma.optionValue.findMany({ where: { isHidden: false, optionType: { key: { in: [...new Set([...products.values()].flatMap((p) => p.template.axes))] } } }, select: { id: true, key: true, optionType: { select: { key: true } }, translations: { where: { locale: 'uk' }, select: { label: true } } } }) : [];
  // «200х220 см», «200x220 см» and «200 × 220 см» are the same size.
  const norm = (x: string) => x.toLowerCase().replace(/(\d)\s*[xх×*]\s*(\d)/g, '$1×$2').replace(/\s+/g, ' ').trim();
  // Sizes belong to one template (their key starts with it: «kaptsi-37»); colours and patterns are shared.
  const byLabel = new Map<string, Array<{ id: string; axis: string; key: string }>>();
  for (const o of optionRows) {
    const l = o.translations[0]?.label;
    if (l) { const k = `${o.optionType.key}|${norm(l)}`; byLabel.set(k, [...(byLabel.get(k) ?? []), { id: o.id, axis: o.optionType.key, key: o.key }]); }
  }
  const addedSkus = new Map<string, Set<string>>();

  const seen = new Map<string, number>();
  const blockers: Array<{ code: string; message: string; rowNumbers: number[] }> = [];

  const out: ImportRow[] = rows.map(({ rowNumber, values }) => {
    const sku = String(values.get('variant_sku') ?? '').trim();
    const v = variants.get(sku);
    const r: ImportRow = { rowNumber, variantSku: sku, productId: v?.product.id ?? null, name: v?.product.translations[0]?.name ?? String(values.get('name') ?? ''), variant: v ? variantLabel(v) : '', action: 'unchanged', changes: {}, errors: [], warnings: [] };
    if (!sku) { r.errors.push('Немає артикула варіанта'); r.action = 'error'; return r; }
    if (seen.has(sku)) { r.errors.push(`Артикул уже є в рядку ${seen.get(sku)}`); r.action = 'error'; return r; }
    seen.set(sku, rowNumber);
    if (!v) return newVariant(r, values);

    const next: Record<string, unknown> = {};
    for (const c of allowed) {
      const raw = values.get(c.key);
      const e = c.editable!;
      let val: number | string | null;
      if (blank(raw)) {
        if (!e.nullable) { r.errors.push(`${c.header}: не може бути порожнім`); continue; }
        val = null;
      } else if (e.kind === 'money') {
        val = parseMoney(raw);
        if (val === null) { r.errors.push(`${c.header}: «${String(raw)}» — не схоже на суму. Приклад: 5 300 або 5300,00`); continue; }
      } else if (e.kind === 'int') {
        val = parseInt0(raw);
        if (val === null) { r.errors.push(`${c.header}: «${String(raw)}» — потрібне ціле число`); continue; }
      } else val = String(raw).trim().slice(0, 120);
      next[c.key] = val;
      const before = (v as unknown as Record<string, unknown>)[FIELD[c.key]!.db] ?? null;
      if (before !== val) r.changes[c.key] = [before, val];
    }

    const price = (next.price ?? v.priceMinor) as number;
    const compareAt = 'compare_at' in next ? (next.compare_at as number | null) : v.compareAtMinor;
    if ('price' in next && price === 0) r.errors.push('Ціна 0 ₴ — так не можна');
    if (compareAt !== null && compareAt <= price && ('price' in r.changes || 'compare_at' in r.changes)) r.errors.push('Стара ціна має бути більшою за нову');
    if (r.changes.price && v.priceMinor > 0 && Math.abs(price - v.priceMinor) / v.priceMinor > 0.5) r.warnings.push(`Ціна змінюється більш ніж на 50 %: ${v.priceMinor / 100} → ${price / 100} ₴`);
    if (r.changes.stock && v.product.isUniquePiece && (next.stock as number) > 1) r.errors.push('Це єдиний екземпляр — залишок не більше 1');
    r.action = r.errors.length ? 'error' : Object.keys(r.changes).length ? 'update' : 'unchanged';
    if (r.action === 'error') r.changes = {};
    return r;
  });

  function newVariant(r: ImportRow, values: Map<string, unknown>): ImportRow {
    const fail = (m: string) => { r.errors.push(m); r.action = 'error'; r.changes = {}; return r; };
    const psku = cell(values, 'product_sku');
    const p = products.get(psku);
    if (!psku) return fail('Такого варіанта немає. Щоб додати новий, вкажіть «Артикул товару» існуючого товару');
    if (!p) return fail(`Товару з артикулом ${psku} немає. Новий товар створіть у панелі`);
    const doc = docs.get(psku)!;
    r.productId = p.id; r.name = p.translations[0]?.name ?? psku;
    if (!/^[A-Z0-9][A-Z0-9-]{2,39}$/.test(r.variantSku)) return fail('Артикул варіанта: великі латинські літери, цифри й «-», 3–40 знаків');
    const taken = addedSkus.get(psku) ?? new Set(doc.variants.map((x) => x.sku));
    if (taken.has(r.variantSku)) return fail('Такий артикул уже є в чернетці цього товару');
    if (p.isUniquePiece) return fail('Це єдиний екземпляр — у нього не буває інших варіантів');
    // «Варіант»: the option labels, in any order, one per axis of the product's template.
    const parts = cell(values, 'variant').split(/\s*[·•;]\s*/).filter(Boolean);
    if (!parts.length) return fail(`Вкажіть «Варіант» — наприклад, як в інших рядках цього товару`);
    const ids: string[] = [], axes = new Set<string>();
    // Longest match first: a label may itself contain «·» («Двоспальний · 200×220 см»).
    const find = (label: string) => p.template.axes.map((ax) => byLabel.get(`${ax}|${norm(label)}`)?.find((o) => ax !== 'size' || o.key.startsWith(`${p.template.key}-`))).find(Boolean);
    for (let i = 0; i < parts.length;) {
      let j = parts.length, hit: { id: string; axis: string } | undefined;
      for (; j > i; j--) if ((hit = find(parts.slice(i, j).join(' · ')))) break;
      if (!hit) return fail(`«${parts[i]}» — немає такого розміру чи кольору в бібліотеці. Додайте його в «Бібліотеках» або виправте назву`);
      if (axes.has(hit.axis)) return fail(`«${parts.slice(i, j).join(' · ')}»: два значення для одного параметра`);
      axes.add(hit.axis); ids.push(hit.id); i = j;
    }
    const key = [...ids].sort().join(',');
    if (doc.variants.some((x) => [...x.optionValueIds].sort().join(',') === key)) return fail('Такий варіант у товарі вже є — змініть його рядок замість нового');
    for (const c of allowed) {
      const raw = values.get(c.key);
      if (blank(raw)) continue;
      // The draft document has no place for these live-only fields yet.
      if (!FIELD[c.key]!.doc && c.key !== 'low_stock') return fail(`${c.header} нового варіанта внесіть після публікації товару — поки залиште клітинку порожньою`);
      if (c.key === 'low_stock') continue;
      const val = c.editable!.kind === 'money' ? parseMoney(raw) : c.editable!.kind === 'int' ? parseInt0(raw) : String(raw).trim().slice(0, 120);
      if (val === null) return fail(`${c.header}: «${String(raw)}» — не вдалося прочитати`);
      r.changes[c.key] = [null, val];
    }
    if (!r.changes.price || !r.changes.price[1]) return fail(allowed.some((c) => c.key === 'price') ? 'Для нового варіанта потрібна ціна' : 'Новий варіант потребує ціни, а змінювати ціни ви не маєте права');
    r.changes.variant = [null, parts.join(' · ')];
    r.variant = parts.join(' · ');
    taken.add(r.variantSku); addedSkus.set(psku, taken);
    (r as ImportRow & { optionValueIds?: string[] }).optionValueIds = ids;
    r.action = 'create';
    return r;
  }

  const errorRows = out.filter((r) => r.action === 'error').map((r) => r.rowNumber);
  if (errorRows.length) blockers.push({ code: 'ROW_ERRORS', message: 'Виправте рядки з помилками й завантажте файл ще раз', rowNumbers: errorRows });
  const changed = out.filter((r) => r.action === 'update' || r.action === 'create');
  const hash = createHash('sha256').update(JSON.stringify(changed.map((r) => [r.variantSku, r.changes]))).digest('hex');
  return {
    totals: { update: out.filter((r) => r.action === 'update').length, create: out.filter((r) => r.action === 'create').length, unchanged: out.filter((r) => r.action === 'unchanged').length, error: errorRows.length },
    rows: out.filter((r) => r.action !== 'unchanged'),
    blockers, warnings: out.filter((r) => r.warnings.length).length,
    columns: allowed.map((c) => c.header), skippedColumns, unknownColumns: unknown, hash,
  };
}

/** Commit: one transaction, one audit row per product with a shared batch id. */
export async function commit(file: Buffer, expectedHash: string, confirmWarnings: boolean, actor: Actor) {
  const d = await dryRun(file, actor);
  if (d.blockers.length) throw new AppError(422, 'VALIDATION_FAILED', 'IMPORT_BLOCKED');
  if (d.hash !== expectedHash) throw new AppError(409, 'VALIDATION_FAILED', 'IMPORT_CHANGED');
  if (d.warnings && !confirmWarnings) throw new AppError(409, 'VALIDATION_FAILED', 'WARNINGS_NOT_CONFIRMED');
  const rows = d.rows.filter((r) => r.action === 'update');
  const creates = d.rows.filter((r) => r.action === 'create') as Array<ImportRow & { optionValueIds: string[] }>;
  if (!rows.length && !creates.length) return { updated: 0, created: 0, auditBatchId: null };
  const auditBatchId = randomUUID();
  const byProduct = new Map<string, ImportRow[]>();
  for (const r of rows) byProduct.set(r.productId!, [...(byProduct.get(r.productId!) ?? []), r]);

  await prisma.$transaction(async (tx) => {
    for (const [productId, list] of byProduct) {
      const p = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { sku: true, draftDocument: true, allowsCustomSize: true, translations: { where: { locale: 'uk' }, select: { name: true } } } });
      const draft = p.draftDocument as unknown as ProductDoc | null;
      for (const r of list) {
        const data = Object.fromEntries(Object.entries(r.changes).map(([k, [, after]]) => [FIELD[k]!.db, after]));
        const v = await tx.productVariant.update({ where: { sku: r.variantSku }, data });
        // Every stock change is a movement with a source (37 §37.6).
        if (r.changes.stock) {
          const [before, after] = r.changes.stock as [number, number];
          await tx.stockMovement.create({ data: { variantId: v.id, delta: after - before, source: 'IMPORT', reason: 'Імпорт з Excel', createdById: actor.id } });
        }
        // An open draft follows, or a later publish would put the old values back.
        if (draft) {
          draft.variants = draft.variants.map((dv) => {
            if (dv.id !== v.id) return dv;
            const patch = Object.fromEntries(Object.entries(r.changes).flatMap(([k, [, after]]) => (FIELD[k]!.doc ? [[FIELD[k]!.doc, after]] : [])));
            return { ...dv, ...patch };
          });
        }
      }
      const live = await tx.productVariant.findMany({ where: { productId, deletedAt: null, isActive: true }, select: { priceMinor: true, stockQty: true, madeToOrderDays: true } });
      const prices = live.map((x) => x.priceMinor);
      await tx.product.update({
        where: { id: productId },
        data: {
          priceMinMinor: prices.length ? Math.min(...prices) : 0, priceMaxMinor: prices.length ? Math.max(...prices) : 0,
          inStock: live.some((x) => x.stockQty > 0 || !!x.madeToOrderDays) || p.allowsCustomSize,
          ...(draft ? { draftDocument: draft as unknown as Prisma.InputJsonValue } : {}),
        },
      });
      await audit({
        actorId: actor.id, actorEmail: actor.email, action: 'product.import', resourceType: 'Product', resourceId: productId, resourceLabel: p.translations[0]?.name ?? p.sku,
        before: { auditBatchId, variants: Object.fromEntries(list.map((r) => [r.variantSku, Object.fromEntries(Object.entries(r.changes).map(([k, [b]]) => [k, b]))])) } as never,
        after: { auditBatchId, variants: Object.fromEntries(list.map((r) => [r.variantSku, Object.fromEntries(Object.entries(r.changes).map(([k, [, a]]) => [k, a]))])) } as never,
      }, tx);
    }
  }, { timeout: 120_000 });

  // New variants go into each product's draft through the editor's own save (field permissions,
  // readiness); «Опублікувати» in the product puts them on the site.
  const byNew = new Map<string, typeof creates>();
  for (const r of creates) byNew.set(r.productId!, [...(byNew.get(r.productId!) ?? []), r]);
  for (const [productId, list] of byNew) {
    const doc = (await getProduct(productId)).document;
    for (const r of list) {
      const v = (k: string) => (r.changes[k]?.[1] ?? null) as number | null;
      doc.variants.push({
        sku: r.variantSku, optionValueIds: r.optionValueIds, priceMinor: v('price')!, compareAtMinor: v('compare_at'), stockQty: v('stock') ?? 0,
        madeToOrderDays: null, weightGrams: v('weight_g'), packedWeightGrams: v('packed_weight_g'), packedLengthCm: v('packed_length_cm'),
        packedWidthCm: v('packed_width_cm'), packedHeightCm: v('packed_height_cm'), isMainColor: false, isActive: true,
      });
    }
    await saveDraft(productId, doc, actor);
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.import_variants', resourceType: 'Product', resourceId: productId, resourceLabel: list[0]!.name, after: { auditBatchId, added: list.map((r) => ({ sku: r.variantSku, variant: r.variant })) } as never });
  }
  return { updated: rows.length, created: creates.length, auditBatchId };
}
