import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Download, MailPlus, Search, Send } from 'lucide-react';
import { api, download, post } from '@/lib/api';
import { date } from '@/lib/format';
import { DataTable, type Column } from '@/components/DataTable';
import { EmptyState, GhostButton, PageHeader, PrimaryButton, Sheet, Tabs, useStored, useToast } from '@/components/ui';
import { errorText, inputCls, labelCls } from '@/features/settings/parts';

type Status = 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED' | 'BOUNCED';
interface Sub { id: string; email: string; status: Status; source: string; consentText: string | null; consentAt: string | null; confirmedAt: string | null; unsubscribedAt: string | null; createdAt: string }
interface Page { counts: Record<Status, number>; isOwner: boolean; items: Sub[]; nextCursor: string | null }

const STATUS: Record<Status, [string, string]> = {
  CONFIRMED: ['Підписаний', 'bg-success/15 text-success'], PENDING: ['Чекає підтвердження', 'bg-warning/15 text-warning'],
  UNSUBSCRIBED: ['Не писати', 'bg-bg-alt text-text-muted'], BOUNCED: ['Адреса не працює', 'bg-danger/15 text-danger'],
};
const Badge = ({ s }: { s: Status }) => <span className={`inline-flex rounded-full px-2 py-0.5 text-caption font-medium ${STATUS[s][1]}`}>{STATUS[s][0]}</span>;

// Round 19 D2: only people who agreed get letters. Counts, the list, a manual add with where consent
// was given (the person still confirms from a letter), CSV for the owner. Sending comes later.
export function NewsletterPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useStored<Status | 'all'>('newsletter.tab', 'CONFIRMED');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const list = useInfiniteQuery({
    queryKey: ['subscribers', tab, q], initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams();
      if (tab !== 'all') qs.set('status', tab);
      if (q.trim()) qs.set('q', q.trim());
      if (pageParam) qs.set('cursor', pageParam);
      return api<Page>(`/admin/subscribers?${qs}`);
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const first = list.data?.pages[0];
  const c = first?.counts;
  const rows = list.data?.pages.flatMap((p) => p.items);
  const columns: Array<Column<Sub>> = [
    { key: 'email', header: 'Пошта', cell: (s) => <span className="font-medium text-text-primary">{s.email}</span> },
    { key: 'status', header: 'Стан', cell: (s) => <Badge s={s.status} /> },
    { key: 'source', header: 'Згода', cell: (s) => <span className="text-text-body">{s.source === 'checkout' ? 'галочка при замовленні' : s.consentText ?? 'додано вручну'}</span> },
    { key: 'date', header: 'Коли', cell: (s) => date(s.confirmedAt ?? s.consentAt ?? s.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Розсилка" actions={first?.isOwner && (
        <>
          <GhostButton icon={Download} onClick={() => void download('/admin/subscribers/export', 'pidpysnyky.csv').catch(() => toast('Не вдалося завантажити файл', 'error'))}>CSV</GhostButton>
          <PrimaryButton icon={MailPlus} onClick={() => setAdding(true)}>Додати</PrimaryButton>
        </>
      )} />
      <p className="flex max-w-3xl items-start gap-2 rounded-xl border border-border-hairline bg-bg-surface p-3 text-body-sm text-text-body">
        <Send size={18} className="mt-0.5 shrink-0 text-info" />
        <span>Листи отримують лише ті, хто сам погодився й підтвердив це з листа. Надсилати розсилки звідси можна буде трохи згодом — поки тут список підписників.</span>
      </p>
      <Tabs<Status | 'all'> value={tab} onChange={setTab} tabs={[
        { key: 'CONFIRMED', label: 'Підписані', count: c?.CONFIRMED }, { key: 'PENDING', label: 'Чекають підтвердження', count: c?.PENDING },
        { key: 'UNSUBSCRIBED', label: 'Не писати', count: c?.UNSUBSCRIBED }, { key: 'BOUNCED', label: 'Не працюють', count: c?.BOUNCED }, { key: 'all', label: 'Усі' },
      ]} />
      <label className="relative block max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за поштою" className="w-full rounded-lg border border-border-control bg-bg-input py-2 pl-9 pr-3 text-body max-md:py-2.5" />
      </label>
      <DataTable rows={rows} columns={columns} hasMore={list.hasNextPage} loading={list.isFetchingNextPage} onLoadMore={() => void list.fetchNextPage()}
        card={(s) => <div className="flex flex-col gap-1"><span className="font-medium text-text-primary">{s.email}</span><span className="flex flex-wrap items-center gap-2 text-caption text-text-muted"><Badge s={s.status} />{s.source === 'checkout' ? 'при замовленні' : 'вручну'} · {date(s.confirmedAt ?? s.consentAt ?? s.createdAt)}</span></div>}
        empty={<EmptyState icon={Send} text={q ? 'Нікого не знайшлося.' : 'Тут поки порожньо. Підписники з\'являються, коли покупець ставить галочку при замовленні й підтверджує її з листа.'} />} />
      {adding && <AddSheet onClose={() => setAdding(false)} onDone={async () => { setAdding(false); await qc.invalidateQueries({ queryKey: ['subscribers'] }); toast('Надіслали лист для підтвердження. Підписка почне діяти після натискання в листі.'); }} />}
    </div>
  );
}

function AddSheet({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<void> }) {
  const toast = useToast();
  const [f, setF] = useState({ email: '', note: '' });
  const [busy, setBusy] = useState(false);
  return (
    <Sheet title="Додати підписника" onClose={onClose}>
      <form className="flex flex-col gap-3" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try { await post('/admin/subscribers', { email: f.email.trim(), note: f.note.trim() }); await onDone(); }
        catch (x) { toast(errorText(x, { ALREADY_SUBSCRIBED: 'Ця адреса вже підписана.', invalid_string: 'Перевірте адресу пошти.', invalid_format: 'Перевірте адресу пошти.' }), 'error'); }
        finally { setBusy(false); }
      }}>
        <label className={labelCls}>Пошта<input type="email" autoFocus required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} /></label>
        <label className={labelCls}>Де людина погодилась на листи<input required minLength={3} maxLength={300} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Напр.: попросила в магазині 12 жовтня" className={inputCls} /></label>
        <p className="text-body-sm text-text-muted">Додавайте лише тих, хто сам попросив. Людина отримає лист і підпишеться, лише коли натисне «Так, підписатися».</p>
        <PrimaryButton type="submit" disabled={busy}>Додати й надіслати лист</PrimaryButton>
      </form>
    </Sheet>
  );
}
