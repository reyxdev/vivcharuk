import { createHmac } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { kyivDate, parseSiteContact, SITE_CONTACT_KEY } from '@vivcharyk/schemas';
import { config } from '../../config';
import { open, randomToken, safeEqual, seal, sha256 } from '../../lib/crypto';
import { boss, bossReady } from '../../lib/jobs';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { resolvePermissions } from '../auth/permissions';
import { addressLine, classifyFailure, hoursPayload, sameHours, UPDATE_MASK, type GoogleFailure, type HoursPayload } from './payload';

// 2026-10-03 (docs/00-client-decisions-24.md, «Hours sync with Google»): the panel is the source of truth
// for the hours; Google Business Profile gets regularHours + specialHours after every change, and a
// daily check reports whether Google still shows the same. Nothing is pulled from Google automatically.
//
// Endpoints and fields as documented (checked 2026-10-03):
// - OAuth 2.0 for web server apps: developers.google.com/identity/protocols/oauth2/web-server
// - Account Management API v1 accounts.list: GET mybusinessaccountmanagement.googleapis.com/v1/accounts
// - Business Information API v1 accounts.locations.list (readMask required), locations.get (readMask
//   required), locations.patch (updateMask required)
// - Limits: developers.google.com/my-business/content/limits — 10 edits per minute per profile; a
//   project with quota 0 has not been granted API access yet.

export const GBP_SCOPE = 'https://www.googleapis.com/auth/business.manage';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const ACCOUNTS_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
const INFO_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';

export const GBP_STATE_KEY = 'google.business';
export const GBP_TOKEN_KEY = 'google.business.token';
const SYSTEM = { actorId: null, actorEmail: 'system' };
type Actor = { actorId: string | null; actorEmail: string };

export const gbpConfigured = () => !!(config.googleBusiness.clientId && config.googleBusiness.clientSecret);
/** Pasted by the client into the Google Cloud OAuth client («Authorized redirect URIs»). */
export const redirectUri = () => `${config.siteUrl.replace(/\/$/, '')}/api/v1/admin/google-business/oauth/callback`;

export interface GbpLocation { name: string; title: string; address: string }
export interface GbpState {
  connectedAt: string | null;
  connectedBy: string | null;
  location: GbpLocation | null;
  status: 'idle' | 'ok' | 'awaiting_api_access' | 'error';
  code: string | null;
  message: string | null;
  /** Our hours changed and Google has not taken them yet. */
  dirty: boolean;
  lastSyncAt: string | null;
  lastAttemptAt: string | null;
  inSync: boolean | null;
  lastCheckedAt: string | null;
  /** sha256 of the nonce of the one OAuth flow in progress (single use). */
  oauthNonce: string | null;
}
const EMPTY: GbpState = { connectedAt: null, connectedBy: null, location: null, status: 'idle', code: null, message: null, dirty: false, lastSyncAt: null, lastAttemptAt: null, inSync: null, lastCheckedAt: null, oauthNonce: null };

export class GbpError extends Error {
  constructor(readonly failure: GoogleFailure) { super(`${failure.code}${failure.message ? `: ${failure.message}` : ''}`); }
}

// Tests replace the network (tests never reach Google).
let fetcher: typeof fetch = (...a) => fetch(...a);
export const setGbpFetch = (f: typeof fetch) => { fetcher = f; accessCache = null; };

export async function readState(): Promise<GbpState> {
  const row = await prisma.setting.findUnique({ where: { key: GBP_STATE_KEY } });
  return { ...EMPTY, ...((row?.value ?? {}) as Partial<GbpState>) };
}
async function writeState(patch: Partial<GbpState>) {
  const next = { ...(await readState()), ...patch };
  await prisma.setting.upsert({ where: { key: GBP_STATE_KEY }, create: { key: GBP_STATE_KEY, value: next as never }, update: { value: next as never } });
  return next;
}

// The refresh token, sealed with the same AEAD as TOTP secrets (lib/crypto.ts). Never logged, never sent
// to the panel.
async function refreshToken() {
  const row = await prisma.setting.findUnique({ where: { key: GBP_TOKEN_KEY } });
  const sealed = (row?.value as { sealed?: string } | undefined)?.sealed;
  return sealed ? open(sealed) : null;
}
export const hasToken = async () => !!(await prisma.setting.findUnique({ where: { key: GBP_TOKEN_KEY }, select: { key: true } }));

let accessCache: { token: string; until: number } | null = null;

const form = (fields: Record<string, string>) => ({ method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields).toString() });

