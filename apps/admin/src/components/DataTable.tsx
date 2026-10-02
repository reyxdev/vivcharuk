import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, X, type LucideIcon } from 'lucide-react';
import { DotsMenu, SkeletonRows } from './ui';

// Round 20 #27–28, #71–72, #145–149, #221, #258–261: a plain compact table on a computer, each row a
// small card on the phone; sort by header; load more on scroll; «⋯» per row; tick several (long press
// on the phone) with a bar at the bottom; fixed columns.

export interface Column<T> {
  key: string; header: string; cell: (row: T) => ReactNode; align?: 'right'; sortKey?: string; className?: string;
}
export interface RowAction { label: string; icon?: LucideIcon; onClick: () => void; danger?: boolean; hidden?: boolean }
export interface BulkAction { label: string; icon?: LucideIcon; onClick: (ids: string[]) => void; danger?: boolean }

export function DataTable<T extends { id: string }>({
  rows, columns, card, onRowClick, actions, sort, onSort, loading, hasMore, onLoadMore, empty, selected, onSelect, bulk, rowClass,
}: {
  rows: T[] | undefined; columns: Array<Column<T>>; card: (row: T) => ReactNode; onRowClick?: (row: T) => void;
  actions?: (row: T) => RowAction[]; sort?: { key: string; dir: 'asc' | 'desc' }; onSort?: (s: { key: string; dir: 'asc' | 'desc' }) => void;
  loading?: boolean; hasMore?: boolean; onLoadMore?: () => void; empty?: ReactNode;
  selected?: Set<string>; onSelect?: (s: Set<string>) => void; bulk?: BulkAction[]; rowClass?: (row: T) => string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const press = useRef<number>(undefined);
  useEffect(() => {
    if (!hasMore || !onLoadMore || !sentinel.current) return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && onLoadMore(), { rootMargin: '400px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasMore, onLoadMore, rows?.length]);

  if (!rows) return <SkeletonRows />;
  if (!rows.length && !loading) return <>{empty}</>;
  const selecting = !!selected && selected.size > 0;
  const toggle = (id: string) => { if (!selected || !onSelect) return; const n = new Set(selected); if (n.has(id)) n.delete(id); else n.add(id); onSelect(n); };
  const allOn = !!selected && rows.length > 0 && rows.every((r) => selected.has(r.id));
  const click = (r: T) => (selecting ? toggle(r.id) : onRowClick?.(r));

  return (
    <div className="flex flex-col">
      {/* computer: table */}
      <div className="overflow-hidden rounded-xl border border-border-hairline bg-bg-surface max-md:hidden">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-border-hairline text-left text-caption text-text-muted">
              {onSelect && <th className="w-10 px-3 py-2"><input type="checkbox" aria-label="Обрати всі" checked={allOn} onChange={() => onSelect(allOn ? new Set() : new Set(rows.map((r) => r.id)))} className="size-4 accent-[var(--accent)]" /></th>}
              {columns.map((c) => (
                <th key={c.key} className={`px-3 py-2 font-medium ${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''}`}>
                  {c.sortKey && onSort ? (
                    <button type="button" onClick={() => onSort({ key: c.sortKey!, dir: sort?.key === c.sortKey && sort?.dir === 'desc' ? 'asc' : 'desc' })} className="inline-flex items-center gap-1 hover:text-text-primary">
                      {c.header}{sort && sort.key === c.sortKey && (sort.dir === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />)}
                    </button>
                  ) : c.header}
                </th>
              ))}
              {actions && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => click(r)} className={`border-b border-border-hairline last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-bg-page' : ''} ${selected?.has(r.id) ? 'bg-accent/5' : ''} ${rowClass?.(r) ?? ''}`}>
                {onSelect && <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label="Обрати" checked={selected!.has(r.id)} onChange={() => toggle(r.id)} className="size-4 accent-[var(--accent)]" /></td>}
                {columns.map((c) => <td key={c.key} className={`px-3 py-1.5 align-middle ${c.align === 'right' ? 'tabular text-right' : ''} ${c.className ?? ''}`}>{c.cell(r)}</td>)}
                {actions && <td className="px-1 py-1.5"><DotsMenu items={actions(r)} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* phone: cards; long press selects */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((r) => (
          <li key={r.id}
            onTouchStart={() => { if (onSelect) press.current = window.setTimeout(() => { toggle(r.id); navigator.vibrate?.(20); press.current = -1; }, 500); }}
            onTouchEnd={() => window.clearTimeout(press.current)} onTouchMove={() => window.clearTimeout(press.current)}
            onClick={() => { if (press.current === -1) { press.current = undefined; return; } click(r); }}
            className={`relative rounded-xl border bg-bg-surface p-3 active:bg-bg-alt ${selected?.has(r.id) ? 'border-accent ring-1 ring-accent' : 'border-border-hairline'} ${rowClass?.(r) ?? ''}`}>
            {card(r)}
            {actions && !selecting && <div className="absolute right-1 top-1"><DotsMenu items={actions(r)} /></div>}
          </li>
        ))}
      </ul>
      {loading && <div className="mt-2"><SkeletonRows rows={2} /></div>}
      <div ref={sentinel} />
      {selecting && bulk && (
        <div className="vk-sheet fixed inset-x-0 bottom-16 z-40 mx-auto flex w-fit max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto rounded-2xl bg-bg-inverted p-1.5 text-text-on-inverted shadow-2xl md:bottom-6">
          <span className="tabular px-3 text-body-sm font-semibold">Обрано {selected!.size}</span>
          {bulk.map((b) => (
            <button key={b.label} type="button" onClick={() => b.onClick([...selected!])} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-body-sm hover:bg-white/10 ${b.danger ? 'text-red-300' : ''}`}>
              {b.icon && <b.icon size={16} />}{b.label}
            </button>
          ))}
          <button type="button" onClick={() => onSelect!(new Set())} aria-label="Скасувати вибір" className="rounded-xl p-2 hover:bg-white/10"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
