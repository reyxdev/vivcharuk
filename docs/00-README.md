# Вівчарик — Product Blueprint

Full-cycle wool processing factory, Ukrainian Carpathians. This directory is the complete
pre-build blueprint: brand, experience, design system, engineering architecture, and
delivery roadmap.

## How to read this

Documents are numbered in dependency order. Sections 01–07 define *what* is being built and
for whom. Sections 08–22 define *how it looks and behaves*. Sections 23–32 define *how it is
engineered*. Sections 33–35 define *how it ships*.

The documents below are canonical — every other document defers to them. Where two canonical
documents overlap, the **higher row wins**, and the client-decision rounds are ordered newest
first because each round supersedes its predecessors on the points it touches:

| Canonical | Governs |
|---|---|
| [00-client-decisions-19.md](00-client-decisions-19.md) | **Highest authority.** Round 19 — «Пошта» in the panel over IMAP/Porkbun SMTP; newsletters return with checkout consent and double opt-in; promo codes; automatic letters |
| [00-client-decisions-18.md](00-client-decisions-18.md) | Round 18 — owner's visit: seller, hours, wholesale, catalogue tree, logo, first products, videos, РНОКПП/IBAN, domain vivcharuk.com, mail via Resend |
| [00-client-decisions-17.md](00-client-decisions-17.md) | Round 17 — logo in the header, wordmark in the hero, whole hero scene visible, denser forest; mockup cleanups |
| [00-client-decisions-16.md](00-client-decisions-16.md) | Round 16 — seams for connecting ONEKNIGHT later (ports, externalRef, webhook receiver, revalidate); nothing integrated now |
| [oneknight-integration.md](oneknight-integration.md) | ONEKNIGHT API contract (2026-09-30), status mapping, gap log of what the API still lacks |
| [00-client-decisions-15.md](00-client-decisions-15.md) | Round 15 — flock of 12 with a lamb; pick up a sheep; living flock that heaps under the cursor; shepherd carried by his кресаня |
| [00-client-decisions-14.md](00-client-decisions-14.md) | Round 14 — free fiscal receipts through WayForPay's ПРРО, what gets a receipt, the receipt card on the order page, panel |
| [00-client-decisions-13.md](00-client-decisions-13.md) | Round 13 — one firm with the Prom shop, Prom reviews import and the Reviews page, EU law, Google review request, capacity 5 |
| [00-client-decisions-12.md](00-client-decisions-12.md) | **Highest authority for product admin.** Round 12 — product templates, sizes, colours, materials, variants, media, texts, safeguards |
| [00-client-decisions-11.md](00-client-decisions-11.md) | **Highest authority for motion.** Round 11 — motion and interaction interview (in progress) |
| [00-client-decisions-10.md](00-client-decisions-10.md) | **Highest authority.** Round 10 — interface questionnaire: header, homepage order, catalogue, PDP, drawer and checkout, after-order, pages, admin, ПРРО |
| [00-client-decisions-9.md](00-client-decisions-9.md) | Round 9 — client questionnaire: logo, mascot in the hero, sans headings, categories, cart drawer, quick order, Telegram, production claims, no newsletter |
| [00-client-decisions-8.md](00-client-decisions-8.md) | Round 8 — one Owner account, `info@` only, returns 14 days, single tax, heritage wording, prepayment for any order, mail read state, no Instagram |
| [00-client-decisions-7.md](00-client-decisions-7.md) | Round 7 — domain `vivcharyk.shop`, business mail in the admin panel |
| [00-client-decisions-6.md](00-client-decisions-6.md) | Round 6 — mixed carts ship together, deposit confirmed |
| [00-client-decisions-5.md](00-client-decisions-5.md) | Round 5 — payment methods, return-shipping deposit, quote defaults |
| [00-client-decisions-4.md](00-client-decisions-4.md) | Round 4 — phone priority, 14-day lead time, guided workshop tours, parcel card |
| [00-client-decisions-3.md](00-client-decisions-3.md) | Round 3 — shop on site, partner branding, shipping terms, email, tagline |
| [00-client-decisions-2.md](00-client-decisions-2.md) | Round 2 — legal entity, Yavoriv, WayForPay, guest-only, international |
| [00-client-decisions.md](00-client-decisions.md) | Round 1 — brand, scope, 30 years, partner goods |
| [00-existing-site-audit.md](00-existing-site-audit.md) | Market reference from an adjacent family business. No authority over this build |
| [00-assumptions.md](00-assumptions.md) | Every still-unverified business fact |
| [38-security-hardening.md](38-security-hardening.md) | 140 security controls: edge, server, injection, auth, data, recovery, supply chain, payments, monitoring, photo and video uploads; speed and rollout rules |
| [37-product-admin-system.md](37-product-admin-system.md) | Product templates, libraries, editor, drafts and publishing, stock movements (round 12) |
| [36-motion-interaction-system.md](36-motion-interaction-system.md) | Motion and interaction: audit, motion system, interaction map, priorities (round 11) |
| [09-color-palette.md](09-color-palette.md) | All colour values |
| [10-typography.md](10-typography.md) | All type values |
| [25-database-schema.md](25-database-schema.md) | All data shapes |

