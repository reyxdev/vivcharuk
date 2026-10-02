import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Eye, EyeOff, FileUp, MessageSquareReply, MessageSquareText, Plus, Star, Trash2, X } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { date, dateTime } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { DotsMenu, EmptyState, GhostButton, Hint, IconCircle, PrimaryButton, Sheet, SkeletonRows, Tabs, useConfirm, useStored, useToast } from '@/components/ui';
import { PromImport } from './PromImport';

// Відгуки (round 20 #141–142, #224): a new review shows on the site only after Іван checks it.
// Опублікувати · Сховати · a public reply from Вівчарик, with 3–4 ready short replies (editable).

const ARNIKA = '#E0B33A';
type Tab = 'PENDING' | 'APPROVED' | 'HIDDEN';
interface Row {
  id: string; authorName: string; authorEmail: string | null; rating: number; title: string | null; body: string; status: Tab; source: 'SITE' | 'PROM';
  createdAt: string; reply: string | null; repliedAt: string | null; repliedBy: string | null; isVerifiedPurchase: boolean;
  product: { sku: string; name: string; slug: string | null } | null; photos: Array<{ id: string; thumb: string }>;
}
interface List { items: Row[]; total: number; pageSize: number; counts: Record<Tab, number> }

const EMPTY: Record<Tab, string> = {
  PENDING: 'Нових відгуків немає — усе перевірено.',
  APPROVED: 'Опублікованих відгуків ще немає.',
  HIDDEN: 'Схованих відгуків немає.',
};

function Stars({ n }: { n: number }) {
  return <span className="whitespace-nowrap text-body" style={{ color: ARNIKA }} aria-label={`${n} з 5`}>{'★'.repeat(n)}<span className="text-text-faint">{'★'.repeat(5 - n)}</span></span>;
}

function ReplyEditor({ r, templates, onDone }: { r: Row; templates: string[]; onDone: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [text, setText] = useState(r.reply ?? '');
  const save = useMutation({
    mutationFn: () => post(`/admin/reviews/${r.id}/reply`, { text: text.trim() }),
    onSuccess: async () => { toast('Відповідь збережено'); await qc.invalidateQueries({ queryKey: ['reviews'] }); onDone(); },
    onError: (e) => toast(messageFor(e instanceof ApiError ? e.code : ''), 'error'),
  });
  return (
    <div className="flex flex-col gap-2">
      {!!templates.length && (
        <div className="flex flex-wrap gap-1.5" aria-label="Готові відповіді">
          {templates.map((t) => (
            <button key={t} type="button" onClick={() => setText(t)} title={t} className="max-w-full truncate rounded-full border border-border-control px-3 py-1 text-caption text-text-body hover:bg-bg-alt max-md:py-2">{t}</button>
          ))}
        </div>
      )}
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} autoFocus aria-label="Відповідь Вівчарика"
        placeholder="Відповідь від Вівчарика — її побачать на сайті" className="rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body-sm text-text-primary" />
      <div className="flex justify-end gap-2">
        <GhostButton onClick={onDone}>Скасувати</GhostButton>
        <PrimaryButton disabled={!text.trim() || save.isPending} onClick={() => save.mutate()}>Зберегти відповідь</PrimaryButton>
      </div>
    </div>
  );
}

