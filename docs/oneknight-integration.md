# ONEKNIGHT integration — contract, mapping and gap log

Status: **not connected.** Decision: [00-client-decisions-16.md](00-client-decisions-16.md).
Contract as of **2026-09-30**; live documentation: `https://oneknight.pro/docs/api`. Only what is
written here is assumed to exist. A missing capability goes into §4, never into code as a guess.

---

## 1. Contract (as supplied)

**Two entry points**

| Entry | Caller | Auth | Notes |
|---|---|---|---|
| `/api/public/*` | Browser | `x-site-key: sk_<32 hex>` | Works only from the site's domain (Origin check) |
| `/api/v1/*` | Site server | `Authorization: Bearer ok_sec_…` | From a browser → `403 secret_key_in_browser`. Limits per site: 600 reads/min, 300 orders/10 min. Breaking changes go to `/v2`; `/v1` lives at least 6 months after |

**`/api/v1` endpoints**

| Endpoint | Returns / accepts |
|---|---|
| `GET /site` | `{ id, domain, name, business, verified, publicKey }` |
| `GET /products`, `GET /products/{id}` | `id, sku, name, description, categoryId, price, oldPrice, discountPercent, availability, orderDays, inStock, stock, fewLeft, photo, photos[], attributes[{name,value}], warrantyMonths, weightG`. `availability`: `in_stock \| to_order \| expected \| out`. Prices in UAH as a number. No variants, units or translations yet |
| `GET /categories` | `[{ id, name, parentId }]` (tree) |
| `POST /orders` | Body `{ customer: { name, phone, email? }, items: [{ productId, qty 1..99 }], delivery: { method: novaposhta\|ukrposhta\|pickup\|courier, city?, branch?, address? }, payment: cod\|iban\|card, comment?, analytics?, customerIp? }` → `201 { number, total, status }` or `409` (`out_of_stock`, `unavailable`, `unknown_product`). Prices and names come from ONEKNIGHT's catalogue; stock is reserved atomically |
| `GET /orders/{number}` | `status, statusName, paymentStatus, prepaid, total, items, delivery, payment, waybill, createdAt, history[]` |

**Statuses.** Order: `new, confirmed, shipped, done, cancelled, returned` (business sub-status in
`statusName`). Payment: `unpaid, prepaid, paid, refunded`.

**Webhooks.** Up to 3 URLs per site, each with its own event set. Events: `order.created`,
`order.status_changed`, `order.payment_changed`, `product.changed` (`action:
created|updated|deleted`), `stock.changed`, `category.changed`. Body `{ id, type, createdAt,
siteId, data }` with short data (ids and new state; fetch the rest from the API). Headers
`x-oneknight-event`, `x-oneknight-delivery`, `x-oneknight-signature: t=<unix>,v1=<hex
HMAC-SHA256(secret, t + "." + raw body)>`. 2xx = delivered; otherwise retries after 1, 5, 30 min,
2 h and 12 h. The same event can arrive twice.

**ok.js.** `<script src="https://oneknight.pro/ok.js" data-key="sk_…" defer>`. Attributes
`data-ok-product="<id>"`, `data-ok-cart`, `data-ok-phone`, `data-ok-name`, `data-ok-reviews`,
`data-ok-stars`. Functions `oneknight.track()`, `oneknight.context()` (goes into the order's
`analytics`), `oneknight.cart([...])`, `oneknight.product(id)`. Clicks on `tel:`, `viber:`,
`t.me` are counted automatically.

---

## 2. Site side (seams laid now)

