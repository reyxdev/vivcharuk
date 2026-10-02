# Client Decisions — Round 20 (admin panel interface)

Started 2026-10-02: the user asked for 300 questions in six batches of 50 about the panel's interface
— «компактним і логічним і дуже простим у використанні, без всього на кучу, і з понятними іконками».
Each batch was built from the previous answers. All six batches answered 2026-10-02.
**Highest authority** for the admin interface.

## E1 — Batch 1: general look, menu, icons, home (answers 2026-10-02)

| # | Question | Answer |
|---|---|---|
| 1 | Who works in the panel | Іван and his wife |
| 2 | Іван's computer skill | Beginner |
| 3 | Device | Phone and computer equally |
| 4 | Theme | Light (see batch 2 #53: reference app is dark) |
| 5 | Text size | Slightly larger |
| 6 | Density | Compact |
| 7 | Desktop menu | Left, icons only (see batch 2 #51: also «labels always») |
| 8 | Menu groups | No — one short list |
| 9 | Daily sections | Замовлення, Пошта, Купити в 1 клік, Товари, Продаж у магазині, Клієнти, Відгуки |
| 10 | Hide from the main menu | Шаблони товарів, Бібліотеки, Журнал дій |
| 11 | Menu size | Up to 8 items |
| 12 | Icon style | Coloured circles |
| 13 | Labels | Always |
| 14 | Phone bottom bar | Головна, Замовлення, Пошта, Продаж у магазині (+ «Ще») |
| 15 | «+» quick action | No global one; «Додати» inside each section |
| 16 | One search for everything | Yes |
| 17 | Bell | No — counters in the menu |
| 18 | Home shows | New orders, unread mail, make by date, ship today, running out, revenue, sales chart |
| 19 | Home style | «Що зробити зараз» to-do list |
| 20 | Sums on home | Hidden; the eye shows them |
| 21 | Default period | Month |
| 22 | Dates | «Сьогодні 14:05», «2 жовтня» |
| 23 | Money | 1 500 ₴ |
| 24 | Accidental actions | «Ви впевнені?» dialog |
| 25 | Saving | «Зберегти» button, always visible |
| 26 | Saved / failed notice | Short message at the bottom |
| 27 | Lists on a computer | Table |
| 28 | Rows | Load more on scroll |
| 29 | Filters | Tabs for the main split + a «Фільтри» button |
| 30 | Remember filters and tabs | Yes |
| 31 | «?» hints | Yes, one sentence |
| 32 | Empty section | One sentence + an action button |
| 33 | Keyboard shortcuts | No |
| 34 | New-order sound | Yes, can be switched off |
| 35 | Accent colour | Forest green |
| 36 | Font | System font |
| 37 | Top-left corner | Sheep's head logo + «Вівчарик» |
| 38 | «Відкрити сайт» | Yes |
| 39 | Sign-out, password, 2FA | Menu under the name |
| 40 | Breadcrumbs | Only «← Назад» |
| 41 | Statuses | Coloured badge with icon and word |
| 42 | Printing | Packing list, invoice, Nova Poshta labels, price tags |
| 43 | First-login tour | No |
| 44 | Help | Yes, one short page |
| 45 | Plain words | Yes («Варіанти» → «Розміри й кольори» etc.) |
| 46 | No permission | Hide the button |
| 47 | Slow village internet | Speed before looks |
| 48 | Install on the phone (PWA) | Yes |
| 49 | What bothers now | «все на купі, показуються всі фільтри» — wants a «Фільтри» button that opens a list of filter groups, each opening its list to choose from. A palette of 5 colours, all different, in the site's style, so buttons, interface, text and the menu each have their own colour |
| 50 | Liked app | Resend (screenshot of its API keys page: dark, left menu with thin icons and text, one search + one filter over a plain table, one primary button top right, «⋯» per row) |

## E2 — Batch 2: menu, palette, filters, orders list, home, printing (answers 2026-10-02)

Resolves batch 1 conflicts: the menu is **wide (icon + label) and collapses to icons by a button**,
on the **left**; **light theme by default with a dark switch**.

| # | Question | Answer |
|---|---|---|
| 51 | Icons only vs labels always | Wide menu that collapses to icons with a button |
| 52 | Side | Left |
| 53 | Theme | Switch; light by default |
| 54 | Liked in Resend | Few elements, plain table, search + one filter over the table, thin menu icons, «⋯» per row |
| 55 | Palette | «Ліс і вовна»: forest #1F3A2E (menu), emerald #2E7355 (buttons), gold #B08D4F (accents), fleece #FAF8F4 (background), ink #1C1B18 (text) |
| 56 | Icon circles | Each section its own colour |
| 57 | Sections beyond 8 | «Ще» at the bottom of the menu, a grid of icons |
| 58 | Home | The logo leads home (not a menu item) |
| 59 | Menu order | Пошта, Замовлення, Магазин, Товари, Клієнти, Відгуки (1 клік is a tab, #60) |
| 60 | «Купити в 1 клік» | A tab inside «Замовлення» |
| 61 | Menu counters | New orders, unread mail, 1-click requests, reviews to check |
| 62 | «Фільтри» button | Shows the count: «Фільтри · 2» |
| 63 | Chosen filters | Chips under the search with ✕ |
| 64 | Filter list | Drop-down: group → its list |
| 65 | Applying | With a «Показати» button |
| 66 | Reset | Yes, in the menu and beside the chips |
| 67 | Saved filter sets | No |
| 68 | Order tabs | Нові, Чекають оплати, Виготовляються, Відправити, В дорозі, Завершені, Усі |
| 69 | Order filters | Date, payment method, paid/unpaid, delivery, city, sum from–to, custom size, not confirmed by call, wholesale |
| 70 | Order columns | Number, date, buyer, phone, items in short, sum, payment, delivery and city, status, TTN |
| 71 | Row actions | «⋯»: call, change status, print |
| 72 | Bulk select | Yes |
| 73 | Order opens | As its own page |
| 74 | To-do order | By urgency: overdue → today → rest |
| 75 | Mark done on home | Yes, where it is one action |
| 76 | Chart | Bars by day |
| 77 | Month comparison | Yes, arrow and percent |
| 78 | Other figures | Order count, average order, sold in the shop, best seller, new customers |
| 79 | Eye | Hidden again each time |
| 80–81 | Wife | Her own login; same rights as Іван |
| 82–83 | Global search | Results under the field in groups; phone in any form (067…, +38067…, 67…) |
| 84 | Notices | Bottom centre |
| 85 | «Ви впевнені?» for | Cancel order, delete product, unpublish, refund, delete mail, block staff, **any status change** |
| 86 | Unsaved changes | Warn when leaving |
| 87–88 | Packing list | Number and buyer, items with size and colour, small photo, delivery and address, note, «поклав» boxes; one or several orders |
| 89 | Invoice | Companies and ФОП, anyone paying to IBAN, also sent as a PDF by mail |
| 90–91 | Nova Poshta | Іван uses the Nova Poshta app now; create TTN from the panel later, when there is an API key |
| 92–94 | Price tags | Name, price, size, composition, SKU, QR to the product page, logo; A4 sheet to cut; ordinary A4 printer |
| 95–96 | Help topics | Take an order, add a product, answer mail, shop sale, printing, sign-in/password/Authenticator; steps with pictures |
| 97–98 | Phone app | Sheep's head on cream; name «Вівчарик» |
| 99 | Touch size | Larger on the phone, compact on the computer |

## E3 — Batch 3: order page, products, shop, customers, reviews, «Ще» (answers 2026-10-02)

| # | Question | Answer |
|---|---|---|
| 101 | Menu start state | Expanded; remembers the choice |
| 102 | Menu colour | Forest-dark even in the light theme |
| 103 | Section colours | Пошта sky #5A8AAF, Замовлення emerald #2E7355, Магазин gold #B08D4F, Товари terracotta #C77D58, Клієнти ornament violet #8E76A8, Відгуки arnika #E0B33A, Ще stone #7B776E |
| 104 | Theme switch | In the menu under the name |
| 105 | Search | Field always on a computer, magnifier on the phone |
| 106 | Status badges | Нове sky · Підтверджене emerald · Виготовляється violet · Пакується gold · Відправлене sky · Отримане emerald · Скасоване red · Повернене peach; each with an icon |
| 107 | Order page | Two columns: items and sums left, buyer and delivery right |
| 108 | Order header | Number · status · one big next-step button; the rest in «⋯» |
| 109 | Contact buyer | Call, Viber, Telegram |
| 110 | History | Collapsed at the bottom |
| 111 | Editing an order | Address and contacts only |
| 112–113 | TTN | Entered in the «Відправлено» dialog, with «Надіслати покупцю лист з ТТН» on by default |
| 114 | «Оплату отримано» | Yes, with the amount |
| 115–116 | Order items | Small thumbnails; «Копіювати» beside phone, address, TTN, sum |
| 117–118 | 1-click tab | First when there are requests; table rows with «Подзвонив» and «Створити замовлення» |
| 119 | Product columns | Photo, name, SKU, price, stock, on site, sold this month, changed |
| 120 | Product tabs | Усі, На сайті, Чернетки, Приховані, Закінчуються, Немає в наявності |
| 121 | Product filters | Category, collection, price from–to, colour, material, custom size, no photo, own/partner |
| 122 | Inline edit | Price and stock in the table |
| 123 | Bulk | Price by %, hide/show, category, price tags, delete |
| 124–125 | Product form | New product in steps; editing an existing one on one page with sections |
| 126 | To publish | Photo, name, price, category, size |
| 127 | Description | Draft from the category template, edited by Іван |
| 128 | Photos | Drag several, phone camera, first is main, reorder by drag, crop and rotate |
| 129 | Sizes and colours | Size × colour table, each with its own price and stock |
| 130–132 | Extras | «Створити схожий»; «Подивитись на сайті» (drafts too); Excel hidden in «⋯» |
| 133 | Shop: finding items | Search by name; tiles of popular items with photos |
| 134 | Shop payment | Cash; transfer to card |
| 135 | Shop receipts now | **None** (see the open point below) |
| 136–137 | Shop | Manual discount by sum or %; today's total at the bottom (cash / transfer) |
| 138 | Customer columns | Name, phone, email, city, orders, last order |
| 139 | Customer marks | ★ wholesale (same as in mail), regular (3+ orders, automatic), «обережно» |
| 140 | Customer card | Orders, mail, notes, addresses, reviews |
| 141–142 | Reviews | Published after checking; Publish, Hide, public reply from Вівчарик |
| 143–144 | «Ще» | All of: categories, collections, photos and video, blog, promotions and promo codes, newsletter, staff, settings, help, product templates, colours and materials, audit log; two rows — daily on top, set-up below |
| 145–149 | Tables | Compact rows, 40 px thumbnails; each row becomes a card on the phone; main button top right; sort by header; fixed columns |

**Open point (shop receipts):** shop sales by cash or card transfer are recorded without a fiscal
receipt today. Whether a ПРРО is required for this ФОП's sales is for the client's accountant; the
panel records the sale either way. Asked again in batch 4.

## E4 — Batch 4: product steps, categories, mail, promotions, settings, printing, feel (answers 2026-10-02)

| # | Question | Answer |
|---|---|---|
| 151–153 | New-product steps | Numbered circles with step names; photo may be skipped (stays a draft); «Далі» saves the draft |
| 154–155 | First step | Category first (fills sizes, description, name), picked from photo tiles |
| 156–157 | Name, SKU | Name prefilled from the pattern, edited by Іван; SKU automatic (LZH-0042), editable |
| 158–159 | Sizes, colours | Category's ready sizes as ticks + «add another»; colour circles from the library + «new colour» |
| 160–161 | Price, stock | Price suggested from the price per m², Іван confirms; new stock = 1 |
| 162–163 | Made to order, composition | Switch on the sizes step; composition from the category, editable |
| 164 | Last step | Site preview + «Опублікувати» / «Зберегти чернеткою» |
| 165–166 | Categories, media | Tree with drag ordering; media grid with search and «where used» |
| 167–170 | Mail | Two columns as now; tabs Нові · Відповіли · Усі, the rest under «Фільтри»; icon actions with hints + «⋯»; labels/orders/notes in a collapsible right panel |
| 171–172 | Promotions | Type tiles first (−%, −sum, free delivery), then a short form; list shows code, discount, valid to, uses, order sum, on/off |
| 173–174 | Settings | Tiles; Іван edits hours, phone and messengers, wholesale discounts, COD limit, ticker, home banners, page texts |
| 175 | Shop receipts | Ask the accountant; keep room for a receipt in the shop sale |
| 176–177 | Price tags | 8 per A4 (7×10 cm), black and white |
| 178 | Invoice | Number = order number, «без ПДВ», signature image, stamp, payment term |
| 179 | Packing list | One A4 per order |
| 180 | Help | «?» in the header opens help for the current section |
| 181–182 | Home | «Ship today» = confirmed (and paid where needed) without TTN; «running out» at stock 1 |
| 183 | Quick button on home | «Продаж у магазині» |
| 184–186 | Sound, push | Cash-register «дзинь», new orders only; notifications through the Telegram bot, not app push |
| 187–188 | Tone, errors | Warm tone; errors say what happened and what to do |
| 189–191 | Sign-in, people | «Remember 7 days» on own devices; history shows who did what; the wife's account at the next visit |
| 192–197 | Feel | Grey skeleton rows; «Немає зв'язку» strip keeping input; bottom sheets on the phone; collapsed menu shows the sheep's head; minimal motion; numbers right-aligned, tabular |
| 198 | Logo | As is: black-and-white head |
| 199 | Build first | The frame: menu, colours, tables, filters — then Orders |

## E5 — Batch 5: Telegram, order steps, shop till, bulk, content, print, theme (answers 2026-10-02)

| # | Question | Answer |
|---|---|---|
| 201–203 | Telegram | A shared group for Іван and his wife; new order, 1-click, new review, «make by» reminder, weekly summary, payment received (not new mail); the user creates the bot and puts the token in .env |
| 204–205 | Greeting, tone | «Добрий ранок, Іване» by time of day; warm tone as in «Поки тихо. Саме час сфотографувати новий ліжник» |
| 206 | Menu counters | Number on the right; on the icon circle when collapsed |
| 207–208 | Date presets, search | Today, yesterday, 7 days, this month, last month, own dates; 3 results per group + «Показати всі» |
| 209 | Next-step button | Нове → «Подзвонив, підтверджую»; Підтверджене → «Пакувати» (or «Виготовляти» for custom size); Виготовляється → «Готово, пакувати»; Пакується → «Відправлено» (TTN dialog); Відправлене → «Отримано» |
| 210 | Delivered | By hand now; automatic from the TTN once the Nova Poshta key exists |
| 211 | Cancel reasons | Changed mind, not answering, out of stock, not paid, duplicate, suspicious, other (text) |
| 212–213, 222 | «Обережно» | Offered as a tick after an unclaimed parcel; with a text reason; a yellow strip on the customer's next order |
| 214 | Refund | Recorded by hand: sum and how (card, IBAN, cash) |
| 215–216 | Order from a call | One page: Покупець · Товари · Доставка · Оплата; typing the phone finds the customer and fills name and address |
| 217–219 | Shop till | Item tiles left, receipt right (bottom on the phone); «Продано ✓» then an empty till; undo the same day with «Ви впевнені?», stock returns |
| 220–221 | Inline edit, bulk | Enter saves with a notice; bulk bar at the bottom «Обрано 3 · Друк · Статус · ⋯» |
| 223 | Anonymise | Owner only, in the customer's «⋯» |
| 224 | Review replies | 3–4 ready short replies, editable |
| 225–227 | Blog, SEO | Іван, rarely; simple editor like mail + photos; SEO fields filled automatically, hidden under «Додатково» |
| 228 | Staff rights | **Detailed ticks, as now** (not three simple roles) |
| 229–232 | Site content | Ticker: list of phrases with switches and drag order; up to 3 banners: photo, title, button, show from–to; page texts: simple editor with preview |
| 233–234 | Libraries, audit | Simple lists; audit in plain words, filtered by person and date |
| 235–237 | Invoice, print | No signature or stamp yet (space left empty); 3 banking days; print opens a sheet preview, then «Друкувати» |
| 238–239 | Phone | Install hint once; bottom bar Головна · Пошта · Замовлення · Магазин · Ще |
| 240–241 | Theme, text size | Dark = «Ялинова ніч»; each person picks text size in the menu under the name |
| 242–245 | Home and tabs | Counts on tabs; chart bars split site/shop by colour; top 3 products with photos; to-dos also: not confirmed by call 24 h+, IBAN unpaid 3 days+, products without photos, reviews to check |
| 246–248 | Small things | Copy icon turns into a tick; the «дзинь» also on the phone; in lists on the phone statuses are icon + colour only |
| 249 | Last batch | Focus on the phone |

## E6 — Batch 6: the phone (answers 2026-10-02)

| # | Question | Answer |
|---|---|---|
| 251–253 | Phones | iPhone, ordinary size, used with one hand — main actions at the bottom |
| 254–257 | Frame | Header: section name · magnifier · initials circle; hides on scroll down; bottom bar **icons only**; «Ще» opens as its own screen |
| 258–261 | Order cards | Number and status icon, buyer, sum, items in short, city, time, paid/unpaid; no swipes; long press selects several; pull down to refresh |
| 262–265 | Order page | Next-step button stuck at the bottom; blocks: buyer → items → delivery → payment → notes → history; three big round buttons call / Viber / Telegram; tapping the address copies it |
| 266–268 | Entry | TTN by camera (barcode) or typed; «Вставити» from the clipboard; numeric keyboard for numbers |
| 269–270 | Filters, tabs | Full-screen sheet: groups → list → «Показати 12»; tabs scroll sideways |
| 271–273 | Products on the phone | Camera or several from the gallery, compressed before sending, uploading in the background with progress; each size is a card with its colours and prices |
| 274–277 | Shop till on the phone | 2 tiles a row with photos; bottom strip «3 товари · 4 500 ₴ · Продати» that expands; tap adds 1 (sizes ask first); «Дали … → решта …» |
| 278–280 | Mail on the phone | Letter full screen with «←»; «Відповісти» opens a full-screen editor; help mentions dictation |
| 281–284 | Display | Phone text size respected + own switch; light until switched by hand; tablet = computer with collapsed menu; landscape adapts |
| 285–286 | Feel | Short vibration on key actions (where the phone allows); the back gesture closes sheets and dialogs |
| 287–289 | Data, sharing | Small 40 px thumbnails always; print → PDF / «Поділитися»; share an order as text |
| 290–292 | Home, app | Greeting → to-dos → «Продаж у магазині» → figures and chart; app icon badge with new orders; cream splash with the sheep's head |
| 293–294 | Sign-in | Hint «відкрийте Authenticator, скопіюйте код» + paste; **passkey (Face ID) sign-in** |
| 295 | Help | Separate phone screenshots |
| 296 | Phone priorities | Take and confirm an order, ship with TTN, shop sale, add a product with photos, change price/stock |
| 297–299 | Process | Emulator, then Іван's phone at the visit; **everything at once**; rebuild in place (the old panel is not kept) |

### Notes for the build (iPhone)

- Vibration (#285): Safari on iPhone has no vibration API; it works only on Android. Nothing is
  promised on iPhone.
- App badge (#291) and notifications on iPhone work only for the installed app (Home Screen, iOS
  16.4+) after the person allows notifications; notifications themselves go through Telegram (#186).
- TTN barcode by camera (#266): Safari has no built-in barcode reader; a small JS reader is used.
- Passkeys (#294): WebAuthn works on iPhone; it adds a server-side passkey store next to the
  password + TOTP, which stays as the fallback.

## E7 — Developer decisions after the build (2026-10-02)

Decided by the developer (not client facts):

- **Telegram is personal, not a group** (replaces #201). Only the owner, and the people the owner allows in
  «Співробітники» (Telegram column), receive notices. Each links their own chat: «Пароль і вхід» →
  Telegram → «Отримати код» → open the bot → send the 6 digits. The code lives 10 minutes, works once,
  is stored as an HMAC; wrong codes are limited (5 per chat per 15 min, 30 a minute for the bot); the bot
  answers private chats only; `/stop` unlinks. Each notice goes only to people whose permissions cover
  it (orders, reviews, revenue for the weekly summary). The bot is read by long polling, so it needs no
  public URL. The group chat id setting is removed.
- **«Не підтверджено дзвінком понад добу»** left Telegram (not on the list in #202); it stays on the home
  page to-do list.
- **TTN camera scan on iPhone:** `@zxing/browser` (MIT), loaded only when the camera opens; the browser's
  own reader is used where it exists.
- **`Customer.email` is optional**; the `…@no-email.invalid` placeholder is gone.
- **Promo «once per customer» counts by phone** (e-mail at checkout is optional) — supersedes «by e-mail» in round 19 D3.
- **SKU format** stays `VCH-LZ-0101` (round 12 V7), not the «LZH-0042» example of #157.
- **Anonymising a customer** also removes their letters from «Пошта» in the panel (the Porkbun mailbox copy is not touched).
