import type { Locale } from '@prisma/client';
import type {
  CategoryNode,
  CustomSizeConfig,
  ProductDetail,
  ProductListItem,
  ProductListQuery,
  ProductListResponse,
} from '@vivcharyk/schemas';
import { AppError } from '../../lib/errors';
import * as repo from './catalog.repository';

// Round 16: the storefront reaches catalogue data only through this port. `LocalCatalogSource`
// reads our own database; a `OneKnightCatalogSource` can replace it by config later.
export interface CatalogSource {
  categoryTree(locale: Locale): Promise<CategoryNode[]>;
  /** Whether any partner product is on sale (round 22 K13: the site gathers the partner group by origin). */
  hasPartnerGoods(locale: Locale): Promise<boolean>;
  listProducts(q: ProductListQuery, filters: Record<string, string[]>): Promise<ProductListResponse & { fallback: boolean }>;
  featured(locale: Locale, limit: number): Promise<ProductListItem[]>;
  productBySlug(slug: string, locale: Locale): Promise<ProductDetail>;
}

const BRAND = 'Вівчарик' as const;
const NEW_DAYS = 30;
/**
 * Round 24 G079: «Новинка» marks what came after the catalogue opened. The opening catalogue was
 * imported in one go (publishedAt is the first publish, all on the same days), so nothing published
 * before the site opened counts as new.
 */
const CATALOGUE_OPENED = new Date('2026-10-03T00:00:00+03:00');

type Tr<T> = T & { locale: Locale };
/** Requested locale first, `uk` as the fallback (26 §26.6). */
function pick<T>(rows: Tr<T>[], locale: Locale): { row: Tr<T> | undefined; fellBack: boolean } {
  const exact = rows.find((r) => r.locale === locale);
  if (exact) return { row: exact, fellBack: false };
  return { row: rows.find((r) => r.locale === 'uk'), fellBack: locale !== 'uk' };
}
const locs = (l: Locale): Locale[] => (l === 'uk' ? ['uk'] : [l, 'uk']);

type MediaRow = { media: { publicId: string; width: number; height: number; blurhash: string | null; translations: Tr<{ alt: string }>[] } };
const mediaOut = (m: MediaRow | undefined, locale: Locale, fallbackAlt: string) =>
  m ? { publicId: m.media.publicId, width: m.media.width, height: m.media.height, blurhash: m.media.blurhash, alt: pick(m.media.translations, locale).row?.alt ?? fallbackAlt } : null;

function badgesFor(p: { publishedAt: Date | null; badgeOverride: unknown; variants: Array<{ compareAtMinor: number | null; priceMinor: number }> }) {
  const set = new Set<'NEW' | 'SALE' | 'HIT'>();
  if (p.publishedAt && p.publishedAt >= CATALOGUE_OPENED && Date.now() - p.publishedAt.getTime() < NEW_DAYS * 86_400_000) set.add('NEW');
  if (p.variants.some((v) => v.compareAtMinor !== null && v.compareAtMinor > v.priceMinor)) set.add('SALE');
  const o = (p.badgeOverride ?? {}) as { add?: string[]; remove?: string[] };
  for (const b of o.add ?? []) if (b === 'NEW' || b === 'SALE' || b === 'HIT') set.add(b);
  for (const b of o.remove ?? []) set.delete(b as 'NEW');
  return [...set];
}

async function categoryIndex(locale: Locale) {
  const rows = await repo.loadCategories(locs(locale));
  const nodes = new Map<string, CategoryNode & { parentId: string | null; description: string | null; metaTitle: string | null; metaDescription: string | null }>();
  for (const c of rows) {
    const t = pick(c.translations, locale).row;
    if (!t) continue;
    nodes.set(c.id, { id: c.id, key: c.key, slug: t.slug, name: t.name, isFeatured: c.isFeatured, children: [], parentId: c.parentId, description: t.description ?? null, metaTitle: t.metaTitle ?? null, metaDescription: t.metaDescription ?? null });
  }
  const roots: CategoryNode[] = [];
  for (const n of nodes.values()) {
    const parent = n.parentId ? nodes.get(n.parentId) : undefined;
    (parent ? parent.children : roots).push(n);
  }
  return { nodes, roots };
}

