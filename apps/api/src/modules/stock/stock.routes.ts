import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { cancelSale, createSale, kyivBounds, optionLabel, thumbOf, type SaleItem } from './shop-sales.service';

/**
 * The shop till «Магазин» (round 20 #133–137, #217–219, #274–277): sales at the Яворів shop, entered
 * from a phone. Stock is operational, not content, so it changes the live variant at once.
 * No fiscal receipt for now (#135, #175): `receiptRef` keeps room for one.
 */
export async function stockRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  // #133: tiles of items in stock, the popular ones first (sold on the site or in the shop over 90 days); search by name or SKU.
  app.get('/admin/stock/tiles', { preHandler: requirePermission('stock.shop_sale') }, async (req) => {
    const { q } = z.object({ q: z.string().trim().max(80).optional() }).parse(req.query);
    const text = q && q.length >= 2 ? { contains: q, mode: 'insensitive' as const } : null;
    const sellable = { isActive: true, deletedAt: null, stockQty: { gt: 0 } };
    const [rows, pop] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, status: { not: 'ARCHIVED' }, variants: { some: sellable }, ...(text ? { OR: [{ sku: text }, { variants: { some: { sku: text } } }, { translations: { some: { locale: 'uk', name: text } } }] } : {}) },
        take: 400,
        select: {
          id: true, sku: true, translations: { where: { locale: 'uk' }, select: { name: true } },
          media: { take: 1, orderBy: { position: 'asc' }, select: { media: { select: { publicId: true, provider: true } } } },
          variants: { where: sellable, orderBy: { position: 'asc' }, select: { id: true, sku: true, priceMinor: true, stockQty: true, options: { select: { optionValue: { select: { optionType: { select: { position: true } }, translations: { where: { locale: 'uk' }, select: { label: true } } } } } } } },
        },
      }),
      prisma.$queryRaw<Array<{ productId: string; n: bigint }>>`
        SELECT v."productId", sum(-m.delta) AS n FROM "StockMovement" m JOIN "ProductVariant" v ON v.id = m."variantId"
        WHERE m.source IN ('ORDER', 'SHOP_SALE') AND m."createdAt" > now() - interval '90 days' GROUP BY 1`,
    ]);
    const score = new Map(pop.map((r) => [r.productId, Number(r.n)]));
    const name = (p: (typeof rows)[number]) => p.translations[0]?.name ?? p.sku;
    const items = rows
      .sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0) || name(a).localeCompare(name(b), 'uk'))
      .slice(0, text ? 30 : 40)
      .map((p) => ({
        productId: p.id, name: name(p), thumb: thumbOf(p.media[0]?.media),
        variants: p.variants.map((v) => ({ id: v.id, sku: v.sku, priceMinor: v.priceMinor, stockQty: v.stockQty, label: optionLabel(v.options) })),
      }));
    return { items };
  });

  app.post('/admin/stock/shop-sales', { preHandler: requirePermission('stock.shop_sale') }, async (req) => {
    const b = z.object({
      lines: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(500) })).min(1).max(50),
      discount: z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('sum'), value: z.number().int().min(0).max(100_000_000) }),
        z.object({ kind: z.literal('percent'), value: z.number().min(0).max(100) }),
      ]).optional(),
      payment: z.enum(['CASH', 'CARD_TRANSFER']),
      cashGivenMinor: z.number().int().min(0).max(100_000_000).optional(),
      receiptRef: z.string().trim().max(60).optional(),
      note: z.string().trim().max(200).optional(),
    }).parse(req.body);
    return createSale(b, req.staff!);
  });

  // #137, #219: today's sales (Kyiv day) with the totals by payment; cancelled ones stay visible, struck through.
  app.get('/admin/stock/shop-sales', { preHandler: requirePermission('stock.shop_sale') }, async () => {
    const { today } = await kyivBounds();
    const rows = await prisma.shopSale.findMany({ where: { createdAt: { gte: today } }, orderBy: { createdAt: 'desc' } });
    const live = rows.filter((r) => !r.cancelledAt);
    const sum = (p: string) => live.filter((r) => r.payment === p).reduce((s, r) => s + r.totalMinor, 0);
    return {
      totals: { cashMinor: sum('CASH'), transferMinor: sum('CARD_TRANSFER'), count: live.length },
      items: rows.map((r) => ({
        id: r.id, at: r.createdAt.toISOString(), payment: r.payment, totalMinor: r.totalMinor, discountMinor: r.discountMinor,
        cancelled: !!r.cancelledAt, receiptRef: r.receiptRef,
        lines: (r.items as unknown as SaleItem[]).map((i) => ({ name: i.name, options: i.options, quantity: i.quantity })),
      })),
    };
  });

  app.post<{ Params: { id: string } }>('/admin/stock/shop-sales/:id/cancel', { preHandler: requirePermission('stock.shop_sale') }, async (req, reply) => {
    await cancelSale(req.params.id, req.staff!);
    return reply.status(204).send();
  });

  // Price tags (#92–94, #176–177): one tag per size/colour, with the product's composition and slug for the QR.
  app.get('/admin/stock/tags', { preHandler: requirePermission('products.read') }, async (req) => {
    const { ids } = z.object({ ids: z.string().max(5000) }).parse(req.query);
    const list = ids.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 200);
    const rows = await prisma.product.findMany({
      where: { id: { in: list }, deletedAt: null },
      select: {
        id: true, sku: true, pricingUnit: true,
        translations: { where: { locale: 'uk' }, select: { name: true, slug: true } },
        composition: { orderBy: [{ role: 'asc' }, { percent: 'desc' }], select: { role: true, percent: true, material: { select: { translations: { where: { locale: 'uk' }, select: { name: true } } } } } },
        variants: {
          where: { isActive: true, deletedAt: null }, orderBy: { position: 'asc' },
          select: { sku: true, priceMinor: true, options: { select: { optionValue: { select: { optionType: { select: { key: true, position: true } }, translations: { where: { locale: 'uk' }, select: { label: true } } } } } } },
        },
      },
    });
    const ROLE: Record<string, string> = { warp: 'основа', weft: 'уток', filling: 'наповнення' };
    const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
    const items = list.map((id) => rows.find((r) => r.id === id)).filter((p) => !!p).flatMap((p) => {
      const roles = [...new Set(p.composition.map((c) => c.role))];
      const composition = roles.map((role) => {
        const parts = p.composition.filter((c) => c.role === role).map((c) => `${c.percent} % ${lower(c.material.translations[0]?.name ?? '')}`.trim()).join(', ');
        return roles.length > 1 || role !== 'main' ? `${ROLE[role] ?? role}: ${parts}` : parts;
      }).join('; ');
      const label = (v: (typeof p.variants)[number], key: string) => v.options.filter((o) => o.optionValue.optionType.key === key).map((o) => o.optionValue.translations[0]?.label).filter(Boolean).join(', ');
      return p.variants.map((v) => ({
        productId: p.id, name: p.translations[0]?.name ?? p.sku, slug: p.translations[0]?.slug ?? null, sku: v.sku, unit: p.pricingUnit,
        priceMinor: v.priceMinor, size: label(v, 'size'), color: label(v, 'color'), composition,
      }));
    });
    return { items };
  });
}
