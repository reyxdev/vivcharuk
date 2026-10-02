import { api, fetchBlob } from '@/lib/api';

// «Пошта» (round 19 D1). Attachments need the panel's token, so they are fetched as blobs and shown
// through object URLs — never by a plain link.

export interface ThreadRow {
  id: string; subject: string; counterpartEmail: string; counterpartName: string | null; status: Status; labels: string[];
  lastMessageAt: string; orderNumber: string | null; deleted: boolean; unread: boolean; preview: string; lastFromUs: boolean;
  hasAttachments: boolean; suspicious: boolean; overdue: boolean; blocked: boolean; vip: boolean;
}
export type Status = 'OPEN' | 'WAITING' | 'CLOSED' | 'SPAM';
export interface SyncStatus { enabled: boolean; connected: boolean; lastSyncAt: string | null; lastError: string | null; importing: boolean }
export interface ThreadList { items: ThreadRow[]; total: number; pageSize: number; counts: Partial<Record<Status, number>>; unread: number; sync: SyncStatus }
export interface Attachment { id: string; filename: string; contentType: string; sizeBytes: number; contentId: string | null; isInline: boolean; riskFlag: string | null; viewable: boolean }
export interface Message {
  id: string; direction: 'INBOUND' | 'OUTBOUND'; kind: string; fromEmail: string; fromName: string | null; toEmails: string[]; ccEmails: string[];
  subject: string; textBody: string | null; html: string | null; occurredAt: string; sentBy: string | null; autoReply: boolean;
  verdict: { suspicious?: boolean; reasons?: string[] } | null; attachments: Attachment[];
}
export interface Thread {
  id: string; subject: string; counterpartEmail: string; counterpartName: string | null; status: Status; labels: string[]; deleted: boolean;
  order: { number: string; status: string; totalMinor: number | null; placedAt: string } | null;
  customerOrders: Array<{ number: string; status: string; totalMinor: number | null; placedAt: string }>;
  blocked: boolean; vip: boolean; draft: string; customerPhone: string | null;
  notes: Array<{ id: string; body: string; createdAt: string; author: string | null }>;
  messages: Message[];
}
export interface MailSettings {
  templates: Array<{ key: string; title: string; body: string }>;
  labels: Array<{ key: string; title: string; color: string }>;
  autoreply: { enabled: boolean; subject: string; body: string };
  sync: SyncStatus; maxAttachBytes: number;
}
export interface OutFile { filename: string; contentType: string; base64: string; size: number }

export const STATUS_TITLE: Record<Status, string> = { OPEN: 'Нове', WAITING: 'Відповіли', CLOSED: 'Закрито', SPAM: 'Спам' };

export const patchThread = (id: string, b: object) => api(`/admin/mail/threads/${id}`, { method: 'PATCH', body: JSON.stringify(b) });

const blobCache = new Map<string, Promise<string>>();
/** An object URL for an attachment, fetched once per page load. */
export function attachmentUrl(id: string) {
  let p = blobCache.get(id);
  if (!p) {
    p = fetchBlob(`/admin/mail/attachments/${id}`).then((b) => URL.createObjectURL(b));
    blobCache.set(id, p);
    p.catch(() => blobCache.delete(id));
  }
  return p;
}

export const fileToOut = (f: File) => new Promise<OutFile>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve({ filename: f.name, contentType: f.type || 'application/octet-stream', base64: String(r.result).split(',')[1] ?? '', size: f.size });
  r.onerror = () => reject(r.error);
  r.readAsDataURL(f);
});

export const kb = (n: number) => (n > 1_048_576 ? `${(n / 1_048_576).toFixed(1)} МБ` : `${Math.max(1, Math.round(n / 1024))} КБ`);
