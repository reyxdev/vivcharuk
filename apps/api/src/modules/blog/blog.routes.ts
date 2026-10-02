import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { locale, postBody } from '@vivcharyk/schemas';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import * as svc from './blog.service';

export async function blogRoutes(app: FastifyInstance) {
  // ---- admin (23 §23.10) ----
  app.get('/admin/posts', { preHandler: requirePermission('blog.read') }, async (_req, reply) => { reply.header('cache-control', 'no-store'); return { items: await svc.listPosts() }; });
  app.get('/admin/post-tags', { preHandler: requirePermission('blog.read') }, async () => ({ items: (await prisma.tag.findMany({ include: { translations: { where: { locale: 'uk' } } } })).map((t) => ({ id: t.id, key: t.key, name: t.translations[0]?.name ?? t.key })) }));
  app.post('/admin/posts', { preHandler: requirePermission('blog.create') }, async (req, reply) => reply.status(201).send(await svc.createPost(z.object({ title: z.string().trim().min(3).max(160) }).parse(req.body).title, req.staff!)));
  app.get<{ Params: { id: string } }>('/admin/posts/:id', { preHandler: requirePermission('blog.read') }, async (req, reply) => { reply.header('cache-control', 'no-store'); return svc.getPost(req.params.id); });
  app.put<{ Params: { id: string } }>('/admin/posts/:id', { preHandler: requirePermission('blog.update'), bodyLimit: 2_000_000 }, async (req) => svc.savePost(req.params.id, svc.postInput.parse(req.body), req.staff!));
  app.delete<{ Params: { id: string } }>('/admin/posts/:id/draft', { preHandler: requirePermission('blog.update') }, async (req) => svc.discardDraft(req.params.id, req.staff!));
  app.post<{ Params: { id: string } }>('/admin/posts/:id/publish', { preHandler: requirePermission('blog.publish') }, async (req) => {
    const { at } = z.object({ at: z.coerce.date().nullable().default(null) }).parse(req.body ?? {});
    if (at && !req.staff!.permissions.has('blog.schedule')) throw forbidden();
    return svc.publishPost(req.params.id, at, req.staff!);
  });
  app.post<{ Params: { id: string } }>('/admin/posts/:id/status', { preHandler: requirePermission('blog.publish') }, async (req, reply) => {
    await svc.setPostStatus(req.params.id, z.object({ status: z.enum(['DRAFT', 'ARCHIVED']) }).parse(req.body).status, req.staff!);
    return reply.status(204).send();
  });

  // ---- storefront (22 §22.9; round 10 part 7 #14–15) ----
  const PUBLIC = { status: 'PUBLISHED' as const, deletedAt: null, publishedAt: { not: null } };
  app.get('/posts', async (req, reply) => {
    const q = z.object({ locale: locale.default('uk'), tag: z.string().max(80).optional(), page: z.coerce.number().int().min(1).max(100).default(1) }).parse(req.query);
    const where = { ...PUBLIC, translations: { some: { locale: q.locale } }, ...(q.tag ? { tags: { some: { tag: { translations: { some: { slug: q.tag } } } } } } : {}) };
    const [total, rows, tags] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (q.page - 1) * 12, take: 12, include: { translations: { where: { locale: q.locale } }, tags: { include: { tag: { include: { translations: { where: { locale: q.locale } } } } } } } }),
      prisma.tag.findMany({ where: { posts: { some: { post: PUBLIC } } }, include: { translations: { where: { locale: q.locale } } } }),
    ]);
    reply.header('cache-control', 'public, max-age=0, s-maxage=300');
    return {
      items: rows.map((p) => ({ slug: p.translations[0]!.slug, title: p.translations[0]!.title, excerpt: p.translations[0]!.excerpt, publishedAt: p.publishedAt!.toISOString(), readMinutes: p.readMinutes, tags: p.tags.map((t) => t.tag.translations[0]?.name ?? t.tag.key) })),
      tags: tags.flatMap((t) => (t.translations[0] ? [{ slug: t.translations[0].slug, name: t.translations[0].name }] : [])),
      page: { number: q.page, total, hasMore: q.page * 12 < total },
    };
  });

  app.get<{ Params: { slug: string } }>('/posts/:slug', async (req, reply) => {
    const { locale: l } = z.object({ locale: locale.default('uk') }).parse(req.query);
    const t = await prisma.postTranslation.findFirst({ where: { slug: req.params.slug, locale: l, post: PUBLIC }, include: { post: { include: { tags: { include: { tag: { include: { translations: { where: { locale: l } } } } } } } } } });
    if (!t) throw new AppError(404, 'NOT_FOUND');
    const body = postBody.parse(t.bodyJson);
    // Product embeds resolve live: current price, stock and the origin label (22 §22.8). partnerName is never read.
    const ids = body.blocks.flatMap((b) => (b.type === 'productEmbed' ? [b.productId] : []));
    const products = ids.length ? await prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, status: true, origin: true, partnerRegion: true, priceMinMinor: true, priceMaxMinor: true, inStock: true, translations: { where: { locale: { in: [l, 'uk'] } }, select: { locale: true, name: true, slug: true } } },
    }) : [];
    reply.header('cache-control', 'public, max-age=0, s-maxage=300');
    return {
      slug: t.slug, title: t.title, excerpt: t.excerpt, metaTitle: t.metaTitle, metaDescription: t.metaDescription, body,
      publishedAt: t.post.publishedAt!.toISOString(), updatedAt: t.post.updatedAt.toISOString(), readMinutes: t.post.readMinutes,
      tags: t.post.tags.map((x) => x.tag.translations[0]?.name ?? x.tag.key),
      products: products.map((p) => { const tr = p.translations.find((x) => x.locale === l) ?? p.translations.find((x) => x.locale === 'uk'); return { id: p.id, live: p.status === 'ACTIVE', slug: tr?.slug ?? '', name: tr?.name ?? '', origin: p.origin, partnerRegion: p.partnerRegion, priceMinMinor: p.priceMinMinor, priceMaxMinor: p.priceMaxMinor, inStock: p.inStock }; }),
    };
  });
}
