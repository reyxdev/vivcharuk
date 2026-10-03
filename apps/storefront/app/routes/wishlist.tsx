import { useEffect, useState } from 'react';
import { Link, useRouteLoaderData } from 'react-router';
import type { Locale, ProductListItem } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';
import { localeOf, originOf, pageMeta, titled } from '@/lib/seo';
import { t } from '@/lib/i18n';
import type { Route } from './+types/wishlist';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useWishlist } from '@/stores/wishlistStore';
import type { loader as layoutLoader } from './locale-layout';

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  return pageMeta({ title: titled(t(locale, 'header.wishlist'), locale), origin: originOf(matches), locale });
}

/** The wishlist is browser-only (round 9 part 3 #25), so this page renders on the client. */
export default function WishlistPage() {
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const locale = (layout?.locale ?? 'uk') as Locale;
  const slugs = useWishlist((s) => s.slugs);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<ProductListItem[] | null>(null);

  useEffect(() => { void Promise.resolve(useWishlist.persist.rehydrate()).then(() => setReady(true)); }, []);
  useEffect(() => {
    if (!ready) return;
    if (!slugs.length) { setItems([]); return; }
    fetch(`/api/v1/products?locale=${locale}&perPage=48&slugs=${encodeURIComponent(slugs.join(','))}`)
      .then((r) => r.json()).then((d: { items: ProductListItem[] }) => setItems(slugs.map((s) => d.items.find((i) => i.slug === s)).filter((i): i is ProductListItem => !!i)))
      .catch(() => setItems([]));
  }, [ready, slugs, locale]);

  const first = layout?.categories[0];
  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 py-8 lg:px-12">
      <h1 className="text-h1 text-text-primary">{t(locale, 'header.wishlist')}</h1>
      {items === null && <p className="text-body text-text-muted">{t(locale, 'wishlist.loading')}</p>}
      {items?.length === 0 && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body-lg text-text-body">{t(locale, 'wishlist.empty')}</p>
          {first && <Link to={path.category(locale, first.slug)} className="rounded-lg bg-bg-inverted px-5 py-3 text-body font-semibold text-text-on-inverted">{t(locale, 'wishlist.toCatalog')}</Link>}
        </div>
      )}
      {items && items.length > 0 && (
        <>
          <p className="text-body-sm text-text-muted">{t(locale, 'wishlist.localOnly')}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => <ProductCard key={p.id} item={p} locale={locale} />)}
          </div>
        </>
      )}
    </div>
  );
}
