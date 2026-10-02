# 35 — Implementation Roadmap

> **Round 14 — ПРРО in Phase 0:** find an accountant (group 2 limits), free КЕП for the cash register, register the ПРРО, connect it in WayForPay (V12–V15), 1 ₴ test with a return. Card payment is switched on only after that. See [00-client-decisions-14.md](00-client-decisions-14.md).

> **Round 13 — cost:** cost policy — only hosting, domain, payment commission and legally required services are paid; everything else on free tiers ([00-client-decisions-13.md](00-client-decisions-13.md) N7). EU checkout stays closed (Ukraine delivery only on every locale); the map is a static styled image with a Google Maps link.

> **Round 13:** Reviews page and Prom review import, Google review button, EU compliance (GPSR responsible person) as a gate for EU checkout, video instructions at handover, custom-size capacity 5 with honest dates — [00-client-decisions-13.md](00-client-decisions-13.md). R19 closed.

> **Round 12 — security hardening:** security hardening work and its phase split are in [38-security-hardening.md](38-security-hardening.md) §38.12; Phase 1 gains the pre-data controls, the launch checklist gains ASVS L2 sign-off, a pen test and a restore drill.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **New work from round 10:** mega menu; seasonal hero photos; flock animation with sound toggle; review system with photos and gallery consent; parcel-locker fit check; call-confirmation step; batch waybills; automatic translation with source tracking; AI description drafts; phone layouts for the whole admin; **ПРРО fiscal receipts** (new Phase 0 item: register the ПРРО, get the API key). **Removed:** Leads module, contact form, packing slip, abandoned-checkout email, homepage story/wholesale/blog blocks.

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Launch approach (follow-up §F2):** build against tokens and placeholder media; real data, photographs and the domain are filled in at the end. Domain registration and WayForPay onboarding still have lead times that do not shrink by waiting.
> - **New work:** hero flock animation; quick-order requests; Telegram bot; weekly report; admin light theme; size calculator; euro price display; Google rating badge; messenger buttons. **Removed work:** newsletter, cart page, quick view, recently viewed, back-in-stock, compare, gift options.
> - **Four locales at launch, AI-translated**, with a human review of the legal pages. Phase 6 content effort drops on translation and rises on review.


A delivery plan, not a wish list. Every phase below has an entry condition, an exit condition,
and a named artefact that proves the exit condition was met. A phase without an exit test is a
phase that never ends.

This document is subordinate to [00-client-decisions-5.md](00-client-decisions-5.md), the
highest-authority document in the blueprint, then to
[00-client-decisions-4.md](00-client-decisions-4.md), then to
[00-client-decisions-3.md](00-client-decisions-3.md), then to
[00-client-decisions-2.md](00-client-decisions-2.md), then to
[00-client-decisions.md](00-client-decisions.md). Round 2 closed seven Phase 0 blockers, reopened
one workstream in a changed form, and created six new verification tasks. The consequences are
large enough to state at the top.

### What rounds 4 and 5 change in this plan

Round 4 resolves three questions and converts two of them into dated tasks rather than software.
Round 5 closes B16 and adds the largest single piece of new engineering since the international
path — together with an operational workflow that is bigger than the code attached to it.

| Ruling | Effect on this plan |
|---|---|
| **G1** — Іван primary, Любов fallback; legal surfaces name **Любов** | No schedule effect, one correctness effect. The contact ordering and the legal-page naming are **deliberately different**, and the L-series copy review must not "tidy up" the inconsistency |
| **G2** — made-to-order is **14 days of production before dispatch**, transit on top | **A capacity question before it is a build item.** Fourteen days of loom time per custom order is committed labour in a two-person factory. §35.10a states the assumption nobody has written down: how many concurrent custom orders the floor can hold |
| **G3** — the workshop may be toured, **accompanied by Іван**, arranged by phone | Two required shots added to B5, one copy approval, **zero software**. The thing that must not be built is a booking system |
| **G4** — a **business card already ships in every parcel** | A new launch task and a cheap one: card artwork plus a short-link redirect. The infrastructure exists and is already being paid for. §35.3.2b, O5 |
| **H1.1** — made-to-order requires **full online prepayment**; COD removed server-side | Engineering only. Payment methods are derived from cart contents server-side. The operational half shrank when [00-client-decisions-6.md](00-client-decisions-6.md) §J1 withdrew the mixed-cart split: one order, one parcel, one label, one payment — nothing changes at the packing bench beyond holding stocked goods on the shelf until the custom line is finished |
| **H1.2** — COD **with inspection at the branch**, Ukraine only, stocked items only | Confirms the payment matrix and puts two hard locale boundaries into code rather than into copy |
| **H1.3** — the **return-shipping deposit** | The largest new engineering item in round 5: two shipping-leg fields, a deposit credited **exactly once** on `DELIVERED`, a two-part revenue model ([31-analytics-architecture.md](31-analytics-architecture.md) §31.5), and a checkout block that is **Ukraine-only for legal reasons** |
| **H2** — 48 working hours / 72 hours validity / 36 for one-of-one | `{{WHOLESALE_RESPONSE_SLA}}` resolved. **Still requires client confirmation** before launch — it is a commitment, not a setting |
| **H3** — **Гондурак Любов Юріївна** owns international quotes | **Closes B16.** The model was decided in round 3; the missing half was the named person |
| **H3b** — custom sizing is a **per-product admin toggle** | A per-product content decision across the entire catalogue — several hundred to a thousand judgements nobody has budgeted. §35.9.1a |
| **H4** — all international carriers, chosen per order | Confirms F4. No schedule effect |

### What round 3 changes in this plan

Round 3 downgrades one blocker, hardens one gate, adds one technical blocker and adds one
**operational** commitment that is not a build item at all.

