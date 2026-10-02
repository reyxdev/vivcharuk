import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireStaff } from '../../plugins/staffAuth';

// Round 20 #16, #82–83, #208: one search for the whole panel. Results in groups (orders, customers,
// products, mail), 3 each plus the total; a phone matches however it is typed (067…, +38067…, 67…).
export async function searchRoutes(app: FastifyInstance) {
  app.get('/admin/search', { preHandler: requireStaff }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const { q, group } = z.object({ q: z.string().trim().min(2).max(100), group: z.enum(['orders', 'customers', 'products', 'mail']).optional() }).parse(req.query);
    const can = (p: string) => req.staff!.permissions.has(p);
    const take = group ? 30 : 3;
    const digits = q.replace(/\D/g, '');
    // 067… → 38067…, +38067… stays, 67… stays: matched anywhere in the stored +380… number.
    const phone = digits.length >= 3 ? (digits.startsWith('0') ? `38${digits}` : digits) : null;
    const text = { contains: q, mode: 'insensitive' as const };
    const want = (g: string) => !group || group === g;

    const orderWhere = { OR: [{ number: text }, { email: text }, ...(phone ? [{ phone: { contains: phone } }] : []), { trackingNumber: text }] };
    const nameQ = q.charAt(0).toUpperCase() + q.slice(1);
    const buyerWhere = { OR: [...orderWhere.OR, { shippingAddress: { path: ['lastName'], string_contains: nameQ } }, { shippingAddress: { path: ['firstName'], string_contains: nameQ } }] };
    const productWhere = { deletedAt: null, OR: [{ sku: text }, { translations: { some: { locale: 'uk' as const, name: text } } }] };
    const mailWhere = { deletedAt: null, OR: [{ subject: text }, { counterpartEmail: text }, { counterpartName: text }] };

    const [orders, ordersN, customers, customersN, products, productsN, mail, mailN] = await Promise.all([
      can('orders.read') && want('orders') ? prisma.order.findMany({ where: orderWhere, orderBy: { placedAt: 'desc' }, take, select: { number: true, status: true, totalMinor: true, phone: true, shippingAddress: true, placedAt: true } }) : [],
      can('orders.read') && want('orders') ? prisma.order.count({ where: orderWhere }) : 0,
      // Buyers are order-derived and keyed by phone (the customer card is /customers/<phone>).
      can('customers.read') && want('customers') ? prisma.order.findMany({ where: buyerWhere, orderBy: { placedAt: 'desc' }, distinct: ['phone'], take, select: { phone: true, email: true, shippingAddress: true } }) : [],
      can('customers.read') && want('customers') ? prisma.order.groupBy({ by: ['phone'], where: buyerWhere }).then((g) => g.length) : 0,
      can('products.read') && want('products') ? prisma.product.findMany({ where: productWhere, orderBy: { updatedAt: 'desc' }, take, select: { id: true, sku: true, priceMinMinor: true, translations: { where: { locale: 'uk' }, select: { name: true } }, media: { take: 1, orderBy: { position: 'asc' }, select: { media: { select: { publicId: true, provider: true } } } } } }) : [],
      can('products.read') && want('products') ? prisma.product.count({ where: productWhere }) : 0,
      can('mail.read') && want('mail') ? prisma.mailThread.findMany({ where: mailWhere, orderBy: { lastMessageAt: 'desc' }, take, select: { id: true, subject: true, counterpartEmail: true, counterpartName: true, lastMessageAt: true } }) : [],
      can('mail.read') && want('mail') ? prisma.mailThread.count({ where: mailWhere }) : 0,
    ]);

    const name = (a: unknown) => { const x = (a ?? {}) as { firstName?: string; lastName?: string }; return [x.lastName, x.firstName].filter(Boolean).join(' '); };
    return {
      orders: { total: ordersN, items: orders.map((o) => ({ number: o.number, status: o.status, totalMinor: o.totalMinor, phone: o.phone, customer: name(o.shippingAddress), placedAt: o.placedAt.toISOString() })) },
      customers: { total: customersN, items: customers.map((c) => ({ id: c.phone, name: name(c.shippingAddress) || c.email || c.phone, phone: c.phone, email: c.email })) },
      products: {
        total: productsN,
        items: products.map((p) => {
          const m = p.media[0]?.media;
          return { id: p.id, sku: p.sku, name: p.translations[0]?.name ?? p.sku, priceMinor: p.priceMinMinor, thumb: m?.provider === 'local' ? `/media/${m.publicId.slice('local:'.length)}-480.webp` : null };
        }),
      },
      mail: { total: mailN, items: mail.map((t) => ({ id: t.id, subject: t.subject, who: t.counterpartName || t.counterpartEmail, lastMessageAt: t.lastMessageAt.toISOString() })) },
    };
  });
}
