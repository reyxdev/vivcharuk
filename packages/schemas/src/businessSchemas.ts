import { z } from 'zod';
import { addDays, DEFAULT_SITE_CONTACT, formatPhoneUa, kyivDate } from './business';

// Validation of the owner-editable contact facts and ticker (round 20 D28, D29). Kept apart from
// business.ts so the storefront's client code, which only reads the facts, never pulls zod in (round 24 G039).

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Час у форматі 11:00');
export const dayHours = z.object({ open: z.boolean(), opens: hhmm, closes: hhmm })
  .refine((d) => !d.open || d.opens < d.closes, { path: ['closes'], message: 'Кінець роботи має бути пізніше за початок' });
export type DayHours = z.infer<typeof dayHours>;

// 2026-10-03 (hours sync with Google): days that differ from the week — a holiday closed, or shorter
// hours. Shown on the site, in JSON-LD and sent to Google Business Profile as specialHours.
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата у форматі 2026-12-25')
  .refine((v) => { const d = new Date(`${v}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v); }, 'Такої дати немає');
export const specialDay = z.object({
  date: isoDate,
  closed: z.boolean(),
  opens: hhmm.optional(),
  closes: hhmm.optional(),
  note: z.string().trim().max(60, 'Не довше 60 знаків').refine((v) => !/[\r\n<>]/.test(v), 'Одним рядком, без знаків < і >').optional(),
}).superRefine((d, ctx) => {
  if (d.closed) return;
  if (!d.opens || !d.closes) ctx.addIssue({ code: 'custom', path: ['opens'], message: 'Вкажіть години або позначте «Зачинено»' });
  else if (d.opens >= d.closes) ctx.addIssue({ code: 'custom', path: ['closes'], message: 'Кінець роботи має бути пізніше за початок' });
}).transform(({ date, closed, opens, closes, note }) => ({ date, closed, ...(closed ? {} : { opens, closes }), ...(note ? { note } : {}) }));
export type SpecialDay = z.output<typeof specialDay>;

/** Past days are kept 30 days (then dropped on the next save), sorted by date; at most 60. */
export const SPECIAL_DAYS_MAX = 60;
export const specialDays = z.array(specialDay).max(200)
  .transform((list) => { const from = addDays(kyivDate(), -30); return list.filter((d) => d.date >= from).sort((a, b) => a.date.localeCompare(b.date)); })
  .refine((list) => list.length <= SPECIAL_DAYS_MAX, `Не більше ${SPECIAL_DAYS_MAX} особливих днів`)
  .refine((list) => new Set(list.map((d) => d.date)).size === list.length, 'Одна дата — один запис');

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
  specialDays: specialDays.default([]),
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
