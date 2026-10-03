import type { Locale } from '@vivcharyk/schemas';

// Route-segment dictionary (03 §3.5.2). The single constant consumed by the router, the sitemap
// generator and the hreflang builder.
export const SEGMENTS = {
  product: { uk: 'tovar', en: 'product', pl: 'produkt', de: 'produkt' },
  collections: { uk: 'kolektsii', en: 'collections', pl: 'kolekcje', de: 'kollektionen' },
  journal: { uk: 'zhurnal', en: 'journal', pl: 'magazyn', de: 'journal' },
  gallery: { uk: 'halereia', en: 'gallery', pl: 'galeria', de: 'galerie' },
  reviews: { uk: 'vidhuky', en: 'reviews', pl: 'opinie', de: 'bewertungen' },
  gifts: { uk: 'podarunky', en: 'gifts', pl: 'prezenty', de: 'geschenke' },
  search: { uk: 'poshuk', en: 'search', pl: 'szukaj', de: 'suche' },
  cart: { uk: 'koshyk', en: 'cart', pl: 'koszyk', de: 'warenkorb' },
  checkout: { uk: 'oformlennia', en: 'checkout', pl: 'zamowienie', de: 'kasse' },
  order: { uk: 'zamovlennia', en: 'order', pl: 'moje-zamowienie', de: 'bestellung' },
  pay: { uk: 'oplatyty', en: 'pay', pl: 'zaplac', de: 'bezahlen' },
  wholesale: { uk: 'optom', en: 'wholesale', pl: 'hurt', de: 'grosshandel' },
  production: { uk: 'vyrobnytstvo', en: 'production', pl: 'produkcja', de: 'produktion' },
  about: { uk: 'pro-nas', en: 'about', pl: 'o-nas', de: 'ueber-uns' },
  contacts: { uk: 'kontakty', en: 'contacts', pl: 'kontakt', de: 'kontakt' },
  // Information pages (04 §4.3 uk slugs; 29 §29.2 for care; other locales proposed, round 17 B9).
  delivery: { uk: 'dostavka-i-oplata', en: 'delivery-and-payment', pl: 'dostawa-i-platnosc', de: 'zahlung-und-versand' },
  returns: { uk: 'povernennia', en: 'returns', pl: 'zwroty', de: 'rueckgabe' },
  faq: { uk: 'faq', en: 'faq', pl: 'faq', de: 'faq' },
  care: { uk: 'dohliad', en: 'care', pl: 'pielegnacja', de: 'pflege' },
  terms: { uk: 'umovy-korystuvannia', en: 'terms', pl: 'regulamin', de: 'agb' },
  privacy: { uk: 'polityka-konfidentsiinosti', en: 'privacy-policy', pl: 'polityka-prywatnosci', de: 'datenschutz' },
  cookies: { uk: 'cookies', en: 'cookies', pl: 'cookies', de: 'cookies' },
  wishlist: { uk: 'obrane', en: 'wishlist', pl: 'ulubione', de: 'merkliste' },
  // Round 19 D2: confirm or leave the newsletter (the page behind the links in its letters; noindex).
  newsletter: { uk: 'rozsylka', en: 'newsletter', pl: 'newsletter', de: 'newsletter' },
} as const satisfies Record<string, Record<Locale, string>>;

export type SegmentKey = keyof typeof SEGMENTS;

/**
 * Round 22 K13: «Від партнерів» is not a category; the site gathers partner goods by their origin on
 * this page (a category-shaped address, served by routes/category.tsx).
 */
export const PARTNERS_SLUG = 'vid-partneriv';
export const PARTNERS_NAME = 'Від партнерів';
export const PARTNERS_NAME_EN = 'From our partners';

export const path = {
  home: (l: Locale) => `/${l}/`,
  seg: (l: Locale, key: SegmentKey) => `/${l}/${SEGMENTS[key][l]}`,
  product: (l: Locale, slug: string) => `/${l}/${SEGMENTS.product[l]}/${slug}`,
  category: (l: Locale, ...slugs: string[]) => `/${l}/${slugs.join('/')}`,
};
