import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PostBlock, PostBody } from '@vivcharyk/schemas';
import { Bold, ExternalLink, Heading2, Italic, Link2, List, ListOrdered, Minus, Newspaper, Package, Plus, Quote, Undo2, CalendarClock, EyeOff } from 'lucide-react';
import { api, post } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { DataTable, type Column } from '@/components/DataTable';
import { DotsMenu, EmptyState, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast } from '@/components/ui';
import { errorText, inputCls, labelCls } from '@/features/settings/parts';
import { ApiError } from '@/lib/api';

interface Row { id: string; status: string; title: string; slug: string; publishedAt: string | null; scheduledFor: string | null; updatedAt: string; readMinutes: number | null; tags: string[] }
interface Lint { level: 'block' | 'warn'; message: string }
interface Detail { id: string; status: string; publishedAt: string | null; scheduledFor: string | null; title: string; slug: string; excerpt: string; body: PostBody; metaTitle: string | null; metaDescription: string | null; tagIds: string[]; lints: Lint[]; readMinutes: number | null; hasDraft: boolean; draftUpdatedAt: string | null }

const STATUS: Record<string, [string, string]> = {
  DRAFT: ['Чернетка', 'bg-bg-alt text-text-muted'], SCHEDULED: ['Заплановано', 'bg-info/15 text-info'], PUBLISHED: ['На сайті', 'bg-success/15 text-success'], ARCHIVED: ['В архіві', 'bg-bg-alt text-text-muted'],
};
const SITE = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://127.0.0.1:5173';
const Badge = ({ s }: { s: string }) => <span className={`inline-flex rounded-full px-2 py-0.5 text-caption font-medium ${STATUS[s]?.[1] ?? ''}`}>{STATUS[s]?.[0] ?? s}</span>;

// Round 20 #225–227: Іван writes rarely — a list, and a simple editor like the mail one.
export function BlogPage() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['posts'], queryFn: () => api<{ items: Row[] }>('/admin/posts') });
  const [creating, setCreating] = useState(false);
  const canCreate = !!me?.permissions.includes('blog.create');
  const columns: Array<Column<Row>> = [
    { key: 'title', header: 'Заголовок', cell: (p) => <span className="font-medium text-text-primary">{p.title}</span> },
    { key: 'status', header: 'Стан', cell: (p) => <span className="inline-flex items-center gap-2"><Badge s={p.status} />{p.status === 'SCHEDULED' && p.scheduledFor ? <span className="text-caption text-text-muted">{dateTime(p.scheduledFor)}</span> : null}</span> },
    { key: 'updated', header: 'Змінено', cell: (p) => dateTime(p.updatedAt) },
  ];
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Блог" actions={canCreate && <PrimaryButton icon={Plus} onClick={() => setCreating(true)}>Стаття</PrimaryButton>} />
      <DataTable rows={data?.items} columns={columns} onRowClick={(p) => navigate(`/blog/${p.id}`)}
        card={(p) => <div className="flex flex-col gap-1"><span className="font-medium text-text-primary">{p.title}</span><span className="flex items-center gap-2 text-caption text-text-muted"><Badge s={p.status} />{dateTime(p.updatedAt)}</span></div>}
        empty={<EmptyState icon={Newspaper} text="Статей ще немає. Найпростіше — розповісти історію своїми словами, як у листі." action={canCreate && <PrimaryButton icon={Plus} onClick={() => setCreating(true)}>Перша стаття</PrimaryButton>} />} />
      {creating && <NewPost onClose={() => setCreating(false)} onCreated={(id) => navigate(`/blog/${id}`)} />}
    </div>
  );
}

function NewPost({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  return (
    <Sheet title="Нова стаття" onClose={onClose}>
      <form className="flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); try { const r = await post<{ id: string }>('/admin/posts', { title: title.trim() }); onCreated(r.id); } catch (x) { toast(errorText(x), 'error'); } }}>
        <label className={labelCls}>Заголовок<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} placeholder="Як доглядати за ліжником" className={inputCls} /></label>
        <PrimaryButton type="submit" disabled={title.trim().length < 3}>Почати писати</PrimaryButton>
      </form>
    </Sheet>
  );
}

