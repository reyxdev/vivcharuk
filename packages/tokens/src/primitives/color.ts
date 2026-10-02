// Layer 1 colour primitives. Source: docs/09-color-palette.md §9.2-9.4, §9.6, round 11 banner.
// Components never reference these directly (docs/08-design-system.md §8.1).
export const color = {
  // §9.2 Forest
  'forest-950': '#0E1A14',
  'forest-900': '#16281F',
  'forest-800': '#1F3A2E',
  'forest-700': '#2A4C3C',
  'forest-600': '#356049',
  'forest-500': '#457A5D',
  // §9.2 Emerald
  'emerald-700': '#215C42',
  'emerald-600': '#2E7355',
  'emerald-500': '#3C8A65',
  'emerald-100': '#DCEBE3',
  // §9.2 Fleece
  'fleece-50': '#FDFCFA',
  'fleece-100': '#FAF8F4',
  'fleece-200': '#F2EDE3',
  'fleece-300': '#E8E0D1',
  'fleece-400': '#E3D9C6',
  'fleece-500': '#D2C4A9',
  // §9.2 Stone
  'stone-200': '#DEDCD7',
  'stone-300': '#C6C3BC',
  'stone-400': '#9A968D',
  'stone-500': '#7B776E',
  'stone-600': '#5E5B54',
  'stone-800': '#33312C',
  'stone-900': '#1C1B18',
  // §9.3 Sky
  'sky-600': '#3E6D91',
  'sky-500': '#5A8AAF',
  'sky-300': '#9EC0D8',
  'sky-100': '#E1EDF5',
  // §9.3 Ornament purple
  'orn-700': '#4C3860',
  'orn-600': '#5B4470',
  'orn-400': '#8E76A8',
  'orn-100': '#EBE4F2',
  // §9.3 Muted gold
  'gold-700': '#8F6F38',
  'gold-600': '#B08D4F',
  'gold-400': '#C9A96A',
  'gold-100': '#F3EAD8',
  // §9.4 status values given as raw hex (light / dark column)
  'warning-light': '#9A6B1E',
  'warning-dark': '#D4A24C',
  'danger-light': '#8C2F22',
  'danger-dark': '#D9705F',
  // Round 11: storefront page background «Персиковий фон»
  peach: '#F4D9B8',
  // Round 11: decorative meadow colours (decorative and background use only)
  'meadow-luka': '#8DB580',
  'meadow-trava': '#4E9A6A',
  'meadow-arnika': '#E0B33A',
  'meadow-dzvonyk': '#6C7FC4',
  'meadow-zakhid': '#C77D58',
  'meadow-sutinky': '#6B4E71',
  // §9.6 treatment 1: scrim gradient start (to transparent)
  scrim: 'rgba(14,26,20,0.72)',
} as const;

export type ColorName = keyof typeof color;
