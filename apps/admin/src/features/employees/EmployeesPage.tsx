import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, KeyRound, Link2, LockOpen, Pause, Play, Plus, ShieldCheck, ShieldOff, UserMinus, UserPlus } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { dateTime } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { DataTable, type Column } from '@/components/DataTable';
import { CopyButton, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast } from '@/components/ui';
import { inputCls, labelCls } from '@/features/settings/parts';
import { LinkPanel } from '@/features/account/TelegramLink';

interface Employee {
  id: string; email: string; firstName: string; lastName: string; status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'DEACTIVATED';
  roles: Array<{ key: string; name: string }>; twoFactor: boolean; lastLoginAt: string | null; activeSessions: number; invitedAt: string | null; inviteExpired: boolean;
}
interface Role { key: string; name: string; description: string | null; isSystem: boolean; permissions: number }
interface List { items: Employee[]; roles: Role[]; singleOwner: boolean }

const STATUS: Record<Employee['status'], [string, string]> = {
  INVITED: ['Запрошено', 'bg-warning/15 text-warning'], ACTIVE: ['Працює', 'bg-success/15 text-success'], SUSPENDED: ['Призупинено', 'bg-warning/15 text-warning'],
  BLOCKED: ['Заблоковано', 'bg-danger/15 text-danger'], DEACTIVATED: ['Звільнено', 'bg-bg-alt text-text-muted'],
};
const ERR: Record<string, string> = {
  SELF_ESCALATION: 'Свої ролі змінює інший власник.', SELF_STATUS: 'Це можна зробити лише з іншого облікового запису.',
  ROLE_EXCEEDS_ACTOR: 'Ця роль має права, яких немає у вас.', LAST_OWNER: 'Має лишитися хоча б один власник.',
  OWNER_MFA_OWNER_ONLY: 'Код входу власника скидає лише інший власник.', EMAIL_TAKEN: 'Така пошта вже є.', STATUS_NOT_ALLOWED: 'Зараз ця дія недоступна.',
  EMAIL_ON_SITE_DOMAIN: 'Для входу потрібна своя пошта (Gmail тощо), не адреса на домені сайту.',
};
const errText = (x: unknown) => {
  if (!(x instanceof ApiError)) return messageFor('');
  const b = x.body?.error;
  return ERR[b?.fieldErrors?.[0]?.code ?? ''] ?? ERR[b?.message ?? ''] ?? messageFor(b?.code ?? '');
};

