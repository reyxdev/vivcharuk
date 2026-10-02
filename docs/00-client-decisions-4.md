# Client Decisions — Round 4

Received 2026-09-28. **Highest-authority document in the blueprint.**

```
00-client-decisions-4.md    ← this file
00-client-decisions-3.md
00-client-decisions-2.md
00-client-decisions.md
00-existing-site-audit.md   ← adjacent business, reference only
00-assumptions.md
everything else
```

---

## G1 — Phone priority: Іван primary, Любов fallback

> «Основний телефон Іван +380679973450, а якщо недоступний перший, то ось другий, це вже
> Любові +380679604769.»

| Position | Number | Person |
|---|---|---|
| **Primary** | `+380679973450` | Гондурак Іван Федорович — owner of production |
| **Fallback** | `+380679604769` | Гондурак Любов Юріївна — deputy, ФОП seller of record |

This **reverses** the decision recorded in
[15-navbar-specification.md](15-navbar-specification.md), which rendered Любов's number in the
header on the reasoning that the seller of record should be the public voice. The client's
answer overrides it.

### Where each number appears

| Surface | Treatment |
|---|---|
| Header | Іван only. One number, no ambiguity at the moment of contact. |
| Footer NAP | Both, Іван first, labelled with names |
| Contact page | Both, Іван first, with the fallback framed as such: «Якщо не відповідає — телефонуйте Любові» |
| Mobile menu | Both |
| `LocalBusiness` → `telephone` | **Іван only.** The property is singular in practice; a second number belongs in `contactPoint`, not in `telephone`. |
| Google Business Profile | Іван as primary, Любов as an additional number |
| Order confirmation email | Both — a customer with a problem should not have to guess |
| Legal pages, Impressum, offer contract | **Любов**, because those name the ФОП, not the person who answers the phone |

The split between "who trades" and "who answers" is deliberate and must not be flattened. A
legal page naming the wrong person is a defect; a header naming the person who actually picks up
is correct.

---

## G2 — Made-to-order lead time: 14 days

> «Протягом 14 днів, залежить від замовлення, бо якщо замовлення індивідуальних розмірів
> (нестандартних), то виріб буде виготовлятись протягом 14 днів та відправлятись.»

`{{MADE_TO_ORDER_DAYS}}` → **14**.

Resolves [00-assumptions.md](00-assumptions.md) B7. `Product.madeToOrderDays` in
[25-database-schema.md](25-database-schema.md) §25.3 is populated with `14` for non-standard
sizes; stocked standard sizes leave it `null`.

### The distinction that must reach the customer

Two fundamentally different purchases now share one catalogue:

| | Standard size | Non-standard size |
|---|---|---|
| Stock | On the shelf | Does not exist yet |
| Dispatch | Next working day | After 14 days of production |
| What the customer is buying | An object | A commitment |

**Binding rules:**

1. The 14 days is **production time before dispatch**, not total delivery time. Carrier transit
   is added on top. Any copy that implies "14 days to your door" is wrong and will generate
   complaints on day 15.
   Correct construction: «Виготовлення — 14 днів. Далі — доставка перевізником.»
2. The lead time appears in the **buy box**, not in a tab. A customer must not discover it at
   checkout, and must never discover it after paying.
3. The PDP availability state changes when a non-standard size is selected. This is the
   `madeToOrderDays` branch already specified in
   [17-product-page-specification.md](17-product-page-specification.md) — it is now populated
   with a real number rather than a token.
4. The order confirmation email **restates the date**, not the duration. «Очікувана відправка:
   12 жовтня» is checkable; «протягом 14 днів» is a memory test the customer will fail.
5. Order status must distinguish *in production* from *not yet packed*. `PACKING` in
   [25-database-schema.md](25-database-schema.md) does not cover a fortnight of weaving — see
   the schema addendum below.

### Schema addendum

`OrderStatus` gains `IN_PRODUCTION`, positioned between `CONFIRMED` and `PACKING`. Justification:
a customer who paid for a custom lizhnyk and sees `CONFIRMED` for twelve days assumes the order
is stuck. A status that names what is actually happening removes a support contact and replaces
anxiety with anticipation, which is the emotionally correct state for a handmade purchase.

Open: does a made-to-order item require prepayment? The adjacent business required it, but that
is **not** inheritable ([00-client-decisions.md](00-client-decisions.md) D2). It is a reasonable
policy — the factory is committing two weeks of labour to a size nobody else will buy — but it
must be the client's decision, not an assumption. Recorded in §G5.

---

## G3 — Workshop tours, accompanied by the owner

> «Так, відвідувачі можуть оглянути цех з Власником.»

`{{FLOOR_VISIT}}` → **yes, guided, with Іван.**

