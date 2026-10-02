import { unreadCount } from '../mail/mail.routes';
import type { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { getSetting } from '../../lib/settings';
import { requireStaff } from '../../plugins/staffAuth';
import { kyivBounds, thumbOf, type SaleItem } from '../stock/shop-sales.service';

/**
 * The home page (round 20 #18–21, #74–79, #181–183, #242–245, #290): a to-do list and the month's
 * figures. One request, each block gated by its own read permission.
 */
export async function dashboardRoutes(app: FastifyInstance) {
  // Round 20 #61: the menu counters — new orders, unread mail, 1-click requests, reviews to check.
  app.get('/admin/counters', { preHandler: requireStaff }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const can = (p: string) => req.staff!.permissions.has(p);
    const [orders, quick, mail, reviews] = await Promise.all([
      can('orders.read') ? prisma.order.count({ where: { status: 'PENDING' } }) : 0,
      can('orders.read') ? prisma.quickOrderRequest.count({ where: { status: 'NEW' } }) : 0,
      can('mail.read') ? unreadCount(req.staff!.id) : 0,
      can('reviews.read') ? prisma.review.count({ where: { status: 'PENDING' } }) : 0,
    ]);
    return { orders, quick, mail, reviews };
  });

  // Round 20 #18–21, #74–79, #181–183, #242–245: «Що зробити зараз» sorted overdue → today → rest,
  // then the month's figures and a by-day chart split site / shop. Each block gated by its permission.
  app.get('/admin/dashboard', { preHandler: requireStaff }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const staff = req.staff!;
    const can = (p: string) => staff.permissions.has(p);
    const now = Date.now();
    const b = await kyivBounds();
    const tomorrow = new Date(b.today.getTime() + 86_400_000);
    const todos: Todo[] = [];
    const nums = (rows: Array<{ number: string }>) => rows.slice(0, 3).map((o) => o.number).join(', ') + (rows.length > 3 ? ` і ще ${rows.length - 3}` : '');

    if (can('orders.read')) {
      const paidOk: Prisma.OrderWhereInput = { OR: [{ paymentMethod: 'COD' }, { paymentStatus: 'PAID' }, { payments: { some: { status: 'PAID' } } }] };
      const [fresh, unconfirmed, ibanLate, make, ship, quick] = await Promise.all([
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.findMany({ where: { status: 'PENDING', confirmedByCallAt: null, placedAt: { lt: new Date(now - 86_400_000) } }, orderBy: { placedAt: 'asc' }, select: { number: true } }),
        prisma.order.findMany({ where: { paymentMethod: 'BANK_TRANSFER', status: { in: ['PENDING', 'CONFIRMED'] }, paymentStatus: 'UNPAID', payments: { none: { status: 'PAID' } }, placedAt: { lt: new Date(now - 3 * 86_400_000) } }, orderBy: { placedAt: 'asc' }, select: { number: true } }),
        prisma.order.findMany({
          where: { status: 'IN_PRODUCTION', expectedDispatchAt: { not: null } }, orderBy: { expectedDispatchAt: 'asc' }, take: 6,
          select: { number: true, expectedDispatchAt: true, items: { select: { nameSnapshot: true, customSpec: true } } },
        }),
        prisma.order.findMany({
          where: { trackingNumber: null, AND: [paidOk, { OR: [{ status: 'PACKING' }, { status: 'CONFIRMED', items: { none: { customSpec: { not: Prisma.DbNull } } } }] }] },
          orderBy: { placedAt: 'asc' }, select: { number: true },
        }),
        prisma.quickOrderRequest.count({ where: { status: 'NEW' } }),
      ]);
      if (unconfirmed.length) todos.push({ key: 'unconfirmed', when: 'overdue', title: 'Не підтверджено дзвінком понад добу', sub: nums(unconfirmed), count: unconfirmed.length, to: '/orders?view=attention' });
      if (ibanLate.length) todos.push({ key: 'iban', when: 'overdue', title: 'Не оплачено на рахунок понад 3 дні', sub: nums(ibanLate), count: ibanLate.length, to: '/orders?view=awaiting_payment' });
      if (fresh) todos.push({ key: 'new', when: 'today', title: 'Нові замовлення — подзвонити й підтвердити', count: fresh, to: '/orders?view=attention' });
      if (quick) todos.push({ key: 'quick', when: 'today', title: 'Купити в 1 клік — передзвонити', count: quick, to: '/quick-orders' });
      if (ship.length) todos.push({ key: 'ship', when: 'today', title: 'Відправити сьогодні', sub: nums(ship), count: ship.length, to: '/orders?view=to_ship' });
      for (const o of make) {
        const due = o.expectedDispatchAt!;
        const what = o.items.map((i) => { const s = i.customSpec as { widthCm?: number; lengthCm?: number } | null; return s?.widthCm ? `${i.nameSnapshot} ${s.widthCm}×${s.lengthCm}` : i.nameSnapshot; }).join(', ');
        todos.push({ key: `make-${o.number}`, when: due.getTime() < now ? 'overdue' : due < tomorrow ? 'today' : 'later', title: `Виготовити до ${dayMonth(due)}`, sub: `${o.number} · ${what}`, to: `/orders/${o.number}` });
      }
    }

    if (can('mail.read')) {
      const n = await unreadCount(staff.id);
      if (n) todos.push({ key: 'mail', when: 'today', title: 'Непрочитані листи', count: n, to: '/mail' });
    }

    if (can('products.read')) {
      // #182: «закінчується» at stock 1 (0 = already gone); one-of-one pieces and made-to-order sizes are not low stock.
      const [low, noPhoto] = await Promise.all([
        prisma.$queryRaw<Array<{ name: string | null; stockQty: number }>>`
          SELECT t.name, v."stockQty" FROM "ProductVariant" v JOIN "Product" p ON p.id = v."productId"
          LEFT JOIN "ProductTranslation" t ON t."productId" = p.id AND t.locale = 'uk'
          WHERE v."isActive" AND v."deletedAt" IS NULL AND p.status = 'ACTIVE' AND p."deletedAt" IS NULL
            AND NOT p."isUniquePiece" AND v."madeToOrderDays" IS NULL AND v."stockQty" <= 1
          ORDER BY v."stockQty" ASC, t.name ASC`,
        prisma.product.count({ where: { deletedAt: null, status: { not: 'ARCHIVED' }, media: { none: {} } } }),
      ]);
      if (low.length) {
        const names = [...new Set(low.map((r) => r.name).filter(Boolean))];
        todos.push({ key: 'low', when: 'later', title: 'Закінчується на складі', sub: names.slice(0, 3).join(', ') + (names.length > 3 ? ` і ще ${names.length - 3}` : ''), count: low.length, to: '/products?tab=low' });
      }
      if (noPhoto) todos.push({ key: 'nophoto', when: 'later', title: 'Товари без фото', count: noPhoto, to: '/products?filter=no_photo' });
    }

    if (can('reviews.read')) {
      const [pending, total] = await Promise.all([
        prisma.review.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 3, select: { id: true, authorName: true, rating: true, body: true } }),
        prisma.review.count({ where: { status: 'PENDING' } }),
      ]);
      // #75: publishing a review is one action, so it is done right here.
      for (const r of pending) {
        todos.push({ key: `review-${r.id}`, when: 'later', title: `Відгук: ${r.authorName}, ${r.rating} з 5`, sub: r.body.length > 90 ? `${r.body.slice(0, 90)}…` : r.body, to: '/reviews', ...(can('reviews.moderate') ? { action: { kind: 'review_publish' as const, id: r.id } } : {}) });
      }
      if (total > pending.length) todos.push({ key: 'reviews', when: 'later', title: 'Ще відгуки на перевірку', count: total - pending.length, to: '/reviews' });
    }

    const rank = { overdue: 0, today: 1, later: 2 };
    todos.sort((x, y) => rank[x.when] - rank[y.when]);
    const out: Record<string, unknown> = { announcement: await getSetting<string | null>('admin.announcement', null), todos };
    if (can('analytics.read_revenue')) out.figures = await figures(b);
    return out;
  });
}

