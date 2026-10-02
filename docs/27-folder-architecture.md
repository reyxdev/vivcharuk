# 27 — Folder Architecture

Where code lives is a design decision, not a filing convenience. A structure that makes the wrong
import easy will produce the wrong imports, and no amount of review discipline survives contact
with a deadline. Every rule below is therefore enforced by a tool rather than by agreement.

> **Authority note.** Revised in the consistency audit against
> [00-client-decisions-4.md](00-client-decisions-4.md),
> [00-client-decisions-3.md](00-client-decisions-3.md) and
> [00-client-decisions-2.md](00-client-decisions-2.md), which outrank this document. Two rulings
> changed the tree. **§E12 makes guest checkout permanent**, which deletes the `account/` route
> group, the `account/` storefront feature and the customer-auth surface that went with them
> (§27.3); and **§E1 seeds two Owners, not one** (§27.10). The SSR framework line is also
> corrected: [00-README.md](00-README.md) resolved the Vike / React Router conflict in favour of
> **React Router v7 framework mode**, and this document had not been updated.

This document obeys [00-client-decisions.md](00-client-decisions.md), which cancels the
WooCommerce migration (D2) and makes bulk catalogue entry across four locales the critical path
(D5). There is consequently no `migration/` tree; there is an `import/` module, and it is
first-class rather than temporary. [00-client-decisions-2.md](00-client-decisions-2.md) E5
sharpens rather than softens that: the adjacent business's catalogue may be *reused as a source*,
but every description is re-authored, so `import/` handles a bulk load followed by a long
editorial pass — which is exactly why it is a permanent module and not a script.

## 27.1 Monorepo versus polyrepo

**One repository, npm workspaces, no build orchestrator at launch.**

| Option | Verdict |
|---|---|
| Polyrepo (storefront, admin, api, shared) | Rejected. A change to a Zod schema would become a publish, a version bump and three pull requests. The schema-sharing guarantee in §27.12 is the main defence against client and server drifting, and polyrepo converts it from a compile error into a semver negotiation. |
| Monorepo with Nx | Rejected. Powerful, and it imposes a generator-and-executor model that a three-person team has to learn before it can ship a button. |
| Monorepo with Turborepo | Deferred, not rejected. Adds remote caching and task graphs. Adopt when a cold CI build exceeds two minutes; until then it is configuration nobody reads. |
| **Monorepo, npm workspaces, plain scripts** | **Chosen.** Zero extra tooling, atomic cross-cutting commits, one `npm install`, one lockfile, one CI pipeline. |

The decisive argument is atomicity. Adding `ProductOrigin`
([00-client-decisions.md](00-client-decisions.md) D3) touches the Prisma schema, a Zod schema, an
API serialiser, a filter component and the admin form. In one repository that is one commit that
either compiles or does not. Split across four repositories it is four commits, four reviews and
a window during which the deployed storefront and the deployed API disagree about what a product
is.

npm workspaces rather than pnpm is chosen for one unglamorous reason: npm ships with Node, so a
contractor or a future maintainer needs nothing installed beyond the runtime. pnpm's disk savings
do not outweigh a setup step that can go wrong on someone else's machine.

## 27.2 Top-level tree

```
vivcharyk/
├── apps/
│   ├── storefront/          React Router v7 (framework mode) + Vite. SSG/SSR/CSR per route (26 §26.3)
│   ├── admin/               Vite SPA. Staff panel. Separate build, separate bundle (§27.15)
│   └── api/                 Fastify + Prisma + pg-boss. REST API, SSR data layer, job workers
├── packages/
│   ├── schemas/             Zod schemas + inferred types. The client/server contract (§27.12)
│   ├── tokens/              Design tokens in TS; emits tokens.css + the Tailwind preset (§27.10)
│   ├── ui/                  primitives/, elements/, patterns/ from 08 §8.4. Domain-agnostic
│   ├── i18n/                Message catalogues, locale config, formatters, plural rules
│   └── config/              Shared eslint, tsconfig, prettier, vitest bases
├── prisma/                  schema.prisma, migrations/, seed/ (§27.11)
├── docs/                    This blueprint
├── .github/workflows/       CI: typecheck, lint, test, openapi-drift, lighthouse, token-scan
├── package.json             Workspaces, root scripts only
├── tsconfig.base.json
└── .env.example             Every variable, documented, no values (§27.14)
```