/* ---------- The text ⇄ blocks bridge ----------
   The editor holds ordinary formatted text (paragraphs, subheadings, lists, quotes, links); product
   cards and other special blocks sit in it as small non-editable chips. «Коротко» (first) and
   questions-answers (last) have their own fields. */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const mdToHtml = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:)[^)\s]*)\)/g, '<a href="$2">$1</a>');
const chip = (b: PostBlock, label: string) => `<div contenteditable="false" data-block="${esc(JSON.stringify(b))}" class="vk-chip">${esc(label)}</div>`;

function blocksToHtml(blocks: PostBlock[]) {
  return blocks.map((b) => {
    switch (b.type) {
      case 'paragraph': return `<p>${mdToHtml(b.text)}</p>`;
      case 'heading': return `<h${b.level}>${mdToHtml(b.text)}</h${b.level}>`;
      case 'bulletList': return `<ul>${b.items.map((i) => `<li>${mdToHtml(i)}</li>`).join('')}</ul>`;
      case 'orderedList': return `<ol>${b.items.map((i) => `<li>${mdToHtml(i)}</li>`).join('')}</ol>`;
      case 'blockquote': return b.attribution ? chip(b, `Цитата: «${b.text.slice(0, 60)}» — ${b.attribution}`) : `<blockquote>${mdToHtml(b.text)}</blockquote>`;
      case 'divider': return '<hr>';
      case 'productEmbed': return chip(b, 'Картка товару');
      case 'callout': return chip(b, `Примітка: ${b.text.slice(0, 80)}`);
      default: return '';
    }
  }).join('');
}

function inline(n: Node): string {
  if (n.nodeType === Node.TEXT_NODE) return (n.textContent ?? '').replace(/ /g, ' ');
  if (!(n instanceof HTMLElement)) return '';
  const inner = [...n.childNodes].map(inline).join('');
  switch (n.tagName) {
    case 'B': case 'STRONG': return inner.trim() ? `**${inner}**` : inner;
    case 'I': case 'EM': return inner.trim() ? `*${inner}*` : inner;
    case 'A': { const h = n.getAttribute('href') ?? ''; return /^(https?:\/\/|\/|mailto:)/.test(h) && inner.trim() ? `[${inner}](${h})` : inner; }
    case 'BR': return ' ';
    default: return inner;
  }
}
const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'BLOCKQUOTE', 'HR']);

function htmlToBlocks(root: HTMLElement): PostBlock[] {
  const out: PostBlock[] = [];
  const walk = (parent: Node) => {
    let loose = '';
    const flush = () => { const t = clean(loose); if (t) out.push({ type: 'paragraph', text: t }); loose = ''; };
    for (const n of [...parent.childNodes]) {
      if (!(n instanceof HTMLElement) || !BLOCK_TAGS.has(n.tagName) && !n.dataset.block) { loose += inline(n); continue; }
      flush();
      if (n.dataset.block) { try { out.push(JSON.parse(n.dataset.block) as PostBlock); } catch { /* broken chip */ } continue; }
      const t = clean(inline(n));
      switch (n.tagName) {
        case 'H1': case 'H2': if (t) out.push({ type: 'heading', level: 2, text: t }); break;
        case 'H3': case 'H4': if (t) out.push({ type: 'heading', level: 3, text: t }); break;
        case 'UL': case 'OL': { const items = [...n.querySelectorAll('li')].map((li) => clean(inline(li))).filter(Boolean); if (items.length) out.push({ type: n.tagName === 'UL' ? 'bulletList' : 'orderedList', items }); break; }
        case 'BLOCKQUOTE': if (t) out.push({ type: 'blockquote', text: t, attribution: null }); break;
        case 'HR': out.push({ type: 'divider' }); break;
        default: if ([...n.children].some((c) => BLOCK_TAGS.has(c.tagName) || (c as HTMLElement).dataset.block)) walk(n); else if (t) out.push({ type: 'paragraph', text: t });
      }
    }
    flush();
  };
  walk(root);
  return out;
}

