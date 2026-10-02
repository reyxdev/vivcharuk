import { PasskeyLoginButton } from '@/features/account/PasskeyLogin';
import { useState, type FormEvent } from 'react';
import { ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { MfaStep } from './MfaStep';
import { EnrolStep } from './EnrolStep';

type LoginResult =
  | { kind: 'mfa_required'; challengeToken: string }
  | { kind: 'mfa_enrolment_required'; enrolmentToken: string };

export function LoginPage() {
  const [step, setStep] = useState<LoginResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      setStep(await post<LoginResult>('/auth/staff/login', { email: form.get('email'), password: form.get('password') }));
    } catch (err) {
      setError(messageFor(err instanceof ApiError ? err.code : 'INTERNAL_ERROR'));
    } finally {
      setBusy(false);
    }
  }

  const restart = () => setStep(null);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg-page p-4">
      <div className="w-full max-w-sm rounded-xl border border-border-hairline bg-bg-surface p-6 shadow-lg">
        <p className="flex items-center gap-2 text-h2 font-semibold text-text-primary"><img src="/admin/logo-96.webp" alt="" className="size-10" />Вівчарик</p>
        <p className="mb-6 text-body-sm text-text-muted">Панель керування</p>
        {step?.kind === 'mfa_required' && <MfaStep challengeToken={step.challengeToken} onRestart={restart} />}
        {step?.kind === 'mfa_enrolment_required' && <EnrolStep enrolmentToken={step.enrolmentToken} onRestart={restart} />}
        {!step && (
          <>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field label="Електронна пошта" name="email" type="email" autoComplete="username" required />
            <Field label="Пароль" name="password" type="password" autoComplete="current-password" required />
            {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
            <Button type="submit" disabled={busy}>{busy ? 'Перевіряємо…' : 'Увійти'}</Button>
          </form>
          <PasskeyLoginButton />
          </>
        )}
      </div>
    </main>
  );
}
