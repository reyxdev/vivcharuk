import { orderStatusLine, STATUS_LINE } from '../notifications/notices';
import { Prisma, type OrderStatus } from '@prisma/client';
import { randomToken } from '../../lib/crypto';
import { enqueue } from '../../lib/jobs';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { paymentKey } from './orders.service';

type Actor = { id: string | null; email: string };

// Not paid at all: neither the order nor any transaction says PAID.
const UNPAID: Prisma.OrderWhereInput = { paymentStatus: { not: 'PAID' }, payments: { none: { status: 'PAID' } } };
const PAID: Prisma.OrderWhereInput = { OR: [{ paymentStatus: 'PAID' }, { payments: { some: { status: 'PAID' } } }] };

// Saved views of the earlier panel; the dashboard still counts `attention` and `awaiting_payment`.
export const VIEWS = {
  attention: { label: 'Потребують уваги', where: { status: 'PENDING', confirmedByCallAt: null } },
  awaiting_payment: { label: 'Очікують оплати', where: { status: { in: ['PENDING', 'CONFIRMED'] }, paymentStatus: 'UNPAID', payments: { none: { status: 'PAID' } } } },
  in_production: { label: 'У виробництві', where: { status: 'IN_PRODUCTION' } },
  to_ship: { label: 'До відправки', where: { status: 'PACKING' } },
  shipped: { label: 'Відправлені', where: { status: 'SHIPPED' } },
  all: { label: 'Усі', where: {} },
} satisfies Record<string, { label: string; where: Prisma.OrderWhereInput }>;
export type ViewKey = keyof typeof VIEWS;

// Round 20 #68: the order tabs. «Відправити» = packing, or confirmed and not waiting for money (#181).
export const TABS = {
  new: { status: 'PENDING' },
  awaiting_payment: VIEWS.awaiting_payment.where,
  in_production: { status: 'IN_PRODUCTION' },
  to_ship: { OR: [{ status: 'PACKING' }, { status: 'CONFIRMED', NOT: { paymentStatus: 'UNPAID', payments: { none: { status: 'PAID' } } } }] },
  shipped: { status: 'SHIPPED' },
  done: { status: { in: ['DELIVERED', 'CANCELLED', 'RETURNED'] } },
  all: {},
} satisfies Record<string, Prisma.OrderWhereInput>;
export type TabKey = keyof typeof TABS;
const COUNTED: TabKey[] = ['new', 'awaiting_payment', 'in_production', 'to_ship', 'shipped'];

export interface ListOpts {
  tab?: TabKey; view?: ViewKey; q?: string; page: number; perPage: number;
  sort: 'placedAt' | 'total' | 'number' | 'status'; dir: 'asc' | 'desc';
  dateFrom?: string; dateTo?: string; pay?: string[]; paid?: 'yes' | 'no'; delivery?: string[]; city?: string[];
  sumFrom?: number; sumTo?: number; custom?: boolean; unconfirmed?: boolean; wholesale?: boolean;
}

/** Midnight in Kyiv for a YYYY-MM-DD date, as an instant. */
function kyivMidnight(d: string, addDays = 0) {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number];
  const utc = Date.UTC(y, m - 1, day + addDays);
  const tz = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Kyiv', timeZoneName: 'shortOffset' }).formatToParts(new Date(utc)).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+2';
  const mm = /GMT([+-])(\d+)(?::(\d+))?/.exec(tz);
  const off = mm ? (mm[1] === '-' ? -1 : 1) * (Number(mm[2]) * 60 + Number(mm[3] ?? 0)) : 120;
  return new Date(utc - off * 60_000);
}

const PAY_WHERE: Record<string, Prisma.OrderWhereInput> = {
  CARD: { paymentMethod: 'CARD_ONLINE', prepaymentMinor: null },
  PREPAYMENT: { paymentMethod: 'CARD_ONLINE', prepaymentMinor: { not: null } },
  COD_INSPECTION: { paymentMethod: 'COD' },
  IBAN: { paymentMethod: 'BANK_TRANSFER' },
};

