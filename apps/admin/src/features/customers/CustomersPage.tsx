import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { HeartHandshake, Search, Star, TriangleAlert, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { date, uah } from '@/lib/format';
import { DataTable, type Column } from '@/components/DataTable';
import { FilterButton, FilterChips, filtersToQuery, type FilterGroup, type FilterState } from '@/components/Filters';
import { Badge } from '@/components/status';
import { EmptyState, Hint, IconCircle, useStored } from '@/components/ui';

// Клієнти (round 20 #138–139): a plain table, a card per buyer on the phone; the row opens the
// customer card. Buyers come from orders, keyed by phone — there are no customer accounts (E12).

export const VIOLET = '#8E76A8';

export interface CustomerRow {
  id: string; phone: string; email: string | null; name: string | null; city: string | null; orders: number; valueMinor: number;
  lastOrderAt: string; cancelledOrReturned: number; vip: boolean; regular: boolean; caution: string | null;
}
interface List { items: CustomerRow[]; total: number; pageSize: number; cities: string[] }

export const isAnon = (phone: string) => phone.startsWith('anon-');
export const customerHref = (phone: string) => `/customers/${encodeURIComponent(phone)}`;

/** ★ Оптовик (same flag as in «Пошта»), «Постійний» (3+ orders, automatic), «Обережно» (#139). */
export function CustomerMarks({ vip, regular, caution, compact }: { vip: boolean; regular: boolean; caution: string | null; compact?: boolean }) {
  if (!vip && !regular && !caution) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {vip && <Badge label="Оптовик" icon={Star} color="#B08D4F" compact={compact} />}
      {regular && <Badge label="Постійний" icon={HeartHandshake} color={VIOLET} compact={compact} />}
      {caution && <span title={caution}><Badge label="Обережно" icon={TriangleAlert} color="#C0533F" compact={compact} /></span>}
    </span>
  );
}

const plural = (n: number, one: string, few: string, many: string) => { const c = new Intl.PluralRules('uk').select(n); return c === 'one' ? one : c === 'few' ? few : many; };
const nameOf = (c: CustomerRow) => (isAnon(c.phone) ? 'Знеособлений покупець' : c.name || 'Без імені');

export function CustomersPage() {
  const nav = useNavigate();
  const [filters, setFilters] = useStored<FilterState>('customers.filters', {});
  const [sort, setSort] = useStored<{ key: string; dir: 'asc' | 'desc' }>('customers.sort', { key: 'last', dir: 'desc' });
  const [params] = useSearchParams(); // «/customers?q=…» from an order page or the global search
  const [typed, setTyped] = useState(params.get('q') ?? '');
  const [q, setQ] = useState(params.get('q') ?? '');
  useEffect(() => { const t = window.setTimeout(() => setQ(typed.trim()), 350); return () => window.clearTimeout(t); }, [typed]);

  const qs = filtersToQuery(filters);
  if (q) qs.set('q', q);
  qs.set('sort', sort.key); qs.set('dir', sort.dir);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['customers', qs.toString()], initialPageParam: 1,
    queryFn: ({ pageParam }) => api<List>(`/admin/customers?${qs}&page=${pageParam}`),
    getNextPageParam: (last, all) => (all.length * last.pageSize < last.total ? all.length + 1 : undefined),
  });
  const rows = data?.pages.flatMap((p) => p.items);
  const total = data?.pages[0]?.total;

  const groups: FilterGroup[] = [
    { key: 'marks', label: 'Позначки', kind: 'options', options: [{ value: 'vip', label: '★ Оптовик' }, { value: 'regular', label: 'Постійний (3+ замовлення)' }, { value: 'caution', label: 'Обережно' }] },
    { key: 'city', label: 'Місто', kind: 'options', options: (data?.pages[0]?.cities ?? []).map((c) => ({ value: c, label: c })) },
    { key: 'last', label: 'Останнє замовлення', kind: 'date' },
  ];

  const columns: Array<Column<CustomerRow>> = [
    { key: 'name', header: "Ім'я", sortKey: 'name', cell: (c) => (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`font-medium ${isAnon(c.phone) ? 'text-text-muted' : 'text-text-primary'}`}>{nameOf(c)}</span>
        <CustomerMarks vip={c.vip} regular={c.regular} caution={c.caution} />
      </span>
    ) },
    { key: 'phone', header: 'Телефон', className: 'whitespace-nowrap', cell: (c) => (isAnon(c.phone) ? '—' : c.phone) },
    { key: 'email', header: 'Email', className: 'max-w-56 truncate', cell: (c) => c.email ?? <span className="text-text-faint">—</span> },
    { key: 'city', header: 'Місто', cell: (c) => c.city ?? <span className="text-text-faint">—</span> },
    { key: 'orders', header: 'Замовлень', align: 'right', sortKey: 'orders', cell: (c) => <span title={c.cancelledOrReturned ? `скасовано чи повернено: ${c.cancelledOrReturned}` : undefined}>{c.orders}</span> },
    { key: 'last', header: 'Останнє замовлення', align: 'right', sortKey: 'last', className: 'whitespace-nowrap', cell: (c) => date(c.lastOrderAt) },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <IconCircle icon={Users} color={VIOLET} />
        <h1 className="text-h2 font-semibold text-text-primary">Клієнти</h1>
        <Hint text="Список складено із замовлень: покупець — це номер телефону. Облікових записів у покупців немає." />
        {total !== undefined && <span className="tabular text-body-sm text-text-muted">{total}</span>}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative min-w-0 flex-1 md:max-w-md">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input type="search" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Ім'я, телефон або пошта" aria-label="Пошук клієнтів"
            className="min-h-10 w-full rounded-lg border border-border-control bg-bg-input pl-9 pr-3 text-body-sm text-text-primary max-md:min-h-11" />
        </label>
        <FilterButton groups={groups} value={filters} onApply={setFilters} />
      </div>
      <FilterChips groups={groups} value={filters} onChange={setFilters} />
      <DataTable
        rows={rows} columns={columns} sort={sort} onSort={setSort}
        onRowClick={(c) => nav(customerHref(c.phone))}
        loading={isFetchingNextPage} hasMore={!!hasNextPage} onLoadMore={() => void fetchNextPage()}
        card={(c) => (
          <div className="flex flex-col gap-1 pr-6">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-body font-semibold text-text-primary">{nameOf(c)}</span>
              <CustomerMarks vip={c.vip} regular={c.regular} caution={c.caution} compact />
            </span>
            {!isAnon(c.phone) && <span className="text-body-sm text-text-body">{c.phone}{c.city ? ` · ${c.city}` : ''}</span>}
            <span className="text-caption text-text-muted">{c.orders} {plural(c.orders, 'замовлення', 'замовлення', 'замовлень')} · {uah(c.valueMinor)} · останнє {date(c.lastOrderAt)}</span>
          </div>
        )}
        empty={<EmptyState icon={Users} text={q || Object.keys(filters).length ? 'Нікого не знайшли. Спробуйте інший пошук або скиньте фільтри.' : 'Клієнти з\'являться тут після першого замовлення.'}
          action={Object.keys(filters).length ? <button type="button" onClick={() => setFilters({})} className="text-body-sm text-accent-text underline">Скинути фільтри</button> : undefined} />}
      />
    </div>
  );
}
