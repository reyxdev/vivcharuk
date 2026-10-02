import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Mail, Paperclip, RefreshCw, Search, Settings2, ShieldAlert, Star } from 'lucide-react';
import { api, post } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { FilterButton, FilterChips, type FilterGroup, type FilterState } from '@/components/Filters';
import { EmptyState, Hint, IconCircle, Sheet, SkeletonRows, Tabs, useStored } from '@/components/ui';
import { STATUS_TITLE, type MailSettings, type SyncStatus, type ThreadList } from './api';
import { labelClass, ThreadView } from './ThreadView';
import { MailSettingsPanel } from './MailSettingsPanel';

// «Пошта» (round 19 D1; round 20 #167–170, #278–280): two columns (list | letter). Tabs Нові ·
// Відповіли · Усі; Закриті, Спам, Кошик and the labels live under «Фільтри».

const SKY = '#5A8AAF';
type Tab = 'inbox' | 'replied' | 'all';
const FOLDERS: Record<string, string> = { closed: 'Закриті', spam: 'Спам', bin: 'Кошик' };
const EMPTY: Record<string, string> = {
  inbox: 'Нових листів немає — на все відповіли.', replied: 'Тут будуть розмови, на які ви відповіли.', all: 'Листів ще немає.',
  closed: 'Закритих розмов немає.', spam: 'Спаму немає.', bin: 'Кошик порожній.',
};

function SyncLine({ s }: { s: SyncStatus | undefined }) {
  const qc = useQueryClient();
  const sync = useMutation({ mutationFn: () => post('/admin/mail/sync'), onSuccess: () => qc.invalidateQueries({ queryKey: ['mail'] }) });
  if (!s) return null;
  if (!s.enabled) return <p className="text-caption text-text-muted">Скриньку ще не підключено: на сервері немає пароля info@ (MAILBOX_PASSWORD).</p>;
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-caption text-text-muted">
      <span className={`size-2 rounded-full ${s.connected ? 'bg-success' : 'bg-warning'}`} aria-hidden="true" />
      <span>{s.connected ? 'Скринька підключена' : 'Немає з\'єднання зі скринькою'}</span>
      {s.importing && <span>· завантажую старі листи…</span>}
      {s.lastSyncAt && <span>· перевірено {dateTime(s.lastSyncAt)}</span>}
      {s.lastError && <span className="text-warning" title={s.lastError}>· помилка</span>}
      <button type="button" onClick={() => sync.mutate()} disabled={sync.isPending} title="Перевірити пошту зараз" aria-label="Перевірити пошту зараз" className="rounded-md p-1 hover:bg-bg-alt">
        <RefreshCw size={14} className={sync.isPending ? 'animate-spin' : ''} />
      </button>
    </p>
  );
}