`packages/ui` holds only layers 1 to 3 of the taxonomy in
[08-design-system.md](08-design-system.md) §8.4. `features/` is deliberately absent from it:
feature components know what a product is, and the shared package must not.

## 27.3 Storefront

```
apps/storefront/
├── app/routes/                   React Router v7 file-based routes. One directory per route.
│   ├── _index/                   route.tsx, loader, route config          → SSG (prerendered)
│   ├── catalog.$categorySlug/    → SSR, cached
│   ├── product.$slug/            → SSR, cached
│   ├── blog/…  gallery/…  about/  production/  wholesale/  contacts/
│   ├── cart/  checkout/  order.$number/   → CSR in the SSR shell
│   └── root.tsx  entry.server.tsx  entry.client.tsx  routes.ts
├── src/
│   ├── features/                 The only layer that knows what a product is
│   │   ├── catalog/
│   │   │   ├── components/       ProductCard, ProductGrid, FilterPanel, OriginBadge
│   │   │   ├── hooks/            useProductList, useFacets, useFilterUrlState
│   │   │   ├── api/              queries.ts, keys.ts  (TanStack Query, 28 §28.2)
│   │   │   └── lib/              facetToSearchParams.ts, sortOptions.ts
│   │   ├── product/              gallery, variant selector, spec table, provenance block
│   │   ├── cart/                 drawer, line item, quantity control (piece and weight)
│   │   ├── checkout/             steps, address autocomplete, payment handoff
│   │   ├── reviews/  search/  wholesale/  content/  newsletter/  wishlist/
│   ├── components/               Storefront-wide, domain-agnostic, not yet worth extracting
│   │   └── layout/               SiteHeader, SiteFooter, PageShell, LocaleSwitcher
│   ├── stores/                   Zustand slices, one file each (28 §28.3)
│   ├── lib/                      apiClient.ts, money.ts, dates.ts, seo.ts, motion.ts
│   ├── hooks/                    Cross-feature: useMotionSafe, useMediaQuery, useLockScroll
│   ├── styles/                   tailwind.css entry, imports @vivcharyk/tokens
│   └── types/                    Storefront-only types. Shared types live in packages/schemas
├── public/                       robots.txt, favicons, fonts. Nothing generated.
├── tests/e2e/                    Playwright. Whole-journey specs only.
└── vite.config.ts
```

**What is deliberately absent, and why the absence is structural.**
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent, so
there is no `app/routes/account/` group, no `features/account/`, no customer-auth module and no
customer session code anywhere in `apps/storefront`. This is a deletion, not a disabled feature:
a dormant `account/` directory is an invitation to re-enable a product decision by accident, and
a login form that exists but is unrouted is still an attack surface that appears in the bundle
graph. The four capabilities an account would have carried are each solved elsewhere and are
findable from their own names:

| Capability | Where it lives instead |
|---|---|
| Order history | `app/routes/order.$number/`, addressed by `Order.guestToken` or an order-number + email lookup form. There is no list route, because a list would have to be scoped to an identity that does not exist ([28](28-state-management-architecture.md) §28.2.4) |
| Wishlist | `features/wishlist/` reading `stores/wishlistStore.ts` only. `localStorage`, device-local, **no API module and no `apps/api/src/modules/wishlist/`** — `WishlistItem` is removed from the schema ([25](25-database-schema.md) §25.8b) |
| Saved addresses | A first-party prefill cookie read in `features/checkout/`. No route, no server-side profile |
| Marketing preferences | A checkout checkbox writing to `NewsletterSubscriber`, plus the unsubscribe link in every send |

The `auth/` module under `apps/api/src/modules/` (§27.4) is **staff-only**. It is the entire
identity surface of the product ([24](24-employee-permission-architecture.md)), and it is
imported by `apps/admin`, never by `apps/storefront` — which the boundary rule in §27.6 already
enforces as a build error rather than as a convention.

