import { Prisma, type ProductStatus } from '@prisma/client';
import { type ProductDoc, productDoc, type Readiness, slugify } from '@vivcharyk/schemas';
import { config } from '../../config';
import { AppError, forbidden } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { templateDrafts } from './drafts';
import { listPhotos, photoUrl } from './media';
import { indexNowProduct } from '../seo/indexnow';

type Actor = { id: string; email: string; permissions: Set<string> };

// Product SKU = VCH-<type>-<number> (00-client-decisions-12 V7); variant SKU adds size and colour codes.
const TYPE_CODE: Record<string, string> = {
  lizhnyk: 'LZ', podushka: 'PD', odyah: 'OD', shkarpetky: 'SH', kaptsi: 'KP',
  priazha: 'PR', ovchyna: 'OV', 'shkiriani-vyroby': 'SK', poias: 'PS', derevo: 'DR',
};
const VALUE_CODE: Record<string, string> = { chervonyi: 'CR', chornyi: 'CH' };

const uk = <T extends { locale: string }>(rows: T[]) => rows.find((r) => r.locale === 'uk');

// ---------------------------------------------------------------------------------------------
// Reference data for the editor

export async function templates() {
  const [rows, drafts] = await Promise.all([
    prisma.productTemplate.findMany({
      orderBy: { createdAt: 'asc' },
      include: { attributes: { orderBy: { sortOrder: 'asc' }, include: { attribute: { include: { translations: true } } } } },
    }),
    templateDrafts(),
  ]);
  return rows.map((t) => ({
    draft: drafts[t.key]!,
    id: t.id, key: t.key, typePrefix: t.typePrefix, axes: t.axes, pricingUnits: t.pricingUnits, requiredFields: t.requiredFields,
    storyStages: t.storyStages, defaultCategoryId: t.defaultCategoryId, isHidden: t.isHidden, skuCode: TYPE_CODE[t.key] ?? 'XX',
    attributes: t.attributes.map((a) => ({
      id: a.attribute.id, key: a.attribute.key, dataType: a.attribute.dataType, unit: a.attribute.unit, isRequired: a.isRequired,
      name: uk(a.attribute.translations)?.name ?? a.attribute.key,
      options: (a.attribute.options as Array<{ key: string; label: Record<string, string> }> | null)?.map((o) => ({ key: o.key, label: o.label.uk ?? o.key })) ?? null,
    })),
  }));
}

export async function libraries() {
  const [values, materials, categories, collections, photos] = await Promise.all([
    prisma.optionValue.findMany({ orderBy: [{ sortKey: 'asc' }, { position: 'asc' }], include: { optionType: true, translations: true } }),
    prisma.material.findMany({ include: { translations: true } }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }], include: { translations: true, heroMedia: { select: { publicId: true } } } }),
    prisma.collection.findMany({ orderBy: { sortOrder: 'asc' }, include: { translations: { where: { locale: 'uk' } } } }),
    // Category tiles of the new-product steps (round 20 #155): the category's own picture, else the
    // main photo of a product in it.
    prisma.productCategory.findMany({
      where: { product: { deletedAt: null, media: { some: { media: { provider: 'local' } } } } },
      orderBy: { sortOrder: 'asc' },
      select: { categoryId: true, product: { select: { media: { where: { media: { provider: 'local' } }, orderBy: { position: 'asc' }, take: 1, select: { media: { select: { publicId: true } } } } } } },
    }),
  ]);
  const photoOf = new Map<string, string>();
  for (const r of photos) { const m = r.product.media[0]; if (m && !photoOf.has(r.categoryId)) photoOf.set(r.categoryId, m.media.publicId); }
  const imageOf = (c: (typeof categories)[number]) => {
    const own = c.heroMedia?.publicId && photoUrl(c.heroMedia.publicId);
    if (own) return own;
    const id = photoOf.get(c.id) ?? categories.filter((x) => x.parentId === c.id).map((x) => photoOf.get(x.id)).find(Boolean);
    return id ? photoUrl(id) : null;
  };
  // Colour and pattern SKU codes must be unique within their list: the first two letters, or the
  // first letter plus a later one when that pair is taken by a value earlier in the list.
  const codes = new Map<string, string>();
  for (const type of ['color', 'pattern']) {
    const taken = new Set<string>();
    for (const v of values.filter((x) => x.optionType.key === type)) {
      const k = v.key.toUpperCase().replace(/[^A-Z]/g, '');
      const cands = [VALUE_CODE[v.key], k.slice(0, 2), ...[...k.slice(2)].map((c) => k[0] + c)].filter((c): c is string => !!c && c.length === 2);
      const code = cands.find((c) => !taken.has(c)) ?? `${k[0] ?? 'X'}${taken.size}`;
      taken.add(code); codes.set(v.id, code);
    }
  }
  const value = (v: (typeof values)[number]) => {
    const tpl = v.optionType.key === 'size' ? v.key.slice(0, v.key.indexOf('-')) : null;
    // Size keys are "<template>-<value>", e.g. lizhnyk-150x200, poias-90.
    const own = tpl ? v.key.slice(tpl.length + 1) : v.key;
    return {
      id: v.id, key: v.key, label: uk(v.translations)?.label ?? own, hex: v.hex, isHidden: v.isHidden, dimensions: v.dimensions,
      skuCode: tpl ? own.toUpperCase() : codes.get(v.id)!,
    };
  };
  const sizes: Record<string, ReturnType<typeof value>[]> = {};
  for (const v of values.filter((x) => x.optionType.key === 'size')) {
    const tpl = v.key.startsWith('shkiriani-vyroby-') ? 'shkiriani-vyroby' : v.key.slice(0, v.key.indexOf('-'));
    (sizes[tpl] ??= []).push(value(v));
  }
  return {
    sizes,
    colors: values.filter((x) => x.optionType.key === 'color').map((v) => ({ ...value(v), colorFamily: v.colorFamily, isNaturalUndyed: v.isNaturalUndyed })),
    patterns: values.filter((x) => x.optionType.key === 'pattern').map(value),
    materials: materials.map((m) => ({ id: m.id, group: m.group, name: uk(m.translations)?.name ?? m.id, isHidden: m.isHidden })),
    categories: categories.map((c) => ({
      id: c.id, key: c.key, parentId: c.parentId, name: uk(c.translations)?.name ?? c.key ?? c.id, isActive: c.isActive,
      image: imageOf(c), ratePerSqmMinor: c.defaultCustomSizeRatePerSqmMinor,
    })),
    collections: collections.map((c) => ({ id: c.id, name: c.translations[0]?.name ?? c.key, isActive: c.isActive })),
    mediaEnabled: config.media.enabled,
  };
}

