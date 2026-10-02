# 04 — Sitemap

Complete route inventory. Structure and labelling from
[03-information-architecture.md](03-information-architecture.md); data shapes from
[25-database-schema.md](25-database-schema.md); scope and business facts from
[00-client-decisions-3.md](00-client-decisions-3.md), the highest-authority document in the
blueprint, then [00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md) where they do not overlap.

**Round-2 rulings that change this route set:** all `/account/*` routes are **deleted** — guest
checkout is permanent (§E12); `en`/`pl`/`de` become transactional, so cart, checkout and order
routes exist in all four locales (§E11); the EU legal page set is now mandatory rather than
conditional, with the Impressum naming **ФОП Гондурак Любов Юріївна** (§E1, §E11); the workshop
address is **Яворів**, not Вербовець (§E2); Instagram does not exist (§E3); and catalogue content
is migrated but must be **rewritten**, not copied (§E5, §4.4b).

**Round-3 rulings that change this route set**
([00-client-decisions-3.md](00-client-decisions-3.md)):

| Ruling | Effect on the route inventory |
|---|---|
| The Яворів site is a **shop as well as a factory** (§F2) | `/{contacts-seg}` is confirmed and strengthened as a primary landing route, with retail intent as well as NAP duty. §4.1, §4.2, §4.4 |
| International shipping is **quoted per order**, not calculated (§F4) | **One new route:** `{order-seg}/{number}/{pay-seg}` — the deferred payment screen for a quoted order. §4.3 |
| Buyer pays shipping **and all duties**, all destinations — effectively DAP (§F4) | `/{locale}/dostavka-i-oplata`, `/de/zahlung-und-versand` and the `pl` equivalent all carry it explicitly, and it must also be shown before payment. §4.5 |
| `{{LEGAL_ID}}` exists and will be supplied (§F1) | It gates exactly three deliverables — the WayForPay contract, the offer contract, and `/de/impressum`. It is **no longer treated as a general blocker**. §4.5 |
| Transactional mail cannot send from `@gmail.com` (§F5) | Not a route, but a Phase-0 dependency of every route that sends mail. §4.11 |
| Tagline stays **«в Карпатах»** (§F6) | No route change. Яворів stays in meta titles where the query is place-specific, and in the §4.4 article set |

## 4.1 The launch condition: new domain, cold start

**Вівчарик launches on a new, independent domain** ([00-client-decisions.md](00-client-decisions.md)
D2). It is not a rebrand. The site audited in
[00-existing-site-audit.md](00-existing-site-audit.md) belongs to the client's wife, is a separate
business, and stays online. Three consequences govern every route below.

| Consequence | What it changes in this document |
|---|---|
| **No URL migration.** No legacy URLs, no inherited rankings. Catalogue *content* may be copied from the adjacent site, but the URLs are new. | There is **no 301 redirect map**. The `Redirect` table exists solely for internal slug changes ([03-information-architecture.md](03-information-architecture.md) §3.5.4 rule 7). |
| **No SEO history.** Zero domain authority, zero backlinks, no Search Console baseline. | Organic traffic will be near zero for 3–6 months. The route set must be optimised for *earning* authority, not *preserving* it. §4.4. |
| **Primary early channel is Google Business Profile, then the offline customer base.** Instagram **does not exist** ([00-client-decisions-2.md](00-client-decisions-2.md) §E3). | `/kontakty` is not a utility page, it is a **primary landing page**. Route priority and rendering mode follow. The launch traffic set is thinner than the previous revision assumed, which raises the value of §4.4's editorial routes rather than lowering it. |
| **The address is a shop, not only a workshop** ([00-client-decisions-3.md](00-client-decisions-3.md) §F2). | Physical footfall in a craft-tourism village becomes a **launch channel that does not depend on search at all** — the only one in the set. `/{contacts-seg}` therefore has to answer a retail question («can I come and buy one») as well as a NAP question, and its content spec changes accordingly ([07-page-wireframes.md](07-page-wireframes.md) §7.15). Its rendering mode and route position do not change; what changes is that it now carries real query intent of its own rather than only mirroring the profile. |

`{{DOMAIN}}` is chosen — `vivcharyk.shop` ([00-client-decisions-7.md](00-client-decisions-7.md) K1) — but not yet registered, and until then blocks brand lockup, email addresses, Google Business Profile
verification, and analytics setup ([00-client-decisions.md](00-client-decisions.md) D6.1). Every
path in this document is host-relative, so the decision changes nothing structural — but it delays
the two items with the longest lead times, GBP verification and DNS/email, and those belong in
Phase 0.

**Prom.ua branding must not appear anywhere in this route set**
([00-client-decisions.md](00-client-decisions.md) D2).

---

## 4.2 Rendering modes, and what they mean on this stack

The stack is React + Vite, not a framework with built-in incremental regeneration. These four modes
are explicit engineering positions, not framework features.

| Mode | Implementation on Vite | Cache | Use |
|---|---|---|---|
| **SSG** | Prerendered at build to static HTML | Immutable, long `max-age` | Legal, about, production, wholesale — content changes on deploy |
| **ISR** | Node SSR render cached at the CDN with `s-maxage` + `stale-while-revalidate`, purged by cache tag when the entity is saved | Tag-purged | Products, categories, collections, articles |
| **SSR** | Rendered per request, `Cache-Control: private, no-store` | None | Cart, checkout, order status, search, admin |
| **CSR** | Client island inside an SSR/ISR shell | — | Filter interactions, gallery lightbox, mascot |

**Why ISR rather than full SSG for the catalogue.** `{{SKU_COUNT}}` now resolves to whatever the
catalogue migration yields — several hundred to roughly a thousand SKUs
([00-client-decisions-2.md](00-client-decisions-2.md) §E5) — and stock accuracy is trust-critical
for one-of-one items ([00-assumptions.md](00-assumptions.md) B4). A full static rebuild per price
or stock change is an unacceptable deploy cadence at that size, and it worsens as the catalogue
grows. Tag-purged CDN caching gives static-like latency with per-entity invalidation. The cost is a
Node process on the critical path; at roughly a thousand products across four locales that is the
right trade.

**Why the cart and checkout are SSR and never cached.** They contain per-session state and money.
No cache policy short of `no-store` is worth debugging on a payment page.

**Why `/kontakty` is SSG and not ISR.** It is the Google Business Profile landing target and must be
the fastest page on the site on a mobile connection in a mountain valley. Its content changes about
twice a year.

