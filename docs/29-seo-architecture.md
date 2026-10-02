# 29 — SEO Architecture

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Paginated `?page=N` URLs under «Показати ще»; subcategory pages linked from the mega menu; FAQ as one accordion page; on-site product reviews may carry `AggregateRating`; no category links in the footer — internal linking relies on the mega menu and breadcrumbs ([00-client-decisions-10.md](00-client-decisions-10.md)).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Google reviews are displayed, not marked up** as the site's own `AggregateRating` — third-party reviews do not qualify.
> - FAQ seeded with the three questions buyers actually ask (part 5 answer 8) — also the strongest AI-search passages.
> - **All four locales at launch, AI-translated**; `pl` first in priority. Legal pages reviewed by a human (follow-up §F4). Production and flock claims restricted per §F1 in every locale.
> - No newsletter, no Instagram: `sameAs` carries the Google Business Profile only.


Governed by [00-client-decisions-3.md](00-client-decisions-3.md) first,
[00-client-decisions-2.md](00-client-decisions-2.md) second and
[00-client-decisions.md](00-client-decisions.md) third.

**Round 3 changes four things in this document**, and one of them reverses an earlier
recommendation:

1. **F2 — the Яворів site is a shop as well as a factory.** «Там знаходиться і магазин і
   виробництво.» This is the largest change here. The Google Business Profile can legitimately
   carry retail attributes, which makes it eligible for «де купити ліжник» transactional-local
   queries a pure manufacturer profile cannot answer. §29.16's category guidance is **rewritten** —
   the previous instruction to avoid a retail primary category was based on incomplete information
   and is withdrawn. §29.6's `Store` typing gains a justification rather than remaining an
   incidental choice.
2. **F6 — the tagline stays «в Карпатах».** The proposal to substitute «у Яворові» in the headline
   is withdrawn by the client and the withdrawal is correct. Яворів remains in every supporting
   surface. §29.4's templates are **rebalanced** rather than reverted: general titles lead with the
   Carpathian framing, specific-intent titles may lead with Яворів. The governing pattern is
   **«Карпати» to be understood, «Яворів» to be believed**.
3. **F3 — partner goods are sold under the Вівчарик brand.** The open question in
   [00-client-decisions-2.md](00-client-decisions-2.md) E13.5 is resolved. `brand` is Вівчарик on
   both origins; `manufacturer` is present on own-manufacture and **omitted entirely** on partner
   goods. §29.6's serialiser spec is now unconditional.
4. **F5 — the contact address is `gif19601@gmail.com`,** which carries a trust cost on a site
   selling 5,000–15,000 UAH goods and cannot be the transactional sending address at all. The SEO
   consequence is noted in §29.15; the technical requirement belongs to
   [32-security-architecture.md](32-security-architecture.md) §32.16 and
   [35-implementation-roadmap.md](35-implementation-roadmap.md) Phase 1.

Five decisions from the earlier rounds still shape this document:

1. **D2 — new brand, new domain, no migration.** There is no legacy URL set, no redirect map, no
   Search Console baseline, and no inherited authority. This is a **cold start**, and §29.15
   replaces what would otherwise have been a migration plan.
2. **D3 / E7 / F3 — the resale category.** Products from partner manufacturers sit in the same
   catalogue as own-manufacture goods, **the partners cannot be named**
   ([00-client-decisions-2.md](00-client-decisions-2.md) E7), and the goods are **sold under the
   Вівчарик brand** ([00-client-decisions-3.md](00-client-decisions-3.md) F3).
   `Product.manufacturer` is therefore *omitted* on partner goods rather than misattributed, while
   `brand` is asserted on both. Emitting an own-manufacture claim on a resold product is a
   structured-data violation and a trust failure at the same time (§29.6).
3. **E2 — Яворів is the strongest keyword asset on the project, and it lives below the headline.**
   вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644. Яворів is the
   recognised centre of Hutsul lizhnyk weaving — «столиця ліжникарства» — with a dedicated
   Музей ліжникарства and annual weaving plein airs. The keyword strategy (§29.13), the structured
   data (§29.6) and the local-SEO plan (§29.16) are built on that word. The meta templates (§29.4)
   split it: general titles carry «Карпати», specific-intent titles carry «Яворів»
   ([00-client-decisions-3.md](00-client-decisions-3.md) F6).
4. **E3 — opening hours are variable and are therefore absent from structured data** (§29.6,
   §29.16). There is also **no social media of any kind**, which removes `sameAs` profiles and one
   of the launch channels §29.15 previously assumed.
5. **E5 — catalogue content is reused from a site that stays live.** This is the single largest
   ranking risk in the document and it has its own section: **§29.18**. Read it before any
   catalogue migration work starts, because the cost of getting it wrong is not a penalty — it is
   losing every query to an older domain publishing the same sentences.

The performance target is Lighthouse SEO 100, Performance 98–100, Accessibility 100, Best
Practices 100. Lighthouse SEO 100 is a low bar — it checks for a title, a meta description, a
viewport tag, crawlable links and legible fonts. Hitting 100 is table stakes and proves almost
nothing about whether the site ranks. Everything in this document beyond §29.4 exists because
the score and the outcome are different things.

---

## 29.1 The rendering decision

### The problem

The stack is React + Vite. A default Vite build produces a client-rendered single-page
application: an empty `<div id="root">`, a JavaScript bundle, and content that exists only after
hydration. Google *can* render that — its two-pass indexing queues JavaScript execution — but
three costs are non-negotiable for this project:

- **Indexing latency.** JavaScript rendering is queued and deprioritised. On a new domain with no
  crawl budget and no authority (D2), adding a rendering delay on top of a sandbox period is
  compounding the exact problem the site already has.
- **Non-Google consumers do not render.** Bing renders inconsistently. Most AI retrieval crawlers
  fetch raw HTML and do not execute JavaScript at all — see
  [30-ai-search-optimization.md](30-ai-search-optimization.md) §30.2. A client-rendered site is
  invisible to them.
- **LCP.** The largest contentful paint on a photography-led site is a photograph. In an SPA that
  photograph's URL is not discoverable by the preload scanner until the bundle has parsed,
  hydrated, and fetched. That alone costs 800–1,500 ms on mobile and puts Performance 98–100 out
  of reach.

### The decision

**Server-side rendering with full HTML responses, built on Vite's SSR pipeline via React Router
v7 in framework mode**, with HTML cached at the CDN edge and revalidated on content change.

React Router v7 framework mode is chosen over the alternatives because it is *Vite-native*: it
keeps the build tool, the TypeScript config, the Tailwind pipeline and the Framer Motion setup
specified in the stack, and it adds SSR, nested data loading and streaming without introducing a
second framework. Vike is a viable substitute with the same properties.

### The alternatives, and why each is rejected

| Option | Verdict | Reasoning |
|---|---|---|
| CSR SPA + dynamic rendering (serve prerendered HTML to bots) | **Rejected** | Google calls this a workaround, not a solution. It is cloaking-adjacent, it doubles the surfaces that can drift apart, and it fails silently when a new crawler user-agent appears. |
| CSR SPA + build-time prerender of all routes | **Rejected** | Works for a marketing site. Fails here: stock, price and availability change continuously, and prerendered HTML would assert stale prices. A stale `Offer.price` is a consumer-law problem in the `de` and `pl` locales, not just an SEO one. |
| Migrate to Next.js | **Rejected** | It would deliver the same SEO outcome, but it discards the stated stack and imports a framework whose caching model is significantly harder to reason about. The gain does not justify the rewrite. |
| Vite SSR (React Router v7 framework mode) | **Chosen** | Full HTML on first byte, preserves the stack, single rendering path, no bot-specific behaviour. |
| Static generation for editorial + SSR for commerce | **Partially adopted** | Blog, about, production and legal pages are cached far more aggressively than commerce pages. Same renderer, different cache policy — see the TTL table below. |

### The trade-offs, stated honestly

SSR is not free, and a document that pretends otherwise sets the build up to fail.

- **A Node process now sits in the request path.** It can fall over, leak memory, and it must be
  monitored. Static hosting cannot.
- **Hydration cost is real.** Server HTML arrives fast, but the page is not interactive until the
  bundle hydrates. Poorly managed, SSR improves LCP while *worsening* INP. The mitigation is
  strict: Framer Motion is dynamically imported and never present in the initial bundle on the
  LCP path; the product gallery, filter panel, cart drawer and search overlay are all lazily
  hydrated; no animation library participates in first paint.
- **Two execution environments.** Any `window`, `localStorage` or `Date.now()` reference in a
  component that renders on the server is a crash or a hydration mismatch. This is a real,
  recurring class of bug and it is prevented by an SSR-safety lint rule plus a CI check that
  renders every route type on the server.
- **Caching becomes a correctness problem.** A per-locale, per-currency HTML cache is easy to get
  wrong. The `Vary` header and the cache key must be explicit and tested.

### Cache policy

| Surface | Edge TTL | Stale-while-revalidate | Invalidated by |
|---|---|---|---|
| Homepage | 300 s | 86,400 s | Banner, promotion or featured-product change |
| Category listing | 180 s | 3,600 s | Product publish/unpublish, price change, stock transition to/from zero |
| Product detail | 120 s | 3,600 s | Any mutation on the product, its variants, media or approved reviews |
| Editorial (blog, about, production, care) | 3,600 s | 604,800 s | Post publish or update |
| Legal, policy, contact | 86,400 s | 604,800 s | Manual purge |
| Cart, checkout, account, admin | `private, no-store` | — | Never cached |

Cache key = path + locale + currency. `Vary: Accept-Encoding`. Personalisation (cart count,
recently viewed) is fetched client-side after hydration and never enters the cached document —
otherwise one visitor's cart is served to another, which is a security incident, not a caching
bug. See [32-security-architecture.md](32-security-architecture.md) §32.12.

Invalidation is driven by an admin-side webhook that purges exact paths, not wildcards. A
wildcard purge on every product save would destroy the cache hit rate during catalogue entry,
which — per [00-client-decisions.md](00-client-decisions.md) D5 — is the critical path.

---

## 29.2 URL architecture

### Locale routing

`uk` is the canonical locale and renders **without a path prefix**. `en`, `pl` and `de` are
prefixed.

```
https://{{DOMAIN}}/                     → uk homepage, also x-default
https://{{DOMAIN}}/en/                  → en homepage
https://{{DOMAIN}}/pl/                  → pl homepage
https://{{DOMAIN}}/de/                  → de homepage
```

**Why the default locale is unprefixed.** The root URL is the single most-linked URL any site
has — it is what goes on the Google Business Profile, on packaging inserts and on a business card.
On a cold-start domain with no social profiles
([00-client-decisions-2.md](00-client-decisions-2.md) E3) those are very nearly the *only* links
that exist for the first two quarters. Making the root a 302 hop to `/uk/` wastes the strongest asset the project owns.
The Ukrainian market is also ~90% of expected volume, so the shortest URLs belong to it.

**The counter-argument, acknowledged.** Symmetric prefixes (`/uk/`, `/en/`, …) make middleware
simpler and make hreflang mistakes harder. The failure mode of an unprefixed default is a route
collision between a locale prefix and a top-level path. Two rules neutralise it:

1. `uk`, `en`, `pl`, `de` are **reserved slugs**. No category, product, post or page may ever use
   them in any locale. Enforced at the slug validator (§29.2, slug rules) and in the seed data.
2. **No automatic redirect based on IP or `Accept-Language`, ever.** Geo-redirects break
   crawlers, break shared links, and are the single most common cause of hreflang failure. A
   dismissible, non-blocking banner offers the detected locale; the URL is never changed on the
   visitor's behalf. The choice persists in a first-party cookie that is read only to select the
   banner, never to alter routing.

### Path segments are localised

Translating the slug but leaving an English path segment (`/de/catalog/…`) is a half-measure that
reads as machine-generated. Segments are translated per locale and fixed in a routing constant.

| Route | uk | en | pl | de |
|---|---|---|---|---|
| Catalogue root | `/katalog/` | `/en/catalog/` | `/pl/katalog/` | `/de/katalog/` |
| Product | `/tovar/<slug>/` | `/en/product/<slug>/` | `/pl/produkt/<slug>/` | `/de/produkt/<slug>/` |
| Blog | `/blog/<slug>/` | `/en/journal/<slug>/` | `/pl/blog/<slug>/` | `/de/journal/<slug>/` |
| Production | `/vyrobnytstvo/` | `/en/production/` | `/pl/produkcja/` | `/de/produktion/` |
| About | `/pro-nas/` | `/en/about/` | `/pl/o-nas/` | `/de/ueber-uns/` |
| Wholesale | `/opt/` | `/en/wholesale/` | `/pl/hurt/` | `/de/grosshandel/` |
| Care guide | `/dohliad/` | `/en/care/` | `/pl/pielegnacja/` | `/de/pflege/` |
| Gallery | `/haleriia/` | `/en/gallery/` | `/pl/galeria/` | `/de/galerie/` |
| Reviews | `/vidhuky/` | `/en/reviews/` | `/pl/opinie/` | `/de/bewertungen/` |
| Contact | `/kontakty/` | `/en/contact/` | `/pl/kontakt/` | `/de/kontakt/` |
| Search | `/poshuk/` | `/en/search/` | `/pl/szukaj/` | `/de/suche/` |

`/de/ueber-uns/` uses `ue`, not `über`. Percent-encoded non-ASCII in a path is legal but renders
as `%C3%BC` in every place a URL is copied, pasted or shared. ASCII-only paths are a hard rule
(§29.2, slug rules).

### Category depth

The category tree in [00-client-decisions.md](00-client-decisions.md) §D3 has a conceptual third
level (ВЛАСНЕ ВИРОБНИЦТВО / ПАРТНЕРСЬКІ ВИРОБИ). **Origin is not a URL level.** It is a
first-class product field and a filter facet. Rendering it as a path prefix would produce
`/katalog/vlasne-vyrobnytstvo/vovna/lizhnyky/` — four segments deep, with a near-duplicate
partner branch alongside it.

URL depth is therefore capped at two category levels:

```
/katalog/                              catalogue root
/katalog/vovna/                        material group
/katalog/vovna/lizhnyky/               family
/katalog/vovna/huni/
/katalog/vovna/kamizelky/
/katalog/vovna/kovdry/
/katalog/vovna/podushky/
/katalog/vovna/shkarpetky/
/katalog/vovna/kaptsi/
/katalog/vovna/poiasy/
/katalog/vovna/nakydky/
/katalog/vovna/priazha/
/katalog/vovna/rovnytsia/
/katalog/vovna/vovna-dlia-rukodillia/
/katalog/ovchyna/
/katalog/shkiriani-vyroby/
/katalog/partnerski-vyroby/
```

`ПАРТНЕРСЬКІ ВИРОБИ` gets its own browse node because the client asked for a distinct category,
but partner products **also** appear in their material categories with the origin badge. This is
listing overlap, not duplicate content: the product itself has exactly one URL.

`ДЕРЕВО` exists as an inactive category node with no products and is excluded from navigation,
sitemaps and internal links until it launches. A category page with zero products is a thin-content
liability on a domain that has no authority to spend.

### Products are flat

Product URLs are `/tovar/<slug>/`, never nested under a category. Products belong to several
categories; nesting forces either duplicate URLs with a canonical, or an arbitrary "primary
category" that breaks the moment merchandising changes. A flat product namespace also makes the
`@@unique([locale, slug])` constraint in [25-database-schema.md](25-database-schema.md) §25.2
sufficient on its own.

### Slug rules

Derived from [25-database-schema.md](25-database-schema.md) §25.2. Enforced in a single shared
`slugify()` used by the API, the admin and the seed script — never re-implemented.

| Rule | Detail |
|---|---|
| Character set | `a–z`, `0–9`, `-` only. No underscores, no non-ASCII, no uppercase. |
| Transliteration | Ukrainian → Latin per **KMU 2010** (the official standard: `г→h`, `х→kh`, `ц→ts`, `щ→shch`, `я→ya` word-initially and `ia` elsewhere). Polish and German diacritics fold to base letters plus `ß→ss`, `ä→ae`, `ö→oe`, `ü→ue`. |
| Uniqueness | `@@unique([locale, slug])`. Collisions append `-2`, `-3` — never a random suffix, which is unreadable and unmemorable. |
| Length | Target ≤50 characters, hard limit 75. Truncation happens at a word boundary. |
| Stop words | Ukrainian prepositions (`z`, `dlia`, `ta`, `i`) are stripped **only** when the slug exceeds the target length, and never when stripping changes the meaning (`vovna-dlia-rukodillia` keeps `dlia`). |
| Numbers | Permitted. Size digits are not: size is a facet, not part of a product identity. `lizhnyk-mozaika`, not `lizhnyk-mozaika-150x200`. |
| Reserved | `uk`, `en`, `pl`, `de`, `api`, `admin`, `assets`, `static`, `sitemap`, `robots`, `cart`, `checkout`, `search`, `_`, plus every localised route segment in the table above. |
| Immutability | A published slug is immutable by default. Editing it requires a confirmed admin action which **atomically writes a `Redirect` row** (§29.9). A slug change without a redirect is a 404 the team creates for itself. |
| Trailing slash | Every content URL ends in `/`. The alternative form 301s. One canonical form, enforced at the edge, no exceptions. |
| Case | Lowercase only. Mixed-case requests 301 to lowercase. |

### Query parameters

