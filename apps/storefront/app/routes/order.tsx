import { useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { MascotScene } from '@/features/mascot/MascotScene';
import { useQuery } from '@tanstack/react-query';
import type { Locale, OrderView } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import { formatUah } from '@/lib/money';
import { path } from '@/lib/segments';

export const meta = () => [{ title: 'Замовлення — Вівчарик' }];

const STATUS: Record<string, string> = {
  PENDING: 'Прийнято, зателефонуємо для підтвердження',
  CONFIRMED: 'Підтверджено',
  IN_PRODUCTION: 'Виготовляємо',
  PACKING: 'Пакуємо',
  SHIPPED: 'Відправлено',
  DELIVERED: 'Отримано',
  CANCELLED: 'Скасовано',
  RETURNED: 'Повернено',
};

const qty = (milli: number, unit: string) => (unit === 'PIECE' ? `${milli / 1000} шт.` : unit === 'KILOGRAM' ? `${(milli / 1000).toLocaleString('uk-UA')} кг` : `${milli / 1000}`);

/** Round 14 F5: the receipt card lives on this page only, under the order summary. */
function ReceiptCard({ o, locale }: { o: OrderView; locale: Locale }) {
  const r = o.receipts.find((x) => x.kind === 'SALE');
  if (!r) {
    if (o.paidMinor === 0) return null;
    return (
      <section aria-live="polite" className="rounded-xl border border-dashed border-accent bg-bg-surface p-5">
        <h2 className="text-h4 text-text-primary">Фіскальний чек</h2>
        <p className="text-body text-text-body">Чек формується…</p>
      </section>
    );
  }
  const test = r.fiscalCode?.startsWith('ТЕСТ');
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed border-accent bg-bg-surface p-5">
      <h2 className="flex items-center gap-3 text-h4 text-text-primary">
        {r.isPrepayment ? 'Чек на передоплату' : 'Фіскальний чек'}
        <span className="ml-auto rounded-full bg-bg-alt px-2.5 py-0.5 text-caption font-semibold text-success">✓ Видано</span>
      </h2>
      {r.isPrepayment && <p className="rounded-sm bg-bg-alt px-3 py-2 text-body-sm">Це чек на передоплату {formatUah(r.amountMinor, locale)}. Решту {formatUah(o.balanceOnDeliveryMinor, locale)} сплатите на пошті — чек на неї видасть Нова пошта.</p>}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
        <dt className="text-text-muted">Сума</dt><dd className="font-semibold">{formatUah(r.amountMinor, locale)}</dd>
        <dt className="text-text-muted">Фіскальний номер</dt><dd>{r.fiscalCode}</dd>
        <dt className="text-text-muted">Податок</dt><dd>Без ПДВ</dd>
        <dt className="text-text-muted">Замовлення</dt><dd>№ {o.number}</dd>
      </dl>
      {test ? <p className="text-caption text-text-muted">Тестовий чек: справжні чеки видаватиме каса WayForPay після підключення.</p>
        : r.receiptUrl && <a href={r.receiptUrl} className="text-body text-text-primary underline">Перевірити в податковій</a>}
    </section>
  );
}

const PAY_LABEL: Record<string, string> = { CARD: 'Оплата карткою', PREPAYMENT: 'Передоплата', COD_INSPECTION: 'Доставка в обидва боки (решту — на пошті)' };

/** The payment link for orders created by staff after a call, and a retry after a failed payment. */
function PayBox({ o, locale, token }: { o: OrderView; locale: Locale; token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pay = async () => {
    setBusy(true); setErr('');
    const r = await fetch(`/api/v1/orders/${token}/pay`, { method: 'POST' }).then((x) => x.json()).catch(() => null);
    if (r?.redirectUrl) { window.location.assign(r.redirectUrl); return; }
    setBusy(false); setErr('Оплата зараз недоступна. Зателефонуйте нам, будь ласка.');
  };
  return (
    <section className="flex flex-col gap-3 rounded-xl border-2 border-text-primary bg-bg-surface p-5">
      <h2 className="text-h4 text-text-primary">{PAY_LABEL[o.payment] ?? 'Оплата'}: {formatUah(o.amountDueNowMinor, locale)}</h2>
      <button type="button" onClick={pay} disabled={busy} aria-busy={busy} className={`min-h-12 rounded-md bg-bg-inverted px-6 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${busy ? 'vk-busy disabled:opacity-100' : ''}`}>
        {busy ? 'Зачекайте…' : `Оплатити ${formatUah(o.amountDueNowMinor, locale)}`}
      </button>
      <p className="text-caption text-text-muted">Оплачуючи, ви погоджуєтеся з умовами <Link to={path.seg(locale, 'terms')} className="underline">договору оферти</Link>.</p>
      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
    </section>
  );
}

// Round 18: payment by bank transfer. The details are shown at once (the email module comes later),
// with the order number as the payment purpose so the transfer can be matched to the order.
function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked: the text is selectable */ } }}
      className="shrink-0 rounded-md border border-border-control px-2.5 py-1 text-caption font-semibold text-text-primary">{done ? 'Скопійовано' : 'Копіювати'}</button>
  );
}

