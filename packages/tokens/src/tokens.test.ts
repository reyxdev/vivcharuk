import { describe, expect, it } from 'vitest';
import { color, dark, light, type ColorName } from './index';

// WCAG 2.1 relative luminance and contrast ratio.
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fg: ColorName, bg: ColorName): number => {
  const [a, b] = [luminance(color[fg]), luminance(color[bg])];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const AAA = 7;
const AA = 4.5;
const LARGE = 3; // AA large text, and WCAG 1.4.11 non-text

describe('semantic layer', () => {
  it.each(Object.entries(light))('light %s resolves to a primitive', (_, ref) => {
    expect(color).toHaveProperty(ref);
  });

  it.each(Object.entries(dark))('dark %s resolves to a primitive', (_, ref) => {
    expect(color).toHaveProperty(ref);
  });

  it('dark only rebinds names that exist in light (so :root is always a fallback)', () => {
    for (const name of Object.keys(dark)) expect(light).toHaveProperty(name);
  });
});

// [fg, bg, min, max?, source]. min/max are the WCAG verdict the doc states.
type Pair = [fg: ColorName, bg: ColorName, min: number, max: number | undefined, source: string];

const pairs: Pair[] = [
  // docs/09 §9.5
  ['forest-800', 'fleece-100', AAA, undefined, '§9.5 headings, primary text AAA'],
  ['stone-800', 'fleece-100', AAA, undefined, '§9.5 body AAA'],
  ['stone-600', 'fleece-100', AA, undefined, '§9.5 secondary text AA'],
  ['stone-500', 'fleece-100', LARGE, AA, '§9.5 stone-500 fails AA, large text only'],
  ['stone-400', 'fleece-100', 0, LARGE, '§9.5 stone-400 decorative/placeholder only'],
  ['fleece-100', 'forest-800', AAA, undefined, '§9.5 primary button label AAA'],
  ['fleece-100', 'forest-900', AAA, undefined, '§9.5 footer AAA'],
  ['gold-600', 'fleece-100', 0, AA, '§9.5 gold-600 fails AA'],
  ['sky-600', 'fleece-100', AA, undefined, '§9.5 editorial links AA'],
  ['danger-light', 'fleece-100', AAA, undefined, '§9.5 errors AAA'],
  // docs/23 §23.3, on forest-950
  ['fleece-100', 'forest-950', AAA, undefined, '§23.3 primary text AAA'],
  ['stone-300', 'forest-950', AAA, undefined, '§23.3 labels AAA'],
  ['stone-400', 'forest-950', AA, undefined, '§23.3 placeholders AA'],
  ['gold-400', 'forest-950', AAA, undefined, '§23.3 accent AAA'],
  ['sky-300', 'forest-950', AAA, undefined, '§23.3 info AAA'],
  ['warning-dark', 'forest-950', AAA, undefined, '§23.3 warning AAA'],
  ['danger-dark', 'forest-950', AA, undefined, '§23.3 danger AA'],
  ['emerald-500', 'forest-950', LARGE, AA, '§23.3 success fails AA, >=24px only'],
  ['forest-500', 'forest-950', LARGE, undefined, '§23.3 control boundary passes 1.4.11'],
  ['forest-600', 'forest-950', 0, LARGE, '§23.3 forest-600 non-interactive only'],
  // round 11 (00-client-decisions-11, docs/09 banner): peach page
  ['stone-600', 'peach', AA, undefined, 'round 11 caption on peach ≈5:1'],
  ['stone-500', 'peach', 0, AA, 'round 11 stone-500 on peach ≈3.3:1, not for small text'],
  ['forest-800', 'peach', AAA, undefined, 'round 11 text colours unchanged: §9.5 AAA carried to peach'],
  ['stone-800', 'peach', AAA, undefined, 'round 11 text colours unchanged: §9.5 AAA carried to peach'],
  ['forest-800', 'fleece-200', AAA, undefined, 'headings on cream sections'],
  ['stone-600', 'fleece-200', AA, undefined, 'secondary text on cream sections'],
];

describe('contrast claims in the docs', () => {
  it.each(pairs)('%s on %s (%s..%s) — %s', (fg, bg, min, max) => {
    const ratio = contrast(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(min);
    if (max !== undefined) expect(ratio).toBeLessThan(max);
  });
});

describe('semantic text on its own theme background', () => {
  const textTokens = ['text-primary', 'text-body', 'text-muted'] as const;
  for (const bg of ['bg-page', 'bg-alt', 'bg-surface'] as const) {
    it.each(textTokens)(`light %s on ${bg} >= AA`, (fg) => {
      expect(contrast(light[fg], light[bg])).toBeGreaterThanOrEqual(AA);
    });
  }
  it.each([...textTokens, 'text-faint', 'accent-text'] as const)('dark %s on bg-page >= AA', (fg) => {
    expect(contrast(dark[fg], dark['bg-page'])).toBeGreaterThanOrEqual(AA);
  });
  it('text-on-inverted on bg-inverted >= AAA', () => {
    expect(contrast(light['text-on-inverted'], light['bg-inverted'])).toBeGreaterThanOrEqual(AAA);
  });
});

// Doc claims the measured sRGB values do not support. `it.fails` keeps CI green while the
// discrepancy stands and turns red once a palette fix makes the claim true — then move the
// pair into the passing tables above.
describe('known contrast discrepancies (docs claim more than the values give)', () => {
  it.fails('§9.5: gold-700 on fleece-100 claimed ≈4.7 AA — measures 4.40', () => {
    expect(contrast('gold-700', 'fleece-100')).toBeGreaterThanOrEqual(AA);
  });
  it.fails('§9.3/§9.5: gold-600 on fleece-100 claimed ≈3.4, usable as large text — measures 2.92', () => {
    expect(contrast('gold-600', 'fleece-100')).toBeGreaterThanOrEqual(LARGE);
  });
  it.fails('§9.5: gold-400 on forest-900 claimed ≈7.1 AAA — measures 6.90', () => {
    expect(contrast('gold-400', 'forest-900')).toBeGreaterThanOrEqual(AAA);
  });
  // Round 11 moved the page to peach and kept "text colours unchanged"; these were only
  // ever verified on fleece-100.
  it.fails.each(['accent-text', 'info', 'success', 'warning'] as const)(
    'round 11: light %s on peach bg-page is below AA',
    (fg) => {
      expect(contrast(light[fg], light['bg-page'])).toBeGreaterThanOrEqual(AA);
    },
  );
});
