import { DEFAULT_LOCALE, type Locale } from '@vivcharyk/schemas';

export const LOCALES: Locale[] = ['uk', 'en', 'pl', 'de'];
export const isLocale = (v: string | undefined): v is Locale => !!v && (LOCALES as string[]).includes(v);

/**
 * D39: the locales the site serves; a switched-off locale's URLs redirect (302) to the matching `/uk/`
 * page. Round 24 G093: `uk` and `en` at launch — `VITE_ENABLED_LOCALES=uk,en` in the root .env (build
 * time, vite envDir); switcher, hreflang and sitemaps follow this list.
 */
export const ENABLED_LOCALES: Locale[] = [...new Set(['uk', ...((import.meta.env.VITE_ENABLED_LOCALES as string | undefined) ?? 'uk').split(',').map((x) => x.trim())])].filter(isLocale);
export const isEnabledLocale = (v: string | undefined): v is Locale => !!v && (ENABLED_LOCALES as string[]).includes(v);
export { DEFAULT_LOCALE };
