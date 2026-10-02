import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { BUSINESS, COD_MAX_MINOR_DEFAULT, DEFAULT_SITE_CONTACT, DEFAULT_TICKER, DEFAULT_VOLUME_TIERS, PREPAY_MIN_MINOR_DEFAULT, siteContactSchema, SITE_CONTACT_KEY, SITE_TICKER_KEY, tickerSchema, type SiteContact } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { getSetting, invalidateSetting } from '../../lib/settings';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';

// Only these keys are editable from the panel; each has its schema, default and permission.
const KEYS = {
  'admin.announcement': { schema: z.string().trim().max(500).nullable(), fallback: null, perm: 'settings.update' },
  // Round 14: card-type payments stay off until the WayForPay cash register (ПРРО) is registered.
  'payments.card_enabled': { schema: z.boolean(), fallback: false, perm: 'settings.manage_integrations' },
  'payments.prepayment.min_minor': { schema: z.number().int().min(0).max(1_000_000), fallback: PREPAY_MIN_MINOR_DEFAULT, perm: 'settings.update' },
  'payments.cod.max_minor': { schema: z.number().int().min(0).max(100_000_000), fallback: COD_MAX_MINOR_DEFAULT, perm: 'settings.update' },
  'pricing.volume_tiers': { schema: z.array(z.object({ minUnits: z.number().int().min(2).max(1000), percent: z.number().int().min(1).max(60) })).max(5), fallback: DEFAULT_VOLUME_TIERS, perm: 'settings.update' },
  // D28: hours, the shop phone (calls and messengers) and the public e-mail — the «Магазин» tile.
  [SITE_CONTACT_KEY]: { schema: siteContactSchema, fallback: DEFAULT_SITE_CONTACT, perm: 'settings.update' },
  // D29: the top-strip phrases with switches and order — the «Сайт» tile, beside the banners.
  [SITE_TICKER_KEY]: { schema: tickerSchema, fallback: DEFAULT_TICKER, perm: 'promotions.manage_banners' },
} as const;
type Key = keyof typeof KEYS;

export async function settingsRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/settings', { preHandler: requirePermission('settings.read') }, async () => {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(KEYS) as Key[]) out[k] = await getSetting(k, KEYS[k].fallback);
    return {
      values: out, telegramBotConfigured: !!config.telegram.botToken, paymentsStub: config.payments.stub,
      novaPoshtaConfigured: !!config.shipping.npApiKey,
      // Round 20 #173: shown read-only on the «Магазин» tile; these stay in code (packages/schemas BUSINESS).
      business: { address: BUSINESS.factoryAddress, legalEntityName: BUSINESS.legalEntityName },
    };
  });

  app.put<{ Params: { key: string } }>('/admin/settings/:key', { preHandler: requirePermission('settings.read') }, async (req, reply) => {
    const key = req.params.key as Key;
    const def = KEYS[key];
    if (!def) throw new AppError(404, 'NOT_FOUND');
    if (!req.staff!.permissions.has(def.perm)) throw forbidden();
    const value = def.schema.parse((req.body as { value?: unknown } | undefined)?.value);
    // The public address must never be a staff sign-in address (round 8: the owner's login stays unpublished).
    if (key === SITE_CONTACT_KEY && (await prisma.staffUser.count({ where: { email: { equals: (value as SiteContact).publicEmail, mode: 'insensitive' } } }))) {
      throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'publicEmail', code: 'STAFF_LOGIN' }]);
    }
    const before = await prisma.setting.findUnique({ where: { key } });
    await prisma.$transaction(async (tx) => {
      await tx.setting.upsert({ where: { key }, create: { key, value: value as never, updatedById: req.staff!.id }, update: { value: value as never, updatedById: req.staff!.id } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'setting.updated', resourceType: 'Setting', resourceId: key, resourceLabel: key, before: (before?.value ?? null) as never, after: value as never }, tx);
    });
    invalidateSetting(key);
    return reply.status(204).send();
  });

  // Telegram test messages are personal now: POST /auth/staff/telegram/test (telegram.routes.ts).
}
