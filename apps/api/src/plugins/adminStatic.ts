import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from '../config';

export const ADMIN_ROOT = fileURLToPath(new URL('../../../admin/dist/', import.meta.url));
export const adminBase = config.adminBasePath.replace(/\/$/, '');

// The admin SPA is served by the same process on the same origin (27 §27.14): the refresh cookie
// stays first-party with SameSite=Strict and no CORS exists. `no-store` for the whole path.
// Unknown /admin/* paths fall through to the not-found handler, which serves index.html.
export async function adminStatic(app: FastifyInstance) {
  if (!existsSync(ADMIN_ROOT)) return;
  await app.register(fastifyStatic, {
    root: ADMIN_ROOT,
    prefix: `${adminBase}/`,
    cacheControl: false,
    setHeaders: (res) => res.setHeader('cache-control', 'no-store'),
  });
  app.get(adminBase, (_req, reply) => reply.redirect(`${adminBase}/`));
}
