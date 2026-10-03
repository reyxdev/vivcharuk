import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

// Round 24 G026: real-user speed (LCP, INP, CLS, TTFB) sent by the site's small RUM snippet with
// navigator.sendBeacon; G013–G015: CSP violation reports while the policy is report-only. Neither stores
// an IP, a cookie or a visitor id.

const metric = (max: number) => z.number().finite().min(0).max(max).optional();
export const rumBody = z.object({
  page: z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/),
  device: z.enum(['mobile', 'tablet', 'desktop']),
  LCP: metric(120_000), INP: metric(60_000), CLS: metric(50), TTFB: metric(120_000),
});
const METRICS = ['LCP', 'INP', 'CLS', 'TTFB'] as const;

const asJson = (body: string) => { try { return JSON.parse(body) as unknown; } catch { return null; } };

export async function telemetryRoutes(app: FastifyInstance) {
  // Browsers send CSP reports as application/csp-report (report-uri) or application/reports+json (report-to).
  app.addContentTypeParser(['application/csp-report', 'application/reports+json'], { parseAs: 'string', bodyLimit: 16_384 }, (_req, body, done) => done(null, asJson(body as string)));

  app.post('/rum', { bodyLimit: 2_048, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
    const r = rumBody.safeParse(req.body);
    if (r.success) {
      const rows = METRICS.flatMap((m) => (r.data[m] === undefined ? [] : [{ metric: m, value: r.data[m]!, page: r.data.page, device: r.data.device }]));
      if (rows.length) await prisma.rumSample.createMany({ data: rows });
    }
    return reply.status(204).send();
  });

  // Report-only CSP (deploy/Caddyfile): violations go to the log, nowhere else.
  app.post('/csp-report', { bodyLimit: 16_384, config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req, reply) => {
    const body = req.body as Record<string, unknown> | Array<Record<string, unknown>> | null;
    const reports = Array.isArray(body) ? body.map((x) => x.body) : body ? [body['csp-report'] ?? body] : [];
    for (const r of reports.slice(0, 5)) {
      const x = (r ?? {}) as Record<string, unknown>;
      req.log.warn({ csp: {
        page: String(x['document-uri'] ?? x.documentURL ?? '').slice(0, 200),
        directive: String(x['effective-directive'] ?? x.effectiveDirective ?? x['violated-directive'] ?? '').slice(0, 80),
        blocked: String(x['blocked-uri'] ?? x.blockedURL ?? '').slice(0, 200),
        source: String(x['source-file'] ?? x.sourceFile ?? '').slice(0, 200),
      } }, 'csp violation');
    }
    return reply.status(204).send();
  });
}
