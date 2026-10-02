# 23 — Admin Panel Architecture

> **Round 12 — product admin:** The product editor, templates, shared libraries (sizes, colour palette, materials, patterns, glossary), drafts and publishing, version history, edit lock and stock movements are specified in [37-product-admin-system.md](37-product-admin-system.md), which supersedes §23.6 where they differ.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Whole panel usable on a phone** — the §23.2 'not mobile-first' anti-goal is withdrawn (part 8). Dashboard: new orders, quick orders, unread mail, low stock, custom-size due dates, reviews to moderate. Orders as **cards**; filters status, date, phone/number; «Подзвонити»; «Підтверджено дзвінком» checkbox required before packing; **waybill only** (packing slip removed), batch printing.
> - Product editor: one long page; photos by drag or phone camera; video upload; **automatic translation on save** with MACHINE/HUMAN source tracking; AI description drafts; sheepskin «копія — змінити фото й розмір»; stock edited in the product only; Excel import/export; bulk % price change per category; discounts per product and promo codes.
> - Reviews all moderated by Іван; reports: sales and buyer sources (order attribution); audit history visible to Іван; Telegram to Іван and Любов, including unconfirmed-order reminders. **Leads inbox removed** (§P7a).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Light/dark theme switch** — dark stays the default; the light theme maps the storefront tokens.
> - **Quick-order requests inbox** («Купити в 1 клік») beside Leads, SLA-coloured; «Створити замовлення» converts a request into a real order and sends a payment link.
> - **Telegram notifications** (new order without personal data, quick-order request, new mail thread, weekly report), chat configured in Settings ([00-client-decisions-9.md](00-client-decisions-9.md) §P5.4).
> - **Weekly sales and stock report** in the panel and Telegram. Initial stock is entered by hand — the business keeps a paper notebook today.
> - Roles at launch: Іван Owner; **Любов Administrator**. Suggested later: Warehouse (packer), Photographer + Content Editor, Manager.
> - Newsletter subscriber view removed.


The admin panel is where the business actually lives. The storefront is seen once by a
visitor; the admin is seen forty times a day by the same four people for years. That
asymmetry governs every decision below: the storefront is optimised for first impressions,
the admin is optimised for the four-hundredth impression.

Scope is set by [00-client-decisions-6.md](00-client-decisions-6.md), the highest-authority
document in the blueprint, then by [00-client-decisions-5.md](00-client-decisions-5.md), then by
[00-client-decisions-4.md](00-client-decisions-4.md), then by
[00-client-decisions-3.md](00-client-decisions-3.md), then by
[00-client-decisions-2.md](00-client-decisions-2.md), then by
[00-client-decisions.md](00-client-decisions.md).

**Round 6 removes an admin surface rather than adding one**
([00-client-decisions-6.md](00-client-decisions-6.md)):

| Ruling | Effect on the admin |
|---|---|
| **J1** — a mixed cart ships together as one order | **§23.8.3c is rewritten and the split-pair view is deleted.** No `splitGroupId`, no linkage banner, no cancel-the-sibling prompt, no paired packing slips, no «Частина 1 з 2» header, no split-pair filter in the order list. One purchase is one order, one status, one waybill, one slip. What §23.8.3c specifies instead is the single operational fact the ruling creates: **stocked goods held on the shelf for up to a fortnight** while a custom line is woven, flagged so nobody ships them early |
| **J2** — the return-shipping deposit confirmed | §23.8.3b is unchanged. The mechanic is confirmed with the business reason on record — refused inspections cost the business both legs of carriage — and is **not provisional anywhere in this document**. Its customer-facing copy still awaits approval (§J3 item 1), which is a storefront concern, not an admin one |

**Rounds 4 and 5 change the admin more than any round since the catalogue import returned.** Two
of the seven are new screens; the rest change how existing screens behave, and three of them exist
specifically because staff will otherwise get a decision wrong that the interface could have made
obvious.

| Ruling | Effect on the admin |
|---|---|
| **G2** — 14 days of production before dispatch | `OrderStatus.IN_PRODUCTION` sits between `CONFIRMED` and `PACKING`. **In production and awaiting packing are different queues**, and §23.8.2 keeps them apart: a manager scanning "what do I pack today" must not have twelve days of weaving in the same list |
| **G3** — workshop tours, arranged by phone | **Nothing is built.** §23.2 records the anti-goal explicitly, because a booking module is exactly the feature that gets added by someone being helpful |
| **G4** — a business card already ships in every parcel | §23.9's review queue must make the **unverified** state of card-sourced reviews visible and non-editable, so staff do not "helpfully" mark them verified |
| **H1.1 / H1.2** — made-to-order is prepaid, COD is Ukraine-and-stocked-only | The derived method set is cart-level: any custom-size line removes COD from the whole order. §23.8.3c is where the resulting **mixed order** is made legible — under §J1 above it is one order, not a pair |
| **H1.3** — the return-shipping deposit | §23.8.3b adds the deposit panel, the waive action behind `payments.waive_deposit` ⚠, and the rule that the credit is a system consequence of delivery rather than something staff apply |
| **H2** — 48h quote SLA, 72h validity | §23.8.3a's quote queue surfaces **age against the SLA**, and an expired quote is **re-issuable in one click** rather than becoming a dead order. §23.8.3a also names its default owner: Любов ([00-client-decisions-5.md](00-client-decisions-5.md) §H3) |
| **H3b / H3c** — custom sizing is a per-product toggle, priced by a rate the owner sets | §23.6.4a and §23.6.4b. This is the round's largest new editor surface, and §23.6.4a's **inline warning is the point of it**: staff will not connect "custom size" to "no cash on delivery, fourteen days" on their own |

**Round 3 added two things to the admin**, one small and one operationally significant.