// ---------------------------------------------------------------------------------------------
// List (round 20 #119–121): tabs with counts, search, filters, sort by any column, more on scroll.
// A shop of this size has hundreds of products, so the list is computed in memory: a draft that was
// never published lives only in its document, and its price, stock and category come from there.

export const LIST_TABS = ['all', 'active', 'draft', 'hidden', 'low', 'out'] as const;
export const LIST_SORTS = ['updated', 'name', 'sku', 'price', 'stock', 'sold'] as const;
export interface ListOptions {
  tab: (typeof LIST_TABS)[number]; q?: string; sort: (typeof LIST_SORTS)[number]; dir: 'asc' | 'desc'; page: number; perPage: number;
  category?: string[]; collection?: string[]; color?: string[]; material?: string[]; priceFrom?: number; priceTo?: number;
  custom?: boolean; nophoto?: boolean; origin?: 'own' | 'partner';
}

export async function listProducts(o: ListOptions) {
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [rows, sold, cats] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true, sku: true, status: true, origin: true, pricingUnit: true, publishedAt: true, updatedAt: true, draftDocument: true,
        allowsCustomSize: true, isUniquePiece: true, searchSynonyms: true,
        template: { select: { key: true } },
        translations: { where: { locale: 'uk' }, select: { name: true, slug: true } },
        variants: { where: { deletedAt: null }, orderBy: { position: 'asc' }, select: { id: true, sku: true, priceMinor: true, stockQty: true, isActive: true, madeToOrderDays: true, options: { select: { optionValueId: true } } } },
        categories: { orderBy: { sortOrder: 'asc' }, select: { categoryId: true } },
        collections: { select: { collectionId: true } },
        composition: { select: { materialId: true } },
        media: { orderBy: { position: 'asc' }, take: 1, select: { media: { select: { publicId: true } } } },
        _count: { select: { media: true } },
      },
    }),
    prisma.$queryRaw<Array<{ productId: string; qty: bigint }>>`
      SELECT v."productId", SUM(oi."quantityMilli") AS qty
      FROM "OrderItem" oi JOIN "ProductVariant" v ON v.id = oi."variantId" JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."placedAt" >= ${monthStart} AND o.status NOT IN ('CANCELLED', 'RETURNED')
      GROUP BY 1`,
    prisma.category.findMany({ where: { deletedAt: null }, select: { id: true, parentId: true, translations: { where: { locale: 'uk' }, select: { name: true } } } }),
  ]);
  const soldBy = new Map(sold.map((s) => [s.productId, Math.round(Number(s.qty) / 1000)]));
  const catName = new Map(cats.map((c) => [c.id, c.translations[0]?.name ?? '']));

  const all = rows.map((p) => {
    const draft = p.draftDocument as ProductDoc | null;
    const fromDraft = !p.publishedAt && !!draft; // never published: the draft is the product
    const variants = fromDraft
      ? draft!.variants.map((v, index) => ({ id: v.id ?? null, index, sku: v.sku, priceMinor: v.priceMinor, stockQty: v.stockQty, isActive: v.isActive, madeToOrderDays: v.madeToOrderDays, options: v.optionValueIds }))
      : p.variants.map((v, index) => ({ id: v.id as string | null, index, sku: v.sku, priceMinor: v.priceMinor, stockQty: v.stockQty, isActive: v.isActive, madeToOrderDays: v.madeToOrderDays, options: v.options.map((x) => x.optionValueId) }));
    const active = variants.filter((v) => v.isActive);
    const prices = active.map((v) => v.priceMinor).filter((x) => x > 0);
    const categoryIds = fromDraft ? draft!.categoryIds : p.categories.map((c) => c.categoryId);
    const allowsCustomSize = fromDraft ? draft!.allowsCustomSize : p.allowsCustomSize;
    const onSite = p.status === 'ACTIVE';
    const quick = variants.length === 1 ? { variantId: variants[0]!.id, index: 0 } : null;
    return {
      row: {
        id: p.id, sku: p.sku, status: p.status, origin: fromDraft ? draft!.origin : p.origin, template: p.template.key,
        name: draft?.name || uk2(p.translations)?.name || '',
        slug: p.publishedAt ? uk2(p.translations)?.slug ?? null : null,
        thumb: p.media[0] ? photoUrl(p.media[0].media.publicId) : null,
        photoCount: p._count.media,
        category: categoryIds[0] ? catName.get(categoryIds[0]) ?? null : null,
        priceMinMinor: prices.length ? Math.min(...prices) : 0, priceMaxMinor: prices.length ? Math.max(...prices) : 0, pricingUnit: p.pricingUnit,
        stock: active.reduce((a, v) => a + v.stockQty, 0), variantCount: variants.length, quick,
        madeToOrder: active.some((v) => !!v.madeToOrderDays),
        soldMonth: soldBy.get(p.id) ?? 0, hasDraft: draft !== null, publishedAt: p.publishedAt?.toISOString() ?? null, updatedAt: p.updatedAt.toISOString(),
      },
      // Same rule as the home to-do «Закінчується» (/products?tab=low): a size or colour at 1 or 0.
      low: onSite && !p.isUniquePiece && active.some((v) => v.madeToOrderDays === null && v.stockQty <= 1),
      out: onSite && !allowsCustomSize && !active.some((v) => v.stockQty > 0 || !!v.madeToOrderDays),
      search: [p.sku, draft?.name ?? '', uk2(p.translations)?.name ?? '', ...variants.map((v) => v.sku), ...p.searchSynonyms].join(' ').toLowerCase(),
      categoryIds, collectionIds: fromDraft ? draft!.collectionIds : p.collections.map((c) => c.collectionId),
      colorIds: variants.flatMap((v) => v.options), materialIds: fromDraft ? draft!.composition.map((c) => c.materialId) : p.composition.map((c) => c.materialId),
      allowsCustomSize,
    };
  });

  // A chosen category takes its subcategories with it.
  const catSet = o.category?.length ? new Set([...o.category, ...cats.filter((c) => c.parentId && o.category!.includes(c.parentId)).map((c) => c.id)]) : null;
  const words = o.q?.trim().toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  const any = (have: string[], want?: string[]) => !want?.length || have.some((x) => want.includes(x));
  const filtered = all.filter((x) =>
    words.every((w) => x.search.includes(w))
    && (!catSet || x.categoryIds.some((c) => catSet.has(c)))
    && any(x.collectionIds, o.collection) && any(x.colorIds, o.color) && any(x.materialIds, o.material)
    && (o.priceFrom === undefined || x.row.priceMaxMinor >= o.priceFrom * 100)
    && (o.priceTo === undefined || (x.row.priceMinMinor > 0 && x.row.priceMinMinor <= o.priceTo * 100))
    && (!o.custom || x.allowsCustomSize) && (!o.nophoto || x.row.photoCount === 0)
    && (!o.origin || (o.origin === 'partner') === (x.row.origin === 'PARTNER_MANUFACTURE')));

  const inTab: Record<ListOptions['tab'], (x: (typeof all)[number]) => boolean> = {
    all: () => true, active: (x) => x.row.status === 'ACTIVE', draft: (x) => x.row.status === 'DRAFT', hidden: (x) => x.row.status === 'ARCHIVED', low: (x) => x.low, out: (x) => x.out,
  };
  const counts = Object.fromEntries(LIST_TABS.map((t) => [t, filtered.filter(inTab[t]).length])) as Record<ListOptions['tab'], number>;
  const key: Record<ListOptions['sort'], (r: (typeof all)[number]['row']) => string | number> = {
    updated: (r) => r.updatedAt, name: (r) => r.name.toLowerCase(), sku: (r) => r.sku, price: (r) => r.priceMinMinor, stock: (r) => r.stock, sold: (r) => r.soldMonth,
  };
  const k = key[o.sort];
  const items = filtered.filter(inTab[o.tab]).map((x) => x.row)
    .sort((a, b) => { const x = k(a), y = k(b); const c = typeof x === 'number' ? x - (y as number) : String(x).localeCompare(String(y), 'uk'); return o.dir === 'asc' ? c : -c; });
  const start = (o.page - 1) * o.perPage;
  return {
    items: items.slice(start, start + o.perPage),
    page: { number: o.page, perPage: o.perPage, total: items.length, hasMore: start + o.perPage < items.length },
    counts,
  };
}
const uk2 = <T,>(rows: T[]) => rows[0];