**SSG survives the promotion to a destination page, and the map is the reason it might not have.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F2 adds directions, a map, and a description
of what is on display to this route. None of that is dynamic: the address does not move and the
directions do not change. The map is a **static image until clicked**, with the interactive embed
loaded only on interaction, so no third-party script runs on first paint and the SSG guarantee
holds. A live embed on load would make the single most performance-sensitive page on the site
depend on a Google script executing over a valley connection — the exact failure this rendering
mode was chosen to avoid.

### Locale routing

All four locales are explicitly prefixed (`/uk/`, `/en/`, `/pl/`, `/de/`). `/` issues a **301 to
`/uk/`** — a permanent redirect, not content negotiation, because negotiated content at a single URL
is invisible to crawlers and unshareable by users. Full rationale at
[03-information-architecture.md](03-information-architecture.md) §3.5.1.

**All four locales are transactional**, not informational.
[00-client-decisions-2.md](00-client-decisions-2.md) §E11 accepts international orders, so
`{cart-seg}`, `{checkout-seg}` and `{order-seg}` are live under `/en/`, `/pl/` and `/de/` exactly as
under `/uk/`. This is the single largest change to the route set: an informational locale needs
translated catalogue pages, a transactional one additionally needs a translated checkout, a
translated legal set, a carrier that ships there, and a payment path that works there. §4.5 carries
the legal consequence and [05-user-flows.md](05-user-flows.md) §5.9.3 carries the flow consequence.

**The hide worlds launch `uk`/`en` only.** Овчина and Шкіра are excluded from `de` and `pl` at
launch — not because of `{{DE_FUR_POLICY}}` alone, but because sheepskin and leather entering the
EU face species-declaration and, for some materials, CITES paperwork that wool does not
([00-client-decisions-2.md](00-client-decisions-2.md) §E11). Those routes **return 404 in `de` and
`pl`** and are omitted from those sitemaps and from every hreflang cluster. They do not redirect to
the `uk` equivalent: 404 is the honest answer to "this is not sold here", and a cross-locale
redirect would leak an untranslated page into the German index. Wool-led branding makes this
cheap — the EU entry point is wool either way — and the exclusion is a three-row `Category` toggle,
not a per-product audit ([03-information-architecture.md](03-information-architecture.md) §3.2).
Enabling them later is a data change plus a sitemap regeneration, with no route work.

---

## 4.3 Storefront routes

Legend: **R** rendering · **A** auth · **I** indexable.

```
/                                        301 → /uk/

/{locale}/                               R:ISR   A:—  I:yes   Home — own manufacture only
│
├── vovna/                               R:ISR   A:—  I:yes   Wool world — leads the brand
│   ├── lizhnyky/                        R:ISR   A:—  I:yes
│   ├── kovdry/                          R:ISR   A:—  I:yes
│   ├── podushky/                        R:ISR   A:—  I:yes
│   ├── nakydky/                         R:ISR   A:—  I:yes
│   ├── huni/                            R:ISR   A:—  I:yes
│   ├── kamizelky/                       R:ISR   A:—  I:yes
│   ├── poiasy/                          R:ISR   A:—  I:yes
│   ├── shkarpetky/                      R:ISR   A:—  I:yes
│   ├── kaptsi/                          R:ISR   A:—  I:yes
│   ├── priazha/                         R:ISR   A:—  I:yes   sold by weight
│   ├── rovnytsia/                       R:ISR   A:—  I:yes   sold by weight
│   └── vovna-dlia-rukodillia/           R:ISR   A:—  I:yes   sold by weight
│       ├── ?page=N                      R:ISR   A:—  I:yes   self-canonical
│       ├── ?{facet}=…                   R:ISR   A:—  I:NO    canonical → clean family URL
│       └── {facet-slug}/                R:ISR   A:—  I:yes*  *only if §3.6.2 rule is satisfied
│
├── ovchyna/                             R:ISR   A:—  I:yes   single-tier at launch
├── shkira/                              R:ISR   A:—  I:yes   single-tier at launch
├── partnerski-vyroby/                   R:ISR   A:—  I:yes   origin-filtered destination
│                                                              (localised slug per §3.4)
│   ⚠ derevo/ exists as an inactive Category row. NO ROUTE. Not in nav, not in the sitemap.
│
├── {product-seg}/{product-slug}         R:ISR   A:—  I:yes   PDP, flat namespace
│
├── {collections-seg}/                   R:ISR   A:—  I:yes   Collections index
│   └── {collection-slug}                R:ISR   A:—  I:yes   7 at launch (§3.3.5)
├── {gifts-seg}/                         R:ISR   A:—  I:yes   Gift hub, 3-axis finder
│
├── {search-seg}?q=                      R:SSR   A:—  I:NO    logs to SearchQueryLog
│
├── {cart-seg}                           R:SSR   A:—  I:NO    all 4 locales
├── {checkout-seg}/                      R:SSR   A:—  I:NO    all 4 locales
│   ├── dostavka                         R:SSR   A:—  I:NO    Step 1 — contact + delivery
│   ├── oplata                           R:SSR   A:—  I:NO    Step 2 — payment method.
│   │                                                          Step shape depends on the
│   │                                                          WayForPay integration mode —
│   │                                                          BLOCKED ON V6 (§E10)
│   ├── pidtverdzhennia                  R:SSR   A:—  I:NO    Step 3 — review + place
│   └── zaversheno/{guestToken}          R:SSR   A:token I:NO Thank-you, token-scoped
│
├── {order-seg}/                         R:SSR   A:—  I:NO    Order lookup form
│   │                                                          (order number + email).
│   │                                                          The ONLY order-history surface;
│   │                                                          there is no account (§E12)
│   ├── {number}?t={guestToken}          R:SSR   A:token I:NO Guest status + tracking + reorder
│   └── {number}/{pay-seg}?t={guestToken}
│                                        R:SSR   A:token I:NO Deferred payment for a quoted
│                                                              international order. NEW in
│                                                              round 3 (§F4) — see below
│
├── {wholesale-seg}                      R:SSG   A:—  I:yes   4 anchored paths (§3.3.6)
│   └── #opt | #zamovlennia | #dropshipping | #contact
│
├── {production-seg}                     R:SSG   A:—  I:yes   Named stages, anchor per stage.
│                                                              Substantiates «понад 30 років».
├── {about-seg}                          R:SSG   A:—  I:yes
├── {contacts-seg}                       R:SSG   A:—  I:yes   PRIMARY LANDING (GBP target) and
│                                                              a DESTINATION page: the address is
│                                                              a shop as well as a factory (§F2).
│                                                              Directions, parking, what is on
│                                                              display, whether the production
│                                                              floor is visitable, static map,
│                                                              Яворів NAP, both phone numbers.
│                                                              LocalBusiness schema WITHOUT
│                                                              openingHours — hours are variable:
│                                                              «Графік гнучкий — телефонуйте
│                                                              перед візитом» (§E3)
├── {gallery-seg}/                       R:ISR   A:—  I:yes
│   └── {album-key}                      R:ISR   A:—  I:yes
├── {reviews-seg}                        R:ISR   A:—  I:yes   Launches empty, honestly
│
├── {journal-seg}/                       R:ISR   A:—  I:yes   The organic strategy, §4.4
│   ├── {article-slug}                   R:ISR   A:—  I:yes
│   └── tema/{tag-slug}                  R:ISR   A:—  I:NO
│
└── ✕ account/  — DELETED. No registration, login, password reset, email verification,
                  profile, saved addresses, order history or saved payment methods.
                  Guest checkout is permanent ([00-client-decisions-2.md] §E12).
```

