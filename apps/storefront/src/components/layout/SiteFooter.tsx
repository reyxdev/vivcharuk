import { Link, useRouteLoaderData } from 'react-router';
import type { CategoryNode, Locale } from '@vivcharyk/schemas';
import { contactLinks } from '@vivcharyk/schemas';
import { useBusiness } from '@/lib/business';
import { Messengers } from '@/components/contact/Messengers';
import { SpecialDayNote } from '@/components/contact/SpecialDayNote';
import { PaymentMarks } from './PaymentMarks';
import evening from './art/footer-evening.svg?url';
import { t, type MessageKey } from '@/lib/i18n';
import { path, type SegmentKey } from '@/lib/segments';

// Round 10 part 7 #23: information, contacts, messengers, payment icons and the mandatory legal
// row. Round 24 G191: plus a short column of the key categories (those with products) and guides.
export function SiteFooter({ locale }: { locale: Locale }) {
  const biz = useBusiness();
  const tree = (useRouteLoaderData('routes/locale-layout') as { categories?: CategoryNode[] } | undefined)?.categories ?? [];
  const live = (c: CategoryNode) => (c as CategoryNode & { productCount?: number }).productCount !== 0;
  const keyCats = tree.filter(live).flatMap((g) => g.children.filter(live).map((c) => ({ id: c.id, name: c.name, to: path.category(locale, g.slug, c.slug) }))).slice(0, 5);
  const head = 'font-semibold text-accent-text';
  const link = 'text-text-primary hover:underline';
  const info: Array<[SegmentKey, MessageKey]> = [['delivery', 'footer.delivery'], ['returns', 'footer.returns'], ['faq', 'footer.faq'], ['care', 'footer.care'], ['wholesale', 'nav.wholesale']];
  const about: Array<[SegmentKey, MessageKey]> = [['about', 'nav.about'], ['production', 'footer.production'], ['journal', 'footer.journal'], ['reviews', 'nav.reviews'], ['contacts', 'nav.contacts']];
  return (
    <>
    {/* Round 11 footer variant Б «Вечір у горах»: a low moon, terracotta and violet ridges, dark grass
        with arnica, bellflowers and white flowers rising into the footer. A cached image, not inline. */}
    <img src={evening} alt="" loading="lazy" decoding="async" aria-hidden="true" width={1440} height={170} className="block h-[110px] w-full sm:h-[170px]" />
    {/* G166: no content-visibility here — a skipped footer is measured against the peach page behind it
        (Lighthouse reported 1.3:1); drawn, the gold is 6.9:1 and the grey 8.8:1 on the dark green. */}
    <footer data-theme="dark" className="bg-bg-alt text-text-body">
      <div className="mx-auto flex max-w-(--container-wide) flex-col gap-9 px-4 py-8 lg:px-30">
        <div className={`grid gap-10 md:grid-cols-2 ${keyCats.length ? 'lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]' : 'lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]'}`}>
          <div className="flex flex-col gap-3">
            <span className="font-wordmark text-[1.9375rem] leading-none text-text-primary">{biz.brand}</span>
            <span className="text-body-sm text-text-muted">{biz.tagline}</span>
            <PaymentMarks />
          </div>
          {keyCats.length > 0 && (
            <nav className="flex flex-col gap-2.5 text-body-sm" aria-label={t(locale, 'footer.catalog')}>
              <span className={head}>{t(locale, 'footer.catalog')}</span>
              {keyCats.map((c) => <Link key={c.id} to={c.to} className={link}>{c.name}</Link>)}
              <Link to={`/${locale}/slovnyk`} className={link}>{t(locale, 'footer.glossary')}</Link>
            </nav>
          )}
          <nav className="flex flex-col gap-2.5 text-body-sm" aria-label={t(locale, 'footer.info')}>
            <span className={head}>{t(locale, 'footer.info')}</span>
            {info.map(([k, label]) => <Link key={k} to={path.seg(locale, k)} className={link}>{t(locale, label)}</Link>)}
          </nav>
          <nav className="flex flex-col gap-2.5 text-body-sm" aria-label={biz.brand}>
            <span className={head}>{biz.brand}</span>
            {about.map(([k, label]) => <Link key={k} to={path.seg(locale, k)} className={link}>{t(locale, label)}</Link>)}
          </nav>
          <div className="flex flex-col gap-2.5 text-body-sm">
            <span className={head}>{t(locale, 'footer.contacts')}</span>
            {biz.contactPeople.map((p) => {
              const l = contactLinks(p.phone);
              return <span key={p.name}>{p.name}: {l ? <a href={l.tel} className={link}>{p.phone}</a> : p.phone}</span>;
            })}
            <a href={`mailto:${biz.publicEmail}`} className={link}>{biz.publicEmail}</a>
            <Link to={path.seg(locale, 'contacts')} className="text-text-muted hover:underline">{biz.factoryAddress}</Link>
            {/* Only on a special day and the day before (the footer shows no regular hours). */}
            <SpecialDayNote locale={locale} />
            <div className="text-text-primary"><Messengers compact tone="inverted" /></div>
          </div>
        </div>
        {/* Seller identification is a legal requirement, not a choice. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border-hairline pt-4 text-caption text-text-muted">
          <span>{biz.legalEntityName} · {t(locale, 'footer.taxId')} {biz.legalId}</span>
          <nav aria-label={t(locale, 'footer.legal')} className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to={path.seg(locale, 'terms')} className="hover:underline">{t(locale, 'footer.terms')}</Link>
            <Link to={path.seg(locale, 'privacy')} className="hover:underline">{t(locale, 'footer.privacy')}</Link>
            <Link to={path.seg(locale, 'cookies')} className="hover:underline">{t(locale, 'footer.cookies')}</Link>
          </nav>
          <span>© {new Date().getFullYear()} {biz.brand}</span>
        </div>
      </div>
    </footer>
    </>
  );
}
