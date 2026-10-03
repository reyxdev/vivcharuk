import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import { type CategoryNode, type Locale, type ProductDetail, type ProductListItem, type ProductListResponse, CustomSizeOutOfRange, priceCustomSize } from '@vivcharyk/schemas';
import type { Route } from './+types/product';
import { alternatesFor, apiGet, apiGetCached, ApiError, redirectOr404 } from '@/lib/api.server';
import { regionName, t } from '@/lib/i18n';
import { formatRange, formatUah } from '@/lib/money';
import { flyToCart, useChangeKey, useDebounced } from '@/lib/motion';
import { useUi } from '@/stores/uiStore';
import { path } from '@/lib/segments';
import { useAddToCart } from '@/features/cart/api';
import { useCartUiStore } from '@/stores/cartUiStore';
import { QuickOrder } from '@/features/product/QuickOrder';
import { WishHeart } from '@/features/wishlist/WishHeart';
import type { loader as layoutLoader } from './locale-layout';
import { Gallery } from '@/features/product/Gallery';
import { ogImage } from '@/lib/media';
import { originOf, pageMeta } from '@/lib/seo';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { isWool, productDescription, productJsonLd, productTitle, type Crumb, type ProductReview } from '@/features/product/productSeo';

/** Головна › Група › Підкатегорія (G001, G145): the product's first category, placed in the tree. */
function crumbsFor(tree: CategoryNode[], slug: string | undefined, locale: Locale): { crumbs: Crumb[]; leaf: string | null; group: string | null } {
  const home = { name: t(locale, 'common.home'), path: path.home(locale) };
  if (!slug) return { crumbs: [home], leaf: null, group: null };
  for (const g of tree) {
    if (g.slug === slug) return { crumbs: [home, { name: g.name, path: path.category(locale, g.slug) }], leaf: g.slug, group: null };
    const c = g.children.find((x) => x.slug === slug);
    if (c) return { crumbs: [home, { name: g.name, path: path.category(locale, g.slug) }, { name: c.name, path: path.category(locale, g.slug, c.slug) }], leaf: c.slug, group: g.slug };
  }
  return { crumbs: [home], leaf: null, group: null };
}

/** G082: 4–8 similar products — the same subcategory first, then the rest of its group. */
async function similarTo(p: ProductDetail, leaf: string | null, group: string | null, locale: Locale) {
  const list = (category: string) => apiGet<ProductListResponse>('/products', locale, { category, perPage: '12' }).then((r) => r.data.items).catch(() => [] as ProductListItem[]);
  const [a, b] = await Promise.all([leaf ? list(leaf) : [], group ? list(group) : []]);
  const seen = new Set([p.id]);
  return [...a, ...b].filter((i) => !seen.has(i.id) && seen.add(i.id)).slice(0, 8);
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  try {
    const [{ data, fallback }, alternates, tree, reviews] = await Promise.all([
      apiGet<ProductDetail>(`/products/${encodeURIComponent(params.slug)}`, locale),
      alternatesFor('product', params.slug, locale),
      apiGetCached<{ items: CategoryNode[] }>('/categories', locale).then((r) => r.items).catch(() => [] as CategoryNode[]),
      apiGet<{ items: ProductReview[] }>('/reviews', locale, { product: params.slug, perPage: '20' }).then((r) => r.data.items).catch(() => [] as ProductReview[]),
    ]);
    const { crumbs, leaf, group } = crumbsFor(tree, data.categories[0]?.slug, locale);
    const similar = await similarTo(data, leaf, group, locale);
    // A German URL serving Ukrainian copy is not indexed (26 §26.6, 29 §29.3 rule 6).
    return { product: data, locale, fallback, crumbs, reviews, similar, seo: { alternates, ...(fallback ? { robots: 'noindex,follow' } : {}) } };
  } catch (e) {
    // G045: a product that is gone leads to its category (the API's redirect lookup), else 404.
    if (e instanceof ApiError && e.status === 404) await redirectOr404(request);
    throw e;
  }
}

export function meta({ data, matches }: Route.MetaArgs) {
  if (!data) return [];
  const p = data.product;
  const photo = p.gallery[0] ?? p.media;
  // G132–G133: the main photo — its 1200×630 crop for a photo of the new pipeline, else its largest file.
  return pageMeta({
    title: productTitle(p, data.locale), description: productDescription(p, data.locale), origin: originOf(matches), type: 'product',
    image: photo ? { ...ogImage(photo.publicId), alt: photo.alt || p.name } : null, locale: data.locale,
  });
}

