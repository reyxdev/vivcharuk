import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Round 19 D1: the panel's «Пошта» endpoints, as the owner, against the development database. Without
// MAILBOX_PASSWORD replies are written to mail-outbox/ (nothing is sent). Everything created is removed.
const dir = mkdtempSync(path.join(tmpdir(), 'mail-routes-'));
process.env.MAIL_DIR = dir;
process.env.MAILBOX_PASSWORD = ''; // not delete: Prisma would load it back from .env
const { prisma } = await import('../../src/lib/prisma');
const { config } = await import('../../src/config');
const { buildApp } = await import('../../src/app');
const { signAccess } = await import('../../src/modules/auth/tokens');
const { ingestRaw } = await import('../../src/modules/mail/ingest');
const { purgeThreads } = await import('../../src/modules/mail/mail.routes');

const app = await buildApp();
const tag = `r${Date.now()}`;
let token = '';
let sessionId = '';
let threadId = '';
let composedId = '';
const auth = () => ({ authorization: `Bearer ${token}` });

beforeAll(async () => {
  const owner = await prisma.staffUser.findFirstOrThrow({ where: { email: 'gif19601@gmail.com' } });
  if (owner.status !== 'ACTIVE') throw new Error('owner not active in the dev database');
  const s = await prisma.staffSession.create({ data: { staffUserId: owner.id, refreshTokenHash: `test-${randomUUID()}`, ipAddress: '127.0.0.1', userAgent: 'vitest', expiresAt: new Date(Date.now() + 600_000), mfaVerifiedAt: new Date() } });
  sessionId = s.id;
  token = await signAccess({ sub: owner.id, sid: s.id, pv: owner.permVersion });
  const r = await ingestRaw(Buffer.from(`From: Тест <buyer-${tag}@example.test>\r\nTo: info@vivcharuk.com\r\nSubject: Питання ${tag}\r\nMessage-ID: <${tag}@example.test>\r\nDate: ${new Date().toUTCString()}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nЧи є доріжка 70×200?\r\n`), { folder: `TEST-${tag}`, uid: 1 });
  if (!r.stored) throw new Error('not stored');
  threadId = r.threadId;
});

afterAll(async () => {
  await purgeThreads([threadId, composedId].filter(Boolean));
  await prisma.mailSenderRule.deleteMany({ where: { pattern: `buyer-${tag}@example.test` } });
  await prisma.staffSession.delete({ where: { id: sessionId } });
  await app.close();
  rmSync(dir, { recursive: true, force: true });
});

