import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';
import { Needle } from './Needle';
import { mediaUrl } from '@/lib/media';

export interface HomeStage { key: string; track: 'WOOL' | 'HIDE'; title: string; photo: { publicId: string; width: number; height: number } | null }

// Round 10 part 2 #9: «від сирої вовни до готового виробу» as a path whose thread draws itself
// while the visitor scrolls. The wool track is the path; вичинка шкур is the sheepskin side branch.
export function ProductionPath({ stages, locale }: { stages: HomeStage[]; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const thread = useRef<SVGPathElement>(null);
  const needle = useRef<SVGGElement>(null);
  const wool = stages.filter((s) => s.track === 'WOOL');
  const hide = stages.filter((s) => s.track === 'HIDE');

  useEffect(() => {
    const el = ref.current, p = thread.current;
    if (!el || !p) return;
    // The needle leads the thread with its eye at the drawn end (as in the hero title), and rests at
    // the end once the path is complete; it follows the scroll both ways.
    const L = p.getTotalLength();
    const put = (t: number) => {
      p.style.strokeDashoffset = String(1 - t);
      const g = needle.current;
      if (!g) return;
      const d = Math.max(2, L * t), pt = p.getPointAtLength(d), back = p.getPointAtLength(Math.max(0, d - 2));
      const deg = (Math.atan2(pt.y - back.y, pt.x - back.x) * 180) / Math.PI;
      g.style.visibility = t > 0.005 ? 'visible' : 'hidden';
      g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(1.8)`);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { put(1); return; }
    let raf = 0;
    const draw = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      put(Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (r.height + vh * 0.3))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-5 hidden h-10 w-full overflow-visible lg:block">
        <path ref={thread} d="M20 20C140 -4 220 44 340 20S560 -4 680 20S900 44 1020 20S1160 4 1180 20" pathLength={1} fill="none" stroke="#B3261E" strokeWidth="3" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
        <Needle refEl={needle} />
      </svg>
      <ol className="relative grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
        {wool.map((s, i) => (
          <li key={s.key} className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-full border-2 border-text-primary bg-bg-surface text-h4 text-text-primary">{i + 1}</span>
            <span className="text-h4 text-text-primary">{s.title}</span>
            {s.photo
              ? <img src={mediaUrl(s.photo.publicId, 480)} alt={s.title} width={s.photo.width} height={s.photo.height} loading="lazy" className="aspect-square w-full rounded-lg object-cover lg:aspect-[4/5]" />
              : <span className="grid aspect-square w-full place-items-center rounded-lg border-2 lg:aspect-[4/5] border-dashed border-border-control bg-bg-surface p-3 text-caption text-text-muted">фото / відео етапу</span>}
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {hide.length > 0 && <p className="text-body-lg text-text-body">Окрема гілка для овчини: <strong className="text-text-primary">{hide.map((s) => s.title.toLowerCase()).join(', ')}</strong> — теж у нас.</p>}
        <Link to={path.seg(locale, 'production')} className="text-body font-semibold text-text-primary underline">Як ми виробляємо <span className="vk-arrow" aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
