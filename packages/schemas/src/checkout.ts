import { z } from 'zod';

export const deliveryMethod = z.enum(['NP_BRANCH', 'NP_COURIER', 'UKRPOSHTA', 'PICKUP']);
export type DeliveryMethod = z.infer<typeof deliveryMethod>;

// «Partial prepayment» is not a fourth PaymentMethod: it is a card payment with a partial amount (18 §18.8).
export const checkoutPayment = z.enum(['CARD', 'COD_INSPECTION', 'PREPAYMENT', 'IBAN']);
export type CheckoutPayment = z.infer<typeof checkoutPayment>;

export const phoneUa = z
  .string()
  .transform((v) => v.replace(/[^\d+]/g, ''))
  .transform((v) => (v.startsWith('+') ? v : v.startsWith('380') ? `+${v}` : v.startsWith('0') ? `+38${v}` : v))
  .refine((v) => /^\+380\d{9}$/.test(v), { message: 'PHONE_INVALID' });

export const checkoutQuoteInput = z.object({
  delivery: deliveryMethod,
  cityRef: z.string().max(64).optional(),
  promoCode: z.string().trim().max(40).optional(),
});

// 18 §18.9: every refusal names its reason; «Недійсний промокод» alone generates a support call.
export const promoResult = z.object({
  code: z.string(),
  ok: z.boolean(),
  amountMinor: z.number().int(),
  label: z.string(),
  reason: z.enum(['NOT_FOUND', 'INACTIVE', 'NOT_STARTED', 'EXPIRED', 'EXHAUSTED', 'MIN_SUBTOTAL', 'NOT_APPLICABLE', 'ALREADY_USED', 'NOT_BETTER']).optional(),
  minSubtotalMinor: z.number().int().optional(),
  startsAt: z.string().optional(),
  promotionId: z.string().optional(),
});
export type PromoResult = z.infer<typeof promoResult>;

export const createOrderInput = z.object({
  contact: z.object({
    fullName: z.string().trim().min(3).max(120).refine((v) => v.split(/\s+/).length >= 2, { message: 'FULL_NAME_TWO_WORDS' }),
    patronymic: z.string().trim().max(60).optional(),
    phone: phoneUa,
    email: z.string().trim().email().max(254).optional().or(z.literal('').transform(() => undefined)),
  }),
  delivery: z.object({
    method: deliveryMethod,
    city: z.string().trim().max(120).optional(),
    cityRef: z.string().max(64).optional(),
    warehouseRef: z.string().max(64).optional(),
    warehouseLabel: z.string().max(240).optional(),
    address: z.string().trim().max(240).optional(),
    postalCode: z.string().trim().max(10).optional(),
  }),
  payment: checkoutPayment,
  company: z.object({ name: z.string().trim().min(2).max(200), edrpou: z.string().regex(/^\d{8,10}$/) }).optional(),
  promoCode: z.string().trim().max(40).optional(),
  termsAccepted: z.literal(true),
  // Round 19 D2: an unchecked-by-default box; only with an e-mail, and only after the confirmation link.
  marketingConsent: z.boolean().optional(),
  expectedTotalMinor: z.number().int().optional(),
  attribution: z.record(z.string(), z.string().max(200)).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderInput>;

export const paymentOption = z.object({
  key: checkoutPayment,
  amountNowMinor: z.number().int(),
  balanceOnDeliveryMinor: z.number().int(),
  depositMinor: z.number().int().optional(),
});

export const checkoutQuote = z.object({
  subtotalMinor: z.number().int(),
  discountMinor: z.number().int(),
  shippingMinor: z.number().int().nullable(),
  shippingIsTest: z.boolean(),
  totalMinor: z.number().int().nullable(),
  payments: z.array(paymentOption),
  hasCustomSize: z.boolean(),
  emailRequired: z.boolean(),
  // Round 18: set when the order is over the cash-on-delivery ceiling, so checkout says why COD is missing.
  codUnavailableAboveMinor: z.number().int().nullable(),
  discountSource: z.enum(['VOLUME', 'PROMO_CODE']).nullable(),
  promo: promoResult.omit({ promotionId: true }).nullable(),
});
export type CheckoutQuote = z.infer<typeof checkoutQuote>;

export const orderView = z.object({
  number: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  payment: checkoutPayment,
  placedAt: z.string(),
  items: z.array(z.object({ name: z.string(), options: z.string(), quantityMilli: z.number().int(), pricingUnit: z.string(), totalMinor: z.number().int() })),
  subtotalMinor: z.number().int(),
  discountMinor: z.number().int(),
  discountLabel: z.string().nullable(),
  shippingMinor: z.number().int().nullable(),
  totalMinor: z.number().int().nullable(),
  amountDueNowMinor: z.number().int(),
  paidMinor: z.number().int(),
  balanceOnDeliveryMinor: z.number().int(),
  delivery: z.object({ method: deliveryMethod, label: z.string() }),
  receipts: z.array(z.object({ kind: z.string(), status: z.string(), amountMinor: z.number().int(), fiscalCode: z.string().nullable(), receiptUrl: z.string().nullable(), isPrepayment: z.boolean(), issuedAt: z.string().nullable() })),
});
export type OrderView = z.infer<typeof orderView>;

/** Round 19 D2: the exact consent text, stored with every subscriber. */
export const NEWSLETTER_CONSENT_TEXT = 'Хочу отримувати листи про акції та новинки Вівчарика';