/** Search and the «Фільтри» groups (#69), shared by the list and the tab counts. */
function filterWhere(o: ListOpts): Prisma.OrderWhereInput[] {
  const and: Prisma.OrderWhereInput[] = [];
  if (o.q?.trim()) {
    const q = o.q.trim();
    const digits = q.replace(/\D/g, '');
    and.push({ OR: [
      { number: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { trackingNumber: { contains: q } },
      ...(digits.length >= 5 ? [{ phone: { contains: digits.slice(-9) } }] : []),
      { shippingAddress: { path: ['lastName'], string_contains: q } },
      { shippingAddress: { path: ['firstName'], string_contains: q } },
    ] });
  }
  if (o.dateFrom) and.push({ placedAt: { gte: kyivMidnight(o.dateFrom) } });
  if (o.dateTo) and.push({ placedAt: { lt: kyivMidnight(o.dateTo, 1) } });
  if (o.pay?.length) and.push({ OR: o.pay.map((p) => PAY_WHERE[p]).filter((x): x is Prisma.OrderWhereInput => !!x) });
  if (o.paid) and.push(o.paid === 'yes' ? PAID : UNPAID);
  if (o.delivery?.length) and.push({ OR: o.delivery.map((m) => ({ shippingAddress: { path: ['method'], equals: m } })) });
  if (o.city?.length) and.push({ OR: o.city.map((c) => ({ shippingAddress: { path: ['city'], equals: c } })) });
  if (o.sumFrom !== undefined) and.push({ totalMinor: { gte: o.sumFrom * 100 } });
  if (o.sumTo !== undefined) and.push({ totalMinor: { lte: o.sumTo * 100 } });
  if (o.custom) and.push({ items: { some: { customSpec: { not: Prisma.DbNull } } } });
  if (o.unconfirmed) and.push({ confirmedByCallAt: null, status: { notIn: ['DELIVERED', 'CANCELLED', 'RETURNED'] } });
  if (o.wholesale) and.push({ volumeTierPercent: { not: null } });
  return and;
}

type Addr = { method?: string; lastName?: string; firstName?: string; patronymic?: string | null; city?: string | null; cityRef?: string | null; warehouseRef?: string | null; warehouseLabel?: string | null; address?: string | null; postalCode?: string | null; company?: { name: string; edrpou: string } | null };
const addrOf = (a: unknown) => (a ?? {}) as Addr;
const name = (a: unknown) => { const x = addrOf(a); return [x.lastName, x.firstName].filter(Boolean).join(' '); };
type Spec = { widthCm: number; lengthCm: number };
type Opts = Record<string, { label: string }>;

const itemLine = (i: { customSpec: unknown; nameSnapshot: string; quantityMilli: number; pricingUnitSnapshot: string; optionsSnapshot: unknown }) => {
  const s = i.customSpec as Spec | null;
  const size = s ? `${s.widthCm}×${s.lengthCm}` : (i.optionsSnapshot as Opts).size?.label;
  const q = i.pricingUnitSnapshot === 'PIECE' && i.quantityMilli > 1000 ? ` ×${i.quantityMilli / 1000}` : '';
  return [i.nameSnapshot, size].filter(Boolean).join(' ') + q;
};

/** Customers marked «Обережно» (#213), matched by phone (an order's customerId is not reliable). */
async function cautions(phones: string[]) {
  if (!phones.length) return [];
  return prisma.customer.findMany({
    where: { cautionReason: { not: null }, deletedAt: null, phone: { in: phones } },
    orderBy: { cautionAt: 'desc' },
    select: { phone: true, cautionReason: true, cautionAt: true },
  });
}

export async function listOrders(opts: ListOpts) {
  const filters = filterWhere(opts);
  const base: Prisma.OrderWhereInput = opts.tab ? TABS[opts.tab] : VIEWS[opts.view ?? 'all'].where;
  const where: Prisma.OrderWhereInput = { AND: [base, ...filters] };
  const dir = opts.dir;
  const orderBy: Prisma.OrderOrderByWithRelationInput[] =
    opts.sort === 'total' ? [{ totalMinor: { sort: dir, nulls: 'last' } }, { placedAt: 'desc' }]
    : opts.sort === 'number' ? [{ number: dir }]
    : opts.sort === 'status' ? [{ status: dir }, { placedAt: 'desc' }]
    : [{ placedAt: dir }];

  const [total, rows, counts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where, orderBy, skip: (opts.page - 1) * opts.perPage, take: opts.perPage,
      select: {
        number: true, placedAt: true, status: true, paymentStatus: true, paymentMethod: true, prepaymentMinor: true, volumeTierPercent: true,
        totalMinor: true, phone: true, email: true, shippingAddress: true, shippingCarrier: true, trackingNumber: true, confirmedByCallAt: true, expectedDispatchAt: true,
        items: { select: { customSpec: true, nameSnapshot: true, quantityMilli: true, pricingUnitSnapshot: true, optionsSnapshot: true } },
        payments: { where: { status: 'PAID' }, select: { amountMinor: true } },
      },
    }),
    // Counts on the tabs (#242), for the same search and filters.
    Promise.all(COUNTED.map(async (k) => [k, await prisma.order.count({ where: { AND: [TABS[k], ...filters] } })] as const)),
  ]);
  const careful = await cautions([...new Set(rows.map((r) => r.phone))]);
  return {
    items: rows.map((o) => {
      const a = addrOf(o.shippingAddress);
      const paidMinor = o.payments.reduce((s, p) => s + p.amountMinor, 0);
      const c = careful.find((x) => x.phone === o.phone);
      return {
        id: o.number,
        number: o.number,
        placedAt: o.placedAt.toISOString(),
        status: o.status,
        paymentStatus: o.paymentStatus,
        payment: paymentKey(o),
        paid: o.paymentStatus === 'PAID' || paidMinor > 0,
        paidMinor,
        totalMinor: o.totalMinor,
        customer: name(o.shippingAddress),
        phone: o.phone,
        city: a.city ?? null,
        delivery: a.method ?? null,
        carrier: o.shippingCarrier,
        trackingNumber: o.trackingNumber,
        hasCustomSize: o.items.some((i) => i.customSpec !== null),
        wholesale: o.volumeTierPercent !== null,
        itemsSummary: o.items.map(itemLine).join(' · '),
        confirmedByCall: !!o.confirmedByCallAt,
        expectedDispatchAt: o.expectedDispatchAt?.toISOString() ?? null,
        caution: c?.cautionReason ?? null,
      };
    }),
    page: { number: opts.page, perPage: opts.perPage, total, totalPages: Math.max(1, Math.ceil(total / opts.perPage)), hasMore: opts.page * opts.perPage < total },
    counts: Object.fromEntries(counts) as Record<string, number>,
  };
}

