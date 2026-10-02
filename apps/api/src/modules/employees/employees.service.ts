import argon2 from 'argon2';
import { BUSINESS } from '@vivcharyk/schemas';
import type { Prisma, StaffStatus } from '@prisma/client';
import { config } from '../../config';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { invalidatePermissions } from '../auth/permissions';
import { signStaffToken, staffTokenAnchor, verifyStaffToken } from '../auth/tokens';
import { assertPassword, strength } from '../../lib/passwords';
import { sendMail } from '../../lib/mail';

type Actor = { id: string; email: string; permissions: Set<string> };

const adminLink = (path: string, token: string) => `${config.adminUrl}/${path}?token=${encodeURIComponent(token)}`;

/**
 * Round 18: the invitation or reset link also goes by e-mail to the employee's own (external) address.
 * The panel still shows it to the person who issued it, so a failed send never blocks anyone.
 */
async function mailLink(to: string, firstName: string, kind: 'invite' | 'reset', link: string) {
  const subject = kind === 'invite' ? `Запрошення до панелі «${BUSINESS.brand}»` : `Новий пароль до панелі «${BUSINESS.brand}»`;
  const lead = kind === 'invite' ? 'вас запросили працювати в панелі керування магазином.' : 'щоб знову увійти в панель керування, задайте новий пароль.';
  const valid = kind === 'invite' ? '72 години' : '30 хвилин';
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const html = `<p>${esc(firstName)}, ${lead}</p><p><a href="${esc(link)}">${kind === 'invite' ? 'Прийняти запрошення' : 'Задати пароль'}</a></p><p>Посилання діє ${valid} і працює один раз. Якщо ви цього не чекали — просто проігноруйте лист.</p>`;
  await sendMail({ to, subject, html, text: `${firstName}, ${lead}\n${link}\nПосилання діє ${valid} і працює один раз.` }).catch(() => undefined);
}

/** Staff login addresses must never be on the site's own domain (round 7 K2, rule 3). */
export function assertExternalEmail(email: string) {
  if (email.toLowerCase().endsWith(`@${BUSINESS.domain}`)) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'email', code: 'EMAIL_ON_SITE_DOMAIN' }]);
}

const revokeSessions = (tx: Prisma.TransactionClient, staffUserId: string) =>
  tx.staffSession.updateMany({ where: { staffUserId, revokedAt: null }, data: { revokedAt: new Date() } });

export async function listEmployees() {
  const [users, roles] = await Promise.all([
    prisma.staffUser.findMany({ where: { deletedAt: null }, orderBy: [{ status: 'asc' }, { createdAt: 'asc' }], include: { roles: { include: { role: true } }, sessions: { where: { revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true } } } }),
    prisma.role.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { permissions: true } } } }),
  ]);
  const owners = users.filter((u) => u.status === 'ACTIVE' && u.roles.some((r) => r.role.key === 'owner'));
  return {
    items: users.map((u) => ({
      id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, status: u.status,
      roles: u.roles.map((r) => ({ key: r.role.key, name: r.role.name })),
      twoFactor: !!u.twoFactorEnabledAt, lastLoginAt: u.lastLoginAt?.toISOString() ?? null, activeSessions: u.sessions.length,
      invitedAt: u.invitedAt?.toISOString() ?? null,
      inviteExpired: u.status === 'INVITED' && !!u.invitedAt && Date.now() - u.invitedAt.getTime() > 72 * 3_600_000,
    })),
    roles: roles.map((r) => ({ key: r.key, name: r.name, description: r.description, isSystem: r.isSystem, permissions: r._count.permissions })),
    singleOwner: owners.length === 1,
  };
}

