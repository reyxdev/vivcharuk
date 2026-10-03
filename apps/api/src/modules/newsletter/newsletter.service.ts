import type { Locale, Prisma } from '@prisma/client';
import { BUSINESS, BUSINESS_EN, NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_TEXT_EN } from '@vivcharyk/schemas';
import { config } from '../../config';
import { randomToken } from '../../lib/crypto';
import { enqueue } from '../../lib/jobs';
import { type Mail } from '../../lib/mail';
import { prisma } from '../../lib/prisma';
import { layout, mailLang, p } from '../notifications/orderMail';

// Round 19 D2: newsletter consent. Ticking the checkout box sends a confirmation letter; only the
// click subscribes (double opt-in). Every letter carries a one-click unsubscribe. After unsubscribing
// the address stays as a «do not write» entry and is never re-subscribed without a new consent.

const PAGE = { uk: 'rozsylka', en: 'newsletter', pl: 'newsletter', de: 'newsletter' } as const;
export const newsletterPage = (locale: Locale, q: string) => `${config.siteUrl}/${locale}/${PAGE[locale] ?? PAGE.uk}?${q}`;
export const unsubscribeApi = (token: string) => `${config.siteUrl}/api/v1/newsletter/unsubscribe?token=${token}`;

/** Called inside the checkout transaction when the box was ticked and an e-mail given. */
export async function requestConsent(email: string, locale: Locale, source: { kind: 'checkout'; orderId: string } | { kind: 'manual'; note: string; staffId: string }, tx: Prisma.TransactionClient) {
  const address = email.trim().toLowerCase();
  const existing = await tx.subscriber.findUnique({ where: { email: address } });
  if (existing?.status === 'CONFIRMED') return existing;
  const confirmToken = randomToken();
  const row = await tx.subscriber.upsert({
    where: { email: address },
    update: { status: 'PENDING', confirmToken, consentAt: new Date(), consentText: source.kind === 'checkout' ? (locale === 'uk' ? NEWSLETTER_CONSENT_TEXT : NEWSLETTER_CONSENT_TEXT_EN) : source.note, source: source.kind, unsubscribedAt: null, bounceCount: 0, ...(source.kind === 'checkout' ? { orderId: source.orderId } : { createdById: source.staffId }) },
    create: {
      email: address, locale, status: 'PENDING', confirmToken, unsubToken: randomToken(), consentAt: new Date(), source: source.kind,
      consentText: source.kind === 'checkout' ? (locale === 'uk' ? NEWSLETTER_CONSENT_TEXT : NEWSLETTER_CONSENT_TEXT_EN) : source.note,
      ...(source.kind === 'checkout' ? { orderId: source.orderId } : { createdById: source.staffId }),
    },
  });
  await enqueue('newsletter.mail', { kind: 'confirm', subscriberId: row.id }, tx);
  return row;
}

