import { z } from 'zod';
import { pricingUnit } from '../primitives';

// The editor's document: what autosave stores in the draft revision and publish applies (37 §37.4–37.5).
export const variantDoc = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(3).max(60),
  optionValueIds: z.array(z.string()).max(4),
  priceMinor: z.number().int().min(0),
  compareAtMinor: z.number().int().min(0).nullable().default(null),
  stockQty: z.number().int().min(0).max(100_000),
  madeToOrderDays: z.number().int().min(1).max(120).nullable().default(null),
  weightGrams: z.number().int().min(0).nullable().default(null),
  packedWeightGrams: z.number().int().min(0).nullable().default(null),
  packedLengthCm: z.number().int().min(0).nullable().default(null),
  packedWidthCm: z.number().int().min(0).nullable().default(null),
  packedHeightCm: z.number().int().min(0).nullable().default(null),
  isMainColor: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type VariantDoc = z.infer<typeof variantDoc>;

export const productDoc = z.object({
  name: z.string().trim().max(160),
  description: z.string().max(20_000),
  metaTitle: z.string().max(160).nullable().default(null),
  metaDescription: z.string().max(320).nullable().default(null),
  searchSynonyms: z.array(z.string().trim().max(60)).max(20).default([]),
  categoryIds: z.array(z.string()).max(10),
  collectionIds: z.array(z.string()).max(10).default([]),
  origin: z.enum(['OWN_MANUFACTURE', 'PARTNER_MANUFACTURE']),
  partnerName: z.string().trim().max(120).nullable().default(null),
  partnerRegion: z.string().trim().max(80).nullable().default(null),
  pricingUnit,
  isHandmade: z.boolean().default(false),
  isUniquePiece: z.boolean().default(false),
  woolOrigin: z.string().max(120).nullable().default(null),
  storyStagesOff: z.array(z.string()).default([]),
  allowsCustomSize: z.boolean().default(false),
  customSize: z.object({
    ratePerSqmMinor: z.number().int().min(0).nullable(),
    minPriceMinor: z.number().int().min(0).nullable(),
    minWidthCm: z.number().int().min(1).nullable(),
    maxWidthCm: z.number().int().min(1).nullable(),
    minLengthCm: z.number().int().min(1).nullable(),
    maxLengthCm: z.number().int().min(1).nullable(),
    madeToOrderDays: z.number().int().min(1).max(120).nullable(),
  }).default({ ratePerSqmMinor: null, minPriceMinor: null, minWidthCm: null, maxWidthCm: null, minLengthCm: null, maxLengthCm: null, madeToOrderDays: 14 }),
  composition: z.array(z.object({ materialId: z.string(), role: z.string().max(20), percent: z.number().int().min(1).max(100) })).max(12).default([]),
  attributes: z.array(z.object({ definitionId: z.string(), value: z.string().max(200) })).max(40).default([]),
  variants: z.array(variantDoc).max(200),
});
export type ProductDoc = z.infer<typeof productDoc>;

export interface Readiness { done: number; total: number; missing: string[] }
