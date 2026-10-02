import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { addCartItemInput, locale } from '@vivcharyk/schemas';
import { config } from '../../config';
import * as cart from './cart.service';

const CART_COOKIE = 'vk_cart';
const localeQuery = z.object({ locale: locale.default('uk') });

// Identity is the httpOnly cart cookie; no cart endpoint requires a login (26 §26.10.3).
async function resolveCart(req: FastifyRequest, reply: FastifyReply) {
  const { locale: l } = localeQuery.parse(req.query);
  const c = await cart.getOrCreateCart(req.cookies[CART_COOKIE], l);
  if (req.cookies[CART_COOKIE] !== c.token) {
    reply.setCookie(CART_COOKIE, c.token, { httpOnly: true, secure: config.isProd, sameSite: 'lax', path: '/', maxAge: cart.CART_TTL_DAYS * 86_400 });
  }
  reply.header('cache-control', 'private, no-store');
  return { cart: c, locale: l };
}

export async function cartRoutes(app: FastifyInstance) {
  const mutation = { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } };

  app.get('/cart', async (req, reply) => {
    const { cart: c, locale: l } = await resolveCart(req, reply);
    return cart.viewCart(c.id, l);
  });

  app.post('/cart/items', mutation, async (req, reply) => {
    const { cart: c, locale: l } = await resolveCart(req, reply);
    await cart.addItem(c.id, addCartItemInput.parse(req.body));
    await cart.touch(c.id);
    return cart.viewCart(c.id, l);
  });

  app.patch<{ Params: { itemId: string } }>('/cart/items/:itemId', mutation, async (req, reply) => {
    const { cart: c, locale: l } = await resolveCart(req, reply);
    const { quantityMilli } = z.object({ quantityMilli: z.number().int().min(1).max(99_000) }).parse(req.body);
    await cart.setQuantity(c.id, req.params.itemId, quantityMilli);
    return cart.viewCart(c.id, l);
  });

  app.delete<{ Params: { itemId: string } }>('/cart/items/:itemId', mutation, async (req, reply) => {
    const { cart: c, locale: l } = await resolveCart(req, reply);
    await cart.removeItem(c.id, req.params.itemId);
    return cart.viewCart(c.id, l);
  });
}
