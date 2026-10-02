import { describe, expect, it } from 'vitest';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import { deleteCategory, replaceCategory } from '../../src/modules/categories/categories.service';

// Round 22 K25: deleting a category with products moves them; everything runs in a rolled-back transaction.
const ROLLBACK = new Error('rollback');
async function inRollback(fn: (tx: Prisma.TransactionClient) => Promise<void>) {
  await expect(prisma.$transaction(async (tx) => { await fn(tx); throw ROLLBACK; }, { timeout: 30_000 })).rejects.toBe(ROLLBACK);
}
const cat = (tx: Prisma.TransactionClient, name: string, parentId: string | null = null) =>
  tx.category.create({ data: { parentId, isActive: false, translations: { create: { locale: 'uk', name, slug: `test-${name}-${Date.now()}` } } }, select: { id: true } });
const linksOf = async (tx: Prisma.TransactionClient, productId: string) =>
  (await tx.productCategory.findMany({ where: { productId }, orderBy: { sortOrder: 'asc' }, select: { categoryId: true } })).map((l) => l.categoryId);

describe('replaceCategory', () => {
  it('puts the target in the old place', () => expect(replaceCategory(['a', 'b'], 'a', 't')).toEqual(['t', 'b']));
  it('keeps a later place', () => expect(replaceCategory(['b', 'a'], 'a', 't')).toEqual(['b', 't']));
  it('drops the old one when the target is there, the target taking the main place', () => expect(replaceCategory(['a', 'b', 't'], 'a', 't')).toEqual(['t', 'b']));
  it('keeps an earlier target where it is', () => expect(replaceCategory(['t', 'b', 'a'], 'a', 't')).toEqual(['t', 'b']));
  it('leaves other lists alone', () => expect(replaceCategory(['b'], 'a', 't')).toEqual(['b']));
});

describe('deleteCategory', async () => {
  const product = await prisma.product.findFirst({ where: { deletedAt: null }, select: { id: true } });

  it('has a product to move', () => expect(product).toBeTruthy());

  it('refuses without a target while products use it, and moves them with one', () => inRollback(async (tx) => {
    const pid = product!.id;
    const group = await cat(tx, 'group');
    const from = await cat(tx, 'from', group.id);
    const to = await cat(tx, 'to', group.id);
    const before = await linksOf(tx, pid);
    await tx.productCategory.create({ data: { productId: pid, categoryId: from.id, sortOrder: -1 } }); // main

    await expect(deleteCategory(tx, from.id, null)).rejects.toMatchObject({ status: 409, message: 'CATEGORY_NOT_EMPTY' });
    await expect(deleteCategory(tx, from.id, group.id)).rejects.toMatchObject({ status: 422, message: 'MOVE_TARGET' });
    await expect(deleteCategory(tx, group.id, to.id)).rejects.toMatchObject({ status: 409, message: 'CATEGORY_HAS_CHILDREN' });

    expect(await deleteCategory(tx, from.id, to.id)).toEqual({ moved: 1 });
    expect(await linksOf(tx, pid)).toEqual([to.id, ...before]);
    expect((await tx.category.findUnique({ where: { id: from.id } }))?.deletedAt).toBeTruthy();
  }));

  it('drops the old link when the product already has the target, which becomes main', () => inRollback(async (tx) => {
    const pid = product!.id;
    const from = await cat(tx, 'from');
    const to = await cat(tx, 'to');
    const before = await linksOf(tx, pid);
    await tx.productCategory.createMany({ data: [{ productId: pid, categoryId: from.id, sortOrder: -1 }, { productId: pid, categoryId: to.id, sortOrder: 99 }] });
    await deleteCategory(tx, from.id, to.id);
    expect(await linksOf(tx, pid)).toEqual([to.id, ...before]);
  }));

  it('rewrites drafts that name the category', () => inRollback(async (tx) => {
    const pid = product!.id;
    const from = await cat(tx, 'from');
    const to = await cat(tx, 'to');
    const other = await cat(tx, 'other');
    await tx.product.update({ where: { id: pid }, data: { draftDocument: { categoryIds: [other.id, from.id] } } });
    await deleteCategory(tx, from.id, to.id);
    const p = await tx.product.findUnique({ where: { id: pid }, select: { draftDocument: true } });
    expect((p?.draftDocument as { categoryIds: string[] }).categoryIds).toEqual([other.id, to.id]);
  }));
});
