import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
import { requireStaff } from '../../plugins/staffAuth';
import { strength } from '../../lib/passwords';
import * as account from './account';
import * as auth from './auth.service';

const REFRESH_COOKIE = 'vk_staff_rt';
const COOKIE_PATH = '/api/v1/auth/staff';

const client = (req: FastifyRequest): auth.ClientInfo => ({ ip: req.ip, userAgent: req.headers['user-agent'] ?? '' });

function setRefresh(reply: FastifyReply, s: { refresh: string; remember: boolean; expiresAt: Date }) {
  reply.setCookie(REFRESH_COOKIE, s.refresh, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'strict',
    path: COOKIE_PATH,
    // «Запам'ятати на 7 днів»: persistent, absolute. Otherwise a browser-session cookie (24 §24.11).
    ...(s.remember ? { expires: s.expiresAt } : {}),
  });
}

const loginBody = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) });
const mfaBody = z.object({
  challengeToken: z.string(),
  code: z.string().regex(/^\d{6}$/).optional(),
  recoveryCode: z.string().max(32).optional(),
  rememberDevice: z.boolean().default(false),
}).refine((b) => !!b.code !== !!b.recoveryCode, { message: 'code or recoveryCode' });
const enrolBody = z.object({ enrolmentToken: z.string(), code: z.string().regex(/^\d{6}$/).optional() });

export async function authRoutes(app: FastifyInstance) {
  const strict = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

  app.post('/auth/staff/login', strict, async (req) => {
    const b = loginBody.parse(req.body);
    return auth.login(b.email, b.password, client(req));
  });

  app.post('/auth/staff/mfa', strict, async (req, reply) => {
    const b = mfaBody.parse(req.body);
    const s = await auth.verifyMfa(b, client(req));
    setRefresh(reply, s);
    return { kind: 'authenticated', accessToken: s.accessToken };
  });

  app.post('/auth/staff/mfa/enrol', strict, async (req, reply) => {
    const b = enrolBody.parse(req.body);
    const r = await auth.enrol(b, client(req));
    if (r.stage === 'scan') return r;
    setRefresh(reply, r.session);
    return { stage: 'done', recoveryCodes: r.recoveryCodes, accessToken: r.session.accessToken };
  });

  app.post('/auth/staff/refresh', strict, async (req, reply) => {
    const raw = req.cookies[REFRESH_COOKIE];
    if (!raw) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'AUTH_REQUIRED', requestId: req.id } });
    const s = await auth.refresh(raw, client(req));
    setRefresh(reply, s);
    return { accessToken: s.accessToken };
  });

  app.post('/auth/staff/logout', async (req, reply) => {
    await auth.logout(req.cookies[REFRESH_COOKIE]);
    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return reply.status(204).send();
  });

  // ---- «Пароль і вхід»: own password and passkeys (round 20 #39, #294) ----
  const actor = (req: FastifyRequest) => ({ id: req.staff!.id, email: req.staff!.email, sessionId: req.staff!.sessionId });
  const credential = z.object({ id: z.string().min(1).max(1024), rawId: z.string().min(1).max(1024), type: z.literal('public-key'), response: z.record(z.string(), z.unknown()), clientExtensionResults: z.record(z.string(), z.unknown()).default({}), authenticatorAttachment: z.string().max(40).optional() });

  app.post('/auth/staff/password', { ...strict, preHandler: requireStaff }, async (req, reply) => {
    const b = z.object({ currentPassword: z.string().min(1).max(128), password: z.string().max(128) }).parse(req.body);
    await account.changePassword(actor(req), b.currentPassword, b.password, client(req));
    return reply.status(204).send();
  });

  app.post('/auth/staff/password/feedback', { preHandler: requireStaff, config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req) => {
    const { password } = z.object({ password: z.string().max(128) }).parse(req.body);
    const u = await prisma.staffUser.findUniqueOrThrow({ where: { id: req.staff!.id }, select: { email: true, firstName: true, lastName: true } });
    const score = password.length ? strength(password, u) : 0;
    return { score, long: password.length >= 12, ok: password.length >= 12 && password.length <= 128 && score >= 3 };
  });

  app.get('/auth/staff/security', { preHandler: requireStaff }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const u = await prisma.staffUser.findUniqueOrThrow({ where: { id: req.staff!.id }, select: { twoFactorEnabledAt: true, passwordChangedAt: true } });
    const codesLeft = await prisma.staffRecoveryCode.count({ where: { staffUserId: req.staff!.id, usedAt: null } });
    return {
      twoFactorSince: u.twoFactorEnabledAt?.toISOString() ?? null, passwordChangedAt: u.passwordChangedAt?.toISOString() ?? null,
      recoveryCodesLeft: codesLeft, passkeys: await account.listPasskeys(req.staff!.id),
    };
  });

  app.post('/auth/staff/passkeys/options', { ...strict, preHandler: requireStaff }, async (req) => {
    const { password } = z.object({ password: z.string().min(1).max(128) }).parse(req.body);
    return account.registrationOptions(actor(req), password, client(req));
  });
  app.post('/auth/staff/passkeys', { ...strict, preHandler: requireStaff }, async (req, reply) => {
    const b = z.object({ response: credential, label: z.string().trim().min(1).max(60) }).parse(req.body);
    return reply.status(201).send(await account.registerPasskey(actor(req), b.response as never, b.label, client(req), req.headers.origin));
  });
  app.delete<{ Params: { id: string } }>('/auth/staff/passkeys/:id', { preHandler: requireStaff }, async (req, reply) => {
    await account.deletePasskey(actor(req), req.params.id, client(req));
    return reply.status(204).send();
  });

  // Passkey sign-in: no e-mail or password; issues the same session as password + TOTP.
  app.post('/auth/staff/passkey/options', strict, async (req) => account.loginOptions(req.ip));
  app.post('/auth/staff/passkey/login', strict, async (req, reply) => {
    const b = z.object({ handle: z.string().uuid(), response: credential, rememberDevice: z.boolean().default(false) }).parse(req.body);
    const s = await account.loginWithPasskey(b.handle, b.response as never, b.rememberDevice, client(req), req.headers.origin);
    setRefresh(reply, s);
    return { kind: 'authenticated', accessToken: s.accessToken };
  });

  app.get('/auth/staff/me', { preHandler: requireStaff }, async (req) => {
    const u = await prisma.staffUser.findUniqueOrThrow({
      where: { id: req.staff!.id },
      select: { id: true, email: true, firstName: true, lastName: true, locale: true, roles: { select: { role: { select: { key: true, name: true } } } } },
    });
    return { ...u, roles: u.roles.map((r) => r.role), permissions: [...req.staff!.permissions].sort() };
  });
}
