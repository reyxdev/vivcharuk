# 28 — State Management Architecture

State is where well-structured applications usually go wrong, because state bugs are the hardest
class to see in review: everything renders, and the wrong thing is on screen. This document fixes
the rules before any of it is written.

> **Authority note.** Revised in the consistency audit against
> [00-client-decisions-4.md](00-client-decisions-4.md) and
> [00-client-decisions-3.md](00-client-decisions-3.md), which outrank this document. The §E12
> consequences below were already carried and stand unchanged. Two later rulings reach this
> layer: **F4's enquiry-then-invoice model for international orders** adds a server state the
> buyer waits on and an admin mutation that writes a price (§28.2.2, §28.2.4), and **G2's
> `OrderStatus.IN_PRODUCTION`** extends how long that waiting lasts. The SSR framework name is
> also corrected to **React Router v7 framework mode** per
> [00-README.md](00-README.md)'s resolved conflict.

It obeys [00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md), and consumes
[26-api-architecture.md](26-api-architecture.md) as its server contract.

**One ruling shapes this document more than any other.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent: there
are no customer accounts, ever. That deletes an entire state family — customer session, customer
refresh token, customer profile and address queries, and the wishlist merge-on-login buffer. What
remains is one authenticated subject (staff), one server-authoritative mutable resource (the
cart), and a wishlist that never leaves the device. Every simplification below traces back to
that single decision.

## 28.1 The core principle

**Server state and client state are different problems and must not share a store.**

| | Server state | Client state |
|---|---|---|
| Owner | Postgres | This browser tab |
| Truth | Remote; the local copy is a cache | Local; there is no remote copy |
| Lifecycle | Fetched, expires, refetches, can fail | Set, read, discarded |
| Concurrency | Another user or the admin may change it mid-session | Nobody else can touch it |
| Examples | Products, cart contents, orders, reviews, facets | Drawer open, filter panel expanded, toast queue, recently viewed |

The classic mistake is a global store holding both: a `products` array next to an `isCartOpen`
boolean. Everything that follows from that is grief. The array needs loading flags, error flags,
staleness tracking, refetch-on-focus, deduplication and cache eviction, and all of it gets
hand-written, badly, one reducer at a time. Meanwhile the boolean is trivial and now lives inside
machinery built for the array.

Two layers, each with the tool designed for it:

| Layer | Tool | Holds |
|---|---|---|
| Server state | **TanStack Query v5** | Everything the API owns |
| Client state | **Zustand** | Everything only this tab knows |
| Shareable state | **The URL** | Anything linkable or indexable (§28.5) |
| Form state | **React Hook Form + Zod** | In-progress input, until submit (§28.6) |

A fifth store does not exist. If a piece of state does not fit one of these four, the modelling is
wrong, not the toolkit.

## 28.2 The server-state layer

### 28.2.1 The query-key factory

Keys are never written as inline array literals. Every feature owns one factory, and the factory
is the only place a key shape exists.

```ts
// features/catalog/api/keys.ts
export const catalogKeys = {
  all:        ['catalog'] as const,
  categories: (locale: Locale) => [...catalogKeys.all, 'categories', locale] as const,
  category:   (locale: Locale, slug: string) => [...catalogKeys.categories(locale), slug] as const,
  lists:      () => [...catalogKeys.all, 'list'] as const,
  list:       (locale: Locale, f: ProductListFilters) => [...catalogKeys.lists(), locale, f] as const,
  details:    () => [...catalogKeys.all, 'detail'] as const,
  detail:     (locale: Locale, slug: string) => [...catalogKeys.details(), locale, slug] as const,
  availability: (slug: string) => [...catalogKeys.details(), slug, 'availability'] as const,
  facets:     (locale: Locale, categorySlug: string) => [...catalogKeys.all, 'facets', locale, categorySlug] as const,
};
```

Three properties make this worth the ceremony. **Keys are hierarchical**, so
`invalidateQueries({ queryKey: catalogKeys.lists() })` invalidates every listing regardless of
filters, without enumerating them. **Locale is in every key**, so switching to `de` cannot serve
`uk` data from cache, and a fallback response (§26.6) is cached separately from a real
translation. **Filters are in the key as an object**, and TanStack Query hashes it stably, so two
components requesting the same filtered list share one request.

