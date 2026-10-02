import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { config } from '../config';

export interface Mail { to: string; subject: string; text: string; html: string; from?: string; replyTo?: string; headers?: Record<string, string> }

// Round 18: the shop's own mailbox (Porkbun) over SMTP. Without a server configured nothing is sent:
// in development each message is written as an .eml file to mail-outbox/ (open it in any mail app).
const smtp = config.mail.host
  ? nodemailer.createTransport({ host: config.mail.host, port: config.mail.port, secure: config.mail.port === 465, auth: { user: config.mail.user, pass: config.mail.pass } })
  : null;
const OUTBOX = fileURLToPath(new URL('../../../../mail-outbox/', import.meta.url));

export const mailEnabled = () => !!smtp;

// RFC 2606 reserved names never exist; tests and demos use them, so they are never handed to the mail service.
const RESERVED = /@([^@]+\.)?(test|invalid|example|localhost)$|@example\.(com|net|org)$/i;

export async function sendMail(m: Mail): Promise<'sent' | 'outbox' | 'skipped'> {
  if (RESERVED.test(m.to)) return 'skipped';
  if (smtp) {
    await smtp.sendMail({ from: m.from ?? config.mail.from, replyTo: m.replyTo ?? config.mail.replyTo, to: m.to, subject: m.subject, text: m.text, html: m.html, headers: m.headers });
    return 'sent';
  }
  if (config.isProd) return 'skipped';
  const preview = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  const info = await preview.sendMail({ from: m.from ?? 'Вівчарик <info@example.invalid>', to: m.to, subject: m.subject, text: m.text, html: m.html, headers: m.headers });
  mkdirSync(OUTBOX, { recursive: true });
  writeFileSync(`${OUTBOX}${new Date().toISOString().replace(/[:.]/g, '-')}.eml`, info.message as Buffer);
  return 'outbox';
}
