import { data, isRouteErrorResponse, useRouteError } from 'react-router';
import { isEnabledLocale } from '@/lib/locale';
import type { CategoryNode, Locale } from '@vivcharyk/schemas';
import type { Route } from './+types/not-found';
import { apiGet, redirectOr404 } from '@/lib/api.server';
import { NotFound } from '@/components/layout/NotFound';

// A 404 outside the locale layout still offers the stocked categories (round 24 G043).
export async function loader({ request }: Route.LoaderArgs) {
  try {
    return await redirectOr404(request);
  } catch (e) {
    if (!(e instanceof Response) || e.status !== 404) throw e;
    // An English address that does not exist gets the English page (G093).
    const first = new URL(request.url).pathname.split('/')[1];
    const locale = isEnabledLocale(first) ? first : 'uk';
    const categories = await apiGet<{ items: CategoryNode[] }>('/categories', locale).then((r) => r.data.items).catch(() => []);
    throw data({ categories, locale }, { status: 404 });
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  const d = isRouteErrorResponse(error) ? (error.data as { categories?: CategoryNode[]; locale?: Locale } | null) : null;
  return <main className="grid min-h-dvh place-items-center bg-bg-page"><NotFound categories={d?.categories} locale={d?.locale ?? 'uk'} /></main>;
}

export default function NotFound404() {
  return null;
}
