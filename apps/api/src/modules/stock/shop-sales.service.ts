import { enqueue } from '../../lib/jobs';
import type { Prisma } from '@prisma/client';
import type { ProductDoc } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';

/** One line of a till sale as stored in ShopSale.items. */
export interface SaleItem {
  variantId: string; productId: string; sku: string; name: string; options: string;
  quantity: number; priceMinor: number;
  /** The product status before this sale archived it (a one-of-one piece), so undo can restore it. */
  archivedFrom?: 'ACTIVE' | 'DRAFT';
}

/** Kyiv calendar boundaries (the shop day and the dashboard month are Kyiv days, not UTC ones). */
export async function kyivBounds() {
  const [r] = await prisma.$queryRaw<Array<{ today: Date; month: Date; prevMonth: Date; prevNow: Date }>>`
    SELECT date_trunc('day', now() AT TIME ZONE 'Europe/Kyiv') AT TIME ZONE 'Europe/Kyiv' AS today,
           date_trunc('month', now() AT TIME ZONE 'Europe/Kyiv') AT TIME ZONE 'Europe/Kyiv' AS month,
           date_trunc('month', (now() AT TIME ZONE 'Europe/Kyiv') - interval '1 month') AT TIME ZONE 'Europe/Kyiv' AS "prevMonth",
           ((now() AT TIME ZONE 'Europe/Kyiv') - interval '1 month') AT TIME ZONE 'Europe/Kyiv' AS "prevNow"`;
  return r!;
}

export const thumbOf = (m: { publicId: string; provider: string } | undefined | null) =>
  m?.provider === 'local' ? `/media/${m.publicId.slice('local:'.length)}-480.webp` : null;

/** «200×300 · сірий»: option labels in option-type order. */
export const optionLabel = (opts: Array<{ optionValue: { optionType: { position: number }; translations: Array<{ label: string }> } }>) =>
  [...opts].sort((a, b) => a.optionValue.optionType.position - b.optionValue.optionType.position)
    .map((o) => o.optionValue.translations[0]?.label).filter(Boolean).join(' · ');

const OPTIONS_SELECT = { select: { optionValue: { select: { optionType: { select: { position: true } }, translations: { where: { locale: 'uk' as const }, select: { label: true } } } } } };

/** Stock moved on a product: keeps `inStock`, and an open draft, in step with the live variant. */
async function syncProduct(tx: Prisma.TransactionClient, productId: string, variantId: string, stockQty: number, status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED') {
  const p = await tx.product.findUniqueOrThrow({ where: { id: productId }, include: { variants: { where: { isActive: true, deletedAt: null } } } });
  const data: Prisma.ProductUpdateInput = { inStock: p.variants.some((x) => x.stockQty > 0 || !!x.madeToOrderDays) || p.allowsCustomSize };
  if (status) data.status = status;
  // An open draft carries stock too; without this a later publish would restore the sold piece.
  if (p.draftDocument) {
    const d = p.draftDocument as unknown as ProductDoc;
    d.variants = d.variants.map((x) => (x.id === variantId ? { ...x, stockQty } : x));
    data.draftDocument = d as unknown as Prisma.InputJsonValue;
  }
  await tx.product.update({ where: { id: productId }, data });
}

export interface SaleInput {
  lines: Array<{ variantId: string; quantity: number }>;
  discount?: { kind: 'sum' | 'percent'; value: number };
  payment: 'CASH' | 'CARD_TRANSFER';
  cashGivenMinor?: number;
  receiptRef?: string;
  note?: string;
}

/**
 * Round 20 #133–137, #217–219: one till sale with several lines, in one transaction. Prices come
 * from the database, never from the phone. Each line writes a SHOP_SALE movement tied to the sale;
 * a one-of-one piece archives when it sells (37 §37.6).
 */
