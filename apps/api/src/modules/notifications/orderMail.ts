import { BUSINESS, BUSINESS_EN, hoursTextEn, DEFAULT_SITE_CONTACT } from '@vivcharyk/schemas';
import type { Prisma } from '@prisma/client';
import { config } from '../../config';
import { type Mail } from '../../lib/mail';
import { prisma } from '../../lib/prisma';
import { paymentKey } from '../orders/orders.service';

// Round 18: the buyer's e-mails, sent from the shop's own mailbox. Job payloads carry the order id
// only; the message is composed here from the database at send time.
export type OrderMailKind = 'order_placed' | 'order_paid' | 'order_shipped';

const ORDER_SEGMENT: Record<string, string> = { uk: 'zamovlennia', en: 'order', pl: 'moje-zamowienie', de: 'bestellung' };
const DELIVERY: Record<string, string> = { NP_BRANCH: 'Нова пошта, відділення', NP_COURIER: 'Нова пошта, кур’єр', UKRPOSHTA: 'Укрпошта', PICKUP: 'Самовивіз у Яворові' };
const PAY: Record<string, string> = { CARD: 'карткою онлайн', PREPAYMENT: 'передоплата, решта на пошті', COD_INSPECTION: 'накладений платіж з оглядом', IBAN: 'на рахунок IBAN' };
// Round 24 G093: an order placed on the English site is answered in English (the order's locale).
const DELIVERY_EN: Record<string, string> = { NP_BRANCH: 'Nova Poshta, branch', NP_COURIER: 'Nova Poshta, courier', UKRPOSHTA: 'Ukrposhta', PICKUP: 'Pickup in Yavoriv' };
const PAY_EN: Record<string, string> = { CARD: 'card online', PREPAYMENT: 'prepayment, the rest at the post office', COD_INSPECTION: 'cash on delivery with inspection', IBAN: 'bank transfer (IBAN)' };
const uah = (minor: number | null) => (minor === null ? '—' : `${new Intl.NumberFormat('uk-UA').format(Math.round(minor / 100))} ₴`);
export type MailLang = 'uk' | 'en';
/** The letter's language: English for every order placed outside the Ukrainian site. */
export const mailLang = (locale: string | null | undefined): MailLang => (locale && locale !== 'uk' ? 'en' : 'uk');
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const C = { ink: '#1F2A22', muted: '#5E594F', line: '#E2D3BE', page: '#F6EBDD', card: '#FFFBF4', accent: '#2F5D46' };