**Why there are no customer-account routes, permanently.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 rules that the site works in guest mode
forever. That deletes an entire route subtree and, with it, customer session management, credential
storage, credential-stuffing exposure and a material share of the GDPR surface. The four things an
account would have done are served elsewhere, and each already has a route above:

| Removed | Replacement route or mechanism |
|---|---|
| `/account/zamovlennia` (order history) | `{order-seg}/{number}?t={guestToken}` from the confirmation email, or the lookup form at `{order-seg}/` taking order number + email |
| `/account/obrane` (wishlist) | `localStorage` only — device-local, no route, no server record, no `WishlistItem` table ([25-database-schema.md](25-database-schema.md) §25.8b). The UI states «Збережено на цьому пристрої» |
| `/account/adresy` (saved addresses) | Address prefill from a first-party cookie, same device only. No route |
| `/account/nalashtuvannia` (marketing preferences) | A checkout checkbox writing to `NewsletterSubscriber`, plus the one-click unsubscribe link in every send |

`Customer` survives as an **order-derived record for support and analytics** with no
`passwordHash` and no authentication. It has no storefront route. **Staff authentication is
untouched** — `/admin/login`, `/admin/invite/{token}` and the staff password-reset routes in §4.6
all stand.

**Why tag archives are `noindex`.** Tag pages are near-duplicates of category and collection pages,
are generated by editors without SEO intent, and multiply thin pages faster than anything else. On a
domain with no authority, thin pages are not a rounding error. They stay navigable for humans and
`follow` for crawl discovery.

**Why `derevo` has no route at all.** [00-client-decisions.md](00-client-decisions.md) D3: the
architecture is prepared, the category is not launched. An inactive `Category` row and `DRAFT`
products are sufficient. A partially populated wooden category in the navigation would waste a nav
slot and disappoint a click.

**Why enquiry-then-invoice needs a route, and why it hangs off the order rather than the checkout.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F4 rules that international carriers are
chosen per order — Nova Poshta, Ukrposhta and others case by case — so the checkout cannot compute
a live international rate. The recommended model is **enquiry-then-invoice**: the customer submits
the order, receives a shipping quote, and pays afterwards. That "afterwards" is the routing problem.

| Candidate | Verdict |
|---|---|
| Reuse `{checkout-seg}/oplata` | **No.** That step is cart-scoped. By the time the quote is sent the cart cookie has expired, been cleared, or belongs to a different device — the customer is arriving from an email, possibly days later. Resurrecting a dead cart to render a payment screen is a fiction maintained for the sake of a route name |
| Put the payment on the order-status page | **No.** The status page is a read surface reached by two different access paths, one of them a form. Mixing a payment action into it means every not-found and rate-limit state on that page becomes a payment-flow state too |
| **A dedicated child route of the order** | **Yes.** `{order-seg}/{number}/{pay-seg}?t={guestToken}` — token-scoped like every other guest order surface, `noindex`, SSR and never cached, with exactly one job |

The segment is localised in
[03-information-architecture.md](03-information-architecture.md) §3.5.2 (`oplatyty` / `pay` /
`zaplac` / `bezahlen`). It is already covered by the `robots.txt` `Disallow` on `/{locale}/{order}`
(§4.8) and by the `noindex` rule, so it adds no crawl or index surface. The flow it serves, its
order state and its anti-abandonment rules are specified at
[05-user-flows.md](05-user-flows.md) §5.9.4.

**The three by-weight families get a different PDP template**, not a variant of the standard one:
the buy box takes a weight/quantity input rather than a unit stepper, cart maths are price × weight,
and the shipping estimate derives from the purchased weight directly
([00-client-decisions.md](00-client-decisions.md) D4). They share a route shape and nothing else.
There is **no dye-lot control** — lots are not tracked
([00-client-decisions-2.md](00-client-decisions-2.md) §E8); the buy box instead carries one line of
honest advice, specified in [05-user-flows.md](05-user-flows.md) §5.7.

---

## 4.4 Editorial routes and the cold-start content set

On a new domain, commercial head terms will not rank for roughly a year. Long-tail informational
queries are the realistic organic entry point ([00-client-decisions.md](00-client-decisions.md) D2),
which makes `/{journal-seg}/` a **commercial** route, not a content-marketing extra.

The launch article set is therefore specified here rather than left to an editorial calendar,
because the routes have to exist for the sitemap and the internal-link graph to be complete:

| Article cluster | Purpose | Links to |
|---|---|---|
| «Що таке ліжник» | The single highest-intent explainer; the term itself is the brand's differentiator | `/vovna/lizhnyky` |
| «Гуня, накидка чи камізелька» | Disambiguates three garment families a buyer cannot tell apart | all three families |
| «Пряжа, ровниця чи вовна для рукоділля» | The disambiguation triangle in [03-information-architecture.md](03-information-architecture.md) §3.7.2 | all three by-weight families |
| Care guides, one per family | Answers anxiety A2 and A5; high-intent, long-lived | the family PDPs |
| «Вовна проти синтетики» | Category-level comparison, the widest top-of-funnel net | wool world |
| «Як ми робимо ліжник» | The 30-year manufacturing claim in narrative form | production page |
| «Мікронаж: чому вовна колеться» | Converts a specification number into a purchase argument | every wool PDP |
| **«Яворів — столиця ліжникарства»** | The place article. Museum, plein airs, the weaving lineage. This is the link-earning asset a cold-start domain has almost none of | wool world, `/{production-seg}`, `/{contacts-seg}` |

