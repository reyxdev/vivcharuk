import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import { type Locale, type ProductDetail, CustomSizeOutOfRange, priceCustomSize } from '@vivcharyk/schemas';
import type { Route } from './+types/product';
import { alternatesFor, apiGet, ApiError, redirectOr404 } from '@/lib/api.server';
import { t } from '@/lib/i18n';
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
import { mediaUrl } from '@/lib/media';

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  try {
    const [{ data, fallback }, alternates] = await Promise.all([
      apiGet<ProductDetail>(`/products/${encodeURIComponent(params.slug)}`, locale),
      alternatesFor('product', params.slug, locale),
    ]);
    // A German URL serving Ukrainian copy is not indexed (26 §26.6, 29 §29.3 rule 6).
    return { product: data, locale, fallback, seo: { alternates, ...(fallback ? { robots: 'noindex,follow' } : {}) } };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) await redirectOr404(request);
    throw e;
  }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [];
  const p = data.product;
  const tags = [{ title: p.metaTitle ?? `${p.name} — Вівчарик` }, { name: 'description', content: p.metaDescription ?? p.description.slice(0, 160) }];
  return tags;
}

// Local media paths are relative; structured data needs absolute URLs.
const absolute = (origin: string, u: string) => (u.startsWith('http') ? u : `${origin}${u}`);

/** schema.org Product: brand Вівчарик on both origins; manufacturer only for own goods (26 §26.10.1). */
function jsonLd(p: ProductDetail, origin: string, locale: Locale) {
  const url = `${origin}${path.product(locale, p.slug)}`;
  const cat = p.categories[0];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product', '@id': `${url}#product`, url, name: p.name, sku: p.sku, description: p.description,
        brand: { '@type': 'Brand', name: p.schemaBrand },
        ...(p.schemaManufacturer ? { manufacturer: { '@id': `${origin}/#organization` } } : {}),
        ...(p.gallery.length ? { image: p.gallery.map((m) => absolute(origin, mediaUrl(m.publicId, 1600))) } : {}),
        offers: p.variants.map((v) => ({
          '@type': 'Offer', sku: v.sku, url, price: (v.priceMinor / 100).toFixed(2), priceCurrency: p.currency, itemCondition: 'https://schema.org/NewCondition',
          availability: v.inStock ? 'https://schema.org/InStock' : v.madeToOrderDays ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock',
          seller: { '@id': `${origin}/#organization` },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Головна', item: `${origin}${path.home(locale)}` },
          ...(cat ? [{ '@type': 'ListItem', position: 2, name: cat.name, item: `${origin}${path.category(locale, cat.slug)}` }] : []),
          { '@type': 'ListItem', position: cat ? 3 : 2, name: p.name, item: url },
        ],
      },
    ],
  };
}

