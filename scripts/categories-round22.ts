// Round 22 (docs/00-client-decisions-22.md) on a database seeded before it; run by deploy/install.sh
// right after the seed, on every deploy:
//   npx tsx --env-file=.env scripts/categories-round22.ts
// K20: «Подушки та постіль» becomes «Подушки» (same row, key and products) and a new top group «Постіль»
//      right after it takes «Наволочки» and «Постільна білизна».
// K13: the hidden «Від партнерів» category goes (soft delete) after its product links are removed; the
//      site gathers partner goods from the product checkbox.
// Runs once (setting `catalogue.tree_round` = 22), so later edits in the panel are never undone, and
// every step checks the current state first, so a fresh database (seeded with the new tree) and a
// half-done one both come out the same.
import type { Prisma } from '@prisma/client';
import type { ProductDoc } from '@vivcharyk/schemas';
import { prisma } from '../apps/api/src/lib/prisma';

const ROUND = 22;
const PILLOWS = { key: 'podushky-ta-postil', oldSlug: 'podushky-ta-postil', name: 'Подушки', slug: 'vsi-podushky' };
const BEDDING = { key: 'postil', name: 'Постіль', slug: 'postil', children: ['navolochky', 'postilna-bilyzna'] };
const PARTNERS = 'partnerski-vyroby';

type Tx = Prisma.TransactionClient;
const byKey = (tx: Tx, key: string) => tx.category.findUnique({ where: { key }, select: { id: true, parentId: true, deletedAt: true } });

async function split(tx: Tx) {
  const pillows = await byKey(tx, PILLOWS.key);
  if (!pillows || pillows.deletedAt) return console.log('categories-round22: pillow group not found, split skipped');

  const t = await tx.categoryTranslation.findFirst({ where: { categoryId: pillows.id, locale: 'uk' }, select: { id: true, slug: true } });
  if (t?.slug === PILLOWS.oldSlug) {
    await tx.categoryTranslation.update({ where: { id: t.id }, data: { name: PILLOWS.name, slug: PILLOWS.slug } });
    // The old group address leads to the pillows (subcategory addresses resolve by their own slug).
    await tx.redirect.upsert({ where: { fromPath: `/uk/${PILLOWS.oldSlug}` }, create: { fromPath: `/uk/${PILLOWS.oldSlug}`, toPath: `/uk/${PILLOWS.slug}` }, update: { toPath: `/uk/${PILLOWS.slug}` } });
    console.log(`categories-round22: «${PILLOWS.name}» renamed, /uk/${PILLOWS.oldSlug} → /uk/${PILLOWS.slug}`);
  }

  // The seed may already have created «Постіль» (by key or by slug); a deleted one stays deleted.
  const slugRow = await tx.categoryTranslation.findUnique({ where: { locale_slug: { locale: 'uk', slug: BEDDING.slug } }, select: { categoryId: true } });
  let bedding = (await byKey(tx, BEDDING.key)) ?? (slugRow ? await tx.category.findUnique({ where: { id: slugRow.categoryId }, select: { id: true, parentId: true, deletedAt: true } }) : null);
  if (bedding?.deletedAt) return console.log('categories-round22: «Постіль» was deleted in the panel, split skipped');
  if (!bedding) {
    bedding = await tx.category.create({
      data: { key: BEDDING.key, parentId: null, isActive: true, translations: { create: { locale: 'uk', name: BEDDING.name, slug: BEDDING.slug } } },
      select: { id: true, parentId: true, deletedAt: true },
    });
    console.log(`categories-round22: «${BEDDING.name}» created`);
  }

  for (const [i, key] of BEDDING.children.entries()) {
    const child = await byKey(tx, key);
    // Only from the pillow group: a subcategory moved elsewhere in the panel stays where it is.
    if (child && !child.deletedAt && child.parentId === pillows.id) {
      await tx.category.update({ where: { id: child.id }, data: { parentId: bedding.id, sortOrder: i + 1 } });
      console.log(`categories-round22: ${key} moved under «${BEDDING.name}»`);
    }
  }

  // «Постіль» right after «Подушки»; the other groups keep their order.
  const top = await tx.category.findMany({ where: { parentId: null, deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true, sortOrder: true } });
  const ids = top.map((c) => c.id).filter((id) => id !== bedding!.id);
  ids.splice(ids.indexOf(pillows.id) + 1, 0, bedding.id);
  if (ids.some((id, i) => top[i]!.id !== id || top[i]!.sortOrder !== i + 1)) {
    for (const [i, id] of ids.entries()) await tx.category.update({ where: { id }, data: { sortOrder: i + 1 } });
    console.log('categories-round22: top groups reordered');
  }
}

