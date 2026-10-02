import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
import { audit } from '../audit/audit.service';
import { resolvePermissions } from '../auth/permissions';
import { BUSINESS } from '@vivcharyk/schemas';
import { KINDS, orderButtons, photoJpeg, quietNow } from './notices';
import { kyivBounds } from '../stock/shop-sales.service';

/**
 * Personal Telegram notifications (2026-10-02; docs/00-client-decisions-21.md).
 *
 * Only the owner, and the people the owner allows in «Співробітники», receive notices. Linking:
 *  - one tap: the panel gives a link t.me/<bot>?start=<token> (a QR on a computer); the bot asks
 *    «Підключити цей Telegram до <ім'я>?» [Так, це я] [Ні] (T01, T03);
 *  - fallback: a 6-digit code typed into the bot (T02).
 * Both live 10 minutes, work once and are stored only as HMACs; wrong codes are limited per chat and for
 * the whole bot. The bot answers private chats only and tells strangers nothing but the shop's site (T12).
 * It is read by long polling, so it needs no public URL.
 */

const API = () => `https://api.telegram.org/bot${config.telegram.botToken}`;
export const telegramConfigured = () => !!config.telegram.botToken;

type TgError = Error & { code?: number };
export async function call<T>(method: string, body: object | FormData): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${API()}/${method}`, { method: 'POST', ...(isForm ? { body } : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }) });
  const j = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; error_code?: number; description?: string };
  if (!j.ok) throw Object.assign(new Error(`telegram ${method}: ${j.error_code ?? res.status} ${j.description ?? ''}`), { code: j.error_code ?? res.status }) as TgError;
  return j.result as T;
}

let botName: string | null = null;
let botError: string | null = null;
export const botUsername = () => botName;
export const botHealth = () => ({ configured: telegramConfigured(), username: botName, error: botError });

const markup = (buttons?: Array<Array<{ text: string; url?: string; callback_data?: string }>> | null) => (buttons?.length ? { inline_keyboard: buttons } : undefined);

export async function sendTo(chatId: string, html: string, opts: { buttons?: Array<Array<{ text: string; url?: string; callback_data?: string }>> | null; silent?: boolean } = {}) {
  return call<{ message_id: number }>('sendMessage', { chat_id: chatId, text: html, parse_mode: 'HTML', disable_web_page_preview: true, disable_notification: opts.silent ?? quietNow(), reply_markup: markup(opts.buttons) });
}

const unlinkFields = { telegramChatId: null, telegramUsername: null, telegramLinkedAt: null } as const;

/** Job «telegram.send»: one notice to one person. 403 = they blocked the bot: unlink, don't retry (T42). */
export async function deliver(j: { staffId: string; chatId: string; html: string; buttons: Array<Array<{ text: string; url: string }>> | null; photo: string | null; orderId: string | null }) {
  const still = await prisma.staffUser.findUnique({ where: { id: j.staffId }, select: { telegramChatId: true, status: true } });
  if (!still || still.telegramChatId !== j.chatId || still.status !== 'ACTIVE') return;
  try {
    let messageId: number;
    let hasPhoto = false;
    const jpeg = j.photo ? await photoJpeg(j.photo) : null;
    if (jpeg && j.html.length <= 1000) {
      const f = new FormData();
      f.set('chat_id', j.chatId); f.set('caption', j.html); f.set('parse_mode', 'HTML'); f.set('disable_notification', String(quietNow()));
      if (j.buttons) f.set('reply_markup', JSON.stringify(markup(j.buttons)));
      f.set('photo', new Blob([new Uint8Array(jpeg)], { type: 'image/jpeg' }), 'photo.jpg');
      messageId = (await call<{ message_id: number }>('sendPhoto', f)).message_id;
      hasPhoto = true;
    } else {
      messageId = (await sendTo(j.chatId, j.html, { buttons: j.buttons })).message_id;
    }
    await prisma.staffUser.update({ where: { id: j.staffId }, data: { telegramLastSentAt: new Date() } });
    if (j.orderId) await prisma.telegramMessage.create({ data: { chatId: j.chatId, messageId, orderId: j.orderId, hasPhoto, text: j.html } });
  } catch (e) {
    if ((e as TgError).code === 403) { await prisma.staffUser.updateMany({ where: { id: j.staffId, telegramChatId: j.chatId }, data: unlinkFields }); return; }
    throw e;
  }
}

/** Job «telegram.edit»: writes a status line under every notice of an order sent in the last week (T28–T29). */
export async function appendOrderLine(j: { orderId: string; line: string }) {
  const order = await prisma.order.findUnique({ where: { id: j.orderId }, select: { number: true } });
  if (!order) return;
  const rows = await prisma.telegramMessage.findMany({ where: { orderId: j.orderId, createdAt: { gt: new Date(Date.now() - 7 * 86_400_000) } } });
  for (const r of rows) {
    if (r.text.includes(j.line)) continue;
    const text = `${r.text}\n${j.line}`;
    try {
      await call(r.hasPhoto ? 'editMessageCaption' : 'editMessageText', {
        chat_id: r.chatId, message_id: r.messageId, parse_mode: 'HTML', ...(r.hasPhoto ? { caption: text } : { text, disable_web_page_preview: true }),
        reply_markup: markup(orderButtons(order.number)),
      });
      await prisma.telegramMessage.update({ where: { id: r.id }, data: { text } });
    } catch (e) {
      // Deleted by the person, too old, or the chat is gone: nothing to update.
      if (![400, 403].includes((e as TgError).code ?? 0)) throw e;
    }
  }
}

const isOwner = async (staffUserId: string) => (await prisma.staffRoleAssignment.count({ where: { staffUserId, role: { key: 'owner' } } })) > 0;
export const telegramAllowedFor = async (u: { id: string; telegramAllowed: boolean }) => u.telegramAllowed || isOwner(u.id);

/* ---------- one-time link (token for one tap, 6 digits as fallback) ---------- */

const TTL_MS = 10 * 60_000;
const hmac = (kind: string, v: string) => createHmac('sha256', config.jwt.staffTokenSecret).update(`telegram-${kind}:${v}`).digest('hex');

export async function issueLink(staffUserId: string) {
  const token = randomBytes(18).toString('base64url'); // 24 chars, fits Telegram's start parameter
  for (let i = 0; i < 5; i++) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const data = { codeHash: hmac('code', code), tokenHash: hmac('token', token), expiresAt: new Date(Date.now() + TTL_MS), createdAt: new Date() };
    try {
      await prisma.telegramLinkCode.upsert({ where: { staffUserId }, update: data, create: { staffUserId, ...data } });
      return { code, token, expiresAt: data.expiresAt.toISOString(), url: botName ? `https://t.me/${botName}?start=${token}` : null };
    } catch { /* another live code has the same digits: draw again */ }
  }
  throw new Error('could not issue a code');
}
/** Kept for the code-only callers. */
export const issueLinkCode = async (staffUserId: string) => { const l = await issueLink(staffUserId); return { code: l.code, expiresAt: l.expiresAt }; };

