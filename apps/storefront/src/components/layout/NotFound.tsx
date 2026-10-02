import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { t } from '@/lib/i18n';
import { path } from '@/lib/segments';
import { MascotScene } from '@/features/mascot/MascotScene';

// Round 10 part 8 #16: the mascot plus «На головну» and the search field — a page with only a
// drawing leaves a lost visitor nowhere to go.
export function NotFound({ locale = 'uk' }: { locale?: Locale }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-12 text-center">
      {/* React 19 hoists these into <head>: the error page has no route meta of its own. */}
      <title>{`${t(locale, 'notFound.title')} — Вівчарик`}</title>
      <meta name="robots" content="noindex" />
      <MascotScene kind="search" className="w-80 max-w-full" />
      <h1 className="text-h1 text-text-primary">{t(locale, 'notFound.title')}</h1>
      <p className="text-body text-text-muted">Можливо, товар уже продано або адреса змінилася. Пошукайте:</p>
      <form action={path.seg(locale, 'search')} method="get" role="search" className="flex w-full gap-2">
        <input name="q" type="search" placeholder="Ліжник, плед, пряжа…" aria-label="Пошук" className="min-w-0 flex-1 rounded-lg border border-border-control bg-bg-input px-3 py-2.5 text-body text-text-primary" />
        <button type="submit" className="rounded-lg border border-border-control px-4 text-body text-text-primary">Знайти</button>
      </form>
      <Link to={path.home(locale)} className="rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted">{t(locale, 'notFound.home')}</Link>
    </div>
  );
}
