# Client Decisions — Round 13 (gap review)

Received 2026-09-30, after a review of what the shop still lacked. **Highest-authority document**
for the points below.

---

## N1 — One firm; the Prom shop is expected to close

> «Це і є одна фірма, Іван керує фірмою, дружина як другорядна особа має свій власний магазин на
> Промі… вони кажуть, що будуть відключати магазин, тому Іван просив перетягнути всі відгуки з
> Прому (3–5 балів) на сайт.»

This **corrects** the premise of round 1 (D2) that the audited business is a separate operation:
it is the same firm, with a Prom storefront run by Іван's wife. Consequences:

| Topic | Decision |
|---|---|
| Brand and domain | Unchanged: Вівчарик on `vivcharyk.shop`. BOTEY still does not appear (round 7) |
| **Shared stock while Prom is live** | The same physical goods may be listed in both places. Until Prom closes, anything also listed there is marked in the admin «Також на Prom» and its stock is corrected by hand after a Prom sale (a «Продано на Prom» button, like the shop-sale button of round 12). No automatic sync is built for a channel that is closing |
| **Old domain** | If `fabryka-shkur.com.ua` also closes, its product and category URLs should **301-redirect** to the matching `vivcharyk.shop` pages. That transfers its search history to the new site — the opposite of the cold-start assumption of round 1. ~~**Open:** does `fabryka-shkur.com.ua` close with the Prom shop?~~ **Answered in round 14 F8:** it stays online without sales; no redirects for now |
| Duplicate content (§29.18) | The rewrite rule stays until the old pages are gone or redirected |

## N2 — Reviews imported from Prom, and a Reviews page

**Import (3–5 stars).** Prom reviews rated 3, 4 and 5 are brought onto the site, each marked
«Prom.ua · перенесено» with its original date, rating and text. Rules:

- **Honest labelling.** A visible note on the Reviews page: «Відгуки з позначкою «Prom.ua ·
  перенесено» — з нашого магазину на Prom.ua, перенесені з оцінками від 3 до 5 зірок.» Showing a
  filtered set without saying so would be a misleading practice under the EU rules that apply to
  the `pl` and `de` sites (Omnibus Directive); saying so keeps it lawful and credible.
- **Privacy.** Author shown as first name and initial only; no Prom profile links.
- **Structured data.** Imported reviews are displayed but **not** counted in the site's
  `AggregateRating` — Google does not accept reviews collected on another site as the site's own.
  The rating in structured data comes from on-site reviews only.
- **Matching.** A review is attached to the matching product where one exists; otherwise it is a
  **shop review** («Відгук про магазин»).
- **How.** Exported from Prom (or collected by hand) into a CSV template, imported through the
  admin with the usual preview and confirm (round 12, G8).

**Reviews page** (already decided in round 10 as a page; now specified and drawn):

- **«Відгуки» added to the header navigation** between «Про нас» and «Контакти», and to the phone
  menu. The page lives at `/{locale}/vidhuky` (translated slugs per locale).
- Content: summary (site rating, distribution 5→1, count) · «Ми в Google» card with the Google
  rating and «Оцінити в Google» / «Читати в Google» · video reviews · filters (Усі, З фото, На
  сайті, З Prom.ua; by product; sort) · review cards (stars, name and date, source label, text,
  photos, product link or «Відгук про магазин», «Відповідь Вівчарика») · «Показати ще» · the
  honesty note · the customer-home gallery.
- **Every screen size**, drawn on the canvas: desktop and laptop (3-column masonry), tablet
  768 px (2 columns, summary stacked), phone 390 px (1 column, filter chips scroll sideways,
  bottom bar). Laptops 1024–1279 px use the desktop layout with 2 columns; very wide screens cap
  the content at 1440 px.

## N3 — Google review request after delivery

