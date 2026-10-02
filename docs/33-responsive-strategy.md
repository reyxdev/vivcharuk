# 33 — Responsive Strategy

> **Round 13:** the Reviews page is drawn for desktop, tablet (768) and phone (390); laptops 1024–1279 use the desktop layout with two columns — [00-client-decisions-13.md](00-client-decisions-13.md) N2.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Phone: 2 compact cards per row with a reduced card (§part 3); bottom bar Каталог · Кошик · Обране · Зв'язок, replaced by the sticky buy bar on the PDP; floating messenger button desktop only. **The whole admin panel gets phone layouts** (part 8).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - Cart is a side drawer at every breakpoint (full-screen sheet on phones); there is no cart page.
> - The admin mail and warehouse surfaces are phone-first; the admin gains a light theme switch.


Responsive design is usually specified as a list of breakpoints and then improvised. This
document specifies the decisions instead: what the breakpoints mean, which direction the CSS is
authored in, what each page does at each width, and — more importantly — which behaviours are
governed by *capability* rather than by width at all.

> **Authority note.** Written against Round 1 and revised in the consistency audit against
> [00-client-decisions-5.md](00-client-decisions-5.md),
> [00-client-decisions-4.md](00-client-decisions-4.md),
> [00-client-decisions-3.md](00-client-decisions-3.md) and
> [00-client-decisions-2.md](00-client-decisions-2.md), which outrank it. Three earlier rulings
> changed this document: **E3 — no social accounts exist**, which removes Instagram from the
> channel reasoning below; **F2 — the Яворів address is a shop as well as a factory**, which
> promotes the contact page from a utility page to a destination page and earns it its own
> per-page section (§33.4); and **F4 — the buyer pays customs**, whose pre-payment disclosure is a
> responsive constraint on the checkout, not a copy detail (§33.4). `{{SKU_COUNT}}` is also no
> longer open (E5).
>
> **Round 5 adds the two hardest small-screen problems on the project**, and they are hard for the
> same reason: both are *arithmetic a customer must be able to check*, and both live inside
> containers that are already full at 320 px.
>
> | Ruling | Responsive consequence |
> |---|---|
> | H1.3 — **the return-shipping deposit** | Three real numbers must render legibly at 320 px, above the pay button, expanded, never in an accordion. A cramped or truncated version converts a fair rule into a suspected scam. §33.4 |
> | H3b + H3c — **custom size, priced live by area** | Two numeric inputs, a live price, a permitted range and a lead-time notice, inside a buy box that already carries a price and an add-to-cart button. §33.4 |
> | H1.1 — payment methods **derived server-side** | Not a layout rule, but it governs what the checkout's payment step is even allowed to render, so it is stated where the layout is. §33.4 |
> | H1.2 — COD with inspection is **Ukraine-only** | The PDP and checkout carry a locale-conditional payment statement, which is a content-length variable at the width where length is most expensive |
> | G2 — 14 days is **production, not delivery** | The order-status view gains `IN_PRODUCTION`, and a status timeline is a narrow-screen component §33.4 now has to name |
> | G3 — workshop tours, **no booking widget at any breakpoint** | Already applied in the contact-page table. Restated because "at any breakpoint" is a responsive instruction, not a copy one |

**Why mobile leads.** [00-client-decisions.md](00-client-decisions.md) D2 launches on a new
domain with zero authority, and [00-client-decisions-2.md](00-client-decisions-2.md) E3 removes
the Instagram channel that the earlier draft of this note assumed alongside it. What is left —
the Google Business Profile, the existing offline customer base, word of mouth, and footfall
through the Яворів shop ([00-client-decisions-3.md](00-client-decisions-3.md) F2) — is
**more** phone-native than the assumed mix, not less. A visitor arriving from a map pin, or from
a business card handed over in the shop ([00-client-decisions-4.md](00-client-decisions-4.md)
G4), is on a phone and is standing up. Mobile is not a hedge on this project. For the first two
quarters it is the product.

## 33.1 The breakpoint system, restated

Canonical definition lives in [11-spacing-system.md](11-spacing-system.md) §11.3 and is not
redefined here. Restated for reference, with the reason each boundary sits where it does:

| Name | Range | Cols | Gutter | Margin | Max content | Why this boundary |
|---|---|---|---|---|---|---|
| `xs` | 320–479 | 4 | 16 | 20 | fluid | 320 is the floor WCAG 1.4.10 requires at 400% zoom, and the Galaxy Fold's cover display |
| `sm` | 480–767 | 4 | 16 | 24 | fluid | Above 480 a large phone can afford wider margins; the column count does not change because two product columns at 470 px would be 210 px each |
| `md` | 768–1023 | 8 | 24 | 40 | fluid | 768 is portrait tablet. Eight columns, not twelve — see §33.6 |
| `lg` | 1024–1439 | 12 | 24 | 56 | 1120 | Landscape tablet and the 1366×768 budget laptop, which is still a very common Ukrainian office machine |
| `xl` | 1440–1919 | 12 | 32 | 80 | 1320 | The standard design width |
| `2xl` | 1920+ | 12 | 32 | auto | 1440 | Content stops growing; margins absorb the rest (§33.7) |

Two properties of this scale are deliberate and worth stating because they are the parts most
often broken in implementation.

**The column count changes only twice** — 4 → 8 → 12. A scale that changes column count at every
breakpoint produces layouts that cannot be reasoned about, because a "span 3" means something
different at each width. Three column systems is enough to express every layout in this product.

**The max content width is capped well below the viewport.** Editorial line length, not viewport
width, sets the ceiling ([10-typography.md](10-typography.md) §10.4). A 1920 px-wide paragraph is
unreadable regardless of how much screen it fills.

## 33.2 Content-first, not device-first

Device-first thinking asks "what does this look like on a tablet?". Content-first asks "at what
width does this content stop working?". The second question produces breakpoints that survive new
hardware; the first produces breakpoints that were obsolete when the iPad Mini shipped.

**This project is content-first, with a device-named scale for communication only.** The names
`xs`…`2xl` exist so designers and engineers can talk to each other. They do not imply that `md`
is "the tablet layout".

The practical consequence is that **components may declare their own breakpoints** where the
content demands it, and those are not required to align with the global scale. Concretely:

| Component | Its own breakpoint | Why |
|---|---|---|
| `ProductCard` | Switches from stacked to horizontal at its own container width of 480 px | It appears in the grid, in the cart drawer at 420 px, and in search results. Global breakpoints cannot describe all three |
| `VariantSelector` | Size grid wraps at a swatch-count threshold, not a viewport width | A product with 3 sizes and a product with 14 need different wrap points at identical viewports |
| Spec table | Collapses to definition-list rows below 520 px of available width | It sits in a full-width column on the PDP and in a narrow column on the comparison view |

These use container queries (`@container`), not media queries. A component that asks about the
viewport when it should be asking about its own box is the root cause of most "it breaks in the
drawer" bugs.

Global media queries remain the tool for page-level structure: how many grid columns, whether the
sidebar exists, whether the header shows a utility strip.

## 33.3 Authoring order: mobile-first

CSS is authored narrow-first, with `min-width` queries only. `max-width` queries are permitted in
exactly two cases, listed below, and are otherwise a review rejection.

The justification is not that mobile traffic is larger, although it is
([02-ux-research.md](02-ux-research.md) §2.7, and reinforced by the map-pin-and-footfall channel
mix in the authority note above). It is
that **the narrow viewport forces the content-priority decision, and that decision is then reused
everywhere else**. If the design decides what must be visible at 360 px, it has decided the
hierarchy of the page. A desktop-first design defers that decision and then makes it under
pressure, badly, by hiding things.

