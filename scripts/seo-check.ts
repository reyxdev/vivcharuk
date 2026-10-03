// Round 24 G187–G189: an SEO check of a running storefront, before every deploy and in CI.
//
//   BASE_URL=http://127.0.0.1:3011 npx tsx scripts/seo-check.ts [--out seo-snapshot.json] [--baseline old.json] [--max 500]
//
// Crawls every URL in the sitemap (its origin swapped for BASE_URL) and checks, per page: 200, exactly one
// <title> of 10–65 characters, a meta description of 50–160, a canonical that is the page's own absolute
// sitemap URL, exactly one <h1>, og:title and og:image, <html lang>. Prints a table and exits 1 on any
// failure. Writes a JSON snapshot of these fields (SEO drift); with --baseline, a title, description or
// canonical that existed in the baseline and is gone now is a failure too (G188).
import { readFileSync, writeFileSync } from 'node:fs';

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };
const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3011').replace(/\/$/, '');
const OUT = arg('out') ?? process.env.SEO_SNAPSHOT ?? 'seo-snapshot.json';
const BASELINE = arg('baseline');
const MAX = Number(arg('max') ?? 500);
const LIMITS = { title: [10, 65], description: [50, 160] } as const;

export interface PageSeo { url: string; status: number; title: string | null; titles: number; description: string | null; canonical: string | null; h1: number; ogTitle: boolean; ogImage: boolean; lang: string | null; robots: string | null }

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)].map((m) => [m[1]!.toLowerCase(), decode(m[2]!)]));
const tags = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => attrs(m[0]));

/** The fields we check, from raw server HTML (no JS: what a crawler sees first). */
export function parse(url: string, status: number, html: string): PageSeo {
  const head = html.split(/<body\b/i)[0] ?? html;
  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]!.trim()));
  const metas = tags(head, 'meta');
  const meta = (k: string, v: string) => metas.find((m) => m[k]?.toLowerCase() === v)?.content ?? null;
  return {
    url, status,
    title: titles[0] ?? null, titles: titles.length,
    description: meta('name', 'description'),
    canonical: tags(head, 'link').find((l) => l.rel === 'canonical')?.href ?? null,
    h1: (html.match(/<h1\b/gi) ?? []).length,
    ogTitle: !!meta('property', 'og:title'), ogImage: !!meta('property', 'og:image'),
    lang: tags(html, 'html')[0]?.lang ?? null,
    robots: meta('name', 'robots'),
  };
}

export function problems(p: PageSeo): string[] {
  const out: string[] = [];
  const len = (s: string | null) => [...(s ?? '')].length;
  if (p.status !== 200) return [`status ${p.status}`];
  if (p.titles !== 1) out.push(`${p.titles} <title>`);
  else if (len(p.title) < LIMITS.title[0] || len(p.title) > LIMITS.title[1]) out.push(`title ${len(p.title)} chars`);
  if (!p.description) out.push('no description');
  else if (len(p.description) < LIMITS.description[0] || len(p.description) > LIMITS.description[1]) out.push(`description ${len(p.description)} chars`);
  if (!p.canonical) out.push('no canonical');
  else if (p.canonical !== p.url) out.push(`canonical ${p.canonical}`);
  if (p.h1 !== 1) out.push(`${p.h1} <h1>`);
  if (!p.ogTitle) out.push('no og:title');
  if (!p.ogImage) out.push('no og:image');
  if (!p.lang) out.push('no lang');
  if (p.robots?.includes('noindex')) out.push(`robots ${p.robots}`);
  return out;
}

const local = (u: string) => { const x = new URL(u); return `${BASE}${x.pathname}${x.search}`; };
async function get(u: string) {
  const r = await fetch(local(u), { redirect: 'manual', headers: { 'user-agent': 'vivcharuk-seo-check' } });
  return { status: r.status, body: r.status === 200 ? await r.text() : '' };
}
const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]!));

async function main() {
  const index = await get(`${BASE}/sitemap.xml`);
  if (index.status !== 200) throw new Error(`sitemap.xml: ${index.status}`);
  const files = locs(index.body);
  const urls: string[] = [];
  for (const f of files) {
    const r = await get(f);
    if (r.status !== 200) { console.error(`${f}: ${r.status}`); process.exitCode = 1; continue; }
    urls.push(...locs(r.body.replace(/<image:image>[\s\S]*?<\/image:image>/g, '')));
  }
  const list = [...new Set(urls)].slice(0, MAX);
  const pages: PageSeo[] = [];
  for (let i = 0; i < list.length; i += 4) {
    pages.push(...(await Promise.all(list.slice(i, i + 4).map(async (u) => { const r = await get(u); return parse(u, r.status, r.body); }))));
  }

  const failed: Array<[string, string[]]> = [];
  const base = BASELINE ? (JSON.parse(readFileSync(BASELINE, 'utf8')) as { pages: PageSeo[] }).pages : [];
  const before = new Map(base.map((p) => [p.url, p]));
  for (const p of pages) {
    const issues = problems(p);
    const old = before.get(p.url);
    // G188: what was there at the last deploy and is gone now.
    if (old?.title && !p.title) issues.push('title disappeared');
    if (old?.description && !p.description) issues.push('description disappeared');
    if (old?.canonical && !p.canonical) issues.push('canonical disappeared');
    if (issues.length) failed.push([new URL(p.url).pathname, issues]);
  }
  for (const old of base) if (!pages.some((p) => p.url === old.url) && old.status === 200 && !old.robots?.includes('noindex')) failed.push([new URL(old.url).pathname, ['left the sitemap']]);

  const w = Math.min(60, Math.max(4, ...pages.map((p) => new URL(p.url).pathname.length)));
  console.log(`${'URL'.padEnd(w)}  ${'title'.padStart(5)}  ${'desc'.padStart(4)}  h1  result`);
  for (const p of pages) {
    const path = new URL(p.url).pathname;
    const bad = failed.find(([u]) => u === path)?.[1];
    console.log(`${path.slice(0, w).padEnd(w)}  ${String([...(p.title ?? '')].length).padStart(5)}  ${String([...(p.description ?? '')].length).padStart(4)}  ${String(p.h1).padStart(2)}  ${bad ? `FAIL: ${bad.join('; ')}` : 'ok'}`);
  }
  console.log(`\n${pages.length} pages from ${files.length} sitemap files, ${failed.length} with problems.`);
  writeFileSync(OUT, JSON.stringify({ base: BASE, at: new Date().toISOString(), pages }, null, 2));
  console.log(`Snapshot: ${OUT}`);
  if (failed.length) process.exitCode = 1;
}

if (process.argv[1]?.endsWith('seo-check.ts')) await main();
