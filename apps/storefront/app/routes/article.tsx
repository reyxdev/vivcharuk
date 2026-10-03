import { regionName } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import type { Locale, PostBody } from '@vivcharyk/schemas';
import type { Route } from './+types/article';
import { apiGet, ApiError, redirectOr404 } from '@/lib/api.server';
import { formatRange } from '@/lib/money';
import { mediaUrl } from '@/lib/media';
import { ResponsiveImage } from '@/lib/ResponsiveImage';
import { path } from '@/lib/segments';
import { brandOf, localeOf, originOf, pageMeta } from '@/lib/seo';
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

export function meta({ data, matches }: Route.MetaArgs) {
  if (!data) return [];
  const cover = data.a.photos[0];
  const locale = localeOf(matches);
  return pageMeta({
    title: data.a.metaTitle ?? `${data.a.title} — ${brandOf(locale)}`, description: data.a.metaDescription ?? data.a.excerpt, origin: originOf(matches), type: 'article', locale,
    image: cover ? { url: mediaUrl(cover.publicId, 1200), alt: data.a.title } : null,
  });
}

// G070, G136: articles are signed by the workshop, not by one person.
const AUTHOR = 'Майстри Вівчарика';
const AUTHOR_EN = 'The Vivcharyk makers';

// Round 24 G093: the article's frame in English; the article text comes from the API.
const COPY = {
  uk: { own: 'Власне виробництво', picked: 'Відібрано Вівчариком', byCraftsman: 'Виготовлено карпатським майстром', byOther: 'Виготовлено іншим виробником', out: 'Немає в наявності', gone: 'Більше не продається', view: 'Подивитись',
    share: 'Поділитися:', send: 'Надіслати…', copied: 'Скопійовано', copy: 'Копіювати посилання', home: 'Головна', journal: 'Журнал', brief: 'Коротко', products: 'Товари зі статті', read: (n: number) => `${n} хв читання` },
  en: { own: 'Made in our workshop', picked: 'Selected by Vivcharyk', byCraftsman: 'Made by a Carpathian craftsman', byOther: 'Made by another maker', out: 'Out of stock', gone: 'No longer sold', view: 'View',
    share: 'Share:', send: 'Send…', copied: 'Copied', copy: 'Copy link', home: 'Home', journal: 'Journal', brief: 'In brief', products: 'Products in this article', read: (n: number) => `${n} min read` },
};
const copyOf = (l: Locale) => COPY[l === 'en' ? 'en' : 'uk'];

const CALLOUT: Record<string, string> = { note: 'border-info', warning: 'border-warning', tip: 'border-success' };

/** 22 §22.8: live price and stock, the origin label on every embed, partnerName never. */
function ProductEmbed({ p, locale }: { p: Embed | undefined; locale: Locale }) {
  if (!p) return null;
  const c = copyOf(locale);
  const origin = p.origin === 'OWN_MANUFACTURE' ? c.own : `${c.picked} · ${p.partnerRegion ? `${c.byCraftsman}, ${regionName(p.partnerRegion, locale)}` : c.byOther}`;
  return (
    <aside className="not-prose my-2 flex items-center gap-4 rounded-xl border border-border-hairline bg-bg-surface p-4">
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-body font-semibold text-text-primary">{p.name}</span>
        <span className="text-caption text-text-muted">{origin}</span>
        <span className="text-body text-text-primary">{p.live ? (p.inStock ? formatRange(p.priceMinMinor, p.priceMaxMinor, locale) : c.out) : c.gone}</span>
      </span>
      {p.live && <Link to={path.product(locale, p.slug)} className="shrink-0 rounded-lg border-2 border-text-primary px-4 py-2 text-body-sm font-semibold text-text-primary">{c.view} <span className="vk-arrow" aria-hidden="true">→</span></Link>}
    </aside>
  );
}

/** D37: a photo from «Фото й відео», as wide as the text; its frame keeps the ratio, so nothing jumps. */
function Figure({ p, alt, caption }: { p: Photo | undefined; alt: string; caption: string | null }) {
  if (!p) return null;
  return (
    <figure className="flex flex-col gap-2">
      <ResponsiveImage publicId={p.publicId} sizes="(min-width: 800px) 768px, 100vw" width={p.width} height={p.height}
        loading="lazy" decoding="async" alt={alt} className="h-auto w-full rounded-xl bg-bg-alt" />
      {caption && <figcaption className="text-body-sm text-text-muted">{caption}</figcaption>}
    </figure>
  );
}

