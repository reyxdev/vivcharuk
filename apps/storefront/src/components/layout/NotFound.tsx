import { Link } from 'react-router';
import type { CategoryNode, Locale } from '@vivcharyk/schemas';
import { t } from '@/lib/i18n';
import { brandOf } from '@/lib/seo';
import { path } from '@/lib/segments';
import { LazyMascotScene as MascotScene } from '@/features/mascot/LazyMascotScene';

// Round 10 part 8 #16: the mascot plus «На головну» and the search field — a page with only a
// drawing leaves a lost visitor nowhere to go. Round 24 G043: plus the categories that have products.
export function NotFound({ locale = 'uk', categories = [] }: { locale?: Locale; categories?: CategoryNode[] }) {
  // The most stocked categories, the narrowest first: a group is named only when none of its subcategories has products.
  const full = (c: CategoryNode) => (c.productCount ?? 0) > 0;
  const popular = categories
    .flatMap((c) => [{ c, to: path.category(locale, c.slug) }, ...c.children.map((ch) => ({ c: ch, to: path.category(locale, c.slug, ch.slug) }))])
    .filter(({ c }) => full(c) && !c.children.some(full))
    .sort((a, b) => b.c.productCount! - a.c.productCount!)
    .slice(0, 6)
    .map(({ c, to }) => ({ name: c.name, to }));
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-12 text-center">
      {/* React 19 hoists these into <head>: the error page has no route meta of its own. */}
      <title>{`${t(locale, 'notFound.title')} — ${brandOf(locale)}`}</title>
      <meta name="robots" content="noindex" />
      <MascotScene kind="search" className="w-80 max-w-full" />
      <h1 className="text-h1 text-text-primary">{t(locale, 'notFound.title')}</h1>
      <p className="text-body text-text-muted">{t(locale, 'notFound.text')}</p>
      <form action={path.seg(locale, 'search')} method="get" role="search" className="flex w-full gap-2">
        <input name="q" type="search" placeholder={t(locale, 'search.placeholderShort')} aria-label={t(locale, 'search.title')} className="min-w-0 flex-1 rounded-lg border border-border-control bg-bg-input px-3 py-2.5 text-body text-text-primary" />
        <button type="submit" className="rounded-lg border border-border-control px-4 text-body text-text-primary">{t(locale, 'search.submit')}</button>
      </form>
      <Link to={path.home(locale)} className="rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted">{t(locale, 'notFound.home')}</Link>
      {popular.length > 0 && (
        <nav aria-label={t(locale, 'notFound.popular')} className="flex w-full flex-col gap-2 pt-2">
          <h2 className="text-h4 text-text-primary">{t(locale, 'notFound.popular')}</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {popular.map((c) => <li key={c.to}><Link to={c.to} className="inline-flex min-h-11 items-center rounded-full border border-border-control px-4 text-body-sm text-text-primary hover:bg-bg-alt">{c.name}</Link></li>)}
          </ul>
        </nav>
      )}
    </div>
  );
}
