# Client Decisions — Round 2

Received 2026-09-28. **Highest-authority document in the blueprint**, superseding
[00-client-decisions.md](00-client-decisions.md) where they overlap.

Authority order:

```
00-client-decisions-2.md    ← this file
00-client-decisions.md
00-existing-site-audit.md   ← adjacent business, reference only
00-assumptions.md
everything else
```

---

## E1 — Legal entity and people: RESOLVED

| Role | Person |
|---|---|
| **Seller of record** (ФОП on the offer contract, PSP contract, invoices, Impressum) | **ГОНДУРАК ЛЮБОВ ЮРІЇВНА** |
| Owner of production | **ГОНДУРАК ІВАН ФЕДОРОВИЧ** |
| Deputy owner of production | **ГОНДУРАК ЛЮБОВ ЮРІЇВНА** |

`{{LEGAL_ENTITY_NAME}}` → `ФОП Гондурак Любов Юріївна`. `{{LEGAL_ID}}` (ЄДРПОУ/РНОКПП) is still
required for the offer contract and the German Impressum — request it directly.

This unblocks: WayForPay onboarding, договір оферти, returns policy, and the `de`/`pl` legal
page set.

**Consequence for the admin panel (answers Q11).** The client says Administrator may equal Owner
*if* the Administrator is Любов. The cleaner solution is not to weaken the Administrator role —
it is to **give Любов the Owner role outright**. Two Owner accounts (Іван, Любов), and the
Administrator role keeps its three-permission restriction for everyone else. Weakening
Administrator globally would hand payout control and audit-export rights to every future
employee who holds that role. [24-employee-permission-architecture.md](24-employee-permission-architecture.md)
§24.5 stands unchanged; the seed creates two Owners.

---

## E2 — Location: RESOLVED, and it is the single strongest brand asset on this project

**вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644**

Note this is **not** Вербовець. Яворів is a different village in the same raion, roughly 20 km
away, which also cleanly separates Вівчарик's NAP from the adjacent business's.

### Why this changes the brand strategy

