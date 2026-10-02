import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, Pencil, X } from 'lucide-react';
import { api, post } from '@/lib/api';
import { uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { DotsMenu, EmptyState, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast, useUnsavedGuard } from '@/components/ui';
import { errorText, inputCls, labelCls, Switch, useDragOrder } from '@/features/settings/parts';

interface Col {
  id: string; key: string; isActive: boolean; name: string; slug: string; description: string | null; metaTitle: string | null; metaDescription: string | null;
  products: Array<{ id: string; sku: string; status: string; name: string; priceMinMinor: number; priceMaxMinor: number }>;
}
const KEY = ['admin-collections'];

// Round 12 T9, round 20 restyle: products join a collection by a tick in their editor; the order is set
// here by dragging.
export function CollectionsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: me } = useMe();
  const canEdit = !!me?.permissions.includes('categories.update');
  const { data } = useQuery({ queryKey: KEY, queryFn: () => api<{ items: Col[] }>('/admin/collections') });
  const [editing, setEditing] = useState<Col | null>(null);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); await qc.invalidateQueries({ queryKey: KEY }); toast(ok); return true; }
    catch (e) { toast(errorText(e, { SELECTION_CHANGED: 'Список щойно змінився — спробуйте ще раз.' }), 'error'); await qc.invalidateQueries({ queryKey: KEY }); return false; }
  };
  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <PageHeader title="Колекції" sub="Товар додається в колекцію галочкою в його редакторі. Тут — порядок і тексти сторінки." />
      {!data ? <SkeletonRows /> : !data.items.length ? <EmptyState icon={Layers} text="Колекцій ще немає." /> : data.items.map((c) => (
        <Card key={c.id} c={c} canEdit={canEdit} run={run} onEdit={() => setEditing(c)}
          reorder={(ids) => {
            qc.setQueryData<{ items: Col[] }>(KEY, (d) => d && { items: d.items.map((x) => (x.id === c.id ? { ...x, products: ids.map((id) => x.products.find((p) => p.id === id)!) } : x)) });
            void run(() => post(`/admin/collections/${c.id}/order`, { productIds: ids }), 'Порядок збережено');
          }} />
      ))}
      {editing && <EditSheet c={editing} onClose={() => setEditing(null)} save={async (body) => { if (await run(() => api(`/admin/collections/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) }), 'Збережено')) setEditing(null); }} />}
    </div>
  );
}

function Card({ c, canEdit, run, onEdit, reorder }: { c: Col; canEdit: boolean; run: (fn: () => Promise<unknown>, ok: string) => Promise<boolean>; onEdit: () => void; reorder: (ids: string[]) => void }) {
  const confirm = useConfirm();
  const drag = useDragOrder(c.products.map((p) => p.id), `col-${c.id}`, reorder);
  const shown = drag.order.map((id) => c.products.find((p) => p.id === id)!).filter(Boolean);
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-body font-semibold text-text-primary">{c.name}</h2>
          <p className="text-caption text-text-muted">{c.products.length} тов.{c.isActive ? '' : ' · прихована'}</p>
        </div>
        {canEdit && <Switch hideLabel on={c.isActive} label={`${c.name} на сайті`} onChange={(on) => void run(() => api(`/admin/collections/${c.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: on }) }), on ? 'Колекція на сайті' : 'Колекцію приховано')} />}
        <DotsMenu items={[{ label: 'Назва й тексти', icon: Pencil, onClick: onEdit, hidden: !canEdit }]} />
      </div>
      {!c.products.length ? <p className="text-body-sm text-text-muted">Товарів ще немає — позначте колекцію в редакторі товару.</p> : (
        <ol className="flex flex-col">
          {shown.map((p, i) => (
            <li key={p.id} {...drag.item(p.id)} className={`flex items-center gap-2 rounded-lg px-1 py-1 text-body-sm ${drag.dragging === p.id ? 'bg-bg-alt ring-2 ring-accent' : 'hover:bg-bg-page'}`}>
              {canEdit && c.products.length > 1 && drag.handle(p.id, p.name)}
              <span className="w-6 text-right text-text-muted tabular">{i + 1}.</span>
              <Link to={`/products/${p.id}`} className="min-w-0 flex-1 truncate text-text-primary hover:underline">{p.name}</Link>
              <span className="shrink-0 text-text-muted tabular">{p.status === 'ACTIVE' ? uah(p.priceMinMinor) : p.status === 'ARCHIVED' ? 'в архіві' : 'чернетка'}</span>
              {canEdit && (
                <button type="button" aria-label={`Прибрати ${p.name} з колекції`} className="rounded-full p-1.5 text-text-muted hover:bg-bg-alt hover:text-danger"
                  onClick={async () => { if (await confirm({ title: `Прибрати «${p.name}» з колекції?`, text: 'Сам товар залишиться на сайті.', ok: 'Прибрати' })) await run(() => api(`/admin/collections/${c.id}/products/${p.id}`, { method: 'DELETE' }), 'Прибрано з колекції'); }}>
                  <X size={15} />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function EditSheet({ c, onClose, save }: { c: Col; onClose: () => void; save: (body: object) => Promise<void> }) {
  const init = { name: c.name, description: c.description ?? '', metaTitle: c.metaTitle ?? '', metaDescription: c.metaDescription ?? '' };
  const [f, setF] = useState(init);
  const [more, setMore] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(init);
  useUnsavedGuard(dirty);
  return (
    <Sheet title={c.name} onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Назва<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></label>
        <label className={labelCls}>Текст унизу сторінки колекції<textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={4} className={inputCls} /></label>
        <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="self-start text-body-sm text-accent-text underline">{more ? 'Сховати додаткове' : 'Додатково: для Google'}</button>
        {more && (
          <div className="flex flex-col gap-3 rounded-lg bg-bg-alt p-3">
            <label className={labelCls}>Заголовок для Google (необов'язково)<input value={f.metaTitle} onChange={(e) => setF({ ...f, metaTitle: e.target.value })} maxLength={160} className={inputCls} /></label>
            <label className={labelCls}>Опис для Google (необов'язково)<input value={f.metaDescription} onChange={(e) => setF({ ...f, metaDescription: e.target.value })} maxLength={320} className={inputCls} /></label>
          </div>
        )}
        <PrimaryButton disabled={!dirty || f.name.trim().length < 2} onClick={() => void save({ name: f.name.trim(), description: f.description.trim() || null, metaTitle: f.metaTitle.trim() || null, metaDescription: f.metaDescription.trim() || null })}>Зберегти</PrimaryButton>
      </div>
    </Sheet>
  );
}
