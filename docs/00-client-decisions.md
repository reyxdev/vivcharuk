# Client Decisions — Round 1

Received 2026-09-28, directly from the client. **This is the highest-authority document in the
blueprint.** It supersedes [00-existing-site-audit.md](00-existing-site-audit.md) and
[00-assumptions.md](00-assumptions.md) on every point it touches.

Authority order, highest first:

```
00-client-decisions.md      ← this file: client-confirmed
00-existing-site-audit.md   ← observed facts about a RELATED but SEPARATE business
00-assumptions.md           ← still-unverified assumptions
everything else
```

---

## D1 — Company age: RESOLVED. 30+ years is legitimate.

**Client statement:** the manufacturing business began approximately **1991–1992**, starting
with wool processing and expanding into industrial washing, combing, spinning, weaving, and
sewing of finished wool products. The manufacturing operation has run **continuously since the
early 1990s**. The legal entity changed later because the original company was split into
several ФОПs.

**Approved public copy, verbatim:**

> «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.»

**Constraints:**

- No certificates or official anniversary documents exist. **Never imply certification,
  award, or documented anniversary.** No "офіційно засвідчено", no certificate imagery, no
  accreditation marks.
- The claim attaches to the **manufacturing**, not to a legal entity. All copy must be phrased
  as "виробляємо понад 30 років", never "компанія заснована 1992 року". The distinction is not
  pedantry: it is the difference between a defensible craft-continuity claim and an
  unsupportable corporate-registration claim, given that the current ФОПs are newer.
- `Organization.foundingDate` in structured data must therefore **not** be set to 1992. Either
  omit `foundingDate` entirely or set it to the actual registration date of the operating
  entity, and carry the 30-year story in `description` and on-page prose where it is
  editorial rather than machine-asserted. See [29-seo-architecture.md](29-seo-architecture.md).

**Token resolution:**

| Token | Value |
|---|---|
| `{{YEARS_EXPERIENCE}}` | `понад 30` / `over 30` / `ponad 30` / `über 30` |
| `{{FOUNDING_YEAR}}` | ~1991–1992, **editorial use only**, never in structured data |
| `{{CERTIFICATIONS}}` | **None.** [00-assumptions.md](00-assumptions.md) A7 confirmed. |

The 30-year claim is now the single strongest trust asset available, and
[01-brand-strategy.md](01-brand-strategy.md) §1.8 rank-1 evidence (film the factory) is what
substantiates it in the absence of paperwork. Show the machines that are 30 years old.

---

## D2 — Brand and domain: RESOLVED. New brand, new domain, cold start.

**Вівчарик is the new primary consumer brand.** It is not a rebrand of the audited site.

| Question | Answer |
|---|---|
| Relationship to the audited site | The Prom.ua / `fabryka-shkur.com.ua` business **belongs to the client's wife** and stays online as a separate operation |
| Domain | **New, independent domain.** `{{DOMAIN}}` still to be chosen |
| Role | Becomes the main website, connected to Google Business Profile and all future marketing |
| Branding | Keep the existing **sheep / shepherd identity** — "Вівчарик" means *little shepherd*. Build the visual brand around it |
| Prom.ua branding | **Must not appear anywhere in the new experience** |

### Consequence 1 — the migration workstream is cancelled

[00-existing-site-audit.md](00-existing-site-audit.md) §0.8 is **revoked**. There is no product
migration, no media migration, no blog migration, no 301 redirect mapping, and no Search Console
baseline to preserve. [00-assumptions.md](00-assumptions.md) E4 was right after all.

The audited site is now **reference intelligence about an adjacent business**, not a
predecessor. Its category structure, pricing, and product naming remain genuinely useful as a
market reference and as evidence of what the extended family operation can produce — but it
carries no authority over this build.

### Consequence 2 — this is a cold-start SEO problem, which is harder

Launching on a new domain means zero domain authority, zero backlinks, zero ranking history,
and a sandbox period. This changes the SEO strategy fundamentally and it must be stated plainly
rather than discovered in month three:

- **Organic traffic will be near zero for the first 3–6 months.** Any launch plan that assumes
  otherwise is wrong.
- **Google Business Profile becomes the highest-leverage early channel**, not an afterthought.
  The client has explicitly named it. A real address in Kosiv district, real opening hours
  including Sunday, and a visitable factory in a tourist region is a strong local asset that
  outranks a new domain's organic prospects for the first two quarters.