/** I2 (no self-escalation) and I3 (a role you assign must be within what you hold). */
async function assertAssignable(actor: Actor, targetId: string | null, roleKeys: string[]) {
  if (targetId === actor.id) throw new AppError(403, 'PERMISSION_DENIED', 'SELF_ESCALATION');
  const roles = await prisma.role.findMany({ where: { key: { in: roleKeys } }, include: { permissions: { include: { permission: true } } } });
  if (roles.length !== roleKeys.length) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'roleKeys', code: 'UNKNOWN_ROLE' }]);
  const excess = roles.flatMap((r) => r.permissions.map((p) => p.permission.key)).filter((k) => !actor.permissions.has(k));
  if (excess.length) throw new AppError(403, 'PERMISSION_DENIED', 'ROLE_EXCEEDS_ACTOR', { excess: [...new Set(excess)].slice(0, 20) });
  return roles;
}

export async function invite(input: { email: string; firstName: string; lastName: string; roleKeys: string[] }, actor: Actor) {
  const email = input.email.trim().toLowerCase();
  assertExternalEmail(email);
  if (await prisma.staffUser.findUnique({ where: { email } })) throw new AppError(409, 'VALIDATION_FAILED', 'EMAIL_TAKEN');
  const roles = await assertAssignable(actor, null, input.roleKeys);
  const now = new Date();
  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.staffUser.create({
      data: { email, firstName: input.firstName, lastName: input.lastName, status: 'INVITED', invitedById: actor.id, invitedAt: now, roles: { create: roles.map((r) => ({ roleId: r.id, assignedById: actor.id })) } },
    });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'employee.invited', resourceType: 'StaffUser', resourceId: u.id, resourceLabel: `${input.firstName} ${input.lastName}`, after: { roles: input.roleKeys } }, tx);
    return u;
  });
  // The link is shown to the inviter (round 17 B9) and e-mailed to the new employee (round 18).
  const link = adminLink('invite', await signStaffToken('staff_invite', user.id, staffTokenAnchor(now)));
  await mailLink(email, input.firstName, 'invite', link);
  return { id: user.id, link };
}

/** Resend rewrites invitedAt, which kills every earlier invitation token (24 §24.8). */
export async function resendInvite(id: string, actor: Actor) {
  const u = await prisma.staffUser.findUnique({ where: { id } });
  if (!u || u.deletedAt || u.status !== 'INVITED') throw new AppError(409, 'VALIDATION_FAILED', 'NOT_INVITED');
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.staffUser.update({ where: { id }, data: { invitedAt: now } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'employee.invite_resent', resourceType: 'StaffUser', resourceId: id, resourceLabel: `${u.firstName} ${u.lastName}` }, tx);
  });
  const link = adminLink('invite', await signStaffToken('staff_invite', id, staffTokenAnchor(now)));
  await mailLink(u.email, u.firstName, 'invite', link);
  return { link };
}

export async function inviteInfo(token: string) {
  const c = await verifyStaffToken('staff_invite', token);
  const u = c && (await prisma.staffUser.findUnique({ where: { id: c.sub } }));
  if (!c || !u || u.deletedAt || u.status !== 'INVITED' || staffTokenAnchor(u.invitedAt) !== c.anchor) throw new AppError(410, 'RESOURCE_GONE', 'INVITE_INVALID');
  return u;
}

/**
 * Live feedback while typing (24 §24.10 «evaluated client-side for feedback»): the same scoring as
 * the server enforces, so the meter and the verdict never disagree. The token names the person, whose
 * name and e-mail count against the password. The breach check runs only on submit.
 */
export async function passwordFeedback(token: string, purpose: 'invite' | 'reset', password: string) {
  const c = await verifyStaffToken(purpose === 'invite' ? 'staff_invite' : 'staff_password_reset', token);
  const u = c && (await prisma.staffUser.findUnique({ where: { id: c.sub }, select: { email: true, firstName: true, lastName: true } }));
  if (!u) throw new AppError(410, 'RESOURCE_GONE', 'LINK_INVALID');
  const score = password.length ? strength(password, u) : 0;
  return { score, long: password.length >= 12, ok: password.length >= 12 && password.length <= 128 && score >= 3 };
}