Mobile-first also produces the correct cascade for progressive enhancement: the base stylesheet is
the simplest layout, and each `min-width` query adds complexity. A small phone on a poor mountain
connection parses the smallest amount of CSS that is relevant to it.

**The two permitted `max-width` exceptions:**

1. Suppressing a desktop-only behaviour that cannot be expressed as an addition — e.g. disabling a
   `position: sticky` sidebar below `lg`.
2. Print styles.

**One page is designed desktop-first and authored mobile-first.** The wholesale page's content —
a capacity table, a specification grid, a multi-field qualification form — is genuinely denser, and
its audience is desktop-dominant ([02-ux-research.md](02-ux-research.md) §2.7). The *design* starts
at `xl`; the *CSS* is still narrow-first. Design order and authoring order are different decisions
and conflating them is why "desktop-first" projects end up with unmaintainable stylesheets.

## 33.4 Per-page responsive behaviour

### Homepage

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Hero | Full-bleed, 78dvh, headline over scrim, one CTA | 72dvh, two-line headline | 88dvh, `display-xl`, ambient fog layer enabled |
| Hero media | `mobileMediaId` portrait crop, `focalPoint`-anchored | Landscape crop | Landscape, video where available |
| Category entry | Horizontal snap-scroll rail, 3 wool groups | 2 × 3 grid | 3-up grid with `Category.heroMedia` |
| Production teaser | Stacked image → text | Side by side, 50/50 | Asymmetric editorial grid, image bleeds to edge |
| Featured products | Snap-scroll rail, 1.2 cards visible | 3-up grid | 4-up grid |
| Trust row | 2 × 2 stacked | 4 across | 4 across with photography |
| Parallax | Disabled | Disabled | Enabled, ≤3 elements ([13-motion-system.md](13-motion-system.md) §13.4) |

Featured rails show `origin = OWN_MANUFACTURE` only, at every width
([00-client-decisions.md](00-client-decisions.md) D3 rule 5). That is a content rule, not a
layout rule, and it does not relax on a narrow screen.

### Category / listing

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Grid | 2 columns | 3 columns | 4 columns (`xl`+: 4, `2xl`: 5 within 1440 max) |
| Filters | Bottom sheet, triggered by a sticky button (§33.5) | Bottom sheet | Persistent left rail, 3 of 12 columns, sticky |
| Sort | Inside the filter sheet | Inside the sheet | Inline select, top-right |
| Active filters | Horizontal chip rail under the header | Chip rail | Chip rail above the grid |
| Result count | In the sticky filter button | Above grid | Above grid |
| Pagination | Load-more button | Load-more | Numbered pagination + load-more |

Two-column at `xs` rather than one: at 360 px each card is ~164 px, which is enough for a
recognisable textile photograph, and a single column turns a 40-product category into a
2,000 px scroll. The trade is a smaller price and a truncated title, both acceptable because the
photograph is the scanning target here.

`{{SKU_COUNT}}` is **resolved** by [00-client-decisions-2.md](00-client-decisions-2.md) E5: the
catalogue follows what is migrated from the adjacent business's range, in the order of several
hundred to roughly a thousand SKUs across sixteen category nodes. That answers the question the
earlier draft left open, and it answers it in the direction that costs work: **the bottom sheet
needs internal sectioning and search-within-filters.** A flat facet list is defensible at forty
products and unusable at a thousand, where a visitor scrolls a sheet looking for a colour group
they cannot see. Sectioned facets with collapsed groups and a filter-search field are therefore
`xs`-first requirements, not a `lg` refinement — the narrow viewport is where a long facet list
fails first.

### Product page

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Gallery | Full-bleed swipe carousel with dot indicators | 60% width, thumbnails below | 7 of 12 cols, vertical thumbnail strip, click-to-zoom |
| Buy box | Below gallery, in flow | Right column, not sticky | 4 of 12 cols, sticky within the section |
| Add to cart | **Bottom sticky bar** once the in-flow button scrolls out (§33.5) | In-flow | In-flow, inside sticky buy box |
| Origin badge | Always visible, immediately under the title — never below the fold at any width | as `xs` | as `xs` |
| Variant selector | Full-width swatches, 48 px, 8 px gaps | as `xs` | as `xs` |
| **«Свій розмір» option** (H3b) | Final option in the size selector, full-width, visually separated by a hairline. Rendered only when `Product.allowsCustomSize` | as `xs` | as `xs` |
| **Custom-size buy box** (H3c) | Expands in place below the selector. Specified separately below | as `xs` | as `xs`, inside the sticky column |
| By-weight input | Numeric weight field + unit, **not** a stepper, `inputmode="decimal"` | as `xs` | as `xs` |
| Payment-method line | One line, locale-conditional: «Оплата картою» or, in `uk` on a stocked item, «Картою або наложеним платежем з оглядом» | as `xs` | as `xs` |
| Spec table | Definition-list rows | Two-column table | Two-column table |
| Provenance block | Stacked, images full-bleed | Side by side | Editorial asymmetric grid |
| Reviews | Stacked, 3 visible + more | 2 columns | 2 columns with summary sidebar |

The weight input is a real divergence: пряжа, ровниця and вовна для рукоділля are sold by weight
(D4), and a plus/minus stepper is the wrong control for a continuous quantity. On mobile it is the
difference between a usable purchase and an abandoned one, because a stepper tapped 14 times to
reach 1.4 kg is not a purchase flow.

The payment-method line is one line and it earns it. [00-client-decisions-5.md](00-client-decisions-5.md)
H1.2 asks for the inspection right to be «stated plainly on the PDP and at checkout, not buried in
a policy page», and the reason is commercial rather than informational: for a buyer spending
5,000–15,000 ₴ with a brand they have never heard of, being able to open the parcel at the counter
before paying is the single largest objection removed. At 320 px it is the cheapest trust signal
available — one line, no graphic, no accordion — and it is the line that must survive when
something has to be cut.

#### The custom-size buy box at 320 px

[00-client-decisions-5.md](00-client-decisions-5.md) H3b makes made-to-order **a property of the
size, not the product**: the same ліжник is stocked at 150×200 and a fourteen-day build at
180×240. H3c then makes the price deterministic — the owner sets a rate per square metre in the
admin, the system computes `max(area × rate, floor)` and shows it live. Selecting «Свій розмір»
therefore does not open a form; it **swaps the buy box into a different mode**.

```
  xs / sm — 320px, content box 280px
┌────────────────────────────────────┐
│ Розмір                             │
│ [150×200] [170×210] [200×220]      │  48px swatches
│ ──────────────────────────────     │
│ [       Свій розмір        ] ✓     │  48px, selected
├────────────────────────────────────┤
│ Ширина, см        Довжина, см      │  labels, 14px caption
│ ┌──────────────┐ ┌──────────────┐  │  two inputs, 50/50, 12px gap
│ │ 180          │ │ 240          │  │  56px, 16px text, inputmode numeric
│ └──────────────┘ └──────────────┘  │
│ від 100 до 200    від 150 до 260   │  range hint, ALWAYS visible
├────────────────────────────────────┤
│ 4,32 м²                12 300 ₴    │  area left, price right
│                    ▔▔▔▔▔▔▔▔▔▔▔▔    │  ← reserved width, 9ch tabular
├────────────────────────────────────┤
│ ⚙ Виготовлення — 14 днів.          │
│   Далі — доставка перевізником.    │
│ ⚙ Оплата повна, наперед, карткою.  │
├────────────────────────────────────┤
│ [      Додати в кошик         ]    │  56px
└────────────────────────────────────┘
```

