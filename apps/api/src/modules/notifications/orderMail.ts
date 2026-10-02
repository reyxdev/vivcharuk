import { BUSINESS } from '@vivcharyk/schemas';
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
const uah = (minor: number | null) => (minor === null ? '—' : `${new Intl.NumberFormat('uk-UA').format(Math.round(minor / 100))} ₴`);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const C = { ink: '#1F2A22', muted: '#5E594F', line: '#E2D3BE', page: '#F6EBDD', card: '#FFFBF4', accent: '#2F5D46' };

export function layout(title: string, blocks: string[], button?: { href: string; label: string }) {
  const btn = button
    ? `<p style="margin:24px 0 8px"><a href="${esc(button.href)}" style="display:inline-block;background:${C.ink};color:#FFFBF4;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px">${esc(button.label)}</a></p>`
    : '';
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:${C.page};font-family:Arial,Helvetica,sans-serif;color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td align="center" style="padding-bottom:12px"><img src="${config.siteUrl}/brand/logo-mail.png" width="96" height="79" alt="${esc(BUSINESS.brand)}" style="display:block;border:0"></td></tr>
<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:12px;padding:24px 22px;font-size:15px;line-height:1.55">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${esc(title)}</h1>
${blocks.join('\n')}${btn}
</td></tr>
<tr><td style="padding:16px 8px;font-size:12px;line-height:1.5;color:${C.muted};text-align:center">
${esc(BUSINESS.brand)} · ${esc(BUSINESS.legalEntityName)} · РНОКПП ${esc(BUSINESS.legalId)}<br>${esc(BUSINESS.factoryAddress)}<br>${esc(BUSINESS.phones[0]!)} · ${esc(BUSINESS.hoursText)}
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
