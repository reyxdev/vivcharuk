# 18 — Cart & Checkout Specification

> **Round 14 — fiscal receipts:** free, through WayForPay's built-in ПРРО. The receipt card lives on the order page (§18.16) under the order summary, with pending, issued, late, prepayment and refunded states; no receipt in the order e-mail; card payment stays off until the ПРРО is registered. See [00-client-decisions-14.md](00-client-decisions-14.md) F5.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Drawer:** photo, size and colour, remove, total; no − / +, no cross-sell, no wholesale nudge; «Оформити» + «Продовжити покупки»; empty = mascot + best sellers; sold-out lines greyed and excluded (part 5).
> - **One-page checkout.** One name field «Прізвище та ім'я (як у паспорті)» split for Nova Poshta; optional patronymic; **email optional** except custom, international, company and non-`uk` orders (§P5a); phone typed in full and normalised; city suggestions; branch list + map, **parcel lockers when the item fits**, courier; delivery cost shown in checkout only; «Є промокод?»; summary at the bottom on phones with photos; terms checkbox; **button states the amount charged now**; card payment in an overlay widget; retry or change method on failure; stock held 30 min; company checkbox with ЄДРПОУ and invoice.
> - After the order (part 6): emails = confirmation, «Відправлено», plus quote, cancellation, refund, review request (§P6a). Cancel, change address, returns and exchanges by phone (EU locales also by written notice and the model form). Every order is confirmed by a call. Unpaid card orders auto-cancel after 3 days. No abandoned-checkout email.
> - **Fiscal receipts** for card payments through a ПРРО provider (§P8b).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Cart = side drawer only.** The cart page (§18.2.2) is removed; its contents move to the drawer or checkout. **Promo-code entry moves to checkout only.** Promo codes are used for holidays.
> - **No order comment field.**
> - **«Купити в 1 клік»** (Ukraine, stocked items): phone-only quick-order request → admin inbox → the manager calls, creates the order and sends a payment link. All prepayment rules apply at that point ([00-client-decisions-9.md](00-client-decisions-9.md) §P4.1).
> - Nova Poshta: branch picker as searchable list **and** map; **courier to address** added. Ukrposhta for all goods. **Dispatch in 2–4 days**, never same-day.
> - **Apple Pay and Google Pay** through WayForPay. No instalments. No gift wrap, gift notes or gift certificates.
> - Change-of-mind returns: **the buyer pays return shipping**, disclosed before purchase.
> - Non-`uk` locales **display prices in euro** (NBU rate, daily, whole euros); charge currency per WayForPay V11 ([00-client-decisions-9.md](00-client-decisions-9.md) §P4.2). Poland is the first foreign market.


## 18.1 What this document is fixing

The reference operation this project inherits its commercial habits from has **no online
payment gateway at all**. Its four payment methods are a manual transfer to a personal
PrivatBank card requiring «обов'язково потрібна консультація менеджера», an IBAN bank transfer
with the order number typed into the payment reference, a 10% prepayment with the balance on
delivery, and cash on delivery via Nova Poshta
([00-existing-site-audit.md](00-existing-site-audit.md) §0.6).

A buyer ready to spend five figures is currently asked to open a banking app, retype a
sixteen-digit personal card number, and then wait for a human being to confirm the order
existed. **Designing a real PSP checkout is the single highest-ROI change on this project**, and
it is the reason this document exists.

But a replacement that only ships card payment would fail. The customers this business already
has are accustomed to COD and to partial prepayment, and in a market where distance selling
from small producers frequently ends badly, COD is not laziness — it is the buyer's only
available guarantee ([02-ux-research.md](02-ux-research.md) §2.4, anxiety A4). **This checkout
therefore carries both the new online-card flow and the existing COD and partial-prepayment
flows**, and §18.9 states which of the legacy methods to retire and which to keep.

Fourteen constraints bind this document. They come from
[00-client-decisions-6.md](00-client-decisions-6.md) first — the highest-authority document in
the blueprint — then [00-client-decisions-5.md](00-client-decisions-5.md), then
[00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md) where they do not overlap.

| Constraint | Effect on checkout |
|---|---|
| **A mixed cart ships together as one order** ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) | «Надіслати разом.» **One order, one parcel, one delivery charge**, dispatched after the 14-day production period. The split into two orders specified by the previous round is **withdrawn and removed from this document**, not deferred. What replaces it is a cart-level disclosure that fires when the custom item is added, because adding it changes the terms of the item already in the cart. §18.8.7 |
| **Made-to-order requires full online prepayment** ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.1) | Cash on delivery is not offered on a custom-size line, and under §J1 that applies to **the whole cart** once any custom line is in it. Enforcement is **server-side**: the available methods are derived from cart contents, never filtered in the browser. The reason is shown to the buyer, because an unexplained restriction reads as distrust. §18.8.7 |
| **«Наложений платіж з оглядом» is Ukraine-only and stocked-items-only** (§H1.2) | The inspection right is the strongest argument a cold-start brand asking 5,000–15,000 UAH has, and it is stated plainly at checkout rather than in a policy page. §18.8.5 |
| **The return-shipping deposit** (§H1.3, confirmed by [00-client-decisions-6.md](00-client-decisions-6.md) §J2) | On a Ukrainian COD-with-inspection order the buyer pays **both shipping legs online**; on acceptance the return leg is credited against the goods. It is a refundable-by-offset deposit, not a fee, and the entire risk is the wording. Ukraine only — the EU right of withdrawal forbids it. §J2 confirms the mechanic and records the business reason: refused inspections currently cost the business both legs of carriage. **The mechanic is settled; only the copy awaits approval.** §18.8.5a |
| **Made-to-order is 14 days of production before dispatch** ([00-client-decisions-4.md](00-client-decisions-4.md) §G2) | Not 14 days to the door. `OrderStatus.IN_PRODUCTION` sits between `CONFIRMED` and `PACKING`, and the confirmation email restates a **date**, not a duration. §18.13, §18.16, §18.17 |
| **Іван is the primary phone, Любов the fallback** (§G1) | `+380679973450` leads on every checkout surface; `+380679604769` follows, framed as a fallback. The legal surfaces — offer contract, Impressum, invoice — name **Любов**, the ФОП seller of record. The split between who trades and who answers is deliberate and is not flattened |
| **The PSP is WayForPay** (§E10) | `{{PSP}}` resolves. But six integration facts — V6–V11 — are explicitly unverified, and **V6, the available integration mode, materially changes the step design**. §18.8 specifies both branches rather than picking one |
| **Guest checkout, permanently** (§E12) | No customer accounts, ever. Every account offer, login prompt, saved-payment-method and order-history-behind-a-login is removed from this document. Tracking is `Order.guestToken` plus a lookup form (§18.18); address prefill is a first-party cookie (§18.12) |
| **International sales accepted** (§E11) | `en`, `pl` and `de` are transactional, not informational. Card-only outside Ukraine, the EU 14-day right of withdrawal, and a checkout that quotes rather than calculates. §18.23 |
| **The buyer pays shipping and all customs charges** ([00-client-decisions-3.md](00-client-decisions-3.md) F4) | Effectively **DAP**. Carriers are Nova Poshta, Ukrposhta and others case by case, domestic and international, so `{{INTL_CARRIER}}` resolves to *multiple, quoted per order*. Two hard consequences: duty disclosure is a **blocking pre-payment element** (§18.23.3), and international shipping runs **enquiry-then-invoice** rather than live rating (§18.23.7). Free shipping never applies internationally |
| **Partner products cannot be named, and carry the Вівчарик brand** (§E7, F3) | Cart lines and order items carry `ProductOrigin` and `partnerRegion`, never `partnerName`. [00-client-decisions-3.md](00-client-decisions-3.md) F3 confirms partner goods sell under the Вівчарик name, so nothing in the cart line, the summary or the confirmation distinguishes them except the origin mark — which makes carrying that mark through checkout mandatory rather than tidy. §18.2 |
| New brand, new domain, cold start (D2), with **no social media at all** (§E3) | No existing customer base, and the Instagram launch channel D2 assumed does not exist. The first orders come from the Google Business Profile, the offline customer base and Yavoriv's footfall. Every order is a first order from an unknown seller, which is why §18.8.5 keeps COD unapologetic |
| **Яворів is a shop as well as a factory** ([00-client-decisions-3.md](00-client-decisions-3.md) F2) | Pickup stops being a cost-saving fallback and becomes an invitation to a real place. §18.5.4 |
| The sheep mascot is brand-core but **absent from cart and checkout** (D2 c3, [01-brand-strategy.md](01-brand-strategy.md) §1.7) | No mascot on any surface in this document. Checkout is a money-critical surface, and the mascot's designed absence there is what lets it exist elsewhere |

The seller of record is **ФОП Гондурак Любов Юріївна** (§E1) — the entity on the offer contract,
the WayForPay merchant agreement, every invoice and the German Impressum — while the number a
buyer calls is **Іван's** ([00-client-decisions-4.md](00-client-decisions-4.md) §G1). That split
is deliberate: a legal page naming the wrong person is a defect, and a checkout header naming
someone who does not pick up is a different defect. This document keeps them apart everywhere,
and the one surface that carries both is the order confirmation email — a customer with a problem
should not have to guess (§18.17). `{{LEGAL_ID}}` **exists and will be supplied**
([00-client-decisions-3.md](00-client-decisions-3.md) F1); it is no longer a general blocker on
this document. It gates exactly three deliverables — WayForPay merchant
onboarding, the договір оферти and returns policy, and the German Impressum — and every other
section here proceeds without it.

Money is `Int` minor units throughout ([25-database-schema.md](25-database-schema.md) §25.1).
No float arithmetic appears anywhere in the cart, the totals, the promotion engine, or the PSP
payload.

---

## 18.2 The cart

Two surfaces for two intents. Both read the same `Cart`/`CartItem` rows
([25-database-schema.md](25-database-schema.md) §25.6), identified by the `Cart.token` httpOnly
cookie, so there is never a "drawer cart" and a "page cart" that disagree.

### 18.2.1 The drawer — confirmation, not management

Opens on add-to-cart **on mobile only** (§17.6.5) and on the header cart icon everywhere.

```
                        ┌─────────────────────────────────────┐
                        │  Кошик (3)                      ✕  │
                        ├─────────────────────────────────────┤
                        │ ┌────┐ Ліжник «Черемош»            │
                        │ │ ▣  │ 150×200 · натуральний сірий  │
                        │ │    │ ✋ Власне виробництво         │
                        │ └────┘ [−] 1 [+]        5 400 ₴    │
                        │        ♡ Зберегти на цьому пристрої │
                        │        ·  Видалити                  │
                        ├─────────────────────────────────────┤
                        │ ┌────┐ Пряжа вовняна «Смерека»      │
                        │ │ ▣  │ Колір 12 · товщина 8/2       │
                        │ └────┘ [−] 5 [+] мотків             │
                        │        ≈ 500 г · ≈1 250 м   1 200 ₴│
                        ├─────────────────────────────────────┤
                        │ ⚠ Єдиний примірник у кошику.        │
                        │   Зарезервовано на 30 хв.  24:11    │
                        ├─────────────────────────────────────┤
                        │ Проміжний підсумок       11 900 ₴  │
                        │ Доставка          розрахуємо далі   │
                        ├─────────────────────────────────────┤
                        │ ┌─────────────────────────────────┐ │
                        │ │        ОФОРМИТИ ЗАМОВЛЕННЯ      │ │
                        │ └─────────────────────────────────┘ │
                        │        Продовжити покупки           │
                        └─────────────────────────────────────┘
                        420 px, z-modal, slides from the right
```

| Property | Decision | Why |
|---|---|---|
| Width | 420 px desktop, full width mobile | Wide enough for a two-line product name in German without wrapping to three |
| Motion | `spring.drawer`, `dur-slow` ([13-motion-system.md](13-motion-system.md) §13.3) | A full-height surface at `dur-fast` feels violent |
| Focus | Trapped, `Esc` closes, focus returns to the cart icon | |
| Quantity edits | Optimistic, with a rollback and an inline error on rejection | A network round trip per `+` tap makes the stepper feel broken |
| Shipping | Shown as «розрахуємо далі», never estimated | An estimate that later changes is worse than an honest deferral |
| Free-shipping progress | **Not shown here** | See §18.7 |
| Promo code | **Not offered in the drawer** | §18.10 |
| Empty | Designed state: what a cart is for, plus two category links. No mascot | [08-design-system.md](08-design-system.md) §8.8 permits the mascot in empty states generally; §1.7 removes it from cart specifically. The cart's empty state is a commercial surface |

### 18.2.2 The cart page — the review surface

`/{locale}/cart`. Reached from the drawer, from the header on desktop, and directly by URL,
which matters because a cart URL is the thing people send themselves between devices.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  КОШИК                                                              h1     │
├──────────────────────────────────────────────────┬─────────────────────────┤
│ ┌──────┐ Ліжник «Черемош»                        │  ВАШЕ ЗАМОВЛЕННЯ        │
│ │  ▣   │ Розмір 150×200 · Колір натуральний сірий │  ───────────────────    │
│ │      │ ✋ Власне виробництво                     │  Товари (3)   11 900 ₴  │
│ │      │ Артикул VCH-LZ-150200-014                │  Знижка            —    │
│ └──────┘ В наявності · відправка 1–2 дні          │  Доставка   розрахуємо  │
│          [−]  1  [+]                    5 400 ₴   │  ───────────────────    │
│          ♡ На цьому пристрої  ·  ✕ Видалити       │  Разом        11 900 ₴  │
├──────────────────────────────────────────────────┤                         │
│ ┌──────┐ Гуня «Верховина»                        │  [ ОФОРМИТИ ЗАМОВЛЕННЯ ]│
│ │  ▣   │ Розмір L · Колір білий                   │                         │
│ │      │ ✋ Власне виробництво                     │  Промокод               │
│ │      │ ⓘ Єдиний примірник · зарезервовано 24:11 │  [___________] [Застос.]│
│ └──────┘ [ 1 ]  qty locked                5 300 ₴ │                         │
├──────────────────────────────────────────────────┤  ↩ 14 днів на повернення│
│ ┌──────┐ Пряжа вовняна «Смерека»                  │  🔒 Оплата захищена     │
│ │  ▣   │ Колір 12 · товщина 8/2                   │  🚚 Нова Пошта, Укрпошта│
│ │      │ Відібрано Вівчариком · Косівщина          │  📞 +38 067 997 34 50   │
│ └──────┘ [−]  5  [+] мотків                        │     (Іван)              │
│          ≈ 500 г · ≈ 1 250 м             1 200 ₴  │                         │
├──────────────────────────────────────────────────┤  [ sticky below 900 px ]│
│ ┌──────┐ Ліжник «Черемош» · свій розмір           │                         │
│ │  ▣   │ 180 × 240 см · 4,32 м²                   │  ⚠ У кошику є виріб на  │
│ │      │ ✋ Власне виробництво                      │    індивідуальний       │
│ │      │ ⏱ Виготовлення 14 днів, далі доставка    │    розмір. Усе          │
│ │      │ 💳 Лише повна передоплата                 │    замовлення           │
│ │      │ ↩ Поверненню не підлягає, окрім браку     │    відправимо разом,    │
│ └──────┘ [ 1 ]  qty locked               7 776 ₴  │    коли він буде        │
│                                                  │    готовий — через      │
│                                                  │    14 днів. Оплата —    │
│                                                  │    повна, наперед.      │
│                                                  │    §18.8.7              │
├──────────────────────────────────────────────────┴─────────────────────────┤
│  ← Продовжити покупки                                                      │
├────────────────────────────────────────────────────────────────────────────┤
│  ЧАСТО ДОКУПОВУЮТЬ         CROSS_SELL, max 4, own manufacture first         │
└────────────────────────────────────────────────────────────────────────────┘
```

Mobile stacks: lines first, summary second, CTA in a fixed bottom bar carrying the total and
the primary button (72 px + safe-area inset, same construction as the PDP bar in §17.8).

**Line-level rules**

| Rule | Detail |
|---|---|
| Full variant disclosure | Every selected option is named in text. A cart line reading only "Ліжник «Черемош»" is the most common source of "you sent the wrong size" |
| Origin label | `ProductOrigin` on every line — «✋ Власне виробництво» or «Відібрано Вівчариком», with `partnerRegion` where set. **`partnerName` never appears** ([00-client-decisions-2.md](00-client-decisions-2.md) §E7). A mixed-origin order must be legible as a mixed-origin order before payment, not after (D3) |
| One-of-one lines | Quantity locked at 1, stepper hidden, reservation countdown shown (§18.14) |
| By-weight lines | Quantity is in skeins; derived weight, length and total render beneath. **No dye-lot field and no cross-line lot warning** — lots are not tracked (§E8), so a warning comparing them would be comparing nulls. The batch-variation note lives on the PDP, where it can still change the quantity ordered ([17-product-page-specification.md](17-product-page-specification.md) §17.6.4); in the cart that decision is already made |
| **Custom-size lines** | The line renders the dimensions from `OrderItem.customSpec` in text — «180 × 240 см» — plus the computed area, and carries **all three terms**: «Виготовлення 14 днів, далі доставка», «Лише повна передоплата», «Поверненню не підлягає, окрім браку». Quantity is locked at 1 and the stepper is hidden. Nothing about a fourteen-day prepaid non-returnable purchase may first appear at the payment step ([00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 2, [00-client-decisions-5.md](00-client-decisions-5.md) §H1.1). The unit price is **recomputed server-side** on every cart read from `Product.customSizeRatePerSqmMinor` and the stored dimensions — the figure the PDP displayed is never carried into the cart as an authority (§18.8.7) |
| **Mixed carts carry a standing disclosure, first shown at the add** | A cart holding both a stocked line and a custom line shows a persistent, non-dismissible note in the summary column: the whole order ships together in fourteen days and is prepaid in full ([00-client-decisions-6.md](00-client-decisions-6.md) §J1). It is **not** the announcement — that already fired when the custom line was added ([17-product-page-specification.md](17-product-page-specification.md) §17.6.6) — it is the standing reminder, because a customer returning to a cart three days later has forgotten the toast. §H3b makes this the **expected** case rather than an edge case, and §18.8.7 specifies the mechanism |
| **The delivery row in a mixed cart is singular** | One order, one parcel, one charge. The summary must not itemise delivery per line or per dispatch group — there is one of each, and a breakdown implying two is the misreading §J1 exists to prevent |
| Save for later | Moves the line to the device-local saved list, labelled «Зберегти на цьому пристрої», rather than deleting it. There is no account and no server record — [25-database-schema.md](25-database-schema.md) §25.6 removes `WishlistItem` outright — so the label states the limit rather than implying a sync that does not exist ([17-product-page-specification.md](17-product-page-specification.md) §17.6.5). Removal is undoable for 10 s via the toast |
| Stock drift | On page load and on every mutation, quantities are revalidated against `stockQty`. A reduced line announces politely, states what changed and why, and never silently adjusts |
| Persistence | `Cart.expiresAt` is 30 days. [02-ux-research.md](02-ux-research.md) §2.7 requires the tourist's cart to survive a three-day gap; 30 days covers the multi-session comparison behaviour too |

---

## 18.3 Checkout architecture — the decision

Three candidates, evaluated against the two constraints that actually bind: an audience running
to 75 ([02-ux-research.md](02-ux-research.md) §2.6) and a mobile-majority traffic mix for the
tourist and family segments (§2.7).

| Architecture | Against the 25–75 audience | Against mobile | Verdict |
|---|---|---|---|
| **Single long page** | Poor. A 20-field column with no structure gives no sense of progress, and [02-ux-research.md](02-ux-research.md) §2.6 names working-memory load in multi-step processes as a specific risk. Error recovery is worst here: a validation failure at submit scatters errors across a page the user must hunt through | Poor. Extremely long scroll; the summary is either far away or permanently floating over the fields | Rejected |
| **Multi-step with separate routes** | Mixed. Progress is clear, but each transition is a page load, back-button behaviour becomes a real risk, and a lost step means re-entry — the precise failure §2.6 warns about ("a four-step checkout where step three re-asks something from step one") | Poor on unreliable mountain mobile data (§2.7): each step is a network dependency, and a dropped connection between steps loses state | Rejected |
| **Accordion — one page, sequential sections, completed sections collapse to an editable summary** | **Best.** Exactly one decision visible at a time ([08-design-system.md](08-design-system.md) §8.2 principle 4), prior answers permanently visible as summary lines, editing is one tap and never destroys later input, and all state is client-side so nothing is lost to a dropped connection | **Best.** Natural vertical flow, each section is roughly one screen, the summary collapses to a persistent bar | **Selected** |

### The selected structure

```
/{locale}/checkout            one route, four sections, no page loads

  ① КОНТАКТИ        ─ email, phone                   → collapses to a summary line
  ② ДОСТАВКА        ─ recipient, carrier, address    → collapses to a summary line
  ③ ОПЛАТА          ─ method, method-specific fields → collapses to a summary line
  ④ ПІДТВЕРДЖЕННЯ   ─ full review, terms, submit     → the only place money moves