### 28.2.2 Freshness per data class

`staleTime` is how long the data is trusted without a background refetch. `gcTime` is how long an
unused cache entry survives. Both are set per class because a category tree and a stock count are
not the same kind of fact.

| Data class | `staleTime` | `gcTime` | Refetch on focus | Reasoning |
|---|---|---|---|---|
| Category tree, navigation, public settings | 1 h | 24 h | no | Changes on an editorial cadence; matches the CDN TTL in §26.13.1 |
| Product listing, facet counts | 5 min | 30 min | no | Mirrors `s-maxage=300`. A shopper scrolling a category does not need a refetch. |
| Product detail | 5 min | 30 min | no | Same |
| Live availability | 0 | 1 min | **yes** | The one-of-one handmade case ([00-assumptions.md](00-assumptions.md) B4) makes stale stock a broken promise |
| Cart | 0 | 5 min | **yes** | Server-authoritative and mutable from another tab (§28.4) |
| Guest order lookup (`guestToken` or order number + email) | 30 s | 5 min | yes | A status changes while the customer is watching the page. There is no order *list* query — a guest can only ever resolve the one order they hold a token for (§E12). |
| Guest order in `AWAITING_QUOTE` | 60 s | 5 min | **yes** | The one query whose *next* value is produced by a human rather than by a machine ([00-client-decisions-3.md](00-client-decisions-3.md) F4). 60 s rather than 30 s because the wait is measured in hours, and refetch-on-focus is what actually delivers the update — a buyer returning to the tab is the realistic trigger. **No polling interval**: a page that polls for hours is a battery cost with no corresponding chance of success, and the quote email is the primary channel. |
| Guest order in `IN_PRODUCTION` | 5 min | 30 min | yes | [00-client-decisions-4.md](00-client-decisions-4.md) G2: a made-to-order item sits here for **14 days**. Nothing changes minute to minute, and the order page renders the expected dispatch **date** rather than a countdown, so a short `staleTime` would buy nothing |
| Reviews | 5 min | 30 min | no | |
| Blog, pages, gallery | 1 h | 24 h | no | |
| Search suggestions | 1 min | 5 min | no | Also debounced 250 ms at the input |
| Admin lists | 0 | 2 min | yes | Staff act on what they see; a stale order queue causes a double-pack |
| Admin audit log | 0 | 1 min | yes | Append-only, always read fresh |

`retry` is 2 with exponential backoff for `GET`, and **0 for every mutation**. Silently retrying a
`POST` is how one click becomes two orders. Idempotency on checkout (§26.11) makes a *deliberate*
retry safe; automatic retry is still wrong because the user has not been told anything happened.

### 28.2.3 Prefetching

Four prefetch points, each paid for by a measurable improvement:

1. **SSR dehydration.** The React Router route `loader` runs the query server-side through the in-process
   service call (§26.3.3) and dehydrates the cache into the HTML. The client hydrates with data
   already present, so a server-rendered product page performs zero fetches on mount. This is what
   makes SSR and TanStack Query complementary rather than duplicative.
2. **Hover and focus intent on product cards.** 120 ms after pointer enter or keyboard focus,
   prefetch `catalogKeys.detail`. Keyboard focus is included deliberately: hover-only prefetch
   gives mouse users a faster site than keyboard users, which contradicts
   [08-design-system.md](08-design-system.md) §8.2 principle 3.
3. **Next listing page** when the last row of the current page enters the viewport.
4. **Checkout step N+1** when step N validates, so shipping methods are resolved before the
   shipping step renders.

Prefetching is disabled when `navigator.connection.saveData` is true or `effectiveType` is `2g`,
matching the thermal and battery guard in [13-motion-system.md](13-motion-system.md) §13.7.
Speculative fetching on a metered connection spends someone else's money.

### 28.2.4 The invalidation map

Every mutation declares exactly what it invalidates. Written down, because "invalidate everything"
destroys the cache and "invalidate nothing" shows stale data, and the middle is only reachable by
being explicit.