async function accessToken() {
  if (accessCache && accessCache.until > Date.now() + 60_000) return accessCache.token;
  const rt = await refreshToken();
  if (!rt) throw new GbpError({ kind: 'reauth', code: 'NOT_CONNECTED', message: '' });
  const res = await fetcher(TOKEN_URL, form({ client_id: config.googleBusiness.clientId, client_secret: config.googleBusiness.clientSecret, refresh_token: rt, grant_type: 'refresh_token' }));
  const body = (await res.json().catch(() => null)) as { access_token?: string; expires_in?: number; error?: string; error_description?: string } | null;
  if (!res.ok || !body?.access_token) {
    // invalid_grant: the owner removed the access in his Google account, or the token expired.
    if (body?.error === 'invalid_grant') throw new GbpError({ kind: 'reauth', code: 'TOKEN_REVOKED', message: body.error_description ?? '' });
    throw new GbpError({ kind: res.status >= 500 ? 'transient' : 'fatal', code: body?.error ?? `HTTP_${res.status}`, message: body?.error_description ?? '' });
  }
  accessCache = { token: body.access_token, until: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return accessCache.token;
}

async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const res = await fetcher(url, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.body ? { 'content-type': 'application/json' } : {}) } });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) accessCache = null;
    throw new GbpError(classifyFailure(res.status, body));
  }
  return body as T;
}

// ── OAuth ────────────────────────────────────────────────────────────────────────────────────────────

const STATE_TTL_MS = 10 * 60_000;
const signState = (payload: string) => createHmac('sha256', config.cookieSecret).update(`gbp-oauth:${payload}`).digest('base64url');

/** `state` = base64url(JSON{ staff, session, nonce, exp }) + "." + HMAC: bound to the staff session, 10 minutes. */
export function makeOAuthState(staffId: string, sessionId: string, nonce: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ s: staffId, sid: sessionId, n: nonce, exp: now + STATE_TTL_MS })).toString('base64url');
  return `${payload}.${signState(payload)}`;
}

export function readOAuthState(state: string, now = Date.now()): { staffId: string; sessionId: string; nonce: string } | null {
  const [payload, sig, extra] = state.split('.');
  if (!payload || !sig || extra !== undefined || !safeEqual(signState(payload), sig)) return null;
  try {
    const v = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { s?: unknown; sid?: unknown; n?: unknown; exp?: unknown };
    if (typeof v.s !== 'string' || typeof v.sid !== 'string' || typeof v.n !== 'string' || typeof v.exp !== 'number' || v.exp < now) return null;
    return { staffId: v.s, sessionId: v.sid, nonce: v.n };
  } catch { return null; }
}

/** The Google consent URL for the signed-in owner. Starting again cancels a flow in progress. */
export async function startOAuth(staffId: string, sessionId: string) {
  const nonce = randomToken(16);
  await writeState({ oauthNonce: sha256(nonce) });
  const q = new URLSearchParams({
    client_id: config.googleBusiness.clientId, redirect_uri: redirectUri(), response_type: 'code', scope: GBP_SCOPE,
    access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state: makeOAuthState(staffId, sessionId, nonce),
  });
  return `${AUTH_URL}?${q}`;
}

/**
 * Google's redirect back. The panel's bearer token does not travel with a browser redirect, so the
 * signed state carries the staff session; it must still be live and allowed to change settings.
 * Returns a short code for the panel (?gbp=…).
 */
export async function finishOAuth(q: { code?: string; state?: string; error?: string }, meta: { ip?: string; ua?: string } = {}): Promise<string> {
  const st = q.state ? readOAuthState(q.state) : null;
  if (!st) return 'bad_state';
  const cur = await readState();
  if (!cur.oauthNonce || !safeEqual(cur.oauthNonce, sha256(st.nonce))) return 'bad_state';
  await writeState({ oauthNonce: null });
  const session = await prisma.staffSession.findUnique({ where: { id: st.sessionId }, select: { revokedAt: true, expiresAt: true, staffUser: { select: { id: true, email: true, status: true, permVersion: true } } } });
  if (!session || session.revokedAt || session.expiresAt < new Date() || session.staffUser.status !== 'ACTIVE' || session.staffUser.id !== st.staffId) return 'bad_state';
  if (!(await resolvePermissions(session.staffUser.id, session.staffUser.permVersion)).has('settings.update')) return 'bad_state';
  if (q.error) return q.error === 'access_denied' ? 'denied' : 'google_error';
  if (!q.code) return 'google_error';

  const res = await fetcher(TOKEN_URL, form({ code: q.code, client_id: config.googleBusiness.clientId, client_secret: config.googleBusiness.clientSecret, redirect_uri: redirectUri(), grant_type: 'authorization_code' }));
  const body = (await res.json().catch(() => null)) as { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string } | null;
  if (!res.ok || !body?.access_token) return 'google_error';
  if (!body.scope?.split(' ').includes(GBP_SCOPE)) return 'scope';
  // prompt=consent makes Google issue a refresh token every time; without one there is nothing to keep.
  if (!body.refresh_token) return 'no_refresh_token';

  await prisma.$transaction(async (tx) => {
    await tx.setting.upsert({ where: { key: GBP_TOKEN_KEY }, create: { key: GBP_TOKEN_KEY, value: { sealed: seal(body.refresh_token!) }, updatedById: st.staffId }, update: { value: { sealed: seal(body.refresh_token!) }, updatedById: st.staffId } });
    await audit({ actorId: st.staffId, actorEmail: session.staffUser.email, action: 'google_business.connected', resourceType: 'Setting', resourceId: GBP_TOKEN_KEY, resourceLabel: 'Google Business Profile', ipAddress: meta.ip ?? null, userAgent: meta.ua ?? null }, tx);
  });
  accessCache = { token: body.access_token, until: Date.now() + (body.expires_in ?? 3600) * 1000 };
  await writeState({ connectedAt: new Date().toISOString(), connectedBy: session.staffUser.email, status: 'idle', code: null, message: null, dirty: true });
  return 'connected';
}

