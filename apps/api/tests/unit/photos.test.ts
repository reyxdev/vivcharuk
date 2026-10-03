import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
// photoSet.ts has no database or config: this runs without a DB env too.
import { WIDTHS, photoUrl, photoWords, writePhotoSet } from '../../src/modules/products/photoSet';

describe('photo names (round 24 G034)', () => {
  it('names the product, its single size and the colour of a colour photo, once each', () => {
    expect(photoWords('lizhnyk-siryi', '150x200')).toBe('lizhnyk-siryi-150x200');
    expect(photoWords('Ліжник сірий', null, 'сірий')).toBe('lizhnyk-siryi');
    expect(photoWords('lizhnyk', null, 'червоний')).toBe('lizhnyk-chervonyi');
    expect(photoWords('')).toBe('foto');
  });
});

describe('photo set (round 24 G030–G032)', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'vk-photos-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('writes every width in WebP and AVIF within budget, plus the og:image, and keeps 480/960/1600 at their old names', async () => {
    // A smooth picture (a gradient with a few shapes) stands in for a product photo.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="2400"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#c9a96a"/><stop offset="1" stop-color="#2a4c3c"/></linearGradient></defs><rect width="1800" height="2400" fill="url(#g)"/><circle cx="900" cy="1200" r="500" fill="#faf8f4"/></svg>`;
    const source = await sharp(Buffer.from(svg)).jpeg().toBuffer();
    const set = await writePhotoSet(source, 'photos/vch-test-001/lizhnyk-siryi', dir);
    expect(set.publicId).toMatch(/^local:photos\/vch-test-001\/lizhnyk-siryi-[0-9a-f]{8}$/);
    expect([set.width, set.height]).toEqual([1800, 2400]);
    const files = readdirSync(path.join(dir, 'photos/vch-test-001'));
    expect(files).toHaveLength(WIDTHS.length * 2 + 1);
    for (const w of WIDTHS) {
      const meta = await sharp(path.join(dir, `${set.publicId.slice(6)}-${w}.avif`)).metadata();
      expect(meta.width).toBe(w);
    }
    expect(statSync(path.join(dir, `${set.publicId.slice(6)}-960.webp`)).size).toBeLessThan(150 * 1024);
    const og = await sharp(path.join(dir, `${set.publicId.slice(6)}-og.jpg`)).metadata();
    expect([og.width, og.height]).toEqual([1200, 630]);
    expect(photoUrl(set.publicId, 1600)).toBe(`/media/${set.publicId.slice(6)}-1600.webp`);
  });
});
