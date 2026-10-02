import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { ProductDoc } from '@vivcharyk/schemas';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { deleteProduct } from './admin-products.service';

/**
 * Bulk editing across products (23 §23.6.7), narrowed by round 12 V13 and round 10: stock is edited
 * in the product only. One typed command, one transaction, one audit row per product sharing an
 * `auditBatchId`, a dry run of the same shape, `expectedCount` against a moved selection, and a
 * one-click revert from the audit `before` payloads.
 */
export const bulkOperation = z.discriminatedUnion('op', [
  z.object({ op: z.literal('price_adjust'), mode: z.enum(['percent', 'absolute']), value: z.number().min(-100_000).max(100_000), round: z.enum(['none', 'to_10']) }),
  z.object({ op: z.literal('add_category'), categoryId: z.string() }),
  z.object({ op: z.literal('remove_category'), categoryId: z.string() }),
  z.object({ op: z.literal('archive') }),
  z.object({ op: z.literal('restore') }),
  z.object({ op: z.literal('set_handmade'), value: z.boolean() }),
  // Round 22 K44 (replaces round 20 #123 «Перенести в категорію»): the category becomes the main one
  // (the additional ones stay, up to two) or is added as an additional one (three in all, K02). Only a
  // subcategory or a group without subcategories (K03). «Видалити» (products.delete, never ordered).
  z.object({ op: z.literal('set_category'), categoryId: z.string().max(40), mode: z.enum(['main', 'additional']) }),
  z.object({ op: z.literal('delete') }),
]);
export type BulkOperation = z.infer<typeof bulkOperation>;
export const bulkRequest = z.object({ ids: z.array(z.string()).min(1).max(500), operation: bulkOperation, expectedCount: z.number().int(), dryRun: z.boolean().default(false) });

type Actor = { id: string; email: string; permissions: Set<string> };

const newPrice = (minor: number, op: Extract<BulkOperation, { op: 'price_adjust' }>) => {
  const raw = op.mode === 'percent' ? minor * (1 + op.value / 100) : minor + Math.round(op.value * 100);
  const rounded = op.round === 'to_10' ? Math.round(raw / 1000) * 1000 : Math.round(raw / 100) * 100; // whole hryvnias, or tens
  return rounded;
};