export async function createSale(b: SaleInput, actor: { id: string; email: string }) {
  const qty = new Map<string, number>();
  for (const l of b.lines) qty.set(l.variantId, (qty.get(l.variantId) ?? 0) + l.quantity);

  return prisma.$transaction(async (tx) => {
    const vs = await tx.productVariant.findMany({
      where: { id: { in: [...qty.keys()] }, isActive: true, deletedAt: null, product: { deletedAt: null } },
      select: { id: true, sku: true, priceMinor: true, productId: true, options: OPTIONS_SELECT, product: { select: { sku: true, status: true, isUniquePiece: true, translations: { where: { locale: 'uk' }, select: { name: true } } } } },
    });
    if (vs.length !== qty.size) throw new AppError(404, 'NOT_FOUND');

    const items: SaleItem[] = vs.map((v) => ({ variantId: v.id, productId: v.productId, sku: v.sku, name: v.product.translations[0]?.name ?? v.product.sku, options: optionLabel(v.options), quantity: qty.get(v.id)!, priceMinor: v.priceMinor }));
    const subtotal = items.reduce((s, i) => s + i.priceMinor * i.quantity, 0);
    const discount = !b.discount ? 0 : Math.min(subtotal, Math.round(b.discount.kind === 'percent' ? (subtotal * b.discount.value) / 100 : b.discount.value));
    const total = subtotal - discount;
    if (b.payment === 'CASH' && b.cashGivenMinor !== undefined && b.cashGivenMinor < total) throw new AppError(422, 'VALIDATION_FAILED', 'CASH_TOO_LOW');

    const sale = await tx.shopSale.create({
      data: { items: [], subtotalMinor: subtotal, discountMinor: discount, totalMinor: total, payment: b.payment, cashGivenMinor: b.payment === 'CASH' ? (b.cashGivenMinor ?? null) : null, receiptRef: b.receiptRef || null, note: b.note || null, createdById: actor.id },
    });

    for (const item of items) {
      const n = await tx.$executeRaw`UPDATE "ProductVariant" SET "stockQty" = "stockQty" - ${item.quantity} WHERE id = ${item.variantId} AND "stockQty" >= ${item.quantity}`;
      if (n !== 1) throw new AppError(409, 'VALIDATION_FAILED', 'NOT_ENOUGH_STOCK', { sku: item.sku, name: item.name });
      const { stockQty } = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId }, select: { stockQty: true } });
      const v = vs.find((x) => x.id === item.variantId)!;
      const archive = v.product.isUniquePiece && stockQty === 0 && v.product.status !== 'ARCHIVED';
      if (archive) item.archivedFrom = v.product.status as 'ACTIVE' | 'DRAFT';
      await tx.stockMovement.create({ data: { variantId: item.variantId, shopSaleId: sale.id, delta: -item.quantity, source: 'SHOP_SALE', reason: 'Продаж у магазині', createdById: actor.id } });
      await syncProduct(tx, item.productId, item.variantId, stockQty, archive ? 'ARCHIVED' : undefined);
    }

    await tx.shopSale.update({ where: { id: sale.id }, data: { items: items as unknown as Prisma.InputJsonValue } });
    await enqueue('notify.telegram', { kind: 'shop_sale', saleId: sale.id }, tx); // T22: to the owner
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'stock.shop_sale', resourceType: 'ShopSale', resourceId: sale.id, resourceLabel: items.map((i) => `${i.name} × ${i.quantity}`).join(', ').slice(0, 200), after: { totalMinor: total, payment: b.payment, items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })), archived: items.filter((i) => i.archivedFrom).map((i) => i.sku) } }, tx);
    return { id: sale.id, totalMinor: total, changeMinor: b.payment === 'CASH' && b.cashGivenMinor !== undefined ? b.cashGivenMinor - total : null, archived: items.filter((i) => i.archivedFrom).map((i) => i.name) };
  });
}

/** #219: undo a sale the same Kyiv day; stock returns, an archived one-of-one piece comes back. */
export async function cancelSale(id: string, actor: { id: string; email: string }) {
  const { today } = await kyivBounds();
  return prisma.$transaction(async (tx) => {
    const sale = await tx.shopSale.findUnique({ where: { id } });
    if (!sale) throw new AppError(404, 'NOT_FOUND');
    if (sale.createdAt < today) throw new AppError(409, 'VALIDATION_FAILED', 'NOT_TODAY');
    const n = await tx.shopSale.updateMany({ where: { id, cancelledAt: null }, data: { cancelledAt: new Date(), cancelledById: actor.id } });
    if (n.count !== 1) throw new AppError(409, 'VALIDATION_FAILED', 'ALREADY_CANCELLED');

    for (const item of sale.items as unknown as SaleItem[]) {
      const v = await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQty: { increment: item.quantity } }, select: { stockQty: true } });
      await tx.stockMovement.create({ data: { variantId: item.variantId, shopSaleId: sale.id, delta: item.quantity, source: 'CANCELLATION', reason: 'Скасовано продаж у магазині', createdById: actor.id } });
      const p = item.archivedFrom ? await tx.product.findUnique({ where: { id: item.productId }, select: { status: true } }) : null;
      await syncProduct(tx, item.productId, item.variantId, v.stockQty, p?.status === 'ARCHIVED' ? item.archivedFrom : undefined);
    }
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'stock.shop_sale_cancelled', resourceType: 'ShopSale', resourceId: sale.id, before: { totalMinor: sale.totalMinor, payment: sale.payment }, after: { cancelled: true } }, tx);
  });
}
