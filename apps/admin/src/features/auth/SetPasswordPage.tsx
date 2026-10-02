import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, api, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';

/**
 * Public pages reached from a link (24 §24.8): accepting an invitation, or setting a new password
 * after an unblock. The person chooses their own password; nobody else ever knows it.
 */
const LEVEL = [
  ['Легко вгадати', 'bg-danger', 'text-danger'], ['Легко вгадати', 'bg-danger', 'text-danger'], ['Слабкий', 'bg-warning', 'text-warning'],
  ['Добрий', 'bg-success', 'text-ok'], ['Чудовий', 'bg-success', 'text-ok'],
] as const;

/** 24 §24.10: the server's own score while typing, so the meter and the verdict agree. */
function Meter({ token, mode, password }: { token: string; mode: 'invite' | 'reset'; password: string }) {
  const [fb, setFb] = useState<{ score: number; long: boolean } | null>(null);
  useEffect(() => {
    if (!password) { setFb(null); return; }
    const h = setTimeout(() => { void post<{ score: number; long: boolean }>('/auth/staff/password-feedback', { token, purpose: mode, password }).then(setFb).catch(() => setFb(null)); }, 350);
    return () => clearTimeout(h);
  }, [token, mode, password]);
  if (!password) return null;
  const left = 12 - password.length;
  const [label, bar, text] = LEVEL[fb?.score ?? 0]!;
  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${fb && fb.score >= i && fb.long ? bar : 'bg-border-hairline'}`} />)}</div>
      <p className={`text-caption ${left > 0 ? 'text-text-muted' : text}`}>
        {left > 0 ? `Ще ${left} ${left === 1 ? 'символ' : left < 5 ? 'символи' : 'символів'}` : fb ? `${label}${fb.score < 3 ? ' — додайте ще слово або два' : ''}` : '…'}
      </p>
    </div>
  );
}

export function SetPasswordPage({ mode }: { mode: 'invite' | 'reset' }) {
  const token = new URLSearchParams(location.search).get('token') ?? '';
  const [who, setWho] = useState<{ email: string; firstName?: string } | null>(null);
  const [state, setState] = useState<'checking' | 'ready' | 'invalid' | 'done'>(mode === 'invite' ? 'checking' : 'ready');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState('');

  useEffect(() => {
    if (mode !== 'invite') return;
    api<{ email: string; firstName: string }>(`/auth/staff/invite?token=${encodeURIComponent(token)}`)
      .then((r) => { setWho(r); setState('ready'); }).catch(() => setState('invalid'));
  }, [mode, token]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password') ?? '');
    if (password !== f.get('repeat')) { setErr('Паролі не збігаються.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await post<{ email: string }>(mode === 'invite' ? '/auth/staff/invite/accept' : '/auth/staff/password-reset/accept', { token, password });
      setWho({ email: r.email }); setState('done');
    } catch (x) {
      const code = x instanceof ApiError ? x.body?.error.fieldErrors?.[0]?.code ?? x.code : '';
      setErr(code === 'PASSWORD_WEAK' ? 'Пароль легко вгадати: щонайменше 12 символів, без назви магазину, села, свого імені чи пошти, без «qwerty» і «йцукен». Найкраще — фраза з кількох звичайних слів, наприклад «бабця пряде синю нитку».'
        : code === 'PASSWORD_BREACHED' ? 'Цей пароль уже є в базах зламаних паролів, тож його перебирають першим. Оберіть інший — його ніхто не бачив, ми лише звірили відбиток.'
        : code === 'PASSWORD_REUSED' ? 'Це старий пароль — оберіть новий.'
        : code === 'RESOURCE_GONE' ? 'Посилання вже не діє. Попросіть надіслати нове.' : messageFor(code));
    } finally { setBusy(false); }
  };

  const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2.5 text-body text-text-primary';
  return (
    <main className="grid min-h-dvh place-items-center bg-bg-page p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border-hairline bg-bg-surface p-6 shadow-lg">
        <p className="font-wordmark text-h2 text-text-primary">Вівчарик</p>
        {state === 'checking' && <p className="text-body text-text-muted">Перевіряємо посилання…</p>}
        {state === 'invalid' && <p className="text-body text-text-body">Посилання недійсне або протерміноване (запрошення діє 72 години). Попросіть надіслати нове.</p>}
        {state === 'done' && (
          <>
            <p className="text-body text-text-body">Пароль збережено. Тепер увійдіть як <b>{who?.email}</b> — наступним кроком налаштуєте двоетапний вхід у застосунку на телефоні.</p>
            <a href="/admin/" className="rounded-lg bg-accent px-4 py-2.5 text-center text-body font-semibold text-bg-page">Увійти</a>
          </>
        )}
        {state === 'ready' && (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h1 className="text-h3 text-text-primary">{mode === 'invite' ? `Вітаємо${who?.firstName ? `, ${who.firstName}` : ''}!` : 'Новий пароль'}</h1>
            <p className="text-body-sm text-text-muted">{mode === 'invite' ? `Придумайте пароль для входу в панель (${who?.email}).` : 'Старий пароль більше не діє. Придумайте новий.'}</p>
            <label className="flex flex-col gap-1 text-body-sm text-text-muted">Пароль<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={pw} onChange={(e) => setPw(e.target.value)} className={input} /></label>
            <Meter token={token} mode={mode} password={pw} />
            <label className="flex flex-col gap-1 text-body-sm text-text-muted">Ще раз<input name="repeat" type="password" autoComplete="new-password" required className={input} /></label>
            <p className="text-caption text-text-muted">Щонайменше 12 символів. Найпростіше — фраза з кількох слів. Символи й цифри не обов'язкові.</p>
            {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
            <button type="submit" disabled={busy} className="rounded-lg bg-accent px-4 py-2.5 text-body font-semibold text-bg-page disabled:opacity-50">Зберегти пароль</button>
          </form>
        )}
      </div>
    </main>
  );
}