## Index

**Ground truth**
- [00-client-decisions-17.md](00-client-decisions-17.md)
- [00-client-decisions-16.md](00-client-decisions-16.md)
- [00-client-decisions-15.md](00-client-decisions-15.md)
- [00-client-decisions-14.md](00-client-decisions-14.md)
- [00-client-decisions-13.md](00-client-decisions-13.md)
- [00-client-decisions-10.md](00-client-decisions-10.md)
- [00-client-decisions-9.md](00-client-decisions-9.md)
- [00-client-decisions-8.md](00-client-decisions-8.md)
- [00-client-decisions-7.md](00-client-decisions-7.md)
- [00-client-decisions-6.md](00-client-decisions-6.md)
- [00-client-decisions-5.md](00-client-decisions-5.md)
- [00-client-decisions-4.md](00-client-decisions-4.md)
- [00-client-decisions-3.md](00-client-decisions-3.md)
- [00-client-decisions-2.md](00-client-decisions-2.md)
- [00-client-decisions.md](00-client-decisions.md)
- [00-existing-site-audit.md](00-existing-site-audit.md)
- [00-assumptions.md](00-assumptions.md)

**Strategy & research**
- [01-brand-strategy.md](01-brand-strategy.md)
- [02-ux-research.md](02-ux-research.md)

**Structure**
- [03-information-architecture.md](03-information-architecture.md)
- [04-sitemap.md](04-sitemap.md)
- [05-user-flows.md](05-user-flows.md)
- [06-homepage-wireframe.md](06-homepage-wireframe.md)
- [07-page-wireframes.md](07-page-wireframes.md)

**Design system**
- [08-design-system.md](08-design-system.md)
- [09-color-palette.md](09-color-palette.md)
- [10-typography.md](10-typography.md)
- [11-spacing-system.md](11-spacing-system.md)
- [12-iconography.md](12-iconography.md)
- [13-motion-system.md](13-motion-system.md)
- [14-component-library.md](14-component-library.md)

**Page specifications**
- [15-navbar-specification.md](15-navbar-specification.md)
- [16-footer-specification.md](16-footer-specification.md)
- [17-product-page-specification.md](17-product-page-specification.md)
- [18-checkout-specification.md](18-checkout-specification.md)
- [19-wholesale-page-specification.md](19-wholesale-page-specification.md)
- [20-production-page-specification.md](20-production-page-specification.md)
- [21-about-page-specification.md](21-about-page-specification.md)
- [22-blog-specification.md](22-blog-specification.md)

**Engineering**
- [23-admin-panel-architecture.md](23-admin-panel-architecture.md)
- [24-employee-permission-architecture.md](24-employee-permission-architecture.md)
- [25-database-schema.md](25-database-schema.md)
- [26-api-architecture.md](26-api-architecture.md)
- [27-folder-architecture.md](27-folder-architecture.md)
- [28-state-management-architecture.md](28-state-management-architecture.md)
- [29-seo-architecture.md](29-seo-architecture.md)
- [30-ai-search-optimization.md](30-ai-search-optimization.md)
- [31-analytics-architecture.md](31-analytics-architecture.md)
- [32-security-architecture.md](32-security-architecture.md)

