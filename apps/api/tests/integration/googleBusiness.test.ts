import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// The connector needs a configured OAuth client; set before config.ts is loaded. The network is a mock.
vi.hoisted(() => { process.env.GOOGLE_BP_CLIENT_ID = 'test-client'; process.env.GOOGLE_BP_CLIENT_SECRET = 'test-secret'; });

const { prisma } = await import('../../src/lib/prisma');
const { seal } = await import('../../src/lib/crypto');
const svc = await import('../../src/modules/google-business/service');

// The sync and the daily check against the development database, Google mocked: success, a
// per-minute 429 (thrown so pg-boss retries), quota 0 (→ awaiting_api_access, not retried), the
// difference check, and OAuth state checks. The two Setting rows are restored afterwards.
const KEYS = [svc.GBP_STATE_KEY, svc.GBP_TOKEN_KEY];
const saved = await prisma.setting.findMany({ where: { key: { in: KEYS } } });
afterAll(async () => {
  await prisma.setting.deleteMany({ where: { key: { in: KEYS } } });
  for (const s of saved) await prisma.setting.create({ data: { key: s.key, value: s.value as never, updatedById: s.updatedById } });
});

type Reply = { status: number; body: unknown };
let replies: Reply[] = [];
const calls: Array<{ url: string; method: string; body?: string }> = [];
const fake = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, method: init?.method ?? 'GET', body: typeof init?.body === 'string' ? init.body : undefined });
  if (url === 'https://oauth2.googleapis.com/token') {
    const code = typeof init?.body === 'string' && init.body.includes('grant_type=authorization_code');
    return new Response(JSON.stringify({ access_token: 'access-1', expires_in: 3600, ...(code ? { refresh_token: 'refresh-from-code', scope: svc.GBP_SCOPE } : {}) }), { status: 200 });
  }
  if (url === 'https://oauth2.googleapis.com/revoke') return new Response('{}', { status: 200 });
  const r = replies.shift() ?? { status: 200, body: {} };
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { 'content-type': 'application/json' } });
}) as typeof fetch;

beforeEach(async () => {
  svc.setGbpFetch(fake);
  replies = []; calls.length = 0;
  await prisma.setting.upsert({ where: { key: svc.GBP_TOKEN_KEY }, create: { key: svc.GBP_TOKEN_KEY, value: { sealed: seal('refresh-secret') } }, update: { value: { sealed: seal('refresh-secret') } } });
  const state = { location: { name: 'locations/123', title: 'Вівчарик', address: 'Яворів' }, status: 'idle', dirty: true };
  await prisma.setting.upsert({ where: { key: svc.GBP_STATE_KEY }, create: { key: svc.GBP_STATE_KEY, value: state }, update: { value: state } });
});