function Card({ r, templates }: { r: Row; templates: string[] }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const [replying, setReplying] = useState(false);
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['reviews'] }), qc.invalidateQueries({ queryKey: ['counters'] })]);
  const move = useMutation({
    mutationFn: (status: 'APPROVED' | 'HIDDEN') => post(`/admin/reviews/${r.id}/status`, { status }),
    onSuccess: (_d, s) => { toast(s === 'APPROVED' ? 'Відгук опубліковано' : 'Відгук сховано'); return refresh(); },
    onError: (e) => toast(messageFor(e instanceof ApiError ? e.code : ''), 'error'),
  });
  const dropReply = useMutation({ mutationFn: () => post(`/admin/reviews/${r.id}/reply`, { text: '' }), onSuccess: refresh });

  const publish = async () => { if (await confirm({ title: 'Опублікувати відгук?', text: 'Його побачать усі на сайті.', ok: 'Опублікувати' })) move.mutate('APPROVED'); };
  const hide = async () => { if (await confirm({ title: 'Сховати відгук?', text: 'На сайті його не буде видно; повернути можна будь-коли.', ok: 'Сховати' })) move.mutate('HIDDEN'); };

  return (
    <article className="flex flex-col gap-2.5 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars n={r.rating} />
        <span className="text-body font-semibold text-text-primary">{r.authorName}</span>
        {r.isVerifiedPurchase && <span title="Купував у нас" className="inline-flex items-center gap-1 text-caption text-success"><BadgeCheck size={14} /> покупець</span>}
        {r.source === 'PROM' && <span className="rounded-full border border-border-control px-2 py-0.5 text-caption text-text-muted">Prom.ua · перенесено</span>}
        <span className="ml-auto text-caption text-text-muted">{date(r.createdAt)}</span>
      </header>
      <p className="text-body-sm text-text-muted">{r.product ? r.product.name : 'Відгук про магазин'}{r.authorEmail ? ` · ${r.authorEmail}` : ''}</p>
      {r.title && <p className="text-body font-semibold text-text-primary">{r.title}</p>}
      <p className="whitespace-pre-line text-body text-text-body">{r.body}</p>
      {!!r.photos.length && (
        <div className="flex flex-wrap gap-2">
          {r.photos.map((p) => <a key={p.id} href={p.thumb} target="_blank" rel="noopener noreferrer"><img src={p.thumb} alt="Фото до відгуку" loading="lazy" className="size-20 rounded-lg object-cover" /></a>)}
        </div>
      )}

      {r.reply && !replying && (
        <div className="rounded-lg border-l-4 bg-bg-alt px-3 py-2 text-body-sm" style={{ borderColor: ARNIKA }}>
          <span className="flex items-center gap-2 text-caption text-text-muted">
            <span className="flex-1">Відповідь Вівчарика{r.repliedBy ? ` · ${r.repliedBy}` : ''}{r.repliedAt ? ` · ${dateTime(r.repliedAt)}` : ''}</span>
            {can('reviews.reply') && <DotsMenu label="Дії з відповіддю" items={[
              { label: 'Змінити', icon: MessageSquareText, onClick: () => setReplying(true) },
              { label: 'Видалити відповідь', icon: Trash2, danger: true, onClick: () => void confirm({ title: 'Видалити відповідь?', text: 'Вона зникне з сайту.', ok: 'Видалити', danger: true }).then((ok) => ok && dropReply.mutate()) },
            ]} />}
          </span>
          <p className="whitespace-pre-line text-text-body">{r.reply}</p>
        </div>
      )}
      {replying && <ReplyEditor r={r} templates={templates} onDone={() => setReplying(false)} />}

      {!replying && (
        <div className="flex flex-wrap gap-2 pt-1">
          {can('reviews.moderate') && r.status !== 'APPROVED' && <PrimaryButton icon={Eye} disabled={move.isPending} onClick={() => void publish()}>Опублікувати</PrimaryButton>}
          {can('reviews.moderate') && r.status !== 'HIDDEN' && <GhostButton icon={EyeOff} disabled={move.isPending} onClick={() => void hide()}>Сховати</GhostButton>}
          {can('reviews.reply') && !r.reply && <GhostButton icon={MessageSquareReply} onClick={() => setReplying(true)}>Відповісти публічно</GhostButton>}
        </div>
      )}
    </article>
  );
}

