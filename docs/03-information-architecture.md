# 03 — Information Architecture

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Catalogue: 4 per row (3 at 1024–1279), 2 compact on phones; «Показати ще» over real `?page=N` URLs; 12 per load; left filter panel, bottom «Фільтри» sheet on phones, applied by «Показати N товарів»; swatches with names; price slider + fields; counts; chips + «Скинути все» (part 3).
> - Category text at the bottom; no category banner; **subcategories only as a filter** (still indexable URLs linked from the mega menu). Price shown as a range. Out-of-stock greyed at the end. Search: typo correction, transliteration, cross-locale synonyms.
> - Collections render like categories (part 7).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **The customer-facing category menu is the seven items of §P3.1**: Ліжники та пледи · Пряжа та рукоділля · Овчина · Вовняний одяг · Шкарпетки та капці · Шкіра · Від партнерів. **Пледи** added. Beside the menu: Добірки (На подарунок, Весільні, Для дітей) and Опт.
> - Facets: size, colour, material, price, in stock, own / partner. Default sort: popular. No compare, no recently viewed, no back-in-stock.
> - Sheepskins are one-of-one products, each with its own photo.
> - Care instructions live on **one shared page**, linked from each PDP by material.


Authority: [00-client-decisions-6.md](00-client-decisions-6.md) is the highest-authority document,
then [00-client-decisions-5.md](00-client-decisions-5.md), then
[00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md), which governs the remainder of scope and the
category tree; [25-database-schema.md](25-database-schema.md) governs data shapes.
[00-existing-site-audit.md](00-existing-site-audit.md) is reference intelligence about an adjacent
business and carries no authority here.

**Round-2 rulings that change this document:** partner manufacturers cannot be named (§E7), dye
lots are not tracked (§E8), the workshop is in **Яворів**, not Вербовець (§E2), guest checkout is
permanent with no customer accounts ever (§E12), and `en`/`pl`/`de` are transactional locales
(§E11). Each is applied in place below.

**Round-3 rulings that change this document** ([00-client-decisions-3.md](00-client-decisions-3.md)):

| Ruling | Where it lands |
|---|---|
| The Яворів site is a **shop as well as a factory** (§F2) | §3.7.3 — the contact route gains a real content job and real internal-link weight, and §3.9 records it as a two-click destination with a justification for why it does **not** take a primary nav slot |
| Partner goods are sold **under the Вівчарик brand**; `brand` is Вівчарик for both origins, `manufacturer` omitted for partner goods (§F3) | §3.3.4 — closes the open question the previous revision carried, and raises rather than lowers the weight of the on-page origin label |
| International shipping is **quoted per order**, buyer pays shipping and all duties (§F4) | §3.5.2 — the route-segment dictionary gains an order-payment segment, because a quoted order is paid days after the cart is gone |
| The tagline stays **«в Карпатах»**; Яворів stays in supporting surfaces (§F6) | §3.5.4 rule 11 — the Yavoriv-first framing of the previous revision is rebalanced; the governing pattern is «Карпати» to be understood, «Яворів» to be believed |
| `{{LEGAL_ID}}` exists and is pending delivery (§F1) | Nothing here waits on it; it blocks three legal deliverables owned by [04-sitemap.md](04-sitemap.md) §4.5 |

**Round-4 and Round-5 rulings that change this document**
([00-client-decisions-4.md](00-client-decisions-4.md),
[00-client-decisions-5.md](00-client-decisions-5.md)):

| Ruling | Where it lands |
|---|---|
| **H3b — made-to-order is a property of the *size*, not the product**; `Product.allowsCustomSize` is a per-product admin toggle | §3.3.3 — the "size is a facet, not a category" rule survives but acquires a case it did not previously cover: a size that has no variant row. §3.6.1 — the `madeToOrderDays` facet was **modelling the wrong thing** and is replaced |
| **H3c — a custom size is priced by area**, from an owner-set rate, within physical loom bounds | §3.1 — six new `Product` fields enter the content model. §3.6.1 — the facet becomes a capability rather than a lead-time claim |
| **H1.1 / H1.2 — payment methods are derived from cart contents, server-side**; COD with inspection is Ukraine-only | §3.5.2 — no new segment, and the reasoning for why is stated, because "add a payment-method route" is the obvious wrong answer |
| **G2 — 14 days is production before dispatch**; `OrderStatus.IN_PRODUCTION` | §3.1 — the order-status vocabulary is content the customer reads, so it belongs in the inventory |
| **G4 — a business card already ships in every parcel**, carrying a short URL and a QR to a review page | §3.5.2, §3.5.4 rule 10, §3.9 — the site acquires its first **offline** entry point, and a reserved one-character route |
| **G3 — workshop tours, with Іван, arranged by phone** | §3.7.3 — the contact route's content priority rises a second time, and for a better reason than the first |
| **G1 — Іван is the primary phone, Любов the ФОП of record** | §3.7.3 — the contact page's content contract, and the NAP/legal split it must not flatten |

**Round-6 rulings that change this document**
([00-client-decisions-6.md](00-client-decisions-6.md)):

| Ruling | Where it lands |
|---|---|
| **J1 — a mixed cart ships together as one order; the split is withdrawn** | §3.5.2 — **nothing is added, and the removal is recorded so it is not re-added.** No split-order route, no order-pair segment, no `splitGroupId` in the content model. One purchase is one order and one tracking lookup, so `{order-seg}` keeps the shape it already has. The cart-level disclosure that replaces the split is **copy on an existing surface**, not a new content type |
| **J2 — the return-shipping deposit confirmed** | Nothing here. The deposit is a checkout mechanic with no route, no facet and no content type; it is recorded only so this document is not read as silent on it |

## 3.1 Content model inventory

Every content type the site renders, mapped to the entity that stores it. If a content type has no
entity it is not buildable; if an entity has no surface it is not needed.

| Content type | Entity ([25-database-schema.md](25-database-schema.md)) | Translated | Primary surface | Notes |
|---|---|---|---|---|
| Material world (tier 1) | `Category`, `parentId = null` | `CategoryTranslation` | `/{locale}/{material}` | Вовна, Овчина, Шкіра. Дерево exists with `isActive = false` |
| Product family (tier 2) | `Category` with a tier-1 parent | `CategoryTranslation` | `/{locale}/{material}/{family}` | 12 wool families, all confirmed stock ([00-client-decisions.md](00-client-decisions.md) D4) |
| Product | `Product` | `ProductTranslation` | PDP | Named products (`Ліжник «Мозаїка»`), never SKU-named |
| **Origin** | **`Product.origin` (`ProductOrigin`), `partnerRegion`** | region is a proper noun, not translated | Badge on card + PDP; facet pinned top; a dedicated destination | Added by [00-client-decisions.md](00-client-decisions.md) D3, narrowed by [00-client-decisions-2.md](00-client-decisions-2.md) §E7: **`partnerName` stays null and is never rendered**. §3.3.4 |
| Variant | `ProductVariant` + `VariantOptionValue` | `OptionValueTranslation` | PDP buy box | Colour, size, composition, weight — all four required for every category (D4) |
| **Custom-size capability** | **`Product.allowsCustomSize`, `customSizeRatePerSqmMinor`, `customSizeMinPriceMinor`, `customSizeMin/MaxWidthCm`, `customSizeMin/MaxLengthCm`, `madeToOrderDays`** | not translated — all numeric | PDP size selector («Свій розмір»), buy box, one facet | Added by [00-client-decisions-5.md](00-client-decisions-5.md) §H3b/§H3c. **A configuration that has no `ProductVariant` row**, which is the one thing that makes it structurally interesting. §3.3.3 |
| **Custom-size specification, as purchased** | **`OrderItem.customSpec Json?`** | — | Order confirmation, order status, admin | `{ widthCm, lengthCm }`, snapshotted like every other order line field. The spec must survive for years — a warranty question five years out is answered from this row, not from a product that has since been re-priced |
| **Order status vocabulary** | `OrderStatus`, now including **`IN_PRODUCTION`** | i18n bundle | Order status page, confirmation and dispatch email | Added by [00-client-decisions-4.md](00-client-decisions-4.md) §G2. It is customer-read content, not an internal flag, which is why it is inventoried here: a status is a *string a buyer interprets*, and «Виготовляється» is the difference between anticipation and a support ticket |
| Specification | `ProductAttributeValue` + `AttributeDefinition` | `AttributeDefinitionTranslation` | PDP spec table, facets | Composition, micron, care, delivery time |
| Provenance | `Product.woolOrigin`, `woolMicron`, `productionStage[]` | keys → translated labels | PDP origin block | **Own-manufacture products only.** Partner products get a shorter honest spec block with no in-house claims (D3.6) |
| Product media | `Media` + `ProductMedia` + `MediaRole` | `MediaTranslation` (alt, caption) | Gallery, listing, hero | `PRODUCTION` and `SCALE_REFERENCE` carry the strategy |
| Gallery album | `MediaAlbum` | `MediaAlbumTranslation` | `/{locale}/{gallery}/{key}` | Album keys `<world>-<stage>-<period>` |
| Editorial article | `Post` | `PostTranslation` (`bodyJson` + `bodyPlain`) | `/{locale}/{journal}/{slug}` | On a cold-start domain this is the organic strategy, not a content extra |
| Care guide | `Post` with a reserved tag | `PostTranslation` | Journal + PDP care block | §3.7.2 |
| Review | `Review` | not translated (user content) | PDP + `/{locale}/{reviews}` + **the `/v` short route** | Launches empty. No seeded or imported testimonials — there is no migration source ([00-client-decisions.md](00-client-decisions.md) D2). Reviews arriving via `/v` carry `isVerifiedPurchase = false` and are excluded from `AggregateRating` ([00-client-decisions-4.md](00-client-decisions-4.md) §G4). §3.5.2 |
| Trade lead | `Lead` (`LeadKind` incl. `DROPSHIP`) | — | Wholesale page | Four paths, §3.3.6 |
| Static page | Bespoke route, copy in the i18n bundle | i18n bundle | About, production, legal | Not `Post`: bespoke layouts, not article bodies |
| Promotion / banner | `Promotion`, `Banner` | `BannerTranslation` | Announcement bar, category top | No countdown timers ([01-brand-strategy.md](01-brand-strategy.md) §1.9) |
| Curated collection | `Category` with `isFeatured = true`, outside the material tree | `CategoryTranslation` | `/{locale}/{collections}/{slug}` | Home of the secondary schemes, §3.3.5 |
| Redirect | `Redirect` | — | Middleware | **Internal slug changes only.** No legacy migration exists ([00-client-decisions.md](00-client-decisions.md) D2) |
| Search log | `SearchQueryLog` | — | Admin | Feeds R7 ([02-ux-research.md](02-ux-research.md) §2.8) |

