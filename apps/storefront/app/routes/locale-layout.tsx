import { isRouteErrorResponse, Outlet, redirect, useLoaderData, useLocation, useRouteError, useRouteLoaderData } from 'react-router';
import type { CategoryNode } from '@vivcharyk/schemas';
import type { Route } from './+types/locale-layout';
import { isLocale } from '@/lib/locale';
import { apiGet } from '@/lib/api.server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { FloatingUi } from '@/components/layout/FloatingUi';
import { SeoHead } from '@/components/layout/SeoHead';
import { ConsentBanner } from '@/features/consent/ConsentBanner';
import { NotFound } from '@/components/layout/NotFound';
import { PageMotion } from '@/components/layout/Motion';
import { AnnouncementStrip, type StripMessage } from '@/components/layout/AnnouncementStrip';
import { BUSINESS } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';

export async function loader({ params, request }: Route.LoaderArgs) {
  if (!isLocale(params.locale)) {
    // An unknown two-letter prefix is a locale we do not serve; anything else is a path that lost its
    // prefix (and may still 404 under /uk/, with the mascot).
    const parts = new URL(request.url).pathname.split('/').slice(1);
    const rest = /^[a-z]{2}$/.test(params.locale ?? '') ? parts.slice(1) : parts;
    throw redirect(`/uk/${rest.join('/')}`, 301);
  }
  const [{ data }, ann, facts] = await Promise.all([
    apiGet<{ items: CategoryNode[] }>('/categories', params.locale),
    apiGet<{ seasonal: { text: string; linkUrl: string | null } | null }>('/site/announcement', params.locale).catch(() => ({ data: { seasonal: null } })),
    apiGet<{ cardPayments: boolean }>('/site/facts', params.locale).catch(() => ({ data: { cardPayments: false } })),
  ]);
  // Round 11 strip messages; «Огляд перед оплатою» only while COD with inspection is really on offer
  // (it needs the card deposit, round 14). The seasonal message leads while active.
  const l = params.locale;
  const strip: StripMessage[] = [
    ...(ann.data.seasonal ? [{ text: ann.data.seasonal.text, href: ann.data.seasonal.linkUrl }] : []),
    { text: 'Відправляємо по Україні за 2–4 дні', href: path.seg(l, 'delivery') },
    ...(facts.data.cardPayments ? [{ text: 'Огляд перед оплатою на пошті', href: path.seg(l, 'delivery') }] : []),
    { text: BUSINESS.tagline.replace(/\.$/, '') },
    { text: 'Зроблено в Яворові', href: path.seg(l, 'production') },
  ];
  // Absolute URLs for canonical and hreflang (29 §29.3 rule 4).
  return { locale: params.locale, categories: data.items, strip, origin: (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '') };
}

export default function LocaleLayout() {
  const { locale, categories, origin, strip } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col max-md:pb-16">
      <SeoHead origin={origin} locale={locale} />
      <AnnouncementStrip messages={strip} />
      <SiteHeader locale={locale} categories={categories} />
      <PageMotion />
      {/* The new page rises as the stitch finishes (#53); keyed by path so it replays per page. */}
      <main key={pathname} className="vk-page flex-1"><Outlet /></main>
      <SiteFooter locale={locale} />
      <CartDrawer locale={locale} />
      <FloatingUi locale={locale} />
      <ConsentBanner locale={locale} />
    </div>
  );
}

/** A missing page keeps the header and footer, so the visitor is still inside the shop. */
export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<typeof loader>('routes/locale-layout');
  const locale = data?.locale ?? 'uk';
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="flex min-h-dvh flex-col max-md:pb-16">
      {data && <SiteHeader locale={locale} categories={data.categories} />}
      <main className="flex-1">
        {missing ? <NotFound locale={locale} /> : (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
            <h1 className="text-h2 text-text-primary">Щось пішло не так</h1>
            <p className="text-body text-text-muted">Спробуйте оновити сторінку за хвилину. Якщо не допоможе — зателефонуйте нам.</p>
          </div>
        )}
      </main>
      {data && <SiteFooter locale={locale} />}
      {data && <CartDrawer locale={locale} />}
    </div>
  );
}
