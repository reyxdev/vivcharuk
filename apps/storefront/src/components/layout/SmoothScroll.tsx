import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { startSmoothScroll, syncAfterNavigation } from '@/lib/smoothScroll';

/** Round 23: the site's smooth scroll (src/lib/smoothScroll.ts). Restarts when «reduce motion» flips. */
export function SmoothScroll() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = startSmoothScroll();
    const flip = () => { stop(); stop = startSmoothScroll(); };
    mq.addEventListener('change', flip);
    return () => { mq.removeEventListener('change', flip); stop(); };
  }, []);
  // The router has restored or reset the position by now (S10, S11).
  useEffect(() => { requestAnimationFrame(syncAfterNavigation); }, [pathname, search]);
  return null;
}
