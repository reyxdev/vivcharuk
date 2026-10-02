// The six blog pillars of round 9 (part 5): tags an article is filed under. Create-only by key.
import type { Prisma } from '@prisma/client';

const PILLARS = [
  { key: 'care', name: 'Догляд за вовною', slug: 'dohliad-za-vovnoiu' },
  { key: 'lizhnyk-history', name: 'Історія ліжникарства', slug: 'istoriia-lizhnykarstva' },
  { key: 'yavoriv', name: 'Яворів і Карпати', slug: 'yavoriv-i-karpaty' },
  { key: 'how-we-make', name: 'Як ми виробляємо', slug: 'yak-my-vyrobliaiemo' },
  { key: 'choosing-lizhnyk', name: 'Як обрати ліжник', slug: 'yak-obraty-lizhnyk' },
  { key: 'knitting', name: "В'язання з нашої пряжі", slug: 'viazannia-z-nashoi-priazhi' },
];

export async function seedBlogTags(tx: Prisma.TransactionClient) {
  let n = 0;
  for (const p of PILLARS) {
    if (await tx.tag.findUnique({ where: { key: p.key } })) continue;
    await tx.tag.create({ data: { key: p.key, translations: { create: { locale: 'uk', name: p.name, slug: p.slug } } } });
    n++;
  }
  console.log(`blog tags: ${n} created`);
}
