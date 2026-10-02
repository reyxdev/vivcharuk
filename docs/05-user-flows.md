# 05 — User Flows

Authority: [00-client-decisions-6.md](00-client-decisions-6.md) first, then
[00-client-decisions-5.md](00-client-decisions-5.md), then
[00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md), then
[25-database-schema.md](25-database-schema.md) for state, then
[03-information-architecture.md](03-information-architecture.md) for structure.

**Round-2 rulings that change this document:** guest checkout is permanent, so the registration and
login flows are **deleted outright** rather than deferred (§E12); `{{PSP}}` resolves to
**WayForPay**, but its integration mode is unverified and §5.9.2 now specifies both branches (§E10);
international orders are accepted, adding §5.9.3 (§E11); dye lots are not tracked, so §5.7 carries
advice instead of a disclosure (§E8); and Instagram does not exist, which thins the entry-point sets
below (§E3).

**Round-3 rulings that change this document**
([00-client-decisions-3.md](00-client-decisions-3.md)):

| Ruling | Effect on the flows |
|---|---|
| International shipping is **quoted per order**, not calculated (§F4) | §5.9.3 is restructured and **§5.9.4 is new**: the enquiry-then-invoice flow, its order state, its interaction with the `OrderStatus` machine, and the rules that stop the customer feeling abandoned between submission and quote |
| The buyer pays shipping **and all customs duties and import taxes**, all destinations (§F4) | The customs disclosure in §5.9.3 becomes a **blocking element before payment**, not a collapsed accordion. Free shipping never applies internationally, at any order value |
| The Яворів address is a **shop as well as a factory** (§F2) | «Забрати в Яворові» is rewritten across §5.2, §5.4 and §5.8 as an **invitation**, not a cost-saving fallback. The offline-to-online path in §5.2 is now real rather than hypothetical |
| Transactional mail cannot send from `@gmail.com` (§F5) | §5.1 gains a sending-address rule that governs every emailing flow in this document |
| Partner goods are sold **under the Вівчарик brand** (§F3) | Closes open question 7 in §5.17. No flow changes — the disclosure points in §5.10 and §5.16.2 were already correct and are now load-bearing |
| `{{LEGAL_ID}}` exists, pending delivery (§F1) | Blocks nothing here |

**Round-4 and Round-5 rulings that change this document**
([00-client-decisions-4.md](00-client-decisions-4.md),
[00-client-decisions-5.md](00-client-decisions-5.md)):

| Ruling | Effect on the flows |
|---|---|
| **H3b + H3c — custom sizing is per product, priced live by area** | **§5.7b is new**: the custom-size purchase. It is a *deterministic* flow, and the document now has two flows that look alike and behave oppositely — §5.7b never waits for a human, §5.9.4 always does |
| **H1.1 — made-to-order is prepaid in full; COD removed server-side** | §5.9.1 gains an eligibility rule that is enforced in the response, not in the UI. §5.9.5 is the mixed cart |
| **H1.2 — «наложений платіж з оглядом», Ukraine only, stocked items only** | §5.9.1 is renamed and rewritten. The inspection right stops being an implementation detail and becomes the flow's selling point |
| **H1.3 — the return-shipping deposit** | §5.9.1 gains the deposit mechanic, its worked example, and the single-credit invariant that the order state machine must hold. §5.16.1 gains the credit step |
| **H2 — 48-hour quote SLA, 72-hour validity, 36 for one-of-one** | §5.9.4's two tokens resolve. The customer copy under-promises: «протягом 2 робочих днів» |
| **G2 — 14 days is production before dispatch**; `OrderStatus.IN_PRODUCTION` | §5.2 step 7, §5.7b, §5.12 and §5.16.1. Every place the number appears, it is followed by the sentence that says transit is separate |
| **G4 — a business card already ships in every parcel** | **§5.14b is new**: the card-driven review flow, which is the only flow in this document whose entry point is not a URL anyone navigated to |
| **G1 — Іван primary, Любов fallback** | §5.1 — every transactional email carries both numbers, Іван first |
| **G3 — workshop tours, by phone, with Іван** | §5.2 — the offline path gains a second direction: a visitor who came to look can be shown the factory |

**Round-6 rulings that change this document**
([00-client-decisions-6.md](00-client-decisions-6.md)):

| Ruling | Effect on the flows |
|---|---|
| **J1 — a mixed cart ships as one order. The split is withdrawn** | §5.9.5 is **rewritten**. The split flow, its payment step, its two order numbers and its second delivery fee are removed from this document. What remains is a cart-level disclosure that fires when the custom item is added — §5.7b step 6 — and a mixed cart that behaves as one prepaid order throughout §5.8, §5.9.1 and §5.12 |
| **J2 — the return-shipping deposit is confirmed, with the business reason on record** | No mechanic in §5.9.1 or §5.16.1 changes. The deposit is no longer written as provisional anywhere in this document. The **copy** is still awaiting client approval and stays marked as such in §5.17 |

## 5.1 Conventions

- `◆` decision point · `✕` failure branch · `→` continue · `⟲` recoverable loop
- **Drop-off risk** and **Mitigation** are stated per flow. A risk with no mitigation is a known
  defect, recorded as such rather than omitted.
- Every flow assumes the cold-start entry reality
  ([00-client-decisions.md](00-client-decisions.md) D2): a large share of first arrivals come from
  Google Business Profile, word of mouth, or an informational article — **not** from a commercial
  search query. Flows that assume search intent would be wrong for the first two quarters. There is
  **no Instagram** ([00-client-decisions-2.md](00-client-decisions-2.md) §E3), so that entry point
  is removed from every flow below; the remaining set is thinner and each surviving entry point
  therefore carries more weight.
- **Guest is the only identity. There are no customer accounts, ever**
  ([00-client-decisions-2.md](00-client-decisions-2.md) §E12). This document contains **no
  registration flow, no login flow, no password-reset flow, no email-verification flow and no
  wishlist merge-on-login flow**, because none of those states can exist. That is not an omission
  and it is not a deferral — it is the design. Staff authentication is a separate system and keeps
  its invite and lifecycle flow at §5.16.3.
- The identity-shaped needs that remain are served without an account: order retrieval by
  `guestToken` or by the lookup form (§5.12), reorder from that same page (§5.3), address prefill
  from a first-party cookie on the same device, a `localStorage` wishlist that states «Збережено на
  цьому пристрої», and a marketing checkbox at checkout writing to `NewsletterSubscriber` (§5.15).
- **Every transactional email in this document sends from `{{TRANSACTIONAL_FROM}}` on
  `{{DOMAIN}}`, never from `gif19601@gmail.com`.** This is a technical constraint, not a branding
  preference ([00-client-decisions-3.md](00-client-decisions-3.md) §F5): Google does not permit a
  third-party system to publish SPF or DKIM records for `gmail.com`, and Gmail's consumer DMARC
  policy rejects mail that claims a `@gmail.com` sender and fails those checks. Order
  confirmations sent that way land in spam or are refused outright — and a buyer who paid and
  received no confirmation contacts support or disputes the charge, which converts a completed sale
  into a chargeback. The affected flows are §5.9.1 step 6, §5.9.2, §5.9.4, §5.11, §5.12, §5.13,
  §5.14 and §5.15. `gif19601@gmail.com` remains usable as the **public contact address** in the
  meantime; the two roles are separate and must not be conflated. Reply-to routes to a monitored
  inbox, which may be the Gmail one.
- **Every transactional email carries both phone numbers, Іван first.**
  [00-client-decisions-4.md](00-client-decisions-4.md) §G1 names the order confirmation explicitly:
  «a customer with a problem should not have to guess». The header carries one number because
  chrome must not present a choice; an email is read by someone who already has a problem, and for
  them a second number is the difference between a resolved issue and an abandoned one. Order:
  `+380679973450` (Іван), then `+380679604769` (Любов). Where the email names the seller — the
  invoice block, the offer-contract reference, the withdrawal notice — it names **ФОП Гондурак
  Любов Юріївна**, and that divergence is deliberate (§G1). The two strings come from different
  settings and must not be reconciled.