/** Revokes the refresh token at Google and forgets it, the chosen location and the status. */
export async function disconnect(actor: Actor) {
  const rt = await refreshToken().catch(() => null);
  let revoked = false;
  if (rt) {
    const res = await fetcher(REVOKE_URL, form({ token: rt })).catch(() => null);
    // 400 invalid_token: already revoked on Google's side — gone either way.
    revoked = !!res && (res.ok || res.status === 400);
  }
  accessCache = null;
  await prisma.$transaction(async (tx) => {
    await tx.setting.deleteMany({ where: { key: GBP_TOKEN_KEY } });
    await tx.setting.upsert({ where: { key: GBP_STATE_KEY }, create: { key: GBP_STATE_KEY, value: EMPTY as never }, update: { value: EMPTY as never } });
    await audit({ ...actor, action: 'google_business.disconnected', resourceType: 'Setting', resourceId: GBP_TOKEN_KEY, resourceLabel: 'Google Business Profile', after: { revokedAtGoogle: revoked } }, tx);
  });
  return { revoked };
}

// ── Locations ────────────────────────────────────────────────────────────────────────────────────────

interface GLocation { name: string; title?: string; storefrontAddress?: Parameters<typeof addressLine>[0] }

/** Every location the connected Google account can manage (accounts.list → accounts.locations.list). */
export async function listLocations(): Promise<GbpLocation[]> {
  const out: GbpLocation[] = [];
  let accountsPage: string | undefined;
  for (let i = 0; i < 5; i++) {
    const a = await call<{ accounts?: Array<{ name: string }>; nextPageToken?: string }>(`${ACCOUNTS_URL}?${new URLSearchParams({ pageSize: '20', ...(accountsPage ? { pageToken: accountsPage } : {}) })}`);
    for (const acc of a.accounts ?? []) {
      let page: string | undefined;
      for (let j = 0; j < 5; j++) {
        const l = await call<{ locations?: GLocation[]; nextPageToken?: string }>(`${INFO_BASE}/${acc.name}/locations?${new URLSearchParams({ readMask: 'name,title,storefrontAddress', pageSize: '100', ...(page ? { pageToken: page } : {}) })}`);
        for (const x of l.locations ?? []) if (!out.some((o) => o.name === x.name)) out.push({ name: x.name, title: x.title ?? x.name, address: addressLine(x.storefrontAddress) });
        if (!(page = l.nextPageToken)) break;
      }
    }
    if (!(accountsPage = a.nextPageToken)) break;
  }
  return out;
}

export const LOCATION_NAME = /^locations\/[A-Za-z0-9_-]{1,64}$/;

/** The owner's pick, confirmed by reading it from Google (title and address shown in the panel). */
export async function chooseLocation(name: string, actor: Actor) {
  const x = await call<GLocation>(`${INFO_BASE}/${name}?${new URLSearchParams({ readMask: 'name,title,storefrontAddress' })}`);
  const location = { name: x.name, title: x.title ?? x.name, address: addressLine(x.storefrontAddress) };
  const before = (await readState()).location;
  const next = await writeState({ location, dirty: true, inSync: null, lastCheckedAt: null, status: 'idle', code: null, message: null });
  await audit({ ...actor, action: 'google_business.location_changed', resourceType: 'Setting', resourceId: GBP_STATE_KEY, resourceLabel: location.title, before: before as never, after: location as never });
  return next;
}

// ── Sync and check ───────────────────────────────────────────────────────────────────────────────────

async function ourHours(today: string): Promise<HoursPayload> {
  // Straight from the table, not the 30-second settings cache: the job follows a save.
  const row = await prisma.setting.findUnique({ where: { key: SITE_CONTACT_KEY } });
  return hoursPayload(parseSiteContact(row?.value ?? null), today);
}

async function ready() {
  if (!gbpConfigured()) return null;
  const st = await readState();
  return st.location && (await hasToken()) ? st : null;
}