## 27.4 API

```
apps/api/
├── src/
│   ├── modules/                  One directory per domain. This is the monolith's modularity.
│   │   ├── catalog/
│   │   │   ├── catalog.routes.ts      Fastify route registration, Zod-bound
│   │   │   ├── catalog.service.ts     Business logic. Callable from SSR in process (26 §26.3.3)
│   │   │   ├── catalog.repository.ts  All Prisma access for this module
│   │   │   ├── catalog.serializer.ts  Model → wire shape. Enforces the origin rules (26 §26.10.1)
│   │   │   ├── catalog.cache.ts       Key derivation for purge (26 §26.13.3)
│   │   │   └── catalog.test.ts
│   │   ├── search/  cart/  checkout/  orders/  customers/  reviews/
│   │   ├── content/  leads/  media/  auth/  admin/  import/  webhooks/
│   ├── jobs/                     One file per pg-boss handler (26 §26.17)
│   ├── plugins/                  Fastify plugins: auth, rateLimit, requestId, errorHandler, cors
│   ├── lib/                      prisma.ts, logger.ts, cloudinary.ts, cdn.ts, email/, psp/, np/
│   ├── i18n/                     Server-side error and email message catalogues
│   ├── openapi/                  Registry + emit script (26 §26.19)
│   ├── ssr/                      React Router server entry; imports services directly, never over HTTP
│   ├── app.ts                    Plugin and route composition
│   └── server.ts                 Process entry. ROLE=api | worker | both
└── tests/integration/            Real Postgres via testcontainers
```

Every module exposes exactly one public surface: its `*.service.ts`. Routes are the HTTP adapter,
repositories are the Prisma adapter, serialisers are the wire adapter. A module never imports
another module's repository, because that is how a "small change to the catalogue query" silently
changes what the order confirmation email says a product was called.

## 27.5 Feature versus shared: the exact rule

A component, hook or helper is **shared** when all three hold:

1. It contains no domain vocabulary. It never mentions product, cart, order, lead, variant or
   locale-specific business rules.
2. It is consumed by two or more features, today, not hypothetically.
3. Removing the whole business would not make it meaningless.

Anything failing any of the three lives in the feature that owns it. `ProductCard` mentions a
product, so it is `features/catalog/`, permanently, even though five pages render one. `Accordion`
mentions nothing, is used by the PDP, the FAQ and the filter panel, and would be useful in a
banking app, so it is `packages/ui/patterns/`.

Two anti-patterns this rule closes:

- **Premature extraction.** One consumer is not a pattern. The first `ProductCard` stays local; a
  second consumer prompts a look, not an extraction.
- **The `utils/` drawer.** There is no `utils` directory anywhere in the tree. Helpers live next
  to their consumer or in a named module (`lib/money.ts`, `lib/dates.ts`). A directory whose name
  describes nothing accumulates everything.

Promotion is one-way and explicit: feature to `apps/*/components` when two features in one app
need it, and app to `packages/ui` when both apps do. Demotion never happens, which is why
promotion is deliberate.

## 27.6 Import boundaries, enforced

Conventions written in a README are not enforcement. These are ESLint errors that fail CI.

```js
// packages/config/eslint/boundaries.js
rules: {
  'import/no-restricted-paths': ['error', { zones: [
    // Features are siblings, not a hierarchy. Cross-feature imports are the
    // single fastest way to turn a modular app into one implicit module.
    { target: './src/features/*', from: './src/features/*',
      except: ['./*'], message: 'Cross-feature import. Lift the shared part up, or use its public index.' },

    // The design system may not learn the domain.
    { target: '../../packages/ui', from: './src/features',
      message: 'packages/ui is domain-agnostic. See 08-design-system.md §8.4.' },

    // Shared packages may not import an app.
    { target: '../../packages/*', from: './apps/*' },

    // The storefront may never import server code, Prisma, or a secret-bearing lib.
    { target: './apps/storefront', from: './apps/api',
      message: 'Import from @vivcharyk/schemas instead. Server code must not reach the browser.' },

    // Modules talk through services only.
    { target: './src/modules/*/!(*.service.ts)', from: './src/modules/*',
      except: ['./*'], message: 'Import the other module\'s service, never its repository.' },
  ]}],

  'no-restricted-imports': ['error', { patterns: [
    { group: ['@prisma/client'], message: 'Only apps/api/src/lib/prisma.ts and repositories may import Prisma.' },
    { group: ['../../*'], message: 'Escaping two levels means the file is in the wrong place. Use an alias.' },
  ]}],
}
```

