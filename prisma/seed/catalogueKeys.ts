import { Prisma } from '@prisma/client';

// §25.8h backfill. Fill-if-empty only, so the owner's later edits are never overwritten.
const HIDDEN_IN_EU = ['ovchyna', 'shkira']; // sheepskin and leather: uk + en only at launch (04 §4.2)

// docs/37 §37.2: yarn thickness тонка / середня / товста. Pillow fillings are a list the docs do
// not enumerate, so `filling` stays without options until the owner adds them.
const OPTIONS: Record<string, Array<{ key: string; label: { uk: string } }>> = {
  yarn_thickness: [
    { key: 'thin', label: { uk: 'Тонка' } },
    { key: 'medium', label: { uk: 'Середня' } },
    { key: 'thick', label: { uk: 'Товста' } },
  ],
};

export async function seedCatalogueKeys(tx: Prisma.TransactionClient) {
  const cats = await tx.category.findMany({ select: { id: true, key: true, parentId: true, hiddenLocales: true, translations: { where: { locale: 'uk' }, select: { slug: true } } } });
  const byKey = new Map(cats.map((c) => [c.key ?? c.translations[0]?.slug, c]));
  let keys = 0, hidden = 0, options = 0;
  for (const c of cats) {
    const slug = c.translations[0]?.slug;
    if (!c.key && slug) { await tx.category.update({ where: { id: c.id }, data: { key: slug } }); keys++; }
  }
  for (const root of HIDDEN_IN_EU) {
    const r = byKey.get(root);
    if (!r) continue;
    for (const c of cats.filter((x) => x.id === r.id || x.parentId === r.id)) {
      if (c.hiddenLocales.length === 0) { await tx.category.update({ where: { id: c.id }, data: { hiddenLocales: ['pl', 'de'] } }); hidden++; }
    }
  }
  for (const [key, opts] of Object.entries(OPTIONS)) {
    const res = await tx.attributeDefinition.updateMany({ where: { key, options: { equals: Prisma.DbNull } }, data: { options: opts } });
    options += res.count;
  }
  console.log(`catalogue keys: +${keys} keys, +${hidden} hidden-locale rows, +${options} attribute option lists`);
}

// Round 10 part 2 #8: the homepage shows four category circles, by default Ліжники та пледи,
// Пряжа та рукоділля, Овчина, Шкарпетки та капці; editable in the admin («★ на головній»).
// Applied only while nothing is featured, so the owner's later choice is never overwritten.
export async function seedFeaturedCategories(tx: Prisma.TransactionClient) {
  if (await tx.category.count({ where: { isFeatured: true } })) return;
  const r = await tx.category.updateMany({ where: { key: { in: ['lizhnyky-ta-pledy', 'priazha-ta-rukodillia', 'ovchyna', 'shkarpetky-ta-kaptsi'] } }, data: { isFeatured: true } });
  console.log(`featured categories: ${r.count} set`);
}
