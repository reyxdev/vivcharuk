import { enqueue } from '../../lib/jobs';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../lib/prisma';
import { AppError, unauthorized } from '../../lib/errors';
import { open, randomToken, seal, sha256 } from '../../lib/crypto';
import { audit } from '../audit/audit.service';
import { newTotpSecret, otpauthUri, verifyTotp } from './totp';
import { signAccess, signStep, verifyStep } from './tokens';

// Argon2id, m=19456 KiB, t=2, p=1 (24 §24.10).
const ARGON = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
export const hashPassword = (pw: string) => argon2.hash(pw, ARGON);

const REMEMBER_MS = 7 * 24 * 3600_000; // absolute (24 §24.11)
const BROWSER_SESSION_MS = 12 * 3600_000;
const MIN_RESPONSE_MS = 400; // constant-ish timing for the password step (24 §24.10)

export interface ClientInfo { ip: string; userAgent: string }

// Single-use + attempt counter for challenge tokens. In-process: correct for one API process;
// a multi-process deployment moves this to Postgres or Redis.
const steps = new Map<string, { attempts: number; exp: number }>();
const openStep = (jti: string) => steps.set(jti, { attempts: 0, exp: Date.now() + 5 * 60_000 });
function useStep(jti: string) {
  const s = steps.get(jti);
  if (!s || s.exp < Date.now()) { steps.delete(jti); return null; }
  return s;
}

const pad = async (started: number) => {
  const left = MIN_RESPONSE_MS - (Date.now() - started);
  if (left > 0) await new Promise((r) => setTimeout(r, left));
};

