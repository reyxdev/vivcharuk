import type { Locale } from '@prisma/client';

// URL segments the API writes into site paths (the storefront's dictionary: apps/storefront/src/lib/segments.ts).
export const LOCALES: Locale[] = ['uk', 'en', 'pl', 'de'];
export const PRODUCT_SEG: Record<Locale, string> = { uk: 'tovar', en: 'product', pl: 'produkt', de: 'produkt' };
export const JOURNAL_SEG: Record<Locale, string> = { uk: 'zhurnal', en: 'journal', pl: 'magazyn', de: 'journal' };
export const COLLECTIONS_SEG: Record<Locale, string> = { uk: 'kolektsii', en: 'collections', pl: 'kolekcje', de: 'kollektionen' };