function IbanBox({ number, amountMinor, locale }: { number: string; amountMinor: number; locale: Locale }) {
  const purpose = `Оплата замовлення № ${number}, без ПДВ`;
  const rows: Array<[string, string, string?]> = [
    ['Отримувач', BUSINESS.legalEntityName],
    ['РНОКПП', BUSINESS.legalId, BUSINESS.legalId],
    ['IBAN', BUSINESS.iban.replace(/(.{4})/g, '$1 ').trim(), BUSINESS.iban],
    ['Сума', formatUah(amountMinor, locale)],
    ['Призначення', purpose, purpose],
  ];
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5 text-body">
      <h2 className="text-caption font-semibold tracking-wide text-text-muted">РЕКВІЗИТИ ДЛЯ ОПЛАТИ</h2>
      <dl className="flex flex-col gap-2.5">
        {rows.map(([k, v, copy]) => (
          <div key={k} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <dt className="text-text-muted">{k}</dt>
            <dd className="flex min-w-0 items-center gap-2 font-semibold text-text-primary"><span className="break-all select-all tabular-nums">{v}</span>{copy && <Copy text={copy} />}</dd>
          </div>
        ))}
      </dl>
      <p className="text-body-sm text-text-muted">Відправимо замовлення, щойно оплата надійде на рахунок. Вкажіть номер замовлення в призначенні платежу.</p>
    </section>
  );
}

export default function OrderPage() {
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

  if (isError) return <p className="mx-auto max-w-(--container-form) px-4 py-20 text-center text-body">Замовлення не знайдено.</p>;
  if (!o) return <p className="mx-auto max-w-(--container-form) px-4 py-20 text-center text-body text-text-muted">Завантаження…</p>;

  return (
    <div className="mx-auto flex max-w-[48rem] flex-col gap-5 px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        {fresh && !failed
          ? <MascotScene kind="thanks" className="w-72 max-w-full" />
          : <span className="grid size-12 place-items-center rounded-full bg-bg-inverted text-h3 text-text-on-inverted" aria-hidden="true">✓</span>}
        <h1 className="text-h1 text-text-primary">Дякуємо за замовлення!</h1>
        <span className="text-body text-text-muted">№ {o.number} · {STATUS[o.status] ?? o.status}</span>
      </div>

      {failed && (
        <p role="alert" className="rounded-md border border-danger bg-bg-surface px-4 py-3 text-body">
          Оплата не пройшла. Спробуйте ще раз або оберіть інший спосіб — зателефонуйте нам {BUSINESS.phones[0]}.
        </p>
      )}

      <section className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-5 text-body">
        <h2 className="text-caption font-semibold tracking-wide text-text-muted">ЗАМОВЛЕННЯ</h2>
        {o.items.map((i, n) => (
          <div key={n} className="flex justify-between gap-3">
            <span>{i.name}<span className="block text-caption text-text-muted">{[i.options, qty(i.quantityMilli, i.pricingUnit)].filter(Boolean).join(' · ')}</span></span>
            <span className="shrink-0">{formatUah(i.totalMinor, l)}</span>
          </div>
        ))}
        {o.discountMinor > 0 && <div className="flex justify-between text-success"><span>{o.discountLabel ?? 'Знижка'}</span><span>−{formatUah(o.discountMinor, l)}</span></div>}
        {o.shippingMinor !== null && <div className="flex justify-between"><span>Доставка · {o.delivery.label}</span><span>{formatUah(o.shippingMinor, l)}</span></div>}
        <div className="flex justify-between border-t border-border-hairline pt-2 text-h4 text-text-primary"><span>Разом</span><span>{o.totalMinor !== null ? formatUah(o.totalMinor, l) : '—'}</span></div>
        {o.paidMinor > 0 && <span className="text-text-muted">Оплачено онлайн: {formatUah(o.paidMinor, l)}{o.balanceOnDeliveryMinor > 0 ? ` · на пошті: ${formatUah(o.balanceOnDeliveryMinor, l)}` : ''}</span>}
      </section>

      {o.payment === 'IBAN' && o.totalMinor !== null && !['CANCELLED', 'RETURNED'].includes(o.status) && <IbanBox number={o.number} amountMinor={o.totalMinor - o.paidMinor} locale={l} />}

      {o.payment !== 'IBAN' && o.paidMinor === 0 && o.amountDueNowMinor > 0 && !['CANCELLED', 'RETURNED'].includes(o.status) && <PayBox o={o} locale={l} token={token} />}

      <ReceiptCard o={o} locale={l} />

      <p className="text-center text-body-sm text-text-muted">Збережіть посилання на цю сторінку — за ним ви знову побачите замовлення і чек. Питання? {BUSINESS.phones[0]}</p>
    </div>
  );
}