**One gap and one closed question, stated honestly rather than papered over:**

1. **No `Post`↔`Product` join table exists** in [25-database-schema.md](25-database-schema.md),
   which is canonical and not amended here. Article-to-product linking is implemented as
   **structured embed nodes inside `PostTranslation.bodyJson`** holding product IDs, resolved
   server-side. This keeps the link locale-aware and lets an editor place it where the argument is
   made. Its cost is that "which articles mention this product" needs a JSON query — acceptable at
   editorial volume, not at catalogue volume, which is why it is not used in reverse.
2. **Dye lots are not tracked, and the IA carries no dye-lot surface.**
   [00-client-decisions-2.md](00-client-decisions-2.md) §E8 closes the question the previous
   revision left open: the business does not record lots. `ProductVariant.dyeLot` stays nullable
   and unused; there is **no facet, no product-level attribute, no PDP selector and no admin
   field**. The by-weight families instead carry one honest sentence at the buy box — «Відтінок
   може незначно відрізнятися між партіями. Для великого проєкту радимо замовити всю кількість
   одразу.» — specified as flow content in [05-user-flows.md](05-user-flows.md) §5.7. Shipping a
   facet the business cannot populate would have implied a guarantee it cannot honour, which is
   the more expensive of the two errors.

**Content provenance constrains the content model.** Products and photographs may be migrated
from the adjacent business, but that site stays live
([00-client-decisions-2.md](00-client-decisions-2.md) §E5), so `ProductTranslation.name`,
`ProductTranslation.description` and `CategoryTranslation` body copy must all be **rewritten, not
copied**. This is an IA concern and not merely an editorial one, because product names are the
source of product slugs (§3.5.4 rule 6) and a duplicated name produces a duplicated slug pattern
across two competing domains. `Review` rows are never migrated at all.

---

## 3.2 The structural problem the taxonomy has to solve

[00-client-decisions.md](00-client-decisions.md) D3 confirms a **wool-led business with the full
assortment behind it**, and introduces one genuinely new problem.

```
ВЛАСНЕ ВИРОБНИЦТВО                          ПАРТНЕРСЬКІ ВИРОБИ
├── ВОВНА  (leads brand + homepage)          products from other
│   12 families, all confirmed stock         manufacturers
├── ОВЧИНА                                   
└── ШКІРА                                    ДЕРЕВО — architecture only,
                                             not launched
```

Four properties make this non-trivial:

1. **Origin cuts across every material.** A partner product can be a wool product. Origin is
   therefore a *dimension*, not a branch — but the client has also asked for partner goods to be a
   visible separate destination. §3.3.4 reconciles the two.
2. **Wool leads but does not monopolise.** The homepage, the hero, and the production storytelling
   are wool and own-manufacture only (D3.5). The catalogue is wider than the brand surface, and the
   IA has to hold that asymmetry without it reading as concealment.
3. **Three wool families are sold by weight** — пряжа, ровниця, вовна для рукоділля — and they look
   nearly identical in a thumbnail. They need separate families, separate buy boxes, and explicit
   cross-disambiguation, not one merged «Для рукоділля» node.
4. **Sheepskin and leather must be switchable off per locale**, and wool must not. Two independent
   reasons now converge: the `de`-locale ethical objection (`{{DE_FUR_POLICY}}`), and the EU
   species-declaration paperwork that hide goods face and wool does not
   ([00-client-decisions-2.md](00-client-decisions-2.md) §E11). The recommendation on record is to
   **launch `de` and `pl` wool-only** and enable the hide worlds for EU destinations only once the
   paperwork is confirmed. Any architecture that cannot switch off a whole material world per
   locale turns that into a per-product audit instead of a three-row subtree toggle — which is the
   single strongest argument for the material-first tree in §3.3.1.

**One anti-pattern explicitly ruled out.** The adjacent business uses **size as a subcategory**
(`150х200см`, `200х220см`). That is a platform workaround, not IA, and it is not repeated here.
§3.3.3 gives the reasoning.

---

## 3.3 Category taxonomy

### 3.3.1 The chosen scheme, and the four it beats

Five organising schemes compete. Only one can be the URL-bearing tree; the rest must survive as
secondary navigation or they will be rebuilt badly later.

| Scheme | Example | Verdict | Reason |
|---|---|---|---|
| **Material world, then product family** | Вовна → Ліжники | **PRIMARY** | See below |
| Origin (own vs partner) | Власне виробництво → … | **Cross-cutting dimension + one destination** | A buyer's need is "a blanket", not "an own-manufactured thing". Origin decides *trust*, not *what to buy*. §3.3.4 |
| Product type only | Килими (any material) | Secondary | Merges incompatible facet sets; cannot express the `de` material switch |
| Room / use | Для спальні, Для авто | Secondary | Matches how many buyers think, but one product legitimately belongs to four rooms, so it cannot be a tree without duplication |
| Recipient / occasion | Подарунки | Secondary | Seasonal and promotional by nature; a permanent URL tree built on it goes stale |

**Why material-first wins, in order of force:**

1. **It is the only scheme that survives the `de` material question.** With sheepskin and leather as
   subtrees, a locale policy is one field on three `Category` rows. Distributed through a type-first
   tree it becomes a per-product audit. A structure that converts a per-row problem into a
   per-record problem is the wrong structure.
2. **It is the only scheme whose facet sets are internally coherent.** Facets are declared per
   tier-1 world, so a wool panel never offers "pile length" and a sheepskin panel never offers
   "micron". Under a type-first tree a rug category would have to offer both.
3. **It matches the client's own stated architecture.**
   [00-client-decisions.md](00-client-decisions.md) D3 describes the business as wool, sheepskin and
   leather. Site structure and operational structure agreeing is what stops the tree drifting within
   a year.
4. **It gives wool a protected lead position.** Wool is one node that can own the homepage, the
   production story and the brand narrative without the other materials competing for the same
   surface — which is precisely what D3 requires.
5. **Each world is a natural editorial hub.** Wool craft, tanning and leatherwork are three
   provenance stories, and on a cold-start domain the editorial hub is the organic entry point
   ([02-ux-research.md](02-ux-research.md) §2.1).

**The honest cost.** Many buyers think "something for the bed", not "wool or sheepskin". The material
tier adds a decision before the buyer reaches a family. It is paid down by §3.3.5 (use-based
collections promoted in the mega-menu, on the homepage and in search) and by the mega-menu exposing
families directly, so the material tier is never a mandatory click. Falsified or confirmed by R11
([02-ux-research.md](02-ux-research.md) §2.8).

### 3.3.2 The tree

```
/
├── ВОВНА  /vovna                                    ← leads brand, homepage, production story
│   │  ── Текстиль для дому ──
│   ├── Ліжники                  /lizhnyky
│   ├── Ковдри вовняні           /kovdry
│   ├── Подушки                  /podushky
│   ├── Накидки                  /nakydky
│   │  ── Одяг та взуття ──
│   ├── Гуні                     /huni
│   ├── Камізельки               /kamizelky
│   ├── Пояси                    /poiasy
│   ├── Шкарпетки                /shkarpetky
│   ├── Капці                    /kaptsi
│   │  ── Для рукоділля ──                           ← all three sold by weight
│   ├── Вовняна пряжа            /priazha
│   ├── Ровниця                  /rovnytsia
│   └── Вовна для рукоділля      /vovna-dlia-rukodillia
│
├── ОВЧИНА  /ovchyna                                 ← single-tier at launch
├── ШКІРА   /shkira                                  ← single-tier at launch
│
├── ПАРТНЕРСЬКІ ВИРОБИ  /partnerski-vyroby           ← origin-filtered destination, §3.3.4
│
└── ДЕРЕВО  /derevo   — Category row exists, isActive = false, absent from nav and sitemap
```

**Three decisions inside the tree:**

- **The `── labels ──` are visual grouping, not taxonomy tiers.** Twelve families is the exact
  mega-menu breadth ceiling ([02-ux-research.md](02-ux-research.md) §2.6), and twelve undifferentiated
  links are scanned linearly and badly by the 60+ segment. Three labelled clusters make the panel
  scannable **without adding a third URL tier**, which would breach the depth budget in §3.9. The
  cluster labels have no route, no slug, and no `Category` row.
