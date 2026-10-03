import { useLocation, useMatches } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BRAND_LATIN, BUSINESS, isPlaceholder, openingHoursSpecification, specialOpeningHoursSpecification, type LiveBusiness } from '@vivcharyk/schemas';
import { path as paths, SEGMENTS, type SegmentKey } from '@/lib/segments';
import { ENABLED_LOCALES } from '@/lib/locale';
import { useBusiness } from '@/lib/business';
import { LOGO_512 } from '@/lib/seo';

/** Locales whose interface and content are really translated and served (round 9 §F4; round 24 G093: `uk` and `en`). */
export const TRANSLATED_LOCALES: Locale[] = ENABLED_LOCALES;
// en_GB: the site's English is British (money.ts formats `en` as en-GB) and the buyers it can serve are in
// Ukraine and Europe, where British spelling is the usual school English.
const OG: Record<Locale, string> = { uk: 'uk_UA', en: 'en_GB', pl: 'pl_PL', de: 'de_DE' };

/**
 * The same page in every served locale, for pages whose address is built from the segment dictionary
 * (home, information pages, about, the glossary…). Catalogue pages pass their own alternates, because
 * their slugs are translated data (29 §29.3).
 */
export function staticAlternates(pathname: string): Partial<Record<Locale, string>> | null {
  const [from, first, ...rest] = pathname.split('/').filter(Boolean);
  if (!from) return null;
  if (!first) return Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, paths.home(l)]));
  if (first === 'slovnyk' && !rest.length) return Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, `/${l}/slovnyk`]));
  const key = (Object.keys(SEGMENTS) as SegmentKey[]).find((k) => SEGMENTS[k][from as Locale] === first);
  // Only single-segment pages: a product or an article has a translated slug after the segment.
  if (!key || rest.length) return null;
  return Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, paths.seg(l, key)]));
}

/**
 * What a page's loader may hand to the head: alternates and robots (29 §29.3), and the catalogue's
 * price range for the Store node (G110) on the pages that load it.
 */
export interface SeoData { alternates?: Partial<Record<Locale, string>>; robots?: string; priceRange?: string }

// Pages that never belong in an index (29 §29.3, canonical table).
const PRIVATE = /^(checkout|order|wishlist)-/;
const SEARCH = /^search-/;

/**
 * Canonical, hreflang, robots and og:locale for every page, from one place (29 §29.3). React 19
 * hoists these tags into <head>. A page served from the `uk` fallback in another locale is
 * `noindex` with no canonical and no hreflang (rule 6); hreflang lists only translated locales,
 * reciprocal, absolute, with `x-default` → `uk`.
 */
export function SeoHead({ origin, locale }: { origin: string; locale: Locale }) {
  const matches = useMatches();
  const { pathname, search } = useLocation();
  const leaf = matches.at(-1);
  const seo = (leaf?.data as { seo?: SeoData } | undefined)?.seo;
  const id = leaf?.id ?? '';
  const business = useBusiness();

  const translated = TRANSLATED_LOCALES.includes(locale) && (seo?.alternates ? !!seo.alternates[locale] : true);
  const robots = PRIVATE.test(id) ? 'noindex,nofollow' : SEARCH.test(id) ? 'noindex,follow' : seo?.robots ?? (translated ? null : 'noindex,follow');
  // Canonical (29 §29.3 table): the page itself. Sort and tracking parameters are dropped, so a
  // sorted listing points at the clean one; filters, the query and `page` stay, so a noindex page
  // still points at itself rather than contradicting its own robots tag.
  const kept = new URLSearchParams([...new URLSearchParams(search)].filter(([k, v]) => v && !/^(sort|utm_.*|gclid|fbclid)$/.test(k) && !(k === 'page' && v === '1')));
  const path = pathname === `/${locale}` ? `/${locale}/` : pathname;
  const canonical = translated && !PRIVATE.test(id) ? `${origin}${path}${kept.size ? `?${kept}` : ''}` : null;
  const alternates = translated && !robots ? Object.fromEntries(Object.entries(seo?.alternates ?? staticAlternates(path) ?? { [locale]: path }).filter(([l]) => TRANSLATED_LOCALES.includes(l as Locale))) : {};

  return (
    <>
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {Object.entries(alternates).map(([l, p]) => <link key={l} rel="alternate" hrefLang={l} href={`${origin}${p}`} />)}
      {alternates.uk && <link rel="alternate" hrefLang="x-default" href={`${origin}${alternates.uk}`} />}
      <meta property="og:locale" content={OG[locale]} />
      {/* G132: the other languages the page really exists in (English once it is switched on, G093). */}
      {Object.keys(alternates).filter((l) => l !== locale).map((l) => <meta key={l} property="og:locale:alternate" content={OG[l as Locale]} />)}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph(origin, locale, business, seo?.priceRange)).replace(/</g, '\\u003c') }} />
      {canonical && <meta property="og:url" content={canonical} />}
    </>
  );
}

