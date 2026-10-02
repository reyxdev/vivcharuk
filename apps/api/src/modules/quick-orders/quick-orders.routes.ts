import type { FastifyInstance } from 'fastify';
import type { QuickOrderRequest } from '@prisma/client';
import { z } from 'zod';
import { phoneUa } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { enqueue } from '../../lib/jobs';

const body = z.object({
  variantId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(50).default(1),
  phone: phoneUa,
  sourcePath: z.string().max(300).optional(),
  website: z.string().max(0).optional(), // honeypot
});

const status = z.enum(['NEW', 'CALLED', 'CONVERTED', 'DECLINED', 'SPAM']);

async function present(rows: QuickOrderRequest[]) {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: rows.map((r) => r.variantId).filter((x): x is string => !!x) } },
    select: { id: true, sku: true, priceMinor: true, stockQty: true, product: { select: { id: true, translations: { where: { locale: 'uk' }, select: { name: true } } } }, options: { select: { optionValue: { select: { translations: { where: { locale: 'uk' }, select: { label: true } } } } } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  return rows.map((r) => {
    const v = r.variantId ? byId.get(r.variantId) : undefined;
    return {
      id: r.id, status: r.status, phone: r.phone, quantity: r.quantity, createdAt: r.createdAt.toISOString(), calledAt: r.calledAt?.toISOString() ?? null,
      internalNote: r.internalNote, productId: r.productId, variantId: r.variantId,
      product: v ? { name: v.product.translations[0]?.name ?? '', sku: v.sku, priceMinor: v.priceMinor, stockQty: v.stockQty, options: v.options.map((o) => o.optionValue.translations[0]?.label).filter(Boolean).join(' · ') } : null,
    };
  });
}

/**
 * «Купити в 1 клік» (round 9 §P4.1, 26 §26 quick-orders): a phone number and a call back, not an
 * order. `uk` only, stocked items only, Ukrainian numbers only. The manager then creates the real
 * order, where the prepayment rules apply unchanged.
 */
export async function quickOrderRoutes(app: FastifyInstance) {
  app.post('/quick-orders', { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (req, reply) => {
    const b = body.parse(req.body);
    if (b.website) return reply.status(202).send({ status: 'NEW' });
    const v = await prisma.productVariant.findFirst({
      where: { id: b.variantId, isActive: true, deletedAt: null, product: { status: 'ACTIVE', deletedAt: null, pricingUnit: 'PIECE' } },
      select: { id: true, productId: true, stockQty: true },
    });
    if (!v) throw new AppError(404, 'PRODUCT_NOT_FOUND');
    if (v.stockQty < b.quantity) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'quantity', code: 'NOT_IN_STOCK' }]);
    await prisma.$transaction(async (tx) => {
      const q = await tx.quickOrderRequest.create({ data: { phone: b.phone, productId: v.productId, variantId: v.id, quantity: b.quantity, locale: 'uk', sourcePath: b.sourcePath ?? null } });
      await enqueue('notify.telegram', { kind: 'quick_order', id: q.id }, tx);
    });
    return reply.status(202).send({ status: 'NEW' });
  });

  // Round 20 #60, #117–118: the «1 клік» tab of «Замовлення»; `status` may list several (NEW,CALLED).
  app.get('/admin/quick-orders', { preHandler: requirePermission('orders.read') }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const q = z.object({ status: z.string().max(60).default('NEW').transform((s) => s.split(',').filter(Boolean)).pipe(z.array(status).min(1)) }).parse(req.query);
    const [rows, counts] = await Promise.all([
      prisma.quickOrderRequest.findMany({ where: { status: { in: q.status } }, orderBy: { createdAt: q.status.includes('NEW') ? 'asc' : 'desc' }, take: 100 }),
      prisma.quickOrderRequest.groupBy({ by: ['status'], _count: true }),
    ]);
    return { items: await present(rows), counts: Object.fromEntries(counts.map((c) => [c.status, c._count])) };
  });

  app.get<{ Params: { id: string } }>('/admin/quick-orders/:id', { preHandler: requirePermission('orders.read') }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const r = await prisma.quickOrderRequest.findUnique({ where: { id: req.params.id } });
    if (!r) throw new AppError(404, 'NOT_FOUND');
    return (await present([r]))[0];
  });

  app.patch<{ Params: { id: string } }>('/admin/quick-orders/:id', { preHandler: requirePermission('orders.update') }, async (req, reply) => {
    const b = z.object({ status: status.exclude(['NEW', 'CONVERTED']).optional(), internalNote: z.string().max(2000).optional() }).parse(req.body);
    const r = await prisma.quickOrderRequest.findUnique({ where: { id: req.params.id } });
    if (!r) throw new AppError(404, 'NOT_FOUND');
    await prisma.$transaction(async (tx) => {
      await tx.quickOrderRequest.update({
        where: { id: r.id },
        data: { ...(b.status ? { status: b.status, ...(b.status === 'CALLED' && !r.calledAt ? { calledAt: new Date(), assignedToId: req.staff!.id } : {}) } : {}), ...(b.internalNote !== undefined ? { internalNote: b.internalNote } : {}) },
      });
      if (b.status) await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'quick_order.status_changed', resourceType: 'QuickOrderRequest', resourceId: r.id, before: { status: r.status }, after: { status: b.status } }, tx);
    });
    return reply.status(204).send();
  });
}