// 24 §24.7, round 20 #85, #189–191, #228: invite, block (with «Ви впевнені?»), detailed role ticks.
export function EmployeesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: me } = useMe();
  const can = (p: string) => !!me?.permissions.includes(p);
  const { data } = useQuery({ queryKey: ['employees'], queryFn: () => api<List>('/admin/employees') });
  // Personal Telegram notifications: the owner decides who may receive them, and can show a colleague a QR (T10, T43).
  const [tgLink, setTgLink] = useState<{ e: Employee; url: string | null; code: string; expiresAt: string } | null>(null);
  const { data: tg } = useQuery({ queryKey: ['employees-telegram'], queryFn: () => api<{ botConfigured: boolean; items: Array<{ id: string; allowed: boolean; owner: boolean; linked: boolean; username: string | null; lastSentAt: string | null }> }>('/admin/employees/telegram'), refetchInterval: tgLink ? 2500 : false });
  const tgSet = async (id: string, body: { allowed?: boolean; unlink?: true }, ok: string) => {
    try { await api(`/admin/employees/${id}/telegram`, { method: 'PATCH', body: JSON.stringify(body) }); await qc.invalidateQueries({ queryKey: ['employees-telegram'] }); toast(ok); }
    catch (x) { toast(errText(x), 'error'); }
  };
  const [inviting, setInviting] = useState(false);
  const [roles, setRoles] = useState<Employee | null>(null);
  const [link, setLink] = useState<{ url: string; title: string } | null>(null);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      const r = await fn() as { link?: string } | undefined;
      if (r && typeof r === 'object' && 'link' in r && r.link) setLink({ url: r.link, title: 'Посилання готове. Діє обмежений час і лише один раз.' });
      await qc.invalidateQueries({ queryKey: ['employees'] });
      toast(ok);
    } catch (x) { toast(errText(x), 'error'); }
  };
  const status = async (e: Employee, op: string, ok: string, ask?: { title: string; text: string; okLabel: string; danger?: boolean }) => {
    if (ask && !(await confirm({ title: ask.title, text: ask.text, ok: ask.okLabel, danger: ask.danger }))) return;
    await run(() => post(`/admin/employees/${e.id}/status`, { op }), ok);
  };

  if (!data || !me) return <><PageHeader title="Співробітники" /><SkeletonRows rows={3} /></>;
  const name = (e: Employee) => `${e.firstName} ${e.lastName}`;
  const columns: Array<Column<Employee>> = [
    { key: 'name', header: 'Ім\'я', cell: (e) => <span className="font-medium text-text-primary">{name(e)}{e.id === me.id ? <span className="text-text-muted"> (ви)</span> : null}</span> },
    { key: 'email', header: 'Пошта для входу', cell: (e) => <span className="text-text-body">{e.email}</span> },
    { key: 'roles', header: 'Ролі', cell: (e) => e.roles.map((r) => r.name).join(', ') || '—' },
    { key: 'status', header: 'Стан', cell: (e) => <Badge e={e} /> },
    { key: 'login', header: 'Останній вхід', cell: (e) => (e.lastLoginAt ? dateTime(e.lastLoginAt) : <span className="text-text-muted">ще не входив</span>) },
    { key: 'tg', header: 'Telegram', cell: (e) => {
      const t = tg?.items.find((x) => x.id === e.id);
      if (!t || e.status !== 'ACTIVE') return '—';
      const label = t.linked
        ? <span className="flex flex-col"><span className="text-ok">{t.username ? `@${t.username}` : 'підключено'}</span>{t.lastSentAt && <span className="text-caption text-text-muted">останнє: {dateTime(t.lastSentAt)}</span>}</span>
        : <span className="text-text-muted">{t.allowed ? 'дозволено, не підключено' : 'вимкнено'}</span>;
      const qr = t.allowed && !t.linked && can('employees.update') && e.id !== me.id
        ? <button type="button" className="text-caption text-accent-text underline" onClick={async (ev) => { ev.stopPropagation(); try { setTgLink({ e, ...(await post<{ url: string | null; code: string; expiresAt: string }>(`/admin/employees/${e.id}/telegram/link`)) }); } catch (x) { toast(errText(x), 'error'); } }}>QR для підключення</button>
        : null;
      if (t.owner || !can('employees.update')) return <span className="flex flex-wrap items-center gap-2">{label}{qr}</span>;
      return (
        <span className="flex flex-wrap items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
          {label}{qr}
          <button type="button" className="text-caption text-accent-text underline"
            onClick={async () => {
              if (t.allowed && !(await confirm({ title: 'Вимкнути Telegram-сповіщення?', text: `${e.firstName} більше не отримуватиме сповіщень.`, ok: 'Вимкнути', danger: true }))) return;
              await tgSet(e.id, { allowed: !t.allowed }, t.allowed ? 'Вимкнено' : `Дозволено. ${e.firstName} підключає свій Telegram у «Пароль і вхід».`);
            }}>{t.allowed ? 'вимкнути' : 'дозволити'}</button>
        </span>
      );
    } },
    { key: 'mfa', header: 'Код входу', cell: (e) => (e.status === 'ACTIVE' ? (e.twoFactor ? <span className="inline-flex items-center gap-1 text-success"><ShieldCheck size={15} /> є</span> : <span className="text-warning">ще не налаштовано</span>) : '—') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Співробітники" actions={can('employees.invite') && <PrimaryButton icon={UserPlus} onClick={() => setInviting(true)}>Запросити</PrimaryButton>} />
      {data.singleOwner && <p className="max-w-3xl rounded-xl border border-warning/40 bg-warning/10 p-3 text-body-sm text-text-body">Поки що лише один власник. Якщо загубити телефон з кодами входу й пароль, повернути доступ буде важко. Під час наступного візиту створимо обліковий запис для дружини Івана.</p>}
      <DataTable
        rows={data.items} columns={columns}
        rowClass={(e) => (e.status === 'DEACTIVATED' ? 'opacity-60' : '')}
        actions={(e) => {
          const self = e.id === me.id, gone = e.status === 'DEACTIVATED';
          return [
            { label: 'Ролі й права', icon: KeyRound, onClick: () => setRoles(e), hidden: self || gone || e.status === 'INVITED' || !can('employees.assign_roles') },
            { label: 'Нове посилання-запрошення', icon: Link2, onClick: () => void run(() => post(`/admin/employees/${e.id}/resend`, {}), 'Нове запрошення створено'), hidden: e.status !== 'INVITED' || !can('employees.invite') },
            { label: 'Призупинити', icon: Pause, hidden: self || e.status !== 'ACTIVE' || !can('employees.suspend'), onClick: () => void status(e, 'suspend', 'Доступ призупинено', { title: `Призупинити доступ для ${e.firstName}?`, text: 'Людину буде одразу виведено з панелі на всіх пристроях. Повернути можна будь-коли.', okLabel: 'Призупинити' }) },
            { label: 'Відновити доступ', icon: Play, hidden: self || e.status !== 'SUSPENDED' || !can('employees.suspend'), onClick: () => void status(e, 'unsuspend', 'Доступ відновлено') },
            { label: 'Заблокувати', icon: Ban, danger: true, hidden: self || !['ACTIVE', 'SUSPENDED'].includes(e.status) || !can('employees.block'), onClick: () => void status(e, 'block', 'Заблоковано', { title: `Заблокувати ${e.firstName}?`, text: 'Для безпеки: людину виведе з панелі, а повернутися можна буде лише з новим паролем.', okLabel: 'Заблокувати', danger: true }) },
            { label: 'Розблокувати (новий пароль)', icon: LockOpen, hidden: self || e.status !== 'BLOCKED' || !can('employees.block'), onClick: () => void status(e, 'unblock', 'Розблоковано — передайте посилання на новий пароль') },
            { label: 'Скинути код входу', icon: ShieldOff, hidden: self || e.status !== 'ACTIVE' || !e.twoFactor || !can('employees.reset_mfa'),
              onClick: async () => { if (await confirm({ title: `Скинути код входу для ${e.firstName}?`, text: 'Людина заново підключить Google Authenticator при наступному вході.', ok: 'Скинути' })) await run(() => post(`/admin/employees/${e.id}/reset-mfa`, {}), 'Код входу скинуто'); } },
            { label: 'Звільнити', icon: UserMinus, danger: true, hidden: self || gone || !can('employees.deactivate'), onClick: () => void status(e, 'deactivate', 'Обліковий запис закрито', { title: `Звільнити ${e.firstName}?`, text: 'Обліковий запис закриється назавжди. Повернутися можна лише через нове запрошення.', okLabel: 'Звільнити', danger: true }) },
          ];
        }}
        card={(e) => (
          <div className="flex flex-col gap-1 pr-8">
            <span className="flex flex-wrap items-center gap-2 font-medium text-text-primary">{name(e)}{e.id === me.id ? <span className="text-text-muted">(ви)</span> : null}<Badge e={e} /></span>
            <span className="text-body-sm text-text-muted">{e.roles.map((r) => r.name).join(', ') || 'без ролі'} · {e.email}</span>
            {e.status === 'ACTIVE' && <span className="text-caption text-text-muted">{e.lastLoginAt ? `входив ${dateTime(e.lastLoginAt)}` : 'ще не входив'}{e.twoFactor ? '' : ' · код входу ще не налаштовано'}</span>}
          </div>
        )}
      />
      {tgLink && (
        <Sheet title={`Telegram для ${tgLink.e.firstName}`} onClose={() => setTgLink(null)}>
          {tg?.items.find((x) => x.id === tgLink.e.id)?.linked
            ? <p className="text-ok text-body">Підключено ✓</p>
            : <LinkPanel link={tgLink} forName={tgLink.e.firstName} onCancel={() => setTgLink(null)} />}
        </Sheet>
      )}
      {inviting && <InviteSheet roles={data.roles} onClose={() => setInviting(false)} onDone={(url) => { setInviting(false); setLink({ url, title: 'Запрошення створено. Посилання діє 72 години; ми надсилаємо його й листом на вказану пошту.' }); void qc.invalidateQueries({ queryKey: ['employees'] }); }} />}
      {roles && <RolesSheet e={roles} roles={data.roles} onClose={() => setRoles(null)} onSave={async (keys) => { await run(() => api(`/admin/employees/${roles.id}/roles`, { method: 'PUT', body: JSON.stringify({ roleKeys: keys }) }), 'Ролі збережено'); setRoles(null); }} />}
      {link && <LinkSheet link={link.url} title={link.title} onClose={() => setLink(null)} />}
    </div>
  );
}