| Parameter | Purpose | Indexation |
|---|---|---|
| `?sort=` | Listing order | Canonical to the unsorted URL |
| `?view=` | Grid/list density | Canonical to the default |
| `?per=` | Page size | Canonical to the default |
| `?q=` | Site search | `noindex, follow` |
| `?color=`, `?price=`, `?origin=`, … | Non-indexable facets | See §29.7 |
| `?utm_*`, `?gclid`, `?fbclid` | Campaign tagging | Stripped client-side after capture; canonical always points at the clean URL |

---

## 29.3 Hreflang and canonical

### The matrix

Every page that exists in more than one locale emits a complete, reciprocal set. Incomplete or
non-reciprocal annotation is worse than none: Google discards the whole cluster.

| Emitted on | `hreflang` values emitted | `x-default` target |
|---|---|---|
| Any `uk` page | `uk`, `en`, `pl`, `de`, `x-default` | The `uk` URL |
| Any `en` page | identical set | The `uk` URL |
| Any `pl` page | identical set | The `uk` URL |
| Any `de` page | identical set | The `uk` URL |

Rules that are easy to get wrong and are therefore enumerated:

1. **Self-reference is mandatory.** Each page lists itself in its own set.
2. **`x-default` points to `uk`**, the canonical locale — not to a language selector. There is no
   language selector page, by design (§29.2: no auto-redirects).
3. **Language-only codes**, not `uk-UA` or `de-DE`. The site does not vary by country, only by
   language: a German-speaking buyer in Austria gets the same page. Region codes would be a claim
   the site cannot honour.
4. **Absolute URLs with protocol and host.** Relative hreflang is silently ignored.
5. **Only canonical URLs appear in hreflang.** A paginated, filtered or otherwise
   non-self-canonical URL is never an hreflang target.
6. **Missing translations are omitted, not faked.** The
   [25-database-schema.md](25-database-schema.md) §25.2 fallback rule serves the `uk` row with an
   `x-translation-fallback: true` header when a translation is absent. Such a page is
   **`noindex` and is excluded from the hreflang set and the sitemap** until translated. Serving
   Ukrainian text at a `/de/` URL and annotating it as German is a duplicate-content signal and a
   terrible user experience.
7. **Canonical and hreflang must agree.** If a page canonicalises elsewhere, it emits no hreflang.

### Exact output — a product page

For the ліжник «Мозаїка», `uk` slug `lizhnyk-mozaika`, on the `uk` locale:

```html
<link rel="canonical" href="https://{{DOMAIN}}/tovar/lizhnyk-mozaika/">
<link rel="alternate" hreflang="uk"        href="https://{{DOMAIN}}/tovar/lizhnyk-mozaika/">
<link rel="alternate" hreflang="en"        href="https://{{DOMAIN}}/en/product/mozaika-lizhnyk-blanket/">
<link rel="alternate" hreflang="pl"        href="https://{{DOMAIN}}/pl/produkt/lizhnyk-mozaika-koc-welniany/">
<link rel="alternate" hreflang="de"        href="https://{{DOMAIN}}/de/produkt/lizhnyk-mozaika-wolldecke/">
<link rel="alternate" hreflang="x-default" href="https://{{DOMAIN}}/tovar/lizhnyk-mozaika/">
<meta property="og:locale" content="uk_UA">
<meta property="og:locale:alternate" content="en_GB">
<meta property="og:locale:alternate" content="pl_PL">
<meta property="og:locale:alternate" content="de_DE">
```

The same block, byte-identical except for the `canonical` and `og:locale` lines, renders on all
four locale URLs. It is generated by one function from the product's translation rows, so
reciprocity is structural rather than a thing someone remembers to check.

Note that `og:locale` *does* use region codes. Open Graph requires the `language_TERRITORY` form;
hreflang does not. They are different specifications and the difference is deliberate.

### Canonical rules by page type

| Page | Canonical target |
|---|---|
| Product | Itself |
| Category, page 1 | Itself |
| Category, page *n* | **Itself** — not page 1. Page 2 holds different products; canonicalising it to page 1 tells Google those products do not need indexing. |
| Category + indexable facet | Itself (§29.7) |
| Category + non-indexable facet | Itself, plus `noindex, follow` |
| Category + `?sort` / `?view` / `?per` | The clean category URL |
| Search results | Itself, plus `noindex, follow` |
| Blog post | Itself |
| Blog tag/archive page *n* | Itself |
| Untranslated locale fallback | No canonical, `noindex` |
| Cart, checkout, account, order tracking | No canonical, `noindex, nofollow` |

**Canonical and `noindex` are never combined in a conflicting way.** Where a page is
non-indexable, its canonical points at *itself* and `noindex, follow` does the work. Pointing a
`noindex` page's canonical at a different URL sends contradictory instructions, and Google's
documented behaviour when instructions conflict is to pick one — usually not the one intended.

---

## 29.4 Titles and meta descriptions

### Generation is a pure function

`generateMeta(entity, locale, context)` is a single pure TypeScript module imported by the SSR
renderer, the admin live preview and the test suite. There is exactly one implementation. A title
that differs between what the admin previews and what the crawler receives is a defect class that
only gets discovered in Search Console, months later.

### The fallback chain

Applied in order; the first non-empty result wins.

```
1. ProductTranslation.metaTitle / metaDescription   (manual override, this locale)
2. Template for the page type, this locale          (deterministic, from content fields)
3. Template for the page type, uk locale            (only if the entity has no translation at all —
                                                     and such a page is noindex anyway, §29.3)
4. Global site default                              (homepage title / site description)
```

Step 4 is a safety net that should never fire in production. A CI check asserts that every
published entity resolves at step 1 or 2; resolution at step 3 or 4 fails the build.

### The place-word rule — which title says «Карпати» and which says «Яворів»

[00-client-decisions-3.md](00-client-decisions-3.md) F6 confirms the tagline as «Понад 30 років
виробляємо натуральні вовняні вироби **в Карпатах**» and withdraws the proposal to substitute «у
Яворові». That ruling is about headline copy, and it is right: a tagline is not the place to teach
a proper noun the reader has never seen. But a meta title is not a tagline, and the two do
different jobs, so the templates below split rather than revert.

The rule, applied per page type:

| Query the page is trying to win | Place word | Why |
|---|---|---|
| **General / discovery** — homepage, top-level categories, anything a visitor reaches without knowing the brand or the village | **«Карпати»** | The searcher's own vocabulary. Nobody types a word they do not know, and a title containing an unrecognised village name in position two loses the click to one that reads as comprehensible |
| **Specific intent** — subcategories, indexable facets, own-manufacture product pages, the contact page, local queries | **«Яворів»** | The searcher has already committed to a product type. Specificity now differentiates rather than confuses, and «яворівський ліжник» is a term almost nobody else can honestly use |
| **Local-transactional** — «де купити ліжник», map-adjacent queries | **«Яворів»**, plus the retail framing F2 now permits (§29.16) | The intent is geographic. A general place word answers nothing |
| **Editorial** — blog posts about the craft, the village, the museum | **«Яворів»** where the article is about it | Яворів is a strong subject in its own right, and these are the pages that teach the word the homepage cannot |

The governing pattern, stated once: **«Карпати» to be understood, «Яворів» to be believed.** The
general surfaces earn the click; the specific surfaces earn the trust. A title set that uses only
one of the two words is worse than one that uses both in the right places, and the cost of getting
this wrong is asymmetric — a title nobody understands loses the impression outright, whereas a
title that is merely less specific still gets read.

### Templates

Lengths are stated in characters, but the admin enforces a **rendered pixel width** (≤580 px for
titles, ≤960 px for descriptions, measured in Arial 20 px / 14 px as Google approximates them).
Character counts mislead across scripts: Cyrillic averages wider than Latin, and German compounds
are wider still. The admin shows a live SERP preview per locale with a width meter, not a
character counter.

| Page type | Title template | Target | Description template | Target |
|---|---|---|---|---|
| Homepage | `{{BRAND_NAME}} — вовняні вироби з Карпат \| власне виробництво` | 50–60 | `Понад 30 років виробляємо ліжники, ковдри, гуні та вовняну пряжу в Карпатах — у селі Яворів на Косівщині. Власне виробництво і магазин. Доставка Україною та в ЄС.` | 140–160 |
| Category | `{Category.name} з Карпат — купити від виробника \| {{BRAND_NAME}}` | ≤60 | `{Category.name} власного виробництва з карпатської вовни. Виготовляємо у Яворові на Косівщині. {productCount} моделей, ціни від {priceFrom} грн. Доставка Новою поштою.` | ≤158 |
| Subcategory | `{Subcategory.name} — Яворів, Косівщина \| {{BRAND_NAME}}` | ≤60 | `{Subcategory.name} власного виробництва, Яворів на Косівщині. {productCount} моделей, ціни від {priceFrom} грн.` | ≤158 |
| Category + indexable facet | `{Category.name}, {FacetValue} — від виробника з Яворова` | ≤60 | `{Category.name} {FacetValue} від виробника з Яворова. {productCount} варіантів у наявності.` | ≤158 |
| Category page *n* | `{Category.name} — сторінка {n} \| {{BRAND_NAME}}` | ≤60 | Page-1 description **+** ` Сторінка {n}.` | ≤158 |
| Product, own manufacture | `{Product.name} — {Category.name} власного виробництва \| {{BRAND_NAME}}` | ≤60 | `{first sentence of description, trimmed at a sentence boundary} {composition}, {weight} г. Ціна від {priceMin} грн. Власне виробництво, Яворів на Косівщині.` | ≤158 |
| Product, partner | `{Product.name} — {Category.name} \| {{BRAND_NAME}}` | ≤60 | `{first sentence} {composition}. Відібрано Вівчариком, виготовлено карпатським майстром{, partnerRegion where known}. Ціна від {priceMin} грн.` | ≤158 |
| Blog post | `{Post.title} \| {{BRAND_NAME}}` | ≤60 | `PostTranslation.excerpt`, trimmed at a sentence boundary | ≤158 |
| Production | `Як ми виробляємо вовняні вироби — повний цикл \| {{BRAND_NAME}}` | ≤60 | Fixed editorial copy | ≤158 |
| Wholesale | `Опт та дропшипінг вовняних виробів \| {{BRAND_NAME}}` | ≤60 | Fixed editorial copy | ≤158 |
| Contact | `Магазин і виробництво — Яворів, Косівщина \| {{BRAND_NAME}}` | ≤60 | NAP composed from the `Setting` table, **without hours** (§29.6). «Магазин і виробництво в одному місці. Графік гнучкий — телефонуйте перед візитом» | ≤158 |
| Search, cart, checkout | `noindex` — title set for the browser tab only, no description | — | — | — |

Template rules:

- **The brand suffix is dropped** when `{Product.name}` alone would push the title past the width
  limit. A truncated brand name is worse than an absent one.
- **No price in the title.** Prices change; titles are cached and indexed. A stale price in a SERP
  snippet is a complaint, and in the `de`/`pl` locales a consumer-law exposure.
- **No keyword stuffing in category titles.** The pattern the adjacent market uses — `Ліжник
  вовняний 150х200 Карпати ручна робота натуральна вовна` — is documented in
  [02-ux-research.md](02-ux-research.md) §2.5.1 as a category norm, and it is a norm this brand
  deliberately breaks. It reads as a marketplace listing, which is the exact positioning
  [01-brand-strategy.md](01-brand-strategy.md) §1.1 rejects.
- **The place word follows the table above, not a blanket substitution.** An earlier revision of
  this document instructed that «Яворів» replace «Карпати» wherever a place word was needed.
  [00-client-decisions-3.md](00-client-decisions-3.md) F6 narrows that: the rule holds on
  specific-intent surfaces and is withdrawn on general ones. The underlying facts have not changed
  — «карпатський ліжник» is a term thousands of resellers compete on, «яворівський ліжник» is a
  term almost nobody can honestly use, and in this category it behaves like an appellation
  ([00-client-decisions-2.md](00-client-decisions-2.md) E2). What changed is the recognition that
  an appellation only differentiates for a reader who already knows what they are buying. On a
  homepage title the same word is a comprehension tax paid at the moment of the click decision.
  Both effects are real; the table routes each to the page type where it applies.
- **Яворів still appears in the *description* of general pages even where the title says Карпати.**
  The description is read after the title has already won the attention, so the specificity lands
  as evidence rather than as an obstacle. This is the cheapest way to keep the village in the
  indexable text of every page without spending headline space on it.
- **No partner name appears in any template.** E7 forbids naming partner manufacturers, so the
  partner description template is built from region and curation language only. A template with a
  `{partnerName}` slot that resolves to an empty string produces a broken sentence in production.
- **Descriptions are written to earn a click, not to rank.** Google rewrites descriptions roughly
  two-thirds of the time; the template exists so that when it does not rewrite, the result is
  good. Every description contains one specific, checkable fact — a weight, a village name, a
  count — because specificity is what distinguishes this brand's snippet from four resellers'.
- **Uniqueness is asserted in CI.** A check fails the build if two published URLs in the same
  locale resolve to identical titles or identical descriptions.

### Social metadata

`og:title`, `og:description`, `og:image`, `og:type`, `og:url`, `og:site_name`, `twitter:card`
(`summary_large_image`) are generated from the same function. `og:image` is a Cloudinary
transformation at 1200×630 using `Media.focalX/focalY` for the crop, so the sheep, the hands or
the product stay in frame — an automated centre-crop on a full-bleed workshop photograph
routinely produces a picture of a wall. Every page type has a defined fallback OG image; none
ever falls through to nothing.

---

## 29.5 Heading structure

Rules, enforced by an ESLint rule plus an automated axe check in CI:

1. **Exactly one `<h1>` per page.** No zero, no two.
2. **The `<h1>` is the page's subject, not the brand.** PDP `<h1>` is `Product.name`. Category
   `<h1>` is `Category.name`. The logo is an `<img>`/`<svg>` inside a link, never a heading.
3. **No skipped levels.** `h2` never follows `h1` with an `h3` in between missing.
4. **Visual size is decoupled from semantic level** via the token system
   ([10-typography.md](10-typography.md) §10.8). A visually small section label can still be an
   `h2`; a large editorial pull quote is not a heading at all.
5. **Headings are text.** Never an image, never a background-image with hidden text
   ([10-typography.md](10-typography.md) §10.8).
6. **Accordions and tabs keep their headings in the DOM** at all times, with `aria-expanded` on
   the trigger. Content that only exists after a click is content that a crawler may not see and
   that a screen-reader user must hunt for. The PDP spec table's first three rows render
   unwrapped at every breakpoint ([02-ux-research.md](02-ux-research.md) §2.3, Persona 2).

Canonical outline, product page:

```
h1  Ліжник «Мозаїка»
h2  Характеристики            ← spec table, above the marketing description
h2  Походження та виробництво ← provenance block; own-manufacture only
h2  Опис
h2  Догляд
h2  Доставка та повернення
h2  Питання та відповіді      ← FAQPage source
h3    Чи колеться вовна?
h3    Як прати ліжник?
h2  Відгуки
h2  Схожі вироби
```

Canonical outline, category page:

```
h1  Ліжники
    (intro paragraph — 60–90 words, above the grid, written not generated)
h2  Ліжники — {productCount} моделей     ← visually hidden, labels the product list
h2  Що таке ліжник                        ← editorial block below the grid
h2  Як обрати розмір
h2  Часті питання
```

