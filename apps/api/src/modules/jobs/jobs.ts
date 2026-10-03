import type PgBoss from 'pg-boss';
import { config } from '../../config';
import { boss, bossReady, enqueue, type JobName } from '../../lib/jobs';
import { prisma } from '../../lib/prisma';
import { transition } from '../orders/admin-orders.service';
import { paymentKey } from '../orders/orders.service';
import { appendOrderLine, deliver } from '../notifications/telegram';
import { dispatch, type Notify } from '../notifications/notices';
import { workingMinutesBetween } from '../mail/hours';
import { publishDue } from '../blog/blog.service';
import { sendMail } from '../../lib/mail';
import { orderMail, type OrderMailKind } from '../notifications/orderMail';
import { sendAutoReply } from '../mail/send';
import { purgeThreads } from '../mail/mail.routes';
import { newsletterMail } from '../newsletter/newsletter.service';
import { dueReviewRequests, requestReview } from '../notifications/reviewRequest';
import { sendIndexNow } from '../seo/indexnow';

// Telegram notices: composed and fanned out in ../notifications/notices.ts (docs/00-client-decisions-21.md).
export type { Notify } from '../notifications/notices';
const SYSTEM = { id: null, email: 'system' };

async function each<T>(jobs: PgBoss.Job<T>[], fn: (data: T) => Promise<void>) { for (const j of jobs) await fn(j.data); }

