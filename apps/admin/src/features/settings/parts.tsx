import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { messageFor } from '@/lib/messages';

// Small pieces shared by the «Ще» screens (settings, promotions, categories, collections, banners).

export const inputCls = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 max-md:py-2.5';
export const labelCls = 'flex flex-col gap-1 text-body-sm text-text-muted';

/** An on/off switch with its label (#25: changes apply at once only where the screen says so). */
export function Switch({ on, onChange, label, disabled, hideLabel }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean; hideLabel?: boolean }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-body-sm text-text-primary ${disabled ? 'cursor-default opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}>
      <button type="button" role="switch" aria-checked={on} aria-label={hideLabel ? label : undefined} disabled={disabled} onClick={() => onChange(!on)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? 'bg-accent' : 'bg-border-control'}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[1.125rem]' : 'left-0.5'}`} />
      </button>
      {!hideLabel && label}
    </label>
  );
}

/** Error text for a failed request: a known code from `known`, else the general message. */
export function errorText(e: unknown, known: Record<string, string> = {}) {
  if (!(e instanceof ApiError)) return messageFor('');
  const field = e.body?.error.fieldErrors?.[0]?.code;
  return known[field ?? ''] ?? known[e.body?.error.message ?? ''] ?? messageFor(e.code);
}

/** A white card with a heading, used for setting panels. */
export function Panel({ title, sub, children, actions }: { title: string; sub?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-body font-semibold text-text-primary">{title}</h2>
          {sub && <p className="text-body-sm text-text-muted">{sub}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/**
 * Drag to reorder (#165, #229) with a handle that works for the mouse and the finger alike: the item
 * under the pointer takes the dragged item's place while moving; the new order is saved on release.
 */
export function useDragOrder(ids: string[], group: string, onCommit: (ids: string[]) => void) {
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const live = useRef<string[] | null>(null);
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(`[data-drag-group="${group}"]`)?.dataset.dragId;
      const cur = live.current;
      if (!over || !cur || over === dragging) return;
      const next = cur.filter((x) => x !== dragging);
      next.splice(cur.indexOf(over), 0, dragging);
      live.current = next; setOrder(next);
    };
    const up = () => {
      const cur = live.current;
      if (cur && cur.join() !== ids.join()) onCommit(cur);
      live.current = null; setOrder(null); setDragging(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    window.addEventListener('pointercancel', up, { once: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, [dragging]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    order: order ?? ids,
    dragging,
    item: (id: string) => ({ 'data-drag-group': group, 'data-drag-id': id }),
    handle: (id: string, label: string) => (
      <button type="button" aria-label={`Перетягнути: ${label}`} title="Перетягніть, щоб змінити порядок"
        onPointerDown={(e) => { e.preventDefault(); live.current = ids; setOrder(ids); setDragging(id); }}
        className="cursor-grab touch-none rounded p-1 text-text-faint hover:bg-bg-alt hover:text-text-muted active:cursor-grabbing max-md:p-2">
        <GripVertical size={18} />
      </button>
    ),
  };
}

/** datetime-local works in local time; the API speaks ISO. */
export const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : '');
export const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);
/** «1 500» or «1500,50» → minor units; empty → null. */
export const toMinor = (v: string) => (v.trim() ? Math.round(Number(v.replace(',', '.').replace(/\s/g, '')) * 100) : null);
