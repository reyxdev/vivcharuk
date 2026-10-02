import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MapPin, MessageCircle, Pencil, Phone, Send, ShieldOff, ShoppingBag, Star, StickyNote, Trash2, TriangleAlert, UserX, type LucideIcon } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { date, dateTime, uah } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { STATUS_TITLE, type Status } from '@/features/mail/api';
import { OrderStatus } from '@/components/status';
import { DotsMenu, EmptyState, GhostButton, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast } from '@/components/ui';
import { CustomerMarks, customerHref } from './CustomersPage';

// The customer card (round 20 #140, #222–223): orders, mail, notes, delivery addresses, reviews; marks
// ★ оптовик and «Обережно»; call / Viber / Telegram / letter. «Знеособити» is the owner's, in «⋯».

interface Detail {
  phone: string; anonymized: boolean; name: string | null; email: string | null; emails: string[]; city: string | null;
  summary: { orders: number; valueMinor: number; averageMinor: number; cancelledOrReturned: number; lastOrderAt: string };
  marks: { vip: boolean; regular: boolean; caution: { reason: string; at: string | null } | null };
  orders: Array<{ number: string; placedAt: string; status: string; totalMinor: number | null; items: string; city: string | null }>;
  threads: Array<{ id: string; subject: string; status: Status; lastMessageAt: string }>;
  notes: Array<{ id: string; body: string; createdAt: string; author: string | null }>;
  addresses: Array<{ city: string | null; place: string | null; lastUsedAt: string | null }>;
  reviews: Array<{ id: string; rating: number; body: string; status: string; createdAt: string; product: string | null }>;
}

const REVIEW_STATUS: Record<string, string> = { PENDING: 'на перевірці', APPROVED: 'на сайті', HIDDEN: 'сховано', REJECTED: 'сховано' };
const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary';

function Block({ title, icon: Icon, count, children }: { title: string; icon: LucideIcon; count?: number; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <h2 className="flex items-center gap-2 text-body font-semibold text-text-primary"><Icon size={17} strokeWidth={1.75} className="text-text-muted" />{title}{count ? <span className="tabular text-caption font-normal text-text-muted">{count}</span> : null}</h2>
      {children}
    </section>
  );
}

function Contact({ href, icon: Icon, label, external }: { href: string; icon: LucideIcon; label: string; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex flex-col items-center gap-1 text-caption text-text-body">
      <span className="flex size-12 items-center justify-center rounded-full border border-border-control bg-bg-surface text-text-primary hover:bg-bg-alt"><Icon size={20} strokeWidth={1.75} /></span>
      {label}
    </a>
  );
}

