# Client Decisions — Round 16 (ready for ONEKNIGHT, not connected)

Received 2026-09-30. **Highest-authority document** for the points below.

ONEKNIGHT is an external business panel (orders, customers, delivery, products, reviews,
analytics). It will be connected **later**. The decision now is to build the site so that
connecting it replaces one implementation with another instead of rewriting code.

- **Nothing is integrated now.** The blueprint and every earlier client decision stay as they are.
- The API contract as of 2026-09-30, the status mapping and the list of what the API still lacks
  are in [oneknight-integration.md](oneknight-integration.md). That file is the only source for
  ONEKNIGHT endpoints, fields and events. Nothing not listed there is assumed to exist.

---

## O1 — What the build lays down now

| # | Seam | Decision |
|---|---|---|
| 1 | **Ports** | Domain services reach data only through interfaces: `CatalogSource`, `OrderSink`, `ReviewSource`, `CustomerDirectory`, `AnalyticsSink`. Today each has a `Local*` implementation (own database, per this blueprint); later a `OneKnight*` HTTP client. A config switch **per port** (`DATA_BACKEND_CATALOG=local\|oneknight`, and so on) selects the implementation. UI, SSR and the site's API never know where data comes from. The ports live inside the modular monolith's domain folders ([27-folder-architecture.md](27-folder-architecture.md)). |
| 2 | **External ids** | Nullable `externalRef` (`oneknight:<id>`), unique, on Product, ProductVariant, Category, Order, Customer, Review ([25-database-schema.md](25-database-schema.md) §25.8g). The site's own ids never change. The site's order number `VCH-YY-NNNN` and ONEKNIGHT's numeric number are both kept. |
| 3 | **Boundary formats** | Money is integer kopecks inside, UAH as a number at the ONEKNIGHT boundary; conversion happens only in the adapter. Phones are E.164 and dates ISO 8601 UTC. **One** status mapping table lives in the adapter ([oneknight-integration.md](oneknight-integration.md) §3). |
| 4 | **Outgoing events** | See O2 #2. |
| 5 | **Webhook receiver** | See O2 #1. Handler is a no-op unless a port is set to `oneknight`. |
| 6 | **One `revalidate(entity, id)`** | The only way to purge cache and regenerate pages; called by the admin panel and by the webhook handler alike ([26-api-architecture.md](26-api-architecture.md) §26.13.3 purge-on-write keeps its rules; it just goes through this one function). |
| 7 | **Secrets** | `ONEKNIGHT_API_URL`, `ONEKNIGHT_SECRET_KEY`, `ONEKNIGHT_WEBHOOK_SECRET` are server-only environment variables. `ONEKNIGHT_PUBLIC_KEY` may reach the browser. Empty = integration off, the site runs on its own. The secret key never reaches the client bundle and is never used from the browser. |
| 8 | **ok.js markup now** | Templates carry `data-ok-product`, `data-ok-cart`, `data-ok-reviews`, `data-ok-stars` from the start. See O2 #4 for the checkout fields. |
| 9 | **Contract tests** | The `OneKnight*` adapters are tested against recorded fixtures of the documented responses, without network. |
| 10 | **Gap log** | [oneknight-integration.md](oneknight-integration.md) §4 lists every site need the API does not cover yet, with fields and blueprint source. |

**Not done on the site in `oneknight` mode:** prices and stock reservation. The site passes the
request and shows the answer; ONEKNIGHT takes prices and names from its own catalogue.

---

## O2 — Where the ONEKNIGHT brief met the blueprint, and how it was resolved

The brief says not to change the blueprint. Four points needed a choice:

| # | Brief | Blueprint | Resolution |
|---|---|---|---|
| 1 | Webhook route `POST /api/integrations/oneknight/webhook` | All inbound webhooks live at `/api/v1/webhooks/<sender>`, signature-verified, no JWT ([26-api-architecture.md](26-api-architecture.md) §26.5) | **`POST /api/v1/webhooks/oneknight`.** Everything else as the brief says: raw body, constant-time HMAC-SHA256 check of `t + "." + body`, reject `t` older than 5 min, idempotent by event `id` (`ProcessedWebhookEvent`), 204 at once, processing in the background |
| 2 | An `outbox` table written in the same transaction, sent by a worker | The blueprint rejected a separate outbox for a modular monolith (§26.2.4) and already queues work in PostgreSQL with pg-boss | **The pg-boss job is the outbox.** pg-boss stores jobs in the same database, so the job is inserted in the same transaction as the order, cancellation or review. Each job carries an idempotency key (`singletonKey`), so a retry never duplicates an order. No second table |
| 3 | Server calls `oneknight.pro`; the browser loads `https://oneknight.pro/ok.js` | Strict egress allowlist ([38-security-hardening.md](38-security-hardening.md) #18) and a strict CSP ([32-security-architecture.md](32-security-architecture.md) §32 CSP) | Egress allows `oneknight.pro` **only when `ONEKNIGHT_API_URL` is set**. CSP adds `https://oneknight.pro` to `script-src` and `connect-src` **only when `ONEKNIGHT_PUBLIC_KEY` is set**. Both are off today |
| 4 | `data-ok-phone`, `data-ok-name` let ONEKNIGHT collect abandoned carts | The checkout collects name and phone to place an order; sending them to a third party **before** the buyer submits is personal-data processing the buyer has not agreed to | Attributes are in the markup, but ok.js loads **only after analytics consent** (like GA, Consent Mode v2), and the privacy policy names ONEKNIGHT as a processor before it is switched on. Without consent no field value leaves the page. `oneknight.context()` is stored with the order only when the script is present |

The egress row in #38 also still names Checkbox; round 14 replaced it with WayForPay's built-in
ПРРО, so Checkbox leaves the list at build time.
