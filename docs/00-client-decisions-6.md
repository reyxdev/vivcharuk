# Client Decisions — Round 6

Received 2026-09-29. Superseded on the domain by [00-client-decisions-7.md](00-client-decisions-7.md).

```
00-client-decisions-6.md    ← this file
00-client-decisions-5.md
00-client-decisions-4.md
00-client-decisions-3.md
00-client-decisions-2.md
00-client-decisions.md
00-existing-site-audit.md   ← adjacent business, reference only
00-assumptions.md
everything else
```

---

## J1 — Mixed carts ship together. The split is removed.

> «Надіслати разом.»

A cart containing both a stocked item and a custom-size item produces **one order, one parcel,
one delivery charge**, dispatched after the 14-day production period.

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.1 recommended splitting such a cart into
two orders. **That recommendation is withdrawn.** The split's advantage was speed on the stocked
item; its cost was a second delivery charge, a second parcel to pack and a second waybill to
track. For a two-person business the operational simplicity is worth more than the few days
saved, and the customer was never going to enjoy paying twice for delivery on one purchase.

### Consequences

| Rule | Value |
|---|---|
| Order count | One |
| Delivery charges | One |
| Payment | **Full prepayment online.** The cart contains a custom item, so §H1.1 applies to the whole order |
| Cash on delivery | **Not offered.** Any custom item in the cart removes it server-side |
| Dispatch | After the custom item is finished — 14 days |
| Return-shipping deposit | Not applicable. The deposit belongs to COD orders (§J2), and this order is prepaid |

### What the customer must be told, and when

The consequence is counter-intuitive: adding a made-to-measure blanket to a cart changes the
terms of the item already in it. A stocked ліжник that was available on cash-on-delivery,
shipping tomorrow, becomes prepaid and ships in two weeks — because of a *different* line in the
same cart.

Discovering that at the payment step would feel like a bait-and-switch. It is disclosed **at the
moment the custom item is added to the cart**, not at checkout:

> «У кошику є виріб на індивідуальний розмір. Усе замовлення відправимо разом, коли він буде
> готовий — через 14 днів. Оплата — повна, наперед.»

With one obvious escape offered in the same place: order the custom item separately. Not a
system-generated split, just a plain suggestion that the customer can act on by emptying and
reordering. The site states the trade-off; the customer decides. That is the honest version of
the split, without the machinery.

### Documents affected

The split-order flow, its endpoints, its admin view and its wireframes are removed from
[05-user-flows.md](05-user-flows.md) §5.9.5,
[07-page-wireframes.md](07-page-wireframes.md) §7.6b,
[17-product-page-specification.md](17-product-page-specification.md),
[18-checkout-specification.md](18-checkout-specification.md) §18.8.7,
[23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.8.3c and
[26-api-architecture.md](26-api-architecture.md). The cart-level disclosure above replaces it.

---

## J2 — The return-shipping deposit, confirmed, with the business reason on record

> «Є дуже багато моментів, що людина замовляє товар на пошту, оглядає, і їй не подобається, а
> доводиться за посилку туди-назад платити фірмі. Нам таке не потрібно, тому хай посилку
> туди-назад одразу через сайт оплачує покупець.»

The mechanic in [00-client-decisions-5.md](00-client-decisions-5.md) §H1.3 is **confirmed**, and
the reason is now documented rather than inferred: refused inspections are a recurring, real
cost the business is currently absorbing on both legs.

That matters for how it is written. This is not a scheme to extract a fee — it is a business
correcting an asymmetry where the person who causes a cost does not bear it. Copy written from
that understanding reads differently from copy written to justify a charge.

### The proposed customer-facing copy — needs client approval before build

This is the single most misreadable rule on the site. The wording below is proposed for sign-off.

**At checkout, when cash on delivery with inspection is selected:**

> **Оплата доставки**
> Ви оплачуєте доставку в обидві сторони — **{{FORWARD}} ₴ + {{RETURN}} ₴**.
>
> **Якщо забираєте товар** — {{RETURN}} ₴ повертаються вам знижкою на сам товар.
> На пошті доплатите **{{PRICE − RETURN}} ₴** замість {{PRICE}} ₴.
>
> **Якщо не забираєте** — більше нічого не платите. Зворотна доставка вже оплачена.

**On the payment-method selector, one line:**

> «Наложений платіж з оглядом. Доставку в обидві сторони оплачуєте наперед — якщо забираєте
> товар, зворотна повертається знижкою.»

Three rules govern this copy and should not be relaxed:

1. **«Застава», never «комісія» or «збір».** The word decides how the rule is read before the
   numbers are.
2. **Three real numbers, always.** «{{PRICE − RETURN}} ₴ замість {{PRICE}} ₴» does the work that
   no amount of explanation can. Percentages and prose both fail here.
3. **Never in an accordion.** Expanded, above the pay button, at every breakpoint. Already a
   release-blocking condition in [33-responsive-strategy.md](33-responsive-strategy.md).

### The trade-off, stated honestly

This rule will cost some conversion. Paying for return shipping in advance is unusual in
Ukrainian e-commerce, and a share of buyers will abandon at that step rather than read the
explanation.

That is the correct trade to make anyway. The alternative is the status quo: the business pays
both legs every time someone opens a parcel and changes their mind, which is a tax on selling
to undecided buyers. And the honest buyer genuinely pays nothing — the deposit comes straight off
the price. The people it deters are disproportionately the ones who were going to refuse.

**Worth measuring** ([31-analytics-architecture.md](31-analytics-architecture.md)): abandonment
at the payment step for COD orders specifically, and the refusal rate before and after. If
refusals do not fall, the rule is costing conversion for nothing and should be revisited.

### Legal requirement — must not be skipped

Ukrainian consumer law permits the buyer to bear return shipping on a distance sale. **Collecting
it in advance is a contractual arrangement and must be written explicitly into the договір
оферти**, in plain terms: the amount, when it is credited, and what happens if the parcel is
refused.

Without that clause the deposit is an undisclosed condition, and a customer disputing it would
be on solid ground. This is a task for whoever drafts the offer contract, and it is gated on
`{{LEGAL_ID}}` along with the rest of the legal page set. Recorded in
[35-implementation-roadmap.md](35-implementation-roadmap.md).

### Scope, restated

Ukraine only. Forbidden on `en`, `pl` and `de` orders — under the EU Consumer Rights Directive a
trader may not hold a deposit against the exercise of the 14-day right of withdrawal. Enforced
at order creation, not in the UI
([26-api-architecture.md](26-api-architecture.md)).

---

## J3 — Open items

1. **Approve the deposit copy in §J2**, or amend it. It is the one piece of wording on the site
   that can be misread as a hidden charge.
2. **The 10% prepayment method has lost its purpose.** It existed for made-to-order work, which
   is now fully prepaid. Retire it, or name the case where it is still needed — a large wholesale
   order is the plausible one.
3. `{{LEGAL_ID}}` — ЄДРПОУ / РНОКПП. Now blocks four things: the WayForPay contract, the offer
   contract, the deposit clause within it, and the German Impressum.
4. ~~`{{DOMAIN}}` — urgent for email authentication~~ **Chosen: `vivcharyk.shop`** ([00-client-decisions-7.md](00-client-decisions-7.md) K1)
   ([00-client-decisions-3.md](00-client-decisions-3.md) §F5).
5. Heritage-register wording ([00-client-decisions-2.md](00-client-decisions-2.md) §E2).
6. WayForPay V6–V11 ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
7. The Яворів photography shoot — now also covering the shop interior, the workshop as a visitor
   sees it, and every production stage the site claims.
8. Instagram before launch — recommended, undecided.