Three further gates run in CI:

| Gate | Catches |
|---|---|
| `dependency-cruiser` orphan and cycle check | Circular imports, which break tree-shaking and produce undefined-at-module-load bugs that look random |
| Token scan | A Layer-1 token referenced outside `packages/tokens` ([08](08-design-system.md) §8.1) |
| `<img>` scan | A raw `<img>` outside the image wrapper ([08](08-design-system.md) §8.7) |

The alias map is the other half of the enforcement, because a rule against `../../*` needs
somewhere for those imports to go: `@/` for the app's own `src`, `@vivcharyk/schemas`,
`@vivcharyk/ui`, `@vivcharyk/tokens`, `@vivcharyk/i18n`. Configured once in `tsconfig.base.json`
and mirrored in each `vite.config.ts`.

## 27.7 Barrel-file policy

**Barrels are permitted at exactly one level: the public entry of a shared package or a feature.
They are forbidden everywhere else.**

```
packages/ui/src/index.ts              allowed — the package's public surface
src/features/cart/index.ts            allowed — the feature's public surface
src/features/cart/components/index.ts forbidden
src/lib/index.ts                      forbidden
```

The reason is bundle size, and it is measurable rather than theoretical. A deep barrel makes
`import { useCart } from '@/features/cart/hooks'` pull the module that re-exports every hook in
that directory. Tree-shaking usually recovers this, but it fails whenever a module in the chain
has a side effect, is CommonJS, or is marked as such by a transitive dependency. The failure is
silent: nothing breaks, the bundle is simply 40 KB larger than it should be. Against the budgets
in [13-motion-system.md](13-motion-system.md) §13.5, a silent 40 KB is the difference between
Performance 98 and Performance 91.

The permitted barrels are narrow and hand-curated. `features/cart/index.ts` exports the four
symbols other code is allowed to use, which is simultaneously the feature's API and the thing the
boundary rule in §27.6 points at. Everything else is a deep import to the exact file, which is
also what makes a dead module obvious to `dependency-cruiser`.

`sideEffects: false` is set in every package `package.json`, with `styles/*.css` listed as the
sole exception.

## 27.8 Naming conventions

| Artefact | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `features/product-reviews/` |
| React components | `PascalCase.tsx`, one component per file, named same as the file | `ProductCard.tsx` |
| Hooks | `camelCase.ts` starting `use` | `useAddToCart.ts` |
| Zustand stores | `<domain>Store.ts`, exporting `use<Domain>Store` | `cartUiStore.ts` |
| Query key factories | `keys.ts` per feature, exporting one object | `catalogKeys` |
| Zod schemas | `<noun>.ts`, schemas `camelCase`, types `PascalCase` | `addCartItemInput` / `AddCartItemInput` |
| API modules | `<domain>.<layer>.ts` | `orders.service.ts` |
| Jobs | `<domain>.<verb>.ts` matching the pg-boss queue name | `stock.sweepReservations.ts` |
| Tests | `<subject>.test.ts(x)` beside the subject | `money.test.ts` |
| E2E specs | `<journey>.spec.ts` | `guest-checkout.spec.ts` |
| Constants | `SCREAMING_SNAKE` inside a `const.ts` | `MAX_CART_QUANTITY_MILLI` |
| Type-only files | `types.ts`, never `.d.ts` outside `env.d.ts` | |

