import { useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { MascotScene } from '@/features/mascot/MascotScene';
import { useQuery } from '@tanstack/react-query';
import type { Locale, OrderView } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { formatUah } from '@/lib/money';
import { path } from '@/lib/segments';
import { t, type MessageKey } from '@/lib/i18n';
import { localeOf, titled } from '@/lib/seo';
import type { Route } from './+types/order';

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  return [{ title: titled(t(locale, 'order.title'), locale) }];
}

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const status = (s: string, locale: Locale) => (STATUSES.includes(s) ? t(locale, `order.status.${s}` as MessageKey) : s);

const qty = (milli: number, unit: string, locale: Locale) => (unit === 'PIECE' ? `${milli / 1000} ${t(locale, 'unit.pcs')}` : unit === 'KILOGRAM' ? `${(milli / 1000).toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA')} ${t(locale, 'unit.kg')}` : `${milli / 1000}`);

// The API writes these order-view labels in Ukrainian; an English page renders its own.
const DELIVERY_EN: Record<string, string> = { NP_BRANCH: 'Nova Poshta, branch', NP_COURIER: 'Nova Poshta, courier', UKRPOSHTA: 'Ukrposhta', PICKUP: 'Pickup, Yavoriv' };
const deliveryLabel = (o: OrderView, locale: Locale) =>
  locale === 'en' && DELIVERY_EN[o.delivery.method] ? [DELIVERY_EN[o.delivery.method], ...o.delivery.label.split(' · ').slice(1)].join(' · ') : o.delivery.label;
const discountLabel = (o: OrderView, locale: Locale) =>
  locale !== 'en' ? o.discountLabel ?? t(locale, 'order.discount')
  : o.discountLabel?.startsWith('Промокод') ? o.discountLabel.replace(/^Промокод/, 'Promo code')
  : o.discountLabel === 'Оптова знижка' ? t(locale, 'cart.volumeDiscount') : t(locale, 'order.discount');
const itemOptions = (options: string, locale: Locale) =>
  locale === 'en' ? options.replace(/свій розмір (\d+)×(\d+) см/, (_, w: string, l: string) => t(locale, 'cart.customSpec', { w, l })) : options;

/** Round 14 F5: the receipt card lives on this page only, under the order summary. */
function ReceiptCard({ o, locale }: { o: OrderView; locale: Locale }) {
  const r = o.receipts.find((x) => x.kind === 'SALE');
  if (!r) {
    if (o.paidMinor === 0) return null;
    return (
      <section aria-live="polite" className="rounded-xl border border-dashed border-accent bg-bg-surface p-5">
        <h2 className="text-h4 text-text-primary">{t(locale, 'receipt.title')}</h2>
        <p className="text-body text-text-body">{t(locale, 'receipt.pending')}</p>
      </section>
    );
  }
  const test = r.fiscalCode?.startsWith('ТЕСТ');
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed border-accent bg-bg-surface p-5">
      <h2 className="flex items-center gap-3 text-h4 text-text-primary">
        {r.isPrepayment ? t(locale, 'receipt.prepayTitle') : t(locale, 'receipt.title')}
        <span className="ml-auto rounded-full bg-bg-alt px-2.5 py-0.5 text-caption font-semibold text-success">{t(locale, 'receipt.issued')}</span>
      </h2>
      {r.isPrepayment && <p className="rounded-sm bg-bg-alt px-3 py-2 text-body-sm">{t(locale, 'receipt.prepayNote', { amount: formatUah(r.amountMinor, locale), rest: formatUah(o.balanceOnDeliveryMinor, locale) })}</p>}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
        <dt className="text-text-muted">{t(locale, 'receipt.amount')}</dt><dd className="font-semibold">{formatUah(r.amountMinor, locale)}</dd>
        <dt className="text-text-muted">{t(locale, 'receipt.fiscalNumber')}</dt><dd>{r.fiscalCode}</dd>
        <dt className="text-text-muted">{t(locale, 'receipt.tax')}</dt><dd>{t(locale, 'receipt.noVat')}</dd>
        <dt className="text-text-muted">{t(locale, 'receipt.order')}</dt><dd>{t(locale, 'order.number', { n: o.number })}</dd>
      </dl>
      {test ? <p className="text-caption text-text-muted">{t(locale, 'receipt.test')}</p>
        : r.receiptUrl && <a href={r.receiptUrl} className="text-body text-text-primary underline">{t(locale, 'receipt.check')}</a>}
    </section>
  );
}

