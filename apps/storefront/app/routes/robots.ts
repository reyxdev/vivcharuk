import { ENABLED_LOCALES } from '@/lib/locale';
import { SEGMENTS } from '@/lib/segments';

// robots.txt is a versioned file, never an admin setting (29 §29.10). A crawler obeys only the most
// specific group that names it, so the closed paths are repeated in every group — otherwise a named bot
// with `Allow: /` would ignore them.
// Round 24 G016–G018: every AI crawler may read the public pages (30 §30.9). Agents a person sends
// (ChatGPT-User, Claude-User, Perplexity-User) may also go through checkout, the order page and the
// wishlist to buy for that person; those pages are noindex on their own. Service paths stay closed to all.
const SERVICE = ['/admin/', '/api/', '/*?*utm_', '/*?*gclid', '/*?*fbclid'];
const uniq = (key: 'checkout' | 'order' | 'wishlist', suffix = '') => [...new Set(ENABLED_LOCALES.map((l) => `/*/${SEGMENTS[key][l]}${suffix}`))];
const PURCHASE = [...uniq('checkout'), ...uniq('order', '/'), ...uniq('wishlist')];
const CRAWLERS = ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot', 'GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', '*'];
const USER_AGENTS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User'];

const group = (agents: string[], closed: string[]) => [...agents.map((a) => `User-agent: ${a}`), 'Allow: /', ...closed.map((p) => `Disallow: ${p}`)].join('\n');

export function loader() {
  const origin = (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
  const groups = [group(USER_AGENTS, SERVICE), ...CRAWLERS.map((a) => group([a], [...SERVICE.slice(0, 2), ...PURCHASE, ...SERVICE.slice(2)]))];
  const body = `${groups.join('\n\n')}\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
