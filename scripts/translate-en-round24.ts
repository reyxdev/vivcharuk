// Round 24 G093 (docs/00-client-decisions-24.md): English is served at launch. This writes the English
// catalogue texts from scripts/data/translations-en.json into the translation tables; run by
// deploy/install.sh after the product batches, on every deploy:
//   npx tsx --env-file=.env scripts/translate-en-round24.ts [--dry]
// Categories, collections, products (name, slug, description, meta), option types and values, attribute
// names and list labels, materials, production stages, journal tags and photo alt texts.
//
// Idempotent: a row already equal to the file is left alone, so a second run writes nothing. Each entry
// keeps the Ukrainian text it was translated from; where the Ukrainian text in the database has changed
// since (Іван edited it in the panel), the entry is skipped with a warning instead of writing a stale
// translation. English rows are owned by this file (the panel edits Ukrainian only); a changed English
// slug of a product or category leaves a 301 from the old address.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../apps/api/src/lib/prisma';

type Tx = Prisma.TransactionClient;
type Meta = { name: string; slug: string; description?: string; metaTitle?: string; metaDescription?: string };
interface File {
  categories: Record<string, { uk: { name: string }; en: Meta }>;
  collections: Record<string, { uk: { name: string }; en: Meta }>;
  products: Record<string, { uk: { name: string; description: string }; en: Meta & { description: string } }>;
  optionTypes: Record<string, { uk: string; en: string }>;
  optionValues: Record<string, { uk: string; en: string }>;
  attributes: Record<string, { uk: { name: string; helpText?: string }; en: { name: string; helpText?: string }; options?: Record<string, { uk: string; en: string }> }>;
  materials: Record<string, string>;
  stages: Record<string, { uk: Record<string, string>; en: Record<string, string> }>;
  tags: Record<string, { uk: string; en: { name: string; slug: string } }>;
  mediaAlt: Record<string, string>;
}

const DRY = process.argv.includes('--dry');
const FILE = path.resolve(import.meta.dirname, 'data/translations-en.json');
const data = JSON.parse(readFileSync(FILE, 'utf8')) as File;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
const hash = (...parts: Array<string | null | undefined>) => createHash('sha1').update(parts.map(norm).join('\n')).digest('hex').slice(0, 16);
const blank = (s: string | undefined) => (s && s.trim() ? s.trim() : null);

const stats = { written: 0, same: 0, skipped: 0, redirects: 0 };
const warn = (msg: string) => { stats.skipped++; console.warn(`translate-en-round24: ${msg}`); };
/** Only the fields that differ, so an unchanged row is never written. */
function diff<T extends Record<string, unknown>>(row: Record<string, unknown> | null, want: T): Partial<T> | null {
  if (!row) return want;
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(want)) if ((row[k] ?? null) !== (v ?? null)) (out as Record<string, unknown>)[k] = v;
  return Object.keys(out).length ? out : null;
}
const count = (changed: boolean) => { if (changed) stats.written++; else stats.same++; };

async function redirect(tx: Tx, from: string, to: string) {
  if (from === to) return;
  await tx.redirect.upsert({ where: { fromPath: from }, create: { fromPath: from, toPath: to }, update: { toPath: to } });
  stats.redirects++;
}

