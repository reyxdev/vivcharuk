import { z } from 'zod';

export const locale = z.enum(['uk', 'en', 'pl', 'de']);
export type Locale = z.infer<typeof locale>;
export const DEFAULT_LOCALE: Locale = 'uk';

export const currency = z.enum(['UAH', 'EUR', 'PLN', 'USD']);
export type Currency = z.infer<typeof currency>;

export const pricingUnit = z.enum(['PIECE', 'KILOGRAM', 'SKEIN', 'METRE']);
export type PricingUnit = z.infer<typeof pricingUnit>;

// Integer minor units (kopecks). Never a float on the wire (26 §26.1).
export const moneyMinor = z.number().int();

export const id = z.string().min(1).max(40);

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).max(50).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(24),
});

export const pageInfo = z.object({
  number: z.number().int(),
  perPage: z.number().int(),
  total: z.number().int().nullable(),
  totalPages: z.number().int().nullable(),
  hasMore: z.boolean(),
});
