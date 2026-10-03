import type { Locale } from '@vivcharyk/schemas';
import type { Route } from './+types/sitemap';
import { apiGet } from '@/lib/api.server';
import { path, type SegmentKey } from '@/lib/segments';
import { TRANSLATED_LOCALES } from '@/components/layout/SeoHead';

// 29 §29.9: an index plus segment files by type then locale. Only self-canonical, indexable pages
// in a really translated locale; `lastmod` only where it is truthful; no changefreq or priority.
// Round 24: no empty category (G004), no journal and no posts file before the first article (G006),
// category lastmod from its products (G007), product photos as image entries (G035), hreflang
// alternates between the served locales (G093), files with no URLs left out of the index.
export const SITEMAP_TYPES = ['pages', 'categories', 'products', 'posts'] as const;
const PAGES: SegmentKey[] = ['production', 'about', 'contacts', 'wholesale', 'reviews', 'journal', 'delivery', 'returns', 'faq', 'care'];
// G008: the legal pages join once their final text (with its «Оновлено» date, G195) is on the site.
const LEGAL_READY = false;
const LEGAL: SegmentKey[] = ['terms', 'privacy', 'cookies'];

type Alternates = Partial<Record<Locale, string>>;
interface Row { path: string; lastmod?: string; alternates?: Alternates; images?: Array<{ loc: string; title: string }> }
interface SitemapData { products: Row[]; categories: Row[]; posts: Row[]; reviews: number }

const origin = () => (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const xml = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });

function urlset(rows: Row[]) {
  const o = origin();
  const alt = (a: Alternates | undefined) => {
    const list = Object.entries(a ?? {}).filter(([l]) => TRANSLATED_LOCALES.includes(l as Locale));
    if (list.length < 2) return '';
    const def = a?.uk ? [`<xhtml:link rel="alternate" hreflang="x-default" href="${esc(o + a.uk)}"/>`] : [];
    return list.map(([l, p]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(o + p)}"/>`).concat(def).join('');
  };
  const img = (r: Row) => (r.images ?? []).map((i) => `<image:image><image:loc>${esc(o + i.loc)}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`).join('');
  return xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${rows
    .map((u) => `  <url><loc>${esc(o + u.path)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}${alt(u.alternates)}${img(u)}</url>`)
    .join('\n')}\n</urlset>`);
}

const load = (l: Locale) => apiGet<SitemapData>('/seo/sitemap', l, { locales: TRANSLATED_LOCALES.join(',') }).then((r) => r.data);

/** Static pages of a locale; the journal only with articles, the reviews page only with reviews (G006, G100). */
function pages(l: Locale, d: SitemapData): Row[] {
  const keys = [...PAGES, ...(LEGAL_READY ? LEGAL : [])].filter((k) => (k !== 'journal' || d.posts.length > 0) && (k !== 'reviews' || d.reviews > 0));
  const every = (f: (x: Locale) => string) => Object.fromEntries(TRANSLATED_LOCALES.map((x) => [x, f(x)])) as Alternates;
  return [
    { path: path.home(l), alternates: every(path.home) },
    ...keys.map((k) => ({ path: path.seg(l, k), alternates: every((x) => path.seg(x, k)) })),
    { path: `/${l}/slovnyk`, alternates: every((x) => `/${x}/slovnyk`) }, // G095, routes.ts
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const name = new URL(request.url).pathname.slice(1);
  if (name === 'sitemap.xml') {
    const per = await Promise.all(TRANSLATED_LOCALES.map(async (l) => ({ l, d: await load(l) })));
    const files = per.flatMap(({ l, d }) => SITEMAP_TYPES.filter((t) => t === 'pages' || d[t].length > 0).map((t) => `sitemap-${t}-${l}.xml`));
    return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `  <sitemap><loc>${origin()}/${f}</loc></sitemap>`).join('\n')}\n</sitemapindex>`);
  }
  const m = /^sitemap-(pages|categories|products|posts)-(uk|en|pl|de)\.xml$/.exec(name);
  const locale = m?.[2] as Locale | undefined;
  if (!m || !locale || !TRANSLATED_LOCALES.includes(locale)) throw new Response('Not Found', { status: 404 });
  const d = await load(locale);
  if (m[1] === 'pages') return urlset(pages(locale, d));
  return urlset(d[m[1] as 'products' | 'categories' | 'posts']);
}