async function categories(tx: Tx) {
  const rows = await tx.category.findMany({ where: { key: { in: Object.keys(data.categories) } }, include: { translations: true } });
  const byId = new Map(rows.map((c) => [c.id, c]));
  const enSlug = (id: string | null) => (id ? byId.get(id)?.translations.find((t) => t.locale === 'en')?.slug : undefined);
  const pathOf = (c: (typeof rows)[number], slug: string) => { const p = c.parentId ? enSlug(c.parentId) : null; return p ? `/en/${p}/${slug}` : `/en/${slug}`; };
  for (const c of rows) {
    const e = data.categories[c.key!]!;
    const uk = c.translations.find((t) => t.locale === 'uk');
    if (!uk || norm(uk.name) !== norm(e.uk.name)) { warn(`category ${c.key}: Ukrainian name is now «${uk?.name}», skipped`); continue; }
    if (!SLUG.test(e.en.slug)) { warn(`category ${c.key}: bad slug «${e.en.slug}»`); continue; }
    const en = c.translations.find((t) => t.locale === 'en') ?? null;
    const want = { name: e.en.name, slug: e.en.slug, description: blank(e.en.description), metaTitle: blank(e.en.metaTitle), metaDescription: blank(e.en.metaDescription), source: 'MACHINE' as const, sourceHash: hash(uk.name, uk.description) };
    const d = diff(en, want);
    count(!!d);
    if (!d || DRY) continue;
    await freeSlug(tx, 'category', e.en.slug, c.id);
    if (en && d.slug) await redirect(tx, pathOf(c, en.slug), pathOf(c, e.en.slug));
    if (en) await tx.categoryTranslation.update({ where: { id: en.id }, data: d });
    else await tx.categoryTranslation.create({ data: { categoryId: c.id, locale: 'en', ...want } });
    // Children read the new parent slug from here.
    if (en) en.slug = e.en.slug; else c.translations.push({ ...want, id: '', categoryId: c.id, locale: 'en' });
  }
  for (const key of Object.keys(data.categories)) if (!rows.some((c) => c.key === key)) console.log(`translate-en-round24: category ${key} not in this database`);
}

/** A slug taken by a row this file will rename later is moved aside first (unique per locale). */
async function freeSlug(tx: Tx, kind: 'category' | 'product' | 'collection' | 'tag', slug: string, ownerId: string) {
  const aside = `${slug}-old-${ownerId.slice(-6)}`;
  if (kind === 'category') {
    const t = await tx.categoryTranslation.findUnique({ where: { locale_slug: { locale: 'en', slug } } });
    if (t && t.categoryId !== ownerId) await tx.categoryTranslation.update({ where: { id: t.id }, data: { slug: aside } });
  } else if (kind === 'product') {
    const t = await tx.productTranslation.findUnique({ where: { locale_slug: { locale: 'en', slug } } });
    if (t && t.productId !== ownerId) await tx.productTranslation.update({ where: { id: t.id }, data: { slug: aside } });
  } else if (kind === 'collection') {
    const t = await tx.collectionTranslation.findUnique({ where: { locale_slug: { locale: 'en', slug } } });
    if (t && t.collectionId !== ownerId) await tx.collectionTranslation.update({ where: { id: t.id }, data: { slug: aside } });
  } else {
    const t = await tx.tagTranslation.findUnique({ where: { locale_slug: { locale: 'en', slug } } });
    if (t && t.tagId !== ownerId) await tx.tagTranslation.update({ where: { id: t.id }, data: { slug: aside } });
  }
}

async function collections(tx: Tx) {
  const rows = await tx.collection.findMany({ where: { key: { in: Object.keys(data.collections) } }, include: { translations: true } });
  for (const c of rows) {
    const e = data.collections[c.key]!;
    const uk = c.translations.find((t) => t.locale === 'uk');
    if (!uk || norm(uk.name) !== norm(e.uk.name)) { warn(`collection ${c.key}: Ukrainian name changed, skipped`); continue; }
    const en = c.translations.find((t) => t.locale === 'en') ?? null;
    const want = { name: e.en.name, slug: e.en.slug, description: blank(e.en.description), metaTitle: blank(e.en.metaTitle), metaDescription: blank(e.en.metaDescription), source: 'MACHINE' as const };
    const d = diff(en, want);
    count(!!d);
    if (!d || DRY) continue;
    await freeSlug(tx, 'collection', e.en.slug, c.id);
    if (en && d.slug) await redirect(tx, `/en/collections/${en.slug}`, `/en/collections/${e.en.slug}`);
    if (en) await tx.collectionTranslation.update({ where: { id: en.id }, data: d });
    else await tx.collectionTranslation.create({ data: { collectionId: c.id, locale: 'en', ...want } });
  }
}

