import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { productDoc, type ProductDoc } from '@vivcharyk/schemas';
import { prisma } from '../../src/lib/prisma';
import { revertBulk, runBulk } from '../../src/modules/products/bulk';

// Round 22 K44: bulk «Змінити категорію» — a new main category keeps up to two additional ones; an
// additional one is added up to three in all; only a subcategory or a childless group. Against the
// development database; everything created here is removed.
const tag = `bk${Date.now()}`;
const cat: Record<string, string> = {};
const prod: Record<string, string> = {};
let actor: { id: string; email: string; permissions: Set<string> };

const live = async (id: string) => (await prisma.productCategory.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } })).map((c) => c.categoryId);
const draftCats = async (id: string) => ((await prisma.product.findUniqueOrThrow({ where: { id } })).draftDocument as unknown as ProductDoc | null)?.categoryIds;
const run = (ids: string[], categoryId: string, mode: 'main' | 'additional', a = actor) =>
  runBulk({ ids, operation: { op: 'set_category', categoryId, mode }, expectedCount: ids.length, dryRun: false }, a);

async function product(key: string, categories: string[], published: boolean) {
  const t = await prisma.productTemplate.findFirstOrThrow();
  const doc = productDoc.parse({ name: `Тест ${key}`, description: '', categoryIds: categories, origin: 'OWN_MANUFACTURE', pricingUnit: 'PIECE', isHandmade: true, variants: [] });
  const p = await prisma.product.create({
    data: {
      sku: `T-${tag}-${key}`, status: published ? 'ACTIVE' : 'DRAFT', publishedAt: published ? new Date() : null, pricingUnit: 'PIECE', origin: 'OWN_MANUFACTURE',
      priceMinMinor: 0, priceMaxMinor: 0, templateId: t.id, isHandmade: true, productionStage: [], searchSynonyms: [], pinnedRelatedIds: [], storyStagesOff: [],
      draftDocument: published ? undefined : (doc as never),
      categories: published ? { create: categories.map((categoryId, sortOrder) => ({ categoryId, sortOrder })) } : undefined,
    },
  });
  prod[key] = p.id;
}

beforeAll(async () => {
  const owner = await prisma.staffUser.findFirstOrThrow({ where: { email: 'gif19601@gmail.com' } });
  actor = { id: owner.id, email: owner.email, permissions: new Set(['products.bulk_edit', 'products.update']) };
  cat.group = (await prisma.category.create({ data: { key: `${tag}-g` } })).id;
  for (const k of ['a', 'b', 'c', 'd']) cat[k] = (await prisma.category.create({ data: { key: `${tag}-${k}`, parentId: cat.group } })).id;
  await product('one', [cat.a!], true);
  await product('three', [cat.a!, cat.b!, cat.c!], true);
  await product('draft', [cat.a!], false);
});

afterAll(async () => {
  await prisma.productCategory.deleteMany({ where: { productId: { in: Object.values(prod) } } });
  await prisma.product.deleteMany({ where: { id: { in: Object.values(prod) } } });
  await prisma.category.deleteMany({ where: { parentId: cat.group } });
  await prisma.category.deleteMany({ where: { id: cat.group } });
});

describe('bulk «Змінити категорію»', () => {
  it('main: replaces the main category and keeps the additional ones; a never-published draft changes its document', async () => {
    const r = await run([prod.three!, prod.draft!], cat.d!, 'main');
    expect(r.affected).toBe(2);
    expect(await live(prod.three!)).toEqual([cat.d, cat.b, cat.c]);
    expect(await draftCats(prod.draft!)).toEqual([cat.d]);
  });

  it('main: an additional category moved to the front is not repeated', async () => {
    const r = await run([prod.three!], cat.c!, 'main');
    expect(r.affected).toBe(1);
    expect(await live(prod.three!)).toEqual([cat.c, cat.b]);
  });

  it('additional: added after the main one, at most three in all; one already there is skipped', async () => {
    const r = await run([prod.one!, prod.three!, prod.draft!], cat.b!, 'additional');
    expect(r.affected).toBe(2); // «three» already has b
    expect(r.skipped.map((s) => s.id)).toEqual([prod.three]);
    expect(await live(prod.one!)).toEqual([cat.a, cat.b]);
    expect(await draftCats(prod.draft!)).toEqual([cat.d, cat.b]);
    await run([prod.three!], cat.a!, 'additional');
    const full = await run([prod.three!], cat.d!, 'additional');
    expect(full.affected).toBe(0);
    expect(full.skipped[0]!.reason).toBe('Вже три категорії');
  });

  it('a group with subcategories cannot be chosen; products.update is required', async () => {
    await expect(run([prod.one!], cat.group!, 'main')).rejects.toMatchObject({ status: 422 });
    await expect(run([prod.one!], cat.a!, 'main', { ...actor, permissions: new Set(['products.bulk_edit']) })).rejects.toMatchObject({ status: 403 });
  });

  it('one click reverts the batch', async () => {
    const before = await live(prod.one!);
    const r = await run([prod.one!], cat.c!, 'main');
    expect(await live(prod.one!)).toEqual([cat.c, cat.b]);
    await revertBulk(r.auditBatchId!, actor);
    expect(await live(prod.one!)).toEqual(before);
  });
});
