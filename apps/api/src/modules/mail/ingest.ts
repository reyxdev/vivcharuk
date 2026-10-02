import { randomUUID } from 'node:crypto';
import { simpleParser, type AddressObject, type ParsedMail } from 'mailparser';
import { config } from '../../config';
import { enqueue } from '../../lib/jobs';
import { prisma } from '../../lib/prisma';
import { cleanHtml, htmlToText, verdict } from './sanitize';
import { riskOf, saveFile, sha256 } from './store';
import { isWorkingTime } from './hours';

// One message from the mailbox into the panel's threads (round 19 D1). Idempotent: a message already
// stored (same Message-ID in the same thread, or the same IMAP uid) is not stored again.

const ORDER_NO = /\bVCH-\d{2}-\d{4,}\b/i;

const addresses = (a: AddressObject | AddressObject[] | undefined) =>
  (Array.isArray(a) ? a : a ? [a] : []).flatMap((x) => x.value).map((v) => ({ email: (v.address ?? '').toLowerCase(), name: v.name || null })).filter((v) => v.email);

const decode = (s: string) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/** Mail that must never get an auto-reply: robots, lists, bounces (RFC 3834). */
function isAutomated(p: ParsedMail, fromEmail: string) {
  const h = (k: string) => String(p.headers.get(k) ?? '').toLowerCase();
  return (h('auto-submitted') !== '' && h('auto-submitted') !== 'no')
    || /bulk|list|junk/.test(h('precedence'))
    || p.headers.has('list-id') || p.headers.has('list-unsubscribe')
    || /^(no-?reply|mailer-daemon|postmaster|bounce|notifications?)[@+.-]/.test(fromEmail);
}