The below-grid editorial block on category pages is deliberate. On a cold-start domain it is the
only part of a listing page that can rank for anything other than an exact product name, and it
is the passage most likely to be extracted by an AI assistant
([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.5). It is written per category,
never templated, and never placed above the product grid where it delays the LCP and pushes the
products a buyer came for below the fold.

---

## 29.6 Structured data

### Approach: one `@graph` per document

Every page emits a single `<script type="application/ld+json">` containing one `@graph` array.
Nodes reference each other by `@id` rather than repeating themselves. This is more compact, it
makes the entity relationships explicit — which is the point, for
[30-ai-search-optimization.md](30-ai-search-optimization.md) §30.4 — and it prevents the common
failure where three separate script blocks declare three different, subtly inconsistent
organisations.

Stable `@id` values, used site-wide:

```
https://{{DOMAIN}}/#organization
https://{{DOMAIN}}/#localbusiness
https://{{DOMAIN}}/#website
https://{{DOMAIN}}/tovar/<slug>/#product
https://{{DOMAIN}}/tovar/<slug>/#webpage
https://{{DOMAIN}}/tovar/<slug>/#breadcrumb
https://{{DOMAIN}}/blog/<slug>/#article
```

### Inventory

| Type | Pages | Source | Notes |
|---|---|---|---|
| `Organization` | Every page | `Setting` table | `foundingDate` deliberately omitted — see below |
| `LocalBusiness` / `Store` | Every page; expanded on Contact | `Setting` table | Real NAP. **No `openingHours`** — see below |
| `WebSite` + `SearchAction` | Every page | Static | Honest status below |
| `WebPage` / `CollectionPage` / `ItemPage` | Every page | Route | Ties breadcrumb + primary entity together |
| `BreadcrumbList` | All except homepage | Category tree | |
| `Product` + `AggregateOffer` | PDP | `Product`, `ProductVariant`, `ProductTranslation` | `brand`/`manufacturer` vary by `ProductOrigin` |
| `AggregateRating` | PDP, **conditionally** | `Review` | Constraint below |
| `Review` | PDP | `Review` | Up to 5 `APPROVED` |
| `ItemList` | Category, listing | Product list | Positions are absolute across pagination |
| `FAQPage` | PDP, category, care, wholesale | Authored FAQ pairs | Honest status below |
| `Article` | Blog post | `Post`, `PostTranslation` | |
| `ImageObject` | Referenced from Product, Article, Gallery | `Media`, `MediaTranslation` | |
| `VideoObject` | Production page, homepage hero, PDP where present | `Media` (`kind=VIDEO`) | |
| `OfferCatalog` | Wholesale | Static | B2B capability statement |

### Organization + LocalBusiness + WebSite — the site-wide graph

Rendered on every page. The `foundingDate` omission is a direct instruction from
[00-client-decisions.md](00-client-decisions.md) D1: the 30-year claim attaches to the
*manufacturing*, not to a legal entity, the current ФОПs are newer, and no documentary evidence
exists. Asserting `"foundingDate": "1992"` as a machine-readable fact about a legal entity that
did not exist then is precisely the unsupportable version of a supportable claim. The claim lives
in `description`, where it is editorial prose, and in on-page copy where it is attributable to the
business's own voice.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://{{DOMAIN}}/#organization",
      "name": "{{BRAND_NAME}}",
      "alternateName": "Вівчарик",
      "url": "https://{{DOMAIN}}/",
      "description": "Родинне карпатське виробництво: понад 30 років переробляємо вовну та виготовляємо ліжники, ковдри, гуні, пряжу та ровницю у селі Яворів Косівського району — селі, яке називають столицею ліжникарства. Повний цикл — миття, чесання, прядіння, ткання, пошиття.",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://{{DOMAIN}}/#logo",
        "url": "https://res.cloudinary.com/{{CLOUD_NAME}}/image/upload/f_auto,q_auto/v1/{{BRAND_SLUG}}/brand/logo-1200.png",
        "width": 1200,
        "height": 1200,
        "caption": "{{BRAND_NAME}}"
      },
      "image": { "@id": "https://{{DOMAIN}}/#logo" },
      "email": "{{BRANDED_EMAIL}}",
      "telephone": "+380679973450",
      "address": { "@id": "https://{{DOMAIN}}/#address" },
      "areaServed": [
        { "@type": "Country", "name": "Ukraine" },
        { "@type": "Place", "name": "European Union" }
      ],
      "knowsAbout": [
        "вовна",
        "ліжник",
        "ліжникарство",
        "гуня",
        "ровниця",
        "вовняна пряжа",
        "гуцульське ткацтво",
        "вичинка овчини",
        "Яворів",
        "Косівщина",
        "Гуцульщина"
      ],
      "sameAs": [
        "{{GBP_MAPS_URL}}"
      ]
    },
    {
      "@type": ["Store", "LocalBusiness"],
      "@id": "https://{{DOMAIN}}/#localbusiness",
      "name": "{{BRAND_NAME}} — магазин і виробництво вовняних виробів",
      "description": "Фірмовий магазин при виробництві: ліжники, ковдри, гуні, пряжа та ровниця власного виготовлення. Можна подивитися, помацати і купити на місці.",
      "parentOrganization": { "@id": "https://{{DOMAIN}}/#organization" },
      "url": "https://{{DOMAIN}}/kontakty/",
      "image": { "@id": "https://{{DOMAIN}}/#logo" },
      "telephone": "+380679973450",
      "email": "{{BRANDED_EMAIL}}",
      "priceRange": "₴₴₴",
      "currenciesAccepted": "UAH",
      "paymentAccepted": "Card, Cash, Bank transfer, Cash on delivery",
      "address": {
        "@type": "PostalAddress",
        "@id": "https://{{DOMAIN}}/#address",
        "streetAddress": "вул. Петруші",
        "addressLocality": "с. Яворів",
        "addressRegion": "Івано-Франківська область",
        "postalCode": "78644",
        "addressCountry": "UA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "{{LAT}}",
        "longitude": "{{LNG}}"
      },
      "hasMap": "{{GBP_MAPS_URL}}"
    },
    {
      "@type": "WebSite",
      "@id": "https://{{DOMAIN}}/#website",
      "url": "https://{{DOMAIN}}/",
      "name": "{{BRAND_NAME}}",
      "publisher": { "@id": "https://{{DOMAIN}}/#organization" },
      "inLanguage": ["uk", "en", "pl", "de"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://{{DOMAIN}}/poshuk/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

**Honest status of `SearchAction`.** Google retired the sitelinks search box rich result in
November 2024, so this markup will not produce a search box in Google's SERP. It is retained
because it is correct, costs nothing, is still consumed by other agents and by Bing, and because
it declares a machine-readable route into the catalogue that retrieval systems can follow. It is
*not* retained on a promise of a Google rich result, and nobody should measure it that way.

### Why the node is typed `["Store", "LocalBusiness"]` — and why that is now a decision rather than a habit

[00-client-decisions-3.md](00-client-decisions-3.md) F2 establishes that the Яворів site houses
**both retail and production**: «там знаходиться і магазин і виробництво». Until round 3 the dual
type in the snippet above was defensible but unargued. It is now load-bearing, so the reasoning is
recorded.

Schema.org offers three candidate framings and only one of them is both true and useful:

| Option | Assessment |
|---|---|
| `LocalBusiness` alone | Correct but uninformative. It says "a business with an address" and nothing about what a visitor would find there. Retrieval systems and Google's local surfaces both treat the generic type as the weakest signal available, because it is the default anyone emits when they have not thought about it |
| A manufacturing-only framing (no `Store`) | Discards the fact that a customer can walk in and buy. `Organization` already carries the manufacturing claim through `description`, `knowsAbout` and the per-product `manufacturer` links; typing the *place* as a factory duplicates that and loses the retail fact entirely |
| **`["Store", "LocalBusiness"]`** — adopted | `Store` is a direct subtype of `LocalBusiness`, so the array is not a contradiction: it is a specific claim with its supertype stated for consumers that do not resolve the hierarchy. It asserts exactly what F2 confirms — this address is a place where goods are sold to the public. The manufacturing claim is not weakened, because it lives on `Organization` and on `Product.manufacturer`, which is where a manufacturing claim belongs: on the legal entity and on the goods, not on the retail premises |

The division of labour is the point, and it mirrors the GBP category problem in §29.16. **The
place is a shop; the organisation is a manufacturer; the products carry the manufacturing
attribution individually.** Collapsing all three onto one node forces a false choice between two
true things.

A narrower `Store` subtype was considered and rejected. `HomeGoodsStore` fits ліжники and ковдри
and fits пряжа and ровниця badly; `ClothingStore` fits гуні and fits nothing else. Schema.org has
no craft-workshop or wool-shop subtype, and choosing a subtype that covers half the catalogue is a
narrower claim that is *also* less accurate — the worst combination. `Store` covers all of it and
asserts nothing false. Specificity is only worth having when it is correct.

**Retail properties this unlocks**, all now legitimate and all previously unavailable:

```jsonc
"hasOfferCatalog":   { "@id": "https://{{DOMAIN}}/#catalog" },
"publicAccess":      true,
"isAccessibleForFree": true,   // entry to the shop, not the goods
"smokingAllowed":    false
```

`openingHours` remains omitted regardless — see immediately below. A shop with unpublished hours
is a shop; a shop with wrong published hours is a closed door, and F2 does not change that
calculus. It sharpens it: now that the address is worth visiting, a wrong timetable costs a real
sale rather than a hypothetical one.

### Why `openingHours` is absent, and why that is the correct choice

[00-client-decisions-2.md](00-client-decisions-2.md) E3 establishes that the workshop's hours are
genuinely variable — one day 11:00–19:00, another different — and that Google Maps is the live
source the owners actually maintain. **Binding rule: the `LocalBusiness` node carries `telephone`,
`address`, `geo` and `url` only. `openingHoursSpecification` and
`specialOpeningHoursSpecification` are both omitted.**

The reasoning is worth spelling out, because omitting a property that a schema validator will
happily accept looks like an oversight rather than a decision.

1. **Published hours are an assertion, and a wrong assertion is punished harder than a missing
   one.** Schema.org hours propagate into Google's local surfaces. A visitor who drives to a
   village in the Carpathians on the strength of a published 09:00–19:00 and finds a closed door
   does not conclude that the hours were approximate. They report the business as permanently
   closed, or they leave a one-star review. Both are expensive, and both are self-inflicted.
2. **The failure is not rare, it is structural.** Hours that are wrong twice a week are wrong
   roughly 100 times a year. That is not an edge case that monitoring catches; it is the normal
   operating state of the data.
3. **The absence of hours costs very little.** Hours in structured data do not produce a rich
   result on their own. Google's local panel takes hours from the Google Business Profile, which
   is where the client already maintains them and where they can be changed from a phone in
   thirty seconds. Duplicating that in a JSON-LD node deployed with the site adds a second source
   of truth that only ever drifts in one direction — stale.
4. **The honest alternative is better UX.** The contact page states «Графік гнучкий —
   телефонуйте перед візитом» with both numbers prominent and a link to the Google Business
   Profile as the authoritative source (§29.16). A visitor who phones first converts; a visitor
   who trusts a stale timetable does not.

`specialOpeningHoursSpecification` is removed for the same reason plus one of its own: it holds
hard-coded dates, so it is stale by construction the moment nobody remembers to add next year's.

**If hours later stabilise**, they are added in exactly one place — a `Setting` row that feeds the
JSON-LD, the contact page and nothing else — and only once the client confirms they will be kept
current. Until then, no hours anywhere in machine-readable form.

### `sameAs`, `telephone` and `email` — what may and may not be asserted

`sameAs` carries **the Google Business Profile URL and nothing else**.
[00-client-decisions-2.md](00-client-decisions-2.md) E3 is explicit: the owners run no social
media accounts. There is no Instagram, no Facebook, no YouTube channel, and therefore nothing to
assert.

This is not merely an empty field. The handle `@fabryka_shkur` observed in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.5 belongs to the **adjacent business**,
and it would be a natural mistake for someone completing the markup to reach for it. Doing so
would be an identity claim that two separate businesses are one business, asserted in the exact
format knowledge graphs consume. It merges the entities, it transfers the adjacent business's
signals onto this domain and vice versa, and it is very hard to unpick afterwards. **`sameAs` is
an identity claim, not a link list.** An empty-but-correct `sameAs` is strictly better than a
populated-but-wrong one.

`telephone` is `+380679973450` (Іван Гондурак); `+380679604769` (Любов Гондурак) is the secondary
number and appears on the contact page and in the footer but not in the structured data, because
`telephone` takes one value and splitting it invites NAP inconsistency (§29.16).

`{{BRANDED_EMAIL}}` remains unresolved and blocks on the domain
([00-client-decisions-2.md](00-client-decisions-2.md) E9). `shkura.ovecha@gmail.com` is the
adjacent business's address and must never appear here under any circumstances. A `@{{DOMAIN}}`
mailbox is a cheap, immediate trust upgrade and a prerequisite for the Google Business Profile
verification flow.

[00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com` as the
client's working address. **It is usable as a public contact address and it is not usable in this
node.** Two reasons, and only the first is an SEO argument:

1. **The `email` property on `Organization` is an identity assertion**, consumed by knowledge
   graphs and by assistants building a card about the business. A numeric consumer Gmail asserted
   as the identity of a manufacturer with a shop and a production floor reads as an individual
   trading informally. On a site whose average order is 5,000–15,000 UAH and whose central
   conversion obstacle is "is this a real factory or a reseller"
   ([02-ux-research.md](02-ux-research.md) §2.3), that is a self-inflicted wound in the one field
   that costs nothing to get right.
2. **Transactional mail cannot be sent from it at all** — SPF and DKIM cannot be published for
   `gmail.com` by a third-party system, and Gmail's consumer DMARC policy rejects such mail. That
   is a deliverability blocker rather than a ranking one and it is specified in
   [32-security-architecture.md](32-security-architecture.md) §32.16.

Until `{{DOMAIN}}` resolves, the `email` property is **omitted from this node** rather than
populated with the Gmail address. The Gmail address is never displayed — it is the Owner's login
([00-client-decisions-8.md](00-client-decisions-8.md) §L1); the structured data waits for `info@vivcharyk.shop`. Omitting a property states "not asserted"; asserting the
wrong one is harder to retract, because it has already been consumed.

**Recommendation on record** ([00-client-decisions-2.md](00-client-decisions-2.md) E3): create an
Instagram account before launch. For a craft manufacturer it is where product photography does
its work, it is the cheapest proof-of-life signal a new domain can have, and it is the only
low-cost way to restore the launch channel §29.15 lost. If and when it exists, it is added to
`sameAs` — and not before.

### Product — the origin distinction

This is the section where [00-client-decisions.md](00-client-decisions.md) D3 has teeth,
where [00-client-decisions-2.md](00-client-decisions-2.md) E7 changed the answer — **the partner
manufacturers cannot be named**, a flat «Ні» — and where
[00-client-decisions-3.md](00-client-decisions-3.md) F3 closes the last open variable: **partner
goods are sold under the Вівчарик brand.** Every field that previously resolved to `partnerName`
resolves to omission, and the `brand` field, which was conditional pending E13.5, is now
unconditional.

The rule is exact and the serialiser implements it with no branch on anything but `Product.origin`:

```
OWN_MANUFACTURE      →  brand = Вівчарик,  manufacturer = Вівчарик
PARTNER_MANUFACTURE  →  brand = Вівчарик,  manufacturer = OMITTED  (never Вівчарик, never a placeholder)
```

| Field | `OWN_MANUFACTURE` | `PARTNER_MANUFACTURE` |
|---|---|---|
| `brand` | `{ "@type": "Brand", "name": "{{BRAND_NAME}}" }` | `{ "@type": "Brand", "name": "{{BRAND_NAME}}" }` — **identical**, resolved by [00-client-decisions-3.md](00-client-decisions-3.md) F3 |
| `manufacturer` | `{ "@id": ".../#organization" }` | **Omitted entirely.** Never `{{BRAND_NAME}}`, never a placeholder entity |
| `seller` (on the offer) | `{ "@id": ".../#organization" }` | `{ "@id": ".../#organization" }` — the seller is the same either way |
| `countryOfOrigin` | `UA` | `UA` where `Product.partnerRegion` is Ukrainian (Косівщина, Гуцульщина), otherwise omitted |
| `additionalProperty` "Виробництво" | «Власне виробництво» | «Відібрано Вівчариком. Виготовлено карпатським майстром» where the region is known; «Виготовлено іншим виробником» where it is not |
| Provenance properties (`material` detail, production stages in `description`) | Full | Specification only, no in-house production claims, no `productionStage`, no `woolOrigin` |

The `seller` staying constant while `manufacturer` disappears is the accurate model: the business
sells both, manufactures one. Setting `manufacturer` to `{{BRAND_NAME}}` on a partner product
would be a false claim in machine-readable form, which is both a Google structured-data policy
violation and the precise failure D3 exists to prevent.

**Why `brand` and `manufacturer` diverge, and why that is not a contradiction.** They are different
properties describing different relationships, and schema.org draws the line in exactly the place
the business does. `brand` is the mark under which an item is offered; `manufacturer` is the
organisation that produced it. On a partner ліжник both statements are true at once — it is sold as
a Вівчарик product, and Вівчарик did not weave it. Asserting the first and omitting the second is
not a half-truth; it is the complete truth expressed in the vocabulary available. Retailers have
sold own-brand goods made by third parties for as long as retail has existed, and the schema has a
property for each half of that arrangement precisely because the arrangement is ordinary.

This is also the reason the `manufacturer` omission cannot be treated as a cosmetic detail by
anyone touching the serialiser. It is the single field that distinguishes a manufacturing claim
from a branding claim, and flipping `Product.origin` in the admin silently rewrites it
([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6). The admin surfaces that
consequence at the point of the decision rather than leaving it to a structured-data audit months
later.

**Why omission rather than a placeholder.** Schema.org treats an absent property as "not stated",
which is exactly the true position: the manufacturer is a real entity that this site is not
permitted to name. A placeholder such as `"name": "Партнер"` would be a fabricated entity, and a
fabricated entity in a knowledge graph is worse than a gap in one — it can be matched, merged and
propagated. Omitting a property is always available and always honest. Inventing one is not.

Losing the partner's name weakens the curation story D3.2 relied on, but it does **not** weaken
the disclosure requirement. [01-brand-strategy.md](01-brand-strategy.md) §1.7b holds absolutely:
not being able to name the partner is a reason to be *more* explicit that the item is not
own-made, not less. `Product.partnerRegion` still carries «Косівщина» or «Гуцульщина» where known,
and regional provenance without a company name is still meaningful and still honest.

```json
{
  "@type": "Product",
  "@id": "https://{{DOMAIN}}/tovar/lizhnyk-mozaika/#product",
  "name": "Ліжник «Мозаїка»",
  "sku": "VCH-LIZH-MOZ",
  "description": "Вовняний ліжник ручного ткання з карпатської вівці. Валяний у ступі, ворс піднято вручну. Виготовлено у Яворові Косівського району.",
  "url": "https://{{DOMAIN}}/tovar/lizhnyk-mozaika/",
  "inLanguage": "uk",
  "image": [
    "https://res.cloudinary.com/{{CLOUD_NAME}}/image/upload/f_auto,q_auto:good,w_1600,c_limit/v1/{{BRAND_SLUG}}/products/vch-lizh-moz/lizhnyk-mozaika-primary.jpg",
    "https://res.cloudinary.com/{{CLOUD_NAME}}/image/upload/f_auto,q_auto:good,w_1600,c_limit/v1/{{BRAND_SLUG}}/products/vch-lizh-moz/lizhnyk-mozaika-detail-vors.jpg",
    "https://res.cloudinary.com/{{CLOUD_NAME}}/image/upload/f_auto,q_auto:good,w_1600,c_limit/v1/{{BRAND_SLUG}}/products/vch-lizh-moz/lizhnyk-mozaika-production-verkhat.jpg"
  ],
  "brand": { "@type": "Brand", "name": "{{BRAND_NAME}}" },
  "manufacturer": { "@id": "https://{{DOMAIN}}/#organization" },
  "countryOfOrigin": { "@type": "Country", "name": "UA" },
  "material": "100% вовна",
  "weight": { "@type": "QuantitativeValue", "value": 1900, "unitCode": "GRM" },
  "size": "150×200 см",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Склад", "value": "100% вівча вовна" },
    { "@type": "PropertyValue", "name": "Тонина волокна", "value": 28, "unitText": "мкм" },
    { "@type": "PropertyValue", "name": "Походження вовни", "value": "Косівщина, Івано-Франківська обл." },
    { "@type": "PropertyValue", "name": "Місце виготовлення", "value": "с. Яворів, Косівський район" },
    { "@type": "PropertyValue", "name": "Виробництво", "value": "Власне виробництво" },
    { "@type": "PropertyValue", "name": "Догляд", "value": "Ручне прання при 30 °C, сушіння горизонтально" }
  ],
  "offers": {
    "@type": "AggregateOffer",
    "offerCount": 6,
    "lowPrice": "5300.00",
    "highPrice": "7300.00",
    "priceCurrency": "UAH",
    "availability": "https://schema.org/InStock",
    "seller": { "@id": "https://{{DOMAIN}}/#organization" },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "UA",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/ReturnShippingFees",
      "returnShippingFeesAmount": {
        "@type": "MonetaryAmount",
        "currency": "UAH",
        "value": "0.00",
        "description": "Повернення оплачує покупець, окрім підтвердженого браку"
      }
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "80.00",
        "currency": "UAH"
      },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "UA" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" }
      }
    }
  },
  "isSimilarTo": [
    { "@id": "https://{{DOMAIN}}/tovar/lizhnyk-harmoniia/#product" }
  ]
}
```

The same product with `origin = PARTNER_MANUFACTURE` differs by **subtraction**, not substitution:

```json
  "brand": { "@type": "Brand", "name": "{{BRAND_NAME}}" },
  "countryOfOrigin": { "@type": "Country", "name": "UA" },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Склад", "value": "100% вівча вовна" },
    { "@type": "PropertyValue", "name": "Регіон виготовлення", "value": "Косівщина" },
    { "@type": "PropertyValue", "name": "Виробництво", "value": "Відібрано Вівчариком. Виготовлено карпатським майстром" }
  ],