/** Deepest current discount across a product's variants, as a fraction; 0 when none is on sale. */
function discountOf(p: { variants: Array<{ compareAtMinor: number | null; priceMinor: number }> }) {
  return Math.max(0, ...p.variants.map((v) => (v.compareAtMinor && v.compareAtMinor > v.priceMinor ? 1 - v.priceMinor / v.compareAtMinor : 0)));
}

function descendants(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(descendants)];
}

export class LocalCatalogSource implements CatalogSource {
  async categoryTree(locale: Locale) {
    const [{ roots }, links] = await Promise.all([categoryIndex(locale), repo.loadPublicCategoryLinks(locale)]);
    const own = new Map<string, Set<string>>();
    for (const l of links) (own.get(l.categoryId) ?? own.set(l.categoryId, new Set()).get(l.categoryId)!).add(l.productId);
    // productCount: distinct products in the category and its descendants — the listing's own scope.
    const strip = (n: CategoryNode): CategoryNode & { ids: Set<string> } => {
      const children = n.children.map(strip);
      const ids = new Set([...(own.get(n.id) ?? []), ...children.flatMap((c) => [...c.ids])]);
      return { id: n.id, key: n.key ?? null, slug: n.slug, name: n.name, isFeatured: !!n.isFeatured, productCount: ids.size, children, ids };
    };
    const drop = ({ ids: _ids, children, ...n }: CategoryNode & { ids?: Set<string> }): CategoryNode => ({ ...n, children: children.map(drop) });
    return roots.map(strip).map(drop);
  }

  async hasPartnerGoods(locale: Locale) {
    return (await repo.countPartnerProducts(locale)) > 0;
  }