export async function ingestRaw(raw: Buffer, imap: { folder: string; uid: number }) {
  const mailboxAddress = config.mailbox.address;
  const already = await prisma.mailMessage.findFirst({ where: { imapFolder: imap.folder, imapUid: imap.uid }, select: { id: true } });
  if (already) return { stored: false as const };

  const p = await simpleParser(raw, { skipImageLinks: true, skipTextLinks: true });
  const from = addresses(p.from)[0] ?? { email: 'unknown@invalid', name: null };
  const to = addresses(p.to).map((a) => a.email);
  const cc = addresses(p.cc).map((a) => a.email);
  const direction = from.email === mailboxAddress ? 'OUTBOUND' as const : 'INBOUND' as const;
  const counterpart = direction === 'INBOUND' ? from : (addresses(p.to)[0] ?? { email: 'unknown@invalid', name: null });
  const messageId = p.messageId ?? `<${sha256(raw).slice(0, 32)}@vivcharuk.invalid>`;
  const refs = [p.inReplyTo, ...(Array.isArray(p.references) ? p.references : p.references ? [p.references] : [])].filter((x): x is string => !!x);

  // Our own reply, already stored when it was sent, now seen again in the Sent folder: just link it.
  const ours = await prisma.mailMessage.findFirst({ where: { messageIdHeader: messageId, imapUid: null }, select: { id: true } });
  if (ours) {
    await prisma.mailMessage.update({ where: { id: ours.id }, data: { imapFolder: imap.folder, imapUid: imap.uid } });
    return { stored: false as const };
  }

  const subject = (p.subject ?? '').trim() || '(без теми)';
  const html = typeof p.html === 'string' ? cleanHtml(p.html) : null;
  const text = p.text?.trim() || (html ? decode(htmlToText(html)) : '');
  const occurredAt = p.date && p.date.getTime() < Date.now() + 86_400_000 ? p.date : new Date();
  const check = verdict({ fromEmail: from.email, fromName: from.name, text, html: typeof p.html === 'string' ? p.html : null, authResults: String(p.headers.get('authentication-results') ?? '') });

  const rawKey = `raw/${occurredAt.toISOString().slice(0, 7)}/${sha256(raw)}.eml`;
  saveFile(rawKey, raw);
  const files = p.attachments.map((a) => {
    const hash = sha256(a.content);
    const key = `att/${hash.slice(0, 2)}/${hash}`;
    saveFile(key, a.content);
    const filename = a.filename || (a.contentType.startsWith('image/') ? `image.${a.contentType.split('/')[1]}` : 'file');
    return { filename, contentType: a.contentType.toLowerCase(), sizeBytes: a.size, sha256: hash, objectKey: key, contentId: a.cid ?? null, isInline: a.contentDisposition === 'inline' && !!a.cid, riskFlag: riskOf(filename, a.contentType) };
  });

  const blocked = direction === 'INBOUND' && await isBlocked(from.email);
  const orderNumber = (subject.match(ORDER_NO) ?? text.match(ORDER_NO))?.[0]?.toUpperCase();
  const order = orderNumber ? await prisma.order.findUnique({ where: { number: orderNumber }, select: { id: true } }) : null;

  return prisma.$transaction(async (tx) => {
    const parent = refs.length ? await tx.mailMessage.findFirst({ where: { messageIdHeader: { in: refs }, thread: { deletedAt: null } }, orderBy: { occurredAt: 'desc' }, select: { threadId: true } }) : null;
    const mailbox = await tx.mailbox.upsert({ where: { address: mailboxAddress }, update: {}, create: { address: mailboxAddress, displayName: 'Вівчарик' } });
    const thread = parent
      ? await tx.mailThread.findUniqueOrThrow({ where: { id: parent.threadId } })
      : await tx.mailThread.create({
          data: {
            mailboxId: mailbox.id, subject, counterpartEmail: counterpart.email, counterpartName: counterpart.name,
            status: blocked ? 'SPAM' : direction === 'INBOUND' ? 'OPEN' : 'WAITING', orderId: order?.id ?? null, lastMessageAt: occurredAt,
          },
        });

    if (await tx.mailMessage.findFirst({ where: { threadId: thread.id, messageIdHeader: messageId }, select: { id: true } })) return { stored: false as const };
    await tx.mailMessage.create({
      data: {
        threadId: thread.id, direction, kind: direction === 'INBOUND' ? 'CUSTOMER' : 'STAFF_REPLY', messageIdHeader: messageId,
        inReplyTo: p.inReplyTo ?? null, references: refs, fromEmail: from.email, fromName: from.name, toEmails: to, ccEmails: cc,
        subject, textBody: text, htmlSanitized: html, rawObjectKey: rawKey, authVerdict: check, occurredAt,
        imapFolder: imap.folder, imapUid: imap.uid, attachments: { create: files },
      },
    });

    const newer = occurredAt >= thread.lastMessageAt;
    await tx.mailThread.update({
      where: { id: thread.id },
      data: {
        ...(newer ? { lastMessageAt: occurredAt } : {}),
        ...(direction === 'INBOUND' && (!thread.lastInboundAt || occurredAt > thread.lastInboundAt) ? { lastInboundAt: occurredAt } : {}),
        // A new letter from the customer reopens a replied or closed conversation; spam stays spam.
        ...(direction === 'INBOUND' && newer && thread.status !== 'SPAM' ? { status: blocked ? 'SPAM' : 'OPEN' } : {}),
        ...(direction === 'OUTBOUND' && newer && thread.status === 'OPEN' ? { status: 'WAITING' } : {}),
        ...(!thread.orderId && order ? { orderId: order.id } : {}),
      },
    });

    // T22: a new letter from a customer in Telegram (fresh ones only, not the history import, not spam).
    if (direction === 'INBOUND' && !blocked && Date.now() - occurredAt.getTime() < 6 * 3_600_000 && !isAutomated(p, from.email)) {
      await enqueue('notify.telegram', { kind: 'mail', threadId: thread.id }, tx);
    }
    // Out-of-hours auto-reply (round 19 D1 #39): only to fresh customer mail, once a day per thread,
    // never to robots, lists or spam, and never to letters imported from before today.
    const fresh = Date.now() - occurredAt.getTime() < 6 * 3_600_000;
    const recentlyReplied = thread.autoRepliedAt && Date.now() - thread.autoRepliedAt.getTime() < 86_400_000;
    if (direction === 'INBOUND' && fresh && !blocked && !recentlyReplied && !isWorkingTime(occurredAt) && !isAutomated(p, from.email)) {
      await tx.mailThread.update({ where: { id: thread.id }, data: { autoRepliedAt: new Date() } });
      await enqueue('mail.autoReply', { threadId: thread.id }, tx);
    }
    return { stored: true as const, threadId: thread.id };
  });
}

async function isBlocked(email: string) {
  const domain = `@${email.split('@')[1] ?? ''}`;
  const rule = await prisma.mailSenderRule.findFirst({ where: { pattern: { in: [email, domain] }, action: 'BLOCK' }, select: { id: true } });
  return !!rule;
}

/** A Message-ID on our own domain for letters we send. */
export const newMessageId = () => `<${randomUUID()}@${config.mailbox.address.split('@')[1]}>`;
