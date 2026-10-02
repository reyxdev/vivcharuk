import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Plus, X } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { uah } from '@/lib/format';
import { useConfirm, useToast } from '@/components/ui';
import { openPriceTags } from '@/features/print/PriceTags';
import { type Libraries, type LibValue, type Photo, type ProductDoc, type Readiness, SITE_URL, type Template, useRefreshProducts } from './api';
import { ROLE_LABEL, int } from './model';

export const inputCls = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary disabled:opacity-60 max-md:py-2.5';
export const labelCls = 'flex flex-col gap-1.5 text-body-sm text-text-muted';

/** Colour circles (round 20 #159) or ticks for sizes and patterns (#158). */
export function ValuePicker({ values, picked, onToggle, round = false, disabled = false }: { values: LibValue[]; picked: string[]; onToggle: (id: string) => void; round?: boolean; disabled?: boolean }) {
  const shown = values.filter((v) => !v.isHidden || picked.includes(v.id));
  if (round) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {shown.map((v) => {
          const on = picked.includes(v.id);
          return (
            <button key={v.id} type="button" disabled={disabled} aria-pressed={on} onClick={() => onToggle(v.id)} className="flex w-16 flex-col items-center gap-1 text-caption text-text-body">
              <span className={`relative grid size-10 place-items-center rounded-full border ${on ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-bg-surface' : 'border-border-control'}`} style={{ background: v.hex ?? 'var(--bg-alt)' }}>
                {on && <Check size={18} strokeWidth={3} className="rounded-full bg-black/35 p-0.5 text-white" />}
              </span>
              <span className="line-clamp-2 text-center leading-tight">{v.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {shown.map((v) => {
        const on = picked.includes(v.id);
        return (
          <button key={v.id} type="button" disabled={disabled} aria-pressed={on} onClick={() => onToggle(v.id)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-body-sm max-md:min-h-11 ${on ? 'border-accent bg-accent/10 font-medium text-text-primary' : 'border-border-control text-text-body'}`}>
            {on && <Check size={15} strokeWidth={2.5} className="text-accent-text" />}{v.label}
          </button>
        );
      })}
    </div>
  );
}

/** «Додати інший розмір» / «Новий колір»: straight into the shared library (libraries.manage). */
export function AddValue({ kind, templateKey, onAdded }: { kind: 'size' | 'color' | 'pattern'; templateKey?: string; onAdded: (id: string) => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [hex, setHex] = useState('#C8B89A');
  const add = async () => {
    const m = /(\d{2,3})\s*[×xх*]\s*(\d{2,3})/i.exec(label);
    try {
      const r = await post<{ id: string }>('/admin/libraries/values', {
        type: kind, templateKey, label: label.trim(), ...(kind === 'color' ? { hex: hex.toUpperCase() } : {}),
        ...(kind === 'size' && m ? { dimensions: { widthCm: Number(m[1]), lengthCm: Number(m[2]) } } : {}),
      });
      await Promise.all([qc.invalidateQueries({ queryKey: ['product-libraries'] }), qc.invalidateQueries({ queryKey: ['libraries'] })]);
      onAdded(r.id); setLabel(''); setOpen(false);
    } catch (e) { toast(e instanceof ApiError && e.body?.error.message === 'ALREADY_EXISTS' ? 'Таке вже є в списку' : messageFor(e instanceof ApiError ? e.code : ''), 'error'); }
  };
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center gap-1 self-start rounded-full border border-dashed border-border-control px-3 text-body-sm text-text-body hover:bg-bg-alt max-md:min-h-11">
        <Plus size={15} />{kind === 'size' ? 'Додати інший розмір' : kind === 'color' ? 'Новий колір' : 'Новий візерунок'}
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {kind === 'color' && <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} aria-label="Колір" className="size-10 rounded-full border border-border-control bg-transparent" />}
      <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && label.trim()) { e.preventDefault(); void add(); } }}
        placeholder={kind === 'size' ? '160×210 см' : kind === 'color' ? 'Назва кольору' : 'Назва візерунка'} className={`${inputCls} w-44`} />
      <button type="button" disabled={!label.trim()} onClick={() => void add()} className="min-h-10 rounded-lg bg-accent px-3 text-body-sm font-semibold text-white disabled:opacity-50">Додати</button>
      <button type="button" onClick={() => setOpen(false)} aria-label="Скасувати" className="rounded-full p-2 text-text-muted hover:bg-bg-alt"><X size={16} /></button>
    </div>
  );
}

/** Composition as percentages per part; each part must total 100 % (round 12 M2). */
export function CompositionEditor({ value, onChange, libs, disabled = false }: { value: ProductDoc['composition']; onChange: (v: ProductDoc['composition']) => void; libs: Libraries; disabled?: boolean }) {
  const sums = new Map<string, number>();
  for (const c of value) sums.set(c.role, (sums.get(c.role) ?? 0) + c.percent);
  const set = (i: number, next: Partial<ProductDoc['composition'][number]>) => onChange(value.map((x, n) => (n === i ? { ...x, ...next } : x)));
  const sel = 'min-w-0 rounded-md border border-border-control bg-bg-input px-2 py-2 text-body-sm text-text-primary';
  return (
    <div className="flex flex-col gap-2">
      {value.map((c, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:grid-cols-[1fr_10rem_5rem_auto]">
          <select disabled={disabled} value={c.materialId} onChange={(e) => set(i, { materialId: e.target.value })} className={sel} aria-label="Матеріал">
            {libs.materials.filter((m) => !m.isHidden || m.id === c.materialId).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select disabled={disabled} value={c.role} onChange={(e) => set(i, { role: e.target.value })} className={`${sel} max-sm:col-span-3 max-sm:row-start-2`} aria-label="Частина">
            {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <span className="flex items-center gap-1 text-body-sm"><input disabled={disabled} inputMode="numeric" value={c.percent} onChange={(e) => set(i, { percent: Math.min(100, Math.max(1, int(e.target.value) ?? 1)) })} className={`${sel} w-16`} aria-label="Відсоток" />%</span>
          <button type="button" disabled={disabled} onClick={() => onChange(value.filter((_, n) => n !== i))} className="rounded-full p-2 text-text-muted hover:bg-bg-alt" aria-label="Прибрати матеріал"><X size={16} /></button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        {!disabled && libs.materials.length > 0 && (
          <button type="button" onClick={() => onChange([...value, { materialId: libs.materials.find((m) => !m.isHidden)?.id ?? libs.materials[0]!.id, role: 'main', percent: value.length ? Math.max(1, 100 - (sums.get('main') ?? 0)) : 100 }])}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border-control px-3 py-1.5 text-body-sm text-text-body hover:bg-bg-alt"><Plus size={15} />Матеріал</button>
        )}
        {[...sums.entries()].map(([role, sum]) => <span key={role} className={`text-caption ${sum === 100 ? 'text-accent-text' : 'text-danger'}`}>{ROLE_LABEL[role] ?? role}: {sum} %{sum === 100 ? ' ✓' : ' — має бути 100 %'}</span>)}
      </div>
    </div>
  );
}

/** What is still missing; only the round 20 #126 items stop publishing, the rest is advice. */
export function ReadinessLine({ r }: { r: Readiness }) {
  const missing = r.items.filter((i) => !i.ok);
  if (!missing.length) return <p className="text-body-sm text-accent-text">Усе готово до публікації</p>;
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      <li className="text-caption text-text-muted">Бракує:</li>
      {missing.map((i) => <li key={i.key} className={`rounded-full px-2 py-0.5 text-caption ${i.blocking ? 'bg-danger/10 text-danger' : 'bg-bg-alt text-text-muted'}`}>{i.label}</li>)}
    </ul>
  );
}

/** «Як це виглядатиме на сайті» (round 20 #164, #131), drawn from the draft. */
export function ProductPreview({ doc, photos, libs, t }: { doc: ProductDoc; photos: Photo[]; libs: Libraries; t: Template }) {
  const [main, setMain] = useState(0);
  const all = new Map([...libs.colors, ...libs.patterns, ...(libs.sizes[t.key] ?? [])].map((v) => [v.id, v]));
  const active = doc.variants.filter((v) => v.isActive);
  const prices = active.map((v) => v.priceMinor).filter((x) => x > 0);
  const ids = (axis: LibValue[]) => { const set = new Set(axis.map((v) => v.id)); return [...new Set(active.flatMap((v) => v.optionValueIds.filter((o) => set.has(o))))].map((id) => all.get(id)!); };
  const sizes = ids(libs.sizes[t.key] ?? []);
  const colors = ids(libs.colors);
  const material = (id: string) => libs.materials.find((m) => m.id === id)?.name ?? '';
  const photo = photos[main] ?? photos[0];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-bg-alt">
          {photo?.large ? <img src={photo.large} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-body-sm text-text-muted">Без фото</div>}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {photos.map((p, i) => <button key={p.id} type="button" onClick={() => setMain(i)} className={`size-14 shrink-0 overflow-hidden rounded-md border ${i === main ? 'border-accent' : 'border-border-hairline'}`}>{p.thumb && <img src={p.thumb} alt="" className="size-full object-cover" />}</button>)}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {doc.origin === 'PARTNER_MANUFACTURE' && <span className="self-start rounded-full bg-bg-alt px-2 py-0.5 text-caption text-text-muted">Від партнерів</span>}
        <h2 className="text-h2 font-semibold text-text-primary">{doc.name || 'Без назви'}</h2>
        <p className="text-h3 font-semibold text-text-primary">{prices.length ? (Math.min(...prices) === Math.max(...prices) ? uah(prices[0]!) : `від ${uah(Math.min(...prices))}`) : 'Ціну не вказано'}</p>
        {sizes.length > 0 && <div className="flex flex-wrap gap-1.5">{sizes.map((s) => <span key={s.id} className="rounded-md border border-border-control px-2.5 py-1 text-body-sm">{s.label}</span>)}</div>}
        {colors.length > 0 && <div className="flex flex-wrap gap-2">{colors.map((c) => <span key={c.id} title={c.label} className="size-7 rounded-full border border-border-control" style={{ background: c.hex ?? 'var(--bg-alt)' }} />)}</div>}
        {active.some((v) => v.madeToOrderDays) && <p className="text-body-sm text-text-body">Виготовимо під замовлення за {Math.max(...active.map((v) => v.madeToOrderDays ?? 0))} днів</p>}
        {doc.description && <div className="flex flex-col gap-2 text-body text-text-body">{doc.description.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>}
        {doc.composition.length > 0 && <p className="text-body-sm text-text-muted">Склад: {doc.composition.map((c) => `${material(c.materialId)} ${c.percent} %`).join(', ')}</p>}
      </div>
    </div>
  );
}

/** The row and page «⋯» actions (round 20 #130–131): similar, on the site, price tag, hide/show, delete. */
export function useProductActions() {
  const nav = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const refresh = useRefreshProducts();
  const fail = (e: unknown) => toast(e instanceof ApiError && e.body?.error.message === 'HAS_ORDERS' ? 'Товар уже замовляли — його можна лише сховати' : messageFor(e instanceof ApiError ? e.code : ''), 'error');
  return {
    similar: async (id: string) => {
      try { const r = await post<{ id: string }>(`/admin/products/${id}/duplicate`); await refresh(); toast('Створено схожий товар'); nav(`/products/${r.id}`); } catch (e) { fail(e); }
    },
    /** Published: the page on the site; a draft: the preview inside the panel. */
    view: (p: { id: string; slug: string | null; status: string }) => {
      if (p.slug && p.status === 'ACTIVE') window.open(`${SITE_URL}/uk/tovar/${p.slug}`, '_blank', 'noopener');
      else nav(`/products/${p.id}?preview=1`);
    },
    priceTag: (id: string) => openPriceTags([id]),
    setHidden: async (id: string, hidden: boolean) => {
      if (hidden && !(await confirm({ title: 'Сховати товар із сайту?', text: 'Його не буде видно покупцям. Повернути можна будь-коли.', ok: 'Сховати', danger: true }))) return false;
      try { await post(`/admin/products/${id}/archive`, { archived: hidden }); await refresh(id); toast(hidden ? 'Товар сховано' : 'Товар знову на сайті'); return true; } catch (e) { fail(e); return false; }
    },
    remove: async (id: string, name: string) => {
      if (!(await confirm({ title: 'Видалити товар?', text: `«${name || 'Без назви'}» зникне з панелі й сайту. Це не можна скасувати.`, ok: 'Видалити', danger: true }))) return false;
      try { await api(`/admin/products/${id}`, { method: 'DELETE' }); await refresh(); toast('Товар видалено'); return true; } catch (e) { fail(e); return false; }
    },
  };
}
