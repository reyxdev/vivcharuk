import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { buildApp } from '../../src/app';
import { newsletterMail, requestConsent, unsubscribeHeaders } from '../../src/modules/newsletter/newsletter.service';

// Round 19 D2: double opt-in and one-click unsubscribe, against the development database.
const app = await buildApp();
const email = `sub-${Date.now()}@example.test`;

afterAll(async () => {
  await prisma.subscriber.deleteMany({ where: { email } });
  await app.close();
});

describe('newsletter consent', () => {
  it('a ticked box creates a pending subscriber and a confirmation letter, nothing more', async () => {
    const s = await prisma.$transaction((tx) => requestConsent(email, 'uk', { kind: 'manual', note: 'тест', staffId: 'test' }, tx));
    expect(s.status).toBe('PENDING');
    const m = await newsletterMail('confirm', s.id);
    expect(m?.subject).toContain('Підтвердіть підписку');
    expect(m?.html).toContain(`confirm=${s.confirmToken}`);
    expect(await newsletterMail('welcome', s.id)).toBeNull(); // no welcome before the click
  });

  it('confirming subscribes and allows the welcome letter with unsubscribe headers', async () => {
    const s = await prisma.subscriber.findUniqueOrThrow({ where: { email } });
    const r = await app.inject({ method: 'POST', url: '/api/v1/newsletter/confirm', payload: { token: s.confirmToken } });
    expect(r.json().result).toBe('confirmed');
    const w = await newsletterMail('welcome', s.id);
    expect(w?.headers).toEqual(unsubscribeHeaders(s.unsubToken));
    expect(w?.html).toContain(`unsubscribe=${s.unsubToken}`);
  });

  it('one-click unsubscribe (RFC 8058 form POST) keeps only the address', async () => {
    const s = await prisma.subscriber.findUniqueOrThrow({ where: { email } });
    const r = await app.inject({ method: 'POST', url: `/api/v1/newsletter/unsubscribe?token=${s.unsubToken}`, headers: { 'content-type': 'application/x-www-form-urlencoded' }, payload: 'List-Unsubscribe=One-Click' });
    expect(r.statusCode).toBe(200);
    expect(r.json().result).toBe('unsubscribed');
    const after = await prisma.subscriber.findUniqueOrThrow({ where: { email } });
    expect(after).toMatchObject({ status: 'UNSUBSCRIBED', consentText: null, confirmToken: null, orderId: null });
  });

  it('an unknown token is refused politely', async () => {
    expect((await app.inject({ method: 'POST', url: '/api/v1/newsletter/confirm', payload: { token: 'x'.repeat(30) } })).json().result).toBe('invalid');
  });
});
