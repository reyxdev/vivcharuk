import { BRAND_LATIN, type Locale, type ProductDetail } from '@vivcharyk/schemas';
import { formatRange } from '@/lib/money';
import { mediaUrl } from '@/lib/media';
import { path } from '@/lib/segments';
import { clip, TITLE_MAX } from '@/lib/seo';

export interface Crumb { name: string; path: string }
export interface ProductReview { id: string; author: string; rating: number; title: string | null; body: string; date: string; source: 'SITE' | 'PROM'; isVerifiedPurchase: boolean; reply: string | null }

/** Wool only where the composition says so (G053; carpets without a composition stay plain, G061). */
export const isWool = (p: ProductDetail) => p.composition.some((c) => /вовн|wool/i.test(c.material));

/**
 * G053: «{Назва} з овечої вовни — купити | Вівчарик», shorter forms when it runs long. English (G093)
 * follows the same rules: «{Name} — sheep's wool, buy from the maker | Vivcharyk», then without the
 * wool phrase, then the name and brand alone; partner goods say «buy online».
 */
export function productTitle(p: ProductDetail, locale: Locale = 'uk') {
  if (p.metaTitle) return p.metaTitle;
  if (locale === 'en') {
    // «from the maker» only where we made it: partner goods are not ours to claim.
    const buy = p.origin === 'OWN_MANUFACTURE' ? 'buy from the maker' : 'buy online';
    const long = `${p.name} — sheep's wool, ${buy} | ${BRAND_LATIN}`;
    if (isWool(p) && !/wool/i.test(p.name) && long.length <= TITLE_MAX) return long;
    const mid = `${p.name} — ${buy} | ${BRAND_LATIN}`;
    return mid.length <= TITLE_MAX ? mid : `${p.name} | ${BRAND_LATIN}`;
  }
  const long = `${p.name} з овечої вовни — купити | Вівчарик`;
  if (isWool(p) && !/вовн/i.test(p.name) && long.length <= TITLE_MAX) return long;
  const mid = `${p.name} — купити | Вівчарик`;
  return mid.length <= TITLE_MAX ? mid : `${p.name} | Вівчарик`;
}

/** G056: the panel's text, else the description cut at a word; short ones get the facts that sell. */
export function productDescription(p: ProductDetail, locale: Locale) {
  if (p.metaDescription) return clip(p.metaDescription);
  const own = p.origin === 'OWN_MANUFACTURE';
  if (locale === 'en') {
    const factsEn = `${own ? 'Made in our workshop in Yavoriv village, Kosiv district, Ivano-Frankivsk region. ' : ''}Price ${formatRange(p.priceMinMinor, p.priceMaxMinor, locale)}, delivery within Ukraine.`;
    const dEn = p.description.replace(/\s+/g, ' ').trim();
    return clip(dEn.length >= 110 ? dEn : `${dEn ? `${dEn} ` : `${p.name}. `}${factsEn}`);
  }
  const facts = `${own ? 'Власне виробництво, с. Яворів, Косівський р-н. ' : ''}Ціна ${formatRange(p.priceMinMinor, p.priceMaxMinor, locale)}, доставка по Україні.`;
  const d = p.description.replace(/\s+/g, ' ').trim();
  return clip(d.length >= 110 ? d : `${d ? `${d} ` : `${p.name}. `}${facts}`);
}

// Local media paths are relative; structured data needs absolute URLs.
const absolute = (origin: string, u: string) => (u.startsWith('http') ? u : `${origin}${u}`);

const AXIS_PROP: Record<string, string> = { size: 'size', color: 'color', pattern: 'pattern' };

/**
 * Round 24 G101–G106, G120, G141, G145: a product with variants is a ProductGroup whose variants are
 * Products with their own price; one without is a Product. SKU doubles as MPN (no GTIN exists for
 * own goods). The 14-day return policy is stated; who pays return shipping and the delivery rates are
 * left out until Іван confirms them. aggregateRating only from the on-site reviews shown on the page.
 */
