import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { BUSINESS, contactLinks } from '@vivcharyk/schemas';
import { Messengers } from '@/components/contact/Messengers';
import { PaymentMarks } from './PaymentMarks';
import evening from './art/footer-evening.svg?url';
import { t } from '@/lib/i18n';
import { path, type SegmentKey } from '@/lib/segments';

// Round 10 part 7 #23: information, contacts, messengers, payment icons and the mandatory legal
// row. No category links: the mega menu carries them.
export function SiteFooter({ locale }: { locale: Locale }) {
  const head = 'font-semibold text-accent-text';
  const link = 'text-text-primary hover:underline';
  const info: Array<[SegmentKey, string]> = [['delivery', 'Доставка і оплата'], ['returns', 'Повернення та обмін'], ['faq', 'Питання й відповіді'], ['care', 'Догляд за виробами'], ['wholesale', 'Опт']];
  const about: Array<[SegmentKey, string]> = [['about', 'Про нас'], ['production', 'Як ми виробляємо'], ['journal', 'Журнал'], ['reviews', 'Відгуки'], ['contacts', 'Контакти']];
  return (
    <>
    {/* Round 11 footer variant Б «Вечір у горах»: a low moon, terracotta and violet ridges, dark grass
        with arnica, bellflowers and white flowers rising into the footer. A cached image, not inline. */}
    <img src={evening} alt="" aria-hidden="true" width={1440} height={170} className="block h-[110px] w-full sm:h-[170px]" />
    <footer data-theme="dark" className="bg-bg-alt text-text-body [content-visibility:auto] [contain-intrinsic-size:auto_520px]">
      <div className="mx-auto flex max-w-(--container-wide) flex-col gap-9 px-4 py-8 lg:px-30">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-3">
            <span className="font-wordmark text-[1.9375rem] leading-none text-text-primary">{BUSINESS.brand}</span>
            <span className="text-body-sm text-text-muted">{BUSINESS.tagline}</span>
            <PaymentMarks />
          </div>
          <nav className="flex flex-col gap-2.5 text-body-sm" aria-label={t(locale, 'footer.info')}>
            <span className={head}>{t(locale, 'footer.info')}</span>
            {info.map(([k, label]) => <Link key={k} to={path.seg(locale, k)} className={link}>{label}</Link>)}
          </nav>
          <nav className="flex flex-col gap-2.5 text-body-sm" aria-label={BUSINESS.brand}>
            <span className={head}>{BUSINESS.brand}</span>
            {about.map(([k, label]) => <Link key={k} to={path.seg(locale, k)} className={link}>{label}</Link>)}
          </nav>
          <div className="flex flex-col gap-2.5 text-body-sm">
            <span className={head}>{t(locale, 'footer.contacts')}</span>
            {BUSINESS.contactPeople.map((p) => {
              const l = contactLinks(p.phone);
              return <span key={p.name}>{p.name}: {l ? <a href={l.tel} className={link}>{p.phone}</a> : p.phone}</span>;
            })}
            <a href={`mailto:${BUSINESS.publicEmail}`} className={link}>{BUSINESS.publicEmail}</a>
            <span className="text-text-muted">{BUSINESS.locality}</span>
            <div className="text-text-primary"><Messengers compact tone="inverted" /></div>
          </div>
        </div>
        {/* Seller identification is a legal requirement, not a choice. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border-hairline pt-4 text-caption text-text-muted">
          <span>{BUSINESS.legalEntityName} · РНОКПП {BUSINESS.legalId}</span>
          <nav aria-label="Юридична інформація" className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to={path.seg(locale, 'terms')} className="hover:underline">Договір оферти</Link>
            <Link to={path.seg(locale, 'privacy')} className="hover:underline">Конфіденційність</Link>
            <Link to={path.seg(locale, 'cookies')} className="hover:underline">Налаштування cookies</Link>
          </nav>
          <span>© {new Date().getFullYear()} {BUSINESS.brand}</span>
        </div>
      </div>
    </footer>
    </>
  );
}