Every article carries at least one inline product embed
([03-information-architecture.md](03-information-architecture.md) §3.1), enforced by the orphan rule
at publish time. An article that earns a session and offers no path to a product has converted a
hard-won visitor into a bounce.

### Does Яворів justify a place-led landing route? No — it justifies an article

[00-client-decisions-2.md](00-client-decisions-2.md) §E2 resolves the address to **вул. Петруші,
с. Яворів, Косівський район, Івано-Франківська область, 78644**, and Яворів is the recognised
centre of Hutsul lizhnyk weaving — «столиця ліжникарства», with a Музей ліжникарства and annual
weaving plein airs. That is a genuinely strong lexical and link-building asset, so the route
question deserves a real answer rather than a reflex.

**The answer is no bespoke `/{locale}/yavoriv` route**, for three reasons:

1. **It would cannibalise three routes that already exist.** `/{contacts-seg}` is the Google
   Business Profile landing target and already carries the NAP, the map and the «приїжджайте»
   invitation. `/{production-seg}` already carries the craft. `/{about-seg}` already carries the
   people and the 30 years. A fourth page about the same place, on a domain with no authority,
   splits one thin topic four ways and none of the four wins.
2. **A place landing page has nothing to say that is not already said.** Strip the museum and the
   plein airs out of it and what remains is the contact page. Leave them in and it is an article,
   not a landing page — so it should be routed as one.
3. **The asset is lexical, not structural.** «Яворівський» earns its value inside `h1`s, meta
   titles, product names, `LocalBusiness` and `Product` structured data, and slugs
   ([03-information-architecture.md](03-information-architecture.md) §3.5.4 rule 11). None of that
   needs a route.

**What does get built** is the editorial route `/{locale}/{journal-seg}/yavoriv-stolytsia-lizhnykarstva`,
already listed in the launch article set above. It is the one surface that can plausibly earn links
from tourism sites, craft associations and cultural institutions — the only locally relevant
referrers a cold-start domain in this category can realistically get — and it costs nothing
structural because the journal route already exists. Promote it to a bespoke landing route later
**only** if it accumulates links and Search Console shows place-query demand it cannot absorb.
Promoting an article is cheap; un-splitting four competing pages is not.

**Verification before publishing.** Do not assert a heritage designation without confirming the
exact status and wording, and never imply that Вівчарик itself holds one — the craft may be listed,
a company is not ([00-client-decisions-2.md](00-client-decisions-2.md) §E2).

### Off-site surfaces that behave like routes

Google Business Profile is now the **only** live off-site channel: the owners run no social media
at all ([00-client-decisions-2.md](00-client-decisions-2.md) §E3). That makes GBP's landing target
the most load-bearing route on the site during the first two quarters.

| Surface | Its landing target on this site | Requirement |
|---|---|---|
| Google Business Profile | `/{locale}/{contacts-seg}` | `LocalBusiness` structured data with the Яворів address and the same NAP string as GBP, character for character. **`openingHours` is omitted** — hours are variable and publishing wrong ones is worse than publishing none (§E3). A NAP mismatch degrades local ranking. |
| GBP **retail attributes** | `/{locale}/{contacts-seg}` | New in round 3. The profile can legitimately carry in-store shopping and in-store pickup, because the address is a shop as well as a factory ([00-client-decisions-3.md](00-client-decisions-3.md) §F2). **Confirm the primary category reflects both functions** — a manufacturer-only category suppresses retail intent, a shop-only category discards the manufacturing story. This is an open item (§F7.3) and it is the cheapest ranking change available on the project |
| GBP product/service links | Wool family pages | Stable slugs; §3.5.4 rule 7 |
| Instagram | **Does not exist.** | Recorded as a *recommendation*, not a route: create an account before launch even if updated rarely (§E3). Until it exists, no bio-link target, no story-link route, and no `Setting` row. If it is created, the bio link target must be a `Setting` row so it is swappable without a deploy |

---

## 4.4b Content provenance — a routing-adjacent constraint

Products and photographs may be copied from the adjacent business's site
([00-client-decisions-2.md](00-client-decisions-2.md) §E5). **That site stays online**, which turns
a convenience into a ranking risk: two live sites with identical text competing for the same
queries, one of which has zero authority. The new domain loses that competition every time. The
constraint therefore lands in this document, because it governs what may exist at these routes.

| Asset at these routes | Rule |
|---|---|
| Product descriptions (`ProductTranslation.description`) | **Rewrite every one.** No sentence copied verbatim. This is a real content workload across several hundred to ~1,000 SKUs and four locales, and it belongs in the roadmap as such |
| Product names (`ProductTranslation.name`) | Rename where they overlap. Distinct names are also better brand assets — «Ліжник Яворівський» beats a shared generic name, and product names are the source of product slugs |
| Category and facet intro copy (`CategoryTranslation`) | New, written to the §D3 structure. This is also the §7.2.2 cold-start SEO surface, so copied text would waste the one place a category page can rank |
| Journal and care-guide articles (§4.4) | **Never copied.** Written fresh |
| Photographs | Reuse permitted after re-crop, re-grade to the art direction in [01-brand-strategy.md](01-brand-strategy.md) §1.6, EXIF strip, semantic filename, and new per-locale `alt` text. Identical images across two domains are a weaker signal than unique ones but are not penalised the way duplicate text is |
| Reviews | **Never copied.** They were given to a different seller; transplanting them is a structured-data violation and a trust failure. `/{reviews-seg}` launches empty and says so |

**Why this is a routing concern and not only an editorial one.** The `noindex` discipline in §4.8
and the indexable-facet rule in §3.6.2 both assume that an indexable page carries content worth
indexing. A route populated with text that already ranks on another live domain fails that
assumption silently — the page is indexable, crawled, and worthless. The publish check that blocks
a product without alt text ([05-user-flows.md](05-user-flows.md) §5.16.2) should not attempt to
detect copied text automatically; it is caught by the rewrite being scoped as work, not by a
validator.

---

## 4.5 Utility and legal routes

Legal routes are SSG, `index, follow`, and **locale-scoped**: `de` and `pl` carry pages `uk` does
not, because EU consumer law imposes disclosures Ukrainian law does not. Rendering a German
Impressum on a Ukrainian URL is not merely useless — it is a statement about a legal entity that may
not be accurate.

**These pages are now mandatory, not conditional.** The previous revision treated the EU set as
contingent on whether the site would sell abroad.
[00-client-decisions-2.md](00-client-decisions-2.md) §E11 answers that: it will. The `de` and `pl`
locales therefore trigger the 14-day right of withdrawal, the model withdrawal form, and — for
`de` — a mandatory Impressum, and none of them can ship without the legal identifiers below.