  async listProducts(q: ProductListQuery, filters: Record<string, string[]>) {
    const { nodes } = await categoryIndex(q.locale);
    let categoryIds: string[] | null = null;
    let categoryInfo: { name: string; description: string | null; metaTitle: string | null; metaDescription: string | null } | undefined;
    if (q.category) {
      const node = [...nodes.values()].find((n) => n.slug === q.category);
      if (!node) throw new AppError(404, 'NOT_FOUND');
      categoryIds = descendants(node);
      categoryInfo = { name: node.name, description: node.description, metaTitle: node.metaTitle, metaDescription: node.metaDescription };
    }
    const [scope, optionValues, ranks] = await Promise.all([
      repo.loadListingScope(categoryIds, locs(q.locale)), repo.loadOptionValues(locs(q.locale)),
      q.q ? repo.searchRanks(q.q, locs(q.locale)) : Promise.resolve(null),
    ]);
    let rows = ranks ? scope.filter((p) => ranks.has(p.id)) : scope;
    let collectionInfo: { name: string; description: string | null; metaTitle: string | null; metaDescription: string | null } | undefined;
    let inCollection: Map<string, number> | null = null;
    if (q.collection) {
      const c = await repo.findCollection(q.collection, locs(q.locale));
      if (!c) throw new AppError(404, 'NOT_FOUND');
      const t = pick(c.translations, q.locale).row!;
      collectionInfo = { name: t.name, description: t.description, metaTitle: t.metaTitle, metaDescription: t.metaDescription };
      inCollection = new Map(rows.flatMap((p) => p.collections.filter((x) => x.collectionId === c.id).map((x) => [p.id, x.sortOrder] as const)));
      rows = rows.filter((p) => inCollection!.has(p.id));
    }
    if (q.slugs) { const want = new Set(q.slugs); rows = rows.filter((p) => p.translations.some((t) => want.has(t.slug))); }

    const valueById = new Map(optionValues.map((v) => [v.id, v]));
    const facetKeys = [...new Set(optionValues.map((v) => v.optionType.key))];
    for (const k of Object.keys(filters)) {
      if (!facetKeys.includes(k)) throw new AppError(422, 'VALIDATION_FAILED', undefined, undefined, [{ path: `filter.${k}`, code: 'UNKNOWN_FACET' }]);
    }

    // Option values each product offers, per facet.
    const offers = rows.map((p) => {
      const byFacet = new Map<string, Set<string>>();
      for (const v of p.variants) for (const o of v.options) {
        const ov = valueById.get(o.optionValueId);
        if (!ov) continue;
        const set = byFacet.get(ov.optionType.key) ?? new Set();
        set.add(ov.key);
        byFacet.set(ov.optionType.key, set);
      }
      return { p, byFacet };
    });

    const passesBase = (p: (typeof rows)[number]) =>
      (!q.origin || p.origin === q.origin) &&
      (q.inStock === undefined || !q.inStock || p.inStock) &&
      (q.priceMin === undefined || p.priceMaxMinor >= q.priceMin) &&
      (q.priceMax === undefined || p.priceMinMinor <= q.priceMax);
    // OR within a facet, AND across facets (26 §26.7.2).
    const passesFacets = (byFacet: Map<string, Set<string>>, except?: string) =>
      Object.entries(filters).every(([k, vals]) => k === except || vals.some((v) => byFacet.get(k)?.has(v)));

    const matched = offers.filter((o) => passesBase(o.p) && passesFacets(o.byFacet));

    // Facet counts: each facet counted with every other filter applied.
    const facets = facetKeys.map((key) => {
      const counts = new Map<string, number>();
      for (const o of offers) {
        if (!passesBase(o.p) || !passesFacets(o.byFacet, key)) continue;
        for (const v of o.byFacet.get(key) ?? []) counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      const values = optionValues
        .filter((v) => v.optionType.key === key && counts.has(v.key))
        .map((v) => ({ key: v.key, label: pick(v.translations, q.locale).row?.label ?? v.key, count: counts.get(v.key)!, selected: !!filters[key]?.includes(v.key), hex: v.hex }));
      const typeLabel = optionValues.find((v) => v.optionType.key === key);
      return { key, label: (typeLabel && pick(typeLabel.optionType.translations, q.locale).row?.name) ?? key, values };
    }).filter((f) => f.values.length > 0);

    const originCounts = new Map<string, number>();
    for (const o of offers) if (passesFacets(o.byFacet) && (q.inStock === undefined || !q.inStock || o.p.inStock)) originCounts.set(o.p.origin, (originCounts.get(o.p.origin) ?? 0) + 1);

    const nameOf = (p: (typeof rows)[number]) => pick(p.translations, q.locale).row?.name ?? '';
    const sorted = [...matched].sort((a, b) => {
      // Out of stock sinks to the end (round 10); every sort tiebreaks on id.
      if (a.p.inStock !== b.p.inStock) return a.p.inStock ? -1 : 1;
      let d = 0;
      if (q.sort === 'price_asc') d = a.p.priceMinMinor - b.p.priceMinMinor;
      else if (q.sort === 'price_desc') d = b.p.priceMaxMinor - a.p.priceMaxMinor;
      else if (q.sort === 'name_asc') d = nameOf(a.p).localeCompare(nameOf(b.p), q.locale);
      else if (q.sort === 'relevance' && ranks) d = (ranks.get(b.p.id) ?? 0) - (ranks.get(a.p.id) ?? 0);
      else if (q.sort === 'discount') d = discountOf(b.p) - discountOf(a.p);
      // Inside a collection the owner's order is the default (round 12 T9).
      else if (q.sort === 'popularity' && inCollection) d = inCollection.get(a.p.id)! - inCollection.get(b.p.id)!;
      // `popularity` has no sales signal before launch; it falls back to newest.
      else d = (b.p.publishedAt?.getTime() ?? 0) - (a.p.publishedAt?.getTime() ?? 0);
      return d || a.p.id.localeCompare(b.p.id);
    });

    const total = sorted.length;
    const start = (q.page - 1) * q.perPage;
    let fallback = false;
    const items: ProductListItem[] = sorted.slice(start, start + q.perPage).map(({ p }) => {
      const t = pick(p.translations, q.locale);
      if (t.fellBack) fallback = true;
      const name = t.row?.name ?? '';
      return {
        id: p.id,
        slug: t.row?.slug ?? p.id,
        name,
        priceMinMinor: p.priceMinMinor,
        priceMaxMinor: p.priceMaxMinor,
        currency: p.currency,
        pricingUnit: p.pricingUnit,
        inStock: p.inStock,
        isHandmade: p.isHandmade,
        isUniquePiece: p.isUniquePiece,
        origin: p.origin,
        partnerRegion: p.partnerRegion,
        media: mediaOut(p.media[0], q.locale, name),
        badges: badgesFor(p),
      };
    });

    const prices = offers.filter((o) => passesFacets(o.byFacet)).map((o) => o.p);
    const appliedFilters = Object.entries(filters).flatMap(([key, vals]) =>
      vals.map((v) => ({ key, value: v, label: facets.find((f) => f.key === key)?.values.find((x) => x.key === v)?.label ?? v })),
    );
    return {
      ...(categoryInfo ? { category: categoryInfo } : collectionInfo ? { category: collectionInfo } : {}),
      items,
      page: { number: q.page, perPage: q.perPage, total, totalPages: Math.max(1, Math.ceil(total / q.perPage)), hasMore: start + q.perPage < total },
      facets: [
        {
          key: 'origin',
          label: q.locale === 'uk' ? 'Походження' : 'Origin',
          values: (['OWN_MANUFACTURE', 'PARTNER_MANUFACTURE'] as const)
            .filter((o) => originCounts.has(o))
            .map((o) => ({ key: o, label: o === 'OWN_MANUFACTURE' ? (q.locale === 'uk' ? 'Власне виробництво' : 'Made in our workshop') : (q.locale === 'uk' ? 'Від партнерів' : 'From our partners'), count: originCounts.get(o)!, selected: q.origin === o })),
        },
        ...facets,
      ],
      appliedFilters,
      priceRange: prices.length ? { minMinor: Math.min(...prices.map((p) => p.priceMinMinor)), maxMinor: Math.max(...prices.map((p) => p.priceMaxMinor)) } : null,
      fallback,
    };
  }

  /** Homepage rails: hard-filtered to own manufacture in the handler (26 §26.10.1, D3.5). */
  async featured(locale: Locale, limit: number) {
    const res = await this.listProducts({ locale, sort: 'popularity', page: 1, perPage: 48, origin: 'OWN_MANUFACTURE' }, {});
    const own = res.items.filter((i) => i.origin === 'OWN_MANUFACTURE');
    // Round 24 G084: the rail mixes categories — one from each in turn, by each product's first category.
    const firstCat = await repo.firstCategoryOf(own.map((i) => i.id));
    const queues = new Map<string, ProductListItem[]>();
    for (const i of own) { const k = firstCat.get(i.id) ?? ''; queues.set(k, [...(queues.get(k) ?? []), i]); }
    const out: ProductListItem[] = [];
    while (out.length < limit && [...queues.values()].some((q) => q.length)) for (const q of queues.values()) if (q.length && out.length < limit) out.push(q.shift()!);
    return out;
  }

  async productBySlug(slug: string, locale: Locale): Promise<ProductDetail> {
    const hit = await repo.findProductIdBySlug(slug, locale);
    const p = hit && (await repo.loadProductDetail(hit.productId, locs(locale)));
    if (!p) throw new AppError(404, 'PRODUCT_NOT_FOUND');

    const fallback: string[] = [];
    const t = pick(p.translations, locale);
    if (t.fellBack) fallback.push('name', 'description');
    const name = t.row?.name ?? '';

    // Round 24 G080: «Залишилось мало» only for stock somebody has counted — a variant whose stock was
    // ever set in the panel, the Excel import or the till (the first catalogue import wrote 1 everywhere).
    const counted = await repo.countedVariants(p.variants.map((v) => v.id));
    const variants = p.variants.map((v) => {
      const options: Record<string, { key: string; label: string; hex: string | null }> = {};
      for (const o of v.options) {
        const ov = o.optionValue;
        options[ov.optionType.key] = { key: ov.key, label: pick(ov.translations, locale).row?.label ?? ov.key, hex: ov.hex };
      }
      const madeToOrderDays = v.madeToOrderDays ?? null;
      const stockHint =
        v.stockQty > 0 ? (v.stockQty <= v.lowStockAt && !madeToOrderDays && counted.has(v.id) ? 'FEW_LEFT' : 'IN_STOCK') : madeToOrderDays ? 'MADE_TO_ORDER' : 'OUT_OF_STOCK';
      return { id: v.id, sku: v.sku, priceMinor: v.priceMinor, compareAtMinor: v.compareAtMinor, inStock: v.stockQty > 0, stockHint, madeToOrderDays, options } as const;
    });

    const customSize: CustomSizeConfig | undefined =
      p.allowsCustomSize &&
      p.customSizeRatePerSqmMinor !== null && p.customSizeMinPriceMinor !== null &&
      p.customSizeMinWidthCm !== null && p.customSizeMaxWidthCm !== null &&
      p.customSizeMinLengthCm !== null && p.customSizeMaxLengthCm !== null
        ? {
            ratePerSqmMinor: p.customSizeRatePerSqmMinor,
            minPriceMinor: p.customSizeMinPriceMinor,
            minWidthCm: p.customSizeMinWidthCm,
            maxWidthCm: p.customSizeMaxWidthCm,
            minLengthCm: p.customSizeMinLengthCm,
            maxLengthCm: p.customSizeMaxLengthCm,
            leadTimeDays: p.madeToOrderDays ?? 14,
            currency: p.currency,
          }
        : undefined;

    const own = p.origin === 'OWN_MANUFACTURE';
    // Built by explicit construction: `partnerName` has no route into this object (26 §26.10.1, E7).
    return {
      id: p.id,
      slug: t.row?.slug ?? slug,
      sku: p.sku,
      name,
      description: t.row?.description ?? '',
      metaTitle: t.row?.metaTitle ?? null,
      metaDescription: t.row?.metaDescription ?? null,
      priceMinMinor: p.priceMinMinor,
      priceMaxMinor: p.priceMaxMinor,
      currency: p.currency,
      pricingUnit: p.pricingUnit,
      inStock: p.inStock,
      isHandmade: p.isHandmade,
      isUniquePiece: p.isUniquePiece,
      origin: p.origin,
      partnerRegion: p.partnerRegion,
      media: mediaOut(p.media[0], locale, name),
      badges: badgesFor({ publishedAt: p.publishedAt, badgeOverride: p.badgeOverride, variants: p.variants }),
      categories: p.categories.flatMap((c) => {
        const ct = pick(c.category.translations, locale).row;
        return ct ? [{ slug: ct.slug, name: ct.name }] : [];
      }),
      variants,
      gallery: p.media.map((m) => mediaOut(m, locale, name)!),
      attributes: p.attributes.map((a) => ({
        key: a.definition.key,
        label: pick(a.definition.translations, locale).row?.name ?? a.definition.key,
        value: a.valueText ?? (a.valueNumber !== null ? `${a.valueNumber}${a.definition.unit ? ` ${a.definition.unit}` : ''}` : a.valueBool === null ? '' : a.valueBool ? 'так' : 'ні'),
      })),
      composition: p.composition.map((c) => ({ material: pick(c.material.translations, locale).row?.name ?? '', role: c.role, percent: c.percent })),
      ...(customSize ? { customSize } : {}),
      ...(own ? { provenance: { woolOrigin: p.woolOrigin, productionStage: p.productionStage.filter((s) => !p.storyStagesOff.includes(s)) } } : {}),
      schemaBrand: BRAND,
      ...(own ? { schemaManufacturer: BRAND } : {}),
      translationFallback: fallback,
    };
  }
}

export const catalog: CatalogSource = new LocalCatalogSource();
