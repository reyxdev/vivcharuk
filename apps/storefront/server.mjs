// Production server for the storefront: static files from build/client, everything else through
// React Router's handler. Caddy sits in front (HTTPS) and sends /api, /admin, /media and /feed to the API.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestListener } from '@react-router/node';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLIENT = path.join(here, 'build/client');
const build = await import(path.join(here, 'build/server/index.js'));
const handler = createRequestListener({ build, mode: 'production' });

const TYPES = {
  '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain',
};

// Round 24 G022: the IndexNow key file at the root, only while a key is set.
const INDEXNOW_KEY = /^[A-Za-z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY ?? '') ? process.env.INDEXNOW_KEY : '';

// Round 24 G009–G010: one address per page. Capitals 301 to lower case (an order page's token keeps its
// case) and the slash form is fixed: `/uk/` for a locale's home, no trailing slash anywhere else. Data
// requests (`.data`) are left alone: React Router drops the slash in them itself.
const ORDER_SEGMENTS = new Set(['zamovlennia', 'order', 'moje-zamowienie', 'bestellung']);
function canonicalPath(pathname) {
  if (pathname === '/' || pathname.endsWith('.data') || pathname.startsWith('/assets/') || pathname.startsWith('/.well-known/')) return null;
  const parts = pathname.split('/').slice(1);
  const order = ORDER_SEGMENTS.has((parts[1] ?? '').toLowerCase());
  let out = '/' + parts.map((p, i) => (order && i > 1 ? p : p.toLowerCase())).join('/');
  if (/^\/[a-z]{2}$/.test(out)) out += '/';
  else if (out.length > 1 && out.endsWith('/') && !/^\/[a-z]{2}\/$/.test(out)) out = out.replace(/\/+$/, '') || '/';
  return out === pathname ? null : out;
}

// Round 24 G041: anonymous HTML is kept for 60 s, so a burst of visitors costs one render. Never for
// checkout, order, search, wishlist, newsletter or payment pages, never with the cart or a staff cookie,
// never a response that sets a cookie or is not a plain 200 HTML page. Purged by time only (60 s).
const TTL = 60_000;
const MAX_ENTRIES = 300;
const NO_CACHE = new Set([
  'oformlennia', 'checkout', 'zamowienie', 'kasse', ...ORDER_SEGMENTS, 'poshuk', 'search', 'szukaj', 'suche',
  'obrane', 'wishlist', 'ulubione', 'merkliste', 'rozsylka', 'newsletter', 'oplatyty', 'pay', 'zaplac', 'bezahlen',
]);
const cache = new Map();
function cacheKey(req) {
  if (req.method !== 'GET' || /(?:^|;\s*)(vk_cart|vk_staff_rt)=/.test(req.headers.cookie ?? '')) return null;
  const url = req.url ?? '/';
  const [p] = url.split('?');
  const parts = p.split('/');
  if (!/^[a-z]{2}$/.test(parts[1] ?? '') || p.endsWith('.data') || NO_CACHE.has(parts[2] ?? '')) return null;
  return url;
}
function serveCached(key, res) {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.at > TTL) { if (hit) cache.delete(key); return false; }
  res.writeHead(200, { ...hit.headers, 'x-cache': 'HIT', age: String(Math.floor((Date.now() - hit.at) / 1000)) });
  res.end(hit.body);
  return true;
}
function capture(key, res) {
  let status = 0, headers = {};
  const chunks = [];
  const writeHead = res.writeHead.bind(res), write = res.write.bind(res), end = res.end.bind(res);
  res.writeHead = (s, h) => {
    status = s;
    if (Array.isArray(h)) for (let i = 0; i < h.length; i += 2) headers[String(h[i]).toLowerCase()] = h[i + 1];
    else if (h) headers = Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));
    return writeHead(s, h);
  };
  res.write = (c, ...rest) => { if (c) chunks.push(Buffer.from(c)); return write(c, ...rest); };
  res.end = (c, ...rest) => {
    if (c && typeof c !== 'function') chunks.push(Buffer.from(c));
    if (status === 200 && !res.destroyed && !headers['set-cookie'] && String(headers['content-type'] ?? '').startsWith('text/html')) {
      if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
      cache.set(key, { at: Date.now(), headers, body: Buffer.concat(chunks) });
    }
    return end(c, ...rest);
  };
}

http.createServer((req, res) => {
  let file = null;
  const raw = (req.url ?? '/').split('?')[0];
  if (INDEXNOW_KEY && raw === `/${INDEXNOW_KEY}.txt`) {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' });
    res.end(INDEXNOW_KEY);
    return;
  }
  try {
    const url = decodeURIComponent(raw);
    const f = path.join(CLIENT, url);
    if (url !== '/' && f.startsWith(CLIENT + path.sep) && fs.statSync(f, { throwIfNoEntry: false })?.isFile()) file = { f, url };
  } catch { /* a malformed URL goes to the router, which answers 404 */ }
  if (file) {
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file.f)] ?? 'application/octet-stream',
      // Hashed build assets never change; everything else in public/ may.
      'cache-control': file.url.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    });
    fs.createReadStream(file.f).pipe(res);
    return;
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    const to = canonicalPath(raw);
    if (to) {
      const q = (req.url ?? '').indexOf('?');
      res.writeHead(301, { location: to + (q >= 0 ? req.url.slice(q) : ''), 'cache-control': 'public, max-age=3600' });
      res.end();
      return;
    }
  }
  const key = cacheKey(req);
  if (key) {
    if (serveCached(key, res)) return;
    capture(key, res);
  }
  handler(req, res);
}).listen(Number(process.env.WEB_PORT ?? 3001), process.env.HOST ?? '127.0.0.1', () => {
  console.log(`storefront on http://${process.env.HOST ?? '127.0.0.1'}:${process.env.WEB_PORT ?? 3001}`);
});
