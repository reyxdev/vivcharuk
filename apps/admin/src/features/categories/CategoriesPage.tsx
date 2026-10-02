import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { api, post } from '@/lib/api';
import { useMe } from '@/features/auth/useSession';
import { DotsMenu, EmptyState, Hint, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast, useUnsavedGuard } from '@/components/ui';
import { errorText, inputCls, labelCls, Switch, useDragOrder } from '@/features/settings/parts';

interface Cat {
  id: string; key: string | null; parentId: string | null; sortOrder: number; isActive: boolean; isFeatured: boolean; hiddenLocales: string[];
  name: string; slug: string; description: string | null; metaTitle: string | null; metaDescription: string | null;
  defaultCustomSizeRatePerSqmMinor: number | null; products: number; directProducts: number;
}
interface Data { items: Cat[]; featuredMax: number }

const ERR: Record<string, string> = {
  FEATURED_MAX: 'На головній можна позначити щонайбільше 6 категорій (показуються перші 4).', CATEGORY_NOT_EMPTY: 'У категорії є товари або підкатегорії — спершу перенесіть їх.',
  MAX_DEPTH: 'Глибше трьох рівнів не можна.', SLUG_TAKEN: 'Така адреса вже зайнята.', SIBLINGS_CHANGED: 'Список щойно змінився — спробуйте ще раз.',
};
const KEY = ['admin-categories'];

// 23 §23.7, round 20 #165: the tree with drag ordering; ★ marks the circles on the home page.
export function CategoriesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data } = useQuery({ queryKey: KEY, queryFn: () => api<Data>('/admin/categories') });
  const [editing, setEditing] = useState<Cat | null>(null);
  const [adding, setAdding] = useState<{ parentId: string | null } | null>(null);

  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    try { await fn(); await qc.invalidateQueries({ queryKey: KEY }); if (ok) toast(ok); return true; }
    catch (e) { toast(errorText(e, ERR), 'error'); await qc.invalidateQueries({ queryKey: KEY }); return false; }
  };
  const reorder = (parentId: string | null, ids: string[]) => {
    // Shown at once; the server confirms.
    qc.setQueryData<Data>(KEY, (d) => d && { ...d, items: d.items.map((c) => (ids.includes(c.id) ? { ...c, sortOrder: ids.indexOf(c.id) + 1 } : c)) });
    void run(() => post('/admin/categories/reorder', { parentId, orderedIds: ids }), 'Порядок збережено');
  };
  const patch = (c: Cat, body: object, ok: string) => run(() => api(`/admin/categories/${c.id}`, { method: 'PATCH', body: JSON.stringify(body) }), ok);

  if (!data) return <><PageHeader title="Категорії" /><SkeletonRows /></>;
  const children = (id: string | null) => data.items.filter((c) => c.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = children(null).filter((c) => c.isFeatured);
  const ctx: Ctx = { children, can, reorder, patch, setEditing, setAdding, run };

  return (
    <div className="flex max-w-4xl flex-col gap-3">
      <PageHeader title="Категорії" actions={can('categories.create') && <PrimaryButton icon={Plus} onClick={() => setAdding({ parentId: null })}>Категорія</PrimaryButton>} />
      <p className="flex items-center gap-1.5 text-body-sm text-text-muted">
        <Star size={15} className="fill-gold text-gold" /> — на головній сторінці: {featured.slice(0, 4).map((c) => c.name).join(', ') || 'перші чотири категорії'}.
        <Hint text="Показуються перші чотири позначені, у тому ж порядку, що й тут. Порядок змінюється перетягуванням за ⋮⋮." />
      </p>
      {children(null).length ? <Level parentId={null} depth={0} ctx={ctx} /> : <EmptyState icon={FolderTree} text="Категорій ще немає. Створіть першу — нова категорія спершу прихована з сайту." />}
      {editing && <EditSheet c={editing} canRate={can('products.manage_price')} onClose={() => setEditing(null)} save={async (body) => { if (await patch(editing, body, 'Збережено')) setEditing(null); }} />}
      {adding && <AddSheet parent={data.items.find((c) => c.id === adding.parentId) ?? null} onClose={() => setAdding(null)} save={async (name) => { if (await run(() => post('/admin/categories', { name, parentId: adding.parentId }), 'Категорію створено — вона поки прихована')) setAdding(null); }} />}
    </div>
  );
}

