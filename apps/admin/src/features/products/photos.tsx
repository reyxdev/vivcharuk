import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, RotateCw, Crop as CropIcon, Star, Trash2, ArrowLeft, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import { api, post } from '@/lib/api';
import { DotsMenu, useConfirm, useToast } from '@/components/ui';
import type { Photo } from './api';

// Round 20 #128, #271–272: camera or several from the gallery; every photo is compressed on the phone
// (≈1600 px long side, WebP where the browser can, else JPEG) into the three widths the site serves,
// then sent one after another in the background while the person carries on. First photo = main.

export type Crop = 'none' | 'square' | '4:5';
const WIDTHS = [480, 960, 1600] as const;
let webp: boolean | undefined;
const canWebp = () => (webp ??= document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'));

const toBlob = (c: HTMLCanvasElement) => new Promise<Blob>((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error('encode'))), canWebp() ? 'image/webp' : 'image/jpeg', canWebp() ? 0.8 : 0.85));
const toBase64 = (b: Blob) => new Promise<string>((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] ?? ''); r.onerror = fail; r.readAsDataURL(b); });

async function prepare(src: Blob, rotate: number, crop: Crop) {
  const url = URL.createObjectURL(src);
  try {
    const img = new Image();
    img.src = url;
    await img.decode(); // the browser applies the camera's orientation
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const turned = rotate % 180 !== 0;
    const r = document.createElement('canvas');
    r.width = turned ? h : w; r.height = turned ? w : h;
    const rc = r.getContext('2d')!;
    rc.translate(r.width / 2, r.height / 2);
    rc.rotate((rotate * Math.PI) / 180);
    rc.drawImage(img, -w / 2, -h / 2, w, h);
    // Centred crop after turning, so «квадрат» and «4:5» mean what the person sees.
    let cw = r.width, ch = r.height;
    if (crop === 'square') cw = ch = Math.min(r.width, r.height);
    if (crop === '4:5') { if (r.width / r.height > 0.8) cw = Math.round(r.height * 0.8); else ch = Math.round(r.width / 0.8); }
    const f = document.createElement('canvas');
    f.width = cw; f.height = ch;
    f.getContext('2d')!.drawImage(r, (r.width - cw) / 2, (r.height - ch) / 2, cw, ch, 0, 0, cw, ch);
    const files = {} as Record<'480' | '960' | '1600', string>;
    for (const target of WIDTHS) {
      const k = Math.min(1, target / f.width);
      const c = document.createElement('canvas');
      c.width = Math.round(f.width * k); c.height = Math.round(f.height * k);
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(f, 0, 0, c.width, c.height);
      files[String(target) as '480'] = await toBase64(await toBlob(c));
    }
    return { files, width: f.width, height: f.height };
  } finally { URL.revokeObjectURL(url); }
}

export interface UploadItem { key: string; preview: string; state: 'wait' | 'prep' | 'send' | 'done' | 'error' }
interface Job { key: string; file: Blob; rotate: number; crop: Crop; replaces?: string }

/** The upload queue lives in the page (not the photo step), so it keeps going while the person moves on. */
export function usePhotoUploads(productId: string | null, onPhotos: (p: Photo[]) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const queue = useRef<Job[]>([]);
  const failed = useRef<Job[]>([]);
  const busy = useRef(false);
  const id = useRef(productId); id.current = productId;
  const cb = useRef(onPhotos); cb.current = onPhotos;
  const mark = (key: string, state: UploadItem['state']) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, state } : x)));

  const pump = useCallback(async () => {
    if (busy.current || !id.current) return;
    busy.current = true;
    while (queue.current.length) {
      const job = queue.current.shift()!;
      try {
        mark(job.key, 'prep');
        const body = await prepare(job.file, job.rotate, job.crop);
        mark(job.key, 'send');
        const r = await post<{ photos: Photo[] }>(`/admin/products/${id.current}/photos`, { ...body, ...(job.replaces ? { replaces: job.replaces } : {}) });
        cb.current(r.photos);
        mark(job.key, 'done');
      } catch { failed.current.push(job); mark(job.key, 'error'); }
    }
    busy.current = false;
    window.setTimeout(() => setItems((xs) => { const left = xs.filter((x) => x.state !== 'done'); xs.filter((x) => x.state === 'done').forEach((x) => URL.revokeObjectURL(x.preview)); return left; }), 1200);
  }, []);

  useEffect(() => { void pump(); }, [productId, pump]);

  const add = useCallback((files: Blob[], opts: { rotate?: number; crop?: Crop; replaces?: string } = {}) => {
    const jobs = files.map((file) => ({ key: `${Date.now()}-${Math.random()}`, file, rotate: opts.rotate ?? 0, crop: opts.crop ?? 'none', replaces: opts.replaces }));
    queue.current.push(...jobs);
    setItems((xs) => [...xs, ...jobs.map((j) => ({ key: j.key, preview: URL.createObjectURL(j.file), state: 'wait' as const }))]);
    void pump();
  }, [pump]);
  const retry = useCallback(() => {
    const jobs = failed.current.splice(0);
    queue.current.push(...jobs);
    setItems((xs) => xs.map((x) => (jobs.some((j) => j.key === x.key) ? { ...x, state: 'wait' } : x)));
    void pump();
  }, [pump]);

  const pending = items.filter((x) => x.state !== 'done' && x.state !== 'error').length;
  return { items, add, retry, pending, failed: items.filter((x) => x.state === 'error').length };
}
export type Uploads = ReturnType<typeof usePhotoUploads>;

