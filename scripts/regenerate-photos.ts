// Round 24 G033: remake every product photo with the new pipeline (apps/api/src/modules/products/media.ts):
// seven widths in WebP and AVIF under byte budgets, a 1200×630 og:image, and file names with words (G034).
//   npx tsx --env-file=.env scripts/regenerate-photos.ts --dry-run   what would change, bytes now
//   npx tsx --env-file=.env scripts/regenerate-photos.ts             remake, point the Media rows at the new files
//   npx tsx --env-file=.env scripts/regenerate-photos.ts --prune     afterwards: delete the old files
// Repeatable: a photo already remade is skipped; a run stopped half way continues where it stopped. The
// source is the largest file there is (the 1600 px WebP). The old files stay until --prune, so pages cached
// with the old addresses keep their pictures; --prune deletes only files no Media row points at any more.
import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config } from '../apps/api/src/config';
import { prisma } from '../apps/api/src/lib/prisma';
import { WIDTHS, isPhotoSet, productPhotoBase, writePhotoSet } from '../apps/api/src/modules/products/media';

const args = new Set(process.argv.slice(2));
const dry = args.has('--dry-run'), prune = args.has('--prune');
const DIR = config.media.dir;
const LOG = path.join(DIR, 'photos', 'regenerated.json');
const OLD = [480, 960, 1600];
const size = (f: string) => (existsSync(f) ? statSync(f).size : 0);
const file = (publicId: string, suffix: string) => path.join(DIR, `${publicId.slice('local:'.length)}-${suffix}`);
const kb = (n: number) => `${Math.round(n / 1024).toLocaleString('uk-UA')} КБ`;
// old publicId → new publicId, kept beside the photos so --prune knows what it may delete.
const done: Record<string, string> = existsSync(LOG) ? JSON.parse(readFileSync(LOG, 'utf8')) : {};

if (prune) {
  let files = 0, bytes = 0;
  for (const old of Object.keys(done)) {
    if (await prisma.media.findFirst({ where: { provider: 'local', publicId: old }, select: { id: true } })) continue; // still in use
    for (const w of OLD) {
      const f = file(old, `${w}.webp`);
      if (!existsSync(f)) continue;
      bytes += size(f); files++;
      if (!dry) unlinkSync(f);
    }
  }
  console.log(`${dry ? 'Було б видалено' : 'Видалено'} старих файлів: ${files}, ${kb(bytes)}.`);
  await prisma.$disconnect();
  process.exit(0);
}

const rows = await prisma.productMedia.findMany({
  where: { media: { provider: 'local', kind: 'IMAGE' } },
  orderBy: [{ productId: 'asc' }, { position: 'asc' }],
  select: { productId: true, optionValueId: true, product: { select: { sku: true } }, media: { select: { id: true, publicId: true } } },
});
const seen = new Set<string>();
const before = { webp: new Map<number, number>(), count: 0 };
const after = { webp: new Map<number, number>(), avif: new Map<number, number>(), count: 0 };
let skipped = 0, missing = 0;
const add = (m: Map<number, number>, w: number, n: number) => m.set(w, (m.get(w) ?? 0) + n);

for (const r of rows) {
  if (seen.has(r.media.id)) continue; // one photo shown on two products is remade once
  seen.add(r.media.id);
  const id = r.media.publicId;
  if (isPhotoSet(id)) { skipped++; continue; }
  const source = [1600, 960, 480].map((w) => file(id, `${w}.webp`)).find(existsSync);
  if (!source) { missing++; console.log(`  немає файлів: ${r.product.sku} ${id}`); continue; }
  before.count++;
  for (const w of OLD) add(before.webp, w, size(file(id, `${w}.webp`)));
  const base = await productPhotoBase(r.productId, r.optionValueId);
  if (dry) { console.log(`  ${r.product.sku}: ${path.basename(id)} → ${path.basename(base)}-<хеш>-<ширина>.webp|avif`); continue; }

  const set = await writePhotoSet(readFileSync(source), base);
  await prisma.media.update({ where: { id: r.media.id }, data: { publicId: set.publicId, format: 'webp', width: set.width, height: set.height, bytes: set.bytes } });
  await prisma.product.update({ where: { id: r.productId }, data: { updatedAt: new Date() } }); // new lastmod and cache keys
  done[id] = set.publicId;
  writeFileSync(LOG, JSON.stringify(done, null, 1));
  after.count++;
  for (const w of WIDTHS) { add(after.webp, w, size(file(set.publicId, `${w}.webp`))); add(after.avif, w, size(file(set.publicId, `${w}.avif`))); }
  console.log(`  ${r.product.sku}: ${path.basename(set.publicId)} — 960 px ${kb(size(file(id, '960.webp')))} → WebP ${kb(size(file(set.publicId, '960.webp')))}, AVIF ${kb(size(file(set.publicId, '960.avif')))}`);
}

const avg = (m: Map<number, number>, w: number, n: number) => (n && m.get(w) ? kb(m.get(w)! / n) : '—');
console.log(`\nФото: ${before.count} ${dry ? 'буде перероблено' : 'перероблено'}, ${skipped} вже нові, ${missing} без файлів.`);
console.log('Середній розмір файлу, ширина: було WebP → стало WebP / AVIF');
for (const w of WIDTHS) console.log(`  ${String(w).padStart(4)} px: ${OLD.includes(w) ? avg(before.webp, w, before.count) : '(не було)'} → ${avg(after.webp, w, after.count)} / ${avg(after.avif, w, after.count)}`);
if (!dry && after.count) console.log('\nСтарі файли лишились на диску. Коли сайт показує нові фото: scripts/regenerate-photos.ts --prune');
await prisma.$disconnect();
