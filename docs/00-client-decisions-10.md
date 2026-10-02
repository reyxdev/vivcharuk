# Client Decisions — Round 10 (interface questionnaire)

Received from 2026-09-30 through an eight-part interface questionnaire. **Highest-authority
document in the blueprint.** **Propagated** on 2026-09-30: canonical changes in [25-database-schema.md](25-database-schema.md)
§25.8e and [26-api-architecture.md](26-api-architecture.md); every other affected document carries
a «Round 10» banner under its title, above the round 9 banner.

---

## Part 1 — header and navigation

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Header on scroll | Always on top (sticky) | |
| 2 | Height | Compact | ≤ 64 px desktop, 56 px phone |
| 3 | Logo | **Centred** | Desktop: left group = Каталог (mega menu), Опт, Про нас, Контакти; right group = search, phone icon, language, wishlist, cart |
| 4 | Colour | White | |
| 5 | Desktop category menu | **Mega menu with category photos** | |
| 6 | Mega menu content | Category photos, best sellers, a promo banner | Banner is admin-managed (§23.12) |
| 7 | Opens on | **Hover** | With a ~150 ms hover-intent delay; click and keyboard also open it; tablets open by tap |
| 8 | Phone menu | ☰ on the left | |
| 9 | Phone bottom bar | **Каталог, Кошик, Обране, Зв'язок** | Four items; the logo is home, search stays in the header |
| 10 | Search | Magnifier icon, field opens on click | |
| 11 | Suggestions | Products with photo and price | No categories or articles in suggestions |
| 12 | Phone number | Icon only | Tap = call on phones; desktop shows the number in a small popover |
| 13 | Messenger buttons | **Floating button in the corner** | Bottom-right, opens Viber / Telegram / WhatsApp. **On phones it is not shown**, because «Зв'язок» in the bottom bar does the same job and a floating button would cover it |
| 14 | Language switcher | **Flags** | Flag plus a short code (🇺🇦 UA …): a flag names a country, not a language, and English has no single flag. Code text also serves screen readers |
| 15 | Currency | Automatic by locale: `uk` ₴, others € | No currency switch |
| 16 | Wishlist icon with counter | Yes | |
| 17 | Cart icon shows | Item count | |
| 18 | Breadcrumbs | Yes | |
| 19 | Announcement bar closable | Yes | Remembered per visitor (`localStorage`) until its text changes |
| 20 | «Опт» | **In the menu beside the categories** | |
| 21 | Pages in the header | **Про нас, Контакти** | «Виробництво» and «Блог» live in the footer and in homepage links |
| 22 | «A+» font button | No — type is already large | |
| 23 | Back-to-top | Yes | Bottom-left on desktop so it never collides with the messenger button; above the bottom bar on phones |
| 24 | Mascot beside the logo | No — mascot in the hero only | |
| 25 | Anything else | — | |

---

## Part 2 — homepage

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Hero photograph | **Changes with the season** | Four seasonal photographs of Яворів, switched by date; admin can override |
| 2 | Hero height | ~70% of the viewport | The categories row peeks above the fold — a visible cue to scroll |
| 3 | Hero text | Brand name, tagline below | H1 «Вівчарик», then «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.» |
| 4 | Flock size | **15+** — *round 15: 12 on desktop* | On phones and low-power devices the flock drops to ~8 to protect frame rate |
| 5 | Shepherd | Walks behind the flock | |
| 6 | Sound | Yes, **off by default**, a speaker button | Never autoplays |
| 7 | Categories | **Circles with photos** | |
| 8 | How many | **4 + «Усі категорії»** | Default four: Ліжники та пледи, Пряжа та рукоділля, Овчина, Шкарпетки та капці (best sellers plus the families to grow); editable in the admin |
| 9 | Production block | **Animated path «від сирої вовни до готового виробу»** | Seven stops, per round 9 §F1: вичинка шкур is a side branch for овчина; the wool path is миття → чесання → прядіння → ткання / валяння → пошиття |
| 10 | Best sellers count | **4** | |
| 11 | Layout | Grid | |
| 12 | Chosen by | **Automatic by sales, Іван can pin** | Pinned first, then top sellers of the last 60 days |
| 13 | Trust points | **Власне виробництво, 30+ років, Індивідуальні розміри, Рейтинг Google** | Four items; inspection-before-payment and 14-day returns move to the PDP and checkout |
| 14 | «Під ваш розмір» block | No | Custom size appears only as a trust point |
| 15 | Yarn block | **Yes** | New homepage block for yarn and needlework |
| 16 | Sheepskin block | No | |
| 17 | Family story | **Not on the homepage** | S6 Story removed |
| 18 | Collections | Yes | На подарунок, Весільні, Для дітей |
| 19 | Wholesale | **Not on the homepage** | S9 removed; «Опт» is in the menu |
| 20 | Blog | **Not on the homepage** | S10 removed |
| 21 | Map | Google map | **Click-to-load**: a static map image with «Показати на карті». An embedded Google map sets Google cookies before consent (a GDPR problem on `pl`/`de`) and is heavy on phones |
| 22 | Closing block | Phone and messengers | |
| 23 | Scroll reveal | Yes, soft | Off under reduced motion |
| 24 | Section backgrounds | Alternate white and cream | |
| 25 | Seasonal banner | **Thin strip above the hero** | The announcement bar and the seasonal banner become **one strip**: the seasonal message replaces the default text while active. Two stacked strips would push the hero down |