This is the strongest single trust asset the project has, and it outranks every element in the
evidence hierarchy in [01-brand-strategy.md](01-brand-strategy.md) §1.8. That table ranks video
of the factory at position 1. A visitor can stand in the factory. There is no stronger proof
that a manufacturer is real than the manufacturer walking you through it.

### What makes it different from a generic "visit us"

It is **accompanied by the owner**, not self-guided. That single fact changes how it must be
presented:

| Consequence | Requirement |
|---|---|
| It depends on Іван being present | It must be **arranged in advance by phone**, never presented as drop-in. Pair it with the variable-hours rule in [00-client-decisions-2.md](00-client-decisions-2.md) §E3 — both facts say the same thing: call first. |
| It is a personal commitment of his time | Do not build a booking system. A phone number and «Зателефонуйте, щоб домовитися» is correct at this scale; a calendar widget implies capacity that does not exist and creates no-shows nobody chases. |
| It is a conversation, not a tour route | Copy should say what a visitor will *see and be told*, not promise a scripted experience |
| It cannot scale | Never advertise it in a way that implies unlimited availability. It is an invitation, not a product. |

### Where it goes

1. **Production page** — the page's closing argument. Everything above it is photographs of the
   process; this offers to show it in person.
2. **Contact page** — already promoted to a destination page in
   [00-client-decisions-3.md](00-client-decisions-3.md) §F2. The tour is what makes it a
   destination.
3. **Wholesale page** — materially stronger for B2B than for consumers. A buyer placing a
   five-figure order can verify the supplier personally before committing. Very few Ukrainian
   suppliers in this category can offer that, and none of the marketplace resellers can.
4. **About page** — as part of the people section, since the tour is *with* a named person.
5. **Google Business Profile** — retail plus a visitable production floor supports attributes a
   pure e-commerce listing cannot claim.

Suggested copy, to be client-approved:

> «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.»

### What must not be claimed

No fixed tour times. No "open to the public". No implication that a visitor may arrive
unannounced. Over-promising access and then being unavailable converts the project's strongest
asset into a one-star review, and the downside is larger than the upside here.

---

## G4 — A business card already ships with every parcel

> «Так, відправляється візитка разом з посилкою.»

This closes the post-purchase gap identified in
[02-ux-research.md](02-ux-research.md) — the problem that a shop customer, and in fact any
customer, has no prompted route back to the site.

**The infrastructure already exists.** Nothing needs to be invented, printed from scratch, or
added to the packing workflow. The card is already in the box and already in the hand of
someone who just bought something.

### Recommendation: put three things on it

| Element | Why |
|---|---|
| A short URL to a review page | A satisfied customer holding the product is the highest-conversion moment for a review request, and it works for **counter sales too** — the buyer who has no order number and is otherwise unreachable |
| A QR code to the same URL | The 25–75 audience splits here: younger buyers scan, older buyers type. Print both. |
| The primary phone (Іван) and the site address | The card is also the fallback when someone loses the confirmation email |

A single short link is enough — `{{DOMAIN}}/v` or similar, resolving to a review-and-reorder
landing page. No per-order codes, no personalisation, no variable printing. Per-order codes
would produce better attribution and would require a print workflow this team should not be
asked to run.

**Reviews are the single scarcest asset at launch.** The site starts with zero
([00-client-decisions.md](00-client-decisions.md) D2 cold start), `AggregateRating` is
suppressed until three verified reviews exist
([29-seo-architecture.md](29-seo-architecture.md)), and no social proof exists anywhere because
there is no social media. A card already in every parcel is the cheapest available fix, and it
is already being paid for.

Caveat to honour: reviews arriving through this route have no order linkage, so
`isVerifiedPurchase` stays `false` and they are excluded from the aggregate rating. That is
correct and must not be worked around — see [25-database-schema.md](25-database-schema.md)
§25.6.

---

## G5 — Still open

1. **International shipping model** — enquiry-then-invoice (recommended) or flat-rate zones?
   ([00-client-decisions-3.md](00-client-decisions-3.md) §F4)
2. **Quote turnaround time and validity period** — an operational commitment, not a setting.
   `{{QUOTE_SLA_HOURS}}`, `{{QUOTE_EXPIRY_HOURS}}`.
3. **Who owns international quotes** — a named person must run the workflow
   ([35-implementation-roadmap.md](35-implementation-roadmap.md) B16).
4. **Prepayment for made-to-order items** — required or not? (§G2)
5. `{{LEGAL_ID}}` — ЄДРПОУ / РНОКПП, supplied on request.
6. `{{DOMAIN}}` — now urgent for email authentication reasons, not naming reasons
   ([00-client-decisions-3.md](00-client-decisions-3.md) §F5).
7. Heritage-register wording confirmation
   ([00-client-decisions-2.md](00-client-decisions-2.md) §E2).
8. WayForPay V6–V11 ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
9. The Яворів photography shoot, now also covering the shop interior and the workshop as a
   visitor sees it.
10. Instagram account before launch — recommended, undecided.