export async function runBulk(input: z.infer<typeof bulkRequest>, actor: Actor) {
  const { operation: op } = input;
  if (op.op === 'price_adjust' && !actor.permissions.has('products.manage_price')) throw forbidden();
  if ((op.op === 'archive' || op.op === 'restore') && !actor.permissions.has('products.archive')) throw forbidden();
  if (op.op === 'delete' && !actor.permissions.has('products.delete')) throw forbidden();
  if (op.op === 'set_category') {
    if (!actor.permissions.has('products.update')) throw forbidden();
    const c = await prisma.category.findFirst({ where: { id: op.categoryId, deletedAt: null }, select: { _count: { select: { children: { where: { deletedAt: null } } } } } });
    if (!c || c._count.children) throw new AppError(422, 'VALIDATION_FAILED', 'CATEGORY_NOT_CHOOSABLE');
  }
  const products = await prisma.product.findMany({
    where: { id: { in: input.ids }, deletedAt: null },
    include: { variants: { where: { deletedAt: null } }, categories: { orderBy: { sortOrder: 'asc' } }, translations: { where: { locale: 'uk' }, select: { name: true } } },
  });
  const ordered = op.op === 'delete'
    ? new Set((await prisma.orderItem.findMany({ where: { variant: { productId: { in: input.ids } } }, select: { variant: { select: { productId: true } } } })).map((r) => r.variant!.productId))
    : new Set<string>();
  if (products.length !== input.expectedCount) throw new AppError(409, 'VALIDATION_FAILED', 'SELECTION_CHANGED', { found: products.length });

  const skipped: Array<{ id: string; sku: string; reason: string }> = [];
  const changes: Array<{ p: (typeof products)[number]; before: Record<string, unknown>; after: Record<string, unknown> }> = [];
  for (const p of products) {
    const skip = (reason: string) => skipped.push({ id: p.id, sku: p.sku, reason });
    switch (op.op) {
      case 'price_adjust': {
        const before = Object.fromEntries(p.variants.map((v) => [v.id, v.priceMinor]));
        const after = Object.fromEntries(p.variants.map((v) => [v.id, newPrice(v.priceMinor, op)]));
        if (Object.values(after).some((x) => x <= 0)) { skip('Ціна стала б нульовою або від’ємною'); break; }
        if (!p.variants.length) { skip('Немає варіантів'); break; }
        changes.push({ p, before: { prices: before }, after: { prices: after } });
        break;
      }
      case 'add_category':
        if (p.categories.some((c) => c.categoryId === op.categoryId)) { skip('Вже в цій категорії'); break; }
        changes.push({ p, before: { categoryIds: p.categories.map((c) => c.categoryId) }, after: { addCategory: op.categoryId } });
        break;
      case 'remove_category':
        if (!p.categories.some((c) => c.categoryId === op.categoryId)) { skip('Не в цій категорії'); break; }
        if (p.categories.length === 1) { skip('Це єдина категорія товару'); break; }
        changes.push({ p, before: { categoryIds: p.categories.map((c) => c.categoryId) }, after: { removeCategory: op.categoryId } });
        break;
      case 'archive':
        if (p.status === 'ARCHIVED') { skip('Вже в архіві'); break; }
        changes.push({ p, before: { status: p.status }, after: { status: 'ARCHIVED' } });
        break;
      case 'restore':
        if (p.status !== 'ARCHIVED') { skip('Не в архіві'); break; }
        changes.push({ p, before: { status: 'ARCHIVED' }, after: { status: p.publishedAt ? 'ACTIVE' : 'DRAFT' } });
        break;
      case 'set_category': {
        // A never-published draft keeps its categories in the draft document (index 0 = main).
        const draft = !p.publishedAt ? (p.draftDocument as unknown as ProductDoc | null) : null;
        const current = draft ? draft.categoryIds : p.categories.map((c) => c.categoryId);
        let next: string[];
        if (op.mode === 'main') {
          if (current[0] === op.categoryId) { skip('Вже основна категорія'); break; }
          next = [op.categoryId, ...current.slice(1).filter((x) => x !== op.categoryId).slice(0, 2)];
        } else {
          if (current.includes(op.categoryId)) { skip('Вже в цій категорії'); break; }
          if (current.length >= 3) { skip('Вже три категорії'); break; }
          next = [...current, op.categoryId]; // no category yet: it becomes the main one
        }
        changes.push({ p, before: { categoryIds: current }, after: { categoryIds: next } });
        break;
      }
      case 'delete':
        if (ordered.has(p.id)) { skip('Є замовлення — товар можна лише сховати'); break; }
        changes.push({ p, before: { status: p.status }, after: { deleted: true } });
        break;
      case 'set_handmade':
        if (p.isHandmade === op.value) { skip('Вже так'); break; }
        if (op.value && p.origin === 'PARTNER_MANUFACTURE') { skip('Товар партнера'); break; }
        changes.push({ p, before: { isHandmade: p.isHandmade }, after: { isHandmade: op.value } });
        break;
    }
  }
  const preview = changes.slice(0, 20).map((c) => ({ id: c.p.id, sku: c.p.sku, name: c.p.translations[0]?.name ?? c.p.sku, before: c.before, after: c.after }));
  if (input.dryRun) return { affected: changes.length, skipped, preview, auditBatchId: null };

  if (op.op === 'delete') {
    // Not revertible: each product gets its own «product.deleted» audit row.
    await prisma.$transaction(async (tx) => { for (const c of changes) await deleteProduct(c.p.id, actor, tx); }, { timeout: 60_000 });
    return { affected: changes.length, skipped, preview, auditBatchId: null };
  }
  const auditBatchId = randomUUID();
  await prisma.$transaction(async (tx) => {
    for (const c of changes) await apply(tx, c.p, c.after, op.op);
    for (const c of changes) {
      await audit({ actorId: actor.id, actorEmail: actor.email, action: `product.bulk.${op.op}`, resourceType: 'Product', resourceId: c.p.id, resourceLabel: c.p.translations[0]?.name ?? c.p.sku, before: { ...c.before, auditBatchId } as never, after: { ...c.after, auditBatchId } as never }, tx);
    }
  }, { timeout: 60_000 });
  return { affected: changes.length, skipped, preview, auditBatchId };
}