function Badge({ e }: { e: Employee }) {
  const [t, cls] = STATUS[e.status];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-caption font-medium ${cls}`}>{t}{e.inviteExpired ? ' · протерміновано' : ''}</span>;
}

/** Detailed ticks (#228): every role with what it allows, as before. */
function RoleTicks({ roles, value, onChange }: { roles: Role[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-body-sm text-text-muted">Що людина може робити</legend>
      {roles.map((r) => {
        const on = value.includes(r.key);
        return (
          <label key={r.key} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${on ? 'border-accent bg-accent/5' : 'border-border-hairline'}`}>
            <input type="checkbox" checked={on} onChange={(x) => onChange(x.target.checked ? [...value, r.key] : value.filter((k) => k !== r.key))} className="mt-0.5 size-5 accent-[var(--accent)]" />
            <span><span className="block text-body font-medium text-text-primary">{r.name}</span>{r.description && <span className="text-body-sm text-text-muted">{r.description}</span>}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

function InviteSheet({ roles, onClose, onDone }: { roles: Role[]; onClose: () => void; onDone: (link: string) => void }) {
  const toast = useToast();
  const [f, setF] = useState({ email: '', firstName: '', lastName: '', roleKeys: [] as string[] });
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { const r = await post<{ link: string }>('/admin/employees', f); onDone(r.link); } catch (x) { toast(errText(x), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Запросити співробітника" onClose={onClose} wide>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className={labelCls}>Ім'я<input value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} required className={inputCls} /></label>
          <label className={labelCls}>Прізвище<input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} required className={inputCls} /></label>
          <label className={`${labelCls} sm:col-span-2`}>Пошта для входу (своя, напр. Gmail)<input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} type="email" required className={inputCls} /></label>
        </div>
        <RoleTicks roles={roles.filter((r) => r.key !== 'owner')} value={f.roleKeys} onChange={(roleKeys) => setF({ ...f, roleKeys })} />
        <PrimaryButton type="submit" icon={Plus} disabled={busy || !f.roleKeys.length}>Створити запрошення</PrimaryButton>
      </form>
    </Sheet>
  );
}

