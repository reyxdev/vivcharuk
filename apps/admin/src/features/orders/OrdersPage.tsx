import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Phone, Plus, Printer, Search, ShoppingBag, TriangleAlert, X } from 'lucide-react';
import { DataTable, type Column } from '@/components/DataTable';
import { FilterButton, FilterChips, filtersToQuery, activeCount, type FilterGroup, type FilterState } from '@/components/Filters';
import { OrderStatus } from '@/components/status';
import { EmptyState, PageHeader, PrimaryButton, Tabs, useStored } from '@/components/ui';
import { api } from '@/lib/api';
import { dateTime, PAYMENT_LABEL, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { useOrderList, useQuickOrders, type OrderRow, type TabKey } from './api';
import { PrintPreview, type PrintKind } from './Print';
import { QuickTab } from './QuickTab';
import { contactLinks, DELIVERY_LABEL, DELIVERY_SHORT, isAnon, prettyPhone, StatusSheet } from './shared';

const TAB_LABEL: Array<[Exclude<TabKey, 'quick'>, string]> = [
  ['new', 'Нові'], ['awaiting_payment', 'Чекають оплати'], ['in_production', 'Виготовляються'], ['to_ship', 'Відправити'],
  ['shipped', 'В дорозі'], ['done', 'Завершені'], ['all', 'Усі'],
];
const EMPTY: Record<string, string> = {
  new: 'Нових замовлень поки немає. Щойно хтось замовить — почуєте «дзинь».',
  awaiting_payment: 'Усі оплати на місці — чекати нічого.',
  in_production: 'Зараз нічого не виготовляється.',
  to_ship: 'Пакувати й відправляти нічого — усе в дорозі.',
  shipped: 'У дорозі зараз нічого немає.',
  done: 'Завершених замовлень ще немає.',
  all: 'Замовлень ще немає.',
};

const paidMark = (o: OrderRow) => (o.paid
  ? <span className="whitespace-nowrap text-caption text-ok">оплачено</span>
  : <span className="whitespace-nowrap text-caption text-warning">не оплачено</span>);

export function OrdersPage() {
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  // Remembered per person and device (#30).
  const [tab, setTab] = useStored<TabKey>('orders.tab', 'new');
  const [filters, setFilters] = useStored<FilterState>('orders.filters', {});
  const [sort, setSort] = useStored<{ key: string; dir: 'asc' | 'desc' }>('orders.sort', { key: 'placedAt', dir: 'desc' });
  const [typed, setTyped] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { const t = window.setTimeout(() => setQ(typed), 300); return () => window.clearTimeout(t); }, [typed]);

  // Links into the list: «?tab=quick» (old «1 клік» page, Telegram), «?view=…» (home to-dos) and «?q=…» (global search).
  useEffect(() => {
    const t = params.get('tab'); const v = params.get('view'); const s = params.get('q');
    if (!t && !v && s === null) return;
    if (t === 'quick' || TAB_LABEL.some(([k]) => k === t)) setTab(t as TabKey);
    if (v === 'attention') { setTab('new'); setFilters({ unconfirmed: true }); }
    else if (v && TAB_LABEL.some(([k]) => k === v)) { setTab(v as TabKey); setFilters({}); }
    if (s !== null) { setTyped(s); setQ(s); setTab('all'); }
    setParams({}, { replace: true });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const quick = useQuickOrders();
  const newQuick = quick.data?.counts.NEW ?? 0;
  const listTab = tab === 'quick' ? 'new' : tab;
  const list = useOrderList({ tab: listTab, q, filters: filtersToQuery(filters), sort }, tab !== 'quick');
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p.items), [list.data]);
  const counts = list.data?.pages[0]?.counts ?? {};

  const cities = useQuery({ queryKey: ['orders', 'cities'], queryFn: () => api<{ items: Array<{ city: string; count: number }> }>('/admin/orders/cities'), staleTime: 10 * 60_000 });
  const groups: FilterGroup[] = [
    { key: 'date', label: 'Дата', kind: 'date' },
    { key: 'pay', label: 'Спосіб оплати', kind: 'options', options: Object.entries(PAYMENT_LABEL).map(([value, label]) => ({ value, label })) },
    { key: 'paid', label: 'Оплачено чи ні', kind: 'options', single: true, options: [{ value: 'yes', label: 'Оплачено' }, { value: 'no', label: 'Не оплачено' }] },
    { key: 'delivery', label: 'Доставка', kind: 'options', options: Object.entries(DELIVERY_LABEL).map(([value, label]) => ({ value, label })) },
    { key: 'city', label: 'Місто', kind: 'options', options: (cities.data?.items ?? []).map((c) => ({ value: c.city, label: `${c.city} · ${c.count}` })) },
    { key: 'sum', label: 'Сума', kind: 'range', unit: '₴' },
    { key: 'custom', label: 'Свій розмір', kind: 'toggle' },
    { key: 'unconfirmed', label: 'Не підтверджено дзвінком', kind: 'toggle' },
    { key: 'wholesale', label: 'Опт', kind: 'toggle' },
  ];

  // Round 11 #79: an order that appears while the list is open is highlighted. (The «дзинь» is the frame's.)
  const listKey = `${listTab}|${q}|${JSON.stringify(filters)}|${sort.key}${sort.dir}`;
  const seen = useRef<{ key: string; nums: Set<string> } | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!rows) return;
    const nums = rows.map((o) => o.number);
    if (seen.current?.key === listKey) {
      const added = nums.filter((n) => !seen.current!.nums.has(n));
      if (added.length) setFresh(new Set(added));
      nums.forEach((n) => seen.current!.nums.add(n));
    } else {
      seen.current = { key: listKey, nums: new Set(nums) };
      setFresh(new Set());
    }
  }, [rows, listKey]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => setSelected(new Set()), [listKey]);
  const [statusFor, setStatusFor] = useState<OrderRow[] | null>(null);
  const [print, setPrint] = useState<{ numbers: string[]; kind: PrintKind } | null>(null);

  const tabs = [
    ...(newQuick > 0 ? [{ key: 'quick' as TabKey, label: '1 клік', count: newQuick, strong: true }] : []),
    ...TAB_LABEL.map(([key, label]) => ({ key: key as TabKey, label, count: counts[key] ?? null, strong: key === 'new' })),
    ...(newQuick === 0 ? [{ key: 'quick' as TabKey, label: '1 клік' }] : []),
  ];

  const columns: Array<Column<OrderRow>> = [
    { key: 'number', header: 'Номер', sortKey: 'number', cell: (o) => <span className="whitespace-nowrap font-semibold text-text-primary">{o.number}{o.caution && <TriangleAlert size={14} className="ml-1 inline text-warning" aria-label={`Обережно: ${o.caution}`} />}</span> },
    { key: 'date', header: 'Дата', sortKey: 'placedAt', cell: (o) => <span className="whitespace-nowrap text-text-muted">{dateTime(o.placedAt)}</span> },
    { key: 'buyer', header: 'Покупець', cell: (o) => <span className="block max-w-40 truncate">{o.customer || '—'}{o.wholesale && <span className="ml-1 text-caption text-gold">опт</span>}</span> },
    { key: 'phone', header: 'Телефон', cell: (o) => (isAnon(o.phone) ? <span className="text-text-muted">знеособлено</span> : <a href={contactLinks(o.phone).tel} onClick={(e) => e.stopPropagation()} className="tabular whitespace-nowrap hover:underline">{prettyPhone(o.phone)}</a>) },
    { key: 'items', header: 'Товари', cell: (o) => <span className="block max-w-56 truncate text-text-body" title={o.itemsSummary}>{o.itemsSummary}</span> },
    { key: 'sum', header: 'Сума', sortKey: 'total', align: 'right', cell: (o) => <span className="whitespace-nowrap font-medium text-text-primary">{uah(o.totalMinor)}</span> },
    { key: 'pay', header: 'Оплата', cell: (o) => <span className="flex flex-col leading-tight"><span className="whitespace-nowrap">{PAYMENT_LABEL[o.payment] ?? o.payment}</span>{paidMark(o)}</span> },
    { key: 'delivery', header: 'Доставка', cell: (o) => <span className="flex flex-col leading-tight"><span className="whitespace-nowrap">{DELIVERY_SHORT[o.delivery ?? ''] ?? '—'}</span>{o.city && <span className="block max-w-32 truncate text-caption text-text-muted">{o.city}</span>}</span> },
    { key: 'status', header: 'Статус', sortKey: 'status', cell: (o) => <OrderStatus status={o.status} /> },
    { key: 'ttn', header: 'ТТН', cell: (o) => <span className="tabular whitespace-nowrap text-text-muted">{o.trackingNumber ?? ''}</span> },
  ];

  const filtered = !!q.trim() || activeCount(filters) > 0;
  const empty = filtered
    ? <EmptyState icon={Search} text="Нічого не знайшлося. Спробуйте інше слово чи менше фільтрів." action={<button type="button" onClick={() => { setFilters({}); setTyped(''); setQ(''); }} className="text-body-sm text-accent-text underline">Скинути пошук і фільтри</button>} />
    : <EmptyState icon={ShoppingBag} text={EMPTY[listTab] ?? EMPTY.all!} action={listTab === 'new' && can('orders.create') ? <Link to="/orders/new" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-body-sm font-semibold text-white"><Plus size={16} /> Нове замовлення</Link> : undefined} />;

  return (
    <div className="flex flex-col gap-3">
      <PageHeader title="Замовлення" actions={can('orders.create') ? <PrimaryButton icon={Plus} onClick={() => nav('/orders/new')}>Нове<span className="max-sm:hidden">&nbsp;замовлення</span></PrimaryButton> : undefined} />
      <Tabs tabs={tabs} value={tab} onChange={(k) => setTab(k)} />

      {tab === 'quick' ? <QuickTab can={can} /> : (
        <>
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1 md:max-w-md">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
              <input value={typed} onChange={(e) => setTyped(e.target.value)} type="search" placeholder="Телефон, номер, прізвище або ТТН" aria-label="Пошук замовлень"
                className="w-full rounded-lg border border-border-control bg-bg-input py-2 pl-9 pr-8 text-body-sm text-text-primary max-md:py-2.5" />
              {typed && <button type="button" onClick={() => { setTyped(''); setQ(''); }} aria-label="Очистити пошук" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:bg-bg-alt"><X size={15} /></button>}
            </label>
            <FilterButton groups={groups} value={filters} onApply={setFilters} />
          </div>
          <FilterChips groups={groups} value={filters} onChange={setFilters} />

          {list.isError && !rows ? <EmptyState text="Не вдалося завантажити замовлення. Перевірте зв'язок і оновіть сторінку." /> : (
            <DataTable
              rows={rows}
              columns={columns}
              sort={sort}
              onSort={setSort}
              loading={list.isFetchingNextPage}
              hasMore={list.hasNextPage}
              onLoadMore={() => { if (!list.isFetchingNextPage) void list.fetchNextPage(); }}
              onRowClick={(o) => nav(`/orders/${o.number}`)}
              rowClass={(o) => (fresh.has(o.number) ? 'vk-new' : '')}
              empty={empty}
              selected={can('orders.change_status') || can('orders.print_documents') ? selected : undefined}
              onSelect={can('orders.change_status') || can('orders.print_documents') ? setSelected : undefined}
              bulk={[
                ...(can('orders.print_documents') ? [{ label: 'Друк пакування', icon: Printer, onClick: (ids: string[]) => setPrint({ numbers: ids, kind: 'packing' }) }] : []),
                ...(can('orders.change_status') ? [{ label: 'Статус', icon: ArrowLeftRight, onClick: (ids: string[]) => setStatusFor((rows ?? []).filter((r) => ids.includes(r.id))) }] : []),
              ]}
              actions={(o) => [
                { label: 'Подзвонити', icon: Phone, onClick: () => { window.location.href = contactLinks(o.phone).tel; }, hidden: isAnon(o.phone) },
                { label: 'Змінити статус', icon: ArrowLeftRight, onClick: () => setStatusFor([o]), hidden: !can('orders.change_status') },
                { label: 'Друк пакування', icon: Printer, onClick: () => setPrint({ numbers: [o.number], kind: 'packing' }), hidden: !can('orders.print_documents') },
              ]}
              card={(o) => (
                <div className="flex flex-col gap-1 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{o.number}</span>
                    <OrderStatus status={o.status} compact />
                    {o.caution && <TriangleAlert size={15} className="text-warning" aria-label={`Обережно: ${o.caution}`} />}
                    <span className="ml-auto whitespace-nowrap text-caption text-text-muted">{dateTime(o.placedAt)}</span>
                  </div>
                  <p className="truncate text-body text-text-primary">{o.customer || '—'}{o.wholesale && <span className="ml-1.5 text-caption text-gold">опт</span>}</p>
                  <p className="line-clamp-2 text-body-sm text-text-body">{o.itemsSummary}</p>
                  <div className="flex items-center gap-2 text-body-sm">
                    <span className="truncate text-text-muted">{o.city ?? DELIVERY_SHORT[o.delivery ?? ''] ?? ''}</span>
                    <span className="ml-auto tabular font-semibold text-text-primary">{uah(o.totalMinor)}</span>
                    {paidMark(o)}
                  </div>
                </div>
              )}
            />
          )}
        </>
      )}

      {statusFor && <StatusSheet rows={statusFor} onClose={() => setStatusFor(null)} onDone={() => setSelected(new Set())} />}
      {print && <PrintPreview numbers={print.numbers} kind={print.kind} onClose={() => setPrint(null)} />}
    </div>
  );
}
