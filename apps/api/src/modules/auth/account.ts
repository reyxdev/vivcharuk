import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import {
  generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse,
  type AuthenticationResponseJSON, type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { BUSINESS } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError, unauthorized } from '../../lib/errors';
import { assertPassword } from '../../lib/passwords';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { hashPassword, issueSession, registerFailure, type ClientInfo } from './auth.service';

type Actor = { id: string; email: string; sessionId: string };

/**
 * «Пароль і вхід» (round 20 #39, #294). Changing the password needs the current one; every other
 * session ends and any open reset link dies (passwordChangedAt moves). Passkeys (WebAuthn) sit next
 * to password + TOTP, which stays the fallback. A passkey sign-in requires user verification (Face ID,
 * fingerprint or the device PIN), so it carries both factors and issues the same session as
 * password + TOTP does.
 */
export async function changePassword(actor: Actor, current: string, next: string, client: ClientInfo) {
  const u = await prisma.staffUser.findUniqueOrThrow({ where: { id: actor.id } });
  const ok = u.passwordHash ? await argon2.verify(u.passwordHash, current).catch(() => false) : false;
  if (!ok) {
    await registerFailure(u.id, u.email, client);
    throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'currentPassword', code: 'WRONG_PASSWORD' }]);
  }
  if (current === next) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'password', code: 'PASSWORD_REUSED' }]);
  await assertPassword(next, u);
  const hash = await hashPassword(next);
  await prisma.$transaction(async (tx) => {
    await tx.staffUser.update({ where: { id: u.id }, data: { passwordHash: hash, passwordChangedAt: new Date(), failedLoginCount: 0, lockedUntil: null } });
    await tx.staffSession.updateMany({ where: { staffUserId: u.id, revokedAt: null, id: { not: actor.sessionId } }, data: { revokedAt: new Date() } });
    await audit({ actorId: u.id, actorEmail: u.email, action: 'auth.password_changed', resourceType: 'StaffUser', resourceId: u.id, ipAddress: client.ip, userAgent: client.userAgent }, tx);
  });
}

/* ---------- Passkeys ---------- */

// RP ID and origin come from ADMIN_URL. Outside production the same host on another port (the Vite
// dev server) is accepted too; in production only the configured origin.
const admin = new URL(config.adminUrl);
export const rpID = admin.hostname;
const expectedOrigin = (origin: string | undefined) => {
  const out = [admin.origin];
  if (!config.isProd && origin) { try { if (new URL(origin).hostname === rpID) out.push(origin); } catch { /* ignore */ } }
  return out;
};

// Single-use challenges, five minutes. In-process, like the MFA step tokens in auth.service.
const TTL_MS = 5 * 60_000;
const challenges = new Map<string, { challenge: string; exp: number; ip: string }>();
function keep(key: string, challenge: string, ip: string) {
  const now = Date.now();
  if (challenges.size > 1000) for (const [k, v] of challenges) if (v.exp < now) challenges.delete(k);
  if (challenges.size > 5000) throw new AppError(429, 'RATE_LIMITED');
  challenges.set(key, { challenge, exp: now + TTL_MS, ip });
}
function take(key: string, ip: string) {
  const c = challenges.get(key);
  challenges.delete(key);
  return c && c.exp > Date.now() && c.ip === ip ? c.challenge : null;
}

const view = (p: { id: string; label: string; createdAt: Date; lastUsedAt: Date | null }) =>
  ({ id: p.id, label: p.label, createdAt: p.createdAt.toISOString(), lastUsedAt: p.lastUsedAt?.toISOString() ?? null });

export async function listPasskeys(staffUserId: string) {
  const rows = await prisma.staffPasskey.findMany({ where: { staffUserId }, orderBy: { createdAt: 'asc' } });
  return rows.map(view);
}

/** Adding a way in asks for the password again, so a borrowed open session cannot add its own key. */
export async function registrationOptions(actor: Actor, password: string, client: ClientInfo) {
  const u = await prisma.staffUser.findUniqueOrThrow({ where: { id: actor.id } });
  const ok = u.passwordHash ? await argon2.verify(u.passwordHash, password).catch(() => false) : false;
  if (!ok) {
    await registerFailure(u.id, u.email, client);
    throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'password', code: 'WRONG_PASSWORD' }]);
  }
  const existing = await prisma.staffPasskey.findMany({ where: { staffUserId: u.id }, select: { credentialId: true, transports: true } });
  if (existing.length >= 10) throw new AppError(422, 'VALIDATION_FAILED', 'PASSKEY_LIMIT');
  const options = await generateRegistrationOptions({
    rpName: `${BUSINESS.brand} — панель`,
    rpID,
    userName: u.email,
    userDisplayName: `${u.firstName} ${u.lastName}`,
    userID: new TextEncoder().encode(u.id),
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({ id: c.credentialId, transports: c.transports })),
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
  });
  keep(`reg:${actor.sessionId}`, options.challenge, client.ip);
  return options;
}

