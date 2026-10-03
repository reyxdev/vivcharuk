import type { FastifyInstance } from 'fastify';
import type { Locale } from '@prisma/client';
import type { CategoryNode, ProductDetail } from '@vivcharyk/schemas';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
import { catalog } from '../catalog/catalog.service';
import { PUBLIC_PRODUCT, productVisibleIn } from '../catalog/catalog.repository';
import { photoUrl } from '../products/media';
import { PRODUCT_SEG } from './segments';

// Round 24 G124–G126: the Google Merchant Center feed (free listings), RSS 2.0 with the g: namespace,
// one item per size/colour with the product as its group. Served at /feed/google-<locale>.xml for every
// locale the site serves (Caddy sends /feed/* here). Data through the catalogue port (round 16).
//
// TODO(G102): shipping is omitted until Іван confirms the Nova Poshta rates; then add <g:shipping> per
// item from the same tariffs as apps/api/src/modules/shipping/shipping.service.ts (or set shipping in
// Merchant Center itself, which then needs nothing here).

const BRAND = 'Вівчарик';
// Google product taxonomy by our category key (the text form is accepted instead of the numeric id).
// Only categories that map without doubt; the rest leave the field out and Google infers it.
const GOOGLE_CATEGORY: Record<string, string> = {
  lizhnyky: 'Home & Garden > Linens & Bedding > Bedding > Blankets',
  kylymy: 'Home & Garden > Decor > Rugs',
  'lizhnykovi-dorizhky': 'Home & Garden > Decor > Rugs',
};
const UNIT: Partial<Record<ProductDetail['pricingUnit'], string>> = { KILOGRAM: '1kg', METRE: '1m' };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Plain text: tags and Markdown marks out, whitespace collapsed; control characters are not valid XML.
export const plain = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/[*_#>`~]|\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/\s+/g, ' ').trim();
const money = (minor: number) => `${(minor / 100).toFixed(2)} UAH`;
const cut = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`);

/** Ancestors of a category in the tree, root first. */
function trail(nodes: CategoryNode[], slug: string, up: CategoryNode[] = []): CategoryNode[] | null {
  for (const n of nodes) {
    if (n.slug === slug) return [...up, n];
    const hit = trail(n.children, slug, [...up, n]);
    if (hit) return hit;
  }
  return null;
}

export function feedItems(p: ProductDetail, l: Locale, origin: string, tree: CategoryNode[]) {
  const link = `${origin}/${l}/${PRODUCT_SEG[l]}/${p.slug}`;
  const images = p.gallery.flatMap((m) => { const u = photoUrl(m.publicId, 1600); return u ? [origin + u] : []; });
  const path = p.categories[0] ? trail(tree, p.categories[0].slug) : null;
  const googleCategory = path?.map((c) => (c.key ? GOOGLE_CATEGORY[c.key] : undefined)).filter(Boolean).at(-1);
  const description = cut(plain(p.description) || p.name, 5000);
  const multi = p.variants.length > 1;
  return p.variants.map((v) => {
    const size = v.options.size?.label, color = v.options.color?.label;
    const title = cut([p.name, [color, size].filter(Boolean).join(', ')].filter(Boolean).join(' — '), 150);
    const sale = v.compareAtMinor !== null && v.compareAtMinor > v.priceMinor;
    const availability = v.inStock ? 'in_stock' : v.madeToOrderDays ? 'backorder' : 'out_of_stock';
    const tags: Array<[string, string | undefined]> = [
      ['g:id', v.sku],
      ['g:item_group_id', multi ? p.sku : undefined],
      ['g:title', title],
      ['g:description', description],
      ['g:link', link],
      ['g:image_link', images[0]],
      ...images.slice(1, 11).map((u) => ['g:additional_image_link', u] as [string, string]),
      ['g:price', money(sale ? v.compareAtMinor! : v.priceMinor)],
      ['g:sale_price', sale ? money(v.priceMinor) : undefined],
      ['g:unit_pricing_measure', UNIT[p.pricingUnit]],
      ['g:unit_pricing_base_measure', UNIT[p.pricingUnit]],
      ['g:availability', availability],
      // Made to order: the date it can leave the workshop (G106).
      ['g:availability_date', availability === 'backorder' ? `${new Date(Date.now() + v.madeToOrderDays! * 86_400_000).toISOString().slice(0, 16)}Z` : undefined],
      ['g:condition', 'new'],
      ['g:brand', BRAND],
      ['g:identifier_exists', 'no'],
      ['g:mpn', v.sku],
      ['g:google_product_category', googleCategory],
      ['g:product_type', path ? path.map((c) => c.name).join(' > ') : undefined],
      ['g:size', size],
      ['g:color', color],
    ];
    return `<item>\n${tags.filter(([, x]) => x).map(([k, x]) => `  <${k}>${esc(x!)}</${k}>`).join('\n')}\n</item>`;
  });
}

export async function buildFeed(l: Locale) {
  const origin = config.siteUrl.replace(/\/$/, '');
  const [tree, rows] = await Promise.all([
    catalog.categoryTree(l),
    prisma.productTranslation.findMany({ where: { locale: l, product: { ...PUBLIC_PRODUCT, ...productVisibleIn(l) } }, orderBy: { slug: 'asc' }, select: { slug: true } }),
  ]);
  const items: string[] = [];
  for (const { slug } of rows) {
    const p = await catalog.productBySlug(slug, l).catch(() => null);
    // Only real translations: an English feed never carries Ukrainian fallback text.
    if (!p || p.translationFallback.length || !p.gallery.length) continue;
    items.push(...feedItems(p, l, origin, tree));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(BRAND)}</title>
<link>${esc(`${origin}/${l}/`)}</link>
<description>${esc(l === 'uk' ? 'Вовняні вироби з Карпат від виробника' : 'Wool goods from the Carpathians, from the maker')}</description>
${items.join('\n')}
</channel>
</rss>
`;
}

export async function feedRoutes(app: FastifyInstance) {
  for (const l of config.enabledLocales) {
    app.get(`/feed/google-${l}.xml`, async (_req, reply) => {
      reply.header('content-type', 'application/xml; charset=utf-8');
      reply.header('cache-control', 'public, max-age=3600');
      reply.header('x-robots-tag', 'noindex');
      return buildFeed(l);
    });
  }
}
