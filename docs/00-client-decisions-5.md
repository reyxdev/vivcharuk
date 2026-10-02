# Client Decisions — Round 5

Received 2026-09-28. **Highest-authority document in the blueprint.**

```
00-client-decisions-5.md    ← this file
00-client-decisions-4.md
00-client-decisions-3.md
00-client-decisions-2.md
00-client-decisions.md
00-existing-site-audit.md   ← adjacent business, reference only
00-assumptions.md
everything else
```

---

## H1 — Payment methods and the return-shipping deposit

The client's answer covers three separate rules. They are separated here because they have
different scopes and one of them is unusual enough to be easy to implement wrongly.

### H1.1 — Made-to-order requires full prepayment

> «Якщо виріб виробляється на індивідуальний розмір (нестандартний), то людина оплачує покупку
> наперед.»

Any item with a non-standard size — `Product.madeToOrderDays = 14`
([00-client-decisions-4.md](00-client-decisions-4.md) §G2) — is **prepaid in full, online.
Cash on delivery is not offered for these.**

This is correct and defensible: the factory commits two weeks of labour to a size nobody else
will buy. But the *reason* must be visible to the customer, or the restriction reads as
distrust:

> «Виріб шиється за вашими розмірами, тому оплата — повна, наперед. Виготовлення — 14 днів.»

Enforcement is server-side. The available payment methods are derived from the cart contents,
never from a client-side flag: if any line has `madeToOrderDays != null`, the COD option is
absent from the response, not merely hidden in the UI.

**Mixed carts.** A cart containing both a stocked item and a made-to-order item cannot be
half-prepaid. Two options:

| Option | Assessment |
|---|---|
| **Force full prepayment on the whole cart** | Simple, and slightly punishes the stocked item |
| ~~Split into two orders~~ | Recommended at the time. **Withdrawn** — it cost the customer a second delivery charge and the business a second parcel, waybill and packing operation. |

> **Superseded by [00-client-decisions-6.md](00-client-decisions-6.md) §J1.** The client chose
> «надіслати разом»: one order, one parcel, one delivery charge, fully prepaid, dispatched after
> 14 days. The split and all its machinery are removed. What survives is the requirement that the
> consequence be explained **before payment** — now satisfied by a disclosure fired at the moment
> the custom item is added to the cart, which is earlier and cheaper for the customer to act on.

### H1.2 — Payment methods across the catalogue

> «На весь вибір товарів має бути оплата: можливість оплатити через інтернет, можливість
> оплатити наложеним платежем після огляду на новій пошті або укрпошті (тільки по Україні).»

| Method | Scope | Notes |
|---|---|---|
| Online card (WayForPay) | All products, all destinations | Only method available outside Ukraine |
| **Наложений платіж з оглядом** — COD with inspection at the branch | **Ukraine only**, stocked items only | Not available for made-to-order (H1.1), not available internationally |

The inspection right («післяплата з оглядом») is a meaningful Ukrainian selling point and
should be stated plainly on the PDP and at checkout, not buried in a policy page. For a buyer
spending 5,000–15,000 UAH with an unfamiliar new brand, the ability to open the parcel at the
Nova Poshta counter before paying removes the single largest objection a cold-start domain
faces.

### H1.3 — The return-shipping deposit — the unusual rule

> «Покупець в любому випадку має оплатити доставку туди і назад прямо на сайті, а далі якщо він
> купить, то ціна за зворотню доставку мінусується від основної ціни товару і покупець оплачує
> лише її.»

**The mechanic.** On a COD-with-inspection order, the buyer pays **both shipping legs online, at
checkout**, before the parcel is sent:

```
At checkout (paid online, by card):
    forward shipping        +  return shipping deposit

At the branch, on inspection:
    ACCEPTS  →  pays (product price − return shipping deposit) as the COD amount
                the deposit is consumed as credit against the goods
    REFUSES  →  pays nothing further
                the return leg is already funded; the parcel comes home at no cost
                to the business
```

**Why this exists.** COD with inspection is the highest-conversion payment method in Ukraine and
also the most abused: a refused parcel costs the seller both legs of carriage and returns stock
that has been handled. Pre-funding the return leg transfers that cost to the person who
triggers it, while costing an honest buyer nothing at all — because if they accept, the deposit
comes straight off what they owe. It is not a fee. It is a refundable-by-offset deposit.

