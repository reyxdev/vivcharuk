import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Search, ShieldAlert, X } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { PAYMENT_LABEL, dateTime, uah } from '@/lib/format';
import { CopyButton, PageHeader, PrimaryButton, useUnsavedGuard } from '@/components/ui';
import { useRefresh, type QuickRow } from './api';

interface Variant { id: string; sku: string; priceMinor: number; stockQty: number; madeToOrderDays: number | null; name: string; options: string }
interface Line { variant: Variant; quantity: number }
interface Quote {
  subtotalMinor: number; discountMinor: number; shippingMinor: number | null; shippingIsTest: boolean; totalMinor: number | null; emailRequired: boolean;
  payments: Array<{ key: string; amountNowMinor: number; balanceOnDeliveryMinor: number }>;
}
interface Lookup {
  found: boolean; phone?: string; fullName?: string; email?: string | null; orders?: number; lastOrder?: { number: string; placedAt: string };
  delivery?: { method: string | null; city: string | null; cityRef: string | null; warehouseRef: string | null; warehouseLabel: string | null; address: string | null; postalCode: string | null };
  caution?: string | null;
}

const DELIVERY = [['NP_BRANCH', 'Нова пошта — відділення / поштомат'], ['NP_COURIER', "Нова пошта — кур'єр"], ['UKRPOSHTA', 'Укрпошта'], ['PICKUP', 'Самовивіз, Яворів']] as const;
type Method = (typeof DELIVERY)[number][0];
const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary max-md:py-3';
const box = 'flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4';
const h2 = 'flex items-center gap-2 text-overline uppercase tracking-wide text-text-muted';
const Num = ({ n }: { n: number }) => <span className="flex size-5 items-center justify-center rounded-full bg-accent text-caption font-semibold text-white">{n}</span>;
const phoneDigits = (p: string) => p.replace(/\D/g, '');

/**
 * «Нове замовлення» after a call (#215–216): Покупець · Товари · Доставка · Оплата on one page. Typing
 * the phone finds the buyer's earlier order and fills the name and address. Prices, discount, payment
 * methods and the prepayment floor come from the server quote — the same code the storefront runs.
 */
