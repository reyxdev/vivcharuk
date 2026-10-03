// Round 24 (G039): no zod here, so the site's pages do not ship it; the schemas are in businessSchemas.ts.
import type { DayHours, SiteContact, TickerItem } from './businessSchemas';

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
  // «Прокласти маршрут» until the Google profile link exists (contacts page, homepage S9): the exact
  // address, not the village (round 24 G116).
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('вул. Петруші, 1, Яворів, Косівський район, Івано-Франківська область, 78644')}`,
} as const;

/**
 * Round 24 G093: English is served at launch. The brand in Latin script (KMU 2010 transliteration, the
 * Wikidata label in docs/seo-owner-guides-round24.md) and the facts an English page writes differently.
 * The village is always named with its district and region: Google confuses it with Yavoriv, Lviv region.
 */
export const BRAND_LATIN = 'Vivcharyk';
export const BUSINESS_EN = {
  brand: BRAND_LATIN,
  tagline: 'For over 30 years we have been making natural wool goods in the Carpathians.',
  locality: 'Yavoriv village, Kosiv district, Ivano-Frankivsk region',
  factoryAddress: '1 Petrushi St, Yavoriv village, Kosiv district, Ivano-Frankivsk region, 78644, Ukraine',
  street: '1 Petrushi St',
  legalEntityName: 'Sole proprietor (FOP) Liubov Yuriivna Hondurak',
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
const WEEK_DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** «+380679973450» → «+38 067 997 34 50», the way the site writes the number. */
export const formatPhoneUa = (e164: string) => {
  const d = e164.replace(/\D/g, '');
  return `+38 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
};

const open = (opens: string, closes: string): DayHours => ({ open: true, opens, closes });
const closed: DayHours = { open: false, opens: '11:00', closes: '19:00' };
export const DEFAULT_SITE_CONTACT: SiteContact = {
  hoursText: BUSINESS.hoursText,
  week: [open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), open('11:00', '19:00'), closed, closed],
  phone: BUSINESS.messengerPhone,
  publicEmail: BUSINESS.publicEmail,
};

function openRuns(week: DayHours[]) {
  const runs: Array<{ from: number; to: number; d: DayHours }> = [];
  week.forEach((d, i) => {
    const last = runs.at(-1);
    if (!d.open) return;
    if (last && last.to === i - 1 && last.d.opens === d.opens && last.d.closes === d.closes) last.to = i;
    else runs.push({ from: i, to: i, d });
  });
  return runs;
}

/** «пн–пт, 11:00–19:00» (English: «Mon–Fri, 11:00–19:00»): consecutive days with the same hours run together. */
export function hoursShort(week: DayHours[], days: readonly string[] = WEEK_DAYS_UK) {
  return openRuns(week).map((r) => `${days[r.from]}${r.to > r.from ? `–${days[r.to]}` : ''}, ${r.d.opens}–${r.d.closes}`).join('; ');
}

/** The English sentence for the hours (the panel's own sentence is Ukrainian): «We are open Monday to Friday, 11:00–19:00; Saturday and Sunday are days off.» */
export function hoursTextEn(week: DayHours[]) {
  const runs = openRuns(week).map((r) => `${WEEK_DAYS[r.from]}${r.to > r.from ? ` ${r.to - r.from > 1 ? 'to' : 'and'} ${WEEK_DAYS[r.to]}` : ''}, ${r.d.opens}–${r.d.closes}`);
  const off = WEEK_DAYS.filter((_, i) => !week[i]?.open);
  const offText = off.length ? `; ${off.length > 1 ? `${off.slice(0, -1).join(', ')} and ${off.at(-1)} are days off` : `${off[0]} is a day off`}` : '';
  return `We are open ${runs.join('; ')}${offText}.`;
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

/**
 * BUSINESS with the owner's current hours, phone and e-mail in place of the code defaults. An English
 * page (G093) gets the English brand, address and an hours sentence built from the same working days.
 */
export function liveBusiness(c: SiteContact, locale: 'uk' | 'en' | 'pl' | 'de' = 'uk') {
  const en = locale !== 'uk';
  return {
    ...BUSINESS,
    ...(en ? BUSINESS_EN : {}) as Partial<Record<keyof typeof BUSINESS_EN, string>>,
    hours: en ? hoursShort(c.week, WEEK_DAYS_EN) : hoursShort(c.week),
    hoursText: en ? hoursTextEn(c.week) : c.hoursText,
    week: c.week,
    phones: [c.phone] as const,
    messengerPhone: c.phone,
    contactPeople: [{ name: en ? 'Ivan' : BUSINESS.contactPeople[0].name as string, phone: c.phone }] as const,
    publicEmail: c.publicEmail,
  };
}
export type LiveBusiness = ReturnType<typeof liveBusiness>;

// ---------- The top ticker (developer decision D29, round 20 #229) ----------

/** Exactly the phrases the strip carried before they became editable (round 11). */
export const DEFAULT_TICKER: TickerItem[] = [
  { text: 'Відправляємо по Україні за 2–4 дні', linkUrl: '/uk/dostavka-i-oplata', isActive: true, cardOnly: false },
  { text: 'Огляд перед оплатою на пошті', linkUrl: '/uk/dostavka-i-oplata', isActive: true, cardOnly: true },
  { text: BUSINESS.tagline.replace(/\.$/, ''), linkUrl: null, isActive: true, cardOnly: false },
  { text: 'Зроблено в Яворові', linkUrl: '/uk/vyrobnytstvo', isActive: true, cardOnly: false },
];

/** G093: the strip on English pages. The owner's phrases are Ukrainian, so English pages carry these. */
export const DEFAULT_TICKER_EN: TickerItem[] = [
  { text: 'We ship across Ukraine in 2–4 days', linkUrl: '/en/delivery-and-payment', isActive: true, cardOnly: false },
  { text: 'Inspect your parcel before you pay at the post office', linkUrl: '/en/delivery-and-payment', isActive: true, cardOnly: true },
  { text: BUSINESS_EN.tagline.replace(/\.$/, ''), linkUrl: null, isActive: true, cardOnly: false },
  { text: 'Made in Yavoriv, Kosiv district', linkUrl: '/en/production', isActive: true, cardOnly: false },
];
