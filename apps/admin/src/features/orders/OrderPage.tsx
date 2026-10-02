import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Ban, ChevronDown, CircleCheck, FileText, Hammer, MapPin, MessageCircle, Package, Pencil, Phone, PhoneCall, Printer, Send,
  Share2, ShieldAlert, Truck, Undo2, Wallet, type LucideIcon,
} from 'lucide-react';
import { OrderStatus } from '@/components/status';
import { CopyButton, DotsMenu, EmptyState, PageHeader, SkeletonRows, useConfirm, useToast } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { dateTime, date, PAYMENT_LABEL, STATUS_LABEL, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { customerHref } from '@/features/customers/CustomersPage';
import { addNote, confirmCall, errText, transition, useOrder, useOrderAction, useRefresh, type Detail, type OrderEvent } from './api';
import { CancelSheet, CautionSheet, ContactSheet, PaymentSheet, RefundSheet, ReturnSheet, ShipSheet } from './OrderSheets';
import { PrintPreview, type PrintKind } from './Print';
import { contactLinks, DELIVERY_LABEL, isAnon, prettyPhone, shareOrder } from './shared';

const box = 'flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4';
const h2 = 'text-overline uppercase tracking-wide text-text-muted';
const HOW: Record<string, string> = { CARD: 'на картку', IBAN: 'на рахунок IBAN', CASH: 'готівкою' };
const FIELD: Record<string, string> = { lastName: 'прізвище', firstName: "ім'я", patronymic: 'по батькові', phone: 'телефон', email: 'email', city: 'місто', warehouseLabel: 'відділення', address: 'адресу', postalCode: 'індекс' };

/** History in plain words (#110, #190, #234). */
function eventText(e: OrderEvent) {
  const p = e.payload;
  switch (e.type) {
    case 'status_changed': return `${e.fromValue ? `${STATUS_LABEL[e.fromValue] ?? e.fromValue} → ` : ''}${STATUS_LABEL[e.toValue ?? ''] ?? e.toValue}${p?.reason ? ` · ${p.reason}` : ''}${p?.trackingNumber ? ` · ТТН ${p.trackingNumber}` : ''}`;
    case 'confirmed_by_call': return 'Підтверджено дзвінком';
    case 'payment_received': return `Оплата ${uah(p?.amountMinor)}${p?.manual ? ' — записано вручну' : ''}`;
    case 'payment_failed': return 'Оплата не пройшла';
    case 'created_by_staff': return 'Створено в панелі після дзвінка';
    case 'unconfirmed_reminder': return 'Нагадування: не підтверджено дзвінком';
    case 'taken': return 'Взявся за замовлення';
    case 'review_requested': return 'Надіслано лист «Залиште відгук»';
    case 'refund_recorded': return `Повернення грошей ${uah(p?.amountMinor)} ${HOW[p?.method ?? ''] ?? ''}${p?.note ? ` · ${p.note}` : ''}`;
    case 'contact_edited': return `Змінено ${(p?.fields ?? []).map((f) => FIELD[f] ?? f).join(', ') || 'контакти'}`;
    case 'caution_marked': return `Позначено «Обережно»: ${p?.reason ?? ''}`;
    case 'caution_cleared': return 'Знято позначку «Обережно»';
    case 'note_added': return `Нотатка: ${p?.text ?? ''}`;
    default: return e.type;
  }
}

// Round 19 D1 #26: letters about this order (replies to the order e-mails, or linked by hand).
function OrderMail({ orderId }: { orderId: string }) {
  const { data } = useQuery({ queryKey: ['order-mail', orderId], queryFn: () => api<{ items: Array<{ id: string; subject: string; status: string; lastMessageAt: string }> }>(`/admin/mail/by-order/${orderId}`) });
  if (!data?.items.length) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border-hairline pt-2">
      <span className="text-caption text-text-muted">Листування</span>
      {data.items.map((t) => <Link key={t.id} to={`/mail/${t.id}`} className="text-body-sm text-text-primary underline">{t.subject} · {dateTime(t.lastMessageAt)}</Link>)}
    </div>
  );
}

