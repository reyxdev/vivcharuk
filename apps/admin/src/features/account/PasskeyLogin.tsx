import { useState } from 'react';
import { ScanFace } from 'lucide-react';
import { browserSupportsWebAuthn, startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import { ApiError, post } from '@/lib/api';
import { useSignedIn } from '@/features/auth/useSession';

/**
 * Round 20 #294: «Увійти з Face ID чи відбитком» on the login page. Any passkey added in «Пароль і
 * вхід» works; the server then opens the same kind of session as password + Authenticator.
 */
export function PasskeyLoginButton() {
  const signedIn = useSignedIn();
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!browserSupportsWebAuthn()) return null;
  const go = async () => {
    setBusy(true); setErr('');
    try {
      const { handle, options } = await post<{ handle: string; options: PublicKeyCredentialRequestOptionsJSON }>('/auth/staff/passkey/options', {});
      const response = await startAuthentication({ optionsJSON: options });
      const r = await post<{ accessToken: string }>('/auth/staff/passkey/login', { handle, response, rememberDevice: remember });
      await signedIn(r.accessToken);
    } catch (e) {
      if (e instanceof ApiError) setErr(e.code === 'RATE_LIMITED' ? 'Забагато спроб. Зачекайте хвилину.' : 'Цей пристрій ще не додано для входу. Увійдіть паролем і кодом, а потім увімкніть вхід за обличчям у «Пароль і вхід».');
      else if (e instanceof Error && (e.name === 'NotAllowedError' || e.name === 'AbortError')) setErr('Вхід скасовано. Спробуйте ще раз або увійдіть паролем.');
      else setErr('Не вдалося. Увійдіть паролем і кодом.');
    } finally { setBusy(false); }
  };
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => void go()} disabled={busy}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-control bg-bg-surface px-4 text-body-sm font-semibold text-text-primary hover:bg-bg-alt disabled:opacity-50">
        <ScanFace size={20} /> {busy ? 'Чекаємо підтвердження…' : 'Увійти з Face ID чи відбитком'}
      </button>
      <label className="flex items-center gap-2 text-body-sm text-text-muted"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4" /> Запам'ятати цей пристрій на 7 днів</label>
      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
    </div>
  );
}
