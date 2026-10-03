import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MascotScene } from '@/features/mascot/MascotScene';
import { useLoaderData, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { CartResponse, CheckoutPayment, CheckoutQuote, DeliveryMethod, Locale } from '@vivcharyk/schemas';
import type { Route } from './+types/checkout';
import { apiGetAsVisitor } from '@/lib/api.server';
import { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_TEXT_EN } from '@vivcharyk/schemas';
import { formatUah } from '@/lib/money';
import { path } from '@/lib/segments';
import { useCart } from '@/features/cart/api';
import { t } from '@/lib/i18n';
import { localeOf, titled } from '@/lib/seo';

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  return [{ title: titled(t(locale, 'checkout.title'), locale) }];
}

/**
 * Round 24 G018: the order lines and the payment choice are in the server's HTML, so a reader
 * without JavaScript or an agent buying for its user sees them. The cart is the visitor's own (their
 * cookie); without a cart cookie the cart is empty by definition.
 */
export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const token = /(?:^|;\s*)vk_cart=([^;]+)/.exec(request.headers.get('cookie') ?? '')?.[1];
  if (!token) return { cart: null, quote: null, noCart: true };
  const cookie = `vk_cart=${token}`;
  const [cart, quote] = await Promise.all([
    apiGetAsVisitor<CartResponse>('/cart', locale, cookie),
    apiGetAsVisitor<CheckoutQuote>('/checkout/quote', locale, cookie, { delivery: 'NP_BRANCH' }),
  ]);
  return { cart, quote: cart && cart.items.length ? quote : null, noCart: false };
}

type DeliveryCopy = Array<{ key: DeliveryMethod; label: string; hint?: string }>;
const DELIVERY: { uk: DeliveryCopy; en: DeliveryCopy } = {
  uk: [
    { key: 'NP_BRANCH', label: 'Нова пошта, відділення або поштомат' },
    { key: 'NP_COURIER', label: 'Кур’єр Нової пошти', hint: 'Доставка на вашу адресу' },
    { key: 'UKRPOSHTA', label: 'Укрпошта' },
    { key: 'PICKUP', label: 'Самовивіз у Яворові', hint: 'Магазин і майстерня в одному місці' },
  ],
  en: [
    { key: 'NP_BRANCH', label: 'Nova Poshta, branch or parcel locker' },
    { key: 'NP_COURIER', label: 'Nova Poshta courier', hint: 'Delivered to your address in Ukraine' },
    { key: 'UKRPOSHTA', label: 'Ukrposhta' },
    { key: 'PICKUP', label: 'Pickup in Yavoriv', hint: 'Our shop and workshop in one place: Yavoriv village, Kosiv district, Ivano-Frankivsk region' },
  ],
};

type PaymentCopy = Record<CheckoutPayment, { title: string; body: string }>;
const PAYMENT_COPY: { uk: PaymentCopy; en: PaymentCopy } = {
  uk: {
    CARD: { title: 'Картка онлайн', body: 'Visa, Mastercard, Apple Pay, Google Pay · вікно WayForPay поверх сайту' },
    COD_INSPECTION: { title: 'Наложений платіж з оглядом', body: 'Зараз оплачуєте доставку в обидва боки. Якщо залишаєте товар, зворотна доставка віднімається від ціни.' },
    PREPAYMENT: { title: 'Передоплата 10 %, решта на пошті', body: 'Не менше 460 ₴' },
    IBAN: { title: 'Оплата на рахунок IBAN', body: 'Реквізити покажемо одразу після оформлення. Відправка після зарахування.' },
  },
  en: {
    CARD: { title: 'Card online', body: 'Visa, Mastercard, Apple Pay, Google Pay · a WayForPay window over the site' },
    COD_INSPECTION: { title: 'Cash on delivery with inspection at the post office', body: 'Now you pay for delivery both ways. If you keep the item, the return delivery is taken off the price.' },
    PREPAYMENT: { title: 'Prepayment 10%, the rest at the post office', body: 'At least 460 ₴' },
    IBAN: { title: 'Bank transfer (IBAN)', body: 'We show the bank details right after you place the order. We ship once the payment arrives.' },
  },
};