- **Овчина and Шкіра launch single-tier**, with the world node rendering the product listing
  directly. Families are introduced when a world's SKU count justifies them. Creating family nodes
  before there are products to fill them produces thin pages and empty clicks — the same error as
  publishing a phantom category.
- **Дерево is architecture only.** The `Category` row exists with `isActive = false` and products
  sit at `ProductStatus.DRAFT` ([00-client-decisions.md](00-client-decisions.md) D3). It is absent
  from navigation, the sitemap, and search. It is modelled now so that launching it later is a
  content operation, not a migration.

**"Handmade Carpathian goods" is not a category.** It is a cross-cutting property already modelled
as `Product.isHandmade`. A taxonomy node would duplicate products across the tree and split their
link equity. It renders as a facet, a badge, and one curated collection.

### 3.3.3 Size is a facet, not a category

Five reasons, in order of force:

1. **The data already says so.** Size is an `OptionType` resolved through `VariantOptionValue`
   ([25-database-schema.md](25-database-schema.md) §25.3), and D4 makes multiple sizes a hard
   requirement for *every* category. A size category duplicates state that already exists, and
   duplicated state diverges.
2. **A multi-size product would belong to several size categories**, which breaks the
   single-primary-category rule that breadcrumbs and `BreadcrumbList` structured data depend on
   (§3.7.1).
3. **Cross-size comparison becomes impossible.** Under a facet, all sizes of a family are one result
   set and switching size is one click that preserves every other filter.
4. **It splits a family's authority across thin sibling pages** that compete with each other and
   with the parent for the same query — a real cost on a domain that starts with none.
5. **It does not scale past one axis.** Colour, composition and weight would each demand the same
   treatment, and the tree would become a cross-product of variant axes.

Size still carries real search demand («ліжник 150х200»). That is captured without polluting the
tree by making size one of the indexable facets (§3.6), rendered as a path URL with curated intro
copy: `/uk/vovna/lizhnyky/rozmir-150x200`.

#### The case the five reasons did not cover: a size with no variant row

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b changes what "size" means on this site,
and it does so in a way that strengthens the rule above rather than weakening it:

> Ліжник 150×200 — a standard size, woven, on the shelf, available with cash on delivery.
> The same ліжник at 180×240 — does not exist, takes 14 days, requires prepayment.

**One product, two completely different purchases.** The first is a `ProductVariant` with stock, a
price and a SKU. The second has none of those things — it is a *configuration the buyer composes*,
priced by area at runtime from `customSizeRatePerSqmMinor` (§H3c), and it comes into existence only
when someone pays for it.

That gives the IA a third kind of size, and all three must coexist without a taxonomy node:

| Kind | Modelled as | Has stock | Has a URL | Indexable |
|---|---|---|---|---|
| Stocked standard size | `ProductVariant` + `VariantOptionValue` | Yes | Via the size facet, `/…/rozmir-150x200` | Yes, under §3.6.2 |
| **«Свій розмір»** | A selector option with **no variant row**; dimensions live on `OrderItem.customSpec` at purchase | No — it is capability, not inventory | **No, and never** | No |
| Capability *that a product has* | `Product.allowsCustomSize` | — | Via one facet, §3.6.1 | Conditionally — §3.6.1 |

**«Свій розмір» must never acquire a URL, and this is the decision that matters here.** The
temptation is obvious: `/uk/vovna/lizhnyky/na-zamovlennia` looks like a facet page and would even
attract «ліжник на замовлення» queries. It is refused at the *product* level because the
dimensions are unbounded — `180×240`, `181×240`, `180×241` are all valid orders, and a URL space
that enumerates them is infinite, uncrawlable, and thin at every point in it. The rule-5 ban on
variant state in a slug (§3.5.4) already forbids this; what is new is that here the state is not
merely volatile but **unbounded**, which is worse. The query demand is real and it is captured by
the *capability* facet in §3.6.1, which has exactly one value and therefore exactly one page per
family.

The five reasons above survive intact. A custom size is not a category for reason 2 (a product
would belong to infinitely many), reason 4 (thin pages, at unlimited scale) and reason 5 (width and
length are two axes, so the cross-product argument applies twice over).

### 3.3.4 Origin: the partner-products problem

[00-client-decisions.md](00-client-decisions.md) D3 requires two things that pull in opposite
directions: origin must be a **first-class field with a filter facet**, and partner goods must be a
**separate category**.

**Reconciliation:** origin is a field; the "separate category" is a **top-level navigation
destination backed by that field**, not a duplicate taxonomy node.

```
Product.origin = OWN_MANUFACTURE          Product.origin = PARTNER_MANUFACTURE
        │                                            │
        ├── lives in its material family             ├── lives in its material family
        ├── badge: «Власне виробництво»              ├── badge: «Відібрано Вівчариком» +
        ├── full provenance block                    │   «Виготовлено карпатським майстром»
        ├── eligible: homepage, hero,                │   where partnerRegion is known,
        │   production story, best-sellers           │   «Виготовлено іншим виробником»
        ├── JSON-LD brand        = Вівчарик          │   where it is not
        └── JSON-LD manufacturer = Вівчарик          ├── partnerName NEVER rendered (E7)
                                                     ├── short honest spec block,
                                                     │   no in-house production claims
                                                     ├── excluded from all brand surfaces
                                                     ├── JSON-LD brand        = Вівчарик
                                                     ├── JSON-LD manufacturer OMITTED
                                                     └── ALSO listed at /partnerski-vyroby
```

**The partner cannot be named** ([00-client-decisions-2.md](00-client-decisions-2.md) §E7).
`Product.partnerName` stays null and is never rendered on any surface. `partnerRegion`
(«Косівщина», «Гуцульщина») is used where it is known, because regional provenance without a
company name is still meaningful and still honest. The two-line label — a curation claim plus a
manufacture claim — is what recovers most of what naming the partner would have bought: it says
who chose the item and roughly who made it, and it says both before the buyer reaches the price.

**Why a filter-backed destination rather than a real second tree:**

- A duplicate taxonomy node would put every partner product in two branches, breaking primary-category
  resolution for breadcrumbs and doubling its sitemap presence.
- A buyer looking for a blanket wants to see every blanket. Segregating partner goods into a separate
  tree hides inventory from the person most likely to buy it, and hiding is the behaviour the whole
  labelling rule exists to avoid.
- The destination still exists, is linked in the main navigation, has its own landing copy, and can
  tell the curation story — which is what the client asked for, without the structural cost.

**Why the labelling is confident rather than a disclaimer.** A factory that also *selects* other
makers is a more credible authority than one that only sells itself — but only if it says so first.
Discovered omission converts the same fact into deception, and the trade buyer is both the most
valuable audience and the one most likely to notice ([02-ux-research.md](02-ux-research.md) §2.3).
The badge therefore renders on the product **card**, not only the PDP: a buyer must never learn the
origin later than they learn the price.

**Structured data must not lie — and the brand question is now answered.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F3 resolves what
[00-client-decisions-2.md](00-client-decisions-2.md) §E13.5 left open: partner goods **are** sold
under the Вівчарик brand. The two schema.org properties therefore split:

| Property | `OWN_MANUFACTURE` | `PARTNER_MANUFACTURE` |
|---|---|---|
| `brand` | `Brand` → Вівчарик | `Brand` → Вівчарик |
| `manufacturer` | `Organization` → Вівчарик | **omitted entirely**, never set to Вівчарик |

This is exactly the distinction schema.org draws between the entity that sells under a name and
the entity that made the thing, and it is the only honest encoding available: omission states «we
did not make this» without asserting anything false, whereas setting `manufacturer` to Вівчарик on
a resold product is simultaneously a structured-data violation and a trust failure.

**Branding the partner goods raises the stakes on the on-page label; it does not lower them.** The
brand name now appears on items the brand did not make, which is ordinary retail practice and sits
in tension with the strategy in [01-brand-strategy.md](01-brand-strategy.md) §1.2 — *the brand
sells verified origin*. The IA resolves that tension by disclosure, not by dilution:

- The origin mark stays at **equal visual weight** to «Власне виробництво». Nothing about it is
  softened because the products now carry the brand name
  ([00-client-decisions-3.md](00-client-decisions-3.md) §F3).
- The origin facet stays **pinned at the top of the filter panel** (§3.6.1).
- Partner products stay excluded from the homepage, the hero, the production storytelling and the
  best-seller rail. The brand surfaces make the manufacturing claim; the catalogue carries the
  breadth.
- `partnerName` stays null and unrendered; `partnerRegion` is used where known.

The temptation with an unnameable partner is to shrink the disclosure until it stops raising
questions; that converts an honest curation story into a discovered deception, and the trade buyer
who notices is the most valuable one on the site
([02-ux-research.md](02-ux-research.md) §2.3). A customer told plainly feels informed; a customer
who works it out themselves feels misled — and shared branding is precisely what makes working it
out feel like a discovery. The design must accommodate both label strings — the region-known and
region-unknown variants — without reflow.

### 3.3.5 Where the losing schemes survive