/** «Фото: 2 з 4» with a bar; shown on every step while photos are still going. */
export function UploadProgress({ u }: { u: Uploads }) {
  if (!u.items.length) return null;
  const done = u.items.filter((x) => x.state === 'done').length;
  const sending = u.items.filter((x) => x.state === 'send' || x.state === 'prep').length;
  const pct = Math.round(((done + sending * 0.5) / u.items.length) * 100);
  return (
    <div className="flex items-center gap-3 rounded-lg bg-bg-alt px-3 py-2 text-body-sm" role="status">
      {u.pending ? <Loader2 size={16} className="animate-spin text-text-muted" /> : null}
      <span className="shrink-0 text-text-body">Фото: {done} з {u.items.length}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-surface"><span className="block h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></span>
      {u.failed > 0 && <button type="button" onClick={u.retry} className="inline-flex items-center gap-1 text-danger underline"><RefreshCw size={14} />Ще раз ({u.failed})</button>}
    </div>
  );
}

/** Photo tiles: drag to reorder (computer), «⋯» for main / move / turn / crop / remove (phone too). */
export function PhotoGrid({ productId, photos, onPhotos, uploads, canEdit }: { productId: string; photos: Photo[]; onPhotos: (p: Photo[]) => void; uploads: Uploads; canEdit: boolean }) {
  const toast = useToast();
  const confirm = useConfirm();
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const order = async (ids: string[]) => {
    onPhotos(ids.map((id) => photos.find((p) => p.id === id)!));
    try { onPhotos((await api<{ photos: Photo[] }>(`/admin/products/${productId}/photos/order`, { method: 'PUT', body: JSON.stringify({ ids }) })).photos); }
    catch { toast('Порядок не збережено', 'error'); }
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const ids = photos.map((p) => p.id);
    const [x] = ids.splice(from, 1);
    ids.splice(to, 0, x!);
    void order(ids);
  };
  const edit = async (p: Photo, rotate: number, crop: Crop) => {
    if (!p.large) return;
    try { uploads.add([await (await fetch(p.large)).blob()], { rotate, crop, replaces: p.id }); }
    catch { toast('Не вдалося відкрити фото', 'error'); }
  };
  const remove = async (p: Photo) => {
    if (!(await confirm({ title: 'Прибрати фото?', text: 'Фото зникне з товару на сайті.', ok: 'Прибрати', danger: true }))) return;
    try { onPhotos((await api<{ photos: Photo[] }>(`/admin/products/${productId}/photos/${p.id}`, { method: 'DELETE' })).photos); }
    catch { toast('Не вдалося прибрати фото', 'error'); }
  };
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (files.length) uploads.add(files);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {photos.map((p, i) => (
          <li key={p.id} draggable={canEdit} onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
            className={`group relative aspect-square overflow-hidden rounded-lg border bg-bg-alt ${i === 0 ? 'border-accent ring-1 ring-accent' : 'border-border-hairline'} ${canEdit ? 'cursor-grab' : ''}`}>
            {p.thumb && <img src={p.thumb} alt="" className="size-full object-cover" loading="lazy" draggable={false} />}
            {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-accent px-2 py-0.5 text-caption font-semibold text-white">Головне</span>}
            {canEdit && (
              <span className="absolute right-0.5 top-0.5 rounded-full bg-bg-surface/90">
                <DotsMenu label="Дії з фото" items={[
                  { label: 'Зробити головним', icon: Star, onClick: () => move(i, 0), hidden: i === 0 },
                  { label: 'Ліворуч', icon: ArrowLeft, onClick: () => move(i, i - 1), hidden: i === 0 },
                  { label: 'Праворуч', icon: ArrowRight, onClick: () => move(i, i + 1), hidden: i === photos.length - 1 },
                  { label: 'Повернути', icon: RotateCw, onClick: () => void edit(p, 90, 'none') },
                  { label: 'Обрізати квадратом', icon: CropIcon, onClick: () => void edit(p, 0, 'square') },
                  { label: 'Обрізати 4:5', icon: CropIcon, onClick: () => void edit(p, 0, '4:5') },
                  { label: 'Прибрати', icon: Trash2, onClick: () => void remove(p), danger: true },
                ]} />
              </span>
            )}
          </li>
        ))}
        {uploads.items.filter((x) => x.state !== 'done').map((x) => (
          <li key={x.key} className="relative aspect-square overflow-hidden rounded-lg border border-border-hairline bg-bg-alt">
            <img src={x.preview} alt="" className="size-full object-cover opacity-50" />
            <span className={`absolute inset-x-1 bottom-1 rounded-full px-2 py-0.5 text-center text-caption font-medium ${x.state === 'error' ? 'bg-danger text-white' : 'bg-bg-surface/90 text-text-body'}`}>
              {x.state === 'error' ? 'Не надіслано' : x.state === 'send' ? 'Надсилаю…' : x.state === 'prep' ? 'Стискаю…' : 'У черзі'}
            </span>
          </li>
        ))}
      </ul>
      {canEdit && (
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" onClick={() => camera.current?.click()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-control bg-bg-surface px-4 text-body-sm font-medium text-text-primary hover:bg-bg-alt sm:min-h-10">
            <Camera size={18} /> Зняти камерою
          </button>
          <button type="button" onClick={() => gallery.current?.click()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-control bg-bg-surface px-4 text-body-sm font-medium text-text-primary hover:bg-bg-alt sm:min-h-10">
            <ImagePlus size={18} /> З галереї
          </button>
          <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
          <input ref={gallery} type="file" accept="image/*" multiple className="hidden" onChange={pick} />
        </div>
      )}
      <UploadProgress u={uploads} />
      {photos.length > 1 && canEdit && <p className="text-caption text-text-muted">Перше фото — головне. Перетягніть фото, щоб змінити порядок, або скористайтесь «⋯».</p>}
    </div>
  );
}
