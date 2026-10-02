# 37 — Product Admin System

How products are created, edited and published so that everything **appears on the site by
itself and never breaks it**. Consolidates the 100-answer interview in
[00-client-decisions-12.md](00-client-decisions-12.md). Builds on
[23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6 (product editor, variant
matrix, custom sizing, CSV import) and [25-database-schema.md](25-database-schema.md) §25.3;
schema additions are in §25.8f. Where this document and §23.6 differ, this one wins.

---

## 37.1 The one rule that keeps the site intact

**Every product is created from a template, and the storefront renders only from template
structure.** The template says which axes a product has (size, colour, pattern), which
attributes it carries (composition, density, pile length…), which units it sells in, and what is
required before publishing. Because every ліжник has the same fields in the same places:

- filters, the size calculator, the specification table and structured data are generated —
  nobody configures them per product;
- a field that is empty is simply not rendered; a field that is invalid cannot be saved;
- changing a template never breaks a published page (new fields start empty and hidden).

---

## 37.2 Templates

Nine at launch, plus one prepared and hidden:

| Template | Axes | Key attributes | Unit | Default category |
|---|---|---|---|---|
| Ліжник / плед / ковдра | Size (list, named: «Двоспальний · 200×220 см»), colour, pattern | Основа, уток, щільність г/м², вага per size, overhang for the calculator | PIECE | Ліжники та пледи |
| Подушка | Size (40×40, 50×50, 50×70, 70×70) , colour | Наповнювач (list), вага | PIECE | Ліжники та пледи |
| Одяг (гуня, камізелька, накидка) | Size S–XXL or «Універсальний», colour | Size table in cm (template default, product override) | PIECE | Вовняний одяг |
| Шкарпетки | Size ranges 36–38 … 45–46, colour, pattern | Склад | PIECE | Шкарпетки та капці |
| Капці | Size 36–46 with insole cm, colour | Склад, підошва | PIECE | Шкарпетки та капці |
| Пряжа / ровниця / вовна | Colour | Вага мотка, метраж, товщина (тонка/середня/товста), ply, recommended needles | SKEIN or KILOGRAM | Пряжа та рукоділля |
| Овчина | — (one-of-one) | Measured length × width cm, колір хутра, довжина ворсу мм, тип вичинки | PIECE, stock 1 | Овчина |
| Шкіряні вироби | Size or none, colour | Вид шкіри, фурнітура, розміри в см | PIECE | Шкіра |
| Пояси | Length cm, colour | Склад | PIECE | Вовняний одяг |
| *Дерево* (hidden) | — | To be defined | PIECE | ДЕРЕВО |

Rules: Іван and Любов edit templates (`templates.manage` ⚠). The template suggests the category
(changeable). A product's template cannot be changed — «Копіювати в інший шаблон» instead.
Partner goods use the same template with the «Від партнерів» switch.

---

## 37.3 Shared libraries (one source of truth each)

| Library | Managed by | Holds | Protection |
|---|---|---|---|
| **Sizes** (per template) | Іван, Любов | Value, display name per locale, dimensions, sort order | Values in use can be hidden, not deleted |
| **Colour palette** | Іван, Любов | Name (uk; others auto-translated), **photo swatch of real wool**, hex fallback, **family** (білий … багатоколірний), «натуральний, без фарбування» flag, order | In-use colours: hide only; edits apply everywhere, with an "affects N products" count before saving |
| **Patterns** | Іван, Любов | Ромби, Смуги, Ялинка… | Hide only |
| **Materials** | Іван, Любов | Name, **material group** (вовна, овчина, шкіра, змішані), link to its care-page section | Hide only |
| **Fillings** | Іван, Любов | Pillow fillings | Hide only |
| **Glossary** | Іван, Любов | Hutsul words and short explanations (all locales) | Applied automatically wherever the word appears in product and page text |

---

## 37.4 The product editor — one long page

Sections down the page, with anchors at the side and a **readiness meter** («7 з 9» and the
missing list) at the top. «Опублікувати» is disabled until every template-required field is
present.

1. **Основне** — name (template type prefix + own name: Ліжник «Черемош»), category, origin
   switch, collections, «Інші назви» for search.
2. **Варіанти** — tick sizes and colours (and pattern); the matrix is generated; price per size
   shared by its colours, overridable per row; stock per row; per-row «Виготовимо під
   замовлення за N днів» (sets `madeToOrderDays` → full prepayment, no COD); bulk-select rows to
   set price or stock; SKU generated as `VCH-LZ-0114-200-SI`, editable. Rows without price or
   stock turn red and block publishing.
3. **Склад і характеристики** — composition as percentages that must total 100%; template
   attributes (density, warp/weft, pile length…); weight per size; packed weight and size for
   shipping and locker fit.
4. **Фото й відео** — drag several; reorder by drag; a slot per colour; first photo = main,
   second = hover; focal point per photo; quality warning on small or blurred files; media
   library for reuse; video ≤ 30 s, compressed, silent, cover from the first frame or chosen.
   Alt text composed automatically, editable.
5. **Ціна й знижки** — discount as % or new price with start and end dates (the old price is
   struck through and restored automatically); yarn shows price per 100 g and per kg; price
   history (who, when). Warning on price 0 or a change over 50%.
6. **Опис** — structure: intro + «Чому вам сподобається» (3–4 points) + details; AI draft on
   request; short description = first sentence; Google title and description composed by
   template, editable; «Історія виробу» stages from the template, untickable; badges automatic
   (Новинка 30 days, Знижка during a sale, Хіт by sales) with manual override.
7. **Перегляд** — «Як це виглядатиме на сайті», desktop and phone, rendered from the draft.

---

## 37.5 Drafts, publishing and history

| Mechanism | Behaviour |
|---|---|
| Autosave | Every few seconds into the product's draft revision; leaving with unsaved changes warns |
| Draft vs live | A published product has a **live revision** and at most one **draft revision**. The site reads only the live one. «Опублікувати зміни» promotes the draft |
| Version history | Every publish keeps its revision; «Повернути» copies an old revision into a new draft |
| Edit lock | Opening a product takes a soft lock with a heartbeat; others see «Любов зараз редагує цей товар» and open read-only unless they take over |
| Who publishes | `products.publish` — Owner and Administrator. Photographer and Content Editor save drafts only |
| Statuses | Чернетка → Опубліковано → Архів. Archive removes the product from the site (its URL redirects to the category) and keeps all history. Hard delete: only products that never had an order, only Іван |
| URL | Generated from the name at first publish and frozen; a later rename leaves a 301 |

---

## 37.6 Stock movements

Stock changes are recorded as movements with a source, so the number on the site is always
explained:

| Source | Trigger |
|---|---|
| Order | Checkout reservation (30 min) → decrement on order creation |
| Cancellation | Automatic return to stock (G7) |
| Shop sale | «Продано в магазині» from a phone; one-of-one items archive on sale |
| Manual correction | Stock edited in the product (reason required) |
| Import | Excel import after the confirmed preview |

---

## 37.7 How the storefront consumes it

| Storefront element | Comes from |
|---|---|
| Size buttons, their order and names | Template size list (sort order; «Свій розмір» last) |
| Size calculator | Template overhang rule + the product's sizes |
| Colour swatches and gallery switch | Palette photo swatch + per-colour photo slots; sold-out colour crossed out; main colour first |
| Catalogue filters | Colour families, pattern, material groups, size values, yarn thickness, origin |
| Specification table and «100% овеча вовна» line | Template attributes + composition |
| Care link | Material → care-page section |
| «Історія виробу» | Template stages minus unticked ones; own manufacture only |
| Shade note | Shown on products with at least one dyed colour |
| Structured data | Name, SKU per variant, price, availability, `AggregateRating` from on-site reviews |
| Fallbacks | Missing translation → Ukrainian; failed image → placeholder with the collection colour; empty optional field → not rendered |

---

## 37.8 Excel

«Завантажити шаблон» per product template gives a sheet with the right columns and drop-downs for
that template's sizes, colours and materials. Import always shows the full change preview (new,
changed, unchanged, errors) before «Підтвердити» (§23.6.9). The paper notebook's stock is entered
this way at launch.

---

## 37.9 Backups

Daily database backup (§32.17) plus single-product restore through the version history.

---

## 37.10 Permissions added

| Permission | Owner | Administrator | Others |
|---|:-:|:-:|:-:|
| `templates.manage` ⚠ | ✓ | ✓ | |
| `libraries.manage` (palette, sizes, materials, patterns, fillings, glossary) | ✓ | ✓ | |
| `products.publish` | ✓ | ✓ | |
| `products.delete` ⚠ (hard delete) | ✓ | | |
| `stock.shop_sale` | ✓ | ✓ | Warehouse |