// ---------------------------------------------------------------------------------------------
// Document <-> live tables

const productInclude = {
  translations: true,
  template: true,
  categories: { orderBy: { sortOrder: 'asc' } },
  collections: true,
  composition: true,
  attributes: { include: { definition: true } },
  media: true,
  variants: { where: { deletedAt: null }, orderBy: { position: 'asc' }, include: { options: true } },
} satisfies Prisma.ProductInclude;
type FullProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function docFromLive(p: FullProduct): ProductDoc {
  const t = uk(p.translations);
  return {
    name: t?.name ?? '', description: t?.description ?? '', metaTitle: t?.metaTitle ?? null, metaDescription: t?.metaDescription ?? null,
    searchSynonyms: p.searchSynonyms, categoryIds: p.categories.map((c) => c.categoryId), collectionIds: p.collections.map((c) => c.collectionId), origin: p.origin,
    partnerName: p.partnerName, partnerRegion: p.partnerRegion, pricingUnit: p.pricingUnit, isHandmade: p.isHandmade,
    isUniquePiece: p.isUniquePiece, woolOrigin: p.woolOrigin, storyStagesOff: p.storyStagesOff, allowsCustomSize: p.allowsCustomSize,
    customSize: {
      ratePerSqmMinor: p.customSizeRatePerSqmMinor, minPriceMinor: p.customSizeMinPriceMinor,
      minWidthCm: p.customSizeMinWidthCm, maxWidthCm: p.customSizeMaxWidthCm, minLengthCm: p.customSizeMinLengthCm, maxLengthCm: p.customSizeMaxLengthCm,
      madeToOrderDays: p.madeToOrderDays,
    },
    composition: p.composition.map((c) => ({ materialId: c.materialId, role: c.role, percent: c.percent })),
    attributes: p.attributes.map((a) => ({ definitionId: a.definitionId, value: a.valueText ?? (a.valueNumber !== null ? String(a.valueNumber) : a.valueBool !== null ? String(a.valueBool) : '') })),
    variants: p.variants.map((v) => ({
      id: v.id, sku: v.sku, optionValueIds: v.options.map((o) => o.optionValueId), priceMinor: v.priceMinor, compareAtMinor: v.compareAtMinor,
      stockQty: v.stockQty, madeToOrderDays: v.madeToOrderDays, weightGrams: v.weightGrams, packedWeightGrams: v.packedWeightGrams,
      packedLengthCm: v.packedLengthCm, packedWidthCm: v.packedWidthCm, packedHeightCm: v.packedHeightCm, isMainColor: v.isMainColor, isActive: v.isActive,
    })),
  };
}

