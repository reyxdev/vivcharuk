import { useId, useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { GhostButton, Hint, PrimaryButton, Sheet } from '@/components/ui';
import type { LibCategory } from './api';
import { inputCls, labelCls } from './parts';

// Round 22 K01–K13, K17, K18: the product's categories as a tree of folding group cards. Index 0 of
// `value` is the main category (K04, K09), at most two more are additional (K02). Only a subcategory, or
// a group without subcategories, can be picked (K03); «Від партнерів» is the product switch, never a
// category (K13). No search, no counts (K06, K07); site-menu order (K17).

export const MAX_CATEGORIES = 3;
const PARTNER = 'Від партнерів';

export interface CategoryGroup { group: LibCategory; kids: LibCategory[] }

/** Top groups with their subcategories, «Від партнерів» left out (K13). */
export function categoryTree(all: LibCategory[]): CategoryGroup[] {
  const out = new Set(all.filter((c) => c.name === PARTNER || c.key === 'partnerski-vyroby').map((c) => c.id));
  const cats = all.filter((c) => !out.has(c.id) && !(c.parentId && out.has(c.parentId)));
  return cats.filter((c) => !c.parentId).map((group) => ({ group, kids: cats.filter((c) => c.parentId === group.id) }));
}

type Props = { categories: LibCategory[]; value: string[]; onChange: (ids: string[]) => void };

export function CategoryPicker(props: Props) {
  const [sheet, setSheet] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-body-sm text-text-muted">Категорії <Hint text="Основна — за нею товар стоїть у меню сайту. Ще до двох додаткових — товар з'явиться і там." /></span>
      {/* K11: on the phone a summary here and the whole picker in a full-height sheet. */}
      <div className="flex flex-col gap-2 md:hidden">
        <Chosen {...props} />
        <GhostButton onClick={() => setSheet(true)} className="self-start">Змінити категорії</GhostButton>
      </div>
      <div className="max-md:hidden"><Picker {...props} /></div>
      {sheet && (
        <Sheet title="Категорії" wide onClose={() => setSheet(false)}>
          <div className="flex min-h-[calc(90dvh-6rem)] flex-col gap-4">
            <div className="flex-1"><Picker {...props} /></div>
            <PrimaryButton onClick={() => setSheet(false)} className="sticky bottom-0 w-full">Готово</PrimaryButton>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/** «Обрано: …» with a remove button on each (K08); ids that may no longer be picked still show, to be removed. */
function Chosen({ categories, value, onChange }: Props) {
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const allowed = useMemo(() => new Set(categoryTree(categories).flatMap(({ group, kids }) => (kids.length ? kids : [group])).map((c) => c.id)), [categories]);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-body-sm text-text-muted">Обрано:</span>
      {!value.length && <span className="text-body-sm text-text-muted">нічого</span>}
      {value.map((id, i) => {
        const name = byId.get(id)?.name ?? 'Видалена категорія';
        const ok = allowed.has(id);
        return (
          <span key={id} className={`inline-flex min-h-8 max-w-full items-center gap-1 rounded-full pl-3 pr-1 text-body-sm font-medium max-md:min-h-10 ${ok ? 'bg-accent text-white' : 'border border-dashed border-warning text-warning'}`}>
            <span className="min-w-0 break-words">{name}{i === 0 ? ' · основна' : ''}{ok ? '' : ' — не можна обрати, приберіть'}</span>
            <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} aria-label={`Прибрати «${name}»`} className={`shrink-0 rounded-full p-1 ${ok ? 'hover:bg-white/20' : 'hover:bg-bg-alt'}`}><X size={14} strokeWidth={2.5} /></button>
          </span>
        );
      })}
    </div>
  );
}

function Picker(props: Props) {
  const { categories, value, onChange } = props;
  const uid = useId();
  const tree = useMemo(() => categoryTree(categories), [categories]);
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const allowed = new Set(tree.flatMap(({ group, kids }) => (kids.length ? kids : [group])).map((c) => c.id));
  const groupOf = (id: string) => { const c = byId.get(id); return c?.parentId ?? c?.id; };
  // K05: only the groups that hold a chosen category start unfolded.
  const [open, setOpen] = useState(() => new Set(value.map(groupOf).filter((x): x is string => !!x)));
  const full = value.length >= MAX_CATEGORIES;

  // A picked main replaces the old main; one already chosen swaps places with it (never more than three).
  const setMain = (id: string) => {
    onChange(value.includes(id) ? [id, ...value.filter((x) => x !== id)] : [id, ...value.slice(1)]);
    const g = groupOf(id);
    if (g && !open.has(g)) setOpen(new Set([...open, g]));
  };
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : full ? value : [...value, id]);
  const fold = (id: string) => { const next = new Set(open); if (next.has(id)) next.delete(id); else next.add(id); setOpen(next); };

  const row = (c: LibCategory, strong = false) => {
    const main = value[0] === c.id, extra = value.indexOf(c.id) > 0, on = main || extra;
    return (
      <li key={c.id} className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 max-md:py-2.5 ${on ? 'bg-accent/20' : 'hover:bg-bg-alt'}`}>
        <input type="radio" name={uid} checked={main} onChange={() => setMain(c.id)} aria-label={`${c.name} — основна`} className="mt-0.5 size-[1.125rem] shrink-0 accent-[var(--accent)]" />
        <button type="button" disabled={!on && full} onClick={() => toggle(c.id)} className={`min-w-0 flex-1 break-words text-left text-body-sm leading-snug disabled:cursor-default disabled:opacity-60 ${on || strong ? 'font-semibold text-text-primary' : 'text-text-body'}`}>
          {c.name}{!c.isActive && <span className="font-normal text-text-muted"> · прихована</span>}
        </button>
        <input type="checkbox" checked={extra} disabled={main || (!extra && full)} onChange={() => toggle(c.id)} aria-label={`${c.name} — додаткова`} title={main ? 'Це основна' : 'Додаткова'} className="mt-0.5 size-[1.125rem] shrink-0 accent-[var(--accent)]" />
      </li>
    );
  };

  return (
    <div className="@container flex flex-col gap-3">
      <label className={labelCls}>Основна категорія
        <select value={value[0] ?? ''} onChange={(e) => e.target.value && setMain(e.target.value)} className={inputCls}>
          <option value="" disabled>— оберіть —</option>
          {value[0] && !allowed.has(value[0]) && <option value={value[0]} disabled>{byId.get(value[0])?.name ?? 'Видалена категорія'}</option>}
          {tree.map(({ group, kids }) => (kids.length
            ? <optgroup key={group.id} label={group.name}>{kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</optgroup>
            : <option key={group.id} value={group.id}>{group.name}</option>))}
        </select>
      </label>
      <Chosen {...props} />
      <p className="text-caption text-text-muted">
        Кружечок — основна, квадратик — додаткова (ще до двох)
        {full && <span className="text-text-body"> · обрано {MAX_CATEGORIES} з {MAX_CATEGORIES} — щоб додати іншу, приберіть одну</span>}
      </p>
      {/* K10: three columns on a computer. */}
      <div className="grid items-start gap-2.5 @md:grid-cols-2 @[34rem]:grid-cols-3">
        {tree.map(({ group, kids }) => {
          if (!kids.length) return <ul key={group.id} className="rounded-xl border border-border-hairline p-1.5">{row(group, true)}</ul>;
          const isOpen = open.has(group.id);
          const holds = kids.some((k) => value.includes(k.id)) || value.includes(group.id);
          return (
            <div key={group.id} className="rounded-xl border border-border-hairline">
              <button type="button" aria-expanded={isOpen} onClick={() => fold(group.id)} className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-bg-alt max-md:py-3">
                <span className="min-w-0 flex-1 break-words text-body-sm font-semibold leading-snug text-text-primary">{group.name}</span>
                {holds && !isOpen && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" title="Тут є обрана" />}
                <ChevronDown size={18} className={`mt-px shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <ul className="flex flex-col gap-0.5 px-1.5 pb-1.5">{kids.map((k) => row(k))}</ul>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