export async function acceptInvite(token: string, password: string) {
  const u = await inviteInfo(token);
  await assertPassword(password, u);
  const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  await prisma.$transaction(async (tx) => {
    // Conditional on the status still being INVITED: a replayed token finds nothing to update.
    const r = await tx.staffUser.updateMany({ where: { id: u.id, status: 'INVITED' }, data: { passwordHash: hash, passwordChangedAt: new Date(), status: 'ACTIVE' } });
    if (r.count !== 1) throw new AppError(410, 'RESOURCE_GONE', 'INVITE_INVALID');
    await audit({ actorId: u.id, actorEmail: u.email, action: 'employee.invite_accepted', resourceType: 'StaffUser', resourceId: u.id, after: { invitedById: u.invitedById } }, tx);
  });
  return { email: u.email };
}

/** Lifting a BLOCKED account forces a new password (24 §24.7): the credential is presumed compromised. */
export async function acceptPasswordReset(token: string, password: string) {
  const c = await verifyStaffToken('staff_password_reset', token);
  const u = c && (await prisma.staffUser.findUnique({ where: { id: c.sub } }));
  if (!c || !u || u.deletedAt || u.status !== 'ACTIVE' || staffTokenAnchor(u.passwordChangedAt) !== c.anchor) throw new AppError(410, 'RESOURCE_GONE', 'RESET_INVALID');
  await assertPassword(password, u);
  if (u.passwordHash && (await argon2.verify(u.passwordHash, password).catch(() => false))) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'password', code: 'PASSWORD_REUSED' }]);
  const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  await prisma.$transaction(async (tx) => {
    await tx.staffUser.update({ where: { id: u.id }, data: { passwordHash: hash, passwordChangedAt: new Date(), failedLoginCount: 0, lockedUntil: null } });
    await revokeSessions(tx, u.id);
    await audit({ actorId: u.id, actorEmail: u.email, action: 'auth.password_changed', resourceType: 'StaffUser', resourceId: u.id }, tx);
  });
  return { email: u.email };
}

const TRANSITIONS: Record<string, { from: StaffStatus[]; to: StaffStatus; perm: string; action: string }> = {
  suspend: { from: ['ACTIVE'], to: 'SUSPENDED', perm: 'employees.suspend', action: 'employee.suspended' },
  unsuspend: { from: ['SUSPENDED'], to: 'ACTIVE', perm: 'employees.suspend', action: 'employee.unsuspended' },
  block: { from: ['ACTIVE', 'SUSPENDED'], to: 'BLOCKED', perm: 'employees.block', action: 'employee.blocked' },
  unblock: { from: ['BLOCKED'], to: 'ACTIVE', perm: 'employees.block', action: 'employee.unblocked' },
  deactivate: { from: ['ACTIVE', 'SUSPENDED', 'BLOCKED', 'INVITED'], to: 'DEACTIVATED', perm: 'employees.deactivate', action: 'employee.deactivated' },
};