/**
 * The readiness meter: one item per template-required field (37 §37.4). Round 20 #126: only photo,
 * name, price, category and size (where the template requires sizes) block publishing; the other
 * template fields stay on the list as advice. Partner name, custom-size limits and unique SKUs still
 * block — the site and the database need them.
 */
const BLOCKING = new Set(['name', 'price', 'size', 'photo', 'category']);
export function readiness(doc: ProductDoc, required: string[], photoCount: number, requiredAttrs: Array<{ id: string; name: string }> = []): Readiness & { items: Array<{ key: string; label: string; ok: boolean; blocking: boolean }> } {
  const active = doc.variants.filter((v) => v.isActive);
  const base = [
    { key: 'photo', label: 'Фото', ok: photoCount >= 1 },
    { key: 'category', label: 'Категорія', ok: doc.categoryIds.length > 0 },
  ].map((i) => ({ ...i, blocking: true }));
  const items = [...base, ...required.map((key) => {
    switch (key) {
      case 'name': return { key, label: 'Назва', ok: doc.name.trim().length >= 3 };
      case 'price': return { key, label: 'Ціна кожного варіанта', ok: active.length > 0 && active.every((v) => v.priceMinor > 0) };
      case 'size': return { key, label: 'Розміри', ok: active.length > 0 && active.every((v) => v.optionValueIds.length > 0) };
      case 'color': return { key, label: 'Кольори', ok: active.length > 0 };
      case 'composition': {
        const roles = new Map<string, number>();
        for (const c of doc.composition) roles.set(c.role, (roles.get(c.role) ?? 0) + c.percent);
        return { key, label: 'Склад 100 %', ok: roles.size > 0 && [...roles.values()].every((s) => s === 100) };
      }
      case 'description': return { key, label: 'Опис', ok: doc.description.trim().length >= 40 };
      case 'packedWeight': return { key, label: 'Вага в упаковці', ok: active.length > 0 && active.every((v) => (v.packedWeightGrams ?? 0) > 0) };
      default: {
        const m = /^photos>=(\d+)$/.exec(key);
        if (m) return Number(m[1]) > 1 ? { key, label: `Бажано ${m[1]} фото`, ok: photoCount >= Number(m[1]) } : null;
        return null;
      }
    }
  }).filter((i): i is { key: string; label: string; ok: boolean } => i !== null).map((i) => ({ ...i, blocking: BLOCKING.has(i.key) }))];
  if (doc.origin === 'PARTNER_MANUFACTURE') items.push({ key: 'partnerName', label: 'Назва партнера', ok: !!doc.partnerName?.trim(), blocking: true });
  // Characteristics the template marks required (e.g. measured length and width of a sheepskin): advice since round 20 #126.
  for (const a of requiredAttrs) items.push({ key: `attr:${a.id}`, label: a.name, ok: doc.attributes.some((x) => x.definitionId === a.id && x.value.trim() !== ''), blocking: false });
  if (doc.allowsCustomSize) {
    const c = doc.customSize;
    items.push({ key: 'customSize', label: 'Свій розмір: ставка, мінімум і межі', ok: !!c.ratePerSqmMinor && !!c.minPriceMinor && !!c.minWidthCm && !!c.maxWidthCm && !!c.minLengthCm && !!c.maxLengthCm && c.minWidthCm <= c.maxWidthCm && c.minLengthCm <= c.maxLengthCm, blocking: true });
  }
  const skus = doc.variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) items.push({ key: 'sku', label: 'Артикули не повторюються', ok: false, blocking: true });
  return { done: items.filter((i) => i.ok).length, total: items.length, missing: items.filter((i) => !i.ok && i.blocking).map((i) => i.label), items };
}

async function requiredAttrs(templateId: string) {
  const rows = await prisma.productTemplateAttribute.findMany({ where: { templateId, isRequired: true }, orderBy: { sortOrder: 'asc' }, include: { attribute: { include: { translations: { where: { locale: 'uk' } } } } } });
  return rows.map((r) => ({ id: r.attributeId, name: r.attribute.translations[0]?.name ?? r.attribute.key }));
}

async function load(id: string) {
  const p = await prisma.product.findFirst({ where: { id, deletedAt: null }, include: productInclude });
  if (!p) throw new AppError(404, 'PRODUCT_NOT_FOUND');
  return p;
}

export async function getProduct(id: string) {
  const p = await load(id);
  const document = (p.draftDocument as ProductDoc | null) ?? docFromLive(p);
  const revisions = await prisma.productRevision.findMany({ where: { productId: id }, orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, createdAt: true, publishedAt: true, createdById: true } });
  return {
    id: p.id, sku: p.sku, status: p.status, templateKey: p.template.key, currency: p.currency,
    slug: p.publishedAt ? uk(p.translations)?.slug ?? null : null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    hasDraft: p.draftDocument !== null,
    draftUpdatedAt: p.draftUpdatedAt?.toISOString() ?? null,
    photoCount: p.media.length,
    photos: await listPhotos(p.id),
    origin: p.origin,
    document,
    readiness: readiness(document, p.template.requiredFields, p.media.length, await requiredAttrs(p.templateId)),
    revisions: revisions.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString(), publishedAt: r.publishedAt?.toISOString() ?? null })),
  };
}