export async function unlinkTelegram(staffUserId: string) {
  await prisma.$transaction([
    prisma.staffUser.update({ where: { id: staffUserId }, data: unlinkFields }),
    prisma.telegramLinkCode.deleteMany({ where: { staffUserId } }),
  ]);
}

async function staffForLink(where: { codeHash: string } | { tokenHash: string }) {
  const row = await prisma.telegramLinkCode.findUnique({ where: where as { codeHash: string } });
  if (!row || row.expiresAt <= new Date()) return null;
  const staff = await prisma.staffUser.findUnique({ where: { id: row.staffUserId }, select: { id: true, firstName: true, lastName: true, email: true, status: true, telegramAllowed: true, permVersion: true } });
  if (!staff || staff.status !== 'ACTIVE' || !(await telegramAllowedFor(staff))) return null;
  return staff;
}

/* ---------- the bot ---------- */

// Wrong codes and links: 5 per chat per 15 minutes, 30 per minute for the whole bot.
const perChat = new Map<string, number[]>();
let global: number[] = [];
function limited(chatId: string) {
  const now = Date.now();
  const mine = (perChat.get(chatId) ?? []).filter((t) => now - t < 15 * 60_000);
  global = global.filter((t) => now - t < 60_000);
  perChat.set(chatId, mine);
  return mine.length >= 5 || global.length >= 30;
}
const failed = (chatId: string) => { const now = Date.now(); perChat.set(chatId, [...(perChat.get(chatId) ?? []), now]); global.push(now); };

