import type { Locale, Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import {
  type CheckoutPayment,
  type CheckoutQuote,
  type CreateOrderInput,
  type DeliveryMethod,
  type PromoResult,
  COD_MAX_MINOR_DEFAULT, PREPAY_MIN_MINOR_DEFAULT,
  prepayment,
} from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { randomToken } from '../../lib/crypto';
import { prisma } from '../../lib/prisma';
import { getSetting } from '../../lib/settings';
import { viewCart } from '../cart/cart.service';
import { quoteShipping } from '../shipping/shipping.service';
import { enqueue } from '../../lib/jobs';
import { evaluatePromo } from '../promotions/promotions.service';
import { requestConsent } from '../newsletter/newsletter.service';

// Card-type payments (card, COD deposit, prepayment) need WayForPay and its ПРРО; they stay off
// until the cash register is registered (round 14 F2 #17). The dev stub turns them on locally.
export async function cardEnabled() {
  return config.payments.stub || (await getSetting<boolean>('payments.card_enabled', false));
}

interface Amounts { subtotal: number; discount: number; shipping: number | null; shippingIsTest: boolean; total: number | null }

/** The volume discount or a promo code — never both; the larger applies (18 §18.9, §18.10a). */
async function amountsFor(cartId: string, locale: Locale, delivery: DeliveryMethod, promoCode?: string, phone?: string) {
  const cart = await viewCart(cartId, locale);
  const ship = await quoteShipping(delivery);
  const volume = cart.discount?.amountMinor ?? 0;
  let promo: PromoResult | null = promoCode ? await evaluatePromo(promoCode, cart, phone) : null;
  if (promo?.ok && promo.amountMinor <= volume) promo = { ...promo, ok: false, reason: 'NOT_BETTER' };
  const usePromo = !!promo?.ok;
  const discount = usePromo ? promo!.amountMinor : volume;
  const source = usePromo ? 'PROMO_CODE' as const : volume > 0 ? 'VOLUME' as const : null;
  const goods = cart.subtotalMinor - discount;
  const a: Amounts = { subtotal: cart.subtotalMinor, discount, shipping: ship.forwardMinor, shippingIsTest: ship.isTest, total: ship.forwardMinor === null ? null : goods + ship.forwardMinor };
  return { cart, a, goods, promo, source };
}

/**
 * Payment methods are derived from the cart and delivery, never filtered on the client
 * (26 §26.10.4b). Custom-size carts: full card prepayment only (H1.1, J1). COD with inspection:
 * both shipping legs online now, goods minus the deposit at the branch (H1.3). Partial
 * prepayment: min(max(10 %, 460 ₴), total) now, balance at the branch (round 8 §L14).
 */
async function paymentOptions(a: Amounts, goods: number, hasCustom: boolean, delivery: DeliveryMethod) {
  const out: CheckoutQuote['payments'] = [];
  const card = await cardEnabled();
  if (a.total === null) return out;
  if (card) out.push({ key: 'CARD', amountNowMinor: a.total, balanceOnDeliveryMinor: 0 });
  // Round 18: above the ceiling there is no payment at the branch — card or invoice only.
  const codMax = await getSetting<number>('payments.cod.max_minor', COD_MAX_MINOR_DEFAULT);
  if (!hasCustom && card && delivery !== 'PICKUP' && a.total <= codMax) {
    const leg = a.shipping ?? 0;
    out.push({ key: 'COD_INSPECTION', amountNowMinor: leg * 2, balanceOnDeliveryMinor: goods - leg, depositMinor: leg });
    const floor = await getSetting<number>('payments.prepayment.min_minor', PREPAY_MIN_MINOR_DEFAULT);
    const pre = prepayment(goods, a.total, floor);
    if (pre < a.total) out.push({ key: 'PREPAYMENT', amountNowMinor: pre, balanceOnDeliveryMinor: a.total - pre });
  }
  if (!hasCustom) out.push({ key: 'IBAN', amountNowMinor: 0, balanceOnDeliveryMinor: 0 });
  return out;
}

async function codCeilingHit(a: Amounts, hasCustom: boolean, delivery: DeliveryMethod) {
  if (hasCustom || delivery === 'PICKUP' || a.total === null || !(await cardEnabled())) return null;
  const codMax = await getSetting<number>('payments.cod.max_minor', COD_MAX_MINOR_DEFAULT);
  return a.total > codMax ? codMax : null;
}

export async function quote(cartId: string, locale: Locale, delivery: DeliveryMethod, promoCode?: string): Promise<CheckoutQuote> {
  const { cart, a, goods, promo, source } = await amountsFor(cartId, locale, delivery, promoCode);
  return {
    subtotalMinor: a.subtotal,
    discountMinor: a.discount,
    shippingMinor: a.shipping,
    shippingIsTest: a.shippingIsTest,
    totalMinor: a.total,
    payments: await paymentOptions(a, goods, cart.hasCustomSize, delivery),
    hasCustomSize: cart.hasCustomSize,
    // Email is optional for ordinary uk orders; required for custom, company and non-uk (round 10 §P5a).
    emailRequired: cart.hasCustomSize || locale !== 'uk',
    codUnavailableAboveMinor: await codCeilingHit(a, cart.hasCustomSize, delivery),
    discountSource: source,
    promo: promo ? { code: promo.code, ok: promo.ok, amountMinor: promo.amountMinor, label: promo.label, reason: promo.reason, minSubtotalMinor: promo.minSubtotalMinor, startsAt: promo.startsAt } : null,
  };
}

const CARRIER: Record<DeliveryMethod, 'NOVA_POSHTA' | 'UKRPOSHTA' | 'PICKUP'> = { NP_BRANCH: 'NOVA_POSHTA', NP_COURIER: 'NOVA_POSHTA', UKRPOSHTA: 'UKRPOSHTA', PICKUP: 'PICKUP' };
const METHOD: Record<CheckoutPayment, 'CARD_ONLINE' | 'COD' | 'BANK_TRANSFER'> = { CARD: 'CARD_ONLINE', PREPAYMENT: 'CARD_ONLINE', COD_INSPECTION: 'COD', IBAN: 'BANK_TRANSFER' };

/**
 * One transaction (26 §26.10.4): revalidate every line against live stock, recompute every price,
 * allocate the number, write Order, OrderItem snapshots, StockMovement and the opening OrderEvent,
 * mint guestToken, consume the cart. Idempotent by key (§26.11).
 */
export async function createOrder(cartId: string, locale: Locale, input: CreateOrderInput, idempotencyKey: string) {
  const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const prior = await prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
  if (prior) {
    if (prior.requestHash !== requestHash) throw new AppError(409, 'IDEMPOTENCY_KEY_CONFLICT');
    if (prior.responseBody) return prior.responseBody as { number: string; guestToken: string; amountDueNowMinor: number; payment: CheckoutPayment };
    throw new AppError(409, 'IDEMPOTENCY_KEY_CONFLICT');
  }
  await prisma.idempotencyKey.create({ data: { key: idempotencyKey, scope: 'checkout', requestHash, lockedAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000) } });

  const { cart, a, goods, promo, source } = await amountsFor(cartId, locale, input.delivery.method, input.promoCode, input.contact.phone);
  // Re-checked at order creation (18 §18.9): a code that stopped working fails with its reason, not
  // a silent price change. «Not better» is not a failure: the volume discount simply applies.
  if (promo && !promo.ok && promo.reason !== 'NOT_BETTER') throw new AppError(422, 'VALIDATION_FAILED', 'PROMO_INVALID', { reason: promo.reason, minSubtotalMinor: promo.minSubtotalMinor });
  const lines = cart.items.filter((l) => l.available);
  if (lines.length === 0) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'cart', code: 'CART_EMPTY' }]);
  if (a.total === null) throw new AppError(502, 'UPSTREAM_UNAVAILABLE', 'SHIPPING_UNAVAILABLE');
  if (input.expectedTotalMinor !== undefined && input.expectedTotalMinor !== a.total) {
    throw new AppError(409, 'PRICE_CHANGED', undefined, { totalMinor: a.total });
  }
  const options = await paymentOptions(a, goods, cart.hasCustomSize, input.delivery.method);
  const chosen = options.find((o) => o.key === input.payment);
  if (!chosen) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'payment', code: 'PAYMENT_METHOD_NOT_AVAILABLE' }]);
  const emailRequired = cart.hasCustomSize || locale !== 'uk' || !!input.company;
  if (emailRequired && !input.contact.email) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'contact.email', code: 'REQUIRED' }]);
  const d = input.delivery;
  if (d.method === 'NP_BRANCH' && !d.warehouseRef) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'delivery.warehouseRef', code: 'REQUIRED' }]);
  if ((d.method === 'NP_COURIER' || d.method === 'UKRPOSHTA') && !d.address) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'delivery.address', code: 'REQUIRED' }]);

  const [lastName, ...firstNames] = input.contact.fullName.split(/\s+/);
  const guestToken = randomToken(24);

  const result = await prisma.$transaction(async (tx) => {
    if (promo?.ok) {
      const n = await tx.$executeRaw`UPDATE "Promotion" SET "usageCount" = "usageCount" + 1 WHERE id = ${promo.promotionId} AND ("usageLimit" IS NULL OR "usageCount" < "usageLimit")`;
      if (n !== 1) throw new AppError(422, 'VALIDATION_FAILED', 'PROMO_INVALID', { reason: 'EXHAUSTED' });
    }
    for (const l of lines) {
      if (l.customSpec || l.madeToOrderDays) continue; // made to order: nothing to take from stock
      const units = l.pricingUnit === 'PIECE' ? l.quantityMilli / 1000 : Math.ceil(l.quantityMilli / 1000);
      const n = await tx.$executeRaw`UPDATE "ProductVariant" SET "stockQty" = "stockQty" - ${units} WHERE id = ${l.variantId} AND "stockQty" >= ${units}`;
      if (n !== 1) throw new AppError(409, 'VALIDATION_FAILED', 'STOCK_UNAVAILABLE', { variantId: l.variantId });
    }
    const seq = await tx.$queryRaw<Array<{ n: bigint }>>`SELECT nextval('order_number_seq') AS n`;
    const number = `VCH-${String(new Date().getFullYear()).slice(2)}-${String(seq[0]!.n).padStart(4, '0')}`;
    const isCod = input.payment === 'COD_INSPECTION';
    const order = await tx.order.create({
      data: {
        number,
        locale,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: METHOD[input.payment],
        subtotalMinor: a.subtotal,
        discountMinor: a.discount,
        discountSource: source,
        volumeTierPercent: source === 'VOLUME' ? cart.discount?.percent ?? null : null,
        couponCode: promo?.ok ? promo.code : null,
        shippingMinor: isCod ? null : a.shipping,
        shippingForwardMinor: isCod ? a.shipping : null,
        shippingReturnDepositMinor: isCod ? a.shipping : null,
        codAmountMinor: isCod ? chosen.balanceOnDeliveryMinor : null,
        prepaymentMinor: input.payment === 'PREPAYMENT' ? chosen.amountNowMinor : null,
        amountDueNowMinor: chosen.amountNowMinor,
        totalMinor: a.total,
        email: input.contact.email ?? null,
        phone: input.contact.phone,
        guestToken,
        shippingCarrier: CARRIER[d.method],
        shippingAddress: {
          method: d.method, lastName, firstName: firstNames.join(' '), patronymic: input.contact.patronymic ?? null,
          city: d.city ?? null, cityRef: d.cityRef ?? null, warehouseRef: d.warehouseRef ?? null, warehouseLabel: d.warehouseLabel ?? null,
          address: d.address ?? null, postalCode: d.postalCode ?? null,
          company: input.company ?? null,
        } as Prisma.InputJsonValue,
        npWarehouseRef: d.warehouseRef ?? null,
        attribution: (input.attribution ?? undefined) as Prisma.InputJsonValue | undefined,
        items: {
          create: lines.map((l) => ({
            variantId: l.variantId,
            sku: l.sku,
            nameSnapshot: l.name,
            optionsSnapshot: l.options as Prisma.InputJsonValue,
            customSpec: (l.customSpec ?? undefined) as Prisma.InputJsonValue | undefined,
            unitPriceMinor: l.unitPriceMinor,
            pricingUnitSnapshot: l.pricingUnit,
            quantityMilli: l.quantityMilli,
            totalMinor: l.totalMinor,
          })),
        },
        events: { create: { type: 'status_changed', toValue: 'PENDING', payload: { payment: input.payment } } },
      },
    });
    const moves = lines.filter((l) => !l.customSpec && !l.madeToOrderDays).map((l) => ({
      variantId: l.variantId, delta: -(l.pricingUnit === 'PIECE' ? l.quantityMilli / 1000 : Math.ceil(l.quantityMilli / 1000)), source: 'ORDER' as const, orderId: order.id,
    }));
    if (moves.length) await tx.stockMovement.createMany({ data: moves });
    await tx.cartItem.deleteMany({ where: { cartId } });
    // Same transaction: the Telegram notice exists exactly when the order does (26 §26.17).
    await enqueue('notify.telegram', { kind: 'order', orderId: order.id }, tx);
    if (input.contact.email) await enqueue('mail.send', { kind: 'order_placed', orderId: order.id }, tx);
    // Round 19 D2: the unchecked-by-default newsletter box; nothing is sent until the link is clicked.
    if (input.marketingConsent && input.contact.email) await requestConsent(input.contact.email, order.locale, { kind: 'checkout', orderId: order.id }, tx);
    const body = { number, guestToken, amountDueNowMinor: chosen.amountNowMinor, payment: input.payment };
    await tx.idempotencyKey.update({ where: { key: idempotencyKey }, data: { responseCode: 201, responseBody: body, lockedAt: null } });
    return body;
  }).catch(async (e) => {
    await prisma.idempotencyKey.delete({ where: { key: idempotencyKey } }).catch(() => undefined);
    throw e;
  });
  return result;
}
