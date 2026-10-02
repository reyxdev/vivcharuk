import { useEffect, useState } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { Locale, PostBody } from '@vivcharyk/schemas';
import { BUSINESS } from '@vivcharyk/schemas';
import type { Route } from './+types/article';
import { apiGet, ApiError, redirectOr404 } from '@/lib/api.server';
import { formatRange } from '@/lib/money';
import { mediaSrcSet, mediaUrl } from '@/lib/media';
import { path } from '@/lib/segments';
import { Inline } from '@/features/blog/Inline';
import type { loader as layoutLoader } from './locale-layout';

interface Embed { id: string; live: boolean; slug: string; name: string; origin: string; partnerRegion: string | null; priceMinMinor: number; priceMaxMinor: number; inStock: boolean }
interface Photo { id: string; publicId: string; width: number; height: number }
interface Article { photos: Photo[]; slug: string; title: string; excerpt: string; metaTitle: string | null; metaDescription: string | null; body: PostBody; publishedAt: string; updatedAt: string; readMinutes: number | null; tags: string[]; products: Embed[] }

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = params.locale as Locale;
  try {
    const { data } = await apiGet<Article>(`/posts/${encodeURIComponent(params.slug)}`, locale);
    return { locale, a: data };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) await redirectOr404(request);
    throw e;
  }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [];
  return [{ title: data.a.metaTitle ?? `${data.a.title} — ${BUSINESS.brand}` }, { name: 'description', content: data.a.metaDescription ?? data.a.excerpt }, { property: 'og:type', content: 'article' }];
}

const CALLOUT: Record<string, string> = { note: 'border-info', warning: 'border-warning', tip: 'border-success' };

/** 22 §22.8: live price and stock, the origin label on every embed, partnerName never. */
function ProductEmbed({ p, locale }: { p: Embed | undefined; locale: Locale }) {
  if (!p) return null;
  const origin = p.origin === 'OWN_MANUFACTURE' ? 'Власне виробництво' : `Відібрано Вівчариком · ${p.partnerRegion ? `Виготовлено карпатським майстром, ${p.partnerRegion}` : 'Виготовлено іншим виробником'}`;
  return (
    <aside className="not-prose my-2 flex items-center gap-4 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <span className="grid size-20 shrink-0 place-items-center rounded-md bg-bg-alt text-caption text-text-muted" aria-hidden="true">фото</span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-body font-semibold text-text-primary">{p.name}</span>
        <span className="text-caption text-text-muted">{origin}</span>
        <span className="text-body text-text-primary">{p.live ? (p.inStock ? formatRange(p.priceMinMinor, p.priceMaxMinor, locale) : 'Немає в наявності') : 'Більше не продається'}</span>
      </span>
      {p.live && <Link to={path.product(locale, p.slug)} className="shrink-0 rounded-lg border-2 border-text-primary px-4 py-2 text-body-sm font-semibold text-text-primary">Подивитись <span className="vk-arrow" aria-hidden="true">→</span></Link>}
    </aside>
  );
}

/** D37: a photo from «Фото й відео», as wide as the text; its frame keeps the ratio, so nothing jumps. */
function Figure({ p, alt, caption }: { p: Photo | undefined; alt: string; caption: string | null }) {
  if (!p) return null;
  return (
    <figure className="flex flex-col gap-2">
      <img src={mediaUrl(p.publicId, 960)} srcSet={mediaSrcSet(p.publicId)} sizes="(min-width: 800px) 768px, 100vw" width={p.width} height={p.height}
        loading="lazy" decoding="async" alt={alt} className="h-auto w-full rounded-xl bg-bg-alt" />
      {caption && <figcaption className="text-body-sm text-text-muted">{caption}</figcaption>}
    </figure>
  );
}

// Round 10 part 7 #15: under an article, only the products it mentions and sharing.
function Share({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => setNative(typeof navigator !== 'undefined' && !!navigator.share), []);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const btn = 'rounded-lg border border-border-control px-4 py-2 text-body-sm font-semibold text-text-primary';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-text-muted">Поділитися:</span>
      {native && <button type="button" onClick={() => void navigator.share({ title, url }).catch(() => undefined)} className={btn}>Надіслати…</button>}
      <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className={btn}>Telegram</a>
      <a href={`viber://forward?text=${t}%20${u}`} className={btn}>Viber</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" className={btn}>Facebook</a>
      <button type="button" onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true))} className={btn}>{copied ? 'Скопійовано' : 'Копіювати посилання'}</button>
    </div>
  );
}