// ---------------------------------------------------------------------------------------------
// Create

export async function createProduct(input: { templateKey: string; name: string; categoryId?: string; origin: ProductDoc['origin'] }, actor: Actor) {
  if (input.origin === 'PARTNER_MANUFACTURE' && !actor.permissions.has('products.manage_origin')) throw forbidden();
  const t = await prisma.productTemplate.findUnique({ where: { key: input.templateKey } });
  if (!t) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'templateKey', code: 'NOT_FOUND' }]);
  const code = TYPE_CODE[t.key] ?? 'XX';
  // SKUs are editable (round 20 #157), so only the numeric ones count.
  const taken = await prisma.product.findMany({ where: { sku: { startsWith: `VCH-${code}-` } }, select: { sku: true } });
  const nums = taken.map((x) => /^VCH-[A-Z]+-(\d+)$/.exec(x.sku)?.[1]).filter(Boolean).map(Number);
  const n = nums.length ? Math.max(...nums) + 1 : 101;
  const sku = `VCH-${code}-${String(n).padStart(4, '0')}`;
  const doc: ProductDoc = productDoc.parse({
    name: input.name, description: '', categoryIds: [input.categoryId ?? t.defaultCategoryId].filter(Boolean), origin: input.origin,
    pricingUnit: t.pricingUnits[0] ?? 'PIECE', isHandmade: input.origin === 'OWN_MANUFACTURE', variants: [],
  });
  const p = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        sku, status: 'DRAFT', pricingUnit: doc.pricingUnit, origin: doc.origin, priceMinMinor: 0, priceMaxMinor: 0, templateId: t.id,
        isHandmade: doc.isHandmade, productionStage: [], searchSynonyms: [], pinnedRelatedIds: [], storyStagesOff: [],
        draftDocument: doc as unknown as Prisma.InputJsonValue, draftUpdatedAt: new Date(), draftUpdatedById: actor.id,
        // The uk row exists from the start (the slug is a placeholder until the first publish, 37 §37.5).
        translations: { create: { locale: 'uk', name: input.name, slug: `chernetka-${sku.toLowerCase()}`, description: '' } },
      },
    });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.created', resourceType: 'Product', resourceId: created.id, resourceLabel: sku }, tx);
    return created;
  });
  return { id: p.id, sku };
}

// ---------------------------------------------------------------------------------------------
// Draft

/** Field-level permissions (24 §24.4): price, stock, origin and custom size need their own keys. */
function checkFieldPermissions(before: ProductDoc, after: ProductDoc, perms: Set<string>) {
  const byId = new Map(before.variants.filter((v) => v.id).map((v) => [v.id!, v]));
  const priceChanged = after.variants.some((v) => { const b = v.id ? byId.get(v.id) : undefined; return b ? b.priceMinor !== v.priceMinor || b.compareAtMinor !== v.compareAtMinor : v.priceMinor > 0; });
  const stockChanged = after.variants.some((v) => { const b = v.id ? byId.get(v.id) : undefined; return b ? b.stockQty !== v.stockQty : v.stockQty > 0; });
  const customChanged = before.allowsCustomSize !== after.allowsCustomSize || JSON.stringify(before.customSize) !== JSON.stringify(after.customSize);
  const originChanged = before.origin !== after.origin || before.partnerName !== after.partnerName;
  const denied = [
    priceChanged && !perms.has('products.manage_price') && 'products.manage_price',
    stockChanged && !perms.has('products.manage_stock') && 'products.manage_stock',
    customChanged && !perms.has('products.manage_custom_size') && 'products.manage_custom_size',
    originChanged && !perms.has('products.manage_origin') && 'products.manage_origin',
  ].filter(Boolean);
  if (denied.length) throw new AppError(403, 'PERMISSION_DENIED', undefined, { permissions: denied });
}

export async function saveDraft(id: string, raw: unknown, actor: Actor) {
  const doc = productDoc.parse(raw);
  const p = await load(id);
  const before = (p.draftDocument as ProductDoc | null) ?? docFromLive(p);
  checkFieldPermissions(before, doc, actor.permissions);
  const at = new Date();
  await prisma.product.update({ where: { id }, data: { draftDocument: doc as unknown as Prisma.InputJsonValue, draftUpdatedAt: at, draftUpdatedById: actor.id } });
  return { savedAt: at.toISOString(), readiness: readiness(doc, p.template.requiredFields, p.media.length, await requiredAttrs(p.templateId)) };
}

export async function discardDraft(id: string, actor: Actor) {
  const p = await load(id);
  // A never-published product has nothing to fall back to.
  if (!p.publishedAt) throw new AppError(409, 'VALIDATION_FAILED', 'NEVER_PUBLISHED');
  await prisma.product.update({ where: { id }, data: { draftDocument: Prisma.DbNull, draftUpdatedAt: null, draftUpdatedById: null } });
  await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.draft_discarded', resourceType: 'Product', resourceId: id, resourceLabel: p.sku });
}

/** «Повернути»: an old revision becomes the draft; nothing on the site changes until publish. */
export async function revertTo(id: string, revisionId: string, actor: Actor) {
  const r = await prisma.productRevision.findFirst({ where: { id: revisionId, productId: id } });
  if (!r) throw new AppError(404, 'NOT_FOUND');
  const doc = productDoc.parse(r.snapshot);
  const p = await load(id);
  // Variants deleted since that revision come back as new rows.
  const live = new Set(p.variants.map((v) => v.id));
  doc.variants = doc.variants.map((v) => (v.id && !live.has(v.id) ? { ...v, id: undefined } : v));
  await prisma.product.update({ where: { id }, data: { draftDocument: doc as unknown as Prisma.InputJsonValue, draftUpdatedAt: new Date(), draftUpdatedById: actor.id } });
  await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.reverted', resourceType: 'Product', resourceId: id, resourceLabel: p.sku, after: { revisionId } });
}

