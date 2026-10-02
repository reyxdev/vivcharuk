import { purgeThreads } from '../mail/mail.routes';
import { randomBytes } from 'node:crypto';
import { Prisma, type OrderStatus } from '@prisma/client';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';

type Actor = { id: string; email: string };

// Orders still being handled: a correction reaches the parcel label and the receipt.
const OPEN: OrderStatus[] = ['AWAITING_QUOTE', 'PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'PACKING'];

export interface Correction { firstName?: string; lastName?: string; email?: string | null; phone?: string }

/**
 * 23 §23.8.6: correct a name, e-mail or phone taken over the phone. The buyer is keyed by phone, so
 * a new phone moves every order of theirs (and joins an existing buyer with that number). Names and
 * e-mail change in the open orders — the ones not yet shipped — and, when none is open, in the latest
 * one; an order already sent keeps the details it was sent with. The audit row names the fields,
 * never the values, so an anonymisation later leaves nothing behind in the log.
 */
export async function correct(phone: string, c: Correction, actor: Actor) {
  const orders = await prisma.order.findMany({ where: { phone }, orderBy: { placedAt: 'desc' }, select: { id: true, number: true, status: true, shippingAddress: true } });
  if (!orders.length) throw new AppError(404, 'NOT_FOUND');
  const open = orders.filter((o) => OPEN.includes(o.status));
  const targets = open.length ? open : orders.slice(0, 1);
  const fields = (['firstName', 'lastName', 'email', 'phone'] as const).filter((k) => c[k] !== undefined);
  const merged = c.phone && c.phone !== phone ? await prisma.order.count({ where: { phone: c.phone } }) : 0;
  await prisma.$transaction(async (tx) => {
    for (const o of targets) {
      const a = (o.shippingAddress ?? {}) as Record<string, unknown>;
      await tx.order.update({
        where: { id: o.id },
        data: {
          ...(c.firstName !== undefined || c.lastName !== undefined ? { shippingAddress: { ...a, ...(c.firstName !== undefined ? { firstName: c.firstName } : {}), ...(c.lastName !== undefined ? { lastName: c.lastName } : {}) } } : {}),
          ...(c.email !== undefined ? { email: c.email } : {}),
        },
      });
    }
    if (c.phone && c.phone !== phone) {
      await tx.order.updateMany({ where: { phone }, data: { phone: c.phone } });
      await tx.customer.updateMany({ where: { phone }, data: { phone: c.phone } });
    }
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'customer.corrected', resourceType: 'Customer', resourceLabel: `${orders.length} замовл.`, after: { fields, orders: targets.map((o) => o.number), phoneMovedOrders: c.phone && c.phone !== phone ? orders.length : 0, joinedExisting: merged > 0 } }, tx);
  });
  return { phone: c.phone ?? phone, orders: targets.map((o) => o.number), joinedExisting: merged > 0 };
}

const PII_KEY = /mail|phone|name|address|client|card|ip|token/i;
/** Keeps a payment payload's amounts, statuses and references; drops who paid. */
function scrub(v: Prisma.JsonValue): Prisma.JsonValue {
  if (Array.isArray(v)) return v.map(scrub);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, PII_KEY.test(k) && !/amount|status|ref|reason/i.test(k) ? null : scrub(x as Prisma.JsonValue)]));
  return v;
}

/**
 * 23 §23.8.6: the GDPR erasure path, staff-operated because there are no accounts (E12). Orders are
 * never deleted — accounting retention and the immutable item snapshots (§25.5) forbid it — so the
 * buyer is removed from them: phone replaced by an unlinkable token, e-mail, names, address, notes,
 * tracking link, attribution and the payer fields of payment payloads cleared. Amounts, items,
 * dates, statuses and fiscal receipts stay. Their reviews lose the name and e-mail; their «Купити в
 * 1 клік» requests are deleted. Refused while an order is still being handled.
 */