Seven decisions in that frame, each of which has a wrong version that looks reasonable:

| Decision | Why the obvious alternative is worse |
|---|---|
| **Two inputs side by side, 50/50, not stacked** | Stacked costs 68 px of the most contested vertical space on the page and separates two numbers that are read as a pair. At 280 px of content box, two 134 px fields still clear the 48 px target with room for four digits at 16 px. This is the one place in the document where side-by-side survives 320 px and stacking is the error |
| **`inputmode="numeric"`, `type="text"`, `pattern="[0-9]*"`** | `type="number"` brings spinners nobody can hit at 48 px, silent scroll-wheel mutation, and inconsistent locale decimal handling. Dimensions are integers in centimetres, so the numeric keypad is exactly right and the decimal pad is not |
| **16 px minimum input text** | Below 16 px iOS Safari zooms on focus, which reflows the whole buy box mid-typing and scrolls the live price off screen. This is the same rule the checkout already carries; it matters more here because the user types twice and watches a number between the two |
| **The permitted range is visible before typing, not after** | H3c is explicit that the bounds are **physical loom and frame limits, not preferences** — a width the loom cannot weave is an order that dies after payment. An inline hint under each field costs one caption line; an error revealed after submission costs a correction cycle on a phone keyboard, and teaches the buyer that the shop does not know its own limits. The inputs additionally clamp on blur, so the range is a statement rather than a trap |
| **The live price occupies reserved width** | `5 400 ₴` and `12 300 ₴` are different string lengths. A price that reflows its own row while the customer is still typing reads as instability at exactly the moment they are deciding whether to trust an arithmetic they did not perform. The price cell is `min-width: 9ch` with `tabular-nums` ([10-typography.md](10-typography.md) §10.6) and is right-aligned, so digits change in place and nothing else moves |
| **The computed area is shown, not hidden** | `4,32 м²` is what makes the price checkable. Without it the number is asserted; with it the customer can verify the shop is charging by area rather than by whim, and the rate becomes inferable — which is the point. It costs no extra row because it shares the row with the price |
| **Both notices are plain rows, never an accordion** | G2 rule 2 puts the lead time in the buy box rather than in a tab, and H1.1 requires the prepayment restriction to carry its reason — «виріб шиється за вашими розмірами» — or it reads as distrust. Two short rows, always expanded. A visitor must not discover either fact at checkout, and must never discover them after paying |

At `md` and above the same block renders at the same internal proportions inside the wider buy-box
column. **There is no desktop-only enhancement here and that is deliberate:** the block is already
at its useful maximum at 320 px, and anything added at `lg` would be information a phone buyer was
denied. The only width-dependent change is that the range hints may sit inline with their labels
above 480 px of container width, saving one line via `@container` rather than a media query
(§33.2).

**The sticky bottom bar and the live price must never disagree.** The bar (§33.5) shows the
current variant price; in custom-size mode that price is a function of two fields the customer is
actively editing. Both read the same computed value from the same store
([28-state-management-architecture.md](28-state-management-architecture.md)), and the bar's price
updates on the same tick. While either dimension is empty or out of range, the bar's button reads
**«Вкажіть розміри»** and scrolls to the first input rather than being inert — the same
disabled-button rule §33.5 already applies to an unselected variant
([08-design-system.md](08-design-system.md) §8.5). A bar showing the stocked price while the buy
box shows a custom one is the specific failure this paragraph exists to prevent, and it is only
possible on a phone, because only on a phone are the two separated by a scroll.

The browser's number is never the charged number. H3c requires the price to be recomputed
server-side at checkout; the live figure informs, the server's figure bills. The responsive
consequence is small but real — the buy box must not present the live price with any affordance
implying it is locked, so no "price guaranteed" badge and no countdown.

### Checkout

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Layout | Single column, `container-form` | Single column, centred | Two columns: form 7, sticky summary 5 |
| Order summary | Collapsed accordion at the top, showing total | Collapsed accordion | Always expanded, sticky |
| Step indicator | Compact "Крок 2 з 4" text | Horizontal stepper | Horizontal stepper |
| **Customs and duty notice**, international destinations | **Expanded block above the pay button. Never an accordion, never a footnote, at any width** | as `xs` | as `xs` |
| **Return-deposit arithmetic**, `uk` COD orders | **Expanded block above the pay button. Never an accordion, at any width.** Specified separately below | as `xs` | as `xs` |
| Payment-method list | Full-width radio rows, 56 px, each with its own one-line explanation | as `xs` | as `xs` |
| **Mixed-cart split notice** | Expanded block above the payment step, before any method is chosen | as `xs` | as `xs` |
| Primary action | Full-width, 56 px, in flow at the end of the step | Full-width within the form column | Right-aligned, `lg` size |
| Field width | 100% | 100% | 100% of the form column |

**The payment-method list is derived server-side, and this is a responsive constraint as well as a
security one.** [00-client-decisions-5.md](00-client-decisions-5.md) H1.1: if any cart line has
`madeToOrderDays != null`, the COD option is **absent from the response**, not hidden in the UI.
The layout consequence is that this component has no client-side filtering step and therefore no
intermediate state to lay out — no greyed-out row, no "unavailable for your cart" disclosure, no
tooltip explaining an option that is visible but unusable. At 320 px that matters: a disabled row
with an explanation costs two lines and invites a tap that does nothing, which
[02-ux-research.md](02-ux-research.md) §2.6 identifies as the interaction this audience recovers
from slowest. The narrow viewport gets a list of methods that all work. Locale does the same job
for COD, which is Ukraine-only (H1.2) and likewise absent rather than suppressed for `en`, `pl`
and `de`.

### The mixed cart, disclosed at the add rather than at checkout

H3b makes a mixed cart the **expected** case rather than an edge case: because
`allowsCustomSize` is per-product, a buyer can put a stocked ліжник and a custom one in the same
cart in two taps.

An earlier revision of this section specified a split-order screen — two stacked cards, one per
order. **[00-client-decisions-6.md](00-client-decisions-6.md) §J1 withdrew the split.** A mixed
cart is one order, one parcel, one delivery charge, fully prepaid, dispatched after fourteen
days. There is no second card to lay out, which removes the layout problem entirely and replaces
it with a timing problem.

**The timing problem is the harder one.** Adding a made-to-measure item changes the terms of the
item already in the basket: a stocked ліжник that was available on cash-on-delivery and shipping
tomorrow becomes prepaid and ships in two weeks, because of a different line. At checkout that
reads as a bait-and-switch. So the disclosure fires **at the moment the custom item is added**,
inside the add-to-cart confirmation, where the buyer still has every cheap option open.

At `xs` it renders as a single block, never a table:

```
┌────────────────────────────────────┐
│ ✓ Додано до кошика                 │
│   Ліжник «Мозаїка» 180×240         │
│                         12 300 ₴   │
├────────────────────────────────────┤
│ У кошику є виріб на індивідуальний │
│ розмір. Усе замовлення відправимо  │
│ разом, коли він буде готовий —     │
│ через 14 днів.                     │
│ Оплата — повна, наперед.           │
│                                    │
│ Потрібен ліжник зі складу раніше?  │
│ Оформіть його окремим замовленням. │
├────────────────────────────────────┤
│ [ До кошика ]   [ Далі за покупками]│
└────────────────────────────────────┘
```

Three responsive rules govern it:

1. **The three facts keep their order at every width** — shipped together, fourteen days, full
   prepayment. That is the order in which the buyer's questions arrive, and reflowing at `md`
   into a two-column arrangement would break it.
