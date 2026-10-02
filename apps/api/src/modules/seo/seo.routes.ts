import type { FastifyInstance } from 'fastify';
import type { Locale } from '@prisma/client';
import { z } from 'zod';
import { locale } from '@vivcharyk/schemas';
import { prisma } from '../../lib/prisma';
import { PUBLIC_PRODUCT, productVisibleIn, visibleIn } from '../catalog/catalog.repository';

const LOCALES: Locale[] = ['uk', 'en', 'pl', 'de'];
const PRODUCT_SEG: Record<Locale, string> = { uk: 'tovar', en: 'product', pl: 'produkt', de: 'produkt' };
const JOURNAL_SEG: Record<Locale, string> = { uk: 'zhurnal', en: 'journal', pl: 'magazyn', de: 'journal' };
const COLLECTIONS_SEG: Record<Locale, string> = { uk: 'kolektsii', en: 'collections', pl: 'kolekcje', de: 'kollektionen' };

/**
 * Hreflang and sitemap data (29 §29.3, §29.9). A locale counts only where a real translation row
 * exists — a page served from the `uk` fallback is never annotated as translated (rule 6).
 */
export async function seoRoutes(app: FastifyInstance) {
  app.get('/seo/alternates', async (req, reply) => {
    const q = z.object({ kind: z.enum(['product', 'category']), slug: z.string().max(160), locale: locale.default('uk') }).parse(req.query);
    const out: Partial<Record<Locale, string>> = {};
    if (q.kind === 'product') {
      const t = await prisma.productTranslation.findFirst({ where: { slug: q.slug, locale: { in: [q.locale, 'uk'] } }, select: { productId: true } });
      if (t) {
        const rows = await prisma.productTranslation.findMany({ where: { productId: t.productId, product: PUBLIC_PRODUCT }, select: { locale: true, slug: true } });
        for (const r of rows) {
          if (!(await prisma.product.count({ where: { id: t.productId, ...productVisibleIn(r.locale) } }))) continue;
          out[r.locale] = `/${r.locale}/${PRODUCT_SEG[r.locale]}/${r.slug}`;
        }
      }
    } else {
      const t = await prisma.categoryTranslation.findFirst({ where: { slug: q.slug, locale: { in: [q.locale, 'uk'] } }, select: { categoryId: true } });
      const c = t && (await prisma.category.findUnique({ where: { id: t.categoryId }, include: { translations: true, parent: { include: { translations: true } } } }));
      if (c && c.isActive && !c.deletedAt) {
        for (const l of LOCALES) {
          if (c.hiddenLocales.includes(l)) continue;
          const own = c.translations.find((x) => x.locale === l);
          const par = c.parent ? c.parent.translations.find((x) => x.locale === l) : null;
          if (!own || (c.parent && !par)) continue;
          out[l] = par ? `/${l}/${par.slug}/${own.slug}` : `/${l}/${own.slug}`;
        }
      }
    }
    reply.header('cache-control', 'public, max-age=0, s-maxage=300');
    return { alternates: out };
  });

  // Only self-canonical, indexable pages with a real translation in this locale (29 §29.9).
  app.get('/seo/sitemap', async (req, reply) => {
    const { locale: l } = z.object({ locale: locale.default('uk') }).parse(req.query);
    const [products, categories, collections, posts] = await Promise.all([
      prisma.productTranslation.findMany({ where: { locale: l, product: { ...PUBLIC_PRODUCT, ...productVisibleIn(l) } }, select: { slug: true, productId: true, product: { select: { publishedAt: true } } } }),
      prisma.category.findMany({ where: { isActive: true, deletedAt: null, ...visibleIn(l) }, include: { translations: { where: { locale: l } }, parent: { include: { translations: { where: { locale: l } } } } } }),
      prisma.collection.findMany({ where: { isActive: true, products: { some: { product: PUBLIC_PRODUCT } } }, include: { translations: { where: { locale: l } } } }),
      prisma.postTranslation.findMany({ where: { locale: l, post: { status: 'PUBLISHED', deletedAt: null } }, select: { slug: true, post: { select: { updatedAt: true } } } }),
    ]);
    // lastmod = the last publish: draft autosaves touch updatedAt without changing the live page.
    const revs = await prisma.productRevision.groupBy({ by: ['productId'], where: { productId: { in: products.map((p) => p.productId) }, publishedAt: { not: null } }, _max: { publishedAt: true } });
    const lastPublish = new Map(revs.map((r) => [r.productId, r._max.publishedAt]));
    reply.header('cache-control', 'public, max-age=0, s-maxage=3600');
    return {
      posts: posts.map((p) => ({ path: `/${l}/${JOURNAL_SEG[l]}/${p.slug}`, lastmod: p.post.updatedAt.toISOString() })),
      products: products.map((p) => ({ path: `/${l}/${PRODUCT_SEG[l]}/${p.slug}`, lastmod: (lastPublish.get(p.productId) ?? p.product.publishedAt ?? new Date()).toISOString() })),
      categories: categories.flatMap((c) => {
        const own = c.translations[0];
        if (!own || (c.parent && (!c.parent.isActive || !c.parent.translations[0]))) return [];
        return [{ path: c.parent ? `/${l}/${c.parent.translations[0]!.slug}/${own.slug}` : `/${l}/${own.slug}`, lastmod: c.updatedAt.toISOString() }];
      }).concat(collections.flatMap((c) => (c.translations[0] ? [{ path: `/${l}/${COLLECTIONS_SEG[l]}/${c.translations[0].slug}`, lastmod: c.updatedAt.toISOString() }] : []))),
    };
  });
}
