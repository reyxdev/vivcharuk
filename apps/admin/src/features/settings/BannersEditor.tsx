import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { GhostButton, PrimaryButton, SkeletonRows, useConfirm, useToast, useUnsavedGuard } from '@/components/ui';
import { MediaPicker } from '@/features/media/MediaPicker';
import { errorText, fromLocal, inputCls, labelCls, Panel, Switch, toLocal, useDragOrder } from './parts';

interface Banner { id?: string; key: string; mediaId: string; thumb: string | null; title: string; buttonLabel: string; linkUrl: string; startsAt: string; endsAt: string; isActive: boolean }
interface ApiBanner { id: string; mediaId: string | null; thumb: string | null; title: string; buttonLabel: string | null; linkUrl: string | null; startsAt: string | null; endsAt: string | null; isActive: boolean }

const ERR = { SITE_PATH: 'Посилання кнопки — адреса сторінки нашого сайту, наприклад /uk/kolektsii/na-podarunok.', BEFORE_START: 'Кінець показу має бути пізніше за початок.', NOT_FOUND: 'Фото не знайдено — оберіть інше.' };
const fromApi = (b: ApiBanner): Banner => ({ id: b.id, key: b.id, mediaId: b.mediaId ?? '', thumb: b.thumb, title: b.title, buttonLabel: b.buttonLabel ?? '', linkUrl: b.linkUrl ?? '', startsAt: toLocal(b.startsAt), endsAt: toLocal(b.endsAt), isActive: b.isActive });

/** Round 20 #230–231: up to three banners on the home page — photo, title, button, shown from–to. */
export function BannersEditor({ canEdit }: { canEdit: boolean }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, refetch, isPending } = useQuery({ queryKey: ['banners'], queryFn: () => api<{ items: ApiBanner[] }>('/admin/banners') });
  const [draft, setDraft] = useState<Banner[] | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const list = draft ?? data?.items.map(fromApi) ?? [];
  useUnsavedGuard(!!draft);
  const drag = useDragOrder(list.map((b) => b.key), 'banners', (ids) => setDraft(ids.map((id) => list.find((b) => b.key === id)!)));
  const set = (key: string, patch: Partial<Banner>) => setDraft(list.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const save = async () => {
    try {
      await api('/admin/banners', { method: 'PUT', body: JSON.stringify({ items: list.map((b) => ({ id: b.id, mediaId: b.mediaId, title: b.title, buttonLabel: b.buttonLabel, linkUrl: b.linkUrl, startsAt: fromLocal(b.startsAt), endsAt: fromLocal(b.endsAt), isActive: b.isActive })) }) });
      await refetch(); setDraft(null); toast('Банери збережено');
    } catch (e) { toast(errorText(e, ERR), 'error'); }
  };
  const ready = list.every((b) => b.mediaId && b.title.trim().length >= 2);
  const shown = drag.order.map((k) => list.find((b) => b.key === k)!).filter(Boolean);

  return (
    <Panel title="Банери на головній" sub="До трьох: фото, заголовок, кнопка і дати показу. Порядок — перетягуванням.">
      {isPending ? <SkeletonRows rows={2} /> : (
        <ul className="flex flex-col gap-3">
          {shown.map((b) => (
            <li key={b.key} {...drag.item(b.key)} className={`flex gap-3 rounded-lg border border-border-hairline p-3 ${drag.dragging === b.key ? 'bg-bg-alt opacity-80' : ''}`}>
              {canEdit && <div className="-ml-1 self-start">{drag.handle(b.key, b.title || 'банер')}</div>}
              <button type="button" disabled={!canEdit} onClick={() => setPicking(b.key)} aria-label="Обрати фото"
                className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-border-control bg-bg-alt text-text-muted">
                {b.thumb ? <img src={b.thumb} alt="" className="size-full object-cover" /> : <ImagePlus size={22} />}
              </button>
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <label className={`${labelCls} sm:col-span-2`}>Заголовок<input value={b.title} maxLength={80} disabled={!canEdit} onChange={(e) => set(b.key, { title: e.target.value })} className={inputCls} /></label>
                <label className={labelCls}>Напис на кнопці<input value={b.buttonLabel} maxLength={30} placeholder="Переглянути" disabled={!canEdit} onChange={(e) => set(b.key, { buttonLabel: e.target.value })} className={inputCls} /></label>
                <label className={labelCls}>Куди веде кнопка<input value={b.linkUrl} placeholder="/uk/kolektsii/…" disabled={!canEdit} onChange={(e) => set(b.key, { linkUrl: e.target.value.trim() })} className={`${inputCls} font-mono`} /></label>
                <label className={labelCls}>Показувати з<input type="datetime-local" value={b.startsAt} disabled={!canEdit} onChange={(e) => set(b.key, { startsAt: e.target.value })} className={`${inputCls} min-w-0`} /></label>
                <label className={labelCls}>до<input type="datetime-local" value={b.endsAt} disabled={!canEdit} onChange={(e) => set(b.key, { endsAt: e.target.value })} className={`${inputCls} min-w-0`} /></label>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Switch on={b.isActive} disabled={!canEdit} label="Показувати" onChange={(on) => set(b.key, { isActive: on })} />
                  {canEdit && (
                    <button type="button" aria-label="Видалити банер" className="ml-auto rounded-full p-2 text-text-muted hover:bg-bg-alt hover:text-danger"
                      onClick={async () => { if (await confirm({ title: 'Видалити банер?', text: 'Він зникне з головної після «Зберегти».', ok: 'Видалити', danger: true })) setDraft(list.filter((x) => x.key !== b.key)); }}>
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
          {!shown.length && <li className="text-body-sm text-text-muted">Банерів ще немає.</li>}
        </ul>
      )}
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          {list.length < 3 && <GhostButton icon={Plus} onClick={() => setDraft([...list, { key: `new-${Date.now()}`, mediaId: '', thumb: null, title: '', buttonLabel: '', linkUrl: '', startsAt: '', endsAt: '', isActive: true }])}>Банер</GhostButton>}
          <PrimaryButton disabled={!draft || !ready} onClick={() => void save()}>Зберегти банери</PrimaryButton>
        </div>
      )}
      <p className="text-caption text-text-muted">Головна сторінка сайту почне показувати банери після її оновлення — до того вони лише зберігаються тут.</p>
      {picking && <MediaPicker onClose={() => setPicking(null)} onPick={(m) => { set(picking, { mediaId: m.id, thumb: m.thumb }); setPicking(null); }} />}
    </Panel>
  );
}
