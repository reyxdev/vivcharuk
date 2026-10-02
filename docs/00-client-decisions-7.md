# Client Decisions — Round 7

Received 2026-09-29. Answered and partly superseded by [00-client-decisions-8.md](00-client-decisions-8.md).

```
00-client-decisions-7.md    ← this file
00-client-decisions-6.md
00-client-decisions-5.md
00-client-decisions-4.md
00-client-decisions-3.md
00-client-decisions-2.md
00-client-decisions.md
00-existing-site-audit.md   ← adjacent business, reference only
00-assumptions.md
everything else
```

---

## K1 — The domain is `vivcharyk.shop`

`{{DOMAIN}}` = **`vivcharyk.shop`**. Chosen, **not yet registered**.

This closes the *choice* half of B2 ([35-implementation-roadmap.md](35-implementation-roadmap.md)
§35.3) and of §E9 ([00-client-decisions-2.md](00-client-decisions-2.md)). It does not close B2:
B2's exit artefact is a registered domain with delegated DNS.

`vivcharyk` is the КМУ-2010 transliteration of «Вівчарик»
(В‑v, і‑i, в‑v, ч‑ch, а‑a, р‑r, и‑y, к‑k). The brand a customer reads and the address they type
are the same word.

### How the decision was reached — kept because it explains a rule

The client first named **`botey.shop`**. That was withdrawn the same day, before registration,
for one reason: **BOTEY is the brand of the adjacent business** — the site at
`fabryka-shkur.com.ua` trades as «BOTEY / Фабрика шкур»
([00-existing-site-audit.md](00-existing-site-audit.md) §0.1). Launching on it would have:

| Problem | Mechanism |
|---|---|
| Merged two entities | Search and AI answer engines key a business on name, domain, address and phone. Two businesses called BOTEY — Вербовець and Яворів, different phones, different ФОПs — read as one entity with inconsistent NAP |
| Sent brand queries to the older site | A search for «botey» is won by the domain with history, `fabryka-shkur.com.ua` |
| Worsened the duplicate-content risk | E5 reuse ([29-seo-architecture.md](29-seo-architecture.md) §29.18) plus a shared name removes the last signal separating the two sites |
| Broken recall | The site says Вівчарик; the URL would have said something else |
| Contradicted D2 | [00-client-decisions.md](00-client-decisions.md) D2: new, independent domain; the audited business must not appear |

`vivcharyk.shop` removes all five. **The D2 rule stands unamended: BOTEY does not appear anywhere
in the new experience** ([16-footer-specification.md](16-footer-specification.md) exclusions).

`botey.shop` is not needed. If the client registers it anyway to keep it from a third party, it
serves no content and 301-redirects to `vivcharyk.shop`; it never appears in copy, email or
structured data.

### Availability, checked

| Check | Result |
|---|---|
| Source | `.shop` registry RDAP, `https://rdap.gmoregistry.net/rdap/domain/vivcharyk.shop` (the `.shop` WHOIS service is retired in favour of RDAP) |
| Answer | `404` — `vivcharyk.shop not found` |
| Registry data as of | 2026-09-28 21:47 UTC |
| Meaning | Unregistered at that moment. Not a reservation — anyone can register it first |

**Register it now, not at VPS setup.** The launch-week technical checklist in
[29-seo-architecture.md](29-seo-architecture.md) already requires **≥ 3 years**; add registrar
lock and auto-renew, and put the registrar credentials in the shared vault (B2 exit artefact).
Compare `.shop` **renewal** pricing, not the first-year promotional price.

### What the value resolves

| Item | Value |
|---|---|
| Canonical host | `vivcharyk.shop` (apex vs `www` still to be decided once, per the §29 checklist) |
| Staging | `staging.vivcharyk.shop` ([35-implementation-roadmap.md](35-implementation-roadmap.md) §35.6) |
| Image CNAME | `img.vivcharyk.shop` ([29-seo-architecture.md](29-seo-architecture.md), [32-security-architecture.md](32-security-architecture.md)) |
| Transactional sending subdomain | `mail.vivcharyk.shop` — recommended ([26-api-architecture.md](26-api-architecture.md), [32-security-architecture.md](32-security-architecture.md)) |
| Analytics host | `plausible.vivcharyk.shop` if Plausible is self-hosted ([32-security-architecture.md](32-security-architecture.md) CSP) |

