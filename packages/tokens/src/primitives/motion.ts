// Source: docs/36-motion-interaction-system.md §36.3.1-36.3.3, §36.3.5
// (overrides docs/13-motion-system.md), easing and springs from docs/13 §13.3.
// All durations in ms.

// §36.3.1. `ambient` is a floor ("8000+").
export const duration = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 340,
  reveal: 560,
  cinematic: 820,
  ambient: 8000,
} as const;

// §13.3 cubic-bezier control points. `linear` only for continuous ambient loops.
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.55, 0, 1, 0.45],
  expo: [0.16, 1, 0.3, 1],
  gentle: [0.4, 0, 0.2, 1],
  linear: [0, 0, 1, 1],
} as const;

export type EaseName = keyof typeof ease;

// §36.3.1 easing paired with each duration token. `slow` enters with `out`, exits with `in`.
export const durationEase = {
  instant: 'gentle',
  fast: 'gentle',
  base: 'gentle',
  slow: { enter: 'out', exit: 'in' },
  reveal: 'out',
  cinematic: 'expo',
  ambient: 'linear',
} as const satisfies Record<keyof typeof duration, EaseName | { enter: EaseName; exit: EaseName }>;

// §13.3 Framer Motion springs. `sheep` is the only one allowed a soft overshoot (§36.3.1).
export const spring = {
  card: { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 },
  drawer: { type: 'spring', stiffness: 220, damping: 32, mass: 1.1 },
  cursor: { type: 'spring', stiffness: 150, damping: 20, mass: 0.6 },
  sheep: { type: 'spring', stiffness: 90, damping: 14, mass: 1.4 },
} as const;

// §36.3.1 stagger (ms) and cap; overshoot ceiling for everything except spring.sheep.
export const stagger = {
  menu: 40,
  content: 60,
  cap: 6,
} as const;

export const overshootMax = 0.04;

// §36.3.2 named durations (round 11), §36.3.3 thread loop, §36.3.5 collection rotation.
export const motionDuration = {
  firstVisitCap: 1400,
  pageStitch: 450,
  pageStitchExit: 180,
  pageStitchThread: 300,
  flyingPhoto: 500,
  priceHighlight: 600,
  inputDebounce: 400,
  skeletonThreshold: 400,
  undoWindow: 5000,
  toastVisible: 5000,
  threadLoop: 1200,
  collectionDwell: 2800,
  collectionDissolve: 700,
  collectionDrift: 3400,
  collectionStagger: 900,
} as const;

// Easing for named durations where the doc fixes one.
export const motionDurationEase = {
  flyingPhoto: 'inOut',
  threadLoop: 'linear',
  collectionDissolve: 'inOut',
  collectionDrift: 'linear',
} as const satisfies Partial<Record<keyof typeof motionDuration, EaseName>>;

// §36.3.2 scroll triggers (not durations).
export const motionTrigger = {
  headerShadowScrollY: 8,
  backToTopViewports: 2,
} as const;

// §36.3.3 thread stroke; §36.3.5 drift scale.
export const thread = {
  stroke: '2px',
  strokeHero: '3px',
} as const;

export const collectionDriftScale = 1.05;

export const cubicBezier = (name: EaseName): string =>
  name === 'linear' ? 'linear' : `cubic-bezier(${ease[name].join(', ')})`;
