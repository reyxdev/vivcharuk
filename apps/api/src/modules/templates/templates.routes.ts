import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { requirePermission } from '../../plugins/staffAuth';
import { audit } from '../audit/audit.service';
import { saveTemplateDraft, templateDraft, templateDrafts } from '../products/drafts';

// The readiness rules a template may require (37 §37.4); `photos>=N` is written with its number.
const REQUIRED = z.string().regex(/^(name|price|size|color|composition|description|packedWeight|photos>=[1-9])$/);
const STAGES = ['tanning', 'washing', 'carding', 'spinning', 'weaving', 'felting', 'sewing'] as const; // round 9 §F1

/** Templates (37 §37.2): Іван and Любов edit them (`templates.manage` ⚠); a product never changes template. */
export async function templateRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/templates', { preHandler: requirePermission('products.read') }, async () => {
    const [templates, defs, counts, drafts] = await Promise.all([
      prisma.productTemplate.findMany({ orderBy: { createdAt: 'asc' }, include: { attributes: { orderBy: { sortOrder: 'asc' } } } }),
      prisma.attributeDefinition.findMany({ orderBy: { key: 'asc' }, include: { translations: { where: { locale: 'uk' } } } }),
      prisma.product.groupBy({ by: ['templateId'], where: { deletedAt: null }, _count: true }),
      templateDrafts(),
    ]);
    return {
      stages: STAGES,
      definitions: defs.map((d) => ({ id: d.id, key: d.key, dataType: d.dataType, unit: d.unit, name: d.translations[0]?.name ?? d.key, options: d.options })),
      items: templates.map((t) => ({
        id: t.id, key: t.key, typePrefix: t.typePrefix, axes: t.axes, pricingUnits: t.pricingUnits, requiredFields: t.requiredFields, storyStages: t.storyStages,
        defaultCategoryId: t.defaultCategoryId, isHidden: t.isHidden, sizeCalcOverhangCm: t.sizeCalcOverhangCm,
        attributes: t.attributes.map((a) => ({ id: a.attributeId, isRequired: a.isRequired })),
        products: counts.find((c) => c.templateId === t.id)?._count ?? 0,
        draft: drafts[t.key]!, // round 20: what a new product of this kind starts with
      })),
    };
  });

  app.patch<{ Params: { id: string } }>('/admin/templates/:id', { preHandler: requirePermission('templates.manage') }, async (req, reply) => {
    const b = z.object({
      typePrefix: z.string().trim().max(40).optional(),
      defaultCategoryId: z.string().nullable().optional(),
      requiredFields: z.array(REQUIRED).max(10).optional(),
      storyStages: z.array(z.enum(STAGES)).max(7).optional(),
      isHidden: z.boolean().optional(),
      sizeCalcOverhangCm: z.number().int().min(0).max(100).nullable().optional(),
      attributes: z.array(z.object({ id: z.string(), isRequired: z.boolean() })).max(40).optional(),
      draft: templateDraft.optional(),
    }).parse(req.body);
    const t = await prisma.productTemplate.findUnique({ where: { id: req.params.id } });
    if (!t) throw new AppError(404, 'NOT_FOUND');
    if (b.requiredFields && !b.requiredFields.includes('name')) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'requiredFields', code: 'NAME_REQUIRED' }]);
    await prisma.$transaction(async (tx) => {
      await tx.productTemplate.update({
        where: { id: t.id },
        data: {
          ...(b.typePrefix !== undefined ? { typePrefix: b.typePrefix } : {}), ...(b.defaultCategoryId !== undefined ? { defaultCategoryId: b.defaultCategoryId } : {}),
          ...(b.requiredFields ? { requiredFields: b.requiredFields } : {}), ...(b.storyStages ? { storyStages: b.storyStages } : {}),
          ...(b.isHidden !== undefined ? { isHidden: b.isHidden } : {}), ...(b.sizeCalcOverhangCm !== undefined ? { sizeCalcOverhangCm: b.sizeCalcOverhangCm } : {}),
        },
      });
      if (b.attributes) {
        await tx.productTemplateAttribute.deleteMany({ where: { templateId: t.id } });
        if (b.attributes.length) await tx.productTemplateAttribute.createMany({ data: b.attributes.map((a, i) => ({ templateId: t.id, attributeId: a.id, isRequired: a.isRequired, sortOrder: i })) });
      }
      if (b.draft) await saveTemplateDraft(t.key, b.draft, req.staff!.id);
      await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'template.updated', resourceType: 'ProductTemplate', resourceId: t.id, resourceLabel: t.key, after: b as never }, tx);
    });
    return reply.status(204).send();
  });

  // A new characteristic (e.g. «Наповнювач» values, «Висота ворсу»), shared by any template.
  app.post('/admin/attributes', { preHandler: requirePermission('templates.manage') }, async (req, reply) => {
    const b = z.object({
      name: z.string().trim().min(2).max(60), dataType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'ENUM']), unit: z.string().trim().max(12).nullable().default(null),
      options: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
    }).parse(req.body);
    const { slugify } = await import('@vivcharyk/schemas');
    const key = slugify(b.name).replace(/-/g, '_').slice(0, 40);
    if (!key || (await prisma.attributeDefinition.findUnique({ where: { key } }))) throw new AppError(409, 'VALIDATION_FAILED', 'ALREADY_EXISTS');
    if (b.dataType === 'ENUM' && !b.options?.length) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'options', code: 'REQUIRED' }]);
    const d = await prisma.attributeDefinition.create({
      data: {
        key, dataType: b.dataType, unit: b.unit,
        options: b.dataType === 'ENUM' ? b.options!.map((o) => ({ key: slugify(o) || o, label: { uk: o } })) : undefined,
        translations: { create: { locale: 'uk', name: b.name } },
      },
    });
    await audit({ actorId: req.staff!.id, actorEmail: req.staff!.email, action: 'attribute.created', resourceType: 'AttributeDefinition', resourceId: d.id, resourceLabel: b.name });
    return reply.status(201).send({ id: d.id, key });
  });
}
