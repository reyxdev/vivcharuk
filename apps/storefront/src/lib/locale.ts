import { DEFAULT_LOCALE, type Locale } from '@vivcharyk/schemas';

export const LOCALES: Locale[] = ['uk', 'en', 'pl', 'de'];
export const isLocale = (v: string | undefined): v is Locale => !!v && (LOCALES as string[]).includes(v);
export { DEFAULT_LOCALE };
