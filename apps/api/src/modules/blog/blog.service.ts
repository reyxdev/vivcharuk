import { Prisma } from '@prisma/client';
import { bodyPlain, lintPost, postBody, readMinutes, slugify, type PostBody } from '@vivcharyk/schemas';
import { z } from 'zod';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { indexNowPost } from '../seo/indexnow';

type Actor = { id: string; email: string };

export const postInput = z.object({
  title: z.string().trim().min(3).max(160),
  excerpt: z.string().trim().max(400).default(''),
  body: postBody,
  metaTitle: z.string().max(160).nullable().default(null),
  metaDescription: z.string().max(320).nullable().default(null),
  tagIds: z.array(z.string()).max(6).default([]),
});

async function embedStatuses(body: PostBody) {
  const ids = body.blocks.flatMap((b) => (b.type === 'productEmbed' ? [b.productId] : []));
  const rows = ids.length ? await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, status: true, deletedAt: true } }) : [];
  return (id: string) => { const r = rows.find((x) => x.id === id); return !r || r.deletedAt ? 'MISSING' as const : r.status === 'ACTIVE' ? 'ACTIVE' as const : 'OTHER' as const; };
}

/** The photos of `figure` blocks (D37) that still exist in «Фото й відео». */
export const figureIds = (body: PostBody) => body.blocks.flatMap((b) => (b.type === 'figure' ? [b.mediaId] : []));
export async function figureMedia(body: PostBody) {
  const ids = figureIds(body);
  return ids.length ? prisma.media.findMany({ where: { id: { in: ids }, kind: 'IMAGE' }, select: { id: true, provider: true, publicId: true, width: true, height: true } }) : [];
}

export async function lint(body: PostBody) {
  const plain = bodyPlain(body);
  const photos = await figureMedia(body);
  return lintPost(body, plain, await embedStatuses(body), (id) => photos.some((m) => m.id === id));
}

export async function listPosts() {
  const rows = await prisma.post.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: 'desc' }, include: { translations: { where: { locale: 'uk' } }, tags: { include: { tag: { include: { translations: { where: { locale: 'uk' } } } } } } } });
  return rows.map((p) => ({
    id: p.id, status: p.status, title: p.translations[0]?.title ?? '', slug: p.translations[0]?.slug ?? '', publishedAt: p.publishedAt?.toISOString() ?? null,
    scheduledFor: p.scheduledFor?.toISOString() ?? null, updatedAt: p.updatedAt.toISOString(), readMinutes: p.readMinutes, tags: p.tags.map((t) => t.tag.translations[0]?.name ?? t.tag.key),
  }));
}

type PostDoc = z.infer<typeof postInput>;

/** Returns the working copy: the draft of a published article when one is open, else the live text. */
export async function getPost(id: string) {
  const p = await prisma.post.findFirst({ where: { id, deletedAt: null }, include: { translations: { where: { locale: 'uk' } }, tags: true } });
  if (!p) throw new AppError(404, 'NOT_FOUND');
  const t = p.translations[0]!;
  const draft = p.draftDocument ? postInput.parse(p.draftDocument) : null;
  const doc: PostDoc = draft ?? { title: t.title, excerpt: t.excerpt, body: postBody.parse(t.bodyJson), metaTitle: t.metaTitle, metaDescription: t.metaDescription, tagIds: p.tags.map((x) => x.tagId) };
  return {
    id: p.id, status: p.status, publishedAt: p.publishedAt?.toISOString() ?? null, scheduledFor: p.scheduledFor?.toISOString() ?? null, slug: t.slug,
    ...doc, hasDraft: !!draft, draftUpdatedAt: p.draftUpdatedAt?.toISOString() ?? null,
    lints: await lint(doc.body), readMinutes: readMinutes(bodyPlain(doc.body)),
    // Thumbnails for the photo chips in the editor.
    photos: (await figureMedia(doc.body)).map((m) => ({ id: m.id, thumb: m.provider === 'local' ? `/media/${m.publicId.slice('local:'.length)}-480.webp` : null })),
  };
}

