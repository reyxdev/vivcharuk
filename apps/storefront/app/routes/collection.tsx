import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { Locale, ProductListResponse } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import type { Route } from './+types/collection';
import { apiGet, ApiError, redirectOr404 } from '@/lib/api.server';
import { t } from '@/lib/i18n';
import { path } from '@/lib/segments';
import { Listing } from '@/features/catalog/components/Listing';
import type { loader as layoutLoader } from './locale-layout';

const PASS = ['origin', 'inStock', 'priceMin', 'priceMax', 'sort', 'page'];

// Round 10 part 7 #22: a collection page is a category page — products and filters.
export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams) {
    if (PASS.includes(k) || /^filter\[[a-z_]+\]$/.test(k)) query[k] = query[k] ? `${query[k]},${v}` : v;
  }
  for (const k of ['priceMin', 'priceMax']) if (query[k]) query[k] = String(Math.round(Number(query[k].replace(',', '.')) * 100) || '');
  try {
    const { data } = await apiGet<ProductListResponse>('/products', locale, { ...query, collection: params.slug });
    const noindex = data.items.length === 0 || data.appliedFilters.length > 0 || !!query.origin || !!query.inStock || !!query.priceMin || !!query.priceMax;
    return { data, slug: params.slug, seo: noindex ? { robots: 'noindex,follow' } : {} };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) await redirectOr404(request);
    throw e;
  }
}

export function meta({ data }: Route.MetaArgs) {
  const c = data?.data.category;
  return c ? [{ title: c.metaTitle ?? `${c.name} — ${BUSINESS.brand}` }, ...(c.metaDescription ? [{ name: 'description', content: c.metaDescription }] : [])] : [];
}

export default function CollectionPage() {
  const { data, slug } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const locale = (layout?.locale ?? 'uk') as Locale;
  const name = data.category?.name ?? '';
  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 py-8 lg:px-12">
      <nav aria-label="breadcrumb" className="text-body-sm text-text-muted">
        <Link to={path.home(locale)} className="hover:underline">Головна</Link> › <span className="text-text-primary">{name}</span>
      </nav>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-h1 text-text-primary">{name}</h1>
        <span className="text-body text-text-muted">{t(locale, 'catalog.count', { n: data.page.total ?? data.items.length })}</span>
      </div>
      <Listing data={data} locale={locale} countBase={{ collection: slug }} />
      {data.category?.description && <section className="max-w-[72ch] whitespace-pre-line border-t border-border-hairline pt-8 text-body-lg text-text-body">{data.category.description}</section>}
    </div>
  );
}