| Scheme | Surface | Route | Mechanism |
|---|---|---|---|
| Room / use | Mega-menu second column; homepage merchandising rows | `/{locale}/{collections}/{slug}` | `Category`, `isFeatured = true`, outside the material tree |
| Product type across materials | Search; a few curated cross-material collections where the collision is a real query | `/{locale}/{collections}/{slug}` | Same |
| Recipient / occasion | Gift hub with a three-axis finder (recipient × price band × material) | `/{locale}/{gifts}` | Curated; seasonal `Banner` |
| Price | Facet only, never a category | `?price=` | Price nodes go stale on every repricing and create thin duplicates |
| Handmade / unique | Facet + badge + one collection | `/{locale}/{collections}/ruchna-robota` | `Product.isHandmade`, `isUniquePiece` |

Launch collection set: `Для спальні`, `Для вітальні`, `Для дитини`, `Подарунки до 3000 ₴`,
`Ручна робота`, `Унікальні екземпляри`, `Для рукоділля`. Seven is the ceiling — a collections list
longer than the category tree is a signal that the tree is wrong.

`Для рукоділля` appears as a collection *as well as* three separate families. That is deliberate:
the collection serves the buyer who does not yet know whether they need пряжа or ровниця, and the
families serve the buyer who does. The collection's landing copy is the disambiguation.

### 3.3.6 The trade paths

Wholesale is enquiry-led, not self-serve ([00-assumptions.md](00-assumptions.md) D1), but there are
four distinct offers, each needing its own anchor and qualification fields, because the first reply
is only useful if it answers the right question.

| Path | `LeadKind` | Anchor | Distinct qualification field |
|---|---|---|---|
| Volume wholesale | `WHOLESALE` | `#opt` | `estimatedVolume`, `businessType` |
| Custom production (colour, size, fur length) | `PRIVATE_LABEL` | `#zamovlennia` | Spec description, quantity, deadline |
| Dropshipping | `DROPSHIP` *(new member)* | `#dropshipping` | Storefront URL, expected orders/month, fulfilment SLA expectation |
| Press / general | `PRESS`, `GENERAL` | `#contact` | — |

One page, four anchored sections, four form variants sharing one component. Four separate pages
would split the authority of the single highest-value commercial page on the site — and on a
cold-start domain there is no authority to spare.

---

## 3.4 Labelling — the culturally specific terms

Five terms have no clean translation: **ліжник**, **гуня**, **камізелька**, **ровниця**, and
**вовна для рукоділля**.

### The rule

> **Nav label is gloss-led with the native term in apposition. The URL slug is the locale's
> descriptive head term. The native term is the `<h1>`, the first sentence of body copy, and
> `alternateName` in structured data.**

**Why this beats the two alternatives:**

- *Transliteration only* (`Lizhnyk`) earns no search volume in `en`/`pl`/`de`, fails comprehension
  for the 60+ segment, and makes the nav unusable for a first-time visitor.
- *Descriptive only* (`Carpathian Wool Blanket`) forfeits the distinctive named entity. Named
  entities are what AI answer engines attach facts to and cite
  ([30-ai-search-optimization.md](30-ai-search-optimization.md)), and they are the brand's property.
  Discarding «ліжник» to sell "wool blankets" trades a differentiator for a commodity term — and on
  a domain with zero authority, the commodity term is precisely the one that will not rank.

The apposition costs about 20 characters and buys both. It is affordable because family labels live
in a mega-menu column, not a horizontal bar.

### Decisions

| Term | `uk` | `en` | `pl` | `de` |
|---|---|---|---|---|
| **Ліжник** | Ліжники *(head term)* | Lizhnyk — Carpathian Wool Blankets<br>slug `carpathian-wool-blankets` | Liżnyki — koce karpackie<br>slug `koce-karpackie` | Lischnyk — Karpaten-Wolldecken<br>slug `karpaten-wolldecken` |
| **Гуня** | Гуні | Gunia — Hutsul Felted Wool Coats<br>slug `felted-wool-coats` | **Gunia** — huculski płaszcz wełniany<br>slug `gunie-huculskie` | Gunia — Hutsulischer Wollmantel<br>slug `wollmaentel` |
| **Камізелька** | Камізельки | Wool Vests<br>slug `wool-vests` | Kamizelki wełniane<br>slug `kamizelki-welniane` | Wollwesten<br>slug `wollwesten` |
| **Ровниця** | Ровниця | Wool Roving<br>slug `wool-roving` | Niedoprzęd wełniany<br>slug `niedoprzed-welniany` | Kammzug — Wollvlies<br>slug `kammzug` |
| **Вовна для рукоділля** | Вовна для рукоділля | Carded Wool for Crafts<br>slug `carded-wool` | Wełna czesankowa do rękodzieła<br>slug `welna-do-rekodziela` | Bastelwolle — Kardenwolle<br>slug `bastelwolle` |

**`pl` is deliberately different on гуня.** Polish highlander culture shares the Carpathian craft
vocabulary — *gunia/guńka* is a known Podhale garment — so Polish is the one locale where the native
term is also the search term, and it leads. A uniform rule across all three foreign locales would
have got this wrong. Locale rules are set per term, not per document.

**`de` is deliberately different on ровниця.** *Kammzug* is the trade term, *Wollvlies* the consumer
term; the slug takes the trade term because this persona is a maker who searches trade vocabulary
([02-ux-research.md](02-ux-research.md) §2.3).

**Камізелька takes the plain descriptive label in every foreign locale.** It has no cultural charge
outside Ukrainian, so apposition would add length without adding meaning. Applying the rule
mechanically would have produced a worse label.

### Main navigation labels

| `uk` | `en` | `pl` | `de` |
|---|---|---|---|
| Вовна | Wool | Wełna | Wolle |
| Овчина | Sheepskin | Skóry owcze | Schaffell |
| Шкіра | Leather | Skóra | Leder |
| Партнерські вироби | Selected Partners | Wyroby partnerskie | Ausgewählte Partner |
| Виробництво | Production | Produkcja | Produktion |
| Оптом | Wholesale | Hurt | Großhandel |
| Журнал | Journal | Magazyn | Journal |
| Про нас | About | O nas | Über uns |
| Контакти | Contacts | Kontakt | Kontakt |

`Партнерські вироби` renders in `en` as **Selected Partners**, not "Partner Products". The English
label carries the curation frame the §3.3.4 strategy depends on; a literal translation would read as
a category of second-class goods. Labels are merchandising decisions, not dictionary lookups.

---

## 3.5 URL taxonomy and slug rules

### 3.5.1 Locale prefixing

All four locales are explicitly prefixed (`/uk/`, `/en/`, `/pl/`, `/de/`); `/` issues a **301 to
`/uk/`**.

**Why not serve `uk` unprefixed at the root?** (a) An unprefixed default creates a permanent
duplicate-content surface between `/` and `/uk/` that must be policed forever — an avoidable risk on
a domain with no authority to absorb it; (b) [25-database-schema.md](25-database-schema.md) §25.2
models `uk` as a peer locale with `@@unique([locale, slug])`, and a router treating it as special
would disagree with the schema; (c) locale resolution becomes one unambiguous middleware rule
instead of a special case. The cost is one extra path segment, which is negligible. There is no
legacy URL shape to preserve ([00-client-decisions.md](00-client-decisions.md) D2).

### 3.5.2 Route-segment dictionary

Structural segments are localised. An untranslated `/product/` inside a `de` URL is a visible tell
that the localisation is superficial, and URL legibility is a trust signal on a site whose thesis is
transparency.

| Segment | `uk` | `en` | `pl` | `de` |
|---|---|---|---|---|
| product | `tovar` | `product` | `produkt` | `produkt` |
| collections | `kolektsii` | `collections` | `kolekcje` | `kollektionen` |
| journal | `zhurnal` | `journal` | `magazyn` | `journal` |
| gallery | `halereia` | `gallery` | `galeria` | `galerie` |
| reviews | `vidhuky` | `reviews` | `opinie` | `bewertungen` |
| gifts | `podarunky` | `gifts` | `prezenty` | `geschenke` |
| search | `poshuk` | `search` | `szukaj` | `suche` |
| cart | `koshyk` | `cart` | `koszyk` | `warenkorb` |
| checkout | `oformlennia` | `checkout` | `zamowienie` | `kasse` |
| order tracking | `zamovlennia` | `order` | `moje-zamowienie` | `bestellung` |
| order payment | `oplatyty` | `pay` | `zaplac` | `bezahlen` |
| wholesale | `optom` | `wholesale` | `hurt` | `grosshandel` |
| production | `vyrobnytstvo` | `production` | `produkcja` | `produktion` |
| about | `pro-nas` | `about` | `o-nas` | `ueber-uns` |
| contacts | `kontakty` | `contacts` | `kontakt` | `kontakt` |

The dictionary is a single TypeScript constant consumed by the router, the sitemap generator and the
hreflang builder, so the three cannot drift.

**All four locales are transactional.** [00-client-decisions-2.md](00-client-decisions-2.md) §E11
accepts international orders, which promotes `en`, `pl` and `de` from informational shells to full
commerce locales. The consequence for this dictionary is that the `cart`, `checkout` and
`order tracking` rows are **live in every locale**, not `uk`-only — they were already localised
above, and that localisation is now load-bearing rather than speculative. The route inventory is in
[04-sitemap.md](04-sitemap.md) §4.3; the international purchase flow, including the customs
disclosure that must precede payment, is in [05-user-flows.md](05-user-flows.md) §5.9.3.