const payLabel = (payment: string, locale: Locale) =>
  payment === 'CARD' || payment === 'PREPAYMENT' || payment === 'COD_INSPECTION' ? t(locale, `pay.${payment}`) : t(locale, 'pay.default');

/** The payment link for orders created by staff after a call, and a retry after a failed payment. */
function PayBox({ o, locale, token }: { o: OrderView; locale: Locale; token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pay = async () => {
    setBusy(true); setErr('');
    const r = await fetch(`/api/v1/orders/${token}/pay`, { method: 'POST' }).then((x) => x.json()).catch(() => null);
    if (r?.redirectUrl) { window.location.assign(r.redirectUrl); return; }
    setBusy(false); setErr(t(locale, 'pay.unavailable'));
  };
  return (
    <section className="flex flex-col gap-3 rounded-xl border-2 border-text-primary bg-bg-surface p-5">
      <h2 className="text-h4 text-text-primary">{payLabel(o.payment, locale)}: {formatUah(o.amountDueNowMinor, locale)}</h2>
      <button type="button" onClick={pay} disabled={busy} aria-busy={busy} className={`min-h-12 rounded-md bg-bg-inverted px-6 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${busy ? 'vk-busy disabled:opacity-100' : ''}`}>
        {busy ? t(locale, 'common.wait') : t(locale, 'pay.button', { amount: formatUah(o.amountDueNowMinor, locale) })}
      </button>
      <p className="text-caption text-text-muted">{t(locale, 'pay.agreeBefore')} <Link to={path.seg(locale, 'terms')} className="underline">{t(locale, 'pay.agreeLink')}</Link>.</p>
      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
    </section>
  );
}

// Round 18: payment by bank transfer. The details are shown at once (the email module comes later),
// with the order number as the payment purpose so the transfer can be matched to the order.
function Copy({ text, locale }: { text: string; locale: Locale }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked: the text is selectable */ } }}
      className="shrink-0 rounded-md border border-border-control px-2.5 py-1 text-caption font-semibold text-text-primary">{done ? t(locale, 'iban.copied') : t(locale, 'iban.copy')}</button>
  );
}

function IbanBox({ number, amountMinor, locale }: { number: string; amountMinor: number; locale: Locale }) {
  // The recipient and the payment reference stay Ukrainian on every locale: the Ukrainian bank reads them.
  const purpose = `Оплата замовлення № ${number}, без ПДВ`;
  const rows: Array<[string, string, string?]> = [
    [t(locale, 'iban.recipient'), BUSINESS.legalEntityName],
    [t(locale, 'iban.taxId'), BUSINESS.legalId, BUSINESS.legalId],
    ['IBAN', BUSINESS.iban.replace(/(.{4})/g, '$1 ').trim(), BUSINESS.iban],
    [t(locale, 'iban.amount'), formatUah(amountMinor, locale)],
    [t(locale, 'iban.purpose'), purpose, purpose],
  ];
  const purposeHint = t(locale, 'iban.purposeHint');
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5 text-body">
      <h2 className="text-caption font-semibold tracking-wide text-text-muted">{t(locale, 'iban.heading')}</h2>
      <dl className="flex flex-col gap-2.5">
        {rows.map(([k, v, copy]) => (
          <div key={k} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <dt className="text-text-muted">{k}{k === t(locale, 'iban.purpose') && purposeHint && <span className="block text-caption">{purposeHint}</span>}</dt>
            <dd className="flex min-w-0 items-center gap-2 font-semibold text-text-primary"><span className="break-all select-all tabular-nums">{v}</span>{copy && <Copy text={copy} locale={locale} />}</dd>
          </div>
        ))}
      </dl>
      <p className="text-body-sm text-text-muted">{t(locale, 'iban.note')}</p>
    </section>
  );
}

