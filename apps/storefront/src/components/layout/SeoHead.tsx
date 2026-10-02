import { useLocation, useMatches } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS, isPlaceholder } from '@vivcharyk/schemas';
import { path as paths } from '@/lib/segments';

/** Locales whose interface and content are really translated. `en`, `pl`, `de` join when translated (round 9 §F4). */
export const TRANSLATED_LOCALES: Locale[] = ['uk'];
const OG: Record<Locale, string> = { uk: 'uk_UA', en: 'en_GB', pl: 'pl_PL', de: 'de_DE' };

export interface SeoData { alternates?: Partial<Record<Locale, string>>; robots?: string }

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

  const translated = TRANSLATED_LOCALES.includes(locale) && (seo?.alternates ? !!seo.alternates[locale] : true);
  const robots = PRIVATE.test(id) ? 'noindex,nofollow' : SEARCH.test(id) ? 'noindex,follow' : seo?.robots ?? (translated ? null : 'noindex,follow');
  // Canonical (29 §29.3 table): the page itself. Sort and tracking parameters are dropped, so a
  // sorted listing points at the clean one; filters, the query and `page` stay, so a noindex page
  // still points at itself rather than contradicting its own robots tag.
  const kept = new URLSearchParams([...new URLSearchParams(search)].filter(([k, v]) => v && !/^(sort|utm_.*|gclid|fbclid)$/.test(k) && !(k === 'page' && v === '1')));
  const path = pathname === `/${locale}` ? `/${locale}/` : pathname;
  const canonical = translated && !PRIVATE.test(id) ? `${origin}${path}${kept.size ? `?${kept}` : ''}` : null;
  const alternates = translated && !robots ? Object.fromEntries(Object.entries(seo?.alternates ?? { [locale]: path }).filter(([l]) => TRANSLATED_LOCALES.includes(l as Locale))) : {};

  return (
    <>
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {Object.entries(alternates).map(([l, p]) => <link key={l} rel="alternate" hrefLang={l} href={`${origin}${p}`} />)}
      {alternates.uk && <link rel="alternate" hrefLang="x-default" href={`${origin}${alternates.uk}`} />}
      <meta property="og:locale" content={OG[locale]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph(origin, locale)).replace(/</g, '\\u003c') }} />
      {canonical && <meta property="og:url" content={canonical} />}
    </>
  );
}

/**
 * The site-wide graph (29 §29.6), adapted to later rounds: no foundingDate (D1), opening hours
 * Mon–Fri 11:00–19:00 (round 18; earlier rounds: hours vary, none), only the stages the client claims (round 9 §F1), Ukraine only (round 13), and
 * nothing that is still a placeholder — telephone, street, postcode and the Google profile are
 * added when the client confirms them.
 */
function siteGraph(origin: string, locale: Locale) {
  const phone = BUSINESS.contactPeople[0].phone;
  const address = {
    '@type': 'PostalAddress', '@id': `${origin}/#address`, addressLocality: 'с. Яворів', addressRegion: 'Івано-Франківська область', addressCountry: 'UA',
    streetAddress: BUSINESS.street,
    ...(isPlaceholder(BUSINESS.postalCode) ? {} : { postalCode: BUSINESS.postalCode }),
  };
  const tel = isPlaceholder(phone) ? {} : { telephone: `+${phone.replace(/\D/g, '')}` };
  const sameAs = isPlaceholder(BUSINESS.googleProfileUrl) ? {} : { sameAs: [BUSINESS.googleProfileUrl] };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${origin}/#organization`, name: BUSINESS.brand, url: `${origin}/`,
        description: `${BUSINESS.tagline} Миття, чесання, прядіння, ткання, валяння, пошиття й вичинка шкур — у селі Яворів Косівського району, яке називають столицею ліжникарства.`,
        logo: { '@type': 'ImageObject', '@id': `${origin}/#logo`, url: `${origin}/brand/logo-640.webp` },
        image: { '@id': `${origin}/#logo` }, email: BUSINESS.publicEmail, address: { '@id': `${origin}/#address` }, ...tel, ...sameAs,
        areaServed: { '@type': 'Country', name: 'Ukraine' },
        knowsAbout: ['вовна', 'ліжник', 'ліжникарство', 'гуня', 'ровниця', 'вовняна пряжа', 'вичинка овчини', 'Яворів', 'Косівщина', 'Гуцульщина'],
      },
      {
        '@type': ['Store', 'LocalBusiness'], '@id': `${origin}/#localbusiness`, name: `${BUSINESS.brand} — магазин і виробництво вовняних виробів`,
        parentOrganization: { '@id': `${origin}/#organization` }, url: `${origin}${paths.seg(locale, 'contacts')}`, image: { '@id': `${origin}/#logo` },
        email: BUSINESS.publicEmail, currenciesAccepted: 'UAH', address, ...tel,
        openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '11:00', closes: '19:00' },
      },
      {
        '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: BUSINESS.brand, publisher: { '@id': `${origin}/#organization` },
        inLanguage: TRANSLATED_LOCALES,
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${origin}${paths.seg(locale, 'search')}?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
      },
    ],
  };
}