interface Doc { title: string; excerpt: string; facts: string; faq: Array<{ q: string; a: string }>; metaTitle: string; metaDescription: string; tagIds: string[] }

function split(d: Detail): { doc: Doc; html: string } {
  const kf = d.body.blocks.find((b) => b.type === 'keyFacts');
  const faq = d.body.blocks.flatMap((b) => (b.type === 'faq' ? b.items : []));
  return {
    doc: { title: d.title, excerpt: d.excerpt, facts: kf?.type === 'keyFacts' ? kf.items.join('\n') : '', faq, metaTitle: d.metaTitle ?? '', metaDescription: d.metaDescription ?? '', tagIds: d.tagIds },
    html: blocksToHtml(d.body.blocks.filter((b) => b.type !== 'keyFacts' && b.type !== 'faq')),
  };
}

function assemble(doc: Doc, text: PostBlock[]): PostBlock[] {
  const facts = doc.facts.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 8);
  const faq = doc.faq.filter((x) => x.q.trim() && x.a.trim());
  return [...(facts.length ? [{ type: 'keyFacts' as const, items: facts }] : []), ...text, ...(faq.length ? [{ type: 'faq' as const, items: faq }] : [])];
}

export function PostEditorPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data: p } = useQuery({ queryKey: ['post', id], queryFn: () => api<Detail>(`/admin/posts/${id}`) });
  const { data: tags } = useQuery({ queryKey: ['post-tags'], queryFn: () => api<{ items: Array<{ id: string; name: string }> }>('/admin/post-tags') });
  const ed = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState<{ status: string; slug: string; scheduledFor: string | null; hasDraft: boolean } | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [text, setText] = useState<PostBlock[]>([]);
  const [lints, setLints] = useState<Lint[]>([]);
  const [saved, setSaved] = useState('');
  const [more, setMore] = useState(false);
  const [picking, setPicking] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const first = useRef(true);
  const pendingHtml = useRef<string | null>(null);

  // The text goes into the editor once it is on the page; the blocks are read from the same HTML now,
  // so loading never counts as an edit (no autosave, no draft of a published article).
  const load = (d: Detail) => {
    const s = split(d);
    const probe = document.createElement('div');
    probe.innerHTML = s.html;
    first.current = true;
    pendingHtml.current = s.html || '<p><br></p>';
    setDoc(s.doc); setText(htmlToBlocks(probe)); setMeta({ status: d.status, slug: d.slug, scheduledFor: d.scheduledFor, hasDraft: d.hasDraft }); setLints(d.lints);
  };
  useEffect(() => { if (p && !doc) load(p); }, [p]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ed.current && pendingHtml.current !== null) { ed.current.innerHTML = pendingHtml.current; pendingHtml.current = null; } });

  // Autosave two seconds after the last change.
  useEffect(() => {
    if (!doc) return;
    if (first.current) { first.current = false; return; }
    setSaved('Є зміни…');
    const h = window.setTimeout(async () => {
      try {
        const body = { blocks: assemble(doc, text) };
        const r = await api<{ lints: Lint[]; readMinutes: number; hasDraft: boolean }>(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify({ title: doc.title, excerpt: doc.excerpt, body, metaTitle: doc.metaTitle.trim() || null, metaDescription: doc.metaDescription.trim() || null, tagIds: doc.tagIds }) });
        setLints(r.lints); setMeta((m) => m && { ...m, hasDraft: r.hasDraft }); setSaved(`Збережено · ${r.readMinutes} хв читання`);
      } catch (e) { setSaved(''); toast(errorText(e), 'error'); }
    }, 2000);
    return () => window.clearTimeout(h);
  }, [doc, text, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p || !doc || !meta) return <><PageHeader title="Стаття" back="/blog" /><SkeletonRows /></>;
  const set = (patch: Partial<Doc>) => setDoc({ ...doc, ...patch });
  const pending = saved === 'Є зміни…';
  const blocking = lints.filter((l) => l.level === 'block');
  const live = meta.status === 'PUBLISHED';
  const cmd = (c: string, v?: string) => { ed.current?.focus(); document.execCommand(c, false, v); setText(htmlToBlocks(ed.current!)); };
  const link = () => { const u = prompt('Адреса посилання: сторінка нашого сайту (/uk/…) або https://…'); if (u && /^(https?:\/\/|\/)/.test(u.trim())) cmd('createLink', u.trim()); };
  const heading = () => { const inH = document.getSelection()?.anchorNode?.parentElement?.closest('h2'); cmd('formatBlock', inH ? 'P' : 'H2'); };

  const publish = async (at: string | null) => {
    try {
      const r = await post<Detail>(`/admin/posts/${id}/publish`, { at });
      setMeta({ status: r.status, slug: r.slug, scheduledFor: r.scheduledFor, hasDraft: false }); setSaved(''); setScheduling(false);
      if (!doc.excerpt) { first.current = true; set({ excerpt: r.excerpt }); }
      await qc.invalidateQueries({ queryKey: ['posts'] });
      toast(r.status === 'SCHEDULED' ? 'Статтю заплановано' : 'Опубліковано на сайті');
    } catch (e) {
      const missing = e instanceof ApiError ? (e.body?.error.params as { missing?: string[] } | undefined)?.missing : undefined;
      toast(missing ? `Не вистачає: ${missing.join('; ')}` : errorText(e), 'error');
    }
  };
  const unpublish = async () => {
    if (!(await confirm({ title: 'Зняти статтю з сайту?', text: 'Вона стане чернеткою; текст збережеться.', ok: 'Зняти', danger: true }))) return;
    try { await post(`/admin/posts/${id}/status`, { status: 'DRAFT' }); setMeta({ ...meta, status: 'DRAFT', hasDraft: false, scheduledFor: null }); await qc.invalidateQueries({ queryKey: ['posts'] }); toast('Статтю знято з сайту'); }
    catch (e) { toast(errorText(e), 'error'); }
  };
  const discard = async () => {
    if (!(await confirm({ title: 'Скасувати неопубліковані зміни?', text: 'На сайті залишиться поточний текст.', ok: 'Скасувати зміни', danger: true }))) return;
    try { load(await api<Detail>(`/admin/posts/${id}/draft`, { method: 'DELETE' })); setSaved(''); } catch (e) { toast(errorText(e), 'error'); }
  };

  const tool = 'inline-flex size-9 items-center justify-center rounded-md text-text-body hover:bg-bg-alt max-md:size-10';
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <PageHeader title={doc.title || 'Стаття'} back="/blog" sub={<span className="inline-flex items-center gap-2"><Badge s={meta.status} />{meta.status === 'SCHEDULED' && meta.scheduledFor ? dateTime(meta.scheduledFor) : null}<span aria-live="polite">{saved}</span></span>}
        actions={can('blog.publish') && (
          <>
            {live ? <PrimaryButton disabled={!meta.hasDraft || pending || blocking.length > 0} onClick={() => void publish(null)}>Опублікувати зміни</PrimaryButton>
              : <PrimaryButton disabled={pending || blocking.length > 0} onClick={() => void publish(null)}>Опублікувати</PrimaryButton>}
            <DotsMenu items={[
              { label: 'Подивитись на сайті', icon: ExternalLink, hidden: !live, onClick: () => window.open(`${SITE}/uk/zhurnal/${meta.slug}`, '_blank', 'noopener') },
              { label: 'Запланувати на дату', icon: CalendarClock, hidden: live || !can('blog.schedule'), onClick: () => setScheduling(true) },
              { label: 'Скасувати неопубліковані зміни', icon: Undo2, hidden: !live || !meta.hasDraft, onClick: () => void discard() },
              { label: meta.status === 'SCHEDULED' ? 'Скасувати план' : 'Зняти з сайту', icon: EyeOff, danger: true, hidden: !live && meta.status !== 'SCHEDULED', onClick: () => void unpublish() },
            ]} />
          </>
        )} />
      {live && meta.hasDraft && <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-body-sm text-text-body">Є зміни, яких ще не видно на сайті. Читачі бачать попередній текст, доки ви не натиснете «Опублікувати зміни».</p>}
      {lints.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-border-hairline bg-bg-surface p-3 text-body-sm">
          {lints.map((l, i) => <li key={i} className={l.level === 'block' ? 'text-danger' : 'text-warning'}>{l.level === 'block' ? 'Щоб опублікувати: ' : 'Зверніть увагу: '}{l.message}</li>)}
        </ul>
      )}

      <input value={doc.title} onChange={(e) => set({ title: e.target.value })} aria-label="Заголовок" maxLength={160} className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-h2 font-semibold text-text-primary outline-none hover:border-border-hairline focus:border-border-control" />
      <label className={labelCls}>Коротко — 2–4 рядки з головним, кожен з нового рядка (стоїть першим у статті)
        <textarea value={doc.facts} onChange={(e) => set({ facts: e.target.value })} rows={3} className={inputCls} placeholder={'Ліжник періть у холодній воді\nСушіть розправленим, не на батареї'} />
      </label>

      <div className="overflow-hidden rounded-xl border border-border-control bg-bg-input">
        <div role="toolbar" aria-label="Оформлення тексту" className="flex flex-wrap items-center gap-0.5 border-b border-border-hairline bg-bg-surface p-1">
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={heading} title="Підзаголовок" aria-label="Підзаголовок"><Heading2 size={18} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('bold')} title="Жирний" aria-label="Жирний"><Bold size={17} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('italic')} title="Курсив" aria-label="Курсив"><Italic size={17} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('insertUnorderedList')} title="Список" aria-label="Список"><List size={18} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('insertOrderedList')} title="Нумерований список" aria-label="Нумерований список"><ListOrdered size={18} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('formatBlock', 'BLOCKQUOTE')} title="Цитата" aria-label="Цитата"><Quote size={17} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={link} title="Посилання" aria-label="Посилання"><Link2 size={17} /></button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('insertHorizontalRule')} title="Розділювач" aria-label="Розділювач"><Minus size={18} /></button>
          <button type="button" className={`${tool} w-auto gap-1 px-2 text-body-sm`} onMouseDown={(e) => e.preventDefault()} onClick={() => setPicking(true)} title="Вставити картку товару"><Package size={17} /> Товар</button>
        </div>
        <div ref={ed} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Текст статті"
          onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
          onInput={() => setText(htmlToBlocks(ed.current!))}
          onPaste={(e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); }}
          className="min-h-72 px-4 py-3 text-body text-text-primary outline-none [&_a]:text-accent-text [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-h3 [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-border-control [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_.vk-chip]:my-2 [&_.vk-chip]:rounded-lg [&_.vk-chip]:border [&_.vk-chip]:border-dashed [&_.vk-chip]:border-accent [&_.vk-chip]:bg-accent/5 [&_.vk-chip]:px-3 [&_.vk-chip]:py-2 [&_.vk-chip]:text-body-sm [&_.vk-chip]:text-accent-text" />
      </div>
      <p className="text-caption text-text-muted">Порада: на телефоні текст можна надиктувати — натисніть мікрофон на клавіатурі. Зберігається само.</p>

      <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="self-start text-body-sm text-accent-text underline">{more ? 'Сховати додаткове' : 'Додатково: опис, теми, питання, Google'}</button>
      {more && (
        <div className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4">
          <label className={labelCls}>Короткий опис для списку статей (порожньо — візьмемо перші речення)
            <textarea value={doc.excerpt} onChange={(e) => set({ excerpt: e.target.value })} rows={2} maxLength={400} className={inputCls} />
          </label>
          {!!tags?.items.length && (
            <div className="flex flex-col gap-1.5"><span className="text-body-sm text-text-muted">Теми</span>
              <div className="flex flex-wrap gap-1.5">
                {tags.items.map((t) => { const on = doc.tagIds.includes(t.id); return <button key={t.id} type="button" aria-pressed={on} onClick={() => set({ tagIds: on ? doc.tagIds.filter((x) => x !== t.id) : [...doc.tagIds, t.id] })} className={`rounded-full border px-3 py-1 text-body-sm ${on ? 'border-accent bg-accent text-white' : 'border-border-control text-text-primary'}`}>{t.name}</button>; })}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2"><span className="text-body-sm text-text-muted">Питання й відповіді (у кінці статті)</span>
            {doc.faq.map((x, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-lg bg-bg-alt p-2">
                <input value={x.q} onChange={(e) => set({ faq: doc.faq.map((y, n) => (n === i ? { ...y, q: e.target.value } : y)) })} placeholder="Питання" className={inputCls} />
                <textarea value={x.a} onChange={(e) => set({ faq: doc.faq.map((y, n) => (n === i ? { ...y, a: e.target.value } : y)) })} rows={2} placeholder="Відповідь" className={inputCls} />
              </div>
            ))}
            {doc.faq.length < 12 && <button type="button" onClick={() => set({ faq: [...doc.faq, { q: '', a: '' }] })} className="self-start text-body-sm text-accent-text underline">+ питання</button>}
          </div>
          <label className={labelCls}>Заголовок для Google (порожньо — заголовок статті)<input value={doc.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} maxLength={160} className={inputCls} /></label>
          <label className={labelCls}>Опис для Google (порожньо — короткий опис)<input value={doc.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} maxLength={320} className={inputCls} /></label>
        </div>
      )}
      {picking && <ProductPick onClose={() => setPicking(false)} onPick={(x) => {
        setPicking(false);
        ed.current?.focus();
        document.execCommand('insertHTML', false, `${chip({ type: 'productEmbed', productId: x.id }, `Картка товару: ${x.name}`)}<p><br></p>`);
        setText(htmlToBlocks(ed.current!));
      }} />}
      {scheduling && <Schedule onClose={() => setScheduling(false)} onPick={(at) => void publish(at)} />}
    </div>
  );
}

