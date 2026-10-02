import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { locale } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { enqueue } from '../../lib/jobs';

// Round 13 N2: first name and initial only, for every source.
const shortName = (full: string) => {
  const [first = '', last = ''] = full.trim().split(/\s+/);
  return last ? `${first} ${last[0]!.toUpperCase()}.` : first;
};

const listQuery = z.object({
  locale: locale.default('uk'),
  source: z.enum(['all', 'site', 'prom']).default('all'),
  page: z.coerce.number().int().min(1).max(100).default(1),
  perPage: z.coerce.number().int().min(1).max(60).default(12),
});

const submitBody = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(200),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(3000),
  productSlug: z.string().max(120).optional(),
  website: z.string().max(0).optional(), // honeypot: humans leave it empty
});

export async function reviewRoutes(app: FastifyInstance) {
  app.get('/reviews', async (req, reply) => {
    const q = listQuery.parse(req.query);
    const where: Prisma.ReviewWhereInput = { status: 'APPROVED', ...(q.source === 'site' ? { source: 'SITE' } : q.source === 'prom' ? { source: 'PROM' } : {}) };
    const [total, rows, site, promCount] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.perPage, take: q.perPage,
        include: { product: { select: { translations: { where: { locale: { in: [q.locale, 'uk'] } }, select: { locale: true, name: true, slug: true } } } } },
      }),
      // The summary and AggregateRating come from on-site reviews only (round 13 N2).
      prisma.review.groupBy({ by: ['rating'], where: { status: 'APPROVED', source: 'SITE' }, _count: true }),
      prisma.review.count({ where: { status: 'APPROVED', source: 'PROM' } }),
    ]);
    const count = site.reduce((a, r) => a + r._count, 0);
    const sum = site.reduce((a, r) => a + r.rating * r._count, 0);
    reply.header('cache-control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=600');
    return {
      summary: {
        count, average: count ? Math.round((sum / count) * 10) / 10 : null,
        distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: site.find((r) => r.rating === star)?._count ?? 0 })),
        promCount,
      },
      items: rows.map((r) => {
        const t = r.product?.translations.find((x) => x.locale === q.locale) ?? r.product?.translations.find((x) => x.locale === 'uk');
        return {
          id: r.id, author: shortName(r.authorName), rating: r.rating, title: r.title, body: r.body,
          date: (r.sourceDate ?? r.createdAt).toISOString(), source: r.source, isVerifiedPurchase: r.isVerifiedPurchase,
          product: t ? { name: t.name, slug: t.slug } : null, reply: r.reply,
        };
      }),
      page: { number: q.page, perPage: q.perPage, total, hasMore: q.page * q.perPage < total },
    };
  });

  // Every review is moderated by Іван before it appears (round 10 part 8 #18).
  app.post('/reviews', { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (req, reply) => {
    const b = submitBody.parse(req.body);
    if (b.website) return reply.status(202).send({ status: 'PENDING' });
    let productId: string | null = null;
    if (b.productSlug) {
      const t = await prisma.productTranslation.findFirst({ where: { slug: b.productSlug, product: { status: 'ACTIVE', deletedAt: null } }, select: { productId: true } });
      if (!t) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'productSlug', code: 'NOT_FOUND' }]);
      productId = t.productId;
    }
    // Round 20 #202: a new review to check is announced in the Telegram group, in the same transaction.
    await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({ data: { productId, authorName: b.name, authorEmail: b.email.toLowerCase(), rating: b.rating, body: b.body, status: 'PENDING', source: 'SITE' } });
      await enqueue('notify.telegram', { kind: 'review', reviewId: r.id }, tx);
    });
    return reply.status(202).send({ status: 'PENDING' });
  });
}
