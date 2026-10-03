import { Link, redirect, useLoaderData, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale, ProductListResponse } from '@vivcharyk/schemas';
import type { Route } from './+types/category';
import { alternatesFor, apiGet, apiGetCached, ApiError, redirectOr404 } from '@/lib/api.server';
import { t } from '@/lib/i18n';
import { PARTNERS_NAME, PARTNERS_NAME_EN, PARTNERS_SLUG, path } from '@/lib/segments';
import { brandOf, localeOf, originOf, pageMeta, TITLE_MAX, titled } from '@/lib/seo';
import { Listing } from '@/features/catalog/components/Listing';
import { CategoryBelow, CategoryLead, parseCategoryText, type SizeRow } from '@/features/catalog/components/CategoryText';
import type { loader as layoutLoader } from './locale-layout';

const PASS = ['origin', 'inStock', 'priceMin', 'priceMax', 'sort', 'page'];

/** The node and its parent in the panel's tree (two levels: group › subcategory). */
function locate(nodes: CategoryNode[], slug: string, parent: CategoryNode | null = null): { node: CategoryNode; parent: CategoryNode | null } | null {
  for (const n of nodes) {
    if (n.slug === slug) return { node: n, parent };
    const hit = locate(n.children, slug, n);
    if (hit) return hit;
  }
  return null;
}

/**
 * Round 24 G001–G003: `/uk/<group>/<sub>` is the only address of a subcategory and `/uk/<group>` of a
 * group. A short `/uk/<sub>`, a wrong parent, `/uk/<sub>/<sub>` or a group under another segment all
 * 301 to the one real address (the query string is kept).
 */
function canonicalPath(locale: Locale, tree: CategoryNode[], category: string, sub: string | undefined) {
  const hit = locate(tree, sub ?? category);
  if (!hit) return null;
  return hit.parent ? path.category(locale, hit.parent.slug, hit.node.slug) : path.category(locale, hit.node.slug);
}

// Categories made of sheep's wool by definition (a ліжник is wool, G095). Carpets wait for Іван (G061).
const WOOL_KEYS = new Set(['lizhnyky', 'lizhnykovi-dorizhky', 'lizhnykovi-nakydky']);
// Categories with the ліжник size library as their size table (G063).
const LIZHNYK_SIZES = new Set(['lizhnyky', 'lizhnyky-ta-pledy']);

// G056: written by hand for the categories that have products today; a template for the rest.
const DESCRIPTIONS: Record<string, string> = {
  'lizhnyky-ta-pledy': 'Ліжники, килими й ліжникові доріжки від виробника: тчемо самі в с. Яворів, Косівський р-н. Окремі вироби — на ваш розмір. Доставка по Україні.',
  lizhnyky: 'Гуцульські ліжники з овечої вовни від виробника: тчемо й валяємо в с. Яворів, Косівський р-н. Окремі — на ваш розмір. Доставка по Україні.',
  kylymy: 'Ткані килими та килимові доріжки з нашої майстерні в с. Яворів, Косівський р-н. Ціни від виробника, доставка Новою поштою й Укрпоштою.',
  'lizhnykovi-dorizhky': 'Ліжникові доріжки з овечої вовни, виткані в нашій майстерні в с. Яворів, Косівський р-н. Купуйте від виробника з доставкою по Україні.',
};
const templateDescription = (name: string) => `${name} у магазині «Вівчарик» — майстерня й магазин у с. Яворів, Косівський р-н. Доставка Новою поштою й Укрпоштою по Україні.`;
// Round 24 G093: the same, in English.
const DESCRIPTIONS_EN: Record<string, string> = {
  'lizhnyky-ta-pledy': 'Lizhnyks, rugs and lizhnyk runners from the maker: woven by us in Yavoriv village, Kosiv district. Some pieces in your size. Delivery across Ukraine.',
  lizhnyky: 'Hutsul lizhnyks of sheep’s wool from the maker: woven and felted in Yavoriv village, Kosiv district. Some in your size. Delivery across Ukraine.',
  kylymy: 'Woven rugs and rug runners from our workshop in Yavoriv village, Kosiv district. Maker’s prices, delivery by Nova Poshta and Ukrposhta.',
  'lizhnykovi-dorizhky': 'Lizhnyk runners of sheep’s wool, woven in our workshop in Yavoriv village, Kosiv district. Buy from the maker with delivery across Ukraine.',
};
const templateDescriptionEn = (name: string) => `${name} at Vivcharyk — our workshop and shop in Yavoriv village, Kosiv district. Delivery across Ukraine by Nova Poshta and Ukrposhta.`;

