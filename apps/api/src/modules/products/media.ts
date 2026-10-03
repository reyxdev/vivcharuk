import { z } from 'zod';
import type { ProductDoc } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import sharp from 'sharp';
import { photoUrl, photoWords, writePhotoSet as write } from './photoSet';

// Product photos: the files are made in ./photoSet.ts (round 24, G030–G035); here they meet the database.
export { WIDTHS, isPhotoSet, photoUrl, photoWords, type PhotoWidth } from './photoSet';
type Actor = { id: string; email: string };

/** Writes the whole set for one photo under MEDIA_DIR (see photoSet.ts). */
export const writePhotoSet = (source: Buffer, base: string) => write(source, base, config.media.dir);

/** The words of a product's photo names: its Ukrainian slug and, when it comes in one size only, that size. */
export async function productPhotoBase(productId: string, optionValueId?: string | null) {
  const p = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    select: {
      sku: true, translations: { where: { locale: 'uk' }, select: { slug: true, name: true } },
      variants: { where: { isActive: true, deletedAt: null }, select: { options: { select: { optionValue: { select: { dimensions: true } } } } } },
    },
  });
  const sizes = new Set(p.variants.flatMap((v) => v.options.flatMap((o) => {
    const d = o.optionValue.dimensions as { widthCm?: number; lengthCm?: number } | null;
    return d?.widthCm && d.lengthCm ? [`${d.widthCm}x${d.lengthCm}`] : [];
  })));
  const colour = optionValueId ? (await prisma.optionValue.findUnique({ where: { id: optionValueId }, select: { colorFamily: true } }))?.colorFamily : null;
  const t = p.translations[0];
  const words = photoWords(t?.slug || t?.name || p.sku, sizes.size === 1 ? [...sizes][0] : null, colour);
  return `photos/${p.sku.toLowerCase().replace(/[^a-z0-9-]/g, '')}/${words}`;
}

const b64 = z.string().min(10).max(8_000_000);
export const uploadBody = z.object({
  // The panel compresses on the phone and sends only its 1600 px file (round 24): the server makes every
  // width itself (photoSet.ts). '480' and '960' are still accepted, and ignored, from a panel loaded earlier.
  files: z.object({ '1600': b64, '480': b64.optional(), '960': b64.optional() }),
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
  // The largest file the phone made is the source; any format the server can read (HEIC from an iPhone too).
  const big = Buffer.from(input.files['1600'], 'base64');
  if (!(await sharp(big).metadata().then((m) => !!m.width, () => false))) throw new AppError(422, 'VALIDATION_FAILED', 'PHOTO_UNREADABLE');
  const set = await writePhotoSet(big, await productPhotoBase(productId));

  let media = await prisma.media.findFirst({ where: { provider: 'local', publicId: set.publicId }, select: { id: true } });
  if (!media) {
    const draft = p.draftDocument as ProductDoc | null;
    const alt = (draft?.name || p.translations[0]?.name || p.sku).slice(0, 160);
    media = await prisma.media.create({
      data: {
        provider: 'local', publicId: set.publicId, format: 'webp', width: set.width, height: set.height, bytes: set.bytes, kind: 'IMAGE',
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
