import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Percent, Pencil, Plus, Tag, Trash2, Truck, X, type LucideIcon } from 'lucide-react';
import { api, post } from '@/lib/api';
import { date, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { DataTable, type Column } from '@/components/DataTable';
import { EmptyState, GhostButton, Hint, PageHeader, PrimaryButton, Sheet, useConfirm, useToast } from '@/components/ui';
import { errorText, fromLocal, inputCls, labelCls, Switch, toLocal, toMinor } from '@/features/settings/parts';

interface Promo {
  id: string; code: string; type: 'PERCENTAGE' | 'FIXED'; percentage: number | null; valueMinor: number | null; minSubtotalMinor: number | null;
  usageLimit: number | null; usageCount: number; perCustomerLimit: number | null; productIds: string[]; categoryIds: string[];
  startsAt: string | null; endsAt: string | null; isActive: boolean; ordersCount: number; ordersSumMinor: number;
}
interface Chosen { id: string; name: string }

const ERR: Record<string, string> = {
  CODE_TAKEN: 'Такий промокод уже є — придумайте інший.', CODE_IN_USE: 'Промокодом уже користувались, тож назву не змінити (вона є в замовленнях).',
  PROMO_USED: 'Промокодом уже користувались — його можна лише вимкнути.', CODE_CHARS: 'Лише літери, цифри, «-» і «_», без пробілів.',
  BEFORE_START: 'Кінець має бути пізніше за початок.', REQUIRED: 'Вкажіть розмір знижки.', too_small: 'Промокод — щонайменше 3 символи.',
};
const discount = (p: Pick<Promo, 'type' | 'percentage' | 'valueMinor'>) => (p.type === 'PERCENTAGE' ? `−${p.percentage}%` : `−${uah(p.valueMinor)}`);

function state(p: Promo): [string, string] {
  const now = Date.now();
  if (!p.isActive) return ['вимкнено', 'text-text-muted'];
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return [`з ${date(p.startsAt)}`, 'text-info'];
  if (p.endsAt && new Date(p.endsAt).getTime() <= now) return ['закінчився', 'text-text-muted'];
  if (p.usageLimit !== null && p.usageCount >= p.usageLimit) return ['вичерпано', 'text-text-muted'];
  return ['діє', 'text-success'];
}

// Round 20 #171–172, round 19 D3: one code for everyone; the list shows code, discount, valid to, uses,
// order sum and an on/off switch. Creating starts with the kind of discount.
export function PromotionsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data } = useQuery({ queryKey: ['promotions'], queryFn: () => api<{ items: Promo[] }>('/admin/promotions') });
  const [editing, setEditing] = useState<Promo | 'new' | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ['promotions'] });

  const toggle = async (p: Promo, on: boolean) => {
    try { await api(`/admin/promotions/${p.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: on }) }); await refresh(); toast(on ? `${p.code} увімкнено` : `${p.code} вимкнено`); }
    catch (e) { toast(errorText(e, ERR), 'error'); }
  };
  const remove = async (p: Promo) => {
    if (!(await confirm({ title: `Видалити ${p.code}?`, text: 'Покупці більше не зможуть ним скористатися.', ok: 'Видалити', danger: true }))) return;
    try { await api(`/admin/promotions/${p.id}`, { method: 'DELETE' }); await refresh(); toast('Промокод видалено'); } catch (e) { toast(errorText(e, ERR), 'error'); }
  };

  const columns: Array<Column<Promo>> = [
    { key: 'code', header: 'Код', cell: (p) => <span className="font-mono font-semibold text-text-primary">{p.code}</span> },
    { key: 'discount', header: 'Знижка', cell: (p) => <span>{discount(p)}{p.minSubtotalMinor ? <span className="text-text-muted"> від {uah(p.minSubtotalMinor)}</span> : null}</span> },
    { key: 'to', header: 'Діє до', cell: (p) => { const [t, c] = state(p); return <span>{p.endsAt ? date(p.endsAt) : 'без кінця'} <span className={`text-caption ${c}`}>· {t}</span></span>; } },
    { key: 'uses', header: 'Використано разів', align: 'right', cell: (p) => <>{p.usageCount}{p.usageLimit ? <span className="text-text-muted"> з {p.usageLimit}</span> : null}</> },
    { key: 'sum', header: 'Замовлень на суму', align: 'right', cell: (p) => (p.ordersCount ? uah(p.ordersSumMinor) : '—') },
    { key: 'on', header: 'Увімкнено', cell: (p) => <Switch hideLabel on={p.isActive} disabled={!can('promotions.update')} label={`Увімкнено ${p.code}`} onChange={(on) => void toggle(p, on)} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Акції й промокоди" actions={can('promotions.create') && <PrimaryButton icon={Plus} onClick={() => setEditing('new')}>Промокод</PrimaryButton>} />
      <p className="max-w-3xl text-body-sm text-text-muted">Один код для всіх покупців — для свят і розсилок. Покупець вводить його при оформленні («Є промокод?»). З оптовою знижкою не додається: застосовується більша.</p>
      <DataTable
        rows={data?.items} columns={columns}
        onRowClick={can('promotions.update') ? (p) => setEditing(p) : undefined}
        actions={(p) => [
          { label: 'Змінити', icon: Pencil, onClick: () => setEditing(p), hidden: !can('promotions.update') },
          { label: 'Копіювати код', icon: Copy, onClick: () => void navigator.clipboard.writeText(p.code).then(() => toast('Код скопійовано')) },
          { label: 'Видалити', icon: Trash2, danger: true, onClick: () => void remove(p), hidden: !can('promotions.delete') || p.usageCount > 0 },
        ]}
        card={(p) => {
          const [t, c] = state(p);
          return (
            <div className="flex flex-col gap-1 pr-8">
              <div className="flex items-center gap-2"><span className="font-mono text-body font-semibold">{p.code}</span><span className="text-body">{discount(p)}</span></div>
              <span className="text-body-sm text-text-muted">{p.endsAt ? `до ${date(p.endsAt)}` : 'без кінця'} · <span className={c}>{t}</span> · використано {p.usageCount}{p.ordersCount ? ` · ${uah(p.ordersSumMinor)}` : ''}</span>
              <div onClick={(e) => e.stopPropagation()}><Switch on={p.isActive} disabled={!can('promotions.update')} label="Увімкнено" onChange={(on) => void toggle(p, on)} /></div>
            </div>
          );
        }}
        empty={<EmptyState icon={Tag} text="Промокодів ще немає. Створіть перший — наприклад, до свят або для розсилки." action={can('promotions.create') && <PrimaryButton icon={Plus} onClick={() => setEditing('new')}>Промокод</PrimaryButton>} />}
      />
      {editing && <PromoSheet p={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    </div>
  );
}

const KINDS: Array<{ type: Promo['type'] | 'FREE_SHIPPING'; icon: LucideIcon; title: string; sub: string; soon?: boolean }> = [
  { type: 'PERCENTAGE', icon: Percent, title: '−%', sub: 'Відсоток від товарів' },
  { type: 'FIXED', icon: Tag, title: '−сума', sub: 'Гривні від товарів' },
  { type: 'FREE_SHIPPING', icon: Truck, title: 'Безкоштовна доставка', sub: 'Скоро: коли сайт рахуватиме доставку', soon: true },
];

function PromoSheet({ p, onClose, onSaved }: { p: Promo | null; onClose: () => void; onSaved: () => Promise<unknown> }) {
  const toast = useToast();
  const [type, setType] = useState<Promo['type'] | null>(p?.type ?? null);
  const [f, setF] = useState({
    code: p?.code ?? '', value: p ? String(p.type === 'PERCENTAGE' ? p.percentage ?? '' : (p.valueMinor ?? 0) / 100) : '',
    min: p?.minSubtotalMinor ? String(p.minSubtotalMinor / 100) : '', limit: p?.usageLimit ? String(p.usageLimit) : '', once: p ? p.perCustomerLimit === 1 : true,
    startsAt: toLocal(p?.startsAt ?? null), endsAt: toLocal(p?.endsAt ?? null), isActive: p?.isActive ?? true,
  });
  const [products, setProducts] = useState<Chosen[]>([]);
  const [productIds, setProductIds] = useState(p?.productIds ?? []);
  const [categoryIds, setCategoryIds] = useState(p?.categoryIds ?? []);
  const [scope, setScope] = useState(!!(p?.productIds.length || p?.categoryIds.length));
  const [warn, setWarn] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!type) return (
    <Sheet title="Новий промокод" onClose={onClose}>
      <p className="mb-3 text-body-sm text-text-muted">Яка знижка?</p>
      <div className="grid gap-2">
        {KINDS.map((k) => (
          <button key={k.type} type="button" disabled={k.soon} onClick={() => setType(k.type as Promo['type'])}
            className="flex items-center gap-3 rounded-xl border border-border-hairline p-4 text-left hover:border-accent hover:bg-bg-alt disabled:opacity-50 disabled:hover:border-border-hairline disabled:hover:bg-transparent">
            <span className="grid size-10 place-items-center rounded-full bg-accent/10 text-accent-text"><k.icon size={20} /></span>
            <span><span className="block text-body font-semibold text-text-primary">{k.title}</span><span className="text-body-sm text-text-muted">{k.sub}</span></span>
          </button>
        ))}
      </div>
    </Sheet>
  );

  const save = async () => {
    setBusy(true);
    const v = f.value.replace(',', '.');
    const body = {
      code: f.code, type, percentage: type === 'PERCENTAGE' && v ? Number(v) : null, valueMinor: type === 'FIXED' ? toMinor(v) : null,
      minSubtotalMinor: toMinor(f.min), usageLimit: f.limit ? Number(f.limit) : null, perCustomerLimit: f.once ? 1 : null,
      productIds: scope ? productIds : [], categoryIds: scope ? categoryIds : [], startsAt: fromLocal(f.startsAt), endsAt: fromLocal(f.endsAt), isActive: f.isActive,
    };
    try {
      const r = p ? await api<{ overlaps: string[] }>(`/admin/promotions/${p.id}`, { method: 'PUT', body: JSON.stringify(body) }) : await post<{ overlaps: string[] }>('/admin/promotions', body);
      await onSaved();
      toast(p ? 'Промокод збережено' : `Промокод ${f.code} створено`);
      if (r.overlaps.length) setWarn(r.overlaps); else onClose();
    } catch (e) { toast(errorText(e, ERR), 'error'); } finally { setBusy(false); }
  };

  if (warn.length) return (
    <Sheet title="Збережено" onClose={onClose}>
      <p className="text-body text-text-body">У той самий час на ті самі товари діє ще {warn.join(', ')}. Покупець може обрати будь-який з кодів — перевірте, чи так задумано.</p>
      <PrimaryButton className="mt-4 w-full" onClick={onClose}>Зрозуміло</PrimaryButton>
    </Sheet>
  );

  const used = !!p && p.usageCount > 0;
  return (
    <Sheet title={p ? `Промокод ${p.code}` : type === 'PERCENTAGE' ? 'Знижка у відсотках' : 'Знижка в гривнях'} onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className={labelCls}>Промокод
            <input value={f.code} autoFocus={!p} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') })} disabled={used} placeholder="ZYMA10" className={`${inputCls} font-mono`} />
          </label>
          <label className={labelCls}>{type === 'PERCENTAGE' ? 'Знижка, %' : 'Знижка, ₴'}
            <input value={f.value} onChange={(e) => setF({ ...f, value: e.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder={type === 'PERCENTAGE' ? '10' : '200'} className={`${inputCls} tabular`} />
          </label>
          <label className={labelCls}>Діє з<input type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} className={`${inputCls} min-w-0`} /></label>
          <label className={labelCls}>Діє до<input type="datetime-local" value={f.endsAt} onChange={(e) => setF({ ...f, endsAt: e.target.value })} className={`${inputCls} min-w-0`} /></label>
          <label className={labelCls}>Від суми замовлення, ₴<input value={f.min} onChange={(e) => setF({ ...f, min: e.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder="будь-якої" className={`${inputCls} tabular`} /></label>
          <label className={labelCls}>Скільки разів усього<input value={f.limit} onChange={(e) => setF({ ...f, limit: e.target.value.replace(/\D/g, '') })} inputMode="numeric" placeholder="без меж" className={`${inputCls} tabular`} /></label>
        </div>
        <span className="flex items-center gap-1.5"><Switch on={f.once} label="Один раз на покупця" onChange={(on) => setF({ ...f, once: on })} /><Hint text="Покупця впізнаємо за номером телефону в замовленні." /></span>
        <Switch on={scope} label="Лише на деякі товари чи категорії" onChange={setScope} />
        {scope && (
          <div className="flex flex-col gap-3 rounded-lg bg-bg-alt p-3">
            <CategoryPicker ids={categoryIds} onChange={setCategoryIds} />
            <ProductPicker ids={productIds} known={products} onChange={(ids, picked) => { setProductIds(ids); if (picked) setProducts([...products, picked]); }} />
          </div>
        )}
        <Switch on={f.isActive} label="Увімкнено" onChange={(on) => setF({ ...f, isActive: on })} />
        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {!p && <GhostButton onClick={() => setType(null)}>Інший вид знижки</GhostButton>}
          <PrimaryButton disabled={busy || f.code.length < 3 || !f.value || (scope && !productIds.length && !categoryIds.length)} onClick={() => void save()}>{p ? 'Зберегти' : 'Створити'}</PrimaryButton>
        </div>
      </div>
    </Sheet>
  );
}

function CategoryPicker({ ids, onChange }: { ids: string[]; onChange: (ids: string[]) => void }) {
  const { data } = useQuery({ queryKey: ['admin-categories'], queryFn: () => api<{ items: Array<{ id: string; name: string; parentId: string | null }> }>('/admin/categories') });
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body-sm text-text-muted">Категорії (разом з підкатегоріями)</span>
      <div className="flex flex-wrap gap-1.5">
        {data?.items.map((c) => {
          const on = ids.includes(c.id);
          return <button key={c.id} type="button" aria-pressed={on} onClick={() => onChange(on ? ids.filter((x) => x !== c.id) : [...ids, c.id])}
            className={`rounded-full border px-3 py-1 text-body-sm ${on ? 'border-accent bg-accent text-white' : 'border-border-control bg-bg-surface text-text-primary'}`}>{c.name}</button>;
        })}
      </div>
    </div>
  );
}

function ProductPicker({ ids, known, onChange }: { ids: string[]; known: Chosen[]; onChange: (ids: string[], picked?: Chosen) => void }) {
  const [q, setQ] = useState('');
  type Row = { id: string; name: string; sku: string };
  const { data: found } = useQuery({ queryKey: ['promo-products', q], enabled: q.trim().length >= 2, queryFn: () => api<{ items: Row[] }>(`/admin/products?tab=active&perPage=20&q=${encodeURIComponent(q.trim())}`) });
  const { data: all } = useQuery({ queryKey: ['promo-products-all'], enabled: ids.length > 0, queryFn: () => api<{ items: Row[] }>('/admin/products?tab=all&perPage=100') });
  const name = (id: string) => known.find((x) => x.id === id)?.name ?? all?.items.find((x) => x.id === id)?.name ?? '…';
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body-sm text-text-muted">Товари</span>
      {ids.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id) => <span key={id} className="inline-flex items-center gap-1 rounded-full bg-bg-surface py-1 pl-3 pr-1 text-body-sm">{name(id)}<button type="button" aria-label="Прибрати" onClick={() => onChange(ids.filter((x) => x !== id))} className="rounded-full p-0.5 hover:bg-bg-alt"><X size={14} /></button></span>)}
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Знайти товар: назва або артикул" className={inputCls} />
      {q.trim().length >= 2 && (
        <ul className="max-h-48 overflow-auto rounded-lg border border-border-hairline bg-bg-surface">
          {found?.items.filter((x) => !ids.includes(x.id)).map((x) => (
            <li key={x.id}><button type="button" onClick={() => { onChange([...ids, x.id], { id: x.id, name: x.name }); setQ(''); }} className="w-full px-3 py-2 text-left text-body-sm hover:bg-bg-alt">{x.name} <span className="text-text-muted">{x.sku}</span></button></li>
          ))}
          {found && !found.items.length && <li className="px-3 py-2 text-body-sm text-text-muted">Нічого не знайшлося.</li>}
        </ul>
      )}
    </div>
  );
}