export async function registerPasskey(actor: Actor, response: RegistrationResponseJSON, label: string, client: ClientInfo, origin: string | undefined) {
  const challenge = take(`reg:${actor.sessionId}`, client.ip);
  if (!challenge) throw unauthorized('TOKEN_EXPIRED');
  const r = await verifyRegistrationResponse({ response, expectedChallenge: challenge, expectedOrigin: expectedOrigin(origin), expectedRPID: rpID, requireUserVerification: true })
    .catch(() => ({ verified: false as const }));
  if (!r.verified) throw new AppError(422, 'VALIDATION_FAILED', 'PASSKEY_INVALID');
  const c = r.registrationInfo.credential;
  if (await prisma.staffPasskey.findUnique({ where: { credentialId: c.id } })) throw new AppError(409, 'VALIDATION_FAILED', 'PASSKEY_EXISTS');
  const row = await prisma.$transaction(async (tx) => {
    const p = await tx.staffPasskey.create({ data: { staffUserId: actor.id, credentialId: c.id, publicKey: Buffer.from(c.publicKey), counter: c.counter, transports: c.transports ?? [], label } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'employee.passkey_added', resourceType: 'StaffUser', resourceId: actor.id, resourceLabel: label, ipAddress: client.ip, userAgent: client.userAgent }, tx);
    return p;
  });
  return view(row);
}

export async function deletePasskey(actor: Actor, id: string, client: ClientInfo) {
  const p = await prisma.staffPasskey.findFirst({ where: { id, staffUserId: actor.id } });
  if (!p) throw new AppError(404, 'NOT_FOUND');
  await prisma.$transaction(async (tx) => {
    await tx.staffPasskey.delete({ where: { id: p.id } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'employee.passkey_removed', resourceType: 'StaffUser', resourceId: actor.id, resourceLabel: p.label, ipAddress: client.ip, userAgent: client.userAgent }, tx);
  });
}

/** Sign-in step 1: a challenge for any passkey of this site (discoverable credentials, no e-mail asked). */
export async function loginOptions(ip: string) {
  const options = await generateAuthenticationOptions({ rpID, userVerification: 'required' });
  const handle = randomUUID();
  keep(`auth:${handle}`, options.challenge, ip);
  return { handle, options };
}

/** Sign-in step 2: the same account checks as the password step, then the same session as TOTP gives. */
export async function loginWithPasskey(handle: string, response: AuthenticationResponseJSON, remember: boolean, client: ClientInfo, origin: string | undefined) {
  const challenge = take(`auth:${handle}`, client.ip);
  if (!challenge) throw unauthorized('TOKEN_EXPIRED');
  const p = await prisma.staffPasskey.findUnique({ where: { credentialId: response.id } });
  const user = p && (await prisma.staffUser.findUnique({ where: { id: p.staffUserId } }));
  const usable = user && user.status === 'ACTIVE' && !user.deletedAt && !(user.lockedUntil && user.lockedUntil > new Date()) && !!user.twoFactorEnabledAt;
  if (!p || !user || !usable) throw new AppError(401, 'INVALID_CREDENTIALS', 'PASSKEY_INVALID');
  const r = await verifyAuthenticationResponse({
    response, expectedChallenge: challenge, expectedOrigin: expectedOrigin(origin), expectedRPID: rpID, requireUserVerification: true,
    credential: { id: p.credentialId, publicKey: new Uint8Array(p.publicKey), counter: p.counter, transports: p.transports },
  }).catch(() => ({ verified: false as const, authenticationInfo: null }));
  // The user handle, when the authenticator returns one, must name the same account.
  const handleOk = !response.response.userHandle || Buffer.from(response.response.userHandle, 'base64url').toString() === user.id;
  if (!r.verified || !r.authenticationInfo || !handleOk) {
    await registerFailure(user.id, user.email, client);
    await audit({ actorId: user.id, actorEmail: user.email, action: 'employee.passkey_failed', resourceType: 'StaffUser', resourceId: user.id, ipAddress: client.ip, userAgent: client.userAgent });
    throw new AppError(401, 'INVALID_CREDENTIALS', 'PASSKEY_INVALID');
  }
  await prisma.staffPasskey.update({ where: { id: p.id }, data: { counter: r.authenticationInfo.newCounter, lastUsedAt: new Date() } });
  await audit({ actorId: user.id, actorEmail: user.email, action: 'employee.passkey_login', resourceType: 'StaffUser', resourceId: user.id, resourceLabel: p.label, ipAddress: client.ip, userAgent: client.userAgent });
  return issueSession(user.id, remember, client);
}