```

**Why four and not three.** Collapsing confirmation into payment is tempting and wrong for this
audience: the moment of irreversibility deserves its own screen showing everything at once. A
buyer who has just entered a card number and is immediately asked to submit has no opportunity
to notice that the delivery branch is wrong.

**Rules that make the accordion work rather than merely exist**

1. A completed section collapses to a single summary line plus an «Змінити» control. Editing
   reopens it in place and **never clears anything below it**.
2. Only one section is open at a time. Opening section 3 validates and collapses section 2.
3. All four headers are always visible, so the buyer sees the whole path from the first screen.
   Hiding future steps is what makes a checkout feel bottomless.
4. Section state persists to `sessionStorage` on every change. A reload, a crash, or an OS
   killing the browser tab does not restart the checkout.
5. No motion beyond a cross-fade ([13-motion-system.md](13-motion-system.md) §13.11 — "nothing
   in the payment flow moves more than it must").
6. There is no progress bar. Four labelled headers with three collapsed summaries communicate
   progress more precisely than a bar does, and one fewer moving element on a payment surface is
   a gain.

### Desktop layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ВІВЧАРИК                                          🔒 Захищене оформлення  │
│  minimal header: wordmark + phone. No nav, no search, no mascot.          │
├──────────────────────────────────────────────┬────────────────────────────┤
│  ① КОНТАКТИ                        ✓ Змінити │  ВАШЕ ЗАМОВЛЕННЯ           │
│     oksana@example.com · +380671234567       │  ────────────────────────  │
├──────────────────────────────────────────────┤  ▣ Ліжник «Черемош»        │
│  ② ДОСТАВКА                        ✓ Змінити │    150×200 · сірий   5 400 │
│     Нова Пошта, відділення №12, Косів        │  ▣ Гуня «Верховина»        │
├──────────────────────────────────────────────┤    L · білий         5 300 │
│  ③ ОПЛАТА                                    │  ▣ Пряжа «Смерека»         │
│     ◉ Карткою онлайн                         │    5 мотків          1 200 │
│     ○ Наложений платіж з оглядом             │  ────────────────────────  │
│       оглядаєте на пошті до оплати           │  Товари            11 900  │
│     ○ Банківський переказ (IBAN)             │  Знижка                 —  │
│     ○ Передоплата 10%, решта при отриманні   │  Доставка туди        80   │
│                                              │  Доставка назад       80   │
│     [ method-specific fields render here ]   │    (застава, повертається) │
│     [ §18.8.5a worked example if COD ]       │  ────────────────────────  │
├──────────────────────────────────────────────┤  Сплачуєте зараз     160 ₴ │
│  ④ ПІДТВЕРДЖЕННЯ                             │  На пошті         11 820 ₴ │
│     [ ] Погоджуюсь з умовами та політикою    │  ────────────────────────  │
│     ┌────────────────────────────────────┐   │  Разом            11 980 ₴ │
│     │       ОПЛАТИТИ 160 ₴               │   │                            │
│     └────────────────────────────────────┘   │  [ sticky, top-aligned ]   │
│                                              │  ↩ 14 днів на повернення   │
│                                              │  📞 +38 067 997 34 50 Іван │
│                                              │  Не відповідає? Любов:     │
│                                              │     +38 067 960 47 69      │
└──────────────────────────────────────────────┴────────────────────────────┘
   container-form 520 px for the fields · summary 380 px
   ↑ the summary shown is the COD-with-inspection case, §18.8.5a.
     A card-online order collapses it to one «Доставка» line and
     «ОПЛАТИТИ 11 980 ₴».
```

The header is stripped to a wordmark and a phone number. Navigation, search and the locale
switcher are removed — every link on a checkout page is an exit. The phone number stays because
this business's customers are used to calling, and removing the human fallback from a brand
whose current process is entirely human would be a regression dressed as an improvement.

**The header carries one number, and it is Іван's.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G1 makes `+380679973450` primary and it
reverses the earlier decision, recorded in
[15-navbar-specification.md](15-navbar-specification.md), that put Любов's number in the header
on the reasoning that the seller of record should be the public voice. The client's answer
overrides it, and the reason it is the right answer here specifically is that a checkout header
is the moment of contact: one number, no ambiguity, no choice to make while stuck. Любов's number
appears in the **summary column**, framed as the fallback — «Не відповідає? Любов:
+38 067 960 47 69» — and in every transactional email. It does not appear in the header, because
two numbers side by side at the point of panic is a decision nobody wants to make.

---

## 18.4 Field inventory

Every field on the checkout, with its input configuration and its error copy. Autocomplete
attributes are mandatory ([08-design-system.md](08-design-system.md) §8.6) — the highest-leverage
checkout conversion change available, at zero cost. Labels are always visible and above the
field; placeholder-as-label is banned.

Validation timing follows [08-design-system.md](08-design-system.md) §8.6: first validation on
blur, then on change once the field has been marked invalid. Errors appear below the field in
`danger` with an icon, announced via `aria-live="polite"`, with `aria-invalid` and
`aria-describedby` wired. Errors never appear with motion
([13-motion-system.md](13-motion-system.md) §13.11).

### Section ① — Контакти

| Field | `type` | `inputmode` | `autocomplete` | Required | Validation | Error copy (uk) |
|---|---|---|---|---|---|---|
| Email | `email` | `email` | `email` | Yes | RFC-ish shape + a DNS MX check server-side on submit only | «Введіть email — на нього надішлемо номер замовлення» / «Схоже, в адресі помилка. Перевірте символ @» |
| Телефон | `tel` | `tel` | `tel` | Yes | Normalised to E.164. Accepts `067…`, `+38067…`, `38067…`, spaces, dashes, brackets. International orders accept any E.164 country code | «Введіть номер телефону — курʼєр зателефонує перед доставкою» / «Номер має містити 10 цифр після коду країни» |

**There is no account checkbox in this section, and there never will be.** The earlier design
carried «Створити акаунт, щоб відстежувати замовлення» here;
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 removes it along with every other
account surface. Order tracking does not require one — §18.18 delivers it from
`Order.guestToken` and the email address already captured on this very line.

The email label carries a reason («на нього надішлемо номер замовлення»), because a request
for personal data that explains itself is answered more often than one that does not. The phone
label does the same. This is not decoration: for an audience that has been trained by scam
listings, an unexplained data request is a reason to stop.

The phone field **never rejects formatting**. Stripping non-digits server-side is trivial;
telling a 68-year-old that their own phone number is invalid because they typed brackets is a
lost order.

### Section ② — Доставка

| Field | `type` | `inputmode` | `autocomplete` | Required | Validation | Error copy |
|---|---|---|---|---|---|---|
| Імʼя отримувача | `text` | `text` | `given-name` | Yes | 2–40 chars, letters/apostrophe/hyphen | «Вкажіть імʼя отримувача» |
| Прізвище | `text` | `text` | `family-name` | Yes | 2–40 chars | «Вкажіть прізвище — воно потрібне для отримання посилки» |
| По батькові | `text` | `text` | `additional-name` | Conditional | Required for Ukrposhta and for Nova Poshta COD | «Укрпошта вимагає по батькові для видачі відправлення» |
| Спосіб доставки | `radio` | — | — | Yes | One of four | «Оберіть спосіб доставки» |
| Місто / населений пункт | `text` (combobox) | `text` | `address-level2` | Carrier-dependent | Must resolve to a carrier settlement `ref` | «Оберіть місто зі списку» |
| Відділення / поштомат | combobox | `text` | — | NP branch/locker | Must resolve to a warehouse `ref` | «Оберіть відділення» |
| Вулиця | `text` | `text` | `address-line1` | NP courier | 2–80 chars | «Вкажіть вулицю» |
| Будинок | `text` | `text` | `address-line2` | NP courier | 1–10 chars | «Вкажіть номер будинку» |
| Квартира | `text` | `numeric` | — | No | — | — |
| Індекс | `text` | `numeric` | `postal-code` | Ukrposhta | 5 digits | «Індекс складається з 5 цифр» |
| Коментар до замовлення | `textarea` | `text` | — | No | ≤500 chars, counter shown from 400 | — |

Address fields are **conditional on carrier** and render only when relevant. A Ukrposhta buyer
never sees a warehouse selector; a pickup buyer sees neither. Rendering all fields and
disabling the irrelevant ones is the alternative, and it fails the "one decision per screen"
principle badly.

**International addresses use a different field set, not a bent domestic one.** Now that
`en`/`pl`/`de` are transactional ([00-client-decisions-2.md](00-client-decisions-2.md) §E11),
section ② branches on country first:

| Field | Applies | Notes |
|---|---|---|
| Країна / Country | International only | A `<select>` at the top of the section. Selecting anything other than Ukraine swaps the whole field set and removes COD from section ③ (§18.23) |
| Address line 1 / 2 | International | `address-line1` / `address-line2`. No warehouse ref, no по батькові — a patronymic is a Ukrainian and Polish convention and is meaningless to a German carrier |
| City, postal code, region | International | `address-level2`, `postal-code`, `address-level1`. Postal-code format validation is per country and permissive: a warning, never a block |
| По батькові | Ukraine only | Hidden entirely outside Ukraine |

Forcing an international address into the Nova Poshta shape is the common failure here, and it
produces undeliverable parcels rather than merely awkward forms.

`inputmode="numeric"` on the postal code rather than `type="number"` — a number input on a
postal code brings spinners, permits exponent notation, and silently strips leading zeros.

### Section ③ — Оплата, method-conditional

| Field | Method | `type` | `inputmode` | `autocomplete` | Validation | Error copy |
|---|---|---|---|---|---|---|
| Спосіб оплати | all | `radio` | — | — | Required | «Оберіть спосіб оплати» |
| Card fields | CARD_ONLINE | — | — | — | **Never rendered by us.** PSP iframe or redirect, §18.8 | Surfaced from the PSP verbatim plus a plain-language gloss |
| Платник — ПІБ | BANK_TRANSFER | `text` | `text` | `name` | Required | «Вкажіть ПІБ платника — за ним звіримо оплату» |
| Підтверджую передоплату | 10% PREPAY | `checkbox` | — | — | Required | «Підтвердіть умови часткової оплати» |

Card data never touches this application's DOM. That is a PCI-scope decision before it is a UX
decision: rendering our own card form would pull the entire frontend into SAQ A-EP scope, and
this business has no appetite for that compliance surface.

**The method list itself is data, not markup.** The radio group renders exactly what
`availableMethods(cart, destination)` returns (§18.8.7); it never receives four options and hides
three, because a hidden option is a form field an attacker can still submit. Where the list has
one member the group still renders as a radio with that member selected rather than collapsing to
a heading, so the buyer can see that a choice was made and what it was.

**Two elements render inside section ③ that are disclosures rather than inputs.** The §18.8.5a
return-deposit worked example renders when «наложений платіж з оглядом» is selected, always
expanded. The §18.8.7 prepayment reason renders in place of the COD row when the cart holds a
custom-size line. Neither is a `<details>`, neither is dismissible, and neither carries a
checkbox — each states a charge the buyer is about to see in the summary rather than a
third-party liability they must acknowledge, which is exactly what distinguishes them from the
duty notice in §18.23.3.

### Section ④ — Підтвердження

| Field | `type` | Required | Validation | Error copy |
|---|---|---|---|---|
| Погоджуюсь з умовами та політикою конфіденційності | `checkbox` | Yes | Must be checked | «Щоб оформити замовлення, потрібно погодитись з умовами» |
| Хочу отримувати новини | `checkbox` | No | Unchecked by default, always. Double opt-in for `de` ([25-database-schema.md](25-database-schema.md) §25.9) | — |

The terms checkbox is unchecked by default and the links open in a new tab, so activating them
never destroys the form. Pre-checked consent is unlawful in the `de` and `pl` locales and is a
trust failure in all four.

---

## 18.5 Delivery — Nova Poshta

Nova Poshta is the dominant carrier and its selector is the most complex control in the
checkout. Getting it wrong costs more orders than any other single element here.

### 18.5.1 The selector UX

```
Спосіб доставки
  ◉ Нова Пошта — відділення         {{NP_BRANCH_PRICE}}   1–3 дні
  ○ Нова Пошта — поштомат           {{NP_BRANCH_PRICE}}   1–3 дні
  ○ Нова Пошта — курʼєр за адресою {{NP_COURIER_PRICE}}   1–3 дні
  ○ Укрпошта — відділення           {{UKRPOSHTA_PRICE}}   3–7 днів
  ○ Забрати в Яворові — магазин і виробництво  безкоштовно  готово за 1 день

Місто
┌──────────────────────────────────────────────────────┐
│ Кос                                               ⌕  │
├──────────────────────────────────────────────────────┤
│ Косів, Івано-Франківська обл.                        │  ← keyboard-navigable
│ Косівська Поляна, Закарпатська обл.                  │     listbox
│ Костянтинівка, Донецька обл.                         │
└──────────────────────────────────────────────────────┘

Відділення
┌──────────────────────────────────────────────────────┐
│ Відділення №1: вул. Незалежності, 66           ▾    │
├──────────────────────────────────────────────────────┤
│ №1  вул. Незалежності, 66        до 30 кг  пн–сб    │
│ №2  вул. Шевченка, 12            до 30 кг  пн–пт    │
│ №3  Поштомат, вул. Грушевського  до 20 кг  24/7  ⚠  │
└──────────────────────────────────────────────────────┘
  ⚠ Ваше замовлення важить 3.4 кг і має габарит 60×40×25 см —
    поштомат №3 не підійде за розміром.               warning
```

| Decision | Choice | Why |
|---|---|---|
| City input | Type-ahead combobox, minimum 2 characters, 250 ms debounce | A dropdown of every Ukrainian settlement is unusable; free text produces undeliverable addresses |
| Branch input | Combobox **pre-populated** on city selection, not requiring typing | Most buyers know their branch number and want to pick it from a list. Requiring a search to see any option is a common and costly mistake |
| Branch metadata | Number, street, weight ceiling, opening hours | Opening hours matter to a working buyer and are cheap to show |
| Size filtering | Lockers whose dimension limit is below the cart's largest item are shown **disabled with the reason** | A ліжник does not fit a locker. Discovering that after payment is a refund. Showing the locker greyed with a stated reason is better than hiding it, because the buyer otherwise thinks the locker is missing |
| Map | Deferred, not launch scope | A map view is expensive, adds a third-party dependency and a tile payload, and serves a minority of buyers who already know their branch number. Revisit after measurement |
| Remembering | Last-used city and branch stored in `localStorage` and pre-filled | Repeat buyers in this category reorder; the needleworker persona is explicitly habitual |
| Keyboard | Full ARIA combobox: `↑`/`↓` move, `Enter` selects, `Esc` closes, active option announced | 48 px option rows, which also serves touch |

### 18.5.2 API integration and the key-exposure problem

[00-assumptions.md](00-assumptions.md) V2 flags this directly: *whether address autocomplete can
be called client-side without exposing the API key*. **It cannot, and it must not be
attempted.**

The Nova Poshta API authenticates with a single account-level key sent in the request body. A
key shipped to the browser is a key published. It permits enumeration of the account's data,
consumption of the rate limit by a third party, and in some endpoint families the creation of
waybills against the account. There is no client-side integration of this API that is safe.

**The architecture:**

```
browser ──▶ /api/shipping/np/settlements?q=…   our Node API
            /api/shipping/np/warehouses?city=…
            /api/shipping/np/price            (weight, dims, declared value)
                    │
                    ├─ key held server-side in the secret store only
                    ├─ per-IP rate limit, 20 req/min, above the 250 ms debounce
                    ├─ Redis cache: settlements 24 h, warehouses 6 h, price 1 h
                    ├─ nightly full warehouse-reference sync into Postgres
                    └─ circuit breaker: 3 consecutive failures → open for 60 s
                            │
                            ▼
                    Nova Poshta API
```

Four properties of this design carry their weight:

1. **The nightly reference sync is the fallback, not an optimisation.** Settlements and
   warehouses change slowly. A local copy means that when the carrier API is down — and it goes
   down — the selector still works from the last sync, with a banner noting the data's age.
   Checkout continuing to function during a carrier outage is worth the sync job on its own.
2. **Caching is what makes the rate limit a non-issue.** A type-ahead firing per keystroke
   against an upstream API would exhaust the quota within a day of real traffic.
3. **Price is fetched separately and never cached across carts**, because it depends on weight,
   dimensions and declared value from the specific cart.
4. **The circuit breaker fails to the cached reference data**, not to an error. A checkout that
   shows an error because a third party is slow has converted someone else's outage into our
   lost order.

Shipping weight comes from `ProductVariant.weightGrams` and dimensions from
`ProductVariant.dimensionsMm` ([25-database-schema.md](25-database-schema.md) §25.3). For
by-weight products the purchased quantity **is** the shipping weight, which makes the estimate
more accurate for пряжа and ровниця than anywhere else in the catalogue
([00-client-decisions.md](00-client-decisions.md) D4).

`Order.npWarehouseRef` stores the selected warehouse reference; the human-readable address is
snapshotted into `Order.shippingAddress` JSON. Storing only the ref would mean a warehouse
renumbering rewrites historical orders.

### 18.5.3 Ukrposhta

Cheapest, slowest, and genuinely preferred in villages that Nova Poshta serves poorly — which
describes a meaningful share of this business's own region.

| Aspect | Treatment |
|---|---|
| Address model | Index + settlement + street/branch, not a warehouse ref. Ukrposhta's branch API is less complete than Nova Poshta's, so the index is the authoritative field |
| Index validation | 5 digits, cross-checked against the settlement where the reference data permits; a mismatch produces a warning, not a block — the reference data is not reliable enough to override a buyer who knows their own index |
| По батькові | Required. Ukrposhta requires a full patronymic for release of an item, and discovering that at the counter is a failed delivery |
| Transit copy | «3–7 днів» stated plainly, with no softening — setting an honest slow expectation is cheaper than a support ticket on day four |
| COD | Available, with the carrier's own fee stated |

### 18.5.4 Pickup in Yavoriv — «Забрати в Яворові»

The path most likely to be under-designed and most valuable to over-design. **Pickup is from
Яворів, not Косів** — [00-client-decisions-2.md](00-client-decisions-2.md) §E2 resolves the
production address as вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область,
78644. Косів is the raion town, roughly 20 km away, and quoting it here would send buyers to the
wrong village.

That correction is worth more than an address fix. Яворів is the recognised centre of Hutsul
lizhnyk weaving — «столиця ліжникарства», with its own Музей ліжникарства — so a pickup option
in this category is not a logistics convenience, it is an invitation to the place the product
comes from, in a village that already receives craft tourism. It is also one of the few launch
channels that does not depend on domain authority ([00-client-decisions.md](00-client-decisions.md)
D2), which matters more now that §E3 has removed the assumed Instagram channel.

