# 17 — Product Page Specification

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Layout and buy box per [00-client-decisions-10.md](00-client-decisions-10.md) part 4:** photos left (thumbnails below; hover loupe + full-screen; video last), sticky details right; size buttons, colour swatches that switch photos, − / +; «Додати в кошик» opens the drawer; «Купити в 1 клік» as a second button; old price struck through; wholesale line small under the button; «Огляд перед оплатою на пошті» beside the button when COD applies, linking to the deposit explanation; delivery as a link only.
> - Accordions; description collapsed with «Читати більше»; size calculator in a dialog; **on-site reviews with photos**, all moderated, `AggregateRating` allowed; review request 7 days after delivery; 4 cross-sells; share via Viber, Telegram, copy link; sticky buy bar on phones.
> - Custom size: «Свій розмір» discloses **no returns except defects** at the moment it is chosen (part 6).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Video on every product** — a short silent clip; one per family where variants differ only in size. 3–5 photos, one in an interior. No 360°.
> - **Size calculator** for ліжники, ковдри, пледи (bed size in, recommended size out).
> - Specification table: weight, composition, density, size. Yarn: metres per skein and thickness.
> - Care: a link to the shared care page, no per-product text. «З цим купують» kept; recently viewed, back-in-stock and compare **removed**. Wishlist kept (`localStorage`).
> - Low stock shown only when low (≤ `{{LOW_STOCK_THRESHOLD}}`, default 3); sheepskins show «Єдиний екземпляр».
> - **«Купити в 1 клік»** beside «Додати в кошик» on `uk`, stocked items only — creates a quick-order request, not an order ([18-checkout-specification.md](18-checkout-specification.md) banner).
> - Help block: messenger buttons (Viber, Telegram, WhatsApp).
> - FAQ answers the three questions buyers ask most: «Чи ви реально виробник?», «Чи є індивідуальні розміри?», «Чи це натуральні вироби?» — the last answered by process, never by certification.


The product detail page is where the strategy in [01-brand-strategy.md](01-brand-strategy.md)
§1.1 either converts into revenue or does not. Everything upstream exists to deliver a visitor
here with enough belief to look at a five-figure hryvnia price without flinching.

Eleven constraints shape every decision below. They come from the highest-authority documents in
the blueprint, in order: [00-client-decisions-6.md](00-client-decisions-6.md), then
[00-client-decisions-5.md](00-client-decisions-5.md), then
[00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md) where they do not overlap.

1. **Вівчарик launches cold**, on a new domain, with no inherited ranking (D2). The PDP ships
   with zero reviews and zero authority. Every state this page has on day one is the empty
   state, and the empty states are therefore designed first. Photography is the one exception:
   [00-client-decisions-2.md](00-client-decisions-2.md) §E5 permits reuse of the adjacent
   business's image library, so the catalogue is covered on day one while every line of product
   *text* must be rewritten from scratch.
2. **The catalogue is wool-led but spans several material worlds** (D3): wool, sheepskin,
   leather, and a prepared-but-unlaunched wooden range. One template serves all of them. §17.19
   specifies how. Per §E6 the production cycle is **full and in-house for all three material
   worlds including hides**, which changes the sheepskin and leather configuration from
   provisional to confirmed.
3. **Some products are not made here, the partners cannot be named, and the goods nonetheless
   carry the Вівчарик brand.** `ProductOrigin.PARTNER_MANUFACTURE` sits in the same catalogue as
   own manufacture; §E7 rules that `partnerName` stays null and is never rendered, and
   [00-client-decisions-3.md](00-client-decisions-3.md) F3 now resolves the branding question —
   «Так, продаються під брендом Вівчарик.» The PDP must therefore disclose the fact without the
   credential, while the brand name itself no longer carries any origin signal. §17.10.2.
4. **The 30-year claim attaches to the manufacturing, never to an entity** (D1). Copy reads
   «виробляємо понад 30 років», and no surface on this page implies certification, award, or a
   documented anniversary.
5. **The place is Яворів, and on this page it is the strongest asset available** (§E2). Яворів is
   the recognised centre of Hutsul lizhnyk weaving — «столиця ліжникарства», home of the Музей
   ліжникарства. In this category the village name functions the way an appellation does, and
   §17.10 names it rather than the region. It does **not** displace «Карпати» in the tagline:
   [00-client-decisions-3.md](00-client-decisions-3.md) F6 confirms the approved headline copy
   «в Карпатах» and withdraws the proposal to substitute «у Яворові» there. The pattern is
   **«Карпати» to be understood, «Яворів» to be believed** — headline versus proof, two words
   with two different jobs.
6. **Яворів is a shop as well as a factory** ([00-client-decisions-3.md](00-client-decisions-3.md)
   F2). Retail and production share one address, which means the pickup row in §17.12.1 and the
   trust row in §17.14 can offer something no competitor claim can match: a place the buyer can
   walk into. That is the strongest available answer to anxiety A1/A3 — *is this a real factory
   or a reseller* ([02-ux-research.md](02-ux-research.md) §2.4).
7. **There are no customer accounts, permanently** (§E12). Nothing on this page offers
   registration, login, or a server-synced list. The wishlist is device-local and says so.
8. **A custom size is a different purchase from a standard size, on the same product**
   ([00-client-decisions-5.md](00-client-decisions-5.md) §H3b). `Product.allowsCustomSize` is an
   admin toggle; when it is on, the size selector gains a final «Свій розмір» option that swaps
   the buy box into made-to-order mode. The same ліжник is stocked at 150×200 and a fourteen-day
   build at 180×240. §17.6.6 specifies the mode; §17.7 specifies the availability states it
   produces.
9. **Made-to-order means fourteen days of production before dispatch, and full prepayment**
   ([00-client-decisions-4.md](00-client-decisions-4.md) §G2,
   [00-client-decisions-5.md](00-client-decisions-5.md) §H1.1). Not fourteen days to the door —
   carrier transit is added on top. Cash on delivery is not offered on a custom-size line, and the
   reason is visible to the buyer rather than merely enforced. Both facts belong in the buy box,
   never in a tab.
10. **The workshop can be visited, with Іван, by prior arrangement**
    ([00-client-decisions-4.md](00-client-decisions-4.md) §G3). This outranks every other evidence
    asset the project has, and §17.14 puts it in the trust row. It is never presented as drop-in
    and never acquires a booking widget at any breakpoint.
11. **Adding a custom size to a cart that already holds a stocked item changes that item's terms,
    and this page is where the customer is told** ([00-client-decisions-6.md](00-client-decisions-6.md)
    §J1). A mixed cart is one order, one parcel, one delivery charge, dispatched after fourteen
    days — so the stocked line loses cash on delivery and next-day dispatch the moment the custom
    line is added. The PDP is the last surface that can say so cheaply, and §17.6.6 puts the
    disclosure in the add-to-cart confirmation rather than leaving it to checkout. **No order is
    ever split**; the machinery that would have split one is withdrawn.

Catalogue size is `{{SKU_COUNT}}` — the adjacent site's catalogue scope, several hundred to
roughly a thousand SKUs (§E5), to be confirmed when the export is taken. The faceting and
gallery architecture below holds across that range.

---

## 17.1 The PDP's jobs, ranked

A page that tries to do nine things equally does none of them. The ranking governs vertical
order, above-the-fold allocation, and what gets cut when the page grows too long.

| Rank | Job | Who has it | Resolved by | Failure mode if unranked |
|---|---|---|---|---|
| **1** | Let the buyer see the object well enough to trust its texture, scale, and colour | All four personas ([02-ux-research.md](02-ux-research.md) §2.3) | Gallery: zoom, detail crops, `SCALE_REFERENCE` media | Wool and fleece are tactile goods bought through a screen. If the gallery fails, nothing below it is read |
| **2** | Answer "is this real, and did you make it?" | Марта, anxieties A1/A3 | Provenance block, `productionStage[]`, origin mark | The premium *is* provenance. Without it the price is arbitrary |
| **3** | Make the correct variant selectable without ambiguity | Оксана, Ірина | Buy box, `OptionDisplay` selectors, ranged-price handling | A buyer who cannot tell which size costs more leaves rather than guesses |
| **4** | State availability honestly — one-of-one, made-to-order, out of stock | All | §17.7 | Selling a one-of-one twice is the worst operational failure available here |
| **5** | Answer "will it itch / can I wash it / how heavy is it?" | Оксана, anxiety A2 | Specification table, care block | These stall a decision mid-consideration |
| **6** | Answer "will it arrive, what does it cost, can I return it?" | All, anxieties A4/A5 | Delivery estimator, returns block, trust row | [02-ux-research.md](02-ux-research.md) §2.4 requires these answerable without opening an accordion |
| **7** | Convert the decision into a cart line with zero friction | All | Add to cart, sticky panel, mobile bottom bar | A decided buyer must never hunt for the button |
| **8** | Raise average order value honestly | Business | `ProductRelation` blocks §17.16 | Merchandising placed above jobs 1–6 is the classic PDP mistake |
| **9** | Be retrievable and citable by search and AI assistants | Business | §17.21 | On a cold-start domain this is a 6–12 month investment, not a launch win |

**The ordering rule:** jobs 1–6 are reachable within the first two screens on mobile and the
first screen-and-a-half on desktop. Job 8 never appears above job 6.

**One brand constraint, stated once.** The sheep mascot is now brand-core
([00-client-decisions.md](00-client-decisions.md) D2, consequence 3) — and it still does not
appear on this page. [01-brand-strategy.md](01-brand-strategy.md) §1.7 keeps it off the PDP,
cart, checkout and wholesale surfaces, and mandating the identity makes that restraint more
important rather than less. A shepherd mascot can coexist with 14,900 UAH price points only if
it stays away from the moment of payment.

---

## 17.2 Above the fold — the content decision

| Option | Above the fold | Verdict |
|---|---|---|
| **A. Full-bleed hero, buy box below** | One cinematic photograph; price requires a scroll | Rejected. Reads beautifully, converts badly. A visitor arriving on a product query came to evaluate a price; hiding it forces a scroll to answer the question that brought them |
| **B. Classic split — gallery left, buy box right** | Primary image, name, price, variants, availability, CTA | **Selected** |
| **C. Editorial split, provenance above price** | Origin sentence, then image, then price | Rejected. Provenance is job 2, not job 1. Putting narrative above price inverts the visitor's own priority |

Option B satisfies jobs 1, 3, 4 and 7 in one viewport and is the layout this audience has
already learned elsewhere. Familiarity beats novelty on a transactional page —
[08-design-system.md](08-design-system.md) §8.2 principle 6.

**Guaranteed above the fold at 1440×900 and 390×844:** primary image (~620 px / 4:5 at
~470 px), `h1`, price or range, availability badge, the origin mark (§17.10.2), add-to-cart
(via the persistent bottom bar on mobile), one provenance line, and the breadcrumb (collapsed
to `← parent` on mobile). All variant axes are visible on desktop; on mobile the first axis is
visible and the rest fall within one scroll.

The one-line provenance teaser is the compromise that keeps option C's insight without its
cost: it plants the claim, then §17.10 proves it.

---

## 17.3 Desktop wireframe — 1440 px

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SiteHeader (z-header, sticky)                                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Головна / Власне виробництво / Вовна / Ліжники / Ліжник «Черемош»                 │
├───────────────────────────────────────────┬──────────────────────────────────────┤
│                                           │  ЛІЖНИК ВОВНЯНИЙ      overline       │
│  ┌──┐ ┌────────────────────────────────┐  │  Ліжник «Черемош»     h1             │
│  │▣ │ │                                │  │  ✋ Власне виробництво  origin mark   │
│  ├──┤ │                                │  │  ★★★★★ 4.8 · 23 відгуки  (anchor)   │
│  │  │ │       PRIMARY IMAGE            │  │                                      │
│  ├──┤ │       (MediaRole.PRIMARY)      │  │  5 400 – 7 400 ₴      h2, tabular    │
│  │  │ │       4:5, radius-none         │  │  ціна залежить від розміру  caption  │
│  ├──┤ │       hover = zoom lens        │  │                                      │
│  │  │ │       click = lightbox         │  │  ── Розмір ──────── SIZE_GRID ──     │
│  ├──┤ │                                │  │  ┌────────┐┌────────┐┌────────┐      │
│  │▶ │ │                                │  │  │150×200 ││200×220 ││ 2×3 м  │      │
│  ├──┤ │                                │  │  │5 400 ₴ ││6 900 ₴ ││7 400 ₴ │      │
│  │↔ │ │                                │  │  └────────┘└────────┘└────────┘      │
│  │  │ │                                │  │  ┌──────────────────┐  §17.6.6      │
│  │  │ │                                │  │  │ ✎ Свій розмір    │  only when    │
│  │  │ │                                │  │  └──────────────────┘  allowsCustom │
│  └──┘ └────────────────────────────────┘  │  ⓘ Таблиця розмірів        (modal)  │
│  thumbs   1/7  ‹ ›                        │                                      │
│  (vertical rail, 72×90, 8px gap)          │  ── Колір ──────── SWATCH ──────     │
│                                           │  ◉ ◯ ◯ ◯   photographic swatches     │
│                                           │  Натуральний сірий                   │
│                                           │                                      │
│                                           │  ● В наявності · 2 шт   emerald-600  │
│                                           │  Кількість  [ − ] [ 1 ] [ + ]         │
│                                           │                                      │
│                                           │  ┌────────────────────────────────┐   │
│                                           │  │      ДОДАТИ В КОШИК            │   │
│                                           │  └────────────────────────────────┘   │
│                                           │  ♡ Зберегти    ⇄ Порівняти           │
│                                           │                                      │
│                                           │  ┌─ trust row ─────────────────────┐  │
│                                           │  │ 🏔 Яворів · ↩ 14 днів           │  │
│                                           │  │ 🚚 Нова Пошта {{NP_BRANCH_PRICE}}│  │
│                                           │  │ 👣 Цех можна оглянути з власником│  │
│                                           │  │ ✋ Виробляємо понад 30 років     │  │
│                                           │  └─────────────────────────────────┘  │
│                                           │                                      │
│                                           │  ▸ Доставка та оплата     (expanded) │
│                                           │  ▸ Повернення і гарантія  (expanded) │
│                                           │  [ ↑ panel becomes position:sticky ] │
├───────────────────────────────────────────┴──────────────────────────────────────┤
│  §17.9  ХАРАКТЕРИСТИКИ         two-column definition grid, open by default        │
├──────────────────────────────────────────────────────────────────────────────────┤
│  §17.10 ПОХОДЖЕННЯ             container-full, --bg-alt, --section-y-md           │
│  ┌────────────────────────┬────────────────────────────────────────────────────┐ │
│  │  MediaRole.PRODUCTION  │  Вовна: {{WOOL_SOURCE}} · 28 мкм                    │ │
│  │  named person, dated   │  Прання → чесання → прядіння → ткання → оздоблення  │ │
│  │                        │  Повний цикл у Яворові  →  [Виробництво]            │ │
│  └────────────────────────┴────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│  §17.11 ДОГЛЯД          3-step icon row + link to the care guide                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│  §17.16 ЗАВЕРШІТЬ КОМПЛЕКТ    COMPLETES_SET · 4-up                               │
│  §17.16 З ЦИМ КУПУЮТЬ         CROSS_SELL   · 4-up                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│  §17.15 ВІДГУКИ (0 at launch)  empty state designed first                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│  §17.17 ВИ ПЕРЕГЛЯДАЛИ        client-side, localStorage, max 8                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SiteFooter                                                                       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Grid allocation on `lg`/`xl` ([11-spacing-system.md](11-spacing-system.md) §11.3): gallery in
columns 1–7, buy box in 8–12, the gutter carrying the separation. No vertical rule — hairlines
only, and whitespace is the intended separator ([11-spacing-system.md](11-spacing-system.md)
§11.5).

## 17.4 Mobile wireframe — 390 px

```
┌────────────────────────────────┐
│ ☰   ВІВЧАРИК    ⌕  ♡  🛒      │  sticky header, 56 px
├────────────────────────────────┤
│ ← Ліжники                      │  collapsed breadcrumb
├────────────────────────────────┤
│                                │
│        PRIMARY IMAGE           │  swipeable, 4:5
│        full-bleed, no radius   │  tap = lightbox
│                          ⤢     │  expand affordance, 48×48
│         ● ○ ○ ○ ○ ○ ○          │  dot indicator
├────────────────────────────────┤
│ ЛІЖНИК ВОВНЯНИЙ                │  overline
│ Ліжник «Черемош»               │  h1, 2rem
│ ✋ Власне виробництво           │  origin mark, §17.10.2
│ ★★★★★ 4.8 · 23 відгуки         │  anchors to §17.15
│                                │
│ 5 400 – 7 400 ₴                │  h2, tabular-nums
│ ціна залежить від розміру      │  caption
│                                │
│ 🏔 Виткано в Яворові —          │  one-line provenance teaser
│    столиці ліжникарства        │
├────────────────────────────────┤
│ Розмір                         │
│ ┌──────────┐ ┌──────────┐      │  SIZE_GRID, 2-up,
│ │ 150×200  │ │ 200×220  │      │  min 48 px tall
│ │ 5 400 ₴  │ │ 6 900 ₴  │      │
│ └──────────┘ └──────────┘      │
│ ┌────────────────────────┐     │  §17.6.6, rendered only
│ │ ✎ Свій розмір          │     │  when allowsCustomSize
│ └────────────────────────┘     │
│ ⓘ Таблиця розмірів             │
│                                │
│ Колір · Натуральний сірий      │
│ ◉  ◯  ◯  ◯                     │  56 px swatches, 8 px apart
│                                │
│ ● В наявності · 2 шт           │
│ Кількість  [ − ] [ 1 ] [ + ]   │
├────────────────────────────────┤
│ 🏔 Яворів      ↩ 14 днів       │  trust row, 2×3
│ 🚚 {{NP_BRANCH_PRICE}}  ✋ 30 р.│
│ 👣 Цех можна оглянути          │  §17.14, G3
├────────────────────────────────┤
│ ХАРАКТЕРИСТИКИ                 │  §17.9 — OPEN by default,
│ Склад        100% вовна        │  never behind a tab
│ Щільність    1 400 г/м²        │
│ Тонина       28 мкм (щільна)   │
│ … Показати всі (11)            │
├────────────────────────────────┤
│ ПОХОДЖЕННЯ   §17.10            │  full-bleed production photo
├────────────────────────────────┤
│ ДОСТАВКА                       │  §17.12.1, expanded
│ Нова Пошта, відділення         │  {{NP_BRANCH_PRICE}}
│ Нова Пошта, курʼєр             │  {{NP_COURIER_PRICE}}
│ Укрпошта                       │  {{UKRPOSHTA_PRICE}}
│ Забрати в Яворові   безкоштовно│  магазин + виробництво, §17.12.1
├────────────────────────────────┤
│ ОПЛАТА                         │  §17.12.2, expanded
│ Картка онлайн                  │  всі товари, всі країни
│ Наложений платіж з оглядом     │  Україна, товари в наявності
│   Оглядаєте на пошті до оплати │  H1.2 — the inspection right
├────────────────────────────────┤
│ ПОВЕРНЕННЯ ТА ГАРАНТІЯ §17.13  │
├────────────────────────────────┤
│ ДОГЛЯД  §17.11                 │
├────────────────────────────────┤
│ ЗАВЕРШІТЬ КОМПЛЕКТ  §17.16     │
├────────────────────────────────┤
│ ВІДГУКИ  §17.15                │
├────────────────────────────────┤
│ ВИ ПЕРЕГЛЯДАЛИ  §17.17         │
├────────────────────────────────┤
│ SiteFooter                     │
└────────────────────────────────┘
╔════════════════════════════════╗
║ 5 400 ₴  │  ДОДАТИ В КОШИК  ♡ ║  fixed bottom bar, 72 px
╚════════════════════════════════╝  + safe-area-inset-bottom
```