| Mutation | Invalidates | Also |
|---|---|---|
| Add / update / remove cart item | `cartKeys.detail()` | Optimistic update first (§28.4); server response replaces cache |
| Apply / remove coupon | `cartKeys.detail()` | No optimistic update: discount maths is server-only |
| Create order | `cartKeys.detail()` | Clears the cart cache entirely; resets checkout store. No order-list key to invalidate — see below. |
| Cancel order | `orderKeys.byToken(guestToken)` | |
| Submit review | `reviewKeys.list(productId)` | Not `catalogKeys.detail`: the review is `PENDING` and changes no aggregate |
| Toggle wishlist | **Nothing** | The wishlist is `localStorage` only (§28.3). There is no query, no mutation and no server record to invalidate. |
| Staff login | **`queryClient.clear()`** | Then refetch. Nothing from the pre-login state may survive. |
| Staff logout | **`queryClient.clear()`** | Non-negotiable: a shared back-office machine must not leak the previous session |
| Admin: product create / update / publish | `catalogKeys.all`, `adminKeys.products()` | Plus the server-side CDN purge (§26.13.3) |
| Admin: category change | `catalogKeys.all` | Nav and facets both depend on it |
| Admin: order status change | `adminKeys.orders()`, `adminKeys.order(id)` | |
| Admin: issue / re-issue / withdraw an international quote | `adminKeys.orders()`, `adminKeys.order(id)`, **`adminKeys.quoteQueue()`** | Never optimistic (§28.10): the mutation writes `shippingMinor` and rewrites `totalMinor` on an order the customer will be asked to pay. The queue key is invalidated separately because the row **leaves** the `AWAITING_QUOTE` queue, and a stale queue is how one order gets quoted twice by two people ([24](24-employee-permission-architecture.md) §24.4, `orders.quote`) |
| Admin: review moderation | `adminKeys.reviews()`, `reviewKeys.list(productId)`, `catalogKeys.detail(slug)` | Approving a verified review moves the aggregate (§25.6) |
| Admin: media upload | `adminKeys.media()` | |
| Admin: bulk import commit | `catalogKeys.all`, `adminKeys.all` | It may have touched anything |

Three entries carry most of the risk.

`queryClient.clear()` on both staff login and staff logout is absolute: partial invalidation after
an auth change is the bug that shows one staff member another's scoped view. The rule survives the
removal of customer accounts because the admin panel still has a real authenticated subject — and
because a back-office workstation is more likely to be shared than a shopper's phone.

Review moderation invalidating the **product** detail is the non-obvious one, and it is why this
table exists rather than living in each developer's head.

The **absence** of an `orderKeys.lists()` invalidation is itself a design statement. With no
customer accounts there is no "my orders" collection to keep warm; the only order a visitor can
read is the one addressed by their `guestToken` or resolved through the order-number + email
lookup (§26.10.5). A list key would have to be scoped to an identity that does not exist, and an
unscoped one would be an enumeration hole.

## 28.3 The client-state layer

Zustand, one slice per file, no root store, no provider. Each slice is a hook; components
subscribe to selectors, never to whole slices, so a toast never re-renders the filter panel.

| Slice | Holds | Why it is client state, not server state |
|---|---|---|
| `cartUiStore` | `isDrawerOpen`, `lastAddedLineId`, `isMiniCartPulsing` | Whether a drawer is open is not a fact about the business. Two tabs may legitimately disagree. |
| `filterUiStore` | Which facet groups are expanded, mobile filter sheet open, pending-before-apply selections on mobile | The *values* are URL state (§28.5); this is only the panel's presentation. Mobile applies filters on a button press, so a pending buffer is needed and it is never shareable. |
| `searchOverlayStore` | `isOpen`, raw input string, highlighted suggestion index | The overlay is a transient interface. Results are server state; the open state is not. |
| `localeStore` | Active locale, whether it was auto-detected, whether the switch banner was dismissed | Locale itself lives in the URL; this slice holds the *negotiation memory* so a visitor is not offered the same suggestion on every page. |
| `recentlyViewedStore` | Up to 12 `{ productId, slug, viewedAt }`, persisted | Deliberately never sent to the server. Building a server-side browsing history for a guest-first shop creates a GDPR obligation ([00-README.md](00-README.md) locale scope) in exchange for a rail nobody asked for. |
| `wishlistStore` | Wishlist product ids, persisted to `localStorage`. **This slice is the only copy that exists anywhere.** | There is no account to own a server-side wishlist ([00-client-decisions-2.md](00-client-decisions-2.md) §E12), and `WishlistItem` is removed from the schema ([25](25-database-schema.md) §25.8b). The UI must state the consequence — «Збережено на цьому пристрої» — rather than let a list silently fail to appear on a second device. |
| `toastStore` | Queue of `{ id, kind, message, duration }` | Notifications are pure presentation with a lifetime measured in seconds. |
| `checkoutStore` | Current step, per-step completion, chosen shipping method id, `Idempotency-Key` | The key must survive a step back and a retry within the session and must never be regenerated (§26.11). Form values themselves belong to React Hook Form. |
| `consentStore` | Cookie-consent decision per category, persisted | Must be readable synchronously before analytics initialises (§28.7). |

