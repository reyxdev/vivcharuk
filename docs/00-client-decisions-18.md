# Client Decisions — Round 18 (answers from the owner's visit)

Received 2026-10-02: the user brought Іван's answers back from the visit (the file `answer`). The
user also reports that the domain and the VPS are bought, and that the WayForPay merchant
contract could not be signed yet: the electronic signature step reported that signing is
temporarily suspended on the state side. Card payments stay off (round 14 F2) until it goes
through. **Highest-authority document** for the points below.

## C1 — Seller and contacts

- Seller of record: **ФОП Гондурак Любов Юріївна** (round 2 §E1 confirmed, round 14 F1 #1 closed).
  РНОКПП and IBAN are still to come (`{{LEGAL_ID}}`, IBAN empty in the answer).
- Address: **вул. Петруші, 1, с. Яворів, Косівський р-н** (Івано-Франківська обл.). Postal code
  still to come.
- One phone on the site, for calls and for Viber, Telegram and WhatsApp: **Іван's**,
  +38 067 997 34 50 (the number recorded in round 2 and round 9 part 5 #5). Любов's number is no
  longer shown (supersedes round 10 part 5 #1 «both phones»).

## C2 — Opening hours (supersedes round 2 §E3)

> «Непрацюючі дні: субота, неділя. 11:00-19:00.»

Hours are now fixed: **Monday–Friday, 11:00–19:00; Saturday and Sunday closed.** They replace
«Графік гнучкий» everywhere on the site (one constant, `BUSINESS.hoursText`) and appear in the
LocalBusiness structured data as `openingHoursSpecification`. The rule «hours never in structured
data» (CLAUDE.md, from round 2) no longer holds. Pickup is offered (unchanged).

## C3 — Wholesale (supersedes round 8 §L14 tiers and §L12 #4)

> «ОПТ Рахувати на 1 товар. від 10шт - 10%, від 20 - 20%»

- From **10 pieces −10 %**, from **20 pieces −20 %**, counted **per product**. Built reading: a
  product's colours and sizes count together; different products are counted separately (to
  confirm). By-weight and custom-size lines still neither count nor get the discount; still never
  stacks with a promo code.
- `DEFAULT_VOLUME_TIERS` and `volumeDiscount()` changed; the cart nudge names the product
  («Ще 2 шт. «Шкарпетки «Бескид»» — і знижка на цей товар стане 10 %»); the discount line shows a
  percent only when every discounted product is on the same tier. Copy on «Опт», delivery/FAQ and
  the panel's settings updated.

## C4 — Delivery and payment

- No free shipping (`{{FREE_SHIPPING_THRESHOLD}}` = none; round 14 F3 stands).
- Pickup in Яворів: yes.
- Cash on delivery: «ліміти від 10тис.» Built reading: cash on delivery (with inspection, and the
  partial prepayment whose balance is paid at the branch) only for orders **up to 10 000 ₴**;
  above it, card or invoice. A panel setting (`payments.cod.max_minor`, «Налаштування»), and
  checkout says why cash on delivery is missing. Reading to be confirmed.

## C5 — Production facts

- **Yarn is spun in-house** (closes round 9 follow-up §F1 question): own manufacture.
- **Wool: local, Carpathian, Hutsul, of several grades** — each product uses its own fibre
  thickness (microns). Now stated on the production page (wool chapter lead). Raw wool is still
  bought, not from an own flock.
- Tanning method: «ево вичинка» — meaning to be confirmed before anything is published.
- Tours: «Іван проводить екскурсії кожному» — the tour commitment is approved (roadmap B18, O8).

## C6 — Custom size («Свій розмір»)

For **ліжники, ліжникові накидки, ковдри вовняні**, rate per m²:

| Product | ₴ / m² |
|---|---|
| Ліжник з букле | 1 900 |
| Ліжникова накидка з букле | 2 000 |
| Ліжник звичайний | 1 000 |
| Накидка гладка | 1 500 |
| Ковдра натуральна вовняна | 2 600 |
| Ковдра напіввовняна | 1 200 |

Size from 100 × 100 cm to 220 × 400 cm; maximum loom width 200 cm (which side the 220 applies to:
to confirm). Applied per product in the product editor when the catalogue is entered.

## C7 — Catalogue

The answer lists 47 product kinds with size ranges, partner goods marked («від партнерів»: sheepskin
hats, leather belts, eco-fur keptars), and new families: bedding, pillows of several fillings,
wooden goods, eco teas. Wood is no longer «future» (round 1 B1). The category tree is proposed to
the client before the seed changes, because category slugs are permanent URLs.

## C8 — Logo

> «Логотип змінити на голову овечки сфотографовану спереді.»

The ram drawing (round 9 part 2 #1, round 17 B1) is to be replaced by a sheep's head seen from the
front. Waiting for the photograph; the recommendation is a drawing made from it in the site's line
style rather than the photo itself, so it stays legible at header size.

## C9 — Filled in by us (the user: «додумай що можеш сам»)

The user brought back all Іван could answer and asked us to settle the rest. Each choice below is
reversible in the admin and is not a client fact unless marked.

- **Postal code 78644** — public postal index of с. Яворів, Косівський р-н (ua-region.com.ua
  registry entry for an organisation in the village). Shown in the address and in LocalBusiness.
- **Category tree** (C7) — eleven groups, built in the seed and applied once to existing databases
  by key (`catalogue.tree_round` = 18): Ліжники та килими · Пледи та ковдри · Подушки та постіль ·
  Овчина · Одяг · Взуття · Шкарпетки й теплі речі · Пряжа та рукоділля · Шкіряні сумки · Дерев'яні
  вироби · Еко-чаї. Old categories not in Іван's list (Камізельки, Накидки, Вироби з овчини, Вовна
  для рукоділля, Від партнерів) are hidden, not deleted. Readings: «ліжникові доріжки» is its own
  subcategory beside Ліжники; «подушки вовні» = woven wool pillows, «з наповнювачем вовни» =
  wool-filled; «копілки, брилки» → «Скарбнички та сувеніри» (no guess at what «брилки» are);
  partner goods (шапки, шкіряні пояси, кептарі з еко-хутра) sit in their categories with the
  «Від партнерів» mark on the product. Five new illustrations (пледи, подушки, взуття, дерево,
  чай) in the shepherd's style. The mega menu became six compact columns; a subcategory drops the
  word it shares with its group («Подушки вовняні» → «Вовняні»). Client, same day («подушки та постіль поміняй місцями з взуттям»): Взуття is third,
  Подушки та постіль sixth, and in the six-column menu the sixth group runs down into the second
  row's empty last slot.
- **Custom size defaults** — category seed rates: ліжники 1 000, ліжникові накидки 1 500, ковдри
  2 600 ₴/m² (the букле and напіввовняні rates are set per product); switching «Свій розмір» on in
  the product form pre-fills width 100–200 cm (the loom) and length 100–400 cm.
- **Tanning** — nothing about «ево вичинка» is published until its meaning is known; the site keeps
  saying «вичинка шкур».
- **Logo** (C8) — drawn by us: a front-facing sheep's head in the ink style of the old logo, inside
  the same tilted double frame, fleece cap and fleece collar. The ram drawing is kept in
  `public/brand/logo-ram-*.webp`; replace with a drawing from Іван's photograph when it comes.
- **Deploy kit** — `deploy/push.sh root@IP domain` uploads the code and runs `deploy/install.sh` on
  the VPS (Docker, Node 22, Postgres local-only, Caddy HTTPS, systemd, ufw, daily pg_dump kept 14
  days); the storefront's production server is `apps/storefront/server.mjs`.

## C10 — The logo, supplied

The client sent the logo itself (2026-10-02): a black-and-white sheep's head seen from the front,
solid black fleece, white face and inner ears. It replaces both the ram drawing and our interim
drawing (C9). Cropped to the artwork; the white around it made transparent while the white face
stays white; `public/brand/logo*.webp` regenerated (898 × 739 master, aspect kept). The site had no
browser icon: `favicon-32/64.png` and `apple-touch-icon.png` (the head on a cream disc, so it stays
visible on dark tab bars) are now linked from the storefront and the panel. Our interim drawing is
retired.

## C11 — First real catalogue: ліжники, доріжки, килими (2026-10-02)

> «ось фото ліжників їх є по 3 фото на товар… підстав в каталог судячи з зображень… ціни пиши
> поки від 1500-2500 грн… заповни опис сам… зроби так щоб зображення влізало.»

- 53 products from the user's 161 photos (HEIC), three per product (the first has five; its two
  repeats are left out): 32 ліжники (Ліжники), 8 доріжки (Ліжникові доріжки), 13 flat-woven
  килими (Килими та килимові доріжки). Names and descriptions written from the photos (colours,
  pattern, texture, fringe); prices 1 500–2 500 ₴ by size and complexity, one variant, stock 1, no
  sizes — Іван fills sizes and final prices in the panel. Ліжники and доріжки: «з овечої вовни,
  витканий у нашій майстерні в Яворові», composition 100 % овеча вовна. Килими: no composition
  and no workshop claim until Іван confirms their wool and maker; they are marked «Власне
  виробництво» like the rest — to confirm.
- **Local media storage** (Cloudinary is not connected): files under `MEDIA_DIR` (default
  `media/`), served by the API at `/media/` with a one-year immutable cache (file names carry a
  content hash); `Media.provider = 'local'`, `publicId = local:<path>`. Each photo in three WebP
  widths (480/960/1600); the storefront picks one by `srcset`. Batches are imported with
  `scripts/import-products.ts`; the converted files are listed in `<batch>.media.json`, so the
  server imports from the uploaded `media/` without originals (`deploy/install.sh` runs every batch).
- **Photos fit**: product cards are 4:5 with the photo shown whole (`object-contain`); the product
  page has a gallery (it was a placeholder) — swipe on phones, thumbnails below, counter, the first
  photo loaded at once, the rest lazily, height capped to the screen.
- **Yarn block** on the homepage: the user's photo of skeins, bobbins and roving; text now «Пряжу
  прядемо самі з місцевої карпатської вовни: кручена пряжа й рівниця сучена…».

## C12 — Production videos (2026-10-02)

> «відео з виробництва, від сирої вовни до прядіння… подумай як зробити так щоб відео швидко
> підгружались.»

Three 4K HEVC originals (0.5–1 GB each): чесання, ткання, прядіння. The site uses short silent
loops (18 s) cut from stretches that show only hands and machines — the weaving video shows the
weaver's face at about 1:20, so the full versions are not published (round 9 «no faces»). Fast
loading: H.264 MP4 at 480p (phones) and 720p, `faststart`, a poster frame (also the stage photo on
the homepage path), `preload="none"`, playback only while on screen, no autoplay with reduced motion
or data saver, files cached for a year. `scripts/import-stage-videos.ts`. Washing, felting, sewing
and tanning still have no footage.

## C13 — РНОКПП and IBAN (2026-10-02)

The user sent the ФОП's РНОКПП and IBAN (both pass their check digits). The footer and the
information page show «ФОП Гондурак Любов Юріївна · РНОКПП …». Payment «на рахунок IBAN» no longer
waits for an emailed invoice (the mail module is not built): the order page shows the payment details
at once — recipient, РНОКПП, IBAN, amount and the purpose «Оплата замовлення № …, без ПДВ», each with
a copy button; the order ships when the money arrives. Checkout and the delivery page say so.

Build fix: `tsc -b packages/schemas` had written compiled `.js` files next to the sources (that
tsconfig had no `noEmit`), and Vite resolves `.js` first, so the storefront kept a stale copy of
the shared code from 12:31 that day. The copies were deleted and `noEmit` set in
`packages/schemas/tsconfig.json`; every change since was re-checked live.

## C14 — Shop mailbox on Porkbun; outgoing mail (2026-10-02)

The user bought e-mail hosting at Porkbun and asked to use it for receipts and other messages. It
replaces Resend (round 13 N7) as the sending path: SMTP `smtp.porkbun.com`, 587 STARTTLS or 465,
login = the mailbox address with the mailbox's own password (Porkbun KB «Email client
configuration settings»). `From:` is the shop mailbox itself (a monitored address, so replies reach a
human — 26 §26.16.1's reason for a separate `Reply-To` falls away). Built:

- `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM`, `MAIL_REPLY_TO`; the API refuses to start with a server
  but no sender. Empty = nothing is sent; in development messages are written to `mail-outbox/`.
- Buyer e-mails as `mail.send` jobs (retried, enqueued in the order's own transaction, composed from
  the database at send time): «Замовлення … прийнято» (items, totals, delivery, payment, the IBAN
  details for a bank transfer, link to the order page), «Оплату отримано» (the fiscal receipt is on
  the order page — round 14 F4), «Замовлення відправлено» (tracking number). Only when the buyer gave
  an e-mail (optional for uk orders, round 10 §P5a).
- Staff invitation and password-reset links are also e-mailed to the employee's external address;
  the panel still shows them.
- Card payment (WayForPay) is still waiting: verification with the Дія signature failed during the
  state's maintenance, moved to the next visit.

The domain turned out to be `vivcharuk.com` (C15). Reading and answering business mail inside the panel (round 7 K2) can now use the same
mailbox over IMAP (`imap.porkbun.com:993`) instead of Cloudflare Email Routing — not built yet.

## C15 — The domain is vivcharuk.com; mailbox and automated mail (2026-10-02)

Checked in the client's Porkbun account (with the user, via the Chrome extension):

- **Domain: `vivcharuk.com`** (registered at Porkbun, expires 2027-09-28 ±; Porkbun nameservers).
  `vivcharyk.shop` was never registered. `BUSINESS.domain`, the public address
  (`info@vivcharuk.com`), the deploy examples and CLAUDE.md now use it. Public DNS on 2026-10-02:
  A records → Porkbun parking; MX → `fwd1/fwd2.porkbun.com` (forwarding defaults);
  `v=spf1 include:_spf.porkbun.com ~all`; no DMARC/DKIM of its own (a wildcard record answers
  those names).
- **Mailbox: paid until 2027-10-01 but «pending setup»** — no address or password exists yet. The
  owner creates it (Porkbun → Email → Configure): address `info@vivcharuk.com` as on the site, own
  password; then Porkbun's «Fix DNS» sets the hosting MX/DKIM records.
- **Porkbun's notice: «not intended for the sending of bulk or automated transactional email».** So
  the Porkbun mailbox is the business inbox (people write and reply; later read in the panel over
  IMAP), and the site's automated mail (order, payment, shipping, staff links) goes through
  **Resend** — the round 13 N7 choice — over SMTP: `smtp.resend.com`, port 587, user `resend`,
  password = Resend API key, `MAIL_FROM=Вівчарик <no-reply@vivcharuk.com>`, `MAIL_REPLY_TO=
  info@vivcharuk.com`; Resend's DNS records (DKIM, return path) are added in Porkbun DNS. The code
  is the same SMTP sender (C14); only the server settings differ.
- **Resend set up, 2026-10-02** (Resend team `gif19601`, region Ireland `eu-west-1`, Return-Path
  subdomain `send`, click and open tracking off, receiving off). Added in Porkbun DNS:
  `TXT resend._domainkey` (Resend DKIM key), `CNAME rsend → rsend-euw1.forge.rmta.net`,
  `CNAME send → send.forge.rmta.net`. They live on their own names, so the root MX/SPF of the
  Porkbun mailbox are untouched. The zone already had `_dmarc` (`p=quarantine`, reports to
  dmarc-report.com) and `default._domainkey` (Porkbun's DKIM); no second DMARC was added. Mail from
  `no-reply@vivcharuk.com` passes DMARC through Resend's aligned DKIM. The API key (Sending access,
  this domain only) is created by the owner and goes only into the server `.env` as `SMTP_PASS`.

## Still open after this round

Cannot be settled without the client: the delivery tariffs, or the Nova Poshta API
key for live ones (until then checkout cannot price delivery, so orders come through «Купити в 1
клік»); the product list with prices and photos; card
payments, when the WayForPay signing works. Readings to confirm whenever convenient: wholesale
counts a product's colours and sizes together; cash on delivery only up to 10 000 ₴.