describe('google.syncHours', () => {
  it('PATCHes regularHours and specialHours of the chosen location', async () => {
    const st = await svc.syncHours();
    expect(st).toMatchObject({ status: 'ok', dirty: false, inSync: true, code: null });
    const patch = calls.find((c) => c.method === 'PATCH')!;
    expect(patch.url).toBe('https://mybusinessbusinessinformation.googleapis.com/v1/locations/123?updateMask=regularHours%2CspecialHours');
    expect(JSON.parse(patch.body!).regularHours.periods.length).toBeGreaterThan(0);
  });

  it('a per-minute 429 is stored and thrown, so pg-boss retries; the retry succeeds', async () => {
    replies = [{ status: 429, body: { error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Too many', details: [] } } }];
    await expect(svc.syncHours()).rejects.toBeInstanceOf(svc.GbpError);
    expect(await svc.readState()).toMatchObject({ status: 'error', code: 'RATE_LIMITED', dirty: true });
    expect(await svc.syncHours()).toMatchObject({ status: 'ok', dirty: false });
  });

  it('quota 0 → awaiting_api_access, not thrown; the daily job tries again', async () => {
    const zero = { status: 429, body: { error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded', details: [{ '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason: 'RATE_LIMIT_EXCEEDED', metadata: { quota_limit_value: '0' } }] } } };
    replies = [zero];
    expect(await svc.syncHours()).toMatchObject({ status: 'awaiting_api_access', code: 'API_ACCESS_NOT_APPROVED', dirty: true });
    replies = [zero];
    expect(await svc.checkHours()).toMatchObject({ status: 'awaiting_api_access' });
    expect(calls.filter((c) => c.method === 'PATCH')).toHaveLength(2);
  });

  it('does nothing without a chosen location', async () => {
    await prisma.setting.update({ where: { key: svc.GBP_STATE_KEY }, data: { value: { location: null } } });
    expect(await svc.syncHours()).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('never shows the token to the panel', async () => {
    const view = JSON.stringify(await svc.publicState());
    expect(view).not.toContain('refresh-secret');
    expect(view).not.toContain('sealed');
  });
});

describe('google.checkHours', () => {
  it('reports a difference without writing to Google', async () => {
    await svc.syncHours();
    calls.length = 0;
    replies = [{ status: 200, body: { regularHours: { periods: [{ openDay: 'MONDAY', openTime: { hours: 8 }, closeDay: 'MONDAY', closeTime: { hours: 12 } }] } } }];
    expect(await svc.checkHours()).toMatchObject({ inSync: false, status: 'ok' });
    expect(calls.map((c) => c.method)).toEqual(['GET']);
    expect(calls[0]!.url).toContain('readMask=regularHours%2CspecialHours');
  });
});

describe('google.checkHours before a location is chosen', () => {
  it('picks the only profile by itself once Google answers, then sends the hours', async () => {
    await prisma.setting.update({ where: { key: svc.GBP_STATE_KEY }, data: { value: { location: null, status: 'awaiting_api_access' } } });
    replies = [
      { status: 200, body: { accounts: [{ name: 'accounts/1' }] } },
      { status: 200, body: { locations: [{ name: 'locations/9', title: 'Вівчарик', storefrontAddress: { addressLines: ['вул. Петруші, 1'], locality: 'Яворів' } }] } },
      { status: 200, body: { name: 'locations/9', title: 'Вівчарик', storefrontAddress: { addressLines: ['вул. Петруші, 1'], locality: 'Яворів' } } },
      { status: 200, body: {} },
    ];
    expect(await svc.checkHours()).toMatchObject({ status: 'ok', location: { name: 'locations/9', address: 'вул. Петруші, 1, Яворів' } });
    expect(calls.filter((c) => c.url.startsWith('https://mybusiness')).map((c) => `${c.method} ${c.url.split('?')[0]}`)).toEqual([
      'GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      'GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/1/locations',
      'GET https://mybusinessbusinessinformation.googleapis.com/v1/locations/9',
      'PATCH https://mybusinessbusinessinformation.googleapis.com/v1/locations/9',
    ]);
  });
});

describe('OAuth callback', () => {
  it('refuses a state without the pending nonce or a live session', async () => {
    expect(await svc.finishOAuth({ code: 'x', state: 'nonsense' })).toBe('bad_state');
    const url = new URL(await svc.startOAuth('no-such-staff', 'no-such-session'));
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ access_type: 'offline', prompt: 'consent', response_type: 'code', scope: svc.GBP_SCOPE, redirect_uri: svc.redirectUri() });
    // A valid signature and nonce, but the session does not exist.
    expect(await svc.finishOAuth({ code: 'x', state: url.searchParams.get('state')! })).toBe('bad_state');
    // The nonce is single-use.
    expect(await svc.finishOAuth({ code: 'x', state: url.searchParams.get('state')! })).toBe('bad_state');
    expect(calls).toHaveLength(0);
  });
});

describe('OAuth state', () => {
  it('round-trips within 10 minutes', () => {
    const s = svc.makeOAuthState('staff1', 'sess1', 'nonce1', 1_000);
    expect(svc.readOAuthState(s, 1_000 + 9 * 60_000)).toEqual({ staffId: 'staff1', sessionId: 'sess1', nonce: 'nonce1' });
  });
  it('expires', () => expect(svc.readOAuthState(svc.makeOAuthState('a', 'b', 'c', 1_000), 1_000 + 11 * 60_000)).toBeNull());
  it('rejects a changed payload or signature', () => {
    const s = svc.makeOAuthState('staff1', 'sess1', 'nonce1');
    const [payload, sig] = s.split('.');
    const forged = Buffer.from(JSON.stringify({ s: 'other', sid: 'sess1', n: 'nonce1', exp: Date.now() + 60_000 })).toString('base64url');
    expect(svc.readOAuthState(`${forged}.${sig}`)).toBeNull();
    expect(svc.readOAuthState(`${payload}.${sig!.slice(0, -2)}xx`)).toBeNull();
    expect(svc.readOAuthState('garbage')).toBeNull();
    expect(svc.readOAuthState(`${s}.extra`)).toBeNull();
  });
});