- **Any time the fourteen-day lead time appears in a flow, the next sentence says transit is
  separate.** [00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 1: the fortnight is
  production *before dispatch*. «Виготовлення — 14 днів. Далі — доставка перевізником.» Copy that
  implies "14 days to your door" is wrong and generates a complaint on day fifteen. Emails restate
  the **date**, not the duration (§G2 rule 4) — «Очікувана відправка: 12 жовтня» is checkable;
  «протягом 14 днів» is a memory test the customer will fail.
- **The payment-method list is produced by the server from the cart, never filtered in the
  browser.** [00-client-decisions-5.md](00-client-decisions-5.md) §H1.1: if any line carries
  `madeToOrderDays`, the COD option is **absent from the response**. Locale does the same for COD
  generally, which is Ukraine-only (§H1.2). Consequence for every flow below: there is no
  "unavailable method" state to design, because an unavailable method never reaches the client.
- **Pickup at Яворів is an invitation, not a fallback.**
  [00-client-decisions-3.md](00-client-decisions-3.md) §F2 establishes that the address is a shop
  as well as a production floor. Wherever «Забрати в Яворові» appears — the PDP delivery block, the
  checkout delivery step, the confirmation email — it is presented as a visit with directions
  behind it, not as the option chosen to avoid a carrier fee. The copy names the place and what is
  there; it does not lead with «безкоштовно».

---

## 5.2 First-time visitor to purchase

**Entry points:** Google Business Profile / Maps · an informational article from the journal ·
word of mouth (direct/branded) · a shared PDP link · tourist footfall in Яворів.

```
1  Land (home | article | PDP | /kontakty)
2  ◆ Does this look like a real manufacturer?
   ├─ no  → ✕ bounce
   └─ yes → 3
3  Enter the wool world or a family (nav, article embed, or homepage row)
4  Scan the grid — origin badge and price visible on every card
5  Open a PDP
6  Read, in this order: gallery → price → «Власне виробництво» → spec table
   → delivery estimate → returns
7  ◆ Variant available in the wanted size/colour?
   ├─ no, and allowsCustomSize → ⟲ «Свій розмір» — the size they want
   │                              can be made. §5.7b
   ├─ no, and not customisable → ⟲ notify-me capture. Never a bare
   │                              disabled button
   └─ yes → 8
8  Add to cart → cart drawer, no page change
9  ◆ Buy now or keep looking?
   ├─ keep looking → ⟲ back to 4 (cart persists {{CART_TTL_DAYS}})
   └─ buy → checkout spine §5.8
```

| Step | Drop-off risk | Mitigation |
|---|---|---|
| 1 | Visitor arriving from Maps lands on a page that does not prove the place exists | `/kontakty` is a primary landing page, SSG, with the real Яворів address, both phone numbers, and photographs of the building ([04-sitemap.md](04-sitemap.md) §4.2). It states «Графік гнучкий — телефонуйте перед візитом» rather than publishing hours, because variable hours published as fixed produce "closed when it said open" reports that damage the profile ([00-client-decisions-2.md](00-client-decisions-2.md) §E3) |
| 1 | The visitor wants to know whether they can come and buy one, and the page only offers a form | The address is a **shop as well as a factory** ([00-client-decisions-3.md](00-client-decisions-3.md) §F2), so `/kontakty` answers the retail question directly: what is on display, whether the production floor can be seen, how to get there from Косів, where to park. A visitable address is the strongest available answer to «is this a real factory or a reseller», which is the primary purchase anxiety in [02-ux-research.md](02-ux-research.md). Wireframe at [07-page-wireframes.md](07-page-wireframes.md) §7.15 |
| 2 | — | A shop attached to the production floor is evidence the site does not have to argue for. Naming it early, on the homepage footer band and in the hero-adjacent trust row, converts the 30-year claim from an assertion into something the reader can go and check |
| 2 | Three seconds to establish a real factory on a domain with no reputation | Evidence over badges ([01-brand-strategy.md](01-brand-strategy.md) §1.8): factory video, named people, «Понад 30 років виробляємо…» in prose. No certification marks — none exist |
| 4 | Origin discovered after the price | Origin badge renders on the **card**, not only the PDP ([03-information-architecture.md](03-information-architecture.md) §3.3.4) |
| 6 | Composition and returns buried in a tab | First three spec rows unwrapped at every breakpoint; delivery and returns in the purchase panel, not a tab ([02-ux-research.md](02-ux-research.md) §2.4) |
| 7 | "Out of stock" as a dead end | Two escapes, in order of value. Where `Product.allowsCustomSize` is set, the size they wanted **can be made** — §5.7b, with a price shown immediately. Otherwise a back-in-stock capture. Never a bare disabled button ([08-design-system.md](08-design-system.md) §8.5) |
| 9 | At a four-to-five-figure price point almost nobody buys on visit one | The cart is the memory device: `{{CART_TTL_DAYS}}` = 30, recovery in §5.11 |

**The offline-to-online path is now a real flow, not a hypothesis.** Because the Яворів address is
a shop, a visitor can see the goods in person and buy later online
([00-client-decisions-3.md](00-client-decisions-3.md) §F2) — the reverse of every other entry point
in this document, and the only one that does not depend on search. It is worth building for and
worth measuring:

```
VISIT THE SHOP  →  sees the product, takes no decision
        │
        ├─ carries a card with the URL, or scans a QR at the counter
        │        └─ lands on the PDP of the thing they held ──► §5.2 step 6
        │
        └─ searches the brand name later from home
                 └─ branded search is the easiest query a cold-start
                    domain can rank for, because nobody competes for it
```

Two cheap mechanisms make it measurable rather than anecdotal: a distinct `utm_source=shop` on the
counter QR, and the branded-search line in Search Console, which on a new domain is close to a
clean signal of offline exposure. Both belong in
[31-analytics-architecture.md](31-analytics-architecture.md) rather than here; what belongs here is
the requirement that the QR resolves to a **product or family page**, never to the homepage. A
visitor who held a specific ліжник and lands on a generic homepage has to find it again, and
frequently does not.

**Round 4 adds a third offline branch, and it is the strongest one.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G3: «Так, відвідувачі можуть оглянути цех з
Власником.» A visitor who came to look can be **shown the workshop by Іван**, arranged in advance
by phone. That is not a variation on the shop visit — a shop proves retail exists; a production
floor with the owner in it proves the manufacturing claim the entire brand rests on, and it
outranks every element in the evidence hierarchy in
[01-brand-strategy.md](01-brand-strategy.md) §1.8.

```
INTENDS TO VISIT  →  calls Іван, +380679973450, to arrange a time
        │                (the phone is the whole booking mechanism)
        └─ tours the workshop with the owner
                 └─ has now seen the process the site photographs
                    ──► any later purchase skips step 2 entirely
```

**There is no booking flow, and there will not be one.** §G3 rules it out directly: a calendar
implies capacity that does not exist and creates no-shows nobody chases. The flow is a phone call,
which is why the contact page's phone CTA is the first interactive element on it
([33-responsive-strategy.md](33-responsive-strategy.md) §33.4). Two constraints follow and both are
about not over-promising: it is **never** presented as drop-in, and it is never advertised in a way
that implies unlimited availability. It is an invitation, not a product — and inviting someone to
drive into the mountains and then being unavailable converts the project's strongest asset into a
one-star review.

---

## 5.3 Returning visitor, repeat purchase

**Entry points:** branded search · direct · a recovery email · an order-status page.

```
1  Return → cart badge already shows prior contents
2  ◆ Prior cart still valid?
   ├─ items now out of stock → cart shows the line struck through, names the
   │                            problem, offers the nearest variant. Never silently drops a line.
   └─ valid → 3
3  ◆ Reorder or browse?
   ├─ reorder → §5.12 order lookup → "Повторити замовлення" → cart prefilled
   └─ browse  → §5.2 step 4
4  Checkout §5.8 — contact fields prefilled from the cart cookie where consent allows
```

| Drop-off risk | Mitigation |
|---|---|
| Silent cart expiry destroys a considered decision | 30-day TTL, and expiry shows a recoverable "ваш кошик оновлено" state listing what changed |
| A guest has no order history to reorder from | Reorder is available from the **order-lookup page** (§5.12). There is no account alternative and there never will be ([00-client-decisions-2.md](00-client-decisions-2.md) §E12), so this page is not a fallback — it is *the* repeat-purchase surface, and it must be built to that standard |
| Re-typing an address on every order | Address prefill from a **first-party cookie on the same device**, with an explicit opt-in checkbox at first checkout and a visible way to clear it. It is device-local by design: there is no server-side customer profile to sync it to |
| Prefill silently fails on a new device or after a cookie clear, and the buyer thinks the site lost their data | The prefill state is labelled, not silent. When it is absent the fields are simply empty with no error — the site never implies data existed and vanished |
| The wishlist disappears when the buyer switches from phone to desktop | The wishlist is `localStorage`, device-local, with **no server record and no `WishlistItem` table** ([25-database-schema.md](25-database-schema.md) §25.8b). The UI states «Збережено на цьому пристрої» at the point of saving, not in a footnote. A saved list that silently vanishes on another device is worse than no saved list at all |

---

## 5.4 Gift buyer (tourist)

**Entry points:** Maps/GBP while in the region · the «Яворів — столиця ліжникарства» article ·
«що таке ліжник» · a visit to the Музей ліжникарства in the same village · **a visit to the shop
itself**, which is in that same village and open to walk-ins
([00-client-decisions-3.md](00-client-decisions-3.md) §F2).

```
1  Land, often on mobile data in a valley
2  ◆ Does the page load and is the hero usable without video?
   ├─ no → ✕ bounce
   └─ yes → 3
3  Gift hub or a wool family
4  Filter by price band (gift budget is a hard ceiling, not a preference)
5  PDP → origin block → «Власне виробництво» → Kosiv-district provenance
6  ◆ Will it arrive before the occasion?
   ├─ unclear → ✕ abandon
   └─ delivery estimate shown on the PDP → 7
7  Add to cart → checkout §5.8
8  At step 1: gift options — gift note, recipient address differs from payer
9  Place order → confirmation email doubles as the "what to say about it" story
```

| Drop-off risk | Mitigation |
|---|---|
| Hero video fails on degraded mobile data | Poster frame is the LCP element, never animated on entrance; ambient systems disable on `saveData` ([13-motion-system.md](13-motion-system.md) §13.7–13.8) |
| Delivery date is the whole decision and is usually absent in this category | Estimate rendered on the PDP **before** the cart, derived from carrier + `madeToOrderDays` |
| Gift recipient address collected too late | Gift options at checkout step 1, not step 3, so shipping cost and estimate compute against the right address |
| The story is lost once the object is wrapped | Confirmation email and a printed insert carry the provenance paragraph. The gift's value is the story it can be given with (J1/J6, [02-ux-research.md](02-ux-research.md) §2.2) |
| A tourist already in the region is sent to a carrier for something they could collect by hand | «Забрати в Яворові» is offered **first** in the delivery list when the shipping address is in Івано-Франківська or a neighbouring oblast, and it is written as an invitation — «Магазин і виробництво в одному місці, с. Яворів. Зателефонуйте перед візитом» — not as a zero-price shipping row ([00-client-decisions-3.md](00-client-decisions-3.md) §F2). A gift bought in person and collected the same week arrives with a story the buyer witnessed, which is exactly what this persona is paying for |

---

## 5.5 Search to purchase

**Entry points:** header search · `/poshuk` · empty-state search on 404.

```
1  Open search (click or `/`)
2  Type ≥2 chars → suggestions: products, families, articles — grouped and labelled
3  ◆ Results?
   ├─ zero → ✕ zero-result state: logs to SearchQueryLog, offers the three
   │          disambiguation articles, the nearest family, and a contact link
   └─ yes  → 4
4  Results page: origin badge, price, availability on every card
5  ◆ Refine?
   ├─ yes → facets (§5.6)
   └─ no  → PDP → §5.2 step 6
```

| Drop-off risk | Mitigation |
|---|---|
| Ukrainian morphology: «ліжника» must match «ліжник» | `unaccent` + a simple FTS configuration with a hand-maintained synonym/stem override list ([25-database-schema.md](25-database-schema.md) §25.10). Verify at `{{SKU_COUNT}}` before assuming Postgres suffices |
| A searcher who types «пряжа» and means «ровниця» | Zero- and low-result states surface the disambiguation article ([03-information-architecture.md](03-information-architecture.md) §3.7.2) |
| Zero-result queries lost | Every query writes `SearchQueryLog`; the admin dashboard surfaces zero-result terms as a merchandising input, not as analytics decoration |
| Suggestions in `en`/`pl`/`de` fail on untranslated products | Fallback rows are searchable and flagged; the admin translation-completeness widget makes the gap visible |

---

## 5.6 Filter to purchase

```
1  Family page, «В наявності» already on
2  Apply facet
3  ◆ URL form
   ├─ single allowlisted dimension, single value → path URL, indexable
   └─ anything else → query string, noindex, canonical to the clean family URL
4  Results update; active facets render as removable chips above the grid
5  ◆ Zero results?
   ├─ yes → ✕ named-cause empty state: "0 товарів для: Розмір 200×220 + Колір сірий",
   │         with each facet individually removable
   └─ no  → PDP
```

| Drop-off risk | Mitigation |
|---|---|
| Filter state lost on back-navigation or on a shared link | Facet state lives in the URL, never in memory. A comparison tab left open for three days still works ([02-ux-research.md](02-ux-research.md) §2.7) |
| Dead-end zero results | The empty state names the filters causing it and removes them one at a time ([08-design-system.md](08-design-system.md) §8.8) |
| Price slider unusable with reduced motor precision | Numeric inputs beside the slider ([03-information-architecture.md](03-information-architecture.md) §3.6.1) |
| Mobile filter panel hides the result count | Sticky "Показати N товарів" button; the count updates live before the panel closes |

---

## 5.7 Needleworker: buying by weight

Applies to **вовняна пряжа**, **ровниця**, **вовна для рукоділля** — all sold by weight, not by unit
([00-client-decisions.md](00-client-decisions.md) D4).

```
1  Enter via family, the «Для рукоділля» collection, or the disambiguation article
2  ◆ Right material?
   ├─ unsure → ⟲ the three families cross-link from the buy box; one explainer article
   └─ yes → 3
3  PDP opens with a one-line "what this is and what it is for"
4  Select колір → товщина → метраж
5  Weight/quantity input (not a unit stepper):
   ┌───────────────────────────────────────────────┐
   │ Кількість:  [ 800 ] г    ▾ або [ 8 ] мотків   │
   │ 1 200 ₴/кг  ·  разом 960 ₴                    │
   │ ⓘ Відтінок може незначно відрізнятися між      │
   │   партіями. Для великого проєкту радимо        │
   │   замовити всю кількість одразу.               │
   └───────────────────────────────────────────────┘
6  ◆ Enough for the project?
   ├─ unsure → "скільки потрібно" helper linking the project-estimate article
   └─ yes → add to cart (line maths = price × weight)
7  Checkout §5.8 — shipping weight derives from the purchased weight directly
```

| Drop-off risk | Mitigation |
|---|---|
| **Shade variation between orders** — the objection that generates returns | The buy-box line at step 5, plus the "buy the whole project at once" prompt it leads into. Dye lots are **not tracked** ([00-client-decisions-2.md](00-client-decisions-2.md) §E8), so there is no lot number to show, no lot facet and no lot selector anywhere in this flow |
| Unit confusion — grams vs skeins | Both shown simultaneously and interconverted live; `inputmode="numeric"`, `tabular-nums` ([10-typography.md](10-typography.md) §10.6) |
| Buying пряжа when ровниця was meant | The disambiguation triangle: three families cross-link from the buy box and share one explainer |
| Running short mid-project | Quantity helper before the add-to-cart; back-in-stock notification. There is no lot value to reference on a reorder, which is precisely why the advice at step 5 is placed **before** the quantity is chosen rather than after |

**Why the shade line is advice and not a disclaimer, and why the distinction is operational.** The
business does not record dye lots, so the honest options were: invent a tracking field the workshop
cannot populate, say nothing, or say the true thing usefully. The first ships a guarantee that will
be broken. The second lets a needleworker discover the variation halfway through a blanket, which
produces a return and a bad review. The third — «Відтінок може незначно відрізнятися між партіями.
Для великого проєкту радимо замовити всю кількість одразу.» — costs nothing, prevents the return,
and reads as a maker who knows how wool behaves rather than a seller hedging. Placement matters as
much as wording: it sits **above the quantity input**, where it changes the quantity decision, not
below the add-to-cart where it would read as fine print. Tone rule: no "we are not responsible
for", no asterisk, no smaller type than the surrounding copy.

---

## 5.7b Custom size — buying a size that does not exist yet

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b establishes that made-to-order is a
property of **the size the customer picks**, not of the product. §H3c then removes the last reason
this would have had to be a conversation: the owner sets a rate per square metre in the admin, and
the system computes the price.

**This flow is deterministic. Nobody waits for a human at any point in it.** That is worth stating
first, because the next section of this document contains a flow that looks almost identical and
is not — see the contrast table below, which exists because confusing the two is the most likely
way this gets built wrong.

```
1  PDP, product where allowsCustomSize = true
   Size selector: [150×200] [170×210] [200×220] ──── [Свій розмір]
   │
2  ◆ Choose «Свій розмір»
   └─ The buy box SWAPS MODE. It does not open a form, a modal or a
      request-a-quote panel:
         · two dimension inputs appear, each stating its permitted
           range BEFORE anything is typed — «від 100 до 200 см»
         · lead time appears:  «Виготовлення — 14 днів.
                                Далі — доставка перевізником.»
         · payment notice appears: «Оплата — повна, наперед.
                                    Виріб шиється за вашими розмірами.»
         · cash on delivery DISAPPEARS from the stated methods
   │
3  Type width and length
   └─ price recomputes live, on every keystroke:
         area = (w × l) / 10 000
         price = max(area × customSizeRatePerSqmMinor,
                     customSizeMinPriceMinor)
      The computed area is shown beside the price, so the arithmetic
      is checkable rather than asserted
   │
4  ◆ Dimensions within the loom bounds?
   ├─ yes → 5
   └─ out of range → the inputs clamp on blur and restate the range.
      This branch should be UNREACHABLE — see the failure branches below
   │
5  Add to cart
   └─ line carries OrderItem.customSpec = { widthCm, lengthCm }
      and the server-computed price, NOT the browser's
   │
6  ◆ Cart contents AFTER the add?
   ├─ custom item only  → checkout spine §5.8, card only
   └─ mixed with stock  → ⚠ THE DISCLOSURE FIRES HERE, AT THE ADD,
        NOT AT CHECKOUT. Adding this line has just changed the terms
        of the stocked line already in the cart. §5.9.5
   │
7  Pay in full, online, by card (§5.9.2)
   │
8  Order → CONFIRMED → IN_PRODUCTION (14 days) → PACKING → SHIPPED
   The confirmation email states the expected DISPATCH DATE, not the
   duration (§G2 rule 4)
```

### The contrast that must not be blurred: §5.7b versus §5.9.4

Both flows begin with a customer who cannot be given a price from a stock table. They end
differently, and a visitor who has done one will expect the other to behave the same way.

| | **§5.7b — custom size** | **§5.9.4 — international shipping** |
|---|---|---|
| Why no catalogue price exists | The *size* is not in the catalogue | The *carrier* is not chosen until someone packs it (§H4) |
| Who produces the number | **The system**, from a rate the owner set in advance | **A person**, choosing a carrier per parcel |
| When the customer sees it | **Immediately**, as they type | After up to 48 working hours |
| `OrderStatus` on submission | `PENDING` — an ordinary order | `AWAITING_QUOTE` — a state the customer cannot act in |
| What the customer does next | Pays | Waits, then pays from an emailed link |
| Emails involved before payment | None | Acknowledgement, then quote |
| What can go wrong | The server computes a different price than the browser | Staff forget; the quote email is spam-foldered |

**The reason the difference exists is worth stating, because it justifies why we did not make them
consistent.** A custom size is priced by a rule the business can write down — wool consumed and
loom hours, expressed as area × rate (§H3c). International carriage is not: it depends on
destination, weight, dimensions, and which of several carriers is cheapest that week (§H4). One is
arithmetic; the other is judgement. Forcing the custom size through a quote queue would add a
two-day delay to a purchase that needs none, and forcing international shipping through a formula
would produce a number nobody computed — which is the failure mode §5.9.4 exists to avoid.

**The customer-facing consequence:** the custom-size buy box must never use the vocabulary of the
quote flow. No «розрахуємо», no «звʼяжемося з вами», no «надішлемо вартість». The button says
«Додати в кошик» and the price is on the screen.

### Failure branches

| Branch | Behaviour |
|---|---|
| **Dimensions outside the loom range** | This should be unreachable: the inputs carry `min`/`max` from `customSizeMinWidthCm` … `customSizeMaxLengthCm`, state the range before typing, and clamp on blur (§H3c). **If it is reached anyway** — a pasted value, a disabled script, a crafted POST — the server rejects the line with a named message stating the permitted range and the value received, and the cart is left unchanged. It is **never** accepted and corrected later by a human: the bounds are physical loom and frame limits, so an out-of-range order is not a negotiation, it is an order that cannot be woven. Accepting it and cancelling after payment is the exact failure §H3c added the fields to prevent |
| **Server computes a different price than the browser showed** | The server's figure is authoritative (§H3c: «the browser's number is never trusted»). The customer is **not** silently charged the difference. The cart line is re-rendered with the corrected price, the change is named — «Ціну оновлено: 12 300 ₴» — and the customer must act to proceed. A silent correction on a prepaid order is indistinguishable from a bait-and-switch, and this is a prepayment flow, so the customer has no inspection right to fall back on |
| **The rate is changed by the owner while an item sits in a cart** | Same handling as above: the price is recomputed at checkout and any change is surfaced, not absorbed. `{{CART_TTL_DAYS}}` is 30 days, which is long enough for a rate change to be a real occurrence rather than a theoretical one |
| **`allowsCustomSize` is switched off while the item is in a cart** | The line becomes unpurchasable. The cart states why in plain language and offers the nearest standard size; it does not silently drop the line, because a cart that loses an item without saying so is a cart the customer stops trusting |
| **Both dimensions empty, customer taps add-to-cart** | The button reads «Вкажіть розміри» and moves focus to the first input, rather than being inert ([08-design-system.md](08-design-system.md) §8.5) |

