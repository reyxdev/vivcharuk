import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Eye, EyeOff, FileSpreadsheet, FolderInput, Package, Percent, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { date, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { openPriceTags } from '@/features/print/PriceTags';
import { DataTable, type Column } from '@/components/DataTable';
import { FilterButton, FilterChips, filtersToQuery, type FilterGroup, type FilterState } from '@/components/Filters';
import { DotsMenu, EmptyState, PageHeader, PrimaryButton, Sheet, Tabs, useStored, useToast } from '@/components/ui';
import { LIST_KEY, type ListTab, PRODUCT_STATUS, type ProductRow, useLibraries, useProduct, useProductList, useTemplates } from './api';
import { CategorySheet, categoryTree, PriceSheet, useBulk } from './BulkBar';
import { ExcelPanel } from './ExcelPanel';
import { priceText, variantLabel } from './model';
import { useProductActions } from './parts';
import { NumCell } from './VariantGrid';

// Round 20 #119–123, #130–132, #145–149, #220–221: the products list.

const TABS: Array<{ key: ListTab; label: string }> = [
  { key: 'all', label: 'Усі' }, { key: 'active', label: 'На сайті' }, { key: 'draft', label: 'Чернетки' },
  { key: 'hidden', label: 'Приховані' }, { key: 'low', label: 'Закінчуються' }, { key: 'out', label: 'Немає в наявності' },
];

function useQuickSave() {
  const qc = useQueryClient();
  const toast = useToast();
  return async (id: string, target: { variantId: string | null; index: number }, body: { priceMinor?: number; stockQty?: number }) => {
    try {
      await api(`/admin/products/${id}/quick`, { method: 'PATCH', body: JSON.stringify({ ...(target.variantId ? { variantId: target.variantId } : { index: target.index }), ...body }) });
      toast('Збережено');
      await Promise.all([qc.invalidateQueries({ queryKey: LIST_KEY }), qc.invalidateQueries({ queryKey: ['product', id] })]);
      return true;
    } catch (e) { toast(messageFor(e instanceof ApiError ? e.code : ''), 'error'); return false; }
  };
}

/** Price or stock right in the row (#122): tap → field, Enter (or leaving the field) saves, Esc cancels. */
function InlineNumber({ row, field, can, onMany }: { row: ProductRow; field: 'price' | 'stock'; can: boolean; onMany: (r: ProductRow) => void }) {
  const save = useQuickSave();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState('');
  const shown = field === 'price' ? priceText(row.priceMinMinor, row.priceMaxMinor, uah) : row.variantCount ? `${row.stock}${row.madeToOrder && !row.stock ? ' · під замовл.' : ''}` : '—';
  const start = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!can) return;
    if (!row.quick) { if (row.variantCount) onMany(row); else nav(`/products/${row.id}`); return; }
    setText(field === 'price' ? (row.priceMinMinor ? String(row.priceMinMinor / 100) : '') : String(row.stock));
    setEdit(true);
  };
  const commit = async () => {
    setEdit(false);
    const n = Number(text.replace(',', '.').replace(/\s/g, ''));
    if (text.trim() === '' || !Number.isFinite(n) || n < 0) return;
    const value = field === 'price' ? Math.round(n * 100) : Math.round(n);
    if (value === (field === 'price' ? row.priceMinMinor : row.stock)) return;
    if (field === 'price' && value < 100) return;
    await save(row.id, row.quick!, field === 'price' ? { priceMinor: value } : { stockQty: value });
  };
  if (edit) {
    return (
      <input autoFocus inputMode={field === 'price' ? 'decimal' : 'numeric'} value={text} aria-label={field === 'price' ? 'Ціна' : 'Залишок'}
        onClick={(e) => e.stopPropagation()} onChange={(e) => setText(e.target.value)} onBlur={() => void commit()}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setText(''); setEdit(false); } }}
        className="tabular w-24 rounded-md border border-accent bg-bg-input px-2 py-1 text-right text-body-sm text-text-primary max-md:py-2 max-md:text-body" />
    );
  }
  return (
    <button type="button" onClick={start} disabled={!can} title={can ? 'Змінити' : undefined}
      className={`tabular -mx-1.5 rounded-md px-1.5 py-0.5 text-right ${can ? 'hover:bg-bg-alt hover:underline hover:decoration-dotted' : ''} ${field === 'stock' && row.status === 'ACTIVE' && row.variantCount && !row.stock && !row.madeToOrder ? 'text-danger' : 'text-text-primary'}`}>
      {shown}
    </button>
  );
}

