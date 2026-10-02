# 26 — API Architecture

> **Round 16 — ONEKNIGHT seams (not connected):** data access through ports with `Local*` / `OneKnight*` implementations chosen per port by config; inbound `POST /api/v1/webhooks/oneknight` (HMAC-SHA256 over `t.body`, 5-min window, idempotent by event id, 204 then background); outgoing events are pg-boss jobs in the same transaction; one `revalidate(entity, id)` for every purge — [00-client-decisions-16.md](00-client-decisions-16.md), [oneknight-integration.md](oneknight-integration.md).

The API is the contract between one storefront, one admin client, four locales, one payment rail
and a domestic plus an international carrier. It defers entirely to
[25-database-schema.md](25-database-schema.md) for data shapes. Where this document appears to
introduce a persisted field, it is flagged as a **schema addendum** and must be ratified there
before it is built.

**Authority note.** [00-client-decisions-6.md](00-client-decisions-6.md) is the highest-authority
document in the blueprint, above [00-client-decisions-5.md](00-client-decisions-5.md), above
[00-client-decisions-4.md](00-client-decisions-4.md), above
[00-client-decisions-3.md](00-client-decisions-3.md), above
[00-client-decisions-2.md](00-client-decisions-2.md), above
[00-client-decisions.md](00-client-decisions.md). This document obeys them in that order.

**Round 6 removes surface from this API rather than adding it**
([00-client-decisions-6.md](00-client-decisions-6.md)):

| Ruling | Effect on the API |
|---|---|
| **J1** — a mixed cart ships together as one order | **`POST /v1/checkout/split` is deleted**, along with `SplitPreview`, `SplitResult` and the proposed `Order.splitGroupId` schema addendum. A mixed cart goes through `POST /v1/checkout/orders` and produces **one order, one shipping charge, full prepayment, no COD, no return deposit**, dispatched after 14 days. What replaces the endpoint is a `mixedCart` block returned on the cart and payment-method responses, so the storefront can disclose the constraint **at the add** rather than at checkout. §26.10.4b. The **split-order-pair email template is removed** from §26.16 |
| **J2** — the return-shipping deposit confirmed | No change to §26.10.4c. The mechanic is confirmed with the business reason on record and is **not provisional anywhere in this document**; only its customer-facing copy awaits approval (§J3 item 1) |

**Rounds 4 and 5 reshape the transactional half of this API more than any ruling since guest
checkout.** Six additions, each specified in the section named:

| Ruling | Effect on the API |
|---|---|
| **H1.1** — made-to-order is full prepayment | **Available payment methods are derived from cart contents and returned by the API.** They are never a client-side filter. If any cart line carries a custom-size configuration, `COD` is **absent from the response**, not flagged as unavailable. §26.10.4b |
| **H1.2** — payment method scope | Online card everywhere; COD-with-inspection **Ukraine only, and only for carts with no custom-size line at all** — the constraint is cart-level, because under §J1 the whole cart becomes one prepaid order. §26.10.4b |
| **H1.3** — the return-shipping deposit | Four new `Order` money fields, a buyer who pays both shipping legs online, and an invariant: `depositAppliedMinor` is credited **exactly once**, on transition to `DELIVERED`. That transition is owned by the order state machine and is made idempotent by a conditional write, not by a controller check. Forbidden on `en`/`pl`/`de`. §26.10.4c |
| **H3b / H3c** — custom sizing, priced by rate | `Product.allowsCustomSize` gates a custom-size configuration; its price is computed from `customSizeRatePerSqmMinor` and **recomputed server-side at checkout**. This is the only price in the system not read from a database row, which makes it the only one a client could try to author. §26.10.1a |
| **G2** — 14 days of production before dispatch | `OrderStatus.IN_PRODUCTION` between `CONFIRMED` and `PACKING`, and a confirmation email that states a **date** rather than a duration. §26.10.4d, §26.16 |
| **H2** — quote defaults | `{{QUOTE_SLA_HOURS}}` = **48 working hours**, `{{QUOTE_EXPIRY_HOURS}}` = **72 hours** (**36** for one-of-one), and an expired quote is **re-issuable** rather than terminal. §26.10.4, §26.17 |

Nine earlier rulings continue to govern the API materially:

1. **No customer accounts, ever (§E12).** Guest checkout is permanent. Every customer
   authentication endpoint is deleted from this document — register, login, refresh, logout,
   password forgot and reset, email verification, `/v1/me/*`, the address book, and the
   wishlist API. `Customer` survives as an order-derived record with no `passwordHash`
   ([25](25-database-schema.md) §25.6) and no way to authenticate as one. Order access is
   `Order.guestToken` plus an order-number + email lookup (§26.10.5). The wishlist is
   `localStorage` only ([28](28-state-management-architecture.md) §28.3) and has no endpoints at
   all. **Staff authentication is untouched** and is now the only authentication in the system.
2. **{{PSP}} resolves to WayForPay (§E10) — and six integration facts are unverified.** V6–V11
   cover the available integration mode, the signature algorithm and field order, the webhook
   payload and acknowledgement shape, refund support, ФОП eligibility and settlement currencies.
   §26.14.1 therefore specifies the **receiver's structure** — ordering, idempotency,
   constant-time verification, amount re-checking — and explicitly does not specify WayForPay's
   wire format. Nothing provider-specific is written here or in code until it is read from current
   official documentation.
3. **Content import returns; SEO migration does not (§E5).** The client now permits copying
   products and photographs from the adjacent business's site. There is still no 301 mapping, no
   Search Console baseline and no legacy URL preservation, because that site stays live and
   belongs to a different business. The bulk surface in §26.10.10 is consequently a **content
   import** pipeline, and it acquires a duplicate-text guard.
4. **International sales are accepted (§E11).** `en`, `pl` and `de` are transactional, not
   informational. That adds an international shipping path (§26.10.4) and the hard constraint
   that **COD is domestic only**. Ruling 8 below then determines the shape that path takes.
5. **Partner manufacturers cannot be named (§E7).** `Product.partnerName` stays null and is never
   serialised to a public response. `partnerRegion` is public and is used. The previous rule
   requiring `partnerName` on partner goods is inverted below.
6. **`ProductOrigin` is still first-class.** Own-manufacture and partner-manufacture goods share a
   catalogue but must never share a claim ([00-client-decisions.md](00-client-decisions.md) D3).
   §E6 confirms the full production cycle including hides, so all own-manufacture categories —
   wool, sheepskin and leather — are `OWN_MANUFACTURE`. Any «бельгійська технологія» framing is
   removed; it belonged to the adjacent business.
7. **Partner goods are sold under the Вівчарик brand ([00-client-decisions-3.md](00-client-decisions-3.md)
   F3).** This closes the question §E7 left open. The product serialiser emits
   `schemaBrand = Вівчарик` for **both** origins and omits `schemaManufacturer` entirely for
   `PARTNER_MANUFACTURE` — never setting it to Вівчарик. §26.10.1 specifies the serialiser and
   the invariant test that guards it.
8. **The buyer pays shipping and all customs charges, and international shipping is quoted rather
   than calculated (F4).** Carriers are chosen per order, so `{{INTL_CARRIER}}` resolves to
   *multiple, quoted per order* and there is no international rate API to proxy. The live
   `/v1/checkout/intl/rates` endpoint specified in the previous revision is **removed** and
   replaced by an enquiry-then-invoice lifecycle: submit, quote, pay. §26.10.4 carries the
   endpoints, the state transitions and the quote-expiry job.
9. **Transactional mail cannot be sent from the client's Gmail address (F5).** `gif19601@gmail.com`
   is a valid public contact address and an invalid sending identity: SPF and DKIM cannot be
   published for `gmail.com` by this system, and Gmail's consumer DMARC policy rejects mail that
   fails them. A sending domain with SPF, DKIM and DMARC, `no-reply@{{DOMAIN}}` as the `From:`,
   and a monitored `Reply-To:` are a **Phase 1 blocker**. §26.16.

## 26.1 Governing decisions

| Decision | Choice | Why |
|---|---|---|
| Style | REST over HTTP/2, JSON | Cacheable at the CDN edge on `GET`. §26.2 |
| Contract | Zod schemas shared verbatim client and server | One definition, no drift, free OpenAPI. §26.9 |
| Rendering | SSG for content, cached SSR for catalogue, CSR for transactional | React + Vite retained. §26.3 |
| Versioning | URL prefix `/api/v1` | Visible in logs and cache keys. §26.4 |
| Public identifiers | Locale-scoped slugs for content, `cuid2` for operations | Matches `@@unique([locale, slug])` (§25.2) |
| Money on the wire | Integer minor units plus an ISO currency code | Formatting is presentation and is locale-dependent |
| Time on the wire | RFC 3339 UTC with `Z` | Matches the `timestamptz` rule (§25.1) |
| Auth | **Staff only.** Short-lived access JWT, rotating httpOnly refresh cookie. No customer auth exists. | §26.10.6, [28](28-state-management-architecture.md) §28.9 |
| Customer identity | None. Cart cookie for a session, `guestToken` for one order. | §E12, §26.10.5 |
| Runtime | One Node.js process (Fastify), scaled horizontally | §26.2.4 |

## 26.2 The API style decision

### 26.2.1 The candidates

| Criterion | REST | tRPC | GraphQL |
|---|---|---|---|
| Edge-cacheable catalogue reads | Native: `GET` + URL + `ETag` | No: all calls are batched `POST` | Only with persisted queries and bespoke edge logic |
| Client-to-server type safety | Shared Zod plus inferred types | Native | Codegen |
| Consumable by a PSP, a carrier, a CSV importer, a crawler | Yes | No, it is a private RPC protocol | Awkward |
| Cost when a fifth consumer appears | Low | High | Low |
| Ops surface added | None | None | Cost analysis, depth limits, persisted-query store |
| N+1 risk | In the resolver you wrote | Same | Requires permanent DataLoader discipline |

### 26.2.2 Decision: REST

The deciding factor is not type safety and not ergonomics. It is **caching**.

The site must hit Lighthouse Performance 98 to 100 across a catalogue of **several hundred to
roughly a thousand SKUs** in four locales. `{{SKU_COUNT}}` is no longer a blocker:
[00-client-decisions-2.md](00-client-decisions-2.md) §E5 resolves it to whatever the catalogue
import yields, in that range, with the exact figure confirmed when the export is taken. The
multiplier is what matters and it is unchanged — whatever the count, it is multiplied by four
locales and joined by the 15 confirmed category nodes in
[00-client-decisions.md](00-client-decisions.md) D3 and the blog. Roughly 4,000 locale-scoped
product pages at the top of that range is the number the caching strategy is sized for, and it
sits comfortably inside the 2,000-SKU threshold §25.10 sets for moving off Postgres full-text
search. The only affordable
way to serve that from a small-budget
single-region deployment is to let a CDN answer most catalogue reads without touching Node or
Postgres at all.

Designing the caching strategy around an unknown catalogue size is deliberate. A CDN-fronted REST
surface costs the same to build at 300 SKUs as at 3,000, whereas discovering at month six that
the chosen protocol cannot be edge-cached is a rewrite. This is the one place in the architecture
where building for the larger number is cheaper than building for the smaller one.

CDN caching keys on method plus URL. tRPC sends every call as a `POST` to one batching endpoint,
so **every tRPC response is uncacheable at the edge by construction**. Recovering edge caching
under tRPC means writing REST endpoints alongside it for exactly the routes that matter most, at
which point the project maintains two API styles to avoid maintaining one.

GraphQL loses on a different axis. It is correct when many heterogeneous clients need different
shapes of one graph. Here there are two clients, written by the same team, changeable in the same
commit as the endpoint. Paying a permanent tax in query-cost analysis, depth limiting and
DataLoader plumbing to solve a problem the project does not have is the over-engineering the
brief forbids.

REST is also the only option the other actors already speak: the PSP posts a webhook, Nova Poshta
exposes JSON-RPC that must be proxied, the bulk importer posts spreadsheets, monitoring hits
`/health`, and search and AI crawlers read URLs
([30-ai-search-optimization.md](30-ai-search-optimization.md)).

### 26.2.3 What would change the answer

1. **Three or more independent clients** with genuinely divergent field needs (a native app plus
   a partner integration plus the admin). That is where GraphQL's over-fetch argument stops being
   theoretical.
2. **Catalogue reads stop being cacheable** because pricing becomes per-customer. A logged-in B2B
   portal is explicitly out of scope ([00-assumptions.md](00-assumptions.md) D1), but if it
   arrives, REST's caching advantage evaporates and tRPC wins on merit.
3. **The admin panel alone.** Admin traffic is authenticated, uncacheable, low-volume and
   internal; tRPC would be defensible there in isolation. Rejected anyway under
   [08-design-system.md](08-design-system.md) §8.2 principle 6: two protocols in one repository
   double the middleware, error handling, logging and onboarding cost to save typing in one
   client.

### 26.2.4 Why one process, not services

Orders, catalogue, content and media share one database and one transaction boundary. Reserving
stock, writing an `Order`, writing `OrderItem` snapshots and appending an `OrderEvent` must be
atomic (§25.5). A service split replaces a single `BEGIN…COMMIT` with a distributed saga,
compensating transactions and an outbox, to serve a shop whose realistic peak is orders per hour.
The simple choice is a modular monolith: one deployable, folders per domain, enforced import
boundaries ([27-folder-architecture.md](27-folder-architecture.md) §27.5). It scales by running
more copies behind the load balancer, which is sufficient well past this business's ceiling.

## 26.3 Rendering architecture

### 26.3.1 The honest problem

A default Vite build produces a client-rendered SPA. Two claims about that are routinely
conflated and both need stating plainly.

**Lighthouse SEO 100 is achievable with a pure SPA.** That audit checks title, meta description,
crawlable links, `robots.txt`, legible fonts and `hreflang` validity, all against the rendered
DOM. An SPA that sets head tags on mount passes. Scoring 100 here is necessary and close to
meaningless.

**Lighthouse Performance 98 to 100 is not achievable with a pure SPA on a photography-led product
page**, and neither is reliable indexation at this catalogue size.

1. **LCP.** The LCP element is a large hero photograph
   ([01-brand-strategy.md](01-brand-strategy.md) §1.8). In an SPA the browser cannot discover
   that image URL until the bundle has downloaded, parsed, executed, fetched
   `/api/v1/products/:slug` and rendered: four sequential round trips before the LCP resource is
   requested. On the mid-range Android baseline in [13-motion-system.md](13-motion-system.md)
   §13.5 that reliably lands LCP above 2.5 s and caps Performance in the seventies to eighties.
2. **Crawl budget on a cold-start domain.** Google renders JavaScript through a deferred queue.
   That is invisible for a handful of URLs on an established domain. Вівчарик launches with zero
   domain authority, zero backlinks and zero ranking history
   ([00-client-decisions.md](00-client-decisions.md) D2), which is precisely the condition under
   which crawl budget is scarcest and the render queue slowest. Requiring Google to execute
   JavaScript before it can see a product name, on a domain it has no reason to prioritise, is
   the worst possible combination. It also offers nothing at all to AI crawlers, several of which
   execute no JavaScript, and those matter disproportionately here because the realistic early
   organic entry point is long-tail informational content
   ([30-ai-search-optimization.md](30-ai-search-optimization.md)).

The cold start inverts the usual argument. A site migrating with existing authority can absorb a
few months of imperfect rendering. A new domain cannot: the first crawl is the one that decides
how much attention the domain gets next.

### 26.3.2 Options considered

| Option | Verdict |
|---|---|
| Pure SPA, accept the score | Rejected. Fails a stated requirement. |
| SPA plus dynamic rendering for detected bots | Rejected. A bot user-agent list maintained forever, divergence between bot and human views, and it does nothing for human LCP. |
| Migrate to Next.js | Rejected. Contradicts the specified stack, and App Router plus RSC is a far larger conceptual surface than a small team needs for mostly-static pages. |
| Full SSR on every request | Rejected as the default. Puts Node and Postgres on the critical path of every catalogue view for content that changes weekly. |
| **Hybrid: SSG plus cached SSR plus CSR** | **Recommended.** |

### 26.3.3 Recommendation

> **Conflict resolved — see [00-README.md](00-README.md) §Resolved conflicts.**
> This document originally specified **Vike**; [29-seo-architecture.md](29-seo-architecture.md)
> independently specified **React Router v7 framework mode**. The ruling is **React Router v7**.
> Both are Vite-native and the hybrid rendering table below is unchanged by the swap — only the
> framework's file-routing and data-loader API differ. The decision turned on handover risk, not
> capability: this build is eventually maintained by whoever the client can hire, and React
> Router is the larger, better-documented ecosystem. Read "Vike" below as "React Router v7".

Use **React Router v7 in framework mode** on the specified React + Vite + TypeScript stack, with
a rendering mode assigned per route class. It is Vite-native, so the stack decision holds: same
`vite.config.ts`, same Tailwind pipeline, same Framer Motion budget.