**Round 3 makes that literal.** [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms
the Яворів site houses **both retail and production** — «там знаходиться і магазин і
виробництво». The option is therefore not "collect a parcel from a workshop door"; it is "come
to the shop attached to the production floor". Three things follow:

| | Before F2 | After F2 |
|---|---|---|
| Label | «Самовивіз» — a logistics term | **«Забрати в Яворові»** — a place, named |
| What the buyer is told | An address and a ready date | An address, a ready date, and **what is there**: a shop, and the production behind it |
| What the option is doing commercially | Saving the shipping fee | Answering the category's primary purchase anxiety — *is this a real factory or a reseller* ([02-ux-research.md](02-ux-research.md) §2.4, A1/A3) — at the last moment before payment |

Renaming it is not cosmetic. «Самовивіз» tells a buyer they will be doing the shop a favour;
«Забрати в Яворові, де магазин і виробництво» tells them they will be seeing something. The
second converts better and is also simply more accurate.

Selecting pickup replaces the address block entirely with:

```
ЗАБРАТИ В ЯВОРОВІ — БЕЗКОШТОВНО

Магазин і виробництво в одному місці.
Можна подивитися вироби наживо й забрати замовлення.
Цех можна оглянути — разом із власником.
Зателефонуйте заздалегідь, щоб домовитися про час.

вул. Петруші, с. Яворів, Косівський район,
Івано-Франківська область, 78644

Графік гнучкий — зателефонуйте перед візитом:
+38 067 997 34 50 (Іван)
Якщо не відповідає — +38 067 960 47 69 (Любов)
Зачинено 24–26 грудня, 1 та 6 січня

Замовлення буде готове: 15 травня (пʼятниця)   ← computed on the real calendar
Ми зателефонуємо, коли все буде зібрано.

[ Показати на карті ]         static map image, lazy, no third-party JS
```

**Round 4 resolves the open item this block previously carried, and it resolves it upward.** The
earlier revision claimed only a shop and co-location, and flagged in §18.24 that whether the
**production floor itself** is visitable was unconfirmed.
[00-client-decisions-4.md](00-client-decisions-4.md) §G3 answers it: «Так, відвідувачі можуть
оглянути цех з Власником.» The block therefore gains two lines, and the second one is what makes
the first safe to publish.

| Claim | Status | Why it can now be printed |
|---|---|---|
| «Магазин і виробництво в одному місці» | Confirmed, F2 | Unchanged |
| «Цех можна оглянути — разом із власником» | **Confirmed, §G3** | The tour is accompanied by Іван, which is precisely what makes it credible rather than a liability |
| «Зателефонуйте заздалегідь, щоб домовитися про час» | **Mandatory qualifier** | §G3 forbids presenting it as drop-in. It depends on one person being present, and the hours are genuinely variable (§E3). The two facts say the same thing: call first |
| A demonstration, or weaving in progress on the day | **Still not claimed** | §G3 frames the visit as a conversation, not a tour route. Copy says what a visitor will see and be told, never what will be running |

**No booking control appears here at any breakpoint.** §G3 rules it out, and the checkout is
where the temptation is strongest — the buyer is already in a form, a date field would cost
nothing to add, and an "arrange your visit" step looks like service. It is the wrong instrument:
a calendar implies capacity that does not exist in a two-person business, and it generates
no-shows nobody will chase. A phone number and «зателефонуйте, щоб домовитися» is correct at this
scale, and it stays correct as the business grows because the constraint is the owner's time
rather than the software.

**The visit is not a delivery promise and must not read as a condition of pickup.** The two lines
sit beneath the address as an invitation; the ready-date and the "we will call you" line remain
the operative content of the step. A buyer who only wants their parcel must not come away
believing they have to take a tour to collect it.

**Opening hours are deliberately not printed here.** §E3 records that the workshop's hours are
genuinely variable — 11:00–19:00 one day, different the next — and that Google Maps is the live
source. Printing a fixed schedule on a checkout step would be wrong twice a week, and a buyer who
drives to a closed workshop after reading our hours does not blame the schedule, they blame the
shop. «Графік гнучкий — зателефонуйте перед візитом» is the honest version, and it costs nothing:
a pickup buyer must be phoned anyway when the order is assembled.

**Both numbers appear, Іван first and Любов explicitly framed as the fallback**
([00-client-decisions-4.md](00-client-decisions-4.md) §G1). This is one of the two surfaces in
this document that carries both — the other is the transactional email set — and the reason is
the same in each: the buyer is being asked to coordinate a physical visit, and a single
unanswered number converts a pickup into a failed journey. «Якщо не відповідає — +38 067 960 47
69 (Любов)» states the relationship rather than listing two equal numbers, which is what §G1
requires and also what a person actually needs at the moment they are dialling.

Ready-date computation respects the December/January closures but not a daily schedule, since
there is no reliable one to compute against. An order placed Saturday at 18:00 is ready Monday.
No address fields are required, no shipping row appears in the summary, and phone contact is
mandatory since it is the only coordination channel.

The map is a **static image** with a link out, not an embedded interactive map. An embedded map
is a third-party script on a payment page, a consent-banner obligation in `de`, and a
measurable performance cost, in exchange for a pan-and-zoom nobody needs to find a village
address.

---

## 18.6 Shipping cost calculation

| Method | Charge | Source |
|---|---|---|
| Nova Poshta, branch or locker | `{{NP_BRANCH_PRICE}}`, computed on weight, dimensions and declared value | Live `/api/shipping/np/price`, cached 1 h |
| Nova Poshta, courier | `{{NP_COURIER_PRICE}}`, same inputs | Live |
| Ukrposhta | `{{UKRPOSHTA_PRICE}}` | Tariff table, `Setting` |
| Pickup, Yavoriv | 0 | — |
| **Return-shipping deposit**, Ukrainian COD-with-inspection only | The **same tariff as the forward leg** for the selected carrier and destination, charged online at checkout as `Order.shippingReturnDepositMinor` | [00-client-decisions-5.md](00-client-decisions-5.md) §H1.3. Quoted from the same `/api/shipping/np/price` call as the forward leg, with the origin and destination reversed. **Never a percentage of the goods** — a deposit that scales with the product price reads as a fee on the purchase rather than as the cost of a parcel coming home. §18.8.5a |
| International | **Not calculated at checkout.** The order is submitted, then quoted, then paid | [00-client-decisions-3.md](00-client-decisions-3.md) F4: carriers are chosen per order — Nova Poshta, Ukrposhta and others case by case — so there is no rate table and no live API to call. `{{INTL_CARRIER}}` resolves to *multiple, quoted per order*. The enquiry-then-invoice flow is specified in full in §18.23.7 and is the **recommended permanent model**, not a stopgap |
| Customs, duties, import VAT — all destinations | **0 charged by us, paid in full by the buyer at destination** | F4. Effectively DAP. Never collected, never estimated into the total, and disclosed as a blocking element before payment (§18.23.3) |

**Every domestic tariff on this page is a token, and none of them has a default.**
[00-client-decisions-2.md](00-client-decisions-2.md) leaves delivery tariffs and the
free-shipping threshold unresolved, and the 80 / 100 / 55 UAH figures previously quoted here come
from [00-existing-site-audit.md](00-existing-site-audit.md) §0.6 — the **adjacent business**.
They carry no authority for Вівчарик and must not ship as placeholders that happen to look like
prices, because a plausible wrong number is never questioned while an unresolved token fails the
build. All four resolve from `Setting` keys shared with the PDP estimator
([17-product-page-specification.md](17-product-page-specification.md) §17.12) and the homepage
trust row, so no surface can quote a stale figure.

Calculation runs server-side on every cart or address mutation and is **recomputed at order
creation**. A quote held in client state across a long session is a quote that can drift.

COD carries the carrier's own cash-handling fee, paid by the buyer at the counter. It is
**disclosed as a line in the summary** rather than absorbed silently: an unexpected surcharge at
the point of collection is exactly the experience that generates a one-star review.

`shippingMinor` is **replaced by two fields on a COD-with-inspection order**, not supplemented by
them: `shippingForwardMinor` and `shippingReturnDepositMinor`
([25-database-schema.md](25-database-schema.md) §25.5). A single `shippingMinor` on such an order
would have to be the sum of two legs with different fates — one consumed, one credited — and
every report that reads it would be wrong in a different way. The existing nullable-`totalMinor`
rule is unaffected.

**Custom-size lines are priced server-side and never from the client.** A cart line carrying
`customSpec` has its unit price recomputed from `Product.customSizeRatePerSqmMinor` and the
stored dimensions on every cart read and again at order creation, exactly as
[17-product-page-specification.md](17-product-page-specification.md) §17.6.6 specifies. The
browser's figure is informational. This is the one line type where the price is a function of
user input rather than a database row, which makes it the one line type where a client-supplied
price would be trivially tampered with — and the order is prepaid in full, so there is no later
checkpoint at which the discrepancy would surface.

---

## 18.7 The free-shipping threshold

**Free shipping** applies above `{{FREE_SHIPPING_THRESHOLD}}` and only with full prepayment.
Both conditions are stated together every time — a threshold shown without the prepayment
condition is an unkept promise at the payment step.

**The threshold is unknown.** `{{FREE_SHIPPING_THRESHOLD}}` is unresolved in
[00-client-decisions-2.md](00-client-decisions-2.md); the figure observed in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.6 belongs to the adjacent business and
is a market reference, not a value. Two design consequences follow, and both hold regardless of
what the number turns out to be:

1. **No progress bar in cart or checkout.** A bar reading "add 18,100 ₴ for free delivery"
   communicates unattainability, not motivation. A bar is only defensible once the threshold is
   set at a level a real order reaches, and that has not happened. The threshold is stated once
   as a fact in the summary and not repeated.
2. **Setting the threshold is a merchandising decision, and it should be made from Вівчарик's own
   price list rather than inherited.** Against a domestic shipping cost of roughly one to two
   hundred hryvnia, a threshold no realistic order reaches provides no AOV lift and no goodwill,
   while one set just above the typical order value does both. Recorded as a recommendation; the
   number belongs to the business.
3. **Free shipping is domestic only, and this is now a ruling rather than a recommendation.**
   [00-client-decisions-3.md](00-client-decisions-3.md) F4 states it directly: free shipping
   never applies internationally **regardless of order value**. The cost differential is an order
   of magnitude, the threshold was never modelled against it, and under enquiry-then-invoice
   (§18.23.7) there is no cart-time figure to compare against a threshold anyway. The rule is
   enforced in the pricing service, not in the UI: a promotion or coupon that would zero
   `shippingMinor` on a non-UA destination is rejected at order creation, because a discount
   engine that can be configured into an unbounded loss will eventually be configured that way.
   The threshold line renders «тільки в межах України» everywhere it appears, including the PDP
   estimator ([17-product-page-specification.md](17-product-page-specification.md) §17.12).

---

## 18.8 Payment

`PaymentMethod` in [25-database-schema.md](25-database-schema.md) §25.5 has three members —
`CARD_ONLINE`, `COD`, `BANK_TRANSFER`. The legacy 10% prepayment is not a fourth method; it is
`BANK_TRANSFER` or `CARD_ONLINE` with a partial capture, and modelling it as a separate method
would fragment the payment state machine for no benefit.

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.2 sets the scope of each:

| Method | Scope | Notes |
|---|---|---|
| Online card (WayForPay) | **All products, all destinations** | The only method available outside Ukraine |
| **Наложений платіж з оглядом** | **Ukraine only, stocked-only carts** | Inspection at the Nova Poshta or Ukrposhta branch before payment. Absent from the derived method list for **any cart containing a custom-size line**, not only for that line (§H1.1, [00-client-decisions-6.md](00-client-decisions-6.md) §J1), and not available internationally. Carries the return-shipping deposit (§18.8.5a) |
| IBAN transfer | Ukraine, B2B | Unchanged |
| Partial prepayment | **Ukraine, every stocked order** | **Widened in round 8.** Prepayment = 10% of the order, **never less than 460 ₴** ([00-client-decisions-8.md](00-client-decisions-8.md) §L14), never more than the order total; balance at the branch. See §18.9 |

```
③ ОПЛАТА

  ◉ Картка онлайн                                          рекомендовано
    Visa / Mastercard
    Оплата обробляється WayForPay. Ми не зберігаємо дані картки.

  ○ Наложений платіж з оглядом — оглядаєте перед оплатою
    Отримуєте посилку на відділенні, оглядаєте виріб
    і лише потім платите за нього.
    Доставку в обидві сторони оплачуєте зараз — 80 + 80 ₴.
    Якщо залишаєте товар, 80 ₴ віднімаються від ціни.
    Як це працює ↓                       §18.8.5a, always expanded

  ○ Банківський переказ (IBAN)
    Рахунок надішлемо на email. Відправка після зарахування, 1–2 робочі дні.

  ○ Передоплата 10%, решта при отриманні
    Для великих замовлень із товарів у наявності.

  ── якщо в кошику є виріб на індивідуальний розмір ──────────────
  Доступна лише оплата карткою онлайн.
  Виріб шиється за вашими розмірами, тому оплата — повна, наперед.
```

**The method name changed, and the change is not cosmetic.** «Накладений платіж» is a logistics
term that names who carries the money. «**Наложений платіж з оглядом**» names what the buyer
gets, and §H1.2 is explicit that the inspection right is the thing worth saying: for someone
spending 5,000–15,000 UAH with a brand that has no reviews, no history and no social presence,
opening the parcel at the counter before paying removes the single largest objection a cold-start
domain faces. Burying that in a policy page wastes it.

### 18.8.1 Card online via WayForPay

`{{PSP}}` resolves to **WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
The earlier LiqPay recommendation is withdrawn; it was a recommendation, this is a decision, and
the decision is the client's.

#### What this document deliberately does not say

Nothing below states a WayForPay endpoint name, parameter name, payload shape, signature field
order, or acknowledgement format. **Six facts are explicitly unverified** and are recorded as
Phase 0 tasks in §E10:

| # | Unverified | Consequence if guessed |
|---|---|---|
| **V6** | Which integration mode is available to this merchant — hosted redirect page, embedded widget, or direct API | **The one that changes this document.** It determines the shape of step ③, the return-URL handling, and what "interrupted payment" even means. §18.8.2 specifies both branches |
| V7 | Signature algorithm and the exact field order used for request and response HMAC | A wrong field order fails silently: every request is rejected as unsigned, or worse, signatures validate in testing and not in production. This is not discoverable by trial |
| V8 | Webhook payload shape, the expected acknowledgement response, and retry behaviour | An unrecognised acknowledgement makes the PSP retry indefinitely; §18.15's idempotency design assumes retries but not an infinite loop |
| V9 | Refund and partial-refund API support | §18.14's automatic refund on a lost one-of-one and §18.13's `PARTIALLY_REFUNDED` state both depend on it. If refunds are manual-only, both need a fallback |
| V10 | Whether a ФОП on the simplified tax system can contract, and what onboarding documents are required | Blocks the merchant account entirely, and therefore the launch. `{{LEGAL_ID}}` (§E1) is an input to it |
| V11 | Supported currencies and whether non-UAH settlement is possible | Determines whether EU buyers are charged in their own currency or in UAH — §18.23 |

The rule is absolute: **no WayForPay API detail is written into this document, into
[26-api-architecture.md](26-api-architecture.md), or into code until it has been read from
WayForPay's current official documentation.** PSP integration details drift between versions,
and a signature format reconstructed from memory is the class of bug that passes review, passes
staging, and fails in production against real money.

What *is* specified here is everything that does not depend on those six answers: the order
lifecycle, the state machine, the idempotency design, the recovery paths, and both possible step
shapes. The integration sits behind an internal `PaymentProvider` interface so that resolving
V6–V11 changes an adapter rather than the checkout.

### 18.8.2 Both integration branches, because V6 is unresolved

The integration mode is not a preference to be settled by argument — it is a fact about what
WayForPay offers this merchant, and it is unknown. Picking one and hoping is the failure mode
this section exists to prevent, because the two shapes differ in *where the buyer is when
something goes wrong*, and that determines the entire recovery design.

| | **Branch A — redirect / hosted page** | **Branch B — embedded widget** |
|---|---|---|
| Where card data is entered | On WayForPay's own page, in a different browsing context | In a WayForPay-owned document embedded in section ③ |
| Accordion integrity | Broken — the buyer leaves the site mid-flow and returns to a different URL | Intact — sections ①–④ stay on one page and ④ genuinely reviews before charging |
| When the `Order` is created | **Before** the redirect, `PENDING`/`UNPAID` | At submit, same as branch A — see below |
| What the buyer returns to | `/checkout/return?order=…`, which must reconstruct context from the order, not from client state | Nothing to return to; the page never went away |
| PCI scope | Minimal — no card field ever exists in our document | Minimal — the fields live in the widget's document, not ours |
| Interrupted payment means | Tab closed on WayForPay's page, browser back, network loss during 3-D Secure, or a redirect blocked by a popup or security tool | Widget closed, 3-D Secure opened in a new window that was dismissed, or the parent page reloaded |
| Recovery mechanism | The return page polls; the webhook is authoritative | The widget's completion callback is a **hint**; the webhook is authoritative |
| Preferred if available | — | Yes, for the accordion and for mobile, where a redirect to a bank app and back is where orders are lost |

**One design decision is common to both branches and is what makes either survivable: the
`Order` is created before any payment attempt, in `PENDING`/`UNPAID`, with a client idempotency
key.** In branch A this is forced — there must be something to return to. In branch B it is a
choice, and it is the right one: it means an embedded payment interrupted by a closed widget or
a reloaded page leaves behind exactly the same artefact as an interrupted redirect, so §18.19's
recovery table has one set of rows instead of two.

**The second common decision: no branch trusts its own completion signal.** Branch A must not
trust the return URL's query parameters — they are attacker-controlled and this is the classic
payment vulnerability. Branch B must not trust the widget's success callback — it fires in the
buyer's browser, and a browser is not a source of truth about money. In both, the authoritative
event is the server-to-server webhook (§18.15), and the UI's only job is to wait for it
gracefully.

**What remains genuinely different, and must be built separately:**

| Concern | Branch A | Branch B |
|---|---|---|
| Return URL | `/{locale}/checkout/return?order={id}` must be registered with the PSP and must work when opened cold, with no `sessionStorage` — a buyer may return in a different tab or after an app switch | Not used. A return URL is still registered as a fallback in case the widget escalates to a full-page redirect for 3-D Secure |
| State reconstruction | From `Order` on the server. `sessionStorage` is a convenience, never a dependency | From the live page. But the page must still survive a reload mid-payment by re-reading order status on mount |
| Pre-redirect interstitial | Required (§18.8.3) | Not applicable |
| Cart clearing | On `paymentStatus = PAID` only, never before the redirect | Identical rule |
| Accessibility gate | The hosted page is WayForPay's; if it fails a keyboard or screen-reader check there is no remedy but to escalate to the provider | The iframe must carry a `title` and be keyboard-reachable. **If the widget fails the check, branch A is used for all buyers** — §18.21 |
| Mobile 3-D Secure | Bank app switch then return; the return URL must survive it | The widget may open a new window; the parent must poll rather than wait on a callback that may never fire |

**Both branches ship.** The cost of building both is one adapter and one extra return route; the
cost of building the wrong one is discovering it during PSP onboarding, after the checkout is
built, at the point in the schedule where nothing can absorb a redesign. The choice becomes a
configuration flag once V6 is answered.

### 18.8.3 The redirect branch in detail

This is where checkouts lose orders, so it is specified rather than assumed.

```
④ ПІДТВЕРДЖЕННЯ  ▸ [ОПЛАТИТИ]
        │
        ├─ 1. Server creates Order (PENDING / UNPAID), reserves stock,
        │     issues an idempotency key, persists the cart snapshot
        ├─ 2. Confirmation email is NOT sent yet
        ├─ 3. Interstitial renders: «Переходимо до захищеної оплати…»
        │     with an explicit «Продовжити» button if the redirect is
        │     blocked or slow — never a silent auto-redirect alone
        ├─ 4. Browser → WayForPay hosted page
        │
        ▼
   ┌────────────────────────────────────────────────────┐
   │  WayForPay page — 3-D Secure, bank app confirmation │
   └────────────────────────────────────────────────────┘
        │
        ├─ success  → /checkout/return?order=…  → poll status
        ├─ failure  → /checkout/return?order=…  → §18.19 recovery
        ├─ cancel   → /checkout/return?order=…  → order intact, section ③ reopens
        └─ buyer closes the tab → webhook still arrives (§18.15)
```

**The return page never decides the outcome.** It polls `GET /api/orders/{id}/status` every
1.5 s for up to 20 s while showing «Перевіряємо оплату…». The authoritative event is the
webhook, not the redirect. Trusting the redirect's query parameters is the classic payment
vulnerability: they are attacker-controlled.

If the webhook has not arrived within 20 s, the page switches to «Оплата обробляється. Ми
надішлемо підтвердження на email протягом кількох хвилин.» and stops polling. The order is real
and the buyer has a number; an indefinite spinner converts a slow webhook into an abandoned
order and a duplicate payment attempt.

**The return page must work cold.** It is reachable with no `sessionStorage`, no cart cookie and
no referrer — because a buyer who confirmed payment in a bank app may return in a new tab, and
because the URL gets bookmarked, forwarded and reopened hours later. Everything it renders comes
from the `Order` row keyed by the id in the URL, and it discloses nothing beyond status until the
order is `PAID`, at which point it redirects to the `guestToken` confirmation URL (§18.16).

**Before the redirect, the cart is preserved, not cleared.** Clearing it is a one-line
convenience that destroys recovery if payment fails. The cart is cleared only on
`paymentStatus = PAID`, or on `PENDING` for COD.

### 18.8.4 The embedded branch in detail

If V6 confirms an embedded widget, section ③ hosts it and the buyer never leaves. That removes
the redirect's largest failure — the return journey — and introduces two smaller ones in its
place.

```
③ ОПЛАТА  ◉ Картка онлайн
        │
        ├─ Widget mounts in a WayForPay-owned document inside section ③
        │  Card fields are never in our DOM (PCI scope unchanged)
        │
④ ПІДТВЕРДЖЕННЯ  ▸ [ОПЛАТИТИ]
        │
        ├─ 1. Server creates Order (PENDING / UNPAID), reserves stock,
        │     issues an idempotency key  ← identical to branch A
        ├─ 2. Confirmation email is NOT sent yet
        ├─ 3. Widget is invoked for the created order
        │
        ▼
   ┌────────────────────────────────────────────────────┐
   │  3-D Secure — may render in the widget, in a new    │
   │  window, or as a full-page escalation               │
   └────────────────────────────────────────────────────┘
        │
        ├─ widget callback fires    → treated as a HINT; begin polling
        ├─ widget closed by buyer   → order intact, section ③ reopens
        ├─ parent page reloaded     → on mount, re-read order status
        ├─ 3-D Secure window lost   → polling continues regardless
        └─ nothing at all           → webhook resolves it (§18.15)
```

**The two failure modes unique to this branch:**

1. **The callback that never fires.** A widget's success callback is a client-side event. A
   dismissed 3-D Secure window, a mobile browser reclaiming memory during a bank-app switch, or
   a blocked third-party context all produce a completed payment with no callback. The design
   consequence is that the callback never *drives* anything — it only starts polling earlier
   than the poll would have started anyway. The same `GET /api/orders/{id}/status` poll used by
   branch A runs here, with the same 20-second ceiling and the same «Оплата обробляється»
   fallback copy.
2. **The parent page that reloads mid-payment.** In branch A the buyer is elsewhere when this
   happens and the return URL catches them. Here, a reload destroys the widget and its state. The
   recovery is to persist the created order id in `sessionStorage` at submit and, on every mount
   of `/checkout`, check for a `PENDING` order belonging to this cart: if one exists, the page
   opens on a resumption state — «Ви почали оплату замовлення № … » with «Продовжити оплату» and
   «Скасувати і змінити спосіб оплати» — instead of a blank section ③. Without this, the buyer's
   own reload looks like a lost order and produces a second payment attempt.

**3-D Secure may escalate to a full-page redirect even in this branch.** Issuer behaviour is not
under the merchant's control. The return URL from branch A is therefore registered and
functional whichever branch is configured — which is also why building both costs one route
rather than a second architecture.

### 18.8.5 «Наложений платіж з оглядом» — cash on delivery with inspection

Confirmed to stay, and confirmed with its inspection right stated in the open
([00-client-decisions-5.md](00-client-decisions-5.md) §H1.2). For
[02-ux-research.md](02-ux-research.md) anxiety A4, COD is the buyer's only guarantee in a market
where distance selling frequently disappoints, and removing it on a brand-new domain with zero
reviews and zero history would remove the one instrument that makes a first order from an unknown
seller feel safe.

| Rule | Detail |
|---|---|
| Order state | `PENDING` / `UNPAID`, moving to `PAID` on carrier remittance, not on dispatch |
| Fee disclosure | The carrier's percentage plus fixed fee, stated in the method description and as a summary line |
| Shipping | **Both legs charged online at checkout** — forward shipping plus a return-shipping deposit (§18.8.5a). This is the round-5 change and it is the one that needs the most care in the wording |
| Unavailable for | **Any cart containing a custom-size line** ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.1, [00-client-decisions-6.md](00-client-decisions-6.md) §J1 — the constraint is cart-level, because the whole order ships and is paid as one), orders above `{{COD_CEILING}}`, and **every destination outside Ukraine** (§E11). Outside Ukraine the method is not rendered at all rather than shown disabled — a German buyer has no concept of «наложений платіж» and disabling an option they never wanted is noise |
| Fraud control | Phone confirmation before dispatch on first-time buyers above `{{COD_REVIEW_THRESHOLD}}`. Refused COD parcels are the concrete cost, and [02-ux-research.md](02-ux-research.md) §2.8 R7 schedules the measurement that sets both numbers |
| Positioning | Second in the list, not first. Card is recommended; COD is available without apology or friction |

**The inspection right is the row's headline, not its footnote.** The first line the buyer reads
is what they get — «оглядаєте виріб і лише потім платите за нього» — not the method's name. That
ordering is deliberate: the same fact stated as «накладений платіж доступний» is a logistics
option, and stated as «you open the box before you pay» it is the answer to A4.

### 18.8.5a The return-shipping deposit

This is the most intricate rule on the site and the one most easily implemented into a disaster.
[00-client-decisions-5.md](00-client-decisions-5.md) §H1.3 records the client's instruction:

> «Покупець в любому випадку має оплатити доставку туди і назад прямо на сайті, а далі якщо він
> купить, то ціна за зворотню доставку мінусується від основної ціни товару і покупець оплачує
> лише її.»

#### The mechanic

