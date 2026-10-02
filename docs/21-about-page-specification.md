# 21 — About Page Specification

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - One scrolling story: **Яворів and ліжникарство, and values only** — no family-history section (part 7).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **No portrait of Іван and no faces.** The story is Іван's, recorded at the visit and edited for his approval.
> - No own-flock or dyeing claims (follow-up §F1).


Route: `/{locale}/pro-nas` (`uk`), `/en/about`, `/pl/o-nas`, `/de/ueber-uns`.

> **Authority note.** Written against [00-client-decisions-3.md](00-client-decisions-3.md), now the
> highest-authority document, then [00-client-decisions-2.md](00-client-decisions-2.md), then
> [00-client-decisions.md](00-client-decisions.md). D1
> **resolves** the company-age conflict that [00-existing-site-audit.md](00-existing-site-audit.md)
> §0.2 raised: manufacturing has run continuously since approximately 1991–1992 and the 30-year
> claim is legitimate. The audit's 2013/2016 dates belong to a **separate business** (D2) and do
> not appear on this page. See §21.3.
>
> **Round 2 supplies what this page was most missing.** E1 names the people — **Гондурак Іван
> Федорович**, owner of production, and **Гондурак Любов Юріївна**, deputy owner and seller of
> record — so the family section is no longer written around a gap. E2 replaces Вербовець with
> **с. Яворів**, which upgrades the place section from context to argument. E3 removes the
> published opening hours and confirms there is no social presence. E7 rules that partner
> manufacturers may **not** be named, which weakens the curation story in §21.7 and is stated as
> such.
>
> **Round 3 reverses one Round-2 proposal and strengthens two sections.** F6 **declines** the
> substitution of «у Яворові» for the approved «в Карпатах»: the H1 in §21.3 and §21.4 reverts, and
> §21.14's open item 8 is closed — answered no. The Яворів material is not removed; it moves one
> layer down, into §21.6, where the reader has the context that makes it land. F2 confirms the
> address is **a shop as well as a production floor**, which turns the come-and-see block from a
> courtesy into the page's strongest evidence. F3 confirms partner goods carry the **Вівчарик
> brand**, which does not change §21.7's copy but changes how much weight it bears.
>
> **Round 4 attaches the strongest asset on the project to this page's people section.**
> [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that a visitor may tour the
> production floor **accompanied by Іван**, by prior phone arrangement. That belongs here as well as
> on [20-production-page-specification.md](20-production-page-specification.md) §20.11, and for a
> reason specific to this page: the tour is *with a named person*, so it is the point where §21.9's
> portraits stop being illustrations and become an offer. §21.9 carries it. G1 also fixes the phone
> order everywhere on this page — **Іван `+380679973450` primary, Любов `+380679604769`
> fallback** — while **legal surfaces continue to name Любов** as the ФОП seller of record, which is
> the two-register rule in §21.7 restated at a different level. G4 confirms a business card ships in
> every parcel, which gives this page a second, physical entry route.
>
> **Round 5 changes nothing on this page's narrative and one thing in its markup.** H3 assigns
> international quote ownership to **Гондурак Любов Юріївна** as ФОП seller of record
> ([00-client-decisions-5.md](00-client-decisions-5.md) H3) — a commercial role, not a narrative
> one, and §21.7's rule that the ФОП designation stays off this page holds unchanged.

## 21.1 What this page is for, and what it is not

The production page ([20-production-page-specification.md](20-production-page-specification.md))
proves the factory exists. This page answers a different question, one that only gets asked after
the first is settled: **who are these people, and why should I care that it is them?**

That distinction determines everything below. If this page repeats the production stages it is
redundant; if it lists values it is worthless; if it tells a story with dates and faces it does
work no other page can do.

> **Job, in one sentence:** make the visitor able to retell the story to someone else.

That is not a soft goal. [02-ux-research.md](02-ux-research.md) §2.2 J1 and J5 both describe
buyers whose purchase only succeeds if they can explain the object to a third party — the guest
who asks about the blanket, the recipient of the gift. The story is part of the product. A
customer who cannot retell it has bought a textile; one who can has bought a keepsake, and paid
the keepsake price.

Two secondary jobs, both raised by [00-client-decisions.md](00-client-decisions.md):

- **Cold start, and it is colder than the previous draft assumed.** D2 confirms a new domain with
  zero authority; [00-client-decisions-2.md](00-client-decisions-2.md) E3 confirms **no social
  accounts of any kind**. This page therefore has no Instagram bio pointing at it and no feed doing
  the pre-selling. What it does have is the Google Business Profile, which is the primary launch
  channel (E4) and which links here. The practical consequence: this page must work for a visitor
  who found a business on a map ninety seconds ago and knows nothing else about it.
- **The curation story.** D3 introduces a partner-manufactured category and E7 rules that the
  partners cannot be named. This page is the correct place to frame that once, in the brand's own
  voice, so it never has to be explained defensively later — and §21.7 now has to do that framing
  with weaker material than it was written for.
- **The place story.** New, and the strongest addition Round 2 made. E2 puts the workshop in
  **Яворів**, «столиця ліжникарства». §21.6 was previously the page's throat-clearing section; it
  is now the page's argument.

The sheep mark is permitted here. D2 confirms the shepherd identity as brand core, and «Вівчарик»
means *little shepherd* — this is the page where the name is explained, which makes it the one
surface where the mark carries meaning rather than decoration.

## 21.2 The narrative spine — why chronology beats values

The default about page is a values grid: three or six cards reading «Якість», «Традиція»,
«Натуральність», each with an icon. It is the single most common structure and it is close to
worthless. Three reasons, stated so the decision is not relitigated:

| Problem | Detail |
|---|---|
| **Values are unfalsifiable** | No competitor writes «Якість: посередня». A statement every competitor can also make carries zero information, and the visitor's brain correctly discards it. [08-design-system.md](08-design-system.md) §8.2 makes evidence over assertion a design principle, not a copy preference |
| **Values are not memorable** | Nobody retells a values grid. People retell events: a year, a place, a person who did something. Job 1 is retellability, and abstractions cannot be retold |
| **Values have no natural length or order** | Three cards or six, in any sequence — which is why they are always the section that gets padded. Chronology has a spine: it starts where it started, it ends now, and a reader knows where they are in it |

**Chronology wins on all three, and it wins a fourth thing:** it is the only structure in which
the 30-year claim is *shown* rather than asserted. A timeline that begins in the early 1990s and
runs unbroken to today makes the reader do the arithmetic themselves. A badge reading «30 років»
asks them to accept it.

### The spine

```
   THE PLACE            →   THE START          →   THE GROWTH        →
   ЯВОРІВ                   early 1990s            washing, combing,
   «столиця ліжникарства»   wool processing        spinning, weaving,
   why wool is made here                           sewing, tanning
                                                   under one roof

→  THE CONTINUITY      →   THE PEOPLE        →   TODAY
   same craft, same          Іван and Любов        Вівчарик, the brand,
   village, changed          Гондураки, and        and what it now makes
   legal shape               the people who work
                             with them
```

Six movements. The place comes first — not the company — because
[01-brand-strategy.md](01-brand-strategy.md) §1.4 makes "Rooted" a brand trait with a build
consequence, and because starting with geography rather than with a founder is what distinguishes
a regional manufacturer from a personal brand.

**E2 makes that ordering far more defensible than it was.** When the place was "a valley in
Косівщина", opening with geography was a stylistic choice that a reader could reasonably find
slow. When the place is **Яворів — the village Hutsul lizhnyk weaving is named after** — opening
with geography is the strongest fact available, and putting it anywhere but first would be a
mistake ([01-brand-strategy.md](01-brand-strategy.md) §1.2b). The fifth movement also changes: it
was a placeholder for unnamed people and now names two.

## 21.3 The timeline — and how the 30-year question is now handled

### What changed

[00-existing-site-audit.md](00-existing-site-audit.md) §0.2 flagged "30 years" as unsupported and
proposed a craft-since-the-1990s / company-since-2013 framing.
[00-client-decisions.md](00-client-decisions.md) D1 supersedes that entirely:

| Audit position (superseded) | Client decision D1 (authoritative) |
|---|---|
| ~13 years, founded 2013 | Manufacturing began ~1991–1992 and has run **continuously** |
| 2016 sewing factory | That is the **adjacent business**, not Вівчарик (D2) |
| "30 years" unsupported | **Legitimate**, with constraints |

**The 2013 and 2016 dates do not appear on this page.** They belong to the client's wife's
business. Putting them on Вівчарик's about page would be the same category of error the audit was
trying to prevent, in the opposite direction.

### The three constraints, which are absolute

D1 states them and they bind every word of this section:

1. **The claim attaches to the manufacturing, never to a legal entity.** Approved copy is
   «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.» Forbidden: «Компанія
   заснована 1992 року», «Засновано 1992», any founding-date construction. The original company
   was later split into several ФОПs, so the current legal entities are newer than the craft and
   a registration-based claim would be false.
2. **Nothing may imply certification, award, or documented anniversary.** No seals, no ribbons,
   no «офіційно», no certificate imagery, no "30 years" rendered as a medallion. None of it
   exists, and a visitor who asks for the document must not have been led to expect one.
3. **`Organization.foundingDate` is not set to 1992** in structured data (§21.11). The story is
   prose; prose can carry nuance that a date field cannot.

### The timeline content

Rendered as dated entries, each with a photograph where one exists. Undated entries are grouped
under a decade heading rather than given an invented year — a precise-looking wrong date is worse
than an honest range.

| Entry | Content | Status |
|---|---|---|
| **Місце — Яворів** | Why wool is made here: sheep, water, and a village whose craft has a museum in it. Named, not gestured at | E2. Editorial, no date needed |
| **Початок 1990-х** | Wool processing begins. `{{ORIGIN_STORY}}` — who started it, with what, and why | **Needs the client's own words.** This is the single most valuable unwritten paragraph in the blueprint |
| **1990-ті** | Expansion into industrial washing and combing | D1 confirms the sequence, not the years |
| **{{YEAR_SPINNING}}** | Spinning added | Unconfirmed |
| **{{YEAR_WEAVING}}** | Weaving added — ліжники become possible in-house | Unconfirmed |
| **{{YEAR_SEWING}}** | Sewing: гуні, камізельки, капці, пояси | Unconfirmed |
| **{{YEAR_TANNING}}** | Hide and sheepskin processing added — the second material chain | **New entry.** E6 confirms the full cycle including tanning is in-house; the year it started is unconfirmed and may fold into a decade heading |
| **Зміна форми** | The original company is split into several ФОПs. The craft does not change | D1. State plainly; hiding a restructuring invites its discovery |
| **Сьогодні — Іван і Любов** | Who runs the production now, by name | E1. The entry that turns the timeline from a company history into a family one |
| **2026 — Вівчарик** | The brand and this site. Named for the shepherd | D2 |

**On the restructuring entry.** The instinct is to omit it. It should stay, in one sentence, for
the same reason the partner-origin label stays (§21.7): a story that volunteers its own awkward
detail is trusted on everything else. It is also what makes the 30-year claim survive scrutiny —
a reader who later discovers a ФОП registered in 2019 has already been told why.

**The headline framing, verbatim — reverted in Round 3 and now final:**

> Понад 30 років виробляємо натуральні вовняні вироби **в Карпатах**.
> Змінювалися назви. Руки, машини й село — ті самі.

The previous draft proposed «у Яворові» in place of the approved «в Карпатах» and flagged it for
client confirmation. **The client reviewed it and declined**
([00-client-decisions-3.md](00-client-decisions-3.md) F6). The approved D1 copy stands unchanged
and this line is no longer open.

The reasoning is worth recording, because it applies to every headline in the blueprint and not
only to this one:

| | «в Карпатах» | «у Яворові» |
|---|---|---|
| What the reader does with it | Understands it instantly — every audience, including `en`, `pl` and `de` buyers who have never seen a Ukrainian map | Has to stop and work out what it refers to, or skip it |
| What it costs | Specificity | Comprehension, at the exact moment the reader has committed nothing |
| What it buys | Attention | Proof — but proof the reader is not yet asking for |

**A tagline is not the place to teach a new proper noun.** A reader who has to decode a word has
stopped reading the sentence, and a headline gets one pass. That constraint disappears three
hundred pixels further down: §21.6 exists precisely to teach the word, to a reader who by then
wants it. The governing pattern, stated once here and in full in
[01-brand-strategy.md](01-brand-strategy.md) §1.2b, is **«Карпати» to be understood, «Яворів» to be
believed** — the headline earns attention, the page beneath it earns trust, and those are
different jobs.

What survives from the previous draft is the second word change: «долина» becomes **«село»**. That
one was never about the approved wording — a valley is scenery, a village is an address — and the
hero **overline** still reads «с. ЯВОРІВ · КОСІВСЬКИЙ РАЙОН» (§21.4). The village is on screen
above the fold; it is simply not carrying the claim.

The second line is what converts a number into a story, and it is defensible because it is
literally what D1 describes. Note that «село — ті самі» now does quiet work the H1 no longer does:
it asserts continuity of place without naming the place, which is exactly the right weight for a
subline.

**For the `en`, `pl` and `de` locales** the same ruling applies, and it applies more strongly: a
reader abroad knows the Carpathians and does not know Яворів, so «in the Carpathians» is the H1 in
all four locales. Where the village is named further down these pages — §21.6, the timeline's
first entry, the `Place` markup — the construction is name-then-gloss: "Yavoriv, a village in the
Ukrainian Carpathians". E11 makes these locales transactional, so the sentence has to work for
buyers, not just for readers.

## 21.4 Desktop wireframe

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SiteHeader                                                                │
├───────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓ HERO — full-bleed landscape, 88vh, forest-900 scrim (09 §9.6) ▓▓▓▓▓▓ │
│ ▓ Photograph: the valley with the workshop in it, not a product        ▓ │
│ ▓ OVERLINE   с. ЯВОРІВ · КОСІВСЬКИЙ РАЙОН          ← village lives here ▓ │
│ ▓ H1  Понад 30 років виробляємо натуральні             display-xl     ▓ │
│ ▓     вовняні вироби в Карпатах                        cols 2–8       ▓ │
│ ▓     (approved D1 copy; «у Яворові» declined — F6)                   ▓ │
│ ▓ Sub Змінювалися назви. Руки, машини й село — ті самі.               ▓ │
│ ▓ NO badge, NO seal, NO medallion, NO counter animation (§21.3)       ▓ │
├───────────────────────────────────────────────────────────────────────────┤
│ §21.6 THE PLACE — bg-page, asymmetric editorial grid (11 §11.3)          │
│  ┌──────────────────────┬──────────────────────────────────────────────┐ │
│  │ MAP COMPONENT        │ Body, cols 7–11, measure 62–68ch             │ │
│  │ cols 1–6, bleeds left│ Why wool is made in THIS village.            │ │
│  │ Косів ◉ · Яворів ●   │ «столиця ліжникарства» · museum · plein airs │ │
│  │ sourcing area ◌      │ Sourcing region named, not implied.          │ │
│  └──────────────────────┴──────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ §21.5 TIMELINE — bg-alt, container 1120                                  │
│  ┌ rail ┐ ┌───────────────────────────────────────────────────────────┐  │
│  │  │   │ │  ПОЧАТОК 1990-х                              h2           │  │
│  │  ●   │ │  ┌──────────────┐  Body text, cols 6–11                   │  │
│  │  │   │ │  │ PHOTO 4:5    │  max 66ch                               │  │
│  │  ○   │ │  │ archival if  │                                         │  │
│  │  │   │ │  │ it exists    │                                         │  │
│  │  ○   │ │  └──────────────┘                                         │  │
│  │  │   │ │  ─────────────────────────────────────────────────────    │  │
│  │  ○   │ │  1990-ті · МИТТЯ І ЧЕСАННЯ                                │  │
│  │  │   │ │  …entries alternate image left / image right…             │  │
│  │  ●   │ │                                                           │  │
│  └──────┘ └───────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────────────┤
│ §21.7 THE FAMILY + WHAT WE MAKE AND WHAT WE SELECT — bg-page             │
│  Two-column: family narrative │ the own-manufacture / partner framing    │
├───────────────────────────────────────────────────────────────────────────┤
│ §21.8 WHAT WE STAND FOR — bg-alt                                         │
│  NOT a values grid. Four claims, each followed by its evidence and a     │
│  link to where that evidence lives:                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ «Ми не купуємо готове й не перепродаємо як своє.»               │    │
│  │  → кожен товар підписаний: власне виробництво                   │    │
│  │    чи «виготовлено іншим виробником»                            │    │
│  │  [ Подивитись виробництво → ]                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────────────────┤
│ §21.9 PEOPLE — bg-page, 3-col on lg, 4:5 portraits                       │
│  name · role · years here · one verbatim line                           │
│  ── under Іван's card, attached to him, not to the business (G3) ──     │
│  «Цех можна оглянути — разом із власником.»                             │
│  «Зателефонуйте заздалегідь, щоб домовитися про час.»                   │
│  [ +380679973450 ]  tel: link, no booking form, no times                │
├───────────────────────────────────────────────────────────────────────────┤
│ §21.10 COME AND SEE — inverted forest-900                                │
│  «ПРИЇЗДІТЬ: МАГАЗИН І ВИРОБНИЦТВО В ОДНОМУ МІСЦІ, с. ЯВОРІВ» (F2)      │
│  «Графік гнучкий — телефонуйте перед візитом»                           │
│  Іван +380679973450 · Любов +380679604769 — якщо не відповідає (G1)     │
│  вул. Петруші, с. Яворів · [Маршрут] [Подзвонити] [Viber]               │
│  → links to /vyrobnytstvo for the full visit block. NO hours table      │
│  Tour is NOT repeated here — it lives in §21.9 (one invitation, once)   │
├───────────────────────────────────────────────────────────────────────────┤
│ SiteFooter                                                                │
└───────────────────────────────────────────────────────────────────────────┘
```

## 21.5 Mobile wireframe

```
┌────────────────────────┐   Notes
│ ☰  Вівчарик        UK▾ │
│ ▓ HERO 72vh            │   landscape crop uses Media.focalPoint +
│ ▓ H1 display-md        │   textSafeZone so the headline never lands
│ ▓ «Понад 30 років…     │   on a busy region (09 §9.6). H1 ends «в
│ ▓  …в Карпатах»        │   Карпатах» (F6); Яворів is in the overline
│ ▓ с. ЯВОРІВ overline   │   and then in full in THE PLACE below
├────────────────────────┤
│ THE PLACE              │
│ ┌────────────────────┐ │
│ │ MAP — static SVG   │ │   4:3 on mobile, not the desktop 3:2;
│ │ Яворів ●           │ │   two labels only (Косів, Яворів) —
│ └────────────────────┘ │   the desktop map's 5 labels collide at 375px
│ Body, 62–68ch          │
├────────────────────────┤
│ TIMELINE               │   rail collapses to a left hairline with
│ │ ● ПОЧАТОК 1990-х    │   dots; entries stack image-above-text,
│ │ ┌────────────────┐  │   no alternation (alternating on a 1-col
│ │ │ PHOTO 4:5      │  │   layout produces nothing but ragged rhythm)
│ │ └────────────────┘  │
│ │ Body 2–3 ¶          │
│ │ ○ 1990-ті …         │
├────────────────────────┤
│ FAMILY                 │
│ WHAT WE MAKE / SELECT  │
│ WHAT WE STAND FOR      │   claim + evidence pairs, 1 col
│ PEOPLE — 1 col, swipe  │   portraits are a scroll list, not a carousel:
│ МАГАЗИН І ВИРОБНИЦТВО  │   a carousel hides people behind an affordance;
│ + phones + [Маршрут]   │   shop-and-production headline first (F2), then
│                        │   call-ahead line, no hours table (E3)
└────────────────────────┘
```

## 21.6 The place section and the Carpathian map component

### Why it is first — and why Round 3 made it the page's only Yavoriv surface above the fold

[00-client-decisions-3.md](00-client-decisions-3.md) F6 took «Яворів» out of the H1 (§21.3). It did
not take it out of the page; it moved the whole burden of the claim **here**. The consequence is
direct: this section is no longer one of several places the village is argued for, it is *the*
place, and it now has to do the teaching the headline is no longer allowed to attempt.

That is the right division of labour and it raises the standard for this section rather than
lowering it. A reader reaching §21.6 has scrolled past a headline, which means they have already
decided the page is worth time — the exact disposition F6 says a headline reader lacks. Everything
below is written for that reader, and none of it is softened to match the H1.

[01-brand-strategy.md](01-brand-strategy.md) §1.4 makes "Rooted" specific: *place names,
altitude, river names, the actual mountain range appear in copy; generic national symbolism is
avoided.* Opening with the village rather than the founder does three things at once: it
establishes provenance before any claim is made, it differentiates from every personal-brand
competitor, and it gives the `en`/`pl`/`de` reader — who does not know Косівщина — the context
that makes the rest legible.

Named explicitly: **вул. Петруші, с. Яворів**, **Косівський район**,
**Івано-Франківська область**, **78644**, and the wool sourcing region `{{WOOL_SOURCE}}`
([00-assumptions.md](00-assumptions.md) A5). **Inside this section «Карпати» alone is forbidden as
the only geographic descriptor** — and after E2 it is not merely forbidden, it is a waste. That
prohibition is section-scoped, not site-wide: F6 makes «в Карпатах» the correct word in the H1
three hundred pixels above, and the two rules do not conflict because they govern readers in
different states ([01-brand-strategy.md](01-brand-strategy.md) §1.2b).

### What can now be said about the place

[00-client-decisions-2.md](00-client-decisions-2.md) E2 supplies four facts that no competitor
outside this village can use:

| Fact | What it does on this page |
|---|---|
| Яворів is the recognised centre of Hutsul lizhnyk weaving — «столиця ліжникарства» | Converts «Карпати», which thousands of sellers claim, into an appellation almost nobody can ([01-brand-strategy.md](01-brand-strategy.md) §1.2b) |
| A dedicated **Музей ліжникарства** exists in the village | A third party has already made the argument. The brand does not have to assert that this craft matters here — an institution asserts it |
| Annual lizhnyk-weaving plein airs draw art historians from Kyiv, Lviv and Ivano-Frankivsk | Evidence that the craft is live and studied, not reconstructed for tourists. This is the sentence that pre-empts the "folk pastiche" suspicion in [01-brand-strategy.md](01-brand-strategy.md) §1.1 |
| Яворів is the home village of the **Шкрібляк** and **Корпанюк** woodcarving dynasties | Two consequences: it makes the village's craft standing checkable through named families, and it retroactively justifies the future ДЕРЕВО category as the village's second craft rather than a gift-shop bolt-on (§1.3) |

**Register warning.** This is the section most likely to drift into tourist-brochure prose, which
would violate §1.5's voice rules on the exact page that most needs them. The fix is the standing
one: state facts, name institutions, and let the reader conclude. «Яворів називають столицею
ліжникарства; тут є Музей ліжникарства» is a fact. «Чарівне гуцульське село, де живе давня
магія ремесла» is the failure mode.

### The heritage reference — verification before publication

> **Resolved by [00-client-decisions-8.md](00-client-decisions-8.md) §L6.** The client confirms the
> craft is on the national register. Approved pattern: «Гуцульське ліжникарство — ремесло, внесене до
> Національного переліку елементів нематеріальної культурної спадщини України.» The designation
> belongs to the craft, never to Вівчарик — that half of the constraint below still binds.

Hutsul lizhnyk weaving is widely described as inscribed on Ukraine's national register of
intangible cultural heritage. It is the most quotable line available to this section, and it is
therefore the one most likely to be written from memory and shipped wrong.

**It is not written until the exact status and wording are confirmed**
([00-client-decisions-2.md](00-client-decisions-2.md) E2, open item 4). Two rules bind whatever
the confirmation says:

1. **The craft may be listed; the company is not.** «Ліжникарство внесено до…» is a statement
   about a craft. Any construction that lets a reader infer that **Вівчарик** holds a heritage
   designation is false, and it is forbidden by §21.12 in the same way award and certificate
   claims are.
2. **It is prose, never a mark.** No seal, no ribbon, no badge, no medallion — identical to the
   30-year rule in §21.3, and for the identical reason: a graphic implies a document.

Unconfirmed, the sentence is simply omitted. The four facts above already carry the section.

### The map component

`features/CarpathianMap`. **A hand-drawn SVG, not a map tile service.**

| Decision | Rationale |
|---|---|
| Inline SVG, ~14–25 KB | Zero third-party requests, zero cookies, no consent gate, no GDPR exposure for `de`. A tile embed costs 300–900 KB and sets cookies before consent |
| Drawn, not photographic satellite | It is a brand illustration in the palette ([09-color-palette.md](09-color-palette.md)) — forest, fleece, sky-300 for water. A satellite tile fights the low-chroma palette and photography-led hierarchy ([08-design-system.md](08-design-system.md) §8.1) |
| Three pin tiers | ● **Яворів** (the workshop), ◉ Косів (the district town, the recognisable name), ◌ the sourcing region as a soft area rather than a point. Яворів is the only pin that carries a second line of label — «столиця ліжникарства» — because the map's job is to make one village matter, not to be geographically complete |
| Labels as SVG `<text>` | Real text, selectable, translatable per locale, scaling with browser zoom. Never rasterised ([10-typography.md](10-typography.md) §10.8) |
| No pan or zoom | It is an orientation diagram, not a navigation tool. Directions live on the production page (§20.12) |
| Ornament as structure | Per [01-brand-strategy.md](01-brand-strategy.md) §1.6: a derived geometric motif may form the map's border rule if removing it breaks the layout. If removing it merely makes the map plainer, it is decoration and must go |

**Accessibility fallback — mandatory, and the map does not ship without it.**

| Layer | Implementation |
|---|---|
| Semantics | `<figure>` with `role="img"` and an `aria-label` naming the region and the three places |
| Long description | A `<figcaption>` that states the same information in prose: «Яворів лежить у Косівському районі Івано-Франківської області, приблизно `{{KM_FROM_KOSIV}}` км від Косова. Село називають столицею ліжникарства». **The map adds nothing a sighted user gets that this sentence does not also carry.** That is the test |
| Reduced motion | Any draw-on reveal is disabled; the map renders complete |
| Contrast | Labels meet AA on the map's fill; `stone-500` on fleece fails for small text ([09-color-palette.md](09-color-palette.md) §9.5) and is not used for them |
| Zoom | Survives 200% text zoom; labels are `rem`-sized and the viewBox scales |
| Print / no-CSS | Renders as a static image with its caption |

## 21.7 The family story, and the curation story

### Family — and it now has names

[00-client-decisions-2.md](00-client-decisions-2.md) E1 resolves the people this section is about:

| Person | Role | How this page uses the name |
|---|---|---|
| **Гондурак Іван Федорович** | Owner of production | The family narrative's subject. «Іван» in running prose, full name once, on first mention |
| **Гондурак Любов Юріївна** | Deputy owner of production; **ФОП, seller of record** | The narrative's second subject. Full name once; the ФОП designation does **not** appear in this section |

Three rules:

1. **Two registers, kept apart.** «Іван і Любов Гондураки» belongs here. `ФОП Гондурак Любов
   Юріївна` belongs to the offer contract, the invoice, the Impressum and the checkout footer —
   not to a narrative paragraph. Merging them makes the story read like a filing and the filing
   read like marketing ([01-brand-strategy.md](01-brand-strategy.md) §1.4).
2. **A husband-and-wife production is a positioning fact, and it is under-used, not over-used.**
   Persona 3's killer objection is "factory or reseller?" ([02-ux-research.md](02-ux-research.md)
   §2.3); two named owners with published mobile numbers is an answer a reseller cannot give, and
   after [00-client-decisions-4.md](00-client-decisions-4.md) G3 one of them will walk a visitor
   through the building. State it once, plainly, without sentiment.
   **The numbers have an order** (G1): Іван `+380679973450` is primary because he owns production
   and runs the tour; Любов `+380679604769` is the fallback, labelled as one. That ordering is the
   *opposite* of the legal surfaces, where Любов is named alone as the ФОП — and the inversion is
   deliberate, not an inconsistency to tidy up. The person who trades and the person who answers the
   phone are different people here, and flattening that produces either a legal page naming the
   wrong party or a contact block naming someone who does not pick up.
3. **Named people do not remove the consent requirement.** Written consent for commercial web use
   across four locales applies to the owners exactly as it applies to every employee (§21.9), and
   GDPR applies to the `de` and `pl` audiences.

[00-assumptions.md](00-assumptions.md) A2 assumes `{{GENERATIONS}}` generations and is still
**unconfirmed**; the page is written so it is true with one generation or three, and the number is
not rendered until confirmed. What remains genuinely missing is `{{ORIGIN_STORY}}`: who started,
with what equipment, and why. E1 supplies who runs it *now*, which is not the same question. Two
hundred words in the client's own voice outperform two thousand written for them, and this is
still the one section that cannot be drafted without the interview.

Register, per [01-brand-strategy.md](01-brand-strategy.md) §1.5: short sentences for facts,
longer sentences for story. No sentimentality — the "Warm" trait means human presence, explicitly
*not* folksy.

### The curation story — placed here deliberately

[00-client-decisions.md](00-client-decisions.md) D3 introduces products from other manufacturers
and names it the largest strategic risk in the project. The wholesale page enforces the split for
trade buyers ([19-wholesale-page-specification.md](19-wholesale-page-specification.md) §19.11).
This page does the consumer-facing framing, once, in the brand's own voice.

**Round 2 answered the question this section was hedged against, and answered it the unhelpful
way.** [00-client-decisions-2.md](00-client-decisions-2.md) E7: partner manufacturers may **not**
be named. The previous draft called the fallback "weaker but still honest" and moved on. It is
worth being more precise than that, because the difference is structural.

| | Naming the partner (unavailable) | What ships |
|---|---|---|
| The sentence | «Ми пишемо, хто це зробив» | «Ми пишемо, що це зробили не ми» |
| What the reader can do with it | Look the maker up. The claim is checkable | Nothing. The claim must be taken on trust |
| What it is | A curation credential — Вівчарик's judgement attached to a named third party | An honest disclosure |

Calling the second column a curation credential would be asserting a quality instead of showing
it, which is the exact move §21.8 exists to prevent. So the copy changes:

> Більшість того, що ми продаємо, ми робимо самі — від сировини до готового виробу.
> Дещо ми не робимо самі, а відбираємо в майстрів з нашого краю. На кожному такому виробі
> написано, що його зробили не ми.

Three properties still make this work rather than read as a hedge:

1. **It is volunteered, not extracted.** D3 is explicit that hiding the fact converts it into a
   discovered deception. A visitor who learns it from the brand experiences honesty; one who
   learns it from a product label after buying experiences a bait. This property is unaffected by
   E7 and it is the one doing most of the work.
2. **It is specific about what is *not* claimed.** Precisely because the partner cannot be named,
   the sentence has to be blunter about ownership rather than softer. The instinct — to shorten
   the disclosure because it now looks unfinished without a name — must be resisted
   ([01-brand-strategy.md](01-brand-strategy.md) §1.7b).
3. **It is verifiable on every PDP as far as it goes.** `Product.origin` and `partnerRegion`
   render on every product page: «Відібрано Вівчариком» + «Виготовлено карпатським майстром»
   where the region is known, «Виготовлено іншим виробником» where it is not. `partnerName` stays
   null and is **never rendered**, anywhere, including in markup and `alt` text.

**Do not compensate for the missing name with a region the client has not stated.** «Косівщина»
and «Гуцульщина» are usable only where `partnerRegion` is actually populated. Inventing a
plausible region to make the label look more complete would be the same failure as inventing a
partner.

### Round 3: the partner goods carry the Вівчарик name

[00-client-decisions-3.md](00-client-decisions-3.md) F3 resolves what E7 left open. Partner-made
items are **sold under the Вівчарик brand**.

The structured-data rule is exact and is stated here because this page is where the brand's own
account of itself lives: `brand` is **Вівчарик for both origins**, and `manufacturer` is Вівчарик
for own manufacture and **omitted entirely** for partner goods — never set to Вівчарик, never
filled with a placeholder. Omission asserts nothing false; substitution would assert something
false in a machine-readable field.

**The tension, stated rather than smoothed over.** This page's central promise is that the brand
does not pass off other people's work as its own. Selling curated goods under your own brand is
ordinary retail and entirely legitimate — and it is also the practice that makes a customer who
later works it out feel that they were managed. The brand name is now on items the brand did not
make, and §21.8's second claim — «Ми не перепродаємо чуже як своє» — has to survive that fact
being discovered rather than told.

It survives on one condition, and the condition is the copy above. **Nothing in the plan changes;
what changes is that there is no slack left in it.** The label is now the only perceptible
difference between the two origins — before F3 a reader might have inferred origin from the name on
the product; after it, they cannot. So:

- The disclosure paragraph above is **not shortened**. The instinct to trim a sentence that admits
  something is strongest exactly when the admission matters most.
- «Відібрано Вівчариком» stays at equal visual weight to «Власне виробництво» on every card and
  PDP, the origin facet stays pinned first, and partner goods stay off the homepage, the hero, the
  production storytelling and the best-seller rail
  ([01-brand-strategy.md](01-brand-strategy.md) §1.7b).
- The sentence «На кожному такому виробі написано, що його зробили не ми» is now doing more work
  than any other sentence in this section, because it is the reader's only advance warning that the
  brand name does not settle the question.

**A customer who discovers the distinction themselves feels misled; a customer who was told plainly
feels informed** (F3). Branding the goods does not change which of those this page is trying to
produce — it changes how little it takes to end up with the wrong one.

Comprehension testing on this exact wording is [02-ux-research.md](02-ux-research.md) §2.8 R5,
promoted to pre-launch if budget allows — the label being tested is the weaker one, and F3 makes it
the only one.

## 21.8 Mission and values as evidence

The section exists, but not as adjectives. Format: **a claim in the brand's voice, the evidence
that makes it checkable, and a link to where the evidence lives.** If a claim has no evidence, it
is deleted rather than softened.

| Claim | Evidence | Links to |
|---|---|---|
| «Ми робимо все самі — від немитої вовни до готової ковдри, від сирої шкури до овчини.» | Seventeen named stages across two material chains, each with a machine, a duration and a person — and each **photographed**, because a stage that cannot be photographed is not claimed | [20-production-page-specification.md](20-production-page-specification.md), E6 |
| «Ми не перепродаємо чуже як своє.» | Every product is marked own-manufacture or partner-made, at equal visual weight, with the origin facet pinned to the top of the filter panel. The partner is **not** named (E7), the goods carry the Вівчарик brand (F3), and the label is therefore the entire distinction — which is why it says so rather than going quiet | Any PDP; the catalogue filter |
| «Ми не ховаємо склад.» | Composition percentages and micron on every specification table | PDP spec table |
| «Ми не вигадуємо історію — до нас можна приїхати. Магазин і виробництво — за однією адресою.» | A real street address in Яворів where **the shop and the production floor are the same place** ([00-client-decisions-3.md](00-client-decisions-3.md) F2), two named people with published numbers, and an honest note that the schedule is flexible so visitors should call first. This is the only claim on the page the reader can verify **without the site's cooperation**, which makes it the strongest row in the table | §21.10, [20-production-page-specification.md](20-production-page-specification.md) §20.11, E3, F2 |
| «Ми не обіцяємо того, чого не маємо.» | No certificate claims anywhere on the site, because there are no certificates — and no heritage designation claimed for the company, because the craft may be listed and a company is not | D1, E2 |

The last row is unusual and is the strongest one available. Stating an absence is a claim no
competitor imitating this page would think to copy, and it pre-empts the exact question a careful
buyer will ask.

Forbidden vocabulary applies in full ([01-brand-strategy.md](01-brand-strategy.md) §1.5):
`ексклюзивний`, `елітний`, `неперевершений`, `100% натуральний` without a certificate, `еко`
standing alone, `автентичний` in a heading.

## 21.9 The timeline component and the people section

### `features/AboutTimeline`

Distinct from `features/ProductionTimeline` ([20-production-page-specification.md](20-production-page-specification.md)
§20.7). Production's timeline is a process index; this one is a narrative sequence. They share
tokens, not code — forcing one component to be both produces a component that is bad at both.

| Requirement | Detail |
|---|---|
| Structure | `<ol>` of `<li>` entries. A timeline is an ordered list; building it from `<div>`s discards the semantics that make it navigable |
| Dates | `<time datetime="1992">` where a year exists; decade headings where it does not. **No invented precision** |
| Reveal | Rise, `dur-reveal` 560 ms, stagger 60 ms capped at 6 ([13-motion-system.md](13-motion-system.md) §13.4). The connector line draws via `stroke-dashoffset` with `animation-timeline: view()` |
| Reduced motion | Line renders complete, entries fade at 200 ms. Every entry, date, photograph and caption is present with no motion at all |
| No counting numerals | Years appear; they never animate upward ([13-motion-system.md](13-motion-system.md) §13.11). An animated «30» would read as a sales gimmick on the exact claim that most needs to read as a fact |
| Keyboard | Entries are not interactive unless they link out. A non-interactive entry is not focusable — adding tab stops to static content is a common false accessibility improvement |
| Content model | `ProductionStage`-style records: a locale-translated title, body, optional year, optional media. Editable without deploy |

### People

| Element | Requirement |
|---|---|
| Portrait | 4:5, at the workstation or in the valley — not against a studio backdrop |
| Name | First name minimum; full name with written consent |
| Role | Specific: «прядильниця», «ткаля», «майстер розкрою» |
| Years here | The strongest number on the page after the 30. A 25-year weaver is the continuity claim embodied |
| One verbatim line | Their words. Unedited beyond punctuation |

Written consent for commercial web use across four locales is a build dependency; GDPR applies to
`de` and `pl` audiences. A person without recorded consent does not render. `{{EMPLOYEE_COUNT}}`
is unconfirmed (A6) and the headcount stat is omitted rather than estimated.

Overlap with [20-production-page-specification.md](20-production-page-specification.md) §20.10 is
intentional but not duplicated: production shows people **working**; this page shows people
**being people**. Different photographs, different captions, same consent register.

### The tour belongs in this section, not at the foot of the page

[00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that visitors may walk the
production floor **with Іван**, arranged in advance by phone. The production page carries it as a
closing argument about the factory (§20.11). This page carries it as a statement about a **person**,
and the placement follows directly from that:

| Page | What the tour is there | Where it sits |
|---|---|---|
| [20-production-page-specification.md](20-production-page-specification.md) | Proof that the process just described is real | The closing block, after seventeen stages |
| **This page** | **What one of the two named people on it will actually do for a visitor** | Inside the people section, attached to Іван's card |

The reasoning is that the tour's whole value is the accompaniment. A self-guided walk through a
workshop is a look at a room; a walk with Іван is time with the person whose name is on the 30-year
claim, which is exactly what §21.9's portraits are asking the reader to care about. Placing the
offer anywhere else on this page separates it from the only thing that makes it worth taking up.

**Treatment.** One short line inside the people block, below Іван's card and attributed to him
rather than to the business — not a bordered call-out, not a second hero, not a repeat of §20.11's
full block:

> «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.»

| Rule | Reason |
|---|---|
| It is stated once on this page | The come-and-see block in §21.10 also invites a visit. Two invitations on one page compete, and the reader resolves the competition by ignoring both. §21.10 keeps the address and the route; §21.9 owns the tour |
| It names Іван, and links the phone number | «Разом із власником» is abstract; the card immediately above it makes it a specific man with a face and a tenure. That adjacency is the entire design |
| No booking mechanism, ever | G3 is explicit: a calendar implies capacity that a two-person business does not have, and an unchased no-show costs more than a missed enquiry. A `tel:` link is the whole interface |
| No fixed times, no «відкрито для відвідувачів» | Over-promising access converts the project's strongest trust asset into a one-star review (G3). The deny list in §21.12 carries this as a forbidden claim |
| It is not translated into an EU "factory visit" offer | The `en`, `pl` and `de` locales get the same sentence, honestly translated. They do **not** get a version implying the trip is practical for them — an unreachable invitation reads as ornament and quietly devalues the claim for the readers who could take it up |

## 21.10 Photography brief for this page

The production page needs process photography. This page needs documentary photography, and the
two briefs are different enough that shooting one and cropping for the other will fail.

**Reuse does not help this page.** [00-client-decisions-2.md](00-client-decisions-2.md) E5 permits
reusing the adjacent business's photographs, which solves catalogue coverage. It solves nothing
here: every frame in that library documents a different workshop in a different village, and this
page's entire subject is *this* village and *these* people. A reused image on this page would
falsify the page's one claim.

What Round 2 did change is scale. The shoot is **descoped, not cancelled** — one or two days in
Яворів covering factory, process, machinery, people and place, shared with
[20-production-page-specification.md](20-production-page-specification.md), rather than a full
catalogue production. The ten shots below are the about-page share of those one or two days; the
ninth was added by [00-client-decisions-3.md](00-client-decisions-3.md) F2 and the tenth by
[00-client-decisions-4.md](00-client-decisions-4.md) G3.

| # | Shot | Purpose | Notes |
|---|---|---|---|
| 1 | **Яворів** with the workshop in it, wide, early or late light | Hero | Landscape 21:9 and 4:3 crops both required. `focalPoint` and `textSafeZone` set so the headline never lands on detail ([09-color-palette.md](09-color-palette.md) §9.6). The village must be legible as a village, not as generic mountains — the headline names it |
| 2 | Any archival photograph, print or negative, from the 1990s | Timeline opening | **The highest-value single image on the site**, and the only one that cannot be re-shot. Grain and fading are assets; do not restore them out |
| 3 | The oldest machine, in use | Timeline / continuity | Shared with [20-production-page-specification.md](20-production-page-specification.md) §20.9 |
| 4 | **Іван and Любов**, in the workshop, working | Family section | Not a posed portrait and not a couple's portrait. Two people doing two things, ideally in one frame. E1 names them; this shot is what makes the name mean something |
| 5 | Hands, close, in wool | Texture break | The one image permitted without a face — the hands *are* the person |
| 6 | Portraits ×`{{PEOPLE_COUNT}}`, 4:5, at the workstation | People | Consistent lens and light across all of them, or the grid looks assembled from different sources |
| 7 | The building from the road on вул. Петруші, as a visitor first sees it | Come-and-see | Answers "will I recognise it" for a real visitor — and with no published opening hours (E3) this shot carries more weight, because it is what a caller is told to look for |
| 8 | Sheep in the landscape | Sourcing | Only if genuinely connected to the supply. A stock-feeling sheep photo undermines the page |
| 9 | **The shop interior, with the workshop visible or adjacent in frame** | Come-and-see | **New, added by [00-client-decisions-3.md](00-client-decisions-3.md) F2.** The block now invites people to a shop, and an invitation to a room nobody has seen is weaker than one photograph of it. The frame must carry both functions at once — goods on a shelf, the floor beyond — because "магазин і виробництво в одному місці" is a claim a single image can prove and two images cannot. Shot on the same one or two days; it costs minutes |
| 10 | **Іван mid-explanation beside a machine, gesturing, with a second person in frame** | People section / the tour line | **New, added by [00-client-decisions-4.md](00-client-decisions-4.md) G3.** §21.9 now offers a walk through the workshop with the owner. The sentence asks the reader to picture something; this is that picture, and without it the strongest asset on the project is a line of text under a portrait. The second person does not need to be identifiable — a shoulder, a back of a head — which also keeps the consent burden to one subject. Shares the shoot with [20-production-page-specification.md](20-production-page-specification.md) §20.16 open item 12; **one frame serves both pages** |

Rules: no flat lay, no white cyclorama, no colour grading beyond a neutral warm profile. Every
image is an evidence photograph that happens to be beautiful, not a beautiful photograph that
gestures at evidence. Every image needs per-locale `alt` and `caption`
([25-database-schema.md](25-database-schema.md) §25.4), and every image on this page carries
`contentLocation` = Яворів — which is precisely why none of them may be reused from elsewhere.
This shoot remains a hard launch dependency ([00-assumptions.md](00-assumptions.md) E1), narrowed
in cost but not in necessity.

## 21.11 Structured data

| Type | Use | Constraint |
|---|---|---|
| `AboutPage` | The page itself, `mainEntity` → `Organization` | |
| `Organization` | Name, logo, `description`, `sameAs`, `address`, `contactPoint` (both numbers) | **`foundingDate` is NOT 1992.** Omit it, or use the operating entity's real registration date. D1 requires the 30-year story to stay editorial rather than machine-asserted. **`sameAs` carries the Google Business Profile only** — there is no Instagram and no other social account (E3), and the property must render correctly when `{{INSTAGRAM}}` is absent rather than emitting an empty entry |
| `LocalBusiness` | `address`, `geo`, `telephone`, `url` | **`openingHours` / `openingHoursSpecification` omitted** (E3) — hours vary day to day and Google Maps is the live source. The address must match the Google Business Profile **byte for byte**; a formatting mismatch is read as a different business (E4). The type may legitimately carry **retail** semantics, since the address is a shop as well as a factory ([00-client-decisions-3.md](00-client-decisions-3.md) F2) — whatever is emitted here must agree with the GBP primary category and with [20-production-page-specification.md](20-production-page-specification.md) §20.15, because three surfaces disagreeing about what the business is costs more than any one of the choices |
| `Brand` | Вівчарик, referenced from `Organization` | **Partner goods carry this brand too** (F3). On product markup elsewhere in the site, `brand` is Вівчарик for both origins and `manufacturer` is Вівчарик **only** for `OWN_MANUFACTURE`, omitted entirely for partner goods. Recorded here because this page is the brand's own account of itself and the two properties must never be conflated in it either |
| `Person` | **Гондурак Іван Федорович** (`jobTitle`: власник виробництва), **Гондурак Любов Юріївна** (deputy owner), plus named staff | Only where **written consent is recorded** — owners included. Do not attach the ФОП designation to the `Person` node; it belongs to the seller-of-record markup on the legal and checkout surfaces |
| `Place` | **Яворів**, `containedInPlace` Косівський район | Feeds entity extraction ([30-ai-search-optimization.md](30-ai-search-optimization.md)). Яворів is a materially stronger entity than «Карпати» because it is unambiguous and already associated with lizhnyk weaving in the sources an AI answer draws on |
| `ImageObject` | Hero and archival images, `contentLocation` = Яворів | Ties imagery to the place claim — and is the reason no reused photograph from the adjacent business may appear on this page (§21.10) |
| ✗ `award`, `hasCredential`, `certification` | — | **Never.** None exist (D1). This explicitly includes any heritage-register reference: the craft may be listed, the company is not (E2), and a heritage status is not a credential a company holds |

The `description` field is where the 30-year sentence lives, in the approved wording. It is prose
in a text field, which is exactly the distinction D1 draws: a claim a human wrote and can qualify,
not a date a machine will treat as verified fact.

## 21.12 Claims that must not appear without documentation

An explicit deny list. Each of these is either legally actionable in Ukraine or under EU consumer
law for the `de`/`pl` locales, or is falsifiable in a way that damages the whole page.

| Forbidden claim | Why | Permitted alternative |
|---|---|---|
| «Компанія заснована 1992 року» / any founding date | The current legal entities are newer (D1). A registration claim is checkable and false | «Понад 30 років виробляємо…» |
| Any certificate, seal, award, accreditation mark | None exist (D1) | «Ми не маємо сертифікатів — маємо цех, куди можна приїхати» |
| «Офіційно засвідчено», «нагороджено», «відзначено» | Same | — |
| `{{GENERATIONS}}` as a number | Unconfirmed (A2) | Omit until confirmed |
| «100% натуральна вовна» as a blanket claim | Requires a composition test per product | Per-product composition percentages on the PDP |
| «Еко», «органічна вовна», «GOTS», «OEKO-TEX» | No certification (A7, D1). These are regulated terms in the EU | Describe the actual process: no synthetic blends, named dye type |
| «Власна отара» / own flock | `{{WOOL_SOURCE}}` unconfirmed (A5) | Name the actual sourcing arrangement, or say nothing |
| «Найбільший виробник», «єдиний в Україні», «№1» | Unprovable superlatives; also forbidden by voice (§1.5) | A specific number: capacity, stages, years |
| «Ручна робота» applied to machine-made goods | The catalogue is largely machine-manufactured, and this is a strength, not something to disguise | `Product.isHandmade` per item, honestly set |
| The 2013 / 2016 dates | They belong to a separate business (D2) | Nothing — they simply do not appear |
| Partner-made goods described as own manufacture | D3; structured-data violation and trust failure simultaneously. **Sharper after F3:** partner goods carry the Вівчарик brand, so `manufacturer` must be **omitted** on them rather than set to Вівчарик, and no sentence on this page may let «наш бренд» stand in for «ми це зробили» | The origin label, on every product; `brand` for both origins, `manufacturer` for own manufacture only |
| **A named partner manufacturer** | The client refused naming (E7). Publishing a name anyway would breach an explicit instruction and expose a commercial relationship the client chose to keep private | `partnerRegion` where populated; «Виготовлено іншим виробником» where not |
| **Any heritage designation attributed to Вівчарик** | Hutsul lizhnyk weaving may be inscribed on the national intangible-heritage register; **a company cannot be.** Wording and status also require confirmation before even the craft-level statement is published (E2) | Once confirmed: a sentence about the craft. Until then: nothing |
| **«бельгійська технологія»** or any borrowed technique name | It belonged to the adjacent business (E6). Inheriting a neighbour's technique name is the same category of error as inheriting their founding dates | Describe what actually happens, with the equipment in the photograph |
| **Fixed opening hours** | Hours vary day to day and Google Maps is the live source (E3). Published hours that are wrong twice a week produce "permanently closed" reports and a stranded visitor who drove an hour | «Графік гнучкий — телефонуйте перед візитом», Іван's number first and Любов's as the fallback (G1), link to the Google Business Profile |
| **Fixed tour times, «відкрито для відвідувачів», «екскурсії щодня», or any implication of drop-in access** | The tour depends on one man being present and willing ([00-client-decisions-4.md](00-client-decisions-4.md) G3). Over-promising access and then being unavailable converts the project's strongest trust asset into a public complaint, and the downside is strictly larger than the upside of appearing more available | «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» Nothing more specific, at any point, in any locale |
| **A booking form, calendar or slot picker for the tour** | Same ruling (G3). A calendar implies staffed capacity that does not exist and produces no-shows nobody chases | A `tel:` link to Іван's number |
| **`isVerifiedPurchase` on a review arriving through the parcel card** | The card carries an unlinked short URL by design ([00-client-decisions-4.md](00-client-decisions-4.md) G4), so such reviews have no order linkage and are excluded from the aggregate. Marking them verified to fill the rating faster is a structured-data violation on the one signal a cold-start brand cannot afford to have distrusted | Publish them unverified, and let `AggregateRating` stay suppressed until three verified reviews exist |
| **Any variant of the approved tagline** — «у Яворові», «з Яворова», «в Косівському районі» in place of «в Карпатах» in the H1 | The client approved «в Карпатах» (D1) and **explicitly declined the Яворів substitution on review** ([00-client-decisions-3.md](00-client-decisions-3.md) F6). Rewriting approved copy without approval is the failure this deny list exists to catch, regardless of whether the rewrite is an improvement | The approved wording in the H1; Яворів in the overline, §21.6, the timeline, the markup and the meta description |
| Employee count, capacity, or output as round numbers | Unconfirmed (A6, D5) | Omit, or state a range that is true |

**Review gate:** this table is the copy sign-off checklist for the page. Any sentence that cannot
be traced to [00-client-decisions.md](00-client-decisions.md), a confirmed audit fact, or a
document the client can produce, does not ship.

## 21.13 Motion, performance, analytics

**Motion.** Timeline entries use Rise; the hero image uses Mask but is exempt from entrance
animation as the LCP element ([13-motion-system.md](13-motion-system.md) §13.8). Mountain fog is
permitted on this hero (§13.7) at zero JS after mount, disabled under `saveData` or ≤4 cores.
Parallax on at most one element. Nothing counts up.

**Performance.** ≤700 KB mobile first view, ≤1.2 MB desktop. The map is inline SVG. No map tiles,
no video. The archival photograph is small and should stay small — its grain compresses badly and
its emotional value does not scale with resolution.

**Accessibility.** One `h1`; a gapless heading outline; the timeline as a real `<ol>`; the map's
figcaption carrying everything the graphic carries; AA contrast on the scrimmed hero; 200% zoom
survival; complete story under reduced motion.

**Events.**

| Event | Trigger | Answers |
|---|---|---|
| `about_page_view` | View | `locale`, `referrer_type` — with no social channel (E3) the split that matters is GBP against direct and organic, not GBP against Instagram |
| `about_timeline_depth` | Furthest timeline entry reached | Whether the story is read or abandoned, and at which entry |
| `about_map_view` | Map ≥50% in view for 1 s | Whether the place framing lands |
| `about_people_view` | People section reached | The rank-2 evidence's actual reach |
| `about_tour_intent` | The tour line's `tel:` link is tapped in §21.9 | Intent only, and the ceiling of what is knowable here. The site cannot see whether the call connected, whether a tour was arranged, or whether it happened — and the two mechanisms that would close that gap are both forbidden by G3. Outcome is a paper tally kept by Іван ([31-analytics-architecture.md](31-analytics-architecture.md) §31.13; [02-ux-research.md](02-ux-research.md) §2.8 R17). Kept distinct from `about_visit_intent`, because «чи можу я приїхати в магазин» and «чи можу я побачити цех» are different questions and merging them makes both unreadable |
| `about_to_production` | Click through to `/vyrobnytstvo` | The §1.10 provenance-consumption metric |
| `about_visit_intent` | Route, call, or Viber tapped | Tourist-region conversion, invisible in e-commerce metrics. Separate `call` from `route`: with no published hours (E3) the call is a required step before a visit, so its volume is the honest measure of visit demand — see [02-ux-research.md](02-ux-research.md) §2.8 R8b. **After F2 this event measures demand for a shop, not curiosity about a workshop**, and it is the only digital trace a counter sale leaves; the corresponding real measurement is the counter tally in [02-ux-research.md](02-ux-research.md) §2.8 R14 |
| `about_place_section_read` | Place section ≥75% in view for ≥3 s | Whether the Yavoriv argument is actually consumed or scrolled past. Pairs with [02-ux-research.md](02-ux-research.md) §2.8 R13 |

## 21.14 Open items and tokens

### Closed by Round 2

| Was | Now |
|---|---|
| Who are the people? | **Іван Федорович and Любов Юріївна Гондурак** (E1). §21.7 and §21.9 rewritten around them |
| Where is the workshop? | **вул. Петруші, с. Яворів, 78644** (E2). §21.6 upgraded from context to argument |
| May partners be named? | **No** (E7). §21.7 carries the weaker wording, and says that it is weaker |
| Confirmed opening hours | **Variable, not published** (E3). §21.10 and the JSON-LD changed |
| Is there any fallback image library? | For the catalogue, yes; **for this page, no** (E5). See §21.10 |

### Closed by Round 3

| Was | Now |
|---|---|
| May the H1 say «у Яворові» instead of the approved «в Карпатах»? | **No** ([00-client-decisions-3.md](00-client-decisions-3.md) F6). Open item 8 is answered and removed. §21.3 and §21.4 reverted; the Яворів argument moves down to §21.6, which is where the reader has the context for it |
| Is the workshop visitable, and as what? | **As a shop** — retail and production share the address (F2). §21.8's strongest evidence row, the come-and-see block and shot 9 in §21.10 all follow from this |
| Under what brand are partner goods sold? | **Вівчарик** (F3). §21.7 gains the structured-data rule and states the tension it creates; no copy is softened as a result |
| Does `{{LEGAL_ID}}` block this page? | **No, and it never did** (F1). It exists and will be supplied; it blocks only WayForPay onboarding, the offer contract and the German Impressum |

### Closed by Round 4

| Was | Now |
|---|---|
| Is the workshop visitable, and by whom? | **Yes — accompanied by Іван, arranged in advance by phone** ([00-client-decisions-4.md](00-client-decisions-4.md) G3). `{{FLOOR_VISIT}}` resolved. §21.9 gains the tour line; §21.10 deliberately does **not** repeat it; §21.12 gains four forbidden claims; §21.10's shot list gains shot 10 |
| Which of the two numbers leads? | **Іван `+380679973450`, Любов `+380679604769` as the fallback** (G1), inverting the legal surfaces where Любов is named alone as the ФОП. §21.7 rule 2 states why the inversion is correct rather than untidy |
| Does anything reach the customer after the parcel arrives? | **Yes — a business card already ships in every parcel** (G4). It is the only route back for a counter-sale buyer, who has no order number and no email on file. Reviews arriving that way stay `isVerifiedPurchase: false` and are excluded from the aggregate, which §21.12 now records as a forbidden shortcut |

### Closed by Round 5

| Was | Now |
|---|---|
| Who owns international quotes? | **Гондурак Любов Юріївна**, as ФОП seller of record ([00-client-decisions-5.md](00-client-decisions-5.md) H3). A commercial role. §21.7's two-register rule is unchanged: the ФОП designation still does not appear in this page's narrative |

### Still open

| # | Question | Blocks |
|---|---|---|
| 1 | `{{ORIGIN_STORY}}` — who started, with what, why, in the client's words | §21.3, §21.7. Still the most valuable unwritten content in the blueprint. E1 answered who runs it now, not who started it |
| 2 | Years for spinning, weaving, sewing and **tanning** being added | Timeline precision; `{{YEAR_TANNING}}` is new |
| 3 | Does an archival photograph exist? | Shot 2, the timeline's strongest asset and the only irreplaceable one |
| 4 | `{{GENERATIONS}}` | §21.7 |
| 5 | `{{WOOL_SOURCE}}` (A5) | §21.6 |
| 6 | Roles, tenure and **written consent** for every person shown, Іван and Любов included | §21.9 — no consent, no card |
| 7 | **Exact status and wording of any Hutsul-lizhnyk heritage reference** (E2, open item 4) | §21.6's strongest sentence. Omitted until confirmed |
| 8 | Documentary shoot in Яворів, one to two days, shared with §20 (E5) — **now including shot 9, the shop interior, and shot 10, Іван mid-explanation on the floor** | The page |
| 11 | **Client approval of the tour wording** ([00-client-decisions-4.md](00-client-decisions-4.md) G3 supplies it pending approval) | §21.9's tour line. The sentence is not interchangeable; an improvised alternative is how a careful invitation becomes a promise of access the business cannot keep |
| 9 | `{{KM_FROM_KOSIV}}` for Яворів | §21.6 figcaption |
| 10 | Confirmation that the Google Business Profile primary category reflects **both** retail and manufacturing (F2, open item 3) | §21.11's `LocalBusiness` type and the GBP-to-site channel this page depends on |

Tokens introduced: `{{ORIGIN_STORY}}`, `{{YEAR_SPINNING}}`, `{{YEAR_WEAVING}}`,
`{{YEAR_SEWING}}`, `{{YEAR_TANNING}}`, `{{KM_FROM_KOSIV}}`, `{{PEOPLE_COUNT}}`.
Carried: `{{GENERATIONS}}`, `{{WOOL_SOURCE}}`, `{{EMPLOYEE_COUNT}}`, `{{DOMAIN}}`,
`{{INSTAGRAM}}` (**may never resolve** — no account exists, E3; every surface referencing it must
render correctly when absent).

Resolved and no longer tokens on this page: `{{FACTORY_ADDRESS}}` = вул. Петруші, с. Яворів,
Косівський район, Івано-Франківська область; `{{POSTAL_CODE}}` = 78644; `{{LEGAL_ENTITY_NAME}}` =
ФОП Гондурак Любов Юріївна (legal surfaces only, not this page's narrative).
`{{YEARS_EXPERIENCE}}` is **resolved** to «понад 30» by
[00-client-decisions.md](00-client-decisions.md) D1. `{{LEGAL_ID}}` **exists and will be supplied**
([00-client-decisions-3.md](00-client-decisions-3.md) F1); it blocks WayForPay onboarding, the offer
contract and the German Impressum, and it does not block this page. The public contact address is
`info@vivcharyk.shop` ([00-client-decisions-8.md](00-client-decisions-8.md) §L1, §L2). `gif19601@gmail.com` is the Owner's login and is never shown.
