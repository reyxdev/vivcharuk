import { useState } from 'react';
import { ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { uah } from '@/lib/format';
import { GhostButton, PrimaryButton, Sheet, useConfirm, useToast } from '@/components/ui';
import { type Libraries, useRefreshProducts } from './api';
import { inputCls, labelCls } from './parts';

// Round 20 #123, #221: bulk actions from the bar at the bottom. Every operation is one command on the
// server (23 §23.6.7): a dry run for prices, one transaction, and a one-click revert where it makes sense.

type Operation =
  | { op: 'price_adjust'; mode: 'percent'; value: number; round: 'none' | 'to_10' }
  | { op: 'archive' } | { op: 'restore' } | { op: 'move_category'; categoryId: string } | { op: 'delete' };
interface Result {
  affected: number; skipped: Array<{ sku: string; reason: string }>; auditBatchId: string | null;
  preview: Array<{ sku: string; name: string; before: { prices?: Record<string, number> }; after: { prices?: Record<string, number> } }>;
}

const run = (ids: string[], operation: Operation, dryRun = false) => post<Result>('/admin/products/bulk', { ids, operation, expectedCount: ids.length, dryRun });
const errText = (e: unknown) => (e instanceof ApiError && e.body?.error.message === 'SELECTION_CHANGED' ? 'Список змінився — оновіть сторінку й оберіть ще раз' : messageFor(e instanceof ApiError ? e.code : ''));

/** Hide, show, delete: «Ви впевнені?» (#85), then one command; skipped products are named in the notice. */
export function useBulk(onDone: () => void) {
  const confirm = useConfirm();
  const toast = useToast();
  const refresh = useRefreshProducts();
  const go = async (ids: string[], operation: Operation, done: string) => {
    try {
      const r = await run(ids, operation);
      await refresh();
      toast(r.skipped.length ? `${done}: ${r.affected}; пропущено ${r.skipped.length} (${r.skipped[0]!.reason.toLowerCase()})` : `${done}: ${r.affected}`);
      onDone();
    } catch (e) { toast(errText(e), 'error'); }
  };
  return {
    hide: async (ids: string[]) => { if (await confirm({ title: `Сховати ${ids.length} з сайту?`, text: 'Покупці їх не бачитимуть. Повернути можна будь-коли.', ok: 'Сховати', danger: true })) await go(ids, { op: 'archive' }, 'Сховано'); },
    show: (ids: string[]) => go(ids, { op: 'restore' }, 'Показано'),
    remove: async (ids: string[]) => { if (await confirm({ title: `Видалити ${ids.length}?`, text: 'Товари, які вже замовляли, не видаляються — їх можна лише сховати. Це не можна скасувати.', ok: 'Видалити', danger: true })) await go(ids, { op: 'delete' }, 'Видалено'); },
    move: (ids: string[], categoryId: string) => go(ids, { op: 'move_category', categoryId }, 'Перенесено'),
  };
}

/** «Змінити ціну на %»: preview first, then apply; after that «Скасувати цю зміну». */
export function PriceSheet({ ids, onClose, onDone }: { ids: string[]; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const refresh = useRefreshProducts();
  const [value, setValue] = useState('');
  const [round, setRound] = useState(true);
  const [preview, setPreview] = useState<Result | null>(null);
  const [done, setDone] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const n = Number(value.replace(',', '.'));
  const op: Operation = { op: 'price_adjust', mode: 'percent', value: n, round: round ? 'to_10' : 'none' };
  const call = async (dry: boolean) => {
    setBusy(true);
    try {
      const r = await run(ids, op, dry);
      if (dry) setPreview(r); else { setDone(r); setPreview(null); await refresh(); toast(`Ціни змінено: ${r.affected}`); onDone(); }
    } catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  const revert = async () => {
    if (!done?.auditBatchId) return;
    try { const r = await post<{ reverted: number; skipped: string[] }>('/admin/products/bulk/revert', { auditBatchId: done.auditBatchId }); await refresh(); toast(`Повернуто: ${r.reverted}`); onClose(); }
    catch (e) { toast(errText(e), 'error'); }
  };
  const first = (x: Result['preview'][number]) => [Object.values(x.before.prices ?? {})[0], Object.values(x.after.prices ?? {})[0]] as const;

  return (
    <Sheet title={`Змінити ціну · ${ids.length}`} onClose={onClose}>
      {done ? (
        <div className="flex flex-col gap-3">
          <p className="text-body text-text-body">Змінено {done.affected}{done.skipped.length ? `, пропущено ${done.skipped.length}` : ''}.</p>
          <div className="flex flex-wrap gap-2">
            {done.auditBatchId && <GhostButton onClick={() => void revert()}>Скасувати цю зміну</GhostButton>}
            <PrimaryButton onClick={onClose}>Готово</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className={labelCls}>На скільки відсотків (мінус — знизити)
            <input autoFocus inputMode="decimal" value={value} onChange={(e) => { setValue(e.target.value); setPreview(null); }} placeholder="10 або -5" className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-body-sm text-text-primary"><input type="checkbox" checked={round} onChange={(e) => { setRound(e.target.checked); setPreview(null); }} className="size-5 accent-[var(--accent)]" />Округлити до 10 ₴</label>
          {preview && (
            <div className="flex flex-col gap-1 rounded-lg bg-bg-alt p-3 text-body-sm">
              <p className="font-medium text-text-primary">Зміниться: {preview.affected}{preview.skipped.length ? ` · пропущено ${preview.skipped.length}` : ''}</p>
              {preview.preview.slice(0, 5).map((x) => { const [a, b] = first(x); return <p key={x.sku} className="truncate text-text-body">{x.name}: {uah(a ?? null)} → <b>{uah(b ?? null)}</b></p>; })}
              {preview.skipped.slice(0, 3).map((s) => <p key={s.sku} className="text-text-muted">{s.sku}: {s.reason}</p>)}
            </div>
          )}
          <div className="flex justify-end gap-2">
            {!preview
              ? <PrimaryButton disabled={!n || busy} onClick={() => void call(true)}>Переглянути</PrimaryButton>
              : <PrimaryButton disabled={!preview.affected || busy} onClick={() => void call(false)}>Змінити ціну в {preview.affected}</PrimaryButton>}
          </div>
        </div>
      )}
    </Sheet>
  );
}

/** «Перенести в категорію»: the chosen category replaces the old ones. */
export function CategorySheet({ ids, libs, onClose, onPick }: { ids: string[]; libs: Libraries; onClose: () => void; onPick: (categoryId: string) => void }) {
  const tops = libs.categories.filter((c) => !c.parentId);
  return (
    <Sheet title={`Перенести в категорію · ${ids.length}`} onClose={onClose}>
      <ul className="flex flex-col">
        {tops.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => onPick(c.id)} className="w-full rounded-lg px-3 py-2.5 text-left text-body font-medium text-text-primary hover:bg-bg-alt">{c.name}</button>
            {libs.categories.filter((x) => x.parentId === c.id).map((x) => (
              <button key={x.id} type="button" onClick={() => onPick(x.id)} className="w-full rounded-lg py-2 pl-7 pr-3 text-left text-body-sm text-text-body hover:bg-bg-alt">{x.name}</button>
            ))}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
