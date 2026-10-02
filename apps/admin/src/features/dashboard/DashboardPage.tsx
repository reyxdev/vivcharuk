import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Eye, EyeOff, Megaphone, Store, Sun } from 'lucide-react';
import { api, post } from '@/lib/api';
import { uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { EmptyState, IconCircle, SkeletonRows, useToast } from '@/components/ui';
import { MAIN } from '@/components/sections';

type When = 'overdue' | 'today' | 'later';
interface Todo { key: string; when: When; title: string; sub?: string; count?: number; to: string; action?: { kind: 'review_publish'; id: string } }
interface Figures {
  revenueMinor: number; prevRevenueMinor: number; changePercent: number | null;
  orders: number; avgOrderMinor: number | null; shop: { sumMinor: number; count: number }; newCustomers: number;
  top: Array<{ productId: string; name: string; thumb: string | null; quantity: number }>;
  days: Array<{ day: string; siteMinor: number; shopMinor: number }>;
}
interface Dashboard { announcement: string | null; todos: Todo[]; figures?: Figures }

const SITE = '#2E7355';
const SHOP = MAIN.find((s) => s.to === '/shop-sale')!.color;

function greeting() {
  const h = new Date().getHours();
  return h < 5 || h >= 23 ? 'Доброї ночі' : h < 12 ? 'Добрий ранок' : h < 18 ? 'Добрий день' : 'Добрий вечір';
}

/** Кличний відмінок for the common cases (Іван → Іване, Олена → Олено, Андрій → Андрію); otherwise the name as is. */
function vocative(name: string) {
  if (/[гкх]$/.test(name)) return `${name}у`;
  if (/[бвдзлмнпрстфцчшщж]$/.test(name)) return `${name}е`;
  if (name.endsWith('й')) return `${name.slice(0, -1)}ю`;
  if (name.endsWith('а')) return `${name.slice(0, -1)}о`;
  return name;
}

const GROUP: Record<When, { label: string; dot: string }> = {
  overdue: { label: 'Прострочено', dot: 'bg-danger' },
  today: { label: 'Сьогодні', dot: 'bg-accent' },
  later: { label: 'Коли буде час', dot: 'bg-gold' },
};

// Round 20 #18–21, #74–79, #181–183, #204–205, #242–245, #290: greeting → to-dos → shop button → figures and chart.
export function DashboardPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const toast = useToast();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data: d, isPending } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<Dashboard>('/admin/dashboard'), refetchOnWindowFocus: true, refetchInterval: 60_000 });
  const publish = useMutation({
    mutationFn: (id: string) => post(`/admin/reviews/${id}/status`, { status: 'APPROVED' }),
    onSuccess: () => { toast('Відгук опубліковано'); void qc.invalidateQueries({ queryKey: ['dashboard'] }); void qc.invalidateQueries({ queryKey: ['counters'] }); },
    onError: () => toast('Не вдалося опублікувати. Спробуйте ще раз або відкрийте «Відгуки».', 'error'),
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <h1 className="text-h2 font-semibold text-text-primary">{greeting()}{me?.firstName ? `, ${vocative(me.firstName)}` : ''}</h1>
      {d?.announcement && (
        <p className="flex items-start gap-2 rounded-xl border border-gold bg-bg-surface p-3 text-body text-text-primary"><Megaphone size={18} className="mt-0.5 shrink-0 text-gold" />{d.announcement}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-5">
          <section aria-labelledby="todo" className="flex flex-col gap-2">
            <h2 id="todo" className="text-h3 font-semibold text-text-primary">Що зробити зараз</h2>
            {isPending && <SkeletonRows rows={4} />}
            {d && d.todos.length === 0 && <EmptyState icon={Sun} text="Поки тихо. Саме час сфотографувати новий ліжник." />}
            {d && (['overdue', 'today', 'later'] as const).map((w) => {
              const items = d.todos.filter((t) => t.when === w);
              if (!items.length) return null;
              return (
                <div key={w} className="flex flex-col gap-1.5">
                  <p className="flex items-center gap-2 pt-1 text-caption font-semibold uppercase tracking-wide text-text-muted"><span className={`size-2 rounded-full ${GROUP[w].dot}`} />{GROUP[w].label}</p>
                  <ul className="flex flex-col overflow-hidden rounded-xl border border-border-hairline bg-bg-surface">
                    {items.map((t) => (
                      <li key={t.key} className="flex items-center gap-2 border-t border-border-hairline first:border-t-0">
                        <Link to={t.to} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 hover:bg-bg-alt max-md:py-3.5">
                          <span className="min-w-0 flex-1">
                            <span className={`block text-body font-medium ${w === 'overdue' ? 'text-danger' : 'text-text-primary'}`}>{t.title}</span>
                            {t.sub && <span className="block truncate text-body-sm text-text-muted">{t.sub}</span>}
                          </span>
                          {!!t.count && <span className={`tabular rounded-full px-2 text-body-sm font-semibold ${w === 'overdue' ? 'bg-danger text-white' : 'bg-bg-alt text-text-primary'}`}>{t.count}</span>}
                          {!t.action && <ChevronRight size={18} className="shrink-0 text-text-faint" />}
                        </Link>
                        {t.action && (
                          <button type="button" disabled={publish.isPending} onClick={() => publish.mutate(t.action!.id)}
                            className="mr-3 min-h-9 shrink-0 rounded-lg bg-accent px-3 text-body-sm font-semibold text-white disabled:opacity-50 max-md:min-h-11">Опублікувати</button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          {can('stock.shop_sale') && (
            <Link to="/shop-sale" className="flex items-center gap-3 rounded-2xl border border-border-hairline bg-bg-surface p-4 hover:bg-bg-alt">
              <IconCircle icon={Store} color={SHOP} size={44} />
              <span className="flex-1 text-h3 font-semibold text-text-primary">Продаж у магазині</span>
              <ChevronRight size={22} className="text-text-faint" />
            </Link>
          )}
        </div>

        {d?.figures && <FiguresBlock f={d.figures} />}
      </div>
    </div>
  );
}

function FiguresBlock({ f }: { f: Figures }) {
  const [shown, setShown] = useState(false); // #79: hidden again on every visit
  const money = (m: number | null) => (shown ? uah(m) : '•••• ₴');
  const month = new Date().toLocaleDateString('uk-UA', { month: 'long' });
  const up = (f.changePercent ?? 0) >= 0;
  return (
    <section aria-labelledby="figs" className="flex flex-col gap-3 rounded-2xl border border-border-hairline bg-bg-surface p-4">
      <div className="flex items-center gap-2">
        <h2 id="figs" className="flex-1 text-h3 font-semibold text-text-primary">Цей місяць <span className="font-normal text-text-muted">· {month}</span></h2>
        <button type="button" onClick={() => setShown(!shown)} aria-pressed={shown} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-control px-3 text-body-sm text-text-primary hover:bg-bg-alt max-md:min-h-11">
          {shown ? <EyeOff size={16} /> : <Eye size={16} />}{shown ? 'Сховати суми' : 'Показати суми'}
        </button>
      </div>

      <div>
        <p className="text-body-sm text-text-muted">Виручка</p>
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="tabular text-h1 font-semibold text-text-primary">{money(f.revenueMinor)}</span>
          {f.changePercent !== null && (
            <span className={`inline-flex items-center text-body-sm font-semibold ${up ? 'text-accent-text' : 'text-danger'}`} title="Проти тих самих днів минулого місяця">
              {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{up ? '+' : '−'}{Math.abs(f.changePercent)} % до минулого місяця
            </span>
          )}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Замовлень на сайті" value={String(f.orders)} />
        <Stat label="Середнє замовлення" value={money(f.avgOrderMinor)} />
        <Stat label="Продано в магазині" value={shown ? `${f.shop.count} · ${uah(f.shop.sumMinor)}` : String(f.shop.count)} />
        <Stat label="Нових клієнтів" value={String(f.newCustomers)} />
      </dl>

      <Chart days={f.days} shown={shown} />

      {f.top.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-body-sm font-semibold text-text-primary">Найкраще продаються</p>
          <ol className="flex flex-col gap-2">
            {f.top.map((p, i) => (
              <li key={p.productId}>
                <Link to={`/products/${p.productId}`} className="flex items-center gap-3 rounded-lg hover:bg-bg-alt">
                  <span className="tabular w-4 text-body-sm text-text-muted">{i + 1}</span>
                  {p.thumb ? <img src={p.thumb} alt="" className="size-10 rounded-md object-cover" loading="lazy" /> : <span className="size-10 rounded-md bg-bg-alt" />}
                  <span className="min-w-0 flex-1 truncate text-body text-text-primary">{p.name}</span>
                  <span className="tabular text-body-sm text-text-muted">{p.quantity} шт.</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-alt px-3 py-2">
      <dt className="text-caption text-text-muted">{label}</dt>
      <dd className="tabular text-body-lg font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

/** #76, #243: a bar per day, each split site / shop by colour. Plain divs, no chart library. */
function Chart({ days: given, shown }: { days: Figures['days']; shown: boolean }) {
  // Always the whole month (1…31), so early in the month one day is a narrow bar, not a wide block.
  const first = given[0]?.day ?? new Date().toISOString().slice(0, 10);
  const [y, m] = first.split('-').map(Number) as [number, number];
  const total = new Date(y, m, 0).getDate();
  const byDay = new Map(given.map((d) => [Number(d.day.slice(8)), d]));
  const days = Array.from({ length: total }, (_, i) => byDay.get(i + 1) ?? { day: `${first.slice(0, 8)}${String(i + 1).padStart(2, '0')}`, siteMinor: 0, shopMinor: 0 });
  const max = Math.max(1, ...days.map((d) => d.siteMinor + d.shopMinor));
  return (
    <figure className="flex flex-col gap-1.5">
      <div className="flex h-32 items-end gap-[2px]" role="img" aria-label="Продажі по днях цього місяця: сайт і магазин">
        {days.map((d) => {
          const n = Number(d.day.slice(8));
          return (
            <div key={d.day} className="mx-auto flex h-full w-full max-w-3 min-w-0 flex-1 flex-col justify-end" title={shown ? `${n}: сайт ${uah(d.siteMinor)}, магазин ${uah(d.shopMinor)}` : String(n)}>
              <div className="rounded-t-[2px]" style={{ height: `${(d.shopMinor / max) * 100}%`, background: SHOP }} />
              <div style={{ height: `${(d.siteMinor / max) * 100}%`, background: SITE }} />
              {d.siteMinor + d.shopMinor === 0 && <div className="h-px bg-border-hairline" />}
            </div>
          );
        })}
      </div>
      <div className="flex gap-[2px] text-[0.65rem] text-text-muted">
        {days.map((d) => { const n = Number(d.day.slice(8)); return <span key={d.day} className="tabular min-w-0 flex-1 text-center">{n === 1 || n % 5 === 0 ? n : ''}</span>; })}
      </div>
      <figcaption className="flex gap-4 text-caption text-text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: SITE }} />Сайт</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: SHOP }} />Магазин</span>
      </figcaption>
    </figure>
  );
}
