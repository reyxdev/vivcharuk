import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { randomToken } from '../../lib/crypto';
import { enqueue } from '../../lib/jobs';

// WayForPay integration point. Its wire format (signature fields, callback shape) is unverified
// until V6–V11 are read from current official documentation (26 §26.14.1), so the real adapter is
// not written. The development stub imitates the flow: payment page → callback → receipt.

export async function startPayment(guestToken: string) {
  const o = await prisma.order.findUnique({ where: { guestToken } });
  if (!o) throw new AppError(404, 'NOT_FOUND');
  if (!o.amountDueNowMinor || o.paymentStatus === 'PAID') throw new AppError(409, 'VALIDATION_FAILED', 'NOTHING_TO_PAY');
  if (!config.payments.stub) throw new AppError(503, 'SERVICE_UNAVAILABLE', 'PAYMENTS_NOT_CONFIGURED');
  return { mode: 'stub' as const, redirectUrl: `/api/v1/dev/wayforpay/${guestToken}` };
}

/** Applies a successful or failed payment once; replays are ignored (idempotency key per attempt). */
export async function completeStubPayment(guestToken: string, approved: boolean) {
  const o = await prisma.order.findUnique({ where: { guestToken } });
  if (!o || !o.amountDueNowMinor) throw new AppError(404, 'NOT_FOUND');
  const ref = `stub-${randomToken(8)}`;
  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.create({
      data: { orderId: o.id, provider: 'wayforpay-stub', providerRef: ref, status: approved ? 'PAID' : 'FAILED', amountMinor: o.amountDueNowMinor!, currency: 'UAH', rawPayload: { stub: true, approved }, idempotencyKey: ref },
    });
    if (!approved) {
      await tx.orderEvent.create({ data: { orderId: o.id, type: 'payment_failed', payload: { ref } } });
      return;
    }
    const full = o.paymentMethod === 'CARD_ONLINE' && !o.prepaymentMinor;
    await tx.order.update({ where: { id: o.id }, data: { paymentStatus: full ? 'PAID' : o.paymentStatus, paidAt: new Date() } });
    await tx.orderEvent.create({ data: { orderId: o.id, type: 'payment_received', toValue: full ? 'PAID' : 'PARTIAL', payload: { amountMinor: o.amountDueNowMinor, ref } } });
    if (o.email) await enqueue('mail.send', { kind: 'order_paid', orderId: o.id }, tx);
    // Round 20 #202: «Оплата надійшла» in the Telegram group.
    await enqueue('notify.telegram', { kind: 'payment', orderId: o.id, amountMinor: o.amountDueNowMinor ?? undefined }, tx);
    // Round 14: WayForPay's built-in ПРРО issues the receipt; the stub issues a clearly-marked test one.
    await tx.fiscalReceipt.create({
      data: { orderId: o.id, kind: 'SALE', status: 'ISSUED', amountMinor: o.amountDueNowMinor!, provider: 'wayforpay-stub', fiscalCode: `ТЕСТ-${ref.slice(5, 11).toUpperCase()}`, isPrepayment: !full, issuedAt: new Date() },
    });
  });
}