On a Ukrainian COD-with-inspection order the buyer pays **both shipping legs online, by card, at
checkout**, before the parcel is sent. At the branch, one of two things happens:

```
At checkout (paid online, by card):
    forward shipping        +  return-shipping deposit
    shippingForwardMinor       shippingReturnDepositMinor

At the branch, on inspection:
    ACCEPTS  →  pays (goods − return deposit) as the COD amount
                depositAppliedMinor = shippingReturnDepositMinor
                codAmountMinor = subtotal − discount − depositAppliedMinor
                the deposit is consumed as credit against the goods

    REFUSES  →  pays nothing further
                depositAppliedMinor stays 0
                the return leg is already funded; the parcel comes home
                at no cost to the business
```

#### Why it exists, stated once so the copy never has to

COD with inspection is the highest-converting payment method in Ukraine and also the most abused.
A refused parcel costs the seller both legs of carriage and returns stock that has been handled.
Pre-funding the return leg moves that cost to the person who triggers it, **while costing an
honest buyer nothing at all** — because if they accept, the deposit comes straight off what they
owe. It is not a fee. It is a refundable-by-offset deposit, and the offset is the whole point.

[00-client-decisions-6.md](00-client-decisions-6.md) §J2 **confirms this mechanic** and moves the
reason above from inference to record:

> «Є дуже багато моментів, що людина замовляє товар на пошту, оглядає, і їй не подобається, а
> доводиться за посилку туди-назад платити фірмі.»

That is the business describing a recurring, quantified cost it is currently absorbing on both
legs. It matters for how the copy below is written: this is not a scheme to extract a charge, it
is a business correcting an asymmetry where the person who causes a cost does not bear it — and
copy written from that understanding reads differently from copy written to justify a fee.
**The mechanic is settled and nothing in this subsection is provisional.** Only the wording is
open, and §J3 item 1 is where it is open.

#### The entire risk is the wording

Framed carelessly this reads as *pay extra for permission to look at the goods*, which is worse
than not offering inspection at all — it converts the strongest trust instrument available into a
reason to distrust. §H1.3's required treatment is a **worked example with three real numbers**,
not prose and not percentages:

```
┌──────────────────────────────────────────────────────────────────┐
│  ЯК ЦЕ ПРАЦЮЄ                          always expanded, never    │
│                                        a <details> or a tooltip  │
│  Ви оплачуєте доставку в обидві сторони — 80 + 80 ₴.             │
│                                                                  │
│  Якщо залишаєте товар, 80 ₴ віднімається від ціни:               │
│  на пошті доплатите 11 820 ₴ замість 11 900 ₴.                   │
│                                                                  │
│  Якщо не залишаєте — більше нічого не платите.                   │
└──────────────────────────────────────────────────────────────────┘
```

Three sentences, three numbers, no percentages and no vocabulary the buyer has to learn.
Substitution is `{{FORWARD}}`, `{{RETURN}}`, `{{PRICE}}` and the computed `{{PRICE − RETURN}}`,
all rendered as live figures from the current cart and destination — **never as an illustrative
example with placeholder numbers**, because a worked example whose numbers are not the buyer's
own is the same as prose.

| Rule | Why |
|---|---|
| **Always expanded.** Never a `<details>`, never a tooltip, never «докладніше» | The same rule §18.23.3 applies to the duty notice, for the same reason: a disclosure the buyer must open is a disclosure that did not happen. This one is worse than the duty notice if missed, because the buyer sees an unexpected charge *before* paying rather than after |
| **The arithmetic is shown, not described** | §H1.3 is explicit that showing real numbers is what converts a suspicious-sounding rule into an obviously fair one. «Вартість зворотної доставки зараховується у вартість товару» is true, comprehensible, and convinces nobody. «На пошті доплатите 11 820 ₴ замість 11 900 ₴» convinces immediately |
| **The word «застава» appears, «комісія» never does** | A deposit is a thing you get back. A commission is a thing you do not. The summary line reads «Доставка назад — 80 ₴ (застава, повертається)» |
| **The refusal branch is stated positively** | «Якщо не залишаєте — більше нічого не платите» is the sentence that removes the hostage feeling. A buyer who believes refusal is free inspects calmly; one who is unsure inspects defensively and refuses more often |
| **The summary shows two totals, not one** | «Сплачуєте зараз 160 ₴» and «На пошті 11 820 ₴», with «Разом 11 980 ₴» beneath. A single total on an order paid in two places at two times is the summary that generates the phone call |
| Persistence | The exact rendered strings and the three figures are snapshotted onto the order alongside the duty snapshot pattern of §18.23.3. What the buyer was shown is the only defence if the arithmetic is later disputed |

#### The invariant that must be tested

`depositAppliedMinor` is credited **exactly once, on transition to `DELIVERED`**
([25-database-schema.md](25-database-schema.md) §25.5). The two adjacent mistakes are both
expensive and both easy:

| Mistake | Consequence |
|---|---|
| Crediting on `SHIPPED` | Refunds a deposit for a parcel that is subsequently refused. The business has then paid the return leg itself, which is the exact cost the deposit exists to prevent |
| Crediting twice | Gives away the deposit's value against the goods a second time. On a re-delivery, a status correction, or a duplicate webhook, the customer pays less than the goods cost |

This belongs in the **order state machine**, not in a controller and not in an admin action, and
it needs a test — §H1.3 says so directly and the reason is that both failure modes are invisible
in normal operation and surface only in reconciliation, weeks later, as an unexplained shortfall.
The transition is guarded by the same pattern §18.15 uses for webhook replay: the credit is
written in the same transaction as the status change, and a second attempt against an order
already at `depositAppliedMinor > 0` is a no-op that logs rather than an update that succeeds.

The COD amount the carrier is instructed to collect is `codAmountMinor`, computed at the moment
the waybill is created and **never recomputed afterwards**. A carrier holding a figure that
disagrees with ours is a counter dispute with a customer standing in it.

#### This mechanic is Ukraine-only, and the reason is legal

**It must not be applied to `en`, `pl` or `de` orders.** Under the EU Consumer Rights Directive
the buyer holds an unconditional 14-day right of withdrawal, and a trader may not require a
deposit against exercising it. Pre-charging a return leg at checkout for an EU consumer is not
permissible in this form, and the fact that the deposit is refundable-by-offset does not rescue
it — the objection is to holding money against the exercise of the right, not to keeping it.

International orders therefore remain exactly as §18.23 specifies: **card only**, buyer pays
outbound shipping and all customs charges (F4), and return shipping handled per the withdrawal
rules in the locale's own policy page — **not pre-collected**. `shippingReturnDepositMinor` is
null on every non-UA order, and the order-creation path rejects a non-null value on a non-UA
destination rather than relying on the UI never to send one. A legal constraint enforced only in
the interface is a legal constraint that survives until the first refactor.

### 18.8.6 Bank transfer (IBAN)

Kept, primarily for B2B and wholesale buyers who require an invoice and cannot pay by card
against a company account.

The order is created `PENDING` / `UNPAID`. An invoice PDF carrying the IBAN, the order number
and the required payment reference is emailed immediately. Reconciliation is manual in the
admin, which is acceptable at this volume and for this buyer type — a wholesale buyer expects an
invoice and a settlement delay.

`Order.number` must appear in the payment reference. The existing process asks for the order
number and surname, which is sensible and is retained.

### 18.8.7 Made-to-order prepayment, server-side method derivation, and mixed carts

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.1 records the rule:

> «Якщо виріб виробляється на індивідуальний розмір (нестандартний), то людина оплачує покупку
> наперед.»

Any line carrying `customSpec` — a custom-size build with `madeToOrderDays = 14` — is **prepaid
in full, online. Cash on delivery is not offered for these.** The policy is defensible on its own
terms: the factory commits two weeks of labour to a size nobody else will buy, and a refused
parcel at the end of it is unsellable stock.

#### The reason is shown, not merely enforced

§H1.1 is explicit that without the reason the restriction reads as distrust. The copy is:

> «Виріб шиється за вашими розмірами, тому оплата — повна, наперед. Виготовлення — 14 днів.»

It appears in the buy box ([17-product-page-specification.md](17-product-page-specification.md)
§17.6.6), on the cart line (§18.2.2), and in section ③ in place of the COD row — three
placements, because the buyer is accepting an unusual term and each earlier placement removes a
share of the surprise from the next.

**The COD row is replaced, not disabled.** A greyed-out option with a lock icon invites the
question "why not me?" and implies the buyer has been assessed. A row that is simply not there,
with a sentence where it was, answers the question before it forms.

#### Enforcement is server-side, always

The available payment methods are **derived from cart contents on the server** and returned as
data. They are never a client-side filter over a fixed list.

```ts
// Single source of truth. The checkout renders what this returns and nothing else;
// order creation re-runs it and rejects a method absent from the result.
export function availableMethods(cart: Cart, destination: CountryCode): PaymentMethod[] {
  if (destination !== 'UA') return ['CARD_ONLINE'];              // §18.23.1
  if (cart.items.some(i => i.customSpec !== null)) {
    return ['CARD_ONLINE'];                                       // §H1.1, full prepayment
  }
  const methods: PaymentMethod[] = ['CARD_ONLINE', 'COD', 'BANK_TRANSFER'];
  methods.push(/* partial prepay — every domestic stocked cart, §L7 */);
  if (cart.subtotalMinor > COD_CEILING) remove(methods, 'COD');   // §18.8.5
  return methods;
}
```

Two properties matter. **The list is computed twice** — once to render section ③ and once inside
the order-creation transaction — and the second run is authoritative. A cart mutated in another
tab between rendering and submitting is a normal occurrence, not an attack, and it produces the
same outcome as an attack would: a method that is no longer valid. **And the UI never filters.**
If the checkout receives `['CARD_ONLINE']` it renders one option; it does not receive four and
hide three. A hidden option is a form field an attacker can still submit.

#### Mixed carts — one order, and the disclosure that makes it honest

§H3b makes custom sizing a per-product admin toggle, which means a cart holding one stocked
ліжник and one custom ліжник is now **ordinary**.

[00-client-decisions-6.md](00-client-decisions-6.md) §J1 settles what such a cart produces:

> «Надіслати разом.»

**One order, one parcel, one delivery charge, dispatched after the fourteen-day production
period.** A previous round recommended splitting the cart into two orders so the stocked item
could ship immediately, and that recommendation is **withdrawn**. The split machinery — the
`splitGroupId` linkage, the paired numbering, the per-order shipping quotes, the two confirmation
emails, the two tracking URLs and the `POST /v1/checkout/split` endpoint — is removed from this
document and from [26-api-architecture.md](26-api-architecture.md) rather than retained as an
option. A withdrawn design left in a specification gets built.

The reasoning is worth recording, because the rule alone reads as a regression:

| | |
|---|---|
| What the split bought | A few days on the stocked line |
| What it cost the customer | **A second delivery charge** on a single purchase |
| What it cost the business | A second parcel to pack, a second waybill to track, a second dispatch to schedule — for two people |
| Verdict | At this scale, operational simplicity is worth more than the days saved, and no customer enjoys paying twice for delivery on one purchase ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) |

What the split was genuinely good at was **telling the buyer the truth early.** That requirement
survives the ruling, and the rest of this subsection is how it is met without any machinery.

#### The disclosure fires when the custom item is added, not at checkout

This is the load-bearing decision, and the reason for it is counter-intuitive enough to state in
one sentence: **adding a made-to-measure item changes the terms of the item already in the cart.**

A stocked ліжник that was available on «наложений платіж з оглядом» and would have shipped
tomorrow becomes prepaid and ships in two weeks — because of a *different line*. Nothing about the
stocked item changed. The cart it sits in did.

Discovering that at the payment step reads as a bait-and-switch, and by then the buyer has entered
a name, a phone number, an email and a Nova Poshta branch. §H1.3 spends a whole section elsewhere
preventing exactly this shape of undisclosed arithmetic; the same principle applies here.

So the disclosure is attached to the **add-to-cart event**
([17-product-page-specification.md](17-product-page-specification.md) §17.6.6), where it costs the
customer nothing to act on, and it then stands in the cart (§18.2.2) and in the order summary
(§18.11) as a reminder rather than an announcement:

> «У кошику є виріб на індивідуальний розмір. Усе замовлення відправимо разом, коли він буде
> готовий — через 14 днів. Оплата — повна, наперед.»

And in the same place, one plain escape:

> «Потрібен ліжник зі складу раніше? Оформіть його окремим замовленням — тоді він поїде одразу.»

**That is a suggestion, not a control.** There is no button that splits a cart, no checkbox that
selects a dispatch strategy, and no system-generated second order. The customer acts on it by
placing two orders themselves, which they were always able to do. The site states the trade-off;
the customer decides. That is the honest version of the split, and it needs no schema, no endpoint
and no admin view to support it.

#### What the buyer sees at ④

```
④ ПІДТВЕРДЖЕННЯ

  ┌────────────────────────────────────────────────────────────────┐
  │ ВІДПРАВИМО ВСЕ РАЗОМ                      always expanded      │
  │                                                                │
  │ У кошику є виріб на індивідуальний розмір:                     │
  │   Ліжник «Черемош», свій розмір 180×240           7 776 ₴     │
  │   Виготовлення — 14 днів, далі доставка.                       │
  │                                                                │
  │ Усе замовлення — разом із тим, що є на складі — відправимо     │
  │ одним відправленням, коли він буде готовий.                    │
  │                                                                │
  │ Очікувана відправка: 12 жовтня                                 │
  │ Доставка — одна.                                               │
  │ Оплата — повна, наперед, карткою.                              │
  │                                                                │
  │ Потрібен ліжник зі складу раніше? Оформіть його окремим        │
  │ замовленням — тоді він поїде одразу.                           │
  └────────────────────────────────────────────────────────────────┘
```