export async function changeStatus(id: string, op: keyof typeof TRANSITIONS, actor: Actor) {
  const t = TRANSITIONS[op]!;
  if (!actor.permissions.has(t.perm)) throw forbidden();
  if (id === actor.id) throw new AppError(403, 'PERMISSION_DENIED', 'SELF_STATUS');
  const u = await prisma.staffUser.findUnique({ where: { id } });
  if (!u || u.deletedAt) throw new AppError(404, 'NOT_FOUND');
  if (!t.from.includes(u.status)) throw new AppError(409, 'VALIDATION_FAILED', 'STATUS_NOT_ALLOWED', { from: u.status });
  let link: string | undefined;
  await prisma.$transaction(async (tx) => {
    const data: Prisma.StaffUserUpdateInput = { status: t.to, permVersion: { increment: 1 } };
    // T41: blocked, suspended or gone — Telegram is disconnected, quietly.
    if (t.to !== 'ACTIVE') Object.assign(data, { telegramChatId: null, telegramUsername: null, telegramLinkedAt: null });
    if (op === 'suspend') data.suspendedAt = new Date();
    if (op === 'unsuspend') data.suspendedAt = null;
    // Unblocking: the old password stops working and a reset link is the only way back in.
    if (op === 'unblock') { data.passwordHash = null; data.passwordChangedAt = new Date(); data.failedLoginCount = 0; data.lockedUntil = null; }
    const updated = await tx.staffUser.update({ where: { id }, data });
    if (t.to !== 'ACTIVE') await revokeSessions(tx, id);
    await audit({ actorId: actor.id, actorEmail: actor.email, action: t.action, resourceType: 'StaffUser', resourceId: id, resourceLabel: `${u.firstName} ${u.lastName}`, before: { status: u.status }, after: { status: t.to } }, tx);
    if (op === 'unblock') link = adminLink('reset-password', await signStaffToken('staff_password_reset', id, staffTokenAnchor(updated.passwordChangedAt)));
  }).catch(rethrowOwner);
  invalidatePermissions(id);
  if (link) await mailLink(u.email, u.firstName, 'reset', link);
  return { status: t.to, ...(link ? { link } : {}) };
}

export async function setRoles(id: string, roleKeys: string[], actor: Actor) {
  const roles = await assertAssignable(actor, id, roleKeys);
  const u = await prisma.staffUser.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
  if (!u || u.deletedAt) throw new AppError(404, 'NOT_FOUND');
  // Removing a role you could not have granted is also escalation-adjacent: only within what you hold.
  const before = u.roles.map((r) => r.role.key);
  await assertAssignable(actor, id, before.filter((k) => !roleKeys.includes(k)));
  await prisma.$transaction(async (tx) => {
    await tx.staffRoleAssignment.deleteMany({ where: { staffUserId: id, role: { key: { notIn: roleKeys } } } });
    for (const r of roles.filter((x) => !before.includes(x.key))) await tx.staffRoleAssignment.create({ data: { staffUserId: id, roleId: r.id, assignedById: actor.id } });
    await tx.staffUser.update({ where: { id }, data: { permVersion: { increment: 1 } } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'role.assigned', resourceType: 'StaffUser', resourceId: id, resourceLabel: `${u.firstName} ${u.lastName}`, before: { roles: before }, after: { roles: roleKeys } }, tx);
  }).catch(rethrowOwner);
  invalidatePermissions(id);
}

/** Round 9 §F3: an Administrator cannot reset the Owner's 2FA; owners are reset only by another owner. */
export async function resetMfa(id: string, actor: Actor) {
  if (id === actor.id) throw new AppError(403, 'PERMISSION_DENIED', 'SELF_STATUS');
  const u = await prisma.staffUser.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
  if (!u || u.deletedAt) throw new AppError(404, 'NOT_FOUND');
  const targetIsOwner = u.roles.some((r) => r.role.key === 'owner');
  const actorIsOwner = (await prisma.staffRoleAssignment.count({ where: { staffUserId: actor.id, role: { key: 'owner' } } })) > 0;
  if (targetIsOwner && !actorIsOwner) throw new AppError(403, 'PERMISSION_DENIED', 'OWNER_MFA_OWNER_ONLY');
  await prisma.$transaction(async (tx) => {
    await tx.staffUser.update({ where: { id }, data: { twoFactorSecret: null, twoFactorEnabledAt: null, twoFactorLastStep: null } });
    await tx.staffRecoveryCode.deleteMany({ where: { staffUserId: id } });
    await revokeSessions(tx, id);
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'employee.mfa_reset', resourceType: 'StaffUser', resourceId: id, resourceLabel: `${u.firstName} ${u.lastName}` }, tx);
  });
}

function rethrowOwner(e: unknown): never {
  if (e instanceof Error && e.message.includes('INVARIANT_LAST_OWNER')) throw new AppError(409, 'VALIDATION_FAILED', 'LAST_OWNER');
  throw e;
}
