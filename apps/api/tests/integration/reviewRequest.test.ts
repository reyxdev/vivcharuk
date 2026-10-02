import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { dueReviewRequests, planFor, REVIEW_REQUEST_EVENT, requestReview, reviewRequestMail } from '../../src/modules/notifications/reviewRequest';

// Round 19 D4: «Залиште відгук», 3 days after delivery, once per order. Against the development
// database; addresses are @example.test, so nothing is handed to a mail service. Everything is removed.
const tag = `rr${Date.now()}`;
const DAY = 86_400_000;
const now = new Date();
const ago = (days: number) => new Date(now.getTime() - days * DAY);
const ids: Record<string, string> = {};
let product: { variantId: string; productId: string; slug: string };

async function order(key: string, o: { status?: 'DELIVERED' | 'CANCELLED' | 'RETURNED'; deliveredDaysAgo: number; email?: string | null }) {
  const created = await prisma.order.create({
    data: {
      number: `T-${tag}-${key}`, locale: 'uk', paymentMethod: 'COD', subtotalMinor: 100_000, totalMinor: 100_000, phone: '+380000000000',
      email: o.email === undefined ? `${key}-${tag}@example.test` : o.email, shippingCarrier: 'NOVA_POSHTA',
      shippingAddress: { firstName: 'Олена', lastName: 'Тест' }, status: o.status ?? 'DELIVERED', deliveredAt: ago(o.deliveredDaysAgo),
      items: { create: { variantId: product.variantId, sku: 'TEST', nameSnapshot: 'Тест', optionsSnapshot: {}, unitPriceMinor: 100_000, pricingUnitSnapshot: 'PIECE', quantityMilli: 1000, totalMinor: 100_000 } },
    },
  });
  ids[key] = created.id;
}

beforeAll(async () => {
  const v = await prisma.productVariant.findFirstOrThrow({
    where: { isActive: true, deletedAt: null, product: { status: 'ACTIVE', deletedAt: null, translations: { some: { locale: 'uk' } } } },
    select: { id: true, productId: true, product: { select: { translations: { where: { locale: 'uk' }, select: { slug: true } } } } },
  });
  product = { variantId: v.id, productId: v.productId, slug: v.product.translations[0]!.slug };
  await order('due', { deliveredDaysAgo: 4 });
  await order('fresh', { deliveredDaysAgo: 1 });
  await order('old', { deliveredDaysAgo: 30 });
  await order('cancelled', { status: 'CANCELLED', deliveredDaysAgo: 4 });
  await order('returned', { status: 'RETURNED', deliveredDaysAgo: 4 });
  await order('noemail', { deliveredDaysAgo: 4, email: null });
  await order('reviewed', { deliveredDaysAgo: 4 });
  await prisma.review.create({ data: { productId: product.productId, authorName: 'Олена', authorEmail: `reviewed-${tag}@example.test`, rating: 5, body: 'Дуже тепла річ, дякую!', status: 'PENDING' } });
});

afterAll(async () => {
  await prisma.review.deleteMany({ where: { authorEmail: { endsWith: `-${tag}@example.test` } } });
  await prisma.order.deleteMany({ where: { id: { in: Object.values(ids) } } }); // items and events cascade
});

describe('«Залиште відгук» letter', () => {
  it('selects only delivered orders with an e-mail, 3–10 days after delivery, not yet reviewed', async () => {
    const due = new Set(await dueReviewRequests(now));
    expect(due.has(ids.due!)).toBe(true);
    for (const k of ['fresh', 'old', 'cancelled', 'returned', 'noemail', 'reviewed']) expect(due.has(ids[k]!), k).toBe(false);
  });

  it('the letter is warm, links each product to the review form, has no discount and no pixel', async () => {
    const plan = await planFor(ids.due!, now);
    const m = reviewRequestMail(plan!);
    expect(m.to).toBe(`due-${tag}@example.test`);
    expect(m.subject).toContain(`T-${tag}-due`);
    expect(m.html).toContain('Олена, кілька днів тому');
    expect(m.html).toContain(`/uk/vidhuky?product=${encodeURIComponent(product.slug)}`);
    expect(m.html).toContain('Залишити відгук');
    expect(m.html.match(/<img/g)).toHaveLength(1); // the logo only
    expect(m.html).not.toMatch(/знижк|промокод/i);
  });

  it('is sent once per order', async () => {
    expect(await requestReview(ids.due!, now)).toBe('sent');
    expect(await requestReview(ids.due!, now)).toBe('skipped');
    expect(await prisma.orderEvent.count({ where: { orderId: ids.due!, type: REVIEW_REQUEST_EVENT } })).toBe(1);
    expect(await dueReviewRequests(now)).not.toContain(ids.due!);
  });

  it('never sends for an order that is not due', async () => {
    expect(await requestReview(ids.cancelled!, now)).toBe('skipped');
    expect(await requestReview(ids.reviewed!, now)).toBe('skipped');
    expect(await prisma.orderEvent.count({ where: { orderId: { in: [ids.cancelled!, ids.reviewed!] }, type: REVIEW_REQUEST_EVENT } })).toBe(0);
  });
});
