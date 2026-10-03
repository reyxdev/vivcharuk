import { useParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { isLocale } from './locale';
import * as shell from './messages/shell';
import * as commerce from './messages/commerce';

// UI copy. `uk` is canonical; `en` is complete (round 24 G093); `pl` and `de` fall back to `uk` until
// translated (26 §26.6). The dictionaries live in ./messages, one file per area of the site.
const UK = { ...shell.uk, ...commerce.uk };
const EN: Record<MessageKey, string> = { ...shell.en, ...commerce.en };

export type MessageKey = keyof typeof shell.uk | keyof typeof commerce.uk;
const CATALOGUES: Partial<Record<Locale, Partial<Record<MessageKey, string>>>> = { uk: UK, en: EN };

export function t(locale: Locale, key: MessageKey, vars: Record<string, string | number> = {}) {
  const raw = CATALOGUES[locale]?.[key] ?? UK[key];
  // `{n|one|few|many}` picks the plural form by Intl rules for the locale (English: one / other → many).
  const rules = new Intl.PluralRules(locale);
  return raw
    .replace(/\{(\w+)\|([^|}]*)\|([^|}]*)\|([^|}]*)\}/g, (_, k: string, one: string, few: string, many: string) => {
      const cat = rules.select(Number(vars[k] ?? 0));
      return cat === 'one' ? one : cat === 'few' ? few : many;
    })
    .replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

/** The page's locale from the URL (`/:locale/…`), `uk` outside it. For components without a `locale` prop. */
export function useLocale(): Locale {
  const { locale } = useParams();
  return isLocale(locale) ? locale : 'uk';
}

/** `const tr = useT(); tr('nav.catalog')` — t() bound to the page's locale. */
export function useT() {
  const locale = useLocale();
  return (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars);
}

// Partner regions are typed in the panel in Ukrainian; the ones in use get their English names (G093).
const REGIONS_EN: Record<string, string> = { 'Косівщина': 'the Kosiv area', 'Закарпаття': 'Transcarpathia', 'Гуцульщина': 'the Hutsul region', 'Буковина': 'Bukovyna', 'Прикарпаття': 'Prykarpattia' };
export const regionName = (region: string, locale: Locale) => (locale === 'en' ? REGIONS_EN[region.trim()] ?? region : region);
