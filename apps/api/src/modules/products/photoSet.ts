import { createHash } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { slugify } from '@vivcharyk/schemas';

// Product photos stored by the site itself (round 18, before Cloudinary), under MEDIA_DIR.
// Round 24 (G030–G035): every photo is made on the server from the largest file the panel sends, in seven
// widths, WebP and AVIF, each under a byte budget, plus a 1200×630 JPEG for link previews (og:image):
//   photos/<sku>/<words>-<hash8>-{160,240,480,720,960,1200,1600}.{webp,avif}, <…>-og.jpg
// The words name the product (its slug, the size when it has one, the colour of a colour photo), so the file
// says what it shows (G034); the hash keeps a changed photo at a new address (cached for a year).
// Older photos (products/<sku>/<hash12>, and every other local picture) have 480/960/1600 WebP only, until
// scripts/regenerate-photos.ts remakes them (G033). The storefront tells the two apart by the folder.

export const WIDTHS = [160, 240, 480, 720, 960, 1200, 1600] as const;
export type PhotoWidth = (typeof WIDTHS)[number];
/** G032: byte budgets per width (WebP; AVIF gets two thirds). Quality steps down until a file fits. */
const BUDGET_KB: Record<PhotoWidth, number> = { 160: 8, 240: 16, 480: 45, 720: 90, 960: 150, 1200: 220, 1600: 350 };
// Tried in order until a file fits: the start, the middle, the floor (G031: WebP never below 55).
const WEBP = [72, 63, 55], AVIF = [50, 44, 38];

export const isPhotoSet = (publicId: string) => publicId.startsWith('local:photos/');

/** The file of one width (always WebP; 480, 960 and 1600 exist for old and new photos alike). */
export const photoUrl = (publicId: string, w: PhotoWidth = 480) =>
  publicId.startsWith('local:') ? `/media/${publicId.slice('local:'.length)}-${w}.webp` : null;

/** Words for a photo's file name (G034): product slug, a single size, the colour of a colour photo. */
export function photoWords(slug: string, size?: string | null, colour?: string | null) {
  const parts = [slugify(slug) || 'foto'];
  for (const extra of [size, colour]) {
    const w = extra ? slugify(extra) : '';
    if (w && !parts[0]!.includes(w)) parts.push(w);
  }
  return parts.join('-').slice(0, 90).replace(/-+$/, '');
}

async function encode(img: { data: Buffer; info: sharp.OutputInfo }, w: PhotoWidth, fmt: 'webp' | 'avif') {
  const budget = BUDGET_KB[w] * 1024 * (fmt === 'avif' ? 2 / 3 : 1);
  let out: Buffer | undefined;
  for (const q of fmt === 'webp' ? WEBP : AVIF) {
    const pipe = sharp(img.data, { raw: { width: img.info.width, height: img.info.height, channels: img.info.channels } });
    // AVIF effort 2: the same size as the default effort 4 at a seventh of the time (measured, 960 w).
    out = await (fmt === 'webp' ? pipe.webp({ quality: q, effort: 5, smartSubsample: true }) : pipe.avif({ quality: q, effort: 2 })).toBuffer();
    if (out.length <= budget) break;
  }
  return out!;
}

/**
 * Writes the whole set for one photo under `dir` (MEDIA_DIR) and returns its publicId. `base` is
 * photos/<sku>/<words>; the content hash is added here. Existing files are kept (the run is repeatable).
 */
export async function writePhotoSet(source: Buffer, base: string, dir: string): Promise<{ publicId: string; width: number; height: number; bytes: number }> {
  const hash = createHash('sha1').update(source).digest('hex').slice(0, 8);
  const rel = `${base}-${hash}`;
  const file = (suffix: string) => path.join(dir, `${rel}-${suffix}`);
  await mkdir(path.dirname(file('x')), { recursive: true });
  const upright = sharp(source, { failOn: 'none' }).rotate(); // EXIF orientation applied; no metadata kept
  const meta = await upright.clone().toBuffer({ resolveWithObject: true });
  const { width, height } = meta.info;
  let bytes = 0;
  for (const w of WIDTHS) {
    const done = await stat(file(`${w}.avif`)).then(() => true, () => false);
    if (!done) {
      const img = await sharp(meta.data).resize({ width: w, withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true });
      await writeFile(file(`${w}.webp`), await encode(img, w, 'webp'));
      await writeFile(file(`${w}.avif`), await encode(img, w, 'avif'));
    }
    if (w === 1600) bytes = (await stat(file(`${w}.webp`))).size;
  }
  // og:image: 1200×630, the middle of the photo (G132).
  if (!(await stat(file('og.jpg')).then(() => true, () => false))) {
    await writeFile(file('og.jpg'), await sharp(meta.data).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 78, mozjpeg: true }).toBuffer());
  }
  return { publicId: `local:${rel}`, width, height, bytes };
}

