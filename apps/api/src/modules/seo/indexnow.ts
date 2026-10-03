import { config } from '../../config';
import { enqueue } from '../../lib/jobs';
import { prisma } from '../../lib/prisma';
import { JOURNAL_SEG, PRODUCT_SEG } from './segments';

// Round 24 G022: IndexNow tells Bing, Yandex and the engines that share it (Copilot and ChatGPT search
// read Bing) which URLs changed. Google ignores it. The key file is served by the storefront at
// /<INDEXNOW_KEY>.txt (apps/storefront/server.mjs). Off without a key and outside production, so
// development and tests never reach the network.
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const indexNowEnabled = () => !!config.indexNowKey && config.isProd;

/** Queue site paths («/uk/tovar/x») for one IndexNow ping. Never throws: a ping is not worth a failed publish. */
export async function queueIndexNow(paths: string[]) {
  if (!indexNowEnabled() || !paths.length) return;
  await enqueue('seo.indexnow', { paths: [...new Set(paths)] }).catch(() => undefined);
}

const pathOf = (l: string, own: string, parent?: string) => (parent ? `/${l}/${parent}/${own}` : `/${l}/${own}`);

/** A product's page and its categories' pages in every served locale (published, archived or deleted). */
export async function indexNowProduct(productId: string) {
  if (!indexNowEnabled()) return;
  const locales = config.enabledLocales;
  const p = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      translations: { where: { locale: { in: locales } }, select: { locale: true, slug: true } },
      categories: { select: { category: { select: { translations: { where: { locale: { in: locales } }, select: { locale: true, slug: true } }, parent: { select: { translations: { where: { locale: { in: locales } }, select: { locale: true, slug: true } } } } } } } },
    },
  }).catch(() => null);
  if (!p) return;
  const paths = p.translations.map((t) => `/${t.locale}/${PRODUCT_SEG[t.locale]}/${t.slug}`);
  for (const { category: c } of p.categories) {
    for (const t of c.translations) {
      const par = c.parent?.translations.find((x) => x.locale === t.locale);
      if (!c.parent || par) paths.push(pathOf(t.locale, t.slug, par?.slug));
    }
  }
  await queueIndexNow(paths);
}

/** A journal article and the journal index. */
export async function indexNowPost(postId: string) {
  if (!indexNowEnabled()) return;
  const rows = await prisma.postTranslation.findMany({ where: { postId, locale: { in: config.enabledLocales } }, select: { locale: true, slug: true } }).catch(() => []);
  await queueIndexNow(rows.flatMap((t) => [`/${t.locale}/${JOURNAL_SEG[t.locale]}/${t.slug}`, `/${t.locale}/${JOURNAL_SEG[t.locale]}`]));
}

/** The job: one POST with up to 10 000 URLs (the protocol's limit). 4xx is a key or host problem: logged, not retried. */
export async function sendIndexNow(paths: string[], fetchImpl: typeof fetch = fetch) {
  const site = new URL(config.siteUrl);
  const key = config.indexNowKey;
  if (!key || !paths.length) return { status: 0 };
  const res = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: site.host, key, keyLocation: `${site.origin}/${key}.txt`, urlList: paths.slice(0, 10_000).map((p) => site.origin + p) }),
  });
  if (res.status === 429 || res.status >= 500) throw new Error(`IndexNow ${res.status}`);
  if (!res.ok) console.warn(`IndexNow answered ${res.status} for ${paths.length} URLs`);
  return { status: res.status };
}
