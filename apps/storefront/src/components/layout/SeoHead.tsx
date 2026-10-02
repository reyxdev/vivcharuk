import { useLocation, useMatches } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { isPlaceholder, openingHoursSpecification, type LiveBusiness } from '@vivcharyk/schemas';
import { path as paths } from '@/lib/segments';
import { ENABLED_LOCALES } from '@/lib/locale';
import { useBusiness } from '@/lib/business';

/** Locales whose interface and content are really translated and served (round 9 §F4, D39: only `uk` at launch). */
export const TRANSLATED_LOCALES: Locale[] = ENABLED_LOCALES;
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
  const business = useBusiness();

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph(origin, locale, business)).replace(/</g, '\\u003c') }} />
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
function siteGraph(origin: string, locale: Locale, biz: LiveBusiness) {
  const phone = biz.contactPeople[0].phone;
  const address = {
    '@type': 'PostalAddress', '@id': `${origin}/#address`, addressLocality: 'с. Яворів', addressRegion: 'Івано-Франківська область', addressCountry: 'UA',
    streetAddress: biz.street,
    ...(isPlaceholder(biz.postalCode) ? {} : { postalCode: biz.postalCode }),
  };
  const tel = isPlaceholder(phone) ? {} : { telephone: `+${phone.replace(/\D/g, '')}` };
  const sameAs = isPlaceholder(biz.googleProfileUrl) ? {} : { sameAs: [biz.googleProfileUrl] };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${origin}/#organization`, name: biz.brand, url: `${origin}/`,
        description: `${biz.tagline} Миття, чесання, прядіння, ткання, валяння, пошиття й вичинка шкур — у селі Яворів Косівського району, яке називають столицею ліжникарства.`,
        logo: { '@type': 'ImageObject', '@id': `${origin}/#logo`, url: `${origin}/brand/logo-640.webp` },
        image: { '@id': `${origin}/#logo` }, email: biz.publicEmail, address: { '@id': `${origin}/#address` }, ...tel, ...sameAs,
        areaServed: { '@type': 'Country', name: 'Ukraine' },
        knowsAbout: ['вовна', 'ліжник', 'ліжникарство', 'гуня', 'ровниця', 'вовняна пряжа', 'вичинка овчини', 'Яворів', 'Косівщина', 'Гуцульщина'],
      },
      {
        '@type': ['Store', 'LocalBusiness'], '@id': `${origin}/#localbusiness`, name: `${biz.brand} — магазин і виробництво вовняних виробів`,
        parentOrganization: { '@id': `${origin}/#organization` }, url: `${origin}${paths.seg(locale, 'contacts')}`, image: { '@id': `${origin}/#logo` },
        email: biz.publicEmail, currenciesAccepted: 'UAH', address, ...tel,
        openingHoursSpecification: openingHoursSpecification(biz.week),
      },
      {
        '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: biz.brand, publisher: { '@id': `${origin}/#organization` },
        inLanguage: TRANSLATED_LOCALES,
        potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${origin}${paths.seg(locale, 'search')}?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
      },
    ],
  };
}
