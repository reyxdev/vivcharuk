import { Link } from 'react-router';
import type { Locale, ProductListItem } from '@vivcharyk/schemas';
import { t } from '@/lib/i18n';
import { formatRange } from '@/lib/money';
import { path } from '@/lib/segments';
import { WishHeart } from '@/features/wishlist/WishHeart';
import { mediaSrcSet, mediaUrl } from '@/lib/media';

// Missing photo → placeholder in the collection colour (37 §37.7 fallbacks).
function Photo({ item, locale, dim }: { item: ProductListItem; locale: Locale; dim: boolean }) {
  return (
    // Round 11 #54: the same view-transition name as the product page gallery — the photo grows into it.
    // Round 18: the whole product is shown (contain), never cropped; 4:5 suits both upright and folded shots.
    <div className="grid aspect-[4/5] place-items-center rounded-md bg-bg-alt text-caption text-text-muted" style={{ viewTransitionName: `p-${item.slug}` }}>
      {item.media ? (
        <img src={mediaUrl(item.media.publicId, 480)} srcSet={mediaSrcSet(item.media.publicId)} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw" alt={item.media.alt} width={item.media.width} height={item.media.height} loading="lazy" decoding="async" className={`size-full rounded-md object-contain ${dim ? 'opacity-50 grayscale' : ''}`} />
      ) : (
        <span>{t(locale, 'product.photoSoon')}</span>
      )}
    </div>
  );
}

export function ProductCard({ item, locale }: { item: ProductListItem; locale: Locale }) {
  const own = item.origin === 'OWN_MANUFACTURE';
  return (
    <div className={`relative ${item.inStock ? 'vk-lift' : ''}`}>
    <Link to={path.product(locale, item.slug)} viewTransition className="group flex flex-col gap-2">
      <div className="relative">
        {/* Sold out: only the photo is dimmed; the name and price keep full contrast (WCAG 1.4.3). */}
        <Photo item={item} locale={locale} dim={!item.inStock} />
        <div className="absolute left-2 top-2 flex gap-1">
          {item.badges.map((b) => (
            <span key={b} className="rounded-sm bg-bg-inverted px-2 py-0.5 text-caption font-semibold text-text-on-inverted">{t(locale, `badge.${b}`)}</span>
          ))}
        </div>
        {!item.inStock && <span className="absolute inset-x-2 bottom-2 rounded-sm bg-bg-surface px-2 py-1 text-center text-caption font-semibold text-text-primary">{t(locale, 'product.outOfStock')}</span>}
      </div>
      <span className="text-body font-medium text-text-primary group-hover:underline">{item.name}</span>
      {/* Origin is on every card at equal weight (01 §1.7b): ◆ own, ◇ partner. */}
      <span className="text-caption text-text-muted">{own ? `◆ ${t(locale, 'product.own')}` : `◇ ${t(locale, 'product.partner')}${item.partnerRegion ? ` · ${item.partnerRegion}` : ''}`}</span>
      <span className="text-body font-semibold text-text-primary">{formatRange(item.priceMinMinor, item.priceMaxMinor, locale)}</span>
    </Link>
    <WishHeart slug={item.slug} name={item.name} className="absolute right-2 top-2" />
    </div>
  );
}
