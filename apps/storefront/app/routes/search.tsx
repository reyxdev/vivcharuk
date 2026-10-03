import { Form, Link, useLoaderData, useRouteLoaderData } from 'react-router';
import { MascotScene } from '@/features/mascot/MascotScene';
import type { Locale, ProductListResponse } from '@vivcharyk/schemas';
import type { Route } from './+types/search';
import { apiGet } from '@/lib/api.server';
import { t } from '@/lib/i18n';
import { path } from '@/lib/segments';
import { Listing } from '@/features/catalog/components/Listing';
import { localeOf, originOf, pageMeta, titled } from '@/lib/seo';
import type { loader as layoutLoader } from './locale-layout';

const PASS = ['origin', 'inStock', 'priceMin', 'priceMax', 'sort', 'page'];

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
  if (q.length < 2) return { q, data: null };
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams) {
    if (PASS.includes(k) || /^filter\[[a-z_]+\]$/.test(k)) query[k] = query[k] ? `${query[k]},${v}` : v;
  }
  // Price fields are typed in hryvnias; the API takes kopecks.
  for (const k of ['priceMin', 'priceMax']) if (query[k]) query[k] = String(Math.round(Number(query[k].replace(',', '.')) * 100) || '');
  const { data } = await apiGet<ProductListResponse>('/products', locale, { sort: 'relevance', ...query, q });
  return { q, data };
}

// Search results are never indexed (29: internal search pages are noindex).
export function meta({ data, matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  return pageMeta({ title: titled(data?.q ? t(locale, 'search.titleQ', { q: data.q }) : t(locale, 'search.title'), locale), origin: originOf(matches), locale });
}

function SearchField({ q, big, locale }: { q: string; big?: boolean; locale: Locale }) {
  return (
    <Form method="get" role="search" className="flex w-full max-w-xl gap-2">
      <input name="q" type="search" defaultValue={q} autoFocus={big} minLength={2} maxLength={80} placeholder={t(locale, 'search.placeholder')} aria-label={t(locale, 'search.ask')}
        className="w-full rounded-lg border border-border-control bg-bg-surface px-4 py-3 text-body-lg text-text-primary" />
      <button type="submit" className="rounded-lg bg-bg-inverted px-5 text-body font-semibold text-text-on-inverted">{t(locale, 'search.submit')}</button>
    </Form>
  );
}

export default function Search() {
  const { q, data } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const locale = (layout?.locale ?? 'uk') as Locale;
  const categories = layout?.categories ?? [];

  // Round 11 #27: the shepherd searching for a sheep with a lantern, and the categories, so a lost
  // visitor still has somewhere to go.
  const empty = (
    <div className="flex flex-col gap-4">
      <MascotScene kind="search" className="w-80 max-w-full" />
      <p className="text-body-lg text-text-body">{t(locale, 'search.nothingFor', { q })}</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => <Link key={c.id} to={path.category(locale, c.slug)} className="rounded-full border border-border-control px-4 py-2 text-body text-text-primary">{c.name}</Link>)}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 py-8 lg:px-12">
      <h1 className="text-h1 text-text-primary">{q ? t(locale, 'search.h1Q', { q }) : t(locale, 'search.title')}</h1>
      <SearchField q={q} big={!q} locale={locale} />
      {data && <span className="text-body text-text-muted">{t(locale, 'catalog.count', { n: data.page.total ?? data.items.length })}</span>}
      {data && data.page.total === 0 && data.appliedFilters.length === 0 && empty}
      {data && (data.page.total !== 0 || data.appliedFilters.length > 0) && (
        <Listing data={data} locale={locale} hidden={{ q }} defaultSort="relevance"
          sorts={['relevance', 'popularity', 'newest', 'price_asc', 'price_desc', 'discount']} empty={empty} />
      )}
    </div>
  );
}