/** Cities that orders went to, most frequent first — the «Місто» filter list. */
export async function orderCities() {
  const rows = await prisma.$queryRaw<Array<{ city: string; n: bigint }>>`
    SELECT o."shippingAddress"->>'city' AS city, count(*) AS n FROM "Order" o
    WHERE o."shippingAddress"->>'city' IS NOT NULL AND o."shippingAddress"->>'city' <> ''
    GROUP BY 1 ORDER BY n DESC, city ASC LIMIT 40`;
  return { items: rows.map((r) => ({ city: r.city, count: Number(r.n) })) };
}

/** 40 px thumbnails (#115): the item's own snapshot, else the product's first photo. */
async function thumbs(items: Array<{ variantId: string | null; imageUrlSnapshot: string | null }>) {
  const ids = [...new Set(items.filter((i) => !i.imageUrlSnapshot && i.variantId).map((i) => i.variantId!))];
  const vs = ids.length ? await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    select: { id: true, product: { select: { media: { take: 1, orderBy: { position: 'asc' }, select: { media: { select: { publicId: true, provider: true } } } } } } },
  }) : [];
  const map = new Map(vs.map((v) => {
    const m = v.product.media[0]?.media;
    return [v.id, m?.provider === 'local' ? `/media/${m.publicId.slice('local:'.length)}-480.webp` : null];
  }));
  return (i: { variantId: string | null; imageUrlSnapshot: string | null }) => i.imageUrlSnapshot ?? (i.variantId ? map.get(i.variantId) ?? null : null);
}

