import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { Prisma } from '@prisma/client';
import { config } from '../../config';
import { enqueue } from '../../lib/jobs';
import { prisma } from '../../lib/prisma';
import { resolvePermissions } from '../auth/permissions';
import { paymentKey } from '../orders/orders.service';

/**
 * What the Telegram bot tells staff (2026-10-02, answers T17–T40; docs/00-client-decisions-21.md).
 * A notice is composed once from the database, then sent to each recipient as its own job (retried for
 * about an hour, T44). Who gets it: linked, allowed, has the permission, and has not switched the kind
 * off (T23). Nights 22:00–08:00 and weekends arrive without sound (T24, T26). Order notices are kept so
 * later steps can be written under them («✓ Підтверджено — Іван», T28–T29).
 */

export const KINDS = {
  order: { label: 'Нові замовлення', perm: 'orders.read' },
  quick: { label: '«Купити в 1 клік»', perm: 'orders.read' },
  payment: { label: 'Оплати', perm: 'orders.read' },
  cancel: { label: 'Скасування', perm: 'orders.read' },
  reminder: { label: 'Нагадування: не підтверджено', perm: 'orders.read' },
  production: { label: 'Виготовити до дати', perm: 'orders.read' },
  review: { label: 'Відгуки', perm: 'reviews.read' },
  mail: { label: 'Нові листи', perm: 'mail.read' },
  low_stock: { label: 'Закінчується товар', perm: 'products.read' },
  shop_sale: { label: 'Продаж у магазині', perm: 'owner' },
  subscriber: { label: 'Нові підписники розсилки', perm: 'owner' },
  daily: { label: 'Підсумок дня (19:00)', perm: 'orders.read' },
  weekly: { label: 'Підсумок тижня (понеділок)', perm: 'orders.read' },
  security: { label: 'Вхід у панель з нового пристрою', perm: 'self' },
  server_error: { label: 'Помилки сервера', perm: 'tech' },
} as const;
export type Kind = keyof typeof KINDS;

export type Notify =
  | { kind: 'order'; orderId: string }
  | { kind: 'quick_order'; id?: string }
  | { kind: 'review'; reviewId: string }
  | { kind: 'payment'; orderId: string; amountMinor?: number }
  | { kind: 'cancel'; orderId: string; reason?: string; byStaffId?: string | null }
  | { kind: 'shop_sale'; saleId: string }
  | { kind: 'mail'; threadId: string }
  | { kind: 'subscriber' }
  | { kind: 'security'; staffId: string; device: string }
  | { kind: 'reminder'; orderNumbers: string[] }
  | { kind: 'production'; text: string }
  | { kind: 'low_stock'; text: string }
  | { kind: 'daily' } | { kind: 'weekly' }
  | { kind: 'server_error'; message: string; where: string; requestId: string; count?: number }
  | { kind: 'text'; text: string };

interface Button { text: string; url: string }
export interface Composed { kind: Kind; html: string; buttons?: Button[][]; photo?: string | null; orderId?: string; onlyStaffId?: string; exceptStaffId?: string | null }

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
const uah = (minor: number | null | undefined) => (minor == null ? '—' : `${new Intl.NumberFormat('uk-UA').format(Math.round(minor / 100))} ₴`);
const PAY: Record<string, string> = { CARD: 'картка онлайн', PREPAYMENT: 'передоплата', COD_INSPECTION: 'накладений платіж', IBAN: 'рахунок IBAN' };
const DELIVERY: Record<string, string> = { NP_BRANCH: 'Нова пошта, відділення', NP_COURIER: "Нова пошта, кур'єр", UKRPOSHTA: 'Укрпошта', PICKUP: 'самовивіз у Яворові' };
const panel = (p: string) => `${config.adminUrl}${p}`;
const kyiv = (d = new Date()) => new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit' }).format(d);
export const orderButtons = (number: string): Button[][] => [[{ text: 'Відкрити в панелі', url: panel(`/orders/${number}`) }, { text: 'Підтвердити в панелі', url: panel(`/orders/${number}?confirm=1`) }]];

const productsOf = async (variantIds: Array<string | null>) =>
  (await prisma.productVariant.findMany({ where: { id: { in: variantIds.filter((x): x is string => !!x) } }, select: { productId: true } })).map((v) => v.productId);