**Seller of record is resolved.** `{{LEGAL_ENTITY_NAME}}` → **ФОП Гондурак Любов Юріївна**
([00-client-decisions-2.md](00-client-decisions-2.md) §E1). She is the entity on the offer
contract, the WayForPay contract, the invoices and the German Impressum.

**`{{LEGAL_ID}}` exists and will be supplied, and it is no longer a general blocker.**
[00-client-decisions-3.md](00-client-decisions-3.md) §F1 narrows it to exactly three gated
deliverables:

| Gated on `{{LEGAL_ID}}` | Not gated |
|---|---|
| WayForPay merchant onboarding | Every other route in this document |
| Договір оферти and the returns policy | The common legal set below, which needs the entity name and the address, not the identifier |
| `/de/impressum`, which is legally mandatory and cannot be published without it | The `de` and `pl` withdrawal and complaint routes, which are drafted against consumer law rather than registry data |

The previous revision treated the identifier as an open-ended risk. It is a chase, not a risk:
build proceeds, and those three items do not.

### Common to all locales

| Route (`uk` segment) | Purpose | R | I |
|---|---|---|---|
| `/{locale}/dostavka-i-oplata` | Delivery and payment. Must list every method actually offered and every carrier and price actually charged. Carries the **round-3 shipping position in full**: the buyer pays shipping to every destination; domestic carriers are Nova Poshta and Ukrposhta; international carriers are **chosen per order and quoted, not listed with prices**; the buyer pays all customs duties and import taxes, effectively DAP; and **free shipping never applies internationally regardless of order value** ([00-client-decisions-3.md](00-client-decisions-3.md) §F4). Pickup at Яворів is listed here as a visit, not as the cheap option | SSG | yes |
| `/{locale}/povernennia` | Returns and exchange. `{{RETURN_DAYS}}`, and **who pays return shipping** — stated here and on the PDP, never discovered at the return | SSG | yes |
| `/{locale}/harantiia` | Warranty and care entry point; links the care guides | SSG | yes |
| `/{locale}/polityka-konfidentsiinosti` | Privacy policy | SSG | yes |
| `/{locale}/umovy-korystuvannia` | Terms of use / terms of sale | SSG | yes |
| `/{locale}/cookies` | Cookie policy + a control that reopens the consent manager | SSG | yes |
| `/{locale}/faq` | FAQ, marked up as `FAQPage`. On a cold-start domain this is also a retrieval surface for AI answer engines ([30-ai-search-optimization.md](30-ai-search-optimization.md)) | SSG | yes |
| `/{locale}/karta-saitu` | Human-readable HTML sitemap | SSG | yes |

### `de` only

| Route | R | I | Requirement |
|---|---|---|---|
| `/de/impressum` | SSG | yes | **Mandatory under German law.** Names **ФОП Гондурак Любов Юріївна** as the provider, in Latin transliteration alongside the Cyrillic form, with the Яворів address, `{{LEGAL_ID}}`, both telephone numbers and `{{BRANDED_EMAIL}}`. Linked from **every page footer**, one click from anywhere — a buried Impressum is treated as an absent one. Blocked on `{{LEGAL_ID}}` and on counsel |
| `/de/widerrufsbelehrung` | SSG | yes | 14-day right-of-withdrawal instruction. States when the period starts and how to exercise it |
| `/de/widerrufsformular` | SSG | yes | **The model withdrawal form**, as a downloadable document *and* as an on-page form that submits to the same handler as the return request in [05-user-flows.md](05-user-flows.md) §5.13. A download-only form pushes the buyer into a printer they do not have |
| `/de/datenschutzerklaerung` | SSG | yes | GDPR privacy notice: controller (ФОП Гондурак Л. Ю.), legal bases, processors (Cloudinary, WayForPay, Nova Poshta, `{{INTL_CARRIER}}`), retention, data-subject rights |
| `/de/zahlung-und-versand` | SSG | yes | Payment and delivery disclosure. **The answer is settled:** the buyer bears customs, duties and import VAT on a Ukraine→EU shipment ([00-client-decisions-3.md](00-client-decisions-3.md) §F4), and shipping is quoted per order rather than tabulated. The same fact must also appear in checkout **before** payment, as a blocking element rather than a link to this page (§5.9.3) |

### `pl` only

| Route | R | I | Requirement |
|---|---|---|---|
| `/pl/regulamin` | SSG | yes | Shop regulations, with defined scope and complaint procedure. Names ФОП Гондурак Любов Юріївна as seller |
| `/pl/polityka-prywatnosci` | SSG | yes | GDPR privacy notice, Polish-law drafted |
| `/pl/odstapienie-od-umowy` | SSG | yes | 14-day withdrawal right, stated in full |
| `/pl/formularz-odstapienia` | SSG | yes | **The model withdrawal form**, download plus on-page form, same handler as `/de/widerrufsformular` |
| `/pl/reklamacje` | SSG | yes | Complaint and non-conformity procedure with response deadlines |

**Why the withdrawal form is its own route in both locales.** The previous revision folded it into
the withdrawal-instruction page. Separating it does three things: it gives the form a stable URL
that can be linked from the confirmation email and the order-status page, it lets the on-page form
share one submission handler across `de` and `pl` rather than being duplicated inside two legal
pages, and it makes the obligation independently checkable — a reviewer can confirm the form exists
without reading a page of legal prose. The cost is one extra route per EU locale, which is nothing.

### Verification required before any of these ship

Four obligations are **not** assumed here and must be answered by counsel, not by design. One is now
resolved; the rest are not:

1. ~~**The operating legal entity.**~~ **RESOLVED** — ФОП Гондурак Любов Юріївна
   ([00-client-decisions-2.md](00-client-decisions-2.md) §E1). Its registration identifier
   `{{LEGAL_ID}}` remains outstanding and blocks the Impressum and the offer contract.
2. **EU product-safety responsible person.** Goods placed on the EU market generally require an
   identifiable responsible person established in the EU. `{{EU_RESPONSIBLE_PERSON}}`. This is one
   more argument for the wool-only EU launch in §4.2 — it narrows the goods in scope.
3. **Out-of-court dispute-resolution information.** The exact reference required has changed in
   recent years. **Do not copy a boilerplate ODR link from another site.** `{{ADR_BODY}}`.
