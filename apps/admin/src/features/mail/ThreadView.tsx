import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Ban, CheckCircle2, Download, Forward, Inbox, MailOpen, PanelRight, Paperclip, Printer, Reply, RotateCcw, ShieldAlert,
  ShieldCheck, Star, Trash2, TriangleAlert, UserRound,
} from 'lucide-react';
import { api, post } from '@/lib/api';
import { dateTime, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { Badge, OrderStatus } from '@/components/status';
import { DotsMenu, SkeletonRows, useConfirm, useStored, useToast } from '@/components/ui';
import { attachmentUrl, kb, patchThread, STATUS_TITLE, type Attachment, type MailSettings, type Message, type Status, type Thread } from './api';
import { Composer } from './Composer';
import { MessageFrame } from './MessageFrame';

// One conversation (round 19 D1; round 20 #169–170, #278–279): icon actions with hints + «⋯»; labels,
// the customer's orders and notes in a narrow collapsible panel; on the phone the letter fills the
// screen with «←» and «Відповісти» at the bottom opens a full-screen editor.

const LABEL_COLOR: Record<string, string> = {
  green: 'border-success text-success', blue: 'border-info text-info', amber: 'border-warning text-warning',
  red: 'border-danger text-danger', violet: 'border-accent text-accent-text',
};
export const labelClass = (color: string) => LABEL_COLOR[color] ?? 'border-border-control text-text-body';
export const STATUS_COLOR: Record<Status, string> = { OPEN: '#5A8AAF', WAITING: '#3C8A65', CLOSED: '#7B776E', SPAM: '#C0533F' };

type Confirm = ReturnType<typeof useConfirm>;
async function openAttachment(a: Attachment, download: boolean, confirm: Confirm) {
  if (a.riskFlag && !(await confirm({
    title: 'Файл може бути небезпечним', danger: true, ok: 'Завантажити',
    text: `«${a.filename}» — ${a.riskFlag === 'executable' ? 'програма' : a.riskFlag === 'macro' ? 'документ з макросами' : 'архів'}. Відкривайте, лише якщо чекали його від цього відправника.`,
  }))) return;
  const url = await attachmentUrl(a.id);
  if (download || !a.viewable) Object.assign(document.createElement('a'), { href: url, download: a.filename }).click();
  else window.open(url, '_blank', 'noopener');
}

function IconBtn({ icon: Icon, label, onClick, danger }: { icon: typeof Reply; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={`inline-flex size-9 items-center justify-center rounded-lg hover:bg-bg-alt max-md:size-11 ${danger ? 'text-danger' : 'text-text-body'}`}>
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}

function MessageCard({ m, threadId, settings, canReply }: { m: Message; threadId: string; settings: MailSettings | undefined; canReply: boolean }) {
  const [frame, setFrame] = useState<Window | null>(null);
  const [forward, setForward] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const ours = m.direction === 'OUTBOUND';
  const files = m.attachments.filter((a) => !a.isInline || !a.contentId);
  return (
    <article className={`flex flex-col gap-3 rounded-xl border border-border-hairline p-4 max-md:p-3 ${ours ? 'bg-bg-alt' : 'bg-bg-surface'}`}>
      <header className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-sm font-semibold text-text-primary">{ours ? (m.autoReply ? 'Автовідповідь' : m.sentBy ? `${m.sentBy} (Вівчарик)` : 'Вівчарик') : (m.fromName || m.fromEmail)}</span>
          <span className="truncate text-caption text-text-muted">{ours ? `→ ${m.toEmails.join(', ')}` : m.fromName ? m.fromEmail : ''}{ours || m.fromName ? ' · ' : ''}{dateTime(m.occurredAt)}</span>
        </div>
        <div className="flex shrink-0 print:hidden">
          {canReply && <IconBtn icon={Forward} label="Переслати" onClick={() => setForward(!forward)} />}
          <IconBtn icon={Printer} label="Друк / PDF" onClick={() => frame?.print()} />
        </div>
      </header>
      {m.verdict?.suspicious && (
        <div role="alert" className="flex gap-2 rounded-lg border border-warning bg-warning/10 px-3 py-2 text-body-sm text-text-primary">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warning" />
          <div><b>Підозрілий лист.</b> Не відкривайте посилання й не вводьте паролі.
            <ul className="mt-1 list-disc pl-5 text-caption text-text-body">{m.verdict.reasons?.map((r) => <li key={r}>{r}</li>)}</ul></div>
        </div>
      )}
      <MessageFrame m={m} onFrame={setFrame} />
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((a) => (
            <li key={a.id} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-caption ${a.riskFlag ? 'border-warning' : 'border-border-hairline'}`}>
              {a.riskFlag ? <ShieldAlert size={14} className="text-warning" /> : <Paperclip size={14} className="text-text-muted" />}
              <button type="button" onClick={() => void openAttachment(a, false, confirm)} className="max-w-48 truncate text-text-primary underline">{a.filename}</button>
              <span className="text-text-muted">{kb(a.sizeBytes)}</span>
              <button type="button" onClick={() => void openAttachment(a, true, confirm)} aria-label={`Завантажити ${a.filename}`} title="Завантажити" className="rounded p-1 text-text-muted hover:bg-bg-alt"><Download size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      {forward && <Composer threadId={threadId} initial="" settings={settings} mode={{ kind: 'forward', messageId: m.id }} onCancel={() => setForward(false)}
        onSent={() => { setForward(false); toast('Переслано'); void qc.invalidateQueries({ queryKey: ['mail-thread', threadId] }); }} />}
    </article>
  );
}

function PanelBlock({ title, children }: { title: string; children: ReactNode }) {
  return <section className="flex flex-col gap-1.5"><h3 className="text-caption font-semibold uppercase tracking-wide text-text-muted">{title}</h3>{children}</section>;
}

export function ThreadView({ id, settings, onGone, onBack }: { id: string; settings: MailSettings | undefined; onGone: () => void; onBack: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data: t, isPending, isError } = useQuery({ queryKey: ['mail-thread', id], queryFn: () => api<Thread>(`/admin/mail/threads/${id}`) });
  const [panel, setPanel] = useStored('mail.panel', true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [note, setNote] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['mail-thread', id] }), qc.invalidateQueries({ queryKey: ['mail'] }), qc.invalidateQueries({ queryKey: ['mail-unread'] }), qc.invalidateQueries({ queryKey: ['counters'] })]);
  const failed = () => toast('Не вдалося зберегти. Перевірте з\'єднання і спробуйте ще раз.', 'error');
  const patch = useMutation({ mutationFn: (b: object) => patchThread(id, b), onSuccess: refresh, onError: failed });
  const sender = useMutation({ mutationFn: (b: { action: 'BLOCK' | 'VIP'; on: boolean }) => post('/admin/mail/senders', { email: t!.counterpartEmail, ...b }), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['customers'] }); void qc.invalidateQueries({ queryKey: ['customer'] }); return refresh(); }, onError: failed });
  const addNote = useMutation({ mutationFn: () => post(`/admin/mail/threads/${id}/notes`, { body: note }), onSuccess: () => { setNote(''); return refresh(); }, onError: failed });
  const purge = useMutation({ mutationFn: () => api(`/admin/mail/threads/${id}`, { method: 'DELETE' }), onSuccess: () => { toast('Розмову видалено'); onGone(); return refresh(); }, onError: failed });

  const shell = 'flex flex-col gap-3 max-md:fixed max-md:inset-0 max-md:z-[45] max-md:overflow-y-auto max-md:bg-bg-page max-md:px-3 max-md:pb-[calc(5rem+env(safe-area-inset-bottom))]';
  if (isPending) return <div className={shell}><SkeletonRows rows={4} /></div>;
  if (isError || !t) return <div className={shell}><button type="button" onClick={onBack} className="self-start p-2 md:hidden" aria-label="Назад"><ArrowLeft size={20} /></button><p className="text-body text-text-muted">Лист не знайдено.</p></div>;

  const update = can('mail.update');
  // «Ви впевнені?» for any status change (#85).
  const setStatus = async (status: Status, question: string, msg: string) => {
    if (await confirm({ title: question, ok: 'Так', danger: status === 'SPAM' })) patch.mutate({ status }, { onSuccess: () => toast(msg) });
  };
  const markUnread = async () => {
    try { await patchThread(id, { unread: true }); } catch { failed(); return; }
    qc.removeQueries({ queryKey: ['mail-thread', id] });
    onBack();
    toast('Позначено непрочитаним');
    void qc.invalidateQueries({ queryKey: ['mail'] }); void qc.invalidateQueries({ queryKey: ['mail-unread'] }); void qc.invalidateQueries({ queryKey: ['counters'] });
  };
  const toggleLabel = (k: string) => patch.mutate({ labels: t.labels.includes(k) ? t.labels.filter((x) => x !== k) : [...t.labels, k] });
  const toBin = async () => {
    if (!(await confirm({ title: 'Перемістити в кошик?', text: 'Через 30 днів розмова зникне з панелі; у скриньці Porkbun копія залишиться.', ok: 'У кошик', danger: true }))) return;
    patch.mutate({ deleted: true }, { onSuccess: () => { toast('У кошику'); onGone(); } });
  };
  const purgeNow = async () => { if (await confirm({ title: 'Видалити розмову назавжди?', text: 'У скриньці Porkbun копія залишиться.', ok: 'Видалити', danger: true })) purge.mutate(); };
  const block = async () => {
    if (!t.blocked && !(await confirm({ title: `Заблокувати ${t.counterpartEmail}?`, text: 'Нові листи від цієї адреси одразу йтимуть у спам.', ok: 'Заблокувати', danger: true }))) return;
    sender.mutate({ action: 'BLOCK', on: !t.blocked });
  };
  const btn = 'min-h-9 rounded-lg border border-border-control px-3 text-body-sm hover:bg-bg-alt';

  return (
    <div className={shell}>
      {/* phone: a bar with «←» (#278) */}
      <div className="sticky top-0 z-10 -mx-3 flex items-center gap-1 border-b border-border-hairline bg-bg-page/95 px-1 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <button type="button" onClick={onBack} aria-label="До листів" className="p-3"><ArrowLeft size={22} /></button>
        <span className="min-w-0 flex-1 truncate text-body font-semibold text-text-primary">{t.counterpartName || t.counterpartEmail}</span>
      </div>

      <div className={`grid gap-4 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_15rem]' : ''}`}>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <h2 className="min-w-0 flex-1 text-h3 font-semibold text-text-primary">{t.subject}</h2>
              {/* Icon actions with hints + «⋯» (#169) */}
              <div className="flex shrink-0 items-center print:hidden">
                {update && !t.deleted && t.status !== 'CLOSED' && <IconBtn icon={CheckCircle2} label="Закрити розмову" onClick={() => void setStatus('CLOSED', 'Закрити розмову?', 'Розмову закрито')} />}
                {update && !t.deleted && <IconBtn icon={Trash2} label="У кошик" onClick={() => void toBin()} />}
                {update && t.deleted && <IconBtn icon={RotateCcw} label="Відновити з кошика" onClick={() => patch.mutate({ deleted: false }, { onSuccess: () => toast('Відновлено') })} />}
                <DotsMenu label="Ще дії" items={[
                  { label: 'Повернути в нові', icon: Inbox, onClick: () => void setStatus('OPEN', 'Повернути в нові?', 'Повернуто в нові'), hidden: !update || t.deleted || t.status === 'OPEN' || t.status === 'SPAM' },
                  { label: 'Позначити непрочитаним', icon: MailOpen, onClick: () => void markUnread(), hidden: !update || t.deleted },
                  { label: 'Це спам', icon: ShieldAlert, onClick: () => void setStatus('SPAM', 'Позначити як спам?', 'Перенесено в спам'), hidden: !update || t.deleted || t.status === 'SPAM' },
                  { label: 'Не спам', icon: ShieldCheck, onClick: () => void setStatus('OPEN', 'Це не спам?', 'Повернуто в нові'), hidden: !update || t.deleted || t.status !== 'SPAM' },
                  { label: t.blocked ? 'Розблокувати відправника' : 'Заблокувати відправника', icon: Ban, onClick: () => void block(), danger: !t.blocked, hidden: !update || t.deleted },
                  { label: 'Видалити назавжди', icon: Trash2, onClick: () => void purgeNow(), danger: true, hidden: !t.deleted || !can('mail.delete') },
                ]} />
                <span className="max-md:hidden"><IconBtn icon={PanelRight} label={panel ? 'Сховати панель' : 'Мітки, замовлення, нотатки'} onClick={() => setPanel(!panel)} /></span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-body-sm">
              <span className="min-w-0 truncate text-text-body">{t.counterpartName ? `${t.counterpartName} · ` : ''}{t.counterpartEmail}</span>
              {update ? (
                <button type="button" onClick={() => sender.mutate({ action: 'VIP', on: !t.vip })} aria-pressed={t.vip} title={t.vip ? 'Зняти позначку «Оптовик»' : 'Позначити оптовиком'}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption ${t.vip ? 'bg-[#B08D4F22] font-medium text-text-primary' : 'text-text-muted hover:bg-bg-alt'}`}>
                  <Star size={13} className={t.vip ? 'fill-[#B08D4F] text-[#B08D4F]' : ''} />{t.vip ? 'Оптовик' : 'Оптовик?'}
                </button>
              ) : t.vip && <Badge label="Оптовик" icon={Star} color="#B08D4F" />}
              <Badge label={STATUS_TITLE[t.status]} color={STATUS_COLOR[t.status]} />
              {t.deleted && <Badge label="У кошику" icon={Trash2} color="#C0533F" />}
              {t.blocked && <Badge label="Заблоковано" icon={Ban} color="#C0533F" />}
              {t.labels.map((k) => { const l = settings?.labels.find((x) => x.key === k); return l && <span key={k} className={`rounded-full border px-2 py-0.5 text-caption ${labelClass(l.color)}`}>{l.title}</span>; })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {t.messages.map((m) => <MessageCard key={m.id} m={m} threadId={t.id} settings={settings} canReply={can('mail.reply')} />)}
          </div>

          {can('mail.reply') && !t.deleted && (
            <>
              {/* computer: the editor under the letter; phone: a full-screen editor (#279) */}
              <section aria-label="Відповідь" className={`print:hidden ${replyOpen ? 'max-md:fixed max-md:inset-0 max-md:z-[55] max-md:flex max-md:flex-col max-md:overflow-y-auto max-md:bg-bg-page max-md:p-3 max-md:pt-[env(safe-area-inset-top)]' : 'max-md:hidden'}`}>
                <div className="-mx-3 mb-2 flex items-center gap-1 border-b border-border-hairline px-1 md:hidden">
                  <button type="button" onClick={() => setReplyOpen(false)} aria-label="Назад до листа" className="p-3"><ArrowLeft size={22} /></button>
                  <span className="min-w-0 flex-1 truncate text-body font-semibold">Відповідь · {t.counterpartName || t.counterpartEmail}</span>
                </div>
                <Composer threadId={t.id} initial={t.draft} settings={settings} mode={{ kind: 'reply' }} focus={replyOpen}
                  onSent={() => { setReplyOpen(false); toast('Надіслано'); void refresh(); }} />
              </section>
              <div className="fixed inset-x-0 bottom-0 z-[46] border-t border-border-hairline bg-bg-surface p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
                <button type="button" onClick={() => setReplyOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-body font-semibold text-white"><Reply size={18} /> Відповісти</button>
              </div>
            </>
          )}
        </div>

        {/* Labels, the customer's orders and notes: a narrow collapsible panel (#170) */}
        <aside className={`flex flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-3 text-body-sm print:hidden xl:self-start ${panel ? '' : 'md:hidden'}`} aria-label="Про клієнта">
          {!!settings?.labels.length && update && (
            <PanelBlock title="Мітки">
              <div className="flex flex-wrap gap-1.5">
                {settings.labels.map((l) => (
                  <button key={l.key} type="button" onClick={() => toggleLabel(l.key)} aria-pressed={t.labels.includes(l.key)}
                    className={`rounded-full border px-2.5 py-1 text-caption ${t.labels.includes(l.key) ? `${labelClass(l.color)} font-semibold` : 'border-border-hairline text-text-muted'}`}>{l.title}</button>
                ))}
              </div>
            </PanelBlock>
          )}
          <PanelBlock title="Замовлення листа">
            {t.order ? (
              <span className="flex flex-wrap items-center gap-2">
                <Link to={`/orders/${t.order.number}`} className="font-semibold text-text-primary underline">{t.order.number}</Link>
                <OrderStatus status={t.order.status} compact /> {uah(t.order.totalMinor)}
                {update && <button type="button" onClick={() => patch.mutate({ orderNumber: null })} className="text-caption text-text-muted underline">відв'язати</button>}
              </span>
            ) : update ? (
              <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (orderNo.trim()) patch.mutate({ orderNumber: orderNo.trim() }, { onError: () => toast('Такого замовлення немає', 'error') }); }}>
                <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="VCH-26-0001" aria-label="Номер замовлення" className="min-w-0 flex-1 rounded-md border border-border-control bg-bg-input px-2 py-1" />
                <button type="submit" className="rounded-md border border-border-control px-2 hover:bg-bg-alt">Прив'язати</button>
              </form>
            ) : <span className="text-text-muted">—</span>}
            {can('orders.create') && <Link to={`/orders/new?email=${encodeURIComponent(t.counterpartEmail)}&name=${encodeURIComponent(t.counterpartName ?? '')}`} className="text-accent-text underline">Створити замовлення з листа</Link>}
          </PanelBlock>
          <PanelBlock title="Замовлення клієнта">
            {t.customerOrders.length ? t.customerOrders.map((o) => (
              <Link key={o.number} to={`/orders/${o.number}`} className="flex items-center gap-1.5 hover:underline">
                <OrderStatus status={o.status} compact /><span className="font-medium text-text-primary">{o.number}</span><span className="ml-auto tabular text-text-muted">{uah(o.totalMinor)}</span>
              </Link>
            )) : <span className="text-text-muted">Ще не замовляв</span>}
            {t.customerPhone && can('customers.read') && <Link to={`/customers/${encodeURIComponent(t.customerPhone)}`} className="inline-flex items-center gap-1 text-accent-text underline"><UserRound size={14} /> Картка клієнта</Link>}
          </PanelBlock>
          <PanelBlock title="Нотатки">
            <span className="text-caption text-text-muted">Клієнт їх не бачить</span>
            {t.notes.map((n) => (
              <p key={n.id} className="rounded-lg bg-bg-alt px-2.5 py-1.5">
                <span className="block text-caption text-text-muted">{n.author ? `${n.author} · ` : ''}{dateTime(n.createdAt)}</span>{n.body}
              </p>
            ))}
            {update && (
              <form className="flex flex-col gap-1.5" onSubmit={(e) => { e.preventDefault(); if (note.trim()) addNote.mutate(); }}>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Нова нотатка" aria-label="Нова нотатка" className="rounded-md border border-border-control bg-bg-input px-2 py-1.5" />
                {note.trim() && <button type="submit" className={`${btn} self-end`}>Додати</button>}
              </form>
            )}
          </PanelBlock>
        </aside>
      </div>
    </div>
  );
}
