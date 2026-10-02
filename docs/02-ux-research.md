# 02 — UX Research

Authority order for this document: [00-client-decisions-5.md](00-client-decisions-5.md) first,
then [00-client-decisions-4.md](00-client-decisions-4.md), then
[00-client-decisions-3.md](00-client-decisions-3.md), then
[00-client-decisions-2.md](00-client-decisions-2.md), then
[00-client-decisions.md](00-client-decisions.md), then
[00-existing-site-audit.md](00-existing-site-audit.md) as *adjacent-business reference only*, then
[00-assumptions.md](00-assumptions.md).

> **Round-2 revision note.** Four rulings changed this document structurally. The owners run **no
> social accounts** (E3), so every Instagram assumption below has been removed or re-labelled as a
> recommendation. Checkout is **guest-only, permanently** (E12), so no persona, journey or metric
> may assume registration or a logged-in state. The location resolved to **Яворів** (E2), which
> changes what the tourist persona is actually near. And photography is **partly solved** by
> reuse (E5), which narrows — but does not close — the largest blocker in §2.1.
>
> **Round-3 revision note.** Three rulings land on the research. The Яворів address houses **a shop
> as well as the production floor** (F2), which gives Persona 1 a real offline-to-online path and
> answers the category's primary purchase anxiety better than any on-page element can. Shipping and
> customs are **paid by the buyer in full, all destinations** (F4) — effectively DAP — which creates
> an unpriced cost at the door for every international persona and must be disclosed before payment.
> And the contact address is an **interim personal Gmail** (F5), which is a measurable trust cost on
> a site selling five-figure goods. The tagline ruling (F6) removes R13's hero-variant test and
> replaces it — see §2.8.
>
> **Round-4 revision note.** Four rulings land, and one of them changes the shape of the research.
> Visitors may **tour the workshop accompanied by Іван** ([00-client-decisions-4.md](00-client-decisions-4.md)
> G3) — this is the definitive answer to anxiety A3, and it is the first answer in this document
> that the site does not have to make on its own. Made-to-order is **14 days of production before
> dispatch, not 14 days to the door** (G2), which creates a new anxiety with a specific and easily
> made failure mode. A **business card already ships in every parcel** (G4), which closes the
> post-purchase gap this document identified and reaches the one customer who is otherwise
> unreachable. And the phone priority is fixed: **Іван primary, Любов fallback** (G1).
>
> **Round-5 revision note.** Payment is resolved and it resolves in this document's favour. **COD
> with inspection at the branch** ([00-client-decisions-5.md](00-client-decisions-5.md) H1.2) is
> available on stocked items in Ukraine — the single strongest available answer to A6 for a
> cold-start brand, and it is treated below as a first-class trust mechanism rather than a payment
> option. Against it, the **return-shipping deposit** (H1.3) is a genuinely new purchase anxiety
> and is analysed as one in §A11. Made-to-order items are **prepaid in full, online** (H1.1), and
> custom sizing is **per-product, toggled in the admin** (H3b), which means a mixed cart is the
> expected case rather than an edge case. `{{WHOLESALE_RESPONSE_SLA}}` resolves to **48 working
> hours** (H2).

## 2.1 Method, and the honest limits of it

**No primary research was conducted.** No interviews, no usability tests, no surveys, no card
sorts. There is **no analytics history of any kind**, because Вівчарик launches on a new domain
([00-client-decisions.md](00-client-decisions.md) D2). This document is desk research, category
analysis, heuristic evaluation, and client-confirmed fact.

| Method | Input | What it can support | What it cannot support |
|---|---|---|---|
| Client decisions | [00-client-decisions-2.md](00-client-decisions-2.md), [00-client-decisions.md](00-client-decisions.md) | Catalogue scope, stock reality, brand mandate, the 30-year manufacturing claim, the Yavoriv location, the named owners, the absence of any social presence | Audience behaviour, traffic mix, conversion |
| Adjacent-business reference | `fabryka-shkur.com.ua`, a **separate business belonging to the client's wife** | Realistic category price points for Carpathian wool goods; a worked example of how *not* to take payment; product-naming convention that works | Anything about Вівчарик's own traffic, catalogue size, or customers. It is not a predecessor. |
| Category storefront analysis | Publicly visible Ukrainian wool sellers on marketplaces, Instagram, and template storefronts | Presentation norms, missing trust signals, structural gaps | Conversion rates, objection frequency, price elasticity |
| Heuristic evaluation | Nielsen heuristics + WCAG 2.2 AA/AAA applied to category norms | Defects that are defects regardless of audience | Priority order for *this* audience |
| Published literature | Ageing-vision and motor-control research underpinning WCAG 2.2 target-size and contrast criteria; general checkout research | Design constraints for the 60–75 segment | Segment size for this brand |

**Confidence key:** **HIGH** — client-confirmed or a published standard. **MEDIUM** — a defensible
inference from category patterns. **LOW** — an explicit guess with a falsifying test in §2.8.

### The cold start changes what research is even possible

Вівчарик is a **new brand on a new domain** ([00-client-decisions.md](00-client-decisions.md) D2).
There is no Search Console history to mine, no existing customer list to survey through the site,
and no baseline against which to measure a launch. Three consequences run through this whole
document:

1. **Launch traffic is not organic search — and it is not social either.**
   [00-client-decisions-2.md](00-client-decisions-2.md) E3 removes the channel this section
   previously leaned on: **the owners run no social accounts at all.** The realistic first two
   quarters are therefore:

   | Channel | Status | What the visitor already knows on landing |
   |---|---|---|
   | Google Business Profile and Maps | **Live** (E4), and now the primary channel | Almost nothing about the product; a great deal about the place. They found a business near them |
   | Existing offline and word-of-mouth customers | Real but unsized | The people. They are checking that the website is the same business |
   | Long-tail editorial | Months away | Nothing. They arrived at an article, not a brand |
   | Yavoriv's tourist footfall | Seasonal, and now **confirmed as a real channel rather than a hypothesis** — the address houses a shop as well as the production floor ([00-client-decisions-3.md](00-client-decisions-3.md) F2), in a village that is a craft-tourism destination in its own right (E2) | They are standing in the village, and some of them have already handled the product |
   | The printed card in every parcel | **Live, and already paid for** ([00-client-decisions-4.md](00-client-decisions-4.md) G4) | Everything. They own the product. This is the only channel that reaches the counter-sale buyer, who has no order number and no email on file |
   | A guided workshop tour with Іван | **Live, by prior phone arrangement only** ([00-client-decisions-4.md](00-client-decisions-4.md) G3) | Not a traffic channel — an evidence channel. It settles A3 in person, which no page can |

   That is a thin set, and thinner than this document originally assumed. Three design
   consequences: every landing page must work for a visitor with **zero prior product exposure**
   (there is no Instagram feed doing the pre-selling); the GBP-to-site handoff is the single most
   important journey in the first two quarters, not a footnote; and the site itself must carry the
   proof-of-life signals that a social account would normally carry — recent dates, a phone number
   that is answered, photographs that are obviously not stock.

   **The fourth channel is now the only one that does not depend on search.**
   [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms «там знаходиться і магазин і
   виробництво» — retail and production share the address. That upgrades row four from "footfall,
   if the workshop happens to be visitable" to a channel with a shop counter at the end of it, and
   it reverses the direction of the usual assumption. The expected journey is not only
   *site → shop*; it is **shop → site**, where the visitor has already touched the wool, met the
   owner and left with a card, and the site's job is to be findable and to accept the second order.
   Two design consequences follow: the domain has to be printable and sayable — it goes on a card
   handed across a counter, not only into a search box — and the guest order-lookup path (E12) has
   to work for someone whose *first* purchase happened in person and therefore has no order number
   at all.

   **The card is not hypothetical — it already ships.**
   [00-client-decisions-4.md](00-client-decisions-4.md) G4 confirms a business card goes into every
   parcel. That converts the "printable, sayable domain" requirement above from a recommendation
   into a live dependency, and it supplies the only physical channel this project has. The research
   consequence is specific: the card is the **sole route to the counter-sale customer**, who has no
   order number, no captured email and no session, and who is simultaneously the most convinced
   customer the business has, because they stood in the building before buying. Recommendation on
   record (G4): a short URL plus a QR code to the same review-and-reorder page, printed **both
   ways**, because the 25–75 audience splits on scanning versus typing and printing one form
   silently excludes half of it.

   **The honest caveat attached to it.** A review arriving through the card has no order linkage, so
   `isVerifiedPurchase` stays `false` and it is excluded from the aggregate rating
   ([25-database-schema.md](25-database-schema.md) §25.6). That is correct and must not be
   engineered around. It means the card buys *visible* social proof and does not buy
   `AggregateRating`, which stays suppressed until three verified reviews exist
   ([29-seo-architecture.md](29-seo-architecture.md)). Both facts matter, and conflating them would
   produce a launch plan that expects stars in the SERP and gets prose on a page.

   **The fifth channel is a phone call, and it is the strongest one.**
   [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms visitors may tour the workshop
   **accompanied by Іван**, arranged in advance by phone. This does not add sessions and it is not a
   marketing channel in the analytics sense; it is an *evidence* channel, and it outranks every
   on-page asset in [01-brand-strategy.md](01-brand-strategy.md) §1.8 — that table ranks video of the
   factory at position 1, and a visitor can stand in the factory with the person who owns it. Its
   research significance is that A3, the category's primary purchase anxiety, stops being something
   the site argues and becomes something the visitor verifies. The constraint that comes with it is
   absolute: it is **never drop-in** and there is **no booking system**, because a calendar widget
   implies capacity that two people running a factory do not have.

   **The proof-of-life signal this site is currently spending against itself.**
   [00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies `gif19601@gmail.com` as the
   interim contact address. It works as a mailbox and it is a liability as a signal. Two distinct
   problems, both research-relevant because both are about what the visitor infers:

   | Problem | Effect on the visitor |
   |---|---|
   | A **numeric personal Gmail** as the only published contact address on a site selling 5,000–15,000 UAH craft goods | It reads as an individual, not as a manufacturer with a shop and a production floor. The address contradicts the positioning in the one field the visitor checks when deciding whether to send money ([01-brand-strategy.md](01-brand-strategy.md) §1.2) |
   | Transactional mail cannot be sent from it | Order confirmations sent "from" `@gmail.com` by the application fail SPF, DKIM and Gmail's own DMARC policy, so they land in spam or are refused. A buyer who paid and received no confirmation calls, or disputes the charge — which is anxiety A4 and A6 arriving together, post-payment (F5) |

   The fix is one DNS record and a forward to the mailbox the owners already read. This is the
   cheapest available upgrade on the project, and it undercuts the positioning until it is done.

   **Recommendation on record** (E3, not a decision): create an Instagram account before launch,
   even if updated rarely. For a craft manufacturer it is where product photography does its work,
   and it is the cheapest proof-of-life signal a new domain can buy. Nothing in this document
   *depends* on it existing, which is the point — the plan is built to work without it.
2. **Research that depends on volume is deferred, not skipped.** Anything requiring statistical
   traffic (facet-level engagement, cohort conversion) cannot run until month four at the earliest.
   §2.8 sequences accordingly.
3. **The informational content is the organic strategy**, not a content-marketing extra. Commercial
   head terms will not rank on a new domain for roughly a year; long-tail explanatory queries
   («що таке ліжник», «гуня чи накидка», «вовна проти синтетики») are the realistic entry. This is
   a UX fact as much as an SEO one: a large share of early visitors will land on an *article*, not
   a product, and the article must carry a purchase path.

### The three unknowns that bound everything below

1. **Audience mix (`{{AUDIENCE_MIX}}`)** is unmeasured, and the removal of the social channel
   makes it *more* uncertain rather than less — the mix is now driven almost entirely by who finds
   the Google Business Profile. Nav order, homepage section order, and filter order all assume a
   mix nobody has verified. §2.8 R1.
2. **Catalogue size (`{{SKU_COUNT}}`)** is bounded but not counted. E5 resolves it to the adjacent
   site's migrated catalogue scope — several hundred to roughly a thousand SKUs. The faceting
   architecture already holds across that range, so this has stopped being an architectural risk
   and is now simply a number to confirm at export.
3. **Photography is no longer the largest blocker, but it is still a blocker — for a narrower
   reason.** E5 permits reuse of the adjacent business's photographs, which solves catalogue
   coverage outright. It does not solve the strategy: every reusable frame documents **a different
   workshop in a different village**, and [01-brand-strategy.md](01-brand-strategy.md) §1.8
   requires showing *Yavoriv* production. The outstanding dependency is therefore a **one- or
   two-day shoot in Яворів** covering factory, process, machinery, people and place — not a full
   catalogue production. Restated in the risk framing below.

### E1 restated — what the reuse permission did and did not buy

| Asset class | Before Round 2 | After E5 |
|---|---|---|
| Product imagery, every SKU | Missing entirely. The project's largest blocker | **Covered.** Reuse permitted, subject to re-crop, re-grade, EXIF strip, semantic filenames, new per-locale `alt` |
| Product text | Missing | **Must be rewritten from scratch.** `fabryka-shkur.com.ua` stays online, so copied text creates two live sites competing for the same queries and the zero-authority domain loses. This is a real content workload, not a formatting pass |
| Factory, process, machinery, people, place — **in Яворів** | Missing | **Still missing.** Not addressable by reuse at any quality of retouching |
| Reviews | Missing | **Still missing, and must stay missing.** They were given to a different seller; transplanting them is a structured-data violation and a trust failure |

The personas below are therefore served by *product* imagery that now exists and *provenance*
imagery that does not. Where a persona's killer objection is answered by provenance — Марта and
Andrzej, two of four — the dependency is unchanged in severity and merely smaller in cost.

**What this document does not do:** it invents no quantitative findings, no percentages, and no
quotes attributed to real people. Where a persona speaks, the line is marked as a *constructed*
verbatim — a compression of category observation, not a transcript.

---

## 2.2 Jobs to be done

Six jobs, each with the emotional and social dimension, and each mapped to the surface that must do
the work.

| # | Job statement | Emotional dimension | Social dimension | Primary surface |
|---|---|---|---|---|
| J1 | When I am leaving the Carpathians, help me take home something that proves I was there, so the trip produces something lasting rather than photographs. | Fear of buying a relabelled import | The object must survive being explained to guests — and «з Яворова, села ліжникарів» is a far better thing to be able to say than «з Карпат» ([01-brand-strategy.md](01-brand-strategy.md) §1.2b) | Production page, PDP origin block, «Власне виробництво» mark, the Yavoriv provenance line |
| J2 | When my home feels cold and synthetic, help me replace one textile with something natural and permanent, so I stop re-buying the same thing every three years. | Distrust of unsupported "eco" claims | Signals judgement, not wealth | Category landing copy, care guide, specification table |
| J3 | When I am sourcing stock or specifying an interior, help me confirm this supplier can produce at volume and to my spec, so I do not stake my reputation on a workshop that cannot deliver. | Fear of a missed deadline landing on them | Their client sees the supplier's failure as their failure | Wholesale page, 30-year manufacturing claim, capacity, custom production |
| J4 | When I sell online but hold no stock, help me add a Ukrainian craft range my supplier ships directly, so I can test a category without capital. | Fear of a partner who ships late and damages *their* reviews | Their storefront carries the reputational risk | Dropshipping path on the wholesale page |
| J5 | When I have a knitting or weaving project planned, help me buy the exact colour, thickness and quantity I need — in one order — so the project does not fail halfway through. | Fear of running out mid-project | Craft-community credibility of the material | Yarn PDP, weight-based buy box, the buy-the-whole-project advisory ([00-client-decisions-2.md](00-client-decisions-2.md) E8) |
| J6 | When I need a gift for someone who has everything, help me find something with a story I can retell, so the gift lands as thoughtful rather than expensive. | Fear of seeming generic | The story is the gift | Gift hub, handmade tier, gift note |

**Design consequence, stated once:** J1, J3, J4 and J6 are satisfied by *provenance and capability
evidence*, not by product features. Four of six jobs point at the same asset. That is the mechanical
justification for the thesis in [01-brand-strategy.md](01-brand-strategy.md) §1.1, and it is now
backed by a client-confirmed claim: **«Понад 30 років виробляємо натуральні вовняні вироби в
Карпатах»** ([00-client-decisions.md](00-client-decisions.md) D1).

**How that claim must be handled in the interface**, because it is the strongest asset and the most
legally exposed one:

- It attaches to the **manufacturing**, never to a company registration. Copy says
  «виробляємо понад 30 років», never «компанія заснована 1992 року».
- **No certificate exists**, so no accreditation mark, no seal graphic, no "officially confirmed"
  framing. The design system has no component for a certification badge, and must not gain one.
- `Organization.foundingDate` is not set to 1992 ([00-client-decisions.md](00-client-decisions.md) D1).
- The substantiation is visual: **show machines that are thirty years old.** An unverifiable number
  next to a photograph of the machine that makes the number true is a different claim from the
  number alone.
- **The claim now extends to the full cycle including hides**
  ([00-client-decisions-2.md](00-client-decisions-2.md) E6), which raises the evidence burden in
  the same motion. The governing rule is self-policing: photograph the stages you claim, and do
  not assert a stage that cannot be photographed. The «бельгійська технологія» framing is removed
  outright — it belonged to the adjacent business.

**Non-jobs — demand this site is not designed to serve:**

- "Help me find the cheapest wool blanket." Forfeited deliberately.
- "Help me buy this in the next ten minutes." At a category price point in the thousands of UAH and
  with made-to-order options, purchase is high-consideration and multi-session. Urgency mechanics
  are dishonest here and are forbidden ([13-motion-system.md](13-motion-system.md) §13.11).

---

## 2.3 Personas

Four personas, one per audience in the brief. Each carries the objection that most plausibly kills
the sale and the *specific site feature* that answers it.

**Price context applies to all four.** Comparable Carpathian wool goods in the adjacent business
sell in the 4,990–14,900 UAH band ([00-existing-site-audit.md](00-existing-site-audit.md) §0.6).
Treat this as a category reference, not as Вівчарик's own price list. At that value nobody buys on
first visit: every persona is a **considered, multi-session, comparison-driven purchase**. The site
must be resumable, deep-linkable and memorable rather than urgent.

**Entry-channel context also applies to all four.** For the first two quarters most arrivals come
from Google Business Profile, word of mouth, or physical presence in Яворів — **not search, and
not social**, because there is no social presence to arrive from (E3). That inverts the previous
assumption: landing pages must work for a visitor who has **not** seen the product before and is
simultaneously assessing what it is and whether the seller is real. Pages that assume a warmed-up
visitor will underperform.

**Account context applies to all four, permanently.**
[00-client-decisions-2.md](00-client-decisions-2.md) E12 removes customer accounts from the
product forever — no registration, no login, no order history page, no saved addresses, no saved
payment methods, no logged-in state of any kind. No persona below has a "returning logged-in"
mode, and no journey may route through one. The mechanisms that replace them are device-local:
`Cart.token`, `Order.guestToken` plus an order-number-and-email lookup form, `localStorage` for
the wishlist, and a first-party cookie for address prefill. Where this document previously said
"order history", read "guest order lookup".

### Persona 1 — Марта, 38 — the tourist buying a gift or a keepsake

| Attribute | Value | Confidence |
|---|---|---|
| Context | On holiday in the Carpathians — plausibly **in Яворів itself**, which is a craft-tourism destination with a Музей ліжникарства — recently returned, or diaspora buying "something from home" | MEDIUM |
| Entry | Google Business Profile / Maps while in the region; a friend's link; a QR code or a card handed over **in the shop** ([00-client-decisions-3.md](00-client-decisions-3.md) F2); **or the site as a second visit after an in-person one**. **Not Instagram** (E3) | MEDIUM |
| Locale | `uk`; the diaspora variant uses `pl` or `de` | MEDIUM |
| Device | Phone-dominant. Often mountain mobile data or hotel wi-fi. | HIGH |
| Session | Short, interrupted, resumed hours or days later on the same device | MEDIUM |

**Goals.** Take home an object that proves the place. Buy something still in the house in fifteen
years. Be able to say where it came from when asked.

**Anxieties.** That the "Carpathian" blanket was made elsewhere and relabelled. That it will look
cheap when unwrapped. That it will not arrive before the occasion.

**Killer objection: "How do I know this isn't the same import everyone else is selling?"**

**Resolving feature:** the PDP **origin block**, rendered from first-class schema fields
(`Product.woolOrigin`, `woolMicron`, `productionStage[]` in
[25-database-schema.md](25-database-schema.md) §25.3) plus the **«Власне виробництво» mark**
(`ProductOrigin.OWN_MANUFACTURE`, [00-client-decisions.md](00-client-decisions.md) D3), naming
**Яворів** rather than a generic "Карпати". A named place, a named process and a photograph
containing a person ([01-brand-strategy.md](01-brand-strategy.md) §1.4, "Warm") is falsifiable in
a way a "100% натуральна вовна" badge is not — and Яворів is falsifiable in a way "Карпати" is
not, because the village is checkable and the mountain range is not.

This is the persona the Yavoriv claim was made for. Her objection is *relabelling*, and the
counter-argument that actually lands is not "we are a factory" but "we are in the village this
craft is named after" ([01-brand-strategy.md](01-brand-strategy.md) §1.2b).

**Secondary resolving features:** the physical, visitable location surfaced as a destination
rather than footer text — a reseller has no address tourists can drive to, and this is also the
Google Business Profile asset that carries the first two quarters of traffic;
`MediaRole.PRODUCTION` images interleaved into the product gallery rather than quarantined on an
About page; `Product.isUniquePiece` stating plainly that stock is one.

**Round 3 turns the strongest secondary feature into a primary one, and adds a journey the site did
not previously have.** [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms the Яворів
address is **a shop as well as a production floor**. For this persona specifically that is not a
detail, because she is the only persona who can physically stand in it.

| What changes | Consequence for the design |
|---|---|
| Her killer objection can be answered **before she reaches the site** | The counter-argument to "is this the same import everyone else is selling" is no longer only an origin block — it is a room she walked through with a loom in it. The site's job for a post-visit arrival is not to persuade but to **be recognised**: the same photographs, the same two names, the same address, so the page confirms the visit rather than re-arguing it |
| A real **offline-to-online path** exists, and it runs the unexpected way | *Shop → site → second order*, weeks or months later, most often from a different city and frequently as a gift. The entry point is a remembered brand name or a card, not a search query — which makes the product names ([02-ux-research.md](02-ux-research.md) §2.5.4, "copy the naming convention") and a sayable domain load-bearing rather than cosmetic |
| The first purchase may have **no order number** | She bought in the shop, in cash, with no email address captured. The guest order-lookup page (E12) cannot serve her, and nothing in the interface should imply that her in-person purchase is on file. Her second order is a first order as far as the system is concerned, and that must not read as the business having forgotten her |
| «Забрати в Яворові» is not a saving, it is an invitation | The pickup option is framed as «Приїздіть: магазин і виробництво в одному місці», not as the cheapest shipping row. For a visitor already in the region it is the *preferred* outcome, because it produces a second in-person contact ([00-client-decisions-3.md](00-client-decisions-3.md) F2) |
| **Round 4 adds the workshop itself** ([00-client-decisions-4.md](00-client-decisions-4.md) G3) | The shop is a room with products in it; the workshop is the proof. A tourist who can be walked through the production floor **by the owner** converts the visit from shopping into witnessing, which is precisely the raw material of J1 and J6 — she is buying a story she can retell, and a tour is the story. It is offered as an invitation, by phone, in advance: «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» Never a fixed time, never "open to the public" |
| **Round 4 confirms she leaves with a card** (G4) | Her second order, weeks later and from another city, starts from a printed short URL and a QR code rather than from memory. This is the mechanism that makes the offline-to-online path above work at all, and it is already in the parcel |

**Round 5 gives this persona the objection-remover she most needs, and it is not a design element.**
[00-client-decisions-5.md](00-client-decisions-5.md) H1.2 makes **COD with inspection at the Nova
Poshta or Ukrposhta counter** available on stocked items throughout Ukraine. Her second and third
anxieties — "it will look cheap when unwrapped", "the colour is not what the photograph showed" —
are both anxieties about *committing money to an unseen object*. The inspection right does not
argue with them; it dissolves them, because she opens the parcel before she pays for it. For a
diaspora buyer ordering to a Ukrainian relative's address this matters more still, since the person
inspecting is not the person who chose. Treat it as a first-class trust element on the PDP trust
row, not as a checkout setting discovered at step three.

This is also the one persona whose most valuable behaviour is **invisible to e-commerce analytics**.
A visit that converts at a counter produces no session, no event and no order record on the site.
Visit-intent events are the only available proxy, which is why §2.8 R8b and the new R14 both matter
more than their cost suggests.

**One correction to the previous draft.** This document previously leaned on advertised Sunday
opening. [00-client-decisions-2.md](00-client-decisions-2.md) E3 states that **hours vary day to
day** and that Google Maps is the live source. For this persona specifically — someone who may
drive an hour through a valley — publishing hours that are wrong twice a week is worse than
publishing none. The site states **«Графік гнучкий — телефонуйте перед візитом»** with both
numbers — **Іван `+380679973450` first, Любов `+380679604769` as the fallback**
([00-client-decisions-4.md](00-client-decisions-4.md) G1) — and `LocalBusiness` JSON-LD omits
`openingHours` entirely, carrying Іван's number alone in `telephone`. A phone call before a visit is
a conversion event, not friction, and G3 doubles the reason to make it: the same call that confirms
the shop is open is the call that arranges the workshop tour.

**Failure mode to design against.** She opens the site on degraded mobile data in a valley, the hero
video does not start, and she leaves. Mitigation: the hero poster frame *is* the LCP element and is
never animated on entrance ([13-motion-system.md](13-motion-system.md) §13.8); ambient systems
disable on `saveData` (§13.7).

*Constructed verbatim:* "I want it to be from here. Not 'in the style of here'."

---

### Persona 2 — Оксана, 45 — the family buyer furnishing a home

| Attribute | Value | Confidence |
|---|---|---|
| Context | Buying for her own household; often replacing a synthetic item; frequently buying for a child or an elderly parent | MEDIUM |
| Entry | An informational article found in search; later a branded search once she remembers the name. With no social channel (E3) this persona's cold-start entry is **editorial content or nothing**, which makes the blog a revenue path rather than a marketing extra | MEDIUM |
| Locale | `uk` | HIGH |
| Device | Phone for discovery, desktop or tablet at purchase — the "evening basket" pattern | MEDIUM |
| Session | Multi-session across days; returns via a saved tab or a remembered product name — **never via an account**, because there are none (E12). Continuity is `Cart.token` and a memorable product name, and nothing else | MEDIUM |

**Goals.** Natural fibre in the house. Something a child can sleep under. Something she can clean
without ruining it.

**Anxieties.** Itch. Shrinkage. Allergy. Moths. That "wool" means 30% wool and 70% acrylic.

**Killer objection: "Will it itch, and what happens the first time it needs washing?"**

**Resolving feature:** the **specification table** driven by `AttributeDefinition` /
`ProductAttributeValue` ([25-database-schema.md](25-database-schema.md) §25.3), surfaced *above*
the marketing description per [08-design-system.md](08-design-system.md) §8.2, carrying micron,
composition percentages, weight in grams, and care instructions — all nine per-product capabilities
are now confirmed hard requirements ([00-client-decisions.md](00-client-decisions.md) D4). Micron is
the honest answer to "will it itch": it is a number, it is comparable, and stating it signals that
the seller expects to be checked.

**Secondary resolving feature — the care guide as an entry point.** Under the cold-start reality
(§2.1), care and comparison articles are where a large share of early visitors *land*. The care
guide is therefore not post-purchase reassurance bolted onto the site; it is a top-of-funnel page
that must carry a product path. Bidirectional linking is specified in
[03-information-architecture.md](03-information-architecture.md) §3.7.

**Round 5 makes this the persona most likely to meet the custom-size fork, and the one most likely
to be hurt by it.** [00-client-decisions-5.md](00-client-decisions-5.md) H3b confirms custom sizing
is a **per-product admin toggle**, and that made-to-order is a property of *which size the customer
picks* rather than of the product. A woman furnishing a home is the buyer who owns a bed that is not
150×200. She will therefore be the one who selects «Свій розмір», and in doing so she crosses three
thresholds at once, none of which she asked for: the item now takes **14 days of production before
dispatch** ([00-client-decisions-4.md](00-client-decisions-4.md) G2), it requires **full online
prepayment**, and **cash on delivery disappears** (H1.1).

Two research consequences, and both are placement consequences rather than copy ones:

1. **All three facts must land in the buy box at the moment the size is chosen**, not at checkout.
   A buyer who selects a size, adds to cart, fills a delivery form and only then discovers that the
   inspection right she was counting on has been withdrawn experiences it as a bait-and-switch, and
   she is correct to. The reason has to travel with the restriction: «Виріб шиється за вашими
   розмірами, тому оплата — повна, наперед. Виготовлення — 14 днів.»
2. **The mixed cart is now her normal cart, not an edge case.** Because the flag is per-product, a
   household order of one stocked blanket and one custom one is the expected shape (H3b). The cart
   ships as one parcel after fourteen days, fully prepaid
   ([00-client-decisions-6.md](00-client-decisions-6.md) §J1) — so the stocked blanket she could
   have had tomorrow, on inspection at the branch, now waits a fortnight and is paid for in
   advance. **Both of her terms changed because of a line she added second.**

   This is the sharpest usability risk in her journey, and it is not solvable by wording at
   checkout — by then she has chosen a payment method and formed an expectation. The disclosure
   has to arrive **at the moment she adds the custom item**, while abandoning it still costs her
   nothing. The escape offered there is a plain sentence, not a control: order the custom piece
   separately if the stocked one is needed sooner. She is capable of placing two orders; what she
   cannot do is guess that she should.

**Failure mode to design against.** She cannot find the composition without opening a tab or an
accordion, assumes it is hidden, and leaves. Mitigation: the first three specification rows render
unwrapped at every breakpoint; only rows four onward collapse.

**Second failure mode, new in Round 5.** She reaches checkout expecting «оплата при отриманні»,
sees the return-shipping deposit line, reads it as a fee for the privilege of inspecting, and
abandons. This is anxiety A11, and the mitigation is arithmetic rather than reassurance — see
§A11.

---

### Persona 3 — Andrzej, 52 — the trade buyer

Covers retail shops, resellers, interior designers, hospitality, craft businesses, **and
dropshipping partners**. The dropshipping path is designed for but is **not a confirmed offer
Вівчарик makes**: the scheme observed at
[00-existing-site-audit.md](00-existing-site-audit.md) §0.6 belongs to the adjacent business
([00-client-decisions.md](00-client-decisions.md) D2), and `{{DROPSHIP_OFFERED}}` is unresolved
(§D2 Consequence 3). [19-wholesale-page-specification.md](19-wholesale-page-specification.md)
§19.9 publishes or is deleted on the client's answer. The persona is researched on the assumption
the path may exist, because designing the lead form for it now is cheaper than retrofitting it
later — but nothing in this document asserts the offer.

| Attribute | Value | Confidence |
|---|---|---|
| Context | Sourcing for a shop, specifying a refurbishment, or adding a range to an existing storefront without holding stock | MEDIUM |
| Entry | Direct referral, trade search, or a phone call redirected to the site. No social channel exists to be redirected *from* (E3), which removes a warm-up step this persona previously got for free | MEDIUM |
| Locale | `pl`, `de`, `en`; domestic hospitality uses `uk` | MEDIUM |
| Device | Desktop, business hours, with a competing supplier open in another tab | MEDIUM |
| Session | One long research session, then a form, then email | MEDIUM |

**Goals.** Establish that this is a manufacturer, not a middleman. Establish capacity, MOQ, lead
time, discount tiers, custom-spec capability, and whether dropshipping is real. Get a human reply
fast enough to stay on the shortlist.

**Anxieties.** That the "factory" is three people and an Instagram account. That the order will be
accepted and quietly missed. For the dropshipper specifically: that a late shipment lands as a
one-star review on *his* storefront.

**Killer objection: "Is this an actual factory, or a reseller with good photography?"**

This persona is also **the one most likely to notice the partner-products category and to read it
as an answer to that question** — and Round 2 made that harder rather than easier.
[00-client-decisions-2.md](00-client-decisions-2.md) E7 rules that partner manufacturers **may not
be named**. The label he will see is «Відібрано Вівчариком» plus a region — «Виготовлено
карпатським майстром» — or, where the region is unknown, «Виготовлено іншим виробником».

State the consequence plainly rather than optimistically: a trade buyer evaluating a supplier
*cannot verify an unnamed maker*, so the disclosure reads to him as honesty, not as a curation
credential ([01-brand-strategy.md](01-brand-strategy.md) §1.7b). That is still the right trade —
discovered omission would confirm exactly the suspicion the wholesale page exists to refute — but
it is a smaller win than the previous draft claimed, and the wholesale page must therefore do the
persuading with **own-manufacture evidence**, not with the breadth of the curated range. The
own-manufacture filter is load-bearing for this persona specifically: it lets him remove the
ambiguity himself in one click.

**Round 3 raises the stakes on that label again.**
[00-client-decisions-3.md](00-client-decisions-3.md) F3 confirms partner goods are **sold under the
Вівчарик brand**. This is ordinary retail practice and entirely legitimate, and it is also the
practice this persona is professionally trained to look for, because it is how a middleman presents
itself. He will see one brand across a catalogue of mixed origin, and the *only* thing separating
that from the thing he fears is the on-page label. It follows that the label is not a compliance
detail for him — it is the evidence — and that shrinking it, softening it, or letting it lose the
visual-weight contest to the price is the specific failure that loses this persona. The mitigations
in [01-brand-strategy.md](01-brand-strategy.md) §1.7b are unchanged; what changed is that there is
now no slack in them.

**Round 3 also hands this persona its strongest single answer.** F2 confirms the address is a shop
attached to the production floor. "Factory or reseller" is a question a trade buyer settles by
visiting, and a supplier who can say *come and see the line running, here are two mobile numbers,
call before you set off* has pre-empted the site's entire argument. The wholesale page should say so
explicitly rather than leaving the visit to the contact page: for a buyer placing a first volume
order, an open invitation to inspect is worth more than any capacity table on the same page.

**Round 4 turns that invitation into the single strongest asset this persona will encounter
anywhere on the site.** [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms the tour is
**accompanied by the owner**, not a walk past a window. The difference is decisive for a trade
buyer and marginal for a consumer, which is why the wholesale page should carry it more prominently
than the production page does:

| | Consumer | Trade buyer |
|---|---|---|
| What the tour proves | That the object has a place of origin | That the **supplier exists, at the claimed scale, with the claimed equipment**, and that a named individual will stand next to it and answer questions |
| What it is worth | A better story to retell | The removal of the entire due-diligence problem on a five-figure first order |
| What the alternative is | Photographs, which are adequate | Photographs, which are exactly what a reseller with good photography also has — the failure mode this persona is trained to detect |

A buyer placing a five-figure order can verify the supplier **personally, before committing**.
Almost no Ukrainian competitor in this category can offer that, and **no marketplace reseller can
offer it at all** — a reseller has no floor to show. This is the one claim on the wholesale page
that a competitor cannot copy by writing better copy, and the only one that answers "factory or
reseller" with something other than an assertion. It must be stated as an invitation arranged by
phone, never as a scheduled tour: over-promising access to a two-person business converts the
asset into a complaint (G3).

**Round 5 resolves his response-time question.** `{{WHOLESALE_RESPONSE_SLA}}` is **48 working
hours** ([00-client-decisions-5.md](00-client-decisions-5.md) H2), with quotes valid for 72 hours
and 36 for one-of-one items. The customer-facing wording under-promises at «протягом 2 робочих
днів». For this persona the number matters less than its being *kept*: he is comparing suppliers,
and a supplier who answers in 20 hours against a published 48 has demonstrated the operational
reliability the whole page is arguing for. A published 24 that arrives in 50 demonstrates the
opposite, on the first interaction, at the cheapest possible moment to lose him.

**Resolving feature:** the **wholesale page as a qualified landing page** — 30 years of continuous
manufacturing in Яворів, the in-house stages across **both** the wool and the hide pipelines
(E6 confirms the full cycle from raw material to finished goods), volume-tiered discounts, custom production (colour, size,
fur length), a named dropshipping path, an own-manufacture filter, and a stated first-response SLA
(`{{WHOLESALE_RESPONSE_SLA}}`) — instead of a phone number. The form writes to `Lead` with `kind`
and `businessType` ([25-database-schema.md](25-database-schema.md) §25.8) so replies are routed and
measurable. `LeadKind` gains a `DROPSHIP` member: a dropshipper is asked for a storefront URL and a
fulfilment expectation, not a volume, and one undifferentiated form loses the information the first
reply needs.

**Failure mode to design against.** He submits the form and hears nothing for four days, by which
point a competitor has quoted. The mitigation is operational: a publicly stated SLA enforced by an
admin dashboard counter on the age of `Lead.status = NEW`
([23-admin-panel-architecture.md](23-admin-panel-architecture.md)).

---

### Persona 4 — Ірина, 61 — the needleworker buying yarn, rovnytsia and raw wool

Confirmed real stock at launch ([00-client-decisions.md](00-client-decisions.md) D4). Three distinct
products — **вовняна пряжа**, **ровниця**, **вовна для рукоділля** — all sold **by weight, not by
unit**.

| Attribute | Value | Confidence |
|---|---|---|
| Entry | Craft communities and long-tail material queries — the one persona whose head terms a new domain can realistically rank for early, and now the one least harmed by the absence of a social channel (E3) | MEDIUM |
| Locale | `uk` | MEDIUM |
| Budget posture | Buys by weight and computes unit cost. Zero tolerance for vague quantities. | HIGH |
| Device | Mixed, with materially higher tablet and desktop share. Larger OS text size is common. | MEDIUM |
| Session | Repeat purchaser. Plausibly the highest lifetime value per head. | LOW |

**Goals.** Buy the right colour, thickness and quantity. Match a previous purchase. Not run out
mid-project.

**Anxieties.** **Dye-lot mismatch** between what she buys today and what she buys in six weeks.
Getting 400 g when 500 g was needed. Buying "пряжа" and receiving ровниця, or the reverse.

**Killer objection: "How much will I actually receive, and will the next batch match?"**

**Resolving feature:** `PricingUnit` (`KILOGRAM` / `SKEIN`) on `Product`
([25-database-schema.md](25-database-schema.md) §25.3) driving a **weight/quantity input rather than
a unit stepper**, with unit price and line total shown simultaneously. Cart line maths are price ×
weight, not price × count; shipping weight is the purchased quantity itself, which makes the
delivery estimate more accurate here than anywhere else in the catalogue.

**The second half of the objection is now answered — negatively.**
[00-client-decisions-2.md](00-client-decisions-2.md) E8 resolves dye lots as **not tracked**
(«Не знаю», read safely). That closes open question D6.3 and closes §2.8 R3.

The consequence is that the interim disclosure is not interim — it ships permanently, and it must
be written as advice rather than as a hedge:

> «Відтінок може незначно відрізнятися між партіями. Для великого проєкту радимо замовити всю
> кількість одразу.»

`ProductVariant.dyeLot` stays in the schema, nullable and unused: no admin field, no facet, no PDP
display. Exposing a lot identifier the business does not actually control would imply a guarantee
it cannot honour, which is the failure mode this persona punishes hardest. Stating the limitation
and giving the correct workaround reads as expertise and simultaneously prevents the return.

Revisit only if returns data shows lot mismatch becoming a real cost.

**Disambiguation is a design requirement, not copywriting.** Пряжа, ровниця and вовна для рукоділля
look similar in a thumbnail and are three different purchases. Each PDP opens with a one-line
"what this is and what it is for" statement above the specification table, and the three families
cross-link to each other from the buy box.

**Accessibility note.** This persona sits inside the 60–75 band and is simultaneously the most
detail-sensitive. Density must come from *structured tables*, never from small text. See §2.6.

---

### Persona objection summary

| Persona | Killer objection | Resolving feature | Schema dependency |
|---|---|---|---|
| Марта (tourist) | "Is this actually from here?" | PDP origin block naming **Яворів** + «Власне виробництво» mark + production imagery in the gallery; **and, for anyone in the region, a guided workshop tour with Іван** (G3) | `woolOrigin`, `productionStage[]`, `ProductOrigin`, `MediaRole.PRODUCTION` |
| Оксана (family) | "Will it itch, and can I wash it?" | Specification table above the description; care guide linked both ways; **COD with inspection at the branch** (H1.2) for the residual "is it what the photograph showed" doubt | `ProductAttributeValue`, `AttributeDefinition.unit`; payment-method derivation from cart contents |
| Andrzej (trade) | "Factory or reseller?" | Wholesale landing page + explicit (but unnamed) partner labelling + own-manufacture filter; **and an owner-accompanied floor visit no reseller can offer** (G3) | `Lead.kind` (+`DROPSHIP`), `ProductOrigin`, `partnerRegion`; `partnerName` **null, never rendered** |
| Ірина (needleworker) | "How much do I get, and will it match?" | Weight-based buy box; permanent buy-it-all-at-once advisory | `PricingUnit`, `ProductVariant.weightGrams`; **dye lot: resolved — not tracked (E8)** |

---

## 2.4 The category's purchase anxieties, and where each is answered

| # | Anxiety | Why it exists | Where it is answered | Strength |
|---|---|---|---|---|
| A1 | **Is it real wool?** | Blended and mislabelled goods are endemic; "вовна" in a title frequently means a minority fibre content | PDP specification table (composition %, micron) rendered before the description; `Product` structured data | Strong — a number, comparable, falsifiable |
| A2 | **Will it itch?** | Wool's reputation is set by coarse mid-century garments; buyers have no vocabulary for fibre diameter | Micron with a plain-language band beside it; a "next to skin / over bedding / floor" usage note per family | Medium — micron alone means nothing without the plain-language translation |
| A3 | **Is this a real factory or a reseller?** | The category is dominated by resellers using identical supplier photography | **An owner-accompanied tour of the production floor, arranged by phone** ([00-client-decisions-4.md](00-client-decisions-4.md) G3); a shop attached to that floor at a named address (F2); production page with named stages across both material pipelines (E6); 30-year manufacturing claim substantiated by film of the machines; per-product `productionStage[]`; the named village and the named owners; **and the honest own-vs-partner label** | **Definitively answerable, and not by the site.** See the analysis below — G3 outranks every row in [01-brand-strategy.md](01-brand-strategy.md) §1.8's evidence table. On-page evidence remains **conditional on the Yavoriv shoot happening** — reused photography from another village answers this anxiety with the wrong evidence |
| A4 | **Will it arrive, and what will it cost me in the end?** | Distance selling from a small Ukrainian producer, frequently without tracking — and, internationally, with a bill at the door nobody mentioned | Delivery estimate on the PDP before the cart; carrier and price at checkout step one; tracking without an account via `Order.guestToken`; **COD with inspection at the branch** on stocked Ukrainian orders (H1.2). **Internationally the buyer pays shipping *and* all customs duties and import taxes** (F4), which must be stated before the pay button, not after. On made-to-order items the answer changes shape: prepayment is required (H1.1) and the reassurance must come from the **dispatch date** instead (A10) | Strong domestically. Internationally, strength depends entirely on **when** the customs disclosure appears — before payment it is honesty, after payment it is the most common way a small cross-border shop loses a parcel and a customer at once |
| A5 | **Can I return it?** | Returns policies in this category are usually absent or buried | `{{RETURN_DAYS}}` stated in the PDP trust row, at checkout, and in the confirmation email, **including who pays return shipping** | Strong if the number is real. Publishing a window the business will not honour is worse than publishing nothing |
| A6 | **Is this payment safe?** | The category norm — visible in the adjacent business — is a manual transfer to a *personal* card after a mandatory manager call. It reads as the exact signature of a fraudulent listing. | A real PSP with an on-site card flow (WayForPay), an order number issued before payment, an emailed receipt, **and COD with inspection at the branch on stocked Ukrainian orders** ([00-client-decisions-5.md](00-client-decisions-5.md) H1.2) | **The strongest row in this table for a domestic buyer.** See the analysis below: the inspection right means the buyer does not have to trust the seller at all |
| A10 | **«14 днів» — to my door, or before you even post it?** | Made-to-order items take **14 days of production before dispatch**, with carrier transit on top ([00-client-decisions-4.md](00-client-decisions-4.md) G2). Category copy routinely conflates the two | Lead time in the **buy box** at size selection, never in a tab; the confirmation email restates a **date**, not a duration; `IN_PRODUCTION` order status names what is happening | Strong if the construction is «Виготовлення — 14 днів. Далі — доставка перевізником.» **Fatal if the copy implies "14 days to your door"** — the complaint arrives on day 15 and is justified |
| A11 | **Am I being charged extra for the right to look at it?** | The return-shipping deposit (H1.3): on a Ukrainian COD order the buyer pays both shipping legs online at checkout, before the parcel moves | A worked example with the buyer's **real numbers** at checkout, before the pay button. See §A11 | **Entirely dependent on presentation.** Correctly framed it is a refundable-by-offset deposit that costs an honest buyer nothing; carelessly framed it is a fee for inspecting, which is worse than not offering inspection at all |
| A7 | **Did *you* make this?** | Partner products sit in the same catalogue as own manufacture ([00-client-decisions.md](00-client-decisions.md) D3), the partner **cannot be named** ([00-client-decisions-2.md](00-client-decisions-2.md) E7), and the partner goods **carry the Вівчарик brand** ([00-client-decisions-3.md](00-client-decisions-3.md) F3) | A visible mark at equal weight on every product card and PDP: «Власне виробництво», or «Відібрано Вівчариком» + «Виготовлено карпатським майстром» / «Виготовлено іншим виробником»; an origin facet pinned to the top of the filter panel; homepage and brand surfaces showing own manufacture only | **Weakened by E7, and made more consequential by F3.** Still strong if stated first and still fatal if discovered — but the label carries no verifiable name while the brand name now appears on goods the brand did not make, so the label is the *only* thing distinguishing the two origins |

**A3 now has a definitive answer, and it is the most important finding in this document.**
[00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that a visitor may tour the
production floor **accompanied by Іван**, arranged in advance by phone. A3 is the category's primary
purchase anxiety: every other anxiety in this table is about the *object*, and A3 alone is about
whether the *seller* is who they say they are. Everything the site can do about it is a
representation — photographs, video, named stages, a named village — and a representation is exactly
what a reseller with a good camera also produces. That is why the anxiety survives good execution.

A tour is not a representation. It is the thing itself, and the person who owns it is standing in it.
Ranked against [01-brand-strategy.md](01-brand-strategy.md) §1.8's evidence hierarchy, which puts
video of the factory at position 1, this sits above the table entirely:

| Evidence | What the visitor must supply | Failure mode |
|---|---|---|
| Video of the factory (§1.8 position 1) | Trust that the footage is of *this* factory | A reseller can licence or stage footage. Unfalsifiable from a screen |
| Named stages, named village, named people | Trust that the names are real | Verifiable in principle, checked by almost nobody |
| **An owner-accompanied tour (G3)** | **Nothing. They verify it themselves, in the building** | Only one: **over-promising the access**. See below |

Three research consequences follow. First, the offer belongs where the anxiety peaks — the
production page's closing argument, the wholesale page's credibility block, and the About page's
people section, because the tour is *with a named person* and that is what makes it work. Second,
it does not scale and must never be described as if it does: no fixed times, no "open to the
public", no booking widget. A calendar implies capacity that a two-person business does not have,
and a visitor who arrives to a locked door has been converted from the project's best advocate into
its worst review — a strictly larger downside than the upside of looking more available. Third, and
counter-intuitively, the tour's *existence* does work even for visitors who will never take it up.
A seller who invites inspection is making a claim that is cheap to disprove and expensive to fake,
and that asymmetry is legible to a reader who stays at their desk in Kyiv.

**A6 is a competitive opening, not a defect to fix, and Round 5 widened it.** Вівчарик has no legacy
payment process to unwind. `{{PSP}}` is resolved to **WayForPay**
([00-client-decisions-2.md](00-client-decisions-2.md) E10), so the on-site card flow — order number
issued before payment, emailed receipt, no manager in the loop — already puts the site ahead of the
category norm on the single step where the category loses the most money. The before/after is drawn
in [05-user-flows.md](05-user-flows.md) §5.9.

**But the stronger answer to A6 is the one that removes the need to trust at all.**
[00-client-decisions-5.md](00-client-decisions-5.md) H1.2 confirms **«наложений платіж з оглядом»** —
COD with inspection at the Nova Poshta or Ukrposhta counter, Ukraine only, stocked items only. For a
cold-start brand this is the most valuable single mechanism available, and the reason is structural
rather than psychological:

- Every other trust device on this site asks the buyer to **believe something**: that the micron
  figure is accurate, that the photograph is of this workshop, that the return window will be
  honoured. All of them are assertions by a stranger.
- The inspection right asks the buyer to believe **nothing**. They see the goods before money
  changes hands. The seller's credibility is removed from the transaction entirely.

That is why it must be treated as a first-class trust element and not as a payment option: it is
stated plainly on the PDP trust row and at checkout step one, in the same visual weight as the
return window, not buried in a policy page. A buyer being asked for 5,000–15,000 UAH by a domain
that did not exist last year has one dominating question, and this answers it in a sentence.

Two limits must travel with the claim wherever it appears, because both are places where a
reasonable buyer's expectation will otherwise be broken:

| Limit | Consequence for the interface |
|---|---|
| **Ukraine only** (H1.2) | `en`, `pl` and `de` never see the option. It must not appear in shared copy blocks, translated policy pages or PDP trust rows for those locales — an EU buyer who reads about inspection and then finds card-only at checkout has been promised something |
| **Stocked items only** (H1.1) | Selecting a custom size withdraws it. The withdrawal is announced in the buy box at the moment of selection, with the reason attached, never at checkout |

**A7 is the anxiety this project created for itself**, and it is handled structurally:
`ProductOrigin` is a first-class enum, not a tag; `partnerRegion` carries what provenance is
permitted; `partnerName` stays null and is never rendered anywhere, including in markup and `alt`
text, because a populated-but-hidden field leaks. `manufacturer` is **omitted** from partner
goods' structured data rather than set to Вівчарик — asserting own manufacture on a resold product
is simultaneously a structured-data violation and a trust failure, and omission is the honest
alternative.

**A7's residual risk is now higher than the previous draft implied.** The disclosure is honest but
unverifiable, which means it depends entirely on the buyer's willingness to believe an
unsubstantiated statement from a brand they met five minutes ago. That is exactly the disposition
a cold-start brand cannot assume. R5 in §2.8 is therefore the highest-priority test in the
backlog.

**And F3 removes the last passive signal the buyer had.**
[00-client-decisions-3.md](00-client-decisions-3.md) confirms partner goods are sold under the
Вівчарик brand: `brand` is Вівчарик for both origins, and `manufacturer` is Вівчарик for own
manufacture and **omitted entirely** for partner goods — never set to Вівчарик. The structured data
is therefore honest, but structured data is not what a buyer reads. What a buyer reads is a
catalogue in which every item carries the same brand name, which means **the on-page label is now
the only difference they can perceive.** Before F3 a buyer might have inferred origin from
packaging, naming or presentation; after it, nothing but the label distinguishes the two, and a
label that is quiet is functionally absent. This does not change the design — it removes the margin
for error in executing it, and it is the reason R5 now carries the strongest claim on any pre-launch
research budget.

**Placement rule.** A1, A2, A5, A6 and A7 must be answerable **without scrolling past the purchase
panel on desktop and without opening an accordion on mobile**. The buyer is deciding while looking
at the price; an answer below the fold arrives after the decision. This rules out the
"Доставка і оплата" tab that template storefronts place fourth in a PDP tab strip.

**A8, locale-specific, and now with a recommendation on record.** Sheepskin and leather carry an
ethical objection in `de` that wool does not, and they also carry EU species-declaration paperwork
that wool does not. [00-client-decisions-2.md](00-client-decisions-2.md) E11 confirms that `en`,
`pl` and `de` are **transactional** locales — foreigners may order — and recommends launching
`de` and `pl` **wool-only**, enabling hide categories for EU destinations only once the
documentation position is confirmed.

That recommendation resolves the UX question as well as the compliance one. A wool-only EU
catalogue means the German visitor never encounters the material that triggers the objection, so
the by-product framing becomes a later problem rather than a launch-day one. `{{DE_FUR_POLICY}}`
is therefore no longer a design fork; it is a phased rollout with wool as phase one.

**Two new international anxieties that E11 creates** and that the checkout must answer before
payment, not after. One is now resolved and one is not.

| Anxiety | Status |
|---|---|
| *What currency am I actually charged in?* | **Still open.** WayForPay settlement is unconfirmed — if it settles UAH only, the checkout must say so where the price is shown, not in a footer |
| *Who pays customs?* | **Resolved — the buyer, in full** ([00-client-decisions-3.md](00-client-decisions-3.md) F4). The buyer pays shipping and all duties and import taxes; effectively **DAP**, delivered duties unpaid |

COD is domestic-only; card is the sole international method.

### A9 — the unpriced cost at the door, and why it is a research finding rather than a policy note

F4 confirms Nova Poshta, Ukrposhta and other carriers case by case, domestically and
internationally, with the buyer paying everything. The policy is completely normal for a shipper of
this size. The *user-research* problem is that it is invisible at the moment of decision.

An EU buyer completing a 9,000 UAH order is making a decision on a number the site showed them. The
carrier then presents an import VAT and duty bill at delivery — frequently 20–27% of declared value
plus a handling fee, and on a five-figure UAH order that is not a rounding error. Three things
happen at that point, none of them recoverable by the interface:

1. **The parcel is refused**, and the shop absorbs a return shipped from another country — the
   single most common way small cross-border shops lose money (F4).
2. The buyer experiences the charge as **something the seller concealed**, whether or not it was
   disclosed in a policy page, because a disclosure they did not read is indistinguishable from one
   that was not made.
3. The order was a gift, the recipient is asked to pay to receive it, and the purchase fails at its
   social dimension — [§2.2](#22-jobs-to-be-done) J6 exactly inverted.

**The design requirement, and it is not optional.** The statement appears on the international
checkout path **before the pay button**, in body text where it must be read, not in a collapsed
accordion:

> «Ціна не включає митні збори та податки країни призначення. Їх сплачує отримувач при отриманні.
> Сума залежить від країни та вартості замовлення.»

Localised properly per locale, not machine-translated. The persona cost of stating it is a small
number of abandoned international carts; the cost of not stating it is refused parcels, chargebacks
and a review that says the seller hid a fee. The first is a conversion line item, the second is a
reputation line item, and a cold-start brand cannot pay the second.

**A second consequence that is structural, not copy.** With multiple carriers chosen per order, the
checkout **cannot compute an international rate**. The recommended model is
**enquiry-then-invoice** — the customer submits the order, receives a quote, then pays (F4). For UX
this is a slower flow that is honest about being slow, and it is preferable to a flat-rate table
that overcharges easy destinations and loses money on hard ones. It also changes what the
international journey *is*: not a checkout, but a quotation with a payment at the end, and it must
be labelled as such from the first step rather than revealed at the last. **Free shipping never
applies internationally**, at any order value.

### A10 — the fortnight the buyer did not agree to

[00-client-decisions-4.md](00-client-decisions-4.md) G2 sets `{{MADE_TO_ORDER_DAYS}}` to **14**, and
attaches a binding qualification to it: the fourteen days are **production before dispatch**, not
total delivery time. Carrier transit is added on top.

This is a research finding rather than a copy note because the failure it creates is invisible at
the moment it is made. A buyer reading «14 днів» constructs a delivery date, because that is the
only number in the sentence and delivery is the only thing they care about. Nothing in the phrase
signals that it excludes shipping. The mismatch is then discovered on day fifteen, by which point
three things are simultaneously true: the customer has already paid in full (H1.1), the goods are
made to a size nobody else will buy so a refund is expensive, and the customer believes they have
been misled. That is the worst combination this site can produce, and it is produced by a missing
five-word clause.

| Where the number appears | Required construction | Why |
|---|---|---|
| PDP buy box, on selecting a custom size | «Виготовлення — 14 днів. Далі — доставка перевізником.» | The two clauses must be adjacent. A lead time stated without the transit clause is the defect |
| Checkout summary | Same construction, restated | The buyer re-reads the commitment at the moment of payment, which is where a 14-day wait is actually accepted |
| Confirmation email | **A date, not a duration**: «Очікувана відправка: 12 жовтня» | «Протягом 14 днів» is a memory test the customer will fail, and failing it produces a support contact on roughly day 11 |
| Order status | `IN_PRODUCTION`, distinct from `PACKING` | A customer who sees `CONFIRMED` for twelve days concludes the order is stuck. A status that names the weaving converts anxiety into anticipation, which is the emotionally correct state for a handmade purchase (G2) |

**The second-order finding.** A 14-day wait is not, on its own, a conversion problem in this
category — a buyer choosing a handmade textile to a bespoke size has already accepted that it does
not exist yet, and the wait is arguably part of what they are buying. The conversion problem is a
14-day wait that arrives **as a surprise**, and those are different defects with different fixes.
The mitigation is disclosure timing, not lead-time reduction, and any pressure to shorten the
stated figure for conversion reasons should be resisted: 14 days promised and 12 delivered is a
delighted customer, 10 promised and 12 delivered is a refund request.

### A11 — the return-shipping deposit, and why it is a genuinely new anxiety

[00-client-decisions-5.md](00-client-decisions-5.md) H1.3 introduces the one rule on this site that
a reasonable, honest, attentive buyer can read as dishonest. It is therefore analysed here as a
purchase anxiety in its own right rather than treated as a checkout detail.

**The mechanic.** On a Ukrainian COD-with-inspection order the buyer pays **both shipping legs
online at checkout**, before the parcel is sent. On acceptance at the branch the return deposit is
credited against the goods, so the COD amount is reduced by exactly that sum. On refusal the buyer
pays nothing further and the return leg is already funded.

**Why it is an anxiety and not merely a term.** The buyer meets it at the single most
suspicion-sensitive moment in the entire journey — on a first order, from an unknown domain, having
just been reassured that they may inspect before paying. The sentence that immediately follows that
reassurance asks them for money. The available misreading is short, vivid and wrong:

> "They want me to pay extra for permission to look at it."

Note what makes this worse than an ordinary fee objection. The deposit's *purpose* — deterring the
refused-parcel abuse that makes COD expensive — is a reason that implicates the buyer. Explaining it
in those terms tells a customer they are suspected, which is the one explanation that must not be
given. And the mechanism is genuinely unusual: buyers have no prior pattern for it, so they cannot
resolve the ambiguity from experience the way they resolve, say, a delivery charge.

**The mitigation is arithmetic, and only arithmetic.** Prose, percentages and reassurance all fail
here because they ask the buyer to reason about a rule; a worked example with their own numbers
lets them *see* the outcome instead. Required construction at checkout (H1.3):

> «Ви оплачуєте доставку в обидві сторони — {{FORWARD}} + {{RETURN}} ₴.
> Якщо ви залишаєте товар, {{RETURN}} ₴ віднімається від ціни: на пошті ви доплатите
> {{PRICE − RETURN}} ₴ замість {{PRICE}} ₴.
> Якщо не залишаєте — більше нічого не платите.»

Three properties of that block are load-bearing and none are stylistic. It uses the **buyer's own
figures**, not an illustrative example. It states the **accept case first**, because that is the
case the buyer intends and the case in which the deposit costs nothing. And it closes on the refuse
case with «більше нічого не платите» — the sentence that converts the deposit from a risk into a
cap. A customer who understands that their downside is bounded will proceed; a customer who does
not know what the downside is will not.

**What must never be done with it.** It must not be labelled «комісія», «збір» or anything that
belongs to the fee vocabulary — it is a deposit refunded by offset, and the word has to say so. It
must not be hidden in an accordion or a policy link, because a charge discovered late is
indistinguishable from a charge concealed (the A9 finding, applied domestically). And it must not
be defended by explaining the abuse it prevents.

**Locale scope, and it is a hard boundary.** This mechanic is **Ukraine only** (H1.3). It is
forbidden for `en`, `pl` and `de`, where the EU Consumer Rights Directive grants an unconditional
14-day right of withdrawal and a trader may not require a deposit against exercising it.
International orders remain card-only, with the buyer paying outbound shipping and all customs
charges (F4), and returns handled under each locale's withdrawal policy rather than pre-collected.
The research risk this creates is internal rather than external: shared checkout copy is the most
likely place for a Ukraine-only rule to leak into an EU locale, and that leak is a legal defect
rather than a usability one.

**Recorded as a test.** Whether this block reads as fair is exactly the kind of question comprehension
testing answers cheaply and speculation does not. R15 in §2.8.

---

## 2.5 Competitive analysis — how these goods are sold today

### 2.5.1 Archetype A — the marketplace listing

**Pattern.** Keyword-stuffed title (`Ліжник вовняний 150х200 Карпати ручна робота натуральна вовна`).
Photographs including at least one reused from a supplier. Description is a specification dump.
Seller identity is a store name with a rating, not a business. Price is the primary comparison axis
because the marketplace sorts by it.

**Gaps.** (1) No provenance surface exists — the template has no field for "how this was made", so
even a factory owner cannot show it. (2) Identity is flattened: a manufacturer and a drop-shipper
render in the same card, the exact confusion [01-brand-strategy.md](01-brand-strategy.md) §1.1 names
as the category's root failure. (3) The stuffed title is the only content read, so the buyer's
mental model becomes dimension-and-price. (4) Nothing explains why a lizhnyk costs five figures.

### 2.5.2 Archetype B — Instagram and Facebook commerce

**Pattern.** Better photography than Archetype A, often with real workshop context. Price in the
comments or in DMs. No structured catalogue. Purchase is a conversation.

**Gaps.** (1) No searchable inventory — a buyer wanting 150×200 in grey cannot find out whether it
exists without asking, and asking has a social cost that filters out a large share of demand.
(2) No price transparency, which reads as "price depends on who is asking". (3) Zero SEO and zero
AI-retrievability, a compounding loss ([30-ai-search-optimization.md](30-ai-search-optimization.md)).
(4) Trade buyers will not open a DM thread to establish MOQ. (5) No post-purchase artefact,
therefore no defence against A4.

**Note for this project specifically — reversed by Round 2.** The previous draft treated Instagram
as a *launch channel* as well as a competitor archetype. It is not:
[00-client-decisions-2.md](00-client-decisions-2.md) E3 confirms **the owners run no social
accounts at all.**

That has two opposite-signed consequences and both are real:

| | |
|---|---|
| **Cost** | Every competitor in this archetype has an audience and Вівчарик has none. The site cannot rely on a pre-warmed visitor, and it loses the cheapest available proof-of-life signal — a feed with recent dates on it |
| **Opportunity** | The archetype's gaps are unaddressed by its own practitioners. A structured, searchable, priced, transactable catalogue beats a DM thread for every persona in §2.3, and that advantage does not require a following to realise |

**Round 4 supplies a partial substitute for the missing feed, and it is physical.** Gap (5) above —
no post-purchase artefact — is the one gap in this archetype that Вівчарик can close without a
social account, because [00-client-decisions-4.md](00-client-decisions-4.md) G4 confirms a card
already ships in every parcel. A card in the hand of someone holding the product is a stronger
prompt than a story impression, and unlike a feed it reaches the counter-sale buyer who never had a
digital touchpoint at all. It does not replace what a feed does for *acquisition*; it replaces what
a feed does for *return*, which is the cheaper half to buy and the half this project can afford.

The adjacent family business runs `@fabryka_shkur` successfully, so the capability exists within
the family. E3 records creating an account before launch as a **recommendation**; this document
does not assume one exists, and no journey, persona or metric below depends on it.

### 2.5.3 Archetype C — the template independent store

**Pattern.** A licensed Ukrainian e-commerce template: sidebar filter, tabbed PDP, a three-banner
rotating hero, a "Хіти продажів" carousel, a twelve-column footer, frequently a red discount ribbon
and a countdown timer. Usually single-locale.

**Gaps.** (1) Template signature — the visitor has seen this layout on thirty unrelated stores,
which communicates "someone bought a template" and contradicts a craftsmanship claim. (2) The
rotating hero buries the strongest asset behind two banners nobody sees. (3) Discount theatre caps
the achievable price point and is explicitly forfeited in
[01-brand-strategy.md](01-brand-strategy.md) §1.9. (4) Tabbed PDP hides delivery, returns and
composition. (5) Locale switching drops the visitor on the homepage instead of the translated
equivalent of the current page — addressed in
[03-information-architecture.md](03-information-architecture.md) §3.5 and
[04-sitemap.md](04-sitemap.md) §4.9. (6) Heavy unoptimised heroes, which is why the Performance
target here is competitive advantage rather than vanity.

### 2.5.4 The adjacent business as a worked example

`fabryka-shkur.com.ua` is a **separate business belonging to the client's wife** and stays online
([00-client-decisions.md](00-client-decisions.md) D2). It is not a predecessor and carries no
authority here. It is useful as a fully documented worked example of this category's failure modes,
and of two things worth copying:

| Lesson | Direction |
|---|---|
| Manual transfer to a personal card, manager consultation mandatory | **Avoid.** See A6. |
| Size used as a subcategory (`150х200см`, `200х220см`) | **Avoid.** Size is a facet ([03-information-architecture.md](03-information-architecture.md) §3.3.3) |
| A free-shipping threshold far above typical order value | **Avoid.** A benefit nobody earns is a reminder that shipping costs extra |
| Descriptively named products (Ліжник «Мозаїка», Плед «Золото Карпат») | **Copy.** Named products are a brand asset and a memorability asset, and memorability matters more than usual when early traffic is social rather than search |
| A real physical address with Sunday opening | **Copy the address as a destination; do not copy the published hours.** Вівчарик's hours vary day to day and Google Maps is the live source (E3). Publish «Графік гнучкий — телефонуйте перед візитом» with Іван's number first and Любов's as the fallback ([00-client-decisions-4.md](00-client-decisions-4.md) G1), and omit `openingHours` from JSON-LD. Вівчарик's version of this asset is **stronger than the one being copied twice over**: shop and production share one address ([00-client-decisions-3.md](00-client-decisions-3.md) F2), and the production floor is **visitable with the owner** (G3). The adjacent business publishes an address; Вівчарик can publish an invitation |
| Care guide, gallery and reviews as first-class pages | **Copy the idea, build fresh.** Text, articles and reviews are never copied ([00-client-decisions-2.md](00-client-decisions-2.md) E5) |

**Prom.ua branding must not appear anywhere in the new experience**
([00-client-decisions.md](00-client-decisions.md) D2).

### 2.5.4b The adjacent business is now also a *source* — and therefore a competitor

[00-client-decisions-2.md](00-client-decisions-2.md) E5 permits reusing its products and
photographs. Since `fabryka-shkur.com.ua` **stays online**, this creates a research-relevant
hazard that no persona can see but every one of them is affected by: two live sites with the same
content competing for the same queries, one of which has zero authority.

| Asset | Rule |
|---|---|
| Product descriptions | **Rewrite every one.** No sentence verbatim. A real content workload, not a formatting pass |
| Product names | Rename where they overlap — and rename *upward*: «Ліжник Яворівський» is both distinct and a brand asset (§1.2b) |
| Photographs | Reuse permitted. Re-crop, re-grade to the [01-brand-strategy.md](01-brand-strategy.md) §1.6 art direction, strip EXIF, rename semantically, author new per-locale `alt`. Identical images are a weaker signal than unique ones but are not penalised the way duplicate text is |
| Blog, care guides, reviews | **Never copied.** Reviews in particular were given to a different seller |

The UX consequence is a content-sequencing one: the catalogue cannot launch faster than the
rewrite, so the roadmap must budget writing time it previously budgeted photography time for.

### 2.5.5 The composite gap

No observed competitor does all five of: publishes manufacturing evidence, publishes structured
specifications, accepts payment online without a human in the loop, serves trade as a distinct
qualified path, and ships four genuinely equal locales. Each is individually achievable. Doing all
five is the position. Confidence: HIGH on the observation, MEDIUM on it remaining true for the life
of the build.

---

## 2.6 Accessibility research — the 60–75 segment

The audience runs to 75 ([08-design-system.md](08-design-system.md) §8.2, principle 3). At least one
persona sits squarely above 60. This is a primary design constraint, not a minority accommodation.

| Change with age | Consequence on a website | Concrete implication | Canonical reference |
|---|---|---|---|
| Reduced contrast sensitivity | Low-contrast grey-on-cream becomes unreadable before it becomes *noticeably* faint, so the user blames themselves | AA is the floor. `stone-500` banned for body text; `gold-600` banned as small text | [09-color-palette.md](09-color-palette.md) §9.3, §9.5 |
| Reduced accommodation; presbyopia near-universal past 50 | Small text is not "harder", it is skipped | 16 px minimum body text everywhere including admin; `rem` units so OS scaling works; layout survives 200% zoom | [10-typography.md](10-typography.md) §10.3, §10.8 |
| Reduced fine motor precision; higher tremor incidence | Small or adjacent targets cause mis-taps, and a mis-tap in checkout abandons a five-figure order | 48 px primary targets, 44 px floor, ≥8 px separation | [11-spacing-system.md](11-spacing-system.md) §11.7 |
| Slower visual search; narrower useful field of view | Dense navigation is scanned linearly, not in parallel; wide mega-menus perform badly | Nav breadth capped at 12 per panel with visual grouping; 3-click depth budget | [03-information-architecture.md](03-information-architecture.md) §3.8 |
| Lower tolerance for hidden state | Hover-only affordances and icon-only controls are not discovered | No hover-only affordance; every storefront icon control carries a visible text label; mega-menu opens on click | [08-design-system.md](08-design-system.md) §8.2 |
| Higher susceptibility to motion discomfort | Parallax and large-travel reveals can cause genuine nausea | `prefers-reduced-motion` with a *designed* alternative per pattern | [13-motion-system.md](13-motion-system.md) §13.6 |
| Working-memory load across multi-step processes | A checkout that re-asks at step three what it asked at step one causes abandonment | Linear checkout, persistent summary of prior answers, back navigation never destroys data | [05-user-flows.md](05-user-flows.md) §5.8 |

### Five implications that are easy to get wrong

1. **Placeholder-as-label fails this segment hardest.** The label disappears exactly when the user
   looks away to read a number off a physical card. Banned in
   [08-design-system.md](08-design-system.md) §8.6. Confidence: HIGH — a documented defect.
2. **"Clean" minimalism and accessible design diverge on affordance.** A borderless input on a
   tinted background is the fashionable choice and the wrong one here. Inputs carry a visible
   `stone-300` border at rest. The premium register is carried by whitespace, photography and
   typography, never by removing the visible edges of controls.
3. **Error recovery matters more than error prevention.** This segment makes errors at the same rate
   but recovers more slowly. Errors appear instantly and without motion
   ([13-motion-system.md](13-motion-system.md) §13.11), name the field, state the fix, and the field
   keeps its value.
4. **The mascot must not become a comprehension dependency.** The sheep is now brand-core
   ([00-client-decisions.md](00-client-decisions.md) D2), which raises the risk that it starts
   carrying meaning — an empty state that only shows a sheep, a loading state with no text. The
   §1.7 rule that it is absent from PDP, cart, checkout and wholesale is also an accessibility rule:
   every state it appears in must be fully understandable with the mascot removed.
5. **The return-shipping deposit is a working-memory problem before it is a trust problem.** The
   §2.6 row on multi-step working-memory load applies to it directly: the buyer is asked to hold
   three numbers and a conditional — forward leg, return leg, product price, and "the second one
   comes off the third if you accept". That is more state than this segment should be asked to
   carry, and more than *any* segment carries reliably while entering a delivery address. The
   mitigation in A11 — show the arithmetic already computed, with the accept case stated first —
   is therefore an accessibility requirement as much as a trust one, and «більше нічого не платите»
   is doing accessibility work: it terminates the calculation. Confidence: HIGH that computed
   numbers outperform a stated rule; MEDIUM on the specific wording, which R15 tests.

### What was not researched, and should be

No screen-reader testing, no testing with users over 60, no assistive-technology inventory for the
Ukrainian market. WCAG conformance is a proxy for usability, not a substitute. Recorded as R4.

---

## 2.7 Device and context expectations by audience

No first-party analytics exist and none will for months. This table is an explicit hypothesis to be
replaced by measurement (§2.8 R1).

| Audience | Expected mobile share | Network context | Session pattern | Design consequence |
|---|---|---|---|---|
| Tourist / gift | 70–85% (LOW) | Mountain mobile data, hotel wi-fi, intermittent | Short, interrupted, resumed — and a meaningful share of sessions are **post-visit**, days to months after an in-person purchase in the Яворів shop (F2) | Cart survives a multi-day gap **on the same device only** — with no accounts (E12) a device change loses the cart, which raises the value of `{{CART_TTL_DAYS}}` being generous; hero usable with video blocked; `saveData` respected; Maps-to-site handoff must land on a page that proves the place. For the post-visit arrival the same pages must **confirm a place already seen** rather than argue for it — same photographs, same two names, same address. The return trigger is the **printed card** ([00-client-decisions-4.md](00-client-decisions-4.md) G4), not memory, which makes the short URL and QR code the only device-independent continuity mechanism this site has |
| Family home textiles | 55–65% at discovery, lower at purchase (LOW) | Home broadband | Multi-session, multi-tab comparison | Persistent cart via `Cart.token`; deep-linkable filtered URLs so a comparison tab survives; filter state never trapped in memory |
| Trade / dropship | 15–25% (MEDIUM — B2B research is desktop-dominant) | Office broadband | One long session, then a form | Desktop-first wholesale layout; downloadable capacity and price sheet; dense form that still works at 320 px |
| Needleworker | 40–55%, elevated tablet share (LOW) | Home broadband | Repeat, habitual | **Reorder runs through the guest order-lookup page only** — order number plus email, per E12; there is no order history and no account to reorder from. Address prefill comes from a first-party cookie on the same device. Larger default type tolerance. No dye-lot reference is carried, because lots are not tracked (E8) |

**Three rules that hold regardless of how the numbers land:**

1. **Mobile-first is a constraint ordering, not a device preference.** The narrowest viewport forces
   the content-priority decision, which is then reused on desktop
   ([33-responsive-strategy.md](33-responsive-strategy.md)).
2. **The wholesale page is the one surface designed desktop-first**, because a capacity table, a
   specification grid and a multi-field qualification form are genuinely denser. It still works at
   320 px; it is simply not optimised there first.
3. **Cart and session persistence is a headline requirement, and guest-only checkout makes it
   more so.** At a four-to-five-figure price point with multi-session behaviour across all four
   personas, a cart that expires in 24 hours destroys real revenue — and with no accounts (E12)
   there is no server-side identity to recover it from. `Cart.expiresAt` is set to
   `{{CART_TTL_DAYS}}` (recommended 30); recovery is designed in
   [05-user-flows.md](05-user-flows.md) §5.11. The wishlist is `localStorage` only and must say so
   in the UI — «Збережено на цьому пристрої» — because a silently device-bound wishlist is
   discovered at the worst possible moment.

---

## 2.8 Post-launch research backlog

Ordered by the value of the decision unblocked. Sequencing is shaped by the cold start: anything
needing traffic volume cannot run before month four.

| # | Question | Method | Timing | Decision it unblocks | Cost |
|---|---|---|---|---|---|
| R1 | What is the real audience mix (`{{AUDIENCE_MIX}}`)? | GA4 + first-party event segmentation by entry channel, locale, material world, origin, and wholesale-page reach | Launch + 90 (volume-limited) | Homepage section order, nav order, next investment | Zero marginal ([31-analytics-architecture.md](31-analytics-architecture.md)) |
| R2 | ~~How big is the catalogue (`{{SKU_COUNT}}`)?~~ **Answered** — E5 resolves it to the migrated catalogue scope, several hundred to roughly a thousand | Confirm the exact figure at export | Phase 0, non-blocking | Nothing further. The faceting architecture already holds across that range | Zero |
| R3 | ~~Does the client track dye lots?~~ **Answered — no** ([00-client-decisions-2.md](00-client-decisions-2.md) E8) | — | Closed | The permanent disclosure ships as written in §2.3 Persona 4. `dyeLot` stays nullable and unused | Zero |
| R4 | Does the site work for a 68-year-old and for a screen-reader user? | Moderated testing, 5 participants aged 60+, plus one NVDA and one VoiceOver session on the four critical flows | Pre-launch if budget allows, else launch + 30 | Whether §2.6 accommodations suffice or a persistent text-size control is required | Medium |
| R5 | Does the partner labelling hold up **now that the partner cannot be named**? | Moderated comprehension test, 8–10 participants shown mixed listing pages, plus trade-lead loss-reason capture | **Promoted to pre-launch if any budget exists**, else launch + 30 | Whether «Власне виробництво» vs «Відібрано Вівчариком / Виготовлено іншим виробником» (E7) reads as honesty or as evasion. The wording under test is weaker than the wording this item was written for, so the risk went up and the timing should move in | Low |
| R6 | Which anxiety blocks purchase? | Exit-intent single-question survey on PDP and cart, dismissible, `uk` first | Launch + 60 | Whether A1–A7 are ranked correctly, and therefore what occupies the PDP trust row | Low |
| R7 | Do buyers understand «ліжник», «гуня», «ровниця» in `en`/`pl`/`de`? | `SearchQueryLog` zero-result and low-CTR analysis ([25-database-schema.md](25-database-schema.md) §25.9) plus first-click testing, 8–12 participants per locale | Launch + 90 | Whether the gloss-led labelling in [03-information-architecture.md](03-information-architecture.md) §3.4 holds | Low for logs, medium for testing |
| R8 | Is Google Business Profile actually carrying the traffic? | GBP insights: views, direction requests, calls, site clicks, against site sessions. **Verify the profile against the E4 checklist first** — name, address byte-for-byte, manufacturing category, website field, phone, Yavoriv photographs, verified ownership | Launch + 30, then monthly, with the E4 audit in **Phase 0** | Whether early marketing spend goes to local, to a new Instagram account, or to content. With no social channel this is *the* channel decision of the first two quarters | Zero — GBP is free |
| R8b | Does the phone carry more of the funnel than the site does? | Call volume to **Іван's primary and Любов's fallback number separately** ([00-client-decisions-4.md](00-client-decisions-4.md) G1) against site sessions and orders, plus a manual note on what callers ask — including **how many are arranging a workshop tour** (G3) | Launch + 30 | Whether the variable-hours, call-before-you-visit posture (E3) is converting or leaking, and whether the fallback number is ever reached — a fallback that carries a third of the calls means the primary is not being answered. A tourist business with no fixed hours resolves a real share of demand by voice, and that traffic is invisible to e-commerce analytics | Zero |
| R9 | Which informational articles earn the first organic sessions? | Search Console query and page report once indexed | Launch + 120 | The editorial calendar. On a cold-start domain the article set *is* the SEO strategy. | Zero |
| R10 | Why do trade leads not convert? | Structured loss-reason capture on `Lead.status = LOST` | Launch + 90 | Whether the wholesale page is missing information (a page problem) or the offer is uncompetitive (a business problem). Opposite fixes. | Low |
| R11 | Is the material/origin taxonomy right? | Open card sort, 15–20 participants in `uk` and one EU locale | Launch + 120 | Whether the tree in [03-information-architecture.md](03-information-architecture.md) §3.3 survives | Medium |
| R12 | Should the EU locales stay wool-only? | `de`/`pl` traffic and conversion on wool; count of enquiries asking for sheepskin or leather; the species-declaration and CITES paperwork position once researched | Launch + 120 | Whether E11's wool-only recommendation becomes permanent or phase one. Note this is now a *rollout* question, not a design fork | Zero marginal |
| R13 | Does the Yavoriv provenance claim register with buyers **where it is now placed** — beneath the headline rather than in it? | Comprehension testing on the hero **subline**, the PDP origin block and the §21.6 place section, in `uk` and one EU locale; plus branded-query volume for «яворівський ліжник» in Search Console. **The hero-variant test is withdrawn:** [00-client-decisions-3.md](00-client-decisions-3.md) F6 settles the tagline as «в Карпатах», so testing a «з Яворова» headline would be researching a decision that has been made | Launch + 90 | Whether the appellation argument in [01-brand-strategy.md](01-brand-strategy.md) §1.2b survives being demoted from headline to substantiation. F6's premise is that a reader who has scrolled will absorb a proper noun a headline reader would not; that premise is testable and currently untested | Low |
| R14 | How much demand does the **shop** carry, and does it convert into online orders? | Ask every in-shop buyer where they heard of the business and whether they know the site exists — a paper tally at the counter, not an instrumented flow. Against it: visit-intent events (`about_visit_intent`, `production_visit_intent`), direct and branded-search sessions, and orders shipping to addresses outside the region. **Add the card's short-link traffic** (G4), which is the one instrumented signal this channel produces | Launch + 60, then quarterly | Whether the offline-to-online path in §2.3 Persona 1 is real or assumed, and therefore whether the printed card, the sayable domain and the pickup framing deserve further investment. [00-client-decisions-3.md](00-client-decisions-3.md) F2 states this is worth measuring; it is also the only channel in §2.1 that produces **no** digital trace, so if it is not measured at the counter it is not measured at all | Low — a notebook and a question |
| R15 | Does the **return-shipping deposit** read as fair, or as a fee for the right to inspect? | Moderated comprehension test, 6–8 Ukrainian participants shown the live checkout block with real figures. Single question afterwards: "what will you pay, and when?" A participant who cannot answer has been failed by the copy. Backed post-launch by the COD funnel drop-off at the step the deposit is disclosed | **Pre-launch. It is the highest-value cheap test in this backlog** | Whether the H1.3 copy ships as drafted or is rewritten. This is the one rule on the site that can be misread as a hidden fee ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 4), and it sits directly in front of the payment method that otherwise resolves A6 outright — a badly worded block does not merely lose the deposit, it loses COD | Low |
| R16 | Do buyers understand that «14 днів» excludes carrier transit? | One comprehension question on the custom-size buy box — "when will it arrive?" — folded into R15's session at no extra cost. Post-launch: count support contacts about delivery date on made-to-order orders, which is the failure signal | Pre-launch with R15; then continuous | Whether the G2 construction «Виготовлення — 14 днів. Далі — доставка перевізником» is sufficient or whether the buy box must show a computed dispatch date instead of a duration. See A10 | Zero marginal |
| R17 | Does the workshop tour produce enquiries, and can that be known at all? | It mostly cannot — see [31-analytics-architecture.md](31-analytics-architecture.md) §31.13. The site can measure *intent* (tap-to-call from the tour block, `production_visit_intent`); only Іван can measure *outcome*, by asking each visitor how they heard about the tour. A tally of visitors per month, kept on paper, is the whole instrument | Launch + 60, then quarterly | Whether the tour offer justifies its placement as the production page's closing argument and the wholesale page's lead credibility element, or whether it is being read and ignored. **Do not build attribution for this**; the measurement cost would exceed the decision's value (G3 — it is an invitation, not a product) | Low — a tally |

**Sequencing rationale.** R2 and R3 are now **closed** by Round 2 rather than deferred — both were
answered by a conversation, as predicted. R5 moves up again, and this time to pre-launch if at all
affordable: E7 removed the partner name, so the label being tested is weaker than the one this
item was written for, and F3's brand ruling removed the last passive signal a buyer had, so the
label now carries the whole distinction on its own. R8 gains a Phase 0 audit component because with
no social channel the Google Business Profile is not merely the largest channel, it is close to the
only one — and F2 adds a specific check to it: **confirm the profile's primary category reflects
both retail and manufacturing**, because a manufacturer-only category suppresses "де купити ліжник"
intent while a shop-only category discards the manufacturing story. R13 is rescoped rather than
dropped: F6 decided the headline, so what remains testable is whether the *demoted* Yavoriv claim
still lands. R14 is new, costs a notebook, and measures the only channel that leaves no digital
trace at all. R4 still outranks R11, because an accessibility defect harms every persona at once
while a taxonomy defect harms discovery only.

**Round 5 reorders the top of this list.** R15 joins R5 as pre-launch, and if only one of the two
can be afforded, **R15 wins**. The reasoning is asymmetry of blast radius: R5 tests whether an
honest label reads as honest, and a failure there degrades trust in one product segment. R15 tests
whether the deposit block reads as a fee, and a failure there sits in front of **the payment method
that answers A6** — the single mechanism that lets a cold-start brand ask a stranger for 5,000–15,000
UAH. Losing COD to a badly worded paragraph loses the domestic funnel's strongest asset to its
cheapest defect. R16 rides along at no marginal cost, and R17 is included mainly to record that the
tour is deliberately *not* being instrumented, so that its absence from the dashboards is a decision
rather than an oversight.

---

## 2.9 Placeholder tokens

| Token | Meaning | Severity | Where used |
|---|---|---|---|
| `{{DOMAIN}}` | **`vivcharyk.shop`** — chosen, not yet registered ([00-client-decisions-7.md](00-client-decisions-7.md) K1). Blocks the branded email and the GBP website field | BLOCKER | Brand lockup, email, GBP, SEO setup |
| `{{AUDIENCE_MIX}}` | Measured session share per audience | HIGH | §2.7, R1; nav and homepage prioritisation |
| `{{WHOLESALE_RESPONSE_SLA}}` | **Resolved: 48 working hours** ([00-client-decisions-5.md](00-client-decisions-5.md) H2), published to the customer as «протягом 2 робочих днів». Quote validity 72 hours, 36 for one-of-one items. Still requires client confirmation before launch, because it is an operational commitment rather than a setting | MEDIUM | Wholesale page headline promise; Persona 3 |
| `{{MADE_TO_ORDER_DAYS}}` | **Resolved: 14** ([00-client-decisions-4.md](00-client-decisions-4.md) G2) — days of **production before dispatch**, transit on top | Resolved | A10; the custom-size buy box; `IN_PRODUCTION` |
| `{{CART_TTL_DAYS}}` | Cart lifetime. Recommended 30, and now more consequential — with no accounts (E12) the cart is the only continuity mechanism | MEDIUM | `Cart.expiresAt`, abandonment recovery |
| `{{INTL_CARRIER}}` | **Resolved as a model, not as a value** ([00-client-decisions-3.md](00-client-decisions-3.md) F4): Nova Poshta Global, Ukrposhta International and other carriers **case by case, quoted per order**. There is no single default to resolve to | MEDIUM — it is now a flow decision, not a missing fact | A4/A9 for the EU locales; the enquiry-then-invoice international path |
| `{{INSTAGRAM}}` | Unresolved, and **may never resolve** — no account exists (E3). Creating one is a recommendation, not a decision | MEDIUM | `sameAs`, footer. Every surface referencing it must render correctly when it is absent |
| `{{BRANDED_EMAIL}}` | No branded address exists. Interim public contact is `gif19601@gmail.com` (F5), which is usable as a mailbox and is a trust cost as a signal | HIGH | Contact page, GBP, Impressum |
| `{{TRANSACTIONAL_FROM}}` | **New, and a Phase 1 blocker.** Order confirmations, shipping notices and password-style mails must send from `no-reply@{{DOMAIN}}` with SPF, DKIM and DMARC configured. They **cannot** be sent from `@gmail.com` — such mail fails authentication and lands in spam or is refused (F5) | BLOCKER | Every transactional email; anxieties A4 and A6 |
| `{{LEGAL_ID}}` | ЄДРПОУ / РНОКПП for ФОП Гондурак Л. Ю. **Exists and will be supplied** (F1). Blocks only WayForPay onboarding, the offer contract and the German Impressum — **not a general blocker** | MEDIUM | Offer contract, German Impressum, PSP onboarding |

**Resolved by Round 2 and no longer tokens:** `{{SKU_COUNT}}` = the migrated catalogue, several
hundred to ~1,000 (E5, confirm at export); `{{PARTNER_NAMES}}` = **never** — partner names are not
published and `partnerName` is not rendered (E7); `{{DE_FUR_POLICY}}` = wool-only at launch for
`de` and `pl` on the E11 recommendation, hides enabled later subject to paperwork; `{{PSP}}` =
WayForPay (E10, integration details pending verification V6–V11); `{{FACTORY_ADDRESS}}` = вул.
Петруші, с. Яворів, Косівський район, Івано-Франківська область; `{{POSTAL_CODE}}` = 78644;
`{{LEGAL_ENTITY_NAME}}` = ФОП Гондурак Любов Юріївна.

Previously resolved: `{{YEARS_EXPERIENCE}}` = «понад 30» (editorial only), `{{CERTIFICATIONS}}` =
none. Referenced without redefinition: `{{RETURN_DAYS}}`, `{{BLOG_CADENCE}}`.

**Resolved by Round 3:** who pays shipping and customs = **the buyer, all destinations, effectively
DAP** (F4); partner-goods branding = **Вівчарик**, with `manufacturer` omitted for partner origin
(F3); the Яворів address = **shop and production together** (F2).

**Resolved by Round 4:** `{{MADE_TO_ORDER_DAYS}}` = **14 days of production before dispatch** (G2);
`{{FLOOR_VISIT}}` = **yes, guided by Іван, arranged by phone in advance** (G3); phone priority =
**Іван `+380679973450` primary, Любов `+380679604769` fallback**, with legal pages, the offer
contract and the Impressum naming **Любов** as the ФОП seller of record (G1); the post-purchase
artefact = **a business card already in every parcel** (G4).

**Resolved by Round 5:** payment methods = **online card (WayForPay) everywhere, COD with inspection
at the branch for stocked items in Ukraine only** (H1.2); made-to-order = **full online prepayment,
COD removed server-side** (H1.1); the return-shipping deposit = **Ukraine only, forbidden for `en`,
`pl` and `de`** (H1.3); `{{WHOLESALE_RESPONSE_SLA}}` = **48 working hours** (H2); international quote
ownership = **Гондурак Любов Юріївна** (H3); custom sizing = **per-product admin toggle, not a
category rule** (H3b); `{{INTL_CARRIER}}` = **all of them, selected per order** (H4).

**Still open and research-relevant:** how a custom size is **priced**
([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 1). Until it is answered the
custom-size buy box cannot display a price, and a price is required before prepayment — which
means the whole of A10's disclosure sequence has nothing to attach to. This is the one open item
in Round 5 that blocks a user-facing flow rather than a setting.

**Deliberately not a token: opening hours.** They vary day to day and Google Maps is the live
source (E3). No token, no `openingHours` in structured data, and one published sentence instead:
«Графік гнучкий — телефонуйте перед візитом», with both numbers. F2 does not change this — a shop
with a counter is still a workshop with variable hours, and the call-ahead line matters more now
that more people have a reason to drive there.