/** No cart cookie: nothing in the cart (only `items` is read before the browser's own cart arrives). */
const EMPTY = { items: [] as CartResponse['items'], subtotalMinor: 0 } as unknown as CartResponse;

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: 'same-origin' });
  if (!r.ok) throw new Error(String(r.status));
  return r.json() as Promise<T>;
}

const input = 'w-full rounded-md border border-border-control bg-bg-surface px-3 py-3 text-body text-text-primary';
const label = 'flex flex-col gap-1.5 text-body-sm font-semibold text-text-primary';
const card = 'flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-5 md:p-6';

type PromoInfo = { code?: string; reason?: string; minSubtotalMinor?: number; startsAt?: string };
function promoWhy(p: PromoInfo, locale: Locale) {
  if (locale === 'en') {
    switch (p.reason) {
      case 'NOT_FOUND': return `There is no promo code ${p.code ?? ''} — please check that it is spelt correctly`;
      case 'INACTIVE': return 'This promo code has been switched off';
      case 'NOT_STARTED': return `The promo code works from ${p.startsAt ? new Date(p.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'a later date'}`;
      case 'EXPIRED': return 'This promo code has expired';
      case 'EXHAUSTED': return 'This promo code has already been used the maximum number of times';
      case 'MIN_SUBTOTAL': return `The promo code applies to orders from ${formatUah(p.minSubtotalMinor ?? 0, 'en')}`;
      case 'NOT_APPLICABLE': return 'The promo code does not apply to the items in this basket';
      case 'ALREADY_USED': return 'You have already used this promo code';
      case 'NOT_BETTER': return 'The wholesale discount for this basket is bigger, so it has been applied — promo codes cannot be added to it';
      default: return 'The promo code does not apply to this order';
    }
  }
  switch (p.reason) {
    case 'NOT_FOUND': return `Промокоду «${p.code ?? ''}» немає — перевірте, чи правильно він написаний`;
    case 'INACTIVE': return 'Цей промокод вимкнено';
    case 'NOT_STARTED': return `Промокод діятиме з ${p.startsAt ? new Date(p.startsAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) : 'пізнішої дати'}`;
    case 'EXPIRED': return 'Термін дії промокоду минув';
    case 'EXHAUSTED': return 'Промокод уже використали максимальну кількість разів';
    case 'MIN_SUBTOTAL': return `Промокод діє від суми ${formatUah(p.minSubtotalMinor ?? 0, 'uk')}`;
    case 'NOT_APPLICABLE': return 'Промокод не діє для товарів у цьому кошику';
    case 'ALREADY_USED': return 'Ви вже використали цей промокод';
    case 'NOT_BETTER': return 'Оптова знижка для цього кошика більша, тож застосовано її — промокоди з нею не додаються';
    default: return 'Промокод не діє для цього замовлення';
  }
}

const FIELD_MSG = {
  uk: { fullName: 'Вкажіть прізвище та ім’я, як у паспорті.', phone: 'Номер: +380 і 9 цифр, наприклад +380 67 123 45 67.', emailRequired: 'Для цього замовлення потрібна пошта.', emailInvalid: 'Перевірте адресу пошти.' },
  en: { fullName: 'Please enter your surname and first name, as in your passport.', phone: 'A Ukrainian number: +380 and 9 digits, for example +380 67 123 45 67.', emailRequired: 'This order needs an e-mail address: we send order updates by e-mail.', emailInvalid: 'Please check the e-mail address.' },
};
type FieldMsg = (typeof FIELD_MSG)['uk'];

const FIELD_RULES: Record<string, (v: string, required: boolean, m: FieldMsg) => string | null> = {
  fullName: (v, _r, m) => (v.trim().split(/\s+/).length >= 2 ? null : m.fullName),
  phone: (v, _r, m) => (/^\+380\d{9}$/.test(((d) => (d.startsWith('+') ? d : d.startsWith('380') ? `+${d}` : d.startsWith('0') ? `+38${d}` : d))(v.replace(/[^\d+]/g, ''))) ? null : m.phone),
  email: (v, required, m) => (!v.trim() ? (required ? m.emailRequired : null) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : m.emailInvalid),
};