export default function ProductPage() {
  const { product: p, locale } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
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
    catch (e) { if (e instanceof CustomSizeOutOfRange) customError = `${e.axis === 'width' ? 'Ширина' : 'Довжина'}: від ${e.min} до ${e.max} см`; }
  }
  const canAdd = custom.on ? customPrice !== null && typed === `${custom.widthCm}x${custom.lengthCm}` : !!variant && variant.stockHint !== 'OUT_OF_STOCK';
  const priceText = custom.on ? (customPrice !== null ? formatUah(customPrice, locale) : `від ${formatUah(cs?.minPriceMinor ?? 0, locale)}`) : variant ? formatUah(variant.priceMinor, locale) : formatRange(p.priceMinMinor, p.priceMaxMinor, locale);
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

  const stockLabel = !variant
    ? ''
    : variant.stockHint === 'FEW_LEFT' ? t(locale, 'product.fewLeft')
    : variant.stockHint === 'MADE_TO_ORDER' ? t(locale, 'product.madeToOrder', { n: variant.madeToOrderDays ?? 14 })
    : variant.stockHint === 'OUT_OF_STOCK' ? t(locale, 'product.outOfStock') : '';

  return (
    <div className="mx-auto grid max-w-(--container-wide) gap-10 px-4 py-8 lg:grid-cols-[1.2fr_1fr] lg:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p, layout?.origin ?? '', locale as Locale)).replace(/</g, '\\u003c') }} />
      <Gallery ref={gallery} photos={p.gallery} empty={t(locale, 'product.photoSoon')} transitionName={`p-${p.slug}`} />

      <div className="flex flex-col gap-5">
        <nav aria-label="breadcrumb" className="text-body-sm text-text-muted">
          <Link to={path.home(locale)} className="hover:underline">Головна</Link>
          {p.categories[0] && <> › <Link to={path.category(locale, p.categories[0].slug)} className="hover:underline">{p.categories[0].name}</Link></>}
        </nav>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-h1 text-text-primary">{p.name}</h1>
          <WishHeart slug={p.slug} name={p.name} size="size-6" className="mt-2 shrink-0 border border-border-control" />
        </div>
        <span className="text-body-sm text-text-muted">{own ? `◆ ${t(locale, 'product.own')}` : `◇ ${t(locale, 'product.partner')}${p.partnerRegion ? ` · ${p.partnerRegion}` : ''}`}</span>
        <p className="text-h3 font-semibold text-text-primary" aria-live="polite">
          <span key={flash} className={`-mx-1 px-1 ${flash ? 'vk-flash' : ''}`}>{priceText}</span>
          {variant?.compareAtMinor && variant.compareAtMinor > variant.priceMinor && (
            <span className="ml-3 text-body text-text-muted line-through">{formatUah(variant.compareAtMinor, locale)}</span>
          )}
        </p>

        {axes.map((axis) => {
          const values = [...new Map(p.variants.map((v) => v.options[axis]).filter(Boolean).map((o) => [o!.key, o!])).values()];
          return (
            <fieldset key={axis} className="flex flex-col gap-2">
              <legend className="mb-2 text-body font-semibold text-text-primary">{values[0] ? axisLabel(axis) : axis}</legend>
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
                {axis === 'size' && cs && (
                  <button type="button" aria-pressed={custom.on} onClick={() => setCustom({ ...custom, on: !custom.on })}
                    className={`flex min-h-11 items-center rounded-md border px-3 text-body ${custom.on ? 'border-text-primary bg-bg-surface font-semibold' : 'border-border-control'}`}>
                    Свій розмір
                  </button>
                )}
              </div>
              {axis === 'size' && cs && custom.on && (
                <div className="mt-2 flex flex-col gap-2 rounded-md bg-bg-surface p-3">
                  <div className="flex gap-3">
                    <label className="flex flex-1 flex-col gap-1 text-body-sm">Ширина, см
                      <input inputMode="numeric" min={cs.minWidthCm} max={cs.maxWidthCm} value={custom.widthCm} onChange={(e) => setCustom({ ...custom, widthCm: e.target.value.replace(/\D/g, '') })} placeholder={`${cs.minWidthCm}–${cs.maxWidthCm}`} className="rounded-sm border border-border-control bg-bg-page px-2 py-2 text-body" />
                    </label>
                    <label className="flex flex-1 flex-col gap-1 text-body-sm">Довжина, см
                      <input inputMode="numeric" min={cs.minLengthCm} max={cs.maxLengthCm} value={custom.lengthCm} onChange={(e) => setCustom({ ...custom, lengthCm: e.target.value.replace(/\D/g, '') })} placeholder={`${cs.minLengthCm}–${cs.maxLengthCm}`} className="rounded-sm border border-border-control bg-bg-page px-2 py-2 text-body" />
                    </label>
                  </div>
                  {customError && <p role="alert" className="text-body-sm text-danger">{customError}</p>}
                  <p className="text-caption text-text-muted">Виготовимо за {cs.leadTimeDays} днів. Оплата — повна, карткою онлайн. Виріб на індивідуальний розмір поверненню не підлягає, окрім браку.</p>
                </div>
              )}
            </fieldset>
          );
        })}

        {stockLabel && <p className="text-body text-text-body">{stockLabel}</p>}
        <button ref={buyBtn} type="button" disabled={!canAdd || add.isPending} onClick={onAdd} aria-busy={add.isPending} className={`min-h-12 rounded-md bg-bg-inverted px-6 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${add.isPending ? 'vk-busy disabled:opacity-100' : ''}`}>
          {add.isPending ? 'Зачекайте…' : added ? '✓ Додано' : t(locale, 'product.addToCart')}
        </button>
        <p className="sr-only" role="status">{added ? 'Додано в кошик' : ''}</p>
        {bar && (
          <div className="vk-sheet fixed inset-x-0 bottom-0 z-(--z-sticky) flex items-center gap-3 border-t border-border-hairline bg-bg-page/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-sm text-text-muted">{p.name}</span>
              <span className="text-body font-semibold text-text-primary">{priceText}</span>
            </span>
            <button type="button" disabled={!canAdd || add.isPending} onClick={onAdd} aria-busy={add.isPending} className={`min-h-11 shrink-0 rounded-md bg-bg-inverted px-5 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${add.isPending ? 'vk-busy disabled:opacity-100' : ''}`}>
              {add.isPending ? 'Зачекайте…' : added ? '✓ Додано' : t(locale, 'product.addToCart')}
            </button>
          </div>
        )}
        {/* Round 10 part 4 #10: uk only, stocked items only, hidden while «Свій розмір» is chosen. */}
        {locale === 'uk' && !custom.on && p.pricingUnit === 'PIECE' && variant && (variant.stockHint === 'IN_STOCK' || variant.stockHint === 'FEW_LEFT') && (
          <QuickOrder variantId={variant.id} label={[p.name, ...Object.values(variant.options).map((o) => o.label)].join(' · ')} />
        )}
        {add.isError && <p role="alert" className="text-body-sm text-danger">Не вдалося додати. Спробуйте ще раз.</p>}

        <div className="whitespace-pre-line text-body text-text-body">{p.description}</div>

        {(p.attributes.length > 0 || p.composition.length > 0) && (
          <section className="flex flex-col gap-2">
            <h2 className="text-h4 text-text-primary">{t(locale, 'product.specs')}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-body">
              {p.composition.length > 0 && (
                <><dt className="text-text-muted">{t(locale, 'product.composition')}</dt><dd>{p.composition.map((c) => `${c.percent}% ${c.material}`).join(', ')}</dd></>
              )}
              {p.attributes.map((a) => <Fragment key={a.key}><dt className="text-text-muted">{a.label}</dt><dd>{a.value}</dd></Fragment>)}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}

function axisLabel(axis: string) {
  return ({ size: 'Розмір', color: 'Колір', pattern: 'Візерунок' } as Record<string, string>)[axis] ?? axis;
}