| Drop-off risk | Mitigation |
|---|---|
| Prepayment reads as distrust of the customer | The reason ships with the rule, always: «Виріб шиється за вашими розмірами, тому оплата — повна, наперед» (§H1.1). A restriction with a stated reason is a policy; without one it is an accusation |
| «14 днів» understood as delivery time | Never stated alone. The second sentence is mandatory (§5.1, §G2 rule 1) |
| Price appears without explanation and feels arbitrary | The computed area renders beside it. A customer who can see `4,32 м²` can infer the rate and check the next one |
| The customer types a size and nothing visibly happens | The price updates on every keystroke, with reserved width so the layout does not jump ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| A buyer wants a size the loom cannot weave and feels refused | The range is stated **before** they type, as a fact about the workshop rather than as a rejection of their request. «Ширина: від 100 до 200 см» reads as a specification; the same information delivered as a post-submission error reads as a door closing |

---

## 5.8 The checkout spine

Three linear steps, shared by every payment path. **No step re-asks anything a prior step
collected**, and back navigation never destroys entered data — a working-memory requirement for the
60–75 segment ([02-ux-research.md](02-ux-research.md) §2.6), not a nicety.

```
CART  →  1 ДОСТАВКА  →  2 ОПЛАТА  →  3 ПІДТВЕРДЖЕННЯ  →  ЗАВЕРШЕНО
         contact +        method         review +           guestToken
         address          choice         place              issued
            │                │               │
            └────────────────┴───────────────┘
              back is free; a persistent order summary
              (items · delivery · total) is visible at every step
```

Rules that apply at every step:

1. **Labels always visible above the field**; placeholder-as-label is banned
   ([08-design-system.md](08-design-system.md) §8.6).
2. **`autocomplete` on every field** — the highest-leverage zero-cost checkout change available.
3. **Validation on blur first**, then on change once a field is invalid. Errors appear instantly and
   without motion ([13-motion-system.md](13-motion-system.md) §13.11).
4. **Stock is reserved at step 1**, not at add-to-cart, via `StockReservation` with a short TTL.
   This is what stops two buyers racing for the same one-of-one item
   ([25-database-schema.md](25-database-schema.md) §25.5).
5. **The order number is issued before payment**, so a buyer always has a reference even if payment
   fails.
6. **Nothing animates beyond a cross-fade** ([13-motion-system.md](13-motion-system.md) §13.11).
7. **No mascot** anywhere in checkout ([01-brand-strategy.md](01-brand-strategy.md) §1.7).
8. **No account is created, offered, or hinted at — at any step, or after the order.**
   [00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest permanent, so there is no
   "create an account to track your order" prompt on the confirmation page and no "save your
   details" upsell that implies an account exists. The two legitimate persistence offers are
   explicit and device-local: an address-prefill checkbox («Запамʼятати мої дані на цьому
   пристрої»), and the marketing checkbox in rule 9.
9. **Marketing consent is one unticked checkbox at step 1**, writing to `NewsletterSubscriber` with
   `source` and `locale` (§5.15). It is independent of any account concept, and it is never
   pre-ticked — a pre-ticked box is invalid consent under GDPR and this checkout now serves EU
   buyers (§5.9.3).
10. **«Забрати в Яворові» is written as an invitation and carries the place with it.** The option
    reads «Забрати в Яворові — магазин і виробництво в одному місці», with the address, one line
    of directions, the variable-hours caveat and a phone number underneath it — not a row saying
    «Самовивіз · 0 ₴». [00-client-decisions-3.md](00-client-decisions-3.md) §F2 is explicit that
    this is not a cost-saving fallback. The practical reason to follow it: a buyer who selects
    pickup without understanding that it means driving into a mountain village is a buyer who
    calls support, and the option that reads as «free» is the one that gets selected by accident.
    Price is shown, but it is not the headline.

| Step | Drop-off risk | Mitigation |
|---|---|---|
| 1 | Nova Poshta branch selection is the hardest control in Ukrainian e-commerce | City autocomplete → warehouse autocomplete, both searchable by number and by street; last selection remembered; `npWarehouseRef` stored |
| 1 | Shipping cost revealed late | Carrier prices shown as the method is chosen, before payment |
| 2 | Method choice anxiety | Both COD and card presented as equal, neutral options. No "recommended" framing, no fee shaming |
| 3 | Buyer cannot verify what they are buying | Full line detail with images, chosen variant, and for by-weight lines the weight and unit price |
| all | Mobile keyboard mismatch | `type="tel"`, `inputmode="numeric"` on postal codes and quantities ([08-design-system.md](08-design-system.md) §8.6) |

---

## 5.9 Payment paths

### The problem this design is avoiding

The category norm, documented in the adjacent business
([00-existing-site-audit.md](00-existing-site-audit.md) §0.6), is:

```
BEFORE (category norm — must not be reproduced)
 place order → wait for a manager to call → open a banking app →
 manually type a PERSONAL card number → transfer 5 000–15 000 ₴ →
 message a screenshot → wait for confirmation
 ✕ drop-off at every arrow  ✕ reads as a fraudulent listing
 ✕ hardest for exactly the 60+ segment most likely to be buying
 ✕ a published personal card number is trivially copied into a fake listing

AFTER (Вівчарик)
 place order → order number issued → pay on-site with a real PSP →
 webhook confirms → receipt emailed
 COD retained as the trust fallback, not as the only option
```

Вівчарик launches on a new domain with no legacy process to unwind, so this is a **greenfield
advantage rather than a fix**.

**`{{PSP}}` resolves to WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
That closes the selection question and opens a narrower one: **which integration mode** — hosted
redirect page, embedded widget, or direct API. That is verification item **V6** and it is
unverified. It is not a detail. It decides whether step 2 of the spine collects card data in-page
or hands the buyer to another domain, which changes the drop-off profile, the interstitial copy,
the PCI scope and the failure-return design. §5.9.2 therefore specifies **both branches** and marks
the choice as blocked rather than guessing one.

**Nothing about WayForPay's API may be written from memory.** Signature field order (V7), webhook
payload and acknowledgement (V8), refund support (V9), ФОП-simplified-tax eligibility (V10) and
non-UAH settlement (V11) are all to be read from current official documentation before any of it
reaches code or [26-api-architecture.md](26-api-architecture.md). A guessed signature format fails
silently in production, which is the worst failure mode available on a payment page.

### 5.9.1 Наложений платіж з оглядом — inspection at the branch, Ukraine only

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.2 names the method precisely, and the
name is the offer: **«наложений платіж з оглядом»** — the buyer opens the parcel at the Nova
Poshta or Ukrposhta counter and pays only if they keep it. For someone spending 5,000–15,000 ₴
with a brand they have never heard of, that removes the single largest objection a cold-start
domain faces (D2), which is why the flow below treats it as a selling point rather than as a
payment rail.

**Eligibility is decided on the server, before the list is rendered** (§H1.1, §5.1). Three
conditions, and a failing condition means the option is **absent**, not disabled:

| Condition | Rule |
|---|---|
| Destination | **Ukraine only.** Not offered for `en`, `pl` or `de` destinations (§H1.2) |
| Cart contents | **Stocked items only.** Any line with `madeToOrderDays` — i.e. any custom size — removes it (§H1.1), **for the whole cart**. A mixed cart is therefore card-only; §5.9.5 covers how that is disclosed |
| Order value | `{{COD_CEILING}}`, unchanged |

```
2  ◆ Server-derived method list includes COD?
   ├─ no  → the option is ABSENT. Where the reason is the cart's
   │        contents, the payment step says so in one sentence —
   │        «Виріб на індивідуальний розмір оплачується наперед» —
   │        because an unexplained absence reads as a missing feature
   └─ yes → 3
3  Select «Наложений платіж з оглядом»
   │
4  ⚠ THE DEPOSIT BLOCK RENDERS — expanded, above the pay button,
   with this order's real numbers. Never an accordion. See below
   │
5  Pay BOTH shipping legs online, by card:
      forward shipping  +  return-shipping deposit
   Order{ paymentMethod: COD_INSPECTION, paymentStatus: UNPAID,
          status: PENDING,
          shippingForwardMinor, shippingReturnDepositMinor,
          codAmountMinor = subtotal − discount − deposit }
   │
6  Confirmation page + email: order number, guestToken link, and the
   same arithmetic restated — what was charged now, what is payable
   at the counter
   │
7  Admin confirms → PACKING → SHIPPED (§5.16.1)
   │
8  ◆ At the counter, after inspection
   ├─ ACCEPTS  → pays codAmountMinor (price − deposit)
   │             → DELIVERED → depositAppliedMinor credited HERE,
   │               exactly once (§5.16.1)
   └─ REFUSES  → pays nothing further. The return leg is already
                 funded; the parcel comes home at no cost to the
                 business → RETURNED
```

#### The deposit is the one rule on this site that can be misread as a hidden fee

§H1.3 is blunt about the risk: **the entire risk is the wording.** Framed carelessly, "pay both
legs of shipping up front" reads as *pay extra for permission to look at the goods* — which would
be worse than not offering inspection at all, because it would attach a suspicion to the one
feature that was supposed to remove suspicion.

It is not a fee. It is a **refundable-by-offset deposit**: an honest buyer who keeps the parcel
pays nothing extra, because the deposit comes straight off what they owe at the counter. Only the
buyer who triggers a return pays for the return, which is the cost they caused.

[00-client-decisions-6.md](00-client-decisions-6.md) §J2 confirms the mechanic and puts the
business reason on record rather than leaving it inferred: refused inspections are a recurring,
real cost the business currently absorbs on **both** legs of carriage. That is why the copy is
written the way it is. This is not a scheme to extract a charge; it is a business correcting an
asymmetry where the person who causes a cost does not bear it, and copy written from that
understanding reads differently from copy written to justify a fee.

**The construction is fixed, and it is numbers rather than prose:**

> «Ви оплачуєте доставку в обидві сторони — 120 + 120 ₴.
> Якщо ви залишаєте товар, 120 ₴ віднімається від ціни: на пошті ви доплатите 7 280 ₴ замість
> 7 400 ₴.
> Якщо не залишаєте — більше нічого не платите.»

| Requirement | Rule |
|---|---|
| Form | **A worked example with three real numbers**, never a percentage, never prose, never an illustrative example with round placeholder figures. §H1.3: showing the arithmetic is what converts a suspicious-sounding rule into an obviously fair one |
| Position | Above the pay button, in the flow, expanded at every breakpoint including 320 px ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| Disclosure state | **Never an accordion, never «Детальніше», never a tooltip.** Identical to the customs rule in §5.9.3, and stronger here because this describes a charge the buyer is about to authorise rather than one that arrives later |
| Vocabulary | The word «депозит» does not appear. It is accurate and it is the worst available framing |
| Repetition | Restated in the confirmation email and on the order-status page, with the same three numbers |
| Approval | **The copy is not yet client-approved** — §H5 item 4. The mechanic and the layout are settled; the exact string is not, and it ships only after review |

#### The invariant that needs a test, not a convention

§H1.3: `depositAppliedMinor` is credited **exactly once, on transition to `DELIVERED`**.

| Wrong crediting point | Consequence |
|---|---|
| On `SHIPPED` | Refunds a deposit for a parcel that is later refused. The business funds the return it was protecting itself against |
| Twice, e.g. on a retried webhook | Gives away the goods |

This belongs in the order state machine, not in a controller, and it needs a test
([25-database-schema.md](25-database-schema.md)). It is recorded in this document because it is the
one place a *flow* decision — where in the timeline the money moves — has a correctness consequence
that no UI review would catch.

#### Locale scope: this mechanic is Ukraine-only, for a legal reason

It must not be applied to `en`, `pl` or `de` orders. Under the EU Consumer Rights Directive a buyer
has an unconditional 14-day right of withdrawal, and a trader may not require a deposit against
exercising it. Pre-charging a return leg at checkout for an EU consumer is not permissible in this
form. International orders remain card-only, buyer pays outbound shipping and all customs (§F4,
§5.9.3), and returns follow the withdrawal rules in that locale's own policy page rather than being
pre-funded.

| Drop-off risk | Mitigation |
|---|---|
| **The deposit reads as a hidden fee and the buyer abandons at the payment step** | The worked example, in that position, in that form. This is the highest-stakes copy decision in the document and it is why §H1.3 specifies the sentence rather than the intent |
| Buyer discovers the carrier's own COD commission at the counter | Disclosed at step 4, itemised separately from the deposit — they are different things and merging them into one number destroys the arithmetic |
| Buyer thinks the deposit is lost if they keep the goods | The second line of the required copy exists for exactly this, and it states the resulting counter payment as a number, not as a rule |
| COD read as "the safe option", card as "the risky one" | Both presented neutrally, no "recommended" framing, no fee shaming. Neutral presentation is also what lets R2 ([02-ux-research.md](02-ux-research.md) §2.8) measure real preference rather than a nudge |
| A Ukrainian buyer with a mixed cart loses inspection on both items | **They do, and it is disclosed when the custom item is added rather than discovered here** (§5.9.5, [00-client-decisions-6.md](00-client-decisions-6.md) §J1). The same disclosure offers the escape: order the stocked item separately and it keeps both inspection and next-day dispatch |

### 5.9.2 Guest checkout with card via WayForPay — both integration branches

**BLOCKED ON V6** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10). The integration mode
available to this merchant is unverified, and it materially changes this step. Both branches are
specified below so that whichever V6 returns, the flow is already designed; **the build target
remains the redirect branch**, because a redirect design degrades into an embedded one cheaply and
the reverse retrofit is the expensive direction.

