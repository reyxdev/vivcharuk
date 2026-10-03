import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { SEGMENTS } from '../src/lib/segments';

// Localised segments come from one dictionary (03 §3.5.2); each locale's variant is its own route id.
const PRODUCT = { uk: 'tovar', en: 'product', pl: 'produkt', de: 'produkt' } as const;

const CHECKOUT = { uk: 'oformlennia', en: 'checkout', pl: 'zamowienie', de: 'kasse' } as const;
const PRODUCTION = { uk: 'vyrobnytstvo', en: 'production', pl: 'produkcja', de: 'produktion' } as const;
const CONTACTS = { uk: 'kontakty', en: 'contacts', pl: 'kontakt', de: 'kontakt' } as const;
const ABOUT = { uk: 'pro-nas', en: 'about', pl: 'o-nas', de: 'ueber-uns' } as const;
const WHOLESALE = { uk: 'optom', en: 'wholesale', pl: 'hurt', de: 'grosshandel' } as const;
const ORDER = { uk: 'zamovlennia', en: 'order', pl: 'moje-zamowienie', de: 'bestellung' } as const;
const each = (dict: Record<string, string>, suffix: string, file: string, id: string) =>
  [...new Set(Object.values(dict))].map((seg) => route(`${seg}${suffix}`, file, { id: `${id}-${seg}` }));

const productRoutes = [
  ...each(PRODUCT, '/:slug', 'routes/product.tsx', 'product'),
  ...each(CHECKOUT, '', 'routes/checkout.tsx', 'checkout'),
  ...each(ORDER, '/:token', 'routes/order.tsx', 'order'),
  ...each(PRODUCTION, '', 'routes/production.tsx', 'production'),
  ...each(CONTACTS, '', 'routes/contacts.tsx', 'contacts'),
  ...each(ABOUT, '', 'routes/about.tsx', 'about'),
  ...each(WHOLESALE, '', 'routes/wholesale.tsx', 'wholesale'),
  ...each(SEGMENTS.reviews, '', 'routes/reviews.tsx', 'reviews'),
  ...each(SEGMENTS.search, '', 'routes/search.tsx', 'search'),
  ...each(SEGMENTS.wishlist, '', 'routes/wishlist.tsx', 'wishlist'),
  ...each(SEGMENTS.newsletter, '', 'routes/newsletter.tsx', 'newsletter'),
  ...each(SEGMENTS.collections, '/:slug', 'routes/collection.tsx', 'collection'),
  ...each(SEGMENTS.journal, '', 'routes/journal.tsx', 'journal'),
  ...each(SEGMENTS.journal, '/:slug', 'routes/article.tsx', 'article'),
  // Round 24 G095: one glossary page, the same segment in every locale.
  route('slovnyk', 'routes/glossary.tsx', { id: 'glossary' }),
  // One route file for the information pages; the key travels in the route id (info_<key>-<seg>).
  ...(['delivery', 'returns', 'faq', 'care', 'terms', 'privacy', 'cookies'] as const).flatMap((k) => each(SEGMENTS[k], '', 'routes/info.tsx', `info_${k}`)),
];

// All four locales are prefixed; `/` is a 301 to `/uk/` (04 §4.2, 03 §3.5.1).
export default [
  index('routes/root-redirect.tsx'),
  route('robots.txt', 'routes/robots.ts'),
  // Root files (round 24 G011–G012): before `:locale`, which would otherwise redirect them into /uk/.
  // The IndexNow key file /<INDEXNOW_KEY>.txt is answered by server.mjs.
  route('llms.txt', 'routes/root-files.ts', { id: 'root-llms' }),
  route('humans.txt', 'routes/root-files.ts', { id: 'root-humans' }),
  route('manifest.webmanifest', 'routes/root-files.ts', { id: 'root-manifest' }),
  route('.well-known/security.txt', 'routes/root-files.ts', { id: 'root-security' }),
  route('.well-known/*', 'routes/not-found.tsx', { id: 'well-known-404' }),
  route('sitemap.xml', 'routes/sitemap.ts', { id: 'sitemap-index' }),
  ...(['pages', 'categories', 'products', 'posts'] as const).flatMap((t) => (['uk', 'en', 'pl', 'de'] as const).map((l) => route(`sitemap-${t}-${l}.xml`, 'routes/sitemap.ts', { id: `sitemap-${t}-${l}` }))),
  route(':locale', 'routes/locale-layout.tsx', [
    index('routes/home.tsx'),
    ...productRoutes,
    route(':category/:sub?', 'routes/category.tsx'),
  ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