Two rules with teeth. **No `index.tsx` component files**: a tab bar reading `index.tsx` six times
is a permanent tax on navigation, and the only exception is a React Router route directory, whose
`route.tsx` is named by the directory and whose directory name is the route. **File name equals export name**, checked by `eslint-plugin-unicorn`'s
filename rule, because a `ProductCard` living in `Card.tsx` is unfindable by search.

## 27.9 Design tokens

[08-design-system.md](08-design-system.md) §8.9 requires one authored source generating both the
CSS custom properties and the Tailwind config.

```
packages/tokens/
├── src/
│   ├── primitives/   color.ts, space.ts, type.ts, radius.ts, elevation.ts, motion.ts
│   ├── semantics/    light.ts, dark.ts   — intent names referencing primitives only
│   └── index.ts
├── build/
│   ├── emit-css.ts       → dist/tokens.css      (:root and [data-theme="dark"])
│   └── emit-tailwind.ts  → dist/tailwind-preset.js
└── package.json          "build" runs before every app build
```

Both outputs are generated, `.gitignore`d and never hand-edited. Consumers import
`@vivcharyk/tokens/tokens.css` in the Tailwind entry and spread the preset into
`tailwind.config.ts`. Generating rather than committing the outputs is what makes hand-editing
them impossible rather than merely discouraged: an edit is erased by the next build.

## 27.10 Prisma

```
prisma/
├── schema.prisma          The single file. Split only if it passes 1,500 lines.
├── migrations/            Forward-only, never edited after applying (25 §25.11)
│   └── <ts>_<name>/migration.sql
└── seed/
    ├── index.ts           Orchestrates, idempotent, safe to re-run
    ├── permissions.ts     Generated from the TS permission constant (25 §25.11)
    ├── roles.ts           The 8 system roles
    ├── options.ts         OptionType and OptionValue: size, color, composition, weight
    ├── attributes.ts      AttributeDefinition, including composition and care
    ├── categories.ts      The confirmed uk tree from 00-client-decisions.md §D3
    └── owners.ts          TWO Owner accounts (00-client-decisions-2.md §E1), one-time passwords
```

