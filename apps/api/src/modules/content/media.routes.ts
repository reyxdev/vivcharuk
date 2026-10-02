import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { postBody } from '@vivcharyk/schemas';
import { figureIds } from '../blog/blog.service';

// Local files are <path>-480.webp, -960.webp, -1600.webp (round 18); a video shows its poster frame.
const thumbOf = (m: { provider: string; publicId: string } | null | undefined) =>
  m && m.provider === 'local' ? `/media/${m.publicId.slice('local:'.length)}-480.webp` : null;

const PAGE = 60;

/** Article photos (D37) live inside the article body — the published text and an open draft alike. */
async function figurePosts() {
  const ids = (body: unknown) => { const r = postBody.safeParse(body); return r.success ? figureIds(r.data) : []; };
  const rows = await prisma.post.findMany({ where: { deletedAt: null }, select: { id: true, draftDocument: true, translations: { where: { locale: 'uk' }, select: { title: true, bodyJson: true } } } });
  return rows.map((p) => ({ id: p.id, title: p.translations[0]?.title ?? '', media: new Set([...ids(p.translations[0]?.bodyJson), ...ids((p.draftDocument as { body?: unknown } | null)?.body)]) }))
    .filter((p) => p.media.size > 0);
}

/**
 * «Фото й відео» (round 20 #166): one grid of every photo and video, a search by its description,
 * and «де використано» — the products, categories, production stages, articles and banners using it.
 * Uploading happens where a photo is needed (the product editor).
 */