const STRANGER = `Це службовий бот магазину «${BUSINESS.brand}». Покупцям — сайт https://${BUSINESS.domain}`;
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

async function linkChat(chatId: string, username: string | undefined, staff: { id: string; firstName: string; email: string; permVersion: number }) {
  await prisma.$transaction([
    // One chat belongs to one person (T11): a chat linked to someone else is moved.
    prisma.staffUser.updateMany({ where: { telegramChatId: chatId, NOT: { id: staff.id } }, data: unlinkFields }),
    prisma.staffUser.update({ where: { id: staff.id }, data: { telegramChatId: chatId, telegramUsername: username ?? null, telegramLinkedAt: new Date() } }),
    prisma.telegramLinkCode.deleteMany({ where: { staffUserId: staff.id } }),
  ]);
  await audit({ actorId: staff.id, actorEmail: staff.email, action: 'staff.telegram_linked', resourceType: 'StaffUser', resourceId: staff.id, resourceLabel: username ? `@${username}` : null });
  // T39: what will come and how to switch it off; T40: an example of a new-order notice.
  const perms = await resolvePermissions(staff.id, staff.permVersion);
  const owner = await isOwner(staff.id);
  const tech = (await prisma.staffRoleAssignment.count({ where: { staffUserId: staff.id, role: { key: 'tech' } } })) > 0;
  const kinds = Object.values(KINDS).filter((k) => (k.perm === 'tech' ? tech : k.perm === 'owner' ? owner : k.perm === 'self' ? true : perms.has(k.perm))).map((k) => `• ${k.label}`);
  await sendTo(chatId, `🎉 <b>Готово, ${esc(staff.firstName)}!</b> Сповіщення панелі приходитимуть сюди.\n\nЩо надходитиме:\n${kinds.join('\n')}\n\nЗайве вимикається галочками в панелі: «Пароль і вхід» → Telegram. Вночі (22:00–08:00) і на вихідних — без звуку.`, { silent: false });
  if (perms.has('orders.read')) {
    await sendTo(chatId, ['<i>Приклад — так виглядатиме нове замовлення:</i>', '', '🛍 <b>Нове замовлення VCH-26-0012</b>', '💰 2 400 ₴ · 💳 передоплата', '📦 Плед «Полонина» 150×200 × 1', '🚚 Нова пошта, відділення · 📍 Косів', '📞 +380 67 000 00 00'].join('\n'), { silent: true });
  }
}

interface Msg { chat: { id: number; type: string }; from?: { username?: string }; text?: string }
interface Callback { id: string; data?: string; from: { username?: string }; message?: { chat: { id: number; type: string }; message_id: number } }
interface Update { update_id: number; message?: Msg; callback_query?: Callback }

async function linkedStaff(chatId: string) {
  return prisma.staffUser.findUnique({ where: { telegramChatId: chatId }, select: { id: true, firstName: true, email: true, status: true, permVersion: true } });
}