/** Writes a working copy onto the live row (a publish of changes, or an unpublish). */
async function applyDoc(tx: Prisma.TransactionClient, postId: string, doc: PostDoc) {
  const plain = bodyPlain(doc.body);
  const t = await tx.postTranslation.findFirstOrThrow({ where: { postId, locale: 'uk' } });
  await tx.postTranslation.update({ where: { id: t.id }, data: { title: doc.title, excerpt: doc.excerpt, bodyJson: doc.body as unknown as Prisma.InputJsonValue, bodyPlain: plain, metaTitle: doc.metaTitle, metaDescription: doc.metaDescription } });
  await tx.post.update({ where: { id: postId }, data: { readMinutes: readMinutes(plain), draftDocument: Prisma.DbNull, draftUpdatedAt: null } });
  await tx.postTag.deleteMany({ where: { postId } });
  if (doc.tagIds.length) await tx.postTag.createMany({ data: doc.tagIds.map((tagId) => ({ postId, tagId })) });
}

export async function createPost(title: string, actor: Actor) {
  const body: PostBody = { blocks: [] };
  const p = await prisma.$transaction(async (tx) => {
    const row = await tx.post.create({ data: { status: 'DRAFT', authorId: actor.id, translations: { create: { locale: 'uk', title, slug: `chernetka-${Date.now().toString(36)}`, excerpt: '', bodyJson: body as unknown as Prisma.InputJsonValue, bodyPlain: '' } } } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'post.created', resourceType: 'Post', resourceId: row.id, resourceLabel: title }, tx);
    return row;
  });
  return { id: p.id };
}

/**
 * Saves the uk text. An unpublished article is edited in place; a published one collects its edits
 * in `draftDocument` until «Опублікувати зміни», so autosave never reaches readers half-written.
 * A published article keeps its slug (the URL is frozen at first publish).
 */
export async function savePost(id: string, input: PostDoc, actor: Actor) {
  const p = await prisma.post.findFirst({ where: { id, deletedAt: null }, select: { status: true, draftDocument: true } });
  if (!p) throw new AppError(404, 'NOT_FOUND');
  await prisma.$transaction(async (tx) => {
    if (p.status === 'PUBLISHED') {
      await tx.post.update({ where: { id }, data: { draftDocument: input as unknown as Prisma.InputJsonValue, draftUpdatedAt: new Date() } });
      // One audit row when a draft is opened, not one per autosave.
      if (!p.draftDocument) await audit({ actorId: actor.id, actorEmail: actor.email, action: 'post.draft_opened', resourceType: 'Post', resourceId: id, resourceLabel: input.title }, tx);
    } else {
      await applyDoc(tx, id, input);
      await audit({ actorId: actor.id, actorEmail: actor.email, action: 'post.updated', resourceType: 'Post', resourceId: id, resourceLabel: input.title }, tx);
    }
  });
  return { lints: await lint(input.body), readMinutes: readMinutes(bodyPlain(input.body)), hasDraft: p.status === 'PUBLISHED' };
}

/** «Скасувати зміни»: the published text stays as it is. */
export async function discardDraft(id: string, actor: Actor) {
  const p = await prisma.post.findFirst({ where: { id, deletedAt: null, draftDocument: { not: Prisma.DbNull } } });
  if (!p) throw new AppError(404, 'NOT_FOUND');
  await prisma.$transaction(async (tx) => {
    await tx.post.update({ where: { id }, data: { draftDocument: Prisma.DbNull, draftUpdatedAt: null } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'post.draft_discarded', resourceType: 'Post', resourceId: id }, tx);
  });
  return getPost(id);
}

