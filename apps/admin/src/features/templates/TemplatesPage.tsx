import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Plus, Shapes, X } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { useMe } from '@/features/auth/useSession';
import { EmptyState, GhostButton, Hint, PageHeader, PrimaryButton, Sheet, SkeletonRows, useToast } from '@/components/ui';
import { type Libraries, STAGE_LABEL, TEMPLATE_LABEL, type TemplateDraft, useLibraries } from '@/features/products/api';
import { CompositionEditor, inputCls, labelCls } from '@/features/products/parts';
import { NumCell } from '@/features/products/VariantGrid';

// «Шаблони товарів» (37 §37.2, round 20 #233): a simple list; tapping a template opens its settings.
// Round 20 adds what a new product of this kind starts with: name pattern, description draft,
// composition and price per m² (#154–163).

interface Def { id: string; key: string; dataType: string; unit: string | null; name: string }
interface Tpl {
  id: string; key: string; typePrefix: string; axes: string[]; pricingUnits: string[]; requiredFields: string[]; storyStages: string[];
  defaultCategoryId: string | null; isHidden: boolean; sizeCalcOverhangCm: number | null; attributes: Array<{ id: string; isRequired: boolean }>; products: number;
  draft: TemplateDraft;
}
interface Data { stages: string[]; definitions: Def[]; items: Tpl[] }

const FIELDS: Array<[string, string]> = [['size', 'Розміри'], ['color', 'Кольори'], ['composition', 'Склад 100 %'], ['description', 'Опис'], ['packedWeight', 'Вага в упаковці']];
const AXIS: Record<string, string> = { size: 'розмір', color: 'колір', pattern: 'візерунок' };
const UNIT: Record<string, string> = { PIECE: 'штука', KILOGRAM: 'кілограм', SKEIN: 'моток', METRE: 'метр' };
const TYPE: Record<string, string> = { TEXT: 'текст', NUMBER: 'число', BOOLEAN: 'так / ні', ENUM: 'список' };
const TOKENS = '{тип} {колір} {розмір}';
const DESC_TOKENS = '{назва} {склад} {розміри} {виготовлення}';
const box = 'flex flex-col gap-3 border-t border-border-hairline pt-4 first:border-0 first:pt-0';

