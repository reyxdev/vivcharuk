# Client Decisions — Round 14 (fiscal receipts, free)

Received 2026-09-30, a 50-question questionnaire on issuing fiscal receipts (ПРРО) without paid
services, after round 13 N7 («без платних додаткових сервісів»). **Highest-authority document**
for the points below. Supersedes the provider choice in
[00-client-decisions-10.md](00-client-decisions-10.md) §P8b (Checkbox, `{{PRRO_PROVIDER}}`) and
the ПРРО row in [00-client-decisions-13.md](00-client-decisions-13.md) N7.

Answers are quoted by question number (А = first option). Research used for the options:
WayForPay states it has no fee or commission for connecting and using its built-in ПРРО (2022
statement, **to be reconfirmed**); Portmone's free ПРРО works only with Portmone acquiring;
payments through IBAN details without a «Оплатити» button and without an acquiring contract need
no ПРРО.

---

## F1 — Seller and tax status

| # | Question | Answer |
|---|---|---|
| 1 | Who is the seller on the site | To be established at the 2026-10-06 visit (`{{LEGAL_ID}}`) |
| 2 | Single-tax group | **Group 2** |
| 3 | VAT payer | No |
| 4 | Accountant | **Being searched for** |
| 5 | Qualified e-signature (КЕП) | None yet; obtained free (tax service or Приват24) |
| 6 | Cashier | Іван (the owner is the cashier) |
| 7 | Receipts for Prom orders today | **None are issued** |
| 8 | Sales in the shop in Яворів | Yes, cash and card (no receipts wanted — see F7) |

**For the accountant, before launch (not decided here):**

- Group 2 limits: the number of hired workers and the annual income ceiling. A workshop with
  weavers and seamstresses can exceed the worker limit; this must be checked.
- Wholesale to legal entities and sales to buyers abroad under group 2.
- Prom orders paid by card without receipts (answer 7) are a current exposure of the same firm.
  It ends when the Prom shop closes; until then the accountant decides.
- Shop sales by card terminal also need a receipt (answers 8, 50).

**Security recommendation on answer 6.** Іван stays the cashier, but the key uploaded to
WayForPay should be a **separate КЕП issued only for the cash register** (also free), not the key
he uses for tax reports and the bank. A key held by a third party should be able to sign
receipts and nothing else. Pending the owner's agreement; see §38 control on third-party secrets.

---

## F2 — The free method

| # | Question | Answer |
|---|---|---|
| 9 | Main method for the site | **WayForPay's built-in ПРРО.** The receipt is created by WayForPay from the product list sent with the payment |
| 10 | If WayForPay's ПРРО turns out to be paid | **Own integration with the tax service's free ПРРО** (fiscal server API, receipts signed with the cash-register КЕП) |
| 11 | Receipts in the shop | Clarified: the shop sells, but the client does not want to issue receipts there. See **F7** |
| 12 | When the receipt is issued | Immediately after a successful payment, automatically |
| 13 | Opening and closing the shift | Automatic |
| 14 | Daily Z-report | Automatic, 23:50 |
| 15 | If the tax service does not respond | Receipt queued, retried every 5 min, Telegram to Іван after 1 h |
| 16 | Before launch | A 1 ₴ test payment with its receipt and its return receipt |
| 17 | If the ПРРО is not registered by launch | **Card payment stays off** until it is |

**To verify with WayForPay at the visit** (added to the V-list of round 8):

- V12 — the built-in ПРРО is still free, and under which conditions.
- V13 — the API or callback returns the receipt's **fiscal number and link** (and the return
  receipt's) so the site can show them. **This is the pivot:** if WayForPay issues receipts but
  never tells the site their number or link, the site cannot show the receipt card (F5), and the
  fallback of answer 10 is used instead.
- V14 — the buyer e-mail WayForPay sends with the receipt can be switched off (answer 42).
- V15 — product lines accept name, SKU, quantity, price and a discount line (F4).

---

## F3 — Which payments get a receipt

