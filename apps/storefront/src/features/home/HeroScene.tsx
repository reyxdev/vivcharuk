import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';
import heroSvg from './art/hero.svg?raw';
import { Needle } from './Needle';
import { heroSound } from './heroSound';

// The hero: landscape art rendered on the server (fast first paint), flock and shepherd brought to
// life on the client (36 §36.3.6–36.3.7). The air layer sits above the header so a lifted sheep
// or the shepherd can be carried up to the navigation bar.
// The thread: a smooth, hand-drawn line through the word (a Catmull-Rom curve through uneven
// points — waves of different width and height, like a real thread, not a sine). It crosses the
// letters' midline at the C points; between crossings it passes alternately in front and behind.
const WAVES = (() => {
  const pts: Array<[number, number]> = [
    [-18, 86], [12, 64], [40, 42], [72, 64], [104, 90], [130, 64], [178, 48], [222, 64],
    [242, 78], [260, 64], [304, 36], [342, 64], [368, 86], [394, 64], [418, 54],
  ];
  const seg = (i: number) => {
    const p0 = pts[Math.max(0, i - 1)]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const f = (n: number) => n.toFixed(1);
    return `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  };
  // Pieces: the tail to the first crossing, then crossing to crossing (two curve segments each).
  const cuts = [0, 1, 3, 5, 7, 9, 11, 13, pts.length - 1];
  const total = pts[pts.length - 1]![0] - pts[0]![0];
  let at = 0;
  return cuts.slice(0, -1).map((from, k) => {
    const to = cuts[k + 1]!;
    const d = `M${pts[from]![0]} ${pts[from]![1]}` + Array.from({ length: to - from }, (_, j) => seg(from + j)).join('');
    const share = (pts[to]![0] - pts[from]![0]) / total;
    const piece = { d, front: k % 2 === 0, i: k, delay: at, dur: share };
    at += share;
    return piece;
  });
})();

// A needle leads the thread: its eye sits at the end of the drawn thread, it turns with the curve and
// passes in front of or behind the letters together with the thread. Thread and needle are driven by
// one clock, so they never drift apart; afterwards the needle rests at the end of the thread.
function WovenTitle({ children }: { children: React.ReactNode }) {
  const pieces = useRef<Array<SVGPathElement | null>>([]);
  const full = useRef<SVGPathElement>(null);
  const needleFront = useRef<SVGGElement>(null), needleBack = useRef<SVGGElement>(null);
  useEffect(() => {
    const whole = full.current;
    const ps = pieces.current.filter((x): x is SVGPathElement => !!x);
    if (!whole || ps.length !== WAVES.length) return;
    const L = whole.getTotalLength();
    const lens = ps.map((x) => x.getTotalLength());
    const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
    ps.forEach((x, i) => { x.style.strokeDasharray = `${lens[i]} ${lens[i]}`; x.style.strokeDashoffset = String(lens[i]); });
    const place = (drawn: number) => {
      ps.forEach((x, i) => { x.style.strokeDashoffset = String(lens[i]! - Math.min(lens[i]!, Math.max(0, drawn - starts[i]!))); });
      const k = Math.max(0, starts.findIndex((st, i) => drawn >= st && drawn <= st + lens[i]!));
      const pt = whole.getPointAtLength(drawn), back = whole.getPointAtLength(Math.max(0, drawn - 1.5));
      const deg = (Math.atan2(pt.y - back.y, pt.x - back.x) * 180) / Math.PI;
      const front = WAVES[k]!.front;
      for (const [g, on] of [[needleFront.current, front], [needleBack.current, !front]] as const) {
        if (!g) continue;
        g.style.visibility = on ? 'visible' : 'hidden';
        g.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${deg.toFixed(1)}) scale(1.35)`);
      }
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { place(L); return; }
    const DUR = 1800, DELAY = 250;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    let raf = 0; const t0 = performance.now() + DELAY;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / DUR));
      place(L * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const layer = (front: boolean) => (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"
      className={`pointer-events-none absolute -inset-x-[4%] inset-y-0 h-full w-[108%] overflow-visible ${front ? 'z-10' : '-z-10'}`}>
      {WAVES.map((w) => (w.front === front
        ? <path key={w.i} ref={(el) => { pieces.current[w.i] = el; }} className="vk-weave" d={w.d} fill="none" stroke="#B3261E" strokeWidth="2.4" strokeLinecap="round" />
        : null))}
      {front && <path ref={full} d={WAVES.map((w) => w.d).join('')} fill="none" stroke="none" />}
      <Needle refEl={front ? needleFront : needleBack} />
    </svg>
  );
  return <span className="relative isolate">{layer(false)}{children}{layer(true)}</span>;
}

// Round 10 part 2 #6 / round 11 #76: sound is off on every visit; this button is the only way on.
function SoundToggle() {
  const [on, setOn] = useState(false);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? 'Вимкнути звук' : 'Увімкнути звук'}
      onClick={() => { heroSound.on = !on; setOn(!on); }}
      className="absolute right-4 top-4 z-(--z-dropdown) grid size-10 place-items-center rounded-full border border-border-hairline bg-bg-surface/95 text-text-primary shadow-sm">
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />
        {on ? <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
    </button>
  );
}