### Resulting homepage order

```
strip   announcement / seasonal message (closable)
header
S1      hero — seasonal mountain photo, flock animation, «Вівчарик» + tagline, two buttons
S2      categories — 4 circles + «Усі категорії»
S3      from raw wool to finished product — animated path
S4      best sellers — 4, grid
S5      why trust us — 4 points
S6      yarn and needlework
S7      collections — gift, wedding, children
S8      video reviews (hidden until ≥ 3) + Google rating badge
S9      come to Яворів — click-to-load Google map
S10     phone and messengers
footer
```

---

## Part 3 — catalogue and search

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Per row, desktop | **4** | 4 at ≥ 1280 px beside the filter panel; 3 at 1024–1279 |
| 2 | Per row, phone | **2, compact** | See the phone-card note below |
| 3 | Loading | **«Показати ще»** | Plus real paginated URLs underneath (`?page=2`) so Google can crawl every product |
| 4 | Page size | **12** | |
| 5 | Desktop filters | Left panel | |
| 6 | Phone filters | «Фільтри» button pinned to the bottom of the screen | Opens a full-screen sheet |
| 7 | Applying | **«Показати 24 товари» button** | Live count on the button; desktop panel applies the same way for consistency |
| 8 | Colour filter | Swatches with names | |
| 9 | Price filter | Slider and from–to fields | |
| 10 | Counts beside options | Yes | |
| 11 | Active-filter chips + «Скинути все» | Yes | |
| 12 | Category text | **Longer text at the bottom** | Nothing above the products except the H1 and chips |
| 13 | Category banner | **No, products first** | |
| 14 | Subcategory circles | **No, subcategories as a filter only** | Subcategory pages still exist as URLs and are linked from the mega menu as text, so they stay indexable |
| 15 | Card content | Name, price, old price, badges, rating, colour dots, sizes, «Власне виробництво» | Rating shows only when the product has at least one on-site review |
| 16 | Card photo | Square | |
| 17 | Wishlist heart on card | Yes | |
| 18 | Multi-size price | **Range «1 200 – 3 400 ₴»** | Min–max of in-stock variants |
| 19 | Partner goods | Mixed in, labelled | As §1.7b |
| 20 | Out of stock | Shown greyed at the end | |
| 21 | Sort options | Popular, new, cheapest, most expensive, discounted | |
| 22 | Empty filter result | **Mascot + «Скинути фільтри»** | Mascot surfaces become: hero, empty cart, empty filter result, 404, order thank-you |
| 23 | Search results page | Skipped — default: same layout and filters as a category | |
| 24 | Typo correction | Yes | Trigram similarity in Postgres |
| 25 | Latin and other languages | Yes | Transliteration (lizhnyk → ліжник) and cross-locale synonyms (koc, blanket) |

**Phone card at two per row (~170 px wide).** Eight elements do not fit legibly for a 70-year-old
reader. On phones the card shows: photo, name (two lines), price or range, colour dots, and the
origin mark as a small glyph (the partner label must stay visible, §1.7b). Sizes, rating and the
old price move to the product page on phones; the discount shows as a «−15%» badge instead.

---