export async function onMessage(m: Msg) {
  if (m.chat.type !== 'private') return; // groups and channels are ignored
  const chatId = String(m.chat.id);
  const text = (m.text ?? '').trim();
  const me = await linkedStaff(chatId);

  // One tap: /start <token> → confirm with buttons (T01).
  const start = text.match(/^\/start(?:\s+([A-Za-z0-9_-]{16,64}))?$/);
  if (start?.[1]) {
    if (limited(chatId)) { await sendTo(chatId, 'Забагато спроб. Спробуйте через 15 хвилин.'); return; }
    const staff = await staffForLink({ tokenHash: hmac('token', start[1]) });
    if (!staff) { failed(chatId); await sendTo(chatId, 'Посилання не діє або вже прострочене. Відкрийте нове в панелі — воно діє 10 хвилин.'); return; }
    await sendTo(chatId, `Підключити цей Telegram до панелі «${BUSINESS.brand}» як <b>${esc(`${staff.firstName} ${staff.lastName}`)}</b>?`, {
      silent: false,
      buttons: [[{ text: '✅ Так, це я', callback_data: `link:${start[1]}` }, { text: 'Ні', callback_data: 'nolink' }]],
    });
    return;
  }
  if (/^\/stop\b/.test(text)) {
    if (me) {
      await unlinkTelegram(me.id);
      await audit({ actorId: me.id, actorEmail: me.email, action: 'staff.telegram_unlinked', resourceType: 'StaffUser', resourceId: me.id });
      await sendTo(chatId, 'Сповіщення вимкнено. Щоб увімкнути знову — «Пароль і вхід» → Telegram у панелі.');
    } else await sendTo(chatId, STRANGER);
    return;
  }
  // Fallback: 6 digits typed in (T02).
  const digits = text.replace(/\s/g, '');
  if (/^\d{6}$/.test(digits)) {
    if (limited(chatId)) { await sendTo(chatId, 'Забагато спроб. Спробуйте через 15 хвилин.'); return; }
    const staff = await staffForLink({ codeHash: hmac('code', digits) });
    if (!staff) { failed(chatId); await sendTo(chatId, 'Код не підходить або вже прострочений. Візьміть новий у панелі — він діє 10 хвилин.'); return; }
    await linkChat(chatId, m.from?.username, staff);
    return;
  }
  if (!me || me.status !== 'ACTIVE') { await sendTo(chatId, STRANGER); return; }

  // Commands for linked staff (T15). Actions stay in the panel (T18).
  const perms = await resolvePermissions(me.id, me.permVersion);
  if (/^\/(today|start)\b/.test(text)) { await sendTo(chatId, await todayText(me.firstName, perms)); return; }
  if (/^\/orders\b/.test(text)) { await sendTo(chatId, await ordersText(perms)); return; }
  if (/^\/settings\b/.test(text)) { await sendTo(chatId, 'Що надсилати — галочками в панелі:', { buttons: [[{ text: 'Відкрити налаштування', url: `${config.adminUrl}/account#telegram` }]] }); return; }
  if (/^\/panel\b/.test(text)) { await sendTo(chatId, 'Панель керування:', { buttons: [[{ text: 'Відкрити панель', url: `${config.adminUrl}/` }]] }); return; }
  await sendTo(chatId, `Ви підключені як ${esc(me.firstName)}. Команди — у меню ☰ ліворуч від поля вводу.`);
}

