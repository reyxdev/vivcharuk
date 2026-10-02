import { useEffect, useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import { ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useSignedIn } from './useSession';

// First login: QR + secret, one valid code, then 10 recovery codes shown once (24 §24.11).
export function EnrolStep({ enrolmentToken, onRestart }: { enrolmentToken: string; onRestart: () => void }) {
  const signedIn = useSignedIn();
  const [qr, setQr] = useState<{ image: string; secret: string } | null>(null);
  const [done, setDone] = useState<{ codes: string[]; accessToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    post<{ otpauthUri: string; secret: string }>('/auth/staff/mfa/enrol', { enrolmentToken })
      .then(async (r) => setQr({ image: await QRCode.toDataURL(r.otpauthUri, { margin: 1, width: 220 }), secret: r.secret }))
      .catch((err) => { setError(messageFor(err instanceof ApiError ? err.code : 'INTERNAL_ERROR')); });
  }, [enrolmentToken]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get('code'));
    try {
      const r = await post<{ recoveryCodes: string[]; accessToken: string }>('/auth/staff/mfa/enrol', { enrolmentToken, code });
      setDone({ codes: r.recoveryCodes, accessToken: r.accessToken });
    } catch (err) {
      const c = err instanceof ApiError ? err.code : 'INTERNAL_ERROR';
      if (c === 'TOKEN_EXPIRED') onRestart();
      setError(messageFor(c));
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-h4 font-semibold text-text-primary">Коди відновлення</h2>
        <p className="text-body-sm text-text-body">Кожен код спрацює один раз, якщо телефона не буде під рукою. Роздрукуйте їх і тримайте з документами фірми. Більше ми їх не покажемо.</p>
        <ol className="grid grid-cols-2 gap-2 rounded-lg bg-bg-raised p-3 font-mono text-body-sm text-text-primary">
          {done.codes.map((c) => <li key={c}>{c}</li>)}
        </ol>
        <Button onClick={() => window.print()} variant="ghost">Роздрукувати</Button>
        <Button onClick={() => signedIn(done.accessToken)}>Я зберіг коди</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="text-h4 font-semibold text-text-primary">Підключіть Google Authenticator</h2>
      <p className="text-body-sm text-text-body">Відкрийте застосунок на телефоні, натисніть «+» і відскануйте код.</p>
      {qr ? <img src={qr.image} alt="QR-код для Google Authenticator" className="mx-auto rounded-lg bg-white p-2" width={220} height={220} /> : <p className="text-body-sm text-text-muted">Готуємо код…</p>}
      {qr && <p className="break-all text-center font-mono text-caption text-text-muted">Або введіть вручну: {qr.secret}</p>}
      <Field label="Код із застосунку" name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required />
      {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
      <Button type="submit">Підтвердити</Button>
    </form>
  );
}