describe('mail routes', () => {
  it('refuses without a session', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/admin/mail/threads' })).statusCode).toBe(401);
  });

  it('lists the new letter as unread and searches by text', async () => {
    const r = await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads?q=${encodeURIComponent('70×200')}`, headers: auth() });
    expect(r.statusCode).toBe(200);
    const row = r.json().items.find((x: { id: string }) => x.id === threadId);
    expect(row).toMatchObject({ unread: true, status: 'OPEN', counterpartEmail: `buyer-${tag}@example.test` });
  });

  it('opening the thread marks it read', async () => {
    const r = await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth() });
    expect(r.statusCode).toBe(200);
    expect(r.json().messages).toHaveLength(1);
    const list = await app.inject({ method: 'GET', url: '/api/v1/admin/mail/threads', headers: auth() });
    expect(list.json().items.find((x: { id: string }) => x.id === threadId)?.unread).toBe(false);
  });

  it('saves a draft, then a reply clears it and marks the thread replied', async () => {
    expect((await app.inject({ method: 'PUT', url: `/api/v1/admin/mail/threads/${threadId}/draft`, headers: auth(), payload: { bodyHtml: '<p>Є, <b>1500</b> грн</p>' } })).statusCode).toBe(204);
    expect((await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth() })).json().draft).toContain('1500');
    const r = await app.inject({ method: 'POST', url: `/api/v1/admin/mail/threads/${threadId}/reply`, headers: auth(), payload: { bodyHtml: '<p>Є, <b>1500</b> грн<script>x</script></p>', files: [{ filename: 'a.txt', contentType: 'text/plain', base64: Buffer.from('hi').toString('base64') }] } });
    expect(r.statusCode).toBe(200);
    const t = (await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth() })).json();
    expect(t.status).toBe('WAITING');
    expect(t.draft).toBe('');
    const out = t.messages.at(-1);
    expect(out.direction).toBe('OUTBOUND');
    expect(out.html).not.toContain('script');
    expect(out.textBody).toContain('Вівчарик');
    expect(out.attachments[0].filename).toBe('a.txt');
    const file = await app.inject({ method: 'GET', url: `/api/v1/admin/mail/attachments/${out.attachments[0].id}`, headers: auth() });
    expect(file.body).toBe('hi');
    expect(file.headers['content-disposition']).toMatch(/^attachment/);
  });

  it('labels, notes, VIP, bin and restore', async () => {
    expect((await app.inject({ method: 'PATCH', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth(), payload: { labels: ['opt'], status: 'CLOSED' } })).statusCode).toBe(204);
    expect((await app.inject({ method: 'POST', url: `/api/v1/admin/mail/threads/${threadId}/notes`, headers: auth(), payload: { body: 'Передзвонити в понеділок' } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: '/api/v1/admin/mail/senders', headers: auth(), payload: { email: `buyer-${tag}@example.test`, action: 'VIP', on: true } })).statusCode).toBe(204);
    let t = (await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth() })).json();
    expect(t).toMatchObject({ labels: ['opt'], status: 'CLOSED', vip: true });
    expect(t.notes[0].body).toBe('Передзвонити в понеділок');
    await app.inject({ method: 'PATCH', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth(), payload: { deleted: true } });
    const bin = (await app.inject({ method: 'GET', url: '/api/v1/admin/mail/threads?view=bin', headers: auth() })).json();
    expect(bin.items.some((x: { id: string }) => x.id === threadId)).toBe(true);
    await app.inject({ method: 'PATCH', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth(), payload: { deleted: false } });
    t = (await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads/${threadId}`, headers: auth() })).json();
    expect(t.deleted).toBe(false);
  });

  it('«Новий лист» starts a conversation waiting for the answer', async () => {
    const to = `new-${tag}@example.test`;
    const r = await app.inject({ method: 'POST', url: '/api/v1/admin/mail/compose', headers: auth(), payload: { to: ` ${to.toUpperCase()} `, subject: `Пропозиція ${tag}`, bodyHtml: '<p>Добрий день!</p>' } });
    expect(r.statusCode).toBe(200);
    composedId = r.json().threadId;
    const t = (await app.inject({ method: 'GET', url: `/api/v1/admin/mail/threads/${composedId}`, headers: auth() })).json();
    expect(t).toMatchObject({ status: 'WAITING', counterpartEmail: to, subject: `Пропозиція ${tag}` });
    expect(t.messages).toHaveLength(1);
    expect(t.messages[0]).toMatchObject({ direction: 'OUTBOUND', toEmails: [to] });
    expect(t.messages[0].textBody).toContain('Вівчарик');
    const list = (await app.inject({ method: 'GET', url: '/api/v1/admin/mail/threads?view=replied', headers: auth() })).json();
    expect(list.items.find((x: { id: string }) => x.id === composedId)?.unread).toBe(false);
  });

  it('«Новий лист» refuses a bad address, the mailbox itself, an empty subject or text', async () => {
    const send = (payload: object) => app.inject({ method: 'POST', url: '/api/v1/admin/mail/compose', headers: auth(), payload: { to: `x-${tag}@example.test`, subject: 'Тема', bodyHtml: '<p>Текст</p>', ...payload } });
    expect((await send({ to: 'not-an-address' })).statusCode).toBe(422);
    expect((await send({ to: config.mailbox.address })).json().error.fieldErrors[0]).toMatchObject({ path: 'to', code: 'SELF' });
    expect((await send({ subject: ' ' })).statusCode).toBe(422);
    expect((await send({ bodyHtml: '<p> </p>' })).statusCode).toBe(422);
    expect(await prisma.mailThread.count({ where: { counterpartEmail: `x-${tag}@example.test` } })).toBe(0);
  });

  it('suggests recipients from orders only after two letters', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/admin/mail/recipients?q=a', headers: auth() })).json().items).toEqual([]);
    const r = await app.inject({ method: 'GET', url: '/api/v1/admin/mail/recipients?q=example', headers: auth() });
    expect(r.statusCode).toBe(200);
    expect(r.json().items.length).toBeLessThanOrEqual(8);
  });

  it('settings come with the six templates and five labels', async () => {
    const s = (await app.inject({ method: 'GET', url: '/api/v1/admin/mail/settings', headers: auth() })).json();
    expect(s.templates.map((t: { title: string }) => t.title)).toEqual(['Ціни опту', 'Наявність / строк виготовлення', 'Розміри', 'Догляд за вовною', 'Реквізити IBAN', 'Повернення']);
    expect(s.labels).toHaveLength(5);
    expect(s.sync.enabled).toBe(false);
  });
});
