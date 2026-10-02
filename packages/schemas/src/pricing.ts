import type { CustomSizeConfig } from './catalog';

// Pure pricing rules shared verbatim by the storefront and the API, so the number a buyer sees and
// the number charged come from one code path (26 §26.10.1a, 18 §18.10a, round 8 §L14).

export interface CustomSpec { widthCm: number; lengthCm: number }

export class CustomSizeOutOfRange extends Error {
  constructor(readonly axis: 'width' | 'length', readonly min: number, readonly max: number) { super('CUSTOM_SIZE_OUT_OF_RANGE'); }
}

const toWholeHryvnia = (minor: number) => Math.round(minor / 100) * 100;

/** H3c: area × rate, never below the floor, whole hryvnias. Out of bounds throws — never clamps. */
export function priceCustomSize(cfg: CustomSizeConfig, spec: CustomSpec): number {
  if (spec.widthCm < cfg.minWidthCm || spec.widthCm > cfg.maxWidthCm) throw new CustomSizeOutOfRange('width', cfg.minWidthCm, cfg.maxWidthCm);
  if (spec.lengthCm < cfg.minLengthCm || spec.lengthCm > cfg.maxLengthCm) throw new CustomSizeOutOfRange('length', cfg.minLengthCm, cfg.maxLengthCm);
  const areaSqm = (spec.widthCm * spec.lengthCm) / 10_000;
  return toWholeHryvnia(Math.max(Math.round(areaSqm * cfg.ratePerSqmMinor), cfg.minPriceMinor));
}

/** Line total: unit price × quantity in thousandths, rounded once at the line (26 §26.10.3). */
export const lineTotal = (unitPriceMinor: number, quantityMilli: number) => Math.round((unitPriceMinor * quantityMilli) / 1000);

export interface VolumeTier { minUnits: number; percent: number }
// Round 18 (client, 2026-10-02): from 10 pieces −10 %, from 20 pieces −20 %, counted per product.
export const DEFAULT_VOLUME_TIERS: VolumeTier[] = [{ minUnits: 10, percent: 10 }, { minUnits: 20, percent: 20 }];

/** Pieces and subtotal of one product in the cart (all its colours and sizes together). */
export interface VolumeGroup { name: string; pieces: number; subtotalMinor: number }

/**
 * Round 18: the tier is reached by each product on its own («рахувати на 1 товар»), its colours and
 * sizes counted together; by-weight and custom-size lines neither count nor get the discount
 * (18 §18.10a). `percent` is the one rate applied, or null when products sit on different tiers.
 * `next` is the product closest to its next tier.
 */
export function volumeDiscount(groups: VolumeGroup[], tiers: VolumeTier[] = DEFAULT_VOLUME_TIERS) {
  const sorted = [...tiers].sort((a, b) => a.minUnits - b.minUnits);
  let amountMinor = 0;
  const applied = new Set<number>();
  let next: { minUnits: number; percent: number; remaining: number; name: string } | null = null;
  for (const g of groups) {
    const tier = [...sorted].reverse().find((t) => g.pieces >= t.minUnits) ?? null;
    if (tier) { amountMinor += Math.round((g.subtotalMinor * tier.percent) / 100); applied.add(tier.percent); }
    const up = sorted.find((t) => g.pieces < t.minUnits);
    if (up && (!next || up.minUnits - g.pieces < next.remaining)) next = { ...up, remaining: up.minUnits - g.pieces, name: g.name };
  }
  return { amountMinor, percent: applied.size === 1 ? [...applied][0]! : null, next };
}

export const PREPAY_MIN_MINOR_DEFAULT = 46_000;
/** Round 18: cash on delivery (COD with inspection, partial prepayment) only for orders up to 10 000 ₴. */
export const COD_MAX_MINOR_DEFAULT = 1_000_000;

/** Round 8 §L14: min(max(round(subtotal × 10%), 460 ₴), order total). */
export function prepayment(subtotalMinor: number, orderTotalMinor: number, floorMinor = PREPAY_MIN_MINOR_DEFAULT) {
  return Math.min(Math.max(Math.round(subtotalMinor * 0.1), floorMinor), orderTotalMinor);
}
