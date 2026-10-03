import { type Locale, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

// All Prisma access for the catalogue module (27 §27.4).

export const PUBLIC_PRODUCT = { status: 'ACTIVE', deletedAt: null, publishedAt: { not: null } } satisfies Prisma.ProductWhereInput;

// Categories hidden in a locale (sheepskin and leather in pl/de, 04 §4.2) and their products 404 there.
export const visibleIn = (locale: Locale) => ({ NOT: { hiddenLocales: { has: locale } } }) satisfies Prisma.CategoryWhereInput;
export const productVisibleIn = (locale: Locale) =>
  ({ categories: { none: { category: { hiddenLocales: { has: locale } } } } }) satisfies Prisma.ProductWhereInput;

export function loadCategories(locales: Locale[]) {
  return prisma.category.findMany({
    where: { isActive: true, deletedAt: null, ...visibleIn(locales[0]!) },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { id: true, key: true, parentId: true, sortOrder: true, isFeatured: true, translations: { where: { locale: { in: locales } }, select: { locale: true, name: true, slug: true, description: true, metaTitle: true, metaDescription: true } } },
  });
}

const mediaSelect = (locales: Locale[]) =>
  ({
    orderBy: { position: 'asc' },
    select: {
      role: true,
      position: true,
      optionValueId: true,
      media: { select: { publicId: true, width: true, height: true, blurhash: true, translations: { where: { locale: { in: locales } }, select: { locale: true, alt: true } } } },
    },
  }) satisfies Prisma.Product$mediaArgs;

/** Category ↔ product links of the products on sale in a locale (round 24 G004–G005: empty categories). */
export function loadPublicCategoryLinks(locale: Locale) {
  return prisma.productCategory.findMany({ where: { product: { ...PUBLIC_PRODUCT, ...productVisibleIn(locale) } }, select: { categoryId: true, productId: true } });
}

/** Candidate rows for a listing scope, with just enough to filter, facet and sort in memory. */
/** Live partner goods (round 22 K13: the site's «Від партнерів» entry shows only while there are some). */
export function countPartnerProducts(locale: Locale) {
  return prisma.product.count({ where: { ...PUBLIC_PRODUCT, ...productVisibleIn(locale), origin: 'PARTNER_MANUFACTURE' } });
}

export function loadListingScope(categoryIds: string[] | null, locales: Locale[]) {
  return prisma.product.findMany({
    where: { ...PUBLIC_PRODUCT, ...productVisibleIn(locales[0]!), ...(categoryIds ? { categories: { some: { categoryId: { in: categoryIds } } } } : {}) },
    select: {
      id: true,
      priceMinMinor: true,
      priceMaxMinor: true,
      currency: true,
      pricingUnit: true,
      inStock: true,
      isHandmade: true,
      isUniquePiece: true,
      origin: true,
      partnerRegion: true,
      publishedAt: true,
      badgeOverride: true,
      translations: { where: { locale: { in: locales } }, select: { locale: true, name: true, slug: true } },
      collections: { select: { collectionId: true, sortOrder: true } },
      variants: {
        where: { isActive: true, deletedAt: null },
        select: { compareAtMinor: true, priceMinor: true, options: { select: { optionValueId: true } } },
      },
      media: { ...mediaSelect(locales), take: 1 },
    },
  });
}

/** Each product's first category (the order the panel keeps), for mixing the homepage rail. */
export async function firstCategoryOf(productIds: string[]) {
  const rows = await prisma.productCategory.findMany({ where: { productId: { in: productIds } }, orderBy: [{ productId: 'asc' }, { sortOrder: 'asc' }], select: { productId: true, categoryId: true } });
  const out = new Map<string, string>();
  for (const r of rows) if (!out.has(r.productId)) out.set(r.productId, r.categoryId);
  return out;
}

/** Variants whose stock has been counted at least once (any stock movement on record). */
export async function countedVariants(variantIds: string[]) {
  const rows = await prisma.stockMovement.groupBy({ by: ['variantId'], where: { variantId: { in: variantIds } } });
  return new Set(rows.map((r) => r.variantId));
}

/** The standard sizes of a template's size library (OptionValue keys «<template>-…» with dimensions). */
export function sizeLibrary(prefix: string, locales: Locale[]) {
  return prisma.optionValue.findMany({
    where: { isHidden: false, key: { startsWith: `${prefix}-` }, optionType: { key: 'size' }, NOT: { dimensions: { equals: Prisma.DbNull } } },
    orderBy: { sortKey: 'asc' },
    select: { key: true, dimensions: true, translations: { where: { locale: { in: locales } }, select: { locale: true, label: true } } },
  });
}

export function loadOptionValues(locales: Locale[]) {
  return prisma.optionValue.findMany({
    where: { isHidden: false },
    orderBy: [{ sortKey: 'asc' }],
    select: {
      id: true,
      key: true,
      hex: true,
      optionType: { select: { key: true, position: true, translations: { where: { locale: { in: locales } }, select: { locale: true, name: true } } } },
      translations: { where: { locale: { in: locales } }, select: { locale: true, label: true } },
    },
  });
}

export function findProductIdBySlug(slug: string, locale: Locale) {
  return prisma.productTranslation.findFirst({
    where: { slug, locale: { in: [locale, 'uk'] }, product: { ...PUBLIC_PRODUCT, ...productVisibleIn(locale) } },
    orderBy: { locale: locale === 'uk' ? 'asc' : 'desc' },
    select: { productId: true },
  });
}

export function loadProductDetail(id: string, locales: Locale[]) {
  return prisma.product.findFirst({
    where: { id, ...PUBLIC_PRODUCT },
    include: {
      translations: { where: { locale: { in: locales } } },
      categories: { include: { category: { include: { translations: { where: { locale: { in: locales } } } } } } },
      variants: {
        where: { isActive: true, deletedAt: null },
        orderBy: { position: 'asc' },
        include: {
          options: {
            include: {
              optionValue: {
                include: {
                  optionType: { select: { key: true } },
                  translations: { where: { locale: { in: locales } } },
                },
              },
            },
          },
        },
      },
      media: mediaSelect(locales),
      attributes: { include: { definition: { include: { translations: { where: { locale: { in: locales } } } } } } },
      composition: { include: { material: { include: { translations: { where: { locale: { in: locales } } } } } } },
    },
  });
}

// Ukrainian endings stripped before prefix matching, so «ліжники» finds «ліжник» and «подушок»
// finds «подушка». The FTS configuration is `simple` (no Ukrainian stemmer ships with Postgres).
const ENDINGS = /(ами|ями|ові|еві|ого|ому|ими|ів|ей|ам|ям|ах|ях|ою|ею|ом|ем|ий|ій|ої|ок|а|я|и|і|ї|у|ю|о|е|є)$/u;
export function searchTerms(q: string) {
  return q.toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 2).slice(0, 6)
    .map((w) => (w.length >= 5 ? w.replace(ENDINGS, '') : w));
}

