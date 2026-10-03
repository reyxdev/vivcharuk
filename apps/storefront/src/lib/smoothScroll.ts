import type Lenis from 'lenis';

// Round 23 (docs/00-client-decisions-23.md): a smooth, slightly inertial scroll for the site only — the
// panel is a separate app and never loads this. Only a mouse wheel and the keyboard are smoothed;
// phones, tablets and laptop touchpads keep their own scroll (S04, S05). Off under «reduce motion» and
// on weak devices or Save-Data (S06, S07). Strength 4 of 5 (S02) with a short glide (S20): LERP in smoothScrollEngine.ts.
const TO_TOP_SECONDS = 1; // S09
const ease = (t: number) => 1 - (1 - t) ** 4;

let lenis: Lenis | null = null;
/** Set by smoothScrollEngine.ts while Lenis runs. */
export const setLenis = (l: Lenis | null) => { lenis = l; };

export const headerOffset = () => (document.querySelector<HTMLElement>('header')?.offsetHeight ?? 64) + 16;

/** Smooth scroll to the top (S09) — or the browser's own smooth scroll where Lenis is off. */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: TO_TOP_SECONDS, easing: ease });
  else window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/** Smooth scroll to an element, leaving room under the sticky header (S28). */
export function scrollToElement(el: Element) {
  if (lenis) { lenis.scrollTo(el as HTMLElement, { offset: -headerOffset(), duration: TO_TOP_SECONDS, easing: ease }); return; }
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/** Smooth scroll to a page position (S24: the hero's thread leads past the hero). */
export function scrollToY(top: number) {
  if (lenis) { lenis.scrollTo(top, { duration: TO_TOP_SECONDS, easing: ease }); return; }
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

/** After a route change the router has already put the page where it belongs (top, or the old
 *  position on «Назад»): Lenis takes that place over at once, without gliding (S10, S11). */
export function syncAfterNavigation() {
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
}

function eligible() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !n.connection?.saveData
    && (n.hardwareConcurrency ?? 8) >= 4
    && (n.deviceMemory ?? 8) >= 4;
}

/**
 * Starts the smooth scroll if this device should get it; returns the cleanup. Lenis and the wheel and
 * key handling load on demand (smoothScrollEngine.ts): phones and tablets never download them (G039).
 */
export function startSmoothScroll(): () => void {
  if (lenis || !eligible()) return () => {};
  let stop: (() => void) | null = null;
  let cancelled = false;
  void import('./smoothScrollEngine').then((m) => { if (!cancelled) stop = m.start(); });
  return () => { cancelled = true; stop?.(); stop = null; };
}
