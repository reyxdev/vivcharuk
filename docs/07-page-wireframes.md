# 07 — Page Wireframes

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Contacts:** address, both phones, messengers, click-to-load map with route link, «Графік гнучкий — дзвоніть перед візитом». **No contact form** (part 7).
> - **About:** one scrolling story — Яворів and ліжникарство, values; no family section, no faces. **404:** mascot, «На головну», search. **FAQ:** one page of accordions. **Delivery and payment:** one page. **Care:** by material. **Reviews page** and **customer-home gallery** added (gallery only with the buyer's consent).
> - **Thank-you page** per part 6 defaults: order number with copy button, contents, next steps, phone and messengers, waving mascot.

Every page type other than the homepage, which is specified in
[06-homepage-wireframe.md](06-homepage-wireframe.md). Three pages have their own full
specification and are summarised here only far enough to place them in the system: the product
page ([17-product-page-specification.md](17-product-page-specification.md)), checkout
([18-checkout-specification.md](18-checkout-specification.md)), and wholesale
([19-wholesale-page-specification.md](19-wholesale-page-specification.md)).

**Authority.** [00-client-decisions-6.md](00-client-decisions-6.md) outranks everything else,
then [00-client-decisions-5.md](00-client-decisions-5.md), then
[00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md).

**Round-6 rulings that change this document materially**
([00-client-decisions-6.md](00-client-decisions-6.md)):

| Ruling | Where it lands |
|---|---|
| **J1 — a mixed cart ships together as one order; the split is withdrawn** | **§7.6b is rewritten.** The split screen, its two cards, its two order numbers and its two delivery fees are deleted. In their place §7.6b specifies the **mixed-cart disclosure**, which fires in §7.4b at the moment the custom item is added, persists in §7.5's cart and §7.6's summary, and is **not** a checkout-time reveal. §7.8 renders one order where it used to render a pair |
| **J2 — the return-shipping deposit is confirmed, with the business reason on record** | §7.6a's deposit block is unchanged in every respect. It is no longer written anywhere as provisional. The **copy** still awaits client sign-off and the approval row says so |

**Round-4 and Round-5 rulings that change this document materially**
([00-client-decisions-4.md](00-client-decisions-4.md),
[00-client-decisions-5.md](00-client-decisions-5.md)):

| Ruling | Where it lands |
|---|---|
| **H3b + H3c — custom sizing per product, priced live by area** | **§7.4 gains a fully drawn second buy-box state.** Two dimension inputs, a live price, the computed area, the lead time and the prepayment notice. It is now specifiable because the price is deterministic |
| **H1.1 — made-to-order is prepaid; COD removed server-side** | §7.6 — the payment step renders a **server-derived** method list with no disabled rows. **§7.6b is new**: the mixed cart, which under §J1 above is a disclosure rather than a screen |
| **H1.2 — «наложений платіж з оглядом», Ukraine only** | §7.5 and §7.6 — the inspection right is named on the PDP trust triplet and at checkout, not buried in a policy page |
| **H1.3 — the return-shipping deposit** | §7.6 gains the **deposit arithmetic block**, drawn with real numbers, expanded, above the pay button. It is the single most wording-sensitive element in this document |
| **G2 — 14 days is production before dispatch**; `IN_PRODUCTION` | §7.7 and §7.8 — the confirmation states a **dispatch date**, and the order-status timeline gains a named production row with no progress bar |
| **G3 — workshop tours with Іван, by phone, no booking widget** | §7.15 — `{{FLOOR_VISIT}}` **resolves**, and block 5's middle column stops hedging. **No calendar at any breakpoint** |
| **G1 — Іван primary, Любов fallback** | §7.15 — both numbers, Іван first, with the fallback framed as one: «Якщо не відповідає — телефонуйте Любові» |
| **G4 — a business card already ships in every parcel** | §7.18 — the reviews index gains an entry point that is a printed short URL, and an empty state that is about to stop being empty |

**Round-3 rulings that change this document materially**
([00-client-decisions-3.md](00-client-decisions-3.md)):

| Ruling | Where it lands |
|---|---|
| The Яворів address is a **shop as well as a factory** (§F2) | **§7.15 is rebuilt.** The contact page stops being a form with an address above it and becomes a destination page: directions, parking, what is on display, whether the production floor can be seen, both numbers, the hours caveat, a map. This is the largest single change in this revision |
| Partner goods are sold **under the Вівчарик brand** (§F3) | §7.1 and §7.4 — `brand` is Вівчарик for both origins, `manufacturer` omitted for partner goods. The origin label keeps equal visual weight and the facet stays pinned, for a reason that is now stronger rather than weaker |
| International shipping is **quoted per order** (§F4) | §7.6 gains an enquiry-then-invoice layout and a submit control that does not say «Оплатити»; §7.7 gains an awaiting-quote confirmation variant |
| Buyer pays all customs and duties — DAP (§F4) | §7.6 — the customs disclosure is a **blocking, always-expanded element with an acknowledgement checkbox**, never an accordion. §7.19 carries the same fact on the delivery and payment page, which is not sufficient on its own |
| Tagline stays **«в Карпатах»** (§F6) | §7.9 — the about hero reverts to «в Карпатах» and Яворів moves into the body, where the reader has context for it |
| `{{LEGAL_ID}}` exists, pending delivery; the public email is `info@vivcharyk.shop` ([00-client-decisions-8.md](00-client-decisions-8.md) §L2; the Gmail is never shown) | §7.15 gains an email channel it did not have; §7.25 open questions 10 and 11 are downgraded |

**Round-2 rulings that continue to govern this document:**

1. **New brand, new domain, cold start** (§D2). No URL migration, no redirect mapping, no
   inherited rankings. Crawlability of listing pages therefore matters more than it would on an
   established domain, and it decides the pagination question in §7.2.8.
2. **Partner-manufactured goods sit in the catalogue** (§D3) **and the partner cannot be named**
   ([00-client-decisions-2.md](00-client-decisions-2.md) §E7). Origin is a first-class field, a
   visible label at equal weight to own manufacture, and a filter facet pinned to the top of the
   panel. This touches the listing page, search, the PDP summary, and the cart.
3. **Yarn, ровниця and вовна для рукоділля are sold by weight** (§D4). They need a different buy
   control and different cart maths. **Dye lots are not tracked** (§E8), so they get an honest
   shade note instead of a lot control — no facet, no selector, no admin field.
4. **Guest checkout is permanent** (§E12). The account wireframes are **deleted**; §7.20 now
   documents what replaced them and why.
5. **The workshop is in Яворів**, not Вербовець (§E2) — вул. Петруші, с. Яворів, Косівський
   район, Івано-Франківська область, 78644. Every address string and every «ткані у…» line in
   the wireframes below is corrected.
6. **`{{PSP}}` is WayForPay** (§E10), with its integration mode unverified. §7.6 specifies both
   branches rather than one.

**Catalogue size resolves to the migration scope** — several hundred to roughly a thousand SKUs
([00-client-decisions-2.md](00-client-decisions-2.md) §E5). The previous "unknown, design for
300 or 3,000" framing is withdrawn. Nothing below changes as a result: the faceting, pagination
and grid architecture were designed to hold across exactly that range, and they do. Confirm the
exact figure when the catalogue export is taken.

**Content provenance is constrained.** Products and photographs may be migrated from the
adjacent business, but that site stays live (§E5), so **every product name, product
description, category text and article must be rewritten** and no review may be copied.
Photographs may be reused after re-crop, re-grade, EXIF strip, semantic rename and new per-locale
alt text. Wherever a wireframe below reserves a content slot, that slot is filled with new text,
not pasted text — see [04-sitemap.md](04-sitemap.md) §4.4b.

## 7.1 Shared shell and conventions

Every page renders inside `PageShell`: skip link → `SiteHeader` → `<main id="content">` →
`SiteFooter`. Header and footer are specified in
[15-navbar-specification.md](15-navbar-specification.md) and
[16-footer-specification.md](16-footer-specification.md) and are omitted from the wireframes
below except where a page changes their behaviour.

| Convention | Rule |
|---|---|
| Breadcrumbs | Every page except home, 404, 500, offline. `BreadcrumbList` structured data on all of them |
| Heading outline | Exactly one `h1`, no skipped levels, visual size decoupled from semantic level ([10-typography.md](10-typography.md) §10.8) |
| Container | `container` default; `container-narrow` for editorial; `container-form` for forms; `container-wide` for grids ([11-spacing-system.md](11-spacing-system.md) §11.3) |
| Section rhythm | `--section-y-sm` utility, `--section-y-md` commerce, `--section-y-lg` editorial |
| Four states | Loading, empty, filtered-to-zero, error — designed, not improvised ([08-design-system.md](08-design-system.md) §8.8) |
| Mascot | Empty states, 404, order confirmation, footer. **Never** PDP, cart, checkout, wholesale ([01-brand-strategy.md](01-brand-strategy.md) §1.7) |
| Origin label | Every product surface shows **«Власне виробництво»**, or — for partner goods — **«Відібрано Вівчариком»** plus **«Виготовлено карпатським майстром»** where `partnerRegion` is known and **«Виготовлено іншим виробником»** where it is not. `partnerName` is never rendered ([00-client-decisions-2.md](00-client-decisions-2.md) §E7). Equal visual weight to the own-manufacture mark. No exceptions, no hover-only disclosure |
| Origin in structured data | `brand` is **Вівчарик for both origins**; `manufacturer` is Вівчарик for own manufacture and **omitted entirely** for partner goods ([00-client-decisions-3.md](00-client-decisions-3.md) §F3). Because the brand name now appears on goods the brand did not make, the on-page label matters **more**, not less — it is the only surface that still draws the distinction. Nothing about the mark is softened |
| No customer account | No page in this document contains a login link, a register link, an "account" icon, a "save to your account" prompt, or a post-purchase account offer. Guest is permanent (§E12) |

ASCII wireframes below place desktop (1440) on the left and mobile (375) on the right.

---

## 7.2 Category / listing page

`/{locale}/catalog/{category-slug}` — and `/catalog` for the root.

**Purpose.** Turn a material world into a shortlist.
**Conversion job.** This page carries the entire catalogue behind it and is the only surface
where filtering happens. Every other page either sends the visitor here or receives them from
here.
**Trust job.** Secondary but real: the origin facet is where a wholesale buyer confirms that own
manufacture is separable from resale, which is the §D3 promise made operable.

### 7.2.1 Desktop and mobile

```
DESKTOP 1440                                              MOBILE 375
┌──────────────────────────────────────────────────────┐ ┌────────────────────┐
│ Головна › Вовна › Ліжники                            │ │ ‹ Вовна            │
│                                                      │ │ Ліжники            │
│ Ліжники                              h1 display-md   │ │ 34 товари          │
│ Ткані вручну на верстатах у Яворові. Вовна…          │ │ ┌────────────────┐ │
│ 34 товари · власне виробництво        body-lg, 62ch  │ │ │Фільтри(2) │Сорт│ │ ← sticky bar
│ ─────────────────────────────────────────────────────│ │ └────────────────┘ │
│ ┌──────────────┐ ┌─────────────────────────────────┐ │ │ [Розмір:150×200 ✕] │ ← active chips
│ │ ФІЛЬТРИ      │ │ ⟨2 активні ✕ Очистити всі⟩      │ │ │ ┌───────┐┌───────┐ │
│ │ sticky 96px  │ │ Сортувати: ▾ Спочатку новіші    │ │ │ │ 4:5   ││ 4:5   │ │
│ │ ▾ Виробництво│ ├─────────────────────────────────┤ │ │ │       ││ ◆ руч.│ │
│ │ ● Власне  28 │ │ ┌───────┐┌───────┐┌───────┐     │ │ │ ├───────┤├───────┤ │
│ │ ○ Відібрані 6│ │ │ 4:5   ││ 4:5   ││ 4:5   │     │ │ │ │Черемош││Полонин│ │
│ │ ──────────── │ │ │       ││◆ ручна││       │     │ │ │ │○○○○ ₴ ││○○○○ ₴ │ │
│ │ ▾ Розмір     │ │ ├───────┤├───────┤├───────┤     │ │ │ └───────┘└───────┘ │
│ │ ☑ 150×200 12 │ │ │Черемош││Полонин││Верхови│     │ │ │  … 2-col grid      │
│ │ ☐ 200×220  9 │ │ │○○○○ ₴ ││○○○○ ₴ ││○○○○ ₴ │     │ │ │                    │
│ │ ☐ 140×200  7 │ │ │Власне ││Власне ││Відібр.│     │ │ │ ┌────────────────┐ │
│ │ ☐ 100×140  6 │ │ └───────┘└───────┘└───────┘     │ │ │ │  Показати ще   │ │
│ │ ▾ Колір      │ │  … 3-col grid, 12 per page      │ │ │ └────────────────┘ │
│ │ ◻◼◻ swatches │ │                                 │ │ │ ‹ 1 2 3 … 4 ›      │
│ │ ▾ Склад      │ │ ┌─────────────────────────────┐ │ │ └────────────────────┘
│ │ ▾ Ціна       │ │ │ Показати ще 12              │ │ │
│ │ ▾ Наявність  │ │ └─────────────────────────────┘ │ │
│ │              │ │ ‹ 1 2 3 4 ›  numbered, <a href>│ │
│ └──────────────┘ └─────────────────────────────────┘ │
│ ── SEO/AI body copy, 3–5 paragraphs, container-narrow │
└──────────────────────────────────────────────────────┘
```

**Виробництво is pinned to the top of the filter panel and is the only pinned facet.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E7 requires it: with the partner
unnameable, this control is the one place a buyer can act on origin in a single gesture, and it
cannot sit below four collapsed groups where a wholesale buyer will never find it. It is also
the only facet that answers a *trust* question rather than a *fit* question, which is why it
does not compete with Розмір for the first position — they are answering different things, and
the trust question comes first for this audience
([02-ux-research.md](02-ux-research.md) §2.3).

The card origin line reads «Власне виробництво» or «Відібрано Вівчариком» — abbreviated to
«Відібр.» in the wireframe only for column width; the rendered card carries the full two-line
label from §7.1.

### 7.2.2 Content slots

| Slot | Limit | Source |
|---|---|---|
| H1 | 40 | `CategoryTranslation.name` |
| Intro | 240 | `CategoryTranslation.description`. Rendered **above** the grid, not below it. **Newly written** — not carried over from the adjacent site (§E5) |
| Result count | 16 | Live, recomputed on every filter change, announced via `aria-live="polite"` |
| Card | per [06-homepage-wireframe.md](06-homepage-wireframe.md) S3 | Plus a mandatory origin line |
| Footer copy | 3–5 paragraphs | `CategoryTranslation` extended body — the cold-start SEO surface. **Newly written**, without exception |

The long-form body copy sits **below** the grid and above the footer. On an established domain
this is optional; on a new domain it is one of the few places a category page can carry enough
text to rank for anything at all (§D2). It must be genuinely informative — what a ліжник is, how
it differs from a ковдра, what sizes suit what beds — not keyword filler, because AI answer
engines extract from it and paraphrase it ([30-ai-search-optimization.md](30-ai-search-optimization.md)).

**These two slots are where the content-reuse constraint bites hardest.** Products may be
migrated from the adjacent business, but that site stays live
([00-client-decisions-2.md](00-client-decisions-2.md) §E5), so pasting its category prose here
would put this page into direct competition with an older, higher-authority page carrying the
identical text — and this page would lose. The footer copy is the single highest-leverage
original-text surface on the catalogue, which makes it the one place where copying is most
tempting and most costly. Яворів is the material advantage available in this copy: «столиця
ліжникарства» is a claim the adjacent site cannot make, so the rewritten text is not merely
different, it is stronger.

### 7.2.3 Facet architecture

Facets are driven by `AttributeDefinition.isFilterable` and by the option types, not hard-coded
per category ([25-database-schema.md](25-database-schema.md) §25.3). A category renders only the
facets that have more than one distinct value within its own result set — a colour facet showing
one colour is noise.

| Facet | Source | Control | Notes |
|---|---|---|---|
| Розмір | `OptionType` key `size` | Checkbox list, `SIZE_GRID` display where the values are dimensional | See §7.2.4 |
| Колір | `OptionType` key `color` | Swatch grid from `OptionValue.swatchMediaId`, falling back to `hex` | Photographic swatches: wool colour does not render honestly as a flat hex |
| Склад | `ProductAttributeValue` on a `composition` definition | Checkbox list | Answers anxiety A1 ([02-ux-research.md](02-ux-research.md) §2.4) at the listing level, before the PDP |
| Ціна | `Product.priceMinMinor` | Two numeric inputs plus preset bands. **Not a dual-handle slider** | A slider fails the motor-precision constraint in [11-spacing-system.md](11-spacing-system.md) §11.7 and is unusable with a screen reader |
| Наявність | `Product.inStock`, `madeToOrderDays` | Radio: усе / в наявності / на замовлення | |
| **Виробництво** | `Product.origin` | Radio: усе / власне / відібрані | **Pinned first in the panel.** Required by [00-client-decisions.md](00-client-decisions.md) §D3 and pinned by [00-client-decisions-2.md](00-client-decisions-2.md) §E7 |
| Товщина, метраж | `ProductAttributeValue` | Numeric range | Yarn categories only |

**There is no dye-lot facet, and `{{DYE_LOT}}` is retired as a token.** Lots are not tracked
([00-client-decisions-2.md](00-client-decisions-2.md) §E8). The previous revision carried the
facet as conditional on a client answer; the answer is no, so the row is deleted rather than
left as a placeholder. `ProductVariant.dyeLot` stays nullable and unused in the schema — removing
it would be premature, exposing it would imply a guarantee the workshop cannot honour. The yarn
PDP instead carries one line of advice, specified at
[05-user-flows.md](05-user-flows.md) §5.7.

Facet counts are computed by a single grouped query against the filtered product set, never N
queries per facet ([25-database-schema.md](25-database-schema.md) §25.10). Counts update on every
filter application, and a facet value whose count would be zero is **disabled and dimmed, not
removed** — removing options as the user filters makes the control feel unstable and hides the
route back.

**URL contract.** Every filter state is a real URL:
`/uk/catalog/lizhnyky?size=150x200&color=siryi&origin=own&page=2`. Filters are `GET` parameters
parsed server-side, so a filtered view is shareable, bookmarkable, back-button-correct, and
server-renderable. `rel="canonical"` points at the unfiltered category for any multi-facet
combination, and single-facet combinations that represent genuine demand (size, colour) are
allowed to be indexed — the full rule lives in
[29-seo-architecture.md](29-seo-architecture.md).

### 7.2.4 Size as a facet, not a subcategory

The adjacent business audited in [00-existing-site-audit.md](00-existing-site-audit.md) §0.6
uses size as a *subcategory*: «150×200см» (47 items), «200×220см» (54), «Доріжки», «Подушки
ткані». That is a WooCommerce workaround for weak faceting, and reproducing it would be the
single most damaging IA decision available here. Four concrete failures:

1. **The same product exists in two places or in neither.** A ліжник available in 150×200 and
   200×220 must either be duplicated across two subcategories, splitting its reviews and link
   equity, or filed under one and made invisible in the other.
2. **Size cannot combine with colour.** Subcategories do not intersect. «Сірий ліжник 200×220»
   becomes unreachable, which is exactly the query a buyer arrives with.
3. **Variant-level stock becomes incoherent.** A product page that owns four size variants cannot
   also be four products; the stock model in
   [25-database-schema.md](25-database-schema.md) §25.3 puts `stockQty` on `ProductVariant` for
   this reason.
4. **It buries the thing that actually distinguishes products.** Pattern, weight and composition
   differentiate a ліжник; size is a fitting decision made after the choice, not before it.

**The replacement:** one `Product` per design, `ProductVariant` per size, `OptionType` key
`size`, and size exposed as a facet with live counts. Where a size genuinely has standalone
search demand — and «ліжник 150х200» does — it is served by an indexable filtered URL with its
own `metaTitle`, not by a duplicate category node. That gives the SEO benefit of a landing page
without the data duplication, and it is reversible: withdrawing a size landing page is deleting
a rule, not merging two category trees.

Doriжky and подушки are a different case: they are **product families**, not sizes, and they
stay as categories.

### 7.2.5 Sticky filter behaviour

| Breakpoint | Behaviour |
|---|---|
| ≥1024 | Filter column is `position: sticky; top: calc(header + space-6)`, `max-height: calc(100vh - top)`, `overflow-y: auto`, `overscroll-behavior: contain`. It scrolls internally when taller than the viewport |
| 768–1023 | Filters collapse into the same drawer as mobile; an 8-column grid has no room for a persistent sidebar without starving the product grid |
| <768 | Sticky action bar with two 48 px buttons: Фільтри (n) and Сортування |

The sticky column is `z-sticky` (100), below `z-header` (200), so the header always wins an
overlap ([11-spacing-system.md](11-spacing-system.md) §11.6). `overscroll-behavior: contain` is
not a nicety: without it, reaching the end of the filter list scroll-chains into the page body
and the user loses their position in the grid.

Applying a filter does **not** scroll the page. The grid updates in place, the result count is
announced, and focus stays on the control just used. Auto-scrolling to the top of the results
after every checkbox is a common pattern and it is disorienting for anyone applying three
filters in sequence.

### 7.2.6 Mobile filter drawer

```
┌────────────────────┐
│ Фільтри        ✕   │ ← 48px close, focus lands here on open
├────────────────────┤
│ ▾ Виробництво      │ ← pinned first, never collapsed on open
│   ● Власне      28 │
│   ○ Відібрані    6 │
├────────────────────┤
│ ▾ Розмір       (1) │
│   ☑ 150×200     12 │
│   ☐ 200×220      9 │
│ ▾ Колір            │
│   ◻ ◼ ◻ ◻          │
│ ▾ Ціна             │
│   [від] [до]       │
├────────────────────┤
│ Очистити │Показати │ ← sticky footer, always visible
│          │34 товари│    label carries the live count
└────────────────────┘
```

Full-height drawer from the right, `dur-slow` with `spring.drawer`
([13-motion-system.md](13-motion-system.md) §13.3). Focus is trapped; `Esc` closes; the
background is `inert` and does not scroll. Filters apply **live** as they are toggled, and the
footer button's label shows the result count so the user knows what they are about to see before
committing — a drawer with a deferred Apply button hides the consequence of each choice, which
is the opposite of what the count is for. The footer is sticky inside the drawer so the exit is
reachable without scrolling back up, which matters most for the longest facet lists.

### 7.2.7 Pagination vs infinite scroll — decision

**Numbered pagination, server-rendered, with an optional "Показати ще" enhancement layered on
top of it.** 12 products per page on mobile, 24 on desktop.

| Criterion | Numbered pagination | Infinite scroll | Verdict |
|---|---|---|---|
| Crawlability | Every page is a distinct `<a href>` URL reachable without JS | Discovery depends on JS execution and scroll simulation; deep products are frequently never crawled | **Decisive.** On a cold-start domain (§D2) with no backlinks, internal linking is the only crawl path that exists |
| Indexability | Each page indexable, `rel=canonical` self-referential | One URL for an unbounded list; later items have no URL | Pagination |
| Position memory | Back from a PDP returns to the exact page | Back returns to the top; the user re-scrolls | Pagination |
| Footer reachability | Footer is always reachable | Footer is unreachable while items remain — a documented defect | Pagination |
| Screen reader | Finite, announceable list with a labelled `<nav>` | Continuously mutating list; position announcements are unreliable | Pagination |
| Keyboard | Tab order terminates | Tab order never terminates | Pagination |
| Perceived speed | One request per page | Feels faster on discovery browsing | Infinite scroll |
| Memory on low-end Android | Bounded DOM | Unbounded DOM; a real cause of jank on the mid-range devices in this audience | Pagination |

Infinite scroll wins exactly one row, and it loses the two that a new domain cannot afford. The
"Показати ще" button recovers most of that one row: it appends the next page in place, updates
the URL via `history.pushState`, and **the numbered links remain in the DOM throughout**, so the
crawler, the keyboard user, and the screen-reader user all still see a finite, addressable list.
Progressive enhancement, not a replacement.

`<link rel="prev">` / `rel="next"` are **not** emitted — Google stopped using them in 2019 and
they are noise. Page 2+ carries a self-referential canonical, and the intro copy is rendered on
page 1 only to avoid duplicate-content dilution across the set.

### 7.2.8 Sort

Dropdown, default **Спочатку новіші**. Options: новіші, ціна ↑, ціна ↓, за назвою. Sort is a URL
parameter like any filter. There is deliberately **no "популярні" sort at launch** — with no
order history it would be an arbitrary ranking dressed up as social proof, and a sort option
that lies is worse than one that is missing.

### 7.2.9 States

| State | Treatment |
|---|---|
| **Loading (first paint)** | Server-rendered; there is no first-paint loading state. Filter re-fetch shows a skeleton grid matching the card dimensions exactly, with the existing count dimmed rather than removed |
| **Empty (category has no products)** | The category is excluded from navigation server-side, so this should be unreachable. If reached: sheep mascot, «Тут поки порожньо», and links to the sibling categories |
| **Filtered to zero** | Names the filters causing it and offers to clear **each one individually** as well as all: «Немає ліжників 100×140 сірого кольору. Прибрати розмір · Прибрати колір · Очистити все». The grid is replaced by this block; the filter column stays populated so the user can see what they did |
| **Error** | «Не вдалося завантажити товари» plus a retry button that re-issues the same query. Filters and URL are preserved. No stack trace, no error code, no mascot |
| **Partial (some facets fail)** | The grid renders; the failed facet is hidden rather than shown broken. A filter that renders but does not filter is worse than an absent one |

### 7.2.10 Tokens and motion

| Facet | Value |
|---|---|
| **Data** | `Category` + `CategoryTranslation`; `Product` joined through `ProductCategory` with `deletedAt = null`, `status=ACTIVE`; facet counts from the grouped query in §25.10; `ProductVariant` for size and colour availability |
| **Type** | `h1` · intro `body-lg` · facet group `h4` · facet value `body` · card Pattern B |
| **Spacing** | `--section-y-sm`; `container-wide`; filter column 264 px fixed, grid gap `space-6` desktop / `space-4` mobile |
| **Surface** | **Page**; filter panel on `--bg-surface` with a hairline; active filter chips use `fleece-400` fill |
| **Motion** | Cards **Rise** on first paint only, capped at 6; appended pages do **not** re-animate. Hover **Lift**. Drawer `spring.drawer`. Filter application has no transition — the grid swaps |
| **LCP** | The first card image in reading order, `fetchpriority="high"`, `loading="eager"`. All others lazy |

---

## 7.3 Search results

`/{locale}/search?q=…`

**Purpose.** Serve the visitor who knows the word for what they want.
**Conversion job.** Highest-intent traffic on the site. **Trust job.** A zero-result page that
handles the miss gracefully is a stronger signal than a results page that handles the hit.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Результати за «ліжник сірий»              │   │ ‹ Пошук            │
│ 18 товарів · 2 статті                     │   │ «ліжник сірий»     │
│ ┌─────────────────────────────────────┐   │   │ 18 товарів         │
│ │ Товари  │ Статті (2) │ Категорії(1) │   │   │ [Товари][Статті]   │
│ └─────────────────────────────────────┘   │   │ ┌───────┐┌───────┐ │
│ [Фільтри] Сортувати ▾                     │   │ │ 4:5   ││ 4:5   │ │
│ ┌───────┐┌───────┐┌───────┐┌───────┐      │   │ └───────┘└───────┘ │
│ │ 4:5   ││ 4:5   ││ 4:5   ││ 4:5   │      │   │ ‹ 1 2 ›            │
│ └───────┘└───────┘└───────┘└───────┘      │   └────────────────────┘
│ ‹ 1 2 ›                                   │
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | Postgres full-text over the generated `tsvector` on `ProductTranslation`, plus `PostTranslation.bodyPlain`, plus `CategoryTranslation.name`; `unaccent` and a simple configuration, since Postgres ships no Ukrainian stemmer ([25-database-schema.md](25-database-schema.md) §25.10). Every query writes a `SearchQueryLog` row |
| **Slots** | Query echo (80) · result counts per type · tab labels · the same product card as §7.2 |
| **States** | **Loading:** skeleton grid. **Empty query:** recent searches plus featured categories. **Zero results:** the important one — see below. **Error:** retry, query preserved |
| **Job** | Converts vocabulary into product. Filters are the same component as §7.2, minus the category facet |

**Zero results** shows: the query echoed so the user can see a typo, up to 5 spelling-corrected
alternatives from the trigram index, the top-level categories, and a link to `/contact` with the
query pre-filled — because a visitor searching «ровниця мериносова» who finds nothing is a
product enquiry, not a lost session. `SearchQueryLog.resultCount = 0` rows are the highest-signal
merchandising input the store has and are surfaced in the admin dashboard, not merely stored.

Search covers partner products; the origin label renders on every card so a partner result is
never mistaken for own manufacture.

---

## 7.4 Product page — summary

`/{locale}/product/{slug}`. **Full specification: [17-product-page-specification.md](17-product-page-specification.md).**

**Purpose.** Answer every objection in the order the buyer raises them, then take the money.
**Trust job.** The origin block is the single highest-value element on the site for Persona 1.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Головна › Вовна › Ліжники › Черемош       │   │ ┌────────────────┐ │
│ ┌──────────────────┐ ┌──────────────────┐ │   │ │ GALLERY swipe  │ │
│ │                  │ │ Ліжники          │ │   │ │ 1/7            │ │
│ │  GALLERY         │ │ Ліжник «Черемош» │ │   │ └────────────────┘ │
│ │  sticky column   │ │ ○○○○ ₴           │ │   │ Ліжник «Черемош»   │
│ │  PRODUCTION      │ │ ⬡ Власне вироб.  │ │   │ ○○○○ ₴             │
│ │  images inter-   │ │ Розмір ▭▭▭▭      │ │   │ ⬡ Власне виробн.   │
│ │  leaved, not     │ │ Колір  ◻◼◻       │ │   │ Розмір ▭▭▭▭        │
│ │  quarantined     │ │ [ Додати в кошик]│ │   │ Колір ◻◼◻          │
│ │                  │ │ ✓ 14 днів ✓ НП   │ │   │ ── specs (3 rows) ─│
│ └──────────────────┘ │ ── СПЕЦИФІКАЦІЯ ─│ │   │ ── origin block ───│
│                      │ Склад 100% вовна │ │   │ ── description ────│
│                      │ Мікрон 28        │ │   │ ── reviews ────────│
│                      │ Вага 1 400 г     │ │   │ ┌────────────────┐ │
│                      │ ── ПОХОДЖЕННЯ ───│ │   │ │ ○○○○ ₴  [Кошик]│ │ ← sticky bar
│                      └──────────────────┘ │   │ └────────────────┘ │
└───────────────────────────────────────────┘   └────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Product` + translations + `ProductVariant` + `VariantOptionValue` + `ProductAttributeValue` + `ProductMedia` (roles `PRIMARY`, `GALLERY`, `DETAIL`, `LIFESTYLE`, `PRODUCTION`, `SCALE_REFERENCE`) + `Review` + `ProductRelation` |
| **States** | Loading: skeleton with gallery dimensions reserved. Out of stock: variant disabled with a reason, restock-notify form. Made-to-order: lead time stated before the button, not after. Error: retry |
| **Job** | Anxieties A1, A2, A5 answerable **without scrolling past the purchase panel and without opening an accordion** ([02-ux-research.md](02-ux-research.md) §2.4) |

Three things are settled here and detailed in doc 17:

- **Specification before description.** Composition, micron and weight render above the marketing
  copy, unwrapped for the first three rows on every breakpoint.
- **Origin labelling.** `origin = OWN_MANUFACTURE` gets the full provenance block (`woolOrigin`,
  `woolMicron`, `productionStage[]`, each stage deep-linking to `/production`).
  `PARTNER_MANUFACTURE` gets an honest short block carrying `partnerRegion` where it exists and
  **no in-house production claims**. `partnerName` is never rendered — it stays null by ruling
  ([00-client-decisions-2.md](00-client-decisions-2.md) §E7) — so the block reads «Відібрано
  Вівчариком · Виготовлено карпатським майстром, Косівщина» where the region is known, and
  «Відібрано Вівчариком · Виготовлено іншим виробником» where it is not. In structured data,
  `brand` is **Вівчарик on both origins** and `manufacturer` is **omitted** for partner goods
  rather than set to Вівчарик ([00-client-decisions-3.md](00-client-decisions-3.md) §F3): that is
  exactly the distinction schema.org draws between the entity that sells under a name and the
  entity that made the thing, and omission states it without asserting anything false. Because the
  goods now carry the brand name, the on-page block is the only remaining surface where a buyer
  can see the difference — which is the argument for keeping it at full weight, not for trimming
  it.
- **Weight-priced products.** Yarn, ровниця and вовна для рукоділля replace the quantity stepper
  with a weight input, show price per 100 g, and compute the cart line as price × weight. There
  is **no dye-lot control** — lots are not tracked (§E8). Above the quantity input, one line of
  advice: «Відтінок може незначно відрізнятися між партіями. Для великого проєкту радимо
  замовити всю кількість одразу.» It sits above the input because it is meant to change the
  quantity decision, not to disclaim it afterwards
  ([05-user-flows.md](05-user-flows.md) §5.7).

### 7.4b The custom-size buy box — the second state of the same panel

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b: made-to-order is a property of **the
size the customer picks**, not of the product. The same ліжник is stocked at 150×200 and a
fourteen-day build at 180×240 — one product, two completely different purchases. §H3c then makes
the second one deterministic: the owner sets a rate per square metre in the admin, and the system
computes the price as the customer types.

The size selector gains a final option, **rendered only when `Product.allowsCustomSize` is true**.
Choosing it does not open a modal, a form or a request-a-quote panel. **It swaps the buy box.**

```
STOCKED SIZE SELECTED (default)            «СВІЙ РОЗМІР» SELECTED
┌──────────────────────────────┐          ┌──────────────────────────────┐
│ Ліжник «Черемош»             │          │ Ліжник «Черемош»             │
│ 7 400 ₴                      │          │                              │
│ ⬡ Власне виробництво         │          │ ⬡ Власне виробництво         │
│                              │          │                              │
│ Розмір                       │          │ Розмір                       │
│ [150×200][170×210][200×220]  │          │ [150×200][170×210][200×220]  │
│ ──────────────────────────   │          │ ──────────────────────────   │
│ [     Свій розмір      ]     │          │ [     Свій розмір      ] ✓   │
│                              │          │                              │
│ Колір ◻◼◻                    │          │ Ширина, см    Довжина, см    │
│                              │          │ ┌──────────┐ ┌──────────┐    │
│ [   Додати в кошик      ]    │          │ │ 180      │ │ 240      │    │ 56px
│                              │          │ └──────────┘ └──────────┘    │ inputmode
│ ✓ Відправка наступного дня   │          │ від 100 до 200  від 150 до 260│ numeric
│ ✓ Нова пошта · Укрпошта      │          │ ← range VISIBLE BEFORE typing │
│ ✓ Наложений платіж з оглядом │          │                              │
│   — оглянете перед оплатою   │          │ 4,32 м²           12 300 ₴   │ ← live,
└──────────────────────────────┘          │              ▔▔▔▔▔▔▔▔▔▔▔▔    │   reserved
                                          │ Колір ◻◼◻                    │   width
                                          │                              │
                                          │ ⚙ Виготовлення — 14 днів.    │
                                          │   Далі — доставка перевізником│
                                          │ ⚙ Оплата — повна, наперед.   │
                                          │   Виріб шиється за вашими    │
                                          │   розмірами.                 │
                                          │                              │
                                          │ [   Додати в кошик      ]    │
                                          │                              │
                                          │ ✗ наложений платіж —         │
                                          │   НЕ РЕНДЕРИТЬСЯ ВЗАГАЛІ     │
                                          └──────────────────────────────┘
```

**Seven things change between the two states, and each is a decision:**

| Element | Stocked | Custom | Why |
|---|---|---|---|
| Price | Fixed, from the variant | **Live**, `max(area × rate, floor)`, recomputed on every keystroke | §H3c. A price that appears only after submission would make this a quote flow, which it is not ([05-user-flows.md](05-user-flows.md) §5.7b) |
| Computed area | Absent | **Shown, beside the price** | It is what makes the price checkable rather than asserted. A buyer who can see `4,32 м²` can infer the rate and verify the next one. It costs no extra row |
| Dimension inputs | Absent | Two, side by side, `inputmode="numeric"`, 16 px text, 56 px tall | 16 px is not styling: below it iOS zooms on focus and reflows the panel mid-typing, scrolling the live price out of view ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| Permitted range | n/a | **Stated under each input, before anything is typed** | The bounds are physical loom and frame limits (§H3c). Stated up front they read as a specification; delivered as a post-submission error they read as a door closing — and an out-of-range order that reaches payment is an order that must be cancelled after the money moved |
| Lead time | «Відправка наступного дня» | «Виготовлення — 14 днів. **Далі — доставка перевізником.**» | Both sentences, always. G2 rule 1: the fortnight is production before dispatch, and copy implying "14 days to your door" generates a complaint on day fifteen. G2 rule 2 puts it in the buy box, not in a tab |
| Payment notice | «Наложений платіж з оглядом» | «Оплата — повна, наперед» **with its reason attached** | §H1.1. A restriction with a stated reason — «виріб шиється за вашими розмірами» — is a policy; the same restriction without one reads as distrust of the customer |
| COD row | Present (Ukraine) | **Absent entirely**, not struck through, not greyed | §H1.1 derives the method list server-side. Showing an unavailable method with an explanation costs two lines and invites a tap that does nothing |

**The price must not reflow the panel.** `5 400 ₴` and `12 300 ₴` are different string lengths. The
price cell is right-aligned with reserved width and `tabular-nums`
([10-typography.md](10-typography.md) §10.6), so digits change in place while the customer is
still typing. A number that jumps its own row mid-decision reads as instability at exactly the
moment the buyer is deciding whether to trust arithmetic they did not perform.

**The mobile sticky bar and the buy box must never disagree.** On mobile the price is visible in two
places separated by a scroll (§7.4 diagram). Both read the same computed value from the same store,
updated on the same tick. While either dimension is empty or out of range the bar's button reads
**«Вкажіть розміри»** and scrolls to the first input rather than being inert
([08-design-system.md](08-design-system.md) §8.5).

**States specific to this panel:**

| State | Rendering |
|---|---|
| `allowsCustomSize = false` | The «Свій розмір» option **does not exist**. Not disabled, not hidden by CSS — absent from the selector |
| One dimension entered | No price yet. The price cell shows an em-dash at full reserved width, so nothing moves when it fills |
| Value outside the range | The input clamps on blur and restates its range. This should be unreachable via the UI; if a crafted request reaches the server it is rejected with the permitted range and the value received ([05-user-flows.md](05-user-flows.md) §5.7b) |
| Server price differs from the displayed one at checkout | The cart line re-renders with the corrected figure, names the change, and requires the customer to act. **Never a silent correction** — this is a prepayment flow, so there is no inspection right to fall back on |
| **Added to a cart that already holds a stocked line** | The add-to-cart confirmation carries the **mixed-cart disclosure** drawn in §7.6b. This is the only state in this panel whose consequence lands on a *different* line, and it is announced here rather than at checkout |

**The «Додати в кошик» press is the disclosure moment, not the checkout.** If the cart already
holds a stocked line, this press has just changed that line's terms: it loses «наложений платіж з
оглядом» and its next-day dispatch, and the whole order becomes prepaid and ships in fourteen days
([00-client-decisions-6.md](00-client-decisions-6.md) §J1). The panel does not block the add and
does not ask a question — it states the consequence in the confirmation that follows the press, and
offers the escape. §7.6b draws it.

**How this is priced is now answered, and the answer is what made this panel drawable.** The earlier
open question — per square metre, a percentage uplift, or a manual quote — is closed by §H3c in
favour of an owner-set rate per square metre with a price floor. A percentage uplift was considered
and rejected: it prices by reference to a size the customer did not choose, so a 180×240 order is
priced off 150×200 and the multiplier has to grow non-linearly to stay honest. Rate-per-area matches
how the cost is actually incurred — wool consumed and loom hours — which is why the owner can reason
about the number instead of tuning a multiplier.

No mascot, no tabs, no countdown.

---

## 7.5 Cart

`/{locale}/cart`, plus a drawer variant opened from the header.

**Purpose.** Confirm what is being bought and remove every reason to hesitate before checkout.
**Conversion job.** The last page where an order can be lost to doubt rather than to friction.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Кошик                                     │   │ Кошик (2)          │
│ ┌───────────────────────┐ ┌─────────────┐ │   │ ┌────────────────┐ │
│ │ ▭ Ліжник «Черемош»    │ │ ПІДСУМОК    │ │   │ │▭ Черемош       │ │
│ │   150×200 · сірий     │ │ Товари ○○○○ │ │   │ │ 150×200 · сірий│ │
│ │   Власне виробництво  │ │ Доставка    │ │   │ │ [−] 1 [+]  ✕   │ │
│ │   [−] 1 [+]      ○○○₴ │ │ {{NP}} ₴    │ │   │ │          ○○○ ₴ │ │
│ │   ✕ Видалити ♡ Пізніше│ │ ─────────── │ │   │ └────────────────┘ │
│ ├───────────────────────┤ │ Разом  ○○○₴ │ │   │ ┌────────────────┐ │
│ │ ▭ Пряжа «Гуцулка»     │ │             │ │   │ │▭ Пряжа 300 г   │ │
│ │   сіра · 300 г        │ │ [Оформити]  │ │   │ │ [ 300 ] г      │ │
│ │   [ 300 ] г      ○○₴  │ │             │ │   │ └────────────────┘ │
│ │   ← weight input      │ │ ✓ 14 днів   │ │   │ ── summary ────────│
│ └───────────────────────┘ │ ✓ НП/Укрп.  │ │   │ ┌────────────────┐ │
│ ▸ Ви також дивились      │ ✓ Оплата при│ │   │ │   Оформити     │ │ ← sticky
│                          │   отриманні │ │   │ └────────────────┘ │
└───────────────────────────────────────────┘   └────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Cart` + `CartItem` keyed by an httpOnly `token` cookie; `ProductVariant` for live price and `stockQty`; `Promotion` for `couponCode` ([25-database-schema.md](25-database-schema.md) §25.6) |
| **Slots** | Line name (44) · options (32) · origin label (28) · unit price · line total · quantity or weight control · summary rows · trust triplet (28 each) |
| **States** | **Empty:** sheep mascot, «У кошику поки порожньо», links to the three material worlds and to recently viewed. **Loading:** skeleton lines at final height. **Stock changed:** an inline `warning` row naming the item and the new availability, never a modal. **Price changed:** the old and new price shown side by side with an explicit accept. **Error:** retry, cart contents preserved |
| **Job** | Restates the three policy facts from the homepage trust row at the exact moment they matter most |

Quantity uses a stepper with 48 px targets and ≥8 px separation; weight-priced lines use a
numeric input with `inputmode="decimal"` and a unit suffix, because a stepper cannot express 350
grams. Removal is a single action with an inline undo, not a confirmation dialogue — a
confirmation on a reversible action trains people to dismiss dialogues.

The mascot appears in the empty state only. It does not appear on a populated cart.

**«♡ Пізніше» saves to `localStorage` and says so.** There is no server-side wishlist, no
`WishlistItem` table and no account to attach one to
([00-client-decisions-2.md](00-client-decisions-2.md) §E12,
[25-database-schema.md](25-database-schema.md) §25.8b). The control therefore carries the state
in its own copy — **«Збережено на цьому пристрої»** — shown at the moment of saving, not as a
tooltip and not in a footer note. The reason is concrete: a buyer who saves a five-figure item on
a phone and then opens the site on a laptop will find nothing there, and a list that silently
vanishes is worse than no list at all. Saying "this device" up front converts a broken expectation
into an accurate one, at the cost of one line of text.

There is no "save to your account" alternative offered beside it, because there is no account —
and offering one that does not exist is the single easiest way to make this page feel broken.

**A custom-size line renders its dimensions, its area and its lead time.** `OrderItem.customSpec`
is `{ widthCm, lengthCm }` ([00-client-decisions-5.md](00-client-decisions-5.md) §H3b), and the
cart line shows them where a stocked line shows its variant:

```
│ ▭ Ліжник «Черемош»                       │
│   180 × 240 см · 4,32 м² · сірий         │  ← where "150×200 · сірий" would be
│   Індивідуальний розмір · виготовлення   │
│   14 днів, далі доставка                 │
│   [−] 1 [+]                   12 300 ₴   │
```

The dimensions are not editable in the cart. Changing them changes the price, and a price edit
inside a summary panel is a control that invites a mistake with no confirmation step behind it —
the line links back to the PDP instead, where the full buy box and its range hints exist.

**The trust triplet in the summary names the inspection right, not the payment timing.**
[00-client-decisions-5.md](00-client-decisions-5.md) §H1.2 renames the method: it is «наложений
платіж **з оглядом**», and the inspection is the entire value of it. «Оплата при отриманні»
described when money moves and discarded the reason a cold-start brand can sell at all at this
price point. The row therefore reads «Наложений платіж з оглядом — оглянете перед оплатою», and it
renders **only** where the method is actually available: Ukraine, and no custom-size line in the
cart. **In a mixed cart the row is absent and the §7.6b disclosure banner stands in its place** —
the customer has already been told why, at the add, and the banner is the standing reminder rather
than the announcement.

**The disclosure banner sits above the summary rows, in both the page and the drawer:**

```
│ ПІДСУМОК                     │
│ ┌──────────────────────────┐ │
│ │ ⚙ У кошику є виріб на    │ │  ← persistent, non-dismissible,
│ │   індивідуальний розмір. │ │    role="status", never an accordion
│ │   Усе замовлення         │ │
│ │   відправимо разом, коли │ │
│ │   він буде готовий —     │ │
│ │   через 14 днів.         │ │
│ │   Оплата — повна, наперед│ │
│ │   Хочете ліжник зі складу│ │
│ │   раніше? Оформіть його  │ │
│ │   окремим замовленням.   │ │
│ └──────────────────────────┘ │
│ Товари              ○○○○ ₴   │
│ Доставка — одна, {{NP}} ₴    │  ← ONE delivery line. Always
│ ─────────────────────────    │
│ Разом               ○○○○ ₴   │
│ [        Оформити        ]   │
```

The delivery row is singular and stays singular. One order, one parcel, one charge
([00-client-decisions-6.md](00-client-decisions-6.md) §J1) — and the summary is the place a
customer looks to confirm that, so it must not hedge with a per-item breakdown that implies two.

---

## 7.6 Checkout — summary

`/{locale}/checkout`. **Full specification: [18-checkout-specification.md](18-checkout-specification.md).**

**Purpose.** Take the money with the fewest possible opportunities to stop.
**Conversion job.** Guest completion above 65% ([01-brand-strategy.md](01-brand-strategy.md) §1.10).

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ ▣ LOGO          крок 2 з 3        Кошик ‹ │   │ ▣  крок 2 з 3      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░       │   │ ━━━━━━━━░░░░       │
│ ┌──────────────────────┐ ┌──────────────┐ │   │ ▸ Ваші дані  ✓ ред.│
│ │ ✓ 1 Ваші дані  ред.  │ │ ▭ Черемош ×1 │ │   │ ── 2 Доставка ─────│
│ │ ── 2 ДОСТАВКА ────── │ │ ▭ Пряжа 300г │ │   │ Місто              │
│ │ Місто                │ │ ──────────── │ │   │ [_______________]  │
│ │ [________________]   │ │ Товари  ○○○₴ │ │   │ Відділення         │
│ │ Відділення НП        │ │ Достав. ○○ ₴ │ │   │ [_______________]  │
│ │ [________________]   │ │ Разом   ○○○₴ │ │   │ ┌────────────────┐ │
│ │ ○ Нова пошта         │ │              │ │   │ │     Далі       │ │
│ │ ○ Укрпошта           │ │ persistent   │ │   │ └────────────────┘ │
│ │ ○ Забрати в Яворові  │ │ summary      │ │   │ (summary above,    │
│ │   магазин і вироб-   │ └──────────────┘ │   │  collapsed by      │
│ │   ництво в одному    │                  │   │  default)          │
│ │   місці · графік     │                  │   └────────────────────┘
│ │   гнучкий, телефо-   │                  │
│ │   нуйте · [як доїхати│                  │
│ │ ┌──────────────────┐ │                  │
│ │ │      Далі        │ │                  │
│ └──────────────────────┘                  │
└───────────────────────────────────────────┘
```

**Pickup is «Забрати в Яворові», not «Самовивіз, Косів», and the change is not only the village
name.** [00-client-decisions-3.md](00-client-decisions-3.md) §F2 rules that pickup is an
invitation rather than a cost-saving fallback, so the option carries the place with it: what is
there, the hours caveat, and a link into the directions on §7.15. The price is shown but is not
the headline. A row reading «Самовивіз · 0 ₴» gets selected by buyers who have not registered that
it means driving into a mountain village, and every one of those is a support call
([05-user-flows.md](05-user-flows.md) §5.8 rule 10).

Three steps: contact → delivery → payment. Linear, one decision per screen, with a persistent
summary of prior answers and back navigation that never destroys entered data
([02-ux-research.md](02-ux-research.md) §2.6). Header is reduced to the wordmark plus a cart
link; no navigation, no search, no mascot, no footer links — every exit removed except the
deliberate one.

| Facet | Value |
|---|---|
| **Data** | `Cart` → `Order` + `OrderItem` snapshots; `StockReservation` held during the flow; `PaymentTransaction` on the WayForPay webhook ([25-database-schema.md](25-database-schema.md) §25.5) |
| **States** | Per-field validation on blur then on change; step-level errors above the step; payment failure returns to step 3 with the cart intact and the reservation extended; a network failure mid-submit is idempotent on the `idempotencyKey` |
| **Job** | `autocomplete` on every field, labels always visible, 48 px targets, errors instant and motionless ([13-motion-system.md](13-motion-system.md) §13.11) |

**`{{PSP}}` resolves to WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
The selection blocker is closed; a narrower one replaces it.

**The payment step has two possible layouts and the choice is BLOCKED ON V6.** WayForPay's
available integration mode — hosted redirect page, embedded widget, or direct API — is
unverified, and it changes what this screen looks like:

| V6 answer | What step 3 renders | Interstitial |
|---|---|---|
| **Hosted redirect page** | A method choice and a single "Оплатити" button. Card data is collected on WayForPay's domain | **Yes** — "Переходимо до банку. Ваше замовлення #VCH-26-0417 вже збережене." The order number is on screen before the domain changes |
| **Embedded widget** | Card fields inline inside a PSP-owned iframe, below the method choice. PCI scope stays SAQ-A | **No** — but the 3-D Secure warning moves above the fields, because an embedded form that suddenly jumps to a bank screen is more alarming than a redirect that was announced |
| **Direct API** | **Not a design option.** Card data would touch our servers and raise PCI scope from SAQ-A to SAQ-D. Rejected regardless of V6 | — |

**Build the redirect layout first.** A redirect design degrades into an embedded one cheaply; the
reverse retrofit is expensive, and it is the one that has to be done under time pressure if the
assumption was wrong. Everything outside the branch — order creation before payment, the order
number, the stock reservation, the webhook as source of truth, and the failure return to step 3 —
is identical in both, by design, so resolving V6 changes one screen rather than the flow
([05-user-flows.md](05-user-flows.md) §5.9.2).

**Nothing about WayForPay's API may be written from memory** — signature field order, webhook
payload and acknowledgement, and refund support are verification items V7–V9. A guessed signature
format fails silently in production.

**No account is created or offered at any step**, including on the confirmation page
([00-client-decisions-2.md](00-client-decisions-2.md) §E12). The two legitimate persistence
offers are an address-prefill checkbox («Запамʼятати мої дані на цьому пристрої», first-party
cookie, same device) and an unticked marketing checkbox writing to `NewsletterSubscriber`.

**International checkout is a different screen, not a variant of this one.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F4 rules that carriers are chosen per order,
so there is no rate to calculate and no total to show. The layout changes in four visible ways:

```
NON-UA ADDRESS — checkout step 1, desktop
┌────────────────────────────────────────────────────────────┐
│ Країна ▾  Deutschland                                      │
│ … address fields …                                         │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Доставка                                               │ │
│ │ Ми підбираємо перевізника під кожне замовлення —       │ │
│ │ Нова пошта, Укрпошта або інший. Вартість надішлемо     │ │
│ │ протягом {{QUOTE_SLA_HOURS}} год. З вас нічого не      │ │
│ │ списано.                                               │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⚠  Ціна не включає митні збори та податки країни       │ │ ← BLOCKING
│ │    призначення. Їх сплачує отримувач при отриманні.    │ │   body weight
│ │    Сума залежить від країни та вартості замовлення.    │ │   always open
│ │    ☐ Я розумію, що митні збори оплачую я               │ │ ← gates submit
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  Надіслати замовлення — ми розрахуємо доставку         │ │ ← not «Оплатити»
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

| Change | Rule |
|---|---|
| **The customs block is a blocking element** | Always expanded, in the normal flow of the page between the address and the submit control, at the same size and weight as surrounding body copy. **Never a `<details>`, an accordion, a tooltip, or a link to the legal page.** `/de/zahlung-und-versand` carries the same fact and is not sufficient (§7.19b). An unticked acknowledgement checkbox gates the submit control — the one place in this checkout where friction is the point |
| **The submit control does not promise a price** | «Надіслати замовлення — ми розрахуємо доставку». A button labelled «Оплатити» on a screen with no total is the fastest way to make a working flow feel broken |
| **No total, and no estimated range** | The summary shows goods subtotal and «Доставка — розрахуємо», not a guess. A range invites anchoring on its low end and makes an accurate quote read as a bait-and-switch |
| **COD absent, free shipping absent** | COD is removed with one sentence saying why, not rendered disabled. `{{FREE_SHIPPING_THRESHOLD}}` messaging is suppressed entirely on non-UA addresses — free shipping never applies internationally at any order value ([00-client-decisions-3.md](00-client-decisions-3.md) §F4) |

Payment happens later, on a separate route — `/{locale}/{order-seg}/{number}/{pay-seg}` — reached
from the quote email or from the order-status page. Full flow, order state and anti-abandonment
rules at [05-user-flows.md](05-user-flows.md) §5.9.4; route at
[04-sitemap.md](04-sitemap.md) §4.3. The quote arrives within **48 working hours**, stated to the
customer as «протягом 2 робочих днів», and is payable for **72 hours** — 36 for a one-of-one item
([00-client-decisions-5.md](00-client-decisions-5.md) §H2). Both figures render on this screen, in
the quote email and on the status page, as an absolute date rather than a countdown.

### 7.6a The payment step renders what the server sent, and nothing else

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.1 is a wireframe constraint as much as a
security one: **the available methods are derived server-side from the cart contents.** If any line
carries `madeToOrderDays`, the COD option is absent from the response, not hidden in the UI. Locale
does the same — COD with inspection is Ukraine-only (§H1.2).

The consequence for this screen is that **there is no disabled-method state to draw.** No greyed
row, no strike-through, no "unavailable for your cart" tooltip. Where the absence has a reason the
buyer would otherwise wonder about, the step carries one sentence above the list — «Виріб на
індивідуальний розмір оплачується наперед» — because an unexplained absence reads as a missing
feature, while a disabled row reads as a rejection and invites a tap that does nothing
([02-ux-research.md](02-ux-research.md) §2.6).

```
STEP 3 — PAYMENT, uk, stocked cart
┌────────────────────────────────────────────────────────────┐
│ ── 3 ОПЛАТА ───────────────────────────────────────────────│
│ ○ Картою онлайн                                            │ 56px
│   Visa · Mastercard · Apple Pay                            │
│ ● Наложений платіж з оглядом                               │ 56px
│   Оглянете посилку на пошті перед оплатою                  │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Наложений платіж з оглядом                             │ │ ← THE DEPOSIT
│ │                                                        │ │   BLOCK.
│ │ Зараз, карткою:                                        │ │   Expanded.
│ │   доставка туди                        120 ₴           │ │   Above the
│ │   доставка назад                       120 ₴           │ │   button.
│ │   ────────────────────────────────────────             │ │   Never an
│ │   разом                                240 ₴           │ │   accordion.
│ │                                                        │ │
│ │ На пошті, після огляду:                                │ │
│ │   ціна товару                        7 400 ₴           │ │
│ │   мінус доставка назад                −120 ₴           │ │
│ │   ────────────────────────────────────────             │ │
│ │   до сплати                          7 280 ₴           │ │
│ │                                                        │ │
│ │ Якщо не заберете — більше нічого не платите.           │ │
│ │ Посилка повернеться за вже оплаченою доставкою.        │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │              Оплатити 240 ₴                            │ │ 56px
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Why this block is drawn with real numbers rather than described.**
[00-client-decisions-5.md](00-client-decisions-5.md) §H1.3 states that the entire risk of this rule
is the wording. The mechanic is fair — an honest buyer pays nothing extra, because the return leg
comes straight off what they owe at the counter — but framed carelessly it reads as *pay extra for
permission to look at the goods*, which would be worse than not offering inspection at all. §H1.3
requires **a worked example in three real numbers**, never prose and never percentages, because
showing the arithmetic is what converts a suspicious-sounding rule into an obviously fair one.

| Rule | Detail |
|---|---|
| Position | Above the pay button, in the normal flow. It is the justification for the amount on the button, and a justification met after the action is not one |
| Disclosure state | **Expanded at every breakpoint, including 320 px. Never an accordion, never «Детальніше», never a tooltip** ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| Alignment | Labels left, numbers right on a shared edge, `tabular-nums`. The vertical alignment *is* the explanation — it is what makes `7 400`, `−120` and `7 280` read as a subtraction rather than as three unrelated figures |
| Vocabulary | The word «депозит» does not appear. It is accurate and it is the worst available framing |
| Locale | **Ukraine only.** Absent for `en`, `pl` and `de` — under the EU Consumer Rights Directive a trader may not require a deposit against the unconditional 14-day right of withdrawal. There is no locale branch in the component: the block is absent because the method is absent (§7.6a) |
| Carrier commission | Itemised **separately** from the deposit. They are different things, and merging them into one number destroys the arithmetic the block exists to show |
| Approval | **The copy is not client-approved yet** (§H5 item 4). The mechanic, the layout and the alignment are settled; the exact string ships after review |

### 7.6b The mixed-cart disclosure — an announcement at the add, not a screen at checkout

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b makes this the **expected** case, not an
edge case: because `allowsCustomSize` is per product, a buyer can add a stocked ліжник and a custom
one from the same product page in two taps.

**Such a cart is one order, one parcel, one delivery charge, dispatched after the fourteen-day
production period** ([00-client-decisions-6.md](00-client-decisions-6.md) §J1). An earlier round
specified a split screen here — two cards, two order numbers, two delivery fees — and that screen
is **deleted, not deferred**. The split saved a few days on the stocked line and charged the buyer
a second delivery fee for them, while handing a two-person business a second parcel and a second
waybill. What the split did well was warn the customer early, and that is the part kept.

**The disclosure fires at the add, and the reason is the whole design.** Adding a made-to-measure
item changes the terms of the item already in the cart: a stocked ліжник that was on «наложений
платіж з оглядом» and shipping tomorrow becomes prepaid and ships in two weeks, because of a
*different line*. Meeting that at the payment step — after an address, a phone number and a carrier
branch have been entered — reads as a bait-and-switch. So it is said at the press of «Додати в
кошик» (§7.4b), and it stands in the cart (§7.5) and in the checkout summary (§7.6) thereafter.

```
ADD-TO-CART CONFIRMATION, DESKTOP 1440      MOBILE 375
┌──────────────────────────────────────┐   ┌────────────────────┐
│ ✓ Додано в кошик                     │   │ ✓ Додано в кошик   │
│   Ліжник «Черемош» · 180 × 240 см    │   │ Черемош 180×240    │
│                                      │   │                    │
│ ┌──────────────────────────────────┐ │   │ ┌────────────────┐ │
│ │ ⚙ У кошику є виріб на            │ │   │ │ ⚙ У кошику є   │ │
│ │   індивідуальний розмір.         │ │   │ │ виріб на інди- │ │
│ │   Усе замовлення відправимо      │ │   │ │ відуальний     │ │
│ │   разом, коли він буде готовий — │ │   │ │ розмір. Усе    │ │
│ │   через 14 днів.                 │ │   │ │ замовлення     │ │
│ │   Оплата — повна, наперед.       │ │   │ │ відправимо     │ │
│ │                                  │ │   │ │ разом, коли він│ │
│ │   Потрібен ліжник зі складу      │ │   │ │ буде готовий — │ │
│ │   раніше? Оформіть його окремим  │ │   │ │ через 14 днів. │ │
│ │   замовленням — тоді він поїде   │ │   │ │ Оплата — повна,│ │
│ │   одразу.                        │ │   │ │ наперед.       │ │
│ └──────────────────────────────────┘ │   │ │ …окремим       │ │
│                                      │   │ │ замовленням    │ │
│ [ Перейти в кошик ] ‹ Далі за товарами│   │ └────────────────┘ │
└──────────────────────────────────────┘   │ [Перейти в кошик]  │
                                            └────────────────────┘
```

| Decision | Reasoning |
|---|---|
| **It fires at the add, not at checkout** | The consequence lands on a line the customer added earlier, and the moment they can still cheaply act on it is now. At checkout the same sentence is a term that changed under them; here it is a fact about a cart they are still building |
| **It is a statement, not a confirmation dialogue** | The add succeeds. Interrupting a successful action with «Ви впевнені?» treats a legitimate purchase as a mistake, and a dialogue that always appears is a dialogue that is always dismissed |
| **All three consequences, in this order: shipped together · 14 days · full prepayment** | They are one causal chain and splitting them across surfaces is how one of them gets missed. The fourteen days is the fact that changes the customer's plan, so it precedes the payment term |
| **The escape is a suggestion, never a system action** | «Оформіть його окремим замовленням» is something the customer does by placing two orders. The site does not split anything, does not offer a button that splits anything, and does not create a second order on the customer's behalf (§J1) |
| **The benefit is attached to the escape** | «тоді він поїде одразу» — the suggestion is only actionable if the buyer can see what it buys them. Without it the sentence reads as the site declining to help |
| **Never collapsed, at any width** | Same rule as the customs notice and the deposit block: it changes what the customer is agreeing to pay and when ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| **Announced, not only drawn** | The confirmation container is `role="status"`, `aria-live="polite"`. A screen-reader user pressing «Додати в кошик» must hear that the terms of another line just changed; a purely visual banner tells them nothing ([12-accessibility.md](12-accessibility.md)) |
| **It persists** | Non-dismissible in the cart summary (§7.5) and in the checkout order summary (§7.6). It is announced once and visible thereafter — a customer who returns to a cart three days later has forgotten the announcement |

**What the customer never sees, because it no longer exists:** a second order number, a second
delivery fee, a second confirmation email, a «Це 1 з 2 замовлень» line, or a pair of orders under
one lookup at §7.8. There is one order and one of everything
([05-user-flows.md](05-user-flows.md) §5.9.5).

**And §7.6a's deposit block does not render on this order.** The return-shipping deposit funds the
return leg of a parcel a buyer may refuse at the counter, which is a cash-on-delivery mechanic
([00-client-decisions-6.md](00-client-decisions-6.md) §J2). A mixed cart is prepaid in full and has
no refusal step, so the block is absent for the same reason the COD row is: the method it belongs
to is not in the server-derived list.

**Removing the custom line reverses everything.** The banner disappears, the stocked line's
original terms return — «наложений платіж з оглядом», next-day dispatch — and §7.6a's method list
regains its COD row on the next server-derived read. The reversal is as visible as the disclosure
was, because a constraint that silently lifts leaves the customer still believing it applies.

---

## 7.7 Order confirmation

`/{locale}/order/{guestToken}/confirmation`

**Purpose.** Convert a transaction into a relationship, and make the next 48 hours predictable.
**Trust job.** The highest-anxiety moment on the site is the five seconds after paying.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│              ⌒⌒  sheep, single colour     │   │      ⌒⌒            │
│             (••)                          │   │     (••)           │
│        Дякуємо. Замовлення VCH-26-0417    │   │ Дякуємо.           │
│        Ми надіслали підтвердження на      │   │ VCH-26-0417        │
│        m***@gmail.com                     │   │ ┌────────────────┐ │
│ ┌───────────────────────┐ ┌─────────────┐ │   │ │ Що далі:       │ │
│ │ ЩО ДАЛІ               │ │ ▭ Черемош   │ │   │ │ 1 Підтвердження│ │
│ │ 1 Підтвердимо до 24 год│ │ ▭ Пряжа    │ │   │ │ 2 Пакування    │ │
│ │ 2 Спакуємо за 1–2 дні │ │ Разом ○○○ ₴ │ │   │ │ 3 Відправлення │ │
│ │ 3 Надішлемо ТТН у SMS │ │ Нова пошта  │ │   │ └────────────────┘ │
│ └───────────────────────┘ │ Львів, №12  │ │   │ [Відстежити]       │
│ [Відстежити замовлення]   └─────────────┘ │   │ Зберегти посилання │
│ Зберегти це посилання — воно працює       │   └────────────────────┘
│ без реєстрації                            │
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Order` by `guestToken` + `OrderItem` snapshots + `OrderEvent` ([25-database-schema.md](25-database-schema.md) §25.5) |
| **Slots** | Order number (16) · masked email (32) · three next-steps (48 each) · tracking CTA (28) |
| **States** | **Paid:** as drawn. **Pending (bank transfer / COD):** payment instructions replace the "what next" list and the tone changes to instruction. **Awaiting quote (international):** see below. **Failed:** never reached — a failed payment returns to checkout step 3. **Invalid or expired token:** a lookup form keyed by order number plus email, not a 404 |
| **Job** | Sets expectations in hours and days, not adjectives, and hands the guest a durable URL |

The mascot is permitted and correct here: a moment of relief after a payment is exactly the
low-stakes delight the §1.7 treatment is for.

**The guest-token URL is the single most important element on the page**, and round 2 raises its
importance rather than lowering it. [00-client-decisions-2.md](00-client-decisions-2.md) §E12
makes guest checkout permanent, so a buyer who loses this link has no account to fall back on —
not "not yet", but ever. It is therefore repeated in the confirmation email, shown as a copyable
URL rather than only as a button, and accompanied by «Зберігайте це посилання — воно працює без
реєстрації». The fallback when it is lost is the order-lookup form at §7.8, which is why that
page is specified as a first-class surface rather than a utility.

**There is no "create an account to track this order" prompt here**, and there must never be
one. It is the conventional placement for that offer, which is exactly why it needs stating: an
account cannot be created, and an offer that leads nowhere on the highest-trust screen of the
whole purchase is worse than no offer.

**EU orders carry two extra lines** — the 14-day right of withdrawal and a link to the model
withdrawal form ([04-sitemap.md](04-sitemap.md) §4.5) — in both the page and the email.

**A made-to-order line replaces «Спакуємо за 1–2 дні» with a date.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 4 is specific: the confirmation
restates **the date, not the duration**.

```
ЩО ДАЛІ — order containing a custom size
 1 Підтвердимо до 24 год
 2 Виготовимо за вашими розмірами — 180 × 240 см
 3 Очікувана відправка: 12 жовтня            ← a date, not «14 днів»
 4 Далі — доставка перевізником, ТТН у SMS   ← transit is named separately
```

«Очікувана відправка: 12 жовтня» is checkable against a calendar. «Протягом 14 днів» is a memory
test the customer will fail, and the failure surfaces on day fifteen as a complaint. Step 4 exists
because G2 rule 1 forbids any construction that implies the fortnight includes delivery — the
dispatch date and the transit are two facts and they get two lines.

**A COD order restates the arithmetic.** The confirmation and its email carry the same three
numbers as the deposit block (§7.6a): what was charged now, and what is payable at the counter —
«На пошті: 7 280 ₴». The customer will be standing at that counter with a phone in their hand, and
the number they were told must be the number they are asked for.

**Both phone numbers appear in the confirmation email, Іван first.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G1 names this surface explicitly: «a customer
with a problem should not have to guess». The header carries one number because chrome must not
present a choice; an email is read by someone who already has a problem. Where the email names the
seller — the invoice block, the offer-contract reference — it names **ФОП Гондурак Любов Юріївна**,
and that divergence from the phone order is deliberate.

### 7.7b The awaiting-quote variant — international orders

An international order reaches this page with no total and nothing charged
([05-user-flows.md](05-user-flows.md) §5.9.4). The page must still read as a completed action,
because the buyer has just done everything they were asked to do.

```
DESKTOP 1440 / MOBILE 375
┌───────────────────────────────────────────────────────────┐
│              ⌒⌒                                           │
│             (••)                                          │
│    Замовлення VCH-26-0418 прийнято.                       │
│    З вас нічого не списано.                               │
│ ┌───────────────────────────┐ ┌─────────────────────────┐ │
│ │ ЩО ДАЛІ                   │ │ ▭ Черемош        ○○○ ₴  │ │
│ │ 1 Підберемо перевізника   │ │ ▭ Пряжа 300 г     ○○ ₴  │ │
│ │ 2 Надішлемо вартість      │ │ ─────────────────────── │ │
│ │   доставки — до           │ │ Товари           ○○○○ ₴ │ │
│ │   {{QUOTE_SLA_HOURS}} год │ │ Доставка      розрахуємо│ │
│ │ 3 Ви оплатите за          │ │ Разом         після     │ │
│ │   посиланням з листа      │ │               розрахунку│ │
│ └───────────────────────────┘ └─────────────────────────┘ │
│ ⓘ Митні збори країни призначення оплачує отримувач.       │
│ [Стежити за замовленням]                                  │
│ Зберігайте це посилання — воно працює без реєстрації      │
└───────────────────────────────────────────────────────────┘
```

| Difference from the paid variant | Why |
|---|---|
| «З вас нічого не списано» is a **headline line**, not a footnote | Payment ambiguity after a form submission is what produces the duplicate submit and the support email. It is the second thing the buyer reads |
| The total row reads «після розрахунку», never `0 ₴` or a range | A zero is arithmetic the buyer will believe; a range is an anchor the real quote will violate |
| «Що далі» is three steps with a **number of hours in it** | `{{QUOTE_SLA_HOURS}}` is on the page, in the email, and on the status page. «Найближчим часом» is banned copy here |
| The customs line is restated | Third of the three required repetitions ([05-user-flows.md](05-user-flows.md) §5.9.3) |
| The tracking CTA is the primary control | It is the buyer's only way to reach the quote if the email is filtered, which makes it load-bearing rather than convenient |

The mascot is still correct here: the order was placed successfully and the moment is a relieved
one. What is not permitted is any control that looks like a payment affordance, because there is
nothing yet to pay.

---

## 7.8 Order tracking — guest, no account

`/{locale}/order/track` and `/{locale}/order/{guestToken}`

**Purpose.** Answer "where is my order" without an account.
**Trust job.** Anxiety A4. A distance purchase from a small Ukrainian producer with no tracking
is the category norm this page exists to break.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Відстеження замовлення                    │   │ Відстеження        │
│ ┌───────────────────────────────────────┐ │   │ Номер замовлення   │
│ │ Номер замовлення  [VCH-26-____]       │ │   │ [______________]   │
│ │ Email або телефон [______________]    │ │   │ Email або телефон  │
│ │ [ Знайти ]                            │ │   │ [______________]   │
│ └───────────────────────────────────────┘ │   │ [    Знайти    ]   │
│ ── found ─────────────────────────────────│   │ ── found ──────────│
│ ● Прийнято    28 вер, 14:02               │   │ ● Прийнято         │
│ ● Оплачено    28 вер, 14:05               │   │ ● Оплачено         │
│ ● Пакування   29 вер, 09:40               │   │ ● Пакування        │
│ ○ Відправлено                             │   │ ○ Відправлено      │
│ ○ Доставлено                              │   │ ○ Доставлено       │
│ ТТН 2045 0012 3456  [Відстежити в НП →]   │   │ ТТН 2045 0012 3456 │
└───────────────────────────────────────────┘   └────────────────────┘

MADE-TO-ORDER VARIANT — the IN_PRODUCTION row
┌───────────────────────────────────────────────────────────┐
│ ● Прийнято         28 вер, 14:02                          │
│ ● Оплачено         28 вер, 14:05                          │
│ ● Виготовляється   з 29 вер                               │ ← named state
│   Ліжник «Черемош», 180 × 240 см                          │   expanded
│   Очікувана відправка: 12 жовтня                          │ ← a DATE
│   Далі — доставка перевізником                            │
│ ○ Пакування                                               │
│ ○ Відправлено                                             │
│ ○ Доставлено                                              │
│                                                           │
│   ✗ no progress bar    ✗ no percentage                    │
│   ✗ no «залишилось 9 днів»                                │
└───────────────────────────────────────────────────────────┘
```

**`IN_PRODUCTION` exists because of this screen.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G2 adds the status between `CONFIRMED` and
`PACKING`, and the justification is entirely about what a customer reads here: someone who paid for
a custom ліжник and sees «Оплачено» unchanged for twelve days assumes the order is stuck, and
contacts support. A status that names what is actually happening removes that contact and replaces
anxiety with anticipation — the emotionally correct state for a handmade purchase. `PACKING` does
not cover a fortnight of weaving, which is why a new member was cheaper than overloading an
existing one.

| Rule | Why |
|---|---|
| The row carries an **expected dispatch date**, not a remaining duration | «Очікувана відправка: 12 жовтня» is checkable. «Залишилось 9 днів» is a number the customer re-derives on every visit and reads as a promise (§G2 rule 4) |
| **No progress bar, no percentage** | A fortnight of weaving has no measurable progress. A bar stuck at 40% for four days produces exactly the support contact the status was added to prevent |
| The current state is the **only expanded row** | Past states collapse to a line and a tick, future states are unfilled circles. On mobile this is what keeps the timeline inside one screen ([33-responsive-strategy.md](33-responsive-strategy.md) §33.4) |
| The dimensions are restated on the row | The buyer specified them a fortnight ago from a phone. Seeing `180 × 240 см` on the status page is how they confirm the workshop is making the right thing |
| «Далі — доставка перевізником» is a separate line | G2 rule 1. The timeline is the surface where "14 days" would most naturally be misread as delivery |

**Three more variants this page carries:** an `AWAITING_QUOTE` order shows the quote deadline as an
absolute date with «з вас нічого не списано» (§7.7b); a COD order shows the counter amount restated
with the §7.6a arithmetic; and a **mixed order renders as one order with one dispatch date** — the
stocked line sits in the same timeline as the custom one and waits with it, because there is one
parcel ([00-client-decisions-6.md](00-client-decisions-6.md) §J1,
[05-user-flows.md](05-user-flows.md) §5.9.5). There is no linked-order row, no pair lookup and no
second tracking number to reconcile.

| Facet | Value |
|---|---|
| **Data** | `Order.guestToken` for the direct URL; the form matches `Order.number` + (`email` or `phone`). `OrderEvent` drives the timeline; `trackingNumber` links out to the carrier ([25-database-schema.md](25-database-schema.md) §25.5) |
| **Slots** | Order number (16) · contact (40) · 5 status rows with timestamps · TTN (20) |
| **States** | **Idle:** form only. **Loading:** button spinner, width preserved. **Not found:** a single neutral message with no hint as to which field was wrong — an enumerable lookup is an order-data leak. **Rate-limited:** 5 attempts per 15 minutes per IP. **Found:** timeline. **Cancelled / returned:** the timeline shows the terminal state plus the reason and a contact route |
| **Job** | Removes the "I have to email them to find out" step entirely |

**This is the only order-retrieval surface on the site, permanently.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 rules out customer accounts entirely,
so there is no login to require, none to suggest, and no authenticated alternative behind it.
That changes how this page must be built: it is not a guest fallback beside a real account panel,
it is the account panel's complete replacement, and it carries reorder, the return entry point
and the full `OrderEvent` timeline because nothing else can.

**Access is by possession, not identity**, which is the right security posture once there are no
passwords to steal. The threat model here is order enumeration, not credential stuffing — the
tokenised link is unguessable, the manual form returns a uniform not-found regardless of which
field was wrong, and a successful match emails a magic link rather than granting access inline.
Removing customer credentials from the project removes customer credential-stuffing exposure from
it as well, which is a real security gain and not merely a scope reduction.

---

## 7.9 About

`/{locale}/about`

**Purpose.** Carry the 30-year story in prose, where it belongs.
**Trust job.** Rank-2 evidence — named, faced people. Target: >18% of homepage sessions reach
this page or `/production` ([01-brand-strategy.md](01-brand-strategy.md) §1.10).

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ ░░ FULL-BLEED HERO, workshop, people ░░░░ │   │ ░ HERO 420px     ░ │
│ ░ Понад 30 років виробляємо натуральні  ░ │   │ ░ Понад 30 років ░ │
│ ░ вовняні вироби в Карпатах             ░ │   │ Ті самі машини…    │
│ ── editorial grid, text cols 3–9 ─────────│   │ ┌────────────────┐ │
│ Ті самі машини. Ті самі руки.             │   │ │ IMG full bleed │ │
│ Body copy, 62–68ch, container-narrow      │   │ └────────────────┘ │
│   ┌───────────────┐                       │   │ Люди               │
│   │ IMG breaks to │  «Вовну не можна      │   │ ┌────┐┌────┐┌────┐ │
│   │ col 11, bleeds│   поспішати.»         │   │ │port││port││port│ │
│   └───────────────┘   — {{FOUNDER_NAME}}  │   │ └────┘└────┘└────┘ │
│ ── ЛЮДИ ──────────────────────────────────│   │ [Виробництво →]    │
│ ┌──────┐┌──────┐┌──────┐┌──────┐          │   └────────────────────┘
│ │portr.││portr.││portr.││portr.│  name+role│
│ └──────┘└──────┘└──────┘└──────┘          │
│ [Подивитись виробництво →]                │
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Setting["about.*"]` per-locale blocks + `MediaAlbum` `key="team"`; no dedicated CMS model, because this page changes once or twice a year |
| **Slots** | Hero line (64) · chapter headings (48) · body (62–68ch) · pull quote (140) · person name (32) + role (28) |
| **States** | Missing portraits → the People band is omitted rather than shown with placeholder avatars. Missing translation → `uk` fallback with `x-translation-fallback` ([25-database-schema.md](25-database-schema.md) §25.2) |
| **Job** | Converts the 30-year claim from an assertion into a narrative with machines and names attached |

**Binding copy constraint.** No registration date, no "компанія заснована", no certificate
imagery, no anniversary seal ([00-client-decisions.md](00-client-decisions.md) §D1). The claim
attaches to the manufacturing. `Organization.foundingDate` is not set to 1992 in the structured
data on this page or any other.

**Place is a named asset on this page — but it is the body copy's asset, not the hero's.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E2 resolves the workshop to **с. Яворів,
Косівський район** — the village called «столиця ліжникарства», home of the Музей ліжникарства
and of the Шкрібляк and Корпанюк woodcarving families. The previous revision put Яворів in the
hero line. **[00-client-decisions-3.md](00-client-decisions-3.md) §F6 withdraws that**: the
client-approved «Понад 30 років виробляємо натуральні вовняні вироби **в Карпатах**» stands, here
as on the homepage.

The reasoning is not sentimental. «Карпати» is understood on sight by every audience, including
the `en`/`pl`/`de` buyers this page has to work for; «Яворів» requires knowledge the reader may not
have at the moment they read a headline, and a hero line is not the place to teach a proper noun.
Яворів is introduced **one screen down**, in the first chapter of body copy, where there is room
to say what it is — the lizhnyk capital, the museum, the weaving lineage — and where the reader
has already decided to keep reading. That is the whole pattern: **«Карпати» to be understood,
«Яворів» to be believed.** The headline earns attention; this page earns trust.

Яворів also carries the visit invitation on this page (§7.15,
[03-information-architecture.md](03-information-architecture.md) §3.7.3): the People band ends
with the address as a sentence rather than a footer NAP, because once the reader knows who these
people are, where they work is the natural next fact — and it is now a place with a shop in it
([00-client-decisions-3.md](00-client-decisions-3.md) §F2).

One constraint on all of this copy: **never imply that Вівчарик holds a heritage designation** —
the craft may be listed on Ukraine's intangible-heritage register, a company is not, and the exact
status and wording must be confirmed before any such reference is published (§E2).

`--section-y-lg`, asymmetric editorial grid ([11-spacing-system.md](11-spacing-system.md) §11.3),
Mask on image reveals, at most three parallax elements per viewport.

---

## 7.10 Production

`/{locale}/production`

**Purpose.** Show the full cycle stage by stage, at length.
**Trust job.** Rank-1 and rank-3 evidence together. This is the page the wholesale buyer opens
before filling in the form, and the page the tourist opens before spending four figures.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ ░░ FULL-BLEED VIDEO, factory in motion ░░ │   │ ░ POSTER + play  ░ │
│ ┌─────────┐ 01 ─────────────────────────  │   │ ── 01 Миття ───────│
│ │ sticky  │ МИТТЯ                         │   │ ┌────────────────┐ │
│ │ stage   │ ┌──────────────────────────┐  │   │ │ IMG 4:3        │ │
│ │ nav     │ │ IMG 16:9, mask reveal    │  │   │ └────────────────┘ │
│ │ 01 ●    │ └──────────────────────────┘  │   │ Промислове миття…  │
│ │ 02 ○    │ Промислове миття руна…        │   │ ── 02 Чесання ─────│
│ │ 03 ○    │ ── 02 ──────────────────────  │   │  … stages stack    │
│ │ 04 ○    │ ЧЕСАННЯ                       │   │ ── ОБЛАДНАННЯ ─────│
│ │ 05 ○    │ …                             │   │ ── CTA ────────────│
│ └─────────┘                               │   └────────────────────┘
│ ── ОБЛАДНАННЯ ── machines, with ages ─────│
│ ── ПРИЇЗДІТЬ ── shop + production, Яворів │
│ ── CTA: Каталог · Опт ────────────────────│
└───────────────────────────────────────────┘
```

**The visit band is new, and it belongs at the end of the stage sequence.** The address is a shop
as well as a production floor ([00-client-decisions-3.md](00-client-decisions-3.md) §F2), and
someone who has just read the whole process is the single most likely visitor on the site to want
to see it. One line — «Приїздіть: магазин і виробництво в одному місці, с. Яворів» — with the
variable-hours caveat, both numbers, and a link to the directions on §7.15. It costs one band and
it converts a claim the reader just finished into an open invitation
([03-information-architecture.md](03-information-architecture.md) §3.7.3). The caveat is not
optional: an invitation to a place that turns out to be shut damages the Google Business Profile
this whole chain exists to support.

| Facet | Value |
|---|---|
| **Data** | Stage keys from the seeded `productionStage` vocabulary; imagery from `MediaAlbum` `key="production-stages"`; `Product.productionStage[]` deep-links here with a `#stage-<key>` anchor from every own-manufacture PDP |
| **Slots** | Stage number (2) · stage name (20) · stage body (320) · machine name (32) + age (12) |
| **States** | A stage with no media renders as type only, numbered, never as an empty frame. Fewer than three photographed stages → the page degrades to a single narrative column. Video absent → poster and prose |
| **Job** | Substantiates the age claim with visible machinery, which is the only evidence available given that no certificates exist (§D1) |

**Stage count is data, not layout.** §D1 names промислове миття, чесання, прядіння, ткання and
пошиття directly; drying and finishing are inferred from
[00-assumptions.md](00-assumptions.md) A4. The sticky stage nav, the anchors, and the heading
numerals are all generated from the array, so confirming five, six or seven stages is a content
change.

**Partner products never appear on this page.** Nothing shown here may be something the factory
did not make ([00-client-decisions.md](00-client-decisions.md) §D3 rule 5).

---

## 7.11 Wholesale

`/{locale}/wholesale`. **Full specification: [19-wholesale-page-specification.md](19-wholesale-page-specification.md).**

**Purpose.** Qualify and capture B2B leads.
**Conversion job.** `Lead` rows with enough structure to be triaged without a phone call.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Повний цикл. Одні руки.                   │   │ Повний цикл.       │
│ Виробництво, дропшипінг, пошиття на замов. │   │ Одні руки.         │
│ ┌─────────┬─────────┬─────────┐            │   │ ┌────────────────┐ │
│ │ ОПТ     │ДРОПШИПІН│ПІД БРЕНД│ 3 offers   │   │ │ ОПТ            │ │
│ │ знижки  │ доставка│ колір,  │            │   │ ├────────────────┤ │
│ │ до 20%  │ клієнту │ розмір  │            │   │ │ ДРОПШИПІНГ     │ │
│ └─────────┴─────────┴─────────┘            │   │ ├────────────────┤ │
│ ── ПОТУЖНІСТЬ ── {{CAPACITY_MONTHLY}} ────│   │ │ ПІД БРЕНД      │ │
│ ── ФАБРИКА ── video, named stages ────────│   │ └────────────────┘ │
│ ┌───────────────────────────────────────┐ │   │ ── потужність ─────│
│ │ ФОРМА: тип бізнесу ▾ · країна ▾ ·     │ │   │ ── форма ──────────│
│ │ обсяг ▾ · контакт · повідомлення      │ │   │  one field per row │
│ │ [ Надіслати ]  Відповідь до {{SLA}} год│ │   │ [   Надіслати   ]  │
│ └───────────────────────────────────────┘ │   └────────────────────┘
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Lead` with `kind`, `businessType`, `estimatedVolume`, `country`, `utm`, `sourcePath` ([25-database-schema.md](25-database-schema.md) §25.8) |
| **States** | Idle · validating · submitting (button width preserved) · success (inline, with the SLA restated) · error (retry, all entered data preserved) · rate-limited |
| **Job** | Three named offers, each mapping to a distinct `LeadKind`: `WHOLESALE`, `DROPSHIP`, `PRIVATE_LABEL` |

`LeadKind` needs a **`DROPSHIP`** member. Dropshipping was absent from the brief and is a real,
distinct offer; folding it into `WHOLESALE` makes the lead queue unsortable by the one axis that
determines how a lead is handled.

**Origin disclosure is mandatory on this page**, not optional. Wholesale buyers are the audience
most likely to discover the partner range and the most damaged by discovering it late
([00-client-decisions.md](00-client-decisions.md) §D3). The capacity block states
**own-manufacture capacity only**, and partner goods are offered as a separate, clearly labelled
line — labelled, not named: the partner cannot be identified
([00-client-decisions-2.md](00-client-decisions-2.md) §E7). For this audience that is the more
demanding constraint, because a trade buyer will ask who makes the resold range, and the answer
must be a confident «інший виробник, Косівщина» rather than an evasion. Not being able to name the
partner is a reason to raise the prominence of the disclosure, not to lower it. No mascot on this
page.

---

## 7.12 Blog index

`/{locale}/journal`

**Purpose.** The editorial surface. On a cold-start domain it is also the primary organic entry
point for the first two quarters (§D2).
**Conversion job.** Assisted. Long-tail informational queries are what a new domain can actually
rank for; commercial head terms are not available for a year.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Журнал                                    │   │ Журнал             │
│ [Усі][Догляд][Ремесло][Вовна][Пряжа]      │   │ [Усі][Догляд][…] → │
│ ┌───────────────────────────────────────┐ │   │ ┌────────────────┐ │
│ │ FEATURED, 16:9, latest post           │ │   │ │ FEATURED 3:2   │ │
│ │ ДОГЛЯД · 6 хв · 12 бер. 2026          │ │   │ │ Як прати ліжник│ │
│ │ Як прати ліжник, щоб він пережив вас  │ │   │ └────────────────┘ │
│ └───────────────────────────────────────┘ │   │ ┌────────────────┐ │
│ ┌────────┐┌────────┐┌────────┐            │   │ │ post           │ │
│ │ 3:2    ││ 3:2    ││ 3:2    │ 3-col grid │   │ └────────────────┘ │
│ └────────┘└────────┘└────────┘            │   │  … stacked         │
│ ‹ 1 2 3 ›                                 │   │ ‹ 1 2 ›            │
└───────────────────────────────────────────┘   └────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Post` `status=PUBLISHED && publishedAt ≤ now` order desc, with `PostTag` for the filter chips and `coverMedia` ([25-database-schema.md](25-database-schema.md) §25.8) |
| **Slots** | Tag (18) · read time (8) · title (72) · excerpt (160) · date (16) |
| **States** | **Empty:** «Перші статті скоро» plus a newsletter form — it will be empty at launch and must look deliberate. **Tag filtered to zero:** names the tag and clears it. **Loading:** skeleton cards. **Error:** retry |
| **Job** | Pagination is numbered and crawlable for the same reason as §7.2.8 |

---

## 7.13 Blog article

`/{locale}/journal/{slug}`

**Purpose.** Answer one question completely.
**Trust job.** Demonstrates knowledge rather than claiming it, and is the content AI answer
engines extract and cite.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Головна › Журнал › Догляд                 │   │ ‹ Журнал           │
│              ДОГЛЯД · 6 хв · 12 бер. 2026 │   │ ДОГЛЯД · 6 хв      │
│              Як прати ліжник, щоб він     │   │ Як прати ліжник…   │
│              пережив вас        h1        │   │ ┌────────────────┐ │
│ ┌───────────────────────────────────────┐ │   │ │ COVER 3:2      │ │
│ │ COVER 16:9, mask reveal, LCP element  │ │   │ └────────────────┘ │
│ └───────────────────────────────────────┘ │   │ ▸ Зміст            │
│ ┌────────┐ container-narrow, 62–68ch      │   │ Body 62–68ch       │
│ │ ЗМІСТ  │ Body copy…                     │   │ ── related ────────│
│ │ sticky │   ┌──────────────────────┐     │   │ ── products ───────│
│ │ ToC    │   │ pull quote, col 2    │     │   └────────────────────┘
│ │ 01 ●   │   └──────────────────────┘     │
│ │ 02 ○   │ …                              │
│ └────────┘ ── ПОВ'ЯЗАНІ ТОВАРИ ── 3 cards │
│            ── ЧИТАТИ ДАЛІ ── 3 posts      │
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `PostTranslation.bodyJson` renders; `bodyPlain` feeds search and AI extraction; `Post.readMinutes`, `coverMedia`, `PostTag`; related products via an explicit editorial link, not a keyword match |
| **Slots** | Title (72) · excerpt (160) · body (unbounded, 62–68ch measure) · ToC entries (40) |
| **States** | Missing translation → `uk` fallback with a visible notice, never a 404. Missing cover → the article opens on type, which is a legitimate editorial treatment |
| **Job** | `Article` structured data, author, dates, and a stable heading outline so passages are extractable ([30-ai-search-optimization.md](30-ai-search-optimization.md)) |

Cover image is the LCP element, eager and `fetchpriority="high"`, never animated on entrance
([13-motion-system.md](13-motion-system.md) §13.8). Editorial links use `sky-600` (≈5.3:1).

---

## 7.14 Gallery / albums

`/{locale}/gallery` and `/{locale}/gallery/{album-key}`

**Purpose.** Show the place at volume, without a sales frame.
**Trust job.** Rank-1 and rank-2 evidence in bulk. Cheap to produce, and it is the page a
sceptical visitor opens to check whether the factory photographs are a set of three.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Галерея                                   │   │ Галерея            │
│ ┌─────────────┐┌─────────────┐            │   │ ┌────────────────┐ │
│ │ ALBUM cover ││ ALBUM cover │  4:3, 2-col│   │ │ ALBUM cover    │ │
│ │ Цех, зима   ││ Вівці       │            │   │ │ Цех, зима · 24 │ │
│ │ 24 фото     ││ 18 фото     │            │   │ └────────────────┘ │
│ └─────────────┘└─────────────┘            │   │  … stacked         │
│ ── album view ────────────────────────────│   │ ── album view ─────│
│ masonry, 3 cols, lazy, lightbox on click  │   │ 2-col, lightbox    │
│ [◀]  ▭ full image  [▶]  ✕   caption       │   │ swipe, ✕ 48px      │
└───────────────────────────────────────────┘   └────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `MediaAlbum` where `isPublic` order `position`, with `MediaAlbumTranslation` and `Media` + `MediaTranslation.alt`/`caption` ([25-database-schema.md](25-database-schema.md) §25.4, §25.8) |
| **Slots** | Album title (32) · album description (140) · photo count (12) · caption (120) |
| **States** | **Empty album:** hidden from the index, not rendered empty. **No albums:** the whole route is unlinked from navigation rather than shown bare. **Lightbox error:** falls back to the grid |
| **Job** | Lightbox is `z-modal`, focus-trapped, `Esc` closes, arrow keys navigate, focus returns to the originating thumbnail on close |

Thumbnail → lightbox uses **Morph** (`layoutId`), the one genuinely continuous object transition
on the site ([13-motion-system.md](13-motion-system.md) §13.4).

---

## 7.15 Contact — a destination, not a utility page

`/{locale}/contact`

**Purpose.** Not "be reachable". **Be visitable** — and say what the visitor will find.
**Trust job.** The strongest one available on the site. A factory you can only read about is a
claim; a shop you can walk into, attached to the production floor, is proof
([00-client-decisions-3.md](00-client-decisions-3.md) §F2) — and it answers the primary purchase
anxiety, «is this a real manufacturer or a reseller»
([02-ux-research.md](02-ux-research.md) §2.4), better than any copy on any other page.
**Second job, unchanged:** this page is the Google Business Profile mirror, and GBP is the only
live off-site channel ([00-client-decisions-2.md](00-client-decisions-2.md) §E3). NAP consistency
between the two is a direct local-ranking factor, so the address and phone numbers here are
byte-identical to the listing.

### 7.15.1 What changed and why this page was rebuilt

[00-client-decisions-3.md](00-client-decisions-3.md) §F2: «Все чотко, там знаходиться і магазин і
виробництво.» The Яворів address houses **retail and production together**. The previous revision
of this wireframe was an address block, a form and a map — a well-built utility page. That is now
the wrong page.

| Before | After |
|---|---|
| Answers «how do I contact you» | Answers «can I come, what will I see, and how do I get there» |
| Form is the primary control | **Directions and phone are the primary controls.** The form is third |
| Address is a fact | Address is a **destination**, with travel time, parking and what is on display |
| Mentions the workshop | States plainly that the shop and the production floor are the same place, and whether the floor can be seen |
| Targets NAP queries | Additionally targets **retail queries** — «де купити ліжник», «магазин ліжників», «фабрика вовни Косівський район» — which no other page on the site can answer |

That last row is the commercial argument. A pure manufacturer page cannot rank for purchase-intent
local queries; a shop page can, and on a cold-start domain local retail intent is among the very
few query classes winnable in month one
([03-information-architecture.md](03-information-architecture.md) §3.7.3).

### 7.15.2 Desktop and mobile

```
DESKTOP 1440                                              MOBILE 375
┌──────────────────────────────────────────────────────┐ ┌────────────────────┐
│ Головна › Контакти                                   │ │ ‹ Контакти         │
│                                                      │ │                    │
│ Приїздіть у Яворів                       h1          │ │ Приїздіть у Яворів │
│ Магазин і виробництво — в одному місці.  body-lg     │ │ Магазин і вироб-   │
│ Подивіться, як тчуть ліжник, і заберіть  62ch        │ │ ництво в одному    │
│ його з собою.                                        │ │ місці.             │
│ ─────────────────────────────────────────────────────│ │ ┌────────────────┐ │
│ ┌────────────────────┐ ┌───────────────────────────┐ │ │ │ ☎ Іван         │ │ ← 1st: call
│ │ АДРЕСА             │ │                           │ │ │ │ +380679973450  │ │   48px tel:
│ │ вул. Петруші       │ │   MAP — static image      │ │ │ ├────────────────┤ │
│ │ с. Яворів          │ │   until clicked, then     │ │ │ │ ☎ Любов        │ │
│ │ Косівський р-н     │ │   the embed loads         │ │ │ │ +380679604769  │ │
│ │ Івано-Франківська  │ │                           │ │ │ └────────────────┘ │
│ │ обл., 78644        │ │  [Прокласти маршрут →]    │ │ │ ┌────────────────┐ │
│ │                    │ └───────────────────────────┘ │ │ │ Графік гнучкий │ │ ← 2nd: the
│ │ ☎ Іван             │                               │ │ │ — телефонуйте  │ │   caveat,
│ │   +380679973450    │ ── ЩО ТУТ Є ───────────────── │ │ │ перед візитом  │ │   not buried
│ │ ☎ Любов            │ ┌──────────┬──────────┬─────┐ │ │ │ [Графік у     │ │
│ │   +380679604769    │ │ МАГАЗИН  │ ЦЕХ      │ ПАР-│ │ │ │  Google →]    │ │
│ │ ✉ info@vivcharyk…  │ │ ліжники, │ верстати,│ КОВ-│ │ │ └────────────────┘ │
│ │                    │ │ ковдри,  │ прядіння,│ КА  │ │ │ ┌────────────────┐ │
│ │ ───────────────────│ │ пряжа,   │ ткання   │ біля│ │ │ │  MAP static    │ │
│ │ Графік гнучкий —   │ │ овчина   │ огляд з  │ вор-│ │ │ └────────────────┘ │
│ │ телефонуйте перед  │ │ — все,   │ власником│ іт  │ │ │ [Прокласти →]      │
│ │ візитом            │ │ що на    │          │     │ │ │ ── ЩО ТУТ Є ───────│
│ │ [Графік у Google   │ │ сайті    │          │     │ │ │ ▸ Магазин          │
│ │  Картах →]         │ └──────────┴──────────┴─────┘ │ │ ▸ Цех              │
│ └────────────────────┘                               │ │ ▸ Паркування       │
│                        ── ЯК ДОЇХАТИ ─────────────── │ │ ── ЯК ДОЇХАТИ ─────│
│ ┌──────────────────────────────────────────────────┐ │ │ Косів → 20 хв      │
│ │ ▭ 16:9  фасад будівлі — фото, не рендер          │ │ │ Коломия → 1 год    │
│ └──────────────────────────────────────────────────┘ │ │ Івано-Фр. → 2 год  │
│  Косів → Яворів  ~20 хв · Коломия ~1 год ·           │ │ ── ФОТО ───────────│
│  Івано-Франківськ ~2 год · Львів ~4 год              │ │ ── ФОРМА ──────────│
│  Дорога асфальтована до села; орієнтир — …           │ │ ── ІНШІ ПИТАННЯ ───│
│ ── ФОРМА ── Тема ▾ · Імʼя · Контакт · Повідомлення ──│ └────────────────────┘
│ ── ОПТОМ? → /optom · ЗАМОВЛЕННЯ? → /zamovlennia ─────│
└──────────────────────────────────────────────────────┘
```

**Mobile order is deliberately different from desktop.** On mobile the two `tel:` buttons and the
hours caveat come **first**, above the address and above the map. The mobile visitor to this page
is overwhelmingly someone arriving from Google Maps, frequently in the car, frequently about to
drive to a village where the hours are variable. The single most valuable action available to them
is a phone call before they set off, and it must not be below a map embed. Desktop can afford the
scannable two-column layout because the desktop visitor is planning, not travelling.

### 7.15.3 Content blocks, in priority order

| # | Block | Content | Why it is at this position |
|---|---|---|---|
| 1 | **Headline and one-line promise** | «Приїздіть у Яворів» · «Магазин і виробництво — в одному місці» | The proposition, not the page's job title. «Контакти» as an `h1` tells the reader nothing they did not know from the link they clicked |
| 2 | **Call, named** | Іван `+380679973450`, Любов `+380679604769`, each a 48 px `tel:` target | Naming is not decoration: a caller who reaches a person they were expecting behaves differently from one who reaches an anonymous number. Two numbers also mean a missed call is not a dead end |
| 3 | **The hours caveat** | «Графік гнучкий — телефонуйте перед візитом» + a link to Google as the authoritative source | It sits with the phone numbers rather than in a schedule block, because its only useful action *is* the phone call |
| 4 | **Address and map** | Full NAP, static map image, «Прокласти маршрут» deep link | Static until clicked, so no third-party script runs on first paint ([04-sitemap.md](04-sitemap.md) §4.2) |
| 5 | **Що тут є** | Three short columns: **магазин** (what is on display and buyable on the spot), **цех** (**resolved** — the floor can be toured with Іван, by prior phone arrangement, §7.15.3b), **паркування** | This is the block that did not exist before and it is the reason the page was rebuilt. «You can visit» without «here is what you will find» is an invitation the reader cannot act on. The middle column is now the strongest content on the page |
| 6 | **Як доїхати** | A photograph of the building facade, plus drive times from Косів, Коломия, Івано-Франківськ and Львів, plus one sentence on road condition and a landmark | Travel time is the decision. A visitor deciding whether to detour needs «20 хвилин від Косова», not coordinates. The facade photograph is what lets them recognise the place on arrival — an unmarked building in a village is a genuine failure mode |
| 7 | **Form** | Тема ▾ · Імʼя · Контакт · Повідомлення → `Lead{ kind: GENERAL }` | Demoted to seventh. Anyone who wanted to phone has phoned; anyone who wanted directions has them. The form serves the minority who want a written answer |
| 8 | **Routing strip** | Wholesale → `/optom`; order status → `/zamovlennia` | Stops the two highest-volume misdirected enquiries from entering the general lead queue, where they are triaged by hand |

### 7.15.3b `{{FLOOR_VISIT}}` is resolved — and it is the strongest asset on the project

[00-client-decisions-4.md](00-client-decisions-4.md) §G3: «Так, відвідувачі можуть оглянути цех з
Власником.» **Yes, guided, with Іван, arranged in advance by phone.**

The previous revision of this section listed three possible honest answers and said the middle
column of block 5 would state only what was certain. The answer is now in, and it is the best of
the three by a distance. §G3 places it above every element in the evidence hierarchy in
[01-brand-strategy.md](01-brand-strategy.md) §1.8 — that table ranks video of the factory first,
and **a visitor can stand in the factory**. There is no stronger proof that a manufacturer is real
than the manufacturer walking you through it.

Block 5's middle column therefore becomes a real block:

```
── ЦЕХ ───────────────────────────────────────────────────┐
│ Цех можна оглянути — разом із власником.                │
│ Зателефонуйте заздалегідь, щоб домовитися про час.      │
│                                                          │
│ Що ви побачите: вовну в роботі, верстати, прядіння,     │
│ ткання й валяння — залежно від того, що ми робимо       │
│ того дня. Іван покаже й розкаже.                        │
│                                                          │
│ [ ☎ +380679973450 — Іван ]                              │ 56px tel:
│                                                          │
│   ✗ NO CALENDAR   ✗ NO TIME SLOTS   ✗ NO BOOKING FORM   │
└──────────────────────────────────────────────────────────┘
```

| Rule | Reasoning |
|---|---|
| **No booking widget, at any breakpoint** | §G3 is explicit and this document treats it as binding: a calendar implies capacity that does not exist and creates no-shows nobody chases. A phone number and «зателефонуйте, щоб домовитися» is correct at this scale. This is also why there is no `WorkshopVisit` entity anywhere in the blueprint ([03-information-architecture.md](03-information-architecture.md) §3.7.3) |
| **The copy says what a visitor will see and be told, not what they will be given** | §G3: it is a conversation, not a tour route. «Залежно від того, що ми робимо того дня» is the honest and the better version — it promises a real workshop rather than a scripted experience, and it cannot be breached by a quiet Tuesday |
| **Never presented as drop-in** | It depends on Іван being present. It pairs with the variable-hours rule (§E3) and both facts say the same thing: call first |
| **Never advertised as unlimited** | It cannot scale. It is an invitation, not a product, and over-promising access converts the project's strongest asset into a one-star review |
| **The phone shown here is Іван's** | He conducts the tour. A number that reaches someone who cannot agree a time forces a relay on the site's highest-intent call (§G1) |

This block is the reason the page is a destination rather than a contact form, more than the shop
is. A shop proves retail exists. A production floor with the owner in it proves the manufacturing
claim the whole brand rests on, and it is the direct answer to the primary purchase anxiety
([02-ux-research.md](02-ux-research.md) §2.4).

### 7.15.3c The two numbers, and the fallback framed as one

[00-client-decisions-4.md](00-client-decisions-4.md) §G1 fixes both the order and the framing on
this page. The wireframe above already renders Іван above Любов; what §G1 adds is that the second
number must be **labelled as a fallback rather than offered as an alternative**:

```
☎ Іван    +380679973450          ← primary
☎ Любов   +380679604769
  Якщо не відповідає — телефонуйте Любові      ← the framing, not a second equal option
```

Two equally presented numbers make a visitor choose without a basis. A sequence with a stated
reason removes the choice and sets the expectation that someone will answer. This page is the one
surface that has room for the sentence — the header carries one number, the footer and the mobile
panel carry a labelled pair, and only here is there space to say *why* there are two
([15-navbar-specification.md](15-navbar-specification.md) §15.14,
[16-footer-specification.md](16-footer-specification.md) §16.5).

**Where this page names the seller, it names Любов.** The form's privacy line, any offer-contract
reference and the `de` Impressum link all carry **ФОП Гондурак Любов Юріївна**. That deliberately
disagrees with the phone order above, and §G1 states the divergence as a rule: the person who
trades and the person who answers are different people. A contributor who notices both names on one
page and reconciles them has broken whichever one they changed.

### 7.15.4 The one thing this page must not do

**It must not invite a visit it cannot honour.** The hours are genuinely variable
([00-client-decisions-2.md](00-client-decisions-2.md) §E3), so every invitation on this page —
and every inbound link to it from the production page, the about page, the PDP pickup option and
the homepage footer band ([03-information-architecture.md](03-information-architecture.md) §3.7.3)
— carries the «телефонуйте перед візитом» caveat or sits directly adjacent to one. A visitor who
drives an hour to a locked door writes the review that undoes the entire benefit of being
visitable, and they write it on the Google Business Profile this page exists to support.

**The workshop tour raises the stakes on that rule rather than relaxing them.** §G3 closes
`{{FLOOR_VISIT}}` with a yes, and a yes is exactly the answer that makes over-promising expensive:
the invitation and the «зателефонуйте заздалегідь» caveat ship together or neither ships. No fixed
tour times, no "open to the public", no implication that a visitor may arrive unannounced. The
downside of an unavailable owner is larger than the upside of an easier-sounding invitation.

### 7.15.5 Facets

| Facet | Value |
|---|---|
| **Data** | `Setting["contact.*"]`; the form writes a `Lead` with `kind=GENERAL`. `LocalBusiness` structured data carrying `telephone` (both numbers), `address`, `geo`, `url`, `email` — and **no `openingHours` / `openingHoursSpecification`** |
| **Slots** | Headline (32) · promise line (96) · address (72) · two phone numbers with names (2 × 24) · email (40) · hours sentence (64) · GBP link (28) · three "що тут є" columns (140 each) · drive-time list (4 × 32) · directions sentence (160) · subject options (24) · message (unbounded) |
| **Type** | `h1` · promise `body-lg` · block headings `h2` · «що тут є» column headings `h4` · phone numbers at `body-lg` weight, not small print |
| **Spacing** | `--section-y-md`; `container` for the page, `container-narrow` for the directions prose |
| **States** | Form: idle · submitting · success inline with an expected-reply time · error with data preserved · rate-limited. Map: static image until clicked, then the embed loads. **Map fails to load:** the static image and the «Прокласти маршрут» deep link both still work, because neither depends on the embed — the address is never trapped inside a widget |
| **LCP** | The facade photograph if it is above the fold on mobile, otherwise the static map image. Either way an image, eager, `fetchpriority="high"` |
| **Motion** | None beyond the standard page entrance. This page is read in a hurry, often in a car |
| **Mascot** | Absent. This is a practical page and the visitor is making travel decisions |

### 7.15.6 Rules carried forward from round 2, unchanged

**Address, resolved.** вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область,
**78644** ([00-client-decisions-2.md](00-client-decisions-2.md) §E2). This is **not** Вербовець —
a different village roughly 20 km away in the same raion, which an earlier revision carried in
error and which also happens to be the adjacent business's location. Correcting it does two jobs
at once: it makes the NAP true, and it cleanly separates Вівчарик's local-search footprint from
the adjacent business's, which a shared village would have blurred.

**Opening hours are NOT published.** The schedule is flexible and differs day to day, with Google
Maps as the live source (§E3). Three consequences:

1. The page states **«Графік гнучкий — телефонуйте перед візитом»** with both numbers prominent.
   No "Пн–Пт 09–19" block exists anywhere on the page.
2. `LocalBusiness` JSON-LD **omits `openingHours`** entirely. Publishing hours that are wrong twice
   a week is worse than publishing none: it produces "closed when it said open" reports, which
   degrade exactly the profile this page exists to support. The promotion of this page to a
   destination makes that rule **more** important, not less — a page that actively invites visits
   is a page whose hours claim is acted on.
3. A link to the Google Business Profile is rendered as the **authoritative** hours source, so
   there is one place to correct rather than two that can disagree.

If hours later stabilise, they are added in one place — see
[29-seo-architecture.md](29-seo-architecture.md) — not re-scattered across page copy and JSON-LD.

**No social links. There are no social accounts.** The owners run none (§E3), so the
`@fabryka_shkur` handle an earlier revision carried is removed: it belongs to the **adjacent
business**, and linking it from this page would hand a competitor's profile the traffic from the
site's most local-intent page while implying a shared identity that does not exist. No social row
is rendered at all — an empty icon strip advertises absence. If an Instagram account is created
before launch, as §E3 recommends, one link is added here and one in the footer.

**The page now has an email channel: `info@vivcharyk.shop`** ([00-client-decisions-8.md](00-client-decisions-8.md) §L1, §L2). It renders in block 2
and in `LocalBusiness`. `gif19601@gmail.com` was the interim address under §F5 and is now withdrawn
from public view — it is the Owner's login. The wireframe shows the resolved address. Two notes, both
from §F5:

- It is an **interim** address. A numeric personal Gmail as the sole contact address for
  5,000–15,000 ₴ craft goods reads as an individual rather than a manufacturer with a shop and a
  production floor. `{{BRANDED_EMAIL}}` on `{{DOMAIN}}`, read in the admin panel ([00-client-decisions-7.md](00-client-decisions-7.md) §K2), is the
  cheapest trust upgrade available on the project and is recommended before launch.
- It is **not** the transactional sending address. Order confirmations must send from
  `{{TRANSACTIONAL_FROM}}` on `{{DOMAIN}}`, because SPF and DKIM cannot be published for
  `gmail.com` and Gmail's consumer DMARC policy rejects such mail
  ([05-user-flows.md](05-user-flows.md) §5.1). The public address and the sending address are
  different things and conflating them silently breaks order confirmations.

### 7.15.7 Structured data

`LocalBusiness` — not `Organization` alone — with `address` matching the GBP NAP character for
character, `geo`, `email`, `url`, `image` (the facade photograph), and `hasMap`. `openingHours` is
omitted by rule.

**`telephone` carries Іван only.** [00-client-decisions-4.md](00-client-decisions-4.md) §G1
corrects the previous "both numbers" instruction: the property is singular in practice, and a
second number belongs in `contactPoint` with its own `contactType`. An array in `telephone` is how
a business ends up with the wrong number in a knowledge panel, and the number that must appear
there is the one that gets answered ([16-footer-specification.md](16-footer-specification.md)
§16.5).

**Nothing about the workshop tour enters structured data.** There is no `Event`, no
`OfferCatalog` and no `reservationFor`. A tour is not a bookable resource — §G3 rules out the
calendar precisely because the capacity it would assert does not exist — and machine-readable
availability is the strongest possible assertion of exactly that. On the Google Business Profile
it surfaces as an attribute and as prose, not as bookable inventory.

**The Google Business Profile's own category needs confirming, and it is not a page decision.**
A manufacturer-only primary category suppresses retail intent; a shop-only category discards the
manufacturing story ([00-client-decisions-3.md](00-client-decisions-3.md) §F2, §F7.3). The profile
can now legitimately carry in-store shopping and in-store pickup attributes. This page is built to
mirror whatever the profile says, so the profile has to say the right thing first — recorded as an
open item at §7.25.

---

## 7.16 FAQ

`/{locale}/faq`

**Purpose.** Answer the recurring questions once, in a machine-extractable form.
**Trust job.** Policy clarity, and the single best `FAQPage` structured-data surface — which on a
cold-start domain is one of the few rich-result opportunities available immediately.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Часті питання                             │   │ Часті питання      │
│ ┌────────┐ ┌────────────────────────────┐ │   │ [Пошук…]           │
│ │ Розділи│ │ [Пошук у питаннях…]        │ │   │ ▸ Доставка         │
│ │ Достав.│ │ ▾ Скільки йде доставка?    │ │   │ ▸ Оплата           │
│ │ Оплата │ │   Нова пошта 1–3 дні…      │ │   │ ▾ Чи це вовна?     │
│ │ Товар  │ │ ▸ Чи можна оплатити при…   │ │   │   Так. Склад…      │
│ │ Повер. │ │ ▸ Це справді вовна?        │ │   │ ▸ Повернення       │
│ │ Опт    │ │ ▸ Що таке «партнерські»?   │ │   │ [Не знайшли? →]    │
│ └────────┘ └────────────────────────────┘ │   └────────────────────┘
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Setting["faq"]` — an ordered array of per-locale sections and Q/A pairs. Low churn, no dedicated model |
| **Slots** | Section (24) · question (96) · answer (600, rich text) |
| **States** | Search filtered to zero → «Не знайшли відповідь?» plus a contact link with the query carried over. No JS → all answers rendered open, since `<details>` degrades correctly |
| **Job** | One question explains the partner range in plain language — and it now has to explain **why goods the brand did not make carry the brand name**, because [00-client-decisions-3.md](00-client-decisions-3.md) §F3 rules that they do. Burying that explanation would convert an honest curation story into a discovered deception ([00-client-decisions.md](00-client-decisions.md) §D3). Two further questions earn a place in the launch set: «Чи можна приїхати і подивитися?» (yes — §7.15, with the hours caveat) and «Хто платить мито при доставці за кордон?» (the buyer — §F4) |

Accordions animate via `grid-template-rows: 0fr → 1fr`
([13-motion-system.md](13-motion-system.md) §13.10). Every answer is linkable by anchor.

---

## 7.17 Care guide

`/{locale}/care` and `/{locale}/care/{topic}`

**Purpose.** Keep the product alive, and keep the buyer confident before purchase.
**Conversion job.** Pre-purchase, it answers Оксана's killer objection — "what happens the first
time it needs washing" ([02-ux-research.md](02-ux-research.md) §2.3). Post-purchase it prevents
returns.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Догляд                                    │   │ Догляд             │
│ ┌────────┐┌────────┐┌────────┐┌────────┐  │   │ ┌────────────────┐ │
│ │Ліжники ││Вовняні ││Овчина  ││Пряжа   │  │   │ │ Ліжники        │ │
│ │  ▭     ││ковдри ▭││  ▭     ││  ▭     │  │   │ ├────────────────┤ │
│ └────────┘└────────┘└────────┘└────────┘  │   │ │ Ковдри         │ │
│ ── topic view ────────────────────────────│   │ └────────────────┘ │
│ ✓ Прати при 30°, делікатний режим         │   │ ── topic ──────────│
│ ✗ Не віджимати                            │   │ ✓ Прати при 30°    │
│ ✗ Не сушити на батареї                    │   │ ✗ Не віджимати     │
│ ── чому саме так ── prose ────────────────│   │ [Товари цього типу]│
└───────────────────────────────────────────┘   └────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Post` with a `care` tag, or `Setting["care"]` for the canonical symbol table; linked from `ProductAttributeValue` on the care definition so a PDP care row deep-links to the right topic |
| **Slots** | Topic title (32) · do/don't lines (56 each) · prose (62–68ch) |
| **States** | A topic with no products → the cross-sell band is omitted, the guidance stays. Missing translation → `uk` fallback |
| **Job** | Care instructions are structured data on the product, not a PDF ([00-client-decisions.md](00-client-decisions.md) §D4). A PDF is unreadable on a phone, unindexable, and untranslatable |

Do and don't use `success` and `danger` with **icons as well as colour** — colour alone fails
for the colour-blind and washes out for the 60–75 segment.

---

## 7.18 Reviews index

`/{locale}/reviews`

**Purpose.** All approved reviews in one place, filterable by product and rating.
**Trust job.** Rank-5 evidence. A site that publishes its 3-star reviews is more credible than
one showing only 5s, and the moderation policy is stated on the page.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ Відгуки                                   │   │ Відгуки            │
│ ★★★★★ 4.8 · 128 підтверджених             │   │ ★★★★★ 4.8 · 128    │
│ 5★ ████████████ 96                        │   │ 5★ ████████ 96     │
│ 4★ ████ 24                                │   │ 4★ ███ 24          │
│ 3★ █ 6  2★ ▏2  1★ ▏0                      │   │ [Фільтр ▾]         │
│ [Категорія ▾][Оцінка ▾][З фото ☐]         │   │ ┌────────────────┐ │
│ ┌───────────────────────────────────────┐ │   │ │ ★★★★★ Марія К. │ │
│ │ ★★★★★ Марія К. ✓ покупка  12 бер.     │ │   │ │ «…»            │ │
│ │ «Ліжник важчий ніж очікувала…»        │ │   │ │ ↩ Відповідь    │ │
│ │ Ліжник «Черемош» → ┌──┐┌──┐           │ │   │ └────────────────┘ │
│ │ ↩ Відповідь виробника                 │ │   │ ‹ 1 2 ›            │
│ └───────────────────────────────────────┘ │   └────────────────────┘
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Review` `status=APPROVED` with `reply`, `helpfulCount`, `mediaIds[]`, joined to `Product`. Aggregate counts **only** `isVerifiedPurchase` rows ([25-database-schema.md](25-database-schema.md) §25.6) |
| **Slots** | Aggregate · histogram · author (32) · title (64) · body (900) · reply (600) |
| **States** | **Empty:** «Перші відгуки зʼявляться після перших замовлень» — this is the launch state and it must read as honest, not broken. **Filtered to zero:** clears individually. **Loading:** skeletons. **Error:** retry |
| **Job** | Publishing the moderation rule — what gets hidden and why — is itself a trust signal |

At launch this page is empty. There is no review migration
([00-client-decisions.md](00-client-decisions.md) §D2). Any seeded testimonial carries
`isVerifiedPurchase=false`, renders without a badge, and is excluded from the aggregate.

**This page has an entry point that is not on this site.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G4: a business card **already ships in every
parcel**, and the recommendation is to print a short URL plus a QR code on it —
`{{DOMAIN}}/v`, resolving to a review-and-reorder landing page
([03-information-architecture.md](03-information-architecture.md) §3.5.2). That is the only route
into this page for the audience it most needs: the **counter-sale customer**, who bought in the
Яворів shop, has no order number, no email in the system, and would never navigate here.

| Consequence for this page | Rule |
|---|---|
| The order-number field on the review form is **optional and visibly so** | A required field would reject the exact audience the card exists to reach. A card-driven review arrives with nothing but a rating and a body, and that is a valid review |
| Card-driven reviews carry `isVerifiedPurchase = false` | And are therefore **excluded from the aggregate** at the top of this page, by the same rule that governs everything else here ([25-database-schema.md](25-database-schema.md) §25.6). §G4 states this caveat explicitly and it must not be worked around — accepting a typed order number as proof would create a field anyone can guess, which is the enumeration surface §7.8's lookup is rate-limited against |
| The filter set gains nothing | There is no «підтверджені / всі» toggle. The badge already distinguishes them per card, and a filter would invite a reader to dismiss half the page |
| The empty state stays honest and stays temporary | «Перші відгуки зʼявляться після перших замовлень» is true at launch. The card is the mechanism that makes it stop being true, and it is already in every parcel and already paid for — which is why this is the cheapest fix available to the scarcest asset on the project |

**No QR code renders on this page, or anywhere on the site.** A QR shown on a screen the visitor is
already holding asks them to photograph a page they could tap. The QR lives on card stock, where
the reader has no other way across.

---

## 7.19 Legal pages

`/{locale}/privacy`, `/terms`, `/returns`, `/shipping`, `/offer`

**Purpose.** State the rules in language a person can act on.
**Trust job.** Rank-6 evidence. Returns and shipping are read *before* purchase by Persona 2 and
belong in navigation, not only in the footer fine print.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│ ┌────────┐ Повернення товару              │   │ Повернення         │
│ │ ЗМІСТ  │ Оновлено 12 бер. 2026          │   │ Оновлено 12 бер.   │
│ │ sticky │ ┌───────────────────────────┐  │   │ ┌────────────────┐ │
│ │ 01 ●   │ │ КОРОТКО                   │  │   │ │ КОРОТКО        │ │
│ │ 02 ○   │ │ {{RETURN_DAYS}} днів.     │  │   │ │ {{RET}} днів   │ │
│ │ 03 ○   │ │ Зворотна доставка — за    │  │   │ └────────────────┘ │
│ │        │ │ ваш рахунок, окрім браку. │  │   │ ▸ Зміст            │
│ └────────┘ └───────────────────────────┘  │   │ Full text, 62–68ch │
│            Full text, container-narrow    │   │ [Оформити повернен]│
│            [Оформити повернення →]        │   └────────────────────┘
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | `Setting["legal.<key>"]` per locale, with a `updatedAt` rendered on the page |
| **Slots** | Title (48) · summary box (280) · body (unbounded) · last-updated (24) |
| **States** | Missing translation → `uk` with an explicit notice. **A legal page must never silently fall back**, because the reader is relying on it being in their language |
| **Job** | The plain-language summary box sits above the legal text. Most readers need one paragraph; the full text exists for the minority who need it and for compliance |

**The delivery and payment page (`/shipping`) carries the round-3 shipping position in full.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F4: the buyer pays shipping to every
destination; domestic carriers are Nova Poshta and Ukrposhta; **international carriers are chosen
per order and quoted, not tabulated with prices**; the buyer pays all customs duties and import
taxes, effectively DAP; and **free shipping never applies internationally at any order value**.
Pickup at Яворів is described here as a visit, with a link to §7.15, rather than as the free
option ([00-client-decisions-3.md](00-client-decisions-3.md) §F2). The summary box states the
customs position in one sentence, because a reader who reaches this page before ordering is
exactly the reader that sentence is for — but this page is **not** where the disclosure discharges
its duty: it is blocking in checkout (§7.6) and this page is a reference copy.

The returns page carries a self-serve return request form keyed by order number plus email —
the same lookup as §7.8. A customer never needs an account to start a return, and since accounts
do not exist ([00-client-decisions-2.md](00-client-decisions-2.md) §E12) this is the only
mechanism, not the convenient one. `{{RETURN_DAYS}}` is unresolved for Вівчарик; the 14-day figure
in the audit belongs to the adjacent business and must not be inherited by assumption.

### 7.19b The EU legal set — `de` and `pl` only

[00-client-decisions-2.md](00-client-decisions-2.md) §E11 makes `de` and `pl` transactional, which
converts the EU legal pages from a contingency into a launch requirement. They use the same
template as §7.19 — sticky ToC, plain-language summary box above the legal text, `updatedAt`
rendered — with three page-level differences.

| Route | Difference from the §7.19 template |
|---|---|
| `/de/impressum` | **No summary box.** An Impressum is a list of identifying facts, and summarising it adds nothing. Names **ФОП Гондурак Любов Юріївна** (§E1) in Latin transliteration beside the Cyrillic, the Яворів address, `{{LEGAL_ID}}`, both telephone numbers and `{{BRANDED_EMAIL}}`. **Linked from every page footer, one click from anywhere** — a buried Impressum is treated as an absent one |
| `/de/widerrufsbelehrung`, `/pl/odstapienie-od-umowy` | Summary box states the 14 days and when the clock starts. Both link prominently to the form route below |
| `/de/widerrufsformular`, `/pl/formularz-odstapienia` | **Not a text page.** A real on-page form plus a downloadable version, submitting to the same handler as the return request at §7.19 and [05-user-flows.md](05-user-flows.md) §5.13. Download-only would push the buyer toward a printer they may not have, which is a poor way to honour a statutory right |
| `/de/zahlung-und-versand` | Carries the customs, duties and import-VAT position, which is now settled: **the buyer bears all of it** ([00-client-decisions-3.md](00-client-decisions-3.md) §F4). Also states that international shipping is quoted per order rather than listed. **This page is not sufficient on its own** — the same fact is a blocking element in checkout before payment ([05-user-flows.md](05-user-flows.md) §5.9.3, §7.6). A link here from the checkout block is explicitly not a substitute for the block |

**Why the withdrawal form is its own page rather than a section.** It gains a stable URL that the
confirmation email and the order-status page can link to; one submission handler serves both
locales instead of two forms embedded in two legal pages; and the obligation becomes independently
checkable — a reviewer confirms the form exists without reading a page of legal prose. One extra
route per EU locale is a trivial cost for that.

**These pages must not be translated by the same route as the rest of the site.** The §7.19 state
rule — a legal page never silently falls back to `uk` — applies with extra force here, because
these pages have no `uk` equivalent at all. A missing `de` Impressum is a compliance failure, not
a content gap, and it must fail loudly at build time rather than degrade quietly at runtime.

---

## 7.20 There are no account pages — and what replaced them

`/{locale}/account/*` — **DELETED. No route, no wireframe, no component.**

[00-client-decisions-2.md](00-client-decisions-2.md) §E12: «Сайт назавжди працює в режимі
гостьових покупок.» No customer accounts, ever. The previous revision specified an optional
account area with order history, saved addresses and a synced wishlist. All of it is removed —
not deferred to a later phase, removed — along with registration, login, password reset, email
verification, saved payment methods, customer session management and the wishlist merge-on-login
flow.

This section is kept rather than deleted outright because a blueprint that silently loses a
section reads as an oversight, and because the *replacements* need somewhere to be specified.

### 7.20.1 What each removed surface became

| Removed surface | Replacement | Where it is specified |
|---|---|---|
| Order history panel | Order-lookup page: `guestToken` link from the confirmation email, or a form taking order number + email | §7.8 |
| Reorder from history | The same page — reorder is a first-class action there, not a secondary one | §7.8, [05-user-flows.md](05-user-flows.md) §5.12 |
| Saved addresses | Address prefill from a **first-party cookie, same device only**, behind an explicit opt-in checkbox at checkout with a visible way to clear it | §7.6, [05-user-flows.md](05-user-flows.md) §5.3 |
| Saved payment methods | Nothing. Card details are never stored by us in any form; WayForPay owns the payment surface | §7.6 |
| Wishlist («Обране») | `localStorage` only — device-local, no server record, no `WishlistItem` table. The UI states **«Збережено на цьому пристрої»** | §7.5, [25-database-schema.md](25-database-schema.md) §25.8b |
| Marketing preferences | One unticked checkbox at checkout writing to `NewsletterSubscriber`, plus one-click unsubscribe in every send | §7.6, [05-user-flows.md](05-user-flows.md) §5.15 |
| Login / register / reset | Nothing. These states cannot exist for customers | — |

### 7.20.2 The wishlist is the one that needs UI honesty

The other replacements degrade gracefully; the wishlist does not. A buyer saves a five-figure
ліжник on a phone, opens the site on a laptop, and finds an empty list. If the UI never said the
list was device-local, that reads as data loss on the exact page where trust matters most.

**The rule:** «Збережено на цьому пристрої» renders **at the moment of saving**, on the control
itself — not as a tooltip, not in a footer note, not on a separate help page. It costs one line
of text and it converts a broken expectation into an accurate one. There is no "sign in to sync"
affordance beside it, because there is nothing to sign in to, and an offer that leads nowhere is
worse than no offer.

### 7.20.3 Why this is a better position than an optional account

| | Optional account | Guest-permanent |
|---|---|---|
| Pages to build and maintain | 5–7, each with four states | 0 |
| Security surface | Customer password storage, session management, credential-stuffing exposure, account-takeover support burden | None of it |
| GDPR surface | An authenticated profile that must be exportable and erasable on request | An order-derived `Customer` record with no credentials |
| Cognitive load at checkout | A decision the buyer did not come to make | Removed |
| Real cost | — | Cross-device wishlist and address sync. Genuinely lost, and stated plainly rather than papered over |

The `Customer` model survives as an **order-derived record for support and analytics**, with
`passwordHash` removed. It has no storefront surface, no login, and no page in this document.
Staff authentication is a separate system and is unaffected
([24-employee-permission-architecture.md](24-employee-permission-architecture.md)).

---

## 7.21 404

**Purpose.** Recover the session.
**Trust job.** Small but real: a considered 404 signals a maintained site. With no migration and
no redirect map (§D2), 404s here come from typos and stale external links, not from a botched
URL migration.

```
DESKTOP 1440                                     MOBILE 375
┌───────────────────────────────────────────┐   ┌────────────────────┐
│                  ⌒⌒  sheep, looking off   │   │      ⌒⌒            │
│                 (••)  the edge            │   │     (••)           │
│         Такої сторінки немає              │   │ Такої сторінки     │
│         Можливо, посилання застаріло.     │   │ немає              │
│         [Пошук…                        ]  │   │ [Пошук…         ]  │
│         Ліжники · Ковдри · Пряжа · Овчина │   │ Ліжники · Ковдри   │
│         [На головну]                      │   │ [На головну]       │
└───────────────────────────────────────────┘   └────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | Static, plus top-level categories from `Category`. `Redirect` is consulted **before** rendering 404 — the table exists for future URL changes even though there is no legacy mapping ([25-database-schema.md](25-database-schema.md) §25.9) |
| **Slots** | Heading (32) · body (96) · 4 category links (16 each) |
| **States** | Single state. Returns HTTP 404, not 200 — a soft 404 is an indexing bug |
| **Job** | Search box first, links second. Someone who mistyped a product name wants to retype it, not browse |

Mascot permitted: a low-stakes moment, drawn in one colour, no cartoon expression.

---

## 7.22 500

**Purpose.** Fail honestly.
**Trust job.** Never damage confidence further than the failure already has.

```
DESKTOP 1440 / MOBILE 375
┌───────────────────────────────────────────┐
│         Щось пішло не так                 │
│         Ми вже знаємо про помилку.        │
│         Спробуйте ще раз за хвилину.      │
│         [Оновити сторінку]                │
│         Потрібна допомога? {{PHONE}}      │
│         Код: 8f3a2c   ← support reference │
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | None. Rendered from a static shell so it cannot itself fail on a database outage |
| **Slots** | Heading (28) · body (120) · retry (24) · support reference (8) |
| **States** | Single state. HTTP 500. No stack trace, no framework name, no version string — an error page is an information-disclosure surface ([32-security-architecture.md](32-security-architecture.md)) |
| **Job** | A short correlation ID lets support find the log entry without the customer describing symptoms |

**No mascot.** [08-design-system.md](08-design-system.md) §8.8: an error is not a moment for
charm. A customer whose payment just failed does not want a cartoon sheep.

---

## 7.23 Offline

Served by the service worker when the network is unavailable.

**Purpose.** Keep the site coherent on a mountain connection.
**Trust job.** Directly serves Persona 1's failure mode: browsing on degraded mobile data in a
Carpathian valley ([02-ux-research.md](02-ux-research.md) §2.3).

```
DESKTOP 1440 / MOBILE 375
┌───────────────────────────────────────────┐
│         Немає зʼєднання                   │
│         Ці сторінки збережені і доступні: │
│         · Ліжники (переглянуто 14:02)     │
│         · Ліжник «Черемош»                │
│         · Догляд за вовною                │
│         [Спробувати ще раз]               │
│         Кошик збережено — нічого не       │
│         втрачено.                         │
└───────────────────────────────────────────┘
```

| Facet | Value |
|---|---|
| **Data** | Cache API: the app shell, the last 20 visited pages, and their images. Cart state persists in the httpOnly cookie plus a local mirror |
| **Slots** | Heading (24) · body (120) · cached page list (48 each) · retry (24) |
| **States** | **Offline with cache:** as drawn. **Offline without cache:** shell, message, retry. **Back online:** an `aria-live` toast, and the retry auto-fires once |
| **Job** | Explicitly reassuring the user that the cart survived is the one sentence that prevents a panicked re-add later |

Checkout is **never** served from cache. A stale price or a stale stock count in a payment flow
is worse than an error, and the service worker is configured network-only for `/checkout/*` and
every `/api/*` mutation.

---

## 7.24 Cross-page state matrix

Every page ships all four states. This table is the build checklist; a page is not done until
every cell is implemented and screenshotted in Storybook.

| Page | Loading | Empty | Filtered to zero | Error |
|---|---|---|---|---|
| Category | Skeleton grid | Unreachable by design | Per-filter clear | Retry, filters kept |
| Search | Skeleton grid | Recent + categories | Corrections + contact | Retry, query kept |
| PDP | Skeleton, dims reserved | n/a | n/a | Retry |
| **PDP, «Свій розмір» selected** | n/a | **One or both dimensions empty → the price cell shows an em-dash at full reserved width**, so nothing moves when it fills (§7.4b) | n/a | Out-of-range value restates the permitted range; a server price disagreeing with the displayed one names the change and requires an explicit accept |
| Cart | Skeleton lines | Mascot + 3 worlds | n/a | Retry, cart kept |
| **Cart, custom-size line** | Skeleton lines | n/a | n/a | `allowsCustomSize` switched off mid-cart → the line states why in plain language and offers the nearest standard size. **Never silently dropped** |
| Checkout | Step spinner | Redirect to cart | n/a | Step-level, data kept |
| **Checkout, mixed cart** | Step spinner | Removing the custom line removes the §7.6b disclosure banner and restores the stocked line's own terms, COD included, on the next server-derived read | n/a | Step-level, data kept. One order, recoverable by `guestToken` |
| **Checkout, uk COD** | Step spinner | n/a | n/a | The deposit block renders from the order's real figures; if any figure is unavailable the **method is not offered at all**, because a partial arithmetic is worse than no method (§7.6a) |
| Checkout, non-UA | Step spinner | Redirect to cart | n/a | Step-level, data kept. **Additional state: submitted-awaiting-quote**, which is a success, not a pending spinner (§7.6, §7.7b) |
| Confirmation | n/a | Token lookup form | n/a | Lookup form |
| Confirmation, awaiting quote | n/a | Token lookup form | n/a | Lookup form. No payment affordance may render in this state |
| Tracking | Button spinner | Form | n/a | Neutral not-found |
| **Tracking, `IN_PRODUCTION`** | Button spinner | n/a | n/a | **No progress bar in any state.** A missing dispatch date renders the row without one rather than substituting a duration (§7.8) |
| About / Production | n/a | Section omitted | n/a | Retry |
| Wholesale | n/a | n/a | n/a | Form data kept |
| Blog index | Skeleton cards | «Скоро» + newsletter | Tag clear | Retry |
| Blog article | Skeleton | `uk` fallback | n/a | Retry |
| Gallery | Skeleton masonry | Route unlinked | n/a | Grid fallback |
| Contact | n/a | n/a | n/a | **Map embed fails → the static image, the NAP and the «Прокласти маршрут» link all still work.** The address is never trapped inside a widget (§7.15.5). Form errors keep entered data |
| FAQ / Care | n/a | n/a | Contact link | Form data kept |
| Legal, EU (`de`/`pl`) | n/a | **Build failure, not a fallback** — a missing Impressum is a compliance failure | n/a | Retry |
| Reviews | Skeletons | «Після перших замовлень» | Per-filter clear | Retry |
| Wishlist drawer | n/a | Mascot + «Збережено на цьому пристрої» explained · links to the three worlds | n/a | `localStorage` unavailable → the control hides rather than failing silently |

The **Account** row is removed: there is no account area
([00-client-decisions-2.md](00-client-decisions-2.md) §E12, §7.20). The wishlist drawer replaces it
in this checklist because it is the one guest-permanent surface with states worth designing — and
its error state is unusual enough to name: in a browser with `localStorage` disabled or full, the
save control **hides** rather than accepting a click that does nothing.

---

## 7.25 Open questions raised by this document

### Closed by round 2

| # | Question | Answer | Consequence in this document |
|---|---|---|---|
| 1 | `{{SKU_COUNT}}` | Several hundred to roughly a thousand — whatever the catalogue migration yields (§E5) | None. The faceting and pagination architecture already holds across that range; only the "unknown" framing in the header is withdrawn |
| 2 | Are dye lots tracked? | **No** (§E8) | Facet deleted from §7.2.3, selector deleted from §7.4, `{{DYE_LOT}}` retired. Replaced by one line of advice above the quantity input |
| 3 | May partner manufacturers be named? | **No** (§E7) | `partnerName` never rendered anywhere. Labels are «Відібрано Вівчариком» + «Виготовлено карпатським майстром / іншим виробником». Origin facet pinned to the top of the panel; origin mark at equal weight to own manufacture |
| 5 | `{{PSP}}` | **WayForPay** (§E10) | §7.6 now specifies two checkout layouts, one per possible integration mode, rather than assuming one |
| 6 | Does a Google Business Profile exist? | **Yes** (§E4) | §7.15 is confirmed as the GBP landing target. The profile itself still needs manual verification against the §E4 checklist |
| 7 | Sheepskin and leather in `de` | **Excluded at launch** — EU species-declaration paperwork, not only the ethical objection (§E11) | `de`/`pl` launch wool-only; those category routes 404 there ([04-sitemap.md](04-sitemap.md) §4.2) |
| 8 | Photography | **Reuse permitted**, with conditions (§E5) | No longer a blocker for catalogue coverage. Still required for Yavoriv production, process and people imagery — §7.9, §7.10 and the homepage hero cannot use another workshop's photographs |
| — | Customer accounts | **Never** (§E12) | §7.20 replaced; account row removed from §7.24 |
| — | Location | **с. Яворів**, not Вербовець (§E2) | §7.2.1, §7.9, §7.15 corrected |

### Closed by round 3 ([00-client-decisions-3.md](00-client-decisions-3.md))

| # | Question | Answer | Consequence in this document |
|---|---|---|---|
| 13 | Are partner goods sold under the Вівчарик name or unbranded? | **Under the Вівчарик brand** (§F3) | §7.1 and §7.4: `brand` = Вівчарик on both origins, `manufacturer` omitted for partner goods. **No label weakens.** The shared brand name is the argument for keeping the on-page mark at full weight and the facet pinned, because the label is now the only surface that draws the distinction |
| 12 | `{{INTL_CARRIER}}` | **Multiple, quoted per order** (§F4) | It stops being a checkout blocker and becomes the reason §7.6 has an enquiry layout and §7.7b exists. The unresolved figures are now `{{QUOTE_SLA_HOURS}}` and `{{QUOTE_VALIDITY_DAYS}}` |
| — | Who pays customs and duties | **The buyer, everywhere** — DAP (§F4) | §7.6's blocking disclosure block with acknowledgement checkbox; §7.19b |
| 11 | Public email | **Resolved: `info@vivcharyk.shop`** ([00-client-decisions-8.md](00-client-decisions-8.md) §L1, §L2). The Gmail is never shown | — |
| — | Tagline | **«в Карпатах»** confirmed (§F6) | §7.9 hero reverted; Яворів moved into the body copy where the reader has context |
| — | Is the address a shop? | **Yes — shop and production together** (§F2) | §7.15 rebuilt as a destination page; §7.10 gains a visit band; §7.6 rewrites the pickup option as an invitation |

### Closed by rounds 4 and 5 ([00-client-decisions-4.md](00-client-decisions-4.md), [00-client-decisions-5.md](00-client-decisions-5.md))

| # | Question | Answer | Consequence in this document |
|---|---|---|---|
| 15 | **`{{FLOOR_VISIT}}`** — can the public see the production floor? | **Yes, guided, with Іван, arranged in advance by phone** (§G3) | §7.15.3b is new and block 5's middle column stops hedging. **No booking widget at any breakpoint**, no `Event` structured data, no `WorkshopVisit` entity. It is the strongest trust content on the site |
| 12b | `{{QUOTE_SLA_HOURS}}`, `{{QUOTE_VALIDITY_DAYS}}` | **48 working hours; 72 hours validity, 36 for one-of-one** (§H2) | §7.6, §7.7b and the quote email print real numbers. Customer copy under-promises: «протягом 2 робочих днів». Both remain commitments to confirm before launch |
| — | **How is a custom size priced?** | **`max(area × owner-set rate per m², floor)`, within physical loom bounds** (§H3c) | **§7.4b is drawable.** This was the blocker on the custom-size buy box: prepayment requires a price, and there was none |
| — | Custom-size scope | **Per product, admin toggle** (§H3b) | §7.4b renders only where `allowsCustomSize` is true. §7.6b exists because a mixed cart is now the expected case, so its disclosure fires often |
| — | Prepayment for made-to-order | **Required, in full, online; COD removed server-side** (§H1.1) | §7.6a has no disabled-method state to draw |
| — | Payment methods across the catalogue | **Card everywhere; «наложений платіж з оглядом» Ukraine-only, stocked-only** (§H1.2) | §7.5's trust triplet and §7.6a's method list. The inspection right is named, not buried |
| — | The return-shipping deposit | **Both legs paid online; credited against the goods on acceptance; nothing further on refusal** (§H1.3) | §7.6a's arithmetic block, drawn with real numbers. Ukraine-only for a legal reason |
| — | `{{MADE_TO_ORDER_DAYS}}` | **14 days of production before dispatch** (§G2) | §7.4b's buy box, §7.7's dispatch date, §7.8's `IN_PRODUCTION` row |
| — | Phone priority | **Іван primary, Любов fallback; Любов is the ФОП of record** (§G1) | §7.15.3c. `LocalBusiness.telephone` corrected to Іван only |
| — | A post-purchase route back to the site | **A business card already ships in every parcel** (§G4) | §7.18 gains an off-site entry point and a reason its empty state is temporary |

### Closed by round 6 ([00-client-decisions-6.md](00-client-decisions-6.md))

| # | Question | Answer | Consequence in this document |
|---|---|---|---|
| 18 | **Confirmation of the mixed-cart split** | **Withdrawn — «Надіслати разом.»** One order, one parcel, one delivery charge, dispatched after 14 days (§J1) | **§7.6b is rewritten as a disclosure, not a screen.** The two-card split wireframe, its second delivery fee, its two order numbers and §7.8's pair lookup are deleted from this document. §7.4b gains the add-to-cart announcement, §7.5 the persistent banner |
| — | The return-shipping deposit | **Confirmed, with the business reason on record: refused inspections cost the business both legs of carriage** (§J2) | §7.6a is unchanged. No surface in this document may describe the deposit as provisional. Its **copy** remains open at item 17 |

| # | Question | Blocks | Origin |
|---|---|---|---|
| 4 | `{{RETURN_DAYS}}`, domestic delivery tariffs | Cart, checkout, legal pages, footer. The audit's 14-day figure belongs to the adjacent business and must not be inherited | Round 1 |
| 9 | **WayForPay integration mode (V6)** | Which of the two §7.6 checkout layouts is built. Also V7–V9: signature order, webhook shape, refund support — none may be written from memory | §E10 |
| 10 | `{{LEGAL_ID}}` — ЄДРПОУ / РНОКПП for ФОП Гондурак Л. Ю. | **Exists, pending delivery** (§F1). Gates `/de/impressum` (§7.19b), the offer contract and WayForPay onboarding — and **nothing else in this document**. It is a chase, not a design risk | §F1 |
| 11b | `{{DOMAIN}}`, `{{TRANSACTIONAL_FROM}}` | Not §7.15's email channel any more, but every transactional email the site sends. Mail cannot originate from `@gmail.com` (§F5) — a Phase 0 blocker. `{{DOMAIN}}` additionally gates the printed card, because `/v` cannot be printed before the domain exists (§G4) | §F5, §E9 |
| 16 | Google Business Profile primary category | §7.15 mirrors the profile, so the profile must reflect **both** retail and manufacturing first. A manufacturer-only category suppresses the retail queries this page was rebuilt to win — and after §G3 the profile can also carry a visitable production floor | §F2, §F7.3 |
| 14 | Exact status and wording of any Hutsul-lizhnyk heritage reference | §7.9 and §7.10 copy. Never imply that Вівчарик itself holds a designation | §E2 |
| 17 | **The return-deposit copy** | §7.6a cannot ship until the client approves the wording. **The mechanic is confirmed and is not provisional** ([00-client-decisions-6.md](00-client-decisions-6.md) §J2); the layout and the alignment are settled; the string is not. It is the one rule on the site that can be misread as a hidden fee | §J3 item 1 |
| 19 | Whether every category may eventually be made to measure | §7.4b's scope. §H4 records that the client has not been asked. If the answer is yes, §7.6b's disclosure fires on most carts rather than on some — which raises the stakes on its wording, not on its mechanism | §H4 |
| 20 | Photography of the workshop **as a visitor sees it** | §7.15.3b's «що ви побачите» column and §7.10's visit band. §G3 makes this a distinct shot list from the process photography — a visitor's eye level, not a product photographer's | §H5 item 9 |

**The content workload is the item most likely to be underestimated.** Reuse solves catalogue
*coverage*, not catalogue *content*: every product name and description, all category text and
every article must be rewritten because the source site stays live (§E5,
[04-sitemap.md](04-sitemap.md) §4.4b). At roughly a thousand SKUs across four locales that is the
largest single task in the project, and it has no blocker to wait on — it can start immediately.