export default function ProductPage() {
  const { product: p, locale, crumbs, reviews, similar } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const en = locale === 'en';
  const axes = useMemo(() => [...new Set(p.variants.flatMap((v) => Object.keys(v.options)))], [p.variants]);
  const [choice, setChoice] = useState<Record<string, string>>(() => ({ ...Object.fromEntries(Object.entries(p.variants[0]?.options ?? {}).map(([k, o]) => [k, o.key])) }));
  const variant = p.variants.find((v) => axes.every((a) => v.options[a]?.key === choice[a]));
  const own = p.origin === 'OWN_MANUFACTURE';
  const add = useAddToCart(locale);
  const openCart = useCartUiStore((s) => s.setOpen);
  const [custom, setCustom] = useState<{ on: boolean; widthCm: string; lengthCm: string }>({ on: false, widthCm: '', lengthCm: '' });
  const cs = p.customSize;
  // Round 11 #35: the custom-size price updates after a 400 ms pause in typing.
  const typed = useDebounced(`${custom.widthCm}x${custom.lengthCm}`);
  const [dw, dl] = typed.split('x');
  let customPrice: number | null = null;
  let customError: string | null = null;
  if (cs && custom.on && dw && dl) {
    try { customPrice = priceCustomSize(cs, { widthCm: Number(dw), lengthCm: Number(dl) }); }
    catch (e) { if (e instanceof CustomSizeOutOfRange) customError = t(locale, 'product.rangeError', { axis: t(locale, e.axis === 'width' ? 'product.width' : 'product.length'), min: e.min, max: e.max }); }
  }
  const canAdd = custom.on ? customPrice !== null && typed === `${custom.widthCm}x${custom.lengthCm}` : !!variant && variant.stockHint !== 'OUT_OF_STOCK';
  const priceText = custom.on ? (customPrice !== null ? formatUah(customPrice, locale) : t(locale, 'product.from', { price: formatUah(cs?.minPriceMinor ?? 0, locale) })) : variant ? formatUah(variant.priceMinor, locale) : formatRange(p.priceMinMinor, p.priceMaxMinor, locale);
  // Round 11 #34: the price changes at once, with a brief highlight; the number itself never animates.
  const flash = useChangeKey(priceText);
  const gallery = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);
  // Round 11 #41: on phones a buy bar slides up once the main button has scrolled out of view,
  // and replaces the bottom bar while it shows.
  const buyBtn = useRef<HTMLButtonElement>(null);
  const [bar, setBar] = useState(false);
  const setBuyBar = useUi((s) => s.setBuyBar);
  useEffect(() => {
    // A scroll check rather than an IntersectionObserver: a fast flick can jump the button past the
    // viewport without it ever intersecting, and the bar must still appear.
    const on = () => { const el = buyBtn.current; setBar(!!el && el.getBoundingClientRect().bottom < 0); };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { const phone = window.matchMedia('(max-width: 767px)').matches; setBuyBar(bar && phone); return () => setBuyBar(false); }, [bar, setBuyBar]);
  // Round 11 B3a: «✓ Додано» and the announcement first, then the photo flies, then the drawer.
  const onAdd = () => {
    if (!variant && !p.variants[0]) return;
    const variantId = (variant ?? p.variants[0]!).id;
    add.mutate(
      custom.on ? { variantId, quantityMilli: 1000, customSpec: { widthCm: Number(custom.widthCm), lengthCm: Number(custom.lengthCm) } } : { variantId, quantityMilli: 1000 },
      {
        onSuccess: async () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
          await flyToCart(gallery.current);
          openCart(true);
        },
      },
    );
  };

  // G044: a sold-out product keeps its page and says so plainly; made-to-order says when.
  const stockLabel = !variant
    ? ''
    : variant.stockHint === 'FEW_LEFT' ? t(locale, 'product.fewLeft')
    : variant.stockHint === 'MADE_TO_ORDER' ? t(locale, 'product.madeToOrder', { n: variant.madeToOrderDays ?? 14 })
    : variant.stockHint === 'OUT_OF_STOCK' ? t(locale, 'product.outOfStock') : '';
  const origin = layout?.origin ?? '';
  const sizeAxis = axes.includes('size');
  const wool = isWool(p);
  const site = reviews.filter((r) => r.source === 'SITE');
  const average = site.length ? site.reduce((a, r) => a + r.rating, 0) / site.length : null;

  // G142: «Свій розмір» — the price per m², the minimum and the lead time, wherever the product allows it.
  const customSize = cs && (
    <>
      <button type="button" aria-pressed={custom.on} onClick={() => setCustom({ ...custom, on: !custom.on })}
        className={`flex min-h-11 items-center rounded-md border px-3 text-body ${custom.on ? 'border-text-primary bg-bg-surface font-semibold' : 'border-border-control'}`}>
        {t(locale, 'product.customSize')}
      </button>
    </>
  );
  const customPanel = cs && custom.on && (
    <div className="mt-2 flex flex-col gap-2 rounded-md bg-bg-surface p-3">
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-body-sm">{t(locale, 'product.widthCm')}
          <input inputMode="numeric" min={cs.minWidthCm} max={cs.maxWidthCm} value={custom.widthCm} onChange={(e) => setCustom({ ...custom, widthCm: e.target.value.replace(/\D/g, '') })} placeholder={`${cs.minWidthCm}–${cs.maxWidthCm}`} className="rounded-sm border border-border-control bg-bg-page px-2 py-2 text-body" />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-body-sm">{t(locale, 'product.lengthCm')}
          <input inputMode="numeric" min={cs.minLengthCm} max={cs.maxLengthCm} value={custom.lengthCm} onChange={(e) => setCustom({ ...custom, lengthCm: e.target.value.replace(/\D/g, '') })} placeholder={`${cs.minLengthCm}–${cs.maxLengthCm}`} className="rounded-sm border border-border-control bg-bg-page px-2 py-2 text-body" />
        </label>
      </div>
      {customError && <p role="alert" className="text-body-sm text-danger">{customError}</p>}
      <p className="text-caption text-text-muted">{t(locale, 'product.customNote', { rate: formatUah(cs.ratePerSqmMinor, locale), min: formatUah(cs.minPriceMinor, locale), n: cs.leadTimeDays })}</p>
    </div>
  );

  const specs: Array<[string, ReactNode]> = [
    ...(p.composition.length ? [[t(locale, 'product.composition'), p.composition.map((c) => `${c.percent}${en ? '' : '\u00a0'}% ${c.material}`).join(', ')] as [string, ReactNode]] : []),
    ...(variant?.options.size ? [[t(locale, 'product.axis.size'), variant.options.size.label] as [string, ReactNode]] : []),
    ...p.attributes.filter((a) => a.value).map((a) => [a.label, a.value] as [string, ReactNode]),
    ...(variant?.stockHint === 'MADE_TO_ORDER' && variant.madeToOrderDays ? [[t(locale, 'product.making'), t(locale, 'product.makingValue', { n: variant.madeToOrderDays })] as [string, ReactNode]] : []),
    ...(cs ? [[t(locale, 'product.customSize'), t(locale, 'product.customSpec', { rate: formatUah(cs.ratePerSqmMinor, locale), min: formatUah(cs.minPriceMinor, locale), n: cs.leadTimeDays })] as [string, ReactNode]] : []),
    ...(wool ? [[t(locale, 'product.care'), <>{t(locale, 'product.careText')} <Link to={path.seg(locale, 'care')} className="underline">{t(locale, 'product.careLink')}</Link></>] as [string, ReactNode]] : []),
    ...(own ? [[t(locale, 'product.madeAt'), t(locale, 'product.madeAtValue')] as [string, ReactNode]] : []),
    [t(locale, 'product.sku'), variant?.sku ?? p.sku],
  ];

  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-12 px-4 pb-8 pt-3 md:pt-8 lg:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p, origin, locale as Locale, crumbs, reviews)).replace(/</g, '\\u003c') }} />
      <div className="grid gap-5 md:gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex min-w-0 flex-col gap-2">
        {/* G170: on phones the trail is one step back, above the photos, so the name and the price are on the first screen. */}
        {crumbs.length > 1 && <Link to={crumbs.at(-1)!.path} className="inline-flex min-h-6 items-center self-start text-body-sm text-text-muted hover:underline md:hidden">‹ {crumbs.at(-1)!.name}</Link>}
        <Gallery ref={gallery} photos={p.gallery} empty={t(locale, 'product.photoSoon')} transitionName={`p-${p.slug}`} />
      </div>

      <div className="flex flex-col gap-5">
        {/* G001, G145: the same trail as the BreadcrumbList — Головна › Група › Підкатегорія. */}
        <nav aria-label="breadcrumb" className="text-body-sm text-text-muted max-md:hidden">
          {crumbs.map((c, i) => <Fragment key={c.path}>{i > 0 && ' › '}<Link to={c.path} className="hover:underline">{c.name}</Link></Fragment>)}
        </nav>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-h1 text-text-primary max-md:text-[1.75rem]">{p.name}</h1>
          <WishHeart slug={p.slug} name={p.name} size="size-6" className="mt-2 shrink-0 border border-border-control" />
        </div>
        <span className="text-body-sm text-text-muted">{own ? `◆ ${t(locale, 'product.own')}` : `◇ ${t(locale, 'product.partner')}${p.partnerRegion ? ` · ${regionName(p.partnerRegion, locale)}` : ''}`}</span>
        <div className="flex flex-col gap-1">
          <p className="text-h3 font-semibold text-text-primary" aria-live="polite">
            <span key={flash} className={`-mx-1 px-1 ${flash ? 'vk-flash' : ''}`}>{priceText}</span>
            {variant?.compareAtMinor && variant.compareAtMinor > variant.priceMinor && (
              <span className="ml-3 text-body text-text-muted line-through">{formatUah(variant.compareAtMinor, locale)}</span>
            )}
          </p>
          {/* G144: the price is final — the seller is a ФОП without VAT. */}
          <span className="text-caption text-text-muted">{t(locale, 'product.finalPrice')}</span>
        </div>

        {axes.map((axis) => {
          const values = [...new Map(p.variants.map((v) => v.options[axis]).filter(Boolean).map((o) => [o!.key, o!])).values()];
          return (
            <fieldset key={axis} className="flex flex-col gap-2">
              <legend className="mb-2 text-body font-semibold text-text-primary">{values[0] ? axisLabel(axis, locale) : axis}</legend>
              <div className="flex flex-wrap gap-2">
                {values.map((o) => {
                  const active = choice[axis] === o.key;
                  return (
                    <button key={o.key} type="button" aria-pressed={active} onClick={() => setChoice({ ...choice, [axis]: o.key })}
                      className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-body ${active ? 'border-text-primary bg-bg-surface font-semibold' : 'border-border-control'}`}>
                      {o.hex && <span className="size-4 rounded-full border border-border-control" style={{ background: o.hex }} aria-hidden="true" />}
                      {o.label}
                    </button>
                  );
                })}
                {axis === 'size' && customSize}
              </div>
              {axis === 'size' && customPanel}
            </fieldset>
          );
        })}
        {/* A product without a size choice can still be made to measure (G142). */}
        {cs && !sizeAxis && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-body font-semibold text-text-primary">{t(locale, 'product.axis.size')}</legend>
            <div className="flex flex-wrap gap-2">{customSize}</div>
            {customPanel}
          </fieldset>
        )}

        {stockLabel && <p className="text-body font-semibold text-text-body">{stockLabel}</p>}
        <button ref={buyBtn} type="button" disabled={!canAdd || add.isPending} onClick={onAdd} aria-busy={add.isPending} className={`min-h-12 rounded-md bg-bg-inverted px-6 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${add.isPending ? 'vk-busy disabled:opacity-100' : ''}`}>
          {add.isPending ? t(locale, 'common.wait') : added ? t(locale, 'product.added') : t(locale, 'product.addToCart')}
        </button>
        <p className="sr-only" role="status">{added ? t(locale, 'product.addedToCart') : ''}</p>
        {bar && (
          <div className="vk-sheet fixed inset-x-0 bottom-0 z-(--z-sticky) flex items-center gap-3 border-t border-border-hairline bg-bg-page/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-sm text-text-muted">{p.name}</span>
              <span className="text-body font-semibold text-text-primary">{priceText}</span>
            </span>
            <button type="button" disabled={!canAdd || add.isPending} onClick={onAdd} aria-busy={add.isPending} className={`min-h-11 shrink-0 rounded-md bg-bg-inverted px-5 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${add.isPending ? 'vk-busy disabled:opacity-100' : ''}`}>
              {add.isPending ? t(locale, 'common.wait') : added ? t(locale, 'product.added') : t(locale, 'product.addToCart')}
            </button>
          </div>
        )}
        {/* Round 10 part 4 #10: uk only, stocked items only, hidden while «Свій розмір» is chosen. */}
        {locale === 'uk' && !custom.on && p.pricingUnit === 'PIECE' && variant && (variant.stockHint === 'IN_STOCK' || variant.stockHint === 'FEW_LEFT') && (
          <QuickOrder variantId={variant.id} label={[p.name, ...Object.values(variant.options).map((o) => o.label)].join(' · ')} />
        )}
        {add.isError && <p role="alert" className="text-body-sm text-danger">{t(locale, 'product.addFailed')}</p>}

        {/* G088: delivery and returns as two lines and a link, next to the button. */}
        {en ? (
          <ul className="flex flex-col gap-1.5 border-t border-border-hairline pt-4 text-body-sm text-text-body">
            <li>Delivery within Ukraine by Nova Poshta and Ukrposhta — we ship in 2–4 days{variant?.stockHint === 'MADE_TO_ORDER' ? ' after the piece is made' : ''}; international delivery is not available. <Link to={path.seg(locale, 'delivery')} className="underline">Delivery and payment</Link></li>
            <li>Return or exchange within 14 days of receipt. <Link to={path.seg(locale, 'returns')} className="underline">Returns</Link></li>
          </ul>
        ) : (
        <ul className="flex flex-col gap-1.5 border-t border-border-hairline pt-4 text-body-sm text-text-body">
          <li>Доставка по Україні Новою поштою й Укрпоштою — відправляємо за 2–4 дні{variant?.stockHint === 'MADE_TO_ORDER' ? ' після виготовлення' : ''}. <Link to={path.seg(locale, 'delivery')} className="underline">Доставка і оплата</Link></li>
          <li>Повернення або обмін — 14 днів від отримання. <Link to={path.seg(locale, 'returns')} className="underline">Повернення</Link></li>
        </ul>
        )}

        {p.description && (
          <section className="flex flex-col gap-2">
            <h2 className="text-h4 text-text-primary">{t(locale, 'product.description')}</h2>
            <div className="whitespace-pre-line text-body text-text-body">{p.description}</div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-h4 text-text-primary">{t(locale, 'product.specs')}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-body">
            {specs.map(([k, v]) => <Fragment key={k}><dt className="text-text-muted">{k}</dt><dd>{v}</dd></Fragment>)}
          </dl>
        </section>
      </div>
      </div>

      {/* G086, G120: the reviews of this product, as they are shown — and the rating only from those on the site. */}
      {reviews.length > 0 && (
        <section aria-labelledby="p-reviews" className="flex flex-col gap-4">
          <h2 id="p-reviews" className="text-h3 text-text-primary">
            {t(locale, 'product.reviews')}{average !== null && <span className="ml-3 text-body font-normal text-text-muted">{average.toLocaleString(en ? 'en-GB' : 'uk-UA', { maximumFractionDigits: 1 })} ★ · {t(locale, 'product.reviewsOnSite', { n: site.length })}</span>}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 rounded-xl border border-border-hairline bg-bg-surface p-5">
                <span className="flex flex-wrap items-center gap-x-3 text-body">
                  <span className="tracking-wider text-accent" role="img" aria-label={t(locale, 'product.ratingOf', { n: r.rating })}>{'★'.repeat(r.rating)}<span className="text-border-control">{'★'.repeat(5 - r.rating)}</span></span>
                  <span className="font-semibold text-text-primary">{r.author}</span>
                  <span className="text-caption text-text-muted">{new Date(r.date).toLocaleDateString(en ? 'en-GB' : 'uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </span>
                {r.source === 'PROM' && <span className="self-start rounded-full border border-border-control px-2 py-0.5 text-caption text-text-muted">{t(locale, 'product.promImported')}</span>}
                {r.title && <h3 className="text-h4 text-text-primary">{r.title}</h3>}
                <p className="whitespace-pre-line text-body text-text-body">{r.body}</p>
                {r.reply && <p className="rounded-md bg-bg-alt p-3 text-body-sm text-text-body"><span className="block font-semibold text-text-primary">{t(locale, 'product.reply')}</span>{r.reply}</p>}
              </li>
            ))}
          </ul>
          <Link to={`${path.seg(locale, 'reviews')}?product=${encodeURIComponent(p.slug)}`} rel="nofollow" className="self-start text-body text-text-primary underline">{t(locale, 'product.writeReview')}</Link>
        </section>
      )}

      {/* G082, G044: similar products — the same subcategory first, then its group. */}
      {similar.length > 0 && (
        <section aria-labelledby="p-similar" className="flex flex-col gap-6">
          <h2 id="p-similar" className="text-h3 text-text-primary">{t(locale, 'product.similar')}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {similar.map((i) => <ProductCard key={i.id} item={i} locale={locale} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function axisLabel(axis: string, locale: Locale) {
  return axis === 'size' || axis === 'color' || axis === 'pattern' ? t(locale, `product.axis.${axis}`) : axis;
}
