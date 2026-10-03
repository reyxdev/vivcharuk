import type { FastifyInstance } from 'fastify';
import type { Locale } from '@prisma/client';
import { z } from 'zod';
import { locale } from '@vivcharyk/schemas';
import { prisma } from '../../lib/prisma';
import { PUBLIC_PRODUCT, productVisibleIn, visibleIn } from '../catalog/catalog.repository';
import { photoUrl } from '../products/media';
import { COLLECTIONS_SEG, JOURNAL_SEG, LOCALES, PRODUCT_SEG } from './segments';

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

  // Only self-canonical, indexable pages with a real translation in this locale (29 §29.9). `locales`: the
  // locales the site serves (the storefront's ENABLED_LOCALES), for the hreflang alternates of each URL.
  app.get('/seo/sitemap', async (req, reply) => {
    const q = z.object({ locale: locale.default('uk'), locales: z.string().max(40).optional() }).parse(req.query);
    const others = [...new Set((q.locales ?? '').split(',').map((x) => x.trim()))].filter((x): x is Locale => (LOCALES as string[]).includes(x) && x !== q.locale);
    const [own, ...rest] = await Promise.all([q.locale, ...others].map(sitemapEntries));
    const withAlt = <T extends { path: string }>(kind: 'products' | 'categories' | 'posts', rows: Map<string, T>) =>
      [...rows].map(([id, row]) => {
        const alternates: Partial<Record<Locale, string>> = { [q.locale]: row.path };
        others.forEach((l, i) => { const p = rest[i]![kind].get(id)?.path; if (p) alternates[l] = p; });
        return { ...row, alternates };
      });
    reply.header('cache-control', 'public, max-age=0, s-maxage=3600');
    return {
      products: withAlt('products', own!.products),
      categories: withAlt('categories', own!.categories),
      posts: withAlt('posts', own!.posts),
      // G100: the reviews page joins the sitemap once it has reviews.
      reviews: await prisma.review.count({ where: { status: 'APPROVED' } }),
    };
  });
}

type Entry = { path: string; lastmod: string };

/**
 * Sitemap rows of one locale, keyed by entity id so the locales can be paired for hreflang.
 * Round 24: a category is listed only with at least one public product in itself or a descendant
 * (G004), its lastmod is the latest publish of those products or its own change, whichever is later
 * (G007); products carry their photos for the image sitemap (G035).
 */
export async function sitemapEntries(l: Locale) {
  const [products, categories, links, collections, posts] = await Promise.all([
    prisma.productTranslation.findMany({
      where: { locale: l, product: { ...PUBLIC_PRODUCT, ...productVisibleIn(l) } },
      select: { slug: true, name: true, productId: true, product: { select: { publishedAt: true, media: { orderBy: { position: 'asc' }, select: { media: { select: { publicId: true, kind: true, translations: { where: { locale: l }, select: { alt: true } } } } } } } } },
    }),
    prisma.category.findMany({ where: { isActive: true, deletedAt: null, ...visibleIn(l) }, select: { id: true, parentId: true, updatedAt: true, translations: { where: { locale: l }, select: { slug: true } } } }),
    prisma.productCategory.findMany({ where: { product: { ...PUBLIC_PRODUCT, ...productVisibleIn(l) } }, select: { categoryId: true, productId: true, product: { select: { publishedAt: true } } } }),
    prisma.collection.findMany({ where: { isActive: true, products: { some: { product: PUBLIC_PRODUCT } } }, include: { translations: { where: { locale: l } } } }),
    prisma.postTranslation.findMany({ where: { locale: l, post: { status: 'PUBLISHED', deletedAt: null } }, select: { slug: true, postId: true, post: { select: { updatedAt: true } } } }),
  ]);
  // lastmod = the last publish: draft autosaves touch updatedAt without changing the live page.
  const ids = [...new Set([...products.map((p) => p.productId), ...links.map((x) => x.productId)])];
  const revs = await prisma.productRevision.groupBy({ by: ['productId'], where: { productId: { in: ids }, publishedAt: { not: null } }, _max: { publishedAt: true } });
  const lastPublish = new Map(revs.map((r) => [r.productId, r._max.publishedAt]));
  const productDate = (id: string, publishedAt: Date | null) => lastPublish.get(id) ?? publishedAt;

  const out = { products: new Map<string, Entry & { images: Array<{ loc: string; title: string }> }>(), categories: new Map<string, Entry>(), posts: new Map<string, Entry>() };
  for (const p of products) {
    const images = p.product.media.flatMap((m) => {
      const loc = m.media.kind === 'IMAGE' ? photoUrl(m.media.publicId, 1600) : null;
      return loc ? [{ loc, title: m.media.translations[0]?.alt || p.name }] : [];
    });
    out.products.set(p.productId, { path: `/${l}/${PRODUCT_SEG[l]}/${p.slug}`, lastmod: (productDate(p.productId, p.product.publishedAt) ?? new Date()).toISOString(), images });
  }

  // Products of each category, then of each subtree.
  const byId = new Map(categories.map((c) => [c.id, c]));
  const children = new Map<string, string[]>();
  for (const c of categories) if (c.parentId) children.set(c.parentId, [...(children.get(c.parentId) ?? []), c.id]);
  const own = new Map<string, Array<{ id: string; at: Date | null }>>();
  for (const x of links) own.set(x.categoryId, [...(own.get(x.categoryId) ?? []), { id: x.productId, at: productDate(x.productId, x.product.publishedAt) }]);
  const subtree = (id: string): Array<{ id: string; at: Date | null }> => [...(own.get(id) ?? []), ...(children.get(id) ?? []).flatMap(subtree)];
  for (const c of categories) {
    const slug = c.translations[0]?.slug;
    const parent = c.parentId ? byId.get(c.parentId) : null;
    if (!slug || (c.parentId && !parent?.translations[0])) continue;
    const items = subtree(c.id);
    if (!items.length) continue;
    const last = Math.max(c.updatedAt.getTime(), ...items.map((x) => x.at?.getTime() ?? 0));
    out.categories.set(c.id, { path: parent ? `/${l}/${parent.translations[0]!.slug}/${slug}` : `/${l}/${slug}`, lastmod: new Date(last).toISOString() });
  }
  for (const c of collections) if (c.translations[0]) out.categories.set(c.id, { path: `/${l}/${COLLECTIONS_SEG[l]}/${c.translations[0].slug}`, lastmod: c.updatedAt.toISOString() });
  for (const p of posts) out.posts.set(p.postId, { path: `/${l}/${JOURNAL_SEG[l]}/${p.slug}`, lastmod: p.post.updatedAt.toISOString() });
  return out;
}
