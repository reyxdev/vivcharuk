import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { slugify } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';

// Colour families for the catalogue filter (37 §37.3: «білий … багатоколірний»).
export const COLOR_FAMILIES = ['білий', 'натуральний', 'сірий', 'чорний', 'коричневий', 'бежевий', 'червоний', 'зелений', 'синій', 'жовтий', 'багатоколірний'] as const;
const MATERIAL_GROUPS = ['вовна', 'овчина', 'шкіра', 'змішані'] as const;

const dims = z.object({ widthCm: z.number().int().min(1).max(1000).optional(), lengthCm: z.number().int().min(1).max(1000).optional(), insoleCm: z.number().min(5).max(40).optional() }).nullable();
const valueCreate = z.object({
  type: z.enum(['size', 'color', 'pattern']),
  templateKey: z.string().max(40).optional(), // sizes belong to a template (37 §37.3)
  label: z.string().trim().min(1).max(60),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  colorFamily: z.enum(COLOR_FAMILIES).nullable().optional(),
  isNaturalUndyed: z.boolean().optional(),
  dimensions: dims.optional(),
});
const valuePatch = valueCreate.omit({ type: true, templateKey: true }).partial().extend({ isHidden: z.boolean().optional(), move: z.enum(['up', 'down']).optional() });

/**
 * Shared libraries (37 §37.3): one source of truth each. Values in use are hidden, never deleted;
 * a colour edit applies everywhere, so the list carries a «товарів» count for each value.
 */
