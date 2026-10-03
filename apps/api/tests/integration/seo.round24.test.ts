import { afterAll, describe, expect, it, vi } from 'vitest';
import type { CategoryNode } from '@vivcharyk/schemas';
import { prisma } from '../../src/lib/prisma';
import { buildApp } from '../../src/app';
import { catalog } from '../../src/modules/catalog/catalog.service';
import { buildFeed, plain } from '../../src/modules/seo/feed.routes';
import { indexNowEnabled, INDEXNOW_ENDPOINT, queueIndexNow, sendIndexNow } from '../../src/modules/seo/indexnow';
import { config } from '../../src/config';

// Round 24 infrastructure against the development database: empty categories (G004–G005), the
// sitemap (G004–G008, G035), the Merchant feed (G124–G126), RUM and CSP reports (G026, G013), IndexNow
// (G022, never reaching the network) and the deleted-product redirect (G045).
const app = await buildApp();
afterAll(async () => { await app.close(); });

const flat = (nodes: CategoryNode[]): CategoryNode[] => nodes.flatMap((n) => [n, ...flat(n.children)]);

describe('category tree counts', async () => {
  const tree = await catalog.categoryTree('uk');
  const nodes = flat(tree);

  it('gives every node a count', () => expect(nodes.every((n) => typeof n.productCount === 'number')).toBe(true));

  it('counts what the listing shows', async () => {
    for (const n of nodes.slice(0, 12)) {
      const list = await catalog.listProducts({ locale: 'uk', category: n.slug, sort: 'popularity', page: 1, perPage: 1 }, {});
      expect(n.productCount, n.slug).toBe(list.page.total);
    }
  });

  it('a parent counts at least its biggest child', () => {
    for (const n of nodes) for (const c of n.children) expect(n.productCount!).toBeGreaterThanOrEqual(c.productCount!);
  });
});

describe('/seo/sitemap', async () => {
  const res = await app.inject({ method: 'GET', url: '/api/v1/seo/sitemap?locale=uk&locales=uk,en' });
  const body = res.json() as { products: Array<{ path: string; lastmod: string; images: Array<{ loc: string; title: string }>; alternates: Record<string, string> }>; categories: Array<{ path: string; lastmod: string; alternates: Record<string, string> }>; posts: unknown[]; reviews: number };
  const tree = flat(await catalog.categoryTree('uk'));

  it('answers', () => expect(res.statusCode).toBe(200));

  it('lists no empty category', () => {
    const empty = new Set(tree.filter((n) => n.productCount === 0).map((n) => n.slug));
    const listed = body.categories.filter((c) => !c.path.includes('/kolektsii/')).map((c) => c.path.split('/').at(-1)!);
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.filter((s) => empty.has(s))).toEqual([]);
  });

  it('pairs each URL with itself as the uk alternate', () => {
    for (const x of [...body.products, ...body.categories]) expect(x.alternates.uk).toBe(x.path);
  });

  it('carries product photos as image entries', () => {
    const withImages = body.products.filter((p) => p.images.length);
    expect(withImages.length).toBeGreaterThan(0);
    for (const p of withImages) for (const i of p.images) { expect(i.loc).toMatch(/^\/media\/.+-1600\.webp$/); expect(i.title).toBeTruthy(); }
  });

  it('dates a category no earlier than its newest product', async () => {
    const c = body.categories.find((x) => !x.path.includes('/kolektsii/'))!;
    const slug = c.path.split('/').at(-1)!;
    const list = await catalog.listProducts({ locale: 'uk', category: slug, sort: 'popularity', page: 1, perPage: 48 }, {});
    const dates = body.products.filter((p) => list.items.some((i) => p.path.endsWith(`/${i.slug}`))).map((p) => p.lastmod);
    for (const d of dates) expect(c.lastmod >= d).toBe(true);
  });
});

