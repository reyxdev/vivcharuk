import { forwardRef, useEffect, useRef, useState } from 'react';
import { ResponsiveImage } from '@/lib/ResponsiveImage';
import { useT } from '@/lib/i18n';

export interface GalleryPhoto { publicId: string; width: number; height: number; alt: string }

/**
 * Product photos (round 18). Each photo is shown whole (object-contain), never cropped: a ліжник is
 * judged by its whole pattern. Slides scroll with snap, so a phone swipes between them; thumbnails
 * below jump to a photo. The first photo loads at once (it is the page's largest image), the rest lazily.
 * Round 24: AVIF where the photo has it; on phones the gallery takes at most half the screen height, so the
 * name, the price and the button are on the first screen (G162); thumbnails load their 160/240 px files
 * and give way to dots on phones.
 */
export const Gallery = forwardRef<HTMLDivElement, { photos: GalleryPhoto[]; empty: string; transitionName: string }>(
  function Gallery({ photos, empty, transitionName }, ref) {
    const tr = useT();
    const track = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    useEffect(() => {
      const el = track.current;
      if (!el) return;
      const on = () => setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
      el.addEventListener('scroll', on, { passive: true });
      return () => el.removeEventListener('scroll', on);
    }, []);
    const go = (i: number) => {
      const el = track.current;
      if (el) el.scrollTo({ left: i * el.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };

    if (photos.length === 0) {
      return <div ref={ref} className="grid aspect-[4/5] place-items-center rounded-md bg-bg-alt text-body text-text-muted" style={{ viewTransitionName: transitionName }}>{empty}</div>;
    }
    return (
      <div ref={ref} className="flex min-w-0 flex-col gap-3">
        <div className="relative" style={{ viewTransitionName: transitionName }}>
          <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto rounded-md bg-bg-alt [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-roledescription={tr('gallery.role')} aria-label={tr('gallery.label')}>
            {photos.map((ph, i) => (
              <div key={ph.publicId} className="aspect-[4/5] max-h-[50svh] w-full shrink-0 snap-center lg:max-h-[78vh]" aria-roledescription={tr('gallery.slide')} aria-label={tr('gallery.slideOf', { i: i + 1, n: photos.length })}>
                <ResponsiveImage publicId={ph.publicId} sizes="(min-width: 1024px) min(660px, 52vw), calc(100vw - 32px)" alt={ph.alt}
                  width={ph.width} height={ph.height} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async"
                  className="size-full object-contain" draggable={false} />
              </div>
            ))}
          </div>
          {/* Phones: dots instead of the thumbnail row, so the name and the price fit on the first screen (G162). */}
          {photos.length > 1 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center md:hidden">
              {photos.map((ph, i) => (
                <button key={ph.publicId} type="button" onClick={() => go(i)} aria-label={tr('gallery.photo', { i: i + 1 })} aria-current={active === i} className="grid size-6 place-items-center">
                  <span className={`size-2 rounded-full ${active === i ? 'bg-text-primary' : 'bg-text-primary/30'}`} />
                </button>
              ))}
            </div>
          )}
          {photos.length > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary tabular-nums">{active + 1} / {photos.length}</span>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 max-md:hidden">
            {photos.map((ph, i) => (
              <button key={ph.publicId} type="button" onClick={() => go(i)} aria-label={tr('gallery.photo', { i: i + 1 })} aria-current={active === i}
                className={`size-16 overflow-hidden rounded-md border-2 bg-bg-alt sm:size-20 ${active === i ? 'border-text-primary' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                <ResponsiveImage publicId={ph.publicId} sizes="80px" max={240} fallback={160} alt="" width={80} height={80} loading="lazy" decoding="async" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