export async function onCallback(q: Callback) {
  const chat = q.message?.chat;
  await call('answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);
  if (!chat || chat.type !== 'private' || !q.message) return;
  const chatId = String(chat.id);
  const clear = () => call('editMessageReplyMarkup', { chat_id: chatId, message_id: q.message!.message_id, reply_markup: { inline_keyboard: [] } }).catch(() => undefined);
  if (q.data === 'nolink') { await clear(); await sendTo(chatId, 'Добре, нічого не змінено.'); return; }
  const token = q.data?.match(/^link:([A-Za-z0-9_-]{16,64})$/)?.[1];
  if (!token) return;
  await clear();
  const staff = await staffForLink({ tokenHash: hmac('token', token) });
  if (!staff) { await sendTo(chatId, 'Посилання вже не діє. Відкрийте нове в панелі.'); return; }
  await linkChat(chatId, q.from.username, staff);
}

async function todayText(name: string, perms: Set<string>) {
  if (!perms.has('orders.read')) return `Вітаю, ${esc(name)}! Сповіщення приходять сюди.`;
  const start = (await kyivBounds()).today;
  const [placed, waiting, toShip, quick] = await Promise.all([
    prisma.order.count({ where: { placedAt: { gte: start } } }),
    prisma.order.count({ where: { status: 'PENDING', confirmedByCallAt: null } }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PACKING'] }, trackingNumber: null } }),
    prisma.quickOrderRequest.count({ where: { status: 'NEW' } }),
  ]);
  return [`☀️ <b>Сьогодні</b>`, `🛍 Нових замовлень: ${placed}`, `📞 Чекають дзвінка: ${waiting}${quick ? ` · «1 клік»: ${quick}` : ''}`, `📦 Відправити: ${toShip}`].join('\n');
}

async function ordersText(perms: Set<string>) {
  if (!perms.has('orders.read')) return 'Замовлення вам недоступні.';
  const rows = await prisma.order.findMany({ where: { status: 'PENDING' }, orderBy: { placedAt: 'desc' }, take: 10, select: { number: true, totalMinor: true, phone: true, shippingAddress: true } });
  if (!rows.length) return 'Нових замовлень немає 🙂';
  return ['🛍 <b>Нові замовлення</b>', ...rows.map((o) => `• <a href="${config.adminUrl}/orders/${o.number}">${o.number}</a> · ${o.totalMinor == null ? '—' : `${new Intl.NumberFormat('uk-UA').format(Math.round(o.totalMinor / 100))} ₴`} · ${esc(((o.shippingAddress ?? {}) as { city?: string }).city ?? '')} · ${esc(o.phone)}`)].join('\n');
}

/** T13–T15: description and the ☰ menu, set from here at start. */
async function setupProfile() {
  const about = `Службовий бот сповіщень панелі «${BUSINESS.brand}». Покупцям — сайт ${BUSINESS.domain}`;
  await call('setMyDescription', { description: about }).catch(() => undefined);
  await call('setMyShortDescription', { short_description: about.slice(0, 120) }).catch(() => undefined);
  await call('setMyCommands', { commands: [
    { command: 'today', description: 'Що сьогодні' },
    { command: 'orders', description: 'Нові замовлення' },
    { command: 'settings', description: 'Що надсилати' },
    { command: 'panel', description: 'Відкрити панель' },
  ] }).catch(() => undefined);
}

/** Long polling: one poller in the process that runs the jobs. */
export function startTelegramBot(log: (msg: string) => void) {
  if (!telegramConfigured()) { log('telegram: off (no TELEGRAM_BOT_TOKEN)'); return; }
  let offset = 0;
  let delay = 5_000;
  const loop = async () => {
    try {
      if (!botName) {
        botName = (await call<{ username: string }>('getMe', {})).username;
        await call('deleteWebhook', { drop_pending_updates: false }).catch(() => undefined);
        await setupProfile();
        log(`telegram: bot @${botName} ready`);
      }
      const updates = await call<Update[]>('getUpdates', { offset, timeout: 50, allowed_updates: ['message', 'callback_query'] });
      botError = null;
      for (const u of updates) {
        offset = u.update_id + 1;
        if (u.message) await onMessage(u.message).catch((e: Error) => log(`telegram: ${e.message}`));
        if (u.callback_query) await onCallback(u.callback_query).catch((e: Error) => log(`telegram: ${e.message}`));
      }
      delay = 5_000;
      setImmediate(loop);
    } catch (e) {
      botError = (e as Error).message;
      log(`telegram: ${botError}`);
      setTimeout(loop, delay);
      delay = Math.min(delay * 2, 300_000);
    }
  };
  void loop();
}