**Delivery**
- [33-responsive-strategy.md](33-responsive-strategy.md)
- [34-animation-storyboard.md](34-animation-storyboard.md)
- [35-implementation-roadmap.md](35-implementation-roadmap.md)

## Locale scope

Four locales, confirmed: `uk` (default, canonical), `en`, `pl`, `de`. `uk` is the source of
truth for all content; other locales are translations with independent SEO metadata. See
[29-seo-architecture.md](29-seo-architecture.md) for hreflang and routing, and
[25-database-schema.md](25-database-schema.md) for the translation table pattern.

## Resolved cross-document conflicts

Documents were authored in parallel. Where two arrived at different answers, the ruling is
recorded here and the losing document carries a pointer back to this section.

| Conflict | Documents | Ruling |
|---|---|---|
| SSR framework | [26](26-api-architecture.md) chose Vike; [29](29-seo-architecture.md) chose React Router v7 framework mode. [27](27-folder-architecture.md) and [28](28-state-management-architecture.md) had inherited Vike's vocabulary from 26 and were corrected in the consistency audit | **React Router v7 framework mode.** Both are Vite-native and the per-route rendering strategy is identical either way, so this was not a capability decision. It was decided on handover risk: this site will eventually be maintained by whoever the client can hire locally, and React Router is the larger ecosystem with better documentation and a direct Remix lineage. Vike is the more elegant tool and the wrong bet for a small client's long-term maintainability. |
| Permission for issuing an international shipping quote | [26](26-api-architecture.md) §26.10 and [18](18-checkout-specification.md) §18.23 both gated the quote endpoints on `orders.quote`; [24](24-employee-permission-architecture.md) did not define it | **`orders.quote` exists, is flagged dangerous, and stops at Manager.** Defined in [24](24-employee-permission-architecture.md) §24.3–§24.4. Issuing a quote writes `shippingMinor` and rewrites `totalMinor` on an unpaid order — it sets the price a customer will be charged, which is `products.manage_price`-class authority and does not belong inside `orders.update`. |

A conflict is only resolved once the losing document says so in its own text. Two rows above
record cases where that had not happened and the divergence survived a propagation round; the
audit note at the top of each affected document is what closes them.

## Placeholder convention

Facts that require client confirmation appear as `{{TOKEN}}` and are catalogued in
[00-assumptions.md](00-assumptions.md). Do not ship a build containing an unresolved
`{{TOKEN}}` — CI blocks on this (see [35-implementation-roadmap.md](35-implementation-roadmap.md)).

## Status of the client interview

The 168-question client interview was not supplied. Business rules began as explicit, numbered
assumptions in [00-assumptions.md](00-assumptions.md); the most consequential of them have since
been resolved directly by the client across **five rounds** of decisions, from
[00-client-decisions.md](00-client-decisions.md) through
[00-client-decisions-5.md](00-client-decisions-5.md). Each round's own closing section lists what
it left open. Reconciling those remaining items against the interview is still the first task of
Phase 0.

## One-paragraph orientation

Вівчарик is a **new consumer brand on a new domain** for a Carpathian manufacturer that has
been processing wool continuously since the early 1990s — washing, combing, spinning, weaving
and sewing in-house, and, per [00-client-decisions-2.md](00-client-decisions-2.md) §E6, working
hides in-house as well. The site is **wool-led in brand and homepage**, but the catalogue also
carries sheepskin, leather, a separate partner-goods category, and, later, wooden handmade
products. There is **no site to migrate from**, so this is a cold start, and the launch channel
set is thinner than a cold start usually is: **no social media exists at all**
([00-client-decisions-2.md](00-client-decisions-2.md) §E3). What carries the first two quarters
is the Google Business Profile, the existing offline customer base, footfall through the **shop
attached to the production floor** in Яворів
([00-client-decisions-3.md](00-client-decisions-3.md) §F2), the business card already in every
parcel ([00-client-decisions-4.md](00-client-decisions-4.md) §G4), and long-tail editorial
content — not inherited search equity. The brand's single differentiating asset is that it can
**show the manufacturing**, and now that a visitor can be walked through it by the owner
([00-client-decisions-4.md](00-client-decisions-4.md) §G3), photography remains the project's
critical path and its largest risk.