| Seam | Where |
|---|---|
| Ports `CatalogSource`, `OrderSink`, `ReviewSource`, `CustomerDirectory`, `AnalyticsSink`; `Local*` now, `OneKnight*` later; `DATA_BACKEND_<PORT>=local\|oneknight` | [00-client-decisions-16.md](00-client-decisions-16.md) O1 #1 |
| `externalRef` on Product, ProductVariant, Category, Order, Customer, Review; `Order.externalNumber` | [25-database-schema.md](25-database-schema.md) §25.8g |
| Receiver `POST /api/v1/webhooks/oneknight`; `ProcessedWebhookEvent` | O2 #1 |
| Outgoing: pg-boss job in the same transaction, `singletonKey` = idempotency key | O2 #2 |
| `revalidate(entity, id)`: `product.changed`/`stock.changed` → product page and lists; `category.changed` → menu | O1 #6 |
| Env: `ONEKNIGHT_API_URL`, `ONEKNIGHT_SECRET_KEY`, `ONEKNIGHT_WEBHOOK_SECRET` (server), `ONEKNIGHT_PUBLIC_KEY` (browser) | O1 #7 |
| Egress and CSP entries, conditional on the keys | O2 #3 |
| ok.js after analytics consent only | O2 #4 |

---

## 3. Mapping (one table, in the adapter)

**Order status** — the site's own value always travels in `statusName`.

| Site `OrderStatus` | ONEKNIGHT |
|---|---|
| `AWAITING_QUOTE` | `new` (international; closed at launch, round 13 N7) |
| `PENDING` | `new` |
| `CONFIRMED` | `confirmed` |
| `IN_PRODUCTION` | `confirmed` |
| `PACKING` | `confirmed` |
| `SHIPPED` | `shipped` |
| `DELIVERED` | `done` |
| `CANCELLED` | `cancelled` |
| `RETURNED` | `returned` |

**Payment status**

| Site `PaymentStatus` | ONEKNIGHT |
|---|---|
| `UNPAID`, `FAILED` | `unpaid` |
| `AUTHORIZED` | `unpaid` (not captured) |
| Prepayment captured, remainder COD (round 8) | `prepaid` — the site has no enum value for this yet; derived from the prepayment transaction |
| `PAID` | `paid` |
| `PARTIALLY_REFUNDED` | **gap** (§4) |
| `REFUNDED` | `refunded` |

**Payment method:** `CARD_ONLINE` → `card`, `COD` → `cod`, `BANK_TRANSFER` → `iban`.
**Carrier:** `NOVA_POSHTA` → `novaposhta` (branch or locker) or `courier` (address),
`UKRPOSHTA` → `ukrposhta`, `PICKUP` → `pickup`, `INTERNATIONAL` → **gap**.
**Money:** kopecks ↔ UAH number, only in the adapter. **Phone:** E.164. **Dates:** ISO 8601 UTC.

---

## 4. Gap log — what the API does not cover yet

Each row: what the site needs, the fields, and where the blueprint defines it.

