import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { ProductDoc } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';

/** Collections (round 12 T9): products join by a tick in their editor; the order is set here. */
export async function adminCollectionRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/collections', { preHandler: requirePermission('categories.read') }, async () => {
    const rows = await prisma.collection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale: 'uk' } },
        products: { orderBy: { sortOrder: 'asc' }, include: { product: { select: { id: true, sku: true, status: true, priceMinMinor: true, priceMaxMinor: true, translations: { where: { locale: 'uk' }, select: { name: true } } } } } },
      },
    });
    return {
      items: rows.map((c) => ({
        id: c.id, key: c.key, isActive: c.isActive, name: c.translations[0]?.name ?? c.key, slug: c.translations[0]?.slug ?? '', description: c.translations[0]?.description ?? null,
        metaTitle: c.translations[0]?.metaTitle ?? null, metaDescription: c.translations[0]?.metaDescription ?? null,
        products: c.products.map((x) => ({ id: x.product.id, sku: x.product.sku, status: x.product.status, name: x.product.translations[0]?.name ?? x.product.sku, priceMinMinor: x.product.priceMinMinor, priceMaxMinor: x.product.priceMaxMinor })),
      })),
    };
  });

  app.patch<{ Params: { id: string } }>('/admin/collections/:id', { preHandler: requirePermission('categories.update') }, async (req, reply) => {
    const b = z.object({
      name: z.string().trim().min(2).max(80).optional(), description: z.string().max(5000).nullable().optional(),
      metaTitle: z.string().max(160).nullable().optional(), metaDescription: z.string().max(320).nullable().optional(), isActive: z.boolean().optional(),
    }).parse(req.body);
    const c = await prisma.collection.findUnique({ where: { id: req.params.id }, include: { translations: { where: { locale: 'uk' } } } });
    if (!c) throw new AppError(404, 'NOT_FOUND');
    await prisma.$transaction(async (tx) => {
      if (b.isActive !== undefined) await tx.collection.update({ where: { id: c.id }, data: { isActive: b.isActive } });
      const t = c.translations[0];
      if (t) await tx.collectionTranslation.update({ where: { id: t.id }, data: { ...(b.name ? { name: b.name } : {}), ...(b.description !== undefined ? { description: b.description } : {}), ...(b.metaTitle !== undefined ? { metaTitle: b.metaTitle } : {}), ...(b.metaDescription !== undefined ? { metaDescription: b.metaDescription } : {}) } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'collection.updated', resourceType: 'Collection', resourceId: c.id, resourceLabel: t?.name ?? c.key, after: b as never }, tx);
    });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/collections/:id/order', { preHandler: requirePermission('categories.update') }, async (req, reply) => {
    const { productIds } = z.object({ productIds: z.array(z.string()).max(500) }).parse(req.body);
    const members = await prisma.collectionProduct.findMany({ where: { collectionId: req.params.id }, select: { productId: true } });
    if (members.length !== productIds.length || !members.every((m) => productIds.includes(m.productId))) throw new AppError(409, 'VALIDATION_FAILED', 'SELECTION_CHANGED');
    await prisma.$transaction(async (tx) => {
      for (const [i, productId] of productIds.entries()) await tx.collectionProduct.update({ where: { collectionId_productId: { collectionId: req.params.id, productId } }, data: { sortOrder: i + 1 } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'collection.reordered', resourceType: 'Collection', resourceId: req.params.id }, tx);
    });
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string; productId: string } }>('/admin/collections/:id/products/:productId', { preHandler: requirePermission('categories.update') }, async (req, reply) => {
    await prisma.$transaction(async (tx) => {
      await tx.collectionProduct.delete({ where: { collectionId_productId: { collectionId: req.params.id, productId: req.params.productId } } }).catch(() => { throw new AppError(404, 'NOT_FOUND'); });
      // Keep an open draft in step, or its next publish would add the product back.
      const p = await tx.product.findUnique({ where: { id: req.params.productId }, select: { draftDocument: true } });
      const d = p?.draftDocument as unknown as ProductDoc | null;
      if (d?.collectionIds?.includes(req.params.id)) await tx.product.update({ where: { id: req.params.productId }, data: { draftDocument: { ...d, collectionIds: d.collectionIds.filter((x) => x !== req.params.id) } as unknown as Prisma.InputJsonValue } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'collection.product_removed', resourceType: 'Collection', resourceId: req.params.id, after: { productId: req.params.productId } }, tx);
    });
    return reply.status(204).send();
  });
}