function RolesSheet({ e, roles, onClose, onSave }: { e: Employee; roles: Role[]; onClose: () => void; onSave: (keys: string[]) => Promise<void> }) {
  const [picked, setPicked] = useState(e.roles.map((r) => r.key));
  return (
    <Sheet title={`Ролі: ${e.firstName} ${e.lastName}`} onClose={onClose} wide>
      <RoleTicks roles={roles} value={picked} onChange={setPicked} />
      <PrimaryButton className="mt-4 w-full" disabled={!picked.length} onClick={() => void onSave(picked)}>Зберегти</PrimaryButton>
    </Sheet>
  );
}

// 24 §24.7: for someone standing in the workshop, the one-time link as a QR code — they scan it with
// their own phone and choose the password themselves; nobody else ever knows it.
function LinkSheet({ link, title, onClose }: { link: string; title: string; onClose: () => void }) {
  const [qr, setQr] = useState('');
  useEffect(() => { void QRCode.toDataURL(link, { margin: 1, width: 220 }).then(setQr); }, [link]);
  return (
    <Sheet title="Посилання для входу" onClose={onClose}>
      <p className="text-body text-text-body">{title}</p>
      {qr && <img src={qr} alt="QR-код посилання" width={200} height={200} className="mx-auto my-3 rounded-lg bg-white p-2" />}
      <p className="text-body-sm text-text-muted">Людина поруч? Хай наведе камеру свого телефона на код — відкриється сторінка, де вона сама придумає пароль і підключить Google Authenticator. Або надішліть посилання особисто (Viber, Telegram).</p>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border-control bg-bg-input px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-caption">{link}</span><CopyButton value={link} label="посилання" />
      </div>
      <PrimaryButton className="mt-4 w-full" onClick={onClose}>Готово</PrimaryButton>
    </Sheet>
  );
}
