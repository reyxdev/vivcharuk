import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, Copy, MoreHorizontal, WifiOff, X, type LucideIcon } from 'lucide-react';

// Round 20 building blocks. Phone-first where it matters (#253: one hand, actions at the bottom).

export function IconCircle({ icon: Icon, color, ink = '#fff', size = 32 }: { icon: LucideIcon; color: string; ink?: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full" style={{ background: color, width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.55)} color={ink} strokeWidth={1.75} />
    </span>
  );
}

/* ---------- Notices (#26, #84): short, bottom centre ---------- */
type Toast = { id: number; text: string; tone: 'ok' | 'error' };
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

/* ---------- «Ви впевнені?» (#24, #85) as a centred dialog or a bottom sheet on the phone (#194) ---------- */
type ConfirmReq = { title: string; text?: string; ok: string; danger?: boolean; resolve: (v: boolean) => void };
const ConfirmCtx = createContext<(r: Omit<ConfirmReq, 'resolve'>) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmReq, setConfirmReq] = useState<ConfirmReq | null>(null);
  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    if (tone === 'ok' && 'vibrate' in navigator) navigator.vibrate?.(15); // #285, Android only
  }, []);
  const confirm = useCallback((r: Omit<ConfirmReq, 'resolve'>) => new Promise<boolean>((resolve) => setConfirmReq({ ...r, resolve })), []);
  const close = (v: boolean) => { confirmReq?.resolve(v); setConfirmReq(null); };
  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
          {toasts.map((t) => (
            <p key={t.id} className={`vk-sheet pointer-events-auto rounded-full px-4 py-2 text-body-sm font-medium shadow-lg ${t.tone === 'ok' ? 'bg-bg-inverted text-text-on-inverted' : 'bg-danger text-white'}`}>{t.text}</p>
          ))}
        </div>
        {confirmReq && (
          <Sheet onClose={() => close(false)} title={confirmReq.title}>
            {confirmReq.text && <p className="text-body text-text-body">{confirmReq.text}</p>}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => close(false)} className="min-h-11 rounded-lg border border-border-control px-4 text-body-sm font-medium">Скасувати</button>
              <button type="button" autoFocus onClick={() => close(true)} className={`min-h-11 rounded-lg px-4 text-body-sm font-semibold text-white ${confirmReq.danger ? 'bg-danger' : 'bg-accent'}`}>{confirmReq.ok}</button>
            </div>
          </Sheet>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

/** A dialog: centred on a computer, a bottom sheet on the phone; Esc and the phone's back gesture close
 * the topmost one only (#286). Dialogs may stack («Ви впевнені?» over the TTN dialog). */
const sheetStack: number[] = [];
let sheetSeq = 0;
let ignorePop = 0;
export function Sheet({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const id = ++sheetSeq;
    sheetStack.push(id);
    history.pushState({ sheet: id }, '');
    const top = () => sheetStack[sheetStack.length - 1] === id;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && top()) closeRef.current(); };
    const onPop = () => { if (ignorePop) { ignorePop--; return; } if (top()) closeRef.current(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
    ref.current?.querySelector<HTMLElement>('[autofocus], input, button')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
      sheetStack.splice(sheetStack.indexOf(id), 1);
      // Closed by a button: drop our history entry without closing the dialog underneath.
      if (history.state?.sheet === id) { ignorePop++; history.back(); }
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title}
        className={`vk-sheet max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="mb-3 flex items-start gap-3">
          <h2 className="flex-1 text-h3 text-text-primary">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Закрити" className="-m-2 rounded-full p-2 text-text-muted hover:bg-bg-alt"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Page title row: «← Назад» (#40), title, the one main action on the right (#147). */
export function PageHeader({ title, back, actions, sub }: { title: ReactNode; back?: string | true; actions?: ReactNode; sub?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      {back && (
        <button type="button" onClick={() => (back === true ? nav(-1) : nav(back))} aria-label="Назад" className="-ml-2 rounded-full p-2 text-text-muted hover:bg-bg-alt"><ArrowLeft size={20} /></button>
      )}
      <div className="min-w-0 flex-1">
        {/* On the phone a section page already shows its name in the header (#254). */}
        <h1 className={`truncate text-h2 font-semibold text-text-primary ${back ? '' : 'max-md:sr-only'}`}>{title}</h1>
        {sub && <p className="text-body-sm text-text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PrimaryButton({ icon: Icon, children, className = '', ...rest }: { icon?: LucideIcon } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-body-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 max-md:min-h-12 ${className}`}>
      {Icon && <Icon size={18} strokeWidth={2} />}{children}
    </button>
  );
}

