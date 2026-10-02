import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

// Round 20 #49, #62–66, #207, #269: one «Фільтри · N» button. It opens a list of filter groups; a group
// opens its own list; nothing applies until «Показати». Chosen filters show as chips with ✕ under the
// search, with «Скинути». On the phone the same thing fills the screen.

export type FilterGroup =
  | { key: string; label: string; kind: 'options'; options: Array<{ value: string; label: string }>; single?: boolean }
  | { key: string; label: string; kind: 'date' }
  | { key: string; label: string; kind: 'range'; unit?: string }
  | { key: string; label: string; kind: 'toggle' };

export type FilterValue = string[] | { from?: string; to?: string } | boolean;
export type FilterState = Record<string, FilterValue | undefined>;

const PRESETS: Array<[string, () => { from: string; to: string }]> = [
  ['Сьогодні', () => ({ from: day(0), to: day(0) })],
  ['Вчора', () => ({ from: day(-1), to: day(-1) })],
  ['7 днів', () => ({ from: day(-6), to: day(0) })],
  ['Цей місяць', () => { const d = new Date(); return { from: iso(new Date(d.getFullYear(), d.getMonth(), 1)), to: day(0) }; }],
  ['Минулий місяць', () => { const d = new Date(); return { from: iso(new Date(d.getFullYear(), d.getMonth() - 1, 1)), to: iso(new Date(d.getFullYear(), d.getMonth(), 0)) }; }],
];
function iso(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function day(offset: number) { const d = new Date(); d.setDate(d.getDate() + offset); return iso(d); }
const fmtDate = (s?: string) => (s ? new Date(`${s}T12:00:00`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : '…');

const isActive = (v: FilterValue | undefined) => v !== undefined && v !== false && !(Array.isArray(v) && !v.length) && !(typeof v === 'object' && !Array.isArray(v) && !v.from && !v.to);
export const activeCount = (s: FilterState) => Object.values(s).filter(isActive).length;

function chipText(g: FilterGroup, v: FilterValue) {
  if (g.kind === 'toggle') return g.label;
  if (g.kind === 'options') return `${g.label}: ${(v as string[]).map((x) => g.options.find((o) => o.value === x)?.label ?? x).join(', ')}`;
  const r = v as { from?: string; to?: string };
  if (g.kind === 'date') { const p = PRESETS.find(([, f]) => { const x = f(); return x.from === r.from && x.to === r.to; }); return `${g.label}: ${p ? p[0] : `${fmtDate(r.from)} – ${fmtDate(r.to)}`}`; }
  return `${g.label}: ${r.from ?? '…'} – ${r.to ?? '…'}${g.unit ? ` ${g.unit}` : ''}`;
}

export function FilterButton({ groups, value, onApply, resultCount }: { groups: FilterGroup[]; value: FilterState; onApply: (s: FilterState) => void; resultCount?: number }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(value);
  const [group, setGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const n = activeCount(value);

  useEffect(() => { if (open) { setDraft(value); setGroup(null); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => window.innerWidth >= 768 && !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);

  const g = groups.find((x) => x.key === group);
  const set = (k: string, v: FilterValue | undefined) => setDraft((d) => ({ ...d, [k]: v }));
  const apply = () => { onApply(Object.fromEntries(Object.entries(draft).filter(([, v]) => isActive(v)))); setOpen(false); };
  const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body-sm max-md:py-3';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-body-sm font-medium max-md:min-h-11 ${n ? 'border-accent bg-accent/10 text-text-primary' : 'border-border-control bg-bg-surface text-text-primary hover:bg-bg-alt'}`}>
        <SlidersHorizontal size={17} strokeWidth={1.75} /> Фільтри{n ? <span className="tabular rounded-full bg-accent px-1.5 text-caption font-semibold text-white">{n}</span> : null}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg-surface md:absolute md:inset-auto md:right-0 md:top-full md:mt-1 md:max-h-[70vh] md:w-80 md:rounded-xl md:border md:border-border-hairline md:shadow-xl">
          <div className="flex items-center gap-2 border-b border-border-hairline px-3 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] md:pt-2.5">
            {g ? <button type="button" onClick={() => setGroup(null)} aria-label="Назад до груп" className="rounded-full p-1.5 hover:bg-bg-alt"><ChevronLeft size={20} /></button> : null}
            <span className="flex-1 text-body font-semibold text-text-primary">{g ? g.label : 'Фільтри'}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрити" className="rounded-full p-1.5 hover:bg-bg-alt md:hidden"><X size={20} /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {!g && groups.map((x) => (
              <button key={x.key} type="button" onClick={() => setGroup(x.key)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-body-sm hover:bg-bg-alt max-md:py-3.5 max-md:text-body">
                <span className="flex-1 text-text-primary">{x.label}</span>
                {isActive(draft[x.key]) && <span className="max-w-32 truncate text-caption text-accent-text">{chipText(x, draft[x.key]!).replace(`${x.label}: `, '').replace(x.label, 'так')}</span>}
                <ChevronRight size={16} className="text-text-faint" />
              </button>
            ))}
            {g?.kind === 'options' && g.options.map((o) => {
              const cur = (draft[g.key] as string[] | undefined) ?? [];
              const on = cur.includes(o.value);
              return (
                <label key={o.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm hover:bg-bg-alt max-md:py-3.5 max-md:text-body">
                  <input type={g.single ? 'radio' : 'checkbox'} name={g.key} checked={on} className="size-4 accent-[var(--accent)] max-md:size-5"
                    onChange={() => set(g.key, g.single ? [o.value] : on ? cur.filter((x) => x !== o.value) : [...cur, o.value])} />
                  {o.label}
                </label>
              );
            })}
            {g?.kind === 'toggle' && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-body hover:bg-bg-alt">
                <input type="checkbox" checked={!!draft[g.key]} onChange={(e) => set(g.key, e.target.checked)} className="size-5 accent-[var(--accent)]" /> Лише такі
              </label>
            )}
            {g?.kind === 'date' && (
              <div className="flex flex-col gap-1">
                {PRESETS.map(([label, f]) => {
                  const r = f(); const cur = draft[g.key] as { from?: string; to?: string } | undefined;
                  const on = cur?.from === r.from && cur?.to === r.to;
                  return <button key={label} type="button" onClick={() => set(g.key, r)} aria-pressed={on} className={`rounded-lg px-3 py-2.5 text-left text-body-sm max-md:py-3.5 max-md:text-body ${on ? 'bg-accent/10 font-semibold text-text-primary' : 'hover:bg-bg-alt'}`}>{label}</button>;
                })}
                <p className="px-3 pt-2 text-caption text-text-muted">Свої дати</p>
                <div className="grid grid-cols-2 gap-2 px-3">
                  <input type="date" aria-label="Від" className={input} value={(draft[g.key] as { from?: string })?.from ?? ''} onChange={(e) => set(g.key, { ...(draft[g.key] as object), from: e.target.value || undefined })} />
                  <input type="date" aria-label="До" className={input} value={(draft[g.key] as { to?: string })?.to ?? ''} onChange={(e) => set(g.key, { ...(draft[g.key] as object), to: e.target.value || undefined })} />
                </div>
              </div>
            )}
            {g?.kind === 'range' && (
              <div className="grid grid-cols-2 gap-2 p-3">
                <input inputMode="numeric" placeholder="Від" aria-label="Від" className={input} value={(draft[g.key] as { from?: string })?.from ?? ''} onChange={(e) => set(g.key, { ...(draft[g.key] as object), from: e.target.value.replace(/\D/g, '') || undefined })} />
                <input inputMode="numeric" placeholder="До" aria-label="До" className={input} value={(draft[g.key] as { to?: string })?.to ?? ''} onChange={(e) => set(g.key, { ...(draft[g.key] as object), to: e.target.value.replace(/\D/g, '') || undefined })} />
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t border-border-hairline p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3">
            <button type="button" onClick={() => setDraft({})} className="min-h-11 rounded-lg px-3 text-body-sm text-text-muted hover:bg-bg-alt">Скинути все</button>
            <button type="button" onClick={apply} className="min-h-11 flex-1 rounded-lg bg-accent px-4 text-body-sm font-semibold text-white">Показати{resultCount !== undefined ? ` ${resultCount}` : ''}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterChips({ groups, value, onChange }: { groups: FilterGroup[]; value: FilterState; onChange: (s: FilterState) => void }) {
  const active = groups.filter((g) => isActive(value[g.key]));
  if (!active.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active.map((g) => (
        <span key={g.key} className="inline-flex items-center gap-1 rounded-full bg-bg-alt py-1 pl-3 pr-1 text-caption text-text-primary">
          {chipText(g, value[g.key]!)}
          <button type="button" onClick={() => { const n = { ...value }; delete n[g.key]; onChange(n); }} aria-label={`Прибрати фільтр ${g.label}`} className="rounded-full p-0.5 hover:bg-bg-raised"><X size={14} /></button>
        </span>
      ))}
      <button type="button" onClick={() => onChange({})} className="px-2 text-caption text-accent-text underline">Скинути</button>
    </div>
  );
}

/** Filters → query string parameters (arrays comma-joined, ranges as key_from/key_to, toggles as 1). */
export function filtersToQuery(s: FilterState) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(s)) {
    if (!isActive(v)) continue;
    if (Array.isArray(v)) q.set(k, v.join(','));
    else if (typeof v === 'boolean') q.set(k, '1');
    else { if (v!.from) q.set(`${k}_from`, v!.from); if (v!.to) q.set(`${k}_to`, v!.to); }
  }
  return q;
}
