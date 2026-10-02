import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigation } from 'react-router';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Page-level motion (round 11 #53, #60, #62; 36 §36.3.3):
 * - section headings below the fold rise as a whole when they enter the view (once each); content
 *   already on screen is never hidden, and nothing is hidden before the page has hydrated;
 * - between pages a wool thread stitches across the top of the viewport while the next page loads
 *   (≤ 450 ms, never waiting for data) and the new page rises. Not inside checkout or the order
 *   page (§13.11), not under reduced motion (a plain cross-fade there).
 */
export function PageMotion() {
  const { pathname } = useLocation();
  const nav = useNavigation();
  const quiet = /\/(oformlennia|checkout|zamowienie|kasse|zamovlennia|order|bestellung|moje-zamowienie)(\/|$)/;
  const target = nav.location?.pathname ?? '';
  // Card → product page is carried by the photo morph instead (#54 takes precedence over #53).
  const toProduct = /\/(tovar|product|produkt)\//.test(target);
  const stitching = nav.state === 'loading' && !quiet.test(target) && !quiet.test(pathname) && !toProduct && target !== pathname;

  useEffect(() => {
    if (prefersReducedMotion()) { document.querySelectorAll('[data-draw]').forEach((el) => el.classList.add('vk-in')); return; }
    const els = [...document.querySelectorAll<HTMLElement>('main h2, [data-reveal]')].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    els.forEach((el) => el.classList.add('vk-pre'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('vk-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    // Threads that draw themselves once they are seen (the «30+ років» underline, #61).
    document.querySelectorAll('[data-draw]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const [done, setDone] = useState(false);
  const was = useRef(false);
  useEffect(() => {
    if (stitching) { was.current = true; setDone(false); }
    else if (was.current) { was.current = false; setDone(true); const h = setTimeout(() => setDone(false), 450); return () => clearTimeout(h); }
  }, [stitching]);
  if (!stitching && !done) return null;
  return (
    <svg className={`pointer-events-none fixed inset-x-0 top-0 z-(--z-overlay) h-2 w-full ${done ? 'vk-stitch-out' : ''}`} viewBox="0 0 1200 8" preserveAspectRatio="none" aria-hidden="true">
      <path className="vk-stitch" pathLength={1} d="M0 4q25-4 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0" fill="none" stroke="var(--c-forest-700)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