**This must be presented as what it is.** Framed carelessly it reads as "pay extra to be allowed
to look at the product", which would be worse than not offering inspection. Required
construction at checkout:

> «Ви оплачуєте доставку в обидві сторони — {{FORWARD}} + {{RETURN}} ₴.
> Якщо ви залишаєте товар, {{RETURN}} ₴ віднімається від ціни: на пошті ви доплатите
> {{PRICE − RETURN}} ₴ замість {{PRICE}} ₴.
> Якщо не залишаєте — більше нічого не платите.»

Showing the arithmetic with real numbers, not percentages or prose, is what converts a
suspicious-sounding rule into an obviously fair one. A worked example beats any amount of
explanation.

### Schema consequences

```prisma
model Order {
  // …
  shippingForwardMinor  Int?     // forward leg, paid online at checkout
  shippingReturnDepositMinor Int? // return leg, paid online at checkout
  depositAppliedMinor   Int  @default(0)  // credited against goods on acceptance
  codAmountMinor        Int?     // what the customer pays at the branch:
                                 // subtotal − discount − depositAppliedMinor
}
```

`shippingMinor` in [25-database-schema.md](25-database-schema.md) §25.5 is replaced by the two
leg fields for COD orders. The existing nullable `totalMinor` rule still holds.

**The invariant that must be tested:** `depositAppliedMinor` is credited exactly once, on
transition to `DELIVERED`. Crediting it on `SHIPPED` would refund a deposit for a parcel that
is later refused; crediting it twice would give away the goods. This belongs in the order state
machine, not in a controller, and it needs a test.

### Locale scope — this mechanic is Ukraine-only

**It must not be applied to `en`, `pl` or `de` orders**, for a legal reason rather than a
practical one. Under the EU Consumer Rights Directive the buyer has an unconditional 14-day
right of withdrawal, and a trader may not require a deposit against exercising it. Pre-charging
a return leg at checkout for an EU consumer is not permissible in this form.

International orders therefore remain: card only, buyer pays outbound shipping and all customs
charges ([00-client-decisions-3.md](00-client-decisions-3.md) §F4), and return shipping is
handled per the withdrawal rules in the locale's own policy page — not pre-collected.

---

## H2 — Quote turnaround and validity: defaults set

> «Не зрозумів, але зроби сам дуже розумно.»

Sensible defaults chosen, written to be safe for the business rather than impressive to the
customer. **Both are commitments and should be confirmed before launch.**

| Token | Default | Reasoning |
|---|---|---|
| `{{QUOTE_SLA_HOURS}}` | **48 working hours** | A two-person business with a factory to run cannot honestly promise same-day. 48 hours survives a busy week, a weekend and an illness. Promising 24 and delivering 50 is worse than promising 48 and delivering 20. |
| `{{QUOTE_EXPIRY_HOURS}}` | **72 hours** from issue | Long enough for a customer in another timezone to decide over a weekend, short enough that carrier pricing and stock have not moved. |
| One-of-one items | **36 hours** | Half the standard window. Holding a unique lizhnyk for three days on an unaccepted quote blocks a buyer who would pay today. Already specified in [18-checkout-specification.md](18-checkout-specification.md) §18.23.7. |

**Under-promise, over-deliver.** The customer-facing copy says «протягом 2 робочих днів». If the
quote arrives in four hours, that is a pleasant surprise; the reverse is a complaint.

A quote that expires is not a dead order. It moves to a state from which the customer can
request a fresh quote in one click, and the business sees it in the admin queue as a lapsed
opportunity rather than a failure.

---

## H3 — Ownership of international quotes

> «Добре, хай буде.»

Read as acceptance of the proposal. Default assignment:

| Role | Person |
|---|---|
| **Owner of the international quote workflow** | **Гондурак Любов Юріївна** |

Reasoning: Любов is the ФОП seller of record
([00-client-decisions-2.md](00-client-decisions-2.md) §E1), so she already owns the commercial
and contractual side, while Іван owns production and is the primary phone
([00-client-decisions-4.md](00-client-decisions-4.md) §G1). Quoting is a commercial act, and the
person who signs the contract should price the shipping.

`Lead.assignedToId` and the admin quote queue default to her account. Reassignable, and this is a
default rather than a constraint.

