import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { getSetting, invalidateSetting } from '../../lib/settings';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import * as prom from './prom-import';

const status = z.enum(['PENDING', 'APPROVED', 'HIDDEN', 'REJECTED']);
const PAGE = 30;
const TEMPLATES_KEY = 'reviews.reply_templates';
const DEFAULT_TEMPLATES = [
  'Дякуємо, що обрали Вівчарик! Носіть із радістю.',
  'Дуже приємно це читати — дякуємо за теплі слова!',
  'Дякуємо за відгук! Будемо раді бачити вас знову.',
  'Дякуємо, що написали. Нам шкода, що так вийшло, — зателефонуйте нам, і ми все владнаємо.',
];

// Every review is moderated by Іван (round 10 part 8 #18); the dashboard counts the pending ones.
export async function adminReviewRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  // Tabs (round 20 #141–142): На перевірці · Опубліковані · Сховані; the old «Відхилені» count as hidden.
  app.get('/admin/reviews', { preHandler: requirePermission('reviews.read') }, async (req) => {
    const q = z.object({ status: status.default('PENDING'), page: z.coerce.number().int().min(1).max(200).default(1) }).parse(req.query);
    const where: Prisma.ReviewWhereInput = q.status === 'HIDDEN' || q.status === 'REJECTED' ? { status: { in: ['HIDDEN', 'REJECTED'] } } : { status: q.status };
    const [total, rows, counts] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where, orderBy: { createdAt: q.status === 'PENDING' ? 'asc' : 'desc' }, skip: (q.page - 1) * PAGE, take: PAGE,
        include: { product: { select: { sku: true, translations: { where: { locale: 'uk' }, select: { name: true, slug: true } } } } },
      }),
      prisma.review.groupBy({ by: ['status'], _count: true }),
    ]);
    const media = await prisma.media.findMany({ where: { id: { in: rows.flatMap((r) => r.mediaIds) } }, select: { id: true, provider: true, publicId: true } });
    const replier = await prisma.staffUser.findMany({ where: { id: { in: rows.map((r) => r.repliedById).filter((x): x is string => !!x) } }, select: { id: true, firstName: true } });
    const count = Object.fromEntries(counts.map((c) => [c.status, c._count]));
    return {
      items: rows.map((r) => ({
        id: r.id, authorName: r.authorName, authorEmail: r.authorEmail, rating: r.rating, title: r.title, body: r.body, status: r.status === 'REJECTED' ? 'HIDDEN' : r.status, source: r.source,
        createdAt: (r.sourceDate ?? r.createdAt).toISOString(), reply: r.reply, repliedAt: r.repliedAt?.toISOString() ?? null,
        repliedBy: replier.find((s) => s.id === r.repliedById)?.firstName ?? null, isVerifiedPurchase: r.isVerifiedPurchase,
        product: r.product ? { sku: r.product.sku, name: r.product.translations[0]?.name ?? r.product.sku, slug: r.product.translations[0]?.slug ?? null } : null,
        photos: r.mediaIds.flatMap((id) => {
          const m = media.find((x) => x.id === id);
          return m?.provider === 'local' ? [{ id, thumb: `/media/${m.publicId.slice('local:'.length)}-480.webp` }] : [];
        }),
      })),
      total, pageSize: PAGE,
      counts: { PENDING: count.PENDING ?? 0, APPROVED: count.APPROVED ?? 0, HIDDEN: (count.HIDDEN ?? 0) + (count.REJECTED ?? 0) },
    };
  });

  // Ready short replies (#224), editable.
  app.get('/admin/reviews/reply-templates', { preHandler: requirePermission('reviews.read') }, async () => ({ templates: await getSetting(TEMPLATES_KEY, DEFAULT_TEMPLATES) }));
  app.put('/admin/reviews/reply-templates', { preHandler: requirePermission('reviews.moderate') }, async (req, reply) => {
    const { templates } = z.object({ templates: z.array(z.string().trim().min(1).max(400)).max(8) }).parse(req.body);
    await prisma.setting.upsert({ where: { key: TEMPLATES_KEY }, update: { value: templates, updatedById: req.staff!.id }, create: { key: TEMPLATES_KEY, value: templates, updatedById: req.staff!.id } });
    invalidateSetting(TEMPLATES_KEY);
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'review.templates_changed', resourceType: 'Setting', resourceLabel: TEMPLATES_KEY });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/reviews/:id/status', { preHandler: requirePermission('reviews.moderate') }, async (req, reply) => {
    const b = z.object({ status: status.exclude(['PENDING']) }).parse(req.body);
    const r = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!r) throw new AppError(404, 'NOT_FOUND');
    await prisma.$transaction(async (tx) => {
      await tx.review.update({ where: { id: r.id }, data: { status: b.status } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'review.status_changed', resourceType: 'Review', resourceId: r.id, resourceLabel: r.authorName, before: { status: r.status }, after: { status: b.status } }, tx);
    });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/reviews/:id/reply', { preHandler: requirePermission('reviews.reply') }, async (req, reply) => {
    const { text } = z.object({ text: z.string().trim().max(2000) }).parse(req.body);
    const r = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!r) throw new AppError(404, 'NOT_FOUND');
    await prisma.review.update({ where: { id: r.id }, data: text ? { reply: text, repliedById: req.staff!.id, repliedAt: new Date() } : { reply: null, repliedById: null, repliedAt: null } });
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'review.replied', resourceType: 'Review', resourceId: r.id, resourceLabel: r.authorName });
    return reply.status(204).send();
  });

  // Prom import (round 13 N2): preview, then confirm. The CSV travels as text in JSON.
  const csvBody = z.object({ csv: z.string().min(1).max(2_000_000) });
  app.post('/admin/reviews/import/preview', { preHandler: requirePermission('reviews.moderate'), bodyLimit: 3_000_000 }, async (req) => ({ rows: await prom.preview(csvBody.parse(req.body).csv) }));
  app.post('/admin/reviews/import/commit', { preHandler: requirePermission('reviews.moderate'), bodyLimit: 3_000_000 }, async (req) => prom.commit(csvBody.parse(req.body).csv, req.staff!));
}