export function layout(title: string, blocks: string[], button?: { href: string; label: string }, lang: MailLang = 'uk') {
  const btn = button
    ? `<p style="margin:24px 0 8px"><a href="${esc(button.href)}" style="display:inline-block;background:${C.ink};color:#FFFBF4;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px">${esc(button.label)}</a></p>`
    : '';
  const footer = lang === 'en'
    ? `${esc(BUSINESS_EN.brand)} · ${esc(BUSINESS_EN.legalEntityName)} · Taxpayer number (RNOKPP) ${esc(BUSINESS.legalId)}<br>${esc(BUSINESS_EN.factoryAddress)}<br>${esc(BUSINESS.phones[0]!)} · ${esc(hoursTextEn(DEFAULT_SITE_CONTACT.week))}`
    : `${esc(BUSINESS.brand)} · ${esc(BUSINESS.legalEntityName)} · РНОКПП ${esc(BUSINESS.legalId)}<br>${esc(BUSINESS.factoryAddress)}<br>${esc(BUSINESS.phones[0]!)} · ${esc(BUSINESS.hoursText)}`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:${C.page};font-family:Arial,Helvetica,sans-serif;color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td align="center" style="padding-bottom:12px"><img src="${config.siteUrl}/brand/logo-mail.png" width="96" height="79" alt="${esc(lang === 'en' ? BUSINESS_EN.brand : BUSINESS.brand)}" style="display:block;border:0"></td></tr>
<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:12px;padding:24px 22px;font-size:15px;line-height:1.55">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${esc(title)}</h1>
${blocks.join('\n')}${btn}
</td></tr>
<tr><td style="padding:16px 8px;font-size:12px;line-height:1.5;color:${C.muted};text-align:center">
${footer}
</td></tr></table></td></tr></table></body></html>`;
}

export const p = (s: string) => `<p style="margin:0 0 12px">${s}</p>`;
const rows = (r: Array<[string, string]>) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line};margin:8px 0 12px">${r
    .map(([k, v]) => `<tr><td style="padding:7px 0;border-bottom:1px solid ${C.line};color:${C.muted};vertical-align:top">${esc(k)}</td><td style="padding:7px 0 7px 12px;border-bottom:1px solid ${C.line};text-align:right;font-weight:600">${esc(v)}</td></tr>`)
    .join('')}</table>`;
const textRows = (r: Array<[string, string]>) => r.map(([k, v]) => `${k}: ${v}`).join('\n');

export async function orderMail(kind: OrderMailKind, orderId: string): Promise<Mail | null> {
  const o = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!o?.email || !o.guestToken) return null;
  const a = (o.shippingAddress ?? {}) as { firstName?: string; method?: string; city?: string | null; warehouseLabel?: string | null; address?: string | null };
  const link = `${config.siteUrl}/${o.locale}/${ORDER_SEGMENT[o.locale] ?? 'zamovlennia'}/${o.guestToken}`;
  const hello = a.firstName ? `${a.firstName}, ` : '';
  const pay = paymentKey(o);
  if (mailLang(o.locale) === 'en') return orderMailEn(kind, o, a, link);
  const where = [DELIVERY[a.method ?? ''] ?? '', a.city, a.warehouseLabel ?? a.address].filter(Boolean).join(', ');

  if (kind === 'order_placed') {
    const lines: Array<[string, string]> = o.items.map((i) => [`${i.nameSnapshot}${i.quantityMilli !== 1000 ? ` × ${i.quantityMilli / 1000}` : ''}`, uah(i.totalMinor)]);
    const sums: Array<[string, string]> = [
      ...(o.discountMinor > 0 ? [['Знижка', `−${uah(o.discountMinor)}`] as [string, string]] : []),
      ...(o.shippingMinor !== null ? [['Доставка', o.shippingMinor === 0 ? 'безкоштовно' : uah(o.shippingMinor)] as [string, string]] : []),
      ['Разом', uah(o.totalMinor)],
    ];
    const iban: Array<[string, string]> = pay === 'IBAN' && o.totalMinor !== null
      ? [['Отримувач', BUSINESS.legalEntityName], ['РНОКПП', BUSINESS.legalId], ['IBAN', BUSINESS.iban], ['Сума', uah(o.totalMinor)], ['Призначення', `Оплата замовлення № ${o.number}, без ПДВ`]]
      : [];
    const next = pay === 'IBAN' ? 'Відправимо замовлення, щойно оплата надійде на рахунок.'
      : pay === 'CARD' && o.paymentStatus !== 'PAID' ? 'Оплатити можна на сторінці замовлення.'
      : 'Зателефонуємо, щоб підтвердити замовлення.';
    const subject = `Замовлення ${o.number} прийнято — ${BUSINESS.brand}`;
    const html = layout(`Дякуємо за замовлення!`, [
      p(`${esc(hello)}ми отримали ваше замовлення <b style="white-space:nowrap">${esc(o.number)}</b>. ${esc(next)}`),
      rows(lines), rows(sums),
      p(`<b>Доставка:</b> ${esc(where || '—')}<br><b>Оплата:</b> ${esc(PAY[pay] ?? '')}`),
      ...(iban.length ? [p('<b>Реквізити для оплати</b>'), rows(iban)] : []),
      p(`Статус замовлення, оплата й чек — на сторінці замовлення. Питання? ${esc(BUSINESS.phones[0]!)}.`),
    ], { href: link, label: 'Сторінка замовлення' });
    const text = [`${hello}ми отримали ваше замовлення ${o.number}. ${next}`, '', textRows(lines), textRows(sums), '', `Доставка: ${where}`, `Оплата: ${PAY[pay] ?? ''}`,
      ...(iban.length ? ['', 'Реквізити для оплати:', textRows(iban)] : []), '', `Сторінка замовлення: ${link}`, `Питання? ${BUSINESS.phones[0]}`].join('\n');
    return { to: o.email, subject, html, text };
  }

  if (kind === 'order_paid') {
    const subject = `Оплату за замовлення ${o.number} отримано — ${BUSINESS.brand}`;
    const html = layout('Оплату отримано', [
      p(`${esc(hello)}дякуємо! Оплату за замовлення <b>${esc(o.number)}</b> отримано.`),
      p('Фіскальний чек — на сторінці замовлення, там само видно, коли ми його відправимо.'),
    ], { href: link, label: 'Чек і статус замовлення' });
    return { to: o.email, subject, html, text: `${hello}оплату за замовлення ${o.number} отримано.\nЧек і статус: ${link}` };
  }

  const subject = `Замовлення ${o.number} відправлено — ${BUSINESS.brand}`;
  const ttn: Array<[string, string]> = o.trackingNumber ? [['Номер відправлення', o.trackingNumber]] : [];
  const html = layout('Замовлення відправлено', [
    p(`${esc(hello)}ваше замовлення <b>${esc(o.number)}</b> вже в дорозі.`),
    ...(ttn.length ? [rows(ttn), p('Відстежити посилку можна на сайті чи в застосунку перевізника за цим номером.')] : []),
    p(`<b>Доставка:</b> ${esc(where || '—')}`),
  ], { href: link, label: 'Сторінка замовлення' });
  return { to: o.email, subject, html, text: [`${hello}замовлення ${o.number} відправлено.`, textRows(ttn), `Доставка: ${where}`, `Сторінка замовлення: ${link}`].filter(Boolean).join('\n') };
}