type Todo = { key: string; when: 'overdue' | 'today' | 'later'; title: string; sub?: string; count?: number; to: string; action?: { kind: 'review_publish'; id: string } };

const dayMonth = (d: Date) => d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', timeZone: 'Europe/Kyiv' });
const kyivDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv' }).format(d);

/** The month so far (Kyiv), compared with the same days of last month (#77). Site = orders not cancelled or returned. */
async function figures(b: Awaited<ReturnType<typeof kyivBounds>>) {
  const [siteDays, sitePrev, shopRows, shopPrev, newCustomers, siteTop] = await Promise.all([
    prisma.$queryRaw<Array<{ d: string; s: bigint; n: number }>>`
      SELECT to_char(("placedAt" AT TIME ZONE 'Europe/Kyiv')::date, 'YYYY-MM-DD') AS d, coalesce(sum("totalMinor"), 0)::bigint AS s, count(*)::int AS n
      FROM "Order" WHERE "placedAt" >= ${b.month} AND status NOT IN ('CANCELLED', 'RETURNED') GROUP BY 1`,
    prisma.order.aggregate({ where: { placedAt: { gte: b.prevMonth, lt: b.prevNow }, status: { notIn: ['CANCELLED', 'RETURNED'] } }, _sum: { totalMinor: true } }),
    prisma.shopSale.findMany({ where: { createdAt: { gte: b.month }, cancelledAt: null }, select: { createdAt: true, totalMinor: true, items: true } }),
    prisma.shopSale.aggregate({ where: { createdAt: { gte: b.prevMonth, lt: b.prevNow }, cancelledAt: null }, _sum: { totalMinor: true } }),
    prisma.customer.count({ where: { createdAt: { gte: b.month }, deletedAt: null } }),
    prisma.$queryRaw<Array<{ productId: string; q: number }>>`
      SELECT v."productId", (sum(i."quantityMilli") / 1000.0)::float AS q
      FROM "OrderItem" i JOIN "Order" o ON o.id = i."orderId" JOIN "ProductVariant" v ON v.id = i."variantId"
      WHERE o."placedAt" >= ${b.month} AND o.status NOT IN ('CANCELLED', 'RETURNED') GROUP BY 1`,
  ]);

  const siteMinor = siteDays.reduce((s, r) => s + Number(r.s), 0);
  const siteOrders = siteDays.reduce((s, r) => s + r.n, 0);
  const shopMinor = shopRows.reduce((s, r) => s + r.totalMinor, 0);
  const revenueMinor = siteMinor + shopMinor;
  const prevMinor = (sitePrev._sum.totalMinor ?? 0) + (shopPrev._sum.totalMinor ?? 0);

  const sold = new Map(siteTop.map((r) => [r.productId, r.q]));
  for (const s of shopRows) for (const i of s.items as unknown as SaleItem[]) sold.set(i.productId, (sold.get(i.productId) ?? 0) + i.quantity);
  const topIds = [...sold].sort((x, y) => y[1] - x[1]).slice(0, 3);
  const prods = await prisma.product.findMany({
    where: { id: { in: topIds.map(([id]) => id) } },
    select: { id: true, sku: true, translations: { where: { locale: 'uk' }, select: { name: true } }, media: { take: 1, orderBy: { position: 'asc' }, select: { media: { select: { publicId: true, provider: true } } } } },
  });
  const top = topIds.map(([id, q]) => { const p = prods.find((x) => x.id === id); return { productId: id, name: p?.translations[0]?.name ?? p?.sku ?? '—', thumb: thumbOf(p?.media[0]?.media), quantity: Math.round(q * 10) / 10 }; });

  const shopByDay = new Map<string, number>();
  for (const s of shopRows) { const d = kyivDay(s.createdAt); shopByDay.set(d, (shopByDay.get(d) ?? 0) + s.totalMinor); }
  const today = kyivDay(new Date());
  const days = Array.from({ length: Number(today.slice(8, 10)) }, (_, i) => {
    const d = `${today.slice(0, 8)}${String(i + 1).padStart(2, '0')}`;
    return { day: d, siteMinor: Number(siteDays.find((r) => r.d === d)?.s ?? 0), shopMinor: shopByDay.get(d) ?? 0 };
  });

  return {
    revenueMinor, prevRevenueMinor: prevMinor,
    changePercent: prevMinor > 0 ? Math.round(((revenueMinor - prevMinor) / prevMinor) * 100) : null,
    orders: siteOrders, avgOrderMinor: siteOrders ? Math.round(siteMinor / siteOrders) : null,
    shop: { sumMinor: shopMinor, count: shopRows.length },
    newCustomers, top, days,
  };
}
