import { type ReactNode, useEffect, useRef, useState } from 'react';
import { MascotScene } from '@/features/mascot/MascotScene';
import { Form, Link, useNavigation, useSearchParams } from 'react-router';
import type { Locale, ProductListResponse } from '@vivcharyk/schemas';
import { t, type MessageKey } from '@/lib/i18n';
import { formatUah } from '@/lib/money';
import { ProductCard } from './ProductCard';
import { useSwipeClose } from '@/lib/motion';

// Round 10 part 3 #21: popular, new, cheapest, most expensive, discounted.
const SORTS = ['popularity', 'newest', 'price_asc', 'price_desc', 'discount'] as const;

/**
 * Filter panel and product grid, shared by category pages and search results (round 10 part 3
 * #23: search results look and filter like a category).
 */
export function Listing({ data, locale, before, hidden = {}, countBase = {}, sorts = SORTS, defaultSort = 'popularity', empty }: {
  data: ProductListResponse; locale: Locale; before?: ReactNode; hidden?: Record<string, string>;
  /** API parameters that are not form fields (the category of a category page), for the live count. */
  countBase?: Record<string, string>;
  sorts?: readonly string[]; defaultSort?: string; empty?: ReactNode;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false); // phone filter sheet (round 10 part 3 #6, round 11 #25)
  const swipe = useSwipeClose<HTMLFormElement>('down', () => setOpen(false));
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => { setCount(null); setOpen(false); }, [data]);
  // Round 10 part 3 #7: the apply button carries the live result count.
  const recount = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onChange = () => {
    clearTimeout(recount.current);
    recount.current = setTimeout(() => {
      if (!form.current) return;
      const q = new URLSearchParams({ locale, perPage: '1', ...countBase });
      const multi = new Map<string, string[]>();
      for (const [k, v] of new FormData(form.current)) {
        if (!String(v)) continue;
        if (k.startsWith('filter[')) multi.set(k, [...(multi.get(k) ?? []), String(v)]);
        else if (k !== 'sort' && k !== 'page') q.set(k, String(v));
      }
      for (const [k, v] of multi) q.set(k, v.join(','));
      if (q.get('priceMin')) q.set('priceMin', String(Number(q.get('priceMin')) * 100));
      if (q.get('priceMax')) q.set('priceMax', String(Number(q.get('priceMax')) * 100));
      fetch(`/api/v1/products?${q}`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setCount(d.page.total)).catch(() => undefined);
    }, 250);
  };
  const shown = count ?? data.page.total ?? data.items.length;
  const activeCount = data.appliedFilters.length + (data.facets.find((f) => f.key === 'origin')?.values.some((v) => v.selected) ? 1 : 0);
  const [params] = useSearchParams();
  const selected = (key: string) => (params.get(`filter[${key}]`) ?? '').split(',').concat(params.getAll(`filter[${key}]`));
  const nextPage = new URLSearchParams(params);
  nextPage.set('page', String(data.page.number + 1));
  const reset = new URLSearchParams(hidden).toString();

  // «Показати ще» appends the next page under the cards already shown (round 10 part 3 #3; the
  // ?page= URL stays real for Google). Filters or sort replace the list.
  const base = (() => { const b = new URLSearchParams(params); b.delete('page'); return b.toString(); })();
  const acc = useRef<{ base: string; page: number; items: typeof data.items; firstNew: number }>({ base, page: data.page.number, items: data.items, firstNew: -1 });
  if (acc.current.base !== base || data.page.number !== acc.current.page) {
    const more = acc.current.base === base && data.page.number === acc.current.page + 1;
    acc.current = more
      ? { base, page: data.page.number, items: [...acc.current.items, ...data.items.filter((i) => !acc.current.items.some((x) => x.id === i.id))], firstNew: acc.current.items.length }
      : { base, page: data.page.number, items: data.items, firstNew: 0 };
  }
  const { items, firstNew } = acc.current;
  // Round 11 #23: focus moves to the first new card for keyboard users; the page does not jump.
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (firstNew > 0) grid.current?.querySelectorAll<HTMLAnchorElement>(':scope > div > div > a')[firstNew]?.focus({ preventScroll: true });
  }, [firstNew, items.length]);
  // Round 11 #21 / A14: while the next list loads, the old one fades; after 400 ms a thread runs above it.
  const loading = useNavigation().state === 'loading';
  const [slow, setSlow] = useState(false);
  useEffect(() => { if (!loading) { setSlow(false); return; } const h = setTimeout(() => setSlow(true), 400); return () => clearTimeout(h); }, [loading]);

  return (
    <div className="grid gap-8 lg:grid-cols-[16.25rem_1fr]">
      <Form key={params.toString()} ref={(el) => { form.current = el; swipe.current = el; }} method="get" onChange={onChange} onSubmit={(e) => { for (const el of e.currentTarget.querySelectorAll<HTMLInputElement>('input[name^=price]')) if (!el.value) el.disabled = true; setOpen(false); }} aria-label={t(locale, 'catalog.filters')}
        className={`flex flex-col gap-6 ${open ? 'vk-sheet max-lg:fixed max-lg:inset-0 max-lg:z-(--z-modal) max-lg:overflow-y-auto max-lg:bg-bg-page max-lg:p-4 max-lg:pb-28' : 'max-lg:hidden'}`}>
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="text-h3 text-text-primary">{t(locale, 'catalog.filters')}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Закрити" className="text-h2 leading-none text-text-muted">×</button>
        </div>
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        {before}
        {data.facets.filter((f) => f.values.length > 0).map((f) =>
          f.key === 'origin' ? (
            <fieldset key={f.key} className="flex flex-col gap-2">
              <legend className="mb-2 text-body font-semibold text-text-primary">{f.label}</legend>
              {f.values.map((v) => (
                <label key={v.key} className="flex items-center gap-2 text-body">
                  <input type="radio" name="origin" value={v.key} defaultChecked={v.selected} className="size-4" /> {v.label} ({v.count})
                </label>
              ))}
            </fieldset>
          ) : (
            <fieldset key={f.key} className="flex flex-col gap-2">
              <legend className="mb-2 text-body font-semibold text-text-primary">{f.label}</legend>
              {f.values.map((v) => (
                <label key={v.key} className="flex items-center gap-2 text-body">
                  <input type="checkbox" name={`filter[${f.key}]`} value={v.key} defaultChecked={selected(f.key).includes(v.key)} className="size-4" />
                  {v.hex && <span className="size-4 rounded-full border border-border-control" style={{ background: v.hex }} aria-hidden="true" />}
                  {v.label} ({v.count})
                </label>
              ))}
            </fieldset>
          ),
        )}
        {data.priceRange && <PriceFilter min={Math.floor(data.priceRange.minMinor / 100)} max={Math.ceil(data.priceRange.maxMinor / 100)} from={params.get('priceMin') ?? ''} to={params.get('priceMax') ?? ''} locale={locale} />}
        <label className="flex items-center gap-2 text-body"><input type="checkbox" name="inStock" value="true" defaultChecked={params.get('inStock') === 'true'} className="size-4" /> {t(locale, 'catalog.inStockOnly')}</label>
        <label className="flex flex-col gap-1 text-body">
          {t(locale, 'catalog.sort')}
          <select name="sort" defaultValue={params.get('sort') ?? defaultSort} className="rounded-sm border border-border-control bg-bg-surface px-2 py-1.5">
            {sorts.map((s) => <option key={s} value={s}>{t(locale, `catalog.sort.${s}` as MessageKey)}</option>)}
          </select>
        </label>
        <div className="flex gap-2 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:border-t max-lg:border-border-hairline max-lg:bg-bg-page max-lg:p-4">
          <button type="submit" className="flex-1 rounded-md bg-bg-inverted px-4 py-2.5 text-body font-semibold text-text-on-inverted"><span key={shown} className="vk-roll inline-block">{t(locale, 'catalog.show', { n: shown })}</span></button>
          {data.appliedFilters.length > 0 && <Link to={reset ? `?${reset}` : '.'} className="rounded-md border border-border-control px-3 py-2.5 text-body">{t(locale, 'catalog.resetAll')}</Link>}
        </div>
      </Form>

      <section className="flex flex-col gap-8">
        {/* Round 10 part 3 #11: active-filter chips + «Скинути все». */}
        {data.appliedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {data.appliedFilters.map((a) => {
              const p = new URLSearchParams(params);
              const key = `filter[${a.key}]`;
              const rest = selected(a.key).filter((v) => v && v !== a.value);
              p.delete(key); p.delete('page');
              if (rest.length) p.set(key, rest.join(','));
              return <Link key={`${a.key}:${a.value}`} to={`?${p}`} preventScrollReset className="rounded-full border border-border-control bg-bg-surface px-3 py-1 text-body-sm text-text-primary">{a.label} ×</Link>;
            })}
            <Link to={reset ? `?${reset}` : '.'} className="text-body-sm text-text-primary underline">{t(locale, 'catalog.resetAll')}</Link>
          </div>
        )}
        {slow && <div className="vk-thread-bar h-1.5 w-full" role="progressbar" aria-label="Завантаження" />}
        {items.length === 0 ? (
          (empty ?? (
            <div className="flex flex-col items-start gap-3">
              {/* Round 10 part 3 #22: mascot + «Скинути фільтри». */}
              <MascotScene kind="search" className="w-72 max-w-full" />
              <p className="text-body text-text-muted">{t(locale, 'catalog.empty')}</p>
              <Link to={reset ? `?${reset}` : '.'} className="rounded-md border border-border-control px-4 py-2 text-body text-text-primary">Скинути фільтри</Link>
            </div>
          ))
        ) : (
          <div ref={grid} className={`grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4 ${loading ? 'vk-fade-out' : ''}`}>
            {items.map((item, i) => (
              // New cards rise in sequence (60 ms stagger, capped at six).
              <div key={item.id} className={i >= firstNew ? 'vk-rise' : ''} style={{ '--i': Math.min(Math.max(0, i - firstNew), 6) } as React.CSSProperties}>
                <ProductCard item={item} locale={locale} />
              </div>
            ))}
          </div>
        )}
        {data.page.hasMore && (
          <Link to={`?${nextPage}`} preventScrollReset className="self-center rounded-md border border-border-control px-6 py-3 text-body font-semibold text-text-primary">{t(locale, 'catalog.showMore')}</Link>
        )}
      </section>
      {/* Phones: «Фільтри» pinned to the bottom of the screen, above the bottom bar. */}
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="fixed bottom-20 left-1/2 z-(--z-sticky) -translate-x-1/2 rounded-full bg-bg-inverted px-5 py-3 text-body font-semibold text-text-on-inverted shadow-lg lg:hidden">
          {t(locale, 'catalog.filters')}{activeCount ? ` · ${activeCount}` : ''}
        </button>
      )}
    </div>
  );
}