/**
 * The path runs on across the green meadow band under the hero (the next section's hill edge), to the
 * meadow's wavy end. The band stretches to the page width and overlaps the hero's foot by a different
 * amount on every screen, so instead of a drawn approximation it carries an exact copy of the hero's
 * own path (stones and grass included), mapped pixel for pixel onto the hero's path and clipped to the
 * meadow. It lines up at any width, on phones, tablets and computers.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const MEADOW_CLIP = 'M0 -18H1440V30Q1300 64 1120 42T760 48T380 30T0 46Z';
function alignPathEdge(root: HTMLElement) {
  const near = root.querySelector<SVGGraphicsElement>('[data-path]');
  const edge = document.querySelector<SVGPathElement>('[data-path-edge]');
  const m = near?.getScreenCTM(), svg = edge?.ownerSVGElement;
  if (!near || !edge || !m || !svg) return;
  let holder = svg.querySelector<SVGGElement>('[data-path-copy]');
  if (!holder) {
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.id = 'vk-meadow-clip';
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const shape = document.createElementNS(SVG_NS, 'path');
    shape.setAttribute('d', MEADOW_CLIP);
    clip.appendChild(shape);
    svg.prepend(clip);
    holder = document.createElementNS(SVG_NS, 'g');
    holder.setAttribute('data-path-copy', '');
    holder.setAttribute('clip-path', 'url(#vk-meadow-clip)');
    const inner = document.createElementNS(SVG_NS, 'g');
    inner.innerHTML = near.innerHTML;
    holder.appendChild(inner);
    edge.parentNode!.insertBefore(holder, edge);
    // The earlier drawn piece is no longer used.
    for (const sel of ['[data-path-edge]', '[data-path-edge-sides]', '[data-path-edge-mid]']) svg.querySelector(sel)?.setAttribute('d', '');
  }
  const box = svg.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const sx = 1440 / box.width, sy = 66 / box.height;
  (holder.firstElementChild as SVGGElement).setAttribute('transform',
    `matrix(${m.a * sx} ${m.b * sy} ${m.c * sx} ${m.d * sy} ${(m.e - box.left) * sx} ${(m.f - box.top) * sy})`);
}

export function HeroScene({ locale, catalogHref }: { locale: Locale; catalogHref: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current, groundHost = groundRef.current;
    if (!root || !layer || !groundHost) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // Loaded after the hero is on screen, so it never competes with first paint (§36.3.6 guards).
    import('./flockEngine').then(({ startFlock }) => {
      if (!cancelled) { stop = startFlock(root, layer, groundHost); alignPathEdge(root); }
    });
    const onResize = () => alignPathEdge(root);
    alignPathEdge(root);
    window.addEventListener('resize', onResize);
    return () => { cancelled = true; stop?.(); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <section ref={rootRef} className="relative max-w-full h-[35rem] sm:h-[37.5rem] lg:h-auto lg:aspect-[1440/620] lg:max-h-[calc(100dvh-4rem)] lg:min-h-[38.75rem]">
      {/* The still picture is its own compositor layer, painted once; the flock moves in the layer above it. */}
      <div className="absolute inset-0 overflow-hidden will-change-transform [contain:strict]" dangerouslySetInnerHTML={{ __html: heroSvg }} />
      <div ref={groundRef} className="pointer-events-none absolute inset-0 overflow-hidden [contain:strict]" />
      <div className="absolute inset-x-0 top-16 flex flex-col items-center gap-3 px-4 text-center sm:top-24 lg:top-[19%] lg:gap-4">
        {/* Round 11 #04 / A2: a wool thread weaves through the name — over one letter, under the
            next — drawing itself left to right. The <h1> itself is never hidden (SEO, LCP). */}
        <WovenTitle>
          <h1 className="relative m-0 font-wordmark text-[4.5rem] leading-none text-text-primary sm:text-[6rem] lg:text-[7rem]">{BUSINESS.brand}</h1>
        </WovenTitle>
        <p className="max-w-[45rem] text-balance rounded-full lg:max-w-none bg-bg-page/85 px-4 py-1.5 text-body font-medium text-text-primary sm:text-body-lg lg:text-h4">{BUSINESS.tagline}</p>
        <div className="mt-1 flex w-full flex-col items-center gap-2 sm:mt-2 sm:w-auto sm:flex-row sm:gap-4">
          <Link to={catalogHref} className="w-full max-w-[17.5rem] whitespace-nowrap rounded-full bg-bg-inverted sm:max-w-none px-6 py-3 text-body font-semibold text-text-on-inverted sm:w-auto sm:rounded-lg sm:px-8 sm:py-4 sm:text-body-lg">Переглянути каталог <span className="vk-arrow" aria-hidden="true">→</span></Link>
          <Link to={path.seg(locale, 'production')} className="w-full max-w-[17.5rem] whitespace-nowrap rounded-full border-2 sm:max-w-none border-text-primary bg-bg-surface px-6 py-2.5 text-body font-semibold text-text-primary sm:w-auto sm:rounded-lg sm:px-8 sm:py-3.5 sm:text-body-lg">Як ми виробляємо</Link>
        </div>
      </div>
      <div ref={layerRef} className="pointer-events-none absolute inset-0 z-(--z-dropdown)" />
      <SoundToggle />
    </section>
  );
}