/** A failed listing or pick in the panel: «awaiting API access» is worth showing on the card. */
export async function noteFailure(f: GoogleFailure, actor: Actor) {
  if (f.kind === 'awaiting_api_access') await recordFailure(await readState(), f, new Date().toISOString(), actor);
}
/** A listing worked: Google has granted access. */
export async function noteAccess() {
  const st = await readState();
  if (st.status === 'awaiting_api_access' && !st.location) await writeState({ status: 'idle', code: null, message: null });
}

async function recordFailure(prev: GbpState, f: GoogleFailure, now: string, actor: Actor) {
  const status: GbpState['status'] = f.kind === 'awaiting_api_access' ? 'awaiting_api_access' : 'error';
  const next = await writeState({ status, code: f.code, message: f.message || null, lastAttemptAt: now });
  // One audit line per change of state, not one per retry.
  if (prev.status !== status || prev.code !== f.code) await audit({ ...actor, action: 'google_business.sync_failed', resourceType: 'Setting', resourceId: GBP_STATE_KEY, resourceLabel: prev.location?.title ?? null, after: { code: f.code, message: f.message } as Prisma.InputJsonValue });
  return next;
}

/**
 * One PATCH with updateMask=regularHours,specialHours — one edit, far under Google's 10 edits per
 * minute per profile. Transient failures (429 per-minute limit, 5xx, 401) throw so pg-boss retries
 * with backoff; «API access not approved» and other refusals are stored and retried by the daily job.
 */
export async function syncHours(actor: Actor = SYSTEM): Promise<GbpState | null> {
  const st = await ready();
  if (!st) return null;
  const now = new Date().toISOString();
  const body = await ourHours(kyivDate());
  try {
    await call(`${INFO_BASE}/${st.location!.name}?${new URLSearchParams({ updateMask: UPDATE_MASK })}`, { method: 'PATCH', body: JSON.stringify(body) });
  } catch (e) {
    if (!(e instanceof GbpError)) throw e;
    await recordFailure(st, e.failure, now, actor);
    if (e.failure.kind === 'transient') throw e;
    return readState();
  }
  const next = await writeState({ status: 'ok', code: null, message: null, dirty: false, lastSyncAt: now, lastAttemptAt: now, inSync: true, lastCheckedAt: now });
  await audit({ ...actor, action: 'google_business.synced', resourceType: 'Setting', resourceId: GBP_STATE_KEY, resourceLabel: st.location!.title, after: body as never });
  return next;
}

/**
 * The daily job. Unsent changes (or a profile still waiting for API access) are sent again; otherwise
 * Google's hours are read and compared. A difference is only reported — the panel offers to send ours.
 */
export async function checkHours(): Promise<GbpState | null> {
  if (!gbpConfigured() || !(await hasToken())) return null;
  const st = await readState();
  const now = new Date().toISOString();
  if (!st.location) {
    // Connected before Google approved API access, so nothing could be listed then: once it is, a single
    // profile is picked by itself; several wait for the owner.
    try {
      const list = await listLocations();
      if (list.length !== 1) return st.status === 'idle' ? st : writeState({ status: 'idle', code: null, message: null });
      await chooseLocation(list[0]!.name, SYSTEM);
    } catch (e) {
      if (!(e instanceof GbpError)) throw e;
      await recordFailure(st, e.failure, now, SYSTEM);
      if (e.failure.kind === 'transient') throw e;
      return readState();
    }
    return syncHours();
  }
  if (st.dirty || st.status !== 'ok') return syncHours();
  const today = kyivDate();
  try {
    const g = await call<Parameters<typeof sameHours>[1]>(`${INFO_BASE}/${st.location!.name}?${new URLSearchParams({ readMask: 'regularHours,specialHours' })}`);
    return writeState({ inSync: sameHours(await ourHours(today), g, today), lastCheckedAt: now });
  } catch (e) {
    if (!(e instanceof GbpError)) throw e;
    await recordFailure(st, e.failure, now, SYSTEM);
    if (e.failure.kind === 'transient') throw e;
    return readState();
  }
}

/** After the hours are saved: one sync about a minute later, however many saves happen meanwhile. Never throws. */
export async function queueHoursSync() {
  try {
    if (!(await ready())) return;
    await writeState({ dirty: true });
    await bossReady();
    await boss.send('google.syncHours', {}, { startAfter: 60, singletonKey: 'gbp', singletonSeconds: 60, singletonNextSlot: true, retryLimit: 6, retryDelay: 60, retryBackoff: true });
  } catch { /* the daily job sends unsent hours anyway */ }
}

/** What the panel may see: never the token. */
export async function publicState() {
  const st = await readState();
  const { oauthNonce: _n, ...rest } = st;
  return { ...rest, configured: gbpConfigured(), connected: await hasToken(), redirectUri: redirectUri() };
}