// ---------------------------------------------------------------------------------------------
// Publish

async function uniqueSlug(tx: Prisma.TransactionClient, base: string, productId: string) {
  const root = base || 'tovar';
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? root : `${root}-${i + 1}`;
    const clash = await tx.productTranslation.findFirst({ where: { locale: 'uk', slug, productId: { not: productId } }, select: { id: true } });
    if (!clash) return slug;
  }
  return `${root}-${productId.slice(-6)}`;
}

function attrData(dataType: string, value: string) {
  if (dataType === 'NUMBER') { const n = Number(value.replace(',', '.')); return Number.isFinite(n) ? { valueNumber: n } : null; }
  if (dataType === 'BOOLEAN') return { valueBool: value === 'true' };
  return value.trim() ? { valueText: value.trim() } : null;
}

/**
 * «Опублікувати зміни» (37 §37.5): the draft is applied to the live tables in one transaction and
 * kept as a revision. Only `products.publish` (Owner, Administrator).
 */
export async function publish(id: string, actor: Actor) {
  const p = await load(id);
  const draft = p.draftDocument ? productDoc.parse(p.draftDocument) : null;
  if (!draft) throw new AppError(409, 'VALIDATION_FAILED', 'NOTHING_TO_PUBLISH');
  // A category deleted while the draft was open (or kept in a reverted revision) never goes live (round 22).
  const live = new Set((await prisma.category.findMany({ where: { id: { in: draft.categoryIds }, deletedAt: null }, select: { id: true } })).map((c) => c.id));
  const doc = { ...draft, categoryIds: draft.categoryIds.filter((c) => live.has(c)) };
  const r = readiness(doc, p.template.requiredFields, p.media.length, await requiredAttrs(p.templateId));
  if (r.missing.length) throw new AppError(422, 'VALIDATION_FAILED', 'NOT_READY', { missing: r.missing });

  const skuClash = await prisma.productVariant.findFirst({ where: { sku: { in: doc.variants.map((v) => v.sku) }, productId: { not: id } }, select: { sku: true } });
  if (skuClash) throw new AppError(409, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'variants.sku', code: 'SKU_TAKEN', params: { sku: skuClash.sku } }]);

  const defs = new Map((await prisma.attributeDefinition.findMany({ where: { id: { in: doc.attributes.map((a) => a.definitionId) } } })).map((d) => [d.id, d]));
  const active = doc.variants.filter((v) => v.isActive);
  const prices = active.map((v) => v.priceMinor);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // Variants: update by id, create new, retire removed (soft when an order references them).
    const keep = new Set(doc.variants.filter((v) => v.id).map((v) => v.id!));
    for (const old of p.variants.filter((v) => !keep.has(v.id))) {
      const used = await tx.orderItem.count({ where: { variantId: old.id } });
      if (used) await tx.productVariant.update({ where: { id: old.id }, data: { deletedAt: now, isActive: false, sku: `${old.sku}~${now.getTime()}` } });
      else { await tx.cartItem.deleteMany({ where: { variantId: old.id } }); await tx.productVariant.delete({ where: { id: old.id } }); }
    }
    for (const [position, v] of doc.variants.entries()) {
      const data = {
        sku: v.sku, priceMinor: v.priceMinor, compareAtMinor: v.compareAtMinor, stockQty: v.stockQty, madeToOrderDays: v.madeToOrderDays,
        weightGrams: v.weightGrams, packedWeightGrams: v.packedWeightGrams, packedLengthCm: v.packedLengthCm, packedWidthCm: v.packedWidthCm,
        packedHeightCm: v.packedHeightCm, isMainColor: v.isMainColor, isActive: v.isActive, position,
      };
      const prev = v.id ? p.variants.find((x) => x.id === v.id) : undefined;
      const row = prev ? await tx.productVariant.update({ where: { id: prev.id }, data }) : await tx.productVariant.create({ data: { ...data, productId: id } });
      await tx.variantOptionValue.deleteMany({ where: { variantId: row.id } });
      if (v.optionValueIds.length) await tx.variantOptionValue.createMany({ data: v.optionValueIds.map((optionValueId) => ({ variantId: row.id, optionValueId })) });
      // Every stock change is a movement with a source (37 §37.6).
      const delta = v.stockQty - (prev?.stockQty ?? 0);
      if (delta !== 0) await tx.stockMovement.create({ data: { variantId: row.id, delta, source: 'MANUAL', reason: prev ? 'Зміна залишку в редакторі товару' : 'Початковий залишок', createdById: actor.id } });
    }

    await tx.productCategory.deleteMany({ where: { productId: id } });
    if (doc.categoryIds.length) await tx.productCategory.createMany({ data: doc.categoryIds.map((categoryId, sortOrder) => ({ productId: id, categoryId, sortOrder })) });
    // Collection ticks (round 12 T9): a new member goes to the end of the collection's order.
    const keepCols = new Set(doc.collectionIds);
    await tx.collectionProduct.deleteMany({ where: { productId: id, collectionId: { notIn: [...keepCols] } } });
    for (const cid of keepCols) {
      if (p.collections.some((c) => c.collectionId === cid)) continue;
      const last = await tx.collectionProduct.findFirst({ where: { collectionId: cid }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
      await tx.collectionProduct.create({ data: { collectionId: cid, productId: id, sortOrder: (last?.sortOrder ?? 0) + 1 } });
    }
    await tx.productComposition.deleteMany({ where: { productId: id } });
    if (doc.composition.length) await tx.productComposition.createMany({ data: doc.composition.map((c) => ({ productId: id, ...c })) });
    await tx.productAttributeValue.deleteMany({ where: { productId: id } });
    const attrs = doc.attributes.flatMap((a) => { const d = defs.get(a.definitionId); const v = d && attrData(d.dataType, a.value); return v ? [{ productId: id, definitionId: a.definitionId, ...v }] : []; });
    if (attrs.length) await tx.productAttributeValue.createMany({ data: attrs });

    // The URL is generated from the name at first publish and then frozen (37 §37.5).
    const tr = uk(p.translations)!;
    const slug = p.publishedAt ? tr.slug : await uniqueSlug(tx, slugify(doc.name), id);
    await tx.productTranslation.update({ where: { id: tr.id }, data: { name: doc.name, description: doc.description, metaTitle: doc.metaTitle, metaDescription: doc.metaDescription, slug } });

    const c = doc.customSize;
    await tx.product.update({
      where: { id },
      data: {
        status: p.status === 'DRAFT' ? 'ACTIVE' : p.status,
        publishedAt: p.publishedAt ?? now,
        pricingUnit: doc.pricingUnit, origin: doc.origin,
        partnerName: doc.origin === 'PARTNER_MANUFACTURE' ? doc.partnerName : null,
        partnerRegion: doc.origin === 'PARTNER_MANUFACTURE' ? doc.partnerRegion : null,
        priceMinMinor: prices.length ? Math.min(...prices) : 0,
        priceMaxMinor: prices.length ? Math.max(...prices) : 0,
        inStock: active.some((v) => v.stockQty > 0 || !!v.madeToOrderDays) || doc.allowsCustomSize,
        isHandmade: doc.isHandmade, isUniquePiece: doc.isUniquePiece, woolOrigin: doc.woolOrigin,
        storyStagesOff: doc.storyStagesOff, searchSynonyms: doc.searchSynonyms.map((s) => s.toLowerCase()),
        allowsCustomSize: doc.allowsCustomSize,
        madeToOrderDays: doc.allowsCustomSize ? c.madeToOrderDays ?? 14 : null,
        customSizeRatePerSqmMinor: c.ratePerSqmMinor, customSizeMinPriceMinor: c.minPriceMinor,
        customSizeMinWidthCm: c.minWidthCm, customSizeMaxWidthCm: c.maxWidthCm, customSizeMinLengthCm: c.minLengthCm, customSizeMaxLengthCm: c.maxLengthCm,
        draftDocument: Prisma.DbNull, draftUpdatedAt: null, draftUpdatedById: null,
      },
    });
    const fresh = await tx.product.findUniqueOrThrow({ where: { id }, include: productInclude });
    const snapshot = docFromLive(fresh);
    const rev = await tx.productRevision.create({ data: { productId: id, snapshot: snapshot as unknown as Prisma.InputJsonValue, createdById: actor.id, publishedAt: now } });
    await tx.product.update({ where: { id }, data: { liveRevisionId: rev.id } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.published', resourceType: 'Product', resourceId: id, resourceLabel: p.sku, after: { revisionId: rev.id } }, tx);
  });
  void indexNowProduct(id); // round 24 G022
  return getProduct(id);
}

// ---------------------------------------------------------------------------------------------
// Archive

export async function setArchived(id: string, archived: boolean, actor: Actor) {
  const p = await load(id);
  if (archived && p.status === 'ARCHIVED') return;
  if (!archived && p.status !== 'ARCHIVED') return;
  // Returning to the site is a publish decision.
  if (!archived && !actor.permissions.has('products.publish')) throw forbidden();
  const status: ProductStatus = archived ? 'ARCHIVED' : p.publishedAt ? 'ACTIVE' : 'DRAFT';
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { status } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: archived ? 'product.archived' : 'product.unarchived', resourceType: 'Product', resourceId: id, resourceLabel: p.sku, before: { status: p.status }, after: { status } }, tx);
  });
  void indexNowProduct(id); // round 24 G022
}

