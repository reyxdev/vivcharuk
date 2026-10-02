# Assumption Register

> **Superseded in part — read [00-client-decisions.md](00-client-decisions.md) first.**
>
> Authority order: `00-client-decisions.md` > `00-existing-site-audit.md` > this file.
>
> Closed by client decision: **A1** (30+ years confirmed legitimate, dated to ~1991–1992
> manufacturing continuity), **A7** (no certifications — confirmed), **B1** (all product
> categories are real stock; only wood is future), **F8** (the sheep mascot is mandated brand
> core). **E4 is reinstated** — there is no migration, because the audited site is a separate
> family business.
>
> Still open and now more urgent: **E1** (photography — there is no fallback image library at
> all), **B6** (catalogue size is unknown again), **C2** (PSP selection), plus the new domain
> decision. See [00-client-decisions.md](00-client-decisions.md) §D6.

The client interview (168 Q&A) was not supplied. Every business fact below is an assumption
made to unblock design and architecture. Each is numbered, scoped, and carries a blast radius
so the cost of being wrong is visible before build starts.

**Rule:** no assumption in this register may be presented to a site visitor as fact until the
client confirms it. Claims about company age, production capacity, and certification are
legally sensitive in advertising and are the highest-risk items here.

## Severity key

- **BLOCKER** — build cannot start on the affected module until resolved.
- **HIGH** — wrong answer forces rework of a page or schema table.
- **MEDIUM** — wrong answer forces content or copy rework only.
- **LOW** — cosmetic or easily reversed.

---

## A. Company facts (appear in public copy — highest legal risk)

| # | Assumption | Token | Severity | Blast radius |
|---|---|---|---|---|
| A1 | The factory has ~30 years of continuous operation, founded {{FOUNDING_YEAR}} (assumed 1995). | `{{FOUNDING_YEAR}}` | HIGH | Hero, About timeline, every trust badge, Organization schema |
| A2 | The business is family-owned across {{GENERATIONS}} generations (assumed 2). | `{{GENERATIONS}}` | MEDIUM | About page narrative, brand story |
| A3 | Production site is in {{FACTORY_CITY}}, {{FACTORY_OBLAST}}, Ukrainian Carpathians. | `{{FACTORY_CITY}}` | HIGH | LocalBusiness schema, Contact page, map, local SEO |
| A4 | Full cycle means the factory performs: washing, drying, carding/combing, spinning, weaving/felting, sewing, finishing — in-house. | — | BLOCKER | Production page is built entirely around these 7 stages |
| A5 | Raw wool is sourced from {{WOOL_SOURCE}} (assumed: Carpathian regional sheep farms, partially own flock). | `{{WOOL_SOURCE}}` | HIGH | Sustainability claims, traceability storytelling, GEO entity content |
| A6 | Employee count is {{EMPLOYEE_COUNT}}. | `{{EMPLOYEE_COUNT}}` | LOW | About page stat strip |
| A7 | No third-party certification (OEKO-TEX, GOTS, Woolmark) is currently held. | `{{CERTIFICATIONS}}` | HIGH | If certifications exist they become a primary trust asset and change the hero |

**Do not publish A1, A3, A5, or A7 without written client confirmation.** Unsupported origin
and "eco" claims are enforceable under Ukrainian advertising law and EU consumer law for the
`de`/`pl` locales.

---

## B. Catalogue and merchandising

| # | Assumption | Token | Severity | Blast radius |
|---|---|---|---|---|
| B1 | 13 product families as listed in the brief; all are sellable online except "future wooden handmade products", which is a roadmap category. | — | BLOCKER | Category tree, nav, IA |
| B2 | Products carry variants across up to 4 axes: size, colour, wool composition, weight/density. Not all axes apply to all families. | — | BLOCKER | Product schema, variant model, PDP |
| B3 | Yarn and rovnytsia are sold by weight (skein/kg), not by unit. | — | HIGH | Pricing model, cart maths, variant unit field |
| B4 | Lizhnyks and gunias include genuinely one-of-one handmade items with stock quantity of exactly 1. | — | HIGH | Stock model, urgency UI, "unique piece" badge |
| B5 | SKU format is `{{SKU_PATTERN}}` (assumed `VCH-<FAMILY>-<VARIANT>-<NNN>`). | `{{SKU_PATTERN}}` | MEDIUM | Admin bulk import, warehouse workflow |
| B6 | Approximate live catalogue size at launch: {{SKU_COUNT}} SKUs (assumed 150–400). | `{{SKU_COUNT}}` | MEDIUM | Whether filters and faceted search need a search engine or can stay in Postgres |
| B7 | Made-to-order exists for some sizes, with a stated lead time of {{MADE_TO_ORDER_DAYS}} days. | `{{MADE_TO_ORDER_DAYS}}` | HIGH | PDP availability states, checkout messaging, order status machine |

---

## C. Pricing, payment, fulfilment