**No payment-method segment exists, and that is a decision.**
[00-client-decisions-5.md](00-client-decisions-5.md) §H1.1 derives the available payment methods
**server-side from cart contents** — if any line carries `madeToOrderDays`, cash on delivery is
absent from the response **for the whole cart** rather than hidden in the UI
([00-client-decisions-6.md](00-client-decisions-6.md) §J1) — and §H1.2 scopes COD with inspection to
Ukraine. The obvious wrong answer is to give each method a route, or to put the method in the
checkout URL. Both are refused: a payment method is not a location, it is a *state of the current
order*, and a URL that names it is a URL a customer can bookmark, share, or return to after the
cart has changed underneath it. The checkout stays one route per step; the method list is data in
the response.

**No split-order route exists either, and after round 6 there is nothing that could want one.**
A previous revision of the checkout specification proposed splitting a cart holding both a stocked
item and a custom-size item into two linked orders, which would have put pressure on this document
in two places: a route or step for the split screen, and an order-pair concept in the content model
so a customer could retrieve both halves under one lookup.
[00-client-decisions-6.md](00-client-decisions-6.md) §J1 withdraws the split — «Надіслати разом.»
**One order, one parcel, one delivery charge**, dispatched after the fourteen-day production
period. So:

| Would have needed | Status |
|---|---|
| A split step or route under `{checkout-seg}` | **Not created.** The mixed cart goes through the ordinary checkout steps |
| An order-pair or group identifier in the content model (§3.1) | **Not created.** One purchase is one `Order`, and `{order-seg}` resolves one number to one page ([05-user-flows.md](05-user-flows.md) §5.12) |
| A route for the disclosure that replaced the split | **Not created, and this is the point.** The disclosure is copy that appears on the product page at the moment the custom item is added, then on the cart and checkout surfaces that already exist ([17-product-page-specification.md](17-product-page-specification.md) §17.6.6, [18-checkout-specification.md](18-checkout-specification.md) §18.8.7). Copy on an existing surface is not an IA change, and treating every new sentence as a candidate route is how a sitemap acquires pages nobody navigates to |

This is recorded rather than left silent because a withdrawn design that is merely absent gets
re-proposed. The absence is now a decision with a reason attached.

**`/v` — the one route on this site that is not reached from this site.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G4 establishes that a business card already
ships in every parcel, and recommends printing a short URL plus a QR code to a review page. That
gives the IA something it has nowhere else: an **offline entry point**.

| Property | Decision |
|---|---|
| Form | `{{DOMAIN}}/v` — no locale prefix, no segment translation, one character |
| Why unprefixed | It is printed on card stock and typed by hand by a buyer who may be 70. `{{DOMAIN}}/uk/vidhuky/zalyshyty` is not a URL anyone types correctly once, and a card cannot carry four locale variants. This is the **only** permitted exception to §3.5.1's universal locale prefixing |
| Behaviour | 302 to the locale-resolved review landing page, resolving locale by `Accept-Language` **with the redirect visible in the address bar**, so the visitor can see where they landed. §3.5.1's ban on `Accept-Language` redirection applies to crawlable content routes; this route is `noindex` and has no crawler to obstruct |
| Indexing | `noindex, nofollow`. It is a redirect for humans holding a printed card, not a page |
| Reserved | Added to the rule-10 reserved-segment list (§3.5.4) **now**, before any category is created, because a single-letter slug is exactly the kind of thing a mechanical transliteration could one day produce |

The reason this matters more than a one-character route normally would: it reaches the
**counter-sale customer**, who bought in the Яворів shop, has no order number, no email in the
system and no other route back to the site. Every other entry point in this document assumes the
visitor is already on the internet looking for something. This one assumes they are holding a
blanket.

**`order payment` is a new segment, and it exists because international orders are quoted rather
than calculated.** [00-client-decisions-3.md](00-client-decisions-3.md) §F4 rules that carriers are
chosen per order, so the checkout cannot compute an international shipping rate live; the
recommended model is enquiry-then-invoice, where the customer submits the order, receives a quote,
and pays afterwards. That payment happens hours or days later, from an email link, on a device
where the cart cookie has expired or never existed. It therefore cannot hang off `{checkout-seg}`,
which is cart-scoped by construction — it hangs off the **order**, which is the only durable
object in the flow. One segment, four translations, and the alternative was resurrecting a dead
cart to reach a payment screen. The route shape is in [04-sitemap.md](04-sitemap.md) §4.3 and the
flow in [05-user-flows.md](05-user-flows.md) §5.9.4.

### 3.5.3 URL patterns

```
Home              /{locale}
Material world    /{locale}/{material}
Product family    /{locale}/{material}/{family}
Indexable facet   /{locale}/{material}/{family}/{facet-slug}
Partner destination /{locale}/partnerski-vyroby        (localised per §3.4)
Product           /{locale}/{product-seg}/{product-slug}
Collection        /{locale}/{collections-seg}/{collection-slug}
Article           /{locale}/{journal-seg}/{article-slug}
Static            /{locale}/{static-seg}
```

**Products are flat, not nested under a category.** A product belongs to many categories
(`ProductCategory` is many-to-many), so a nested URL forces an arbitrary canonical parent and breaks
whenever a product is re-merchandised. A flat namespace also keeps every product exactly 2 clicks
from home via search and 3 via the tree (§3.9), and it survives the taxonomy reorganisation that
R11 may recommend.

### 3.5.4 Slug rules

1. Lowercase, ASCII, hyphen-separated. No diacritics, no underscores, no percent-encoding.
2. `uk` slugs use the KMU 55-2010 national transliteration, with a hand-maintained override table for
   brand terms. Mechanical transliteration alone is inconsistent for `и`/`і` and for apostrophes.
3. `pl` folds diacritics (`ł→l`, `ą→a`, `ż→z`). `de` uses the German convention (`ä→ae`, `ö→oe`,
   `ü→ue`, `ß→ss`), not bare vowel folding — `wollmaentel`, not `wollmantel`, which is a different
   word.
4. Maximum 60 characters, maximum 5 meaningful words. Keyword-stuffed slugs are banned; they read as
   marketplace output and they do not help.
5. **No variant or state in a slug** — no size, colour, year, price or stock status. Those are facets
   or variants; a slug containing them becomes a lie the moment stock changes. **No customer-entered
   dimensions, ever** ([00-client-decisions-5.md](00-client-decisions-5.md) §H3b): a custom size is
   composed at purchase and stored on `OrderItem.customSpec`, and the URL space it would generate is
   unbounded rather than merely volatile, which is the worse failure. §3.3.3.
6. Product slugs use the product's given name (`lizhnyk-mozaika`), never the SKU. Named products are
   both a brand asset and a memorability asset, and memorability matters more than usual when early
   traffic is social rather than search.
7. Slugs are immutable once published. A rename writes a `Redirect` row automatically and atomically;
   no admin path changes a slug without creating one. This is the **only** use of the `Redirect`
   table — there is no legacy migration.
8. Uniqueness is per locale, enforced by `@@unique([locale, slug])`.
9. No locale code inside a slug; the locale is the path prefix.
10. A reserved-segment list (`api`, `admin`, `assets`, **`v`**, every value in §3.5.2, every material
    slug) is validated at save time so a category can never shadow a system route. `v` is reserved
    for the printed-card review route (§3.5.2) and is reserved **before** it is built, because the
    route is printed on physical card stock and cannot be changed once a batch is in circulation.
11. **`yavoriv` / `yavorivskyi` are reserved brand terms** in the rule-2 override table.
    [00-client-decisions-2.md](00-client-decisions-2.md) §E2 resolves the workshop to **вул.
    Петруші, с. Яворів, Косівський район** — the village commonly called «столиця ліжникарства».
    Product slugs **may** carry it where the product name does (`lizhnyk-yavorivskyi`); it is
    reserved so that it cannot be mechanically transliterated into two different forms, not
    because it is imposed. It appears in `en`/`pl`/`de` as the transliterated proper noun rather
    than folded into a descriptive term, because a place name that is translated stops being a
    place name.

**Яворів and Карпати are not competing for the same slot, and the previous revision implied they
were.** [00-client-decisions-3.md](00-client-decisions-3.md) §F6 withdraws the proposal to
substitute «у Яворові» for «в Карпатах» in the tagline. The approved copy stands unchanged —
«Понад 30 років виробляємо натуральні вовняні вироби **в Карпатах**» — and the reasoning is
lexical rather than sentimental: «Карпати» is understood instantly by every audience including
`en`/`pl`/`de` buyers, whereas «Яворів» requires knowledge the visitor may not have at the moment
they read a headline. A headline is not the place to teach a proper noun.

Nothing in this document reserved a slug or a route on a Yavoriv-first assumption — the village
has no route (see below), no nav label and no category node — but rule 11 above was written as
though Яворів outranked Карпати, and it is rebalanced here. The governing pattern, applied
wherever this document touches naming:

| Surface owned here | Term |
|---|---|
| Category and family slugs | Neither. Head terms only, per rules 4–6 |
| Product slugs and product names | Яворів **optional**, where the product name carries it |
| Wool-world `h1` and meta title | «Карпати» in the general title; «Яворів» where the query is place-specific (§3.6.2 curated copy) |
| `LocalBusiness` / `Place` structured data, contact NAP | Full Яворів address, always — it is a fact, not a positioning choice |
| Journal slug `yavoriv-stolytsia-lizhnykarstva` | Яворів, and it is the one surface where the village is the subject |

**«Карпати» to be understood, «Яворів» to be believed.** The headline earns attention; the pages
beneath it earn trust. Both words have a job and the jobs are different, which is why neither
replaces the other.

