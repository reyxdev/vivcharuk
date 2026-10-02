import type { Locale } from '@prisma/client';
import {
  type AddCartItemInput,
  type CartLine,
  type CartResponse,
  type CustomSizeConfig,
  CustomSizeOutOfRange,
  DEFAULT_VOLUME_TIERS,
  lineTotal,
  priceCustomSize,
  type VolumeGroup,
  type VolumeTier,
  volumeDiscount,
} from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { randomToken } from '../../lib/crypto';
import { getSetting } from '../../lib/settings';
import * as repo from './cart.repository';

export const CART_TTL_DAYS = 30; // {{CART_TTL_DAYS}} — proposed default until the client sets it
const ttl = () => new Date(Date.now() + CART_TTL_DAYS * 86_400_000);

type Tr<T> = T & { locale: Locale };
const pick = <T,>(rows: Tr<T>[], locale: Locale) => rows.find((r) => r.locale === locale) ?? rows.find((r) => r.locale === 'uk');

type ProductCfg = {
  allowsCustomSize: boolean; madeToOrderDays: number | null; currency: 'UAH' | 'EUR' | 'PLN' | 'USD';
  customSizeRatePerSqmMinor: number | null; customSizeMinPriceMinor: number | null;
  customSizeMinWidthCm: number | null; customSizeMaxWidthCm: number | null; customSizeMinLengthCm: number | null; customSizeMaxLengthCm: number | null;
};
export function customConfig(p: ProductCfg): CustomSizeConfig | null {
  if (!p.allowsCustomSize || p.customSizeRatePerSqmMinor === null || p.customSizeMinPriceMinor === null || p.customSizeMinWidthCm === null ||
      p.customSizeMaxWidthCm === null || p.customSizeMinLengthCm === null || p.customSizeMaxLengthCm === null) return null;
  return {
    ratePerSqmMinor: p.customSizeRatePerSqmMinor, minPriceMinor: p.customSizeMinPriceMinor,
    minWidthCm: p.customSizeMinWidthCm, maxWidthCm: p.customSizeMaxWidthCm, minLengthCm: p.customSizeMinLengthCm, maxLengthCm: p.customSizeMaxLengthCm,
    leadTimeDays: p.madeToOrderDays ?? 14, currency: p.currency,
  };
}

export async function getOrCreateCart(token: string | undefined, locale: Locale) {
  const existing = token ? await repo.findCartByToken(token) : null;
  if (existing && existing.expiresAt > new Date()) return existing;
  return repo.createCart({ token: randomToken(24), locale, expiresAt: ttl() });
}

