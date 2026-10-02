import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer, X } from 'lucide-react';
import { BUSINESS } from '@vivcharyk/schemas';
import { api } from '@/lib/api';
import { PAYMENT_LABEL, uah } from '@/lib/format';
import { DELIVERY_LABEL, prettyPhone } from './shared';

// Round 20 #42, #87–89, #178–179, #235–237: paper. Printing opens a sheet preview first, then
// «Друкувати» (on the phone the print dialog also saves a PDF or shares it, #288). One A4 per order.

export type PrintKind = 'packing' | 'invoice';

interface PrintOrder {
  number: string; placedAt: string; status: string; customer: string; patronymic: string | null; phone: string; email: string | null; company: { name: string; edrpou: string } | null;
  delivery: { method: string | null; city: string | null; warehouseLabel: string | null; address: string | null; postalCode: string | null };
  trackingNumber: string | null; payment: string; subtotalMinor: number; discountMinor: number; discountLabel: string | null; shippingMinor: number | null; totalMinor: number | null;
  codAmountMinor: number | null; prepaymentMinor: number | null; paidMinor: number; notes: string[];
  items: Array<{ id: string; name: string; sku: string; thumb: string | null; size: string | null; other: string | null; quantity: number; unit: string; unitPriceMinor: number; totalMinor: number }>;
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
const money = (minor: number | null) => (minor === null ? '—' : new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minor / 100));
const unitLabel = (u: string) => ({ PIECE: 'шт.', KILOGRAM: 'кг', SKEIN: 'моток', METRE: 'м' })[u] ?? u.toLowerCase();
const where = (o: PrintOrder) => [o.delivery.city, o.delivery.warehouseLabel ?? [o.delivery.address, o.delivery.postalCode].filter(Boolean).join(', ')].filter(Boolean).join(' · ');