4. ~~**Customs, VAT and import-charge treatment.**~~ **RESOLVED as a commercial position** —
   the buyer pays shipping and all customs duties and import taxes, all destinations, effectively
   **DAP** ([00-client-decisions-3.md](00-client-decisions-3.md) §F4). What remains for counsel is
   narrower and purely presentational: whether `de`/`pl` prices must display inclusive or
   exclusive of destination VAT given that position, and who is named importer of record on the
   customs declaration. `{{EU_IMPORT_TERMS}}` now sets the **wording** of the disclosure, not
   whether the buyer pays; `{{VAT_STATUS}}` still governs the price display. The disclosure itself
   is mandatory and blocking before payment either way (§5.9.3).
5. **Species declaration for hide goods.** Sheepskin and leather entering the EU face
   species-declaration and, for some materials, CITES paperwork. Not required for the wool-only
   launch in §4.2, and required before Овчина or Шкіра are enabled for `de`/`pl`.
6. **Settlement currency.** Whether WayForPay settles non-UAH (verification item V11,
   [00-client-decisions-2.md](00-client-decisions-2.md) §E10). If it does not, `de`/`pl`/`en`
   prices display converted but charge in UAH, and the checkout must say so plainly rather than
   surprising the buyer at their bank.

### One copy constraint that lives in routing, not in copywriting

The 30-year claim is **editorial only** ([00-client-decisions.md](00-client-decisions.md) D1). It
appears in prose on `/{about-seg}`, `/{production-seg}`, the homepage and the wholesale page. It does
**not** appear as `Organization.foundingDate` in structured data on any route, and no route renders a
certification mark, seal, or "officially confirmed" framing — no certificates exist. The design
system contains no certification-badge component and must not gain one.

---

## 4.6 Admin routes

All admin routes: **SSR**, `A: staff`, `I: no`, `X-Robots-Tag: noindex, nofollow`, dark theme by
default ([09-color-palette.md](09-color-palette.md) §9.7). Permission keys follow `resource.action`
from [25-database-schema.md](25-database-schema.md) §25.7; full model in
[24-employee-permission-architecture.md](24-employee-permission-architecture.md).

**Staff authentication is unaffected by the guest-checkout ruling.** Deleting `/account/*` removes
*customer* accounts only; [00-client-decisions-2.md](00-client-decisions-2.md) §E12 states this
explicitly and [24-employee-permission-architecture.md](24-employee-permission-architecture.md)
stands in full. The three public auth routes below are staff-only and stay. §E1 additionally seeds
**two Owner accounts** — Іван and Любов — rather than weakening the Administrator role.

```
/admin
├── login                                    public, rate-limited, no staff enumeration
├── invite/{token}                           public, single-use, expiring
├── forgot-password · reset-password/{t}     public   ← STAFF only. There is no customer
│                                                        equivalent and never will be (§E12)
│
├── /                                        dashboard.view
│   └── widgets: new orders · unpaid orders · NEW leads by age (SLA counter) ·
│                low stock · zero-result searches · pending reviews ·
│                translation completeness per locale
│
├── orders/                                  orders.view
│   ├── {id}                                 items, events, payments, address
│   ├── {id}/fulfil                          orders.fulfil
│   ├── {id}/refund                          orders.refund   (isDangerous → confirm step)
│   └── export                               orders.export
│
├── products/                                products.view
│   ├── new · {id}                           products.create | products.update
│   ├── {id}/variants · media · seo          products.update
│   ├── {id}/origin                          products.update — ProductOrigin + partnerRegion.
│   │                                        partnerName is NOT editable: partners are never
│   │                                        named (§E7). Origin is required, with no silent
│   │                                        default on an unreviewed product.
│   │                                        No dye-lot field anywhere (§E8).
│   ├── import                                products.import      ← Phase 1
│   ├── bulk-edit                             products.update      ← Phase 1
│   └── {id}/duplicate                        products.create      ← Phase 1
│
├── categories/ (tree, drag-reorder)         categories.view | categories.update
├── attributes/ · options/                   attributes.manage
│
├── media/                                   media.view
│   └── albums/{id}                          media.manage — alt text per locale is required
│
├── content/
│   ├── posts/ · posts/{id}                  content.view | content.update
│   ├── pages/{key} · banners/               content.update
│
├── leads/ · leads/{id}                      leads.view | leads.update
├── reviews/                                 reviews.moderate
├── customers/                               customers.view — order-derived records only.
│                                            No credentials, no impersonation, no password
│                                            reset: customers have no login (§E12)
├── promotions/                              promotions.manage
│
├── seo/
│   ├── redirects/                           seo.redirects — internal slug changes only
│   └── search-logs/                         seo.view — zero-result queries
│
├── settings/                                settings.manage
│   ├── general · shipping · payment · locales · translations
│
├── staff/ · staff/invite · staff/{id} · staff/{id}/sessions
├── roles/                                   roles.manage
└── audit/                                   audit.view — append-only, filterable, exportable
```

**Content population is the critical path, so the admin's bulk tools are Phase 1.**
[00-client-decisions.md](00-client-decisions.md) D5 makes this explicit: twelve wool families plus
two more material worlds, across four locales, with full variants, composition, care and media per
product. Entering that through a single-product form is not a workflow. The admin's priority order
follows the content workload, not feature glamour.

**`products/{id}/origin` is a dedicated screen, not a checkbox on the main form.** `ProductOrigin`
defaults to `OWN_MANUFACTURE` ([00-client-decisions.md](00-client-decisions.md) D3), which is the
safe default for the brand's core catalogue and the *dangerous* default for a partner product
entered in a hurry. Making origin an explicit, separately saved step means a partner product cannot
silently inherit an own-manufacture claim — the one data error on this site that is simultaneously a
structured-data violation and a breach of the brand promise. The screen exposes `partnerRegion`
(«Косівщина», «Гуцульщина») and **not** `partnerName`, which stays null by ruling
([00-client-decisions-2.md](00-client-decisions-2.md) §E7) — an editable field that must never be
populated is an invitation to populate it.

**Content volume is larger than the previous revision assumed, and the bulk tools matter more.**
`{{SKU_COUNT}}` resolves to several hundred to roughly a thousand SKUs (§E5), each needing a
**rewritten** description and name (§4.4b), across four locales, with full variants and media.
`products/import` and `products/bulk-edit` are not conveniences at that volume; they are the
difference between a launchable catalogue and a stalled one.

---

## 4.7 API route map

Detail in [26-api-architecture.md](26-api-architecture.md). Summary only, so the inventory is
complete.