export function MailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data: me } = useMe();
  const [storedTab, setStoredTab] = useStored<Tab>('mail.tab', 'inbox');
  const view = params.get('view') ?? storedTab;
  const label = params.get('label') ?? '';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setParams((p) => { if (q) p.set('q', q); else p.delete('q'); return p; }, { replace: true }), 350); return () => clearTimeout(t); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const qs = new URLSearchParams({ view, ...(label ? { label } : {}), ...(params.get('q') ? { q: params.get('q')! } : {}) });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['mail', qs.toString()], initialPageParam: 1, refetchInterval: 20_000, placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) => api<ThreadList>(`/admin/mail/threads?${qs}&page=${pageParam}`),
    getNextPageParam: (last, all) => (all.length * last.pageSize < last.total ? all.length + 1 : undefined),
  });
  const { data: settings } = useQuery({ queryKey: ['mail-settings'], queryFn: () => api<MailSettings>('/admin/mail/settings') });
  const first = data?.pages[0];
  const items = data?.pages.flatMap((p) => p.items);
  const labelOf = (k: string) => settings?.labels.find((l) => l.key === k);

  // Load more on scroll (#28).
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasNextPage || !sentinel.current) return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && void fetchNextPage(), { rootMargin: '300px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage, items?.length]);

  const setTab = (k: Tab) => { setStoredTab(k); setParams((p) => { p.set('view', k); return p; }); };
  const groups: FilterGroup[] = [
    { key: 'folder', label: 'Папка', kind: 'options', single: true, options: Object.entries(FOLDERS).map(([value, l]) => ({ value, label: l })) },
    ...(settings?.labels.length ? [{ key: 'label', label: 'Мітка', kind: 'options' as const, single: true, options: settings.labels.map((l) => ({ value: l.key, label: l.title })) }] : []),
  ];
  const filters: FilterState = { ...(FOLDERS[view] ? { folder: [view] } : {}), ...(label ? { label: [label] } : {}) };
  const applyFilters = (s: FilterState) => setParams((p) => {
    const folder = (s.folder as string[] | undefined)?.[0];
    const lab = (s.label as string[] | undefined)?.[0];
    p.set('view', folder ?? storedTab);
    if (lab) p.set('label', lab); else p.delete('label');
    return p;
  });
  const open = (tid: string) => nav({ pathname: `/mail/${tid}`, search: params.toString() });
  const back = () => nav({ pathname: '/mail', search: params.toString() });

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex flex-wrap items-center gap-3 ${id ? 'max-lg:hidden' : ''}`}>
        <IconCircle icon={Mail} color={SKY} />
        <div className="min-w-0">
          <h1 className="text-h2 font-semibold leading-tight text-text-primary">Пошта</h1>
          <p className="text-caption text-text-muted">info@vivcharuk.com</p>
        </div>
        <Hint text="Листи зі скриньки info@: відповідайте тут — лист піде від info@vivcharuk.com." />
        {me?.permissions.includes('mail.manage_mailboxes') && (
          <button type="button" onClick={() => setSettingsOpen(true)} title="Шаблони, мітки, автовідповідь" aria-label="Шаблони, мітки, автовідповідь"
            className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-control bg-bg-surface px-3 text-body-sm hover:bg-bg-alt">
            <Settings2 size={17} strokeWidth={1.75} /><span className="max-md:hidden">Налаштування</span>
          </button>
        )}
      </div>
      {settingsOpen && settings && <Sheet title="Шаблони, мітки, автовідповідь" wide onClose={() => setSettingsOpen(false)}><MailSettingsPanel settings={settings} onDone={() => setSettingsOpen(false)} /></Sheet>}

      <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <section className={`flex min-w-0 flex-col gap-2.5 ${id ? 'max-lg:hidden' : ''}`} aria-label="Листи">
          <SyncLine s={first?.sync} />
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Тема, текст, ім'я, адреса, № замовлення" aria-label="Пошук листів"
                className="min-h-10 w-full rounded-lg border border-border-control bg-bg-input pl-9 pr-3 text-body-sm max-md:min-h-11" />
            </label>
            <FilterButton groups={groups} value={filters} onApply={applyFilters} />
          </div>
          <Tabs<Tab> value={view as Tab} onChange={setTab} tabs={[
            { key: 'inbox', label: 'Нові', count: first?.counts.OPEN, strong: true },
            { key: 'replied', label: 'Відповіли', count: first?.counts.WAITING },
            { key: 'all', label: 'Усі' },
          ]} />
          <FilterChips groups={groups} value={filters} onChange={applyFilters} />
          {!items && <SkeletonRows />}
          {items && !items.length && <EmptyState icon={Mail} text={EMPTY[view] ?? EMPTY.all!} />}
          <ul className="flex flex-col gap-1">
            {items?.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => open(t.id)} aria-current={t.id === id}
                  className={`flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition hover:bg-bg-alt max-md:py-2.5 ${t.id === id ? 'border-accent bg-bg-alt' : t.overdue ? 'border-warning bg-bg-surface' : 'border-border-hairline bg-bg-surface'}`}>
                  <span className="flex items-center gap-1.5">
                    {t.unread && <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="Непрочитане" />}
                    {t.vip && <Star size={13} className="shrink-0 fill-[#B08D4F] text-[#B08D4F]" aria-label="Оптовик" />}
                    <span className={`truncate text-body-sm ${t.unread ? 'font-semibold text-text-primary' : 'text-text-body'}`}>{t.counterpartName || t.counterpartEmail}</span>
                    <span className="ml-auto shrink-0 text-caption text-text-muted">{dateTime(t.lastMessageAt)}</span>
                  </span>
                  <span className={`truncate text-body-sm text-text-primary ${t.unread ? 'font-semibold' : ''}`}>{t.subject}</span>
                  <span className="line-clamp-1 text-caption text-text-muted">{t.lastFromUs ? 'Ви: ' : ''}{t.preview}</span>
                  {(t.overdue || t.suspicious || t.hasAttachments || t.orderNumber || t.labels.length > 0 || view === 'all') && (
                    <span className="flex flex-wrap items-center gap-1.5 text-caption text-text-muted">
                      {t.overdue && <span className="inline-flex items-center gap-0.5 text-warning" title="Без відповіді понад робочий день"><Clock size={12} /> чекає</span>}
                      {t.suspicious && <span className="inline-flex items-center gap-0.5 text-warning"><ShieldAlert size={12} /> підозрілий</span>}
                      {t.hasAttachments && <Paperclip size={12} aria-label="Є вкладення" />}
                      {t.orderNumber && <span>{t.orderNumber}</span>}
                      {view === 'all' && <span>{STATUS_TITLE[t.status]}</span>}
                      {t.labels.map((k) => labelOf(k) && <span key={k} className={`rounded-full border px-1.5 ${labelClass(labelOf(k)!.color)}`}>{labelOf(k)!.title}</span>)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {isFetchingNextPage && <SkeletonRows rows={2} />}
          <div ref={sentinel} />
        </section>

        <section className={`min-w-0 ${id ? '' : 'max-lg:hidden'}`} aria-label="Розмова">
          {id ? (
            <div className="flex flex-col gap-3">
              <button type="button" onClick={back} className="self-start text-body-sm text-accent-text max-md:hidden lg:hidden">← До листів</button>
              <ThreadView key={id} id={id} settings={settings} onBack={back} onGone={back} />
            </div>
          ) : <EmptyState icon={Mail} text="Оберіть лист ліворуч." />}
        </section>
      </div>
    </div>
  );
}