// ---------------------------------------------------------------------------------------------
// Round 20: quick price and stock in the list (#122, #220), «Створити схожий» (#130), delete (#123),
// SKU edited on the new-product steps (#157).

/**
 * One variant's price or stock, straight from the list: the live row (with a stock movement and the
 * product's denormalised price and «є в наявності»), and the open draft so a later publish keeps it.
 * A row that exists only in a never-published draft is addressed by its index.
 */
export async function quickEdit(id: string, b: { variantId?: string; index?: number; priceMinor?: number; stockQty?: number }, actor: Actor) {
  if (b.priceMinor !== undefined && !actor.permissions.has('products.manage_price')) throw forbidden();
  if (b.stockQty !== undefined && !actor.permissions.has('products.manage_stock')) throw forbidden();
  const p = await load(id);
  const draft = p.draftDocument ? productDoc.parse(p.draftDocument) : null;
  const patch = <T extends { priceMinor: number; stockQty: number }>(v: T): T => ({ ...v, ...(b.priceMinor !== undefined ? { priceMinor: b.priceMinor } : {}), ...(b.stockQty !== undefined ? { stockQty: b.stockQty } : {}) });
  const live = b.variantId ? p.variants.find((v) => v.id === b.variantId) : undefined;
  if (b.variantId && !live && !draft?.variants.some((v) => v.id === b.variantId)) throw new AppError(404, 'NOT_FOUND');
  if (!b.variantId && (b.index === undefined || !draft?.variants[b.index])) throw new AppError(404, 'NOT_FOUND');

  await prisma.$transaction(async (tx) => {
    if (live) {
      await tx.productVariant.update({ where: { id: live.id }, data: patch({ priceMinor: live.priceMinor, stockQty: live.stockQty }) });
      if (b.stockQty !== undefined && b.stockQty !== live.stockQty) {
        await tx.stockMovement.create({ data: { variantId: live.id, delta: b.stockQty - live.stockQty, source: 'MANUAL', reason: 'Зміна залишку в списку товарів', createdById: actor.id } });
      }
      const all = await tx.productVariant.findMany({ where: { productId: id, deletedAt: null, isActive: true }, select: { priceMinor: true, stockQty: true, madeToOrderDays: true } });
      const prices = all.map((v) => v.priceMinor);
      await tx.product.update({
        where: { id },
        data: {
          priceMinMinor: prices.length ? Math.min(...prices) : 0, priceMaxMinor: prices.length ? Math.max(...prices) : 0,
          inStock: all.some((v) => v.stockQty > 0 || !!v.madeToOrderDays) || p.allowsCustomSize,
        },
      });
    }
    if (draft) {
      draft.variants = draft.variants.map((v, i) => ((b.variantId ? v.id === b.variantId : i === b.index) ? patch(v) : v));
      await tx.product.update({ where: { id }, data: { draftDocument: draft as unknown as Prisma.InputJsonValue } });
    }
    await audit({
      actorId: actor.id, actorEmail: actor.email, action: 'product.quick_edit', resourceType: 'Product', resourceId: id, resourceLabel: p.sku,
      before: live ? { priceMinor: live.priceMinor, stockQty: live.stockQty } : undefined, after: { variantId: b.variantId ?? null, index: b.index ?? null, priceMinor: b.priceMinor ?? null, stockQty: b.stockQty ?? null },
    }, tx);
  });
  return { ok: true };
}

