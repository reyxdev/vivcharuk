import { authenticator } from 'otplib';

// RFC 6238, SHA-1, 6 digits, 30 s step, ±1 step tolerance (24 §24.11).
authenticator.options = { step: 30, window: 1, digits: 6 };

export const newTotpSecret = () => authenticator.generateSecret(20);
export const otpauthUri = (email: string, secret: string) => authenticator.keyuri(email, 'Вівчарик', secret);

/** Returns the accepted time-step, or null. Caller enforces the replay guard. */
export function verifyTotp(code: string, secret: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const delta = authenticator.checkDelta(code, secret);
  if (delta === null) return null;
  return Math.floor(now / 30_000) + delta;
}