export function productJsonLd(p: ProductDetail, origin: string, locale: Locale, crumbs: Crumb[], reviews: ProductReview[]) {
  const url = `${origin}${path.product(locale, p.slug)}`;
  const images = p.gallery.map((m) => absolute(origin, mediaUrl(m.publicId, 1600)));
  const material = p.composition.length ? p.composition.map((c) => c.material).join(', ') : undefined;
  const seller = { '@id': `${origin}/#organization` };
  const returns = { '@id': `${origin}/#returns` };
  const site = reviews.filter((r) => r.source === 'SITE');
  const rating = site.length
    ? {
        aggregateRating: { '@type': 'AggregateRating', ratingValue: (site.reduce((a, r) => a + r.rating, 0) / site.length).toFixed(1), reviewCount: site.length, bestRating: 5, worstRating: 1 },
        review: site.map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.author }, datePublished: r.date.slice(0, 10), reviewBody: r.body, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 } })),
      }
    : {};
  const offer = (v: ProductDetail['variants'][number]) => ({
    '@type': 'Offer', url, price: (v.priceMinor / 100).toFixed(2), priceCurrency: p.currency, itemCondition: 'https://schema.org/NewCondition',
    availability: v.stockHint === 'MADE_TO_ORDER' ? 'https://schema.org/BackOrder' : v.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    ...(v.stockHint === 'MADE_TO_ORDER' && v.madeToOrderDays ? { deliveryLeadTime: { '@type': 'QuantitativeValue', value: v.madeToOrderDays, unitCode: 'DAY' } } : {}),
    seller, hasMerchantReturnPolicy: returns,
  });
  const common = {
    name: p.name, description: p.description, brand: { '@type': 'Brand', name: locale === 'en' ? BRAND_LATIN : p.schemaBrand },
    ...(p.schemaManufacturer ? { manufacturer: seller } : {}),
    ...(images.length ? { image: images } : {}),
    ...(material ? { material } : {}),
  };
  const axes = [...new Set(p.variants.flatMap((v) => Object.keys(v.options)))];
  const node = p.variants.length > 1 || axes.length > 0
    ? {
        '@type': 'ProductGroup', '@id': `${url}#product`, url, ...common, productGroupID: p.sku,
        ...(axes.some((a) => AXIS_PROP[a]) ? { variesBy: axes.filter((a) => AXIS_PROP[a]).map((a) => `https://schema.org/${AXIS_PROP[a]}`) } : {}),
        hasVariant: p.variants.map((v) => ({
          '@type': 'Product', '@id': `${url}#${v.sku}`, sku: v.sku, mpn: v.sku,
          name: [p.name, ...Object.values(v.options).map((o) => o.label)].join(', '),
          ...(images.length ? { image: images[0] } : {}), ...(material ? { material } : {}),
          ...Object.fromEntries(Object.entries(v.options).filter(([k]) => AXIS_PROP[k]).map(([k, o]) => [AXIS_PROP[k], o.label])),
          offers: offer(v),
        })),
        ...rating,
      }
    : {
        '@type': 'Product', '@id': `${url}#product`, url, ...common, sku: p.variants[0]?.sku ?? p.sku, mpn: p.variants[0]?.sku ?? p.sku,
        ...(p.variants[0] ? { offers: offer(p.variants[0]) } : {}),
        ...rating,
      };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Google requires an image for product results: a product without photos gets no product markup at all,
      // so Search Console never reports it as invalid (publishing already requires a photo).
      ...(images.length ? [node] : []),
      {
        '@type': 'MerchantReturnPolicy', '@id': `${origin}/#returns`, applicableCountry: 'UA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail', merchantReturnLink: `${origin}${path.seg(locale, 'returns')}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [...crumbs, { name: p.name, path: path.product(locale, p.slug) }].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${origin}${c.path}` })),
      },
    ],
  };
}