Recorded as B16 in [35-implementation-roadmap.md](35-implementation-roadmap.md).

---

## H3b — Custom sizing is per-product, toggled in the admin panel

> «НІ, тільки окремі, можна буде позначити в панелі.»

Only some products can be made to a custom size, and the client will mark them individually in
the admin panel. This is the right model and it confirms `Product.madeToOrderDays` in
[25-database-schema.md](25-database-schema.md) §25.3 as the mechanism rather than a category
rule.

### The refinement this exposes

The client's phrasing — «індивідуальний розмір (нестандартний)» — reveals that made-to-order is
**not a property of the product**. It is a property of *which size the customer picks*:

- Ліжник 150×200 — a standard size, woven, on the shelf, available with cash on delivery.
- The same ліжник at 180×240 — does not exist, takes 14 days, requires prepayment.

One product, two completely different purchases. A single product-level boolean cannot express
that, and modelling it as one would either force prepayment on stocked sizes or permit cash on
delivery on a two-week custom build.

**Required model:**

```prisma
model Product {
  // Admin toggle: "this item can be made to measure". Off by default.
  allowsCustomSize  Boolean @default(false)
  // Applies ONLY when the customer chooses a custom size. Standard variants are unaffected.
  madeToOrderDays   Int?    // 14
}

model OrderItem {
  // Free-form dimensions captured at purchase, e.g. { widthCm: 180, lengthCm: 240 }.
  // Snapshotted like every other order line field — the spec must survive for years.
  customSpec Json?
}
```

The PDP's size selector gains a final option — «Свій розмір» — shown only when
`allowsCustomSize` is true. Selecting it swaps the buy box into made-to-order mode: dimension
inputs appear, the lead time appears, cash on delivery disappears, and the price recalculates
(see the open question below).

### What the admin toggle must warn about

Enabling custom sizing on a product silently removes cash on delivery for that configuration.
Staff will not connect those two facts on their own, so the toggle states the consequence
inline: «Індивідуальний розмір — лише повна передоплата, 14 днів виготовлення.»
[23-admin-panel-architecture.md](23-admin-panel-architecture.md) carries this.

### Consequence for mixed carts

Because the flag is per-product rather than per-category, a cart containing one stocked item and
one custom item is now the **expected** case, not an edge case. That strengthens the
split-into-two-orders recommendation in §H1.1 considerably — without it, a customer buying a
stocked blanket and a custom one waits two weeks for both.

## H3c — Custom-size pricing: owner sets the rate, the system does the arithmetic

> «Щоб можна було вказати в панелі… хай система сама рахує, але ціну вже власник сам вкаже в
> панелі адміністратора.»

The two halves of that answer are not in conflict once separated:

| Who | Does what |
|---|---|
| **Owner, in the admin** | Sets the **rate** — price per square metre — per product |
| **System, at runtime** | Computes the price from the customer's dimensions and that rate |

This is the automatic model recommended in §H5, with the client holding the number. Nobody
quotes by hand, nobody waits, and the owner never loses control of pricing.

### The calculation

```
area_m2   = (widthCm × lengthCm) / 10 000
raw       = area_m2 × customSizeRatePerSqmMinor
price     = max(raw, customSizeMinPriceMinor)
```

Rounded to whole hryvnia, displayed live as the customer types, and recomputed server-side at
checkout. **The browser's number is never trusted** — the client-side figure exists to inform,
the server's figure is what is charged.

### Three guards the admin must also carry

A bare rate is not enough to ship. Each of these prevents a specific, foreseeable failure:

| Field | Prevents |
|---|---|
| `customSizeMinPriceMinor` | A 40×40 cm ліжник priced at 300 ₴, where the setup labour alone costs more than the sale |
| `customSizeMinWidthCm` / `MaxWidthCm` | An order wider than the loom. **The loom width is a physical limit, not a preference** — without it the shop sells something that cannot be woven, and the order must be cancelled after payment |
| `customSizeMinLengthCm` / `MaxLengthCm` | The same at the other axis |

Dimensions outside the permitted range do not produce an error after submission — the inputs
constrain themselves and state the range inline: «Ширина: від 100 до 200 см». A customer should
not be able to type an impossible order in the first place.

### Why not a percentage uplift over the nearest standard size

