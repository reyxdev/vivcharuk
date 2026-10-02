import { describe, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { catalog } from '../../src/modules/catalog/catalog.service';

// The three brand invariants of 26 §26.10.1, swept over every published product.
function deepKeys(v: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => deepKeys(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.add(k); deepKeys(x, out); }
  return out;
}

describe('catalogue brand rule', async () => {
  const slugs = await prisma.productTranslation.findMany({ where: { locale: 'uk', product: { status: 'ACTIVE', deletedAt: null, publishedAt: { not: null } } }, select: { slug: true } });

  it('has products to check', () => expect(slugs.length).toBeGreaterThan(0));

  it.each(slugs.map((s) => s.slug))('%s', async (slug) => {
    const p = await catalog.productBySlug(slug, 'uk');
    expect(p.schemaBrand).toBe('Вівчарик');
    if (p.origin === 'PARTNER_MANUFACTURE') {
      expect(Object.hasOwn(p, 'schemaManufacturer')).toBe(false);
      expect(Object.hasOwn(p, 'provenance')).toBe(false);
    } else {
      expect(p.schemaManufacturer).toBe('Вівчарик');
    }
    expect(deepKeys(p).has('partnerName')).toBe(false);
  });

  it('listing never carries partnerName and featured is own manufacture only', async () => {
    const list = await catalog.listProducts({ locale: 'uk', sort: 'popularity', page: 1, perPage: 48 }, {});
    expect(deepKeys(list).has('partnerName')).toBe(false);
    const featured = await catalog.featured('uk', 8);
    expect(featured.every((f) => f.origin === 'OWN_MANUFACTURE')).toBe(true);
  });
});