interface Ctx {
  children: (id: string | null) => Cat[]; can: (p: string) => boolean; reorder: (parentId: string | null, ids: string[]) => void;
  patch: (c: Cat, body: object, ok: string) => Promise<boolean>; setEditing: (c: Cat) => void; setAdding: (a: { parentId: string | null }) => void;
  run: (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
}

function Level({ parentId, depth, ctx }: { parentId: string | null; depth: number; ctx: Ctx }) {
  const confirm = useConfirm();
  const list = ctx.children(parentId);
  const drag = useDragOrder(list.map((c) => c.id), `cat-${parentId ?? 'root'}`, (ids) => ctx.reorder(parentId, ids));
  const shown = drag.order.map((id) => list.find((c) => c.id === id)!).filter(Boolean);
  const canOrder = ctx.can('categories.reorder') && list.length > 1;
  return (
    <ul className={`flex flex-col gap-1 ${depth ? 'ml-5 border-l border-border-hairline pl-3 md:ml-8' : ''}`}>
      {shown.map((c) => (
        <li key={c.id} className="flex flex-col gap-1">
          <div {...drag.item(c.id)} className={`flex items-center gap-1.5 rounded-lg border bg-bg-surface px-2 py-1.5 ${c.isActive ? 'border-border-hairline' : 'border-dashed border-border-control'} ${drag.dragging === c.id ? 'opacity-70 ring-2 ring-accent' : ''}`}>
            {canOrder ? drag.handle(c.id, c.name) : <span className="w-7" />}
            {depth === 0 && (
              <button type="button" disabled={!ctx.can('categories.feature')} onClick={() => void ctx.patch(c, { isFeatured: !c.isFeatured }, c.isFeatured ? 'Прибрано з головної' : 'Буде на головній')}
                aria-pressed={c.isFeatured} aria-label="На головній" title="На головній сторінці" className="rounded p-1 hover:bg-bg-alt disabled:hover:bg-transparent">
                <Star size={17} className={c.isFeatured ? 'fill-gold text-gold' : 'text-text-faint'} />
              </button>
            )}
            <button type="button" onClick={() => ctx.can('categories.update') && ctx.setEditing(c)} className="min-w-0 flex-1 truncate text-left text-body font-medium text-text-primary">
              {c.name}{!c.isActive && <span className="ml-2 text-caption font-normal text-text-muted">прихована</span>}
            </button>
            <span className="shrink-0 text-body-sm text-text-muted tabular">{c.products} тов.</span>
            {ctx.can('categories.update') && <Switch hideLabel on={c.isActive} label={`${c.name} на сайті`} onChange={(on) => void ctx.patch(c, { isActive: on }, on ? 'Категорія на сайті' : 'Категорію приховано')} />}
            <DotsMenu items={[
              { label: 'Змінити', icon: Pencil, onClick: () => ctx.setEditing(c), hidden: !ctx.can('categories.update') },
              { label: 'Додати підкатегорію', icon: Plus, onClick: () => ctx.setAdding({ parentId: c.id }), hidden: !ctx.can('categories.create') || depth >= 2 },
              { label: 'Видалити', icon: Trash2, danger: true, hidden: !ctx.can('categories.delete') || c.directProducts > 0 || ctx.children(c.id).length > 0,
                onClick: async () => { if (await confirm({ title: `Видалити «${c.name}»?`, text: 'Категорія зникне з панелі й сайту.', ok: 'Видалити', danger: true })) await ctx.run(() => api(`/admin/categories/${c.id}`, { method: 'DELETE' }), 'Категорію видалено'); } },
            ]} />
          </div>
          {ctx.children(c.id).length > 0 && <Level parentId={c.id} depth={depth + 1} ctx={ctx} />}
        </li>
      ))}
    </ul>
  );
}

function AddSheet({ parent, onClose, save }: { parent: Cat | null; onClose: () => void; save: (name: string) => Promise<void> }) {
  const [name, setName] = useState('');
  return (
    <Sheet title={parent ? `Підкатегорія в «${parent.name}»` : 'Нова категорія'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); void save(name.trim()); }} className="flex flex-col gap-3">
        <label className={labelCls}>Назва<input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputCls} /></label>
        <p className="text-body-sm text-text-muted">Нова категорія спершу прихована з сайту — увімкніть її, коли додасте товари.</p>
        <PrimaryButton type="submit" disabled={name.trim().length < 2}>Створити</PrimaryButton>
      </form>
    </Sheet>
  );
}

