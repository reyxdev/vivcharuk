import { z } from 'zod';
import { currency, locale, pageInfo, pricingUnit } from './primitives';

export const productOrigin = z.enum(['OWN_MANUFACTURE', 'PARTNER_MANUFACTURE']);
export type ProductOrigin = z.infer<typeof productOrigin>;

export const categoryNode: z.ZodType<CategoryNode> = z.lazy(() =>
  z.object({ id: z.string(), key: z.string().nullable().optional(), slug: z.string(), name: z.string(), isFeatured: z.boolean().optional(), productCount: z.number().int().optional(), children: z.array(categoryNode) }),
);
// key: stable, locale-independent (the homepage circle art is picked by it).
// isFeatured: «★ на головній» — the homepage category circles (round 10 part 2 #8).
// productCount: public products in the category and its descendants (round 24 G004–G005: an empty category
// is noindex, out of the sitemap and hidden from the menu).
export interface CategoryNode { id: string; key?: string | null; slug: string; name: string; isFeatured?: boolean; productCount?: number; children: CategoryNode[] }

export const mediaRef = z.object({
  publicId: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  blurhash: z.string().nullable(),
  alt: z.string(),
});

export const badge = z.enum(['NEW', 'SALE', 'HIT']);

export const productListItem = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  priceMinMinor: z.number().int(),
  priceMaxMinor: z.number().int(),
  currency,
  pricingUnit,
  inStock: z.boolean(),
  isHandmade: z.boolean(),
  isUniquePiece: z.boolean(),
  origin: productOrigin,
  partnerRegion: z.string().nullable(),
  media: mediaRef.nullable(),
  badges: z.array(badge),
});
export type ProductListItem = z.infer<typeof productListItem>;

export const facetValue = z.object({ key: z.string(), label: z.string(), count: z.number().int(), selected: z.boolean(), hex: z.string().nullable().optional() });
export const facet = z.object({ key: z.string(), label: z.string(), values: z.array(facetValue) });

export const productListResponse = z.object({
  // Present on category listings: the text shown under the products and the SEO overrides (round 10 part 3 #12).
  category: z.object({ name: z.string(), description: z.string().nullable(), metaTitle: z.string().nullable(), metaDescription: z.string().nullable() }).optional(),
  items: z.array(productListItem),
  page: pageInfo,
  facets: z.array(facet),
  appliedFilters: z.array(z.object({ key: z.string(), value: z.string(), label: z.string() })),
  priceRange: z.object({ minMinor: z.number().int(), maxMinor: z.number().int() }).nullable(),
});
export type ProductListResponse = z.infer<typeof productListResponse>;

export const productSort = z.enum(['popularity', 'newest', 'price_asc', 'price_desc', 'discount', 'name_asc', 'relevance']);

export const productListQuery = z.object({
  locale: locale.default('uk'),
  category: z.string().max(120).optional(),
  collection: z.string().max(120).optional(), // collection slug (round 10 part 7 #22: a collection page is a category page)
  // Site search (26 §26.10.2): the results page is a category page with a query (round 10 part 3 #23).
  q: z.string().trim().min(2).max(80).optional(),
  // Wishlist page (round 9 part 3 #25): the visitor's saved slugs, re-read so prices are current.
  slugs: z.string().max(3000).optional().transform((v) => (v ? v.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 60) : undefined)),
  origin: productOrigin.optional(),
  inStock: z.coerce.boolean().optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  sort: productSort.default('popularity'),
  page: z.coerce.number().int().min(1).max(50).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
});
export type ProductListQuery = z.infer<typeof productListQuery>;

export const variantOut = z.object({
  id: z.string(),
  sku: z.string(),
  priceMinor: z.number().int(),
  compareAtMinor: z.number().int().nullable(),
  inStock: z.boolean(),
  stockHint: z.enum(['IN_STOCK', 'FEW_LEFT', 'MADE_TO_ORDER', 'OUT_OF_STOCK']),
  madeToOrderDays: z.number().int().nullable(),
  options: z.record(z.string(), z.object({ key: z.string(), label: z.string(), hex: z.string().nullable() })),
});

export const customSizeConfig = z.object({
  ratePerSqmMinor: z.number().int(),
  minPriceMinor: z.number().int(),
  minWidthCm: z.number().int(),
  maxWidthCm: z.number().int(),
  minLengthCm: z.number().int(),
  maxLengthCm: z.number().int(),
  leadTimeDays: z.number().int(),
  currency,
});
export type CustomSizeConfig = z.infer<typeof customSizeConfig>;

export const productDetail = productListItem.extend({
  sku: z.string(),
  description: z.string(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  categories: z.array(z.object({ slug: z.string(), name: z.string() })),
  variants: z.array(variantOut),
  gallery: z.array(mediaRef),
  attributes: z.array(z.object({ key: z.string(), label: z.string(), value: z.string() })),
  composition: z.array(z.object({ material: z.string(), role: z.string(), percent: z.number().int() })),
  customSize: customSizeConfig.optional(),
  // Present only for OWN_MANUFACTURE (26 §26.10.1): the key is absent for partner goods.
  provenance: z.object({ woolOrigin: z.string().nullable(), productionStage: z.array(z.string()) }).optional(),
  schemaBrand: z.literal('Вівчарик'),
  schemaManufacturer: z.literal('Вівчарик').optional(),
  translationFallback: z.array(z.string()),
});
export type ProductDetail = z.infer<typeof productDetail>;