| # | Need | Fields | Blueprint source |
|---|---|---|---|
| G1 | **Variants** size × colour × pattern, price and stock per variant | variant id, SKU, option values, price, stock, `madeToOrderDays` | [37-product-admin-system.md](37-product-admin-system.md) §37.2, §37.4; [25-database-schema.md](25-database-schema.md) `ProductVariant`, `OptionType`, `OptionValue` |
| G2 | **Selling units** piece / kilogram / skein / metre; price per 100 g and per kg for yarn | `PricingUnit`, unit price, step | §25 `PricingUnit`; §37.4 section 5 |
| G3 | **Translations** uk / pl / en / de, and whether each is machine or human | per-locale name, description, slug, `TranslationSource` | §25 `ProductTranslation`, §25.8e; [00-client-decisions-10.md](00-client-decisions-10.md) §P8a |
| G4 | **Order items by variant**, not only `productId` | `variantId`, qty, unit | same as G1 |
| G5 | **Custom size** orders with a concurrency cap of 5 and an honest date when full | dimensions, `customSize.concurrentLimit`, expected dispatch date | [00-client-decisions-13.md](00-client-decisions-13.md) N6; [18-checkout-specification.md](18-checkout-specification.md) §18.13 |
| G6 | **Prepayment** floor 460 ₴, remainder cash on delivery; the amount charged now | prepayment amount, remainder, `prepaid` status | [00-client-decisions-8.md](00-client-decisions-8.md); §18 |
| G7 | **Return-shipping deposit** credited against COD | deposit amount, waived flag, `payments.waive_deposit` | [24-employee-permission-architecture.md](24-employee-permission-architecture.md) H1.3; §18.16 |
| G8 | **Fiscal receipts** (ПРРО via WayForPay): number, link, QR, PDF, return receipts | `FiscalReceipt` fields | [00-client-decisions-14.md](00-client-decisions-14.md); §25.8e |
| G9 | **Volume discount** 5+ pieces −10%, 25+ −20%; shown as a separate «Знижка» line | discount source, rate, line amount | §25 `DiscountSource VOLUME`; §18.10a; [19-wholesale-page-specification.md](19-wholesale-page-specification.md) |
| G10 | **Promo codes** for buyers | code, type, value, validity | §25 `Promotion`, `PromotionType` |
| G11 | **Partial refunds** | refunded amount, lines | §25 `PaymentStatus PARTIALLY_REFUNDED`; round 14 F3 #24 |
| G12 | **Richer order statuses** (`IN_PRODUCTION`, `PACKING`, `AWAITING_QUOTE`) beyond `statusName` text | status code, timestamps | §25 `OrderStatus`, `OrderEvent` |
| G13 | **Call confirmation** before packing | `confirmedByCallAt`, by whom | §25.8e |
| G14 | **Guest order page** by token, stable URL | `guestToken` or equivalent lookup | §18.16 `/{locale}/order/{guestToken}` |
| G15 | **Delivery details** Nova Poshta warehouse/locker refs, locker fit by packed size; Ukrposhta index | carrier refs, packed dimensions, weight per size | §18; §37.4 section 3 |
| G16 | **International delivery** (closed at launch) | quote flow, currency | [00-client-decisions-13.md](00-client-decisions-13.md) N4, N7 |
| G17 | **Prices in EUR** for non-uk locales (display only) | NBU rate, rounding | §26 `fx.refreshEur` |
| G18 | **Partner goods**: `brand` = Вівчарик, `manufacturer` omitted, `partnerName` never shown | origin flag, hidden partner name | [CLAUDE.md](../CLAUDE.md); §25 `ProductOrigin` |
| G19 | **Structured product data**: templates, typed attributes, composition % totalling 100, colour palette with wool swatch photo and colour family, patterns, materials, fillings, glossary | template id, typed attribute values, composition rows, palette refs | §37.2–37.3; §25.8f |
| G20 | **Draft / live revisions**, price history, scheduled sales with start and end | revision, price change log, sale window | §37.5; §37.4 section 5 |
| G21 | **Stock movements with a source** (order, cancellation, shop sale, manual, import, Prom) | movement rows | §37.6; §25.8f `StockMovement`; round 13 N1 |
| G22 | **Media**: several photos per colour, focal point, alt text per locale, one short product video | media role, colour slot, focal point, alt | §25 `Media`, `ProductMedia`; §37.4 section 4 |
| G23 | **Reviews**: photos with moderation and gallery consent; source SITE or PROM with original date; shop-level reviews; imported ones excluded from `AggregateRating` | review media, status, `source`, `sourceDate`, `productId` nullable | §25 `Review`; [00-client-decisions-13.md](00-client-decisions-13.md) N2 |
| G24 | **Quick order** («Купити в 1 клік») requests | name, phone, product, status | §25.8d `QuickOrderRequest` |
| G25 | **Attribution** (UTM, referrer) stored with the order | `attribution` JSON | §25.8e |
| G26 | **Customer fields**: patronymic, legal-entity flag and company details | `customer.patronymic`, `isLegalEntity`, company, EDRPOU | §18 section 1 |
| G27 | **Content**: blog, pages, gallery, banners, collections, badges (Новинка / Знижка / Хіт) | posts, pages, collections | §22; §25 `Post`, `Banner`, `MediaAlbum`; §37.4 section 6 |
| G28 | **SEO**: per-locale slugs frozen at first publish, 301 history on rename | slug per locale, redirects | §37.5; [29-seo-architecture.md](29-seo-architecture.md) |
| G29 | **`orderDays` vs per-variant made-to-order days** and «Виготовимо під замовлення за N днів» forcing full prepayment | per-variant days, payment rule | §37.4 section 2 |
