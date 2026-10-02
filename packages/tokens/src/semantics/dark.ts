// Layer 2, dark theme: admin default (docs/09 §9.7, docs/23 §23.3). Emitted under
// [data-theme="dark"]. Rebinds a subset of the light names; anything not listed
// (bg-inverted, text-on-inverted) inherits the :root value.
import type { ColorName } from '../primitives/color';
import type { SemanticName } from './light';

export const dark = {
  'bg-page': 'forest-950',
  'bg-alt': 'forest-900',
  'bg-surface': 'forest-900',
  'bg-raised': 'forest-800',
  'bg-input': 'forest-950',

  'text-primary': 'fleece-100',
  'text-body': 'fleece-100',
  'text-muted': 'stone-300',
  'text-faint': 'stone-400',

  'border-hairline': 'forest-600',
  'border-control': 'forest-500',

  accent: 'gold-400',
  'accent-text': 'gold-400',

  success: 'emerald-500',
  warning: 'warning-dark',
  danger: 'danger-dark',
  info: 'sky-300',

  // §36.3.3 thread colour on dark surfaces.
  thread: 'gold-400',
} as const satisfies Partial<Record<SemanticName, ColorName>>;