| Ruling | Effect on this plan |
|---|---|
| **F1** — `{{LEGAL_ID}}` exists and will be supplied on request | **B3 changes character, not status.** It is a chase item rather than a discovery item. The three gates it holds — WayForPay onboarding, the договір оферти, the German Impressum — all stay closed until the value is in hand. Chase it in week one; the payment contract behind it has its own lead time |
| **F2** — the Яворів site is a **shop** as well as a factory | **Strengthens the cold-start plan materially** (§35.10) and raises B6's priority further. A visitable retail address is a launch channel that does not depend on search, and it makes the GBP category configuration a launch-critical decision rather than a detail |
| **F3** — partner goods carry the Вівчарик brand | Closes the last open catalogue question. `brand` on both origins, `manufacturer` omitted on partner goods. Small engineering delta (§35.3.4); a real admin-UX delta ([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6.3a) |
| **F4** — buyer pays everything; international shipping is **quoted, not calculated** | Two consequences. A **pre-payment duty-disclosure gate** (L11, hardened below), and an **enquiry-then-invoice workflow** the client's team must actually run — quoting, invoicing, chasing. That second one is a capacity question, not a build item, and §35.11 carries it as such |
| **F5** — `gif19601@gmail.com` cannot be the transactional sender | **A new Phase 1 blocker, B15.** SPF and DKIM cannot be published for `gmail.com` and Gmail's consumer DMARC policy rejects such mail, so order confirmations would land in spam or be refused. Depends on `{{DOMAIN}}` (B2), which is why §35.3.0's deferral now has teeth it did not have in round 2 |
| **F6** — the tagline stays «в Карпатах» | No schedule effect. Яворів remains in supporting surfaces; only [29-seo-architecture.md](29-seo-architecture.md) §29.4's title templates rebalance |

### Closed by round 1, still closed

| Was | Now | Effect |
|---|---|---|
| "30 years" unsupported, legal risk | **Resolved.** Manufacturing continuous since ~1991–92 (D1) | A copy-discipline gate on the launch checklist (L6), not a blocker |
| Brand/domain conflict with `fabryka-shkur.com.ua` | **Resolved.** Separate business (D2) | Brand identity settled; the *domain string* is still open |
| Wool vs. fur scope conflict | **Resolved.** Full business, wool-led (D3) | IA unblocked |
| Mascot a live risk | **Resolved.** Brand core (D2) | [34-animation-storyboard.md](34-animation-storyboard.md) §34.10 is committed scope |

### Closed by round 2

| Was a Phase 0 blocker | Now | Effect on this plan |
|---|---|---|
| Legal entity unknown | **ФОП Гондурак Любов Юріївна** (§E1) | Unblocks the offer contract, WayForPay onboarding, the returns policy and the German Impressum. Drops out of Phase 0 |
| Production address unknown | **вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644** (§E2) | Unblocks GBP, `LocalBusiness` schema, the contact page — and materially strengthens the brand, because Яворів is the recognised centre of Hutsul lizhnyk weaving |
| Contacts unknown | **+380679973450** (Іван), **+380679604769** (Любов) (§E3) | Footer, contact page, GBP, packing slips |
| `{{PSP}}` unselected | **WayForPay** (§E10) | Selection closed; **six integration facts are not**, and become V6–V11 below |
| Scope, catalogue source | **Full business; catalogue may be copied from the adjacent site** (§E5) | The content-import workstream returns — as content, not SEO |
| Customer accounts | **Never. Guest checkout is permanent** (§E12) | Removes customer auth, account pages, the wishlist API and the v1.1 accounts commitment from scope entirely |
| `{{SKU_COUNT}}` unknown | **Several hundred to roughly a thousand**, from the import (§E5) | Stops being a blocker; the content arithmetic in §35.9 is recomputed against that range |

### The migration workstream partly returns — as content, not SEO

This is the largest single change to this plan and it is easy to get wrong in both directions.

| Returns | Stays cancelled, permanently |
|---|---|
| Catalogue export from the adjacent site | SEO migration of any kind |
| Photograph import to Cloudinary | 301 redirect mapping |
| Restructuring into the §D3 category tree | Search Console baseline capture |
| Re-authoring all text against that structure | Any claim of continuity with `fabryka-shkur.com.ua` |

The reason for the asymmetry is one fact: **`fabryka-shkur.com.ua` stays online and belongs to a
different business.** Its URLs and rankings are not available to inherit. Its product data is —
with a constraint that costs real hours and is scoped honestly in §35.9.

The net effect on the schedule is favourable but smaller than it first appears. Round 1's cancelled
migration removed roughly three weeks of engineering and removed the only existing asset library.
Round 2 gives the asset library back, which is genuinely large. It does not give back the *words*,
because every description must be rewritten (§E5). Content population remains the critical path;
it simply starts from a structured inventory rather than from an empty database.

## 35.1 Blueprint completeness

This plan cannot schedule work against documents that do not exist. Snapshot of `docs/` at the
time of writing:

**The blueprint is now complete.** Every document `00`–`35` exists, including
`00-client-decisions-3.md`, which supersedes `00-client-decisions-2.md` and `00-client-decisions.md`
where they overlap and is the authority this plan answers to.

The remaining documentation work is therefore **revision, not authoring** — rounds 2 and 3 touch
specifications written against earlier assumptions, and those revisions gate their phases exactly
as the original authoring did:

| Document | Revision required | Gates |
|---|---|---|
| [18-checkout-specification.md](18-checkout-specification.md) | The step design depends on WayForPay's integration mode (B8 / V6). Hosted redirect and embedded widget are different screens, not different configurations | **Phase 3** |
| [29-seo-architecture.md](29-seo-architecture.md) | Яворів as the specificity claim (§E2); **no `openingHours`** in `LocalBusiness` (§E3); `manufacturer` omitted for partner goods (§E7); still no migration or 301 mapping (§E5). **Round 3:** title templates rebalanced to «Карпати» on general pages and «Яворів» on specific-intent pages (F6); the `["Store", "LocalBusiness"]` typing justified and the GBP category guidance rewritten for a shop-and-factory (F2) | **Before any URL is minted** — a cold-start domain cannot afford to rename its routes later |
| [32-security-architecture.md](32-security-architecture.md) | The customer-auth threat model is deleted outright; the EU legal surface (§E11) is added. **Round 3:** §32.16 email authentication added (F5); the duty disclosure restated as a consumer-law obligation (F4) | Phase 1 |
| [23-admin-panel-architecture.md](23-admin-panel-architecture.md) | **Round 3:** the structured-data preview and origin-change flow (F3), and the international quote workflow (F4) | Phase 5 — but the quote workflow gates Phase 3's exit test, so its design is settled earlier |
| [31-analytics-architecture.md](31-analytics-architecture.md) | **Round 3:** the international funnel separated from the domestic one, and §31.13's honest account of what shop footfall can and cannot be measured (F2, F4) | Phase 3 for the events; Phase 9 for the reporting template |
| [20-production-page-specification.md](20-production-page-specification.md) | Hide pipeline is in-house (§E6); «бельгійська технологія» removed; every claimed stage must be photographed | Phase 4, after B5 |
| [04-sitemap.md](04-sitemap.md) | Account pages removed (§E12); `de` Impressum and withdrawal form added (§E11) | Phase 1 |
| [22-blog-specification.md](22-blog-specification.md) | Articles written fresh, never imported (§E5) | Phase 6 |

---

## 35.2 Phase structure

Durations assume `{{TEAM_SIZE}}` — the plan below is costed against a team of one senior
full-stack engineer, one designer, one content/translation coordinator, and the client's own
staff for catalogue entry. Every duration scales roughly linearly with that assumption and none
of them is a commitment until the team is named.

| Phase | Goal | Entry criteria | Exit criteria | Weeks |
|---|---|---|---|---|
| **0 — Blocker resolution** | Close everything that makes design or build unsafe | Signed engagement; client available for decisions | All §35.3 gates closed; **V6–V11 answered from WayForPay's current documentation**; Yavoriv shoot booked with a date, shot list including the shop interior; **GBP verified against the §29.16 checklist with a both-functions primary category**; `{{DOMAIN}}` chosen (B2, pulled forward); the international model decided with a **named owner** (B16) | 3–5, client-bound |
| **1 — Foundations** | A repo that can build a page correctly | Phase 0 closed | Token pipeline emits CSS + Tailwind; schema migrated; **staff** auth + RBAC working with two seeded Owners; CI green with all gates armed; missing specs authored | 3 |
| **2 — Catalogue** | Browse and find a product | Phase 1 exit; category tree confirmed | Listing, facets, search, PDP, variants, `ProductOrigin` all working against seeded data at ≥2,000 SKUs; facet query plan load-tested | 4 |
| **3 — Commerce** | Buy a product | Phase 2 exit; WayForPay contracted and V6–V11 answered; **`{{DOMAIN}}` registered and DNS delegated (B2)** | Guest checkout completes end to end in all four locales; order state machine passing, **including the `AWAITING_QUOTE` → `QUOTE_SENT` → `PAID` international path** (F4); Nova Poshta rates live; the duty disclosure rendered pre-payment; **transactional email sending from `{{DOMAIN}}` with SPF, DKIM and DMARC passing** (B15) | 4 |
| **4 — Narrative surfaces** | The brand argument, and the motion system | Phase 1 exit; **Yavoriv shoot delivered** | Homepage, production, about, blog, wholesale, gallery built; [34-animation-storyboard.md](34-animation-storyboard.md) implemented; P1–P9 measured once | 4 |
| **5 — Admin** | The client can run the shop without us | Phase 2 exit | All nine D4 per-product capabilities editable; content import with the duplicate-text guard working; media upload with per-locale alt enforcement; staff trained | 3 |
| **6 — Content population** | A catalogue worth launching | Phase 5 partially usable; import taken; Yavoriv photography in hand | `uk` complete for every launch category **with every description rewritten**; `en` at launch threshold; `pl`/`de` at static + category threshold | **runs weeks 4–20, and is the critical path** |
| **7 — Hardening** | Meet the numeric targets | Phases 2–6 feature-complete | All §35.11 gates passing on staging with real content | 3 |
| **8 — Launch** | Live on `{{DOMAIN}}` | Phase 7 exit; client sign-off | Site live; GBP linked; sitemaps submitted; monitoring green for 72 h | 1 |
| **9 — Post-launch** | Learn, and fix what measurement finds | Launch | §35.13 90-day plan complete | 13 |

**Elapsed calendar time: 22–26 weeks from Phase 0 close**, assuming photography lands on time.
Phases 2/4 and 3/5 overlap; Phase 6 overlaps everything after week 4. If photography slips, the
whole plan slips — that is stated as a risk in §35.12 and it is the only risk with no mitigation
that preserves the design thesis.

**The range does not narrow because of the catalogue import.** It would be convenient to book §E5
as a saving and shorten Phase 6, and that would be wrong. The import removes data entry and
photography-of-product; it does not remove writing, and writing was always the long pole.
§35.9.2 quantifies the difference rather than asserting it.

---

## 35.3 Phase 0 — blocker resolution

**Design cannot be signed off, and no production code may be written against an unresolved item
in this table.** That is not process theatre. Each row below, if answered late, invalidates work
that has already been paid for.

| # | Blocker | Why it blocks | Owner | Exit artefact |
|---|---|---|---|---|
| **B1** | **Reconcile the 168-question client interview** against [00-assumptions.md](00-assumptions.md) | Every business rule in the blueprint is currently a numbered assumption ([00-README.md](00-README.md)). Rounds 1 and 2 closed most of them; the rest are open | Client + PM | A revised assumption register with every row marked CONFIRMED, REVISED or STILL OPEN |
| **B2** | **Register `{{DOMAIN}}` = `vivcharyk.shop`** | **Chosen in round 7, not yet registered** ([00-client-decisions-7.md](00-client-decisions-7.md) K1). Register now: unregistered is not reserved. See §35.3.0 for the three things it blocks | Client | Domain registered, DNS delegated, registrar credentials in the shared vault |
| **B3** | **`{{LEGAL_ID}}` — ЄДРПОУ / РНОКПП for ФОП Гондурак Л. Ю.** — **exists; chase it** | [00-client-decisions-3.md](00-client-decisions-3.md) F1 confirms it exists and will be supplied on request. That removes the discovery risk and **none of the dependency**: it still blocks exactly three deliverables — the **WayForPay merchant contract** (B12), the **договір оферти** and the **German Impressum**. `de` cannot launch without an Impressum at all (§E11), and no card payment exists without the merchant contract | Client | The identifier, in writing, verified against the state register |
| **B4** | **Font coverage verification V1** ([10-typography.md](10-typography.md) §10.2) | If `e-Ukraine` or `Kyiv*Type Serif` lack Polish or German diacritics the body and display families both change, which re-cuts every type spec and every layout measured in `ch` | Designer | A rendered proof sheet of the full `pl`/`de`/`uk` character set inspected in DevTools' computed-font panel, not by eye |
| **B5** | **Commission the Yavoriv shoot** (§E5) — **scheduled ~2026-10-06**, shot by the project lead: production video raw fleece to finished product, plus replacement photographs ([00-client-decisions-8.md](00-client-decisions-8.md) §L10) | **Descoped, not cancelled.** The reused library covers catalogue frames; it does not cover the strategy, because those photographs document a different workshop in a different village. See §35.3.3 | Client + Designer | Signed shoot agreement, a **dated** one-to-two-day schedule, shot list derived from §35.9.1, written commercial licence |
| **B6** | **Verify and reconfigure the Google Business Profile** against the [29-seo-architecture.md](29-seo-architecture.md) §29.16 checklist | A profile exists and [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms it correct, but it could not be resolved automatically (HTTP 429) and its *configuration* has never been inspected. **F2 raises the stakes**: the premises are a shop as well as a factory, so the primary category must cover both functions and the retail attributes must be set. A manufacturer-only category suppresses «де купити ліжник» intent; a shop-only category discards the manufacturing story. This is the highest-leverage single field in the launch | Client + PM | Every row of the §29.16 table confirmed manually: name, byte-for-byte address, **a primary category covering both retail and manufacturing**, **in-store shopping and in-store pickup attributes set**, website field, phone, Yavoriv photos **including the shop interior**, and **ownership under the client's control** |
| **B7** | **Take the catalogue export** (§E5) | Confirms the exact SKU count, and is the input to every downstream content estimate. The range is known; the figure is not | Client + PM | A per-category export across the D3 tree with product, variant and media inventory |
| **B8** | **WayForPay V6 — integration mode** (§E10) | Hosted redirect, embedded widget or direct API **materially changes the checkout step design** in [18-checkout-specification.md](18-checkout-specification.md). Building against the wrong one is a rebuild of the highest-value screen in the product | Backend + PM | The answer, quoted from current official documentation, with the doc URL and access date recorded |
| **B9** | **WayForPay V7 — signature algorithm and field order** | A guessed field order fails silently, or worse, passes in sandbox and fails in production | Backend | The algorithm and the exact ordered field list, from the documentation — **never inferred from a sample payload**, because a sample with no empty fields does not reveal how empty fields are joined |
| **B10** | **WayForPay V8 — webhook payload, acknowledgement and retries** | Many Ukrainian acquirers require a *specific* acknowledgement body. Returning the wrong one produces an indefinite retry storm against a receiver that is actually working ([26-api-architecture.md](26-api-architecture.md) §26.14.1) | Backend | Payload shape, required ack body, retry schedule |
| **B11** | **WayForPay V9 — refund and partial-refund support** | Determines whether `PaymentStatus.PARTIALLY_REFUNDED` is reachable and whether the admin renders a refund control at all. A refund button that cannot refund is worse than no button | Backend + PM | Supported operations and their constraints |
| **B12** | **WayForPay V10 — can a ФОП on the simplified tax system contract?** | If the answer is no, the entire payment rail changes and Phase 3 changes with it. This is the highest-consequence unknown on the list and the cheapest to ask | Client + PM | A signed merchant agreement, or a documented refusal that reopens PSP selection |
| **B13** | **WayForPay V11 — supported settlement currencies** | §E11 makes `en`/`pl`/`de` transactional. If non-UAH settlement is unavailable, prices display converted and charge in UAH, and the checkout must say so plainly | Backend + PM | The supported currency list and the settlement terms |
| **B14** | ~~**Confirm the Hutsul-lizhnyk heritage wording** (§E2)~~ **Closed** by [00-client-decisions-8.md](00-client-decisions-8.md) §L6 — the craft is on the national register; the company holds nothing | Яворів's status as «столиця ліжникарства» is the strongest brand asset on this project, and the intangible-heritage framing around it is the easiest thing to overstate | Content + Client | The exact status and permitted wording, with a written rule that **Вівчарик itself never implies a heritage designation** — the craft may be listed; a company is not |
| **B15** | **Transactional email authentication** ([00-client-decisions-3.md](00-client-decisions-3.md) F5) | **Technical blocker, new in round 3.** `gif19601@gmail.com` cannot be the sending address: SPF and DKIM cannot be published for `gmail.com` by a third-party system, and Gmail's consumer DMARC policy rejects such mail. Order confirmations would land in spam or be refused. With guest checkout permanent (§E12), the confirmation email is the **only** route a customer has to their order, so this is revenue, not hygiene. **Depends on B2** | Client + Backend | SPF, DKIM and DMARC published for `{{DOMAIN}}`; a test confirmation delivered to the inbox at Gmail, Microsoft 365 and a Ukrainian provider with all three passing in the raw headers ([32-security-architecture.md](32-security-architecture.md) §32.16) |
| **B16** | ~~**Decide and staff the international model**~~ — **CLOSED by [00-client-decisions-5.md](00-client-decisions-5.md) H3** | Enquiry-then-invoice was already the recommended model; the missing half was a named owner. **H3 supplies it: Гондурак Любов Юріївна**, as ФОП seller of record — quoting is a commercial act and the person who signs the contract should price the shipping. H2 supplies the response-time expectation: **48 working hours**, published to the customer as «протягом 2 робочих днів». `Lead.assignedToId` defaults to her account | — | **Met.** The decision is written, the person is named, the SLA is set. What survives is O1–O2: the workflow must be *rehearsed by her*, and the 48-hour figure **confirmed** before it is published ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 2) |
| **B17** | **Confirm the 48h / 72h / 36h commitments** ([00-client-decisions-5.md](00-client-decisions-5.md) H2, §H5 item 2) | The client delegated the decision — «зроби сам дуже розумно» — and defaults were chosen safely. They are published on the wholesale page, in the auto-reply and in the confirmation state. A published SLA that the business has never agreed to is the fastest available way to break a promise on the surface whose entire subject is whether promises are kept | Client + PM | The three figures confirmed or replaced, in writing, before any of them ships in copy |
| **B18** | **Approve the workshop-tour copy** ([00-client-decisions-4.md](00-client-decisions-4.md) G3) | «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» is supplied *pending approval*. Every clause is load-bearing and the failure mode of an improvised alternative is a promise of access the business cannot keep — which converts the project's strongest trust asset into a public complaint. It appears on four surfaces from one shared setting, so one approval covers all of them and one bad improvisation reaches all of them | Client + Content | The wording approved verbatim, in writing, with the four prohibitions recorded alongside it: no fixed times, no «відкрито для відвідувачів», no drop-in, no booking form |
| ~~**B19**~~ | ~~How is a custom size priced?~~ — **CLOSED** by [00-client-decisions-5.md](00-client-decisions-5.md) §H3c | The owner sets a rate per square metre per product in the admin; the system computes `max(area_m2 × rate, minPrice)` live and **recomputes it server-side at checkout**, which is the charged figure. Category rates are a copy-on-create seed, never a live fallback — editing one must not silently reprice existing products. Physical loom bounds constrain the dimension inputs so an unweavable order cannot be placed. No longer blocks a flow; it is build work, scheduled at §35.10 | — | Closed |

> **B8–B13 share one rule.** Nothing WayForPay-specific is written into code, into
> [26-api-architecture.md](26-api-architecture.md), or into
> [18-checkout-specification.md](18-checkout-specification.md) **until it has been read from
> current official WayForPay documentation.** Not from memory, not from a blog post, not from an
> older integration. PSP details drift between versions and between merchant agreements, and a
> reconstructed signature format is the single highest-risk shortcut available on this project —
> it fails silently, in production, on real money.

### 35.3.0 `{{DOMAIN}}` is deferred, and exactly three things break because of it

> **Round 7:** the domain is chosen — `vivcharyk.shop` ([00-client-decisions-7.md](00-client-decisions-7.md) K1).
> It is not yet registered, so the table below still applies until DNS is delegated. Registration
> date is now the critical path for B15.

[00-client-decisions-2.md](00-client-decisions-2.md) §E9 defers the domain choice to VPS setup,
near the end of the build. That is acceptable for the overwhelming majority of the work, because
everything else resolves through a single configuration value and the `{{TOKEN}}` CI scan (G1)
prevents an unresolved token reaching a build.

Three things do not resolve that way and must not be forgotten:

| Blocked by `{{DOMAIN}}` | Consequence of forgetting |
|---|---|
| **Branded email** (`{{BRANDED_EMAIL}}`) **and the transactional sender** (`{{TRANSACTIONAL_FROM}}`) | **Upgraded in round 3 from "no email exists" to "an email exists and it cannot be used for this".** [00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com`, which is usable as a public contact address and **structurally unusable as a sending address** — SPF and DKIM cannot be published for `gmail.com` and Gmail's consumer DMARC policy rejects mail that fails them. Every transactional message, the GBP contact, the offer contract, the Impressum and the staff Owner accounts (§35.6.1) need a domain address. SPF, DKIM and DMARC take days to propagate and verify and the DMARC ramp runs in sequence after them. With guest checkout permanent the confirmation email is the *only* way a customer reaches their order (§E12) — **deliverability is a launch blocker, not a hardening task.** B15 |
| **The GBP website field** | This is the profile's main job (§E4), and GBP is the primary launch channel. A verified profile pointing nowhere wastes the quarter it took to verify |
| **Absolute URLs** in structured data, sitemap, `sameAs`, canonicals and OG tags | These cannot be relative. A late domain means regenerating and resubmitting the sitemap and re-validating every structured-data block — cheap if planned, a launch-day scramble if not |

The scheduling consequence tightens in round 3: the domain may be chosen late, but it must now be
chosen **before Phase 3**, not before Phase 7. Phase 3's exit criterion includes transactional email
sending, and F5 means that cannot be satisfied with the client's Gmail address even temporarily.
The sequence is domain → DNS → provider verification → SPF/DKIM → DMARC at `p=none` → two weeks of
clean reports → `p=quarantine`, and none of those steps parallelise. Starting it in Phase 7 ships a
launch on an unverified sending configuration, which is the arrangement that silently degrades
three months later when a major receiver tightens its defaults.

### 35.3.0a `{{TRANSACTIONAL_FROM}}` — the interim position, stated so nobody improvises one

There is no working interim configuration, and that should be said before somebody invents one
under schedule pressure.

| Tempting interim | Why it fails |
|---|---|
| Send from `gif19601@gmail.com` via the transactional provider | SPF fails, DKIM is unaligned, Gmail's consumer DMARC policy rejects. This is the exact scenario F5 describes |
| Send from the provider's own shared domain | Passes authentication and fails everything else: the customer receives an order confirmation from a domain they have never heard of, for a purchase of 5,000–15,000 UAH. It reads as phishing, which is worse than spam |
| Relay through the owners' Gmail with an app password | Gmail's sending limits are low, the mailbox becomes a single point of failure, and any password change silently stops all order confirmations |
| Ship without confirmation emails | Guest checkout is permanent (§E12). The confirmation email *is* the customer's only access to their order |

The correct answer is that the domain is not actually deferrable as far as §E9 assumed, and this
subsection exists to make that conclusion arrive in Phase 0 rather than in Phase 7.

### 35.3.1 What is *not* a Phase 0 blocker any more

Dropped out by round 1:

- **The 30-year claim.** D1 settles it. It becomes a launch-checklist copy gate (§35.11, L6),
  not a blocker.
- **Brand identity.** Вівчарик is confirmed, with the shepherd/sheep identity as brand core.
- **Catalogue scope.** D3 and D4 settle it. Wood is explicitly out of v1.
- **The mascot.** D2 closes [00-assumptions.md](00-assumptions.md) F8.

Dropped out by round 2 ([00-client-decisions-2.md](00-client-decisions-2.md)):

- **Legal entity.** ФОП Гондурак Любов Юріївна (§E1). `{{LEGAL_ENTITY_NAME}}` resolved. Only the
  identifier remains (B3).
- **Production address.** вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область,
  78644 (§E2). `{{FACTORY_ADDRESS}}`, `{{FACTORY_CITY}}` and `{{POSTAL_CODE}}` all resolved. Note
  it is **Яворів, not Вербовець** — which also cleanly separates Вівчарик's NAP from the adjacent
  business's.
- **Contacts.** +380679973450 (Іван), +380679604769 (Любов) (§E3).
- **PSP selection.** WayForPay (§E10) — though its *integration* is now B8–B13.
- **Catalogue source.** The adjacent site's products and photographs may be copied (§E5).
- **Customer accounts.** Guest checkout is permanent (§E12). This does not defer a decision; it
  deletes a feature set.
- **`{{SKU_COUNT}}`.** Several hundred to roughly a thousand (§E5). B7 now confirms a figure
  rather than discovering a range, and the search architecture no longer waits on it.
- **Dye lots.** Not tracked (§E8). No admin field, no facet, no PDP display.
- **Partner naming.** Partners cannot be named (§E7). `partnerRegion` carries the disclosure.

### 35.3.2 New Phase 0 items created by round 2

| Item | Why it is new | Owner |
|---|---|---|
| **No business email exists at all** | §E3. Previously assumed to exist and merely need branding. It does not exist, so the work is provisioning plus DNS authentication, not aliasing | Client + PM |
| **No social media exists** | §E3. The owners run none. [00-client-decisions.md](00-client-decisions.md) §D2 named Instagram a primary launch channel; **that channel does not exist**. See §35.10 | PM |
| **Recommendation: create an Instagram account before launch** | Recorded as a recommendation, not a decision. For a craft manufacturer it is where the photography does its work and it is the cheapest proof-of-life signal a new domain can have. The capability exists in the family — the adjacent business runs `@fabryka_shkur` successfully | Client |
| **Opening hours are variable and must not be hard-coded** | §E3. `LocalBusiness` JSON-LD omits `openingHours` entirely. Publishing hours that are wrong twice a week produces "permanently closed" user reports and erodes the profile's trust signals | SEO |
| **EU legal deliverables** | §E11 makes `de`/`pl` transactional. See §35.11 L8–L10 | Legal + Content |

### 35.3.2a New Phase 0 items created by round 3

| Item | Why it is new | Owner |
|---|---|---|
| **The email address exists and cannot be used as the sender** | F5. This replaces round 2's "no business email exists" with a harder problem, because an address that exists invites the assumption that it works. B15 | Client + Backend |
| **GBP primary category must cover retail *and* manufacturing** | F2. The premises are a shop as well as a factory. This is a one-field decision that determines whether the profile is eligible for the highest-intent query class available to the business. B6 | Client + SEO |
| **A named person responsible for answering international quotes** | F4. Enquiry-then-invoice is a recurring human workflow, not a feature. Without a named owner and a response-time expectation it degrades within a month into unanswered enquiries, which is worse for the brand than not offering international shipping at all. B16 | Client + PM |
| **`{{LEGAL_ID}}` is a chase, not a discovery** | F1. Lower risk, same dependency. It gates the WayForPay contract, which has its own lead time (B12) | Client |
| **Photograph the shop interior on the Yavoriv shoot** | F2. The shop is now a subject in its own right: it proves the GBP retail attributes, it is what a visitor checks before driving to a village, and it is the evidence behind the contact page's promotion to a destination page. One line on the B5 shot list | Designer + Client |

### 35.3.2b New Phase 0 items created by rounds 4 and 5

| Item | Why it is new | Owner |
|---|---|---|
| **The parcel card already exists — design what goes on it** | G4. This is the cheapest launch task in the plan and the only physical channel the project has. The infrastructure is in place: a card already ships in every parcel. What is missing is a short URL, a QR code to the same URL, and the primary phone. It reaches the **counter-sale customer**, who has no order number, no captured email and no session, and who is by definition the most convinced customer the business has — they stood in the building. Reviews are the scarcest asset at launch: zero exist, `AggregateRating` stays suppressed until three verified ones do, and there is no social proof anywhere because there is no social media. **Half a day of design and one redirect route.** O5 | Designer + Client |
| **A short-link redirect route and its landing page** | G4. `{{DOMAIN}}/v` → a review-and-reorder page, with `?from=card` read into a session dimension ([31-analytics-architecture.md](31-analytics-architecture.md) §31.13). **No per-order codes** — variable printing is a workflow this team should not be asked to run, and G4 rules it out explicitly. Depends on B2 | Frontend |
| **Accept that card-sourced reviews are unverified** | G4. No order linkage means `isVerifiedPurchase` stays `false` and they are excluded from the aggregate ([25-database-schema.md](25-database-schema.md) §25.6). This is a constraint to honour, not to engineer around, and it has a reporting consequence: **review count and star rating will diverge, possibly for months.** Recorded here so nobody treats it as a bug in week three | PM |
| **Two new shots on the B5 list, and a scheduling constraint on the shoot date** | G3 and the §20.2 photograph-or-delete rule. See §35.3.3 — this is the largest round-4 change to the plan | Designer + Client |
| **Per-product custom-sizing decisions across the catalogue** | H3b. `allowsCustomSize` is off by default and set per product. At several hundred to a thousand SKUs that is a judgement per row, made by someone who knows what the looms can do. §35.9.1a | Client + Content |
| **The made-to-order operational workflow** | H1.1 and G2. Full prepayment, 14 days of production, a new `IN_PRODUCTION` status, and a mixed-cart split the packing bench has to execute. §35.10a | Client + PM |
| **The return-deposit copy, confirmed before it ships** | H1.3 and [00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 4. It is the one rule on the site that can be misread as a hidden fee, and it sits directly in front of the payment method that otherwise resolves the category's largest objection. [02-ux-research.md](02-ux-research.md) §2.8 R15 tests it pre-launch for the price of one moderated session | Client + Content |

### 35.3.3 Photography: descoped, not cancelled

§E5 permits reusing the adjacent business's photographs, which solves *catalogue coverage*. It
does not solve the strategy.

| Was | Now |
|---|---|
| Full catalogue shoot, every SKU, ~33 shoot-days across two productions | **Not needed.** Reuse covers it, after re-crop, re-grade, EXIF strip, semantic rename and new `alt` |
| Factory, process, machinery, people, place | **Still required.** One to two days in Yavoriv |

The reason the shoot survives at all is the reason it matters most: the entire positioning rests
on showing **Yavoriv production** ([01-brand-strategy.md](01-brand-strategy.md) §1.8), and the
reused photographs document a different workshop in a different village. Homepage hero, production
page and about page cannot be built from them without the site quietly claiming someone else's
workshop as its own.

§E6 adds a self-policing constraint that folds into the same shoot. The full production cycle
including hides is confirmed, so [20-production-page-specification.md](20-production-page-specification.md)
may specify both the wool and the hide pipelines as in-house — **provided the page carries
photographs of the actual stages being claimed, including tanning.** If a stage cannot be
photographed, it is not asserted. That keeps the page honest without anyone having to audit it,
and it belongs on the Yavoriv shot list rather than being discovered during copywriting.

Remove the «бельгійська технологія» framing entirely wherever it appears. It belonged to the
adjacent business and must not be inherited.

#### The hide pipeline is a shot list, not a content plan — and this constrains the shoot *date*

This is the scope statement that has been implicit and must stop being implicit.
[20-production-page-specification.md](20-production-page-specification.md) §20.2 storyboards ten
hide stages. Because §20.6's render rule refuses to render a stage with no `MediaRole.PRODUCTION`
photograph, **each of those ten stages is a required shot on this shoot, not a content item that
can be written now and illustrated later.** There is no fallback library: reused photographs
document a different workshop in a different village and are barred from that page outright.

> **The rule, in one line: if a stage is not filmed in Яворів, the production page does not have
> that stage, permanently.**

The consequences are unevenly distributed, and the expensive half is the half that is hardest to
shoot:

| Stage group | Difficulty | What the page loses if it is not shot |
|---|---|---|
| B1–B2 selection, salting | Low — dry, static, well-lit | The by-product framing that answers the `de` ethical objection. Recoverable on a second visit |
| **B3–B5 soaking, liming, tanning** | **High.** Wet, dim, chemically hostile to equipment, and running on the tannery's clock rather than the photographer's | **The entire in-house tanning claim.** §E6's confirmation becomes unusable: the page would assert ten stages and illustrate seven, which the render rule forbids. Track B collapses to a finishing pipeline, and with it the strongest line on the page — that a reseller can buy good photography but not a liming pit |
| B7, B9 softening, cutting | Medium — mechanical, visible, schedulable | Two of the three expanded stages. One signature stage does not justify a chapter |
| A1–A7 wool | Low to medium, all schedulable | Proportionally less, because wool is the lead track and its stages are the easiest to re-shoot |

**The planning consequence, and it is the one that gets missed.** B3–B5 must be scheduled against
the **tannery's actual working cycle**, not against a convenient date in the project plan. If the
wet stages are not running on the days the photographer is present, no amount of time on site
produces them, and a second visit costs a second mobilisation for the one sequence that most needs
to be in the can. **B5's exit artefact — "a *dated* one-to-two-day schedule" — must therefore be
dated against production, and the shot list must record which stages are running on which day.**

Two further shots join the list from round 4:

| # | Shot | Ruling | Why it is not optional |
|---|---|---|---|
| S9 | **The shop interior, with the workshop visible or adjacent in frame** | F2 | Already on the list from round 3. One frame proving «магазин і виробництво в одному місці» is worth more than the copy that claims it |
| S10 | **Іван mid-explanation beside a machine, with a second person in frame** | **G3** | Four surfaces now offer a walk through the workshop with the owner ([20](20-production-page-specification.md) §20.11, [21](21-about-page-specification.md) §21.9, [19](19-wholesale-page-specification.md) §19.7 and §19.17). Each asks the reader to picture that. Without this frame, the project's strongest trust asset is a sentence under a portrait. The second person needs no identifiable face — a shoulder is enough, which also keeps the consent burden to one subject. **One frame serves all four surfaces** |

### 35.3.4 New engineering work created by the client decisions

| Item | Workstream | Effort |
|---|---|---|
| `ProductOrigin` enum + `partnerName` (internal-only) + `partnerRegion` on `Product` | Backend, schema | 0.5 day + migration |
| Origin badges — «Власне виробництво» / «Відібрано Вівчариком» + «Виготовлено карпатським майстром» where the region is known | Frontend, design | 1 day |
| Origin filter facet on listings, pinned to the top of the panel | Frontend + backend | 1 day |
| Divergent structured data per origin — `brand` = Вівчарик on **both** origins (F3), `manufacturer` **omitted entirely** for partner goods rather than set to Вівчарик (§E7, F3), with a CI assertion on both | SEO | 1 day |
| **Admin structured-data preview + origin-change confirm flow** ([23](23-admin-panel-architecture.md) §23.6.3a) — read-only `Product` node rendered from the production serialiser, the omitted `manufacturer` shown as an explicit not-stated row, directional confirm copy on origin change, provenance-field clearing announced before it happens | Admin | **2 days** |
| **International quote workflow** ([23](23-admin-panel-architecture.md) §23.8.3a) — two order statuses, the quote panel with editable weight and carrier, expiry job, quote email, one automatic reminder, the «Потребують прорахунку» view, `hours_to_quote` and quote→paid instrumentation | Backend + Admin | **4 days** |
| **Email authentication setup** — sending domain, SPF, DKIM, DMARC ramp, forwarding of the branded address to the owners' Gmail **as the interim only** (superseded by the mail row below), header-level delivery verification across three receivers ([32](32-security-architecture.md) §32.16) | Backend + Client | 1 day of work spread across ~3 weeks of propagation and ramp |
| `origin = OWN_MANUFACTURE` as a hard predicate on every homepage and brand-surface query | Frontend | 0.5 day |
| Admin: origin field; `partnerName` internal-only with a permanent «не відображається на сайті» marker ([23](23-admin-panel-architecture.md) §23.6.3) | Admin | 0.5 day |
| Weight-based buy box, cart maths and shipping for пряжа / ровниця / вовна для рукоділля (D4) | Frontend + backend | 3 days |
| **Content-import pipeline with the duplicate-text guard** ([23](23-admin-panel-architecture.md) §23.6.9) — shingle fingerprinting, similarity scoring, per-finding acknowledgement with audit | Backend + Admin | **4 days** |
| **International checkout path** — country-driven shipping, COD blocked outside UA, hide categories gated by destination, duty disclosure recorded in the order snapshot ([26](26-api-architecture.md) §26.10.4) | Backend + Frontend | **4 days** |
| **Payment-method derivation from cart contents** (H1.1) — available methods computed server-side from the lines; COD **absent from the response**, not hidden in the UI, when any line has `madeToOrderDays != null` or the destination is outside Ukraine. Plus the `payment_method_unavailable` event with its reason | Backend | **1 day** |
| **The return-shipping deposit** (H1.3) — `shippingForwardMinor`, `shippingReturnDepositMinor`, `depositAppliedMinor`, `codAmountMinor` on `Order`, replacing `shippingMinor` for COD orders; the checkout block with the buyer's real arithmetic; **`depositAppliedMinor` credited exactly once, on transition to `DELIVERED`**, in the order state machine with a test; two-part `purchase` emission with `capture_stage` ([31](31-analytics-architecture.md) §31.5); and a **locale guard making the whole mechanic unreachable for `en`, `pl` and `de`** | Backend + Frontend | **3 days** |
| **Custom sizing** (H3b, H3c) — `Product.allowsCustomSize` with the admin toggle and its inline consequence warning, `OrderItem.customSpec` for the captured dimensions, the «Свій розмір» option in the PDP size selector, and the buy-box mode switch: dimension inputs constrained by the stored loom bounds, lead time, COD withdrawal, and the live `max(area_m2 × rate, minPrice)` price **recomputed server-side at checkout**. Unblocked — the pricing rule is settled. Also covers the admin rate panel and the copy-on-create category seed with its opt-in bulk apply | Backend + Frontend + Admin | **5 days** |
| **`OrderStatus.IN_PRODUCTION`** (G2) between `CONFIRMED` and `PACKING`, with the customer-facing status copy and the confirmation email restating a **date** rather than a duration | Backend | 0.5 day |
| **Mixed-cart disclosure** (J1) — detection of a mixed cart, the `mixedCart` block on the cart and payment-method responses, and the disclosure rendered **at the add** rather than at checkout, with its `aria-live` announcement and its persistent restatement in cart and checkout. The split itself is **withdrawn** ([00-client-decisions-6.md](00-client-decisions-6.md) §J1), which removes the paired-order machinery and the packing-bench change entirely | Backend + Frontend | **0.5 day** |
| **The parcel card's short link** (G4) — one redirect route, `?from=card` into a session dimension, and a review-and-reorder landing page. Depends on B2 | Frontend | 0.5 day |
| **Removal of customer auth** — no register, login, refresh, reset, verification, `/v1/me/*`, wishlist API, or account pages (§E12) | All | **negative: ~8 days removed** |
| Guest order lookup as a mail-back, with its own rate limits ([26](26-api-architecture.md) §26.10.5) | Backend | 1 day |
| Two-Owner seed ([24](24-employee-permission-architecture.md) §24.16) | Backend | 0.5 day |
| **Business mail in the admin panel** (K2) — Cloudflare Email Routing + Email Worker + private R2 bucket, the signed inbound webhook and reconciliation, MIME parsing, HTML sanitisation and sandboxed rendering, threading and order/lead linking, outbound replies with correct headers, transactional mail recorded into threads, attachments, per-user read state, drafts, sender rules, the `mail.*` permissions, the three-pane screen **and its phone layout**, Web Push, the hostile-mail fixture suite, retention and erasure ([23](23-admin-panel-architecture.md) §23.13a, [25](25-database-schema.md) §25.8c, [26](26-api-architecture.md) §26.16.2, [32](32-security-architecture.md) §32.16a) | Backend + Admin | **14–18 days** |
| **Mandatory 2FA for all staff** ([00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 4) — TOTP enrolment with QR, replay guard, 10 recovery codes, the 7-day remembered device, `employees.reset_mfa`, lockout integration, the sole-Owner break-glass runbook ([24](24-employee-permission-architecture.md) §24.11) | Backend + Admin | **4–5 days** |
| **Wholesale volume discount** ([00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 5) — tiers in `Setting`, counted-pieces rule, promo-versus-volume comparison, cart nudge, order snapshot ([18](18-checkout-specification.md) §18.10a) | Backend + Frontend | **1.5 days** |
| Cold-start SEO: GBP, long-tail content plan, **no migration section** | SEO | see §35.10 |

The customer-auth removal is the only line in this blueprint that returns time. It is worth
stating plainly that it also removes risk: no customer password storage, no public login form to
stuff credentials against, no customer session fixation surface, and a materially smaller GDPR
footprint. That is a better trade than the eight days.

---

## 35.4 Dependency graph

```
                         ┌─────────────────────────────────────────┐
                         │            PHASE 0 BLOCKERS             │
                         └─────────────────────────────────────────┘
                                          │
      ┌───────────┬───────────┬───────────┼───────────┬───────────┬───────────┐
      │           │           │           │           │           │           │
     B3          B4          B5          B6          B7      B8–B13         B14
  legal id     fonts      YAVORIV       GBP       catalogue  WAYFORPAY    heritage
      │           │        SHOOT      verify      export     V6–V11       wording
      │           │           │           │           │           │           │
      ▼           ▼           ▼           ▼           ▼           ▼           ▼
  offer        type      hero, about,   local     content    checkout     brand copy,
  contract,    scale     production      SEO,     estimate,   design,     meta titles,
  Impressum   + layout   page — the      NAP,     import      webhook,    structured
      │       measured   BRAND ITSELF   photos    mapping     refunds       data
      │           │           │           │           │           │           │
      └───────────┴───────────┴─────┬─────┴───────────┴───────────┴───────────┘
                                    │
                      ┌─────────────▼─────────────┐
                      │    PHASE 1 FOUNDATION     │  tokens · schema · STAFF auth · CI
                      └─────────────┬─────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
        ┌────────▼────────┐ ┌───────▼─────────┐ ┌──────▼──────────┐
        │  P2 CATALOGUE   │ │ P4 NARRATIVE    │ │  P5 ADMIN       │
        │  listing, PDP,  │ │ home, production│ │  CRUD, IMPORT + │
        │  facets, search │ │ motion system   │ │  DUP-TEXT GUARD │
        └────────┬────────┘ └───────┬─────────┘ └──────┬──────────┘
                 │                  │                  │
                 │             needs B5                 │
                 ▼                                      ▼
        ┌─────────────────┐                    ┌─────────────────────┐
        │  P3 COMMERCE    │◀─ needs B8–B13 ────│ P6 CONTENT          │
        │  cart, checkout │                    │ POPULATION          │◀─ needs B5, B7
        │  WFP, shipping, │                    │ import → REWRITE    │
        │  intl path      │                    │ *critical path*     │
        └────────┬────────┘                    └──────────┬──────────┘
                 │                                        │
                 └───────────────┬────────────────────────┘
                                 ▼
                      ┌─────────────────────┐
                      │   P7 HARDENING      │  perf · a11y · SEO · security · l10n
                      └──────────┬──────────┘   ← {{DOMAIN}} + branded email due HERE
                                 ▼
                      ┌─────────────────────┐
                      │   P8 LAUNCH         │  ← GBP verified (B6) is a hard gate
                      └──────────┬──────────┘
                                 ▼
                      ┌─────────────────────┐
                      │   P9 POST-LAUNCH    │
                      └─────────────────────┘
```

Four edges are worth naming explicitly, because they are the ones that break schedules.

**B5 → P4** means the narrative pages cannot start without the Yavoriv photography. The reused
catalogue library does not substitute: those frames document a different workshop, and building
the production page on them would make the site claim someone else's factory. Placeholders do not
work either, because [09-color-palette.md](09-color-palette.md) §9.6 requires `focalPoint` and
`textSafeZone` per image and the layouts are art-directed against specific frames.

**B8–B13 → P3** means the entire commerce phase waits on six facts that take an afternoon to read
and a rebuild to guess. B8 (integration mode) is the sharpest: hosted redirect and embedded widget
produce materially different checkout step designs.

**B7 → P6** is new. The catalogue export is the input to the content estimate, and the content
estimate is the schedule. It is the cheapest Phase 0 item and it gates the longest phase.

**B6 → P8** means Google Business Profile verification, a process measured in weeks and entirely
outside our control, sits on the launch gate. §E4 adds that the existing profile's ownership must
be confirmed — an unverified or third-party-claimed profile cannot be edited at all.

---

## 35.5 Workstreams and how they overlap

```
week   0    2    4    6    8   10   12   14   16   18   20   22   24   26
       │    │    │    │    │    │    │    │    │    │    │    │    │    │
P0     ████████████
photo       ░░░░████░░░░░░░░                     ← ONE Yavoriv shoot (1–2 days) + edit
import              ░░░░░░░░████████████░░░░              ← export, remap, media transfer
content                  ░░░░████████████████████████████████████  ← REWRITE = critical path
design      ████████████████████░░░░████
frontend         ████████████████████████████████████░░░░
backend          ████████████████████████░░░░████
admin                      ████████████████░░░░
legal            ░░░░░░░░░░░░████████░░░░                 ← offer, returns, Impressum
SEO/GBP     ████░░░░░░░░░░░░░░░░████████████████████████████████████
QA                    ░░░░░░░░████████████████████████████████████
hardening                                            ████████████
launch                                                          ███
       ████ active   ░░░░ low-intensity / dependent on another stream
```

The photography bar is the visible dividend of §E5: two multi-week shoots collapse to one short
one. The content bar does not shorten correspondingly, and that asymmetry is the honest shape of
this revision — see §35.9.2.

| Workstream | Owns | Depends on | Overlap note |
|---|---|---|---|
| **Content & photography** | Yavoriv shot list and supervision, retouching to the §1.8 standard, **rewriting every imported description**, `uk` copy, translation coordination, alt text | B5, B7 | Starts before engineering and finishes after it. Treat as the schedule spine |
| **Content import** | Catalogue export, category remapping to D3, media transfer to Cloudinary with re-crop/re-grade/EXIF-strip/rename, duplicate-text triage | B7, Admin | **New in round 2.** Front-loads into weeks 8–14 so that rewriting has something to rewrite. Explicitly **not** an SEO stream — no 301s, no Search Console baseline |
| **Design** | Missing specs (§35.1), component designs, art direction, origin badges | B4, B5 | Front-loaded; drops to review-only from week 14 |
| **Frontend** | Storefront, design system implementation, motion, i18n routing | Design, Phase 1 | Longest continuous stream |
| **Backend** | Schema, API, order state machine, WayForPay, Nova Poshta, `{{INTL_CARRIER}}`, search | B8–B13, B7 | Front-loads the schema so admin and frontend can both build against it |
| **Admin** | Staff-facing CRUD, content import with the duplicate-text guard, media, translation completeness UI | Backend, [23-admin-panel-architecture.md](23-admin-panel-architecture.md) | **Must be usable by week 10**, or content population cannot start and the critical path slips one-for-one |
| **SEO & GBP** | `{{DOMAIN}}` setup, hreflang, sitemaps, structured data, GBP verification, long-tail content plan | B2, B6 | Starts in Phase 0 because GBP verification is slow. **There is still no migration work in this stream** — §E5 returns content, not rankings |
| **Legal** | Offer contract, returns policy, **German Impressum, 14-day withdrawal, model withdrawal form**, duty disclosure | B3, §E11 | New weight in round 2. Blocks the `de` launch, not the `uk` one |
| **QA** | Test suites, accessibility, locale QA, device matrix | Everything | Continuous from week 8; not a phase at the end |

The single most important overlap decision in this plan: **the admin panel is prioritised ahead
of the storefront's narrative pages**, even though the storefront is what the client will judge
the project by. A late admin panel means a late catalogue, and a late catalogue means launching
a beautiful site with forty products on it.

---

## 35.6 Environments

| Environment | Host | Database | Purpose |
|---|---|---|---|
| **Local** | Developer machine, Docker Compose | Postgres 16 container | Day-to-day work |
| **Preview** | Ephemeral, one per pull request, auto-destroyed on merge | Branched database, seeded | Design and client review of a single change |
| **Staging** | Permanent, `staging.{{DOMAIN}}` | Full-size copy of production structure | Rehearsal, load testing, QA, training |
| **Production** | `{{DOMAIN}}` | Managed Postgres with PITR | Live |

### 35.6.1 Seeding per environment

Seeds always create the structural rows from [25-database-schema.md](25-database-schema.md)
§25.11: the 8 system roles, the full permission catalogue, option types, attribute definitions,
the `uk` category tree from D3, and — per [00-client-decisions-8.md](00-client-decisions-8.md)
§L1, which replaced the two-Owner seed of §E1 — **one Owner account**, Іван, login
`gif19601@gmail.com`, `INVITED` so the password is set through the invitation flow and never
exists in a seed file or a deploy log
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.16).

The client chose one Owner at launch; the reasoning below is why the blueprint still recommends
Іван create a second Owner for Любов once the panel is live. A single-Owner system
has no recovery path if that account is lost — a forgotten password, a lost 2FA device, an
unreachable inbox — and the only remaining route is a database console. It also makes §24.6 I2
workable: with one Owner, no Owner can ever change their own roles through the product.

| Environment | Catalogue data | Orders | Media |
|---|---|---|---|
| Local | Synthetic, **2,000 SKUs** — double the top of the §E5 range, so the facet query plan is exercised above realistic load — across all D3 categories with realistic variant fan-out and own/partner split | Synthetic, covering every state in the order machine | Placeholder images with real `width`/`height`/`blurhash` so CLS behaviour is honest |
| Preview | Same generator, fixed seed so screenshots are comparable across PRs | Minimal | Same |
| Staging | **The real catalogue**, populated by the client's own team during Phase 6 | Anonymised: names, phones, emails and addresses replaced | Real Cloudinary assets |
| Production | Real | Real | Real |

Staging is where the client enters and rewrites real catalogue data, and that data is then
**promoted to production at cutover** rather than re-entered. Together with the §E5 content
import, these are the only two data movements in the project, and neither is an SEO migration: one
is a promotion between our own environments, the other is a one-way copy of product facts from a
site that stays live and keeps its own rankings.

**Rule:** production data never flows downward un-anonymised. A developer laptop holding real
customer addresses is a GDPR incident waiting for a stolen bag, and the `de` and `pl` locales
make that a regulatory question, not only an ethical one.

---

## 35.7 CI/CD pipeline and automated gates

Every gate below **fails the build**. A gate that only warns is a gate that is ignored by week
six.

```
push ──▶ install ──▶ typecheck ──▶ lint ──▶ unit ──▶ build ──▶ gates ──▶ preview deploy
                                                                  │
   ┌──────────────────────────────────────────────────────────────┘
   ├─ G1  {{TOKEN}} scan
   ├─ G2  colour-contrast assertion
   ├─ G3  axe accessibility run
   ├─ G4  Lighthouse budgets
   ├─ G5  bundle-size budgets
   ├─ G6  Prisma migration check
   └─ G7  design-system lint rules
```

| Gate | What it asserts | Pass criterion |
|---|---|---|
| **G1 — `{{TOKEN}}` scan** | No unresolved placeholder reaches a build. Required by [00-README.md](00-README.md) | `grep -rnE '\{\{[A-Z0-9_]+\}\}'` over the built output **and** over seeded content returns zero matches. Runs against rendered HTML, not source, so a token surviving through a template is caught |
| **G2 — colour contrast** | The twelve measured pairings in [09-color-palette.md](09-color-palette.md) §9.5 still hold, and the known trap is not re-introduced | Ratios recomputed from `tokens/index.ts` match §9.5 within ±0.1. Additionally: `gold-600` never appears as a text colour below 24 px / 19 px bold, and `stone-500` never appears as a body-text colour — these two are the specific regressions §9.3 predicts |
| **G3 — axe** | No serious or critical accessibility violation | `axe-core` on homepage, listing, PDP, cart, each checkout step, wholesale, production, blog article — **× 4 locales**. Zero serious/critical. Moderate violations are reported, not blocking |
| **G4 — Lighthouse** | The brief's numeric targets | Performance ≥98, Accessibility 100, SEO 100, Best Practices 100, mobile emulation, on homepage + PDP + listing. LCP ≤2.5 s on the CI throttle profile per [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.9 |
| **G5 — bundle size** | The motion and type budgets | Initial route JS ≤110 KB gzip *(set here; not inherited from a canonical doc)*; **animation JS on the critical path = 0 KB**; Framer Motion chunk ≤34 KB gzip and lazily requested; webfont payload on first paint ≤85 KB ([13-motion-system.md](13-motion-system.md) §13.5, [10-typography.md](10-typography.md) §10.7) |
| **G6 — migrations** | Schema and Prisma client cannot drift | `prisma migrate diff` against a shadow database is empty; migrations are forward-only and none already applied to production has been edited (§25.11) |
| **G7 — design-system lint** | The rules that make the system survive contact with a deadline | No `px` font sizes ([10-typography.md](10-typography.md) §10.8); no raw `<img>` outside the wrapper ([08-design-system.md](08-design-system.md) §8.7); no Layer-1 token referenced from a component (§8.1); no numeric `z-index` literal ([11-spacing-system.md](11-spacing-system.md) §11.6) |

Two further checks run nightly rather than per-push, because they are slow: a Playwright pass of
the four critical flows in all four locales, and the ambient-pause assertion from
[34-animation-storyboard.md](34-animation-storyboard.md) P6, which is the guard most easily
broken by an unrelated refactor.

**Deployment:** preview on every PR; merge to `main` deploys to staging automatically;
production deploys are manual, tagged, and reversible by redeploying the previous tag. Database
migrations are applied as a separate, explicitly triggered step — never coupled to the
application deploy, because rolling back code is cheap and rolling back a migration is not.

---

## 35.8 Testing strategy by layer

At this scale, the goal is not coverage. It is that the three things that cost real money if
broken — money arithmetic, order state, and checkout — cannot break silently.

| Layer | Worth testing | Not worth testing at this scale |
|---|---|---|
| **Unit** | Money maths in minor units; VAT and shipping calculation; the weight-based pricing for пряжа/ровниця/вовна (D4); order state machine transitions; slug generation and locale fallback; the contrast assertion in G2 | Pure presentational components; anything whose test would restate its implementation |
| **Integration** | WayForPay webhook handling against **recorded real fixtures** — never hand-written ones, because a fabricated fixture encodes the same guess the receiver does and the pair passes while production fails — including replay and out-of-order delivery; the duplicate-text guard's similarity scoring against known-duplicate and known-rewritten pairs; guest order lookup returning `204` on both hit and miss; Nova Poshta rate lookup with the API stubbed; stock reservation under concurrent checkout; Prisma middleware for `deletedAt` and denormalised price recomputation | Every CRUD endpoint. A typed API layer plus one smoke test per resource is sufficient |
| **E2E (Playwright)** | Guest checkout happy path × 4 locales; **one international checkout with COD rejected and duty disclosed**; checkout with a declined card; checkout with an out-of-stock variant appearing mid-flow; **guest order lookup and the emailed access link**; wholesale lead submission; add-to-cart from listing and from PDP; locale switch preserving cart | Admin CRUD beyond a login-and-create smoke test; every filter combination. **No customer login flow exists to test** (§E12) |
| **Accessibility** | G3 automated on every route × locale; **manual keyboard and screen-reader passes on the four critical flows once per phase** | Automated axe alone. It catches roughly a third of real issues and none of the ones [02-ux-research.md](02-ux-research.md) §2.6 describes |
| **Visual regression** | The design-system Storybook only — every component variant and state, per [08-design-system.md](08-design-system.md) §8.10 | Full-page screenshots. Content-driven pages produce constant false positives and the team stops reading the report |
| **Performance** | G4 in CI; the P1–P9 procedures in [34-animation-storyboard.md](34-animation-storyboard.md) §34.15 once per phase on real hardware | Per-commit manual profiling |
| **Load** | The faceted-filter query plan against **2,000 SKUs** — double the top of the §E5 range — required by [00-existing-site-audit.md](00-existing-site-audit.md) §0.6's warning that facets must be designed and load-tested, not assumed | General throughput testing. Expected order volume does not justify it |

Manual test passes are scheduled, not hoped for: one full device-matrix pass at the end of
Phase 4, one at the end of Phase 6, one in Phase 7. Device matrix is 320 px, 768 px, 1440 px,
1920 px, plus one genuinely mid-range Android, because that is where the motion budget fails
first.

---

## 35.9 Content population — the real critical path

Be honest about this: **content population is still the largest single cost in the project and
the most likely cause of a missed launch date.** The §E5 catalogue import changes its composition,
not its status. Engineering is bounded and estimable; writing a thousand product descriptions is
neither.

### 35.9.0 What the import gives, and what it does not

[00-client-decisions-2.md](00-client-decisions-2.md) §E5 permits copying products and photographs
from the adjacent business's site. It attaches a constraint that is not optional and is not small.

| Asset | Rule | Cost implication |
|---|---|---|
| **Product descriptions** | **Rewrite every one. No sentence copied verbatim.** | The single largest content line in this plan. Not a cleanup pass — an authoring pass with a reference in front of you |
| **Product names** | Rename where they overlap | Cheap, and it produces better brand assets: «Ліжник Яворівський» beats a shared generic name |
| **Category and filter text** | New, per the D3 structure | The D3 tree differs from the source site's anyway, so most of this was always new |
| **Blog and care-guide articles** | **Do not copy.** Write fresh, per [22-blog-specification.md](22-blog-specification.md) §22.3 | Unchanged from the round-1 plan — this was never going to be inherited |
| **Photographs** | Reuse permitted, after re-crop and re-grade to [01-brand-strategy.md](01-brand-strategy.md) §1.6, EXIF strip, semantic filename, and **new `alt` text** | The genuine saving. Identical images across two domains are a weaker signal than unique ones but are not penalised the way duplicate text is |
| **Reviews** | **Do not copy.** They were given to a different seller | Transplanted reviews are a structured-data violation and a trust failure. The import format has no review columns ([23](23-admin-panel-architecture.md) §23.6.9) |

**Why the rewriting rule exists, in one sentence:** `fabryka-shkur.com.ua` stays online, so
copying its text produces two live sites with identical content competing for the same queries,
and the new domain — with zero authority — loses that competition every time. This is not a
theoretical penalty; it is a ranking outcome, and it would be self-inflicted.

The duplicate-text guard in the admin ([23](23-admin-panel-architecture.md) §23.6.9) enforces the
rule mechanically. It does not do the work. It only makes skipping the work impossible to do
quietly.

### 35.9.1 What has to exist per product

| Asset | Per product | Per locale? | Import covers it? |
|---|---|---|---|
| Photography — primary, gallery, detail, scale reference, lifestyle | 4–8 frames | No | **Yes**, after re-crop, re-grade, EXIF strip, rename |
| Name | 1 | **Yes** ×4 | Partly — renamed where it overlaps |
| Description | 1 | **Yes** ×4 | **No. Must be rewritten.** |
| Specification attributes (composition, weight, density, dimensions, care) | 6–12 values | Values no, labels yes | **Yes** — these are facts, and facts are not copyrightable prose |
| Alt text | per image | **Yes** ×4 — `MediaTranslation.alt` is a required field ([25-database-schema.md](25-database-schema.md) §25.4) | **No.** New alt is explicitly required by §E5 |
| Variants (colour, size) | 2–20 rows | Option labels yes | **Yes.** No dye-lot column — §E8 resolves lots as not tracked |
| Origin, and `partnerRegion` where applicable | 1 | Region label yes | Partly — `origin` must be reviewed per product, not inherited |
| SEO title and description | optional override | Yes, where overridden | **No** |
| **`allowsCustomSize`** — can this item be made to measure? | 1 boolean | No | **No. A judgement per product.** See §35.9.1a |

### 35.9.1a The per-product custom-sizing decision — an unbudgeted content task

[00-client-decisions-5.md](00-client-decisions-5.md) H3b rules that custom sizing is **not** a
category rule: «НІ, тільки окремі, можна буде позначити в панелі.» Only some products can be made
to measure, and the client marks them individually in the admin. That is the correct model — and it
creates a row-by-row decision across the entire catalogue that no previous version of this plan
accounts for.

| Property | Consequence for the schedule |
|---|---|
| It defaults to **off** | Safe. A catalogue that ships with every toggle off sells only standard sizes, which is a smaller business rather than a broken one. **This is the fallback if the task is not completed** |
| It cannot be inferred from the import | The adjacent business's export has no equivalent field. There is nothing to migrate |
| It cannot be set by a content writer | The question is *can the loom do this*, which only the client can answer. It is a client task with a content-team facilitator, not the reverse |
| It is not expensive per row | Seconds per product, for someone who knows the floor. **The cost is the sitting-down, not the deciding** |
| It carries a consequence the client will not connect unaided | Enabling it silently removes cash on delivery for that configuration (H1.1). The admin toggle states this inline — «Індивідуальний розмір — лише повна передоплата, 14 днів виготовлення» — because staff will not derive it ([23-admin-panel-architecture.md](23-admin-panel-architecture.md)) |

**Estimate.** At 400 SKUs, roughly 3–5 hours of the client's own time; at 1,000, 8–12. Small in
hours and awkward in scheduling, because it is the client's time rather than the team's and it
cannot be done by anyone else. The practical approach is **by category, not by product**: a working
session per family in which the client says «ці — так, ці — ні», with the content person operating
the admin. Attempting it as a thousand individual decisions in a spreadsheet is how it does not get
done.

**Sequencing.** It is not a launch blocker, because the default is off and a catalogue with no
custom sizing is a working catalogue. It **is** a blocker for the custom-size feature having any
value at all: shipping the buy-box mode switch (§35.3.4) against a catalogue where every toggle is
off builds a feature nobody can reach. Schedule the working sessions in the same weeks as W1
content population, and treat the feature and the toggles as one deliverable rather than two.

### 35.9.2 The arithmetic, recomputed against the real catalogue size

`{{SKU_COUNT}}` now resolves to **several hundred to roughly a thousand** (§E5). The table below
is computed at both ends of that range and at 5 images per product, so the schedule is read
against a band rather than a guess. B7 replaces the band with a figure.

| Task | Unit rate | At 400 SKUs | At 1,000 SKUs |
|---|---|---|---|
| Photography, **Yavoriv shoot only** | 1–2 days, fixed | **~12 h** | **~12 h** — does not scale with SKUs |
| Photography, product shooting | — | **0** (import covers it) | **0** |
| Photo processing — re-crop, re-grade, EXIF strip, semantic rename | ~2 min/frame | ~67 h | ~167 h |
| **`uk` description rewriting** | **~11 min/product** | **~73 h** | **~183 h** |
| `uk` naming and attribute review | ~5 min/product | ~33 h | ~83 h |
| Category and filter text, D3 tree | fixed | ~20 h | ~20 h |
| Variant review against the import | ~3 min/product | ~20 h | ~50 h |
| `en`/`pl`/`de` translation, MT + human post-edit | ~7 min/product/locale | ~140 h | ~350 h |
| **Alt text, if hand-written** | ~1 min/string | **8,000 strings → ~133 h** | **20,000 strings → ~333 h** |
| Blog and care-guide articles, written fresh | ~4 h/article × 8–10 | ~36 h | ~36 h |

#### The honest comparison

Round 1 assumed authoring from nothing. Round 2 assumes rewriting from a reference. The difference
is real and it is worth having:

| | Authoring from nothing | Rewriting from the import |
|---|---|---|
| Product shooting | ~33 shoot-days across two productions | **0** |
| Description work | ~14 min/product, from a blank page | **~11 min/product**, with the facts already in front of you |
| Attribute entry | ~14 min/product bundled above | Largely **imported** |
| Variant structure | ~6 min/product | ~3 min/product review |

**State it plainly: this is cheaper than authoring from nothing, and it is far from free.**
Rewriting saves roughly 20–25% of the per-product writing time and effectively all of the product
photography. It saves nothing on translation, nothing on alt text, and nothing on the blog. At
1,000 SKUs the `uk` rewriting line alone is **~183 hours** — four and a half full-time weeks of one
person doing nothing else — and it cannot be parallelised indefinitely, because voice consistency
([01-brand-strategy.md](01-brand-strategy.md) §1.5) degrades fast across more than two or three
writers.

The failure mode to name in advance: a team that reads "we can copy the catalogue" as "the content
is done", discovers in week 16 that nothing is publishable without rewriting, and then rewrites in
a hurry. Paraphrase-by-reordering is what hurried rewriting produces, the duplicate-text guard
catches it at 0.35 similarity, and the work gets done twice. Scope it as an authoring workload
from the start.

**The alt-text line is the one that breaks people.** 5 images × 4 locales × 400 products is
8,000 strings, and at 1,000 SKUs it is 20,000. Hand-authoring is not viable. The plan:

1. **Template-compose alt text per locale** from structured fields already entered —
   `{product name} — {material} — {view}` — generated on save in the admin, per locale, so the
   required `MediaTranslation.alt` is never empty.
2. **Hand-author only** `MediaRole.PRIMARY` frames and every `PRODUCTION` photograph. Those are
   the images that carry meaning a template cannot: a named person, a named machine, a place.
3. Templated alt is marked as such in the admin so it can be upgraded incrementally without
   anyone having to remember which strings were generated.

This is a deliberate accessibility trade-off and it should be named as one. A templated alt
string is meaningfully better than an empty one and meaningfully worse than a written one; the
alternative — 133 to 333 hours of work that would not happen — produces empty strings, which is
worse than both.

One clarification the import makes necessary: §E5 requires **new** alt text for reused
photographs, and templated alt satisfies that requirement, because a template composed from this
site's own product fields produces a different string from whatever the source site carried. The
duplicate-text guard checks alt for duplication like any other text ([23](23-admin-panel-architecture.md)
§23.6.9), so an imported alt string surviving unchanged is caught rather than assumed away.

### 35.9.3 Sequencing, and a partial-translation launch

Launching four complete locales is not achievable inside the schedule. Launching `uk` complete
and the rest progressively is, and it is also the correct commercial order given that D2 puts
organic traffic near zero for 3–6 months anyway.

| Wave | Scope | Timing |
|---|---|---|
| **W1** | `uk`: all static pages, legal, all category and subcategory pages, the 12 wool families, sheepskin, leather, partner range. Complete. | Weeks 4–16 |
| **W2** | `en`: all static, legal, all category pages; the top 120 products by expected demand | Weeks 12–18 |
| **W3** | `pl` and `de`: all static, **legal including the Impressum and the withdrawal form**, all category pages; the top 60 products each. **Wool-only** per the §E11 recommendation | Weeks 16–20 |
| **W4** | Post-launch: remaining products per locale, prioritised by `SearchQueryLog` zero-result data ([25-database-schema.md](25-database-schema.md) §25.9) | Launch + 30 onward |

**The rule that makes a partial launch safe.** [25-database-schema.md](25-database-schema.md)
§25.2 falls back to the `uk` row when a translation is missing, which is right for *usability*
and wrong for *SEO*: a `/de/` URL serving Ukrainian text is thin, duplicated, and invites a
quality signal nobody wants on a new domain. So:

> An untranslated product remains reachable and purchasable in every locale, with the `uk`
> fallback and the `x-translation-fallback` header — but it is **excluded from that locale's
> sitemap, `noindex`ed in that locale, and omitted from that locale's hreflang cluster** until
> its translation row exists. Indexing is switched on per product, automatically, when the
> translation lands.

The admin surfaces translation completeness per entity (§25.2), so this state is visible rather
than inferred.

---

## 35.10 Cold-start launch expectations

D2 makes this a new domain with zero authority, zero backlinks and zero history. **Round 2 makes
the cold start harder than round 1 assumed**, and the plan must say so plainly, because a client
who expects launch-day traffic will judge a successful project a failure in month two.

§E3 removes a channel the round-1 plan leaned on: **the owners run no social media at all.**
[00-client-decisions.md](00-client-decisions.md) §D2 named Instagram a primary launch channel.
That channel does not exist.

**Round 3 gives one back, and it is a better one.**
[00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms that the Яворів premises are a
**shop** as well as a factory. A visitor can walk in, see the production floor and buy on the spot,
in a village that craft tourists already travel to for exactly this craft. That is demand created
with no search involved, which is the one thing a cold-start domain cannot manufacture for itself.

| Channel | Month 1–3 | Month 4–6 | Why |
|---|---|---|---|
| Organic search, commercial head terms | ≈0 | Still minimal | A new domain does not rank for «ліжник купити» inside a year |
| Organic search, long-tail informational | Low but non-zero | Growing | «що таке ліжник», «гуня vs накидка», wool-vs-synthetic, care guides — the realistic early entry point |
| **Google Business Profile / Maps** | **Primary channel** | Primary channel | A real address in a tourist region, and — new in round 3 — a **retail** location, which makes the profile eligible for «де купити ліжник» transactional-local queries a manufacturer-only profile is not in the candidate set for. Outranks the domain's organic prospects for two quarters |
| **Яворів shop footfall** | **Second channel, and independent of search** | Seasonal but sustaining | F2. The village hosts a lizhnyk museum and annual weaving plein airs; the audience arrives pre-qualified and the shop converts them on the spot or seeds an online order weeks later. Measurable only by proxy ([31-analytics-architecture.md](31-analytics-architecture.md) §31.13) and commercially real regardless |
| Existing offline and word-of-mouth customers | **Launch traffic** | Sustaining | The client's actual existing audience |
| **Instagram** | **Does not exist** | Depends on a decision | §E3. Recorded as a recommendation, not a decision — see below |
| Direct and referral | Low | Low, rising | Craft and tourism listings. A visitable shop materially improves the odds here: tourism portals list places a reader can go, not manufacturers a reader can read about |

That is a thin set, and thinner than the round-1 plan assumed — but less thin than round 2 left it.
Consequences:

1. **GBP carries more weight than before, and can now win more.** It is a Phase 0 item (B6) and a
   launch gate (§35.11 S5), and §E4's byte-for-byte NAP consistency check stops being pedantry —
   with one primary channel, a formatting mismatch that makes Google treat the profile as a
   different business is the whole quarter. F2 adds a second way to get it wrong: a category set
   that covers only one of the two functions forecloses a query class for free.
1b. **The shop is a launch asset that requires no engineering.** Printed cards with the URL at the
   counter, the address on every page, the contact page promoted to a destination page
   ([29-seo-architecture.md](29-seo-architecture.md) §29.16), and every visitor asked in person for
   a Google review — that last one being the fastest route to the corroboration
   [30-ai-search-optimization.md](30-ai-search-optimization.md) §30.11 identifies as the binding
   constraint on AI citability. None of it is on the critical path and all of it should be ready on
   day one.
2. **The blog is the primary organic instrument**, not a nice-to-have. `22-blog-specification.md`
   and an initial 8–10 long-tail articles are launch scope, written fresh (§E5).
3. ~~**Recommendation on record: create an Instagram account before launch**~~ **Withdrawn — the
   client decided there will be no Instagram** ([00-client-decisions-8.md](00-client-decisions-8.md) §L9). The original reasoning follows, kept for
   the day the owners reconsider. Even if updated
   rarely. For a craft manufacturer it is where the product photography does its work, it is the
   cheapest proof-of-life signal a new domain can have, and the capability demonstrably exists in
   the family — the adjacent business runs `@fabryka_shkur` successfully. `{{INSTAGRAM}}` remains
   unresolved and this remains a recommendation, not a decision.
4. **Яворів is a link-building asset the round-1 plan did not have.** §E2 establishes the village
   as the recognised centre of Hutsul lizhnyk weaving — a museum, annual plein airs attended by
   art historians, and the home village of the Шкрібляк and Корпанюк woodcarving dynasties.
   Cultural institutions, tourism sites and craft associations are exactly the kind of locally
   relevant referrers a cold-start domain cannot otherwise earn. Outreach to them belongs in the
   Phase 9 backlog rather than being discovered later.
5. **Success metrics for the first quarter are GBP actions and direct conversion**, not organic
   sessions and not Instagram-attributed sessions unless point 3 is acted on.
6. **The reporting must state what it cannot see.** With a shop in the mix, online numbers are a
   floor on commercial performance rather than a measure of it, and a report that omits the caveat
   invites the client to conclude the project is failing in month four while trade through the door
   is fine. [31-analytics-architecture.md](31-analytics-architecture.md) §31.13 specifies the fixed
   paragraph and the reason it is not optional.

---

## 35.10a Made-to-order as an operational commitment — the capacity nobody has sized

[00-client-decisions-4.md](00-client-decisions-4.md) G2 sets made-to-order at **14 days of
production before dispatch**. [00-client-decisions-5.md](00-client-decisions-5.md) H1.1 requires it
to be **prepaid in full**. Both are correct decisions and neither is a build item. Together they
create a workflow this plan must size, because the software will function perfectly while the
business falls behind.

**The arithmetic that has not been done.** A custom lizhnyk is a fortnight of loom time in a
factory run by two named people who also answer the phone, pack parcels, quote international
shipping (H3) and conduct workshop tours (G3). The site does not know how many custom orders can
be in production at once. Nobody has asked. That number — call it the **concurrent custom-order
ceiling** — is the difference between a 14-day promise and a queue:

| If the ceiling is | Then the 14 days is | And the failure mode is |
|---|---|---|
| Comfortably above realistic demand | A true lead time | None. This is the expected case at launch volumes |
| Near realistic demand | A lead time that is true until it is not | **The dangerous case.** Order five arrives, joins a queue, and is quoted 14 days because the site has no concept of a queue. The customer has paid in full (H1.1) for a date that was never achievable |
| Below demand | A marketing figure | A refund request on day 15, on an item made to a size nobody else will buy |

**The mitigation is a setting, not a feature, and it must exist before launch.** A simple cap — a
`Setting` holding the maximum number of open `IN_PRODUCTION` orders, above which the «Свій розмір»
option is unavailable with an honest message — costs half a day and converts the worst outcome
(a paid order that cannot be delivered on time) into the second-best one (a customer who is told
today that custom orders are closed this month). The alternative is discovering the ceiling from a
complaint.

**Three further operational items that come with the same rulings:**

| Item | Detail | Owner |
|---|---|---|
| **The mixed-cart split is a packing-bench workflow** | H1.1 recommends splitting a cart containing both a stocked and a made-to-order item into two orders. H3b makes that cart the *expected* shape rather than an edge case. The stocked half ships now, the custom half in a fortnight — so one customer produces two parcels, two tracking numbers and two conversations, and the packing bench has to know that is intentional. The confirmation email must say so before the customer discovers it |
| **The confirmation email restates a date, not a duration** | G2 is explicit: «Очікувана відправка: 12 жовтня» is checkable, «протягом 14 днів» is a memory test the customer will fail around day eleven — producing a support contact that the correct email would have prevented. The date is computed at order time and stored, not recomputed on render |
| **`IN_PRODUCTION` is for the customer, not for the admin** | A customer who paid in full and sees `CONFIRMED` for twelve days concludes the order is stuck. A status naming the weaving converts anxiety into anticipation, which is the emotionally correct state for a handmade purchase (G2). It is worth the half day on those grounds alone |

**Why this section exists in a roadmap rather than a specification.** Every other consequence of
G2 and H1.1 is a field, a status or a copy block, and all of them are small. The capacity question
is the only one that cannot be closed by writing code, and it is the only one that can produce a
refund on an unsellable item. Recorded as **R19** in the risk register.

---

## 35.11 Launch checklist

Each gate has a single pass criterion, verified and signed by a named person. No gate is
"probably fine".

### Functional — F

| # | Gate | Pass criterion |
|---|---|---|
| F1 | Guest checkout | Completes end to end in `uk`, `en`, `pl`, `de` on desktop and mobile, with a real card in WayForPay live mode, refunded afterwards |
| F2 | Payment failure paths | Declined card, timeout, and duplicate webhook each leave exactly one order in a correct state |
| F3 | Shipping | Nova Poshta branch, courier and Ukrposhta rates return correctly for three test addresses; pickup shows as free |
| F4 | COD | Cash-on-delivery orders reach the correct state and are visible in admin. **A COD attempt on a non-UA address is rejected server-side**, not merely hidden in the UI (§E11). **A COD attempt on a cart containing any made-to-order line is likewise rejected server-side** — the method is absent from the response, not hidden ([00-client-decisions-5.md](00-client-decisions-5.md) H1.1) |
| F5 | Stock | Concurrent purchase of the last unit results in one success and one clear failure, never two successes |
| F6 | Weight-priced goods | Yarn, rovnytsia and raw wool price correctly by weight in cart, checkout and shipping estimate |
| F7 | Wholesale lead | Submits, stores a `Lead`, and sends notification to the correct address |
| F8 | Admin | Client staff create, edit, publish, unpublish and restore a product unaided during the training session |
| F9 | Transactional email | Order confirmation, shipping notification and wholesale acknowledgement render correctly in all four locales in Gmail, Outlook and Apple Mail |
| F10 | Origin integrity | No partner product appears on the homepage, in the hero, in the best-seller rail, or in production storytelling — verified by query, not by eye. **`partnerName` appears in no public response body** — verified by grepping the rendered payload, not by inspecting the UI (§E7) |
| F11 | **Guest order access** | The confirmation email's `guestToken` link opens the order. `POST /v1/orders/lookup` returns `204` for both a real and a fabricated order number, and mails the access link only in the real case. With no accounts, this is the **only** route a customer has to their own order (§E12) |
| F12 | **International order, enquiry-then-invoice** | One test enquiry to a `de` address completes the full F4 path: order enters `AWAITING_QUOTE`, the admin quote panel produces a figure, the quote email arrives **in the inbox** with the itemised total and the duty disclosure, the payment link works, the order reaches `PAID` and rejoins the dispatch flow. COD unavailable throughout; currency behaviour matching the V11 answer. **The quote expiry path is tested too** — a quote left unpaid must reach `QUOTE_EXPIRED` and release the reservation ([00-client-decisions-3.md](00-client-decisions-3.md) F4, [23](23-admin-panel-architecture.md) §23.8.3a) |
| F13 | **Hide-category gating** | A cart containing a sheepskin or leather line is rejected for EU destinations with a clear message, until the §E11 species-declaration paperwork is confirmed |
| F14 | **Transactional email authentication** | A real order confirmation is delivered **to the inbox** at Gmail, Microsoft 365 and a Ukrainian provider, with `SPF=pass`, `DKIM=pass` and `DMARC=pass` read from the raw headers — not inferred from the message appearing. Sent from `no-reply@{{DOMAIN}}`; **no `@gmail.com` sender anywhere**, verified by CI grep. `Reply-To:` reaches a mailbox a human opens ([32](32-security-architecture.md) §32.16, B15) |
| F15 | **Origin serialisation** | Every published `PARTNER_MANUFACTURE` product emits a `brand` of Вівчарик and **no `manufacturer` key at all**; every `OWN_MANUFACTURE` product emits both — verified by crawling the rendered JSON-LD, not by reading the serialiser ([00-client-decisions-3.md](00-client-decisions-3.md) F3) |
| F16 | **The return-shipping deposit, end to end** | Three test orders on the `uk` locale. **(a) Accept:** deposit charged at checkout, `depositAppliedMinor` credited **exactly once** on transition to `DELIVERED`, COD amount at the branch equal to `subtotal − discount − deposit`. **(b) Refuse:** no further charge, return leg funded, `refund` emitted with `refund_reason: cod_refused`. **(c) The invariant:** an order forced through `SHIPPED → DELIVERED → SHIPPED → DELIVERED` credits the deposit once, not twice. This is an automated test in the order state machine, not a manual check ([00-client-decisions-5.md](00-client-decisions-5.md) H1.3) |
| F17 | **The deposit is unreachable outside Ukraine** | A `de`, `pl` or `en` checkout offers no COD, charges no deposit, and renders **no deposit copy in any translated string** — verified by grepping the rendered payload per locale, not by clicking through. The mechanic is forbidden in those locales under the EU right of withdrawal (H1.3), so this is a legal gate, not a UX one |
| F18 | **Made-to-order path** | Selecting «Свій розмір» on a product with `allowsCustomSize` shows the 14-day lead time, the full-prepayment requirement and the COD withdrawal **in the buy box at the moment of selection**, not at checkout (G2, H1.1). The confirmation email restates a **date**, not a duration. The order reaches `IN_PRODUCTION` and is distinguishable from `PACKING` in both admin and the customer-facing status |
| F19 | **Mixed cart** | A cart with one stocked and one made-to-order line produces the split explanation **before** payment, not in the confirmation email, and the resulting orders dispatch independently (H1.1, H3b) |

### Performance — P

| # | Gate | Pass criterion |
|---|---|---|
| P1 | Lighthouse | Performance ≥98, Accessibility 100, SEO 100, Best Practices 100 on homepage, listing and PDP, mobile profile, **against real content and real image weights** |
| P2 | Field-realistic LCP | ≤2.5 s on the CI throttle profile; ≤1.8 s on 4G ([06-homepage-wireframe.md](06-homepage-wireframe.md) §6.9) |
| P3 | CLS | 0.00 on every launch route |
| P4 | Motion budgets | P1–P9 in [34-animation-storyboard.md](34-animation-storyboard.md) §34.15 all pass on a mid-range Android |
| P5 | Facet queries | p95 under 200 ms at 2,000 SKUs with the worst-case filter combination |

### Accessibility — A

| # | Gate | Pass criterion |
|---|---|---|
| A1 | Automated | axe: zero serious or critical on every launch route × 4 locales |
| A2 | Keyboard | All four critical flows completable with keyboard only; focus order matches visual order; no trap outside a modal |
| A3 | Screen reader | One NVDA and one VoiceOver pass of the four critical flows, defects triaged and blockers fixed |
| A4 | Zoom | 200% text zoom with no content loss; 400% at 320 px width ([10-typography.md](10-typography.md) §10.8) |
| A5 | Reduced motion | The full [34-animation-storyboard.md](34-animation-storyboard.md) §34.14 storyboard verified, including that no canvas element is created |
| A6 | Targets | Every primary action ≥48 px, floor 44 px, ≥8 px separation ([11-spacing-system.md](11-spacing-system.md) §11.7) |

### SEO — S

| # | Gate | Pass criterion |
|---|---|---|
| S1 | Indexability | `robots.txt` correct; staging `noindex` removed from production; no accidental `noindex` on a launch route |
| S2 | hreflang | Reciprocal, self-referencing, `x-default` present; **untranslated products excluded per §35.9.3** |
| S3 | Sitemaps | Segmented, submitted, each URL returning 200 and canonical to itself |
| S4 | Structured data | `Organization`, `Product`, `BreadcrumbList`, `FAQPage` validate. **`Organization.foundingDate` is not 1992** (D1). `brand` is Вівчарик on both origins and `manufacturer` is present **only** on own manufacture (F3, F15). The `LocalBusiness` node is typed `["Store", "LocalBusiness"]` with the retail properties, and carries **no `openingHours`** (§E3) |
| S5 | **Google Business Profile** | Created, **verified**, address correct, linked to `{{DOMAIN}}`, photos uploaded **including the shop interior**. **The primary category covers both retail and manufacturing, and the in-store shopping and in-store pickup attributes are set** ([00-client-decisions-3.md](00-client-decisions-3.md) F2, [29-seo-architecture.md](29-seo-architecture.md) §29.16). Hours are maintained on the profile or left unset — never mirrored into JSON-LD |
| S6 | Search Console + Bing | Properties created for `{{DOMAIN}}`, sitemaps submitted. *(No baseline capture — there is no predecessor site)* |
| S7 | Canonical and URL hygiene | One canonical host, HTTPS enforced, no trailing-slash duplicates, no `?` parameter duplication in the index |

### Security — X

| # | Gate | Pass criterion |
|---|---|---|
| X1 | Transport | TLS A rating, HSTS, secure cookie flags |
| X2 | Headers | CSP without `unsafe-inline` on scripts, `X-Content-Type-Options`, `Referrer-Policy`, frame ancestors locked |
| X3 | Auth | The seeded Owner account has set their own passwords through the invitation flow, not from a seed value (§35.6.1); **2FA enrolled on every staff account**, recovery codes printed and stored by the Owner, the break-glass procedure written down ([24](24-employee-permission-architecture.md) §24.11, [00-client-decisions-8.md](00-client-decisions-8.md) §L14). Verified that **no customer authentication endpoint exists** — the thirteen removed routes in [26](26-api-architecture.md) §26.10.6 return 404, not 401 |
| X4 | Rate limiting | Login, wholesale form, newsletter and search endpoints rate-limited; verified by test |
| X5 | Secrets | No secret in the repository or in client bundles; verified by scan |
| X6 | Dependencies | Zero known high or critical CVEs at launch |
| X7 | Backups | PITR enabled, **and a restore actually performed into staging**, not merely configured |

### Legal — L

| # | Gate | Pass criterion |
|---|---|---|
| L1 | Policies | Terms, privacy, returns (`{{RETURN_DAYS}}`), shipping and cookie policy published in all four locales. The договір оферти names **ФОП Гондурак Любов Юріївна** with `{{LEGAL_ID}}` (§E1) |
| L2 | GDPR | Cookie consent blocks non-essential scripts before consent; newsletter uses double opt-in ([25-database-schema.md](25-database-schema.md) §25.9). **Erasure requests are handled by staff via `customers.anonymize`** — with no accounts there is no self-service path, so the process must be documented and the inbox that receives such requests must be monitored |
| L3 | Distance selling | Trader identity and contact details published in every locale |
| L4 | Prices and VAT | `{{VAT_STATUS}}` reflected correctly in displayed prices and invoices |
| L5 | Image rights | Written commercial licence on file for every photograph and every piece of video, **including written permission to reuse the adjacent business's catalogue photographs** (§E5). Verbal family permission is not a licence |
| L6 | **The 30-year claim** | Every instance is phrased as manufacturing continuity — «Понад 30 років виробляємо…» — never as company founding or registration; **no certificate imagery, no accreditation mark, no «офіційно засвідчено», no anniversary badge** (D1). Checked across all four locales by a reviewer who has read D1 |
| L7 | Partner disclosure | Every `PARTNER_MANUFACTURE` product carries its origin mark, in every locale. Since partners **cannot be named** (§E7), the mark and `partnerRegion` are the entire disclosure and must be at equal visual weight to «Власне виробництво» |
| L8 | **German Impressum** | Published at `/de/impressum`, naming **ФОП Гондурак Любов Юріївна**, the Яворів address, both phone numbers, the branded email, and `{{LEGAL_ID}}`. Linked from the `de` footer on every page. **The `de` locale cannot go live without it** (§E11) |
| L9 | **14-day right of withdrawal** | Stated in `de` and `pl` before payment, not only in the terms page. The withdrawal period, how it is counted, who pays return shipping, and the exclusions — all in the locale's own language, not machine-translated Ukrainian |
| L10 | **Model withdrawal form** | Published as a downloadable form and reproduced inline in `de` and `pl`, in the statutory wording. This is a specific document, not a paraphrase, and its absence is the most commonly enforced distance-selling defect |
| L11 | **Duty and customs disclosure — pre-payment gate** | **Hardened by [00-client-decisions-3.md](00-client-decisions-3.md) F4, which resolves the question rather than leaving it a default: the buyer pays everything, effectively DAP.** Every shippable non-UA destination must show, **rendered and visible adjacent to the price before the pay button** — not in an accordion, not in a linked policy page, not only in the confirmation email — who pays import duty and VAT. Localised per locale, not machine-translated. The exact text shown is recorded in the order snapshot ([26](26-api-architecture.md) §26.10.4) and the display is logged as a compliance artefact ([31](31-analytics-architecture.md) §31.4). **In `de` and `pl` this is a statutory pre-contractual information duty under the Consumer Rights Directive, not a courtesy** ([32](32-security-architecture.md) §32.15): an undisclosed charge is not owed by the consumer, and the omission is independently actionable. Commercially it is also the single most common way a small cross-border shop loses money — a refused parcel returns from another country at the shop's cost |
| L13 | **International shipping is disclosed as quoted, not calculated** | The international enquiry step states plainly that shipping is quoted separately, that the customer will see the total before paying, and that no payment is taken at the enquiry step. **Free shipping is verified as never applying to a non-UA destination**, at any order value (F4) |
| L12 | **Heritage wording** | Any reference to Hutsul lizhnyk weaving's intangible-heritage status matches the wording confirmed in B14, and **no copy anywhere implies that Вівчарик itself holds a heritage designation** (§E2). The craft may be listed; a company is not. Checked in all four locales |

### Analytics — N

| # | Gate | Pass criterion |
|---|---|---|
| N1 | GA4 + first-party events | Firing on every ecommerce event, verified in DebugView |
| N2 | Conversion tracking | Purchase event matches an order record one-for-one across a 20-order test |
| N3 | Search logging | `SearchQueryLog` recording queries, result counts and zero-result queries |
| N4 | Error monitoring | Server and client error reporting live, with alerting to a real inbox |
| N5 | Uptime | External monitor on the homepage and the checkout endpoint, alerting on 2 consecutive failures |
| N6 | **Offline caveat in reporting** | The monthly and quarterly report templates carry the fixed paragraph from [31-analytics-architecture.md](31-analytics-architecture.md) §31.13 stating that shop demand is outside the measurement. Present in the template, not added by hand |

### Operational — O

New in round 3. These gates are not about the software; they are about whether the business can run
what the software enables. A launch that passes every technical gate and fails these produces
unanswered enquiries and a worse brand impression than not offering the service at all.

| # | Gate | Pass criterion |
|---|---|---|
| O1 | **Named owner for international quotes** | **Met by [00-client-decisions-5.md](00-client-decisions-5.md) H3: Гондурак Любов Юріївна.** What remains is confirmation of the **48-working-hour** response expectation (H2, B17) in writing, and `Lead.assignedToId` defaulting to her account. If the SLA cannot be committed to, international sales launch disabled and the checkout says so, which is an honest position and a recoverable one |
| O2 | **The quote workflow rehearsed end to end by the client**, not by the developer | The named person produces and sends a real quote for a real test order in the training session, unaided, and states the weight and carrier themselves. A workflow demonstrated *to* a client is not a workflow a client can run |
| O3 | **A monitored inbox** | `Reply-To:` on transactional mail, the quote replies, wholesale leads and GDPR erasure requests (L2) all reach a mailbox that a named person opens daily. With no customer accounts (§E12), email is the entire customer-service channel |
| O4 | **Shop-side launch materials ready** | Printed cards carrying the URL and the QR code at the counter, staff briefed to ask visitors for a Google review, and the shop interior photographed for the profile (F2). Zero engineering, and the second-largest launch channel depends on it |
| O5 | **The parcel card carries the short URL and the QR code, both printed** | [00-client-decisions-4.md](00-client-decisions-4.md) G4 confirms a card already ships in every parcel, so this is an artwork revision to an existing print run rather than a new channel. Pass criterion: the artwork is approved, the short link resolves in production, and **both** the typed URL and the QR are on the card — the 25–75 audience splits on scanning versus typing, and printing one form silently excludes half of it. This is the only route to the counter-sale customer, and reviews are the scarcest asset at launch |
| O6 | **The concurrent custom-order ceiling is stated, and a cap is configured** | §35.10a. A number from the client — how many 14-day custom orders the floor can hold at once — and a `Setting` enforcing it, above which «Свій розмір» becomes unavailable with an honest message. Pass criterion: the figure is written down and the cap is active. Without it, order five is quoted 14 days and paid for in full against a date that was never achievable (G2, H1.1) |
| O7 | **The mixed-cart split is rehearsed at the packing bench, not just in the checkout** | H1.1 and H3b make a cart of one stocked and one custom item the expected shape. One customer, two orders, two parcels, two tracking numbers, a fortnight apart. Pass criterion: whoever packs has walked through a split order end to end and can say what the customer receives and when |
| O8 | **The tour offer is approved, understood, and bounded** | B18. Pass criterion: the copy is approved verbatim; **Іван has agreed to the commitment in the terms the site states it**; and everyone who might edit a page understands the four prohibitions — no fixed times, no «відкрито для відвідувачів», no drop-in, no booking form. G3 is explicit that over-promising access converts the project's strongest asset into a one-star review, and the downside is larger than the upside |

---

## 35.12 Risk register

Probability and impact are assessed for this project specifically, not in the abstract.

| # | Risk | P | I | Mitigation | Owner |
|---|---|---|---|---|---|
| **R1** | **The Yavoriv shoot does not materialise, or arrives below the §1.8 standard** | **Medium** | **Critical** | B5 is a Phase 0 gate with a *dated* shoot, not an intention. **Round 2 halves this risk's surface**: the reused library (§E5) covers catalogue frames, so the shoot is one to two days of factory, process, machinery, people and place rather than 33 shoot-days. It does **not** eliminate the risk, because the reused photographs document a different workshop in a different village and the entire positioning rests on showing Yavoriv ([01-brand-strategy.md](01-brand-strategy.md) §1.8). The honest contingency is still to **delay Phase 4 rather than substitute stock imagery or someone else's factory** | Client + PM |
| **R2** | **Content population overruns and becomes the launch blocker** | **High** | **High** | Admin usable by week 10; templated alt text (§35.9.2); partial-translation launch with per-locale `noindex` (§35.9.3); launch threshold defined as W1 complete + W2 partial, **not** full catalogue in four locales | PM |
| **R2b** | **The catalogue import is mistaken for finished content, and the rewriting workload is discovered late** | **High** | **High** | **New in round 2, and the most likely way this plan fails.** §E5 requires every description rewritten with no sentence copied verbatim. Mitigations: §35.9.2 scopes it as an authoring workload in hours rather than as a cleanup pass; the duplicate-text guard ([23](23-admin-panel-architecture.md) §23.6.9) blocks commit on similarity ≥ 0.35 so the shortcut is not available; and the content stream's week-by-week plan tracks **rewritten** descriptions, never **imported** rows, as its progress metric | PM + Content |
| **R3** | ~~`{{SKU_COUNT}}` far larger than assumed~~ — **largely closed.** §E5 bounds it at several hundred to roughly a thousand, below the ~2,000 threshold in §25.10 | Low | Medium | B7 confirms the exact figure from the export. If it exceeds 2,000 against expectation, a search service is a scoped, isolated swap because search sits behind one API boundary | Backend |
| **R4** | **Cold-start traffic disappoints and the client loses confidence** | **High** | **High — raised in round 2** | §E3 removes Instagram from the channel mix: **the owners run no social media at all**, so the round-1 plan's launch-traffic assumption is void. Stated explicitly and in writing before launch (§35.10). GBP becomes the sole primary early channel, which also raises R5's impact. Month-1 reporting framed on GBP actions and direct conversion. Blog content in launch scope, not deferred. **Recommend creating an Instagram account before launch** — cheap, and the capability exists in the family | PM + SEO |
| **R4b** | **Transactional email cannot be authenticated, because the only available address is a consumer Gmail and the domain is deferred** | **Medium–High** | **High** | **Upgraded in round 3.** [00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com`, which is *more* dangerous than having no address at all, because it invites the assumption that the problem is solved. SPF and DKIM cannot be published for `gmail.com` and Gmail's consumer DMARC policy rejects such mail. With guest checkout permanent, the confirmation email is the **only** route a customer has to their order (§E12), so deliverability is revenue, and an unconfirmed paid order becomes a support call or a chargeback. Mitigation: B15 as a named Phase 0/1 blocker, `{{DOMAIN}}` pulled forward to **before Phase 3** (§35.3.0), §35.3.0a closing off the four plausible improvised workarounds, and F14 as a header-level launch gate | Client + Backend |
| **R4c** | **Enquiry-then-invoice is built and then not run** | **Medium** | **High** | New in round 3. F4's model puts a human in the critical path of every international sale, indefinitely. The realistic failure is not that quotes are answered badly but that they are answered on Thursday — and a buyer who waited four days for a shipping figure has already bought elsewhere. It degrades invisibly, because an unanswered enquiry produces no error and no alert. Mitigations: B16 requires a **named person and an agreed response time before launch**, O1–O2 gate it, the «Потребують прорахунку» queue and navigation badge make the backlog visible without an email, and `hours_to_quote` ([31](31-analytics-architecture.md) §31.4) makes the degradation measurable from month one. The honest contingency is to **disable international sales rather than run them slowly** | Client + PM |
| **R5** | GBP verification is delayed, fails, or the existing profile turns out not to be under the client's control | Medium | **High — raised in round 2** | Started in Phase 0 (B6), weeks ahead of need. §E4 adds that a profile already exists but could not be resolved (HTTP 429), so **ownership verification is itself a task**: an unverified or third-party-claimed profile cannot be edited at all. With Instagram absent (R4), GBP is the only primary channel, so this risk now has no adjacent channel to absorb it | Client |
| **R6** | **The 30-year claim drifts into a registration or certification claim in translation** | **Medium** | **High** | The claim is legitimate (D1) but its *phrasing* is load-bearing, and it is exactly the sort of nuance that is lost when a Ukrainian sentence is translated into German. L6 is a named launch gate reviewed by someone who has read D1. No certificate imagery exists in the asset library at all, so it cannot be used by accident | Content + Legal |
| **R7** | Partner resale is discovered rather than disclosed, damaging the origin thesis | Medium | **High — raised in round 2** | §E7 removes the ability to name the partner, which was the round-1 mitigation that turned disclosure into a curation credential. The fallback is to be *more* explicit, not less: `ProductOrigin` first-class, the mark at equal visual weight to «Власне виробництво», `partnerRegion` where known, the facet pinned to the top of the panel, `manufacturer` **omitted** rather than misattributed in structured data, and total exclusion from brand surfaces (§35.3.4, F10, L7) | Design + Backend |
| **R8** | **WayForPay integration differs from what was assumed** — integration mode, signature field order, webhook ack, refund support | **High** | **High** | **Round 2 raises this.** The provider is now known and six facts about it are not (V6–V11 → B8–B13). The controlling rule is that **nothing WayForPay-specific is written into code or into [26-api-architecture.md](26-api-architecture.md) until read from current official documentation** — a guessed signature format fails silently in production. Sandbox integration is spiked in Phase 1 rather than Phase 3; the receiver's structure (§26.14.1) is provider-agnostic at every step except 1, 2 and 8; webhooks tested against recorded fixtures including replay and out-of-order delivery | Backend |
| **R8b** | **A ФОП on the simplified tax system cannot contract with WayForPay** (V10) | Low–Medium | **Critical** | The cheapest question on the list and the most expensive wrong answer: it invalidates the payment rail and Phase 3 with it. B12 asks it in Phase 0, before any integration work starts. Contingency is a different acquirer, which §26.14.1's structure is written to absorb | Client + PM |
| **R9** | Font coverage fails V1 late | Low | High | B4 is Phase 0. The substitution plan (`Manrope` / `Cormorant Garamond`) is already written in [10-typography.md](10-typography.md) §10.2 | Designer |
| **R10** | Lighthouse 98–100 proves incompatible with the motion system | Low | High | Budgets enforced in CI from Phase 1 (G4, G5), not measured at the end. [13-motion-system.md](13-motion-system.md) §13.5 is written as a contract precisely to make this a design-time constraint | Frontend |
| **R11** | The client's team cannot operate the admin unaided | Medium | Medium | Admin designed for [00-assumptions.md](00-assumptions.md) E2 staffing; Ukrainian-language documentation and recorded walkthroughs (§35.14); training in Phase 5 with real tasks, and the training session doubles as launch gate F8 | PM |
| **R12** | Scope creep from the "future" categories, especially wood | Medium | Medium | §35.16 states what is not in v1 and when it arrives. Wood ships as an inactive category node with `DRAFT` products (D3), which is architecture, not a half-built feature | PM |
| **R13** | ~~Dye-lot requirement lands after catalogue entry~~ — **closed.** §E8 resolves lots as not tracked; no admin field, no facet, no PDP display. `ProductVariant.dyeLot` stays nullable and unused, preserving the migration path at zero cost | — | — | Retired | — |
| **R14** | **EU species-declaration paperwork blocks sheepskin and leather into the EU** | **High** | Medium | §E11 replaces the round-1 ethical-sensitivity framing with a paperwork one, which is harder and more concrete. Mitigation is the §E11 recommendation: **launch `de` and `pl` wool-only**, enforced server-side (F13), and enable hide categories per destination only after the documentation is confirmed. This also sidesteps the German market's ethical sensitivity as a side effect. `{{DE_FUR_POLICY}}` is superseded by this rule | Client + Legal |
| **R15** | **EU legal deliverables are treated as translation rather than as documents** | Medium | **High** | New in round 2. The Impressum, the 14-day withdrawal statement and the **model withdrawal form** are statutory instruments with required content, not paragraphs to translate from the Ukrainian terms page. L8–L10 are separate named gates for that reason, and the `de` locale does not go live without them | Legal + Content |
| **R16** | **A heritage claim is overstated in translation** | Medium | Medium | §E2: Hutsul lizhnyk weaving is widely described as inscribed on Ukraine's intangible-heritage register, and the temptation is to let that attach to Вівчарик. B14 confirms the exact wording; L12 checks every locale; the standing rule is that **the craft may be listed, a company is not** | Content + Legal |
| **R17** | ~~**`{{INTL_CARRIER}}` is unresolved**~~ — **closed by [00-client-decisions-3.md](00-client-decisions-3.md) F4, by dissolving the question.** There is no single international carrier and there was never going to be one: Nova Poshta Global, Ukrposhta International and others are chosen per order. The token resolves to a `Setting`-backed list, no live rate lookup is built for international destinations at all, and international orders permanently print a packing slip with a manual-dispatch flag. The residual risk moved to R4c, which is operational | — | — | Retired | — |
| **R18** | **The GBP category set covers only one of the two functions** | Medium | **High** | New in round 3. F2 confirms the premises are a shop *and* a factory, and the profile's category set determines which queries it is eligible for **at all**. A manufacturer-only primary forecloses «де купити ліжник» transactional-local intent; a shop-only primary discards the manufacturing differentiator that the entire brand strategy rests on. Both are single-field errors with quarter-scale consequences on the launch's primary channel. Mitigation: the category analysis in [29-seo-architecture.md](29-seo-architecture.md) §29.16 gives a recommended primary and secondary set with a stated fallback, B6 makes it a Phase 0 exit artefact, and S5 gates it at launch | SEO + Client |

| **R19** | **Made-to-order capacity is never sized, and a paid custom order misses its date** | **Medium** | **High** | New in round 5, and the only risk in this register that the software cannot mitigate. G2 commits 14 days of production per custom order; H1.1 takes payment in full up front; H3b makes custom orders reachable from any marked product. The site has no concept of a queue, so the fifth concurrent order is quoted the same 14 days as the first. The customer has already paid, for an item made to a size nobody else will buy, so the failure is not a delay — it is an unsellable object and a refund. Mitigation: **O6 requires a stated ceiling and a configured cap** (§35.10a), which converts the worst outcome into a closed-this-month message; `IN_PRODUCTION` plus a dated confirmation email removes the day-eleven support contact; and the client's own answer to the ceiling is a Phase 0 conversation, not a post-launch discovery | Client + PM |
| **R20** | **The return-shipping deposit is read as a fee for the right to inspect** | **Medium** | **High** | New in round 5. H1.3 pre-charges both shipping legs on a COD order and credits the return leg against the goods on acceptance. It costs an honest buyer nothing and it is genuinely unusual, so buyers have no prior pattern to resolve it against — and it sits directly in front of the payment method that otherwise answers the category's largest objection ([02-ux-research.md](02-ux-research.md) A6). A careless framing does not merely lose the deposit; it loses COD. Mitigations: the required construction shows the buyer's **own arithmetic** with the accept case first and «більше нічого не платите» closing it; [02-ux-research.md](02-ux-research.md) §2.8 **R15 tests it pre-launch** for the price of one moderated session; [31-analytics-architecture.md](31-analytics-architecture.md) tracks `deposit_disclosure_view` → `purchase(deposit_only)` as the leading indicator; and the client confirms the copy before it ships ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 4) | Content + PM |
| **R21** | **The wet hide stages are not filmed, and the in-house tanning claim becomes unusable** | **Medium** | **High** | New in round 4, from the §20.2 audit. The photograph-or-delete rule means an unphotographed stage does not render and is not claimed. B3–B5 are the hardest stages to shoot and carry the largest claim, and they run on the tannery's cycle rather than the shoot's — so a badly dated shoot loses them entirely and a second visit costs a second mobilisation. Mitigation: **B5's dated schedule must be dated against production**, the shot list records which stages run on which day, and the honest contingency is Track B shipping as a finishing pipeline rather than a fabricated ten-stage claim. §35.3.3 | Client + Designer |
| **R22** | **A Ukraine-only payment rule leaks into an EU locale** | Low–Medium | **High** | New in round 5. The return deposit is forbidden for `en`, `pl` and `de` under the Consumer Rights Directive's unconditional right of withdrawal (H1.3), and COD with inspection is domestic-only (H1.2). The likeliest leak is not a logic error but a **shared checkout copy block** translated along with everything else. Mitigations: the mechanic is guarded server-side rather than hidden in the UI; `deposit_disclosure_view` firing on a non-`uk` locale is specified as **an alert, not a chart** ([31-analytics-architecture.md](31-analytics-architecture.md) §31.4); and the `uk`-only commerce explainers are marked permanently untranslated so the admin's completeness indicator does not invite someone to translate them ([22-blog-specification.md](22-blog-specification.md) §22.10) | Backend + Legal |
| **R23** | **Mail moved into the panel goes unanswered, because the panel is not where the owners look** | **Medium** | **High** | New in round 7 (K2). Gmail on a phone pushes; a web panel does not unless it is installed and permitted. Mitigation: the phone-first mail surface and Web Push ([23](23-admin-panel-architecture.md) §23.13a), installing the panel on both owners' phones **in person** at handover, the content-free notice email as fallback, and SLA colouring. Gate: before the Worker replaces the Gmail forwarding rule, one week in which every test message sent to `{{BRANDED_EMAIL}}` is answered from the panel | PM + Client |

Removed from the register since the previous draft: the 30-years-unsupported risk (resolved by
D1, replaced by R6), the domain-change SEO-loss risk (no equity to lose), every
migration-fidelity risk (there is still no SEO migration), the dye-lot retrofit risk (R13,
resolved by §E8), and every customer-account risk — credential stuffing on a public login form,
customer password storage, customer session fixation and the account-area GDPR surface — all
deleted outright by §E12.

---

## 35.13 Post-launch 90 days

| Window | Focus | Concrete actions |
|---|---|---|
| **Day 0–7** | Stability | Twice-daily error-log review; 404 log review; order reconciliation against WayForPay every day; uptime and Core Web Vitals field data watched; one engineer on call |
| **Day 7–30** | First evidence | R3 exit-intent anxiety survey on PDP and cart ([02-ux-research.md](02-ux-research.md) §2.8); GBP review solicitation from the offline customer base; W4 translation wave begins, ordered by `SearchQueryLog` zero-result data; first blog cadence established |
| **Day 30–60** | Measurement replaces hypothesis | R1 audience-mix segmentation — the first real answer to `{{AUDIENCE_MIX}}`, which drives homepage and nav priority; R11 free-shipping threshold modelling; R2 begins accumulating checkout conversion data against the pre-PSP baseline of "no online payment at all" |
| **Day 60–90** | Decisions | R7 card sort on the material-world taxonomy; R8 wholesale loss-reason analysis; R9 production-content cohort comparison — **the input to the most expensive downstream decision in the blueprint, whether to fund a second shoot**; R10 `de` fur policy validated against real behaviour; first A/B test (swap S3 and S5 on the homepage, per [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2) |

A named review meeting at day 30, day 60 and day 90. Each reviews the [01-brand-strategy.md](01-brand-strategy.md)
§1.10 success criteria against measurement, and each is allowed to change the backlog. Metrics
that nobody acts on are stopped rather than kept.

---

## 35.14 Handover and documentation

| Deliverable | Audience | Format |
|---|---|---|
| Repository README and architecture overview | Any future engineer | Markdown in repo, linked to this blueprint |
| Runbook — deploy, rollback, migration, restore-from-backup | Engineer | Markdown, with the restore step **tested**, not merely described |
| Incident guide — site down, payments failing, orders stuck | Client + engineer | One page, phone numbers first, in Ukrainian |
| **Admin user guide, in Ukrainian** | Client staff, non-technical | Illustrated document plus 6–8 short screen recordings, task-shaped ("how to add a new ліжник with three sizes"), not feature-shaped |
| Content style guide | Content person | Voice rules from [01-brand-strategy.md](01-brand-strategy.md) §1.5, the forbidden-words list, the D1 phrasing rule for the 30-year claim, typographic conventions from [10-typography.md](10-typography.md) §10.6 |
| Photography brief for future shoots | Client + photographer | The §1.8 standard, the focal-point and text-safe-zone requirement, the "every production photo contains a person" rule |
| Credential handover | Owner | Shared password manager vault: registrar, DNS, hosting, database, Cloudinary, WayForPay, GBP, analytics. **Owned by the client, with our access revocable** |
| Blueprint itself | Everyone | This `docs/` directory, kept in the repository so it versions with the code |

Domain, DNS, GBP and PSP accounts are registered **in the client's name from the start**. An
agency holding a client's domain is a hostage situation nobody intended to create.

---

## 35.15 Maintenance and support

Sized for [00-assumptions.md](00-assumptions.md) E2: one owner, one or two managers, one content
person, no technical staff.

| Tier | Scope | Response | Notes |
|---|---|---|---|
| **P1 — site down, checkout broken, payments failing** | Revenue-stopping | Same business day | Defined by symptom, not by cause, so the client never has to diagnose before reporting |
| **P2 — a feature is broken but revenue continues** | Functional defect | 3 business days | |
| **P3 — content, copy and small changes** | Non-urgent | Batched, next cycle | Most of these should be doable in the admin; if they are not, that is a defect in the admin |
| **Proactive** | Dependency patches monthly; minor upgrades quarterly; a quarterly backup-restore drill; a quarterly Lighthouse and axe re-run against production | Scheduled | The re-run matters: performance and accessibility regress through content, not only through code |

The realistic long-term risk is not a bug. It is that a non-technical team gradually stops using
a system that asks too much of them. Every maintenance decision should be tested against whether
one person, on a Tuesday afternoon, can still add a product without calling anyone.

---

## 35.16 Phased scope — what is deliberately not in v1

Stating this now is what prevents it being negotiated in week 20.

| Feature | v1 | When | Why deferred |
|---|---|---|---|
| **Wooden products (ДЕРЕВО)** | ✗ | v1.2, when stock and photography exist | D3: architecture prepared, inactive category node, `DRAFT` products. A partially-populated category in the navigation is worse than none |
| **Вівчарик Ательє tier** | ✗ | v1.2+ | [01-brand-strategy.md](01-brand-strategy.md) §1.3 reserves the structure so it is a configuration change later, not a redesign |
| **Dark mode (public site)** | ✗ | Unscheduled | [09-color-palette.md](09-color-palette.md) §9.7: tokens authored under `[data-theme="dark"]`, so enabling it is a content decision. Admin ships dark by default |
| **Customer accounts** | ✗ | **Never** | Not deferred — **removed permanently.** [00-client-decisions-2.md](00-client-decisions-2.md) §E12: «Сайт назавжди працює в режимі гостьових покупок.» Order access is `Order.guestToken` plus an order-number + email lookup; repeat-purchase convenience is a first-party address-prefill cookie; the wishlist is `localStorage` only. This closes [00-assumptions.md](00-assumptions.md) F7 rather than leaving it open, and it should be resisted if reproposed — reintroducing accounts means reintroducing password storage, a public login form, session management and a materially larger GDPR surface, in exchange for convenience the prefill cookie already delivers |
| **Server-side wishlist** | ✗ | **Never** | Follows from the above. `WishlistItem` is removed from the schema ([25](25-database-schema.md) §25.8b). The UI states «Збережено на цьому пристрої» rather than implying sync |
| **Self-serve B2B portal with logged-in pricing** | ✗ | v2 | D1 in [00-assumptions.md](00-assumptions.md): wholesale is enquiry-led at launch. A portal before there is demonstrated volume is speculative |
| **Dropship partner portal** | ✗ | v2 | A named path on the wholesale page at launch; tooling only once lead volume justifies it |
| **ERP / 1C integration** | ✗ | On demand | [00-assumptions.md](00-assumptions.md) E3: the admin is the system of record at launch |
| **Multi-currency settlement** | **Depends on V11** | — | No longer a clean deferral. §E11 makes `en`/`pl`/`de` transactional, so if WayForPay settles non-UAH (B13) it is in scope; if not, prices display converted and charge in UAH and the checkout **says so plainly** at the payment step |
| **Full-catalogue `de`/`pl`** | Partial | After the paperwork | §E11: **wool-only** at launch. Sheepskin and leather face EU species-declaration and, for some materials, CITES documentation. Enforced server-side (F13), not by hiding menu items |
| **Loyalty, referrals, gift cards** | ✗ | Unscheduled | No evidence of demand. Would be built on a hypothesis |
| **Full `pl`/`de` catalogue translation** | Partial | Rolling, from launch + 30 | §35.9.3. Per-locale `noindex` until translated |
| **3D / AR product preview** | ✗ | Unscheduled | Photography and video deliver more trust per unit cost for this category |
| **Native mobile app** | ✗ | Unscheduled | A fast, accessible responsive site serves this audience better and costs a fraction |
| **Marketplace feeds (Google Shopping, Meta)** | ✗ | v1.1 | Depends on a stable catalogue and confirmed VAT status. Cheap once both exist |

---

## 35.17 Tokens this document depends on

### Resolved by [00-client-decisions-2.md](00-client-decisions-2.md)

| Token | Value |
|---|---|
| `{{LEGAL_ENTITY_NAME}}` | ФОП Гондурак Любов Юріївна (§E1) |
| `{{FACTORY_ADDRESS}}`, `{{FACTORY_CITY}}`, `{{POSTAL_CODE}}` | вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, **78644** (§E2) |
| `{{PHONE_IVAN}}`, `{{PHONE_LIUBOV}}` | +380679973450, +380679604769 (§E3) |
| `{{PSP}}` | WayForPay (§E10) — *selection* resolved; *integration* is B8–B13 |
| `{{SKU_COUNT}}` | Several hundred to roughly a thousand (§E5); exact figure from B7 |
| `{{DE_FUR_POLICY}}` | Superseded by the §E11 rule: `de`/`pl` launch **wool-only** |
| `{{PARTNER}}` | Superseded by §E7: partners cannot be named. `partnerRegion` carries the disclosure |

### Resolved by [00-client-decisions-3.md](00-client-decisions-3.md)

| Token | Value |
|---|---|
| `{{INTL_CARRIER}}` | **Multiple, quoted per order** (F4). Not a value but a `Setting`-backed list. No live international rate lookup is built |
| `{{CONTACT_EMAIL}}` (interim) | `gif19601@gmail.com` (F5) — **public contact use only**. Explicitly *not* `{{TRANSACTIONAL_FROM}}` and not asserted in structured data |
| `schemaBrand` for partner goods | Вівчарик, same as own manufacture (F3). `manufacturer` omitted |

### Resolved by [00-client-decisions-4.md](00-client-decisions-4.md)

| Token | Value |
|---|---|
| `{{MADE_TO_ORDER_DAYS}}` | **14** (G2) — days of **production before dispatch**, carrier transit on top. Closes [00-assumptions.md](00-assumptions.md) B7. Any copy implying "14 days to your door" is a defect |
| `{{FLOOR_VISIT}}` | **Yes — guided, with Іван, arranged in advance by phone** (G3). Not drop-in, no booking system, no published times |
| Phone priority | **Іван `+380679973450` primary, Любов `+380679604769` fallback** (G1). `LocalBusiness` → `telephone` carries Іван only. **Legal pages, the offer contract and the Impressum name Любов**, as ФОП seller of record — the inversion is deliberate and must survive copy review |
| Post-purchase artefact | **A business card, already shipping in every parcel** (G4). Needs artwork, a short URL and a QR code; no per-order codes |

### Resolved by [00-client-decisions-5.md](00-client-decisions-5.md)

| Token | Value |
|---|---|
| `{{WHOLESALE_RESPONSE_SLA}}` | **48 working hours** (H2), published as «протягом 2 робочих днів». **Confirmation still required** — B17 |
| `{{QUOTE_EXPIRY_HOURS}}` | **72**, and **36** for one-of-one items (H2) |
| Payment matrix | Online card (WayForPay) everywhere; **COD with inspection at the branch, Ukraine only, stocked items only** (H1.2); made-to-order **prepaid in full, COD removed server-side** (H1.1) |
| Return-shipping deposit | **Ukraine only** (H1.3). Forbidden for `en`, `pl` and `de` under the EU right of withdrawal |
| International quote owner | **Гондурак Любов Юріївна** (H3). Closes B16 |
| Custom sizing | **Per-product admin toggle**, off by default (H3b). Not a category rule |
| `{{INTL_CARRIER}}` | Confirmed as **all carriers, selected per order** (H4). Unchanged from F4 |

### Still blocking

| Token | Blocks | Closes in |
|---|---|---|
| `{{DOMAIN}}` | **Transactional email authentication (B15)**, branded email, the GBP website field, and every absolute URL in structured data, sitemap, `sameAs`, canonicals and OG tags (§35.3.0, §35.3.0a) | **Chosen: `vivcharyk.shop`** (round 7, K1). Closes on registration and DNS delegation — **now**, because the SPF → DKIM → DMARC ramp does not parallelise |
| `{{TRANSACTIONAL_FROM}}` | Every order confirmation, shipping notice, quote email and staff password reset. **Must be on `{{DOMAIN}}`; `gif19601@gmail.com` cannot serve** (F5) | Follows `{{DOMAIN}}`, B15 |
| `{{BRANDED_EMAIL}}` | The public contact address, the offer contract and the Impressum. **Read in the admin panel** (round 7, K2); forwarded to Gmail only until the panel mail ships. **Not** an Owner login address — those stay external (K2 rule 3) | Follows `{{DOMAIN}}` |
| ~~`{{MAIL_RETENTION_MONTHS}}`~~ | **Resolved: 8 months**, with a hold while the linked order has an open dispute ([00-client-decisions-8.md](00-client-decisions-8.md) §L8) | Closed |
| `{{LEGAL_ID}}` | The WayForPay merchant contract (B12), the договір оферти and the German Impressum (L1, L8). **Exists; awaiting delivery** (F1) | Phase 0 B3 — a chase, not a discovery |
| ~~`{{INSTAGRAM}}`~~ | **Resolved: none** ([00-client-decisions-8.md](00-client-decisions-8.md) §L9). No social row, no `sameAs`, no Instagram in the channel mix | Closed |
| `{{TEAM_SIZE}}` | Every duration in §35.2 | Engagement signature |
| `{{FREE_SHIPPING_THRESHOLD}}` | Checkout copy. `{{MOQ}}` resolved: 5 pieces, tiers −10% / −20% ([00-client-decisions-8.md](00-client-decisions-8.md) §L14). `{{VAT_STATUS}}` = single tax, not a VAT payer (§L5); `{{RETURN_DAYS}}` = 14 (§L4) — both resolved | Phase 0 B1 |
| ~~Custom-size pricing rule~~ | **Resolved.** Owner sets a per-product rate per square metre in the admin; the system computes and recomputes server-side ([00-client-decisions-5.md](00-client-decisions-5.md) §H3c). What remains is not a missing rule but missing *values* — each custom-sizeable product needs its rate, floor price and loom bounds entered, which is content work counted in §35.9.1a | Closed; values tracked as content |
| **The concurrent custom-order ceiling** | The `Setting` cap in §35.10a, and gate O6. Not a token in the CI sense — it is a number only the client can supply, and the cost of not having it is a paid order that cannot be delivered on time | Phase 0 conversation, **R19** |

CI gate G1 blocks any build containing an unresolved token, so this table is enforced rather
than merely recorded. `{{DOMAIN}}` being deferred is therefore safe by construction: a build that
reaches production with the token unreplaced cannot exist.