2. **The escape is body text, never a button.** The site does not split anything on the
   customer's behalf, so there is no control to lay out. A button here would have to do
   something, and the thing it would do is the withdrawn split.
3. **Announced via `aria-live="polite"`**, because the consequence is invisible: a screen-reader
   user has just added one item and the terms of a different item changed.

Above `md` the block is wider but not restructured. It is **never** collapsed at any width, for
the same reason as the customs notice — it changes what the customer is agreeing to pay and
when, and collapsing secondary-looking content is the standard mobile move this document keeps
having to forbid.

A persistent, quieter restatement rides in the cart and at checkout, so a buyer who dismissed the
confirmation is never surprised later.

### The return-shipping deposit — the hardest responsive problem on this project

[00-client-decisions-5.md](00-client-decisions-5.md) H1.3. On a Ukrainian COD-with-inspection
order the buyer pays **both shipping legs online at checkout**. If they accept the parcel at the
counter, the return leg is credited against the goods and they pay `price − deposit` there. If
they refuse, they pay nothing further.

The mechanic is fair. **The entire risk is the wording, and at 320 px the wording is a layout
problem.** Framed carelessly — or truncated, or wrapped badly, or hidden behind «Детальніше» — it
reads as *pay extra for permission to look at the goods*, which is worse than not offering
inspection at all. H1.3 is explicit that only a worked example in real numbers converts a
suspicious-sounding rule into an obviously fair one: never prose, never percentages.

That gives this block a property no other block in this document has: **its correctness depends on
three numbers being simultaneously visible and vertically aligned.** A rule you must scroll to
finish reading is a rule you finish reading suspicious.

```
  xs — 320px, content box 280px
┌────────────────────────────────────┐
│ Наложений платіж з оглядом         │  16px semibold
│                                    │
│ Зараз, карткою:                    │  15px muted
│   доставка туди         120 ₴      │  ← label left, number right
│   доставка назад        120 ₴      │     tabular-nums, decimal-aligned
│   ─────────────────────────────    │
│   разом                 240 ₴      │  semibold
│                                    │
│ На пошті, після огляду:            │  15px muted
│   ціна товару         7 400 ₴      │
│   мінус доставка назад −120 ₴      │
│   ─────────────────────────────    │
│   до сплати           7 280 ₴      │  17px semibold, --text-primary
│                                    │
│ Якщо не заберете — більше нічого   │  15px
│ не платите. Посилка повернеться    │
│ за вже оплаченою доставкою.        │
└────────────────────────────────────┘
        [   Оплатити 240 ₴   ]          56px, immediately below
```

**Layout at every breakpoint, and why each is what it is:**

| Breakpoint | Layout | Justification |
|---|---|---|
| `xs` 320–479 | Single column. Two labelled groups, each a label/number pair list with a rule and a total. Labels left, numbers right-aligned on a shared edge, `tabular-nums`. Block height ≈ 300 px, entirely above the pay button | This is the design target, not the fallback. Everything else is this layout with more room. Numbers on a shared right edge is what makes `7 400`, `−120` and `7 280` legible as a subtraction rather than as three unrelated figures — the vertical alignment *is* the explanation |
| `sm` 480–767 | Identical. No change | The content is at its minimum honest length already. Widening the block would only lengthen the measure past the point where a two-word label helps |
| `md` 768–1023 | Identical, inside the centred single-column form. Optionally the two groups sit side by side once the container exceeds 600 px, via `@container` | Side by side is permitted here **only** because the groups are sequential in time — "now" then "at the counter" — and left-to-right preserves that order in an LTR locale. If the `de` or `pl` labels wrap, it reverts to stacked; this is a container query precisely so the decision is made on real measured width (§33.2) |
| `lg`+ 1024+ | Stacked or side by side per the same container rule, inside the 7-column form column — **not** in the sticky 5-column summary | The summary is scannable chrome; this block is an argument that must be read once, in sequence, next to the button it justifies. Moving it into the summary at wide widths would be a different reading experience for desktop buyers than for phone buyers, and the whole point is that one wording has been agreed |

**Five prohibitions, each guarding a specific failure:**

1. **Never an accordion, never «Детальніше», at any width.** A rule about money that the customer
   must open is a rule the customer assumes was hidden on purpose. This is the same ruling the
   customs notice already carries, and it is stronger here because this notice describes a charge
   the customer is about to authorise rather than one that arrives later.
2. **Never below the pay button.** The block is the justification for the amount on the button. A
   justification the reader meets after the action is not a justification.
3. **The numbers never wrap away from their labels.** Each row is a flex pair with the label
   allowed to wrap to two lines and the number never allowed to. A `120 ₴` that has wrapped onto
   its own line has left the arithmetic.
4. **No horizontal scroll, no shrunk type, no `font-size` below 15 px.** §33.10's rule that any
   component needing more than 280 px is redesigned rather than scrolled applies here with no
   exception available. If a locale's labels do not fit, the labels are shortened — the layout is
   not.
5. **The word «депозит» does not appear.** It is accurate and it is the single worst available
   framing. The block says what is paid, when, and what comes off — three facts and three numbers.
   H1.3's required construction is the floor, not a starting point for copywriting.

**Why this is harder than the customs notice.** The customs disclosure is a single sentence that
can wrap freely; its only responsive requirement is to be visible. This block is a *calculation*,
and a calculation has an internal spatial structure — alignment, grouping, a subtraction that must
be seen as a subtraction — that survives narrowing far less gracefully than prose does. It is the
one component on the site where getting the 320 px layout wrong does not degrade the experience
but inverts the meaning.

**It is Ukraine-only and must not render for `en`, `pl` or `de`.** Under the EU Consumer Rights
Directive a trader may not require a deposit against the exercise of the unconditional 14-day
right of withdrawal. The block is absent for those locales because the payment method it belongs
to is absent, which is the server-side derivation above doing its job — there is no locale branch
in this component at all.

**The duty notice is the one responsive rule in this document that is a commercial requirement
rather than a layout preference.** [00-client-decisions-3.md](00-client-decisions-3.md) F4 puts
shipping, customs, duties and import VAT on the buyer, DAP, and requires the disclosure **before
payment, not after** — «Ціна не включає митні збори та податки країни призначення.» The narrow
viewport is precisely where that rule gets broken, because collapsing secondary content into an
accordion is the standard mobile move and this block reads like secondary content. It is not: an
EU buyer surprised by an import VAT bill refuses the parcel, and the shop absorbs a return
shipped from another country. The block therefore renders expanded at 320 px, above the pay
button, inside the same vertical rhythm as the order total — and it is the one place where the
order summary's collapsed-accordion treatment does **not** extend to what sits next to it.

International orders also take the enquiry-then-invoice path (F4), so the `xs` layout must carry
a step that has no domestic equivalent: order submitted, awaiting quote, pay later. That state is
rendered as a named step with its SLA date, not as a spinner — the mobile pattern for "nothing to
do right now" is a dated timeline entry, because a screen offering no action and no date reads as
a failure. The date comes from [00-client-decisions-5.md](00-client-decisions-5.md) H2: the
internal SLA is 48 working hours, and the customer-facing string under-promises deliberately —
«протягом 2 робочих днів». One-of-one items get 36 hours of quote validity rather than 72, and at
`xs` that shorter window is rendered as an absolute date and time, never as a relative countdown.
A live countdown on a phone is a pressure device, and it is also wrong the moment the tab sleeps.

### Order status at `xs`, and the fortnight that has to be visible