/* ---------- the sum in words, for the invoice ---------- */
const ONES = ['', 'один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім', "дев'ять"];
const ONES_F = ['', 'одна', 'дві', ...ONES.slice(3)];
const TEENS = ['десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', "п'ятнадцять", 'шістнадцять', 'сімнадцять', 'вісімнадцять', "дев'ятнадцять"];
const TENS = ['', '', 'двадцять', 'тридцять', 'сорок', "п'ятдесят", 'шістдесят', 'сімдесят', 'вісімдесят', "дев'яносто"];
const HUNDREDS = ['', 'сто', 'двісті', 'триста', 'чотириста', "п'ятсот", 'шістсот', 'сімсот', 'вісімсот', "дев'ятсот"];
const plural = (n: number, forms: [string, string, string]) => {
  const a = n % 100; const b = n % 10;
  return a >= 11 && a <= 14 ? forms[2] : b === 1 ? forms[0] : b >= 2 && b <= 4 ? forms[1] : forms[2];
};
const triad = (n: number, fem: boolean) => {
  const h = Math.floor(n / 100); const t = Math.floor((n % 100) / 10); const o = n % 10;
  return [HUNDREDS[h], t === 1 ? TEENS[o] : TENS[t], t === 1 ? '' : (fem ? ONES_F : ONES)[o]].filter(Boolean).join(' ');
};
export function uahWords(minor: number) {
  const g = Math.floor(minor / 100); const k = minor % 100;
  const mil = Math.floor(g / 1_000_000); const th = Math.floor((g % 1_000_000) / 1000); const rest = g % 1000;
  const parts = [
    mil ? `${triad(mil, false)} ${plural(mil, ['мільйон', 'мільйони', 'мільйонів'])}` : '',
    th ? `${triad(th, true)} ${plural(th, ['тисяча', 'тисячі', 'тисяч'])}` : '',
    rest ? triad(rest, true) : '',
  ].filter(Boolean).join(' ') || 'нуль';
  const s = `${parts} ${plural(g, ['гривня', 'гривні', 'гривень'])} ${String(k).padStart(2, '0')} ${plural(k, ['копійка', 'копійки', 'копійок'])}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const css = `
.vk-page { width: 210mm; min-height: 297mm; padding: 14mm 14mm 12mm; margin: 0 auto 16px; background: #fff; color: #111; box-shadow: 0 2px 16px rgba(0,0,0,.18); font: 11pt/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
.vk-page h1 { font-size: 16pt; font-weight: 700; margin: 0; }
.vk-page table { width: 100%; border-collapse: collapse; }
.vk-page th, .vk-page td { border: 1px solid #999; padding: 4px 6px; vertical-align: middle; text-align: left; }
.vk-page th { background: #f1f1f1; font-weight: 600; font-size: 9.5pt; }
.vk-page .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.vk-page .muted { color: #555; }
.vk-page .box { display: inline-block; width: 6mm; height: 6mm; border: 1.5px solid #111; border-radius: 1mm; }
@media screen and (max-width: 820px) { .vk-page { width: 100%; min-height: 0; padding: 16px; } }
@media print {
  @page { size: A4; margin: 0; }
  body > *:not(.vk-print) { display: none !important; }
  .vk-print { position: static !important; overflow: visible !important; background: #fff !important; padding: 0 !important; }
  .vk-page { margin: 0; box-shadow: none; break-after: page; }
  .vk-page:last-child { break-after: auto; }
}`;

function Packing({ o }: { o: PrintOrder }) {
  const toCollect = o.payment === 'COD_INSPECTION' ? o.codAmountMinor : o.payment === 'PREPAYMENT' ? (o.totalMinor ?? 0) - o.paidMinor : null;
  return (
    <section className="vk-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: '3mm', marginBottom: '4mm' }}>
        <div><h1>Список на пакування</h1><div className="muted">{BUSINESS.brand}</div></div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: '18pt', fontWeight: 700 }}>{o.number}</div><div className="muted">{longDate(o.placedAt)}</div></div>
      </header>
      <table style={{ marginBottom: '4mm' }}>
        <tbody>
          <tr><th style={{ width: '28%' }}>Покупець</th><td><b>{[o.customer, o.patronymic].filter(Boolean).join(' ')}</b> · {prettyPhone(o.phone)}{o.company ? ` · ${o.company.name}, ЄДРПОУ ${o.company.edrpou}` : ''}</td></tr>
          <tr><th>Доставка</th><td>{DELIVERY_LABEL[o.delivery.method ?? ''] ?? o.delivery.method}{where(o) ? <><br /><b>{where(o)}</b></> : null}{o.trackingNumber ? <><br />ТТН {o.trackingNumber}</> : null}</td></tr>
          <tr><th>Оплата</th><td>{PAYMENT_LABEL[o.payment] ?? o.payment} · разом {uah(o.totalMinor)}{toCollect ? <> · <b>на пошті {uah(toCollect)}</b></> : null}</td></tr>
        </tbody>
      </table>
      <table>
        <thead><tr><th style={{ width: '16mm' }}>Фото</th><th>Товар</th><th>Розмір</th><th>Колір та інше</th><th className="num">К-сть</th><th style={{ width: '16mm', textAlign: 'center' }}>Поклав</th></tr></thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id}>
              <td style={{ padding: '2px' }}>{i.thumb ? <img src={i.thumb} alt="" style={{ width: '14mm', height: '14mm', objectFit: 'cover', display: 'block', borderRadius: '1mm' }} /> : null}</td>
              <td><b>{i.name}</b><div className="muted" style={{ fontSize: '9pt' }}>{i.sku}</div></td>
              <td>{i.size ?? '—'}</td>
              <td>{i.other ?? '—'}</td>
              <td className="num" style={{ fontSize: '13pt', fontWeight: 700 }}>{i.quantity} {unitLabel(i.unit)}</td>
              <td style={{ textAlign: 'center' }}><span className="box" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {o.notes.length > 0 && (
        <div style={{ marginTop: '5mm', border: '1px solid #999', padding: '3mm' }}>
          <b>Примітка</b>
          {o.notes.map((n, k) => <p key={k} style={{ margin: '1mm 0 0' }}>{n}</p>)}
        </div>
      )}
      <footer style={{ marginTop: '10mm', display: 'flex', gap: '12mm' }}>
        <span>Пакував(ла): ______________________</span><span>Дата: ______________</span>
      </footer>
    </section>
  );
}

function Invoice({ o }: { o: PrintOrder }) {
  const rows = o.items.map((i) => ({ key: i.id, name: [i.name, i.size, i.other].filter(Boolean).join(', '), unit: unitLabel(i.unit), qty: i.quantity, price: i.unitPriceMinor, sum: i.totalMinor }));
  if (o.shippingMinor) rows.push({ key: 'ship', name: `Доставка (${DELIVERY_LABEL[o.delivery.method ?? ''] ?? ''})`, unit: 'посл.', qty: 1, price: o.shippingMinor, sum: o.shippingMinor });
  const total = o.totalMinor ?? 0;
  // D28: the shop phone is edited in «Налаштування → Магазин»; the public value is what the invoice prints.
  const { data: site } = useQuery({ queryKey: ['site-settings'], queryFn: () => api<{ contact: { phone: string } }>('/site/settings'), staleTime: 60_000 });
  return (
    <section className="vk-page">
      <h1 style={{ textAlign: 'center', marginBottom: '6mm' }}>Рахунок на оплату № {o.number}<br /><span style={{ fontSize: '12pt', fontWeight: 400 }}>від {longDate(o.placedAt)}</span></h1>
      <table style={{ marginBottom: '5mm' }}>
        <tbody>
          <tr><th style={{ width: '24%' }}>Постачальник</th><td><b>{BUSINESS.legalEntityName}</b><br />РНОКПП {BUSINESS.legalId}<br />IBAN {BUSINESS.iban}<br />{BUSINESS.factoryAddress}<br />тел. {site?.contact.phone ?? BUSINESS.phones[0]}</td></tr>
          <tr><th>Покупець</th><td>{o.company ? <><b>{o.company.name}</b><br />ЄДРПОУ {o.company.edrpou}<br /></> : null}{[o.customer, o.patronymic].filter(Boolean).join(' ')}, {prettyPhone(o.phone)}{o.email ? `, ${o.email}` : ''}</td></tr>
        </tbody>
      </table>
      <table>
        <thead><tr><th className="num" style={{ width: '8mm' }}>№</th><th>Найменування</th><th>Од.</th><th className="num">К-сть</th><th className="num">Ціна, грн</th><th className="num">Сума, грн</th></tr></thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={r.key}><td className="num">{k + 1}</td><td>{r.name}</td><td>{r.unit}</td><td className="num">{r.qty}</td><td className="num">{money(r.price)}</td><td className="num">{money(r.sum)}</td></tr>
          ))}
        </tbody>
      </table>
      <table style={{ width: '60%', marginLeft: 'auto', marginTop: '2mm' }}>
        <tbody>
          {o.discountMinor > 0 && <tr><th>{o.discountLabel ?? 'Знижка'}</th><td className="num">−{money(o.discountMinor)}</td></tr>}
          <tr><th>Разом до сплати</th><td className="num"><b>{money(total)}</b></td></tr>
          <tr><th>ПДВ</th><td className="num">без ПДВ</td></tr>
        </tbody>
      </table>
      <p style={{ marginTop: '5mm' }}>Всього до сплати: <b>{uahWords(total)}</b>, без ПДВ.</p>
      <p>Призначення платежу: <b>Оплата за замовлення {o.number}</b>.</p>
      <p>Рахунок потрібно оплатити протягом 3 банківських днів.</p>
      <div style={{ marginTop: '14mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>Виписав(ла): ____________________ <span className="muted">/ {BUSINESS.legalEntityName.replace(/^ФОП\s+/, '')} /</span></div>
        <div style={{ width: '40mm', height: '40mm', border: '1px dashed #999', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="muted">М. П.</div>
      </div>
    </section>
  );
}

/** A full-screen sheet preview over the panel; only the pages reach the printer. */
export function PrintPreview({ numbers, kind, onClose }: { numbers: string[]; kind: PrintKind; onClose: () => void }) {
  const { data, isError } = useQuery({ queryKey: ['orders', 'print', numbers.join(',')], queryFn: () => api<{ orders: PrintOrder[] }>(`/admin/orders/print?numbers=${encodeURIComponent(numbers.join(','))}`) });
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = prev; };
  }, [onClose]);
  const title = kind === 'packing' ? (numbers.length > 1 ? `Пакування · ${numbers.length} замовл.` : 'Список на пакування') : 'Рахунок покупцю';
  return createPortal(
    <div className="vk-print fixed inset-0 z-[90] overflow-y-auto bg-[#d9d6cf]" role="dialog" aria-modal="true" aria-label={title}>
      <style>{css}</style>
      <div className="no-print sticky top-0 z-10 flex items-center gap-2 border-b border-black/10 bg-bg-surface px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} aria-label="Закрити" className="rounded-full p-2 text-text-muted hover:bg-bg-alt"><X size={20} /></button>
        <span className="flex-1 truncate text-body font-semibold text-text-primary">{title}</span>
        <button type="button" disabled={!data} onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-body-sm font-semibold text-white disabled:opacity-50 max-md:min-h-11">
          <Printer size={18} /> Друкувати
        </button>
      </div>
      <div className="py-4 max-md:px-2">
        {isError && <p className="no-print text-center text-body text-text-primary">Не вдалося підготувати документ. Спробуйте ще раз.</p>}
        {!data && !isError && <p className="no-print text-center text-body text-text-muted">Готуємо аркуші…</p>}
        {data?.orders.map((o) => (kind === 'packing' ? <Packing key={o.number} o={o} /> : <Invoice key={o.number} o={o} />))}
      </div>
    </div>,
    document.body,
  );
}
