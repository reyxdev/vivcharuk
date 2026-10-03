import { useEffect, useRef, useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import type { Locale, ProductDetail } from '@vivcharyk/schemas';
import { BUSINESS, isPlaceholder } from '@vivcharyk/schemas';
import type { Route } from './+types/reviews';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';
import { mediaUrl } from '@/lib/media';
import { localeOf, originOf, pageMeta, titled } from '@/lib/seo';

interface ReviewItem {
  id: string; author: string; rating: number; title: string | null; body: string; date: string; source: 'SITE' | 'PROM';
  isVerifiedPurchase: boolean; product: { name: string; slug: string } | null; reply: string | null;
}
interface ReviewsResponse {
  summary: { count: number; average: number | null; distribution: Array<{ star: number; count: number }>; promCount: number };
  items: ReviewItem[];
  page: { total: number; hasMore: boolean };
}

const PER_PAGE = 12;

/** The product a «Залиште відгук» letter asks about (`?product=<slug>`). */
interface AboutProduct { slug: string; name: string; photo: { publicId: string; alt: string } | null }

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const source = ['site', 'prom'].includes(url.searchParams.get('source') ?? '') ? url.searchParams.get('source')! : 'all';
  const page = Math.min(5, Math.max(1, Number(url.searchParams.get('page')) || 1));
  const slug = url.searchParams.get('product')?.trim().slice(0, 120);
  // «Показати ще» widens the window instead of paging, so earlier cards stay on screen.
  const [{ data }, about] = await Promise.all([
    apiGet<ReviewsResponse>('/reviews', locale, { source, perPage: String(PER_PAGE * page) }),
    slug ? apiGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`, locale).then(({ data: p }): AboutProduct => ({ slug: p.slug, name: p.name, photo: p.media ? { publicId: p.media.publicId, alt: p.media.alt } : null })).catch(() => null) : null,
  ]);
  return {
    locale, source, pageN: page, summary: data.summary, items: data.items, info: data.page, about,
    // The review-request link is a personal entry point, not a page of its own for search engines;
    // the page itself is indexed once it has reviews (G100).
    ...(slug || data.page.total === 0 ? { seo: { robots: 'noindex,follow' } } : {}),
  };
}

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  if (locale === 'en') return pageMeta({ title: titled('Customer reviews', locale), description: 'What Vivcharyk customers say about our lizhnyks and wool goods: reviews left on this site and imported from our shop on Prom.ua.', origin: originOf(matches), locale });
  return pageMeta({ title: titled('Відгуки покупців'), description: 'Відгуки покупців Вівчарика про ліжники та вовняні вироби: на сайті та перенесені з нашого магазину на Prom.ua.', origin: originOf(matches) });
}

// Round 24 G093: the interface in English; the reviews themselves stay as their authors wrote them.
const COPY = {
  uk: {
    of5: (n: number) => `${n} з 5`, prom: 'Prom.ua · перенесено', verified: 'Підтверджена покупка', aboutShop: 'Відгук про магазин', reply: 'Відповідь Вівчарика',
    pickRating: 'Оберіть оцінку.', gone: 'Цей товар уже не продається на сайті — напишіть відгук про магазин.', tooMany: 'Забагато спроб. Спробуйте пізніше.',
    check: 'Перевірте поля: ім’я, email і текст щонайменше з 10 символів.', thanks: 'Дякуємо! Відгук з’явиться на сайті після перевірки.', write: 'Залишити відгук',
    about: 'Відгук про:', aboutWhole: 'Написати про магазин загалом', rating: 'Оцінка', name: 'Ім’я', email: 'Email (не публікується)', body: 'Відгук',
    wait: 'Зачекайте…', send: 'Надіслати', note: 'Усі відгуки перевіряємо перед публікацією. Показуємо ім’я та першу літеру прізвища.',
    h1: 'Відгуки', siteRating: 'Оцінка на сайті', onSite: (n: number) => `${n} на сайті`, google: 'Ми в Google', rateGoogle: 'Оцінити в Google', readGoogle: 'Читати в Google',
    filter: 'Фільтр відгуків', all: 'Усі', site: 'На сайті', fromProm: 'З Prom.ua', none: 'Відгуків тут поки немає. Будьте першими.', more: 'Показати ще',
    promNote: 'Відгуки з позначкою «Prom.ua · перенесено» — з нашого магазину на Prom.ua, перенесені з оцінками від 3 до 5 зірок.',
  },
  en: {
    of5: (n: number) => `${n} out of 5`, prom: 'Prom.ua · imported', verified: 'Verified purchase', aboutShop: 'Review of the shop', reply: 'Vivcharyk’s reply',
    pickRating: 'Choose a rating.', gone: 'This product is no longer sold on the site — please write a review of the shop instead.', tooMany: 'Too many attempts. Please try again later.',
    check: 'Check the fields: name, email and a review of at least 10 characters.', thanks: 'Thank you! Your review will appear on the site once we have checked it.', write: 'Leave a review',
    about: 'Review of:', aboutWhole: 'Write about the shop in general', rating: 'Rating', name: 'Name', email: 'Email (not published)', body: 'Review',
    wait: 'Please wait…', send: 'Send', note: 'We check every review before publishing it. We show your first name and the first letter of your surname.',
    h1: 'Reviews', siteRating: 'Rating on this site', onSite: (n: number) => `${n} on this site`, google: 'We are on Google', rateGoogle: 'Rate us on Google', readGoogle: 'Read on Google',
    filter: 'Filter reviews', all: 'All', site: 'On this site', fromProm: 'From Prom.ua', none: 'There are no reviews here yet. Be the first.', more: 'Show more',
    promNote: 'Reviews marked «Prom.ua · imported» come from our shop on Prom.ua and were imported with ratings of 3 to 5 stars.',
  },
};
const copyOf = (l: Locale) => COPY[l === 'en' ? 'en' : 'uk'];

function Stars({ n, size = 'text-body', locale = 'uk' }: { n: number; size?: string; locale?: Locale }) {
  return <span className={`${size} tracking-wider text-accent`} role="img" aria-label={copyOf(locale).of5(n)}>{'★'.repeat(n)}<span className="text-border-control">{'★'.repeat(5 - n)}</span></span>;
}

const date = (iso: string, l: Locale) => new Date(iso).toLocaleDateString(l === 'en' ? 'en-GB' : 'uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

function Card({ r, locale }: { r: ReviewItem; locale: Locale }) {
  const c = copyOf(locale);
  return (
    <article className="mb-4 flex break-inside-avoid flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars n={r.rating} locale={locale} />
        <span className="text-body font-semibold text-text-primary">{r.author}</span>
        <span className="text-caption text-text-muted">{date(r.date, locale)}</span>
      </div>
      {r.source === 'PROM'
        ? <span className="self-start rounded-full border border-border-control px-2 py-0.5 text-caption text-text-muted">{c.prom}</span>
        : r.isVerifiedPurchase && <span className="self-start rounded-full bg-bg-alt px-2 py-0.5 text-caption text-success">{c.verified}</span>}
      {r.title && <h3 className="text-h4 text-text-primary">{r.title}</h3>}
      <p className="whitespace-pre-line text-body text-text-body">{r.body}</p>
      {r.product
        ? <Link to={path.product(locale, r.product.slug)} className="self-start text-body-sm text-text-primary underline">{r.product.name}</Link>
        : <span className="text-body-sm text-text-muted">{c.aboutShop}</span>}
      {r.reply && (
        <div className="rounded-md bg-bg-alt p-3 text-body-sm text-text-body">
          <span className="block font-semibold text-text-primary">{c.reply}</span>{r.reply}
        </div>
      )}
    </article>
  );
}

function ReviewForm({ about, locale }: { about: AboutProduct | null; locale: Locale }) {
  const c = copyOf(locale);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [rating, setRating] = useState(0);
  const [err, setErr] = useState('');
  const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2.5 text-body text-text-primary';
  const heading = useRef<HTMLHeadingElement>(null);
  // Arriving from the review-request letter: straight to the form, focus on its heading.
  useEffect(() => {
    if (!about) return;
    document.getElementById('napysaty')?.scrollIntoView({ block: 'start' });
    heading.current?.focus({ preventScroll: true });
  }, [about?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!rating) { setErr(c.pickRating); return; }
    setState('sending'); setErr('');
    const res = await fetch('/api/v1/reviews', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: f.get('name'), email: f.get('email'), body: f.get('body'), rating, productSlug: about?.slug, website: f.get('website') || undefined }),
    }).catch(() => null);
    if (res && res.status === 202) setState('sent');
    else if (res?.status === 422 && about && ((await res.json().catch(() => null)) as { error?: { fieldErrors?: Array<{ path: string }> } } | null)?.error?.fieldErrors?.some((x) => x.path === 'productSlug')) {
      setState('error'); setErr(c.gone);
    } else { setState('error'); setErr(res?.status === 429 ? c.tooMany : c.check); }
  };

  if (state === 'sent') return <p id="napysaty" role="status" className="scroll-mt-24 rounded-xl border border-success bg-bg-surface p-5 text-body text-text-primary">{c.thanks}</p>;
  return (
    <form id="napysaty" onSubmit={submit} className="flex scroll-mt-24 flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5" noValidate>
      <h2 ref={heading} tabIndex={-1} className="text-h3 text-text-primary outline-none">{c.write}</h2>
      {about && (
        <div className="flex items-center gap-3 rounded-lg bg-bg-alt p-3">
          {about.photo
            ? <img src={mediaUrl(about.photo.publicId, 160)} alt="" width={56} height={56} className="size-14 shrink-0 rounded-md object-cover" />
            : <span className="size-14 shrink-0 rounded-md bg-bg-surface" aria-hidden="true" />}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-body-sm text-text-muted">{c.about}</span>
            <span className="text-body font-semibold text-text-primary">{about.name}</span>
            <Link to="?" preventScrollReset className="self-start text-caption text-text-muted underline">{c.aboutWhole}</Link>
          </span>
        </div>
      )}
      <fieldset className="flex items-center gap-1">
        <legend className="mb-1 text-body-sm text-text-muted">{c.rating}</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={c.of5(n)} aria-pressed={rating === n} onClick={() => setRating(n)} className={`text-h3 ${n <= rating ? 'text-accent' : 'text-border-control'}`}>★</button>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">{c.name}<input name="name" required minLength={2} maxLength={60} autoComplete="given-name" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">{c.email}<input name="email" type="email" required autoComplete="email" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">{c.body}<textarea name="body" required minLength={10} maxLength={3000} rows={5} className={input} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
      <button type="submit" disabled={state === 'sending'} aria-busy={state === 'sending'} className={`self-start rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${state === 'sending' ? 'vk-busy disabled:opacity-100' : ''}`}>{state === 'sending' ? c.wait : c.send}</button>
      <p className="text-caption text-text-muted">{c.note}</p>
    </form>
  );
}

export default function Reviews() {
  const { locale, source, pageN: page, summary, items, info, about } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const max = Math.max(1, ...summary.distribution.map((d) => d.count));
  const google = !isPlaceholder(BUSINESS.googleProfileUrl);
  const filter = (s: string) => { const p = new URLSearchParams(params); if (s === 'all') p.delete('source'); else p.set('source', s); p.delete('page'); return `?${p}`; };
  const more = () => { const p = new URLSearchParams(params); p.set('page', String(page + 1)); return `?${p}`; };
  const c = copyOf(locale);

  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 py-(--section-y-sm) lg:px-12">
      <h1 className="text-h1 text-text-primary">{c.h1}</h1>

      <div className={`grid gap-4 ${google ? 'md:grid-cols-2' : ''}`}>
        <section aria-label={c.siteRating} className="flex flex-wrap items-center gap-6 rounded-xl border border-border-hairline bg-bg-surface p-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-display-md text-text-primary">{summary.average?.toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA') ?? '—'}</span>
            {summary.average && <Stars n={Math.round(summary.average)} locale={locale} />}
            <span className="text-caption text-text-muted">{c.onSite(summary.count)}</span>
          </div>
          <ul className="flex min-w-48 flex-1 flex-col gap-1">
            {summary.distribution.map((d) => (
              <li key={d.star} className="flex items-center gap-2 text-caption text-text-muted">
                <span className="w-3">{d.star}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg-alt"><span className="block h-full bg-accent" style={{ width: `${(d.count / max) * 100}%` }} /></span>
                <span className="w-6 text-right">{d.count}</span>
              </li>
            ))}
          </ul>
        </section>
        {/* G075: the Google block appears once the profile exists. */}
        {google && (
          <section aria-label={c.google} className="flex flex-col justify-center gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5">
            <h2 className="text-h4 text-text-primary">{c.google}</h2>
            <div className="flex flex-wrap gap-2">
              {!isPlaceholder(BUSINESS.googleReviewUrl) && <a href={BUSINESS.googleReviewUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-bg-inverted px-4 py-2.5 text-body-sm font-semibold text-text-on-inverted">{c.rateGoogle}</a>}
              <a href={BUSINESS.googleProfileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-border-control px-4 py-2.5 text-body-sm font-semibold text-text-primary">{c.readGoogle}</a>
            </div>
          </section>
        )}
      </div>

      <nav aria-label={c.filter} className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {([['all', c.all], ['site', c.site], ['prom', c.fromProm]] as const).filter(([k]) => k !== 'prom' || summary.promCount > 0).map(([k, label]) => (
          <Link key={k} to={filter(k)} preventScrollReset aria-current={source === k ? 'true' : undefined}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-body-sm ${source === k ? 'border-accent bg-bg-raised font-semibold text-text-primary' : 'border-border-control text-text-body'}`}>{label}</Link>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          {items.length === 0 && <p className="text-body text-text-muted">{c.none}</p>}
          <div className="columns-1 gap-4 md:columns-2">
            {items.map((r) => <Card key={r.id} r={r} locale={locale} />)}
          </div>
          {info.hasMore && page < 5 && <Link to={more()} preventScrollReset className="mt-2 inline-block rounded-lg border border-border-control px-6 py-3 text-body font-semibold text-text-primary">{c.more}</Link>}
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <ReviewForm key={about?.slug ?? ''} about={about} locale={locale} />
        </aside>
      </div>

      {/* Round 13 N2: the filtered import is disclosed, which keeps it lawful and credible. */}
      {summary.promCount > 0 && <p className="text-body-sm text-text-muted">{c.promNote}</p>}
    </div>
  );
}