[00-client-decisions-4.md](00-client-decisions-4.md) G2 adds `OrderStatus.IN_PRODUCTION` between
`CONFIRMED` and `PACKING`, because a customer who paid for a custom ліжник and sees «Підтверджено»
for twelve days assumes the order is stuck. The responsive consequence is specific: the status
view is reached from an email link, on a phone, by someone who is checking rather than shopping.

| Element | `xs`/`sm` | `md`+ |
|---|---|---|
| Status timeline | Vertical, one row per state, current state expanded with its date, past states collapsed to a line and a tick | Vertical, all rows showing dates |
| `IN_PRODUCTION` row | Carries the **expected dispatch date**, not the remaining duration | as `xs` |
| Progress affordance | None. No bar, no percentage | None |

Two rules, both of which are G2 applied to a narrow screen. **The row states a date, not a
duration** — «Очікувана відправка: 12 жовтня» is checkable, «залишилось 9 днів» is a number that
needs recomputing and that a customer will read as a promise. And **there is no progress bar**,
because a fortnight of weaving has no measurable percentage and a bar stuck at 40% for four days
generates the support contact the status was added to prevent. A named state with a date is the
entire component.

The same section must never present the fourteen days as delivery time. G2 rule 1 is absolute:
«Виготовлення — 14 днів. Далі — доставка перевізником.» At `xs` the temptation is to compress that
to one line by dropping the second sentence, and the second sentence is the one that prevents a
complaint on day fifteen. If the line must be shortened, the first half goes, not the second.

Checkout never uses a bottom sticky action bar. The primary action must sit at the *end* of the
step's content, because a persistent "Продовжити" button invites submission before the fields
below it have been seen — and [02-ux-research.md](02-ux-research.md) §2.6 notes this audience
recovers from errors slowly. This is a deliberate inconsistency with the PDP and it is the right
one.

All fields carry `autocomplete` and correct `inputmode` ([08-design-system.md](08-design-system.md)
§8.6). 16 px minimum font size on every input, which also prevents iOS zoom-on-focus — a
responsive bug that masquerades as a design bug. That rule now has two places where it is
load-bearing rather than hygienic: the checkout's address fields, and the custom-size dimension
inputs on the PDP, where a zoom triggered mid-typing reflows a live price the customer is watching.

### Wholesale

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Design origin | Reflowed from the desktop design | Reflowed | **Designed here first** (§33.3) |
| Capacity table | Horizontal scroll inside a bounded container, with a visible scroll affordance | Horizontal scroll | Full table |
| Offer blocks (опт, приватна марка, партнерство) | Stacked accordions | 2-up | 3-up |
| Qualification form | Single column, grouped into 3 fieldsets | Single column | Two columns, 5 of 12, beside the offer summary |
| Own-manufacture filter link | Present | Present | Present |

The capacity table scrolls horizontally rather than collapsing to cards. A B2B buyer comparing
volumes across rows needs the rows aligned; card-per-row destroys exactly the comparison the table
exists to support. The scroll container gets a right-edge gradient and `aria-label` plus
`tabindex="0"` so it is keyboard-scrollable.

### Production page

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Stage sequence | Vertical stack, one stage per viewport, images full-bleed | Vertical with alternating alignment | Horizontal scrollytelling, pinned media, scroll-driven stage progression |
| Scroll-linked animation | Disabled — vertical reveals only | Disabled | Enabled via `animation-timeline: view()` with a `useScroll` fallback |
| Video | Poster + explicit play control | Poster + play | Autoplay muted, `saveData`-aware |
| Ambient wind layer | Off | Off | On, per [13-motion-system.md](13-motion-system.md) §13.7 |

Horizontal scrollytelling is a `lg`+-only enhancement, not a responsive adaptation. The mobile
version is a different, simpler composition that tells the same story vertically — attempting to
translate a pinned horizontal sequence to a 360 px screen produces something that is both
expensive and worse.

### Contact page — a destination page, and the most mobile page in the product

[00-client-decisions-3.md](00-client-decisions-3.md) F2 promotes `/kontakty` from a utility page
to a **destination page**: the Яворів address houses retail and production together, so the page
is no longer "here is a form" but "here is a place you can visit, and here is what you will see".
[00-client-decisions-4.md](00-client-decisions-4.md) G3 adds the tour — the workshop can be
viewed **with the owner, arranged in advance by phone**.

That changes the responsive priority order, and it changes it more than any other page in this
document. The visitor most likely to load this page is holding a phone, is possibly in a car in
the Carpathians, and wants one of three things in this order: **call, route, opening reality**.

| Element | `xs`/`sm` | `md` | `lg`+ |
|---|---|---|---|
| Phone CTAs | **First interactive element, above the fold, full-width, 56 px.** Іван primary, Любов labelled as the fallback (G1) | Side by side | Side by side, beside the address block |
| «Прокласти маршрут» | Full-width, directly under the phones | as `xs` | Inline with the address |
| Address block | Single column, selectable text, byte-identical to the GBP listing | Single column | Two columns beside the map |
| Flexible-hours line | Always visible, never collapsed. «Графік гнучкий — телефонуйте перед візитом» + the GBP link as the authoritative source | as `xs` | as `xs` |
| Workshop tour block (G3) | Stacked below the phones; a statement plus the same `tel:` link, **no booking widget at any width** | Stacked | Beside the visit photography |
| What you will see on site | Snap-scroll photo rail, 1.2 images visible | 2-up | 3-up editorial grid |
| Map | Lazy, static image with an explicit "open in Maps" control | Static image | Interactive embed, consent-gated |
| Enquiry form | Below everything above, single column | Single column | Two columns beside the address |

Three rules follow from the page's new job:

1. **The form is demoted below the fold on mobile and that is deliberate.** A destination page's
   primary action is a phone call, not a message into a queue. The form still exists for the
   buyer who is not ready to talk, which is why it is present rather than removed.
2. **Hours are never rendered as a schedule, at any width** ([00-client-decisions-2.md](00-client-decisions-2.md)
   E3). The page carries one honest sentence and a link to the live source. There is no
   responsive treatment of an opening-hours table because there is no opening-hours table.
3. **The map is never the LCP element.** A destination page that spends its first paint on a
   third-party embed is slow on exactly the mountain connection its visitors are using. The
   address is text, the map is an enhancement, and the static-image fallback is what ships
   above `lg`.

### Admin panel

Specified fully in §33.13. Summary: `xs` is a task-focused subset, `md`+ is the full application.

## 33.5 Mobile commerce patterns

### Bottom sticky cart bar (PDP only)

```
┌────────────────────────────────┐
│                                │
│        page content            │
│                                │
├────────────────────────────────┤
│ 7 400 ₴   [  Додати в кошик  ] │  64px + safe-area-inset-bottom
└────────────────────────────────┘
```

| Property | Value |
|---|---|
| Appears | Only after the in-flow add-to-cart button scrolls out of view, detected with `IntersectionObserver` |
| Contents | Current variant price and the primary action. Nothing else — no quantity, no wishlist, no share |
| Height | 64 px plus `env(safe-area-inset-bottom)`, so it clears the iOS home indicator |
| Entrance | `translateY(100%) → 0`, `dur-base`, `ease.out`; reduced motion fades |
| Disabled state | When no variant is selected, the button reads «Оберіть розмір» and scrolls to the selector rather than being inert — a disabled button that does not say why is banned ([08-design-system.md](08-design-system.md) §8.5) |
| Not used on | Checkout, cart, category, wholesale |

### Bottom sheet filters (category only)

Bottom sheet rather than a full-screen modal or a side drawer, for one reason: the controls stay in
the thumb zone. A full-screen filter modal puts its "Застосувати" button at the bottom and its
close at the top, forcing a grip change to do either.