`checkoutStore` earns its place on one field. The `Idempotency-Key` is generated once when
checkout begins and reused for every retry. Holding it in component state would regenerate it on a
remount and defeat the entire idempotency design; holding it in the query cache would be a
category error, since it is not server data.

Deliberately **absent**: cart contents, product data, auth user object, form field values. Each is
owned by another layer.

## 28.4 The cart: server-authoritative, felt as instant

The cart is the hard case. It is server state, because stock, price, coupons and the free-shipping
threshold are server facts, and it must feel instantaneous, because a cart that lags after a click
reads as broken.

**Design: optimistic update against the query cache, reconciled by the server's complete
response.** Not a parallel client cart, which is the common shortcut and always ends with the
mini-cart badge and the checkout total disagreeing.

```ts
const addItem = useMutation({
  mutationFn: (input: AddCartItemInput) => api.post('/v1/cart/items', input),

  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: cartKeys.detail() });
    const previous = queryClient.getQueryData<CartResponse>(cartKeys.detail());
    queryClient.setQueryData<CartResponse>(cartKeys.detail(), (c) =>
      c ? applyOptimisticAdd(c, input) : c);
    return { previous };
  },

  // Full rollback to the exact prior object. Not a reverse-patch: a reverse
  // patch has to be correct for every intermediate state, and eventually is not.
  onError: (err, _input, ctx) => {
    if (ctx?.previous) queryClient.setQueryData(cartKeys.detail(), ctx.previous);
    toast.error(translateApiError(err));
  },

  // The server's cart is the truth, always, including prices we guessed.
  onSuccess: (serverCart) => queryClient.setQueryData(cartKeys.detail(), serverCart),
  onSettled: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }),
});
```

Rules that make this safe:

1. **Optimistic maths covers only what the client can know**: the line appears, the quantity
   changes, the subtotal moves by `unitPriceMinor × quantityMilli / 1000`. Discounts, shipping and
   the free-shipping remainder are **never** guessed. They render as a skeleton for the roughly
   200 ms the round trip takes, per [08-design-system.md](08-design-system.md) §8.8.
2. **Every mutation returns the whole cart** (§26.10.3), which is what makes reconciliation a
   single assignment rather than a merge algorithm.
3. **Mutations are serialised per cart.** Concurrent `PATCH`es on two lines would each snapshot a
   stale `previous`, and a rollback would resurrect a removed line. A one-slot mutation queue
   keyed on the cart removes the interleaving entirely.
4. **Server correction is silent when favourable and explicit when not.** A quantity clamped from
   3 to 1 because only one skein remains produces a toast and the corrected line. A cart that
   quietly holds a different number than the user typed is worse than an error.
5. **Refetch on window focus.** A cart edited in a second tab, or a reservation expiring
   (§26.17), must not leave a stale total on screen.

## 28.5 The URL as state

**Anything shareable, bookmarkable, indexable or restorable by the back button lives in the URL
and nowhere else.**

| In the URL | In a store |
|---|---|
| `?filter[size]=150x200`, `?origin=OWN_MANUFACTURE`, `?priceMin=`, `?inStock=` | Which facet group is expanded |
| `?sort=price_asc` | Whether the sort dropdown is open |
| `?page=3` | Scroll position |
| `?q=ліжник` on the results page | The search overlay's transient input |
| `/uk/…`, `/de/…` locale prefix | Whether the locale banner was dismissed |
| `?variant=<id>` on a PDP | Which gallery image is active |