Considered and rejected. It prices by reference to a size the customer did not choose, so a
180×240 order is priced off 150×200 and the uplift has to grow non-linearly to stay honest.
Rate-per-square-metre matches how the cost is actually incurred — wool consumed and loom hours —
so the owner can reason about the number instead of tuning a multiplier.

### Rate inheritance: a seed value, never a live reference

> «Якщо конкретний ліжник дорожчий/дешевший — власник змінює ставку саме для нього; у базі все
> одно зберігається власна ставка товару.»

Confirmed. The category rate exists **only to pre-fill the field when a product is created**.
The value is then **copied into the product row** and lives there. `Product` is the sole source
of truth at runtime; nothing reads the category rate when pricing an order.

This distinction decides whether a future edit is safe or catastrophic:

| Model | What happens when the owner edits the category rate |
|---|---|
| **Copy on create (chosen)** | Nothing. Existing products keep their own stored rate. Only newly created products pick up the new default. |
| Live fallback (rejected) | **Every product that never overrode the rate is silently repriced.** Including ones deliberately priced months ago by someone who never touched the field because the inherited value happened to be right. |

The rejected model fails precisely because a product whose rate was correct by inheritance is
indistinguishable from one whose rate was correct by decision. Storing the value removes the
ambiguity: if the number is in the product row, someone accepted it.

```prisma
model Category {
  // Seed value for the admin form ONLY. Never read at pricing time.
  defaultCustomSizeRatePerSqmMinor Int?
}
```

Two rules follow, and both belong in
[23-admin-panel-architecture.md](23-admin-panel-architecture.md):

1. The product form shows where the value came from — «успадковано з категорії» until the owner
   changes it, then «встановлено вручну». Otherwise nobody can tell which rates were chosen and
   which were merely inherited.
2. Editing a category rate offers, as an explicit and separately confirmed action, to apply it
   to products that still carry the inherited value. Opt-in, never automatic, never silent, and
   it shows the count before it runs.

Rate changes are audited ([25-database-schema.md](25-database-schema.md) `AuditLog`) and never
retroactive — orders already placed snapshot their price like every other order line.

## H4 — «Всі» — resolved: carriers

Clarified by the client: the answer referred to **international carriers**. All of them are
used — Nova Poshta Global, Ukrposhta International, and others selected per order.

This confirms rather than changes [00-client-decisions-3.md](00-client-decisions-3.md) §F4:
`{{INTL_CARRIER}}` stays resolved as "multiple, quoted per order", which is precisely why
international shipping cannot be calculated live at checkout and why the enquiry-then-invoice
model in [18-checkout-specification.md](18-checkout-specification.md) §18.23.7 exists.

Two readings were explicitly **not** adopted, and remain unasked:

- Custom sizes are still assumed available only where the client has said so, not across every
  category. If every category can be made to measure, the 14-day prepaid path in §H1.1 expands
  considerably and should be confirmed separately.
- The `de`/`pl` wool-only launch recommendation **stands**
  ([00-client-decisions-2.md](00-client-decisions-2.md) §E11). Sheepskin and leather face EU
  species-declaration paperwork and that recommendation has not been overturned.

---

## H5 — Open items

1. **How is a custom size priced?** Per square metre, a percentage uplift over the nearest
   standard size, or a manual quote? Without this the custom-size buy box cannot show a price,
   and a price is required before prepayment (§H3b).
2. Confirm the 48h/72h quote defaults, or replace them (§H2).
3. ~~Confirm the mixed-cart split into two orders (§H1.1).~~ **Closed** — withdrawn in favour of
   shipping together ([00-client-decisions-6.md](00-client-decisions-6.md) §J1).
4. Confirm the return-deposit copy before it ships — it is the one rule on the site that can be
   misread as a hidden fee (§H1.3).
5. `{{LEGAL_ID}}` — supplied on request.
6. `{{DOMAIN}}` — urgent for email authentication
   ([00-client-decisions-3.md](00-client-decisions-3.md) §F5).
7. Heritage-register wording ([00-client-decisions-2.md](00-client-decisions-2.md) §E2).
8. WayForPay V6–V11 ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
9. The Яворів photography shoot, including the shop interior and the workshop as a visitor sees
   it.
10. Instagram before launch — recommended, undecided.
