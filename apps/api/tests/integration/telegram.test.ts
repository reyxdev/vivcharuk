import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { issueLink, issueLinkCode, onCallback, onMessage, unlinkTelegram } from '../../src/modules/notifications/telegram';
import { compose, recipients } from '../../src/modules/notifications/notices';

// Personal Telegram linking: a one-time code from the panel, typed into the bot. Telegram itself is
// replaced by a fake fetch that records what the bot would send.
const sent: Array<{ chat_id: string; text: string }> = [];
const realFetch = globalThis.fetch;
let ownerId = '';
const chat = `9${Date.now()}`.slice(0, 12);
const msg = (text: string, id = chat) => ({ chat: { id: Number(id), type: 'private' }, from: { username: 'tester' }, text });

beforeAll(async () => {
  globalThis.fetch = vi.fn(async (_url: unknown, init?: { body?: string }) => {
    const b = JSON.parse(init?.body ?? '{}') as { chat_id: string; text: string };
    sent.push(b);
    return new Response(JSON.stringify({ ok: true, result: {} }));
  }) as typeof fetch;
  ownerId = (await prisma.staffUser.findFirstOrThrow({ where: { email: 'gif19601@gmail.com' } })).id;
  await unlinkTelegram(ownerId);
});
afterAll(async () => { await unlinkTelegram(ownerId); globalThis.fetch = realFetch; });

describe('telegram linking', () => {
  it('a stranger gets only the hello text', async () => {
    await onMessage(msg('/start'));
    expect(sent.at(-1)?.text).toMatch(/службовий бот/);
  });

  it('a wrong code links nobody', async () => {
    await onMessage(msg('000000'));
    expect(sent.at(-1)?.text).toMatch(/не підходить/);
    expect((await prisma.staffUser.findUniqueOrThrow({ where: { id: ownerId } })).telegramChatId).toBeNull();
  });

  it('the right code links the owner once', async () => {
    const { code } = await issueLinkCode(ownerId);
    await onMessage(msg(code));
    expect(sent.some((m) => /Готово/.test(m.text))).toBe(true);
    expect((await prisma.staffUser.findUniqueOrThrow({ where: { id: ownerId } })).telegramChatId).toBe(String(Number(chat)));
    await onMessage(msg(code, '123456789'));
    expect(sent.at(-1)?.text).toMatch(/не підходить/); // used up
  });

  it('the owner is a recipient of order notices once linked', async () => {
    const c = await compose({ kind: 'subscriber' });
    const r = await recipients(c!);
    expect(r.some((p) => p.id === ownerId)).toBe(true);
  });

  it('/stop unlinks', async () => {
    await onMessage(msg('/stop'));
    expect((await prisma.staffUser.findUniqueOrThrow({ where: { id: ownerId } })).telegramChatId).toBeNull();
  });

  it('one tap: /start <token> asks to confirm, «Так» links', async () => {
    const { token } = await issueLink(ownerId);
    await onMessage(msg(`/start ${token}`, '777'));
    expect(sent.at(-1)?.text).toMatch(/Підключити цей Telegram/);
    await onCallback({ id: 'q1', data: `link:${token}`, from: { username: 'tester' }, message: { chat: { id: 777, type: 'private' }, message_id: 1 } });
    expect((await prisma.staffUser.findUniqueOrThrow({ where: { id: ownerId } })).telegramChatId).toBe('777');
    await onCallback({ id: 'q2', data: `link:${token}`, from: {}, message: { chat: { id: 888, type: 'private' }, message_id: 2 } });
    expect((await prisma.staffUser.findUniqueOrThrow({ where: { id: ownerId } })).telegramChatId).toBe('777'); // used up
    await unlinkTelegram(ownerId);
  });

  it('five wrong codes lock the chat', async () => {
    for (let i = 0; i < 5; i++) await onMessage(msg(String(100000 + i), '555'));
    await onMessage(msg('123123', '555'));
    expect(sent.at(-1)?.text).toMatch(/Забагато спроб/);
  });
});
