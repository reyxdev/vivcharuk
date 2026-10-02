# 32 — Security Architecture

> **Round 16:** CSP adds `https://oneknight.pro` to `script-src` and `connect-src` only when `ONEKNIGHT_PUBLIC_KEY` is set and only after analytics consent — [00-client-decisions-16.md](00-client-decisions-16.md) O2 #3–4.

> **Round 13:** EU product-safety (GPSR) responsible person, textile labelling, IOSS and export paperwork — [00-client-decisions-13.md](00-client-decisions-13.md) N4; `pl`/`de` checkout stays Ukraine-only until the responsible person is contracted.

> **Round 12 — security hardening:** the 100-control hardening catalogue — Cloudflare Access in front of the admin, origin locked to Cloudflare, egress allowlist, least-privilege DB roles, append-only and hash-chained audit, immutable off-site backups, step-up re-authentication, two-person rule, supply-chain gates, Telegram security alerts — is [38-security-hardening.md](38-security-hardening.md); it extends this document.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Product and page text — never customer data — is sent to the Claude API for translation and drafts (§P8a). Review and gallery photo uploads are EXIF-stripped and moderated. Fiscal-receipt provider credentials are secrets (§P8b).

Governed by [00-client-decisions-3.md](00-client-decisions-3.md) first,
[00-client-decisions-2.md](00-client-decisions-2.md) second and
[00-client-decisions.md](00-client-decisions.md) third.

**Round 3 adds three items, one of which is a hard technical blocker:**

- **F5 — the client's address is `gif19601@gmail.com`, and transactional mail cannot be sent from
  it.** SPF and DKIM cannot be published for `gmail.com` by a third-party system, and Gmail's
  consumer DMARC policy rejects mail that fails them. Order confirmations sent from that address
  land in spam or are refused outright. **§32.16 is new** and specifies the sending domain, the
  authentication records and the failure modes. It is a Phase 1 blocker in
  [35-implementation-roadmap.md](35-implementation-roadmap.md), not a polish item.
- **F4 — the buyer pays customs duties and import VAT** on every international order, effectively
  DAP. §32.15's price-transparency row is upgraded from a partially-resolved question to a stated
  **consumer-law obligation** in the EU locales. This is not a courtesy disclosure.
- **F1 — `{{LEGAL_ID}}` exists and will be supplied on request.** It is no longer a discovery item.
  It still blocks the same three deliverables and §32.15 keeps all three gates.

Four earlier rulings set the starting position:

1. **D2 — greenfield launch on a new domain with a real payment service provider from day one.**
   There is no legacy system to inherit, no published personal card number to withdraw, and no
   accumulated compromise to assume.
2. **E12 — guest checkout is permanent. There are no customer accounts, ever.** This is the single
   largest reduction in attack surface in the document, and §32.3 states exactly what it removes.
   **Staff authentication is entirely unaffected** and §32.4–§32.6 stand in full.
3. **E10 — the PSP is WayForPay.** The PCI reasoning in §32.14 holds unchanged, but nothing about
   WayForPay's API is written here from memory: integration mode, signature algorithm and webhook
   shape are all unverified (E10 V6–V11) and must be read from current official documentation
   before implementation.
4. **E11 — `de` and `pl` are transactional locales.** A German Impressum is legally mandatory, the
   EU 14-day right of withdrawal and the model withdrawal form apply, and GDPR applies in full
   rather than by caution. §32.15 carries the obligations and the entity that must be named on
   them: **ФОП Гондурак Любов Юріївна**.

The threat model below is built for a clean launch, which is a genuinely better position than a
migration — and the whole benefit of it is lost if the defaults are chosen badly in the first
month.

The guiding rule throughout: **security controls are enforced on the server.** The client is a
convenience layer. Every rule in this document that could be expressed as a UI behaviour is
instead expressed as a server-side check, because a UI behaviour is a suggestion.

## 32.1 Threat model

Ranked by expected loss, which is likelihood × impact — not by how interesting the attack is.

| # | Threat | Likelihood | Impact | Primary controls |
|---|---|---|---|---|
| T1 | **Card fraud / stolen-card testing** — a new merchant is an attractive test target, and chargebacks cost the merchant fee plus goods | High | High | PSP-hosted fields, 3-D Secure, velocity limits, §32.2 |
| T2 | **COD abuse** — orders placed with false details and refused at delivery. The merchant pays outbound and return shipping on a 9,800 UAH parcel | High | High | Phone verification above a threshold, COD limits, blocklist, §32.2 |
| T3 | **Lead-form and review spam** — automated submissions poison the two content types that are publicly visible | Very high | Medium | §32.13 |
| T4 | **Credential stuffing on staff accounts** — a compromised admin account is total compromise. **Staff only**: there are no customer credentials to stuff (§32.3) | Medium | Critical | §32.4, §32.6, §32.13 |
| T5 | **Brand impersonation** — a fake storefront copying photography and product names, taking payment. The category is full of resellers reusing imagery ([02-ux-research.md](02-ux-research.md) §2.5) | Medium | High | §32.2 |
| T6 | **XSS via rich-text blog content** — the only place where authored HTML reaches a page | Medium | High | §32.9 |
| T7 | **Broken access control** — a manager reaching an owner-only action, or a guest-token holder reaching another order | Medium | High | §32.5 |
| T8 | **Webhook forgery** — a forged PSP callback marking an unpaid order as paid | Low | Critical | §32.10 |
| T9 | **Enumeration** — scraping the catalogue, guessing order IDs, harvesting emails | High | Low–Medium | cuid2 IDs, §32.13 |
| T10 | **Supply-chain compromise** via an npm dependency | Low | Critical | §32.17 |
| T11 | **Transactional email unauthenticated** — confirmations spam-foldered or rejected, reset mail undeliverable, domain spoofable | **High if unaddressed** | High | §32.16 |
| T11 | **Data-protection breach** in the `de`/`pl` locales | Low | High | §32.15 |
| T12 | **Denial of service / scraping load** | Medium | Medium | §32.13, CDN |

### What is explicitly *not* in this model

The published-personal-card-number exposure documented in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.6 belonged to the **adjacent business**
and does not apply here (D2). The new build launches with WayForPay and an on-site card flow, so
no bank detail is ever published and no manual reconciliation step exists. That removes an entire
class of fraud, and it is worth stating explicitly so nobody re-introduces "just put the card
number in the footer" as a convenience six months from now.

**An entire second class is absent because of [00-client-decisions-2.md](00-client-decisions-2.md)
E12.** There are no customer accounts, so there is no customer credential store to breach, no
customer login to brute-force, no customer password-reset flow to abuse as an account-takeover
primitive, no customer session to hijack, and no account-takeover path to a saved payment method
or a saved address. These are not mitigated risks with residual exposure; they are threats that
have no attack surface to act on. §32.3 states the full list.

### The residual impersonation risk