function EditSheet({ c, canRate, onClose, save }: { c: Cat; canRate: boolean; onClose: () => void; save: (body: Record<string, unknown>) => Promise<void> }) {
  const init = { name: c.name, slug: c.slug, description: c.description ?? '', metaTitle: c.metaTitle ?? '', metaDescription: c.metaDescription ?? '', rate: c.defaultCustomSizeRatePerSqmMinor ? String(c.defaultCustomSizeRatePerSqmMinor / 100) : '', hidden: c.hiddenLocales };
  const [f, setF] = useState(init);
  const [more, setMore] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(init);
  useUnsavedGuard(dirty);
  const submit = () => {
    const body: Record<string, unknown> = { name: f.name.trim(), description: f.description.trim() || null, metaTitle: f.metaTitle.trim() || null, metaDescription: f.metaDescription.trim() || null, hiddenLocales: f.hidden };
    if (f.slug !== c.slug) body.slug = f.slug;
    if (canRate) body.defaultCustomSizeRatePerSqmMinor = f.rate ? Math.round(Number(f.rate.replace(',', '.')) * 100) : null;
    void save(body);
  };
  return (
    <Sheet title={c.name} onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Назва<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></label>
        <label className={labelCls}>Текст унизу сторінки категорії<textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={4} className={inputCls} /></label>
        {canRate && (
          <label className={labelCls}>Ціна за м² для нових товарів, ₴ (наявних не змінює)
            <input value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" className={`${inputCls} max-w-40 tabular`} />
          </label>
        )}
        <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="self-start text-body-sm text-accent-text underline">{more ? 'Сховати додаткове' : 'Додатково: адреса, Google, мови'}</button>
        {more && (
          <div className="flex flex-col gap-3 rounded-lg bg-bg-alt p-3">
            <label className={labelCls}>Адреса сторінки<input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value.toLowerCase() })} className={`${inputCls} font-mono`} /></label>
            {f.slug !== c.slug && <p className="text-body-sm text-warning">Стара адреса автоматично переведе на нову, тож посилання не зламаються.</p>}
            <label className={labelCls}>Заголовок для Google (необов'язково)<input value={f.metaTitle} onChange={(e) => setF({ ...f, metaTitle: e.target.value })} maxLength={160} className={inputCls} /></label>
            <label className={labelCls}>Опис для Google (необов'язково)<input value={f.metaDescription} onChange={(e) => setF({ ...f, metaDescription: e.target.value })} maxLength={320} className={inputCls} /></label>
            <fieldset className="flex flex-wrap items-center gap-4 text-body-sm">
              <legend className="mb-1 text-text-muted">Не показувати мовами</legend>
              {(['en', 'pl', 'de'] as const).map((l) => (
                <label key={l} className="flex items-center gap-1.5"><input type="checkbox" checked={f.hidden.includes(l)} onChange={(e) => setF({ ...f, hidden: e.target.checked ? [...f.hidden, l] : f.hidden.filter((x) => x !== l) })} className="size-4 accent-[var(--accent)]" />{l.toUpperCase()}</label>
              ))}
            </fieldset>
          </div>
        )}
        <PrimaryButton disabled={!dirty || f.name.trim().length < 2} onClick={submit}>Зберегти</PrimaryButton>
      </div>
    </Sheet>
  );
}