/**
 * Round 10 part 3 #9: a two-thumb slider and from–to fields, kept in step. The named fields carry
 * the value (hryvnias); the sliders are unnamed controls.
 */
function PriceFilter({ min, max, from, to, locale }: { min: number; max: number; from: string; to: string; locale: Locale }) {
  const [lo, setLo] = useState(from);
  const [hi, setHi] = useState(to);
  const step = max - min > 5000 ? 100 : 10;
  const loN = lo === '' ? min : Math.max(min, Math.min(Number(lo) || min, max));
  const hiN = hi === '' ? max : Math.max(min, Math.min(Number(hi) || max, max));
  const pct = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100);
  const thumb = 'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-inverted [&::-webkit-slider-thumb]:bg-bg-surface [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg-inverted [&::-moz-range-thumb]:bg-bg-surface';
  const field = 'w-full rounded-sm border border-border-control bg-bg-surface px-2 py-1.5 text-body';
  // Changing a slider must reach the form's onChange (live count), so a real input event is fired on the field.
  const push = (el: HTMLInputElement | null) => el?.dispatchEvent(new Event('change', { bubbles: true }));
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-body font-semibold text-text-primary">Ціна, ₴</legend>
      {max > min && (
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-border-control" />
          <div className="absolute top-2.5 h-1 rounded-full bg-bg-inverted" style={{ left: `${pct(loN)}%`, right: `${100 - pct(hiN)}%` }} />
          <input type="range" min={min} max={max} step={step} value={loN} aria-label="Ціна від" className={thumb}
            onChange={(e) => { const v = Math.min(Number(e.target.value), hiN - step); setLo(v <= min ? '' : String(v)); requestAnimationFrame(() => push(e.target.closest('fieldset')?.querySelector('input[name=priceMin]') ?? null)); }} />
          <input type="range" min={min} max={max} step={step} value={hiN} aria-label="Ціна до" className={thumb}
            onChange={(e) => { const v = Math.max(Number(e.target.value), loN + step); setHi(v >= max ? '' : String(v)); requestAnimationFrame(() => push(e.target.closest('fieldset')?.querySelector('input[name=priceMax]') ?? null)); }} />
        </div>
      )}
      <div className="flex gap-2">
        <input name="priceMin" inputMode="numeric" value={lo} onChange={(e) => setLo(e.target.value.replace(/\D/g, ''))} placeholder={formatUah(min * 100, locale)} aria-label="Від" className={field} />
        <input name="priceMax" inputMode="numeric" value={hi} onChange={(e) => setHi(e.target.value.replace(/\D/g, ''))} placeholder={formatUah(max * 100, locale)} aria-label="До" className={field} />
      </div>
    </fieldset>
  );
}