async function actorNames(ids: Array<string | null>) {
  const list = [...new Set(ids.filter((x): x is string => !!x))];
  const staff = list.length ? await prisma.staffUser.findMany({ where: { id: { in: list } }, select: { id: true, firstName: true } }) : [];
  return new Map(staff.map((s) => [s.id, s.firstName]));
}

export async function orderDetail(number: string) {
  const o = await prisma.order.findUnique({
    where: { number },
    include: {
      items: true,
      events: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      fiscalReceipts: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!o) throw new AppError(404, 'NOT_FOUND');
  // 23 §23.8.6: «this caller has ordered four times before» changes how the call goes.
  const [history, careful, thumb, names] = await Promise.all([
    prisma.order.aggregate({ where: { phone: o.phone, NOT: { id: o.id } }, _count: true, _sum: { totalMinor: true } }),
    cautions([o.phone]),
    thumbs(o.items),
    actorNames(o.events.map((e) => e.actorId)),
  ]);
  const paidMinor = o.payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amountMinor, 0);
  const refundedMinor = o.events.filter((e) => e.type === 'refund_recorded').reduce((s, e) => s + ((e.payload as { amountMinor?: number } | null)?.amountMinor ?? 0), 0);
  return {
    ...o,
    items: o.items.map((i) => ({ ...i, thumb: thumb(i) })),
    events: o.events.map((e) => ({ ...e, actor: e.actorId ? names.get(e.actorId) ?? null : null })),
    customerHistory: { previousOrders: history._count, previousValueMinor: history._sum.totalMinor ?? 0 },
    payment: paymentKey(o),
    paidMinor,
    refundedMinor,
    customer: name(o.shippingAddress),
    hasCustomSize: o.items.some((i) => i.customSpec !== null),
    caution: careful[0] ? { reason: careful[0].cautionReason!, at: careful[0].cautionAt?.toISOString() ?? null } : null,
    transitions: legalTransitions(o),
  };
}

type Guarded = { status: OrderStatus; paymentStatus: string; paymentMethod: string; prepaymentMinor: number | null; confirmedByCallAt: Date | null; trackingNumber: string | null; shippingCarrier?: string; items: Array<{ customSpec: unknown }>; payments?: Array<{ status: string }> };
type Needs = 'call' | 'payment' | 'ttn';

/** Only legal transitions are offered (23 §23.8.2), each with the reason it is blocked, if it is. */
export function legalTransitions(o: Guarded) {
  const custom = o.items.some((i) => i.customSpec !== null);
  const paidSomething = o.paymentStatus === 'PAID' || (o.payments ?? []).some((p) => p.status === 'PAID');
  const out: Array<{ to: OrderStatus; label: string; blockedBy?: string; needs?: Needs }> = [];
  const add = (to: OrderStatus, label: string, block?: [Needs, string]) => out.push({ to, label, ...(block ? { needs: block[0], blockedBy: block[1] } : {}) });
  const call: [Needs, string] = ['call', 'Спершу підтвердіть дзвінком'];
  switch (o.status) {
    case 'PENDING': {
      // Card, prepayment and the COD deposit are paid online first; an IBAN invoice is reconciled by staff.
      const payOk = o.paymentMethod === 'BANK_TRANSFER' || paidSomething;
      add('CONFIRMED', 'Підтвердити', !o.confirmedByCallAt ? call : !payOk ? ['payment', 'Оплата ще не надійшла'] : undefined);
      break;
    }
    case 'CONFIRMED':
      // Round 20 #209: «Виготовляти» for a custom size, else «Пакувати».
      if (custom) add('IN_PRODUCTION', 'Виготовляти');
      else add('PACKING', 'Пакувати', !o.confirmedByCallAt ? call : undefined);
      break;
    case 'IN_PRODUCTION':
      add('PACKING', 'Готово, пакувати');
      break;
    case 'PACKING':
      // Pickup in Яворів has no parcel: the buyer takes it from the hands.
      if (o.shippingCarrier === 'PICKUP') add('DELIVERED', 'Покупець забрав');
      else add('SHIPPED', 'Відправлено', !o.trackingNumber ? ['ttn', 'Потрібен номер ТТН'] : undefined);
      break;
    case 'SHIPPED':
      add('DELIVERED', 'Отримано');
      // #212: a parcel nobody collected comes back.
      add('RETURNED', 'Не забрали, повернулось');
      break;
    case 'DELIVERED':
      add('RETURNED', 'Повернення');
      break;
  }
  if (!['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.status)) add('CANCELLED', 'Скасувати');
  return out;
}

export async function transition(number: string, to: OrderStatus, actor: Actor, extra: { reason?: string; trackingNumber?: string; notify?: boolean }) {
  return prisma.$transaction(async (tx) => {
    const o = await tx.order.findUnique({ where: { number }, include: { items: true, payments: true } });
    if (!o) throw new AppError(404, 'NOT_FOUND');
    if (extra.trackingNumber && to === 'SHIPPED') o.trackingNumber = extra.trackingNumber;
    const t = legalTransitions(o).find((x) => x.to === to);
    if (!t) throw new AppError(409, 'VALIDATION_FAILED', 'TRANSITION_NOT_ALLOWED', { from: o.status, to });
    if (t.blockedBy) throw new AppError(409, 'VALIDATION_FAILED', t.blockedBy, { from: o.status, to });
    if ((to === 'CANCELLED' || to === 'RETURNED') && !extra.reason?.trim()) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'reason', code: 'REQUIRED' }]);

    const custom = o.items.some((i) => i.customSpec !== null);
    let next: OrderStatus = to;
    const data: Prisma.OrderUpdateInput = {};
    // CONFIRMED → IN_PRODUCTION is automatic for any custom-size line; the dispatch date is stamped once.
    if (to === 'CONFIRMED' && custom) next = 'IN_PRODUCTION';
    if (next === 'IN_PRODUCTION' && !o.expectedDispatchAt) data.expectedDispatchAt = new Date(Date.now() + 14 * 86_400_000);
    if (to === 'SHIPPED') { data.shippedAt = new Date(); if (extra.trackingNumber) data.trackingNumber = extra.trackingNumber; }
    if (to === 'DELIVERED') {
      data.deliveredAt = new Date();
      // COD: the return deposit is credited exactly once, here, by a conditional write (23 §23.8.3b).
      if (o.paymentMethod === 'COD' && o.depositAppliedMinor === 0 && o.shippingReturnDepositMinor) data.depositAppliedMinor = o.shippingReturnDepositMinor;
    }
    if (to === 'CANCELLED' || to === 'RETURNED') {
      if (to === 'CANCELLED') data.cancelledAt = new Date();
      // Stock goes back for everything that was taken from the shelf (37 §37.6).
      const back = o.items.filter((i) => i.variantId && !i.customSpec);
      for (const i of back) {
        const units = i.pricingUnitSnapshot === 'PIECE' ? i.quantityMilli / 1000 : Math.ceil(i.quantityMilli / 1000);
        await tx.productVariant.update({ where: { id: i.variantId! }, data: { stockQty: { increment: units } } });
        await tx.stockMovement.create({ data: { variantId: i.variantId!, delta: units, source: 'CANCELLATION', orderId: o.id, reason: extra.reason ?? null, createdById: actor.id } });
      }
    }
    const res = await tx.order.updateMany({ where: { id: o.id, status: o.status }, data: { ...(data as Prisma.OrderUpdateManyMutationInput), status: next } });
    if (res.count !== 1) throw new AppError(409, 'VALIDATION_FAILED', 'CONCURRENT_UPDATE');
    await tx.orderEvent.create({ data: { orderId: o.id, type: 'status_changed', fromValue: o.status, toValue: next, actorId: actor.id, payload: extra.reason || extra.trackingNumber ? { ...(extra.reason ? { reason: extra.reason } : {}), ...(extra.trackingNumber ? { trackingNumber: extra.trackingNumber } : {}) } : undefined } });
    // #113: the TTN letter goes unless the person unticked it.
    if (next === 'SHIPPED' && o.email && extra.notify !== false) await enqueue('mail.send', { kind: 'order_shipped', orderId: o.id }, tx);
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'order.status_changed', resourceType: 'Order', resourceId: o.id, resourceLabel: o.number, before: { status: o.status }, after: { status: next } }, tx);
    // Telegram (T28): the step under the order's notices; a cancellation is also announced to the others (T22).
    const who = actor.id ? (await tx.staffUser.findUnique({ where: { id: actor.id }, select: { firstName: true } }))?.firstName : null;
    await orderStatusLine(o.id, `${STATUS_LINE[next] ?? next}${who ? ` — ${who}` : ''}${next === 'SHIPPED' && extra.trackingNumber ? `, ТТН ${extra.trackingNumber}` : ''}`, tx);
    if (next === 'CANCELLED') await enqueue('notify.telegram', { kind: 'cancel', orderId: o.id, reason: extra.reason, byStaffId: actor.id }, tx);
    return { status: next };
  });
}

