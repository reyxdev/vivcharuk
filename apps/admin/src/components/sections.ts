import {
  Mail, ShoppingBag, Store, Package, Users, Star, LayoutGrid, FolderTree, Layers, Image, Newspaper, Percent, Send,
  UserCog, Settings, CircleHelp, Shapes, Palette, ScrollText, Home, type LucideIcon,
} from 'lucide-react';

// Round 20: one short menu, each section its own colour circle (#56, #103), in this order (#59);
// «1 клік» is a tab inside Замовлення (#60); everything else lives in «Ще», daily on top, set-up below
// (#57, #143–144). Hidden items are the ones the person has no permission for (#46).
export interface Section {
  to: string; label: string; icon: LucideIcon; color: string; ink?: string; perm?: string;
  counter?: 'mail' | 'orders' | 'reviews';
}

export const MAIN: Section[] = [
  { to: '/mail', label: 'Пошта', icon: Mail, color: '#5A8AAF', perm: 'mail.read', counter: 'mail' },
  { to: '/orders', label: 'Замовлення', icon: ShoppingBag, color: '#2E7355', perm: 'orders.read', counter: 'orders' },
  { to: '/shop-sale', label: 'Магазин', icon: Store, color: '#B08D4F', perm: 'stock.shop_sale' },
  { to: '/products', label: 'Товари', icon: Package, color: '#C77D58', perm: 'products.read' },
  { to: '/customers', label: 'Клієнти', icon: Users, color: '#8E76A8', perm: 'customers.read' },
  { to: '/reviews', label: 'Відгуки', icon: Star, color: '#E0B33A', ink: '#1C1B18', perm: 'reviews.read', counter: 'reviews' },
];

export const MORE_LINK: Section = { to: '/more', label: 'Ще', icon: LayoutGrid, color: '#7B776E' };
export const HOME: Section = { to: '/', label: 'Головна', icon: Home, color: '#1F3A2E' };

export const MORE_DAILY: Section[] = [
  { to: '/categories', label: 'Категорії', icon: FolderTree, color: '#C77D58', perm: 'categories.read' },
  { to: '/collections', label: 'Колекції', icon: Layers, color: '#C77D58', perm: 'categories.read' },
  { to: '/media', label: 'Фото й відео', icon: Image, color: '#5A8AAF', perm: 'products.manage_media' },
  { to: '/blog', label: 'Блог', icon: Newspaper, color: '#8E76A8', perm: 'blog.read' },
  { to: '/promotions', label: 'Акції й промокоди', icon: Percent, color: '#2E7355', perm: 'promotions.read' },
  { to: '/newsletter', label: 'Розсилка', icon: Send, color: '#5A8AAF', perm: 'mail.read' },
  { to: '/help', label: 'Довідка', icon: CircleHelp, color: '#7B776E' },
];

export const MORE_SETUP: Section[] = [
  { to: '/employees', label: 'Співробітники', icon: UserCog, color: '#7B776E', perm: 'employees.read' },
  { to: '/settings', label: 'Налаштування', icon: Settings, color: '#7B776E', perm: 'settings.read' },
  { to: '/templates', label: 'Шаблони товарів', icon: Shapes, color: '#7B776E', perm: 'templates.manage' },
  { to: '/libraries', label: 'Кольори й матеріали', icon: Palette, color: '#7B776E', perm: 'libraries.manage' },
  { to: '/audit', label: 'Журнал дій', icon: ScrollText, color: '#7B776E', perm: 'audit.read' },
];

// Phone bottom bar (#239): Головна · Пошта · Замовлення · Магазин · Ще, icons only (#256).
export const PHONE_TABS: Section[] = [HOME, MAIN[0]!, MAIN[1]!, MAIN[2]!, MORE_LINK];

export const ALL_SECTIONS = [HOME, ...MAIN, MORE_LINK, ...MORE_DAILY, ...MORE_SETUP];
export const sectionFor = (path: string) =>
  [...ALL_SECTIONS].sort((a, b) => b.to.length - a.to.length).find((s) => (s.to === '/' ? path === '/' : path === s.to || path.startsWith(`${s.to}/`)));