| # | Payment | Receipt |
|---|---|---|
| 18 | Full payment by card, Apple Pay, Google Pay | Always, by WayForPay |
| 19 | Prepayment 460 ₴ | A receipt for the prepayment, immediately |
| 20 | Remainder paid on receipt at Nova Poshta (накладений платіж) | **Issued by Nova Poshta**, not by the site (client's answer; the accountant confirms) |
| 21 | Wholesale paid to the firm's IBAN against an invoice | No ПРРО — invoice and delivery note only |
| 22 | Shipping cost | Not on our receipt: the buyer pays the carrier |
| 23 | Full refund | Return receipt, automatic |
| 24 | Partial refund (one item of several) | Return receipt for that item's amount |
| 25 | Cancellation after payment, before dispatch | Refund + return receipt |

---

## F4 — What the receipt says

| # | Field | Decision |
|---|---|---|
| 26 | Product line | Full: Ліжник «Черемош» 200×220, сірий |
| 27 | SKU | Yes: VCH-LZ-0114-200-SI |
| 28 | Volume discount or sale | A separate «Знижка» line |
| 29 | Partner goods | Like every product; the partner's name never appears |
| 30 | Seller name | **Legal name only**, as registered. «Вівчарик» is not added to the receipt |
| 31 | Address | From the registration (с. Яворів) |
| 32 | Language | Ukrainian always, on every locale (an official document) |
| 33 | Tax | «Без ПДВ» |
| 34 | Order number | Yes: № VCH-26-0417 |

---

## F5 — How the buyer gets it, and how it looks

| # | Question | Answer |
|---|---|---|
| 35–37 | Where the receipt is delivered | **Only on the order page** after «Дякуємо за замовлення». **No receipt in any e-mail** (client, answer 37: «лист не підключаєм… якщо закрили сторінку, то не наші проблеми») |
| 36 | E-mail required for card payment | No |
| 38 | Look | Our card in the site's style: amount, receipt number, date, QR, «Перевірити в податковій» |
| 39 | While it is being created | «Чек формується…» with the thread; the card updates by itself |
| 40 | PDF | «Завантажити PDF» |
| 41 | Paper receipt in the parcel | No, electronic only |
| 42 | WayForPay's own receipt e-mail | Off (V14) |
| 43 | Return receipt | A separate e-mail «Кошти повернено» with the link to the return receipt (the buyer has no page to be on at that moment; this is the one e-mail that carries a receipt) |

**Placement.** The receipt card sits on the order confirmation page `/{locale}/order/{guestToken}`
([18-checkout-specification.md](18-checkout-specification.md) §18.16), directly under the order
summary («Оплачено карткою · WayForPay»). That page has a stable URL, so a buyer who kept the
link (or opens it from the ordinary order-confirmation e-mail) sees the card again; nothing is
added to the e-mail itself. The site owes nothing more (answer 37).

**States of the card:**

| State | Shows |
|---|---|
| Pending (usually a few seconds) | «Чек формується…» with the thread drawing; polls every 3 s for up to 60 s |
| Issued | «Фіскальний чек», fiscal number, date and time, amount, «Без ПДВ», QR, «Завантажити PDF», «Перевірити в податковій» |
| Late (over 60 s) | «Чек буде готовий за кілька хвилин — оновіть цю сторінку пізніше. Якщо не з'явиться, напишіть на info@vivcharyk.shop.» |
| Prepayment | «Фіскальний чек на передоплату 460 ₴» + «Решту сплатите на пошті — чек видасть Нова пошта» |
| Refunded | A second card «Чек повернення» under the first |

**The card is a summary, not a redesign of the receipt.** The official receipt's form is set by
the tax service. The card links to it, «Завантажити PDF» downloads the official receipt from the
provider (or the tax service), and the QR is the tax service's verification QR. The site never
draws its own version of the fiscal document.

---

## F6 — Admin panel

| # | Question | Answer |
|---|---|---|
| 44 | Receipt status on the order | Badge: Чек видано / Очікує / Помилка |
| 45 | Issue failure | Telegram to Іван + «Повторити» |
| 46 | Who sees receipts | Owner and Administrator |
| 47 | Who refunds with a return receipt | **Owner and Administrator** (`payments.refund`) |
| 48 | Report for the accountant | Monthly Excel of all receipts and returns |
| 49 | Keep receipt copies in our database | At least 3 years |
| 50 | Shop sale in the panel | Stock write-off «Продано в магазині» only; the receipt is issued in the tax service's app |

---

## Propagation

- [25-database-schema.md](25-database-schema.md) §25.8e — `FiscalReceipt.provider` =
  `wayforpay` (fallback `dps`); adds `isPrepayment`, `qrPayload`, `pdfUrl`.
- [26-api-architecture.md](26-api-architecture.md) — `fiscal.issue` rewritten for WayForPay;
  public `GET /orders/{guestToken}/receipts`.
- [18-checkout-specification.md](18-checkout-specification.md) §18.16 — the receipt card.
- [35-implementation-roadmap.md](35-implementation-roadmap.md) — Phase 0: КЕП, ПРРО registration,
  accountant; card payment gated on the ПРРО.
- Canvas: board «Фіскальний чек» (confirmation page desktop and phone, panel badge).

---

## F7 — Shop sales in Яворів (follow-up to answers 8, 11, 50)

> «Так, але не хочемо вести чеки, бо це магазин-виробництво, люди приїжджають і дивляться.»

Recorded as the client's position. **The blueprint does not build around it and does not treat it
as settled:** a single-tax group-2 ФОП selling for cash or by card in person generally has to
issue a receipt, and the answer is the accountant's (F1 list). The site and panel are unaffected
either way — «Продано в магазині» remains a stock write-off only (answer 50), and the panel never
issues or suppresses shop receipts.

**Lawful low-effort options, offered for the accountant's review:**

| Option | How it works | Receipt effort |
|---|---|---|
| **Showroom model** | Visitors look and touch in the workshop; the purchase is placed on the site (on their phone or a shop tablet) and paid by card through WayForPay | None — WayForPay issues the receipt automatically, as for any site order |
| Tax-service app on a phone | The free state ПРРО app, only for sales that do happen on the spot | About 20 seconds per sale |

The showroom model matches «люди приїжджають і дивляться» and keeps every sale inside the
existing automatic flow. On the site it needs nothing new; the shop tablet is an ordinary browser.

---

## F8 — `fabryka-shkur.com.ua` stays online, but stops selling

> «Ні, він не закривається, просто власники його залишать так, як він є. Але не будуть продавати
> через нього, там товари будуть недійсні, а при дзвінках власники будуть казати, що сайт другий
> (без автоматичної переадресації поки що).»

Closes the open question of round 13 N1 («Old domain»):

- The old site stays online as it is; its products are marked unavailable and nothing is sold
  there.
- **No 301 redirects for now.** If the client asks later, the redirect map of round 13 N1 applies.
- Callers who find the old site are told by phone that the shop is now `vivcharyk.shop`.
- Because the old site stays online, the existing rule holds unchanged: **every product text on
  the new site is written fresh**, never copied (round 2 E5; [02-ux-research.md](02-ux-research.md)).
- The new site never links to the old one and never claims continuity with it (unchanged).
- «Також на Prom» / «Продано на Prom» (round 13 N1) are needed only while the Prom listing is
  still live; they can be hidden once it stops selling.