```
3  Place order
   │
   ├─ Order created: PENDING / UNPAID, number issued, stock reserved
   │                 ← this happens BEFORE any branch, in both branches
   │
   ├─ BRANCH A — EMBEDDED WIDGET / IN-PAGE ────► card fields in-page inside a
   │  (WayForPay widget or hosted fields)        PSP-owned iframe, PCI SAQ-A
   │                                             ├─ no interstitial, no domain change
   │                                             ├─ 3-D Secure still opens a bank
   │                                             │  step — warn before it appears
   │                                             └─► authorise ─┐
   │                                                            │
   ├─ BRANCH B — HOSTED REDIRECT PAGE ─────────► interstitial: "Переходимо до банку.
   │  (WayForPay-hosted payment page)            Ваше замовлення #VCH-26-0417
   │                                             вже збережене."
   │                                             └─► WayForPay domain ──┐
   │                                                                    │
   └─ BRANCH C — DIRECT API ───────────────────► NOT A DESIGN OPTION.   │
      Card data would touch our servers and       Rejected regardless    │
      raise PCI scope from SAQ-A to SAQ-D.        of V6's answer.        │
                                                                        │
                            ┌───────────────────────────────────────────┴┐
                            │                                            │
                   ✓ success return                            ✕ failure / abandon
                            │                                            │
      /oformlennia/zaversheno/{guestToken}          return to /oplata with the order intact
      shows PENDING-confirmation until the                ⟲ retry, switch to COD,
      webhook lands (see below)                             or leave and resume via email
```

**What differs between A and B, and what does not.** Order creation, the order number, the stock
reservation, the webhook-as-source-of-truth rule and the failure return are **identical** in both —
they are deliberately placed outside the branch so that resolving V6 changes one step and not the
spine. What differs is exactly three things: whether an interstitial renders, whether the buyer
leaves the domain, and what the retry control says. Keeping the difference that small is the point
of specifying both.

**Branch C is ruled out independently of V6.** Even if direct API access is offered, taking card
data through our own servers moves PCI scope from SAQ-A to SAQ-D for a business with no security
staff. That is not a trade worth making for a marginally smoother form.

**The webhook is the source of truth, not the browser return.** The return URL may never be reached
— the user closes the tab, the mobile bank app does not hand back, the network drops.
`PaymentTransaction` is written from the signed webhook, idempotent on `idempotencyKey`, unique on
`(provider, providerRef)` ([25-database-schema.md](25-database-schema.md) §25.5). The thank-you page
polls order status and resolves to PAID when the webhook lands; if it has not landed within
`{{WEBHOOK_GRACE_SECONDS}}`, the page says so plainly and gives the order number and a contact route
rather than spinning.

| Drop-off risk | Mitigation |
|---|---|
| Leaving the site for a bank page feels like losing the order (branch B) | The interstitial states the order number and that the order is already saved. The order exists before the redirect, by design |
| Returning to a lost cart after a failed payment | Return lands on `/oplata` with the order intact and the cart untouched; retry or switch method |
| Double charge on a retry | Retry reuses the same order and the same idempotency key |
| Stock reservation expires during a slow bank flow | Reservation TTL exceeds the WayForPay timeout; an expired reservation on an authorised payment escalates to admin rather than cancelling silently |
| 3-D Secure on an unfamiliar bank page for a 60+ buyer | Warned **before** it appears, in both branches. Branch A has no interstitial to carry the warning, so it goes above the card fields instead — an embedded form that suddenly jumps to a bank screen is more alarming than a redirect that was announced |
| Building against the wrong integration mode | V6 is answered before checkout implementation starts, not during it. Until it is, only the branch-invariant parts above are built |

### 5.9.3 International order — `en`, `pl`, `de`

[00-client-decisions-2.md](00-client-decisions-2.md) §E11 accepts orders from abroad and
[00-client-decisions-3.md](00-client-decisions-3.md) §F4 settles the commercial terms, which
together make this a genuinely different flow rather than a translated §5.8. Two facts drive
everything below:

1. **The buyer pays shipping and all customs duties and import taxes**, to every destination —
   effectively **DAP**, delivered duties unpaid.
2. **Carriers are chosen per order.** Nova Poshta Global, Ukrposhta International and others case
   by case. `{{INTL_CARRIER}}` resolves to *multiple, quoted per order*, which means the checkout
   **cannot compute a shipping rate live**.

Fact 1 produces a disclosure requirement that is not optional. Fact 2 breaks the checkout spine's
assumption that a total can be computed before payment, and is answered by §5.9.4.

```
1  Non-UA address entered at step 1 (country selector, not inferred from locale —
   a German speaker may be shipping to Ukraine and a Ukrainian to Poland)
   │
2  ◆ Country in scope?
   ├─ UA                    → §5.8 unchanged, live rate, pay now
   ├─ EU / rest of world    → 3
   └─ destination we do not ship to at all
                            → ✕ named refusal + contact route.
                              Never a silent "no methods available"
   │
3  ⚠ BLOCKING DISCLOSURE — see below. Rendered at step 1–2, in the
   flow of the page, before any payment affordance exists
   │
4  Shipping is NOT calculated here. The order is submitted for a quote.
   Free shipping does not apply, at any order value        ──► §5.9.4
   │
5  ◆ Payment method (presented at §5.9.4 step 5, after the quote)
   ├─ COD → NOT OFFERED. The method is absent with a stated reason,
   │        not present-and-disabled
   └─ card via WayForPay → §5.9.2
   │
6  ◆ Settlement currency — BLOCKED ON V11
   ├─ WayForPay settles the display currency → charge in it
   └─ WayForPay settles UAH only → prices display converted, the charge
      is in UAH, and the payment screen says so in one plain sentence
   │
7  EU buyers: the confirmation email carries the 14-day withdrawal notice
   and a link to the model withdrawal form ([04-sitemap.md](04-sitemap.md) §4.5)
```

#### The customs disclosure is a blocking element, and this is the most important sentence in this document

An EU buyer surprised by an import VAT bill at their door refuses the parcel. The shop then
absorbs an international return: outbound shipping spent, return shipping charged, goods in
transit for weeks, and a customer who leaves a review about it. This is the single most common way
small cross-border shops lose money
([00-client-decisions-3.md](00-client-decisions-3.md) §F4), and the whole of it is prevented by
one paragraph placed where it must be read.

**Required copy, before the pay button, localised per locale and not machine-translated:**

> «Ціна не включає митні збори та податки країни призначення. Їх сплачує отримувач при отриманні.
> Сума залежить від країни та вартості замовлення.»

**Placement is specified as tightly as the wording, because placement is where this normally
fails:**

| Requirement | Rule |
|---|---|
| Position | In the **normal flow of the page**, between the address block and the submit control. Not below the button, not in a sidebar, not after the fold on any supported viewport |
| Disclosure state | **Always expanded.** Never a `<details>`, never a collapsed accordion, never a tooltip, never a link to `/de/zahlung-und-versand`. The legal page carries it too, and the legal page is not sufficient ([04-sitemap.md](04-sitemap.md) §4.5) |
| Type treatment | Same size and weight as the surrounding body copy. No smaller type, no grey-on-grey, no asterisk. Fine print is a signal to skip |
| Interaction | **An explicit unticked acknowledgement checkbox** — «Я розумію, що митні збори оплачую я» — gating the submit control on every non-UA order. It is the one place in this checkout where friction is the point: it converts a disclosure the buyer may not have read into one they acted on, and it is the difference between a refused parcel being their surprise and being their decision |
| Repetition | Restated in the quote email (§5.9.4 step 4), on the payment screen, and in the confirmation email. A fact that decides whether a parcel is accepted is worth saying three times |