- **Instagram and the existing offline customer base are the launch traffic**, not search.
- **Long-tail informational content** (care guides, "що таке ліжник", "гуня vs накидка",
  wool-versus-synthetic comparisons) is the realistic early organic entry point, because
  commercial head terms will not rank on a new domain for a year.
- Domain choice matters more than usual. An exact-match or brand-clear Ukrainian domain is
  preferable. Record the decision in [29-seo-architecture.md](29-seo-architecture.md).

### Consequence 3 — every contact and commercial detail from the audit is now unverified

This follows from D2 but is easy to miss, so it is stated explicitly.

[00-existing-site-audit.md](00-existing-site-audit.md) §0.5 and §0.6 promoted a set of facts
out of the assumption register — phone numbers, email, Instagram handle, working hours,
delivery tariffs, the free-shipping threshold, and the returns window. **Every one of those
belongs to the wife's business.** They describe a different trading entity and must not be
published as Вівчарик's terms.

| Detail | Status |
|---|---|
| Phone numbers | `{{PHONE_PRIMARY}}`, `{{PHONE_SECONDARY}}` — unknown |
| Email | `{{EMAIL}}` — unknown. Must be `@{{DOMAIN}}`, not gmail |
| Viber / messengers | `{{MESSENGERS}}` — unknown |
| Instagram | `{{INSTAGRAM}}` — `@fabryka_shkur` is **not** this brand |
| Working hours | `{{HOURS}}` — unknown |
| Delivery tariffs | `{{SHIPPING_RATES}}` — unknown |
| Free-shipping threshold | `{{FREE_SHIPPING_THRESHOLD}}` — unknown |
| Returns window | `{{RETURN_DAYS}}` — unknown (14 days is the Ukrainian statutory minimum, so it is a safe *floor*, not a confirmed value) |
| Dropshipping offered | `{{DROPSHIP_OFFERED}}` — unknown |
| Physical address | `{{FACTORY_ADDRESS}}` — **unknown.** Verbovets is the wife's registered site. Whether Вівчарик's production shares it has not been confirmed, and the address drives Google Business Profile, LocalBusiness schema, and the contact page |

The address matters most. A wrong address in a Google Business Profile is expensive to correct
and damages local ranking, and GBP is this launch's primary early channel (§D2 Consequence 2).
**Confirm the address before creating the profile, not after.**

### Consequence 4 — the mascot is no longer optional

[01-brand-strategy.md](01-brand-strategy.md) §1.7 recorded the sheep mascot as a live risk
against the premium positioning. **That risk is now closed: the client has mandated the
sheep/shepherd identity as the brand core.** Вівчарик *is* a shepherd. The mascot is not
decoration bolted onto a luxury brand; it is the brand's name made visible.

The §1.7 execution constraints still hold and become more important, not less — line-drawn
maker's-mark register, one colour, absent from PDP/cart/checkout/wholesale. That treatment is
what lets a shepherd mascot coexist with 14,900 UAH price points. A cartoon sheep would not.

[00-assumptions.md](00-assumptions.md) F8 is closed.

---

## D3 — Scope: RESOLVED. Full business, wool-led.

**The website represents the entire manufacturing business.** Homepage and branding focus on
wool and Carpathian manufacturing; the catalogue supports every category.

### Confirmed category architecture

```
ВЛАСНЕ ВИРОБНИЦТВО  (own manufacture — the brand's core)
├── Вовна  (primary focus, drives homepage and brand)
│   ├── Ліжники
│   ├── Ковдри вовняні
│   ├── Гуні
│   ├── Камізельки
│   ├── Подушки
│   ├── Шкарпетки
│   ├── Капці
│   ├── Пояси
│   ├── Накидки
│   ├── Вовняна пряжа
│   ├── Ровниця
│   └── Вовна для рукоділля  (raw / combed)
├── Вироби з овчини  (sheepskin)
└── Шкіряні вироби  (leather — existing assortment)

ПАРТНЕРСЬКІ ВИРОБИ  (products from other manufacturers — separate category)

ДЕРЕВО  (future handmade wooden products — architecture prepared, not launched)
```

Note two additions to the original brief: **камізельки** (vests) are confirmed stock and were
not in the brief's list, and **вовна для рукоділля** is distinct from ровниця and пряжа and
needs its own treatment for the needleworker audience.

### The resale problem — and the required solution

The client confirms a category of **products from other manufacturers**. This is the single
biggest strategic risk introduced by this round of decisions, and it must be handled
structurally rather than ignored.