async function apply(tx: Prisma.TransactionClient, p: { id: string; draftDocument: Prisma.JsonValue | null; variants: Array<{ id: string }> }, after: Record<string, unknown>, op: BulkOperation['op'] | 'revert') {
  if (after.prices) {
    const prices = after.prices as Record<string, number>;
    for (const [id, price] of Object.entries(prices)) await tx.productVariant.update({ where: { id }, data: { priceMinor: price } });
    const all = await tx.productVariant.findMany({ where: { productId: p.id, deletedAt: null, isActive: true }, select: { priceMinor: true } });
    const ps = all.map((v) => v.priceMinor);
    const draft = p.draftDocument as unknown as ProductDoc | null;
    // An open draft follows, or a later publish would put the old prices back.
    if (draft) draft.variants = draft.variants.map((v) => (v.id && prices[v.id] !== undefined ? { ...v, priceMinor: prices[v.id]! } : v));
    await tx.product.update({ where: { id: p.id }, data: { priceMinMinor: ps.length ? Math.min(...ps) : 0, priceMaxMinor: ps.length ? Math.max(...ps) : 0, ...(draft ? { draftDocument: draft as unknown as Prisma.InputJsonValue } : {}) } });
  }
  if (after.addCategory) await tx.productCategory.create({ data: { productId: p.id, categoryId: after.addCategory as string, sortOrder: 99 } });
  if (after.removeCategory) await tx.productCategory.delete({ where: { productId_categoryId: { productId: p.id, categoryId: after.removeCategory as string } } });
  if (after.categoryIds) {
    const ids = after.categoryIds as string[];
    await tx.productCategory.deleteMany({ where: { productId: p.id } });
    await tx.productCategory.createMany({ data: ids.map((categoryId, sortOrder) => ({ productId: p.id, categoryId, sortOrder })) });
    // An open draft follows, or a later publish would put the old categories back.
    const draft = p.draftDocument as unknown as ProductDoc | null;
    if (draft) await tx.product.update({ where: { id: p.id }, data: { draftDocument: { ...draft, categoryIds: ids } as unknown as Prisma.InputJsonValue } });
  }
  if (after.status) await tx.product.update({ where: { id: p.id }, data: { status: after.status as 'ACTIVE' } });
  if (after.isHandmade !== undefined) await tx.product.update({ where: { id: p.id }, data: { isHandmade: after.isHandmade as boolean } });
  void op;
}

/** One click reverts the batch from the audit `before` payloads; rows changed since are skipped. */
export async function revertBulk(auditBatchId: string, actor: Actor) {
  const rows = await prisma.auditLog.findMany({ where: { action: { startsWith: 'product.bulk.' }, after: { path: ['auditBatchId'], equals: auditBatchId } } });
  if (!rows.length) throw new AppError(404, 'NOT_FOUND');
  if (await prisma.auditLog.count({ where: { action: 'product.bulk.revert', after: { path: ['revertedBatchId'], equals: auditBatchId } } })) throw new AppError(409, 'VALIDATION_FAILED', 'ALREADY_REVERTED');
  const skipped: string[] = [];
  await prisma.$transaction(async (tx) => {
    for (const r of rows) {
      const p = await tx.product.findUnique({ where: { id: r.resourceId! }, include: { variants: { where: { deletedAt: null } } } });
      if (!p) { skipped.push(r.resourceLabel ?? ''); continue; }
      const before = r.before as Record<string, unknown>, after = r.after as Record<string, unknown>;
      if (after.prices) {
        const now = Object.fromEntries(p.variants.map((v) => [v.id, v.priceMinor]));
        if (Object.entries(after.prices as Record<string, number>).some(([id, x]) => now[id] !== x)) { skipped.push(r.resourceLabel ?? p.sku); continue; }
      }
      await apply(tx, p, { ...(before.prices ? { prices: before.prices } : {}), ...(before.categoryIds ? { categoryIds: before.categoryIds } : {}), ...(before.status ? { status: before.status } : {}), ...(before.isHandmade !== undefined ? { isHandmade: before.isHandmade } : {}) }, 'revert');
    }
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.bulk.revert', resourceType: 'Product', resourceLabel: `batch ${auditBatchId.slice(0, 8)}`, after: { revertedBatchId: auditBatchId, skipped } }, tx);
  }, { timeout: 60_000 });
  return { reverted: rows.length - skipped.length, skipped };
}
