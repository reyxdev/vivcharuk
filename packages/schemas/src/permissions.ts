// The ONLY definition of a staff permission anywhere in the codebase (docs/24 §24.4, §24.16).
// The database rows (prisma/seed/permissions.ts), the PermissionKey union, the API middleware
// and the UI checks are all projections of this constant. The count is PERMISSIONS.length;
// it is deliberately not written down anywhere (docs/24 §24.4).
//
// Round overrides applied on top of the §24.4 constant and the §24.5 matrix:
// - round 10 §P7a: `leads.*` removed with the Leads module.
// - round 12 (docs/37 §37.10): + `templates.manage` ⚠, `libraries.manage`, `stock.shop_sale`;
//   `products.publish` Owner + Administrator only; hard `products.delete` Owner only.
// - round 14 F6: `payments.refund` Owner + Administrator only; fiscal receipts are visible to
//   Owner + Administrator only, which needs its own key (`payments.read_receipts`) because
//   Manager and Support hold `payments.read`.
// - round 9: quick-order requests are gated by `orders.read` / `orders.create`; no new resource.

function perm<R extends string, A extends string>(
  resource: R,
  action: A,
  label: string,
  dangerous = false,
) {
  return { key: `${resource}.${action}` as `${R}.${A}`, resource, action, dangerous, label } as const;
}

