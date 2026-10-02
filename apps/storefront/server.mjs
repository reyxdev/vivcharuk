// Production server for the storefront: static files from build/client, everything else through
// React Router's handler. Caddy sits in front (HTTPS) and sends /api and /admin to the API itself.
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

http.createServer((req, res) => {
  let file = null;
  try {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
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
  handler(req, res);
}).listen(Number(process.env.WEB_PORT ?? 3001), process.env.HOST ?? '127.0.0.1', () => {
  console.log(`storefront on http://${process.env.HOST ?? '127.0.0.1'}:${process.env.WEB_PORT ?? 3001}`);
});