| Namespace | Auth | Purpose |
|---|---|---|
| `/api/catalog/*` | public, cached | Products, categories, facets and counts, search |
| `/api/cart/*` | cart cookie | Line mutation incl. weight-based lines, coupon, shipping estimate, stock reservation |
| `/api/checkout/*` | cart cookie | Address validation, Nova Poshta warehouse lookup, domestic rate quote, order placement. **No live international rate call** — carriers are chosen per order (§F4), so a non-UA order is submitted for quotation and the shipping total is written later by staff |
| `/api/orders/{number}/pay` | `guestToken`, rate-limited | Initiates payment on a quoted international order after the shipping total has been added. Serves `{order-seg}/{number}/{pay-seg}`; the same WayForPay path as the domestic card flow, only entered from a different door |
| `/api/payments/wayforpay/webhook` | WayForPay signature | Idempotent by `PaymentTransaction.idempotencyKey`. **Payload shape, acknowledgement response, retry behaviour and signature field order are all BLOCKED ON V7–V8** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10) — nothing about them may be written from memory |
| `/api/orders/lookup` | order number + email, rate-limited | Guest tracking. This is the **only** order-retrieval path; there is no authenticated alternative (§E12) |
| `/api/leads` | public, rate-limited + bot-scored | Four `LeadKind` variants incl. `DROPSHIP` |
| `/api/reviews` | public write, moderated | Writes `PENDING`; never renders unmoderated |
| `/api/newsletter/*` | public | Subscribe, confirm (double opt-in), unsubscribe |
| `/api/admin/*` | JWT + RBAC | Mirrors §4.6; every mutation writes `AuditLog` |
| `/api/webhooks/novaposhta` | signature | Tracking status → `OrderEvent` |

System routes: `/robots.txt`, `/sitemap.xml` and segments, `/manifest.webmanifest`, `/sw.js`,
`/opensearch.xml`, `/.well-known/security.txt`.

---

## 4.8 XML sitemap segmentation

A sitemap index with per-type, per-locale segments. Segmentation makes "which segment lost coverage"
answerable in Search Console, which is the only practical way to diagnose a regression across four
locales — and on a new domain it also makes *indexation progress* measurable, which is the number
that matters most in months one to six.

```
/sitemap.xml                          index
├── /sitemap-pages-{locale}.xml          home, static, legal (locale-scoped)
├── /sitemap-categories-{locale}.xml     3 worlds + 12 wool families + partner destination
├── /sitemap-facets-{locale}.xml         ONLY facet URLs passing §3.6.2
├── /sitemap-collections-{locale}.xml    7 collections + gift hub
├── /sitemap-products-{locale}-{n}.xml   chunked at 5,000; image entries inline
├── /sitemap-posts-{locale}.xml          journal + care guides
├── /sitemap-gallery-{locale}.xml        album pages
└── /sitemap-images.xml                  production and gallery imagery not tied to a product
```

**Rules:**

1. Chunk product segments at **5,000 URLs**, well under the 50,000 limit. Smaller segments process
   faster, fail more locally, and make per-chunk coverage diffs meaningful.
2. A URL appears in exactly one segment. Duplicates make coverage numbers uninterpretable.
3. **Only indexable URLs are listed.** No `noindex` URL, no query-facet URL, no tag archive, no
   paginated page beyond page 1, no `derevo` route, and **no translation-fallback page** (§4.9).
4. `lastmod` comes from the entity's `updatedAt`, never from build time. A build-time `lastmod` tells
   crawlers every page changed on every deploy, and they stop believing it.
5. No `priority`, no `changefreq`. Both are ignored and both invite arguments.
6. Regeneration is event-driven on entity save, not a nightly cron, so a newly published product is
   discoverable within minutes. This matters more on a new domain than on an established one:
   crawl budget is small and irregular, and a stale sitemap wastes the visits that do occur.
7. Segments are generated from the same route-segment dictionary as the router
   ([03-information-architecture.md](03-information-architecture.md) §3.5.2), so a localised path
   cannot drift between them.
8. `robots.txt` references only `/sitemap.xml`.

`robots.txt` disallows `/admin`, `/api`, `/{locale}/{cart}`, `/{locale}/{checkout}`,
`/{locale}/{order}`, `/{locale}/{search}`, and any URL carrying a query parameter other than
`page`. The `/{locale}/account` rule is **removed** — the route no longer exists, and a
`Disallow` line for a non-existent path is a small but real disclosure of architecture that was
never built. That last rule is enforceable as a single pattern precisely because
[03-information-architecture.md](03-information-architecture.md) §3.6.3 put indexable facets in the
path and everything else in the query string.

---

## 4.9 Canonical and hreflang behaviour

Four locales, `uk` canonical for content, `x-default` → `/uk/`. Every hreflang cluster is
**reciprocal and self-referential**: each member lists every member including itself, or search
engines discard the cluster.

| Page type | Canonical | hreflang cluster | Notes |
|---|---|---|---|
| Home | self | all 4 + `x-default` | — |
| Material world | self | all 4 | `ovchyna` / `shkira` are `uk` + `en` only at launch; the `de` and `pl` members are absent from the cluster because the pages 404 there (§4.2) |
| Product family | self | locales where published | — |
| Family `?page=N` | **self** | none | Paginated pages carry no hreflang; the cluster lives on page 1 |
| Family, query facets | clean family URL | none | `noindex, follow` |
| Family, path facet | self | locales where the same facet page exists and passes §3.6.2 | Frequently a partial cluster, which is correct |
| Product | self | locales with a `ProductTranslation` row | See the fallback rule below |
| Partner destination | self | all locales where published | Origin-filtered view; its members' canonicals stay on their own PDPs |
| Collection | self | all locales where published | — |
| Article | self | locales with a `PostTranslation` row | — |
| Legal, common | self | all 4 | — |
| Legal, `de`/`pl` only | self | single-locale, no cluster | An Impressum has no Ukrainian equivalent, so a cluster would be a lie. The `de` and `pl` withdrawal-form routes are **not** clustered with each other either: they are drafted under different national implementations |
| Contacts | self | all 4 | NAP string must match Google Business Profile exactly, Яворів address, no published hours. All four locales carry the full destination content — a `de` visitor planning a Carpathian trip is a realistic reader of this page, which is why it is not `uk`-first (§F2) |
| Search, cart, checkout, order, order payment | self | none | `noindex`. `account` is gone from this row because the route set no longer exists (§4.3) |

**The fallback rule is the subtle one.** [25-database-schema.md](25-database-schema.md) §25.2 says a
missing translation serves the `uk` row rather than 404ing, which is right for users and wrong for
search engines: indexing Ukrainian content at a `/de/` URL creates a duplicate and a bad result. The
two are reconciled by serving the fallback, marking it `x-translation-fallback: true`, and
**excluding it from hreflang and from the XML sitemap** until a real translation exists. The admin
translation-completeness widget makes the gap visible so it gets closed rather than tolerated — and
with twelve wool families across four locales, it will be a long-running gap.