function Editor({ t, data, libs, canEdit, onClose, onSaved }: { t: Tpl; data: Data; libs: Libraries; canEdit: boolean; onClose: () => void; onSaved: () => Promise<unknown> }) {
  const toast = useToast();
  const photos = t.requiredFields.find((f) => f.startsWith('photos>='));
  const [f, setF] = useState({
    typePrefix: t.typePrefix, defaultCategoryId: t.defaultCategoryId ?? '', required: t.requiredFields.filter((x) => !x.startsWith('photos')),
    photos: photos ? photos.split('>=')[1]! : '', stages: t.storyStages, attrs: t.attributes, overhang: t.sizeCalcOverhangCm, isHidden: t.isHidden,
    draft: t.draft,
  });
  const [busy, setBusy] = useState(false);
  const def = (id: string) => data.definitions.find((d) => d.id === id);
  const setDraft = (next: Partial<TemplateDraft>) => setF({ ...f, draft: { ...f.draft, ...next } });
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const save = async () => {
    setBusy(true);
    try {
      await api(`/admin/templates/${t.id}`, { method: 'PATCH', body: JSON.stringify({
        typePrefix: f.typePrefix, defaultCategoryId: f.defaultCategoryId || null, isHidden: f.isHidden,
        requiredFields: [...new Set(['name', 'price', ...f.required])].concat(f.photos ? [`photos>=${f.photos}`] : []), storyStages: f.stages, attributes: f.attrs,
        sizeCalcOverhangCm: f.overhang, draft: f.draft,
      }) });
      await onSaved(); toast('Збережено'); onClose();
    } catch (x) { toast(x instanceof ApiError ? messageFor(x.code) : messageFor(''), 'error'); } finally { setBusy(false); }
  };

  return (
    <Sheet title={TEMPLATE_LABEL[t.key] ?? t.key} wide onClose={onClose}>
      <fieldset disabled={!canEdit} className="flex flex-col gap-4">
        <section className={box}>
          <h3 className="text-h4 font-semibold text-text-primary">Новий товар починається з</h3>
          <label className={labelCls}>Назва
            <input value={f.draft.namePattern} onChange={(e) => setDraft({ namePattern: e.target.value })} className={inputCls} />
            <span className="text-caption">Слова в дужках підставляються самі: {TOKENS}. Колір і розмір — коли обрано один.</span>
          </label>
          <label className={labelCls}>Заготовка опису
            <textarea value={f.draft.description} onChange={(e) => setDraft({ description: e.target.value })} rows={8} className={inputCls} />
            <span className="text-caption">Підставляються: {DESC_TOKENS}. «Виготовлення» — етапи «Історії виробу» нижче.</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-body-sm text-text-muted">Склад</span>
            <CompositionEditor value={f.draft.composition} onChange={(composition) => setDraft({ composition })} libs={libs} disabled={!canEdit} />
          </div>
          {t.axes.includes('size') && (
            <label className={`${labelCls} max-w-48`}>Ціна за м², ₴ <span className="text-caption">для підказки цін за розміром</span>
              <NumCell money value={f.draft.ratePerSqmMinor} onValue={(v) => setDraft({ ratePerSqmMinor: v || null })} className="w-full !py-2 !text-body" />
            </label>
          )}
        </section>

        <section className={box}>
          <h3 className="text-h4 font-semibold text-text-primary">Основне</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelCls}>Слово на початку назви<input value={f.typePrefix} onChange={(e) => setF({ ...f, typePrefix: e.target.value })} placeholder="Ліжник" className={inputCls} /></label>
            <label className={labelCls}>Категорія
              <select value={f.defaultCategoryId} onChange={(e) => setF({ ...f, defaultCategoryId: e.target.value })} className={inputCls}>
                <option value="">—</option>
                {libs.categories.map((c) => <option key={c.id} value={c.id}>{c.parentId ? '— ' : ''}{c.name}</option>)}
              </select>
            </label>
            {t.key === 'lizhnyk' && <label className={labelCls}>Звис для калькулятора розміру, см<NumCell value={f.overhang} onValue={(v) => setF({ ...f, overhang: v })} className="w-full !py-2 !text-body" /></label>}
          </div>
          <p className="text-caption text-text-muted">Вибір: {t.axes.map((a) => AXIS[a] ?? a).join(' × ') || 'без розмірів і кольорів'} · продається: {t.pricingUnits.map((u) => UNIT[u] ?? u).join(', ')}</p>
          <label className="flex items-center gap-2 text-body-sm text-text-primary"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={f.isHidden} onChange={(e) => setF({ ...f, isHidden: e.target.checked })} />Прихований — не пропонувати для нових товарів</label>
        </section>

        <section className={box}>
          <h3 className="flex items-center gap-1.5 text-h4 font-semibold text-text-primary">Нагадувати, якщо бракує <Hint text="Опублікувати не дають лише фото, назва, ціна, категорія й позначені тут розміри; решта — нагадування." /></h3>
          <div className="flex flex-wrap gap-2">
            {FIELDS.filter(([k]) => k !== 'size' || t.axes.includes('size')).filter(([k]) => k !== 'color' || t.axes.includes('color')).map(([k, label]) => {
              const on = f.required.includes(k);
              return <button key={k} type="button" aria-pressed={on} onClick={() => setF({ ...f, required: toggle(f.required, k) })} className={`min-h-9 rounded-full border px-3 text-body-sm ${on ? 'border-accent bg-accent/10 font-medium' : 'border-border-control text-text-body'}`}>{label}</button>;
            })}
            <label className="flex items-center gap-1.5 text-body-sm text-text-body">Фото, бажано<NumCell value={f.photos ? Number(f.photos) : null} onValue={(v) => setF({ ...f, photos: v ? String(Math.min(9, v)) : '' })} className="w-14" /></label>
          </div>
        </section>

        <section className={box}>
          <h3 className="text-h4 font-semibold text-text-primary">«Історія виробу»</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {data.stages.map((s) => <label key={s} className="flex items-center gap-2 text-body-sm"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={f.stages.includes(s)} onChange={() => setF({ ...f, stages: data.stages.filter((x) => (x === s ? !f.stages.includes(s) : f.stages.includes(x))) })} />{STAGE_LABEL[s] ?? s}</label>)}
          </div>
        </section>

        <section className={box}>
          <h3 className="text-h4 font-semibold text-text-primary">Характеристики</h3>
          <ul className="flex flex-col gap-1">
            {f.attrs.map((a, i) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 text-body-sm">
                <span className="min-w-40 flex-1 text-text-primary">{def(a.id)?.name}{def(a.id)?.unit ? `, ${def(a.id)!.unit}` : ''} <span className="text-caption text-text-muted">{TYPE[def(a.id)?.dataType ?? ''] ?? ''}</span></span>
                <label className="flex items-center gap-1.5"><input type="checkbox" className="size-4 accent-[var(--accent)]" checked={a.isRequired} onChange={(e) => setF({ ...f, attrs: f.attrs.map((x, n) => (n === i ? { ...x, isRequired: e.target.checked } : x)) })} />нагадувати</label>
                <button type="button" onClick={() => setF({ ...f, attrs: f.attrs.filter((_, n) => n !== i) })} className="rounded-full p-1.5 text-text-muted hover:bg-bg-alt" aria-label="Прибрати"><X size={15} /></button>
              </li>
            ))}
          </ul>
          <select aria-label="Додати характеристику" value="" onChange={(e) => e.target.value && setF({ ...f, attrs: [...f.attrs, { id: e.target.value, isRequired: false }] })} className={`${inputCls} max-w-sm`}>
            <option value="">+ додати характеристику…</option>
            {data.definitions.filter((d) => !f.attrs.some((a) => a.id === d.id)).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </section>
      </fieldset>
      {canEdit && (
        <div className="sticky bottom-0 -mx-5 mt-4 flex justify-end gap-2 border-t border-border-hairline bg-bg-surface px-5 pt-3">
          <GhostButton onClick={onClose}>Скасувати</GhostButton>
          <PrimaryButton disabled={busy} onClick={() => void save()}>Зберегти</PrimaryButton>
        </div>
      )}
    </Sheet>
  );
}