| Route class | Mode | Cache |
|---|---|---|
| `/`, `/about`, `/production`, `/wholesale`, `/contacts`, policy pages | SSG at build | CDN, immutable until deploy |
| `/catalog/*`, `/product/*`, `/blog/*`, `/gallery/*` | SSR, response cached | `s-maxage=300, stale-while-revalidate=86400`, purged on write |
| `/cart`, `/checkout/*`, `/order/*` | CSR inside the SSR shell | `private, no-store` |
| `/admin/*` | CSR, separate bundle | `no-store` ([27](27-folder-architecture.md) §27.12) |

`/account/*` is absent from this table because the route class does not exist:
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent, so
there are no account pages to assign a rendering mode to ([04-sitemap.md](04-sitemap.md) §4.7).
`/order/*` is the only authenticated-feeling route, and it is not authenticated — it is addressed
by `Order.guestToken`, which is why it is `private, no-store` rather than cached.

The SSR layer calls the API's service functions **in process**, not over HTTP to itself: same
deployment, same Prisma client, direct function call. A server calling itself over HTTP adds
serialisation, a socket and a failure mode for no benefit.

**Trade-offs, stated rather than glossed.** A Node process must now serve HTML, so static-only
hosting is out (accepted: the API needs Node anyway). Hydration mismatches become a real bug
class, mitigated by the rules in
[28-state-management-architecture.md](28-state-management-architecture.md) §28.8. Vike's
ecosystem is smaller than Next.js's, accepted because the surface used is small: file-based
routing, a data loader per page, a render hook. Cached SSR means an edit is not instantly visible
everywhere, solved by explicit purge on write (§26.13.3) rather than by shortening the TTL.

## 26.4 Versioning

Everything lives under `/api/v1`. The version is in the path rather than a header because it
appears in access logs without extra configuration, joins the CDN cache key for free, and can be
routed by a proxy rule without header inspection.

Inside a major version: adding an optional request field, an optional response field, a new
endpoint, or a member to a response-only enum is non-breaking. Removing or renaming a field,
tightening validation, changing a status code, or adding an enum member a client must handle
exhaustively is breaking, and requires `/v2` for the affected resource with `/v1` retained for
{{API_DEPRECATION_WINDOW}} (proposed: 90 days) serving `Deprecation` and `Sunset` headers per RFC
8594. Webhook receivers are never versioned by us; their shape is dictated by the sender.

With one team shipping both clients together, `/v2` should be rare. The scheme exists so that
when a mobile app or partner integration appears, the storefront is not held hostage by it.

## 26.5 URL and resource conventions

```
/api/v1/<resource>                      collection
/api/v1/<resource>/<id-or-slug>         member
/api/v1/<resource>/<id>/<sub-resource>  owned sub-collection
/api/v1/admin/<resource>                staff mirror: different projection, different permissions
/api/v1/webhooks/<sender>               inbound, signature-verified, no JWT
```

1. **Plural nouns, no verbs.** Two justified exceptions are transitions that are not field
   updates: `POST /orders/:number/cancel` and `POST /checkout/orders`. Modelling cancellation as
   `PATCH {status:"CANCELLED"}` invites clients to invent transitions the state machine forbids.
2. **Public reads use locale-scoped slugs; writes and admin reads use `cuid2`.** Slugs sit in
   indexable URLs and are unique only per locale (§25.2); ids are stable across renames.
3. **`/admin` is a namespace, not a query flag.** The admin projection carries `internalNote`,
   `DRAFT` rows, soft-deleted rows. A separate path means no public endpoint can be coaxed into
   leaking them by a parameter, and one CDN rule disables caching for all of it.
4. **No trailing slashes.** `/path/` 308-redirects to `/path` so the CDN keeps one entry per
   resource.
5. **`camelCase` bodies only**, matching the Prisma models and generated types.

## 26.6 Locale negotiation and translation fallback

First rule that yields a supported locale wins.

| # | Source | Example | Notes |
|---|---|---|---|
| 1 | Query parameter | `?locale=pl` | Authoritative. Sent on every request. |
| 2 | Path prefix, forwarded by the SSR layer | `/de/produkt/…` | How the storefront resolves rule 1 |
| 3 | `x-locale` header | `x-locale: en` | Non-browser consumers |
| 4 | `Accept-Language`, BCP 47 lookup | `pl-PL,pl;q=0.9` | First visit only, and only to choose a redirect target |
| 5 | Default | `uk` | Canonical locale ([00-README.md](00-README.md)) |

Rule 4 carries a rider that matters for caching: `Accept-Language` picks a `302` to a localised
URL on a first visit to `/`, and nothing else. If bodies varied on it, every cached catalogue
response would need `Vary: Accept-Language`, fragmenting the edge cache across the long tail of
browser language strings and effectively disabling it. Locale is in the URL so the cache key is
in the URL.

### The `x-translation-fallback` header

Implementing §25.2: a missing translation row serves the `uk` row rather than 404ing, and says so.

```http
GET /api/v1/products/lizhnyk-mozaika?locale=de
200 OK
content-language: uk
x-translation-fallback: true
x-translation-fallback-fields: description,metaDescription
vary: accept-encoding
```

| Header | Meaning |
|---|---|
| `content-language` | The locale actually served |
| `x-translation-fallback` | `true` when any field came from `uk`. Absent otherwise, never `false`. |
| `x-translation-fallback-fields` | Field paths that fell back; consumed by the admin completeness view |

Consequences: the page still renders, so a missing German description never produces an empty
product page. [29-seo-architecture.md](29-seo-architecture.md) consumes the header, emitting
`<meta name="robots" content="noindex,follow">` and excluding the URL from the sitemap, because
indexing a German URL serving Ukrainian body copy is worse for that locale than not existing yet.
The admin lists every entity with a non-empty field list, which is the completeness surface §25.2
requires. Fallback is computed per entity, so one response can be partially fallen back: a
translated name with an untranslated description. The field list disambiguates.

## 26.7 Pagination, filtering and sorting

### 26.7.1 Cursor versus offset

Neither is right everywhere. The rule is decided by whether a human or a crawler must address
page N.

| Endpoint class | Scheme | Why |
|---|---|---|
| Catalogue listing, blog index, gallery, search | **Offset**, `?page=2&perPage=24` | These URLs must be linkable, shareable and indexable. `/catalog/lizhnyky?page=3` is a stable address a crawler returns to; a cursor is an opaque token that changes as the set changes, making page 3 unaddressable. |
| Admin tables | Offset | Staff need "jump to page 12" and a total. Volumes are small, so `OFFSET` is cheap. |
| PDP reviews, order history, notifications | **Cursor**, `?cursor=<cuid2>&limit=20` | Append-only, newest-first, infinite scroll. Offset here produces the duplicate-and-skip bug when a row lands mid-scroll. |
| Audit log, search log, webhook log | Cursor | Large, strictly chronological, never deep-linked by page number. |

Offset's cost is bounded rather than ignored. `perPage` caps at 48 and `page` at 50, so the worst
query is `OFFSET 2352`, single-digit milliseconds against the indexes in §25.10. A page past the
last returns `200` with an empty `items` array, not a 404, and the SSR layer renders it
`noindex`. `total` is returned only below {{COUNT_THRESHOLD}} (proposed: 10,000) filtered rows,
`hasMore` above it. At this catalogue size the threshold is never reached, but the contract
exists before it matters.

### 26.7.2 Filter and sort grammar

```
GET /api/v1/products
  ?locale=uk
  &category=lizhnyky-sherstyanye-karpatskie-odeyala
  &filter[size]=150x200,200x220        // values within one facet are OR
  &filter[color]=natural               // separate facets are AND
  &priceMin=500000&priceMax=1500000    // minor units, inclusive
  &inStock=true&handmade=true
  &origin=OWN_MANUFACTURE              // ProductOrigin, see §26.10.1
  &sort=price_asc&page=1&perPage=24
```

- Facet keys are `AttributeDefinition.key` values with `isFilterable = true` (§25.3). An unknown
  key is a `422`, not a silent ignore: a silently dropped filter shows a visitor the wrong
  products and they will never know.
- OR within a facet, AND across facets. This is what shoppers expect and it matches the single
  grouped facet-count query in §25.10.2.
- **`origin` is a permanent top-level facet**, not an attribute, because
  [00-client-decisions.md](00-client-decisions.md) D3.4 requires buyers, and wholesale buyers in
  particular, to be able to restrict the catalogue to own manufacture. Modelling it as an
  ordinary attribute would make it deletable by an editor, and it is not an editorial
  convenience: it is the mechanism that keeps the verified-origin thesis
  ([01-brand-strategy.md](01-brand-strategy.md) §1.2) intact while the catalogue carries resold
  goods.
- **Size is a facet, never a path segment.** Size-as-subcategory is a storefront-platform
  workaround observed in the adjacent business and is not reproduced here.
- Sort whitelist: `relevance` (search only), `newest`, `price_asc`, `price_desc`, `name_asc`,
  `popularity`. Every sort tiebreaks deterministically on `id`, so pagination cannot repeat or
  drop a row when two products share a price.
- Filter state maps one-to-one onto the browser URL
  ([28](28-state-management-architecture.md) §28.5).

### 26.7.3 List envelope

```jsonc
{
  "items": [ /* … */ ],
  "page": { "number": 1, "perPage": 24, "total": 127, "totalPages": 6, "hasMore": true },
  "facets": [
    { "key": "size", "label": "Розмір", "values": [
      { "key": "150x200", "label": "150×200 см", "count": 47, "selected": false }
    ]}
  ],
  "appliedFilters": [ { "key": "color", "value": "natural", "label": "Натуральний" } ]
}
```

`appliedFilters` carries localised labels so the "filtered to zero" state required by
[08-design-system.md](08-design-system.md) §8.8 can name each active filter and clear them
individually without the client deriving labels it does not have.

## 26.8 The error envelope

One shape for every failure on every endpoint, including webhooks.

```jsonc
{
  "error": {
    "code": "CART_ITEM_OUT_OF_STOCK",
    "message": "Товару «Ліжник Мозаїка, 150×200» залишилось 1 шт.",
    "params": { "variantId": "clx…", "requested": 3, "available": 1 },
    "fieldErrors": [ { "path": "items.0.quantity", "code": "MAX", "params": { "max": 1 } } ],
    "requestId": "01JB7Q2M4S8V3W6X9Y0Z1A2B3C",
    "docs": "https://{{DOMAIN}}/api/v1/errors#CART_ITEM_OUT_OF_STOCK"
  }
}
```

| Status | When | Example `code` |
|---|---|---|
| `400` | Unparseable body, missing required header | `MALFORMED_BODY` |
| `401` | No credential, or expired or invalid access token | `AUTH_REQUIRED`, `TOKEN_EXPIRED` |
| `403` | Authenticated, permission key absent or `DENY`-granted | `PERMISSION_DENIED` |
| `404` | Absent, or soft-deleted and invisible to this caller | `PRODUCT_NOT_FOUND` |
| `409` | State conflict: idempotency reuse with a different body, price drift | `IDEMPOTENCY_KEY_CONFLICT`, `PRICE_CHANGED` |
| `410` | Withdrawn, and a `Redirect` row exists | `RESOURCE_GONE` |
| `422` | Valid syntax, refused semantics. Every Zod failure. | `VALIDATION_FAILED` |
| `429` | Rate limited; `Retry-After` always present | `RATE_LIMITED` |
| `500` | Unhandled. Never carries `params` or a stack trace. | `INTERNAL_ERROR` |
| `502`/`504` | PSP, carrier or Cloudinary failure or timeout | `UPSTREAM_UNAVAILABLE` |
| `503` | Deliberate maintenance mode | `SERVICE_UNAVAILABLE` |

The `400` versus `422` split is deliberate: `400` means the server could not understand the
request, `422` means it understood and refused. Only the second is ever shown beside a form field.

**Localisation.** `code` is the contract; `message` is a convenience. Clients never branch on
`message` and never display it when they hold a translation for the `code`.

- Codes are stable, uppercase, snake-cased and never renamed. Renaming one is breaking (§26.4).
- `params` supplies every interpolation value, so `errors.CART_ITEM_OUT_OF_STOCK` resolves to a
  natural sentence in all four locales without the client parsing English prose.
- The server renders `message` in the negotiated locale (§26.6) from the same catalogue, so
  non-browser consumers, logs and the admin get a readable string with no client help.
- `fieldErrors[].path` uses the dot-and-index notation of the Zod issue path, which is exactly
  what React Hook Form's `setError` expects. Server validation failures land on the right input
  with no translation layer.
- An unknown code renders a generic localised fallback. A visitor seeing
  `CART_ITEM_OUT_OF_STOCK` on screen is a bug.

`requestId` is echoed on every response, success or failure, and joins the browser, the log line
and the Sentry event (§26.18).

## 26.9 Validation: Zod, shared

Schemas are authored once in `packages/schemas`
([27-folder-architecture.md](27-folder-architecture.md) §27.9) and imported by both sides.

```ts
// packages/schemas/src/cart.ts
export const pricingUnit = z.enum(['PIECE', 'KILOGRAM', 'SKEIN', 'METRE']);

// quantity is in thousandths of the pricing unit, so 1.250 kg of rovnytsia is 1250.
// An integer wire format avoids float drift in cart maths, matching the money rule in §25.1.
export const addCartItemInput = z.object({
  variantId: z.string().cuid2(),
  quantityMilli: z.number().int().min(1).max(99_000),
});
export type AddCartItemInput = z.infer<typeof addCartItemInput>;

export const cartLine = z.object({
  id: z.string().cuid2(),
  variantId: z.string().cuid2(),
  sku: z.string(),
  name: z.string(),
  options: z.record(z.string(), z.string()),
  imageUrl: z.string().url().nullable(),
  pricingUnit,
  unitPriceMinor: z.number().int(),
  quantityMilli: z.number().int(),
  totalMinor: z.number().int(),
  maxAvailableMilli: z.number().int(),
});

export const cartResponse = z.object({
  id: z.string().cuid2(),
  currency: z.enum(['UAH', 'EUR', 'PLN', 'USD']),
  items: z.array(cartLine),
  subtotalMinor: z.number().int(),
  discountMinor: z.number().int(),
  couponCode: z.string().nullable(),
  freeShippingRemainingMinor: z.number().int().nullable(),
});
```

The server validates at the HTTP boundary with `safeParse` and maps the `ZodError` issue list
straight onto `fieldErrors`. The client passes the same object to the React Hook Form resolver,
so the browser rejects what the server would reject before a round trip. Response schemas are
parsed in development and tests only: a production parse of every body costs real CPU to catch a
class of bug CI already catches. The same schemas generate the OpenAPI document (§26.19), so
documentation cannot drift from validation because they are one artefact. **The server always
re-validates.** Client validation is a user-experience feature with no security value and is
never treated as if it had any.

## 26.10 Endpoint catalogue

Auth column: `—` public, `cart` cart cookie, `guest` guest order token, `staff` staff JWT plus the
named `Permission` key (§25.7), `sig` signature verification.