export default function ArticlePage() {
  const { locale, a } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const origin = layout?.origin ?? '';
  const l = locale as Locale;
  const url = `${origin}${path.seg(l, 'journal')}/${a.slug}`;
  const faq = a.body.blocks.flatMap((b) => (b.type === 'faq' ? b.items : []));
  const mentioned = a.body.blocks.flatMap((b) => (b.type === 'productEmbed' ? [b.productId] : []));
  const images = a.body.blocks.flatMap((b) => { const p = b.type === 'figure' ? a.photos.find((x) => x.id === b.mediaId) : undefined; const u = p && mediaUrl(p.publicId, 1600); return u ? [u.startsWith('/') ? origin + u : u] : []; });
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', '@id': `${url}#article`, headline: a.title, description: a.excerpt, datePublished: a.publishedAt, dateModified: a.updatedAt, inLanguage: l, mainEntityOfPage: url, ...(images.length ? { image: images } : {}), author: { '@type': 'Person', name: 'Іван' }, publisher: { '@id': `${origin}/#organization` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Журнал', item: `${origin}${path.seg(l, 'journal')}` }, { '@type': 'ListItem', position: 2, name: a.title, item: url }] },
      ...(faq.length ? [{ '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
    ],
  };

  return (
    <article className="mx-auto flex max-w-[48rem] flex-col gap-5 px-4 py-(--section-y-sm)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav aria-label="breadcrumb" className="text-body-sm text-text-muted"><Link to={path.seg(l, 'journal')} className="hover:underline">Журнал</Link>{a.tags[0] ? ` › ${a.tags[0]}` : ''}</nav>
      {a.tags[0] && <span className="text-overline uppercase text-text-muted">{a.tags[0]}</span>}
      <h1 className="text-display-md text-text-primary">{a.title}</h1>
      <p className="text-caption text-text-muted">Іван · {new Date(a.publishedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}{a.readMinutes ? ` · ${a.readMinutes} хв читання` : ''}</p>
      <div className="flex flex-col gap-5 text-body-lg text-text-body">
        {a.body.blocks.map((b, i) => {
          switch (b.type) {
            case 'keyFacts': return <section key={i} aria-label="Коротко" className="rounded-xl border border-border-hairline bg-bg-surface p-5"><p className="mb-2 text-overline uppercase text-text-muted">Коротко</p><ul className="flex list-disc flex-col gap-1.5 pl-5">{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ul></section>;
            case 'paragraph': return <p key={i}><Inline text={b.text} /></p>;
            case 'heading': return b.level === 2 ? <h2 key={i} className="mt-4 text-h2 text-text-primary">{b.text}</h2> : <h3 key={i} className="mt-2 text-h3 text-text-primary">{b.text}</h3>;
            case 'bulletList': return <ul key={i} className="flex list-disc flex-col gap-1.5 pl-6">{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ul>;
            case 'orderedList': return <ol key={i} className="flex list-decimal flex-col gap-1.5 pl-6">{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ol>;
            case 'blockquote': return <figure key={i} className="border-l-4 border-accent pl-5"><blockquote className="text-h4 text-text-primary"><Inline text={b.text} /></blockquote>{b.attribution && <figcaption className="mt-2 text-body-sm text-text-muted">— {b.attribution}</figcaption>}</figure>;
            case 'callout': return <div key={i} role="note" className={`rounded-lg border-l-4 bg-bg-surface p-4 ${CALLOUT[b.variant]}`}><Inline text={b.text} /></div>;
            case 'productEmbed': return <ProductEmbed key={i} p={a.products.find((p) => p.id === b.productId)} locale={l} />;
            case 'faq': return <section key={i} className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-hairline bg-bg-surface">{b.items.map((f, j) => <details key={j} className="group px-5 py-4"><summary className="flex cursor-pointer list-none justify-between gap-4 text-h4 text-text-primary">{f.q}<span aria-hidden="true" className="group-open:rotate-45">+</span></summary><p className="mt-3"><Inline text={f.a} /></p></details>)}</section>;
            case 'divider': return <hr key={i} className="border-border-hairline" />;
            case 'figure': return <Figure key={i} p={a.photos.find((p) => p.id === b.mediaId)} alt={b.alt} caption={b.caption} />;
            default: return null;
          }
        })}
      </div>
      <div className="mt-6 flex flex-col gap-5 border-t border-border-hairline pt-6">
        {mentioned.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-h3 text-text-primary">Товари зі статті</h2>
            {[...new Set(mentioned)].map((id) => <ProductEmbed key={id} p={a.products.find((p) => p.id === id)} locale={l} />)}
          </section>
        )}
        <Share url={url} title={a.title} />
      </div>
    </article>
  );
}
