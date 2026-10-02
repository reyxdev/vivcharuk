import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Mail, Package, Search, ShoppingBag, Users, X } from 'lucide-react';
import { api } from '@/lib/api';
import { dateTime, uah } from '@/lib/format';
import { IconCircle } from './ui';
import { OrderStatus } from './status';

interface Results {
  orders: { total: number; items: Array<{ number: string; status: string; totalMinor: number | null; phone: string; customer: string; placedAt: string }> };
  customers: { total: number; items: Array<{ id: string; name: string; phone: string | null; email: string }> };
  products: { total: number; items: Array<{ id: string; sku: string; name: string; priceMinor: number | null; thumb: string | null }> };
  mail: { total: number; items: Array<{ id: string; subject: string; who: string; lastMessageAt: string }> };
}

// Round 20 #16, #82, #105, #208: a field in the header on a computer, a magnifier on the phone;
// results under the field in groups, 3 each, with «Показати всі».
export function GlobalSearch({ phone = false, onClose }: { phone?: boolean; onClose?: () => void }) {
  const [q, setQ] = useState('');
  const [deb, setDeb] = useState('');
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => setDeb(q.trim()), 250); return () => clearTimeout(t); }, [q]);
  useEffect(() => {
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, []);
  const { data, isFetching } = useQuery({ queryKey: ['search', deb], enabled: deb.length >= 2, queryFn: () => api<Results>(`/admin/search?q=${encodeURIComponent(deb)}`), staleTime: 10_000 });
  const go = (to: string) => { setOpen(false); setQ(''); onClose?.(); nav(to); };
  const empty = data && !data.orders.total && !data.customers.total && !data.products.total && !data.mail.total;
  const more = (n: number, to: string) => (n > 3 ? <button type="button" onClick={() => go(to)} className="px-3 py-1.5 text-left text-caption text-accent-text underline">Показати всі ({n})</button> : null);
  const row = 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-bg-alt max-md:py-3';

  return (
    <div ref={ref} className={`relative ${phone ? 'w-full' : 'w-full max-w-md'}`}>
      <label className="flex items-center gap-2 rounded-lg border border-border-control bg-bg-input px-3 focus-within:ring-2 focus-within:ring-accent">
        <Search size={17} className="shrink-0 text-text-muted" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} autoFocus={phone}
          placeholder="Пошук: замовлення, телефон, клієнт, товар" aria-label="Пошук по панелі"
          className="min-h-9 w-full bg-transparent text-body-sm text-text-primary outline-none placeholder:text-text-faint max-md:min-h-11 max-md:text-body" />
        {(q || phone) && <button type="button" onClick={() => { setQ(''); onClose?.(); }} aria-label="Закрити пошук" className="text-text-muted"><X size={16} /></button>}
      </label>
      {open && deb.length >= 2 && (
        <div className={`${phone ? 'mt-2' : 'absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border-hairline shadow-xl'} max-h-[70vh] overflow-y-auto bg-bg-surface p-1.5`}>
          {isFetching && !data && <p className="px-3 py-2 text-body-sm text-text-muted">Шукаю…</p>}
          {empty && <p className="px-3 py-2 text-body-sm text-text-muted">Нічого не знайшлося. Спробуйте номер телефону чи частину назви.</p>}
          {!!data?.orders.total && (
            <section>
              <p className="flex items-center gap-2 px-3 pt-2 text-caption font-semibold text-text-muted"><IconCircle icon={ShoppingBag} color="#2E7355" size={18} /> Замовлення</p>
              {data.orders.items.map((o) => (
                <button key={o.number} type="button" onClick={() => go(`/orders/${o.number}`)} className={row}>
                  <span className="tabular font-semibold text-text-primary">{o.number}</span>
                  <span className="min-w-0 flex-1 truncate text-body-sm">{o.customer} · {o.phone}</span>
                  <OrderStatus status={o.status} compact />
                  <span className="tabular text-body-sm">{uah(o.totalMinor)}</span>
                </button>
              ))}
              {more(data.orders.total, `/orders?q=${encodeURIComponent(deb)}`)}
            </section>
          )}
          {!!data?.customers.total && (
            <section>
              <p className="flex items-center gap-2 px-3 pt-2 text-caption font-semibold text-text-muted"><IconCircle icon={Users} color="#8E76A8" size={18} /> Клієнти</p>
              {data.customers.items.map((c) => (
                <button key={c.id} type="button" onClick={() => go(`/customers/${encodeURIComponent(c.id)}`)} className={row}>
                  <span className="min-w-0 flex-1 truncate text-body-sm text-text-primary">{c.name}</span>
                  <span className="text-caption text-text-muted">{c.phone ?? c.email}</span>
                </button>
              ))}
              {more(data.customers.total, `/customers?q=${encodeURIComponent(deb)}`)}
            </section>
          )}
          {!!data?.products.total && (
            <section>
              <p className="flex items-center gap-2 px-3 pt-2 text-caption font-semibold text-text-muted"><IconCircle icon={Package} color="#C77D58" size={18} /> Товари</p>
              {data.products.items.map((p) => (
                <button key={p.id} type="button" onClick={() => go(`/products/${p.id}`)} className={row}>
                  {p.thumb ? <img src={p.thumb} alt="" className="size-8 rounded object-cover" loading="lazy" /> : <span className="size-8 rounded bg-bg-alt" />}
                  <span className="min-w-0 flex-1 truncate text-body-sm text-text-primary">{p.name}</span>
                  <span className="tabular text-body-sm">{uah(p.priceMinor)}</span>
                </button>
              ))}
              {more(data.products.total, `/products?q=${encodeURIComponent(deb)}`)}
            </section>
          )}
          {!!data?.mail.total && (
            <section>
              <p className="flex items-center gap-2 px-3 pt-2 text-caption font-semibold text-text-muted"><IconCircle icon={Mail} color="#5A8AAF" size={18} /> Листи</p>
              {data.mail.items.map((t) => (
                <button key={t.id} type="button" onClick={() => go(`/mail/${t.id}`)} className={row}>
                  <span className="min-w-0 flex-1 truncate text-body-sm text-text-primary">{t.subject}</span>
                  <span className="truncate text-caption text-text-muted">{t.who} · {dateTime(t.lastMessageAt)}</span>
                </button>
              ))}
              {more(data.mail.total, `/mail?q=${encodeURIComponent(deb)}&view=all`)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
