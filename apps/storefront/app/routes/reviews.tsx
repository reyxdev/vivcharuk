import { useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS, isPlaceholder } from '@vivcharyk/schemas';
import type { Route } from './+types/reviews';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';

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

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const source = ['site', 'prom'].includes(url.searchParams.get('source') ?? '') ? url.searchParams.get('source')! : 'all';
  const page = Math.min(5, Math.max(1, Number(url.searchParams.get('page')) || 1));
  // «Показати ще» widens the window instead of paging, so earlier cards stay on screen.
  const { data } = await apiGet<ReviewsResponse>('/reviews', locale, { source, perPage: String(PER_PAGE * page) });
  return { locale, source, pageN: page, summary: data.summary, items: data.items, info: data.page };
}

export function meta() {
  const title = `Відгуки — ${BUSINESS.brand}`;
  return [{ title }, { name: 'description', content: 'Відгуки покупців Вівчарика: на сайті та перенесені з нашого магазину на Prom.ua.' }, { property: 'og:title', content: title }];
}

function Stars({ n, size = 'text-body' }: { n: number; size?: string }) {
  return <span className={`${size} tracking-wider text-accent`} role="img" aria-label={`${n} з 5`}>{'★'.repeat(n)}<span className="text-border-control">{'★'.repeat(5 - n)}</span></span>;
}

const date = (iso: string) => new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

function Card({ r, locale }: { r: ReviewItem; locale: Locale }) {
  return (
    <article className="mb-4 flex break-inside-avoid flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars n={r.rating} />
        <span className="text-body font-semibold text-text-primary">{r.author}</span>
        <span className="text-caption text-text-muted">{date(r.date)}</span>
      </div>
      {r.source === 'PROM'
        ? <span className="self-start rounded-full border border-border-control px-2 py-0.5 text-caption text-text-muted">Prom.ua · перенесено</span>
        : r.isVerifiedPurchase && <span className="self-start rounded-full bg-bg-alt px-2 py-0.5 text-caption text-success">Підтверджена покупка</span>}
      {r.title && <h3 className="text-h4 text-text-primary">{r.title}</h3>}
      <p className="whitespace-pre-line text-body text-text-body">{r.body}</p>
      {r.product
        ? <Link to={path.product(locale, r.product.slug)} className="self-start text-body-sm text-text-primary underline">{r.product.name}</Link>
        : <span className="text-body-sm text-text-muted">Відгук про магазин</span>}
      {r.reply && (
        <div className="rounded-md bg-bg-alt p-3 text-body-sm text-text-body">
          <span className="block font-semibold text-text-primary">Відповідь Вівчарика</span>{r.reply}
        </div>
      )}
    </article>
  );
}

function ReviewForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [rating, setRating] = useState(0);
  const [err, setErr] = useState('');
  const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2.5 text-body text-text-primary';

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!rating) { setErr('Оберіть оцінку.'); return; }
    setState('sending'); setErr('');
    const res = await fetch('/api/v1/reviews', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: f.get('name'), email: f.get('email'), body: f.get('body'), rating, website: f.get('website') || undefined }),
    }).catch(() => null);
    if (res && res.status === 202) setState('sent');
    else { setState('error'); setErr(res?.status === 429 ? 'Забагато спроб. Спробуйте пізніше.' : 'Перевірте поля: ім’я, email і текст щонайменше з 10 символів.'); }
  };

  if (state === 'sent') return <p role="status" className="rounded-xl border border-success bg-bg-surface p-5 text-body text-text-primary">Дякуємо! Відгук з’явиться на сайті після перевірки.</p>;
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5" noValidate>
      <h2 className="text-h3 text-text-primary">Залишити відгук</h2>
      <fieldset className="flex items-center gap-1">
        <legend className="mb-1 text-body-sm text-text-muted">Оцінка</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} з 5`} aria-pressed={rating === n} onClick={() => setRating(n)} className={`text-h3 ${n <= rating ? 'text-accent' : 'text-border-control'}`}>★</button>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">Ім’я<input name="name" required minLength={2} maxLength={60} autoComplete="given-name" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">Email (не публікується)<input name="email" type="email" required autoComplete="email" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-body-sm text-text-muted">Відгук<textarea name="body" required minLength={10} maxLength={3000} rows={5} className={input} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {err && <p role="alert" className="text-body-sm text-danger">{err}</p>}
      <button type="submit" disabled={state === 'sending'} aria-busy={state === 'sending'} className={`self-start rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted disabled:opacity-50 ${state === 'sending' ? 'vk-busy disabled:opacity-100' : ''}`}>{state === 'sending' ? 'Зачекайте…' : 'Надіслати'}</button>
      <p className="text-caption text-text-muted">Усі відгуки перевіряємо перед публікацією. Показуємо ім’я та першу літеру прізвища.</p>
    </form>
  );
}

export default function Reviews() {
  const { locale, source, pageN: page, summary, items, info } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const max = Math.max(1, ...summary.distribution.map((d) => d.count));
  const google = !isPlaceholder(BUSINESS.googleProfileUrl);
  const filter = (s: string) => { const p = new URLSearchParams(params); if (s === 'all') p.delete('source'); else p.set('source', s); p.delete('page'); return `?${p}`; };
  const more = () => { const p = new URLSearchParams(params); p.set('page', String(page + 1)); return `?${p}`; };

  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 px-4 py-(--section-y-sm) lg:px-12">
      <h1 className="text-h1 text-text-primary">Відгуки</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-label="Оцінка на сайті" className="flex flex-wrap items-center gap-6 rounded-xl border border-border-hairline bg-bg-surface p-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-display-md text-text-primary">{summary.average?.toLocaleString('uk-UA') ?? '—'}</span>
            {summary.average && <Stars n={Math.round(summary.average)} />}
            <span className="text-caption text-text-muted">{summary.count} на сайті</span>
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
        <section aria-label="Ми в Google" className="flex flex-col justify-center gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5">
          <h2 className="text-h4 text-text-primary">Ми в Google</h2>
          <div className="flex flex-wrap gap-2">
            {google ? (
              <>
                <a href={BUSINESS.googleReviewUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-bg-inverted px-4 py-2.5 text-body-sm font-semibold text-text-on-inverted">Оцінити в Google</a>
                <a href={BUSINESS.googleProfileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-border-control px-4 py-2.5 text-body-sm font-semibold text-text-primary">Читати в Google</a>
              </>
            ) : <span className="text-body-sm text-text-muted">{BUSINESS.googleProfileUrl}</span>}
          </div>
        </section>
      </div>

      <nav aria-label="Фільтр відгуків" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {([['all', 'Усі'], ['site', 'На сайті'], ['prom', 'З Prom.ua']] as const).filter(([k]) => k !== 'prom' || summary.promCount > 0).map(([k, label]) => (
          <Link key={k} to={filter(k)} preventScrollReset aria-current={source === k ? 'true' : undefined}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-body-sm ${source === k ? 'border-accent bg-bg-raised font-semibold text-text-primary' : 'border-border-control text-text-body'}`}>{label}</Link>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          {items.length === 0 && <p className="text-body text-text-muted">Відгуків тут поки немає. Будьте першими.</p>}
          <div className="columns-1 gap-4 md:columns-2">
            {items.map((r) => <Card key={r.id} r={r} locale={locale} />)}
          </div>
          {info.hasMore && page < 5 && <Link to={more()} preventScrollReset className="mt-2 inline-block rounded-lg border border-border-control px-6 py-3 text-body font-semibold text-text-primary">Показати ще</Link>}
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <ReviewForm />
        </aside>
      </div>

      {/* Round 13 N2: the filtered import is disclosed, which keeps it lawful and credible. */}
      {summary.promCount > 0 && <p className="text-body-sm text-text-muted">Відгуки з позначкою «Prom.ua · перенесено» — з нашого магазину на Prom.ua, перенесені з оцінками від 3 до 5 зірок.</p>}
    </div>
  );
}