**Mobile ordering rationale.** Delivery and returns sit *above* merchandising and reviews
because [02-ux-research.md](02-ux-research.md) §2.4 identifies A4 and A5 as purchase-blocking,
and because the same document names the buried "Доставка і оплата" tab as the anti-pattern to
avoid. Nothing that answers a blocking anxiety is placed behind a tab strip. On a cold-start
domain with no reviews to lean on (D2), these blocks carry more of the trust load than they
would on an established store.

---

## 17.5 The gallery

### 17.5.1 Media roles

`MediaRole` ([25-database-schema.md](25-database-schema.md) §25.4) is not a loose tag. Each
value has a defined job and a defined position.

| Role | Position | Count | Job | Required? |
|---|---|---|---|---|
| `PRIMARY` | 1 | Exactly 1 | The LCP image. The object, clean, correctly lit and white-balanced | Yes — publish blocked without it |
| `LIFESTYLE` | 2–3 | 1–3 | The object in a real room, on a real bed. Answers "will it look right in my home?" | Yes, min 1 |
| `SCALE_REFERENCE` | 4 | 1–2 | The object beside something of known size | **Yes** for blankets, rugs, hides, capes. §17.5.2 |
| `DETAIL` | 5–7 | 2–4 | Macro of weave, pile, stitching, edge finish | Yes, min 2 |
| `PRODUCTION` | 8–9 | 0–2 | This product, or its material, being made | **Own manufacture only.** Forbidden on partner products |
| `GALLERY` | fill | any | Everything else | Optional |

Order is `role` priority first, `ProductMedia.position` second. An editor reorders within a
role but cannot promote a `DETAIL` above the `PRIMARY` — that is a product decision the system
owns, not an editorial one.

[00-client-decisions-2.md](00-client-decisions-2.md) §E5 permits the adjacent business's
photograph library to be reused, which resolves catalogue coverage and de-risks
[00-assumptions.md](00-assumptions.md) E1. Reuse is conditional: re-crop and re-grade to
[01-brand-strategy.md](01-brand-strategy.md) §1.6, strip EXIF, rename semantically, and author
new `alt` text per locale.

**`PRODUCTION` media is the one role reuse cannot supply.** Those photographs document a
different workshop in a different village, and §17.10 claims Yavoriv. Every `PRODUCTION` image
on this site must come from the Yavoriv shoot that §E5 still schedules, and §E6 extends that to
the tanning stages now that hides are claimed as own manufacture. A stage that cannot be
photographed is a stage that must not be asserted.

### 17.5.2 Why `SCALE_REFERENCE` is a first-class role

A ліжник is sold as "150×200". That number is meaningless to most buyers: almost nobody
converts 200×220 cm into "covers a double bed with a 30 cm drop each side". The failure is
specific and expensive — the buyer receives a smaller-feeling object than imagined and opens a
return, and under the stated policy the buyer pays return shipping, which converts a size
misjudgement into a complaint.

Sheepskin is worse. A natural hide is an irregular shape whose stated size is a bounding box,
not an area. "90–100 см" describes a spine length that a buyer mentally renders as a rectangle.
A photograph of the hide on an armchair collapses that ambiguity in one glance where three
sentences of copy cannot.

**The rule:** any product in the ліжники, ковдри, килими, накидки, гуні, овчина or
чохли families is publish-blocked without at least one `SCALE_REFERENCE` image, enforced in the
admin publish validator rather than left to editorial discipline. Шкарпетки, капці, пояси,
пряжа and ровниця are exempt — their scale is already intuitive.

`SCALE_REFERENCE` images additionally require a `MediaTranslation.caption` naming the reference
object («ліжник 200×220 на двоспальному ліжку 160 см»), because the photograph alone does not
convey the relationship to a screen-reader user.

### 17.5.3 Thumbnails, zoom, lightbox

| Breakpoint | Thumbnail pattern | Rationale |
|---|---|---|
| `xs`–`sm` | None. Horizontal swipe with a dot indicator, max 9 dots | Thumbnails at 390 px are either unreadable or steal height from the primary image |
| `md` | Horizontal strip below the primary, 64×80, scrollable | A vertical rail would compress the primary below useful size |
| `lg`+ | Vertical rail left of the primary, 72×90, 8 px gap, 7 visible with `‹ ›` paging | Preserves the primary image's height, which is what sells the texture |

Thumbnails carry role affordances — `▶` for video, `↔` for `SCALE_REFERENCE`, a workshop glyph
for `PRODUCTION` — each with an accessible name. Activation is **click, not hover**:
hover-to-change is a documented failure for the 60+ segment and causes accidental changes
during trackpad scrolling ([02-ux-research.md](02-ux-research.md) §2.6).

Three zoom mechanisms, because implementing one fails at least one input method:

| Context | Mechanism |
|---|---|
| Desktop pointer | Inline lens on hover, 2.5×, a 180 px circular lens sampling a Cloudinary `c_crop` derivative at 2000 px. Requested **on first hover**, never eagerly — a speculative 2000 px fetch is a direct LCP cost |
| Desktop keyboard | `Enter` opens the lightbox at 1× with `+` / `−`. The lens is unreachable by keyboard by definition, so the lightbox must reach the same magnification |
| Touch | Pinch **inside the lightbox** only, 1×–4×, double-tap toggles 1×/2.5×. Pinch on the inline gallery would conflict with page zoom, which must stay available under WCAG 1.4.4 |

```
┌──────────────────────────────────────────────────────────────┐
│                                                          ✕   │  48×48
│   ‹                 IMAGE, object-fit: contain           ›   │  56×56, desktop
│                     max 92vh, max 92vw                       │
│   ┌────────────────────────────────────────────────────┐     │
│   │ Ліжник «Черемош» на двоспальному ліжку 160 см      │     │  solid plate
│   └────────────────────────────────────────────────────┘     │  (09 §9.6 #2)
│   ▣ ▣ ▣ ▣ ▣ ▣ ▣                                    4 / 7    │
└──────────────────────────────────────────────────────────────┘
```

| Property | Decision |
|---|---|
| Backdrop | `forest-950` at 96%, `shadow-xl` on the image plate |
| Entrance | Framer Motion `layoutId` Morph ([13-motion-system.md](13-motion-system.md) §13.4 #5) from the clicked thumbnail, `dur-slow`, `ease.inOut` |
| Focus | Trapped; moves to close on open, returns to the originating thumbnail on close |
| Keyboard | `←` `→` navigate · `Esc` close · `+` `−` zoom · `Home`/`End` first/last |
| Touch | Swipe navigates · swipe down closes with a rubber-band · pinch zooms · drag pans when zoomed |
| Scroll lock | `overflow: hidden` on `body`, scroll position restored on close. Never `position: fixed` on body — it loses position on iOS |
| Reduced motion | Cross-fade 150 ms instead of Morph ([13-motion-system.md](13-motion-system.md) §13.6) |
| History | No history push on desktop. On mobile it pushes `#media-4` so the hardware back button closes the lightbox rather than leaving the page |

### 17.5.4 Video and 360°

Video is `MediaKind.VIDEO` with a `posterId`. Never autoplayed with sound, never autoplayed at
all under `saveData` or on a ≤4-core device ([13-motion-system.md](13-motion-system.md) §13.7),
and never in the `PRIMARY` slot — an LCP that waits on a video decode cannot reach 98–100.
The poster renders as a normal slide with a `▶` overlay; activation swaps in
`<video controls playsinline preload="none">`. Captions (`.vtt`) are mandatory for any video
with speech, which includes most factory footage where a person explains a stage.

**360° spin is scoped to sheepskin and leather hides only.** A hide's value lies in its
irregular outline and the way light moves across pile as the angle changes, and pile direction
is exactly what a buyer checks first in person. That is a genuine information gain. For woven
wool and wooden ware it is motion without information, which
[08-design-system.md](08-design-system.md) §8.2 principle 5 rejects. Implementation when used:
24 frames at 1200 px AVIF, loaded only on activation, ≤480 KB total, drag or `←`/`→` to step, a
static frame under `prefers-reduced-motion`.

---

## 17.6 The buy box

### 17.6.1 Price rendering

| Case | Render | Notes |
|---|---|---|
| Single variant | `5 400 ₴` | `h2`, `--text-primary`, `tabular-nums` |
| Ranged, no selection | `5 400 – 7 400 ₴` + caption naming the axis | From `Product.priceMinMinor`/`priceMaxMinor`. The caption names *what* drives the range — «залежить від розміру», «від довжини хутра» — because an unexplained range reads as evasive |
| Ranged, selection made | Collapses to `ProductVariant.priceMinor` | An instant swap, never a count-up ([13-motion-system.md](13-motion-system.md) §13.11) |
| Discounted | `6 900 ₴` with `8 500 ₴` struck through in `--text-muted` | Only when `compareAtMinor` is non-null. No fake RRP — [01-brand-strategy.md](01-brand-strategy.md) §1.9 names discount-from-fake-RRP as the category norm this brand rejects |
| By weight | `2 400 ₴ / кг` plus a computed line | §17.6.4 |

Ranged pricing is a real requirement, not a hypothetical: the reference catalogue in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.6 shows size-driven ranges as the
norm in this category, and `Product.priceMinMinor`/`priceMaxMinor` exist for exactly this.
Those specific figures are an adjacent business's prices and are used here as a market
reference only; Вівчарик's own price list is `{{PRICE_LIST}}`.

**Currency, now that `en`/`pl`/`de` are transactional.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E11 makes the three non-Ukrainian locales
sell rather than inform, which turns a display question into a charge question.

| Case | Rendering | Rule |
|---|---|---|
| `uk` | `5 400 ₴` | Charge currency equals display currency |
| `en`/`pl`/`de`, WayForPay settles the local currency (V11 confirms) | Local currency as the primary figure | Display equals charge; no disclosure needed |
| `en`/`pl`/`de`, WayForPay settles UAH only (V11 denies) | Converted figure primary, `--text-muted`, with `5 400 ₴ — сума списання` beside it | **The UAH charge amount must be stated on the PDP, not first revealed by the buyer's bank.** A card statement that disagrees with the price the buyer read is a chargeback, and it is the most avoidable one on this project |

Which branch applies is blocked on V11 ([00-client-decisions-2.md](00-client-decisions-2.md)
§E10) and is a `Setting`, not a code path: the PDP renders whichever of the two the
configuration declares. What is not configurable is the disclosure — a converted figure
presented as the charge amount is forbidden in both branches.

The price occupies space reserved for the widest string at that breakpoint, so collapsing a
range to a single price causes **zero layout shift**. Tabular numerals are mandatory
([10-typography.md](10-typography.md) §10.6).

### 17.6.2 Variant selectors per `OptionDisplay`

Driven by `OptionType.displayAs` ([25-database-schema.md](25-database-schema.md) §25.3) so a
merchandiser changes presentation without a code change. Every confirmed category must support
multiple colours and multiple sizes ([00-client-decisions.md](00-client-decisions.md) D4), so
all four controls are launch scope, not future scope.

| `displayAs` | Control | Used for | Spec |
|---|---|---|---|
| `SIZE_GRID` | Rectangular cards showing the label **and that variant's price** | size | 2-up mobile, 3-up desktop, min 48 px tall, 8 px gaps. The in-card price is what resolves the ranged-price question at the moment of choosing, which is the only moment it matters. Where `Product.allowsCustomSize` is true the grid gains one final, full-width card — «✎ Свій розмір» — which is not a variant and behaves differently from every other card in the group (§17.6.6) |
| `SWATCH` | Circular image chip, 44 px mobile / 40 px desktop, with the selected value's name as text beside the group label | colour, fur length | §17.6.3 |
| `PILL` | Rounded rectangle with a text label | composition, weave, thickness | `radius-full`, 48 px tall, `stone-300` border → `forest-800` + 2 px inner ring when selected |
| `DROPDOWN` | Native `<select>` | any axis above 8 values — метраж, товщина | Native, not a custom listbox. It is keyboard-complete, screen-reader-complete, and gets the OS wheel picker on mobile free. A custom control would be worse in every dimension that matters to this audience |

**Unavailable combinations** render struck through with `aria-disabled="true"` — **visible but
not selectable**. Hiding them is worse: "does this even come in 2×3 m?" is a different question
from "is 2×3 m in stock?". Activating a disabled option surfaces notify-me (§17.7) rather than
doing nothing.

**Selection lives in the URL** — `?size=150x200&color=natural-grey` resolves to a variant on
load. This makes a configuration shareable, makes the back button behave, and makes the
open-three-tabs-and-compare behaviour in [02-ux-research.md](02-ux-research.md) §2.7 work.

### 17.6.3 Why wool and fleece colour needs a photographic swatch

`OptionValue` carries both `hex` and `swatchMediaId`. For this catalogue **`swatchMediaId` is
mandatory and `hex` is a fallback only.** The reasoning is material, not aesthetic.

1. **Undyed wool is not one colour.** «Натуральний сірий» is a heather — white, grey and brown
   fibres averaging to grey at distance and reading as none of them up close. A flat `#8A8A85`
   chip is a lie the buyer discovers on delivery.
2. **Pile has direction.** Sheepskin reads as two different values depending on which way the
   fibre lies. A photographic swatch shot under the product's own light carries that.
3. **Batches vary and the brand should not hide it.** A hand-dyed batch is not reproducible to
   a hex value, and [00-client-decisions-2.md](00-client-decisions-2.md) §E8 confirms batches
   are not tracked — so the swatch photograph is the only honest representation available.
   Honesty about variation is precisely the [01-brand-strategy.md](01-brand-strategy.md) §1.5
   voice principle: show the work rather than claim uniformity.
4. **A flat chip destroys the premium.** The design thesis is photography-led
   ([08-design-system.md](08-design-system.md) §8.2 principle 1). A row of flat dots is the one
   element in the buy box that would look like a template store.

`hex` retains two jobs: the `dominantHex` placeholder behind a loading swatch, and the fallback
when a swatch image is missing — in which case the admin flags the option as incomplete rather
than silently rendering a flat chip.

Swatches are **never colour-only carriers of meaning**. The selected value's name is always
rendered as text beside the group label («Колір · Натуральний сірий»), satisfying WCAG 1.4.1.

### 17.6.4 Quantity, and unit pricing for yarn, rovnytsia and raw wool

Standard products use a stepper `[−] [ n ] [+]`, numeric field `type="text"`
`inputmode="numeric"` `pattern="[0-9]*"`, 48 px targets, ≥8 px separation. Maximum is
`min(stockQty, 10)`; the `+` disables at the ceiling with an adjacent explanation, never
silently ([08-design-system.md](08-design-system.md) §8.5).

Three confirmed categories — **вовняна пряжа, ровниця, вовна для рукоділля** — are sold by
weight ([00-client-decisions.md](00-client-decisions.md) D4), carrying
`PricingUnit.KILOGRAM` or `SKEIN`. Persona Ірина buys by **колір + метраж + товщина** and
typically needs several skeins from one dye lot, so the control is different:

```
Ціна              2 400 ₴ / кг
Моток             ~100 г  ·  метраж ~250 м  ·  товщина 8/2

Кількість мотків   [ − ]  [  5  ]  [ + ]
─────────────────────────────────────────
≈ 500 г  ·  ≈ 1 250 м  ·  1 200 ₴        live, tabular-nums

ⓘ Відтінок може незначно відрізнятися між партіями.
  Для великого проєкту радимо замовити всю кількість одразу.
```

The buyer selects **skeins**, because skeins are what ship and what the warehouse counts. The
page derives weight, total length, and total price live. An editable weight field would create
fractional-skein orders the business cannot fulfil — an operations bug disguised as a UI
feature.

Метраж and товщина are `ProductAttributeValue` rows, surfaced *inside the buy box* rather than
only in the specification table, because for this audience they are selection criteria, not
description.

**Dye lots are not tracked, and the PDP says so in one sentence.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E8 settles this: `ProductVariant.dyeLot`
stays in the schema nullable and unused — no admin field, no facet, no variant axis, no PDP
display. The earlier design carried two branches, one of which built a lot selector; that
branch is removed. Building a selector over data nobody records would promise a match the
business cannot honour, and the first mismatched reorder would expose it.

What replaces it is the note in the wireframe above, and its framing matters more than its
placement:

> «Відтінок може незначно відрізнятися між партіями. Для великого проєкту радимо замовити всю
> кількість одразу.»

That is **advice, not a disclaimer.** A disclaimer transfers risk to the buyer; this sentence
tells a needleworker the one thing that will save their project — exactly what they would be
told across a counter in a yarn shop, by someone who knows wool. Running out mid-project is the
named fear behind job J4 ([02-ux-research.md](02-ux-research.md) §2.2), so the sentence
simultaneously prevents the most expensive return in this family and demonstrates the expertise
that justifies the price. It sits in the buy box, above the add-to-cart button, where it can
still change the quantity chosen.

Silence was never an option. A lot selector was one option, and it was the dishonest one.

### 17.6.5 Add to cart, wishlist

| Control | Spec |
|---|---|
| **Add to cart** | `Button variant=primary size=lg`, full width, 56 px. The only primary button in the viewport ([08-design-system.md](08-design-system.md) §8.2 principle 4) |
| Loading | Spinner replaces the label, width preserved, no layout shift |
| Success | Label morphs to a check for 400 ms, cart badge counts up, toast rises ([13-motion-system.md](13-motion-system.md) §13.10). The drawer **does not auto-open on desktop** — it interrupts a buyer who may want a second variant. It does open on mobile, where the bottom bar offers no other confirmation |
| Announcement | `aria-live="polite"`: «Ліжник «Черемош», 150×200, додано в кошик. У кошику 2 товари.» **Where the added line is a custom size and the cart already holds a stocked one, the mixed-cart disclosure is appended to this same utterance** — see §17.6.6 |
| **Mixed-cart disclosure** | Rendered inside this confirmation whenever a custom-size line lands in a cart that also holds a stocked line. It is the moment the terms of another line change, and §17.6.6 specifies the copy, the escape and the announcement ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) |
| Disabled | Only when no variant is selected, with an adjacent «Оберіть розмір». Never disabled silently |
| **Save** | Icon plus a visible «Зберегти» label. Heart outline → fill, 1.15 scale pulse, 260 ms. `localStorage` only. On activation the label becomes **«Збережено на цьому пристрої»** — see below |
| **Compare** | Desktop only, and only where the family has ≥3 `isComparable` attributes. Meaningful for пряжа and ліжники; hidden for капці and пояси |