export const PERMISSIONS = [
  // Catalogue
  perm('products', 'read', 'Переглядати товари'),
  perm('products', 'create', 'Створювати товари'),
  perm('products', 'update', 'Редагувати товари'),
  perm('products', 'delete', 'Остаточно видаляти товари', true),
  perm('products', 'publish', 'Публікувати та знімати з публікації'),
  perm('products', 'archive', 'Архівувати товари'),
  perm('products', 'restore', 'Відновлювати видалені товари'),
  perm('products', 'bulk_edit', 'Масове редагування', true),
  perm('products', 'import', 'Імпорт з Excel', true),
  perm('products', 'export', 'Експорт в Excel'),
  perm('products', 'manage_price', 'Змінювати ціни', true),
  perm('products', 'manage_stock', 'Змінювати залишки'),
  perm('products', 'manage_media', 'Керувати фото товару'),
  perm('products', 'manage_origin', 'Змінювати походження товару', true),
  perm('products', 'manage_custom_size', 'Вмикати індивідуальний розмір'),
  perm('products', 'translate', 'Редагувати переклади товарів'),
  perm('templates', 'manage', 'Керувати шаблонами товарів', true),
  perm('libraries', 'manage', 'Керувати довідниками'),
  perm('stock', 'shop_sale', 'Списувати «Продано в магазині»'),
  perm('categories', 'read', 'Переглядати категорії'),
  perm('categories', 'create', 'Створювати категорії'),
  perm('categories', 'update', 'Редагувати категорії'),
  perm('categories', 'delete', 'Видаляти категорії', true),
  perm('categories', 'reorder', 'Змінювати порядок дерева'),
  perm('categories', 'feature', 'Позначати категорії рекомендованими'),
  perm('categories', 'translate', 'Редагувати переклади категорій'),

  // Commerce
  perm('orders', 'read', 'Переглядати замовлення'),
  perm('orders', 'create', 'Створювати замовлення вручну'),
  perm('orders', 'update', 'Редагувати замовлення'),
  perm('orders', 'change_status', 'Змінювати статус замовлення'),
  perm('orders', 'cancel', 'Скасовувати замовлення', true),
  perm('orders', 'delete', 'Видаляти замовлення', true),
  perm('orders', 'export', 'Експорт замовлень', true),
  perm('orders', 'quote', 'Виставляти рахунок на доставку', true),
  perm('orders', 'manage_shipping', 'Створювати ТТН і керувати доставкою'),
  perm('orders', 'print_documents', 'Друкувати накладні та етикетки'),
  perm('orders', 'note', 'Додавати внутрішні нотатки'),
  perm('payments', 'read', 'Переглядати платежі'),
  perm('payments', 'read_receipts', 'Переглядати фіскальні чеки'),
  perm('payments', 'reconcile', 'Звіряти ручні оплати', true),
  perm('payments', 'refund', 'Повертати кошти', true),
  perm('payments', 'waive_deposit', 'Скасовувати депозит за зворотну доставку', true),
  perm('payments', 'mark_cod_settled', 'Позначати розрахунок по НП'),
  perm('payment_settings', 'read', 'Переглядати платіжні реквізити'),
  perm('payment_settings', 'update', 'Змінювати платіжні реквізити', true),
  perm('customers', 'read', 'Переглядати клієнтів'),
  perm('customers', 'update', 'Редагувати клієнтів'),
  perm('customers', 'delete', 'Видаляти клієнтів', true),
  perm('customers', 'export', 'Експорт персональних даних', true),
  perm('customers', 'anonymize', 'Знеособлення на запит клієнта', true),

  // Content and marketing
  perm('reviews', 'read', 'Переглядати відгуки'),
  perm('reviews', 'moderate', 'Схвалювати, приховувати, відхиляти'),
  perm('reviews', 'reply', 'Відповідати на відгуки'),
  perm('reviews', 'delete', 'Видаляти відгуки', true),
  perm('blog', 'read', 'Переглядати статті'),
  perm('blog', 'create', 'Створювати статті'),
  perm('blog', 'update', 'Редагувати статті'),
  perm('blog', 'delete', 'Видаляти статті', true),
  perm('blog', 'publish', 'Публікувати статті'),
  perm('blog', 'schedule', 'Планувати публікацію'),
  perm('blog', 'translate', 'Редагувати переклади статей'),
  perm('gallery', 'read', 'Переглядати медіатеку'),
  perm('gallery', 'upload', 'Завантажувати медіа'),
  perm('gallery', 'update', 'Редагувати медіа, alt, фокус'),
  perm('gallery', 'delete', 'Видаляти медіа', true),
  perm('gallery', 'manage_albums', 'Керувати альбомами'),
  perm('promotions', 'read', 'Переглядати акції'),
  perm('promotions', 'create', 'Створювати акції'),
  perm('promotions', 'update', 'Редагувати акції'),
  perm('promotions', 'delete', 'Видаляти акції', true),
  perm('promotions', 'manage_banners', 'Керувати банерами'),
  perm('promotions', 'manage_hero', 'Керувати головним банером'),
  // round 7 §K2: business mail is read and answered in the panel. Mailbox membership is an
  // object-level check in the handler.
  perm('mail', 'read', 'Читати пошту'),
  perm('mail', 'reply', 'Відповідати та писати листи'),
  perm('mail', 'assign', 'Призначати відповідального за лист'),
  perm('mail', 'update', "Статус, спам, прив'язка до замовлення"),
  perm('mail', 'delete', 'Остаточно видаляти листи', true),
  perm('mail', 'manage_mailboxes', 'Керувати поштовими скриньками', true),

  // System
  perm('analytics', 'read', 'Переглядати відвідуваність і конверсію'),
  perm('analytics', 'read_revenue', 'Переглядати дохід'),
  perm('analytics', 'read_search_queries', 'Переглядати пошукові запити'),
  perm('analytics', 'export', 'Експорт аналітики'),
  perm('settings', 'read', 'Переглядати налаштування'),
  perm('settings', 'update', 'Змінювати налаштування'),
  perm('settings', 'manage_integrations', 'Ключі та інтеграції', true),
  perm('settings', 'manage_redirects', 'Керувати перенаправленнями'),
  perm('employees', 'read', 'Переглядати співробітників'),
  perm('employees', 'invite', 'Запрошувати співробітників'),
  perm('employees', 'create', 'Створювати облікові записи вручну'),
  perm('employees', 'update', 'Редагувати профілі співробітників'),
  perm('employees', 'suspend', 'Призупиняти доступ', true),
  perm('employees', 'block', 'Блокувати з міркувань безпеки', true),
  perm('employees', 'deactivate', 'Деактивувати після звільнення', true),
  perm('employees', 'delete', 'Видаляти співробітників', true),
  perm('employees', 'restore', 'Відновлювати співробітників'),
  perm('employees', 'assign_roles', 'Призначати ролі', true),
  perm('employees', 'manage_roles', 'Створювати та змінювати ролі', true),
  perm('employees', 'manage_sessions', 'Завершувати чужі сесії', true),
  perm('employees', 'reset_mfa', 'Скидати двоетапний вхід співробітнику', true),
  perm('audit', 'read', 'Переглядати журнал дій'),
  perm('audit', 'export', 'Експорт журналу дій', true),
] as const;

export type PermissionSpec = (typeof PERMISSIONS)[number];
export type PermissionKey = PermissionSpec['key'];

const ALL_KEYS: readonly PermissionKey[] = PERMISSIONS.map((p) => p.key);

// Owner-only reserve (docs/24 §24.5 «Reading the matrix») plus hard product delete (round 12 G5).
const OWNER_ONLY: ReadonlySet<PermissionKey> = new Set<PermissionKey>([
  'payment_settings.update',
  'employees.delete',
  'audit.export',
  'products.delete',
]);

interface SystemRoleSpec {
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly PermissionKey[];
}