[01-brand-strategy.md](01-brand-strategy.md) §1.2 rests on one sentence: *the brand sells
verified origin*. A resale category sitting undifferentiated next to own-manufacture goods
destroys that thesis the moment a customer notices — and wholesale buyers, who are the most
commercially valuable audience, will notice first.

**Required treatment:**

1. **A first-class data field**, not a category tag. Add to the `Product` model in
   [25-database-schema.md](25-database-schema.md):

   ```prisma
   enum ProductOrigin { OWN_MANUFACTURE PARTNER_MANUFACTURE }

   model Product {
     origin         ProductOrigin @default(OWN_MANUFACTURE)
     partnerName    String?        // required when origin = PARTNER_MANUFACTURE
     partnerRegion  String?        // "Косівщина", "Закарпаття" — keep provenance where it exists
   }
   ```

2. **Visible, confident labelling — not a disclaimer.** Own-manufacture products carry a
   «Власне виробництво» mark. Partner products carry «Вироблено партнерами {{PARTNER}}» with
   the partner named. Naming the partner converts a weakness into a curation story: a factory
   that also *selects* is a more credible authority than one that only sells itself. Hiding it
   converts the same fact into a discovered deception.

3. **Structured data must not lie.** `Product.brand` and `Product.manufacturer` differ between
   the two origins. Asserting own manufacture on a resold product is a structured-data
   violation and a trust failure simultaneously.

4. **Filter facet**, so buyers — especially wholesale — can restrict to own manufacture.

5. **Homepage and brand surfaces show own manufacture only.** Partner goods live in the
   catalogue and in search; they never appear in the hero, the production storytelling, or the
   best-seller rail. This is what keeps the brand promise and the catalogue breadth from
   colliding.

6. **Own-manufacture products get the full provenance block** (`woolOrigin`, `woolMicron`,
   `productionStage[]`). Partner products get a shorter, honest specification block with no
   in-house production claims.

### Unresolved inside D3 — does Вівчарик actually tan hides?

D3 places «Вироби з овчини» and «Шкіряні вироби» under **ВЛАСНЕ ВИРОБНИЦТВО**. But D1's
continuity statement describes **wool only** — washing, combing, spinning, weaving, sewing. It
says nothing about tanning, and tanning is a genuinely different industrial process requiring
different plant, chemistry, effluent handling and skills.

The «бельгійська технологія» tanning claim came from the **audited site**, which
[00-client-decisions.md](00-client-decisions.md) D2 establishes is the wife's separate
business. It therefore cannot be asserted for Вівчарик.

Three possibilities, and they produce materially different pages:

| If | Then |
|---|---|
| Вівчарик tans in-house | Full hide pipeline on the production page, `OWN_MANUFACTURE`, and the process becomes a second provenance story |
| Вівчарик sews from hides tanned elsewhere | Honest framing is «шиємо з овчини, вичиненої в Карпатах» — still own manufacture, but the claim stops at sewing |
| Вівчарик resells finished hide goods | `PARTNER_MANUFACTURE`, partner named, excluded from production storytelling |

**This is not a detail.** Claiming a tanning process the business does not operate is exactly
the kind of unsupported manufacturing claim that the whole strategy in
[01-brand-strategy.md](01-brand-strategy.md) §1.2 exists to avoid, and a wholesale buyer
visiting the factory would discover it immediately.

[20-production-page-specification.md](20-production-page-specification.md) §20.2 specifies both
hide tracks so either answer builds without redesign. Until it is answered, the production page
ships **wool-only**, which is also the correct launch emphasis.

### Wooden products

Architecture prepared, category not launched. `ProductStatus.DRAFT` plus an inactive category
node is sufficient. Do not build a partially-populated wooden category into the navigation.

### Locale note

The `de` locale's ethical objection to fur/hide flagged in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.3 still applies to the sheepskin and
leather categories. Wool-led branding actually helps here: the German entry point is wool, and
sheepskin needs the by-product framing. Decision still open.

---

## D4 — Stock: RESOLVED. All listed categories are real inventory at launch.

Confirmed in stock and required in the catalogue from day one: гуні, камізельки, вовняна пряжа,
ровниця, пояси, накидки, вовняні ковдри, ліжники, подушки, носки, капці, вовна для рукоділля.

[00-assumptions.md](00-assumptions.md) B1 is resolved. Nothing is a phantom category except
wood.

### Mandatory per-product capabilities — confirmed requirements

Every category must support all of the following. This is now a hard requirement, not a
design preference.