T5 survives regardless, because the brand's most copyable asset is its photography. Mitigations
are cheap and are all in the build: a published image licence
([29-seo-architecture.md](29-seo-architecture.md) §29.11), a consistent and asserted identity in
`sameAs` (§29.6), a single official payment path stated plainly on the site ("we never ask for a
transfer to a personal card"), and a verified Google Business Profile. None of these stops a
copycat; together they make the real business the one that is verifiable.

---

## 32.2 Commerce fraud controls

### Card payments (T1)

- **Hosted payment fields or a PSP redirect.** Card data never touches the application, never
  reaches a log, never reaches the database. §32.14.
- **3-D Secure enabled** for every card transaction. It moves chargeback liability to the issuer
  and is the single highest-value setting on a PSP account.
- **Server-side amount authority.** The charge amount is computed server-side from `Order.totalMinor`
  and compared against the webhook payload before the order is marked paid. A mismatch fails the
  order and alerts. Trusting a client-submitted amount is the classic e-commerce vulnerability.
- **Velocity limits:** 3 payment attempts per order, 5 per IP per hour, 10 per email per day.
  Exceeding them requires a manual review, not a silent block.
- **Failed-payment pattern alerting:** many small-value attempts from one IP or one BIN range is
  card testing and pages immediately.

### COD (T2)

COD is retained deliberately — it answers anxiety A4 in
[02-ux-research.md](02-ux-research.md) §2.4 and is a genuine trust fallback in the Ukrainian
market. It is also the most abusable payment method in the catalogue.

| Control | Rule |
|---|---|
| Phone verification | An SMS or Viber code is required for COD orders above `{{COD_VERIFY_THRESHOLD}}` UAH |
| COD ceiling | COD unavailable above `{{COD_MAX}}` UAH; card or partial prepayment only |
| Partial prepayment | Offered as the alternative above the ceiling |
| First-order limit | A phone/email with no delivered-order history has a lower COD ceiling |
| Blocklist | Phone and address hashes of confirmed refusals, checked at checkout, managed in the admin with an audit entry |
| Refusal-rate metric | Tracked per month ([31-analytics-architecture.md](31-analytics-architecture.md) §31.5). A rising rate is a signal to tighten thresholds, and it is the only way to know the settings are right |
| One-of-one items | `Product.isUniquePiece` items are **never** COD-eligible. A refused one-of-one has been unavailable for sale for a week, and there is no second unit |

The last row matters more than it looks: handmade one-of-one stock
([00-assumptions.md](00-assumptions.md) B4) is the highest-margin, least-replaceable inventory in
the catalogue, and blocking a COD refusal on it is worth more than the orders it costs.

---

## 32.3 No customer authentication — the attack surface that does not exist

> «Сайт назавжди працює в режимі гостьових покупок.»
> — [00-client-decisions-2.md](00-client-decisions-2.md) E12

**There are no customer accounts, and there never will be.** This section previously specified a
customer authentication system — magic links, optional passwords, account linking from guest
orders. All of it is removed from scope. What replaces it is a list of things that cannot happen,
which is a better security outcome than any of the controls it replaces.

### What is removed, and what each removal is worth

| Removed | Threat class eliminated |
|---|---|
| Customer registration and login | No customer credential endpoint to attack. **Credential stuffing against customers is not a partially-mitigated risk here; it has no target.** This matters because credential stuffing is the single most common real-world account compromise, and it requires no skill and no targeting |
| Customer password storage | **No customer password hashes exist in the database.** A full database compromise discloses no customer credential, so it cannot seed credential-stuffing attacks against the customer's bank or email. This is the largest single item on the list, because password reuse means a breached customer hash is a liability far beyond this site |
| Customer password reset / email verification | Reset flows are a classic account-takeover primitive — token leakage via `Referer`, host-header poisoning, race conditions on token reuse. None of that exists |
| Customer session management | No customer session cookie, no customer session fixation, no customer session hijacking, no "log out everywhere" for customers to get wrong |
| Magic-link issuance | No token issuance endpoint to enumerate accounts against or to use as a spam relay against arbitrary email addresses |
| Account pages: profile, saved addresses, order history, saved payment methods | No authenticated surface aggregating a customer's history behind one credential. **The blast radius of a single compromised customer identity is one order, not a lifetime of them** |
| Wishlist merge-on-login ([25-database-schema.md](25-database-schema.md) §25.8b) | A merge flow joining anonymous state to an identity is a well-known source of cross-account data leakage. `WishlistItem` is removed from the schema entirely |

### The GDPR consequence

The reduction is not only in attack surface. With no accounts there is no persistent authenticated
identity, no credential to disclose in a processing record, no login-protected profile to export
under a portability request, and no customer password to include in a breach notification. The
personal-data inventory in §32.15 shrinks accordingly, and so does the work of defending it.
[31-analytics-architecture.md](31-analytics-architecture.md) §31.2 makes the same point from the
analytics side.

### What remains, and how it is secured

| Capability | Mechanism | Control |
|---|---|---|
| Browse, search, cart, checkout | Anonymous session | Cart token cookie, `SameSite=Lax`, no personal data |
| **Track an order** | `Order.guestToken` — a 32-byte cryptographically random value in the confirmation email | Constant-time comparison; bound to one order; never enumerable (T9). The token *is* the credential, so it is treated as one: never logged, never in a `Referer`-leaking query string on a page with external links, and never displayed in the admin's exportable views |
| Order lookup form | Order number **plus** the email on the order | Both must match. Rate-limited (§32.13). The response is identical for "no such order" and "email does not match", so the form is not an order-enumeration oracle |
| Leave a review | No account. The verified badge requires `orderId` linkage, set server-side only ([25-database-schema.md](25-database-schema.md) §25.6) | §32.13 |
| Wishlist | `localStorage`, device-local, no server record | Nothing to secure server-side. The UI states «Збережено на цьому пристрої» so nobody expects it to survive a device change |
| Address prefill on repeat purchase | First-party cookie on the same device | Not a strictly-necessary cookie — it holds name, phone and address, so it sits under functionality consent ([31-analytics-architecture.md](31-analytics-architecture.md) §31.3) and is cleared on consent withdrawal |
| Marketing consent | Checkbox at checkout writing to `NewsletterSubscriber`, double opt-in | Independent of any account concept (§32.15) |

`Customer` remains in the schema as an **order-derived record**, never an authenticated identity.
`passwordHash` is removed from the model outright rather than left nullable — a nullable password
column on a system with no login is an invitation for someone to build one later without revisiting
this section.

### The one thing this costs

Order tracking now depends entirely on the customer keeping the confirmation email, or on
remembering the order number and the email address used. There is no "log in and look it up"
fallback. The mitigations are operational rather than technical: the order number is short and
readable, the confirmation email is sent immediately and again on dispatch, and the lookup form is
linked from the footer in every locale. On a business with two owners who answer their own phones
([00-client-decisions-2.md](00-client-decisions-2.md) E3), a customer who cannot find their order
calls, and that path works.

---

## 32.4 Staff authentication

**Staff authentication is entirely unaffected by E12** and everything in §32.4–§32.6 stands in
full. Removing customer accounts removes customer-side risk; it does not make the admin panel any
less valuable a target. If anything it concentrates the value: with no customer-side credentials
anywhere in the system, **the staff credential is now the only credential that exists**, and it
reaches everything.

Staff compromise is therefore the critical threat (T4). A single compromised admin account reaches
the full catalogue, every order, every customer record and the payment configuration.

Note also a change in the seed, from [00-client-decisions-2.md](00-client-decisions-2.md) E1:
there are **two Owner accounts** — Іван Гондурак and Любов Гондурак — rather than one Owner plus a
weakened Administrator role. The Administrator role keeps its three-permission restriction for
everyone else ([24-employee-permission-architecture.md](24-employee-permission-architecture.md)
§24.5). Both Owner accounts are subject to every control in this section, including the Phase-2
mandatory 2FA below; two privileged accounts means two accounts to protect, and the seeded
credential rotation in §32.6 applies to both.

### Token architecture

| Token | Lifetime | Storage | Contents |
|---|---|---|---|
| Access token | 15 min | **In memory only** (never `localStorage`) | `sub`, `sessionId`, `roles[]`, `permVersion`, `iat`, `exp` |
| Refresh token | 14 days, rotating | `httpOnly; Secure; SameSite=Strict; Path=/api/auth` cookie | Opaque random value; only its hash is stored |

### Why `httpOnly` cookies rather than `localStorage`

`localStorage` is readable by any JavaScript executing on the origin. The site renders
admin-authored rich text (T6, §32.9); one XSS in the admin, and every token in `localStorage` is
exfiltrated. An `httpOnly` cookie is not readable by script at all, so the same XSS can at worst
ride the session while the page is open — bad, but bounded, and detectable. That is the entire
argument, and it is sufficient.

The cost is CSRF exposure, which cookies reintroduce and §32.10 addresses. This is a deliberate
trade: CSRF has a complete, well-understood mitigation; token exfiltration does not.

`SameSite=Strict` is used rather than `Lax` because the admin has no legitimate cross-site entry
point. The storefront's cart cookie uses `Lax`, because a customer following a link from the
Google Business Profile, a messenger, an email or a search result into a cart must keep the cart.

### Refresh rotation and `StaffSession`

[25-database-schema.md](25-database-schema.md) §25.7 defines `StaffSession { refreshTokenHash,
ipAddress, userAgent, deviceLabel, lastSeenAt, expiresAt, revokedAt, revokedById }`. Only the hash
is stored — a database read cannot yield a usable token.

On each refresh: verify the hash against a non-revoked, unexpired row; issue a new refresh token;
mark the old one used; update `lastSeenAt`. **If a refresh token is presented twice, it has been
stolen** — the legitimate client already rotated it. The response is to revoke the entire session
family for that user, force re-authentication, write an `AuditLog` entry, and alert. Reuse
detection is the main reason rotation is worth implementing at all.

`ipAddress` and `userAgent` are informational, shown in an admin "active sessions" list so a staff
member can see and terminate their own sessions. They are **not** used as a binding control:
mobile IPs change constantly and IP-bound sessions would log people out on the road.

### The `permVersion` claim

The access token carries a `permVersion` copied from the user's current permission state. Any role
or grant change increments it, and every request compares the token's value against the stored
one. A mismatch forces a refresh. This closes the 15-minute window in which a demoted or suspended
staff member would otherwise keep their old rights — which is exactly the window that matters when
someone is being removed for cause.

---

## 32.5 Authorisation

Full model in
[24-employee-permission-architecture.md](24-employee-permission-architecture.md); the schema is
[25-database-schema.md](25-database-schema.md) §25.7.

### The rule

> **UI hiding is never the only control.** A hidden button is a usability decision. Authorisation
> happens on the server, on every request, at the layer that touches data.

Hiding an action a user cannot perform is correct and should be done — it prevents confusion and
accidental attempts. It is worth exactly nothing as a control, because the underlying endpoint is
a `curl` away.

### Enforcement points

| Layer | Enforcement | Failure mode without it |
|---|---|---|
| Edge | Authenticated-session check on `/admin/*`, `/api/admin/*` | Unauthenticated access to admin routes |
| Route handler | Declarative `requirePermission('products.publish')` on the handler definition | A new endpoint ships with no check |
| Service | Permission re-checked where a service is reachable from more than one route | A second caller bypasses the first caller's check |
| Data | Row-level scoping — `assignedToId`, soft-delete filtering via Prisma middleware | Cross-tenant or cross-assignment reads |
| Field | Sensitive fields (`Order.internalNote`, cost prices, `Lead.internalNote`) stripped by the serialiser unless permitted | Data leaks through a shared response shape |
| UI | Menus and buttons hidden by capability | Confusion only |

All six layers are **staff-side**. There is no customer-side authorisation layer, because there is
no customer-side authentication to authorise against (§32.3).

The route-handler check is **declarative and mandatory**: the handler type requires a permission
key, so a handler without one does not compile. A convention that someone must remember is a
convention that will eventually be forgotten; a type error is not.

### Resolution rules

- Permissions come from roles, plus per-user `StaffPermissionGrant` overrides.
- **`DENY` always beats `ALLOW`**, from any source, with no exception. An explicit deny is a
  decision someone made deliberately.
- Expired grants (`expiresAt`) are evaluated at check time, not by a cleanup job.
- `Permission.isDangerous` forces a re-authentication or a typed confirmation in the admin —
  deletion, refunds, permission changes, export of customer data.
- Every authorisation **failure** is logged with actor, resource and route. A cluster of failures
  from one account is either a misconfigured role or an attack, and both need attention.

### Customer-side order access

With no accounts (§32.3), there is exactly one path to an order: **a valid `guestToken`, or the
order-number-plus-email lookup form.** `Order.customerId` is a reporting link, never an access
credential — a session cannot "be" a customer, so it can never match one.

- `guestToken` is 32 bytes of CSPRNG output, compared in constant time, scoped to one order, and
  never reused across orders.
- The lookup form requires both the order number and the email stored on that order, and it is
  rate-limited (§32.13). A mismatch and a non-existent order return the same response, so the form
  cannot be used to enumerate order numbers or to confirm that an address has purchased.
- IDs are `cuid2` ([25-database-schema.md](25-database-schema.md) §25.1), so they are not
  guessable — but the token check runs regardless. **Unguessable identifiers are a defence-in-depth
  measure, never an access control**, and that rule does not relax just because the alternative
  credential no longer exists.

This is a narrower surface than the account model it replaces: one order per credential, and the
credential is delivered to an address the customer already controls.

---

## 32.6 Passwords, brute force and lockout

**This section is staff-only.** There are no customer passwords in this system (§32.3), so every
control below applies to `StaffUser` and to nothing else. That is worth stating at the top rather
than qualifying row by row, because a policy written as if it covered customers too would be
implemented that way.

### Hashing

**Argon2id**, parameters: `memoryCost = 64 MiB`, `timeCost = 3`, `parallelism = 4`, 16-byte salt,
32-byte output.

Argon2id over bcrypt because it is memory-hard, which is what defeats GPU and ASIC cracking;
bcrypt's 72-byte input truncation is also a real footgun. bcrypt at cost 12 is the acceptable
fallback if the deployment platform cannot supply a native Argon2 binding — that is a deployment
constraint, not a security preference, and it is recorded rather than silently chosen.

Parameters are stored **with** the hash (Argon2's encoded format does this natively) so they can be
raised later and old hashes upgraded transparently on next successful login.

### Password policy

- Minimum 12 characters. Staff only — there is no customer password tier.
- **No composition rules.** Forced symbols and digits produce `Password1!` and a sticky note.
  Length plus a breach check is strictly better, and this follows current NIST guidance rather than
  2005 habit.
- **Breach check** against the Have I Been Pwned k-anonymity range API at set and change time. A
  known-breached password is rejected with a clear explanation. Only the first five characters of
  the SHA-1 hash leave the server.
- **No forced rotation on a schedule.** Rotation is forced on compromise, on role change to owner,
  and on first login for the seeded owner account
  ([25-database-schema.md](25-database-schema.md) §25.11).
- `passwordChangedAt` invalidates every token issued before it.

### Brute force and lockout

| Control | Rule |
|---|---|
| Per-account | `failedLoginCount` increments; at 5, `lockedUntil` is set to +15 min. At 10 within an hour, locked until an administrator releases it |
| Per-IP | 20 login attempts per 15 minutes across all accounts, then a hard block |
| Timing | Constant-time comparison; a dummy hash is verified when the account does not exist, so response time does not reveal account existence |
| Response | Identical error text for wrong password, unknown account, and locked account (T9) |
| Notification | An email to the account owner on lockout and on any successful login from a new device |
| Progressive challenge | A CAPTCHA appears after 3 failures, before lockout — so a legitimate user who mistyped is not locked out of their own store |
| Audit | Every failure and every lockout writes to `AuditLog` |

Lockout is a denial-of-service vector: anyone who knows a staff email can lock it. That is why
per-IP limiting and the progressive challenge come first, why lockout is time-boxed rather than
permanent, and why an administrator can always release an account. A permanent lockout on a
four-person team is an outage.

### Session invalidation and force logout

- A staff member can revoke any of their own sessions from the admin.
- An owner or administrator can revoke any session for any user, and can suspend an account, which
  revokes every session immediately (`StaffStatus.SUSPENDED`).
- `revokedAt` is checked on **every** refresh. Revocation therefore takes effect within one access
  token lifetime, 15 minutes at worst — and immediately for anything that re-checks `permVersion`
  (§32.4).
- A password change revokes all sessions except the current one.
- A "log out everywhere" action revokes all sessions including the current one.
- An expired-session sweep runs nightly; `StaffSession.expiresAt` is indexed for it.

### 2FA — mandatory at launch, for every staff account

[00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 4 replaces the phased plan that stood here. Every staff login is password plus a
6-digit TOTP (Google Authenticator or any RFC 6238 app), with an optional 7-day remembered
device. Full specification — enrolment, replay guard, recovery codes, the sole-Owner break-glass
procedure — in [24-employee-permission-architecture.md](24-employee-permission-architecture.md)
§24.11.

Two consequences for this document:

- **The per-account lockout (above) now also counts wrong codes**, and a challenge token dies
  after 5 of them. Without that, a stolen password plus unlimited guesses defeats a 6-digit code.
- **The new-device email notification** goes to the staff member's external login address —
  never into the panel mailbox ([00-client-decisions-7.md](00-client-decisions-7.md) §K2 rule 3).

---

## 32.7 Input validation

### One boundary, one schema

**Zod schemas are defined once in a shared package** and imported by both the React form and the
API handler. The client validates for user experience; the server validates for security. They are
never two separate definitions, because two definitions drift and the drift is always in the
direction of the server being more permissive than anyone believes.

```ts
// packages/contracts/src/checkout.ts — imported by client and server
export const shippingAddressSchema = z.object({
  fullName:   z.string().trim().min(2).max(120),
  phone:      z.string().regex(/^\+380\d{9}$/),
  city:       z.string().trim().min(2).max(120),
  carrier:    z.enum(['NOVA_POSHTA', 'UKRPOSHTA', 'PICKUP', 'INTERNATIONAL']),
  warehouseRef: z.string().max(64).optional(),
  note:       z.string().max(500).optional(),
}).strict();
```

Rules:

- **`.strict()` everywhere.** Unknown keys are rejected, not stripped. Silently discarding an
  unexpected field hides both a client bug and a probe.
- **Parse at the boundary, then trust the type.** The handler receives a parsed, typed object.
  Nothing downstream re-checks shape.
- **Every string has a maximum length.** An unbounded string is a memory and storage attack.
- **Money is never accepted from the client.** Prices, totals, discounts and shipping are computed
  server-side from the database. The client sends variant IDs, quantities and a coupon code; it
  never sends a number that becomes money.
- **Enums are enums**, never free strings validated by a comparison.
- **File uploads validate content, not the filename** (§32.12).
- **Query parameters are validated too.** Pagination, sort and facet values are a common injection
  and resource-exhaustion vector. `per` is capped; `page` is bounded; unknown facet keys are
  rejected.
- **Validation failures return a field-keyed error map**, never a raw Zod dump — an internal schema
  shape is information disclosure and it is unreadable to a user.

---

## 32.8 Output encoding and XSS

React escapes interpolated values by default, which handles the large majority of output. The risk
concentrates in the small number of places that bypass it.

### The four dangerous surfaces

| Surface | Risk | Control |
|---|---|---|
| Blog rich text (`PostTranslation.bodyJson`) | Authored content rendered as markup | Sanitised allow-list, §32.9 |
| JSON-LD injection | An unescaped `<` or `"` in a product name breaks out of the script block | Serialise with `JSON.stringify`, then escape `<`, `>`, `&`, U+2028, U+2029 |
| SSR state hydration | The same break-out risk in the `window.__DATA__` payload | Same escaping, plus the payload is a JSON string parsed with `JSON.parse`, never an object literal |
| User-supplied URLs (`Lead.website`, review links) | `javascript:` and `data:` schemes | Scheme allow-list: `http`, `https`, `mailto`, `tel`. Everything else is rendered as inert text |

Supporting rules: `dangerouslySetInnerHTML` is **lint-banned** outside the single sanitised
rich-text renderer; `rel="noopener noreferrer"` on every external link; review and lead content is
rendered as plain text with newline handling only — never as markup, because there is no reason
for a customer to submit formatting.

---

## 32.9 Rich-text sanitisation policy

`PostTranslation.bodyJson` is a structured document, not an HTML string
([25-database-schema.md](25-database-schema.md) §25.8), which is a meaningful security advantage:
**the renderer maps known node types to known components**, so an unknown node type is dropped
rather than rendered. There is no path by which arbitrary HTML reaches the page.

### The allow-list

| Node type | Permitted attributes |
|---|---|
| `paragraph`, `heading` (levels 2–4 only) | — |
| `bulletList`, `orderedList`, `listItem` | — |
| `bold`, `italic`, `strike`, `code` | — |
| `link` | `href` (scheme allow-list), `title`. `rel` and `target` are set by the renderer, never authored |
| `image` | `mediaId` only — resolved server-side to a `Media` row. **No raw `src`** |
| `blockquote`, `codeBlock` | `language` from a fixed list |
| `table`, `tableRow`, `tableCell` | `colspan`, `rowspan` as bounded integers |
| `productEmbed`, `faqBlock`, `specTable`, `callout` | Custom nodes taking entity IDs only |

`h1` is excluded because the page owns its single `h1`
([29-seo-architecture.md](29-seo-architecture.md) §29.5). Raw HTML, `script`, `iframe`, `style`,
`object`, `embed` and event-handler attributes have no node type and therefore cannot exist.

### Defence in depth

1. **Sanitise on write.** The API validates `bodyJson` against a Zod schema mirroring the
   allow-list. An invalid document is rejected at save, so the database never holds unsafe content.
2. **Sanitise on render.** The renderer ignores unknown node types and unknown attributes. Even a
   document inserted directly into the database cannot render arbitrary markup.
3. **Regenerate `bodyPlain` server-side** from the sanitised `bodyJson`, never from client input.
   `bodyPlain` feeds search and AI extraction
   ([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.4); a poisoned `bodyPlain`
   would propagate into places nobody is watching.
4. **CSP is the backstop** (§32.11). Even a successful injection cannot execute an inline script.

Who can author is also a control: `posts.publish` is a distinct permission, and the content role
has it while no lower role does. Rich-text authoring is effectively a trusted operation and is
treated as one.

---

## 32.10 SQL injection, Prisma, and CSRF

### What Prisma does and does not protect against

**Protects:** every query built through the Prisma Client API. Values are sent as parameters, not
interpolated into SQL. Standard CRUD, filters, relations and transactions are safe by construction.

**Does not protect:**

| Gap | Risk |
|---|---|
| `$queryRawUnsafe` / `$executeRawUnsafe` | Direct string interpolation. **Lint-banned; a build failure, not a warning.** |
| `$queryRaw` with template interpolation | Safe *only* when the interpolated values are parameters. Interpolating a **column or table name** is injection — and this is the case people get wrong, because the tagged-template syntax looks safe |
| Dynamic `orderBy` / column selection from user input | Not SQL injection as such, but user-controlled identifiers must come from an allow-list, never be passed through |
| Full-text search configuration | The `tsvector` GIN search ([25-database-schema.md](25-database-schema.md) §25.10) uses raw SQL. The query string is a **parameter**; the text-search configuration name is a constant |
| Database-level authorisation | Prisma has no opinion. `AuditLog`'s `REVOKE UPDATE, DELETE` (§25.7) is a migration-level grant and the only thing making the audit log real |

Rules: raw SQL requires a `// prisma-raw-reviewed:` comment and a second reviewer; the application
connects as a role with no `DROP`, no `CREATE`, and no write access to `AuditLog` beyond `INSERT`;
migrations run under a separate, higher-privileged role that the application never uses.

### CSRF

Cookie-based auth (§32.4) means the browser attaches credentials to cross-site requests
automatically. Three layers:

1. **`SameSite=Strict` on the admin refresh cookie**, `Lax` on the storefront cart cookie. This
   alone stops the great majority of CSRF, but it is not sufficient alone — `Lax` still permits
   top-level `GET` navigation, and browser support is not a guarantee.
2. **Double-submit token** on every state-changing request. A random value in a readable cookie
   plus the same value in an `X-CSRF-Token` header; the server compares them. The header cannot be
   set cross-origin without CORS permission, which is not granted.
3. **`Origin` header check** on every `POST`/`PUT`/`PATCH`/`DELETE`, against an allow-list of the
   canonical host. Requests with a missing or mismatched `Origin` are rejected.

Supporting rules: `GET` never mutates state — a `GET` that changes something is a CSRF
vulnerability by definition; CORS allows only the site's own origins, with `Allow-Credentials` and
no wildcard; the PSP webhook endpoint is **exempt from CSRF** (it is not browser-originated) and is
instead protected by HMAC signature verification.

### Webhook security (T8)

A forged "payment succeeded" callback is the highest-impact low-likelihood threat in the model.

**Nothing about WayForPay's callback is written here from memory.**
[00-client-decisions-2.md](00-client-decisions-2.md) E10 records three open verifications that all
land on this endpoint: **V7** — the signature algorithm and the exact field order used to compute
the request and response HMAC; **V8** — the service-URL payload shape, the acknowledgement response
WayForPay expects, and its retry behaviour; **V9** — refund and partial-refund API support. The
controls below are the invariants that hold for any PSP; the parameters they take must be read
from WayForPay's current official documentation before implementation.

A guessed signature scheme is the specific failure worth naming: **field order is part of the
HMAC**, and a wrong field order produces a verifier that rejects every legitimate callback. In
production that presents as orders that are paid at the PSP and unpaid in the system — which is
discovered by a customer, not by monitoring, unless the failure alert below is wired first.

- **Signature verification** using WayForPay's documented HMAC scheme and field order (V7),
  compared in constant time, **before the body is parsed**.
- **Timestamp tolerance** of 5 minutes to block replay, if the payload carries a timestamp (V8).
  If it does not, idempotency plus amount re-verification carry the replay defence alone, and that
  fact is recorded rather than assumed away.
- **The acknowledgement response is whatever WayForPay specifies** (V8). A PSP that does not
  receive the acknowledgement it expects will retry, indefinitely in some implementations, which
  makes idempotency load-bearing rather than defensive.
- **`PaymentTransaction.idempotencyKey` is unique** ([25-database-schema.md](25-database-schema.md)
  §25.5); a duplicate is acknowledged with 200 and ignored.
- **Amount and currency are re-verified** against `Order.totalMinor` before the status changes.
- **`rawPayload` is retained** for dispute resolution, with card data absent by construction.
- **Verification failures return 401 and alert.** A cluster of failures is either a PSP
  configuration error or an attack, and both need a human.

---

## 32.11 Security headers

Applied at the edge to every response. A header set defined in code and version-controlled, never
in a hosting console where it is invisible to review.

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(self),
                    interest-cohort=(), usb=(), magnetometer=(), accelerometer=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
X-Frame-Options: DENY
```

`X-Frame-Options: DENY` is retained alongside CSP `frame-ancestors` for older browsers; where they
disagree, modern browsers use CSP. HSTS is submitted to the preload list only **after** the domain
is settled ([00-client-decisions.md](00-client-decisions.md) D6.1) and HTTPS is confirmed stable on
every subdomain — preload is difficult to reverse and a premature submission can strand a
subdomain. `geolocation=(self)` is permitted only because the contact page may offer directions;
it is removed if that feature is not built.

### Content-Security-Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{{RANDOM}}' https://www.googletagmanager.com https://plausible.{{DOMAIN}};
  style-src 'self' 'nonce-{{RANDOM}}';
  img-src 'self' data: blob: https://img.{{DOMAIN}} https://res.cloudinary.com https://www.googletagmanager.com;
  media-src 'self' https://img.{{DOMAIN}} https://res.cloudinary.com;
  font-src 'self';
  connect-src 'self' https://plausible.{{DOMAIN}} https://www.google-analytics.com
              https://region1.google-analytics.com https://*.sentry.io;
  frame-src https://{{WAYFORPAY_ORIGIN}};
  form-action 'self' https://{{WAYFORPAY_ORIGIN}};
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
  report-uri /api/csp-report;
  report-to csp-endpoint;
```

Notes on each non-obvious decision:

- **Nonces, not `'unsafe-inline'`.** SSR generates a fresh nonce per request and stamps it on every
  inline script and style, including the hydration payload. `'unsafe-inline'` would make the CSP
  decorative, which is the most common way a CSP is deployed.
- **No `'unsafe-eval'`.** It is a build-configuration problem if anything needs it, not a policy
  exception.
- **Cloudinary appears twice** — `img-src` and `media-src` — because video is self-hosted through
  it (§29.12). With the recommended `img.{{DOMAIN}}` CNAME
  ([29-seo-architecture.md](29-seo-architecture.md) §29.11), `res.cloudinary.com` can eventually be
  dropped entirely, which is a real simplification of this policy.
- **`font-src 'self'` only.** Fonts are self-hosted ([10-typography.md](10-typography.md) §10.7.4).
  No CDN entry is needed and none is permitted.
- **`frame-src` and `form-action` carry the WayForPay origin, and that origin is a token, not a
  guess.** The PSP is resolved — WayForPay
  ([00-client-decisions-2.md](00-client-decisions-2.md) E10) — but **the exact hostname and the
  integration mode are not.** E10 V6 records that it is unknown whether this merchant gets a
  hosted redirect page, an embedded widget or a direct API integration, and each needs a different
  directive:

  | Integration mode | Directive required |
  |---|---|
  | Hosted redirect page | `form-action` only |
  | Embedded widget / iframe | `frame-src`, and `script-src` if the widget loads a script from WayForPay's origin |
  | Direct API | Neither, but `connect-src` may be needed |

  **Both directives are therefore specified, and `{{WAYFORPAY_ORIGIN}}` stays a token until the
  hostname is read from WayForPay's current official documentation.** Writing a hostname here from
  memory would be worse than leaving it unresolved: a CSP naming the wrong origin fails
  *silently at the moment of payment*, in production, for every customer, and the browser console
  message that explains it is on the customer's machine and not on anyone else's. The unused
  directive is deleted once V6 is answered; nothing is added.
  `form-action` is the control that stops an injected form posting credentials to an attacker's
  host, and it is the one directive that must be right before the first real transaction.
- **`frame-ancestors 'none'`** — nothing embeds this site, so clickjacking is structurally
  prevented.
- **Reporting first.** CSP ships in `Content-Security-Policy-Report-Only` for two weeks before
  enforcement, with reports reviewed. Shipping an untested CSP enforced breaks a page nobody tested.
- **The analytics entries are consent-dependent.** GTM/GA4 hosts remain in the policy because the
  tag may load after consent; the policy does not decide whether it loads
  ([31-analytics-architecture.md](31-analytics-architecture.md) §31.3).

---

## 32.12 File uploads

The admin uploads product photography, production imagery, video and blog covers. Uploads are one
of the highest-risk features in any CMS.

### Signed direct-to-Cloudinary flow

```
1. Admin requests an upload signature   →  server checks `media.upload` permission,
                                            validates declared type and size,
                                            returns a signature scoped to
                                            folder + resource_type + max bytes,
                                            valid for 60 seconds
2. Browser uploads directly to Cloudinary using the signature
3. Cloudinary returns public_id, format, dimensions, bytes
4. Browser posts the result to the API  →  server re-fetches the asset metadata
                                            from Cloudinary and validates it against
                                            the signature's constraints before
                                            writing a `Media` row
```

Step 4 is the one that is usually skipped and is the one that matters: without it, the client
reports what it uploaded, and the client can lie. The server asks Cloudinary.

Controls:

| Control | Rule |
|---|---|
| Upload secret | The Cloudinary API secret exists only on the server. A browser never sees it |
| Signature scope | Folder, resource type and a maximum byte count are baked into the signature; it cannot be reused for a different folder |
| Type validation | Magic-byte inspection, not the file extension and not the client's `Content-Type`. Allow-list: JPEG, PNG, WebP, AVIF, MP4, WebM |
| Size limits | 12 MB images, 200 MB video, enforced by the signature **and** re-checked server-side |
| SVG | **Rejected entirely.** SVG is an executable document format and a well-known XSS vector. Icons are React components ([12-iconography.md](12-iconography.md)), so no editor needs to upload one |
| Filename | Never used. `Media.publicId` is generated server-side from the product slug and role ([29-seo-architecture.md](29-seo-architecture.md) §29.11) — which removes path traversal, encoding tricks and duplicate names in one decision |
| Serving | Only from Cloudinary or the `img.{{DOMAIN}}` CNAME, never from the application origin. An asset served from the app origin inherits the app origin's trust |
| Rate limit | 60 signature requests per staff user per hour |
| Audit | Every upload writes an `AuditLog` entry with actor and resulting `publicId` |

### Personalisation and cache safety

Restating the rule from [29-seo-architecture.md](29-seo-architecture.md) §29.1, because it belongs
here as well: **no personalised content enters a cacheable document.** Cart contents, customer
names and order data are fetched client-side after hydration against `private, no-store` endpoints.
A cached HTML page containing one visitor's cart, served to another, is a data breach, not a
caching bug — and it is a genuinely easy mistake to make with SSR.

---

## 32.13 Rate limiting, bots and spam

### Rate limits

Token bucket in Redis, keyed by IP **and** by account or session where one exists — an IP-only limit
punishes everyone behind a mobile carrier NAT, which in Ukraine is a large share of real traffic.

| Endpoint | Limit | Response |
|---|---|---|
| Staff login | 5 / 15 min per account, 20 / 15 min per IP | 429 + `Retry-After` |
| Staff password reset | 3 / hour per email | 429 |
| **Order lookup form** | 5 / 15 min per IP, 10 / hour per email | 429, identical response whether the order exists |
| Checkout submit | 5 / 10 min per session | 429 |
| Payment attempt | 3 per order | Hard block, manual review |
| Lead form | 3 / hour per IP | 429 |
| Review submit | 2 / day per IP, 1 per product per email | 429 |
| Newsletter | 3 / hour per IP | 429 |
| Site search | 30 / min per session | 429 |
| Catalogue API, unauthenticated | 120 / min per IP | 429 |
| Upload signature | 60 / hour per staff user | 429 |
| Admin write operations | 300 / min per user | 429 |

CDN-level DDoS protection and bot management sit in front of all of it. Application rate limits
exist for abuse that looks like legitimate traffic; the CDN handles volume.

### Spam mitigation without breaking accessibility

T3 is the highest-likelihood threat in the model, and the standard mitigation — a CAPTCHA on every
form — is directly contrary to [08-design-system.md](08-design-system.md) §8.3 ("Legible at 65")
and to Accessibility 100. Layered, least-intrusive-first:

| Layer | Mechanism | Accessibility cost |
|---|---|---|
| 1. Honeypot | A hidden field, `aria-hidden`, `tabindex="-1"`, `autocomplete="off"`, positioned off-screen — **not** `display:none`, which some bots detect. A filled value is silently discarded | **None** |
| 2. Timing | A form submitted under 3 seconds after first field focus is a bot. Server-side, using a signed timestamp issued with the form | **None** |
| 3. Server-side heuristics | Link count in the message body, Cyrillic/Latin mixing anomalies, known spam phrases, disposable-email domains. Flags to `LeadStatus.SPAM` or `ReviewStatus.PENDING` rather than rejecting | **None** |
| 4. Rate limiting | Above | None for humans |
| 5. Proof of work / invisible challenge | Cloudflare Turnstile or Altcha, invisible by default, only escalating to an interactive challenge on suspicion | Low — no image puzzle, screen-reader compatible |
| 6. Moderation | All reviews enter as `PENDING` ([25-database-schema.md](25-database-schema.md) §25.6); leads are triaged in the admin | None |

Layers 1–4 are free and catch the overwhelming majority of automated submissions. Layer 5 is only
reached by traffic that already looks suspicious. **A traditional image or audio CAPTCHA is never
used** — it fails the 60–75 audience, fails assistive technology, and the layered approach above
performs better anyway.

Additional review-specific controls: an email is required (never displayed); `isVerifiedPurchase`
requires a real `orderId` linkage and is never set by hand
([25-database-schema.md](25-database-schema.md) §25.6); only verified reviews feed
`AggregateRating` ([29-seo-architecture.md](29-seo-architecture.md) §29.6), which removes the
commercial incentive to spam reviews in the first place.

---

## 32.14 PCI scope and payment data

**The application is never in scope for card data.** This is achieved structurally, not by policy.

| Model | PCI scope | Verdict |
|---|---|---|
| Card fields rendered by the application | SAQ D — full annual audit, quarterly scans, penetration testing | Unaffordable and unnecessary |
| **PSP-hosted iframe fields or a full redirect** | **SAQ A** — a short self-assessment questionnaire | **Chosen** |

With hosted fields or a redirect, the card number never enters the application's DOM, never
traverses its servers, never reaches a log, and never reaches the database. `PaymentTransaction`
stores a provider reference and the webhook payload, and the payload contains no PAN by
construction.

Supporting rules: no card data in logs, in Sentry (§31.10 PII scrubbing), or in `AuditLog`; refunds
are initiated through the PSP API, never by storing anything reusable.

### WayForPay specifically

`{{PSP}}` resolves to **WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md) E10).
The reasoning above is unchanged by that — SAQ A versus SAQ D is a property of *where the card
fields render*, not of which provider renders them — but the SAQ A claim is only valid once the
integration mode is confirmed to be a hosted or PSP-rendered one.

**Do not write WayForPay API specifics from memory anywhere in this build.** The following are
open and are Phase-0 tasks ([00-client-decisions-2.md](00-client-decisions-2.md) E10):

| # | Must be confirmed from WayForPay's current official documentation | Affects |
|---|---|---|
| V6 | Integration mode available to this merchant: hosted redirect page, embedded widget, or direct API | SAQ scope, the CSP directives (§32.11), and the checkout step design in [18-checkout-specification.md](18-checkout-specification.md) |
| V7 | Signature algorithm and the exact field order for request and response HMAC | §32.10 |
| V8 | Service-URL payload shape, expected acknowledgement, retry behaviour | §32.10, [31-analytics-architecture.md](31-analytics-architecture.md) §31.5 |
| V9 | Refund and partial-refund API support | Refund flow, `MerchantReturnPolicy` handling |
| V10 | Whether a ФОП on the simplified tax system can contract, and the onboarding document set | Blocks the contract. Requires `{{LEGAL_ID}}` (E13.1) |
| V11 | Supported currencies, and whether non-UAH settlement is possible for the EU locales | The `de`/`pl` checkout disclosure (E11) |

**If V6 returns "direct API", the SAQ A position is lost** and the scope rises to SAQ A-EP or
SAQ D depending on how the card fields are rendered. That is a material commercial and compliance
change, not a configuration detail, and it is the reason V6 is the first question rather than a
late one. The architecture here assumes hosted fields or a redirect; if the answer differs, this
section is revisited before any code is written, not after.

The redirect-versus-widget question also materially changes the checkout design and the CSP
(§32.11). Both are specified so the answer is a deletion rather than a redesign.

---

## 32.15 Personal data, GDPR and retention

### Inventory

| Data | Where | Basis | Retention |
|---|---|---|---|
| Name, email, phone, delivery address | `Order`, `Customer` | Contract | 3 years after the last order, then anonymised. Fiscal records retained separately per Ukrainian law |
| Order contents and value | `Order`, `OrderItem` | Contract + legal obligation | Per accounting law; the personal fields are anonymised while the financial record is kept |
| Payment reference and webhook payload | `PaymentTransaction` (WayForPay) | Contract, dispute resolution | 3 years |
| **Customer credentials** | **None exist.** `Customer.passwordHash` is removed from the model ([00-client-decisions-2.md](00-client-decisions-2.md) E12) | — | — |
| Address-prefill cookie — name, phone, address | Browser, first-party, device-local | Consent (functionality) | Until cleared or consent withdrawn. Never transmitted to a third party, never mirrored server-side |
| Review author name and email | `Review` | Consent (submission) | Until withdrawal; the email is never displayed |
| Lead contact details | `Lead` | Legitimate interest (B2B) | 2 years after last contact |
| Newsletter email + consent proof | `NewsletterSubscriber` | Consent, double opt-in | Until unsubscribe + 1 year for proof of consent |
| Staff records, sessions | `StaffUser`, `StaffSession` | Contract | Employment + 1 year |
| Audit log | `AuditLog` | Legal/security | 2 years |
| Analytics | GA4 (consented), Plausible (anonymous) | Consent / legitimate interest | GA4 14 months; Plausible aggregate only |
| Access logs, IPs | Server | Legitimate interest (security) | 30 days |
| Search queries | `SearchQueryLog` | Legitimate interest | 12 months; contains no identifier |

`Order.email` is retained rather than nulled for a period after anonymisation because a customer
who returns a ліжник eighteen months later needs to be findable — and with no accounts (§32.3) the
order record is the *only* way to find them. The purchase cycle here is long
([02-ux-research.md](02-ux-research.md) §2.3) and a retention schedule copied from a fast-moving
retailer would destroy records the business still needs.

**The inventory is materially shorter than it would be with customer accounts.** No credential
store, no profile, no saved-address table, no saved payment method, no login audit trail, no
account-deletion cascade. Every row above is order-derived or consent-derived, which makes both
the records-of-processing document and the DSAR routine simpler and less likely to be wrong.

### The legal entity

Every legal page, every policy, the offer contract and the German Impressum name the same seller
of record ([00-client-decisions-2.md](00-client-decisions-2.md) E1):

**ФОП Гондурак Любов Юріївна** — вул. Петруші, с. Яворів, Косівський район, Івано-Франківська
область, 78644.

`{{LEGAL_ID}}` — the ЄДРПОУ / РНОКПП — **exists and will be supplied on request**
([00-client-decisions-3.md](00-client-decisions-3.md) F1). That resolves the uncertainty but not
the dependency: it still blocks exactly three things, and all three gates stay closed until the
value is in hand.

| Blocked deliverable | Why it cannot proceed without it |
|---|---|
| WayForPay merchant contract (E10 V10) | The PSP requires the registration identifier on the merchant agreement. No contract, no card payments, no launch |
| Договір оферти and the returns policy | A Ukrainian public offer contract identifies the seller by registration identifier. Publishing one without it makes the contract unenforceable and misstates who the customer is contracting with |
| German Impressum | §5 TMG requires the registration identifier. A German Impressum without one is a non-compliant Impressum, and non-compliance is actionable by competitors under German law, not only by regulators |

The change from round 2 is one of **project management, not of risk**: this moved from a discovery
item — where the failure mode is "the client may not have one and we must then help them obtain
it" — to a chase item, where the failure mode is a delay. Chase it early anyway. It gates the
payment contract, and the payment contract has its own lead time
([35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3).

### Obligations

GDPR applies to `de` and `pl` visitors regardless of where the business or its servers sit, because
the site offers goods to EU data subjects. [00-client-decisions-2.md](00-client-decisions-2.md)
E11 makes those locales **transactional** rather than informational, which removes the last
argument that GDPR applies only by caution — the site takes money from EU consumers, so it applies
in full. The **EU standard is applied to all four locales** — running two regimes in one codebase
is a defect generator, and Ukraine's own regime (Law No. 2297-VI, with a draft alignment to GDPR
in progress) is broadly compatible and less prescriptive.

Obligations discharged in the build: a privacy policy per locale naming every processor
(Cloudinary, WayForPay, Nova Poshta, Google, Sentry, the email provider); a cookie policy and a
compliant consent banner ([31-analytics-architecture.md](31-analytics-architecture.md) §31.3);
double opt-in for the newsletter, which is required for `de`
([25-database-schema.md](25-database-schema.md) §25.9); data-processing agreements with every
processor; a records-of-processing document; encryption in transit and at rest; and breach
notification within 72 hours, which requires a **decided route and a named responsible person**
before launch, not after an incident.

### EU consumer law — the `de` and `pl` locale obligations

These follow from E11 and are legal requirements, not design preferences. A transactional locale
that ships without them is selling unlawfully into the EU.

| Obligation | Applies to | Requirement |
|---|---|---|
| **Impressum** | `de` | **Legally mandatory** under German law (§5 TMG / §18 MStV), on its own page, reachable in no more than two clicks from every page, labelled «Impressum» — not folded into the privacy policy and not labelled "About". It must name **ФОП Гондурак Любов Юріївна**, the full Yavoriv address, a telephone number and an email address at which the seller can be reached quickly and directly, and `{{LEGAL_ID}}` as the registration identifier. An email address alone is not sufficient contact detail |
| **14-day right of withdrawal** | `de`, `pl` | The consumer may withdraw within 14 days of receiving the goods, without giving a reason. Stated **before** the order is placed, not only in the confirmation email. The withdrawal period, how it is counted, and who bears the return cost must all be explicit |
| **Model withdrawal form** | `de`, `pl` | The statutory model form (Muster-Widerrufsformular / wzór formularza odstąpienia) must be **provided**, in the locale's language, as a downloadable or printable document and linked from the returns page and the order confirmation |
| **Withdrawal instructions in the confirmation** | `de`, `pl` | The confirmation email carries the withdrawal instructions and the form. Omitting them extends the withdrawal period substantially — in German law, by up to twelve months — which is a commercial exposure, not a technicality |
| **Price transparency** | `de`, `pl` | Total price including all taxes, plus shipping, plus the duty position, disclosed **before** payment. [00-client-decisions-3.md](00-client-decisions-3.md) F4 resolves the customs question: the **buyer pays everything**, including duties and import VAT — effectively DAP. See the subsection below; this is a statutory obligation, not a courtesy |
| **Shipping cost disclosure under the enquiry model** | `de`, `pl` | F4 makes international shipping **quoted per order**, so the shipping cost is unknown when the customer submits the enquiry. Article 6(1)(e) permits this — where charges cannot reasonably be calculated in advance, the fact that they will be payable must be stated instead. The enquiry step must therefore say plainly that shipping is quoted separately and that no payment is taken until the customer has seen the total. An enquiry form that reads like a checkout, with no price and no explanation, is the non-compliant version |
| **Settlement currency disclosure** | `de`, `pl`, `en` | If WayForPay cannot settle non-UAH (E10 V11), prices display converted but the charge is in UAH. The checkout must say so plainly, in the locale's language, before the payment step |
| **COD unavailable** | all non-UA | Card only outside Ukraine (E11). Stated at the shipping step, not discovered at payment |

### The duty disclosure is a legal obligation, not a courtesy

[00-client-decisions-3.md](00-client-decisions-3.md) F4 establishes that the buyer pays customs
duties and import VAT on every international order. The site must say so before payment. It is
worth being precise about why this belongs in a security and compliance document rather than in a
UX one, because the instinct is to treat it as a helpful note.

**The legal basis.** The EU Consumer Rights Directive (2011/83/EU) Article 6(1)(e) requires a
trader, before a distance contract binds the consumer, to give the total price of the goods
inclusive of taxes and **all additional freight, delivery, postal and any other charges** — and,
where those charges cannot reasonably be calculated in advance, to state that they may be payable.
Germany transposes this in §312d BGB with Art. 246a EGBGB; Poland in the ustawa o prawach
konsumenta. **Failing to disclose a charge means the consumer is not bound to pay it.** In German
practice the consequence is concrete: an undisclosed additional charge is not owed, and the
omission is also an unfair commercial practice actionable by competitors and consumer associations
through the Abmahnung mechanism, which reaches small foreign sellers as readily as large ones.

**The commercial basis, which points the same way.** An EU buyer handed an unexpected import-VAT
bill by the courier refuses the parcel. The shop then absorbs a return shipped from another
country, on goods weighing two kilograms, having already paid the outbound leg. This is the single
most common way small cross-border shops lose money, and it is entirely preventable by a sentence.

**What must be shown, where.** On the international path, before the pay button, in the locale's
own language and not machine-translated:

> «Ціна не включає митні збори та податки країни призначення. Їх сплачує отримувач при отриманні.
> Сума залежить від країни та вартості замовлення.»

Binding placement rules:

1. **Not in a collapsed accordion, not in a linked policy page, not in a tooltip.** The disclosure
   must be rendered, visible and adjacent to the price at the moment of the payment decision.
   "Available if the customer looks for it" does not satisfy a pre-contractual information duty.
2. **Not only in the confirmation email.** By then the contract is concluded and the disclosure is
   too late to be a disclosure.
3. **An affirmative acknowledgement is recommended but not sufficient on its own.** A checkbox
   creates a useful evidentiary record; it does not cure a disclosure that was hidden. Display
   first, acknowledge second.
4. **Logged as a compliance artefact.** `duty_disclosure_view`
   ([31-analytics-architecture.md](31-analytics-architecture.md) §31.4) records that the
   disclosure was rendered, and the acknowledgement is stored on the order. In a dispute the
   question is what the customer was shown, and an unlogged disclosure is an unprovable one.
5. **Applies to every non-UA destination**, not only `de` and `pl`. The EU locales create the legal
   obligation; the commercial reason applies to all of them, and running one rule is safer than
   running two.

**Free shipping never applies internationally**, regardless of order value (F4), and that too is
stated rather than discovered.

Note the interaction with §32.2: the 14-day withdrawal right is **broader** than the returns policy
the Ukrainian locale offers, and the `MerchantReturnPolicy` structured data in
[29-seo-architecture.md](29-seo-architecture.md) §29.6 must be emitted per locale rather than
site-wide. A single `applicableCountry: UA` return policy asserted on a German product page is
both wrong in structured data and a misstatement of a statutory right.

### The wool-only recommendation for `de` and `pl`

[00-client-decisions-2.md](00-client-decisions-2.md) E11 records a recommendation that carries
directly into this document: **launch the `de` and `pl` locales wool-only.**

| Category | EU import position |
|---|---|
| Wool goods | No species declaration, no CITES exposure. Straightforward |
| Sheepskin, leather | Species declaration required; some materials require CITES documentation. The paperwork is per-shipment, and getting it wrong means a seized or returned parcel at the seller's cost |

There is a second, non-regulatory reason pointing the same way: the German market carries an
ethical sensitivity to fur and hide products that wool does not attract
([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.12). A wool-led EU entry avoids
an objection the business is not currently equipped to answer with documentation.

**Implementation:** hide categories are excluded from the `de` and `pl` catalogues at the category
level — not merely untranslated, but not offered — and the checkout refuses EU destinations for
those SKUs at the server, not in the UI. Enable them per destination only after the paperwork
position is confirmed. A shipping rule enforced only in the front end is a shipping rule that a
direct API call ignores.

### Data-subject requests

| Right | Implementation | SLA |
|---|---|---|
| Access | Admin export producing a JSON bundle of every record keyed to the subject, **including mail threads** where they are the counterpart (§32.16a) | 30 days |
| Rectification | Direct edit, audited | 30 days |
| Erasure | `deletedAt` + a field-level anonymisation routine — name, email, phone and address replaced with tombstones while financial records survive with a synthetic reference. **Mail threads with the subject are hard-deleted with their R2 objects** | 30 days |
| Portability | The same JSON bundle | 30 days |
| Objection / withdrawal | Consent revocation and unsubscribe, self-service. Also clears the address-prefill cookie | Immediate |

Requests arrive at a dedicated mailbox, are logged in a register with dates, and require identity
verification proportionate to the request. **Erasure is not `DELETE`**: the routine is written and
tested before launch, because discovering that erasure cascades an order out of the accounts under
a 30-day clock is the wrong time to find out.

**Identity verification is harder without accounts, and the answer is not to relax it.** With no
login, a data subject cannot prove identity by authenticating. The proportionate test is
possession of the order: the order number plus the email on the order, confirmed by a reply to
that same email address. Requests that cannot meet it are declined with an explanation — GDPR
explicitly permits refusing a request where identity cannot be established, and disclosing an
order's contents to whoever emails in is itself the breach the process exists to prevent.

Note the upside: the bundle a DSAR produces is small and bounded — orders, reviews, newsletter
consent, lead records. There is no account history, no login log, no saved-payment record and no
behavioural profile behind a credential, because none of those exist (§32.3).

---

## 32.16 Email authentication and transactional deliverability

[00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com` as the
client's working address. **It is usable as a public contact address and it cannot be the site's
transactional sending address.** This is not a preference, a branding argument or a
recommendation — it is a technical constraint imposed by the receiving mail systems, and a build
that ignores it ships a shop whose order confirmations do not arrive.

### Why sending as `@gmail.com` fails

Three mechanisms, and they compound. The application would be sending mail through a transactional
provider (Postmark, Resend, SES, or similar) with a `From:` header of `gif19601@gmail.com`.

| Mechanism | What happens |
|---|---|
| **SPF** | The receiving server looks up `gmail.com`'s SPF record and asks whether the sending IP is authorised. It is not — the record lists Google's infrastructure, and neither the client nor this project can add a transactional provider to a DNS record for a domain Google owns. **SPF fails, and it cannot be made to pass.** |
| **DKIM** | A valid DKIM signature requires a private key whose public half is published at a selector under the signing domain. Publishing `selector._domainkey.gmail.com` is impossible for the same reason. Either the mail is unsigned, or it is signed by a different domain — which is why the alignment check below matters |
| **DMARC** | `gmail.com` publishes a DMARC policy for consumer accounts requiring alignment with SPF or DKIM. Mail that aligns with neither is handled per that policy: rejected outright by strict receivers, or delivered to spam by lenient ones |

The practical outcome is the one that matters commercially: **a customer pays and receives no
confirmation.** They then phone support, or assume the order failed and order again, or — with a
card payment of 5,000–15,000 UAH and no confirmation — dispute the charge with their bank. A
chargeback on a new merchant account is materially more expensive than the email infrastructure
that would have prevented it, and WayForPay's view of a merchant with early disputes is not a
position worth discovering.

A related failure that is easy to miss: **password-reset mail for staff accounts (§32.6) travels
the same path.** If transactional mail is unauthenticated, an administrator locked out at the wrong
moment cannot recover the account, because the reset message is in a spam folder they cannot reach
from the device they are locked out of.

### The required configuration

| Element | Value | Note |
|---|---|---|
| Sending domain | `{{DOMAIN}}`, or a dedicated subdomain such as `mail.{{DOMAIN}}` | A subdomain isolates transactional reputation from anything else the domain sends. Recommended |
| `From:` | `no-reply@{{DOMAIN}}` → `{{TRANSACTIONAL_FROM}}` | Must be on the sending domain. This is the constraint the whole section exists for |
| `Reply-To:` | A **monitored** address on `{{DOMAIN}}`, read in the admin panel (§32.16a; forwarded to Gmail only as the interim) | A `no-reply` address that swallows replies is a support failure. Customers reply to order confirmations; that is normal behaviour, not misuse |
| Public contact address | `{{BRANDED_EMAIL}}` on `{{DOMAIN}}`, read in the admin panel ([00-client-decisions-7.md](00-client-decisions-7.md) §K2) | The owners chose to move business mail into the panel. Until it ships, a forwarding rule to `gif19601@gmail.com` is the interim |
| **SPF** | One `TXT` record on the sending domain authorising the provider, ending `-all` | `~all` (softfail) is a half-measure that some receivers ignore. One record only — **two SPF records on one domain is a permanent fail**, and it is the most common misconfiguration in this area |
| **DKIM** | 2048-bit key, published at the provider's selector | The provider generates it; the DNS record is the client's or the deploying party's to publish |
| **DMARC** | `_dmarc.{{DOMAIN}}`, starting at `p=none` with `rua=` reporting, tightened to `p=quarantine` then `p=reject` after two weeks of clean reports | Starting at `p=reject` before reports confirm alignment can silently reject the shop's own mail. Ending at `p=none` leaves the domain spoofable, which is the phishing vector the record exists to close |
| Return-Path / bounce domain | Provider's, CNAME'd under `{{DOMAIN}}` where the provider supports it | Gives SPF alignment as well as SPF pass. Alignment is what DMARC actually evaluates |
| MX | Cloudflare Email Routing (§32.16a) | Independent of the sending path. A domain can send through a provider and receive elsewhere |

### The trust dimension, stated once

Separately from deliverability, a numeric personal Gmail as the public contact address on a site
selling 5,000–15,000 UAH craft goods reads as an individual rather than as a manufacturer with a
shop and a production floor ([00-client-decisions-3.md](00-client-decisions-3.md) F5). That is a
conversion cost rather than a security one and it is argued in
[29-seo-architecture.md](29-seo-architecture.md) §29.15. It is mentioned here only because the fix
is the same fix: once the sending domain exists, the branded contact address costs one more DNS
record and a forwarding rule.

### Dependency and sequencing

This work **blocks on `{{DOMAIN}}`** ([00-client-decisions-2.md](00-client-decisions-2.md) E9),
which is the only reason it is not already done. It is a Phase 1 blocker in
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3 rather than a launch-week task,
because DNS propagation, provider domain verification and the DMARC ramp each take days and they
run in sequence, not in parallel. Beginning this in launch week produces a launch with `p=none` and
unverified alignment, which is the configuration that silently degrades three months later when a
major receiver tightens its defaults.

**Interim position until the domain resolves:** `gif19601@gmail.com` may be displayed as a contact
address on the contact page. It may **not** be configured as `{{TRANSACTIONAL_FROM}}`, and it may
not be asserted in the `Organization` structured data
([29-seo-architecture.md](29-seo-architecture.md) §29.6). There is no interim transactional
configuration that works; the site cannot take card payments before the domain exists in any case,
so the two dependencies resolve together.

### Verification before launch

- [ ] SPF record present, exactly one, `-all`, includes the transactional provider
- [ ] DKIM selector resolves and the provider reports the key as verified
- [ ] DMARC record present with a working `rua=` mailbox someone reads
- [ ] A test order confirmation sent to a Gmail address, a Microsoft 365 address and a Ukrainian
      provider (ukr.net or i.ua) arrives **in the inbox**, with `SPF=pass`, `DKIM=pass`,
      `DMARC=pass` visible in the raw headers. Checked by reading headers, not by observing that
      the message appeared
- [ ] `Reply-To:` reaches a mailbox a human opens, verified by replying to the test message
- [ ] No transactional template anywhere in the codebase contains `@gmail.com` in a `From:` —
      a CI grep, because this is the kind of value that gets pasted back in during debugging
- [ ] Staff password-reset mail verified over the same path (§32.6)

---

## 32.16a Inbound mail — the panel as a mail client

[00-client-decisions-7.md](00-client-decisions-7.md) §K2 puts business mail in the admin panel.
That makes the panel the first thing an attacker's email reaches, **inside the same session
that can refund payments and change prices.** Pipeline in
[26-api-architecture.md](26-api-architecture.md) §26.16.2.

| Threat | Control |
|---|---|
| **Script in an email body** | HTML is sanitised **at ingest** with an allowlist (`sanitize-html`: no `script`, `style` attributes filtered, no `form`, `iframe`, `object`, `embed`, `base`, `meta`, event handlers or `javascript:` URLs), and the stored result is rendered in an `<iframe sandbox>` **without** `allow-scripts` or `allow-same-origin`, via `srcdoc`, under its own CSP `default-src 'none'; style-src 'unsafe-inline'; img-src data:`. Two independent layers: a sanitiser bug does not reach the admin origin |
| **Tracking pixels and remote content** | Remote images are blocked by default — they tell the sender when and from which IP an owner read the message. «Показати зображення» relaxes `img-src` for that message only; «Завжди для цього відправника» writes a `MailSenderRule` ALLOW. No server-side image proxy: fetching arbitrary URLs from the API is an SSRF surface |
| **Phishing of staff** | The authentication verdict (SPF, DKIM, DMARC) is shown on every message; a DMARC fail is a red banner. A **lookalike check** flags a display name or domain resembling WayForPay, Nova Poshta, Ukrposhta, Cloudflare, the registrar or `{{DOMAIN}}` itself from an unrelated domain. Links show their real host, and a link whose text is a URL different from its target is flagged |
| **Malicious attachments** | Never rendered inline except raster images (PNG, JPEG, WebP, GIF). SVG, HTML and PDF are download-only. Served only through the API with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`. Executables, macro-enabled Office files and archives get `riskFlag` and a warning. ClamAV scanning on ingest is recommended, `{{MAIL_AV_SCAN}}` |
| **Spoofed mail from our own domain** | DMARC at `p=reject` (§32.16) is the control. Until the ramp reaches it, inbound mail claiming `@{{DOMAIN}}` that fails DMARC goes straight to `SPAM` |
| **Spam** | Basic at launch: authentication verdict, `MailSenderRule` BLOCK, a spam folder, and a «Спам» action that blocks the sender. The public address is rendered on the site in a way that is not a plain `mailto:` in the HTML source, to slow harvesting. Upgrade path: the `InboundMailSource` adapter (§26.16.2) |
| **A compromised staff account sends mail as the business** | Per-user send rate limit, `{{MAIL_SEND_RATE}}`; every staff send is attributed (`sentById`); `mail.reply` is not granted to Warehouse, Content or Photographer roles |
| **Forged webhook** | HMAC over body and timestamp, 5-minute window, as §26.14.1. The webhook carries only an R2 key; the API reads the message from R2 itself, so a forged call can at most re-ingest an object that exists |
| **Mail lost when the app is down** | Raw MIME is written to R2 before the API is called; `mail.reconcileInbound` re-ingests; a Worker that cannot write R2 forwards to the fallback external address |

### The recovery-loop rule

**No login or recovery address may be a mailbox this panel serves.** A password reset for an
Owner whose login is `ivan@{{DOMAIN}}` is delivered into the panel he cannot sign in to. The
same loop exists one level down: if the registrar or Cloudflare account recovers to an address on
`{{DOMAIN}}`, a DNS failure makes the domain unrecoverable. Controls:

- `StaffUser.email` is rejected by validation when its domain is `{{DOMAIN}}` or any `Mailbox`
  domain ([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.16).
- Registrar, Cloudflare, `{{ESP}}`, WayForPay, Nova Poshta and Cloudinary accounts use external
  addresses. Checked in the pre-launch list (§32.18).

### Storage

The R2 bucket is private, has no public access and no public URL, and is included in the backup
policy (§32.17) with object versioning. Raw messages and attachments are deleted by
`mail.purgeExpired` with their rows. Mail content is personal data under the data-subject
process above.

## 32.17 Secrets, dependencies, backups, incident response

### Secrets

| Class | Storage | Rotation |
|---|---|---|
| Database URL, JWT signing key, Cloudinary secret, PSP keys, SMTP, Sentry DSN | Platform secret manager, injected as environment variables | See below |
| Local development | `.env.local`, git-ignored, seeded from `.env.example` with placeholder values only | — |

Rules: **no secret is ever committed**, enforced by a pre-commit hook and a CI secret scan on every
push and on the full history; secrets are never logged, never in error messages, never in the
client bundle — a CI step greps the built bundle for known secret prefixes; `VITE_`-prefixed
variables are **public by definition** and a lint rule prevents a secret ever being named with that
prefix; production, staging and development use entirely separate credentials with no shared
values.

Rotation: JWT signing keys every 90 days with a dual-key overlap window so existing sessions
survive; PSP and Cloudinary keys annually and immediately on any staff departure; the database
password annually; **all secrets immediately** on a suspected compromise. The rotation procedure is
documented and rehearsed once before launch — an unrehearsed rotation during an incident is how a
security event becomes an outage.

### Dependencies and supply chain

- `package-lock.json` committed; `npm ci` in CI. A floating version is a build that is not
  reproducible.
- `npm audit` on every CI run; high and critical vulnerabilities fail the build.
- Dependabot or Renovate, weekly, grouped. Security patches are merged within 7 days; critical
  within 24 hours.
- **`ignore-scripts=true`** in `.npmrc`. Post-install scripts are the primary npm attack vector,
  and the few packages that genuinely need one are allow-listed explicitly.
- New dependencies require justification: maintenance status, download volume, transitive count,
  and whether 40 lines of local code would do instead. Every dependency is permanent attack
  surface.
- Subresource integrity on any third-party script that survives review — currently none, since
  fonts are self-hosted and analytics loads from a first-party proxy where possible.
- An SBOM is generated at build and retained with the release artefact.

### Backup and restore

| Asset | Method | Frequency | Retention | Location |
|---|---|---|---|---|
| PostgreSQL | Automated snapshot + continuous WAL archiving | Snapshot daily, WAL continuous | 30 daily, 12 monthly | Separate region from the primary |
| Media | Cloudinary is the primary store; a weekly manifest export plus an independent archive copy | Weekly | 90 days | Separate provider |
| Secrets | Encrypted export in a password manager, access-controlled | On change | Current + previous | Offline |
| Code | Git, mirrored to a second remote | Continuous | Permanent | Two providers |

RPO 1 hour (WAL archiving), RTO 4 hours. Point-in-time recovery is available across the retention
window.

**The recovery procedure is tested quarterly, restoring into an isolated environment and verifying
row counts, a sample of orders and a sample of media.** A backup that has never been restored is a
hypothesis. The test is a calendar item with a named owner, and the runbook is updated whenever the
test reveals a missing step — which, the first time, it always does.

Media deserves specific attention. [00-client-decisions-2.md](00-client-decisions-2.md) E5 permits
the catalogue photography to be reused from the adjacent business's library, which reduces but does
not remove the exposure — the reused files are processed (re-cropped, re-graded, EXIF-stripped,
renamed; [29-seo-architecture.md](29-seo-architecture.md) §29.11), so the derivatives are unique
work even where the originals are not.

The irreplaceable set is the **Yavoriv shoot**: the factory, process, machinery, people and place
imagery that the entire brand positioning rests on and that exists nowhere else. Losing it means
re-shooting in Yavoriv, which is a cost and a delay that no amount of database backup covers. The
weekly media manifest export and the independent archive copy above apply to it with no exceptions,
and the first restore test explicitly verifies a sample of production imagery rather than only
product shots.

### Incident response

| Severity | Definition | Response |
|---|---|---|
| **SEV-1** | Data breach, payment compromise, admin account takeover, full outage | Immediate page. Owner notified within 1 hour |
| **SEV-2** | Partial outage, checkout broken, suspected intrusion | Page during business hours, 4-hour response |
| **SEV-3** | Degraded performance, isolated errors | Next business day |

Procedure: **contain** (revoke sessions, rotate the relevant secrets, disable the affected feature,
block the source) → **assess** (scope, data touched, timeline, using `AuditLog` and access logs) →
**notify** (owner always; data subjects and the supervisory authority within 72 hours if personal
data is involved; the PSP if payment is involved) → **remediate** → **document**, including a
blameless post-mortem with a named follow-up action.

Prerequisites that must exist **before** launch, not be assembled during an incident: a named
responsible person with a phone number; a documented supervisory-authority contact for the EU
locales; the customer-notification email template in all four locales; an off-site copy of the
runbook that does not require the admin panel to read; and a tested session-revocation and
secret-rotation path.

---

## 32.18 Pre-launch security checklist

Every item is verified by test or observation. "Should be fine" is not a verification.

**Authentication and authorisation — staff**
- [ ] Argon2id with the §32.6 parameters; no plaintext or reversible storage anywhere
- [ ] Refresh rotation with reuse detection, proven by a test that replays a token
- [ ] Access tokens in memory only; nothing sensitive in `localStorage`
- [ ] `httpOnly; Secure; SameSite` set correctly on every auth cookie
- [ ] Lockout, per-IP limiting and progressive challenge all verified
- [ ] Every admin endpoint rejects an unauthenticated and an under-privileged request — automated
- [ ] `DENY` beats `ALLOW` — automated test
- [ ] `permVersion` invalidation verified by demoting a user mid-session
- [ ] **Both** Owner seed passwords rotated (Іван, Любов — E1); no default credential survives
- [ ] Identical responses for unknown vs wrong-password vs locked

**Customer identity — verifying that it is absent**
- [ ] No customer login, registration, password-reset or magic-link route resolves — verified by
      request, not by reading the router
- [ ] `Customer.passwordHash` is absent from the schema and from every migration
- [ ] `WishlistItem` is absent from the schema; the wishlist is `localStorage` only
- [ ] `guestToken` comparison is constant-time and scoped to one order
- [ ] Order lookup returns an identical response for a wrong email and a non-existent order —
      tested with both
- [ ] The address-prefill cookie is gated behind functionality consent and is cleared on withdrawal

**Input, output, injection**
- [ ] Every endpoint validates with a shared `.strict()` Zod schema
- [ ] No `$queryRawUnsafe` anywhere; every raw query reviewed and parameterised
- [ ] Rich-text sanitisation verified with a payload corpus, on write and on render
- [ ] `dangerouslySetInnerHTML` absent outside the sanitised renderer
- [ ] JSON-LD and hydration payloads escaped against script break-out
- [ ] URL scheme allow-list enforced on all user-supplied links

**Transport, headers, session**
- [ ] HTTPS everywhere; HTTP 301s; HSTS present (preload deferred until the domain is final)
- [ ] Full header set present on every response, verified by an automated scan
- [ ] CSP enforced after a two-week report-only period, with nonces and no `unsafe-inline`
- [ ] CSRF: `SameSite`, double-submit token and `Origin` check all active
- [ ] CORS restricted to the site's own origins; no wildcard with credentials

**Payments and commerce**
- [ ] **WayForPay V6–V11 answered from current official documentation and recorded** (§32.14)
- [ ] WayForPay integration is SAQ-A eligible under the confirmed V6 mode; no card data touches
      the application
- [ ] `{{WAYFORPAY_ORIGIN}}` resolved to a real hostname; the unused CSP directive deleted, the
      used one tested against a real transaction in report-only *and* enforced mode
- [ ] 3-D Secure enabled
- [ ] Webhook signature verification using the confirmed V7 field order, idempotency, and the V8
      acknowledgement, all tested — including a deliberately forged request
- [ ] Amounts computed server-side; a tampered client total is rejected — tested
- [ ] COD thresholds, phone verification and the one-of-one COD exclusion configured
- [ ] COD is unavailable for non-Ukrainian destinations — enforced server-side

**Data protection**
- [ ] Privacy and cookie policies live in all four locales
- [ ] **German Impressum live**, naming ФОП Гондурак Любов Юріївна, the Yavoriv address,
      `{{LEGAL_ID}}`, a phone number and an email; reachable in ≤2 clicks from every page
- [ ] **14-day withdrawal notice and the model withdrawal form published for `de` and `pl`**, in
      the locale's language, linked from the returns page and included in the confirmation email
- [ ] `MerchantReturnPolicy` structured data emitted per locale, not site-wide (§32.15)
- [ ] Total price, shipping, duty position and settlement currency disclosed before payment in
      every non-UA locale
- [ ] **Customs and duties disclosure rendered before the pay button** on every non-UA path,
      localised per locale, not in an accordion — and the acknowledgement stored on the order
      (§32.15, [00-client-decisions-3.md](00-client-decisions-3.md) F4)
- [ ] The international enquiry step states that shipping is quoted separately and that no payment
      is taken until the customer has seen the total (§32.15)
- [ ] Free shipping verified as **never** applying to a non-UA destination, at any order value
- [ ] Hide categories excluded from `de`/`pl` at the server, not only in the UI
- [ ] Consent banner compliant; nothing non-exempt fires pre-consent — verified in a network trace
- [ ] Newsletter double opt-in working, with consent proof stored
- [ ] Erasure routine tested end to end, preserving financial records
- [ ] DSAR identity-verification procedure written and rehearsed for the no-account case (§32.15)
- [ ] Retention jobs scheduled and verified
- [ ] PII scrubbing in Sentry verified by triggering a real error containing an email

**Email authentication (§32.16)**
- [ ] SPF, DKIM and DMARC published for the sending domain; exactly one SPF record, `-all`
- [ ] DMARC at `p=quarantine` or stronger, with a `rua=` mailbox someone reads
- [ ] `{{TRANSACTIONAL_FROM}}` is on `{{DOMAIN}}` — **no `@gmail.com` sender anywhere**, CI-grepped
- [ ] No staff login and no registrar, Cloudflare, `{{ESP}}`, WayForPay, Nova Poshta or Cloudinary account recovers to an address on `{{DOMAIN}}` (§32.16a)
- [ ] The §32.16a hostile-mail fixtures pass: script, `javascript:` link, SVG attachment, lookalike sender, DMARC-fail self-spoof
- [ ] Test confirmations delivered to the inbox at Gmail, Microsoft 365 and a Ukrainian provider,
      with `SPF=pass`, `DKIM=pass`, `DMARC=pass` read from the raw headers
- [ ] `Reply-To:` reaches a monitored mailbox, verified by replying to a test message
- [ ] Staff password-reset mail verified over the same authenticated path

**Operations**
- [ ] No secret in the repository or in the client bundle — CI-verified over full history
- [ ] `ignore-scripts=true`; `npm audit` clean of high and critical
- [ ] Backups running; **a restore has been performed and verified**
- [ ] Rate limits active on every listed endpoint
- [ ] Honeypot, timing and heuristic spam layers verified on the lead and review forms
- [ ] Staging behind HTTP auth and `noindex` — verified by request, not assumption
- [ ] Error pages leak no stack trace, no framework version, no path
- [ ] Alerting wired for 5xx rate, webhook failures, auth-failure clusters and CSP report spikes
- [ ] Incident runbook written, owner named, contacts recorded off-site
- [ ] An external vulnerability scan and a dependency review completed and signed off