async function products(tx: Tx) {
  const rows = await tx.product.findMany({ where: { sku: { in: Object.keys(data.products) } }, include: { translations: { where: { locale: { in: ['uk', 'en'] } } } } });
  for (const p of rows) {
    const e = data.products[p.sku]!;
    const uk = p.translations.find((t) => t.locale === 'uk');
    if (!uk || norm(uk.name) !== norm(e.uk.name) || norm(uk.description) !== norm(e.uk.description)) { warn(`product ${p.sku}: Ukrainian name or description changed, skipped`); continue; }
    if (!SLUG.test(e.en.slug)) { warn(`product ${p.sku}: bad slug «${e.en.slug}»`); continue; }
    const en = p.translations.find((t) => t.locale === 'en') ?? null;
    const want = { name: e.en.name, slug: e.en.slug, description: e.en.description, metaTitle: blank(e.en.metaTitle), metaDescription: blank(e.en.metaDescription), source: 'MACHINE' as const, sourceHash: hash(uk.name, uk.description) };
    const d = diff(en, want);
    count(!!d);
    if (!d || DRY) continue;
    await freeSlug(tx, 'product', e.en.slug, p.id);
    if (en && d.slug) await redirect(tx, `/en/product/${en.slug}`, `/en/product/${e.en.slug}`);
    if (en) await tx.productTranslation.update({ where: { id: en.id }, data: d });
    else await tx.productTranslation.create({ data: { productId: p.id, locale: 'en', ...want } });
  }
}

async function options(tx: Tx) {
  const types = await tx.optionType.findMany({ include: { translations: true, values: { include: { translations: true } } } });
  for (const ot of types) {
    const e = data.optionTypes[ot.key];
    const uk = ot.translations.find((t) => t.locale === 'uk');
    if (e?.en && uk && norm(uk.name) === norm(e.uk)) {
      const en = ot.translations.find((t) => t.locale === 'en') ?? null;
      const d = diff(en, { name: e.en });
      count(!!d);
      if (d && !DRY) await tx.optionTypeTranslation.upsert({ where: { optionTypeId_locale: { optionTypeId: ot.id, locale: 'en' } }, create: { optionTypeId: ot.id, locale: 'en', name: e.en, source: 'MACHINE' }, update: { name: e.en } });
    } else if (e) warn(`option type ${ot.key}: Ukrainian name changed, skipped`);
    for (const v of ot.values) {
      const ev = data.optionValues[`${ot.key}/${v.key}`];
      if (!ev?.en) continue;
      const vuk = v.translations.find((t) => t.locale === 'uk');
      if (!vuk || norm(vuk.label) !== norm(ev.uk)) { warn(`option ${ot.key}/${v.key}: Ukrainian label changed, skipped`); continue; }
      const en = v.translations.find((t) => t.locale === 'en') ?? null;
      const d = diff(en, { label: ev.en });
      count(!!d);
      if (d && !DRY) await tx.optionValueTranslation.upsert({ where: { optionValueId_locale: { optionValueId: v.id, locale: 'en' } }, create: { optionValueId: v.id, locale: 'en', label: ev.en, source: 'MACHINE' }, update: { label: ev.en } });
    }
  }
}

async function attributes(tx: Tx) {
  const defs = await tx.attributeDefinition.findMany({ where: { key: { in: Object.keys(data.attributes) } }, include: { translations: true } });
  for (const a of defs) {
    const e = data.attributes[a.key]!;
    const uk = a.translations.find((t) => t.locale === 'uk');
    if (!uk || norm(uk.name) !== norm(e.uk.name)) { warn(`attribute ${a.key}: Ukrainian name changed, skipped`); continue; }
    const en = a.translations.find((t) => t.locale === 'en') ?? null;
    const want = { name: e.en.name, helpText: blank(e.en.helpText) };
    const d = diff(en, want);
    count(!!d);
    if (d && !DRY) await tx.attributeDefinitionTranslation.upsert({ where: { definitionId_locale: { definitionId: a.id, locale: 'en' } }, create: { definitionId: a.id, locale: 'en', ...want, source: 'MACHINE' }, update: d });
    // List labels live in the definition's JSON: [{ key, label: { uk, en, … } }].
    if (e.options && Array.isArray(a.options)) {
      const list = a.options as Array<{ key: string; label: Record<string, string> }>;
      let changed = false;
      const next = list.map((o) => {
        const eo = e.options![o.key];
        if (!eo?.en || norm(o.label?.uk) !== norm(eo.uk) || o.label.en === eo.en) return o;
        changed = true;
        return { ...o, label: { ...o.label, en: eo.en } };
      });
      count(changed);
      if (changed && !DRY) await tx.attributeDefinition.update({ where: { id: a.id }, data: { options: next } });
    }
  }
}

