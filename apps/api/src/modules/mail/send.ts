import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import sanitizeHtml from 'sanitize-html';
import { BUSINESS } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { getSetting } from '../../lib/settings';
import { sendMail } from '../../lib/mail';
import { prisma } from '../../lib/prisma';
import { DEFAULT_AUTOREPLY, MAIL_AUTOREPLY_KEY } from './defaults';
import { appendToSent, mailSyncEnabled } from './imap';
import { newMessageId } from './ingest';
import { readStored, riskOf, saveFile, sha256 } from './store';

// Replies from the panel go out as a person's letter from info@ through the mailbox's own SMTP
// (round 19 D1 #5), with a copy in Sent. Without MAILBOX_PASSWORD (development) the letter is
// written to mail-outbox/ instead.

const smtp = () => nodemailer.createTransport({
  host: config.mailbox.smtp.host, port: config.mailbox.smtp.port, secure: config.mailbox.smtp.port === 465,
  auth: { user: config.mailbox.address, pass: config.mailbox.password },
});
const OUTBOX = fileURLToPath(new URL('../../../../../mail-outbox/', import.meta.url));
export const MAX_ATTACH_BYTES = 20 * 1024 * 1024; // round 19 D1 #18

/** The reply editor's HTML: bold, italics, lists, links, paragraphs — nothing else (D1 #29). */
export const cleanReply = (html: string) => sanitizeHtml(html, {
  allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'blockquote'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
});
const toText = (html: string) => sanitizeHtml(html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|blockquote)>/gi, '\n').replace(/<li>/gi, '• '), { allowedTags: [], allowedAttributes: {} })
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export interface OutFile { filename: string; contentType: string; content: Buffer }

/** Catalogue photos by media id: the 1600 px WebP from local media (D1 #17). */
export async function catalogueFiles(mediaIds: string[]): Promise<OutFile[]> {
  if (!mediaIds.length) return [];
  const rows = await prisma.media.findMany({ where: { id: { in: mediaIds }, provider: 'local', kind: 'IMAGE' }, select: { id: true, publicId: true, translations: { where: { locale: 'uk' }, select: { alt: true } } } });
  return rows.flatMap((m) => {
    const file = path.join(config.media.dir, `${m.publicId.slice('local:'.length)}-1600.webp`);
    if (!existsSync(file)) return [];
    const name = (m.translations[0]?.alt || 'foto').replace(/[^\p{L}\p{N} _-]+/gu, '').trim().slice(0, 60) || 'foto';
    return [{ filename: `${name}.webp`, contentType: 'image/webp', content: readFileSync(file) }];
  });
}

/** Files of an earlier letter, for «Переслати». */
export async function messageFiles(messageId: string): Promise<OutFile[]> {
  const rows = await prisma.mailAttachment.findMany({ where: { messageId, isInline: false } });
  return rows.map((a) => ({ filename: a.filename, contentType: a.contentType, content: readStored(a.objectKey) }));
}

/**
 * `threadId: null` with mode 'new' (D34 «Новий лист») starts a conversation: the thread is created
 * together with the letter, only after the letter has gone out.
 */
