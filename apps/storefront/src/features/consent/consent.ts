// Consent (31 §31.3, round 10 part 7 #17–19). Stored as a first-party cookie with a version stamp:
// a new tag purpose bumps the version and asks again. «Лише необхідні» is remembered 180 days.
export const CONSENT_VERSION = 1;
const COOKIE = 'vk_consent';
const MAX_AGE = 180 * 86_400;

export interface Consent { v: number; analytics: boolean; marketing: boolean; at: number }

export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!raw) return null;
  try {
    const c = JSON.parse(decodeURIComponent(raw)) as Consent;
    return c.v === CONSENT_VERSION ? c : null;
  } catch { return null; }
}

export function writeConsent(analytics: boolean, marketing: boolean) {
  const before = readConsent();
  const c: Consent = { v: CONSENT_VERSION, analytics, marketing, at: Date.now() };
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(c))}; path=/; max-age=${MAX_AGE}; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
  // Withdrawal clears what was set under it, then reloads so no tag keeps running (31 §31.3).
  if (before?.analytics && !analytics) {
    for (const name of document.cookie.split('; ').map((x) => x.split('=')[0]!).filter((n) => n === '_ga' || n.startsWith('_ga_') || n === '_gid')) {
      for (const domain of ['', `; domain=${location.hostname}`, `; domain=.${location.hostname.replace(/^www\./, '')}`]) document.cookie = `${name}=; path=/; max-age=0${domain}`;
    }
    location.reload();
  }
  window.dispatchEvent(new CustomEvent('vk:consent', { detail: c }));
  return c;
}

/** GA4 id; empty = no analytics tag at all. */
export const GA_ID: string = import.meta.env.VITE_GA_ID ?? '';

declare global { interface Window { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void } }

/** Consent Mode v2, default-denied, then GA4 — only after «Прийняти всі» (round 10 part 7 #19). */
export function loadAnalytics() {
  if (!GA_ID || window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() { window.dataLayer!.push(arguments); }; // eslint-disable-line prefer-rest-params
  window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500 });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}
