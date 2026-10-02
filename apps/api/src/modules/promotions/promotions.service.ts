import type { Prisma } from '@prisma/client';
import type { CartResponse, PromoResult } from '@vivcharyk/schemas';
import { prisma } from '../../lib/prisma';

/**
 * Promo codes (18 §18.9, round 9 part 3 #9: seasonal, for holidays; round 10 part 9 #17: per
 * product and promo codes). Percentage or fixed amount off the goods, optionally only on chosen
 * products or categories (round 19 D3). Codes are case- and space-insensitive. Every refusal names its
 * reason. A code never stacks with the volume discount: the checkout applies the larger (§18.10a).
 */
async function withDescendants(ids: string[], db: Prisma.TransactionClient) {
  const all = await db.category.findMany({ where: { deletedAt: null }, select: { id: true, parentId: true } });
  const out = new Set(ids);
  for (let grew = true; grew;) { grew = false; for (const c of all) if (c.parentId && out.has(c.parentId) && !out.has(c.id)) { out.add(c.id); grew = true; } }
  return out;
}

export const normalizeCode = (c: string) => c.replace(/\s+/g, '').toUpperCase();

export async function evaluatePromo(rawCode: string, cart: CartResponse, phone?: string, db: Prisma.TransactionClient = prisma): Promise<PromoResult> {
  const code = normalizeCode(rawCode);
  const fail = (reason: PromoResult['reason'], extra: Partial<PromoResult> = {}): PromoResult => ({ code, ok: false, amountMinor: 0, reason, label: '', ...extra });
  const p = await db.promotion.findUnique({ where: { code } });
  if (!p || (p.type !== 'PERCENTAGE' && p.type !== 'FIXED')) return fail('NOT_FOUND');
  const now = new Date();
  if (!p.isActive) return fail('INACTIVE');
  if (p.startsAt && p.startsAt > now) return fail('NOT_STARTED', { startsAt: p.startsAt.toISOString() });
  if (p.endsAt && p.endsAt <= now) return fail('EXPIRED');
  if (p.usageLimit !== null && p.usageCount >= p.usageLimit) return fail('EXHAUSTED');

  const lines = cart.items.filter((l) => l.available);
  let eligible = lines;
  if (p.appliesToProductIds.length || p.appliesToCategoryIds.length) {
    // Round 19 D3: limited to chosen products or categories (a category includes its subcategories).
    const variants = await db.productVariant.findMany({ where: { id: { in: lines.map((l) => l.variantId) } }, select: { id: true, productId: true, product: { select: { categories: { select: { categoryId: true } } } } } });
    const cats = p.appliesToCategoryIds.length ? await withDescendants(p.appliesToCategoryIds, db) : new Set<string>();
    const ok = new Set(variants.filter((v) => p.appliesToProductIds.includes(v.productId) || v.product.categories.some((c) => cats.has(c.categoryId))).map((v) => v.id));
    eligible = lines.filter((l) => ok.has(l.variantId));
    if (!eligible.length) return fail('NOT_APPLICABLE');
  }
  if (p.minSubtotalMinor && cart.subtotalMinor < p.minSubtotalMinor) return fail('MIN_SUBTOTAL', { minSubtotalMinor: p.minSubtotalMinor });
  if (phone && p.perCustomerLimit) {
    const used = await db.order.count({ where: { couponCode: code, phone, status: { not: 'CANCELLED' } } });
    if (used >= p.perCustomerLimit) return fail('ALREADY_USED');
  }
  const base = eligible.reduce((a, l) => a + l.totalMinor, 0);
  const amountMinor = p.type === 'PERCENTAGE' ? Math.round((base * (p.percentage ?? 0)) / 100) : Math.min(base, p.valueMinor ?? 0);
  const label = p.type === 'PERCENTAGE' ? `Знижка ${p.percentage}%` : `Знижка ${(p.valueMinor ?? 0) / 100} ₴`;
  return { code, ok: amountMinor > 0, amountMinor, label, promotionId: p.id, ...(amountMinor > 0 ? {} : { reason: 'NOT_APPLICABLE' as const }) };
}