export function NewOrderPage() {
  const [params] = useSearchParams();
  const quickId = params.get('quick') ?? undefined;
  const refresh = useRefresh();
  const [lines, setLines] = useState<Line[]>([]);
  const [q, setQ] = useState('');
  const [delivery, setDelivery] = useState<Method>('NP_BRANCH');
  // «Створити замовлення з листа» (round 19 D1 #36): the letter's name and e-mail come prefilled.
  const [contact, setContact] = useState({ fullName: params.get('name') ?? '', phone: '+380', email: params.get('email') ?? '' });
  const [cityQ, setCityQ] = useState('');
  const [city, setCity] = useState<{ ref: string; name: string } | null>(null);
  const [wh, setWh] = useState<{ ref: string; label: string } | null>(null);
  const [addr, setAddr] = useState({ address: '', postalCode: '' });
  const [payment, setPayment] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ number: string; payLink: string; amountDueNowMinor: number; payment: string } | null>(null);
  useUnsavedGuard(!done && (lines.length > 0 || contact.fullName.trim().length > 0));

  // Prefill from a «1 клік» request: its phone and its product.
  const { data: quick } = useQuery({ queryKey: ['quick-orders', 'one', quickId], enabled: !!quickId, queryFn: () => api<QuickRow>(`/admin/quick-orders/${quickId}`) });
  useEffect(() => {
    if (!quick) return;
    setContact((c) => ({ ...c, phone: quick.phone }));
    if (quick.product) void api<{ items: Variant[] }>(`/admin/variants?q=${encodeURIComponent(quick.product.sku)}`).then((r) => {
      const v = r.items.find((x) => x.id === quick.variantId) ?? r.items.find((x) => x.sku === quick.product!.sku);
      if (v) setLines([{ variant: v, quantity: quick.quantity }]);
    });
  }, [quick]);

  // #216: the phone finds the buyer. Empty fields are filled once per number.
  const digits = phoneDigits(contact.phone);
  const lookup = useQuery({ queryKey: ['orders', 'customer-lookup', digits.slice(-9)], enabled: digits.length >= 12, staleTime: 60_000, queryFn: () => api<Lookup>(`/admin/orders/customer-lookup?phone=${encodeURIComponent(contact.phone)}`) });
  const filledFor = useRef('');
  useEffect(() => {
    const l = lookup.data;
    if (!l?.found || filledFor.current === digits) return;
    filledFor.current = digits;
    setContact((c) => ({ ...c, fullName: c.fullName.trim() ? c.fullName : l.fullName ?? '', email: c.email.trim() ? c.email : l.email ?? '' }));
    const d = l.delivery;
    if (d?.method && DELIVERY.some(([k]) => k === d.method) && !city) {
      setDelivery(d.method as Method);
      if (d.city && d.cityRef) setCity({ ref: d.cityRef, name: d.city });
      if (d.warehouseRef && d.warehouseLabel) setWh({ ref: d.warehouseRef, label: d.warehouseLabel });
      if (d.address) setAddr({ address: d.address, postalCode: d.postalCode ?? '' });
    }
  }, [lookup.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const search = useQuery({ queryKey: ['variants', q], enabled: q.trim().length >= 2, queryFn: () => api<{ items: Variant[] }>(`/admin/variants?q=${encodeURIComponent(q.trim())}`) });
  const cities = useQuery({ queryKey: ['np-cities', cityQ], enabled: cityQ.trim().length >= 2 && !city, queryFn: () => api<{ items: Array<{ ref: string; name: string }> }>(`/checkout/np/cities?q=${encodeURIComponent(cityQ)}`) });
  const whs = useQuery({ queryKey: ['np-wh', city?.ref], enabled: !!city && delivery === 'NP_BRANCH', queryFn: () => api<{ items: Array<{ ref: string; label: string }> }>(`/checkout/np/warehouses?cityRef=${city!.ref}`) });
  const body = lines.map((l) => ({ variantId: l.variant.id, quantity: l.quantity }));
  const quote = useQuery({ queryKey: ['admin-quote', body, delivery], enabled: lines.length > 0, queryFn: () => post<Quote>('/admin/orders/quote', { lines: body, delivery }) });
  useEffect(() => { if (quote.data && !quote.data.payments.some((p) => p.key === payment)) setPayment(quote.data.payments[0]?.key ?? ''); }, [quote.data, payment]);

  const addLine = (v: Variant) => { setLines((ls) => (ls.some((l) => l.variant.id === v.id) ? ls : [...ls, { variant: v, quantity: 1 }])); setQ(''); };
  const setQty = (i: number, n: number) => setLines(lines.map((x, k) => (k === i ? { ...x, quantity: Math.min(500, Math.max(1, n)) } : x)));
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const r = await post<{ number: string; payLink: string; amountDueNowMinor: number; payment: string }>('/admin/orders', {
        lines: body, quickOrderId: quickId,
        order: {
          contact: { fullName: contact.fullName.trim(), phone: contact.phone, email: contact.email.trim() || undefined },
          delivery: { method: delivery, city: city?.name, cityRef: city?.ref, warehouseRef: wh?.ref, warehouseLabel: wh?.label, address: addr.address || undefined, postalCode: addr.postalCode || undefined },
          payment,
        },
      });
      setDone(r);
      void refresh();
    } catch (e) {
      const f = e instanceof ApiError ? e.body?.error.fieldErrors?.[0] : undefined;
      setErr(f ? `Перевірте поле: ${f.path}` : e instanceof ApiError ? messageFor(e.code) : messageFor(''));
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <PageHeader back="/orders" title={`Замовлення ${done.number} створено`} />
        {done.payment === 'IBAN'
          ? <p className="text-body text-text-body">Оплата на рахунок IBAN: надішліть покупцю рахунок — на сторінці замовлення «⋯» → Друк: рахунок покупцю.</p>
          : <p className="text-body text-text-body">Надішліть покупцю посилання на оплату ({uah(done.amountDueNowMinor)}) у Viber, Telegram чи SMS:</p>}
        <div className="flex items-center gap-2 rounded-lg border border-border-control bg-bg-input px-3 py-2">
          <input readOnly value={done.payLink} aria-label="Посилання на оплату" className="min-w-0 flex-1 bg-transparent text-body-sm text-text-primary outline-none" onFocus={(e) => e.currentTarget.select()} />
          <CopyButton value={done.payLink} label="посилання" />
        </div>
        <Link to={`/orders/${done.number}`} className="inline-flex min-h-10 items-center self-start rounded-lg bg-accent px-4 text-body-sm font-semibold text-white max-md:min-h-12">Відкрити замовлення</Link>
      </div>
    );
  }

  const needsWh = delivery === 'NP_BRANCH';
  const needsAddr = delivery === 'NP_COURIER' || delivery === 'UKRPOSHTA';
  const phoneOk = /^\+380\d{9}$/.test(contact.phone.replace(/[^\d+]/g, ''));
  const nameOk = contact.fullName.trim().split(/\s+/).length >= 2;
  const ready = lines.length > 0 && nameOk && phoneOk && (!needsWh || !!wh) && (!needsAddr || (!!city && !!addr.address)) && !!payment && (!quote.data?.emailRequired || !!contact.email) && quote.data?.totalMinor != null;
  const missing = [!phoneOk && 'телефон', !nameOk && "прізвище та ім'я", !lines.length && 'товари', needsWh && !wh && 'відділення', needsAddr && (!city || !addr.address) && 'адресу', quote.data?.emailRequired && !contact.email && 'email'].filter(Boolean);
  const l = lookup.data;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader back="/orders" title="Нове замовлення" sub={quick ? `Дзвінок «1 клік» · ${quick.phone}` : 'Після дзвінка'} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <section className={box}>
            <h2 className={h2}><Num n={1} />Покупець</h2>
            <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+380…" inputMode="tel" aria-label="Телефон" autoFocus={!quickId} className={`${input} tabular`} />
            {l?.caution && <p className="flex items-start gap-2 rounded-lg bg-warning/15 px-3 py-2 text-body-sm text-text-primary"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-warning" /><span><b>Обережно:</b> {l.caution}</span></p>}
            {l?.found && <p className="text-body-sm text-text-muted">Знайшли покупця: {l.orders} замовл., останнє <Link to={`/orders/${l.lastOrder!.number}`} className="underline">{l.lastOrder!.number}</Link> · {dateTime(l.lastOrder!.placedAt)}</p>}
            <input value={contact.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} placeholder="Прізвище та ім'я" aria-label="Прізвище та ім'я" autoComplete="off" className={input} />
            <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder={quote.data?.emailRequired ? 'Email (обов’язково)' : 'Email (необов’язково)'} aria-label="Email" type="email" inputMode="email" className={input} />
          </section>

          <section className={box}>
            <h2 className={h2}><Num n={2} />Товари</h2>
            {lines.map((ln, i) => (
              <div key={ln.variant.id} className="flex items-center gap-3 text-body">
                <span className="min-w-0 flex-1 text-text-primary">{ln.variant.name}{ln.variant.options ? ` · ${ln.variant.options}` : ''}
                  <span className="block text-caption text-text-muted">{ln.variant.sku} · {uah(ln.variant.priceMinor)} · на складі {ln.variant.stockQty}</span></span>
                <span className="flex items-center rounded-lg border border-border-control">
                  <button type="button" onClick={() => setQty(i, ln.quantity - 1)} aria-label="Менше" className="p-2 text-text-muted"><Minus size={15} /></button>
                  <input value={ln.quantity} onChange={(e) => setQty(i, Number(e.target.value.replace(/\D/g, '')) || 1)} inputMode="numeric" aria-label="Кількість" className="tabular w-10 bg-transparent text-center" />
                  <button type="button" onClick={() => setQty(i, ln.quantity + 1)} aria-label="Більше" className="p-2 text-text-muted"><Plus size={15} /></button>
                </span>
                <button type="button" onClick={() => setLines(lines.filter((_, n) => n !== i))} aria-label="Прибрати" className="rounded-full p-1.5 text-text-muted hover:bg-bg-alt"><X size={16} /></button>
              </div>
            ))}
            <label className="relative">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Додати товар: назва або артикул" aria-label="Пошук товару" className={`${input} pl-9`} />
            </label>
            {search.data && q.trim().length >= 2 && (
              <ul className="flex max-h-72 flex-col divide-y divide-border-hairline overflow-y-auto rounded-lg border border-border-hairline">
                {search.data.items.length === 0 && <li className="px-3 py-2 text-body-sm text-text-muted">Нічого не знайдено</li>}
                {search.data.items.map((v) => (
                  <li key={v.id}><button type="button" onClick={() => addLine(v)} className="w-full px-3 py-2 text-left text-body-sm hover:bg-bg-alt max-md:py-3">
                    {v.name}{v.options ? ` · ${v.options}` : ''} <span className="text-text-muted">{v.sku} · {uah(v.priceMinor)} · {v.stockQty} шт.</span>
                  </button></li>
                ))}
              </ul>
            )}
            {quote.isError && <p className="text-body-sm text-danger">Не вдалося порахувати: перевірте залишки.</p>}
          </section>

          <section className={box}>
            <h2 className={h2}><Num n={3} />Доставка</h2>
            <select value={delivery} onChange={(e) => { setDelivery(e.target.value as Method); setWh(null); }} aria-label="Спосіб доставки" className={input}>
              {DELIVERY.map(([k, lb]) => <option key={k} value={k}>{lb}</option>)}
            </select>
            {delivery !== 'PICKUP' && (
              city ? (
                <p className="flex items-center gap-3 text-body text-text-primary">{city.name}<button type="button" onClick={() => { setCity(null); setWh(null); }} className="text-body-sm text-text-muted underline">змінити</button></p>
              ) : (
                <>
                  <input value={cityQ} onChange={(e) => setCityQ(e.target.value)} placeholder="Місто" aria-label="Місто" className={input} />
                  {!!cities.data?.items.length && (
                    <ul className="flex max-h-60 flex-col divide-y divide-border-hairline overflow-y-auto rounded-lg border border-border-hairline">
                      {cities.data.items.map((c) => <li key={c.ref}><button type="button" onClick={() => setCity(c)} className="w-full px-3 py-2 text-left text-body-sm hover:bg-bg-alt max-md:py-3">{c.name}</button></li>)}
                    </ul>
                  )}
                </>
              )
            )}
            {needsWh && city && (
              <select value={wh?.ref ?? ''} onChange={(e) => setWh(whs.data?.items.find((w) => w.ref === e.target.value) ?? null)} aria-label="Відділення" className={input}>
                <option value="">{wh && !whs.data ? wh.label : 'Відділення або поштомат'}</option>
                {whs.data?.items.map((w) => <option key={w.ref} value={w.ref}>{w.label}</option>)}
              </select>
            )}
            {needsAddr && (
              <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
                <input value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="Вулиця, будинок, квартира" aria-label="Адреса" className={input} />
                <input value={addr.postalCode} onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })} placeholder="Індекс" aria-label="Індекс" inputMode="numeric" className={input} />
              </div>
            )}
          </section>
        </div>

        <section className={`${box} lg:sticky lg:top-4`}>
          <h2 className={h2}><Num n={4} />Оплата</h2>
          {!quote.data && <p className="text-body-sm text-text-muted">Додайте товари — тут з'явиться сума.</p>}
          {quote.data && (
            <>
              <dl className="tabular grid grid-cols-[1fr_auto] gap-y-1 text-body">
                <dt className="text-text-muted">Товари</dt><dd className="text-right">{uah(quote.data.subtotalMinor)}</dd>
                {quote.data.discountMinor > 0 && <><dt className="text-text-muted">Оптова знижка</dt><dd className="text-right">−{uah(quote.data.discountMinor)}</dd></>}
                <dt className="text-text-muted">Доставка{quote.data.shippingIsTest ? ' (тестовий тариф)' : ''}</dt><dd className="text-right">{uah(quote.data.shippingMinor)}</dd>
                <dt className="font-semibold text-text-primary">Разом</dt><dd className="text-right font-semibold text-text-primary">{uah(quote.data.totalMinor)}</dd>
              </dl>
              <fieldset className="flex flex-col gap-1">
                <legend className="mb-1 text-body-sm text-text-muted">Як платить</legend>
                {quote.data.payments.map((p) => (
                  <label key={p.key} className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1.5 text-body hover:bg-bg-alt">
                    <input type="radio" name="pay" className="mt-1 size-4 accent-[var(--accent)]" checked={payment === p.key} onChange={() => setPayment(p.key)} />
                    <span>{PAYMENT_LABEL[p.key] ?? p.key}<span className="block text-caption text-text-muted">зараз {uah(p.amountNowMinor)}{p.balanceOnDeliveryMinor ? ` · на пошті ${uah(p.balanceOnDeliveryMinor)}` : ''}</span></span>
                  </label>
                ))}
              </fieldset>
            </>
          )}
          {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
          <PrimaryButton disabled={!ready || busy} onClick={() => void submit()}>Створити замовлення</PrimaryButton>
          <p className="text-caption text-text-muted">{ready ? 'Замовлення одразу позначиться «Підтверджено дзвінком»; ви отримаєте посилання на оплату.' : `Ще потрібно: ${missing.join(', ') || 'сума'}.`}</p>
        </section>
      </div>
    </div>
  );
}