/**
 * The site-wide graph (29 §29.6), adapted to later rounds: no foundingDate (D1), opening hours
 * from the panel's working days (round 18 Mon–Fri 11:00–19:00 by default, D28), only the stages the client claims (round 9 §F1), Ukraine only (round 13), and
 * nothing that is still a placeholder — telephone, street, postcode and the Google profile are
 * added when the client confirms them.
 */
function siteGraph(origin: string, locale: Locale, biz: LiveBusiness, priceRange?: string) {
  const phone = biz.contactPeople[0].phone;
  const en = locale !== 'uk';
  const address = {
    '@type': 'PostalAddress', '@id': `${origin}/#address`, addressLocality: en ? 'Yavoriv' : 'Яворів', addressRegion: en ? 'Ivano-Frankivsk Oblast' : 'Івано-Франківська область', addressCountry: 'UA',
    streetAddress: biz.street,
    ...(isPlaceholder(biz.postalCode) ? {} : { postalCode: biz.postalCode }),
  };
  const tel = isPlaceholder(phone) ? {} : { telephone: `+${phone.replace(/\D/g, '')}` };
  const sameAs = isPlaceholder(biz.googleProfileUrl) ? {} : { sameAs: [biz.googleProfileUrl] };
  const special = specialOpeningHoursSpecification(biz.specialDays);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${origin}/#organization`, name: biz.brand, alternateName: en ? BUSINESS.brand : BRAND_LATIN, url: `${origin}/`,
        description: en
          ? `${biz.tagline} Washing, carding, spinning, weaving, felting, sewing and tanning of hides, all in Yavoriv village, Kosiv district, known as the capital of lizhnyk weaving.`
          : `${biz.tagline} Миття, чесання, прядіння, ткання, валяння, пошиття й вичинка шкур — у селі Яворів Косівського району, яке називають столицею ліжникарства.`,
        // G135: the sheep's head, square 512 px.
        logo: { '@type': 'ImageObject', '@id': `${origin}/#logo`, url: `${origin}${LOGO_512}`, width: 512, height: 512 },
        image: { '@id': `${origin}/#logo` }, email: biz.publicEmail, address: { '@id': `${origin}/#address` }, ...tel, ...sameAs,
        areaServed: { '@type': 'Country', name: 'Ukraine' },
        // The owner's own history (2026-10-03, «Наша історія» on the About page): in the craft since 1972.
        founder: { '@type': 'Person', '@id': `${origin}/#founder`, name: en ? 'Ivan Hondurak' : 'Іван Федорович Гондурак', knowsAbout: en ? ['lizhnyk weaving', 'wool carding'] : ['ліжникарство', 'чесання вовни'] },
        knowsAbout: en
          ? ['wool', 'lizhnyk', 'lizhnyk weaving', 'hunia', 'wool roving', 'wool yarn', 'sheepskin tanning', 'Yavoriv', 'Kosiv district', 'Hutsul region']
          : ['вовна', 'ліжник', 'ліжникарство', 'гуня', 'ровниця', 'вовняна пряжа', 'вичинка овчини', 'Яворів', 'Косівщина', 'Гуцульщина'],
      },
      {
        // G107–G111: Store only (already a LocalBusiness), the home page as its url, no founding date.
        // geo waits for verified coordinates (OpenStreetMap has no вул. Петруші; Іван's checklist).
        '@type': 'Store', '@id': `${origin}/#localbusiness`, name: en ? `${biz.brand} — wool goods workshop and shop` : `${biz.brand} — магазин і виробництво вовняних виробів`,
        parentOrganization: { '@id': `${origin}/#organization` }, url: `${origin}/`, image: { '@id': `${origin}/#logo` },
        email: biz.publicEmail, currenciesAccepted: 'UAH', address, ...tel, ...(priceRange ? { priceRange } : {}),
        hasMap: isPlaceholder(biz.googleProfileUrl) ? undefined : biz.googleProfileUrl,
        openingHoursSpecification: openingHoursSpecification(biz.week),
        // 2026-10-03: holidays and shorter days from the panel, today and later (closed = 00:00–00:00).
        ...(special.length ? { specialOpeningHoursSpecification: special } : {}),
      },
      {
        '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: biz.brand, publisher: { '@id': `${origin}/#organization` },
        inLanguage: TRANSLATED_LOCALES,
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${origin}${paths.seg(locale, 'search')}?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
      },
    ],
  };
}
