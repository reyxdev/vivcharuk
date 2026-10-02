import { orderStatusLine } from '../notifications/notices';
import { prisma } from '../../lib/prisma';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { phoneUa } from '@vivcharyk/schemas';
import { requirePermission } from '../../plugins/staffAuth';
import { forbidden } from '../../lib/errors';
import * as svc from './admin-orders.service';

const statusEnum = z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']);
const list = <T extends string>(values: readonly [T, ...T[]]) => z.string().max(400).transform((s) => s.split(',').filter(Boolean)).pipe(z.array(z.enum(values)).max(20)).optional();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
const flag = z.enum(['1', 'true']).transform(() => true).optional();
const uahWhole = z.coerce.number().int().min(0).max(100_000_000).optional();

export async function adminOrderRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  // Round 20 #68–70: tabs, search, «Фільтри», sort, «load more» paging and the tab counts.
  app.get('/admin/orders', { preHandler: requirePermission('orders.read') }, async (req) => {
    const q = z.object({
      tab: z.enum(Object.keys(svc.TABS) as [svc.TabKey, ...svc.TabKey[]]).optional(),
      view: z.enum(Object.keys(svc.VIEWS) as [svc.ViewKey, ...svc.ViewKey[]]).optional(),
      q: z.string().max(80).optional(),
      page: z.coerce.number().int().min(1).max(500).default(1),
      perPage: z.coerce.number().int().min(1).max(100).default(30),
      sort: z.enum(['placedAt', 'total', 'number', 'status']).default('placedAt'),
      dir: z.enum(['asc', 'desc']).default('desc'),
      date_from: day, date_to: day,
      pay: list(['CARD', 'PREPAYMENT', 'COD_INSPECTION', 'IBAN']),
      paid: z.enum(['yes', 'no']).optional(),
      delivery: list(['NP_BRANCH', 'NP_COURIER', 'UKRPOSHTA', 'PICKUP']),
      city: z.string().max(2000).transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 30)).optional(),
      sum_from: uahWhole, sum_to: uahWhole,
      custom: flag, unconfirmed: flag, wholesale: flag,
    }).parse(req.query);
    return svc.listOrders({
      tab: q.tab ?? (q.view ? undefined : 'all'), view: q.view, q: q.q, page: q.page, perPage: q.perPage, sort: q.sort, dir: q.dir,
      dateFrom: q.date_from, dateTo: q.date_to, pay: q.pay, paid: q.paid, delivery: q.delivery, city: q.city,
      sumFrom: q.sum_from, sumTo: q.sum_to, custom: q.custom, unconfirmed: q.unconfirmed, wholesale: q.wholesale,
    });
  });

  app.get('/admin/orders/cities', { preHandler: requirePermission('orders.read') }, async () => svc.orderCities());

  app.get('/admin/orders/customer-lookup', { preHandler: requirePermission('orders.create') }, async (req) => {
    const { phone } = z.object({ phone: z.string().max(30) }).parse(req.query);
    return svc.lookupCustomer(phone);
  });

  app.get('/admin/orders/print', { preHandler: requirePermission('orders.print_documents') }, async (req) => {
    const { numbers } = z.object({ numbers: z.string().max(2000).transform((s) => [...new Set(s.split(',').map((x) => x.trim()).filter(Boolean))]).pipe(z.array(z.string().max(40)).min(1).max(50)) }).parse(req.query);
    return svc.printData(numbers);
  });

  app.get<{ Params: { number: string } }>('/admin/orders/:number', { preHandler: requirePermission('orders.read') }, async (req) => {
    const d = await svc.orderDetail(req.params.number);
    // T29: the first person to open a new order «takes» it — the others see «👀 Іван взявся» in Telegram.
    if (d.status === 'PENDING' && !d.confirmedByCallAt && !d.events.some((e) => e.type === 'taken')) {
      const who = await prisma.staffUser.findUnique({ where: { id: req.staff!.id }, select: { firstName: true } });
      await prisma.$transaction(async (tx) => {
        await tx.orderEvent.create({ data: { orderId: d.id, type: 'taken', actorId: req.staff!.id } });
        await orderStatusLine(d.id, `👀 ${who?.firstName ?? 'Хтось'} взявся за замовлення`, tx);
      });
    }
    return d;
  });

  app.post<{ Params: { number: string } }>('/admin/orders/:number/transition', { preHandler: requirePermission('orders.change_status') }, async (req) => {
    const b = z.object({
      to: statusEnum, reason: z.string().trim().max(500).optional(), trackingNumber: z.string().regex(/^\d{8,20}$/).optional(),
      notify: z.boolean().optional(),
    }).parse(req.body);
    if ((b.to === 'CANCELLED') && !req.staff!.permissions.has('orders.cancel')) throw forbidden();
    return svc.transition(req.params.number, b.to, req.staff!, b);
  });

  app.post<{ Params: { number: string } }>('/admin/orders/:number/confirm-call', { preHandler: requirePermission('orders.update') }, async (req, reply) => {
    await svc.confirmByCall(req.params.number, req.staff!);
    return reply.status(204).send();
  });

  app.post<{ Params: { number: string } }>('/admin/orders/:number/notes', { preHandler: requirePermission('orders.note') }, async (req, reply) => {
    const { text } = z.object({ text: z.string().trim().min(1).max(2000) }).parse(req.body);
    await svc.addNote(req.params.number, text, req.staff!);
    return reply.status(204).send();
  });

  // #114: «Оплату отримано» with the amount, for IBAN and prepayment sent by hand.
  app.post<{ Params: { number: string } }>('/admin/orders/:number/payment', { preHandler: requirePermission('payments.reconcile') }, async (req) => {
    const { amountMinor } = z.object({ amountMinor: z.number().int().min(100).max(1_000_000_000) }).parse(req.body);
    return svc.recordPayment(req.params.number, amountMinor, req.staff!);
  });

  // #214: a refund made by hand, written down.
  app.post<{ Params: { number: string } }>('/admin/orders/:number/refund', { preHandler: requirePermission('payments.refund') }, async (req, reply) => {
    const b = z.object({ amountMinor: z.number().int().min(100).max(1_000_000_000), method: z.enum(['CARD', 'IBAN', 'CASH']), note: z.string().trim().max(500).optional() }).parse(req.body);
    await svc.recordRefund(req.params.number, b, req.staff!);
    return reply.status(204).send();
  });

  // #111: address and contacts only.
  app.patch<{ Params: { number: string } }>('/admin/orders/:number/contact', { preHandler: requirePermission('orders.update') }, async (req) => {
    const opt = (max: number) => z.string().trim().max(max).transform((v) => v || null).nullable().optional();
    const b = z.object({
      fullName: z.string().trim().min(3).max(120).refine((v) => v.split(/\s+/).length >= 2, { message: 'FULL_NAME_TWO_WORDS' }).optional(),
      patronymic: opt(60), phone: phoneUa.optional(),
      email: z.string().trim().toLowerCase().email().max(254).nullable().optional().or(z.literal('').transform(() => null)),
      city: opt(120), warehouseLabel: opt(240), address: opt(240), postalCode: opt(10),
    }).parse(req.body);
    return svc.editContact(req.params.number, b, req.staff!);
  });
}
