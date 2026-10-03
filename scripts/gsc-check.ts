// Strict Google Search Console readiness check (2026-10-03): every URL in the sitemaps must be crawlable,
// indexable and self-canonical, with valid structured data — so submitting sitemap.xml shows no errors.
//   BASE_URL=http://127.0.0.1:3011 ORIGIN=https://vivcharuk.com npx tsx scripts/gsc-check.ts
// BASE_URL is where to fetch; ORIGIN is the public origin the pages must name (canonical, sitemap <loc>).
// Exits 1 on any error; warnings are printed but do not fail.
const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3011').replace(/\/$/, '');
const ORIGIN = (process.env.ORIGIN ?? BASE).replace(/\/$/, '');
const AUTH = process.env.BASIC_AUTH ? { authorization: `Basic ${Buffer.from(process.env.BASIC_AUTH).toString('base64')}` } : {};
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, what: string) => errors.push(`${where}  ${what}`);
const warn = (where: string, what: string) => warnings.push(`${where}  ${what}`);
const local = (u: string) => (u.startsWith(ORIGIN) ? BASE + u.slice(ORIGIN.length) : u);
const get = (u: string, method = 'GET') => fetch(local(u), { method, redirect: 'manual', headers: { 'user-agent': UA, ...AUTH } });

// ---------- robots.txt (Googlebot group, longest-match rule as Google applies it) ----------
type Rule = { allow: boolean; path: string };
function robotsRules(txt: string, agent: string): Rule[] {
  const groups: Array<{ agents: string[]; rules: Rule[] }> = [];
  let cur: { agents: string[]; rules: Rule[] } | null = null;
  let lastWasAgent = false;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, v] = m as unknown as [string, string, string];
    const key = k.toLowerCase();
    if (key === 'user-agent') { if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false;
    if (cur && (key === 'allow' || key === 'disallow') && v) cur.rules.push({ allow: key === 'allow', path: v });
  }
  const own = groups.filter((g) => g.agents.includes(agent.toLowerCase()));
  return (own.length ? own : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules);
}
function allowed(rules: Rule[], path: string) {
  const match = (p: string) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$')).test(path);
  let best: Rule | null = null;
  for (const r of rules) if (match(r.path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  return !best || best.allow;
}

// ---------- tiny XML helpers (sitemaps are generated, not hand-written) ----------
const tags = (xml: string, name: string) => [...xml.matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'g'))].map((m) => m[1]!.trim());
const W3C = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

