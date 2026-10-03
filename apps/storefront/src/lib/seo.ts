import { BUSINESS, BRAND_LATIN, type Locale } from '@vivcharyk/schemas';

// Titles, descriptions and the Open Graph / Twitter set for every page, from one place (round 24
// G051–G056, G132–G135). og:url and og:locale come from SeoHead, which knows the canonical.

export const OG_DEFAULT = { path: '/brand/og-default-1200x630.jpg', width: 1200, height: 630, alt: `${BUSINESS.brand} — ліжники та вовняні вироби з Карпат` };
const OG_ALT_EN = `${BRAND_LATIN} — lizhnyks and wool goods from the Carpathians`;

/** Round 24 G093: the brand as each locale writes it — «Вівчарик» in Ukrainian, «Vivcharyk» in Latin script. */
export const brandOf = (locale: Locale = 'uk') => (locale === 'uk' ? BUSINESS.brand : BRAND_LATIN);
export const LOGO_512 = '/brand/logo-512.png';
const DESCRIPTION_MAX = 155;

/** ≤ 155 characters, cut at a word, never in the middle of one (G056). */
export function clip(text: string, max = DESCRIPTION_MAX) {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > 40 ? cut.slice(0, at) : cut).replace(/[\s,;:—–-]+$/, '')}…`;
}

/** The layout's absolute origin, read from the route matches inside a `meta` function. */
export function originOf(matches: ReadonlyArray<{ id: string; data?: unknown } | undefined>) {
  const layout = matches.find((m) => m?.id === 'routes/locale-layout')?.data as { origin?: string } | undefined;
  return layout?.origin ?? '';
}

/** The page's locale, read from the route matches inside a `meta` function. */
export function localeOf(matches: ReadonlyArray<{ id: string; data?: unknown; params?: Record<string, string | undefined> } | undefined>): Locale {
  const layout = matches.find((m) => m?.id === 'routes/locale-layout');
  return ((layout?.data as { locale?: Locale } | undefined)?.locale ?? layout?.params?.locale ?? 'uk') as Locale;
}

export interface PageMetaInput {
  title: string;
  description?: string | null;
  origin: string;
  type?: 'website' | 'product' | 'article';
  /** Absolute or site-relative; the brand picture when absent. */
  image?: { url: string; alt: string; width?: number; height?: number } | null;
  /** The brand name and the default picture's alt follow it (G093). */
  locale?: Locale;
}

/** title, description and the whole og:/twitter: set (G132–G135). */
export function pageMeta({ title, description, origin, type = 'website', image, locale = 'uk' }: PageMetaInput) {
  const abs = (u: string) => (u.startsWith('http') ? u : `${origin}${u}`);
  const img = image ?? { url: OG_DEFAULT.path, alt: locale === 'uk' ? OG_DEFAULT.alt : OG_ALT_EN, width: OG_DEFAULT.width, height: OG_DEFAULT.height };
  const desc = description ? clip(description) : null;
  return [
    { title },
    ...(desc ? [{ name: 'description', content: desc }] : []),
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: brandOf(locale) },
    { property: 'og:title', content: title },
    ...(desc ? [{ property: 'og:description', content: desc }] : []),
    { property: 'og:image', content: abs(img.url) },
    ...(img.width && img.height ? [{ property: 'og:image:width', content: String(img.width) }, { property: 'og:image:height', content: String(img.height) }] : []),
    { property: 'og:image:alt', content: img.alt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    ...(desc ? [{ name: 'twitter:description', content: desc }] : []),
    { name: 'twitter:image', content: abs(img.url) },
  ];
}

/** The brand appended once: «Контакти — Вівчарик», «Contacts — Vivcharyk». */
export const titled = (name: string, locale: Locale = 'uk') => `${name} — ${brandOf(locale)}`;

/** Ukrainian plural: plural(2, 'відгук', 'відгуки', 'відгуків') → «відгуки». */
export function plural(n: number, one: string, few: string, many: string) {
  const cat = new Intl.PluralRules('uk').select(n);
  return cat === 'one' ? one : cat === 'few' ? few : many;
}

/** «−10 %»: minus sign and a non-breaking space before the percent sign (G089); English writes «−10%». */
export const pct = (n: number, minus = false, locale: Locale = 'uk') => `${minus ? '−' : ''}${n}${locale === 'uk' ? ' ' : ''}%`;

/** «Оновлено 3 жовтня 2026» / «Updated 3 October 2026» under the information pages (G071). */
export const updatedOn = (iso: string, locale: Locale = 'uk') => {
  const date = new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return locale === 'uk' ? `Оновлено ${date}` : `Updated ${date}`;
};

/** G110: the Store's price range from the catalogue, rounded: «від 460 до 8 500 ₴», «from 460 to 8,500 ₴». */
export function priceRangeText(minMinor: number, maxMinor: number, locale: Locale = 'uk') {
  const lo = Math.floor(minMinor / 1000) * 10, hi = Math.ceil(maxMinor / 10000) * 100;
  if (locale !== 'uk') return `from ${lo.toLocaleString('en-GB')} to ${hi.toLocaleString('en-GB')} ₴`;
  const n = (v: number) => new Intl.NumberFormat('uk-UA').format(v).replace(/\s/g, ' ');
  return `від ${n(lo)} до ${n(hi)} ₴`;
}

/** Titles stay about this long; a longer one drops its middle phrase (G053–G054). */
export const TITLE_MAX = 65;
