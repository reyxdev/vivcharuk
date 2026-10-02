import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import type { ProductDoc } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';

// Product photos stored by the site itself (round 18, before Cloudinary): <path>-480.webp, -960.webp,
// -1600.webp under MEDIA_DIR, the same layout scripts/import-products.ts writes. The panel compresses
// on the phone (round 20 #271–272) and sends all three widths; when the browser could not make WebP
// (Safari) and ImageMagick is on the server, the server converts; otherwise the files are kept as sent
// (browsers read the picture by its content, not by the name).

export const WIDTHS = [480, 960, 1600] as const;
type Actor = { id: string; email: string };
const run = promisify(execFile);

// ImageMagick 7 is `magick`; Ubuntu/Debian packages ship ImageMagick 6 as `convert` with the same arguments here.
let magickBin: Promise<string | null> | undefined;
const findMagick = () => (magickBin ??= run('magick', ['-version']).then(() => 'magick', () => run('convert', ['-version']).then(() => 'convert', () => null)));
const hasMagick = () => findMagick().then(Boolean);
const isWebp = (b: Buffer) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';

export const photoUrl = (publicId: string, w: (typeof WIDTHS)[number] = 480) =>
  publicId.startsWith('local:') ? `/media/${publicId.slice('local:'.length)}-${w}.webp` : null;

const b64 = z.string().min(10).max(8_000_000);
export const uploadBody = z.object({
  files: z.object({ '480': b64, '960': b64, '1600': b64 }),
  width: z.number().int().min(50).max(4000),
  height: z.number().int().min(50).max(4000),
  replaces: z.string().max(40).optional(), // an edited (rotated, cropped) photo takes the old one's place
});

async function product(id: string) {
  const p = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, sku: true, draftDocument: true, translations: { where: { locale: 'uk' }, select: { name: true } }, media: { select: { mediaId: true, position: true } } },
  });
  if (!p) throw new AppError(404, 'PRODUCT_NOT_FOUND');
  return p;
}

export async function listPhotos(productId: string) {
  const rows = await prisma.productMedia.findMany({ where: { productId }, orderBy: { position: 'asc' }, include: { media: { select: { id: true, publicId: true, width: true, height: true } } } });
  return rows.map((r) => ({ id: r.media.id, thumb: photoUrl(r.media.publicId, 480), large: photoUrl(r.media.publicId, 1600), width: r.media.width, height: r.media.height }));
}

export async function uploadPhoto(productId: string, input: z.infer<typeof uploadBody>, actor: Actor) {
  const p = await product(productId);
  const bufs = WIDTHS.map((w) => Buffer.from(input.files[String(w) as '480'], 'base64'));
  const big = bufs[2]!;
  const rel = `products/${p.sku.toLowerCase().replace(/[^a-z0-9-]/g, '')}/${createHash('sha1').update(big).digest('hex').slice(0, 12)}`;
  const publicId = `local:${rel}`;
  const file = (w: number) => path.join(config.media.dir, `${rel}-${w}.webp`);

  let media = await prisma.media.findFirst({ where: { provider: 'local', publicId }, select: { id: true } });
  if (!media) {
    await mkdir(path.dirname(file(480)), { recursive: true });
    if (bufs.every(isWebp) || !(await hasMagick())) {
      await Promise.all(WIDTHS.map((w, i) => writeFile(file(w), bufs[i]!)));
    } else {
      const tmp = await mkdtemp(path.join(tmpdir(), 'vk-photo-'));
      try {
        const src = path.join(tmp, 'src');
        await writeFile(src, big);
        for (const w of WIDTHS) await run((await findMagick())!, [src, '-auto-orient', '-strip', '-resize', `${w}x>`, '-quality', '80', file(w)]);
      } finally { await rm(tmp, { recursive: true, force: true }); }
    }
    const draft = p.draftDocument as ProductDoc | null;
    const alt = (draft?.name || p.translations[0]?.name || p.sku).slice(0, 160);
    media = await prisma.media.create({
      data: {
        provider: 'local', publicId, format: 'webp', width: input.width, height: input.height, bytes: (await stat(file(1600))).size, kind: 'IMAGE',
        uploadedById: actor.id, translations: { create: { locale: 'uk', alt } },
      },
      select: { id: true },
    });
  }

  const replaced = input.replaces ? p.media.find((m) => m.mediaId === input.replaces) : undefined;
  const already = p.media.find((m) => m.mediaId === media!.id);
  await prisma.$transaction(async (tx) => {
    if (replaced && replaced.mediaId !== media!.id) await tx.productMedia.delete({ where: { productId_mediaId: { productId, mediaId: replaced.mediaId } } });
    if (!already) {
      const position = replaced?.position ?? (p.media.length ? Math.max(...p.media.map((m) => m.position)) + 1 : 0);
      await tx.productMedia.create({ data: { productId, mediaId: media!.id, position, role: 'GALLERY' } });
    }
    await tx.product.update({ where: { id: productId }, data: { updatedAt: new Date() } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: replaced ? 'product.photo_replaced' : 'product.photo_added', resourceType: 'Product', resourceId: productId, resourceLabel: p.sku }, tx);
  });
  return { photos: await listPhotos(productId) };
}

/** First photo = main (round 20 #128); the order is the gallery order on the site. */
export async function orderPhotos(productId: string, ids: string[], actor: Actor) {
  const p = await product(productId);
  const linked = new Set(p.media.map((m) => m.mediaId));
  if (ids.length !== linked.size || ids.some((id) => !linked.has(id))) throw new AppError(409, 'VALIDATION_FAILED', 'PHOTOS_CHANGED');
  await prisma.$transaction(async (tx) => {
    for (const [position, mediaId] of ids.entries()) await tx.productMedia.update({ where: { productId_mediaId: { productId, mediaId } }, data: { position } });
    await tx.product.update({ where: { id: productId }, data: { updatedAt: new Date() } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.photos_reordered', resourceType: 'Product', resourceId: productId, resourceLabel: p.sku }, tx);
  });
  return { photos: await listPhotos(productId) };
}

/** Removes the photo from the product; the file stays (another product or a letter may use it). */
export async function removePhoto(productId: string, mediaId: string, actor: Actor) {
  const p = await product(productId);
  if (!p.media.some((m) => m.mediaId === mediaId)) throw new AppError(404, 'NOT_FOUND');
  await prisma.$transaction(async (tx) => {
    await tx.productMedia.delete({ where: { productId_mediaId: { productId, mediaId } } });
    await tx.product.update({ where: { id: productId }, data: { updatedAt: new Date() } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.photo_removed', resourceType: 'Product', resourceId: productId, resourceLabel: p.sku }, tx);
  });
  return { photos: await listPhotos(productId) };
}
