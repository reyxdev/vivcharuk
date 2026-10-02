import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

// Round 19 D1: letters from the mailbox become panel threads. Runs against the development database
// with files in a temporary MAIL_DIR; everything it creates is removed afterwards.
const dir = mkdtempSync(path.join(tmpdir(), 'mail-test-'));
process.env.MAIL_DIR = dir;
const { prisma } = await import('../../src/lib/prisma');
const { ingestRaw } = await import('../../src/modules/mail/ingest');
const { cleanHtml, verdict } = await import('../../src/modules/mail/sanitize');
const { purgeThreads } = await import('../../src/modules/mail/mail.routes');

const tag = `t${Date.now()}`;
const folder = `TEST-${tag}`;
const eml = (h: Record<string, string>, body: string) => Buffer.from(`${Object.entries(h).map(([k, v]) => `${k}: ${v}`).join('\r\n')}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body}\r\n`);
const created: string[] = [];

afterAll(async () => {
  await purgeThreads(created);
  await prisma.setting.deleteMany({ where: { key: { startsWith: `mail.imap.state.${folder}` } } });
  rmSync(dir, { recursive: true, force: true });
});

describe('mail sanitising', () => {
  it('drops scripts and parks remote images', () => {
    const out = cleanHtml('<p onclick="x()">Hi<script>alert(1)</script></p><img src="https://tracker.example/p.gif"><img src="cid:abc@x">');
    expect(out).not.toMatch(/script|onclick/);
    expect(out).toContain('data-remote-src="https://tracker.example/p.gif"');
    expect(out).toContain('data-cid="abc@x"');
    expect(out).not.toMatch(/\ssrc=/);
  });

  it('flags a brand name on a foreign address and a mismatched link', () => {
    const v = verdict({ fromEmail: 'support@porkbun-help.top', fromName: 'Porkbun Support', text: 'Підтвердіть ваш акаунт', html: '<a href="https://evil.example/login">porkbun.com</a>' });
    expect(v.suspicious).toBe(true);
    expect(v.reasons.length).toBeGreaterThanOrEqual(2);
    expect(verdict({ fromEmail: 'olena@gmail.com', fromName: 'Олена', text: 'Добрий день, чи є ліжник 150×200?' }).suspicious).toBe(false);
  });
});

describe('mail ingest', () => {
  const first = `<${tag}-1@example.test>`;
  it('creates a thread from a customer letter and is idempotent', async () => {
    const raw = eml({ From: 'Олена <olena@example.test>', To: 'info@vivcharuk.com', Subject: `Питання ${tag}`, 'Message-ID': first, Date: new Date().toUTCString() }, '<p>Чи є ліжник 150×200?</p>');
    const r = await ingestRaw(raw, { folder, uid: 1 });
    expect(r.stored).toBe(true);
    if (r.stored) created.push(r.threadId);
    expect((await ingestRaw(raw, { folder, uid: 1 })).stored).toBe(false);
    const t = await prisma.mailThread.findUniqueOrThrow({ where: { id: created[0] }, include: { messages: true } });
    expect(t.status).toBe('OPEN');
    expect(t.counterpartEmail).toBe('olena@example.test');
    expect(t.messages[0]!.textBody).toContain('150×200');
  });

  it('threads a follow-up by In-Reply-To and reopens it', async () => {
    await prisma.mailThread.update({ where: { id: created[0] }, data: { status: 'WAITING' } });
    const r = await ingestRaw(eml({ From: 'olena@example.test', To: 'info@vivcharuk.com', Subject: `Re: Питання ${tag}`, 'Message-ID': `<${tag}-2@example.test>`, 'In-Reply-To': first, Date: new Date().toUTCString() }, '<p>А сірий?</p>'), { folder, uid: 2 });
    expect(r.stored && r.threadId).toBe(created[0]);
    expect((await prisma.mailThread.findUniqueOrThrow({ where: { id: created[0] } })).status).toBe('OPEN');
  });

  it('a letter we sent from webmail marks the thread replied', async () => {
    const r = await ingestRaw(eml({ From: 'Вівчарик <info@vivcharuk.com>', To: 'olena@example.test', Subject: `Re: Питання ${tag}`, 'Message-ID': `<${tag}-3@vivcharuk.com>`, 'In-Reply-To': `<${tag}-2@example.test>`, Date: new Date(Date.now() + 1000).toUTCString() }, '<p>Є, 1800 грн.</p>'), { folder, uid: 3 });
    expect(r.stored && r.threadId).toBe(created[0]);
    expect((await prisma.mailThread.findUniqueOrThrow({ where: { id: created[0] } })).status).toBe('WAITING');
  });

  it('a blocked sender goes to spam', async () => {
    await prisma.mailSenderRule.upsert({ where: { pattern: `@spam-${tag}.test` }, update: {}, create: { pattern: `@spam-${tag}.test`, action: 'BLOCK' } });
    const r = await ingestRaw(eml({ From: `x@spam-${tag}.test`, To: 'info@vivcharuk.com', Subject: 'Win', 'Message-ID': `<${tag}-4@spam>`, Date: new Date().toUTCString() }, '<p>buy</p>'), { folder, uid: 4 });
    if (r.stored) created.push(r.threadId);
    expect((await prisma.mailThread.findUniqueOrThrow({ where: { id: created[1] } })).status).toBe('SPAM');
    await prisma.mailSenderRule.delete({ where: { pattern: `@spam-${tag}.test` } });
  });
});
