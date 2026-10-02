import Lenis from 'lenis';

// Round 23 (docs/00-client-decisions-23.md): a smooth, slightly inertial scroll for the site only — the
// panel is a separate app and never loads this. Only a mouse wheel and the keyboard are smoothed;
// phones, tablets and laptop touchpads keep their own scroll (S04, S05). Off under «reduce motion» and
// on weak devices or Save-Data (S06, S07). Strength 4 of 5 (S02) with a short glide (S20): tune LERP.
const LERP = 0.08;
const TO_TOP_SECONDS = 1; // S09
const ease = (t: number) => 1 - (1 - t) ** 4;

let lenis: Lenis | null = null;

const headerOffset = () => (document.querySelector<HTMLElement>('header')?.offsetHeight ?? 64) + 16;

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

// A notched mouse wheel reports whole lines (Firefox) or steps of 120 (Chromium, Safari); a touchpad
// reports small, uneven pixel deltas. Once a touchpad gesture is seen it keeps the native scroll for
// a moment, so one gesture is never half native, half smoothed.
let padUntil = 0;
function isMouseWheel(e: WheelEvent) {
  const now = performance.now();
  const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
  const mouse = e.deltaMode !== 0 || (e.deltaX === 0 && legacy !== undefined && legacy !== 0 && Math.abs(legacy) % 120 === 0);
  if (!mouse) padUntil = now + 400;
  return mouse && now >= padUntil;
}

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="listbox"], [role="menu"], [role="slider"]';

/** Starts the smooth scroll if this device should get it; returns the cleanup. */
export function startSmoothScroll(): () => void {
  if (lenis || !eligible()) return () => {};
  const l = new Lenis({
    lerp: LERP,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true, // S17: cart, filters, menus scroll natively inside
    stopInertiaOnNavigate: true,
    autoRaf: true,
    virtualScroll: ({ event }) => !(event instanceof WheelEvent) || isMouseWheel(event),
  });
  lenis = l;

  // S08: Space, Page Up/Down, Home/End and the arrows glide too.
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || l.isStopped) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest(EDITABLE)) return;
    if (e.key === ' ' && t?.closest('button, a, summary, [role="button"]')) return;
    const page = window.innerHeight - headerOffset() - 24;
    const step: Record<string, number> = { ArrowDown: 120, ArrowUp: -120, PageDown: page, PageUp: -page, ' ': e.shiftKey ? -page : page };
    let to: number;
    if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = l.limit;
    else if (e.key in step) to = l.targetScroll + step[e.key]!;
    else return;
    e.preventDefault();
    l.scrollTo(Math.max(0, Math.min(l.limit, to)));
  };

  // S28: links to a place on the same page glide there, clear of the header.
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash.length < 2) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    history.replaceState(history.state, '', url.hash);
    scrollToElement(el);
  };

  // S18: while a dialog is open (cart, menu, quick order…) the page under it stands still.
  // S16: holding a sheep or the hutsul's hat stops the page too.
  let modal = false, held = false, queued = 0;
  const apply = () => (modal || held ? l.stop() : l.start());
  const check = () => {
    queued = 0;
    // A dialog counts only while it is shown (the phone menu stays mounted, hidden on a computer).
    const now = [...document.querySelectorAll('[aria-modal="true"]')].some((d) => d.getClientRects().length > 0) || document.body.style.overflow === 'hidden';
    if (now !== modal) { modal = now; apply(); }
  };
  // Dialogs mount and unmount; the cart locks <body>. Inline styles deeper down (the flock moves every
  // frame) are not watched.
  const watch = new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(check); });
  watch.observe(document.body, { childList: true, subtree: true });
  watch.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  check();
  const onDown = (e: PointerEvent) => { if (e.button === 0 && (e.target as HTMLElement | null)?.closest('[data-hold-stops-scroll]')) { held = true; apply(); } };
  const onUp = () => { if (held) { held = false; apply(); } };

  window.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
  document.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  return () => {
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onClick);
    document.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    watch.disconnect();
    cancelAnimationFrame(queued);
    l.destroy();
    lenis = null;
  };
}