export async function anonymize(phone: string, actor: Actor) {
  const orders = await prisma.order.findMany({ where: { phone }, select: { id: true, number: true, status: true, email: true } });
  if (!orders.length) throw new AppError(404, 'NOT_FOUND');
  const busy = orders.filter((o) => OPEN.includes(o.status) || o.status === 'SHIPPED');
  if (busy.length) throw new AppError(409, 'VALIDATION_FAILED', 'ORDERS_OPEN', { orders: busy.map((o) => o.number) });
  const emails = [...new Set(orders.flatMap((o) => (o.email ? [o.email.toLowerCase()] : [])))];
  const token = `anon-${randomBytes(6).toString('hex')}`;
  const ids = orders.map((o) => o.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({
      where: { id: { in: ids } },
      data: { phone: token, email: null, customerId: null, guestToken: null, shippingAddress: { anonymized: true }, billingAddress: Prisma.DbNull, customerNote: null, internalNote: null, attribution: Prisma.DbNull, okContext: Prisma.DbNull },
    });
    await tx.orderEvent.updateMany({ where: { orderId: { in: ids }, type: 'note_added' }, data: { payload: { text: '[знеособлено]' } } });
    for (const p of await tx.paymentTransaction.findMany({ where: { orderId: { in: ids } }, select: { id: true, rawPayload: true } })) {
      await tx.paymentTransaction.update({ where: { id: p.id }, data: { rawPayload: scrub(p.rawPayload) as Prisma.InputJsonValue } });
    }
    // The card's own records go with the person: notes, «Обережно», addresses, the ★ оптовик mark.
    const people = await tx.customer.findMany({ where: { OR: [{ phone }, ...(emails.length ? [{ email: { in: emails } }] : [])] }, select: { id: true } });
    if (people.length) {
      await tx.review.updateMany({ where: { customerId: { in: people.map((p) => p.id) } }, data: { customerId: null } });
      await tx.customer.deleteMany({ where: { id: { in: people.map((p) => p.id) } } });
    }
    if (emails.length) await tx.mailSenderRule.deleteMany({ where: { pattern: { in: emails }, action: { in: ['VIP', 'ALLOW'] } } });
    const reviews = emails.length ? await tx.review.updateMany({ where: { authorEmail: { in: emails, mode: 'insensitive' } }, data: { authorEmail: null, authorName: 'Покупець' } }) : { count: 0 };
    const quick = await tx.quickOrderRequest.deleteMany({ where: { phone } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'customer.anonymized', resourceType: 'Customer', resourceLabel: token, after: { orders: orders.map((o) => o.number), reviews: reviews.count, quickOrders: quick.count } }, tx);
    return { orders: orders.length, reviews: reviews.count, quickOrders: quick.count };
  });
  // 2026-10-02 (developer decision): their letters in «Пошта» go too, with the stored files. The copies in
  // the Porkbun mailbox itself are not touched by the panel.
  const threads = emails.length ? await prisma.mailThread.findMany({ where: { counterpartEmail: { in: emails } }, select: { id: true } }) : [];
  await purgeThreads(threads.map((t) => t.id));
  return { ...result, token, mailThreads: threads.length };
}

/** Every e-mail the buyer gave, newest first, lower-case. */
export async function emailsOf(phone: string) {
  const rows = await prisma.order.findMany({ where: { phone, email: { not: null } }, orderBy: { placedAt: 'desc' }, select: { email: true } });
  return [...new Set(rows.map((r) => r.email!.toLowerCase()))];
}

/**
 * Round 20 #139–140: notes and «Обережно» need a `Customer` row. It is made on the first such write,
 * keyed by the phone (the buyer's key everywhere in the panel), and linked to their orders so the order
 * page can show the mark. A buyer without an e-mail (or whose e-mail already belongs to another phone's
 * row) gets a row without one.
 */
export async function ensureCustomer(phone: string) {
  const found = await prisma.customer.findFirst({ where: { phone, deletedAt: null }, orderBy: { createdAt: 'asc' } });
  if (found) return found;
  const last = await prisma.order.findFirst({ where: { phone }, orderBy: { placedAt: 'desc' }, select: { shippingAddress: true } });
  if (!last) throw new AppError(404, 'NOT_FOUND');
  const a = (last.shippingAddress ?? {}) as { firstName?: string; lastName?: string };
  const [email] = await emailsOf(phone);
  let customer = email ? await prisma.customer.findUnique({ where: { email } }) : null;
  if (customer && !customer.phone) customer = await prisma.customer.update({ where: { id: customer.id }, data: { phone } });
  else if (!customer || customer.phone !== phone) {
    const free = email && !customer ? email : null;
    customer = await prisma.customer.create({ data: { email: free, phone, firstName: a.firstName || null, lastName: a.lastName || null } });
  }
  await prisma.order.updateMany({ where: { phone, customerId: null }, data: { customerId: customer.id } });
  return customer;
}