async function materials(tx: Tx) {
  const rows = await tx.material.findMany({ include: { translations: true } });
  for (const m of rows) {
    const uk = m.translations.find((t) => t.locale === 'uk');
    const name = uk ? data.materials[uk.name] : undefined;
    if (!name) continue;
    const en = m.translations.find((t) => t.locale === 'en') ?? null;
    const d = diff(en, { name });
    count(!!d);
    if (d && !DRY) await tx.materialTranslation.upsert({ where: { materialId_locale: { materialId: m.id, locale: 'en' } }, create: { materialId: m.id, locale: 'en', name, source: 'MACHINE' }, update: { name } });
  }
}

async function stages(tx: Tx) {
  const rows = await tx.productionStage.findMany({ where: { key: { in: Object.keys(data.stages) } }, include: { translations: true } });
  for (const s of rows) {
    const e = data.stages[s.key]!;
    const uk = s.translations.find((t) => t.locale === 'uk');
    if (!uk || norm(uk.title) !== norm(e.uk.title) || norm(uk.body) !== norm(e.uk.body)) { warn(`stage ${s.key}: Ukrainian text changed, skipped`); continue; }
    const en = s.translations.find((t) => t.locale === 'en') ?? null;
    // A fact slot is English only where the Ukrainian one is filled (null = not stated, never a placeholder).
    const slot = (k: 'duration' | 'temperature' | 'machine' | 'person') => (uk[k] ? blank(e.en[k]) : null);
    const want = { title: e.en.title!, body: e.en.body!, duration: slot('duration'), temperature: slot('temperature'), machine: slot('machine'), person: slot('person'), source: 'MACHINE' as const, sourceHash: hash(uk.title, uk.body) };
    const d = diff(en, want);
    count(!!d);
    if (d && !DRY) await tx.productionStageTranslation.upsert({ where: { stageId_locale: { stageId: s.id, locale: 'en' } }, create: { stageId: s.id, locale: 'en', ...want }, update: d });
  }
}

async function tags(tx: Tx) {
  const rows = await tx.tag.findMany({ where: { key: { in: Object.keys(data.tags) } }, include: { translations: true } });
  for (const tg of rows) {
    const e = data.tags[tg.key]!;
    const uk = tg.translations.find((t) => t.locale === 'uk');
    if (!uk || norm(uk.name) !== norm(e.uk) || !SLUG.test(e.en.slug)) { warn(`tag ${tg.key}: Ukrainian name changed or bad slug, skipped`); continue; }
    const en = tg.translations.find((t) => t.locale === 'en') ?? null;
    const d = diff(en, { name: e.en.name, slug: e.en.slug });
    count(!!d);
    if (!d || DRY) continue;
    await freeSlug(tx, 'tag', e.en.slug, tg.id);
    await tx.tagTranslation.upsert({ where: { tagId_locale: { tagId: tg.id, locale: 'en' } }, create: { tagId: tg.id, locale: 'en', name: e.en.name, slug: e.en.slug, source: 'MACHINE' }, update: d });
  }
}

/** Photo alt texts, matched by their Ukrainian text (the same alt on several photos gets the same English). */
async function alts(tx: Tx) {
  const rows = await tx.mediaTranslation.findMany({ where: { locale: 'uk' }, select: { mediaId: true, alt: true, media: { select: { translations: { where: { locale: 'en' }, select: { id: true, alt: true } } } } } });
  for (const r of rows) {
    const alt = data.mediaAlt[r.alt];
    if (!alt) continue;
    const en = r.media.translations[0] ?? null;
    const d = diff(en, { alt });
    count(!!d);
    if (d && !DRY) await tx.mediaTranslation.upsert({ where: { mediaId_locale: { mediaId: r.mediaId, locale: 'en' } }, create: { mediaId: r.mediaId, locale: 'en', alt, source: 'MACHINE' }, update: { alt } });
  }
}

async function main() {
  await prisma.$transaction(async (tx) => {
    await categories(tx);
    await collections(tx);
    await products(tx);
    await options(tx);
    await attributes(tx);
    await materials(tx);
    await stages(tx);
    await tags(tx);
    await alts(tx);
  }, { timeout: 120_000, maxWait: 10_000 });
  console.log(`translate-en-round24${DRY ? ' (dry run)' : ''}: ${stats.written} written, ${stats.same} already up to date, ${stats.skipped} skipped, ${stats.redirects} redirects`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
