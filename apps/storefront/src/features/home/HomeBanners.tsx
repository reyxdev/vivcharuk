import { Link } from 'react-router';
import { ResponsiveImage } from '@/lib/ResponsiveImage';
import { useLocale } from '@/lib/i18n';

export interface HomeBanner { title: string; buttonLabel: string | null; linkUrl: string | null; image: { publicId: string; width: number; height: number } }

// Each card's frame has a fixed ratio, so the photo arriving later never moves the page (no layout shift).
const FRAME = ['', 'aspect-[4/3] md:aspect-[5/2]', 'aspect-[4/3] md:aspect-[16/9]', 'aspect-[4/3]'];
const SIZES = ['', '(min-width: 1280px) 1200px, 100vw', '(min-width: 768px) 50vw, 85vw', '(min-width: 768px) 33vw, 85vw'];

/**
 * D27, round 20 #230–231: up to three banners from the panel right under the hero — photo, title,
 * button. On the phone a swipeable row (the next card peeks in); from the tablet up, side by side.
 * The API sends only the ones switched on and inside their dates; none means nothing is drawn.
 */
export function HomeBanners({ items }: { items: HomeBanner[] }) {
  const locale = useLocale();
  const n = Math.min(items.length, 3);
  if (!n) return null;
  return (
    <section aria-label={locale === 'en' ? 'Shop offers' : 'Пропозиції магазину'} className="mx-auto mb-12 max-w-(--container-wide) lg:px-12">
      <ul className={`flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] md:grid md:gap-5 md:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden ${n === 2 ? 'md:grid-cols-2' : n === 3 ? 'md:grid-cols-3' : ''}`}>
        {items.slice(0, 3).map((b, i) => {
          const body = (
            <>
              <ResponsiveImage publicId={b.image.publicId} sizes={SIZES[n]!} width={b.image.width} height={b.image.height}
                loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full object-cover transition-transform duration-(--dur-base) group-hover:scale-[1.02] motion-reduce:transition-none" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-5 md:p-6">
                <span className="max-w-[28ch] text-h3 text-white [text-wrap:balance]">{b.title}</span>
                {b.linkUrl && <span className="rounded-lg bg-white px-4 py-2 text-body-sm font-semibold text-[#1C1B18]">{b.buttonLabel ?? (locale === 'en' ? 'View' : 'Переглянути')} <span className="vk-arrow" aria-hidden="true">→</span></span>}
              </span>
            </>
          );
          const frame = `group relative block overflow-hidden rounded-xl bg-bg-alt ${FRAME[n]}`;
          return (
            <li key={i} className={`shrink-0 snap-start ${n === 1 ? 'w-full' : 'w-[85%] md:w-auto'}`}>
              {b.linkUrl
                ? <Link to={b.linkUrl} className={`${frame} focus-visible:outline-2 focus-visible:outline-offset-2`}>{body}</Link>
                : <div className={frame}>{body}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
