import type { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { getSetting, invalidateSetting } from '../../lib/settings';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { DEFAULT_AUTOREPLY, DEFAULT_LABELS, DEFAULT_TEMPLATES, MAIL_AUTOREPLY_KEY, MAIL_LABELS_KEY, MAIL_TEMPLATES_KEY } from './defaults';
import { OVERDUE_WORKING_MINUTES, workingMinutesBetween } from './hours';
import { mailSyncStatus, markSeen, syncNow } from './imap';
import { catalogueFiles, cleanReply, MAX_ATTACH_BYTES, messageFiles, sendFromMailbox, type OutFile } from './send';
import { isViewable, readStored, removeStored } from './store';

// «Пошта» in the panel (round 19 D1). Statuses: OPEN = Нове, WAITING = Відповіли, CLOSED = Закрито.

const VIEWS = { inbox: 'OPEN', replied: 'WAITING', closed: 'CLOSED', spam: 'SPAM' } as const;
const PAGE = 40;

const domainOf = (email: string) => `@${email.split('@')[1] ?? ''}`;

async function senderRules(emails: string[]) {
  const patterns = [...new Set(emails.flatMap((e) => [e, domainOf(e)]))];
  const rules = patterns.length ? await prisma.mailSenderRule.findMany({ where: { pattern: { in: patterns } } }) : [];
  return (email: string) => {
    const r = rules.filter((x) => x.pattern === email || x.pattern === domainOf(email));
    return { blocked: r.some((x) => x.action === 'BLOCK'), vip: r.some((x) => x.action === 'VIP') };
  };
}

function overdue(status: string, lastInboundAt: Date | null) {
  if (status !== 'OPEN' || !lastInboundAt) return false;
  if (Date.now() - lastInboundAt.getTime() > 10 * 86_400_000) return true;
  return workingMinutesBetween(lastInboundAt, new Date()) >= OVERDUE_WORKING_MINUTES;
}

const fileIn = z.object({ filename: z.string().min(1).max(200), contentType: z.string().max(100), base64: z.string() });
const decodeFiles = (files: Array<z.infer<typeof fileIn>>): OutFile[] => files.map((f) => ({ filename: f.filename, contentType: f.contentType || 'application/octet-stream', content: Buffer.from(f.base64, 'base64') }));

export async function mailRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (req, reply) => { if (req.url.includes('/admin/mail')) reply.header('cache-control', 'no-store'); });

  app.get('/admin/mail/threads', { preHandler: requirePermission('mail.read') }, async (req) => {
    const q = z.object({
      view: z.enum(['inbox', 'replied', 'closed', 'spam', 'bin', 'all']).default('inbox'),
      q: z.string().trim().max(200).optional(), label: z.string().max(40).optional(), page: z.coerce.number().int().min(1).default(1),
    }).parse(req.query);
    const staffId = req.staff!.id;
    const where: Prisma.MailThreadWhereInput = {
      ...(q.view === 'bin' ? { deletedAt: { not: null } } : { deletedAt: null }),
      ...(q.view in VIEWS ? { status: VIEWS[q.view as keyof typeof VIEWS] } : q.view === 'all' ? { status: { not: 'SPAM' } } : {}),
      ...(q.label ? { labels: { has: q.label } } : {}),
      ...(q.q ? {
        OR: [
          { subject: { contains: q.q, mode: 'insensitive' } }, { counterpartEmail: { contains: q.q, mode: 'insensitive' } },
          { counterpartName: { contains: q.q, mode: 'insensitive' } },
          { messages: { some: { OR: [{ textBody: { contains: q.q, mode: 'insensitive' } }, { fromEmail: { contains: q.q, mode: 'insensitive' } }] } } },
          { order: { number: { contains: q.q, mode: 'insensitive' } } },
        ],
      } : {}),
    };
    const [rows, total, counts] = await Promise.all([
      prisma.mailThread.findMany({
        where, orderBy: { lastMessageAt: 'desc' }, skip: (q.page - 1) * PAGE, take: PAGE,
        include: {
          reads: { where: { staffUserId: staffId } }, order: { select: { number: true } },
          messages: { orderBy: { occurredAt: 'desc' }, take: 1, select: { textBody: true, direction: true, authVerdict: true, _count: { select: { attachments: true } } } },
        },
      }),
      prisma.mailThread.count({ where }),
      prisma.mailThread.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
    ]);
    const rule = await senderRules(rows.map((r) => r.counterpartEmail));
    const unread = await unreadCount(staffId);
    return {
      items: rows.map((t) => {
        const m = t.messages[0];
        return {
          id: t.id, subject: t.subject, counterpartEmail: t.counterpartEmail, counterpartName: t.counterpartName, status: t.status, labels: t.labels,
          lastMessageAt: t.lastMessageAt.toISOString(), orderNumber: t.order?.number ?? null, deleted: !!t.deletedAt,
          unread: !!t.lastInboundAt && (!t.reads[0] || t.reads[0].readAt < t.lastInboundAt),
          preview: (m?.textBody ?? '').replace(/\s+/g, ' ').slice(0, 140), lastFromUs: m?.direction === 'OUTBOUND',
          hasAttachments: (m?._count.attachments ?? 0) > 0, suspicious: !!(m?.authVerdict as { suspicious?: boolean } | null)?.suspicious,
          overdue: overdue(t.status, t.lastInboundAt), ...rule(t.counterpartEmail),
        };
      }),
      total, pageSize: PAGE, counts: Object.fromEntries(counts.map((c) => [c.status, c._count])), unread, sync: mailSyncStatus(),
    };
  });

  app.get('/admin/mail/unread', { preHandler: requirePermission('mail.read') }, async (req) => ({ unread: await unreadCount(req.staff!.id) }));

  app.get<{ Params: { id: string } }>('/admin/mail/threads/:id', { preHandler: requirePermission('mail.read') }, async (req) => {
    const t = await prisma.mailThread.findUnique({
      where: { id: req.params.id },
      include: {
        messages: { orderBy: { occurredAt: 'asc' }, include: { attachments: { select: { id: true, filename: true, contentType: true, sizeBytes: true, contentId: true, isInline: true, riskFlag: true } }, sentBy: { select: { firstName: true, lastName: true } } } },
        notes: { orderBy: { createdAt: 'asc' } }, order: { select: { number: true, status: true, totalMinor: true, placedAt: true } },
        drafts: { where: { staffUserId: req.staff!.id } },
      },
    });
    if (!t) throw new AppError(404, 'NOT_FOUND');
    const authors = await prisma.staffUser.findMany({ where: { id: { in: t.notes.map((n) => n.authorId).filter((x): x is string => !!x) } }, select: { id: true, firstName: true } });
    const orders = await prisma.order.findMany({ where: { email: { equals: t.counterpartEmail, mode: 'insensitive' } }, orderBy: { placedAt: 'desc' }, take: 10, select: { number: true, status: true, totalMinor: true, placedAt: true, phone: true } });
    const rule = (await senderRules([t.counterpartEmail]))(t.counterpartEmail);

    // Reading marks the thread read for this person and the letters \Seen in the mailbox (D1 #25).
    const lastShown = t.messages.at(-1)?.occurredAt ?? t.lastMessageAt;
    await prisma.mailThreadRead.upsert({ where: { threadId_staffUserId: { threadId: t.id, staffUserId: req.staff!.id } }, update: { readAt: lastShown }, create: { threadId: t.id, staffUserId: req.staff!.id, readAt: lastShown } });
    void markSeen(t.messages.filter((m) => m.direction === 'INBOUND')).catch(() => undefined);

    return {
      id: t.id, subject: t.subject, counterpartEmail: t.counterpartEmail, counterpartName: t.counterpartName, status: t.status, labels: t.labels,
      deleted: !!t.deletedAt, order: t.order ? { ...t.order, placedAt: t.order.placedAt.toISOString() } : null,
      customerOrders: orders.map(({ phone: _p, ...o }) => ({ ...o, placedAt: o.placedAt.toISOString() })), ...rule,
      customerPhone: orders.find((o) => !o.phone.startsWith('anon-'))?.phone ?? null, // round 20 #170: link to the customer card
      draft: t.drafts[0]?.bodyHtml ?? '',
      notes: t.notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString(), author: authors.find((a) => a.id === n.authorId)?.firstName ?? null })),
      messages: t.messages.map((m) => ({
        id: m.id, direction: m.direction, kind: m.kind, fromEmail: m.fromEmail, fromName: m.fromName, toEmails: m.toEmails, ccEmails: m.ccEmails,
        subject: m.subject, textBody: m.textBody, html: m.htmlSanitized, occurredAt: m.occurredAt.toISOString(), verdict: m.authVerdict,
        sentBy: m.sentBy ? `${m.sentBy.firstName} ${m.sentBy.lastName}`.trim() : null, autoReply: m.templateKey === 'autoreply',
        attachments: m.attachments.map((a) => ({ ...a, viewable: isViewable(a.contentType) })),
      })),
    };
  });

  app.post<{ Params: { id: string } }>('/admin/mail/threads/:id/reply', { preHandler: requirePermission('mail.reply'), bodyLimit: 30_000_000 }, async (req) => {
    const b = z.object({ bodyHtml: z.string().max(200_000), files: z.array(fileIn).max(20).default([]), mediaIds: z.array(z.string()).max(20).default([]) }).parse(req.body);
    const t = await prisma.mailThread.findUnique({ where: { id: req.params.id }, include: { messages: { where: { direction: 'INBOUND' }, orderBy: { occurredAt: 'desc' }, take: 1 } } });
    if (!t) throw new AppError(404, 'NOT_FOUND');
    const last = t.messages[0] ?? await prisma.mailMessage.findFirst({ where: { threadId: t.id }, orderBy: { occurredAt: 'desc' } });
    const staff = await prisma.staffUser.findUniqueOrThrow({ where: { id: req.staff!.id }, select: { id: true, firstName: true } });
    const subject = /^re:/i.test(t.subject) ? t.subject : `Re: ${t.subject}`;
    const files = [...decodeFiles(b.files), ...await catalogueFiles(b.mediaIds)];
    const r = await sendFromMailbox({
      threadId: t.id, staff, to: t.counterpartEmail, subject, bodyHtml: b.bodyHtml, files, mode: 'reply',
      quote: last ? { fromName: last.fromName, fromEmail: last.fromEmail, occurredAt: last.occurredAt, textBody: last.textBody } : undefined,
      inReplyTo: last?.messageIdHeader ?? null, references: last?.references ?? [],
    });
    await audit({ actorId: staff.id, actorEmail: req.staff!.email, action: 'mail.replied', resourceType: 'MailThread', resourceId: t.id, resourceLabel: t.counterpartEmail });
    return r;
  });

  app.post<{ Params: { id: string } }>('/admin/mail/threads/:id/forward', { preHandler: requirePermission('mail.reply'), bodyLimit: 30_000_000 }, async (req) => {
    const b = z.object({ to: z.string().email().max(200), messageId: z.string(), bodyHtml: z.string().max(200_000).default(''), includeFiles: z.boolean().default(true), files: z.array(fileIn).max(20).default([]) }).parse(req.body);
    const m = await prisma.mailMessage.findFirst({ where: { id: b.messageId, threadId: req.params.id } });
    if (!m) throw new AppError(404, 'NOT_FOUND');
    const staff = await prisma.staffUser.findUniqueOrThrow({ where: { id: req.staff!.id }, select: { id: true, firstName: true } });
    const files = [...decodeFiles(b.files), ...(b.includeFiles ? await messageFiles(m.id) : [])];
    const r = await sendFromMailbox({
      threadId: req.params.id, staff, to: b.to.toLowerCase(), subject: /^fwd?:/i.test(m.subject) ? m.subject : `Fwd: ${m.subject}`,
      bodyHtml: b.bodyHtml || '<p>Пересилаю лист.</p>', files, mode: 'forward',
      quote: { fromName: m.fromName, fromEmail: m.fromEmail, occurredAt: m.occurredAt, textBody: m.textBody },
    });
    await audit({ actorId: staff.id, actorEmail: req.staff!.email, action: 'mail.forwarded', resourceType: 'MailThread', resourceId: req.params.id, resourceLabel: b.to });
    return r;
  });

  app.put<{ Params: { id: string } }>('/admin/mail/threads/:id/draft', { preHandler: requirePermission('mail.reply') }, async (req, reply) => {
    const b = z.object({ bodyHtml: z.string().max(200_000) }).parse(req.body);
    const body = cleanReply(b.bodyHtml);
    const key = { threadId: req.params.id, staffUserId: req.staff!.id };
    if (!body.replace(/<[^>]+>/g, '').trim()) await prisma.mailDraft.deleteMany({ where: key });
    else await prisma.mailDraft.upsert({ where: { threadId_staffUserId: key }, update: { bodyHtml: body }, create: { ...key, bodyHtml: body } });
    return reply.status(204).send();
  });

  app.patch<{ Params: { id: string } }>('/admin/mail/threads/:id', { preHandler: requirePermission('mail.update') }, async (req, reply) => {
    const b = z.object({
      status: z.enum(['OPEN', 'WAITING', 'CLOSED', 'SPAM']).optional(), labels: z.array(z.string().max(40)).max(10).optional(),
      orderNumber: z.string().max(30).nullable().optional(), deleted: z.boolean().optional(), unread: z.literal(true).optional(),
    }).parse(req.body);
    const t = await prisma.mailThread.findUnique({ where: { id: req.params.id } });
    if (!t) throw new AppError(404, 'NOT_FOUND');
    let orderId: string | null | undefined;
    if (b.orderNumber !== undefined) {
      orderId = b.orderNumber ? (await prisma.order.findUnique({ where: { number: b.orderNumber.toUpperCase() }, select: { id: true } }))?.id : null;
      if (orderId === undefined) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'orderNumber', code: 'NOT_FOUND' }]);
    }
    await prisma.mailThread.update({
      where: { id: t.id },
      data: {
        ...(b.status ? { status: b.status } : {}), ...(b.labels ? { labels: b.labels } : {}), ...(orderId !== undefined ? { orderId } : {}),
        ...(b.deleted !== undefined ? { deletedAt: b.deleted ? new Date() : null } : {}),
      },
    });
    if (b.unread) await prisma.mailThreadRead.deleteMany({ where: { threadId: t.id, staffUserId: req.staff!.id } });
    if (b.status && b.status !== t.status) await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'mail.status_changed', resourceType: 'MailThread', resourceId: t.id, before: { status: t.status }, after: { status: b.status } });
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>('/admin/mail/threads/:id', { preHandler: requirePermission('mail.delete') }, async (req, reply) => {
    const t = await prisma.mailThread.findUnique({ where: { id: req.params.id }, select: { id: true, deletedAt: true, counterpartEmail: true } });
    if (!t) throw new AppError(404, 'NOT_FOUND');
    if (!t.deletedAt) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'id', code: 'NOT_IN_BIN' }]);
    await purgeThreads([t.id]);
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'mail.deleted', resourceType: 'MailThread', resourceId: t.id, resourceLabel: t.counterpartEmail });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/mail/threads/:id/notes', { preHandler: requirePermission('mail.update') }, async (req) => {
    const b = z.object({ body: z.string().trim().min(1).max(5000) }).parse(req.body);
    const n = await prisma.mailNote.create({ data: { threadId: req.params.id, authorId: req.staff!.id, body: b.body } });
    return { id: n.id };
  });

  // Block or star a sender (D1 #20, #48). `scope: domain` blocks the whole @host.
  app.post('/admin/mail/senders', { preHandler: requirePermission('mail.update') }, async (req, reply) => {
    const b = z.object({ email: z.string().email(), action: z.enum(['BLOCK', 'VIP']), on: z.boolean(), scope: z.enum(['address', 'domain']).default('address') }).parse(req.body);
    const email = b.email.toLowerCase();
    const pattern = b.scope === 'domain' ? domainOf(email) : email;
    if (b.on) {
      await prisma.mailSenderRule.upsert({ where: { pattern }, update: { action: b.action }, create: { pattern, action: b.action, createdById: req.staff!.id } });
      if (b.action === 'BLOCK') await prisma.mailThread.updateMany({ where: b.scope === 'domain' ? { counterpartEmail: { endsWith: pattern } } : { counterpartEmail: email }, data: { status: 'SPAM' } });
    } else {
      await prisma.mailSenderRule.deleteMany({ where: { pattern, action: b.action } });
    }
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: `mail.sender_${b.action.toLowerCase()}_${b.on ? 'on' : 'off'}`, resourceType: 'MailSenderRule', resourceLabel: pattern });
    return reply.status(204).send();
  });

  app.get<{ Params: { id: string } }>('/admin/mail/attachments/:id', { preHandler: requirePermission('mail.read') }, async (req, reply) => {
    const a = await prisma.mailAttachment.findUnique({ where: { id: req.params.id } });
    if (!a || !a.objectKey) throw new AppError(404, 'NOT_FOUND');
    const q = z.object({ download: z.literal('1').optional() }).parse(req.query);
    const inline = !q.download && isViewable(a.contentType) && !a.riskFlag;
    reply.header('content-type', inline ? a.contentType : 'application/octet-stream');
    reply.header('content-disposition', `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(a.filename)}`);
    reply.header('x-content-type-options', 'nosniff');
    reply.header('content-security-policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
    reply.header('cache-control', 'private, max-age=3600');
    return reply.send(readStored(a.objectKey));
  });

  app.get<{ Params: { orderId: string } }>('/admin/mail/by-order/:orderId', { preHandler: requirePermission('mail.read') }, async (req) => {
    const rows = await prisma.mailThread.findMany({ where: { orderId: req.params.orderId, deletedAt: null }, orderBy: { lastMessageAt: 'desc' }, select: { id: true, subject: true, status: true, lastMessageAt: true, counterpartEmail: true } });
    return { items: rows.map((r) => ({ ...r, lastMessageAt: r.lastMessageAt.toISOString() })) };
  });

  app.get('/admin/mail/settings', { preHandler: requirePermission('mail.read') }, async () => ({
    templates: await getSetting(MAIL_TEMPLATES_KEY, DEFAULT_TEMPLATES), labels: await getSetting(MAIL_LABELS_KEY, DEFAULT_LABELS),
    autoreply: await getSetting(MAIL_AUTOREPLY_KEY, DEFAULT_AUTOREPLY), sync: mailSyncStatus(), maxAttachBytes: MAX_ATTACH_BYTES,
  }));

  app.put('/admin/mail/settings', { preHandler: requirePermission('mail.manage_mailboxes') }, async (req, reply) => {
    const b = z.object({
      templates: z.array(z.object({ key: z.string().min(1).max(40), title: z.string().min(1).max(80), body: z.string().max(5000) })).max(50).optional(),
      labels: z.array(z.object({ key: z.string().min(1).max(40), title: z.string().min(1).max(40), color: z.string().max(20) })).max(20).optional(),
      autoreply: z.object({ enabled: z.boolean(), subject: z.string().max(200), body: z.string().max(3000) }).optional(),
    }).parse(req.body);
    for (const [key, value] of [[MAIL_TEMPLATES_KEY, b.templates], [MAIL_LABELS_KEY, b.labels], [MAIL_AUTOREPLY_KEY, b.autoreply]] as const) {
      if (value === undefined) continue;
      await prisma.setting.upsert({ where: { key }, update: { value, updatedById: req.staff!.id }, create: { key, value, updatedById: req.staff!.id } });
      invalidateSetting(key);
    }
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'mail.settings_changed', resourceType: 'Setting', resourceLabel: Object.keys(b).join(', ') });
    return reply.status(204).send();
  });

  // Catalogue photos to attach to a reply (D1 #17): local media of products matching the search.
  app.get('/admin/mail/catalogue-photos', { preHandler: requirePermission('mail.reply') }, async (req) => {
    const q = z.object({ q: z.string().trim().max(100).default('') }).parse(req.query);
    const products = await prisma.product.findMany({
      where: { deletedAt: null, ...(q.q ? { OR: [{ sku: { contains: q.q, mode: 'insensitive' } }, { translations: { some: { locale: 'uk', name: { contains: q.q, mode: 'insensitive' } } } }] } : {}) },
      orderBy: { updatedAt: 'desc' }, take: 12,
      select: { id: true, sku: true, translations: { where: { locale: 'uk' }, select: { name: true } }, media: { orderBy: { position: 'asc' }, take: 6, select: { media: { select: { id: true, provider: true, publicId: true } } } } },
    });
    return {
      items: products.map((p) => ({
        id: p.id, sku: p.sku, name: p.translations[0]?.name ?? p.sku,
        photos: p.media.map((m) => m.media).filter((m) => m.provider === 'local').map((m) => ({ id: m.id, thumb: `/media/${m.publicId.slice('local:'.length)}-480.webp` })),
      })).filter((p) => p.photos.length),
    };
  });

  app.post('/admin/mail/sync', { preHandler: requirePermission('mail.read') }, async () => { await syncNow(); return mailSyncStatus(); });
}

