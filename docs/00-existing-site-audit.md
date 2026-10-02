# Adjacent Business Reference — fabryka-shkur.com.ua

> **DEMOTED — read this first.** [00-client-decisions.md](00-client-decisions.md) establishes
> that this site belongs to **the client's wife** and is a **separate business** that stays
> online. It is **not** a predecessor to Вівчарик and carries **no authority** over this build.
>
> - The three "CONFLICT" findings below (§0.2 company age, §0.3 scope, §0.4 brand) are
>   **resolved and dissolved** — they compared two different businesses. See D1, D2, D3.
> - The migration plan in **§0.8 is revoked.** There is nothing to migrate. Вівчарик launches
>   on a new domain, cold.
> - What remains useful: the pricing intelligence in §0.6, the category and naming
>   conventions, the Kosiv-region context, and the payment/delivery/wholesale practices of a
>   closely related operation run by the same family. Treat all of it as **market reference**,
>   never as a specification.

Audited 2026-09-28 from the live public site.

## 0.1 What the existing site is

| Property | Value |
|---|---|
| URL | `https://fabryka-shkur.com.ua/` |
| Platform | WordPress + WooCommerce (All in One SEO plugin), **not** Prom.ua as originally described |
| Brand shown | **BOTEY** / «Фабрика шкур» |
| Locale | Ukrainian only |
| Sitemap | Segmented index: `product`, `product_cat`, `product_tag`, `post`, `page`, `post_tag`, `category` |

The platform matters: WordPress means the existing content, media library, product data, and
URL structure are all extractable via the WooCommerce REST API or a database export. This makes
migration a genuine option rather than a re-entry exercise. See §0.8.

---

## 0.2 CONFLICT 1 — Company age

**The brief states 30 years of experience. The existing site states 2013.**

Verbatim from the site:

> «⌛2013 рік – реєструємо першу компанію по вичинці овечої шкіри»
> «Спочатку було створено оптово-роздрібну точку на ринку в 2013 році. То був перший крок.»

Own sewing factory established 2016.

That is **~13 years of operation as of 2026, not 30.**

**Impact.** The "30 years" claim appears in the brief's hero requirement, the trust badges, the
About timeline, and the Organization structured data. It is currently unsupported and, if
published, is a false advertising claim under Ukrainian law and under EU consumer-protection
rules for the `de` and `pl` locales — the locales with the most aggressive enforcement.

**Possible resolutions, for the client to choose:**

1. The family practised furriery/wool craft for 30 years before formalising the company in
   2013. If true and documentable, the honest framing is *«Ремесло — від 1990-х. Фабрика — від
   2013.»* This is a stronger story than a round number, because it is specific.
2. "30 years" refers to a different entity, a predecessor business, or a founder's personal
   career. Needs naming precisely.
3. The number is simply wrong and should be replaced with «від 2013 року» plus the 2016 factory
   milestone.

**Until resolved, no document in this blueprint may render a specific age.** All references use
`{{FOUNDING_YEAR}}` and `{{YEARS_EXPERIENCE}}`. Option 1 is the recommended direction if it can
be substantiated, because it converts a liability into the provenance narrative that
[01-brand-strategy.md](01-brand-strategy.md) is built on.

---

## 0.3 CONFLICT 2 — Category scope: hides and fur, not only wool

The brief describes a **wool** processing factory. The existing business is primarily a
**sheepskin, hide and fur** business, with wool goods as one segment among many.

Actual category tree, 14 top-level categories:

| # | Category | Slug | Material class |
|---|---|---|---|
| 1 | Натуральні овечі шкури | `naturalnye-ovechi-shkury` | Hide/fur |
| 2 | Килими з овчини | `kovry-iz-ovchiny` | Hide/fur |
| 3 | Шкури корів | `shkury-korov` | Hide |
| 4 | Жилетки з натуральної шкури | `stylni-zhiletky-iz-ovchiny` | Hide/fur apparel |
| 5 | Автомобільні чохли та накидки | `avtomobilnye-chehly-i-nakidki` | Hide/fur, automotive |
| 6 | Матеріали для пошиття (овчина, цигейка, шкіра) | `ovchyna-tsygejka-shkira-dlya-poshyttya` | Raw material, B2B |
| 7 | Меблеві аксесуари | `mebelnye-aksessuary-iz-ovchiny` | Hide/fur, interior |
| 8 | Для дітей та немовлят | `detskie-konverty-iz-mutona` | Mixed |
| 9 | **Ліжники вовняні** | `lizhnyki-sherstyanye-karpatskie-odeyala` | **Wool** |
| 10 | **Ковдри та подушки з овечої шерсті** | `odeyala-i-podushki-iz-ovechej-shersti` | **Wool** |
| 11 | **Шкарпетки ручної роботи** | `nosky-yz-ovechej-shersty` | **Wool** |
| 12 | **Домашнє взуття** | `domashnyaya-obuv-yz-shersty-y-ovchyny` | Wool + hide |
| 13 | **Гуцульські килими** | `gutsulskie-kovry-iz-naturalnoj-shersti-ruchnoj-raboty` | **Wool** |
| 14 | **Дерев'яний посуд** | `derevyannaya-posuda` | Wood |

Note category 14: the brief called wooden handmade products a *future* line. **They already
exist and are already being sold.** [00-assumptions.md](00-assumptions.md) B1 is wrong on this
point and the wooden range should be treated as a live category, not a roadmap item.

Note also that several brief-listed products — gunias, wool clothing, wool belts, wool yarn,
rovnytsia, wool capes — are **absent** from the live catalogue. Either they are new lines the
new site is meant to launch, or they are sold offline only. This must be confirmed: launching a
category with no SKUs behind it is worse than not launching it.

**Impact.** This is the largest structural finding in the audit. The information architecture
cannot be a wool-products tree with a fur section bolted on. Three viable architectures:

| Option | Shape | Consequence |
|---|---|---|
| **A. Single brand, two material worlds** | Top-level split: Вовна / Шкура та хутро, with wood as a third | Honest to the real business. Requires the brand story to cover both crafts. Recommended. |
| **B. Wool-first, fur secondary** | Wool foreground, fur as a supporting range | Matches the brief, misrepresents the revenue mix, and buries the categories that likely sell most |
| **C. Two brands** | Вівчарик for wool, BOTEY for hides, separate sites | Doubles cost and splits SEO authority. Only justified if the client genuinely wants to separate the audiences |

Option A is recommended, and [01-brand-strategy.md](01-brand-strategy.md) §1.6 survives it
intact — hide and fur are as legitimately Carpathian and as craft-heavy as wool. The visual
strategy of showing production applies identically. But the **name** question in §0.4 must be
settled first.

Note that fur and hide products carry an ethical objection in the `de` locale that wool does
not. German-market copy must lead with the by-product-of-food-industry framing and traceability,
or the `de` locale should launch wool-only. This is a real commercial constraint, not a
theoretical one.

---

## 0.4 CONFLICT 3 — Brand name

The brief names the brand **Вівчарик**. The live site trades as **BOTEY** on the domain
`fabryka-shkur.com.ua`.

Open questions requiring a client answer:

1. Is Вівчарик a rebrand of BOTEY, a sub-brand, or a separate new venture?
2. Which domain does the new site launch on? `fabryka-shkur.com.ua` carries existing SEO
   equity, existing backlinks, and existing ranking for high-intent queries. A new domain
   discards all of it unless redirects are implemented properly.
3. Does BOTEY continue to exist for the wholesale/hide business?

**Recommendation.** If Вівчарик is a rebrand, launch on the existing domain with the new brand,
preserving every URL via 301 redirects (the `Redirect` model in
[25-database-schema.md](25-database-schema.md) §25.9 exists for exactly this). Losing 13 years
of domain history to a cosmetic domain change is the most expensive mistake available on this
project, and it is entirely avoidable.

---

## 0.5 Confirmed facts — now promoted out of the assumption register

| Was | Now confirmed |
|---|---|
| `{{FACTORY_CITY}}` | с. Вербовець, вул. Миру 39, Косівський район, Івано-Франківська область |
| Region | Kosiv district — the historic centre of Hutsul craft. This is a genuine provenance asset and should be named explicitly, not generalised to "Карпати". |
| Phone | +38 068 500 90 40 (also Viber), +38 098 788 95 06 |
| Email | shkura.ovecha@gmail.com |
| Instagram | `@fabryka_shkur` |
| Working hours | Mon–Fri 09:00–19:00, Sat 10:00–17:00, Sun 10:00–16:00. Closed 24–26 Dec and 1, 6 Jan |
| `{{RETURN_DAYS}}` | 14 days. Buyer pays return shipping unless a defect is confirmed. |
| Production claim | Tanning by «бельгійською технологією». Own sewing factory since 2016. |

