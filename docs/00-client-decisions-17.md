# Client Decisions — Round 17 (build-time corrections)

Received 2026-09-30, during the build. **Highest-authority document** for the points below.

## B1 — Logo in the header, wordmark in the hero

> «Замість цього тексту Вівчарик постав логотип… в меню навігації його прибери» — then, the same
> day: «Поміняй Вівчарик і логотип місцями… логотип зроби трохи більшим, бо його не видно, він
> може виходити за нижню рамку трошки.»

Final state after the swap:

- The **header** shows the **logo (the ram drawing)**, centred, larger than the bar and hanging a
  little below its bottom edge: 58 px on phones, 70 px on tablets, 86 px from laptops up. It is
  the home link; its alt text is «Вівчарик».
- The **hero** shows the **«Вівчарик» wordmark** in Marck Script as the page's `h1` (72 px on
  phones, 96 px on tablets, 112 px from laptops up).
- The tagline sits on a light plate so it reads over the forest; the buttons never wrap.
- On screens narrower than the 1440-wide scene, the shepherd, his hut and the flock move inside
  the visible band; below 1000 px of visible scene the flock shrinks to about eight (round 10).
- Applied to the canvas boards «Головна · комп'ютер» and «Головна · телефон».

## B2 — Mockup cleanups

- The «[Сезонне фото гір Яворова …]» caption is removed from the hero.
- The cottage chimney sits on the roof, with the smoke rising from it.

## B3 — The whole landscape is visible on wide screens

> «Все не збігається по розмірам як на макеті… треба зменшити і так, щоб видно було небо і гори.»

From 1024 px the hero keeps the scene's own proportions (1440 × 620), so on a wide screen the whole
landscape shows — sky, sun, clouds, every ridge — instead of being cropped at the top. It never
grows taller than the window below the header. Text and controls keep their normal size; an
attempt to scale the whole page up with the screen width was rejected by the client.

## B4 — Forest density

> «На самих горах треба більше ялинок… ще більше ялинок… на дальніх горах краще прибери ялинки взагалі.»

The two forested ridges carry about five times as many firs as before, over the whole slope rather
than only along the crest (≈1,300 on the middle ridge, ≈1,450 on the near one). The far, blue
mountains have **no trees**. Applied to the site hero and the canvas board «Головна · комп'ютер».

## B5 — Grass on the meadow, no fog bands

> «Там, де вівці бігають, зроби наче траву… тут я бачу якийсь пропуск (біла зона).»

- The two meadow bands carry grass: ≈2,200 small tufts in three greens, denser and taller toward
  the front, and ≈170 tiny flowers in the meadow colours (Арніка #E0B33A, Дзвоник #6C7FC4,
  fleece white). The flock and the shepherd stand on it.
- The two white fog bands between the ridges are removed: in the valley gaps they read as a hole in
  the picture. This withdraws the static fog of round 11 answer 03; an animated fog stays out.

## B6 — A wooden hut behind the shepherd

> «На цьому пагорбі за пастухом зроби детальну хатинку, з якої димиться комин… але дерев'яну.»

On the meadow hill just behind the shepherd: a Hutsul log house — log walls with the log ends
showing at the corners, a hip roof of wooden shingles (ґонта), a lit window with shutters, a plank
door in a carved frame with a small red rhombus above it, a stone footing. The chimney is
clay-plastered with a wooden cap (an all-wood chimney would not be built); smoke rises from it in
three soft puffs on a 4.2 s loop, still under reduced motion. The meadow grass keeps clear of the
walls. Site hero and canvas board «Головна · комп'ютер».

## B7 — The meadow continues onto the hill edge below the hero

> «Трава в цьому зеленому кольорі чомусь не продовжується і виглядає недоречно, але форма правильна.»

