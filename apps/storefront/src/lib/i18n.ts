import type { Locale } from '@vivcharyk/schemas';

// UI copy. `uk` is canonical; other locales fall back to it until translated (26 §26.6).
const UK = {
  'nav.catalog': 'Каталог',
  'nav.allCategories': 'Усі категорії',
  'nav.wholesale': 'Опт',
  'nav.about': 'Про нас',
  'nav.reviews': 'Відгуки',
  'nav.contacts': 'Контакти',
  'nav.menu': 'Меню',
  'nav.close': 'Закрити',
  'header.search': 'Пошук',
  'header.call': 'Подзвонити',
  'header.wishlist': 'Обране',
  'header.cart': 'Кошик',
  'header.language': 'Мова',
  'catalog.showMore': 'Показати ще',
  'catalog.filters': 'Фільтри',
  'catalog.resetAll': 'Скинути все',
  'catalog.empty': 'За цими фільтрами товарів немає.',
  'catalog.inStockOnly': 'Лише в наявності',
  'catalog.sort': 'Сортування',
  'catalog.sort.popularity': 'Популярні',
  'catalog.sort.newest': 'Новинки',
  'catalog.sort.price_asc': 'Спершу дешевші',
  'catalog.sort.price_desc': 'Спершу дорожчі',
  'catalog.sort.name_asc': 'За назвою',
  'catalog.sort.relevance': 'За збігом',
  'catalog.sort.discount': 'Зі знижкою',
  'catalog.count': '{n} {n|товар|товари|товарів}',
  'catalog.show': 'Показати {n} {n|товар|товари|товарів}',
  'product.own': 'Власне виробництво',
  'product.partner': 'Від партнерів',
  'product.outOfStock': 'Немає в наявності',
  'product.fewLeft': 'Залишилось мало',
  'product.madeToOrder': 'Виготовимо за {n} днів',
  'product.addToCart': 'Додати в кошик',
  'product.specs': 'Характеристики',
  'product.composition': 'Склад',
  'product.photoSoon': 'Фото незабаром',
  'badge.NEW': 'Новинка',
  'badge.SALE': 'Знижка',
  'badge.HIT': 'Хіт',
  'footer.info': 'Інформація',
  'footer.catalog': 'Каталог',
  'footer.contacts': 'Контакти',
  'notFound.title': 'Сторінку не знайдено',
  'notFound.home': 'На головну',
} as const;

export type MessageKey = keyof typeof UK;
const CATALOGUES: Partial<Record<Locale, Partial<Record<MessageKey, string>>>> = { uk: UK };

export function t(locale: Locale, key: MessageKey, vars: Record<string, string | number> = {}) {
  const raw = CATALOGUES[locale]?.[key] ?? UK[key];
  // `{n|one|few|many}` picks the plural form by Intl rules for the locale.
  const rules = new Intl.PluralRules(locale);
  return raw
    .replace(/\{(\w+)\|([^|}]*)\|([^|}]*)\|([^|}]*)\}/g, (_, k: string, one: string, few: string, many: string) => {
      const cat = rules.select(Number(vars[k] ?? 0));
      return cat === 'one' ? one : cat === 'few' ? few : many;
    })
    .replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