**Does Яворів justify a place-led landing route?** Not as a bespoke top-level route, and the
reasoning is specific rather than conservative. A `/{locale}/yavoriv` page would compete directly
with three routes that already exist and already target the same entity-place intent —
`/{contacts-seg}` (the Google Business Profile landing target, §4.4 of
[04-sitemap.md](04-sitemap.md)), `/{production-seg}`, and `/{about-seg}` — and on a domain with
zero authority, splitting one thin topic across four pages is how none of them rank. The place
instead becomes a **property of pages that already earn**: the `h1` and meta title of the wool
world, `LocalBusiness` and `Product` structured data, the contact page NAP, and product names.
The one genuinely place-led surface is an **editorial route**, `/{journal-seg}/yavoriv-stolytsia-lizhnykarstva`,
which is a real article with the museum, the plein airs and the weaving lineage in it — it can earn
links from cultural and tourism sites in a way a landing page cannot, and it costs nothing
structural because the journal route already exists. Revisit the bespoke route only if that article
accumulates links and Search Console shows place-query demand it cannot absorb; promoting an
article to a landing page later is cheap, and un-splitting four competing pages is not.

---

## 3.6 Faceted navigation

### 3.6.1 Facet inventory

Facets are declared per tier-1 material world, which is the payoff of §3.3.1.

| Facet | Source | Applies to | Display | Multi | Indexable |
|---|---|---|---|---|---|
| **Походження** (origin) | `Product.origin` | All | `PILL`, two values, **pinned first in the panel** | No | No |
| Розмір | `OptionType` `size` | All | `SIZE_GRID` | Yes | **Yes**, allowlisted |
| Колір | `OptionType` `color` | All | `SWATCH` (photographic, `OptionValue.swatchMediaId`) | Yes | **Yes**, allowlisted |
| Склад | `AttributeDefinition` | All | `PILL` | Yes | **Yes** |
| Призначення (room/use) | `AttributeDefinition` ENUM | All | `PILL` | Yes | **Yes** |
| Мікронаж | `AttributeDefinition` NUMBER | Вовна | Range pills | No | No |
| Товщина / метраж | `AttributeDefinition` NUMBER | пряжа, ровниця, вовна для рукоділля | Range pills | No | No |
| Довжина ворсу | `AttributeDefinition` NUMBER | Овчина | Range pills | No | No |
| Вичинка | `AttributeDefinition` ENUM | Овчина, Шкіра | `PILL` | Yes | No |
| Ціна | `Product.priceMinMinor` | All | Dual slider **+ numeric inputs** | Range | No |
| Ручна робота | `Product.isHandmade` | All | Switch | — | No |
| Унікальний екземпляр | `Product.isUniquePiece` | All | Switch | — | No |
| В наявності | `Product.inStock` | All | Switch, **on by default** | — | No |
| ~~Під замовлення~~ | ~~`Product.madeToOrderDays`~~ | — | — | — | **Removed — it modelled the wrong thing. See below** |
| **Можна на індивідуальний розмір** | **`Product.allowsCustomSize`** | All | Switch | — | **Yes, family-level only, allowlisted** |

A dual slider alone fails the motor-precision constraint in
[02-ux-research.md](02-ux-research.md) §2.6, which is why price also carries numeric inputs.
"В наявності" defaults on because one-of-one handmade items
([00-assumptions.md](00-assumptions.md) B4) otherwise make an unfiltered grid mostly disappointment.

**There is no dye-lot facet.** Lots are not tracked
([00-client-decisions-2.md](00-client-decisions-2.md) §E8), so the row the previous revision
carried as an interim measure is removed rather than left as an unpopulated control. §3.1 gives
the replacement.

#### The «Під замовлення» facet was wrong, and the correction is not cosmetic

The previous revision faceted on `Product.madeToOrderDays`, reading it as "this product is made to
order". [00-client-decisions-5.md](00-client-decisions-5.md) §H3b establishes that it is not:
`madeToOrderDays` applies **only when the customer chooses a custom size**, and a product carrying
`14` in that field is very often a product sitting in stock at three standard sizes.

Faceted on directly it would therefore have produced a filter that lies in both directions. A buyer
who ticks «Під замовлення» expecting a wait would be shown blankets available for next-day
dispatch; a buyer who unticks it to find stock would have those same blankets hidden. A facet whose
true predicate is "this product has an attribute that applies to a configuration you have not
chosen yet" is not a facet — it is a leaked implementation detail.

#### Decision: custom-size capability **is** a filterable facet

The question is whether "can be made to my measurements" is a *buying criterion* or a *product
detail*. Four tests, and it passes all four:

| Test | Verdict |
|---|---|
| Does a real buyer arrive already holding this requirement? | **Yes, and two segments hold it before they hold anything else.** An interior designer specifying a throw for a 210 cm bench, and a hotel or guesthouse fitting non-standard beds, both start from a dimension. For them the standard sizes are not a shortlist to browse — they are a list of things that do not fit, and a catalogue that cannot be filtered on this point is a catalogue they leave |
| Is it stable, or does it churn? | **Stable.** `allowsCustomSize` is an admin toggle reflecting what the workshop can physically produce. It is not stock, not price, not season. §3.3.5 rejects price as a facet-category precisely because it goes stale on every repricing; this has the opposite property |
| Can the business populate it honestly? | **Yes**, and more honestly than most facets on this list. It is a boolean the owner sets deliberately, with the loom bounds set alongside it. Contrast the dye-lot facet, removed above for exactly the opposite reason |
| Does it narrow usefully, or does it return almost everything? | **Unknown at launch and it must be watched.** If the client eventually enables the toggle across the whole catalogue the facet returns everything and stops narrowing, at which point it should be demoted to a badge. §3.10 records this as the condition to monitor rather than as an assumption |

**It is a switch, not a pill pair.** The useful query is «show me only what can be made to measure»;
nobody filters for «cannot be made to measure». A two-value pill would imply a meaningful negative
segment that does not exist, and would cost panel height that §3.6.1's pinned origin facet is
already competing for.

**Placement: below the hard physical facets, above the soft ones.** It sits with «Ручна робота» and
«Унікальний екземпляр» rather than with розмір and колір, because it describes what the workshop
*can do* rather than what an item *is*. It never displaces the origin facet from the top of the
panel — origin is pinned by ruling ([00-client-decisions-2.md](00-client-decisions-2.md) §E7).

#### Indexability: yes, at family level only, and under the full §3.6.2 gate

This is the one facet on the list whose indexability is a genuinely close call, so the reasoning is
stated rather than asserted.

**For:** «ліжник на замовлення», «ковдра за розмірами», «wool blanket made to measure» are real
queries with commercial intent and almost no competition from marketplace listings, which cannot
express the offer at all. A cold-start domain (D2) has very few query classes available to it where
it starts level with everyone else, and this is one.

**Against:** it is a boolean, so it yields exactly one page per family, and a boolean facet page is
the classic doorway-page shape if it carries no content of its own.

**Resolution:** allowlisted for indexing **at family level** (`/uk/vovna/lizhnyky/na-zamovlennia`),
never at world level and never in combination with another facet, and subject to all five
conditions in §3.6.2 without exception. The curated-copy requirement is what makes this safe: such
a page has genuine content to carry that the family page does not — **the permitted dimension
ranges, the fourteen-day production time, the prepayment rule and how the price is calculated from
area**. That is a page worth writing, which is precisely the test §3.6.2 was designed to apply. A
family whose custom-size page would be four products and a sentence does not get one, and the rule
already refuses it without anyone having to decide.

The world-level page is refused because it would aggregate ліжники, ковдри and накидки under one
heading whose only shared property is a production policy. Nobody searches for "things this
workshop will resize".

**The origin facet is pinned first, never indexable, and never a default.** Pinning is required by
[00-client-decisions-2.md](00-client-decisions-2.md) §E7 and reinforced by
[00-client-decisions-3.md](00-client-decisions-3.md) §F3: the partner cannot be named, and the
goods now carry the Вівчарик brand, so the filter panel is the one place a buyer can act on origin
in a single click. It cannot sit below four collapsed groups. Indexing it would create a parallel "partner products" index presence competing
with the material tree; defaulting it on would hide inventory. It exists so a trade buyer can
restrict to own manufacture in one click ([00-client-decisions.md](00-client-decisions.md) D3.4).

### 3.6.2 Indexability rule

> **A facet URL is indexable only if all five hold: exactly one facet dimension is active; exactly
> one value is selected within it; the dimension is on the allowlist; the result set holds at least
> `{{FACET_INDEX_MIN}}` products (recommended 8); and the page carries a curated
> `CategoryTranslation.description`.**

Everything else is `noindex, follow`, canonical to the clean category URL.

**Why require curated copy and not just a count?** The count threshold protects against thin
*inventory*; the copy requirement protects against thin *content*. An auto-generated facet page with
eight products and no prose is the doorway page that gets a whole faceted layer demoted — a risk a
new domain cannot absorb. Requiring an editor to write the intro caps indexable facet pages at the
number someone was willing to write for, which is the correct governor.

### 3.6.3 URL form follows indexability

| Kind | Form | Example |
|---|---|---|
| Indexable facet | **Path segment** | `/uk/vovna/lizhnyky/rozmir-150x200` |
| Non-indexable facet | **Query string** | `/uk/vovna/lizhnyky?micron=24-28&origin=own` |
| Sort | Query, always `noindex` | `?sort=price-asc` |
| Pagination | Query, `index, follow`, self-canonical | `?page=3` |
| Search | Query, always `noindex` | `/uk/poshuk?q=…` |

