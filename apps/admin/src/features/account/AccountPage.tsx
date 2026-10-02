import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { KeyRound, Plus, ScanFace, ShieldCheck, Trash2 } from 'lucide-react';
import { browserSupportsWebAuthn, startRegistration, type PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { api, post } from '@/lib/api';
import { date, dateTime } from '@/lib/format';
import { useMe } from '@/features/auth/useSession';
import { GhostButton, PageHeader, PrimaryButton, Sheet, SkeletonRows, useConfirm, useToast } from '@/components/ui';
import { errorText, inputCls, labelCls, Panel } from '@/features/settings/parts';
import { TelegramLink } from './TelegramLink';

interface Security {
  twoFactorSince: string | null; passwordChangedAt: string | null; recoveryCodesLeft: number;
  passkeys: Array<{ id: string; label: string; createdAt: string; lastUsedAt: string | null }>;
}

const PW_ERR = {
  WRONG_PASSWORD: 'Поточний пароль не підходить.',
  PASSWORD_WEAK: 'Пароль легко вгадати: щонайменше 12 символів, без назви магазину, села, свого імені чи пошти. Найкраще — кілька звичайних слів, наприклад «бабця пряде синю нитку».',
  PASSWORD_BREACHED: 'Цей пароль уже є в базах зламаних паролів. Оберіть інший — ми лише звірили відбиток, сам пароль нікуди не йшов.',
  PASSWORD_REUSED: 'Новий пароль має відрізнятися від поточного.',
};
const LEVEL: Array<[string, string]> = [['дуже слабкий', 'bg-danger'], ['слабкий', 'bg-danger'], ['так собі', 'bg-warning'], ['добрий', 'bg-success'], ['чудовий', 'bg-success']];

/** «iPhone Івана», «Mac Івана» — a name the person recognises in the list. */
function deviceName(first: string) {
  const ua = navigator.userAgent;
  const d = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Телефон' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Комп\'ютер' : 'Пристрій';
  return first ? `${d} — ${first}` : d;
}

// Round 20 #39, #293–294: own password, the Authenticator status and sign-in by face or fingerprint.
export function AccountPage() {
  const { data: me } = useMe();
  const { data: s, refetch } = useQuery({ queryKey: ['security'], queryFn: () => api<Security>('/auth/staff/security') });
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <PageHeader title="Пароль і вхід" sub={me ? `${me.firstName} ${me.lastName} · ${me.email}` : undefined} />
      {!s ? <SkeletonRows rows={4} /> : (
        <>
          <Passkeys s={s} first={me?.firstName ?? ''} refetch={refetch} />
          <Panel title="Код з Google Authenticator" sub="Другий крок входу після пароля.">
            <p className="flex items-center gap-2 text-body text-text-primary"><ShieldCheck size={18} className="text-success" />{s.twoFactorSince ? `Підключено ${date(s.twoFactorSince)}` : 'Підключено'}</p>
            <p className="text-body-sm text-text-muted">Резервних кодів лишилось: {s.recoveryCodesLeft}. Ними можна увійти без телефона — кожен один раз.{s.recoveryCodesLeft <= 2 ? ' Їх майже не лишилось: попросіть власника скинути код входу, і при наступному вході ви отримаєте нові.' : ''}</p>
            <p className="text-body-sm text-text-muted">Новий телефон чи загубили старий? Попросіть власника в «Співробітниках» → «⋯» → «Скинути код входу»; при наступному вході підключите Authenticator заново.</p>
          </Panel>
          <Panel title="Сповіщення в Telegram" sub="Нові замовлення, «Купити в 1 клік», відгуки на перевірку, оплати, нагадування «виготовити до» — вам в особисті повідомлення.">
            <TelegramLink />
          </Panel>
          <PasswordForm changedAt={s.passwordChangedAt} onDone={refetch} />
        </>
      )}
    </div>
  );
}