The review-request e-mail (round 10) gets a second button, **«Оцінити в Google»**, linking to the
Google Business Profile review form. Google reviews grow the profile that is the main launch
channel. One e-mail, two buttons; no incentive is offered for either (incentivised reviews breach
Google's policy and EU rules).

## N4 — EU law for Poland and Germany

Selected for the blueprint. What selling to consumers in the EU from Ukraine requires, to be
confirmed by a lawyer before `pl`/`de` checkout opens:

| Requirement | What it means here |
|---|---|
| **GPSR (EU 2023/988)** — an economic operator established in the EU for consumer products sold to EU consumers | Contract an **EU Responsible Person** service (a company in the EU that holds product safety information and is the contact for authorities); its name and address appear on the product page and packaging for EU orders. Until contracted, `pl`/`de` show products but checkout ships to Ukraine only |
| Product information on the page | Manufacturer (ФОП Гондурак Л. Ю., address), EU responsible person, product identifier (SKU), warnings and care where relevant — rendered from the product template for EU locales |
| **Textile labelling (EU 1007/2011)** | Fibre composition in the buyer's language on the page and on the item's label; the composition from round 12 already feeds the page — the physical label needs Polish/German for EU orders |
| Consumer rights (withdrawal, model form, pre-contract info) | Already specified (§32.15, round 10 part 6) |
| Customs and taxes | The buyer pays duties (F4, DAP). Parcels ≤ €150 may use **IOSS** to collect EU VAT at checkout and spare the buyer a customs charge — optional, decide after the first EU orders |
| Export paperwork | Nova Poshta / Ukrposhta international forms with the composition and HS code per product (a template field) |

## N5 — Video instructions for Іван and staff

Short screen recordings (2–3 min each) delivered at handover: add a product from a template;
colours and sizes libraries; confirm an order by phone; print waybills; «Продано в магазині»;
answer mail; moderate reviews; what to do if a phone with 2FA is lost. Stored in the admin under
«Довідка». Added to [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.14.

## N6 — Custom-size capacity: 5 at a time

Resolves R19 and the open item carried since round 5. The workshop builds **5 made-to-order
items at once**.

- A `Setting` `customSize.concurrentLimit = 5`, editable by Іван.
- While fewer than 5 are in production, the promise stays «виготовлення 14 днів».
- When 5 are in production, the site **does not refuse the order**: it shows the honest date —
  «Виготовлення до [дата]» — computed from when the next slot frees (≈ +14 days per full round),
  shown before purchase and in the confirmation.
- Іван can pause «Свій розмір» site-wide from the admin (e.g. before holidays).

## Not selected this round

Google Merchant Center, Hotline/Price.ua, marketplaces, order editing by the manager, returns
records, the accountant report and the maintenance page were offered and not selected. **One
reminder:** the legal page texts (offer contract, privacy, cookies, returns, Impressum) were also
not selected as a task, but they are required by law before launch — they stay on the launch
checklist (§35.11, L1).

---

## N7 — No paid add-on services for now

> «Добре, тоді без платних додаткових сервісів поки що.»

The unavoidable costs of running a shop stay: **VPS hosting, the domain, the WayForPay
commission per payment**, and whatever the law requires (the fiscal receipt, see below).
Everything else uses a free tier or a free alternative, and paid options are parked until the
client asks for them.

| Item in the blueprint | Was | Now |
|---|---|---|
| EU Responsible Person (N4) | Paid service | **Not contracted.** `pl`, `en`, `de` stay live for content, SEO and euro prices, but checkout ships **within Ukraine only**; a clear line says so. EU delivery opens when the client chooses to contract it |
| IOSS | Optional intermediary | Parked |
| Styled Google Map | Maps JavaScript API (billing account required) | **A static image of the styled map + «Відкрити в Google Maps» link** — the same look, no Google API, no billing, no cookies until the link is followed |
| Database | Managed Postgres with point-in-time recovery | **Postgres on the VPS** with WAL archiving (pgBackRest) to a free-tier object store; same recovery goal, more setup work |
| Immutable backups (38 #68, #70) | Separate paid provider | **Free tier** of an object store that supports object lock (Backblaze B2 or Cloudflare R2 — whichever keeps the data within its free allowance); monitored for size |
| Cloudflare | Paid plan features | **Free plan**: proxy, DDoS protection, free managed WAF ruleset, Bot Fight Mode, Turnstile, Access (free up to 50 users), Authenticated Origin Pulls, DNSSEC, Email Routing, Workers and R2 free allowances. Extra rate limiting is done in the application, which the blueprint already has |
| External penetration test (38 #99) | Paid | Deferred; replaced for now by the self-run OWASP ZAP scans and the ASVS checklist |
| Error and uptime monitoring | — | Free tiers (e.g. Sentry free plan, UptimeRobot free) |
| E-mail sending | Resend / Postmark | Resend free tier (as planned) |
| Cloudinary | Free plan assumed | Free plan; usage alerts (38 #133) warn before its monthly credits run out. Product video is the largest consumer — kept short and one clip per product family |
| Fiscal receipts (ПРРО) — *decided in round 14: WayForPay's free built-in ПРРО* | Checkbox (paid) | **Check first with the accountant** whether the free state ПРРО of the tax service (ДПС) can be used; if it has no suitable API, receipts are issued in the free state app by staff until an integration is chosen. This is a legal requirement, not an add-on |
| AI translation and description drafts (Claude API) | Pay-per-use, typically small | **Decision needed** — the only running cost that is not strictly required. Without it, the `pl`/`en`/`de` texts must be translated by hand |

Physical items that are one-off purchases (hardware security keys for the owners' accounts) are
recommended, not required: the authenticator app on the phone remains the second factor.