| # | Assumption | Token | Severity | Blast radius |
|---|---|---|---|---|
| C1 | Base currency is UAH. `en`/`pl`/`de` locales display converted prices for information only; settlement is in UAH. | — | HIGH | Money handling, schema, checkout copy |
| C2 | Card payments run through a Ukrainian acquirer — LiqPay, Fondy, or WayForPay. Selection pending. | `{{PSP}}` | BLOCKER | Checkout integration, PCI scope, webhook design |
| C3 | Cash on delivery is offered via Nova Poshta's COD service. | — | HIGH | Order state machine, fraud exposure, COD fee display |
| C4 | Domestic shipping is Nova Poshta (branch, parcel locker, courier) and Ukrposhta. | — | HIGH | Checkout address widget, rate calculation |
| C5 | International shipping is offered to EU. Carrier and incoterms undecided. | `{{INTL_CARRIER}}` | HIGH | Whether `en`/`pl`/`de` are transactional or informational locales |
| C6 | **CONFIRMED** round 8 §L5: single tax, not a VAT payer. VAT status: {{VAT_STATUS}} (assumed single-tax payer, not VAT-registered). | `{{VAT_STATUS}}` | HIGH | Price display rules, invoices, EU distance-selling obligations |
| C7 | Free shipping threshold is {{FREE_SHIPPING_THRESHOLD}} UAH. | `{{FREE_SHIPPING_THRESHOLD}}` | MEDIUM | Cart progress bar, AOV mechanics |
| C8 | **CONFIRMED** round 8 §L4: 14 days. Returns window is {{RETURN_DAYS}} days (assumed 14, the Ukrainian statutory minimum for distance selling). | `{{RETURN_DAYS}}` | MEDIUM | Policy pages, PDP trust row, FAQ schema |

---

## D. Wholesale

| # | Assumption | Token | Severity | Blast radius |
|---|---|---|---|---|
| D1 | Wholesale is enquiry-led, not self-serve. No logged-in B2B pricing portal at launch. | — | BLOCKER | Wholesale page is a landing page plus a form, not an app |
| D2 | **CONFIRMED** round 8 §L14: 5 pieces; −10% from 5, −20% from 25; no value minimum. MOQ is {{MOQ}} units or {{MOQ_VALUE}} UAH per order. | `{{MOQ}}` | HIGH | Wholesale page headline offer, lead qualification form |
| D3 | Wholesale discount band is {{WHOLESALE_DISCOUNT}}. | `{{WHOLESALE_DISCOUNT}}` | MEDIUM | Page copy only |
| D4 | Private-label and OEM production is offered. | — | HIGH | A named section of the wholesale page and a distinct lead type |
| D5 | Monthly production capacity is {{CAPACITY_MONTHLY}}. | `{{CAPACITY_MONTHLY}}` | MEDIUM | Wholesale credibility block, GEO content |

---

## E. Operations and content

| # | Assumption | Token | Severity | Blast radius |
|---|---|---|---|---|
| E1 | The client can supply, or fund, a professional photo and video shoot at the factory. | — | BLOCKER | The entire design thesis is photography-led. Without this the design must be rethought, not merely degraded. |
| E2 | Staff available to run the admin panel: 1 owner, 1–2 managers, 1 content person. | — | MEDIUM | Admin complexity ceiling, role defaults |
| E3 | No existing ERP or 1C system requires integration at launch. | — | HIGH | Whether the admin panel is the system of record or a mirror |
| E4 | No existing customer or order data needs migrating. | — | MEDIUM | Phase 0 scope |
| E5 | Existing social presence and review history exists on {{SOCIAL_PROFILES}} and can seed testimonials. | `{{SOCIAL_PROFILES}}` | MEDIUM | Reviews section at launch has content or is empty |
| E6 | Blog is published at roughly {{BLOG_CADENCE}} articles per month. | `{{BLOG_CADENCE}}` | LOW | Editorial calendar, scheduling feature priority |

---

## F. Explicit non-assumptions — open questions requiring an answer

These are not assumed. They are unanswered and must be asked directly.

1. Is there an existing domain, and does it carry SEO history worth preserving with redirects?
2. Is there an existing site to migrate from, and what are its top organic landing pages?
3. Who owns the brand's existing photography, and is it licensed for commercial web use?
4. Are there named competitors the client wants to be positioned against?
5. What is the realistic target for online orders per month in year one? This determines
   whether the stack is over- or under-built.
6. Is there a physical shop or factory visit offering? This changes the Contact page from a
   form into a destination page with local SEO value.
7. Does the client want a customer account system at all, or is guest checkout sufficient
   permanently?
8. Is the sheep mascot acceptable to the client? It is a strong commitment and is difficult
   to retract once it becomes brand identity.

## Verification tasks (technical, not client-facing)

| # | Claim to verify before relying on it |
|---|---|
| V1 | `e-Ukraine` and `Kyiv*Type Serif` glyph coverage for Polish (ą ć ę ł ń ó ś ź ż) and German (ä ö ü ß) — see [10-typography.md](10-typography.md). If coverage is incomplete the body font must change. |
| V2 | Nova Poshta API rate limits and whether address autocomplete can be called client-side without exposing the API key. |
| V3 | Chosen PSP's support for recurring webhooks, refunds, and partial refunds. |
| V4 | Cloudinary free/paid tier transformation limits against expected image volume. |
| V5 | Whether the chosen PSP requires a redirect flow (affects checkout step design materially). |
