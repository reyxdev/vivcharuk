import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { normalizeCode } from './promotions.service';

const promoBody = z.object({
  code: z.string().trim().min(3).max(40).transform(normalizeCode).refine((c) => /^[A-ZА-ЯІЇЄҐ0-9_-]+$/.test(c), 'CODE_CHARS'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  percentage: z.number().int().min(1).max(90).nullable().default(null),
  valueMinor: z.number().int().min(100).max(10_000_000).nullable().default(null),
  minSubtotalMinor: z.number().int().min(0).max(100_000_000).nullable().default(null),
  usageLimit: z.number().int().min(1).max(1_000_000).nullable().default(null),
  perCustomerLimit: z.number().int().min(1).max(100).nullable().default(null),
  productIds: z.array(z.string().max(40)).max(200).default([]),
  categoryIds: z.array(z.string().max(40)).max(50).default([]),
  startsAt: z.coerce.date().nullable().default(null),
  endsAt: z.coerce.date().nullable().default(null),
  isActive: z.boolean().default(true),
}).refine((b) => (b.type === 'PERCENTAGE' ? b.percentage !== null : b.valueMinor !== null), { path: ['value'], message: 'REQUIRED' })
  .refine((b) => !b.startsAt || !b.endsAt || b.startsAt < b.endsAt, { path: ['endsAt'], message: 'BEFORE_START' });

type PromoRow = Prisma.PromotionGetPayload<object>;
const view = (p: PromoRow) => ({
  id: p.id, code: p.code, type: p.type, percentage: p.percentage, valueMinor: p.valueMinor, minSubtotalMinor: p.minSubtotalMinor,
  usageLimit: p.usageLimit, usageCount: p.usageCount, perCustomerLimit: p.perCustomerLimit, productIds: p.appliesToProductIds, categoryIds: p.appliesToCategoryIds,
  startsAt: p.startsAt?.toISOString() ?? null, endsAt: p.endsAt?.toISOString() ?? null, isActive: p.isActive, createdAt: p.createdAt.toISOString(),
});

/** 23 §23.12: another active code whose window and products intersect this one is named, not blocked. */
async function overlaps(b: z.infer<typeof promoBody>, selfId?: string) {
  const others = await prisma.promotion.findMany({ where: { isActive: true, code: { not: null }, ...(selfId ? { id: { not: selfId } } : {}) } });
  const from = b.startsAt?.getTime() ?? -Infinity, to = b.endsAt?.getTime() ?? Infinity;
  return others.filter((o) => {
    const oFrom = o.startsAt?.getTime() ?? -Infinity, oTo = o.endsAt?.getTime() ?? Infinity;
    const time = from < oTo && oFrom < to;
    // Category limits are not expanded here: any two limited codes with a category are named as possible overlaps.
    const mineAll = !b.productIds.length && !b.categoryIds.length, theirsAll = !o.appliesToProductIds.length && !o.appliesToCategoryIds.length;
    const scope = mineAll || theirsAll || b.productIds.some((id) => o.appliesToProductIds.includes(id)) || b.categoryIds.some((id) => o.appliesToCategoryIds.includes(id)) || (!!b.categoryIds.length !== !!o.appliesToCategoryIds.length);
    const expired = !!o.endsAt && o.endsAt.getTime() <= Date.now();
    return !expired && time && scope;
  }).map((o) => o.code!);
}

const data = (b: z.infer<typeof promoBody>) => ({
  code: b.code, type: b.type, percentage: b.type === 'PERCENTAGE' ? b.percentage : null, valueMinor: b.type === 'FIXED' ? b.valueMinor : null,
  minSubtotalMinor: b.minSubtotalMinor, usageLimit: b.usageLimit, perCustomerLimit: b.perCustomerLimit, appliesToProductIds: b.productIds, appliesToCategoryIds: b.categoryIds,
  startsAt: b.startsAt, endsAt: b.endsAt, isActive: b.isActive,
});

// Round 10 #25 / round 11: the seasonal message joins the announcement strip while active.
const announcementBody = z.object({
  text: z.string().trim().min(3).max(120),
  linkUrl: z.string().trim().max(300).regex(/^\/[a-z]{2}\/[^\s]*$|^$/, 'SITE_PATH').transform((v) => v || null).nullable().default(null),
  startsAt: z.coerce.date().nullable().default(null),
  endsAt: z.coerce.date().nullable().default(null),
  isActive: z.boolean().default(true),
});

const bannerBody = z.object({
  id: z.string().max(40).optional(),
  mediaId: z.string().max(40),
  title: z.string().trim().min(2).max(80),
  buttonLabel: z.string().trim().max(30).transform((v) => v || null).nullable().default(null),
  linkUrl: z.string().trim().max(300).regex(/^\/[a-z]{2}\/[^\s]*$|^$/, 'SITE_PATH').transform((v) => v || null).nullable().default(null),
  startsAt: z.coerce.date().nullable().default(null),
  endsAt: z.coerce.date().nullable().default(null),
  isActive: z.boolean().default(true),
}).refine((b) => !b.startsAt || !b.endsAt || b.startsAt < b.endsAt, { path: ['endsAt'], message: 'BEFORE_START' });

const thumb = (m: { publicId: string; provider: string } | null) => (m && m.provider === 'local' ? `/media/${m.publicId.slice('local:'.length)}-480.webp` : null);
type BannerRow = Prisma.BannerGetPayload<{ include: { translations: true } }>;
const bannerView = (b: BannerRow, m: { publicId: string; provider: string } | null) => ({
  id: b.id, mediaId: b.mediaId, thumb: thumb(m), title: b.translations[0]?.headline ?? '', buttonLabel: b.translations[0]?.ctaLabel ?? null, linkUrl: b.linkUrl,
  startsAt: b.startsAt?.toISOString() ?? null, endsAt: b.endsAt?.toISOString() ?? null, isActive: b.isActive,
});

export async function promotionRoutes(app: FastifyInstance) {
  app.get('/admin/promotions', { preHandler: requirePermission('promotions.read') }, async (_req, reply) => {
    reply.header('cache-control', 'no-store');
    const rows = await prisma.promotion.findMany({ where: { code: { not: null } }, orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }] });
    // Round 20 #172: «Замовлень на суму» — orders that carried the code, cancelled ones left out.
    const sums = await prisma.order.groupBy({ by: ['couponCode'], where: { couponCode: { in: rows.map((r) => r.code!) }, status: { not: 'CANCELLED' } }, _sum: { totalMinor: true }, _count: true });
    const by = new Map(sums.map((x) => [x.couponCode, x]));
    return { items: rows.map((p) => ({ ...view(p), ordersCount: by.get(p.code)?._count ?? 0, ordersSumMinor: by.get(p.code)?._sum.totalMinor ?? 0 })) };
  });

  app.post('/admin/promotions', { preHandler: requirePermission('promotions.create') }, async (req, reply) => {
    const b = promoBody.parse(req.body);
    if (await prisma.promotion.findUnique({ where: { code: b.code } })) throw new AppError(409, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'code', code: 'CODE_TAKEN' }]);
    const warnings = await overlaps(b);
    const p = await prisma.$transaction(async (tx) => {
      const row = await tx.promotion.create({ data: { ...data(b), createdById: req.staff!.id } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'promotion.created', resourceType: 'Promotion', resourceId: row.id, resourceLabel: row.code, after: view(row) }, tx);
      return row;
    });
    return reply.status(201).send({ promotion: view(p), overlaps: warnings });
  });

  app.put<{ Params: { id: string } }>('/admin/promotions/:id', { preHandler: requirePermission('promotions.update') }, async (req) => {
    const b = promoBody.parse(req.body);
    const old = await prisma.promotion.findUnique({ where: { id: req.params.id } });
    if (!old) throw new AppError(404, 'NOT_FOUND');
    // A used code keeps its name: orders already carry it.
    if (old.usageCount > 0 && old.code !== b.code) throw new AppError(409, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'code', code: 'CODE_IN_USE' }]);
    if (old.code !== b.code && (await prisma.promotion.findUnique({ where: { code: b.code } }))) throw new AppError(409, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'code', code: 'CODE_TAKEN' }]);
    const warnings = b.isActive ? await overlaps(b, old.id) : [];
    const p = await prisma.$transaction(async (tx) => {
      const row = await tx.promotion.update({ where: { id: old.id }, data: data(b) });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'promotion.updated', resourceType: 'Promotion', resourceId: row.id, resourceLabel: row.code, before: view(old), after: view(row) }, tx);
      return row;
    });
    return { promotion: view(p), overlaps: warnings };
  });

  // The list's «Увімкнено» switch: only the on/off flag changes.
  app.patch<{ Params: { id: string } }>('/admin/promotions/:id', { preHandler: requirePermission('promotions.update') }, async (req) => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const old = await prisma.promotion.findUnique({ where: { id: req.params.id } });
    if (!old) throw new AppError(404, 'NOT_FOUND');
    const p = await prisma.$transaction(async (tx) => {
      const row = await tx.promotion.update({ where: { id: old.id }, data: { isActive } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: isActive ? 'promotion.enabled' : 'promotion.disabled', resourceType: 'Promotion', resourceId: row.id, resourceLabel: row.code }, tx);
      return row;
    });
    return { promotion: view(p) };
  });

  app.delete<{ Params: { id: string } }>('/admin/promotions/:id', { preHandler: requirePermission('promotions.delete') }, async (req, reply) => {
    const old = await prisma.promotion.findUnique({ where: { id: req.params.id } });
    if (!old) throw new AppError(404, 'NOT_FOUND');
    if (old.usageCount > 0) throw new AppError(409, 'VALIDATION_FAILED', 'PROMO_USED');
    await prisma.$transaction(async (tx) => {
      await tx.promotion.delete({ where: { id: old.id } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'promotion.deleted', resourceType: 'Promotion', resourceId: old.id, resourceLabel: old.code, before: view(old) }, tx);
    });
    return reply.status(204).send();
  });

  // The single seasonal message of the announcement strip (a Banner with placement announcement_bar).
  app.get('/admin/announcement', { preHandler: requirePermission('promotions.read') }, async (_req, reply) => {
    reply.header('cache-control', 'no-store');
    const b = await prisma.banner.findFirst({ where: { placement: 'announcement_bar' }, include: { translations: { where: { locale: 'uk' } } } });
    return b ? { text: b.translations[0]?.headline ?? '', linkUrl: b.linkUrl, startsAt: b.startsAt?.toISOString() ?? null, endsAt: b.endsAt?.toISOString() ?? null, isActive: b.isActive } : null;
  });
  app.put('/admin/announcement', { preHandler: requirePermission('promotions.manage_banners') }, async (req) => {
    const b = announcementBody.parse(req.body);
    await prisma.$transaction(async (tx) => {
      const old = await tx.banner.findFirst({ where: { placement: 'announcement_bar' } });
      const row = old
        ? await tx.banner.update({ where: { id: old.id }, data: { linkUrl: b.linkUrl, startsAt: b.startsAt, endsAt: b.endsAt, isActive: b.isActive } })
        : await tx.banner.create({ data: { placement: 'announcement_bar', linkUrl: b.linkUrl, startsAt: b.startsAt, endsAt: b.endsAt, isActive: b.isActive } });
      await tx.bannerTranslation.upsert({ where: { bannerId_locale: { bannerId: row.id, locale: 'uk' } }, create: { bannerId: row.id, locale: 'uk', headline: b.text }, update: { headline: b.text } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'announcement.updated', resourceType: 'Banner', resourceId: row.id, after: { ...b, startsAt: b.startsAt?.toISOString() ?? null, endsAt: b.endsAt?.toISOString() ?? null } }, tx);
    });
    return { ok: true };
  });

  // Round 20 #230–231: up to three home banners — photo, title, button, shown from–to. Saved as one
  // ordered set, so dragging the order and deleting happen in a single request.
  app.get('/admin/banners', { preHandler: requirePermission('promotions.read') }, async (_req, reply) => {
    reply.header('cache-control', 'no-store');
    const rows = await prisma.banner.findMany({ where: { placement: 'home_hero' }, orderBy: { position: 'asc' }, include: { translations: { where: { locale: 'uk' } } } });
    const media = await prisma.media.findMany({ where: { id: { in: rows.flatMap((b) => (b.mediaId ? [b.mediaId] : [])) } }, select: { id: true, publicId: true, provider: true } });
    return { items: rows.map((b) => bannerView(b, media.find((m) => m.id === b.mediaId) ?? null)) };
  });
  app.put('/admin/banners', { preHandler: requirePermission('promotions.manage_banners') }, async (req) => {
    const { items } = z.object({ items: z.array(bannerBody).max(3) }).parse(req.body);
    if (items.length && (await prisma.media.count({ where: { id: { in: items.map((b) => b.mediaId) } } })) !== new Set(items.map((b) => b.mediaId)).size) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'mediaId', code: 'NOT_FOUND' }]);
    await prisma.$transaction(async (tx) => {
      const keepIds = items.flatMap((b) => (b.id ? [b.id] : []));
      await tx.banner.deleteMany({ where: { placement: 'home_hero', id: { notIn: keepIds } } });
      for (const [i, b] of items.entries()) {
        const data = { mediaId: b.mediaId, linkUrl: b.linkUrl, position: i, startsAt: b.startsAt, endsAt: b.endsAt, isActive: b.isActive };
        const exists = b.id ? await tx.banner.findFirst({ where: { id: b.id, placement: 'home_hero' } }) : null;
        const row = exists ? await tx.banner.update({ where: { id: exists.id }, data }) : await tx.banner.create({ data: { ...data, placement: 'home_hero' } });
        await tx.bannerTranslation.upsert({ where: { bannerId_locale: { bannerId: row.id, locale: 'uk' } }, create: { bannerId: row.id, locale: 'uk', headline: b.title, ctaLabel: b.buttonLabel }, update: { headline: b.title, ctaLabel: b.buttonLabel } });
      }
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'banners.updated', resourceType: 'Banner', resourceLabel: items.map((b) => b.title).join(' · ') || null, after: { count: items.length } }, tx);
    });
    return { ok: true };
  });

  // Public: the home banners showing now (uk text; other locales wait for translations).
  app.get('/site/banners', async (_req, reply) => {
    reply.header('cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    const now = new Date();
    const rows = await prisma.banner.findMany({
      where: { placement: 'home_hero', isActive: true, mediaId: { not: null }, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] },
      orderBy: { position: 'asc' }, take: 3, include: { translations: { where: { locale: 'uk' } } },
    });
    const media = await prisma.media.findMany({ where: { id: { in: rows.map((b) => b.mediaId!) } }, select: { id: true, publicId: true, width: true, height: true } });
    return {
      items: rows.flatMap((b) => {
        const m = media.find((x) => x.id === b.mediaId);
        const t = b.translations[0];
        return m && t?.headline ? [{ title: t.headline, buttonLabel: t.ctaLabel, linkUrl: b.linkUrl, image: { publicId: m.publicId, width: m.width, height: m.height } }] : [];
      }),
    };
  });

  // Public: the active seasonal message, if any (uk text; other locales wait for translations).
  app.get('/site/announcement', async (_req, reply) => {
    reply.header('cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    const now = new Date();
    const b = await prisma.banner.findFirst({
      where: { placement: 'announcement_bar', isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] },
      include: { translations: { where: { locale: 'uk' } } },
    });
    const text = b?.translations[0]?.headline;
    return { seasonal: b && text ? { text, linkUrl: b.linkUrl } : null };
  });
}
