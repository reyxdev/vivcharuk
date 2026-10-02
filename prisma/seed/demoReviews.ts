// DEVELOPMENT ONLY (SEED_DEMO=1): sample reviews so the Reviews page can be built. Never real
// customers. Create-only by sourceRef.
import type { Prisma } from '@prisma/client';

const REVIEWS: Array<{ ref: string; sku?: string; name: string; rating: number; body: string; source: 'SITE' | 'PROM'; daysAgo: number; reply?: string }> = [
  { ref: 'demo:1', sku: 'VCH-LZ-0101', name: 'Тестовий Відгук', rating: 5, body: 'Демо-відгук для розробки: ліжник щільний і теплий, як на фото.', source: 'SITE', daysAgo: 3, reply: 'Демо-відповідь: дякуємо!' },
  { ref: 'demo:2', name: 'Демо Покупець', rating: 4, body: 'Демо-відгук про магазин: швидко відповіли й підказали з розміром.', source: 'SITE', daysAgo: 12 },
  { ref: 'demo:3', sku: 'VCH-KP-0101', name: 'Приклад Перенесений', rating: 5, body: 'Демо-відгук, ніби перенесений з Prom.ua: капці теплі.', source: 'PROM', daysAgo: 200 },
  { ref: 'demo:4', name: 'Ще Приклад', rating: 3, body: 'Демо-відгук з Prom.ua: доставка йшла довше, ніж хотілося.', source: 'PROM', daysAgo: 320 },
];

export async function seedDemoReviews(tx: Prisma.TransactionClient) {
  let n = 0;
  for (const r of REVIEWS) {
    if (await tx.review.findFirst({ where: { sourceRef: r.ref } })) continue;
    const product = r.sku ? await tx.product.findUnique({ where: { sku: r.sku }, select: { id: true } }) : null;
    const date = new Date(Date.now() - r.daysAgo * 86_400_000);
    await tx.review.create({
      data: {
        productId: product?.id ?? null, authorName: r.name, authorEmail: r.source === 'SITE' ? 'demo@example.test' : null, rating: r.rating, body: r.body,
        status: 'APPROVED', source: r.source, sourceRef: r.ref, sourceDate: r.source === 'PROM' ? date : null, createdAt: date,
        reply: r.reply ?? null, repliedAt: r.reply ? date : null,
      },
    });
    n++;
  }
  console.log(`demo reviews: ${n} created`);
}