function RoundLink({ href, icon: Icon, label, color }: { href: string; icon: LucideIcon; label: string; color: string }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex flex-col items-center gap-1 text-caption text-text-body">
      <span className="flex size-12 items-center justify-center rounded-full text-white shadow-sm transition hover:brightness-110" style={{ background: color }}><Icon size={22} strokeWidth={1.75} /></span>
      {label}
    </a>
  );
}

type Sheet = 'ship' | 'cancel' | 'return' | 'pay' | 'refund' | 'contact' | 'caution' | null;
type Next = { label: string; icon: LucideIcon; run: () => void } | null;

export function OrderPage() {
  const { number = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data: o, isPending, isError, error } = useOrder(number);
  const confirm = useConfirm();
  const toast = useToast();
  const refresh = useRefresh();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [print, setPrint] = useState<PrintKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const noteM = useOrderAction(number, (t: string) => addNote(number, t));

  // «Відправлено — ввести ТТН» from the list opens the dialog here.
  useEffect(() => {
    if (params.get('ship') && o?.status === 'PACKING') { setSheet('ship'); setParams({}, { replace: true }); }
  }, [params, o?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isPending) return <SkeletonRows rows={8} />;
  if (isError || !o) {
    return <EmptyState text={error instanceof ApiError && error.status === 404 ? 'Такого замовлення немає. Перевірте номер.' : "Не вдалося завантажити замовлення. Перевірте зв'язок."} action={<Link to="/orders" className="text-body-sm text-accent-text underline">До замовлень</Link>} />;
  }
  const a = o.shippingAddress;
  const anon = isAnon(o.phone);
  const fullName = [o.customer, a.patronymic].filter(Boolean).join(' ');
  const place = [a.city, a.warehouseLabel ?? [a.address, a.postalCode].filter(Boolean).join(', ')].filter(Boolean).join(', ');
  const paid = o.paymentStatus === 'PAID' || o.paidMinor > 0;
  const fullyPaid = o.paymentStatus === 'PAID' || (o.totalMinor !== null && o.paidMinor >= o.totalMinor);
  const closed = ['CANCELLED', 'RETURNED'].includes(o.status);
  const t = (to: string) => o.transitions.find((x) => x.to === to);
  const canPay = can('payments.reconcile') && !closed && !fullyPaid && (o.payment === 'IBAN' || o.payment === 'PREPAYMENT');

  const step = async (to: string, label: string, text: string) => {
    if (!(await confirm({ title: 'Ви впевнені?', text, ok: label }))) return;
    setBusy(true);
    try { const r = await transition(o.number, { to }); toast(`Готово: ${STATUS_LABEL[r.status] ?? r.status}`); }
    catch (e) { toast(errText(e), 'error'); }
    finally { setBusy(false); void refresh(o.number); }
  };

  // #209: the one big next-step button; everything else is in «⋯».
  const next = ((): Next => {
    if (!can('orders.change_status') && o.status !== 'PENDING') return null;
    const conf = t('CONFIRMED');
    if (o.status === 'PENDING' && conf) {
      if (conf.needs === 'call' && can('orders.update')) {
        return { label: 'Подзвонив, підтверджую', icon: PhoneCall, run: async () => {
          if (!(await confirm({ title: 'Ви впевнені?', text: `Ви поговорили з покупцем і ${o.number} підтверджене.`, ok: 'Підтверджую' }))) return;
          setBusy(true);
          try {
            await confirmCall(o.number);
            if (o.paymentStatus === 'PAID' || o.paidMinor > 0 || o.payment === 'IBAN') {
              const r = await transition(o.number, { to: 'CONFIRMED' });
              toast(r.status === 'IN_PRODUCTION' ? 'Підтверджено — у виготовлення' : 'Підтверджено');
            } else toast('Дзвінок записано. Підтвердите, коли надійде оплата.');
          } catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); void refresh(o.number); }
        } };
      }
      if (conf.needs === 'payment') return canPay ? { label: 'Оплату отримано', icon: Wallet, run: () => setSheet('pay') } : null;
      if (!conf.needs && can('orders.change_status')) return { label: 'Підтвердити', icon: CircleCheck, run: () => void step('CONFIRMED', 'Підтвердити', `${o.number} — підтверджене.`) };
      return null;
    }
    const prod = t('IN_PRODUCTION'); if (prod) return { label: 'Виготовляти', icon: Hammer, run: () => void step('IN_PRODUCTION', 'Виготовляти', `${o.number} — у виготовлення.`) };
    const pack = t('PACKING'); if (pack && !pack.needs) return { label: o.status === 'IN_PRODUCTION' ? 'Готово, пакувати' : 'Пакувати', icon: Package, run: () => void step('PACKING', 'Пакувати', `${o.number} — пакується.`) };
    if (t('SHIPPED')) return { label: 'Відправлено', icon: Truck, run: () => setSheet('ship') };
    const got = t('DELIVERED');
    if (got) return o.status === 'PACKING'
      ? { label: 'Покупець забрав', icon: CircleCheck, run: () => void step('DELIVERED', 'Забрав', `${o.number} — покупець забрав.`) }
      : { label: 'Отримано', icon: CircleCheck, run: () => void step('DELIVERED', 'Отримано', `${o.number} — покупець отримав.`) };
    return null;
  })();

  const NextButton = ({ className = '' }: { className?: string }) => (next ? (
    <button type="button" disabled={busy} onClick={next.run} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-body font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50 max-md:min-h-13 ${className}`}>
      <next.icon size={20} strokeWidth={2} />{next.label}
    </button>
  ) : null);

  const ret = t('RETURNED');
  const menu = [
    { label: 'Друк: список на пакування', icon: Printer, onClick: () => setPrint('packing'), hidden: !can('orders.print_documents') },
    { label: 'Друк: рахунок покупцю', icon: FileText, onClick: () => setPrint('invoice'), hidden: !can('orders.print_documents') },
    { label: 'Поділитися текстом', icon: Share2, onClick: () => void shareOrder({
      number: o.number, status: o.status, customer: fullName, phone: o.phone, payment: o.payment, totalMinor: o.totalMinor, paid,
      address: [DELIVERY_LABEL[a.method] ?? a.method, place].filter(Boolean).join(': '), ttn: o.trackingNumber,
      items: o.items.map((i) => `${i.nameSnapshot}${optionsText(i) ? ` (${optionsText(i)})` : ''} ×${i.quantityMilli / 1000} — ${uah(i.totalMinor)}`),
    }).then((r) => r === 'copied' && toast('Текст скопійовано')) },
    { label: 'Редагувати адресу й контакти', icon: Pencil, onClick: () => setSheet('contact'), hidden: !can('orders.update') || anon },
    { label: 'Оплату отримано', icon: Wallet, onClick: () => setSheet('pay'), hidden: !canPay || next?.label === 'Оплату отримано' },
    { label: 'Записати повернення грошей', icon: Undo2, onClick: () => setSheet('refund'), hidden: !can('payments.refund') || o.paidMinor <= 0 },
    { label: o.caution ? 'Змінити «Обережно»' : 'Позначити «Обережно»', icon: ShieldAlert, onClick: () => setSheet('caution'), hidden: !can('customers.update') || anon },
    { label: ret?.label ?? '', icon: Undo2, onClick: () => setSheet('return'), hidden: !ret || !can('orders.change_status') },
    { label: 'Скасувати замовлення', icon: Ban, onClick: () => setSheet('cancel'), danger: true, hidden: !t('CANCELLED') || !can('orders.cancel') },
  ];

  const waitingPay = o.status === 'PENDING' && t('CONFIRMED')?.needs === 'payment';
  const blocks: Record<string, ReactNode> = {
    buyer: (
      <section className={box} key="buyer">
        <h2 className={h2}>Покупець</h2>
        {anon ? <p className="text-body text-text-muted">Знеособлено на запит покупця</p> : (
          <>
            <div>
              <p className="text-h4 font-semibold text-text-primary">{fullName || '—'}</p>
              {a.company && <p className="text-body-sm text-text-body">{a.company.name} · ЄДРПОУ {a.company.edrpou}</p>}
            </div>
            <p className="flex items-center gap-1 text-body text-text-primary"><span className="tabular">{prettyPhone(o.phone)}</span><CopyButton value={o.phone} label="телефон" /></p>
            <div className="flex gap-5">
              <RoundLink href={contactLinks(o.phone).tel} icon={Phone} label="Подзвонити" color="#2E7355" />
              <RoundLink href={contactLinks(o.phone).viber} icon={MessageCircle} label="Viber" color="#7360F2" />
              <RoundLink href={contactLinks(o.phone).telegram} icon={Send} label="Telegram" color="#2AABEE" />
            </div>
            {o.email && <p className="flex items-center gap-1 text-body-sm text-text-body"><span className="truncate">{o.email}</span><CopyButton value={o.email} label="email" /></p>}
            {o.emailBouncedAt && <p className="text-body-sm text-warning">Лист на цю адресу не дійшов ({dateTime(o.emailBouncedAt)}) — уточніть email телефоном.</p>}
          </>
        )}
        {o.customerHistory.previousOrders > 0
          ? <Link to={customerHref(o.phone)} className="self-start rounded-full bg-bg-alt px-3 py-1 text-body-sm text-ok">Постійний клієнт: ще {o.customerHistory.previousOrders} замовл. на {uah(o.customerHistory.previousValueMinor)}</Link>
          : <span className="text-body-sm text-text-muted">Перше замовлення</span>}
        {o.confirmedByCallAt && <span className="text-body-sm text-ok">Підтверджено дзвінком {dateTime(o.confirmedByCallAt)}</span>}
        {can('mail.read') && <OrderMail orderId={o.id} />}
      </section>
    ),
    items: (
      <section className={box} key="items">
        <h2 className={h2}>Товари</h2>
        <ul className="flex flex-col gap-2.5">
          {o.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              {i.thumb ? <img src={i.thumb} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded-md bg-bg-alt object-cover" />
                : <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-bg-alt text-text-faint"><Package size={18} /></span>}
              <span className="min-w-0 flex-1 text-body text-text-primary">{i.nameSnapshot}
                <span className="block text-caption text-text-muted">{[optionsText(i), i.pricingUnitSnapshot === 'PIECE' ? `${i.quantityMilli / 1000} шт.` : `${i.quantityMilli / 1000}`, i.sku].filter(Boolean).join(' · ')}</span>
              </span>
              <span className="tabular shrink-0 text-body text-text-primary">{uah(i.totalMinor)}</span>
            </li>
          ))}
        </ul>
        <dl className="tabular grid grid-cols-[1fr_auto] gap-y-1 border-t border-border-hairline pt-2 text-body">
          <dt className="text-text-muted">Товари</dt><dd className="text-right">{uah(o.subtotalMinor)}</dd>
          {o.discountMinor > 0 && <><dt className="text-text-muted">{o.discountSource === 'PROMO_CODE' ? `Промокод ${o.couponCode ?? ''}` : 'Оптова знижка'}</dt><dd className="text-right">−{uah(o.discountMinor)}</dd></>}
          <dt className="text-text-muted">Доставка</dt><dd className="text-right">{uah(o.shippingMinor ?? o.shippingForwardMinor)}</dd>
          <dt className="font-semibold text-text-primary">Разом</dt>
          <dd className="flex items-center justify-end gap-1 font-semibold text-text-primary">{uah(o.totalMinor)}{o.totalMinor !== null && <CopyButton value={String(Math.round(o.totalMinor / 100))} label="суму" />}</dd>
        </dl>
      </section>
    ),
    delivery: (
      <section className={box} key="delivery">
        <h2 className={h2}>Доставка</h2>
        <p className="text-body text-text-primary">{DELIVERY_LABEL[a.method] ?? a.method}</p>
        {place && (
          <div className="flex items-start gap-1">
            {/* #265: on the phone, tapping the address copies it. */}
            <button type="button" onClick={() => void navigator.clipboard.writeText(place).then(() => toast('Адресу скопійовано'))} className="flex flex-1 items-start gap-2 text-left text-body text-text-body md:pointer-events-none">
              <MapPin size={17} className="mt-0.5 shrink-0 text-text-faint" /><span>{place}</span>
            </button>
            <span className="max-md:hidden"><CopyButton value={place} label="адресу" /></span>
          </div>
        )}
        {o.trackingNumber && <p className="flex items-center gap-1 text-body text-text-primary">ТТН <span className="tabular font-medium">{o.trackingNumber}</span><CopyButton value={o.trackingNumber} label="ТТН" /></p>}
        {o.expectedDispatchAt && !['SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.status) && <p className="text-body-sm text-text-body">Відправити до {date(o.expectedDispatchAt)}</p>}
      </section>
    ),
    payment: (
      <section className={box} key="payment">
        <h2 className={h2}>Оплата</h2>
        <p className="flex items-center gap-2 text-body text-text-primary">{PAYMENT_LABEL[o.payment] ?? o.payment}
          <span className={`text-body-sm ${fullyPaid ? 'text-ok' : paid ? 'text-text-body' : 'text-warning'}`}>{fullyPaid ? 'оплачено' : paid ? `оплачено ${uah(o.paidMinor)}` : 'не оплачено'}</span>
        </p>
        {o.payment === 'COD_INSPECTION' && <p className="text-body-sm text-text-body">Онлайн: доставка в обидва боки {uah(o.amountDueNowMinor)} · на пошті {uah(o.codAmountMinor)}</p>}
        {o.payment === 'PREPAYMENT' && <p className="text-body-sm text-text-body">Передоплата {uah(o.prepaymentMinor)} · на пошті {uah((o.totalMinor ?? 0) - (o.prepaymentMinor ?? 0))}</p>}
        {o.payments.length > 0 && (
          <ul className="flex flex-col gap-0.5 text-body-sm text-text-body">
            {o.payments.map((p) => <li key={p.id}>{p.status === 'PAID' ? 'Надійшло' : 'Не пройшло'} {uah(p.amountMinor)} · {dateTime(p.createdAt)}{p.provider === 'manual' ? ' · вручну' : p.provider.endsWith('stub') ? ' (тест)' : ''}</li>)}
          </ul>
        )}
        {o.fiscalReceipts.map((r) => <p key={r.id} className="text-body-sm text-text-body">Чек {r.isPrepayment ? 'на передоплату ' : ''}{uah(r.amountMinor)} · {r.fiscalCode}</p>)}
        {o.refundedMinor > 0 && <p className="text-body-sm text-text-body">Повернено покупцю {uah(o.refundedMinor)}</p>}
        {canPay && next?.label !== 'Оплату отримано' && (
          <button type="button" onClick={() => setSheet('pay')} className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-lg border border-border-control px-3 text-body-sm font-medium text-text-primary hover:bg-bg-alt max-md:min-h-12"><Wallet size={17} /> Оплату отримано</button>
        )}
      </section>
    ),
    notes: (can('orders.note') || o.customerNote || o.events.some((e) => e.type === 'note_added')) ? (
      <section className={box} key="notes">
        <h2 className={h2}>Нотатки</h2>
        {o.customerNote && <p className="text-body text-text-body">Від покупця: {o.customerNote}</p>}
        {o.events.filter((e) => e.type === 'note_added').map((e) => (
          <p key={e.id} className="text-body text-text-body">{e.payload?.text}<span className="block text-caption text-text-muted">{e.actor ?? 'Система'} · {dateTime(e.createdAt)}</span></p>
        ))}
        {can('orders.note') && (
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) noteM.mutate(note.trim(), { onSuccess: () => { setNote(''); toast('Нотатку додано'); }, onError: (er) => toast(errText(er), 'error') }); }}>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Нотатка для себе (покупець не бачить)" maxLength={2000} className="min-w-0 flex-1 rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body-sm max-md:py-3" />
            <button type="submit" disabled={!note.trim() || noteM.isPending} className="shrink-0 rounded-lg border border-border-control px-3 text-body-sm disabled:opacity-50">Додати</button>
          </form>
        )}
      </section>
    ) : null,
    history: (
      <details className={`${box} group`} key="history">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-overline uppercase tracking-wide text-text-muted">
          Історія · {o.events.filter((e) => e.type !== 'note_added').length}<ChevronDown size={16} className="transition group-open:rotate-180" />
        </summary>
        <ol className="flex flex-col gap-2">
          {o.events.filter((e) => e.type !== 'note_added').map((e) => (
            <li key={e.id} className="flex gap-3 text-body-sm">
              <span className="w-28 shrink-0 text-text-muted">{dateTime(e.createdAt)}</span>
              <span className="text-text-body">{eventText(e)}{e.actor && <span className="text-text-muted"> · {e.actor}</span>}</span>
            </li>
          ))}
        </ol>
      </details>
    ),
  };

  // Phone order (#263): buyer → items → delivery → payment → notes → history. Computer (#107): items left, buyer and delivery right.
  return (
    <div className="flex flex-col gap-4">
      <PageHeader back="/orders" title={<span className="flex items-center gap-2">{o.number}<OrderStatus status={o.status} /></span>} sub={dateTime(o.placedAt)}
        actions={<><NextButton className="max-md:hidden" /><DotsMenu items={menu} label="Інші дії" /></>} />

      {o.caution && (
        <div role="note" className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/15 px-4 py-3 text-body text-text-primary">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-warning" />
          <span><b>Обережно:</b> {o.caution.reason}{o.caution.at && <span className="text-body-sm text-text-muted"> · {date(o.caution.at)}</span>}</span>
        </div>
      )}
      {waitingPay && <p className="rounded-xl bg-bg-alt px-4 py-2.5 text-body-sm text-text-body">Дзвінок записано. Чекаємо оплату — тоді замовлення можна підтвердити.</p>}
      {o.status === 'CONFIRMED' && o.payment === 'IBAN' && !paid && <p className="rounded-xl bg-bg-alt px-4 py-2.5 text-body-sm text-text-body">Оплата на рахунок ще не надійшла. Надішліть покупцю рахунок («⋯» → Друк).</p>}

      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1.5fr_1fr] md:items-start">
        <div className="contents md:flex md:flex-col md:gap-4">
          <div className="order-2 md:order-none">{blocks.items}</div>
          {blocks.notes && <div className="order-5 md:order-none">{blocks.notes}</div>}
          <div className="order-6 md:order-none">{blocks.history}</div>
        </div>
        <div className="contents md:flex md:flex-col md:gap-4">
          <div className="order-1 md:order-none">{blocks.buyer}</div>
          <div className="order-3 md:order-none">{blocks.delivery}</div>
          <div className="order-4 md:order-none">{blocks.payment}</div>
        </div>
      </div>

      {/* #262: on the phone the next step sticks to the bottom, above the tab bar. */}
      {next && (
        <>
          <div className="h-16 md:hidden" />
          <div className="no-print fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-bg-page via-bg-page/95 to-transparent px-4 pb-2 pt-4 md:hidden">
            <NextButton className="w-full" />
          </div>
        </>
      )}

      {sheet === 'ship' && <ShipSheet o={o} onClose={() => setSheet(null)} />}
      {sheet === 'cancel' && <CancelSheet o={o} onClose={() => setSheet(null)} />}
      {sheet === 'return' && <ReturnSheet o={o} canCaution={can('customers.update')} onClose={() => setSheet(null)} />}
      {sheet === 'pay' && <PaymentSheet o={o} onClose={() => setSheet(null)} />}
      {sheet === 'refund' && <RefundSheet o={o} onClose={() => setSheet(null)} />}
      {sheet === 'contact' && <ContactSheet o={o} onClose={() => setSheet(null)} />}
      {sheet === 'caution' && <CautionSheet o={o} onClose={() => setSheet(null)} />}
      {print && <PrintPreview numbers={[o.number]} kind={print} onClose={() => setPrint(null)} />}
    </div>
  );
}

function optionsText(i: Detail['items'][number]) {
  return [
    i.customSpec ? `свій розмір ${i.customSpec.widthCm}×${i.customSpec.lengthCm} см` : null,
    ...Object.entries(i.optionsSnapshot).filter(([k]) => !(i.customSpec && k === 'size')).map(([, v]) => v.label),
  ].filter(Boolean).join(' · ');
}