function ProductPick({ onClose, onPick }: { onClose: () => void; onPick: (p: { id: string; name: string }) => void }) {
  const [q, setQ] = useState('');
  const { data } = useQuery({ queryKey: ['blog-products', q], enabled: q.trim().length >= 2, queryFn: () => api<{ items: Array<{ id: string; name: string; sku: string }> }>(`/admin/products?tab=active&perPage=20&q=${encodeURIComponent(q.trim())}`) });
  return (
    <Sheet title="Картка товару в статті" onClose={onClose}>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Назва або артикул товару на сайті" className={inputCls} />
      <ul className="mt-2 flex flex-col">
        {data?.items.map((x) => <li key={x.id}><button type="button" onClick={() => onPick(x)} className="w-full rounded-lg px-3 py-2.5 text-left text-body hover:bg-bg-alt">{x.name} <span className="text-text-muted">{x.sku}</span></button></li>)}
        {data && !data.items.length && <li className="px-3 py-2 text-body-sm text-text-muted">Нічого не знайшлося серед товарів на сайті.</li>}
      </ul>
      <p className="mt-2 text-caption text-text-muted">Не більше трьох товарів у статті, і не на самому початку.</p>
    </Sheet>
  );
}

function Schedule({ onClose, onPick }: { onClose: () => void; onPick: (iso: string) => void }) {
  const [when, setWhen] = useState('');
  return (
    <Sheet title="Запланувати публікацію" onClose={onClose}>
      <label className={labelCls}>Коли опублікувати<input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} /></label>
      <PrimaryButton className="mt-4 w-full" disabled={!when || new Date(when).getTime() < Date.now()} onClick={() => onPick(new Date(when).toISOString())}>Запланувати</PrimaryButton>
    </Sheet>
  );
}
