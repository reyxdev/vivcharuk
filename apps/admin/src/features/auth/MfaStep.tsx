import { useState, type FormEvent } from 'react';
import { ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useSignedIn } from './useSession';

export function MfaStep({ challengeToken, onRestart }: { challengeToken: string; onRestart: () => void }) {
  const signedIn = useSignedIn();
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const body = { challengeToken, rememberDevice: f.get('remember') === 'on', ...(recovery ? { recoveryCode: String(f.get('code')) } : { code: String(f.get('code')) }) };
      const r = await post<{ accessToken: string }>('/auth/staff/mfa', body);
      await signedIn(r.accessToken);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'INTERNAL_ERROR';
      if (code === 'TOKEN_EXPIRED') onRestart();
      setError(messageFor(code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {recovery ? (
        <Field key="rc" label="Код відновлення" name="code" autoComplete="off" required autoFocus />
      ) : (
        <Field key="totp" label="Код з Google Authenticator" name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required autoFocus />
      )}
      <label className="flex items-center gap-2 text-body-sm text-text-body">
        <input type="checkbox" name="remember" className="size-4" /> Запам'ятати цей пристрій на 7 днів
      </label>
      {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? 'Перевіряємо…' : 'Підтвердити'}</Button>
      <button type="button" className="text-body-sm text-text-muted underline" onClick={() => setRecovery(!recovery)}>
        {recovery ? 'Ввести код з телефона' : 'Немає телефона? Код відновлення'}
      </button>
    </form>
  );
}