/** Label above the field (#43); the error appears on leaving it and clears as soon as it is fixed. */
function useFieldCheck(required: Record<string, boolean>, locale: Locale) {
  const m: FieldMsg = FIELD_MSG[locale === 'en' ? 'en' : 'uk'];
  const [state, setState] = useState<Record<string, { v: string; touched: boolean }>>({});
  const bind = (name: string) => ({
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => setState((s) => ({ ...s, [name]: { v: e.target.value, touched: true } })),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setState((s) => ({ ...s, [name]: { v: e.target.value, touched: s[name]?.touched ?? false } })),
  });
  const error = (name: string) => { const f = state[name]; return f?.touched ? FIELD_RULES[name]!(f.v, !!required[name], m) : null; };
  const ok = (name: string) => { const f = state[name]; return !!f?.touched && !!f.v.trim() && !FIELD_RULES[name]!(f.v, !!required[name], m); };
  return { bind, error, ok };
}

function Valid({ on }: { on: boolean }) {
  return on ? <svg className="vk-rise pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null;
}
const Err = ({ m, id }: { m: string | null; id: string }) => (m ? <span id={id} className="text-body-sm font-normal text-danger">{m}</span> : null);

export default function CheckoutPage() {
  const locale = (useParams().locale ?? 'uk') as Locale;
  const navigate = useNavigate();
  const en = locale === 'en';
  const tr = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const initial = useLoaderData<typeof loader>();
  const { data: liveCart } = useCart(locale);
  const cart = liveCart ?? initial.cart ?? (initial.noCart ? EMPTY : undefined);
  const [delivery, setDelivery] = useState<DeliveryMethod>('NP_BRANCH');
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [company, setCompany] = useState(false);
  const [city, setCity] = useState<{ ref: string; name: string } | null>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [warehouse, setWarehouse] = useState<{ ref: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const idem = useRef<string>('');

  const quote = useQuery({
    queryKey: ['checkout-quote', locale, delivery, cart?.totalMinor, cart?.itemCount, promoCode],
    queryFn: () => getJson<CheckoutQuote>(`/api/v1/checkout/quote?locale=${locale}&delivery=${delivery}${promoCode ? `&promoCode=${encodeURIComponent(promoCode)}` : ''}`),
    enabled: !!cart && cart.items.length > 0,
    initialData: delivery === 'NP_BRANCH' && !promoCode && initial.quote ? initial.quote : undefined,
  });
  const cities = useQuery({
    queryKey: ['np-cities', cityQuery],
    queryFn: () => getJson<{ items: Array<{ ref: string; name: string; region: string }> }>(`/api/v1/checkout/np/cities?q=${encodeURIComponent(cityQuery)}`),
    enabled: cityQuery.length >= 2 && !city,
  });
  const warehouses = useQuery({
    queryKey: ['np-wh', city?.ref],
    queryFn: () => getJson<{ items: Array<{ ref: string; label: string; isLocker: boolean }> }>(`/api/v1/checkout/np/warehouses?cityRef=${city!.ref}`),
    enabled: !!city && delivery === 'NP_BRANCH',
  });

  const options = quote.data?.payments ?? [];
  // The API requires e-mail on every non-uk order (order updates go by e-mail); the form says so before the quote arrives.
  const emailRequired = !!quote.data?.emailRequired || company || locale !== 'uk';
  const fc = useFieldCheck({ email: emailRequired }, locale);
  // The API's promo label is Ukrainian («Знижка 10%»).
  const promoLabel = (label: string) => (en ? label.replace(/^Знижка/, 'Discount') : label);
  const chosen = options.find((o) => o.key === payment) ?? options[0];
  useEffect(() => { if (chosen && chosen.key !== payment) setPayment(chosen.key); }, [chosen, payment]);

  if (cart && cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-(--container-form) flex-col items-center gap-4 px-4 py-20 text-center">
        <MascotScene kind="cart" className="w-72 max-w-full" />
        <h1 className="text-h2 text-text-primary">{tr('checkout.empty')}</h1>
        <a href={path.home(locale)} className="text-body text-text-primary underline">{tr('common.toHome')}</a>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!chosen || !quote.data) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    idem.current ||= crypto.randomUUID();
    const body = {
      contact: { fullName: String(f.get('fullName') ?? ''), patronymic: String(f.get('patronymic') ?? '') || undefined, phone: String(f.get('phone') ?? ''), email: String(f.get('email') ?? '') || undefined },
      delivery: {
        method: delivery, city: city?.name ?? (String(f.get('city') ?? '') || undefined), cityRef: city?.ref,
        warehouseRef: warehouse?.ref, warehouseLabel: warehouse?.label,
        address: String(f.get('address') ?? '') || undefined, postalCode: String(f.get('postalCode') ?? '') || undefined,
      },
      payment: chosen.key,
      company: company ? { name: String(f.get('companyName') ?? ''), edrpou: String(f.get('edrpou') ?? '') } : undefined,
      termsAccepted: f.get('terms') === 'on',
      marketingConsent: f.get('marketing') === 'on' || undefined,
      expectedTotalMinor: quote.data.totalMinor ?? undefined,
      promoCode: quote.data.promo?.ok ? quote.data.promo.code : undefined,
    };
    try {
      const r = await fetch(`/api/v1/checkout/orders?locale=${locale}`, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'idempotency-key': idem.current }, body: JSON.stringify(body) });
      const res = await r.json();
      if (!r.ok) {
        const field = res?.error?.fieldErrors?.[0]?.path as string | undefined;
        setError(en ? (
          res?.error?.code === 'PRICE_CHANGED' ? 'The price has changed. Please check the total and confirm again.'
          : res?.error?.message === 'PROMO_INVALID' ? `The promo code no longer applies: ${promoWhy({ ...res.error.params, code: promoCode }, locale)}. Remove it or enter another one.`
          : field?.startsWith('contact.fullName') ? FIELD_MSG.en.fullName
          : field?.startsWith('contact.phone') ? 'Please check the phone number.'
          : field?.startsWith('contact.email') ? FIELD_MSG.en.emailRequired
          : field?.startsWith('delivery') ? 'Please choose a branch or enter the delivery address.'
          : field === 'termsAccepted' ? 'Please agree to the terms of the public offer.'
          : 'We could not place the order. Please try again or call us.'
        ) : (
          res?.error?.code === 'PRICE_CHANGED' ? 'Ціна змінилась. Перевірте суму й підтвердьте ще раз.'
          : res?.error?.message === 'PROMO_INVALID' ? `Промокод більше не діє: ${promoWhy({ ...res.error.params, code: promoCode }, locale)}. Приберіть його або введіть інший.`
          : field?.startsWith('contact.fullName') ? 'Вкажіть прізвище та ім’я, як у паспорті.'
          : field?.startsWith('contact.phone') ? 'Перевірте номер телефону.'
          : field?.startsWith('contact.email') ? 'Для цього замовлення потрібна електронна пошта.'
          : field?.startsWith('delivery') ? 'Оберіть відділення або вкажіть адресу доставки.'
          : field === 'termsAccepted' ? 'Потрібна згода з умовами оферти.'
          : 'Не вдалося оформити. Спробуйте ще раз або зателефонуйте нам.'
        ));
        if (res?.error?.code !== 'IDEMPOTENCY_KEY_CONFLICT') idem.current = '';
        return;
      }
      const orderUrl = `${path.seg(locale, 'order')}/${res.guestToken}`;
      if (res.amountDueNowMinor > 0) {
        const pay = await fetch(`/api/v1/orders/${res.guestToken}/pay`, { method: 'POST' }).then((x) => x.json());
        if (pay?.redirectUrl) { window.location.assign(pay.redirectUrl); return; }
      }
      navigate(orderUrl, { state: { fresh: true } });
    } finally {
      setBusy(false);
    }
  }

  const buttonLabel = !chosen ? tr('checkout.place')
    : chosen.key === 'IBAN' ? tr('checkout.getInvoice')
    : chosen.key === 'COD_INSPECTION' ? tr('checkout.payShipping', { amount: formatUah(chosen.amountNowMinor, locale) })
    : chosen.key === 'PREPAYMENT' ? tr('checkout.payPrepayment', { amount: formatUah(chosen.amountNowMinor, locale) })
    : tr('checkout.pay', { amount: formatUah(chosen.amountNowMinor, locale) });
  const deliveryCopy = DELIVERY[en ? 'en' : 'uk'];
  const payCopy = PAYMENT_COPY[en ? 'en' : 'uk'];

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-(--container-wide) gap-8 px-4 py-8 lg:grid-cols-[1.4fr_1fr] lg:px-30" noValidate>
      <div className="flex flex-col gap-7">
        <h1 className="text-h1 text-text-primary">{tr('checkout.title')}</h1>

        <section className={card}>
          <h2 className="text-h3 text-text-primary">{tr('checkout.contacts')}</h2>
          <label className={label}>{tr('checkout.fullName')}<input name="fullName" autoComplete="name" required aria-invalid={!!fc.error('fullName')} aria-describedby="err-fullName" {...fc.bind('fullName')} className={input} /><Err id="err-fullName" m={fc.error('fullName')} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>{tr('checkout.patronymic')} <span className="font-normal text-text-muted">{tr('checkout.optional')}</span><input name="patronymic" className={input} /></label>
            <label className={label}>{tr('checkout.phone')}<span className="relative"><input name="phone" type="tel" autoComplete="tel" placeholder="+380…" required aria-invalid={!!fc.error('phone')} aria-describedby="err-phone" {...fc.bind('phone')} className={`${input} pr-10`} /><Valid on={fc.ok('phone')} /></span><Err id="err-phone" m={fc.error('phone')} /></label>
          </div>
          <label className={label}>{tr('checkout.email')} <span className="font-normal text-text-muted">{emailRequired ? tr('checkout.emailRequired') : tr('checkout.emailOptional')}</span><span className="relative"><input name="email" type="email" autoComplete="email" required={emailRequired} aria-invalid={!!fc.error('email')} aria-describedby="err-email" {...fc.bind('email')} className={`${input} pr-10`} /><Valid on={fc.ok('email')} /></span><Err id="err-email" m={fc.error('email')} /></label>
          {/* Round 19 D2: unchecked by default; subscribed only after the link in the confirmation letter. */}
          <label className="flex items-start gap-2 text-body"><input type="checkbox" name="marketing" className="mt-0.5 size-5 shrink-0" /><span>{en ? NEWSLETTER_CONSENT_TEXT_EN : NEWSLETTER_CONSENT_TEXT}<span className="block text-body-sm text-text-muted">{tr('checkout.newsletterHint')}</span></span></label>
          <label className="flex items-center gap-2 text-body"><input type="checkbox" checked={company} onChange={(e) => setCompany(e.target.checked)} className="size-5" /> {tr('checkout.company')}</label>
          {company && (
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <label className={label}>{tr('checkout.companyName')}<input name="companyName" className={input} /></label>
              <label className={label}>{tr('checkout.edrpou')}<input name="edrpou" inputMode="numeric" className={input} /></label>
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="text-h3 text-text-primary">{tr('checkout.delivery')}</h2>
          {/* G093: Ukraine only, said plainly on the English page. */}
          {en && <p className="text-body-sm text-text-body">We deliver within Ukraine only (Nova Poshta, Ukrposhta or pickup in Yavoriv); international delivery is not available.</p>}
          {delivery !== 'PICKUP' && (
            <div className="relative">
              <label className={label}>{tr('checkout.city')}
                <span className="relative"><input name="city" value={city ? city.name : cityQuery} onChange={(e) => { setCity(null); setWarehouse(null); setCityQuery(e.target.value); }} autoComplete="address-level2" className={`${input} pr-10`} /><Valid on={!!city} /></span>
              </label>
              {!city && (cities.data?.items.length ?? 0) > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 rounded-md border border-border-hairline bg-bg-surface shadow-lg">
                  {cities.data!.items.map((c) => (
                    <li key={c.ref}><button type="button" className="w-full px-3 py-2.5 text-left text-body hover:bg-bg-alt" onClick={() => setCity({ ref: c.ref, name: c.name })}>{c.name} <span className="text-text-muted">· {c.region}</span></button></li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{tr('checkout.deliveryMethod')}</legend>
            {deliveryCopy.map((d) => (
              <label key={d.key} className="flex items-start gap-3 rounded-md border border-border-hairline px-3 py-3 text-body transition-colors duration-(--dur-base) has-[:checked]:border-text-primary has-[:checked]:bg-bg-alt">
                <input type="radio" name="delivery" checked={delivery === d.key} onChange={() => setDelivery(d.key)} className="mt-1 size-5" />
                <span>{d.label}{d.hint && <span className="block text-caption text-text-muted">{d.hint}</span>}</span>
              </label>
            ))}
          </fieldset>
          {delivery === 'NP_BRANCH' && city && (
            <label className={label}>{tr('checkout.branch')}
              <select value={warehouse?.ref ?? ''} onChange={(e) => setWarehouse(warehouses.data?.items.find((w) => w.ref === e.target.value) ?? null)} className={input}>
                <option value="">{tr('checkout.chooseFromList')}</option>
                {warehouses.data?.items.map((w) => <option key={w.ref} value={w.ref}>{w.label}</option>)}
              </select>
            </label>
          )}
          {(delivery === 'NP_COURIER' || delivery === 'UKRPOSHTA') && (
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <label className={label}>{tr('checkout.address')}<input name="address" autoComplete="street-address" className={input} /></label>
              {delivery === 'UKRPOSHTA' && <label className={label}>{tr('checkout.postalCode')}<input name="postalCode" inputMode="numeric" autoComplete="postal-code" className={input} /></label>}
            </div>
          )}
          <p className="text-body-sm text-text-muted">
            {quote.data?.shippingMinor === null ? tr('checkout.shippingUnknown') : quote.data ? <>{tr('checkout.shippingCost')} <strong className="text-text-primary">{formatUah(quote.data.shippingMinor, locale)}</strong>{quote.data.shippingIsTest && tr('checkout.testRate')}{tr('checkout.shipsIn')}</> : null}
          </p>
        </section>

        <section className={card}>
          <h2 className="text-h3 text-text-primary">{tr('checkout.payment')}</h2>
          {options.length === 0 && <p className="text-body text-text-muted">{tr('checkout.noPayments')}</p>}
          {quote.data?.hasCustomSize && <p className="text-body-sm text-text-body">{tr('checkout.customOnlyCard')}</p>}
          {quote.data?.codUnavailableAboveMinor != null && <p className="text-body-sm text-text-body">{tr('checkout.codLimit', { max: formatUah(quote.data.codUnavailableAboveMinor, locale) })}</p>}
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{tr('checkout.paymentMethod')}</legend>
            {options.map((o) => (
              <label key={o.key} className="flex items-start gap-3 rounded-md border border-border-hairline px-3 py-3 transition-colors duration-(--dur-base) has-[:checked]:border-text-primary has-[:checked]:bg-bg-alt">
                <input type="radio" name="payment" checked={chosen?.key === o.key} onChange={() => setPayment(o.key)} className="mt-1 size-5" />
                <span className="flex flex-col gap-0.5">
                  <strong className="text-body text-text-primary">{payCopy[o.key].title}</strong>
                  <span className="text-body-sm text-text-muted">{payCopy[o.key].body}</span>
                  {o.key === 'COD_INSPECTION' && o.depositMinor !== undefined && (
                    <span className="mt-1 rounded-sm bg-bg-alt px-2 py-1.5 text-body-sm text-text-body">
                      {tr('checkout.codNow', { now: formatUah(o.amountNowMinor, locale), rest: formatUah(o.balanceOnDeliveryMinor, locale) })}
                    </span>
                  )}
                  {o.key === 'PREPAYMENT' && <span className="text-body-sm text-text-body">{tr('checkout.prepayNow', { now: formatUah(o.amountNowMinor, locale), rest: formatUah(o.balanceOnDeliveryMinor, locale) })}</span>}
                </span>
              </label>
            ))}
          </fieldset>
        </section>
      </div>

      <aside className="flex flex-col gap-4 self-start rounded-xl border border-border-hairline bg-bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="text-h3 text-text-primary">{tr('checkout.yourOrder')}</h2>
        <ul className="flex flex-col gap-3">
          {cart?.items.filter((l) => l.available).map((l) => (
            <li key={l.id} className="flex justify-between gap-3 text-body">
              <span className="text-text-primary">{l.name}<span className="block text-caption text-text-muted">{Object.values(l.options).map((o) => o.label).join(' · ')}{l.customSpec ? ` · ${l.customSpec.widthCm}×${l.customSpec.lengthCm} ${en ? 'cm' : 'см'}` : ''}</span></span>
              <span className="shrink-0 font-semibold text-text-primary">{formatUah(l.totalMinor, locale)}</span>
            </li>
          ))}
        </ul>
        {/* 18 §18.9: a collapsed link, and a refusal that always names its reason. */}
        <div className="flex flex-col gap-2 border-t border-border-hairline pt-3">
          {!promoOpen && !promoCode ? (
            <button type="button" onClick={() => setPromoOpen(true)} className="self-start text-caption text-text-muted underline">{tr('checkout.havePromo')}</button>
          ) : (
            <div className="vk-expand"><div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setPromoCode(promoInput.trim()); } }} aria-label={tr('checkout.promo')} placeholder={tr('checkout.promo')} autoCapitalize="characters" className="min-w-0 flex-1 rounded-md border border-border-control bg-bg-input px-3 py-2 text-body uppercase text-text-primary" />
                <button type="button" onClick={() => setPromoCode(promoInput.trim())} disabled={!promoInput.trim()} className="rounded-md border border-border-control px-3 text-body-sm font-semibold text-text-primary disabled:opacity-50">{tr('checkout.apply')}</button>
              </div>
              {quote.data?.promo && (
                quote.data.promo.ok
                  ? <p role="status" className="text-body-sm text-success">{tr('checkout.promoApplied', { label: promoLabel(quote.data.promo.label) })} <button type="button" onClick={() => { setPromoCode(''); setPromoInput(''); }} className="ml-1 text-text-muted underline">{tr('checkout.promoRemove')}</button></p>
                  : <p role="alert" className={`text-body-sm ${quote.data.promo.reason === 'NOT_BETTER' ? 'text-text-muted' : 'text-danger'}`}>{quote.data.promo.reason === 'NOT_BETTER' ? '' : '✕ '}{promoWhy(quote.data.promo, locale)}</p>
              )}
            </div></div>
          )}
        </div>
        <dl className="flex flex-col gap-1.5 border-t border-border-hairline pt-3 text-body">
          <div className="flex justify-between"><dt>{tr('checkout.items')}</dt><dd>{formatUah(quote.data?.subtotalMinor ?? cart?.subtotalMinor ?? 0, locale)}</dd></div>
          {(quote.data?.discountMinor ?? 0) > 0 && <div key={quote.data!.discountSource ?? ''} className="vk-flash -mx-1 flex justify-between px-1 text-success"><dt>{quote.data!.discountSource === 'PROMO_CODE' ? tr('checkout.promoLine', { code: quote.data!.promo?.code ?? '' }) : tr('cart.volumeDiscount')}</dt><dd>−{formatUah(quote.data!.discountMinor, locale)}</dd></div>}
          <div className="flex justify-between"><dt>{tr('checkout.shipping')}</dt><dd>{quote.data?.shippingMinor != null ? formatUah(quote.data.shippingMinor, locale) : '—'}</dd></div>
          <div className="flex justify-between text-h4 text-text-primary"><dt>{tr('checkout.dueNow')}</dt><dd>{chosen ? formatUah(chosen.amountNowMinor, locale) : '—'}</dd></div>
        </dl>
        <label className="flex items-start gap-2 text-body-sm"><input type="checkbox" name="terms" className="mt-0.5 size-5" /> {tr('checkout.terms')}</label>
        {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy || !chosen} aria-busy={busy} className={`min-h-12 rounded-md bg-bg-inverted px-5 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${busy ? 'vk-busy disabled:opacity-100' : ''}`}>
          {busy ? tr('common.wait') : buttonLabel}
        </button>
      </aside>
    </form>
  );
}
