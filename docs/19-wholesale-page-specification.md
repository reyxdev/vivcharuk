# 19 — Wholesale Page Specification

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **No enquiry form and no price list** (part 7). The page shows the −10% / −20% tiers, the 5-piece minimum, production photos and reviews; its calls to action are the phone, the messengers and «Перейти в каталог». The Lead-qualification and form sections below are superseded (§P7a).

Route: `/{locale}/opt` (`uk`), `/en/wholesale`, `/pl/hurt`, `/de/grosshandel` — per-locale slugs
per [25-database-schema.md](25-database-schema.md) §25.2.

> **Authority note.** Written against [00-client-decisions.md](00-client-decisions.md) and revised
> against [00-client-decisions-2.md](00-client-decisions-2.md), which is now the
> highest-authority source. Wholesale terms observed on `fabryka-shkur.com.ua` belong to an
> **adjacent business** (D2) and are treated here as market reference requiring confirmation for
> Вівчарик, not as settled policy. Every such item is flagged.
>
> Round 2 changes five things on this page: the location is **Яворів, not Вербовець** (E2) and
> becomes the hero's central claim; **partners can never be named** (E7), which rewrites the
> §19.11 tile; the **full cycle including hides is confirmed** (E6), which strengthens §19.7;
> **opening hours are variable** (E3) and are removed from the SLA block; and the `de`/`pl`
> locales are now **transactional** (E11), which converts §19.16 from a language question into a
> customs-and-species-declaration one.
>
> **Round 3 revises four of those and closes two open questions.**
> [00-client-decisions-3.md](00-client-decisions-3.md) is now the highest-authority document:
>
> | Round-3 ruling | Page consequence |
> |---|---|
> | F6 — the tagline stays **«в Карпатах»** | The hero subhead reverts. The Яворів verification argument **moves down one section**, into the credibility block, where it is stronger anyway. §19.6, §19.7 |
> | F2 — the Яворів site is a **shop as well as a production floor** | A wholesale buyer who can walk onto the floor is a materially stronger proposition than one who can only read about it. §19.7, §19.17 |
> | F3 — partner goods are sold **under the Вівчарик brand** | Closes open question 13. It raises the importance of the §19.11 tile label rather than lowering it. §19.11 |
> | F4 — the **buyer pays shipping and all customs**; international is quoted per order | §19.16 gains real terms in place of "we'll discuss it". `{{INTL_CARRIER}}` resolves to *multiple, quoted per order* |
> | F1 — `{{LEGAL_ID}}` **exists, pending delivery** | Rank 5 in §19.17 is a chase, not a blocker. It still blocks the offer contract, WayForPay and the German Impressum |
>
> The governing pattern behind F6, and the reason it costs this page nothing:
> **«Карпати» to be understood, «Яворів» to be believed.** The headline earns attention; the
> section beneath it earns trust. On a B2B page those two jobs are done by two different blocks
> that a buyer reads eight seconds apart, so the argument loses no force by moving.
>
> **Round 4 gives this page the one claim a competitor cannot answer.**
> [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that a visitor may tour the
> production floor **accompanied by Іван**, arranged in advance by phone. That is worth more here
> than on any other surface in the blueprint — see §19.7 — because a buyer placing a five-figure
> first order can verify the supplier *personally, before committing*, and almost no Ukrainian
> competitor in this category and **no marketplace reseller at all** can offer the same. G1 fixes
> the phone order to **Іван primary, Любов fallback**, without collapsing the role split in §19.17
> rank 6.
>
> **Round 5 closes this page's two largest process unknowns.**
>
> | Round-5 ruling | Page consequence |
> |---|---|
> | H2 — **48 working hours** to respond, **72 hours** quote validity, **36** for one-of-one items | `{{WHOLESALE_RESPONSE_SLA}}` is resolved. §19.15 is rewritten around it, including the under-promised customer wording «протягом 2 робочих днів» |
> | H3 — **Гондурак Любов Юріївна owns the international quote workflow** | §19.16 gains a named owner; `Lead.assignedToId` defaults to her account. Closes blocker B16 in [35-implementation-roadmap.md](35-implementation-roadmap.md) |
> | H4 — «всі» resolved as **all international carriers, chosen per order** | Confirms rather than changes F4. §19.16's enquiry-then-invoice model is the *consequence* of it, not a workaround for it |
> | H3b — custom sizing is a **per-product admin toggle** | §19.10 gains a boundary: consumer custom sizing and B2B custom production are different mechanisms with different lead times and must not be conflated |

## 19.1 What this page is actually for

Persona 3 in [02-ux-research.md](02-ux-research.md) §2.3 arrives with one question: *is this an
actual factory or a reseller with good photography?* A page that answers with capacity, a dated
photograph of the workshop, and a named manager is worth more than any discount table, because
the discount only becomes interesting once the supplier is believed.

Вівчарик has an unusually strong answer available. [00-client-decisions.md](00-client-decisions.md)
D1 confirms **continuous manufacturing since 1991–1992**, including industrial washing, combing,
spinning, weaving and sewing. For a B2B buyer, thirty years of uninterrupted production is a
stronger signal than any certificate, and D1 also confirms no certificates exist — so the
evidence has to be the machines, the floor, and the people.

> **Thesis:** a wholesale page does not sell products. It sells the confidence that a purchase
> order will be fulfilled on the date it was promised.

### The cold-start constraint this page must be designed around

[00-client-decisions.md](00-client-decisions.md) D2 changes what this page is for in the first
two quarters. There is no domain authority, no ranking history, and no migrated traffic. Nobody
will find this page by searching «оптом ліжники» in month two.

| Period | Where wholesale traffic comes from | What the page must therefore do |
|---|---|---|
| Months 0–6 | Google Business Profile, the existing offline customer base, outbound contact, trade fairs, Yavoriv's tourist footfall | Be a **landing page you can send someone to** — a URL in a Viber message, a QR code on a stand, a line in an email signature. It must make sense with zero prior context |
| Months 6–18 | Long-tail informational queries, growing brand search | Add organic entry; the page acquires internal links from blog articles per [22-blog-specification.md](22-blog-specification.md) |

**[00-client-decisions-2.md](00-client-decisions-2.md) E3 removes Instagram from that first row
entirely** — the owners run no social accounts of any kind. The months 0–6 channel set is
therefore **thinner than this document previously assumed**, and every remaining channel is one
where a human hands the URL to another human: a phone call, a stand, an email signature, a
conversation in the workshop.

That does not weaken the «a link you send someone» framing. It makes it the **whole** design
brief for the first two quarters. Concretely, three requirements harden from preferences into
constraints:

1. **The URL must be speakable.** `/opt` survives being read aloud down a phone line;
   `/optovym-pokupcyam` does not. The slug stays as specified.
2. **The page must stand completely alone.** No prior context, no homepage visit, no brand
   recognition. The credibility block (§19.7) carries the entire "who is this" job by itself.
3. **The catalogue PDF matters more than it did.** §19.12 argues for ungating partly on
   distribution grounds; with no social channel, a forwardable PDF is now one of the *only*
   artefacts that travels without the site. The ungating decision is reinforced, not merely
   retained.

A fourth, smaller point: Yavoriv's tourist footfall is a real B2B channel here, not only a retail
one. Gift-shop and hotel buyers visit craft villages deliberately, and a QR code in the workshop
pointing at `/opt` is a distribution mechanism that costs nothing and needs no domain authority.

The page is exempt from the sheep mascot. [00-client-decisions.md](00-client-decisions.md) D2
confirms the shepherd identity as the brand core, but the §1.7 exclusion list — no mascot on
PDP, cart, checkout, or wholesale — is explicitly upheld. This is a trust-critical surface.

## 19.2 Four lead types, and why one generic form fails all four

Four distinct B2B relationships. They differ in who holds stock, who holds the end customer, who
holds the design, and what the first reply must contain.

| # | Lead type | Holds stock | Holds end customer | Needs to see first | `LeadKind` |
|---|---|---|---|---|---|
| 1 | **Wholesale resale** — shops, traders, gift stores | Buyer | Buyer | Discount tiers, MOQ, lead time, packaging | `WHOLESALE` |
| 2 | **Dropshipping** — online resellers, no warehouse | Вівчарик | Buyer | Stock feed, per-order fulfilment, neutral packing, returns liability | `DROPSHIP` **(new)** |
| 3 | **Private label / custom** — brands, designers, OEM | Either | Buyer | What can be specified, minimum run, sampling cost, timeline | `PRIVATE_LABEL` |
| 4 | **HoReCa / interior contract** — hotels, spas, designers | Neither; it is a project | Nobody; it is an installation | Capacity for one large batch, batch colour matching, delivery on a fixed date | `WHOLESALE` + `businessType` |

Types 2 and 3 are **observed on the adjacent business, not yet confirmed for Вівчарик**. Type 3
is additionally supported by [00-assumptions.md](00-assumptions.md) D4. Both are specified here
because the page architecture must accommodate them from day one; whether each section publishes
at launch is a client decision recorded in §19.20.

**Why one generic form fails.** A "leave your details" form produces a lead with no qualifying
information, forcing the first reply to be a question rather than an answer. That is Persona 3's
named failure mode: four days lost, competitor quotes in the meantime.

The failures are type-specific, which is the stronger argument:

- Ask a **dropshipper** for estimated order volume and the question is unanswerable — they have
  sold nothing yet. The useful question is *what platform, and how many SKUs will you list*.
- Ask a **private-label** enquirer for a product list and they cannot answer either, because the
  product does not exist. The useful question is *what do you want changed about an existing item*.
- Ask a **HoReCa** buyer about discount tiers and it misses entirely. One order, one project,
  fixed date, and the lowest price sensitivity of the four. The useful question is *how many
  rooms, by when*.
- Only the **resale** buyer is served by a classic wholesale form, and even they will not fill it
  in before seeing an MOQ.

**The resolution is not four forms.** Four forms fragment the page, split the analytics, and make
the visitor self-classify before reading anything. The resolution is **one form whose first field
is a type selector**, progressively revealing three to five type-specific questions. One `Lead`
table, one endpoint, one SLA, four question sets.

## 19.3 The page's jobs, ranked

Ranked because when the page runs long, something gets cut, and the cut must not be arbitrary.

| Rank | Job | Served by | If it fails |
|---|---|---|---|
| 1 | Prove a factory exists, is 30 years old, and is running now | §19.7, factory video, dated photography | Nothing else is read |
| 2 | Let the buyer self-classify within one screen | §19.6 path selector | Irrelevant content, bounce |
| 3 | State commercial terms without requiring contact | §19.8 | The form becomes a price request; leads arrive unqualified |
| 4 | Capture a lead structured enough for the first reply to contain a number | §19.13 | Reply latency doubles ([02-ux-research.md](02-ux-research.md) §2.8 R5) |
| 5 | Separate own manufacture from partner goods before the buyer asks | §19.11 | The origin thesis collapses with the most valuable audience |
| 6 | Convince an international buyer they will be answered in their language | §19.16 | `en`/`pl`/`de` leads never start |
| 7 | Give a serious buyer something to take into an internal meeting | §19.12 | Deal stalls silently |

Job 5 is new and is a direct consequence of [00-client-decisions.md](00-client-decisions.md) D3.
It outranks the international path because a wholesale buyer who discovers resold goods after
signing is a lost relationship, not a lost lead.

## 19.4 Desktop wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SiteHeader (sticky, z-header)                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓ HERO — full-bleed video, forest-900 scrim gradient (09 §9.6) ▓▓▓▓▓▓▓ │
│ ▓ OVERLINE  ОПТ І ВИРОБНИЦТВО НА ЗАМОВЛЕННЯ                           ▓ │
│ ▓ H1        «Повний цикл. Одні руки.»        display-lg, cols 2–8     ▓ │
│ ▓ Sub       Понад 30 років виробляємо натуральні вовняні вироби       ▓ │
│ ▓           в Карпатах.                                    (F6)       ▓ │
│ ▓           Миття, чесання, прядіння, ткання, пошиття, вичинка шкур   ▓ │
│ ▓           — в одному цеху.                                          ▓ │
│ ▓ ┌ PATH SELECTOR, radiogroup, cols 2–11 ───────────────────────────┐ ▓ │
│ ▓ │ [ ОПТ ] [ ДРОПШИПІНГ ] [ ПІД ВАШИМ БРЕНДОМ ] [ ГОТЕЛІ/ДИЗАЙН ] │ ▓ │
│ ▓ └─────────────────────────────────────────────────────────────────┘ ▓ │
│ ▓ [ Завантажити прайс-лист ] accent   [ Подивитись виробництво ] ghost ▓ │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.7 CREDIBILITY — bg-alt                                               │
│  ┌──────────┬──────────┬──────────┬──────────┐  Pattern C numeric proof  │
│  │ понад 30 │{{CAPACITY│  повний  │ {{EMPLOY-│  (10-typography §10.5)    │
│  │  років   │_MONTHLY}}│   цикл   │ EE_COUNT}}│  NO certificate imagery  │
│  │виробництва│ /місяць │  6 етапів│  людей   │  (client-decisions D1)    │
│  └──────────┴──────────┴──────────┴──────────┘                           │
│  вул. Петруші, с. Яворів, Косівський район — магазин і цех в одному      │
│  місці. Приїздіть і подивіться.               (F2 + the F6 relocation)   │
│  ┌─────────────────────────┬─────────────────────────┐                   │
│  │ PHOTO 30-year-old loom  │ PHOTO sewing floor,     │ 16:9, radius-none │
│  │ or carder, still running│ machines + people       │ captions per locale│
│  └─────────────────────────┴─────────────────────────┘                   │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.8 OFFER — bg-page.  H2 Умови співпраці                               │
│  [ DISCOUNT TIER TABLE — обсяг / знижка / що ще входить ]                │
│  [ MOQ ] [ Строк виготовлення ] [ Упаковка ] [ Оплата ]  4 fact cards    │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.11 RANGE FOR BUYERS — bg-page                                        │
│  ┌ TAB / SEGMENTED: [ВЛАСНЕ ВИРОБНИЦТВО] [ПАРТНЕРСЬКІ ВИРОБИ] ────────┐ │
│  │ own-manufacture tiles carry the «Власне виробництво» mark          │ │
│  │ partner tiles: «Відібрано Вівчариком» + region. NEVER a name.      │ │
│  │ Equal visual weight. Own is the default tab.                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  назва / роздрібна вилка / опт від / шт. у коробі / строк                │
│  Yarn, rovnytsia and raw wool tiles show грн/кг, not грн/шт.             │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.9 DROPSHIPPING — inverted forest-900 (the ONE inverted section)      │
│  cols 2–6 four-step mechanics  │  cols 7–11 stock-feed diagram           │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.10 PRIVATE LABEL — bg-alt, asymmetric grid (11 §11.3)               │
│  spec list cols 2–7  │  image breaks right col 11 → bleed                │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.12 CATALOGUE — bg-alt.  [PDF spread]  │  [ Завантажити ] [ У Viber ] │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.13 FORM — 720px, 2-col on lg. One page, progressive reveal.          │
│  1 Тип співпраці ▸ 2 Компанія ▸ 3 Контакт ▸ ↯4 BRANCH ▸ 5 Повідомлення  │
│  [ Надіслати запит ]   SLA line directly beneath the button              │
├──────────────────────────────────────────────────────────────────────────┤
│ §19.17 TRUST — ФОП Гондурак Любов Юріївна · РНОКПП {{LEGAL_ID}} ·        │
│  two direct lines (Любов / Іван) · «графік гнучкий — телефонуйте» ·      │
│  factory-visit invitation · map · NO social row                          │
├──────────────────────────────────────────────────────────────────────────┤
│ SiteFooter                                                               │
└──────────────────────────────────────────────────────────────────────────┘
```

Range moves **above** dropshipping and private label, unlike a conventional B2B page. The reason
is job 5: origin transparency must be encountered before the buyer commits attention to a
specific commercial motion, not discovered afterwards.

## 19.5 Mobile wireframe

```
┌────────────────────────┐   Notes
│ ☰  Вівчарик        UK▾ │
│ ▓ HERO 78vh            │   poster frame only; video never loads
│ ▓ OVERLINE / H1 md     │   on mobile (§19.19)
│ ▓ «Понад 30 років…»    │
│ ▓ ┌─────┐┌─────┐       │   2×2 path grid, ≥48px targets,
│ ▓ │ ОПТ ││ДРОПШ│       │   arrow-key navigable
│ ▓ ├─────┤├─────┤       │
│ ▓ │БРЕНД││ГОТЕЛ│       │
│ ▓ └─────┘└─────┘       │
│ ▓ [ Прайс-лист ]       │
├────────────────────────┤
│ CREDIBILITY 2×2 stats  │   never 1×4 — a 4-row stack reads as filler
│ [photo swipe carousel] │
├────────────────────────┤
│ OFFER                  │   tiers become a stacked definition list,
│ │ від {{T1}}    −10% │ │   NOT a horizontally scrolling table
│ │ від {{T2}}    −15% │ │
│ │ від {{T3}}    −20% │ │
│ [MOQ][Строк][Пак][Опл] │   accordion, first item open
├────────────────────────┤
│ RANGE                  │
│ (•) Власне (  ) Партн. │   segmented control, own selected by default;
│ 1-col tiles            │   label is visible text, never a colour-only cue
├────────────────────────┤
│ DROPSHIPPING inverted  │
│ PRIVATE LABEL          │
│ CATALOGUE              │
│ FORM — single column   │   branch fields reveal in place, no step machine
│ TRUST + contacts + map │
├────────────────────────┤
│ [Написати][Подзвонити] │   sticky bar, z-sticky; appears once the
└────────────────────────┘   hero leaves view, hides over the form
```

## 19.6 Hero

**Headline.** [01-brand-strategy.md](01-brand-strategy.md) §1.5 assigns tagline #2 to this
surface: **«Повний цикл. Одні руки.»** Correct, because it is the manufacturing claim compressed
to four words, and the manufacturing claim is job 1.

**Subhead carries the approved proof, verbatim.**
[00-client-decisions.md](00-client-decisions.md) D1 approves one formulation and
[00-client-decisions-3.md](00-client-decisions-3.md) F6 confirms it stands unchanged; E6 completes
the stage list:

> Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.
> Миття, чесання, прядіння, ткання, пошиття, вичинка шкур — в одному цеху.

### The Яворів verification argument moves to §19.7, and loses nothing by moving

The Round-2 draft rebuilt this subhead around Яворів. [00-client-decisions-3.md](00-client-decisions-3.md)
F6 withdraws that: «Ні, напиши краще "в Карпатах".» The argument that supported it was sound and
is **not discarded** — it is relocated one section down, into the credibility block, where the
ruling explicitly permits it and where it works better.

The argument, restated so the relocation is understood rather than obeyed: a wholesale buyer's
first job is **supplier verification**, and their first action is to check whether the supplier is
where it says it is. «Карпати» cannot be checked — it is a mountain range spanning four oblasts
and several thousand sellers claim it, including every reseller and every dropshipper this page is
trying to be distinguished from. **«с. Яворів, Косівський район» can be checked in under a
minute**: it resolves on a map, it has a Google Business Profile, it has a Музей ліжникарства, and
it is documented as the centre of Hutsul lizhnyk weaving by sources that have nothing to do with
Вівчарик.

**Why moving it costs this page nothing, and arguably gains.** The hero and the credibility block
are eight seconds apart on a page a B2B buyer reads in full — this is not a retail visitor who may
never scroll. More importantly, the two blocks are doing different jobs, and the village was in
the wrong one:

| Block | Job | Right word |
|---|---|---|
| Hero subhead | Say what this business does, to a buyer who arrived from a pasted URL with zero context (§19.1) | **Карпати** — understood on first reading, in `uk`, `en`, `pl` and `de` alike |
| §19.7 credibility | Give that buyer something to verify, beside the photographs and the stat strip that corroborate it | **Яворів**, with the street and the postal code — a verification affordance, not a headline |

«Карпати» to be understood, «Яворів» to be believed. A verification claim placed in a headline is
being read by someone who is not yet verifying anything; placed in a credibility block, it is
being read by someone who is. The relocation puts the claim in front of the reader at the moment
they are actually checking, and it keeps the hero legible to a German buyer who has never heard of
the village.

Four constraints apply and are absolute:

1. The claim attaches to **manufacturing**, never to a company. «Компанія заснована 1992 року» is
   forbidden on this page and everywhere else (D1).
2. **No certificate, award, or anniversary imagery.** No seals, no ribbons, no "офіційно
   засвідчено". None exists, and a B2B buyer who asks for the certificate and receives nothing
   has been given a reason to disqualify the supplier.
3. `Organization.foundingDate` is **not** set to 1992 in this page's structured data. The
   30-year story lives in prose and in `description`, where it is editorial rather than
   machine-asserted (D1, [29-seo-architecture.md](29-seo-architecture.md)).
4. **The heritage status belongs to the craft, never to Вівчарик** (E2). This constraint now
   binds §19.7 rather than this subhead, since that is where the village is named, but it binds
   the page equally either way. «Село, яке називають столицею ліжникарства» is a statement about
   Яворів and is safe. Any wording in which Вівчарик
   is the subject of a heritage sentence — «наша спадщина», «внесено до реєстру» beside the brand
   name, a register reference in the credibility stat strip — is forbidden. A B2B buyer who checks
   a heritage claim and finds it belongs to the craft rather than the supplier has caught the page
   overstating, which is exactly the outcome constraint 2 is designed to avoid. The exact status
   and wording of the intangible-heritage inscription must be confirmed before any such reference
   is published at all (E13.4).

**«Вичинка шкур» is new in this line and is licensed by E6**, which confirms Вівчарик runs the
full process from raw material to finished goods including hides. It matters on this page more
than on any other: a B2B buyer reads the stage list as a capacity statement, and a tannery stage
performed in-house is a material difference in lead time and supply risk. It is subject to the
same photograph rule as every other stage — if tanning is claimed, tanning is in the credibility
photographs (§19.7).

**«Бельгійська технологія» must not appear anywhere on this page.** E6 strikes it: it was the
adjacent business's phrase. Borrowed technical vocabulary is the single easiest false claim to
make by accident on a B2B page, and a buyer who asks a follow-up question about it will get an
answer that does not match.

**Media.** A 12–16 s silent loop of the carding line or the looms. The poster frame is the LCP
element and is never animated on entrance ([13-motion-system.md](13-motion-system.md) §13.8).
Desktop only; suppressed under `saveData`, ≤4 cores, and `prefers-reduced-motion`.

**Path selector.** Four cards, not tabs. Selecting one scrolls to the form and pre-sets its type
field. It does **not** filter page content — hiding sections on a page whose job is proof would
mean a resale buyer never discovers the private-label offer they did not know they wanted.

## 19.7 Credibility block

Answers "factory or reseller" with evidence, per the trust ranking in
[01-brand-strategy.md](01-brand-strategy.md) §1.8. Under cold-start conditions (§19.1) this block
carries more weight than on any other page, because for most visitors it is their first contact
with the brand.

| Element | Content | Source | Status |
|---|---|---|---|
| Manufacturing age | «Понад 30 років виробництва» | [00-client-decisions.md](00-client-decisions.md) D1 | **Confirmed** |
| Full cycle | Named stages: миття, сушіння, чесання, прядіння, ткання/валяння, пошиття — **plus вичинка шкур** | D1, D3, [00-client-decisions-2.md](00-client-decisions-2.md) **E6** | **Confirmed, and now covers hides** |
| Capacity | `{{CAPACITY_MONTHLY}}` per month | [00-assumptions.md](00-assumptions.md) D5 | **Unconfirmed — must not ship as a guess** |
| People | `{{EMPLOYEE_COUNT}}` | A6 | Unconfirmed |
| Location | **вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644** | E2 | **Confirmed. The audit's Вербовець was the adjacent business.** Promoted in Round 3 — this block, not the hero, is where the village is named (F6) |
| What Yavoriv is | «Село, яке називають столицею ліжникарства» · Музей ліжникарства · щорічні пленери ліжникарства | E2 | Confirmed as a fact about the village; **never asserted about Вівчарик** |
| **Shop and floor together** | «Магазин і виробництво в одному місці — приїздіть і подивіться», with both numbers and the flexible-hours caveat | **F2** | **Confirmed in Round 3.** See below |
| **A tour of the floor with the owner** | «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» | **[00-client-decisions-4.md](00-client-decisions-4.md) G3** | **Confirmed in Round 4, and the strongest single item on this page.** A five-figure order can be placed after a personal inspection — see below |
| Old machinery photo | A carder or loom that is itself thirty years old, running | Shoot | Yavoriv shoot, descoped per E5 |
| Sewing floor photo | Machines running, at least one person in frame | Shoot | Yavoriv shoot |
| Tannery photo | Required **if and only if** the hide cycle is claimed in the subhead or stat strip | E6 self-policing rule | Yavoriv shoot |
| Certificates | — | D1 | **None exist. Never implied** |
| Heritage designation | — | E2 | **Вівчарик holds none. The craft may be inscribed; a company is not** |

### This block is where the village is named, and where the visit is offered

Two Round-3 rulings converge on this block and they reinforce each other.

**F6 relocates the verification claim here.** Per §19.6, the Яворів argument leaves the hero and
lands in this block, rendered as a line beneath the stat strip: «вул. Петруші, с. Яворів,
Косівський район». It is placed here because this is the block a supplier-verifying buyer is
reading when they open a second tab. «Карпати» to be understood, «Яворів» to be believed — and a
credibility block is, by definition, the place belief is being negotiated.

**F2 makes the claim checkable in person, not only on a map.**
[00-client-decisions-3.md](00-client-decisions-3.md): «Там знаходиться і магазин і виробництво.»
The Яворів site houses **retail and production together**, and for this audience specifically that
is worth more than it is on any consumer page.

| What the buyer can do | What it settles |
|---|---|
| Search the address | That the supplier exists where it claims to |
| Look at the photographs | That a floor and machines exist — subject to believing the photographs |
| **Walk onto the floor** | Everything at once, with nothing to take on trust |

Persona 3's stated question is *is this an actual factory or a reseller with good photography?*
([02-ux-research.md](02-ux-research.md) §2.3). Every other element in this block answers it with
evidence the buyer must accept from the supplier. A visitable production floor answers it with
evidence the buyer gathers themselves, which is the only category of proof a supplier with no
reputation, no certificates and no trade references can offer. A factory you can only read about
is a claim; a floor you can walk onto is proof.

Three consequences for this block:

1. **The invitation is stated here, not only in §19.17.** §19.17 renders it as a contact
   affordance beside the phone numbers. This block renders it as *evidence*, in the same visual
   group as the stat strip and the photographs, because that is what it is. The two are not
   duplicates; they are the same fact doing two different jobs, and they read from the same
   `Setting` so they cannot drift.
2. **It ships with the flexible-hours caveat and both numbers, always** (E3). Inviting a
   purchasing manager to drive into the Carpathians and then being closed converts the strongest
   item on the page into the most damaging one. «Приїздіть — графік гнучкий, зателефонуйте перед
   візитом» is the complete form, and no shorter version is permitted.
3. **It does not replace the photography dependency.** A buyer who cannot visit — which is most
   of them, and effectively all of the EU buyers E11 brings into scope — still needs the Yavoriv
   shoot. F2 adds a proof channel; it does not remove one.

### Round 4: the tour is materially stronger for this audience than for any other

[00-client-decisions-4.md](00-client-decisions-4.md) G3 upgrades F2's shop visit into something
categorically different: **the production floor may be walked, accompanied by Іван, by prior phone
arrangement.** That matters everywhere on the site. It matters most here, and the asymmetry is
worth stating precisely, because it determines how much space the item gets.

| | Consumer visitor | **Trade buyer** |
|---|---|---|
| What is at stake in the decision | One object, 5,000–15,000 UAH, recoverable | A first purchase order in five figures, a shelf commitment, and their own reputation with their own client ([02-ux-research.md](02-ux-research.md) §2.2 J3) |
| What the visit resolves | "Is this from here?" — largely resolved already by the shop | **"Will this supplier still be producing in March, at this quality, at this volume?"** — which photographs cannot answer at any budget |
| What they inspect | Products on a shelf | The floor, the machines, the state of the equipment, how many people are actually working, how the finished stock is stored, whether the place looks like a business or a hobby |
| Who they can ask | Whoever is at the counter | **The owner of production**, in the room, about capacity and lead times, with the equipment in view |
| The alternative on offer elsewhere | Other shops | Nothing comparable. See below |

**Why no competitor matches it.** The category's three archetypes
([02-ux-research.md](02-ux-research.md) §2.5) each fail this test structurally rather than by
oversight:

| Competitor type | Can they offer a floor visit? |
|---|---|
| Marketplace reseller | **No — there is no floor.** This is the definitional limit, and it is the whole reason the reseller's photography is good: it is the supplier's |
| Instagram/Facebook seller | Rarely, and unpredictably. The archetype's purchase model is a DM conversation; a purchasing manager will not open one to ask for a site visit |
| Template independent store | Sometimes, for the few that manufacture. But the offer is almost never made on the page, because a template has no block for it |
| **Вівчарик** | **Yes, with the owner, stated on the page.** A supplier who *publishes* the invitation has done something different from one who would grant it if asked |

That last distinction is the commercially useful one. Most manufacturers would allow a serious
buyer to visit if the buyer asked. Almost none say so before being asked, because saying so is a
costly signal: it is cheap if the floor is real and impossible if it is not. Publishing the
invitation is therefore doing work for the 95% of buyers who will never take it up, and that is
the argument for its placement in the credibility block rather than only in §19.17's contact
affordances.

**Where it goes and how it reads.** One line in this block, directly under the address and the
shop-and-floor row, in the same visual group as the stat strip:

> «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.»

Four rules govern it, and three of them are prohibitions (G3):

1. **«Разом із власником» is not decoration and may not be trimmed.** A self-guided walk is a
   courtesy; a walk with the person who runs production is a due-diligence meeting. For this
   audience it is the difference between the two that carries the value, and for Іван it is also
   the difference between a distraction and a sales conversation.
2. **Never a fixed time, never "open to the public", never drop-in.** A purchasing manager who
   drives into Косівський район on a published tour time and finds nobody there does not simply
   leave — they disqualify the supplier, and they do it at exactly the moment the page had won.
   The downside is strictly larger than the upside of appearing more available.
3. **No booking form, no calendar, at any phase.** It implies a staffed schedule that a
   two-person business does not have. On a B2B page the temptation is stronger than elsewhere,
   because forms feel more professional than phone numbers; resist it. A buyer who reaches the
   owner of production on the first call has learned more about the supplier than any calendar
   would have told them.
4. **It is stated in all four locales, unmodified.** An EU buyer will mostly not travel to
   Івано-Франківська область, and the invitation still works on them for the costly-signal reason
   above. What must not happen is a softened EU variant implying the trip is routine.

**One thing it does not fix.** The tour answers *existence* and *capability*. It does not answer
**capacity** — `{{CAPACITY_MONTHLY}}` remains this block's highest-value unknown, and a buyer who
has stood on the floor will ask the number with more authority, not less.

**The 30-year-old machine is the single best photograph on this page.** D1 says it plainly: with
no paperwork, the evidence is the equipment. A machine with three decades of wear, photographed
in use, is a claim a reseller physically cannot fake, and it substantiates the age statement in
the same frame.

**Photographs cannot be substituted with stock imagery.** A stock workshop is worse than no
photograph: a buyer who reverse-image-searches it and finds it in a stock library has been handed
a reason to disqualify the supplier. Every image carries a caption naming place and month,
authored per locale in `MediaTranslation.caption` ([25-database-schema.md](25-database-schema.md)
§25.4), tagged `MediaRole.PRODUCTION`.

**Nor with the adjacent business's photographs, which is a new and specific risk.**
[00-client-decisions-2.md](00-client-decisions-2.md) E5 permits reuse of `fabryka-shkur.com.ua`'s
image library, and that permission solves *catalogue* coverage — the range tiles in §19.11, the
PDF's product pages. It does **not** reach this block. E5 states the reason directly: the entire
positioning rests on showing **Yavoriv** production, and the reused photographs document a
different workshop in a different village. A credibility block captioned «с. Яворів» over a
photograph taken in Вербовець is a falsifiable claim on the page whose job is to be unfalsifiable,
and it is exactly the kind of thing a supplier-verifying buyer catches.

So the shoot is **descoped, not cancelled**: one or two days in Yavoriv covering factory, process,
machinery, people and place — not a full catalogue production. That is a materially smaller
dependency than the previous draft's, and it remains this page's hard blocker.

**The reused library carries three processing requirements before any of it ships**, per E5:
re-crop and re-grade to the art direction in [01-brand-strategy.md](01-brand-strategy.md) §1.6,
strip EXIF, rename files semantically, and author new `alt` text. Identical images across two
live domains are a weaker signal than unique ones; they are not penalised the way duplicate text
is, but on a page selling verification they should still not be pixel-identical to a competitor's.

**Capacity is the highest-value unknown here.** If the client cannot state a monthly figure, the
acceptable fallback is a bounded statement — «типове замовлення 200–500 одиниць, строк
{{LEAD_TIME_STOCK}}» — falsifiable and therefore still credible. Omitting the block is not
acceptable. Inventing a number is not legal.

## 19.8 The offer block

### Discount tiers

**Confirmed** ([00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 5). Two tiers, counted in pieces, applied automatically in the cart
([18-checkout-specification.md](18-checkout-specification.md) §18.10a):

| Tier | Кількість | Знижка |
|---|---|---|
| 1 | від 5 шт. | −10% |
| 2 | від 25 шт. | −20% |

The third tier and the "also includes" column (priority production, free delivery, samples) were
assumptions and are **removed**: free delivery contradicts F4 (the buyer pays all carriage), and
the others were never offered by the client. The page states the tiers as a plain table, with
the note that they apply automatically at checkout — no request needed.

A discount ceiling published without qualifying thresholds is not an offer — it is an invitation
to negotiate, and negotiation is the friction this page exists to remove. Either publish both
columns or publish neither.

### MOQ — a stated conversion problem

**Resolved: the wholesale minimum is 5 pieces** ([00-client-decisions-8.md](00-client-decisions-8.md) §L14) — the first discount tier. There is no
separate order-value minimum; `{{MOQ_VALUE}}` = none. The analysis below explains why stating
it matters and is kept for that reason.

This is a conversion problem, not a neutral omission, and the mechanism is worth naming. A buyer
comparing three suppliers against a shortlist deadline does not enquire in order to discover the
MOQ. They assume it is high, or that finding out costs an email round-trip, and they enquire with
whoever published it. The absence produces no enquiry, not a cautious one. Under cold-start
conditions this is worse still: the visitor has no brand familiarity to offset the friction.

**Recommendation: state an MOQ, and state a low one.**

| Option | Form | Effect |
|---|---|---|
| **A. Value-based minimum** | «Мінімальне замовлення {{MOQ_VALUE}} грн» | **Recommended.** One number covering the whole catalogue without a per-item table; self-adjusts across families priced from socks to lizhnyks |
| B. Unit minimum per family | «від 10 шт. у позиції» | Precise, but needs a per-family table someone must maintain, and it breaks for the three by-weight categories |
| C. «Без мінімального замовлення» | Genuinely none | Strongest conversion signal available, and plausible for a workshop of this size. If the business will ship one wholesale-priced item, saying so is an advantage almost nobody in the category has |

Option C must be tested with the client before A is assumed.

### Lead times and packaging

| Fact | Value | Note |
|---|---|---|
| In-stock dispatch | `{{LEAD_TIME_STOCK}}` working days | |
| Made-to-order | `{{LEAD_TIME_MADE_TO_ORDER}}` working days | Aligns with `Product.madeToOrderDays` (§25.3), **resolved to 14 days of production before dispatch** ([00-client-decisions-4.md](00-client-decisions-4.md) G2). Carrier transit is added on top and must be stated separately — «14 днів до дверей» is wrong on the consumer path and is a contract dispute on a B2B one |
| Private label | `{{LEAD_TIME_PRIVATE_LABEL}}` days **from sample approval** | Sampling time stated separately — conflating them is how deadlines get missed |
| Packaging | Individual polybag + master carton, `{{UNITS_PER_CARTON}}` per family | A retail buyer needs carton counts to plan shelf space and freight |
| By-weight goods | Sold and shipped by kilogram | Пряжа, ровниця, вовна для рукоділля (D4). Carton counts are meaningless here; state kg per sack instead |
| Neutral packaging | Available for dropship and private label | Stated explicitly; resellers assume it is unavailable unless told |

Lead time outranks price for Persona 3. It therefore appears in this block, in the form's
confirmation state, and in the first reply email — three placements, one number, no variation.

**The consumer custom-size path is not this page's made-to-order path, and the two must not be
quoted from the same number.** [00-client-decisions-5.md](00-client-decisions-5.md) H3b introduces
`Product.allowsCustomSize` as a per-product admin toggle: a retail buyer selecting «Свій розмір»
triggers a 14-day production run, prepaid in full, on a single unit. That is a retail mechanism with
a retail price and a retail lead time. A trade buyer asking for a non-standard size across 200 units
is a **production run**, priced and scheduled as one, and `{{LEAD_TIME_MADE_TO_ORDER}}` on this page
is that figure — not the consumer 14.

| | Consumer custom size (H3b) | B2B custom production |
|---|---|---|
| Trigger | «Свій розмір» in the PDP size selector, where `allowsCustomSize` is on | An enquiry, with a specification |
| Quantity | One | A consignment |
| Lead time | 14 days of production before dispatch (G2) | `{{LEAD_TIME_MADE_TO_ORDER}}`, quoted per order |
| Price | Open — see below | Quoted |
| Payment | Full online prepayment, COD removed server-side (H1.1) | Proforma invoice, bank transfer |

Conflating them produces the one failure this block exists to prevent: a trade buyer reading «14
днів» on a consumer page, budgeting against it, and discovering that a 200-unit run does not
schedule like a single blanket. Where this page references made-to-order, it references its own
number.

**Still open and it reaches this page indirectly:** how a custom size is priced
([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 1). The consumer buy box cannot
display a price without it. This page is less exposed, because B2B custom work is quoted anyway —
but if the answer is a published per-square-metre rate, that rate becomes a B2B reference point a
buyer will hold the quotation against, and the two must then agree.

## 19.9 Dropshipping

Rendered on the **inverted surface** (`forest-900`,
[08-design-system.md](08-design-system.md) §8.3) — the single inverted section this page is
allowed — because it is a genuinely differentiated offer.

Mechanics, four steps: (1) ви отримуєте фід залишків і фото; (2) ви продаєте під своїм брендом;
(3) ми пакуємо і відправляємо вашому клієнту; (4) повернення обробляємо ми.

Step 4 closes dropshipping deals and is the step most suppliers omit. If the business will not
absorb returns, step 4 must say so plainly rather than be deleted — a dropshipper who discovers
the returns liability after their first refund does not place a second order.

**Qualification questions unique to this type** (branch fields in §19.13):

| Question | Field | Why |
|---|---|---|
| Де ви продаєте? | `platform` — Instagram / own site / Prom / Rozetka / OLX / other | Decides whether a feed, an API, or a spreadsheet is the right integration. Instagram stays an option **here** — E3 says Вівчарик has no account, not that its resellers do not |
| Скільки позицій плануєте розмістити? | `plannedSkus` | The meaningful volume proxy; monthly volume is unanswerable for this type |
| Потрібне нейтральне пакування? | `neutralPackaging` | Decides whether the arrangement is operationally viable at all |
| Хто спілкується з кінцевим покупцем? | `customerServiceOwner` | Pre-empts the most common dropship dispute |

**Two cautions, recorded rather than hidden.**

1. Dropshipping is observed on the adjacent business only. Whether Вівчарик offers it at launch
   is open (§19.20).
2. If offered, it must carry a **minimum retail price condition**. Dropshippers selling the same
   goods below the brand's own storefront price would destroy the premium positioning that the
   whole design language is built to support. If the client declines that condition, keep the
   section but move it below private label.

**Dropshipping applies to own-manufacture goods only.** Allowing a partner-manufactured item to
be dropshipped under a third reseller's brand puts three names between the maker and the buyer,
which is indefensible against the origin thesis in
[00-client-decisions.md](00-client-decisions.md) D3.

[00-client-decisions-2.md](00-client-decisions-2.md) E7 hardens this from a design principle into
an operational necessity. Partners **cannot be named**, which means Вівчарик cannot disclose to a
dropshipper who actually makes a partner item — and a dropshipper cannot answer their own
customer's "where is this made" without that answer. The chain becomes: an end customer asks a
reseller, who asks Вівчарик, who cannot say. That is not a disclosure problem to be managed; it
is a relationship that cannot be operated honestly at all.

The restriction is therefore stated **on the page**, in the four-step mechanics block, not
discovered in the first quotation:

> Дропшипінг доступний лише на вироби власного виробництва.

One sentence, early, in the section's own voice. A dropshipper who learns the scope at step one
either proceeds or leaves; one who learns it after building listings has been wasted, and tells
people so.

## 19.10 Private label and custom production

Supported by [00-assumptions.md](00-assumptions.md) D4 and observed in practice on the adjacent
business as «виготовлення виробів на замовлення: колір, розмір, довжина хутра». Rendered as a
specification list, not a paragraph.

| Specifiable | Constraint to state | Unknown |
|---|---|---|
| Колір | Dyed to sample or to reference | `{{DYE_MIN_BATCH}}` |
| Розмір | Any dimension within loom width | `{{MAX_LOOM_WIDTH}}` |
| Щільність / вага | Grams per m², pile density | `{{DENSITY_RANGE}}` |
| Композиція | Wool blends | `{{COMPOSITION_OPTIONS}}` |
| Довжина хутра | Shearing length, sheepskin only | — |
| Етикетка і бирка | Client artwork, sewn or hang-tag | `{{LABEL_MIN_QTY}}` |
| Упаковка | Neutral or client-branded | `{{PACKAGING_MIN_QTY}}` |

Private label is available **only on own-manufacture categories**. A partner-made item cannot
carry a third party's label through Вівчарик, and the page says so in one sentence rather than
leaving it to be discovered in negotiation.

[00-client-decisions-2.md](00-client-decisions-2.md) E7 supplies a second, harder reason. Private
label requires Вівчарик to warrant the manufacturing conditions, the composition and the
consistency of the goods a client is putting *their own brand name on*. Вівчарик can warrant that
for its own floor in Yavoriv. For a partner it cannot name, it can warrant nothing — not the
process, not the dye consistency, not the ability to repeat the run in six months. A brand owner
who discovers their label went onto goods from an undisclosed third party has a claim, and they
would be right to make it.

So the sentence on the page is unqualified and specific:

> Виготовлення під вашим брендом — лише на виробах власного виробництва.

The specifiable-attributes table above applies to own manufacture and to nothing else. This also
means `{{DYE_MIN_BATCH}}`, `{{MAX_LOOM_WIDTH}}` and the other constraint tokens are properties of
the Yavoriv floor, which makes them answerable — the client can measure their own loom.

The section must state the **sampling process** — cost, whether it is credited against the first
order, and duration. A designer or brand cannot get internal approval without a physical sample,
and their procurement asks about sampling terms first. An unstated sampling policy stalls more
private-label deals than an unattractive one.

Layout uses the asymmetric editorial grid ([11-spacing-system.md](11-spacing-system.md) §11.3). A
symmetric two-column block would read as a feature card, which under-sells a manufacturing
capability.

## 19.11 Product range, at a buyer's altitude — and the origin split

A buyer does not want a product grid. They want to know what families exist, what they cost at
wholesale, how they ship, and **who made them**.

### The origin split is a structural requirement, not a label

[00-client-decisions.md](00-client-decisions.md) D3 names the resale category as the single
biggest strategic risk in the project, and names wholesale buyers as the audience who will notice
first. That makes this page the primary enforcement point.

| Rule | Implementation |
|---|---|
| Own and partner goods are **never mixed in one list** on this page | A segmented control with two panels; own manufacture is the default panel |
| Own-manufacture tiles carry «Власне виробництво» | Driven by `Product.origin = OWN_MANUFACTURE` |
| Partner tiles carry «Відібрано Вівчариком» **plus an origin line** | «Виготовлено карпатським майстром» where `partnerRegion` is known, «Виготовлено іншим виробником» where it is not. **`partnerName` is never rendered** ([00-client-decisions-2.md](00-client-decisions-2.md) E7) |
| Both marks carry **equal visual weight** | Same type ramp, same position in the tile, same colour. E7 is explicit that the partner mark does not shrink |
| The distinction is **text**, never colour or icon alone | Required by [08-design-system.md](08-design-system.md) §8.2 and by the Accessibility 100 target |
| Wholesale enquiry form exposes an own-manufacture-only option | §19.13 branch field |
| Private label and dropshipping cover own manufacture only | §19.9, §19.10 |

### The partner cannot be named — which changes the argument, not the design

[00-client-decisions-2.md](00-client-decisions-2.md) E7 answers «Ні» to naming the partner
manufacturers, permanently. The previous draft of this section relied on naming them: «a factory
that also selects from **named** Carpathian makers is a more credible authority». That sentence
is withdrawn.

What replaces it is E7's own principle, which is stronger than it first looks: **being unable to
name the partner is a reason to be more explicit that the item is not own-made, not less.**

| Pressure | Why it must be resisted |
|---|---|
| Soften the mark, since there is now less to say | The mark's job is disclosure, not credit. Removing the supplier's name removes the *upside* of the disclosure and leaves the obligation untouched |
| Drop the partner panel and simply not offer partner goods at wholesale | Tempting, and wrong: the buyer will meet those goods in the catalogue and the storefront anyway. Omitting them here means the first time a B2B buyer encounters them is *after* a relationship exists |
| Use a vague region for everything («Карпати») | Invents specificity that does not exist. `partnerRegion` renders where it is known and the honest fallback renders where it is not |

**What survives, and why it is still a credential.** «Відібрано **Вівчариком**» is a selection the
brand signs in the first person. It says: we make these, we chose those, and we are telling you
which is which before you ask. For the B2B audience that is the more useful signal anyway — a
wholesale buyer is not evaluating the partner, whom they will never deal with; they are evaluating
**Вівчарик's willingness to volunteer an inconvenient fact**, which §19.17 ranks as the fourth
trust signal and the most valuable one available to a supplier with no reputation.

There is also a commercial honesty to it. A buyer who must know the origin of every line can tick
«лише власне виробництво» in the form (§19.13 field 9) and receive a quotation containing nothing
but own manufacture. That option is the real answer to the naming question: the buyer who cares
gets a catalogue they can fully account for, without anyone disclosing a supplier relationship
they agreed to keep private.

`partnerRegion` — «Косівщина», «Гуцульщина» — does most of the work the name would have done.
Regional provenance without a company name is still meaningful, still checkable as a region, and
still more than any competitor volunteers.

### Partner goods carry the Вівчарик brand — which raises the tile's importance, not lowers it

[00-client-decisions-3.md](00-client-decisions-3.md) F3 closes open question 13: «Так, продаються
під брендом Вівчарик.» Partner goods are sold under the Вівчарик name.

The reading to resist is that this simplifies the tile. On a B2B page it does the opposite, and
the reason is specific to this audience. A wholesale buyer is buying goods they will resell under
*their* customers' eyes, and the question they must be able to answer downstream is "who made
this". If every line in the catalogue carries one brand and only the label distinguishes them,
then the label is the entire mechanism by which a buyer can answer that question honestly to their
own customer. Removing or softening it does not tidy the page; it transfers a disclosure problem
onto the buyer, who will discover it at the worst possible moment — after the consignment has
shipped.

Selling another workshop's goods under your own brand is ordinary retail practice and entirely
legitimate. It sits in tension with [01-brand-strategy.md](01-brand-strategy.md) §1.2 — *the brand
sells verified origin* — because the brand name now appears on items the brand did not make, and
this page is the one place where that tension is resolved rather than managed. Nothing in the tile
changes. Everything in the tile now matters more:

| Rule | Status after F3 |
|---|---|
| Equal visual weight, same ramp, same position | **Unchanged.** Not softened |
| «Відібрано Вівчариком» as the partner overline | **Unchanged**, and now literally accurate in two senses — it names both the selector and the brand on the label |
| `partnerName` absent from the component's props | **Unchanged.** Still absent, not merely unused (E7) |
| `partnerRegion` rendered where known | **Unchanged.** Used where it exists; the honest fallback where it does not |
| Own manufacture as the default panel | **Unchanged** |

**Structured data.** The tile and the page's `Product` graph share a serialiser, and F3 fixes the
mapping:

```jsonc
// OWN_MANUFACTURE
"brand":        { "@type": "Brand",        "name": "Вівчарик" },
"manufacturer": { "@type": "Organization", "name": "Вівчарик" }

// PARTNER_MANUFACTURE
"brand":        { "@type": "Brand",        "name": "Вівчарик" },
// "manufacturer" omitted entirely — never set to Вівчарик, never set to the partner
```

`brand` is Вівчарик for both origins because that is the name the item is sold under.
`manufacturer` is set for own manufacture and **omitted** for partner goods — schema.org draws
exactly this distinction, and omission states the fact without asserting anything false. Setting
`manufacturer` to Вівчарик on a partner line would be a machine-readable claim of own manufacture
on a page whose rank-4 trust signal is volunteering exactly the opposite (§19.17), and it is the
kind of claim a buyer's procurement system can quote back.

### Tile anatomy

```
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│ [16:9 photo, radius-none]           │   │ [16:9 photo, radius-none]           │
│ ВЛАСНЕ ВИРОБНИЦТВО         overline │   │ ВІДІБРАНО ВІВЧАРИКОМ       overline │
│ ЛІЖНИКИ ВОВНЯНІ                  h3 │   │ ГУЦУЛЬСЬКІ КИЛИМИ                h3 │
│ ─────────────────────────────────── │   │ ─────────────────────────────────── │
│ Опт від {{WS_PRICE_FROM}} грн       │   │ Опт від {{WS_PRICE_FROM}} грн       │
│ У коробі {{UNITS_PER_CARTON}} шт.   │   │ Виготовлено карпатським майстром    │
│ Строк {{LEAD_TIME_STOCK}} днів      │   │ Косівщина                           │
│ Яворів, власний цех                 │   │ Строк {{LEAD_TIME_PARTNER}} днів    │
│ → Дивитись позиції                  │   │ → Дивитись позиції                  │
└─────────────────────────────────────┘   └─────────────────────────────────────┘

                                          region unknown → second line reads
                                          «Виготовлено іншим виробником»
                                          and the region line is omitted
```

Both overlines render in the same ramp, the same colour and the same position. The partner
overline is **not** set in `--text-muted`, is not smaller, and is not moved below the title — E7's
equal-weight rule is enforced in the component, not left to a design pass. `{{partnerName}}` does
not appear in this component's props at all, which is the cheapest way to guarantee it is never
rendered.

A distinct component (`features/WholesaleRangeTile`), **not** `ProductCard`. Reusing the consumer
card would import cart affordances onto a page that has no cart.

Families follow the confirmed D3 tree: **Вовна** (ліжники, ковдри, гуні, камізельки, подушки,
шкарпетки, капці, пояси, накидки, пряжа, ровниця, вовна для рукоділля), **Вироби з овчини**, and
**Шкіряні вироби**, with partner goods in the second panel. Wood is not shown — D3 confirms the
category is architecture-only and not launched.

**The three by-weight families need a different tile.** Пряжа, ровниця and вовна для рукоділля
are sold by kilogram (D4). Their tiles state грн/кг, minimum kg per order, and — if the client
tracks it — whether dye lots can be reserved across a repeat order. That last point is a genuine
differentiator for trade buyers supplying craft shops, and it is open question D6 item 3.

## 19.12 Price list and catalogue — ungated, and why

**Decision: ungated.** The PDF downloads without a form.

[02-ux-research.md](02-ux-research.md) §2.3 argues the opposite — gating makes the enquiry worth
submitting. That holds where the supplier is the scarce resource. It is wrong here, and the
cold-start condition makes it more wrong:

1. **The brand is new and unknown to the B2B market.** Gating works once the buyer already wants
   the document. A brand-new supplier gating a price list demands commitment before delivering
   any value, and the cost of closing the tab is zero.
2. **The catalogue is itself the credibility artefact.** A 24-page PDF with real photography,
   carton quantities, the origin split, and lead times *is* the proof the operation is real. It
   circulates internally, gets forwarded, and survives in an inbox for months. With no organic
   traffic for two quarters (§19.1), a forwardable artefact is one of the few distribution
   mechanisms the business actually has. Gating it is self-defeating.
3. **The lead it produces is worse.** A gate-generated lead is "someone who wanted a price list",
   indistinguishable from a competitor doing market research. A lead from a buyer who has already
   read the price list arrives knowing the numbers — which is the qualification the form is
   otherwise trying to manufacture.

**Mitigation:** a clearly secondary «Надіслати каталог у Viber / Telegram» control beside the
download, asking only for a phone number, framed as convenience rather than toll. It writes a
`Lead` with `kind = GENERAL`, `businessType = "catalogue_request"`. Conversion will be lower than
a gate. The trade is deliberate.

The catalogue must mark origin on every line item. A price list that silently mixes own and
partner goods reintroduces the exact problem §19.11 solves, in the one artefact that leaves the
site and cannot be corrected after the fact. The filename carries a version date so a stale price
list in circulation is identifiable.

## 19.13 The enquiry form, field by field

Mapped to `Lead` ([25-database-schema.md](25-database-schema.md) §25.8). Form rules per
[08-design-system.md](08-design-system.md) §8.6: visible labels above fields, 48 px height,
16 px text, errors below the field with `aria-live="polite"`.

### Common fields

| # | Label (`uk`) | Type | Req. | `Lead` field | Notes |
|---|---|---|---|---|---|
| 1 | Тип співпраці | Radio cards ×4 | Yes | `kind` | First field; drives the branch; pre-set by the hero path selector |
| 2 | Компанія | Text | No | `companyName` | Optional — a sole trader or new dropshipper may not have one, and requiring it filters out real leads |
| 3 | Ваше ім'я | Text | Yes | `contactName` | `autocomplete="name"` |
| 4 | Email | Email | Yes | `email` | `autocomplete="email"`, `inputmode="email"` |
| 5 | Телефон | Tel | Yes | `phone` | Required here, unlike consumer checkout — B2B replies happen by phone |
| 6 | Країна | Select | Yes | `country` | ISO code; defaults from locale (`pl`→PL, `de`→DE, `uk`→UA; `en` has no default) |
| 7 | Сайт або профіль | URL | No | `website` | Label says "or Instagram profile" — for many real resellers that *is* the shopfront |
| 8 | Зручний канал зв'язку | Chips: Телефон / Viber / Telegram / Email | Yes | *new* `preferredChannel` | Viber dominates domestic B2B contact |
| 9 | Цікавить | Checkbox: «лише власне виробництво» | No | `details.ownOnly` | Direct consequence of D3. A buyer who ticks it has told you their positioning in one click |
| 10 | Повідомлення | Textarea | No | `message` | Last, and optional. A required message field is where enquiries die |

### Branch fields by `kind`

| `kind` | Branch fields | Written to |
|---|---|---|
| `WHOLESALE` | Тип бізнесу (магазин / ринок / онлайн / готель / дизайнер); орієнтовний обсяг першого замовлення; категорії, що цікавлять | `businessType`, `estimatedVolume`, `interestedProductIds` |
| `DROPSHIP` | Де продаєте; скільки позицій; нейтральне пакування; хто веде кінцевого покупця | `businessType="dropship"`, `details` |
| `PRIVATE_LABEL` | Що змінити (колір / розмір / щільність / етикетка / пакування); тираж; чи потрібен зразок; бажаний строк | `businessType="private_label"`, `estimatedVolume`, `details` |
| HoReCa (`WHOLESALE` + `businessType="horeca"`) | Тип об'єкта; кількість одиниць; дата, до якої потрібно; узгодження кольору по партії | `businessType`, `estimatedVolume`, `details` |

A fifth implicit branch: if any selected category is пряжа, ровниця or вовна для рукоділля, one
extra question appears — «Потрібна однакова партія фарбування (dye lot)?» — writing
`details.dyeLotRequired`. This is the trade-buyer version of the needleworker requirement in D4,
and answering it wrongly generates returns.

### Required schema amendments to §25.8

| Change | Prisma | Why |
|---|---|---|
| **Add `DROPSHIP` to `LeadKind`** | `enum LeadKind { WHOLESALE DROPSHIP PRIVATE_LABEL PRESS GENERAL }` | Distinct routing, questions and economics |
| Add `preferredChannel` | `preferredChannel String?` | Determines *how* the SLA is met, not only whether |
| Add `details` | `details Json?` | Branch answers. Deliberately JSON: four question sets would add ~15 sparse columns of which any row uses four. Queryable fields (`kind`, `businessType`, `estimatedVolume`, `country`) stay first-class columns; only the type-specific long tail is JSON |
| Add `respondByAt` | `respondByAt DateTime?` | Computed at insert from the SLA; makes the overdue counter an indexed query rather than app-side date maths |
| Add `score` | `score Int?` | §19.14 |

Anti-spam is a honeypot plus a timing check, **never a CAPTCHA**. A CAPTCHA suppresses genuine
enquiries from exactly the older, less patient buyer this business wants, and is a liability
against the Accessibility 100 target.

## 19.14 Qualification logic

"Qualified" must be defined or `LeadStatus.QUALIFIED` degrades into a synonym for "replied to",
and the funnel metric in [01-brand-strategy.md](01-brand-strategy.md) §1.10 measures nothing.

**A lead is qualified when all four hold:**

1. It is a real business, or a stated intent to trade — company name, website, social shopfront,
   or an explicit description of the business.
2. It states a volume, a timeline, or a specification. Any one of the three.
3. It is reachable — the email delivers or the phone connects.
4. What it wants is something the factory actually makes, or knowingly resells.

Condition 4 now has two halves because of D3. A lead wanting 200 gunias is qualified; a lead
wanting 200 partner-made carpets is qualified *differently*, because margin, lead time and supply
risk all sit with a third party. The admin must be able to tell these apart before quoting, which
is what `details.ownOnly` and the category selection provide.

A lead meeting 1–3 but failing 4 is `LOST` **with a recorded reason**, and those reasons are the
merchandising signal described in [02-ux-research.md](02-ux-research.md) §2.8 R5.

**Automatic scoring** at insert, writing `Lead.score`. It ranks the inbox; it never rejects.

| Signal | Points |
|---|---|
| `companyName` present | +10 |
| `website` present and resolves | +15 |
| `estimatedVolume` above `{{MOQ_VALUE}}` | +20 |
| Branch fields completed | +15 |
| `message` over 120 characters | +10 |
| Arrived from `/production`, the catalogue download, or Google Business Profile | +15 |
| Free-mail domain, no company, no website | −10 |
| Submitted under 8 s after page load | −25 (bot signal) |

Score ≥50 surfaces at the top of the admin queue. A two-line enquiry from a hotel purchasing
manager scores 20 and may be the year's largest order — which is exactly why the rule is *rank,
never filter*.

## 19.15 Response-time commitment

**Resolved by [00-client-decisions-5.md](00-client-decisions-5.md) H2.** The client's answer —
«не зрозумів, але зроби сам дуже розумно» — delegated the decision, and the defaults chosen are
written to be safe for a two-person business rather than impressive to a buyer.

| Token | Value | Reasoning (H2) |
|---|---|---|
| `{{WHOLESALE_RESPONSE_SLA}}` | **48 working hours** | A two-person business with a factory to run cannot honestly promise same-day. 48 hours survives a busy week, a weekend and an illness |
| `{{QUOTE_EXPIRY_HOURS}}` | **72 hours** from issue | Long enough for a buyer in another timezone to decide over a weekend; short enough that carrier pricing and stock have not moved |
| One-of-one items | **36 hours** | Half the standard window. Holding a unique lizhnyk for three days against an unaccepted quote blocks a buyer who would pay today ([18-checkout-specification.md](18-checkout-specification.md) §18.23.7) |

**These are commitments, not settings, and both require client confirmation before launch**
([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 2).

Stated immediately beneath the submit button, repeated in the confirmation state and the
auto-reply:

> Відповідаємо протягом **2 робочих днів**, за київським часом (EET/EEST).

**The customer-facing wording deliberately under-promises.** H2 is explicit about the asymmetry:
48 working hours is the internal SLA and «протягом 2 робочих днів» is what the buyer is told. A
quote that arrives in four hours against a promise of two days is a pleasant surprise and a
supplier who has demonstrated exactly the operational reliability this whole page is arguing for. A
quote that arrives in fifty hours against a promise of twenty-four is a broken commitment on the
first interaction — the cheapest possible moment to lose a buyer who is comparing three suppliers.

**Why the published unit is days rather than hours.** «48 годин» invites the buyer to compute a
deadline in wall-clock time and then to notice that it fell on a Sunday. «2 робочих дні» is the
same commitment expressed in the unit the buyer's own organisation works in, and it cannot be
misread across a weekend — which is the ambiguity §19.15 exists to remove.

**Quote validity is stated on the quote, not on this page.** A 72-hour window printed beside the
submit button reads as pressure applied before anything has been offered
([01-brand-strategy.md](01-brand-strategy.md) §1.9 forfeits urgency mechanics). It belongs in the
quotation email, once, as a fact about that document: «Пропозиція дійсна до {{DATE}}». A one-of-one
item's shorter 36-hour window is stated with its reason attached — there is one of them — because
an unexplained shorter deadline reads as a tactic and an explained one reads as inventory reality.

**An expired quote is not a dead lead** (H2). It moves to a state the buyer can revive in one
click with a request for a fresh quotation, and the admin queue shows it as a lapsed opportunity
rather than as a failure. Building expiry without that path converts a follow-up into a dead end.

**The opening-hours line is removed.** The previous draft published «Пн–Пт 09:00–19:00 · Сб
10:00–17:00 · Нд 10:00–16:00», carried over from the family operation.
[00-client-decisions-2.md](00-client-decisions-2.md) E3 states that the hours are flexible and
differ day to day, and that Google Maps is the live source. Those hours were never Вівчарик's.

This is a real loss and it is worth naming rather than glossing. A stated response window is more
useful when the buyer knows *which hours* it is counted in — particularly a German or Polish
buyer in another time zone, which E11 now makes a real audience rather than a hypothetical one.

| Replacement considered | Verdict |
|---|---|
| Publish the most common hours anyway | **Rejected.** A missed SLA because the workshop was shut is a broken promise on the page whose entire subject is whether promises are kept. This section is about reliability; founding it on an unreliable input is self-defeating |
| Drop the time qualifier entirely — «протягом одного дня» | **Rejected.** Ambiguous across a weekend, which is exactly the ambiguity §19.15 exists to remove |
| **State the timezone, not the hours** — «протягом 2 робочих днів, за київським часом» | **Chosen.** A *working day* is a well-defined unit that does not depend on when the workshop opens, and naming EET/EEST gives the international buyer the conversion they actually need. It is checkable, it is honest, and it does not vary. H2 sets the count at two |

The visit-related availability sentence — «Графік гнучкий — телефонуйте перед візитом» — belongs
in §19.17 with the address and the factory-visit invitation, where it is about *visiting*, not
about response time. Conflating the two is what produced the original error.

The site must still agree with the Google Business Profile on name, address and phone — GBP is
the primary early channel (D2, E4), and a NAP mismatch is a local-SEO trust penalty as well as a
customer-service failure. On **hours** the site defers to the profile rather than duplicating it,
which is a consistency strategy rather than an absence of one.

**The previous draft recommended one working day. H2 supersedes it with two**, and the correction
is in the right direction: this document argued that the number must be one the business will
actually hit, and the client's own capacity — two people, a factory, variable hours — makes 48
hours the defensible figure. A published and missed SLA is worse than none, which is the whole
reason the tighter recommendation is not kept.

**Enforcement is operational.** `Lead.respondByAt` is set at insert to **submission + 48 working
hours**, not +48 elapsed hours — a Friday-evening enquiry is due Tuesday, and computing it in
elapsed time would breach the SLA before anyone had a chance to answer it. The admin dashboard
counts `status = NEW AND respondByAt < now()` and escalates
([23-admin-panel-architecture.md](23-admin-panel-architecture.md)). Quote records carry
`expiresAt` at issue + 72 hours, or + 36 where any line is `isUniquePiece`.

**The auto-reply is not a receipt.** It restates the submission, attaches the catalogue, names
the person who will reply, and gives their direct phone and Viber. A buyer holding a manager's
direct line has a supplier; a buyer holding a ticket number has a vendor.

## 19.16 The international path — `en`, `pl`, `de`

**[00-client-decisions-2.md](00-client-decisions-2.md) E11 upgrades this section.** International
orders are accepted — «Якщо іноземці хочуть замовити з України, то так, прошу» — so `en`, `pl` and
`de` are **transactional** locales, not informational ones. For B2B that was already half-true;
what changes is that the page must now answer customs, currency and species-declaration questions
as *terms*, not as "we'll discuss it".

| Concern | Treatment |
|---|---|
| Reply language | Stated per locale: «We reply in English, Polish, Ukrainian». Never list a language nobody at the company speaks — an unanswerable German enquiry is worse than a German page that routes to English |
| Shipping | **Resolved by F4, confirmed by [00-client-decisions-5.md](00-client-decisions-5.md) H4.** `{{INTL_CARRIER}}` is **multiple, quoted per order** — Nova Poshta Global, Ukrposhta International, and others selected per order. H4 clarifies that the client's «всі» referred to carriers and means *all of them*, which is precisely why a live rate cannot be computed at checkout and why the enquiry-then-invoice model below exists |
| **Who owns the quote** | **Гондурак Любов Юріївна** ([00-client-decisions-5.md](00-client-decisions-5.md) H3). See below — this is a named person, not a queue |
| Who pays | **The buyer, everything** (F4). Carriage and all customs duties and import taxes |
| Incoterms | **Effectively DAP** — delivered, duties unpaid. One plain sentence naming the buyer as importer of record, disclosed **before the quotation**, in this section |
| Currency | Catalogue in UAH with an EUR reference. **Settlement currency is open** — E10 V11 asks whether WayForPay settles non-UAH. If it does not, prices display converted and the invoice is UAH, and the page must say so plainly rather than let a finance department discover it on the proforma |
| Payment | Bank transfer against a proforma invoice. A personal card number must never appear on a B2B surface — it disqualifies the supplier with any buyer who has a finance department. E10's «no manual personal-card transfer path ever» applies here absolutely |
| Seller of record | **ФОП Гондурак Любов Юріївна** (E1). Named in full on the `de` and `pl` pages, with `{{LEGAL_ID}}` — a European buyer's finance function will not raise a purchase order against an unidentified counterparty |
| Origin split | The «Власне виробництво» / «Відібрано Вівчариком» distinction must be translated, not dropped. It is more consequential in `de` and `pl`, where country-of-origin labelling expectations are stricter — and E7 means the partner side cannot be resolved by naming a supplier, so the honest regional label has to carry it |

### F4 resolves the shipping terms, and they must be stated before the enquiry, not after it

> «Відправляють через Нову пошту, Укрпошту та різними перевізниками; покупець оплачує все.»
> — [00-client-decisions-3.md](00-client-decisions-3.md) F4

Three facts, and each one has to reach the buyer before they send the form:

1. **The buyer pays shipping**, to every destination, at every order value. **Free shipping never
   applies internationally** — including at discount tier 3, whose «безкоштовна доставка» line
   (§19.8) must therefore read «по Україні» and must be omitted entirely from the `en`, `pl` and
   `de` renderings of the tier table. A tier benefit that silently does not apply to the reader is
   worse than no tier benefit.
2. **The buyer pays all customs duties and import taxes.** Effectively DAP. The buyer is the
   importer of record.
3. **International shipping is quoted per order, not calculated.** With carriers chosen case by
   case there is no rate to publish, and this page must not imply a standing service.

**Where this is stated on a B2B page, and why it is earlier than on the consumer path.** The
consumer requirement is disclosure before the pay button
([18-checkout-specification.md](18-checkout-specification.md) §18.23). The B2B requirement is
earlier: **before the enquiry**, in this section. A purchasing manager who submits an enquiry,
receives a quotation, routes it through their finance function and *then* learns that duties are
unbudgeted has wasted their own credibility internally, and that is not a supplier they return to.

> «Ціна не включає доставку, митні збори та податки країни призначення. Їх сплачує покупець.
> Вартість доставки розраховуємо під кожне замовлення.»

Localised per locale, not machine-translated, and placed in the section body rather than in a
collapsed accordion or a footnote under the form.

**The commercial model is enquiry-then-invoice**, which F4 recommends over published flat-rate
zones. On this page that is not a compromise — it is already how the page works. §19.13's form
produces a `Lead`, §19.15 commits to a one-working-day response, and the response carries the
quotation. Flat-rate zones would overcharge the easy destinations and lose money on the hard ones,
and B2B consignment weights make the error larger in both directions than it is on a retail order.
The one change required is honesty about it: the page says the shipping figure arrives with the
quotation, rather than leaving the buyer to assume it is included.

### The quote workflow now has a named owner

[00-client-decisions-5.md](00-client-decisions-5.md) H3 assigns ownership of the international
quote workflow to **Гондурак Любов Юріївна**.

The reasoning is that quoting is a commercial act and the person who signs the contract should
price the shipping. Любов is the ФОП seller of record (E1), so she already owns the contractual and
invoicing side; Іван owns production and is the primary phone
([00-client-decisions-4.md](00-client-decisions-4.md) G1). Splitting the quote away from the seller
of record would produce a quotation issued by one person and an invoice issued by another, which is
the first thing a buyer's finance function notices and the last thing a new supplier wants them to
notice.

| Implementation | Detail |
|---|---|
| `Lead.assignedToId` | Defaults to Любов's account for every lead with a non-`uk` locale or an international destination. **A default, not a constraint** — reassignable in the admin |
| The admin quote queue | Her queue by default, with the 48-working-hour `respondByAt` clock (§19.15) visible on each row |
| The auto-reply | Names her, not «наша команда». §19.15's rule holds: a buyer holding a named person's direct line has a supplier, one holding a ticket number has a vendor |
| The quotation document | Issued over the ФОП name that will appear on the proforma invoice, so the two documents agree |

**Why naming the owner is a page-level concern and not only an operational one.** An unowned
workflow has no SLA in practice, whatever the page publishes. The commitment in §19.15 is
enforceable only because there is one person whose queue the counter is counting, and a buyer
reading «відповідаємо протягом 2 робочих днів» is being told something true only if that is the
case. This closes blocker **B16** in
[35-implementation-roadmap.md](35-implementation-roadmap.md).

### The `de` and `pl` constraint is no longer only ethical — it is paperwork

The previous draft framed the German sheepskin question as a market-sentiment problem.
[00-client-decisions.md](00-client-decisions.md) D3's ethical objection still stands, but E11 adds
a harder constraint on top of it: **sheepskin and leather goods entering the EU face
species-declaration requirements, and some materials require CITES documentation. Wool does not.**

E11's recommendation on record: **launch the `de` and `pl` locales wool-only**, and enable the
hide categories for EU destinations only once the paperwork is confirmed.

| Position | Treatment |
|---|---|
| **A. Wool-only `de` and `pl`** | The range panel under those locales renders wool families only. A buyer who asks about sheepskin is answered individually, once the export documentation for their destination is known. **Recommended, per E11** — and it now has two independent justifications, market sentiment and customs paperwork, where before it had one |
| B. Full range with framing | Sheepskin presented openly with traceability and species documentation. Requires the client to actually hold that documentation, per destination |
| ✗ Unacceptable | Translating the `uk` page verbatim and quoting a German buyer for goods that cannot legally clear customs |

This resolves D6 open question 5 in favour of A, subject to client confirmation. Implementation is
a locale-scoped `Setting`, matching the nav suppression in
[15-navbar-specification.md](15-navbar-specification.md) §15.12 — one row per locale, lifted by an
edit rather than a deploy on the day the declarations are confirmed. The two surfaces read the
same setting, so the nav and this page cannot disagree about what a German buyer may order.

A note on tone: the wool-only scope should be stated as a **scope**, not an apology. «Для
замовлень до ЄС ми поставляємо вовняні вироби» is a clear commercial statement. A hedge — «наразі
ми не можемо…» — invites the buyer to ask when, which is a question nobody can currently answer.

## 19.17 B2B trust elements

A B2B buyer discounts consumer trust signals almost entirely.

| Rank | Signal | Consumer version | B2B version |
|---|---|---|---|
| 1 | Existence | Product photography | Dated workshop photography; video with audible machinery; a thirty-year-old machine in use |
| 2 | Continuity | Founding year badge | «Понад 30 років виробництва», phrased against the manufacturing and never against a legal entity (D1) |
| 3 | Scale | Product count | Capacity, carton quantities, `{{EMPLOYEE_COUNT}}`, named production stages |
| 4 | Honesty | — | **The own/partner origin split.** A supplier who volunteers what they do not make is trusted on what they do |
| 5 | Identity | — | **ФОП Гондурак Любов Юріївна**, plus РНОКПП `{{LEGAL_ID}}` (E1) |
| 6 | Accessibility | Contact form | **Two named people with direct lines** — Іван Гондурак `+380 67 997 34 50` first, Любов Гондурак `+380 67 960 47 69` second ([00-client-decisions-4.md](00-client-decisions-4.md) G1) — plus **a standing invitation to walk the production floor with the owner** (G3) |
| 7 | Policy | Returns window | Defect and short-shipment policy for consignments, stated separately from consumer `{{RETURN_DAYS}}` |

Rank 4 is unusual and is the most valuable item on a cold-start B2B page. A new supplier with no
reputation cannot borrow trust; volunteering an inconvenient fact is one of the few ways to
manufacture it.

**No customer logos, no trade references at launch.** The business is new under this brand and
has none. Rendering an empty "our clients" strip, or borrowing references from the adjacent
business, would be the first falsifiable claim on the page.

**Publishing the registered entity name and code is the cheapest high-value item here.** It costs
nothing, it is public record, and it is the first thing a professional buyer looks up. E1 supplies
half of it — **ФОП Гондурак Любов Юріївна** is the seller of record, the party on the offer
contract, the invoice and the WayForPay merchant account.
[00-client-decisions-3.md](00-client-decisions-3.md) F1 supplies the other half's status:
`{{LEGAL_ID}}` **exists and will be delivered on request.** It is therefore a chase, not an
unknown, and it should stop being planned around as though the business might not have one. It
still blocks three things — the WayForPay contract, the Договір оферти, and the German Impressum —
and the `de` locale cannot launch without it. Nothing else on this page waits. Naming the entity
without its identifier is better than naming neither, and both is the target.

**Two direct lines, each attached to a person and a purpose.** Любов is the seller of record, so
commercial, contractual and invoicing questions reach her — and after
[00-client-decisions-5.md](00-client-decisions-5.md) H3 she also owns the international quote
workflow, which makes the routing label «ціни, договір, експорт» accurate rather than approximate.
Іван owns the production, so capacity, lead-time, specification and **floor-visit** questions reach
him. Labelling them by role rather than listing two anonymous numbers is what makes this a *direct
line* rather than a switchboard, and it is the difference §19.17 rank 6 is measuring. For a buyer,
knowing which of two people to call is itself a signal about how the supplier is organised.

**Іван is listed first, and the roles still stand.**
[00-client-decisions-4.md](00-client-decisions-4.md) G1 sets the phone priority: Іван
`+380679973450` is the primary number and Любов `+380679604769` is the fallback. That ordering is a
*reachability* rule, not a re-assignment of responsibility, and this page must render both facts
without letting either erase the other:

| What G1 fixes | What it does not change |
|---|---|
| Which number a buyer with no specific question should call first | That commercial and export questions belong to Любов (H3) and production questions to Іван |
| That Іван leads every contact surface, and `LocalBusiness` → `telephone` carries his number alone | That **legal pages, the offer contract and the Impressum name Любов**, as ФОП seller of record (G1). §19.17 rank 5 is unchanged |

The rendering that satisfies both is two rows in a fixed order with role labels attached, never two
bare numbers and never a single «зателефонуйте нам»:

```
Іван Гондурак    +380 67 997 34 50   виробництво, потужності, терміни, візит у цех
Любов Гондурак   +380 67 960 47 69   ціни, договір, рахунок, експорт
                                     — якщо Іван не відповідає
```

**The factory-visit invitation belongs here as well as on the production page**, and it has been
strengthened twice and corrected once.

- **Strengthened (Round 2):** the workshop is in Яворів, a village that already receives visitors
  for the Музей ліжникарства (E2). "Come and see it" is a low-friction proposition for a buyer who
  may be planning a trip to the region anyway, and it is something no reseller can offer at all.
- **Strengthened again (Round 3):**
  [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms the site is a **retail shop as
  well as a production floor** — «там знаходиться і магазин і виробництво». A buyer who visits
  does not merely tour a workshop; they see finished goods, packaging and pricing alongside the
  machines that made them, in one trip. For a buyer assessing whether to stock a range, that is a
  materially stronger proposition than a factory tour: it is a sample room and a production audit
  at the same address. The invitation therefore names both — «Магазин і виробництво в одному
  місці» — and does not describe the visit as a factory tour.
- **Corrected (Round 2):** the previous draft's «we are open on Sunday too» is **withdrawn**. E3
  states the hours are flexible and differ day to day. The invitation reads «Приїжджайте
  подивитись — магазин і виробництво в одному місці, графік гнучкий, зателефонуйте перед
  візитом», with both numbers beside it. A buyer who books a visit by phone gets a confirmed slot,
  which is a better outcome than a published Sunday that turns out to be wrong.

- **Strengthened a third time (Round 4), and this is the largest of the three.**
  [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms the **production floor itself may
  be walked, accompanied by Іван**. F2 offered a shop with a factory attached; G3 offers the factory,
  with the owner in it. For a buyer assessing whether to commit a shelf and a purchase order, those
  are different propositions: the first is a sample room, the second is a supplier audit conducted
  by the buyer in person, at no cost, with the decision-maker present. §19.7 sets out why no
  competitor archetype can match it. The invitation here reads «Цех можна оглянути — разом із
  власником. Зателефонуйте заздалегідь, щоб домовитися про час.», attached to Іван's number, with
  **no booking form, no published tour times and no "open to the public"** — all three are
  prohibited by G3, and on a B2B page the pull toward a form is strongest and must be resisted.

**Rank 6 is understated by the table above.** «Accessibility — two named people with direct lines»
undersells what F2 and G3 make available: the B2B version of rank 1, *existence*, is normally
satisfied by dated photography, and a visitable shop-plus-floor satisfies it without the buyer
having to believe the photographer — while an owner-accompanied tour satisfies rank 3, *scale*, in
the same trip, which no photograph does at any budget. This block renders the invitation as a
contact affordance; §19.7 renders the same fact as evidence. Both read from the same `Setting`, so
the address, the visit line, the tour line and the availability sentence cannot diverge between the
two.

**No social links in this block.** E3: the owners run no accounts, and the adjacent business's
`@fabryka_shkur` must never be used. For a B2B page the absence is immaterial — a purchasing
manager verifies a supplier through the entity register, the address and a phone call, not through
a follower count — which is why this is stated once and not mitigated.

## 19.18 Analytics events

Per [31-analytics-architecture.md](31-analytics-architecture.md). Every event carries `locale` and
`sourcePath`; `utm` is captured into `Lead.utm` on submit.

| Event | Trigger | Parameters | Question answered |
|---|---|---|---|
| `wholesale_page_view` | Page view | `locale`, `referrer_type` | Baseline. `referrer_type` separates GBP, direct and referral during cold start. **Direct is the dominant bucket here, not a residual one** — with no social channel (E3) the page's designed distribution is a pasted URL, so a high direct share is the mechanism working, not missing attribution |
| `wholesale_path_select` | Path card clicked | `path` | Which of the four relationships the market wants |
| `wholesale_tier_view` | Tier table ≥50% in view for 1 s | — | Are terms read or scrolled past |
| `wholesale_origin_toggle` | Own/partner panel switched | `panel` | **Whether buyers care about the origin split, and how much** |
| `wholesale_catalogue_download` | PDF download | `catalogue_version`, `locale` | The ungating decision, measured |
| `wholesale_catalogue_messenger` | Viber/Telegram send | `channel` | Whether the soft capture earns its place |
| `wholesale_form_start` | First field interaction | `kind_preset` | Form entry rate per path |
| `wholesale_form_branch_shown` | Branch revealed | `kind` | Whether self-classification works |
| `wholesale_form_abandon` | Unload with ≥1 field filled, no submit | `last_field`, `fields_completed` | **The most valuable event here** — names the field that kills the form |
| `wholesale_tour_intent` | The tour line's `tel:` link tapped in §19.7 or §19.17 | `section` (`credibility` \| `contact`) | Whether the strongest claim on the page is acted on, and from which of its two placements. **Intent only** — the site cannot observe whether the call connected, whether a visit was arranged, or whether it converted, and the two mechanisms that would (a booking form, a per-visitor code) are both forbidden by [00-client-decisions-4.md](00-client-decisions-4.md) G3. Outcome is a tally kept by Іван ([31-analytics-architecture.md](31-analytics-architecture.md) §31.13; [02-ux-research.md](02-ux-research.md) §2.8 R17) |
| `wholesale_form_submit` | Successful submit | `kind`, `business_type`, `country`, `score`, `own_only` | Conversion by type, and demand for own manufacture |
| `wholesale_form_error` | Validation failure on submit | `field`, `error_type` | Validation firing wrongly |
| `wholesale_contact_direct` | Phone/Viber/email click | `channel`, `scroll_depth` | Leads that bypass the form entirely |
| `wholesale_video_play` | Factory video starts | `autoplay` | Whether the proof asset is consumed |

Two events matter disproportionately. `wholesale_contact_direct` catches the meaningful share of
domestic enquiries that arrive by Viber and never create a `Lead` row — without it the page
appears to convert far worse than it does. `wholesale_origin_toggle` is the only quantitative
read available on whether D3's resale risk is real in practice.

Target, per [01-brand-strategy.md](01-brand-strategy.md) §1.10:
`{{WHOLESALE_LEADS_TARGET}}` **qualified** enquiries per month, using §19.14's definition rather
than the raw submission count. That target must be set against cold-start reality: months 0–6 are
driven by GBP, outbound, offline relationships and the workshop's own footfall — **not search, and
per E3 not social either.** Set the number against a channel mix of hand-delivered URLs, and
expect `wholesale_contact_direct` and the QR/print entry points to account for a larger share of
real enquiries than `wholesale_form_submit` does.

## 19.19 Motion, performance, accessibility

- Section reveals use **Rise** ([13-motion-system.md](13-motion-system.md) §13.4), 60 ms stagger,
  capped at 6 siblings. Nothing else on this page animates on scroll.
- Hero video is `muted autoplay playsinline loop`, desktop only, attached after LCP, replaced by
  its poster under reduced motion, `saveData`, or ≤4 cores (§13.6, §13.7).
- The discount table does not count up. Percentages appear (§13.11).
- Branch reveal uses `grid-template-rows: 0fr → 1fr` (§13.10) — no measurement, no layout shift.
- The path selector and the origin segmented control are real `role="radiogroup"` / `role="tablist"`
  constructs with arrow-key navigation and a `focus-visible` ring, not divs with click handlers.
- The revealed branch fieldset carries `aria-live="polite"` on its legend so a screen-reader user
  learns that new questions appeared.
- Origin labels are always text. A colour-coded or icon-only origin cue fails
  [08-design-system.md](08-design-system.md) §8.10 and misleads exactly the buyer it matters most to.
- One primary action per screen (§8.4): the hero's `accent` catalogue button and the form's
  `primary` submit never share a viewport.
- Weight budget: ≤900 KB desktop first view including hero poster and two credibility photographs;
  ≤420 KB mobile, where no video loads.

## 19.20 Open items and tokens

### Closed by [00-client-decisions-2.md](00-client-decisions-2.md)

| # | Question | Resolution |
|---|---|---|
| 5 | May partner manufacturers be named? | **No, permanently** (E7). `partnerName` is never rendered. Tiles carry «Відібрано Вівчариком» + «Виготовлено карпатським майстром» / «іншим виробником», at equal weight to «Власне виробництво». §19.11 |
| 6 | Are dye lots tracked? | **Not tracked** (E8). The §19.13 branch question stays — a trade buyer may still *request* a matched lot, and the honest answer is the yarn PDP's note that shades may vary between batches. `dyeLot` is nullable and unused |
| 7 | Sheepskin and leather in `de` | **Wool-only recommended for `de` and `pl`** (E11), on species-declaration grounds as well as market sentiment. §19.16 |
| 8 | Factory photography | **Descoped, not cancelled** (E5). Catalogue photography may be reused from the adjacent site after reprocessing; the credibility block still needs a one-to-two-day Yavoriv shoot. §19.7 |
| — | Location | **вул. Петруші, с. Яворів, Косівський район, 78644** (E2). Not Вербовець |
| — | Seller of record | **ФОП Гондурак Любов Юріївна** (E1) |
| — | Hide pipeline ownership | **Own manufacture, confirmed** (E6). «Вичинка шкур» joins the stage list; «бельгійська технологія» is struck |
| — | `{{PSP}}` | **WayForPay** (E10). B2B still settles by bank transfer against a proforma invoice |
| — | `{{SKU_COUNT}}` | **Several hundred to roughly a thousand** (E5), following the catalogue import. Enough to make the §19.12 catalogue PDF a genuine document rather than a leaflet, and enough that it needs a version date and a table of contents |

### Closed by [00-client-decisions-3.md](00-client-decisions-3.md)

| # | Question | Resolution |
|---|---|---|
| 11 | `{{INTL_CARRIER}}` and the customs/duties position | **Resolved.** Multiple carriers — Nova Poshta, Ukrposhta and others case by case — with international shipping **quoted per order, never calculated**. The buyer pays carriage and all customs duties and import taxes, effectively DAP. Free shipping never applies internationally. §19.16 (F4) |
| 13 | Are partner goods sold under the Вівчарик name or unbranded? | **Under the Вівчарик brand.** `brand` is Вівчарик for both origins; `manufacturer` is omitted entirely for partner goods, never set to Вівчарик. The tile label keeps equal visual weight and matters more, not less. §19.11 (F3) |
| — | Hero place-claim | **«в Карпатах», as approved.** The Round-2 Яворів subhead is withdrawn; the verification argument relocates to §19.7. §19.6, §19.7 (F6) |
| — | Nature of the Яворів site | **Retail shop and production floor together.** The visit invitation is evidence in §19.7 and a contact affordance in §19.17 (F2) |
| — | `{{LEGAL_ID}}` status | **Exists, pending delivery.** Blocks the offer contract, WayForPay and the German Impressum; nothing else on this page (F1) |
| — | Public contact address | **`gif19601@gmail.com` exists, interim only.** `{{BRANDED_EMAIL}}` is now an upgrade rather than a creation — and is still required, because transactional mail cannot be authenticated from `@gmail.com` (F5) |

### Closed by [00-client-decisions-4.md](00-client-decisions-4.md)

| # | Question | Resolution |
|---|---|---|
| — | Is the workshop visitable, and by whom? | **Yes — the production floor, accompanied by Іван, arranged in advance by phone** (G3). `{{FLOOR_VISIT}}` resolved. This is the strongest single item on the page: a five-figure order can be placed after a personal supplier audit that no marketplace reseller can offer at all. §19.7, §19.17. **No booking form, no published tour times, no drop-in — ever** |
| — | Which number leads, and does that move the roles? | **Іван `+380 67 997 34 50` primary, Любов `+380 67 960 47 69` fallback** (G1). The role labels stay: production to Іван, commercial and export to Любов. Legal pages, the offer contract and the Impressum continue to name **Любов** as ФОП. §19.17 |
| — | `{{LEAD_TIME_MADE_TO_ORDER}}` on the consumer path | **14 days of production before dispatch, transit on top** (G2). This is the retail figure and is **not** this page's consignment lead time. §19.8 |

### Closed by [00-client-decisions-5.md](00-client-decisions-5.md)

| # | Question | Resolution |
|---|---|---|
| — | `{{WHOLESALE_RESPONSE_SLA}}` | **48 working hours**, published to the buyer as «протягом 2 робочих днів». Quote validity 72 hours, 36 for one-of-one. Requires client confirmation before launch (H2, §H5 item 2). §19.15 |
| — | Who owns international quotes? | **Гондурак Любов Юріївна**, as ФОП seller of record (H3). `Lead.assignedToId` defaults to her account. Closes blocker **B16** in [35-implementation-roadmap.md](35-implementation-roadmap.md). §19.16 |
| — | What did «всі» mean? | **All international carriers, selected per order** (H4). Confirms F4 rather than changing it, and is the reason international rates cannot be computed at checkout. §19.16 |
| — | Is every product available to measure? | **No — per-product, toggled in the admin** (H3b). Only some products carry `allowsCustomSize`. The consumer 14-day prepaid path and B2B custom production are separate mechanisms with separate lead times. §19.8 |

### Client decisions this page is still blocked on

| # | Question | Blocks |
|---|---|---|
| 1 | Does Вівчарик offer dropshipping? Under what retail-price condition? | §19.9 publishes or is removed. If it publishes, E7 restricts it to own manufacture |
| 2 | Discount tiers and percentages | §19.8 renders an empty table without them. Tier 3's shipping benefit must read «по Україні» and is omitted under `en`, `pl` and `de` (F4) |
| 3 | MOQ — a value, or an explicit "none" | §19.8, §19.14 scoring |
| 4 | Monthly capacity | §19.7, the page's rank-1 job |
| 9 | `{{LEGAL_ID}}` — delivery of the supplied value | §19.17 rank 5, the offer contract, WayForPay onboarding, and the `de` locale entirely. **No longer an unknown** — F1 confirms it exists and will be supplied |
| 10 | `{{BRANDED_EMAIL}}` | Every contact surface on the page. An interim address exists (F5), so this is an upgrade rather than a creation — but a numeric personal Gmail on a B2B supplier page is disqualifying to a buyer with a finance function, and transactional mail cannot be sent from `@gmail.com` at all |
| 12 | WayForPay V11 — does it settle non-UAH? | §19.16 currency row; whether an EUR price can be charged or only displayed |
| 14 | Exact wording of any Hutsul-lizhnyk heritage reference (E13.4) | §19.7 «what Yavoriv is» row. No longer the §19.6 subhead, which no longer names the village |
| 15 | Google Business Profile primary category — retail as well as manufacturing? | Whether «де купити» intent reaches the profile at all. F7 item 3. **G3 adds a second reason to get this right:** a listing that also carries a visitable production floor supports attributes a pure e-commerce listing cannot claim |
| 16 | **Confirmation of the 48h / 72h / 36h defaults** ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 2) | §19.15. They are operational commitments, not settings, and the page publishes them before anyone has tested whether two people can hold them |
| 17 | **Approval of the tour wording** «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» (G3, suggested pending approval) | §19.7 and §19.17. Not interchangeable: an improvised variant is how an invitation becomes a promise of access the business cannot keep |
| 18 | **How is a custom size priced?** ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 1) | Indirectly, §19.8. If a published per-square-metre rate is chosen, it becomes a reference a trade buyer holds the quotation against and the two must agree |

### Tokens introduced

| Token | Meaning | Severity |
|---|---|---|
| ~~`{{WS_TIER_1..3}}`, `{{WS_DISC_1..3}}`~~ | **Resolved:** 5 pcs −10%, 25 pcs −20% ([00-client-decisions-8.md](00-client-decisions-8.md) §L14) | — |
| ~~`{{MOQ_VALUE}}`~~ | **Resolved: none** — the minimum is 5 pieces ([00-client-decisions-8.md](00-client-decisions-8.md) §L14) | — |
| `{{LEAD_TIME_STOCK}}`, `{{LEAD_TIME_MADE_TO_ORDER}}`, `{{LEAD_TIME_PRIVATE_LABEL}}`, `{{LEAD_TIME_PARTNER}}` | Lead times per supply route | HIGH |
| `{{UNITS_PER_CARTON}}`, `{{WS_PRICE_FROM}}` | Per-family packing and entry price | HIGH |
| `{{LEGAL_ID}}` | РНОКПП for ФОП Гондурак Любов Юріївна. **Exists, pending delivery** (F1). `{{LEGAL_ENTITY}}` is resolved | HIGH |
| `{{MAX_LOOM_WIDTH}}`, `{{DENSITY_RANGE}}`, `{{DYE_MIN_BATCH}}`, `{{LABEL_MIN_QTY}}`, `{{PACKAGING_MIN_QTY}}`, `{{COMPOSITION_OPTIONS}}` | Private-label constraints, now known to be properties of the Yavoriv floor and therefore answerable | MEDIUM |

Carried without redefinition: `{{CAPACITY_MONTHLY}}`, `{{EMPLOYEE_COUNT}}`,
`{{WHOLESALE_LEADS_TARGET}}`, `{{RETURN_DAYS}}`, `{{BRANDED_EMAIL}}`, `{{DOMAIN}}`.
`{{INTL_CARRIER}}` is **resolved** by F4 and confirmed by
[00-client-decisions-5.md](00-client-decisions-5.md) H4 to *all carriers, selected per order*, and
no longer renders as a token on this page — the page names the carriers it uses and states that the
rate arrives with the quotation.

**Resolved by Round 4 and Round 5:** `{{WHOLESALE_RESPONSE_SLA}}` → **48 working hours**, published
as «протягом 2 робочих днів» (H2); `{{QUOTE_EXPIRY_HOURS}}` → **72**, and **36** for one-of-one
items (H2); `{{FLOOR_VISIT}}` → **yes, guided by Іван, arranged in advance by phone** (G3);
`{{MADE_TO_ORDER_DAYS}}` → **14 days of production before dispatch** on the consumer path (G2),
which is not `{{LEAD_TIME_MADE_TO_ORDER}}` on this page. Both phone numbers are rendered literally,
**Іван first** (G1).

**Resolved and rendered literally on this page:** `{{YEARS_EXPERIENCE}}` → «понад 30» (D1);
`{{LEGAL_ENTITY_NAME}}` → «ФОП Гондурак Любов Юріївна» (E1); `{{FACTORY_ADDRESS}}` → «вул.
Петруші, с. Яворів, Косівський район, Івано-Франківська область» and `{{POSTAL_CODE}}` → «78644»
(E2); both phone numbers (E3); `{{SKU_COUNT}}` → several hundred to ~1,000 (E5).
