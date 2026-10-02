import type { Locale, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export function findCartByToken(token: string) {
  return prisma.cart.findUnique({ where: { token } });
}

export function createCart(data: Prisma.CartCreateInput) {
  return prisma.cart.create({ data });
}

export function touchCart(id: string, expiresAt: Date) {
  return prisma.cart.update({ where: { id }, data: { expiresAt } });
}

/** Everything a cart line needs to price and render itself. */
export function loadCartLines(cartId: string, locale: Locale) {
  const locales: Locale[] = locale === 'uk' ? ['uk'] : [locale, 'uk'];
  return prisma.cartItem.findMany({
    where: { cartId },
    orderBy: { addedAt: 'asc' },
    select: {
      id: true,
      variantId: true,
      quantityMilli: true,
      customSpec: true,
      specKey: true,
    },
  }).then(async (items) => {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map((i) => i.variantId) } },
      select: {
        id: true, sku: true, priceMinor: true, stockQty: true, isActive: true, deletedAt: true, madeToOrderDays: true,
        options: { select: { optionValue: { select: { key: true, hex: true, optionType: { select: { key: true } }, translations: { where: { locale: { in: locales } }, select: { locale: true, label: true } } } } } },
        product: {
          select: {
            id: true, status: true, deletedAt: true, publishedAt: true, origin: true, pricingUnit: true, allowsCustomSize: true, madeToOrderDays: true, currency: true,
            customSizeRatePerSqmMinor: true, customSizeMinPriceMinor: true, customSizeMinWidthCm: true, customSizeMaxWidthCm: true, customSizeMinLengthCm: true, customSizeMaxLengthCm: true,
            translations: { where: { locale: { in: locales } }, select: { locale: true, name: true, slug: true } },
          },
        },
      },
    });
    const byId = new Map(variants.map((v) => [v.id, v]));
    return items.map((i) => ({ ...i, variant: byId.get(i.variantId) }));
  });
}

/** Quantity held by other carts' live reservations (26 §26.10.4 reserve). */
export async function reservedElsewhere(variantIds: string[], cartId: string) {
  const rows = await prisma.stockReservation.groupBy({
    by: ['variantId'],
    where: { variantId: { in: variantIds }, cartId: { not: cartId }, expiresAt: { gt: new Date() } },
    _sum: { quantityMilli: true },
  });
  return new Map(rows.map((r) => [r.variantId, r._sum.quantityMilli ?? 0]));
}

export function findVariantForCart(variantId: string) {
  return prisma.productVariant.findFirst({
    where: { id: variantId, isActive: true, deletedAt: null, product: { status: 'ACTIVE', deletedAt: null, publishedAt: { not: null } } },
    select: {
      id: true, stockQty: true, madeToOrderDays: true,
      product: {
        select: {
          pricingUnit: true, allowsCustomSize: true, madeToOrderDays: true, currency: true,
          customSizeRatePerSqmMinor: true, customSizeMinPriceMinor: true, customSizeMinWidthCm: true, customSizeMaxWidthCm: true, customSizeMinLengthCm: true, customSizeMaxLengthCm: true,
        },
      },
    },
  });
}

export function upsertItem(cartId: string, variantId: string, specKey: string, quantityMilli: number, customSpec: Prisma.InputJsonValue | null) {
  return prisma.cartItem.upsert({
    where: { cartId_variantId_specKey: { cartId, variantId, specKey } },
    create: { cartId, variantId, specKey, quantityMilli, ...(customSpec ? { customSpec } : {}) },
    update: { quantityMilli },
  });
}

export function updateItemQuantity(cartId: string, itemId: string, quantityMilli: number) {
  return prisma.cartItem.updateMany({ where: { id: itemId, cartId }, data: { quantityMilli } });
}

export function deleteItem(cartId: string, itemId: string) {
  return prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
}
