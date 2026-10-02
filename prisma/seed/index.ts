// Idempotent seed: safe to re-run on every deploy (docs/24 §24.16, docs/25 §25.11).
import { PrismaClient } from '@prisma/client';
import { syncPermissions } from './permissions';
import { syncRoles } from './roles';
import { seedOwner } from './owner';
import { seedCatalogue } from './catalogue';
import { seedCatalogueKeys, seedFeaturedCategories } from './catalogueKeys';
import { seedProduction } from './production';
import { seedCollections } from './collections';
import { seedBlogTags } from './blogTags';

const db = new PrismaClient();

try {
  const roles = await db.$transaction(
    async (tx) => {
      const newKeys = await syncPermissions(tx);
      console.log(`permissions: catalogue synced, ${newKeys.size} new`);
      return syncRoles(tx, newKeys);
    },
    { timeout: 30_000 },
  );
  for (const r of roles) {
    console.log(`role ${r.key}: ${r.created ? 'created' : 'exists'}, +${r.added} permission(s)`);
  }

  await seedOwner(db);

  await db.$transaction((tx) => seedCatalogue(tx), { timeout: 60_000 });
  await db.$transaction((tx) => seedCatalogueKeys(tx), { timeout: 60_000 });
  await db.$transaction((tx) => seedFeaturedCategories(tx));
  await db.$transaction((tx) => seedProduction(tx));
  await db.$transaction((tx) => seedCollections(tx));
  await db.$transaction((tx) => seedBlogTags(tx));

  // DEVELOPMENT ONLY: demo colours and products. Never set SEED_DEMO in production.
  if (process.env.SEED_DEMO === '1') {
    const { seedDemo } = await import('./demo');
    await db.$transaction((tx) => seedDemo(tx), { timeout: 60_000 });
    const { seedDemoReviews } = await import('./demoReviews');
    await db.$transaction((tx) => seedDemoReviews(tx));
  }
} finally {
  await db.$disconnect();
}