export default function OrderPage() {
  const biz = useBusiness();
  const { locale = 'uk', token = '' } = useParams();
  const [params] = useSearchParams();
  const { data: o, isError } = useQuery({
    queryKey: ['order', token],
    queryFn: async () => {
      const r = await fetch(`/api/v1/orders/${token}`);
      if (!r.ok) throw new Error(String(r.status));
      return (await r.json()) as OrderView;
    },
    // Poll briefly while a paid order waits for its receipt (round 14 F5: every 3 s up to 60 s).
    refetchInterval: (q) => (q.state.data && q.state.data.paidMinor > 0 && q.state.data.receipts.length === 0 && q.state.dataUpdateCount < 20 ? 3000 : false),
  });
  const l = locale as Locale;
  const failed = params.get('paid') === '0';
  // Round 11 #49: the waving shepherd greets a just-placed or just-paid order; a failed payment gets
  // a clear message and no motion (#50); a later visit to the tracking page stays quiet.
  const fresh = !!(useLocation().state as { fresh?: boolean } | null)?.fresh || params.get('paid') === '1';

  if (isError) return <p className="mx-auto max-w-(--container-form) px-4 py-20 text-center text-body">{t(l, 'order.notFound')}</p>;
  if (!o) return <p className="mx-auto max-w-(--container-form) px-4 py-20 text-center text-body text-text-muted">{t(l, 'order.loading')}</p>;

  return (
    <div className="mx-auto flex max-w-[48rem] flex-col gap-5 px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        {fresh && !failed
          ? <MascotScene kind="thanks" className="w-72 max-w-full" />
          : <span className="grid size-12 place-items-center rounded-full bg-bg-inverted text-h3 text-text-on-inverted" aria-hidden="true">✓</span>}
        <h1 className="text-h1 text-text-primary">{t(l, 'order.thanks')}</h1>
        <span className="text-body text-text-muted">{t(l, 'order.number', { n: o.number })} · {status(o.status, l)}</span>
      </div>

      {failed && (
        <p role="alert" className="rounded-md border border-danger bg-bg-surface px-4 py-3 text-body">
          {t(l, 'order.failed', { phone: biz.phones[0] ?? '' })}
        </p>
      )}

      <section className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-5 text-body">
        <h2 className="text-caption font-semibold tracking-wide text-text-muted">{t(l, 'order.heading')}</h2>
        {o.items.map((i, n) => (
          <div key={n} className="flex justify-between gap-3">
            <span>{i.name}<span className="block text-caption text-text-muted">{[itemOptions(i.options, l), qty(i.quantityMilli, i.pricingUnit, l)].filter(Boolean).join(' · ')}</span></span>
            <span className="shrink-0">{formatUah(i.totalMinor, l)}</span>
          </div>
        ))}
        {o.discountMinor > 0 && <div className="flex justify-between text-success"><span>{discountLabel(o, l)}</span><span>−{formatUah(o.discountMinor, l)}</span></div>}
        {o.shippingMinor !== null && <div className="flex justify-between"><span>{t(l, 'order.delivery')} · {deliveryLabel(o, l)}</span><span>{formatUah(o.shippingMinor, l)}</span></div>}
        <div className="flex justify-between border-t border-border-hairline pt-2 text-h4 text-text-primary"><span>{t(l, 'order.total')}</span><span>{o.totalMinor !== null ? formatUah(o.totalMinor, l) : '—'}</span></div>
        {o.paidMinor > 0 && <span className="text-text-muted">{t(l, 'order.paidOnline', { paid: formatUah(o.paidMinor, l) })}{o.balanceOnDeliveryMinor > 0 ? t(l, 'order.atPostOffice', { rest: formatUah(o.balanceOnDeliveryMinor, l) }) : ''}</span>}
      </section>

      {o.payment === 'IBAN' && o.totalMinor !== null && !['CANCELLED', 'RETURNED'].includes(o.status) && <IbanBox number={o.number} amountMinor={o.totalMinor - o.paidMinor} locale={l} />}

      {o.payment !== 'IBAN' && o.paidMinor === 0 && o.amountDueNowMinor > 0 && !['CANCELLED', 'RETURNED'].includes(o.status) && <PayBox o={o} locale={l} token={token} />}

      <ReceiptCard o={o} locale={l} />

      <p className="text-center text-body-sm text-text-muted">{t(l, 'order.keepLink', { phone: biz.phones[0] ?? '' })}</p>
    </div>
  );
}