The acknowledgement is stored on the order — a timestamp and the exact string version shown — so
that a later dispute is answerable with a record rather than an assertion.
`{{EU_IMPORT_TERMS}}` sets the **wording** per market. It does not set whether the block appears,
and it is not a reason to defer building it.

| Step | Drop-off risk | Mitigation |
|---|---|---|
| 2 | Catalogue shows goods that cannot legally ship to the destination | **`de` and `pl` launch wool-only.** Sheepskin and leather face EU species-declaration and, for some materials, CITES paperwork; wool does not (§E11). The hide worlds 404 in those locales rather than being purchasable and then cancelled ([04-sitemap.md](04-sitemap.md) §4.2). A cancelled international order is a refund, a complaint and a review — far more expensive than a narrower launch catalogue |
| 3 | **Customs charges discovered at the door.** The single most damaging failure available in cross-border retail | The blocking block above, plus the acknowledgement checkbox. Disclosed before payment, in the flow, at body-copy weight |
| 4 | Buyer expects a total and gets a "we will quote you" | Handled in full at §5.9.4. The risk is real and the mitigation is the design of that flow, not a reassuring sentence |
| 4 | A free-shipping threshold promises something that cannot be honoured abroad | **Free shipping never applies internationally, at any order value** ([00-client-decisions-3.md](00-client-decisions-3.md) §F4). `{{FREE_SHIPPING_THRESHOLD}}` messaging is suppressed entirely on non-UA addresses and in the `en`/`pl`/`de` announcement bar, rather than shown and then contradicted at the quote |
| 5 | COD offered abroad and then failing | COD is **not available outside Ukraine** (§E11). It is removed from the method list with one sentence saying why, rather than rendered disabled — a disabled control invites a support call ([08-design-system.md](08-design-system.md) §8.5) |
| 6 | Buyer's bank shows a different currency than the site did | If V11 says UAH-only settlement, the payment screen states the UAH amount that will actually be charged beside the displayed price. A currency surprise on a bank statement produces a chargeback, not an email |
| 7 | EU statutory rights not communicated | The 14-day withdrawal notice and the model form are linked from the confirmation email as well as the footer. The form is a real on-page form, not a download-only PDF ([04-sitemap.md](04-sitemap.md) §4.5) |

**Recommendation on record:** launch `de` and `pl` **wool-only**. It sidesteps the species
paperwork, narrows the EU product-safety responsible-person question, and avoids the German
market's documented sensitivity to fur and hide goods. Enabling the hide worlds later is a
`Category` toggle and a sitemap regeneration — it costs nothing structural, which is the whole
reason the material-first tree was chosen
([03-information-architecture.md](03-information-architecture.md) §3.2).

### 5.9.4 Enquiry-then-invoice — the international order flow

**The model, and why it beats the alternative.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F4 puts two options on the table and
recommends the second:

| Option | Assessment |
|---|---|
| Flat-rate zones with a published table | Simple, and wrong in both directions. It overcharges the easy destinations — a 2 kg parcel to Poland — and loses money on the hard ones, a 6 kg ліжник to Canada. Every mis-priced order is either a lost sale or an absorbed cost, and the shop has no volume across which to average the error |
| **Enquiry-then-invoice** | **Recommended and specified here.** The customer submits the order, receives a shipping quote, then pays. Slower, honest, and it matches how the business actually operates — a carrier chosen per parcel by the person packing it |

The honest cost is stated once and not hidden: this replaces a two-minute purchase with a
one-to-two-day one, and some buyers will not wait. That cost is paid deliberately, because the
alternative is charging a number nobody computed.

```
1  Cart → checkout step 1, non-UA address entered
   Blocking customs disclosure + acknowledgement checkbox (§5.9.3)
   │
2  ◆ Submit
   └─ NOT "Оплатити". The control reads «Надіслати замовлення —
      ми розрахуємо доставку». The button never promises a price
      it cannot produce
   │
3  Order created: number issued, stock reserved, guestToken issued
   status = AWAITING_QUOTE · paymentStatus = UNPAID · shippingMinor = null
   ├─► IMMEDIATE on-screen confirmation, not a spinner: order number,
   │   what happens next, and WHEN — «Ми надішлемо вартість доставки
   │   протягом {{QUOTE_SLA_HOURS}} годин»
   └─► IMMEDIATE email from {{TRANSACTIONAL_FROM}} carrying the same
       three facts plus the guestToken link
   │
4  Admin: order lands in a dedicated AWAITING_QUOTE queue with an
   age counter (§5.16.1). Staff choose a carrier, enter the shipping
   total, and send.
   └─ ◆ Destination turns out to be unservable after all?
      → ✕ order CANCELLED with a named reason and the reservation
        released. Never left in AWAITING_QUOTE to time out silently
   │
5  Quote email: shipping cost, the new total, the customs disclosure
   restated, and a single link to
   /{locale}/{order-seg}/{number}/{pay-seg}?t={guestToken}
   ([04-sitemap.md](04-sitemap.md) §4.3)
   status → PENDING · shippingMinor and totalMinor written
   │
6  ◆ Customer pays within {{QUOTE_VALIDITY_DAYS}}?
   ├─ yes → §5.9.2 card flow, unchanged from that point on.
   │        Webhook → PAID → CONFIRMED → §5.16.1
   ├─ no, silence → T+24h reminder, T+{{QUOTE_VALIDITY_DAYS}} expiry
   │                notice. Reservation released, order CANCELLED,
   │                and the email says the order can be placed again
   └─ declines → CANCELLED, reason recorded. A declined quote is
                 pricing intelligence, not a failure to hide
```

#### How this interacts with the `OrderStatus` machine

[25-database-schema.md](25-database-schema.md) §25.5 is canonical and is **not amended here**; what
follows is the requirement this flow places on it, stated so the schema owner can resolve it.

The machine today is `PENDING → CONFIRMED → PACKING → SHIPPED → DELIVERED`, plus `CANCELLED` and
`RETURNED`, with `PENDING` as the default on creation. A quoted order does not fit that:

| Property | `PENDING` today | What a quoted order needs |
|---|---|---|
| Meaning | Created, awaiting payment or confirmation | Created, **awaiting a price** — the customer cannot act |
| `totalMinor` | Final | **Provisional.** `shippingMinor` is not yet known |
| Customer action available | Pay | None. Waiting is the correct behaviour |
| Staff action required | Confirm or fulfil | **Quote**, and it is time-critical |
| Email sent on entry | Order confirmation with a total | Acknowledgement **without** a total |

Overloading `PENDING` with both meanings breaks three things concretely: the admin's unpaid-orders
widget fills with orders nobody can pay, the confirmation email template has to branch on a
nullable `shippingMinor` to avoid printing a false total, and the SLA that matters most in this
flow — time-to-quote — becomes unmeasurable because it has no state boundary to measure between.

**Requested change against [25-database-schema.md](25-database-schema.md) §25.5:** one new
`OrderStatus` member, `AWAITING_QUOTE`, entered on creation for any order whose
`shippingCarrier = INTERNATIONAL`, and one nullable `quotedAt` timestamp.

```
AWAITING_QUOTE ──(staff enters shipping cost)──► PENDING ──► CONFIRMED ──► …
      │                                              │
      └──(unservable, or quote expires)──► CANCELLED ◄┘
```

`AWAITING_QUOTE` precedes `PENDING` rather than replacing it, so every state after the quote is
the existing machine unchanged — the domestic flow is untouched, and the card flow at §5.9.2 is
entered from a different door but is otherwise identical. `shippingMinor` becomes nullable for the
duration, which is the honest encoding of "not yet known"; zero would be a lie that arithmetic
would propagate into `totalMinor`.

The two rejected alternatives, for the record: a boolean `isAwaitingQuote` beside `PENDING`
reproduces the state without the state machine's validation, so nothing stops a `SHIPPED`
transition on an unquoted order; and a separate `Quote` entity duplicates line items, addresses
and reservations for a record that becomes an order in every successful case.

#### Not feeling abandoned between submission and quote

This is where the model actually fails if it fails. The buyer has entered an address, acknowledged
a customs charge, pressed a button, and received no price. Six rules, each answering a specific way
that silence becomes an abandonment:

| Failure it prevents | Rule |
|---|---|
| «Did that work?» | The on-screen state at step 3 is a **full confirmation page**, not a toast — order number, items, address, and the explicit statement that nothing has been charged yet. The order number existing is the proof the submission worked |
| «How long do I wait?» | A stated, numeric SLA — **48 working hours**, resolved by [00-client-decisions-5.md](00-client-decisions-5.md) §H2 — on screen, in the acknowledgement email, and on the order-status page. «Найближчим часом» is the phrase this rule exists to ban. The customer-facing string **under-promises**: «протягом 2 робочих днів». A quote arriving in four hours is a pleasant surprise; the reverse is a complaint |
| «Am I being charged now?» | Stated explicitly at three points: «З вас нічого не списано. Оплата — після того, як ви побачите вартість доставки.» Payment ambiguity after a form submission is what produces the duplicate-submit and the support email |
| «Nobody is doing anything» | The order-status page at §5.12 shows `AWAITING_QUOTE` as a **named, dated timeline step** with the SLA deadline beside it, so the wait is visible and bounded rather than blank |
| The quote email is never seen | It sends from `{{TRANSACTIONAL_FROM}}` on an authenticated domain (§5.1) — this flow is the strongest argument for that rule in the whole document, because here a spam-foldered email is a lost order rather than a lost receipt. The guestToken link also surfaces the quote on the status page, so the email is a notification and not the only channel |
| Staff forget | The admin `AWAITING_QUOTE` queue carries an **age counter and an SLA breach indicator**, on the dashboard, mirroring the `Lead.status = NEW` counter in §5.10. An enquiry-then-invoice model is only as good as its response time, and the response time is only as good as its visibility |

**One deliberate omission: there is no "estimated shipping" figure shown before the quote.** A
range invites the buyer to anchor on its low end, and a quote that lands above it reads as a
bait-and-switch even when it is accurate. Saying «we will tell you within N hours» is weaker
marketing and better business.

**Domestic orders never enter this flow.** Nova Poshta and Ukrposhta rates are computable at
checkout, so a UA order pays immediately, as in §5.8. The enquiry model is the price of carrier
flexibility abroad, and it is not paid at home where flexibility is not needed.

**Custom-size orders never enter this flow either**, and this is the distinction most at risk of
being collapsed during implementation. A custom size has a price the moment the customer types the
dimensions (§5.7b, §H3c). It is an ordinary `PENDING` order that happens to take fourteen days to
make. Routing it through `AWAITING_QUOTE` would add a two-day human delay to a purchase that needs
none, and would put a customer who can see their price into a state whose entire design premise is
that no price exists yet. See the contrast table in §5.7b.

#### The two numbers this flow publishes, resolved

[00-client-decisions-5.md](00-client-decisions-5.md) §H2 sets them, chosen to be safe for a
two-person business rather than impressive to a customer. **Both are commitments and are confirmed
before launch, not settings that can drift.**

| Token | Value | Reasoning |
|---|---|---|
| `{{QUOTE_SLA_HOURS}}` | **48 working hours** | A two-person business with a factory to run cannot honestly promise same-day. 48 survives a busy week, a weekend and an illness. Promising 24 and delivering 50 is worse than promising 48 and delivering 20 |
| `{{QUOTE_VALIDITY_DAYS}}` | **72 hours** from issue | Long enough for a customer in another timezone to decide over a weekend, short enough that carrier pricing and stock have not moved |
| One-of-one items | **36 hours** | Half the standard window. Holding a unique ліжник for three days on an unaccepted quote blocks a buyer who would pay today ([18-checkout-specification.md](18-checkout-specification.md) §18.23.7) |

**An expired quote is not a dead order.** Step 6's silence branch moves it to a state from which
the customer can request a fresh quote in one click, and the admin sees it as a lapsed opportunity
rather than as a failure. The expiry email says so, in those terms.

### 5.9.5 Mixed cart — one basket, one order, disclosed at the add

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b makes this the **expected** case rather
than an edge case. Because `allowsCustomSize` is per product, a buyer can put a stocked ліжник at
150×200 and a custom one at 180×240 into the same cart in two taps — from the same product page.