const HANDLERS: Partial<Record<JobName, (jobs: PgBoss.Job<never>[]) => Promise<void>>> = {
  'notify.telegram': (jobs) => each(jobs as PgBoss.Job<Notify>[], async (n) => { await dispatch(n); }),
  // One notice to one person, retried for about an hour (T44).
  'telegram.send': (jobs) => each(jobs as PgBoss.Job<Parameters<typeof deliver>[0]>[], deliver),
  // A status line under an order's notices (T28–T29).
  'telegram.edit': (jobs) => each(jobs as PgBoss.Job<{ orderId: string; line: string }>[], appendOrderLine),
  // T32: a day's summary at 19:00 on working days (counts only, T33).
  'telegram.daily': async () => { await dispatch({ kind: 'daily' }); },
  // T22: products that ran down to 1 or 0 since the last check, once a day.
  'telegram.lowStock': async () => {
    const seen = new Set((await prisma.setting.findUnique({ where: { key: 'telegram.low_stock_seen' } }))?.value as string[] | undefined ?? []);
    const low = await prisma.$queryRaw<Array<{ id: string; name: string; stock: number }>>`
      SELECT v.id, coalesce(t.name, p.sku) AS name, v."stockQty" AS stock FROM "ProductVariant" v JOIN "Product" p ON p.id = v."productId"
      LEFT JOIN "ProductTranslation" t ON t."productId" = p.id AND t.locale = 'uk'
      WHERE v."isActive" AND v."deletedAt" IS NULL AND p.status = 'ACTIVE' AND p."deletedAt" IS NULL AND NOT p."isUniquePiece"
        AND v."madeToOrderDays" IS NULL AND v."stockQty" <= 1`;
    const fresh = low.filter((v) => !seen.has(v.id));
    await prisma.setting.upsert({ where: { key: 'telegram.low_stock_seen' }, update: { value: low.map((v) => v.id) }, create: { key: 'telegram.low_stock_seen', value: low.map((v) => v.id) } });
    if (fresh.length) await dispatch({ kind: 'low_stock', text: fresh.slice(0, 15).map((v) => `${v.name} — залишок ${v.stock}`).join('\n') + (fresh.length > 15 ? `\n…і ще ${fresh.length - 15}` : '') });
  },
  // T30: a new order nobody confirmed by call within 2 working hours, once.
  'orders.unconfirmedReminder': async () => {
    const rows = await prisma.order.findMany({
      where: { status: 'PENDING', confirmedByCallAt: null, placedAt: { lt: new Date(Date.now() - 2 * 3_600_000) }, events: { none: { type: 'unconfirmed_reminder' } } },
      select: { id: true, number: true, placedAt: true },
    });
    const due = rows.filter((o) => workingMinutesBetween(o.placedAt, new Date()) >= 120);
    if (!due.length) return;
    await prisma.orderEvent.createMany({ data: due.map((o) => ({ orderId: o.id, type: 'unconfirmed_reminder' })) });
    await dispatch({ kind: 'reminder', orderNumbers: due.map((o) => o.number) });
  },

  // Round 18: the buyer's e-mails (order received, paid, shipped). A failed send throws, so pg-boss retries.
  'mail.send': (jobs) => each(jobs as PgBoss.Job<{ kind: OrderMailKind; orderId: string }>[], async (j) => { const m = await orderMail(j.kind, j.orderId); if (m) await sendMail(m); }),

  // Round 10 part 6: card-payment orders unpaid three days after creation are cancelled and their stock returned.
  'orders.autoCancelUnpaid': async () => {
    const lapsed = await prisma.order.findMany({
      where: { status: 'PENDING', paymentMethod: 'CARD_ONLINE', paymentStatus: 'UNPAID', payments: { none: { status: 'PAID' } }, placedAt: { lt: new Date(Date.now() - 3 * 86_400_000) } },
      select: { number: true },
    });
    for (const o of lapsed) await transition(o.number, 'CANCELLED', SYSTEM, { reason: 'Не оплачено протягом 3 днів (автоматично)' });
  },

  // The fourteen-day build is the one promise with nobody else to blame (26 §26.17).
  'orders.productionDueSoon': async () => {
    const rows = await prisma.order.findMany({ where: { status: 'IN_PRODUCTION', expectedDispatchAt: { lt: new Date(Date.now() + 3 * 86_400_000) } }, orderBy: { expectedDispatchAt: 'asc' }, select: { number: true, expectedDispatchAt: true } });
    if (!rows.length) return;
    const d = (x: Date | null) => x?.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', timeZone: 'Europe/Kyiv' }) ?? '';
    await dispatch({ kind: 'production', text: `${rows.map((o) => `${o.number} — до ${d(o.expectedDispatchAt)}`).join('\n')}` });
  },

  'posts.publishScheduled': async () => { await publishDue(); },

  // Round 19 D2: the confirmation letter (double opt-in) and the welcome letter.
  'newsletter.mail': (jobs) => each(jobs as PgBoss.Job<{ kind: 'confirm' | 'welcome'; subscriberId: string }>[], async (j) => { const m = await newsletterMail(j.kind, j.subscriberId); if (m) await sendMail(m); }),

  // Round 19 D1 #39: out-of-hours auto-reply to a customer's letter.
  'mail.autoReply': (jobs) => each(jobs as PgBoss.Job<{ threadId: string }>[], async (j) => { await sendAutoReply(j.threadId); }),

  // Round 19 D1 #22–23: the bin is emptied after 30 days; conversations older than 3 years leave the panel
  // (the mailbox copy on Porkbun is untouched).
  'mail.purge': async () => {
    const old = await prisma.mailThread.findMany({
      where: { OR: [{ deletedAt: { lt: new Date(Date.now() - 30 * 86_400_000) } }, { lastMessageAt: { lt: new Date(Date.now() - 3 * 365 * 86_400_000) } }] },
      select: { id: true }, take: 500,
    });
    await purgeThreads(old.map((t) => t.id));
  },

  'cart.expire': async () => { await prisma.cart.deleteMany({ where: { expiresAt: { lt: new Date() } } }); },

  // 26 §26.17: requests closed more than eight months ago are deleted (personal data retention).
  // Round 24 G026: speed samples are kept 90 days.
  'quickOrders.purge': async () => {
    await prisma.quickOrderRequest.deleteMany({ where: { status: { in: ['CONVERTED', 'DECLINED', 'SPAM'] }, createdAt: { lt: new Date(Date.now() - 243 * 86_400_000) } } });
    await prisma.rumSample.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 90 * 86_400_000) } } });
  },

  // Round 24 G022: changed URLs to IndexNow (queued only in production with INDEXNOW_KEY set).
  'seo.indexnow': (jobs) => each(jobs as PgBoss.Job<{ paths: string[] }>[], async (j) => { await sendIndexNow(j.paths); }),

  // T31, T33: the week in counts, Monday 08:00.
  'reports.weekly': async () => { await dispatch({ kind: 'weekly' }); },

  // Round 19 D4: «Залиште відгук», once per order, 3 days after delivery (reviewRequest.ts).
  'reviews.requestAfterDelivery': async () => { for (const id of await dueReviewRequests()) await requestReview(id); },
};

const SCHEDULE: Array<[JobName, string]> = [
  ['orders.autoCancelUnpaid', '15 * * * *'],
  ['orders.productionDueSoon', '0 8 * * *'],
  ['cart.expire', '30 * * * *'],
  ['posts.publishScheduled', '*/5 * * * *'],
  ['quickOrders.purge', '0 3 * * *'],
  ['reports.weekly', '0 8 * * 1'],
  ['reviews.requestAfterDelivery', '0 10 * * *'],
  ['mail.purge', '20 3 * * *'],
  ['telegram.daily', '0 19 * * 1-5'],
  ['telegram.lowStock', '0 9 * * *'],
  ['orders.unconfirmedReminder', '*/15 * * * *'],
];

/** Workers run in the API process (26 §26.17); `ROLE=api` skips them, `ROLE=worker` runs only them. */
export async function startJobs(log: (msg: string) => void) {
  await bossReady();
  for (const name of Object.keys(HANDLERS) as JobName[]) {
    await boss.createQueue(name);
    await boss.work(name, HANDLERS[name]!);
  }
  for (const [name, cron] of SCHEDULE) await boss.schedule(name, cron, {}, { tz: 'Europe/Kyiv' });
  log(`jobs: ${Object.keys(HANDLERS).length} queues, ${SCHEDULE.length} schedules`);
}

export { enqueue };