The reasons are concrete, not stylistic:

- **Shareability.** A customer sends a friend a filtered view. Filters in a store produce a link
  to an unfiltered page, which is a silent failure: the recipient sees products and never knows
  they are the wrong ones.
- **Indexability.** [29-seo-architecture.md](29-seo-architecture.md) decides which filter
  combinations are canonical and indexable. A combination with no URL cannot be canonicalised, and
  a cold-start domain ([00-client-decisions.md](00-client-decisions.md) D2) cannot spare a single
  indexable long-tail page.
- **SSR.** The server renders from the request URL and nothing else. State living in a store is
  invisible to the server, so a filtered listing would render unfiltered and then flicker.
- **The back button.** Browser history is URL history. Filters in a store make Back leave the page
  rather than undo the filter, which is the single most reported complaint about faceted SPAs.

Implementation: one `useFilterUrlState` hook owning read and write. Writes use `replace` for
same-page refinement, so ten facet clicks leave one history entry rather than ten, and `push` for
page and sort changes, which users do expect to undo. Parameters are parsed through the same Zod
schema the API uses (§26.7.2), so a hand-edited URL is rejected the same way a malformed request
is, and a query key derived from parsed values is stable across parameter reordering.

## 28.6 Form state

React Hook Form, uncontrolled by default, with `zodResolver` over the shared schema
([27](27-folder-architecture.md) §27.12).

Uncontrolled inputs matter here specifically: the checkout address form has roughly fifteen
fields, and controlled inputs re-render the whole form on every keystroke. On the mid-range
Android baseline ([13](13-motion-system.md) §13.5) that is visible input lag on the highest-value
screen in the product.

- **One schema, two uses.** `checkoutInput` is the resolver and the request body. The browser
  rejects exactly what the server would reject, without duplicated rules.
- **Validation timing follows [08](08-design-system.md) §8.6**: `mode: 'onTouched'` then
  `reValidateMode: 'onChange'`. First check on blur, then live once a field is known bad.
- **Server errors map onto fields for free.** `fieldErrors[].path` (§26.8) is the Zod issue path,
  fed straight into `setError`. No translation layer, no mapping table.
- **Form state never leaves the form.** Multi-step checkout keeps one form instance across steps
  rather than mirroring values into a store. Step position is `checkoutStore`; values are not.
- **Autosave for long admin forms only**, debounced 2 s to `sessionStorage`, restored with an
  explicit prompt. Never on storefront forms: silently restoring a half-finished order into a
  later session is alarming rather than helpful.

## 28.7 Persistence

| Where | What | Why there |
|---|---|---|
| **httpOnly cookie** | `Cart.token`, staff refresh token, CSRF token | Unreachable from JavaScript, so an XSS that runs cannot steal them |
| **Readable cookie** | Locale preference, consent decision, checkout address prefill | The SSR layer must read the first two **before** rendering, which rules out `localStorage`. The prefill cookie is the §E12 replacement for a saved-address book: same-device convenience, no server-side profile. |
| **`localStorage`** | Recently viewed, the wishlist, dismissed banners, admin table column preferences | Survives a browser restart, is non-sensitive, and is never authoritative |
| **`sessionStorage`** | Admin form autosave, checkout step scroll restoration | Should not outlive the tab |
| **In memory only** | Access tokens, the query cache, every Zustand slice not explicitly persisted | The default, and the safest |

Nothing personally identifying goes to `localStorage`. Recently-viewed and the wishlist hold
product ids, not names or images: a shared machine should not display what the previous user
browsed or saved.

The checkout prefill cookie is the one place where personal data is persisted client-side, and it
is deliberately scoped: name, phone, city and carrier branch, first-party, `SameSite=Lax`, 90-day
expiry, consent-gated as non-essential, and cleared by an explicit «Забути мої дані» control on
the checkout form. It is a convenience for the same person on the same device, not an identity.
Without customer accounts this is the entire repeat-purchase affordance, so it has to be both
useful and obviously disposable.

**Consent and the `de` locale.** GDPR distinguishes storage that is strictly necessary from
storage that is not, and consent is required before writing the second kind. The cart cookie, the
locale cookie, the CSRF token and the consent record itself are strictly necessary and are written
without a banner. Recently viewed, the wishlist, the checkout prefill cookie and every analytics
identifier are not, and are gated on consent.

