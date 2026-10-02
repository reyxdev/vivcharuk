import { z } from 'zod';
import { currency, pricingUnit } from './primitives';
import { productOrigin } from './catalog';

export const customSpecInput = z.object({ widthCm: z.number().int().min(10).max(1000), lengthCm: z.number().int().min(10).max(1000) });

export const addCartItemInput = z.object({
  variantId: z.string().min(1).max(40),
  quantityMilli: z.number().int().min(1).max(99_000),
  customSpec: customSpecInput.optional(),
});
export type AddCartItemInput = z.infer<typeof addCartItemInput>;

export const cartLine = z.object({
  id: z.string(),
  variantId: z.string(),
  productSlug: z.string(),
  sku: z.string(),
  name: z.string(),
  options: z.record(z.string(), z.object({ label: z.string(), hex: z.string().nullable() })),
  imageUrl: z.string().nullable(),
  origin: productOrigin,
  pricingUnit,
  unitPriceMinor: z.number().int(),
  quantityMilli: z.number().int(),
  totalMinor: z.number().int(),
  available: z.boolean(),
  maxAvailableMilli: z.number().int(),
  customSpec: customSpecInput.nullable(),
  madeToOrderDays: z.number().int().nullable(),
});
export type CartLine = z.infer<typeof cartLine>;

export const cartResponse = z.object({
  id: z.string(),
  currency,
  items: z.array(cartLine),
  itemCount: z.number().int(),
  subtotalMinor: z.number().int(),
  discount: z.object({ source: z.enum(['VOLUME', 'PROMO_CODE']), percent: z.number().int().nullable(), amountMinor: z.number().int() }).nullable(),
  nextVolumeTier: z.object({ minUnits: z.number().int(), percent: z.number().int(), remaining: z.number().int(), name: z.string() }).nullable(),
  totalMinor: z.number().int(),
  hasCustomSize: z.boolean(),
});
export type CartResponse = z.infer<typeof cartResponse>;
