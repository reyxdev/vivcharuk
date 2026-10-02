// Source: docs/11-spacing-system.md §11.1-11.3, §11.7.

// §11.1: 8 px base, 4 px half-step. Key = token suffix (space-N), N x 4 px.
export const space = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
} as const;

// §11.2 fluid section padding.
export const sectionY = {
  sm: 'clamp(3rem, 2.2rem + 3.4vw, 5rem)',
  md: 'clamp(4.5rem, 3.2rem + 5.5vw, 8rem)',
  lg: 'clamp(6rem, 4rem + 8.5vw, 11rem)',
} as const;

// §11.3 breakpoints: range start in px.
export const breakpoint = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920,
} as const;

// §11.3 grid per breakpoint (px). maxContent null = fluid; margin null = auto.
export const grid = {
  xs: { columns: 4, gutter: 16, margin: 20, maxContent: null },
  sm: { columns: 4, gutter: 16, margin: 24, maxContent: null },
  md: { columns: 8, gutter: 24, margin: 40, maxContent: null },
  lg: { columns: 12, gutter: 24, margin: 56, maxContent: 1120 },
  xl: { columns: 12, gutter: 32, margin: 80, maxContent: 1320 },
  '2xl': { columns: 12, gutter: 32, margin: null, maxContent: 1440 },
} as const;

// §11.3 container variants with a single max-width. The default `container`
// (1120-1320) follows grid.maxContent per breakpoint.
export const container = {
  full: '100vw',
  wide: '1440px',
  narrow: '760px',
  form: '520px',
} as const;

// §11.7 touch targets.
export const target = {
  primary: '3rem',
  secondary: '2.75rem',
  separation: '0.5rem',
} as const;
