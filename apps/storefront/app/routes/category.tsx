import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale, ProductListResponse } from '@vivcharyk/schemas';
import type { Route } from './+types/category';
import { alternatesFor, apiGet, ApiError, redirectOr404 } from '@/lib/api.server';
import { t } from '@/lib/i18n';
import { path } from '@/lib/segments';
import { Listing } from '@/features/catalog/components/Listing';
import type { loader as layoutLoader } from './locale-layout';

const PASS = ['origin', 'inStock', 'priceMin', 'priceMax', 'sort', 'page'];

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams) {
    if (PASS.includes(k) || /^filter\[[a-z_]+\]$/.test(k)) query[k] = query[k] ? `${query[k]},${v}` : v;
  }
  // Price fields are typed in hryvnias; the API takes kopecks.
  for (const k of ['priceMin', 'priceMax']) if (query[k]) query[k] = String(Math.round(Number(query[k].replace(',', '.')) * 100) || '');
  try {
    const slug = params.sub ?? params.category!;
    const [{ data }, alternates] = await Promise.all([
      apiGet<ProductListResponse>('/products', locale, { ...query, category: slug }),
      alternatesFor('category', slug, locale),
    ]);
    // Filtered or empty listings are `noindex, follow` (29 §29.7); sort and page never change indexability.
    const noindex = data.items.length === 0 || data.appliedFilters.length > 0 || !!query.origin || !!query.inStock || !!query.priceMin || !!query.priceMax;
    return { data, slug, parentSlug: params.category!, seo: { alternates, ...(noindex ? { robots: 'noindex,follow' } : {}) } };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) await redirectOr404(request);
    throw e;
  }
}

export function meta({ data }: Route.MetaArgs) {
  const c = data?.data.category;
  return [
    ...(c ? [{ title: c.metaTitle ?? `${c.name} — Вівчарик` }, ...(c.metaDescription ? [{ name: 'description', content: c.metaDescription }] : [])] : []),
  ];
}

function findNode(nodes: CategoryNode[], slug: string): CategoryNode | undefined {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const hit = findNode(n.children, slug);
    if (hit) return hit;
  }
}

export default function CategoryPage() {
  const { data, slug, parentSlug } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const locale = (layout?.locale ?? 'uk') as Locale;
  const origin = layout?.origin ?? '';
  const tree = layout?.categories ?? [];
  const node = findNode(tree, slug);
  const parent = findNode(tree, parentSlug);

  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 py-8 lg:px-12">
      <nav aria-label="breadcrumb" className="text-body-sm text-text-muted">
        <Link to={path.home(locale)} className="hover:underline">Головна</Link>
        {parent && parent.slug !== slug && <> › <Link to={path.category(locale, parent.slug)} className="hover:underline">{parent.name}</Link></>}
        {' › '}<span className="text-text-primary">{node?.name}</span>
      </nav>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-h1 text-text-primary">{node?.name}</h1>
        <span className="text-body text-text-muted">{t(locale, 'catalog.count', { n: data.page.total ?? data.items.length })}</span>
      </div>

      <Listing data={data} locale={locale} countBase={{ category: slug }} before={parent && parent.children.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-body font-semibold text-text-primary">Тип</legend>
          {parent.children.map((c) => (
            <Link key={c.id} to={path.category(locale, parent.slug, c.slug)} className={`text-body ${c.slug === slug ? 'font-semibold text-text-primary' : 'text-text-body'} hover:underline`}>{c.name}</Link>
          ))}
        </fieldset>
      )} />
      {/* BreadcrumbList and ItemList (29 §29.6): the listing as it is, page by page. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Головна', item: `${origin}${path.home(locale)}` },
            ...(parent && parent.slug !== slug ? [{ '@type': 'ListItem', position: 2, name: parent.name, item: `${origin}${path.category(locale, parent.slug)}` }] : []),
            { '@type': 'ListItem', position: parent && parent.slug !== slug ? 3 : 2, name: node?.name ?? '', item: `${origin}${parent && parent.slug !== slug ? path.category(locale, parent.slug, slug) : path.category(locale, slug)}` },
          ] },
          { '@type': 'ItemList', itemListElement: data.items.map((it, i) => ({ '@type': 'ListItem', position: (data.page.number - 1) * data.page.perPage + i + 1, url: `${origin}${path.product(locale, it.slug)}` })) },
        ],
      }).replace(/</g, '\\u003c') }} />
      {/* Round 10 part 3 #12: nothing above the products but the H1; the longer text goes below them. */}
      {data.category?.description && <section className="max-w-[72ch] whitespace-pre-line border-t border-border-hairline pt-8 text-body-lg text-text-body">{data.category.description}</section>}
    </div>
  );
}