| Ruling | Effect on the admin |
|---|---|
| **F3** — partner goods are sold under the Вівчарик brand | Resolves the open question at §23.20.6. `brand` is now identical on both origins and `manufacturer` is the only field that differs — which makes the difference *harder* to see, not easier. §23.6.3a adds a read-only structured-data preview and an origin-change confirm flow so the `manufacturer` omission is legible at the point of the decision rather than in a Search Console audit months later |
| **F4** — international shipping is quoted per order, buyer pays duties | **A new operational workflow.** §23.8.3a adds the quote panel, two order statuses, a «Потребують прорахунку» queue and a non-removable duty disclosure. This is the round's only genuinely new admin surface, and it is one the client's small team has to actually run — see [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.11 |

Six earlier resolutions also govern this document.

| Ruling | Effect on the admin |
|---|---|
| **§E12** — guest checkout is permanent, no customer accounts ever | There are **no customer-account management screens**. The Клієнти module is a read-only, order-derived view for support (§23.8.6). No password reset, no account suspension, no wishlist administration. |
| **§E5** — products and photographs may be copied from the adjacent site, but that site stays live | The import tooling gains a **duplicate-text guard** (§23.6.9). Reusing the source copy is a ranking risk, not a convenience, so the admin refuses to be the path by which it reaches production. There is still **no SEO migration** — no 301 mapping, no legacy URLs. |
| **§E7** — partner manufacturers cannot be named | `partnerName` survives as an **internal-only** field that is never serialised publicly (§23.6.3). The validation rule that required it is inverted. |
| **§E8** — dye lots are not tracked | The dye-lot admin field is **removed entirely** (§23.6.5). `ProductVariant.dyeLot` stays nullable and unused. |
| **§E6** — the full production cycle including hides is confirmed | All own-manufacture categories — wool, sheepskin, leather — are `OWN_MANUFACTURE`. Any «бельгійська технологія» framing is removed from admin help text; it belonged to the adjacent business. |
| **§E10** — `{{PSP}}` is WayForPay | The reconciliation queue (§23.8.3) is sized against a real acquirer rather than an unknown one, though six WayForPay integration facts remain unverified (§E10 V6–V11). |

From [00-client-decisions.md](00-client-decisions.md), two rulings still stand unchanged. **D3:**
the `ProductOrigin` distinction between own manufacture and partner manufacture is a first-class
field, and the admin's job is to make it impossible to get wrong. **D3/D4:** the catalogue covers
the full business, wool-led, across roughly sixteen live categories, and every one of them is real
stock on day one.

**Catalogue size is now bounded.** `{{SKU_COUNT}}` resolves to whatever the content import yields
— [00-client-decisions-2.md](00-client-decisions-2.md) §E5 puts that at **several hundred to
roughly a thousand SKUs**, confirmed exactly when the export is taken. That is below the ~2,000
threshold at which [25-database-schema.md](25-database-schema.md) §25.10 requires rethinking
Postgres full-text search, so every list, search and faceting design below holds without
load-testing first.

The case for bulk tooling is *strengthened*, not weakened, by the import returning. An import is
not a substitute for the work: §E5 requires **every product description to be rewritten**, names
renamed where they overlap, and category text authored new, because the source site stays live.
So the realistic shape of catalogue population is import the structure, then rewrite the words —
across four locales, by a team of roughly **two owners, one to two managers, one content person,
plus warehouse staff** ([00-assumptions.md](00-assumptions.md) E2,
[00-client-decisions-2.md](00-client-decisions-2.md) §E1). Everything below resolves that in the
same way: **the admin invests in bulk operations and removes per-item ceremony.**

---

## 23.1 Design philosophy

Six principles. They are ordered; when two conflict the lower-numbered one wins.

**1. The catalogue is the workload.**
Populating twelve wool categories plus sheepskin, leather and partner goods, in four locales,
from nothing, means the first six months of admin usage are dominated by data entry,
correction, and re-categorisation — not by order processing.
[00-client-decisions.md](00-client-decisions.md) D5 places exactly this on the project's
critical path. Bulk edit, CSV import with a dry-run diff, and product cloning are therefore
**Phase 1 requirements, not nice-to-haves.** An admin that makes editing one product delightful
and editing two hundred products impossible has solved the wrong problem.

**2. Every screen answers a question someone actually asks.**
The dashboard is the sharpest test. A widget that displays a number nobody acts on is not
neutral — it costs attention, load time, and maintenance. §23.5 states the decision each
widget supports, and a widget that cannot name one is deleted rather than demoted.

**3. Density is a feature, and it is not the same thing as clutter.**
The storefront's spacing rhythm ([11-spacing-system.md](11-spacing-system.md) §11.2) exists to
make a page feel unhurried. Applying it to a 1,000-row product table would mean nine rows per
screen. The admin uses the *compact* density token (`--section-y-sm`) and a 44 px table row,
while keeping the 16 px body-text floor from [10-typography.md](10-typography.md) §10.3 rule 1
— which explicitly extends to the admin panel.

**4. Dangerous actions are slow; safe actions are instant.**
Publishing a price change, refunding money, deleting a role, or running a CSV import over the
live catalogue each pass through an explicit confirm step driven by `Permission.isDangerous`
([25-database-schema.md](25-database-schema.md) §25.7). Everything else — reordering, toggling
a flag, saving a description — is optimistic and silent. Uniform friction trains people to
click through confirmations without reading them, which is worse than no confirmation at all.

**5. The panel is honest about state.**
Draft versus published, translated versus untranslated, reserved versus available, paid versus
awaiting-reconciliation. Ambiguity in an admin surface produces a phone call, and the whole
point of the system is to reduce phone calls.

**6. Motion is minimal by design.**
[13-motion-system.md](13-motion-system.md) §13.11 is binding: nothing in the admin animates
beyond `dur-fast` (140 ms) state changes. No Rise, no Mask, no Lift, no parallax, no shared-
element Morph. Framer Motion is not in the admin bundle at all (§23.19). Delight on visit one
is friction on visit four hundred.

---

## 23.2 Anti-goals — what this deliberately is not

Anti-goals are more useful than goals here, because the failure mode of an admin panel is
always scope, never ambition.

| Anti-goal | Why it is excluded |
|---|---|
| **Not an ERP.** No purchase orders, no supplier ledger, no bill of materials, no production scheduling, no double-entry accounting. | [00-assumptions.md](00-assumptions.md) E3 states no 1C or ERP integration at launch, and the admin is the system of record. A four-person team does not operate an ERP; they operate a spreadsheet, and the honest upgrade from a spreadsheet is Shopify, not SAP. |
| **Not a CRM.** No pipelines, no sequences, no email campaigns, no lead scoring. | Leads are a single-table inbox (§23.13). A wholesale enquiry volume of {{WHOLESALE_LEADS_TARGET}}/month does not justify pipeline software. |
| **Not a page builder.** No drag-and-drop layout canvas, no arbitrary section composition. | A page builder guarantees that [08-design-system.md](08-design-system.md) is violated within a month. Editors get structured fields and a fixed set of homepage slots (§23.12). The design system survives only if the CMS cannot break it. |
| **Not a general-purpose mail client.** No IMAP or SMTP access for phone apps, no user-defined filter rules, no folders beyond the status set, no calendar invites, no mailing lists. | [00-client-decisions-7.md](00-client-decisions-7.md) §K2 moves business mail into the panel (§23.13a). It is a **support inbox attached to orders**, and it is scoped like one: every feature above is a mail-server product in its own right. |
| **Not a BI tool.** No custom report builder, no cohort explorer, no SQL console. | The dashboard answers nine fixed questions (§23.5). Anything deeper is exported to CSV and opened in a spreadsheet, which is a better BI tool than anything we would build. |
| **Not a multi-tenant / multi-store platform.** One brand, one store, four locales. | Multi-store abstraction costs roughly 30% of admin build time and is speculative. [00-client-decisions.md](00-client-decisions.md) D2 settles it: the adjacent family business keeps its own site and is never operated from here. Partner-manufactured goods are a `ProductOrigin` value on a product, not a tenant. |
| **Not a real-time collaborative editor.** No multiplayer cursors, no operational transforms. | Four people rarely edit the same product simultaneously. The cheap, correct answer is optimistic concurrency with a 409 conflict resolver (§23.18), which costs days rather than months. |
| **Not a mobile-first application.** | Except for the warehouse surfaces (§23.17), which genuinely are phone-first. Everything else assumes a laptop, because bulk editing 1,000 SKUs on a phone is not a use case anyone has. |
| **Not themeable.** No per-user colour schemes, no light mode toggle. | Dark, always, per [09-color-palette.md](09-color-palette.md) §9.7. One theme is one thing to test. |
| **Not a booking system.** No calendar, no slots, no visit requests, no availability model — for workshop tours or anything else. | [00-client-decisions-4.md](00-client-decisions-4.md) §G3 confirms visitors may see the workshop **with the owner**, arranged in advance by phone. That is a personal commitment of Іван's time, not a bookable resource. A calendar widget implies capacity that does not exist, produces no-shows nobody chases, and converts the project's single strongest trust asset into a one-star review the first time a slot is honoured badly. The correct implementation is a phone number and «Зателефонуйте, щоб домовитися» on the storefront, and **nothing at all here**. It is listed as an anti-goal rather than omitted silently, because it is precisely the feature someone adds later while being helpful. |

The reference points are **Shopify** (catalogue and order ergonomics), **Notion** (calm density
and keyboard-first navigation), and **Stripe Dashboard** (financial clarity and the treatment
of money as sacred). It is not Magento, not WooCommerce, and not an internal tool generator.

---

## 23.3 Dark premium UI — the admin surface mapping

[09-color-palette.md](09-color-palette.md) §9.7 fixes the decision: the storefront ships light-
only, **the admin is dark by default.** The admin introduces no new hex values. It re-binds the
semantic layer defined in §9.8 and nothing else, which is what makes the two interfaces
demonstrably the same product rather than two products sharing a logo.

```css
/* admin.css — the only file in the admin that touches the token layer */
[data-theme="admin"] {
  --bg-page:        var(--c-forest-950);   /* #0E1A14  app background        */
  --bg-alt:         var(--c-forest-900);   /* #16281F  sidebar, topbar, rails */
  --bg-surface:     var(--c-forest-900);   /* #16281F  cards, table headers   */
  --bg-raised:      var(--c-forest-800);   /* #1F3A2E  modals, popovers, menus */
  --bg-input:       var(--c-forest-950);   /* inputs recede, they do not raise */

  --text-primary:   var(--c-fleece-100);   /* headings, table values          */
  --text-body:      var(--c-fleece-100);
  --text-muted:     var(--c-stone-300);    /* labels, metadata, timestamps    */
  --text-faint:     var(--c-stone-400);    /* placeholders, disabled          */

  --border-hairline: var(--c-forest-600);  /* grouping only — non-interactive */
  --border-control:  var(--c-forest-500);  /* inputs, buttons, checkboxes     */

  --accent:         var(--c-gold-400);     /* #C9A96A                          */
  --accent-text:    var(--c-gold-400);

  --success:        var(--c-emerald-500);
  --warning:        #D4A24C;
  --danger:         #D9705F;
  --info:           var(--c-sky-300);
}
```

### Why two border tokens

On a `forest-950` page, `forest-600` measures ≈2.5:1 — below the 3:1 that WCAG 2.1 §1.4.11
requires for the boundary of a user-interface component. It is fine for a table rule or a card
edge, which carry no meaning on their own, and wrong for the edge of a text input, which does.
Splitting the token is a one-line cost that removes an entire class of accessibility regression;
the alternative — a single border colour — forces a choice between muddy chrome and failing
inputs.

### Measured contrast on the admin surface

Computed from the sRGB values in [09-color-palette.md](09-color-palette.md) §9.8, against
`--bg-page` `#0E1A14`. These are asserted by the same CI check that guards §9.5.

| Foreground | Ratio on `forest-950` | Verdict |
|---|---|---|
| `fleece-100` `#FAF8F4` | ≈16.9:1 | AAA — all primary text, table values |
| `stone-300` `#C6C3BC` | ≈10.3:1 | AAA — labels, metadata, column headers |
| `stone-400` `#9A968D` | ≈6.1:1 | AA — placeholders and disabled text. **Note:** this token is decorative-only on the light storefront (§9.5) and becomes legitimate body-adjacent text on dark. The inversion is why the semantic layer, not the ramp, is what components reference. |
| `gold-400` `#C9A96A` | ≈7.9:1 | AAA — the admin's only accent; active nav, focus ring, primary button fill |
| `sky-300` `#9EC0D8` | ≈9.4:1 | AAA — informational text |
| `warning` `#D4A24C` | ≈7.7:1 | AAA — low stock, awaiting reconciliation |
| `danger` `#D9705F` | ≈5.5:1 | AA — destructive actions, failed payments, validation errors |
| `success` `emerald-500` `#3C8A65` | ≈4.3:1 | **Fails AA for body text.** Restricted to 12 px status dots, icons, chart fills, and ≥24 px text. Status *labels* render in `fleece-100` beside an `emerald-500` dot. |
| `forest-500` `#457A5D` | ≈3.6:1 | Passes 1.4.11 — permitted as a control boundary |
| `forest-600` `#356049` | ≈2.5:1 | Non-interactive rules and card edges only |

The success-colour restriction is the single most likely regression in the admin palette, in
the same way `gold-600` is on the storefront. It is stated here so that "In stock" never ships
as green text on a dark background.

### Typography and density in the admin

| Property | Value | Source |
|---|---|---|
| UI family | `e-Ukraine` / `e-Ukraine Head` for labels and buttons | [10-typography.md](10-typography.md) §10.2 |
| Display family | **Not used.** No `Kyiv*Type Serif` in the admin | Editorial display type in a data table is decoration; it also removes ~40 KB of webfont from the admin payload |
| Mono | `JetBrains Mono` — SKUs, order numbers, IDs, audit entries, API keys, TTN numbers | §10.2 |
| Body floor | 16 px, non-negotiable, including tables | §10.3 rule 1 |
| Table cell | `body-sm` 15 px for secondary columns only; the primary column is 16 px | §10.3 |
| Numerals | `tabular-nums` mandatory on every price, quantity, and count column | §10.6 |
| Table row height | 44 px (`space-3` padding + 16 px line) | [11-spacing-system.md](11-spacing-system.md) §11.7 secondary-target floor |
| Primary action height | 48 px | §11.7 |
| Card radius | `radius-lg` 12 px; **product thumbnails stay `radius-none`** | §11.5 |
| Elevation | `shadow-lg` on modals and drawers only. Cards use `--bg-surface` plus a hairline; shadows on a near-black background are invisible and cost paint | §11.5 |

---

## 23.4 The navigation shell

Two rails and a topbar. The sidebar is grouped by *what the person is doing*, not by database
table, because a warehouse picker and a content editor have no overlapping vocabulary.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ⌘K  Знайти товар, замовлення, клієнта…      [uk ▾]  [⟳ 2]  [🔔 3]  [ОМ  Олег М. ▾] │ 56
├──────────────────────┬──────────────────────────────────────────────────────────────┤
│                      │                                                              │
│  ВІВЧАРИК  ·  admin  │  Каталог  ›  Товари                                          │
│                      │  ────────────────────────────────────────────────────────    │
│  ◆ Панель            │                                                              │
│                      │  ┌────────────────────────────────────────────────────────┐  │
│  КАТАЛОГ             │  │ [Пошук…]  [Категорія ▾] [Статус ▾] [Локаль ▾] [Склад ▾]│  │
│    Товари       312  │  │                                     [Імпорт] [+ Товар] │  │
│    Категорії     16  │  └────────────────────────────────────────────────────────┘  │
│    Опції та атрибути │                                                              │
│    Медіа             │  ┌──┬──────┬───────────────────┬────────┬────────┬─────────┐ │
│                      │  │▢ │ фото │ Назва / SKU       │ Ціна   │ Склад  │ локалі  │ │
│  ПРОДАЖІ             │  ├──┼──────┼───────────────────┼────────┼────────┼─────────┤ │
│    Замовлення     7  │  │▣ │ ▦    │ Ліжник «Черемош» ◆│ 5 300– │  12    │ ●●○○    │ │
│    Звірка оплат   3  │  │  │      │ VCH-LZ-0114       │ 7 300  │        │         │ │
│    Клієнти           │  │▣ │ ▦    │ Гуня вовняна     ◆│ 6 900  │   2 ⚠  │ ●●●○    │ │
│    Ліди           2  │  │▢ │ ▦    │ Пряжа «Карпати»  ⬡│   180  │ 4.2 кг │ ●○○○    │ │
│                      │  └──┴──────┴───────────────────┴────────┴────────┴─────────┘ │
│  КОНТЕНТ             │                                                              │
│    Блог              │  ┌── 2 обрано ─────────────────────────────────────────────┐ │
│    Галерея           │  │ Ціна ▾  Категорія ▾  Статус ▾  Клонувати  Експорт   ✕  │ │  ← bulk bar
│    Банери й герой    │  └─────────────────────────────────────────────────────────┘ │
│    Акції             │                                                              │
│    Відгуки        5  │                                            1–50 з 312  ‹ 1 › │
│                      │                                                              │
│  АНАЛІТИКА           │                                                              │
│    Пошукові запити   │                                                              │
│                      │                                                              │
│  СИСТЕМА             │                                                              │
│    Співробітники     │                                                              │
│    Налаштування      │                                                              │
│    Журнал дій        │                                                              │
│                      │                                                              │
│  ─────────────────   │                                                              │
│  ⚠ Офлайн — 2 у черзі│                                                              │
└──────────────────────┴──────────────────────────────────────────────────────────────┘
   240 px                                                                     fluid
```

Counts in the wireframe are illustrative; the real figure lands somewhere between several hundred
and roughly a thousand ([00-client-decisions-2.md](00-client-decisions-2.md) §E5). **Клієнти is a
read-only module** — it lists order-derived `Customer` records for support lookup and nothing
else, because there are no accounts to administer (§E12, §23.8.6). The `◆` / `⬡` glyph in the name column
is the origin mark — filled for `OWN_MANUFACTURE`, hollow for `PARTNER_MANUFACTURE` — and the
four dots are per-locale translation completeness in `uk en pl de` order (§23.6.8). Note the
stock column reading `4.2 кг` rather than a unit count: yarn, rovnytsia and craft wool are sold
by weight (D4), and the list renders `PricingUnit` rather than assuming pieces.

### Shell rules

1. **Badge counts are actionable only.** `Замовлення 7` means seven orders awaiting a human
   decision, not seven orders in existence. A badge that never reaches zero is trained out of
   a person's perception within a week and becomes worse than absent.
2. **The sidebar is filtered by permission, and it is the only navigation.** Sections the
   signed-in user cannot read are not rendered — but per
   [24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.14, that
   hiding is never the enforcement, only the affordance. A Warehouse user who types
   `/admin/settings` receives a 403 from the API, not a blank page.
3. **Sidebar state persists per user** in `localStorage`, collapsed to a 64 px icon rail on
   viewports below 1280 px, and replaced entirely by a bottom tab bar below 768 px (§23.17).
4. **The locale switch in the topbar is an editing context, not a UI language.** Selecting `pl`
   switches which `*Translation` rows every form field reads and writes. The admin *chrome*
   language follows `StaffUser.locale` and changes only in Settings. Conflating the two is a
   mistake every multilingual CMS makes once, and it causes editors to overwrite Ukrainian
   content with Polish.
5. **The `⟳ 2` topbar indicator** is the offline mutation queue depth (§23.17). It is placed in
   the topbar, not in a toast, because a toast that has already dismissed cannot tell a
   warehouse worker that their last three scans never reached the server.
6. **Breadcrumbs are real navigation**, not decoration: every segment is a link, and the final
   segment carries the entity's human label (`VCH-25-0417`, not `cl9x…`).

---

## 23.5 Dashboard

The dashboard is the screen with the highest ratio of opinion to code, so the rule from §23.1
is applied literally: **every widget names the decision it supports, and a widget that supports
no decision is deleted.** Nine survive.

Refresh strategy is expressed in TanStack Query terms. `staleTime` is how long the cached value
is served without a network request; `refetchOnWindowFocus` is the workhorse, because the real
usage pattern is a manager alt-tabbing back from Nova Poshta or a banking app.

| # | Widget | Data source | Refresh | Decision it supports |
|---|---|---|---|---|
| 1 | **Revenue** — today / 7d / 30d, with the prior period as a delta, `totalMinor` summed over `PAID` and `COD`-delivered orders | `Order` aggregate on `paidAt` + `deliveredAt`, `paymentStatus IN (PAID, PARTIALLY_REFUNDED)` | `staleTime` 5 min, refetch on focus | "Is this month tracking ahead or behind, and do I need to run a promotion?" The delta is the widget; the absolute number alone supports nothing. |
| 2 | **Orders by status** — a horizontal bar of `PENDING / CONFIRMED / IN_PRODUCTION / PACKING / SHIPPED`, each a filter link | `Order` grouped by `status` where `placedAt > now() - 30d` | `staleTime` 60 s, refetch on focus | "What is stuck?" Counts are clickable; the widget's value is that it is a *router into work*, not a report. `IN_PRODUCTION` is a segment rather than a footnote because a fortnight of weaving looks identical to a stalled order in every other view ([00-client-decisions-4.md](00-client-decisions-4.md) §G2). |
| 3 | **Awaiting payment reconciliation** — manual-transfer and bank-transfer orders `UNPAID` for >N hours | `Order` where `paymentMethod IN (BANK_TRANSFER)` or manual-card flag, `paymentStatus = UNPAID` | `staleTime` 60 s, refetch on focus | "Which customers have said they paid but nobody has checked the bank statement?" While card payment is a personal transfer plus a manager phone call, this is the highest-value widget on the board — it is the only place where money that has been *promised* becomes money that has been *received*. It shrinks automatically once WayForPay carries the volume. |
| 4 | **Low stock** — variants at or below `lowStockAt`, one-of-one items excluded | `ProductVariant` where `stockQty <= lowStockAt AND isActive` | `staleTime` 5 min | "What do we need to weave or tan next?" Excluding `isUniquePiece` items matters: a one-of-one lizhnyk at stock 1 is not low stock, it is the product ([00-assumptions.md](00-assumptions.md) B4). |
| 5 | **Latest orders** — last 8, with number, total, method, status, carrier | `Order` ordered by `placedAt desc` | `staleTime` 30 s, refetch on focus | "Did anything come in while I was away, and does it need me?" Row click opens the order; the payment-method column is present specifically so a manual-transfer order is recognisable without opening it. |
| 6 | **Top products, 30 days** — units and revenue, top 8 | `OrderItem` grouped by `sku`, joined to current `Product` for the thumbnail | `staleTime` 1 h | "What do we photograph again, promote, restock, and put in the hero?" Grouped by snapshot `sku` rather than live `variantId`, because §25.5 makes `variantId` nullable and a deleted variant must not silently drop out of the ranking. Each row carries the origin mark, so a partner product outselling own manufacture is legible immediately — that is a merchandising signal and a brand-risk signal at the same time ([00-client-decisions.md](00-client-decisions.md) D3). |
| 7 | **Visitors** — sessions, 7-day sparkline, top 3 sources | Analytics provider, server-proxied ([31-analytics-architecture.md](31-analytics-architecture.md)) | `staleTime` 15 min | "Is the traffic problem or the conversion problem the reason revenue moved?" Only meaningful directly beside widget 8 — the two are rendered as a pair and are never separated. |
| 8 | **Conversion rate** — orders ÷ sessions, 7d vs prior 7d | Computed from widgets 1 and 7 on the server | `staleTime` 15 min | Same question, other half. A falling rate with flat traffic points at the site; flat rate with falling traffic points at acquisition. |
| 9 | **Announcements & quick actions** — a pinned internal notice plus six buttons | `Setting` key `admin.announcement`; actions are static routes | On mount | "What did the owner tell everyone this week, and what is the one thing I came here to do?" The notice is how a four-person team distributes an operational instruction without a group chat. |

### Deliberately excluded widgets

| Rejected | Why |
|---|---|
| Live visitor counter | Supports no decision. Nobody changes anything because the number is 14. |
| Abandoned-cart count | No recovery flow at launch, so the number produces guilt, not action. Add it with the flow, not before. |
| Average order value | Already visible as revenue ÷ orders; a second tile for a derived number is clutter. It belongs in the export. |
| Review rating average | Slow-moving by construction. It belongs on the reviews screen, not on a board scanned daily. |
| Revenue goal / target ring | There is no agreed target ({{REVENUE_TARGET}} unconfirmed). A progress ring against an invented number is theatre. |

### Layout and behaviour

```
┌─────────────────┬─────────────────┬─────────────────┬──────────────────┐
│ Дохід           │ Замовлення      │ Відвідувачі     │ Конверсія        │
│ 184 200 ₴       │ ▓▓▓▓▓░░ 7 нових │ 2 418           │ 1.9 %            │
│ ▲ 12 % до 30 дн │ 3 пакується     │ ▁▂▄▃▆▅▇         │ ▼ 0.3 pp         │
├─────────────────┴─────────────────┼─────────────────┴──────────────────┤
│ ⚠ Очікують звірки оплати      3   │ Закінчується на складі        6    │
│ VCH-25-0417  9 800 ₴   18 год     │ Плед «Золото Карпат» 200×220  2    │
│ VCH-25-0411  5 300 ₴   2 дні  ⚠   │ Шкарпетки, 39–41              1    │
├───────────────────────────────────┼────────────────────────────────────┤
│ Останні замовлення                │ Топ товарів за 30 днів             │
│ …                                 │ …                                  │
├───────────────────────────────────┴────────────────────────────────────┤
│ 📌 Оголошення — до 5 жовтня всі замовлення з Косова пакуємо до 15:00    │
│ [+ Товар] [Імпорт CSV] [+ Замовлення] [Звірка] [Друк ТТН] [+ Стаття]   │
└────────────────────────────────────────────────────────────────────────┘
```

Widgets are **fetched in one batched request** (`GET /admin/dashboard?widgets=…`), not nine
parallel requests, so a first paint costs one round trip on a rural 3G connection. Each widget
renders a skeleton of its exact final height ([13-motion-system.md](13-motion-system.md) §13.9)
and fails independently: a dead analytics provider greys out widgets 7 and 8 with a retry
affordance and leaves the other seven intact. A dashboard that fails as a unit is a dashboard
that gets bypassed.

Per-widget visibility follows permissions: a Warehouse user sees widgets 2, 4, 5 and 9 only,
because `analytics.read_revenue` is not in that role
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.5).

---

## 23.6 Products module

The largest module by build cost and by daily usage. It is specified in the order a person
encounters it.

### 23.6.1 List view

A virtualised table (TanStack Table + TanStack Virtual) over a server-paginated, server-sorted
query. Client-side sorting of a catalogue is a bug waiting for the catalogue to grow; the
sort is always a `ORDER BY` against an index from
[25-database-schema.md](25-database-schema.md) §25.3.

| Column | Source | Notes |
|---|---|---|
| Selection | — | Shift-click ranges; `select all matching filter` is distinct from `select all on page` and says so in words |
| Thumbnail | `ProductMedia` where `role = PRIMARY` | 40 px, `radius-none`, blurhash placeholder |
| Name / SKU | `ProductTranslation` in the editing locale + `Product.sku` | SKU in mono. Falls back to `uk` with a dotted underline when the editing locale has no row (§25.2 fallback rule) |
| Origin | `Product.origin` | `◆` own / `⬡` partner, with `partnerName` on hover |
| Price | `priceMinMinor`–`priceMaxMinor`, `tabular-nums` | Range collapses to a single value when equal |
| Stock | Sum of `ProductVariant.stockQty`, or total weight for `KILOGRAM`/`SKEIN` units | `⚠` at or below `lowStockAt`; `∞` when `allowBackorder` |
| Locales | Derived completeness (§23.6.8) | Four dots, `uk en pl de` |
| Status | `Product.status` | Chip: DRAFT / ACTIVE / ARCHIVED |

Filters: category, status, origin, locale-incomplete, stock state, price range, handmade,
unique piece, made-to-order, **custom size allowed**, **custom-size rate missing**, pricing unit,
created/updated range. The last of those is the one that earns its place: a product with
`allowsCustomSize` and a null rate is unpublishable (§23.6.4b), so the filter is how an editor
finds the products that are one field away from being live. **Filter state lives in the
URL query string**, not in component state — so a manager can paste "all partner products
missing German" into a chat message and the recipient sees the same 23 rows. This single
decision removes an entire class of support conversation.

### 23.6.2 Product editor

Two columns on desktop, stacked below 1024 px. The left column is content, the right column is
state. This split exists because content editing is a long, exploratory task and state changes
are short, decisive ones; mixing them causes accidental publication.

```
┌───────────────────────────────────────────────┬──────────────────────────────┐
│  ‹ Товари    Ліжник «Черемош»       [Зберегти]│  СТАТУС                      │
│                                                │  ◉ Чернетка  ○ Активний     │
│  ┌ Локаль ─────────────────────────────────┐  │  ○ В архіві                  │
│  │ [uk ●] [en ●] [pl ○] [de ○]             │  │  Опубліковано: —             │
│  └─────────────────────────────────────────┘  │                              │
│                                                │  ПОХОДЖЕННЯ                  │
│  Назва          [Ліжник «Черемош»          ]  │  ◉ Власне виробництво        │
│  URL            /uk/lizhnyk-cheremosh   [✎]   │  ○ Партнерське               │
│  Опис           [ rich text ……………………… ]      │                              │
│                                                │  КАТЕГОРІЇ                   │
│  ┌ Медіа ──────────────────────────────────┐  │  ☑ Вовна › Ліжники           │
│  │ [▦ PRIMARY] [▦] [▦] [▦] [+ Завантажити] │  │  ☐ Партнерські вироби        │
│  └─────────────────────────────────────────┘  │                              │
│                                                │  ПРОВЕНАНС                   │
│  ┌ Варіанти (6) ───────────────────────────┐  │  Вовна    [Косівщина      ]  │
│  │ розмір × колір            [Редагувати]  │  │  Мікрон   [        28     ]  │
│  └─────────────────────────────────────────┘  │  Етапи    ☑ прання ☑ чесання │
│                                                │           ☑ прядіння ☑ ткання│
│  ┌ Характеристики ─────────────────────────┐  │                              │
│  │ Склад      100% вовна                   │  │  ОЗНАКИ                      │
│  │ Догляд     ручне прання, 30°            │  │  ☑ Ручна робота              │
│  └─────────────────────────────────────────┘  │  ☐ Унікальний виріб          │
│                                                │  ☑ Індивідуальний розмір     │
│  ┌ SEO ────────────────────────────────────┐  │  ⚠ лише передоплата, 14 днів │
│  │ Title / Description / порожньо = авто   │  │  Ставка  [  1 800 ] ₴/м²     │
│  └─────────────────────────────────────────┘  │  Мінімум [    900 ] ₴        │
│                                                │  Верстат  100–200 × 120–300  │
│                                                │                              │
│                                                │  [Клонувати] [В архів]       │
└───────────────────────────────────────────────┴──────────────────────────────┘
```

Saving is **explicit**, not autosave. Autosave in a product editor means a half-typed price
reaches a live storefront, and the storefront is where money is. A dirty-state guard blocks
navigation, and the draft is mirrored to IndexedDB so a closed tab loses nothing (§23.17).

### 23.6.3 Origin and partner attribution

[00-client-decisions.md](00-client-decisions.md) D3 makes `ProductOrigin` a first-class field
and the admin enforces it at four points:

1. **`partnerRegion` is requested when `origin = PARTNER_MANUFACTURE`; `partnerName` is not
   required and is never public.** See the ruling below — this reverses the previous rule.
2. **The provenance block is disabled for partner products.** `woolOrigin`, `woolMicron` and
   `productionStage[]` grey out with the explanation "ці поля описують власне виробництво". An
   editor cannot accidentally assert in-house carding on a bought-in blanket, which would be
   both a trust failure and a structured-data violation.
3. **Merchandising surfaces refuse partner products.** The homepage hero picker, the
   best-seller rail and the production storytelling blocks filter `origin = OWN_MANUFACTURE` at
   the query level and show a disabled row with the reason, rather than silently omitting it —
   an editor who cannot find a product they expect will file a bug otherwise.
4. **Bulk-changing origin is a dangerous action.** It re-writes `Product.manufacturer` in
   structured data for every affected product, so it passes through the confirm step and writes an
   `AuditLog` entry per product, not per batch.
5. **The structured-data consequence of the origin field is shown, not documented.** New in round
   3 — see §23.6.3a.

#### The brand question is settled: Вівчарик on both origins

[00-client-decisions-3.md](00-client-decisions-3.md) F3 answers §E13.5 — «Так, продаються під
брендом Вівчарик» — and closes the last variable in this field group. The exact rule the admin
must make legible:

```
OWN_MANUFACTURE      →  brand = Вівчарик,  manufacturer = Вівчарик
PARTNER_MANUFACTURE  →  brand = Вівчарик,  manufacturer = OMITTED ENTIRELY
```

`manufacturer` is never set to Вівчарик on a partner product and never set to a placeholder.
`brand` is now identical on both, which removes a conditional from the serialiser
([29-seo-architecture.md](29-seo-architecture.md) §29.6) and **adds a hazard to the admin**: the
two fields used to differ visibly by origin, and now only one of them does. An editor looking at a
partner product sees the Вівчарик brand exactly as they would on an own-manufacture product, and
the only difference is a property that is not there. Absence is the hardest thing for an interface
to communicate, which is why the next subsection exists.

### 23.6.3a The structured-data preview, and making an omission visible

The editor carries a **read-only structured-data panel** in the product editor's right rail,
collapsed by default, showing the `Product` node exactly as the public serialiser will emit it for
the currently selected locale. It is generated by calling the same serialiser the SSR renderer uses
— not a re-implementation, for the reason [29-seo-architecture.md](29-seo-architecture.md) §29.4
gives about meta generation: a preview that diverges from production is a defect class that is only
discovered months later, in Search Console.

```
┌ Структуровані дані (Schema.org) ────────────────────── uk ▾ ─ [✕] ┐
│                                                                   │
│  "@type":        "Product"                                        │
│  "name":         "Ліжник «Черемош»"                               │
│  "brand":        { "name": "Вівчарик" }                    ✓      │
│  "manufacturer":  — не вказано —                           ⬡      │
│  "countryOfOrigin": "UA"                                          │
│  "additionalProperty": [                                          │
│     { "Виробництво": "Відібрано Вівчариком. Виготовлено           │
│                       карпатським майстром" }                     │
│     { "Регіон виготовлення": "Косівщина" }                        │
│  ]                                                                │
│                                                                   │
│  ⬡ Партнерський виріб. Поле «виробник» не публікується —          │
│    ми не виготовляли цей товар. Бренд — Вівчарик.                 │
│                                                                   │
│                              [Перевірити в Rich Results Test ↗]   │
└───────────────────────────────────────────────────────────────────┘
```

Three deliberate choices in that panel:

1. **The omitted property is rendered as a row**, with «— не вказано —» and the hollow origin mark,
   rather than being absent from the preview. A property that is missing from a JSON preview is
   invisible; a property shown as explicitly not-stated is a fact the editor can read. This is the
   one place in the admin where **showing something that will not be published is the correct
   design**, and it is worth the inconsistency.
2. **The explanatory line states the reason, not the rule.** «Ми не виготовляли цей товар» is a
   sentence an editor can evaluate against what they know about the product. «`manufacturer` is
   omitted for `PARTNER_MANUFACTURE`» is a sentence they can only obey.
3. **It is read-only.** There is no edit affordance anywhere in the panel. The structured data is
   derived from the fields above it, and an editable JSON view is an invitation to produce markup
   that contradicts the page — which is both a Google policy violation and precisely the failure
   the origin field exists to prevent.

#### The origin-change flow

Changing `Product.origin` on a published product is the single highest-consequence field edit in
the admin, because it silently rewrites a claim about who made the goods. It is therefore not a
plain select. Changing it on a published product opens a confirm dialog that states the
consequence in both directions:

**Partner → own manufacture:**

> Ви позначаєте товар як **власне виробництво**.
>
> - У структурованих даних з'явиться `manufacturer: Вівчарик` — публічне твердження, що ми
>   виготовили цей товар.
> - Стануть доступними поля походження вовни, тонини та етапів виробництва.
> - Товар зможе з'являтися на головній, у виробничих блоках і в добірці найкращого.
>
> Підтверджуйте лише якщо цей товар справді виготовлено на нашому виробництві.

**Own manufacture → partner:**

> Ви позначаєте товар як **партнерський**.
>
> - З структурованих даних буде **прибрано** `manufacturer`. Бренд «Вівчарик» залишиться.
> - Поля походження вовни, тонини та етапів виробництва будуть очищені — **дані буде втрачено**.
> - Товар зникне з головної, виробничих блоків і добірки найкращого.
> - На сторінці товару з'явиться позначка «Відібрано Вівчариком».
>
> Потрібно вказати регіон виготовлення.

Rules around the dialog:

- **The direction matters and the two texts differ**, because the risks differ. Partner → own is a
  *false claim* risk; own → partner is a *data loss* risk. A single generic "are you sure" serves
  neither.
- **The provenance fields are cleared on the switch to partner, and the clearing is announced
  before it happens.** Silently retaining them so they reappear if the editor switches back would
  mean a partner product carrying dormant own-manufacture data — one serialiser bug away from being
  published. Clearing is the safer state and the dialog makes the trade explicit.
- **The structured-data panel auto-expands on the first origin change in a session**, so the
  consequence is seen once rather than described. After that it stays at whatever state the editor
  left it.
- **`AuditLog` records the transition with both values**, per product. The structured-data
  consequence of an origin change is exactly the kind of thing that gets questioned six months
  later when a product page is audited.
- **Bulk origin changes route through the same copy**, with the affected count, and are `isDangerous`
  ([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.5).

The principle behind all of it: **a field whose only visible effect is on markup the editor never
sees is a field the editor will get wrong.** The panel and the dialog exist to move the consequence
from a specification document into the moment of the decision, which is the only place it changes
anyone's behaviour.

#### `partnerName` — retained as internal-only, not removed

[00-client-decisions-2.md](00-client-decisions-2.md) §E7 answers «Чи можна називати партнерів?»
with **«Ні.»** That invalidates the previous rule requiring the field, and leaves a choice: drop
the admin field, or keep it and forbid it from ever rendering publicly. **Keep it, internal-only.**

| Option | Consequence | Verdict |
|---|---|---|
| Remove the field from the admin | The one person who knows which workshop supplied a batch stops recording it. Six months later a quality complaint arrives about a partner blanket and nobody can trace the supplier. | Rejected |
| Keep it, with a note in the help text | Relies on a developer reading a note before writing a serialiser. Notes do not survive contact with a deadline. | Rejected |
| **Keep it, internal-only, enforced in the serialiser** | The operational value is preserved and the disclosure risk is removed by construction | **Chosen** |

The enforcement is structural rather than advisory, which is the whole point:

- The **public product serialiser has no `partnerName` field at all**
  ([26-api-architecture.md](26-api-architecture.md) §26.10.1). It is not conditionally omitted; it
  is absent from the type. A UI cannot render a value it was never sent, and a developer cannot
  accidentally add it back without editing a schema that fails a contract test.
- The admin field carries a permanent inline marker — «Внутрішнє. Не відображається на сайті» —
  on the same amber surface used for `Order.internalNote` (§23.8.6), so the two internal-only
  fields in the product look alike deliberately.
- It is readable only through `/v1/admin/products/:id` and appears in the CSV export, which is
  itself behind `products.export`.

**`partnerRegion` is the public field and is used.** «Косівщина», «Гуцульщина» — regional
provenance without a company name is still meaningful and still honest, and it is what the public
label «Виготовлено карпатським майстром» is derived from. The editor therefore prompts for
`partnerRegion` on every partner product and reports blanks in the import dry-run, because the
region is the disclosure that can actually be made.

What does **not** soften is the labelling rule. Per [01-brand-strategy.md](01-brand-strategy.md)
§1.7b, not being able to name the partner is a reason to be *more* explicit that the item is not
own-made, not less. The partner mark stays at equal visual weight to «Власне виробництво», and
the origin facet stays pinned at the top of the storefront filter panel. The admin's job is
unchanged: make `origin` impossible to get wrong.

### 23.6.4 Variant editor — the four-axis option model

Four axes are required — `size`, `color`, `composition`, `weight` — but no family uses all
four, and [25-database-schema.md](25-database-schema.md) §25.3 deliberately models options
generically rather than as four columns. The editor mirrors that: **the product declares which
axes it uses, then generates the matrix.**

```
┌ Варіанти ─────────────────────────────────────────────────────────────────┐
│  Осі:  ☑ Розмір   ☑ Колір   ☐ Склад   ☐ Щільність          [+ нова вісь]  │
│                                                                            │
│  Розмір  [150×200 ✕] [200×220 ✕] [+ значення]                             │
│  Колір   [◧ Сірий ✕] [◧ Беж ✕] [◧ Вохра ✕] [+ значення]                   │
│                                                                            │
│  6 комбінацій                    [Згенерувати]  [Заповнити вниз ▾]         │
│  ┌──────────────┬─────────┬────────┬───────┬────────┬─────────┬─────────┐ │
│  │ Варіант      │ SKU     │ Ціна   │ Склад │ Вага г │ Штрих-  │ Фото    │ │
│  ├──────────────┼─────────┼────────┼───────┼────────┼─────────┼─────────┤ │
│  │ 150×200 Сірий│ …-01-GR │  5 300 │  4    │  1 400 │ 482…    │ [▦]     │ │
│  │ 150×200 Беж  │ …-01-BG │  5 300 │  3    │  1 400 │ 482…    │ [▦]     │ │
│  │ 200×220 Сірий│ …-02-GR │  7 300 │  2 ⚠  │  2 150 │ 482…    │ [▦]     │ │
│  └──────────────┴─────────┴────────┴───────┴────────┴─────────┴─────────┘ │
│  ☐ Приховати неактивні            3 з 6 неактивні                          │
└────────────────────────────────────────────────────────────────────────────┘
```

Rules that make this survive real use:

- **Generation is additive and never destructive.** Adding a colour creates the missing
  combinations and leaves existing rows untouched. Removing an option value sets
  `isActive = false` on the affected variants rather than deleting them, because a deleted
  variant orphans `OrderItem.variantId` (§25.5 sets it null) and loses stock history.
- **A combinatorial guard.** Four axes with six values each is 1,296 variants — a number that
  will be reached by accident, not by intent. Generation above {{MAX_VARIANTS}} (default 200)
  requires an explicit confirmation naming the count. Above 1,000 it is refused, with the
  suggestion to split the product.
- **SKU generation is a template**, `{{SKU_PATTERN}}`, with per-row override. The pattern is
  suggested and editable, never silently applied, because SKUs travel into the warehouse and
  onto printed labels.
- **Fill-down** operates on a selected column range: set one price, apply to the selection.
  This is the single feature that makes a 40-variant product tolerable to enter.
- **Price edits recompute `priceMinMinor`/`priceMaxMinor` server-side inside the same
  transaction** (§25.10.3). The admin never writes the denormalised fields; it would drift
  within a week.
- **The swatch is a photograph, not a hex.** `OptionValue.swatchMediaId` takes precedence over
  `hex` in both admin and storefront, because dyed wool photographs correctly and renders
  badly as a flat colour.

### 23.6.4a Custom sizing — the toggle, and the warning it must carry

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b resolves how made-to-measure is modelled,
and the resolution is subtler than the field suggests. **Made-to-order is not a property of the
product. It is a property of which size the customer picks.**

| | Ліжник 150×200 | The same ліжник, 180×240 |
|---|---|---|
| Stock | On the shelf | Does not exist |
| Dispatch | Next working day | After 14 days of production ([00-client-decisions-4.md](00-client-decisions-4.md) §G2) |
| Cash on delivery | Available | **Not offered** ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.1) |

One product, two completely different purchases. `Product.allowsCustomSize`
([25-database-schema.md](25-database-schema.md) §25.3) is the admin toggle that opens the second
one; `madeToOrderDays` applies **only** to that configuration, and standard variants keep normal
stock behaviour and stay eligible for cash on delivery.

#### The inline warning is the feature

Enabling the toggle silently removes cash on delivery for that configuration and commits the
workshop to a fortnight of labour. **Staff will not connect those two facts on their own** — one
is a payment rule and the other is a production rule, and nothing in a checkbox labelled
«Індивідуальний розмір» suggests either. So the consequence is stated inline, beside the control,
in the words [00-client-decisions-5.md](00-client-decisions-5.md) §H3b specifies:

```
┌ ОЗНАКИ ──────────────────────────────────────────────────────────┐
│  ☑ Ручна робота                                                   │
│  ☐ Унікальний виріб                                               │
│                                                                    │
│  ☑ Індивідуальний розмір                                          │
│    ⚠ Індивідуальний розмір — лише повна передоплата,              │
│      14 днів виготовлення.                                        │
│      Стандартні розміри цього товару не змінюються:               │
│      наложений платіж з оглядом для них залишається.              │
└────────────────────────────────────────────────────────────────────┘
```

Four decisions in that block, each of which the obvious alternative gets wrong:

1. **It is inline and permanent, not a confirmation dialog.** §23.1 principle 4 reserves the
   confirm step for dangerous actions, and uniform friction trains people to click through
   confirmations without reading them. A warning that is *always visible beside the checked box*
   is read by the person who did not check it — the colleague editing the product three months
   later, who is the one who actually needs it.
2. **The second sentence exists because the first one is alarming on its own.** Without «Стандартні
   розміри цього товару не змінюються», a cautious editor reads the warning as "this product is now
   prepaid-only" and leaves the toggle off on exactly the products that should have it. The warning
   has to bound its own scope or it suppresses the feature. **Its scope is the product, not the
   cart**: a standard size ordered on its own keeps cash on delivery, but a cart that *also* holds
   a custom-size line loses it for the whole order, because that order ships as one prepaid parcel
   ([00-client-decisions-6.md](00-client-decisions-6.md) §J1, §23.8.3c). The warning does not say
   so, deliberately — it is a product-editor control and a sentence about cart composition would
   be true only sometimes and unactionable here.
3. **It states the consequence, not the mechanism.** «Лише повна передоплата» is a fact an editor
   can evaluate against what they know about the product. «`madeToOrderDays` disables `PaymentMethod.COD`
   in the derived method set» is a sentence they can only obey — the same reasoning §23.6.3a applies
   to the `manufacturer` omission.
4. **The toggle sits in ОЗНАКИ, beside `isUniquePiece`, not in a separate panel.** These are the
   three flags that change what kind of purchase the product is. Separating them by screen region
   would mean an editor could set the custom-size flag without ever seeing that the product is also
   marked one-of-one, which is a contradiction the form should make visible rather than accept.

The toggle requires `products.manage_custom_size`
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4) and stops
at Manager. It writes `product.custom_size.toggled` to the audit log with both values.

#### Dimensions on the order line and on paper

`OrderItem.customSpec` ([25](25-database-schema.md) §25.5) carries the dimensions the customer
specified, snapshotted like every other order line field. It is rendered in two places and both
are mandatory:

- **On the admin order line**, inline after the variant options — `Ліжник «Черемош», свій розмір
  180 × 240 см` — never behind a disclosure. A line that looks like a standard size until someone
  expands it is a line that gets packed as a standard size.
- **On the printed packing slip** (§23.8.5). A weaver needs the measurements, and the packing slip
  is the document that travels with the work. This is the one case where the slip carries
  information the customer already knows and the workshop does not.

### 23.6.4b Custom-size pricing — the owner sets the rate, the system does the arithmetic

[00-client-decisions-5.md](00-client-decisions-5.md) §H3c closes the open question this document
previously carried. The client's answer separates cleanly: **the owner sets the rate in the admin,
the system computes the price from it.** Nobody quotes by hand, nobody waits, and the owner never
loses control of pricing.

```
area_m2 = (widthCm × lengthCm) / 10 000
raw     = area_m2 × customSizeRatePerSqmMinor
price   = max(raw, customSizeMinPriceMinor)          rounded to whole ₴
```

The panel appears **under** the §23.6.4a toggle and is **required once that toggle is on**.

```
┌ Індивідуальний розмір ───────────────────────────────────────────────┐
│  Ставка за м²          [   1 800 ] ₴     успадковано з категорії ⓘ   │
│  Мінімальна ціна       [     900 ] ₴                                  │
│                                                                       │
│  Ширина     від [ 100 ] до [ 200 ] см    ← максимальна ширина верстата│
│  Довжина    від [ 120 ] до [ 300 ] см    ← максимальна довжина рами   │
│                                                                       │
│  ┌ Перевірка ціни ─────────────────────────────────────────────────┐ │
│  │  180 × 240 см  =  4,32 м²  ×  1 800 ₴  =   7 776 ₴              │ │
│  │  100 × 120 см  =  1,20 м²  ×  1 800 ₴  =   2 160 ₴              │ │
│  │   40 ×  40 см  →  нижче мінімуму, буде продано за   900 ₴       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ⓘ Мінімальна ціна існує тому, що налаштування верстата коштує       │
│    однаково для великого й для маленького виробу.                    │
└───────────────────────────────────────────────────────────────────────┘
```

Five requirements, each preventing a specific failure rather than expressing a preference.

**1. The rate is mandatory once `allowsCustomSize` is on, and the enforcement is a validation
error.** Saving the toggle with a null `customSizeRatePerSqmMinor` or a null bound is rejected at
the form and again at publish
([26-api-architecture.md](26-api-architecture.md) §26.10.1a, `422 CUSTOM_SIZE_RATE_REQUIRED`). A
silent null would publish a PDP whose size selector offers «Свій розмір» and then cannot produce a
price — a dead end the customer discovers and the business does not.

**2. The live preview is not a nicety.** Setting a per-square-metre rate blind is how a product
ends up priced at 40 000 ₴ and nobody notices until either a customer complains or, far more
likely, nobody buys and the reason is invisible. Three worked examples — the largest permitted
size, the smallest, and one below the floor — turn an abstract rate into three numbers the owner
can recognise as right or wrong at a glance. They recompute as the field is typed, using the same
`priceCustomSize` implementation the storefront and checkout call
([26](26-api-architecture.md) §26.10.1a), so the preview cannot disagree with the price.

**3. The bounds are labelled as physical limits, because that is what they are.** «Максимальна
ширина верстата», not «Максимальна ширина». The loom width is a fact about the equipment, and an
editor who reads the field as a preference will widen it to capture a sale. What follows is an
order that is paid, prepaid in full, and cannot be woven — and the cancellation happens after the
money moved. The inline hint states the failure, not the rule: «Ширший виріб неможливо виткати —
замовлення доведеться скасувати після оплати».

**4. The minimum price carries its own explanation.** A floor with no stated reason reads as
arbitrary and gets set to zero by the next person. «Налаштування верстата коштує однаково для
великого й для маленького виробу» is a sentence about the workshop, and an owner who has warped a
loom will recognise it immediately.

**5. Rate changes are a pricing action and are never retroactive.** The rate and the floor require
`products.manage_price`, not `products.update`
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4); the
toggle and the four bounds require `products.manage_custom_size`. Every change writes
`product.custom_size.rate_changed` with both values. **Orders already placed are untouched** —
`OrderItem.unitPriceMinor` is a snapshot like every other order line, and a rate corrected in
November must not restate a September order.

#### Category defaults: copied on create, never referenced at runtime

[00-client-decisions-5.md](00-client-decisions-5.md) §H3c settles inheritance, and the ruling is
about *when* the value is read rather than *whether* it is convenient.

`Category.defaultCustomSizeRatePerSqmMinor` ([25](25-database-schema.md) §25.2) exists **only to
pre-fill the field when a product is created**. The value is then copied into the product row and
lives there. `Product.customSizeRatePerSqmMinor` is the sole source of truth at pricing time, and
nothing reads the category rate when an order is priced.

| Model | What happens when the owner edits the category rate |
|---|---|
| **Copy on create — chosen** | Nothing. Existing products keep their own stored rate. Only newly created products pick up the new default. |
| Live fallback — rejected | **Every product that never overrode the rate is silently repriced**, including ones deliberately priced months ago by someone who left the field alone because the inherited value happened to be right. |

The rejected model fails for a reason worth stating precisely, because it is the reason and not
merely an objection: **a product whose rate is correct by inheritance is indistinguishable from one
whose rate is correct by decision.** Under live fallback, an owner adjusting a category rate cannot
know which of the thirty affected products they are actually repricing, and neither can the audit
log. Storing the value removes the ambiguity — if the number is in the product row, someone
accepted it.

Two admin requirements follow directly, and neither is optional.

**Provenance is shown on the field.** The rate input carries a marker: «успадковано з категорії»
until the owner changes it, then «встановлено вручну». Without it nobody can tell which rates were
chosen and which were merely inherited, which is exactly the ambiguity copy-on-create exists to
remove — storing the value fixes the *pricing* hazard, and the marker is what fixes the *legibility*
one. The marker is derived, not stored: a product whose rate equals the category default and whose
audit history contains no `product.custom_size.rate_changed` row is inherited; anything else was
set. Clicking it offers «Повернути до ставки категорії».

**Editing a category rate offers an explicit bulk apply.** Saving a new
`defaultCustomSizeRatePerSqmMinor` opens a separate, separately confirmed step:

```
┌ Ставка категорії змінена ────────────────────────────────────────────┐
│  Вовна › Ліжники:   1 650 ₴/м²  →  1 800 ₴/м²                        │
│                                                                       │
│  Нові товари в цій категорії отримають нову ставку.                  │
│  Наявні товари НЕ змінюються.                                        │
│                                                                       │
│  14 товарів досі мають успадковану ставку 1 650 ₴/м².                │
│  6 товарів мають власну ставку і не будуть змінені.                  │
│                                                                       │
│  ☐ Застосувати нову ставку до цих 14 товарів                         │
│                                   [Не застосовувати]  [Застосувати]   │
└───────────────────────────────────────────────────────────────────────┘
```

Opt-in, never automatic, never silent, and the affected count is shown before it runs. It is a
bulk price change and is governed as one: `products.manage_price`, `isDangerous`, one `AuditLog`
row per affected product sharing an `auditBatchId`, revertible in one click (§23.6.7). The
distinction the dialog draws — fourteen inherited, six overridden, only the inherited ones offered
— is the entire practical payoff of storing the value rather than resolving it, and it is why this
dialog can exist at all.

#### What was rejected: a percentage uplift over the nearest standard size

Recorded because it is the design most shops reach for first. It prices a 180×240 order by
reference to 150×200 — a size the customer did not choose — and the uplift has to grow
non-linearly to stay honest as the piece gets larger, so the owner ends up tuning a multiplier
against an outcome instead of setting a number they understand. Rate-per-square-metre matches how
the cost is actually incurred, in wool consumed and loom hours, which is what makes it a figure the
owner can reason about and defend.

### 23.6.5 Weight-priced products

Three confirmed categories — вовняна пряжа, ровниця, вовна для рукоділля — are sold by weight
([00-client-decisions.md](00-client-decisions.md) D4). The editor switches behaviour on
`Product.pricingUnit`:

| `PricingUnit` | Price field label | Stock field | Variant axes typically used |
|---|---|---|---|
| `PIECE` | Ціна за штуку | шт | size, color |
| `KILOGRAM` | Ціна за кг | кг, one decimal | color, composition |
| `SKEIN` | Ціна за моток | мотків + г у мотку | color, weight |
| `METRE` | Ціна за метр | м | color, composition |

The needleworker audience buys by **колір + метраж + товщина**, and the editor's axis model
(§23.6.4) covers all three.

#### Dye lots: resolved as NOT tracked — the admin field is removed

[00-client-decisions-2.md](00-client-decisions-2.md) §E8 closes
[00-client-decisions.md](00-client-decisions.md) D6.3. The client's answer was «Не знаю», which is
read as *not tracked* — the safe reading, because a lot number nobody records is worse than no lot
number at all.

Consequently, and completely:

| Surface | Position |
|---|---|
| Admin dye-lot field | **Removed.** No attribute definition, no variant-grid column, no import column. The earlier design placing it on `ProductAttributeValue` is withdrawn. |
| `ProductVariant.dyeLot` | Stays in the schema, **nullable and unused** ([25](25-database-schema.md) §25.3). Removing the column would be premature if the business later starts recording lots; populating it through a UI would not. |
| Storefront facet | None |
| PDP display | None |
| Cart constraint | None ([26](26-api-architecture.md) §26.10.3) |

Leaving a nullable column with no editor is the deliberate middle position. An admin field invites
someone to fill it in inconsistently for six months, which produces exactly the false confidence —
"this yarn says lot 47" — that a real lot guarantee would have prevented. The column costs nothing
and preserves the migration path.

The underlying customer problem is real and is solved in copy instead. The yarn PDP carries
«Відтінок може незначно відрізнятися між партіями. Для великого проєкту радимо замовити всю
кількість одразу.» That is useful advice rather than a disclaimer, it reads as expertise, and it
reduces the same returns a lot-tracking system would have. Revisit only if returns data shows lot
mismatch becoming a measurable cost.

### 23.6.6 Media management

Media is a first-class entity (§25.4), so the admin treats it as one rather than as file
uploads attached to products.

- **Upload** is direct-to-Cloudinary with a signed upload preset; the file never passes through
  the API server. On a rural connection, proxying uploads through Node doubles the time and
  gives the server nothing useful.
- **On ingest the server records** `width`, `height`, `bytes`, `format`, `blurhash` and
  `dominantHex`. Blurhash is computed once at upload, because the CLS guarantee in
  [08-design-system.md](08-design-system.md) §8.7 depends on it existing.
- **`alt` is required per locale** and the API rejects a publish attempt on a product whose
  `PRIMARY` media has no `alt` in the locale being published. §25.4 makes this structural: alt
  lives on the translation row, so it cannot be skipped by an editor in a hurry.
- **Focal point and text-safe zone** are set by dragging a crosshair and a rectangle over the
  image, with live previews at 1:1, 4:5, 16:9 and 21:9. This is mandatory for anything used as
  a hero or banner ([09-color-palette.md](09-color-palette.md) §9.6).
- **Role assignment** (`PRIMARY`, `GALLERY`, `DETAIL`, `LIFESTYLE`, `PRODUCTION`,
  `SCALE_REFERENCE`) is a dropdown per attached image. `SCALE_REFERENCE` matters more here than
  in a typical store: a lizhnyk's size is the most common pre-purchase question.
- **Reordering** is drag-and-drop writing `ProductMedia.position`, persisted as a single
  batched request on drop, not one request per item.
- **The library view** is a filterable grid over `Media` with album, kind, usage count and
  "unused" filters. An unused-media filter is what keeps a Cloudinary bill from growing without
  explanation.

### 23.6.7 Bulk editing

Selection drives a bulk action bar. Every bulk operation is expressed as one typed command,
executed server-side in a single transaction, and written to the audit log **per affected
entity** — a batch that logs one row is useless in an investigation.

```ts
// api/admin/products/bulk — one request, one transaction, N audit rows
export type BulkProductOperation =
  | { op: 'set_status';      status: ProductStatus }
  | { op: 'set_origin';      origin: ProductOrigin; partnerName?: string }
  | { op: 'add_category';    categoryId: string }
  | { op: 'remove_category'; categoryId: string }
  | { op: 'price_adjust';    mode: 'percent' | 'absolute'; value: number; round: 'none' | 'to_10' }
  | { op: 'set_flag';        flag: 'isHandmade' | 'isUniquePiece'; value: boolean }
  | { op: 'set_low_stock';   lowStockAt: number }
  | { op: 'set_made_to_order'; days: number | null }
  | { op: 'archive' }
  | { op: 'restore' };

export interface BulkProductRequest {
  /** Explicit ids, or the filter that produced the selection. Never both. */
  target: { kind: 'ids'; ids: string[] } | { kind: 'filter'; filter: ProductFilter };
  operation: BulkProductOperation;
  /** Echoed back from the preview call. Mismatch ⇒ 409: the selection moved. */
  expectedCount: number;
  dryRun?: boolean;
}

export interface BulkProductResult {
  affected: number;
  skipped: Array<{ id: string; sku: string; reason: string }>;
  auditBatchId: string;   // groups the per-entity AuditLog rows for one-click revert
}
```

Three decisions worth defending. **`expectedCount` is sent and verified** because a
filter-based selection is evaluated twice — once for the preview, once for the write — and
between those two moments another manager may have published six products. A silent
discrepancy in a price adjustment is a real financial error. **`dryRun` returns the same shape**
so the preview and the execution cannot disagree about what would happen. **`auditBatchId`**
makes bulk operations reversible: one click reverts every row in the batch using the `before`
payloads in `AuditLog`, which is the only practical safety net for an operation that touched
300 products.

`price_adjust` deserves its own note: it operates on `ProductVariant.priceMinor`, recomputes
the denormalised product range, and refuses to produce a negative or zero price. Rounding to
the nearest 10 UAH is offered because a −7% adjustment otherwise produces 4 929 ₴, and prices
like that undercut a premium presentation more than the discount helps.

### 23.6.8 Translation status per locale

The fallback rule in §25.2 — serve `uk`, set `x-translation-fallback` — guarantees the site
never 404s on a missing translation. It also guarantees that a missing translation is invisible
unless the admin surfaces it, which is why §25.2 requires the admin to expose completeness per
entity.

Completeness is computed, not stored:

```ts
const REQUIRED_PRODUCT_FIELDS = ['name', 'slug', 'description'] as const;
const RECOMMENDED_PRODUCT_FIELDS = ['metaTitle', 'metaDescription'] as const;

export type TranslationState = 'missing' | 'partial' | 'complete' | 'stale';

// 'stale' = the uk row's updatedAt is newer than this locale's updatedAt.
// Without it, a translated product silently drifts out of date after every uk edit,
// which is the failure mode of every multilingual CMS that only tracks presence.
```

Rendered as four dots `uk en pl de`: filled = complete, half = partial, hollow = missing,
ringed = stale. The same indicator appears in the list, the editor tab strip, and a dedicated
**Translation queue** view filtering every entity type — products, categories, posts, banners,
option values, media alt text — by locale and state. For a four-person team populating sixteen
categories in four locales, that queue is the difference between a translated site and a
mostly-translated site.

Media `alt` participates in completeness. A product whose photographs have no German alt text
is not translated into German, whatever its description says.

### 23.6.9 CSV import and export, with a dry-run diff

Import is the highest-risk feature in the admin: it writes to many rows at once, it is used by
non-engineers, and its input is a spreadsheet that someone edited on a phone. The design
principle is therefore **nothing is written until a human has read a diff.**

The flow has four steps and cannot be skipped:

```
1. UPLOAD      → file parsed, encoding sniffed (UTF-8 / Windows-1251), delimiter detected
2. MAP         → columns mapped to fields; mapping saved as a named preset for next time
3. DRY RUN     → full validation + diff, written to nothing
4. COMMIT      → one transaction, chunked, progress-streamed, audit row per entity
```

The dry-run response is the whole feature:

```ts
export interface ImportDryRun {
  totals: { create: number; update: number; unchanged: number; error: number };
  rows: ImportRowResult[];
  /** Blocking problems. COMMIT is disabled while this is non-empty. */
  blockers: Array<{ code: string; message: string; rowNumbers: number[] }>;
}

export interface ImportRowResult {
  rowNumber: number;
  matchedBy: 'sku' | 'variant_sku' | 'none';
  action: 'create' | 'update' | 'unchanged' | 'error';
  /** Only fields that actually change. field → [before, after] */
  changes: Record<string, [unknown, unknown]>;
  errors: Array<{ field: string; message: string }>;
}
```

Rules:

- **Matching is by `sku`, never by name.** Names are translated, renamed, and duplicated; SKUs
  are unique by schema constraint.
- **Absent column ≠ empty value.** A column that is not present in the file is not touched. A
  column present and empty clears the field. Conflating the two wipes descriptions, and it is
  the single most common CSV-import disaster.
- **Money is parsed strictly** into minor units, accepting `5 300`, `5300`, `5300.00` and
  `5300,00`, rejecting anything else. A silently mis-parsed price is worse than a failed import.
- **Locale columns are suffixed** (`name:uk`, `name:pl`), so one file can carry all four
  locales — which is what makes a translator's workflow possible at all.
- **Partner rows require `origin`, not `partner_name`.** §E7 makes the partner name unusable
  publicly, so the blocker moves to the flag that actually matters. `partner_region` is reported
  as a warning when blank on a partner row, per §23.6.3.
- **No review columns exist** in the format. §E5 forbids copying the source site's reviews — they
  were given to a different seller — and the cheapest enforcement of that is a format with nowhere
  to put them.
- **The diff is downloadable as CSV** before commit, because the person who must approve a
  300-row price change is usually not the person at the keyboard.
- **Commit is chunked at 200 rows** with a streamed progress response, and is resumable by
  `importJobId` — a rural connection will drop, and losing a 40-minute import to a dropped
  socket is unacceptable.
- Import is `isDangerous` and requires `products.import`
  ([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4).

Export mirrors import exactly — same columns, same locale suffixes — so the round trip
**export → edit in a spreadsheet → import** is lossless. That round trip is the real bulk-edit
tool for anything the bulk action bar does not cover, and it is why the two formats are
specified together rather than separately.

#### The duplicate-text guard

This is the one mechanism added by [00-client-decisions-2.md](00-client-decisions-2.md) §E5, and
it exists because the source site **stays online**. Copying `fabryka-shkur.com.ua`'s product text
onto a new domain produces two live sites competing for the same queries, and the new domain —
with zero authority ([00-client-decisions.md](00-client-decisions.md) D2) — loses that competition
every time. **Reusing the source copy is a ranking risk, not a convenience**, and the import tool
is the exact place where it would otherwise happen quietly and at scale.

So the dry-run runs a third class of check alongside validation and diffing:

```ts
export interface DuplicateTextFinding {
  rowNumber: number;
  field: string;                        // "description:uk", "name:pl", "alt:uk", …
  kind: 'SOURCE_MATCH' | 'INTERNAL_MATCH' | 'NAME_COLLISION';
  similarity: number;                   // Jaccard over 5-gram shingles, 0..1
  /** The overlapping passage, so the editor can see what to rewrite. */
  excerpt: string;
}
```

| Finding | Trigger | Commit behaviour |
|---|---|---|
| `SOURCE_MATCH` | Description similarity ≥ 0.35 against the stored fingerprint set of the source site's copy | **Blocker.** Commit disabled until rewritten or individually acknowledged. |
| `INTERNAL_MATCH` | Two rows in the same file share a description | Blocker — boilerplate across twenty products is thin content either way |
| `NAME_COLLISION` | Product name identical to a known source-site name | Blocker. §E5 requires renaming where names overlap, and «Ліжник Яворівський» is a better brand asset than a shared generic name anyway. |
| Unchanged image hash | A reused photograph arriving without re-crop or re-grade | **Warning only.** §E5 permits image reuse after re-crop, re-grade, EXIF strip, semantic rename and new `alt`. Identical images across two domains are a weaker signal than unique ones but are not penalised the way duplicate text is. |
| Duplicate or missing `alt` | Any locale | Blocker — `alt` is text, and it is indexed as text |

Three implementation decisions are load-bearing:

- **Shingles, not string equality.** A 5-gram shingle set with a Jaccard threshold catches
  paraphrase-by-reordering, which is precisely what a rushed rewrite produces and precisely what a
  search engine still recognises as the same passage. An equality check would pass everything that
  matters.
- **Fingerprints, not source text.** The source descriptions are hashed into shingle fingerprints
  once at export time and the raw text is never persisted. Otherwise the guard would itself become
  a copy of the content it exists to keep out.
- **Acknowledgement is per finding and audited.** An editor may override a flag — some phrases,
  like a composition line reading «100% вовна», legitimately recur — but the override records who
  did it and why in `AuditLog`. A single "ignore all" button would make the whole guard
  decorative within a week.

The guard is a rate limiter on a real workload, not a substitute for it. §E5 requires every
product description to be rewritten with no sentence copied verbatim; the tool's job is to make it
impossible to skip that quietly, not to do it. Scoping that rewriting honestly is
[35-implementation-roadmap.md](35-implementation-roadmap.md)'s problem.

### 23.6.10 Draft, archive, duplicate, restore

`ProductStatus` has exactly three states (§25.3) and the admin does not invent a fourth.

| State | Storefront | Search | Admin list default | Transition |
|---|---|---|---|---|
| `DRAFT` | 404 | excluded | shown, dimmed | New products start here. Publishing requires a complete `uk` translation, one `PRIMARY` image with `alt`, at least one active variant with a price, and at least one category. |
| `ACTIVE` | visible | indexed | shown | `publishedAt` is stamped on first activation only and never re-stamped, so an unpublish/republish cycle does not reset editorial date ordering. |
| `ARCHIVED` | 410 Gone | excluded | hidden behind a filter | Reversible to `DRAFT`. Used for seasonal and discontinued lines. `deletedAt` soft delete is separate and is reserved for genuine mistakes. |

**410 rather than 404 for archived products is deliberate.** A 410 tells a crawler the URL is
intentionally gone and de-indexes faster, which matters more on a cold-start domain
([00-client-decisions.md](00-client-decisions.md) D2) where every crawl budget unit counts.

**Duplicate / clone** is the entry point for most new products in a catalogue where a ліжник
differs from the next ліжник by pattern and size only. It copies: all translations, all
attributes, category assignments, variant structure, provenance, flags and origin. It does not
copy: `sku` (suffixed `-COPY` and flagged for edit), `publishedAt`, stock quantities, media
attachments by default (offered as a checkbox — usually the photographs are the thing that
differs), reviews, or audit history. Result opens as `DRAFT` with the name field focused and
selected. Cloning that silently duplicates stock counts would corrupt the warehouse, so stock
always starts at zero.

**Restore** reverses soft delete within {{RESTORE_WINDOW_DAYS}} (default 30) from a Deleted
filter, using the `withDeleted()` escape hatch in §25.10.4. After the window, a nightly job
hard-deletes and the audit trail is the only remaining record — which is exactly what the
audit trail is for.

---

## 23.7 Categories module

Sixteen or so categories across three tiers ([00-client-decisions.md](00-client-decisions.md)
D3) — a tree small enough to render whole and important enough to get exactly right, since it
is the site's primary navigation and its primary SEO surface.

```
┌ Категорії ───────────────────────────────────────────────────────────────┐
│  [+ Категорія]                                   [Розгорнути все] [uk ▾]  │
│                                                                           │
│  ⠿ ▾ Вовна                                    ★  active   ●●●○   12 тов.  │
│  ⠿   ├ ⠿ Ліжники                              ★  active   ●●●●   34 тов.  │
│  ⠿   ├ ⠿ Ковдри вовняні                          active   ●●○○   18 тов.  │
│  ⠿   ├ ⠿ Гуні                                 ★  active   ●●○○    9 тов.  │
│  ⠿   ├ ⠿ Камізельки                              active   ●○○○    7 тов.  │
│  ⠿   ├ ⠿ Вовняна пряжа                           active   ●●○○   26 тов.  │
│  ⠿   └ ⠿ Ровниця                                 active   ●○○○    4 тов.  │
│  ⠿ ▾ Вироби з овчини                             active   ●●○○   21 тов.  │
│  ⠿ ▸ Шкіряні вироби                              active   ●○○○   15 тов.  │
│  ⠿ ▸ Партнерські вироби                          active   ●○○○   31 тов.  │
│  ⠿ ▸ Дерево                                      draft    ○○○○    0 тов.  │
└───────────────────────────────────────────────────────────────────────────┘
```

**Reordering** is drag-and-drop over the tree, writing `Category.sortOrder` and `parentId`.
The whole affected sibling set is persisted in **one** request on drop, not one request per
node: a partial failure mid-sequence would leave the public navigation in a state no one
designed. Depth is capped at three levels, enforced server-side. A fourth level cannot be
rendered in a mega-menu without producing navigation nobody can use, and once editors can
create one they will.

**`isFeatured`** (the ★) drives the homepage category rail and the mega-menu's promoted set. It
is capped at {{FEATURED_CATEGORY_MAX}} (default 6) with the cap enforced in the UI *and* the
API — an uncapped "featured" flag ends with everything featured, which is the same as nothing
featured.

**SEO fields per locale**: `metaTitle`, `metaDescription`, and the slug, with null meaning
"generate from content" (§25.2). The slug editor warns that changing a live slug breaks
inbound links and offers to write a `Redirect` row
([25-database-schema.md](25-database-schema.md) §25.9). On a cold-start domain there is no
legacy redirect map to build (D2 revokes that workstream entirely), but self-inflicted slug
churn is still the fastest way to lose the little authority a new domain accumulates.

**Category hero media** uses the same focal-point and text-safe-zone editor as products
(§23.6.6), because category headers are text-over-photography and therefore subject to
[09-color-palette.md](09-color-palette.md) §9.6.

**`defaultCustomSizeRatePerSqmMinor`** sits in the category editor under a heading that states
what it is and is not: «Ставка за м² для нових товарів — не впливає на наявні». It is a seed for
the product form and is never read at pricing time
([00-client-decisions-5.md](00-client-decisions-5.md) §H3c). Saving a change opens the opt-in bulk
apply specified in §23.6.4b, and that dialog is the only mechanism by which a category rate ever
reaches an existing product. The field is `products.manage_price`, not `categories.update`,
because the permission should follow the money rather than the table the column happens to live
in.

**Deletion** is blocked while products are assigned. The dialog offers reassignment to another
category instead, listing the affected products. An orphaning delete that silently hides 31
products from the storefront is the kind of failure that is discovered by a customer.

---

## 23.8 Orders module

Orders are where the admin stops being a CMS and starts being an operations tool. The design
target is that a manager can take an order from arrival to dispatched without leaving the
screen or opening a second application — except the bank, which is unavoidable while payment
is manual.

### 23.8.1 List and search

Search is a single input matching order number, customer email, phone, surname, and Nova
Poshta tracking number. Four separate search fields would be more precise and would be used
less; a manager on the phone with a customer has one piece of information and no patience.

Filters: status, payment status, payment method, carrier, date range, assigned manager, has
internal note, awaiting reconciliation, **has a custom-size line**, **holds stocked goods against a
custom build** — the mixed order of §23.8.3c, which is the filter that answers «що в нас лежить на
полиці й чекає». There is no split-pair filter, because there are no pairs
([00-client-decisions-6.md](00-client-decisions-6.md) §J1).
Saved views are shipped rather than user-built — **Потребують уваги**, **Очікують оплати**,
**У виробництві**, **До відправки сьогодні**, **Потребують прорахунку**, **Проблемні** — because
six well-chosen saved views beat a view builder that nobody configures.

**«У виробництві» is a separate view from «До відправки сьогодні», and that separation is the
point.** [00-client-decisions-4.md](00-client-decisions-4.md) §G2 makes a fortnight of weaving a
distinct operational state; §23.8.2 explains why the two must never share a list.

### 23.8.2 Status transitions

`OrderStatus` (§25.5) is a state machine, and the admin renders only legal transitions. A
dropdown listing every state invites a `DELIVERED` order to be set back to `PENDING`.

```
                          ┌─► IN_PRODUCTION ─┐        (any line has customSpec)
PENDING ──► CONFIRMED ────┤                  ├─► PACKING ──► SHIPPED ──► DELIVERED ──► RETURNED
   │            │         └──────────────────┘      │           │            │
   └────────────┴────────────────┴──────────────────┴───────────┴──────► CANCELLED
```

| Transition | Guard | Side effects |
|---|---|---|
| `PENDING → CONFIRMED` | Payment `PAID`, or method is `COD`, or a 10% prepayment is reconciled | Confirmation email **stating the dispatch date, not a duration**; stock reservation converted to a decrement |
| `CONFIRMED → IN_PRODUCTION` | **Automatic.** Applied in the same transaction whenever any `OrderItem` carries a `customSpec` | `expectedDispatchAt` stamped once and stored; «у виробництві» email |
| `CONFIRMED → PACKING` | No custom-size line | Packing slip becomes printable |
| `IN_PRODUCTION → PACKING` | **Manual.** A human says the piece is off the loom | Packing slip becomes printable |
| `PACKING → SHIPPED` | `trackingNumber` present | Dispatch email with TTN; `shippedAt` stamped |
| `SHIPPED → DELIVERED` | — | Set manually, or automatically from the Nova Poshta status poll. **On a COD order this is where the return deposit is credited — exactly once** (§23.8.3b) |
| `* → CANCELLED` | Not `DELIVERED` | Stock returned; refund prompted if `paymentStatus = PAID`; reason required |
| `DELIVERED → RETURNED` | Within {{RETURN_DAYS}} | Stock returned; refund flow; reason required |

Every transition writes an `OrderEvent` row with `fromValue`, `toValue` and `actorId`, and an
`AuditLog` entry. The order timeline renders `OrderEvent` directly, so the customer-visible
history and the internal record cannot diverge — they are the same rows.

#### `IN_PRODUCTION` and `PACKING` are different queues, not different labels

[00-client-decisions-4.md](00-client-decisions-4.md) §G2 adds `IN_PRODUCTION` between `CONFIRMED`
and `PACKING`, and the admin consequence is larger than one enum member. **Staff need to see at a
glance which orders are being woven and which are waiting to be boxed**, because those are two
different jobs done by two different people on two different timescales.

| | `IN_PRODUCTION` | `PACKING` |
|---|---|---|
| Duration | ~14 days | Hours |
| Who acts | The workshop | The warehouse |
| What "overdue" means | The dispatch date is approaching or passed | The parcel has been sitting since yesterday |
| Daily question it answers | "What is due off the loom this week?" | "What do I box today?" |

Consequently:

- **Separate saved views** (§23.8.1) and separate badge counts. Mixing twelve days of weaving into
  the list a packer scans every morning makes that list useless within a week, and a list people
  stop scanning is worse than no list.
- **The order row shows `expectedDispatchAt`, not elapsed days.** «Відправка: 12 жовтня» is
  actionable; «у виробництві 9 днів» requires arithmetic against a date nobody remembers.
- **The date is stamped once, on entry, and never recomputed.** A date that moves each time the
  page loads is not a date the business can be held to, and it is the same date the customer was
  given in the confirmation email ([26-api-architecture.md](26-api-architecture.md) §26.16).
- **Amber at three days out, red past the date**, driven by `orders.productionDueSoon`
  ([26](26-api-architecture.md) §26.17). The fourteen-day build is the one commitment in the system
  with no carrier and no provider to blame for a miss.
- **Entry is automatic and exit is manual**, deliberately. Nothing in the system can observe a
  lizhnyk coming off a loom, and inferring dispatch from the elapsed fortnight would announce a
  dispatch that has not happened. Entry, by contrast, is a fact the order already contains and
  should not wait on someone remembering.

### 23.8.3 Manual payment reconciliation

This is the module's distinguishing feature and it exists because of a business fact: card
payment today is a transfer to a personal card plus a manager phone call, alongside bank
transfer to an IBAN, a 10% prepayment option, and cash on delivery. An admin that only
understands PSP webhooks would leave the majority of revenue unreconciled.

The model already fits without change. `PaymentTransaction` (§25.5) carries
`provider`, `providerRef`, `amountMinor`, `rawPayload` and a unique `idempotencyKey`. A manual
reconciliation is simply a transaction whose `provider` is `manual_card` or `manual_bank`,
whose `providerRef` is the bank reference typed by the manager, and whose `rawPayload` records
who confirmed it and against what evidence.

```ts
export interface ManualReconciliationInput {
  orderId: string;
  method: 'manual_card' | 'manual_bank' | 'cod_settlement';
  amountMinor: number;              // may be partial — 10% prepayment is the common case
  receivedAt: string;               // ISO; the bank's value date, not "now"
  bankReference: string;            // statement reference, typed from the bank app
  note?: string;
  evidenceMediaId?: string;         // screenshot of the statement line, optional but encouraged
}

export type ReconciliationOutcome =
  | { kind: 'paid_in_full';  paymentStatus: 'PAID' }
  | { kind: 'part_paid';     paymentStatus: 'UNPAID'; outstandingMinor: number }
  | { kind: 'overpaid';      paymentStatus: 'PAID';   excessMinor: number };
```

The reconciliation queue is a dedicated screen, not a field buried in the order:

```
┌ Звірка оплат ──────────────────────────────────────────── 3 очікують ────┐
│ [Усі] [Картка] [Банк] [Накладений платіж]          Загалом: 21 400 ₴     │
│                                                                           │
│ ┌────────────┬──────────────┬─────────┬──────────┬──────────┬──────────┐ │
│ │ Замовлення │ Клієнт       │ Спосіб  │ Очікуємо │ Отримано │          │ │
│ ├────────────┼──────────────┼─────────┼──────────┼──────────┼──────────┤ │
│ │ VCH-25-0417│ О. Ковальчук │ Картка  │  9 800 ₴ │     — 18г│ [Звірити]│ │
│ │ VCH-25-0411│ М. Гуцуляк   │ Банк    │  5 300 ₴ │    530 ₴ │ [Звірити]│ │
│ │            │              │         │          │ 10% аванс│          │ │
│ │ VCH-25-0402│ І. Петрів    │ НП COD  │ 14 900 ₴ │  доставл.│ [Звірити]│ │
│ └────────────┴──────────────┴─────────┴──────────┴──────────┴──────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

Design rules that make manual money handling trustworthy:

1. **Partial payment is a first-class outcome, not an error.** The 10% prepayment model means
   the normal case is an order that is legitimately part-paid for days. The order shows
   "530 ₴ з 5 300 ₴ · залишок 4 770 ₴ при отриманні" rather than a red UNPAID badge, because a
   red badge on a correctly-handled order trains staff to ignore red badges.
2. **`receivedAt` is the bank's value date**, entered by the manager, not `now()`. Reconciling
   Monday's transfer on Wednesday must not report Wednesday's revenue.
3. **The bank reference is required** and is the human-readable audit anchor. It is what makes
   a dispute resolvable six months later.
4. **Reconciliation is `isDangerous`** and requires `payments.reconcile`. It writes an
   `AuditLog` row with the full before/after payment state. Marking money received is the
   single most abusable action in the panel.
5. **Idempotency is enforced** on `(provider, providerRef)` by the schema's unique constraint,
   so double-clicking "Звірити", or two managers reconciling the same transfer, cannot produce
   two payment rows.
6. **COD settlement is tracked separately** from delivery. Nova Poshta remits cash days after
   delivery; an order can be `DELIVERED` and still not settled, and conflating the two
   overstates cash on hand. On a COD order the expected figure is `codAmountMinor` — the goods
   **minus** the return deposit already paid online — and the queue shows it as such, never as the
   product price. A manager reconciling against the product price would flag every correctly
   handled COD order as short-paid (§23.8.3b).
7. **Automated PSP reconciliation coexists.** When WayForPay is live, its webhook writes the same
   `PaymentTransaction` shape with `provider = 'liqpay'` and `rawPayload` set to the webhook
   body. The queue then shows only what the webhook did not resolve. Nothing about the manual
   path needs removing — legacy methods will run for years alongside card payment.

### 23.8.3a International orders — the shipping-quote workflow

[00-client-decisions-3.md](00-client-decisions-3.md) F4 settles international shipping: carriers
are chosen case by case, the buyer pays everything including duties, and the model is
**enquiry-then-invoice** rather than a calculated rate at checkout. That is a decision about the
storefront ([18-checkout-specification.md](18-checkout-specification.md) §18.23), and it lands in
the admin as a workflow that did not previously exist — because somebody has to produce the quote.

**This is the admin's only genuinely new operational surface in round 3, and it is worth naming
what it costs.** Every international order now requires a human to price a parcel, send a figure,
wait, and follow up. The screens below make that as fast as it can be; they cannot make it
optional. The capacity question that follows is raised in
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.11, because it is a question about
the client's team rather than about the build.

#### The state machine extension

An international order enters at a status that does not exist for domestic orders, because it is
not yet a payable order — no total exists.

```
AWAITING_QUOTE  →  QUOTE_SENT  →  PAID            →  (normal dispatch flow)
      │                 │
      │                 └──→  QUOTE_EXPIRED  →  CANCELLED
      └──→  CANCELLED
```

| Status | Meaning | Who moves it |
|---|---|---|
| `AWAITING_QUOTE` | The customer submitted the enquiry. Goods are reserved per the normal reservation rules; no payment attempted | System, on submit |
| `QUOTE_SENT` | A shipping figure has been sent and a payment link issued | Manager |
| `QUOTE_EXPIRED` | The quote's validity window lapsed with no payment | System, scheduled |
| `PAID` | The customer paid the quoted total. The order rejoins the ordinary flow | Payment webhook |

`AWAITING_QUOTE` orders are **excluded from the domestic funnel metrics**
([31-analytics-architecture.md](31-analytics-architecture.md) §31.7) and from the "Очікують оплати"
saved view, which exists for orders where the customer already knows what to pay. They get their
own saved view: **Потребують прорахунку**, and it sorts oldest first.

#### The queue, the SLA and who owns it

[00-client-decisions-5.md](00-client-decisions-5.md) §H2 and §H3 turn this from a screen into an
accountable workflow. Both were open items in round 4 and both are now settled.

| Setting | Value | Where it shows |
|---|---|---|
| `{{QUOTE_SLA_HOURS}}` | **48 working hours** | The age column in the queue, measured against the working calendar, not the wall clock |
| `{{QUOTE_EXPIRY_HOURS}}` | **72 hours** from issue | The «Дійсний до» default in the quote panel |
| One-of-one items | **36 hours** | Halved automatically where any line is `isUniquePiece` |
| Default assignee | **Гондурак Любов Юріївна** | The queue's default owner and `Lead.assignedToId` |

```
┌ Потребують прорахунку ───────────────────────────── 4 · SLA 48 год ──────┐
│ [Усі] [Мої 3] [Прострочені 1]              Відповідальна: Любов Г. ▾     │
│ ┌──────────┬──────────┬────────┬──────────┬──────────────┬─────────────┐ │
│ │ Замов.   │ Країна   │ Вага   │ Товари   │ Вік / SLA    │             │ │
│ ├──────────┼──────────┼────────┼──────────┼──────────────┼─────────────┤ │
│ │ VCH-0431 │ 🇩🇪 DE    │ 3,4 кг │ 10 460 ₴ │ 51 год  ⚠    │ [Прорахувати]│ │
│ │ VCH-0430 │ 🇵🇱 PL    │ 1,2 кг │  4 200 ₴ │ 31 год       │ [Прорахувати]│ │
│ │ VCH-0428 │ 🇬🇧 GB    │ 5,1 кг │ 18 900 ₴ │ 6 год        │ [Прорахувати]│ │
│ │ VCH-0419 │ 🇩🇪 DE    │ 2,0 кг │  7 300 ₴ │ прострочено  │ [Перевидати] │ │
│ └──────────┴──────────┴────────┴──────────┴──────────────┴─────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

Three rules that make the SLA real rather than decorative:

- **Age is measured in working hours against the Europe/Kyiv business calendar.** An enquiry
  arriving at 18:00 on Friday is not in breach at 18:00 on Sunday. Measuring the promise
  differently from the way it was made produces a red row nobody believes, and a red row nobody
  believes trains staff to ignore red rows — the same failure §23.4 rule 1 guards against with
  badge counts.
- **The alert goes to the assignee first, and to every holder of `orders.quote` on breach**
  ([26](26-api-architecture.md) §26.17). Любов is the default because she is the ФОП seller of
  record and quoting is a commercial act, while Іван owns production
  ([00-client-decisions-5.md](00-client-decisions-5.md) §H3). It is a **default, not a
  constraint**: the assignee dropdown is in the queue header, reassignment is one click, and the
  change is logged. A queue that stalls when one person is on holiday is not a workflow.
- **Customer copy under-promises against the internal figure.** The submission email says
  «протягом 2 робочих днів» while the queue counts 48 hours. A quote arriving in four hours is a
  pleasant surprise; the reverse is a complaint.

#### An expired quote is re-issuable in one click

«A quote that expires is not a dead order» ([00-client-decisions-5.md](00-client-decisions-5.md)
§H2). Expiry releases the stock — which is the part that costs money — and leaves the order
visible in the queue as a **lapsed opportunity** rather than a cancellation
([26](26-api-architecture.md) §26.10.4). The row's action becomes **[Перевидати]**, which reopens
the quote panel pre-filled with the previous carrier, price and dimensions.

Two behaviours are load-bearing. The panel is **pre-filled, not blank** — the destination, weight
and address were already correct, and retyping them is the friction that turns a recoverable
enquiry into an abandoned one. And re-issue **re-acquires the stock reservation**, failing with a
named line if the goods sold domestically in the interim; that failure is the honest one, and it
is far better discovered here than after a second quote email has gone out.

Orders in this state are cancelled automatically only after `{{QUOTE_LAPSE_DAYS}}` (default 14),
so the queue does not accumulate indefinitely while the opportunity still survives a fortnight.

#### The quote panel

Rendered on the order detail for any non-UA destination, above the payment panel, because it comes
first in time.

```
┌ Міжнародна доставка — прорахунок ──────────────────────────────────┐
│  Країна        Німеччина          Вага брутто   3,4 кг (розрахунок) │
│  Габарити      60 × 40 × 25 см    Товари        10 460 ₴            │
│                                                                     │
│  Перевізник    [ Нова пошта Global ▾ ]                              │
│  Вартість      [ 1 850 ] ₴        Термін  [ 7–12 ] днів             │
│  Дійсний до    [ 05.10.2026 ]     (+72 год; 36 год для унікальних)  │
│                                                                     │
│  Разом до сплати                             12 310 ₴               │
│                                                                     │
│  ⚠ Мита та податки країни призначення сплачує отримувач.            │
│    Це буде вказано в листі та на сторінці оплати.                   │
│                                                                     │
│  [ Надіслати прорахунок ]              Останній лист: не надсилався │
└─────────────────────────────────────────────────────────────────────┘
```

Design decisions worth stating:

- **Weight and dimensions are pre-computed** from `ProductVariant.weightGrams` and the packaging
  defaults, and they are **editable**. The computed figure is right often enough to save the work
  and wrong often enough that an unmodifiable field would be abandoned — a ліжник is light and
  bulky, and volumetric weight governs the price.
- **Carrier is a free select seeded from a `Setting` list**, not a fixed enum. F4 resolves
  `{{INTL_CARRIER}}` to *multiple, chosen per order*, so hard-coding the list guarantees an edit
  request the first time a new courier is used. A carrier not on the list can be typed.
- **The quote has an expiry**, defaulting to **72 hours** and **36 hours** where any line is a
  one-of-one piece ([00-client-decisions-5.md](00-client-decisions-5.md) §H2). Without one, an
  unpaid quote holds stock indefinitely and the manager has no signal to chase; with a long one, a
  unique lizhnyk is held for days against an unaccepted quote while a buyer who would pay today is
  told it is unavailable. Expiry releases the reservation and marks the quote expired, which is a
  visible state rather than silent abandonment — and it is re-issuable, not terminal.
- **The duty warning is not editable and cannot be removed.** It is a consumer-law obligation in
  the EU locales ([32-security-architecture.md](32-security-architecture.md) §32.15), so the
  interface does not offer the option of omitting it. A manager in a hurry with a customer on the
  phone is exactly who would.
- **The total is computed and displayed before sending**, not assembled inside the email template.
  The manager approves a number they can see.

#### Sending, chasing and measuring

Sending the quote does three things atomically: writes the quote to the order, emails the customer
a localised message containing the itemised total, the shipping line, the duty disclosure and a
payment link, and records an `OrderEvent`. The email goes out over the authenticated sending domain
([32-security-architecture.md](32-security-architecture.md) §32.16) — a quote that lands in spam is
the same as a quote never sent, and this workflow is entirely email-dependent.

Chasing is deliberately thin: **one automatic reminder**, 48 hours before expiry, and nothing else.
A four-person team does not need a nurture sequence, and a second automated chase on a 12,000 UAH
enquiry reads as pressure rather than service. The «Потребують прорахунку» view and a badge on the
orders navigation item carry the rest — the manager sees what is outstanding without being emailed
about it.

Two numbers are recorded because they are the ones the client can act on:

| Metric | Why it is the one that matters |
|---|---|
| **Hours from enquiry to quote sent** | The only variable in this workflow the business controls. A quote sent within an hour converts differently from one sent on Monday, and this is the number that tells the client whether the model is being run or merely intended ([31-analytics-architecture.md](31-analytics-architecture.md) §31.4) |
| **Quote → paid rate** | The model's characteristic failure is quotes that are sent and never paid. A low rate means the shipping figures are too high, arriving too late, or the disclosure is landing badly — three different fixes, and the rate is what prompts asking which |

Both surface on the dashboard (§23.5) only once the first international order exists; an empty tile
on a launch dashboard trains people to ignore tiles.

### 23.8.3b The return-shipping deposit on a COD order

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.3 is the most unusual money rule in the
system. On a Ukrainian COD-with-inspection order the buyer pays **both shipping legs online, by
card, at checkout**. If they accept the parcel, the return leg is credited against the goods and
the branch collects less; if they refuse, the return journey is already funded.

It is not a fee. It is a refundable-by-offset deposit, and it costs an honest buyer exactly
nothing. The admin's job is to make that legible to staff, because the first time a manager sees a
COD amount lower than the product price they will assume something is wrong.

```
┌ Оплата ─────────────────────────────────────────────────────────────────┐
│  Спосіб      Наложений платіж з оглядом · Нова Пошта                     │
│                                                                          │
│  Сплачено онлайн   доставка туди        180 ₴                            │
│                    депозит за зворотну  220 ₴   ← повертається знижкою   │
│                                         ─────                            │
│                                         400 ₴   картка ·••1234 · 28.09   │
│                                                                          │
│  Товари                               10 460 ₴                           │
│  Мінус депозит                         −220 ₴                            │
│  ────────────────────────────────────────────                            │
│  ДО СПЛАТИ НА ПОШТІ                   10 240 ₴                           │
│                                                                          │
│  ⓘ Депозит зараховується один раз, автоматично, у момент вручення.       │
│    Робити це вручну не потрібно.                    [Скасувати депозит ⚠]│
└──────────────────────────────────────────────────────────────────────────┘
```

#### The credit is a system consequence, not a staff action

`depositAppliedMinor` is credited **exactly once, on the transition to `DELIVERED`**, by the order
state machine ([26-api-architecture.md](26-api-architecture.md) §26.10.4c). There is no button in
the admin that applies it, and the field is read-only everywhere. That is deliberate and the
reasoning belongs here rather than only in the API document, because this is the screen where
someone would otherwise ask for one:

| If staff could apply it | Outcome |
|---|---|
| Applied early, at dispatch | The deposit is credited on a parcel that is later **refused**, and the return leg it existed to fund is unfunded. The mechanic inverts and the business pays both legs on exactly the orders that abuse it |
| Applied twice, by two people | The branch collects less than the goods are worth, and the difference is unrecoverable |
| Forgotten | The customer pays the deposit **and** full price at the counter. This is the version that produces the review saying the shop charges a hidden fee |

All three are avoidable by the interface simply not offering the action, and the explanatory line
in the panel says so in words — «робити це вручну не потрібно» — because an absent control with no
explanation reads as a missing feature and generates a request for one.

The panel does show **when** it happened, as a timeline row sourced from `OrderEvent`: «Депозит
220 ₴ зараховано · 3 жовтня, 14:21 · система». Attributing it to the system rather than to a
person is accurate and is what makes the entry trustworthy six months later.

#### Waiving a deposit is a different act, with its own permission

A manager sometimes needs to decide that a particular buyer will not pay a deposit — a repeat
customer, a goodwill case, an order where the shipping was mispriced. That is
**`payments.waive_deposit`** ⚠
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4), not
`payments.refund`, because it is a **pricing decision taken before money moves** rather than the
reversal of a payment that exists.

| Rule | Behaviour |
|---|---|
| Available only before payment | The control disables once `paymentStatus = PAID`. After that the deposit is money that has moved and the correct instrument is a refund |
| Requires a reason | A free-text reason, mandatory, written into `AuditLog` as `payment.deposit_waived`. A waiver with no reason is indistinguishable from a mistake |
| Recomputes the panel in place | `codAmountMinor` returns to the full goods figure, and the change is shown before it is confirmed rather than after |
| Is `isDangerous` | The confirm step exists because the caller who argues a deposit away is the same caller who argues a refund out, and the deposit is the cheaper of the two to concede — which is precisely what makes it the one that gets conceded |

The **pattern** matters more than any single waiver, and only the audit log can show it. A deposit
that was never collected appears nowhere in the reconciliation queue and nowhere in the acquirer's
ledger; the only trace it left is an order that does not have one. The employee detail screen
therefore surfaces a waiver count per person alongside refunds, for the same reason §24.12 logs
sensitive reads: the individually defensible decision, repeated, is what quietly repeals the rule
that makes COD-with-inspection affordable at all.

#### Locale scope is enforced, not configured

The deposit is **Ukraine-only**. It is never shown, never offered and never settable on an `en`,
`pl` or `de` order, and the reason is legal rather than practical: under the EU Consumer Rights
Directive the buyer holds an unconditional fourteen-day right of withdrawal, and a trader may not
require a deposit against exercising it. There is no setting that enables it for those locales,
because a setting is a thing someone eventually switches on.

### 23.8.3c Mixed orders — stocked goods held against a custom build

Because `allowsCustomSize` is per product (§23.6.4a), an order holding one stocked item and one
custom item is the **expected** case rather than an edge case.

[00-client-decisions-6.md](00-client-decisions-6.md) §J1 settles what the admin receives: **one
order, one parcel, one delivery charge, dispatched after the fourteen-day production period** —
«Надіслати разом.» An earlier revision of this section specified a **split-pair view**: two `Order`
rows joined by `splitGroupId`, a linkage banner, a cancel-the-other prompt, paired packing slips
and a «частина 1 з 2» header. All of it is **removed**, because the split that produced it is
withdrawn. The split saved a few days on the stocked line and charged the customer a second
delivery fee for them, while giving a two-person business a second parcel to pack and a second
waybill to track — and this section is where that second parcel would have landed.

The admin consequence of the ruling is a simplification, and it is worth naming because a great
deal of machinery just disappeared from this document: **one purchase is one row, in one queue,
with one status, one waybill and one packing slip.** A support call about "my order" is about one
order. There is no pair to join, no cascade to reason about and no lifetime-order-count distortion
to correct in the customer panel (§23.8.6).

What remains is one operational fact the fulfilment view must make visible, because it is the real
cost of shipping together:

```
┌ VCH-25-0431 ─────────────────────────────────────────────────────────────┐
│  ⏱ У ВИРОБНИЦТВІ · відправка 12 жовтня · передоплата повна               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ ⏱ Ліжник «Черемош» · свій розмір 180×240    у виробництві  7 776 ₴ │  │
│  │ 📦 Ліжник «Черемош» · 150×200               ЧЕКАЄ НА ПОЛИЦІ 5 300 ₴│  │
│  │ 📦 Пряжа «Смерека» · 300 г                  ЧЕКАЄ НА ПОЛИЦІ 1 200 ₴│  │
│  └────────────────────────────────────────────────────────────────────┘  │
│  Одне відправлення · одна доставка · одна ТТН                            │
│  Ковальчук Олег · +38 067 000 00 00 · Косів, НП №1                       │
└───────────────────────────────────────────────────────────────────────────┘
```

Design decisions, each against the obvious alternative:

| Decision | Why it beats the alternative |
|---|---|
| **One `Order` row, no group identifier** | §J1. The `Order.splitGroupId` schema addendum proposed against [25-database-schema.md](25-database-schema.md) §25.5 is **withdrawn and must not be built**. One purchase is one order, and every list, filter, export and count in this panel stays correct without a grouping rule |
| **Stocked lines are flagged «чекає на полиці», not left to look ordinary** | This is the ruling's operational cost and the one thing the admin genuinely needs to see: goods that could have shipped are being held for up to a fortnight. An unflagged stocked line inside an `IN_PRODUCTION` order looks like an order that has not been picked, and someone will eventually "fix" it by shipping it early |
| **`IN_PRODUCTION` covers the whole order** | Not a per-line status. `OrderStatus` describes where the goods are going, and the goods are going together. Per-line fulfilment states would reintroduce the split as a data shape after it was removed as a flow |
| **«Одне відправлення · одна доставка · одна ТТН» is stated on the order** | Staff who worked under the split proposal, or who read the customer's mixed-cart disclosure, will otherwise ask whether a second parcel is owed. The order answers it before the question is asked |
| **One packing slip, listing every line** | The slip is for one parcel. It carries the custom line's dimensions in the header block so a packer can check the woven piece against what was ordered before anything is boxed (§23.8.4) |
| **Cancellation is ordinary** | One order, one cancellation, one refund. There is no sibling to prompt about and no cascade to design |

**The dispatch date is the order's date, not the custom line's.** It is stamped on entry to
`IN_PRODUCTION` and it governs the whole parcel, which is what the customer was told at the add
([18-checkout-specification.md](18-checkout-specification.md) §18.8.7).

### 23.8.4 Nova Poshta waybills and label printing

Delivery is Nova Poshta and Ukrposhta. The admin creates the waybill (ТТН) rather than sending
staff to Nova Poshta's own cabinet, because copying an address between two systems is where
mis-shipments come from.

```
┌ Доставка ────────────────────────────────────────────────────────────────┐
│ Перевізник   Нова Пошта                                                   │
│ Отримувач    Ковальчук Олег · +38 067 000 00 00                           │
│ Відділення   Косів, №1 (вул. Незалежності, 6)         [Змінити]           │
│ Оплата       Отримувач                    Наклад. платіж   9 800 ₴        │
│ Місць 1  ·  Вага 2.15 кг  ·  Об'єм 0.021 м³            [з варіантів]      │
│ Опис         Ліжник вовняний                                              │
│                                                                           │
│ [Створити ТТН]        ТТН 20450812345678   [Друк 100×100] [Копіювати]     │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Weight and volume are pre-filled** from `ProductVariant.weightGrams` and `dimensionsMm`
  (§25.3). Those fields exist precisely so this form is not typed by hand, which is the
  argument for making them mandatory in the variant editor for any physically shipped product.
- **The branch reference** is stored in `Order.npWarehouseRef` at checkout and shown read-only
  unless a manager deliberately changes it, with the change logged. Silently editing a delivery
  address is a fraud vector.
- **The returned TTN** is written to `Order.trackingNumber` and emitted as an `OrderEvent`. That
  write is what unlocks the `PACKING → SHIPPED` transition.
- **Label printing** renders a 100×100 mm thermal label. Nova Poshta's API returns a printable
  document; the admin caches the PDF against the order so a reprint does not require a second
  API call — reprints are common and the network is not reliable (§23.17).
- **Bulk TTN creation** from the order list handles the realistic pattern: eleven orders packed
  in the morning, printed as one batch on one printer.
- **Ukrposhta** follows the same shape with its own document type. Pickup orders produce no
  waybill and skip the panel entirely.
- The Nova Poshta API key is a server-side secret in `Setting`, never exposed to the browser
  ([00-assumptions.md](00-assumptions.md) V2), and the admin calls it through the API server.

### 23.8.5 Packing slip

A separate printable from the label: A4, black on white, no dark theme, no logos consuming
toner.

```
ВІВЧАРИК                          Замовлення VCH-25-0431 · 28.09.2026
                                  Одне відправлення · одна ТТН
─────────────────────────────────────────────────────────────────────
Отримувач   Ковальчук Олег, +38 067 000 00 00
Доставка    Нова Пошта, Косів №1        ТТН 2045 0812 3456 78
─────────────────────────────────────────────────────────────────────
 ☐  VCH-LZ-0114-01-GR   Ліжник «Черемош», 150×200, сірий    ×1
 ☐  VCH-SK-0032-39      Шкарпетки вовняні, 39–41            ×2
 ☐  VCH-LZ-0114-CUSTOM  Ліжник «Черемош», СВІЙ РОЗМІР       ×1
                        ШИРИНА 180 см × ДОВЖИНА 240 см
─────────────────────────────────────────────────────────────────────
Товари 10 460 ₴ · Доставка 180 ₴
СПЛАЧЕНО ОНЛАЙН ПОВНІСТЮ 10 640 ₴   ·  до сплати при отриманні — 0 ₴
Коментар клієнта: «Будь ласка, подарункове пакування»
```

The example is a **mixed order** and it is therefore prepaid in full, with one delivery charge and
no deposit line — a custom-size line removes cash on delivery from the whole order
([00-client-decisions-6.md](00-client-decisions-6.md) §J1). A stocked-only COD order prints the
deposit-adjusted footer instead:

```
Товари 10 460 ₴ · Сплачено онлайн: доставка 180 ₴ + застава 220 ₴
ДО СПЛАТИ ПРИ ОТРИМАННІ 10 240 ₴   (10 460 − 220 застава)
```

Checkboxes are printed because the person packing is holding a box, not a mouse. Internal notes
are **never** printed — the packing slip travels with the parcel.

Three lines on that slip are there because of a specific, expensive failure:

- **`OrderItem.customSpec` is printed in full, in capitals, on its own line.** A weaver needs the
  measurements, and the packing slip is the document that travels with the work
  ([00-client-decisions-5.md](00-client-decisions-5.md) §H3b). A custom line that renders like a
  standard one — «Ліжник «Черемош» ×1» — is a piece woven to the wrong size, discovered after
  fourteen days of labour on a prepaid order. This is the one place in the system where the slip
  carries information the customer knows and the workshop does not.
- **The COD figure is the deposit-adjusted `codAmountMinor`, with the arithmetic shown.** A COD
  parcel dispatched with the wrong amount is an expensive, slow error to unwind, and a branch that
  collects the full product price on an order where the deposit was already paid has overcharged
  the customer by exactly the amount the mechanic was supposed to give back (§23.8.3b).
- **«Одне відправлення · одна ТТН» sits in the header of a mixed order** so a packer holding a box
  containing both shelf stock and a freshly woven custom piece does not go looking for a second
  consignment that does not exist (§23.8.3c, [00-client-decisions-6.md](00-client-decisions-6.md)
  §J1). There is no «Частина 1 з 2» line, because there are no parts.

### 23.8.6 Internal notes and customer history

`Order.internalNote` (§25.5) is rendered on an amber surface with an explicit
"не видно клієнту" label. `Order.customerNote` sits immediately above it on a neutral surface.
Two note fields that look alike will eventually put an internal comment in front of a customer.

Threaded, attributed notes are written as `OrderEvent` rows with `type = 'note_added'`, giving
author and timestamp without a new table.

The customer panel resolves history by `Order.email` — not by `customerId`, which is null for
guest checkout (§25.5) — and shows lifetime order count, lifetime value, average order value,
last order date, return and cancellation count, and any linked `Customer` record. For a
business whose highest-value buyers are repeat and offline-acquainted, knowing that the caller
has ordered four times before changes how the conversation goes.

#### The Клієнти module is read-only, and there are no accounts to manage

[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent. A
`Customer` row is therefore **an order-derived record, never an identity** — it has no
`passwordHash`, no sessions, no email verification and no way to log in
([25](25-database-schema.md) §25.6). Resolving history by email rather than by `customerId`, which
this section already did, turns out to have been the right shape all along; now it is the only
shape.

What the module shows:

| Column / panel | Source |
|---|---|
| Email, name, phone | Latest `Order` fields, with `Customer` as the consolidated record |
| Lifetime orders, lifetime value, AOV, last order | Aggregated over `Order` by email |
| Returns and cancellations | `OrderEvent` history |
| Locale and marketing consent | `Customer.locale`, `Customer.acceptsMarketing` |
| Order history | Click-through to each order's detail. Every purchase is one order, so the lifetime count is the purchase count with nothing to group ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) |

What the module does **not** show, because none of it exists:

- Account status, password reset, "force logout", or session list — there are no customer sessions
- Saved addresses as an editable address book — `CustomerAddress` rows are order-derived
- Wishlist contents — the wishlist is `localStorage` only, has no server record, and
  `WishlistItem` is removed from the schema ([25](25-database-schema.md) §25.8b)
- Email verification state, marketing double-opt-in management beyond the
  `NewsletterSubscriber` view, or any "impersonate customer" affordance

Three write actions remain, and they are the only ones:

| Action | Permission | Note |
|---|---|---|
| Correct a name, phone or locale | `customers.update` | Support fixing a typo taken over the phone. Never a credential change, because there is no credential. |
| Toggle marketing consent | `customers.update` | Records the instruction and its source in `AuditLog`; the storefront writes this at checkout |
| Anonymise | `customers.anonymize` (`isDangerous`) | The GDPR erasure path for `pl` and `de` buyers. It never deletes `Order` rows — Ukrainian accounting retention and the immutability of `OrderItem` snapshots (§25.5) forbid it. The record is anonymised and unlinked; the order survives with its snapshots intact. |

Anonymisation being staff-operated rather than self-service is a direct consequence of §E12: with
no account to sign into, an EU data-subject request arrives by email and is actioned by a human.
That makes the `customers.anonymize` permission and its audit entry the entire compliance record
for erasure, which is why it is `isDangerous` and restricted to Owner and Administrator
([24](24-employee-permission-architecture.md) §24.5).

---

## 23.9 Reviews moderation

A queue, not a table. `ReviewStatus` is `PENDING | APPROVED | HIDDEN | REJECTED` (§25.6) and
the default view is `PENDING`, sorted oldest first, with keyboard-first operation:
`J`/`K` to move, `A` to approve, `H` to hide, `R` to reject, `Enter` to reply.

Each card shows rating, title, body, author, product, submitted date, the verified-purchase
state, and attached photos. Approve, reject with a reason, hide, and reply inline. A reply
writes `Review.reply`, `repliedById` and `repliedAt`.

Two rules with teeth:

- **`HIDDEN` and `REJECTED` are different states and the UI never blurs them.** `HIDDEN` is a
  valid review withheld for a reason (it names a competitor, it contains a phone number);
  `REJECTED` is spam or abuse. Statistics and any future export treat them differently.
- **Only `APPROVED` reviews with `isVerifiedPurchase` feed the aggregate rating** in structured
  data (§25.6). The moderation UI states this beside the verified badge so nobody assumes
  approving a review changes the star rating on Google. Emitting an inflated `AggregateRating`
  is simultaneously a structured-data violation and a trust failure.

#### The parcel card, and the verified badge staff must not be able to set

[00-client-decisions-4.md](00-client-decisions-4.md) §G4 confirms that **a business card already
ships in every parcel** — the infrastructure exists, is already paid for, and is already in the
hand of someone who just bought something. The recommendation is a short URL plus a QR code to a
review page; a single link, no per-order codes, no variable printing.

That route produces reviews with **no order linkage**, so `isVerifiedPurchase` stays `false` and
they are excluded from the aggregate rating. The caveat §G4 records — «that is correct and must not
be worked around» — lands squarely on this screen, because this is where the working-around would
happen. A moderator reading a detailed, plainly genuine review from a customer they remember
serving will want to mark it verified, and they will be right about the customer and wrong about
what the badge means.

So the queue draws the distinction and does not offer the edit:

```
┌ Відгук · очікує ─────────────────────────────────────────────────────────┐
│  ★★★★★  «Ліжник неймовірний, друга покупка»                             │
│  Оксана Д. · Ліжник «Черемош» · 3 жовтня                                  │
│                                                                           │
│  ⬡ НЕПІДТВЕРДЖЕНА ПОКУПКА · надійшов за візиткою з посилки                │
│    Не впливає на рейтинг у Google. Підтвердити вручну неможливо —         │
│    підтвердження дає лише посилання з листа про замовлення.               │
│                                                                           │
│                       [Схвалити A]  [Приховати H]  [Відхилити R]  [↩ Enter]│
└───────────────────────────────────────────────────────────────────────────┘
```

| Rule | Reasoning |
|---|---|
| **`isVerifiedPurchase` is read-only in the admin.** There is no control, no bulk action and no import column that sets it | The field is written only by `guestToken` resolution against a `DELIVERED` order ([26-api-architecture.md](26-api-architecture.md) §26.10.7), and the API rejects the field outright if it is sent. An editable badge would eventually be set in good faith on a review the business cannot evidence, and the assertion goes to Google, not to a colleague |
| **The source is named, not just the state** | «Надійшов за візиткою з посилки» tells a moderator *why* it is unverified. «Непідтверджена» alone reads as a defect to be fixed, which is exactly the reading that produces a request for an override button |
| **Unverified reviews are still approved, published and visible** | They are excluded from the aggregate, not from the page. On a domain with zero reviews at launch, visible social proof is the scarce asset; a strict aggregate and a generous display are compatible positions and this is the correct pair |
| **The queue shows a verified/unverified split in its header** | Three verified reviews is the threshold at which `AggregateRating` is emitted at all ([29-seo-architecture.md](29-seo-architecture.md)). The count that matters for that is not the count in the queue, and a moderator who cannot see the difference will believe the site has fifteen reviews' worth of stars |

The counter customer is why this route exists at all: the buyer in the Яворів shop has no order
number, no confirmation email and no other prompted path back to the site. Their review is
unverified by construction, genuinely valuable, and correctly outside the aggregate.

On a cold-start domain with no migrated testimonials
([00-client-decisions.md](00-client-decisions.md) D2), the review queue will be empty at
launch. The empty state says so honestly and links to the post-purchase review request setting
rather than pretending the feature is broken.

---

## 23.10 Blog editor

The blog is not a side feature here. With no domain authority and a 3–6 month organic dead zone
(D2, consequence 2), **long-tail informational content is the realistic organic entry point** —
"що таке ліжник", "гуня чи накидка", wool-versus-synthetic, care guides. The editor is therefore
built for volume and for translation, not for typographic flourish.

- **Body is a structured document** stored as `PostTranslation.bodyJson` with a generated
  `bodyPlain` (§25.8). TipTap over a constrained schema: headings h2–h4 only (h1 is the title,
  enforcing the gapless outline in [10-typography.md](10-typography.md) §10.8), paragraph,
  bold, italic, link, ordered and unordered list, blockquote, image with required alt, product
  embed, comparison table, callout, and a figure with caption. **No arbitrary HTML, no font
  controls, no colour picker.** Every formatting control a CMS exposes is a way to break the
  design system, so the list of controls *is* the design decision.
- **`bodyPlain` is generated on save**, not at query time, because it feeds Postgres full-text
  search and the AI-extraction pipeline in
  [30-ai-search-optimization.md](30-ai-search-optimization.md).
- **Product embeds** resolve live at render, so a price change does not leave a stale number in
  an article.
- **`PostStatus` is `DRAFT | SCHEDULED | PUBLISHED | ARCHIVED`.** `SCHEDULED` requires
  `scheduledFor`; a worker promotes it, and the admin shows the queue so an editor can see what
  goes out on Friday.
- **Per-locale editing** with the same completeness dots. A post may legitimately be published
  in `uk` and draft in `de`; the status is per translation for publication purposes even though
  `PostStatus` is on the parent — the admin refuses to serve a locale whose translation row is
  absent and reports it in the translation queue.
- **Reading time** is computed into `readMinutes` on save.
- **SEO panel** per locale: title, description, a live SERP preview, slug with a redirect
  offer, and an internal-link suggester that surfaces existing posts and products matching the
  article's terms. Internal linking is one of the few ranking levers a new domain fully
  controls, so it is a first-class affordance rather than a manual discipline.

---

## 23.11 Gallery and albums

`MediaAlbum` (§25.8) with a `key`, a cover, `isPublic`, `position` and per-locale translations.
The public gallery is a genuine brand asset: it is where the factory becomes visible, which is
the whole strategy in [01-brand-strategy.md](01-brand-strategy.md) §1.1.

The album editor is a drag-to-reorder grid with multi-select, bulk alt-text entry per locale,
and bulk album assignment. **Bulk alt entry matters**: an album of 60 production photographs
needs 240 alt strings across four locales, and a per-image modal makes that a week's work
instead of an afternoon.

Albums are the one place a `VIDEO` `MediaKind` appears in quantity — factory footage is rank-1
trust evidence (§1.8). Video requires a poster frame (`Media.posterId`) before it can be made
public, because a video with no poster renders as a black rectangle above the fold.

---

## 23.12 Promotions, banners, and the homepage hero

Three related surfaces, deliberately separate models (§25.8).

### Promotions

`Promotion` covers `PERCENTAGE`, `FIXED`, `FREE_SHIPPING` and `BUNDLE`, with a null `code`
meaning automatic. The editor exposes value, minimum subtotal, usage limit, per-customer limit,
product and category scoping, and a date window. Three things the form does that a naive form
does not:

- **A live preview of the effect on a real basket** — pick a product, see the resulting price.
  Percentage promotions interacting with variant price ranges are hard to reason about in the
  abstract and easy to reason about with a number in front of you.
- **Overlap detection.** Creating a promotion whose window and scope intersect an existing one
  raises a warning naming the other promotion. Stacked discounts that nobody intended are how a
  premium brand accidentally sells at cost.
- **`usageCount` is read-only and visible.** Editors ask "has anyone used this" constantly.

### Banners and the announcement bar

`Banner` is keyed by `placement` (`home_hero`, `category_top`, `announcement_bar`) with
separate desktop and mobile media, a link, a window, and per-locale text. Constraints enforced
by the editor, not by hope:

- **Text is never baked into the image.** [10-typography.md](10-typography.md) §10.8 forbids
  text as an image, and the banner editor is the most likely place for that rule to be broken.
  Headline and subhead are fields; the image is imagery.
- **Focal point and text-safe zone are required** for any banner with text, so crops at other
  aspect ratios cannot move a headline onto a busy region
  ([09-color-palette.md](09-color-palette.md) §9.6).
- **A contrast check runs on save**, sampling the text-safe zone against the chosen overlay
  treatment and refusing to publish a combination below AA.
- **Mobile media is separate, not derived.** A 21:9 hero cropped to 4:5 is unusable; the
  storefront is majority mobile.

### Homepage hero manager

A small ordered list of hero slides with a live preview at three breakpoints. Two hard rules:
a maximum of {{HERO_SLIDE_MAX}} (default 3) slides, because the fourth is never seen; and
**partner-manufactured products cannot be selected for the hero** — the query is filtered to
`origin = OWN_MANUFACTURE` per [00-client-decisions.md](00-client-decisions.md) D3.5. The
picker shows partner products disabled with the reason rather than hiding them, so an editor
searching for one understands why it is unavailable instead of assuming a bug.

---

## 23.13 Leads inbox

Wholesale and dropshipping enquiries arrive as `Lead` rows (§25.8). Dropshipping is an
explicitly offered model and is a distinct lead type, so `LeadKind` carries a `DROPSHIP` member
alongside `WHOLESALE`, `PRIVATE_LABEL`, `PRESS` and `GENERAL`.

The inbox is an email client, not a CRM (§23.2): list on the left, detail on the right, status
chips along the top. `LeadStatus` moves `NEW → CONTACTED → QUALIFIED → WON | LOST | SPAM`, with
assignment to a staff user, an internal note field, and the full context the form captured —
company, country, business type, estimated volume, interested products, `sourcePath` and `utm`.

Three deliberate features:

- **Reply is written in the panel** (§23.13a), in a mail thread linked to the lead, and the
  first reply stamps `CONTACTED`. This replaces the earlier `mailto:` design: once
  [00-client-decisions-7.md](00-client-decisions-7.md) §K2 put business mail in the panel, the
  inbound pipeline that made `mailto:` the cheaper option exists anyway.
- **The `utm` and `sourcePath` payload is shown, not hidden.** During the cold-start period the
  only way to learn whether Instagram or Google Business Profile produces qualified wholesale
  leads is to look at where they came from, one at a time.
- **SLA colouring**: a `NEW` lead older than {{LEAD_SLA_HOURS}} (default 24) turns amber, older
  than 72 hours turns red. A wholesale enquiry is worth many retail orders, and the failure
  mode is not rejection — it is silence.

---

## 23.13a Mail

[00-client-decisions-7.md](00-client-decisions-7.md) §K2: the owners read and answer business
mail here, not in Gmail. Data in [25-database-schema.md](25-database-schema.md) §25.8c, pipeline
in [26-api-architecture.md](26-api-architecture.md) §26.16.2, threats in
[32-security-architecture.md](32-security-architecture.md) §32.16a.

The sidebar gains **Пошта** under ПРОДАЖІ, above Замовлення, with an actionable badge (shell rule
1): open threads in the user's mailboxes that are unassigned or assigned to them.

```
┌ Пошта ───────────────────────────────────────────────────────────────────────────────┐
│ info@ ▾                                                                              │
│ ┌──────────────────┬───────────────────────────────┬────────────────────────────────┐ │
│ │ Потрібна відпов.4│ Олена Коваль           14:02  │ Розмір ліжника під замовлення   │ │
│ │ Мої            2 │ Розмір ліжника під замовл…    │ olena.k@… · ✓ підпис перевірено │ │
│ │ Чекаємо клієнта  │ ● VCH-26-0417                 │ ─────────────────────────────── │ │
│ │ Закриті          │──────────────────────────────-│ Добрий день! Чи можна зробити   │ │
│ │ Надіслані        │ Jan Nowak            вчора ⚠  │ 180×210 замість 200×220?…       │ │
│ │ Спам             │ Pytanie o wysyłkę do Polski   │                                 │ │
│ │                  │                               │ 📎 foto-kimnaty.jpg  1.2 МБ     │ │
│ │                  │ Nova Poshta ⚠ неперевірений   │ ─────────────────────────────── │ │
│ │                  │ Термінова оплата накладної    │ Відповідь…                      │ │
│ │                  │                               │ [Надіслати]  [Закрити] [Спам]   │ │
│ └──────────────────┴───────────────────────────────┴────────────────────────────────┘ │
│  Контекст: VCH-26-0417 · IN_PRODUCTION · 12 400 ₴ · 3-є замовлення цього клієнта      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

| Element | Behaviour |
|---|---|
| **Unread / read** | Client-specified ([00-client-decisions-8.md](00-client-decisions-8.md) §L8). **Unread:** row on `--bg-surface` (`forest-900`, one step brighter than the list's `--bg-page`, `forest-950`) and an 8 px dot in `--info` (`sky-300`) before the sender. **Read:** `--bg-page`, no dot. Text colour does not change between the two — the client specified brightness and the dot, nothing else. The dot carries `aria-label="Непрочитаний"`, so the state is not colour-only |
| **Status folders** | `OPEN` = «Потрібна відповідь», `WAITING` = «Чекаємо клієнта», `CLOSED`, `SPAM`, plus «Мої» and «Надіслані» as filters. Replying moves a thread to `WAITING`; the customer's next message returns it to `OPEN`. Nobody files mail by hand |
| **SLA colouring** | As §23.13: an `OPEN` thread older than `{{MAIL_SLA_HOURS}}` (default 24) turns amber, 72 h red |
| **Context strip** | The linked order (number, status, total), the customer's order count by email (§23.8.6) and the linked lead. «Прив'язати до замовлення» when the link was only suggested (§26.16.2) |
| **Authentication line** | «✓ підпис перевірено» or a red «неперевірений відправник» banner, and the lookalike warning, per §32.16a. Shown on every message, not hidden in a details pane |
| **Remote images** | Blocked, with «Показати зображення» and «Завжди для цього відправника» |
| **Attachments** | Name, size, a risk warning where flagged; download only, except raster image thumbnails |
| **Composer** | Rich text limited to bold, italic, links and lists; mailbox signature appended; attachments; draft autosaved to the server so it survives switching from laptop to phone. No auto-translation: a `pl` customer is answered in whatever language the owner writes |
| **Transactional messages** | Shown in the thread in a muted style with the template name, so staff see exactly what the customer received. Secret-bearing templates show «лист надіслано, вміст не зберігається» |
| **Order and lead pages** | Show their linked threads, and «Написати клієнту» opens a new thread from there |

### When a thread counts as read

The owner's rule is "I opened it, then left it — it is read." Implemented as:

1. The client tracks the **last message rendered** in the open thread.
2. On leaving — selecting another thread, returning to the list, navigating to another section,
   or the page being hidden or closed (`visibilitychange` / `pagehide`, sent with
   `navigator.sendBeacon` so it survives the tab closing) — it posts `read { upToMessageId }`
   (§26.16.2).
3. The server records `readAt` as **that message's time**, not the current time. A message
   that arrived while the thread was open but was never rendered stays unread. This is the whole
   point of recording "up to", and it is what stops a customer's second message disappearing
   under the first.
4. A new inbound message raises `lastInboundAt` past `readAt`, so the thread turns unread — bright
   row, blue dot — with no extra state to manage.
5. «Позначити непрочитаним» (keyboard `u`) clears it, for mail the owner wants to come back to.

Opening a thread and leaving within a moment still marks it read — the owner's rule, applied
literally. A dwell-time threshold was considered and rejected: it makes the behaviour
unpredictable, and "why is this still unread, I opened it" is worse than the rare accidental read.

### Phone-first, by exception

§23.2 says the admin is not mobile-first except the warehouse surfaces. **Mail is the second
exception.** The owners answer customers from their phones today; if the panel is worse at that
than Gmail, mail goes unanswered. Below 768 px the three panes stack into list → thread →
full-screen composer, and «Пошта» takes a slot in the bottom tab bar (§23.17).

**Notifications.** The panel is installable (web app manifest) and sends a Web Push notification
for each new message in a mailbox the user belongs to. On iPhone, Web Push works only after the
panel is added to the home screen — onboarding for the owners includes doing that on their
phones, in person. As a fallback, each user may enable a **content-free** notice email to their
external login address («Нові листи: 3 — відкрийте панель»); it never contains the message. At
launch that address is Іван's `gif19601@gmail.com` ([00-client-decisions-8.md](00-client-decisions-8.md) §L1).

### Keyboard

Added to §23.16: `j` / `k` next and previous thread, `r` reply, `e` close, `!` spam, `a` assign
to me, `u` mark unread.

## 23.14 Search-query log as a merchandising tool

[25-database-schema.md](25-database-schema.md) §25.9 is explicit: `SearchQueryLog` is not
analytics decoration, and zero-result queries are the highest-signal merchandising input a
store has. The admin therefore surfaces it as a work queue, not a chart.

```
┌ Пошукові запити · 30 днів ───────────────────────────────────────────────┐
│ [Усі] [Без результатів 24] [Без кліку] [Локаль ▾]                        │
│ ┌──────────────────┬────────┬──────────┬─────────┬──────────┬──────────┐ │
│ │ Запит            │ Локаль │ Запитів  │ Знайдено│ Клік     │          │ │
│ ├──────────────────┼────────┼──────────┼─────────┼──────────┼──────────┤ │
│ │ гуня чоловіча    │ uk     │  38      │    0    │    —     │ [Дія ▾]  │ │
│ │ ліжник 200х220   │ uk     │  31      │    0    │    —     │ [Дія ▾]  │ │
│ │ wool blanket     │ en     │  22      │    4    │   5 %    │ [Дія ▾]  │ │
│ │ пряжа меринос    │ uk     │  17      │    0    │    —     │ [Дія ▾]  │ │
│ └──────────────────┴────────┴──────────┴─────────┴──────────┴──────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

Each row's action menu offers the four things a merchandiser actually wants to do: create a
synonym, pin a product to the query, create a category or landing page, or dismiss the query as
irrelevant. Without those actions the screen is a list of disappointments; with them it is a
backlog.

The examples above are the realistic pattern for this catalogue. `ліжник 200х220` returning
zero results means size is being typed as a query while it exists only as a variant option —
a search-indexing gap, not a stock gap. `пряжа меринос` returning zero means a composition the
business does not stock, or does stock and has not labelled. `гуня чоловіча` returning zero
with 38 searches is a product decision. Three different responses, all invisible without this
screen, and all far more valuable on a cold-start domain where every visitor was expensive to
acquire.

Zero-result queries also feed the blog backlog (§23.10): a query with demand and no product is
frequently a query with demand and no *content*, which is the cheapest thing to fix.

---

## 23.15 Settings

`Setting` is a key/value JSON store (§25.9) with a typed registry in code, so the admin renders
a real form per group rather than a JSON textarea.

| Group | Contents | Permission |
|---|---|---|
| Store | Legal name, address, **ordered phone numbers**, email, working hours including Sunday, Google Business Profile link | `settings.update` |
| Locales | Enabled locales, default locale, per-locale currency display | `settings.update` |
| Delivery | Nova Poshta and Ukrposhta credentials, rates, free-shipping threshold {{FREE_SHIPPING_THRESHOLD}}, pickup availability | `settings.update` |
| Payment | Enabled methods, manual bank details, prepayment percentage, WayForPay keys | `payment_settings.update` — separate and dangerous |
| Email | Sender identity, per-locale templates with a live preview, test send | `settings.update` |
| SEO | Default meta patterns, robots directives, sitemap controls, verification tokens | `settings.update` |
| Integrations | Cloudinary, analytics, webhook endpoints, API keys | `settings.manage_integrations` — dangerous |
| Redirects | `Redirect` table CRUD with hit counts | `settings.update` |
| Announcement | The dashboard notice from widget 9 | `settings.update` |

Payment settings are a separate permission from general settings because the blast radius is
money, and the person who edits opening hours is not necessarily the person who may change
where card payments land. Secrets are write-only: the field shows `••••1234` and accepts a
replacement, never returning the stored value to the browser.

#### Phone numbers are an ordered list, and the legal name is not a phone number

[00-client-decisions-4.md](00-client-decisions-4.md) §G1 fixes the contact hierarchy, and it
**reverses** the earlier decision recorded in
[15-navbar-specification.md](15-navbar-specification.md).

| Position | Number | Person |
|---|---|---|
| **Primary** | `+380679973450` | Гондурак Іван Федорович — owner of production |
| **Fallback** | `+380679604769` | Гондурак Любов Юріївна — deputy, ФОП seller of record |

The Store group therefore stores phones as an **ordered list of `{ number, name, role }`**, not as
`phone` and `phone2`. Order is meaningful — the header renders position one and nothing else, the
footer and contact page render both in order, and `LocalBusiness.telephone` takes position one
alone because the property is singular in practice. Two flat fields would make the ordering
implicit, and implicit ordering is what produces a header showing the wrong number after someone
edits the "second" one.

**The split between who trades and who answers is deliberate and the settings form must not
flatten it.** Legal pages, the Impressum and the offer contract name **Любов**, because they name
the ФОП rather than the person who picks up the phone; those strings live in the Legal group and
are sourced from the ФОП record, never from `phones[0].name`. A legal page naming the wrong person
is a defect; a header naming the person who actually answers is correct. The form states this
inline on both fields, because the two are otherwise obviously the same thing and someone will
eventually make them consistent.

Every settings write produces an `AuditLog` row with a before/after diff, secrets redacted to
`[redacted]` in both halves. The diff must record *that* a key changed without recording the
key itself.

---

## 23.16 Keyboard shortcuts and the command palette

The Notion half of the reference set. A person who uses this tool daily for a year should be
able to reach any screen without touching a mouse.

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Command palette |
| `G` then `D` / `P` / `O` / `C` / `L` | Go to Dashboard / Products / Orders / Categories / Leads |
| `/` | Focus the current list's search field |
| `N` | New entity in the current context |
| `⌘S` | Save |
| `⌘Enter` | Save and close |
| `E` | Edit the focused row |
| `J` / `K` | Next / previous row |
| `X` | Toggle selection on the focused row |
| `⇧`+click | Select range |
| `A` / `H` / `R` | Approve / hide / reject — reviews queue only |
| `?` | Shortcut reference |
| `Esc` | Close modal, clear selection, exit the palette |

The palette is not a launcher menu. It searches three namespaces at once and labels each group:

1. **Navigation** — every permitted route.
2. **Entities** — products by name or SKU, orders by number or customer, categories, posts,
   customers. Server-side, debounced at 180 ms, capped at 5 results per type.
3. **Actions** — "Створити товар", "Імпорт CSV", "Друк ТТН для обраних", "Звірити оплату",
   scoped to the current context and filtered by permission.

Entity search inside the palette is what makes it worth building: a manager on a phone call
types an order number and is on the order in under a second, which is the single most frequent
interaction in the whole panel. Results the user lacks permission to open are not returned by
the server, so the palette cannot be used to enumerate resources — a hidden route is never a
security boundary
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.14), but
neither should it leak.

Per [13-motion-system.md](13-motion-system.md) §13.11 the palette does not animate open: it
appears. Every shortcut is discoverable — the `?` sheet lists them, and menu items display
their accelerator.

---

## 23.17 Offline and poor-connection behaviour

This section exists because of a specific, concrete user: warehouse staff in Kosiv district,
on a phone, in a building with thick walls, on a rural mobile network. For that person, a
spinner is a broken application.

### The mobile warehouse surface

Below 768 px the admin becomes a four-tab application — **Замовлення**, **Склад**, **Пошук**,
**Ще** — and the modules that only make sense on a laptop (bulk editing, CSV import, settings,
blog) are not rendered at all. Shipping a responsive version of a data grid to a phone produces
something technically present and practically unusable; shipping four screens that do one job
produces a tool.

```
┌───────────────────────────┐
│ ⚠ Офлайн · 2 у черзі      │   ← persistent, not a toast
├───────────────────────────┤
│ VCH-25-0417   ПАКУЄТЬСЯ   │
│ Ковальчук О.    10 460 ₴  │
│ ───────────────────────── │
│ ☑ Ліжник «Черемош» ×1     │
│ ☐ Шкарпетки 39–41  ×2     │
│ ───────────────────────── │
│ [Зібрано]   [Друк ТТН ⚠]  │
│              недоступно   │
│              офлайн       │
└───────────────────────────┘
```

### The offline model

| Capability | Offline behaviour |
|---|---|
| Read today's orders, their items, addresses and TTNs | **Works.** Pre-cached on login and refreshed on every foreground |
| Read product stock and SKUs | **Works**, from the last sync, with the sync timestamp displayed |
| Mark items picked, change order status, add a note | **Queued.** Applied locally, replayed on reconnect |
| Create a TTN, print a label, reconcile a payment | **Blocked**, with the reason shown on the disabled control |
| Anything in the catalogue, content or settings modules | **Not available** — those screens require a laptop anyway |

Implementation:

- A **service worker** with a cache-first strategy for the app shell and a
  stale-while-revalidate strategy for order and stock data, scoped to `/admin` only.
- **IndexedDB** holds the cached read model plus a **mutation queue** of intent objects —
  `{ id, method, path, body, createdAt, attempts }` — not raw HTTP requests, so a queued
  mutation can be re-validated against current server state at replay time.
- **Every queued mutation carries a client-generated idempotency key**, so a replay that
  succeeded before the acknowledgement was received cannot double-apply.
- **Replay is sequential per entity** and stops that entity's queue on the first conflict,
  rather than plunging ahead and producing a nonsensical end state.
- **The queue is visible and inspectable**, in the topbar `⟳ n` chip and as a list under
  "Ще". A worker must be able to answer "did my last hour of scanning save?" without asking
  anyone.
- **The offline indicator is persistent**, never a toast. A toast that has dismissed cannot
  tell you your last three actions are still pending.
- **Slow is treated as offline.** `navigator.connection.effectiveType` of `2g`, or three
  consecutive requests exceeding 8 s, flips the client into queued mode rather than leaving a
  spinner running. A 30-second request that eventually succeeds is a worse experience than an
  honest "queued".

Printing genuinely requires the network — Nova Poshta issues the document — so it is disabled
rather than faked. A cached PDF from an earlier successful call remains reprintable offline,
which covers the common case of a label that failed to print the first time.

---

## 23.18 Optimistic updates and conflict handling

The admin is optimistic by default for low-risk mutations and pessimistic for anything
involving money, publication, or permissions. The split is not a performance decision; it is a
consequence of §23.1 principle 4.

| Optimistic | Pessimistic — awaits the server |
|---|---|
| Field edits within an open editor | Publish and unpublish |
| Reordering categories, media, variants | Price changes |
| Toggling `isFeatured`, `isActive`, flags | Payment reconciliation and refunds |
| Adding an internal note | Order status transitions |
| Review approve/hide/reject | TTN creation |
| Marking items picked | CSV import commit, bulk operations |
| Lead status and assignment | Anything `isDangerous` |

Optimistic mutations use TanStack Query's `onMutate` / `onError` / `onSettled` triad: snapshot
the cache, apply the change, roll back on failure, and always invalidate. Rollback surfaces a
toast naming the entity and the failed action — a silent revert is worse than an error, because
the user believes the change persisted.

### Conflict detection

`Product.updatedAt` (§25.3) is the concurrency token. There is no reason to add a version
column when every mutable model already carries one.

```ts
// Every admin PATCH carries the version the client last read.
export interface VersionedUpdate<T> {
  id: string;
  expectedUpdatedAt: string;   // ISO, echoed from the read
  patch: Partial<T>;
}

// 409 response body
export interface ConflictResponse<T> {
  code: 'CONFLICT';
  currentUpdatedAt: string;
  updatedBy: { id: string; name: string };   // who, by name — never an opaque id
  /** field → { yours, theirs, base } for the intersection of changed fields */
  conflicts: Record<string, { yours: unknown; theirs: unknown; base: unknown }>;
  /** Fields you changed that they did not: safe to re-apply as-is. */
  mergeable: Array<keyof T>;
}
```

The resolver is a three-column dialog — **Ваша версія · Їхня версія · Результат** — with
per-field selection. Fields that do not conflict are merged automatically and shown as already
resolved, so a real conflict over one price does not force a manual review of forty untouched
fields.

Why this rather than last-write-wins: last-write-wins silently discards work, and in a
four-person team the discarded work is usually the translation someone spent an hour on. Why
this rather than CRDTs or real-time collaboration: the conflict rate is genuinely low, and the
cost difference is weeks (§23.2).

Two structural protections beyond the dialog:

- **Stock is never optimistic and never patched as an absolute.** Stock changes are submitted
  as deltas (`{ variantId, delta: -1, reason }`) and applied server-side in a transaction.
  Two people picking the same order with absolute writes would overwrite each other's
  decrements; deltas commute and therefore cannot.
- **Bulk operations verify `expectedCount`** (§23.6.7), which is the batch-level equivalent of
  the same idea.

---

## 23.19 Performance and bundle strategy

The admin is **code-split away from the storefront entirely** — not as a lazy route inside the
public app, but as a separate Vite entry producing a separate bundle, served from `/admin`,
sharing only the token layer and a small set of primitives.

```
apps/
  storefront/      vite.config.ts  → dist/          public bundle
  admin/           vite.config.ts  → dist/admin/    admin bundle
packages/
  tokens/          the only shared design dependency (08-design-system.md §8.9)
  ui-primitives/   Box, Stack, Text, VisuallyHidden — zero business logic
  api-types/       shared TypeScript contracts, types only, no runtime
```

### Why a separate entry rather than a lazy route

A lazy route still shares the storefront's dependency graph, its providers, its i18n bundle and
its router configuration. In practice that means storefront changes cause admin regressions and
admin dependencies leak into storefront chunks. The storefront targets Lighthouse 98–100
([13-motion-system.md](13-motion-system.md) §13.5); the admin is behind a login and is measured
by different criteria. Two builds keeps one budget from being spent on the other's needs, and
it makes the leak structurally impossible rather than merely discouraged.

### Admin budgets

| Metric | Budget | Rationale |
|---|---|---|
| Initial admin bundle, gzip | ≤180 KB | Shell, router, auth, query client, dashboard |
| Per-module lazy chunk | ≤90 KB | Products, orders, content, settings each load on first navigation |
| Storefront bytes containing admin code | **0 KB** | Asserted in CI by scanning storefront chunks for admin module identifiers |
| Framer Motion in the admin | **0 KB** | §13.11 — the admin animates nothing beyond CSS state changes |
| Rich-text editor | Lazy, blog module only | TipTap loads when the blog editor opens, never before |
| CSV parser | Lazy, import flow only | Loaded on step 1 of the import wizard |
| Chart library | Lazy, dashboard only, ≤25 KB | Sparklines are inline SVG; only the revenue chart justifies a library |
| Time to interactive, cable, cold cache | ≤2.5 s | Staff open this several times a day |

### Techniques

- **Route-level code splitting** per module, prefetched on sidebar hover — a 200 ms head start
  that costs nothing when the user does not click.
- **Virtualised tables** for every list that can exceed 100 rows. Rendering a thousand DOM rows
  is what makes admin panels feel slow.
- **Server-side pagination, filtering and sorting.** The client never holds the catalogue.
- **A single batched dashboard request** (§23.5).
- **No storefront webfont loading in the admin.** `e-Ukraine` only; the display serif and its
  Cyrillic subset are absent, saving roughly 40 KB before anything else is optimised.
- **Icons are a tree-shaken per-icon import**, never a sprite sheet of the full set.
- **TanStack Query with a persisted IndexedDB cache** so a returning session paints from cache
  before the network answers — which is also the mechanism §23.17 relies on.

---

## 23.20 Open questions

These belong to this document specifically and are additional to
[00-client-decisions-2.md](00-client-decisions-2.md) §E13.

**Closed by [00-client-decisions-5.md](00-client-decisions-5.md) and
[00-client-decisions-4.md](00-client-decisions-4.md):**

| Was | Resolution |
|---|---|
| How is a custom size priced? (§H5 item 1) | **§H3c: the owner sets a rate per square metre in the admin and the system computes `max(area × rate, floor)`.** Not a percentage uplift, not a manual quote. §23.6.4b is the editor surface, including the required bounds, the live preview and the audit rule |
| Should a category rate inherit into the product? | **§H3c: copied on create, never referenced at runtime.** `Product` is the sole source of truth at pricing time; editing a category rate changes nothing for existing products, and an opt-in bulk apply gives the owner the convenience without the silent reprice (§23.6.4b) |
| Does made-to-order require prepayment? (§G5 item 4) | **§H1.1: yes, in full, online, enforced server-side.** COD is absent from the derived payment-method set for any cart containing a custom-size line |
| Quote turnaround and validity (§G5 item 2) | **§H2: 48 working hours SLA, 72-hour validity, 36 for one-of-one.** §23.8.3a surfaces age against the SLA and makes an expired quote re-issuable |
| Who owns international quotes (§G5 item 3) | **§H3: Гондурак Любов Юріївна**, as a queue default rather than a constraint (§23.8.3a) |
| Should the admin carry a workshop-visit booking system? | **§G3: no.** Tours are arranged by phone with Іван. Recorded as an anti-goal in §23.2 so it is not added later by someone being helpful |

**Closed by [00-client-decisions-2.md](00-client-decisions-2.md):**

| Was | Resolution |
|---|---|
| Dye lots (D6.3) — variant field or attribute? | §E8: **not tracked**. The admin field is removed entirely; `ProductVariant.dyeLot` stays nullable and unused (§23.6.5). |
| `{{SKU_COUNT}}` (D6.6) | §E5: several hundred to roughly a thousand, from the catalogue import. Below the ~2,000 threshold, so no load-testing gate before build. |
| `{{PSP}}` | §E10: **WayForPay**. The reconciliation queue (§23.8.3) is still required, because COD and bank transfer continue regardless. |
| Partner naming (D6.2) | §E7: partners **cannot** be named. `partnerName` is internal-only and never public; `partnerRegion` carries the public disclosure (§23.6.3). |
| Whether customer accounts need admin screens | §E12: no accounts, ever. Клієнти is read-only (§23.8.6). |

**Still open:**

1. **WayForPay integration facts V6–V11** (§E10) — the available integration mode, signature
   scheme, webhook shape, refund support, ФОП eligibility and settlement currencies are all
   unverified. §23.8.3's reconciliation queue is unaffected, but the payments panel cannot render
   a refund control until V9 is answered, and it must not render one speculatively.
2. **Nova Poshta API access** — key issuance, rate limits, and whether label PDFs may be cached
   ([00-assumptions.md](00-assumptions.md) V2).
3. ~~**`{{INTL_CARRIER}}`** (§E11)~~ — **resolved by [00-client-decisions-3.md](00-client-decisions-3.md)
   F4, though not in the way the question assumed.** There is no single international carrier:
   Nova Poshta Global, Ukrposhta International and others are chosen per order. The token resolves
   to a `Setting`-backed list rather than a value, §23.8.3a's quote panel is the workflow, and
   §23.8.4's label printing stays domestic-only — an international order prints a packing slip with
   a manual-dispatch flag, which is now a permanent design rather than a stopgap.
4. **Who prints, and on what?** A 100×100 mm thermal printer and an A4 office printer imply
   different print stylesheets. Assumed both until confirmed.
5. **Warehouse device inventory** — Android version and browser determine whether the service
   worker strategy in §23.17 is fully available.
6. ~~**Are partner goods sold under the Вівчарик name or unbranded?** (§E13.5)~~ — **resolved.**
   [00-client-decisions-3.md](00-client-decisions-3.md) F3: «Так, продаються під брендом
   Вівчарик.» `brand` is Вівчарик on both origins; `manufacturer` is omitted entirely on partner
   goods. Implemented in §23.6.3 and made visible in §23.6.3a.
7. **Does the client's team have the capacity to run enquiry-then-invoice?**
   ([00-client-decisions-3.md](00-client-decisions-3.md) F4). §23.8.3a builds the tooling; whether
   quotes are answered within hours rather than days is an operational question the admin can
   measure but not solve. Now sharpened rather than resolved by
   [00-client-decisions-5.md](00-client-decisions-5.md) §H2 and §H3: the 48-hour SLA is a stated
   commitment and Любов is the named owner, so the question is no longer "who" but "can two people
   sustain it". Flagged in [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.11 as a
   capacity risk rather than a build item.
8. **Confirm the 48h/72h quote defaults** ([00-client-decisions-5.md](00-client-decisions-5.md)
   §H5 item 2). They are chosen to be safe for the business rather than impressive to the customer,
   and they are commitments the client should approve before launch rather than settings a
   developer picked.
9. ~~**Confirm the mixed-cart split into two orders**~~ — **closed.**
   [00-client-decisions-6.md](00-client-decisions-6.md) §J1: «Надіслати разом.» One order, one
   parcel, one delivery charge, dispatched after 14 days. §23.8.3c is rewritten around the mixed
   order; the split-pair view and the `Order.splitGroupId` addendum are deleted rather than kept
   as an option.
10. **Confirm the return-deposit copy before it ships**
    ([00-client-decisions-6.md](00-client-decisions-6.md) §J3 item 1). **The mechanic itself is
    confirmed by §J2 and is not provisional** — refused inspections are a cost the business is
    currently absorbing on both legs. What is open is the wording, which is the one rule on the
    site that can be misread as a hidden fee. The admin-side consequence is that §23.8.3b's panel
    text must match the storefront's exactly — staff explaining it on the phone should be reading
    the same sentence the customer read.
11. **Should a waived deposit have a value ceiling?** `payments.waive_deposit` is currently
    unbounded ([24-employee-permission-architecture.md](24-employee-permission-architecture.md)
    §24.17 item 8). Deferred until real return rates are known; until then the waiver count on the
    employee screen (§23.8.3b) is what makes the pattern visible.
12. **How is a custom-size product photographed?** §23.6.4a offers «Свій розмір» on a PDP whose
    gallery shows a standard piece. The photography brief has no shot for a size that does not
    exist, and a dimension diagram may be the honest substitute. Belongs with the Яворів shoot
    ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 9) rather than with the build.
