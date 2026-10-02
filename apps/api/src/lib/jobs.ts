import PgBoss from 'pg-boss';
import type { Prisma } from '@prisma/client';
import { config } from '../config';

// pg-boss on the existing Postgres (26 §26.17). Enqueueing inside a Prisma transaction uses that
// transaction's connection, so a job exists exactly when its order does.
export const boss = new PgBoss({ connectionString: config.db.url, schema: 'pgboss' });
let started: Promise<PgBoss> | null = null;
export const bossReady = () => (started ??= boss.start());

export type JobName =
  | 'notify.telegram' | 'orders.autoCancelUnpaid' | 'orders.unconfirmedReminder' | 'orders.productionDueSoon'
  | 'cart.expire' | 'quickOrders.purge' | 'reports.weekly' | 'posts.publishScheduled' | 'mail.send'
  | 'mail.autoReply' | 'mail.purge' | 'newsletter.mail'
  | 'telegram.send' | 'telegram.edit' | 'telegram.daily' | 'telegram.lowStock';

export async function enqueue(name: JobName, data: object, tx?: Prisma.TransactionClient, opts: { retryLimit?: number; retryDelay?: number } = {}) {
  await bossReady();
  const db = tx ? { executeSql: async (text: string, values: unknown[]) => ({ rows: await tx.$queryRawUnsafe<unknown[]>(text, ...values) }) } : undefined;
  return boss.send(name, data, { retryLimit: 3, retryBackoff: true, ...opts, ...(db ? { db } : {}) });
}
