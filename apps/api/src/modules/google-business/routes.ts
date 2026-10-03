import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { requirePermission } from '../../plugins/staffAuth';
import { chooseLocation, disconnect, finishOAuth, GbpError, gbpConfigured, hasToken, listLocations, LOCATION_NAME, noteAccess, noteFailure, publicState, readState, startOAuth, syncHours } from './service';

// The «Google Карти» card in Settings (2026-10-03). Owner and Administrator (settings.update) only.
export async function googleBusinessRoutes(app: FastifyInstance) {
  const perm = { preHandler: requirePermission('settings.update') };
  const actor = (req: { staff?: { id: string; email: string } }) => ({ actorId: req.staff!.id, actorEmail: req.staff!.email });
  const failure = (e: unknown) => { if (e instanceof GbpError) return { code: e.failure.code, message: e.failure.message }; throw e; };
  const noted = async (e: unknown, a: { actorId: string | null; actorEmail: string }) => { if (e instanceof GbpError) await noteFailure(e.failure, a); return failure(e); };

  app.get('/admin/google-business', perm, async (_req, reply) => { reply.header('cache-control', 'no-store'); return publicState(); });

  app.post('/admin/google-business/oauth/start', perm, async (req) => {
    if (!gbpConfigured()) throw new AppError(503, 'SERVICE_UNAVAILABLE', 'GBP_NOT_CONFIGURED');
    return { url: await startOAuth(req.staff!.id, req.staff!.sessionId) };
  });

  // Google sends the browser here; no bearer token travels with it — the signed `state` is the proof.
  // `logLevel: warn` keeps the authorization code in the URL out of the request log.
  app.get<{ Querystring: { code?: string; state?: string; error?: string } }>('/admin/google-business/oauth/callback',
    { logLevel: 'warn', config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const q = req.query ?? {};
      const result = gbpConfigured()
        ? await finishOAuth({ code: q.code, state: q.state, error: q.error }, { ip: req.ip, ua: req.headers['user-agent'] })
        : 'not_configured';
      reply.header('cache-control', 'no-store').header('referrer-policy', 'no-referrer');
      return reply.redirect(`${config.adminUrl.replace(/\/$/, '')}/settings?t=google&gbp=${encodeURIComponent(result)}`);
    });

  app.get('/admin/google-business/locations', perm, async (req) => {
    if (!(await hasToken())) throw new AppError(404, 'NOT_FOUND', 'GBP_NOT_CONNECTED');
    try { const locations = await listLocations(); await noteAccess(); return { locations, failure: null }; } catch (e) { return { locations: [], failure: await noted(e, actor(req)) }; }
  });

  app.put('/admin/google-business/location', perm, async (req) => {
    const { name } = z.object({ name: z.string().regex(LOCATION_NAME) }).parse(req.body);
    if (!(await hasToken())) throw new AppError(404, 'NOT_FOUND', 'GBP_NOT_CONNECTED');
    try { await chooseLocation(name, actor(req)); return { state: await publicState(), failure: null }; } catch (e) { const f = await noted(e, actor(req)); return { state: await publicState(), failure: f }; }
  });

  // «Відправити зараз»: at once, with the answer on screen. One press per 10 seconds keeps far under
  // Google's 10 edits per minute per profile.
  app.post('/admin/google-business/sync', perm, async (req) => {
    const st = await readState();
    if (!st.location || !(await hasToken())) throw new AppError(404, 'NOT_FOUND', 'GBP_NOT_READY');
    if (st.lastAttemptAt && Date.now() - Date.parse(st.lastAttemptAt) < 10_000) throw new AppError(429, 'RATE_LIMITED');
    try { await syncHours(actor(req)); } catch (e) { failure(e); }
    return publicState();
  });

  app.post('/admin/google-business/disconnect', perm, async (req) => {
    const r = await disconnect(actor(req));
    return { ...r, state: await publicState() };
  });
}