```

`manufacturer` is **not present**. Neither is `Місце виготовлення`, nor any `productionStage`,
`woolOrigin` or in-house claim. `brand` **is** present and identical to the own-manufacture case —
[00-client-decisions-3.md](00-client-decisions-3.md) F3 resolved E13.5 in favour of the Вівчарик
mark, so the conditional that previously hedged this field is removed.

Serialiser requirements that follow, and each of them exists because a type system will otherwise
ship a false claim:

1. **`manufacturer` is optional in the emitter's type, not required-with-a-default.** A
   `manufacturer: Organization` field with a fallback to the site organisation is how this failure
   gets introduced by someone fixing a null-check.
2. **The origin branch is the only branch.** `manufacturer` is emitted if and only if
   `Product.origin === OWN_MANUFACTURE`. No other field, flag or editorial override may reinstate
   it. There is no legitimate case for a partner product carrying a manufacturer, so there is no
   escape hatch to be misused.
3. **A CI assertion covers it directly**: for every published product with
   `origin = PARTNER_MANUFACTURE`, the emitted `@graph` contains no `manufacturer` key on the
   `Product` node. This is a three-line test and it guards the one claim in the document that is
   both invisible on the page and legally material.
4. **`brand` is now required on both origins**, so its absence is the defect rather than its
   presence. The previous revision's advice to treat `brand` as optional no longer applies and CI
   asserts the opposite.

**`AggregateOffer` over a list of `Offer` nodes** is deliberate. A ліжник with six size/colour
variants would otherwise emit six offers, and Google would surface an arbitrary one. `lowPrice`
and `highPrice` come from the denormalised `Product.priceMinMinor` / `priceMaxMinor` fields
([25-database-schema.md](25-database-schema.md) §25.3), divided by 100 and formatted with two
decimals — never from a live aggregation, so structured data and the rendered price can never
disagree. Yarn, ровниця and вовна для рукоділля use `PricingUnit.KILOGRAM`/`SKEIN`; their offers
carry `priceSpecification.referenceQuantity` so the price is not read as a per-piece price.

`availability` maps from stock state:

| State | `availability` |
|---|---|
| Any variant `stockQty > 0` | `InStock` |
| All variants zero, `madeToOrderDays` set | `PreOrder` (plus `deliveryLeadTime`) |
| All variants zero, `allowBackorder` | `BackOrder` |
| All zero, none of the above | `OutOfStock` |
| `Product.isUniquePiece` and sold | `SoldOut` |

### AggregateRating — the constraint

[25-database-schema.md](25-database-schema.md) §25.6 is explicit: **only `APPROVED` reviews with
`isVerifiedPurchase = true` contribute to the aggregate rating exposed in structured data.**

Consequences that must be understood before launch rather than discovered in Search Console:

1. **At launch, almost no product will have an `aggregateRating`.** A new domain with a new
   catalogue has no verified purchases. The node is **omitted entirely** — not emitted with
   `ratingCount: 0`, which is a structured-data error.
2. **There is no review library to import, and the reuse permission in
   [00-client-decisions-2.md](00-client-decisions-2.md) E5 does not extend to reviews.** The
   client permits products and photographs to be copied from the adjacent site; reviews are
   explicitly excluded, and they would be excluded here even if they were not. Those testimonials
   were given to a different seller about a different workshop. Re-publishing them as this
   business's reviews is a misrepresentation to the customer, a `Review` structured-data policy
   violation, and — because none of them can be tied to an `Order` on this system — permanently
   ineligible for `isVerifiedPurchase` anyway. See §29.18.
3. Unverified reviews still render on the page and still emit individual `Review` nodes. They are
   real content and real social proof. They simply do not roll into the number Google is willing
   to show as a star rating.
4. A minimum of **3 verified reviews** is additionally required before the node is emitted. A
   5.0 from a single review is technically valid and reads as manufactured.

```json
{
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": 17,
  "bestRating": "5",
  "worstRating": "1"
}
```

Emitted only when `count(Review WHERE status=APPROVED AND isVerifiedPurchase=true) >= 3`. This is
a query-level guard in the serializer, not an editorial convention — because an editorial
convention will eventually be broken by someone in a hurry, and self-serving review markup is one
of the small number of things Google issues manual actions for.

### BreadcrumbList

```json
{
  "@type": "BreadcrumbList",
  "@id": "https://{{DOMAIN}}/tovar/lizhnyk-mozaika/#breadcrumb",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Головна",  "item": "https://{{DOMAIN}}/" },
    { "@type": "ListItem", "position": 2, "name": "Каталог",  "item": "https://{{DOMAIN}}/katalog/" },
    { "@type": "ListItem", "position": 3, "name": "Вовна",    "item": "https://{{DOMAIN}}/katalog/vovna/" },
    { "@type": "ListItem", "position": 4, "name": "Ліжники",  "item": "https://{{DOMAIN}}/katalog/vovna/lizhnyky/" },
    { "@type": "ListItem", "position": 5, "name": "Ліжник «Мозаїка»" }
  ]
}
```

The final item has no `item` property — it is the current page. Because products are flat
(§29.2), the category path in the breadcrumb comes from the product's **primary** category
(lowest `ProductCategory.sortOrder`), and the visible breadcrumb matches the JSON-LD exactly. A
breadcrumb that renders one path and declares another is a mismatch Google flags.

### ItemList on category pages

```json
{
  "@type": "ItemList",
  "@id": "https://{{DOMAIN}}/katalog/vovna/lizhnyky/#itemlist",
  "name": "Ліжники",
  "numberOfItems": 24,
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 25,
      "url": "https://{{DOMAIN}}/tovar/lizhnyk-mozaika/"
    },
    {
      "@type": "ListItem",
      "position": 26,
      "url": "https://{{DOMAIN}}/tovar/lizhnyk-harmoniia/"
    }
  ]
}
```

`position` is **absolute across pagination**, not relative to the page: page 2 of a 24-per-page
listing starts at 25. `numberOfItems` is the count on *this page*. The URL-only form is used
rather than embedding full `Product` nodes — embedding duplicates the product data, inflates the
document, and risks the listing's summary contradicting the PDP's detail.

### FAQPage

```json
{
  "@type": "FAQPage",
  "@id": "https://{{DOMAIN}}/katalog/vovna/lizhnyky/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Чим ліжник відрізняється від звичайного вовняного пледа?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ліжник — це гуцульське вовняне покривало, зіткане на верстаті й потім заваляне у воді, після чого ворс піднімають вручну. Валяння ущільнює полотно й робить його теплішим за плед тієї самої ваги. Плед зазвичай не валяють."
      }
    },
    {
      "@type": "Question",
      "name": "Чи колеться вовняний ліжник?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Відчуття колючості залежить від тонини волокна. Наші ліжники виготовлені з вовни 27–30 мкм. Це покривальна, не білизняна тонина: ліжник комфортний поверх ковдри або одягу, але для контакту зі шкірою краще обрати виріб із вовни тоншої за 24 мкм."
      }
    }
  ]
}
```

**Honest status of `FAQPage`.** In August 2023 Google restricted FAQ rich results to
well-known authoritative government and health sites. A commercial site will almost certainly
**not** get FAQ accordions in Google's SERP. The markup is retained anyway, for three reasons
that do not depend on a Google rich result: Bing still uses it; the Q&A pair is the single most
extractable content structure for AI assistants
([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.6); and the on-page FAQ answers
purchase anxieties A1–A6 from [02-ux-research.md](02-ux-research.md) §2.4 regardless of any
search engine. Nobody should budget a click-through uplift against it.

### Article

```json
{
  "@type": "Article",
  "@id": "https://{{DOMAIN}}/blog/shcho-take-lizhnyk/#article",
  "isPartOf": { "@id": "https://{{DOMAIN}}/blog/shcho-take-lizhnyk/#webpage" },
  "headline": "Що таке ліжник і чому його валяють у воді",
  "description": "PostTranslation.excerpt",
  "inLanguage": "uk",
  "datePublished": "2026-11-04T09:00:00+02:00",
  "dateModified": "2026-11-20T14:12:00+02:00",
  "author": {
    "@type": "Person",
    "name": "{{AUTHOR_NAME}}",
    "jobTitle": "{{AUTHOR_ROLE}}",
    "worksFor": { "@id": "https://{{DOMAIN}}/#organization" },
    "url": "https://{{DOMAIN}}/pro-nas/#{{AUTHOR_SLUG}}"
  },
  "publisher": { "@id": "https://{{DOMAIN}}/#organization" },
  "image": { "@id": "https://{{DOMAIN}}/blog/shcho-take-lizhnyk/#cover" },
  "articleSection": "Ремесло",
  "wordCount": 1180,
  "timeRequired": "PT6M",
  "about": [
    { "@type": "Thing", "name": "Ліжник" },
    { "@type": "Thing", "name": "Ліжникарство" },
    { "@type": "Place", "name": "Яворів, Косівський район" },
    { "@type": "Place", "name": "Гуцульщина" }
  ]
}
```

`author` is a named `Person` with a real role and a link to a profile anchor on the About page.
A brand-as-author byline is permitted by schema.org and wasted here: the entire brand thesis
([01-brand-strategy.md](01-brand-strategy.md) §1.4, "Warm") is that named people do the work.
An article about wool written by the person who spins it is the strongest experience signal the
site has, and it costs nothing but an author record.

### ImageObject and VideoObject

```json
{
  "@type": "ImageObject",
  "@id": "https://{{DOMAIN}}/tovar/lizhnyk-mozaika/#image-primary",
  "contentUrl": "https://res.cloudinary.com/{{CLOUD_NAME}}/image/upload/f_auto,q_auto:good,w_1600,c_limit/v1/{{BRAND_SLUG}}/products/vch-lizh-moz/lizhnyk-mozaika-primary.jpg",
  "width": 1600,
  "height": 2000,
  "caption": "MediaTranslation.caption",
  "description": "MediaTranslation.alt",
  "representativeOfPage": true,
  "creditText": "{{BRAND_NAME}}",
  "creator": { "@id": "https://{{DOMAIN}}/#organization" },
  "copyrightNotice": "© {{BRAND_NAME}}",
  "license": "https://{{DOMAIN}}/litsenziia-zobrazhen/",
  "acquireLicensePage": "https://{{DOMAIN}}/kontakty/"
}
```

`creditText`, `creator`, `copyrightNotice` and `license` populate Google Images' licensable-image
badge. For a manufacturer whose photographs are its single most copyable asset — and whose
category is dominated by resellers reusing supplier imagery
([02-ux-research.md](02-ux-research.md) §2.5) — an explicit licence declaration is both an SEO
feature and a rights-assertion.

```json
{
  "@type": "VideoObject",
  "@id": "https://{{DOMAIN}}/vyrobnytstvo/#video-tkannia",
  "name": "Ткання ліжника на верстаті — Яворів, Косівський район",
  "description": "Повний прохід ткацького циклу: основа, піткання, зняття полотна з верстата. Знято на власному виробництві у Яворові.",
  "thumbnailUrl": ["https://res.cloudinary.com/{{CLOUD_NAME}}/video/upload/so_3,f_jpg,w_1280/v1/{{BRAND_SLUG}}/production/tkannia.jpg"],
  "uploadDate": "2026-11-04T09:00:00+02:00",
  "duration": "PT2M14S",
  "contentUrl": "https://res.cloudinary.com/{{CLOUD_NAME}}/video/upload/f_auto,q_auto/v1/{{BRAND_SLUG}}/production/tkannia.mp4",
  "embedUrl": "https://{{DOMAIN}}/vyrobnytstvo/#video-tkannia",
  "inLanguage": "uk",
  "isFamilyFriendly": true,
  "publisher": { "@id": "https://{{DOMAIN}}/#organization" },
  "hasPart": [
    { "@type": "Clip", "name": "Заправка основи", "startOffset": 0,  "url": "https://{{DOMAIN}}/vyrobnytstvo/#t=0" },
    { "@type": "Clip", "name": "Ткання",          "startOffset": 41, "url": "https://{{DOMAIN}}/vyrobnytstvo/#t=41" },
    { "@type": "Clip", "name": "Зняття полотна",  "startOffset": 98, "url": "https://{{DOMAIN}}/vyrobnytstvo/#t=98" }
  ]
}
```

`uploadDate`, `thumbnailUrl`, `name` and `description` are required for a video rich result;
`duration` and `hasPart` clips are what make it useful. `thumbnailUrl` must be a real,
publicly-fetchable, indexable image — a Cloudinary poster frame extracted at `so_3` (three
seconds in), not a data URI and not a CSS background.

### Validation

- **Every serializer is unit-tested** against a fixture, asserting exact JSON shape — not merely
  "contains a Product".
- **A CI step runs the emitted JSON-LD through schema validation** for one representative URL of
  every page type, in every locale. A structured-data regression fails the build.
- **Post-launch**, the Rich Results Test and Search Console's Enhancements reports are checked
  weekly for the first eight weeks (§29.15).
- **No `@type` is emitted for content that is not visible on the page.** Markup describing content
  a visitor cannot see is a policy violation, and it is the easiest one to commit accidentally
  when an FAQ lives behind a closed accordion.
- **A serializer test asserts the absence of the properties that must be absent**, not only the
  presence of the ones that must be present: no `openingHoursSpecification` on `LocalBusiness`, no
  `manufacturer` on a `PARTNER_MANUFACTURE` product, no non-GBP entry in `sameAs`, and no
  `AggregateRating` below the three-verified-review threshold. Absence assertions are the ones
  that rot silently, because nothing looks wrong when they fail.

### The heritage claim — verification required before any of it is published

> **Resolved by [00-client-decisions-8.md](00-client-decisions-8.md) §L6.** The client confirms the
> craft is on the national register. Approved pattern: «Гуцульське ліжникарство — ремесло, внесене до
> Національного переліку елементів нематеріальної культурної спадщини України.» The designation
> belongs to the craft, never to Вівчарик — that half of the constraint below still binds.

Hutsul lizhnyk weaving is widely described as inscribed on Ukraine's national register of
intangible cultural heritage, and Яворів is central to that description. This is a strong signal
and it is tempting to put in `knowsAbout`, in an `Article.about`, in a category intro and in a meta
description.

**Do not publish any of it until the exact status and the exact wording are confirmed**
([00-client-decisions-2.md](00-client-decisions-2.md) E2, E13.4). Two separate constraints apply:

1. **Confirm the register, the listing name and the year** from the responsible Ukrainian
   authority's own publication. A heritage claim repeated from tourism blogs is a claim with no
   source, and in the `de` and `pl` locales an unverifiable claim is a consumer-law exposure, not
   just an embarrassment.
2. **Never imply that Вівчарик holds a heritage designation.** A *craft* may be listed; a
   *company* is not. The permitted form is «ліжникарство — традиційне ремесло, внесене до
   [exact register name]» as a statement about the craft, in editorial prose, on a page that also
   names the source. The forbidden forms are anything that puts the designation next to the brand
   name, anything in `Organization.award`, `hasCredential` or `knowsAbout` that reads as a
   credential, and anything in a meta title. The distinction is not pedantry: asserting an
   unearned designation is exactly the kind of claim that converts a provenance advantage into a
   trust failure when a customer checks it.

---

## 29.7 Faceted navigation and indexation policy

`{{SKU_COUNT}}` now resolves to **whatever the catalogue migration yields — several hundred to
roughly a thousand SKUs** ([00-client-decisions-2.md](00-client-decisions-2.md) E5). The client's
answer was that the catalogue size simply follows from what is migrated, so the exact figure is
confirmed when the export is taken rather than decided in advance.

**No rework follows from that range.** The policy below is already written to hold across it,
because facet indexation is the one area where the wrong default produces tens of thousands of
crawlable URLs *regardless of how many products exist*. Four facets with five values each generate
625 combinations *per category*; sixteen categories makes 10,000 URLs — from a catalogue of 300
products or of 1,000, identically. The combinatorial explosion is a function of the facet
registry, not of the SKU count, which is why the whitelist below is short and the default is
closed. On a cold-start domain with minimal crawl budget, an open facet default is the fastest
available way to make sure nothing important gets crawled.

The one place the range does matter is pagination arithmetic: at 24 per page, a 1,000-SKU
catalogue produces roughly 42 pages in the largest browse node, which is well inside what internal
linking (§29.13) and the ≤3-click rule can distribute. Nothing in §29.8 changes.

### The structural rule

**Indexable facets live in the path. Everything else lives in a query string.** The URL shape
alone tells a crawler, a developer and a log-file analyst what the policy is — there is no lookup
table to consult and no chance of the two drifting apart.

```
/katalog/vovna/lizhnyky/                         base — indexable
/katalog/vovna/lizhnyky/rozmir-150x200/          one indexable facet — indexable
/katalog/vovna/lizhnyky/?color=siryi             non-indexable facet — noindex, follow
/katalog/vovna/lizhnyky/rozmir-150x200/?color=siryi   mixed — noindex, follow
/katalog/vovna/lizhnyky/?sort=price_asc          reorder — canonical to base
```

### The policy

| Combination | `robots` | Canonical | In sitemap | Reasoning |
|---|---|---|---|---|
| Category base | `index, follow` | Self | Yes | The primary landing page |
| Category page 2+ | `index, follow` | Self | No | Crawlable via links; sitemap lists page 1 only |
| One **whitelisted** facet, ≥8 products | `index, follow` | Self | Yes | Matches a real query ("ліжник 150х200") |
| One whitelisted facet, <8 products | `noindex, follow` | Self | No | Thin listing; the threshold is evaluated at render time |
| Two or more facets of any kind | `noindex, follow` | Self | No | Combinatorial; no meaningful search demand |
| Any non-whitelisted facet | `noindex, follow` | Self | No | |
| Price-range facet, any form | `noindex, follow` | Self | No | Infinite value space, zero search demand |
| `?sort=`, `?view=`, `?per=` | `index, follow` | **Base URL** | No | Identical product set, different order — a genuine duplicate |
| Site search `?q=` | `noindex, follow` | Self | No | Unbounded, user-generated |
| Zero-result filtered state | `noindex, follow` | Self | No | Also logged to `SearchQueryLog` (§29.17) |

`follow` is retained everywhere. Non-indexable does not mean link equity should stop flowing to
the products underneath, and `nofollow` on internal navigation is almost always a mistake.

### The whitelist

Path-form, indexable facets, chosen because each corresponds to a phrase people actually type:

| Facet | Path segment | Applies to | Example |
|---|---|---|---|
| Size | `rozmir-<value>` | Ліжники, ковдри, накидки, гуні | `/rozmir-150x200/` |
| Colour family | `kolir-<value>` | All | `/kolir-siryi/` |
| Composition | `sklad-<value>` | Wool families | `/sklad-100-vovna/` |
| Origin | `vlasne-vyrobnytstvo/` | All | Own-manufacture only (D3.4) |

`kolir` and `rozmir` are never indexable *together*. The origin facet is whitelisted because
"власне виробництво" is a real trust query and because D3 requires wholesale buyers to be able to
restrict to it — and a filter that a wholesale buyer will bookmark and re-share deserves a stable,
indexable URL.

Everything else — micron band, weight, price, made-to-order, stock state, dye lot, partner name —
is query-string only and never indexed.

### Enforcement

1. The facet-to-URL mapping is a single typed registry. A facet added without an entry defaults to
   **query-string, non-indexable**. The safe default is the automatic one.
2. Indexable facet pages require a hand-written 40–70 word intro. A facet page with no unique copy
   is a doorway page. If nobody will write the copy, the facet is not whitelisted.
3. Indexable facet URLs receive their own title/description template (§29.4) and their own
   `ItemList`.
4. Non-indexable facet links render as normal `<a href>` — crawlable, `follow`, just not indexable.
   Hiding them behind JavaScript to "save crawl budget" also hides the products.
5. A weekly report lists every indexable facet URL and its product count. Any that drops below 8
   products flips to `noindex` automatically at render time; the report exists so the merchandising
   cause gets noticed.

---

## 29.8 Pagination

- Page 1 is the clean category URL. There is no `/page/1/`; the form 301s to the base.
- Pages 2+ are `/katalog/vovna/lizhnyky/page/2/` — a path segment, not a query parameter, so
  pagination composes cleanly with path facets.
- Every page **self-canonicalises**. Canonicalising page 2 to page 1 is the most common pagination
  error and it de-indexes every product that appears only on later pages.
- `rel="prev"` / `rel="next"` are emitted. Google stopped using them in 2019; Bing and other
  consumers did not. They cost two tags.
- Title and description gain ` — сторінка {n}` (§29.4), so paginated pages are not duplicate-titled.
- The pagination control is real `<a href>` links, never a JavaScript-only "load more". An infinite
  scroll with no linked URLs is an un-crawlable catalogue.
- Page size is 24. A "view all" page is not offered: at a catalogue of several hundred to a
  thousand SKUs ([00-client-decisions-2.md](00-client-decisions-2.md) E5) it produces a
  multi-megabyte document with hundreds of images, which contradicts the Core Web Vitals target
  (§29.14).
- Only page 1 enters the sitemap. Later pages are discovered through links, which is exactly what
  the link graph is for.

---

## 29.9 Sitemaps and the `Redirect` model

### Segmentation

A sitemap index at `/sitemap.xml`, referencing segment files. Segmentation is by **type then
locale**, which makes a coverage problem legible at a glance: if `sitemap-products-de.xml` shows
40% indexed while `sitemap-products-uk.xml` shows 92%, the problem is the German translations,
and that conclusion took one screen in Search Console rather than a spreadsheet.

```
/sitemap.xml                       index
/sitemap-pages-{locale}.xml        static and editorial pages
/sitemap-categories-{locale}.xml   category + indexable facet URLs
/sitemap-products-{locale}.xml     products, chunked at 10,000
/sitemap-posts-{locale}.xml        blog posts
/sitemap-images.xml                locale-independent; images are shared across locales
/sitemap-videos.xml                locale-independent
```

Rules:

- **Only self-canonical, indexable, 200-status URLs.** A sitemap containing redirected,
  canonicalised-away or `noindex` URLs is a quality signal against the whole file.
- `lastmod` comes from the entity's `updatedAt` and must be **truthful**. A sitemap where every
  URL claims today's date is ignored. A cosmetic content change does not move `lastmod`; a price,
  stock, media or copy change does.
- `changefreq` and `priority` are **omitted**. Google ignores both, and emitting values nobody
  reads invites arguments about what they should be.
- No `xhtml:link` hreflang annotations in the sitemap. Hreflang lives in the HTML head (§29.3) and
  having two sources of truth guarantees they eventually disagree.
- Generated on a schedule and on demand after a publish event, cached, gzipped, and capped at
  10,000 URLs per file — well under the 50,000 limit, because smaller files diagnose faster.
- Untranslated-fallback URLs are excluded (§29.3, rule 6).

### The `Redirect` model

[25-database-schema.md](25-database-schema.md) §25.9 defines `Redirect { fromPath, toPath,
statusCode, hitCount }`. D2 cancelled the migration, so it has **no legacy mapping to hold**. It
is nonetheless load-bearing, for three ongoing jobs:

1. **Slug changes.** Editing a published slug atomically writes a `Redirect` row in the same
   transaction (§29.2). This is the only thing standing between a routine content edit and a
   self-inflicted 404 on an indexed URL.
2. **Category restructuring.** Merging or renaming a category during merchandising rewrites its
   URL. Every affected path gets a row.
3. **Marketing short links.** `/lizhnyk` → `/katalog/vovna/lizhnyky/` for print, packaging inserts,
   the Google Business Profile posts and any future social bio, as `302` where the destination is
   expected to change and `301` where it is not. With no social presence at all
   ([00-client-decisions-2.md](00-client-decisions-2.md) E3) these offline and GBP entry points
   are not a supplement to the link graph — for the first two quarters they very nearly are it.

Implementation:

- Lookup runs in edge middleware **before** the router, against an in-memory map refreshed on
  change. A database round trip on every 404 is a denial-of-service amplifier.
- `hitCount` increments asynchronously and is surfaced in the admin. A redirect with zero hits
  after 90 days is a candidate for removal; one with rising hits points at a link that should be
  corrected at source.
- **Chains are resolved at write time, not at request time.** Adding `B→C` when `A→B` exists
  rewrites `A→C`. Redirect chains cost latency and dilute the signal, and they accumulate silently.
- Loops are rejected at write time with a clear admin error.
- Redirect targets must be `200`. A redirect to a `404` is worse than the `404` it replaced.

---

## 29.10 robots.txt

```
User-agent: *
Allow: /