type OrderRow = Prisma.OrderGetPayload<{ include: { items: true } }>;

/** The same three letters in English (G093). The payment reference stays Ukrainian: the bank reads it. */
function orderMailEn(kind: OrderMailKind, o: OrderRow, a: { firstName?: string; method?: string; city?: string | null; warehouseLabel?: string | null; address?: string | null }, link: string): Mail {
  const hello = a.firstName ? `${a.firstName}, ` : '';
  const pay = paymentKey(o);
  const where = [DELIVERY_EN[a.method ?? ''] ?? '', a.city, a.warehouseLabel ?? a.address].filter(Boolean).join(', ');
  const brand = BUSINESS_EN.brand;
  const phone = BUSINESS.phones[0]!;

  if (kind === 'order_placed') {
    const lines: Array<[string, string]> = o.items.map((i) => [`${i.nameSnapshot}${i.quantityMilli !== 1000 ? ` × ${i.quantityMilli / 1000}` : ''}`, uah(i.totalMinor)]);
    const sums: Array<[string, string]> = [
      ...(o.discountMinor > 0 ? [['Discount', `−${uah(o.discountMinor)}`] as [string, string]] : []),
      ...(o.shippingMinor !== null ? [['Delivery', o.shippingMinor === 0 ? 'free' : uah(o.shippingMinor)] as [string, string]] : []),
      ['Total', uah(o.totalMinor)],
    ];
    const iban: Array<[string, string]> = pay === 'IBAN' && o.totalMinor !== null
      ? [['Recipient', BUSINESS.legalEntityName], ['Taxpayer number (RNOKPP)', BUSINESS.legalId], ['IBAN', BUSINESS.iban], ['Amount', uah(o.totalMinor)], ['Payment reference (write it exactly like this)', `Оплата замовлення № ${o.number}, без ПДВ`]]
      : [];
    const next = pay === 'IBAN' ? 'We will send your order as soon as the payment reaches our account.'
      : pay === 'CARD' && o.paymentStatus !== 'PAID' ? 'You can pay on the order page.'
      : 'We will call you to confirm the order.';
    const html = layout('Thank you for your order!', [
      p(`${esc(hello)}we have received your order <b style="white-space:nowrap">${esc(o.number)}</b>. ${esc(next)}`),
      rows(lines), rows(sums),
      p(`<b>Delivery:</b> ${esc(where || '—')}<br><b>Payment:</b> ${esc(PAY_EN[pay] ?? '')}`),
      ...(iban.length ? [p('<b>Bank details for payment</b>'), rows(iban)] : []),
      p(`The order status, payment and receipt are on the order page. Questions? ${esc(phone)}.`),
    ], { href: link, label: 'Order page' }, 'en');
    const text = [`${hello}we have received your order ${o.number}. ${next}`, '', textRows(lines), textRows(sums), '', `Delivery: ${where}`, `Payment: ${PAY_EN[pay] ?? ''}`,
      ...(iban.length ? ['', 'Bank details for payment:', textRows(iban)] : []), '', `Order page: ${link}`, `Questions? ${phone}`].join('\n');
    return { to: o.email!, subject: `Order ${o.number} received — ${brand}`, html, text };
  }

  if (kind === 'order_paid') {
    const html = layout('Payment received', [
      p(`${esc(hello)}thank you! We have received the payment for order <b>${esc(o.number)}</b>.`),
      p('The fiscal receipt is on the order page, where you can also see when we send the parcel.'),
    ], { href: link, label: 'Receipt and order status' }, 'en');
    return { to: o.email!, subject: `Payment for order ${o.number} received — ${brand}`, html, text: `${hello}we have received the payment for order ${o.number}.\nReceipt and status: ${link}` };
  }

  const ttn: Array<[string, string]> = o.trackingNumber ? [['Tracking number', o.trackingNumber]] : [];
  const html = layout('Your order is on its way', [
    p(`${esc(hello)}your order <b>${esc(o.number)}</b> is on its way.`),
    ...(ttn.length ? [rows(ttn), p('You can track the parcel by this number on the carrier’s website or app.')] : []),
    p(`<b>Delivery:</b> ${esc(where || '—')}`),
  ], { href: link, label: 'Order page' }, 'en');
  return { to: o.email!, subject: `Order ${o.number} has been sent — ${brand}`, html, text: [`${hello}your order ${o.number} has been sent.`, textRows(ttn), `Delivery: ${where}`, `Order page: ${link}`].filter(Boolean).join('\n') };
}