/** The first sentences of the text, up to about 200 characters, cut at a word. */
export function autoExcerpt(plain: string) {
  const first = plain.split('\n\n').find((x) => x.trim().length > 0)?.replace(/\s+/g, ' ').trim() ?? '';
  if (first.length <= 200) return first;
  const cut = first.slice(0, 200);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 120 ? cut.lastIndexOf(' ') : 200).replace(/[,;:—-]\s*$/, '')}…`;
}

async function uniqueSlug(tx: Prisma.TransactionClient, base: string, postId: string) {
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${base}-${i + 1}` : base;
    if (!(await tx.postTranslation.findFirst({ where: { locale: 'uk', slug, postId: { not: postId } } }))) return slug;
  }
  return `${base}-${postId.slice(-6)}`;
}

/** Publish now, or schedule (`posts.publishScheduled` promotes it). Blocking lints stop both. */
export async function publishPost(id: string, when: Date | null, actor: Actor) {
  const p = await getPost(id);
  const blocking = p.lints.filter((l) => l.level === 'block');
  if (blocking.length) throw new AppError(422, 'VALIDATION_FAILED', 'NOT_READY', { missing: blocking.map((l) => l.message) });
  // Round 20 #227: the short description is filled automatically from the text when left empty.
  const excerpt = p.excerpt.trim() || autoExcerpt(bodyPlain(p.body));
  if (!excerpt) throw new AppError(422, 'VALIDATION_FAILED', 'NOT_READY', { missing: ['Текст статті'] });
  const pending = p.hasDraft;
  await prisma.$transaction(async (tx) => {
    if (pending || excerpt !== p.excerpt) await applyDoc(tx, id, { ...p, excerpt });
    const t = await tx.postTranslation.findFirstOrThrow({ where: { postId: id, locale: 'uk' } });
    if (!p.publishedAt && t.slug.startsWith('chernetka-')) await tx.postTranslation.update({ where: { id: t.id }, data: { slug: await uniqueSlug(tx, slugify(t.title), id) } });
    // Changes to a live article go out now; scheduling is for articles not yet on the site.
    const future = p.status !== 'PUBLISHED' && when && when.getTime() > Date.now() + 60_000;
    await tx.post.update({ where: { id }, data: future ? { status: 'SCHEDULED', scheduledFor: when } : { status: 'PUBLISHED', publishedAt: p.publishedAt ? undefined : new Date(), scheduledFor: null } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: future ? 'post.scheduled' : pending ? 'post.changes_published' : 'post.published', resourceType: 'Post', resourceId: id, resourceLabel: p.title, after: future ? { scheduledFor: when!.toISOString() } : undefined }, tx);
  });
  void indexNowPost(id); // round 24 G022 (a scheduled article is pinged again when it goes live)
  return getPost(id);
}

export async function setPostStatus(id: string, status: 'DRAFT' | 'ARCHIVED', actor: Actor) {
  const p = await prisma.post.findFirst({ where: { id, deletedAt: null } });
  if (!p) throw new AppError(404, 'NOT_FOUND');
  await prisma.$transaction(async (tx) => {
    // Off the site, the working copy becomes the text: nothing written in the draft is lost.
    if (p.draftDocument) await applyDoc(tx, id, postInput.parse(p.draftDocument));
    await tx.post.update({ where: { id }, data: { status, scheduledFor: null } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: `post.${status === 'ARCHIVED' ? 'archived' : 'unpublished'}`, resourceType: 'Post', resourceId: id }, tx);
  });
}

/** Job `posts.publishScheduled` (26 §26.17, every 5 min). */
export async function publishDue() {
  const due = await prisma.post.findMany({ where: { status: 'SCHEDULED', scheduledFor: { lte: new Date() }, deletedAt: null }, select: { id: true, publishedAt: true } });
  for (const p of due) { await prisma.post.update({ where: { id: p.id }, data: { status: 'PUBLISHED', publishedAt: p.publishedAt ?? new Date(), scheduledFor: null } }); void indexNowPost(p.id); }
  return due.length;
}