Disallow: /kosh/
Disallow: /oformlennia/
Disallow: /kabinet/
Disallow: /admin/
Disallow: /api/
Disallow: /*/kosh/
Disallow: /*/oformlennia/
Disallow: /*/kabinet/
Disallow: /*?*utm_
Disallow: /*?*gclid
Disallow: /*?*fbclid

User-agent: Googlebot-Image
Allow: /

Sitemap: https://{{DOMAIN}}/sitemap.xml
```

Notes on what is deliberately **not** here:

- **Facet query strings are not disallowed.** `noindex, follow` (§29.7) is the correct instrument:
  a `Disallow` prevents crawling, which prevents the crawler from *seeing* the `noindex`, which
  means those URLs can still surface as unlabelled entries. It also stops equity flowing through
  to the products.
- **No crawl-delay.** Googlebot ignores it, and no other crawler is hammering a new site.
- **No staging rules in the production file.** Staging is protected by HTTP authentication
  ([32-security-architecture.md](32-security-architecture.md) §32.18), not by `robots.txt`, which
  is a public document that advertises the staging URL to anyone who reads it.

AI crawler directives (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`) are
specified in [30-ai-search-optimization.md](30-ai-search-optimization.md) §30.9 and appended to
this same file. They are documented there because the decision is commercial, not technical.

`robots.txt` is a versioned file in the repository, not an admin-editable setting. A mistyped
`Disallow: /` shipped from a CMS is a site-wide de-indexing event, and it happens to real
businesses regularly.

---

## 29.11 Image SEO

Photography is the product ([01-brand-strategy.md](01-brand-strategy.md) §1.8), and on a
cold-start domain Google Images is a genuine, under-contested traffic source while the web results
are still in a sandbox.

### Filenames and Cloudinary public IDs

`Media.publicId` is the SEO-relevant identifier, because it is what appears in the URL.

```
{{BRAND_SLUG}}/products/<sku-lower>/<product-slug>-<role>-<n>
{{BRAND_SLUG}}/production/<stage-key>-<n>
{{BRAND_SLUG}}/brand/<asset>
{{BRAND_SLUG}}/blog/<post-slug>/<n>
```

Examples: `vivcharyk/products/vch-lizh-moz/lizhnyk-mozaika-primary`,
`vivcharyk/products/vch-lizh-moz/lizhnyk-mozaika-detail-vors`,
`vivcharyk/production/tkannia-verstat-02`.

`<role>` derives from `ProductMedia.role` (`PRIMARY`, `GALLERY`, `DETAIL`, `LIFESTYLE`,
`PRODUCTION`, `SCALE_REFERENCE`). Rules: ASCII, lowercase, hyphens, no dates, no camera filenames,
no `IMG_4821`. The public ID is assigned by the upload pipeline from the product's `uk` slug — an
editor never types it, so it cannot drift from the product it belongs to.

### The delivery URL pattern

```
https://res.cloudinary.com/{{CLOUD_NAME}}/image/upload/f_auto,q_auto:good,w_{W},c_limit,dpr_auto/v{version}/{publicId}.jpg
```

| Segment | Purpose |
|---|---|
| `f_auto` | AVIF → WebP → JPEG by `Accept` header. Satisfies [08-design-system.md](08-design-system.md) §8.7.5 |
| `q_auto:good` | Perceptual quality targeting. `q_auto:eco` for thumbnails, `q_auto:best` for the LCP hero only |
| `w_{W}`, `c_limit` | Width from the `srcset` step ladder; `c_limit` never upscales |
| `dpr_auto` | Device pixel ratio, paired with a 1×/2× `srcset` |
| `v{version}` | Immutable version. Enables `Cache-Control: immutable` and makes a changed image a new URL |
| `g_auto` / `x_`,`y_` | Only where a hard crop is required; driven by `Media.focalX/focalY`, never a blind centre crop |

A **custom CNAME** (`img.{{DOMAIN}}`) in front of Cloudinary is recommended before launch. It keeps
image URLs on the brand's domain, removes a third-party origin from the critical path, simplifies
the Content-Security-Policy ([32-security-architecture.md](32-security-architecture.md) §32.11),
and means a future CDN change does not invalidate every indexed image URL.

`srcset` ladder: 320, 480, 640, 768, 1024, 1280, 1600, 2048. `sizes` matches the real layout per
breakpoint ([33-responsive-strategy.md](33-responsive-strategy.md)). A wrong `sizes` attribute is
the most common cause of a 400 KB image on a 375 px screen.

### Alt text

`alt` comes from `MediaTranslation.alt` in the active locale, which
[25-database-schema.md](25-database-schema.md) §25.4 makes a **required** field on a per-locale
row. This is the mechanism that makes Accessibility 100 achievable: an editor cannot publish an
image without describing it, in each locale, because the API rejects the write.

Rules:

| Rule | Example |
|---|---|
| Describe what is in the frame, not the keyword you want to rank for | «Сірий вовняний ліжник з ромбовидним візерунком на дерев'яному ліжку» |
| Production images name the stage and the place | «Ткаля заправляє основу на верстаті у цеху в Яворові» |
| Never begin with "фото" or "зображення" | Screen readers already announce it |
| ≤125 characters | Longer is truncated by several screen readers |
| Decorative images use `alt=""` + `aria-hidden` and are flagged decorative in the CMS | [08-design-system.md](08-design-system.md) §8.7.2 |
| The same image in different contexts may carry different alt | Alt is contextual; `caption` is the invariant description |

An alt-coverage report per locale is a Phase-1 admin widget. **Every alt string on the site is
newly authored, including on reused photographs** — roughly four strings per image, which is a
real content-production cost and belongs in the roadmap, not in a developer's spare time. The
reuse permission in [00-client-decisions-2.md](00-client-decisions-2.md) E5 covers the pixels, not
the text around them; see §29.18 for the full reuse pipeline.

### Reused photography — the required processing step

Photographs may be taken from the adjacent business's site
([00-client-decisions-2.md](00-client-decisions-2.md) E5). They may not be dropped into Cloudinary
as-is. The upload pipeline applies, in order:

| Step | Reason |
|---|---|
| Re-crop and re-grade to the [01-brand-strategy.md](01-brand-strategy.md) §1.6 art direction | Two domains serving byte-identical files is a weaker signal than two distinct derivatives, and the visual identity is meant to differ anyway |
| **Strip all EXIF and XMP** | Camera serial numbers, capture dates and any embedded copyright or authorship string tie the file to the other business. This is metadata nobody inspects until someone does |
| Re-derive `Media.publicId` from this site's product slug and role (§29.11) | Never carry over a filename from the source site |
| Author new `MediaTranslation.alt` and `caption` per locale | Required by the schema, and the only part of the image that is indexable text |
| Set `focalX/focalY` | The source crop was composed for a different layout |

Identical images across two domains are a weaker signal than unique ones, but they are **not**
penalised the way duplicate text is — Google deduplicates images without treating the page as
spam. That asymmetry is exactly why the text rules in §29.18 are absolute while the image rules
are a processing pipeline.

Note also that reused photographs **do not satisfy the brand strategy**. They document a different
workshop in a different village. Every image that carries a production, place or people claim must
come from the new Yavoriv shoot ([00-client-decisions-2.md](00-client-decisions-2.md) E5), because
a homepage hero showing someone else's workshop floor is a provenance claim the site cannot
support.

### Supporting signals

- `<img width>` and `<height>` always present, from `Media.width/height` — structurally zero CLS.
- `loading="eager"` + `fetchpriority="high"` on the LCP image only; everything else `lazy`.
- Blurhash LQIP above the fold ([25-database-schema.md](25-database-schema.md) §25.4).
- `sitemap-images.xml` lists every product, production and editorial image with its caption.
- `ImageObject` with licence metadata (§29.6) on the primary product image and every article cover.
- Images are linked from a page that is itself indexed. An image whose only home is a lightbox
  loaded on click is largely invisible to image search.

---

## 29.12 Video SEO

Video is rank-1 evidence in [01-brand-strategy.md](01-brand-strategy.md) §1.8 and the single
hardest asset for a reseller to fake.

- **Self-hosted via Cloudinary**, not embedded from YouTube, on pages that need to rank. A YouTube
  embed accrues the watch signals to YouTube's URL, not to `{{DOMAIN}}`; it also adds a heavy
  third-party origin that makes the Performance target harder.
- **A YouTube mirror is still published** — as a discovery and citation surface, with a description
  linking back to the canonical page. The two are not in conflict as long as the `VideoObject`
  markup lives on the site page, which is the URL that should win.
- `VideoObject` per video (§29.6), with `hasPart` clips so the production sequence is
  chapter-addressable.
- **A real transcript rendered on the page**, not only a `.vtt` file. The transcript is indexable
  text, it is the passage an AI assistant can quote
  ([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.5), and it is a WCAG 1.2.2
  requirement independently of any of that.
- The hero video **never** carries the LCP. The poster frame is the LCP element, it is a plain
  `<img>`, and it is never animated on entrance ([13-motion-system.md](13-motion-system.md) §13.8).
- `preload="none"` with a poster; the video element hydrates lazily. Autoplay is muted, inline,
  and disabled under `prefers-reduced-motion` and `saveData`.
- `sitemap-videos.xml` lists every video with title, description, thumbnail, duration and the page
  it lives on.

---

## 29.13 Internal linking

On a domain with no external links (D2), **internal links are the entire link graph.** The
architecture below is not an optimisation; for the first two quarters it is the only distribution
of authority the site has.

### Structural rules

1. **Every indexable URL is reachable from the homepage in ≤3 clicks.** Verified by a crawl in CI.
2. **Navigation is real `<a href>` markup** in the server HTML, including the mega-menu's category
   list ([15-navbar-specification.md](15-navbar-specification.md)). A menu built from
   JavaScript-injected `<div onClick>` is not a link graph.
3. **The footer carries the full category list**, all four locale roots, and the editorial hubs.
   It is the flattest distribution mechanism a site has and it costs one component.
4. **Breadcrumbs render on every page below the root** and match the JSON-LD exactly.
5. **Anchor text is descriptive and varied.** No "детальніше", no "тут". The link text is what
   tells a crawler and an assistant what the target is about.
6. **No `nofollow` on internal links**, ever.

### The commerce ↔ editorial loop

The highest-value internal links are the ones crossing between the catalogue and the journal,
because they are what turns informational traffic — the only organic traffic a new domain can
realistically win (D2) — into commercial pages.

| From | To | Mechanism |
|---|---|---|
| PDP → care guide | The care article matching this family | `ProductAttributeValue` on the `care` definition resolves to a slug; bidirectional, per [02-ux-research.md](02-ux-research.md) §2.3 Persona 2 |
| PDP → production page anchor | The stages in `Product.productionStage[]` | Own-manufacture only (D3.6); each stage key deep-links to its section |
| PDP → category, sibling products | Breadcrumb + `ProductRelation` | `CROSS_SELL`, `UP_SELL`, `COMPLETES_SET` |
| Category → editorial explainer | "Що таке ліжник", "Гуня чи накидка" | Curated per category, in the below-grid block (§29.5) |
| Blog post → products | Named, in-body product mentions | Manual, in the editor; a generated "related products" rail is a fallback, not the primary |
| Blog post → blog post | Topic cluster siblings | Manual, curated |
| Production page → PDPs | "Вироби, зроблені на цьому етапі" | Query on `productionStage[]`; own-manufacture only |
| Wholesale → production, about | Capability evidence | Static |
| Care guide → PDPs | Products the guide applies to | Query on the care attribute |

### Topic clusters

Four hubs, each a hub-and-spoke set with reciprocal links. These are the cold-start organic entry
points named in [00-client-decisions.md](00-client-decisions.md) D2, and they are built around
terms the brand can genuinely own:

| Hub | Spokes | Why it can rank on a new domain |
|---|---|---|
| **Яворів і ліжникарство** (`/blog/` cluster + the production and about pages) | Чому Яворів називають столицею ліжникарства; ліжникарський пленер; Музей ліжникарства; династії Шкрібляків і Корпанюків; яворівський ліжник — що це означає | The place-entity play. See below — this is the strongest hub in the set and it did not exist before round 2 |
| **Ліжник** (`/blog/` cluster + `/katalog/vovna/lizhnyky/`) | What a ліжник is; ліжник vs плед; sizes; how it is fulled; how to wash one | High-specificity Ukrainian craft term, low commercial competition, high purchase intent |
| **Гуня і вовняний одяг** | What a гуня is; гуня vs накидка; гуня vs камізелька; wool clothing care | Near-zero competition. D4 confirms real stock, so the content has something to sell |
| **Пряжа, ровниця і вовна для рукоділля** | Ровниця vs пряжа; choosing thickness; metreage per project; dye lots | A distinct audience ([02-ux-research.md](02-ux-research.md) Persona 4) with informational intent and repeat-purchase behaviour |

`ровниця` and `гуня` are specifically called out in D2 as low-competition, high-specificity terms.
They are also terms almost nobody writes good content about, which means an accurate, illustrated,
first-hand explanation from an actual manufacturer is a realistic candidate to be the best result
on the internet for that query — which is the only reliable way a new domain outranks an old one.

### «Яворівський ліжник» — the keyword decision that matters most

[00-client-decisions-2.md](00-client-decisions-2.md) E2 resolves the address to с. Яворів,
Косівський район, and in doing so hands this project its best keyword asset. Яворів is the
recognised centre of Hutsul lizhnyk weaving — «столиця ліжникарства» — with a dedicated
Музей ліжникарства, annual weaving plein airs attended by art historians from Kyiv, Lviv and
Ivano-Frankivsk, and the Шкрібляк and Корпанюк woodcarving dynasties as neighbours.

**The strategic point is a competitive one, not a sentimental one.**

| Term | Competitive reality |
|---|---|
| `карпатський ліжник` | Thousands of sellers claim Carpathian. The word is free, so it is worthless as a differentiator, and the SERP is saturated with resellers ([02-ux-research.md](02-ux-research.md) §2.5) |
| `гуцульський ліжник` | Narrower, still broadly claimable, still contested |
| **`яворівський ліжник`** | Almost nobody can honestly use it. In this category it functions like an appellation: it names a place with a genuine production tradition, and the set of businesses entitled to the word is small enough to compete in |

A new domain cannot win a saturated head term. It can plausibly *own* a term that has real
recognition and almost no competent competition — and «яворівський ліжник» is both. This is the
same principle as `ровниця` and `гуня`, applied to place instead of product.

**Term set to build around** (per locale; `uk` is the source of truth):

| Group | Terms |
|---|---|
| Place + product | `яворівський ліжник`, `ліжник з Яворова`, `ліжники Яворів`, `вовняні вироби Яворів`, `гуня з Яворова` |
| Place + craft | `ліжникарство`, `столиця ліжникарства`, `яворівське ліжникарство`, `ліжникарський пленер`, `музей ліжникарства Яворів` |
| Place + commerce | `купити ліжник у Яворові`, `ліжник від виробника Косівщина`, `фабрика вовняних виробів Косівський район` |
| Tourist intent | `що привезти з Косова`, `що купити на Гуцульщині`, `Яворів Косівський район що подивитися` |
| `en` | `Yavoriv lizhnyk`, `Hutsul wool blanket Yavoriv`, `Carpathian wool blanket from the weaving village` |
| `de` / `pl` | Place name transliterated and then explained, per [30-ai-search-optimization.md](30-ai-search-optimization.md) §30.12 rule 1 |

**Placement.** «Яворів» appears in the homepage `h1` or subhead, in the homepage and category meta
descriptions (§29.4), in the `Organization.description` and `PostalAddress` (§29.6), in the
production and about page prose, in production image `alt` text (§29.11), and in the Google
Business Profile name field's supporting fields — never stuffed into the profile name itself,
which is a suspension risk (§29.16).

**Constraint.** Everything in this subsection describes the *village*. Nothing in it may be
phrased so that the heritage status of the craft reads as a credential held by the company —
see §29.6, "The heritage claim". «Ми тчемо ліжники у Яворові» is a fact about the business.
«Ліжникарство — ремесло, яке зробило Яворів відомим» is a fact about the place. Both are
publishable; a sentence that fuses them into an award is not.

### Local link targets — the ones that are actually reachable

A zero-authority domain cannot earn national links. It can earn *local* ones, and Яворів supplies
a specific, nameable list rather than the usual generic advice to "do outreach":

| Target | Why it is realistic | What to offer |
|---|---|---|
| **Музей ліжникарства** (Яворів) | A local institution documenting the exact craft the business practises, in the same village | Photographs of the working process, a workshop that visitors can be directed to, participation in museum programming |
| **The annual ліжникарський пленер** | Attended by art historians and covered by regional press. Participation is a link *and* a citation source | Host or sponsor a session; supply materials; be listed as a participating workshop |
| **Kosiv-district tourism and craft portals** | Their job is to list exactly this kind of business, and inclusion is usually free | An accurate listing with NAP matching §29.16 byte for byte |
| **Regional press (Івано-Франківськ, Косів)** | A family workshop of 30+ years in the lizhnyk capital is a genuine story, not a placement | The story plus photography. Offer the Yavoriv shoot's images |
| **Hutsul craft associations and registries** | Relevant, low-volume, durable | Membership, an accurate profile |
| **Ukrainian manufacturer directories** | Low value individually, cumulative as citations | Consistent NAP |

On a domain with zero referring domains, the first twenty links matter more than the next two
hundred, and every target above is locally relevant — which is the property that makes a link
worth having for a business whose search opportunity is also local.

Two cautions. **Do not fabricate a relationship with the museum or the plein air**: a claimed
association that the institution has not agreed to is a reputational risk in a village where
everyone knows everyone. And **link acquisition here is a client task, not a developer task** —
it requires a phone call from Іван or Любов, which is precisely why it is cheap for this business
and impossible for a reseller in Kyiv.

---

## 29.14 Core Web Vitals

Field targets are stated at the 75th percentile, mobile, because that is what Google measures.

| Metric | Google "good" | Target here | Why stricter |
|---|---|---|---|
| LCP | ≤2.5 s | **≤1.8 s** | Persona 1 browses on mountain mobile data ([02-ux-research.md](02-ux-research.md) §2.3) |
| INP | ≤200 ms | **≤150 ms** | Hydration of a gallery-heavy PDP is the risk; headroom is needed |
| CLS | ≤0.1 | **≤0.03** | Structurally achievable given the §8.7 image contract; anything above it is a bug |
| TTFB | — | **≤300 ms** cached, ≤600 ms uncached | Edge-cached SSR (§29.1) |

### Mapping to implementation decisions

| Decision | Doc | Metric |
|---|---|---|
| SSR with edge-cached HTML | §29.1 | TTFB, LCP |
| LCP image is a plain `<img>`, `eager` + `fetchpriority="high"`, preloaded in the head | [08-design-system.md](08-design-system.md) §8.7.3 | LCP |
| Hero video never carries the LCP; the poster frame does, unanimated | §29.12, [13-motion-system.md](13-motion-system.md) §13.8 | LCP |
| Exactly two preloaded font files, subset by `unicode-range` | [10-typography.md](10-typography.md) §10.7 | LCP |
| `font-display: optional` on display faces, `swap` on body | [10-typography.md](10-typography.md) §10.7.2 | CLS |
| Metric-matched fallback fonts (`size-adjust`, `ascent-override`) | [10-typography.md](10-typography.md) §10.7.5 | CLS |
| ≤85 KB webfont budget on first paint | [10-typography.md](10-typography.md) §10.7 | LCP |
| `width`/`height` on every image, blurhash LQIP above the fold | [08-design-system.md](08-design-system.md) §8.7.1 | CLS |
| Framer Motion dynamically imported, absent from the LCP path | §29.1 | INP |
| Gallery, filter panel, cart drawer, search overlay lazily hydrated | §29.1 | INP |
| Skeletons match final dimensions exactly | [08-design-system.md](08-design-system.md) §8.8 | CLS |
| Announcement bar height reserved in the layout, never injected after paint | [15-navbar-specification.md](15-navbar-specification.md) | CLS |
| Analytics and consent UI load after `requestIdleCallback`, post-consent | [31-analytics-architecture.md](31-analytics-architecture.md) §31.3 | INP, LCP |
| `f_auto` + `q_auto` + correct `sizes` | §29.11 | LCP |
| Ambient motion disabled on `saveData` and `prefers-reduced-motion` | [13-motion-system.md](13-motion-system.md) §13.7 | INP |
| No third-party script in the critical path; no font CDN, no tag manager on first paint | [10-typography.md](10-typography.md) §10.7.4 | all three |

### Budgets, enforced in CI

| Budget | Limit |
|---|---|
| Initial JS, gzipped, homepage | ≤130 KB |
| Initial JS, gzipped, PDP | ≤160 KB |
| Initial CSS, gzipped | ≤35 KB |
| Webfonts on first paint | ≤85 KB |
| LCP image, transferred | ≤180 KB |
| Total first-view transfer, homepage | ≤700 KB |
| Third-party requests before consent | **0** |

A pull request that exceeds a budget fails. Lighthouse CI runs on every PR against the homepage,
a category page, a PDP and a blog post; a lab-score regression below 95 blocks the merge. Lab
scores are a gate, not the goal — §29.17 covers the field data that actually counts.

---

## 29.15 Cold start — what replaces a migration plan

[00-client-decisions.md](00-client-decisions.md) D2 revokes the migration workstream entirely.
There is no legacy URL set, no 301 map, no Search Console baseline, and no inherited authority.
This section states plainly what that costs and what is done about it, because the cost is
usually discovered in month three by a client who was told search would work.

### The honest forecast

| Period | Realistic organic expectation |
|---|---|
| Month 0–1 | Indexing only. Brand-name queries begin to resolve. Effectively zero non-brand organic. |
| Month 2–3 | Long-tail informational impressions begin (`що таке ліжник`, `гуня це`). Clicks in the low tens per month. Commercial head terms do not rank. |
| Month 4–6 | Informational content starts to hold positions. Local pack visibility via Google Business Profile is by now the largest search channel. First long-tail commercial queries (`купити ровницю`) appear. |
| Month 7–12 | Category pages become competitive on mid-tail terms. Head terms (`ліжник купити`) remain unrealistic without external links. |

**Any plan that assumes otherwise is wrong.** This is not pessimism; it is what a new domain with
no backlinks does. The mitigations below are ordered by leverage.

### The launch channels, in order of leverage — revised after round 3

[00-client-decisions-2.md](00-client-decisions-2.md) E3 removed a channel this section previously
counted on: **there is no Instagram, no Facebook, no social presence of any kind.**
[00-client-decisions-3.md](00-client-decisions-3.md) F2 gives one back, and it is a better one —
**the Яворів address is a shop as well as a factory**, which converts the footfall line below from
a conditional into a confirmed channel and raises the ceiling on the profile above it.

1. **Google Business Profile (§29.16).** Highest leverage by a wide margin, and now unambiguously
   the primary launch channel rather than the first among several. A profile already exists
   ([00-client-decisions-2.md](00-client-decisions-2.md) E4) and F2 confirms it as correct, which
   removes the postcard-verification wait that was previously the long pole — but it has not been
   audited against the checklist in §29.16 and must be before launch. F2 also **widens what the
   profile can win**: a confirmed retail function makes it eligible for «де купити ліжник» and «де
   купити ліжник Косів» transactional-local queries that a manufacturer-only profile is not
   surfaced for at all. GBP stays at the **top of Phase 0** in
   [35-implementation-roadmap.md](35-implementation-roadmap.md), with more riding on it than before.
2. **Physical footfall at the Яворів shop — promoted, and now independent of search.** F2 confirms
   that a visitor can walk in, see the production floor and buy on the spot. Яворів is a
   craft-tourism village with a Музей ліжникарства and annual weaving plein airs, which means a
   pre-qualified audience arrives in the valley for exactly this craft without any search having
   taken place. Every one of them is a candidate for the printed URL, the first verified review and
   the first photograph of a product in someone's home. On a cold-start domain with no social
   presence, a channel that does not depend on ranking is worth more than its volume suggests. The
   instrumentation problem this creates is real and is handled honestly in
   [31-analytics-architecture.md](31-analytics-architecture.md) §31.13 — most of it cannot be
   measured, and the plan says so rather than inventing a number.
3. **The existing offline customer base.** Every existing customer, every market-stall contact,
   every wholesale buyer gets the URL — by phone, by Viber, on packaging inserts, on the invoice.
   These are also the only people who can leave the first verified reviews, which is what
   eventually unlocks `AggregateRating` (§29.6).
4. **Long-tail informational content.** `яворівський ліжник`, `ліжникарство`, `гуня`, `ровниця`,
   `вовна для рукоділля` — terms with genuine search volume, near-zero competent competition, and
   a first-hand authority advantage that no reseller can match. The four clusters in §29.13 are
   the plan. This channel takes months to produce anything, and the forecast above reflects that.
5. **Local and craft citations.** The named targets in §29.13 — Музей ліжникарства, the
   ліжникарський пленер, Kosiv-district tourism portals, regional press, Hutsul craft associations.
   Low volume, but real links from relevant sites, and on a zero-link domain the first twenty links
   matter more than the next two hundred. A visitable shop materially improves the odds here: a
   tourism portal lists places a reader can go, not manufacturers a reader can read about, and F2
   moves this business from the second category into the first.
6. **Paid search**, if budgeted. Not covered here, but it is the only channel that produces traffic
   in month one, and that should be said rather than implied. Paid *social* is not available
   without a social account.

The reordering is not cosmetic. Channels 1, 2 and 5 all strengthen because of a single fact about
the premises, and all three of them produce results in weeks rather than the months channel 4
needs. A cold start with a visitable address is a materially different launch from a cold start
without one.

**The recommendation on record** ([00-client-decisions-2.md](00-client-decisions-2.md) E3): create
an Instagram account before launch, even if it is updated rarely. It extends the reach of channels
2 and 3, it is where craft product photography does its work, and it is the cheapest proof-of-life
signal a new domain has. It also has a second-order SEO value — it is the only realistic source of
the off-site brand mentions that [30-ai-search-optimization.md](30-ai-search-optimization.md)
§30.11 identifies as currently near zero. F2 strengthens the case rather than weakening it: a shop
in a tourism village is photographable, and a visitor who has just been inside it is the most
likely person on earth to tag it. Recorded as a recommendation, not a decision; until it exists,
`sameAs` stays GBP-only (§29.6).

### The contact address is a ranking-adjacent trust problem

[00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com`. It is a
working address and it should be used as one, but it should not be the address the site presents.

This is not an algorithmic penalty and nothing in Google's systems reads an email domain as a
quality signal. The cost is entirely human, and on a cold-start domain the human cost is the one
that matters, because every early visitor arrives with the question
[02-ux-research.md](02-ux-research.md) §2.3 identifies as the primary purchase anxiety: *is this a
real manufacturer or a reseller with a website?* The site answers that question with a village
address, a production page, a shop you can walk into — and then a numeric personal Gmail in the
footer, which answers it the other way. A 5,000–15,000 UAH purchase does not survive that
contradiction, and the visitor does not articulate it; they simply do not order.

A `@{{DOMAIN}}` mailbox forwarding to the owners' existing inbox costs effectively nothing, changes
no workflow, and removes the contradiction. It is the highest ratio of trust gained to effort spent
available anywhere on the project. The separate and harder requirement — that transactional mail
must be **sent** from an authenticated domain, which `gmail.com` structurally cannot be — is a
Phase 1 blocker specified in
[32-security-architecture.md](32-security-architecture.md) §32.16 and
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.

### Launch-week technical checklist

- [ ] `{{DOMAIN}}` = `vivcharyk.shop` (chosen, [00-client-decisions-7.md](00-client-decisions-7.md) K1) registered for ≥3 years, registrar lock and auto-renew on, DNS on a managed provider
- [ ] HTTPS with HSTS ([32-security-architecture.md](32-security-architecture.md) §32.11)
- [ ] One canonical host. `www` ↔ apex 301 in one direction, decided once and never revisited
- [ ] Staging is HTTP-auth protected and returns `noindex` — verified by request, not by assumption
- [ ] Production `robots.txt` shipped and verified as **not** `Disallow: /`
- [ ] Every page type returns 200 with complete meta, hreflang, canonical and JSON-LD (automated crawl)
- [ ] Sitemap index reachable, all segments valid, zero non-canonical URLs inside
- [ ] Search Console property verified for the domain; sitemap submitted
- [ ] Bing Webmaster Tools verified; sitemap submitted
- [ ] **Google Business Profile audited against the §29.16 pre-launch checklist, ownership confirmed**
- [ ] **GBP primary category confirmed to cover both retail and manufacturing (§29.16), retail attributes set**
- [ ] Branded `@{{DOMAIN}}` email live and receiving, forwarding to the owners' existing inbox
- [ ] Transactional mail sending from `no-reply@{{DOMAIN}}` with SPF, DKIM and DMARC passing — **not** from `gif19601@gmail.com` ([32-security-architecture.md](32-security-architecture.md) §32.16)
- [ ] `LocalBusiness` node typed `["Store", "LocalBusiness"]` with the retail properties present (§29.6)
- [ ] `LocalBusiness` JSON-LD verified to contain **no** `openingHours` (§29.6)
- [ ] Every published `PARTNER_MANUFACTURE` product verified to emit **no** `manufacturer` and **a** `brand` (§29.6)
- [ ] `sameAs` contains the GBP URL and nothing else — no adjacent-business handle (§29.6)
- [ ] Every migrated product description verified as rewritten, by the §29.18 sampling check
- [ ] 404 page returns HTTP 404 (not 200), with useful navigation
- [ ] Custom 500 page, and an alert wired to it
- [ ] CrUX / field-vitals collection live ([31-analytics-architecture.md](31-analytics-architecture.md) §31.9)
- [ ] All `{{TOKEN}}` placeholders resolved — CI blocks the build otherwise

### Post-launch monitoring

**Daily, first 14 days.** Search Console coverage errors; server 4xx/5xx rate; `Redirect.hitCount`
for unexpected spikes; Googlebot hits in the access log; render check on one URL per page type.

**Weekly, first 8 weeks.** Indexed-page count per sitemap segment; impressions and average
position per locale; structured-data enhancement reports; Core Web Vitals field data as it
accumulates; new-query discovery (which long-tail terms are starting to surface); Google Business
Profile views, searches and direction requests.

**Monthly, ongoing.** The full measurement plan in §29.17; content-cluster performance against the
§29.13 plan; a link-acquisition review; a facet-indexation audit (§29.7); an alt-coverage and
translation-completeness audit per locale.

**Two explicit tripwires.** If indexed pages have not exceeded 60% of submitted URLs by week 6,
the cause is technical, not editorial, and a crawl audit is triggered. If a locale's indexed share
is materially below `uk`'s, the cause is almost certainly translation completeness (§29.3 rule 6)
and the content plan is re-prioritised.

---

## 29.16 Local SEO and Google Business Profile

D2 makes this the **primary early search channel**, not a supporting one, and
[00-client-decisions-2.md](00-client-decisions-2.md) E3 removes the social channel that would
otherwise have shared the load. The reasoning is specific rather than generic: a new domain cannot
outrank established sites organically, but a real physical business with a real address in Kosiv
district is competing in a local pack against very few verified competitors — and it can win there
in weeks.

**A profile already exists and the client has confirmed it is correct**
([00-client-decisions-2.md](00-client-decisions-2.md) E4,
[00-client-decisions-3.md](00-client-decisions-3.md) F2). That is better than starting from
nothing, because it removes the postcard-verification wait that is normally the longest lead time
in a launch. It is still a risk, because an existing profile was configured by someone at some
point for some purpose, and none of that configuration has been inspected field by field. The
share link the client provided could not be resolved automatically — Google returned HTTP 429 — so
**every field below must be confirmed by a human opening the profile**. "The client says it is
correct" resolves ownership and location; it does not resolve category selection, attributes or
leftover entries, none of which the client has been asked about.

### What F2 changes here, and it is the largest change in this document

> «Все чотко, там знаходиться і магазин і виробництво.»

The Яворів premises are **both a shop and a factory**. Until round 3 this section assumed a
production site that visitors might be able to enter. It is a retail location attached to a
production floor, and the difference is not a nuance — it changes which queries the profile is
eligible for.

A Google Business Profile's category set determines the query space it can appear in at all. A
manufacturer category answers «виробник ліжників» and «фабрика вовняних виробів». It does **not**
answer «де купити ліжник», «магазин ліжників Косів», or «купити вовняну ковдру поруч» — the
transactional-local queries where the searcher has money out and a map open. Those queries are
served from retail categories, and a manufacturer-only profile is simply not in the candidate set.

This is the highest-intent query class available to the business and it was previously excluded by
a categorisation decision made on incomplete information. Recovering it costs one field change.

### The assets

| Asset | Value |
|---|---|
| A real, visitable address | вул. Петруші, с. Яворів, Косівський район, Івано-Франківська обл., 78644 |
| **Яворів itself** | The recognised centre of Hutsul lizhnyk weaving — «столиця ліжникарства», with a Музей ліжникарства and annual weaving plein airs (§29.13). A category-defining place name that almost no competitor can claim |
| Kosiv district | The historic centre of Hutsul craft. Named explicitly, never generalised to "Карпати" |
| A tourist region with institutional footfall | Museum and plein-air visitors search on a phone, in the valley, for something to bring home |
| **A shop, not just a workshop** | [00-client-decisions-3.md](00-client-decisions-3.md) F2. A visitor can walk in and buy on the spot. This is what makes the retail attributes below truthful, and truthfulness is the only thing separating them from a guideline violation |
| A production floor at the same address | The answer to «is this a real factory or a reseller» is a place, not a paragraph. Very few competitors in the local pack can offer both functions at one pin |
| Two owner phone numbers answered in person | `+380679973450` (Іван), `+380679604769` (Любов) |

### Pre-launch verification checklist — mandatory, manual

Derived from [00-client-decisions-2.md](00-client-decisions-2.md) E4. Each row is confirmed by
opening the profile and comparing against the live site. "Probably fine" is not a verification;
this list is the reason the profile is trustworthy at launch rather than a source of a silent
NAP conflict.

| # | Check | Why it matters |
|---|---|---|
| 1 | **Business name matches «Вівчарик» exactly** as it appears on the site, the footer and signage. No keyword suffix, no «— ліжники з Карпат» | NAP consistency is the single largest local-ranking factor, and a keyword-stuffed name is a guideline violation and a suspension risk |
| 2 | **Address matches вул. Петруші, с. Яворів, 78644 byte for byte** with the footer, the contact page and the `PostalAddress` in §29.6 | A formatting mismatch — «вул.» vs «вулиця», a missing «с.», a different postcode — is treated as a *different business*, which splits the entity in two |
| 3 | **Address is not Вербовець.** Confirm the pin, the street and the locality | Вербовець belongs to the adjacent business, roughly 20 km away. A profile pointing at the wrong village merges the two businesses geographically and sends visitors to someone else's door |
| 4 | **Primary category covers BOTH functions.** See the category analysis below — this row is rewritten by [00-client-decisions-3.md](00-client-decisions-3.md) F2 and the previous instruction to avoid a retail category is **withdrawn** | Category choice determines which queries the profile is eligible to surface for at all. A manufacturer-only category suppresses «де купити ліжник» transactional intent; a shop-only category discards the manufacturing story that is the brand's entire differentiator. Both errors are one-field errors and both are expensive |
| 4a | **Retail attributes are set**: in-store shopping, in-store pickup, and payment methods accepted on site | F2 makes these truthful. They are the attributes Google uses to filter local results for buying intent, and an unset attribute is read as absent rather than unknown |
| 5 | **Website field points at `https://{{DOMAIN}}/`** — the root, not a `/uk/` URL (§29.2) | This is the profile's main job. An empty or wrong website field wastes the highest-leverage channel the launch has |
| 6 | **Phone matches the footer**: `+380679973450` primary | A second, undeclared number on the profile is a NAP inconsistency even when both numbers are genuine |
| 7 | **Photographs are of Yavoriv production**, not of the adjacent business | Reused imagery from another workshop is both a provenance failure and, if the other business also posts it, a duplicate-asset signal between two profiles |
| 8 | **Ownership is verified and under the client's control** — Іван or Любов can log in and edit | An unverified profile, or one claimed by a third party, cannot be corrected. If ownership is disputed, the reclaim process starts in Phase 0 and takes weeks |
| 9 | Hours reflect reality or are left unset (see below) | — |
| 10 | No leftover description, service or product entries referencing the adjacent business | — |

Until rows 1–8 including 4a are confirmed, the profile is a launch blocker, not a launch asset.

### The category decision — a shop and a factory at one pin

Google allows one primary category and up to nine secondary ones. The primary category carries
most of the weight, and the choice is genuinely constrained because Google's taxonomy has no entry
for "wool mill with a shop attached". Three framings were considered.

| Option | What it wins | What it loses | Verdict |
|---|---|---|---|
| Manufacturing primary — *Виробник вовняних виробів / Woolen goods manufacturer* | «виробник ліжників», «фабрика вовняних виробів», wholesale enquiries. Almost no competition | Every transactional-local query. A searcher typing «де купити ліжник» with a map open never sees the profile, because manufacturers are not in the retail candidate set. This is the highest-intent traffic the business can get | **Rejected as primary.** It was the earlier recommendation and it was made before F2 |
| Retail primary — a generic *Store* | Transactional-local intent, in-store attributes, "open now" filters, shopping surfaces | Competes against every shop in the oblast on a signal set the business does not have — no review volume, no history. It also discards the manufacturing differentiator at exactly the field where Google reads what the business *is* | **Rejected.** Generic retail is the crowded end of a market this business is not positioned for |
| **Craft-retail primary + manufacturing secondary** — adopted | Both. A craft- or home-goods retail primary puts the profile in the retail candidate set, while the manufacturing secondary keeps the production claim machine-readable and keeps «виробник» queries reachable | Nothing structural. Secondary categories carry less weight than the primary, so the manufacturing queries rank slightly lower than they would with the reverse arrangement — but they are queries with almost no competition, so a slightly weaker signal still wins them | **Adopted** |

**Recommended set**, to be confirmed against Google's live taxonomy at the moment of configuration
since the list changes without notice:

| Slot | Category |
|---|---|
| **Primary** | Магазин домашнього текстилю / **Home goods store**, or **Blanket store** if it is offered in the Ukrainian taxonomy — whichever is the closest true retail category for ліжники and ковдри |
| Secondary 1 | **Виробник вовняних виробів / Woolen goods manufacturer** |
| Secondary 2 | Магазин виробів ручної роботи / Craft store |
| Secondary 3 | Магазин пряжі / Yarn store — genuinely distinct intent, and the яворівський пряжа/ровниця audience does not overlap with the ліжник audience |
| Secondary 4 | Фабрика / Manufacturer |
| Secondary 5 | Сувенірний магазин / Souvenir store — only if the tourist framing is wanted; it is a weaker fit and may dilute |

**Why the primary is the retail one and not the manufacturing one.** The asymmetry is in the
competition, not in the identity. Manufacturing queries have almost no competent competitors in
this district, so the profile wins them from a secondary slot. Retail queries have many
competitors, so the profile needs the primary slot to be in the running at all. Putting the strong
signal behind the easy queries and the weak signal behind the hard ones is the wrong way round.
The manufacturing identity is not lost by this: it is carried by `Organization` in the structured
data (§29.6), by the production page, by the profile description, by the secondary category, and by
every product's `manufacturer` property. The primary category is one field among many that state
what the business is, and it is the only one that also gates which searches can find it.

**If the client or Google's taxonomy forces a single-function choice**, keep the manufacturing
category and accept the loss. A profile that ranks for fewer queries is recoverable; a profile
suspended for a category that misrepresents the premises is not, and the manufacturing claim is
the one the entire brand strategy rests on ([01-brand-strategy.md](01-brand-strategy.md) §1.2).
This is a fallback, not the plan.

### Profile configuration

| Field | Value |
|---|---|
| Name | «Вівчарик» exactly as on the site and on signage. No keyword suffix |
| Primary category | A retail category — see the category analysis above. Home goods store / Blanket store, whichever the live taxonomy offers |
| Secondary categories | **Woolen goods manufacturer** (first secondary, non-negotiable), Craft store, Yarn store, Manufacturer |
| Description | Leads with both functions: «Фірмовий магазин при власному виробництві вовняних виробів у селі Яворів на Косівщині. Ліжники, ковдри, гуні, пряжа та ровниця. Понад 30 років виробляємо в Карпатах.» The tagline's «в Карпатах» framing ([00-client-decisions-3.md](00-client-decisions-3.md) F6) holds here too; Яворів is already carried by the address field |
| Address | вул. Петруші, с. Яворів, Косівський район, Івано-Франківська обл., 78644 — matching the site's `PostalAddress` character for character |
| Service area | Ukraine-wide delivery declared in addition to the storefront; EU delivery for the transactional locales ([00-client-decisions-2.md](00-client-decisions-2.md) E11) |
| **Hours** | **Maintained on the profile only, and only if the client will keep them current.** Google Maps is the live source (E3). They are *not* mirrored into JSON-LD (§29.6). If the owners will not maintain them, leaving hours unset is better than publishing wrong ones |
| Special hours | Set on the profile where known. No site-side mirror |
| Phone | `+380679973450` primary (Іван). `+380679604769` (Любов) as the additional number if the profile supports one, otherwise contact page only |
| Website | `https://{{DOMAIN}}/` — the root (§29.2) |
| **Attributes — retail set** | **In-store shopping**, **in-store pickup**, accepts cards, accepts cash. All four are truthful under [00-client-decisions-3.md](00-client-decisions-3.md) F2 and all four are filters Google applies to buying-intent queries. An unset attribute is treated as absent, not unknown, so leaving them blank is an active cost |
| Attributes — access set | On-site parking, wheelchair access (**verify before setting** — an asserted access feature that does not exist is worse than an unset one), Viber, delivery |
| Products | The confirmed D3 catalogue, each linking to its category URL. Own-manufacture items first; the product list is a retail surface and the ordering is a merchandising decision |
| Photos | Exterior, **the shop interior**, the machines, people working, products in use — **all from the Yavoriv shoot**. The shop interior is now a required subject rather than an optional one: it is the photograph that proves the retail attributes, and it is what a visitor checks before driving to a village. Weekly cadence |
| Posts | Weekly. New products, seasonal notes, production moments, museum and plein-air participation |
| Q&A | Seeded with the real questions from §29.6's FAQ set, answered by the owner account. Include «Чи можна приїхати подивитися?» and «Чи можна купити на місці?» — the second is now answerable with an unqualified yes, and it is the question the retail categories will start attracting |

### Opening hours on the profile, but nowhere else

This is the one place hours are published, and the split is deliberate
([00-client-decisions-2.md](00-client-decisions-2.md) E3). The profile can be corrected from a
phone in thirty seconds by the person who knows whether the workshop is open; JSON-LD ships with a
deploy and is corrected by a developer. Putting variable data in the slow-moving system and the
fast-moving system at once guarantees they disagree, and the one that is wrong is always the one
that is harder to fix.

The contact page therefore states «Графік гнучкий — телефонуйте перед візитом», shows both numbers
prominently, and links to the Google Business Profile as the authoritative source. That sentence
is not a hedge — it converts better than a timetable, because a visitor who phones ahead arrives
to an open door.

### NAP consistency

The name, address and phone must be **byte-identical** across: the site footer, the contact page,
the `LocalBusiness` JSON-LD, the Google Business Profile, and every directory listing. Inconsistent
NAP is the most common local-SEO defect and it is entirely self-inflicted.

The single source of truth is the `Setting` table. The footer, the contact page and the JSON-LD all
read from it; none hard-codes an address. The postcode is now resolved — `78644` — so the
`{{POSTAL_CODE}}` token is retired and the literal value is seeded.

**Conflicts to resolve before the profile is published**, all created by the separation from the
adjacent business:

- **The address must be Яворів, not Вербовець.** This is the correction with the largest
  consequence, because the earlier audit recorded the wrong village. Every document, seed file,
  footer and listing carrying Вербовець is wrong and must be changed.
- `shkura.ovecha@gmail.com` belongs to the adjacent business and must not appear on the profile.
  `gif19601@gmail.com` must not appear either — it is the Owner's login ([00-client-decisions-8.md](00-client-decisions-8.md) §L1); the brand needs `{{BRANDED_EMAIL}}` at
  `@{{DOMAIN}}` before launch, and it blocks on the domain (E9). Whatever address the profile
  carries must match the site's contact page exactly — an email mismatch is a weaker NAP signal
  than an address mismatch but it is still a signal, and it is free to get right.
- **No social profile may be linked**, on the profile or in `sameAs` (§29.6). `@fabryka_shkur` is
  the adjacent business's identity and asserting it merges two businesses. There is currently no
  correct value — the field stays empty.
- `{{LEGAL_ID}}` (ЄДРПОУ/РНОКПП for ФОП Гондурак Любов Юріївна) **exists and will be supplied on
  request** ([00-client-decisions-3.md](00-client-decisions-3.md) F1). It is a chase item, not a
  discovery item. It is required for the offer contract, the WayForPay merchant contract and the
  German Impressum ([32-security-architecture.md](32-security-architecture.md) §32.15), not for
  the profile — but it is on the same Phase-0 list.

### Reviews

Google reviews are a local ranking factor and a conversion factor, and they are independent of the
on-site `Review` model — a Google review cannot feed `AggregateRating` in the site's structured
data (§29.6), and attempting to import them would be a policy violation. Both are collected:

- A review request goes out with the delivery confirmation email, linking to the Google profile.
- Visitors to the workshop are asked in person. This is the highest-conversion request available
  and it costs nothing.
- Every review is replied to, in the review's language, within 48 hours. Unanswered reviews are a
  visible signal of an inattentive business.
- **No incentives, no gating, no bulk requests.** Review manipulation is one of the few things
  Google removes profiles for.

### Local landing content

The contact page is a destination page, not a form: address, embedded map, photographs of the
building, driving directions from Kosiv and from Kolomyia, parking, what a visitor can see, both
phone numbers, and «Графік гнучкий — телефонуйте перед візитом» stated prominently with a link to
the Google Business Profile for live hours. It carries the expanded `LocalBusiness` node — without
`openingHours` (§29.6) — and is the target of the Google Business Profile website link's secondary
CTA.

[00-client-decisions-3.md](00-client-decisions-3.md) F2 promotes the contact page from a utility
page to a **destination page**, and the content brief changes accordingly. It is no longer "here is
a form"; it is "here is a place you can visit, and here is what you will see". The additions are:

| Element | Why it earns its place |
|---|---|
| «Магазин і виробництво в одному місці» stated in the first screen | This is the fact the page exists to deliver and it is the answer to the primary purchase anxiety. Burying it under a form wastes it |
| Photographs of the shop interior, not only the production floor | A visitor deciding whether to drive to a village wants to know what is on the shelves. The production photographs prove the story; the shop photographs close the visit |
| «Що можна побачити» — a short list: the machines, the ступа, the finished goods, the yarn | Sets the expectation and converts a drive-past into a stop. It also gives the page indexable text about the craft that no competitor's contact page has |
| Whether the production floor itself is visitable, stated either way | Both answers are fine. An unanswered question is what stops the visit |
| Directions from Kosiv and Kolomyia, parking, both phone numbers | Standard, and more valuable now that the destination is a shop |
| «Графік гнучкий — телефонуйте перед візитом», with the GBP link for live hours | Unchanged, and load-bearing (§29.6) |

A separate "visit the workshop" page remains a **Phase-2 candidate**, and F2 strengthens the case
without making it urgent. The contact page now carries the visit content; a dedicated page is only
warranted if the tourist channel produces enough volume to justify a second URL competing for the
same queries. Splitting the content prematurely weakens both pages, which is the usual outcome
when a local business builds a "visit us" page alongside a contact page that already says the same
things.

---

## 29.17 Measurement

Full instrumentation is specified in
[31-analytics-architecture.md](31-analytics-architecture.md). This section defines only what is
measured *about search*, and is deliberately honest about what cannot be measured.

### Instruments

| Instrument | What it answers | Cadence |
|---|---|---|
| Google Search Console | Impressions, clicks, position, coverage, enhancements, CWV field data — segmented per sitemap and per locale | Weekly |
| Bing Webmaster Tools | Bing/Copilot-side indexing; a proxy for AI retrieval surfaces that use Bing's index ([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.2) | Monthly |
| CrUX + field RUM | Real-user LCP/INP/CLS by device and locale | Weekly |
| Server access logs | Which crawlers fetch what, how often, and what status they receive. The only reliable source for AI-crawler behaviour | Monthly |
| Google Business Profile Insights | Views, searches, calls, direction requests, photo views | Weekly |
| `SearchQueryLog` ([25-database-schema.md](25-database-schema.md) §25.9) | What visitors expect to find on the site and cannot | Weekly |
| Rank tracking, ~100 terms across 4 locales, including the full `яворівський` set (§29.13) | Directional movement on the §29.13 clusters | Monthly |
| **Duplicate-content spot check against `fabryka-shkur.com.ua`** | Whether any migrated product text still matches the source site, and whether Google is choosing the other domain for a query both sites answer | Monthly for the first 6 months (§29.18) |

### The KPI set

| KPI | Baseline | Month 6 | Month 12 |
|---|---|---|---|
| Indexed / submitted URLs, `uk` | — | ≥85% | ≥95% |
| Indexed / submitted URLs, `en`/`pl`/`de` | — | ≥70% | ≥90% |
| Non-brand organic clicks, monthly | 0 | {{SEO_CLICKS_M6}} | {{SEO_CLICKS_M12}} |
| Queries with ≥1 impression | 0 | ≥400 | ≥1,500 |
| Google Business Profile direction requests, monthly | 0 | {{GBP_DIRECTIONS_M6}} | — |
| GBP impressions on **non-brand retail queries** (Google's "discovery" split) | 0 | tracked, no target | — |
| CWV "good" URL share, mobile | — | 100% | 100% |
| Structured-data errors | 0 | 0 | 0 |
| Referring domains | 0 | ≥15 | ≥50 |

Targets carrying `{{TOKEN}}`s are deliberately unset: proposing a click target for a domain that
does not yet exist, in a market with no measured baseline, would be a number invented to look like
a plan. They are set in Phase 0 once the domain and the catalogue size are known
([00-client-decisions.md](00-client-decisions.md) D6.1, D6.6).

### What cannot be measured, stated plainly

- **Keyword-level traffic.** Search Console reports queries with sampling and thresholds; small
  numbers are suppressed entirely. On a low-traffic new site, a large share of real queries will
  simply not appear.
- **Rank tracking is a proxy.** Results are personalised, localised and volatile. A rank tracker
  measures a synthetic query from a synthetic location. It is useful for direction, worthless for
  precision.
- **AI-assistant citations are largely unmeasurable.** Covered honestly in
  [30-ai-search-optimization.md](30-ai-search-optimization.md) §30.13.
- **Attribution across a multi-session, multi-device purchase.** The average order is 5,000–15,000
  UAH and nobody buys on the first visit ([02-ux-research.md](02-ux-research.md) §2.3). A purchase
  attributed to "direct" was very often found via search weeks earlier. Last-click attribution
  systematically understates SEO, and the reporting must say so every time it is read
  ([31-analytics-architecture.md](31-analytics-architecture.md) §31.11). Guest checkout is
  permanent ([00-client-decisions-2.md](00-client-decisions-2.md) E12), so there is no logged-in
  identity to stitch sessions with and this limit is structural rather than temporary.
- **Why Google chose one domain over another for a shared query.** Search Console reports that a
  page lost impressions; it does not report that a near-duplicate on an older domain outranked it.
  §29.18's monthly check is a manual proxy, and it is the only one available.
- **Anything the shop does offline.** Now that the Яворів address is a confirmed retail location
  ([00-client-decisions-3.md](00-client-decisions-3.md) F2), a real and possibly significant share
  of the business's demand will be created by a visit and completed either on the spot or online
  weeks later from a different device. None of that is visible to Search Console, none of it is
  visible to analytics, and no amount of instrumentation makes it so. The partial, honest
  measurements available are set out in
  [31-analytics-architecture.md](31-analytics-architecture.md) §31.13; they are proxies, they
  undercount, and the reporting must say so. **The GBP direction-request and call metrics above are
  the closest available signal and they are still only a signal.**

---

## 29.18 Content reuse and the duplicate-content constraint

[00-client-decisions-2.md](00-client-decisions-2.md) E5 permits products and photographs to be
taken from the adjacent business's site at `fabryka-shkur.com.ua`. That decision removes the
largest open blocker on the project — catalogue coverage — and it introduces the largest ranking
risk in this document. **This section is binding on the catalogue migration and it is not
negotiable on schedule grounds.**

### The problem, stated exactly

`fabryka-shkur.com.ua` **stays online.** It is not being retired, redirected or de-indexed. If the
new site publishes the same product text, there are two live pages, on two live domains, saying
the same sentences about the same category of product, competing for the same queries.

Google resolves that competition by picking one. The factors it picks on — domain age, accumulated
links, crawl history, existing rankings, trust — are precisely the factors a brand-new domain has
none of. **The new site loses, every time, on every duplicated page.** This is not a penalty and
nobody gets a manual action; it is simply the outcome of a selection process running on two inputs
where one is strictly stronger.

Three consequences follow, and they compound:

1. **The duplicated pages do not rank.** They may not even be indexed — Google routinely declines
   to index a page it has decided is a duplicate of a canonical elsewhere, which shows up in
   Search Console as "Duplicate, Google chose a different canonical than the user" against a URL
   nobody else on the team knows to look for.
2. **The duplication is a site-wide quality signal, not a per-page one.** A domain whose catalogue
   is largely a copy of another domain's catalogue is a thin-content domain. That assessment
   affects pages that were written fresh, including the editorial content in §29.13 that the whole
   cold-start plan depends on.
3. **It squanders the one genuine advantage.** The Яворів positioning (§29.13) only exists in the
   words. Copied text describes a different workshop in a different village, so it cannot carry the
   place claim, and the strongest keyword asset on the project goes unused on every page that
   matters commercially.

### The binding rules

| Asset | Rule | Rationale |
|---|---|---|
| **Product descriptions** | **Rewrite every one. No sentence copied verbatim.** Not paraphrased-by-synonym — rewritten from the product's actual attributes, in the brand voice, with the Yavoriv provenance where it applies | The only asset class where duplication is directly and reliably punished. This is a real content workload of several hundred to a thousand items ([00-client-decisions-2.md](00-client-decisions-2.md) E5) and it belongs in the roadmap as such |
| **Product names** | **Rename where they overlap.** A distinct name is also a better brand asset — «Ліжник Яворівський» beats a generic name two sites share | Two identical product names on two domains make an exact-match query ambiguous and hand it to the older domain. A distinct name is a term the new site can own outright |
| **Category and filter text** | New, written to the D3 structure. Category intros (§29.5) are authored per category and never templated | Category pages are where the §29.13 place strategy is expressed. A copied intro cannot do that job |
| **Blog and care-guide articles** | **Never copied.** Written fresh per [22-blog-specification.md](22-blog-specification.md) §22.3 | Editorial content is the cold-start traffic plan. A copied article is worse than no article, because it dilutes the domain without ranking |
| **Meta titles and descriptions** | Generated by the §29.4 templates from the rewritten fields. CI already asserts uniqueness within the site; the same discipline applies against the source site | A copied description shows the other business's positioning in this site's SERP snippet |
| **FAQ answers** | Written fresh. They feed `FAQPage` (§29.6) and are the highest-value extraction surface for AI assistants ([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.6) | — |
| **Photographs** | **Reuse permitted**, after the processing pipeline in §29.11: re-crop, re-grade, strip EXIF, semantic filename, new `alt` and `caption` per locale | Identical images across two domains are a weaker signal than unique ones, but images are deduplicated rather than penalised. The asymmetry with text is real and it is why this row says "permitted" and the first row says "rewrite every one" |
| **Reviews** | **Never copied. No exceptions.** | Three independent reasons, each sufficient — see below |

### Why reviews are the hardest line

Copying reviews is the most tempting shortcut in the list, because a new store with zero reviews
looks unproven and there is a library of real, positive testimonials sitting on a site the client
controls access to. It is still forbidden, for three reasons that do not depend on each other:

1. **They were given to a different seller.** A customer wrote about a transaction with the
   adjacent business, about goods from a different workshop. Republishing that as this business's
   review is a factual misrepresentation to the next customer, whatever the family relationship
   between the two businesses.
2. **It is a structured-data violation.** `Review` and `AggregateRating` markup asserts that these
   are reviews of *this* entity's products. Google treats fabricated, transplanted or aggregated
   third-party review markup as a policy violation, and self-serving review markup is one of the
   small number of things manual actions are issued for (§29.6).
3. **It cannot be verified and therefore cannot count.** §29.6 emits `AggregateRating` only from
   `APPROVED` reviews with `isVerifiedPurchase = true`, which requires an `Order` row on this
   system. An imported review can never satisfy that, so it buys the appearance of social proof
   while contributing nothing to the star rating it was copied for. The effort produces the risk
   without the benefit.

The honest path is the slow one: §29.16's review request in the delivery email, and asking
workshop visitors in person. The first genuine verified review is worth more than fifty
transplanted ones, because it is the one that unlocks the markup.

### Enforcement

Rules that live only in a document get broken by whoever is entering the catalogue at 11pm in week
three of the migration. These are mechanical:

1. **A similarity check at import.** The migration tool holds the source text for each product and
   refuses to mark a product `PUBLISHED` while its description exceeds a similarity threshold
   against the source string. Shingle-based similarity (n-gram overlap) is sufficient and takes an
   afternoon to write; the point is that the gate is automatic and the threshold is a number
   someone had to argue with.
2. **The source text is stored, then discarded.** It is kept in a migration-only staging column for
   the comparison and is deleted when the catalogue is signed off, so it can never be surfaced by a
   later query or accidentally rendered.
3. **A pre-launch sampling check** (§29.15 checklist): 30 random published products, each searched
   as an exact-phrase query against the source domain. Any hit is a defect and blocks launch.
4. **Monthly post-launch monitoring** for the first six months (§29.17): exact-phrase spot checks,
   plus Search Console's "Duplicate, Google chose a different canonical" report, which is where
   this failure mode actually surfaces.
5. **No `canonical` pointing at the other domain, ever.** It would be a technically valid way to
   resolve a duplicate and it would cede the ranking permanently. The resolution is rewriting, not
   canonicalising.

### What this costs, stated plainly

Rewriting several hundred to a thousand product descriptions in `uk`, then translating the
published subset into `en`, `pl` and `de` (§30.12's sequencing applies — `uk` complete first), is
the single largest content line item in the project. It is larger than the photography now that
E5 has descoped the catalogue shoot.

It is also not optional, and the failure mode of skipping it is invisible for about three months
and then permanent. A site that launches with copied text does not get a warning; it simply never
ranks, and by the time anyone diagnoses why, the catalogue has to be rewritten anyway — with
three months of lost indexation on top.