async function find(number: string) {
  const o = await prisma.order.findUnique({ where: { number } });
  if (!o) throw new AppError(404, 'NOT_FOUND');
  return o;
}

export async function confirmByCall(number: string, actor: { id: string; email: string }) {
  const o = await find(number);
  if (o.confirmedByCallAt) return;
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: o.id }, data: { confirmedByCallAt: new Date(), confirmedByCallById: actor.id } });
    await tx.orderEvent.create({ data: { orderId: o.id, type: 'confirmed_by_call', actorId: actor.id } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'order.confirmed_by_call', resourceType: 'Order', resourceId: o.id, resourceLabel: o.number }, tx);
    const who = (await tx.staffUser.findUnique({ where: { id: actor.id }, select: { firstName: true } }))?.firstName;
    await orderStatusLine(o.id, `📞 Підтверджено дзвінком${who ? ` — ${who}` : ''}`, tx);
  });
}

export async function addNote(number: string, text: string, actor: { id: string; email: string }) {
  const o = await find(number);
  await prisma.orderEvent.create({ data: { orderId: o.id, type: 'note_added', actorId: actor.id, payload: { text } } });
}

/**
 * «Оплату отримано» (#114) for money that arrived outside the card gateway — an IBAN transfer or a
 * prepayment sent by hand. Recorded as a manual PaymentTransaction, like the gateway's own, so every
 * «paid» check in the code sees it. No fiscal receipt: ПРРО applies to card payments (round 14).
 */