| Rule | Detail |
|---|---|
| **Always expanded, at every breakpoint** | Same class of element as the customs disclosure (§18.23.3) and the deposit block (§18.8.5a): it changes what the buyer is agreeing to and when. Never an accordion, never a tooltip ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| **A date, not a duration** | «Очікувана відправка: 12 жовтня», per [00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 4. «Через 14 днів» is a figure the buyer re-derives on every visit and reads as a promise |
| **«Доставка — одна» is stated, not implied** | It is the customer-visible benefit of §J1 and the reason the split was rejected. A buyer who had been told elsewhere that mixed carts split will otherwise assume two charges |
| **No acknowledgement checkbox** | Unlike the customs block, this is not a legal term the buyer accepts — it is a fact about dispatch that was already disclosed at the add. A second forced interaction on the same fact trains the buyer to click past disclosures that matter |
| **Not a new panel at ④** | The same copy, in the same words, as the cart note and the add-to-cart announcement. Three placements of one sentence, each removing a share of surprise from the next — exactly the pattern used for the prepayment reason above |

#### The mechanics — what a mixed order actually is

| Concern | Rule |
|---|---|
| Order count | **One.** `POST /v1/checkout/orders`, one `Order` row, one `Order.number`, one `guestToken`. There is no group identifier, no parent/child relation and no schema addendum — [25-database-schema.md](25-database-schema.md) §25.5 needs no change for this case ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) |
| Payment methods | `availableMethods()` above returns `['CARD_ONLINE']`, because at least one line carries `customSpec`. **Cash on delivery is absent from the response**, not disabled in the UI, and order creation re-runs the derivation and rejects anything else (§H1.1) |
| Payment | **Full prepayment online**, one card transaction, one `PaymentTransaction` row. There is no half-prepaid shape and none is offered |
| Return-shipping deposit | **Not applicable.** The deposit funds the return leg of a parcel the buyer may refuse at the counter, which is a COD mechanic (§18.8.5a). A prepaid order has no refusal step to fund, and charging a deposit on one would be the extraction of a fee that §J2 is explicit this mechanic is not |
| Shipping | **One quote, one charge, one parcel.** Quoted on the combined weight and destination exactly as any other single order (§18.6) |
| Free-shipping threshold | Evaluated on the order subtotal, unchanged (§18.7). There is no pre-split figure to reconcile against, which removes a class of arithmetic that used to need its own rule |
| Promotions | `discountMinor` applies to one order and `Promotion.usageCount` increments once, unchanged from any other order |
| Stock | The stocked lines reserve and decrement normally at order creation. The custom line reserves nothing — there is no `ProductVariant` and no `stockQty` behind a custom build (§17.6.6). **The stocked goods are held for the fourteen days**, which is the real operational cost of §J1 and belongs in the fulfilment view ([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.8.3c) |
| Dispatch | After the custom line is finished — fourteen days — then `PACKING` and `SHIPPED` for the whole order. `OrderStatus.IN_PRODUCTION` covers the entire order, including its stocked lines (§18.13) |
| Cancellation and refund | One order, one refund path. Nothing to keep consistent across a pair |
| Emails | **One** E1 confirmation stating one total, one expected dispatch date and one delivery charge (§18.17). No «1 з 2» line, because there is no second |
| Tracking | One `guestToken` URL, one carrier tracking number (§18.18). §18.18's lookup form resolves one number to one page |

**Removing the custom line reverses all of it.** The disclosure disappears, the derived method list
regains `COD` on the next server read, and the stocked lines return to next-day dispatch. The
reversal is as visible as the disclosure was: a constraint that silently lifts leaves the buyer
still believing it applies, and a buyer who believes COD is unavailable will not look for it again.

---

## 18.9 Which legacy methods to retire, and why

[00-existing-site-audit.md](00-existing-site-audit.md) §0.6 records four current methods. The
recommendation for each:

| Legacy method | Recommendation | Reasoning |
|---|---|---|
| **Manual transfer to a personal PrivatBank card with mandatory manager consultation** | **RETIRE COMPLETELY. Do not port.** | Three independent reasons, any one of which is sufficient. (1) It is the conversion problem this project exists to fix: a buyer ready to spend five figures is asked to retype a card number and then wait for a human. (2) Publishing a personal card number is a fraud-impersonation risk — it is trivially copied into a fake listing, and the business bears the reputational cost of a scam it did not run. (3) A personal card receiving business revenue is an accounting and tax exposure that an online channel makes visible and auditable in a way an offline one did not. WayForPay replaces it entirely |
| **Cash on delivery via Nova Poshta** | **KEEP, prominent** | The strongest trust instrument available to a new domain with no reviews. Removing it would raise card share and lower total orders. Revisit after [02-ux-research.md](02-ux-research.md) §2.8 R7 measures the cannibalisation and the refusal cost |
| **Bank transfer to IBAN** | **KEEP, de-emphasised** | Low volume, genuinely required by B2B buyers who need an invoice. Cheap to maintain because reconciliation is already manual. Ranked third, not second |
| **Partial prepayment, balance on delivery** | **KEEP, for every domestic stocked order** ([00-client-decisions-8.md](00-client-decisions-8.md) §L7, §L14) | The client's reason: the business must not lose money on both shipping legs when a parcel is refused. 10% alone does not guarantee that on a cheap order, so the client set a floor: `prepaymentMinor = min(max(round(subtotalMinor × 0.10), PREPAY_MIN_MINOR), orderTotalMinor)`, with `PREPAY_MIN_MINOR` = 46000 (460 ₴) held in the `Setting` `payments.prepayment.min_minor`, editable by the Owner. Computed server-side and shown with its arithmetic like the §18.8.5a deposit. On refusal the business keeps the two shipping legs and refunds the rest — the same basis and the same offer-contract clause as §J2. Made-to-order stays at full prepayment (§H1.1) |

**The summary recommendation.** Launch with four visible methods — card via WayForPay, COD, bank
transfer, and conditional 10% prepayment — and remove the personal-card path entirely and
permanently. Card becomes the default and the recommended option; COD remains available without
friction because taking it away would cost more orders than it saves in handling. The manager
consultation becomes optional support, reachable by the phone number in the checkout header,
rather than a mandatory gate on every transaction.

**This recommendation is retained in round 2 and refined in round 5.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E10 carries it forward: card via WayForPay
primary, COD prominent, IBAN de-emphasised for B2B, 10% prepayment narrowed, and **no manual
personal-card transfer path ever**. [00-client-decisions-5.md](00-client-decisions-5.md) §H1.1
then removes made-to-order from the 10% prepayment's scope entirely — custom work is prepaid in
full — so the narrowing is now to high-value stocked orders alone. The last
clause is the one worth restating: resolving the PSP does not make a personal-card fallback
acceptable "just for large orders" or "just while onboarding completes". If WayForPay onboarding
stalls on V10, the fallback is COD and IBAN — both of which already exist, both of which are
auditable, and neither of which publishes an individual's card number on the open web.

The method list is also **destination-dependent** now that §E11 opens international sales. Only
card survives outside Ukraine; COD is domestic by carrier design, and IBAN transfer and 10%
prepayment both depend on manual reconciliation against a Ukrainian account and a Ukrainian
delivery flow. §18.23 states the resulting matrix.

---

## 18.10 Promo codes

Entry lives on the **cart page and in checkout section ④ only** — never in the drawer, and
never as an always-open field high in the checkout.

An open, empty "promo code" box is one of the most reliably damaging elements in e-commerce
checkout: it tells a buyer without a code that a better price exists somewhere, and a
meaningful share leave to look for it. The mitigation here is placement and framing, not
removal:

```
Є промокод?                            ← collapsed link, --text-muted, caption
┌──────────────────────┐ ┌───────────┐
│ КАРПАТИ10            │ │ Застосувати│
└──────────────────────┘ └───────────┘
✓ Знижка 10% застосована                       emerald-600
✕ Промокод не діє для цього замовлення:
  мінімальна сума 3 000 ₴                       danger, states the reason
```

Validated server-side against `Promotion` ([25-database-schema.md](25-database-schema.md)
§25.8): `isActive`, `startsAt`/`endsAt`, `usageLimit` vs `usageCount`, `perCustomerLimit`,
`minSubtotalMinor`, and `appliesToProductIds` / `appliesToCategoryIds`.

| Rule | Detail |
|---|---|
| Failure copy | Always names the reason — expired, minimum not met, not applicable to these items, already used. «Недійсний промокод» is the answer that generates a support call |
| Codes | Case-insensitive, whitespace-trimmed. A code failing because of a trailing space copied from an email is a self-inflicted loss |
| Stacking | One code per order. `PromotionType.FREE_SHIPPING` does not stack with the §18.7 threshold; the better outcome for the buyer applies. A code does not stack with the wholesale volume discount either (§18.10a) — the larger applies |
| Re-validation | Re-checked at order creation. A code exhausted between application and submit fails with an explanation, not a silent price change |
| `couponCode` | Persisted on `Order`, and `discountMinor` is snapshotted so the historical order remains correct after the promotion ends |

---

## 18.10a Wholesale volume discount — automatic, in the cart

[00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 5: **from 5 pieces −10%, from 25 pieces −20%.** Applied by the server with no code,
no form and no manager, because a buyer who has to ask for a published discount often does not.

| Rule | Value |
|---|---|
| Tiers | `Setting` `pricing.volume_tiers` = `[{ "minUnits": 5, "percent": 10 }, { "minUnits": 25, "percent": 20 }]`, editable by the Owner (`settings.update`) |
| What counts | **Pieces across the whole order**, any products, any variants — the client's «від 5 штук» read literally. *Default pending client confirmation; the alternative is 5 of the same product* |
| Excluded from count and discount | By-weight lines (пряжа, ровниця, вовна — `PricingUnit` is not pieces, D4) and custom-size lines (priced per m², 14-day build, capacity-bound — R19). *Defaults pending confirmation* |
| Included | Own and partner goods alike |
| Promo codes | Do not stack. The server computes both and applies **the larger discount**; the summary says which applied |
| Destinations | All, including international |
| Snapshot | `Order.discountMinor`, `discountSource = VOLUME`, `volumeTierPercent` (§25.5) |
| Payment | Unchanged. The discount lowers the subtotal the 10%/460 ₴ prepayment and the COD amount are computed from |

**Cart copy.** The tier is shown the moment it applies, and the next tier is shown as a nudge —
this is the one place the discount does commercial work:

```
Товари (6 шт.)                                   8 400 ₴
Оптова знижка −10% · від 5 шт.                    −840 ₴      emerald-600
  Ще 19 шт. — і знижка стане 20%                             caption, --text-muted
```

Below the first tier the nudge reads «Від 5 шт. — знижка 10%» only once the cart holds 3 or
more counted pieces; a single-item cart is not told to buy four more.

Re-computed at order creation like every price (§18.8.7). A cart edited in another tab cannot
keep a tier it no longer qualifies for.

---

## 18.11 Order summary and its sticky behaviour

| Breakpoint | Behaviour |
|---|---|
| `lg`+ | Right column, `position: sticky; top: header + space-6`. Fully expanded: every line item with thumbnail, variant, origin label, and price, then subtotal, discount, shipping, COD fee, total |
| `md` | Collapsible panel above the accordion, collapsed by default, showing «3 товари · 11 980 ₴» with an expand control |
| `xs`–`sm` | Same collapsible panel, plus a fixed bottom bar carrying the total and the section's primary action |

The summary is **never hidden on any breakpoint**. A buyer who cannot see what they are paying
for while entering payment details is being asked to trust rather than to verify, and this
audience — trained by a category full of misdelivery — verifies.

Every total recomputes server-side on each mutation and animates nothing
([13-motion-system.md](13-motion-system.md) §13.11: price appears, it never counts up). All
figures are `tabular-nums`, right-aligned, so the column does not jitter when shipping resolves.

The summary carries, beneath the total: the returns window, a secure-payment note, and the
phone number. These three are the checkout's entire trust surface — no badge wall, no fake seal.

---

## 18.12 Guest checkout, permanently

> «Сайт назавжди працює в режимі гостьових покупок.»
> — [00-client-decisions-2.md](00-client-decisions-2.md) §E12

Guest is no longer the default path. It is the **only** path, permanently, and this is a
decision rather than a launch simplification to be revisited. `Order` has no required
`customerId` ([25-database-schema.md](25-database-schema.md) §25.5), and the `Customer` model is
now explicitly an order-derived record with **no `passwordHash`** — it exists so repeat buyers
can be recognised for support and analytics, never so they can log in.

### 18.12.1 What is removed from this document

Everything below was specified in an earlier revision and is now deleted, not deferred:

| Removed | Was |
|---|---|
| The «Створити акаунт» checkbox in section ① | §18.4 |
| «Збережіть адресу — пароль створимо за один крок» on the confirmation page | §18.16 |
| Header sign-in before checkout, pre-filling from `CustomerAddress` | §18.12 |
| Retroactive linking of a guest order to a later-registered account by email match | §18.12 |
| Saved payment methods | Never specified — and now never can be |
| Order history behind a login | §18.18's premise |
| Registration, login, password reset, email verification, customer sessions | Out of scope entirely (§E12) |

The removal is not neutral — it is a net gain, and it is worth naming why rather than treating
it as a loss to be worked around:

1. **The two highest-friction moments in checkout are both gone.** The account fork before
   section ① and the password field inside it were the only elements in this flow that asked for
   something the order did not need.
2. **A whole class of security exposure disappears.** No customer credential store, no
   credential-stuffing surface, no password-reset token flow, no session-fixation risk on the
   storefront. [32-security-architecture.md](32-security-architecture.md)'s customer-facing
   attack surface shrinks to the payment path and the tracking lookup.
3. **The GDPR surface shrinks with it.** No profile to export, no profile to erase, no consent
   state attached to a login. What remains is order data with a retention policy, which is a far
   simpler thing to be compliant about — and `de`/`pl` being transactional (§E11) makes that
   simplification worth real money in legal review.

**Staff authentication is unaffected.**
[24-employee-permission-architecture.md](24-employee-permission-architecture.md) stands in full;
§E12 removes customer accounts, not admin accounts.

### 18.12.2 What replaces the conveniences accounts would have provided

| Convenience | Replacement | Honest limit |
|---|---|---|
| Order tracking | `Order.guestToken` in the confirmation email, plus a lookup form taking **order number + email** (§18.18) | None worth stating — this is equal to or better than a login, and it works from any device without a password to forget |
| Address prefill on a repeat order | A **first-party cookie on the same device**, written at successful order creation, holding recipient name, phone, city and warehouse ref | Device-local. A buyer who ordered on a phone and reorders on a laptop retypes the address |
| Saved items | `localStorage`, labelled «Збережено на цьому пристрої» (§18.2.2, [17](17-product-page-specification.md) §17.6.5) | Device-local, and the label says so |
| Marketing consent | A checkbox in section ④ writing to `NewsletterSubscriber`, independent of any account concept | None |
| Recognising a repeat buyer for support | `Customer` matched on email at order creation | Invisible to the buyer, which is correct — it is an operational record, not an identity |

**The prefill cookie is first-party, functional, and deliberately small.** It stores delivery
fields and nothing else — no email, no order history, no identifier that survives a cleared
cookie jar — so it is a functional cookie rather than a tracking one and does not require consent
in `de`. It is also visibly reversible: the prefilled section ② renders «Заповнено з минулого
замовлення · Очистити», because silently populating a form with data the buyer does not remember
providing is unsettling in exactly the audience least likely to trust a new domain.

### 18.12.3 The tracking link is the whole answer, and it must be treated as such

Without accounts, `Order.guestToken` is the only route back into an order. That raises the stakes
on three things that would otherwise be minor:

1. **E1 must arrive.** Email deliverability (§18.17) stops being a quality concern and becomes
   the single point of failure for post-purchase visibility. SPF, DKIM and DMARC on
   `{{DOMAIN}}` before the first order is not a recommendation.
2. **The lookup form must be genuinely usable**, not a technicality. Order number + email, no
   captcha, clear copy about where to find the number, and the same rate-limiting and uniform
   response §18.18 already specifies.
3. **The phone number stays in the checkout header and on every email.** For a buyer who has lost
   both the link and the number, a person who can look it up is the last remaining path — and
   this business's customers are already accustomed to calling (§E3 records two numbers and no
   social presence).

---

## 18.13 The order state machine

Two orthogonal enums, deliberately not collapsed into one
([25-database-schema.md](25-database-schema.md) §25.5). A COD order that is `SHIPPED` and
`UNPAID` is entirely normal, and a single status enum could not express it without inventing
compound states.

```
OrderStatus                                         ratified in 25 §25.5

  AWAITING_QUOTE ──▶ PENDING ──▶ CONFIRMED ──┬──▶ PACKING ──▶ SHIPPED ──▶ DELIVERED
        │               │            │       │        │          │            │
        │               │            │       └─▶ IN_PRODUCTION ──┘            │
        ▼               ▼            ▼            (custom size, 14 days)      ▼
    CANCELLED       CANCELLED    CANCELLED                              RETURNED
```

**Two members were added to the enum after this section was first written, and both are
ratified** in [25-database-schema.md](25-database-schema.md) §25.5.

`AWAITING_QUOTE` **precedes** `PENDING` and exists only for international orders. An earlier
revision of this document argued for carrying the quote lifecycle on a separate nullable
`quoteStatus` axis, on the grounds that `OrderStatus` describes where the goods are. That argument
lost, and it lost on operational evidence rather than on taste: an order awaiting a shipping quote
differs from a `PENDING` order in every way that matters to the people running the business — no
payment is possible yet, no stock is committed, the customer is waiting on **us** rather than the
reverse, and the queue that must act on it is a different queue from the one staff use to pack
parcels. Overloading `PENDING` would have hidden these orders inside the packing list. §18.23.7 is
rewritten against the ratified enum.

`IN_PRODUCTION` sits **between `CONFIRMED` and `PACKING`**, for custom-size lines with the
fourteen-day build time ([00-client-decisions-4.md](00-client-decisions-4.md) §G2). `PACKING` does
not cover a fortnight of weaving, and the justification is as much emotional as operational: a
customer who paid in full for a custom ліжник and watches `CONFIRMED` sit unchanged for twelve
days concludes the order is stuck and contacts support. A status that names what is actually
happening removes that contact and replaces anxiety with anticipation, which is the correct state
for a handmade purchase. It is reached only from `CONFIRMED`, only on orders containing a
`customSpec` line, and it exits to `PACKING` when the piece comes off the loom.

```
PaymentStatus

  UNPAID ──▶ AUTHORIZED ──▶ PAID ──▶ PARTIALLY_REFUNDED ──▶ REFUNDED
     │            │           │
     └──▶ FAILED  └──▶ FAILED └──▶ REFUNDED
```

### Transitions by payment method

| Method | At submit | On webhook / event | On dispatch | On delivery |
|---|---|---|---|---|
| `CARD_ONLINE` | `PENDING` / `UNPAID`, stock reserved | `PENDING` → `CONFIRMED`, `UNPAID` → `PAID`, stock decremented | `SHIPPED` | `DELIVERED` |
| `CARD_ONLINE`, **custom size** | `PENDING` / `UNPAID`, no stock to reserve | `CONFIRMED` / `PAID`, then → `IN_PRODUCTION` when the build starts | `PACKING` → `SHIPPED`, `expectedDispatchAt` recorded at confirmation | `DELIVERED` |
| `COD` **з оглядом** | `PENDING` / `UNPAID`; `shippingForwardMinor` + `shippingReturnDepositMinor` charged online and `PAID` as a separate `PaymentTransaction` | Manual confirm in admin → `CONFIRMED`, stock decremented, `codAmountMinor` computed and written to the waybill | `SHIPPED`, goods still `UNPAID` | `DELIVERED` → **`depositAppliedMinor` credited, exactly once** (§18.8.5a); `PAID` on carrier remittance. On refusal the order goes `RETURNED` with `depositAppliedMinor` left at 0 |
| `BANK_TRANSFER` | `PENDING` / `UNPAID`, invoice emailed | Manual reconciliation → `CONFIRMED` / `PAID` | `SHIPPED` | `DELIVERED` |
| 10% prepayment | `PENDING` / `UNPAID` | Deposit received → `CONFIRMED` / `AUTHORIZED` | `SHIPPED`, `AUTHORIZED` | `DELIVERED`; `PAID` on balance collection |
| `CARD_ONLINE`, international (enquiry-then-invoice) | **`AWAITING_QUOTE`** / `UNPAID`, `shippingMinor` null, `totalMinor` null, stock reserved on the long TTL | Quote issued → `PENDING` / `UNPAID`, `quotedAt` set, `shippingMinor` and `totalMinor` written. Buyer pays → webhook → `CONFIRMED` / `PAID`, stock decremented | `SHIPPED` | `DELIVERED` |

`AUTHORIZED` is the correct home for partial prepayment: money has moved, but the order is not
settled. Marking a 10%-paid order `PAID` would corrupt every revenue report the admin produces.

**Rules.** Stock decrements on `CONFIRMED`, never on add-to-cart
([25-database-schema.md](25-database-schema.md) §25.5). Every transition writes an `OrderEvent`
with `fromValue`, `toValue`, and `actorId` (null for system). `CANCELLED` releases reservations
and restores stock in the same transaction. `DELIVERED` cannot be reached from `CANCELLED`.
Manual overrides exist in the admin for the states that depend on a human — COD remittance,
bank reconciliation — and each is permission-gated and audit-logged
([25-database-schema.md](25-database-schema.md) §25.7).

**Two invariants belong to the state machine itself and each needs a test.**

1. **`depositAppliedMinor` is written exactly once, on the transition to `DELIVERED`**
   ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.3). Crediting on `SHIPPED` refunds a
   deposit for a parcel that is later refused; crediting twice gives away the goods. The write
   lives in the same transaction as the status change, and a second attempt against an order
   already holding a non-zero value is a logged no-op rather than an update. §18.8.5a.
2. **`IN_PRODUCTION` is reachable only from `CONFIRMED`, and only on an order containing a
   `customSpec` line.** A stocked order that reaches `IN_PRODUCTION` will sit in a queue nobody
   watches for fourteen days, because that queue exists for weaving. The guard is on the
   transition, not on the admin control that triggers it.

**`expectedDispatchAt` is computed once, at `CONFIRMED`, and stored.** It is
`nextWorkingDay(confirmedAt + 14 days)` against the published calendar including the
December/January closures. Recomputing it on every render would let the date drift under a
customer who has already been told it, and a dispatch date that moves is worse than a late one.

---

## 18.14 Stock reservation and the one-of-one problem

Some products are genuinely unique, with `stockQty = 1` and `isUniquePiece = true`. Selling one
twice is the worst operational failure available on this project: it cannot be fixed by
restocking, the second buyer must be refunded and disappointed, and on a new domain that is one
of the first reviews the brand receives.

**Two-tier reservation**, because a blanket reservation policy is either too weak for unique
items or too aggressive for stocked ones.

| Tier | Applies to | Created at | TTL | Rationale |
|---|---|---|---|---|
| **Eager** | `isUniquePiece = true` | Add to cart | 30 min, extended to 30 min on any checkout activity | The only defence that works. Reserving at checkout start is too late — two buyers can both be in checkout |
| **Lazy** | Everything else | Checkout submit | 15 min, released on payment failure or expiry | Stocked items tolerate a race; reserving at add-to-cart would lock inventory behind abandoned carts |
| **None** | Custom-size lines (`customSpec` non-null) | — | — | There is no `ProductVariant` and no `stockQty` behind a custom build ([17](17-product-page-specification.md) §17.6.6) — the object does not exist yet. Reserving nothing is correct, and it is why a custom line can never cause the §18.14 race. What it *can* cause is a loom-bounds change between add-to-cart and submit, which is why the dimensions are re-validated against `customSizeMin/MaxWidthCm` and `customSizeMin/MaxLengthCm` inside the order-creation transaction, alongside the price recomputation |

```prisma
StockReservation { variantId, quantity, cartId, expiresAt }
```

Creation is a single transaction: `SELECT … FOR UPDATE` on the variant row, check
`stockQty - Σ(active reservations) ≥ quantity`, insert. Row-level locking is what makes this
correct under concurrency; an application-level check is a race with a comfortable-looking test
suite.

A cron sweep releases expired rows every minute; `@@index([expiresAt])` exists for it.

**The buyer-facing contract.** A unique item in the cart shows a countdown and an explanation:
«Єдиний примірник. Зарезервовано за вами на 30 хвилин.» At 5 minutes the label shifts to
`warning`. On expiry the line is marked unavailable with an inline explanation and a «Перевірити
наявність» action — it is never silently removed, because a cart that quietly loses an item is
indistinguishable from a bug.

**The residual race** is the window between order creation and payment confirmation on a
redirect flow. It is closed by re-validating stock inside the same transaction that transitions
to `CONFIRMED`. If the item is gone — reserved and paid by someone else during a 3-D Secure
delay — the payment is **refunded immediately and automatically**, the buyer is emailed an
explanation and an apology, and the order is `CANCELLED`. Automatic refund matters: a manual
refund queue on a failure this rare means it will be handled late, and a late refund on a
five-figure amount is a dispute.

---

## 18.15 Idempotency and webhooks

Payment webhooks arrive more than once. This is normal PSP behaviour, not an error condition,
and a handler that assumes single delivery will eventually double-capture or double-fulfil.

```
PSP ──▶ POST /api/webhooks/payment/wayforpay
             │
             ├─ 1. Verify signature against the shared secret. Invalid → 401, logged.
             │     Never parse an unverified body into business logic.
             ├─ 2. Derive idempotencyKey = sha256(provider + providerRef + status)
             ├─ 3. INSERT PaymentTransaction … ON CONFLICT (idempotencyKey) DO NOTHING
             │     Conflict → already processed → return 200 immediately.
             ├─ 4. Within one transaction: re-validate stock, transition Order,
             │     decrement stock, release reservations, write OrderEvent
             ├─ 5. Enqueue emails (outside the transaction — an email failure
             │     must never roll back a successful payment)
             └─ 6. Return 200 within 5 s, always
```

| Mechanism | Detail |
|---|---|
| Replay protection | `PaymentTransaction.idempotencyKey @unique` ([25-database-schema.md](25-database-schema.md) §25.5). The uniqueness lives in the database, not in application memory, so it survives multiple instances |
| Provider uniqueness | `@@unique([provider, providerRef])` catches a second transaction claiming the same provider reference |
| Raw payload | `rawPayload` retains the full body for dispute resolution. A chargeback six months out is unwinnable without it |
| Out-of-order delivery | A `PAID` webhook arriving after a `FAILED` one is handled by rank, not by arrival time. Terminal-state downgrades are rejected and logged |
| Timeouts | Return 200 before doing slow work. A PSP that times out retries, which multiplies load precisely when the system is already slow |
| Reconciliation | A nightly job compares `PENDING`/`UNPAID` orders older than 2 h against the PSP's transaction list and repairs missed webhooks. Webhooks get lost; without reconciliation those orders sit unfulfilled and unnoticed |
| Client idempotency | The submit request carries a client-generated key held in `sessionStorage` for the checkout's life. A double submit returns the original order rather than creating a second |

---

## 18.16 The order confirmation page

`/{locale}/order/{guestToken}` — a stable, shareable, bookmarkable URL keyed by
`Order.guestToken`, not a one-shot page that dies on refresh. A confirmation that cannot be
reloaded is the reason people phone to ask whether the order went through.

```
┌───────────────────────────────────────────────────────────────────┐
│                          ✓                                        │
│                 Замовлення прийнято                         h1    │
│                    № VCH-26-0417                                  │
│                                                                   │
│  Ми надіслали підтвердження на oksana@example.com                 │
│  Не бачите листа? Перевірте «Промоакції» та «Спам».               │
├───────────────────────────────────────────────────────────────────┤
│  ЩО ДАЛІ                                                          │
│  1. Ми збираємо замовлення — 1–2 робочі дні                       │
│  2. Надішлемо ТТН у SMS та на email                               │
│  3. Нова Пошта, відділення №12, Косів — 1–3 дні                   │
│                                                                   │
│  Орієнтовна дата отримання: 15–17 травня                          │
├───────────────────────────────────────────────────────────────────┤
│  ЗАМОВЛЕННЯ                                                       │
│  ▣ Ліжник «Черемош» · 150×200 · сірий                    5 400 ₴ │
│    ✋ Власне виробництво                                           │
│  ▣ Гуня «Верховина» · L · білий                          5 300 ₴ │
│  ▣ Пряжа «Смерека» · 5 мотків · товщина 8/2              1 200 ₴ │
│  Доставка                                                    80 ₴ │
│  Разом                                                   11 980 ₴ │
│  Оплачено карткою · WayForPay                                       │
├───────────────────────────────────────────────────────────────────┤
│  [ Відстежити замовлення ]   [ Зберегти посилання ]               │
│  Збережіть це посилання — за ним ви завжди побачите               │
│  статус замовлення. Ми також надіслали його на email.             │
│  Питання? +38 067 997 34 50 (Іван)                                │
│  Якщо не відповідає — +38 067 960 47 69 (Любов)                   │
└───────────────────────────────────────────────────────────────────┘
```

**Two variants of the «ЩО ДАЛІ» block, and the difference is a date.**

```
custom-size order                        COD-with-inspection order

1. Виготовляємо ваш виріб —              1. Ми збираємо замовлення — 1–2 дні
   14 днів                               2. Надішлемо ТТН у SMS та на email
2. Потім відправимо перевізником         3. На відділенні оглядаєте виріб
3. Нова Пошта — 1–3 дні                     і лише потім платите

Очікувана відправка: 12 жовтня           Доставку вже оплачено: 160 ₴
Орієнтовне отримання: 13–15 жовтня       На пошті доплатите: 11 820 ₴
                                          (замість 11 900 ₴ — 80 ₴ застави
                                           за зворотну доставку зараховано)
```