**Permission keys are canonical in
[24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4.** Every
key cited anywhere in this document must exist in `PERMISSION_CATALOGUE`; that constant is the
single definition, and a key spelled only here is a route that is either unreachable or unguarded.
A new endpoint needing a capability §24.4 does not define is a change to §24.4 first, never a new
string in this table.

There is deliberately **no customer-JWT tier**. An earlier revision carried one; it is removed
rather than left unused, because an auth tier that exists in a legend is an auth tier somebody
will eventually implement a route against.

### 26.10.1 Catalogue

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/categories` | — | Full tree in one request, cached hard |
| GET | `/v1/categories/:slug` | — | Category, hero media, breadcrumbs, children |
| GET | `/v1/products` | — | Listing, filters per §26.7.2 |
| GET | `/v1/products/:slug` | — | Full PDP payload |
| GET | `/v1/products/:slug/related` | — | Driven by `ProductRelation.kind` |
| GET | `/v1/products/:slug/availability` | — | Uncached: live `stockQty` minus live reservations |
| GET | `/v1/products/featured` | — | Homepage rails. **Hard-filtered to `OWN_MANUFACTURE`.** |
| GET | `/v1/facets` | — | Facet definitions and counts without the products |

The listing item is a deliberately narrow projection: `id`, `slug`, `name`, `priceMinMinor`,
`priceMaxMinor`, `currency`, `pricingUnit`, `inStock`, `isHandmade`, `isUniquePiece`, `origin`,
`partnerRegion`, primary media (`publicId`, `width`, `height`, `blurhash`, `alt`) and `badges`. It
reads only the denormalised `Product` columns §25.10.3 exists to provide and never aggregates
over `ProductVariant`. The member response adds `description`, the `variants` array with resolved
option maps, the gallery, the `attributes` specification table, the review summary and SEO
metadata.

### Origin is part of every product payload

Per [00-client-decisions.md](00-client-decisions.md) D3 as revised by
[00-client-decisions-2.md](00-client-decisions-2.md) §E7, `origin` and `partnerRegion` are
returned on **every** product projection, listing and member alike, and the API enforces four
rules the client cannot opt out of:

| Rule | Enforcement |
|---|---|
| The provenance block (`woolOrigin`, `woolMicron`, `productionStage`) is returned **only** when `origin = OWN_MANUFACTURE` | Serialiser omits the key entirely for partner goods, so a UI cannot render an in-house production claim it was never sent |
| **`partnerName` is never serialised to a public response** | The public product serialiser has no `partnerName` field. §E7 answers "can the partners be named" with «Ні», so the safest implementation is that the value has no route to a browser at all. It is readable only through `/v1/admin/products/:id`. |
| `partnerRegion` **is** public where known | «Косівщина», «Гуцульщина». Regional provenance without a company name is still meaningful and still honest, and it is what the public label «Виготовлено карпатським майстром» is derived from |
| Structured-data fields differ by origin | The response carries `schemaBrand` and `schemaManufacturer` computed server-side, so [29-seo-architecture.md](29-seo-architecture.md) and [17-product-page-specification.md](17-product-page-specification.md) §17.21.3a emit a truthful `Product` node without re-deriving the rule. `schemaBrand` is **Вівчарик on both origins**; for partner goods `schemaManufacturer` is **omitted** rather than set to Вівчарик — omission is honest, misattribution is not. Serialiser below. |

The inversion here is worth stating plainly, because it reverses an earlier rule in this
document. The old design **required** `partnerName` on partner goods and rejected a blank one
with `422`, on the reasoning that an unnamed partner product is undisclosed resale. §E7 removes
the ability to satisfy that requirement. The disclosure obligation does not go away with it — it
moves entirely onto the `origin` flag and the visible label, which is why
[01-brand-strategy.md](01-brand-strategy.md) §1.7b keeps the partner mark at equal visual weight
to «Власне виробництво» and the origin facet pinned to the top of the filter panel. Not being able
to name the partner is a reason to be *more* explicit that an item is not own-made, not less.

### The brand rule, and the serialiser that enforces it

[00-client-decisions-3.md](00-client-decisions-3.md) F3 answers the question §E7 left open:
partner goods **are** sold under the Вівчарик brand. schema.org already draws exactly the
distinction this needs — `brand` is the brand the item sells under, `manufacturer` is the
organisation that produced it — and here the two diverge.

```ts
// packages/api/src/serialisers/product.ts

type SchemaOrigin =
  | { schemaBrand: 'Вівчарик'; schemaManufacturer: 'Вівчарик' }   // OWN_MANUFACTURE
  | { schemaBrand: 'Вівчарик' };                                   // PARTNER_MANUFACTURE

const BRAND = 'Вівчарик' as const;

/**
 * F3: the brand is Вівчарик on every product, both origins.
 * F3 + E7: `manufacturer` is ABSENT for partner goods — not null, not an
 * empty object, and never Вівчарик. There is no true value to emit, because
 * `partnerName` may not be rendered on any surface, structured data included.
 */
export function serialiseSchemaOrigin(origin: ProductOrigin): SchemaOrigin {
  return origin === 'OWN_MANUFACTURE'
    ? { schemaBrand: BRAND, schemaManufacturer: BRAND }
    : { schemaBrand: BRAND };
}
```

The return type is a **discriminated union with an absent key**, not an optional property. A
`schemaManufacturer?: string` would let `undefined` reach `JSON.stringify` harmlessly today and
let a later `?? BRAND` default slip past review; a shape in which the key does not exist cannot
be defaulted into existence. The serialiser is also the only place either value is produced —
no route, no template and no SEO helper constructs a brand string of its own.

Three invariants are asserted in the contract test suite, and each one fails a build:

| Invariant | Test |
|---|---|
| `schemaBrand === 'Вівчарик'` on every public product projection | Fixture sweep across both origins |
| `'schemaManufacturer' in payload === false` for every `PARTNER_MANUFACTURE` row | `Object.hasOwn`, not a truthiness check — a falsy-but-present key is the exact failure being guarded |
| No public response contains `partnerName` at any depth | Deep key scan over every serialised fixture (§E7) |

The second test is the important one and it is worth saying why it exists as a test rather than
as a comment. The failure it prevents is silent: a `manufacturer: Вівчарик` node on a resold
product does not break a page, does not raise an error, and does not look wrong in a diff. It
simply publishes a false claim to Google Merchant Center, to Search, and to the AI assistants
[30-ai-search-optimization.md](30-ai-search-optimization.md) targets — where it is then repeated
as fact by systems the business cannot correct.

**One consequence worth stating in an API document, because the API is where it becomes
invisible.** Once `brand` is Вівчарик on every product, the payload no longer distinguishes the
two origins to any consumer that is not specifically reading `origin` or checking for
`schemaManufacturer`. That is precisely why `origin` is a **required field on every projection**,
listing and member alike, and why `GET /v1/products/featured` hard-filters in the handler. The
brand name stopped carrying the origin signal; the `origin` field is now the only thing that
does, and the API's job is to make it impossible for a client to render a product without it.

`GET /v1/products/featured` exists as a separate endpoint rather than
`GET /v1/products?featured=true` precisely so the own-manufacture constraint is in the handler,
not in a query parameter a future homepage change could forget. D3.5 requires that partner goods
never appear in the hero, the production storytelling or the best-seller rail; making that a
property of the endpoint rather than of the caller is the difference between a rule and a
convention.

`availability` is split out precisely so the PDP stays edge-cacheable for five minutes while the
"only 1 left" state stays truthful: the cached page ships a stock hint, the live call corrects it
before add-to-cart enables for a one-of-one piece ([00-assumptions.md](00-assumptions.md) B4).

### 26.10.1a Custom sizing — the one price not read from a row

[00-client-decisions-5.md](00-client-decisions-5.md) §H3b makes made-to-measure a property of
**which size the customer picks**, not of the product: the same ліжник is stocked at 150×200 and a
fourteen-day build at 180×240. §H3c then settles how the second one is priced — the owner sets a
rate in the admin, the system does the arithmetic.

The member response therefore carries a `customSize` block, present only when
`Product.allowsCustomSize` is true, and absent — not null, not disabled — otherwise:

```ts
export interface CustomSizeConfig {
  ratePerSqmMinor: number;   // Product.customSizeRatePerSqmMinor
  minPriceMinor:   number;   // Product.customSizeMinPriceMinor — the floor
  minWidthCm:  number; maxWidthCm:  number;   // loom width. A physical limit.
  minLengthCm: number; maxLengthCm: number;
  leadTimeDays: number;      // Product.madeToOrderDays — 14
  currency: Currency;
}

/**
 * H3c. The ONLY implementation. Shared verbatim by the PDP buy box and the
 * checkout service, so the number the customer saw and the number they are
 * charged are produced by the same code path.
 */
export function priceCustomSize(cfg: CustomSizeConfig, spec: CustomSpec): number {
  assertWithinBounds(cfg, spec);                       // throws → 422, never clamps
  const areaSqm = (spec.widthCm * spec.lengthCm) / 10_000;
  const raw = Math.round(areaSqm * cfg.ratePerSqmMinor);
  return roundToWholeCurrencyUnit(Math.max(raw, cfg.minPriceMinor));
}
```

Four rules the API enforces and the client cannot opt out of:

| Rule | Enforcement | Why |
|---|---|---|
| **The price is recomputed server-side at checkout** | `POST /v1/checkout/orders` calls `priceCustomSize` from the **live** `Product` row and ignores any price on the wire, exactly as it already does for `ProductVariant.priceMinor` (§26.10.4). A mismatch against what the client displayed returns `409 PRICE_CHANGED` with the new figure | This is the only price in the system that is *computed* rather than *read*, which makes it the only one a client could plausibly try to author. A custom order is **prepaid in full** (§H1.1), so a tampered figure is not an unpaid invoice to chase — it is money already taken at the wrong amount. The browser's number is informational; the server's number is what is charged |
| **Dimensions outside the bounds are rejected, never clamped** | `422 CUSTOM_SIZE_OUT_OF_RANGE` naming the axis and the permitted range | The bounds are loom and frame limits, not preferences. Silently clamping 260 cm to 200 cm would take payment for a size the customer did not order; the storefront's inputs constrain themselves so this path is a tamper guard rather than a user-facing error ([00-client-decisions-5.md](00-client-decisions-5.md) §H3c) |
| **`allowsCustomSize` with a null rate is unpublishable** | `POST /v1/admin/products/:id/publish` returns `422 CUSTOM_SIZE_RATE_REQUIRED` while `customSizeRatePerSqmMinor` or any of the four bounds is null | A published product offering «Свій розмір» with no rate renders a size option that cannot produce a price. The publish gate is where every other structural completeness rule already lives (§23.6.10) |
| **The computed price is snapshotted into `OrderItem`** | `unitPriceMinor` and `customSpec` are written at order time and never recomputed afterwards (§25.5) | A rate change in month six must not restate a January order. The snapshot rule is the same one that governs every other order line; the custom line is not an exception to it |

`customSpec` — `{ widthCm, lengthCm }` — travels from the cart line into `OrderItem.customSpec`
unchanged, and is returned on every order projection. A weaver needs the measurements, and so does
the printed packing slip ([23-admin-panel-architecture.md](23-admin-panel-architecture.md)
§23.8.5).

**A percentage uplift over the nearest standard size was rejected**, per §H3c. It prices by
reference to a size the customer did not choose, and the multiplier has to grow non-linearly to
stay honest as the piece gets larger. Rate-per-square-metre matches how the cost is actually
incurred — wool consumed and loom hours — which is also what makes the number in the admin one the
owner can reason about rather than tune.

**`Category.defaultCustomSizeRatePerSqmMinor` is never read by this API.** §H3c makes it a seed
value for the admin product form, copied into `Product` on create. `priceCustomSize` takes its
rate from the `Product` row and has no fallback path to the category — deliberately, because a
fallback would make an edit to a category rate silently reprice every product that never overrode
it. The serialiser does not return the category field on any projection, public or admin-facing
outside the category editor, so there is no route by which a client could resolve a price through
it. [23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6.4b carries the admin
half, including the opt-in bulk apply that gives the owner the convenience without the hazard.

### 26.10.2 Search

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/search?q=&locale=` | — | Postgres FTS over `ProductTranslation` and `PostTranslation.bodyPlain` |
| GET | `/v1/search/suggest?q=` | — | Typeahead: max 8 products, 3 categories, 3 posts |
| POST | `/v1/search/click` | — | Fire-and-forget, writes `SearchQueryLog.clickedId`, returns `204` |

Every search writes a `SearchQueryLog` row with `resultCount`. Zero-result queries are the
merchandising signal §25.9 calls out, so the write happens on the search, not on the click.

### 26.10.3 Cart

Identity is the httpOnly `Cart.token` cookie (§25.6). No cart endpoint requires a login.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/cart` | cart | Creates an empty cart and sets the cookie if absent |
| POST | `/v1/cart/items` | cart | Body `addCartItemInput` |
| PATCH | `/v1/cart/items/:itemId` | cart | `quantityMilli` only; `0` is rejected, use DELETE |
| DELETE | `/v1/cart/items/:itemId` | cart | |
| POST/DELETE | `/v1/cart/coupon` | cart | Validates `usageLimit`, `perCustomerLimit`, `minSubtotalMinor` |

`POST /v1/cart/merge` is **removed**. It existed to fold a guest cart into an account cart at
login, and §E12 deletes login. One cart, one cookie, one lifecycle — which also removes the
quantity-summing-then-re-clamping edge case that was the most delicate arithmetic in the cart
service. `Coupon.perCustomerLimit` is now enforced against the order-derived `Customer` matched by
email at checkout rather than against a logged-in identity; it is therefore a soft limit, and the
admin UI must say so rather than implying a guarantee it cannot make against a determined buyer
with two email addresses.

**Every cart mutation returns the complete cart**, never a delta. That response is the reconciled
truth the client snaps back to after an optimistic update
([28](28-state-management-architecture.md) §28.4). A delta would force the client to reimplement
pricing, coupon and free-shipping-threshold maths that already exists server-side, and the two
would drift.

### Quantity is not always a count

[00-client-decisions.md](00-client-decisions.md) D4 confirms that вовняна пряжа, ровниця and
вовна для рукоділля are sold by weight rather than by unit, against the existing
`PricingUnit.KILOGRAM` and `PricingUnit.SKEIN` values (§25.3). The cart therefore carries
`quantityMilli`, an integer in thousandths of the product's pricing unit, and every line total is
`unitPriceMinor × quantityMilli / 1000` rounded once, at the line, using banker's-free integer
arithmetic. A single quantity field with a per-line unit is preferred over parallel `quantity`
and `weightKg` fields, because two fields means every consumer of a cart line has to branch, and
one of them eventually will not.

Shipping weight for these lines is the purchased quantity itself rather than
`ProductVariant.weightGrams`, which makes the delivery estimate more accurate for the
needleworker audience than anywhere else in the catalogue.

**Dye lots: resolved as not tracked.** [00-client-decisions-2.md](00-client-decisions-2.md) §E8
closes [00-client-decisions.md](00-client-decisions.md) D6.3. `ProductVariant.dyeLot` stays in the
schema, nullable and unused; **the API exposes no lot concept anywhere** — not in the product
payload, not as a facet, not as a constraint on `POST /v1/cart/items`. Exposing a field the
business cannot populate would imply a same-lot guarantee it cannot honour, and a broken guarantee
costs more than an absent feature.

The return risk it was meant to mitigate is handled in copy instead: the yarn PDP carries
«Відтінок може незначно відрізнятися між партіями. Для великого проєкту радимо замовити всю
кількість одразу.» That reads as expertise rather than as a hedge, and it reduces the same
returns without a schema promise behind it. Revisit only if returns data shows lot mismatch
becoming a measurable cost.

### 26.10.4 Checkout

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/checkout/shipping-methods` | cart | Carriers and rates for the cart's weight and destination |
| GET | `/v1/checkout/payment-methods` | cart | **Derived from cart contents and destination.** §26.10.4b |
| GET | `/v1/checkout/np/cities?q=` | cart | Server-side proxy to Nova Poshta |
| GET | `/v1/checkout/np/warehouses?cityRef=` | cart | Branches and lockers |
| POST | `/v1/checkout/reserve` | cart | Writes `StockReservation`, TTL {{RESERVATION_MINUTES}} (proposed: 20) |
| POST | `/v1/checkout/orders` | cart | **Idempotent**, §26.11 |
| POST | `/v1/checkout/orders/:id/payment` | guest | Initialises the WayForPay transaction. **Return shape blocked on V6** — see §26.14.1. |
| GET | `/v1/checkout/orders/:id/status` | guest | Polled by the return page while the webhook lands |

**There is no split endpoint, and this is deliberate.** An earlier revision specified
`POST /v1/checkout/split`, which took a mixed cart and produced two linked orders.
[00-client-decisions-6.md](00-client-decisions-6.md) §J1 withdraws the split — «Надіслати разом.»
— so the endpoint, its `SplitPreview` and `SplitResult` shapes and the `Order.splitGroupId`
linkage are **removed rather than deprecated**. A mixed cart goes through
`POST /v1/checkout/orders` like any other cart and produces one order. What replaced the split is
a constraint carried in the cart and payment-method responses (§26.10.4b), which is data the
storefront renders rather than an operation it invokes.

Address lookup is proxied rather than called from the browser, resolving
[00-assumptions.md](00-assumptions.md) V2: the carrier key never reaches the client. The proxy
caches cities for 24 h and warehouses for 1 h, which also insulates checkout from carrier latency.

#### The international path — enquiry-then-invoice

[00-client-decisions-2.md](00-client-decisions-2.md) §E11 makes `en`, `pl` and `de`
transactional, so checkout has two shapes rather than one. The choice between them is driven by
`shippingAddress.country`, resolved server-side, and it is a branch in the **data** rather than a
second set of endpoints.

[00-client-decisions-3.md](00-client-decisions-3.md) F4 then changes what the international shape
*is*. The business ships «Новою поштою, Укрпоштою та різними перевізниками», picking the carrier
per order, with the buyer paying shipping **and** all customs duties and import taxes — an
effective DAP position. `{{INTL_CARRIER}}` therefore resolves to *multiple, quoted per order*,
and the consequence for this document is concrete:

> **`GET /v1/checkout/intl/rates` is removed.** It was specified as a server-side proxy to a
> carrier rate API, on the assumption that one carrier would be contracted. There is no single
> upstream to proxy, so the endpoint has nothing to call. Nothing replaces it, because the answer
> is not a different rate source — it is that the rate is produced by a human, per order, after
> submission.

The recommended model is **enquiry-then-invoice**, specified in
[18-checkout-specification.md](18-checkout-specification.md) §18.23.7: the customer submits a
complete order, receives a shipping quote, then pays. It beats flat-rate zones, which overcharge
the easy destinations and lose money on the hard ones, and it is what the operation actually
does.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/checkout/countries` | — | Shippable destinations with their available methods, payment methods and the localised `dutyDisclosure` string. Cached 1 h. |
| POST | `/v1/checkout/orders` | cart | Unchanged path. For `country != 'UA'` it creates the order with `shippingMinor = 0`, `quoteStatus = AWAITING_QUOTE`, and **no payment initialisation**. Returns `guestToken` and the SLA deadline. |
| GET | `/v1/orders/:guestToken/quote` | guest | The current quote: `quoteStatus`, `quotedCarrierName`, `shippingMinor`, `totalMinor`, `quoteExpiresAt`. Polled by the tracking page; uncached. |
| POST | `/v1/orders/:guestToken/quote/decline` | guest | Buyer declines. `quoteStatus → DECLINED`, order `CANCELLED`, reservations released. |
| POST | `/v1/checkout/orders/:id/payment` | guest | Unchanged path, gated: `422 QUOTE_NOT_ISSUED` while `AWAITING_QUOTE`, `410 QUOTE_EXPIRED` past `quoteExpiresAt`. |
| POST | `/v1/admin/orders/:id/quote` | staff `orders.quote` | Issue or re-issue. Body `{ carrierName, shippingMinor, transitEstimate?, note? }`. |
| POST | `/v1/admin/orders/:id/quote/withdraw` | staff `orders.quote` | Destination becomes unshippable, or the item sold domestically first. |
| GET | `/v1/admin/orders?quoteStatus=AWAITING_QUOTE` | staff `orders.read` | The operator queue, oldest first, with destination, weight, declared value and largest dimension precomputed. |

`GET /v1/checkout/shipping-methods` returns domestic Nova Poshta and Ukrposhta options for
`country = UA`. For any other country it returns a **single synthetic method** describing the
quoted-per-order model with no price — the client renders whichever it is given and never
decides, and it must never have to construct that explanation itself.

##### Order state, mapped onto existing enums

No `OrderStatus` or `PaymentStatus` member is added. An order awaiting a quote is `PENDING` and
`UNPAID`, which is precisely what those values already mean in
[25-database-schema.md](25-database-schema.md) §25.5. The quote lifecycle is a **third, nullable
axis**, non-null only where `shippingCarrier = INTERNATIONAL`.

```prisma
// Schema addendum — ratify in 25-database-schema.md §25.5 before building.
enum QuoteStatus { AWAITING_QUOTE QUOTED ACCEPTED DECLINED EXPIRED WITHDRAWN }

model Order {
  quoteStatus            QuoteStatus?   // null on every domestic order
  quoteExpiresAt         DateTime?
  quotedCarrierName      String?        // free text: F4's carriers are an open set
  quotedAt               DateTime?
  quotedByStaffId        String?
  dutyDisclosureSnapshot Json?          // exact string, locale, acknowledged timestamp
  @@index([quoteStatus, placedAt])
}
```

| API event | `OrderStatus` | `PaymentStatus` | `quoteStatus` |
|---|---|---|---|
| `POST /v1/checkout/orders`, `country != UA` | `PENDING` | `UNPAID` | `AWAITING_QUOTE` |
| `POST /v1/admin/orders/:id/quote` | `PENDING` | `UNPAID` | `QUOTED` |
| Payment webhook, success (§26.14.1) | `CONFIRMED` | `PAID` | `ACCEPTED` |
| `POST …/quote/decline` | `CANCELLED` | `UNPAID` | `DECLINED` |
| `orders.expireQuotes` job (§26.17) | **`PENDING`** | `UNPAID` | `EXPIRED` |
| `orders.cancelLapsedQuotes` job (§26.17) | `CANCELLED` | `UNPAID` | `EXPIRED` |
| `POST …/quote/withdraw` | `CANCELLED` | `UNPAID` | `WITHDRAWN` |

**Expiry no longer cancels the order, and that is a change.** An earlier revision had
`orders.expireQuotes` move the order to `CANCELLED` in the same transaction that released the
reservations. [00-client-decisions-5.md](00-client-decisions-5.md) §H2 overrides it: «a quote that
expires is not a dead order». Expiry now releases the stock — which is the part that costs the
business money — and leaves `OrderStatus = PENDING` with `quoteStatus = EXPIRED`, which is exactly
the state a one-click re-issue operates on. A second job, `orders.cancelLapsedQuotes`, closes it
after `{{QUOTE_LAPSE_DAYS}}` (default 14) so the queue does not accumulate indefinitely. Separating
the two is what lets the stock be freed in hours while the opportunity survives for a fortnight;
doing both at once optimised for the wrong one.

Adding six values to `OrderStatus` instead would force every list filter, permission check,
analytics rollup and reconciliation query to handle states that carry no fulfilment meaning, and
would break the invariant that `OrderStatus` describes where the goods are. A nullable third axis
leaves every existing consumer correct without modification — which is the only reason a schema
addendum is defensible here at all.

`POST /v1/admin/orders/:id/quote` runs in one transaction: rewrite `shippingMinor` and
`totalMinor`, set `quoteStatus`, `quotedAt`, `quotedByStaffId` and `quoteExpiresAt`, extend the
`StockReservation` rows to match `quoteExpiresAt`, append an `OrderEvent` with `fromValue`,
`toValue` and `actorId`, and enqueue the quote email. `shippingMinor > 0` is enforced at
the API, not the UI: F4 rules that free shipping never applies internationally, and the likeliest
route to violating that is an operator leaving a field blank.

##### Quote timing — the tokens are resolved

[00-client-decisions-5.md](00-client-decisions-5.md) §H2 sets both numbers. They are operational
commitments rather than settings, and they are recorded here because the API is what enforces one
of them and measures the other.

| Token | Value | Where it acts |
|---|---|---|
| `{{QUOTE_SLA_HOURS}}` | **48 working hours** | `orders.quoteSlaAlert` (§26.17); the age counter on `GET /v1/admin/orders?quoteStatus=AWAITING_QUOTE` |
| `{{QUOTE_EXPIRY_HOURS}}` | **72 hours** from issue | Default `quoteExpiresAt` on `POST …/quote` |
| One-of-one items | **36 hours** | Halved where any line is `isUniquePiece`; already specified in [18-checkout-specification.md](18-checkout-specification.md) §18.23.7 |

**Working hours, not elapsed hours**, is the load-bearing detail in the SLA. The alert job resolves
48 *working* hours against the Europe/Kyiv business calendar in `Setting`, so an enquiry arriving
at 18:00 on Friday is not in breach at 18:00 on Sunday. Measuring the promise differently from the
way it was made produces an alert nobody believes and then an alert nobody reads. The customer-facing
copy under-promises against both figures — «протягом 2 робочих днів» — because a quote arriving in
four hours is a pleasant surprise and the reverse is a complaint.

**An expired quote is re-issuable in one click.** Re-quoting is permitted while `QUOTED` and unpaid,
**and from `EXPIRED`**, which is the case §H2 specifically calls out: a quote that lapsed is a lapsed
opportunity, not a dead order. Re-issue from `EXPIRED` re-runs the same handler with two additions —
it re-acquires `StockReservation` rows, which the expiry job released, and it fails with
`409 STOCK_UNAVAILABLE` naming the lines if the goods have since sold. Either way it writes a second
`OrderEvent` and resets the expiry. The alternative, forcing the customer to resubmit the whole
enquiry, discards a destination, a weight and an address that were already correct, and it is the
point at which an international buyer gives up.

Five constraints are enforced in the handler, not in the UI:

| Constraint | Enforcement | Why |
|---|---|---|
| **COD is domestic only** | `paymentMethod = COD` with `country != 'UA'` is `422 COD_NOT_AVAILABLE_INTERNATIONALLY` | No Ukrainian carrier collects cash abroad. A UI-only check would be bypassed by a direct request, and the failure would surface as an unpayable order rather than as a validation error. |
| **Hide categories are gated by destination** | Cart lines whose category is sheepskin or leather are rejected for EU destinations until the paperwork is confirmed, with `422 CATEGORY_NOT_SHIPPABLE_TO_COUNTRY` naming the lines | §E11 recommends launching `de`/`pl` **wool-only**: sheepskin and leather face EU species-declaration and, for some materials, CITES documentation. Shipping first and discovering the requirement at customs means a seized parcel and a refund. |
| **Duty disclosure is acknowledged before the order is created** | `POST /v1/checkout/orders` requires `dutyDisclosureAck` on non-UA orders and returns `422 DUTY_DISCLOSURE_NOT_ACKNOWLEDGED` without it. The exact string shown, its locale and the acknowledgement timestamp are snapshotted into `dutyDisclosureSnapshot` | F4 puts all duties and import taxes on the buyer. A recipient surprised by an import VAT bill refuses the parcel and the shop absorbs an international return — the most common way small cross-border shops lose money. The snapshot is the only defence in a chargeback, and a `Json` snapshot rather than a boolean because "they ticked a box" is not evidence of *what* they were told. |
| **Free shipping is never applied internationally** | The pricing service rejects any promotion or coupon that would zero `shippingMinor` on a non-UA order, and the quote endpoint rejects `shippingMinor = 0` | F4, stated without a value threshold. A discount engine that can be configured into an unbounded loss eventually will be. |
| **Currency is whatever WayForPay actually settles** | Blocked on V11. Until confirmed, prices **display** converted and the order is **charged in UAH**, and the checkout says so in the active locale. | Displaying EUR and charging UAH without saying so is a chargeback waiting to happen. |

**`quotedCarrierName` is free text, deliberately.** F4's carrier set is open — «різними
перевізниками» — so an enum would need a migration every time the business tries a carrier it has
not used before. `ShippingCarrier.INTERNATIONAL`
([25-database-schema.md](25-database-schema.md) §25.5) remains the coarse routing value; the
specific name is data, and data that is never matched on does not need to be an enum.

`POST /v1/checkout/orders` performs in one transaction: revalidate every line against live stock;
consume matching `StockReservation` rows; recompute every price from `ProductVariant.priceMinor`,
ignoring what the client sent; apply the coupon; allocate `Order.number`; write `Order`,
`OrderItem` snapshots and the opening `OrderEvent`; mint `guestToken`; mark the cart consumed.
Client-sent prices are read only for comparison, and a mismatch returns `409 PRICE_CHANGED` with
the new totals so the UI can show what changed rather than silently charging a different amount.

### 26.10.4b Payment methods are derived, not filtered

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.1 and §H1.2 together make the set of
available payment methods a **function of the cart and the destination**. The API computes it and
returns it; the client renders what it is given.

```ts
// GET /v1/checkout/payment-methods?country=UA → PaymentMethodsResponse
export interface PaymentMethodsResponse {
  /** Present means offerable. An unavailable method is ABSENT, not disabled. */
  methods: Array<
    | { key: 'CARD_ONLINE'; label: string }
    | { key: 'BANK_TRANSFER'; label: string }
    | { key: 'COD'; label: string; forwardShippingMinor: number;
        returnDepositMinor: number; codAmountMinor: number }
  >;
  /** Why a method a customer might expect is not here. Copy, not a code. */
  exclusions: Array<{ method: 'COD'; reason: string; affectedLineIds: string[] }>;
}
```

The derivation, in order, evaluated server-side against the persisted cart:

| Condition | Effect on `COD` |
|---|---|
| `country != 'UA'` | **Absent.** No Ukrainian carrier collects cash abroad, and §H1.3's deposit is impermissible for EU consumers anyway |
| Any line has a `customSpec` — a custom-size configuration | **Absent.** §H1.1: the workshop commits fourteen days of labour to a size nobody else will buy, so the item is prepaid in full |
| Otherwise | Present, with the deposit arithmetic precomputed (§26.10.4c) |

Three properties of this design are the whole point of specifying it as an endpoint rather than as
a rule:

- **`COD` is absent from the response, not flagged unavailable.** A method that arrives as
  `{ key: 'COD', available: false }` is one careless `.map()` away from being rendered, and one
  careless handler away from being accepted. Absence cannot be re-enabled by a client bug.
- **`POST /v1/checkout/orders` re-derives it and does not trust the submission.** A body carrying
  `paymentMethod = 'COD'` against a cart containing a custom line returns
  `422 COD_NOT_AVAILABLE_FOR_MADE_TO_ORDER`, and against a non-UA destination returns the existing
  `422 COD_NOT_AVAILABLE_INTERNATIONALLY`. The list endpoint is an affordance; the order endpoint
  is the boundary. This is the same relationship §24.14 draws between hidden buttons and API
  enforcement, and it holds for the same reason.
- **`exclusions` carries copy, not a code**, and the copy states the reason rather than the rule:
  «Виріб шиється за вашими розмірами, тому оплата — повна, наперед. Виготовлення — 14 днів.»
  §H1.1 is explicit that the restriction reads as distrust unless the reason is visible, and a
  client that has to compose that sentence itself will eventually compose a worse one, in one
  locale, and never in the other three.

#### Mixed carts — one order, and a constraint the cart response carries

A cart holding one stocked item and one custom item is the **expected** case rather than an edge
case, because `allowsCustomSize` is per product (§H3b).

[00-client-decisions-6.md](00-client-decisions-6.md) §J1 settles what such a cart produces: **one
order, one parcel, one delivery charge, dispatched after the fourteen-day production period.** An
earlier revision of this document specified `POST /v1/checkout/split`, a `splitGroupId` on `Order`
and a paired-order response shape. All of it is **removed**, not deprecated — the split cost the
customer a second delivery charge and the business a second parcel and waybill, for a few days
saved on one line, and at a two-person scale that trade is not worth making.

Nothing replaces it at the endpoint layer, and that is the point: what was an *operation* becomes
a *property of the cart*, computed server-side and returned as data.

```ts
// One further member on the PaymentMethodsResponse declared above, carried
// identically on the cart responses (GET /v1/cart, POST /v1/cart/items).
export interface PaymentMethodsResponse {
  // methods, exclusions — as declared above

  /**
   * Present only when the cart holds at least one line WITH a customSpec and at
   * least one WITHOUT. Absent otherwise — never `null`, never a false flag.
   * §J1. The storefront renders `disclosure` verbatim; it never composes it.
   */
  mixedCart?: {
    /** Lines whose terms changed because of a different line in the same cart. */
    affectedStockedLineIds: string[];
    /** The line that caused it, so the UI can name the escape concretely. */
    causingLineIds: string[];
    leadTimeDays: number;                  // 14
    estimatedDispatchDate: string;         // a DATE, per G2 rule 4
    /** One delivery charge. Stated so no client infers two from two dispatch kinds. */
    shipmentCount: 1;
    /** Localised copy, server-authored. §J1's wording. */
    disclosure: string;
    /** The escape, as copy. There is no endpoint behind it — see below. */
    alternative: string;
  };
}
```

| Decision | Reasoning |
|---|---|
| **One `Order` row, no group identifier, no schema addendum** | The earlier revision proposed `Order.splitGroupId String?` against [25-database-schema.md](25-database-schema.md) §25.5. That addendum is withdrawn. One purchase is one order, one `number`, one `guestToken`, one carrier consignment — which is what the schema already expresses |
| **The constraint is returned with the payment methods, not discovered at order creation** | It is the same object that already answers "why is COD missing", and a client that receives the exclusion and the disclosure together cannot render one without the other |
| **`disclosure` and `alternative` are server-authored strings, not codes** | Identical reasoning to `exclusions[].reason` above: a client composing this sentence itself will eventually compose a worse one, in one locale, and never in the other three. This is the single most misreadable message in the checkout after the deposit copy |
| **`affectedStockedLineIds` exists so the UI can be specific** | The counter-intuitive part of §J1 is that the terms of a line the customer added *earlier* have changed. A disclosure that names those lines is a fact; one that speaks about "your order" in the abstract invites the buyer to assume it means the custom item only |
| **`alternative` is copy, and there is no endpoint behind it** | The escape is «оформіть його окремим замовленням» — a suggestion the customer acts on by placing two orders. There is deliberately **no** API that removes lines and creates a second order on their behalf. That would be the split again, wearing a different name (§J1) |
| **`shipmentCount: 1` is stated rather than implied** | A literal `1` in the contract is what stops a future client from rendering a per-dispatch-group shipping breakdown out of good intentions |

**Where the constraint binds.** `POST /v1/checkout/orders` re-derives `availableMethods` inside the
transaction exactly as above, so a mixed cart submitted with `paymentMethod = 'COD'` returns
`422 COD_NOT_AVAILABLE_FOR_MADE_TO_ORDER` regardless of what the client displayed. The order is
created with **full prepayment**, **one** shipping charge, and **no return-shipping deposit** — the
deposit is a COD mechanic (§26.10.4c) and a prepaid order has no refusal step to fund. It is
`CONFIRMED` on payment and then `IN_PRODUCTION` for the whole order, including its stocked lines
(§26.10.4d).

**The disclosure's timing is a storefront obligation, not an API one, and the API is shaped to
support it.** [00-client-decisions-6.md](00-client-decisions-6.md) §J1 requires the customer to be
told at the moment the custom item is added, not at the payment step. `mixedCart` is therefore
returned on **the cart mutation response** as well as on `GET /v1/checkout/payment-methods`, so
`POST /v1/cart/items` can carry the disclosure back in the same round trip that confirms the add.
An API that only exposed it at checkout would make the correct storefront behaviour impossible to
implement without a second request, and a second request is a thing that gets skipped.

### 26.10.4c The return-shipping deposit

[00-client-decisions-5.md](00-client-decisions-5.md) §H1.3 is the most unusual rule in the system
and the easiest to implement wrongly. On a Ukrainian COD-with-inspection order the buyer pays
**both shipping legs online, by card, at checkout**, before the parcel is sent.

```
At checkout, paid online:
    shippingForwardMinor  +  shippingReturnDepositMinor

At the branch, on inspection:
    ACCEPTS  →  codAmountMinor = subtotal − discount − depositAppliedMinor
                the deposit is consumed as credit against the goods
    REFUSES  →  nothing further is paid; the return leg is already funded
```

It is not a fee. It is a refundable-by-offset deposit, and it costs an honest buyer exactly
nothing, because accepting the parcel converts it into money off the price. The four fields are
`shippingForwardMinor`, `shippingReturnDepositMinor`, `depositAppliedMinor` and `codAmountMinor`
([25-database-schema.md](25-database-schema.md) §25.5); `shippingMinor` is replaced by the two leg
fields on a COD order.

The API's obligations are three, and the third is the one with a test attached.

**1. It is Ukraine-only, enforced server-side.** `shippingReturnDepositMinor` on an order whose
`locale` or destination is `en`, `pl` or `de` returns `422 DEPOSIT_NOT_PERMITTED_FOR_LOCALE`. The
reason is legal rather than practical: under the EU Consumer Rights Directive the buyer holds an
unconditional fourteen-day right of withdrawal and a trader may not require a deposit against
exercising it. This is not a configuration option and there is no flag that enables it.

**2. The arithmetic is computed once, server-side, and returned in full.** `GET
/v1/checkout/payment-methods` returns `forwardShippingMinor`, `returnDepositMinor` and the
resulting `codAmountMinor` on the `COD` entry precisely so the storefront can render §H1.3's
required construction with real numbers rather than percentages. A client that computes
`price − deposit` itself will eventually round it differently from the order, and the number the
customer reads at the Nova Poshta counter is the one the business is held to.

#### The invariant: the deposit is credited exactly once, on `DELIVERED`

This is the rule §H1.3 requires to be tested, and it is stated here because the API is where it
would otherwise be implemented in the wrong place.

| Wrong crediting | Consequence |
|---|---|
| On `SHIPPED` | A deposit is refunded for a parcel that is later **refused**, and the return leg the deposit existed to fund is now unfunded. The mechanic inverts: the business pays both legs on exactly the orders that abuse it |
| Twice | `codAmountMinor` is reduced twice. The branch collects less than the goods are worth and the difference is unrecoverable |
| Never | The customer pays the deposit and then pays full price at the counter. This is the version that produces the review saying the shop charges a hidden fee |

**Where the transition is owned.** In the order state machine —
`packages/orders/src/state-machine.ts` — as a *side effect of the transition to `DELIVERED`*, not
in a controller, not in the Nova Poshta poll job, and not in the admin handler. There are three
callers that can produce that transition and they must not each carry the rule:

```
orders.pollTracking job  (§26.14.2, carrier reports delivery)  ─┐
PATCH /v1/admin/orders/:id  (manager sets it by hand)          ─┼─►  transition(order, 'DELIVERED')
payment webhook on a COD settlement                            ─┘
```

**How it is made idempotent.** Not by reading the order and checking a flag — that is a
check-then-act race between the poll job and a manager pressing the button in the same second.
By a **conditional write whose own predicate is the guard**, inside the transition's transaction:

```sql
UPDATE "Order"
   SET "depositAppliedMinor" = "shippingReturnDepositMinor",
       "codAmountMinor"      = "subtotalMinor" - "discountMinor" - "shippingReturnDepositMinor",
       "status"              = 'DELIVERED',
       "deliveredAt"         = now()
 WHERE id = $1
   AND "status" <> 'DELIVERED'            -- the transition has not already happened
   AND "depositAppliedMinor" = 0          -- and the credit has not already been applied
   AND "shippingReturnDepositMinor" IS NOT NULL;
-- rowCount = 0 → another caller won. Return success, write nothing further.
```

A zero row count is **success, not an error**: the desired state already holds and the second
caller has nothing to do. Treating it as a failure would make a manager's click error out because
the carrier poll beat them to it by a second, which is a support call about a system working
correctly. `payment.deposit_applied` is written by the winning transaction only, with
`actorId = null`, because the credit is a consequence of delivery rather than a human act
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.12).

**The test.** Three cases, and the middle one is the reason the others are not sufficient:

| Case | Assertion |
|---|---|
| Single transition to `DELIVERED` | `depositAppliedMinor === shippingReturnDepositMinor` and `codAmountMinor === subtotal − discount − deposit` |
| **Two concurrent transitions**, issued from the poll job and the admin handler against the same order | Exactly one commits the credit; `depositAppliedMinor` equals the deposit, **not twice it**; exactly one `payment.deposit_applied` row exists |
| `SHIPPED`, then `RETURNED` without `DELIVERED` | `depositAppliedMinor === 0`, `codAmountMinor` never written, and the return leg is recorded as consumed |

Waiving a deposit is a different act with a different permission — `payments.waive_deposit`
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4) — and it
sets `shippingReturnDepositMinor = 0` **before** the order is paid. It is deliberately not
reachable through this transition: a deposit that has already been credited is money that has
already moved, and unwinding that is `payments.refund`.

### 26.10.4d `IN_PRODUCTION` — a fortnight is not packing

[00-client-decisions-4.md](00-client-decisions-4.md) §G2 adds `OrderStatus.IN_PRODUCTION` between
`CONFIRMED` and `PACKING` ([25-database-schema.md](25-database-schema.md) §25.5). The API treats it
as an ordinary member of the state machine — no new permission, `orders.change_status` covers it
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.4) — with
three specifics.

```
PENDING ─► CONFIRMED ─┬─► IN_PRODUCTION ─► PACKING ─► SHIPPED ─► DELIVERED ─► RETURNED
                      └───────────────────► PACKING           (stocked lines: unchanged)
```

| Specific | Rule |
|---|---|
| **Entry is automatic, not manual** | `CONFIRMED → IN_PRODUCTION` is applied by the same transaction that confirms payment, whenever any `OrderItem` carries a `customSpec`. A status that describes a fact about the order should not depend on someone remembering to set it |
| **`expectedDispatchAt` is stamped on entry** | `paidAt + madeToOrderDays` working days, resolved once against the business calendar and stored, never recomputed. A date that moves every time it is read is not a date a customer can hold the business to |
| **Exit is manual** | `IN_PRODUCTION → PACKING` is a human saying the piece is off the loom. There is no signal the system could infer this from, and inferring it from the elapsed fourteen days would announce a dispatch that has not happened |

**The 14 days is production time before dispatch, not total delivery time.** Carrier transit is
added on top. Every API response that carries the lead time carries `leadTimeDays` and
`expectedDispatchAt` separately, and never a single "delivery" figure — because any consumer given
one number will render it as "14 days to your door" and generate a complaint on day fifteen
([00-client-decisions-4.md](00-client-decisions-4.md) §G2 binding rule 1).

### 26.10.5 Orders — guest access only

There is no order *collection* endpoint, because there is no identity to scope one to. A visitor
can resolve exactly the orders they hold a credential for, one at a time.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/orders/:number?token=` | guest | `Order.guestToken`, constant-time compared |
| POST | `/v1/orders/lookup` | — | Body `{ orderNumber, email }`. The credential-free path for a customer who lost the email link. Rate-limited hard, see below. |
| POST | `/v1/orders/:number/cancel` | guest | Only while `status = PENDING` |
| GET | `/v1/orders/:number/tracking` | guest | Cached carrier status, refreshed by the poll job (§26.17) |

`POST /v1/orders/lookup` is the one genuinely delicate endpoint created by the removal of
accounts, because it is an unauthenticated read of personal data keyed on two guessable-ish
values. It is therefore designed as a **mail-back**, not as a direct read:

1. Validate the body and take a constant-time match on `(Order.number, Customer.email)`.
2. **Always return `204`**, match or not. A differentiated response is an order-existence oracle
   and, worse, an email-membership oracle.
3. On a match, enqueue an email to the address on file containing a fresh single-use access link
   carrying the `guestToken`. The data goes to the mailbox that already received the
   confirmation; it never goes to whoever made the request.
4. Rate-limit at 3 per hour per email and 10 per hour per IP (§26.12).

This is deliberately one step slower than a form that just shows the order. A direct read would
let anyone who knows a customer's email enumerate order numbers — sequential-ish by construction —
and read names, addresses and phone numbers. Routing through the mailbox costs the legitimate
customer one email and costs the attacker everything.

`Order.guestToken` is a bearer credential with the usual consequences: it is compared in constant
time, it is never logged (§26.18 redaction), and the access link it sits in is excluded from
`Referrer` leakage by the storefront's `Referrer-Policy`.

**Retention and erasure.** A GDPR erasure request from an EU buyer (`pl`, `de`) is handled by
staff through `customers.anonymize` ([24](24-employee-permission-architecture.md) §24.5), not by
a self-service endpoint — there is no account to sign into to request it. Erasure never deletes
`Order` rows: Ukrainian accounting retention and the immutability of `OrderItem` snapshots (§25.5)
both forbid it. The `Customer` row is anonymised and unlinked, and the order survives with its
snapshots intact.

### 26.10.6 Auth — staff only

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/v1/auth/staff/login` | — | Increments `failedLoginCount`, honours `lockedUntil`. **Never issues a session**: returns `mfa_required` or `mfa_enrolment_required` ([24](24-employee-permission-architecture.md) §24.11) |
| POST | `/v1/auth/staff/mfa` | challenge token | `{ code \| recoveryCode, rememberDevice }`. The only endpoint that issues a session. Replay-guarded, 5 attempts per challenge |
| POST | `/v1/auth/staff/mfa/enrol` | enrolment token | Returns the `otpauth://` URI; a second call with a valid code saves the secret and returns 10 recovery codes, once |
| POST | `/v1/admin/employees/:id/mfa/reset` | `employees.reset_mfa` ⚠ | Clears the secret and recovery codes, revokes all sessions; next login re-enrols. Audited |
| POST | `/v1/auth/staff/refresh` | cookie | Rotating token; reuse detection revokes the family and every `StaffSession` |
| POST | `/v1/auth/staff/logout` | staff | Sets `StaffSession.revokedAt` |
| POST | `/v1/auth/staff/password/forgot` | — | Always `204`, whether or not the address exists |
| POST | `/v1/auth/staff/password/reset` | — | Single-use token, 60-minute TTL ([24](24-employee-permission-architecture.md) §24.8) |
| POST | `/v1/auth/staff/invitation/accept` | — | Single-use invitation token; sets the first password |
| GET/PATCH | `/v1/auth/staff/me` | staff | Own name, avatar, locale, password and sessions only — never own roles or grants (§24.6 I2) |

**That is the entire authentication surface of this product.** Removed in this revision, and
listed so their absence is a decision rather than an omission: `/v1/auth/customer/register`,
`/login`, `/refresh`, `/logout`, `/password/forgot`, `/password/reset`, `/verify-email`,
`/v1/me`, `/v1/me/export`, `/v1/me/addresses`, `/v1/me/orders` and `/v1/me/wishlist`. Thirteen
endpoints, the customer refresh-cookie family, a public login form as a credential-stuffing
target, and customer password storage — all deleted by
[00-client-decisions-2.md](00-client-decisions-2.md) §E12, at no cost to the shopping flow,
because none of them were ever required to place an order.

`forgot` returning `204` unconditionally is retained for staff for the same reason it was written
for customers: a differentiated response is an account-existence oracle, and the staff roster is a
smaller and more valuable set to enumerate than a customer list ever was.

### 26.10.7 Reviews

| Method | Path | Auth | Permission | Notes |
|---|---|---|---|---|
| GET | `/v1/products/:slug/reviews` | — | — | `APPROVED` only, cursor-paginated |
| POST | `/v1/reviews` | — | — | Created `PENDING`, rate-limited hard. Optionally carries a `guestToken`, which is what sets `isVerifiedPurchase`. |
| POST | `/v1/reviews/:id/helpful` | — | — | One per fingerprint per review |
| GET | `/v1/admin/reviews` | staff | `reviews.read` | Any status |
| PATCH | `/v1/admin/reviews/:id` | staff | `reviews.moderate` | Status, `reply`, `repliedById` |

The aggregate is computed only from `APPROVED` reviews with `isVerifiedPurchase = true` per
§25.6. The response returns both `ratingAverage` (the structured-data-safe figure) and
`ratingDisplayCount`, so the UI can be honest about the gap rather than the API quietly inflating
one number.

**Verified-purchase proof without accounts.** With no login, the only evidence a reviewer bought
the product is the `guestToken` from their confirmation email. The review-request job (§26.17)
therefore sends a link carrying that token, and `isVerifiedPurchase` is set only when the token
resolves to a `DELIVERED` order containing the product. Every other review is unverified, visible,
and excluded from the structured-data aggregate. This is a stricter test than an account-based
one, not a looser one — an account proves identity, the token proves the specific purchase.

#### The parcel-card route, and why it produces unverified reviews

[00-client-decisions-4.md](00-client-decisions-4.md) §G4 confirms that **a business card already
ships in every parcel**. The recommendation is a short URL plus a QR code to a review page — one
link, no per-order codes, no variable printing. The API surface is deliberately tiny:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v` | — | The short link printed on the card. A 301 to `/{{locale}}/review` resolved from `Accept-Language`, defaulting to `uk`. It is a route, not an endpoint: no state, no parameter, nothing to guess |
| POST | `/v1/reviews` | — | Unchanged. Arrives with **no `guestToken`**, so `isVerifiedPurchase` stays `false` |

The card carries no order number and no per-order code, which is the correct trade and is worth
stating as one: per-order codes would produce better attribution and would require a
variable-printing workflow a four-person business should not be asked to run. The consequence is
structural — a review arriving through the card **cannot** be linked to an order, so
`isVerifiedPurchase` is `false`, and it is excluded from `ratingAverage` and from the
`AggregateRating` node per §25.6.

**That exclusion must not be worked around, and the API is where the workaround would be
attempted.** There is no endpoint, parameter or admin action that sets `isVerifiedPurchase` to
`true` — the field is written **only** by the `guestToken` resolution above, and
`PATCH /v1/admin/reviews/:id` accepts `status`, `reply` and `repliedById` and rejects the field
with `422 FIELD_NOT_WRITABLE` if it is sent. A moderator who believes a reviewer is genuine is
very often right, and is nonetheless asserting to Google something the system cannot evidence.
The admin makes the distinction visible rather than editable
([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.9).

This is also the route that reaches the **counter customer** — the buyer in the Яворів shop who has
no order number, no confirmation email, and no other prompted path back to the site. Their review
is unverified by construction, genuinely valuable as visible social proof, and correctly outside
the aggregate.

**Reviews are never imported.** [00-client-decisions-2.md](00-client-decisions-2.md) §E5 permits
copying products and photographs from the adjacent business's site and explicitly forbids copying
its reviews: they were given to a different seller. The import surface in §26.10.10 has no review
columns, so the rule is enforced by the absence of a mechanism rather than by a reviewer noticing.

### 26.10.8 Content, leads, newsletter

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/posts`, `/v1/posts/:slug`, `/v1/posts/tags` | — | `PUBLISHED` and `publishedAt <= now()` only |
| GET | `/v1/pages/:slug` | — | Static content pages |
| GET | `/v1/albums`, `/v1/albums/:key` | — | `MediaAlbum` where `isPublic` |
| GET | `/v1/banners?placement=` | — | Active window filtered server-side, so a cached response never holds an expired banner |
| GET | `/v1/navigation` | — | Header and footer trees per locale |
| GET | `/v1/settings/public` | — | Whitelisted `Setting` keys only, never the table |
| ~~POST~~ | ~~`/v1/leads`~~ | — | **Removed from v1** — no contact or wholesale form ([00-client-decisions-10.md](00-client-decisions-10.md) §P7a) |
| POST | `/v1/admin/ai/describe` | `products.update` | Draft description from attributes and category, via the Claude API; returned as a draft, never saved by itself (§P8a) |
| ~~POST~~ | ~~`/v1/newsletter/*`~~ | — | **Removed** — no email newsletter ([00-client-decisions-9.md](00-client-decisions-9.md) part 5) |
| POST | `/v1/quick-orders` | — | «Купити в 1 клік»: `{ productId, variantId?, quantity, phone }`. `uk` only, stocked items only, Ukrainian numbers only. Rate-limited like `/leads`, honeypot, {{CAPTCHA}}. Returns 202; enqueues `notify.telegram` ([00-client-decisions-9.md](00-client-decisions-9.md) §P4.1) |
| GET/PATCH | `/v1/admin/quick-orders[/:id]` | `orders.read` / `orders.create` | Inbox and status; `POST /v1/admin/quick-orders/:id/convert` creates the `Order` and emails or messages the payment link |

Double opt-in is not configurable. §25.9 requires it for `de`, and running two subscription flows
to save one email for `uk` is more code and more risk than running one.

### 26.10.9 Media

| Method | Path | Auth | Permission | Notes |
|---|---|---|---|---|
| POST | `/v1/admin/media/signature` | staff | `gallery.upload` | Scoped Cloudinary signature, §26.15 |
| POST | `/v1/admin/media` | staff | `gallery.upload` | Registers an uploaded asset as a `Media` row |
| PATCH | `/v1/admin/media/:id` | staff | `gallery.update` | Focal point, text-safe zone, album |
| PUT | `/v1/admin/media/:id/translations/:locale` | staff | `gallery.update` | `alt` required; a blank `alt` is a `422` |
| DELETE | `/v1/admin/media/:id` | staff | `gallery.delete` | Refused while `ProductMedia` references exist |

### 26.10.10 Admin

Every route is `staff` plus its permission key, every mutation writes an `AuditLog` row with
`before` and `after`, and every mutation purges the cache keys it invalidated (§26.13.3).

| Method | Path | Permission |
|---|---|---|
| GET/POST | `/v1/admin/products` | `products.read` / `products.create` |
| GET/PATCH/DELETE | `/v1/admin/products/:id` | `products.read` / `products.update` / `products.delete` |
| POST | `/v1/admin/products/:id/publish` | `products.publish` |
| POST | `/v1/admin/products/:id/duplicate` | `products.create` |
| POST | `/v1/admin/products/bulk` | `products.bulk_edit` |
| GET/POST/PATCH/DELETE | `/v1/admin/products/:id/variants[/:variantId]` | `products.update` |
| GET/POST/PATCH/DELETE | `/v1/admin/categories[/:id]` | `categories.*` |
| GET | `/v1/admin/orders` | `orders.read` |
| PATCH | `/v1/admin/orders/:id` | `orders.update` |
| POST | `/v1/admin/orders/:id/refund` | `payments.refund` (`isDangerous`) |
| POST | `/v1/admin/orders/:id/deposit/waive` | `payments.waive_deposit` (`isDangerous`) — §26.10.4c. Rejected once `paymentStatus = PAID`: after that it is a refund |
| POST | `/v1/admin/orders/:id/fulfil` | `orders.change_status` — a fulfilment transition is an ordinary `OrderStatus` move ([24](24-employee-permission-architecture.md) §24.4, G2), not its own capability |
| PATCH | `/v1/admin/products/:id/custom-size` | `products.manage_custom_size` for the toggle and the four loom bounds; `products.manage_price` for `customSizeRatePerSqmMinor` and `customSizeMinPriceMinor`. A request touching both requires both ([24](24-employee-permission-architecture.md) §24.4) |
| POST | `/v1/admin/categories/:id/custom-size-rate/apply` | `products.manage_price` — the opt-in bulk apply of a category default to products still carrying the inherited value. `dryRun` by default, returns the affected count, §26.10.1a |
| GET | `/v1/admin/orders/export` | `orders.export` |
| GET/PATCH | `/v1/admin/leads[/:id]` | `leads.read` / `leads.update` |
| GET/POST/PATCH | `/v1/admin/posts[/:id]` | `blog.read` / `blog.create` / `blog.update` |
| POST | `/v1/admin/posts/:id/schedule` | `blog.schedule` |
| GET/POST/PATCH/DELETE | `/v1/admin/promotions[/:id]` | `promotions.*` |
| GET/POST/PATCH/DELETE | `/v1/admin/banners[/:id]` | `promotions.manage_banners` |
| GET/POST/DELETE | `/v1/admin/redirects[/:id]`, `/redirects/import` | `settings.manage_redirects` |
| GET/PUT | `/v1/admin/settings[/:key]` | `settings.read` / `settings.update` |
| GET/POST/PATCH | `/v1/admin/staff[/:id]` | `employees.read` / `employees.invite` / `employees.update` |
| DELETE | `/v1/admin/staff/:id/sessions/:sessionId` | `employees.manage_sessions` (`isDangerous`) |
| GET/POST/PATCH | `/v1/admin/roles[/:id]` | `employees.manage_roles` (`isDangerous`) |
| GET | `/v1/admin/audit` | `audit.read` |
| GET | `/v1/admin/dashboard` | staff, then **per widget**: `analytics.read` and `analytics.read_revenue` gate widgets 1, 7 and 8; the rest are gated by the keys of the data they show ([23](23-admin-panel-architecture.md) §23.5). §24.4 defines no `dashboard` resource and a single gate here would hide widgets 2, 4, 5 and 9 from a warehouse user, which §24.4 explicitly requires to stay visible |
| GET | `/v1/admin/translations/gaps` | `products.translate` — the narrowest catalogue key covering translation work; the report also spans `categories.translate` and `blog.translate` rows, which §24.4 keeps as separate keys |

**Content-import surface.** The position here has moved twice and the current one is precise.
[00-client-decisions.md](00-client-decisions.md) D2 cancelled the WooCommerce *migration*;
[00-client-decisions-2.md](00-client-decisions-2.md) §E5 restores a *content import*. These are
not the same workstream and conflating them would reintroduce the exact risk D2 avoided.

| Returns | Stays cancelled |
|---|---|
| Product and variant data export from the adjacent site | SEO migration of any kind |
| Photograph import to Cloudinary | 301 redirect mapping from legacy URLs |
| Restructuring into the §D3 category tree | Search Console property baseline |
| — | Any claim of continuity with `fabryka-shkur.com.ua` |

The reason for the asymmetry is that the source site **stays live** and belongs to a different
business. Inheriting its URLs or its rankings is not available; inheriting its product data is,
with a constraint attached.

| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | `/v1/admin/import/jobs` | `products.import` (`isDangerous`) | Multipart CSV or XLSX; returns a job id |
| GET | `/v1/admin/import/jobs/:id` | `products.import` | Progress, per-row errors, downloadable rejects file |
| POST | `/v1/admin/import/jobs/:id/dry-run` | `products.import` | Validates, diffs, **and runs the duplicate-text scan** without writing |
| POST | `/v1/admin/import/jobs/:id/commit` | `products.import` | Applies a previously dry-run job |
| GET | `/v1/admin/export/products` | `products.export` | CSV round-trips the import format exactly |
| GET | `/v1/admin/export/translations?locale=` | `products.export` | Per-locale workbook for a translator |
| POST | `/v1/admin/import/translations` | `products.import` | Returns the translated workbook to the side tables |

The import format is the export format, byte for byte. That is what makes the translation
workflow possible without building a translation editor: export the `uk` rows plus an empty
target column, send the file to a translator, import it back into `ProductTranslation`. At the
catalogue size §E5 implies — several hundred to roughly a thousand SKUs across four locales — a
round-trippable file is worth more than any in-app editor the budget would stretch to.

#### The duplicate-text guard

This is the one genuinely new mechanism in this revision, and it exists because reusing the source
site's copy is a **ranking risk rather than a convenience**. `fabryka-shkur.com.ua` stays online.
Two live sites carrying identical product text compete for the same queries, and the new domain,
with zero authority ([00-client-decisions.md](00-client-decisions.md) D2), loses that competition
every time. That is not a penalty to be argued about; it is an outcome.

So the import pipeline refuses to be the path by which copied text reaches production:

| Check | Behaviour at dry-run |
|---|---|
| Description shingle match against a stored fingerprint set of the source site's copy | Row flagged `DUPLICATE_TEXT` with the matching passage highlighted |
| Description identical to another row in the same import | Flagged `DUPLICATE_INTERNAL` |
| Product name identical to a known source-site name | Flagged `NAME_COLLISION` — §E5 requires renaming where names overlap |
| Any flagged row | **Commit is refused for the whole job** unless each flag is individually acknowledged with a reason recorded in `AuditLog` |

Implementation is a 5-gram shingle set per description with a Jaccard similarity threshold, not a
string equality test, because paraphrase-by-reordering is exactly what a rushed rewrite produces
and exactly what a search engine still recognises. The source fingerprints are computed once at
export time and stored; the raw source text is never persisted, so the guard cannot itself become
the duplicate-content liability it exists to prevent.

The guard is advisory on **photographs**, which §E5 permits reusing after re-crop, re-grade, EXIF
strip, semantic rename and new `alt` text. Identical images across two domains are a weaker signal
than unique ones but are not penalised the way duplicate text is. The import therefore blocks on
text and merely warns on an unchanged image hash — and `alt` text is validated as present and
non-duplicate, because that *is* text.

#### Import validation rules

`origin` is a required column. A row with `origin = PARTNER_MANUFACTURE` no longer requires a
`partnerName` — §E7 makes that value unusable — but it does require `partnerRegion` where the
region is known, and the dry-run reports blanks so the omission is a choice rather than an
oversight. Bulk entry is exactly where the D3 labelling rule would otherwise be quietly bypassed,
so the flag that actually matters, `origin`, is the one that is mandatory.

Review columns do not exist in the format (§26.10.7). Neither do blog posts: §E5 requires blog and
care-guide articles to be written fresh, so the import surface covers products, variants, media
and category assignment only.

Dry-run-then-commit exists because a single import touches the whole catalogue. An import that
half-succeeds and cannot be described is unrecoverable for a small team, so a run either produces
a reviewable diff or it produces nothing.

`/v1/admin/redirects` remains, and its purpose is unchanged by §E5: there are still **no legacy
URLs to preserve**, because there is no SEO migration. It exists for slug changes made **after**
launch. A product renamed in month eight must still 301 from its old locale-scoped slug, and the
`Redirect` model (§25.9) is what makes that survivable on a domain that will have spent a year
earning its rankings.

### 26.10.11 Webhooks and system

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/v1/webhooks/psp/wayforpay` | sig | §26.14.1. **Method, content type and acknowledgement shape blocked on V8.** |
| POST | `/v1/webhooks/nova-poshta` | sig | §26.14.2, conditional on {{NP_WEBHOOK_SUPPORT}} |
| POST | `/v1/webhooks/email` | sig | Bounce and complaint events from {{ESP}} |
| GET | `/v1/health` | — | Liveness, no dependency checks |
| GET | `/v1/ready` | — | Readiness: Postgres, Cloudinary, WayForPay reachability |
| GET | `/v1/openapi.json` | — | §26.19 |

## 26.11 Idempotency

`POST /v1/checkout/orders` requires an `Idempotency-Key` header: a UUIDv4 generated once when the
checkout form mounts and reused for every retry of that submission.

1. Key absent from the store: insert a `PROCESSING` row inside the order transaction and continue.
2. Present, `COMPLETED`, matching request-body hash: return the stored response verbatim with
   `Idempotency-Replayed: true`. No second order, no second charge.
3. Present with a **different** body hash: `409 IDEMPOTENCY_KEY_CONFLICT`. A key identifies one
   request, not one endpoint.
4. Present and still `PROCESSING`: `409 IDEMPOTENCY_IN_PROGRESS` with `Retry-After: 2`.

Keys expire after 24 hours.

**Ratified.** The `IdempotencyKey` model proposed by an earlier revision of this section now
exists in [25-database-schema.md](25-database-schema.md) §25.9, with `lockedAt` as the in-flight
guard and `scope` widened beyond checkout to cover `"refund"` and `"bulk-import"`. This document
no longer carries it as a schema addendum; §25.9 is the definition.

Deriving idempotency from `Cart.id` was considered and rejected: a cart is consumed on success, so
a retry of a request that failed *after* the commit but *before* the response reached the browser
would find no cart and no order to attribute it to, which is exactly the case idempotency exists
to handle. The widened `scope` vindicates that decision — refunds and bulk imports have no cart at
all, and keying on one would have forced a second mechanism for them.

The scope matters more under the WayForPay unknowns than it did before. With V6 unresolved, the
checkout may end up as a hosted redirect, which means the browser leaves the site mid-transaction
and returns through a URL the merchant does not fully control. Retries and double-submits on
return are more likely in that shape than in an embedded one, and the idempotency key is what
makes them harmless rather than expensive.

**Webhooks need no new table.** `PaymentTransaction.idempotencyKey` is already `@unique` and
`@@unique([provider, providerRef])` is a second guard (§25.5). The receiver derives the key from
the provider's event id and attempts the insert; a unique violation means the event was already
processed and the handler returns `200` without re-applying it. Handlers are also written to be
**order-independent**, because providers do not guarantee delivery order: a `PAID` arriving after
a `REFUNDED` must not resurrect the paid state. A webhook may only advance `PaymentStatus` along
the state machine, never move it backwards, and every transition is recorded as an `OrderEvent`
whether or not it was applied.

## 26.12 Rate limiting

Fixed window per class, keyed by IP plus the authenticated subject where present, enforced in Node
against a Postgres counter. No Redis: a shop this size does not generate counter contention worth
a second datastore.

| Class | Limit | Rationale |
|---|---|---|
| Public read (catalogue, content, search) | 300 / min / IP | Generous; the real risk is scraping, and a lower limit breaks legitimate crawlers |
| `/search/suggest` | 60 / min / IP | Fires per keystroke, debounced client-side |
| `/cart/*` mutations | 60 / min / cart | |
| `/checkout/orders`, `/checkout/orders/*/payment` | 10 / hour / IP | Card-testing defence |
| Staff login and refresh | 10 / 15 min / IP **and** 5 / 15 min / account | Per-account is what stops credential stuffing; per-IP alone is trivially distributed. There is no public registration endpoint to limit. |
| Staff password reset | 3 / hour / email | |
| `POST /v1/orders/lookup` | 3 / hour / email **and** 10 / hour / IP | The tightest limit on any public endpoint, because it is the one unauthenticated read of personal data (§26.10.5). Order numbers are partly guessable; the limit plus the mail-back design is what makes that acceptable. |
| `/leads`, `/reviews`, `/newsletter/subscribe` | 5 / hour / IP | Alongside the honeypot and {{CAPTCHA}} |
| `/admin/*` read / write | 600 / 120 per min / staff | Effectively unlimited; bounds a runaway client |
| `/admin/import/*` | 3 concurrent jobs globally | A 1,000-SKU import is heavy |
| `/webhooks/*` | 1,000 / min / sender | High: a provider retry storm must not be dropped |

Responses carry `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` and, on `429`,
`Retry-After`. Crossing 80% of a limit emits a structured warning, because the first sign of an
integration bug is usually a client that suddenly starts hammering one endpoint.

## 26.13 Caching

### 26.13.1 Directives per response class

| Class | `Cache-Control` | ETag | CDN |
|---|---|---|---|
| Content-hashed static assets | `public, max-age=31536000, immutable` | no | Cache forever |
| SSG HTML | `public, max-age=0, s-maxage=86400, stale-while-revalidate=604800` | yes | Cache, purge on deploy |
| SSR catalogue HTML | `public, max-age=0, s-maxage=300, stale-while-revalidate=86400` | yes | Cache, purge on write |
| `/v1/categories`, `/v1/navigation`, `/v1/settings/public` | `public, max-age=60, s-maxage=3600, stale-while-revalidate=86400` | yes | Cache |
| `/v1/products`, `/v1/products/:slug` | `public, max-age=0, s-maxage=300, stale-while-revalidate=3600` | yes | Cache |
| `/v1/products/:slug/availability` | `no-store` | no | Bypass |
| `/v1/search`, `/v1/search/suggest` | `public, max-age=60` | yes | Browser only |
| `/v1/cart`, `/v1/orders/*`, `/v1/checkout/*`, all `/v1/admin/*` | `private, no-store` | no | Bypass |
| Every non-GET | `no-store` | no | Bypass |

`max-age=0` with a long `s-maxage` is the load-bearing pattern: the browser always revalidates, so
a customer never sees stale prices from their own disk cache, while the CDN absorbs the load.
`stale-while-revalidate` means a miss after expiry serves the stale copy instantly and refreshes
behind it, so no visitor waits on a cold render.

### 26.13.2 ETags

Weak ETags computed from the serialised body. A conditional `GET` with a matching `If-None-Match`
returns `304` with no body. On a 24-product category response with full media metadata that turns
roughly 40 KB into a few hundred bytes, which matters far more on the mobile connections
[02-ux-research.md](02-ux-research.md) §2.7 describes than on desktop.

`Vary: accept-encoding` is set. `Vary: Accept-Language` is deliberately **not**: locale is in the
URL (§26.6) and therefore already in the cache key, and adding the header would shatter the cache
across thousands of browser language permutations.

### 26.13.3 Invalidation on admin write

Purging is explicit and synchronous with the write. Every admin service function returns the cache
keys it affected, and the transaction commit purges exactly those across all four locales.

```ts
function productCacheKeys(p: ProductWithTranslations): string[] {
  const locales = ['uk', 'en', 'pl', 'de'] as const;
  return [
    ...locales.flatMap(l => [
      `/api/v1/products/${slugFor(p, l)}?locale=${l}`,
      `/${l}/product/${slugFor(p, l)}`,
    ]),
    ...p.categoryIds.flatMap(c => locales.flatMap(l => [
      `/api/v1/products?category=${slugFor(c, l)}&locale=${l}`,
      `/${l}/catalog/${slugFor(c, l)}`,
    ])),
    ...locales.map(l => `/${l}`),            // the homepage carries featured products
  ];
}
```

Surrogate-tag purging would be tidier, but tag-based purge on Cloudflare is an Enterprise feature.
The simple choice inside the stated budget is purge-by-URL from a computed key list, accepting
that a listing reachable only by an unusual filter combination may serve up to `s-maxage` seconds
stale. With a five-minute TTL and a shop that publishes a few times a week, that is a bounded and
acceptable inaccuracy, and `stale-while-revalidate` keeps the worst case fast rather than slow.

Purge failures are logged and retried once, never allowed to fail the write. An admin whose save
button errors because a CDN API blipped will simply press save again, producing a second audit row
and no improvement.

## 26.14 Webhook receivers

### 26.14.1 Payment provider — WayForPay

`{{PSP}}` resolves to **WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
That closes [00-assumptions.md](00-assumptions.md) C2 and supersedes the LiqPay recommendation an
earlier revision of this section carried.

> **This section deliberately does not describe WayForPay's wire format.**
>
> Six facts are recorded as unverified in §E10 and are Phase 0 tasks in
> [35-implementation-roadmap.md](35-implementation-roadmap.md):
>
> | # | Blocked fact | What it blocks here |
> |---|---|---|
> | **V6** | Integration mode available to this merchant — hosted redirect, embedded widget, or direct API | The return shape of `POST /v1/checkout/orders/:id/payment`, and the checkout step design in [18-checkout-specification.md](18-checkout-specification.md) |
> | **V7** | Signature algorithm and the exact field order for request and response HMAC | Step 2 below |
> | **V8** | Webhook payload shape, expected acknowledgement body, and retry behaviour | The route's content type, the parser, and step 8 |
> | **V9** | Refund and partial-refund API support | `POST /v1/admin/orders/:id/refund`, and whether `PaymentStatus.PARTIALLY_REFUNDED` is reachable at all |
> | **V10** | Whether a ФОП on the simplified tax system can contract, and what onboarding requires | Whether any of this is buildable for ФОП Гондурак Л. Ю. |
> | **V11** | Supported currencies and non-UAH settlement | The international checkout's currency disclosure (§26.10.4) |
>
> **Nothing WayForPay-specific is written into this document or into code until it is read from
> current official documentation.** A guessed field order produces a signature that fails
> silently, or worse, one that passes in the sandbox and fails in production. PSP integration
> details drift between versions and between merchant agreements, and reconstructing them from
> memory is the single highest-risk shortcut available on this project.

What *is* specifiable now, and is specified, is the receiver's **structure**. It is provider-shaped
only at steps 1, 2 and 8; everything else is the same for any acquirer, which is precisely why
verification is isolated from application.

```
POST /api/v1/webhooks/psp/wayforpay
Content-Type: <blocked on V8>
<body shape blocked on V8>
```

Verification, in this order, before anything is treated as meaningful:

1. **Read the raw body.** The signature covers bytes, not a re-serialised object, so the route
   registers a raw body parser and parsing happens after verification. This holds regardless of
   whether the provider sends JSON, form-encoded data or something else — which is why it can be
   fixed before V8 is answered.
2. **Recompute the signature and compare with `timingSafeEqual`.** The algorithm and field order
   come from V7 and are read from the documentation, never inferred from a sample payload — a
   sample with no empty fields will not reveal how empty fields are joined, and that is exactly
   the difference that breaks in production. A non-constant-time compare is a genuine, exploitable
   flaw independent of which algorithm is used.
3. **Reject on mismatch with `401` and no detail.** A verbose signature error is a tuning oracle.
4. **Check freshness.** Events older than five minutes are logged and rejected, bounding replay of
   a captured legitimate payload. The timestamp field's name comes from V8; the five-minute window
   does not.
5. **Insert the idempotency key** derived from the provider's event or transaction identifier
   (§26.11). `PaymentTransaction.idempotencyKey` is already `@unique` (§25.5), so a unique
   violation returns success immediately without re-applying the event.
6. **Verify amount and currency against the `Order`.** A webhook claiming 100 UAH for a 9,800 UAH
   order is not trusted merely because it was signed. Mismatches route to manual review, never to
   `PAID`. With V11 unresolved, a non-UAH amount on an international order is treated as a
   mismatch until the settlement currency is confirmed, rather than as a conversion to be guessed.
7. **Apply the transition**: write `PaymentTransaction` with the full `rawPayload`, update
   `Order.paymentStatus` and `paidAt`, append an `OrderEvent`, enqueue the confirmation email.
   Handlers are order-independent (§26.11): a `PAID` arriving after a `REFUNDED` must not
   resurrect the paid state.
8. **Acknowledge within {{PSP_WEBHOOK_TIMEOUT}} seconds.** Many Ukrainian acquirers require a
   *specific* acknowledgement body rather than a bare `200`, and returning the wrong one produces
   an indefinite retry storm against a receiver that is actually working. **The exact
   acknowledgement is blocked on V8 and must not be assumed.** What is fixed now is that anything
   slow — email, CDN purge, carrier calls — is enqueued rather than awaited, because a receiver
   that does real work inline will time out whatever the ack format turns out to be.

Nothing beyond step 2 executes on an unverified payload; nothing beyond step 6 mutates money
state.

**Storing the raw payload is not optional.** `PaymentTransaction.rawPayload` holds the complete
verified body. When a provider-specific assumption eventually proves wrong — and with six facts
unverified, one will — the stored payloads are the only way to reconstruct what actually happened
without asking the acquirer for a log export. Redaction (§26.18) keeps card data out of the
application log; the payload column is a different thing, is access-controlled behind
`payments.read`, and is what makes a reconciliation dispute answerable.

### 26.14.2 Nova Poshta

Nova Poshta's public API is request-response and offers no general-purpose delivery-status webhook
({{NP_WEBHOOK_SUPPORT}} pending verification against the current contract). The design is
therefore **polling**: a job runs every 30 minutes calling `getStatusDocumentsByPhone` for every
order with a `trackingNumber` in `PACKING` or `SHIPPED`. The carrier accepts up to 100 documents
per call, so the whole open book is one or two requests. Transitions write `OrderEvent`; a
`DELIVERED` sets `Order.deliveredAt` and enqueues the review-request email; polling stops at
`DELIVERED`, `RETURNED` or `CANCELLED`.

`POST /v1/webhooks/nova-poshta` is specified and built behind the same verification contract as
§26.14.1, so that if push delivery becomes available, enabling it is a configuration change and
the poll job is disabled. It is not enabled at launch.

### 26.14.3 Email provider

{{ESP}} posts bounce, complaint and delivery events, verified by HMAC over the raw body plus a
timestamp check, structurally identical to §26.14.1. A hard bounce sets
`NewsletterSubscriber.unsubscribedAt` and flags the address on any related order, because a
bounced order confirmation is an operational problem, not a marketing one.

## 26.15 File upload to Cloudinary

Uploads go **browser to Cloudinary directly**, never through Node.

```
1. Admin selects a file.
2. POST /api/v1/admin/media/signature  { folder, resourceType, publicIdPrefix }
   → { signature, timestamp, apiKey, cloudName, folder, uploadPreset, eager }
3. Browser POSTs the file plus those parameters to
   https://api.cloudinary.com/v1_1/<cloudName>/auto/upload
4. Cloudinary returns { public_id, format, width, height, bytes, … }
5. POST /api/v1/admin/media { publicId, … } → the server verifies the asset via the
   Admin API, derives blurhash and dominantHex, and writes the Media row.
```

**Why the client never holds the API secret.** A Cloudinary API secret is account-wide: it can
upload anything, overwrite any asset, delete the entire media library and run transformations
billed to the account. Any secret shipped to a browser is public, and here "public" means an
attacker can destroy the photography the whole brand strategy rests on
([01-brand-strategy.md](01-brand-strategy.md) §1.8). The signature flow hands the browser a
credential scoped to one folder, one resource type and one timestamp, expiring in an hour. It is
useless for anything else.

**Why direct upload rather than proxying.** A single product shoot is dozens of 10-plus MB
originals. Proxying means those bytes cross the application server twice, holding request-handler
memory and connection slots for minutes on an instance that also serves checkout.

**Why step 5 verifies rather than trusts.** The client reports what it claims Cloudinary returned.
The server confirms the `public_id` exists and reads its real dimensions and byte size from the
Admin API before persisting; without that check a `Media` row could be fabricated pointing
anywhere. Step 2 itself requires `gallery.upload`, is rate-limited, and rejects any `folder` outside
the configured root, because signing is a trust boundary and validates its inputs like any other
endpoint.

## 26.16 Transactional email boundary

```ts
export interface EmailService {
  send<T extends TemplateKey>(args: {
    to: string; template: T; locale: Locale; data: TemplateData[T]; idempotencyKey?: string;
  }): Promise<{ providerMessageId: string }>;
}
```

| Environment | Implementation |
|---|---|
| Test | In-memory collector, asserted in tests |
| Development | Mailpit on localhost; nothing leaves the machine |
| Production | {{ESP}} adapter (recommended: Resend or Postmark) |

Callers never touch a provider SDK, so swapping provider is one adapter file, which is worth
having now given {{ESP}} is unconfirmed. Every send is enqueued, never awaited inside a request: a
slow provider must not slow checkout and an outage must not fail an order already paid for.
Templates are keyed and typed, so `TemplateData[T]` makes rendering with the wrong variables a
compile error; bodies are authored per locale and a missing locale falls back to `uk` with a
warning, matching §26.6. Every send touching an order writes an `email_sent` `OrderEvent`, so
support can answer "did they get the confirmation" from the order timeline.

Launch templates: order confirmation, payment received, payment failed, shipped with tracking,
delivered, cancelled, refund issued, **guest order access link** (sent by `POST
/v1/orders/lookup`), **made-to-order in production**, **quote issued**,
**quote expiring**, staff password reset, staff invitation, newsletter opt-in, review request,
abandoned cart, lead received (internal), low stock (internal).

**There is no split-order-pair template**, because there is no pair
([00-client-decisions-6.md](00-client-decisions-6.md) §J1). A mixed cart produces one order and
therefore one confirmation email, stating one total, one expected dispatch date and one delivery
charge. The template does not need a variant for the case: the mixed-cart disclosure was delivered
at the add (§26.10.4b) and the confirmation restates the dispatch date like any other
made-to-order confirmation.

**The confirmation email states a date, never a duration.**
[00-client-decisions-4.md](00-client-decisions-4.md) §G2 binding rule 4 is a template constraint
and is enforced as one: `TemplateData['order_confirmation']` carries `expectedDispatchAt` as a
`Date` and **has no `leadTimeDays` member at all**, so «протягом 14 днів» cannot be rendered by a
template that does not receive the number. «Очікувана відправка: 12 жовтня» is checkable;
«протягом 14 днів» is a memory test the customer will fail, and on day fifteen it is a support
call. The date is the one stamped on entry to `IN_PRODUCTION` (§26.10.4d) rather than one computed
at send time, so a resend in week two shows the same date as the original.

One transactional template carries a money explanation rather than a money figure, and it is named
in [00-client-decisions-6.md](00-client-decisions-6.md) §J3 item 1 as copy the client must approve
before it ships. The **COD confirmation** restates the deposit arithmetic with the customer's own
numbers — «на пошті ви доплатите {{PRICE − RETURN}} ₴ замість {{PRICE}} ₴» — because §H1.3 is the
one rule on the site that can be misread as a hidden fee, and a worked example is what converts it
into an obviously fair one. **The mechanic behind it is confirmed** (§J2); only the wording is
open.

Customer password reset and email verification are **not** in that list: §E12 removes the accounts
they belonged to. The guest order access link does the job both of them used to do between them —
it is the only way a customer ever reaches their own order data, which makes it the single most
deliverability-critical template in the set. It carries the `guestToken`, so it is also the one
template whose body must never be logged.

The confirmation email is the **only** place a `guestToken` is issued at purchase time. With no
account to fall back to, an order confirmation that lands in spam is not an inconvenience, it is a
customer who cannot track their order at all. SPF, DKIM and DMARC on `{{DOMAIN}}` are therefore a
launch blocker rather than a hardening task, and the `{{BRANDED_EMAIL}}` gap in
[00-client-decisions-2.md](00-client-decisions-2.md) §E9 is on the critical path for this reason
as much as for the Google Business Profile.

The international quote email ([18-checkout-specification.md](18-checkout-specification.md)
§18.23.7, E-INTL-2) joins the guest access link at the top of that criticality ranking: it is the
only route by which an international buyer can pay. An undelivered quote email is not a missed
notification, it is an order that expires unpaid on a timer.

### 26.16.1 The sending identity — a hard technical constraint

[00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com`. It is a
perfectly good **public contact address** and it **cannot be the transactional sending address**.
This is not a branding preference; it is a deliverability failure with a known mechanism.

| Mechanism | Consequence |
|---|---|
| Google does not permit a third-party system to publish SPF records authorising it to send as `gmail.com` | Every message this application sends "from" a Gmail address **fails SPF** |
| DKIM keys for `gmail.com` cannot be generated or published by this system | Every such message **fails DKIM** |
| Gmail's consumer DMARC policy rejects mail that fails both | Receiving providers **refuse or spam-file** the message |

The practical outcome is the one that costs money: an order confirmation that never arrives. The
customer has paid, has no account to check (§E12), sees nothing, and either contacts support or
disputes the charge. On the enquiry-then-invoice path the customer cannot even reach the point of
paying. This is why F5 classes it as a **Phase 1 blocker**, dependent on the `{{DOMAIN}}` decision
in [00-client-decisions-2.md](00-client-decisions-2.md) §E9.

**Required configuration.**

| Item | Value | Note |
|---|---|---|
| Sending domain | `{{DOMAIN}}`, or a dedicated subdomain such as `mail.{{DOMAIN}}` | A subdomain isolates sender reputation from the apex, which matters if marketing mail is ever added |
| SPF | A single `TXT` record on the sending domain authorising the {{ESP}}, one `include:` per authorised sender, ten-lookup limit respected | More than one SPF record on a name is a permanent `permerror`, and it is the commonest misconfiguration in this list |
| DKIM | 2048-bit key published by the {{ESP}} at its own selector; every outbound message signed | The signature is what survives forwarding, which SPF does not |
| DMARC | `p=none` with `rua` reporting during warm-up, tightened to `p=quarantine` and then `p=reject` once reports are clean | Publishing `p=reject` before the reports are clean blocks the shop's own mail |
| `From:` | **`no-reply@{{DOMAIN}}`** (`{{TRANSACTIONAL_FROM}}`) | Never a Gmail address, never a per-staff address |
| `Reply-To:` | A **monitored** address on `{{DOMAIN}}` — `{{BRANDED_EMAIL}}` | A `no-reply` `From:` with no reply path is the other half of the same failure: customers reply to order confirmations, and those replies must reach a human |
| Envelope sender / Return-Path | On the sending domain, aligned for DMARC | Bounce handling (§26.14.3) depends on it |
| Separation | Transactional and marketing on **different subdomains** | A promotional complaint must not damage receipt deliverability |

> **Superseded by [00-client-decisions-7.md](00-client-decisions-7.md) §K2.** Mail to
> `{{BRANDED_EMAIL}}` is received and answered in the admin panel (§26.16.2); Gmail forwarding is
> only the interim until that ships. The paragraph below is kept for the reasoning on sending
> direction, which still holds.

~~**The recommendation that makes this painless for the owners:**~~ forward `{{BRANDED_EMAIL}}` to
the existing `gif19601@gmail.com` inbox. The owners keep the mailbox they already open every day
and learn no new tool; the site presents the address it should; and the sending path is
authenticated independently of either. The forwarding direction matters — mail arrives at the
branded address and lands in Gmail, but nothing is ever *sent* as Gmail. Replies compose from the
branded address using Gmail's "send mail as" with SMTP submission through `{{DOMAIN}}`, which
keeps alignment intact.

**Implementation boundary.** `{{TRANSACTIONAL_FROM}}` and the reply address are configuration,
not literals: the `EmailService` adapter reads them from environment
([27-folder-architecture.md](27-folder-architecture.md)), and **no template hardcodes an
address**. A startup assertion fails fast if `{{TRANSACTIONAL_FROM}}` is unset or its domain does
not match the configured sending domain — a misconfigured `From:` is not detectable from inside
the application at send time, only from the silence that follows.

### 26.16.2 Business mail in the admin panel

[00-client-decisions-7.md](00-client-decisions-7.md) §K2. Data model in
[25-database-schema.md](25-database-schema.md) §25.8c; threat model in
[32-security-architecture.md](32-security-architecture.md) §32.16a.

**Inbound path.**

```
sender MTA
  → Cloudflare Email Routing (MX for {{DOMAIN}})
  → Email Worker
      1. PUT raw MIME to R2  mail-inbound/<yyyy>/<mm>/<ulid>.eml      ← durable first
      2. POST /api/v1/webhooks/mail-inbound  { objectKey, envelopeFrom, envelopeTo, receivedAt }
         HMAC over raw body + timestamp, as §26.14.1
      if step 1 fails: message.forward(<fallback external address>) — never drop
  → API: upsert MailInboundReceipt, 202, enqueue mail.ingest(objectKey)
  → mail.ingest job:
      parse (mailparser) → sender rules → auth verdict → sanitise HTML → store attachments in R2
      → thread → link order / lead → MailMessage row → notify
```

The Worker does as little as possible, because it is the one component that cannot be retried
from our side. Everything that can fail — parsing, the database, linking — happens in a job
that can be re-run from the R2 object. A step-2 failure is harmless: `mail.reconcileInbound`
finds the object.

**Threading, in order:**

1. `In-Reply-To` or any `References` value matches a stored `MailMessage.messageIdHeader` in the
   same mailbox → that thread. Because every transactional and staff message is stored with the
   `Message-ID` we generated, a customer replying to an order confirmation lands on the order.
2. Otherwise a new thread. If the subject or first 2 KB of text contains an order number
   (`VCH-\d{2}-\d{4,}`) that exists **and** whose `Order.email` matches the sender, the thread is
   linked to it. A number without a matching email is shown as a suggestion, not linked — an
   order number is not a secret.
3. `counterpartEmail` matching an open `Lead.email` links the lead.

Subject-line matching across threads is deliberately not used: «Питання» from two customers must
never merge.

**Outbound path.** Staff replies go through `EmailService` (§26.16) with a new method, never a
provider SDK:

```ts
sendThreadMessage(args: {
  threadId: string; mailboxId: string; bodyHtml: string;
  attachmentIds: string[]; sentById: string; idempotencyKey: string;
}): Promise<{ messageId: string }>;
```

`From:` is the mailbox address with its `displayName` (Вівчарик), `Message-ID` is generated as
`<cuid@{{DOMAIN}}>`, and `In-Reply-To` / `References` are built from the thread. The
`MailMessage` row is written with `deliveryState = QUEUED` in the same transaction as the job;
§26.14.3 webhook events move it on. The apex domain therefore needs SPF and DKIM for `{{ESP}}` as
well as the transactional subdomain.

**Transactional mail joins the thread model.** `EmailService.send` also writes a
`MailMessage` of kind `TRANSACTIONAL` into a thread on the `{{BRANDED_EMAIL}}` mailbox, linked
to the order, with `status = CLOSED` (nothing to answer until the customer writes back).
`Reply-To:` is `{{BRANDED_EMAIL}}`. Templates that carry a secret — staff invitation, staff
password reset, guest order-access link — are stored with `bodyWithheld = true`.

**Side effects of a staff reply:** thread `OPEN → WAITING`; an `email_sent` `OrderEvent` when
the thread is linked to an order; a linked `Lead` in `NEW` moves to `CONTACTED` (§23.13). An
inbound message on a `WAITING` or `CLOSED` thread returns it to `OPEN`.

**Admin endpoints.** Mailbox membership is checked in the handler after the permission check
(§24.14); a non-member receives 404, not 403, for a non-shared mailbox.

| Method and path | Permission | Note |
|---|---|---|
| `GET /api/v1/admin/mail/threads` | `mail.read` | Filters: mailbox, status, assignee, `mine`, `unanswered`, `q` (full-text over subject and text body). Cursor-paginated |
| `GET /api/v1/admin/mail/threads/:id` | `mail.read` | Messages, attachment metadata, linked order and lead summaries, customer history by email |
| `POST /api/v1/admin/mail/threads/:id/read` | `mail.read` | Body `{ upToMessageId }` — the last message the client **rendered**. Upserts `MailThreadRead.readAt` to that message's `occurredAt`, never to `now()`, and never moves it backwards. Sent with `navigator.sendBeacon` on leave (§23.13a) |
| `DELETE /api/v1/admin/mail/threads/:id/read` | `mail.read` | «Позначити непрочитаним» |
| `PATCH /api/v1/admin/mail/threads/:id` | `mail.update`; `mail.assign` for `assignedToId` | Status, spam, order and lead link |
| `POST /api/v1/admin/mail/threads/:id/messages` | `mail.reply` | `Idempotency-Key` required. Rate-limited per user, `{{MAIL_SEND_RATE}}` (default 60/hour) |
| `POST /api/v1/admin/mail/threads` | `mail.reply` | New outbound thread, e.g. from an order or lead page |
| `PUT` / `DELETE /api/v1/admin/mail/threads/:id/draft` | `mail.reply` | Autosaved every 5 s while typing |
| `POST /api/v1/admin/mail/attachments` | `mail.reply` | Upload for an outgoing message; `{{MAIL_ATTACHMENT_MAX_MB}}` (default 20) |
| `GET /api/v1/admin/mail/attachments/:id` | `mail.read` | Streamed by the API with `Content-Disposition: attachment` — never a public or long-lived URL |
| `GET` / `POST` / `DELETE /api/v1/admin/mail/sender-rules` | `mail.update` | Block and allow list |
| `DELETE /api/v1/admin/mail/threads/:id` | `mail.delete` ⚠ | Hard delete of rows and R2 objects; audited |
| `GET` / `POST` / `PATCH /api/v1/admin/mailboxes` | `mail.manage_mailboxes` ⚠ | Addresses, display name, signature, members |

**Jobs** (added to §26.17):

| Job | Schedule | Work | On failure |
|---|---|---|---|
| `mail.ingest` | on demand | The pipeline above | 5 attempts with backoff, then dead letter **and alert** — an unprocessed customer email is a lost customer |
| `mail.reconcileInbound` | 10 min | R2 objects older than 10 min without a processed `MailInboundReceipt` → enqueue `mail.ingest` | Retry, alert |
| `mail.notify` | on demand | Web Push to members of the mailbox (§23.13a); optional content-free notice to the member's external login address | Retry 3×; a missed push is not worth a page |
| `mail.purgeExpired` | daily | Threads whose last message is older than `{{MAIL_RETENTION_MONTHS}}` (**8**, [00-client-decisions-8.md](00-client-decisions-8.md) §L8): rows and R2 objects deleted. **Skipped** while the linked order has an open return, refund, payment dispute or chargeback | Retry, alert |

**Environments.** Development and test use a fake inbound source that drops `.eml` fixtures into
the same `mail.ingest` job, and Mailpit for outbound (§26.16). The fixture set includes the
hostile cases from §32.16a, so sanitisation is tested on every build.

**Swap boundary.** `InboundMailSource` is an adapter like `EmailService`. If spam volume outgrows
the basic filtering in §32.16a, a provider with inbound parsing and spam scoring replaces the
Worker without touching the job.

## 26.17 Background jobs and the scheduler

**pg-boss**, a job queue backed by the existing Postgres database.

| Option | Verdict |
|---|---|
| `node-cron` in-process | Rejected. No persistence, no retries, no visibility, and it double-fires the moment a second instance runs. |
| BullMQ | Rejected. Excellent, and it requires Redis: a second datastore to operate, back up and monitor for a few thousand jobs a day. |
| Managed queue (SQS, Cloud Tasks) | Rejected. Lock-in and an external dependency for jobs that all read and write the same Postgres. |
| Separate worker service | Rejected at this scale, per §26.2.4. |
| **pg-boss** | **Chosen.** Persistent, transactional, retrying, scheduled, with dead letters, and zero new infrastructure. |

The decisive property is transactional enqueue: an order commit and its confirmation-email job go
in the same transaction, so the email cannot be sent for an order that rolled back nor lost for an
order that committed. With Redis that guarantee needs an outbox table, which is more machinery
than the problem deserves. Workers run in the API process on a separate, lower-priority
concurrency pool; if a job class ever starves request handling, the same binary starts with
`ROLE=worker`. That is a deployment flag, not a rewrite.

| Job | Schedule | Work | On failure |
|---|---|---|---|
| `stock.sweepReservations` | 1 min | Delete `StockReservation` past `expiresAt` (§25.5) | Retry 3×, alert. Prevents overselling one-of-one pieces, so it runs often and cheaply. |
| `cart.expire` | hourly | Delete `Cart` past `expiresAt` | Retry |
| ~~`cart.abandoned`~~ | — | **Removed** by round 10 part 5: no abandoned-checkout email | — |
| `posts.publishScheduled` | 5 min | `SCHEDULED` past `scheduledFor` becomes `PUBLISHED`, caches purged | Retry, alert |
| `promotions.expire` | 15 min | Deactivate past `endsAt`, purge banner and listing caches | Retry |
| `sitemap.regenerate` | daily 03:00 Europe/Kyiv, plus triggered | Rebuild the segmented index for four locales, ping search engines | Retry 3×, alert |
| `orders.pollTracking` | 30 min | §26.14.2 | Backoff; carrier downtime must not page anyone |
| `orders.expireQuotes` | 15 min | International orders past `quoteExpiresAt` and unpaid: `quoteStatus → EXPIRED`, reservations released and stock restored in one transaction, expiry email enqueued. **`OrderStatus` stays `PENDING`** so the quote is re-issuable in one click (§26.10.4, [00-client-decisions-5.md](00-client-decisions-5.md) §H2) | Retry 3×, alert. It releases held inventory, so a stall is a silent inventory freeze — the same reasoning that makes `stock.sweepReservations` run often |
| `orders.cancelLapsedQuotes` | daily | `quoteStatus = EXPIRED` and untouched for `{{QUOTE_LAPSE_DAYS}}` (default 14): `OrderStatus → CANCELLED` | Retry. Separate from expiry so stock is freed in minutes while the opportunity survives for a fortnight |
| `orders.quoteReminder` | hourly | One reminder 24 h before `quoteExpiresAt` on `QUOTED` unpaid orders | At-most-once marker. A second reminder reads as pressure on a five-figure purchase |
| `orders.quoteSlaAlert` | hourly | Alert the order's assignee — Любов by intent, Іван until her account exists ([00-client-decisions-8.md](00-client-decisions-8.md) §L1) ([00-client-decisions-5.md](00-client-decisions-5.md) §H3) — on any `AWAITING_QUOTE` order older than `{{QUOTE_SLA_HOURS}}`, resolved as **48 working hours** against the Europe/Kyiv business calendar; on breach, every holder of `orders.quote` | The promise in the submission email is only real if missing it wakes somebody. Alerting everyone immediately is how a shared queue becomes nobody's queue |
| `orders.productionDueSoon` | daily | `IN_PRODUCTION` orders within 3 days of `expectedDispatchAt`, and any past it | The fourteen-day build is the one commitment in the system with no carrier or provider to blame, and the failure is silent until the customer writes |
| `email.send` | on demand | Deliver one queued message | Exponential backoff, 5 attempts, dead letter |
| `cdn.purge` | on demand | §26.13.3 | Retry once, log, never block |
| `search.rebuildVectors` | nightly | Refresh `tsvector` columns after bulk imports | Retry |
| `import.processJob` | on demand | Chunked catalogue or translation import with progress | Resumable from the last committed chunk |
| `audit.archive` | monthly | Move `AuditLog` older than {{AUDIT_RETENTION_MONTHS}} to cold storage | Retry |
| `analytics.rollup` | nightly | Precompute dashboard aggregates | Retry |
| `notify.telegram` | on demand | Post one event to the configured Telegram chat: order number, total, city, payment method — **no name, phone or address**; a link into the panel | Retry 3× with backoff; a missed notification never blocks the order |
| `reports.weekly` | Monday 08:00 Europe/Kyiv | Sales, orders, top products and low stock for the past week; shown in the panel and sent via `notify.telegram` | Retry, alert |
| `fx.refreshEur` | daily 10:00 Europe/Kyiv | NBU UAH→EUR rate into `Setting` `pricing.eur_rate`; storefront displays whole-euro prices on non-`uk` locales | Keep yesterday's rate on failure; alert after 3 days stale |
| `quickOrders.purge` | daily | Requests closed more than 8 months ago are deleted | Retry |
| `translate.onSave` | on demand | After a `uk` save: machine-translate every `MACHINE`-sourced field into `pl`, `en`, `de` through the Claude API; `HUMAN` fields are flagged stale instead of overwritten; legal pages skipped ([00-client-decisions-10.md](00-client-decisions-10.md) §P8a) | Retry 3×; the `uk` save never waits for it |
| `fiscal.issue` | on demand | Round 14: WayForPay's built-in ПРРО creates the receipt from the product lines sent with the payment; this job reads its fiscal number, link, QR and PDF (V13) into `FiscalReceipt` on the payment callback, and for a refund the return receipt. Fallback provider `dps` signs and sends the receipt itself. The link goes to the order page only, never into the order e-mail; the return receipt goes into «Кошти повернено» ([00-client-decisions-14.md](00-client-decisions-14.md)) | Retry every 5 min; Telegram to Іван after 1 h — a missing receipt is a tax problem |
| `orders.unconfirmedReminder` | hourly | Orders without «Підтверджено дзвінком» 24 h after creation → Telegram to Іван and Любов | At-most-once per order |
| `orders.autoCancelUnpaid` | hourly | Card-payment orders unpaid 3 days after creation → `CANCELLED`, stock released, cancellation email ([00-client-decisions-10.md](00-client-decisions-10.md) part 6) | Retry |

`sitemap.regenerate` is both scheduled and event-triggered: a publish enqueues it with a
60-second debounce, so publishing ten products in a row produces one rebuild rather than ten.

## 26.18 Observability

**Structured logging.** Pino, JSON to stdout, one line per request plus explicit domain events.
Every line carries `requestId`, `method`, `path`, `status`, `durationMs`, `locale` and, where
present, `staffUserId`, `customerId` or `cartId`. Levels are used honestly: `error` means someone
must look, `warn` means a pattern worth watching, `info` is requests and domain events, `debug` is
off in production.

**Request IDs.** A ULID per request (sortable by time), propagated through `AsyncLocalStorage` so
any code can attach it without threading a context parameter through every signature, echoed as
`x-request-id`, present in every error envelope (§26.8), and attached to every Sentry event and
every enqueued job so a background failure traces back to the request that created it. An inbound
`x-request-id` from the CDN is honoured rather than replaced, which is what makes edge and
application log lines joinable.

**Redaction is configured, not remembered.** Pino's `redact` list covers `password`,
`passwordHash`, `token`, `refreshToken`, `authorization`, `cookie`, `card`, `cvv`, `signature` and
`apiKey` at every depth. A secret in a log is a permanent secret in a log.

**Error tracking.** Sentry on client and server sharing a release identifier, so a browser error
maps to the deployed commit. Source maps uploaded, never served publicly. `beforeSend` strips PII.
100% of errors, {{TRACE_SAMPLE_RATE}} (proposed: 10%) of performance traces, raised during
incidents.

**Metrics, deliberately minimal.** Request rate, error rate and p50/p95/p99 latency per route
class; job queue depth and failures; Postgres pool saturation; orders placed and payments
authorised. A full Prometheus and Grafana stack is not justified by this team size, so these are
exposed at `/metrics` behind basic auth for a {{MONITORING}} provider to scrape if one is adopted.
External uptime checks hit `/v1/health` (liveness with no dependencies, so a database blip does
not restart a healthy process) and `/v1/ready` (dependencies, used by the load balancer).

## 26.19 OpenAPI generation

The specification is generated from the Zod schemas, never hand-written.

```ts
registry.registerPath({
  method: 'post',
  path: '/api/v1/cart/items',
  tags: ['cart'],
  summary: 'Add a variant to the cart',
  request: { body: { content: { 'application/json': { schema: addCartItemInput } } } },
  responses: {
    200: { description: 'The full reconciled cart', content: { 'application/json': { schema: cartResponse } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelope } } },
  },
});
```

The document is emitted at build time and served at `/api/v1/openapi.json`, with Scalar rendering
it at `/api/v1/docs` outside production. **CI fails if the committed `openapi.json` differs from
the generated one**, which is what makes documentation structurally incapable of drifting from
validation: both are the same source. Client fetch wrappers are typed from the Zod schemas
directly rather than from a generated OpenAPI client, because generating a client from a document
generated from types the client already imports is a round trip that adds a build step and removes
nothing. The document's real consumers are onboarding contractors, the eventual mobile or partner
integration, and contract tests asserting that every registered path has a handler and every
handler has a registered path.

## 26.20 Cross-references

| Concern | Document |
|---|---|
| Mixed carts ship together as one order; the return-shipping deposit confirmed | [00-client-decisions-6.md](00-client-decisions-6.md) |
| Prepaid made-to-order, the return-shipping deposit, custom-size pricing, quote defaults and ownership | [00-client-decisions-5.md](00-client-decisions-5.md) |
| The 14-day production status, phone priority, the parcel business card | [00-client-decisions-4.md](00-client-decisions-4.md) |
| Partner branding, quoted international shipping, the sending-domain constraint | [00-client-decisions-3.md](00-client-decisions-3.md) |
| Guest checkout, WayForPay, international sales, content import | [00-client-decisions-2.md](00-client-decisions-2.md) |
| The enquiry-then-invoice buyer experience these endpoints serve | [18-checkout-specification.md](18-checkout-specification.md) §18.23.7 |
| The `Product` JSON-LD these serialiser outputs feed | [17-product-page-specification.md](17-product-page-specification.md) §17.21.3a |
| Data shapes, enums, indexes | [25-database-schema.md](25-database-schema.md) |
| Where this code lives, environment variables | [27-folder-architecture.md](27-folder-architecture.md) |
| How clients consume these endpoints | [28-state-management-architecture.md](28-state-management-architecture.md) |
| hreflang, canonicals, sitemap shape | [29-seo-architecture.md](29-seo-architecture.md) |
| Permission keys and role defaults | [24-employee-permission-architecture.md](24-employee-permission-architecture.md) |
| Auth hardening, CSP, secret handling | [32-security-architecture.md](32-security-architecture.md) |
| Admin screens consuming `/v1/admin/*` | [23-admin-panel-architecture.md](23-admin-panel-architecture.md) |