describe('Merchant feed', async () => {
  const xml = await buildFeed('uk');
  const items = xml.split('<item>').slice(1);

  it('is RSS with the g: namespace', () => expect(xml).toMatch(/<rss version="2.0" xmlns:g="http:\/\/base.google.com\/ns\/1.0">/));

  it('has one item per variant with the required fields', () => {
    expect(items.length).toBeGreaterThan(0);
    for (const i of items) {
      for (const tag of ['g:id', 'g:title', 'g:description', 'g:link', 'g:image_link', 'g:price', 'g:availability', 'g:condition', 'g:brand', 'g:identifier_exists', 'g:mpn']) expect(i, tag).toContain(`<${tag}>`);
      expect(i).toMatch(/<g:price>\d+\.\d{2} UAH<\/g:price>/);
      expect(i).toContain('<g:brand>Вівчарик</g:brand>');
      expect(i).toMatch(/<g:availability>(in_stock|out_of_stock|backorder)<\/g:availability>/);
      if (i.includes('>backorder<')) expect(i).toContain('<g:availability_date>');
    }
    const ids = items.map((i) => /<g:id>([^<]+)</.exec(i)![1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is served at /feed/google-uk.xml', async () => {
    const r = await app.inject({ method: 'GET', url: '/feed/google-uk.xml' });
    expect(r.statusCode).toBe(200);
    expect(r.headers['content-type']).toContain('application/xml');
  });

  it('strips markup from descriptions', () => expect(plain('<p>Ліжник **сірий**</p>\n[тут](http://x)')).toBe('Ліжник сірий тут'));
});

describe('RUM and CSP reports', () => {
  it('stores a sample and nothing identifying', async () => {
    const page = `test${Date.now() % 100000}`;
    const r = await app.inject({ method: 'POST', url: '/api/v1/rum', payload: { page, device: 'mobile', LCP: 2100.5, CLS: 0.02, INP: 120, TTFB: 300 } });
    expect(r.statusCode).toBe(204);
    const rows = await prisma.rumSample.findMany({ where: { page } });
    expect(rows.map((x) => x.metric).sort()).toEqual(['CLS', 'INP', 'LCP', 'TTFB']);
    expect(Object.keys(rows[0]!).sort()).toEqual(['createdAt', 'device', 'id', 'metric', 'page', 'value']);
    await prisma.rumSample.deleteMany({ where: { page } });
  });

  it('ignores a malformed sample', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/rum', payload: { page: '<script>', device: 'mobile', LCP: -1 } });
    expect(r.statusCode).toBe(204);
    expect(await prisma.rumSample.count({ where: { page: '<script>' } })).toBe(0);
  });

  it('takes a CSP report', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/csp-report', headers: { 'content-type': 'application/csp-report' }, payload: JSON.stringify({ 'csp-report': { 'document-uri': 'https://vivcharuk.com/uk/', 'effective-directive': 'img-src', 'blocked-uri': 'https://evil.test/x.png' } }) });
    expect(r.statusCode).toBe(204);
    const r2 = await app.inject({ method: 'POST', url: '/api/v1/csp-report', headers: { 'content-type': 'application/reports+json' }, payload: JSON.stringify([{ type: 'csp-violation', body: { documentURL: 'https://vivcharuk.com/uk/', effectiveDirective: 'script-src' } }]) });
    expect(r2.statusCode).toBe(204);
  });
});

describe('IndexNow', () => {
  it('is off outside production', async () => {
    expect(indexNowEnabled()).toBe(false);
    await expect(queueIndexNow(['/uk/'])).resolves.toBeUndefined();
  });

  it('posts absolute URLs with the key, through the given fetch', async () => {
    const prev = config.indexNowKey;
    (config as { indexNowKey: string }).indexNowKey = 'test-key-12345678';
    const fake = vi.fn(async () => new Response(null, { status: 202 }));
    try {
      await sendIndexNow(['/uk/tovar/x', '/uk/lizhnyky-ta-kylymy'], fake as unknown as typeof fetch);
    } finally { (config as { indexNowKey: string }).indexNowKey = prev; }
    expect(fake).toHaveBeenCalledOnce();
    const [url, init] = fake.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(INDEXNOW_ENDPOINT);
    const sent = JSON.parse(init.body as string) as { host: string; key: string; keyLocation: string; urlList: string[] };
    const site = new URL(config.siteUrl);
    expect(sent).toEqual({ host: site.host, key: 'test-key-12345678', keyLocation: `${site.origin}/test-key-12345678.txt`, urlList: [`${site.origin}/uk/tovar/x`, `${site.origin}/uk/lizhnyky-ta-kylymy`] });
  });
});

describe('deleted product redirect (G045)', () => {
  it('sends a deleted product to its category', async () => {
    const t = await prisma.productTranslation.findFirst({ where: { locale: 'uk', product: { status: 'ACTIVE', deletedAt: null, categories: { some: { category: { isActive: true, deletedAt: null } } } } }, select: { slug: true, productId: true, product: { select: { status: true, deletedAt: true } } } });
    expect(t).toBeTruthy();
    try {
      await prisma.product.update({ where: { id: t!.productId }, data: { status: 'ARCHIVED', deletedAt: new Date() } });
      const r = await app.inject({ method: 'GET', url: `/api/v1/redirects/lookup?path=${encodeURIComponent(`/uk/tovar/${t!.slug}`)}` });
      expect(r.statusCode).toBe(200);
      expect(r.json()).toMatchObject({ statusCode: 301, toPath: expect.stringMatching(/^\/uk\/[a-z0-9-]+(\/[a-z0-9-]+)?$/) });
    } finally {
      await prisma.product.update({ where: { id: t!.productId }, data: { status: t!.product.status, deletedAt: t!.product.deletedAt } });
    }
  });
});