**Not mass-replaced in the specs.** `{{DOMAIN}}` stays in the documents as the name of one
configuration value, which is how every spec already treats it
([00-client-decisions-2.md](00-client-decisions-2.md) §E9: "resolved by a single configuration
value"). Its value is recorded here and in the token tables. CI gate G1 still blocks a build in
which the configuration value is unset.

### What it unblocks, and what stays open

| Token | Status after K1 |
|---|---|
| `{{DOMAIN}}` | **Chosen.** Blocking only until registration |
| `{{TRANSACTIONAL_FROM}}` | **Unblocked, still open.** On `vivcharyk.shop` (or `mail.vivcharyk.shop`); the local part is the client's choice. `From:` display name **Вівчарик** |
| `{{BRANDED_EMAIL}}` | **Unblocked, still open.** Public contact address on `vivcharyk.shop`, read **in the admin panel** (K2) — not forwarded to Gmail |
| `{{OWNER_EMAIL_IVAN}}`, `{{OWNER_EMAIL_LIUBOV}}` | **Changed by K2.** These are the owners' *login* addresses and must be **external** mailboxes — never on `vivcharyk.shop`. See K2, rule 3 |

The SPF → DKIM → DMARC ramp ([35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.0)
can start the day DNS is delegated. It does not parallelise, so registration date is now the
critical path for B15.

### `.shop` as a TLD

A generic TLD carries no country targeting, which suits a four-locale site: `uk`/`en`/`pl`/`de`
are served by subfolders and hreflang ([29-seo-architecture.md](29-seo-architecture.md)), not by
the TLD. Nothing in the URL architecture changes.

---

## K2 — Business email lives in the admin panel

> «Вони погоджуються повністю перейти на панель.»

Mail to every address on `vivcharyk.shop` is received, read, answered and archived **inside the
admin panel**. The owners stop using Gmail for business correspondence. This reverses the
"forward `{{BRANDED_EMAIL}}` to `gif19601@gmail.com`" recommendation that
[00-client-decisions-3.md](00-client-decisions-3.md) §F5,
[26-api-architecture.md](26-api-architecture.md) §26.16.1 and
[32-security-architecture.md](32-security-architecture.md) §32.16 carried.

Three options were put to the client: keep Gmail; a read-only copy in the panel; the full move.
The client chose the full move. It was presented as weeks of work, and it is: see
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.4.

### What it buys

- **One place per customer.** A thread sits next to the order it is about, the customer's order
  history and the lead it came from ([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.13a).
- **Staff can answer mail without the owners' Gmail password.** The personal mailbox stays
  personal; a Manager or Support user gets `mail.*` permissions instead of a shared credential.
- **Transactional mail and human replies share a thread.** A customer who replies to an order
  confirmation lands on that order, not in an unrelated inbox.

### Architecture, in one paragraph

Cloudflare Email Routing receives mail for the domain (Cloudflare becomes the DNS provider).
A Cloudflare Email Worker writes each raw message to a private R2 bucket **before** anything
else, then notifies the API through a signed webhook. The API parses, sanitises, threads and
links the message in a background job. Replies leave through the existing `{{ESP}}` from the
mailbox address with correct `In-Reply-To` / `References` headers. Full design:
[25-database-schema.md](25-database-schema.md) §25.8c,
[26-api-architecture.md](26-api-architecture.md) §26.16.2,
[32-security-architecture.md](32-security-architecture.md) §32.16a.

### Rules — binding

1. **No message is lost because the application is down.** The raw message is durable in R2
   before the API is called; a reconciliation job re-ingests anything not processed. If the
   Worker cannot write to R2, it forwards the message to the fallback address
   (`gif19601@gmail.com`) instead of dropping it.
2. **The panel becomes a phone tool for mail.** The owners read Gmail on their phones today; the
   panel must replace that, or mail goes unanswered. The mail surface is phone-first, like the
   warehouse surfaces, and new mail raises a Web Push notification on an installed panel.
3. **No login or recovery address may be a mailbox the panel serves.** A staff password reset
   sent to `ivan@vivcharyk.shop` can only be read by signing in to the panel — the account Іван
   is locked out of. Owner logins stay on external mailboxes; the same applies to the registrar,
   Cloudflare, `{{ESP}}`, WayForPay and Nova Poshta business accounts. Enforced by validation
   on `StaffUser.email`, not by convention.
4. **Messages that carry secrets are recorded without their body.** Staff invitation, staff
   password reset and the guest order-access link are logged as metadata only.
5. **Mail is personal data.** The customer anonymisation path covers mail threads, and mail has a
   retention period, `{{MAIL_RETENTION_MONTHS}}` (recommended 36 months after a thread's last
   message).

### What the owners lose, stated so it is not a surprise

- **No phone mail app.** There is no IMAP access; mail is read in the panel only.
- **Spam filtering is basic at launch** — authentication checks, a spam folder and a sender
  block list. A dedicated filtering provider can be swapped in behind the inbound adapter if
  volume demands it.

### Interim, until the panel mail ships

From the day DNS is delegated, a Cloudflare Email Routing **forwarding rule** sends mail to
`gif19601@gmail.com`. The Worker replaces the rule when §23.13a is live. No address changes, so
customers see nothing.

---

## K3 — Open items

Supersedes [00-client-decisions-6.md](00-client-decisions-6.md) §J3 item 4.

1. **Register `vivcharyk.shop` now** — ≥ 3 years, registrar lock, auto-renew (K1).
2. Choose the addresses on `vivcharyk.shop`: `{{BRANDED_EMAIL}}` and `{{TRANSACTIONAL_FROM}}`,
   and whether each owner wants a personal mailbox (e.g. `ivan@`) in the panel as well (K2).
3. **The owners' external login addresses** — `{{OWNER_EMAIL_IVAN}}`, `{{OWNER_EMAIL_LIUBOV}}`.
   Two different addresses, both outside the domain (K2, rule 3).
4. `{{MAIL_RETENTION_MONTHS}}` — confirm 36, or name another figure (K2, rule 5).
5. Carried from §J3, unchanged: deposit copy approval; the 10% prepayment method; `{{LEGAL_ID}}`;
   heritage-register wording; WayForPay V6–V11; the Яворів shoot; Instagram before launch. From
   the roadmap (R19): the concurrent custom-order ceiling.