/** The complete cart, priced server-side. Every mutation returns this (26 §26.10.3). */
export async function viewCart(cartId: string, locale: Locale): Promise<CartResponse> {
  const rows = await repo.loadCartLines(cartId, locale);
  const reserved = await repo.reservedElsewhere(rows.map((r) => r.variantId), cartId);
  const items: CartLine[] = [];
  let subtotal = 0, hasCustom = false, itemCount = 0;
  const groups = new Map<string, VolumeGroup>();

  for (const r of rows) {
    const v = r.variant;
    const p = v?.product;
    const live = !!v && !!p && v.isActive && !v.deletedAt && p.status === 'ACTIVE' && !p.deletedAt && !!p.publishedAt;
    const custom = r.customSpec as { widthCm: number; lengthCm: number } | null;
    let unit = v?.priceMinor ?? 0;
    let available = live;
    if (live && custom) {
      const cfg = customConfig(p!);
      try { unit = cfg ? priceCustomSize(cfg, custom) : 0; } catch { available = false; }
      if (!cfg) available = false;
    }
    const madeToOrder = custom ? (p?.madeToOrderDays ?? 14) : (v?.madeToOrderDays ?? null);
    const maxAvailableMilli = !live ? 0 : custom || (madeToOrder && v!.stockQty <= 0) ? 99_000 : Math.max(0, v!.stockQty * 1000 - (reserved.get(r.variantId) ?? 0));
    if (live && r.quantityMilli > maxAvailableMilli) available = false; // sold-out lines are greyed and excluded (round 10)

    const t = p ? pick(p.translations, locale) : undefined;
    const options: CartLine['options'] = {};
    for (const o of v?.options ?? []) options[o.optionValue.optionType.key] = { label: pick(o.optionValue.translations, locale)?.label ?? o.optionValue.key, hex: o.optionValue.hex };
    const total = lineTotal(unit, r.quantityMilli);

    items.push({
      id: r.id, variantId: r.variantId, productSlug: t?.slug ?? '', sku: v?.sku ?? '', name: t?.name ?? '',
      options, imageUrl: null, origin: p?.origin ?? 'OWN_MANUFACTURE', pricingUnit: p?.pricingUnit ?? 'PIECE',
      unitPriceMinor: unit, quantityMilli: r.quantityMilli, totalMinor: total, available, maxAvailableMilli,
      customSpec: custom, madeToOrderDays: madeToOrder,
    });
    if (!available) continue;
    subtotal += total;
    if (custom) hasCustom = true;
    itemCount += p?.pricingUnit === 'PIECE' ? r.quantityMilli / 1000 : 1;
    // 18 §18.10a, round 18: pieces of the same product only; by-weight and custom-size lines neither count nor get the discount.
    if (p?.pricingUnit === 'PIECE' && !custom) {
      const g = groups.get(p.id) ?? { name: t?.name ?? '', pieces: 0, subtotalMinor: 0 };
      g.pieces += r.quantityMilli / 1000; g.subtotalMinor += total; groups.set(p.id, g);
    }
  }

  const tiers = await getSetting<VolumeTier[]>('pricing.volume_tiers', DEFAULT_VOLUME_TIERS);
  const vd = volumeDiscount([...groups.values()], tiers);
  // The nudge shows only when a product is three pieces or fewer from its next tier (18 §18.10a).
  const nextVolumeTier = vd.next && vd.next.remaining <= 3 ? vd.next : null;
  return {
    id: cartId, currency: 'UAH', items, itemCount, subtotalMinor: subtotal,
    discount: vd.amountMinor > 0 ? { source: 'VOLUME', percent: vd.percent, amountMinor: vd.amountMinor } : null,
    nextVolumeTier, totalMinor: subtotal - vd.amountMinor, hasCustomSize: hasCustom,
  };
}

export async function addItem(cartId: string, input: AddCartItemInput) {
  const v = await repo.findVariantForCart(input.variantId);
  if (!v) throw new AppError(404, 'PRODUCT_NOT_FOUND');
  if (input.customSpec) {
    const cfg = customConfig(v.product);
    if (!cfg) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'customSpec', code: 'CUSTOM_SIZE_NOT_OFFERED' }]);
    try { priceCustomSize(cfg, input.customSpec); } catch (e) {
      if (e instanceof CustomSizeOutOfRange) throw new AppError(422, 'VALIDATION_FAILED', undefined, { axis: e.axis, min: e.min, max: e.max }, [{ path: `customSpec.${e.axis === 'width' ? 'widthCm' : 'lengthCm'}`, code: 'CUSTOM_SIZE_OUT_OF_RANGE', params: { min: e.min, max: e.max } }]);
      throw e;
    }
    // A custom piece is one made-to-measure item; a second one with the same size just replaces it.
    await repo.upsertItem(cartId, v.id, `${input.customSpec.widthCm}x${input.customSpec.lengthCm}`, 1000, input.customSpec);
    return;
  }
  const qty = v.product.pricingUnit === 'PIECE' ? Math.max(1000, Math.round(input.quantityMilli / 1000) * 1000) : input.quantityMilli;
  const canBackorder = !!v.madeToOrderDays;
  if (!canBackorder && v.stockQty * 1000 < qty) {
    throw new AppError(409, 'VALIDATION_FAILED', undefined, { available: v.stockQty * 1000 }, [{ path: 'quantityMilli', code: 'MAX', params: { max: v.stockQty * 1000 } }]);
  }
  await repo.upsertItem(cartId, v.id, '', qty, null);
}

export async function setQuantity(cartId: string, itemId: string, quantityMilli: number) {
  if (quantityMilli <= 0) throw new AppError(422, 'VALIDATION_FAILED');
  await repo.updateItemQuantity(cartId, itemId, quantityMilli);
}

export const removeItem = (cartId: string, itemId: string) => repo.deleteItem(cartId, itemId);
export const touch = (cartId: string) => repo.touchCart(cartId, ttl());
