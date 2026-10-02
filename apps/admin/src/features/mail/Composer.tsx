import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bold, Image, Italic, Link2, List, ListOrdered, Paperclip, Send, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { fileToOut, kb, type MailSettings, type OutFile } from './api';

interface Photo { id: string; thumb: string }

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The reply editor (round 19 D1 #14–17, #29–30): bold, italics, lists, links; templates; files from the
// device and photos from the catalogue; drafts saved as you type. Mode 'new' (D34 «Новий лист») adds
// «Кому» with buyers' addresses suggested as you type, and «Тема».
export function Composer({ threadId = '', initial, settings, mode, onSent, onCancel, onDirty, focus = false }: {
  threadId?: string; initial: string; settings: MailSettings | undefined;
  mode: { kind: 'reply' } | { kind: 'forward'; messageId: string } | { kind: 'new'; to?: string };
  onSent: (threadId?: string) => void; onCancel?: () => void; onDirty?: (dirty: boolean) => void; focus?: boolean;
}) {
  const ed = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<OutFile[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [picker, setPicker] = useState(false);
  const [to, setTo] = useState(mode.kind === 'new' ? mode.to ?? '' : '');
  const [subject, setSubject] = useState('');
  const [includeFiles, setIncludeFiles] = useState(true);
  const toQuery = useDebounced(to.trim(), 250);
  const { data: suggest } = useQuery({
    queryKey: ['mail-recipients', toQuery], enabled: mode.kind === 'new' && toQuery.length >= 2 && !EMAIL.test(toQuery),
    queryFn: () => api<{ items: Array<{ email: string; name: string | null }> }>(`/admin/mail/recipients?q=${encodeURIComponent(toQuery)}`),
  });
  const dirty = () => onDirty?.(!!(ed.current?.innerText.trim() || subject.trim() || files.length || photos.length));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const saveTimer = useRef<number>(undefined);
  const limit = settings?.maxAttachBytes ?? 20 * 1024 * 1024;
  const size = files.reduce((s, f) => s + f.size, 0);

  useEffect(() => { if (ed.current && mode.kind === 'reply') ed.current.innerHTML = initial; }, [threadId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (focus) ed.current?.focus(); }, [focus]);
  useEffect(dirty, [subject, files.length, photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraft = () => {
    dirty();
    if (mode.kind !== 'reply') return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void api(`/admin/mail/threads/${threadId}/draft`, { method: 'PUT', body: JSON.stringify({ bodyHtml: ed.current?.innerHTML ?? '' }) }).catch(() => undefined); }, 1200);
  };
  const cmd = (c: string, v?: string) => { ed.current?.focus(); document.execCommand(c, false, v); saveDraft(); };
  const link = () => { const u = prompt('Адреса посилання (https://…)'); if (u && /^(https?:\/\/|mailto:|tel:)/.test(u)) cmd('createLink', u); };
  const insertTemplate = (body: string) => {
    ed.current?.focus();
    const html = body.split('\n').map((l) => l.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)).join('<br>');
    document.execCommand('insertHTML', false, `<p>${html}</p>`);
    saveDraft();
  };
  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const out = await Promise.all([...list].map(fileToOut));
    setFiles((f) => [...f, ...out]);
  };

  const send = async () => {
    setErr('');
    const bodyHtml = ed.current?.innerHTML ?? '';
    if (mode.kind === 'new' && !EMAIL.test(to.trim())) { setErr('Вкажіть адресу отримувача, наприклад ivan@gmail.com'); return; }
    if (mode.kind === 'new' && !subject.trim()) { setErr('Напишіть тему листа'); return; }
    if (mode.kind !== 'forward' && !ed.current?.innerText.trim()) { setErr(mode.kind === 'new' ? 'Напишіть текст листа' : 'Напишіть текст відповіді'); return; }
    if (mode.kind === 'forward' && !EMAIL.test(to.trim())) { setErr('Вкажіть адресу, кому переслати'); return; }
    if (size > limit) { setErr(`Вкладення разом більші за ${kb(limit)}`); return; }
    setBusy(true);
    try {
      const strip = files.map(({ size: _s, ...f }) => f);
      let sentThread: string | undefined;
      if (mode.kind === 'reply') await api(`/admin/mail/threads/${threadId}/reply`, { method: 'POST', body: JSON.stringify({ bodyHtml, files: strip, mediaIds: photos.map((p) => p.id) }) });
      else if (mode.kind === 'new') sentThread = (await api<{ threadId: string }>('/admin/mail/compose', { method: 'POST', body: JSON.stringify({ to: to.trim(), subject: subject.trim(), bodyHtml, files: strip, mediaIds: photos.map((p) => p.id) }) })).threadId;
      else await api(`/admin/mail/threads/${threadId}/forward`, { method: 'POST', body: JSON.stringify({ to: to.trim(), messageId: mode.messageId, bodyHtml, includeFiles, files: strip }) });
      if (ed.current) ed.current.innerHTML = '';
      setFiles([]); setPhotos([]); setSubject('');
      onDirty?.(false);
      onSent(sentThread);
    } catch (e) {
      const f = e instanceof ApiError ? e.body?.error.fieldErrors?.[0] : undefined;
      setErr(f?.code === 'TOO_LARGE' ? `Вкладення разом більші за ${kb(limit)}`
        : f?.code === 'SELF' ? 'Це адреса самої скриньки — вкажіть адресу отримувача'
        : f?.path === 'to' ? 'Перевірте адресу отримувача'
        : 'Не вдалося надіслати. Перевірте з\'єднання і спробуйте ще раз.');
    } finally { setBusy(false); }
  };

  const tool = 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-text-body hover:bg-bg-alt max-md:min-h-11 max-md:min-w-11';
  const keep = (e: React.MouseEvent) => e.preventDefault();
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-3">
      {mode.kind === 'new' && (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-border-control bg-bg-input px-3 focus-within:ring-2 focus-within:ring-accent">
            <span className="w-12 shrink-0 text-body-sm text-text-muted">Кому</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} type="email" inputMode="email" autoComplete="off" list="mail-recipients" autoFocus={!to}
              placeholder="почніть вводити email" className="min-h-10 min-w-0 flex-1 bg-transparent text-body outline-none max-md:min-h-11" />
          </label>
          <datalist id="mail-recipients">
            {suggest?.items.map((r) => <option key={r.email} value={r.email}>{r.name ?? ''}</option>)}
          </datalist>
          <label className="flex items-center gap-2 rounded-lg border border-border-control bg-bg-input px-3 focus-within:ring-2 focus-within:ring-accent">
            <span className="w-12 shrink-0 text-body-sm text-text-muted">Тема</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} autoFocus={!!to}
              className="min-h-10 min-w-0 flex-1 bg-transparent text-body outline-none max-md:min-h-11" />
          </label>
        </div>
      )}
      {mode.kind === 'forward' && (
        <div className="flex flex-col gap-2">
          <input value={to} onChange={(e) => setTo(e.target.value)} type="email" placeholder="Кому переслати (email)" className="rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body" />
          <label className="flex items-center gap-2 text-body-sm"><input type="checkbox" checked={includeFiles} onChange={(e) => setIncludeFiles(e.target.checked)} /> Разом із вкладеннями листа</label>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" className={tool} onMouseDown={keep} onClick={() => cmd('bold')} aria-label="Жирний" title="Жирний"><Bold size={17} /></button>
        <button type="button" className={tool} onMouseDown={keep} onClick={() => cmd('italic')} aria-label="Курсив" title="Курсив"><Italic size={17} /></button>
        <button type="button" className={tool} onMouseDown={keep} onClick={() => cmd('insertUnorderedList')} aria-label="Список" title="Список"><List size={17} /></button>
        <button type="button" className={tool} onMouseDown={keep} onClick={() => cmd('insertOrderedList')} aria-label="Нумерований список" title="Нумерований список"><ListOrdered size={17} /></button>
        <button type="button" className={tool} onMouseDown={keep} onClick={link} aria-label="Посилання" title="Посилання"><Link2 size={17} /></button>
        {!!settings?.templates.length && (
          <select aria-label="Шаблон" value="" onChange={(e) => { const t = settings.templates.find((x) => x.key === e.target.value); if (t) insertTemplate(t.body); }}
            className="min-h-9 rounded-md border border-border-control bg-bg-input px-2 text-body-sm max-md:min-h-11">
            <option value="">Шаблон…</option>
            {settings.templates.map((t) => <option key={t.key} value={t.key}>{t.title}</option>)}
          </select>
        )}
      </div>
      <div ref={ed} contentEditable role="textbox" aria-multiline="true" aria-label={mode.kind === 'reply' ? 'Текст відповіді' : mode.kind === 'new' ? 'Текст листа' : 'Текст до пересланого листа'} onInput={saveDraft}
        className="min-h-36 flex-1 rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:underline" />
      {(files.length > 0 || photos.length > 0) && (
        <ul className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li key={`${f.filename}${i}`} className="flex items-center gap-2 rounded-md border border-border-hairline px-2 py-1 text-caption">
              {f.filename} · {kb(f.size)}
              <button type="button" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} aria-label={`Прибрати ${f.filename}`} className="text-text-muted"><X size={14} /></button>
            </li>
          ))}
          {photos.map((p) => (
            <li key={p.id} className="relative">
              <img src={p.thumb} alt="" className="size-14 rounded-md object-cover" />
              <button type="button" onClick={() => setPhotos((x) => x.filter((y) => y.id !== p.id))} aria-label="Прибрати фото" className="absolute -right-1 -top-1 rounded-full bg-bg-page p-0.5"><X size={12} /></button>
            </li>
          ))}
        </ul>
      )}
      {size > limit && <p className="text-caption text-danger">Разом {kb(size)} — більше за ліміт {kb(limit)}</p>}
      {picker && <CataloguePicker chosen={photos} onPick={(p) => setPhotos((x) => (x.some((y) => y.id === p.id) ? x : [...x, p]))} />}
      {err && <p className="text-body-sm text-danger" role="alert">{err}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={send} disabled={busy} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-5 text-body-sm font-semibold text-white disabled:opacity-50">
          <Send size={16} />{busy ? 'Надсилаю…' : mode.kind === 'forward' ? 'Переслати' : 'Надіслати'}
        </button>
        <label title="Додати файл" className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-border-control px-3 text-body-sm hover:bg-bg-alt">
          <Paperclip size={16} /> Файл <input type="file" multiple className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }} />
        </label>
        {mode.kind !== 'forward' && <button type="button" onClick={() => setPicker(!picker)} aria-pressed={picker} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border-control px-3 text-body-sm hover:bg-bg-alt"><Image size={16} /> Фото з каталогу</button>}
        {onCancel && <button type="button" onClick={onCancel} className="min-h-11 px-3 text-body-sm text-text-muted">Скасувати</button>}
        {mode.kind === 'reply' && <span className="ml-auto text-caption text-text-muted max-md:w-full">Чернетка зберігається сама. На телефоні можна надиктувати: мікрофон на клавіатурі.</span>}
      </div>
    </div>
  );
}