## Part 4 — product page

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Desktop layout | Photos left, details and buttons right | Right column sticky while the gallery scrolls |
| 2 | Thumbnails | Under the main photo | |
| 3 | Zoom | Hover loupe **and** click for full screen | Loupe desktop only; pinch-zoom in the full-screen view on phones |
| 4 | Video | **Last** in the gallery | |
| 5 | Size | Buttons | |
| 6 | Colour | Swatches | |
| 7 | Photos follow colour | Yes | |
| 8 | Quantity | − and + | |
| 9 | After «Додати в кошик» | Skipped — default: **the cart drawer slides out** | Consistent with the drawer-only cart |
| 10 | «Купити в 1 клік» | Second button under «В кошик» | `uk`, stocked items only; hidden when «Свій розмір» is chosen |
| 11 | Discount | Old price struck through | |
| 12 | Wholesale line | **Small, under the button** | «Оптом: від 5 шт. −10%, від 25 шт. −20%» |
| 13 | Delivery and payment | **Link to the delivery page only** | |
| 14 | «Відправимо за 2–4 дні» | No | |
| 15 | «Огляд перед оплатою на пошті» | **Yes, beside the button** | Conditional: shown only when COD is available for that item (Ukraine, stocked). Links to «як це працює», which states the return-shipping deposit (§J2) — the inspection promise is never shown without the deposit one click away. With «Свій розмір» chosen it becomes «Повна передоплата · виготовлення 14 днів» |
| 16 | Sections | Accordions | Description, specifications, care (link), reviews |
| 17 | Description | Collapsed, «Читати більше» | Full text is in the HTML, so search engines read it |
| 18 | Size calculator | «Який розмір мені потрібен?» opens a dialog | |
| 19 | Custom size | As described: «Свій розмір» button, width × length fields, price computed live | Unchanged from §H3c |
| 20 | On-site product reviews | **Yes**, moderated by Іван | First-party reviews may carry `AggregateRating` (unlike Google's) |
| 21 | Photo reviews | Yes | Moderated; EXIF (location) stripped on upload |
| 22 | Review request email | **Yes, on the site** | Sent once, 7 days after `DELIVERED`, with a one-click opt-out |
| 23 | «З цим купують» | 4 products | |
| 24 | Share | Viber, Telegram, copy link | |
| 25 | Sticky «В кошик» on phones | **Yes** | On the product page the sticky buy bar **replaces** the bottom navigation bar while scrolling, so there are never two bars stacked at the bottom of a small screen |

---

## Part 5 — cart drawer and checkout

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Drawer content | Photo, size and colour, remove, total | **No − / + in the drawer**: quantity is changed on the product page. The wholesale nudge is not in the drawer; an applied volume discount still shows as a line in the total |
| 2 | Drawer buttons | «Оформити замовлення» and «Продовжити покупки» | |
| 3 | Cross-sell in drawer | No | |
| 4 | Empty cart | Mascot and best sellers | |
| 5 | Item sold out while in cart | Warn, keep it greyed | Greyed line is excluded from the total and cannot be checked out; one tap removes it |
| 6 | Checkout | **One page** | Sections: contact → delivery → payment → summary |
| 7 | Name | **One field** | See §P5a |
| 8 | Patronymic | Optional field | |
| 9 | Email | **Optional** | See §P5a — it changes what the buyer can receive |
| 10 | Nova Poshta parcel lockers | **Yes** | Offered only when the parcel fits a locker cell — needs packed dimensions and weight per product in the admin |
| 11 | City suggestions | Yes | Nova Poshta directory |
| 12 | Remember details | Yes, with a «Запам'ятати» checkbox | `localStorage` on the buyer's device only, never a server record (no accounts) |
| 13 | Delivery cost shown | **Only in checkout** | |
| 14 | Promo code | «Є промокод?» link | |
| 15 | Phone summary | In full at the bottom, before the button | |
| 16 | Photos in summary | Yes | |
| 17 | Terms | **Checkbox** «Погоджуюсь з умовами» | Links to the offer contract and returns page |
| 18 | Main button | «Оплатити 2 400 ₴» | **The amount is what is charged now**: card = order total; COD = «Оплатити доставку 160 ₴» (the two legs, §H1.3); partial prepayment = «Оплатити передоплату 460 ₴»; IBAN = «Отримати рахунок». A button showing the full total on a COD order would be untrue |
| 19 | Card payment | **Overlay window on the site** | WayForPay widget, if V6 confirms it is available; redirect as fallback |
| 20 | Failed payment | «Спробувати ще раз», «Змінити спосіб оплати» | The order is kept; nothing is re-entered |
| 21 | Reserve stock during checkout | **Yes, 30 minutes** | Matters most for one-of-one sheepskins |
| 22 | Abandoned-checkout email | **No** | `cart.abandoned` job removed |
| 23 | Phone input | Typed in full | Accepts `+380…`, `380…`, `0…`; normalised to E.164; Ukrainian numbers validated by length |
| 24 | Company order | **Yes, «Я юридична особа»** | Company name, ЄДРПОУ; IBAN invoice «без ПДВ» (§L5) |
| 25 | Anything else | — | |

### P5a One name field, optional email — what follows

**Name.** Nova Poshta's API takes surname and first name separately. The single field is
labelled «Прізвище та ім'я (як у паспорті)», requires at least two words, and is split on the
first space; the admin shows the split and lets staff correct it before the waybill is created.

**Email optional.** With no accounts (§E12), the confirmation email is the buyer's only record
of the order. Without it:

- the thank-you page is the record: order number, contents, total, and «Збережіть номер
  замовлення» with a copy button;
- delivery updates come from Nova Poshta's own SMS once the waybill exists;
- status lookup on the site is by order number and phone, and shows **status only** — no name,
  address or contents, because neither value is a secret.

**Email stays required** where the order cannot work without it: custom-size orders (production
updates and the dispatch date), international orders (the shipping quote), company orders (the
invoice) and every order on a non-`uk` locale. The field turns required, with its reason, when
one of these applies.

---

## Part 6 — after the order

Questions 1–6 and 16 were skipped; defaults are marked.

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Thank-you page | *Default:* order number with copy button, contents and total, next steps, phone and messengers, mascot, «Продовжити покупки» | |
| 2 | Mascot on thank-you | *Default:* waving | |
| 3 | Confirmation email design | *Default:* branded, with product photos and the logo | |
| 4 | Email contents | *Default:* number, contents with photos, total, delivery, status link, phone | |
| 5 | Status view | *Default:* link from the email, plus lookup by number and phone (status only, §P5a) | |
| 6 | Statuses shown to the buyer | *Default:* Прийнято, Оплачено, Виготовляється (custom only), Пакується, Відправлено + ТТН, Доставлено | |
| 7 | Emails sent | **Confirmation and «Відправлено» only** | See §P6a — four more are kept because the order cannot work without them |
| 8 | Nova Poshta waybill | Created automatically in the panel | |
| 9 | Buyer cancels | **By phone only** | |
| 10 | Buyer changes address | **By phone only** | |
| 11 | Returns | **By phone** | See §P6b for EU locales |
| 12 | What is recorded | Order number, reason, photos | Staff record them in the admin during the call; photos arrive by messenger |
| 13 | Refund destination | The same card | Card payments only; see §P6b |
| 14 | Exchange for another size | **Yes** | Handled as a return plus a new order; the buyer pays both shipping legs (part 4 of round 9, answer 17) |
| 15 | Custom-size returns | **Defects only** | Lawful for goods made to the buyer's specification, in Ukraine and the EU. **Must be stated before purchase**, at the moment «Свій розмір» is chosen, and in the offer contract |
| 16 | Reporting a defect | *Default:* phone or messenger, with photos | |
| 17 | Confirmation call | **Every order** | Admin gains a «Підтверджено дзвінком» step before packing; the 2–4-day dispatch window includes it. International buyers are contacted by messenger |
| 18 | Production-photo email for custom items | No | |
| 19 | «Замовити ще раз» in email | No | |
| 20 | QR code on the parcel card | **Homepage** | With `?from=card` for attribution (G4) |
| 21 | Next-purchase promo code | No | |
| 22 | Unpaid-card reminder | No | |
| 23 | Auto-cancel unpaid orders | **After 3 days** | Stock stays reserved for those 3 days; staff can cancel earlier from the admin — relevant for one-of-one sheepskins |
| 24 | Dispatch date | «За 2–4 дні», no calendar date | Custom items keep «виготовлення 14 днів» |
| 25 | Anything else | — | |

### P6a Emails: two chosen, four kept

The client chose confirmation and «Відправлено». Four more stay, because without them the
buyer is not told something that concerns their money or their order's existence:

| Kept | Why it cannot go |
|---|---|
| Shipping quote (international) | The quote *is* the email; there is no other way to deliver it (§H2) |
| Order cancelled | Including the 3-day auto-cancel — the buyer must learn the order no longer exists |
| Refund issued | Money moved; the buyer needs the amount and the date |
| Review request | Chosen in part 4, answer 22 |

Removed: payment received, in production, delivered, quote expiring reminder.

### P6b Returns by phone — the EU exception, and refunds without a card

- On `pl`, `en` and `de`, the EU right of withdrawal must accept **any clear written
  statement**, and the model withdrawal form must be offered. Those locales keep an email
  address and the form; phone is offered in addition, not instead.
- Refunds go to the paying card where the order was paid by card. Cash-on-delivery and IBAN
  payments cannot be refunded to a card: staff take the buyer's IBAN during the call.

---

## Part 7 — contacts, other pages, forms, footer

Questions 3, 10 and 25 were skipped.

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Contacts page | Address, Іван's and Любов's phones, messengers, map, «Графік гнучкий — дзвоніть перед візитом» | The click-to-load map carries a «Прокласти маршрут» link. Tours mentioned here (round 9) |
| 2 | Contact form | **No** — phone and messengers are enough | See §P7a |
| 4 | About page format | One scrolling story | |
| 5 | About page content | **Яворів and ліжникарство, values** | No family-history section and no faces. Іван's recorded story (round 9 §P5.2) feeds the blog and the production page instead |
| 6 | Production page | Stages one after another on scroll, photo and video | Stages per round 9 §F1 |
| 7 | Production video | **Short clips, one per stage** | Matches the shoot plan |
| 8 | Wholesale page | Discounts −10% / −20%, minimum 5 pcs, production photos, reviews | **No enquiry form, no price list.** See §P7a |
| 9 | Price list | Not needed | |
| 11 | FAQ | One page, accordions | Also `FAQPage` content for AI search |
| 12 | Delivery and payment | One page | |
| 13 | Care page | By material: wool, sheepskin, leather | |
| 14 | Blog index | Photo grid | |
| 15 | Under an article | Products mentioned, share | No comments, no "more articles" block |
| 16 | 404 | Mascot | Plus a «На головну» button and the search field — a page with only a drawing leaves a lost visitor nowhere to go |
| 17 | Cookie banner | Bottom strip | |
| 18 | Buttons | «Прийняти всі», «Лише необхідні» | Equal visual weight (required under EU rules); «Налаштування cookies» link in the footer to change the choice later |
| 19 | Analytics | **Google Analytics** | Loads only after consent, via Consent Mode v2; with «Лише необхідні» it does not load. Replaces the privacy-first plan in [31-analytics-architecture.md](31-analytics-architecture.md) |
| 20 | Reviews page | **Yes** | On-site reviews plus the Google rating and a link to Google reviews |
| 21 | Customer-home gallery | **Yes** | Photos come from review uploads with a checkbox «Можна показати в галереї»; nothing is published without that consent |
| 22 | Collection pages | Like a category: products and filters | |
| 23 | Footer | Information (delivery, returns, FAQ), contacts, messengers, payment icons | Plus a mandatory thin legal row: offer contract, privacy, cookies settings, ФОП Гондурак Любов Юріївна and `{{LEGAL_ID}}`, and the Impressum on `de`. Seller identification is a legal requirement, not a choice. **No category links** — the mega menu carries them |
| 24 | Footer colour | Dark green | `forest-900` |

### P7a No forms at all — what that removes

With no contact form and no wholesale form, the site collects contact only through checkout,
«Купити в 1 клік», reviews and the phone and messengers. Consequences:

- **The Leads module has no source at launch.** It is removed from v1 (admin §23.13, the
  `Lead` model, `/v1/leads`). Wholesale buyers use the automatic volume discount in the cart,
  or call; the wholesale page's call to action is the phone, the messengers and «Перейти в
  каталог».
- Mail in the panel (round 7) still receives anything written to `info@`.

---

## Part 8 — admin panel

Question 25 was skipped.

| # | Question | Answer | Note for propagation |
|---|---|---|---|
| 1 | Dashboard | New orders, quick-order requests, unread mail, low stock, custom-size orders and their due dates, reviews awaiting moderation | No sales chart on the dashboard; sales live in the weekly report |
| 2 | Order list | **Cards** | |
| 3 | Order filters | Status, date, search by phone or number | |
| 4 | «Подзвонити» button | Yes | `tel:` link; on a phone it dials |
| 5 | «Підтверджено дзвінком» | A checkbox in the order | Required before «Пакується» |
| 6 | Print | **Waybill only** | Packing slip (§23.8.5) removed |
| 7 | Batch waybill printing | Yes | |
| 8 | Product editor | One long page | Section anchors down the side |
| 9 | Photos | Drag from computer; **camera in the panel** on a phone | `<input capture>`; EXIF stripped on upload |
| 10 | Video | **Uploaded into the panel** | Cloudinary video; check the plan's storage and bandwidth limits before launch |
| 11 | Translation | **Automatic on save** | See §P8a |
| 12 | AI description draft | Yes — a draft Іван edits | See §P8a |
| 13 | Sheepskin quick add | «Копія — змінити фото й розмір» | |
| 14 | Stock editing | In the product editor only | No inline stock editing in lists |
| 15 | Excel import and export | Yes | CSV/XLSX with the dry-run diff (§23.6.9); also how the notebook's stock gets in |
| 16 | Bulk % price change per category | Yes | Dangerous action: typed confirmation, audited |
| 17 | Discounts | **Per product, and promo codes** | No category-wide discounts |
| 18 | Reviews | All moderated by Іван | |
| 19 | Reports | Sales, where buyers came from | Source = attribution captured on the order (UTM, referrer, `?from=card`), not a Google Analytics API integration |
| 20 | Admin on a phone | **The whole panel** | Replaces the "not mobile-first" anti-goal (§23.2): every admin screen gets a phone layout, product editing included |
| 21 | Telegram reminder for orders unconfirmed after 24 h | Yes | |
| 22 | Change history for Іван | Yes | Audit log (§24.12) |
| 23 | Fiscal receipts (ПРРО) | **Must be connected** | See §P8b |
| 24 | Telegram recipients | Іван and Любов | |

### P8a Automatic translation and AI drafts

- Translation runs **on save of the `uk` text**, through the Claude API, into `pl`, `en`, `de`.
  Each translated field records its source — `MACHINE` or `HUMAN`. A field someone has edited by
  hand is **never overwritten** by a later automatic run; the admin flags it «оригінал змінено»
  instead.
- **Legal pages are excluded** from automatic translation (round 9 §F4); the heritage sentence is
  checked by hand in every language (R16).
- The description draft is generated from the product's attributes and category, marked as a
  draft, and never published without an edit-and-save by a person.
- Only product and page text is sent to the API — never customer data. Model and key are
  configuration.

### P8b Fiscal receipts

A ФОП on the single tax generally must issue a fiscal receipt (through a software cash register,
ПРРО) for card payments; the exact scope — card online, cash on delivery through Nova Poshta,
IBAN — is for the ФОП's accountant to confirm. The build integrates a ПРРО provider's API
(`{{PRRO_PROVIDER}}`, Checkbox is the common choice): a receipt is created when a card payment
is confirmed and a return receipt when it is refunded; the receipt link goes into the
confirmation email and the order. A new Phase 0 item: the ФОП registers the ПРРО and obtains the
provider's API key.

**Superseded by round 14:** the provider is WayForPay's free built-in ПРРО, and the receipt link
is shown on the order page only, not in the confirmation e-mail ([00-client-decisions-14.md](00-client-decisions-14.md)).

---

## Part 9 — the mascot is approved

> «Затверджуємо кольоровий маскот, але виправ місця, в яких він кривий.»

**Variant A, the colour shepherd, is approved** ([canvas «Маскот: костюм»](https://claude.ai/artifact/7eMmi9QbGYFH4CarbYuaBP)).
Hutsul dress: кресаня with feather and red band, embroidered shirt, кептар with fur trim and
appliqué, черес, тобівка, red гачі, онучі with волоки, постоли, бартка. Corrections made on
approval: symmetric legs and feet, stray hat ribbons removed, hands drawn as hands. Sheep are
drawn at about half the shepherd's height.

The illustrator's final artwork follows this figure; the costume is to be checked against the
Музей ліжникарства's material before it is final.
