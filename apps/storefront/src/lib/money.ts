import type { Locale } from '@vivcharyk/schemas';

const INTL: Record<Locale, string> = { uk: 'uk-UA', en: 'en-GB', pl: 'pl-PL', de: 'de-DE' };

/** Whole hryvnias, grouped with a thin space: «5 400 ₴». Minor units in, never floats on the wire. */
export function formatUah(minor: number, locale: Locale = 'uk') {
  return `${new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 0 }).format(Math.round(minor / 100))} ₴`;
}

export function formatRange(min: number, max: number, locale: Locale = 'uk') {
  return min === max ? formatUah(min, locale) : `${formatUah(min, locale).replace(' ₴', '')} – ${formatUah(max, locale)}`;
}
