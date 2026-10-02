import { z } from 'zod';

// Business facts shown on the site. Values marked PLACEHOLDER are unresolved client facts
// ({{TOKEN}} in the blueprint). They are filled in at the end of the build — never invent them.
export const PLACEHOLDER = '[заглушка]';

export const BUSINESS = {
  brand: 'Вівчарик',
  // Approved tagline, exact (CLAUDE.md). The claim attaches to the manufacturing.
  tagline: 'Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.',
  locality: 'с. Яворів, Косівський район',
  // Round 18: fixed hours (earlier rounds: «графік гнучкий»). Saturday and Sunday are days off.
  hours: 'пн–пт, 11:00–19:00',
  hoursText: 'Працюємо пн–пт з 11:00 до 19:00, субота й неділя — вихідні.',
  domain: 'vivcharuk.com', // round 18: the domain actually registered (Porkbun)
  publicEmail: 'info@vivcharuk.com', // the Porkbun mailbox to create
  legalEntityName: 'ФОП Гондурак Любов Юріївна', // round 18
  legalId: '2531703749', // РНОКПП of the ФОП (round 18)
  // Payment by bank transfer (round 18); shown on the order page with the order number as purpose.
  iban: 'UA223003350000000260092276708',
  factoryAddress: 'вул. Петруші, 1, с. Яворів, Косівський р-н, Івано-Франківська обл., 78644', // round 18
  street: 'вул. Петруші, 1',
  postalCode: '78644', // round 18; public postal index of с. Яворів, Косівський р-н
  phones: ['+38 067 997 34 50'],
  // Round 18: one phone for calls and Viber, Telegram, WhatsApp — Іван's (number: round 2, round 9 part 5 #5).
  contactPeople: [{ name: 'Іван', phone: '+38 067 997 34 50' }],
  messengerPhone: '+38 067 997 34 50',
  // Google Business Profile (round 13 N2, N3): «Читати в Google» and the review form.
  googleProfileUrl: '[Google-профіль — заглушка]', // {{GOOGLE_PROFILE_URL}}
  googleReviewUrl: '[Google-відгук — заглушка]', // {{GOOGLE_REVIEW_URL}}
  googleRating: '[рейтинг]', // {{GOOGLE_RATING}}, from the profile once it exists
  googleReviewCount: '[кількість]', // {{GOOGLE_REVIEW_COUNT}}
  // «Прокласти маршрут» until the Google profile link exists (contacts page, homepage S9).
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Яворів, Косівський район, Івано-Франківська область')}`,
} as const;

export const isPlaceholder = (v: string) => v.startsWith('[');
const digits = (phone: string) => phone.replace(/\D/g, '');
/** tel:, Viber, Telegram and WhatsApp links; null while the number is still a placeholder. */
export const contactLinks = (phone: string) =>
  isPlaceholder(phone) ? null : {
    tel: `tel:+${digits(phone)}`,
    viber: `viber://chat?number=%2B${digits(phone)}`,
    telegram: `https://t.me/+${digits(phone)}`,
    whatsapp: `https://wa.me/${digits(phone)}`,
  };

// ---------- Owner-editable contact facts (developer decision D28, round 20 #173) ----------
// Hours, the shop phone (calls and messengers) and the public e-mail live in the `site.contact`
// Setting; BUSINESS above is the default and keeps everything else (seller, РНОКПП, IBAN, address).

export const SITE_CONTACT_KEY = 'site.contact';
export const SITE_TICKER_KEY = 'site.ticker';

/** Monday first, as ISO weeks and schema.org list them. */
export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const WEEK_DAYS_UK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'] as const;

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Час у форматі 11:00');
export const dayHours = z.object({ open: z.boolean(), opens: hhmm, closes: hhmm })
  .refine((d) => !d.open || d.opens < d.closes, { path: ['closes'], message: 'Кінець роботи має бути пізніше за початок' });
export type DayHours = z.infer<typeof dayHours>;

/** «+380679973450» → «+38 067 997 34 50», the way the site writes the number. */
export const formatPhoneUa = (e164: string) => {
  const d = e164.replace(/\D/g, '');
  return `+38 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
};

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

const open = (opens: string, closes: string): DayHours => ({ open: true, opens, closes });
const closed: DayHours = { open: false, opens: '11:00', closes: '19:00' };
export const DEFAULT_SITE_CONTACT: SiteContact = {
  hoursText: BUSINESS.hoursText,
  week: [open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), closed, closed],
  phone: BUSINESS.messengerPhone,
  publicEmail: BUSINESS.publicEmail,
};

/** A stored value that no longer validates falls back to the default rather than breaking the site. */
export const parseSiteContact = (raw: unknown): SiteContact => {
  const r = siteContactSchema.safeParse(raw);
  return r.success ? r.data : DEFAULT_SITE_CONTACT;
};

/** «пн–пт, 11:00–19:00»: consecutive days with the same hours run together. */
export function hoursShort(week: DayHours[]) {
  const runs: Array<{ from: number; to: number; d: DayHours }> = [];
  week.forEach((d, i) => {
    const last = runs.at(-1);
    if (!d.open) return;
    if (last && last.to === i - 1 && last.d.opens === d.opens && last.d.closes === d.closes) last.to = i;
    else runs.push({ from: i, to: i, d });
  });
  return runs.map((r) => `${WEEK_DAYS_UK[r.from]}${r.to > r.from ? `–${WEEK_DAYS_UK[r.to]}` : ''}, ${r.d.opens}–${r.d.closes}`).join('; ');
}

/** schema.org openingHoursSpecification: one entry per distinct pair of hours. */
export function openingHoursSpecification(week: DayHours[]) {
  const groups = new Map<string, string[]>();
  week.forEach((d, i) => { if (d.open) groups.set(`${d.opens}|${d.closes}`, [...(groups.get(`${d.opens}|${d.closes}`) ?? []), WEEK_DAYS[i]!]); });
  return [...groups].map(([k, dayOfWeek]) => {
    const [opens, closes] = k.split('|');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek, opens, closes };
  });
}

/** BUSINESS with the owner's current hours, phone and e-mail in place of the code defaults. */
export function liveBusiness(c: SiteContact) {
  return {
    ...BUSINESS,
    hours: hoursShort(c.week),
    hoursText: c.hoursText,
    week: c.week,
    phones: [c.phone] as const,
    messengerPhone: c.phone,
    contactPeople: [{ name: BUSINESS.contactPeople[0].name, phone: c.phone }] as const,
    publicEmail: c.publicEmail,
  };
}
export type LiveBusiness = ReturnType<typeof liveBusiness>;

// ---------- The top ticker (developer decision D29, round 20 #229) ----------

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

/** Exactly the phrases the strip carried before they became editable (round 11). */
export const DEFAULT_TICKER: TickerItem[] = [
  { text: 'Відправляємо по Україні за 2–4 дні', linkUrl: '/uk/dostavka-i-oplata', isActive: true, cardOnly: false },
  { text: 'Огляд перед оплатою на пошті', linkUrl: '/uk/dostavka-i-oplata', isActive: true, cardOnly: true },
  { text: BUSINESS.tagline.replace(/\.$/, ''), linkUrl: null, isActive: true, cardOnly: false },
  { text: 'Зроблено в Яворові', linkUrl: '/uk/vyrobnytstvo', isActive: true, cardOnly: false },
];