`owners.ts` is plural deliberately. [00-client-decisions-2.md](00-client-decisions-2.md) §E1
resolves the people question — ГОНДУРАК ІВАН ФЕДОРОВИЧ owns production, ГОНДУРАК ЛЮБОВ ЮРІЇВНА
is deputy and the ФОП seller of record — and
[24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.5 seeds both
as Owners rather than weakening the Administrator role to accommodate the second person. A seed
file named for one account is how that decision quietly reverts.

`prisma/` sits at the repository root rather than inside `apps/api` because the schema is the
contract for the whole system: `apps/api` consumes the client, CI runs migrations, and the seed is
run by developers and by the deploy pipeline. Burying it one app deep implies an ownership that
does not match how it is used.

Hand-written migration steps Prisma cannot express are appended to the generated SQL and recorded
in [25-database-schema.md](25-database-schema.md): the `CHECK (rating BETWEEN 1 AND 5)` constraint
and the `REVOKE UPDATE, DELETE ON AuditLog` grant.

## 27.11 Shared schemas and types

```
packages/schemas/src/
├── primitives.ts     locale, currency, cuid2, money, pricingUnit, pagination, sort
├── errors.ts         errorEnvelope, ErrorCode union — the §26.8 contract
├── product.ts  category.ts  cart.ts  checkout.ts  order.ts  customer.ts
├── review.ts   content.ts   lead.ts  media.ts     auth.ts   admin/…
├── openapi.ts        Registry; emits openapi.json (26 §26.19)
└── index.ts
```

This package is the mechanism that makes client and server drift a **compile error** rather than a
runtime surprise. Three rules keep it that way:

1. **It has no runtime dependencies beyond Zod.** Not Prisma, not Fastify, not React. A dependency
   on a server library here would drag server code into the browser bundle, and a dependency on a
   client library would make the API depend on the DOM.
2. **It never imports Prisma's generated types.** Prisma models and wire shapes differ on purpose:
   `internalNote` exists in one and must not exist in the other, and `productionStage` is
   suppressed for partner goods. A mapper in each module's serialiser is the enforcement point;
   re-exporting a Prisma type would ship that decision to the client by accident.
3. **Types are inferred, never hand-written alongside.** `z.infer` only. A hand-written interface
   next to a schema is two sources of truth that agree until they do not.

## 27.12 Test placement

| Kind | Location | Runner | Scope |
|---|---|---|---|
| Unit | Beside the subject, `money.test.ts` | Vitest | Pure functions, reducers, serialisers, validators |
| Component | Beside the component | Vitest + Testing Library | Rendering, states, keyboard, ARIA |
| API integration | `apps/api/tests/integration/` | Vitest + testcontainers | Route to real Postgres, one file per module |
| E2E | `apps/storefront/tests/e2e/` | Playwright | Whole journeys only |
| Visual | Storybook stories beside the component | Chromatic or Playwright snapshots | Variants and states per [08](08-design-system.md) §8.10 |
| Accessibility | Beside the component, plus an E2E axe pass | `vitest-axe`, `@axe-core/playwright` | Contract, not a spot check |

Unit and component tests sit **beside** their subject rather than in a mirrored `__tests__` tree,
because a parallel tree makes deleting code a two-place operation and orphan test files are how a
suite starts testing something that no longer exists. Integration and E2E tests live apart
because they belong to no single file, need a database or a browser, and run on a different CI
schedule.

E2E coverage is deliberately narrow and expensive-per-test: guest checkout end to end, a guest
order lookup by number + email, adding yarn by weight, filtering to own manufacture, the
international enquiry-then-invoice path through `AWAITING_QUOTE` to payment
([00-client-decisions-3.md](00-client-decisions-3.md) F4), a wholesale lead submission, the
four-locale smoke pass, and the admin publishing a product. Broad E2E suites are slow, flaky and
get disabled; these eight are the journeys whose failure means the business stops.

The second of them replaced an "account-holder reorder" spec. There is no account to hold
(§E12), and the journey that actually needs covering is the one that *substitutes* for it: a
buyer with no identity resolving their own order from an email and a number. A spec for a flow
that cannot exist is worse than no spec, because it passes by being skipped.

## 27.13 Configuration and environment variables

Loaded once, validated with Zod at process start, and the process **refuses to boot** on a missing
or malformed variable. Discovering a missing secret when the first webhook arrives is strictly
worse than discovering it at deploy.

```ts
// apps/api/src/config.ts
const env = serverEnvSchema.parse(process.env);   // throws, loudly, at import time
export const config = { db: { url: env.DATABASE_URL }, /* … */ } as const;
```

**Public** means the value is compiled into the browser bundle and is world-readable. Vite only
exposes `VITE_`-prefixed variables to client code, which makes the prefix itself the safety
mechanism: an unprefixed secret cannot leak into a bundle by accident.

| Variable | Scope | Public | Notes |
|---|---|---|---|
| `NODE_ENV` | all | no | |
| `ROLE` | api | no | `api` \| `worker` \| `both` (26 §26.17) |
| `PORT`, `HOST` | api | no | |
| `DATABASE_URL` | api | no | Include `?pgbouncer=true` (25 §25.10.5) |
| `DATABASE_DIRECT_URL` | api | no | Migrations bypass PgBouncer |
| `JWT_ACCESS_SECRET` | api | no | Rotated independently of the refresh secret |
| `JWT_REFRESH_SECRET` | api | no | |
| `COOKIE_SECRET` | api | no | Signs the cart and refresh cookies |
| `CLOUDINARY_CLOUD_NAME` | api | no | Mirrored publicly as `VITE_CLOUDINARY_CLOUD_NAME` |
| `CLOUDINARY_API_KEY` | api | no | Returned inside a signature response only |
| `CLOUDINARY_API_SECRET` | api | **never** | Account-wide. See [26](26-api-architecture.md) §26.15. |
| `PSP_PUBLIC_KEY` | api | no | |
| `PSP_PRIVATE_KEY` | api | **never** | Signs and verifies webhooks |
| `PSP_WEBHOOK_URL` | api | no | |
| `NOVA_POSHTA_API_KEY` | api | **never** | Proxied, never client-side ([00-assumptions.md](00-assumptions.md) V2) |
| `UKRPOSHTA_API_KEY` | api | **never** | |
| `ESP_API_KEY` | api | **never** | |
| `ESP_WEBHOOK_SECRET` | api | **never** | |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | api | no | `EMAIL_FROM` is `{{TRANSACTIONAL_FROM}}` and **must** be on `{{DOMAIN}}` with SPF, DKIM and DMARC published. It cannot be `gif19601@gmail.com`: Google publishes neither SPF nor DKIM for third-party senders on `gmail.com` and its consumer DMARC policy rejects the mail, so confirmations land in spam or are refused ([00-client-decisions-3.md](00-client-decisions-3.md) F5). Boot-time validation rejects any value matching `@gmail.com` |
| `CDN_PURGE_TOKEN`, `CDN_ZONE_ID` | api | no | (26 §26.13.3) |
| `CAPTCHA_SECRET` | api | **never** | Paired with `VITE_CAPTCHA_SITE_KEY` |
| `SENTRY_DSN` | api | no | Server DSN, distinct from the client one |
| `SENTRY_AUTH_TOKEN` | build | **never** | Source-map upload only |
| `METRICS_BASIC_AUTH` | api | no | Guards `/metrics` |
| `ADMIN_BASE_PATH` | api + admin | yes | Default `/admin` |
| `VITE_API_BASE_URL` | clients | yes | |
| `VITE_SITE_URL` | clients | yes | Canonicals, hreflang, absolute OG URLs |
| `VITE_CLOUDINARY_CLOUD_NAME` | clients | yes | Needed to build image URLs |
| `VITE_SENTRY_DSN` | clients | yes | A client DSN is public by design |
| `VITE_CAPTCHA_SITE_KEY` | clients | yes | |
| `VITE_GA_MEASUREMENT_ID` | clients | yes | Gated on consent ([31](31-analytics-architecture.md)) |
| `VITE_DEFAULT_LOCALE` | clients | yes | `uk` |
| `VITE_ENABLE_WOOD_CATEGORY` | clients | yes | Off. Wood is architecture-only (D3). |

`.env.example` lists every row above with an empty value and a one-line comment. CI fails if a key
exists in `.env.example` but not in the Zod schema, or the reverse, which is what stops the file
from rotting into a lie within two months.

## 27.14 The admin panel

`apps/admin` is a **separate Vite application**, built separately, served under
`ADMIN_BASE_PATH` on the same origin by the same Fastify process.

Separate application, not a lazily-imported route inside the storefront, for four reasons:

1. **Zero bytes.** A code-split route still contributes to the shared chunk graph: shared vendor
   code, the router's manifest, the preload hints. A separate build guarantees the storefront
   ships literally nothing admin-related, which is the only version of that guarantee that cannot
   regress. Against Performance 98 to 100 that certainty is worth the extra build target.
2. **Opposite constraints.** The storefront is SSR-first, animation-rich, and optimised for a
   first-time visitor on mobile. The admin is CSR-only, dense, keyboard-driven and animated at
   `dur-fast` at most ([13](13-motion-system.md) §13.11) for staff who open it forty times a day.
   Two sets of constraints in one build configuration produce compromises in both.
3. **Different dependencies.** TanStack Table, a rich-text editor, a CSV parser and a charting
   library are admin-only and individually large. In one app they are a constant risk of leaking
   into a storefront chunk through a careless shared import.
4. **A blunt security boundary.** One proxy rule denies `/admin/*` from outside {{ADMIN_ALLOWLIST}}
   and one CDN rule sets `no-store` for the whole path. Rules that operate on a path prefix are
   auditable in a way that rules about a bundle's contents are not.

Same origin rather than a subdomain is chosen so the staff refresh cookie stays first-party with
`SameSite=Strict`, no CORS configuration exists to get wrong, and no second TLS certificate needs
renewing. Shared code moves through `packages/ui` and `packages/schemas`, which both apps depend
on as ordinary workspace packages.

## 27.15 Worked example: add-to-cart through every layer

A single feature traced end to end, so the structure is concrete. The product is a skein of
вовняна пряжа, which makes it a weight-priced line
([00-client-decisions.md](00-client-decisions.md) D4) rather than the easy case.

**1. Contract.** `packages/schemas/src/cart.ts` defines `addCartItemInput`
(`variantId`, `quantityMilli`), `cartLine` and `cartResponse`. Both apps and the API import from
here; nothing else defines the shape.

**2. Button.** `apps/storefront/src/features/product/components/AddToCartButton.tsx` composes
`<Button>` from `@vivcharyk/ui`. It holds no fetch logic and no store access: it takes a variant,
a quantity and an `onAdd` callback, so it is testable without a server.

**3. Quantity control.** `features/product/components/QuantityField.tsx` branches on
`pricingUnit`: a stepper for `PIECE`, a weight input with unit suffix for `KILOGRAM` and `SKEIN`.
It emits `quantityMilli` in both cases, so nothing downstream branches again.

**4. Mutation hook.** `features/cart/hooks/useAddToCart.ts` wraps a TanStack Query
`useMutation`, performs the optimistic update against the cart query cache, and rolls back on
error ([28](28-state-management-architecture.md) §28.4). It also opens the cart drawer through
`stores/cartUiStore.ts`, because drawer visibility is client state and the cart contents are not.

**5. Transport.** `features/cart/api/mutations.ts` calls
`apiClient.post('/v1/cart/items', addCartItemInput.parse(input))`. `lib/apiClient.ts` attaches
`locale`, the access token, an `x-request-id`, and maps a non-2xx body onto a typed `ApiError`
carrying the §26.8 envelope.

**6. Route.** `apps/api/src/modules/cart/cart.routes.ts` registers
`POST /v1/cart/items` with `addCartItemInput` as the body schema, the cart-cookie plugin, and the
`cart-mutation` rate-limit class. A validation failure becomes a `422` with `fieldErrors` before
any handler code runs.

**7. Service.** `cart.service.ts` resolves the cart from the cookie or creates one, loads the
variant through `catalog.service` (never through `catalog.repository`, per §27.4), checks
`stockQty` against live `StockReservation` rows, clamps or rejects with
`CART_ITEM_OUT_OF_STOCK`, upserts the `CartItem`, and recomputes totals in integer minor units.

**8. Persistence.** `cart.repository.ts` is the only file issuing Prisma calls for this module.
The `@@unique([cartId, variantId])` constraint (§25.6) makes the upsert a single statement rather
than a read-then-write race.

**9. Serialisation.** `cart.serializer.ts` maps rows to `cartResponse`, resolving the localised
variant name via §26.6's fallback rule and setting `x-translation-fallback` when the yarn's
Polish translation is missing.

**10. Response.** The complete cart returns, the optimistic state is replaced by server truth,
the badge count animates per [13-motion-system.md](13-motion-system.md) §13.10, and the drawer is
already open.

**11. Tests.** `QuantityField.test.tsx` and `cart.service.test.ts` sit beside their subjects;
`tests/integration/cart.test.ts` exercises the route against real Postgres including the
out-of-stock path; `tests/e2e/add-yarn-by-weight.spec.ts` covers the journey.

Eleven steps, eleven files, and each one is findable from the feature name alone. That is the
property the structure exists to produce.

## 27.16 Cross-references

| Concern | Document |
|---|---|
| Endpoint contracts consumed here | [26-api-architecture.md](26-api-architecture.md) |
| What lives in stores versus query cache | [28-state-management-architecture.md](28-state-management-architecture.md) |
| Component taxonomy and quality gates | [08-design-system.md](08-design-system.md) §8.4, §8.10 |
| Data shapes and migration policy | [25-database-schema.md](25-database-schema.md) |
| Admin screens and information architecture | [23-admin-panel-architecture.md](23-admin-panel-architecture.md) |
| Secret handling and deployment hardening | [32-security-architecture.md](32-security-architecture.md) |
