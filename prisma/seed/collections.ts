// Collections of round 10 part 2 #18: На подарунок, Весільні, Для дітей. Create-only by key.
// No descriptions are invented; the owner writes them in the admin.
import type { Prisma } from '@prisma/client';

const COLLECTIONS = [
  { key: 'gifts', name: 'На подарунок', slug: 'na-podarunok', sortOrder: 1 },
  { key: 'wedding', name: 'Весільні', slug: 'vesilni', sortOrder: 2 },
  { key: 'children', name: 'Для дітей', slug: 'dlia-ditei', sortOrder: 3 },
];

export async function seedCollections(tx: Prisma.TransactionClient) {
  let n = 0;
  for (const c of COLLECTIONS) {
    if (await tx.collection.findUnique({ where: { key: c.key } })) continue;
    await tx.collection.create({ data: { key: c.key, sortOrder: c.sortOrder, translations: { create: { locale: 'uk', name: c.name, slug: c.slug } } } });
    n++;
  }
  console.log(`collections: ${n} created`);
}
