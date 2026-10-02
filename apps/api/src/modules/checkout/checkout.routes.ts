import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createOrderInput, deliveryMethod, locale } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { getOrCreateCart } from '../cart/cart.service';
import { listWarehouses, searchCities } from '../shipping/shipping.service';
import { orderByToken } from '../orders/orders.service';
import { completeStubPayment, startPayment } from '../payments/payments.service';
import { config } from '../../config';
import * as checkout from './checkout.service';

const localeQuery = z.object({ locale: locale.default('uk') });

async function cartOf(req: FastifyRequest) {
  const token = req.cookies.vk_cart;
  if (!token) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'cart', code: 'CART_EMPTY' }]);
  const { locale: l } = localeQuery.parse(req.query);
  return { cart: await getOrCreateCart(token, l), locale: l };
}

export async function checkoutRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'private, no-store'); });

  app.get('/checkout/quote', async (req) => {
    const { cart, locale: l } = await cartOf(req);
    const { delivery, promoCode } = z.object({ delivery: deliveryMethod.default('NP_BRANCH'), promoCode: z.string().trim().max(40).optional() }).parse(req.query);
    return checkout.quote(cart.id, l, delivery, promoCode || undefined);
  });

  app.get('/checkout/np/cities', async (req) => ({ items: await searchCities(z.object({ q: z.string().max(60).default('') }).parse(req.query).q) }));
  app.get('/checkout/np/warehouses', async (req) => ({ items: await listWarehouses(z.object({ cityRef: z.string().max(64) }).parse(req.query).cityRef) }));

  app.post('/checkout/orders', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || key.length < 16 || key.length > 64) throw new AppError(400, 'MALFORMED_BODY', 'IDEMPOTENCY_KEY_REQUIRED');
    const { cart, locale: l } = await cartOf(req);
    const res = await checkout.createOrder(cart.id, l, createOrderInput.parse(req.body), key);
    return reply.status(201).send(res);
  });

  app.get<{ Params: { token: string } }>('/orders/:token', async (req) => orderByToken(req.params.token));
  app.post<{ Params: { token: string } }>('/orders/:token/pay', async (req) => startPayment(req.params.token));

  // Development payment page standing in for the WayForPay widget. Absent in production.
  if (config.payments.stub) {
    app.get<{ Params: { token: string } }>('/dev/wayforpay/:token', async (req, reply) => {
      const o = await orderByToken(req.params.token);
      const amount = (o.amountDueNowMinor / 100).toLocaleString('uk-UA');
      reply.type('text/html').header('cache-control', 'no-store');
      return `<!doctype html><html lang="uk"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Тестова оплата</title>
<body style="font-family:system-ui;background:#F2EDE3;display:grid;place-items:center;min-height:100vh;margin:0">
<form method="post" style="background:#fff;padding:24px;border-radius:12px;max-width:360px;display:flex;flex-direction:column;gap:12px">
<strong>Тестова оплата (заглушка WayForPay)</strong><span>Замовлення ${o.number}: ${amount} ₴</span>
<span style="color:#666;font-size:14px">Справжня оплата підключиться після договору з WayForPay.</span>
<button name="result" value="approved" style="padding:12px;background:#1F3A2E;color:#fff;border:0;border-radius:8px">Оплата успішна</button>
<button name="result" value="declined" style="padding:12px;border:1px solid #1F3A2E;background:#fff;border-radius:8px">Відмова банку</button></form></body></html>`;
    });
    app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_r, body, done) => done(null, Object.fromEntries(new URLSearchParams(body as string))));
    app.post<{ Params: { token: string }; Body: { result?: string } }>('/dev/wayforpay/:token', async (req, reply) => {
      const o = await orderByToken(req.params.token);
      await completeStubPayment(req.params.token, req.body?.result === 'approved');
      return reply.redirect(`${config.siteUrl}/uk/zamovlennia/${req.params.token}?paid=${req.body?.result === 'approved' ? 1 : 0}&n=${o.number}`);
    });
  }
}
