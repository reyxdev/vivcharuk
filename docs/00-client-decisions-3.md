# Client Decisions — Round 3

Received 2026-09-28. **Highest-authority document in the blueprint.**

```
00-client-decisions-3.md    ← this file
00-client-decisions-2.md
00-client-decisions.md
00-existing-site-audit.md   ← adjacent business, reference only
00-assumptions.md
everything else
```

---

## F1 — Legal ID: exists, pending delivery

`{{LEGAL_ID}}` (ЄДРПОУ / РНОКПП for ФОП Гондурак Любов Юріївна) exists and will be supplied.

It remains a hard blocker on three deliverables and must be chased before those are attempted:

1. WayForPay merchant onboarding
2. Договір оферти and the returns policy
3. The German **Impressum**, which is legally mandatory and cannot be published without it

Nothing else waits on it. Build proceeds; these three do not.

---

## F2 — The location is a shop as well as a factory

> «Все чотко, там знаходиться і магазин і виробництво.»

The Google Business Profile is confirmed correct, and the Яворів site houses **both retail and
production**.

This is new information and it upgrades several decisions. A factory you can only read about is
a claim; a shop you can walk into, attached to the production floor, is proof — and it is proof
placed in a village that tourists already travel to for exactly this craft.

### What changes

| Area | Change |
|---|---|
| **Google Business Profile** | The profile can legitimately carry retail attributes — in-store shopping, in-store pickup — which surface it for "де купити ліжник" style queries that a pure manufacturer profile cannot answer. Confirm the primary category reflects both functions; a manufacturer-only category suppresses retail intent, and a shop-only category discards the manufacturing story. |
| **Contact page** | Promotes from a utility page to a **destination page**. It is no longer "here is a form" but "here is a place you can visit, and here is what you will see". Directions, parking, what is on display, and whether the production floor is visitable. |
| **Pickup** | «Забрати в Яворові» is not a cost-saving fallback — it is an invitation, and it should read as one. |
| **Tourist audience** | [02-ux-research.md](02-ux-research.md) Audience 1 gains a real offline-to-online path: visit the shop, buy later online. Worth measuring. |
| **Trust** | A visitable address is the strongest possible answer to "is this a real factory or a reseller" — the primary purchase anxiety identified in [02-ux-research.md](02-ux-research.md). |
| **Cold start** | Physical footfall in a craft-tourism village is a launch channel that does not depend on search. Given no social media exists, this matters more than it otherwise would. |

**Recommendation:** put a short, honest line about visiting in the homepage footer band and on
the production page — «Приїздіть: магазин і виробництво в одному місці, с. Яворів» — with the
variable-hours caveat from [00-client-decisions-2.md](00-client-decisions-2.md) §E3 and both
phone numbers. It costs one line and it converts a claim into an open invitation.

---

## F3 — Partner goods are sold under the Вівчарик brand

> «Так, продаються під брендом Вівчарик.»

This resolves the open question in [00-client-decisions-2.md](00-client-decisions-2.md) §E7.

### Structured data

```jsonc
// OWN_MANUFACTURE
"brand":        { "@type": "Brand",        "name": "Вівчарик" },
"manufacturer": { "@type": "Organization", "name": "Вівчарик" }

// PARTNER_MANUFACTURE
"brand":        { "@type": "Brand",        "name": "Вівчарик" },
// "manufacturer" omitted entirely — never set to Вівчарик
```

This is exactly the distinction schema.org draws, and it is the honest one: Вівчарик is the
brand under which the item is sold, and is not the entity that made it. Omission states that
without asserting anything false.

### The tension this creates, stated plainly

Selling another workshop's goods under your own brand is ordinary retail practice and entirely
legitimate. But it sits in tension with the strategy in
[01-brand-strategy.md](01-brand-strategy.md) §1.2 — *the brand sells verified origin* — because
the brand name now appears on items the brand did not make.

That does not change the plan; it **raises the stakes on the on-page label**:

- The «Відібрано Вівчариком» mark stays at **equal visual weight** to «Власне виробництво».
  Nothing about it is softened because the products carry the brand name.
- The origin facet stays pinned at the top of the filter panel.
- Partner products remain excluded from the homepage, the hero, the production storytelling and
  the best-seller rail. The brand surfaces make the manufacturing claim; the catalogue carries
  the breadth.
- `partnerName` is still never rendered ([00-client-decisions-2.md](00-client-decisions-2.md)
  §E7). `partnerRegion` is used where known.

A customer who discovers the distinction themselves feels misled. A customer who was told
plainly feels informed. The label is the difference, and branding the goods makes it matter
more, not less.

---

## F4 — Shipping and customs: buyer pays everything

> «Відправляють через Нову пошту, Укрпошту та різними перевізниками; покупець оплачує все.»

| Item | Resolution |
|---|---|
| Domestic carriers | Nova Poshta, Ukrposhta |
| International | Nova Poshta Global, Ukrposhta International, plus other carriers case by case. `{{INTL_CARRIER}}` resolves to **multiple, quoted per order** rather than a single default |
| Who pays shipping | **Buyer**, all destinations |
| Who pays customs, duties, import VAT | **Buyer** |
| Incoterms | Effectively **DAP** — delivered, duties unpaid |

### Design consequences, and one of them is not optional

**Disclosure must happen before payment, not after.** An EU buyer charged an unexpected import
VAT bill by their carrier will refuse the parcel, and the shop absorbs a return shipped from
another country. This is the single most common way small cross-border shops lose money.

Required on the international checkout path, before the pay button:

> «Ціна не включає митні збори та податки країни призначення. Їх сплачує отримувач при
> отриманні. Сума залежить від країни та вартості замовлення.»

Localised properly per locale, not machine-translated, and placed where it must be read rather
than in a collapsed accordion.

**International shipping is quoted, not calculated.** With multiple carriers chosen per order,
the checkout cannot compute a live rate. Two options, and the second is recommended:

| Option | Assessment |
|---|---|
| Flat-rate zones with a published table | Simple, but guesses wrong in both directions — overcharges the easy destinations and loses money on the hard ones |
| **Enquiry-then-invoice** for international orders | Recommended. The customer submits the order, receives a shipping quote, then pays. Slower, but honest, and it matches how the business actually operates |

**Free shipping never applies internationally**, regardless of order value.

[00-assumptions.md](00-assumptions.md) C5 and the `{{INTL_CARRIER}}` token in
[18-checkout-specification.md](18-checkout-specification.md) §18.23 resolve to this model.

---

## F5 — Email: interim address supplied, with two problems

`gif19601@gmail.com`

Usable as the contact address today. It is not usable as the site's identity, for two distinct
reasons — one commercial, one technical.

### Problem 1 — trust cost

A site presenting 5,000–15,000 UAH craft goods with a numeric personal Gmail as its only contact
address undercuts its own positioning. It reads as an individual, not a manufacturer with a shop
and a production floor. This is the cheapest possible upgrade available on the project.

### Problem 2 — transactional email will fail authentication

This is the more serious of the two and it is technical, not aesthetic.

Order confirmations, shipping notices and password resets must be sent **from the site's own
domain**. They cannot be sent from `@gmail.com`:

- Google does not permit third-party systems to publish SPF or DKIM records for `gmail.com`, so
  mail sent "from" a Gmail address by the application fails SPF and DKIM.
- Gmail's own DMARC policy for consumer accounts rejects such mail outright.
- The practical result is that order confirmations land in spam or are refused entirely — and a
  customer who paid but received no confirmation contacts support, or disputes the charge.

**Required:** a sending domain with SPF, DKIM and DMARC configured, with transactional mail sent
from `no-reply@{{DOMAIN}}` and replies routed to a monitored address. This is a Phase 1 blocker,
not a polish item, and it depends on the domain decision in
[00-client-decisions-2.md](00-client-decisions-2.md) §E9.

### Interim position

| Use | Address |
|---|---|
| Public contact address on the site today | `gif19601@gmail.com` |
| Transactional sending address | `{{TRANSACTIONAL_FROM}}` — **must** be on `{{DOMAIN}}` |
| Public contact address at launch | `{{BRANDED_EMAIL}}` — recommended, on `{{DOMAIN}}` |

Recommendation: forward the branded address to the existing Gmail inbox. The owners keep the
mailbox they already use, and the site shows the address it should.

---

## F6 — Tagline: «в Карпатах» confirmed, Яворів retained elsewhere

> «Ні, напиши краще "в Карпатах".»

The client-approved copy from [00-client-decisions.md](00-client-decisions.md) D1 stands
unchanged:

> «Понад 30 років виробляємо натуральні вовняні вироби **в Карпатах**.»

The proposal to substitute «у Яворові» in the tagline is **withdrawn**. The reasoning is sound:
«Карпати» is immediately understood by every audience including foreign buyers, whereas
«Яворів» requires knowledge the visitor may not have at the moment they read a headline. A
tagline is not the place to teach a new proper noun.

### What this does not change

The Яворів material from [00-client-decisions-2.md](00-client-decisions-2.md) §E2 stays in every
supporting surface, where the reader has context and the specificity earns its keep:

| Surface | Treatment |
|---|---|
| Tagline and hero headline | «в Карпатах» — as approved |
| About page | Яворів named and explained — the lizhnyk capital, the museum, the craft lineage |
| Production page | Яворів named as the place the process happens |
| Contact page and footer NAP | Full address, as required |
| Structured data (`address`, `Place`) | Full address, as required |
| Meta titles and descriptions | Яворів where it helps a specific query, «Карпати» in general titles |
| Product names | Optional. «Ліжник Яворівський» remains available but is not imposed |
| Journal articles | Яворів is a strong subject in its own right |

The pattern is: **«Карпати» to be understood, «Яворів» to be believed.** The headline earns
attention; the pages beneath it earn trust. Both words have a job and they are different jobs.

If the client would prefer Яворів removed from the supporting surfaces as well, say so — but the
address must appear regardless, since it is required for local SEO and the Google Business
Profile.

---

## F7 — Open items after this round

1. `{{LEGAL_ID}}` — supplied on request (F1). Blocks WayForPay, the offer contract, the
   Impressum.
2. `{{DOMAIN}}` — deferred to deployment. Now also blocks transactional email authentication
   (F5), which is more urgent than the domain decision was previously treated as.
3. Confirm the Google Business Profile primary category reflects **both** retail and
   manufacturing (F2).
4. Confirm the heritage-register wording before any reference is published
   ([00-client-decisions-2.md](00-client-decisions-2.md) §E2).
5. WayForPay verification V6–V11 ([00-client-decisions-2.md](00-client-decisions-2.md) §E10).
6. The Яворів photography shoot ([00-client-decisions-2.md](00-client-decisions-2.md) §E5).
7. Decide on the international model: enquiry-then-invoice is recommended over flat-rate zones
   (F4).
8. Instagram account before launch — recommended, not yet decided
   ([00-client-decisions-2.md](00-client-decisions-2.md) §E3).