The email address is a `gmail.com` account. Moving to `@<domain>` addresses is a concrete,
cheap trust upgrade and should be in Phase 1.

Sunday opening is unusual and valuable — it signals a real place that tourists can actually
visit. Worth surfacing rather than burying in a footer.

---

## 0.6 Commercial facts

### Pricing — confirms the premium positioning is real

Observed in the ліжники category (127 products across 8 pages):

| Product | Price, UAH |
|---|---|
| Килим Пастельний 150×200 | 4,990 |
| Ліжник Мозаїка 150×200 | 5,300–7,300 |
| Ліжник Гармонія 150×200 | 5,400–7,400 |
| Плед Букле ніжне 190×220 | 6,900 |
| Килим Велич Гір 200×220 | 7,200 |
| Карпатський плед Тайстра 190×220 | 8,500 |
| Плед Золото Карпат 200×220 | 9,800 |
| Плед Осіння казка 150×200 | 10,400 |
| Килим Лісова казка 200×220 | 14,900 |
| Карпатський плед Золото Карпат 2×3 м | 14,500 |

**This is a premium price point already.** The brief's premium positioning is not aspirational
— it is descriptive. The existing site's presentation is the thing that is under-serving it,
which is precisely the diagnosis in [01-brand-strategy.md](01-brand-strategy.md) §1.1.

Ranged prices (5,400–7,400) confirm variant-level pricing, validating the
`ProductVariant.priceMinor` plus denormalised `Product.priceMinMinor/priceMaxMinor` design in
[25-database-schema.md](25-database-schema.md) §25.3.

Size is the dominant variant axis and is also used as a **subcategory** (150×200см — 47 items,
200×220см — 54, Доріжки — 16, Подушки ткані — 10). That is a WooCommerce workaround, not good
IA. In the new build, size is a facet, not a category.

### Catalogue size — assumption B6 was badly wrong

One category holds 127 products. Across 14 categories the realistic total is **well over
1,000 SKUs**, not the assumed 150–400.

**Consequence:** [00-assumptions.md](00-assumptions.md) B6 is revised. Postgres full-text search
with a GIN index remains viable at this scale, but the faceted-filter query plan must be
designed and load-tested in Phase 2 rather than assumed. Catalogue *entry* workload also changes
the admin panel's priority order: bulk editing, CSV import, and duplicate-product cloning move
from nice-to-have to Phase 1.

### Payment — the single largest conversion problem on the existing site

Current methods, verbatim:

1. Manual transfer to a **personal PrivatBank card number** (4149 4999 9448 0349), with
   «обов'язково потрібна консультація менеджера»
2. Bank transfer to an IBAN, order number and surname required in the payment reference
3. 10% prepayment, balance on delivery
4. Cash on delivery via Nova Poshta

**There is no online payment gateway.** Every card payment requires a human, a manual transfer,
and a manual reconciliation. This is the highest-value single fix in the entire project: a
buyer ready to spend 9,800 UAH is being asked to manually type a card number into a banking app
and then wait for a manager. Drop-off at that step will be severe.

Publishing a personal card number is also a fraud-impersonation risk — it is trivially copied
into a fake listing.

[00-assumptions.md](00-assumptions.md) C2 is upgraded from BLOCKER-pending to **the single
highest-ROI item in the roadmap**. LiqPay is the pragmatic choice given the existing PrivatBank
relationship.

### Delivery — confirmed

| Method | Price |
|---|---|
| Nova Poshta branch | from 80 UAH |
| Nova Poshta courier | from 100 UAH |
| Ukrposhta branch | from 55 UAH |
| Pickup, Kosiv | free |

Free delivery is stated on the homepage for orders over **30,000 UAH** and for full prepayment.
That threshold is very high relative to a 5,000–15,000 UAH average order. Revisiting it is a
merchandising decision worth modelling — see [00-assumptions.md](00-assumptions.md) C7.

