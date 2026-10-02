# Client Decisions — Round 12 (product admin interview)

Started 2026-09-30. **Highest-authority document** for how products are created and managed in
the admin: templates per product type, sizes, colours, materials, variants, prices and stock,
media, texts, and the safeguards that keep the storefront from breaking. Builds on
[23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6 and
[25-database-schema.md](25-database-schema.md) §25.3 (generic option types and values, attribute
definitions, `PricingUnit` = PIECE / KILOGRAM / SKEIN / METRE). Answers are recorded per block and
consolidated into a product-admin specification after the last block.

---

## Block 1 — product templates

| # | Question | Answer | Consequence |
|---|---|---|---|
| P1 | How a product is added | **A — choose a template first**, then only that template's fields | A `ProductTemplate` defines the axes (size, colour…), attributes, units and required fields; the storefront renders from the template, so every product of a type looks and filters the same |
| P2 | Templates at launch | **Ліжник/плед/ковдра, подушка, одяг (гуня, камізелька, накидка), шкарпетки, капці, пряжа/ровниця/вовна, овчина, шкіряні вироби, пояси** — nine | Seeded; each defined in block 2 onwards |
| P3 | Who edits templates | **B — Іван and Любов** (Owner and Administrator) | New permission `templates.manage` ⚠ for both roles |
| P4 | A field added to a template | **A — appears empty on existing products; the site hides it until filled** | Template changes never break published pages |
| P5 | Changing a product's template | **A — not allowed; copy into another template instead** | Protects variants, sizes and stock history |
| P6 | Category vs template | **A — the template suggests the category; it can be changed** | |
| P7 | Quick add | **A — «Копіювати товар»**: everything except photos, stock and name | Extends the sheepskin quick-add (round 10) to all products |
| P8 | Required before publishing | **Name, price, ≥ 3 photos, size(s), colour, composition, description, packed weight** | Requirements are **per template**: a size is required only where the template has sizes (not for yarn by weight), colour only where it has colours. Translation is not required — it runs automatically (round 10 §P8a) |
| P9 | Incomplete product | **A — a readiness meter «7 з 9» with the missing list**; «Опублікувати» disabled until complete | |
| P10 | Preview | **A — «Як це виглядатиме на сайті»**, desktop and phone | Renders the real product page from the draft, marked «Чернетка», `noindex` |
| P11 | Statuses | **A — Чернетка → Опубліковано → Архів** | Archived products leave the site (410 for its URL after a grace period of redirect to the category) but keep history |
| P12 | Partner goods | **A — the same template with a «Від партнерів» switch** | The site adds the partner label and omits «Історія виробу» automatically (round 11 U9) |
| P13 | Future wooden goods | **A — template prepared now, hidden** | Switched on when the ДЕРЕВО category launches |

---

## Block 2 — sizes per template

All recommended options chosen.

| # | Template / question | Answer | Consequence |
|---|---|---|---|
| S1 | Ліжник, плед, ковдра | **A — a size list in the template, edited by Іван** (150×200, 170×210, 200×220, 220×240…); products tick sizes | Sizes are shared `OptionValue`s of a template-level size axis — one filter vocabulary site-wide |
| S2 | Display | **A — name + cm: «Двоспальний · 200×220 см»** | Each size value carries a display name per locale and the dimensions |
| S3 | Size calculator | **A — computed: bed size + overhang set in the template** (e.g. +40 cm) | The calculator recommends the nearest listed size ≥ the need; offers «Свій розмір» when none fits and the product allows it |
| S4 | Clothing | **A — letters S–XXL + a size table in cm** | Chest and length per size in the template |
| S5 | Size table | **A — one per template, overridable per product** | |
| S6 | One-size garments | **A — «Універсальний розмір» with measurements in cm** | |
| S7 | Socks | **A — ranges 36–38, 39–41, 42–44, 45–46** | |
| S8 | Slippers | **A — each size 36–46 with insole length in cm** | |
| S9 | Pillows | **A — template list 40×40, 50×50, 50×70, 70×70**, extendable | |
| S10 | Belts | **A — length in cm as the size** (e.g. 90, 110, 130) | |
| S11 | Sheepskins | **A — actual length × width in cm entered per skin** | The size filter for sheepskins uses ranges derived from the measurements |
| S12 | Yarn, rovings, wool | **A — no size: skein weight, metres, thickness**; sold per skein or per kg, chosen per product | Maps to `PricingUnit` SKEIN / KILOGRAM |
| S13 | Order on the site | **A — automatically small to large**, «Свій розмір» last | Sort key stored on each size value |

---

## Block 3 — colours

All recommended options chosen.

| # | Question | Answer | Consequence |
|---|---|---|---|
| C1 | Where colours live | **A — one shared palette managed by Іван; products only pick** | Palette = the colour `OptionType`'s values, site-wide |
| C2 | Swatch | **A — a photograph of the real wool** | `OptionValue.swatchMediaId`; hex kept as a fallback for tiny sizes and admin lists |
| C3 | Catalogue filter | **A — every colour belongs to a family** (білий, сірий, коричневий, червоний, зелений, синій, чорний, натуральний, багатоколірний) | The filter lists families, not dozens of shades |
| C4 | Undyed colours | **A — palette flag «натуральний, без фарбування»**, shown on the product page | Set only where true (round 9 §F1: dyed material is bought) |
| C5 | Ornamented multi-colour pieces | **A — «Візерунок» as its own attribute** (Ромби, Смуги, Ялинка…) **+ 1–3 main colours** | Two filters: pattern and colour family |
| C6 | Colour names | **A — Іван writes Ukrainian names; other locales translate automatically** | e.g. «Вохра», «Смерековий» |
| C7 | Photos per colour | **A — upload straight into the colour's slot** | Choosing a colour on the site switches the gallery (round 10) |
| C8 | Deleting a colour in use | **A — not possible; only «приховати»** | Hidden colours stay on existing products and orders |
| C9 | Editing a palette colour | **A — changes everywhere at once**; the admin shows how many products it affects before saving | |
| C10 | Colour out of stock | **A — swatch crossed out but visible** | |
| C11 | First colour on the product page | **A — the one Іван marks as main**; if sold out, the next in stock | |
| C12 | Colour order | **A — Іван's order in the palette**, by drag | |
| C13 | Shade note | **A — «Відтінок може трохи відрізнятися від фото та між партіями»** | On dyed products only; consistent with E8 (dye lots not tracked) |

---

## Block 4 — materials and composition

| # | Question | Answer | Consequence |
|---|---|---|---|
| M1 | Materials | **A — a shared dictionary managed by Іван** | Овеча вовна, овчина, шкіра, бавовна, льон… |
| M2 | Composition | **A — percentages that must total 100%** | Save is blocked otherwise |
| M3 | Display | **A — short line by the price («100% овеча вовна») + detail in specifications** | |
| M4 | Ліжник warp and weft | **A — separate «Основа» and «Уток» fields** in the ліжник template | |
| M5 | Density g/m² | **A — template field, shown in specifications** with «чим більше — тим тепліше» | |
| M6 | Product weight | **A — per size** | Also feeds shipping cost and locker fit (round 10) |
| M7 | Pillow filling | **A — pick from a list** Іван extends | |
| M8 | Yarn thickness | **A — тонка / середня / товста + ply count + recommended needles** | Thickness becomes a yarn-category filter |
| M9 | Sheepskin fields | **Колір хутра, довжина ворсу (мм), тип вичинки** | |
| M10 | Leather fields | **Вид шкіри, колір, фурнітура, розміри в см** | |
| M11 | Care | **A — each material links to its section of the shared care page automatically** | |
| M12 | Material filter | **A — groups: вовна, овчина, шкіра, змішані** | |
| M13 | Claims without certificates | **B — no automatic check in the admin** | Client's choice. The copy rules still stand for text the project writes (D1, round 5 part 5 answer 8): no «гіпоалергенний», «екологічно чистий» or certification language; AI description drafts are generated under the same rule. What Іван types himself is his responsibility |

---

## Block 5 — variants, prices, stock

| # | Question | Answer | Consequence |
|---|---|---|---|
| V1 | Creating variants | **A — tick sizes and colours; all combinations are generated**; unwanted ones switched off | §23.6.4 generation rules stand (additive, never destructive, guard above 200) |
| V2 | Variant prices | **A — price per size, shared by all colours**; any single variant overridable | |
| V3 | Discounts | **A — % or new price, with start and end dates** | The old price is struck through automatically and restored when the sale ends |
| V4 | Stock | **A — per size and colour** | |
| V5 | Out of stock but can be made | **A — per-variant «Виготовимо під замовлення за N днів»** | Sets `madeToOrderDays` on the variant, so the round-5 rules follow automatically: **full prepayment, no cash on delivery**, the production time shown before purchase |
| V6 | Low-stock threshold | Skipped — default **A: one site-wide number (3)**, editable | |
| V7 | SKU | **A — generated: `VCH-LZ-0114-200-SI`** (type-number-size-colour), editable | `{{SKU_PATTERN}}` resolved |
| V8 | Barcodes | **A — not now** | |
| V9 | Yarn price | **A — price per skein; per 100 g and per kg computed** | Shown as a secondary line for comparison |
| V10 | Sheepskin price | **A — each skin its own price** | |
| V11 | Price history | **A — who changed which price and when** | From the audit log (§24.12), shown on the product |
| V12 | Sales in the Яворів shop | **A — «Продано в магазині» from a phone** | Decrements stock at once with source «магазин»; one-of-one sheepskins are archived on sale |
| V13 | Bulk edit variants | **A — select rows and change price or stock together** | Within one product's variant table — consistent with round 10 (stock edited in the product only) |

---

## Block 6 — photos and video

| # | Question | Answer | Consequence |
|---|---|---|---|
| F1 | Upload | **A — drag several at once, reorder by dragging** | |
| F2 | Quality check | **A — warns on small or blurred photos** | Minimum long edge and a sharpness estimate; a warning, not a block |
| F3 | Background | **A — natural, as shot** | No automatic background removal |
| F4 | Square crops | **A — automatic, with a focal point Іван clicks** | One focal point per photo drives every crop (card, thumbnail, social) |
| F5 | Main and hover photo | **A — first is main, second shows on hover** | Plain order, no flags |
| F6 | Interior / model tags | **B — no tags** | Order alone decides; the round-9 wish for an interior frame per textile family is a shooting guideline, not a system rule |
| F7 | Watermark | **A — none** | |
| F8 | Alt text | **A — composed automatically** («Ліжник Черемош, сірий, 200×220»), editable | Per locale via the translation flow |
| F9 | Video | **A — up to 30 s, compressed automatically, silent** | One clip per product family (round 9) |
| F10 | Video cover | **A — first frame, another selectable** | |
| F11 | Reusing photos | **A — a media library to pick existing photos** | |
| F12 | Deleting a photo in use | **A — shows where it is used and asks** | |

---

## Block 7 — names, descriptions, translation, badges, collections

| # | Question | Answer | Consequence |
|---|---|---|---|
| T1 | Name | **A — type + own name: Ліжник «Черемош»** | Type prefix comes from the template |
| T2 | Description structure | **A — intro + «Чому вам сподобається» (3–4 points) + details** | The AI draft (round 10) follows this structure |
| T3 | Short description | **A — first sentence, editable** | Used on cards and as the meta description seed |
| T4 | Translation status | **B — not shown** | No language dots in the product editor. Round 10 §P8a still protects hand-edited translations from being overwritten; the few that fall out of date are listed once in Settings → «Переклади до перевірки», not on each product |
| T5 | URL | **A — generated from the name, frozen after publishing**; a later change leaves a 301 from the old address | `Redirect` table (§25) |
| T6 | Google title and description | **A — composed by template, editable** | e.g. «Ліжник Черемош 200×220 — ручна робота, Яворів \| Вівчарик» |
| T7 | «Історія виробу» | **A — stages from the template; Іван can untick** | Only real stages (round 9 §F1) |
| T8 | Badges | **A — automatic, manual override**: Новинка 30 days after publishing, Знижка while a discount runs, Хіт by sales | |
| T9 | Collections | **A — ticks in the product + a collection page to order items** | |
| T10 | «З цим купують» | **A — automatic (complementary categories, bought together), pinnable** | |
| T11 | Hutsul words | **A — a glossary Іван maintains; explanations attach wherever the word appears** | Implements round 11 U14 |
| T12 | Reviews | **A — shared by the whole product** (all sizes and colours) | |
| T13 | Search synonyms | **A — «Інші назви» on the product or template** | Fed to site search |

---

## Block 8 — safeguards

All recommended options chosen.

| # | Question | Answer | Consequence |
|---|---|---|---|
| G1 | Saving while working | **A — the draft autosaves every few seconds**; leaving with unsaved changes warns | |
| G2 | Editing a published product | **A — changes wait for «Опублікувати зміни»**; the site keeps showing the live version | Draft and live versions are separate revisions |
| G3 | Undo | **A — version history: «повернути, як було вчора»** | Restoring creates a new draft; nothing goes live without publishing |
| G4 | Two editors | **A — «Любов зараз редагує цей товар»** warning | Soft lock with heartbeat; optimistic concurrency (§23.18) still guards the save |
| G5 | Deleting | **A — archive only; permanent delete only for products with no orders, and only by Іван** | `products.delete` ⚠ stays Owner-only for hard delete |
| G6 | Price mistakes | **A — warn on price 0 or a change of more than 50%** | Typed confirmation to proceed |
| G7 | Cancelled order | **A — stock returns automatically** | A stock movement with source «скасування» |
| G8 | Excel import | **A — preview of every change, then «Підтвердити»** | §23.6.9 dry-run diff |
| G9 | Excel template | **A — «Завантажити шаблон» per product template** | Columns, size and colour lists pre-filled |
| G10 | Missing pieces on the site | **A — missing translation → Ukrainian; failed photo → a tidy placeholder** | Pages never break |
| G11 | Variants without price or stock | **A — rows highlighted red; publishing blocked** | |
| G12 | Who publishes | **A — Іван and Любов; other staff prepare drafts only** | `products.publish` for Owner and Administrator only |
| G13 | Backups | **A — daily backup + restoring a single product** | Single-product restore uses the version history (G3); the daily database backup covers the rest |

**Interview closed.** Consolidated into [37-product-admin-system.md](37-product-admin-system.md);
schema additions in [25-database-schema.md](25-database-schema.md) §25.8f.