export async function recordPayment(number: string, amountMinor: number, actor: { id: string; email: string }) {
  const o = await prisma.order.findUnique({ where: { number }, include: { payments: { where: { status: 'PAID' }, select: { amountMinor: true } } } });
  if (!o) throw new AppError(404, 'NOT_FOUND');
  if (['CANCELLED', 'RETURNED'].includes(o.status)) throw new AppError(409, 'VALIDATION_FAILED', 'ORDER_CLOSED');
  const ref = `manual-${randomToken(8)}`;
  const before = o.payments.reduce((s, p) => s + p.amountMinor, 0);
  const full = o.totalMinor !== null && before + amountMinor >= o.totalMinor;
  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.create({ data: { orderId: o.id, provider: 'manual', providerRef: ref, status: 'PAID', amountMinor, currency: 'UAH', rawPayload: { manual: true, by: actor.id }, idempotencyKey: ref } });
    await tx.order.update({ where: { id: o.id }, data: { ...(full ? { paymentStatus: 'PAID' } : {}), paidAt: new Date() } });
    await tx.orderEvent.create({ data: { orderId: o.id, type: 'payment_received', toValue: full ? 'PAID' : 'PARTIAL', actorId: actor.id, payload: { amountMinor, ref, manual: true } } });
    // #202: «payment received» goes to the shared Telegram group.
    await enqueue('notify.telegram', { kind: 'payment', orderId: o.id, amountMinor }, tx);
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'order.payment_recorded', resourceType: 'Order', resourceId: o.id, resourceLabel: o.number, after: { amountMinor, full } }, tx);
  });
  return { full };
}