| Property | Value |
|---|---|
| Trigger | Sticky pill button, bottom-centre, showing the active filter count and the result count |
| Height | 75dvh, draggable to full height, dismissible by downward drag or by scrim tap |
| Structure | Scrollable facet list; a fixed bottom action row with «Скинути» (ghost) and «Показати N товарів» (primary) |
| Live count | The primary button's count updates as facets are toggled, before applying — so the visitor never applies a filter set that returns zero |
| Zero result | The button becomes «Немає товарів» and is non-submitting, with the offending facet marked |
| URL | Applied filters are written to the query string so a comparison tab survives a reload ([02-ux-research.md](02-ux-research.md) §2.7) |
| Accessibility | `role="dialog"`, `aria-modal`, focus trapped, `Esc` closes, background `inert` |

### Thumb zones and the one-handed reach map

Reference device 390 × 844 CSS px, right-handed one-handed grip, pivot at the lower-right corner.

```
   0 ────────────────────────────── 390
   │  ▓▓▓▓▓▓▓  HARD                   │  844–620 from bottom   → status, headings, back
   │  ▓▓▓▓▓▓▓▓▓▓▓                     │
   │  ░░░░░░░░░░░░░  STRETCH          │  620–420               → content, secondary links
   │  ░░░░░░░░░░░░░░░░░░              │
   │  ███████████████████  EASY       │  420–0                 → primary actions
   │  █████████████████████████       │
   0 ────────────────────────────── 390  ↑ pivot
```

Placement rules derived from it:

| Zone | What belongs there |
|---|---|
| Easy | Add to cart, apply filters, continue checkout, close a sheet, the mobile menu's close bar |
| Stretch | Variant swatches, quantity, secondary links, accordion headers |
| Hard | Page title, breadcrumb, back, the header's ✕ — all of which are *either* duplicated in the easy zone *or* reachable by a system gesture |

Left-handed users mirror the map horizontally but not vertically, which is why the rules above are
expressed in terms of *vertical* zones and full-width targets. A control pinned to the bottom-right
corner specifically is the one placement that genuinely disadvantages left-handed use, and it is
not used anywhere in this product.

`env(safe-area-inset-*)` is applied to every fixed bottom element. A primary action sitting under
the iOS home indicator is a conversion loss that only appears on real hardware.

## 33.6 The tablet problem — 768–1023 px

This range is where most responsive designs fail, and it fails silently because designers test at
375 and 1440 and the range between them is inspected by dragging a browser window, which nobody
does carefully.

The failure has a specific shape: 768 px is wide enough that the mobile layout looks *empty* —
huge type, one-column grids, absurd margins — but too narrow for the desktop layout, which either
overflows or compresses its columns below usable widths. Designs "solve" this by letting the mobile
layout stretch, which is why so many sites look broken on an iPad in portrait.

**Explicit rules for 768–1023 px. This range gets designed, not interpolated.**

| Rule | Detail |
|---|---|
| Eight columns, not twelve | Twelve columns at 768 px gives 47 px columns, which is below the width of anything real. Eight columns at 24 px gutters gives usable spans |
| Product grids go to 3 | Not 2 (too sparse, cards become 330 px wide) and not 4 (cards drop to 165 px, below the point where a textile photograph reads) |
| No persistent sidebars | A 3-column filter rail at 768 px leaves 500 px of grid. Filters stay in the bottom sheet through `md` and appear as a rail only at `lg` |
| Type does not jump | The fluid `clamp()` scale in [10-typography.md](10-typography.md) §10.3 is continuous through this range; no step changes |
| Touch is assumed | Most devices in this range are touch-primary, so target sizes stay at the 48 px mobile values even though the layout is becoming desktop-like. This is the concrete reason §33.8 exists |
| Section padding | `--section-y-md`, already fluid, already correct through the range |
| Header | Utility strip removed, main bar at 72 px, mega-menu panel at 2 columns (see [15-navbar-specification.md](15-navbar-specification.md) §15.3) |

Both 768 px portrait and 1024 px landscape are in the mandatory test matrix (§33.14), and a design
review that has not looked at 820 px is not complete.

## 33.7 Above 1920 px

Content stops growing at 1440 px; margins absorb the remainder
([11-spacing-system.md](11-spacing-system.md) §11.3). What changes above `2xl` is not the layout
but the treatment of the space around it.

| Element | Behaviour above 1920 |
|---|---|
| Text containers | Capped, always. `container-narrow` stays 760 px at any viewport |
| Product grid | 5 columns within the 1440 px container, not 6 — a sixth column shrinks cards below the readable threshold |
| Full-bleed media | Genuinely full-bleed, to `100vw`, with a max source width of 2560 px. Above that the browser upscales, which is invisible and free |
| Hero | Height capped at 900 px so it does not become a 1,400 px wall on a 27-inch display |
| Background | The `--bg-alt` and inverted sections extend edge to edge; only the *content* is capped. Capping the background produces a floating-card look that contradicts the full-bleed identity in [08-design-system.md](08-design-system.md) §8.2 |
| Ambient layers | Fog and particle systems scale to viewport, with the particle count capped regardless of area (§13.7) |

## 33.8 Capability queries matter more than breakpoints

The most consequential responsive decisions on this project are not about width. A 1024 px iPad in
landscape and a 1024 px laptop window need the *same layout* and *opposite interaction models*.
Width cannot distinguish them; capability queries can.

```css
@media (hover: hover) and (pointer: fine)   { /* mouse or trackpad */ }
@media (hover: none)  and (pointer: coarse) { /* touch primary */ }
@media (any-hover: hover)                   { /* some attached pointer can hover */ }
```

| Behaviour | Gated on | Why not a breakpoint |
|---|---|---|
| Mega-menu hover-to-open | `hover: hover` | A touch tablet at 1024 px would open panels on accidental taps |
| Card `Lift` hover state | `hover: hover` | On touch it fires on scroll-start and sticks after navigation |
| Tooltips | `hover: hover` | There is no touch equivalent of hover; touch gets a tap-toggled popover or, preferably, visible text |
| Image zoom on hover | `hover: hover` | Touch uses pinch or a tap-to-fullscreen gallery |
| Minimum target size | `pointer: coarse` → 48 px | A touch laptop at 1440 px still needs touch-sized targets |
| Custom cursor / mascot cursor tracking | `hover: hover` and `pointer: fine` | There is no cursor to track |
| Sheep cursor tracking | additionally `prefers-reduced-motion: no-preference` | [01-brand-strategy.md](01-brand-strategy.md) §1.7 |

Use `any-hover` rather than `hover` when deciding whether an affordance may be hover-*enhanced*,
and `hover` when deciding whether it may be hover-*only*. The distinction matters for a tablet with
a keyboard case attached.

**The overriding rule, which outranks all of the above:** no affordance is hover-only anywhere on
the storefront ([02-ux-research.md](02-ux-research.md) §2.6). Hover is always an enhancement of
something already visible. That rule makes the capability queries a refinement rather than a
correctness dependency — which is precisely why it is safe to rely on them.

## 33.9 Orientation

Orientation is handled by width, not by `orientation: landscape`, with two exceptions where the
constraint is genuinely vertical.

| Case | Handling |
|---|---|
| Phone landscape (e.g. 844 × 390) | Reads as `sm` by width, which is correct. **Except:** any element sized `100dvh` — the mobile menu, the filter sheet, the hero — is capped at `max-height: 100dvh` with internal scroll, because 390 px of height fits nothing |
| Hero on short viewports | `height: min(78dvh, 640px)` so a landscape phone does not get a hero taller than its screen with the headline clipped |
| Tablet rotation | Portrait 768–834 is `md`; landscape 1024–1194 is `lg`. Both are designed; the transition must not lose scroll position or collapse an open filter sheet |
| Orientation lock | Never. Locking orientation removes a user's control over their own device |

