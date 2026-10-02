// robots.txt is a versioned file, never an admin setting (29 §29.10). AI agents are allowed
// (30 §30.9). A crawler obeys only the most specific group that names it, so the closed paths are
// repeated in every group — otherwise a named bot with `Allow: /` would ignore them.
const CLOSED = ['/admin/', '/api/', '/*/oformlennia', '/*/zamovlennia/', '/*/koshyk', '/*/obrane', '/*?*utm_', '/*?*gclid', '/*?*fbclid'];
const AGENTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-User', 'GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', '*'];

export function loader() {
  const origin = (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
  const groups = AGENTS.map((a) => [`User-agent: ${a}`, 'Allow: /', ...CLOSED.map((p) => `Disallow: ${p}`)].join('\n'));
  const body = `${groups.join('\n\n')}\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
