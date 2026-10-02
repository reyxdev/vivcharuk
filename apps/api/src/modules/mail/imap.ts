import { ImapFlow } from 'imapflow';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
import { ingestRaw } from './ingest';

// Round 19 D1: the panel reads info@ from the Porkbun mailbox. One long-lived connection waits on
// INBOX (IMAP IDLE) and pulls new mail within seconds; every 5 minutes INBOX and Sent are checked in
// full, which also brings in letters Іван sent from webmail. The mailbox is never modified except
// for the \Seen flag and replies appended to Sent: the panel deletes nothing there (D1 #3).

export const mailSyncEnabled = () => !!config.mailbox.password;

const status = { connected: false, lastSyncAt: null as Date | null, lastError: null as string | null, importing: false };
export const mailSyncStatus = () => ({ enabled: mailSyncEnabled(), ...status, lastSyncAt: status.lastSyncAt?.toISOString() ?? null });

const client = () => new ImapFlow({
  host: config.mailbox.imap.host, port: config.mailbox.imap.port, secure: config.mailbox.imap.port === 993,
  auth: { user: config.mailbox.address, pass: config.mailbox.password }, logger: false,
});

/** A short-lived connection for one job, so the waiting INBOX connection is never interrupted. */
export async function withImap<T>(fn: (c: ImapFlow) => Promise<T>): Promise<T> {
  const c = client();
  await c.connect();
  try { return await fn(c); } finally { await c.logout().catch(() => c.close()); }
}

let sentPath: string | null = null;
async function findSent(c: ImapFlow) {
  if (sentPath) return sentPath;
  const list = await c.list();
  sentPath = list.find((m) => m.specialUse === '\\Sent')?.path ?? list.find((m) => /(^|\.|\/)sent$/i.test(m.path))?.path ?? null;
  return sentPath;
}

type FolderState = { uidValidity: string; lastUid: number };
const stateKey = (folder: string) => `mail.imap.state.${folder}`;

async function syncFolder(c: ImapFlow, folder: string) {
  const lock = await c.getMailboxLock(folder, { readOnly: true });
  try {
    const box = c.mailbox;
    if (!box) return 0;
    const row = await prisma.setting.findUnique({ where: { key: stateKey(folder) } });
    let st = (row?.value as FolderState | undefined) ?? { uidValidity: '', lastUid: 0 };
    if (st.uidValidity !== String(box.uidValidity)) {
      // The server renumbered the folder: forget the old numbers; stored letters are matched again by Message-ID.
      await prisma.mailMessage.updateMany({ where: { imapFolder: folder }, data: { imapUid: null } });
      st = { uidValidity: String(box.uidValidity), lastUid: 0 };
    }
    if (box.exists === 0) return 0;
    let n = 0;
    status.importing = st.lastUid === 0;
    for await (const m of c.fetch(`${st.lastUid + 1}:*`, { uid: true, source: true }, { uid: true })) {
      if (m.uid <= st.lastUid || !m.source) continue;
      try {
        const r = await ingestRaw(m.source, { folder, uid: m.uid });
        if (r.stored) n++;
      } catch (e) {
        status.lastError = `${folder} #${m.uid}: ${(e as Error).message}`;
      }
      st.lastUid = m.uid;
      await prisma.setting.upsert({ where: { key: stateKey(folder) }, update: { value: st }, create: { key: stateKey(folder), value: st } });
    }
    return n;
  } finally {
    status.importing = false;
    lock.release();
  }
}

let running: Promise<void> | null = null;
/** INBOX and Sent, one pass. Concurrent calls share the pass in progress. */
export function syncNow() {
  if (!mailSyncEnabled()) return Promise.resolve();
  running ??= withImap(async (c) => {
    await syncFolder(c, 'INBOX');
    const sent = await findSent(c);
    if (sent) await syncFolder(c, sent);
    status.lastSyncAt = new Date();
    status.lastError = null;
  }).catch((e: Error) => { status.lastError = e.message; }).finally(() => { running = null; });
  return running;
}

/** Read in the panel = read in the mailbox (round 19 D1 #25). */
export async function markSeen(refs: Array<{ imapFolder: string | null; imapUid: number | null }>) {
  if (!mailSyncEnabled()) return;
  const byFolder = new Map<string, number[]>();
  for (const r of refs) if (r.imapFolder && r.imapUid) byFolder.set(r.imapFolder, [...(byFolder.get(r.imapFolder) ?? []), r.imapUid]);
  if (!byFolder.size) return;
  await withImap(async (c) => {
    for (const [folder, uids] of byFolder) {
      const lock = await c.getMailboxLock(folder);
      try { await c.messageFlagsAdd(uids, ['\\Seen'], { uid: true }); } finally { lock.release(); }
    }
  });
}

/** A reply sent from the panel also appears in the mailbox's Sent folder. */
export async function appendToSent(raw: Buffer) {
  if (!mailSyncEnabled()) return;
  await withImap(async (c) => {
    const sent = await findSent(c);
    if (sent) await c.append(sent, raw, ['\\Seen']);
  });
}

/** The waiting connection: IDLE on INBOX, reconnecting with a growing pause after failures. */
export function startMailSync(log: (msg: string) => void) {
  if (!mailSyncEnabled()) { log('mail: off (no MAILBOX_PASSWORD)'); return; }
  let delay = 5_000;
  const loop = async () => {
    const c = client();
    c.on('error', (e: Error) => { status.lastError = e.message; });
    try {
      await c.connect();
      status.connected = true;
      delay = 5_000;
      log(`mail: connected to ${config.mailbox.imap.host} as ${config.mailbox.address}`);
      await syncNow();
      c.on('exists', () => { void syncNow(); });
      await c.mailboxOpen('INBOX', { readOnly: true });
      await new Promise<void>((resolve) => c.on('close', () => resolve()));
    } catch (e) {
      status.lastError = (e as Error).message;
    }
    status.connected = false;
    setTimeout(loop, delay);
    delay = Math.min(delay * 2, 300_000);
  };
  void loop();
  setInterval(() => { void syncNow(); }, 5 * 60_000).unref();
}
