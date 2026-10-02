# Client Decisions — Round 8

Received 2026-09-29. Superseded where it differs by [00-client-decisions-9.md](00-client-decisions-9.md).

```
00-client-decisions-8.md    ← this file
00-client-decisions-7.md
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

Answers to [00-client-decisions-7.md](00-client-decisions-7.md) §K3 and the open-items list that
followed it.

---

## L1 — One panel account at launch: Іван, Owner

> «Поки що буде тільки пошта Івана, а через панель Іван як власник може реєструвати
> користувачів та адміністраторів (його email gif19601@gmail.com).»

| Item | Value |
|---|---|
| Seeded accounts | **One.** Гондурак Іван Федорович, role Owner |
| Login address | `{{OWNER_EMAIL_IVAN}}` = **`gif19601@gmail.com`** — external, so it satisfies [00-client-decisions-7.md](00-client-decisions-7.md) §K2 rule 3 |
| Everyone else | Created by Іван from the panel, through the invitation flow ([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.7, §24.8) |
| `{{OWNER_EMAIL_LIUBOV}}` | **Retired as a seed token.** Любов gets an account when Іван creates one |

This replaces the two-Owner seed from [00-client-decisions-2.md](00-client-decisions-2.md) §E1.

### Consequences

1. **The quote default assignee is Іван until Любов has an account.** §H3 names Любов as owner
   of international quotes. That stays the intent; the `Setting`
   `orders.quote.default_assignee_id` is seeded to Іван and switched by him when her account
   exists. Nothing else in the quote workflow changes.
2. **A single Owner is a recoverability risk**, and it is recorded rather than overruled. If
   access to `gif19601@gmail.com` is lost, nobody can reset the only Owner's password from inside
   the system; recovery is a developer-run database procedure. **Recommended:** Іван creates a
   second Owner account for Любов once the panel is live. Invariant I1 (at least one Owner) is
   unaffected.
3. **`gif19601@gmail.com` is no longer published on the site.** It is now the login of the only
   Owner and the recovery address for the whole panel. Publishing it invites phishing aimed at
   exactly the account that can refund payments. The public address is `info@vivcharyk.shop`
   (L2). This withdraws the F5 "interim public address" role; F5's deliverability reasoning is
   untouched.
4. **2FA is strongly recommended on this account** — Google account 2-step verification on the
   Gmail, and the panel's own 2FA when enabled
   ([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.11).

---

## L2 — One mailbox: `info@`

> «Ні, тільки info.»

| Token | Value |
|---|---|
| `{{BRANDED_EMAIL}}` | **`info@vivcharyk.shop`** — the only `Mailbox` row; read in the panel (§K2) |
| `{{TRANSACTIONAL_FROM}}` | **`no-reply@vivcharyk.shop`** — a sending identity, **not a mailbox**. Replies go to `info@` via `Reply-To:`. DKIM and bounce handling on `mail.vivcharyk.shop` ([32-security-architecture.md](32-security-architecture.md) §32.16) |

No personal mailboxes. Adding one later is a `mail.manage_mailboxes` action, not a code change.

---

## L3 — The deposit copy is approved

> «Так.»

[00-client-decisions-6.md](00-client-decisions-6.md) §J2's customer-facing copy is approved as
written. Closes §J3 item 1. The offer-contract clause is still required (§J2).

---

## L4 — Returns: 14 days

`{{RETURN_DAYS}}` = **14**. The Ukrainian statutory period for distance selling, and the EU
right of withdrawal period for `en` / `pl` / `de`.

---

## L5 — Tax: single tax, not a VAT payer

`{{VAT_STATUS}}` = **ФОП на єдиному податку, не платник ПДВ.**

- Prices are final. No VAT line in the cart, checkout, confirmation email or invoice; invoices
  carry «Без ПДВ».
- JSON-LD `Offer.price` is the displayed price; no `valueAddedTaxIncluded` assertion.

**Still open: the single-tax group (2 or 3).** The group sets the annual income ceiling and which
operations are permitted. Confirm with the ФОП's accountant that the group allows selling to
buyers abroad before the `en` / `pl` / `de` checkout goes live ([00-client-decisions-2.md](00-client-decisions-2.md) §E11).

---

## L6 — Heritage wording: confirmed

> «Можеш писати, що так, це ремесло, яке внесене до національного переліку нематеріальної
> культурної спадщини.»

Approved sentence pattern:

> «Гуцульське ліжникарство — ремесло, внесене до Національного переліку елементів
> нематеріальної культурної спадщини України.»

Closes B14 and every "verification before publishing" gate that cites §E2. The other half of
§E2 is **unchanged and binding**: the designation belongs to the **craft**. Never «Вівчарик
внесено…», never a badge, seal or `award` / `hasCredential` in structured data. Translations
keep the subject as the craft — the R16 risk in
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.12.

---

## L7 — Partial prepayment stays, for any order

> «Для абсолютно любих замовлень залишити передоплату, щоб компанія не йшла в мінус на
> доставках туди назад.»

The 10% prepayment method is **kept and widened**: available on every domestic stocked order,
not only high-value ones. This reverses the round-5 narrowing and closes §J3 item 2.

**Rule added to meet the stated purpose.** 10% of a 600 ₴ order is 60 ₴; two shipping legs cost
more. A prepayment that does not cover both legs does not stop the business losing money on a
refused parcel, which is the reason the client gave. So:

```
prepaymentMinor = max( round(subtotalMinor × 10%),  shippingForwardMinor + shippingReturnMinor )
// superseded by §L14 item 1: the floor is a fixed 460 ₴, set by the client
```

Computed server-side, shown with its arithmetic like the deposit
([18-checkout-specification.md](18-checkout-specification.md) §18.8.5a). On a refused parcel the
business retains the two shipping legs and refunds the rest of the prepayment — the same basis
as the §J2 deposit, and written into the same offer-contract clause.

Unchanged: custom-size carts are **fully** prepaid (§H1.1, §J1); the method is **Ukraine only**
(§E11).

---

## L8 — Mail: 8-month retention, and read/unread behaviour

> «8 місяців, та щоб коли я заходив на повідомлення, а потім виходив, воно рахувалось як
> прочитане… коли приходить нове повідомлення, то воно міняється на статус непрочитане.»

### Retention

`{{MAIL_RETENTION_MONTHS}}` = **8**, counted from a thread's last message.

**One exception, added so the retention cannot delete evidence:** a thread linked to an order
with an open return, refund, payment dispute or chargeback is not purged until that is closed.
Card chargebacks can arrive months after the sale; the correspondence is the business's defence.

### Read and unread — the client's specification

| State | Row appearance |
|---|---|
| **Unread** | Row surface one step **brighter** than the page, and a **blue dot** before the sender |
| **Read** | Plain page surface, **no dot** |

| Event | Effect |
|---|---|
| Owner opens a thread, then leaves it (another thread, back to the list, another section, closes the panel) | Thread becomes **read** |
| A new message arrives on a read thread | Thread becomes **unread** again |
| «Позначити непрочитаним» | Thread becomes unread — for "deal with it later" |

The implementation detail that makes this correct is in
[23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.13a: "read" is recorded
**up to the last message actually shown**, not "now", so a message that arrives while the thread
is open is not silently swallowed.

---

## L9 — No Instagram

> «Інстаграму не буде взагалі.»

`{{INSTAGRAM}}` resolves to **none**. The recommendation to create an account before launch is
withdrawn. No social row, no `sameAs` entry, no Instagram in the launch channel mix. If the
owners want one later, it is a new decision.

---

## L10 — Photography and video: in about a week

The project lead shoots **video of the whole production process, raw fleece to
finished product**, and the replacement photographs, at the Яворів workshop, in approximately one
week — on or around **2026-10-06**.

- The shot list is [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.9.1 and the
  production stages [20-production-page-specification.md](20-production-page-specification.md)
  claims. **The wet hide stages are included** — R21: a stage that is not filmed cannot be
  claimed.
- The shop interior and the workshop as a visitor sees it are on the list (§J3 item 7).
- B5's exit artefact still needs a **written licence** from the person shooting to the client
  for commercial use, even though that person is on the project.

---

## L11 — WayForPay: at the same visit

V6–V11 ([00-client-decisions-2.md](00-client-decisions-2.md) §E10) are answered from the owner's
WayForPay cabinet or merchant manager during the L10 visit. `{{LEGAL_ID}}` can be collected at
the same time.

---

## L12 — Open items

1. **`{{LEGAL_ID}}`** — ЄДРПОУ / РНОКПП. Collect at the L10 visit.
2. **Register `vivcharyk.shop`** ([00-client-decisions-7.md](00-client-decisions-7.md) §K1).
3. **The single-tax group** and whether it permits sales abroad (L5).
4. ~~**Wholesale** — see L13.~~ Answered in L14 item 5. **To confirm:** count pieces across the order (default) or per product; by-weight and custom-size lines excluded (default).
5. **The concurrent custom-order ceiling** (R19).
6. **Recommended:** a second Owner account for Любов once the panel is live (L1) — now also the only recovery path if Іван loses both phone and recovery codes (L14 item 4).
7. At the L10 visit: V6–V11, the shoot, the licence.

## L13 — Wholesale, restated

The client asked whether «гуртове» means «оптом». It does. The question, restated plainly:

1. **Does the business sell wholesale at all** — to shops, hotels, designers, resellers?
2. If yes: **from what quantity or order total** does the wholesale price apply
   (`{{MOQ}}` / `{{MOQ_VALUE}}`)?

If the answer to 1 is no, the wholesale page
([19-wholesale-page-specification.md](19-wholesale-page-specification.md)) is removed from v1 and
the `WHOLESALE` and `DROPSHIP` lead kinds go with it.

---

## L14 — Follow-up answers (same day)

1. **Prepayment floor: 460 ₴.** Replaces the computed shipping floor in §L7:
   `prepaymentMinor = min( max(round(subtotal × 10%), 46000), orderTotalMinor )`. Store 46000 as a
   `Setting` the Owner can edit. Propagate to 18-checkout §18.8 / §18.9 and 26-api.
2. **Mail retention hold (§L8): approved.**
3. **`gif19601@gmail.com` never published (§L1): approved.**
4. **2FA mandatory for every staff account, at launch.** Login → password → 6-digit TOTP
   (Google Authenticator, RFC 6238). Checkbox «Запам'ятати на 7 днів»: session lives 7 days
   absolute on that device; without it, a browser-session cookie. Replaces §24.11 "ready, not
   enforced" and the 30/90-day refresh in §24.9. To specify: enrolment on first login (no grace),
   10 single-use recovery codes, TOTP step-reuse rejection, `employees.reset_mfa` ⚠ (Owner, Admin),
   break-glass DB procedure for a sole Owner who loses phone and codes. `{{MFA_PHASE}}` = launch.
   Schema: `StaffUser.twoFactorLastStep`, `StaffRecoveryCode`, `StaffSession.rememberDevice`.
5. **Wholesale: yes.** From 5 pieces −10%, from 25 pieces −20%. `{{MOQ}}` = 5 units;
   `{{MOQ_VALUE}}` = none; `{{WS_TIER_1..2}}` = 5 / 25 units, `{{WS_DISC_1..2}}` = 10 / 20; tier 3
   and the "also includes" column removed (free shipping contradicts F4). Proposed defaults, to
   confirm with the client: applied **automatically in the cart**; units counted **across the
   whole order**; by-weight and custom-size lines excluded; does not stack with a promo code
   (better of the two applies); tiers stored as an editable `Setting`. Propagate to 19-wholesale
   §19.8, 18-checkout, 25 (`Order` discount source), 26 pricing.
6. **Everything else at the visit, ~2026-10-06** (§L10, §L11).
