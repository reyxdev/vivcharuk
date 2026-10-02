import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { locale, productListQuery } from '@vivcharyk/schemas';
import { catalog } from './catalog.service';
import { prisma } from '../../lib/prisma';

const CACHED = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'; // 26 §26.13.1

const localeQuery = z.object({ locale: locale.default('uk') });

function langHeaders(reply: FastifyReply, served: string, fallbackFields: string[]) {
  reply.header('content-language', fallbackFields.length ? 'uk' : served);
  if (fallbackFields.length) {
    reply.header('x-translation-fallback', 'true');
    reply.header('x-translation-fallback-fields', fallbackFields.join(','));
  }
}

/** `filter[size]=150x200,200x220` → { size: ['150x200','200x220'] } */
function parseFilters(query: Record<string, unknown>) {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(query)) {
    const m = /^filter\[([a-z_]{1,32})\]$/.exec(k);
    if (m && typeof v === 'string' && v) out[m[1]!] = v.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);
  }
  return out;
}

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/categories', async (req, reply) => {
    const { locale } = localeQuery.parse(req.query);
    reply.header('cache-control', CACHED);
    return { items: await catalog.categoryTree(locale) };
  });

  app.get('/products', async (req, reply) => {
    const raw = req.query as Record<string, unknown>;
    const q = productListQuery.parse(raw);
    const { fallback, ...res } = await catalog.listProducts(q, parseFilters(raw));
    // Every search is logged with its result count; zero-result queries are the merchandising signal (26 §26.10.2).
    if (q.q && q.page === 1) void prisma.searchQueryLog.create({ data: { query: q.q.toLowerCase().slice(0, 80), locale: q.locale, resultCount: res.page.total ?? 0 } }).catch(() => undefined);
    reply.header('cache-control', q.q ? 'public, max-age=60' : CACHED);
    langHeaders(reply, q.locale, fallback ? ['name'] : []);
    return res;
  });

  // Typeahead under the header field (round 11 #26); products with photo and price only (round 10 #11).
  app.get('/search/suggest', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { locale: l, q } = z.object({ locale: locale.default('uk'), q: z.string().trim().min(2).max(80) }).parse(req.query);
    const res = await catalog.listProducts({ locale: l, q, sort: 'relevance', page: 1, perPage: 8 }, {});
    reply.header('cache-control', 'public, max-age=60');
    return {
      products: res.items.map((i) => ({ slug: i.slug, name: i.name, priceMinMinor: i.priceMinMinor, priceMaxMinor: i.priceMaxMinor, media: i.media })),
      total: res.page.total,
    };
  });

  // Collections for the homepage row and the collection pages (round 10 part 2 #18, round 11 #65).
  app.get('/collections', async (req, reply) => {
    const { locale: l } = localeQuery.parse(req.query);
    const rows = await prisma.collection.findMany({
      where: { isActive: true }, orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: { in: [l, 'uk'] } } }, _count: { select: { products: { where: { product: { status: 'ACTIVE', deletedAt: null } } } } } },
    });
    reply.header('cache-control', CACHED);
    return { items: rows.flatMap((c) => { const t = c.translations.find((x) => x.locale === l) ?? c.translations.find((x) => x.locale === 'uk'); return t ? [{ key: c.key, slug: t.slug, name: t.name, products: c._count.products }] : []; }) };
  });

  app.get('/products/featured', async (req, reply) => {
    const { locale } = localeQuery.parse(req.query);
    reply.header('cache-control', CACHED);
    return { items: await catalog.featured(locale, 8) };
  });

  app.get<{ Params: { slug: string } }>('/products/:slug', async (req, reply) => {
    const { locale } = localeQuery.parse(req.query);
    const p = await catalog.productBySlug(req.params.slug, locale);
    reply.header('cache-control', CACHED);
    langHeaders(reply, locale, p.translationFallback);
    return p;
  });
}
