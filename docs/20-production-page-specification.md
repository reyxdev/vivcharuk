# 20 — Production Page Specification

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Stages one after another on scroll, each with photos and **its own short video clip** (part 7).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Stages claimed, and only these:** вичинка шкур (овчина і шкіра), миття, чесання, прядіння, ткання, валяння, пошиття. **Not claimed:** own flock, shearing, dyeing — raw wool and dyed material are bought (follow-up §F1). «Від сирої вовни до готового виробу».
> - Photography and video show **hands and process, never faces**. The wet hide stages must be filmed (R21).
> - Tours: no separate page; mentioned on contacts.


Route: `/{locale}/vyrobnytstvo` (`uk`), `/en/production`, `/pl/produkcja`, `/de/produktion`.

> **Authority note.** Written against [00-client-decisions-3.md](00-client-decisions-3.md), now the
> highest-authority document, then [00-client-decisions-2.md](00-client-decisions-2.md), then
> [00-client-decisions.md](00-client-decisions.md), which supersedes the audit. D1 confirms
> continuous manufacturing since 1991–1992 covering washing, combing, spinning, weaving and sewing.
>
> **Round 2 changed this page more than any other.** E6 closes the tanning question that dominated
> the previous draft: Вівчарик performs the **whole process from raw material to finished goods
> in-house**, so wool, sheepskin and leather are all `OWN_MANUFACTURE` and both pipelines may be
> specified as own work. The «бельгійська технологія» framing is **removed entirely** — it
> belonged to the adjacent business. E2 resolves the location to **с. Яворів**, not Вербовець, and
> E3 makes opening hours variable rather than fixed.
>
> **Round 3 changes §20.11 specifically, and confirms this page's use of the village name.** F2
> establishes that the Яворів address houses **a shop as well as the production floor**, which
> turns the visit block from an under-used asset into the page's strongest single conversion
> element. F6 reverts the site **tagline** to «в Карпатах» — but explicitly keeps Яворів named and
> explained on this page, because this is where the reader has the context that makes a proper noun
> worth teaching. Nothing about the Yavoriv material below is reduced.
>
> **Round 4 gives this page its closing argument, and it is not a page element.**
> [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that visitors may **tour the
> production floor accompanied by Іван**, arranged in advance by phone. Everything above §20.11 on
> this page is photographs and video of a process; this offers to show the reader the process
> itself, standing next to the person who owns it. It outranks [01-brand-strategy.md](01-brand-strategy.md)
> §1.8's evidence hierarchy in full, including film of the factory at rank 1. §20.11 is rewritten
> around it. G1 also fixes the phone order in that block: **Іван primary, Любов fallback**.
>
> **Round 4 also tightens §20.2 into a shoot brief.** The photograph-or-delete rule in §20.1 binds
> the hide pipeline to the camera: a stage that cannot be photographed must not be claimed, which
> means the storyboarded hide stages are not content decisions at all — they are **required shots on
> the Яворів shoot**. If a stage cannot be filmed, this page loses that sequence permanently. Stated
> explicitly in §20.2 and carried into
> [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.3's photography scope.
>
> **Round 5 touches this page only at the edges.** [00-client-decisions-5.md](00-client-decisions-5.md)
> H1.1 and H3b add a 14-day made-to-order path for custom sizes; where §20.13 links into products,
> the made-to-order state is the PDP's concern, not this page's. Nothing in the stage narrative
> changes.

## 20.1 The page's job

[01-brand-strategy.md](01-brand-strategy.md) §1.8 ranks evidence types and puts film of the
actual factory at rank 1, named people at rank 2, photographed process at rank 3. All three live
here. This page is where the brand's central claim stops being a claim.

> **Job, in one sentence:** convert "we make it ourselves" from a sentence into something the
> visitor has watched happen.

Six specific consequences follow, and each of them is a build constraint rather than a mood:

1. **This page carries the 30-year claim's proof burden.** D1 is explicit: no certificates, no
   award documents, no anniversary paperwork exists. The only available substantiation is
   showing the machines and the people. A thirty-year-old carding machine, filmed running, is
   the certificate.
2. **This page is the origin thesis' enforcement point for consumers**, as
   [19-wholesale-page-specification.md](19-wholesale-page-specification.md) §19.11 is for trade.
   Everything shown here is `ProductOrigin.OWN_MANUFACTURE`
   ([00-client-decisions.md](00-client-decisions.md) D3). Partner goods never appear in
   production storytelling — that rule is stated in D3 item 5 and this page is where it binds.
   **[00-client-decisions-3.md](00-client-decisions-3.md) F3 makes the rule stricter in effect
   without changing its wording:** partner goods are sold under the Вівчарик brand, so brand name
   alone no longer distinguishes them. A partner product appearing in §20.13 or in any stage
   photograph would therefore be indistinguishable from own manufacture to every reader, which is
   precisely the misattribution this page exists to make impossible. §20.13's query filters on
   `ProductOrigin`, not on brand, and that is not an implementation detail — it is the rule.
3. **This page is the cold-start SEO asset.** D2 establishes that commercial head terms will not
   rank for a year. Long-tail informational content will. «Як роблять ліжник», «як виготовляють
   вовняну ковдру», «що таке валило» are exactly the queries a new domain can win, and they
   resolve here and into [22-blog-specification.md](22-blog-specification.md).
4. **This page is the highest-value internal destination.** [01-brand-strategy.md](01-brand-strategy.md)
   §1.10 sets homepage-to-production entry rate at >18% as a success metric, and
   [02-ux-research.md](02-ux-research.md) §2.8 R1 makes production-page reach a segmenting
   variable in the cohort analysis. If this page is not reached, the strategy is not working.
5. **This page is where the Yavoriv claim is cashed — and after Round 3 it is one of the few pages
   that cash it.** [01-brand-strategy.md](01-brand-strategy.md) §1.2b argues that «яворівський»
   functions as an appellation where «карпатський» is noise.
   [00-client-decisions-3.md](00-client-decisions-3.md) F6 then rules that the **tagline** keeps «в
   Карпатах», because a headline is read by someone who has not yet agreed to learn a new proper
   noun. The governing pattern is «Карпати» to be understood, «Яворів» to be believed — and a
   visitor who has arrived on `/vyrobnytstvo` has already done the understanding. **This page is
   the believing.** The hero overline, the H1 and the intro all name the village, in full, without
   apology; nothing here is softened to match the tagline, because the two surfaces are doing
   different jobs. An appellation is only worth anything if the thing it names can be seen at the
   address, and this is the page that shows the address working.
6. **This page now carries a shop, not only a workshop.**
   [00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms retail and production share the
   Яворів address. A factory the reader can only watch is still a claim, however well filmed; a
   shop attached to the floor they have just watched is the claim already settled. §20.11 is
   rewritten around this, and it stops being the page's quiet closing section.
7. **And the page now ends with an offer to show the reader the floor in person.**
   [00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that a visitor may walk the
   production floor **with Іван**. This is the page's closing argument in the strict rhetorical
   sense: everything preceding it is the brand's evidence about itself, presented by the brand, on
   the brand's page. The tour is the reader's own evidence, obtained without the brand's
   participation in the verification. A page that spends 2 MB of video demonstrating a process and
   then declines to let anyone see it has made an argument against itself; a page that ends with
   «приходьте і подивіться» has made the argument unnecessary. §20.11 carries it, and the ordering
   matters — the offer lands after the reader has seen what they would be looking at, never before.

### The rule that governs every claim on this page

[00-client-decisions-2.md](00-client-decisions-2.md) E6 confirms the full cycle and simultaneously
sets the constraint that keeps the confirmation honest:

> **Photograph the stages you claim. Any stage that cannot be photographed is not asserted.**

This is self-policing by construction. It needs no auditor, it converts each claim into a
production task with a visible output, and it makes it impossible for the page to drift further
than the camera went. Applied concretely: a stage with no photograph does not render, and a stage
that renders without a photograph fails review (§20.6). The same rule is stated as brand policy in
[01-brand-strategy.md](01-brand-strategy.md) §1.8.

**The consequence that must be stated out loud, because it is a scheduling fact rather than an
editorial one.** The rule binds this page's content to a single day or two of camera work in
Яворів. Every stage storyboarded in §20.2 is therefore **a required shot on that shoot**, not a
content item that can be written later and illustrated when convenient. There is no fallback
library for it: reused photographs from the adjacent business document a different workshop in a
different village and are barred from this page (§20.15). The scope statement, in one line: **if a
stage is not filmed in Яворів, this page does not have that stage, permanently.** That is recorded
as a photography-scope requirement in
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.3 rather than left as an
implication here, because the party who can act on it is the shoot planner and the party who
discovers it otherwise is the content editor, six weeks too late.

The same rule cuts the other way and is worth naming: it is a **defence against scope creep on the
page**, not only on the shoot. A stakeholder who wants a stage added cannot add it by writing
copy. They have to send someone with a camera.

The sheep mark is permitted here — [00-client-decisions.md](00-client-decisions.md) D2 confirms
the shepherd identity as brand core, and this page is not on the §1.7 exclusion list. It appears
once, as the scroll-progress mark in the chapter rail (§20.7), in a single colour, at maker's-mark
scale. Not as a guide character, not as a narrator, not more than once per viewport.

## 20.2 The honest stage inventory — two material worlds

The business works two fundamentally different materials with two unrelated process chains. A
page that pretends otherwise, or that shows only wool because wool photographs better, is the
kind of omission that this entire blueprint exists to avoid.

### Track A — Wool. 7 stages. Confirmed.

[00-client-decisions.md](00-client-decisions.md) D1 confirms industrial washing, combing,
spinning, weaving and sewing; [00-assumptions.md](00-assumptions.md) A4 states the full seven.

| # | Stage (`uk`) | English | What is shown | Unknown |
|---|---|---|---|---|
| A1 | Сортування і миття | Sorting and scouring | Raw fleece graded by hand, then washed. Sorting is folded into this stage rather than given its own — it is 40 seconds of work, not a chapter | `{{WASH_TEMP}}`, `{{WASH_DURATION}}` |
| A2 | Сушіння | Drying | Natural or forced-air drying; volume shrinks visibly | `{{DRY_METHOD}}` |
| A3 | Чесання / скубання | Carding and combing | The single most photogenic stage. Fleece enters matted, leaves as continuous sliver | `{{CARDER_MAKE}}`, `{{CARDER_YEAR}}` |
| A4 | Прядіння | Spinning | Sliver drawn to yarn; twist and count are set here | `{{YARN_COUNTS}}` |
| A5 | Фарбування | Dyeing | Where dye-lot identity is created (D4, D6 item 3) | `{{DYE_TYPE}}`, `{{DYE_TEMP}}` |
| A6 | Ткання / валяння | Weaving and fulling | Loom for ліжники and килими; fulling to raise the nap. If a traditional water-powered валило is used, this is the strongest single sequence on the site | `{{LOOM_TYPE}}`, `{{FULLING_METHOD}}` |
| A7 | Оздоблення і пошиття | Finishing and sewing | Edging, fringing, making up гуні, камізельки, капці, пояси | `{{SEWING_MACHINES}}` |

### Track B — Hide and sheepskin. 10 stages. **Confirmed in-house.**

[00-client-decisions-2.md](00-client-decisions-2.md) E6 settles what the previous draft treated as
the single largest open item on this page:

> «Так, Вівчарик самостійно проводить весь процес від сировини до виробів.»

Tanning is own work. `Вироби з овчини` and `Шкіряні вироби` are `OWN_MANUFACTURE` alongside the
wool categories, and this page specifies the hide pipeline at the same evidentiary standard as the
wool pipeline rather than as a supplier acknowledgement. The gated-content-flag mechanism the
previous draft carried is no longer needed and is removed; there is one answer, and it is built.

**Two corrections that come with the confirmation:**

1. **«Бельгійська технологія» is deleted, not renamed.** It was observed on the adjacent business
   and is not Вівчарик's claim to inherit. Stage B5 is simply **Вичинка** — tanning — described by
   what actually happens in the room, with whatever the real method is named only once the client
   states it and it can be filmed. Borrowing a technique name from a neighbouring business would
   be precisely the misattribution this page exists to make impossible.
2. **The confirmation raises the evidence burden it satisfies.** A ten-stage in-house tanning
   claim is a much larger assertion than "we sew bought hides", and §20.1's rule applies with full
   force: **tanning is claimed only if tanning is photographed.** If the wet stages cannot be
   filmed — and there are legitimate reasons a liming pit is hard to shoot — the honest outcome is
   fewer asserted stages, not an unillustrated list.

**The hide table below is therefore a shot list before it is a content plan.** This is the single
most consequential operational point on this page. Track B is the harder track to film — the wet
stages are dim, humid, chemically hostile to equipment, and on a schedule the shoot does not
control — and it is simultaneously the track whose claim is largest. The two facts compound: the
stages hardest to photograph are the ones carrying the most weight, so an under-planned shoot loses
precisely the sequences the page most needs.

| Stage group | Filming difficulty | What is lost if it is not shot |
|---|---|---|
| B1–B2 selection, salting | Low — dry, static, well-lit | The by-product framing that answers the `de` ethical objection. Recoverable later |
| **B3–B5 soaking, liming, tanning** | **High.** Wet, dim, and the process runs on its own clock | **The entire in-house tanning claim.** E6's confirmation becomes unusable: the page would assert ten stages and illustrate seven, which §20.6's render rule forbids outright. The fallback is not a weaker claim — it is Track B collapsing to a finishing pipeline, and with it the "a reseller can buy photography but not a liming pit" argument in §20.2 |
| B7, B9 softening, cutting | Medium — mechanical, visible, schedulable | Two of the three expanded stages. Track B would carry one signature stage instead of three, which is not enough to justify a chapter |

**Planning consequence.** B3–B5 must be scheduled against the tannery's actual working cycle rather
than against the shoot's convenient hours, and that is a constraint on the *shoot date*, not on the
shot list. If the wet stages are not running on the days the photographer is present, no amount of
time on site produces them. This is carried as a named risk in
[35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.3, because it is the one
photography dependency that a second visit cannot cheaply fix.

| # | Stage (`uk`) | English | Note |
|---|---|---|---|
| B1 | Відбір шкур | Selection | Grading by size, thickness, wool length |
| B2 | Соління і консервація | Salting and curing | The stage that makes the by-product-of-food-industry framing concrete for the `de` locale — relevant even though `de` launches wool-only ([00-client-decisions-2.md](00-client-decisions-2.md) E11), because the `uk` page is still read by EU visitors |
| B3 | Відмочування | Soaking | Rehydration; the first wet stage |
| B4 | Зоління | Liming | Loosening; chemically the most demanding stage |
| B5 | Вичинка | Tanning | Own work (E6). Method named only when the client states it **and** it can be photographed. No borrowed technique names |
| B6 | Сушіння | Drying | |
| B7 | Розм'якшення | Softening and staking | Mechanical; the hide becomes cloth-like |
| B8 | Розчісування хутра | Combing the fur | |
| B9 | Розкрій | Cutting | Pattern laid against an irregular natural shape — visibly skilled work |
| B10 | Пошиття | Sewing | Shared with A7's floor and people |

**What this does for the page's argument.** Seventeen in-house stages across two unrelated material
chains, in one building, in one village, is a materially stronger claim than seven stages plus a
supply arrangement. It is also the answer to Persona 3's killer objection
([02-ux-research.md](02-ux-research.md) §2.3) in a form no reseller can imitate: a reseller can buy
good photography, but not a liming pit.

### How one page holds both without becoming twice as long

Four mechanisms, applied together:

| Mechanism | Effect |
|---|---|
| **Asymmetric depth** | Wool gets all 7 stages at full depth — video, photo, person, machine, duration. Hide gets 10 stages in a compact timeline with **3 signature stages expanded** (B5 tanning, B7 softening, B9 cutting) and the remaining 7 as timeline entries with one photo and two lines each. This is not a compromise and it is **not** a hedge about ownership — E6 confirms both pipelines as own work. It is the wool-led *scope* decision from D3 expressed as page structure, and it also matches the shoot budget: one or two days in Яворів (E5) produces enough coverage for seven deep stages and ten shallow ones, not for seventeen deep ones |
| **Shared terminal stage** | A7 and B10 are the same room, the same machines, the same people. The page says so and shows it once, which closes both tracks into a single ending rather than two |
| **Track switch, not tab** | A sticky control offers «Вовна» / «Шкура та овчина». It scrolls between two chapters of one document; it does not hide content, does not change the URL's identity, and both chapters remain in the DOM for search and for Ctrl-F |
| **Deferred media** | Track B's video and images are not fetched until its chapter enters the viewport or the switch is used. A visitor who only reads the wool chapter downloads roughly half the page |

Result: roughly 60/40 wool-to-hide in vertical extent and 75/25 in byte weight, on a page that is
honest about both.

## 20.3 Desktop wireframe

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SiteHeader                                                                │
├───────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓ HERO — full-bleed video, 100vh capped at 820px ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓ OVERLINE  ВИРОБНИЦТВО · с. ЯВОРІВ, КОСІВСЬКИЙ РАЙОН                  ▓ │
│ ▓ H1  «Понад 30 років. Сімнадцять етапів. Один дах.»  display-xl       ▓ │
│ ▓     (was "Сім етапів" — E6 confirms both pipelines as own work)      ▓ │
│ ▓ Scroll cue ↓  + 0:00/2:14 duration hint                              ▓ │
│ ▓ [ Дивитись фільм ] ghost — opens the 2-min cut in a lightbox          ▓ │
├───────────────────────────────────────────────────────────────────────────┤
│ §20.5 INTRO — container-narrow, 760px. 3 paragraphs. NO parallax.        │
│   Sets the 30-year frame (D1 wording), names the village, states that    │
│   everything on this page is own manufacture.                           │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌ TRACK SWITCH (sticky, z-sticky, appears after intro) ─────────────────┐ │
│ │  ( • ) ВОВНА  ·  7 етапів      (   ) ШКУРА ТА ОВЧИНА  ·  10 етапів   │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ CHAPTER A — ВОВНА                                                        │
│                                                                           │
│  ┌ rail ┐ ┌──────────────────────────────┬────────────────────────────┐  │
│  │  ●A1 │ │ STICKY MEDIA COLUMN          │ SCROLLING TEXT COLUMN      │  │
│  │  ○A2 │ │ cols 1–7, full-bleed left    │ cols 8–12                  │  │
│  │  ○A3 │ │                              │                            │  │
│  │  ○A4 │ │  [ video loop / photo,       │  01 — СОРТУВАННЯ І МИТТЯ   │  │
│  │  ○A5 │ │    4:5 portrait, radius-none]│  h2                        │  │
│  │  ○A6 │ │                              │  Body, max 66ch            │  │
│  │  ○A7 │ │  crossfades between stages   │  ┌──────────────────────┐  │  │
│  │      │ │  as the text column scrolls  │  │ Тривалість {{…}}     │  │  │
│  │ 30%  │ │                              │  │ Температура {{…}}    │  │  │
│  │ ░░░  │ │                              │  │ Машина  {{…}}        │  │  │
│  │  🐑  │ │                              │  │ Хто робить  Ім'я     │  │  │
│  └──────┘ │                              │  └──────────────────────┘  │  │
│           │                              │  [ ▸ Дивитись 12 с ]       │  │
│           └──────────────────────────────┴────────────────────────────┘  │
│           …repeats for A2…A7, media column pinned, text scrolling…       │
│                                                                           │
│  ┌ BEFORE / AFTER — full-bleed, between A3 and A4 ────────────────────┐   │
│  │  [ raw fleece ]  ◀═══ draggable handle ═══▶  [ combed sliver ]     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────────────────────────┤
│ CHAPTER B — ШКУРА ТА ОВЧИНА                                              │
│  Compact horizontal timeline: B1 ─ B2 ─ ●B5 ─ B6 ─ ●B7 ─ B8 ─ ●B9 ─ B10 │
│  3 expanded stages use the same sticky-media pattern; 7 are timeline      │
│  cards, 1 photo + 2 lines each.                                          │
│  ┌ BEFORE / AFTER ─────────────────────────────────────────────────────┐  │
│  │  [ raw salted hide ] ◀═══ handle ═══▶ [ finished sheepskin ]        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────────────┤
│ §20.9 MACHINERY — bg-alt, 3-col grid                                     │
│  card: photo · name · {{year}} · what it does · which stages use it      │
├───────────────────────────────────────────────────────────────────────────┤
│ §20.10 PEOPLE — bg-page, asymmetric editorial grid                       │
│  4:5 portraits, name, role, years at the workshop, one verbatim line     │
├───────────────────────────────────────────────────────────────────────────┤
│ §20.11 VISIT — inverted forest-900, full-bleed. THE CLOSING ARGUMENT     │
│  cols 2–6: «ПРИЇЗДІТЬ: МАГАЗИН І ВИРОБНИЦТВО В ОДНОМУ МІСЦІ» (F2)       │
│            ── TOUR SUB-BLOCK (G3) ───────────────────────────────       │
│            «Цех можна оглянути — разом із власником.»                   │
│            «Зателефонуйте заздалегідь, щоб домовитися про час.»         │
│            [ Подзвонити Івану  +380679973450 ]  primary CTA             │
│            Любов +380679604769 — якщо не відповідає                     │
│            «Графік гнучкий — телефонуйте перед візитом»                 │
│  cols 7–11: MAP + text directions + «Прокласти маршрут» deep links       │
│  NO calendar, NO booking form, NO stated tour times — ever (G3)          │
├───────────────────────────────────────────────────────────────────────────┤
│ §20.13 PRODUCTS MADE HERE — own manufacture only, 4 cards + link         │
├───────────────────────────────────────────────────────────────────────────┤
│ SiteFooter                                                                │
└───────────────────────────────────────────────────────────────────────────┘
```

## 20.4 Mobile wireframe

```
┌────────────────────────┐   Notes
│ ☰  Вівчарик        UK▾ │
│ ▓ HERO 70vh            │   poster frame is LCP, never animated (13 §13.8)
│ ▓ H1 display-md        │   video replaced by poster + explicit play button
│ ▓ [ ▸ Дивитись фільм ] │
├────────────────────────┤
│ INTRO 3 paragraphs     │   container-narrow, measure 62–68ch (10 §10.4)
├────────────────────────┤
│ [ ВОВНА | ШКУРА ]      │   sticky segmented control, 48px targets
├────────────────────────┤
│ ── 01 ─────────── 1/7 ─│   stage number + counter, not a progress bar
│ ┌────────────────────┐ │
│ │ MEDIA 4:5          │ │   one stage per screen. Media is NOT sticky on
│ │ autoplay muted     │ │   mobile — sticky media halves the reading area
│ └────────────────────┘ │   on a 375px viewport
│ СОРТУВАННЯ І МИТТЯ  h2 │
│ Body copy, 2–3 ¶       │
│ ┌────────────────────┐ │
│ │ Тривалість  {{…}}  │ │   fact block is a definition list, always open,
│ │ Температура {{…}}  │ │   never an accordion — it is the evidence
│ │ Машина      {{…}}  │ │
│ │ Робить      Ім'я   │ │
│ └────────────────────┘ │
│ ── 02 ─────────── 2/7 ─│
│ …                      │
├────────────────────────┤
│ BEFORE / AFTER         │   tap-to-toggle on mobile, not drag; a drag
│ [ ДО ] [ ПІСЛЯ ]       │   handle competes with page scroll
├────────────────────────┤
│ CHAPTER B — timeline   │   vertical, 10 rows, 3 expanded
│ MACHINERY — 1 col      │
│ PEOPLE — 1 col         │
│ МАГАЗИН І ВИРОБНИЦТВО  │   the shop headline leads the block (F2); map is
│ ┌────────────────────┐ │   a static image until tapped (§20.12); no hours
│ │ ЦЕХ МОЖНА ОГЛЯНУТИ │ │   table — call-ahead line instead (E3)
│ │ — разом із власником│ │
│ │ [ ПОДЗВОНИТИ ІВАНУ ]│ │   48px target, tel: link, the block's only
│ │ Любов — якщо не     │ │   primary action. Fallback number is text, not
│ │ відповідає          │ │   a second competing button (G1)
│ └────────────────────┘ │
│ + map + 2 phones       │
│ PRODUCTS MADE HERE     │
└────────────────────────┘
```

## 20.5 Scrollytelling architecture

### The technique, named exactly

**Sticky media column plus scrolling text column, driven by `IntersectionObserver` on the text
blocks and a CSS `position: sticky` media frame.** Media crossfades between stages via opacity on
stacked absolutely-positioned layers.

This is a deliberate choice over three alternatives that are more fashionable and worse here:

| Rejected | Why |
|---|---|
| Scroll-hijacking / pinned horizontal scroll | Breaks native scroll momentum, breaks find-in-page, breaks keyboard scrolling, and is close to unusable with a screen reader. It also breaks the browser's scroll restoration, which matters for the multi-session behaviour in [02-ux-research.md](02-ux-research.md) §2.3 |
| Canvas image-sequence scrubbing (the Apple technique) | 60–200 frames at usable quality is 4–12 MB before any product image loads. It cannot be reconciled with a 98–100 Performance target or with mountain-valley 3G ([02-ux-research.md](02-ux-research.md) §2.3 Persona 1) |
| Per-element `scroll` event handlers | Explicitly forbidden by [13-motion-system.md](13-motion-system.md) §13.5: writing to the DOM from a scroll handler guarantees jank on mid-range Android |

### Implementation and the performance contract

Per [13-motion-system.md](13-motion-system.md) §13.5, strictly:

| Rule | Application here |
|---|---|
| Animate only `transform` and `opacity` | Stage crossfade is `opacity`. The rail progress mark is `transform: translateY`. Nothing animates `height`, `top` or `background-color` |
| Scroll-linked animation runs on the compositor | `animation-timeline: view()` where supported; Framer Motion `useScroll` fallback, one shared listener for the whole page |
| ≤12 concurrently animating elements | Two media layers crossfading + one rail mark + one text block rising = 4. Well inside budget |
| 0 long tasks over 50 ms during scroll | Stage activation only toggles a class and plays/pauses a video; no layout reads in the callback |
| CLS from animation = 0 | The media frame has a fixed aspect-ratio box from `Media.width/height` ([25-database-schema.md](25-database-schema.md) §25.4). The sticky container's height is set from the text column, never measured in JS |
| Framer Motion ≤34 KB gzip, lazy below the fold | The hero and intro are pure CSS. Framer Motion loads with chapter A |
| `will-change` applied on interaction, removed after | Applied to the active media layer only, removed on crossfade completion. Never a blanket rule in CSS |
| Parallax on ≤3 elements per viewport | Used on exactly one: the chapter-break wind-in-grass layer ([13-motion-system.md](13-motion-system.md) §13.7) |

Motion vocabulary is limited to **Rise**, **Mask** and **Parallax** from §13.4. Stage headings use
Mask (`clip-path` reveal, `dur-cinematic`, `ease.expo`) because it is the signature editorial move
and this is the page it was designed for. Body text uses Rise. Nothing uses Morph.

Durations come from the narrative clock (§13.1): 450–900 ms. The track switch, being a direct
interaction, uses the interaction clock at `dur-base` 220 ms. Confusing the two on this page would
make the switch feel broken.

## 20.6 Stage content specification

Every stage renders the same six-slot structure. The structure is the argument: a stage without a
named person and a named machine is a claim, and this page does not make claims.

| Slot | Required | Content | Fails review if |
|---|---|---|---|
| **Photograph** | Yes | 4:5 portrait, `MediaRole.PRODUCTION`, alt text per locale | No person and no evidence of one ([01-brand-strategy.md](01-brand-strategy.md) §1.4, "Warm") |
| **Video** | Yes for A1–A7 and B5/B7/B9 | 8–14 s silent loop, the machine actually working | Slow-motion or colour-graded beyond a neutral grade — it starts to look like advertising, which undoes the evidence |
| **Duration** | Yes | How long this stage takes, in real units — hours, days | Stated as "quickly" or "carefully" |
| **Temperature** | Where applicable | A1 wash, A5 dye, B3–B5 | Rounded to a marketing number |
| **Machine** | Yes | Name, and year where it supports the 30-year story | Generic ("сучасне обладнання") |
| **Person** | Yes | First name, role, years at the workshop | Anonymous |

**The render rule that enforces E6's constraint.** A stage record with no `MediaRole.PRODUCTION`
photograph **does not render at all** — it is not rendered with a placeholder, an icon, or a
text-only card. This is a data-layer rule, not an editorial guideline, and it is what makes
"photograph the stages you claim" self-enforcing rather than aspirational: an unphotographed stage
cannot reach the page, so an unsupported claim cannot either. The corollary is that the stage
inventory in §20.2 is a *maximum*, and the page ships with whatever subset the Yavoriv shoot
actually covered.

Worked example, stage A3, showing the register required:

```
03 — ЧЕСАННЯ                                             overline + h2

Мита і висушена вовна йде на чесальну машину. Сплутане руно
розділяється на паралельні волокна і виходить безперервною стрічкою —
рівницею. Від того, скільки разів вовна пройде через барабани,
залежить, наскільки рівною буде пряжа.

Тривалість      {{A3_DURATION}}
Машина          {{CARDER_MAKE}}, {{CARDER_YEAR}} р.
Хто робить      {{A3_PERSON_NAME}}, {{A3_PERSON_YEARS}} років у цеху
Далі            → Прядіння
```

Three copy rules, from [01-brand-strategy.md](01-brand-strategy.md) §1.5:

1. **Numbers over adverbs.** «Двічі через барабани» beats «ретельно».
2. **No forbidden vocabulary.** `ексклюзивний`, `елітний`, `автентичний` in a heading, `еко` as
   a standalone claim, `100% натуральний` without a certificate — and D1 confirms there are no
   certificates.
3. **Never assert authenticity.** The page demonstrates it. The moment it says «автентичний», it
   is not.

**Content model.** Stages are `Post`-like structured records rather than hand-built components,
so the client can add a stage, reorder, or correct a temperature without a deploy. Each stage
carries a locale translation row with title, body, and the four fact fields; media is linked via
`MediaRole.PRODUCTION`. The schema addition is a `ProductionStage` + `ProductionStageTranslation`
pair following the §25.2 pattern, referenced by `Product.productionStage[]` so a PDP badge links
to the matching stage anchor.

## 20.7 The interactive timeline component

`features/ProductionTimeline`, already named in [08-design-system.md](08-design-system.md) §8.4.
It serves two different presentations from one component.

**Presentation 1 — the chapter rail (Track A, desktop).** A fixed vertical rail at the left
margin: seven dots, the active one filled, a hairline connector, and the sheep mark as the
progress indicator travelling the connector. Each dot is a real anchor link with an accessible
name («Етап 3: Чесання»), so the rail is a table of contents, not decoration.

**Presentation 2 — the compact timeline (Track B, all breakpoints; Track A on mobile).**
Horizontal on desktop, vertical on mobile. Ten nodes, three marked as expandable.

Behaviour requirements:

| Requirement | Detail |
|---|---|
| Keyboard | `role="list"`; each node a link; arrow keys move between nodes; Enter jumps and moves focus to the stage heading |
| Screen reader | The rail is `<nav aria-label="Етапи виробництва">`. The active stage is announced via `aria-current="step"`, not via colour |
| Deep-linkable | Every stage has a stable `id`; `/vyrobnytstvo#chesannia` is shareable and is what a blog article links to |
| Scroll position restoration | Hash navigation does not fight the sticky media column — the observer is disabled for one frame after a programmatic scroll |
| Reduced motion | The sheep mark does not travel; the active dot simply changes state |
| Progress is not a percentage | «3 / 7», not «43%». A percentage implies a completion task; this is a document |

## 20.8 Before / after comparisons

Two instances, each placed at the exact moment the transformation has just been described.

| Instance | Placement | Left | Right |
|---|---|---|---|
| Wool | Between A3 and A4 | Raw greasy fleece, matted, off-white to grey | Combed sliver, parallel, clean |
| Hide | After B7 | Raw salted hide, stiff, edges curled | Finished sheepskin, soft, fur combed |

**Interaction.** Desktop: a draggable divider over two identically framed photographs. Mobile:
two buttons, «До» / «Після», toggling opacity. A drag handle on mobile competes with page scroll
and loses.

**Requirements that make this component honest rather than a gimmick:**

- Both photographs are shot from the same position, same lens, same light. A comparison where the
  "after" is better-lit is an advertisement, not evidence.
- Both carry independent alt text; a screen-reader user gets both descriptions in sequence
  regardless of the slider.
- The divider is keyboard-operable: focusable, arrow keys move it in 5% steps, `aria-valuenow`
  set. It is a `role="slider"`, not a `div` with a pointer listener.
- Under reduced motion the divider does not animate to position; it jumps.
- Both images are in the DOM and both are indexable. The "after" is never a CSS background.

## 20.9 The machinery section

The machines are the 30-year claim's physical evidence (§20.1), which makes this section load-
bearing rather than a curiosity.

Card anatomy: photograph, machine name, `{{year}}` where known, one sentence on what it does, and
the stages it serves as links back into the narrative.

| Rule | Why |
|---|---|
| A machine older than the brand is the point | D1's continuity claim rests on it. Lead with the oldest |
| Never claim "modern European equipment" without naming it | Generic equipment claims are what resellers write |
| Photograph in place, in use, dusty | A cleaned-up staged machine photograph reads as a brochure |
| Sound matters | At least one video here carries audio, offered behind a control, never autoplaying with sound. Machine noise is the cheapest unfakeable signal available ([02-ux-research.md](02-ux-research.md) §2.3 Persona 3) |
| No stage is outsourced, so no outsourcing sentence is needed | E6 confirms the full cycle in-house. The previous draft reserved space here for an honest disclosure about external dyeing or tanning; that space is now used for the **tanning equipment** instead, which is the machinery a visitor is least likely to expect and therefore the most persuasive card in the grid |
| Never borrow a technique name | «Бельгійська технологія» belonged to the adjacent business and is removed (E6). A method is named here only when the client states it and the equipment performing it is in the photograph |

## 20.10 The people section

Rank 2 evidence in [01-brand-strategy.md](01-brand-strategy.md) §1.8, and the only section that
cannot be produced without the client's cooperation.

### The two people who anchor it

[00-client-decisions-2.md](00-client-decisions-2.md) E1 resolves the names, which closes the gap
that made §1.4's "Warm" trait unbuildable:

| Person | Role on this page | Treatment |
|---|---|---|
| **Іван Федорович Гондурак** | Owner of production | The first card. Photographed **in the workshop, working or inspecting**, not at a desk. His card is where the 30-year claim is attached to a face rather than to a number |
| **Любов Юріївна Гондурак** | Deputy owner of production | The second card. Photographed in production, not in an office — her ФОП role is a legal fact that belongs on the legal pages, and mixing the two registers here weakens both |

Two rules that are easy to get wrong:

1. **Do not put the ФОП designation on this page.** «Гондурак Любов Юріївна» is the seller of
   record on the offer contract, the invoice, the Impressum and the checkout footer. Here she is a
   named person doing named work. A production page that reads like a company registration extract
   loses exactly the warmth this section exists to produce
   ([01-brand-strategy.md](01-brand-strategy.md) §1.4).
2. **Owners are not exempt from the consent record.** Being the owner is not the same as having
   given written consent to be published across four locales, and GDPR still applies to the `de`
   and `pl` audiences. The consent gate below applies to them identically.

### Card requirements

| Element | Requirement |
|---|---|
| Portrait | 4:5, at the workstation, working — not a posed headshot against a wall |
| Name | First name minimum; full name with consent. For Іван and Любов, full name is expected — they are the owners and the name is the credential |
| Role | Specific: «власник виробництва», «прядильниця», «ткаля», «майстер розкрою». Not «співробітник» |
| Tenure | Years at the workshop. This is where a 25-year employee does more for the 30-year claim than any badge |
| One line, verbatim | Their words, in quotes, unedited beyond punctuation |

**Consent is a build dependency, not a content task.** Every person photographed must give
written consent covering commercial web use across four locales, and GDPR applies to the `de` and
`pl` audiences. Record consent status per person; a person without recorded consent does not
render. `{{EMPLOYEE_COUNT}}` is unconfirmed ([00-assumptions.md](00-assumptions.md) A6) and the
stat is omitted rather than estimated.

The founder or family appears here only briefly. The full family narrative belongs to
[21-about-page-specification.md](21-about-page-specification.md); this page is about the work.

## 20.11 The visit — a shop, a production floor, and a tour with the owner

[00-client-decisions-2.md](00-client-decisions-2.md) E2 resolves the address, and it is a better
asset than the previous draft could know: **вул. Петруші, с. Яворів, Косівський район,
Івано-Франківська область, 78644**.

Яворів is not merely "in a tourist region". It is the village the craft is named after — «столиця
ліжникарства» — with its own Музей ліжникарства and annual lizhnyk-weaving plein airs. Visitors
are already in the village *for this specific craft*, which is a qualification level no paid
channel produces. A workshop that can be walked into, four kilometres from a museum about what it
makes, is the strongest local asset on the project
([01-brand-strategy.md](01-brand-strategy.md) §1.2b).

### Round 3: it is a shop, and that is a different offer

[00-client-decisions-3.md](00-client-decisions-3.md) F2 states it plainly — «там знаходиться і
магазин і виробництво». Retail and production share the address.

The previous draft invited the reader to *look*. It can now invite them to *buy*, and the
difference is not a matter of degree:

| | Previous framing | After F2 |
|---|---|---|
| What is offered | A look at a working workshop, with an implied awkwardness about whether buying is possible | A shop, with the production floor attached and visible |
| What the visitor risks | Driving an hour to stand in someone's workplace | Driving an hour to a shop — an ordinary, low-risk errand that happens to end in a weaving room |
| What it proves | That the factory exists | That the factory exists **and that the goods in the shop came out of it**, which is the whole argument of this page, demonstrated without a single sentence of copy |
| Where it sits in the evidence ranking | Below rank 1 — it is an invitation, not evidence | **Above rank 1** ([01-brand-strategy.md](01-brand-strategy.md) §1.8). Every other signal is something the brand shows; this is something the visitor verifies themselves |

Two further consequences that belong to this section rather than to the contact page:

1. **It is a cold-start channel that does not depend on search.** With no social presence (E3) and
   a domain with no authority, footfall in a craft-tourism village is one of very few launch
   channels available, and the only one that costs nothing (F2).
2. **The journey runs both ways.** Visitors who buy at the counter become the site's second-order
   customers weeks later, from another city, usually buying a gift
   ([02-ux-research.md](02-ux-research.md) §2.3 Persona 1). This block is therefore not only an
   exit from the site — it is an entrance to it, which is why the address, the names and the
   photographs here must match exactly what the visitor saw in person.

### Round 4: the tour — this page's closing argument

[00-client-decisions-4.md](00-client-decisions-4.md) G3 answers `{{FLOOR_VISIT}}` in four words —
«відвідувачі можуть оглянути цех з Власником» — and in doing so supplies the strongest single trust
asset on the project.

**Why it closes the page rather than opening it.** The reader arriving at §20.11 has just scrolled
through seventeen stages, ten to fifteen video loops, named machines, named people and a village
name repeated in every heading. All of it is testimony. Testimony is what the category's resellers
also produce, at lower cost and often with better lighting, and the reader knows it — that is
anxiety A3 in [02-ux-research.md](02-ux-research.md) §2.4 and it is the category's primary
objection. The tour is the only element on this page that is not testimony:

| | What the page does above §20.11 | What the tour does |
|---|---|---|
| Who supplies the evidence | Вівчарик | The visitor |
| What the reader must accept on trust | That the footage is of this factory, that the machine is this machine, that the person is a real employee | Nothing |
| What a reseller can imitate | All of it, with a budget | None of it. A reseller has no floor to show |
| Cost of the claim being false | Low — nobody checks a video | Catastrophic and immediate. Which is exactly why the offer is credible before anyone takes it up |

That last row is the mechanism, and it is worth stating because it justifies placing the block at
the page's end rather than treating it as a contact detail. An offer to be inspected is a costly
signal in the economic sense: it is cheap to make if true and ruinous if false, so a reader who will
never drive to Косівський район still updates on it. The tour therefore does work for the visitor in
Kyiv who will never take it, which is the majority of readers and the reason it belongs on this page
at all rather than only on the contact page.

**Placement rule.** It comes *after* the stages, never before. A reader who has not yet seen what
happens in the building has no idea what they are being invited to look at, and the invitation reads
as a generic "visit us". A reader who has just watched a carding drum has a specific reason to want
to stand next to it. Order is the whole effect.

**The copy, pending client approval** ([00-client-decisions-4.md](00-client-decisions-4.md) G3
suggests it verbatim):

> «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.»

Each clause is doing a job and none may be dropped:

| Clause | Job | What breaks without it |
|---|---|---|
| «Цех можна оглянути» | States that the production floor, not only the shop, is open to a visitor | Without it the reader assumes the shop is the whole offer, which F2 already covers and which is a far weaker claim |
| «разом із власником» | Names the accompaniment, which is the entire value | A self-guided visit is a tour of a room. An accompanied one is a conversation with the person whose name is on the 30-year claim — and it is what makes §20.10's people section pay off |
| «Зателефонуйте заздалегідь» | Sets the mechanism and, silently, the constraint | Without it the offer reads as drop-in, and a visitor arriving unannounced to a two-person business finds a locked door |
| «щоб домовитися про час» | Frames the call as arranging, not as asking permission | «Зателефонуйте, щоб дізнатися, чи можна» invites a no. Same fact, opposite posture |

**What must never be built, and why this is a design constraint rather than a preference (G3):**

| Forbidden | Reason |
|---|---|
| A booking calendar or slot picker | It implies staffed capacity. Two people run a factory; there is no one to chase a no-show and no one to staff a slot that was booked three weeks ago. A calendar widget converts a generous offer into an unmet commitment |
| Published tour times | The same problem as published opening hours (E3), with a higher penalty: a visitor who drove an hour for a 14:00 tour that is not running has had a worse experience than one who simply found the shop shut |
| «Відкрито для відвідувачів» / "open to the public" | It describes a visitor centre. This is a workplace that welcomes people, which is a materially different and more attractive thing |
| A form that collects a preferred date | It creates an expectation of a reply and a queue nobody owns. The phone is the mechanism; the phone is answered by the person who runs the tour |
| Any implication of unlimited availability | G3 is explicit: over-promising access converts the project's strongest asset into a one-star review, and the downside is larger than the upside |

**The asymmetry that governs the tone.** An under-promised tour that turns out to be generous
produces a delighted visitor and, plausibly, the site's first review. An over-promised tour that
turns out to be unavailable produces a public complaint from someone who drove through a valley to
get it. These outcomes are not symmetric in magnitude, so the copy is written from the pessimistic
side: an invitation, arranged by phone, with no promise of when.

**Interaction requirements:**

| Requirement | Detail |
|---|---|
| The call is the primary action | One `tel:` button, 48 px minimum target ([11-spacing-system.md](11-spacing-system.md) §11.7), labelled with the action and the person: «Подзвонити Івану». A number that is not a link is a number an older visitor will mistype |
| The fallback number is text, not a second button | Two primary buttons of equal weight force a choice the visitor cannot make — they do not know who is available. Іван first, Любов as «якщо не відповідає» ([00-client-decisions-4.md](00-client-decisions-4.md) G1) |
| Desktop shows the number as text as well as a link | `tel:` on desktop frequently opens nothing. The digits must be selectable and copyable |
| The tour block is inside §20.11, not a separate section | Splitting it creates two "come and see us" blocks competing on one screen. One block, one call to action |
| No mascot | §20.1's rule holds: the sheep appears once, in the chapter rail. A mascot beside an invitation to a real workplace undercuts it |

### Hours are variable, and that changes the block

[00-client-decisions-2.md](00-client-decisions-2.md) E3 states that hours differ day to day — one
day 11:00–19:00, another different — and that **Google Maps is the live source**. The previous
draft's hours table, including the Sunday line, is therefore removed.

This is not a downgrade. Publishing hours that are wrong twice a week is worse than publishing
none: it produces "permanently closed" user reports, erodes the Google Business Profile's trust
signals, and strands exactly the visitor who drove an hour through a valley to get there.

**The invitation block, on the inverted surface:**

```
ПРИЇЗДІТЬ: МАГАЗИН І ВИРОБНИЦТВО В ОДНОМУ МІСЦІ

с. Яворів. Магазин і цех — за однією адресою.
Можна зайти, побачити машини в роботі
і купити те, що зроблено тут.

┌──────────────────────────────────────────────────────┐
│  Цех можна оглянути — разом із власником.            │
│  Зателефонуйте заздалегідь, щоб домовитися про час.  │
└──────────────────────────────────────────────────────┘

Графік гнучкий — телефонуйте перед візитом.

Іван    +380679973450          вул. Петруші, с. Яворів
Любов   +380679604769          Косівський район
        якщо Іван не відповідає Івано-Франківська обл., 78644

[ ПОДЗВОНИТИ ІВАНУ ]  primary
[ Прокласти маршрут ]  [ Написати у Viber ]
[ Актуальний графік у Google Maps → ]
```

The headline is the one line
[00-client-decisions-3.md](00-client-decisions-3.md) F2 recommends verbatim, and it earns its place
by doing two things at once: «магазин» removes the visitor's uncertainty about whether they are
allowed to come, and «в одному місці» is the provenance claim compressed into three words. The
second line's «купити те, що зроблено тут» is the same sentence this entire page spends 2 MB of
video making — it is worth saying in text as well, because a reader who skimmed the stages will
still read this.

Five requirements, each with a reason:

1. **No fixed hours are published anywhere** — not in the block, not in the footer, not in
   `LocalBusiness` JSON-LD, which omits `openingHours` entirely and carries `telephone`, `address`,
   `geo` and `url` only (§20.15). One live source, and it is Google's, because that is the one the
   client actually updates.
2. **Both numbers are shown, with names against them, and in a fixed order.** A single anonymous
   number is a switchboard; two named mobiles are two people. This is the cheapest "Warm" signal on
   the page ([01-brand-strategy.md](01-brand-strategy.md) §1.4) and it costs one line of markup.
   [00-client-decisions-4.md](00-client-decisions-4.md) G1 fixes the order: **Іван
   `+380679973450` first**, because he owns production and runs the tour, **Любов
   `+380679604769` second**, labelled as the fallback. `LocalBusiness` → `telephone` carries
   **Іван only** (§20.15); a second number belongs in `contactPoint`, not in a singular property.
   This is deliberately *not* the person named on the legal pages — Любов is the ФОП seller of
   record there (G1) — and the split between who trades and who answers must not be flattened on
   either surface.
3. **The call-ahead line is framed as courtesy, not as a caveat.** «Телефонуйте перед візитом»
   reads as sensible for a working workshop; «Графік може змінюватися без попередження» reads as an
   excuse. Same fact, opposite effect. G3 gives the same call a second and better reason: it is how
   the tour is arranged, so the call stops being a check on opening hours and becomes the first step
   of the strongest thing this page offers.
4. **No booking form, and now this is a ruling rather than a launch-scope decision.** A form implies
   a managed tour and a staffed calendar. [00-client-decisions-4.md](00-client-decisions-4.md) G3
   forbids building one at any stage: a calendar widget implies capacity that does not exist and
   creates no-shows nobody chases. A phone number, a Viber link and an honest note about the
   schedule imply a real workshop you can walk into, which is both more accurate and more
   attractive.
5. **The shop is named, not implied.** «Можна зайти» could describe a tour; «магазин» describes a
   transaction the visitor already knows how to perform. Naming it is what converts the block from
   an invitation a polite reader will decline into an errand they can justify — and F2's whole value
   is that it removes the social cost of turning up.

**What this block is not.** It is not a pickup-shipping row moved up the page. «Забрати в
Яворові» as a delivery method is a saving; this block is an invitation
([00-client-decisions-3.md](00-client-decisions-3.md) F2), and the two must read differently even
though they name the same address. The checkout may be transactional about it; this page is not.

**Analytics consequence.** With no published hours, the call button carries more of the visit
funnel than it otherwise would, which is why `production_visit_intent` (§20.16) separates `call`
from `route` — see [02-ux-research.md](02-ux-research.md) §2.8 R8b. F2 adds a second reason: a
visit that ends at the shop counter produces **no session, no event and no order** on the site, so
these three events are the only digital trace the channel leaves. The honest measurement is a tally
at the counter ([02-ux-research.md](02-ux-research.md) §2.8 R14); the events are a proxy, and should
be read as one.

**The tour is measurable only as intent, and that limit must be stated rather than engineered
around.** The site can record that a reader tapped the call button inside the tour sub-block. It
cannot record whether the call connected, whether a tour was arranged, whether it happened, or
whether it produced an order weeks later from a different device. There is no instrumentation that
closes that gap at a cost proportionate to the decision it would inform, and the two mechanisms that
would — a booking form or a per-visitor code — are both forbidden by G3 for reasons stronger than
measurement. The honest position, specified in
[31-analytics-architecture.md](31-analytics-architecture.md) §31.13 and recorded as R17 in
[02-ux-research.md](02-ux-research.md) §2.8: **intent is instrumented, outcome is a paper tally
kept by Іван**, and the dashboard says so instead of implying a funnel it does not have.

## 20.12 Map and directions

| Requirement | Implementation |
|---|---|
| No third-party map on first load | A static map image with a marker; the interactive embed loads on click. An eagerly-embedded Google map costs 300–900 KB, adds third-party connections, and sets cookies before consent — unacceptable against Performance 98–100 and against `de`-locale GDPR expectations ([10-typography.md](10-typography.md) §10.7 applies the same self-hosting logic to fonts) |
| Text directions alongside | «`{{KM_FROM_KOSIV}}` км від Косова дорогою на Яворів», landmark-based, with вул. Петруші named because a village street is easier to ask for than to navigate to. Valley GPS is unreliable and an older visitor may not use navigation at all. Worth naming the Музей ліжникарства as a landmark: it is signposted, locals know it, and it reinforces the provenance claim while giving directions |
| Deep links, not one map | Google Maps, Apple Maps, and Waze. Assuming one provider fails a meaningful share of users |
| Coordinates published | Explicit lat/long in text, copyable, and in `LocalBusiness` structured data |
| Accessibility | The static map has alt text describing the location in words. The address is real text, never rendered into the image ([10-typography.md](10-typography.md) §10.8) |
| Consent | The interactive embed loads only after an explicit click, which doubles as the consent gate for the `de` locale |

## 20.13 Reduced motion — the fallback must still tell the whole story

[13-motion-system.md](13-motion-system.md) §13.6 states the rule: **content still arrives, motion
does not.** On a scrollytelling page this is where most implementations degrade into an unreadable
stack, because the narrative was carried by the motion rather than by the content.

| Normal | `prefers-reduced-motion: reduce` |
|---|---|
| Sticky media column, crossfading | Media column un-sticks. Each stage becomes a conventional media-above-text block |
| Stage heading Mask reveal | Present immediately, no clip |
| Body Rise | Fade only, 200 ms |
| Stage video loops | Poster frame plus an explicit play control (§13.6) |
| Sheep mark travelling the rail | Static mark; the active dot changes state |
| Before/after drag animation | Divider jumps; the two-button toggle is offered on all breakpoints |
| Wind-in-grass chapter breaks | Disabled entirely, not slowed |
| Track switch transition | Instant jump with focus moved to the chapter heading |

**The test that this fallback has to pass:** with motion disabled, JavaScript disabled, and CSS
`position: sticky` unsupported, the page still reads top to bottom as a complete illustrated
account of seventeen production stages, in order, with every photograph, caption, duration,
machine and person present. If any fact exists only inside an animation, it is in the wrong place.

The same requirement produces the AI-search outcome: a crawler that executes no JavaScript sees
the entire narrative as semantic HTML. The accessibility fallback and the
[30-ai-search-optimization.md](30-ai-search-optimization.md) requirement are the same
implementation.

## 20.14 Video strategy and bandwidth budget

Persona 1 in [02-ux-research.md](02-ux-research.md) §2.3 opens this page on degraded mobile data
in a mountain valley. That is the design case, not the edge case.

### Asset plan

| Asset | Length | Use | Audio |
|---|---|---|---|
| Hero loop | 12–16 s | Background, muted, loops | None |
| The film | 2:00–2:30 | Lightbox on demand from the hero | Yes, with captions in four locales |
| Stage loops ×10 | 8–14 s each | One per major stage | None |
| One machine clip | 20–30 s | Machinery section, audio behind a control | Yes |

### Delivery rules

1. **Nothing autoplays on mobile.** Poster frame plus a play control. This alone is the difference
   between a 3 MB and a 300 KB first view.
2. **Stage loops lazy-load one stage ahead** via `IntersectionObserver` with a `rootMargin` of one
   viewport. Never all seven at once.
3. **Only one video element plays at a time.** Off-screen videos are paused, and everything pauses
   on `document.hidden` (§13.7).
4. **AV1 with H.264 fallback**, delivered from Cloudinary with `f_auto` and per-breakpoint
   renditions. Silent loops are muxed without an audio track — an empty audio track is pure waste.
5. **`saveData`, ≤4 cores, or `2g`/`slow-2g`** → every video is replaced by its poster. Not
   degraded: replaced.
6. **Captions are mandatory** on the film and the machine clip (WCAG 1.2.2), authored per locale.
7. **The hero poster is the LCP element** and is never animated on entrance (§13.8).

### Budget, enforced in CI

| Scenario | Ceiling |
|---|---|
| Mobile first view (hero poster + intro + stage 1) | **≤600 KB** |
| Desktop first view | **≤1.4 MB** |
| Full desktop scroll through both chapters | ≤6 MB |
| Any single stage loop | ≤400 KB |
| The film | ≤14 MB, loaded only on explicit request |
| Framer Motion | ≤34 KB gzip (§13.5) |

A page that cannot be read on 3G cannot do job 1, and this is the page where job 1 is the whole
point.

## 20.15 Structured data

The opportunity here is larger than on any other page, and one part of it is a trap.

| Type | Use | Note |
|---|---|---|
| `Organization` | Brand identity, `description` carrying the 30-year story | **`foundingDate` must NOT be 1992** ([00-client-decisions.md](00-client-decisions.md) D1). Omit it, or set it to the operating entity's real registration date. The 30-year claim is editorial prose, never a machine-asserted date |
| `LocalBusiness` | `address`, `geo`, `telephone`, `url` | **`telephone` carries Іван's `+380679973450` only** ([00-client-decisions-4.md](00-client-decisions-4.md) G1) — the property is singular in practice, and Любов's number belongs in `contactPoint` if it is marked up at all. **`openingHours` / `openingHoursSpecification` are omitted** ([00-client-decisions-2.md](00-client-decisions-2.md) E3): hours vary day to day, and structured data that is wrong twice a week damages the profile it is meant to support. The address must match the Google Business Profile **byte for byte** — a formatting difference is treated as a different business (E4). **The type may legitimately carry retail semantics** ([00-client-decisions-3.md](00-client-decisions-3.md) F2): the address is a shop as well as a factory, so `Store` — a `LocalBusiness` subtype — is defensible and is what surfaces the business for "де купити ліжник" intent that a manufacturer-only profile cannot answer. Whatever type is chosen here must agree with the GBP primary category; two sources disagreeing about what the business *is* is worse than either choice alone |
| `VideoObject` | The film and each stage loop | `name`, `description`, `thumbnailUrl`, `uploadDate`, `duration`, `contentUrl`. This is the highest-value markup on the page — video results are a realistic ranking surface for a new domain where text results are not |
| `ImageObject` | Stage photographs | `contentLocation` set to **Яворів**. Ties the imagery to the place claim. Reused photographs from the adjacent business (E5) **must not** carry this property — they were not taken here, and asserting otherwise in markup is the machine-readable version of the lie this page exists to prevent |
| `HowTo` | The wool pipeline, 7 steps | **Use with care.** `HowTo` describes something the reader can do. This describes what the factory does. It is defensible if each step is genuinely instructional; if it is narrative, use `Article` with `articleSection` per stage instead. Recommendation: `Article` on this page, and reserve `HowTo` for the blog's genuine instructional pieces ([22-blog-specification.md](22-blog-specification.md)) |
| `BreadcrumbList` | Navigation | |
| `Place` | **Яворів** as a named entity, Косівський район as its containing place | Supports the entity-extraction strategy in [30-ai-search-optimization.md](30-ai-search-optimization.md). Яворів is a far more valuable entity than «Карпати» because it is unambiguous and already associated with lizhnyk weaving in the sources an AI answer draws on ([01-brand-strategy.md](01-brand-strategy.md) §1.2b) |

**The AI-search angle.** [01-brand-strategy.md](01-brand-strategy.md) §1.5 note 3 observes that
named entities are what AI search engines extract and cite. This page is dense with them:
seventeen named stages, named machines with years, **named owners — Іван and Любов Гондурак** —
a named village that is itself a recognised craft entity, named temperatures and durations. That
is precisely the shape of content that gets quoted. The requirement is that every one of those
facts exists as plain semantic text, not only inside a video or an animation — which is the same
requirement as §20.13.

**One entity that must never appear:** a heritage designation attached to Вівчарик. Hutsul lizhnyk
weaving is widely described as inscribed on Ukraine's national intangible cultural heritage
register, and that status — once confirmed in its exact wording
([00-client-decisions-2.md](00-client-decisions-2.md) E2) — may be stated about **the craft**. It
may never be stated, implied, or marked up as a property of **the company**. No `award`, no
`hasCredential`, no seal graphic. The craft may be listed; a company is not.

## 20.16 Analytics and open items

### Events

| Event | Trigger | Parameters |
|---|---|---|
| `production_page_view` | Page view | `locale`, `referrer_type`, `entry_hash` |
| `production_stage_view` | Stage ≥60% in view for ≥2 s | `stage_id`, `track` |
| `production_track_switch` | Track switch used | `to_track` |
| `production_depth` | Scroll depth milestones | `pct` 25/50/75/100 |
| `production_video_play` | Any video plays | `asset_id`, `trigger` autoplay/manual |
| `production_film_open` | The 2-min film is opened | `source` |
| `production_beforeafter_use` | Comparison interacted with | `instance` |
| `production_visit_intent` | Route, call, or Viber tapped in §20.11 | `action` |
| `production_tour_intent` | The call button **inside the tour sub-block** is tapped | `action: call`. Distinct from `production_visit_intent` because the intents differ: one is «is the shop open», the other is «may I see the floor». Conflating them makes both unreadable. **This is intent only** — see §20.11's analytics note and [31-analytics-architecture.md](31-analytics-architecture.md) §31.13 |
| `production_to_pdp` | Click into a product from §20.13 | `product_id` |

`production_stage_view` per stage is what answers whether production content actually sells, and
whether the seventh stage is ever reached. If drop-off is at stage 3, the page is too long and the
answer is fewer, deeper stages rather than faster animation. Paired with
[02-ux-research.md](02-ux-research.md) §2.8 R1 it segments that drop-off by entry channel — a
visitor arriving from the Google Business Profile has different patience here than one arriving
from an article — and with R13 it tests whether the Yavoriv framing in the hero changes how far
down the page people get.

### Closed by Round 2

| # | Was | Now |
|---|---|---|
| 1 | Is tanning done in-house? | **Yes** (E6). Track B is a full pipeline. The largest open item on this page is closed |
| 2 | Is the Belgian tanning method Вівчарик's claim? | **Moot — the framing is deleted** (E6). It belonged to the adjacent business |
| 3 | Are dye lots tracked? | **No** (E8). Stage A5 copy carries the honest between-batch note; no lot identifier is displayed |
| 4 | Confirmed opening hours | **Variable, and not published** (E3). §20.11 rewritten; JSON-LD omits `openingHours` |
| 5 | Is there a fallback image library? | **Partly** (E5). Reuse covers the catalogue but not this page — see below |

### Changed by Round 3

| # | Was | Now |
|---|---|---|
| 1 | Is the workshop visitable, and in what sense? | **It is a shop as well as a production floor** ([00-client-decisions-3.md](00-client-decisions-3.md) F2). §20.11 rewritten around the shop; the invitation is no longer speculative |
| 2 | Does the H1 / hero name Яворів or Карпати? | **Both, on their own surfaces.** F6 reverts the site **tagline** to «в Карпатах»; this page keeps Яворів in the overline, the H1 and the intro. The pattern is «Карпати» to be understood, «Яворів» to be believed (§20.1 item 5) |
| 3 | Could a partner product ever reach §20.13 by accident? | **A more expensive mistake than before.** Partner goods carry the Вівчарик brand (F3), so the filter must be on `ProductOrigin` and nothing else (§20.1 item 2) |

### Changed by Round 4

| # | Was | Now |
|---|---|---|
| 1 | Is the workshop visitable, and by whom? | **Yes — accompanied by Іван, arranged in advance by phone** ([00-client-decisions-4.md](00-client-decisions-4.md) G3). `{{FLOOR_VISIT}}` is resolved. §20.11 gains the tour sub-block and this page gains its closing argument. No booking system, ever |
| 2 | Which number leads the visit block? | **Іван `+380679973450`, with Любов `+380679604769` as the fallback** (G1). `LocalBusiness` → `telephone` is Іван only. Legal pages continue to name Любов as the ФОП — the two surfaces are deliberately different |
| 3 | Is the hide stage inventory a content plan? | **No — it is a shot list** (§20.2). The photograph-or-delete rule binds every Track B stage to a required shot on the Яворів shoot, and B3–B5 must be scheduled against the tannery's working cycle rather than the photographer's. Carried into [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.3.3 |

### Still blocked on a client answer

| # | Question | Blocks |
|---|---|---|
| 1 | **The Yavoriv shoot** — one or two days covering factory, process, machinery, people, place, **the shop interior, and the workshop as a visitor on a G3 tour actually sees it** (E5, [00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 9) | The entire page. Reused photographs document a different workshop in a different village and cannot appear here (§20.15) |
| 2 | **Which stages can actually be photographed**, particularly the wet hide stages B3–B5 — **and on which days those stages are running** | The stage inventory, and the shoot *date* rather than only the shot list. Per §20.1, §20.2 and §20.6, an unphotographed stage does not render and is not claimed. If B3–B5 are not filmed, Track B collapses to a finishing pipeline and E6's in-house tanning confirmation becomes unusable on this page |
| 3 | Is a traditional водяне валило used? | Stage A6, and the strongest potential sequence on the site |
| 4 | Machine makes, models and years — now including the tanning equipment | §20.9, and the 30-year claim's evidence |
| 5 | Roles, tenure and **written consent** for every person shown, Іван and Любов included | §20.10 — no consent, no card |
| 6 | The real name of the tanning method, if the client wishes to name one | Stage B5. Nothing is written until stated and filmed |
| 7 | Exact status and wording of any Hutsul-lizhnyk heritage reference (E2, open item 4) | Any sentence in §20.5 or §20.15 referencing it. Omitted until confirmed |
| 8 | `{{KM_FROM_KOSIV}}` and the landmark directions for Яворів | §20.12 |
| 9 | **Does the Google Business Profile primary category reflect both retail and manufacturing?** ([00-client-decisions-3.md](00-client-decisions-3.md) F2, open item 3) | §20.15's `LocalBusiness` type choice, and the whole GBP-to-site channel. A manufacturer-only category suppresses retail intent; a shop-only category discards the manufacturing story |
| 10 | Is the shop floor itself photographable, and is it presentable? | §20.11. The block invites people to a shop; one photograph of that shop is worth more than the block's copy, and it is not currently on the shot list in [21-about-page-specification.md](21-about-page-specification.md) §21.10 |
| 11 | **Approval of the tour copy** «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» ([00-client-decisions-4.md](00-client-decisions-4.md) G3, suggested pending approval) | §20.11's tour sub-block. The wording is not interchangeable — every clause is load-bearing, and the failure mode of an improvised alternative is a promise of access the business cannot keep |
| 12 | **One photograph of Іван with a visitor on the floor**, or failing that of Іван mid-explanation beside a machine | §20.11's tour sub-block. The block asks the reader to picture being walked through the workshop; an image of exactly that is the difference between an offer and a sentence. It is not on any existing shot list |

### Tokens introduced

`{{WASH_TEMP}}`, `{{WASH_DURATION}}`, `{{DRY_METHOD}}`, `{{CARDER_MAKE}}`, `{{CARDER_YEAR}}`,
`{{YARN_COUNTS}}`, `{{DYE_TYPE}}`, `{{DYE_TEMP}}`, `{{LOOM_TYPE}}`, `{{FULLING_METHOD}}`,
`{{SEWING_MACHINES}}`, `{{A1..A7_DURATION}}`, `{{A1..A7_PERSON_NAME}}`, `{{A1..A7_PERSON_YEARS}}`.

**Removed:** `{{TANNERY_NAME}}` — E6 confirms tanning is in-house, so there is no external tannery
to name.

Carried without redefinition: `{{EMPLOYEE_COUNT}}`, `{{YEARS_EXPERIENCE}}` (resolved to «понад
30» by D1), `{{KM_FROM_KOSIV}}`, `{{DOMAIN}}`.

Resolved and no longer tokens on this page: `{{FACTORY_ADDRESS}}` = вул. Петруші, с. Яворів,
Косівський район, Івано-Франківська область; `{{POSTAL_CODE}}` = 78644; the two phone numbers,
per [00-client-decisions-2.md](00-client-decisions-2.md) E2 and E3, **ordered Іван then Любов**
per [00-client-decisions-4.md](00-client-decisions-4.md) G1; `{{FLOOR_VISIT}}` = **yes, guided by
Іван, arranged in advance by phone** (G3).