Two consequences follow, and both are structural rather than cosmetic:

1. **Every non-essential write goes through one gate.** `persistIfConsented(category, write)` is
   the only path to `localStorage` for those slices, enforced by an ESLint rule banning direct
   `localStorage` access outside `lib/storage.ts`. A scattered opt-in check is a scattered
   compliance failure.
2. **The site must be fully usable with consent refused.** Browse, filter, add to cart, check out
   and pay all work. Only the recently-viewed rail, the wishlist and the address prefill
   disappear, and their empty states explain why rather than appearing broken.

The gate applies in all four locales, not only `de`. Running one consent model is less code than
running two, and Ukrainian and Polish visitors are not worse served by it.

## 28.8 Hydration and SSR-mismatch avoidance

Server-rendered HTML and the client's first render must produce identical trees, or React discards
the server output and re-renders, which costs exactly the LCP advantage §26.3 exists to buy.

Banned during render, enforced by an ESLint rule scoped to `pages/` and `features/`:

| Banned | Why | Instead |
|---|---|---|
| `Date.now()`, `new Date()` | Server and client clocks differ | Pass a server timestamp as a prop; format in `useEffect` |
| `Math.random()`, `crypto.randomUUID()` | Different every run | `useId()` |
| `window`, `document`, `navigator` | Absent on the server | `useEffect`, or `useSyncExternalStore` with a server snapshot |
| `localStorage`, `sessionStorage` | Same | `useEffect`, accepting one frame of default state |
| `matchMedia` | Same | `useMediaQuery` returning the SSR default first |

Persisted Zustand slices are the sharpest edge, because the server cannot know what is in
`localStorage`. The rule: a persisted slice renders its **initial** value on the server and on the
first client render, and rehydrates in an effect. The recently-viewed rail therefore renders empty
in the server HTML and fills after hydration. Accepted deliberately: it is below the fold, it is
not indexable content, and forcing it to match would mean either blocking render or client-only
rendering the whole page.

`prefers-reduced-motion` is handled by the CSS backstop in
[13-motion-system.md](13-motion-system.md) §13.6 rather than by a JavaScript branch, precisely
because a media query cannot be read on the server. The CSS approach has no mismatch to avoid.

The TanStack Query cache hydrates from the dehydrated SSR payload before the first render, so
queries that were resolved on the server never re-enter a loading state on the client. A product
page that shows a skeleton after arriving fully rendered is the most visible possible symptom of
this being done wrong.

## 28.9 Auth state — staff only

**There is exactly one authenticated subject in this system: a `StaffUser`.** The storefront has
no login, no session and no auth state at all, because
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent. An
earlier revision of this document carried a two-column table comparing customer and staff
sessions; the customer column is deleted rather than emptied, because a vestigial branch is an
invitation to reintroduce the thing it describes.

What this removes, concretely: customer access and refresh tokens, the customer refresh cookie,
the silent-refresh-on-load path for shoppers, `queryClient.clear()` on customer login and logout,
credential-stuffing exposure on a public login form, and customer password storage
(`Customer.passwordHash` is gone from [25](25-database-schema.md) §25.6). That is the largest
single reduction in security surface anywhere in this blueprint, and it was bought by a product
decision rather than by engineering.

### What a storefront visitor has instead

| Concern | Mechanism | State layer |
|---|---|---|
| Identity | **None.** The visitor is anonymous for the whole session. | — |
| Cart continuity | `Cart.token` in an httpOnly cookie | Server state (§28.4) |
| Order access after purchase | `Order.guestToken`, delivered in the confirmation email, plus an order-number + email lookup form (§26.10.5) | Server state, keyed on the token — never cached under an identity |
| Repeat-purchase convenience | First-party address-prefill cookie, same device only (§28.7) | Readable cookie |
| Wishlist | `localStorage`, device-local | `wishlistStore` (§28.3) |
| Marketing consent | Checkout checkbox writing to `NewsletterSubscriber` | Form state, submitted once |