Path for indexable and query for everything else makes the robots rule trivially simple — *any URL
with a query parameter other than `page` is noindex* — instead of a fragile parameter allowlist.
Pagination stays indexable because a large family needs paginated URLs for crawl reach.

---

## 3.7 Breadcrumbs and cross-linking

### 3.7.1 Breadcrumb logic

```
Home  ›  Material world  ›  Product family  ›  Product
Home  ›  Material world  ›  Product family  ›  Facet value
Home  ›  Journal  ›  Article
Home  ›  Collections  ›  Collection
```

- **Primary category resolution.** A product in several categories takes its breadcrumb from the
  `ProductCategory` row with the lowest `sortOrder`; ties break toward the deeper category. No schema
  change is needed, which matters because [25-database-schema.md](25-database-schema.md) is canonical.
- **A partner product's breadcrumb is its material path**, never `/partnerski-vyroby`. The partner
  destination is a filtered view, not a parent, and `BreadcrumbList` must describe one canonical
  path. Arriving from it shows a dismissible "Ви переглядаєте: Партнерські вироби" chip instead.
- **Collections do not appear as a crumb** for the same reason.
- **The last crumb is plain text**, truncated with a `title` at 32 characters on mobile, and never
  dropped: it is the answer to "where am I", which matters most to the visitor least able to
  reconstruct it.
- Breadcrumbs render **above** the H1 everywhere except the PDP on mobile, where they sit below the
  gallery so the LCP image is not pushed down.

### 3.7.2 Commerce ↔ editorial cross-linking

On a cold-start domain the editorial layer is the organic entry point
([02-ux-research.md](02-ux-research.md) §2.1), which makes cross-linking a revenue mechanism rather
than a housekeeping nicety. Six links, each bidirectional, each with a rule:

| Link | Mechanism | Rule |
|---|---|---|
| PDP → care guide | `AttributeDefinition` key `care_guide` → a `Post` slug per locale | Every product in a family shares the family's care article. A product with no care link fails the publish check. |
| PDP → production stage | `Product.productionStage[]` → anchors on the production page | Each stage badge is a link, not a label. This is the A3 answer made clickable. **Own manufacture only** — a partner product has no in-house stages to link. |
| Article → product | Structured embed nodes in `PostTranslation.bodyJson` (§3.1) | Inline, where the argument is made. Minimum one per published article. |
| Category → editorial rail | Curated list on `CategoryTranslation` | Each world carries 3 articles; each family carries 1. |
| PDP → reviews hub | `Review` aggregated to `/{locale}/{reviews}` | Launches empty and says so honestly; no seeded testimonials |
| Gallery album → world | `MediaAlbum.key` convention `<world>-<stage>-<period>` | Albums are entry points to the world they document, not a dead-end lightbox |

**The disambiguation triangle.** `Вовняна пряжа`, `Ровниця` and `Вовна для рукоділля` each link to
the other two from the buy box, and all three link to one explainer article. Three families that
look identical in a thumbnail need an explicit comparison path, not adjacency in a menu.

**The orphan rule, enforced in admin at publish time:** every published `Post` links to at least one
product or category, and every published family links to at least one article. A publish attempt
that violates it shows a blocking warning naming the missing link. Editorial that links to nothing
earns nothing.

### 3.7.3 The contact route is a destination, and its link weight rises

[00-client-decisions-3.md](00-client-decisions-3.md) §F2 establishes that the Яворів site houses
**retail and production together**. That is new information and it changes what `/{contacts-seg}`
is for. A factory you can only read about is a claim; a shop you can walk into, attached to the
production floor, is proof — and it is proof located in a village tourists already travel to for
exactly this craft.

**Does the contact route's priority rise? Yes, on two of three axes, and the third is a deliberate
no.**

| Axis | Verdict | Reasoning |
|---|---|---|
| **Content priority** | **Rises sharply.** From utility page to destination page | It now answers a query class no other page on the site answers: «де купити ліжник», «магазин ліжників», «фабрика вовни Косівський район». Those are retail-intent, place-intent queries with real local volume, and they resolve to a shop, not to a catalogue. The page needs directions, what is on display, whether the production floor is visitable, both numbers and the variable-hours caveat — specified as a wireframe at [07-page-wireframes.md](07-page-wireframes.md) §7.15 |
| **Internal-link weight** | **Rises.** From footer-only to four inbound editorial links | A page cannot rank on merit it is not given. The links below are all genuinely useful to the reader, which is the only kind worth adding |
| **Primary nav slot** | **No.** It stays out of the top category row | The header already carries four category entries plus two commercial entries, which is its breadth ceiling (§3.8). More decisively: visitors do not look for contact details in a category row — they look in the footer and in the header utility area, both of which already carry it. Promoting it would cost a category slot to move a link people already find |

**The four inbound links, each with a reason the reader benefits:**

| From | Link | Why the reader wants it there |
|---|---|---|
| `/{production-seg}`, at the end of the stage sequence | «Приїздіть: магазин і виробництво в одному місці» | Someone who has just read the whole process is the single most likely visitor to want to see it. This is the highest-intent placement on the site |
| `/{about-seg}`, in the people section | The address, as a sentence rather than a footer NAP | The people are named and faced on that page; where they work is the natural next fact |
| PDP delivery block, beside the pickup option | «Забрати в Яворові» linking to directions | Pickup is an invitation, not a saving ([00-client-decisions-3.md](00-client-decisions-3.md) §F2). A pickup option with no directions behind it is a shipping method; with directions it is a visit |
| Homepage footer band | One line with the village and the hours caveat | Costs one line and converts a claim into an open invitation |

**One rule that keeps this honest.** Every one of those links carries the variable-hours caveat or
sits adjacent to it ([00-client-decisions-2.md](00-client-decisions-2.md) §E3). An invitation to
visit a place that turns out to be shut is worse than no invitation, and it damages the Google
Business Profile this route exists to mirror.

#### Round 4 raises it again, and this time the reason is stronger

[00-client-decisions-4.md](00-client-decisions-4.md) §G3: «Так, відвідувачі можуть оглянути цех з
Власником.» **The workshop can be toured, accompanied by Іван, arranged in advance by phone.**

F2 made the contact route a destination because there is a shop at the address. G3 makes it a
destination because there is something to *do* there that no competitor can offer. The evidence
hierarchy in [01-brand-strategy.md](01-brand-strategy.md) §1.8 ranks video of the factory first; a
visitor can stand in it. There is no stronger available answer to purchase anxiety A3 — «is this a
real factory or a reseller» ([02-ux-research.md](02-ux-research.md) §2.4) — than the manufacturer
walking you through it.

The IA consequence is narrow and specific: **the tour is content, not a feature.**

| Tempting structure | Verdict |
|---|---|
| A booking route — `/{contacts-seg}/vizyt` with a calendar | **Forbidden.** §G3 is explicit: a calendar implies capacity that does not exist and creates no-shows nobody chases. A route implies a bookable resource; there is no resource, there is a person with a phone |
| A `WorkshopVisit` entity, availability windows, slot records | **Forbidden for the same reason.** §3.1's rule is that an entity with no surface is not needed; here the inverse applies — a surface with no honest data behind it must not acquire an entity to make it look real |
| A section on the existing contact route, with the phone as the whole mechanism | **Chosen.** No new route, no new entity, no new depth. The page gains a block; the IA gains nothing, which is the correct cost for a fact that is conveyed in two sentences |
| A dedicated `/{locale}/ekskursiia` landing page | **Rejected.** Same argument as the Яворів place-route above (§3.5.4): it would compete with `/{contacts-seg}`, `/{production-seg}` and `/{about-seg}` for one thin topic, and on a zero-authority domain splitting a topic four ways is how none of the four rank |

§G3 also names the surfaces the invitation appears on — the production page, the contact page, the
wholesale page, the about page and the Google Business Profile. All four site surfaces already
exist and already link to `/{contacts-seg}`, so the tour adds inbound relevance to a route that was
already at one click. It adds **no** depth and **no** nodes, which is the outcome an IA should want
from its strongest asset: the structure was already right, and the new fact simply fills it.

#### The contact page's content contract, per G1

[00-client-decisions-4.md](00-client-decisions-4.md) §G1 fixes what this route must carry, and one
half of it is a rule about *not* being consistent:

| Element | Rule |
|---|---|
| Phones | **Both, Іван first**, and the fallback framed as a fallback: «Якщо не відповідає — телефонуйте Любові». Not two equal numbers — a labelled sequence |
| The tour invitation | Adjacent to the phones, because the phone *is* the booking mechanism |
| Hours | The variable-hours sentence only. Never a schedule, never in structured data (§E3) |
| Legal identity | **Любов**, wherever the page names the ФОП — and this deliberately disagrees with the phone order above |

That last row is the one a future contributor will try to "fix". §G1 states the split as a rule:
the person who trades and the person who answers are different people, a legal page naming the
wrong one is a defect, and a header naming the person who actually picks up is correct. The
contact route is the only page that renders both facts, so it is the page where the divergence is
visible and therefore the page where it is most at risk of being flattened. It is recorded here,
in the IA, rather than left to the wireframe, because it is a fact about which entity supplies
which string — `contact.phones` and `legal.entityName` are separate settings with no shared parent
([16-footer-specification.md](16-footer-specification.md) §16.5).

---

## 3.8 Navigation model

