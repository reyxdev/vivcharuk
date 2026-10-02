import Fastify, { type FastifyError } from 'fastify';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { config } from './config';
import { enqueue } from './lib/jobs';
import { AppError } from './lib/errors';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { catalogRoutes } from './modules/catalog/catalog.routes';
import { cartRoutes } from './modules/cart/cart.routes';
import { checkoutRoutes } from './modules/checkout/checkout.routes';
import { adminOrderRoutes } from './modules/orders/admin-orders.routes';
import { adminProductRoutes } from './modules/products/admin-products.routes';
import { productionRoutes } from './modules/content/production.routes';
import { pricingRoutes, redirectRoutes } from './modules/content/pricing.routes';
import { reviewRoutes } from './modules/reviews/reviews.routes';
import { adminReviewRoutes } from './modules/reviews/admin-reviews.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { quickOrderRoutes } from './modules/quick-orders/quick-orders.routes';
import { adminCreateOrderRoutes } from './modules/orders/admin-create.routes';
import { settingsRoutes } from './modules/settings/settings.routes';
import { libraryRoutes } from './modules/libraries/libraries.routes';
import { adminCategoryRoutes } from './modules/categories/admin-categories.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { employeeRoutes } from './modules/employees/employees.routes';
import { seoRoutes } from './modules/seo/seo.routes';
import { templateRoutes } from './modules/templates/templates.routes';
import { customerRoutes } from './modules/customers/customers.routes';
import { stockRoutes } from './modules/stock/stock.routes';
import { adminCollectionRoutes } from './modules/collections/collections.routes';
import { blogRoutes } from './modules/blog/blog.routes';
import { promotionRoutes } from './modules/promotions/promotions.routes';
import { mailRoutes } from './modules/mail/mail.routes';
import { newsletterRoutes } from './modules/newsletter/newsletter.routes';
import { searchRoutes } from './modules/dashboard/search.routes';
import { adminMediaRoutes } from './modules/content/media.routes';
import { telegramRoutes } from './modules/notifications/telegram.routes';
import { ADMIN_ROOT, adminBase, adminStatic } from './plugins/adminStatic';
import { mediaStatic } from './plugins/mediaStatic';

// D21 (2026-10-02): a server error reaches the developer («Технічна підтримка») in Telegram — the same
// error at most once per 10 minutes, with how many times it happened meanwhile.
const seenErrors = new Map<string, { at: number; count: number }>();
function reportServerError(err: Error, where: string, requestId: string) {
  if (config.env === 'test') return;
  const key = `${where}|${err.message}`.slice(0, 300);
  const now = Date.now();
  const s = seenErrors.get(key);
  if (s && now - s.at < 600_000) { s.count++; return; }
  seenErrors.set(key, { at: now, count: 1 });
  void enqueue('notify.telegram', { kind: 'server_error', message: `${err.name}: ${err.message}`, where, requestId, count: s?.count }).catch(() => undefined);
}

export async function buildApp() {
  const app = Fastify({
    logger: config.isProd ? true : { transport: { target: 'pino-pretty' } },
    genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
    trustProxy: true,
  });

  app.addHook('onSend', async (req, reply) => {
    reply.header('x-request-id', req.id);
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie, { secret: config.cookieSecret });
  await app.register(rateLimit, { global: false });

  // One error envelope for every failure (26 §26.8).
  app.setErrorHandler((err: FastifyError | AppError | ZodError, req, reply) => {
    if (err instanceof ZodError) {
      return reply.status(422).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'VALIDATION_FAILED',
          fieldErrors: err.issues.map((i) => ({ path: i.path.join('.'), code: i.code })),
          requestId: req.id,
        },
      });
    }
    if (err instanceof AppError) {
      return reply.status(err.status).send({
        error: { code: err.code, message: err.message, params: err.params, fieldErrors: err.fieldErrors, requestId: req.id },
      });
    }
    const status = (err as FastifyError).statusCode ?? 500;
    if (status === 429) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'RATE_LIMITED', requestId: req.id } });
    }
    if (status >= 400 && status < 500) {
      return reply.status(400).send({ error: { code: 'MALFORMED_BODY', message: 'MALFORMED_BODY', requestId: req.id } });
    }
    req.log.error(err);
    reportServerError(err, `${req.method} ${req.url.split('?')[0]}`, req.id);
    return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'INTERNAL_ERROR', requestId: req.id } });
  });

  app.setNotFoundHandler((req, reply) => {
    const path = req.url.split('?')[0]!;
    if (req.method === 'GET' && path.startsWith(`${adminBase}/`) && !path.includes('/assets/')) {
      reply.header('cache-control', 'no-store');
      return reply.sendFile('index.html', ADMIN_ROOT);
    }
    return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'NOT_FOUND', requestId: req.id } });
  });

  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
      await v1.register(authRoutes);
      await v1.register(catalogRoutes);
      await v1.register(productionRoutes);
      await v1.register(pricingRoutes);
      await v1.register(redirectRoutes);
      await v1.register(reviewRoutes);
      await v1.register(adminReviewRoutes);
      await v1.register(dashboardRoutes);
      await v1.register(quickOrderRoutes);
      await v1.register(adminCreateOrderRoutes);
      await v1.register(settingsRoutes);
      await v1.register(libraryRoutes);
      await v1.register(adminCategoryRoutes);
      await v1.register(auditRoutes);
      await v1.register(employeeRoutes);
      await v1.register(seoRoutes);
      await v1.register(templateRoutes);
      await v1.register(customerRoutes);
      await v1.register(stockRoutes);
      await v1.register(adminCollectionRoutes);
      await v1.register(blogRoutes);
      await v1.register(promotionRoutes);
      await v1.register(mailRoutes);
      await v1.register(newsletterRoutes);
      await v1.register(searchRoutes);
      await v1.register(adminMediaRoutes);
      await v1.register(telegramRoutes);
      await v1.register(cartRoutes);
      await v1.register(checkoutRoutes);
      await v1.register(adminOrderRoutes);
      await v1.register(adminProductRoutes);
    },
    { prefix: '/api/v1' },
  );

  await app.register(adminStatic);
  await app.register(mediaStatic);

  return app;
}
