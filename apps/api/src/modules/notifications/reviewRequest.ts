import { BUSINESS, BUSINESS_EN } from '@vivcharyk/schemas';
import { config } from '../../config';
import { sendMail, type Mail } from '../../lib/mail';
import { prisma } from '../../lib/prisma';
import { C, esc, layout, mailLang, p, type MailLang } from './orderMail';

// Round 19 D4 (D32): «Залиште відгук» — one letter per delivered order, 3 days after delivery, to a
// buyer who gave an e-mail. Service mail about their own order (no marketing consent), sent through
// the site mail in the order letters' layout. No discount, no tracking pixel. The OrderEvent
// 'review_requested' is written before sending and removed only if the send fails, so a letter goes
// out at most once per order.

export const REVIEW_REQUEST_EVENT = 'review_requested';
const DAY = 86_400_000;
const AFTER_DAYS = 3;
// A missed daily run still catches up; orders delivered long before this feature are never mailed.
const CATCH_UP_DAYS = 10;

/**
 * The storefront's review form is on the reviews page (POST /api/v1/reviews); product pages have no
 * form of their own yet. `?product=` names the product so the form can attach it (productSlug).
 */
export const reviewLink = (slug: string | null, lang: MailLang = 'uk') => `${config.siteUrl}/${lang === 'en' ? 'en/reviews' : 'uk/vidhuky'}${slug ? `?product=${encodeURIComponent(slug)}` : ''}`;

interface Plan { orderId: string; number: string; email: string; firstName: string | null; lang: MailLang; products: Array<{ id: string; name: string; slug: string }> }

/** Everything that decides whether this order gets the letter now; null = not (or not any more). */
export async function planFor(orderId: string, now: Date): Promise<Plan | null> {
  const o = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true, number: true, email: true, status: true, locale: true, deliveredAt: true, emailBouncedAt: true, placedAt: true, shippingAddress: true,
      events: { where: { type: REVIEW_REQUEST_EVENT }, select: { id: true }, take: 1 },
      items: { select: { variant: { select: { product: { select: { id: true, status: true, deletedAt: true, translations: { where: { locale: { in: ['uk', 'en'] } }, select: { locale: true, name: true, slug: true } } } } } } } },
    },
  });
  const email = o?.email?.trim().toLowerCase();
  if (!o || !email || o.status !== 'DELIVERED' || !o.deliveredAt || o.emailBouncedAt || o.events.length) return null;
  const age = now.getTime() - o.deliveredAt.getTime();
  if (age < AFTER_DAYS * DAY || age > CATCH_UP_DAYS * DAY) return null;

  const products = new Map<string, { id: string; name: string; slug: string }>();
  for (const i of o.items) {
    const pr = i.variant?.product;
    // G093: an English order names its products in English when they have an English name.
    const t = (mailLang(o.locale) === 'en' && pr?.translations.find((x) => x.locale === 'en')) || pr?.translations.find((x) => x.locale === 'uk');
    if (pr && t && pr.status === 'ACTIVE' && !pr.deletedAt) products.set(pr.id, { id: pr.id, name: t.name, slug: t.slug });
  }
  // Already reviewed by this buyer: those products drop out; a shop review written after this order
  // (the site's form makes those today) counts as having answered.
  const reviews = await prisma.review.findMany({
    where: { authorEmail: { equals: email, mode: 'insensitive' }, OR: [{ productId: { in: [...products.keys()] } }, { productId: null, createdAt: { gte: o.placedAt } }] },
    select: { productId: true },
  });
  if (reviews.some((r) => r.productId === null)) return null;
  const left = [...products.values()].filter((x) => !reviews.some((r) => r.productId === x.id));
  if (products.size && !left.length) return null;

  const firstName = ((o.shippingAddress ?? {}) as { firstName?: string }).firstName?.trim() || null;
  return { orderId: o.id, number: o.number, email, firstName, lang: mailLang(o.locale), products: left };
}

/** Orders due for the letter now (3–10 days after delivery, not yet asked). */
export async function dueReviewRequests(now = new Date()): Promise<string[]> {
  const rows = await prisma.order.findMany({
    where: {
      status: 'DELIVERED', email: { not: null }, emailBouncedAt: null,
      deliveredAt: { lte: new Date(now.getTime() - AFTER_DAYS * DAY), gte: new Date(now.getTime() - CATCH_UP_DAYS * DAY) },
      events: { none: { type: REVIEW_REQUEST_EVENT } },
    },
    orderBy: { deliveredAt: 'asc' }, select: { id: true },
  });
  const due: string[] = [];
  for (const r of rows) if (await planFor(r.id, now)) due.push(r.id);
  return due;
}