function Passkeys({ s, first, refetch }: { s: Security; first: string; refetch: () => Promise<unknown> }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [adding, setAdding] = useState(false);
  const supported = browserSupportsWebAuthn();
  return (
    <Panel title="Вхід за обличчям чи відбитком" sub="Face ID, відбиток пальця або код телефона замість пароля й шести цифр. Пароль і Authenticator лишаються запасним способом."
      actions={supported && <GhostButton icon={Plus} onClick={() => setAdding(true)}>Цей пристрій</GhostButton>}>
      {!supported && <p className="text-body-sm text-text-muted">Цей браузер не вміє такого входу. На iPhone відкрийте панель у Safari.</p>}
      {s.passkeys.length ? (
        <ul className="flex flex-col divide-y divide-border-hairline">
          {s.passkeys.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2">
              <ScanFace size={20} className="shrink-0 text-accent-text" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body text-text-primary">{p.label}</span>
                <span className="text-caption text-text-muted">додано {date(p.createdAt)} · {p.lastUsedAt ? `входили ${dateTime(p.lastUsedAt)}` : 'ще не входили'}</span>
              </span>
              <button type="button" aria-label={`Прибрати ${p.label}`} className="rounded-full p-2 text-text-muted hover:bg-bg-alt hover:text-danger"
                onClick={async () => {
                  if (!(await confirm({ title: `Прибрати «${p.label}»?`, text: 'З цього пристрою знову доведеться входити паролем і кодом.', ok: 'Прибрати', danger: true }))) return;
                  try { await api(`/auth/staff/passkeys/${p.id}`, { method: 'DELETE' }); await refetch(); toast('Прибрано'); } catch (e) { toast(errorText(e), 'error'); }
                }}><Trash2 size={17} /></button>
            </li>
          ))}
        </ul>
      ) : supported && <p className="text-body-sm text-text-muted">Ще не увімкнено. Натисніть «Цей пристрій» на своєму телефоні чи комп'ютері.</p>}
      {adding && <AddPasskey first={first} onClose={() => setAdding(false)} onDone={async () => { setAdding(false); await refetch(); toast('Готово! Наступного разу натисніть «Увійти з Face ID чи відбитком».'); }} />}
    </Panel>
  );
}

function AddPasskey({ first, onClose, onDone }: { first: string; onClose: () => void; onDone: () => Promise<void> }) {
  const toast = useToast();
  const [label, setLabel] = useState(() => deviceName(first));
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      const options = await post<PublicKeyCredentialCreationOptionsJSON>('/auth/staff/passkeys/options', { password });
      const response = await startRegistration({ optionsJSON: options });
      await post('/auth/staff/passkeys', { response, label: label.trim() });
      await onDone();
    } catch (e) {
      if (e instanceof Error && (e.name === 'NotAllowedError' || e.name === 'AbortError')) toast('Скасовано — нічого не змінилось.', 'error');
      else if (e instanceof Error && e.name === 'InvalidStateError') toast('Цей пристрій уже додано.', 'error');
      else toast(errorText(e, { WRONG_PASSWORD: 'Пароль не підходить.', PASSKEY_LIMIT: 'Додано вже 10 пристроїв — приберіть зайвий.', PASSKEY_EXISTS: 'Цей пристрій уже додано.', PASSKEY_INVALID: 'Пристрій не підтвердив вхід. Спробуйте ще раз.' }), 'error');
    } finally { setBusy(false); }
  };
  return (
    <Sheet title="Вхід за обличчям чи відбитком" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className={labelCls}>Як назвати цей пристрій<input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} className={inputCls} /></label>
        <label className={labelCls}>Ваш пароль — для безпеки<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></label>
        <p className="text-body-sm text-text-muted">Після натискання телефон чи комп'ютер попросить Face ID, відбиток або свій код — підтвердьте.</p>
        <PrimaryButton icon={ScanFace} disabled={busy || !label.trim() || !password} onClick={() => void go()}>{busy ? 'Чекаємо підтвердження…' : 'Увімкнути'}</PrimaryButton>
      </div>
    </Sheet>
  );
}

function PasswordForm({ changedAt, onDone }: { changedAt: string | null; onDone: () => Promise<unknown> }) {
  const toast = useToast();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [fb, setFb] = useState<{ score: number; long: boolean; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  // The server's own score while typing (24 §24.10), so the meter and the verdict agree.
  useEffect(() => {
    if (!next) { setFb(null); return; }
    const h = window.setTimeout(() => { void post<{ score: number; long: boolean; ok: boolean }>('/auth/staff/password/feedback', { password: next }).then(setFb).catch(() => setFb(null)); }, 350);
    return () => window.clearTimeout(h);
  }, [next]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      await post('/auth/staff/password', { currentPassword: cur, password: next });
      setCur(''); setNext(''); await onDone();
      toast('Пароль змінено. На інших пристроях треба буде увійти знову.');
    } catch (x) { toast(errorText(x, PW_ERR), 'error'); } finally { setBusy(false); }
  };
  const left = 12 - next.length;
  const [word, bar] = LEVEL[fb?.score ?? 0]!;
  return (
    <Panel title="Пароль" sub={changedAt ? `Востаннє змінено ${date(changedAt)}.` : undefined}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className={labelCls}>Поточний пароль<input type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required className={inputCls} /></label>
        <label className={labelCls}>Новий пароль<input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required maxLength={128} className={inputCls} /></label>
        {next && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${fb && fb.long && fb.score >= i ? bar : 'bg-border-hairline'}`} />)}</div>
            <p className="text-caption text-text-muted" aria-live="polite">{left > 0 ? `Ще ${left} ${left === 1 ? 'символ' : left < 5 ? 'символи' : 'символів'}` : fb ? `${word}${fb.score < 3 ? ' — додайте ще слово або два' : ''}` : '…'}</p>
          </div>
        )}
        <PrimaryButton type="submit" icon={KeyRound} disabled={busy || !cur || !fb?.ok} className="self-start">Змінити пароль</PrimaryButton>
      </form>
    </Panel>
  );
}
