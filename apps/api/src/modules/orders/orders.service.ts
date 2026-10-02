import type { CheckoutPayment, OrderView } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

const DELIVERY_LABEL: Record<string, string> = { NP_BRANCH: 'Нова пошта, відділення', NP_COURIER: 'Нова пошта, кур\'єр', UKRPOSHTA: 'Укрпошта', PICKUP: 'Самовивіз, Яворів' };

export function paymentKey(o: { paymentMethod: string; prepaymentMinor: number | null }): CheckoutPayment {
  if (o.paymentMethod === 'COD') return 'COD_INSPECTION';
  if (o.paymentMethod === 'BANK_TRANSFER') return 'IBAN';
  return o.prepaymentMinor ? 'PREPAYMENT' : 'CARD';
}

/** Guest access by token only; no identity exists (26 §26.10.5). */
export async function orderByToken(guestToken: string): Promise<OrderView> {
  const o = await prisma.order.findUnique({
    where: { guestToken },
    include: { items: true, fiscalReceipts: { orderBy: { createdAt: 'asc' } }, payments: { where: { status: 'PAID' }, select: { amountMinor: true } } },
  });
  if (!o) throw new AppError(404, 'NOT_FOUND');
  const addr = o.shippingAddress as { method: keyof typeof DELIVERY_LABEL; city?: string | null; warehouseLabel?: string | null; address?: string | null };
  const place = addr.warehouseLabel ?? [addr.address, addr.city].filter(Boolean).join(', ');
  const label = [DELIVERY_LABEL[addr.method] ?? '', place].filter(Boolean).join(' · ');
  const payment = paymentKey(o);
  return {
    number: o.number,
    status: o.status,
    paymentStatus: o.paymentStatus,
    payment,
    placedAt: o.placedAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.nameSnapshot,
      options: [
        ...(i.customSpec ? [`свій розмір ${(i.customSpec as { widthCm: number }).widthCm}×${(i.customSpec as { lengthCm: number }).lengthCm} см`] : []),
        ...Object.entries(i.optionsSnapshot as Record<string, { label: string }>).filter(([k]) => !(i.customSpec && k === 'size')).map(([, v]) => v.label),
      ].join(' · '),
      quantityMilli: i.quantityMilli,
      pricingUnit: i.pricingUnitSnapshot,
      totalMinor: i.totalMinor,
    })),
    subtotalMinor: o.subtotalMinor,
    discountMinor: o.discountMinor,
    discountLabel: o.discountMinor > 0 ? (o.discountSource === 'PROMO_CODE' ? `Промокод ${o.couponCode ?? ''}`.trim() : 'Оптова знижка') : null,
    shippingMinor: o.shippingMinor ?? o.shippingForwardMinor,
    totalMinor: o.totalMinor,
    amountDueNowMinor: o.amountDueNowMinor ?? 0,
    paidMinor: o.payments.reduce((sum, p) => sum + p.amountMinor, 0),
    balanceOnDeliveryMinor: payment === 'COD_INSPECTION' ? (o.codAmountMinor ?? 0) : payment === 'PREPAYMENT' ? (o.totalMinor ?? 0) - (o.prepaymentMinor ?? 0) : 0,
    delivery: { method: addr.method as OrderView['delivery']['method'], label },
    receipts: o.fiscalReceipts.map((r) => ({ kind: r.kind, status: r.status, amountMinor: r.amountMinor, fiscalCode: r.fiscalCode, receiptUrl: r.receiptUrl, isPrepayment: r.isPrepayment, issuedAt: r.issuedAt?.toISOString() ?? null })),
  };
}