Яворів is not merely "in the Carpathians". It is **the recognised centre of Hutsul lizhnyk
weaving** — commonly called «столиця ліжникарства». The village holds a dedicated
[Музей ліжникарства](https://kosiv.life/lizhnykarstva/), hosts annual lizhnyk-weaving plein
airs attended by art historians from Kyiv, Lviv and Ivano-Frankivsk, and is the home village of
the **Шкрібляк and Корпанюк** families — the most celebrated dynasties in Hutsul woodcarving.

Three strategic consequences:

1. **"Карпатський" is a weak claim; "яворівський" is a strong one.** Thousands of sellers say
   Carpathian. Very few can say *Yavoriv*, and in this category the word carries the same weight
   that a Champagne appellation does. [01-brand-strategy.md](01-brand-strategy.md) §1.4 already
   demands specificity of place over generic national symbolism — this is the specific place,
   and it should be named in the tagline, the hero, the meta titles and the structured data.
2. **The woodcarving lineage retroactively justifies the wooden-products category.** What looked
   like an unrelated future line is in fact the second craft of the same village. When
   [00-client-decisions.md](00-client-decisions.md) D3's ДЕРЕВО category launches, it launches
   with a genuine provenance story rather than as a gift-shop bolt-on.
3. **The museum and the plein airs are link-building and local-SEO assets** for a cold-start
   domain — cultural institutions, tourism sites and craft associations are exactly the kind of
   locally relevant referrers that a new domain cannot otherwise earn.

**Verification required before publishing:** Hutsul lizhnyk weaving is widely described as
inscribed on Ukraine's national register of intangible cultural heritage. Confirm the exact
status and wording before any claim referencing it appears on the site, and **never imply that
Вівчарик itself holds a heritage designation** — the craft may be listed; a company is not.

### Copy direction

> «Ліжники з Яворова — села, яке називають столицею ліжникарства. Понад 30 років.»

`{{FACTORY_ADDRESS}}` → resolved. `{{POSTAL_CODE}}` → `78644`.

---

## E3 — Contacts: RESOLVED, with one gap

| Field | Value |
|---|---|
| Phone — Іван | `+380679973450` |
| Phone — Любов | `+380679604769` |
| Social media | **None. The owners do not run any.** |
| Email | Still missing. Must be created at `@{{DOMAIN}}` once the domain is chosen |

### Consequence — the cold start is harder than assumed

[00-client-decisions.md](00-client-decisions.md) §D2 Consequence 2 named Instagram as a primary
launch channel. **That channel does not exist.** The realistic launch traffic is now:

1. Google Business Profile (exists — see E4)
2. Existing offline and word-of-mouth customers
3. Long-tail editorial content, which takes months
4. Yavoriv's tourist footfall, if the workshop is visitable

That is a thin set. **Recommendation:** create an Instagram account before launch, even if it is
updated rarely. For a craft manufacturer, Instagram is where the product photography does its
work, and it is the cheapest proof-of-life signal a new domain can have. Also worth noting that
the adjacent business already runs `@fabryka_shkur` successfully, so the capability exists
within the family.

Recorded as a recommendation, not a decision. `{{INSTAGRAM}}` remains unresolved.

### Opening hours — handle as variable, not fixed

The client states hours are flexible and may differ day to day (one day 11:00–19:00, another
different), and that Google Maps is the live source.

**Design rule:** do not hard-code `openingHours` in `LocalBusiness` structured data. Publishing
hours that are wrong twice a week is worse than publishing none — it produces "permanently
closed" style user reports and erodes the profile's trust signals.

Instead:
- The contact page states «Графік гнучкий — телефонуйте перед візитом» with both numbers
  prominent, and links to the Google Business Profile as the authoritative source.
- `LocalBusiness` JSON-LD omits `openingHours` and carries `telephone`, `address`, `geo` and
  `url` only.
- If hours later stabilise, add them in one place — see
  [29-seo-architecture.md](29-seo-architecture.md).

A visitable workshop in a tourist village is a genuine asset; a wrong opening time turns it into
a complaint.

---

## E4 — Google Business Profile: EXISTS

A profile is live. The share link provided could not be resolved automatically (Google returned
HTTP 429), so the following must be confirmed manually before launch:

| Check | Why |
|---|---|
| Business name matches «Вівчарик» exactly as it will appear on the site | NAP consistency is the single largest local-ranking factor |
| Address matches вул. Петруші, Яворів, 78644 **byte for byte** with the footer and JSON-LD | A formatting mismatch is treated as a different business |
| Primary category is a manufacturing category, not "Shop" | Category choice drives which queries the profile surfaces for |
| Website field points at `{{DOMAIN}}` once it exists | This is the profile's main job |
| Phone matches the number in the footer | — |
| Photos are of Yavoriv production, not the adjacent business | — |
| Ownership is verified and under the client's control | An unverified or third-party-claimed profile cannot be edited |

GBP is this launch's primary channel. It moves to the top of Phase 0 in
[35-implementation-roadmap.md](35-implementation-roadmap.md).

---

## E5 — Content and photography: MAY BE REUSED, with a hard constraint

The client permits products and photographs to be taken from the adjacent business's site, with
categories and filters rebuilt to the structure in
[00-client-decisions.md](00-client-decisions.md) §D3.

This substantially de-risks [00-assumptions.md](00-assumptions.md) **E1**, which was the largest
open blocker. But it introduces a new one, and it is serious.

### The duplicate-content problem

`fabryka-shkur.com.ua` **stays online**. Copying its product text onto a new domain creates two
live sites with identical content, competing for the same queries. The new domain — with zero
authority — loses that competition every time. This is not a theoretical penalty; it is a
ranking outcome.

**Binding rules:**

| Asset | Rule |
|---|---|
| Product descriptions | **Rewrite every one.** No sentence copied verbatim. This is not optional and it is a real content workload — scope it in the roadmap. |
| Product names | Rename where they overlap. Distinct names are also better brand assets («Ліжник Яворівський» beats a shared generic name). |
| Category and filter text | New, per the D3 structure |
| Blog and care-guide articles | **Do not copy.** Write fresh, per [22-blog-specification.md](22-blog-specification.md) §22.3 |
| Photographs | Reuse permitted. Re-crop and re-grade to the art direction in [01-brand-strategy.md](01-brand-strategy.md) §1.6, strip EXIF, rename files semantically, and author new `alt` text. Identical images across two domains are a weaker signal than unique ones but are not penalised the way duplicate text is. |
| Reviews | **Do not copy.** They were given to a different seller. Fabricated or transplanted reviews are a structured-data violation and a trust failure. |

### Photography still needs a new shoot — for a different reason

The reused library solves *catalogue coverage*. It does not solve the strategy. The entire
positioning rests on showing **Yavoriv production** ([01-brand-strategy.md](01-brand-strategy.md)
§1.8), and the adjacent business's photographs document a different workshop in a different
village.

So the shoot is descoped, not cancelled:

| Was | Now |
|---|---|
| Full catalogue shoot, every SKU | Not needed — reuse covers it |
| Factory, process, machinery, people, place | **Still required.** Homepage hero, production page, about page. This is the brand. |

That is a much smaller and cheaper shoot: one or two days in Yavoriv rather than a full
catalogue production.

### SKU count

Answered as "fine, let it be" — meaning the catalogue size follows from what is migrated.
`{{SKU_COUNT}}` therefore resolves to the adjacent site's catalogue scope, in the order of
several hundred to roughly a thousand. The faceting architecture in
[29-seo-architecture.md](29-seo-architecture.md) and
[07-page-wireframes.md](07-page-wireframes.md) is already designed to hold across that range, so
no rework is needed. Confirm the exact figure when the export is taken.

---

## E6 — Full production cycle: CONFIRMED

> «Так, Вівчарик самостійно проводить весь процес від сировини до виробів.»

This closes the tanning question left open in [00-client-decisions.md](00-client-decisions.md)
§D3. All own-manufacture categories — wool, sheepskin, leather — are `OWN_MANUFACTURE`, and
[20-production-page-specification.md](20-production-page-specification.md) may specify both the
wool pipeline and the hide pipeline as in-house.

**One self-policing constraint.** Per [01-brand-strategy.md](01-brand-strategy.md) §1.8, a
manufacturing claim is only as strong as the evidence shown beside it. The production page must
therefore carry photographs of the **actual stages being claimed** — including tanning, if
tanning is claimed. If a stage cannot be photographed, it should not be asserted. This keeps the
page honest without requiring anyone to audit the claim, and it folds the requirement into the
Yavoriv shoot that E5 already schedules.

Remove the «бельгійська технологія» framing entirely — it belonged to the adjacent business and
must not be inherited.

---

## E7 — Partner products cannot be named

> Q: Can the partner manufacturers be named? — **«Ні.»**

This weakens the §D3 solution, which relied on naming the partner to convert the disclosure into
a curation credential. The fallback applies.

**Revised treatment:**

| Field | Behaviour |
|---|---|
| `Product.origin` | Unchanged — `OWN_MANUFACTURE` / `PARTNER_MANUFACTURE` |
| `Product.partnerName` | **Stays null.** Not rendered. |
| `Product.partnerRegion` | Use where known — «Косівщина», «Гуцульщина». Regional provenance without a company name is still meaningful and still honest. |
| Public label | «Відібрано Вівчариком» + «Виготовлено карпатським майстром» where the region is known, «Виготовлено іншим виробником» where it is not |
| JSON-LD | `manufacturer` **omitted** for partner goods rather than set to Вівчарик. Omission is honest; misattribution is not. `brand` may remain Вівчарик only if the goods are sold under the Вівчарик name — confirm this. |

**The labelling rule from [01-brand-strategy.md](01-brand-strategy.md) §1.7b still holds
absolutely.** Not being able to name the partner is a reason to be *more* explicit that the item
is not own-made, not less. The mark stays at equal visual weight to «Власне виробництво», and
the origin facet stays pinned at the top of the filter panel.

**Open:** are partner goods sold under the Вівчарик brand name, or under no brand? This changes
the `brand` property and the product-title convention.

---

## E8 — Dye lots: NOT TRACKED

> «Не знаю.»

Treated as *not tracked*, which is the safe reading.

- `ProductVariant.dyeLot` remains in the schema, **nullable and unused**. No admin field, no
  facet, no PDP display. Removing it would be premature; exposing it would imply a guarantee
  that cannot be honoured.
- The yarn PDP carries an honest note: «Відтінок може незначно відрізнятися між партіями. Для
  великого проєкту радимо замовити всю кількість одразу.»
- That sentence is not a disclaimer — it is useful advice that also protects against returns,
  and it reads as expertise rather than as a hedge.

Revisit if returns data shows lot mismatch becoming a real cost.

---

## E9 — Domain: DEFERRED to deployment

Chosen at VPS setup, near the end of the build. Acceptable for most work, but three things
genuinely block on it and must not be forgotten:

1. **Branded email** (`{{BRANDED_EMAIL}}`) — currently there is no business email at all
2. **Google Business Profile website field** — the profile's primary job
3. **Absolute URLs** in structured data, sitemap, `sameAs`, canonicals and OG tags

Everything else can be built against `{{DOMAIN}}` and resolved by a single configuration value,
provided the `{{TOKEN}}` CI scan from [00-README.md](00-README.md) is in place. It is.

---

## E10 — Payment: WayForPay

`{{PSP}}` → **WayForPay**.

### Required verification before integration — do not build from memory

| # | Must confirm from WayForPay's current official documentation |
|---|---|
| V6 | Integration mode available to this merchant: hosted redirect page, embedded widget, or direct API. **This materially changes the checkout step design** in [18-checkout-specification.md](18-checkout-specification.md). |
| V7 | Signature algorithm and the exact field order used to compute the request and response HMAC |
| V8 | Webhook (service URL) payload shape, the expected acknowledgement response, and retry behaviour |
| V9 | Refund and partial-refund API support |
| V10 | Whether a ФОП on the simplified tax system can contract, and what documents onboarding requires |
| V11 | Supported currencies and whether non-UAH settlement is possible for the EU locales (see E11) |

All six are recorded as Phase 0 tasks. Nothing about WayForPay's API should be written into code
or into [26-api-architecture.md](26-api-architecture.md) until they are read from the current
docs — PSP integration details drift, and a guessed signature format fails silently in
production.

### Retained for the checkout design

The recommendation in [18-checkout-specification.md](18-checkout-specification.md) §18.9 stands:
card via WayForPay as primary, COD prominent, IBAN transfer de-emphasised for B2B, 10%
prepayment narrowed to made-to-order and high-value orders, and **no manual personal-card
transfer path ever**.

---

## E11 — International orders: ACCEPTED

> «Якщо іноземці хочуть замовити з України, то так, прошу.»

The `en`, `pl` and `de` locales are **transactional**, not informational.
[00-assumptions.md](00-assumptions.md) C5 is resolved in favour of selling abroad.

Consequences that now need real answers rather than design:

| Item | Status |
|---|---|
| International carrier | `{{INTL_CARRIER}}` — Nova Poshta Global and Ukrposhta International are the practical options. Unresolved. |
| Settlement currency | Confirm with V11 whether WayForPay settles non-UAH. If not, prices display converted but charge in UAH, and the checkout must say so plainly. |
| Customs, duties, incoterms | Who pays? DDU/DAP is the default reality for small Ukrainian shippers and must be disclosed before payment, not after. |
| EU consumer law | The `de` and `pl` locales trigger the 14-day right of withdrawal, the model withdrawal form, and a mandatory Impressum for `de`. See [32-security-architecture.md](32-security-architecture.md) and the legal page set in [04-sitemap.md](04-sitemap.md). |
| Fur and leather into the EU | Sheepskin and leather goods face species-declaration and, for some materials, CITES documentation. Wool does not. **Recommendation: launch the `de` and `pl` locales wool-only**, and enable hide categories for EU destinations only after the paperwork is confirmed. This also sidesteps the German market's ethical sensitivity flagged earlier. |
| COD | Not available internationally. Card only outside Ukraine. |

---

## E12 — Guest checkout, permanently

> «Сайт назавжди працює в режимі гостьових покупок.»

No customer accounts, ever. This is a genuine simplification and it removes a meaningful amount
of surface area, cost and risk.

### Removed from scope

- Customer registration, login, password reset, email verification
- Account pages: profile, saved addresses, order history, saved payment methods
- The wishlist merge-on-login flow from [25-database-schema.md](25-database-schema.md) §25.8b
- Customer session management, customer credential-stuffing exposure, and customer password
  storage entirely — which also shrinks the GDPR and security surface materially

### Retained, adjusted

| Concern | Design |
|---|---|
| `Customer` model | **Kept**, but as an order-derived record, never an authenticated identity. `passwordHash` is removed from the model. It exists so repeat buyers can be recognised for support and analytics. |
| Order tracking | Via `Order.guestToken` in the confirmation email, plus a lookup form taking order number + email. Already specified. |
| Wishlist | `localStorage` only, device-local, no server record. `WishlistItem` is **removed from the schema**. State it plainly in the UI: «Збережено на цьому пристрої». |
| Repeat purchase convenience | Address prefill from a first-party cookie on the same device. No account required, no server-side profile. |
| Marketing consent | Captured at checkout as a checkbox writing to `NewsletterSubscriber`, independent of any account concept |

**Staff authentication is unaffected.** [24-employee-permission-architecture.md](24-employee-permission-architecture.md)
stands in full.

---

## E13 — Open items after this round

1. `{{LEGAL_ID}}` — ЄДРПОУ / РНОКПП for ФОП Гондурак Л. Ю. Required for the offer contract and
   the German Impressum.
2. `{{BRANDED_EMAIL}}` — no business email exists yet. Follows the domain.
3. Verify the Google Business Profile against the E4 checklist, and confirm ownership.
4. Confirm the exact status and correct wording of any Hutsul-lizhnyk heritage reference (E2).
5. Are partner goods sold under the Вівчарик name or unbranded? (E7)
6. `{{INTL_CARRIER}}` and the customs/duties position (E11).
7. WayForPay V6–V11 verification (E10).
8. Confirm the exact SKU count once the catalogue export is taken (E5).
9. Decide whether to create an Instagram account before launch (E3) — recommended.
10. `{{DOMAIN}}` (E9).