function TemplatesSheet({ initial, onClose }: { initial: string[]; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [list, setList] = useState(initial);
  const save = useMutation({
    mutationFn: () => api('/admin/reviews/reply-templates', { method: 'PUT', body: JSON.stringify({ templates: list.map((t) => t.trim()).filter(Boolean) }) }),
    onSuccess: async () => { toast('Збережено'); await qc.invalidateQueries({ queryKey: ['review-templates'] }); onClose(); },
    onError: () => toast('Не вдалося зберегти. Спробуйте ще раз.', 'error'),
  });
  return (
    <Sheet title="Готові відповіді" onClose={onClose}>
      <p className="mb-3 text-body-sm text-text-muted">Короткі відповіді, які можна вставити одним дотиком і за потреби дописати.</p>
      <div className="flex flex-col gap-2">
        {list.map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea value={t} rows={2} maxLength={400} aria-label={`Відповідь ${i + 1}`} onChange={(e) => setList((x) => x.map((y, j) => (j === i ? e.target.value : y)))}
              className="flex-1 rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body-sm text-text-primary" />
            <button type="button" aria-label="Прибрати" title="Прибрати" onClick={() => setList((x) => x.filter((_, j) => j !== i))} className="rounded-md p-2 text-text-muted hover:bg-bg-alt"><X size={16} /></button>
          </div>
        ))}
        {list.length < 6 && <GhostButton icon={Plus} className="self-start" onClick={() => setList((x) => [...x, ''])}>Додати</GhostButton>}
      </div>
      <div className="mt-4 flex justify-end gap-2"><GhostButton onClick={onClose}>Скасувати</GhostButton><PrimaryButton disabled={save.isPending} onClick={() => save.mutate()}>Зберегти</PrimaryButton></div>
    </Sheet>
  );
}

export function ReviewsPage() {
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const [tab, setTab] = useStored<Tab>('reviews.tab', 'PENDING');
  const [sheet, setSheet] = useState<'' | 'templates' | 'import'>('');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
    queryKey: ['reviews', tab], initialPageParam: 1,
    queryFn: ({ pageParam }) => api<List>(`/admin/reviews?status=${tab}&page=${pageParam}`),
    getNextPageParam: (last, all) => (all.length * last.pageSize < last.total ? all.length + 1 : undefined),
  });
  const { data: tpl } = useQuery({ queryKey: ['review-templates'], queryFn: () => api<{ templates: string[] }>('/admin/reviews/reply-templates') });
  const rows = data?.pages.flatMap((p) => p.items);
  const counts = data?.pages[0]?.counts;

  // Load more on scroll (#28).
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasNextPage || !sentinel.current) return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && void fetchNextPage(), { rootMargin: '400px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage, rows?.length]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <IconCircle icon={Star} color={ARNIKA} ink="#1C1B18" />
        <h1 className="text-h2 font-semibold text-text-primary">Відгуки</h1>
        <Hint text="Новий відгук з'являється на сайті лише після того, як ви його опублікуєте." />
        <div className="ml-auto">
          <DotsMenu label="Ще дії" items={[
            { label: 'Готові відповіді', icon: MessageSquareText, onClick: () => setSheet('templates'), hidden: !can('reviews.moderate') },
            { label: 'Імпорт з Prom.ua', icon: FileUp, onClick: () => setSheet('import'), hidden: !can('reviews.moderate') },
          ]} />
        </div>
      </div>
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[
        { key: 'PENDING', label: 'На перевірці', count: counts?.PENDING, strong: true },
        { key: 'APPROVED', label: 'Опубліковані', count: counts?.APPROVED },
        { key: 'HIDDEN', label: 'Сховані', count: counts?.HIDDEN },
      ]} />
      {isPending && <SkeletonRows rows={4} />}
      {rows && !rows.length && <EmptyState icon={Star} text={EMPTY[tab]} action={tab !== 'APPROVED' ? <button type="button" onClick={() => setTab('APPROVED')} className="text-body-sm text-accent-text underline">Подивитися опубліковані</button> : undefined} />}
      <div className="grid items-start gap-3 xl:grid-cols-2">{rows?.map((r) => <Card key={r.id} r={r} templates={tpl?.templates ?? []} />)}</div>
      {isFetchingNextPage && <SkeletonRows rows={2} />}
      <div ref={sentinel} />
      {sheet === 'templates' && <TemplatesSheet initial={tpl?.templates ?? []} onClose={() => setSheet('')} />}
      {sheet === 'import' && <Sheet title="Імпорт відгуків з Prom.ua" wide onClose={() => setSheet('')}><PromImport /></Sheet>}
    </div>
  );
}
