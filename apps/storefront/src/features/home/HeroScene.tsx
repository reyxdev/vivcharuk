import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import { useT } from '@/lib/i18n';
import { useBusiness } from '@/lib/business';
import { path } from '@/lib/segments';
import { heroLayers } from './heroMarkup';
import { heroPath } from './heroPath';
import type { Flock } from './flockEngine';
import { Needle } from './Needle';
import { heroSound } from './heroSound';
import { scrollToY } from '@/lib/smoothScroll';

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
/**
 * Round 23 perf: once the flock has taken its sheep and smoke out of the landscape, the landscape never
 * changes again; shown as one picture (the same SVG, serialized) it costs a single image draw. Round 24:
 * only the two live layers (hut, front) are inline, so only they are frozen. The inline SVG stays in
 * place, hidden, because the meadow path is measured on it and its <defs> fill the flock's shadows.
 */
function freezeLandscape(still: HTMLElement) {
  // The firs (narrow screens only) stay inline: as a picture they would be laid out once more, the costliest part.
  for (const host of still.querySelectorAll<HTMLElement>('[data-live="hut"], [data-live="front"]')) {
    const svg = host.querySelector<SVGSVGElement>('svg');
    if (!svg || host.querySelector('img')) continue;
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
    const img = new Image();
    img.alt = ''; img.decoding = 'async'; img.dataset.landStill = '';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:bottom';
    img.src = url;
    img.decode().then(() => {
      host.prepend(img);
      svg.style.visibility = 'hidden';
      // Only the path group is still measured (alignPathEdge); everything else leaves layout and paint.
      const path = svg.querySelector('[data-path]');
      for (const c of svg.children) if (c.tagName !== 'defs' && c.tagName !== 'style' && !(path && c.contains(path))) (c as SVGElement).style.display = 'none';
    }, () => {}).finally(() => URL.revokeObjectURL(url));
  }
}

/** G029: weak devices, Save-Data and «reduce motion» get the still picture; the flock wakes on a touch. */
function quietDevice() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.hardwareConcurrency > 0 && n.hardwareConcurrency <= 4) || (!!n.deviceMemory && n.deviceMemory <= 4)
    || !!n.connection?.saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
const whenIdle = (cb: () => void) => {
  const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined; // Safari before 18
  if (ric) { const id = window.requestIdleCallback(cb, { timeout: 2500 }); return () => window.cancelIdleCallback(id); }
  const id = window.setTimeout(cb, 1500); return () => window.clearTimeout(id);
};