export function reviewRequestMail(plan: Plan): Mail {
  if (plan.lang === 'en') return reviewRequestMailEn(plan);
  const lead = plan.firstName ? `${plan.firstName}, кілька` : 'Кілька';
  const btn = (href: string) => `<a href="${esc(href)}" style="display:inline-block;background:${C.ink};color:#FFFBF4;text-decoration:none;font-weight:600;font-size:14px;padding:9px 14px;border-radius:8px">Залишити відгук</a>`;
  const list = plan.products.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line};margin:4px 0 16px">${plan.products
        .map((x) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};font-weight:600;vertical-align:middle">${esc(x.name)}</td><td align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${C.line};white-space:nowrap;vertical-align:middle">${btn(reviewLink(x.slug))}</td></tr>`)
        .join('')}</table>`
    : '';
  const html = layout('Як вам наші вироби?', [
    p(`${esc(lead)} днів тому ви отримали замовлення <b style="white-space:nowrap">${esc(plan.number)}</b>. Сподіваємося, усе до вподоби.`),
    p('Розкажіть, будь ласка, як вам покупка. Кілька слів допоможуть іншим обрати, а нам — робити ще краще.'),
    list,
    p(`Якщо щось не так — відповідайте на цей лист або телефонуйте ${esc(BUSINESS.phones[0]!)}, розберемося.`),
    `<p style="margin:0;font-size:13px;color:${C.muted}">Це єдиний такий лист щодо цього замовлення.</p>`,
  ], plan.products.length ? undefined : { href: reviewLink(null), label: 'Залишити відгук' });
  const text = [
    `${lead} днів тому ви отримали замовлення ${plan.number}. Сподіваємося, усе до вподоби.`,
    'Розкажіть, будь ласка, як вам покупка. Кілька слів допоможуть іншим обрати, а нам — робити ще краще.', '',
    ...(plan.products.length ? plan.products.map((x) => `${x.name} — ${reviewLink(x.slug)}`) : [`Залишити відгук: ${reviewLink(null)}`]), '',
    `Якщо щось не так — відповідайте на цей лист або телефонуйте ${BUSINESS.phones[0]}, розберемося.`,
    'Це єдиний такий лист щодо цього замовлення.',
  ].join('\n');
  return { to: plan.email, subject: `Як вам замовлення ${plan.number}? — ${BUSINESS.brand}`, html, text };
}

/** Sends the letter for one order if it is due; 'skipped' when it is not (or was already sent). */
export async function requestReview(orderId: string, now = new Date()): Promise<'sent' | 'skipped'> {
  const plan = await planFor(orderId, now);
  if (!plan) return 'skipped';
  const claim = await prisma.$transaction(async (tx) => {
    if (await tx.orderEvent.findFirst({ where: { orderId, type: REVIEW_REQUEST_EVENT }, select: { id: true } })) return null;
    return tx.orderEvent.create({ data: { orderId, type: REVIEW_REQUEST_EVENT, payload: { products: plan.products.map((x) => x.slug) } }, select: { id: true } });
  });
  if (!claim) return 'skipped';
  try {
    await sendMail(reviewRequestMail(plan));
  } catch (e) {
    await prisma.orderEvent.delete({ where: { id: claim.id } }); // not sent: the next run tries again
    throw e;
  }
  return 'sent';
}

/** The same letter in English (G093), for orders placed on the English site. */
function reviewRequestMailEn(plan: Plan): Mail {
  const link = (slug: string | null) => reviewLink(slug, 'en');
  const lead = plan.firstName ? `${plan.firstName}, a few` : 'A few';
  const btn = (href: string) => `<a href="${esc(href)}" style="display:inline-block;background:${C.ink};color:#FFFBF4;text-decoration:none;font-weight:600;font-size:14px;padding:9px 14px;border-radius:8px">Leave a review</a>`;
  const list = plan.products.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line};margin:4px 0 16px">${plan.products
        .map((x) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};font-weight:600;vertical-align:middle">${esc(x.name)}</td><td align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${C.line};white-space:nowrap;vertical-align:middle">${btn(link(x.slug))}</td></tr>`)
        .join('')}</table>`
    : '';
  const html = layout('How do you like our work?', [
    p(`${esc(lead)} days ago you received order <b style="white-space:nowrap">${esc(plan.number)}</b>. We hope you are happy with it.`),
    p('Please tell us what you think. A few words help other people choose, and help us do even better.'),
    list,
    p(`If anything is wrong, reply to this e-mail or call ${esc(BUSINESS.phones[0]!)} and we will sort it out.`),
    `<p style="margin:0;font-size:13px;color:${C.muted}">This is the only such e-mail about this order.</p>`,
  ], plan.products.length ? undefined : { href: link(null), label: 'Leave a review' }, 'en');
  const text = [
    `${lead} days ago you received order ${plan.number}. We hope you are happy with it.`,
    'Please tell us what you think. A few words help other people choose, and help us do even better.', '',
    ...(plan.products.length ? plan.products.map((x) => `${x.name} — ${link(x.slug)}`) : [`Leave a review: ${link(null)}`]), '',
    `If anything is wrong, reply to this e-mail or call ${BUSINESS.phones[0]} and we will sort it out.`,
    'This is the only such e-mail about this order.',
  ].join('\n');
  return { to: plan.email, subject: `How was order ${plan.number}? — ${BUSINESS_EN.brand}`, html, text };
}
