import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { locale, slugify } from '@vivcharyk/schemas';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';

const FEATURED_MAX = 6; // {{FEATURED_CATEGORY_MAX}} default (23 §23.7)
const MAX_DEPTH = 3;

async function depthOf(id: string | null): Promise<number> {
  let d = 0;
  for (let cur = id; cur; d++) cur = (await prisma.category.findUnique({ where: { id: cur }, select: { parentId: true } }))?.parentId ?? null;
  return d;
}

async function uniqueSlug(base: string, exceptCategoryId?: string) {
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${base}-${i + 1}` : base;
    const clash = await prisma.categoryTranslation.findFirst({ where: { locale: 'uk', slug, ...(exceptCategoryId ? { categoryId: { not: exceptCategoryId } } : {}) } });
    if (!clash) return slug;
  }
  throw new AppError(409, 'VALIDATION_FAILED', 'SLUG_TAKEN');
}

/** Categories module (23 §23.7): the tree, order, «★ на головній», SEO text and slugs with redirects. */
export async function adminCategoryRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/categories', { preHandler: requirePermission('categories.read') }, async () => {
    const [rows, counts] = await Promise.all([
      prisma.category.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { translations: { where: { locale: 'uk' } } } }),
      prisma.productCategory.findMany({ where: { product: { deletedAt: null } }, select: { categoryId: true, productId: true } }),
    ]);
    // Distinct products in the category and all its descendants (a product may sit in both).
    const kids = new Map<string | null, string[]>();
    for (const c of rows) kids.set(c.parentId, [...(kids.get(c.parentId) ?? []), c.id]);
    const direct = new Map<string, Set<string>>();
    for (const l of counts) direct.set(l.categoryId, (direct.get(l.categoryId) ?? new Set()).add(l.productId));
    const all = (id: string): Set<string> => new Set([...(direct.get(id) ?? []), ...(kids.get(id) ?? []).flatMap((k) => [...all(k)])]);
    return {
      featuredMax: FEATURED_MAX,
      items: rows.map((c) => {
        const t = c.translations[0];
        return {
          id: c.id, key: c.key, parentId: c.parentId, sortOrder: c.sortOrder, isActive: c.isActive, isFeatured: c.isFeatured, hiddenLocales: c.hiddenLocales,
          name: t?.name ?? c.key ?? c.id, slug: t?.slug ?? '', description: t?.description ?? null, metaTitle: t?.metaTitle ?? null, metaDescription: t?.metaDescription ?? null,
          defaultCustomSizeRatePerSqmMinor: c.defaultCustomSizeRatePerSqmMinor, products: all(c.id).size, directProducts: direct.get(c.id)?.size ?? 0,
        };
      }),
    };
  });

  app.post('/admin/categories', { preHandler: requirePermission('categories.create') }, async (req, reply) => {
    const b = z.object({ name: z.string().trim().min(2).max(80), parentId: z.string().nullable().default(null) }).parse(req.body);
    if (b.parentId && (await depthOf(b.parentId)) >= MAX_DEPTH - 1) throw new AppError(422, 'VALIDATION_FAILED', 'MAX_DEPTH');
    const slug = await uniqueSlug(slugify(b.name));
    const last = await prisma.category.findFirst({ where: { parentId: b.parentId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
    const c = await prisma.$transaction(async (tx) => {
      // New categories start hidden so an empty one never reaches the menu by accident.
      const row = await tx.category.create({ data: { parentId: b.parentId, sortOrder: (last?.sortOrder ?? 0) + 1, isActive: false, translations: { create: { locale: 'uk', name: b.name, slug } } } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'category.created', resourceType: 'Category', resourceId: row.id, resourceLabel: b.name }, tx);
      return row;
    });
    return reply.status(201).send({ id: c.id, slug });
  });

  app.patch<{ Params: { id: string } }>('/admin/categories/:id', { preHandler: requirePermission('categories.update') }, async (req, reply) => {
    const b = z.object({
      name: z.string().trim().min(2).max(80).optional(),
      slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80).optional(),
      description: z.string().max(5000).nullable().optional(),
      metaTitle: z.string().max(160).nullable().optional(),
      metaDescription: z.string().max(320).nullable().optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      hiddenLocales: z.array(locale.exclude(['uk'])).max(3).optional(),
      defaultCustomSizeRatePerSqmMinor: z.number().int().min(0).nullable().optional(),
    }).parse(req.body);
    const c = await prisma.category.findUnique({ where: { id: req.params.id }, include: { translations: { where: { locale: 'uk' } } } });
    if (!c) throw new AppError(404, 'NOT_FOUND');
    // The rate follows the money, not the table (23 §23.7).
    if (b.defaultCustomSizeRatePerSqmMinor !== undefined && !req.staff!.permissions.has('products.manage_price')) throw forbidden();
    if (b.isFeatured !== undefined && !req.staff!.permissions.has('categories.feature')) throw forbidden();
    if (b.isFeatured && !c.isFeatured && (await prisma.category.count({ where: { isFeatured: true } })) >= FEATURED_MAX) throw new AppError(422, 'VALIDATION_FAILED', 'FEATURED_MAX', { max: FEATURED_MAX });
    const t = c.translations[0];
    const newSlug = b.slug && b.slug !== t?.slug ? await uniqueSlug(b.slug, c.id) : undefined;
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id: c.id },
        data: {
          ...(b.isActive !== undefined ? { isActive: b.isActive } : {}), ...(b.isFeatured !== undefined ? { isFeatured: b.isFeatured } : {}),
          ...(b.hiddenLocales ? { hiddenLocales: b.hiddenLocales } : {}),
          ...(b.defaultCustomSizeRatePerSqmMinor !== undefined ? { defaultCustomSizeRatePerSqmMinor: b.defaultCustomSizeRatePerSqmMinor } : {}),
        },
      });
      if (t && (b.name || newSlug || b.description !== undefined || b.metaTitle !== undefined || b.metaDescription !== undefined)) {
        await tx.categoryTranslation.update({
          where: { id: t.id },
          data: { ...(b.name ? { name: b.name } : {}), ...(newSlug ? { slug: newSlug } : {}), ...(b.description !== undefined ? { description: b.description } : {}), ...(b.metaTitle !== undefined ? { metaTitle: b.metaTitle } : {}), ...(b.metaDescription !== undefined ? { metaDescription: b.metaDescription } : {}) },
        });
      }
      // A changed live slug leaves a 301 so inbound links survive (23 §23.7, 25 §25.9).
      if (newSlug && t) {
        const parent = c.parentId ? await tx.categoryTranslation.findFirst({ where: { categoryId: c.parentId, locale: 'uk' }, select: { slug: true } }) : null;
        const prefix = parent ? `/uk/${parent.slug}` : '/uk';
        await tx.redirect.upsert({ where: { fromPath: `${prefix}/${t.slug}` }, create: { fromPath: `${prefix}/${t.slug}`, toPath: `${prefix}/${newSlug}` }, update: { toPath: `${prefix}/${newSlug}` } });
      }
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'category.updated', resourceType: 'Category', resourceId: c.id, resourceLabel: t?.name ?? c.id, after: b as never }, tx);
    });
    return reply.status(204).send();
  });

  // The whole sibling set in one request, so a partial failure can never leave a half-ordered menu.
  app.post('/admin/categories/reorder', { preHandler: requirePermission('categories.reorder') }, async (req, reply) => {
    const b = z.object({ parentId: z.string().nullable(), orderedIds: z.array(z.string()).min(1).max(100) }).parse(req.body);
    const siblings = await prisma.category.findMany({ where: { parentId: b.parentId, deletedAt: null }, select: { id: true } });
    if (siblings.length !== b.orderedIds.length || !siblings.every((s) => b.orderedIds.includes(s.id))) throw new AppError(409, 'VALIDATION_FAILED', 'SIBLINGS_CHANGED');
    await prisma.$transaction(async (tx) => {
      for (const [i, id] of b.orderedIds.entries()) await tx.category.update({ where: { id }, data: { sortOrder: i + 1 } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'category.reordered', resourceType: 'Category', resourceId: b.parentId ?? 'root' }, tx);
    });
    return reply.status(204).send();
  });

  // Deletion is blocked while products or subcategories are attached (23 §23.7).
  app.delete<{ Params: { id: string } }>('/admin/categories/:id', { preHandler: requirePermission('categories.delete') }, async (req, reply) => {
    const c = await prisma.category.findUnique({ where: { id: req.params.id }, include: { _count: { select: { products: true, children: true } }, translations: { where: { locale: 'uk' }, select: { name: true } } } });
    if (!c) throw new AppError(404, 'NOT_FOUND');
    if (c._count.products || c._count.children) throw new AppError(409, 'VALIDATION_FAILED', 'CATEGORY_NOT_EMPTY', { products: c._count.products, children: c._count.children });
    await prisma.$transaction(async (tx) => {
      await tx.category.update({ where: { id: c.id }, data: { deletedAt: new Date(), isActive: false, isFeatured: false } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'category.deleted', resourceType: 'Category', resourceId: c.id, resourceLabel: c.translations[0]?.name ?? null }, tx);
    });
    return reply.status(204).send();
  });
}