```
┌────────────────────────────────────────────────────────────────────────┐
│ [mark] Вовна  Овчина  Шкіра  Партнерські вироби │ Виробництво  Оптом   │
│                                          [search] [locale] [cart]      │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼ mega-menu — Вовна (click to open, never hover)
┌────────────────────────────────────────────────────────────────────────┐
│ ТЕКСТИЛЬ ДЛЯ ДОМУ   ОДЯГ ТА ВЗУТТЯ   ДЛЯ РУКОДІЛЛЯ │ ЗА ПРИЗНАЧЕННЯМ  │
│ Ліжники             Гуні             Вовняна пряжа │ Для спальні      │
│ Ковдри вовняні      Камізельки       Ровниця       │ Для вітальні     │
│ Подушки             Пояси            Вовна для     │ Для дитини       │
│ Накидки             Шкарпетки        рукоділля     │ Подарунки        │
│                     Капці                          │ Ручна робота     │
│ → Вся вовна                                        │                  │
│ ─────────────────────────────────────────────────────────────────────  │
│ [image]  Як ми робимо ліжник — 30 років у Карпатах →                   │
└────────────────────────────────────────────────────────────────────────┘
```

Columns 1–3 are the primary taxonomy grouped visually (§3.3.2), column 4 is the surviving use-based
scheme, and the footer strip is the editorial bridge that carries the 30-year manufacturing claim
into the navigation itself.

**The mega-menu opens on click, not hover**, on every pointer type. Hover-opening menus are a
documented failure for reduced motor precision, are unusable on touch, and a single interaction
model removes an entire class of bugs. It closes on Escape, on outside click, and on route change,
and it traps focus while open.

**There is no account control in the header, and there never will be.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent: no
registration, no login, no password reset, no account pages. The utility cluster is therefore
exactly three controls — search, locale, cart — which is also the reason the header can hold four
category entries plus two commercial entries without crowding. The functions an account would have
carried are distributed instead:

| Function an account would serve | Where it lives now |
|---|---|
| Find my order | `Order.guestToken` link in the confirmation email, plus the order-lookup form (order number + email) at `/{locale}/{order-seg}` |
| Reorder | The same order-lookup page ([05-user-flows.md](05-user-flows.md) §5.12) |
| Saved addresses | Address prefill from a first-party cookie, same device only |
| Wishlist | `localStorage`, device-local, no server record and no `WishlistItem` table ([25-database-schema.md](25-database-schema.md) §25.8b). The UI states «Збережено на цьому пристрої» |
| Marketing opt-in | A checkout checkbox writing to `NewsletterSubscriber`, independent of any account concept |

The `Customer` model still exists, but as an **order-derived record for support and analytics
only** — no `passwordHash`, no authentication, no surface in the storefront IA. Staff
authentication is unaffected; `/admin/*` keeps its full auth route set
([04-sitemap.md](04-sitemap.md) §4.6).

---

## 3.9 Depth budget

**Rule: no product is more than 3 clicks from the homepage, and no commercially important page is
more than 2.**

| Destination | Path | Clicks |
|---|---|---|
| Product, via the tree | Home → Material → Family → Product | 3 |
| Product, via the mega-menu | Home → (menu, same page) Family → Product | 2 |
| Product, via search | Home → Search → Product | 2 |
| Product, via a homepage row | Home → Product | 1 |
| Product family | Home → Family (mega-menu) | 1 |
| Collection | Home → Collection (mega-menu) | 1 |
| Partner destination | Home → Партнерські вироби | 1 |
| Wholesale form | Home → Оптом (form on page) | 1 |
| Production page | Home → Виробництво | 1 |
| Article | Home → Журнал → Article | 2 |
| Order tracking | Home → footer link → form | 1 |
| Contacts / the shop / the workshop tour | Home → footer or header utility link | 1 |
| Custom-size family page | Home → Family (mega-menu) → facet | 2 |
| **Leave a review, from the printed card** | `{{DOMAIN}}/v` → review form | **0 — the entry point is not on the site** |

The last row is not a formatting joke. Every other line in this table measures distance from the
homepage, which presupposes a visitor who is already on the site. The business card
([00-client-decisions-4.md](00-client-decisions-4.md) §G4) reaches the one segment for whom that
presupposition fails entirely — the counter-sale buyer, who has no order number, no email on file
and no reason to have typed the domain. Measuring it as zero clicks records what it actually is:
the shortest path on the site, available to the audience with no other path at all.

**The contact route is one click, and it is reached without a category slot.** §3.7.3 raises its
content priority and its inbound link weight without touching the header's category row: the
footer NAP, the header utility area, the production page and the about page all reach it in one
step from wherever the visitor already is. A destination page does not need a nav slot; it needs
links from the pages whose readers want to go there, and those are not the pages a category row
serves.

**The budget is what forbids a third taxonomy tier.** Material → Family → Subfamily → Product is 4
clicks, over budget, and no subfamily earns that click better than a facet does. This is the formal
derivation of §3.3.3 and of the visual-cluster decision in §3.3.2: anything that wants to be a
subfamily becomes either a facet or a non-routed cluster label.

Click depth is not crawl depth. Crawl depth is additionally bounded by the XML sitemap segments in
[04-sitemap.md](04-sitemap.md) §4.8, which give every product a direct entry regardless of its
position in the tree.

---

## 3.10 Tokens introduced by this document

| Token | Meaning | Severity |
|---|---|---|
| `{{FACET_INDEX_MIN}}` | Minimum product count for an indexable facet page. Recommended 8. | MEDIUM |

**Retired by round 2:** `{{PARTNER}}` and `{{PARTNER_NAMES}}` are removed. They can never resolve —
[00-client-decisions-2.md](00-client-decisions-2.md) §E7 rules that partners are not named — and a
token that is permanently unresolvable is worse than no token, because it keeps a design decision
open that has in fact been closed. The origin label is now two fixed strings, given in §3.3.4.

**Resolved by round 2:** `{{SKU_COUNT}}` follows the catalogue migration and lands somewhere between
several hundred and roughly a thousand SKUs (§E5). The facet architecture in §3.6 was designed to
hold across that range and needs no rework; the only live question is whether Postgres full-text
search suffices at the upper end ([25-database-schema.md](25-database-schema.md) §25.10).

**Resolved by round 3** ([00-client-decisions-3.md](00-client-decisions-3.md)):

| Item | Resolution | Effect here |
|---|---|---|
| Partner branding (§E13.5 / §F3) | Partner goods sell **under the Вівчарик brand**. `brand` = Вівчарик for both origins; `manufacturer` omitted for partner goods | §3.3.4 rewritten. No label, facet or taxonomy change — the disclosure strategy was already the right one and is now load-bearing |
| `{{INTL_CARRIER}}` (§F4) | **Multiple, quoted per order** — Nova Poshta, Ukrposhta and others case by case. Not a single default | §3.5.2 gains the `order payment` segment; the token stops being a blocker and becomes a per-order operational choice |
| Tagline (§F6) | **«в Карпатах»** confirmed; Яворів retained in supporting surfaces | §3.5.4 rule 11 rebalanced |
| `{{LEGAL_ID}}` (§F1) | Exists, pending delivery | Blocks nothing in this document |

**Resolved by rounds 4 and 5** ([00-client-decisions-4.md](00-client-decisions-4.md),
[00-client-decisions-5.md](00-client-decisions-5.md)):

| Item | Resolution | Effect here |
|---|---|---|
| `{{MADE_TO_ORDER_DAYS}}` (§G2) | **14 days of production before dispatch**, not total delivery | §3.1 inventories `IN_PRODUCTION` as customer-read content. No structural change — it is a status vocabulary item, not a route |
| Custom-size scope (§H3b) | **Per product, admin toggle**, and a property of the chosen size rather than of the product | §3.3.3 gains the no-variant-row case; §3.6.1 replaces the `madeToOrderDays` facet, which modelled the wrong predicate |
| Custom-size pricing (§H3c) | **Area × owner-set rate, floored, within physical loom bounds.** Computed live, recomputed server-side | The custom-size facet describes a **capability with a known price**, not a quote request. That is what makes it indexable at family level — a page that can state how the price is calculated is a page with content |
| `{{FLOOR_VISIT}}` (§G3) | **Yes, guided, with Іван, by prior phone arrangement** | §3.7.3 — content on an existing route. **No booking route, no `WorkshopVisit` entity, no depth change** |
| Post-purchase route back to the site (§G4) | **A business card already ships in every parcel.** Short URL `/v` plus a QR | §3.5.2 gains one reserved unprefixed route — the site's only offline entry point and its only permitted exception to §3.5.1 |
| Phone priority (§G1) | **Іван primary, Любов fallback and ФОП of record** | §3.7.3 — the contact route's content contract, including the deliberate name divergence between the NAP and the legal line |

**One condition to monitor rather than assume.** The custom-size facet (§3.6.1) narrows usefully
only while `allowsCustomSize` is true for a minority of the catalogue.
[00-client-decisions-5.md](00-client-decisions-5.md) §H4 records that the client has **not** been
asked whether every category could eventually be made to measure. If the toggle is later enabled
catalogue-wide, the facet returns everything, stops narrowing, and should be demoted from a filter
to a badge — and the family-level indexable pages should be withdrawn at the same time, because a
page describing a property every product has is a page describing nothing.

Referenced without redefinition: `{{BRAND_NAME}}`, `{{DOMAIN}}`, `{{DE_FUR_POLICY}}`,
`{{BLOG_CADENCE}}`, `{{TRANSACTIONAL_FROM}}`.