export async function adminMediaRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/media', { preHandler: requirePermission('products.manage_media') }, async (req) => {
    const q = z.object({
      q: z.string().trim().max(100).optional(), kind: z.enum(['IMAGE', 'VIDEO']).optional(), unused: z.coerce.boolean().optional(),
      cursor: z.string().max(40).optional(),
    }).parse(req.query);
    // Poster frames are part of their video, not separate pictures.
    const posters = (await prisma.media.findMany({ where: { posterId: { not: null } }, select: { posterId: true } })).map((m) => m.posterId!);
    const figures = await figurePosts();
    const elsewhere = q.unused ? [
      ...(await prisma.banner.findMany({ select: { mediaId: true, mobileMediaId: true } })).flatMap((b) => [b.mediaId, b.mobileMediaId]),
      ...(await prisma.post.findMany({ where: { deletedAt: null }, select: { coverMediaId: true } })).map((p) => p.coverMediaId),
      ...figures.flatMap((p) => [...p.media]),
    ].filter((x): x is string => !!x) : [];
    const where: Prisma.MediaWhereInput = {
      id: { notIn: [...posters, ...elsewhere] },
      ...(q.kind ? { kind: q.kind } : {}),
      ...(q.q ? { OR: [{ translations: { some: { OR: [{ alt: { contains: q.q, mode: 'insensitive' } }, { caption: { contains: q.q, mode: 'insensitive' } }] } } }, { products: { some: { product: { OR: [{ sku: { contains: q.q, mode: 'insensitive' } }, { translations: { some: { locale: 'uk', name: { contains: q.q, mode: 'insensitive' } } } }] } } } }] } : {}),
      ...(q.unused ? { products: { none: {} }, heroForCategories: { none: {} }, variants: { none: {} }, stagePhotos: { none: {} }, stageVideos: { none: {} } } : {}),
    };
    const rows = await prisma.media.findMany({
      where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: PAGE + 1, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      include: { translations: { where: { locale: 'uk' }, select: { alt: true } }, _count: { select: { products: true, heroForCategories: true, variants: true, stagePhotos: true, stageVideos: true } } },
    });
    const page = rows.slice(0, PAGE);
    const posterRows = await prisma.media.findMany({ where: { id: { in: page.flatMap((m) => (m.posterId ? [m.posterId] : [])) } }, select: { id: true, provider: true, publicId: true } });
    const [total, banners, posts] = await Promise.all([
      prisma.media.count({ where }),
      prisma.banner.findMany({ where: { OR: [{ mediaId: { in: page.map((m) => m.id) } }, { mobileMediaId: { in: page.map((m) => m.id) } }] }, select: { mediaId: true, mobileMediaId: true } }),
      prisma.post.findMany({ where: { deletedAt: null, coverMediaId: { in: page.map((m) => m.id) } }, select: { coverMediaId: true } }),
    ]);
    return {
      total,
      items: page.map((m) => {
        const c = m._count;
        const uses = c.products + c.heroForCategories + c.variants + c.stagePhotos + c.stageVideos
          + banners.filter((b) => b.mediaId === m.id || b.mobileMediaId === m.id).length + posts.filter((p) => p.coverMediaId === m.id).length
          + figures.filter((p) => p.media.has(m.id)).length;
        return {
          id: m.id, kind: m.kind, width: m.width, height: m.height, bytes: m.bytes, durationSec: m.durationSec, createdAt: m.createdAt.toISOString(),
          alt: m.translations[0]?.alt ?? '', thumb: thumbOf(m.kind === 'VIDEO' ? posterRows.find((p) => p.id === m.posterId) : m), uses,
        };
      }),
      nextCursor: rows.length > PAGE ? page[page.length - 1]!.id : null,
    };
  });

  app.get<{ Params: { id: string } }>('/admin/media/:id/usage', { preHandler: requirePermission('products.manage_media') }, async (req) => {
    const id = req.params.id;
    const m = await prisma.media.findUnique({
      where: { id },
      include: {
        translations: { where: { locale: 'uk' } },
        products: { include: { product: { select: { id: true, sku: true, deletedAt: true, translations: { where: { locale: 'uk' }, select: { name: true } } } } } },
        heroForCategories: { select: { id: true, translations: { where: { locale: 'uk' }, select: { name: true } } } },
        variants: { select: { product: { select: { id: true, sku: true, translations: { where: { locale: 'uk' }, select: { name: true } } } } } },
        stagePhotos: { select: { key: true, translations: { where: { locale: 'uk' }, select: { title: true } } } },
        stageVideos: { select: { key: true, translations: { where: { locale: 'uk' }, select: { title: true } } } },
      },
    });
    if (!m) throw new AppError(404, 'NOT_FOUND');
    const [banners, posts, figures] = await Promise.all([
      prisma.banner.findMany({ where: { OR: [{ mediaId: id }, { mobileMediaId: id }] }, include: { translations: { where: { locale: 'uk' } } } }),
      prisma.post.findMany({ where: { deletedAt: null, coverMediaId: id }, include: { translations: { where: { locale: 'uk' }, select: { title: true } } } }),
      figurePosts(),
    ]);
    const articles = new Map(posts.map((p) => [p.id, { id: p.id, title: p.translations[0]?.title ?? '' }]));
    for (const p of figures) if (p.media.has(id)) articles.set(p.id, { id: p.id, title: p.title });
    const products = new Map<string, { id: string; name: string }>();
    for (const p of [...m.products.filter((x) => !x.product.deletedAt).map((x) => x.product), ...m.variants.map((v) => v.product)]) products.set(p.id, { id: p.id, name: p.translations[0]?.name ?? p.sku });
    return {
      id: m.id, kind: m.kind, alt: m.translations[0]?.alt ?? '', width: m.width, height: m.height,
      full: m.provider === 'local' && m.kind === 'IMAGE' ? `/media/${m.publicId.slice('local:'.length)}-1600.webp` : null,
      video: m.provider === 'local' && m.kind === 'VIDEO' ? `/media/${m.publicId.slice('local:'.length)}-720.mp4` : null,
      products: [...products.values()],
      categories: m.heroForCategories.map((c) => ({ id: c.id, name: c.translations[0]?.name ?? c.id })),
      stages: [...m.stagePhotos, ...m.stageVideos].map((s) => ({ key: s.key, title: s.translations[0]?.title ?? s.key })),
      banners: banners.map((b) => ({ id: b.id, placement: b.placement, title: b.translations[0]?.headline ?? '' })),
      posts: [...articles.values()],
    };
  });
}