export function GhostButton({ icon: Icon, children, className = '', ...rest }: { icon?: LucideIcon } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border-control bg-bg-surface px-3 text-body-sm font-medium text-text-primary transition hover:bg-bg-alt disabled:opacity-50 max-md:min-h-12 ${className}`}>
      {Icon && <Icon size={18} strokeWidth={1.75} />}{children}
    </button>
  );
}

/** «⋯» menu for a row or a page (#71). */
export function DotsMenu({ items, label = 'Дії' }: { items: Array<{ label: string; icon?: LucideIcon; onClick: () => void; danger?: boolean; hidden?: boolean }>; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  const shown = items.filter((i) => !i.hidden);
  if (!shown.length) return null;
  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={() => setOpen(!open)} aria-label={label} aria-expanded={open} className="rounded-md p-1.5 text-text-muted hover:bg-bg-alt max-md:p-2.5"><MoreHorizontal size={18} /></button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-1 min-w-48 rounded-xl border border-border-hairline bg-bg-surface p-1 shadow-xl">
          {shown.map((i) => (
            <button key={i.label} type="button" role="menuitem" onClick={() => { setOpen(false); i.onClick(); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm hover:bg-bg-alt max-md:py-3 ${i.danger ? 'text-danger' : 'text-text-primary'}`}>
              {i.icon && <i.icon size={16} strokeWidth={1.75} />}{i.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Copy with the icon turning into a tick for a moment (#116, #246). */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" aria-label={`Копіювати ${label}`} title="Копіювати"
      onClick={(e) => { e.stopPropagation(); void navigator.clipboard.writeText(value).then(() => { setDone(true); window.setTimeout(() => setDone(false), 1200); }); }}
      className="inline-flex rounded-md p-1 text-text-muted hover:bg-bg-alt hover:text-text-primary">
      {done ? <Check size={15} className="text-success" /> : <Copy size={15} />}
    </button>
  );
}

/** Empty section: one warm sentence + an action (#32, #187). */
export function EmptyState({ icon: Icon, text, action }: { icon?: LucideIcon; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-control px-6 py-10 text-center">
      {Icon && <Icon size={28} className="text-text-faint" strokeWidth={1.5} />}
      <p className="max-w-sm text-body text-text-muted">{text}</p>
      {action}
    </div>
  );
}

/** Grey skeleton rows while loading (#192). */
export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Завантаження">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="vk-skeleton h-12 rounded-lg" />)}
    </div>
  );
}

/** «Немає зв'язку» strip (#193). */
export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return <div role="status" className="flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-body-sm font-medium text-white"><WifiOff size={16} /> Немає зв'язку — нічого не загубиться, збережете, коли з'явиться інтернет</div>;
}

/** Warn before leaving a form with unsaved changes (#86). */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}

/** A «?» hint: one sentence (#31). */
export function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button type="button" onClick={() => setOpen(!open)} onBlur={() => setOpen(false)} aria-label="Підказка" className="inline-flex size-5 items-center justify-center rounded-full border border-border-control text-caption text-text-muted">?</button>
      {open && <span role="tooltip" className="absolute left-1/2 top-full z-40 mt-1 w-60 -translate-x-1/2 rounded-lg bg-bg-inverted px-3 py-2 text-caption font-normal text-text-on-inverted shadow-lg">{text}</span>}
    </span>
  );
}

/** Tabs with counts (#29, #242); scroll sideways on the phone (#270); remembered (#30). */
export function Tabs<K extends string>({ tabs, value, onChange }: { tabs: Array<{ key: K; label: string; count?: number | null; strong?: boolean }>; value: K; onChange: (k: K) => void }) {
  return (
    <nav aria-label="Вкладки" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
      {tabs.map((t) => (
        <button key={t.key} type="button" onClick={() => onChange(t.key)} aria-current={t.key === value}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm max-md:py-2 ${t.key === value ? 'bg-bg-inverted font-semibold text-text-on-inverted' : 'text-text-body hover:bg-bg-alt'}`}>
          {t.label}
          {!!t.count && <span className={`tabular rounded-full px-1.5 text-caption font-semibold ${t.strong && t.key !== value ? 'bg-accent text-white' : t.key === value ? 'bg-white/20' : 'text-text-muted'}`}>{t.count}</span>}
        </button>
      ))}
    </nav>
  );
}

/** Remembered UI state per person and device (#30). */
export function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(`vk.${key}`); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  const set = useCallback((next: T) => { setV(next); try { localStorage.setItem(`vk.${key}`, JSON.stringify(next)); } catch { /* private mode */ } }, [key]);
  return [v, set] as const;
}