**One order, one parcel, one delivery charge, dispatched after the fourteen-day production period**
([00-client-decisions-6.md](00-client-decisions-6.md) §J1). An earlier round recommended splitting
such a cart into two orders so the stocked item could ship immediately; that recommendation is
withdrawn and the split flow that used to occupy this section is removed rather than deferred. The
split bought a few days on one line and charged the customer a second delivery fee for them, while
handing a two-person business a second parcel to pack and a second waybill to track. At this scale
the operational simplicity is worth more than the days saved, and nobody enjoys paying twice for
delivery on a single purchase.

What the split was genuinely good at was **telling the customer the truth early**, and that part is
kept. It is kept without the machinery.

#### The disclosure fires at the add, not at checkout

This is the whole design, and the reason for it is counter-intuitive enough to state plainly:
**adding a made-to-measure item changes the terms of the item already in the cart.** A stocked
ліжник that was available on «наложений платіж з оглядом» and would have shipped tomorrow becomes
prepaid and ships in two weeks — because of a *different line* in the same cart. A customer who
meets that fact at the payment step has been told it at the one moment where it reads as a
bait-and-switch, and by then they have entered an address and a phone number.

So it is disclosed at the moment the custom line enters the cart (§5.7b step 6), in the
add-to-cart confirmation, and it persists in the cart and in the checkout summary thereafter:

> «У кошику є виріб на індивідуальний розмір. Усе замовлення відправимо разом, коли він буде
> готовий — через 14 днів. Оплата — повна, наперед.»

```
1  Cart contains ≥1 line with customSpec AND ≥1 without
   │
2  ⚠ DISCLOSURE, AT THE ADD. The add-to-cart confirmation states the
   three consequences for the WHOLE cart: shipped together · 14 days ·
   full prepayment. Announced to assistive technology, not only drawn
   │
   In the same place, one plain escape:
     «Потрібен ліжник зі складу раніше? Оформіть його окремим
      замовленням — тоді він поїде одразу.»
   This is a SUGGESTION the customer acts on themselves by placing two
   orders. The system never splits anything (§J1)
   │
3  ◆ Customer's move
   ├─ proceeds        → one Order, one address, one delivery charge
   ├─ ⟲ removes the custom line → the disclosure disappears and the
   │    stocked line's original terms return, including COD
   └─ ⟲ orders separately → two ordinary independent orders, each
        under its own terms. Nothing links them and nothing needs to
   │
4  Payment: ONE server-derived method list for the whole cart (§5.1).
   Cash on delivery is ABSENT, because a custom line is present.
   Card, in full, in advance. No return-shipping deposit — that
   mechanic belongs to COD orders only (§5.9.1)
   │
5  CONFIRMED → IN_PRODUCTION (14 days) → PACKING → SHIPPED.
   The stocked line waits with the custom one. One parcel, one waybill,
   one tracking number, one confirmation email
```

| Design question | Decision |
|---|---|
| One payment or two? | **One.** One order takes one payment, and because the cart contains a custom line that payment is the full amount in advance (§J1) |
| One delivery fee or two? | **One.** This is the customer-visible point of the ruling and the reason the split was rejected |
| Does the stocked line keep cash on delivery? | **No**, and this is the cost of the decision, stated rather than hidden. The method list is derived from the cart as a whole and COD is absent from the response (§5.9.1, [26-api-architecture.md](26-api-architecture.md) §26.10.4b) |
| Is there a return-shipping deposit? | **No.** The deposit exists to fund the return leg of a parcel the buyer may refuse at the counter, which is a COD mechanic. A prepaid order has no refusal step to fund (§5.9.1) |
| Can the customer still get the stocked item quickly? | **Yes, by ordering it separately** — and the site says so at the moment the trade-off appears. What it does not do is make that choice for them |
| Two order numbers? | **One.** There is no pair, no group identifier and no linkage to render on the status page (§5.12) |

| Drop-off risk | Mitigation |
|---|---|
| **The customer discovers at the payment step that their in-stock blanket is now a fortnight away and cannot be inspected** | The disclosure at step 2 is the entire mitigation, and its timing is the load-bearing part. Said at the add, it is a fact about the cart the customer is building; said at payment, it is a term that changed under them |
| «Чому я не можу оглянути товар, який є на складі» | The disclosure names the cause — the custom line — in the same sentence as the consequence. A rule whose reason is visible is a policy; the same rule without one reads as an arbitrary restriction (§H1.1) |
| The customer wanted the stocked item now and abandons the whole cart | The escape is offered in the same breath as the constraint, in plain language, with the benefit stated: order it separately and it ships immediately. The purchase is preserved even when the single-cart shape is not |
| Waiting two weeks with no visible progress | `IN_PRODUCTION` covers the whole order and the status page states the expected dispatch date rather than a duration (§G2, §5.12) |

---

## 5.10 Wholesale and dropshipping enquiry

**Entry points:** nav «Оптом» · footer · a PDP wholesale strip · direct referral · trade search.

```
1  Land on /optom (SSG, desktop-first, dense)
2  Read the credibility block: «Понад 30 років виробляємо…», in-house stages,
   volume tiers, custom production, own-manufacture filter
3  ◆ Which path?
   ├─ #opt           volume wholesale   → LeadKind.WHOLESALE
   ├─ #zamovlennia   custom production  → LeadKind.PRIVATE_LABEL
   ├─ #dropshipping  dropshipping       → LeadKind.DROPSHIP
   └─ #contact       press / general    → LeadKind.PRESS | GENERAL
4  Form variant renders (shared component, different fields)
   WHOLESALE     : company, businessType, estimatedVolume, country, interested categories
   PRIVATE_LABEL : spec (colour / size / fur length), quantity, deadline, reference images
   DROPSHIP      : storefront URL, expected orders/month, fulfilment SLA expectation,
                   who handles returns
5  Submit → Lead{ status: NEW }, utm + sourcePath captured
6  Auto-acknowledgement stating {{WHOLESALE_RESPONSE_SLA}}
7  Admin: NEW → CONTACTED → QUALIFIED → WON | LOST(+reason)
```

| Drop-off risk | Mitigation |
|---|---|
| Form is long and its value is unclear | The price list / capacity sheet is the exchange: stated before the form, delivered on submission |
| A dropshipper asked wholesale questions | Separate field set. A dropshipper has no volume to estimate; asking for one signals the offer is not real ([03-information-architecture.md](03-information-architecture.md) §3.3.6) |
| Silence kills the lead before a competitor even quotes | Public SLA, plus an admin dashboard counter on the age of `Lead.status = NEW` |
| Trade buyer discovers partner products and reads them as dilution | Origin is stated first, confidently, with an own-manufacture filter on every listing. This audience notices first ([02-ux-research.md](02-ux-research.md) §2.3) |
| Spam floods the lead table | Rate limiting, bot scoring, honeypot. `LeadStatus.SPAM` exists so the funnel metrics stay honest |

---

## 5.11 Cart abandonment and recovery

At a four-to-five-figure price point, abandonment is the normal state, not a failure state.

```
add to cart → Cart{ token cookie, expiresAt = now + {{CART_TTL_DAYS}} }
   │
   ├─ returns within TTL → cart intact → §5.3
   │
   ├─ email known (checkout step 1 reached, consent given)
   │     └─ T+1h  reminder 1 — the item, not a discount
   │        T+24h reminder 2 — the provenance story + care guide
   │        T+72h reminder 3 — a question: "потрібна допомога з розміром?"
   │        ✕ stop. Three is the ceiling.
   │
   └─ email unknown → no email is possible. On-site only:
         cart badge persists; a returning-visitor banner names what is waiting
```

| Drop-off risk | Mitigation |
|---|---|
| Recovery email sent without a lawful basis | Only sent where checkout step 1 was reached **and** consent given. For `de`, marketing email requires the double opt-in in §5.15 |
| Discount-led recovery trains buyers to abandon and erodes the price point | No discount in any reminder. Reminders carry the product, the story, and help — consistent with [01-brand-strategy.md](01-brand-strategy.md) §1.9 |
| An item sells out between abandonment and return | The reminder states current availability at send time; the cart line shows the change on return rather than vanishing |
| Reservation held on an abandoned cart blocks a real sale | Reservations are checkout-scoped, not cart-scoped; a cron sweeps `StockReservation.expiresAt` ([25-database-schema.md](25-database-schema.md) §25.5) |

---

## 5.12 Order tracking without an account

**This is the only order-retrieval surface on the site, permanently**
([00-client-decisions-2.md](00-client-decisions-2.md) §E12). It is not a guest fallback beside an
account path — there is no account path. Everything a customer could ever need to do with a past
order happens here.

**Entry points:** confirmation email link · footer «Відстежити замовлення» · shipping email.

```
1  /{locale}/zamovlennia
2  ◆ How did they arrive?
   ├─ from an email → ?t={guestToken} → straight to status
   └─ manually → form: order number + email
                 └─ ◆ match?
                    ├─ no  → ✕ generic "не знайдено" (never reveals whether
                    │         the number or the email was wrong)
                    └─ yes → emailed magic link, not immediate access
3  Status page: OrderEvent timeline, carrier tracking number,
   items with the variant and (for by-weight lines) the weight
4  Actions: repeat order · request a return (§5.13) · contact support
   EU orders additionally: withdrawal notice + model withdrawal form link
   AWAITING_QUOTE orders additionally: the SLA deadline, «нічого не
   списано», and — once quoted — the pay link (§5.9.4)
   IN_PRODUCTION orders additionally: the expected DISPATCH DATE
   COD orders additionally: the counter amount, restated as
   «на пошті: 7 280 ₴», with the same arithmetic as §5.9.1
   Mixed orders: ONE number, one parcel, one dispatch date. There is
   no pair to join and nothing to reconcile (§5.9.5)
```

**`IN_PRODUCTION` is a status this page exists to render.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G2 adds it between `CONFIRMED` and `PACKING`
for a reason that is entirely about this screen: a customer who paid for a custom ліжник and sees
«Підтверджено» for twelve days assumes the order is stuck, and contacts support. A status that
names what is actually happening removes that contact and replaces anxiety with anticipation —
which is the emotionally correct state for a handmade purchase.

Two rules on how it renders, both of which are §G2 applied to this page:

| Rule | Why |
|---|---|
| The row carries an **expected dispatch date**, not a remaining duration | «Очікувана відправка: 12 жовтня» is checkable. «Залишилось 9 днів» is a number the customer has to re-derive on every visit, and one they will read as a promise |
| **No progress bar and no percentage** | A fortnight of weaving has no measurable progress. A bar stuck at 40% for four days produces exactly the support contact this status was added to prevent. A named state with a date is the whole component |

**This page is also the waiting room for a quoted international order.** An order in
`AWAITING_QUOTE` renders the state as a named timeline step with the `{{QUOTE_SLA_HOURS}}`
deadline beside it, and the moment staff enter the shipping cost the same page grows a payment
control pointing at `{order-seg}/{number}/{pay-seg}` (§5.9.4). That gives the customer a second,
email-independent route to the quote — which matters because a quote email lost to a spam filter
is a lost order, not a lost receipt.

| Drop-off risk | Mitigation |
|---|---|
| Guest cannot find their order | Every transactional email carries the tokenised link; the form is a fallback, not the primary path |
| Order enumeration via sequential numbers | `Order.id` is `cuid2` and `guestToken` is unguessable; the human-facing number alone is never sufficient ([25-database-schema.md](25-database-schema.md) §25.1) |
| Email-existence disclosure via the lookup form | Uniform response regardless of match; magic link for verified access |
| Tracking number present but meaningless | Nova Poshta webhook writes status to `OrderEvent`, rendered as a plain-language timeline rather than a raw carrier code |

**This page is also the repeat-purchase surface** (§5.3) — the feature that makes guest-permanent
sustainable rather than a cap on lifetime value. It carries load that an account panel would
otherwise carry, so its reorder path, its timeline and its return entry point are all
first-class rather than minimal.

**Access is by possession, not by identity**, which is a deliberate security position now that
there is no password to protect. The tokenised link is unguessable (`cuid2`, plus `guestToken`),
the manual form returns a uniform response and emails a magic link rather than granting access
inline, and the lookup endpoint is rate-limited. The threat model is order enumeration, not
credential theft — there are no credentials ([00-client-decisions-2.md](00-client-decisions-2.md)
§E12), which removes customer credential-stuffing exposure from the project entirely.

---

## 5.13 Return and exchange request

```
1  Entry: order status page · /povernennia · confirmation email
   EU orders also: /de/widerrufsformular · /pl/formularz-odstapienia
2  ◆ Within the applicable window?
   ├─ UA order, within {{RETURN_DAYS}}             → 3
   ├─ EU order, within 14 days of delivery         → 3, statutory withdrawal
   │    (the model withdrawal form submits to this same handler —
   │     04-sitemap.md §4.5)
   └─ outside the window → ✕ states the deadline and the delivery date,
                             offers contact anyway
3  Select items and quantity (partial returns supported)
4  ◆ Reason
   ├─ defect / wrong item → seller pays return shipping
   └─ changed mind        → buyer pays return shipping — STATED HERE AND
                            ON THE PDP, never discovered at this step
5  ◆ Return or exchange?
   ├─ exchange → target variant selected; availability checked live
   └─ return   → refund method: original method, or bank details for COD orders
6  Submit → OrderEvent written, admin notified, instructions emailed
7  Admin receives, inspects, approves → refund (§5.16.1) → RETURNED
```

