import { useEffect } from 'react';
import { useMatches } from 'react-router';

// Round 24 G026: our own real-user speed measurement. Half of the page loads report LCP, INP, CLS and
// TTFB of the page they landed on, once, when the tab is hidden, with the page template and a device
// class only: no cookies, no ids, nothing stored in the browser. Measured by hand with
// PerformanceObserver (the web-vitals definitions, simplified: no bfcache restores, no soft navigations).

/** Route id → template: «routes/product» / «product-tovar» → product, «info_delivery-dostavka-i-oplata» → info. */
export const template = (id: string) => id.replace(/^routes\//, '').replace(/[_-].*$/, '').replace(/[^a-z0-9]/g, '').slice(0, 32) || 'other';

/** An observer whose `flush()` hands over the entries still queued, before the report goes out. */
function observe(type: string, cb: (entries: PerformanceEntry[]) => void, opts: Record<string, unknown> = {}) {
  try {
    const o = new PerformanceObserver((l) => cb(l.getEntries()));
    o.observe({ type, buffered: true, ...opts } as PerformanceObserverInit);
    return { disconnect: () => o.disconnect(), flush: () => { const rest = o.takeRecords(); if (rest.length) cb(rest); o.disconnect(); } };
  } catch { return null; }
}

export function Rum() {
  const matches = useMatches();
  const page = template(matches.at(-1)?.id ?? 'other');
  useEffect(() => {
    if (Math.random() >= 0.5 || typeof PerformanceObserver === 'undefined' || !navigator.sendBeacon) return;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const start = (nav as unknown as { activationStart?: number } | undefined)?.activationStart ?? 0;
    const m: { LCP?: number; INP?: number; CLS?: number; TTFB?: number } = {};
    if (nav && nav.responseStart > 0) m.TTFB = Math.max(0, nav.responseStart - start);

    const lcp = observe('largest-contentful-paint', (es) => { const e = es.at(-1); if (e) m.LCP = Math.max(0, e.startTime - start); });
    // CLS: the largest session window (gaps < 1 s, at most 5 s long) of shifts without recent input.
    let win = 0, winStart = 0, last = 0;
    const cls = observe('layout-shift', (es) => {
      for (const e of es as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (e.hadRecentInput) continue;
        if (e.startTime - last > 1000 || e.startTime - winStart > 5000) { win = 0; winStart = e.startTime; }
        win += e.value; last = e.startTime;
        m.CLS = Math.max(m.CLS ?? 0, win);
      }
    });
    // INP: the slowest interaction (one in 50 ignored on busy pages), per interactionId.
    const worst = new Map<number, number>();
    const inp = observe('event', (es) => {
      for (const e of es as Array<PerformanceEntry & { interactionId?: number }>) if (e.interactionId) worst.set(e.interactionId, Math.max(worst.get(e.interactionId) ?? 0, e.duration));
      const all = [...worst.values()].sort((a, b) => b - a);
      if (all.length) m.INP = all[Math.min(all.length - 1, Math.floor(all.length / 50))];
    }, { durationThreshold: 40 });
    // LCP stops at the first input, as browsers do.
    const stopLcp = () => lcp?.flush();
    addEventListener('pointerdown', stopLcp, { once: true, capture: true });
    addEventListener('keydown', stopLcp, { once: true, capture: true });

    let sent = false;
    const send = (e: Event) => {
      if (sent || (e.type === 'visibilitychange' && document.visibilityState !== 'hidden')) return;
      sent = true;
      for (const o of [lcp, cls, inp]) o?.flush();
      const device = innerWidth < 768 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop';
      navigator.sendBeacon('/api/v1/rum', new Blob([JSON.stringify({ page, device, ...m })], { type: 'application/json' }));
    };
    document.addEventListener('visibilitychange', send);
    addEventListener('pagehide', send);
    return () => { document.removeEventListener('visibilitychange', send); removeEventListener('pagehide', send); lcp?.disconnect(); cls?.disconnect(); inp?.disconnect(); };
    // Only the page the visitor landed on is measured: later client-side navigations do not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