/** #214: a refund made outside the panel, written down — sum and how. Nothing is sent anywhere. */
export async function recordRefund(number: string, b: { amountMinor: number; method: 'CARD' | 'IBAN' | 'CASH'; note?: string }, actor: { id: string; email: string }) {
  const o = await find(number);
  await prisma.$transaction(async (tx) => {
    await tx.orderEvent.create({ data: { orderId: o.id, type: 'refund_recorded', actorId: actor.id, payload: { amountMinor: b.amountMinor, method: b.method, ...(b.note ? { note: b.note } : {}) } } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'order.refund_recorded', resourceType: 'Order', resourceId: o.id, resourceLabel: o.number, after: { amountMinor: b.amountMinor, method: b.method } }, tx);
  });
}

export interface ContactPatch {
  fullName?: string; patronymic?: string | null; phone?: string; email?: string | null;
  city?: string | null; warehouseLabel?: string | null; address?: string | null; postalCode?: string | null;
}

/** #111: only the address and the contacts of an order are edited; items and sums never. */
export async function editContact(number: string, b: ContactPatch, actor: { id: string; email: string }) {
  const o = await find(number);
  const a = { ...addrOf(o.shippingAddress) };
  const changed: string[] = [];
  const set = <K extends keyof Addr>(k: K, v: Addr[K] | undefined) => { if (v !== undefined && v !== a[k]) { a[k] = v; changed.push(k); } };
  if (b.fullName !== undefined) {
    const [last, ...first] = b.fullName.trim().split(/\s+/);
    set('lastName', last); set('firstName', first.join(' '));
  }
  set('patronymic', b.patronymic);
  const cityBefore = a.city;
  set('city', b.city);
  // A typed branch or city no longer matches the Nova Poshta refs picked at checkout.
  if (a.city !== cityBefore) { a.cityRef = null; a.warehouseRef = null; }
  if (b.warehouseLabel !== undefined && b.warehouseLabel !== a.warehouseLabel) { a.warehouseRef = null; }
  set('warehouseLabel', b.warehouseLabel);
  set('address', b.address);
  set('postalCode', b.postalCode);
  const data: Prisma.OrderUpdateInput = {};
  if (b.phone !== undefined && b.phone !== o.phone) { data.phone = b.phone; changed.push('phone'); }
  if (b.email !== undefined && (b.email || null) !== o.email) { data.email = b.email || null; data.emailBouncedAt = null; changed.push('email'); }
  if (!changed.length) return { changed };
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: o.id }, data: { ...data, shippingAddress: a as Prisma.InputJsonValue, ...(a.warehouseRef === null ? { npWarehouseRef: null } : {}) } });
    await tx.orderEvent.create({ data: { orderId: o.id, type: 'contact_edited', actorId: actor.id, payload: { fields: changed } } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'order.contact_edited', resourceType: 'Order', resourceId: o.id, resourceLabel: o.number, after: { fields: changed } }, tx);
  });
  return { changed };
}