### Wholesale — confirmed, and richer than assumed

Verbatim findings:

- «Чим більша оптова партія товару, тим більше знижки» — volume-tiered, up to 20% mentioned.
- **No stated MOQ.** [00-assumptions.md](00-assumptions.md) D2 stands unresolved.
- **Dropshipping is offered:** «можлива співпраця за схемою дропшипінгу (доставка товару
  безпосередньо вашим клієнтам)». The brief did not mention this. It is a distinct lead type
  and needs its own path on the wholesale page.
- **Custom production is offered:** «виготовлення виробів на замовлення: колір, розмір, довжина
  хутра – за бажанням клієнта». This validates `LeadKind.PRIVATE_LABEL` and should be a named
  offer, not buried.

`LeadKind` in [25-database-schema.md](25-database-schema.md) §25.8 must gain a `DROPSHIP`
member.

---

## 0.7 What the existing site does well — keep these

An audit that only lists faults produces a redesign that loses working assets.

1. **Genuine product photography volume.** There is a real catalogue with real photographs
   behind it. This materially de-risks [00-assumptions.md](00-assumptions.md) E1, though the
   photography still needs to be re-shot or re-graded to the standard
   [01-brand-strategy.md](01-brand-strategy.md) §1.8 requires.
2. **A photo gallery section already exists** (`/fotogalereya/`) — the client already
   understands that showing the place matters.
3. **A blog already exists** (`/blog/`) — there may be existing articles with ranking history
   worth migrating rather than rewriting.
4. **Reviews page exists** (`/otzyvy/`) — existing testimonials can seed the new review system
   instead of launching empty.
5. **A care guide exists** (`/uhod/`) — high-quality, high-intent content that supports both SEO
   and post-purchase confidence. Migrate and expand.
6. **Sunday opening and a visitable physical location** — rare, and a strong local-SEO and
   tourist asset.
7. **Descriptive, named products** (Ліжник «Мозаїка», Плед «Золото Карпат») rather than
   generic SKU names. This is already brand-consistent and should be preserved.

---

## 0.8 Migration plan implications

| Item | Action |
|---|---|
| Product data | Export via WooCommerce REST API (`/wp-json/wc/v3/products`) or database dump. Map to the [25-database-schema.md](25-database-schema.md) model. Expect manual work on variants, since WooCommerce attribute data is typically inconsistent. |
| Media | Bulk-migrate the WordPress uploads directory to Cloudinary, preserving filenames for traceability. Alt text will be largely missing and must be authored — budget for it, per locale. |
| URLs | **Every existing `/product-category/…` and product URL must 301 to its new equivalent.** Build the mapping table before launch, not after. Populate the `Redirect` table from a diffed export. |
| Blog posts | Migrate with original `publishedAt` dates preserved. Changing publication dates on migration destroys accumulated ranking signals. |
| Reviews | Migrate as `APPROVED`, `isVerifiedPurchase=false`, since purchase linkage cannot be reconstructed. Do not backfill a fake verified badge. |
| Rankings | Capture a full pre-launch baseline: Search Console export, top landing pages, top queries. Without a baseline there is no way to detect a post-launch regression. |

[00-assumptions.md](00-assumptions.md) E4 ("no data to migrate") is **wrong** and is revoked.
Migration is now a named workstream in [35-implementation-roadmap.md](35-implementation-roadmap.md).

---

## 0.9 Revised open questions for the client

Superseding [00-assumptions.md](00-assumptions.md) §F:

1. Where does "30 years" come from? What exactly can be documented? (§0.2)
2. Is Вівчарик a rebrand of BOTEY, or a separate brand? Which domain launches? (§0.4)
3. Is the new site wool-only, or the full hide/fur/wool/wood business? (§0.3)
4. Do gunias, wool clothing, belts, yarn, rovnytsia and capes actually exist as sellable stock,
   or are they new lines?
5. Which PSP, and is the business ready to be VAT/tax-visible on online card volume? (§0.6)
6. Is the 30,000 UAH free-shipping threshold deliberate?
7. What is the actual MOQ for wholesale, and should dropshipping be promoted publicly?
8. Is the `de` locale willing to sell fur, given the market's ethical sensitivity? (§0.3)
9. Can Search Console access be granted now, so a pre-launch baseline can be captured?
