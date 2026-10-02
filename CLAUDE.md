# Вівчарик — project instructions

Carpathian wool manufacturer. The blueprint is in `docs/` (index: [docs/00-README.md](docs/00-README.md));
the application is built (launch planned 2026-10-03).

## Code map

- `apps/api` — Fastify + Prisma + pg-boss. Modules in `src/modules/*` (orders, products, mail «Пошта» over
  IMAP/Porkbun, newsletter, notifications = order e-mails + the staff Telegram bot, stock = shop till, …);
  background jobs in `src/modules/jobs/jobs.ts`; tests in `tests/` (`cd apps/api && npx vitest run`).
- `apps/admin` — the panel (Vite + React 19, served by the API at `/admin`). Shared kit in
  `src/components/` (Shell, ui.tsx, DataTable, Filters, status, sections); one folder per section in
  `src/features/`. Interface rules: docs/00-client-decisions-20.md.
- `apps/storefront` — the site (React Router 7 SSR, `server.mjs` in production).
- `packages/schemas` (shared types, BUSINESS facts, permissions), `packages/tokens` (design tokens).
- `prisma/` — schema, migrations, seeds (`SEED_DEMO=1` only in development).
- `deploy/` — `push.sh` (upload + install on the VPS), `install.sh`, Caddyfile; `start.sh` runs everything locally.
- Checks: `npm run typecheck`, `npx vitest run` (root and `apps/api`). Never run plain `tsc` without
  `--noEmit`: emitted `.js` next to `.ts` is picked up by Vite first.
- Local mail, Telegram and payments: tests blank their secrets (apps/api/vitest.config.ts); never send to
  real addresses from tests.

## Reading discipline

`docs/` is ~665,000 tokens across 43 files. Never read it broadly.

1. Start at [docs/00-README.md](docs/00-README.md) — it is the index and the authority chain.
2. Open **one** document, for a stated reason. Use `offset`/`limit` on anything over 600 lines.
3. Grep before reading. `grep -n "§17.10" docs/17-*.md` beats opening a 1,600-line file.
4. Never read more than three documents in a turn without saying why.

## Authority chain — highest first

```
docs/00-client-decisions-23.md   client-confirmed, round 23 (newest — smooth scroll on the site)
docs/00-client-decisions-22.md   round 22 (categories in the panel, product card)
docs/00-client-decisions-21.md   round 21 (staff Telegram bot)
docs/00-client-decisions-20.md   round 20 (admin panel interface, 300 answers)
docs/00-client-decisions-19.md   round 19 (mail in the panel, newsletters)
docs/00-client-decisions-18.md   round 18 (answers from the owner's visit)
docs/00-client-decisions-17.md   round 17 (build-time corrections)
docs/00-client-decisions-16.md   round 16 (ONEKNIGHT seams)
docs/00-client-decisions-15.md   round 15 (pick up a sheep, living flock)
docs/00-client-decisions-14.md   round 14 (fiscal receipts)
docs/00-client-decisions-13.md   round 13 (gap review)
docs/00-client-decisions-12.md   round 12 (product admin)
docs/00-client-decisions-11.md   round 11 (motion interview)
docs/00-client-decisions-10.md   round 10 (interface questionnaire)
docs/00-client-decisions-9.md    round 9 (questionnaire)
docs/00-client-decisions-8.md    round 8
docs/00-client-decisions-7.md    round 7
docs/00-client-decisions-6.md    round 6
docs/00-client-decisions-5.md    round 5
docs/00-client-decisions-4.md    round 4
docs/00-client-decisions-3.md    round 3
docs/00-client-decisions-2.md    round 2
docs/00-client-decisions.md      round 1
docs/00-existing-site-audit.md   ADJACENT BUSINESS — reference only, no authority
docs/00-assumptions.md           still-unverified assumptions
everything else
```

Canonical for their domain: `09-color-palette.md` (colour), `10-typography.md` (type),
`11-spacing-system.md` (space/grid), `36-motion-interaction-system.md` over `13-motion-system.md` (motion), `25-database-schema.md`
(data), `37-product-admin-system.md` (product admin), `38-security-hardening.md` with `32-security-architecture.md` (security). A spec contradicting one of these is wrong.

## Facts that are easy to get wrong