/** The order's first photo as a local file, for the notice (T20). */
async function firstPhoto(productIds: string[]) {
  if (!productIds.length) return null;
  const m = await prisma.productMedia.findFirst({ where: { productId: { in: productIds }, media: { provider: 'local', kind: 'IMAGE' } }, orderBy: { position: 'asc' }, select: { media: { select: { publicId: true } } } });
  const file = m ? path.join(config.media.dir, `${m.media.publicId.slice('local:'.length)}-960.webp`) : null;
  return file && existsSync(file) ? file : null;
}

export async function compose(n: Notify): Promise<Composed | null> {
  switch (n.kind) {
    case 'order': {
      const o = await prisma.order.findUnique({ where: { id: n.orderId }, include: { items: { select: { nameSnapshot: true, quantityMilli: true, customSpec: true, variantId: true } } } });
      if (!o) return null;
      const a = (o.shippingAddress ?? {}) as { city?: string; method?: string };
      const items = o.items.map((i) => {
        const s = i.customSpec as { widthCm?: number; lengthCm?: number } | null;
        return `${esc(i.nameSnapshot)}${s?.widthCm ? ` ${s.widthCm}×${s.lengthCm} (свій розмір)` : ''} × ${i.quantityMilli / 1000}`;
      });
      const html = [
        `🛍 <b>Нове замовлення ${o.number}</b>`,
        `💰 ${uah(o.totalMinor)} · 💳 ${PAY[paymentKey(o)] ?? o.paymentMethod}`,
        ...items.map((x) => `📦 ${x}`),
        `🚚 ${DELIVERY[a.method ?? ''] ?? '—'}${a.city ? ` · 📍 ${esc(a.city)}` : ''}`,
        `📞 ${esc(o.phone)}`,
        '', 'Подзвоніть покупцю, щоб підтвердити 🙂',
      ].join('\n');
      return { kind: 'order', html, buttons: orderButtons(o.number), photo: await firstPhoto(await productsOf(o.items.map((i) => i.variantId))), orderId: o.id };
    }
    case 'quick_order': {
      const q = n.id ? await prisma.quickOrderRequest.findUnique({ where: { id: n.id } }) : null;
      const v = q?.variantId ? await prisma.productVariant.findUnique({ where: { id: q.variantId }, select: { sku: true, product: { select: { id: true, translations: { where: { locale: 'uk' }, select: { name: true } } } } } }) : null;
      const html = [
        '⚡️ <b>Купити в 1 клік</b>',
        ...(v ? [`📦 ${esc(v.product.translations[0]?.name ?? v.sku)} × ${q!.quantity}`] : []),
        ...(q ? [`📞 ${esc(q.phone)}`] : []),
        '', 'Передзвоніть, будь ласка — людина чекає 🙂',
      ].join('\n');
      return { kind: 'quick', html, buttons: [[{ text: 'Відкрити в панелі', url: panel('/orders?tab=quick') }]], photo: v ? await firstPhoto([v.product.id]) : null };
    }
    case 'payment': {
      const o = await prisma.order.findUnique({ where: { id: n.orderId }, select: { id: true, number: true, totalMinor: true, paymentMethod: true, prepaymentMinor: true } });
      if (!o) return null;
      return { kind: 'payment', html: `✅ <b>Оплату отримано</b> · ${o.number}\n💰 ${uah(n.amountMinor ?? o.totalMinor)} · ${PAY[paymentKey(o)] ?? o.paymentMethod}`, buttons: [[{ text: 'Відкрити в панелі', url: panel(`/orders/${o.number}`) }]], orderId: undefined };
    }
    case 'cancel': {
      const o = await prisma.order.findUnique({ where: { id: n.orderId }, select: { number: true } });
      if (!o) return null;
      const who = n.byStaffId ? (await prisma.staffUser.findUnique({ where: { id: n.byStaffId }, select: { firstName: true } }))?.firstName : null;
      return { kind: 'cancel', html: `✖️ <b>Замовлення ${o.number} скасовано</b>${n.reason ? `\nПричина: ${esc(n.reason)}` : ''}${who ? `\nСкасував(ла): ${esc(who)}` : '\nАвтоматично: не оплачено вчасно'}`, buttons: [[{ text: 'Відкрити в панелі', url: panel(`/orders/${o.number}`) }]], exceptStaffId: n.byStaffId ?? null };
    }
    case 'review': {
      const r = await prisma.review.findUnique({ where: { id: n.reviewId }, select: { rating: true, body: true, product: { select: { translations: { where: { locale: 'uk' }, select: { name: true } } } } } });
      if (!r) return null;
      const stars = '⭐️'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const text = r.body.length > 100 ? `${r.body.slice(0, 100).trimEnd()}…` : r.body;
      const html = [
        ...(r.rating <= 2 ? [`⚠️ <b>Увага: ${r.rating} з 5</b>`] : []),
        `💬 <b>Новий відгук на перевірку</b> ${stars}`,
        `📦 ${esc(r.product?.translations[0]?.name ?? 'Про магазин')}`,
        `«${esc(text)}»`,
      ].join('\n');
      return { kind: 'review', html, buttons: [[{ text: 'Перевірити', url: panel('/reviews') }]] };
    }
    case 'shop_sale': {
      const s = await prisma.shopSale.findUnique({ where: { id: n.saleId } });
      if (!s) return null;
      const items = (s.items as Array<{ name: string; quantity: number }>).map((i) => `📦 ${esc(i.name)} × ${i.quantity}`);
      const who = s.createdById ? (await prisma.staffUser.findUnique({ where: { id: s.createdById }, select: { firstName: true } }))?.firstName : null;
      return { kind: 'shop_sale', html: [`🏪 <b>Продаж у магазині</b>${who ? ` · ${esc(who)}` : ''}`, ...items, `💰 ${uah(s.totalMinor)} · ${s.payment === 'CASH' ? 'готівка' : 'переказ на карту'}`].join('\n'), exceptStaffId: s.createdById };
    }
    case 'mail': {
      const t = await prisma.mailThread.findUnique({ where: { id: n.threadId }, select: { id: true, subject: true, counterpartName: true, counterpartEmail: true } });
      if (!t) return null;
      return { kind: 'mail', html: `✉️ <b>Новий лист</b>\nВід: ${esc(t.counterpartName || t.counterpartEmail)}\nТема: ${esc(t.subject)}`, buttons: [[{ text: 'Відкрити в Пошті', url: panel(`/mail/${t.id}`) }]] };
    }
    case 'subscriber': {
      const total = await prisma.subscriber.count({ where: { status: 'CONFIRMED' } });
      return { kind: 'subscriber', html: `📬 <b>Новий підписник розсилки</b>\nУсього підписників: ${total}` };
    }
    case 'security':
      return { kind: 'security', onlyStaffId: n.staffId, html: `🔐 <b>Вхід у панель з нового пристрою</b>\n${esc(n.device)} · ${kyiv()}\n\nЯкщо це були не ви — змініть пароль у «Пароль і вхід».`, buttons: [[{ text: 'Пароль і вхід', url: panel('/account') }]] };
    case 'reminder':
      return { kind: 'reminder', html: `⏰ <b>Ще не підтверджено дзвінком</b> (понад 2 робочі години)\n${n.orderNumbers.map((x) => `• ${x}`).join('\n')}`, buttons: [[{ text: 'Відкрити', url: panel('/orders?view=attention') }]] };
    case 'production':
      return { kind: 'production', html: `🔨 <b>Виготовити найближчим часом</b>\n${esc(n.text)}`, buttons: [[{ text: 'Відкрити', url: panel('/orders?view=in_production') }]] };
    case 'low_stock':
      return { kind: 'low_stock', html: `📉 <b>Закінчується товар</b>\n${esc(n.text)}`, buttons: [[{ text: 'Товари', url: panel('/products?tab=low') }]] };
    case 'daily':
    case 'weekly':
      return summary(n.kind);
    case 'server_error':
      return { kind: 'server_error', html: `🛠 <b>Помилка сервера</b>${n.count && n.count > 1 ? ` ×${n.count}` : ''}\n<code>${esc(n.where)}</code>\n${esc(n.message.slice(0, 600))}\nrequestId: <code>${esc(n.requestId)}</code>` };
    case 'text':
      return { kind: 'order', html: esc(n.text) };
  }
}

