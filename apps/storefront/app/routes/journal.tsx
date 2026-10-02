import { Link, useLoaderData, useSearchParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import type { Route } from './+types/journal';
import { apiGet } from '@/lib/api.server';
import { path } from '@/lib/segments';

interface List { items: Array<{ slug: string; title: string; excerpt: string; publishedAt: string; readMinutes: number | null; tags: string[] }>; tags: Array<{ slug: string; name: string }>; page: { number: number; hasMore: boolean } }

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const tag = url.searchParams.get('tema') ?? undefined;
  const { data } = await apiGet<List>('/posts', locale, { tag, page: url.searchParams.get('page') ?? undefined });
  return { locale, data, tag, seo: tag ? { robots: 'noindex,follow' } : {} };
}

export function meta() {
  return [{ title: `Журнал — ${BUSINESS.brand}` }, { name: 'description', content: 'Про догляд за вовною, ліжникарство, Яворів і як ми виробляємо — від Вівчарика.' }];
}

const date = (iso: string) => new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

// Round 10 part 7 #14: the index is a photo grid; not on the homepage.
export default function Journal() {
  const { locale, data, tag } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const base = path.seg(locale as Locale, 'journal');
  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-6 px-4 py-(--section-y-sm) lg:px-12">
      <h1 className="text-h1 text-text-primary">Журнал</h1>
      {data.tags.length > 0 && (
        <nav aria-label="Теми" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <Link to={base} className={`shrink-0 rounded-full border px-4 py-1.5 text-body-sm ${!tag ? 'border-accent bg-bg-raised font-semibold text-text-primary' : 'border-border-control text-text-body'}`}>Усі</Link>
          {data.tags.map((t) => <Link key={t.slug} to={`${base}?tema=${t.slug}`} className={`shrink-0 rounded-full border px-4 py-1.5 text-body-sm ${tag === t.slug ? 'border-accent bg-bg-raised font-semibold text-text-primary' : 'border-border-control text-text-body'}`}>{t.name}</Link>)}
        </nav>
      )}
      {data.items.length === 0 && <p className="text-body-lg text-text-muted">Статті ще пишуться.</p>}
      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((p) => (
          <Link key={p.slug} to={`${base}/${p.slug}`} className="group flex flex-col gap-3">
            <span className="grid aspect-[3/2] place-items-center rounded-lg bg-bg-alt text-caption text-text-muted">фото статті</span>
            {p.tags[0] && <span className="text-overline uppercase text-accent-text">{p.tags[0]}</span>}
            <span className="text-h3 text-text-primary group-hover:underline">{p.title}</span>
            <span className="text-body text-text-body">{p.excerpt}</span>
            <span className="text-caption text-text-muted">{date(p.publishedAt)}{p.readMinutes ? ` · ${p.readMinutes} хв читання` : ''}</span>
          </Link>
        ))}
      </div>
      {data.page.hasMore && <Link to={`?${new URLSearchParams({ ...Object.fromEntries(params), page: String(data.page.number + 1) })}`} className="self-center rounded-md border border-border-control px-6 py-3 text-body font-semibold text-text-primary">Показати ще</Link>}
    </div>
  );
}