**Locale switching preserves the current page.** The switcher resolves the current entity's
translation in the target locale and links directly to it, falling back to the nearest ancestor
(family → world → home) only when no translation exists, and saying so. Dumping the visitor on the
homepage is the category norm ([02-ux-research.md](02-ux-research.md) §2.5.3) and a pure conversion
loss.

---

## 4.10 Redirects, errors, and edge routes

### Redirect policy

There is **no legacy redirect map**. The `Redirect` table has exactly one producer: an internal slug
change, written automatically and atomically when a published slug is edited
([03-information-architecture.md](03-information-architecture.md) §3.5.4 rule 7).

**Single-hop is still a hard requirement.** When a slug changes twice, the first `Redirect` row is
rewritten to point at the final target rather than chained. Chains are trivially avoided at write
time and expensive to unpick later.

### Error and edge routes

| Route | Status | R | Behaviour |
|---|---|---|---|
| `/{locale}/404` | 404 | SSG | Sheep mascot ([01-brand-strategy.md](01-brand-strategy.md) §1.7, now brand-core per [00-client-decisions.md](00-client-decisions.md) D2), search field pre-filled from the failed path, links to the three material worlds, link to order lookup. **Never redirects to home** — a soft 404 hides broken links from Search Console. |
| `/{locale}/500` | 500 | SSG static shell | Plain-language failure statement, retry, phone and email. **No mascot** ([08-design-system.md](08-design-system.md) §8.8) — an error is not a moment for charm. No stack trace; a correlation ID is shown so support can find it. |
| `/{locale}/503` | 503 | static | Maintenance, `Retry-After` set |
| `/offline` | 200 | service worker | Caches the shell, the last 20 viewed PDPs, and cart contents. Justified by the mountain-connectivity context in [02-ux-research.md](02-ux-research.md) §2.7 and by GBP/Maps being a primary entry channel, not by PWA fashion. |
| `/{locale}/*` unmatched | 404 | SSR | Checks `Redirect` before 404ing |
| Unmatched locale prefix (`/fr/…`) | 301 | — | → `/uk/…`, path preserved |
| Path without a locale prefix | 301 | — | `Redirect` lookup, then `/uk/` + path, then 404 |

**Redirect resolution order**, applied once per request in middleware: exact `Redirect` match →
locale-prefix normalisation → trailing-slash normalisation → route match → 404. This ordering
guarantees a renamed slug never reaches the 404 handler while a `Redirect` row exists for it.

**The mascot's route inventory**, now that it is brand-core rather than optional: 404, empty states,
loading, order confirmation, footer mark, and the seasonal easter egg. It remains **absent from PDP,
cart, checkout and wholesale** ([01-brand-strategy.md](01-brand-strategy.md) §1.7). That absence is
what lets a shepherd mascot coexist with five-figure price points, and it is also an accessibility
rule: every state the mascot appears in must be fully comprehensible with it removed
([02-ux-research.md](02-ux-research.md) §2.6).

---

## 4.11 Tokens introduced by this document

| Token | Meaning | Severity |
|---|---|---|
| `{{DOMAIN}}` | Launch domain: **`vivcharyk.shop`**, chosen, not yet registered (round 7, K1). Until registered, blocks GBP verification, brand lockup, and — newly — transactional email authentication (§F5) | BLOCKER |
| `{{TRANSACTIONAL_FROM}}` | The address every transactional email sends from. **Must be on `{{DOMAIN}}`**, with SPF, DKIM and DMARC published. It cannot be `gif19601@gmail.com`: Google does not permit third-party SPF or DKIM for `gmail.com` and its consumer DMARC policy rejects such mail, so order confirmations would land in spam or be refused ([00-client-decisions-3.md](00-client-decisions-3.md) §F5) | BLOCKER, Phase 0 |
| `{{LEGAL_ID}}` | ЄДРПОУ / РНОКПП for ФОП Гондурак Любов Юріївна. **Exists, pending delivery** (§F1). Gates the WayForPay contract, the offer contract and `/de/impressum` — and nothing else | BLOCKER for `de` and for payment onboarding |
| `{{EU_RESPONSIBLE_PERSON}}` | EU-established responsible person for product-safety purposes | HIGH for `de`/`pl` |
| `{{ADR_BODY}}` | Out-of-court dispute-resolution reference required per market | HIGH for `de`/`pl` |
| `{{EU_IMPORT_TERMS}}` | The **wording** of the customs disclosure per market. Who bears the charges is settled — the buyer does (§F4). The disclosure is blocking before payment regardless of wording | MEDIUM |

**Resolved by round 2:** `{{LEGAL_ENTITY}}` → **ФОП Гондурак Любов Юріївна** (§E1);
`{{FACTORY_ADDRESS}}` → вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область;
`{{POSTAL_CODE}}` → 78644 (§E2); `{{PSP}}` → **WayForPay**, with its integration mode still
blocked on V6 (§E10); `{{SKU_COUNT}}` → several hundred to roughly a thousand (§E5).
`{{DE_FUR_POLICY}}` is superseded by the wool-only EU launch position in §4.2.

**Resolved by round 3** ([00-client-decisions-3.md](00-client-decisions-3.md)):

| Token | Resolution | Route consequence |
|---|---|---|
| `{{INTL_CARRIER}}` | **Multiple, quoted per order** — Nova Poshta Global, Ukrposhta International, and others case by case (§F4). It is no longer a single value waiting to be chosen, and it is therefore no longer a launch blocker in the form the previous revision described | It stops blocking the checkout and starts requiring a route: the quote arrives after submission, so the payment step moves to `{order-seg}/{number}/{pay-seg}` (§4.3) |
| Public contact email | **`info@vivcharyk.shop`** ([00-client-decisions-8.md](00-client-decisions-8.md) §L1, §L2). `gif19601@gmail.com` is the Owner's login and is **never published** | `/{contacts-seg}` has an email channel |
| Who pays shipping and duties | **The buyer, all destinations** (§F4) | §4.5 legal set states it; §5.9.3 blocks on it before payment |

Referenced without redefinition: `{{BRAND_NAME}}`, `{{BRANDED_EMAIL}}`, `{{FACET_INDEX_MIN}}`,
`{{RETURN_DAYS}}`, `{{VAT_STATUS}}`.