async function dropPartnerCategory(tx: Tx) {
  const slugRow = await tx.categoryTranslation.findUnique({ where: { locale_slug: { locale: 'uk', slug: PARTNERS } }, select: { categoryId: true } });
  const c = (await tx.category.findUnique({ where: { key: PARTNERS }, select: { id: true, deletedAt: true } }))
    ?? (slugRow ? await tx.category.findUnique({ where: { id: slugRow.categoryId }, select: { id: true, deletedAt: true } }) : null);
  if (!c || c.deletedAt) return;
  const children = await tx.category.count({ where: { parentId: c.id, deletedAt: null } });
  if (children) return console.log(`categories-round22: «Від партнерів» has ${children} subcategories, left in place`);

  const links = await tx.productCategory.deleteMany({ where: { categoryId: c.id } });
  const drafts = await tx.product.findMany({ where: { draftDocument: { path: ['categoryIds'], array_contains: [c.id] } }, select: { id: true, draftDocument: true } });
  for (const p of drafts) {
    const doc = p.draftDocument as unknown as ProductDoc;
    await tx.product.update({ where: { id: p.id }, data: { draftDocument: { ...doc, categoryIds: doc.categoryIds.filter((id) => id !== c.id) } as unknown as Prisma.InputJsonValue } });
  }
  await tx.productTemplate.updateMany({ where: { defaultCategoryId: c.id }, data: { defaultCategoryId: null } });
  await tx.category.update({ where: { id: c.id }, data: { deletedAt: new Date(), isActive: false, isFeatured: false } });
  console.log(`categories-round22: «Від партнерів» deleted (${links.count} product links, ${drafts.length} drafts cleared)`);
}

// Product types pointing at the wrong place before round 22: «Подушка» at «Ліжники та килими»,
// «Капці» at «Шкарпетки й теплі речі». Moved only while they still point there, so a choice made
// later in the panel is kept; safe to run on every deploy.
const TEMPLATE_FIX = [
  { template: 'podushka', from: 'lizhnyky-ta-pledy', to: 'podushky-ta-postil' },
  { template: 'kaptsi', from: 'shkarpetky-ta-kaptsi', to: 'kaptsi' },
];
for (const f of TEMPLATE_FIX) {
  const [from, to] = [await byKey(prisma, f.from), await byKey(prisma, f.to)];
  if (!from || !to || to.deletedAt) continue;
  const r = await prisma.productTemplate.updateMany({ where: { key: f.template, defaultCategoryId: from.id }, data: { defaultCategoryId: to.id } });
  if (r.count) console.log(`categories-round22: template ${f.template} now defaults to ${f.to}`);
}

await prisma.$transaction(async (tx) => {
  const s = await tx.setting.findUnique({ where: { key: 'catalogue.tree_round' } });
  if (typeof s?.value === 'number' && s.value >= ROUND) return console.log(`categories-round22: already done`);
  await split(tx);
  await dropPartnerCategory(tx);
  await tx.setting.upsert({ where: { key: 'catalogue.tree_round' }, create: { key: 'catalogue.tree_round', value: ROUND }, update: { value: ROUND } });
  console.log(`categories-round22: tree at round ${ROUND}`);
}, { timeout: 60_000 });
await prisma.$disconnect();