`dvh` rather than `vh` throughout. `100vh` on iOS Safari is the *largest* possible viewport, so a
`100vh` element is clipped by the toolbar whenever the toolbar is visible — the single most common
mobile layout bug in the medium.

## 33.10 Foldables and 320 px

| Device class | Width | Handling |
|---|---|---|
| Galaxy Fold, cover display | 320 px | Fully supported as the `xs` floor. Every component is verified at 320 px in the quality gate ([08-design-system.md](08-design-system.md) §8.10) |
| Galaxy Fold, unfolded | ~673–717 px | Falls in `sm`. Layout is correct by width; no special case |
| Flip-style, partially folded | varies | No special handling. The `viewport-segments` API is not mature enough to build against |
| Very narrow with 200% zoom | effective ~160 px | Not supported as a distinct layout. WCAG 1.4.10 requires reflow at 320 px with 400% zoom, which is satisfied; below that, content reflows and scrolls |

320 px is a hard floor, not an aspiration. At 320 px with 20 px margins the content box is 280 px,
which must still fit a 48 px target, an 8 px gap and a readable price. Any component that needs
more than 280 px is redesigned, not scrolled horizontally. **The page body never scrolls
horizontally at any width** — wide content (the wholesale capacity table, the admin order table,
long code-like strings such as SKUs) scrolls inside its own `overflow-x: auto` container.

**Two components come closest to that 280 px limit, and neither is allowed to use the escape
hatch.** The return-deposit block (§33.4) and the custom-size buy box (§33.4) are both
label-plus-number layouts whose meaning depends on horizontal alignment, so the `overflow-x: auto`
container that rescues the capacity table would destroy them: a subtraction the reader has to
scroll sideways to complete is not a subtraction they will trust, and a dimension field that
scrolls out of view while its pair is focused is not a pair. Both are therefore designed at 280 px
first and verified there before any wider layout is drawn, and both are named explicitly in the
quality gate below. If a locale's labels do not fit, the labels are shortened. The layout does not
move.

## 33.11 Responsive images and art direction

Photography is the product ([01-brand-strategy.md](01-brand-strategy.md) §1.8), and a badly
cropped photograph at 360 px undoes the shoot it came from. Two mechanisms, used for different
problems.

**Resolution switching — `srcset` + `sizes`.** The same image at different pixel sizes, for
product grids, cards, thumbnails and editorial body images. Cloudinary generates the widths;
`sizes` must describe the *real* layout at each breakpoint, not a guess. A wrong `sizes` attribute
is silently expensive: the browser downloads a 1600 px image for a 320 px slot and Lighthouse
reports it as "properly sized" because the markup claimed it was.

**Art direction — `<picture>` + `<source media>`.** A *different crop*, for heroes, banners, and
category headers where a landscape composition simply does not work in portrait. `Banner` carries
`mediaId` and `mobileMediaId` ([25-database-schema.md](25-database-schema.md) §25.8) for exactly
this.

### `focalPoint` and `textSafeZone`

`Media` carries `focalX`, `focalY` (0..1) and `textSafeZone` as `{x, y, w, h}` in 0..1 units
([25-database-schema.md](25-database-schema.md) §25.4). These are the fields that make automated
cropping safe:

| Field | Used for |
|---|---|
| `focalX` / `focalY` | Passed to Cloudinary as `g_xy_center,x_…,y_…` so every derived aspect ratio keeps the subject. Without it, a 16:9 hero cropped to 4:5 on a phone decapitates the weaver |
| `textSafeZone` | The region the crop must preserve *and* keep low-detail, so overlaid text stays legible. It is the third and preferred treatment in [09-color-palette.md](09-color-palette.md) §9.6 — an art-directed safe area needs no scrim at all |

**Enforcement:** the hero component reads `textSafeZone` and positions the headline block inside
it at every breakpoint. If a media record used in a hero placement has no `textSafeZone`, the
component falls back to the scrim gradient treatment and the CMS shows a warning. Uploading a hero
image without setting the focal point is the failure mode this guards against, and it is a
five-second task at upload time versus an unnoticeable defect at 390 px.

Every image also satisfies the full contract in [08-design-system.md](08-design-system.md) §8.7:
explicit `width`/`height` from `Media`, per-locale `alt`, AVIF/WebP via `f_auto`, blurhash LQIP
above the fold, `loading="lazy"` except the LCP image.

## 33.12 Responsive typography

Defined in [10-typography.md](10-typography.md) §10.3 and not redefined. Three properties of that
system that are responsive decisions rather than type decisions:

1. **Fluid via `clamp()`, between 375 px and 1440 px.** Display sizes scale continuously; there
   are no breakpoint jumps in type size. A headline that steps from 32 px to 48 px at exactly
   1024 px draws attention to the mechanism.
2. **Body text does not scale.** `body` is 16 px on mobile and 17 px on desktop, and that is the
   entire range. Fluid body text produces 14 px on a small phone, which violates the 16 px floor
   that [02-ux-research.md](02-ux-research.md) §2.6 establishes as non-negotiable for this
   audience.
3. **Measure is capped in `ch`, not px**, so line length stays correct when a font substitutes or
   when the user's browser font size differs from 16 px.

Additional responsive obligations:

- All sizes in `rem`; OS text-size settings must scale the whole interface.
- Layout survives 200% zoom at every breakpoint and 400% zoom at 320 px (WCAG 1.4.4, 1.4.10).
  Zoom is tested as a responsive case, not as an accessibility afterthought — at 400%/320 px the
  effective viewport is ~80 px wide and every layout must reflow to a single column.
- Layouts are designed against the **German** string length and verified against Ukrainian
  ([10-typography.md](10-typography.md) §10.4). A nav or button that fits in English and breaks in
  German is a responsive bug discovered in the wrong locale.

## 33.13 The admin panel must work on a phone

This is a requirement, not a nicety. Warehouse staff pick, pack and mark orders shipped while
standing at a bench, holding a parcel. A desktop-only admin means a laptop on a packing table or,
in practice, order statuses updated hours later from memory.

**Decision: a responsive admin with a deliberately reduced mobile scope.** Not a separate app, not
a full desktop UI squeezed into 390 px.

| Capability | `xs` / `sm` | `md` | `lg`+ |
|---|---|---|---|
| Order list | Card list: number, customer, total, status chip | Condensed table | Full table, all columns |
| Order detail | Full — items, address, events, status change | Full | Full |
| Change order status | **Yes — the primary mobile task** | Yes | Yes |
| Print / generate TTN | Yes, share-sheet or download | Yes | Yes |
| Stock adjustment on a variant | Yes, single-variant edit | Yes | Yes + bulk |
| Product create / edit | Read-only, with a link to open on desktop | Limited | Full |
| Bulk edit, CSV import | **No.** Explicitly out of scope | No | Yes |
| Issue an international shipping quote (F4) | **No.** Read the `AWAITING_QUOTE` queue, not act on it | No | Yes |
| Media upload | Yes — camera capture is genuinely better on a phone | Yes | Yes |
| Analytics dashboards | Single-column summary cards, no charts | Charts | Full |
| Navigation | Bottom tab bar: Замовлення · Товари · Склад · Ще | Collapsible sidebar | Persistent sidebar |

Rules specific to the admin:

- **16 px minimum font size, including here.** [10-typography.md](10-typography.md) §10.3 rule 1
  applies to the admin explicitly, and dense tables are the usual place it gets violated.