export async function confirm(token: string) {
  const s = await prisma.subscriber.findUnique({ where: { confirmToken: token } });
  if (!s) return 'invalid' as const;
  if (s.status === 'CONFIRMED') return 'confirmed' as const;
  if (s.status !== 'PENDING') return 'invalid' as const;
  await prisma.$transaction(async (tx) => {
    await tx.subscriber.update({ where: { id: s.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
    await enqueue('newsletter.mail', { kind: 'welcome', subscriberId: s.id }, tx);
    await enqueue('notify.telegram', { kind: 'subscriber' }, tx); // T22: to the owner
  });
  return 'confirmed' as const;
}

export async function unsubscribe(token: string) {
  const s = await prisma.subscriber.findUnique({ where: { unsubToken: token } });
  if (!s) return 'invalid' as const;
  if (s.status !== 'UNSUBSCRIBED') {
    // Only the address is kept, as «do not write» (D2): consent details and the order link go.
    await prisma.subscriber.update({ where: { id: s.id }, data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date(), confirmToken: null, consentText: null, orderId: null } });
  }
  return 'unsubscribed' as const;
}

/** List-Unsubscribe headers (RFC 2369, RFC 8058 one-click) for every newsletter letter. */
export const unsubscribeHeaders = (token: string) => ({
  'List-Unsubscribe': `<${unsubscribeApi(token)}>, <mailto:${config.mailbox.address}?subject=unsubscribe>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});

export async function newsletterMail(kind: 'confirm' | 'welcome', subscriberId: string): Promise<Mail | null> {
  const s = await prisma.subscriber.findUnique({ where: { id: subscriberId } });
  if (!s) return null;
  const unsub = newsletterPage(s.locale, `unsubscribe=${s.unsubToken}`);
  const en = mailLang(s.locale) === 'en';
  if (kind === 'confirm') {
    if (s.status !== 'PENDING' || !s.confirmToken) return null;
    const link = newsletterPage(s.locale, `confirm=${s.confirmToken}`);
    // G093: a subscriber from the English site is written to in English.
    if (en) {
      const html = layout('Please confirm your subscription', [
        p('When ordering, you ticked that you would like e-mails about Vivcharyk offers and new pieces.'),
        p('To subscribe, press the button below. If it was not you, simply do nothing: without confirmation we will not send a single promotional e-mail.'),
      ], { href: link, label: 'Yes, subscribe me' }, 'en');
      return { to: s.email, subject: `Please confirm your subscription — ${BUSINESS_EN.brand}`, html, text: `To subscribe to e-mails about Vivcharyk offers and new pieces, open this link:
${link}

If it was not you, do nothing.` };
    }
    const html = layout('Підтвердіть підписку', [
      p('Ви позначили при замовленні, що хочете отримувати листи про акції та новинки Вівчарика.'),
      p('Щоб підписатися, натисніть кнопку нижче. Якщо це були не ви — просто нічого не робіть: без підтвердження ми не надішлемо жодного рекламного листа.'),
    ], { href: link, label: 'Так, підписатися' });
    return { to: s.email, subject: `Підтвердіть підписку — ${BUSINESS.brand}`, html, text: `Щоб підписатися на листи про акції та новинки Вівчарика, відкрийте посилання:\n${link}\n\nЯкщо це були не ви — нічого не робіть.` };
  }
  if (s.status !== 'CONFIRMED') return null;
  if (en) {
    const html = layout('Thank you for subscribing!', [
      p('From now on you will be the first to hear about our offers, discounts and new pieces from the workshop in Yavoriv village, Kosiv district.'),
      p('We write no more than once a week. You can unsubscribe at any time: the link is at the bottom of every e-mail.'),
      p(`<a href="${unsub}" style="color:#5E594F;font-size:13px">Unsubscribe from the newsletter</a>`),
    ], { href: `${config.siteUrl}/${s.locale}/`, label: 'Go to the catalogue' }, 'en');
    return {
      to: s.email, subject: 'You are subscribed to Vivcharyk news', html,
      text: `Thank you for subscribing to Vivcharyk e-mails. We write no more than once a week.\nUnsubscribe: ${unsub}`,
      from: `Ivan from Vivcharyk <${config.mailbox.address}>`, replyTo: config.mailbox.address, headers: unsubscribeHeaders(s.unsubToken),
    };
  }
  const html = layout('Дякуємо, що підписалися!', [
    p('Тепер ви першими дізнаватиметеся про наші акції, знижки й нові вироби з майстерні в Яворові.'),
    p('Пишемо не частіше одного разу на тиждень. Відписатися можна будь-коли — посилання є внизу кожного листа.'),
    p(`<a href="${unsub}" style="color:#5E594F;font-size:13px">Відписатися від розсилки</a>`),
  ], { href: `${config.siteUrl}/${s.locale}/`, label: 'До каталогу' });
  return {
    to: s.email, subject: 'Ви підписалися на новини Вівчарика', html,
    text: `Дякуємо, що підписалися на листи Вівчарика. Пишемо не частіше одного разу на тиждень.\nВідписатися: ${unsub}`,
    from: `Іван з Вівчарика <${config.mailbox.address}>`, replyTo: config.mailbox.address, headers: unsubscribeHeaders(s.unsubToken),
  };
}