/** G054: «{Категорія} з овечої вовни — купити від виробника | Вівчарик», the wool phrase only where true, ~65 chars (TITLE_MAX). */
function categoryTitle(name: string, key: string | null | undefined, locale: Locale = 'uk') {
  const en = locale === 'en';
  const long = en ? `${name} — sheep's wool, buy from the maker | ${brandOf(locale)}` : `${name} з овечої вовни — купити від виробника | Вівчарик`;
  const short = en ? `${name} — buy from the maker | ${brandOf(locale)}` : `${name} — купити від виробника | Вівчарик`;
  return key && WOOL_KEYS.has(key) && long.length <= TITLE_MAX ? long : short;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams) {
    if (PASS.includes(k) || /^filter\[[a-z_]+\]$/.test(k)) query[k] = query[k] ? `${query[k]},${v}` : v;
  }
  // Price fields are typed in hryvnias; the API takes kopecks.
  for (const k of ['priceMin', 'priceMax']) if (query[k]) query[k] = String(Math.round(Number(query[k].replace(',', '.')) * 100) || '');
  // Round 22 K13: «Від партнерів» is every product with the partner checkbox, not a category.
  if (params.category === PARTNERS_SLUG && !params.sub) {
    const { data } = await apiGet<ProductListResponse>('/products', locale, { ...query, origin: 'PARTNER_MANUFACTURE' });
    const noindex = data.items.length === 0 || data.appliedFilters.length > 0 || !!query.inStock || !!query.priceMin || !!query.priceMax;
    return {
      data: { ...data, facets: data.facets.filter((f) => f.key !== 'origin') }, slug: PARTNERS_SLUG, parentSlug: PARTNERS_SLUG, partners: true, key: null, sizes: [] as SizeRow[],
      seo: { alternates: { [locale]: path.category(locale, PARTNERS_SLUG) }, ...(noindex ? { robots: 'noindex,follow' } : {}) },
    };
  }
  const tree = await apiGetCached<{ items: CategoryNode[] }>('/categories', locale).then((r) => r.items).catch(() => [] as CategoryNode[]);
  const real = canonicalPath(locale, tree, params.category!, params.sub);
  if (real && real !== url.pathname.replace(/\/+$/, '')) throw redirect(`${real}${url.search}`, 301);
  try {
    const slug = params.sub ?? params.category!;
    const key = locate(tree, slug)?.node.key ?? null;
    const [{ data }, alternates, sizes] = await Promise.all([
      apiGet<ProductListResponse>('/products', locale, { ...query, category: slug }),
      alternatesFor('category', slug, locale),
      key && LIZHNYK_SIZES.has(key)
        ? apiGetCached<{ items: SizeRow[] }>('/size-library?template=lizhnyk', locale).then((r) => r.items).catch(() => [] as SizeRow[])
        : Promise.resolve([] as SizeRow[]),
    ]);
    // Filtered or empty listings are `noindex, follow` (29 §29.7); sort and page never change indexability.
    const noindex = data.items.length === 0 || data.appliedFilters.length > 0 || !!query.origin || !!query.inStock || !!query.priceMin || !!query.priceMax;
    return { data, slug, parentSlug: params.category!, partners: false, key, sizes, seo: { alternates, ...(noindex ? { robots: 'noindex,follow' } : {}) } };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) await redirectOr404(request);
    throw e;
  }
}