function NewAttribute({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<unknown> }) {
  const toast = useToast();
  const [f, setF] = useState({ name: '', dataType: 'TEXT', unit: '', options: '' });
  const add = async () => {
    try {
      await post('/admin/attributes', { name: f.name.trim(), dataType: f.dataType, unit: f.unit || null, ...(f.dataType === 'ENUM' ? { options: f.options.split(',').map((x) => x.trim()).filter(Boolean) } : {}) });
      await onDone(); toast('Додано'); onClose();
    } catch (x) { toast(x instanceof ApiError && x.body?.error.message === 'ALREADY_EXISTS' ? 'Така характеристика вже є' : messageFor(x instanceof ApiError ? x.code : ''), 'error'); }
  };
  return (
    <Sheet title="Нова характеристика" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Назва<input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Висота ворсу" className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelCls}>Значення<select value={f.dataType} onChange={(e) => setF({ ...f, dataType: e.target.value })} className={inputCls}>{Object.entries(TYPE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className={labelCls}>Одиниця<input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} placeholder="см, г…" className={inputCls} /></label>
        </div>
        {f.dataType === 'ENUM' && <label className={labelCls}>Варіанти через кому<input value={f.options} onChange={(e) => setF({ ...f, options: e.target.value })} className={inputCls} /></label>}
        <p className="text-caption text-text-muted">Потім її можна додати в будь-який шаблон.</p>
        <div className="flex justify-end"><PrimaryButton disabled={f.name.trim().length < 2} onClick={() => void add()}>Додати</PrimaryButton></div>
      </div>
    </Sheet>
  );
}

export function TemplatesPage() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const canEdit = !!me?.permissions.includes('templates.manage');
  const { data } = useQuery({ queryKey: ['admin-templates'], queryFn: () => api<Data>('/admin/templates') });
  const { data: libs } = useLibraries();
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['admin-templates'] }), qc.invalidateQueries({ queryKey: ['product-templates'] })]);
  const t = data?.items.find((x) => x.id === open);

  return (
    <div className="flex flex-col gap-3">
      <PageHeader title="Шаблони товарів" sub="З чого починається новий товар кожного виду" actions={canEdit && <GhostButton icon={Plus} onClick={() => setAdding(true)}>Характеристика</GhostButton>} />
      {!data || !libs ? <SkeletonRows /> : !data.items.length ? <EmptyState icon={Shapes} text="Шаблонів ще немає." /> : (
        <ul className="flex flex-col divide-y divide-border-hairline overflow-hidden rounded-xl border border-border-hairline bg-bg-surface">
          {data.items.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => setOpen(x.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-bg-page ${x.isHidden ? 'opacity-60' : ''}`}>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body font-medium text-text-primary">{TEMPLATE_LABEL[x.key] ?? x.key}</span>
                  <span className="truncate text-caption text-text-muted">{x.axes.map((a) => AXIS[a] ?? a).join(' × ') || 'без розмірів і кольорів'}{x.isHidden ? ' · прихований' : ''}</span>
                </span>
                <span className="tabular text-body-sm text-text-muted">{x.products} тов.</span>
                <ChevronRight size={18} className="text-text-faint" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {t && data && libs && <Editor key={t.id} t={t} data={data} libs={libs} canEdit={canEdit} onClose={() => setOpen(null)} onSaved={refresh} />}
      {adding && <NewAttribute onClose={() => setAdding(false)} onDone={refresh} />}
    </div>
  );
}
