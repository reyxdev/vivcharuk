import { useEffect, useRef, useState } from 'react';

/** True for a moment after `value` grows — e.g. the cart count (round 11 #37), never on first render. */
export function useBump(value: number, ms = 400) {
  const prev = useRef(value);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (value > prev.current) {
      setOn(true);
      const h = setTimeout(() => setOn(false), ms);
      prev.current = value;
      return () => clearTimeout(h);
    }
    prev.current = value;
  }, [value, ms]);
  return on;
}

/** Round 11 #09 / A5: a thin shadow under the header once the page has scrolled past 8 px. */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return scrolled;
}

/** `value` after it has stopped changing for `ms` (round 11 #35: the custom-size price, 400 ms). */
export function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const h = setTimeout(() => setV(value), ms); return () => clearTimeout(h); }, [value, ms]);
  return v;
}

/** A counter that grows each time `value` changes after the first render — a key that replays a highlight. */
export function useChangeKey(value: unknown) {
  const prev = useRef(value);
  const [n, setN] = useState(0);
  useEffect(() => { if (prev.current !== value) { prev.current = value; setN((x) => x + 1); } }, [value]);
  return n;
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Round 11 B3a: a copy of the product photo flies on a soft arc to the header cart (≈ 500 ms,
 * ease in-out). Desktop only, never under reduced motion; resolves when it lands (or at once).
 */
export function flyToCart(from: Element | null): Promise<void> {
  const target = document.querySelector('[data-cart-target]');
  if (!from || !target || prefersReducedMotion() || !window.matchMedia('(min-width: 1024px)').matches) return Promise.resolve();
  const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
  const ghost = from.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', zIndex: '60', pointerEvents: 'none', borderRadius: '12px', overflow: 'hidden' });
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.max(0.06, 32 / a.width);
  const anim = ghost.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(${(1 + s) / 2.4})`, opacity: 0.9, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.4 },
  ], { duration: 500, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
  return anim.finished.then(() => ghost.remove(), () => ghost.remove());
}

/**
 * Round 11 #74: drawers, sheets and dialogs close with a swipe towards their edge; the × stays.
 * The element follows the finger and snaps back unless dragged past 80 px. A sheet with its own
 * scroll only drags when scrolled to the top.
 */
export function useSwipeClose<T extends HTMLElement>(dir: 'left' | 'right' | 'down', onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null, d = 0;
    const axis = dir === 'down' ? 'y' : 'x', sign = dir === 'left' ? -1 : 1;
    const down = (e: TouchEvent) => { if (dir === 'down' && el.scrollTop > 0) return; const t = e.touches[0]!; start = { x: t.clientX, y: t.clientY }; d = 0; };
    const move = (e: TouchEvent) => {
      if (!start) return;
      const t = e.touches[0]!, dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (Math.abs(axis === 'y' ? dx : dy) > Math.abs(axis === 'y' ? dy : dx)) { start = null; el.style.translate = ''; return; }
      d = Math.max(0, (axis === 'y' ? dy : dx) * sign);
      el.style.transition = 'none';
      el.style.translate = axis === 'y' ? `0 ${d}px` : `${d * sign}px 0`;
    };
    const up = () => {
      if (!start) return;
      start = null;
      el.style.transition = 'translate var(--dur-base) var(--ease-out)';
      if (d > 80) onClose(); else el.style.translate = '';
    };
    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', up);
    return () => { el.removeEventListener('touchstart', down); el.removeEventListener('touchmove', move); el.removeEventListener('touchend', up); };
  }, [dir, onClose]);
  return ref;
}

/**
 * True once the page has been idle after load. Menus mount (hidden) at that moment, so opening one is only a
 * visibility change and its animation starts on the next frame even on slow hardware.
 */
export function useIdle(timeout = 3000) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setIdle(true), { timeout }); return () => w.cancelIdleCallback?.(id); }
    const id = setTimeout(() => setIdle(true), 1500);
    return () => clearTimeout(id);
  }, [timeout]);
  return idle;
}