export async function unreadCount(staffId: string) {
  const rows = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT count(*) AS n FROM "MailThread" t
    LEFT JOIN "MailThreadRead" r ON r."threadId" = t.id AND r."staffUserId" = ${staffId}
    WHERE t."deletedAt" IS NULL AND t.status <> 'SPAM' AND t."lastInboundAt" IS NOT NULL AND (r."readAt" IS NULL OR r."readAt" < t."lastInboundAt")`;
  return Number(rows[0]?.n ?? 0);
}

/** Removes threads with their files; a file shared with another letter (same hash) stays. */
export async function purgeThreads(ids: string[]) {
  if (!ids.length) return;
  const files = await prisma.mailAttachment.findMany({ where: { message: { threadId: { in: ids } } }, select: { objectKey: true } });
  const raws = await prisma.mailMessage.findMany({ where: { threadId: { in: ids }, rawObjectKey: { not: null } }, select: { rawObjectKey: true } });
  await prisma.mailThread.deleteMany({ where: { id: { in: ids } } });
  for (const key of new Set(files.map((f) => f.objectKey).filter(Boolean))) {
    if (!(await prisma.mailAttachment.count({ where: { objectKey: key } }))) removeStored(key);
  }
  for (const r of raws) if (r.rawObjectKey && !(await prisma.mailMessage.count({ where: { rawObjectKey: r.rawObjectKey } }))) removeStored(r.rawObjectKey);
}