/** Round 23 S24: a thread runs down from the buttons, inviting to scroll on; it fades once the page moves. */
function ScrollCue() {
  const tr = useT();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const on = () => setGone(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <button type="button" aria-label={tr('hero.scrollOn')} tabIndex={gone ? -1 : 0}
      onClick={(e) => { const s = e.currentTarget.closest('section'); if (s) scrollToY(s.getBoundingClientRect().bottom + window.scrollY - 64); }}
      className={`mt-1 grid place-items-center rounded-full px-3 py-1 transition-opacity duration-300 will-change-transform sm:mt-3 ${gone ? 'vk-cue-off pointer-events-none opacity-0' : ''}`}>
      {/* A cream halo under the red thread keeps it readable over the dark firs. */}
      <svg width="18" height="64" viewBox="0 0 18 64" aria-hidden="true">
        <path className="vk-cue-thread" d="M9 2C13 12 5 19 9 30S13 51 9 62" pathLength={1} fill="none" stroke="#FAF6EE" strokeOpacity=".9" strokeWidth="6" strokeLinecap="round" />
        <path className="vk-cue-thread" d="M9 2C13 12 5 19 9 30S13 51 9 62" pathLength={1} fill="none" stroke="#B3261E" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

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
// Round 24 G165: a 46 px touch area around the 40 px circle.
function SoundToggle() {
  const tr = useT();
  const [on, setOn] = useState(false);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? tr('hero.soundOff') : tr('hero.soundOn')}
      onClick={() => { heroSound.on = !on; setOn(!on); }}
      className="absolute right-4 top-4 z-(--z-dropdown) grid size-10 place-items-center rounded-full border border-border-hairline bg-bg-surface/95 text-text-primary shadow-sm after:absolute after:-inset-[3px] after:rounded-full after:content-['']">
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
// Round 24: the copy is placed by arithmetic instead of measuring the live SVG (no forced layout), so the
// band is drawn at once from the path shapes shipped with the script (heroPath.ts, generated from the art).
// The hero art fills the still layer with viewBox 0 0 1440 620, «xMidYMax slice»; the path group is only
// ever translated (by the flock engine on phones, to follow the hut).
function alignPathEdge(root: HTMLElement) {
  const still = root.firstElementChild;
  const edge = document.querySelector<SVGPathElement>('[data-path-edge]');
  const svg = edge?.ownerSVGElement;
  if (!still || !edge || !svg) return;
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
    inner.innerHTML = heroPath.html;
    holder.appendChild(inner);
    edge.parentNode!.insertBefore(holder, edge);
    // The earlier drawn piece is no longer used.
    for (const sel of ['[data-path-edge]', '[data-path-edge-sides]', '[data-path-edge-mid]']) svg.querySelector(sel)?.setAttribute('d', '');
  }
  const t = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(root.querySelector('[data-path]')?.getAttribute('transform') ?? '');
  const tx = t ? +t[1]! : heroPath.tx, ty = t ? +t[2]! : heroPath.ty;
  const art = still.getBoundingClientRect(), box = svg.getBoundingClientRect();
  if (!art.width || !art.height || !box.width || !box.height) return;
  const k = Math.max(art.width / 1440, art.height / 620);
  const ox = art.left + (art.width - 1440 * k) / 2, oy = art.bottom - 620 * k;
  const sx = 1440 / box.width, sy = 66 / box.height;
  (holder.firstElementChild as SVGGElement).setAttribute('transform',
    `matrix(${k * sx} 0 0 ${k * sy} ${(ox + k * tx - box.left) * sx} ${(oy + k * ty - box.top) * sy})`);
}

// object-fit cover + bottom is the drawing's own «xMidYMax slice», said in CSS (the picture keeps its 1440:620 ratio).
const PIC = 'absolute inset-0 size-full max-w-none object-cover object-bottom';

export function HeroScene({ locale, catalogHref }: { locale: Locale; catalogHref: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLDivElement>(null);
  const tr = useT();
  const biz = useBusiness();

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current, groundHost = groundRef.current, still = stillRef.current;
    if (!root || !layer || !groundHost || !still) return;
    let flock: Flock | undefined;
    let cancelled = false;
    alignPathEdge(root);
    // G028: everything live waits until the browser is idle, in small steps, so none of it competes with the
    // first paint or the page becoming interactive. The live layers come from the browser cache (the
    // pictures are the same files) and replace their pictures in the same frame: nothing on screen changes.
    const step = () => new Promise<void>((r) => { setTimeout(r, 0); });
    // After the next frame has been drawn: what was just added has been laid out in that frame.
    const frame = () => new Promise<void>((r) => { requestAnimationFrame(() => { setTimeout(r, 0); }); });
    const live = async (name: 'hut' | 'front' | 'firs') => {
      const text = await fetch(heroLayers[name]).then((r) => r.text());
      await step();
      const host = still.querySelector<HTMLElement>(`[data-live="${name}"]`);
      if (cancelled || !host) return;
      if (name === 'firs') {
        // Every fir is a <use> of a large drawing: laid out all at once they take a phone ~60 ms. They go in
        // a few at a time (shade + fir), hidden until all are there.
        const groups: Record<string, string[]> = {};
        host.style.visibility = 'hidden';
        host.innerHTML = text.replace(/(<g (data-(?:big)?firs)="">)([\s\S]*?)(<\/g>)/g, (_, open: string, key: string, body: string, close: string) => {
          groups[key] = body.split(/(?=<ellipse)/); return open + close;
        });
        for (const [key, items] of Object.entries(groups)) {
          const g = host.querySelector(`[${key}]`);
          for (let i = 0; g && i < items.length; i += 8) {
            g.insertAdjacentHTML('beforeend', items.slice(i, i + 8).join(''));
            await frame();
            if (cancelled) return;
          }
        }
        host.style.visibility = '';
      } else host.innerHTML = text;
      const pic = still.querySelector<HTMLElement>(`[data-pic="${name}"]`);
      if (pic) pic.style.visibility = 'hidden';
    };
    // The hut moves in among the firs only where the screen shows less than the left part of the scene.
    const box = still.getBoundingClientRect();
    const narrow = (1440 - box.width / Math.max(box.width / 1440, box.height / 620)) / 2 > 70;
    const quiet = quietDevice();
    let starting: Promise<void> | undefined;
    const start = (asleep: boolean) => (starting ??= (async () => {
      const [{ startFlock }] = await Promise.all([import('./flockEngine'), live('hut').then(() => live('front')).then(() => (narrow ? live('firs') : undefined))]);
      await step();
      if (cancelled) return;
      flock = startFlock(root, layer, groundHost, { asleep });
      alignPathEdge(root); // on phones the engine moved the path with the hut
    })());
    // Frozen only while the flock runs: an asleep scene has no frames to save.
    const freeze = () => { if (!cancelled) whenIdle(() => freezeLandscape(still)); };
    const cancelIdle = whenIdle(() => void start(quiet).then(() => { if (!quiet) freeze(); }));
    // G029: on a quiet device the first touch in the hero wakes the flock (a second one picks a sheep up).
    const wake = (e: PointerEvent) => {
      root.removeEventListener('pointerdown', wake, true);
      if (e.target instanceof Node && (layer.contains(e.target) || groundHost.contains(e.target))) e.stopPropagation();
      void start(true).then(() => { flock?.wake(); freeze(); });
    };
    if (quiet) root.addEventListener('pointerdown', wake, true);
    // Round 23 perf: once the hero is off screen its endless CSS loops (chimney smoke, the scroll
    // thread) pause, so they cost no frames while the rest of the page is read.
    const seen = new IntersectionObserver(([e]) => { if (e) root.toggleAttribute('data-hero-off', !e.isIntersecting); });
    seen.observe(root);
    const onResize = () => alignPathEdge(root);
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true; cancelIdle(); flock?.stop(); seen.disconnect();
      root.removeEventListener('pointerdown', wake, true); window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section ref={rootRef} data-hold-stops-scroll className="relative max-w-full h-[35rem] sm:h-[37.5rem] lg:h-auto lg:aspect-[1440/620] lg:max-h-[calc(100dvh-4rem)] lg:min-h-[38.75rem]">
      {/* The still picture is its own compositor layer, painted once; the flock moves in the layer above it. */}
      {/* G027: the art paints as five cached pictures (layers of one drawing, same viewBox); the live ones are
          then placed inline over their pictures for the flock (see the effect above). */}
      <div ref={stillRef} className="pointer-events-none absolute inset-0 select-none overflow-hidden will-change-transform [contain:strict]">
        <img src={heroLayers.back} alt="" width={1440} height={620} fetchPriority="high" decoding="async" draggable={false} className={PIC} />
        <img src={heroLayers.hut} data-pic="hut" alt="" width={1440} height={620} decoding="async" draggable={false} className={PIC} />
        <div data-live="hut" className={PIC} />
        <img src={heroLayers.grass} alt="" width={1440} height={620} decoding="async" draggable={false} className={PIC} />
        <img src={heroLayers.firs} data-pic="firs" alt="" width={1440} height={620} decoding="async" draggable={false} className={PIC} />
        <div data-live="firs" className={PIC} />
        <img src={heroLayers.front} data-pic="front" alt="" width={1440} height={620} decoding="async" draggable={false} className={PIC} />
        <div data-live="front" className={PIC} />
      </div>
      {/* Round 23 perf: the ground (hut, shepherd, smoke) and the flock below are their own compositor
          layers, so a sheep step or a puff of smoke repaints only that layer, never the whole page. */}
      <div ref={groundRef} className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform [contain:strict]" />
      <div className="absolute inset-x-0 top-16 flex flex-col items-center gap-3 px-4 text-center sm:top-24 lg:top-[19%] lg:gap-4">
        {/* Round 11 #04 / A2: a wool thread weaves through the name — over one letter, under the
            next — drawing itself left to right. The <h1> itself is never hidden (SEO, LCP). */}
        <WovenTitle>
          <h1 className="relative m-0 font-wordmark text-[4.5rem] leading-none text-text-primary sm:text-[6rem] lg:text-[7rem]">{BUSINESS.brand}</h1>
        </WovenTitle>
        <p className="max-w-[45rem] text-balance rounded-full lg:max-w-none bg-bg-page/85 px-4 py-1.5 text-body font-medium text-text-primary sm:text-body-lg lg:text-h4">{biz.tagline}</p>
        <div className="mt-1 flex w-full flex-col items-center gap-2 sm:mt-2 sm:w-auto sm:flex-row sm:gap-4">
          <Link to={catalogHref} className="w-full max-w-[17.5rem] whitespace-nowrap rounded-full bg-bg-inverted sm:max-w-none px-6 py-3 text-body font-semibold text-text-on-inverted sm:w-auto sm:rounded-lg sm:px-8 sm:py-4 sm:text-body-lg">{tr('hero.catalog')} <span className="vk-arrow" aria-hidden="true">→</span></Link>
          <Link to={path.seg(locale, 'production')} className="w-full max-w-[17.5rem] whitespace-nowrap rounded-full border-2 sm:max-w-none border-text-primary bg-bg-surface px-6 py-2.5 text-body font-semibold text-text-primary sm:w-auto sm:rounded-lg sm:px-8 sm:py-3.5 sm:text-body-lg">{tr('hero.howWeMake')}</Link>
        </div>
        <ScrollCue />
      </div>
      <div ref={layerRef} className="pointer-events-none absolute inset-0 z-(--z-dropdown) will-change-transform" />
      <SoundToggle />
    </section>
  );
}