export function meta({ data, matches }: Route.MetaArgs) {
  const origin = originOf(matches);
  const locale = localeOf(matches);
  const en = locale === 'en';
  const partnersName = en ? PARTNERS_NAME_EN : PARTNERS_NAME;
  const template = en ? templateDescriptionEn : templateDescription;
  if (data?.partners) return pageMeta({ title: titled(partnersName, locale), description: template(partnersName), origin, locale });
  const c = data?.data.category;
  if (!c) return [];
  return pageMeta({
    title: c.metaTitle ?? categoryTitle(c.name, data.key, locale),
    description: c.metaDescription ?? (data.key && (en ? DESCRIPTIONS_EN : DESCRIPTIONS)[data.key]) ?? template(c.name),
    origin, locale,
  });
}

export default function CategoryPage() {
  const { data, slug, partners, sizes } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const locale = (layout?.locale ?? 'uk') as Locale;
  const origin = layout?.origin ?? '';
  const en = locale === 'en';
  const home = en ? 'Home' : 'Головна';
  const tree = layout?.categories ?? [];
  const hit = partners ? null : locate(tree, slug);
  const node = partners ? { id: PARTNERS_SLUG, slug, name: en ? PARTNERS_NAME_EN : PARTNERS_NAME, children: [] } : hit?.node;
  const parent = hit?.parent ?? null;
  // A group lists its subcategories; a subcategory lists its siblings.
  const typeOf = parent ?? (node && node.children.length > 0 ? node : null);
  const name = node?.name ?? data.category?.name ?? '';
  const self = parent ? path.category(locale, parent.slug, slug) : path.category(locale, slug);
  const text = parseCategoryText(data.category?.description);

  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 py-8 lg:px-12">
      <nav aria-label="breadcrumb" className="text-body-sm text-text-muted">
        <Link to={path.home(locale)} className="hover:underline">{home}</Link>
        {parent && <> › <Link to={path.category(locale, parent.slug)} className="hover:underline">{parent.name}</Link></>}
        {' › '}<span className="text-text-primary">{name}</span>
      </nav>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-h1 text-text-primary">{name}</h1>
          <span className="text-body text-text-muted">{t(locale, 'catalog.count', { n: data.page.total ?? data.items.length })}</span>
        </div>
        {/* G062: two lines above the products; the rest waits below them. */}
        <CategoryLead text={text} />
      </div>

      <Listing data={data} locale={locale} countBase={partners ? { origin: 'PARTNER_MANUFACTURE' } : { category: slug }} before={typeOf && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-body font-semibold text-text-primary">{en ? 'Type' : 'Тип'}</legend>
          {typeOf.children.filter((c) => c.slug === slug || (c as CategoryNode & { productCount?: number }).productCount !== 0).map((c) => (
            <Link key={c.id} to={path.category(locale, typeOf.slug, c.slug)} className={`text-body ${c.slug === slug ? 'font-semibold text-text-primary' : 'text-text-body'} hover:underline`}>{c.name}</Link>
          ))}
        </fieldset>
      )} />
      {/* BreadcrumbList matching the visible one, and the ItemList of this page — never an empty list (G139). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: home, item: `${origin}${path.home(locale)}` },
            ...(parent ? [{ '@type': 'ListItem', position: 2, name: parent.name, item: `${origin}${path.category(locale, parent.slug)}` }] : []),
            { '@type': 'ListItem', position: parent ? 3 : 2, name, item: `${origin}${self}` },
          ] },
          ...(data.items.length ? [{ '@type': 'ItemList', numberOfItems: data.page.total ?? data.items.length, itemListElement: data.items.map((it, i) => ({ '@type': 'ListItem', position: (data.page.number - 1) * data.page.perPage + i + 1, url: `${origin}${path.product(locale, it.slug)}` })) }] : []),
        ],
      }).replace(/</g, '\\u003c') }} />
      {/* G063–G064: the longer text, the size table and 3–5 questions, folded, below the products. */}
      <CategoryBelow name={name} text={text} sizes={sizes} />
    </div>
  );
}