export async function sendFromMailbox(input: {
  threadId: string | null; staff: { id: string; firstName: string | null }; to: string; subject: string; bodyHtml: string;
  files: OutFile[]; mode: 'reply' | 'forward' | 'new'; quote?: { fromName: string | null; fromEmail: string; occurredAt: Date; textBody: string | null };
  inReplyTo?: string | null; references?: string[]; newThread?: { counterpartName: string | null; orderId: string | null };
}) {
  const total = input.files.reduce((s, f) => s + f.content.length, 0);
  if (total > MAX_ATTACH_BYTES) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'files', code: 'TOO_LARGE' }]);
  const body = cleanReply(input.bodyHtml);
  if (!toText(body)) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'bodyHtml', code: 'EMPTY' }]);

  // Signature: the staff member's first name, the brand, the phone (D1 #6).
  const sigLines = [input.staff.firstName ? `— ${input.staff.firstName}` : '—', BUSINESS.brand, BUSINESS.phones[0]!];
  const when = input.quote ? input.quote.occurredAt.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', dateStyle: 'long', timeStyle: 'short' }) : '';
  const who = input.quote ? (input.quote.fromName ? `${input.quote.fromName} <${input.quote.fromEmail}>` : input.quote.fromEmail) : '';
  const quotedText = input.quote?.textBody ?? '';
  const head = input.mode === 'forward' ? `---------- Переслано ----------\nВід: ${who}\nДата: ${when}` : `${when}, ${who} пише:`;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1F2A22">${body}<p style="margin:16px 0 0;color:#5E594F">${sigLines.map(esc).join('<br>')}</p>${
    input.quote ? `<p style="margin:20px 0 6px;color:#5E594F;font-size:13px">${esc(head).replace(/\n/g, '<br>')}</p><blockquote style="margin:0;padding-left:12px;border-left:3px solid #E2D3BE;color:#5E594F">${esc(quotedText).replace(/\n/g, '<br>')}</blockquote>` : ''
  }</div>`;
  const text = `${toText(body)}\n\n${sigLines.join('\n')}${input.quote ? `\n\n${head}\n${quotedText.split('\n').map((l) => `> ${l}`).join('\n')}` : ''}`;

  const messageId = newMessageId();
  const composer = new MailComposer({
    from: { name: BUSINESS.brand, address: config.mailbox.address }, to: input.to, subject: input.subject, text, html, messageId,
    ...(input.inReplyTo ? { inReplyTo: input.inReplyTo, references: [...(input.references ?? []), input.inReplyTo] } : {}),
    attachments: input.files.map((f) => ({ filename: f.filename, contentType: f.contentType, content: f.content })),
  });
  const raw = await composer.compile().build();

  // RFC 2606 reserved names never exist (tests, demos): never handed to the real mail server.
  const reserved = /@([^@]+\.)?(test|invalid|example|localhost)$|@example\.(com|net|org)$/i.test(input.to);
  if (mailSyncEnabled() && !reserved) {
    await smtp().sendMail({ envelope: { from: config.mailbox.address, to: [input.to] }, raw });
    await appendToSent(raw).catch(() => undefined); // the letter is sent; a missing Sent copy is not a failure
  } else {
    mkdirSync(OUTBOX, { recursive: true });
    writeFileSync(`${OUTBOX}${new Date().toISOString().replace(/[:.]/g, '-')}-reply.eml`, raw);
  }

  const stored = input.files.map((f) => {
    const hash = sha256(f.content);
    const key = `att/${hash.slice(0, 2)}/${hash}`;
    saveFile(key, f.content);
    return { filename: f.filename, contentType: f.contentType, sizeBytes: f.content.length, sha256: hash, objectKey: key, riskFlag: riskOf(f.filename, f.contentType) };
  });
  const now = new Date();
  const threadId = await prisma.$transaction(async (tx) => {
    let threadId = input.threadId;
    if (!threadId) {
      const mailbox = await tx.mailbox.upsert({ where: { address: config.mailbox.address }, update: {}, create: { address: config.mailbox.address, displayName: BUSINESS.brand } });
      threadId = (await tx.mailThread.create({
        data: {
          mailboxId: mailbox.id, subject: input.subject, counterpartEmail: input.to, counterpartName: input.newThread?.counterpartName ?? null,
          status: 'WAITING', orderId: input.newThread?.orderId ?? null, lastMessageAt: now,
        },
        select: { id: true },
      })).id;
    }
    await tx.mailMessage.create({
      data: {
        threadId, direction: 'OUTBOUND', kind: 'STAFF_REPLY', messageIdHeader: messageId,
        inReplyTo: input.inReplyTo ?? null, references: input.references ?? [], fromEmail: config.mailbox.address, fromName: BUSINESS.brand,
        toEmails: [input.to], ccEmails: [], subject: input.subject, textBody: text, htmlSanitized: html, sentById: input.staff.id,
        deliveryState: 'SENT', occurredAt: now,
        attachments: { create: stored },
      },
    });
    if (input.threadId) {
      await tx.mailThread.update({ where: { id: threadId }, data: { lastMessageAt: now, ...(input.mode === 'reply' ? { status: 'WAITING' } : {}) } });
      await tx.mailDraft.deleteMany({ where: { threadId, staffUserId: input.staff.id } });
    }
    return threadId;
  });
  return { messageId, threadId };
}

/** Out-of-hours auto-reply (D1 #39–41), sent through the site's mail service, stored in the thread. */
export async function sendAutoReply(threadId: string) {
  const ar = await getSetting(MAIL_AUTOREPLY_KEY, DEFAULT_AUTOREPLY);
  if (!ar.enabled) return;
  const t = await prisma.mailThread.findUnique({ where: { id: threadId }, include: { messages: { where: { direction: 'INBOUND' }, orderBy: { occurredAt: 'desc' }, take: 1 } } });
  const last = t?.messages[0];
  if (!t || !last || t.status === 'SPAM') return;
  const messageId = newMessageId();
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1F2A22">${esc(ar.body).replace(/\n/g, '<br>')}</div>`;
  await sendMail({
    to: t.counterpartEmail, subject: `Re: ${t.subject}`, text: ar.body, html,
    from: `${BUSINESS.brand} <${config.mailbox.address}>`, replyTo: config.mailbox.address,
    headers: { 'Auto-Submitted': 'auto-replied', 'X-Auto-Response-Suppress': 'All', 'In-Reply-To': last.messageIdHeader, References: last.messageIdHeader, 'Message-ID': messageId },
  });
  await prisma.mailMessage.create({
    data: {
      threadId, direction: 'OUTBOUND', kind: 'TRANSACTIONAL', templateKey: 'autoreply', messageIdHeader: messageId, inReplyTo: last.messageIdHeader,
      references: [last.messageIdHeader], fromEmail: config.mailbox.address, fromName: BUSINESS.brand, toEmails: [t.counterpartEmail], ccEmails: [],
      subject: `Re: ${t.subject}`, textBody: ar.body, htmlSanitized: html, deliveryState: 'SENT', occurredAt: new Date(),
    },
  });
}
