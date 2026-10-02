import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, CreditCard, Minus, Plus, Search, Store, Undo2 } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { dateTime, uah } from '@/lib/format';
import { EmptyState, PageHeader, Sheet, SkeletonRows, useConfirm, useToast } from '@/components/ui';

interface Variant { id: string; sku: string; priceMinor: number; stockQty: number; label: string }
interface Tile { productId: string; name: string; thumb: string | null; variants: Variant[] }
interface Line { variantId: string; name: string; label: string; priceMinor: number; stockQty: number; quantity: number }
interface Today {
  totals: { cashMinor: number; transferMinor: number; count: number };
  items: Array<{ id: string; at: string; payment: 'CASH' | 'CARD_TRANSFER'; totalMinor: number; discountMinor: number; cancelled: boolean; lines: Array<{ name: string; options: string; quantity: number }> }>;
}
type Payment = 'CASH' | 'CARD_TRANSFER';

const items = (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'товар' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'товари' : 'товарів'}`;
const toMinor = (s: string) => Math.round((Number(s.replace(',', '.').replace(/\s/g, '')) || 0) * 100);

/** Round 20 #133–137, #217–219, #274–277: the shop till. Tiles left, receipt right; on the phone a bottom strip that opens the receipt. */
export function ShopSalePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [pick, setPick] = useState<Tile | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [disc, setDisc] = useState<{ kind: 'sum' | 'percent'; value: string }>({ kind: 'sum', value: '' });
  const [payment, setPayment] = useState<Payment>('CASH');
  const [given, setGiven] = useState('');
  const [busy, setBusy] = useState(false);

  const term = q.trim().length >= 2 ? q.trim() : '';
  const tiles = useQuery({ queryKey: ['shop-tiles', term], placeholderData: keepPreviousData, queryFn: () => api<{ items: Tile[] }>(`/admin/stock/tiles${term ? `?q=${encodeURIComponent(term)}` : ''}`) });
  const today = useQuery({ queryKey: ['shop-sales-today'], queryFn: () => api<Today>('/admin/stock/shop-sales') });

  const subtotal = lines.reduce((s, l) => s + l.priceMinor * l.quantity, 0);
  const dv = Number(disc.value.replace(',', '.')) || 0;
  const discount = Math.min(subtotal, disc.kind === 'percent' ? Math.round((subtotal * Math.min(dv, 100)) / 100) : toMinor(disc.value));
  const total = subtotal - discount;
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const givenMinor = given.trim() ? toMinor(given) : null;

  const add = (t: Tile, v: Variant) => {
    setPick(null);
    const cur = lines.find((l) => l.variantId === v.id);
    if (cur && cur.quantity >= v.stockQty) { toast(`На складі лише ${v.stockQty} шт.`, 'error'); return; }
    setLines(cur ? lines.map((l) => (l.variantId === v.id ? { ...l, quantity: l.quantity + 1 } : l)) : [...lines, { variantId: v.id, name: t.name, label: v.label, priceMinor: v.priceMinor, stockQty: v.stockQty, quantity: 1 }]);
  };
  const tap = (t: Tile) => (t.variants.length === 1 ? add(t, t.variants[0]!) : setPick(t)); // #276: sizes ask first
  const setQty = (id: string, n: number) => setLines(n <= 0 ? lines.filter((l) => l.variantId !== id) : lines.map((l) => (l.variantId === id ? { ...l, quantity: Math.min(n, l.stockQty) } : l)));

  const sell = async () => {
    if (!lines.length || busy) return;
    setBusy(true);
    try {
      const r = await post<{ totalMinor: number; changeMinor: number | null; archived: string[] }>('/admin/stock/shop-sales', {
        lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        ...(discount > 0 ? { discount: disc.kind === 'percent' ? { kind: 'percent', value: Math.min(dv, 100) } : { kind: 'sum', value: discount } } : {}),
        payment, ...(payment === 'CASH' && givenMinor !== null ? { cashGivenMinor: givenMinor } : {}),
      });
      toast(`Продано ✓ ${uah(r.totalMinor)}${r.changeMinor ? ` · решта ${uah(r.changeMinor)}` : ''}`); // #218
      if (r.archived.length) toast(`Одиничний виріб знято з сайту: ${r.archived.join(', ')}`);
      setLines([]); setDisc({ kind: 'sum', value: '' }); setGiven(''); setPayment('CASH'); setReceiptOpen(false);
      void Promise.all(['shop-tiles', 'shop-sales-today', 'dashboard', 'products'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
    } catch (e) {
      const code = e instanceof ApiError ? e.body?.error.message : '';
      toast(code === 'NOT_ENOUGH_STOCK' ? `На складі менше, ніж у чеку: ${String(e instanceof ApiError ? e.body?.error.params?.name ?? '' : '')}. Зменшіть кількість.`
        : code === 'CASH_TOO_LOW' ? 'Дали менше, ніж до сплати. Перевірте суму.'
        : messageFor(e instanceof ApiError ? e.code : ''), 'error');
      void qc.invalidateQueries({ queryKey: ['shop-tiles'] });
    } finally { setBusy(false); }
  };

  const undo = async (id: string, sum: number) => {
    if (!await confirm({ title: 'Скасувати продаж?', text: `Продаж на ${uah(sum)} буде скасовано, товар повернеться на склад.`, ok: 'Скасувати продаж', danger: true })) return;
    try {
      await post(`/admin/stock/shop-sales/${id}/cancel`);
      toast('Продаж скасовано, товар повернувся на склад');
      void Promise.all(['shop-tiles', 'shop-sales-today', 'dashboard', 'products'].map((k) => qc.invalidateQueries({ queryKey: [k] })));
    } catch (e) {
      const code = e instanceof ApiError ? e.body?.error.message : '';
      toast(code === 'NOT_TODAY' ? 'Скасувати можна лише сьогоднішній продаж.' : code === 'ALREADY_CANCELLED' ? 'Цей продаж уже скасовано.' : messageFor(e instanceof ApiError ? e.code : ''), 'error');
    }
  };

  const receipt = (
    <div className="flex flex-col gap-3">
      {!lines.length && <p className="py-6 text-center text-body-sm text-text-muted">Торкніться товару, щоб додати в чек.</p>}
      {lines.length > 0 && (
        <ul className="flex flex-col divide-y divide-border-hairline">
          {lines.map((l) => (
            <li key={l.variantId} className="flex items-center gap-2 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-medium text-text-primary">{l.name}</span>
                <span className="block truncate text-caption text-text-muted">{[l.label, uah(l.priceMinor)].filter(Boolean).join(' · ')}</span>
              </span>
              <button type="button" onClick={() => setQty(l.variantId, l.quantity - 1)} aria-label="Менше" className="grid size-8 place-items-center rounded-lg border border-border-control max-md:size-10"><Minus size={16} /></button>
              <span className="tabular w-6 text-center text-body font-semibold text-text-primary">{l.quantity}</span>
              <button type="button" onClick={() => setQty(l.variantId, l.quantity + 1)} disabled={l.quantity >= l.stockQty} aria-label="Більше" className="grid size-8 place-items-center rounded-lg border border-border-control disabled:opacity-40 max-md:size-10"><Plus size={16} /></button>
              <span className="tabular w-20 text-right text-body-sm font-semibold text-text-primary">{uah(l.priceMinor * l.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <label htmlFor="disc" className="flex-1 text-body-sm text-text-body">Знижка</label>
            <input id="disc" inputMode="decimal" value={disc.value} onChange={(e) => setDisc({ ...disc, value: e.target.value })} placeholder="0"
              className="tabular w-24 rounded-lg border border-border-control bg-bg-input px-2 py-1.5 text-right text-body text-text-primary max-md:py-2.5" />
            <div className="flex rounded-lg border border-border-control p-0.5" role="group" aria-label="Знижка в гривнях чи відсотках">
              {(['sum', 'percent'] as const).map((k) => (
                <button key={k} type="button" aria-pressed={disc.kind === k} onClick={() => setDisc({ ...disc, kind: k })}
                  className={`min-w-9 rounded-md px-2 py-1 text-body-sm max-md:py-2 ${disc.kind === k ? 'bg-bg-inverted font-semibold text-text-on-inverted' : 'text-text-body'}`}>{k === 'sum' ? '₴' : '%'}</button>
              ))}
            </div>
          </div>

          <dl className="flex flex-col gap-1 border-t border-border-hairline pt-2 text-body-sm">
            {discount > 0 && <div className="flex justify-between text-text-muted"><dt>Сума</dt><dd className="tabular">{uah(subtotal)}</dd></div>}
            {discount > 0 && <div className="flex justify-between text-text-muted"><dt>Знижка</dt><dd className="tabular">−{uah(discount)}</dd></div>}
            <div className="flex justify-between text-h3 font-semibold text-text-primary"><dt>До сплати</dt><dd className="tabular">{uah(total)}</dd></div>
          </dl>

          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Оплата">
            {([['CASH', 'Готівка', Banknote], ['CARD_TRANSFER', 'Переказ на карту', CreditCard]] as const).map(([k, label, Icon]) => (
              <button key={k} type="button" aria-pressed={payment === k} onClick={() => setPayment(k)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 text-body-sm font-medium max-md:min-h-12 ${payment === k ? 'border-accent bg-accent text-white' : 'border-border-control text-text-primary'}`}>
                <Icon size={18} />{label}
              </button>
            ))}
          </div>

          {payment === 'CASH' && (
            <div className="flex items-center gap-2">
              <label htmlFor="given" className="text-body-sm text-text-body">Дали</label>
              <input id="given" inputMode="decimal" value={given} onChange={(e) => setGiven(e.target.value)} placeholder={String(Math.round(total / 100))}
                className="tabular w-28 rounded-lg border border-border-control bg-bg-input px-2 py-1.5 text-right text-body text-text-primary max-md:py-2.5" />
              <span className="text-body-sm">₴</span>
              {givenMinor !== null && (givenMinor >= total
                ? <span className="ml-auto text-body font-semibold text-text-primary">решта {uah(givenMinor - total)}</span>
                : <span className="ml-auto text-body-sm text-danger">не вистачає {uah(total - givenMinor)}</span>)}
            </div>
          )}

          <button type="button" onClick={sell} disabled={busy || (payment === 'CASH' && givenMinor !== null && givenMinor < total)}
            className="min-h-12 rounded-xl bg-accent px-4 text-body-lg font-semibold text-white disabled:opacity-50">Продати · {uah(total)}</button>
          <button type="button" onClick={() => setLines([])} className="self-center text-body-sm text-text-muted underline">Очистити чек</button>
        </>
      )}
    </div>
  );

  return (
    <div className="pb-16 md:pb-0">
      <PageHeader title="Магазин" sub="Продали в Яворові — запишіть тут, і залишок на сайті буде правильний." />
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_340px] md:items-start lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <label className="relative block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за назвою" aria-label="Пошук за назвою"
              className="w-full rounded-lg border border-border-control bg-bg-input py-2.5 pl-10 pr-3 text-body text-text-primary max-md:py-3" />
          </label>

          {tiles.isPending && <SkeletonRows rows={4} />}
          {tiles.data && tiles.data.items.length === 0 && <EmptyState icon={Store} text={term ? 'Нічого не знайшли. Спробуйте іншу назву.' : 'На складі зараз нічого немає.'} />}
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {tiles.data?.items.map((t) => {
              const inCart = lines.filter((l) => t.variants.some((v) => v.id === l.variantId)).reduce((s, l) => s + l.quantity, 0);
              const prices = t.variants.map((v) => v.priceMinor);
              const min = Math.min(...prices);
              return (
                <li key={t.productId}>
                  <button type="button" onClick={() => tap(t)} className={`relative flex w-full flex-col overflow-hidden rounded-xl border bg-bg-surface text-left transition active:scale-[0.98] ${inCart ? 'border-accent ring-1 ring-accent' : 'border-border-hairline hover:border-border-control'}`}>
                    {t.thumb ? <img src={t.thumb} alt="" loading="lazy" className="aspect-square w-full object-cover" /> : <span className="grid aspect-square w-full place-items-center bg-bg-alt text-text-faint"><Store size={28} strokeWidth={1.5} /></span>}
                    <span className="flex flex-col gap-0.5 p-2">
                      <span className="line-clamp-2 text-body-sm font-medium text-text-primary">{t.name}</span>
                      <span className="tabular text-body-sm text-text-body">{prices.some((p) => p !== min) ? `від ${uah(min)}` : uah(min)}</span>
                    </span>
                    {inCart > 0 && <span className="tabular absolute right-1.5 top-1.5 grid min-w-7 place-items-center rounded-full bg-accent px-1.5 text-body-sm font-semibold leading-7 text-white">{inCart}</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <TodaySales data={today.data} onUndo={undo} />
        </div>

        <aside aria-label="Чек" className="sticky top-4 hidden flex-col gap-2 rounded-2xl border border-border-hairline bg-bg-surface p-4 md:flex">
          <h2 className="text-h3 font-semibold text-text-primary">Чек{count ? ` · ${items(count)}` : ''}</h2>
          {receipt}
        </aside>
      </div>

      {/* #275: on the phone a strip above the bottom bar that opens the receipt. */}
      {lines.length > 0 && !receiptOpen && (
        <div className="fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 md:hidden">
          <button type="button" onClick={() => setReceiptOpen(true)} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-bg-inverted px-4 text-text-on-inverted shadow-xl">
            <span className="flex-1 text-left text-body font-medium">{items(count)} · <span className="tabular font-semibold">{uah(total)}</span></span>
            <span className="rounded-lg bg-accent px-4 py-2 text-body font-semibold text-white">Продати</span>
          </button>
        </div>
      )}
      {receiptOpen && <Sheet title={`Чек · ${items(count)}`} onClose={() => setReceiptOpen(false)}>{receipt}</Sheet>}

      {pick && (
        <Sheet title={pick.name} onClose={() => setPick(null)}>
          <p className="mb-2 text-body-sm text-text-muted">Який розмір чи колір?</p>
          <ul className="flex flex-col gap-2">
            {pick.variants.map((v) => (
              <li key={v.id}>
                <button type="button" onClick={() => add(pick, v)} className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-border-control px-3 text-left hover:bg-bg-alt">
                  <span className="flex-1 text-body text-text-primary">{v.label || v.sku}</span>
                  <span className="text-caption text-text-muted">є {v.stockQty}</span>
                  <span className="tabular text-body font-semibold text-text-primary">{uah(v.priceMinor)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </div>
  );
}

/** #137, #219: today's sales, totals by payment, undo the same day. */
function TodaySales({ data, onUndo }: { data?: Today; onUndo: (id: string, sum: number) => void }) {
  if (!data) return null;
  return (
    <section aria-labelledby="today" className="flex flex-col gap-2">
      <h2 id="today" className="text-h3 font-semibold text-text-primary">Сьогодні</h2>
      {data.items.length === 0 && <p className="text-body-sm text-text-muted">Сьогодні ще нічого не продали.</p>}
      {data.items.length > 0 && (
        <ul className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-hairline bg-bg-surface">
          {data.items.map((s) => (
            <li key={s.id} className={`flex items-center gap-3 px-3 py-2 ${s.cancelled ? 'opacity-60' : ''}`}>
              {s.payment === 'CASH' ? <Banknote size={18} className="shrink-0 text-text-muted" aria-label="Готівка" /> : <CreditCard size={18} className="shrink-0 text-text-muted" aria-label="Переказ на карту" />}
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-body-sm text-text-primary ${s.cancelled ? 'line-through' : ''}`}>{s.lines.map((l) => `${l.name}${l.options ? ` (${l.options})` : ''}${l.quantity > 1 ? ` × ${l.quantity}` : ''}`).join(', ')}</span>
                <span className="block text-caption text-text-muted">{dateTime(s.at)}{s.cancelled ? ' · скасовано' : ''}</span>
              </span>
              <span className={`tabular text-body-sm font-semibold text-text-primary ${s.cancelled ? 'line-through' : ''}`}>{uah(s.totalMinor)}</span>
              {!s.cancelled && (
                <button type="button" onClick={() => onUndo(s.id, s.totalMinor)} aria-label="Скасувати продаж" title="Скасувати продаж" className="rounded-md p-1.5 text-text-muted hover:bg-bg-alt hover:text-danger max-md:p-2.5"><Undo2 size={16} /></button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="tabular flex flex-wrap gap-x-4 rounded-xl bg-bg-alt px-3 py-2 text-body-sm text-text-primary">
        <span>Разом: <b>{uah(data.totals.cashMinor + data.totals.transferMinor)}</b></span>
        <span className="inline-flex items-center gap-1"><Banknote size={15} />готівка {uah(data.totals.cashMinor)}</span>
        <span className="inline-flex items-center gap-1"><CreditCard size={15} />на карту {uah(data.totals.transferMinor)}</span>
      </p>
    </section>
  );
}