- The business is **Вівчарик**, in **с. Яворів, Косівський район**. `fabryka-shkur.com.ua` / the
  Prom shop (BOTEY) is run by Іван's wife — **the same firm** (round 13 N1). The old site stays online but stops selling; no redirects (round 14 F8).
  Its reviews (3–5 ★) are imported labelled «Prom.ua · перенесено»; its other facts (Вербовець
  address, phones, tariffs) are still not Вівчарик's.
- Approved tagline, exact: «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.»
  The claim attaches to the **manufacturing**, never to a legal entity. No certificates exist.
- **No customer accounts, ever.** Guest checkout is permanent.
- Partner goods: `brand` = Вівчарик, `manufacturer` **omitted**. `partnerName` never rendered.
- Opening hours (round 18): Mon–Fri 11:00–19:00, Saturday and Sunday closed — fixed now, shown on
  the site and in LocalBusiness structured data. Seller: ФОП Гондурак Любов Юріївна. One phone on the
  site, Іван's. Wholesale: from 10 pcs −10 %, from 20 pcs −20 %, per product.
- Business mail is read and answered **in the admin panel**, not Gmail (round 7 K2): the panel reads
  `info@` over IMAP and replies through Porkbun SMTP (round 19 D1). Automated site mail goes through
  Resend. Staff login addresses must never be on the site's own domain.
- One panel account at launch: Іван, Owner, login `gif19601@gmail.com`. That address is **never
  published** on the site; the public address is `info@vivcharuk.com` (round 8, domain per round 18).
- Domain is `vivcharuk.com` (registered at Porkbun, round 18; the earlier plan was `vivcharyk.shop`).
  Not `botey.shop` — BOTEY is the wife's brand and never appears in the new experience.
- **No own flock, no dyeing.** Raw wool and dyed material are bought. Claim only: вичинка шкур,
  миття, чесання, прядіння, ткання, валяння, пошиття. «Від сирої вовни до готового виробу».
- No faces in photos (hands at work only). Logo = the client's black-and-white sheep's head seen
  from the front (round 18 C8, supplied 2026-10-02; the old ram drawing is kept as `logo-ram-*.webp`), in
  the header (large, hanging below the bar); the hero shows the «Вівчарик» wordmark (round 17 B1). Mascot = shepherd
  with sheep, in the hero. Headings are sans-serif (`e-Ukraine Head`).
- Many specs carry «Round 10» and «Round 9» banners under the title: they override the body text
  below them, newest first.
- No forms on the site (no contact or wholesale form; Leads removed). Email at checkout is optional
  for ordinary `uk` orders. Newsletters are back (round 19 D2): consent only by an unchecked checkbox at
  checkout, double opt-in, one-click unsubscribe; never mail anyone without consent. ПРРО fiscal receipts are required for card payments:
  WayForPay's free built-in ПРРО, receipt shown on the order page only (round 14).
- **No paid add-on services** (round 13 N7): paid only for hosting, domain, payment commission and
  legally required services. EU delivery closed on every locale; map is a static styled image.
- `{{TOKEN}}` placeholders are unresolved client facts. Never invent a value for one.

## ONEKNIGHT integration (later, not now)

ONEKNIGHT is an external business panel that will be connected after launch. Build so that
connecting it swaps an implementation, never rewrites code:
[00-client-decisions-16.md](docs/00-client-decisions-16.md) and
[oneknight-integration.md](docs/oneknight-integration.md).

- Data only through ports (`CatalogSource`, `OrderSink`, `ReviewSource`, `CustomerDirectory`,
  `AnalyticsSink`); `Local*` now, `OneKnight*` later, chosen per port by config.
- `externalRef` (`oneknight:<id>`) on product, variant, category, order, customer, review.
- Webhooks at `/api/v1/webhooks/oneknight`; outgoing events are pg-boss jobs in the same
  transaction; one `revalidate(entity, id)`.
- Secret key server-only; ok.js only after analytics consent.
- Never invent ONEKNIGHT endpoints, fields or events. Anything missing goes into the gap log
  (`docs/oneknight-integration.md` §4).

## Working rules

- Do not restate blueprint content back to the user — link to it: `[17-product-page-specification.md](docs/17-product-page-specification.md)`.
- Revise documents surgically. These files went through ten decision rounds; a rewrite loses
  recorded reasoning.
- When a client decision changes something, write it to the newest `00-client-decisions-N.md`
  first, then propagate.
