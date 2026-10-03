import { z } from 'zod';
import { DEFAULT_SITE_CONTACT, formatPhoneUa } from './business';

// Validation of the owner-editable contact facts and ticker (round 20 D28, D29). Kept apart from
// business.ts so the storefront's client code, which only reads the facts, never pulls zod in (round 24 G039).

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Час у форматі 11:00');
export const dayHours = z.object({ open: z.boolean(), opens: hhmm, closes: hhmm })
  .refine((d) => !d.open || d.opens < d.closes, { path: ['closes'], message: 'Кінець роботи має бути пізніше за початок' });
export type DayHours = z.infer<typeof dayHours>;

export const siteContactSchema = z.object({
  hoursText: z.string().trim().min(10, 'Напишіть години роботи реченням, як на сайті').max(200, 'Не довше 200 знаків')
    .refine((v) => !/[\r\n<>]/.test(v), 'Одним рядком, без знаків < і >'),
  week: z.array(dayHours).length(7).refine((w) => w.some((d) => d.open), 'Хоча б один робочий день'),
  phone: z.string().trim()
    .transform((v) => v.replace(/[^\d+]/g, ''))
    .transform((v) => (v.startsWith('+') ? v : v.startsWith('380') ? `+${v}` : v.startsWith('0') ? `+38${v}` : v))
    .refine((v) => /^\+380\d{9}$/.test(v), 'Український номер, наприклад +38 067 123 45 67')
    .transform(formatPhoneUa),
  publicEmail: z.string().trim().toLowerCase().max(120).email('Адреса пошти, наприклад info@vivcharuk.com'),
});
export type SiteContact = z.output<typeof siteContactSchema>;

/** A stored value that no longer validates falls back to the default rather than breaking the site. */
export const parseSiteContact = (raw: unknown): SiteContact => {
  const r = siteContactSchema.safeParse(raw);
  return r.success ? r.data : DEFAULT_SITE_CONTACT;
};

export const tickerItem = z.object({
  text: z.string().trim().min(3, 'Щонайменше 3 знаки').max(120, 'Не довше 120 знаків'),
  linkUrl: z.string().trim().max(300).regex(/^\/[a-z]{2}\/[^\s]*$|^$/, 'Адреса сторінки нашого сайту, наприклад /uk/pro-nas')
    .transform((v) => v || null).nullable().default(null),
  isActive: z.boolean().default(true),
  // «Огляд перед оплатою» is true only while card-type payments are live (round 14): such a phrase
  // shows only then, whatever its switch says.
  cardOnly: z.boolean().default(false),
});
export const tickerSchema = z.array(tickerItem).max(12);
export type TickerItem = z.output<typeof tickerItem>;