export async function registerFailure(userId: string, email: string, client: ClientInfo) {
  const u = await prisma.staffUser.update({ where: { id: userId }, data: { failedLoginCount: { increment: 1 } } });
  const n = u.failedLoginCount;
  if (n >= 15) {
    await prisma.$transaction([
      prisma.staffUser.update({ where: { id: userId }, data: { status: 'BLOCKED' } }),
      prisma.staffSession.updateMany({ where: { staffUserId: userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await audit({ actorId: null, actorEmail: email, action: 'employee.auto_blocked', resourceType: 'StaffUser', resourceId: userId, ipAddress: client.ip, userAgent: client.userAgent });
  } else if (n >= 10) {
    await prisma.staffUser.update({ where: { id: userId }, data: { lockedUntil: new Date(Date.now() + 60 * 60_000) } });
  } else if (n >= 5) {
    await prisma.staffUser.update({ where: { id: userId }, data: { lockedUntil: new Date(Date.now() + 15 * 60_000) } });
  }
}

export type LoginResult =
  | { kind: 'mfa_required'; challengeToken: string; methods: Array<'totp' | 'recovery_code'> }
  | { kind: 'mfa_enrolment_required'; enrolmentToken: string };

/** Step 1. Never issues a session (26 §26.10.6). */
export async function login(email: string, password: string, client: ClientInfo): Promise<LoginResult> {
  const started = Date.now();
  const user = await prisma.staffUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  const ok = user?.passwordHash ? await argon2.verify(user.passwordHash, password).catch(() => false) : false;
  const usable = user && user.status === 'ACTIVE' && !user.deletedAt && !(user.lockedUntil && user.lockedUntil > new Date());
  if (!user || !ok || !usable) {
    if (user && !ok) await registerFailure(user.id, user.email, client);
    await pad(started);
    throw new AppError(401, 'INVALID_CREDENTIALS'); // identical for locked, blocked and wrong password
  }
  await pad(started);
  const jti = randomUUID();
  openStep(jti);
  if (!user.twoFactorEnabledAt || !user.twoFactorSecret) {
    return { kind: 'mfa_enrolment_required', enrolmentToken: await signStep('enrol', user.id, client.ip, jti) };
  }
  return { kind: 'mfa_required', challengeToken: await signStep('mfa', user.id, client.ip, jti), methods: ['totp', 'recovery_code'] };
}

export async function issueSession(userId: string, remember: boolean, client: ClientInfo) {
  const refresh = randomToken(32);
  const now = Date.now();
  // T22: a sign-in from a browser this person never used before is announced to them in Telegram.
  const known = await prisma.staffSession.count({ where: { staffUserId: userId, userAgent: client.userAgent.slice(0, 400) } });
  const user = await prisma.staffUser.update({
    where: { id: userId },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date(now) },
  });
  const session = await prisma.staffSession.create({
    data: {
      staffUserId: userId,
      refreshTokenHash: sha256(refresh),
      ipAddress: client.ip,
      userAgent: client.userAgent.slice(0, 400),
      expiresAt: new Date(now + (remember ? REMEMBER_MS : BROWSER_SESSION_MS)),
      rememberDevice: remember,
      mfaVerifiedAt: new Date(now),
    },
  });
  const accessToken = await signAccess({ sub: userId, sid: session.id, pv: user.permVersion });
  if (!known) await enqueue('notify.telegram', { kind: 'security', staffId: userId, device: deviceName(client.userAgent) }).catch(() => undefined);
  return { accessToken, refresh, remember, expiresAt: session.expiresAt };
}

/** Step 2: TOTP or a recovery code. The only call that issues a session. */
export async function verifyMfa(
  input: { challengeToken: string; code?: string; recoveryCode?: string; rememberDevice: boolean },
  client: ClientInfo,
) {
  const claim = await verifyStep('mfa', input.challengeToken, client.ip);
  const step = claim && useStep(claim.jti);
  if (!claim || !step) throw unauthorized('TOKEN_EXPIRED');
  const user = await prisma.staffUser.findUnique({ where: { id: claim.sub } });
  if (!user?.twoFactorSecret || user.status !== 'ACTIVE') throw unauthorized('TOKEN_EXPIRED');

  let passed = false;
  if (input.code) {
    const accepted = verifyTotp(input.code, open(user.twoFactorSecret));
    // Replay guard: a time-step ≤ the stored one is rejected.
    if (accepted !== null && (user.twoFactorLastStep === null || accepted > user.twoFactorLastStep)) {
      const res = await prisma.staffUser.updateMany({
        where: { id: user.id, OR: [{ twoFactorLastStep: null }, { twoFactorLastStep: { lt: accepted } }] },
        data: { twoFactorLastStep: accepted },
      });
      passed = res.count === 1;
    }
  } else if (input.recoveryCode) {
    const codes = await prisma.staffRecoveryCode.findMany({ where: { staffUserId: user.id, usedAt: null } });
    const normalised = input.recoveryCode.replace(/[\s-]/g, '').toLowerCase();
    for (const c of codes) {
      if (await argon2.verify(c.codeHash, normalised).catch(() => false)) {
        const res = await prisma.staffRecoveryCode.updateMany({ where: { id: c.id, usedAt: null }, data: { usedAt: new Date() } });
        passed = res.count === 1;
        if (passed) await audit({ actorId: user.id, actorEmail: user.email, action: 'employee.recovery_code_used', resourceType: 'StaffUser', resourceId: user.id, ipAddress: client.ip, userAgent: client.userAgent });
        break;
      }
    }
  }

  if (!passed) {
    step.attempts += 1;
    if (step.attempts >= 5) steps.delete(claim.jti);
    await registerFailure(user.id, user.email, client);
    await audit({ actorId: user.id, actorEmail: user.email, action: 'employee.2fa_challenge_failed', resourceType: 'StaffUser', resourceId: user.id, ipAddress: client.ip, userAgent: client.userAgent });
    throw new AppError(401, 'MFA_INVALID');
  }
  steps.delete(claim.jti);
  return issueSession(user.id, input.rememberDevice, client);
}

const pendingEnrolment = new Map<string, string>(); // jti → sealed secret, until confirmed

/** First call returns the otpauth URI; second call with a valid code saves the secret. */
export async function enrol(input: { enrolmentToken: string; code?: string }, client: ClientInfo) {
  const claim = await verifyStep('enrol', input.enrolmentToken, client.ip);
  const step = claim && useStep(claim.jti);
  if (!claim || !step) throw unauthorized('TOKEN_EXPIRED');
  const user = await prisma.staffUser.findUnique({ where: { id: claim.sub } });
  if (!user || user.status !== 'ACTIVE' || user.twoFactorEnabledAt) throw unauthorized('TOKEN_EXPIRED');

  if (!input.code) {
    let sealed = pendingEnrolment.get(claim.jti);
    if (!sealed) { sealed = seal(newTotpSecret()); pendingEnrolment.set(claim.jti, sealed); }
    const secret = open(sealed);
    return { stage: 'scan' as const, otpauthUri: otpauthUri(user.email, secret), secret };
  }

  const sealed = pendingEnrolment.get(claim.jti);
  const accepted = sealed ? verifyTotp(input.code, open(sealed)) : null;
  if (!sealed || accepted === null) {
    step.attempts += 1;
    if (step.attempts >= 5) { steps.delete(claim.jti); pendingEnrolment.delete(claim.jti); }
    throw new AppError(401, 'MFA_INVALID');
  }
  const recoveryCodes = Array.from({ length: 10 }, () => randomToken(6).replace(/[-_]/g, 'x').slice(0, 8).toLowerCase());
  const hashes = await Promise.all(recoveryCodes.map((c) => argon2.hash(c, ARGON)));
  await prisma.$transaction([
    prisma.staffUser.update({ where: { id: user.id }, data: { twoFactorSecret: sealed, twoFactorEnabledAt: new Date(), twoFactorLastStep: accepted } }),
    prisma.staffRecoveryCode.deleteMany({ where: { staffUserId: user.id } }),
    prisma.staffRecoveryCode.createMany({ data: hashes.map((codeHash) => ({ staffUserId: user.id, codeHash })) }),
  ]);
  steps.delete(claim.jti);
  pendingEnrolment.delete(claim.jti);
  await audit({ actorId: user.id, actorEmail: user.email, action: 'employee.2fa_enabled', resourceType: 'StaffUser', resourceId: user.id, ipAddress: client.ip, userAgent: client.userAgent });
  const session = await issueSession(user.id, false, client);
  return { stage: 'done' as const, recoveryCodes, session };
}

/** Rotating refresh; presenting a revoked token revokes every session of that user (24 §24.9). */
export async function refresh(rawToken: string, client: ClientInfo) {
  const session = await prisma.staffSession.findUnique({ where: { refreshTokenHash: sha256(rawToken) }, include: { staffUser: true } });
  if (!session) throw unauthorized();
  if (session.revokedAt) {
    await prisma.staffSession.updateMany({ where: { staffUserId: session.staffUserId, revokedAt: null }, data: { revokedAt: new Date() } });
    await audit({ actorId: session.staffUserId, actorEmail: session.staffUser.email, action: 'session.reuse_detected', resourceType: 'StaffSession', resourceId: session.id, ipAddress: client.ip, userAgent: client.userAgent });
    throw unauthorized();
  }
  if (session.expiresAt < new Date() || session.staffUser.status !== 'ACTIVE') throw unauthorized();
  const next = randomToken(32);
  const rotated = await prisma.$transaction(async (tx) => {
    await tx.staffSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return tx.staffSession.create({
      data: {
        staffUserId: session.staffUserId,
        refreshTokenHash: sha256(next),
        ipAddress: client.ip,
        userAgent: client.userAgent.slice(0, 400),
        deviceLabel: session.deviceLabel,
        expiresAt: session.expiresAt, // absolute: never extended by activity
        rememberDevice: session.rememberDevice,
        mfaVerifiedAt: session.mfaVerifiedAt,
      },
    });
  });
  const accessToken = await signAccess({ sub: session.staffUserId, sid: rotated.id, pv: session.staffUser.permVersion });
  return { accessToken, refresh: next, remember: rotated.rememberDevice, expiresAt: rotated.expiresAt };
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return;
  await prisma.staffSession.updateMany({ where: { refreshTokenHash: sha256(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
}

/** «iPhone · Safari», «Windows · Chrome» — enough to recognise one's own device. */
function deviceName(ua: string) {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'пристрій';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'браузер';
  return `${os} · ${br}`;
}
