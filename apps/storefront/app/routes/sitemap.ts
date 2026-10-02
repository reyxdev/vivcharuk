import type { Locale } from '@vivcharyk/schemas';
import type { Route } from './+types/sitemap';
import { apiGet } from '@/lib/api.server';
import { path, type SegmentKey } from '@/lib/segments';
import { TRANSLATED_LOCALES } from '@/components/layout/SeoHead';

// 29 §29.9: an index plus segment files by type then locale. Only self-canonical, indexable pages
// in a really translated locale; `lastmod` only where it is truthful; no changefreq or priority.
export const SITEMAP_TYPES = ['pages', 'categories', 'products', 'posts'] as const;
// Legal pages join when counsel's text replaces the placeholder.
const PAGES: SegmentKey[] = ['production', 'about', 'contacts', 'wholesale', 'reviews', 'journal', 'delivery', 'returns', 'faq', 'care'];

const origin = () => (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const xml = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
const urlset = (urls: Array<{ loc: string; lastmod?: string }>) =>
  xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(origin() + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`);

export async function loader({ request }: Route.LoaderArgs) {
  const name = new URL(request.url).pathname.slice(1);
  if (name === 'sitemap.xml') {
    const files = TRANSLATED_LOCALES.flatMap((l) => SITEMAP_TYPES.map((t) => `sitemap-${t}-${l}.xml`));
    return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `  <sitemap><loc>${origin()}/${f}</loc></sitemap>`).join('\n')}\n</sitemapindex>`);
  }
  const m = /^sitemap-(pages|categories|products|posts)-(uk|en|pl|de)\.xml$/.exec(name);
  const locale = m?.[2] as Locale | undefined;
  if (!m || !locale || !TRANSLATED_LOCALES.includes(locale)) throw new Response('Not Found', { status: 404 });
  if (m[1] === 'pages') return urlset([{ loc: path.home(locale) }, ...PAGES.map((k) => ({ loc: path.seg(locale, k) }))]);
  const { data } = await apiGet<{ products: Array<{ path: string; lastmod: string }>; categories: Array<{ path: string; lastmod: string }>; posts: Array<{ path: string; lastmod: string }> }>('/seo/sitemap', locale);
  return urlset((m[1] === 'products' ? data.products : m[1] === 'posts' ? data.posts : data.categories).map((x) => ({ loc: x.path, lastmod: x.lastmod.slice(0, 10) })));
}
