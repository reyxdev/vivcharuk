import type { DeliveryMethod } from '@vivcharyk/schemas';
import { config } from '../../config';

// Port for delivery tariffs (18 §18.6). Domestic tariffs have no defaults: without the Nova Poshta
// integration (key pending) a quote is null and checkout says so. Development may switch on an
// obviously fake 1 ₴ tariff so the flow can be exercised; it is never plausible-looking.
export interface ShippingQuote { forwardMinor: number | null; isTest: boolean }

export async function quoteShipping(method: DeliveryMethod): Promise<ShippingQuote> {
  if (method === 'PICKUP') return { forwardMinor: 0, isTest: false };
  if (config.shipping.testRates) return { forwardMinor: 100, isTest: true };
  return { forwardMinor: null, isTest: false };
}

// Nova Poshta address directory. The real proxy (cached 24 h / 1 h, 26 §26.10.4) needs the API key;
// development serves a tiny labelled fixture so the pickers can be built and tested.
const DEV_CITIES = [
  { ref: 'dev-kosiv', name: 'Косів', region: 'Івано-Франківська обл.' },
  { ref: 'dev-ivano-frankivsk', name: 'Івано-Франківськ', region: 'Івано-Франківська обл.' },
  { ref: 'dev-lviv', name: 'Львів', region: 'Львівська обл.' },
  { ref: 'dev-kyiv', name: 'Київ', region: 'м. Київ' },
];

export async function searchCities(q: string) {
  if (!config.shipping.npApiKey && !config.shipping.testRates) return [];
  const needle = q.trim().toLowerCase();
  return DEV_CITIES.filter((c) => c.name.toLowerCase().includes(needle)).slice(0, 10);
}

export async function listWarehouses(cityRef: string) {
  if (!config.shipping.npApiKey && !config.shipping.testRates) return [];
  const city = DEV_CITIES.find((c) => c.ref === cityRef);
  if (!city) return [];
  return [1, 2, 3].map((n) => ({ ref: `${cityRef}-wh-${n}`, label: `Відділення №${n} (тестове), ${city.name}`, isLocker: false }))
    .concat([{ ref: `${cityRef}-pt-1`, label: `Поштомат №1 (тестовий), ${city.name}`, isLocker: true }]);
}