describe('panel routes as the owner', async () => {
  const { randomUUID } = await import('node:crypto');
  const { buildApp } = await import('../../src/app');
  const { signAccess } = await import('../../src/modules/auth/tokens');
  const { open } = await import('../../src/lib/crypto');
  const { addDays, kyivDate, SITE_CONTACT_KEY } = await import('@vivcharyk/schemas');
  const app = await buildApp();
  const owner = await prisma.staffUser.findFirstOrThrow({ where: { email: 'gif19601@gmail.com' } });
  const session = await prisma.staffSession.create({ data: { staffUserId: owner.id, refreshTokenHash: `test-${randomUUID()}`, ipAddress: '127.0.0.1', userAgent: 'vitest', expiresAt: new Date(Date.now() + 600_000), mfaVerifiedAt: new Date() } });
  const auth = { authorization: `Bearer ${await signAccess({ sub: owner.id, sid: session.id, pv: owner.permVersion })}` };
  const contactBefore = await prisma.setting.findUnique({ where: { key: SITE_CONTACT_KEY } });
  afterAll(async () => {
    if (contactBefore) await prisma.setting.update({ where: { key: SITE_CONTACT_KEY }, data: { value: contactBefore.value as never } });
    else await prisma.setting.deleteMany({ where: { key: SITE_CONTACT_KEY } });
    await prisma.staffSession.delete({ where: { id: session.id } });
    await app.close();
  });

  it('connects through Google and back, keeping the token sealed and out of the answers', async () => {
    await prisma.setting.deleteMany({ where: { key: { in: KEYS } } });
    const start = await app.inject({ method: 'POST', url: '/api/v1/admin/google-business/oauth/start', headers: auth });
    const state = new URL(start.json<{ url: string }>().url).searchParams.get('state')!;
    const back = await app.inject({ method: 'GET', url: `/api/v1/admin/google-business/oauth/callback?code=c1&state=${encodeURIComponent(state)}` });
    expect(back.statusCode).toBe(302);
    expect(back.headers.location).toMatch(/\/settings\?t=google&gbp=connected$/);
    const row = await prisma.setting.findUniqueOrThrow({ where: { key: svc.GBP_TOKEN_KEY } });
    expect(JSON.stringify(row.value)).not.toContain('refresh-from-code');
    expect(open((row.value as { sealed: string }).sealed)).toBe('refresh-from-code');
    const view = await app.inject({ method: 'GET', url: '/api/v1/admin/google-business', headers: auth });
    expect(view.json()).toMatchObject({ configured: true, connected: true, location: null });
    expect(view.body).not.toContain('refresh-from-code');
    expect(await prisma.auditLog.count({ where: { action: 'google_business.connected', actorId: owner.id, createdAt: { gt: new Date(Date.now() - 60_000) } } })).toBeGreaterThan(0);
  });

  it('disconnect revokes at Google and forgets the token', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/admin/google-business/disconnect', headers: auth });
    expect(r.json()).toMatchObject({ revoked: true, state: { connected: false, location: null } });
    expect(calls.some((c) => c.url === 'https://oauth2.googleapis.com/revoke' && c.body === 'token=refresh-secret')).toBe(true);
    expect(await prisma.setting.count({ where: { key: svc.GBP_TOKEN_KEY } })).toBe(0);
  });

  it('a second callback with the same state is refused', async () => {
    const start = await app.inject({ method: 'POST', url: '/api/v1/admin/google-business/oauth/start', headers: auth });
    const state = encodeURIComponent(new URL(start.json<{ url: string }>().url).searchParams.get('state')!);
    await app.inject({ method: 'GET', url: `/api/v1/admin/google-business/oauth/callback?code=c1&state=${state}` });
    const again = await app.inject({ method: 'GET', url: `/api/v1/admin/google-business/oauth/callback?code=c1&state=${state}` });
    expect(again.headers.location).toMatch(/gbp=bad_state$/);
  });

  it('saves special days and serves the upcoming ones to the site', async () => {
    await prisma.setting.update({ where: { key: svc.GBP_STATE_KEY }, data: { value: { location: null } } }); // no sync queued
    const cur = (await app.inject({ method: 'GET', url: '/api/v1/admin/settings', headers: auth })).json<{ values: Record<string, Record<string, unknown>> }>().values[SITE_CONTACT_KEY]!;
    const today = kyivDate();
    const specialDays = [{ date: addDays(today, -40), closed: true }, { date: addDays(today, -2), closed: true }, { date: addDays(today, 2), closed: false, opens: '11:00', closes: '15:00', note: 'Тест' }];
    const put = await app.inject({ method: 'PUT', url: `/api/v1/admin/settings/${SITE_CONTACT_KEY}`, headers: auth, payload: { value: { ...cur, specialDays } } });
    expect(put.statusCode).toBe(204);
    const stored = (await prisma.setting.findUniqueOrThrow({ where: { key: SITE_CONTACT_KEY } })).value as { specialDays: Array<{ date: string }> };
    expect(stored.specialDays.map((d) => d.date)).toEqual([addDays(today, -2), addDays(today, 2)]);
    const { invalidateSetting } = await import('../../src/lib/settings');
    invalidateSetting(SITE_CONTACT_KEY);
    const site = (await app.inject({ method: 'GET', url: '/api/v1/site/settings' })).json<{ contact: { specialDays: unknown[] } }>();
    expect(site.contact.specialDays).toEqual([{ date: addDays(today, 2), closed: false, opens: '11:00', closes: '15:00', note: 'Тест' }]);
  });
});
