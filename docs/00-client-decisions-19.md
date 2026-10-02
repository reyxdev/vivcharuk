# Client Decisions — Round 19 (mail in the panel, newsletters)

Received 2026-10-02: the user answered a 100-question form (50 on the panel's «Пошта», 50 on
newsletters) after the shop mailbox `info@vivcharuk.com` went live on Porkbun and site mail went
through Resend (round 18 C14–C15). **Highest-authority document** for the points below.

The request, verbatim: «всі листи які будуть приходити туди, мені потрібно перенаправляти в панель
власника в розділ Пошта, та потрібно налаштувати розсилку клієнтам акцій, скидок тощо, Іван це буде
робити вручну через панель».

## D1 — «Пошта» in the panel reads the Porkbun mailbox (supersedes the Cloudflare design in 26 §26.16.2)

The schema from round 7 K2 (`Mailbox`, `MailThread`, `MailMessage`, … in `25-database-schema.md`
§25.8c) stays. Only the transport changes: inbound mail is read from `info@vivcharuk.com` over IMAP
(`imap.porkbun.com:993`), replies go out over Porkbun SMTP (`smtp.porkbun.com:587`) as a person
writing from `info@` and are also saved to the mailbox's Sent folder. No Cloudflare Email Routing,
no R2: originals and attachments are stored on the server's disk, outside the public media folder.

