import type { Prisma } from '@prisma/client';
import type { ProductDoc } from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

type Db = Prisma.TransactionClient;

/**
 * The categories of every live product as the products list counts them: a never-published product
 * by its draft (the draft is the product), the rest by their links. First id = the main category.
 */
export async function productCategories(db: Db = prisma) {
  const rows = await db.product.findMany({
    where: { deletedAt: null },
    select: { id: true, publishedAt: true, draftDocument: true, categories: { orderBy: { sortOrder: 'asc' }, select: { categoryId: true } } },
  });
  return rows.map((p) => {
    const draft = p.draftDocument as Pick<ProductDoc, 'categoryIds'> | null;
    return { productId: p.id, categoryIds: !p.publishedAt && draft ? draft.categoryIds ?? [] : p.categories.map((c) => c.categoryId) };
  });
}

/**
 * `from` replaced by `to` in an ordered category list (first = main). When the list already holds `to`,
 * `from` is dropped and `to` takes the earlier of the two places, so a deleted main category hands
 * the main place to the target (round 22 K25).
 */
export function replaceCategory(ids: string[], from: string, to: string): string[] {
  const i = ids.indexOf(from);
  if (i < 0) return ids;
  const j = ids.indexOf(to);
  const out = ids.filter((x) => x !== from && x !== to);
  out.splice(j >= 0 ? Math.min(i, j) : i, 0, to);
  return out;
}

/** Live products that use the category, by link or by draft. */
async function usersOf(db: Db, id: string) {
  const [links, drafts] = await Promise.all([
    db.productCategory.findMany({ where: { categoryId: id, product: { deletedAt: null } }, select: { productId: true } }),
    db.product.findMany({ where: { deletedAt: null, draftDocument: { path: ['categoryIds'], array_contains: [id] } }, select: { id: true } }),
  ]);
  return new Set([...links.map((l) => l.productId), ...drafts.map((d) => d.id)]);
}

/**
 * Soft-deletes a category (23 §23.7). Subcategories block it. Products block it unless `moveTo` names
 * a subcategory or a group without subcategories: their links, their drafts and the product types
 * that default to it move there (round 22 K25). Returns how many products moved.
 */
export async function deleteCategory(db: Db, id: string, moveTo: string | null) {
  const c = await db.category.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!c) throw new AppError(404, 'NOT_FOUND');
  const children = await db.category.count({ where: { parentId: id, deletedAt: null } });
  if (children) throw new AppError(409, 'VALIDATION_FAILED', 'CATEGORY_HAS_CHILDREN', { children });
  const users = await usersOf(db, id);
  if (users.size && !moveTo) throw new AppError(409, 'VALIDATION_FAILED', 'CATEGORY_NOT_EMPTY', { products: users.size });

  if (moveTo) {
    const target = await db.category.findFirst({ where: { id: moveTo, deletedAt: null }, select: { id: true, _count: { select: { children: { where: { deletedAt: null } } } } } });
    if (!target || target.id === id || target._count.children) throw new AppError(422, 'VALIDATION_FAILED', 'MOVE_TARGET');

    // Links, deleted products included, so a restored product never points at a deleted category.
    const linked = await db.productCategory.findMany({ where: { categoryId: id }, select: { productId: true } });
    for (const { productId } of linked) {
      const ids = (await db.productCategory.findMany({ where: { productId }, orderBy: { sortOrder: 'asc' }, select: { categoryId: true } })).map((l) => l.categoryId);
      await db.productCategory.deleteMany({ where: { productId } });
      await db.productCategory.createMany({ data: replaceCategory(ids, id, moveTo).map((categoryId, sortOrder) => ({ productId, categoryId, sortOrder })) });
    }
    const drafts = await db.product.findMany({ where: { draftDocument: { path: ['categoryIds'], array_contains: [id] } }, select: { id: true, draftDocument: true } });
    for (const p of drafts) {
      const doc = p.draftDocument as unknown as ProductDoc;
      await db.product.update({ where: { id: p.id }, data: { draftDocument: { ...doc, categoryIds: replaceCategory(doc.categoryIds, id, moveTo) } as unknown as Prisma.InputJsonValue } });
    }
  }
  await db.productTemplate.updateMany({ where: { defaultCategoryId: id }, data: { defaultCategoryId: moveTo } });
  await db.category.update({ where: { id }, data: { deletedAt: new Date(), isActive: false, isFeatured: false } });
  return { moved: users.size };
}