// Round 10 part 7 #15: under an article, only the products it mentions and sharing.
function Share({ url, title, locale }: { url: string; title: string; locale: Locale }) {
  const c = copyOf(locale);
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => setNative(typeof navigator !== 'undefined' && !!navigator.share), []);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const btn = 'rounded-lg border border-border-control px-4 py-2 text-body-sm font-semibold text-text-primary';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-text-muted">{c.share}</span>
      {native && <button type="button" onClick={() => void navigator.share({ title, url }).catch(() => undefined)} className={btn}>{c.send}</button>}
      <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className={btn}>Telegram</a>
      <a href={`viber://forward?text=${t}%20${u}`} className={btn}>Viber</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" className={btn}>Facebook</a>
      <button type="button" onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true))} className={btn}>{copied ? c.copied : c.copy}</button>
    </div>
  );
}

export default function ArticlePage() {
  const { locale, a } = useLoaderData<typeof loader>();
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const origin = layout?.origin ?? '';
  const l = locale as Locale;
  const c = copyOf(l);
  const author = l === 'en' ? AUTHOR_EN : AUTHOR;
  const url = `${origin}${path.seg(l, 'journal')}/${a.slug}`;
  const faq = a.body.blocks.flatMap((b) => (b.type === 'faq' ? b.items : []));
  const mentioned = a.body.blocks.flatMap((b) => (b.type === 'productEmbed' ? [b.productId] : []));
  const images = a.body.blocks.flatMap((b) => { const p = b.type === 'figure' ? a.photos.find((x) => x.id === b.mediaId) : undefined; const u = p && mediaUrl(p.publicId, 1600); return u ? [u.startsWith('/') ? origin + u : u] : []; });
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', '@id': `${url}#article`, headline: a.title, description: a.excerpt, datePublished: a.publishedAt, dateModified: a.updatedAt, inLanguage: l, mainEntityOfPage: url, ...(images.length ? { image: images } : {}), author: { '@type': 'Organization', name: author, url: `${origin}/` }, publisher: { '@id': `${origin}/#organization` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: c.home, item: `${origin}${path.home(l)}` }, { '@type': 'ListItem', position: 2, name: c.journal, item: `${origin}${path.seg(l, 'journal')}` }, { '@type': 'ListItem', position: 3, name: a.title, item: url }] },
      ...(faq.length ? [{ '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
    ],
  };

  return (
    <article className="mx-auto flex max-w-[48rem] flex-col gap-5 px-4 py-(--section-y-sm)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav aria-label="breadcrumb" className="text-body-sm text-text-muted"><Link to={path.home(l)} className="hover:underline">{c.home}</Link> › <Link to={path.seg(l, 'journal')} className="hover:underline">{c.journal}</Link></nav>
      {a.tags[0] && <span className="text-overline uppercase text-text-muted">{a.tags[0]}</span>}
      <h1 className="text-display-md text-text-primary">{a.title}</h1>
      <p className="text-caption text-text-muted">{author} · {new Date(a.publishedAt).toLocaleDateString(l === 'en' ? 'en-GB' : 'uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}{a.readMinutes ? ` · ${c.read(a.readMinutes)}` : ''}</p>
      <div className="flex flex-col gap-5 text-body-lg text-text-body">
        {a.body.blocks.map((b, i) => {
          switch (b.type) {
            case 'keyFacts': return <section key={i} aria-label={c.brief} className="rounded-xl border border-border-hairline bg-bg-surface p-5"><p className="mb-2 text-overline uppercase text-text-muted">{c.brief}</p><ul className="flex list-disc flex-col gap-1.5 pl-5">{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</ul></section>;
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
            <h2 className="text-h3 text-text-primary">{c.products}</h2>
            {[...new Set(mentioned)].map((id) => <ProductEmbed key={id} p={a.products.find((p) => p.id === id)} locale={l} />)}
          </section>
        )}
        <Share url={url} title={a.title} locale={l} />
      </div>
    </article>
  );
}
