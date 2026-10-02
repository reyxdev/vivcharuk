// Import a batch of products with photos from a manifest (round 18: the first real catalogue).
//   npx tsx --env-file=.env scripts/import-products.ts scripts/data/products/<batch>.json [folder with the photos]
// Photos (HEIC, JPEG, PNG…) are converted by ImageMagick into three widths of WebP under MEDIA_DIR
// (default ./media), named by a hash of the source file, and stored as local Media rows. Products are
// created published with one variant; a SKU that already exists is skipped, so the run is repeatable.
// The converted photos are listed in <batch>.media.json, so the server imports the batch from the
// uploaded media/ folder without the originals or ImageMagick (deploy/install.sh runs every batch).
// Sizes, exact prices and stock are then edited in the admin panel.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../prisma/seed/demo';

interface Photo { file: string; alt: string }
interface Item { sku: string; category: string; name: string; priceUah: number; description: string; wool: boolean; photos: Photo[] }

const [manifestPath, photoDir] = process.argv.slice(2);
if (!manifestPath) throw new Error('usage: import-products.ts <manifest.json> [photo folder]');
const { products } = JSON.parse(readFileSync(manifestPath, 'utf8')) as { products: Item[] };
const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve('media');
const WIDTHS = [480, 960, 1600];
const db = new PrismaClient();
type Converted = { publicId: string; width: number; height: number; bytes: number };
const lockPath = manifestPath.replace(/\.json$/, '.media.json');
const lock: Record<string, Converted> = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : {};
const filesOf = (c: Converted) => WIDTHS.map((w) => path.join(MEDIA_DIR, `${c.publicId.slice('local:'.length)}-${w}.webp`));

/** The converted photo: from the lock when its files are present, otherwise converted from the original. */
function photo(file: string, sku: string): Converted {
  const key = `${sku}/${file}`;
  const known = lock[key];
  if (known && filesOf(known).every((f) => existsSync(f))) return known;
  if (!photoDir) throw new Error(`${key}: not converted yet and no photo folder given`);
  return (lock[key] = convert(path.join(photoDir, file), sku));
}

function convert(src: string, sku: string) {
  const hash = createHash('sha1').update(readFileSync(src)).digest('hex').slice(0, 12);
  const rel = `products/${sku.toLowerCase()}/${hash}`;
  mkdirSync(path.join(MEDIA_DIR, path.dirname(rel)), { recursive: true });
  for (const w of WIDTHS) {
    const out = path.join(MEDIA_DIR, `${rel}-${w}.webp`);
    if (!existsSync(out)) execFileSync('magick', [src, '-auto-orient', '-strip', '-resize', `${w}x>`, '-quality', '80', out]);
  }
  const largest = path.join(MEDIA_DIR, `${rel}-${WIDTHS[WIDTHS.length - 1]}.webp`);
  const [width, height] = execFileSync('magick', ['identify', '-format', '%w %h', largest]).toString().split(' ').map(Number);
  return { publicId: `local:${rel}`, width: width!, height: height!, bytes: statSync(largest).size };
}

const template = await db.productTemplate.findUniqueOrThrow({ where: { key: 'lizhnyk' }, select: { id: true, storyStages: true } });
const wool = await db.materialTranslation.findFirstOrThrow({ where: { locale: 'uk', name: 'Овеча вовна' }, select: { materialId: true } });
const categories = new Map((await db.categoryTranslation.findMany({ where: { locale: 'uk' }, select: { slug: true, categoryId: true } })).map((c) => [c.slug, c.categoryId]));

let created = 0, skipped = 0;
for (const p of products) {
  const media = p.photos.map((ph) => ({ ...photo(ph.file, p.sku), alt: ph.alt }));
  if (await db.product.findUnique({ where: { sku: p.sku }, select: { id: true } })) { skipped++; continue; }
  const categoryId = categories.get(p.category);
  if (!categoryId) throw new Error(`${p.sku}: category ${p.category} not found`);
  const price = p.priceUah * 100;
  await db.$transaction(async (tx) => {
    const rows = [];
    for (const m of media) {
      rows.push(await tx.media.create({
        data: { provider: 'local', publicId: m.publicId, format: 'webp', width: m.width, height: m.height, bytes: m.bytes, kind: 'IMAGE', translations: { create: { locale: 'uk', alt: m.alt } } },
        select: { id: true },
      }));
    }
    await tx.product.create({
      data: {
        sku: p.sku,
        status: 'ACTIVE',
        publishedAt: new Date(),
        pricingUnit: 'PIECE',
        origin: 'OWN_MANUFACTURE',
        priceMinMinor: price,
        priceMaxMinor: price,
        inStock: true,
        productionStage: p.wool ? template.storyStages : [],
        templateId: template.id,
        translations: { create: { locale: 'uk', name: p.name, slug: slugify(p.name), description: p.description } },
        categories: { create: [{ categoryId, sortOrder: 0 }] },
        ...(p.wool ? { composition: { create: { materialId: wool.materialId, role: 'main', percent: 100 } } } : {}),
        variants: { create: [{ sku: `${p.sku}-1`, priceMinor: price, stockQty: 1, position: 0 }] },
        media: { create: rows.map((r, i) => ({ mediaId: r.id, position: i, role: 'GALLERY' as const })) },
      },
    });
  });
  created++;
  console.log(`${p.sku}  ${p.name}  ${p.priceUah} ₴  ${media.length} фото`);
}
if (photoDir) writeFileSync(lockPath, JSON.stringify(lock, null, 1) + '\n');
console.log(`import: ${created} created, ${skipped} already there`);
await db.$disconnect();