/** Several sizes or colours: a small editor with each row's price and stock. */
function QuickSheet({ row, canPrice, canStock, onClose }: { row: ProductRow; canPrice: boolean; canStock: boolean; onClose: () => void }) {
  const { data: p } = useProduct(row.id);
  const { data: libs } = useLibraries();
  const nav = useNavigate();
  const save = useQuickSave();
  const [edits, setEdits] = useState<Record<number, { priceMinor?: number; stockQty?: number }>>({});
  const byId = useMemo(() => new Map(libs ? [...libs.colors, ...libs.patterns, ...Object.values(libs.sizes).flat()].map((v) => [v.id, v]) : []), [libs]);
  const submit = async () => {
    for (const [i, body] of Object.entries(edits)) {
      const v = p!.document.variants[Number(i)]!;
      if (!(await save(row.id, { variantId: v.id ?? null, index: Number(i) }, body))) return;
    }
    onClose();
  };
  return (
    <Sheet title={row.name || 'Без назви'} onClose={onClose}>
      {!p || !libs ? <p className="text-body-sm text-text-muted">Завантаження…</p> : (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col divide-y divide-border-hairline">
            {p.document.variants.map((v, i) => (
              <li key={i} className="grid grid-cols-[1fr_6rem_4.5rem] items-center gap-2 py-2">
                <span className="truncate text-body-sm text-text-primary">{variantLabel(v, byId)}</span>
                <NumCell money value={edits[i]?.priceMinor ?? v.priceMinor} onValue={(x) => setEdits({ ...edits, [i]: { ...edits[i], priceMinor: x ?? 0 } })} disabled={!canPrice} aria-label="Ціна, ₴" className="w-full text-right" />
                <NumCell value={edits[i]?.stockQty ?? v.stockQty} onValue={(x) => setEdits({ ...edits, [i]: { ...edits[i], stockQty: x ?? 0 } })} disabled={!canStock} aria-label="Залишок" className="w-full text-right" />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={() => nav(`/products/${row.id}`)} className="text-body-sm text-accent-text underline">Відкрити товар</button>
            <PrimaryButton disabled={!Object.keys(edits).length} onClick={() => void submit()}>Зберегти</PrimaryButton>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Status({ r }: { r: ProductRow }) {
  const tone = r.status === 'ACTIVE' ? 'bg-accent/10 text-accent-text' : r.status === 'DRAFT' ? 'bg-bg-alt text-text-body' : 'bg-bg-alt text-text-muted';
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-caption font-medium ${tone}`}>{PRODUCT_STATUS[r.status]}</span>
      {r.hasDraft && r.publishedAt && <span className="whitespace-nowrap rounded-full bg-warning/10 px-2 py-0.5 text-caption text-warning">є зміни</span>}
    </span>
  );
}

const Thumb = ({ src }: { src: string | null }) => (
  <span className="block size-10 shrink-0 overflow-hidden rounded-md bg-bg-alt">{src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : <Package size={18} className="m-[11px] text-text-faint" />}</span>
);

export function ProductsPage() {
  const nav = useNavigate();
  const { data: me } = useMe();
  const can = (k: string) => !!me?.permissions.includes(k);
  const canPrice = can('products.update') && can('products.manage_price');
  const canStock = can('products.update') && can('products.manage_stock');
  const canBulk = can('products.bulk_edit');
  const { data: libs } = useLibraries();
  useTemplates(); // warm for «Додати товар»

  const [tab, setTab] = useStored<ListTab>('products.tab', 'all');
  const [filters, setFilters] = useStored<FilterState>('products.filters', {});
  const [sort, setSort] = useStored<{ key: string; dir: 'asc' | 'desc' }>('products.sort', { key: 'updated', dir: 'desc' });
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => { const h = window.setTimeout(() => setQuery(q.trim()), 300); return () => window.clearTimeout(h); }, [q]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sheet, setSheet] = useState<{ kind: 'price' | 'category'; ids: string[] } | null>(null);
  const [many, setMany] = useState<ProductRow | null>(null);
  const [excel, setExcel] = useState(false);
  const bulk = useBulk(() => setSelected(new Set()));
  // Links from home («Закінчуються», «Без фото») and from the global search («Показати всі»):
  // /products?tab=low, ?filter=no_photo, ?q=<text>. Applied once, then the address is cleaned.
  const [params0, setParams0] = useSearchParams();
  useEffect(() => {
    const t = params0.get('tab'), f = params0.get('filter'), text = params0.get('q');
    if (!t && !f && text === null) return;
    if (t && TABS.some((x) => x.key === t)) setTab(t as ListTab);
    if (f === 'no_photo') { setFilters({ nophoto: true }); if (!t) setTab('all'); }
    if (text !== null) { setQ(text); setQuery(text.trim()); if (!t) setTab('all'); }
    setParams0({}, { replace: true });
  }, [params0]); // eslint-disable-line react-hooks/exhaustive-deps
  const actions = useProductActions();

  const params = useMemo(() => {
    const p = filtersToQuery(filters);
    p.set('tab', tab); p.set('sort', sort.key); p.set('dir', sort.dir);
    if (query) p.set('q', query);
    return p;
  }, [filters, tab, sort, query]);
  const list = useProductList(params);
  const rows = list.data?.pages.flatMap((p) => p.items);
  const counts = list.data?.pages[0]?.counts;

  const groups: FilterGroup[] = useMemo(() => {
    if (!libs) return [];
    return [
      // Round 22 K42: a tree; a checked group takes its subcategories with it (the API expands it).
      { key: 'category', label: 'Категорія', kind: 'tree', options: categoryTree(libs).map((c) => ({ value: c.id, label: c.name, children: c.children.map((x) => ({ value: x.id, label: x.name })) })) },
      ...(libs.collections.length ? [{ key: 'collection', label: 'Колекція', kind: 'options' as const, options: libs.collections.map((c) => ({ value: c.id, label: c.name })) }] : []),
      { key: 'price', label: 'Ціна', kind: 'range', unit: '₴' },
      { key: 'color', label: 'Колір', kind: 'options', options: libs.colors.filter((c) => !c.isHidden).map((c) => ({ value: c.id, label: c.label })) },
      { key: 'material', label: 'Матеріал', kind: 'options', options: libs.materials.filter((m) => !m.isHidden).map((m) => ({ value: m.id, label: m.name })) },
      { key: 'custom', label: 'Свій розмір', kind: 'toggle' },
      { key: 'nophoto', label: 'Без фото', kind: 'toggle' },
      { key: 'origin', label: 'Виробництво', kind: 'options', single: true, options: [{ value: 'own', label: 'Своє виробництво' }, { value: 'partner', label: 'Від партнерів' }] },
    ];
  }, [libs]);

  const columns: Array<Column<ProductRow>> = [
    { key: 'photo', header: 'Фото', cell: (r) => <Thumb src={r.thumb} />, className: 'w-14' },
    // Round 22 K43: under the name, the main category only.
    { key: 'name', header: 'Назва', sortKey: 'name', cell: (r) => <span className="flex min-w-0 flex-col"><span className="line-clamp-1 font-medium text-text-primary">{r.name || 'Без назви'}</span>{r.category && <span className="truncate text-caption text-text-muted">{r.category}</span>}</span> },
    { key: 'sku', header: 'Артикул', sortKey: 'sku', cell: (r) => <span className="whitespace-nowrap font-mono text-caption text-text-muted">{r.sku}</span> },
    { key: 'price', header: 'Ціна', sortKey: 'price', align: 'right', cell: (r) => <InlineNumber row={r} field="price" can={canPrice} onMany={setMany} /> },
    { key: 'stock', header: 'Залишок', sortKey: 'stock', align: 'right', cell: (r) => <InlineNumber row={r} field="stock" can={canStock} onMany={setMany} /> },
    { key: 'site', header: 'На сайті', cell: (r) => <Status r={r} /> },
    { key: 'sold', header: 'Продано за місяць', sortKey: 'sold', align: 'right', cell: (r) => (r.soldMonth ? r.soldMonth : <span className="text-text-faint">—</span>) },
    { key: 'updated', header: 'Змінено', sortKey: 'updated', cell: (r) => <span className="whitespace-nowrap text-caption text-text-muted">{date(r.updatedAt)}</span> },
  ];

  const card = (r: ProductRow) => (
    <div className="flex items-center gap-3 pr-8">
      <Thumb src={r.thumb} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-body-sm font-medium text-text-primary">{r.name || 'Без назви'}</span>
        {r.category && <span className="truncate text-caption text-text-muted">{r.category}</span>}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm">
          <InlineNumber row={r} field="price" can={canPrice} onMany={setMany} />
          <span className="flex items-center gap-1 text-text-muted">залишок <InlineNumber row={r} field="stock" can={canStock} onMany={setMany} /></span>
        </span>
        <span className="flex flex-wrap items-center gap-2"><Status r={r} /><span className="font-mono text-caption text-text-faint">{r.sku}</span></span>
      </div>
    </div>
  );

  const rowActions = (r: ProductRow) => [
    { label: 'Створити схожий', icon: Copy, onClick: () => void actions.similar(r.id), hidden: !can('products.create') },
    { label: r.slug && r.status === 'ACTIVE' ? 'Подивитись на сайті' : 'Подивитись, як на сайті', icon: Eye, onClick: () => actions.view(r) },
    { label: 'Цінник', icon: Tag, onClick: () => actions.priceTag(r.id) },
    { label: 'Сховати', icon: EyeOff, onClick: () => void actions.setHidden(r.id, true), hidden: r.status === 'ARCHIVED' || !can('products.archive') },
    { label: 'Показати на сайті', icon: Eye, onClick: () => void actions.setHidden(r.id, false), hidden: r.status !== 'ARCHIVED' || !can('products.publish') },
    { label: 'Видалити', icon: Trash2, danger: true, onClick: () => void actions.remove(r.id, r.name), hidden: !can('products.delete') },
  ];

  const bulkActions = [
    ...(can('products.manage_price') ? [{ label: 'Ціна на %', icon: Percent, onClick: (ids: string[]) => setSheet({ kind: 'price', ids }) }] : []),
    ...(can('products.archive') ? [{ label: 'Сховати', icon: EyeOff, onClick: (ids: string[]) => void bulk.hide(ids) }, { label: 'Показати', icon: Eye, onClick: (ids: string[]) => void bulk.show(ids) }] : []),
    ...(can('products.update') ? [{ label: 'Змінити категорію', icon: FolderInput, onClick: (ids: string[]) => setSheet({ kind: 'category', ids }) }] : []),
    { label: 'Цінники', icon: Tag, onClick: (ids: string[]) => openPriceTags(ids) },
    ...(can('products.delete') ? [{ label: 'Видалити', icon: Trash2, danger: true, onClick: (ids: string[]) => void bulk.remove(ids) }] : []),
  ];

  const searching = !!query || Object.keys(filters).length > 0;
  return (
    <div className="flex flex-col gap-3">
      <PageHeader title="Товари" actions={
        <>
          {(can('products.export') || can('products.import')) && <DotsMenu label="Ще дії" items={[{ label: 'Excel: вивантажити або завантажити', icon: FileSpreadsheet, onClick: () => setExcel(!excel) }]} />}
          {can('products.create') && <PrimaryButton icon={Plus} onClick={() => nav('/products/new')}>Додати товар</PrimaryButton>}
        </>
      } />
      {excel && <ExcelPanel onClose={() => setExcel(false)} />}
      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts?.[t.key] ?? null }))} value={tab} onChange={(k) => { setTab(k); setSelected(new Set()); }} />
      <div className="flex items-center gap-2">
        <label className="relative min-w-0 flex-1 md:max-w-md">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Назва або артикул" aria-label="Пошук товарів"
            className="min-h-10 w-full rounded-lg border border-border-control bg-bg-input pl-9 pr-3 text-body-sm text-text-primary max-md:min-h-11 max-md:text-body" />
        </label>
        {groups.length > 0 && <FilterButton groups={groups} value={filters} onApply={setFilters} />}
      </div>
      <FilterChips groups={groups} value={filters} onChange={setFilters} />

      <DataTable
        rows={rows} columns={columns} card={card} onRowClick={(r) => nav(`/products/${r.id}`)} actions={rowActions}
        sort={sort} onSort={setSort} loading={list.isFetchingNextPage} hasMore={!!list.hasNextPage} onLoadMore={() => void list.fetchNextPage()}
        selected={canBulk ? selected : undefined} onSelect={canBulk ? setSelected : undefined} bulk={canBulk ? bulkActions : undefined}
        empty={<EmptyState icon={Package} text={searching ? 'Нічого не знайшли — спробуйте інше слово або скиньте фільтри.' : 'Тут поки немає товарів.'}
          action={!searching && can('products.create') ? <PrimaryButton icon={Plus} onClick={() => nav('/products/new')}>Додати товар</PrimaryButton> : undefined} />}
      />

      {sheet?.kind === 'price' && <PriceSheet ids={sheet.ids} onClose={() => setSheet(null)} onDone={() => setSelected(new Set())} />}
      {sheet?.kind === 'category' && libs && <CategorySheet ids={sheet.ids} libs={libs} onClose={() => setSheet(null)} onPick={(id, mode) => { const ids = sheet.ids; setSheet(null); void bulk.category(ids, id, mode); }} />}
      {many && <QuickSheet row={many} canPrice={canPrice} canStock={canStock} onClose={() => setMany(null)} />}
    </div>
  );
}