// Round 10 part 3 #25: Latin typed for Ukrainian (lizhnyk → ліжник) and the words foreign buyers
// use (koc, blanket, Decke). Longest Latin clusters first so «shch» is not read as «s»+«h»…
const LATIN: Array<[string, string]> = [
  ['shch', 'щ'], ['zh', 'ж'], ['kh', 'х'], ['ts', 'ц'], ['ch', 'ч'], ['sh', 'ш'], ['ya', 'я'], ['ia', 'я'], ['yu', 'ю'], ['iu', 'ю'],
  ['ye', 'є'], ['ie', 'є'], ['yi', 'ї'], ['a', 'а'], ['b', 'б'], ['v', 'в'], ['h', 'г'], ['g', 'ґ'], ['d', 'д'], ['e', 'е'], ['z', 'з'],
  ['y', 'и'], ['i', 'і'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'],
  ['u', 'у'], ['f', 'ф'], ['c', 'к'], ['w', 'в'], ['x', 'кс'], ['q', 'к'], ['j', 'й'],
];
export function latinToCyrillic(q: string) {
  let out = '';
  const s = q.toLowerCase();
  for (let i = 0; i < s.length;) {
    const hit = LATIN.find(([l]) => s.startsWith(l, i));
    if (hit) { out += hit[1]; i += hit[0].length; } else { out += s[i]; i++; }
  }
  return out;
}
const SYNONYMS: Record<string, string> = {
  blanket: 'ліжник плед ковдра', plaid: 'плед', throw: 'плед', rug: 'ліжник', yarn: 'пряжа', wool: 'вовна', socks: 'шкарпетки',
  slippers: 'капці', sheepskin: 'овчина', pillow: 'подушка', cushion: 'подушка', vest: 'камізелька', belt: 'пояс', leather: 'шкіра',
  bag: 'сумка', wallet: 'гаманець', koc: 'плед ліжник', welna: 'вовна', 'wełna': 'вовна', skarpety: 'шкарпетки', skarpetki: 'шкарпетки',
  kapcie: 'капці', poduszka: 'подушка', 'włóczka': 'пряжа', wloczka: 'пряжа', kamizelka: 'камізелька', pasek: 'пояс', 'skóra': 'шкіра',
  decke: 'ковдра плед ліжник', wolldecke: 'ліжник ковдра', wolle: 'вовна', garn: 'пряжа', socken: 'шкарпетки', hausschuhe: 'капці',
  pantoffeln: 'капці', schaffell: 'овчина', lammfell: 'овчина', kissen: 'подушка', weste: 'камізелька', 'gürtel': 'пояс', leder: 'шкіра',
};
/** The query as typed plus its Cyrillic reading and translated words, each searched separately. */
export function expandQuery(q: string) {
  const out = new Set([q]);
  if (/[a-z]/i.test(q)) out.add(latinToCyrillic(q));
  for (const w of q.toLowerCase().split(/\s+/)) for (const x of (SYNONYMS[w] ?? '').split(' ').filter(Boolean)) out.add(x);
  return [...out].slice(0, 6);
}

/** Fallback when nothing matches: trigram similarity of the query to product names (typos). */
export async function trigramRanks(q: string, locales: Locale[]) {
  const variants = [...new Set([q, ...(/[a-z]/i.test(q) ? [latinToCyrillic(q)] : [])].map((x) => x.toLowerCase()))];
  const rows = await prisma.$queryRaw<Array<{ id: string; rank: number }>>`
    SELECT t."productId" AS id, max(word_similarity(v, lower(t.name)))::float8 AS rank
    FROM "ProductTranslation" t CROSS JOIN unnest(${variants}::text[]) AS v
    WHERE t.locale::text = ANY(${locales}::text[]) AND word_similarity(v, lower(t.name)) >= 0.4
    GROUP BY 1`;
  return new Map(rows.map((r) => [r.id, r.rank]));
}

/** Product ids matching the query, with a relevance score: name/description FTS, SKU, «Інші назви». */
export async function searchRanks(q: string, locales: Locale[]) {
  const merged = new Map<string, number>();
  for (const m of await Promise.all(expandQuery(q).map((x) => searchRanksOne(x, locales)))) for (const [id, r] of m) merged.set(id, Math.max(merged.get(id) ?? 0, r));
  return merged.size ? merged : trigramRanks(q, locales);
}

async function searchRanksOne(q: string, locales: Locale[]) {
  const terms = searchTerms(q);
  if (!terms.length) return new Map<string, number>();
  const tsq = terms.map((t) => `${t}:*`).join(' & ');
  const like = `%${q.trim()}%`;
  const rows = await prisma.$queryRaw<Array<{ id: string; rank: number }>>`
    SELECT p.id, max(
      CASE WHEN t."searchVector" @@ to_tsquery('simple', immutable_unaccent(${tsq})) THEN ts_rank(t."searchVector", to_tsquery('simple', immutable_unaccent(${tsq}))) ELSE 0 END
      + CASE WHEN p.sku ILIKE ${like} OR EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId" = p.id AND v.sku ILIKE ${like}) THEN 1 ELSE 0 END
      + CASE WHEN EXISTS (SELECT 1 FROM unnest(p."searchSynonyms") s WHERE s ILIKE ${like}) THEN 0.5 ELSE 0 END
    )::float8 AS rank
    FROM "Product" p JOIN "ProductTranslation" t ON t."productId" = p.id AND t.locale::text = ANY(${locales}::text[])
    GROUP BY p.id`;
  return new Map(rows.filter((r) => r.rank > 0).map((r) => [r.id, r.rank]));
}

export function findCollection(slug: string, locales: Locale[]) {
  return prisma.collection.findFirst({ where: { isActive: true, translations: { some: { slug, locale: { in: locales } } } }, include: { translations: { where: { locale: { in: locales } } } } });
}