| Drop-off risk | Mitigation |
|---|---|
| Who pays return shipping discovered at the return | Stated on the PDP trust row, at checkout, in the confirmation email, and again at step 4 ([02-ux-research.md](02-ux-research.md) §2.4 A5) |
| Returns handled by phone only, invisibly | A self-serve form keyed to the order, writing to `OrderEvent` so the history is auditable |
| Refunding a COD order has no original payment instrument | The form collects bank details for COD refunds explicitly, at the point it becomes relevant |
| Exchange requested for a one-of-one item | Availability is checked live; an unavailable exchange target converts to a refund offer in the same step rather than in a later email |
| An EU buyer is offered only the Ukrainian returns policy | The 14-day statutory withdrawal right is a separate, non-waivable branch at step 2, and the model withdrawal form routes into this same flow rather than into an email inbox. Two return mechanisms, one handler |
| The refund cannot be executed because the PSP does not support it | **BLOCKED ON V9** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10): whether WayForPay supports refunds and partial refunds via API is unverified. If it does not, step 7 becomes a manual bank transfer for card orders too, which changes the admin workload but not this flow's shape |
| An international buyer expects the duties they paid to come back with the refund | They do not, and step 4 says so for non-UA orders: the shop refunds the goods and, where the return is its fault, the shipping it charged. Destination duties were paid by the buyer to their own customs authority and are reclaimed from that authority, not from the seller — this follows directly from the DAP position in [00-client-decisions-3.md](00-client-decisions-3.md) §F4. Stating it at the return step is late but survivable; **not** stating it before payment is what causes the refusal in the first place, which is why §5.9.3 blocks on it |
| An international return costs more than the goods | A refused or returned parcel from the EU is the most expensive single failure in this document, which is the whole argument for the §5.9.3 disclosure block. The mitigation for the return is the prevention of it |

---

## 5.14 Review submission after delivery

```
1  Trigger: Order.status = DELIVERED + {{REVIEW_DELAY_DAYS}}
2  Email with a tokenised per-item review link
3  Rating (1–5) → title → body → optional photos
4  Submit → Review{ status: PENDING, isVerifiedPurchase: true, orderId }
5  Admin moderates → APPROVED | REJECTED | HIDDEN
6  Published; optional owner reply
```

| Drop-off risk | Mitigation |
|---|---|
| Review page launches empty on a new domain, which reads as no customers | Stated honestly — an empty reviews section that explains it is new is more credible than seeded testimonials. **No imported or fabricated reviews**; there is no migration source ([00-client-decisions.md](00-client-decisions.md) D2) |
| Asking too early, before the product has been used | `{{REVIEW_DELAY_DAYS}}` measured from delivery, tuned per family — bedding needs longer than socks |
| Only `isVerifiedPurchase` reviews should feed the aggregate | Enforced in schema and query, not by convention. An inflated `AggregateRating` is both a structured-data violation and a trust failure ([25-database-schema.md](25-database-schema.md) §25.6) |
| Photo uploads fail on mobile data | Client-side resize before upload, resumable, with a clear per-file progress state |

---

## 5.14b Review from the printed card — the only flow with no on-site entry point

[00-client-decisions-4.md](00-client-decisions-4.md) §G4: «Так, відправляється візитка разом з
посилкою.» **A business card already ships in every parcel.** Nothing needs to be invented, printed
from scratch or added to the packing workflow — the card is already in the box.

§5.14 above reaches the customer who bought online and whose email is on file. This flow reaches
the one the site otherwise cannot reach at all: the **counter-sale customer**, who bought in the
Яворів shop, has no order number, no email in the system, and no prompted route back
([02-ux-research.md](02-ux-research.md) identifies this gap; §G4 closes it).

```
1  Parcel opened, or purchase made at the counter in Яворів
   The card is in the hand of someone holding the product —
   the highest-conversion moment available for a review request
   │
2  ◆ How do they use the card?
   ├─ types the short URL  {{DOMAIN}}/v      ← the older half of a 25–75 audience
   └─ scans the QR to the same URL           ← the younger half
      Print both. The split is real and neither half is small
   │
3  /v → review-and-reorder landing page, locale-resolved
   ([03-information-architecture.md](03-information-architecture.md) §3.5.2)
   │
4  ◆ Do they have an order number?
   ├─ yes → the form accepts it and links the review to the order
   │        → isVerifiedPurchase = true
   └─ no  → they review anyway. THIS IS THE POINT OF THE FLOW
            → Review{ isVerifiedPurchase: false, orderId: null }
   │
5  Rating → title → body → optional photos
   │
6  Admin moderates → APPROVED | REJECTED | HIDDEN (§5.14 step 5)
   │
7  Published, labelled honestly. EXCLUDED from AggregateRating
```

**One short link, no per-order codes.** `{{DOMAIN}}/v` resolving to one landing page — no
personalisation, no variable printing, no per-order QR. Per-order codes would give better
attribution and would require a print workflow this two-person team should not be asked to run
(§G4). The attribution that is available — a `utm_source` on the QR's target, and the branded-search
line in Search Console — is enough to know whether the card works.

**The caveat that must not be worked around.** A review arriving this way has no order linkage, so
`isVerifiedPurchase` stays `false` and it is excluded from the aggregate rating
([25-database-schema.md](25-database-schema.md) §25.6). §G4 states this explicitly and it is
correct. The tempting workaround — accept a typed order number as proof — creates a field anyone can
guess, which is exactly the enumeration surface §5.12's lookup form is rate-limited against. An
unverified review still renders, still carries its honest label, and still does the job the card was
printed for.

| Drop-off risk | Mitigation |
|---|---|
| The URL is mistyped | One character after the domain. `{{DOMAIN}}/uk/vidhuky/zalyshyty` is not a URL anyone types correctly once, which is why `/v` is unprefixed and is the only permitted exception to locale prefixing ([03-information-architecture.md](03-information-architecture.md) §3.5.1) |
| The landing page asks for an order number and the counter-sale buyer has none | The order-number field is **optional and visibly so**. A required field here would reject the exact audience this flow exists for |
| Reviews arrive but the page still shows no rating | Correct and intended. `AggregateRating` stays suppressed until three *verified* reviews exist ([29-seo-architecture.md](29-seo-architecture.md)). The reviews are still visible; the machine-readable claim is not made |
| Nobody reviews because nothing was asked for | The card carries the ask. It is already being paid for, already in the parcel, and reviews are the single scarcest asset at launch — the site starts with zero (D2), there is no social proof anywhere (§E3), and this is the cheapest available fix |

---

## 5.15 Newsletter subscription with double opt-in

Double opt-in is **mandatory for `de`** and is applied to **all locales**, because two subscription
code paths is two chances to leak an unconfirmed address into a German send
([25-database-schema.md](25-database-schema.md) §25.9).

```
1  Entry: footer form · article end · post-purchase checkbox (unticked by default)
2  Email + explicit consent checkbox with plain-language purpose text
3  Submit → NewsletterSubscriber{ confirmedAt: null, locale, source }
4  Confirmation email with a single-use tokenised link
5  ◆ Confirmed?
   ├─ no, within {{OPTIN_EXPIRY_DAYS}} → ✕ row purged. No reminder email:
   │     a reminder to an unconfirmed address is itself an unsolicited send
   └─ yes → confirmedAt set → welcome email → eligible for sends
6  Every send carries a one-click unsubscribe → unsubscribedAt
```

| Drop-off risk | Mitigation |
|---|---|
| Confirmation email lands in spam and the subscriber is lost | The on-site success state says to check spam and names the sender address, which is `{{TRANSACTIONAL_FROM}}` on `{{DOMAIN}}`. SPF, DKIM and DMARC are Phase 0, not Phase 3, and sending from `@gmail.com` is not an option at all — Google publishes neither for third-party senders and its consumer DMARC policy rejects the mail outright ([00-client-decisions-3.md](00-client-decisions-3.md) §F5) |
| Pre-ticked consent at checkout | Unticked by default, always. Pre-ticked consent is invalid under GDPR and is a review rejection |
| Consent evidence not retained | `source`, `locale`, timestamps and the confirmation event are retained as the record of consent |
| A subscriber writes to the list twice | `email` is unique; a re-subscribe on an unconfirmed row resends the confirmation rather than creating a duplicate |

---

## 5.16 Admin flows

### 5.16.1 Fulfilling an order

```
1  Dashboard → new-orders widget → order detail
   │  (international orders arrive in a separate AWAITING_QUOTE queue
   │   with an age counter and an SLA breach flag — §5.9.4)
   │
1a ◆ status = AWAITING_QUOTE?
   ├─ yes → choose carrier · enter shipping cost · send quote
   │        → shippingMinor + totalMinor written, quotedAt set,
   │          status → PENDING, quote email sent
   │        └─ unservable → CANCELLED with a named reason,
   │                        reservation released
   └─ no  → 2
2  ◆ Payment status
   ├─ PAID              → 3
   ├─ COD / UNPAID      → 3 (confirm before packing)
   └─ FAILED            → ⟲ contact buyer; order stays PENDING
3  Verify stock for every line
   └─ ◆ short?
      ├─ yes → contact buyer: partial ship · wait · cancel line.
      │        No silent substitution, ever.
      └─ no  → 4
4  PENDING → CONFIRMED         (OrderEvent + status email)
   │
4a ◆ Any line with madeToOrderDays?
   ├─ yes → CONFIRMED → IN_PRODUCTION
   │        Staff enter the expected dispatch DATE; the customer email
   │        and the status page carry that date, never a duration (§G2)
   │        └─ 14 days of weaving → IN_PRODUCTION → PACKING
   └─ no  → 5
5  CONFIRMED → PACKING
6  Generate the carrier label; trackingNumber written
7  PACKING → SHIPPED           (OrderEvent + shipping email with tracking)
8  Carrier webhook → DELIVERED (OrderEvent) → review trigger (§5.14)
   │
   ├─ ◆ COD order with a return-shipping deposit?
   │  └─ CREDIT depositAppliedMinor HERE, on DELIVERED, exactly once.
   │     Not on SHIPPED — that refunds a deposit for a parcel that may
   │     still be refused. Not twice — that gives away the goods.
   │     Enforced in the state machine, not in this screen (§5.9.1)
   │
   └─ ✕ Refund branch: orders.refund is isDangerous → confirm step →
        PSP refund or manual for COD → PaymentTransaction written →
        PARTIALLY_REFUNDED | REFUNDED → AuditLog
```

**Design mitigations:** every status transition is a single button with the resulting customer email
previewed inline, so staff can see what the buyer will receive before committing. Transitions are
validated against the state machine — `SHIPPED` cannot precede `CONFIRMED`, and no order leaves
`AWAITING_QUOTE` without a shipping cost written, which is what makes the new state worth having
rather than a flag (§5.9.4). Every write goes to
`OrderEvent` and `AuditLog`. Admin motion is capped at `dur-fast`
([13-motion-system.md](13-motion-system.md) §13.11); this screen is used dozens of times a day and
animation that delights on visit one is friction on visit four hundred.

### 5.16.2 Adding a product

```
1  products/new  (or duplicate an existing product — the faster path
                  for a family with many colourways)
2  Core: name, family, SKU, status DRAFT
3  ◆ ORIGIN — a required, separately saved step
   ├─ OWN_MANUFACTURE    → provenance block enabled:
   │                        woolOrigin, woolMicron, productionStage[]
   └─ PARTNER_MANUFACTURE → partnerRegion only («Косівщина», «Гуцульщина»);
                            partnerName is NOT an editable field — partners
                            are never named (§E7);
                            provenance block DISABLED — a partner product
                            cannot assert in-house stages;
                            public label resolves automatically:
                              region set   → «Відібрано Вівчариком» +
                                             «Виготовлено карпатським майстром»
                              region unset → «Відібрано Вівчариком» +
                                             «Виготовлено іншим виробником»
4  Variants: colour × size (+ composition, weight where applicable);
   price, stock, SKU, weightGrams per variant
   └─ by-weight family → PricingUnit = KILOGRAM | SKEIN; the buy box
                         template changes accordingly
   │
4a ◆ allowsCustomSize — the per-product made-to-measure toggle (§H3b)
   ├─ off (default) → 5
   └─ on → four groups of fields become required, and the toggle
           states its consequence inline BEFORE it is saved:
           «Індивідуальний розмір — лише повна передоплата,
            14 днів виготовлення.»
           · customSizeRatePerSqmMinor   — price per m², the owner's
                                           number (§H3c)
           · customSizeMinPriceMinor     — floor, so a 40×40 piece is
                                           not sold below setup cost
           · customSizeMin/MaxWidthCm    — LOOM WIDTH. A physical limit
           · customSizeMin/MaxLengthCm   — frame length. Also physical
           └─ madeToOrderDays = 14, applying ONLY to the custom
              configuration. Standard variants are unaffected
5  Attributes: composition, care, micron, delivery time  (all required per
   00-client-decisions.md D4)
6  Media: ≥1 PRIMARY, gallery, SCALE_REFERENCE;
   PRODUCTION media only where origin = OWN_MANUFACTURE.
   Alt text per locale is required and blocks save
7  Translations: uk required; en/pl/de tracked as completeness, not blocking
8  Publish checks: ≥1 image · ≥1 active variant · composition present ·
   care-guide link present · origin set ·
   IF allowsCustomSize: rate, floor and all four dimension bounds set
9  DRAFT → ACTIVE; priceMin/Max and inStock recomputed in the same transaction
```