async function main() {
  const robotsRes = await get(`${ORIGIN}/robots.txt`);
  if (robotsRes.status !== 200) { err('/robots.txt', `status ${robotsRes.status}`); return; }
  const robots = await robotsRes.text();
  const google = robotsRules(robots, 'googlebot');
  const googleImg = robotsRules(robots, 'googlebot-image');
  const sitemapLines = [...robots.matchAll(/^sitemap:\s*(\S+)/gim)].map((m) => m[1]!);
  if (!sitemapLines.length) err('/robots.txt', 'no Sitemap: line');
  for (const s of sitemapLines) if (!s.startsWith(`${ORIGIN}/`)) err('/robots.txt', `Sitemap not on ${ORIGIN}: ${s}`);

  const indexUrl = sitemapLines[0] ?? `${ORIGIN}/sitemap.xml`;
  const idx = await get(indexUrl);
  if (idx.status !== 200) { err(indexUrl, `status ${idx.status}`); return; }
  if (!/xml/.test(idx.headers.get('content-type') ?? '')) err(indexUrl, `content-type ${idx.headers.get('content-type')}`);
  const indexXml = await idx.text();
  const children = tags(indexXml, 'loc');
  if (!/<sitemapindex[\s>]/.test(indexXml)) warn(indexUrl, 'not a sitemap index (single sitemap)');

  type Entry = { loc: string; alternates: Record<string, string>; images: string[]; file: string };
  const entries: Entry[] = [];
  for (const file of /<sitemapindex[\s>]/.test(indexXml) ? children : [indexUrl]) {
    if (!file.startsWith(`${ORIGIN}/`)) err(indexUrl, `child sitemap not on ${ORIGIN}: ${file}`);
    const r = await get(file);
    if (r.status !== 200) { err(file, `status ${r.status}`); continue; }
    const xml = await r.text();
    if (!/xml/.test(r.headers.get('content-type') ?? '')) err(file, `content-type ${r.headers.get('content-type')}`);
    if (xml.length > 50 * 1024 * 1024) err(file, 'over 50 MB');
    const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]!);
    if (!blocks.length) err(file, 'no <url> entries (empty sitemaps should not be listed)');
    if (blocks.length > 50000) err(file, 'over 50,000 URLs');
    for (const b of blocks) {
      const loc = tags(b, 'loc')[0] ?? '';
      const lastmod = tags(b, 'lastmod')[0];
      if (lastmod && (!W3C.test(lastmod) || Date.parse(lastmod) > Date.now() + 86400000)) err(loc, `bad lastmod ${lastmod}`);
      const alternates = Object.fromEntries([...b.matchAll(/<xhtml:link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => [m[1]!, m[2]!]));
      const images = [...b.matchAll(/<image:loc>([\s\S]*?)<\/image:loc>/g)].map((m) => m[1]!.trim());
      entries.push({ loc, alternates, images, file });
    }
  }
  const locs = entries.map((e) => e.loc);
  for (const d of locs.filter((l, i) => locs.indexOf(l) !== i)) err(d, 'listed twice in the sitemaps');

  // ---------- every URL ----------
  const seenTitles = new Map<string, string>();
  const imagesToCheck = new Set<string>();
  let n = 0;
  for (const e of entries) {
    n++;
    const where = e.loc.replace(ORIGIN, '');
    if (!e.loc.startsWith(`${ORIGIN}/`)) { err(e.loc, `loc not on ${ORIGIN}`); continue; }
    const path = new URL(e.loc).pathname + new URL(e.loc).search;
    if (!allowed(google, path)) err(where, 'blocked by robots.txt for Googlebot');
    const r = await get(e.loc);
    if (r.status !== 200) { err(where, `status ${r.status}${r.headers.get('location') ? ` → ${r.headers.get('location')}` : ''}`); continue; }
    const xr = r.headers.get('x-robots-tag') ?? '';
    if (/noindex|none/i.test(xr)) err(where, `X-Robots-Tag: ${xr}`);
    if (!/text\/html/.test(r.headers.get('content-type') ?? '')) err(where, `content-type ${r.headers.get('content-type')}`);
    const html = await r.text();
    const metaRobots = /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i.exec(html)?.[1] ?? '';
    if (/noindex|none/i.test(metaRobots)) err(where, `meta robots ${metaRobots}`);
    const canon = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(html)?.[1];
    if (!canon) err(where, 'no canonical'); else if (canon !== e.loc) err(where, `canonical ${canon} ≠ loc`);
    const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? '';
    if (!title) err(where, 'no <title>');
    else if (seenTitles.has(title) && !Object.values(e.alternates).includes(seenTitles.get(title)!)) warn(where, `same title as ${seenTitles.get(title)}`);
    else seenTitles.set(title, e.loc);
    if (!/<meta[^>]+name="description"[^>]+content="[^"]{20,}"/i.test(html)) err(where, 'no meta description');
    const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
    if (h1 !== 1) warn(where, `${h1} h1`);
    if (/\bundefined\b|\[object Object\]|\bNaN\b/.test(html.replace(/<script[\s\S]*?<\/script>/gi, ''))) err(where, 'undefined/NaN/[object Object] in visible HTML');
    // hreflang: page alternates must match the sitemap and point back.
    const pageAlt = Object.fromEntries([...html.matchAll(/<link[^>]+rel="alternate"[^>]+hrefLang="([^"]+)"[^>]+href="([^"]+)"/gi)].map((m) => [m[1]!.toLowerCase(), m[2]!]));
    for (const [l, href] of Object.entries(e.alternates)) {
      if (pageAlt[l.toLowerCase()] !== href) err(where, `hreflang ${l} in sitemap (${href}) differs from the page (${pageAlt[l.toLowerCase()] ?? 'missing'})`);
      if (l !== 'x-default' && href !== e.loc && !locs.includes(href)) err(where, `hreflang ${l} target not in the sitemaps: ${href}`);
    }
    // JSON-LD: parses, and the shapes Google reports on are complete.
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      let data: unknown;
      try { data = JSON.parse(m[1]!); } catch { err(where, 'JSON-LD does not parse'); continue; }
      const nodes: Array<Record<string, unknown>> = [];
      const walk = (x: unknown) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { nodes.push(x as Record<string, unknown>); Object.values(x).forEach(walk); } };
      walk(data);
      for (const node of nodes) {
        const type = ([] as unknown[]).concat(node['@type'] ?? []).map(String);
        if (type.includes('Product') && !node['@id']?.toString().includes('#variant') && (node.offers || node.name)) {
          if (!node.name) err(where, 'Product without name');
          if (!node.image) err(where, `Product «${node.name}» without image`);
          const offers = ([] as Array<Record<string, unknown>>).concat((node.offers as Record<string, unknown>) ?? []);
          if (!offers.length) err(where, `Product «${node.name}» without offers`);
          for (const o of offers) {
            if (o['@type'] === 'AggregateOffer') { if (o.lowPrice == null || !o.priceCurrency) err(where, 'AggregateOffer without lowPrice/priceCurrency'); continue; }
            if (o.price == null || Number.isNaN(Number(o.price)) || !o.priceCurrency) err(where, `Offer without numeric price/priceCurrency (${JSON.stringify(o).slice(0, 80)})`);
            if (!o.availability) warn(where, 'Offer without availability');
          }
          if (!node.shippingDetails && !offers.some((o) => o.shippingDetails)) warn(where, 'no shippingDetails (Merchant listings warning; waits for Іван’s rates)');
        }
        if (type.includes('ProductGroup')) {
          const v = ([] as Array<Record<string, unknown>>).concat((node.hasVariant as Record<string, unknown>) ?? []);
          if (!v.length) err(where, 'ProductGroup without hasVariant');
          if (!node.productGroupID) warn(where, 'ProductGroup without productGroupID');
          for (const x of v) { const o = x.offers as Record<string, unknown> | undefined; if (!o || o.price == null || !o.priceCurrency) err(where, `variant ${x.sku ?? '?'} without price`); }
        }
        if (type.includes('BreadcrumbList')) {
          const items = (node.itemListElement as Array<Record<string, unknown>>) ?? [];
          if (!items.length) err(where, 'empty BreadcrumbList');
          items.forEach((it, i) => { if (it.position !== i + 1) err(where, 'BreadcrumbList positions not 1..n'); if (!it.name) err(where, 'BreadcrumbList item without name'); if (i < items.length - 1 && !it.item) err(where, 'BreadcrumbList item without item URL'); });
        }
        if (type.includes('AggregateRating')) {
          const rv = Number(node.ratingValue), rc = Number(node.reviewCount ?? node.ratingCount);
          if (!(rv >= 1 && rv <= 5) || !(rc >= 1)) err(where, `AggregateRating invalid (${node.ratingValue}/${node.reviewCount ?? node.ratingCount})`);
        }
        if (type.includes('ItemList') && Array.isArray(node.itemListElement) && !node.itemListElement.length) err(where, 'empty ItemList');
        if (type.includes('FAQPage') && !((node.mainEntity as unknown[]) ?? []).length) err(where, 'FAQPage without questions');
      }
    }
    for (const img of e.images) {
      imagesToCheck.add(img);
      if (!img.startsWith(`${ORIGIN}/`)) err(where, `image not on ${ORIGIN}: ${img}`);
    }
    if (n % 25 === 0) process.stderr.write(`  ${n}/${entries.length} pages\n`);
  }

  // ---------- images in the image sitemap ----------
  for (const img of imagesToCheck) {
    const p = new URL(img).pathname;
    if (!allowed(googleImg, p)) err(img, 'blocked by robots.txt for Googlebot-Image');
    const r = await get(img, 'HEAD');
    if (r.status !== 200) err(img, `status ${r.status}`);
    else if (!/^image\//.test(r.headers.get('content-type') ?? '')) err(img, `content-type ${r.headers.get('content-type')}`);
  }

  console.log(`${entries.length} URLs in ${children.length || 1} sitemap file(s), ${imagesToCheck.size} images.`);
  for (const w of warnings) console.log(`warning  ${w}`);
  for (const e of errors) console.log(`ERROR    ${e}`);
  console.log(`${errors.length} errors, ${warnings.length} warnings.`);
}

await main();
process.exit(errors.length ? 1 : 0);
