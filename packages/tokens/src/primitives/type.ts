// Source: docs/10-typography.md §10.2-10.4 and its round 11 banner (wordmark).

// §10.2 fallback stacks. `wordmark` is round 11: logo lockup, hero H1, footer only.
export const fontFamily = {
  display: '"e-Ukraine Head", "e-Ukraine", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  body: '"e-Ukraine", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  quote: '"Kyiv*Type Serif", "Noto Serif", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
  wordmark: '"Marck Script", cursive',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

type FamilyName = keyof typeof fontFamily;

interface TypeStep {
  readonly mobile: string;
  readonly desktop: string;
  readonly fluid: string | null;
  readonly family: FamilyName;
  readonly weight: number;
  readonly lineHeight: string;
  readonly tracking: string;
}

// §10.3 type scale. "Body Head" (button) is the e-Ukraine Head stack = `display`.
export const typeScale = {
  'display-xl': { mobile: '2.75rem', desktop: '6.25rem', fluid: 'clamp(2.75rem, 1.2rem + 6.6vw, 6.25rem)', family: 'display', weight: 500, lineHeight: '0.96', tracking: '-0.03em' },
  'display-lg': { mobile: '2.25rem', desktop: '4.5rem', fluid: 'clamp(2.25rem, 1.3rem + 4.1vw, 4.5rem)', family: 'display', weight: 500, lineHeight: '1.02', tracking: '-0.025em' },
  'display-md': { mobile: '1.875rem', desktop: '3.25rem', fluid: 'clamp(1.875rem, 1.3rem + 2.4vw, 3.25rem)', family: 'display', weight: 500, lineHeight: '1.08', tracking: '-0.02em' },
  h1: { mobile: '2rem', desktop: '3rem', fluid: 'clamp(2rem, 1.4rem + 2.6vw, 3rem)', family: 'display', weight: 500, lineHeight: '1.1', tracking: '-0.02em' },
  h2: { mobile: '1.625rem', desktop: '2.25rem', fluid: 'clamp(1.625rem, 1.3rem + 1.4vw, 2.25rem)', family: 'display', weight: 500, lineHeight: '1.18', tracking: '-0.015em' },
  h3: { mobile: '1.375rem', desktop: '1.75rem', fluid: 'clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)', family: 'display', weight: 500, lineHeight: '1.25', tracking: '-0.01em' },
  h4: { mobile: '1.125rem', desktop: '1.25rem', fluid: null, family: 'body', weight: 600, lineHeight: '1.35', tracking: '0' },
  'body-lg': { mobile: '1.125rem', desktop: '1.25rem', fluid: null, family: 'body', weight: 400, lineHeight: '1.65', tracking: '0' },
  body: { mobile: '1rem', desktop: '1.0625rem', fluid: null, family: 'body', weight: 400, lineHeight: '1.7', tracking: '0' },
  'body-sm': { mobile: '0.9375rem', desktop: '0.9375rem', fluid: null, family: 'body', weight: 400, lineHeight: '1.6', tracking: '0' },
  caption: { mobile: '0.875rem', desktop: '0.875rem', fluid: null, family: 'body', weight: 400, lineHeight: '1.5', tracking: '0.005em' },
  overline: { mobile: '0.75rem', desktop: '0.75rem', fluid: null, family: 'body', weight: 600, lineHeight: '1.4', tracking: '0.14em' },
  button: { mobile: '0.9375rem', desktop: '0.9375rem', fluid: null, family: 'display', weight: 600, lineHeight: '1', tracking: '0.01em' },
} as const satisfies Record<string, TypeStep>;

export type TypeStepName = keyof typeof typeScale;

// §10.4 measure maxima.
export const measure = {
  editorial: '72ch',
  product: '66ch',
  ui: '54ch',
  display: '24ch',
} as const;