**Why the save control admits its own limitation.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent, which
removes accounts and with them `WishlistItem` — [25-database-schema.md](25-database-schema.md)
§25.6 deletes the model outright. There is no login to merge on and no profile to sync to. The
saved list is a `localStorage` array on one browser on one device, and it dies with a cleared
cache.

The tempting alternative is to say nothing: a heart that fills looks the same whether or not it
syncs, and most visitors never test it. That is the version to reject. A buyer who saves three
ліжники on a phone during a Carpathian holiday and opens a laptop at home to buy finds an empty
list, no explanation, and a reason to conclude the site is broken — at the exact moment they had
decided to spend five figures. The convenience of an unqualified heart is worth a few seconds of
perceived polish; the cost of the discovery is the order.

Stating «Збережено на цьому пристрої» is also strategically consistent rather than merely
prudent. This brand's entire premium rests on verifiable claims about origin
([01-brand-strategy.md](01-brand-strategy.md) §1.1). A site that overstates where a heart icon
stores data has established, in a low-stakes place, that its claims do not survive checking. The
same sentence appears in the header's saved-items panel and in the cart's «Зберегти на потім»
control ([18-checkout-specification.md](18-checkout-specification.md) §18.2.2), so the limit is
never learned by surprise.

### 17.6.6 «Свій розмір» — the custom-size mode

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b establishes the model that the rest of
this section implements: **made-to-order is not a property of the product, it is a property of
which size the customer picks.** Ліжник 150×200 is woven, on the shelf, and payable at the Nova
Poshta counter. The same ліжник at 180×240 does not exist, takes fourteen days, and is prepaid in
full. One product, two completely different purchases, and a product-level boolean cannot express
that — it would either force prepayment onto stocked sizes or permit cash on delivery on a
two-week build.

`Product.allowsCustomSize` ([25-database-schema.md](25-database-schema.md) §25.3) is the admin
toggle and is **off by default**. Where it is false the option does not render, and nothing else
on this page changes.

#### What selecting it does

Choosing «Свій розмір» is not selecting a variant. There is no `ProductVariant` row behind it,
no SKU, and no stock figure. It **swaps the buy box into made-to-order mode**, and five things
change at once:

| Element | Standard size | «Свій розмір» |
|---|---|---|
| Price | `ProductVariant.priceMinor` | Computed live from dimensions (§H3c, below) |
| Dimension inputs | Absent | Two constrained numeric fields |
| Availability | «В наявності · 2 шт» | «Виготовлення — 14 днів. Далі — доставка перевізником.» |
| Payment | Card **or** наложений платіж з оглядом | **Card only, full prepayment**, with the reason stated |
| Quantity | Stepper | Locked at 1. A second custom piece is a second decision, and batching two identical bespoke builds behind one stepper hides a doubling of lead-time risk |

