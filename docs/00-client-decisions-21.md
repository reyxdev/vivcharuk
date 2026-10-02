# Client Decisions — Round 21 (Telegram bot) — 2026-10-02

The user answered 49 questions about connecting and using the staff Telegram bot (@vivcharuk_bot).
**Highest authority** for staff notifications; supersedes round 20 #186, #201–202 and E7's code-only linking,
and round 9 §P5.4 «no personal data in Telegram» for the buyer's phone (T19).

## Connecting (T01–T11)

- One button «Підключити Telegram»; the bot then asks «Підключити цей Telegram до <ім'я>?» [Так, це я] [Ні]
  (T01). The 6-digit code stays as a small fallback (T02). On a computer a QR code, on a phone a button (T03).
  Link and code live 10 minutes (T04); the panel shows «Підключено ✓» by itself (T05).
- Offered right after signing in and in «Пароль і вхід» (T06); «Не зараз» hides it for a week (T07).
- New staff: Telegram off until the owner allows it (T08); nothing in the invitation e-mail (T09); the owner
  can show a colleague a QR in «Співробітники» (T10). One Telegram account per person (T11).

## The bot (T12–T16, T37–T40, T49)

- Strangers: «Це службовий бот магазину «Вівчарик». Покупцям — сайт vivcharuk.com» (T12). Description set
  automatically at start (T13–T14). Menu: /today, /orders, /settings, /panel (T15). Links open the panel in
  the browser (T16, T48). Ukrainian, warm tone, emoji (T21, T37–T38). After linking: greeting, the list of
  what will come, an example order notice (T39–T40). Staff only, never buyers (T49).

## Notices (T17–T36)

- Order: number, sum, items, city, payment, delivery, the first photo and **the buyer's phone** (T19–T20).
  Buttons «Відкрити в панелі» and «Підтвердити в панелі»; every action happens in the panel (T17–T18) — a
  phone number in the text is tappable, which is the «Подзвонити».
- Also: 1-click with the phone (T36), payments, cancellations, reviews (stars + first 100 characters, «⚠️ Увага»
  for 1–2 ★, T34–T35), «виготовити до», low stock, shop sales and new subscribers (owner), new mail, sign-in
  from a new device (to that person), a day summary at 19:00 on working days, the week on Monday 08:00 (T22,
  T31–T32).
- **No sums of money in summaries** (T33); order and payment notices keep their own amounts (T20).
- Each person ticks what to receive in the panel (T23). 22:00–08:00 and weekends arrive without sound,
  same for everyone (T24–T26). Each notice separately (T27).
- Under an order's notice the next steps are written as they happen — «👀 Іван взявся», «📞 Підтверджено
  дзвінком — Іван», «🚚 Відправлено…» (T28–T29). A reminder if a new order is not confirmed within 2 working
  hours (T30).
- Retries for about an hour (T44); no e-mail fallback (T45). Blocked or removed staff are disconnected
  quietly (T41); if someone blocks the bot the panel shows «Відключено» (T42). The owner sees who receives
  notices and when the last one arrived (T43); a test button in «Пароль і вхід» (T46); the bot's state in
  Settings → Сповіщення (T47).