/** #216: typing the phone on «Нове замовлення» finds the buyer's last order and fills the form. */
export async function lookupCustomer(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-9);
  if (digits.length < 9) return { found: false as const };
  const orders = await prisma.order.findMany({
    where: { phone: { endsWith: digits }, NOT: { phone: { startsWith: 'anon-' } } },
    orderBy: { placedAt: 'desc' }, take: 50,
    select: { number: true, phone: true, email: true, shippingAddress: true, placedAt: true },
  });
  const last = orders[0];
  const careful = await cautions([last?.phone ?? `+380${digits}`]);
  if (!last) return careful[0] ? { found: false as const, caution: careful[0].cautionReason } : { found: false as const };
  const a = addrOf(last.shippingAddress);
  return {
    found: true as const,
    phone: last.phone,
    fullName: name(last.shippingAddress),
    email: orders.find((x) => x.email)?.email ?? null,
    orders: orders.length,
    lastOrder: { number: last.number, placedAt: last.placedAt.toISOString() },
    delivery: { method: a.method ?? null, city: a.city ?? null, cityRef: a.cityRef ?? null, warehouseRef: a.warehouseRef ?? null, warehouseLabel: a.warehouseLabel ?? null, address: a.address ?? null, postalCode: a.postalCode ?? null },
    caution: careful[0]?.cautionReason ?? null,
  };
}

/** Packing lists and invoices (#87–89, #178–179): everything a sheet of paper needs, for one or several orders. */
export async function printData(numbers: string[]) {
  const orders = await prisma.order.findMany({
    where: { number: { in: numbers } },
    include: { items: true, payments: { where: { status: 'PAID' }, select: { amountMinor: true } }, events: { where: { type: 'note_added' }, orderBy: { createdAt: 'asc' }, select: { payload: true } } },
  });
  const thumb = await thumbs(orders.flatMap((o) => o.items));
  const byNumber = new Map(orders.map((o) => [o.number, o]));
  return {
    orders: numbers.map((n) => byNumber.get(n)).filter((o): o is NonNullable<typeof o> => !!o).map((o) => {
      const a = addrOf(o.shippingAddress);
      return {
        number: o.number, placedAt: o.placedAt.toISOString(), status: o.status,
        customer: name(o.shippingAddress), patronymic: a.patronymic ?? null, phone: o.phone, email: o.email, company: a.company ?? null,
        delivery: { method: a.method ?? null, city: a.city ?? null, warehouseLabel: a.warehouseLabel ?? null, address: a.address ?? null, postalCode: a.postalCode ?? null },
        trackingNumber: o.trackingNumber,
        payment: paymentKey(o),
        subtotalMinor: o.subtotalMinor, discountMinor: o.discountMinor,
        discountLabel: o.discountMinor > 0 ? (o.discountSource === 'PROMO_CODE' ? `Промокод ${o.couponCode ?? ''}`.trim() : 'Оптова знижка') : null,
        shippingMinor: o.shippingMinor ?? o.shippingForwardMinor, totalMinor: o.totalMinor,
        codAmountMinor: o.codAmountMinor, prepaymentMinor: o.prepaymentMinor,
        paidMinor: o.payments.reduce((s, p) => s + p.amountMinor, 0),
        notes: [o.customerNote, ...o.events.map((e) => (e.payload as { text?: string } | null)?.text)].filter((t): t is string => !!t),
        items: o.items.map((i) => {
          const s = i.customSpec as Spec | null;
          const opts = i.optionsSnapshot as Opts;
          return {
            id: i.id, name: i.nameSnapshot, sku: i.sku, thumb: thumb(i),
            size: s ? `${s.widthCm}×${s.lengthCm} см (свій розмір)` : opts.size?.label ?? null,
            other: Object.entries(opts).filter(([k]) => k !== 'size').map(([, v]) => v.label).join(' · ') || null,
            quantity: i.quantityMilli / 1000, unit: i.pricingUnitSnapshot,
            unitPriceMinor: i.unitPriceMinor, totalMinor: i.totalMinor,
          };
        }),
      };
    }),
  };
}
