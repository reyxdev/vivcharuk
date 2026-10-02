import type { FastifyInstance } from 'fastify';
import { DEFAULT_VOLUME_TIERS, type VolumeTier } from '@vivcharyk/schemas';
import { getSetting } from '../../lib/settings';
import { cardEnabled } from '../checkout/checkout.service';
import { prisma } from '../../lib/prisma';

// Facts the information pages state, read from the same source checkout uses so the two never
// disagree: the volume tiers (18 §18.10a, 19 §19.8) and whether card-type payments are live
// (round 14: only once the WayForPay cash register is registered). «Must not list methods that
// are not live» (16 §16.4).
export async function pricingRoutes(app: FastifyInstance) {
  app.get('/site/facts', async (_req, reply) => {
    reply.header('cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    return {
      volumeTiers: await getSetting<VolumeTier[]>('pricing.volume_tiers', DEFAULT_VOLUME_TIERS),
      cardPayments: await cardEnabled(),
    };
  });
}

// Redirects left by slug changes (23 §23.7, 25 §25.9): the storefront asks before answering 404.
export async function redirectRoutes(app: FastifyInstance) {
  app.get('/redirects/lookup', async (req, reply) => {
    const { path } = (req.query ?? {}) as { path?: string };
    if (!path || path.length > 300) return reply.status(404).send();
    const r = await prisma.redirect.findUnique({ where: { fromPath: path.replace(/\/+$/, '') } });
    if (!r) {
      // An archived product's URL leads to its category (37 §37.5), not to a dead end.
      const m = /^\/(uk|en|pl|de)\/(?:tovar|product|produkt)\/([^/]+)\/?$/.exec(path);
      if (m) {
        const t = await prisma.productTranslation.findFirst({ where: { slug: m[2], product: { status: 'ARCHIVED', deletedAt: null } }, select: { product: { select: { categories: { orderBy: { sortOrder: 'asc' }, take: 1, select: { category: { select: { parentId: true, translations: { where: { locale: m[1] as 'uk' }, select: { slug: true } }, parent: { select: { translations: { where: { locale: m[1] as 'uk' }, select: { slug: true } } } } } } } } } } } });
        const c = t?.product.categories[0]?.category;
        const own = c?.translations[0]?.slug, par = c?.parent?.translations[0]?.slug;
        if (own) return { toPath: par ? `/${m[1]}/${par}/${own}` : `/${m[1]}/${own}`, statusCode: 301 };
      }
      return reply.status(404).send();
    }
    void prisma.redirect.update({ where: { id: r.id }, data: { hitCount: { increment: 1 } } }).catch(() => undefined);
    reply.header('cache-control', 'public, max-age=300');
    return { toPath: r.toPath, statusCode: r.statusCode };
  });
}
