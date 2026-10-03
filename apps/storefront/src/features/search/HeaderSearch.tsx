import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { t } from '@/lib/i18n';
import { formatRange } from '@/lib/money';
import { path } from '@/lib/segments';
import { mediaUrl } from '@/lib/media';

interface Suggest {
  products: Array<{ slug: string; name: string; priceMinMinor: number; priceMaxMinor: number; media: { publicId: string } | null }>;
  total: number;
}

/** Round 11 #26: the field expands from the header icon; round 10 #11: suggestions are products with photo and price only. */
export function HeaderSearch({ locale, icon, label }: { locale: Locale; icon: React.ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Suggest | null>(null);
  const navigate = useNavigate();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRes(null); return; }
    const ctl = new AbortController();
    const h = setTimeout(() => {
      fetch(`/api/v1/search/suggest?locale=${locale}&q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : null)).then((d) => d && setRes(d as Suggest)).catch(() => undefined);
    }, 200);
    return () => { clearTimeout(h); ctl.abort(); };
  }, [q, locale]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const close = () => { setOpen(false); setQ(''); setRes(null); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    navigate(`${path.seg(locale, 'search')}?q=${encodeURIComponent(q.trim())}`);
    close();
  };

  return (
    <div ref={box}>
      <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center">{icon}</button>
      {open && (
        <div className="vk-drop absolute inset-x-0 top-full z-(--z-dropdown) border-b border-border-hairline bg-bg-page shadow-lg">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
            <form role="search" onSubmit={submit} className="flex gap-2">
              <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} placeholder={t(locale, 'search.placeholder')} aria-label={label}
                className="w-full rounded-lg border border-border-control bg-bg-surface px-4 py-3 text-body-lg text-text-primary" />
              <button type="submit" className="rounded-lg bg-bg-inverted px-5 text-body font-semibold text-text-on-inverted">{t(locale, 'search.submit')}</button>
            </form>
            {res && (
              <div className="flex flex-col gap-1" aria-live="polite">
                {res.products.map((p) => (
                  <Link key={p.slug} to={path.product(locale, p.slug)} onClick={close} className="flex justify-between gap-3 rounded-md px-2 py-1.5 text-body text-text-primary hover:bg-bg-alt">
                    <span className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-sm bg-bg-alt">{p.media && <img src={mediaUrl(p.media.publicId, 160)} alt="" className="size-full object-cover" />}</span>{p.name}</span><span className="shrink-0 text-text-muted">{formatRange(p.priceMinMinor, p.priceMaxMinor, locale)}</span>
                  </Link>
                ))}
                {res.total === 0 && <p className="px-2 text-body text-text-muted">{t(locale, 'search.nothing')}</p>}
                {res.total > res.products.length && (
                  <button type="button" onClick={submit as never} className="self-start px-2 py-1.5 text-body text-text-primary underline">{t(locale, 'search.all', { n: res.total })}</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
