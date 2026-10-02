import { isRouteErrorResponse, Outlet, redirect, useLoaderData, useLocation, useRouteError, useRouteLoaderData } from 'react-router';
import { useMemo } from 'react';
import { DEFAULT_SITE_CONTACT, DEFAULT_TICKER, liveBusiness, type CategoryNode, type Locale, type SiteContact } from '@vivcharyk/schemas';
import type { Route } from './+types/locale-layout';
import { isEnabledLocale, isLocale } from '@/lib/locale';
import { alternatesFor, apiGet, apiGetCached } from '@/lib/api.server';
import { BusinessProvider } from '@/lib/business';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { FloatingUi } from '@/components/layout/FloatingUi';
import { SeoHead } from '@/components/layout/SeoHead';
import { ConsentBanner } from '@/features/consent/ConsentBanner';
import { NotFound } from '@/components/layout/NotFound';
import { PageMotion } from '@/components/layout/Motion';
import { AnnouncementStrip, type StripMessage } from '@/components/layout/AnnouncementStrip';
import { SEGMENTS, type SegmentKey } from '@/lib/segments';

interface SiteSettings { contact: SiteContact & { hours: string }; ticker: Array<{ text: string; linkUrl: string | null }> }

/** D39: the `/uk/` page matching a URL of a hidden locale — same page, else the home page. */
async function ukTarget(url: URL, from: Locale) {
  const [, ...parts] = url.pathname.split('/').filter(Boolean);
  if (!parts.length) return '/uk/';
  const key = (Object.keys(SEGMENTS) as SegmentKey[]).find((k) => SEGMENTS[k][from] === parts[0]);
  if (key === 'product') return (parts[1] && (await alternatesFor('product', parts[1], from)).uk) || '/uk/';
  if (key) return `/uk/${[SEGMENTS[key].uk, ...parts.slice(1)].join('/')}${url.search}`;
  return (await alternatesFor('category', parts.at(-1)!, from)).uk ?? '/uk/';
}
export async function loader({ params, request }: Route.LoaderArgs) {
  if (!isLocale(params.locale)) {
    // An unknown two-letter prefix is a locale we do not serve; anything else is a path that lost its
    // prefix (and may still 404 under /uk/, with the mascot).
    const parts = new URL(request.url).pathname.split('/').slice(1);
    const rest = /^[a-z]{2}$/.test(params.locale ?? '') ? parts.slice(1) : parts;
    throw redirect(`/uk/${rest.join('/')}`, 301);
  }
  // D39: a translated locale that is switched off sends the visitor to the same page in Ukrainian.
  if (!isEnabledLocale(params.locale)) throw redirect(await ukTarget(new URL(request.url), params.locale), 302);
  const [{ data }, ann, settings] = await Promise.all([
    apiGet<{ items: CategoryNode[]; partners?: boolean }>('/categories', params.locale),
    apiGet<{ seasonal: { text: string; linkUrl: string | null } | null }>('/site/announcement', params.locale).catch(() => ({ data: { seasonal: null } })),
    apiGetCached<SiteSettings>('/site/settings', 'uk').catch(() => null),
  ]);
  // The strip (round 11): the owner's phrases from the panel (D29; «Огляд перед оплатою» comes back only
  // while COD with inspection is really on offer, round 14). The seasonal message leads while active.
  const strip: StripMessage[] = [
    ...(ann.data.seasonal ? [{ text: ann.data.seasonal.text, href: ann.data.seasonal.linkUrl }] : []),
    ...(settings?.ticker ?? DEFAULT_TICKER.filter((t) => !t.cardOnly)).map((t) => ({ text: t.text, href: t.linkUrl })),
  ];
  // Absolute URLs for canonical and hreflang (29 §29.3 rule 4).
  return { locale: params.locale, categories: data.items, partners: !!data.partners, strip, contact: settings?.contact ?? null, origin: (process.env.SITE_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '') };
}

/** D28: the live hours, phone and e-mail for every component below (useBusiness). */
function Business({ contact, children }: { contact: SiteContact | null; children: React.ReactNode }) {
  const value = useMemo(() => liveBusiness(contact ?? DEFAULT_SITE_CONTACT), [contact]);
  return <BusinessProvider value={value}>{children}</BusinessProvider>;
}

export default function LocaleLayout() {
  const { locale, categories, partners, origin, strip, contact } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  return (
    <Business contact={contact}>
    <div className="flex min-h-dvh flex-col max-md:pb-16">
      <SeoHead origin={origin} locale={locale} />
      <AnnouncementStrip messages={strip} />
      <SiteHeader locale={locale} categories={categories} partners={partners} />
      <PageMotion />
      {/* The new page rises as the stitch finishes (#53); keyed by path so it replays per page. */}
      <main key={pathname} className="vk-page flex-1"><Outlet /></main>
      <SiteFooter locale={locale} />
      <CartDrawer locale={locale} />
      <FloatingUi locale={locale} />
      <ConsentBanner locale={locale} />
    </div>
    </Business>
  );
}

/** A missing page keeps the header and footer, so the visitor is still inside the shop. */
export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<typeof loader>('routes/locale-layout');
  const locale = data?.locale ?? 'uk';
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Business contact={data?.contact ?? null}>
    <div className="flex min-h-dvh flex-col max-md:pb-16">
      {data && <SiteHeader locale={locale} categories={data.categories} partners={data.partners} />}
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
    </Business>
  );
}