**Content migrated from the adjacent business must be rewritten at step 2, not pasted.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E5 permits the products and photographs to be
reused, but that site stays live, so a pasted description puts two live pages in competition and
the zero-authority domain loses. Names are renamed, descriptions rewritten, photographs re-cropped,
re-graded, EXIF-stripped, renamed semantically and given new alt text. Reviews are never migrated.
This is not a validator — no rule can detect a paraphrase — it is a scoped workload, and at several
hundred to roughly a thousand SKUs (§E5) it is the largest single content task in the project
([04-sitemap.md](04-sitemap.md) §4.4b).

**Why origin is a separate, explicitly saved step.** `ProductOrigin` defaults to `OWN_MANUFACTURE`
([00-client-decisions.md](00-client-decisions.md) D3) — correct for the core catalogue, dangerous for
a partner product entered quickly. Forcing an explicit save means a partner product cannot silently
inherit an own-manufacture claim, which is the one data error on this site that is simultaneously a
structured-data violation and a breach of the brand promise.

**Why `partnerName` is removed from the form rather than made optional.** It stays null by ruling
([00-client-decisions-2.md](00-client-decisions-2.md) §E7). An editable field that must never be
populated will eventually be populated — by a new employee who reads a blank required-looking input
as an omission — and the value would then flow into a label or into structured data. Removing the
control is the only version of this rule that survives staff turnover. `partnerRegion` remains
editable because it is genuinely useful and genuinely publishable.

**Why the custom-size toggle states its consequence inline.** Enabling it silently removes cash on
delivery for that configuration and commits the workshop to a fourteen-day build. Staff will not
connect those two facts on their own — the toggle reads like a capability, not like a payment
policy — so the sentence ships with the control
([00-client-decisions-5.md](00-client-decisions-5.md) §H3b,
[23-admin-panel-architecture.md](23-admin-panel-architecture.md)).

**Why the dimension bounds are required rather than optional.** They are physical loom and frame
limits, not preferences (§H3c). Left blank, the shop sells a width that cannot be woven, and the
order dies **after payment** — a refund, an apology, and a customer who waited for nothing. A
required field is cheap; an unmakeable prepaid order is not. The publish check at step 8 refuses a
product with `allowsCustomSize` set and any of the four bounds missing, for the same reason it
refuses a product with no origin.

**Why alt text blocks save.** `MediaTranslation.alt` is a required field by schema design
([25-database-schema.md](25-database-schema.md) §25.4). Making it blocking in the UI is what turns a
schema constraint into an accessibility outcome — it cannot be skipped by an editor in a hurry
populating twelve families across four locales.

### 5.16.3 Inviting an employee

```
1  staff/invite   (permission: staff.invite)
2  Email + first/last name + role
3  ◆ Role
   ├─ system role (owner, administrator, manager, content, …)
   └─ + per-user grants; effect DENY always beats any role ALLOW
4  Send → StaffUser{ status: INVITED }, single-use expiring token, AuditLog
5  ◆ Invitee accepts?
   ├─ expires → ⟲ resend generates a NEW token; the old one is dead
   └─ accepts → set password → status ACTIVE → StaffSession created
6  Lifecycle: ACTIVE → SUSPENDED | BLOCKED | DEACTIVATED
   Deactivation revokes every StaffSession immediately
```

**Design mitigations:** the invite screen shows the **effective permission set** the role grants,
expanded and readable, before sending — a role name alone does not tell an owner what they are
authorising. Dangerous permissions (`Permission.isDangerous`) are visually separated and require an
extra confirmation. Deactivating a staff member preserves their `AuditLog` entries via the
denormalised `actorEmail` ([25-database-schema.md](25-database-schema.md) §25.7), so the trail
survives the person.

---

## 5.17 Tokens introduced by this document

| Token | Meaning | Severity | Flow |
|---|---|---|---|
| `{{COD_CEILING}}` | Order value above which «наложений платіж з оглядом» is unavailable. Domestic only, stocked items only | HIGH | §5.9.1 |
| `{{TRANSACTIONAL_FROM}}` | The sending address for every transactional email. **Must be on `{{DOMAIN}}`** with SPF, DKIM and DMARC published; it cannot be `gif19601@gmail.com` ([00-client-decisions-3.md](00-client-decisions-3.md) §F5). A quoted international order is unrecoverable if this email is spam-foldered | BLOCKER, Phase 0 | §5.1, all emailing flows |
| `{{QUOTE_SLA_HOURS}}` | **Resolved: 48 working hours** (§H2). Customer copy under-promises: «протягом 2 робочих днів» | RESOLVED, confirm before launch | §5.9.4 |
| `{{QUOTE_VALIDITY_DAYS}}` | **Resolved: 72 hours; 36 for one-of-one items** (§H2) | RESOLVED, confirm before launch | §5.9.4 |
| `{{WEBHOOK_GRACE_SECONDS}}` | How long the thank-you page waits for the payment webhook before showing a plain "we will confirm by email" state | MEDIUM | §5.9.2 |
| `{{REVIEW_DELAY_DAYS}}` | Delay from delivery to the review request, per family | LOW | §5.14 |
| `{{OPTIN_EXPIRY_DAYS}}` | Unconfirmed newsletter row lifetime before purge | LOW | §5.15 |

**Resolved by round 2:** `{{PSP}}` → **WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md)
§E10). Dye-lot tracking → **not tracked**, closing the §5.7 question (§E8). Customer accounts →
**never**, closing the §5.3 and §5.12 questions (§E12). `{{SKU_COUNT}}` → several hundred to roughly
a thousand (§E5).

**Resolved by round 3** ([00-client-decisions-3.md](00-client-decisions-3.md)):

| Item | Resolution | Effect |
|---|---|---|
| `{{INTL_CARRIER}}` | **Multiple, quoted per order** (§F4) | Stops being a launch blocker and becomes an operational choice made per parcel. It is replaced as a risk by the §5.9.4 flow and by `{{QUOTE_SLA_HOURS}}` |
| Who pays shipping and duties | **The buyer, everywhere** — effectively DAP (§F4) | §5.9.3's disclosure block; §5.13's refund rule |
| Free shipping abroad | **Never**, at any order value (§F4) | Threshold messaging suppressed on non-UA addresses |
| Partner branding | Partner goods **are** sold under the Вівчарик brand (§F3) | Closes former open question 7. `brand` = Вівчарик on both origins, `manufacturer` omitted for partner goods. No flow above changes; the §5.10 and §5.16.2 disclosure points become more important, not less |
| Public contact email | `gif19601@gmail.com`, interim (§F5) | Usable in §5.5's contact links and on the contact page. **Not** usable as `{{TRANSACTIONAL_FROM}}` |

**Resolved by rounds 4 and 5** ([00-client-decisions-4.md](00-client-decisions-4.md),
[00-client-decisions-5.md](00-client-decisions-5.md)):

| Item | Resolution | Effect |
|---|---|---|
| `{{MADE_TO_ORDER_DAYS}}` | **14 days of production before dispatch** (§G2) | §5.7b, §5.12, §5.16.1. Every appearance carries the transit sentence; every email carries a date, not a duration |
| Prepayment for made-to-order | **Required, in full, online. COD removed server-side** (§H1.1) | §5.1, §5.7b, §5.9.1, §5.9.5. There is no disabled-method state to design |
| Mixed carts | **One order, one parcel, one delivery charge, dispatched after 14 days** ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) | §5.7b step 6 and §5.9.5. The split flow is removed from this document, not deferred. Closes former open question 9 |
| Payment methods, catalogue-wide | **Card everywhere; «наложений платіж з оглядом» Ukraine-only, stocked-only** (§H1.2) | §5.9.1 renamed and rewritten around the inspection right |
| The return-shipping deposit | **Both legs paid online; credited against the goods on acceptance; nothing further on refusal** (§H1.3) | §5.9.1, §5.16.1. Ukraine-only for a legal reason under the EU right of withdrawal |
| `{{QUOTE_SLA_HOURS}}` / `{{QUOTE_VALIDITY_DAYS}}` | **48 working hours / 72 hours; 36 for one-of-one** (§H2) | §5.9.4. The two former blockers on that flow are closed |
| **How a custom size is priced** | **`max(area × owner-set rate per m², floor)`, within physical loom bounds** (§H3c) | **§5.7b is deterministic**, not quote-dependent. The custom-size buy box can show a price, which is what prepayment required |
| Custom-size scope | **Per product, admin toggle** (§H3b) | §5.16.2 step 4a; §5.9.5, because a mixed cart is now the expected case and its disclosure therefore fires often |
| `{{FLOOR_VISIT}}` | **Yes, guided, with Іван, arranged by phone** (§G3) | §5.2 — the offline path now runs in both directions. **No booking flow exists in this document and none may be added**: a calendar implies capacity that does not exist |
| Post-purchase route back to the site | **A business card already ships in every parcel** (§G4) | §5.14b |
| Phone priority | **Іван primary, Любов fallback and ФОП of record** (§G1) | §5.1 — both numbers in every transactional email, Іван first; Любов wherever the seller is named |

Referenced without redefinition: `{{CART_TTL_DAYS}}`, `{{RETURN_DAYS}}`, `{{WHOLESALE_RESPONSE_SLA}}`,
`{{EU_IMPORT_TERMS}}`, `{{FREE_SHIPPING_THRESHOLD}}`, `{{DOMAIN}}`.

**Open questions this document cannot resolve:**

| # | Question | Blocks | Owner |
|---|---|---|---|
| 1 | WayForPay integration mode — hosted redirect, embedded widget, or direct API (**V6**) | §5.9.2 cannot be reduced from two branches to one | §E10 verification, Phase 0 |
| 2 | WayForPay signature field order, webhook payload and acknowledgement (**V7–V8**) | The webhook half of §5.9.2 and §5.16.1 | §E10 verification, Phase 0 |
| 3 | WayForPay refund and partial-refund support (**V9**) | §5.13 step 7 and the §5.16.1 refund branch | §E10 verification, Phase 0 |
| 4 | Non-UAH settlement (**V11**) | §5.9.3 step 6 — whether EU buyers are charged in their own currency or in UAH | §E10 verification, Phase 0 |
| 5 | ~~`{{QUOTE_SLA_HOURS}}` and `{{QUOTE_VALIDITY_DAYS}}`~~ | **Closed by §H2** — 48 working hours, 72 hours validity, 36 for one-of-one. They remain commitments rather than settings and are confirmed before launch | Client confirmation |
| 8 | The return-deposit **copy** — the mechanic and the layout are settled, the exact string is not | §5.9.1 cannot ship until reviewed. It is the one rule on the site that can be misread as a hidden fee ([00-client-decisions-6.md](00-client-decisions-6.md) §J2, §J3 item 1). **The mechanic itself is confirmed and is not provisional**; only the wording awaits sign-off | Client decision |
| 9 | ~~Confirmation of the mixed-cart split into two orders~~ | **Closed by [00-client-decisions-6.md](00-client-decisions-6.md) §J1** — «Надіслати разом.» One order, one parcel, one delivery charge. §5.9.5 is rewritten around the disclosure and the split is removed | Closed |
| 10 | Whether every category may eventually be made to measure | §5.7b's scope. §H4 records that the client has **not** been asked. If the answer is yes, the fourteen-day prepaid path expands considerably and the §5.9.5 disclosure fires on most carts rather than on some | Client decision |
| 6 | `{{EU_IMPORT_TERMS}}` — the per-market **wording** of the customs disclosure | The text inside the §5.9.3 block. **Not** whether it appears, and not who pays: the buyer does (§F4) | Counsel |
| 7 | `AWAITING_QUOTE` as an `OrderStatus` member | §5.9.4's state model. Requested against [25-database-schema.md](25-database-schema.md) §25.5, which is canonical and not amended here | Schema owner |

Items 1–4 are documentation reads, not research projects, and none of them should be guessed —
a guessed payment integration fails silently in production.