/** Counts only — no sums of money in summaries (T33). `{name}` is filled per person. */
async function summary(kind: 'daily' | 'weekly'): Promise<Composed> {
  const days = kind === 'daily' ? 1 : 7;
  const since = new Date(Date.now() - days * 86_400_000);
  const [placed, confirmed, shipped, shop, toShip, making] = await Promise.all([
    prisma.order.count({ where: { placedAt: { gte: since } } }),
    prisma.orderEvent.count({ where: { type: 'confirmed_by_call', createdAt: { gte: since } } }),
    prisma.order.count({ where: { shippedAt: { gte: since } } }),
    prisma.shopSale.count({ where: { createdAt: { gte: since }, cancelledAt: null } }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PACKING'] }, trackingNumber: null } }),
    prisma.order.count({ where: { status: 'IN_PRODUCTION', expectedDispatchAt: { lt: new Date(Date.now() + 3 * 86_400_000) } } }),
  ]);
  const head = kind === 'daily' ? '🌇 <b>Підсумок дня</b>' : '📅 <b>Підсумок тижня</b>';
  return {
    kind,
    html: [head, `🛍 Нових замовлень: ${placed} · підтверджено: ${confirmed} · відправлено: ${shipped}`, `🏪 Продажів у магазині: ${shop}`,
      `📦 Чекають відправки: ${toShip}${making ? ` · 🔨 виготовити найближчим часом: ${making}` : ''}`, '',
      kind === 'daily' ? 'Гарного вечора, {name}!' : 'Гарного тижня, {name}!'].join('\n'),
    buttons: [[{ text: 'Відкрити панель', url: panel('/') }]],
  };
}

/* ---------- who receives ---------- */

const isOwner = async (id: string) => (await prisma.staffRoleAssignment.count({ where: { staffUserId: id, role: { key: 'owner' } } })) > 0;

export async function recipients(c: Composed) {
  const people = await prisma.staffUser.findMany({
    where: { status: 'ACTIVE', telegramChatId: { not: null }, ...(c.onlyStaffId ? { id: c.onlyStaffId } : {}) },
    select: { id: true, firstName: true, telegramChatId: true, telegramAllowed: true, telegramPrefs: true, permVersion: true },
  });
  const out: typeof people = [];
  for (const p of people) {
    if (c.exceptStaffId && p.id === c.exceptStaffId) continue;
    const owner = await isOwner(p.id);
    if (!p.telegramAllowed && !owner) continue;
    if ((p.telegramPrefs as Record<string, boolean> | null)?.[c.kind] === false) continue;
    const perm = KINDS[c.kind].perm;
    const tech = perm === 'tech' && (await prisma.staffRoleAssignment.count({ where: { staffUserId: p.id, role: { key: 'tech' } } })) > 0;
    if (perm === 'tech' ? !tech : perm === 'owner' ? !owner : perm === 'self' ? p.id !== c.onlyStaffId : !(await resolvePermissions(p.id, p.permVersion)).has(perm)) continue;
    out.push(p);
  }
  return out;
}

/** Fan-out: one retried job per person (T44: about an hour of retries). */
export async function dispatch(n: Notify) {
  const c = await compose(n);
  if (!c) return 0;
  const people = await recipients(c);
  for (const p of people) {
    await enqueue('telegram.send', { staffId: p.id, chatId: p.telegramChatId, html: c.html.replaceAll('{name}', esc(p.firstName)), buttons: c.buttons ?? null, photo: c.photo ?? null, orderId: c.orderId ?? null }, undefined, { retryLimit: 6, retryDelay: 60 });
  }
  return people.length;
}

/** T24, T26: nights and weekends arrive without sound. */
export function quietNow(d = new Date()) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(d);
  const h = Number(p.find((x) => x.type === 'hour')!.value), wd = p.find((x) => x.type === 'weekday')!.value;
  return wd === 'Sat' || wd === 'Sun' || h >= 22 || h < 8;
}

const run = promisify(execFile);
/** Telegram takes JPEG/PNG photos; local media is WebP, so it is converted on the fly when ImageMagick exists. */
export async function photoJpeg(file: string) {
  for (const bin of ['magick', 'convert']) {
    try { return (await run(bin, [file, '-resize', '960x960>', '-quality', '82', 'jpg:-'], { encoding: 'buffer', maxBuffer: 8 * 1024 * 1024 })).stdout as Buffer; } catch { /* next */ }
  }
  return null;
}

/** T28–T29: a line written under every notice of this order, e.g. «✓ Підтверджено — Іван, 14:05». */
export async function orderStatusLine(orderId: string, line: string, tx?: Prisma.TransactionClient) {
  await enqueue('telegram.edit', { orderId, line: `${line}, ${kyiv()}` }, tx);
}
export const STATUS_LINE: Record<string, string> = {
  CONFIRMED: '✅ Підтверджено', IN_PRODUCTION: '🔨 Виготовляється', PACKING: '📦 Пакується', SHIPPED: '🚚 Відправлено',
  DELIVERED: '🏁 Отримано', CANCELLED: '✖️ Скасовано', RETURNED: '↩️ Повернулось',
};
