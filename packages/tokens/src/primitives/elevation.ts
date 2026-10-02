// Source: docs/11-spacing-system.md §11.5 Elevation, §11.6 Z-index.

// Warm-tinted, all derived from forest rgba(31,58,46,…).
export const shadow = {
  xs: '0 1px 2px rgba(31,58,46,.05)',
  sm: '0 2px 8px rgba(31,58,46,.06)',
  md: '0 8px 24px rgba(31,58,46,.08)',
  lg: '0 16px 48px rgba(31,58,46,.12)',
  xl: '0 32px 80px rgba(31,58,46,.16)',
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  header: 200,
  dropdown: 300,
  overlay: 400,
  modal: 500,
  toast: 600,
  tooltip: 700,
  max: 9000,
} as const;