| Requirement | Schema location in [25-database-schema.md](25-database-schema.md) |
|---|---|
| Multiple colours | `OptionType` key `color` + `OptionValue.swatchMediaId` |
| Multiple sizes | `OptionType` key `size`, `OptionDisplay.SIZE_GRID` |
| Stock quantity | `ProductVariant.stockQty`, `lowStockAt` |
| SKU / article number | `Product.sku`, `ProductVariant.sku` |
| Product variants | `ProductVariant` + `VariantOptionValue` |
| Detailed composition | `ProductAttributeValue` against a `composition` definition |
| Care instructions | `ProductAttributeValue` + linked care-guide article |
| Delivery time | `Product.madeToOrderDays` + carrier estimate at PDP |
| Availability status | `ProductVariant.stockQty` + `Product.inStock` + made-to-order state |

The existing schema already covers all nine. No model changes are required beyond the
`ProductOrigin` addition in D3.

### Yarn, rovnytsia and raw wool need special handling

Three of the confirmed categories are **sold by weight, not by unit** — вовняна пряжа, ровниця,
вовна для рукоділля. `PricingUnit.KILOGRAM` and `PricingUnit.SKEIN` already exist in the schema,
but the consequences reach further than pricing:

- The PDP buy box needs a weight/quantity input, not a simple stepper.
- Cart line maths differ (price × weight, not price × count).
- Shipping weight is the purchased quantity itself, which makes the delivery estimate more
  accurate here than anywhere else in the catalogue.
- The needleworker audience buys by **колір + метраж + товщина**, and typically buys multiple
  skeins from the same dye lot. **Dye-lot tracking is a real requirement for this audience** and
  is currently absent from the schema. Flagged as an open question below.

---

## D5 — Downstream document impact

| Document | Change required |
|---|---|
| [01-brand-strategy.md](01-brand-strategy.md) | §1.7 mascot risk closed, now brand-core. Add the own-manufacture vs partner positioning rule to §1.8 and §1.9. |
| [00-existing-site-audit.md](00-existing-site-audit.md) | Demote to adjacent-business reference. §0.2, §0.3, §0.4 conflicts dissolved. §0.8 migration plan revoked. |
| [00-assumptions.md](00-assumptions.md) | A1, A7, B1, F8 closed. E4 reinstated. |
| [25-database-schema.md](25-database-schema.md) | Add `ProductOrigin`, `partnerName`, `partnerRegion`. Consider a dye-lot field on `ProductVariant`. |
| 03-information-architecture, 04-sitemap | Rebuild on the D3 tree. No legacy redirect mapping. |
| 29-seo-architecture | Cold-start strategy, Google Business Profile as the primary early channel, no migration section. |
| 35-implementation-roadmap | Migration workstream removed. Content population for 12+ wool categories across 4 locales is now the critical path. GBP setup moves into Phase 1. |
| 34-animation-storyboard | Mascot promoted from optional delight to brand system. |

---

## D6 — Open questions from this round

0. **Вівчарик's own contact details and production address** — see §D2 Consequence 3. Nothing
   from the audited site carries over. This blocks Google Business Profile creation, the
   contact page, LocalBusiness schema, and the footer NAP block.
0b. **Which ФОП is the seller of record?** D1 states the original business was split into
   several. The answer names the trader on the offer contract, the returns policy, the PSP
   contract, and the German Impressum. Without it the `de` locale cannot launch legally and
   card payments cannot be onboarded anywhere.
1. **What is the domain?** Blocks SEO setup, email addresses, and brand lockup work.
2. **Who are the partner manufacturers, and may they be named?** The D3 solution depends on
   being able to name them. If they cannot be named, the fallback is a neutral
   «Відібрано нами» curation mark — weaker, but still honest.
3. **Dye lots for yarn** — does the client track them? If yes it becomes a variant-level field
   and a PDP disclosure. Needleworkers will ask, and getting this wrong generates returns.
4. **Does a Google Business Profile already exist** for this business, or does it need creating
   from scratch? Creating and verifying one takes weeks and must start in Phase 0.
5. **Sheepskin and leather in the `de` locale** — sell, or omit?
6. **Approximate SKU count for the new catalogue.** The 1,000+ figure came from the adjacent
   business and no longer applies. This number determines the search and faceting architecture.
7. **Photography** — [00-assumptions.md](00-assumptions.md) E1 remains the largest open
   BLOCKER. With no migration source, there is now *no* existing image library to fall back on.
   This is more urgent than it was an hour ago.
8. Is there also a separate Prom.ua storefront distinct from the WordPress site that was
   audited? The client referred to "the Prom.ua website" but the audited site is WordPress.
