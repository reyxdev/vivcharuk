import { mediaUrl } from '@/lib/media';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { CategoryNode, Locale, ProductListItem } from '@vivcharyk/schemas';
import { formatRange } from '@/lib/money';
import { PARTNERS_NAME, PARTNERS_SLUG, path } from '@/lib/segments';
import { categoryArt } from '@/features/home/categoryArt';
import { useIdle } from '@/lib/motion';
import { t } from '@/lib/i18n';

/**
 * Round 10 part 1 #5–7: a mega menu with category illustrations, subcategories as text links (so their
 * URLs stay reachable, part 3 #14) and best sellers. Opens on hover after ~150 ms of intent, on
 * click, and from the keyboard; Escape closes it. The promo banner slot waits for §23.12.
 */
// Round 22 K45: the same tree and names as the panel, no renaming here. K13: «Від партнерів» is gathered
// from the products' origin and closes the list while there are partner goods.
export function MegaMenu({ locale, categories, partners, label, className, chevron }: { locale: Locale; categories: CategoryNode[]; partners: boolean; label: string; className: string; chevron: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<ProductListItem[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);
  // Mounted hidden once the page is idle, and the best sellers fetched as soon as the pointer comes near, so
  // opening is only a visibility change and the drop animation starts on the next frame on any hardware.
  const ready = useIdle();
  const [wanted, setWanted] = useState(false);

  const intent = (v: boolean) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(v), v ? 150 : 200); };
  useEffect(() => {
    if ((!open && !wanted) || hits) return;
    fetch(`/api/v1/products/featured?locale=${locale}`).then((r) => r.json()).then((d: { items: ProductListItem[] }) => setHits(d.items.slice(0, 3))).catch(() => setHits([]));
  }, [open, wanted, hits, locale]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);
  const close = () => setOpen(false);

  return (
    <div ref={root} onMouseEnter={() => { setWanted(true); intent(true); }} onMouseLeave={() => intent(false)} onFocus={() => setWanted(true)}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => { clearTimeout(timer.current); setOpen(!open); }} className={`${className} flex items-center gap-1.5`}>
        {label} {chevron}
      </button>
      {(open || ready) && (
        <div hidden={!open} className="vk-drop absolute inset-x-0 top-full z-(--z-dropdown) max-h-[calc(100dvh-7rem)] overflow-y-auto border-b border-border-hairline bg-bg-surface shadow-lg" role="region" aria-label={label}>
          {/* Round 18: eleven groups, so six compact columns with small illustrations instead of four wide ones. */}
          <div className="mx-auto grid max-w-(--container-wide) gap-8 px-12 py-7 xl:grid-cols-[1fr_17rem]">
            <ul className="vk-seq grid grid-cols-4 gap-x-5 gap-y-6 xl:grid-cols-6">
              {[...categories, ...(partners ? [{ id: 'partners', key: 'partnerski-vyroby', slug: PARTNERS_SLUG, name: locale === 'en' ? t(locale, 'product.partner') : PARTNERS_NAME, children: [] }] : [])].map((c, i, all) => (
                // With 7–11 groups the second row leaves its last slot empty: the sixth group (the longest
                // list) runs down into it instead of pushing the second row lower.
                <li key={c.id} className={`flex min-w-0 flex-col gap-1.5 ${i === 5 && all.length > 6 && all.length < 12 ? 'xl:row-span-2' : ''}`}>
                  <Link to={path.category(locale, c.slug)} onClick={close} className="group flex items-center gap-2.5">
                    {/* The same illustrations as the homepage circles (round 11 U3); a dashed slot for a category without one. */}
                    {categoryArt(c.key)
                      ? <span className="grid size-13 shrink-0 place-items-center rounded-full border border-border-hairline bg-bg-alt p-0.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" dangerouslySetInnerHTML={{ __html: categoryArt(c.key)! }} />
                      : <span className="size-13 shrink-0 rounded-full border border-dashed border-border-control bg-bg-alt" aria-hidden="true" />}
                    <span className="text-body-sm font-semibold leading-snug text-text-primary group-hover:underline">{c.name}</span>
                  </Link>
                  {c.children.length > 0 && (
                    <ul className="flex flex-col gap-0.5 pl-1">
                      {c.children.map((ch) => (
                        <li key={ch.id}><Link to={path.category(locale, c.slug, ch.slug)} onClick={close} className="text-caption leading-snug text-text-body hover:underline">{ch.name}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {/* Its own column, set apart by a rule, so the heading reads as the title of the products under it, not of a category. */}
            <aside className="flex flex-col gap-3 border-l border-border-hairline pl-6 max-xl:hidden" aria-labelledby="mega-hits">
              <h2 id="mega-hits" className="flex items-center gap-2 text-body font-semibold text-text-primary">
                <svg viewBox="0 0 24 24" className="size-5 text-accent" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" /></svg>
                {locale === 'en' ? 'Bestsellers' : 'Хіти продажу'}
              </h2>
              {hits === null && <span className="text-body-sm text-text-muted">…</span>}
              {hits?.map((p) => (
                <Link key={p.id} to={path.product(locale, p.slug)} onClick={close} className="flex items-center gap-3 rounded-md p-1 hover:bg-bg-alt">
                  {p.media
                    ? <img src={mediaUrl(p.media.publicId, 160)} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-14 shrink-0 rounded-sm bg-bg-alt object-cover" />
                    : <span className="size-14 shrink-0 rounded-sm bg-bg-alt" aria-hidden="true" />}
                  <span className="flex flex-col"><span className="text-body-sm font-semibold text-text-primary">{p.name}</span><span className="text-body-sm text-text-body">{formatRange(p.priceMinMinor, p.priceMaxMinor, locale)}</span></span>
                </Link>
              ))}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