The wave-shaped hill edge under the hero keeps its shape but takes the hero meadow's green
(#4E9A6A instead of #3C8A65) and the same grass and flowers, so the meadow reads as one continuous
field running into the page. On the site the edge heads the category section.

## B8 — Blue sky, tanned skin, hero text lower

> «Логотип, кнопки та опис … постав трохи нижче ближче до центру. І ще, зроби небо блакитним як
> в житті (бо хмар не видно зовсім). І частини тіла пастуха зроби тілесного кольору, трохи
> смуглявого відтінку.» · «Хмару не видно, бо вона за горою.»

- Sky: a vertical gradient #4E9BD6 → #86BFE8 → #C4E1F4 at the horizon, replacing the flat
  #DCE9F2. Clouds at 95% white so they read against it. The leftmost cloud moved into open sky;
  no cloud sits behind a ridge.
- Shepherd skin (face, ears, neck, hands): #D9A27C, cheeks #C47A5C, replacing #F3DCC6 / #E9A48F.
- The wordmark, tagline and buttons sit lower, nearer the centre of the sky: top 4 rem on phones,
  6 rem on tablets, 19% of the hero height from `lg`.

## B9 — Build notes (product editor)

- The hat follows the head tilt while it sits on the head, so it never looks crooked after a fall
  («іноді капелюх стоїть не рівно, коли він нахиляє голову після падіння»).
- On narrow screens, where the hut is moved to stay beside the shepherd, it is lowered onto the
  meadow line at its new spot («на телефоні хатинка парує в повітрі»).
- Header links and icons sit centred in the 64 px bar; only the logo hangs below it.
- Until media storage (Cloudinary) is connected, the template rule «photos ≥ 3» is shown in the
  readiness meter but does not block publishing; the storefront shows «Фото незабаром». It blocks
  again as soon as storage is configured.
- «Як ми виробляємо» is built from the seven stages of round 9 §F1 (wool: миття, чесання,
  прядіння, ткання, валяння, пошиття; hide: вичинка шкур, then the shared пошиття). The H1 is
  «Від сирої вовни до готового виробу» (the §20.3 «Сімнадцять етапів» heading counted unclaimed
  stages). Until the shoot, stages show a «Фото й відео етапу — після зйомки» panel in development
  only; in production an unphotographed stage does not render (20 §20.6).
- Information pages use the `uk` slugs of 04 §4.3 (`dostavka-i-oplata`, `povernennia`, `faq`,
  `polityka-konfidentsiinosti`, `umovy-korystuvannia`, `cookies`) and 29 §29.2 for care
  (`dohliad`); the `en`/`pl`/`de` slugs not given there are proposed in `src/lib/segments.ts`.
  Wholesale uses `optom` (03 §3.5.2 dictionary) over 19's `opt`. The delivery page lists card,
  COD-with-inspection and prepayment only while card payments are live (16 §16.4 «must not list
  methods that are not live»). Offer, privacy and cookie texts are placeholders until counsel writes them.
- The footer follows round 10 part 7 #23: information, the brand pages, contacts with messengers,
  payment marks and the legal row; the category column is removed.
- **Dashboard** follows round 10 part 8 #1 (not 23 §23.5's nine widgets): new orders to call,
  awaiting payment, «Купити в 1 клік», unread mail, reviews to moderate, custom-size orders with
  their dispatch dates, low stock (one-of-one and made-to-order variants excluded), latest orders.
  Each block shows only with its read permission.
- **«Купити в 1 клік»**: a second button on the product page (`uk`, pieces in stock, hidden with
  «Свій розмір»), a centred dialog / bottom sheet on phones, a phone number only. Inbox in the panel
  with SLA colouring (amber after 1 h, red after 4 h) and «Створити замовлення».
- **Orders created in the panel** run their lines through the storefront cart code, so prices, the
  volume discount, payment methods and the 460 ₴ floor are identical. They are marked «Підтверджено
  дзвінком» on creation. The buyer gets a link to the order page, which now carries an
  «Оплатити» button (also the retry after a failed payment); the offer is accepted there —
  «Оплачуючи, ви погоджуєтеся з умовами договору оферти» — because the buyer never ticked the
  checkout box. The link is copied and sent by hand until e-mail and Telegram sending exist.
- The product page now states, at the moment «Свій розмір» is chosen, «Виріб на індивідуальний
  розмір поверненню не підлягає, окрім браку» (round 10 part 6 #15).
- **Background jobs** run on pg-boss in the API process (26 §26.17), with schedules in
  Europe/Kyiv: `orders.autoCancelUnpaid` (hourly; card orders with no paid payment after 3 days —
  a paid prepayment keeps the order), `orders.unconfirmedReminder` (hourly, once per order),
  `orders.productionDueSoon` (daily 08:00), `cart.expire`, `quickOrders.purge` (closed requests
  older than 8 months), `reports.weekly` (Monday 08:00). `notify.telegram` is enqueued inside the
  order and quick-order transactions and composes its text from ids, so no name, phone or address
  ever enters a job or a message. Telegram stays off until `TELEGRAM_BOT_TOKEN` is set and the
  chat id is entered in «Налаштування». The cancellation e-mail waits for the e-mail service.
- **«Налаштування»** in the panel edits only whitelisted keys: the panel announcement, the
  Telegram chat (with a test message), the volume tiers, the prepayment floor and the
  `payments.card_enabled` switch (round 14 ПРРО gate; `settings.manage_integrations`). Every change
  is audited.
- **Search** (26 §26.10.2; round 10 part 3 #23; round 11 #26): the header magnifier expands a
  field with suggestions (up to 8 products with photo and price, no categories — round 10 part 1 #11), on phones too; Enter
  opens `/{locale}/poshuk?q=`, which is a category page with the query — same filters and cards,
  plus «За збігом» sorting, `noindex`. Matching uses the existing `searchVector` with prefix
  terms and Ukrainian endings stripped (the `simple` configuration has no Ukrainian stemmer), plus
  SKU and «Інші назви». Every first-page search is logged to `SearchQueryLog` with its result
  count. The empty result offers the categories under the round 11 #27 lantern scene.
- **«Бібліотеки»** (37 §37.3): sizes per template (with dimensions for ліжник, подушка, пояс),
  the colour palette (hex, family, «натуральний, без фарбування»), patterns and materials. Each
  row shows how many products use it; used values can only be hidden, unused ones deleted; order
  is set with ▲▼. A rename changes the displayed name everywhere and keeps the key, so URL filters
  and SKUs never change. Colour and pattern SKU codes are made unique within their list (a new
  «Синій» gets `SY`, not the `SI` of «Сірий»). The real-wool photo swatch waits for media storage.
- **«Категорії»** (23 §23.7): the tree with distinct product counts (descendants included),
  ▲▼ ordering saved as one sibling set, «★ на головній» (cap 6; the homepage shows the first four
  starred, seeded with round 10 part 2 #8's four), show/hide, per-locale hiding, the text shown
  under the products (round 10 part 3 #12), SEO title and description, and the custom-size seed
  rate (`products.manage_price`). New categories start hidden; depth is capped at three; delete is
  refused while products or subcategories are attached. A changed slug writes a 301 `Redirect`, and
  the storefront consults redirects before answering 404 for any page.
- **«Журнал дій»** (24 §24.12): newest first, filtered by person, section and dates, each row
  opening to «Було / Стало»; «Перевірити цілісність» recomputes every hash with the trigger's own
  formula, so an edited or removed row shows where the chain breaks (38 #62).
- **«Співробітники»** (24 §24.6–24.8): invite by name, external login e-mail (an address on the
  site's domain is refused — round 7 K2 rule 3) and role; the panel shows a one-time link to pass
  on by hand until the e-mail service exists (invitation 72 h, bound to `invitedAt`; reset 30 min,
  bound to `passwordChangedAt`; signed with a separate `STAFF_TOKEN_SECRET`). The invitee sets the
  password on `/admin/invite`, then enrols 2FA at first sign-in. Suspend / restore, block /
  unblock (unblocking voids the old password and issues a reset link), deactivate, role changes
  and 2FA reset; every status change revokes sessions and is audited. I1 is a deferred database
  trigger («at least one active Owner»); I2 refuses changes to one's own roles or status; I3
  refuses assigning a role with permissions the actor lacks; an Administrator cannot reset an
  Owner's 2FA (round 9 §F3). A standing warning shows while only one Owner exists. Password rule:
  see «Staff password policy» below. Manual creation with a temporary password is replaced by a QR
  code of the invitation (see «Languages postponed» below).
- **Phone shell** (round 10 part 1): bottom bar Каталог (opens the menu) · Кошик · Обране · Зв'язок
  (a sheet with both phones and the messengers); the floating messenger button bottom-right on
  desktop only; «Нагору» bottom-left on desktop, above the bar on phones.
- **Обране** (round 9 part 3 #25; round 10 #16–17; round 11 #17): `localStorage` only
  (`vk_wishlist`, slugs), the heart always visible on cards and beside the product title, a
  counter in the header; `/{locale}/obrane` (proposed slugs `wishlist`, `ulubione`, `merkliste`)
  re-reads the products through `GET /products?slugs=` so prices are current; `noindex`.
- **Catalogue filters** (round 10 part 3 #6, #7, #11, #16, #22; round 11 #25): on phones a «Фільтри»
  button pinned above the bottom bar opens a full-screen sheet; the apply button reads «Показати
  N товарів» with a live count on phones and desktop; active-filter chips with «Скинути все»;
  square card photos; an empty filter result offers «Скинути фільтри» under the searching-shepherd scene.
  Fixed on the way: the price fields were read as kopecks — they are hryvnias in the URL now.
  Then closed: the two-thumb price slider kept in step with the from–to fields (#9); the sort
  list is exactly #21's five — popular, new, cheapest, most expensive, «Зі знижкою» (deepest
  current discount first); search reads Latin as Ukrainian (lizhnyk, ovchina), knows the common
  en/pl/de words (blanket, koc, Decke, socken → the Ukrainian product words) and, when nothing
  matches, falls back to trigram similarity over product names (`pg_trgm`, threshold 0.4), so
  «ліжнек», «пряжжа», «капцы», «черемощ» still find the products (#24, #25).
- **Mega menu** (round 10 part 1 #5–7): opens on hover after ~150 ms of intent, on click and from
  the keyboard (Escape closes); every category with its photo slot (placeholder until the shoot)
  and its subcategories as text links (part 3 #14), plus three best sellers of own manufacture.
  The promo banner slot waits for the banner manager (23 §23.12). The hanging logo stays above
  the open panel.
- **SEO foundation** (29 §29.3, §29.6, §29.9, §29.10; 30 §30.9):
  - One `SeoHead` emits robots, canonical, hreflang and og:locale on every page. `TRANSLATED_LOCALES`
    is `uk` only until the other languages are really translated, so `/en`, `/pl`, `/de` pages are
    `noindex, follow` with no canonical or hreflang (rule 6), and hreflang lists only real
    translations (`GET /seo/alternates`) with `x-default` → `uk`.
  - Canonical is the page itself minus `sort` and tracking parameters; a filtered listing is
    `noindex, follow` and still canonical to itself. Checkout, order and wishlist are
    `noindex, nofollow`; search is `noindex, follow`.
  - `robots.txt` allows the AI agents of 30 §30.9 but repeats the closed paths (checkout, order,
    admin, API, tracking parameters) in every group, because a crawler obeys only the group that
    names it.
  - Sitemaps: `/sitemap.xml` indexes `sitemap-{pages|categories|products}-{locale}.xml`, translated
    locales only; product `lastmod` is the last publish (draft autosaves do not move it); legal
    pages join when their text is written.
  - Structured data: the site graph (Organization, Store + LocalBusiness, WebSite with SearchAction)
    on every page, without foundingDate or openingHours, Ukraine only, and without any value that
    is still a placeholder; Product with offers, seller and — for own manufacture only — the
    manufacturer; BreadcrumbList on products and categories; ItemList on categories.
    `AggregateRating` waits for enough verified on-site reviews.
  - Production needs `SITE_URL` set to the public origin.
- **Cookie consent** (round 10 part 7 #17–19 over 31 §31.3): a bottom strip after idle, «Прийняти
  всі» and «Лише необхідні» identical in size and weight, above the bottom bar on phones. The
  choice is a first-party cookie `vk_consent` with a version stamp, kept 180 days. GA4 loads only
  after «Прийняти всі» (Consent Mode v2 initialised default-denied, then analytics granted); with
  «Лише необхідні» nothing loads. The cookies page lists necessary / analytics / marketing with no
  pre-ticked boxes; withdrawing analytics deletes the `_ga` cookies and reloads. The banner shows
  only while a consent-gated tag is configured (`VITE_GA_ID`; ONEKNIGHT ok.js will join it,
  round 16 O2) — asking consent for nothing is not asked; in development it always shows.
- **«Шаблони»** (37 §37.2, `templates.manage` ⚠): per template the name prefix, default category,
  what blocks publishing (name always; price, sizes, colours, composition, description, packed
  weight, «фото щонайменше N»), the default «Історія виробу» stages (only round 9 §F1's seven),
  the characteristics with «обов'язкова», the lizhnyk size-calculator overhang, hidden. Variant
  axes and selling units are shown but not editable while the template has products. New
  characteristics (text, number, yes/no, list) are created here and shared by all templates.
  Required characteristics now count in the product readiness meter (e.g. a sheepskin's measured
  length and width).
- **Prom reviews import** (round 13 N2, round 12 G8): «Відгуки» → «Імпорт з Prom» → a CSV
  (`date;rating;author;text;product;ref`, template downloadable; `,` or `;`, quoted fields) →
  a preview of every row with its action → «Підтвердити». 1–2 ★ are skipped; the original date is
  kept; a product is matched by SKU or exact name, otherwise it is a shop review; the display name
  is first name + initial; `sourceRef` (Prom id, or a hash of date, author and text) makes a
  re-import add nothing. Imported rows are published at once — the owner has just reviewed them —
  and never count towards `AggregateRating`.
- **«Клієнти»** (23 §23.8.6): read-only and derived from orders, keyed by **phone** rather than
  e-mail, because e-mail is optional for ordinary `uk` orders (round 10 §P5a). Search by phone,
  surname or e-mail; per buyer the order count, value (cancelled and returned excluded), average,
  last order, cancellations, and the order list. The order page shows «Постійний клієнт: ще N
  замовл.» or «Перше замовлення».
  - «Виправити дані» (`customers.update`): surname, name, phone, e-mail. Names and e-mail change in
    the open orders (not yet shipped) — or in the latest one when none is open; an order already
    sent keeps what it was sent with. A new phone moves all the buyer's orders and joins a buyer who
    already has that number. The audit row names the fields and orders, never the values.
  - «Знеособити…» (`customers.anonymize` ⚠, typed «ЗНЕОСОБИТИ»): refused while an order is open or
    shipped. Orders stay (accounting, §25.5 snapshots): the phone becomes an unlinkable `anon-…`
    token; e-mail, names, address, notes, tracking link, attribution and the payer fields of payment
    payloads are cleared; amounts, items, dates, statuses and fiscal receipts stay. The buyer's
    reviews are signed «Покупець» without e-mail; their «Купити в 1 клік» requests are deleted.
    Mail threads are not touched yet — that belongs to the mail module (Fri–Sat).
  - No marketing-consent toggle: the newsletter was removed (round 9 part 4 #20), so consent is never
    collected and there is nothing to toggle.
- **«Продаж у магазині»** (37 §37.6, `stock.shop_sale`): a phone-first page — search, − / + , «Продано»
  — that lowers live stock at once (stock is operational, not content: no publish), writes a
  SHOP_SALE movement, keeps an open draft's stock in step so a later publish cannot restore a sold
  piece, and archives a one-of-one item on sale; the last shop sales are listed. No receipt
  (round 14: the client records no receipts for shop sales).
- An **archived product's URL** now answers 301 to its category (37 §37.5) instead of 404.
- **Panel on a phone** (round 10 part 8 over 23 §23.17's four warehouse tabs): below 768 px a bottom
  tab bar — Панель · Замовлення · Пошта · Продаж · Ще — with «Ще» listing every section the
  person may see; tabs follow permissions.
- **Bulk editing across products** (23 §23.6.7 as narrowed by round 12 V13 and round 10 — stock is
  edited in the product only): select rows in «Товари», choose price ±% or ±₴ (rounded to 10 ₴ or
  to the hryvnia, never to zero or below), add to / remove from a category (never the last one),
  archive / restore, or the «Ручна робота» mark (never on partner goods); «Переглянути» shows what
  would change (a dry run of the same shape), «Застосувати» runs it in one transaction with
  `expectedCount` checked; one audit row per product carries the batch id, and «Скасувати цю
  зміну» reverts the batch from those rows, skipping any product changed since. Open drafts
  follow the new prices. Needs `products.bulk_edit`, plus `products.manage_price` for prices.
- **Collections** (round 10 part 2 #18 and part 7 #22, round 11 #65, round 12 T9): На подарунок,
  Весільні, Для дітей. A product joins by a tick in its editor (on publish; a new member goes to
  the end); «Колекції» in the panel orders the products (▲▼), removes one, edits the name, the text
  under the products and the SEO fields, shows or hides it. `/{locale}/kolektsii/{slug}` is a
  category page — the same filters and cards, the owner's order as the default sort. The homepage
  shows three cards in a row (stacked on phones), only for collections that have products; the
  rotating photographs wait for the shoot. Collections are in `sitemap-categories-{locale}.xml`.
- **Blog** (22; 23 §23.10; round 9 pillars; round 10 part 7 #14–15):
  - `bodyJson` is a list of the 22 §22.6 blocks — «Коротко» (key facts), paragraph, h2/h3,
    lists, quote, callout, product, FAQ, divider — with **bold**, *italic* and [links] inline,
    rendered as React elements (no HTML). A block editor replaces TipTap, which the project does
    not carry; figures and video wait for media storage.
  - `bodyPlain` and `readMinutes` are written on save; the §22.6 / §22.8 rules run on every save:
    «Коротко» first, at most three products, none at the very start, never two in a row, only
    products on sale — these block publishing; certificates, «еко», «100% натуральний», founding
    dates, visit promises, own flock / dyeing and an unqualified «14 днів» are warnings.
  - Publish now or schedule (`posts.publishScheduled`, every 5 min); the slug is made from the
    title at first publish. The six round 9 pillars are seeded as tags.
  - Storefront: `/{locale}/zhurnal` is a card grid with pillar chips; an article shows the byline
    «Іван», date and reading time, the blocks, products live (price, stock, origin label; the
    partner is never named), then only «Товари зі статті» and sharing (Telegram, Viber, Facebook,
    copy link, the system share sheet) — no comments, no «more articles». Article, BreadcrumbList
    and FAQPage structured data; `sitemap-posts-{locale}.xml`; «Журнал» in the footer.
  - A published article has its own draft (`Post.draftDocument`, §25.8i), as products do: autosave
    writes there, readers keep the published text until «Опублікувати зміни»; «Скасувати зміни»
    drops the draft; «Зняти з сайту» folds the draft into the text, so nothing written is lost.
    Changes to a live article go out at once — scheduling is only for articles not yet on the site.
    Audit: `post.draft_opened` (once per draft, not per autosave), `post.changes_published`,
    `post.draft_discarded`.
- **Homepage built to the round 10 part 2 order** (2026-09-30): the page had carried only the
  categories, collections and best sellers; it now has all ten sections of the canvas board
  «Головна · комп'ютер» — categories (the round 11 U3 illustrations; «Усі категорії» opens the
  rest in place), from raw wool to finished product (the wool track as a path whose red thread
  draws while scrolling, вичинка шкур as the sheepskin branch, «Як ми виробляємо →»), best
  sellers, the four trust points (round 11 U4 icons), yarn, collections, reviews (the Google
  rating badge and the on-site summary; the video row stays hidden until three video reviews
  exist), come to Яворів, phone and messengers. Peach and cream alternate with a hill edge on
  every section; empty sections are skipped and the alternation is assigned afterwards.
  - Placeholders: `BUSINESS.googleRating`, `googleReviewCount` ({{GOOGLE_RATING}},
    {{GOOGLE_REVIEW_COUNT}}); photos of stages, yarn and collections wait for the shoot. The map
    shows the canvas board's drawn preview until the static styled map image (round 13 N7)
    exists; «Прокласти маршрут» uses `BUSINESS.mapsUrl`.
  - The public category tree now carries `key`, so art is picked independently of the locale.
- **Cart icon** (client, 2026-09-30: «іконка кошика виглядає як смітник»): the bag outline read as a
  rubbish bin; header and phone bottom bar now show a woven basket with handles («кошик»).
- **Payment marks in the footer** (client: «максимально похожими 1в1»): Visa, Apple Pay and the
  «Pay» of Google Pay use the Simple Icons outlines (CC0); Mastercard is the three-colour circles,
  Google Pay the four-colour «G». The legal row reads «© {current year} Вівчарик».
  Badges are cream `#F2EDE3` (client: white looked out of place on the dark footer).
- **Excel export and import** (37 §37.8, 23 §23.6.9, round 12 G8–G9), «Товари» → «Excel»:
  - Export: one row per variant, all products or one template («Лише: Ліжник»). Grey columns are
    for reading (product SKU, name, variant, status); peach columns are editable: price, old price,
    stock, low-stock warning, weight, packed weight and size, metres, ply, barcode. Money columns are
    formatted `# ##0.00`; the first three columns and the header row are frozen.
  - Import: matched by «Артикул варіанта», never by name. Headers are matched by their text (or
    the machine key), so there is no mapping step; unknown columns are listed and ignored.
    Absent column = untouched; present empty cell = cleared (an error for price and stock).
    Money strictly as `5 300`, `5300`, `5300.00`, `5300,00`. Errors block the commit (unknown SKU,
    duplicate row, price 0, old price not above price, a unique piece above 1); a price change of
    more than 50 % is a warning that needs «ТАК» typed (G6). Columns the user has no right to change
    (`products.manage_price`, `products.manage_stock`) are skipped and named.
  - The preview lists every change as «було → стане» and downloads as CSV for a second person.
    «Підтвердити» re-runs the check and refuses if anything moved since the preview (the dry run's
    hash); one transaction, stock changes as `IMPORT` movements «Імпорт з Excel», an open product
    draft follows the new values, one audit row per product with a shared batch id.
  - New variants (2026-09-30): a row with an existing «Артикул товару», a new «Артикул варіанта», the
    «Варіант» spelled as the export writes it («200×220 см · Сірий», any order; «х»/«x» accepted in
    sizes; a label containing «·» is matched longest-first) and a price is added to that product's
    **draft** through the editor's own save — it reaches the site at «Опублікувати», like any edit.
    Sizes are matched only within the product's template (a «37» of slippers is not a «37» of
    anything else). Refused with a reason: unknown product, variant already there, unknown size or
    colour, two values for one parameter, no price, a one-of-one piece; metres, ply and barcode of
    a new variant are entered after publishing. New products are still created in the panel.
  - The export's second sheet «Довідник» lists, per product type, the sizes, colours and patterns
    it allows, spelled exactly as «Варіант» expects (round 12 G9, instead of drop-downs — the
    variant cell is a combination). Not yet: resumable chunked commits.
    The file travels as base64 in JSON (limit 16 MB); `exceljs` 4.4.0 builds and reads it.
- **Staff password policy** (24 §24.10, 32 §32.6), at invite acceptance and password reset:
  12–128 characters, no composition rules, `zxcvbn` (`@zxcvbn-ts/core` 4.2.0) score ≥ 3 with the
  brand, the domain, Яворів / Косів, BOTEY, the person's name (also in Latin letters) and e-mail,
  and a list of Ukrainian words and keyboard runs (пароль, йцукен, gfhjkm, …) in the dictionary. A
  password built on one of those personal words needs one step more (it is scored one lower):
  «Oksana2026!!» is refused, «бабця пряде синю нитку ввечері» passes. Then the Have I Been Pwned
  range check (`HIBP_ENABLED`, on unless `false`; told on 2026-09-30 that the hash prefix leaves the server,
  the client continued without objecting — `{{HIBP_ENABLED}}` stays to be confirmed at launch): only the first
  five characters of the SHA-1 leave the server, with padding; a known-breached password is refused
  with its own message; a network failure lets the password through (fail open, 3 s timeout).
  The strength is enforced server-side only; the set-password page explains the rule and suggests a
  phrase. While typing, a four-step meter shows the server's own score (`POST /auth/staff/password-
  feedback`, authorised by the invitation or reset token, so the person's name counts): «Ще N
  символів», «Легко вгадати», «Слабкий — додайте ще слово або два», «Добрий», «Чудовий». The breach
  check runs only on submit.
- **Footer «Вечір у горах»** (round 11 variant Б; client, 2026-09-30: «футер… як в макеті, травичка»):
  the canvas board's band — low moon, terracotta and violet ridges, dark grass with arnica,
  bellflowers and white flowers — stands above the `forest-900` footer on every storefront page. Its
  sky is transparent so it continues the page; it is a cached image (`footer-evening.svg`), cropped
  from the centre on phones (110 px high) rather than squashed. The seasonal footer states (U12)
  wait for the seasonal hero photographs.
- **Mascot scenes** (round 10 part 3 #22, part 5 #4, part 8 #16; round 11 #27, #39), drawn from the
  hero's own shepherd and sheep symbols, played once, still under reduced motion:
  - «search»: the shepherd holds a swinging lantern; a sheep peeks from behind a bush — empty
    search, empty filter result (with «Скинути фільтри»), 404;
  - «cart»: a sheep leans into an empty woven basket, the shepherd stands by — the cart drawer and
    the checkout when the cart is empty. The shrug of round 11 #39 needs an arm rig the shepherd
    symbol does not have; not drawn.
  - Client, 2026-09-30 («він парує в небі, і в нього немає руки»; «замаленька вівця»): the hero draws
    the right arm together with the staff, so the scenes now use the arm as its own symbol — it holds
    the lantern in «search», and the shepherd keeps his бартка in «cart»; he stands on the grass; the
    sheep is in the hero's proportion to him (≈ 0.6 of his height in width), the bush grew with it, and
    the sheep at the basket leans 5° from its front feet instead of lifting its hind legs.
  - The 404 keeps the header, footer and cart (the locale layout's error boundary), offers the search
    field and «На головну», and answers HTTP 404. Other errors show «Щось пішло не так». A path
    without a locale prefix now goes to `/uk/<the same path>` (an unknown two-letter prefix is
    dropped), so a mistyped address reaches the 404 instead of silently landing on the homepage.
- The contacts page shows the same drawn map preview as the homepage until the static map image exists.
- **«Акції»** (23 §23.12 narrowed by round 9 part 3 #9 and round 10 part 9 #17 — promo codes for
  holidays, per-product discounts, no automatic or category-wide ones):
  - Promo codes: percentage or fixed amount off the goods; optional minimum order, product scope,
    window, total and per-buyer limits (per buyer = by phone, counted at order creation); `usageCount`
    visible. Codes are case- and space-insensitive (Cyrillic allowed); a used code cannot be renamed
    or deleted, only switched off. Another active code whose window and products intersect is named
    after saving (not blocked). `FREE_SHIPPING` and `BUNDLE` are not offered: shipping legs of COD
    with inspection make a free-shipping code ambiguous, and no one asked for bundles.
  - Checkout: «Є промокод?» (collapsed), «Застосувати»; every refusal names its reason (no such code,
    switched off, not yet / no longer valid, used up, minimum sum, not for these products, already
    used by you). One code per order and never with the volume discount — the server computes both
    and applies the larger, and says so («Оптова знижка … більша»). Re-checked at order creation;
    `usageCount` is taken atomically in the order transaction; `couponCode` and `discountSource`
    are stored, and the order pages read «Промокод KOD» or «Оптова знижка».
  - Announcement strip above the header on every page (round 11 slow ticker): «Відправляємо по
    Україні за 2–4 дні», «Огляд перед оплатою на пошті» (only while card-type payments are on,
    since COD with inspection needs the card deposit), the approved tagline, «Зроблено в Яворові»;
    gold rhombi between; ~40 px/s, pauses on hover and with a visible ⏸ button, × hides it for the
    visit (until the message set changes), still under reduced motion, read once by screen readers.
    The one seasonal message (a `Banner` with placement `announcement_bar`: text, a link to a site
    page, window) is edited in «Акції» and leads the loop while active.
  - Picture banners (`home_hero`, `category_top`) wait for the media module; the hero stays the
    animated scene.
- **Languages postponed** (client, 2026-09-30, chosen from three options: «Відкласти мови»): launch
  in Ukrainian only; en / pl / de are translated after launch. `/en`, `/pl`, `/de` stay `noindex`
  and out of the sitemaps (`TRANSLATED_LOCALES = ['uk']`), and the header's language switcher is
  hidden while Ukrainian is the only translated language. The AI-translation cost question of round
  13 (Claude API) is therefore not needed for launch. EU delivery is closed anyway.
- **Staff in the workshop** (24 §24.7 «manual creation»): instead of a temporary password shown to
  the administrator, the invitation link is also shown as a QR code — the person scans it with their
  own phone and chooses their own password and 2FA there, so no one else ever knows the credential.
  Login is still by an external e-mail address (it is the account's identifier).
- **Site check before launch** (2026-09-30): every URL of the sitemaps plus checkout, wishlist,
  search, a collection and a 404 answers correctly with a title and one H1; no console errors or
  hydration warnings on 15 key pages; no horizontal scroll at 375 px on 21 pages; axe-core (WCAG 2.1
  A/AA) clean on 15 pages after two fixes — a sold-out card now dims only its photo (the name,
  origin and price kept failing contrast under `opacity-60`), and small gold uppercase labels on
  the peach background (3.4 : 1) use the muted text colour. The 404 page now has its own `<title>`
  and `noindex`.
- **Admin accessibility** (axe-core, 18 panel pages, clean after the fixes): success labels no longer
  use `emerald-500` as small text (≈4.3 : 1 on `forest-950`, which 23 §23.3 already forbade) — a
  `.text-ok` label is set in the primary text colour beside a success dot; hidden categories and
  templates are marked by a dashed border instead of `opacity-60` (which made their text and the
  «Видалити» button unreadable); unlabelled controls in «Налаштування», «Шаблони» and «Журнал дій»
  got accessible names.
- **Category illustrations everywhere** (client, 2026-09-30: «згенеруй логічні іконки замість фото
  сам в стилі нашого сайту»): the mega menu shows the round 11 U3 circle illustrations instead of the
  dashed «фото» slots, and three new ones were drawn in the same ink line and palette — «Вовняний
  одяг» (a Hutsul кептар with red rhombi and green rosettes), «Шкіра» (a leather satchel with a brass
  clasp and stitching), «Від партнерів» (a painted Hutsul chest — скриня — in light wood with a green
  and red rhombus band; a handshake was tried three times and rejected by the client as unclear
  and off-style: the other icons show things from a workshop, not gestures). Mega-menu circles are
  80 px («логотипи ледь помітні»). The homepage circles use the same files, keyed by category `key`.
- **Motion — round 11 built** (client, 2026-09-30: «не помітив анімацій… реалізовуй всі, які ми
  обговорювали»). Tokens only (`--dur-*`, `--ease-*`); `prefers-reduced-motion` turns every movement
  into an instant state change; every state is also in text or ARIA. Built:
  - buttons: primary colour change + arrow nudge 4 px (#11), secondary fills from the bottom with
    inverted text (#12), every tappable element presses to 0.98 (#67), green focus ring with offset
    (#77), focused fields darken with a soft green glow (#44);
  - pending actions (#13): a wool thread runs through the button, the label becomes «Зачекайте…»,
    `aria-busy` — add to cart, checkout, pay, «Купити в 1 клік», review;
  - header shadow after 8 px (#09); mega menu and search slide down, categories appear in sequence
    (#10, #26); phone menu slides from the left with items in sequence, ☰ morphs into × (#68–69);
    back-to-top fades in after two screens (#66);
  - cards lift 4 px with a soft shadow, sold-out cards do not react (#16, #28); the heart fills with a
    1.15 pulse (#18); a thread draws round the homepage category circles on hover and focus (#20);
  - listing: the old list fades while the next loads, new cards rise in sequence (60 ms, ≤ 6) (#21);
    «Показати ще» now appends the next page under the shown cards and moves focus to the first new
    one, with `?page=` kept for Google (#23); the count on «Показати N товарів» rolls (#22); a loading
    thread after 400 ms (#24); the phone filter sheet rises from the bottom (#25);
  - product page: the price changes at once with a 600 ms highlight (#34); the custom-size price
    waits for a 400 ms pause, announced politely (#35); «✓ Додано» + «Додано в кошик» first, then
    on desktop the photo flies on an arc to the header cart, the badge bounces, the drawer slides in
    (#36–37, B3a); on phones a buy bar slides up once the main button has scrolled away and replaces
    the bottom bar (#41) — a scroll check, since a fast flick can skip an IntersectionObserver;
  - cart: the drawer slides in, a removed row collapses and «Повернути» stays 5 s (#38);
  - checkout: errors appear on leaving a field and clear as it is fixed; a green check on a valid
    phone, e-mail and chosen city (#45–46); option cards change smoothly (#47); «Є промокод?»
    expands and the discount line appears highlighted (#48); «Купити в 1 клік» fades and scales in
    (#52); swipe closes the cart drawer, the phone menu, the filter sheet and the quick-order sheet
    (#74);
  - page transitions: a thread stitches across the top while the next page loads and the page
    rises (#53), not in checkout or on the order page; card → product page is a photo morph via the
    browser's view transitions (#54); section headings below the fold rise once (#60); «30+ років»
    gets a thread drawn beneath it (#61); the hero name gets a signature thread drawn under it (#04 —
    the <h1> is never hidden, for SEO and LCP);
  - mascots: lantern search, empty basket, and the thank-you scene (#49) — the shepherd waves, the
    sheep hop — on a just-placed or just-paid order only, never after a failed payment (#50);
  - hero: the flock loop pauses on a hidden tab or with the hero off-screen (36 §36.5 step 4);
  - admin (#79 / A26): the orders list refreshes every 30 s; a new order slides in highlighted with
    a quiet two-note chime after the first interaction; muted per device in «Налаштування».
  - Waiting for the photos and video (Fri–Sat): second-photo cross-fade on cards (#15), the gallery
    cross-fade, in-place zoom with the «лупа» cursor, swipe and full-screen growth (#29–32, #08),
    colour-change cross-fade (#33), mask reveal of large photos (#55), blurred preview (#63),
    rotating collection photos (A28), video reviews and stage clips (#58, #64, #72). Waiting for the
    illustrator: the thread writing «Вівчарик» letter by letter and the first-visit ram-mark loader
    (#04–05, need a single-line trace of the lettering), the shepherd's shrug (#39). Not built: the
    frame-time monitor of ladder step 3; toasts (#51 — nothing on the site uses one yet).
- **Hero thread and button fixes** (client, 2026-09-30): the thread now **weaves through** «Вівчарик»
  — a smooth, uneven hand-drawn line (Catmull-Rom through points of different wave widths and
  heights; «хвильки … різні»), passing alternately in front of and behind the letters, drawn left to
  right as one thread in ~1.4 s. A piece was missing because `vector-effect: non-scaling-stroke`
  breaks `pathLength` dashes; removed from every drawn thread. The button hover states moved to the
  utilities layer — in `base` Tailwind's own text colour won, so the filled secondary button hid
  its label; hero buttons may grow past 280 px on wider screens so «Переглянути каталог →» fits.
  A homepage circle and its thread lift together on hover.
- **The needle** (client, 2026-09-30: «на кінці була голка… проходить скрізь букви і плете за собою
  нитку»; «тут таку ж голку»): a silver needle leads the thread with its eye at the drawn end, turns
  with the curve and passes in front of or behind the letters with the thread; thread and needle run
  on one clock and the needle rests at the end afterwards. The same needle leads the production-path
  thread, following the scroll both ways. Shared component `Needle.tsx`.
- **A more detailed Hutsul** (client asked for a mock-up first): v1 sent 2026-09-30 — same frame and
  landmarks as the current symbols (so every scene and the flock engine keep working), with brows,
  cheeks, a fuller moustache, a кресаня with a woven band, brass and two feathers, an embroidered
  collar with кутаси, a кептар with fur trim, appliqué rosettes, studs and wool pompoms, a wide черес
  with three rows of rivets, a fringed тобівка, trouser folds, onuchi with волоки and turned-up постоли.
  Waiting for the client's comments before it replaces the hero and scene art.
- **The detailed Hutsul is live** (client: «ідеально… можеш закидати все в проект»): the v2 figure
  and the new бартка (a long crescent steel blade in an engraved brass socket, a brass butt and
  finial, a red wool tassel; a grained haft with brass rings, rhombus-inlay bands, a leather grip
  and a brass ferrule) replace the hero shepherd and the scene art (search, 404, basket, thank-you).
  The drawing is split into named parts (`data-part`: legL, legR, armL, torso, head, face, hat,
  staff, armR) and the flock engine rigs by those names instead of element indices.
- **The fall** (client: «більш детальні анімації коли він падає від овець»): wobbling, head
  shaking, the hat sliding → he goes over backwards, legs kicking, arms flailing, the hat flying
  off and tumbling onto the grass, the staff dropped → a bounce on the back with a dust cloud →
  dazed: spiral eyes, three stars circling → up through a crouch, one hand pushing → dusting off
  (puffs from his clothes) → looks round for the hat, bends, the hat flies back to his hand and
  onto his head → adjusts it → shoos the sheep → walks back for the staff. The hat on the grass
  cannot be used to lift him. Development builds expose `__vkFall()` to replay it.
- **Sheep dropped by the visitor** (client's choices in the question widget): onto the shepherd —
  he drops the staff, catches it with both arms, cradles it against his chest like a lamb (his
  arms drawn in front of it), bends and sets it down on the grass, wags a finger, goes for the
  staff; onto another sheep at the same depth — the lower one squats and flattens, the upper one
  bounces off in an arc to the side and lands, both shake their heads. No speech bubbles. Dev:
  `__vkDropOnShepherd()`, `__vkDropOnSheep()`.
- **Hero sound** (round 10 part 2 #6, round 11 #76 — not built until now): a speaker button in the
  hero's top-right corner, off on every visit and never remembered; with it on, quiet synthesised
  «бе-е» and «гуп» (WebAudio, no files) play in these scenes.
- **A path from the hut** (client: «стежку… з деревяними гуцульскими парканами»): from the door
  down the back hill, disappearing behind the near crest, reappearing on the near hill wider and
  running to the end of the field — continued across the green meadow band under the hero, placed
  from where the hero's path ends on screen; Hutsul fences (posts, two rails, slanted stakes) along
  it, none under the shepherd's feet; grass tufts that fell on the path removed. The path moves
  with the hut on narrow screens. The near part starts above the crest and is clipped by the near hill's own outline (fences stay
  unclipped), so it emerges from behind the crest rather than ending in a straight cut. The cradle
  pose holds the sheep from below (arms −22° / 42°: the hands meet under its belly, not crossed).
- **Forest** (client): about a third of the firs a shade darker (#1E3B2E / #355C4A), and ~960
  lighter firs added — pale distant ones on the blue mountain (#7FA294) and lighter ones among the
  forest on the green hill (now #7DA88A) — drawn behind the existing forest, in its painting order.
  Client, same day («не бачу… світло зелених сосен в ближніх горах»): a quarter of the existing
  firs in the near and middle forests are now a lighter green (#4F8063 / #6D9A7F), mixed in among
  the dark ones, so the lighter trees are visible there as well.
  Client, next («зроби ще більше сосен кольорів які вже є»): the forests on the blue, middle and
  near mountains are denser, in the three shades already used there, rebuilt far to near so the
  nearer trees overlap the farther ones. A number-formatting slip in that rebuild («10.5» written
  as «1.5») left some firs floating in the sky; the whole hero was regenerated from the backup with
  correct formatting.
- **Detailed firs on the light-green hill** (client: «ялинки різних розмірів, але вже
  детальніші… вони замаленькі, їх замало, і трава налізає на них… ще більш детальніше… трьох
  кольорів»): 36 large firs in groups along the hill behind the flock, clear of the hut, drawn after
  the grass tufts so the grass never covers them, feet above the meadow crest. Two shapes (six
  tiers, and five broader tiers), each with a tapered trunk with bark lines, a leader at the top,
  notched tier sides, drooping bough tips, a shaded side, needle hatching and a lit edge; each in
  three greens — lighter (#4F9459), middle (#3A7A50), darker (#24513A) — mixed at random.
  Client, next («ближніх ялинок чуть-чуть більше в сторону хати і за ялинками… на краю пагорба теж
  але менші»): three more big firs toward the hut, and 38 small firs (a third to two thirds of the
  size) along the crest of the light-green hill, behind the big ones, so the hill's edge is wooded.
- **Fleece in three shades** (client: «овець так само… в три кольори»): white, cream (#F1E1C3) and
  darker (#C9B393), mixed through the flock. The shade is set on the still picture
  (`--wool` / `--wool-face` on each sheep) and the flock script carries it over, so a sheep keeps
  its colour when the animation starts; wool puffs from a landing sheep are its own colour.
- **Shading on the shepherd** (client: «придай якогось градієнта, щоб відчувались тіні»): every
  larger filled shape of the drawing has a soft overlay lit on its upper right (the sun is on the
  right) and shaded on its lower left; the overlays belong to the rig parts, so they move with the
  limbs.
- **Ground shadows** (client: «тіні під ялинками ближніми, пастухом та овечками… як вони будуть
  використовуватись при анімаціях»): a soft dark-green ellipse at the foot of each near fir, each
  sheep and the shepherd, shifted a little to the left. In motion: a sheep lifted, thrown or
  bouncing leaves its shadow on the ground under it, smaller and fainter the higher it is; a sheep
  in the shepherd's arms shares his shadow; the shepherd's shadow spans his body on the ground, so
  it stretches long when he lies after the fall and shrinks when he is lifted; the hat knocked off
  casts its own shadow while it flies and lies on the grass.
- **The hut** (client: «жвавіший колір… наче живий з тінями»): honey-coloured logs, each lit on top
  and dark in the seam, the wall shaded on the left and under the eave; a shingle roof in alternating
  rows, its right slope in the sun; painted shutters with gold rhombi, warm light in the window, a
  flower box; a carved door frame; a river-stone foundation; a soft shadow on the hill.
- **Five big firs on the near meadow** (client: «3 ялинки, але ще більші, і ще більш
  деталізовані… ще на дві… по правій стороні»): nine tiers with notched sides and drooping tips,
  branch ribs, needle hatching, sunlit tufts, a root-flared trunk with bark; their feet above the
  flock's band, so every sheep passes in front. Cones (client: «шишки під гілками мусять бути…
  задуже багато… хаотично»): one under each of three middle tiers, alternating sides, hanging from
  under the bough. The ink outline follows the bough edge (no fill outside it, on all firs).
- **Two Kosiv pots** hung upside down on the fence posts by the path (client: «традиційні гуцульскі
  ремісничі горщики… в нас так вішають»): a cream one painted green and ochre, a terracotta one.
- **Grass in the mouth** (client: «трави в зубах не видно»): a grazing sheep tugs off a tuft with a
  small jerk of the head (four blades, one with a yellow flower), eats it down, tugs again; chewing
  with the head up finishes it; anything else drops it.
- **Performance** (client: «без видалення… щоб анімації були плавними навіть на поганому пк чи
  телефоні»), nothing removed:
  - everything that moves (flock, shepherd, shadows, chimney smoke) is drawn in its own light
    layer above the still picture, which becomes its own compositor layer and is painted once;
  - inside the picture, `opacity` on single shapes became `fill-opacity` / `stroke-opacity`
    (identical look, about 1,100 fewer compositing groups, since every fir copy repeated them);
  - homepage sections and the footer use `content-visibility: auto`, so off-screen content costs
    nothing while the hero animates;
  - ladder step 3 (frame-time monitor) is built: on a device that cannot hold ~24 ms a frame the
    flock is drawn on every second frame (a steady 30 fps), back to every frame when it can;
    whatever the visitor holds is always drawn every frame;
  - the mega menu and the mobile drawer mount hidden when the page is idle, so opening them is a
    visibility change; best sellers are fetched when the pointer comes near;
  - the speaker button (over the moving flock) and the mobile bottom bar no longer blur what is
    behind them on every frame; their backgrounds are a touch more opaque instead (95 % / 97 %).
  Measured on a production build: 60 fps at normal speed everywhere; with the CPU slowed 4–6×
  (a weak laptop or phone) the hero holds 51–59 fps with no frame over 50 ms, LCP 1.5–1.9 s.
  A snapshot of the picture as an image was tried and dropped: it froze the first tap and would
  have become the page's LCP.
- **Build fix**: the storefront `typecheck` script (`react-router typegen && tsc`) wrote compiled
  `.js` files next to the sources (no `noEmit`), and Vite resolves `.js` before `.ts`, so edits
  were silently shadowed by stale copies. The 64 copies were deleted and `noEmit` set in
  `apps/storefront/tsconfig.json`.
- **On narrow screens** the hut moves into view among the hill's firs; the firs on its spot (and
  a big meadow fir on tablets) step aside with their shadows, so the house is seen whole.
- Placeholder messenger chips lost their `opacity-70` (contrast 4.33 → AA).