All five appear together, in the buy box, above the CTA. None of them appears in a tab.
[00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 2 is explicit: a customer must not
discover the lead time at checkout and must never discover it after paying.

```
── Розмір ──────────────────────────────────────────── SIZE_GRID ──
┌────────┐┌────────┐┌────────┐
│150×200 ││200×220 ││ 2×3 м  │
│5 400 ₴ ││6 900 ₴ ││7 400 ₴ │
└────────┘└────────┘└────────┘
┌──────────────────────────────────────────────┐
│ ✎ Свій розмір                             ◉  │   selected
└──────────────────────────────────────────────┘

  Ширина, см                    Довжина, см
  ┌──────────────┐              ┌──────────────┐
  │ 180          │              │ 240          │
  └──────────────┘              └──────────────┘
  від 100 до 200 см             від 120 до 300 см
  ↑ the permitted range is stated before the field is touched,
    not after it is violated

  ──────────────────────────────────────────────────────────
  Площа                                     4,32 м²
  Ціна                                     7 776 ₴      h2, tabular-nums
  ──────────────────────────────────────────────────────────

  ⏱ Виготовлення — 14 днів. Далі — доставка перевізником.
  💳 Виріб шиється за вашими розмірами, тому оплата —
     повна, наперед. Наложений платіж недоступний.
  ↩ Виріб на індивідуальний розмір поверненню не підлягає,
     окрім браку.

  ┌────────────────────────────────────────────┐
  │        ЗАМОВИТИ ВИГОТОВЛЕННЯ               │
  └────────────────────────────────────────────┘
```

Three sentences sit between the price and the button, and all three are there because the
alternative is a dispute rather than because the page has room. The prepayment line **states its
reason**: [00-client-decisions-5.md](00-client-decisions-5.md) §H1.1 is explicit that an
unexplained prepayment requirement reads as distrust, and the factory committing two weeks of
labour to a size nobody else will buy is a reason a buyer accepts immediately once they hear it.

#### How the price is computed — §H3c

[00-client-decisions-5.md](00-client-decisions-5.md) §H3c settles the pricing question, and the
answer separates cleanly into two halves that first appeared to conflict: **the owner sets the
rate in the admin, the system does the arithmetic.** Nobody quotes by hand, nobody waits for a
reply, and the owner never loses control of the number.

```
area_m2 = (widthCm × lengthCm) / 10 000
raw     = area_m2 × customSizeRatePerSqmMinor
price   = max(raw, customSizeMinPriceMinor)
```

```ts
// Shared by the PDP buy box and the order-creation path.
// The browser calls it to inform; the server calls it to charge.
export function customSizePriceMinor(
  p: Pick<Product,
    | 'customSizeRatePerSqmMinor'
    | 'customSizeMinPriceMinor'
    | 'customSizeMinWidthCm'  | 'customSizeMaxWidthCm'
    | 'customSizeMinLengthCm' | 'customSizeMaxLengthCm'>,
  widthCm: number,
  lengthCm: number,
): number {
  assertWithinBounds(p, widthCm, lengthCm);          // throws; never clamps silently
  const areaM2 = (widthCm * lengthCm) / 10_000;
  const raw    = Math.round(areaM2 * p.customSizeRatePerSqmMinor! / 100) * 100;  // whole ₴
  return Math.max(raw, p.customSizeMinPriceMinor!);
}
```

Rounding is to the whole hryvnia, not to the kopiyka. A bespoke woven object priced at
7 776,43 ₴ reads as a spreadsheet output; 7 776 ₴ reads as a price a person set.

**The browser's number is never trusted.** The live figure exists to inform the decision; the
server recomputes from `Product` and the submitted dimensions at order creation and **that**
figure is what is charged and what is written to `OrderItem.unitPriceMinor`. This is not
defensive tidiness — a client-supplied price on a prepaid custom order is the most obvious
tampering vector on the site, and the one place where the tamper is not caught by a later stock
check or a carrier refusal. If the recomputed figure differs from the one the browser displayed,
the checkout stops and restates the price rather than charging either number silently
([18-checkout-specification.md](18-checkout-specification.md) §18.8.7).

**Why rate-per-square-metre and not a percentage uplift over the nearest standard size.**
Considered and rejected in §H3c. The uplift model prices by reference to a size the customer did
not choose — a 180×240 order priced off 150×200 — so the multiplier has to grow non-linearly to
stay honest as the gap widens, and the owner ends up tuning a coefficient with no physical
meaning. A rate per square metre matches how the cost is actually incurred: wool consumed and
loom hours. The owner can reason about «скільки коштує метр» directly, which is the only way the
number stays correct after the person who set it has moved on.

#### The dimension inputs

| Property | Specification |
|---|---|
| Markup | `type="text"` `inputmode="numeric"` `pattern="[0-9]*"`, **not** `type="number"` — a number input brings spinners nobody wants at 48 px, permits exponent notation, and lets a scroll wheel silently change a price |
| Label | Always visible, above the field: «Ширина, см» / «Довжина, см» |
| Range hint | Rendered beneath the field as persistent text, wired with `aria-describedby`: «від 100 до 200 см», from `customSizeMinWidthCm` / `customSizeMaxWidthCm`. **Stated before the field is touched**, never only in an error |
| While typing | No clamping, no validation, no price recompute mid-keystroke. Clamping as the user types turns «18…» into «100» before they reach the 0, which is the single most infuriating numeric-input bug there is |
| On blur | Validate. Below minimum or above maximum → the field enters the error state, keeps the typed value, and the message names the limit and offers it: «Максимальна ширина — 200 см. Це обмеження верстата.» The value is never silently rewritten |
| On paste | Strip everything that is not a digit, then treat the result exactly as a blur. `180 см`, `180cm` and `1,80 м` are all things people paste; two of the three are recoverable and the third fails with the same named message |
| Empty or incomplete | Price area renders «Вкажіть розміри» rather than a zero or a stale figure. The CTA reads «Вкажіть розміри» and scrolls to the width field on activation rather than sitting disabled (§17.20 S3's rule, applied here) |
| Both valid | Price recomputes, area renders, CTA enables |

**The bounds are physical, and the copy says so.** `customSizeMinWidthCm` / `customSizeMaxWidthCm`
are loom width; the length pair is frame length. §H3c is explicit that these are constraints and
not preferences — without them the shop sells a width that cannot be woven, and the failure
surfaces *after* payment on an order that is prepaid, non-returnable and two weeks from dispatch.
That is the worst-shaped failure this page can produce, and it is prevented by a `max` attribute
and one line of text. Naming the loom in the error message («обмеження верстата») also does
something a generic range error cannot: it tells the buyer the limit belongs to the craft rather
than to the shop's convenience.

#### The live price display

Three things render, and each prevents a specific misreading:

| Line | Purpose |
|---|---|
| **Площа — 4,32 м²** | Lets the customer sanity-check the arithmetic against dimensions they just typed. A price that appears from nowhere on a bespoke order invites the suspicion that it was set by hand for this particular buyer |
| **Ціна — 7 776 ₴** | `h2`, `tabular-nums`, same type treatment and same reserved width as a standard-variant price, so switching between a standard card and a custom size causes **zero layout shift** |
| **Мінімальна ціна виробу — 3 000 ₴**, shown *only when the floor binds* | A customer entering 60×80 sees a price that does not match the rate they could derive from a larger size, concludes the page is broken, and leaves. Naming the floor at the moment it applies converts a bug report into a policy the buyer understands: «За цих розмірів діє мінімальна ціна виробу» |

The floor line is absent whenever `raw ≥ customSizeMinPriceMinor`, because a minimum-price notice
on an order comfortably above the minimum is noise that makes the price look negotiated.

#### Accessibility of a price that moves

A live-updating price is an `aria-live` region, and a naive implementation is worse than none —
`aria-live="polite"` fired on every keystroke queues one announcement per digit and buries the
field's own label under a stack of prices.

| Rule | Detail |
|---|---|
| Region | One `role="status"` container wrapping area, price and the floor line together, so the three are announced as one coherent update rather than three |
| Timing | Announced **on blur, and on a 600 ms idle debounce while typing** — never per keystroke. The visible figure may update at the faster cadence; the announcement does not |
| Content | The full sentence, not the delta: «Площа 4,32 квадратних метра. Ціна 7 776 гривень.» A screen-reader user who hears only «7 776» has no anchor for what changed |
| Errors | The blur-time range error is announced in the field's own `aria-describedby`, not in the price region. Mixing a validation failure into a status region means it is announced politely when it needs to interrupt |
| Targets | 48 px field height, ≥8 px separation, consistent with §17.23 |
| Reduced motion | Nothing here animates in any case — the price appears, it never counts up ([13-motion-system.md](13-motion-system.md) §13.11) |

#### What is captured

Dimensions travel to the order in `OrderItem.customSpec Json?`
([25-database-schema.md](25-database-schema.md) §25.5) — `{ "widthCm": 180, "lengthCm": 240 }` —
snapshotted exactly like `nameSnapshot` and `optionsSnapshot`, for exactly the same reason: a
warranty conversation four years from now must be checkable against what was actually ordered,
and the product's rate will have changed by then. The cart line, the order summary, the
confirmation page and every transactional email render the dimensions in text, never as a silent
attribute ([18-checkout-specification.md](18-checkout-specification.md) §18.2.2).

#### Adding it to a cart that already holds a stocked line

This is the one interaction on the PDP whose consequence lands somewhere other than the line being
added, and it is specified here rather than at checkout for that exact reason.

[00-client-decisions-6.md](00-client-decisions-6.md) §J1 rules that a cart holding both a stocked
item and a custom one produces **one order, one parcel, one delivery charge, dispatched after the
fourteen-day production period** — «Надіслати разом.» An earlier round proposed splitting such a
cart into two orders so the stocked item could ship immediately; that proposal is withdrawn, and
no surface on this page, in the cart or in the API offers a split. The split bought a few days on
one line at the price of a second delivery charge for the customer and a second parcel, waybill and
packing operation for a two-person business, and at this scale that trade is not worth making.

What the ruling leaves behind is a disclosure problem, and it is a sharp one. **Pressing «ЗАМОВИТИ
ВИГОТОВЛЕННЯ» changes the terms of a line the customer added earlier.** A stocked ліжник that was
payable at the Nova Poshta counter with inspection, dispatched next working day, becomes prepaid
and dispatched in two weeks — because of a *different line* in the same cart. Nothing about the
stocked item changed; the cart it sits in did. A customer who meets that fact at the payment step,
after entering an address, a phone number and a branch, has been told it at the one moment where it
reads as a bait-and-switch.

So it is disclosed here, at the add:

| Property | Specification |
|---|---|
| **Trigger** | The add succeeds **and** the resulting cart contains at least one line without `customSpec`. Evaluated server-side on the cart response, never inferred in the browser from what the page happens to know about the cart |
| **Placement** | Inside the add-to-cart confirmation — the toast on desktop, the auto-opened drawer on mobile (§17.6.5). It is part of the success feedback, not a second interruption after it |
| **Copy** | «У кошику є виріб на індивідуальний розмір. Усе замовлення відправимо разом, коли він буде готовий — через 14 днів. Оплата — повна, наперед.» |
| **The escape, in the same place** | «Потрібен ліжник зі складу раніше? Оформіть його окремим замовленням — тоді він поїде одразу.» A plain suggestion the customer acts on by placing two orders. **Not a control.** There is no button that removes a line, creates a second order, or splits anything — the site states the trade-off and the customer decides (§J1) |
| **Announcement** | The confirmation's existing `aria-live="polite"` region carries it, appended to the standard add announcement as one utterance: «…додано в кошик. У кошику є виріб на індивідуальний розмір — усе замовлення відправимо разом, через 14 днів. Оплата повна, наперед.» A screen-reader user must hear that another line's terms just changed; a visual-only banner tells them nothing (§17.23) |
| **Not a dialogue** | The add is not blocked and no confirmation is requested. A modal asking «Ви впевнені?» on a legitimate purchase treats the buyer's decision as a mistake, and a dialogue that always fires is a dialogue that is always dismissed |
| **Persistence** | Announced once here, then standing in the cart summary and the checkout summary ([18-checkout-specification.md](18-checkout-specification.md) §18.8.7, [07-page-wireframes.md](07-page-wireframes.md) §7.6b). A customer returning to a cart three days later has forgotten the toast |
| **Reversal** | Removing the custom line restores the stocked line's own terms, cash on delivery included, on the next server-derived read. Handled in the cart, not here, but the PDP's copy must not imply the change is permanent |

**Why the three facts appear in this order — together, fourteen days, prepaid.** They are one
causal chain, and the fourteen days is the one that changes the customer's plans. A buyer who
needed the blanket for a birthday next week has learned the decisive fact first and can act on the
escape before the payment term is even relevant. Leading with «оплата повна, наперед» inverts that:
it front-loads the term that sounds like a restriction and buries the one that is actually
actionable.

**The disclosure does not appear in the buy box.** The buy box already carries three sentences
between the price and the button (above), all of them about the item being configured. A fourth
line about a *different* item would be true only sometimes, would have to appear and disappear as
the cart changes behind the page, and would push the CTA below the fold on a 390 px viewport. The
confirmation is the correct surface because it fires exactly when the condition becomes true.

#### Open — rate granularity

§H3c records one unresolved question, and it is an admin-panel question rather than a PDP one:
whether the rate is genuinely per-product or whether a per-category default would be enough. Per
product is what this page reads, because two ліжники of different density have genuinely
different costs per square metre. Inheriting a category default into the product field is a
reasonable admin convenience and belongs to
[23-admin-panel-architecture.md](23-admin-panel-architecture.md); nothing on this page changes
whichever way it lands.

---

## 17.7 Availability states

Derived from `ProductVariant.stockQty`, `lowStockAt`, `allowBackorder`, and
`Product.isUniquePiece` / `allowsCustomSize` / `madeToOrderDays`.

| # | State | Condition | Badge | CTA | Copy |
|---|---|---|---|---|---|
| 1 | In stock | `stockQty > lowStockAt` | `●` `emerald-600` | Додати в кошик | «В наявності · відправка 1–2 робочі дні» |
| 2 | Low stock | `0 < stockQty ≤ lowStockAt` | `●` `warning` | Додати в кошик | «Залишилось 2 шт» — the true number, never manufactured |
| 3 | One-of-one | `isUniquePiece` and `stockQty = 1` | `gold-100` plate, `gold-700` text | Додати в кошик | «Єдиний примірник. Виготовлено вручну, повторити точно неможливо.» |
| 4 | Made to order | «Свій розмір» selected on a product with `allowsCustomSize`; `madeToOrderDays = 14` | `warning` outline | Замовити виготовлення | «Виготовлення — 14 днів. Далі — доставка перевізником.» + the prepayment line + the returns exclusion (§17.6.6) |
| 5 | Out of stock | `stockQty = 0`, no backorder | `danger` outline | Повідомити про наявність | «Немає в наявності» |

**State 3 is the one the design must get right.** A genuinely one-of-one handmade гуня or
ліжник is the strongest asset in the catalogue and the easiest to cheapen.

- No countdown, no "3 people viewing", no manufactured scarcity.
  [02-ux-research.md](02-ux-research.md) §2.2 lists "help me buy in the next ten minutes" as an
  explicit non-job, and [13-motion-system.md](13-motion-system.md) §13.11 forbids animating
  stock indicators. The scarcity here is *real*, and real scarcity stated plainly outperforms
  theatrical scarcity in a premium register.
- The quantity stepper is hidden entirely, not capped at 1. A stepper that cannot step is noise.
- The gallery must show the actual piece, not a family shot.
- A `StockReservation` is created at add-to-cart for unique pieces only — see
  [18-checkout-specification.md](18-checkout-specification.md) §18.14.

**State 4 is no longer a form, and that is the round-4/5 change.** The earlier design routed
custom sizing through a «Замовити свій розмір» link that wrote a `Lead` and waited for a human.
[00-client-decisions-5.md](00-client-decisions-5.md) §H3b and §H3c replace it: the size selector
carries the option, the buy box computes the price, and the order is placed and prepaid in the
same session. §17.6.6 specifies the mode in full. The `Lead` path survives only for requests this
mechanism genuinely cannot price — a non-rectangular piece, a colour not offered, a
private-label enquiry — and those keep `kind = PRIVATE_LABEL`.

Three facts are stated **above** the CTA, never below it and never behind a tab
([00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 2):

1. **«Виготовлення — 14 днів. Далі — доставка перевізником.»** The fourteen days is production
   time before dispatch, not total delivery time. Any copy that implies "14 days to your door" is
   wrong and generates a complaint on day fifteen — §G2 rule 1 names this specifically, and it is
   the single most likely copy error on this page.
2. **The prepayment requirement, with its reason.** «Виріб шиється за вашими розмірами, тому
   оплата — повна, наперед. Наложений платіж недоступний.» The reason is not optional
   ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.1).
3. **The returns exclusion** (§17.13), because a fourteen-day prepaid non-returnable purchase has
   three terms and a buyer who learns the third one during a return attempt is right to be angry.

Enforcement of the payment restriction is **server-side** and belongs to the cart, not to this
page: available methods are derived from cart contents
([18-checkout-specification.md](18-checkout-specification.md) §18.8.7). The PDP's job is
disclosure, and a PDP that merely hides the COD option would leave the restriction discoverable
by anyone who submits a crafted request.

**State 5 — notify-me.** A single email field, submit, and an explicit consent checkbox
(double opt-in is required for `de`, [25-database-schema.md](25-database-schema.md) §25.9). It
captures `variantId`, not `productId`, so someone waiting on 200×220 is not emailed when
150×200 restocks. Confirmation is inline, not a redirect.

---

## 17.8 Sticky purchase panel and mobile bottom bar

**Desktop.** The buy box becomes `position: sticky; top: calc(header + space-6)` once its
natural position scrolls past, and un-sticks when reviews reach the viewport top — reviews are
a reading surface and a purchase panel hovering beside a complaint is a poor look.

```
Full (at rest)            Condensed (sticky, after 600 px)
─────────────────         ──────────────────────────────
Overline                  ┌──────────────────────────┐
Name h1                   │ ▣  Ліжник «Черемош»      │
Origin mark               │    150×200 · сірий       │
Rating                    │    6 900 ₴               │
Price                     │  ┌────────────────────┐  │
Size grid                 │  │  ДОДАТИ В КОШИК    │  │
Colour swatches           │  └────────────────────┘  │
Availability              └──────────────────────────┘
Quantity                  72 px thumbnail + resolved
Add to cart               selection + price + CTA
Trust row
```

`z-sticky` (100) — below the header, above content
([11-spacing-system.md](11-spacing-system.md) §11.6). Full→condensed is a cross-fade at
`dur-base`; the panel never animates height, because height cannot be composited
([13-motion-system.md](13-motion-system.md) §13.5).

**Mobile.** A fixed bottom bar present from the first pixel of scroll — not revealed on
scroll-up, not hidden on scroll-down. Reveal-on-scroll bars are a documented frustration for
users with reduced motor precision, who trigger and lose them accidentally.

| Property | Value |
|---|---|
| Height | 72 px + `env(safe-area-inset-bottom)` |
| Surface | `--bg-surface`, 1 px `--border-hairline` top edge, `shadow-md` |
| Content | Resolved price (left, `tabular-nums`) · CTA (centre, min 180 px) · wishlist (right, 48×48) |
| Before selection | CTA reads «Обрати розмір» and scrolls to + focuses the size grid rather than being disabled |
| One-of-one | `gold-600` hairline above the bar |
| Out of stock | CTA becomes secondary-style «Повідомити про наявність» |
| Page | `padding-bottom` equal to the bar height so the footer is never obscured |

---

## 17.9 The specification table

Sourced from `ProductAttributeValue` joined to `AttributeDefinition`
([25-database-schema.md](25-database-schema.md) §25.3), ordered by
`AttributeDefinition.position`, with `unit` appended and labels from
`AttributeDefinitionTranslation`. Detailed composition and care instructions are mandatory
per-product capabilities ([00-client-decisions.md](00-client-decisions.md) D4), so this table
is never optional and never empty.

**It is open by default and never inside a tab strip.** This follows from
[02-ux-research.md](02-ux-research.md) §2.4 — anxieties A1 and A2 are answered here and must be
answerable without opening anything — and from [01-brand-strategy.md](01-brand-strategy.md)
§1.4, where the *Grounded* trait carries the explicit build consequence "specifications are
surfaced early on the PDP, not buried in a tab".

Rendered as a `<dl>` definition grid, which reads correctly in a screen reader as label/value
pairs, not as a one-row `<table>`.

```
ХАРАКТЕРИСТИКИ                                          h3

Склад                100% овеча вовна
Щільність            1 400 г/м²
Тонина волокна       28 мкм  ·  щільна, для ковдр і килимів
Вага виробу          2 100 г
Розмір               150 × 200 см
Плетіння             Ручне ткацтво, двобічне
Походження вовни     {{WOOL_SOURCE}}
Догляд               Ручне прання 30 °C  ·  не віджимати
                                                    Показати всі (11) ▾
```

Two details carry disproportionate weight:

1. **Micron gets a plain-language gloss.** `28 мкм` alone is meaningless;
   [02-ux-research.md](02-ux-research.md) §2.4 rates anxiety A2's answer only "medium" strength
   precisely for this reason. The band is **derived, not authored** — ≤19 «дуже м'яка, можна на
   тіло», 20–25 «м'яка», 26–32 «щільна, для ковдр і килимів», >32 «груба, для килимів і
   чохлів». Derivation prevents an editor writing «надзвичайно м'яка» on a 34-micron product.
2. **First 8 rows show, the rest collapse**, with the hidden count stated. Eight is what fits
   one mobile screen without scrolling past the section heading.

Filterable attributes (`isFilterable`) render as links back to the category page pre-filtered
on that value. This is genuine internal linking — which matters more than usual on a cold-start
domain with no external links to distribute authority (D2, consequence 2).

---

## 17.10 Provenance and origin

### 17.10.1 The provenance block — own manufacture

[01-brand-strategy.md](01-brand-strategy.md) §1.8 ranks photographed process with dates and
locations as rank-3 evidence, and §1.10 sets a measurable target: **PDP scroll depth to the
origin block >55%.** That target is why this block sits immediately after the specification
table and before care, delivery, merchandising and reviews.

```
┌───────────────────────────────────────────────────────────────────────────┐
│  --bg-alt, container-full, --section-y-md                                 │
│                                                                           │
│  ┌──────────────────────────┐   ПОХОДЖЕННЯ           overline, gold-700   │
│  │                          │   Зіткано в Яворові    display-md           │
│  │   MediaRole.PRODUCTION   │   селі, яке називають                       │
│  │   this stage, this       │   столицею ліжникарства  caption            │
│  │   workshop, named person │                                             │
│  │                          │   Вовна: {{WOOL_SOURCE}}                    │
│  │   caption: імʼя, рік     │   Тонина: 28 мкм                            │
│  └──────────────────────────┘                                             │
│                                 Етапи на власному виробництві:            │
│                                 ① Прання ② Сушіння ③ Чесання              │
│                                 ④ Прядіння ⑤ Фарбування                   │
│                                 ⑥ Ткацтво ⑦ Оздоблення                    │
│                                                                           │
│                                 вул. Петруші, с. Яворів,                  │
│                                 Косівський район, Івано-Франківська обл.  │
│                                 Виробляємо понад 30 років                 │
│                                                                           │
│                                 Магазин і виробництво в одному місці.     │
│                                 Цех можна оглянути — разом із власником.  │
│                                 Зателефонуйте заздалегідь, щоб домовитися │
│                                 про час: +38 067 997 34 50 (Іван)         │
│                                 Як приїхати →             link, --text-sm │
│                                                                           │
│                                 [ Подивитися виробництво → ]  secondary   │
└───────────────────────────────────────────────────────────────────────────┘
```

| Element | Field |
|---|---|
| Wool origin | `Product.woolOrigin` |
| Fibre diameter | `Product.woolMicron` |
| Stage list | `Product.productionStage[]`, an ordered array of stage keys |
| Photograph | First `ProductMedia` with `role = PRODUCTION`, falling back to the category `MediaAlbum` cover |
| Location | `Setting` key `factory.location`, never hardcoded per product |

**Naming Yavoriv is the single highest-value sentence on this page.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E2 resolves the location as **вул.
Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644** — and Яворів is not an
address detail, it is a category credential. Thousands of listings say «карпатський»; the word
is free and therefore worth nothing. Яворів is the recognised centre of Hutsul lizhnyk weaving,
«столиця ліжникарства», with a dedicated Музей ліжникарства and annual weaving plein airs. In
this category the village name does the work an appellation does in wine: it is specific,
checkable, and cannot be borrowed by a reseller.

So the block leads with «Зіткано в Яворові», not «Зіткано в Карпатах», and the region is a
subordinate line. [01-brand-strategy.md](01-brand-strategy.md) §1.4 already demands specificity
of place over generic national symbolism; this is the specific place. The same string appears in
the trust row (§17.14), the breadcrumb-adjacent metadata, and `LocalBusiness`/`Product`
structured data (§17.21) so that NAP is byte-identical across the site and the Google Business
Profile (§E4).

**This does not extend to the tagline, and the distinction is deliberate.**
[00-client-decisions-3.md](00-client-decisions-3.md) F6 confirms the approved headline copy
«Понад 30 років виробляємо натуральні вовняні вироби **в Карпатах**» and withdraws the proposal
to substitute «у Яворові» there. A tagline is read by someone who has just arrived and has no
context; «Карпати» is understood instantly by every audience including the `en`/`pl`/`de`
buyers, while «Яворів» is a proper noun the reader may have to be taught. A headline is not the
place to teach one. The provenance block is — the reader has scrolled past the price to get
here, which is precisely the moment specificity pays. Яворів therefore holds this block, the
address, the trust row, the structured data and any meta title serving a specific query;
«Карпати» holds the headline. **«Карпати» to be understood, «Яворів» to be believed.**

**The address is also a shop, and the workshop itself can be walked through.** F2 confirms retail
and production share the Яворів site, and [00-client-decisions-4.md](00-client-decisions-4.md)
§G3 goes materially further: «Так, відвідувачі можуть оглянути цех з Власником.» A factory the
buyer can only read about is a claim; a factory with a door is evidence; a factory whose owner
will walk you through it is the strongest evidence available to this project at any price. §G3
places it above every item in the [01-brand-strategy.md](01-brand-strategy.md) §1.8 evidence
hierarchy, including the video of the factory that previously held rank 1 — a visitor can stand
in the room.

**Three constraints come attached, and all three are copy constraints.**

| Constraint | Why | Consequence for this block |
|---|---|---|
| It depends on Іван being present | The hours are genuinely variable (§E3) and the tour is his personal time | «Зателефонуйте заздалегідь, щоб домовитися про час» — arranged in advance, **never** presented as drop-in |
| It is a conversation, not a tour route | Nothing is scripted and nothing is guaranteed to be running on the day | Copy says what a visitor will see and be told. It never promises a demonstration or that weaving will be in progress |
| It cannot scale | Two people run a factory | It is an invitation, never a product. No fixed times, no "open to the public", no implication of unlimited availability |

**No booking widget, at any breakpoint.** §G3 rules this out directly and the reasoning is worth
restating because a calendar is the obvious thing to build: a booking control implies capacity
that does not exist, and it manufactures no-shows that nobody in a two-person business will
chase. A phone number and «Зателефонуйте, щоб домовитися» is the correct instrument at this
scale. The number is **Іван's** — `+380679973450` — because he is both the primary line
([00-client-decisions-4.md](00-client-decisions-4.md) §G1) and the person the visit is with.
Любов's number does not appear in this block; a fallback number for a visit that only one person
can host would send callers to someone who cannot agree to it.

**What must not be claimed.** Over-promising access and then being unavailable converts the
project's strongest asset into a one-star review, and the downside is larger than the upside. The
block therefore never prints hours, never names a day, and never uses «завжди» or «будь-коли».

The same evidence is monetised three more times: as a pickup option in §17.12.1, as a trust-row
item in §17.14, and as the closing argument of the production page
([20-production-page-specification.md](20-production-page-specification.md)).

**One heritage caution.** §E2 requires the exact status of any intangible-cultural-heritage
reference to be confirmed before publication, and forbids any wording implying that *Вівчарик*
holds a designation. The craft may be listed; a company is not. Until confirmed, the block says
«столиця ліжникарства» — a widely used descriptive epithet — and nothing about registers.

**Stages are shown as performed *and* not performed.** The filled/hollow distinction is the
point of the control, and §E6 now resolves every stage to filled: the client confirms Вівчарик
runs the whole process from raw material to finished goods, dyeing included. The hollow state is
retained rather than deleted, because it is what keeps the claim checkable — if a stage is ever
outsourced the block must be able to say so without a redesign, and a component that can only
render success is a component that will eventually render a lie.

Two constraints follow directly from claiming seven of seven. First, per §E6 the production page
must carry photographs of **the actual stages claimed**, tanning included; a stage that cannot
be photographed must not be asserted, which is why §17.5.1 routes all `PRODUCTION` media to the
Yavoriv shoot. Second, the **«бельгійська технологія» framing is removed everywhere** — it
belonged to the adjacent business, it is not Вівчарик's claim to make, and an inherited
borrowed-technology line sitting inside a full-cycle provenance block is precisely the kind of
detail a competitor checks first.

Each stage chip deep-links to the matching production-page section. That link is the mechanism
behind the §1.10 metric "homepage → production or about page entry rate >18%": the PDP is the
largest single traffic source into the provenance content.

**The age claim is rendered as «Виробляємо понад 30 років» and nothing else.** Per
[00-client-decisions.md](00-client-decisions.md) D1 the claim attaches to the manufacturing,
not to a legal entity; this block may not render «засновано 1992», may not show a certificate,
an award mark, or an anniversary seal, and `{{FOUNDING_YEAR}}` never reaches structured data.
With no documentation behind the claim, the substantiation is rank-1 evidence — film the
thirty-year-old machines — not paperwork.

### 17.10.2 The origin mark — own manufacture versus partner

[00-client-decisions.md](00-client-decisions.md) D3 introduces `ProductOrigin` with
`partnerName` and `partnerRegion`. An undifferentiated resale category destroys the §1.2
positioning the moment a customer notices — and wholesale buyers, the most commercially valuable
audience, notice first.

**The partner cannot be named.** [00-client-decisions-2.md](00-client-decisions-2.md) §E7
answers the question directly: «Ні.» `Product.partnerName` **stays null and is never rendered on
any surface** — not the mark, not the specification block, not the cart line, not structured
data, not the order confirmation. The design that relied on naming the partner to convert
disclosure into a curation credential is withdrawn, and what replaces it must carry the
disclosure without the credential.

The handling remains **confident labelling, never a disclaimer.** A disclaimer is what a
business writes when it hopes nobody reads it. A label is what a business writes when the fact
is part of the offer.

| | `OWN_MANUFACTURE` | `PARTNER_MANUFACTURE` |
|---|---|---|
| Mark position | Directly under the `h1`, above the price | Identical position — same prominence, deliberately |
| Mark copy, line 1 | «✋ Власне виробництво» | «Відібрано Вівчариком» |
| Mark copy, line 2 | — | «Виготовлено карпатським майстром» where `partnerRegion` is set; «Виготовлено іншим виробником» where it is null |
| `partnerRegion` | — | Rendered as the region alone — «Косівщина», «Гуцульщина». Regional provenance without a company name is still meaningful and still true |
| `partnerName` | — | **Never rendered.** Null in the database, absent from every template (§E7) |
| Mark styling | `gold-700` text on `gold-100`, `radius-sm` | `--text-muted` on `--bg-alt`, same geometry and same footprint. Visually quieter, never visually smaller |
| §17.10.1 provenance block | Full — `woolOrigin`, `woolMicron`, `productionStage[]`, production photography | **Not rendered.** Replaced by §17.10.3 |
| `MediaRole.PRODUCTION` | Permitted | **Forbidden.** Showing the Yavoriv workshop beside a partner's product is the exact deception the labelling exists to prevent |
| Gallery requirement | Full role set | `PRIMARY` + `LIFESTYLE` + `DETAIL`; no production imagery |
| Structured data | `brand` **and** `manufacturer` both Вівчарик | `brand` Вівчарик; `manufacturer` **omitted entirely**, never set to Вівчарик (F3). §17.21.3 |
| Product title convention | `{name}` — the brand is implicit sitewide | Identical. Partner goods carry the Вівчарик name (F3), so no title suffix distinguishes them and **the origin mark is the only disclosure surface** |
| Filter facet | «Власне виробництво» | «Партнерські вироби» |
| Homepage, hero, best-seller rails, production storytelling | Eligible | **Never appears** (D3 rule 5) |
| Relation blocks | May cross-sell partner products | May cross-sell own manufacture — and should, since it is an upgrade path |

**The equal-visual-weight rule is not softened by the loss of the partner's name — it is
strengthened by it.** Losing the ability to say who made the item is a reason to be *more*
explicit that Вівчарик did not, not less. The mark keeps the same position, the same type size
and the same footprint as «Власне виробництво»; only its colour temperature is quieter. Anything
that shrinks it converts an honest label into a technicality, and the origin facet stays pinned
at the top of the filter panel ([01-brand-strategy.md](01-brand-strategy.md) §1.7b).

**And branding the goods raises the stakes again, in the same direction.**
[00-client-decisions-3.md](00-client-decisions-3.md) F3 confirms partner items are sold under the
Вівчарик name. That is ordinary retail practice and entirely legitimate, but it removes the last
passive signal a buyer could have used to tell the two apart: the label on the object now says
Вівчарик whatever its origin, and [01-brand-strategy.md](01-brand-strategy.md) §1.2 positions
that name on *verified origin*. Every rule in the table above therefore hardens rather than
relaxes:

| Rule | Status after F3 |
|---|---|
| Equal visual weight for «Відібрано Вівчариком» | **Reaffirmed.** It is now the *only* place a buyer learns the distinction |
| Origin facet pinned first in the filter panel | **Reaffirmed.** The facet is the catalogue-level equivalent of the mark |
| Partner goods excluded from homepage, hero, production storytelling, best-seller rails | **Reaffirmed.** The brand surfaces make the manufacturing claim; the catalogue carries the breadth (D3 rule 5) |
| `MediaRole.PRODUCTION` forbidden on partner goods | **Reaffirmed.** A branded partner product photographed in the Yavoriv workshop is the exact deception the label exists to prevent |
| `manufacturer` omitted in structured data | **Reaffirmed**, and now the only machine-readable trace of the distinction |

A customer who discovers the distinction themselves feels misled; a customer who was told
plainly feels informed. The label is the entire difference between those two outcomes, and
putting the brand name on the goods makes it matter more, not less.

**Why «Відібрано Вівчариком» still does useful work.** Selection is itself a claim about
judgement, and judgement is part of what a premium buyer pays for — a producer that also curates
reads as an authority in the category rather than a shop. Naming the partner would have made
that claim verifiable and therefore stronger; unnamed, it rests on the brand's credibility
alone. That is a real loss, and the correct response is to be conspicuously honest about the
part that *can* be verified: the region, the material, and the fact that this one is not ours.

**Resolved — `brand` for partner goods.** The question §E7 left open is answered by
[00-client-decisions-3.md](00-client-decisions-3.md) F3: «Так, продаються під брендом Вівчарик.»
Partner items carry the Вівчарик brand. The consequences are exactly the two anticipated above —
the product title convention needs no partner variant, and the origin mark is doing all of the
disclosure work alone. The structured-data rule that follows from it is stated once, in
§17.21.3, and implemented once, in the product serialiser
([26-api-architecture.md](26-api-architecture.md) §26.10.1).

### 17.10.3 The partner specification block

Partner products replace the provenance block with a shorter, factual section that makes no
in-house production claim:

```
ПРО ВИРОБНИКА

Відібрано Вівчариком
Виготовлено карпатським майстром · Косівщина      ← partnerRegion, where known
Матеріал:  100% овеча вовна
Ми відібрали цей виріб за щільністю плетіння та якістю вовни.

Власне виробництво Вівчарика  →      link to the own-manufacture facet
```

Where `partnerRegion` is null the second line reads «Виготовлено іншим виробником» and the
region is simply absent — not replaced by «Карпати», which would be an invented fact, and not
omitted entirely, which would leave the block claiming nothing about who made the object.

The block makes **no in-house production claim of any kind**: no `productionStage[]`, no
`woolOrigin`, no thirty-year line, no Yavoriv, and no invitation to visit the shop — F2's
«магазин і виробництво в одному місці» line belongs to §17.10.1 and must not appear beside a
product that was made somewhere else.

Everything the block states is either a property of the object or a statement about Вівчарик's
own act of selection. That boundary is what makes the brand name on the item survivable: the
goods carry «Вівчарик» because Вівчарик sells them ([00-client-decisions-3.md](00-client-decisions-3.md)
F3), and this block is where the page says what that does and does not mean. «Відібрано» is a
claim about judgement; «виготовлено» is a claim about hands, and only one of them is made here.

The closing link is deliberate. A buyer who cares about origin enough to read this block is
exactly the buyer who should be shown the own-manufacture range, and routing them there turns
the weakest page on the site into a path to the strongest. `partner_to_own_click` (§17.24)
measures whether it works, and that measurement matters more now that the block can no longer
offer a partner's name as a consolation.

---

## 17.11 Care guide

```
ДОГЛЯД

  ⌾            ≋             ☀
Ручне       Не віджимати   Сушити
прання      і не сушити    горизонтально
30 °C       в машині       в тіні

Повний посібник з догляду за вовною →
```

Care content is per **family**, not per SKU, resolved from a `ProductAttributeValue` of
`dataType = ENUM` pointing at a shared care profile. Authoring care text per product guarantees
divergence within a month.

The care guide is **new content written for launch**, not an inherited page:
[00-client-decisions-2.md](00-client-decisions-2.md) §E5 permits photographs to be reused but
explicitly forbids copying the adjacent business's blog and care articles, because that site
stays online and duplicate text on a zero-authority domain loses the ranking contest every time.
That is a cost, but it is also the single best-aligned asset for the cold-start
SEO position: long-tail informational content is the realistic early organic entry point, and
"як прати вовняний ліжник" is exactly the kind of query a new domain can win while commercial
head terms remain out of reach for a year.

Care sits below provenance because care is post-purchase reassurance while provenance is a
purchase argument. An undecided buyer does not need washing instructions; a decided one will
scroll for them.

---

## 17.12 Delivery and payment

### 17.12.1 Delivery estimator

```
ДОСТАВКА                                    open by default, never a tab

  Нова Пошта, відділення   {{NP_BRANCH_PRICE}}     1–3 дні
  Нова Пошта, курʼєр      {{NP_COURIER_PRICE}}     1–3 дні
  Укрпошта, відділення    {{UKRPOSHTA_PRICE}}      3–7 днів
  Забрати в Яворові            безкоштовно         готово за 1 день
    Магазин і виробництво в одному місці. Цех можна оглянути
    з власником — зателефонуйте заздалегідь →

  ── якщо обрано «Свій розмір» ───────────────────────────────────
  Виготовлення — 14 днів. Далі — доставка перевізником:
  до строку доставки додається транзит, обраний вище.

  ⓘ Безкоштовна доставка від {{FREE_SHIPPING_THRESHOLD}} при повній передоплаті
     (тільки в межах України)

  Ваше місто            [ Косів        ⌕ ]      optional refinement

  ── en / pl / de ────────────────────────────────────────────────
  Міжнародна доставка   вартість розраховуємо індивідуально
  Відправляємо Новою поштою, Укрпоштою та іншими перевізниками —
  вартість залежить від країни та ваги. Ви оформлюєте замовлення,
  ми надсилаємо рахунок з доставкою, і тільки тоді ви оплачуєте.

  ⚠ Ціна не включає митні збори та податки країни призначення.
     Їх сплачує отримувач при отриманні. Сума залежить від країни
     та вартості замовлення.
```

| Decision | Choice | Why |
|---|---|---|
| Show all or estimate one? | **All four, always** | The question is "what are my options and what do they cost", not "what is cheapest". A single estimate forces a checkout visit to discover the rest, and A4 must be answerable here |
| Price precision | «від X ₴» | Carrier rates depend on declared value and dimensions. A precise figure that changes at checkout destroys more trust than an honest "from" |
| City input | Optional, collapsed, remembered in `localStorage` | Requiring a city before showing any price turns an answer into a form |
| Free-shipping threshold | An informational line, **not** a progress bar, and explicitly marked domestic-only | At the threshold currently indicated against a mid-five-figure order value, a bar showing 22% discourages rather than motivates. The threshold itself is `{{FREE_SHIPPING_THRESHOLD}}` and is worth re-modelling before launch. The «тільки в межах України» qualifier ships from day one: free shipping never applies internationally at any cart value ([00-client-decisions-3.md](00-client-decisions-3.md) F4) |
| Pickup row | «Забрати в Яворові», with a two-line invitation naming the workshop tour and a link to the contact page | [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms retail and production share the address and [00-client-decisions-4.md](00-client-decisions-4.md) §G3 confirms the workshop itself can be walked through with Іван. This row is therefore not a cost-saving fallback — it is the only delivery option that also answers job 2, and after §G3 it is the strongest such answer on the page. Wording it as a logistics line wastes it. The invitation carries «зателефонуйте заздалегідь» in the same breath, because an unarranged visit is the one way this asset turns into a bad review |
| Made-to-order | **Two numbers, named as two things, never summed into one** | «Виготовлення — 14 днів. Далі — доставка перевізником.» [00-client-decisions-4.md](00-client-decisions-4.md) §G2 rule 1 rules that the fourteen days is production time before dispatch and that carrier transit is added on top. Printing a single combined figure — «17 днів до дверей» — is the error that generates a complaint on day fifteen, because the combined number is a promise about a carrier this business does not control. The estimator shows the production line and the transit line adjacently and lets the buyer add them |
| By-weight products | The estimate uses purchased weight directly | Shipping weight *is* the ordered quantity for пряжа and ровниця, which makes the estimate more accurate here than anywhere else in the catalogue |
| International | **No price is shown at all.** The row states the quoted-per-order model and the customs position | §E11 makes `en`/`pl`/`de` transactional and [00-client-decisions-3.md](00-client-decisions-3.md) F4 resolves the carrier question as *multiple, chosen per order* — which means there is no rate to display and inventing one is a liability, not a convenience. The row's job is to set the expectation that a quote follows, so the enquiry-then-invoice flow at checkout ([18](18-checkout-specification.md) §18.23.7) reads as the stated process rather than as a stall |
| Customs copy | Shown on the PDP, not only at checkout, and never in a collapsed accordion | A duty demanded by a courier after delivery, on a purchase whose page never mentioned duty, is the single most damaging post-purchase surprise available in cross-border retail. F4 makes the buyer liable for duties and import taxes — effectively **DAP** — so the sentence has to be visible before the buyer forms a price expectation, not only before they pay |

**Every rate on this page is a token, deliberately.**
[00-client-decisions-2.md](00-client-decisions-2.md) leaves delivery tariffs and the
free-shipping threshold unresolved, and the 80 / 100 / 55 UAH figures and the threshold observed
in [00-existing-site-audit.md](00-existing-site-audit.md) §0.6 belong to the **adjacent
business** and carry no authority for Вівчарик. They are not defaults and must not be shipped as
placeholders that happen to look like prices. `{{NP_BRANCH_PRICE}}`, `{{NP_COURIER_PRICE}}`,
`{{UKRPOSHTA_PRICE}}` and `{{FREE_SHIPPING_THRESHOLD}}` resolve from `Setting` keys — the same
keys the checkout and the homepage trust row read
([06-homepage-wireframe.md](06-homepage-wireframe.md) §S4) — so a tariff change cannot leave one
surface quoting a stale figure. The `{{TOKEN}}` CI scan blocks a build that reaches production
with any of them unresolved.

**The international row is no longer blocked — it is resolved, and the resolution is that there
is no number.** [00-client-decisions-3.md](00-client-decisions-3.md) F4 answers §E11 directly:
the business ships «Новою поштою, Укрпоштою та різними перевізниками», domestically and
internationally, with the carrier chosen per order and **the buyer paying everything** —
shipping, customs duties and import taxes alike. `{{INTL_CARRIER}}` therefore resolves to
*multiple, quoted per order* rather than to a single default, and the token stops being a
blocker on this row because there is nothing left to fill in. The row shows a process, not a
tariff.

That is a better outcome than the flat-rate table it replaces. A published flat rate guesses
wrong in both directions — it overcharges Poland and loses money on Canada — and the loss on a
heavy ліжник shipped to a distant destination is unbounded. Quoting per order is slower and
honest, and it matches how the business already operates.

**The customs line ships from day one and is not a footnote.** F4 puts duties and import taxes
on the buyer — effectively DAP, delivered duties unpaid. That is normal and acceptable;
discovering it at the door is not. The estimator carries the sentence at full weight, in the
locale's own language, properly localised rather than machine-translated, and it is repeated as
a **blocking pre-payment element** at checkout ([18](18-checkout-specification.md) §18.23.3).
Two placements are not redundancy: the PDP placement shapes the price expectation, the checkout
placement discharges the obligation.

Delivery dates are computed against the published working calendar including the
December/January closures: an order placed at 20:00 on 23 December must not promise dispatch on
24 December. For a custom-size line the computation starts from dispatch, not from the order
date: `expectedDispatchAt = nextWorkingDay(placedAt + 14 days)`, and the transit window is added
after it rather than folded into it.

Opening hours are **not** hard-coded — §E3 records that the workshop's hours are genuinely
variable — so the pickup row states «готово за 1 день» and defers exact hours to the contact page
and the Google Business Profile. The invitation lines beneath it («магазин і виробництво в одному
місці», «цех можна оглянути з власником») are statements of fact from F2 and §G3 and carry no
schedule, which is exactly what lets them be published against variable hours at all. The moment
either line acquires a time, it becomes wrong twice a week.

### 17.12.2 Payment methods, on the PDP

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.2 rules that the payment position is
stated **plainly on the PDP and at checkout, not buried in a policy page**. The reasoning is
specific to this business rather than general good practice: for a buyer spending 5,000–15,000
UAH with a brand that has no reviews, no history and no social presence, the ability to open the
parcel at the Nova Poshta counter before paying removes the single largest objection a cold-start
domain faces. Leaving that fact to a policy page is leaving the strongest sales argument on the
page unspoken.

```
ОПЛАТА                                      open by default, never a tab

  💳 Картка онлайн
     Visa / Mastercard через WayForPay. Усі товари, усі країни.

  📦 Наложений платіж з оглядом                     тільки по Україні
     Оглядаєте виріб на відділенні Нової пошти або Укрпошти
     і лише потім платите.
     Доступно для товарів у наявності.
     Як це працює та скільки коштує доставка →   link → checkout §18.8.5a

  ── якщо обрано «Свій розмір» ───────────────────────────────────
  💳 Тільки картка онлайн, повна передоплата.
     Виріб шиється за вашими розмірами, тому оплата — повна, наперед.
```

| Method | Scope | PDP treatment |
|---|---|---|
| Online card (WayForPay) | All products, all destinations | Listed first. The only method outside Ukraine |
| **Наложений платіж з оглядом** | **Ukraine only, stocked items only** | Listed second, with the inspection right as the headline of the row rather than as a footnote to it |
| Custom size («Свій розмір») | Card only, full prepayment | The COD row is **replaced** by the prepayment line, not greyed out. A disabled row invites the question "why not me?" where a replaced row answers it |

**Three rules govern this block.**

1. **The inspection right leads.** The row's first line is what the buyer gets — «оглядаєте виріб
   і лише потім платите» — not the method's name. «Накладений платіж» is a logistics term; the
   inspection is the offer.
2. **The return-shipping deposit is named here but explained at checkout.** §H1.3's mechanic —
   the buyer pays both shipping legs online and the return leg is credited against the goods on
   acceptance — requires three real numbers to be comprehensible, and two of them (forward
   shipping, return deposit) depend on a destination the PDP does not know. Attempting it here
   with tokens produces exactly the misreading §H1.3 warns about: "pay extra for permission to
   look at the goods". The PDP therefore carries a link, and the worked example lives where the
   numbers do ([18-checkout-specification.md](18-checkout-specification.md) §18.8.5a). This is a
   deliberate exception to the general rule that the PDP answers A4/A5 without a click — an
   honest deferral to a page with the figures beats a confident explanation without them.
3. **Nothing here is enforcement.** The PDP describes; the cart decides. Available methods are
   derived server-side from cart contents
   ([18-checkout-specification.md](18-checkout-specification.md) §18.8.7), so a mismatch between
   this block and the checkout is a content bug, never a security one.

---

## 17.13 Warranty and returns

```
ПОВЕРНЕННЯ ТА ГАРАНТІЯ

  14 днів на повернення
  Товар має бути в первісному стані, з бирками.
  Зворотну доставку оплачує покупець, окрім підтвердженого браку.

  Вироби на індивідуальний розмір
  Виготовлені за вашими розмірами поверненню не підлягають,
  окрім браку. Оплата — повна, наперед. Виготовлення — 14 днів.

  Умови повернення →        Оформити повернення →
```

Stated without hedging ([01-brand-strategy.md](01-brand-strategy.md) §1.8 rank 6). Two things
are deliberately not softened:

- **The buyer pays return shipping.** Omitting it so it surfaces only during a return converts
  a policy into an ambush, and an ambushed customer writes the review that costs ten sales — a
  cost that is proportionally far higher on a store with no review volume to absorb it.
- **Custom items are excluded, and the exclusion travels with them.** Made-to-order is now a
  self-service offer that a buyer can configure and prepay in one session (§17.6.6), which makes
  the exclusion a live term rather than a policy footnote. It is restated in three places — the
  buy box above the CTA, this block, and the cart line
  ([18-checkout-specification.md](18-checkout-specification.md) §18.2.2) — because the buyer is
  accepting three terms at once (fourteen days, full prepayment, no return) and each one is
  individually surprising.

**Одна важлива відмінність: «наложений платіж з оглядом» не є поверненням.** The inspection right
at the branch ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.2) lets a buyer decline a
parcel **before** paying for the goods, which is a separate and earlier mechanism than the 14-day
return window. The two must not be conflated in copy: a buyer who believes refusing at the counter
is "a return" will expect the return-shipping rule to apply to it, and under §H1.3 the return leg
on such an order is already funded at checkout and nothing further is owed. §17.12.2 states the
inspection right; this block states the return policy; neither borrows the other's wording.

No warranty language may imply certification or accreditation
([00-client-decisions.md](00-client-decisions.md) D1). «Гарантія якості» as a badge is
forbidden; a stated returns window and a named defect process are the honest equivalents.

**`de` and `pl` render a different block, because they are governed by a different law.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E11 makes those locales transactional,
which triggers the EU **14-day right of withdrawal** — a statutory right, not a merchant policy,
and one that differs from the Ukrainian block in three ways the copy must reflect:

| | `uk` / `en` | `de` / `pl` |
|---|---|---|
| Framing | «14 днів на повернення» — a policy the seller grants | *Widerrufsrecht* / *prawo odstąpienia* — a right the buyer holds |
| Clock | From receipt | From receipt, with the statutory information duty satisfied *before* the order is placed |
| Mechanism | Returns form | The **model withdrawal form** must be available and linkable from this block, not only from the legal page set |
| Custom goods | Excluded | Excluded under the made-to-specification exemption — but the exemption must be stated in the statutory terms, not merely asserted here |

The withdrawal notice and the model form live in the legal page set
([04-sitemap.md](04-sitemap.md)); this block links to them and restates the period. Presenting a
statutory right as a generous merchant gesture is a compliance failure in `de` and reads as one
to a German buyer, so the wording is drawn from the legal text rather than translated from the
Ukrainian marketing copy.

---

## 17.14 The trust row

Five items, in the buy box on desktop and beneath the quantity control on mobile.
[01-brand-strategy.md](01-brand-strategy.md) §1.8 ranks badges **last**, so this row is
deliberately small and factual — the gallery and the provenance block are the page's trust
strategy, not this.

| Item | Text | Source | Why this one |
|---|---|---|---|
| Origin | «Яворів, Косівський район» | `Setting` `factory.location` | Specificity is the trust signal ([01-brand-strategy.md](01-brand-strategy.md) §1.4, *Rooted*), and Яворів is the specific claim that «Карпати» is not (§E2). The headline still says «в Карпатах» ([00-client-decisions-3.md](00-client-decisions-3.md) F6); this row is where the specific name belongs |
| **Visitable workshop** | «Цех можна оглянути з власником» | `Setting` `factory.location`, links to the contact page | **Strengthened in round 4 and now the most valuable item in the row.** F2 confirmed retail and production share the Яворів site; [00-client-decisions-4.md](00-client-decisions-4.md) §G3 confirms a visitor may walk the workshop **with Іван**. This is the only item in the row that is falsifiable by the reader — falsifiability is what separates a trust signal from a badge — and it is the most direct available answer to A1/A3, *is this a real factory or a reseller*. Rendered **only on `OWN_MANUFACTURE`**, for the reason in §17.10.3 |
| Returns | «14 днів на повернення» | `{{RETURN_DAYS}}` | Answers A5 at the point of decision. `de`/`pl` render the statutory wording per §17.13 |
| Delivery | «Нова Пошта {{NP_BRANCH_PRICE}}» | `Setting`, unresolved | Answers A4 at the point of decision |
| Craft | «Виробляємо понад 30 років» | `{{YEARS_EXPERIENCE}}` | Rendered **only on `OWN_MANUFACTURE` products.** On a partner product the row shows «Ручна робота» or is omitted — the thirty-year claim is about this factory and must not be borrowed to sell someone else's goods |

**The visitable-workshop item is a link, not a badge, and it links to the contact page rather
than to a booking control.** [00-client-decisions-4.md](00-client-decisions-4.md) §G3 forbids a
calendar widget at every breakpoint, and the trust row is where one would most plausibly be
added — an item that says «можна оглянути» invites a "book now" button. The reason it must not
get one is capacity: two people run this factory, a calendar implies availability that does not
exist, and it manufactures no-shows nobody will chase. The destination is the contact page, where
the phone number is Іван's (§G1) and the instruction is «зателефонуйте заздалегідь».

Icons are supporting marks in `gold-600` at ≥24 px; below that size `gold-600` fails AA and
`gold-700` is required ([09-color-palette.md](09-color-palette.md) §9.3). Text is
`--text-body`, never gold. Generic badge clip-art («100% ГАРАНТІЯ», «НАЙКРАЩА ЦІНА») is
forbidden — it is the visual signature of the archetype this brand is positioned against.

---

## 17.15 Reviews

### 17.15.1 The launch reality

**The PDP ships with zero reviews.** There is no review migration (D2, consequence 1), no
seeded testimonials, and no imported history. Every product page on day one renders the empty
state, and the empty state is therefore the primary design, not the fallback.

```
ВІДГУКИ

┌──────────────────────────────────────────────────────────────┐
│  Цей виріб ще не має відгуків.                               │
│  Купили його? Розкажіть, як він вам служить —                │
│  ваш відгук допоможе іншим.                                  │
│                                                              │
│  [ Залишити відгук ]                    secondary button     │
└──────────────────────────────────────────────────────────────┘
```

Per [08-design-system.md](08-design-system.md) §8.8 the empty state explains what will appear
and offers the action that creates it. It does **not** show a zero-star rating, an "0 з 5"
control, or a rating summary bar at zero — an empty five-star widget reads as a bad score.

The operational consequence belongs in the roadmap rather than this page: review volume is a
launch-critical asset that must be generated deliberately, primarily through the post-delivery
request email (§17.15.4) and through the existing offline customer base, which
[00-client-decisions.md](00-client-decisions.md) D2 names as launch traffic.

### 17.15.2 Populated display

```
★★★★★  4.8        5 ★ ████████████████░░  18        [ Залишити відгук ]
з 23 відгуків     4 ★ ████░░░░░░░░░░░░░░   4
                  3 ★ █░░░░░░░░░░░░░░░░░   1

Фільтр: [ Усі ▾ ] [ З фото ] [ Підтверджені покупки ]   Сортувати: [ Нові ▾ ]
──────────────────────────────────────────────────────────────────────────
Оксана М.   ✓ Підтверджена покупка            ★★★★★   12 березня 2026
Розмір: 200×220 · Колір: натуральний сірий

Купували на подарунок батькам. Важкий, щільний, зовсім не колеться.
[▣] [▣]
  ↳ Відповідь Вівчарика: Дякуємо, Оксано…          --bg-alt, inset
                                        Корисно (4)  ⚑ Поскаржитися
──────────────────────────────────────────────────────────────────────────
```

Each review renders `authorName`, `rating`, `createdAt`, `isVerifiedPurchase`, `body`,
`mediaIds`, `helpfulCount` and `reply` ([25-database-schema.md](25-database-schema.md) §25.6).
The **variant purchased** is shown above the body, resolved from `orderId` — "great blanket" is
far more useful when the reader knows it was the 200×220. Only `status = APPROVED` rows reach
the storefront, including via the API.

### 17.15.3 The verified-purchase rule and the `AggregateRating` constraint

`isVerifiedPurchase` is set **only** when `Review.orderId` is non-null, that order's
`paymentStatus` is `PAID` (or `status` is `DELIVERED` for COD), and the order contains a variant
of this product. It is never set by an admin toggle and never inferred from an email match.

[25-database-schema.md](25-database-schema.md) §25.6 states the constraint directly: **only
`APPROVED` reviews with `isVerifiedPurchase = true` contribute to the aggregate rating exposed
in structured data.** This creates a deliberate asymmetry:

| Surface | Population | Example |
|---|---|---|
| On-page average | All `APPROVED` reviews | ★ 4.8 from 23 |
| `AggregateRating` in JSON-LD | `APPROVED` **and** verified | ★ 4.9 from 11 |

The two numbers differ, and that is correct. Emitting the on-page figure would inflate a
Google-visible rating with unverifiable input — a structured-data policy violation, and a
particularly expensive one for a new domain, where a manual action arrives before any ranking
has been earned to lose.

**When the verified count is zero — which is every product at launch — the `aggregateRating`
property is omitted entirely.** Not emitted as zero, not emitted with a fabricated count.

### 17.15.4 Submission

Three paths, all writing `status = PENDING`:

1. **From the post-delivery email**, sent `{{REVIEW_REQUEST_DAYS}}` days after `DELIVERED`,
   carrying a signed token that pre-links `orderId` and therefore earns the verified badge
   automatically. This must carry most volume online, and it is the only mechanism that builds
   *verified* review inventory at all.
2. **From the business card in the parcel** — new in round 4. **The card already ships in every
   box** ([00-client-decisions-4.md](00-client-decisions-4.md) §G4): «Так, відправляється візитка
   разом з посилкою.» Nothing has to be invented, printed from scratch, or added to the packing
   workflow — the card is already in the hand of someone who has just unwrapped the product.
   §G4's recommendation is to put a **short URL plus a QR code to the same review page** on it,
   alongside Іван's number and the site address.
3. **Directly from the PDP**, open to anyone: rating, title, body, name, email, optional photos.
   No verified badge.

**Why path 2 matters more than its size suggests.** It is the only route that reaches **counter
sales** — the buyer who walked into the Яворів shop, paid cash, has no order number, no
confirmation email and no address we hold, and is otherwise completely unreachable. That buyer is
a meaningful share of this business's existing customers ([00-client-decisions.md](00-client-decisions.md)
D2 names the offline base as launch traffic), and until round 4 no mechanism in this blueprint
could ask them for anything. It also catches the online buyer whose confirmation email was
filtered, which on a brand-new sending domain is not a rare case
([18-checkout-specification.md](18-checkout-specification.md) §18.17).

Two details in §G4's recommendation are load-bearing. **Print both the short URL and the QR
code**: the 25–75 audience splits precisely here, younger buyers scan and older buyers type, and
printing only one halves the reach of a card that costs the same either way. And **use one static
short link**, `{{DOMAIN}}/v` or similar, with no per-order codes and no variable printing —
per-order codes would give better attribution and would require a print workflow a two-person
business should not be asked to run.

**The attribution caveat is honoured, not engineered around.** A review arriving through the card
has no order linkage, so `isVerifiedPurchase` stays `false` and it is **excluded from the
aggregate rating** exposed in structured data (§17.15.3,
[25-database-schema.md](25-database-schema.md) §25.6). §G4 states plainly that this is correct and
must not be worked around, and the temptation to work around it is real: these will be genuine
reviews from genuine customers, and the verified-purchase gate will keep them out of the number
Google shows. The gate exists because it is checkable and the review is not. Matching a card
review to an order by email would defeat it, would fail for the cash customer it exists to serve
anyway, and would put an unverifiable rating into structured data — which is a policy violation
whose cost, on a domain with no ranking to lose, arrives before any ranking has been earned.

On-page these reviews display normally and contribute to the on-page average; only the JSON-LD
aggregate excludes them. That asymmetry is already specified in §17.15.3 and this path is the
third and largest reason it exists.

All three paths are rate-limited and honeypot-protected. Moderation is manual — at this catalogue
size an approval queue is cheaper than a spam-filtering system, and the brand voice benefits from
a human seeing every review before it publishes. Path 2 raises the moderation stakes slightly: a
publicly guessable short URL with no order token is the easiest of the three to abuse, which is
the argument for the queue rather than against the card.

---

## 17.16 Cross-sell, up-sell, bundle, completes-set

Driven by `ProductRelation.kind` ([25-database-schema.md](25-database-schema.md) §25.3),
curated in the admin, ordered by `position`. Algorithmic recommendation is explicitly **not**
built at launch: a new store with no behavioural history has nothing for a collaborative filter
to learn from, and a "customers also bought" block populated by noise is worse than four
deliberate merchandiser choices.

| `RelationKind` | Block title | Placement | Rationale |
|---|---|---|---|
| `COMPLETES_SET` | «Завершіть комплект» | Below care, above cross-sell | The highest-intent block. A buyer taking a 200×220 ліжник plausibly wants the matching подушка. Placed first among merchandising because its conversion rate is structurally highest |
| `CROSS_SELL` | «З цим купують» | Below `COMPLETES_SET` | Adjacent families — капці beside шкарпетки, накидка beside гуня |
| `UP_SELL` | «Більший розмір» / family-specific | **Inside the buy box**, a compact 2-up strip under the price, only where a higher-priced sibling exists | Up-sell must be seen *while deciding*. Below the fold it is a browse block; beside the price it is a comparison |
| `BUNDLE` | «Комплект зі знижкою» | Below the buy box on desktop, after the trust row on mobile | The only block with its own CTA. It states the saving as a number, and that number must be a real `Promotion` of type `BUNDLE`, not a display-only calculation |

**Placement rule.** No merchandising block appears above the specification table, the
provenance block, delivery, or returns — jobs 1–6 always precede job 8. The single exception is
the in-buy-box up-sell strip, which is a comparison aid, capped at two items.

**Origin rule.** Relations may cross origins in both directions, but a partner product's
relation blocks should preferentially surface own manufacture, because that is an upgrade path
toward the higher-margin, higher-trust range. The reverse is permitted but never automatic.

**Empty-state rule.** A block with fewer than three related products does not render — no
placeholder, no auto-fill from the category. A two-card carousel looks broken
([08-design-system.md](08-design-system.md) §8.8). `BUNDLE` and the up-sell strip are exempt,
being meaningful at one item. At launch, with relations unpopulated, most PDPs will render none
of these blocks; that is correct, and populating relations is a merchandising task on the
content critical path.

Desktop carousels show four cards with `‹ ›`; mobile uses horizontal snap-scroll with a partial
fifth card visible to signal scrollability. Auto-advance is disabled everywhere
([13-motion-system.md](13-motion-system.md) §13.6).

---

## 17.17 Recently viewed

Client-side only: product IDs in `localStorage`, capped at 8, deduplicated, most-recent-first,
excluding the current product. Hydrated by one batched API call after interactivity, and not
rendered at all below three resolved entries.

No server-side tracking, no cookie, no `Customer` linkage — and now, permanently, no possibility
of one: [00-client-decisions-2.md](00-client-decisions-2.md) §E12 removes accounts for good, so
there is no identity to attach recency to. This keeps the feature outside the consent-banner
scope in every locale including `de`, which is a real simplification for a feature of modest
value. Cross-device recency is not deferred; it is out of scope, and the same is true of the
saved-items list (§17.6.5).

It sits last before the footer: it serves recovery of a previously-considered item, not
discovery of a new one.

---

## 17.18 Breadcrumbs

`Головна / Власне виробництво / Вовна / Ліжники / Ліжник «Черемош»`, rendered from the primary
`ProductCategory` (lowest `sortOrder`) walked up the `Category` tree. Partner products resolve
to `Головна / Партнерські вироби / …`, which makes the origin distinction legible in the URL
and in the trail without any extra copy.

| Breakpoint | Treatment |
|---|---|
| `lg`+ | Full trail, `caption`, `--text-muted`, current item unlinked with `aria-current="page"` |
| `md` | Full trail, longest middle segment ellipsised with a `title` |
| `xs`–`sm` | Collapsed to `← Ліжники`, 44 px hit area |

Marked up as `BreadcrumbList` JSON-LD (§17.21). The mobile collapse keeps the structured data
complete while showing the one segment that is useful at 390 px — the full trail wraps to two
lines there and pushes the product name below the fold.

---

## 17.19 How the PDP differs by material world

One template, four configurations, driven by `Category` metadata, `ProductOrigin`, and
`AttributeDefinition` sets — not by four page components, which would drift within two release
cycles. The configurations exist because the material worlds provoke genuinely different buying
questions.

### Wool — ліжники, ковдри, гуні, камізельки, подушки, шкарпетки, капці, пояси, накидки, пряжа, ровниця, вовна для рукоділля

The lead world ([00-client-decisions.md](00-client-decisions.md) D3): homepage and branding are
wool, and this configuration is the default.

| Aspect | Configuration | Why |
|---|---|---|
| Gallery | `SCALE_REFERENCE` mandatory for ліжники, ковдри, накидки, гуні. A `DETAIL` macro of the weave is mandatory everywhere | Weave density is what separates a mid-price rug from a top-price one, and it is only visible in macro |
| Key attributes | Склад (%) · Щільність (г/м²) · Тонина (мкм) + gloss · Вага · Плетіння | Answers A1 and A2 directly ([02-ux-research.md](02-ux-research.md) §2.4) |
| Size | Exact, on a `SIZE_GRID` with per-size pricing | Woven goods are made to dimension, so precision is both possible and expected |
| Apparel sub-case (гуні, камізельки, капці, пояси) | Adds a body-measurement size table in a modal and a fit note; `SCALE_REFERENCE` becomes a worn shot | Garment sizing is the dominant return cause for apparel, and a wool garment cannot be tried on |
| Provenance | The strongest configuration: full stage list, `woolOrigin`, `woolMicron` | This is the family where "full cycle" is literally true and most defensible |
| Yarn sub-case | `PricingUnit.SKEIN`/`KILOGRAM` control (§17.6.4), метраж and товщина in the buy box, the batch-variation note, restock notification prominent. **No dye-lot axis** (§E8) | Persona Ірина's J4 — running out mid-project is the named fear, and the note is what prevents it |
| Care | Shared wool care profile | Consistent across the family; centralising prevents drift |

### Sheepskin and leather — вироби з овчини, шкіряні вироби

**These are own manufacture, confirmed.** [00-client-decisions-2.md](00-client-decisions-2.md)
§E6 records the client's answer in full — «Вівчарик самостійно проводить весь процес від сировини
до виробів» — which closes the tanning question D3 left open. Hides are `OWN_MANUFACTURE` and
carry the **full §17.10.1 provenance block**, not a reduced one. This section previously treated
the hide pipeline as uncertain; that uncertainty is resolved, and the configuration below is
built on a full-cycle claim rather than around a gap in one.

| Aspect | Configuration | Why |
|---|---|---|
| Gallery | `SCALE_REFERENCE` **mandatory**. 360° spin available (§17.5.4). Two `DETAIL` macros minimum: the pile, and the reverse side | A hide is irregular; its outline, its pile, and the quality of the backing are the three things a buyer would check in person |
| Size | A **range**, never a single number: «90–100 см (довжина хребта)», with the measurement axis named | Natural hides are not cut to size. A precise number would be a false claim on every unit |
| Key attributes | Довжина хутра (мм) · Вичинка · Тип обробки · Товщина шкіри · Гіпоалергенність | The hide-specific quality markers. Micron and density are meaningless here |
| Provenance | **Full block, same as wool**: the tanning and finishing stages render as in-house `productionStage[]` entries, with `MediaRole.PRODUCTION` photography of those stages | §E6 confirms the full cycle. The stage list is the strongest version of the claim available on this site, and it is the one hides now support |
| Photography constraint | A tanning stage may be listed **only if it is photographed** | §E6 makes this self-policing rather than auditable: the evidence requirement is what keeps a full-cycle claim from drifting into a marketing line |
| «бельгійська технологія» | **Removed.** Never rendered, in any locale | It described the adjacent business's process, not Вівчарик's. Inheriting a borrowed technology claim inside a provenance block is the one detail a competitor would check first |
| Ethical framing | Explicit statement that hides are a by-product of the food industry, with the tanning method named | The `de` locale carries a live ethical objection. The by-product framing and traceability must lead wherever hides are shown at all |
| EU availability | **Recommendation on record: `de` and `pl` launch wool-only** (§E11) | Sheepskin and leather entering the EU face species-declaration paperwork and, for some materials, CITES documentation; wool faces none. Shipping a hide PDP into `de`/`pl` before that paperwork is confirmed risks a seized parcel and an unfulfillable order, and it walks straight into the German market's ethical sensitivity for no launch benefit. The hide categories switch on for EU destinations once the documentation is confirmed — a configuration change, not a redesign |
| Care | Specialist: shaking, brushing with a wire card, professional cleaning only | Genuinely different from wool care; a shared profile would be wrong |
| Variation notice | Permanent, non-dismissible: «Кожна шкура унікальна. Відтінок і розмір можуть відрізнятися від фото.» | The largest single source of returns in this category. Stating it pre-empts the dispute |

### Partner manufacture — ПАРТНЕРСЬКІ ВИРОБИ

A configuration, not a category-shaped template: a partner product may be wool or sheepskin and
inherits that world's attribute set.

| Aspect | Configuration |
|---|---|
| Origin mark | «Відібрано Вівчариком» + «Виготовлено карпатським майстром» (region known) or «Виготовлено іншим виробником» (region unknown), directly under the `h1` at equal visual weight (§17.10.2) |
| `partnerName` | Null in the database, never rendered anywhere (§E7) |
| Provenance block | Replaced by the partner specification block (§17.10.3). No `productionStage[]`, no `woolOrigin` in-house claim, no Yavoriv |
| Gallery | No `PRODUCTION` media, ever |
| Trust row | The thirty-year manufacturing claim and the Yavoriv origin line are both removed |
| Structured data | `manufacturer` **omitted**; `brand` pending the §E7 open question |
| Relations | Preferentially surface own-manufacture equivalents |
| Discoverability | Included in search and category listings, excluded from the homepage, hero, best-sellers and production storytelling |

### Wood — дерев'яний посуд (architecture prepared, not launched)

[00-client-decisions.md](00-client-decisions.md) D3 places wooden products in
`ProductStatus.DRAFT` behind an inactive category node. The PDP configuration is specified now
so that launching the range later is a content task, not a design task — and explicitly **not**
built into the navigation in a partially-populated state.

| Aspect | Configuration | Why |
|---|---|---|
| Gallery | No `SCALE_REFERENCE` requirement — a bowl's scale is intuitive. A `DETAIL` macro of the grain and finish is mandatory | Grain pattern is the differentiator and the reason two identical-spec bowls have different value |
| Key attributes | Порода деревини · Просочення · Розмір · Обʼєм (мл) · Придатність до посудомийної машини | Food-contact safety and dishwasher tolerance are the two questions a buyer of wooden tableware actually has. Neither has a wool or hide analogue |
| Food-contact statement | Mandatory and explicit, naming the oil or finish | A regulated claim in the EU locales; a vague «натуральне просочення» is not sufficient for `de`/`pl` |
| Provenance | Carving method and the maker; `isHandmade` is most often true here | The family closest to the reserved «Ательє» tier ([01-brand-strategy.md](01-brand-strategy.md) §1.3) |
| Care | Specialist and prominent: hand-wash, periodic re-oiling, no prolonged soaking | Getting this wrong destroys the product |
| Returns | Food-contact items, once used, are non-returnable on hygiene grounds — stated on the PDP, not only in the policy | |
| Compare | Disabled | Nobody comparison-shops a carved bowl on specification |

---

## 17.20 State matrix

| # | State | Trigger | Gallery | Buy box | CTA | Notes |
|---|---|---|---|---|---|---|
| S1 | Loading | Initial fetch | Skeleton at exact final dimensions | Skeleton | Skeleton | No spinner; skeleton dims come from a known aspect ratio, so CLS is zero |
| S2 | Loaded, single variant | `variants.length === 1` | Full | No selectors | Enabled | |
| S3 | Multi-variant, none selected | No URL params | Full | Selectors, no selection | «Оберіть розмір», scrolls + focuses | Never a dead disabled button |
| S4 | Variant selected | Selection complete | Swaps to `ProductVariant.mediaId` if set | Price collapses to exact | Enabled | Zero layout shift on the price swap |
| S5 | Partial selection | Size chosen, colour not | Full | Remaining axis gets a 2 px `--accent` ring | «Оберіть колір» | |
| S6 | Low stock | `0 < stockQty ≤ lowStockAt` | Full | `warning` badge, true count | Enabled, qty capped | No animation ([13](13-motion-system.md) §13.11) |
| S7 | One-of-one | `isUniquePiece` | Full, the actual piece | `gold-100` plate, no stepper | Enabled | Reservation on add ([18](18-checkout-specification.md) §18.14) |
| S8 | Made to order, dimensions valid | «Свій розмір» selected, both inputs within bounds | Full | Computed price, area, lead-time line, prepayment line, returns exclusion; quantity locked at 1; COD row replaced | «Замовити виготовлення» | §17.6.6. Price recomputed server-side at order creation ([18](18-checkout-specification.md) §18.8.7) |
| S9 | Variant out of stock | Selected variant at zero | Full | `danger` badge | «Повідомити про наявність» | Other variants stay selectable |
| S10 | All out of stock | Every variant at zero | Full | `danger` badge | Notify-me + category link | Stays indexable; `OutOfStock` in JSON-LD |
| S11 | Partner, region known | `origin = PARTNER_MANUFACTURE`, `partnerRegion` set | No `PRODUCTION` media | «Відібрано Вівчариком» + «Виготовлено карпатським майстром · {region}» | Enabled | §17.10.2/.3. Provenance block replaced; thirty-year claim and Yavoriv removed; `manufacturer` omitted from JSON-LD |
| S12 | Partner, region unknown | `origin = PARTNER_MANUFACTURE`, `partnerRegion` null | As S11 | «Відібрано Вівчариком» + «Виготовлено іншим виробником» | Enabled | Not a fallback — one of two normal states (§E7). `partnerName` is never rendered in either |
| S13 | Sold by weight | `pricingUnit != PIECE` | Full | Skein control, derived weight/length/total, batch-variation note | Enabled | §17.6.4. No dye-lot axis (§E8) |
| S14 | Added to cart | Success | Unchanged | Unchanged | Check morph, resets after 2 s | Toast + badge. Drawer opens on mobile only |
| S15 | Add failed | Network or stock conflict | Unchanged | Unchanged | Restored | Inline error above the CTA, `aria-live="assertive"`, retry offered |
| S16 | Stock changed underneath | Reservation expired or sold during the session | Unchanged | Availability re-renders | Updates to S9 | Announced politely; the button never changes silently |
| S17 | Zero reviews | `reviews.length === 0` | — | — | — | **The launch default.** Designed empty state; `aggregateRating` omitted entirely |
| S18 | Translation fallback | Missing `ProductTranslation` | Full | Full | Enabled | Serves `uk` ([25](25-database-schema.md) §25.2). No 404. `hreflang` omits the missing locale |
| S19 | Archived | `status = ARCHIVED` | Dimmed | Hidden | — | 410 Gone with a category link. No legacy-redirect case exists — there is no migration (D2) |
| S20 | Draft / preview | `status = DRAFT`, staff session | Full | Full | Disabled | Persistent «ЧЕРНЕТКА» bar; `noindex`. Covers the entire wooden range until launch |
| S21 | Error | Fetch failure | Error state | — | — | Plain language, retry, no stack trace ([08](08-design-system.md) §8.8) |
| S22 | Reduced motion | `prefers-reduced-motion` | No Morph, no parallax, cross-fades only | Static | — | [13-motion-system.md](13-motion-system.md) §13.6 |
| S23 | `saveData` / low-end | Connection hint | Video poster only, no 360°, no ambient | Full | Enabled | [13-motion-system.md](13-motion-system.md) §13.7 |
| S24 | Custom size selected, dimensions empty | «Свій розмір» selected, one or both inputs blank | Full | Dimension inputs with range hints visible; price area reads «Вкажіть розміри» | «Вкажіть розміри», scrolls to + focuses the width field | Never a dead disabled button, per S3's rule. No zero price, no stale figure |
| S25 | Custom size out of bounds | A dimension below `customSizeMin*Cm` or above `customSizeMax*Cm`, evaluated **on blur** | Full | The offending field in error state, typed value retained, message naming the limit: «Максимальна ширина — 200 см. Це обмеження верстата.» | Disabled with the error adjacent | §17.6.6. The value is never silently clamped, and validation never fires mid-keystroke |
| S26 | Custom size minimum price binding | `raw < customSizeMinPriceMinor` | Full | Price shows the floor, with «За цих розмірів діє мінімальна ціна виробу» beneath it | Enabled | Without the line, a small custom size looks like an arithmetic bug and the buyer leaves |
| S27 | Custom size unavailable | `allowsCustomSize = false`, or the rate/bounds fields are unset | Full | The «Свій розмір» card does not render at all | Normal | An incomplete custom-size configuration renders nothing rather than a card that cannot price. The admin publish validator flags it ([23](23-admin-panel-architecture.md)) |
| S28 | Custom size added to a cart holding a stocked line | The add succeeds and the cart response reports at least one line without `customSpec` | Unchanged | Unchanged | Unchanged | **S14 plus the mixed-cart disclosure and its escape**, inside the same confirmation and the same `aria-live` utterance. The add is never blocked and no dialogue is raised. §17.6.6, [00-client-decisions-6.md](00-client-decisions-6.md) §J1 |

---

## 17.21 SEO and structured data

### 17.21.1 The cold-start position

Вівчарик launches on `{{DOMAIN}}` with zero domain authority, zero backlinks and zero ranking
history ([00-client-decisions.md](00-client-decisions.md) D2, consequence 2). Two consequences
bind this page specifically:

1. **There is no redirect workstream.** No legacy URL mapping, no `Redirect` seeding from an
   export, no Search Console baseline to preserve. The `Redirect` table exists for future
   slug changes only.
2. **Commercial head terms will not rank for months.** The PDP's realistic organic role at
   launch is as the *destination* of internal links from long-tail informational content and of
   Google Business Profile traffic — not as an entry point. That makes internal linking from the
   care guide and the attribute facets (§17.9) disproportionately valuable, and it makes
   rich-result eligibility worth the effort even before rankings exist.
3. **The launch channel set is thinner than previously assumed.**
   [00-client-decisions-2.md](00-client-decisions-2.md) §E3 records that the owners run **no
   social media at all**, which removes the Instagram channel D2 named. What remains is the
   Google Business Profile (§E4), the existing offline customer base, long-tail editorial
   content, and Yavoriv's tourist footfall. Two consequences bind this page: the duplicate-text
   prohibition in §E5 is load-bearing rather than hygienic, since rewritten product copy is one
   of the few assets that can rank at all; and «Яворів» in the `title`, the `description` and the
   provenance copy is the cheapest available differentiator against every generic «карпатський»
   listing competing for the same queries.

### 17.21.2 URLs and metadata

| Item | Rule |
|---|---|
| URL | `/{locale}/{category-slug}/{product-slug}` from `ProductTranslation.slug`, unique per locale via `@@unique([locale, slug])` |
| Canonical | Self-referential, locale-inclusive, **excluding variant query parameters**. `?size=…` must not fragment authority |
| `hreflang` | Four locales plus `x-default → uk`, emitted only where a translation row exists |
| `title` | `metaTitle`, or generated as `{name} — {category} \| Вівчарик` |
| `description` | `metaDescription`, or the first 155 characters plus price and origin |
| Reviews pagination | Client-side without a URL change, so no `rel=next/prev` and no thin paginated duplicates |

### 17.21.3 `Product` JSON-LD

Emitted server-side. A property with no data is omitted, never emitted empty.

| Property | Source | Constraint |
|---|---|---|
| `name`, `description` | `ProductTranslation` | |
| `sku` | `Product.sku` / `ProductVariant.sku` | Mandatory per D4 |
| `image` | Up to 6 `ProductMedia` URLs, `PRIMARY` first | ≥1200 px |
| `brand` | **Вівчарик on every product, both origins** | Resolved by [00-client-decisions-3.md](00-client-decisions-3.md) F3. Partner goods are sold under the Вівчарик name, so `brand` is a true statement about them. See the block below |
| `manufacturer` | Вівчарик for `OWN_MANUFACTURE`. **Omitted entirely for `PARTNER_MANUFACTURE`, never set to Вівчарик** | `partnerName` is null and unrenderable (§E7), and Вівчарик did not make the item. Omission is honest; misattribution is not, and asserting own manufacture on a resold product is simultaneously a structured-data violation and a trust failure (D3 rule 3). There is no third option that is both populated and true |
| `material`, `weight`, `size`, `color` | `ProductAttributeValue` | |
| `offers` | `AggregateOffer` when ranged (`lowPrice`/`highPrice`), `Offer` when single | Mirrors `priceMinMinor`/`priceMaxMinor` exactly |
| `availability` | `InStock` / `OutOfStock` / `LimitedAvailability` (one-of-one). **`PreOrder` is never emitted** | Must match the rendered badge. The custom-size configuration is not an offer — see the block below |
| `shippingDetails` | Nova Poshta and Ukrposhta rates, `shippingDestination` = UA only. **International `shippingDetails` is never emitted** | Real published rates only. F4 resolves international shipping as quoted per order across multiple carriers, so no international rate exists to publish — permanently, not pending a token. An `OfferShippingDetails` node claiming a cross-border rate that the checkout then quotes differently is a Merchant Center mismatch |
| `hasMerchantReturnPolicy` → `customerRemorseReturnFees` | `ReturnShippingFees`, buyer-paid | F4 puts shipping on the buyer in both directions. Declaring free returns here while §17.13 charges for them is the kind of contradiction a Merchant Center review catches |
| `hasMerchantReturnPolicy` | 14 days, non-zero return shipping fee. `de`/`pl` reflect the statutory withdrawal period per §17.13 | Honest about who pays |
| `priceCurrency` | The **charge** currency, never the display currency | If V11 forces UAH settlement, a `de` offer node claiming `EUR` while the card is debited in UAH is a Merchant Center mismatch and a chargeback argument (§17.6.1) |
| `aggregateRating` | Verified-purchase `APPROVED` reviews only | **Omitted entirely when the verified count is zero — the launch default** |

### 17.21.3b The custom-size configuration is not an `Offer`

A «Свій розмір» build has no SKU, no stock, no `ProductVariant` row and **no price until the
buyer types two numbers**. Emitting it as an `Offer` is therefore impossible to do truthfully:
`price` has no value, `sku` has no value, and `availability: PreOrder` would assert that a
specific priced item can be ordered in advance, which is not what is on offer.

| Option | Verdict |
|---|---|
| `Offer` with `availability: PreOrder` and the minimum price | **Rejected.** A Merchant Center feed and a Google rich result would both show `customSizeMinPriceMinor` as *the* price of a product that will almost never cost that, which is a price mismatch — the most reliably penalised error in product structured data |
| `AggregateOffer` widened to include the custom range | **Rejected.** `highPrice` would be the largest weaveable area at the current rate, a figure no customer will ever be quoted and that changes whenever the loom bounds are edited |
| Extend `priceSpecification` with a `UnitPriceSpecification` per square metre | **Rejected for launch.** It is arguably the most accurate available modelling, but no consumer of this data — Google, Bing, or an AI assistant — will render it correctly, and an unconsumed property that can disagree with the page is a liability without a benefit. Revisit only if a consumer appears |
| **Emit offers for the standard variants only; describe custom sizing in prose** | **Selected.** The structured data states exactly what has a price. The availability of a made-to-measure option is described in `description` and in the visible page text, where it is retrievable by the AI crawlers §17.21.4 targets and cannot be misread as a price |

The same rule applied to `aggregateRating` and to `manufacturer` applies here: **a property with
no true value is omitted, never emitted empty.** The custom-size path is a genuine commercial
offer and a genuinely unpriceable one until the buyer participates, and structured data has no
vocabulary for that which any consumer honours.

### 17.21.3a `brand` versus `manufacturer` — the exact rule

[00-client-decisions-3.md](00-client-decisions-3.md) F3 closes the question §E7 left open, and
schema.org already draws precisely the distinction the answer needs. `brand` is *the brand under
which the item is sold*. `manufacturer` is *the organisation that produced it*. They are not
synonyms, and here they diverge.

```jsonc
// OWN_MANUFACTURE
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Ліжник «Черемош»",
  "sku": "LZ-CHE-150200",
  "brand":        { "@type": "Brand",        "name": "Вівчарик" },
  "manufacturer": { "@type": "Organization", "name": "Вівчарик" }
  // …image, offers, material, weight, hasMerchantReturnPolicy
}

// PARTNER_MANUFACTURE
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Кептар вишитий",
  "sku": "KP-VYSH-048",
  "brand": { "@type": "Brand", "name": "Вівчарик" }
  // "manufacturer" is ABSENT. Not null, not an empty object, not Вівчарик.
  // partnerName is null and unrenderable (§E7), so there is no true value to emit.
  // …image, offers, material, weight, hasMerchantReturnPolicy
}
```

**Why omission rather than any populated alternative.** Four options existed and three of them
assert something false:

| Option | Verdict |
|---|---|
| `manufacturer: Вівчарик` on partner goods | **Rejected.** A machine-readable claim that Вівчарик made an item it did not make. It is the same lie the on-page label exists to prevent, told to a crawler instead of a person, and it is the version that survives into Merchant Center and AI-assistant answers unchallenged |
| `manufacturer: {partnerName}` | **Impossible.** §E7 rules the name is never rendered anywhere, structured data included |
| `manufacturer: "Партнер"` or similar placeholder | **Rejected.** An invented organisation name is worse than silence and pollutes the entity graph |
| **`manufacturer` omitted** | **Selected.** It states "the brand is Вівчарик, the maker is not asserted" without asserting anything false. A property with no true value is omitted, never emitted empty — the rule this whole section already runs on |

**And it makes the on-page label load-bearing.** Once `brand` is Вівчарик on every product, the
structured data no longer distinguishes the two origins to any reader who is not specifically
looking at `manufacturer`. Everything the buyer learns about origin, they learn from the
«Відібрано Вівчариком» mark (§17.10.2) and the origin facet. That is the tension F3 names
plainly, and it is the reason those two elements are specified as non-negotiable rather than as
design preferences.

Also emitted: `BreadcrumbList` matching the visible trail exactly, and `VideoObject` for any
gallery video with a real `duration`, `thumbnailUrl` and `uploadDate`.

**Two prohibitions carried down from [00-client-decisions.md](00-client-decisions.md) D1.** No
`Organization.foundingDate` of 1992 may appear in any PDP-embedded organisation node, and no
`award`, `hasCertification` or certification-adjacent property may be emitted, because none
exists. The thirty-year story is editorial prose, never a machine-asserted claim.

### 17.21.4 AI-search retrievability

Named entities are what AI assistants extract ([01-brand-strategy.md](01-brand-strategy.md)
§1.5 principle 3). The PDP therefore renders the specification table, the production stage
list, the origin mark and the location in the **initial server-rendered HTML**, not injected
after hydration. A page whose facts arrive post-hydration is invisible to a large share of AI
crawlers, and on a domain with no ranking history, assistant citation is a channel that does
not depend on accumulated authority — which makes it unusually valuable here.

---

## 17.22 Performance budget

| Metric | Budget | Mechanism |
|---|---|---|
| LCP | ≤1.8 s on 4G, Moto G4 class | `PRIMARY` image `loading="eager"` `fetchpriority="high"`, preloaded via `<link rel="preload" imagesrcset>`, AVIF via Cloudinary `f_auto`, and **never animated on entrance** ([13-motion-system.md](13-motion-system.md) §13.8) |
| CLS | <0.01 | Explicit `width`/`height` on every image ([08-design-system.md](08-design-system.md) §8.7), reserved price width, exact-dimension skeletons, `font-display: optional` on display type |
| INP | <200 ms | Variant selection is pure client state against a prefetched variant map — no round trip to change a size |
| Initial JS | ≤120 KB gzip | Framer Motion lazy-loaded below the fold ([13-motion-system.md](13-motion-system.md) §13.5) |
| Above-the-fold image payload | ≤280 KB | One correctly-sized AVIF plus blurhash LQIP for the rest |

**Eager:** `PRIMARY` image, thumbnail blurhash placeholders, buy box, origin mark,
specification table, trust row, all JSON-LD.

**Lazy, in order:** remaining gallery images (`IntersectionObserver`, 200 px root margin) →
provenance photograph → lightbox bundle (first gallery interaction) → zoom-lens high-resolution
derivative (first hover) → video (`preload="none"`) → 360° sequence (activation) → reviews
beyond the first five → all `ProductRelation` blocks → recently viewed.

**Cached:** the product payload at the edge with 5-minute stale-while-revalidate, purged on
`Product` or `ProductVariant` mutation. Stock is fetched separately and uncached — a cached
stock figure is how a one-of-one gets sold twice.

---

## 17.23 Accessibility contract

Target: **Lighthouse Accessibility 100, WCAG 2.1 AA**, with 2.2 AAA target sizes, against an
audience running to 75 ([02-ux-research.md](02-ux-research.md) §2.6).

**Structure.** Exactly one `<h1>` — the product name. Headings descend without skipping.
Landmarks: `<main>`, `<nav aria-label="Хлібні крихти">`, and `<section aria-labelledby>` for
gallery, specifications, provenance, delivery, returns, reviews and each relation block. The
buy box is a `<form>` with a `<fieldset>`/`<legend>` per option axis.

**Gallery.** The thumbnail rail is a `tablist`, slides are `tabpanel`s, `←`/`→` move,
`Home`/`End` jump. Every `alt` comes from `MediaTranslation.alt` in the active locale — required
at the API layer ([25-database-schema.md](25-database-schema.md) §25.4), which is what makes a
score of 100 achievable rather than aspirational. `SCALE_REFERENCE` images additionally require
a caption naming the reference object. The lightbox traps focus, restores it on close, and is
`Esc`-dismissible. The zoom lens is `aria-hidden`; the keyboard path is the lightbox.

**Buy box.** Option groups are radio groups; swatches are `role="radio"` with the value name in
the accessible name, never colour alone (WCAG 1.4.1). Disabled options use `aria-disabled` and
remain focusable so their state is discoverable. Price changes announce politely; add-to-cart
success announces politely and failure assertively. The origin mark is plain text, not an
icon-only badge — the own-manufacture/partner distinction must be available to a screen reader
verbatim.

**The custom-size mode** is the one place on this page where content appears, changes and
recalculates in response to typing, so it carries its own contract (§17.6.6). The dimension
inputs are labelled, and their permitted range is `aria-describedby` text that exists **before**
any error does. The computed price, area and minimum-price notice share one `role="status"`
region so they announce as a single update, debounced to 600 ms of idle and re-announced on blur
— never once per keystroke, which would bury the field's own label under a stack of prices.
Range violations are announced through the field's own description, not through the status
region: a validation failure needs to reach the user at the moment they leave the field, and a
polite status region is the wrong channel for it. Selecting «Свій розмір» inserts the dimension
fields into the DOM in reading order and announces their appearance politely, the same rule
§18.4's conditional carrier fields follow
([18-checkout-specification.md](18-checkout-specification.md) §18.21).

**Targets and motion.** 48 px primary, 44 px floor, ≥8 px separation
([11-spacing-system.md](11-spacing-system.md) §11.7). No hover-only affordance anywhere on this
page. Every animation has a reduced-motion alternative that still delivers the content
([13-motion-system.md](13-motion-system.md) §13.6).

**Text and contrast.** 16 px minimum body text; layout survives 200% zoom and 400% at 320 px.
Every foreground/background pair is drawn from the verified table in
[09-color-palette.md](09-color-palette.md) §9.5; `gold-600` never carries small text.

**Verification.** Automated axe run in CI against one product per configuration in §17.19,
manual keyboard traversal including the lightbox, and one NVDA and one VoiceOver pass per
release ([02-ux-research.md](02-ux-research.md) §2.8 R4).

---

## 17.24 Analytics events

`view_item` · `gallery_open_lightbox` · `gallery_view_scale_reference` (measures whether the
§17.5.2 investment pays) · `variant_select` · `provenance_block_view` (the
[01-brand-strategy.md](01-brand-strategy.md) §1.10 >55% metric) · `production_link_click` ·
`origin_mark_view` · `partner_to_own_click` (does the §17.10.3 link actually route buyers to
own manufacture?) · `delivery_estimator_expand` · `pickup_invitation_click` (does the F2 shop
line send anyone to the contact page? — the offline-to-online path
[00-client-decisions-3.md](00-client-decisions-3.md) F2 asks to be measured) ·
`intl_duty_notice_view` · `add_to_cart` · `notify_me_submit` · `review_submit`.

**New in rounds 4 and 5**, each measuring a decision that was made without evidence and should
not stay that way:

| Event | Question it answers |
|---|---|
| `custom_size_select` | How many buyers open the made-to-measure path at all. If it is a rounding error, the fourteen-day operational commitment is not worth its complexity; if it is not, the rate needs attention |
| `custom_size_dimensions_valid` | Fires on the first valid width/length pair, with `area_m2` and `computed_price_minor`. The distribution of requested areas is the only data that will ever inform `customSizeRatePerSqmMinor` |
| `custom_size_bounds_rejected` | Carries the axis and the attempted value. A cluster just above `customSizeMaxWidthCm` is demand for a wider loom, not a UI problem, and it is invisible without this event |
| `custom_size_min_price_bound` | How often the floor binds. Frequently binding means the floor is doing the pricing, and the rate is decorative |
| `custom_size_abandon` | Dimensions entered, no add-to-cart. The most likely cause is price, and this is where that shows |
| `payment_methods_view` | Whether §17.12.2 is read at all, on a page where the inspection right is the strongest cold-start argument available |
| `cod_inspection_info_click` | Whether buyers follow the link to §18.8.5a's worked example. A high rate means the PDP deferral is costing clicks and the summary should be stronger |
| `workshop_visit_click` | Whether the §17.14 trust item and the §17.10.1 invitation route anyone to the contact page. §G3 calls this the project's strongest trust asset; this is the only number that will confirm or refute it |

Every event carries `product_id`, `variant_id`, `product_origin` and `availability_state`;
custom-size events additionally carry `width_cm`, `length_cm` and `area_m2` where known. Full
contract in [31-analytics-architecture.md](31-analytics-architecture.md).

---

## 17.25 Tokens used and introduced

| Token | Meaning | Severity | Where |
|---|---|---|---|
| `{{DOMAIN}}` | **`vivcharyk.shop`**, chosen, not yet registered (round 7, K1) | BLOCKER until registered | Canonical URLs, JSON-LD `url` |
| `{{NP_BRANCH_PRICE}}` | Nova Poshta branch tariff — **unknown**; the audited 80 UAH belongs to the adjacent business | HIGH | §17.12.1, §17.14 trust row |
| `{{NP_COURIER_PRICE}}` | Nova Poshta courier tariff — unknown | HIGH | §17.12.1 |
| `{{UKRPOSHTA_PRICE}}` | Ukrposhta tariff — unknown | HIGH | §17.12.1 |
| `{{FREE_SHIPPING_THRESHOLD}}` | Free-delivery threshold — **unknown**; the audited figure belongs to the adjacent business | HIGH | §17.12.1 |
| `{{INTL_CARRIER}}` | **Resolved** ([00-client-decisions-3.md](00-client-decisions-3.md) F4) to «multiple, quoted per order» — Nova Poshta, Ukrposhta and other carriers case by case. No longer a blocker; the international row renders a process, not a rate | RESOLVED | §17.12.1 international row |
| `{{INTL_TRANSIT}}` | **Retired.** Transit follows a carrier chosen per order, so no page-level window can be published. The quote carries it ([18](18-checkout-specification.md) §18.23.7) | RETIRED | — |
| `{{SKU_COUNT}}` | Catalogue size — the adjacent site's scope, several hundred to ~1 000 (§E5); confirm at export | MEDIUM | Facet and search architecture |
| `{{MADE_TO_ORDER_DAYS}}` | **Resolved to 14** ([00-client-decisions-4.md](00-client-decisions-4.md) §G2). Production time **before dispatch**, not total delivery time | RESOLVED | §17.6.6, §17.7 state 4, §17.12.1 |
| `{{PRICE_LIST}}` | Вівчарик's own price list. **Now also carries the per-product custom-size rate and floor** — `customSizeRatePerSqmMinor` and `customSizeMinPriceMinor` are commercial numbers the business sets, not defaults this document may supply | HIGH | §17.6.1, §17.6.6 |
| `{{LOOM_BOUNDS}}` | `customSizeMinWidthCm` / `MaxWidthCm` / `MinLengthCm` / `MaxLengthCm` per product. **Physical machine limits**, measured rather than decided | HIGH | §17.6.6 dimension inputs. A custom-size product cannot publish without them (§17.20 S27) |
| `{{REVIEW_REQUEST_DAYS}}` | Days after delivery before the review request | LOW | §17.15.4, [18](18-checkout-specification.md) §18.17 |

**Retired in round 2.** `{{PARTNER}}` — the partner cannot be named and the name is never
rendered (§E7), so there is no string to resolve. `{{DYE_LOT_TRACKING}}` — lots are not tracked
(§E8) and the honest note replaces the token. `{{DYE_PARTNER}}` — dyeing is in-house under the
full-cycle confirmation (§E6). `{{POSTAL_CODE}}` and `{{FACTORY_ADDRESS}}` resolve to `78644` and
вул. Петруші, с. Яворів (§E2) and are used as values below.

**Resolved in rounds 4 and 5.** `{{MADE_TO_ORDER_DAYS}}` = **14 days of production before
dispatch** ([00-client-decisions-4.md](00-client-decisions-4.md) §G2) — a duration this page now
prints as a fact, always paired with «Далі — доставка перевізником». `{{FLOOR_VISIT}}` = **yes,
guided, with Іван, arranged by phone** (§G3), used as a value in §17.10.1 and §17.14. The primary
phone is **Іван, `+380679973450`** (§G1), and it is the number this page prints wherever a number
appears; Любов's `+380679604769` is the fallback and appears in the footer, the contact page and
order email rather than on the PDP. Custom-size pricing is resolved to **owner-set rate per
square metre, computed by the system**
([00-client-decisions-5.md](00-client-decisions-5.md) §H3c) — no token, six `Product` fields
([25-database-schema.md](25-database-schema.md) §25.3). Payment scope is resolved: card
everywhere, «наложений платіж з оглядом» in Ukraine on stocked items only, full prepayment on
custom sizes (§H1.1, §H1.2).

**Retired or resolved in round 3** ([00-client-decisions-3.md](00-client-decisions-3.md)).
`{{INTL_TRANSIT}}` is retired — with carriers chosen per order there is no window to publish
(F4). `{{INTL_CARRIER}}` resolves to a model rather than a name and no longer gates the §17.12
international row (F4). The partner `brand` question is closed: partner goods carry the Вівчарик
brand and `manufacturer` is omitted (F3, §17.21.3a). `{{LEGAL_ID}}` is confirmed to exist and
blocks only the WayForPay merchant contract, the offer contract and the German Impressum (F1) —
**nothing on this page waits on it**, and it is deliberately absent from the table above.

Resolved and used as values, not placeholders: `{{YEARS_EXPERIENCE}}` = «понад 30»
([00-client-decisions.md](00-client-decisions.md) D1), `{{CERTIFICATIONS}}` = none, brand name
= Вівчарик, location = Яворів, `{{PSP}}` = **WayForPay** (§E10). Existing tokens referenced
without redefinition: `{{WOOL_SOURCE}}`, `{{RETURN_DAYS}}`, `{{PARTNER_REGION}}` (rendered as a
region only, never alongside a company name), `{{FOUNDING_YEAR}}` (editorial only, never
structured data).

**Open questions this page is waiting on**

| # | Question | Blocks |
|---|---|---|
| ~~§E7~~ | ~~Are partner goods sold under the Вівчарик brand name, or unbranded?~~ | **Closed by [00-client-decisions-3.md](00-client-decisions-3.md) F3** — branded Вівчарик, `manufacturer` omitted. §17.21.3a |
| ~~§E11~~ | ~~`{{INTL_CARRIER}}` and the customs position~~ | **Closed by F4** — multiple carriers quoted per order, buyer pays shipping and all duties. §17.12 |
| §E10 V11 | Can WayForPay settle non-UAH? | Which of the two §17.6.1 currency branches ships |
| §E11 | EU species-declaration paperwork for hides | Whether `de`/`pl` launch wool-only (§17.19) |
| §E2 | Exact status and wording of any Hutsul-lizhnyk heritage reference | Whether §17.10.1 may mention a register at all |
| ~~F2~~ | ~~Is the production floor itself visitable, or only the shop?~~ | **Closed by [00-client-decisions-4.md](00-client-decisions-4.md) §G3** — «Так, відвідувачі можуть оглянути цех з Власником.» The §17.10.1 invitation and the §17.14 trust item now say so, with the by-arrangement qualifier and no booking widget |
| ~~§H5.1~~ | ~~How is a custom size priced?~~ | **Closed by [00-client-decisions-5.md](00-client-decisions-5.md) §H3c** — owner-set rate per square metre with a minimum-price floor, computed by the system, recomputed server-side at checkout. §17.6.6 |
| §H3c | Is the custom-size rate per product, or would a per-category default suffice? | Nothing on this page. Per product is what the buy box reads; a category default inherited into the product field is an admin convenience ([23](23-admin-panel-architecture.md)) |
| ~~§H5.3~~ | ~~Confirm the mixed-cart split into two orders~~ | **Closed by [00-client-decisions-6.md](00-client-decisions-6.md) §J1 — the split is withdrawn.** «Надіслати разом.» One order, one parcel, one delivery charge, dispatched after 14 days. This page is no longer neutral on it: §17.6.6 now carries the add-to-cart disclosure, because the add is the moment the stocked line's terms change ([18](18-checkout-specification.md) §18.8.7) |
