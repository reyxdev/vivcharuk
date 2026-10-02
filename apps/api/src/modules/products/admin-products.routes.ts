import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requirePermission } from '../../plugins/staffAuth';
import * as svc from './admin-products.service';
import { bulkRequest, revertBulk, runBulk } from './bulk';
import * as excel from './excel';
import * as media from './media';

const origin = z.enum(['OWN_MANUFACTURE', 'PARTNER_MANUFACTURE']);

export async function adminProductRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });

  app.get('/admin/product-templates', { preHandler: requirePermission('products.read') }, async () => ({ items: await svc.templates() }));
  app.get('/admin/product-libraries', { preHandler: requirePermission('products.read') }, async () => svc.libraries());

  // Round 20 #119–121: tab, search, filters (comma lists, price in ₴, toggles as 1), sort, page.
  const list = (s?: string) => (s ? s.split(',').filter(Boolean).slice(0, 50) : undefined);
  app.get('/admin/products', { preHandler: requirePermission('products.read') }, async (req) => {
    const q = z.object({
      tab: z.enum(svc.LIST_TABS).default('all'),
      q: z.string().max(80).optional(),
      sort: z.enum(svc.LIST_SORTS).default('updated'),
      dir: z.enum(['asc', 'desc']).default('desc'),
      page: z.coerce.number().int().min(1).max(500).default(1),
      perPage: z.coerce.number().int().min(1).max(100).default(40),
      category: z.string().max(2000).optional(), collection: z.string().max(2000).optional(),
      color: z.string().max(2000).optional(), material: z.string().max(2000).optional(),
      price_from: z.coerce.number().int().min(0).optional(), price_to: z.coerce.number().int().min(0).optional(),
      custom: z.literal('1').optional(), nophoto: z.literal('1').optional(), origin: z.enum(['own', 'partner']).optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(), // older callers (promotions picker)
    }).parse(req.query);
    const legacy = { DRAFT: 'draft', ACTIVE: 'active', ARCHIVED: 'hidden' } as const;
    return svc.listProducts({
      tab: q.status ? legacy[q.status] : q.tab, q: q.q, sort: q.sort, dir: q.dir, page: q.page, perPage: q.perPage,
      category: list(q.category), collection: list(q.collection), color: list(q.color), material: list(q.material),
      priceFrom: q.price_from, priceTo: q.price_to, custom: !!q.custom, nophoto: !!q.nophoto, origin: q.origin,
    });
  });

  app.post('/admin/products', { preHandler: requirePermission('products.create') }, async (req, reply) => {
    const b = z.object({ templateKey: z.string().max(40), name: z.string().trim().min(2).max(160), categoryId: z.string().optional(), origin: origin.default('OWN_MANUFACTURE') }).parse(req.body);
    return reply.status(201).send(await svc.createProduct(b, req.staff!));
  });

  app.get<{ Params: { id: string } }>('/admin/products/:id', { preHandler: requirePermission('products.read') }, async (req) => svc.getProduct(req.params.id));

  app.put<{ Params: { id: string } }>('/admin/products/:id/draft', { preHandler: requirePermission('products.update') }, async (req) => svc.saveDraft(req.params.id, req.body, req.staff!));

  app.delete<{ Params: { id: string } }>('/admin/products/:id/draft', { preHandler: requirePermission('products.update') }, async (req, reply) => {
    await svc.discardDraft(req.params.id, req.staff!);
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/products/:id/publish', { preHandler: requirePermission('products.publish') }, async (req) => svc.publish(req.params.id, req.staff!));

  app.post<{ Params: { id: string; revisionId: string } }>('/admin/products/:id/revisions/:revisionId/revert', { preHandler: requirePermission('products.update') }, async (req, reply) => {
    await svc.revertTo(req.params.id, req.params.revisionId, req.staff!);
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/products/:id/archive', { preHandler: requirePermission('products.archive') }, async (req, reply) => {
    const { archived } = z.object({ archived: z.boolean() }).parse(req.body);
    await svc.setArchived(req.params.id, archived, req.staff!);
    return reply.status(204).send();
  });

  // Round 20: price and stock right in the list (#122), «Створити схожий» (#130), delete (#123), SKU (#157).
  app.patch<{ Params: { id: string } }>('/admin/products/:id/quick', { preHandler: requirePermission('products.update') }, async (req) => {
    const b = z.object({
      variantId: z.string().max(40).optional(), index: z.number().int().min(0).max(199).optional(),
      priceMinor: z.number().int().min(100).max(100_000_000).optional(), stockQty: z.number().int().min(0).max(100_000).optional(),
    }).refine((x) => x.priceMinor !== undefined || x.stockQty !== undefined).parse(req.body);
    return svc.quickEdit(req.params.id, b, req.staff!);
  });
  app.post<{ Params: { id: string } }>('/admin/products/:id/duplicate', { preHandler: requirePermission('products.create') }, async (req, reply) => reply.status(201).send(await svc.duplicate(req.params.id, req.staff!)));
  app.delete<{ Params: { id: string } }>('/admin/products/:id', { preHandler: requirePermission('products.delete') }, async (req, reply) => {
    await svc.deleteProduct(req.params.id, req.staff!);
    return reply.status(204).send();
  });
  app.patch<{ Params: { id: string } }>('/admin/products/:id/sku', { preHandler: requirePermission('products.update') }, async (req) =>
    svc.changeSku(req.params.id, z.object({ sku: z.string().max(60) }).parse(req.body).sku, req.staff!));

  // Photos (round 20 #128, #271–272): three widths compressed in the browser, stored as local files.
  app.post<{ Params: { id: string } }>('/admin/products/:id/photos', { preHandler: requirePermission('products.manage_media'), bodyLimit: 25_000_000 }, async (req) =>
    media.uploadPhoto(req.params.id, media.uploadBody.parse(req.body), req.staff!));
  app.put<{ Params: { id: string } }>('/admin/products/:id/photos/order', { preHandler: requirePermission('products.manage_media') }, async (req) =>
    media.orderPhotos(req.params.id, z.object({ ids: z.array(z.string().max(40)).max(100) }).parse(req.body).ids, req.staff!));
  app.delete<{ Params: { id: string; mediaId: string } }>('/admin/products/:id/photos/:mediaId', { preHandler: requirePermission('products.manage_media') }, async (req) =>
    media.removePhoto(req.params.id, req.params.mediaId, req.staff!));

  app.post('/admin/products/bulk', { preHandler: requirePermission('products.bulk_edit') }, async (req) => runBulk(bulkRequest.parse(req.body), req.staff!));
  app.post('/admin/products/bulk/revert', { preHandler: requirePermission('products.bulk_edit') }, async (req) => revertBulk(z.object({ auditBatchId: z.string().uuid() }).parse(req.body).auditBatchId, req.staff!));

  // Excel (37 §37.8, round 12 G8): export mirrors import; import is dry run, then «Підтвердити».
  app.get('/admin/products/export.xlsx', { preHandler: requirePermission('products.export') }, async (req, reply) => {
    const { templateId } = z.object({ templateId: z.string().max(40).optional() }).parse(req.query);
    const file = await excel.exportXlsx(templateId);
    const date = new Date().toISOString().slice(0, 10);
    return reply
      .header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('content-disposition', `attachment; filename="vivcharyk-tovary-${date}.xlsx"`)
      .send(file);
  });
  const upload = z.object({ file: z.string().min(1).max(16_000_000) });
  const buf = (b64: string) => Buffer.from(b64, 'base64');
  app.post('/admin/products/import/dry-run', { preHandler: requirePermission('products.import'), bodyLimit: 16_500_000 }, async (req) => excel.dryRun(buf(upload.parse(req.body).file), req.staff!));
  app.post('/admin/products/import/commit', { preHandler: requirePermission('products.import'), bodyLimit: 16_500_000 }, async (req) => {
    const b = upload.extend({ hash: z.string().length(64), confirmWarnings: z.boolean().default(false) }).parse(req.body);
    return excel.commit(buf(b.file), b.hash, b.confirmWarnings, req.staff!);
  });
}
