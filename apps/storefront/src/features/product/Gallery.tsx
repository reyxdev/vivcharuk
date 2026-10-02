import { forwardRef, useEffect, useRef, useState } from 'react';
import { mediaSrcSet, mediaUrl } from '@/lib/media';

export interface GalleryPhoto { publicId: string; width: number; height: number; alt: string }

/**
 * Product photos (round 18). Each photo is shown whole (object-contain), never cropped: a ліжник is
 * judged by its whole pattern. Slides scroll with snap, so a phone swipes between them; thumbnails
 * below jump to a photo. The first photo loads at once (it is the page's largest image), the rest lazily.
 */
export const Gallery = forwardRef<HTMLDivElement, { photos: GalleryPhoto[]; empty: string; transitionName: string }>(
  function Gallery({ photos, empty, transitionName }, ref) {
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
          <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto rounded-md bg-bg-alt [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-roledescription="галерея" aria-label="Фото товару">
            {photos.map((ph, i) => (
              <div key={ph.publicId} className="aspect-[4/5] max-h-[78vh] w-full shrink-0 snap-center" aria-roledescription="слайд" aria-label={`${i + 1} з ${photos.length}`}>
                <img src={mediaUrl(ph.publicId, 960)} srcSet={mediaSrcSet(ph.publicId)} sizes="(min-width: 1024px) 55vw, 100vw" alt={ph.alt}
                  width={ph.width} height={ph.height} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async"
                  className="size-full object-contain" draggable={false} />
              </div>
            ))}
          </div>
          {photos.length > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary tabular-nums">{active + 1} / {photos.length}</span>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2">
            {photos.map((ph, i) => (
              <button key={ph.publicId} type="button" onClick={() => go(i)} aria-label={`Фото ${i + 1}`} aria-current={active === i}
                className={`size-16 overflow-hidden rounded-md border-2 bg-bg-alt sm:size-20 ${active === i ? 'border-text-primary' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                <img src={mediaUrl(ph.publicId, 160)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
