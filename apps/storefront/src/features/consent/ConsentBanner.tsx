import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';
import { t } from '@/lib/i18n';
import { GA_ID, loadAnalytics, readConsent, writeConsent } from './consent';

/**
 * Round 10 part 7 #17–18: a bottom strip, «Прийняти всі» and «Лише необхідні» of equal weight, no
 * dark pattern; the footer's «Налаштування cookies» leads to the page where the choice changes.
 * Shown only when a consent-gated tag exists (GA today) — or in development, to be testable.
 */
export function ConsentBanner({ locale }: { locale: Locale }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const c = readConsent();
    if (c?.analytics) loadAnalytics();
    // After idle, so it never competes with the LCP (31 §31.3).
    const ask = () => setShow(!c && (!!GA_ID || import.meta.env.DEV));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(ask); else setTimeout(ask, 300);
    const onReopen = () => setShow(true);
    window.addEventListener('vk:consent-reopen', onReopen);
    return () => window.removeEventListener('vk:consent-reopen', onReopen);
  }, []);
  if (!show) return null;
  const choose = (all: boolean) => { const c = writeConsent(all, all); if (c.analytics) loadAnalytics(); setShow(false); };
  const btn = 'min-h-11 flex-1 rounded-lg border-2 border-text-primary px-5 text-body font-semibold text-text-primary sm:flex-none';
  return (
    <div role="region" aria-label={t(locale, 'consent.region')} className="fixed inset-x-0 bottom-0 z-(--z-overlay) border-t border-border-hairline bg-bg-surface shadow-lg max-md:bottom-16">
      <div className="mx-auto flex max-w-(--container-wide) flex-col gap-3 px-4 py-4 md:flex-row md:items-center lg:px-12">
        <p className="flex-1 text-body-sm text-text-body">
          {t(locale, 'consent.text')}{' '}
          <Link to={path.seg(locale, 'cookies')} className="underline">{t(locale, 'consent.more')}</Link>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => choose(true)} className={btn}>{t(locale, 'consent.acceptAll')}</button>
          <button type="button" onClick={() => choose(false)} className={btn}>{t(locale, 'consent.necessaryOnly')}</button>
        </div>
      </div>
    </div>
  );
}