export async function libraryRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/libraries', { preHandler: requirePermission('products.read') }, async () => {
    const [values, usage, materials, matUsage, templates] = await Promise.all([
      prisma.optionValue.findMany({ orderBy: [{ sortKey: 'asc' }], include: { optionType: true, translations: { where: { locale: 'uk' } } } }),
      prisma.$queryRaw<Array<{ id: string; n: bigint }>>`SELECT vo."optionValueId" AS id, count(DISTINCT v."productId") AS n FROM "VariantOptionValue" vo JOIN "ProductVariant" v ON v.id = vo."variantId" WHERE v."deletedAt" IS NULL GROUP BY 1`,
      prisma.material.findMany({ include: { translations: { where: { locale: 'uk' } } } }),
      prisma.productComposition.groupBy({ by: ['materialId'], _count: { productId: true } }),
      prisma.productTemplate.findMany({ where: { axes: { has: 'size' } }, select: { key: true } }),
    ]);
    const used = new Map(usage.map((u) => [u.id, Number(u.n)]));
    const out = (v: (typeof values)[number]) => ({
      id: v.id, key: v.key, label: v.translations[0]?.label ?? v.key, hex: v.hex, colorFamily: v.colorFamily, isNaturalUndyed: v.isNaturalUndyed,
      dimensions: v.dimensions, isHidden: v.isHidden, sortKey: v.sortKey, products: used.get(v.id) ?? 0,
    });
    const sizes: Record<string, ReturnType<typeof out>[]> = Object.fromEntries(templates.map((t) => [t.key, []]));
    for (const v of values.filter((x) => x.optionType.key === 'size')) {
      const t = templates.find((x) => v.key.startsWith(`${x.key}-`))?.key;
      if (t) sizes[t]!.push(out(v));
    }
    return {
      sizes, colors: values.filter((x) => x.optionType.key === 'color').map(out), patterns: values.filter((x) => x.optionType.key === 'pattern').map(out),
      materials: materials.map((m) => ({ id: m.id, name: m.translations[0]?.name ?? m.id, group: m.group, isHidden: m.isHidden, products: matUsage.find((u) => u.materialId === m.id)?._count.productId ?? 0 })),
      colorFamilies: COLOR_FAMILIES, materialGroups: MATERIAL_GROUPS,
    };
  });

  app.post('/admin/libraries/values', { preHandler: requirePermission('libraries.manage') }, async (req, reply) => {
    const b = valueCreate.parse(req.body);
    const type = await prisma.optionType.findUnique({ where: { key: b.type } });
    if (!type) throw new AppError(404, 'NOT_FOUND');
    if (b.type === 'size' && !b.templateKey) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'templateKey', code: 'REQUIRED' }]);
    const base = b.type === 'size' ? `${b.templateKey}-${slugify(b.label.replace(/\s*(см|cm)\.?\s*$/i, '').replace(/[×x]/g, 'x'))}` : slugify(b.label);
    if (!base || base.endsWith('-')) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'label', code: 'INVALID' }]);
    if (await prisma.optionValue.findUnique({ where: { optionTypeId_key: { optionTypeId: type.id, key: base } } })) throw new AppError(409, 'VALIDATION_FAILED', 'ALREADY_EXISTS');
    const last = await prisma.optionValue.findFirst({ where: { optionTypeId: type.id, ...(b.type === 'size' ? { key: { startsWith: `${b.templateKey}-` } } : {}) }, orderBy: { sortKey: 'desc' }, select: { sortKey: true } });
    const v = await prisma.$transaction(async (tx) => {
      const row = await tx.optionValue.create({
        data: {
          optionTypeId: type.id, key: base, sortKey: (last?.sortKey ?? 0) + 10, position: (last?.sortKey ?? 0) + 10,
          hex: b.hex ?? null, colorFamily: b.colorFamily ?? null, isNaturalUndyed: b.isNaturalUndyed ?? false,
          dimensions: b.dimensions ?? undefined, translations: { create: { locale: 'uk', label: b.label } },
        },
      });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'library.value_created', resourceType: 'OptionValue', resourceId: row.id, resourceLabel: `${b.type}: ${b.label}` }, tx);
      return row;
    });
    return reply.status(201).send({ id: v.id, key: v.key });
  });

  app.patch<{ Params: { id: string } }>('/admin/libraries/values/:id', { preHandler: requirePermission('libraries.manage') }, async (req, reply) => {
    const b = valuePatch.parse(req.body);
    const v = await prisma.optionValue.findUnique({ where: { id: req.params.id }, include: { optionType: true } });
    if (!v) throw new AppError(404, 'NOT_FOUND');
    await prisma.$transaction(async (tx) => {
      if (b.move) {
        // Swap with the neighbour in the same list (sizes: same template prefix).
        const prefix = v.optionType.key === 'size' ? v.key.slice(0, v.key.lastIndexOf('-') + 1) : '';
        const peers = await tx.optionValue.findMany({ where: { optionTypeId: v.optionTypeId, ...(prefix ? { key: { startsWith: prefix } } : {}) }, orderBy: { sortKey: 'asc' } });
        const i = peers.findIndex((p) => p.id === v.id);
        const other = peers[b.move === 'up' ? i - 1 : i + 1];
        if (other) {
          await tx.optionValue.update({ where: { id: v.id }, data: { sortKey: other.sortKey, position: other.sortKey } });
          await tx.optionValue.update({ where: { id: other.id }, data: { sortKey: v.sortKey, position: v.sortKey } });
        }
      }
      await tx.optionValue.update({
        where: { id: v.id },
        data: {
          ...(b.hex !== undefined ? { hex: b.hex } : {}), ...(b.colorFamily !== undefined ? { colorFamily: b.colorFamily } : {}),
          ...(b.isNaturalUndyed !== undefined ? { isNaturalUndyed: b.isNaturalUndyed } : {}), ...(b.isHidden !== undefined ? { isHidden: b.isHidden } : {}),
          ...(b.dimensions !== undefined ? { dimensions: b.dimensions ?? undefined } : {}),
        },
      });
      // The key (and so every URL filter and SKU code) stays; only the displayed name changes.
      if (b.label) await tx.optionValueTranslation.upsert({ where: { optionValueId_locale: { optionValueId: v.id, locale: 'uk' } }, create: { optionValueId: v.id, locale: 'uk', label: b.label }, update: { label: b.label } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'library.value_updated', resourceType: 'OptionValue', resourceId: v.id, resourceLabel: v.key, after: b as never }, tx);
    });
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>('/admin/libraries/values/:id', { preHandler: requirePermission('libraries.manage') }, async (req, reply) => {
    const v = await prisma.optionValue.findUnique({ where: { id: req.params.id } });
    if (!v) throw new AppError(404, 'NOT_FOUND');
    if (await prisma.variantOptionValue.count({ where: { optionValueId: v.id } })) throw new AppError(409, 'VALIDATION_FAILED', 'IN_USE_HIDE_INSTEAD');
    await prisma.$transaction(async (tx) => {
      await tx.optionValue.delete({ where: { id: v.id } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'library.value_deleted', resourceType: 'OptionValue', resourceId: v.id, resourceLabel: v.key }, tx);
    });
    return reply.status(204).send();
  });

  app.post('/admin/libraries/materials', { preHandler: requirePermission('libraries.manage') }, async (req, reply) => {
    const b = z.object({ name: z.string().trim().min(2).max(60), group: z.enum(MATERIAL_GROUPS) }).parse(req.body);
    const m = await prisma.material.create({ data: { group: b.group, translations: { create: { locale: 'uk', name: b.name } } } });
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'library.material_created', resourceType: 'Material', resourceId: m.id, resourceLabel: b.name });
    return reply.status(201).send({ id: m.id });
  });

  app.patch<{ Params: { id: string } }>('/admin/libraries/materials/:id', { preHandler: requirePermission('libraries.manage') }, async (req, reply) => {
    const b = z.object({ name: z.string().trim().min(2).max(60).optional(), group: z.enum(MATERIAL_GROUPS).optional(), isHidden: z.boolean().optional() }).parse(req.body);
    const m = await prisma.material.findUnique({ where: { id: req.params.id } });
    if (!m) throw new AppError(404, 'NOT_FOUND');
    await prisma.$transaction(async (tx) => {
      await tx.material.update({ where: { id: m.id }, data: { ...(b.group ? { group: b.group } : {}), ...(b.isHidden !== undefined ? { isHidden: b.isHidden } : {}) } });
      if (b.name) await tx.materialTranslation.upsert({ where: { materialId_locale: { materialId: m.id, locale: 'uk' } }, create: { materialId: m.id, locale: 'uk', name: b.name }, update: { name: b.name } });
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'library.material_updated', resourceType: 'Material', resourceId: m.id, after: b as never }, tx);
    });
    return reply.status(204).send();
  });
}