function CataloguePicker({ chosen, onPick }: { chosen: Photo[]; onPick: (p: Photo) => void }) {
  const [q, setQ] = useState('');
  const { data } = useQuery({ queryKey: ['mail-photos', q], queryFn: () => api<{ items: Array<{ id: string; name: string; sku: string; photos: Photo[] }> }>(`/admin/mail/catalogue-photos?q=${encodeURIComponent(q)}`) });
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-hairline p-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук товару" className="rounded-md border border-border-control bg-bg-input px-3 py-2 text-body-sm" />
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
        {data?.items.map((p) => (
          <div key={p.id} className="flex flex-col gap-1">
            <span className="text-caption text-text-muted">{p.name} · {p.sku}</span>
            <div className="flex flex-wrap gap-1.5">
              {p.photos.map((ph) => (
                <button key={ph.id} type="button" onClick={() => onPick(ph)} aria-pressed={chosen.some((c) => c.id === ph.id)}
                  className={`rounded-md border-2 ${chosen.some((c) => c.id === ph.id) ? 'border-accent' : 'border-transparent'}`}>
                  <img src={ph.thumb} alt="" className="size-16 rounded object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        ))}
        {data && !data.items.length && <p className="text-caption text-text-muted">Нічого не знайдено</p>}
      </div>
    </div>
  );
}
