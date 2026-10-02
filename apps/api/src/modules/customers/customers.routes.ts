import type { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { phoneUa } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import * as svc from './customers.service';

/**
 * Клієнти (23 §23.8.6, round 20 #138–140, #222–223): order-derived — there are no customer accounts
 * (E12). The key is the phone, which every order has; e-mail is optional for ordinary `uk` orders
 * (round 10 §P5a). Marks: ★ оптовик = the mail VIP sender rule for the buyer's e-mail (the same flag
 * as in «Пошта»), «Постійний» = 3+ orders not cancelled or returned, «Обережно» = Customer.cautionReason.
 */
const PAGE = 50;
const REGULAR = 3;
const SORTS = { last: 'm.last', orders: 'm.orders', value: 'm.value', name: 'm.name' } as const;

const domainOf = (email: string) => `@${email.split('@')[1] ?? ''}`;
async function isVip(email: string | null) {
  if (!email) return false;
  return (await prisma.mailSenderRule.count({ where: { action: 'VIP', pattern: { in: [email, domainOf(email)] } } })) > 0;
}
const authorNames = async (ids: Array<string | null>) => {
  const list = ids.filter((x): x is string => !!x);
  const rows = list.length ? await prisma.staffUser.findMany({ where: { id: { in: list } }, select: { id: true, firstName: true } }) : [];
  return (id: string | null) => rows.find((r) => r.id === id)?.firstName ?? null;
};

export async function customerRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/customers', { preHandler: requirePermission('customers.read') }, async (req) => {
    const q = z.object({
      q: z.string().trim().max(80).optional(), page: z.coerce.number().int().min(1).max(500).default(1),
      marks: z.string().max(60).optional(), city: z.string().max(400).optional(),
      last_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), last_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      sort: z.enum(['last', 'orders', 'value', 'name']).default('last'), dir: z.enum(['asc', 'desc']).default('desc'),
    }).parse(req.query);
    const term = q.q ? `%${q.q.replace(/[%_]/g, '')}%` : null;
    const digits = q.q?.replace(/\D/g, '') ?? '';
    const marks = new Set(q.marks?.split(',') ?? []);
    const cities = q.city ? q.city.split(',').filter(Boolean) : [];
    const conds: Prisma.Sql[] = [];
    if (term) conds.push(Prisma.sql`(m.name ILIKE ${term} OR m.email ILIKE ${term} OR (${digits} <> '' AND length(${digits}) >= 3 AND m.phone LIKE ${'%' + digits.slice(-9) + '%'}))`);
    if (marks.has('vip')) conds.push(Prisma.sql`m.vip`);
    if (marks.has('regular')) conds.push(Prisma.sql`m.live >= ${REGULAR}`);
    if (marks.has('caution')) conds.push(Prisma.sql`m.caution IS NOT NULL`);
    if (cities.length) conds.push(Prisma.sql`m.city IN (${Prisma.join(cities)})`);
    if (q.last_from) conds.push(Prisma.sql`m.last >= ${q.last_from}::date`);
    if (q.last_to) conds.push(Prisma.sql`m.last < (${q.last_to}::date + 1)`);
    const where = conds.length ? Prisma.sql`WHERE ${Prisma.join(conds, ' AND ')}` : Prisma.empty;
    const order = Prisma.raw(`${SORTS[q.sort]} ${q.dir === 'asc' ? 'ASC' : 'DESC'} NULLS LAST, m.last DESC`);

    const rows = await prisma.$queryRaw<Array<{ phone: string; email: string | null; name: string | null; city: string | null; orders: bigint; live: bigint; value: bigint | null; last: Date; lost: bigint; vip: boolean; caution: string | null; total: bigint }>>`
      WITH c AS (
        SELECT o.phone,
          (array_agg(lower(o.email) ORDER BY o."placedAt" DESC) FILTER (WHERE o.email IS NOT NULL))[1] AS email,
          (array_agg(concat_ws(' ', o."shippingAddress"->>'lastName', o."shippingAddress"->>'firstName') ORDER BY o."placedAt" DESC))[1] AS name,
          (array_agg(o."shippingAddress"->>'city' ORDER BY o."placedAt" DESC))[1] AS city,
          count(*) AS orders,
          count(*) FILTER (WHERE o.status NOT IN ('CANCELLED', 'RETURNED')) AS live,
          sum(o."totalMinor") FILTER (WHERE o.status NOT IN ('CANCELLED', 'RETURNED')) AS value,
          max(o."placedAt") AS last,
          count(*) FILTER (WHERE o.status IN ('CANCELLED', 'RETURNED')) AS lost
        FROM "Order" o GROUP BY o.phone
      ), m AS (
        SELECT c.*,
          (c.email IS NOT NULL AND EXISTS (SELECT 1 FROM "MailSenderRule" r WHERE r.action = 'VIP' AND (r.pattern = c.email OR r.pattern = '@' || split_part(c.email, '@', 2)))) AS vip,
          (SELECT cu."cautionReason" FROM "Customer" cu WHERE cu.phone = c.phone AND cu."deletedAt" IS NULL AND cu."cautionReason" IS NOT NULL ORDER BY cu."cautionAt" DESC NULLS LAST LIMIT 1) AS caution
        FROM c
      )
      SELECT m.*, count(*) OVER () AS total FROM m ${where}
      ORDER BY ${order} LIMIT ${PAGE} OFFSET ${(q.page - 1) * PAGE}`;
    // Filter choices: the cities buyers come from most.
    const top = q.page === 1 ? await prisma.$queryRaw<Array<{ city: string }>>`
      SELECT o."shippingAddress"->>'city' AS city FROM "Order" o WHERE o."shippingAddress"->>'city' IS NOT NULL
      GROUP BY 1 ORDER BY count(DISTINCT o.phone) DESC LIMIT 30` : [];
    return {
      items: rows.map((r) => ({
        id: r.phone, phone: r.phone, email: r.email, name: r.name?.trim() || null, city: r.city, orders: Number(r.orders), valueMinor: Number(r.value ?? 0),
        lastOrderAt: r.last.toISOString(), cancelledOrReturned: Number(r.lost), vip: r.vip, regular: Number(r.live) >= REGULAR, caution: r.caution,
      })),
      total: Number(rows[0]?.total ?? 0), pageSize: PAGE, cities: top.map((t) => t.city),
    };
  });

  // The customer card (#140): orders, mail, notes, delivery addresses, reviews.
  app.get<{ Params: { phone: string } }>('/admin/customers/:phone', { preHandler: requirePermission('customers.read') }, async (req) => {
    // The key is the phone; a `Customer` id (global search links) resolves to its phone.
    const key = req.params.phone;
    const phone = /^(\+?\d|anon-)/.test(key) ? key : (await prisma.customer.findUnique({ where: { id: key }, select: { phone: true } }))?.phone ?? key;
    const orders = await prisma.order.findMany({
      where: { phone }, orderBy: { placedAt: 'desc' },
      select: { number: true, placedAt: true, status: true, totalMinor: true, paymentMethod: true, email: true, shippingAddress: true, items: { select: { nameSnapshot: true } } },
    });
    if (!orders.length) throw new AppError(404, 'NOT_FOUND');
    const live = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED');
    const value = live.reduce((a, o) => a + (o.totalMinor ?? 0), 0);
    const emails = await svc.emailsOf(phone);
    const people = await prisma.customer.findMany({ where: { phone, deletedAt: null }, orderBy: { createdAt: 'asc' }, include: { notes: { orderBy: { createdAt: 'desc' } }, addresses: true } });
    const ids = people.map((p) => p.id);
    const [threads, reviews] = await Promise.all([
      emails.length ? prisma.mailThread.findMany({ where: { counterpartEmail: { in: emails }, deletedAt: null }, orderBy: { lastMessageAt: 'desc' }, take: 30, select: { id: true, subject: true, status: true, lastMessageAt: true } }) : [],
      emails.length || ids.length ? prisma.review.findMany({
        where: { OR: [...(emails.length ? [{ authorEmail: { in: emails, mode: 'insensitive' as const } }] : []), ...(ids.length ? [{ customerId: { in: ids } }] : [])] },
        orderBy: { createdAt: 'desc' }, take: 30,
        select: { id: true, rating: true, body: true, status: true, createdAt: true, product: { select: { sku: true, translations: { where: { locale: 'uk' }, select: { name: true } } } } },
      }) : [],
    ]);
    const notes = people.flatMap((p) => p.notes).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const author = await authorNames(notes.map((n) => n.authorId));
    const caution = people.filter((p) => p.cautionReason).sort((a, b) => (b.cautionAt?.getTime() ?? 0) - (a.cautionAt?.getTime() ?? 0))[0];

    // Delivery addresses: the saved ones, then each distinct place the orders went to.
    const seen = new Set<string>();
    const addresses: Array<{ city: string | null; place: string | null; lastUsedAt: string | null }> = [];
    for (const a of people.flatMap((p) => p.addresses)) {
      const place = a.streetAddress ?? a.npWarehouseRef ?? null;
      seen.add(`${a.city}|${place}`); addresses.push({ city: a.city, place, lastUsedAt: null });
    }
    for (const o of orders) {
      const a = (o.shippingAddress ?? {}) as { city?: string | null; warehouseLabel?: string | null; address?: string | null; postalCode?: string | null };
      const place = a.warehouseLabel || [a.address, a.postalCode].filter(Boolean).join(', ');
      const key = `${a.city ?? null}|${place || null}`;
      if (seen.has(key) || (!a.city && !place)) continue;
      seen.add(key); addresses.push({ city: a.city ?? null, place: place || null, lastUsedAt: o.placedAt.toISOString() });
    }
    const latest = (orders[0]!.shippingAddress ?? {}) as { lastName?: string; firstName?: string; city?: string };
    return {
      phone, anonymized: phone.startsWith('anon-'),
      name: [latest.lastName, latest.firstName].filter(Boolean).join(' ') || null, email: emails[0] ?? null, emails, city: latest.city ?? null,
      summary: { orders: orders.length, valueMinor: value, averageMinor: live.length ? Math.round(value / live.length) : 0, cancelledOrReturned: orders.length - live.length, lastOrderAt: orders[0]!.placedAt.toISOString() },
      marks: { vip: await isVip(emails[0] ?? null), regular: live.length >= REGULAR, caution: caution ? { reason: caution.cautionReason!, at: caution.cautionAt?.toISOString() ?? null } : null },
      orders: orders.map((o) => {
        const a = (o.shippingAddress ?? {}) as { lastName?: string; firstName?: string; city?: string };
        return { number: o.number, placedAt: o.placedAt.toISOString(), status: o.status, totalMinor: o.totalMinor, email: o.email, name: [a.lastName, a.firstName].filter(Boolean).join(' '), city: a.city ?? null, items: o.items.map((i) => i.nameSnapshot).join(', ') };
      }),
      threads: threads.map((t) => ({ ...t, lastMessageAt: t.lastMessageAt.toISOString() })),
      notes: notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString(), author: author(n.authorId) })),
      addresses,
      reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, body: r.body, status: r.status, createdAt: r.createdAt.toISOString(), product: r.product ? (r.product.translations[0]?.name ?? r.product.sku) : null })),
    };
  });

  // The only write actions (23 §23.8.6). No marketing-consent toggle: the newsletter was removed
  // (round 9 part 4 #20), so no consent is ever collected.
  app.patch<{ Params: { phone: string } }>('/admin/customers/:phone', { preHandler: requirePermission('customers.update') }, async (req) => {
    const b = z.object({
      firstName: z.string().trim().min(1).max(60).optional(),
      lastName: z.string().trim().min(1).max(60).optional(),
      email: z.string().trim().toLowerCase().email().max(200).nullable().optional(),
      phone: phoneUa.optional(),
    }).parse(req.body);
    return svc.correct(req.params.phone, b, req.staff!);
  });
  app.post<{ Params: { phone: string } }>('/admin/customers/:phone/anonymize', { preHandler: requirePermission('customers.anonymize') }, async (req) => {
    z.object({ confirm: z.literal('ЗНЕОСОБИТИ') }).parse(req.body);
    return svc.anonymize(req.params.phone, req.staff!);
  });

  // Notes (#140): internal, never shown to the buyer.
  app.post<{ Params: { phone: string } }>('/admin/customers/:phone/notes', { preHandler: requirePermission('customers.update') }, async (req) => {
    const b = z.object({ body: z.string().trim().min(1).max(5000) }).parse(req.body);
    const c = await svc.ensureCustomer(req.params.phone);
    const n = await prisma.customerNote.create({ data: { customerId: c.id, authorId: req.staff!.id, body: b.body } });
    return { id: n.id };
  });
  app.delete<{ Params: { phone: string; id: string } }>('/admin/customers/:phone/notes/:id', { preHandler: requirePermission('customers.update') }, async (req, reply) => {
    const r = await prisma.customerNote.deleteMany({ where: { id: req.params.id, customer: { phone: req.params.phone } } });
    if (!r.count) throw new AppError(404, 'NOT_FOUND');
    return reply.status(204).send();
  });

  // «Обережно» with a reason (#139, #212–213, #222); `reason: null` clears it.
  app.put<{ Params: { phone: string } }>('/admin/customers/:phone/caution', { preHandler: requirePermission('customers.update') }, async (req, reply) => {
    const b = z.object({ reason: z.string().trim().min(1).max(500).nullable() }).parse(req.body);
    if (b.reason) {
      const c = await svc.ensureCustomer(req.params.phone);
      await prisma.customer.update({ where: { id: c.id }, data: { cautionReason: b.reason, cautionAt: new Date() } });
    } else {
      await prisma.customer.updateMany({ where: { phone: req.params.phone }, data: { cautionReason: null, cautionAt: null } });
    }
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: b.reason ? 'customer.caution_on' : 'customer.caution_off', resourceType: 'Customer', resourceLabel: req.params.phone });
    return reply.status(204).send();
  });

  // ★ оптовик (#139): the same VIP sender rule «Пошта» uses, for the buyer's latest e-mail.
  app.put<{ Params: { phone: string } }>('/admin/customers/:phone/wholesale', { preHandler: requirePermission('customers.update') }, async (req, reply) => {
    const b = z.object({ on: z.boolean() }).parse(req.body);
    const [email] = await svc.emailsOf(req.params.phone);
    if (!email) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'email', code: 'MISSING' }]);
    if (b.on) await prisma.mailSenderRule.upsert({ where: { pattern: email }, update: { action: 'VIP' }, create: { pattern: email, action: 'VIP', createdById: req.staff!.id } });
    else await prisma.mailSenderRule.deleteMany({ where: { pattern: email, action: 'VIP' } });
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: `mail.sender_vip_${b.on ? 'on' : 'off'}`, resourceType: 'MailSenderRule', resourceLabel: email });
    return reply.status(204).send();
  });
}