// Eight system roles (docs/24 §24.5 + «Технічна підтримка», 2026-10-02). «Сезонний мерчендайзер» is a worked custom example, not
// a system role, and is not seeded.
export const SYSTEM_ROLES = {
  owner: {
    name: 'Власник',
    description: 'Повний доступ',
    permissions: ALL_KEYS,
  },
  administrator: {
    name: 'Адміністратор',
    description: 'Усе, крім платіжних реквізитів, видалення співробітників і товарів, експорту журналу',
    permissions: ALL_KEYS.filter((k) => !OWNER_ONLY.has(k)),
  },
  manager: {
    name: 'Менеджер',
    description: 'Замовлення, клієнти, пошта, ціни та акції; без налаштувань і повернень коштів',
    permissions: [
      'products.read', 'products.create', 'products.update', 'products.archive',
      'products.bulk_edit', 'products.export', 'products.manage_price', 'products.manage_stock',
      'products.manage_media', 'products.manage_custom_size', 'products.translate',
      'categories.read', 'categories.update', 'categories.reorder', 'categories.feature',
      'categories.translate',
      'orders.read', 'orders.create', 'orders.update', 'orders.change_status', 'orders.cancel',
      'orders.export', 'orders.quote', 'orders.manage_shipping', 'orders.print_documents',
      'orders.note',
      'payments.read', 'payments.reconcile', 'payments.waive_deposit', 'payments.mark_cod_settled',
      'payment_settings.read',
      'customers.read', 'customers.update',
      'reviews.read', 'reviews.moderate', 'reviews.reply',
      'blog.read',
      'gallery.read', 'gallery.upload',
      'promotions.read', 'promotions.create', 'promotions.update', 'promotions.manage_banners',
      'promotions.manage_hero',
      'mail.read', 'mail.reply', 'mail.assign', 'mail.update',
      'analytics.read', 'analytics.read_revenue', 'analytics.read_search_queries', 'analytics.export',
      'settings.read',
      'employees.read',
    ],
  },
  content_editor: {
    name: 'Контент-редактор',
    description: 'Описи, переклади, статті, медіа; без публікації товарів і без грошей',
    permissions: [
      'products.read', 'products.create', 'products.update', 'products.export',
      'products.manage_media', 'products.translate',
      'categories.read', 'categories.update', 'categories.translate',
      'reviews.read', 'reviews.moderate', 'reviews.reply',
      'blog.read', 'blog.create', 'blog.update', 'blog.publish', 'blog.schedule', 'blog.translate',
      'gallery.read', 'gallery.upload', 'gallery.update', 'gallery.manage_albums',
      'promotions.read', 'promotions.manage_banners',
      'analytics.read', 'analytics.read_search_queries',
      'settings.manage_redirects',
    ],
  },
  warehouse: {
    name: 'Склад',
    description: 'Пакування, ТТН, залишки',
    permissions: [
      'products.read', 'products.manage_stock', 'stock.shop_sale',
      'categories.read',
      'orders.read', 'orders.change_status', 'orders.manage_shipping', 'orders.print_documents',
      'orders.note',
    ],
  },
  support: {
    name: 'Підтримка',
    description: 'Клієнти, відгуки, пошта; без повернень коштів',
    permissions: [
      'products.read', 'categories.read',
      'orders.read', 'orders.note',
      'payments.read',
      'customers.read', 'customers.update',
      'reviews.read', 'reviews.reply',
      'mail.read', 'mail.reply', 'mail.assign', 'mail.update',
    ],
  },
  // 2026-10-02 (developer decision D23): the site's developer — settings, catalogue structure, content,
  // checking orders and mail when something breaks; no money, no refunds, no people, no anonymising.
  // Receives server-error notices in Telegram.
  tech: {
    name: 'Технічна підтримка',
    description: 'Розробник сайту: налаштування, каталог, перевірка роботи; без грошей і без людей',
    permissions: [
      'products.read', 'products.create', 'products.update', 'products.publish', 'products.archive', 'products.restore',
      'products.bulk_edit', 'products.import', 'products.export', 'products.manage_media', 'products.manage_custom_size', 'products.translate',
      'templates.manage', 'libraries.manage',
      'categories.read', 'categories.create', 'categories.update', 'categories.reorder', 'categories.feature', 'categories.translate',
      'orders.read', 'orders.print_documents', 'orders.note',
      'payments.read', 'payment_settings.read',
      'customers.read',
      'reviews.read',
      'blog.read', 'blog.create', 'blog.update', 'blog.publish', 'blog.schedule', 'blog.translate',
      'gallery.read', 'gallery.upload', 'gallery.update', 'gallery.manage_albums',
      'promotions.read', 'promotions.manage_banners', 'promotions.manage_hero',
      'mail.read', 'mail.manage_mailboxes',
      'analytics.read', 'analytics.read_search_queries',
      'settings.read', 'settings.update', 'settings.manage_integrations', 'settings.manage_redirects',
      'employees.read',
      'audit.read',
    ],
  },
  photographer: {
    name: 'Фотограф',
    description: 'Медіатека і фото товарів; нічого комерційного',
    permissions: [
      'products.read', 'products.manage_media',
      'categories.read',
      'blog.read',
      'gallery.read', 'gallery.upload', 'gallery.update', 'gallery.manage_albums',
    ],
  },
} as const satisfies Record<string, SystemRoleSpec>;

export type SystemRoleKey = keyof typeof SYSTEM_ROLES;