The `guestToken` is a bearer credential, so it is treated as one: it is read from the URL on the
tracking page, held in memory for the life of that page, and **never** written to `localStorage`
or into a query key that is persisted. Caching an order response under a key containing a bearer
token would survive in the browser long after the tab that legitimately held it.

### The staff session

| | Staff |
|---|---|
| Access token | JWT, 15 min, **in memory only** |
| Refresh token | httpOnly, `Secure`, `SameSite=Strict`, 12 h, rotating |
| Cookie path | `ADMIN_BASE_PATH` |
| Server record | `StaffSession` row (§25.7): IP, user agent, `lastSeenAt`, revocable |
| Permissions | Resolved permission-key set, `DENY` beating `ALLOW` ([24](24-employee-permission-architecture.md) §24.4) |
| On refresh failure | Immediate redirect to login |

**Why the refresh token is an httpOnly cookie and not `localStorage`.** `localStorage` is readable
by any JavaScript on the origin. One XSS, from a dependency, an inline third-party script or a
mis-sanitised review body, and a long-lived refresh token is exfiltrated and usable from the
attacker's machine. An httpOnly cookie is not readable by script at all: the same XSS can make
requests as the user while it runs, but it cannot take the credential away with it. That
difference, between a session-length compromise and an open-ended one, is the entire argument. The
access token lives in memory for the same reason, and its fifteen minutes bound the damage if it
is captured. The stakes here are higher than they were for a customer token, since a staff token
can reach order data, payouts and the audit log.

**Rotation with reuse detection.** Every refresh issues a new refresh token and invalidates the
old one. A previously used token presented again means it was stolen and replayed, so the whole
token family is revoked and every `StaffSession` row for that user is marked `revokedAt`. Silent
revocation of one token would let the attacker and the operator take turns.

**CSRF.** Cookie-borne credentials require it. The refresh endpoint is `POST`-only with a
double-submit token, and `SameSite=Strict` on the staff cookie makes cross-site refresh
impossible. `Strict` is affordable here precisely because no staff flow returns from a third-party
redirect — the PSP return leg (§26.10.4) belongs to the storefront, which carries only the cart
cookie, and that cookie is `Lax` for exactly this reason.

**Client shape.** `useStaffAuth()` reads a small in-memory store holding the decoded subject,
expiry and permission set; the admin API client refreshes on `401` once, queues concurrent
requests behind that single refresh, and replays them. The store is not persisted, is cleared on
logout alongside `queryClient.clear()` (§28.2.4), and is rehydrated on load by a single silent
refresh call. That call produces a brief indeterminate state, rendered as a skeleton rather than
as a logged-out shell that flips to logged-in. **This hook does not exist in the storefront
bundle** — it lives under the admin route group ([27](27-folder-architecture.md)) so that no
storefront code path can import an auth concept the storefront does not have.

## 28.10 Optimistic UI and rollback

Optimism is applied only where the client can predict the outcome with near-certainty and the
value is immediate feedback.

| Action | Optimistic | Why |
|---|---|---|
| Add / update / remove cart line | Yes | Predictable, high-frequency, and latency is felt as breakage |
| Wishlist toggle | **Not applicable** | There is no request to be optimistic about. The write is synchronous to `localStorage` (§28.3), so the state is already true the instant it is set. |
| Review helpful vote | Yes | No consequence worth a spinner |
| Apply coupon | **No** | Validity, stacking and minimum-subtotal rules are server-only. A promise then withdrawn is worse than a 300 ms wait. |
| Place order | **No** | Never optimistically confirm money. |
| Any admin mutation | **No** | Staff need to know a change persisted. An optimistic admin row that silently rolls back is how stock counts drift. |

The rollback pattern is uniform: snapshot the exact prior cache object in `onMutate`, restore it
wholesale in `onError`, reconcile from the server response in `onSuccess`, invalidate in
`onSettled`. Never a reverse-patch, which must be correct for every intermediate state and
eventually is not.

Failure is always visible. A rolled-back action shows a toast naming what failed and why, in the
active locale, translated from `error.code` rather than from `error.message` (§26.8). A silent
rollback leaves a user who believes the action succeeded, which is the worst outcome available.

## 28.11 Real-time: assessed, and declined

The honest assessment: **no websockets, and polling in exactly two narrow places.**

