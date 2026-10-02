import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createOrderInput, deliveryMethod } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { addItem, getOrCreateCart, viewCart } from '../cart/cart.service';
import * as checkout from '../checkout/checkout.service';

const lines = z.array(z.object({ variantId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(500) })).min(1).max(50);

/**
 * An order created by staff after a call (round 9 §P4.1: «the manager calls, then creates the real
 * order in the admin and sends the buyer a payment link»). The lines go through a throwaway cart
 * so prices, the volume discount, payment methods and the prepayment floor are computed by exactly
 * the code the storefront uses — nothing is re-implemented here.
 */
async function withCart<T>(items: z.infer<typeof lines>, fn: (cartId: string) => Promise<T>) {
  const cart = await getOrCreateCart(undefined, 'uk');
  try {
    for (const l of items) await addItem(cart.id, { variantId: l.variantId, quantityMilli: l.quantity * 1000 });
    return await fn(cart.id);
  } finally {
    await prisma.cart.delete({ where: { id: cart.id } }).catch(() => undefined);
  }
}

export async function adminCreateOrderRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/variants', { preHandler: requirePermission('orders.create') }, async (req) => {
    const { q } = z.object({ q: z.string().trim().min(2).max(80) }).parse(req.query);
    const rows = await prisma.productVariant.findMany({
      where: {
        isActive: true, deletedAt: null, product: { status: 'ACTIVE', deletedAt: null, pricingUnit: 'PIECE' },
        OR: [{ sku: { contains: q, mode: 'insensitive' } }, { product: { translations: { some: { locale: 'uk', name: { contains: q, mode: 'insensitive' } } } } }],
      },
      take: 20, orderBy: { sku: 'asc' },
      select: { id: true, sku: true, priceMinor: true, stockQty: true, madeToOrderDays: true, product: { select: { translations: { where: { locale: 'uk' }, select: { name: true } } } }, options: { select: { optionValue: { select: { translations: { where: { locale: 'uk' }, select: { label: true } } } } } } },
    });
    return { items: rows.map((v) => ({ id: v.id, sku: v.sku, priceMinor: v.priceMinor, stockQty: v.stockQty, madeToOrderDays: v.madeToOrderDays, name: v.product.translations[0]?.name ?? v.sku, options: v.options.map((o) => o.optionValue.translations[0]?.label).filter(Boolean).join(' · ') })) };
  });

  app.post('/admin/orders/quote', { preHandler: requirePermission('orders.create') }, async (req) => {
    const b = z.object({ lines, delivery: deliveryMethod }).parse(req.body);
    return withCart(b.lines, async (cartId) => ({ ...(await checkout.quote(cartId, 'uk', b.delivery)), cart: await viewCart(cartId, 'uk') }));
  });

  app.post('/admin/orders', { preHandler: requirePermission('orders.create') }, async (req, reply) => {
    // The buyer did not tick the offer box on the site; they accept it at payment, where the order page
    // states «Оплачуючи, ви погоджуєтеся з умовами оферти» beside the button.
    const b = z.object({ lines, order: createOrderInput.omit({ termsAccepted: true }), quickOrderId: z.string().max(40).optional() }).parse(req.body);
    const quick = b.quickOrderId ? await prisma.quickOrderRequest.findUnique({ where: { id: b.quickOrderId } }) : null;
    if (b.quickOrderId && (!quick || quick.status === 'CONVERTED')) throw new AppError(409, 'VALIDATION_FAILED', 'QUICK_ORDER_NOT_OPEN');
    const res = await withCart(b.lines, (cartId) => checkout.createOrder(cartId, 'uk', { ...b.order, termsAccepted: true }, `staff-${randomUUID()}`));
    const order = await prisma.order.findUniqueOrThrow({ where: { number: res.number }, select: { id: true } });
    await prisma.$transaction(async (tx) => {
      // The manager has just spoken to the buyer: the call confirmation is recorded with the order.
      await tx.order.update({ where: { id: order.id }, data: { confirmedByCallAt: new Date(), confirmedByCallById: req.staff!.id } });
      await tx.orderEvent.create({ data: { orderId: order.id, type: 'created_by_staff', actorId: req.staff!.id, payload: quick ? { quickOrderId: quick.id } : undefined } });
      if (quick) await tx.quickOrderRequest.update({ where: { id: quick.id }, data: { status: 'CONVERTED', orderId: order.id, calledAt: quick.calledAt ?? new Date() } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'order.created_by_staff', resourceType: 'Order', resourceId: order.id, resourceLabel: res.number }, tx);
    });
    return reply.status(201).send({ ...res, payLink: `${config.siteUrl}/uk/zamovlennia/${res.guestToken}` });
  });
}
