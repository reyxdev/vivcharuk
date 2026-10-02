import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Prisma, SubscriberStatus } from '@prisma/client';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { confirm, requestConsent, unsubscribe } from './newsletter.service';

// Round 19 D2. The storefront page /<locale>/rozsylka posts the token from the letter's link, so mail
// scanners that only open links never confirm or unsubscribe anyone. The unsubscribe endpoint also
// answers the RFC 8058 one-click POST that mail apps send from the List-Unsubscribe header.
const token = z.object({ token: z.string().min(16).max(200) });

export async function newsletterRoutes(app: FastifyInstance) {
  app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_r, body, done) => done(null, Object.fromEntries(new URLSearchParams(body as string))));
  app.post('/newsletter/confirm', { config: { rateLimit: { max: 30, timeWindow: '1 hour' } } }, async (req) => ({ result: await confirm(token.parse({ ...(req.query as object), ...(typeof req.body === 'object' ? req.body as object : {}) }).token) }));
  app.post('/newsletter/unsubscribe', { config: { rateLimit: { max: 30, timeWindow: '1 hour' } } }, async (req) => ({ result: await unsubscribe(token.parse({ ...(req.query as object), ...(typeof req.body === 'object' ? req.body as object : {}) }).token) }));

  // ---- Panel (round 19 D2): counts, the list, a manual add with where consent was given, CSV for the owner ----
  const isOwner = async (staffUserId: string) => (await prisma.staffRoleAssignment.count({ where: { staffUserId, role: { key: 'owner' } } })) > 0;

  app.get('/admin/subscribers', { preHandler: requirePermission('mail.read') }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const q = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'BOUNCED']).optional(), q: z.string().trim().max(100).optional(), cursor: z.string().max(40).optional() }).parse(req.query);
    const where: Prisma.SubscriberWhereInput = { ...(q.status ? { status: q.status } : {}), ...(q.q ? { email: { contains: q.q.toLowerCase() } } : {}) };
    const [groups, rows, owner] = await Promise.all([
      prisma.subscriber.groupBy({ by: ['status'], _count: true }),
      prisma.subscriber.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 51, ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}) }),
      isOwner(req.staff!.id),
    ]);
    const counts = Object.fromEntries(['PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'BOUNCED'].map((k) => [k, groups.find((g) => g.status === k)?._count ?? 0])) as Record<SubscriberStatus, number>;
    const page = rows.slice(0, 50);
    return {
      counts, isOwner: owner,
      items: page.map((s) => ({
        id: s.id, email: s.email, status: s.status, source: s.source, consentText: s.consentText, consentAt: s.consentAt?.toISOString() ?? null,
        confirmedAt: s.confirmedAt?.toISOString() ?? null, unsubscribedAt: s.unsubscribedAt?.toISOString() ?? null, createdAt: s.createdAt.toISOString(),
      })),
      nextCursor: rows.length > 50 ? page[page.length - 1]!.id : null,
    };
  });

  // A manual entry still gets the confirmation letter: subscribed only after the click (double opt-in).
  app.post('/admin/subscribers', { preHandler: requirePermission('mail.read'), config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
    if (!(await isOwner(req.staff!.id))) throw forbidden();
    const b = z.object({ email: z.string().trim().toLowerCase().email().max(254), note: z.string().trim().min(3).max(300) }).parse(req.body);
    const existing = await prisma.subscriber.findUnique({ where: { email: b.email } });
    if (existing?.status === 'CONFIRMED') throw new AppError(409, 'VALIDATION_FAILED', 'ALREADY_SUBSCRIBED');
    const row = await prisma.$transaction(async (tx) => {
      const s = await requestConsent(b.email, 'uk', { kind: 'manual', note: b.note, staffId: req.staff!.id }, tx);
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'subscriber.added', resourceType: 'Subscriber', resourceId: s.id, resourceLabel: b.email, after: { note: b.note } }, tx);
      return s;
    });
    return reply.status(201).send({ id: row.id, status: row.status });
  });

  app.get('/admin/subscribers/export', { preHandler: requirePermission('mail.read') }, async (req, reply) => {
    if (!(await isOwner(req.staff!.id))) throw forbidden();
    const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: 'asc' } });
    const cell = (v: string | null | undefined) => { const t = v ?? ''; return /[",\n\r;]/.test(t) || /^[=+\-@]/.test(t) ? `"${t.replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"` : t; };
    const STATUS = { PENDING: 'чекає підтвердження', CONFIRMED: 'підписаний', UNSUBSCRIBED: 'не писати (відписався)', BOUNCED: 'адреса не працює' } as const;
    const lines = [
      ['Пошта', 'Стан', 'Звідки', 'Згода', 'Дата згоди', 'Підтверджено', 'Мова'].join(','),
      ...rows.map((s) => [s.email, STATUS[s.status], s.source === 'checkout' ? 'оформлення замовлення' : 'додано вручну', s.consentText, s.consentAt?.toISOString().slice(0, 10), s.confirmedAt?.toISOString().slice(0, 10), s.locale].map(cell).join(',')),
    ];
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'subscriber.exported', resourceType: 'Subscriber', after: { rows: rows.length } });
    reply.header('cache-control', 'no-store').header('content-type', 'text/csv; charset=utf-8').header('content-disposition', 'attachment; filename="subscribers.csv"');
    return `\ufeff${lines.join('\r\n')}\r\n`;
  });
}