/** «Створити схожий»: a new draft with the same template, texts, sizes, colours and prices; photos are not copied. */
export async function duplicate(id: string, actor: Actor) {
  const p = await load(id);
  const doc = productDoc.parse(p.draftDocument ?? docFromLive(p));
  const origin = doc.origin === 'PARTNER_MANUFACTURE' && !actor.permissions.has('products.manage_origin') ? 'OWN_MANUFACTURE' : doc.origin;
  const name = `${doc.name || p.sku} (копія)`.slice(0, 160);
  const created = await createProduct({ templateKey: p.template.key, name, origin }, actor);
  const copy: ProductDoc = {
    ...doc, name, origin, metaTitle: null, metaDescription: null,
    variants: doc.variants.map((v, i) => ({ ...v, id: undefined, sku: v.sku.startsWith(p.sku) ? `${created.sku}${v.sku.slice(p.sku.length)}` : `${created.sku}-${i + 1}` })),
  };
  await prisma.product.update({ where: { id: created.id }, data: { draftDocument: copy as unknown as Prisma.InputJsonValue } });
  return created;
}

/**
 * Delete (37 §37.5: only a product that never had an order, `products.delete`). The row is kept with
 * `deletedAt` so audit and stock history still point somewhere; variant SKUs are freed.
 */
export async function deleteProduct(id: string, actor: Actor, tx: Prisma.TransactionClient = prisma) {
  const p = await tx.product.findFirst({ where: { id, deletedAt: null }, select: { id: true, sku: true, status: true, variants: { select: { id: true, sku: true } } } });
  if (!p) throw new AppError(404, 'PRODUCT_NOT_FOUND');
  if (await tx.orderItem.count({ where: { variantId: { in: p.variants.map((v) => v.id) } } })) throw new AppError(409, 'VALIDATION_FAILED', 'HAS_ORDERS');
  const now = new Date();
  await tx.cartItem.deleteMany({ where: { variantId: { in: p.variants.map((v) => v.id) } } });
  for (const v of p.variants) await tx.productVariant.update({ where: { id: v.id }, data: { deletedAt: now, isActive: false, sku: `${v.sku}~${now.getTime()}` } });
  await tx.product.update({ where: { id }, data: { deletedAt: now, status: 'ARCHIVED' } });
  await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.deleted', resourceType: 'Product', resourceId: id, resourceLabel: p.sku, before: { status: p.status } }, tx);
  if (p.status === 'ACTIVE') void indexNowProduct(id); // round 24 G022: the page now 301s to its category
}

/** The product SKU, editable until the first publish (round 20 #157); variant SKUs follow the new prefix. */
export async function changeSku(id: string, raw: string, actor: Actor) {
  const sku = raw.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]{1,38}[A-Z0-9]$/.test(sku)) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'sku', code: 'INVALID' }]);
  const p = await load(id);
  if (p.sku === sku) return { sku };
  if (p.publishedAt) throw new AppError(409, 'VALIDATION_FAILED', 'ALREADY_PUBLISHED');
  const clash = await prisma.product.findFirst({ where: { sku, id: { not: id } }, select: { id: true } })
    ?? await prisma.productVariant.findFirst({ where: { sku: { startsWith: sku }, productId: { not: id } }, select: { id: true } });
  if (clash) throw new AppError(409, 'VALIDATION_FAILED', undefined, undefined, [{ path: 'sku', code: 'SKU_TAKEN', params: { sku } }]);
  const draft = p.draftDocument ? productDoc.parse(p.draftDocument) : null;
  if (draft) draft.variants = draft.variants.map((v) => (v.sku.startsWith(p.sku) ? { ...v, sku: `${sku}${v.sku.slice(p.sku.length)}` } : v));
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { sku, ...(draft ? { draftDocument: draft as unknown as Prisma.InputJsonValue } : {}) } });
    await audit({ actorId: actor.id, actorEmail: actor.email, action: 'product.sku_changed', resourceType: 'Product', resourceId: id, resourceLabel: sku, before: { sku: p.sku }, after: { sku } }, tx);
  });
  return { sku };
}
