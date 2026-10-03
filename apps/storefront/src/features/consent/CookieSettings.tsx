import { useEffect, useState } from 'react';
import { readConsent, writeConsent } from './consent';
import { useLocale, useT } from '@/lib/i18n';

/** On the cookies page: withdrawal is as easy as granting (31 §31.3). No pre-ticked boxes. */
export function CookieSettings() {
  const [ready, setReady] = useState(false);
  const [a, setA] = useState(false);
  const [m, setM] = useState(false);
  const [saved, setSaved] = useState('');
  const locale = useLocale();
  const tr = useT();
  useEffect(() => { const c = readConsent(); setA(!!c?.analytics); setM(!!c?.marketing); setSaved(c ? tr('cookies.yourChoice', { date: new Date(c.at).toLocaleDateString(locale === 'en' ? 'en-GB' : 'uk-UA') }) : tr('cookies.noChoice')); setReady(true); }, []);
  if (!ready) return null;
  const row = 'flex items-start gap-3 rounded-lg border border-border-hairline bg-bg-surface p-4 text-body';
  return (
    <section aria-labelledby="cookie-settings" className="flex flex-col gap-3">
      <h2 id="cookie-settings" className="mt-4 text-h3 text-text-primary">{tr('cookies.settings')}</h2>
      <label className={row}><input type="checkbox" checked disabled className="mt-1 size-5" /><span><b>{tr('cookies.necessary')}</b> {tr('cookies.necessaryText')}</span></label>
      <label className={row}><input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} className="mt-1 size-5" /><span><b>{tr('cookies.analytics')}</b> {tr('cookies.analyticsText')}</span></label>
      <label className={row}><input type="checkbox" checked={m} onChange={(e) => setM(e.target.checked)} className="mt-1 size-5" /><span><b>{tr('cookies.marketing')}</b> {tr('cookies.marketingText')}</span></label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => { writeConsent(a, m); setSaved(tr('cookies.saved')); }} className="rounded-lg border-2 border-text-primary px-5 py-2.5 text-body font-semibold text-text-primary">{tr('cookies.save')}</button>
        <span role="status" className="text-body-sm text-text-muted">{saved}</span>
      </div>
    </section>
  );
}