- 44 px minimum targets at `pointer: coarse` even though the admin uses the `sm` button size at
  desktop density ([08-design-system.md](08-design-system.md) §8.5).
- Wide tables scroll horizontally inside a bounded container with the identifying column sticky.
- Destructive actions require confirmation at every width, and the confirm and cancel buttons are
  never adjacent on touch — a mis-tap that cancels an order is unrecoverable.
- Motion is capped at `dur-fast` ([13-motion-system.md](13-motion-system.md) §13.11). Staff use
  this forty times a day.
- The admin is dark by default ([09-color-palette.md](09-color-palette.md) §9.7), which on an OLED
  phone in a warehouse is also the correct power and glare decision.

## 33.14 Device test matrix

Chosen for the Ukrainian market specifically: a market with a high Android share skewed toward
mid-range Xiaomi, Samsung A-series and Realme handsets, meaningful Samsung Internet usage, and a
long tail of 1366×768 laptops still in office use. Exact shares are `{{AUDIENCE_MIX}}` and are
replaced by measurement within 60 days ([02-ux-research.md](02-ux-research.md) §2.8, R1); until
then this matrix is a considered hypothesis, not data.

| # | Device / viewport | CSS px | Browser | Why it is in the matrix | Priority |
|---|---|---|---|---|---|
| 1 | Xiaomi Redmi Note (mid-range) | 393 × 873 | Chrome Android | The single most representative Ukrainian handset class. **Also the CPU-throttling reference** — motion budgets in §13.5 are measured here, not on a flagship | P0 |
| 2 | Samsung Galaxy A-series | 360 × 800 | Samsung Internet | The most common *narrow* real device. Samsung Internet has its own rendering quirks and is not Chrome | P0 |
| 3 | iPhone 13/14/15 | 390 × 844 | Safari iOS | The reference for the thumb-zone map (§33.5) and for `dvh`, safe-area insets and iOS zoom-on-focus | P0 |
| 4 | iPhone SE 2/3 | 375 × 667 | Safari iOS | Short viewport. Catches every `100vh` and sticky-bar overlap bug | P0 |
| 5 | Narrow floor | 320 × 568 | Chrome DevTools | WCAG 1.4.10 and Galaxy Fold cover display | P0 |
| 6 | iPad 10th gen, portrait | 810 × 1080 | Safari iOS | The tablet problem (§33.6), and a touch device in the `md` range | P0 |
| 7 | iPad, landscape | 1080 × 810 | Safari iOS | `lg` layout with a coarse pointer — the case §33.8 exists for | P1 |
| 8 | Budget laptop | 1366 × 768 | Chrome, Edge | Very common in Ukrainian offices. Short viewport at desktop width: heroes and sticky headers must not fill the screen | P0 |
| 9 | Standard desktop | 1440 × 900 | Chrome, Firefox | The primary design width | P0 |
| 10 | Full HD | 1920 × 1080 | Chrome | The `2xl` boundary | P1 |
| 11 | Large display | 2560 × 1440 | Chrome | §33.7 max-width behaviour and 2× image sources | P2 |
| 12 | Galaxy Fold, unfolded | 717 × 512 | Chrome Android | The `sm`/`md` boundary on an unusual aspect ratio | P2 |

Cross-cutting conditions, each run against at least one P0 device:

| Condition | Verifies |
|---|---|
| 200% browser zoom at 1440 px | WCAG 1.4.4 |
| 400% zoom at 320 px | WCAG 1.4.10 reflow |
| `prefers-reduced-motion: reduce` | [13-motion-system.md](13-motion-system.md) §13.6 |
| `saveData: true`, 4× CPU throttle, Slow 4G | Ambient systems disabled, LCP budget under real mountain-network conditions |
| Landscape phone | §33.9 `dvh` capping |
| OS text size at maximum | `rem` scaling |
| Keyboard-only, no pointer | Focus order at every breakpoint |
| `de` locale | Longest strings, per §33.12 |
| **`uk` COD order at 320 px** | The return-deposit block renders complete, expanded, above the pay button, with all three numbers right-aligned and no wrapped figures. **P0, and a release blocker rather than a bug** (§33.4) |
| **Custom-size buy box at 320 px on iOS** | Both dimension inputs focusable without zoom, live price updating without reflow, range hints visible before typing, sticky bar price agreeing with the buy box at every keystroke (§33.4) |
| **Mixed cart at 320 px** | The split notice renders as two stacked cards above the payment step, never collapsed |

The first two of those are singled out because they are the only cross-cutting conditions in this
matrix whose failure mode is **a customer believing they are being cheated** rather than a
customer being inconvenienced. Every other row degrades; these two invert.

**Real-hardware requirement.** Items 1, 2 and 3 are tested on physical devices, not in device
emulation. Emulation reproduces viewport and pointer type; it does not reproduce touch accuracy,
scroll momentum, GPU limits, Samsung Internet's renderer, or iOS Safari's toolbar behaviour —
which is where four of the bugs this matrix exists to catch actually live.

## 33.15 Open items

| Token / question | Blocks | Reference |
|---|---|---|
| `{{AUDIENCE_MIX}}` | Priority weighting of the test matrix | [02-ux-research.md](02-ux-research.md) §2.8 R1 |
| Physical device availability | Whether items 1–3 can be tested on real hardware in Phase 2 | §33.14 |
| Photography aspect ratios for the Яворів shoot | Whether heroes can be art-directed at all, or must rely on `focalPoint` cropping alone. E5 supplies a reusable catalogue library but **not** the factory, shop and place photography, which is the material this question is actually about | [00-client-decisions-2.md](00-client-decisions-2.md) E5 |
| German and Polish label lengths in the custom-size buy box | Whether «Ширина» / «Довжина» equivalents and the range hints still fit two 134 px fields at 320 px, or whether `de` reverts to stacked inputs. This is the only part of §33.4's custom-size block that may need a locale-specific layout, and it is measured rather than guessed ([10-typography.md](10-typography.md) §10.4) | H3c, §33.4 |
| Whether the deposit block's copy survives client review | H1.3 item 4 is open: the client has not yet approved the wording. The **layout** is settled and does not depend on the approval, but a materially longer approved string would change the 320 px height budget | [00-client-decisions-5.md](00-client-decisions-5.md) H5 item 4 |

### Closed since the previous revision

| Question | Resolution | Consequence here |
|---|---|---|
| `{{SKU_COUNT}}` | Several hundred to roughly a thousand, following the migrated range (E5) | No longer an open item. The filter bottom sheet **does** need sectioning and search-within-filters, specified in §33.4 |
| Dye-lot disclosure for yarn | **Dye lots are not tracked** (E8) | The by-weight buy box needs no fourth control. The yarn PDP carries one sentence of prose instead, which has no responsive cost at 360 px |
| How a custom size is priced | **By area, from an owner-set rate per square metre, with a price floor and physical width/length bounds** (H3c) | The custom-size buy box is fully specifiable and is specified in §33.4. It is no longer a quote flow, so it needs no waiting state, no SLA date and no "we will contact you" screen at any width — which removes an entire narrow-screen component the previous draft would have had to design |
| Made-to-order payment | **Full online prepayment; COD removed server-side** (H1.1) | The payment step has no disabled-row state to lay out at 320 px (§33.4) |
| Whether a workshop visit can be booked on the site | **No. Phone only, arranged with Іван in advance** (G3) | No calendar, no time-slot grid and no availability table at any breakpoint — the three components most likely to fail at 320 px are all absent by ruling rather than by design effort |
