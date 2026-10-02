import { BUSINESS } from '@vivcharyk/schemas';

// Owner-editable in «Пошта» → Налаштування (Setting rows); these are the first versions (round 19 D1).
// Wording follows the site's own pages (info.tsx: delivery, returns, care) and round 18 C3.

export const MAIL_LABELS_KEY = 'mail.labels';
export const MAIL_TEMPLATES_KEY = 'mail.templates';
export const MAIL_AUTOREPLY_KEY = 'mail.autoreply';

export const DEFAULT_LABELS = [
  { key: 'opt', title: 'Опт', color: 'green' },
  { key: 'product', title: 'Питання про товар', color: 'blue' },
  { key: 'delivery', title: 'Доставка', color: 'amber' },
  { key: 'return', title: 'Повернення / скарга', color: 'red' },
  { key: 'partner', title: 'Співпраця', color: 'violet' },
];

const ibanGrouped = BUSINESS.iban.replace(/(.{4})/g, '$1 ').trim();

export const DEFAULT_TEMPLATES = [
  {
    key: 'wholesale', title: 'Ціни опту',
    body: 'Оптову знижку рахуємо на кожен товар окремо: від 10 шт — 10 %, від 20 шт — 20 %.\nНапишіть, які товари й скільки штук вас цікавлять, — порахуємо суму та доставку.',
  },
  {
    key: 'availability', title: 'Наявність / строк виготовлення',
    body: 'Цей виріб [є в наявності / виготовимо під замовлення]. Під замовлення та «свого розміру» спершу виготовляємо — це 14 днів, — а потім відправляємо.',
  },
  {
    key: 'sizes', title: 'Розміри',
    body: 'Розміри кожного виробу вказані на сторінці товару. Якщо потрібен інший, напишіть ширину й довжину в сантиметрах — скажемо ціну. Виготовлення свого розміру — 14 днів.',
  },
  {
    key: 'care', title: 'Догляд за вовною',
    body: 'Вовну частіше провітрюють, ніж перуть. Якщо прати — вручну, у прохолодній воді, засобом для вовни, без викручування, і сушити розкладеним, подалі від батареї та сонця.',
  },
  {
    key: 'iban', title: 'Реквізити IBAN',
    body: `Реквізити для оплати:\nОтримувач: ${BUSINESS.legalEntityName}\nРНОКПП: ${BUSINESS.legalId}\nIBAN: ${ibanGrouped}\nПризначення: Оплата замовлення № [номер], без ПДВ`,
  },
  {
    key: 'returns', title: 'Повернення',
    body: 'Товар можна повернути або обміняти протягом 14 днів від отримання, якщо він зберіг товарний вигляд. Вироби свого розміру повертаються лише у разі браку.\nНапишіть номер замовлення та причину — підкажемо, як відправити.',
  },
];

export const DEFAULT_AUTOREPLY = {
  enabled: true,
  subject: 'Ми отримали ваш лист',
  body: `Вітаємо! Дякуємо за лист.\nЗараз неробочий час: ${BUSINESS.hoursText.replace(/^Працюємо/, 'ми працюємо')} Відповімо наступного робочого дня.\nЯкщо питання термінове — телефонуйте: ${BUSINESS.phones[0]}.\n\n${BUSINESS.brand}`,
};

export type MailTemplate = (typeof DEFAULT_TEMPLATES)[number];
export type MailLabel = (typeof DEFAULT_LABELS)[number];
