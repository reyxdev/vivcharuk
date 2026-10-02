import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission, requireStaff } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { resolvePermissions } from '../auth/permissions';
import { KINDS, type Kind } from './notices';
import { botHealth, botUsername, issueLink, sendTo, telegramAllowedFor, telegramConfigured, unlinkTelegram } from './telegram';

// Personal Telegram notifications (docs/00-client-decisions-21.md): one-tap link + QR, per-person choice
// of what to receive, the owner's control in «Співробітники», the bot's health in Settings.
const isOwner = async (id: string) => (await prisma.staffRoleAssignment.count({ where: { staffUserId: id, role: { key: 'owner' } } })) > 0;

async function kindsFor(staffId: string, permVersion: number) {
  const perms = await resolvePermissions(staffId, permVersion);
  const owner = await isOwner(staffId);
  const tech = (await prisma.staffRoleAssignment.count({ where: { staffUserId: staffId, role: { key: 'tech' } } })) > 0;
  return (Object.entries(KINDS) as Array<[Kind, (typeof KINDS)[Kind]]>)
    .filter(([, k]) => (k.perm === 'tech' ? tech : k.perm === 'owner' ? owner : k.perm === 'self' ? true : perms.has(k.perm)))
    .map(([key, k]) => ({ key, label: k.label }));
}

export async function telegramRoutes(app: FastifyInstance) {
  const me = (id: string) => prisma.staffUser.findUniqueOrThrow({ where: { id }, select: { id: true, firstName: true, email: true, permVersion: true, telegramAllowed: true, telegramChatId: true, telegramUsername: true, telegramLinkedAt: true, telegramPrefs: true } });

  app.get('/auth/staff/telegram', { preHandler: requireStaff }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const u = await me(req.staff!.id);
    const prefs = (u.telegramPrefs ?? {}) as Record<string, boolean>;
    return {
      botConfigured: telegramConfigured(), botUsername: botUsername(), allowed: await telegramAllowedFor(u),
      linked: u.telegramChatId ? { username: u.telegramUsername, linkedAt: u.telegramLinkedAt?.toISOString() ?? null } : null,
      kinds: (await kindsFor(u.id, u.permVersion)).map((k) => ({ ...k, on: prefs[k.key] !== false })),
    };
  });

  // One-tap link + QR + 6-digit fallback, 10 minutes (T01–T04).
  app.post('/auth/staff/telegram/link', { preHandler: requireStaff, config: { rateLimit: { max: 10, timeWindow: '1 hour' } } }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const u = await me(req.staff!.id);
    if (!telegramConfigured()) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'bot', code: 'NOT_CONFIGURED' }]);
    if (!(await telegramAllowedFor(u))) throw new AppError(403, 'PERMISSION_DENIED');
    const l = await issueLink(u.id);
    return { url: l.url, code: l.code, expiresAt: l.expiresAt, botUsername: botUsername() };
  });

  // T23: what to receive, by kind.
  app.put('/auth/staff/telegram/prefs', { preHandler: requireStaff }, async (req, reply) => {
    const b = z.record(z.string(), z.boolean()).parse(req.body);
    const keys = Object.keys(KINDS);
    await prisma.staffUser.update({ where: { id: req.staff!.id }, data: { telegramPrefs: Object.fromEntries(Object.entries(b).filter(([k]) => keys.includes(k))) } });
    return reply.status(204).send();
  });

  app.delete('/auth/staff/telegram', { preHandler: requireStaff }, async (req, reply) => {
    await unlinkTelegram(req.staff!.id);
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'staff.telegram_unlinked', resourceType: 'StaffUser', resourceId: req.staff!.id });
    return reply.status(204).send();
  });

  app.post('/auth/staff/telegram/test', { preHandler: requireStaff, config: { rateLimit: { max: 10, timeWindow: '1 hour' } } }, async (req) => {
    const u = await me(req.staff!.id);
    if (!u.telegramChatId) return { sent: false };
    await sendTo(u.telegramChatId, `🔔 Перевірка, ${u.firstName}: сповіщення «Вівчарика» працюють.`, { silent: false });
    return { sent: true };
  });

  // T43: who receives notices and when the last one arrived.
  app.get('/admin/employees/telegram', { preHandler: requirePermission('employees.read') }, async () => {
    const rows = await prisma.staffUser.findMany({ select: { id: true, telegramAllowed: true, telegramChatId: true, telegramUsername: true, telegramLastSentAt: true, roles: { select: { role: { select: { key: true } } } } } });
    return {
      botConfigured: telegramConfigured(),
      items: rows.map((r) => {
        const owner = r.roles.some((x) => x.role.key === 'owner');
        return { id: r.id, owner, allowed: r.telegramAllowed || owner, linked: !!r.telegramChatId, username: r.telegramUsername, lastSentAt: r.telegramLastSentAt?.toISOString() ?? null };
      }),
    };
  });

  app.patch<{ Params: { id: string } }>('/admin/employees/:id/telegram', { preHandler: requirePermission('employees.update') }, async (req, reply) => {
    const b = z.object({ allowed: z.boolean().optional(), unlink: z.literal(true).optional() }).parse(req.body);
    const u = await prisma.staffUser.findUnique({ where: { id: req.params.id }, select: { id: true, email: true } });
    if (!u) throw new AppError(404, 'NOT_FOUND');
    if (b.allowed !== undefined) {
      await prisma.staffUser.update({ where: { id: u.id }, data: { telegramAllowed: b.allowed } });
      if (!b.allowed && !(await isOwner(u.id))) await unlinkTelegram(u.id);
    }
    if (b.unlink) await unlinkTelegram(u.id);
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: b.unlink || b.allowed === false ? 'staff.telegram_unlinked' : 'staff.telegram_allowed', resourceType: 'StaffUser', resourceId: u.id, resourceLabel: u.email });
    return reply.status(204).send();
  });

  // T10: the owner shows a QR for a colleague, who scans it with their own phone; the bot asks them to confirm.
  app.post<{ Params: { id: string } }>('/admin/employees/:id/telegram/link', { preHandler: requirePermission('employees.update'), config: { rateLimit: { max: 20, timeWindow: '1 hour' } } }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const u = await prisma.staffUser.findUnique({ where: { id: req.params.id }, select: { id: true, email: true, status: true, telegramAllowed: true } });
    if (!u || u.status !== 'ACTIVE') throw new AppError(404, 'NOT_FOUND');
    if (!(await telegramAllowedFor(u))) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'allowed', code: 'NOT_ALLOWED' }]);
    const l = await issueLink(u.id);
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'staff.telegram_link_issued', resourceType: 'StaffUser', resourceId: u.id, resourceLabel: u.email });
    return { url: l.url, code: l.code, expiresAt: l.expiresAt };
  });

  // T47: is the bot alive?
  app.get('/admin/telegram/health', { preHandler: requirePermission('settings.read') }, async () => botHealth());
}