// 23 §23.8.6: correct a typo taken over the phone.
function CorrectSheet({ c, onClose, onDone }: { c: Detail; onClose: () => void; onDone: (phone: string) => void }) {
  const toast = useToast();
  const [last0 = '', ...rest] = (c.name ?? '').split(' ');
  const first0 = rest.join(' ');
  const [f, setF] = useState({ lastName: last0, firstName: first0, email: c.email ?? '', phone: c.phone });
  const [err, setErr] = useState('');
  const save = async () => {
    setErr('');
    const body: Record<string, unknown> = {};
    if (f.lastName.trim() && f.lastName.trim() !== last0) body.lastName = f.lastName.trim();
    if (f.firstName.trim() && f.firstName.trim() !== first0) body.firstName = f.firstName.trim();
    if (f.email.trim() !== (c.email ?? '')) body.email = f.email.trim() || null;
    if (f.phone.trim() !== c.phone) body.phone = f.phone.trim();
    if (!Object.keys(body).length) return onClose();
    try {
      const r = await api<{ phone: string; joinedExisting: boolean }>(`/admin/customers/${encodeURIComponent(c.phone)}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast(r.joinedExisting ? 'Збережено. За цим номером уже були замовлення — тепер це один покупець.' : 'Збережено');
      onDone(r.phone);
    } catch (e) {
      const fe = e instanceof ApiError ? e.body?.error.fieldErrors : undefined;
      setErr(fe?.some((x) => x.path === 'phone') ? 'Номер має бути український: +380 і 9 цифр.' : fe?.some((x) => x.path === 'email') ? 'Пошта виглядає неправильно.' : messageFor(e instanceof ApiError ? e.code : ''));
    }
  };
  return (
    <Sheet title="Виправити дані" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-body-sm text-text-muted">Прізвище<input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} className={input} /></label>
        <label className="flex flex-col gap-1 text-body-sm text-text-muted">Ім'я<input value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} className={input} /></label>
        <label className="flex flex-col gap-1 text-body-sm text-text-muted">Телефон<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" className={input} /></label>
        <label className="flex flex-col gap-1 text-body-sm text-text-muted">Пошта (необов'язково)<input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} inputMode="email" className={input} /></label>
      </div>
      <p className="mt-2 text-caption text-text-muted">Ім'я й пошта зміняться в замовленнях, які ще не відправлено. Новий телефон переходить на всі замовлення покупця.</p>
      {err && <p role="alert" className="mt-2 text-body-sm text-danger">{err}</p>}
      <div className="mt-4 flex justify-end gap-2"><GhostButton onClick={onClose}>Скасувати</GhostButton><PrimaryButton onClick={() => void save()}>Зберегти</PrimaryButton></div>
    </Sheet>
  );
}

function CautionSheet({ onClose, onSave }: { onClose: () => void; onSave: (reason: string) => void }) {
  const [text, setText] = useState('');
  return (
    <Sheet title="Позначка «Обережно»" onClose={onClose}>
      <p className="text-body-sm text-text-muted">Причина буде видно в картці й жовтою смужкою в наступному замовленні цього покупця.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500} autoFocus placeholder="Напр.: не забрав посилку з відділення" className={`${input} mt-2`} />
      <div className="mt-4 flex justify-end gap-2"><GhostButton onClick={onClose}>Скасувати</GhostButton><PrimaryButton disabled={!text.trim()} onClick={() => onSave(text.trim())}>Зберегти</PrimaryButton></div>
    </Sheet>
  );
}

export function CustomerPage() {
  const phone = decodeURIComponent(useParams().id ?? '');
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const key = ['customer', phone];
  const { data: c, isPending, isError } = useQuery({ queryKey: key, queryFn: () => api<Detail>(`/admin/customers/${encodeURIComponent(phone)}`) });
  const [sheet, setSheet] = useState<'' | 'edit' | 'caution'>('');
  const [note, setNote] = useState('');
  const base = `/admin/customers/${encodeURIComponent(c?.phone ?? phone)}`;
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: key }), qc.invalidateQueries({ queryKey: ['customers'] })]);
  const fail = (e: unknown) => toast(messageFor(e instanceof ApiError ? e.code : ''), 'error');

  const wholesale = useMutation({ mutationFn: (on: boolean) => api(`${base}/wholesale`, { method: 'PUT', body: JSON.stringify({ on }) }), onSuccess: (_d, on) => { toast(on ? 'Позначено оптовиком' : 'Позначку оптовика знято'); void qc.invalidateQueries({ queryKey: ['mail'] }); return refresh(); }, onError: fail });
  const caution = useMutation({ mutationFn: (reason: string | null) => api(`${base}/caution`, { method: 'PUT', body: JSON.stringify({ reason }) }), onSuccess: (_d, r) => { setSheet(''); toast(r ? 'Позначено «Обережно»' : 'Позначку знято'); return refresh(); }, onError: fail });
  const addNote = useMutation({ mutationFn: () => post(`${base}/notes`, { body: note.trim() }), onSuccess: () => { setNote(''); return refresh(); }, onError: fail });
  const delNote = useMutation({ mutationFn: (id: string) => api(`${base}/notes/${id}`, { method: 'DELETE' }), onSuccess: refresh, onError: fail });

  if (isPending) return <SkeletonRows />;
  if (isError || !c) return <><PageHeader title="Клієнт" back="/customers" /><EmptyState icon={UserX} text="Такого покупця не знайшли — можливо, його дані знеособлено або змінено телефон." action={<Link to="/customers" className="text-body-sm text-accent-text underline">До списку клієнтів</Link>} /></>;

  const anonymize = async () => {
    const ok = await confirm({
      title: 'Знеособити покупця?', danger: true, ok: 'Знеособити',
      text: "З його замовлень зникнуть телефон, ім'я, пошта, адреса й нотатки; суми, товари й чеки залишаться для бухгалтерії. Відгуки буде підписано «Покупець», його листи зникнуть із «Пошти» в панелі. Скасувати це неможливо.",
    });
    if (!ok) return;
    try {
      await post(`${base}/anonymize`, { confirm: 'ЗНЕОСОБИТИ' });
      toast('Дані покупця знеособлено');
      await qc.invalidateQueries({ queryKey: ['customers'] });
      nav('/customers', { replace: true });
    } catch (e) {
      const open = e instanceof ApiError && e.body?.error.message === 'ORDERS_OPEN' ? (e.body.error.params as { orders?: string[] } | undefined)?.orders : undefined;
      toast(open ? `Спершу завершіть замовлення: ${open.join(', ')}` : messageFor(e instanceof ApiError ? e.code : ''), 'error');
    }
  };
  const toggleVip = async () => {
    if (c.marks.vip && !(await confirm({ title: 'Зняти позначку «Оптовик»?', text: 'Зірочка зникне і тут, і в «Пошті».', ok: 'Зняти' }))) return;
    wholesale.mutate(!c.marks.vip);
  };
  const clearCaution = async () => { if (await confirm({ title: 'Зняти «Обережно»?', ok: 'Зняти' })) caution.mutate(null); };
  const digits = c.phone.replace(/\D/g, '');
  const latestThread = c.threads[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader back="/customers" title={c.anonymized ? 'Знеособлений покупець' : c.name || 'Без імені'}
        sub={c.anonymized ? undefined : [c.phone, c.city].filter(Boolean).join(' · ')}
        actions={!c.anonymized && <DotsMenu label="Ще дії" items={[
          { label: 'Виправити дані', icon: Pencil, onClick: () => setSheet('edit'), hidden: !can('customers.update') },
          { label: 'Знеособити', icon: ShieldOff, onClick: () => void anonymize(), danger: true, hidden: !can('customers.anonymize') },
        ]} />} />

      {c.marks.caution && (
        <div role="note" className="flex items-start gap-2 rounded-xl border border-warning bg-warning/10 px-3 py-2 text-body-sm text-text-primary">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warning" />
          <span className="flex-1"><b>Обережно:</b> {c.marks.caution.reason}{c.marks.caution.at ? <span className="text-text-muted"> · {date(c.marks.caution.at)}</span> : null}</span>
          {can('customers.update') && <button type="button" onClick={() => void clearCaution()} className="text-caption text-text-muted underline">Зняти</button>}
        </div>
      )}

      {!c.anonymized && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex gap-4">
            <Contact href={`tel:${c.phone}`} icon={Phone} label="Подзвонити" />
            <Contact href={`viber://chat?number=%2B${digits}`} icon={MessageCircle} label="Viber" />
            <Contact href={`https://t.me/+${digits}`} icon={Send} label="Telegram" external />
            {c.email && can('mail.read') && (latestThread
              ? <Link to={`/mail/${latestThread.id}`} className="flex flex-col items-center gap-1 text-caption text-text-body"><span className="flex size-12 items-center justify-center rounded-full border border-border-control bg-bg-surface text-text-primary hover:bg-bg-alt"><Mail size={20} strokeWidth={1.75} /></span>Лист</Link>
              : <Contact href={`mailto:${c.email}`} icon={Mail} label="Лист" />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CustomerMarks vip={c.marks.vip} regular={c.marks.regular} caution={null} />
            {can('customers.update') && c.email && (
              <GhostButton icon={Star} onClick={() => void toggleVip()} disabled={wholesale.isPending} aria-pressed={c.marks.vip}>{c.marks.vip ? 'Зняти «Оптовик»' : 'Оптовик'}</GhostButton>
            )}
            {can('customers.update') && !c.marks.caution && <GhostButton icon={TriangleAlert} onClick={() => setSheet('caution')}>Обережно</GhostButton>}
          </div>
        </div>
      )}

      <p className="tabular text-body-sm text-text-muted">
        {c.summary.orders} замовл. · разом {uah(c.summary.valueMinor)} · середнє {uah(c.summary.averageMinor)}{c.summary.cancelledOrReturned ? ` · скасовано чи повернено: ${c.summary.cancelledOrReturned}` : ''}
        {c.email ? ` · ${c.emails.join(', ')}` : ''}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Block title="Замовлення" icon={ShoppingBag} count={c.orders.length}>
            <ul className="flex flex-col divide-y divide-border-hairline">
              {c.orders.map((o) => (
                <li key={o.number}>
                  <Link to={`/orders/${o.number}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-body-sm hover:bg-bg-page">
                    <span className="font-semibold text-text-primary">{o.number}</span>
                    <OrderStatus status={o.status} compact />
                    <span className="min-w-0 flex-1 truncate text-text-body">{o.items}</span>
                    <span className="tabular font-semibold text-text-primary">{uah(o.totalMinor)}</span>
                    <span className="w-full text-caption text-text-muted sm:w-auto">{dateTime(o.placedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Block>
          {can('mail.read') && (
            <Block title="Пошта" icon={Mail} count={c.threads.length}>
              {c.threads.length ? (
                <ul className="flex flex-col divide-y divide-border-hairline">
                  {c.threads.map((t) => (
                    <li key={t.id}><Link to={`/mail/${t.id}`} className="flex items-center gap-3 py-2 text-body-sm hover:bg-bg-page">
                      <span className="min-w-0 flex-1 truncate text-text-primary">{t.subject}</span>
                      <span className="text-caption text-text-muted">{STATUS_TITLE[t.status]} · {dateTime(t.lastMessageAt)}</span>
                    </Link></li>
                  ))}
                </ul>
              ) : <p className="text-body-sm text-text-muted">{c.email ? 'Листів від цього покупця ще не було.' : 'Пошти покупець не залишав.'}</p>}
            </Block>
          )}
          <Block title="Відгуки" icon={Star} count={c.reviews.length}>
            {c.reviews.length ? (
              <ul className="flex flex-col gap-2">
                {c.reviews.map((r) => (
                  <li key={r.id} className="text-body-sm">
                    <span className="text-[#E0B33A]" aria-label={`${r.rating} з 5`}>{'★'.repeat(r.rating)}<span className="text-text-faint">{'★'.repeat(5 - r.rating)}</span></span>
                    <span className="ml-2 text-caption text-text-muted">{r.product ?? 'про магазин'} · {REVIEW_STATUS[r.status] ?? r.status} · {date(r.createdAt)}</span>
                    <p className="line-clamp-3 text-text-body">{r.body}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-body-sm text-text-muted">Відгуків ще немає.</p>}
          </Block>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Block title="Нотатки" icon={StickyNote} count={c.notes.length}>
            <p className="text-caption text-text-muted">Лише для вас — покупець їх не бачить.</p>
            {can('customers.update') && !c.anonymized && (
              <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) addNote.mutate(); }}>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={5000} placeholder="Напр.: любить сірі ліжники, дзвонити після 18:00" aria-label="Нова нотатка" className={`${input} text-body-sm`} />
                {note.trim() && <PrimaryButton type="submit" className="self-end" disabled={addNote.isPending}>Додати</PrimaryButton>}
              </form>
            )}
            <ul className="flex flex-col gap-2">
              {c.notes.map((n) => (
                <li key={n.id} className="group rounded-lg bg-bg-alt px-3 py-2 text-body-sm">
                  <span className="flex items-center gap-2 text-caption text-text-muted">
                    <span className="flex-1">{n.author ? `${n.author} · ` : ''}{dateTime(n.createdAt)}</span>
                    {can('customers.update') && <button type="button" aria-label="Видалити нотатку" title="Видалити" onClick={() => void confirm({ title: 'Видалити нотатку?', ok: 'Видалити', danger: true }).then((ok) => ok && delNote.mutate(n.id))} className="rounded p-1 hover:bg-bg-surface"><Trash2 size={14} /></button>}
                  </span>
                  <p className="whitespace-pre-line text-text-body">{n.body}</p>
                </li>
              ))}
            </ul>
          </Block>
          <Block title="Адреси доставки" icon={MapPin} count={c.addresses.length}>
            {c.addresses.length ? (
              <ul className="flex flex-col gap-2">
                {c.addresses.map((a, i) => (
                  <li key={i} className="text-body-sm text-text-body">
                    {[a.city, a.place].filter(Boolean).join(', ')}
                    {a.lastUsedAt && <span className="block text-caption text-text-muted">востаннє {date(a.lastUsedAt)}</span>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-body-sm text-text-muted">Адрес немає.</p>}
          </Block>
        </div>
      </div>

      {sheet === 'edit' && <CorrectSheet c={c} onClose={() => setSheet('')} onDone={(p) => { setSheet(''); void qc.invalidateQueries({ queryKey: ['customers'] }); if (p !== phone) nav(customerHref(p), { replace: true }); else void refresh(); }} />}
      {sheet === 'caution' && <CautionSheet onClose={() => setSheet('')} onSave={(r) => caution.mutate(r)} />}
    </div>
  );
}