| Candidate | Verdict |
|---|---|
| Live stock on a PDP | No. A five-minute `staleTime` plus a live `availability` check on focus and before add-to-cart (§26.10.1) covers the real failure, which is overselling a unique piece. A websocket would add a persistent connection per browsing visitor to save a request per page view. |
| Live admin order feed | No. `staleTime: 0` with refetch on focus, plus a 60 s interval while the orders tab is visible. At this order volume a staff member's tab focus is a better trigger than a socket. |
| Order status for the customer | **Polling, bounded.** The post-payment return page polls the guest-token status endpoint every 2 s for 60 s while waiting for the WayForPay webhook (§26.14.1), then falls back to "we will email you". This is the only place where the user is actively staring at a screen waiting for an asynchronous server event, and with no account there is no inbox-equivalent in the UI to fall back to. |
| International shipping quote | **No.** The wait is hours or a working day ([00-client-decisions-3.md](00-client-decisions-3.md) F4), not seconds, and the customer is not staring at the screen. The quote arrives by email; the order page refetches on focus (§28.2.2) for the buyer who comes back to check. Polling for a human's response is the clearest case in this table of a socket solving the developer's problem rather than the user's. |
| Carrier tracking | **Polling, server-side.** The 30-minute job in §26.17, not a client concern. |
| Cart synchronised across tabs | No socket. A `BroadcastChannel` listener invalidates the cart query in sibling tabs, which is free and needs no server. |

Websockets would mean a stateful connection layer, sticky sessions or a pub/sub backplane, a
reconnection and backoff strategy, and an authentication story for the socket itself. That is a
meaningful share of the infrastructure budget to solve problems that refetch-on-focus already
solves at this scale. The trigger for revisiting is concrete: sustained concurrent sessions in the
hundreds, or a genuine live-inventory requirement such as auctions or limited drops. Neither is on
the roadmap.

## 28.12 Debugging and devtools

| Tool | Where | Purpose |
|---|---|---|
| TanStack Query Devtools | Storefront and admin, development only, lazy-imported | Cache contents, key shapes, fetch status, stale boundaries |
| Zustand devtools middleware | Every slice, development only | Named actions in the Redux DevTools timeline |
| React Hook Form DevTools | Admin forms and checkout, development only | Dirty and touched state, validation timing |
| `x-request-id` in the network panel | Both, all environments | Joins a browser request to a server log line and a Sentry event (§26.18) |
| Storefront state banner | Development only, `Ctrl+Shift+D` | Active locale, cart id, query cache size, consent state, flags |

Every devtool is behind `import.meta.env.DEV` and dynamically imported, so none of it reaches a
production bundle. Query Devtools alone is roughly 40 KB, which against the budgets in
[13-motion-system.md](13-motion-system.md) §13.5 would be an unforced error.

Zustand slices name their actions (`cartUi/openDrawer`) rather than mutating anonymously, because
a timeline of `anonymous` entries is not a timeline. Query mutations carry a `mutationKey` for the
same reason.

Two production-safe affordances survive: the `x-request-id` echo, which is what makes a customer
support report actionable, and a global error boundary that reports to Sentry and renders the
designed error state from [08-design-system.md](08-design-system.md) §8.8, never a stack trace.

## 28.13 Cross-references

| Concern | Document |
|---|---|
| Guest checkout, no customer accounts, wishlist ruling | [00-client-decisions-2.md](00-client-decisions-2.md) §E12 |
| Endpoint contracts, error envelope, caching | [26-api-architecture.md](26-api-architecture.md) |
| Staff roles, permission resolution, `DENY` precedence | [24-employee-permission-architecture.md](24-employee-permission-architecture.md) |
| Where stores, hooks and keys live | [27-folder-architecture.md](27-folder-architecture.md) |
| Loading, empty and error state requirements | [08-design-system.md](08-design-system.md) §8.8 |
| Reduced motion and animation budgets | [13-motion-system.md](13-motion-system.md) §13.5, §13.6 |
| Indexable filter combinations | [29-seo-architecture.md](29-seo-architecture.md) |
| Consent-gated analytics | [31-analytics-architecture.md](31-analytics-architecture.md) |
| Token handling and XSS defence | [32-security-architecture.md](32-security-architecture.md) |