| # | Question | Answer |
|---|---|---|
| 1 | Who sees «Пошта» | Owner, plus anyone the owner grants `mail.read` |
| 2 | How fast new mail appears | Near-instant (IMAP IDLE, with a periodic fallback) |
| 3 | Keep copies in the Porkbun mailbox | Yes — the panel never deletes from the mailbox |
| 4 | Import existing mail | Yes, everything already in the mailbox |
| 5 | Reply address | `info@`, sent through Porkbun SMTP (a person's mail, not automated) |
| 6 | Signature | Staff member's first name + «Вівчарик» + phone |
| 7 | New-mail notice | Unread counter in the panel only |
| 8 | Threads | Yes, conversation view |
| 9 | Order number in a letter (`VCH-…`) | Linked to that order automatically |
| 10 | Customer's earlier orders beside the letter | Yes (by e-mail) |
| 11 | Statuses | Нове · Відповіли · Закрито (plus Спам) |
| 12 | Assign to a staff member | Not now (one person works the mail) |
| 13 | Labels | Опт, Питання про товар, Доставка, Повернення/скарга, Співпраця |
| 14–15 | Reply templates | Yes: Ціни опту, Наявність/строк виготовлення, Розміри, Догляд за вовною, Реквізити IBAN, Повернення |
| 16 | Attachments received | Photos and PDF are shown; other files are kept but flagged |
| 17 | Attachments sent | From the device and from the catalogue's photos |
| 18 | Attachment limit | 20 MB per reply |
| 19–20 | Spam | Porkbun's filter + a «Спам» button; «Заблокувати відправника» button |
| 21 | Search | Yes (subject, text, names, addresses) |
| 22 | Retention | 3 years, then removed from the panel (the mailbox copy is Porkbun's) |
| 23 | Deleting | To a bin for 30 days |
| 24–25 | Phone mail app | Not used; read/unread is still synced with the mailbox both ways |
| 26 | Replies to order e-mails | Also shown on the order card |
| 27 | Undelivered order e-mails | A mark on the order: «email не дійшов» |
| 28 | Languages customers write in | uk, ru, en, pl, de (no translator — paid service, round 13 N7) |
| 29–30 | Editor | Plain text with bold, lists, links; drafts saved automatically |
| 31 | Scheduled sending | No |
| 32 | Forward | Yes |
| 33–34 | Safety | Remote images blocked until clicked; suspicious letters marked |
| 35 | Other addresses | Only `info@` |
| 36 | «Створити замовлення з листа» | Yes (customer's name and e-mail prefilled) |
| 37 | Internal notes | Yes |
| 38 | Reminder | A letter unanswered for 24 working hours is highlighted |
| 39–41 | Auto-reply | Only outside working hours (Mon–Fri 11:00–19:00, round 18 C2): «answer next working day», with the phone |
| 42 | Reply-time statistics | No |
| 43 | Print / PDF | Yes (browser print of the letter) |
| 44 | Device | Phone and computer equally — the screen must work on a phone |
| 45 | Volume | Unknown |
| 46–47 | Mailbox password | Known to Іван and the user; it lives only in the server `.env` |
| 48 | Wholesale regulars | Marked with a star |
| 49 | When | **Before launch** |

## D2 — Newsletters return (supersedes round 9 part 4 #20 and the round 17 «no marketing consent» rule)

Round 9 removed the newsletter. The owner now wants to send offers by hand from the panel. Consent
is required by law for advertising mail, so it is collected explicitly.

- **Consent:** one checkbox at checkout, **unchecked by default**, text exactly «Хочу отримувати
  листи про акції та новинки Вівчарика». No sign-up field in the footer: the «no forms on the site»
  rule stands.
- **Double opt-in:** ticking the box sends a confirmation letter; the address is subscribed only
  after the link is clicked. A welcome letter follows (no discount in it).
- **No mail without consent:** earlier buyers are not mailed; there is no Prom.ua list to import.
  Іван may add a subscriber by hand, recording where consent was given.
- **Unsubscribe:** one click from every letter (plus the `List-Unsubscribe` header). After
  unsubscribing only the e-mail is kept, on a «do not write» list.
- **Data controller** in the privacy policy: ФОП Гондурак Любов Юріївна.
- **Channel:** e-mail only. **Content:** акції, знижки/промокоди, новинки, сезонні, знову в наявності.
- **Frequency:** at most one newsletter a week.
- **Expected size:** under 100 subscribers in the first year. If a send exceeds the Resend free
  plan's daily limit, it is split across days automatically (no paid plan — round 13 N7).
- **Who sends:** the owner only. A test letter to `info@` is **mandatory** before the send button
  unlocks; a preview shows phone and computer widths.
- **From:** «Іван з Вівчарика» `<info@vivcharuk.com>` (sent through Resend); replies land in «Пошта».
- **Editor:** blocks (heading, text, photo, button, product cards from the catalogue); design as the
  order e-mails; photos from the catalogue; copy an old newsletter; three ready templates.
- **Audience:** all subscribers, bought from a category, subscribed but never bought, by site
  language. Newsletters are written in Ukrainian only.
- **Schedule:** a date and time may be set; default 10:00. A running send can be stopped.
- **Measurement:** no open tracking (pixel); clicks and orders through UTM marks and the promo code.
  A report after the send: sent, undelivered, unsubscribed, orders. Addresses that bounce
  repeatedly are removed automatically.
- **Export:** CSV download of subscribers, owner only; no CSV import.
- **No public archive** of newsletters on the site.
- **First newsletter:** «Відкриття нового сайту».
- **When:** the consent checkbox (with double opt-in and unsubscribe) **at launch**; the
  newsletter editor and sending after launch.

## D3 — Promo codes in newsletters

Uses the existing `Promotion` model (`code` set).

- One code for everyone (e.g. `ZYMA10`), not per person.
- Kinds: percentage, fixed amount, free delivery, limited to chosen products or categories.
- Limits: validity dates, minimum order sum, once per customer (by e-mail), total number of uses.
- **Does not stack with the wholesale discount** (round 18 C3): the larger of the two applies.
- Valid with every payment method, cash on delivery included.

## D4 — Automatic letters

Besides the order letters (round 18 C14), three run without Іван:

- welcome letter to a confirmed subscriber;
- «Залиште відгук» — **3 days after delivery**, to buyers who gave an e-mail (service mail
  about their order, not advertising, so it does not need marketing consent; one letter only);
- «Знову в наявності» — see the open point below.

No abandoned-cart letter.

## Built (2026-10-02)

- **«Пошта»** (D1): `apps/api/src/modules/mail/` — IMAP sync with IDLE and a 5-minute check
  (`imap.ts`), ingest with threading by In-Reply-To/References, order numbers, sender rules and the
  out-of-hours auto-reply (`ingest.ts`), HTML cleaning and the suspicious-letter check
  (`sanitize.ts`), replies and forwards through Porkbun SMTP with a copy in Sent (`send.ts`), the
  panel endpoints (`mail.routes.ts`); files in `MAIL_DIR` (default `mail-store/`, kept out of git and
  out of `deploy/push.sh`). Panel screen `apps/admin/src/features/mail/`, unread counter in the menu,
  letters and the «email не дійшов» mark on the order card, «Створити замовлення з листа».
  Server settings: `MAILBOX_ADDRESS`, `MAILBOX_PASSWORD` (the owner enters it on the server).
  Panel → mailbox read state is synced (\Seen); mailbox → panel is not, since the phone app is not
  used (D1 #24). The «email не дійшов» mark (`Order.emailBouncedAt`) needs a Resend webhook, not
  built yet.
- **Newsletter consent** (D2, launch part): the checkout checkbox, `Subscriber`, the confirmation
  and welcome letters, `/<locale>/rozsylka` (posts the token, so link scanners change nothing), RFC
  8058 one-click unsubscribe, the privacy-policy paragraph.
- **Not yet built:** the newsletter editor and sending, subscriber list with manual add and CSV
  export, promo codes in newsletters (D3), «Залиште відгук» (D4), the Resend bounce webhook.

## Still open after this round

- **«Знову в наявності»:** to know who is waiting, the product page would need a «Повідомити,
  коли з'явиться» field for an e-mail — a form, which the site does not have. Until the client
  chooses, it is limited to subscribers who bought from that product's category: they receive the
  «back in stock» newsletter block, sent by hand.
- **Resend free-plan limits** (daily and monthly) are to be checked on resend.com before the
  sending code is written; they set the splitting rule in D2.
