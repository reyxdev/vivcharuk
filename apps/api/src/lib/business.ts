import { liveBusiness, parseSiteContact, SITE_CONTACT_KEY, SITE_TICKER_KEY, tickerSchema, DEFAULT_TICKER, type TickerItem } from '@vivcharyk/schemas';
import { getSetting } from './settings';

/**
 * BUSINESS with the owner's current hours, phone and public e-mail (D28, the `site.contact` Setting,
 * edited in the panel's «Магазин» tile). Everything else — seller, РНОКПП, IBAN, address — is the
 * code constant. Cached with the other settings (lib/settings.ts).
 */
export async function getBusiness() {
  return liveBusiness(parseSiteContact(await getSetting<unknown>(SITE_CONTACT_KEY, null)));
}

/** The top-strip phrases (D29) in the owner's order; a broken stored list falls back to the default. */
export async function getTicker(): Promise<TickerItem[]> {
  const r = tickerSchema.safeParse(await getSetting<unknown>(SITE_TICKER_KEY, null));
  return r.success ? r.data : DEFAULT_TICKER;
}
