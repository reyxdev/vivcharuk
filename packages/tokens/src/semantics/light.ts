// Layer 2, light theme: storefront (and the admin light theme, round 9 part 2 answer 16).
// Values are primitive names only. Emitted under :root.
import type { ColorName } from '../primitives/color';

export const light = {
  // Round 11: peach page and header background on the storefront; cream alternates.
  'bg-page': 'peach',
  'bg-alt': 'fleece-200',
  // §9.8. Round 11 says "white" for component surfaces; the palette's white is fleece-50.
  'bg-surface': 'fleece-50',
  // Light counterparts of docs/23 §23.3 admin tokens, taken from the §9.2 "Use" column
  // and §8.3 (Raised surface = --bg-surface).
  'bg-raised': 'fleece-50',
  'bg-input': 'fleece-400',
  // §8.3 Inverted surface (footer, feature moments) and its text (§9.5 footer pair).
  'bg-inverted': 'forest-900',
  'text-on-inverted': 'fleece-100',

  'text-primary': 'forest-800',
  'text-body': 'stone-800',
  // Round 11: on peach, secondary and caption text is stone-600, never stone-500.
  'text-muted': 'stone-600',
  'text-faint': 'stone-400',

  'border-hairline': 'stone-200',
  'border-control': 'stone-300',

  accent: 'gold-600',
  'accent-text': 'gold-700',

  // §9.4
  success: 'emerald-600',
  warning: 'warning-light',
  danger: 'danger-light',
  info: 'sky-600',

  // §36.3.3 thread colour on light surfaces.
  thread: 'forest-700',
} as const satisfies Record<string, ColorName>;

export type SemanticName = keyof typeof light;