**The custom-size confirmation restates a date, not a duration**
([00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 4). «Очікувана відправка: 12
жовтня» is checkable against a calendar; «протягом 14 днів» is a memory test the customer will
fail, and they will fail it in the direction of believing the fourteen days started earlier than
it did. The date comes from the stored `expectedDispatchAt` (§18.13), never recomputed at render
time, and the transit window is shown as a **separate line beneath it** rather than folded in —
the production time is ours to promise and the carrier's transit is not.

**The COD confirmation restates the arithmetic, not the policy.** The buyer has already read the
§18.8.5a worked example once; repeating it here with the same three numbers is what makes the
figure at the counter recognisable rather than surprising. «Замість 11 900 ₴» is the clause doing
the work: without it, 11 820 ₴ is simply a number the customer did not expect.

| Element | Why it is here |
|---|---|
| Order number, large | The first thing anyone looks for, and the reference for every subsequent conversation |
| Email confirmation with a spam-folder note | Transactional mail from a brand-new domain lands in spam more often than from an established one — a direct consequence of the cold start ([00-client-decisions.md](00-client-decisions.md) D2) |
| Three numbered next steps | [02-ux-research.md](02-ux-research.md) §2.4 anxiety A4 does not end at payment. Naming what happens next, with dates, is what closes it |
| Origin labels retained | A mixed-origin order stays legible after purchase, for servicing and for honesty. «Відібрано Вівчариком» + `partnerRegion`; never `partnerName` ([00-client-decisions-2.md](00-client-decisions-2.md) §E7) |
| **Save-this-link prompt, not an account offer** | §E12 removes accounts permanently, so the post-purchase «створіть акаунт» moment is gone. What replaces it is more useful anyway: the URL *is* the account. Prompting the buyer to bookmark it, and restating that it was emailed, costs one line and removes the most common support call. §18.12.3 |
| **Both phone numbers, Іван first, no hours** | The human fallback this business's customers expect. [00-client-decisions-4.md](00-client-decisions-4.md) §G1 makes Іван primary and Любов the explicit fallback — «Якщо не відповідає» states the relationship rather than listing two equal numbers. This is a surface where both belong: a customer with a problem should not have to guess, and the confirmation is the artefact they will still have in three weeks. Hours are deliberately absent — §E3 records that they are genuinely variable, and a wrong time printed on a receipt produces exactly the failed visit it was meant to prevent |
| Expected dispatch date on custom-size orders | §G2 rule 4. A date, from stored `expectedDispatchAt`, with transit shown separately beneath it |
| The COD arithmetic restated | §18.8.5a. The counter figure must be recognisable, and «замість 11 900 ₴» is what makes it so |
| No mascot | [01-brand-strategy.md](01-brand-strategy.md) §1.7 permits the mascot on order confirmation. This spec declines it: the confirmation is still a money surface, and the page's job is reassurance, not charm |

Bank transfer and 10%-prepayment confirmations replace «Оплачено» with the amount due, the
IBAN, the required payment reference, and a deadline. COD confirmations state the amount payable
at the counter including the carrier fee.

**The international variant is a different page, not a differently-worded one.** Under
enquiry-then-invoice (§18.23.7) nothing has been paid and the total is incomplete, so the page
renders: the headline «Ми отримали ваше замовлення» rather than «Замовлення прийнято»; a
three-step progress indicator with step 1 complete and steps 2 and 3 named; the goods total
explicitly labelled «без доставки»; the quote SLA as a concrete date and time; the duty notice
from §18.23.3 restated; and the same save-this-link prompt, which matters more here because the
link is where the pay button will appear. A tick mark and the word «прийнято» over an unpriced,
unpaid order is the single easiest way to make a buyer believe they have already paid.

Purchase analytics fire here once, keyed on the order number in `sessionStorage`, so a refresh
does not double-count revenue.

---

## 18.17 Transactional email

All templates are per-locale, rendered in `Order.locale` — captured at order time and never
re-derived from a later browser session. A `de` buyer receives German mail forever, including
the delivery notice sent three weeks later.

| # | Email | Trigger | Contains | Notes |
|---|---|---|---|---|
| E1 | Order received | `Order` created, any method | Number, items, total, delivery address, tracking link, payment instructions where pending | Sent for every method. For card-online it is sent on webhook confirmation, not on redirect |
| E2 | Payment confirmed | `paymentStatus` → `PAID` | Receipt, amount, method, order link | Suppressed when E1 already confirmed payment, to avoid two near-identical mails |
| E3 | Payment failed | `paymentStatus` → `FAILED` | What happened, a retry link that reopens checkout with the cart intact, the phone number | §18.19 |
| E4 | Invoice | `BANK_TRANSFER` order created | PDF with IBAN, order number, required reference, deadline | The one email with an attachment |
| E5 | Order confirmed | `status` → `CONFIRMED` | Reassurance, dispatch window, what to expect next. On a custom-size order it carries **«Очікувана відправка: 12 жовтня»** — the stored `expectedDispatchAt` as a date, never «протягом 14 днів» ([00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 4) | The COD buyer's proof that a human saw the order |
| **E5b** | In production | `status` → `IN_PRODUCTION` | «Ваш виріб почали виготовляти», the expected dispatch date restated, and nothing else | New in round 4. Fourteen days of silence after payment is what makes a customer believe an order is stuck, and this is the cheapest possible intervention: one message that names what is happening. Exactly one — a weekly progress series on a two-person factory is a promise nobody can keep |
| E6 | Shipped | `status` → `SHIPPED` | Carrier, `trackingNumber`, tracking link, branch address and hours | Highest open rate of any message here |
| E7 | Ready for pickup | Pickup order → `PACKING` complete | Address, hours including Sunday, phone | |
| E8 | Delivered | `status` → `DELIVERED` | Care-guide link, returns window restated | |
| E9 | Review request | `DELIVERED` + `{{REVIEW_REQUEST_DAYS}}` | Signed token pre-linking `orderId`, so the review earns the verified badge (§17.15.4) | **The only mechanism that builds *verified* review inventory.** Its performance is a launch-critical metric, not a nice-to-have. It is no longer the only review channel — [00-client-decisions-4.md](00-client-decisions-4.md) §G4 confirms a business card already ships in every parcel, and a short URL plus QR code on it reaches counter-sale customers who have no order number at all. Those reviews keep `isVerifiedPurchase = false` and stay out of the aggregate rating, which is correct and must not be worked around ([17](17-product-page-specification.md) §17.15.4) |
| E10 | Cancelled | `status` → `CANCELLED` | Reason, refund timing where applicable | |
| E11 | Refunded | `paymentStatus` → `REFUNDED` / `PARTIALLY_REFUNDED` | Amount, method, expected arrival | |
| E12 | Abandoned cart | §18.20 | Cart contents, resume link | Consent-gated; not sent in `de` without opt-in |
| E13 | Back in stock | Notify-me fulfilled (§17.7) | Variant-specific, direct link | Keyed on `variantId`, never `productId` |
| **E-INTL-1** | Order received, quote to follow | International order created, `status = AWAITING_QUOTE` | The three steps, the SLA as a concrete date and time, goods total labelled «без доставки», tracking link, both phones, **the duty notice** | §18.23.7. Replaces E1 on the international path — sending a message headed "order confirmed" for an order that has not been priced is the exact confusion the flow exists to avoid |
| **E-INTL-2** | Shipping quote and payment link | `AWAITING_QUOTE → PENDING`, `quotedAt` set | Carrier, shipping amount, new total, quote expiry as a date and time, **the duty notice again**, the pay link | The buyer's only route to paying. Its deliverability is what [26-api-architecture.md](26-api-architecture.md) §26.16's sending-domain requirement protects |
| **E-INTL-3** | Quote expiring | 24 h before `quoteExpiresAt`, unpaid | One reminder, the same pay link, the expiry time | Exactly one. A second reads as pressure on a purchase this size |
| **E-INTL-4** | Quote expired | `CANCELLED`, `OrderEvent` reason `QUOTE_EXPIRED` | What happened, that stock was released, and a **one-click control that requests a fresh quote** ([00-client-decisions-5.md](00-client-decisions-5.md) §H2 — an expired quote is not a dead order) | Never silent — an order cancelled without notice is indistinguishable from being ignored |

**Three additions this round, all consequences of decisions above.**

1. **E1 carries the tracking link for every method, without exception.** With no accounts (§E12),
   E1 is the buyer's only record of how to reach their order. It was already listed; it is now
   load-bearing, and its deliverability is the launch-blocking item named in §18.12.3.
2. **E1 and E8 in `de` and `pl` carry the withdrawal notice and the model withdrawal form.** The
   EU 14-day right of withdrawal (§E11) comes with a statutory information duty that is
   discharged on a durable medium — the confirmation email is that medium. A link to the form on
   the website is not sufficient on its own; the notice text travels in the mail.
   [04-sitemap.md](04-sitemap.md) holds the page set, [32-security-architecture.md](32-security-architecture.md)
   the retention rules.
3. **Every international message restates the customs position.** Whatever §18.23.3 disclosed
   before payment is repeated in E-INTL-1, E-INTL-2 and the delivery notice, because the person
   who opens the door to the courier and pays the duty is often not the person who placed the
   order — and under §18.23.7 there are days between submission and payment in which to forget
   it. On the international path E-INTL-1 **replaces** E1 rather than accompanying it.

**Every email carries both numbers, in the order and with the framing
[00-client-decisions-4.md](00-client-decisions-4.md) §G1 sets**: `+380679973450` (Іван) first,
then «Якщо не відповідає — телефонуйте Любові: `+380679604769`». §G1 names the order confirmation
email specifically as a surface that carries both, and the reason is that a customer with a
problem should not have to guess — email is asynchronous, the reader is often acting on it days
later, and a single unanswered number at that distance is an unresolved problem rather than a
redial. No opening hours appear, for the reason given in §18.5.4.

The **legal footer of every email names Любов**, because it names the ФОП — «ФОП Гондурак Любов
Юріївна, {{LEGAL_ID}}» — while the contact block above it leads with Іван. That is the same
deliberate split §18.1 describes and it must not be flattened in either direction: an invoice
naming the wrong person is a defect, and a contact line naming someone who does not pick up is a
different one.

**Delivery infrastructure.** SPF, DKIM and DMARC must be configured on `{{DOMAIN}}` **before**
the first order, and warming matters more than usual: a brand-new sending domain with no
reputation lands in spam, and the first customers of a cold-start brand are the least likely to
go looking in a spam folder for confirmation of a five-figure purchase. Transactional and
marketing mail are separated at the subdomain level so a promotional complaint never damages
receipt deliverability.

**The sending address cannot be the client's Gmail, and this is a technical constraint rather
than a branding preference.** [00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies
`gif19601@gmail.com`, which is entirely usable as a public contact address and **unusable** as
the transactional `From:`. SPF and DKIM cannot be published for `gmail.com` by a third-party
system, Gmail's consumer DMARC policy rejects mail that fails them, and the practical result is
that order confirmations land in spam or are refused outright. Every message in the table above
therefore sends from `no-reply@{{DOMAIN}}` with `Reply-To:` pointing at a monitored address. The
full specification — records, addresses, reply routing and the panel mailbox ([26](26-api-architecture.md) §26.16.2) —
is in [26-api-architecture.md](26-api-architecture.md) §26.16, and it is a **Phase 1 blocker**
dependent on the domain decision. The reason it blocks here specifically: with no accounts
(§E12), a customer who paid and received nothing has no way to see their order at all, and
contacts support or disputes the charge. On the international path (§18.23.7) it is worse still,
because E-INTL-2 is the only route to paying.

Every email carries the order number in the subject, the phone number in the footer, a plain-text
alternative, and — for E1, E5, E6 and E8 — the guest tracking link. None contains the mascot;
none contains a promotional offer, because mixing marketing into a receipt is what gets the
receipt filtered.

---

## 18.18 Guest order tracking

`Order.guestToken` is a unique, high-entropy, non-sequential value
([25-database-schema.md](25-database-schema.md) §25.5) and is the entire mechanism. The tracking
URL is the same as the confirmation URL (§18.16) — one page, two entry points, no divergence.

A lookup form at `/{locale}/order-tracking` accepts **order number + email** for anyone who has
lost the link. It is rate-limited to 5 attempts per IP per 15 minutes and responds identically
whether or not the pair matches, so it cannot be used to enumerate orders or confirm that an
address has shopped here.

The tracking page shows the current `OrderStatus`, carrier and `trackingNumber` with a link out,
the full order snapshot, and — before `PACKING` — a cancellation request control. It requires no
account, which is now the entire point rather than a design preference:
[00-assumptions.md](00-assumptions.md) F7 asked whether accounts were wanted at all, and
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 answers **no, permanently**. This page
is therefore the sole post-purchase surface, and it must carry the load a customer account would
have carried.

Three consequences of being the only route in:

| Concern | Design |
|---|---|
| The link is lost | The lookup form at `/{locale}/order-tracking` is linked from the footer, from every transactional email, and from the contact page — not buried at a URL nobody knows. It asks for order number + email, states where to find the number, and uses no captcha |
| The email never arrived | Then nothing else works either, which is why §18.17's SPF/DKIM/DMARC requirement is a launch blocker rather than a best practice. The phone number is the documented fallback and support can read the `guestToken` link out of the admin |
| The page is shared or forwarded | Acceptable and expected — a `guestToken` URL is meant to be forwarded to a spouse or a recipient. It exposes one order and no customer record, because there is no customer record to expose. This is a security property of having no accounts, not a compromise around it |

---

## 18.19 Error and failure recovery

Checkout errors are not edge cases; they are a predictable percentage of traffic. Each path
below is designed, not caught.

| Failure | What the buyer sees | What the system does |
|---|---|---|
| **Card declined** | «Банк відхилив оплату. Спробуйте іншу картку або оберіть наложений платіж з оглядом.» Plus the PSP's reason where it is intelligible, never a raw code | Order stays `PENDING`/`UNPAID`, reservations held, cart intact. Section ③ reopens with the method selector focused. COD is offered explicitly as the alternative — for a declined buyer it is often the only remaining path to the order. **Not offered where the cart holds a custom-size line**, where card is the only permitted method (§18.8.7); there the copy names the card retry and the phone number instead, because suggesting an option the server will refuse is worse than offering none |
| **Network loss mid-payment** | The return page's poll times out into «Оплата обробляється. Ми надішлемо підтвердження на email.» | The order exists; the webhook resolves it independently of the browser. Nothing depends on the buyer's connection surviving |
| **Buyer closes the tab on the PSP page** | Nothing, then E1 or E3 by email | Identical to the above. The webhook is authoritative (§18.15) |
| **Double submit** | The second click does nothing visible; the button is in its loading state with its width preserved | Button disabled on first click; the client idempotency key returns the original order rather than creating a second |
| **Back button from the PSP** | Section ③ reopens with everything intact | The order remains `PENDING`. A subsequent successful payment reuses the same order — this is why the order is created before any payment attempt, in both branches |
| **Widget closed mid-payment** (branch B) | Section ③ reopens; the resumption banner offers «Продовжити оплату» or a change of method | Order stays `PENDING`. The widget's close event is not treated as a cancellation — the buyer may have completed 3-D Secure in a window that closed the widget behind it, so polling continues regardless (§18.8.4) |
| **Checkout page reloaded mid-payment** (branch B) | «Ви почали оплату замовлення № … » with two actions, instead of an empty section ③ | The order id is read from `sessionStorage` and re-validated server-side. Without this state the buyer's own reload is indistinguishable from a lost order and produces a second payment attempt |
| **Widget success callback never fires** | Nothing distinguishable from a normal wait — polling was already running | The callback is a hint, never a trigger (§18.8.4). The webhook is authoritative in both branches |
| **3-D Secure escalates to a full-page redirect in branch B** | The branch-A return page | The return URL is registered whichever branch is configured, precisely for this |
| **Expired reservation during checkout** | Inline on the affected line: «Час резервування минув. Перевіряємо наявність…» then either restored or marked unavailable | The line is never silently removed. If the item is gone, the buyer is shown what changed and the total is recomputed before any payment |
| **Stock gone at confirmation** (redirect race) | Email plus on-page explanation and an apology | Payment refunded automatically, order `CANCELLED`, stock restored, incident logged (§18.14) |
| **Carrier API down** | Selector works from the nightly reference sync, with a note that branch data may be up to a day old | Circuit breaker open; shipping price falls back to the tariff table (§18.5.2) |
| **PSP down, domestic buyer** | The card method is disabled with «Тимчасово недоступно», COD and bank transfer stay available | Health check on the payment step. Removing the method is better than letting buyers fail into a decline they will read as their bank's fault |
| **PSP down, international buyer** | «Оплата тимчасово недоступна. Ми повідомимо, щойно відновимо — залиште email.» plus the phone number | Card is the *only* method outside Ukraine (§18.23), so there is no alternative to fall back to. Capturing the email and following up is the only recovery available, and pretending otherwise would leave a blank payment step |
| **Promo code exhausted between apply and submit** | Named error, total recomputed, submit blocked until acknowledged | Re-validated at order creation (§18.10) |
| **Custom-size price changed underneath** | Inline on the line: «Ціну перераховано за поточним тарифом: 7 950 ₴ замість 7 776 ₴», with the new total and an explicit re-confirm before payment | The server recomputes from `Product.customSizeRatePerSqmMinor` at order creation (§18.8.7). If the owner edited the rate mid-session the buyer is shown both figures and charged neither until they acknowledge. Silently charging the new one is a card statement that disagrees with the page; silently honouring the old one is a rate the business did not set |
| **Custom dimensions now outside the loom bounds** | The line is marked unavailable with the named limit — «Максимальна ширина — 180 см» — and a link back to the PDP with the dimensions pre-filled | The bounds are physical (§17.6.6). An order that cannot be woven must fail **before** payment, because it is prepaid in full and non-returnable, which makes the post-payment version of this failure the worst-shaped one in the document |
| **COD selected, then a custom line added in another tab** | On submit, section ③ reopens with card-only and the prepayment reason, not with an error | `availableMethods` is re-run inside the order-creation transaction (§18.8.7). The buyer sees a changed choice and its reason rather than a rejection |
| **Deposit charged, parcel refused at the branch** | Nothing — this is a designed outcome, not a failure | `depositAppliedMinor` stays 0, the return leg is already funded, the order goes `RETURNED`, and no further collection is attempted. The buyer owes nothing and is told so in the cancellation mail (§18.8.5a) |
| **`DELIVERED` set twice, or reverted and re-set** | Nothing visible | The deposit credit is a logged no-op against an order already holding a non-zero `depositAppliedMinor` (§18.13). Crediting twice would give away the goods, and this is the transition most likely to be replayed by a carrier integration or an admin correction |
| **Session lost / reload** | Checkout resumes where it was | `sessionStorage` per section; the cart is server-side on `Cart.token` |

Every error message names what happened, states what to do, and preserves entered data.
Errors appear instantly and without motion ([13-motion-system.md](13-motion-system.md) §13.11) —
a user who has made a mistake wants information, not choreography. No stack traces, no provider
error codes, no «Помилка 500».

---

## 18.20 Abandoned cart recovery

Triggered when a `Cart` has items, a captured email, and no activity for 1 hour.

| Stage | Timing | Content | Rationale |
|---|---|---|---|
| 1 | +1 h | «Ваш кошик чекає» — items, resume link, no discount | Most recoveries are interruptions, not price objections. Discounting immediately trains buyers to abandon |
| 2 | +24 h | Adds the delivery and returns terms, plus the phone number | Answers A4/A5, the two anxieties most likely to have stalled the decision |
| 3 | +72 h | Only if the cart contains a one-of-one item: «Цей виріб існує в єдиному екземплярі» | Honest, specific, and only sent when true. No countdowns, no manufactured scarcity ([02-ux-research.md](02-ux-research.md) §2.2 non-jobs) |

No discount at any stage without an explicit merchandising decision. The resume link carries a
`Cart.token` that restores the exact cart, and expires with it.

**Consent.** `de` requires opt-in before any commercial email
([25-database-schema.md](25-database-schema.md) §25.9), so stages 1–3 do not fire for `de`
carts without consent. `uk`, `en` and `pl` follow soft opt-in with a one-click unsubscribe in
every message.

Checkout abandonment — email captured in section ① but never submitted — is a separate and more
valuable signal, and is instrumented per section so the analytics show *which* step lost the
order rather than that the checkout did.

---

## 18.21 Accessibility contract

Target: **Lighthouse Accessibility 100, WCAG 2.1 AA**, with 2.2 AAA target sizes. Checkout is
the surface where an accessibility failure costs money directly, and
[02-ux-research.md](02-ux-research.md) §2.6 identifies error *recovery* — not error prevention —
as the thing this audience needs most.

**Structure.** One `<h1>` («Оформлення замовлення»). Each accordion section is a `<section>`
with `aria-labelledby` on its header; headers are `<h2>`. The order summary is a `<section
aria-label="Ваше замовлення">`. Completed sections expose `aria-expanded="false"` with the
summary line in the accessible name, so a screen-reader user hears what was entered without
expanding.

**Focus.** Opening a section moves focus to its first field. Collapsing returns focus to the
«Змінити» control. Focus order matches visual order in every reflow state. The focus ring is
2 px and visible on every surface it appears on ([08-design-system.md](08-design-system.md)
§8.10). Focus is never trapped except inside the address combobox popup, which `Esc` releases.

**Forms.** Labels visible and above every field, always. `autocomplete` on every field per
§18.4 — which is an accessibility feature before it is a conversion one, since it removes
retyping for anyone with a motor or memory impairment. `aria-invalid` and `aria-describedby`
wired on error. Conditional fields are inserted into the DOM in reading order, and their
appearance is announced politely so a screen-reader user learns that selecting Ukrposhta added
an index field.

**Errors.** Announced via `aria-live="polite"`; a submit-blocking error summary at the top of
the failing section lists each problem as a link to its field. Error text never relies on colour
alone — it carries an icon and explicit wording ([09-color-palette.md](09-color-palette.md)
§9.4). Entered values are always retained.

**Disclosures that change with a selection.** Choosing «наложений платіж з оглядом» inserts the
§18.8.5a worked example into the DOM in reading order and announces its appearance politely, the
same rule the conditional carrier fields follow. The example is **plain text with real numbers**,
not a table and not an image: a screen-reader user must hear the same three sentences a sighted
user reads, and an arithmetic explanation rendered as a layout grid is heard as a column of
detached figures. The two-total summary — «Сплачуєте зараз» and «На пошті» — carries both labels
in text and both figures in `tabular-nums`, with the relationship between them stated rather than
implied by position. The same applies to the §18.8.7 mixed-cart disclosure: it is read as prose in
the document order the sighted user sees, and — because it first fires on the product page rather
than here — it must be **announced** at the add, in the add-to-cart `aria-live` region, as one
utterance rather than as a silently appearing banner
([17-product-page-specification.md](17-product-page-specification.md) §17.6.6). A constraint that
lands on a line the user added earlier is exactly the constraint a non-visual user cannot discover
by glancing at the cart.

**Payment.** If V6 yields the embedded widget (§18.8.4), its iframe must be reachable by keyboard
and must carry a `title`. **If WayForPay's widget fails a keyboard or screen-reader check, the
redirect branch (§18.8.3) is used for all buyers** — a hosted payment page that works is better
than an embedded one that excludes people. This is a go/no-go acceptance criterion on the branch
selection, not a preference, and it is the one circumstance in which the less preferred branch
wins outright.

If V6 yields only the hosted page, the accessibility of that page is WayForPay's and not ours to
fix. It is still ours to **test before launch**, because a buyer excluded at the payment step is
excluded from the business regardless of whose document the barrier lives in. A failure here is
escalated to the provider and, if unresolved, is a reason to reopen the PSP decision rather than
to ship it quietly.

**Targets and motion.** 48 px primary, 44 px floor, ≥8 px separation
([11-spacing-system.md](11-spacing-system.md) §11.7) — which covers radio rows, combobox
options, and quantity steppers, the three controls most often mis-tapped. Motion is limited to
cross-fades and is removed under `prefers-reduced-motion`. No timeout on the checkout itself;
the only clock is the reservation countdown, which is explained, visible, and extendable by
activity (WCAG 2.2.1).

**Verification.** Automated axe run in CI across all four sections and every payment method,
manual keyboard traversal of a complete purchase, one NVDA and one VoiceOver pass per release,
and a 200% zoom pass at 320 px.

---

## 18.22 Conversion optimisation checklist

Each item with the specific reason it is here. An optimisation that cannot state its mechanism
is cargo cult.

| # | Item | Mechanism |
|---|---|---|
| 1 | Guest checkout, with no accounts existing at all | Forced registration is the most-cited abandonment cause in checkout research. §E12 goes further than removing the wall — there is no account to offer, which removes the fork, the password field, the post-purchase prompt and the login link in one decision (§18.12) |
| 2 | `autocomplete` on every field | Removes the majority of manual typing on mobile. Zero cost, and it is also an accessibility win ([08-design-system.md](08-design-system.md) §8.6) |
| 3 | Correct `inputmode` per field | The wrong mobile keyboard is a measurable loss. A numeric pad for an index, a telephone pad for a phone |
| 4 | Accordion, one decision at a time | Reduces working-memory load, which [02-ux-research.md](02-ux-research.md) §2.6 names as a specific risk for the 60–75 segment |
| 5 | Prior answers always visible as summary lines | Removes the "did I enter that correctly?" backtrack that multi-step checkouts cause |
| 6 | Order summary never hidden | A buyer who cannot verify what they are paying for either abandons or calls |
| 7 | Phone number in the checkout header | This business's customers are used to calling. Removing the human fallback from a process that is currently entirely human would be a regression |
| 8 | COD kept and unapologetic, and **renamed to name the inspection** | On a new domain with no reviews, COD is the only instrument that makes a first order from an unknown seller feel safe (A4). [00-client-decisions-5.md](00-client-decisions-5.md) §H1.2 goes further: the inspection right is the strongest argument this brand has for a 5,000–15,000 UAH purchase, so «наложений платіж **з оглядом**» states it in the option's own name rather than in a footnote |
| 9 | Personal-card payment retired | It required a manager, a manual transfer and a wait. It is the conversion problem this project exists to fix, and it is a fraud-impersonation risk (§18.9) |
| 10 | Promo field collapsed and placed late | An open empty code box tells buyers a better price exists and sends them to look for it |
| 11 | Shipping cost never hidden until the end | Unexpected shipping cost is the single most-cited abandonment reason in every checkout study of the last decade. All four options are priced on the PDP already (§17.12) |
| 12 | Delivery date computed on the real calendar | A specific date outperforms a range, and a range outperforms "1–3 дні" with no anchor. It also prevents promising dispatch on a closed day |
| 13 | Errors preserve entered data and name the fix | Recovery speed matters more than error rate for this audience ([02-ux-research.md](02-ux-research.md) §2.6) |
| 14 | Double-submit protection | Prevents the duplicate order that generates a refund, a support call, and a lost customer |
| 15 | Card fields never in our DOM | Keeps PCI scope minimal, and a PSP-branded field is more trusted at the moment of entry than a custom one |
| 16 | Cart preserved through payment failure | The buyer can retry in one click instead of rebuilding a three-line cart |
| 17 | Confirmation page is a stable, shareable URL | Removes the "did it go through?" phone call and gives the buyer a permanent record |
| 18 | Confirmation page prompts the buyer to save the link, not to create an account | There is no account to create (§E12). The `guestToken` URL does the job an account would have done, and asking someone to bookmark a page they are already looking at is the lowest-friction retention action available |
| 19 | Reservation countdown only where scarcity is real | Honest urgency on one-of-one items; no manufactured urgency anywhere else ([13-motion-system.md](13-motion-system.md) §13.11) |
| 20 | No mascot, no animation, no decoration in checkout | [01-brand-strategy.md](01-brand-strategy.md) §1.7 and [13-motion-system.md](13-motion-system.md) §13.11. Every non-functional element on a payment page is a distraction from the one action that matters |
| 21 | Email deliverability configured before launch | A confirmation in spam on a brand-new domain produces a support call and a refund request, and the cold start makes this materially more likely |
| 22 | Per-section abandonment instrumentation | Tells the business *which* step loses orders. Without it, optimisation is guesswork |
| 23 | Customs and duties disclosed before payment | The cross-border equivalent of item 11. A duty demanded at the door on a parcel whose checkout never mentioned duty produces a refused delivery, a returned parcel, and a refund request — the single most expensive post-purchase failure in international retail (§18.23) |
| 24 | The charge currency stated when it differs from the displayed one | If V11 forces UAH settlement, the buyer's card statement will not match the price they read. Saying so on the payment step costs a sentence; discovering it costs a chargeback (§18.23) |
| 25 | **The return deposit shown as a worked example with the buyer's own three numbers** | The single highest-risk piece of copy on the site. Framed as prose or as a percentage it reads as *pay extra for permission to look at the goods*, which is worse than not offering inspection at all. Framed as «80 + 80 ₴ → на пошті доплатите 11 820 ₴ замість 11 900 ₴» it is obviously fair in one reading. §H1.3 makes the arithmetic mandatory; §18.8.5a makes the numbers live |
| 26 | **The word «застава», never «комісія»** | A deposit is a thing you get back; a commission is a thing you do not. One word carries the entire difference between a refundable-by-offset mechanic and a surcharge, and buyers categorise on the noun before they read the explanation |
| 27 | **Two totals shown when payment happens in two places** | «Сплачуєте зараз 160 ₴» and «На пошті 11 820 ₴». A single total on an order collected twice, at two times, in two amounts, is the summary that produces the phone call — and on a COD order the phone call comes from the branch counter, with a queue behind the customer |
| 28 | **The made-to-order prepayment states its reason** | §H1.1. «Оплата — повна, наперед» alone reads as an assessment of the buyer. «Виріб шиється за вашими розмірами, тому…» reads as a fact about the object, and buyers accept facts about objects |
| 29 | **The mixed-cart consequence is disclosed at the add, not at the payment step** | [00-client-decisions-6.md](00-client-decisions-6.md) §J1. Adding a custom-size item changes the terms of the stocked item already in the cart — prepaid instead of COD, two weeks instead of tomorrow. Said at the add it is a fact about a cart being built; said at payment, after an address and a branch have been entered, it is a term that changed under the buyer. The escape — order the stocked item separately — is offered in the same place (§18.8.7) |
| 30 | **A date, not a duration, for made-to-order dispatch** | §G2 rule 4. «Очікувана відправка: 12 жовтня» is checkable against a calendar; «протягом 14 днів» is a memory test the customer fails in the direction that makes us late |
| 31 | **One message when production starts** (E5b) | Fourteen days of silence after a full prepayment is what makes a customer believe the order is stuck. One email naming what is happening is the cheapest support-contact reduction in the document |
| 32 | **Іван's number in the header, Любов's framed as the fallback** | §G1. One number at the moment of contact removes a decision from someone who is already stuck; two equal numbers add one. The fallback belongs in the summary and in email, where the reader is not mid-task |

---

## 18.23 International checkout

[00-client-decisions-2.md](00-client-decisions-2.md) §E11 answers the question
[00-assumptions.md](00-assumptions.md) C5 left open:

> «Якщо іноземці хочуть замовити з України, то так, прошу.»

`en`, `pl` and `de` are **transactional**. That is one sentence from the client and a genuinely
different checkout, because four things change at the border simultaneously: the payment methods
available, the carrier, the tax position, and the consumer law that governs the sale.

### 18.23.1 Method availability by destination

| Method | Ukraine | Outside Ukraine | Why |
|---|---|---|---|
| Card via WayForPay | ✔ Default | ✔ **The only method** | The sole instrument that settles across a border without a manual step. [00-client-decisions-5.md](00-client-decisions-5.md) §H1.2 confirms it for all products and all destinations |
| «Наложений платіж з оглядом» | ✔ Prominent, **stocked items only** | ✖ Not rendered | **Ukraine only** (§H1.2). A domestic carrier service. Nova Poshta and Ukrposhta do not offer it on the international products under consideration, and even where a carrier nominally does, cash collection abroad is unreconcilable for a ФОП |
| **Return-shipping deposit** | ✔ On COD-with-inspection orders | ✖ **Prohibited** | §H1.3 and §18.8.5a. Under the EU Consumer Rights Directive a trader may not hold a deposit against the exercise of the 14-day right of withdrawal. `shippingReturnDepositMinor` is null on every non-UA order and a non-null value is **rejected at order creation**, not merely omitted by the UI |
| IBAN transfer | ✔ B2B, de-emphasised | ✖ | Manual reconciliation against a Ukrainian account, with cross-border fees the buyer did not agree to and a settlement delay measured in days |
| Partial prepayment | ✔ Every stocked order (§18.9, §L7) | ✖ | Depends on collecting the balance at a domestic delivery point |

Unavailable methods are **not rendered at all** outside Ukraine, rather than shown disabled. A
German buyer has no prior concept of «наложений платіж», so a greyed row with an explanation is
noise where a domestic disabled row would have been informative.

**The international cart is also the one place where two restrictions stack.** A `de` buyer
ordering a custom size gets card-only twice over — once because the destination is outside Ukraine
(§18.23.1) and once because the line is made-to-order (§H1.1) — and §18.8.7's derivation returns
`['CARD_ONLINE']` on the first test without evaluating the second. That is correct and worth
stating, because the *copy* differs: the buyer is shown the made-to-order prepayment reason rather
than a destination explanation, since it is the one that also explains the fourteen-day wait.

**The single-method consequence must be designed for, not assumed away.** With card as the only
path, a declined card or a PSP outage ends the order — there is no COD to fall back to. §18.19
therefore carries a distinct international row for PSP downtime, and the decline copy omits the
«або оберіть наложений платіж з оглядом» sentence that is correct domestically and misleading abroad.

**The card is not collected at submission.** Under enquiry-then-invoice (§18.23.7) the
international buyer submits an order with no payment instrument attached and pays from a link
once the shipping quote exists. The methods table above therefore describes what is available at
**step ③**, not at the point of submission — a distinction that matters because a PSP outage on
an international order is recoverable (the pay link simply still works an hour later) in a way a
domestic single-step outage is not.

### 18.23.2 Carriers — multiple, chosen per order

`{{INTL_CARRIER}}` is **resolved**, and the resolution is that there is no single carrier.
[00-client-decisions-3.md](00-client-decisions-3.md) F4 records the actual operation:

> «Відправляють через Нову пошту, Укрпошту та різними перевізниками; покупець оплачує все.»

| Aspect | Resolution |
|---|---|
| Domestic carriers | Nova Poshta, Ukrposhta |
| International carriers | Nova Poshta Global, Ukrposhta International, **plus other carriers case by case** |
| `{{INTL_CARRIER}}` | Resolves to *multiple, quoted per order* — a model, not a name |
| Who pays shipping | **The buyer**, every destination, no exceptions and no threshold |
| Who pays customs, duty, import VAT | **The buyer**, at the destination |
| Incoterms, in effect | **DAP** — delivered, duties unpaid |

**This changes the architecture, not just a token.** The previous revision of this section
treated the enquiry path as temporary scaffolding pending a carrier contract. F4 removes the
premise: a business that picks the carrier per shipment cannot have a live rate API, because
there is no single upstream to call and no table that would be right twice in a row. Two models
were available, and the recommendation is unambiguous:

| Model | Assessment |
|---|---|
| **Flat-rate zones with a published table** | Rejected. Simple to build and wrong in both directions simultaneously — it overcharges the easy destinations, which loses the order, and undercharges the hard ones, which loses money on the order it wins. On a 4 kg ліжник to a distant destination the undercharge is not a rounding error; it can exceed the product margin. It also has to be maintained by hand against carriers that reprice independently |
| **Enquiry-then-invoice** | **Selected and recommended as the permanent model.** The customer submits the order, receives a shipping quote, then pays. Slower, honest, and it matches how the business actually operates. Full specification in §18.23.7 |

The trade-off is real and worth naming: enquiry-then-invoice inserts a human step and a delay
into the one moment e-commerce is optimised to eliminate. §18.23.7 is written almost entirely
about containing that cost — how fast the quote must arrive, what the buyer sees while they
wait, and how the gap is kept from reading as abandonment. That is where the design effort goes,
not into pretending a rate exists.

Flat-rate zones remain available as a **later optimisation for the few destinations that earn
it**. Once enough real orders exist to show that, say, Poland is consistently quoted within a
narrow band, publishing a fixed Poland rate turns the most common international route back into
a one-step checkout while everything else keeps the quote path. That is an evidence-driven
addition; it is not something to guess at launch.

### 18.23.3 Customs and duties — a blocking pre-payment element

[00-client-decisions-3.md](00-client-decisions-3.md) F4 puts customs duties and import taxes on
the buyer, in full, at the destination — effectively **DAP**. That is a normal and acceptable
arrangement for a small Ukrainian shipper. Discovering it at the door is not.

**This is a blocking element, not an accordion.** The previous revision placed the notice
inline in sections ③ and ④; F4 escalates it. The requirement is now explicit:

| Property | Requirement |
|---|---|
| Placement | In the payment step's primary column, immediately above the pay button. Not in a sidebar, not below the fold on any supported viewport |
| Disclosure pattern | **Always expanded.** Never a `<details>`, never a tooltip, never "read more", never a modal the buyer can dismiss without reading |
| Blocking behaviour | The pay button is disabled until the notice has been **rendered in the viewport**. On the international path only, an explicit acknowledgement checkbox is required — unchecked by default, which §18.4 already mandates and `de`/`pl` law makes non-negotiable |
| Persistence | The exact rendered string, its locale and the acknowledgement timestamp are snapshotted into the order (`Order.dutyDisclosureSnapshot`, schema addendum — see §18.23.7). A screenshot of what the buyer was told is the only defence in a chargeback |
| Repetition | Restated in the shipping quote email, in E1, and on the confirmation page. The person who opens the door to the courier is often not the person who placed the order (§18.17) |

**The required copy**, in Ukrainian, as ruled:

```
⚠ МИТНІ ЗБОРИ ТА ПОДАТКИ

Ціна не включає митні збори та податки країни призначення.
Їх сплачує отримувач при отриманні.
Сума залежить від країни та вартості замовлення.

☐ Я розумію, що можу сплатити митні збори при отриманні
```

**Localisation is a requirement, not a build step.** The `en`, `pl` and `de` renderings are
translated by a competent human translator against the destination's own customs vocabulary and
are **not** machine-translated. A German buyer reads *Einfuhrumsatzsteuer* and *Zollgebühren* as
specific, familiar charges; a machine rendering of the Ukrainian sentence reads as a foreign
shop that does not know what it is talking about, which is the precise impression that makes
someone abandon a five-figure cart. The strings live in the locale message catalogue, are marked
as legally-reviewed copy, and are excluded from any bulk re-translation pass.

Four reasons this is the highest-priority element on the international path:

1. **It is the most expensive avoidable failure in cross-border retail, and the failure mode is
   compounding.** An EU buyer surprised by an import VAT bill refuses the parcel. The shop then
   absorbs the outbound shipping, an **international return** shipped from another country, and
   a full refund — on an order that generated no revenue. That is three costs and a lost
   customer from one sentence nobody wrote. It is the single most common way small cross-border
   shops lose money.
2. **Disclosure after payment is not disclosure.** A line in the confirmation email or in the
   terms page satisfies nobody: the buyer has already paid, and their recollection is that the
   site said nothing. Legally and commercially, the notice exists only if it was seen first.
3. **It is a `de`/`pl` compliance matter, not only a courtesy.** EU consumer law requires total
   cost information before the order is placed, and an unquantifiable third-party charge must at
   minimum be disclosed as existing.
4. **Under enquiry-then-invoice the buyer sees the total twice**, once at submission and once in
   the quote. The notice appears at both points, because a buyer who read it a day earlier and
   is now clicking a payment link has had ample time to forget it.

Where the destination's de-minimis threshold is known, the copy names it. Where it is not, the
copy says the amount depends on local rules rather than guessing — an invented figure is worse
than an honest "we cannot tell you exactly", and a figure that turns out low is remembered as a
quote rather than as an estimate.

### 18.23.4 Currency — display versus charge

Blocked on **V11** (§E10): whether WayForPay can settle non-UAH.

| If V11 confirms multi-currency | If V11 denies it |
|---|---|
| Prices display and charge in the locale's currency. Nothing further is required | Prices display converted for orientation, **the charge is in UAH**, and the checkout says so before payment |

The second branch is the one requiring design, and the requirement is a single non-negotiable
sentence on the payment step and in the summary:

```
Сума списання: 11 980 ₴ (≈ 265 €)
Ваш банк може застосувати курс конвертації та комісію.
```

The reasoning is the same as §18.23.3's: a card statement that does not match the price the buyer
read is read as an error or a fraud, and it produces a chargeback rather than a support email. The
conversion rate used for display is stated as indicative — «≈» is not decoration — because the
bank's rate on the day will differ and a figure presented as exact will be held against us.

Structured data follows the charge currency, not the display currency
([17-product-page-specification.md](17-product-page-specification.md) §17.6.1, §17.21.3).

### 18.23.5 EU consumer law — `de` and `pl`

| Requirement | Where it lands in this document |
|---|---|
| **14-day right of withdrawal** | Stated in section ④ before submit, in the confirmation page, and in E1. It is a statutory right, not a merchant policy, and the copy must not present it as generosity |
| **Model withdrawal form** | Linked from section ④, from the returns block, and **attached or reproduced in E1** — the information duty is discharged on a durable medium |
| **Made-to-order exemption** | Custom production is excluded from withdrawal under the made-to-specification exemption, but the exclusion must be stated in the statutory terms and acknowledged at the point the made-to-order line enters the cart, not discovered during a withdrawal attempt |
| **Impressum** | Mandatory for `de`. Requires `{{LEGAL_ID}}` for ФОП Гондурак Любов Юріївна (§E1), still outstanding |
| **Pre-checked consent** | Already forbidden throughout (§18.4). Restated because `de` and `pl` make it unlawful rather than merely poor practice |

Legal page set: [04-sitemap.md](04-sitemap.md). Retention and data-subject handling:
[32-security-architecture.md](32-security-architecture.md) — materially simpler now that §E12
removes customer accounts and their profile data.

### 18.23.6 Product availability — the wool-only recommendation

**Recommendation on record: `de` and `pl` launch wool-only** (§E11).

Sheepskin and leather goods entering the EU face species-declaration requirements and, for some
materials, CITES documentation. Wool faces none. Three reasons this is the right launch shape:

1. **An unfulfillable order is worse than an absent product.** A seized or returned hide parcel
   costs the shipping, the refund, and the review — on a domain with no reviews to absorb it.
2. **The German market carries a live ethical sensitivity to fur and hide goods**, already
   flagged in [00-client-decisions.md](00-client-decisions.md) D3. Leading the `de` launch with
   sheepskin spends the brand's thinnest credibility on its most contested category.
3. **Wool is the lead category anyway.** The restriction costs almost nothing in catalogue terms
   and removes the entire paperwork question from the critical path.

Implementation is a **destination-based availability rule**, not a separate catalogue: hide
products are filtered out of `de`/`pl` listings and blocked at add-to-cart for those destinations,
with a plain explanation rather than a silent absence. The rule is a `Setting`, so enabling hides
for EU destinations once the documentation is confirmed is a configuration change.

A buyer in `de` who reaches a hide product by direct link sees it, sees why it cannot ship to
their country, and is offered the wool equivalent — which is the same pattern §17.10.3 uses to
route partner traffic to own manufacture, and for the same reason.

### 18.23.7 Enquiry-then-invoice — the international order lifecycle

This is the model §18.23.2 selects, specified in full. The buyer submits a complete order, the
shop quotes the shipping, the buyer pays. Three steps instead of one, and the entire design
problem is that the middle step is a gap in which a stranger's money-in-waiting has to feel like
a process rather than a silence.

#### The flow

```
① SUBMIT                         buyer, checkout
   Full cart, full address, contact details, duty notice acknowledged.
   NO payment instrument collected. NO shipping figure shown.
   Order created: AWAITING_QUOTE / UNPAID,
   shippingMinor = null, totalMinor = null.
   Stock reserved on the long TTL.
         │
         │  ← E-INTL-1 sent immediately: "we have your order,
         │     a shipping quote follows within 2 working days"
         ▼
② QUOTE                          staff, admin
   Operator picks the carrier for this destination, weight and value,
   enters shippingMinor and the carrier name.
   Order: AWAITING_QUOTE → PENDING, still UNPAID.
   shippingMinor and totalMinor written. quotedAt set.
   OrderEvent written. quoteExpiresAt = now + 72 h (36 h one-of-one).
         │
         │  ← E-INTL-2 sent: the quote, the new total, the duty notice
         │     again, and the payment link
         ▼
③ PAY                            buyer, hosted payment page
   Payment link → /{locale}/order/{guestToken}/pay
   → WayForPay per §18.8. Webhook per §18.15.
   Order: CONFIRMED / PAID. Stock decremented. Reservations released.
         │
         ▼
   Normal fulfilment from §18.13 onward. No further divergence.
```

#### State mapping — against the ratified `OrderStatus`

[25-database-schema.md](25-database-schema.md) §25.5 ratifies **`AWAITING_QUOTE` as a member of
`OrderStatus`**, preceding `PENDING`. An earlier revision of this section carried the quote
lifecycle on a separate nullable `quoteStatus` axis; §18.13 records why that argument lost and the
mapping below is rewritten against what shipped.

| Stage | `OrderStatus` | `PaymentStatus` | Marker fields | Why this mapping |
|---|---|---|---|---|
| Submitted, awaiting quote | **`AWAITING_QUOTE`** | `UNPAID` | `shippingMinor` null, `totalMinor` null | No payment is possible, no stock is committed, and the customer is waiting on **us**. None of that is true of a `PENDING` order, and the queue that must act on it is the quoting queue rather than the packing list |
| Quote issued, awaiting payment | `PENDING` | `UNPAID` | `quotedAt` set, `quoteExpiresAt` set, `shippingMinor` and `totalMinor` written | Now it is an ordinary unpaid order: a number exists and the customer can act. `PENDING` is exactly right from this point |
| Paid | `CONFIRMED` | `PAID` | — | Identical to the domestic card path from here |
| Quote expired unpaid | `CANCELLED` | `UNPAID` | `OrderEvent` reason `QUOTE_EXPIRED` | Reservations released, stock restored, in one transaction (§18.13) |
| Buyer declines the quote | `CANCELLED` | `UNPAID` | `OrderEvent` reason `QUOTE_DECLINED` | A declined quote is a pricing signal and an expired one is a follow-up failure. The distinction is preserved in the event reason rather than in a status, which is where it belongs — it is history, not state |
| Quote withdrawn by the shop | `CANCELLED` | `UNPAID` | `OrderEvent` reason `QUOTE_WITHDRAWN` | Destination becomes unshippable, or the item sells domestically first |

**The three cancellation outcomes collapse to one status and three event reasons, and that is an
improvement.** `EXPIRED`, `DECLINED` and `WITHDRAWN` describe *why an order ended*, not *where its
goods are*. Carrying them as statuses would have meant every list filter and permission check
learning three values with identical fulfilment semantics, while `OrderEvent.reason` already
exists, is already audited, and is already what the admin reads when someone asks what happened to
an order. Merchandising reporting queries the events; operations queries the status.

**Schema addendum still pending ratification in
[25-database-schema.md](25-database-schema.md) §25.5:**

```prisma
model Order {
  // …existing fields, including the ratified quotedAt / quoteExpiresAt
  quotedCarrierName      String?   // free text: the carrier chosen for THIS order
  quotedByStaffId        String?   // who set the price the customer will be charged
  dutyDisclosureSnapshot Json?     // exact string, locale, acknowledged timestamp
}
```

`quotedCarrierName` is free text rather than an enum extension on purpose. F4 says *«різними
перевізниками»* — the set is open and operator-chosen, and an enum of carriers would need a
migration every time the business tries a new one. `ShippingCarrier.INTERNATIONAL`
([25-database-schema.md](25-database-schema.md) §25.5) stays as the coarse routing value; the
specific name is data.

#### The quote-issuing step

| Aspect | Specification |
|---|---|
| Who | Any staff member holding `orders.quote` ([24-employee-permission-architecture.md](24-employee-permission-architecture.md)). A distinct permission from `orders.edit`, because issuing a quote sets a price the customer will be charged |
| Where | An admin queue filtered to `status = AWAITING_QUOTE`, sorted oldest first, with the order's destination, total weight, declared value and largest dimension precomputed and displayed — the four figures a carrier asks for. The operator should never have to open the line items to quote |
| Input | Carrier name, shipping amount in minor units, optional transit estimate, optional note to the customer |
| Validation | `shippingMinor > 0` is **required**. A zero international shipping charge is rejected at the API, because F4 rules free shipping never applies internationally and the most likely route to violating that is an operator leaving a field blank |
| Effect | `shippingMinor` and `totalMinor` written in one transaction, `AWAITING_QUOTE → PENDING`, `quotedAt` and `quoteExpiresAt` set, `OrderEvent` written with `fromValue`/`toValue`/`actorId`, E-INTL-2 enqueued |
| Re-quoting | Permitted while `PENDING` and unpaid. It writes a second `OrderEvent`, invalidates the previous payment link, resets `quoteExpiresAt`, and sends a corrected E-INTL-2 that says plainly that the earlier figure is replaced |
| Owner | **Гондурак Любов Юріївна** by default ([00-client-decisions-5.md](00-client-decisions-5.md) §H3). She is the ФОП seller of record and already owns the commercial and contractual side, while Іван owns production and the primary phone. Quoting is a commercial act, and the person who signs the contract should price the shipping. `Lead.assignedToId` and this queue default to her account — a default, not a constraint, and reassignable |
| SLA | **`{{QUOTE_SLA_HOURS}}` = 48 working hours** (§H2). The customer-facing copy says «протягом 2 робочих днів» — see below |

#### Delivering the payment link

The link is `/{locale}/order/{guestToken}/pay` — the existing guest-token URL space from §18.16
and §18.18, with one additional segment. That choice carries its weight:

- **No new credential.** `guestToken` is already high-entropy, non-sequential and unique
  ([25-database-schema.md](25-database-schema.md) §25.5), and it is already the mechanism by
  which a guest reaches their own order. Minting a second single-use payment token would create
  a second secret to expire, revoke and support.
- **It is reachable without the email.** The order tracking page (§18.18) shows the quote and the
  same pay button. A buyer who lost E-INTL-2 recovers through the lookup form rather than through
  support — which matters more here than on a domestic order, because this buyer has an unpaid
  order that dies on a timer.
- **The link survives re-quoting.** Same URL, new amount, read live from the order. A stale link
  that 404s after a corrected quote is a support ticket.
- **It is delivered by email and repeated in the tracking page**, never only by email. §18.17's
  deliverability requirement and [26-api-architecture.md](26-api-architecture.md) §26.16's
  sending-domain constraint apply with full force: an international buyer whose quote email is
  filtered has no other route to pay, and the order expires silently.

The payment step itself is unchanged — WayForPay per §18.8, with the V6 branch selection and the
V11 currency branch (§18.23.4) applying exactly as they do domestically. The duty notice from
§18.23.3 renders again above the pay button.

#### Expiry

[00-client-decisions-5.md](00-client-decisions-5.md) §H2 sets both numbers. They are **operational
commitments rather than settings**, chosen to be safe for a two-person business rather than
impressive to a customer, and §H5 item 2 asks the client to confirm or replace them before launch.

| Property | Value | Reasoning |
|---|---|---|
| Quote SLA | **`{{QUOTE_SLA_HOURS}}` = 48 working hours** | A two-person business with a factory to run cannot honestly promise same-day. 48 hours survives a busy week, a weekend and an illness. §H2's formulation is the one to keep in mind: promising 24 and delivering 50 is worse than promising 48 and delivering 20 |
| Quote validity | **`{{QUOTE_EXPIRY_HOURS}}` = 72 hours** from issue | Long enough for a buyer in another timezone to decide over a weekend; short enough that carrier pricing and stock have not moved underneath it |
| One-of-one items | **36 hours** — half the standard window | Holding a unique ліжник for three days on an unaccepted quote blocks a buyer who would pay today. The admin queue flags such orders so an operator can make the commercial decision rather than discover it later |
| Stock reservation TTL | Matched to `quoteExpiresAt`, **not** the 15/30-minute domestic TTLs of §18.14 | A quoted order holds real inventory for days. This is the genuine cost of the model and it is accepted deliberately |
| Reminder | One, at 24 hours before expiry (E-INTL-3) | One reminder converts; two read as pressure on a purchase this size |
| On expiry | `OrderStatus → CANCELLED` with `OrderEvent` reason `QUOTE_EXPIRED`, reservations released and stock restored in the same transaction, E-INTL-4 sent | Never silent. A cancelled order the buyer was not told about is indistinguishable from a shop that ignored them |
| Re-issue | **One click for the customer, from the tracking page and from E-INTL-4** — and one click for staff from the admin | §H2: an expired quote is not a dead order. The customer-side control is the change worth naming — it creates a fresh `AWAITING_QUOTE` order from the cancelled one's snapshot, subject to stock still existing, and it lands in the same queue. The commonest real outcome is a buyer who was simply on holiday, and requiring them to rebuild a cart to say so loses an order that was already won |
| Admin visibility | An expired quote appears in the queue as a **lapsed opportunity**, not as a failure | §H2. Filed beside live work rather than in a cancelled-orders archive nobody opens, because the follow-up is worth more than the record |
| Job | `orders.expireQuotes`, every 15 minutes ([26-api-architecture.md](26-api-architecture.md) §26.17) | |

**Under-promise, over-deliver — the copy and the commitment are deliberately not the same
number.** §H2 rules that the customer-facing string is «**протягом 2 робочих днів**» while the
internal SLA is 48 working hours. Those describe the same commitment, but the customer-facing form
is the one that survives being read at 23:00 on a Friday: a quote arriving in four hours is then a
pleasant surprise, and the reverse is a complaint. The internal number is what the admin queue is
measured against; the external phrase is what E-INTL-1 says.

**But the concrete-timestamp rule below still governs the individual message.** «Протягом 2
робочих днів» is the *promise*; E-INTL-1 additionally states the resulting deadline as a date and
time computed against the working calendar. The general phrase sets the expectation and the
specific timestamp makes it checkable, and neither substitutes for the other.

#### Keeping the buyer informed across the gap

This is the part that decides whether the model works. A buyer who has typed a full address and
clicked submit on a five-figure order, and then sees nothing, does not conclude "they are
preparing my quote" — they conclude they have been ignored, or worse, that they have paid
something and cannot see it. Four mechanisms, and none of them is optional:

| Mechanism | Detail |
|---|---|
| **The submit button never says "Pay"** | It says «Надіслати замовлення» / *Submit order* / *Bestellung absenden*. The expectation is set before the click, not explained after it. A button labelled "Pay" that does not take payment is the whole failure in one word |
| **Pre-submit explanation, inline and expanded** | Above the submit button, beside the duty notice: «Міжнародну доставку ми розраховуємо індивідуально. Ви надішлете замовлення, ми надішлемо вартість доставки протягом 2 робочих днів, і тільки після цього ви оплатите.» Three sentences, three steps, no jargon |
| **A confirmation page that is not a receipt** | §18.16's page renders a distinct international variant: a three-step progress indicator with step 1 complete, the SLA restated as a date and time rather than a duration, the tracking link, both phone numbers, and **no total presented as final**. `totalMinor` is shown explicitly labelled «без доставки» |
| **E-INTL-1, sent immediately** | Not "order confirmed" — «Ми отримали ваше замовлення». It restates the three steps, gives the SLA as a concrete date, carries the tracking link and both phone numbers, and repeats the duty notice. It is the single most important message in the international set, because it is the only thing standing between submission and the quote |
| **The tracking page is live from submission** | §18.18's page shows the order status in plain language at every stage — `AWAITING_QUOTE` renders as «Розраховуємо вартість доставки», so a buyer who checks at hour six sees «Розраховуємо вартість доставки» rather than an order that looks stalled |

The resulting deadline is stated as a date and time («до 14:00, вівторок 12 травня»), never as a
duration. "Within 24 hours" starts an argument about when the clock started; a timestamp does
not. The calculation respects the working calendar and the December/January closures already
used in §18.5.4.

**Measurement.** `intl_order_submitted`, `intl_quote_issued` with time-to-quote,
`intl_quote_paid`, `intl_quote_expired`, `intl_quote_declined`. The two numbers that decide
whether the model survives are **median time-to-quote** and **quote-to-payment conversion**. If
time-to-quote drifts past the promised SLA, the promise changes before the copy does; if
conversion is low against a healthy SLA, the quotes themselves are the problem, not the flow.
Contract in [31-analytics-architecture.md](31-analytics-architecture.md).

---

## 18.24 Tokens used and introduced

| Token | Meaning | Severity | Where |
|---|---|---|---|
| `{{DOMAIN}}` | Undecided, deferred to deployment ([00-client-decisions-2.md](00-client-decisions-2.md) §E9). Now also gates the transactional sending address ([00-client-decisions-3.md](00-client-decisions-3.md) F5) | BLOCKER | Email deliverability, confirmation and tracking URLs, `no-reply@{{DOMAIN}}` |
| `{{TRANSACTIONAL_FROM}}` | `no-reply@{{DOMAIN}}`. **Cannot be `gif19601@gmail.com`** — SPF/DKIM cannot be published for `gmail.com` and consumer DMARC rejects the mail (F5) | BLOCKER, Phase 1 | §18.17, [26](26-api-architecture.md) §26.16 |
| `{{LEGAL_ID}}` | ЄДРПОУ / РНОКПП for ФОП Гондурак Л. Ю. (§E1). **Exists and will be supplied** (F1) | Scoped blocker | Offer contract, WayForPay onboarding, `de` Impressum — **and nothing else in this document** |
| `{{INTL_CARRIER}}` | **Resolved** (F4) to «multiple, quoted per order» — Nova Poshta, Ukrposhta and others case by case. No longer a blocker; enquiry-then-invoice (§18.23.7) is the model | RESOLVED | §18.6, §18.23.2 |
| `{{QUOTE_SLA_HOURS}}` | **Resolved to 48 working hours** ([00-client-decisions-5.md](00-client-decisions-5.md) §H2). Customer-facing copy says «протягом 2 робочих днів». Confirm before launch (§H5.2) | RESOLVED, confirm | §18.23.7 |
| `{{QUOTE_EXPIRY_HOURS}}` | **Resolved to 72 h** (§H2), **36 h** for `isUniquePiece` orders. Confirm before launch (§H5.2) | RESOLVED, confirm | §18.23.7 |
| `{{NP_BRANCH_PRICE}}` | Nova Poshta branch tariff — **unknown**. The audited 80 UAH belongs to the adjacent business | HIGH | §18.5.1, §18.6 |
| `{{NP_COURIER_PRICE}}` | Nova Poshta courier tariff — unknown | HIGH | §18.5.1, §18.6 |
| `{{UKRPOSHTA_PRICE}}` | Ukrposhta tariff — unknown | HIGH | §18.5.1, §18.6 |
| `{{FREE_SHIPPING_THRESHOLD}}` | Free-delivery threshold — **unknown**, and to be set from Вівчарик's own price list rather than inherited | HIGH | §18.7 |
| `{{COD_CEILING}}` | Maximum order value payable by COD | HIGH | §18.8.5 |
| `{{COD_REVIEW_THRESHOLD}}` | Value above which first-time COD orders get a phone confirmation | MEDIUM | §18.8.5 |
| ~~`{{PARTIAL_PREPAY_THRESHOLD}}`~~ | **Retired.** The method is offered on every domestic stocked order ([00-client-decisions-8.md](00-client-decisions-8.md) §L7); there is no threshold | — | §18.9 |
| `{{REVIEW_REQUEST_DAYS}}` | Days after delivery before E9 | LOW | §18.17 |
| `{{MADE_TO_ORDER_DAYS}}` | **Resolved to 14** ([00-client-decisions-4.md](00-client-decisions-4.md) §G2) — production time **before dispatch**, never total delivery time | RESOLVED | §18.2.2, §18.13, §18.16, §18.17 |
| `{{RETURN_DEPOSIT}}` | Not a token. The return-shipping deposit equals the **forward-leg tariff** for the selected carrier and destination, quoted live from the same API call with origin and destination reversed. Never a percentage of the goods | RESOLVED, derived | §18.6, §18.8.5a |

**Resolved in round 2, used as values rather than placeholders.** `{{PSP}}` = **WayForPay**
(§E10). `{{PICKUP_ADDRESS}}` = вул. Петруші, с. Яворів, Косівський район, Івано-Франківська
область, 78644 (§E2). `{{LEGAL_ENTITY_NAME}}` = ФОП Гондурак Любов Юріївна (§E1). Phone numbers
= `+380679973450` (Іван), `+380679604769` (Любов) (§E3). Existing tokens referenced without
redefinition: `{{RETURN_DAYS}}` (14 days), `{{MADE_TO_ORDER_DAYS}}`, `{{VAT_STATUS}}`.

**Retired in round 2.** `{{PARTNER}}` — the partner cannot be named and the name is never
rendered on a cart line, an order item or a confirmation (§E7); `partnerRegion` is used where
known. `{{DYE_LOT_TRACKING}}` and every dye-lot field in the cart — lots are not tracked (§E8).

**Resolved in round 3** ([00-client-decisions-3.md](00-client-decisions-3.md)). `{{INTL_CARRIER}}`
is a model, not a name (F4). Shipping and all customs charges are the buyer's, every destination
(F4). Partner goods carry the Вівчарик brand (F3), so nothing in the cart or the confirmation
distinguishes them except the origin mark. `{{LEGAL_ID}}` exists and its blocking scope is
narrowed to three deliverables (F1). Яворів is a shop as well as a factory (F2), which is why
§18.5.4 is rewritten. The tagline stands as «в Карпатах» (F6) — no checkout surface uses a
Yavoriv-first headline, and §18.5.4 names the village as a destination rather than as a slogan.

**Resolved in rounds 4 and 5.** `{{MADE_TO_ORDER_DAYS}}` = **14 days of production before
dispatch**, with `OrderStatus.IN_PRODUCTION` added between `CONFIRMED` and `PACKING` and the
confirmation restating a **date** ([00-client-decisions-4.md](00-client-decisions-4.md) §G2).
`{{FLOOR_VISIT}}` = **yes, guided, with Іван, arranged by phone, no booking widget** (§G3), which
closes the F2 open item §18.5.4 carried. Phone priority is **Іван `+380679973450` primary, Любов
`+380679604769` fallback** (§G1) — the header carries one number, the summary and every email
carry both with the fallback framed as such, and the legal surfaces continue to name Любов as the
ФОП. A business card **already ships in every parcel** (§G4), which adds an unverified review
channel that reaches counter-sale customers (§18.17 E9). Made-to-order is **prepaid in full,
card only, derived server-side** (§H1.1). COD is **«наложений платіж з оглядом», Ukraine and
stocked items only** (§H1.2), carrying a **return-shipping deposit** that is Ukraine-only for EU
legal reasons (§H1.3). Quote defaults are **48 working hours / 72 hours / 36 hours** (§H2).
Custom sizing is **per-product**, priced at an owner-set rate per square metre computed by the
system and recomputed server-side at checkout (§H3b, §H3c). International quotes are owned by
**Любов** by default (§H3).

**Round 6** ([00-client-decisions-6.md](00-client-decisions-6.md)) settles the largest open item
this document carried. **§J1: a mixed cart is one order, one parcel, one delivery charge,
dispatched after 14 days** — «Надіслати разом.» The split is withdrawn, and §18.8.7 is rewritten
around a cart-level disclosure that fires when the custom item is added. **§J2 confirms the
return-shipping deposit** and puts its business reason on record: refused inspections currently
cost the business both legs of carriage. Nothing in §18.8.5a changes, and no surface in this
document describes the deposit as provisional; only its copy still awaits sign-off.

**Open after round 6**

| # | Question | Blocks |
|---|---|---|
| ~~§H5.3~~ | ~~Confirm the mixed-cart split into two orders~~ | **Closed by [00-client-decisions-6.md](00-client-decisions-6.md) §J1 — withdrawn.** One order, one parcel, one delivery charge. The split machinery is deleted from §18.8.7 rather than kept as an option |
| §J3.1 | **Confirm the return-deposit copy before it ships.** §J2 names it as the one rule on the site that can be misread as a hidden fee | §18.8.5a. **The mechanic is confirmed and is not provisional**; the three sentences are not settled, and they are what the buyer actually evaluates |
| ~~§J3.2~~ | **Resolved** by [00-client-decisions-8.md](00-client-decisions-8.md) §L7: kept for every order, with the shipping floor | — |
| ~~§18.9~~ | **Resolved** by [00-client-decisions-8.md](00-client-decisions-8.md) §L7 | — |
| ~~F2~~ | ~~Is the **production floor** visitable, or only the shop?~~ | **Closed by [00-client-decisions-4.md](00-client-decisions-4.md) §G3** — «Так, відвідувачі можуть оглянути цех з Власником.» §18.5.4 now says so, with the by-arrangement qualifier and no booking control |
| ~~F4~~ | ~~`{{QUOTE_SLA_HOURS}}` and `{{QUOTE_EXPIRY_HOURS}}`~~ | **Set by [00-client-decisions-5.md](00-client-decisions-5.md) §H2** — 48 working hours, 72 h validity, 36 h for one-of-one. They remain operational commitments and §H5.2 asks the client to confirm or replace them |
| F5 | `{{DOMAIN}}`, and therefore `{{TRANSACTIONAL_FROM}}` | Every email in §18.17, and the entire international payment path |

### Verification tasks this document depends on

| # | Task | What it blocks here |
|---|---|---|
| V2 | Nova Poshta key exposure | **Resolved** in §18.5.2 — server-side proxy, never client-side |
| **V6** | WayForPay integration mode: hosted redirect, embedded widget, or direct API | Which of §18.8.3 and §18.8.4 ships. Both are specified; the answer selects a configuration rather than triggering a redesign |
| **V7** | Signature algorithm and exact field order | The provider adapter. Nothing may be written from memory (§18.8.1) |
| **V8** | Webhook payload shape, acknowledgement format, retry behaviour | §18.15's handler contract |
| **V9** | Refund and partial-refund API support | §18.14's automatic refund on a lost one-of-one, and §18.13's `PARTIALLY_REFUNDED` state. If refunds are manual-only, both need a documented fallback |
| **V10** | Whether a ФОП on the simplified tax system can contract, and what onboarding requires | The merchant account, and therefore launch. Depends on `{{LEGAL_ID}}` |
| **V11** | Supported currencies and non-UAH settlement | Which §18.23.4 currency branch ships |

V3 and V5 from [00-assumptions.md](00-assumptions.md) are superseded by V9 and V6 respectively,
which state the same questions against a named provider.
