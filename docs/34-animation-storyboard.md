# 34 — Animation Storyboard

> **Round 11 — motion interview:** interaction and motion decisions in this document are superseded, where they differ, by [36-motion-interaction-system.md](36-motion-interaction-system.md) (first-visit sequence, flock behaviour, mascot scenes, add-to-cart flight, production page on phones).

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Hero flock: **15+ sheep** (≈8 on phones and low-power devices), **the shepherd walks behind the flock**, sheep drift toward the cursor; optional sound (bells, трембіта) behind a speaker button, off by default. Seasonal hero photographs. Soft scroll reveals. Mascot surfaces: hero, empty cart, empty filter result, 404, thank-you (waving).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **New primary sequence — the hero flock.** A cheerful shepherd (кептар, feathered hat, топірець) and a small flock, line-drawn in the logo's style over a mountain photograph. Idle grazing loop; **sheep drift toward the cursor** (desktop) or the last tap (touch), damped, never faster than a walk; shepherd turns his head toward the flock. Paused off-screen; still frame under `prefers-reduced-motion`.
> - Mascot surfaces reduced to hero, empty cart, 404 and order thank-you; loader and footer appearances removed. Speech lines on the three non-hero surfaces. Sleep-when-idle kept. Seasonal variants: Christmas, Easter.


This document is the shot list. [13-motion-system.md](13-motion-system.md) defines the
vocabulary, the clocks, the budgets and the tokens; this document says *where each one fires,
in what order, and what the user learns from it.* Nothing here introduces a new duration, a new
easing curve, or a sixth motion pattern. Every value below is a token reference, and if a shot
below cannot be expressed in the existing tokens, the shot is wrong — not the system.

Governing constraints inherited and never overridden:

| Constraint | Source |
|---|---|
| Two clocks: interaction 80–220 ms, narrative 450–900 ms | [13-motion-system.md](13-motion-system.md) §13.1 |
| Seven durations, five easings, four springs — no others | §13.2, §13.3 |
| Five patterns: Rise, Mask, Lift, Parallax, Morph | §13.4 |
| Only `transform`, `opacity`, `clip-path`, and the three named exceptions animate | §13.5 |
| ≤12 concurrently animating elements, 0 long tasks >50 ms during scroll, 0 CLS from motion | §13.5 |
| Reduced motion is a designed alternative, not a kill switch | §13.6 |
| **The LCP element is never animated on entrance** | §13.8 |
| Motion explains; motion that teaches nothing is deleted | [08-design-system.md](08-design-system.md) §8.2 principle 5 |
| Mascot is brand core, and is still forbidden on PDP, cart, checkout, wholesale | [00-client-decisions.md](00-client-decisions.md) D2, [01-brand-strategy.md](01-brand-strategy.md) §1.7 |
| Homepage and brand surfaces show own-manufacture goods only | [00-client-decisions.md](00-client-decisions.md) D3 |

> **Authority note.** Revised in the consistency audit against
> [00-client-decisions-4.md](00-client-decisions-4.md),
> [00-client-decisions-3.md](00-client-decisions-3.md) and
> [00-client-decisions-2.md](00-client-decisions-2.md), which outrank this storyboard and
> outrank Round 1 where they overlap. Four rulings changed shots: **E6 — the full cycle
> including hides is own manufacture**, which closes the ownership question hanging over §34.4.3
> while leaving the stage *names* unverified; **E2 — the place is с. Яворів**, which resolves
> `{{FACTORY_CITY}}` and removes it from §34.16; **E10 — the PSP is WayForPay**, which resolves
> `{{PSP}}` and narrows §34.7.2's open question to verification item V6; and **F2 — the address
> is a shop as well as a factory**, which rewrites what S11 is a shot *of*. S2 and S11 have both
> been re-reconciled against the current
> [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2 (§34.3.2).

[00-client-decisions.md](00-client-decisions.md) remains the source of the two rulings that shape
the shot list most: the sheep is the brand's core identity rather than an optional flourish (D2),
and partner resale goods are excluded from every brand surface (D3), which removes them from the
homepage reveal sequence entirely.

## 34.1 Notation

`T+0` is absolute time from frame zero in milliseconds; `Δ60` is a delay relative to the
element's group start; `[RM]` marks the reduced-motion behaviour for that shot. Duration and
easing are always written as token names.

Delays are *composed* from the scale, they are not new tokens. A `Δ60` stagger is the stagger
value already fixed in §13.4 pattern 1; a `Δ180` is three of them. Any delay that is not a
multiple of 60 ms, or not equal to a duration token, requires design review.

Homepage section numbering follows [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2
exactly. Where that document and this one disagree, the wireframe wins on *order, content and
surface* and this document wins on *motion*.

---

## 34.2 First load, frame by frame

This is the single most performance-sensitive sequence in the product. It runs **once per
session**. The controlling rule is that nothing in it may push Largest Contentful Paint later
than it would have occurred on a completely static page.

### 34.2.1 The loader gate

The wool-thread loader is rendered in the server HTML, not mounted by JavaScript, so it cannot
itself cost a round trip. It is subject to three gates, evaluated in this order:

| Gate | Condition | Result |
|---|---|---|
| Session | `sessionStorage.woolLoaderSeen` is set | Not rendered at all. Repeat navigations never show it (§13.9). |
| Motion | `prefers-reduced-motion: reduce` | Static wordmark plus a text progress indicator, no draw (§13.6). |
| Readiness | Hero image `decode()` resolves before T+400 | Removed on the next frame with no fade and no minimum display time. |

The loader must never impose a floor on time-to-content. A "minimum brand moment" of 800 ms is
the most common way this pattern becomes a defect, and it is forbidden here.

### 34.2.2 Frame table

| Frame | T | Element | Motion | Token | Notes |
|---|---|---|---|---|---|
| 0 | 0 | Document shell | none | — | `--bg-page` painted from inline critical CSS. Header, skip link and hero container are present and final. |
| 1 | 0 | **Hero image** | **none — opacity 1 on first paint** | — | The LCP candidate. `loading="eager"`, `fetchpriority="high"`, width/height from `Media` ([25-database-schema.md](25-database-schema.md) §25.4). It does not fade, mask, scale, or rise. Ever. |
| 2 | 0 → 900 | Wool thread path | `stroke-dashoffset` draw | `linear` | `linear` is permitted here because the draw is a continuous single gesture with no seam (§13.3). Single `<path>`, ~1 composited layer. |
| 3 | 900 → 1120 | Wordmark | opacity 0 → 1 | `dur-base`, `ease.out` | The thread "resolves into" the wordmark: the path's end point is the wordmark's baseline origin. |
| 4 | ≥1060, ≤1400 | Loader overlay | opacity 1 → 0, `clip-path` sweep upward | `dur-slow`, `ease.in` | Exit easing, per §13.3 ("`in` — exits only"). Starts at the earlier of hero-decoded or T+1060 so the hard cap of 1,400 ms in §13.9 is met exactly. |
| 5 | overlay-exit start Δ0 | Hero H1 | Rise | `dur-reveal`, `ease.out` | Overlaps the overlay exit deliberately — there is never a frame where the page shows nothing happening. |
| 6 | Δ60 | Hero subline | Rise | `dur-reveal`, `ease.out` | Stagger 60 ms (§13.4). |
| 7 | Δ120 | Hero primary CTA | Rise | `dur-reveal`, `ease.out` | |
| 8 | Δ180 | Trust strip (photographic, per [01-brand-strategy.md](01-brand-strategy.md) §1.8) | Rise | `dur-reveal`, `ease.out` | Fourth and final staggered sibling; well inside the 6-item cap. |
| 8a | Δ120 | The «Понад 30 років…» line | Rise, as ordinary text | `dur-reveal`, `ease.out` | **The 30 never counts up.** §13.11 bans animated numerals, and here the ban is also a legal safeguard: a ticking counter implies a documented anniversary, which [00-client-decisions.md](00-client-decisions.md) D1 explicitly forbids. It is a sentence, set in type, that arrives with its paragraph. |
| 9 | Δ240 | Scroll cue | opacity 0 → 1 | `dur-base`, `ease.gentle` | |
| 10 | Δ300 | Mountain fog layer | opacity 0 → 1, then loop | `dur-cinematic` in, then `dur-ambient` | Fades in *after* the text has landed so it never competes with reading. |
| 11 | idle callback | Wool particle canvas | mount, then loop | `dur-ambient` | Mounted in `requestIdleCallback` with a 2,000 ms timeout. Never on the critical path. |

Peak concurrent animating elements in this sequence: **6** (overlay, H1, subline, CTA, trust
strip, scroll cue). Budget is 12 (§13.5).

### 34.2.3 The LCP rule, stated without hedging

Elements 5–11 all animate. Element 1 does not, and no future change may make it do so. The
header does not animate either: it is painted with the shell at final position, because an
entering header both delays perceived readiness and risks CLS against the hero beneath it.

**Verification requirement.** The loader overlay is composited *above* the hero, and Chrome's
LCP does not discount occluded content, so the measured LCP should remain the hero's paint. That
is a browser implementation detail and must be proven — §34.15, procedure P1. If the trace shows
the overlay deferring LCP, the fallback is to restrict the loader to first visits on
`effectiveType` `3g` or slower, where the wait exists anyway.

---

## 34.3 Homepage scroll storyboard

### 34.3.1 The shared trigger

Unless a section's row below says otherwise, every scroll reveal uses one shared
`IntersectionObserver` with `rootMargin: '0px 0px -20% 0px'` and `threshold: 0.15` — the section
begins animating when its top edge crosses **80% of the viewport height**. One observer
instance serves the whole page; per-element observers and any `scroll` event handler that
writes to the DOM are forbidden (§13.5).

Every reveal fires **once** and then unobserves. Re-animating on scroll-back is the fastest way
to make a long page feel unstable, and it doubles the animation cost of a single session.

### 34.3.2 Section-by-section

Section identifiers are those of [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2.

| # | Section | Trigger | Pattern | Duration | Stagger | [RM] fallback |
|---|---|---|---|---|---|---|
| S1 | Hero | first load only | see §34.2 | `dur-reveal` | Δ60 ×4 | Content present at rest; no fog, no particles; poster frame + explicit play control |
| S2 | Manufacturing proof — **inline clip, 4:5, muted, looping** | top at 80vh | Mask on the clip frame; Rise on the heading, body, stat strip and link | `dur-cinematic` / `dur-reveal` | Δ60, capped at 6 | Fade only, 200 ms; clip frame appears unmasked, showing its poster with an explicit play control |
| S3 | Best sellers — **own manufacture only** | top at 80vh | Rise on cards, Lift on hover | `dur-reveal` | Δ60, capped at 6 | Fade only, 200 ms, no stagger |
| S4 | Why customers trust us | top at 80vh | Rise | `dur-reveal` | Δ60 ×4 | Fade only, 200 ms |
| S5 | Categories — Вовна (lead) / Вироби з овчини / Шкіряні вироби | top at 80vh | Rise, then Lift on hover | `dur-reveal` | Δ60, capped at 6 | Fade only, 200 ms; Lift becomes an instant border-colour change |
| S6 | Story — Косівський район, с. Яворів | top at 80vh | Mask on the landscape, Rise on the text column | `dur-cinematic` / `dur-reveal` | Δ60 ×2 | Immediate, no clip |
| S7 | Production journey (Inverted surface) | top at 80vh | Rise on the stage row, Parallax on the background photograph at 0.82× | `dur-reveal` | Δ60 ×3 | Fade only; parallax disabled, background static at its resting position |
| S8 | Reviews with customer photographs | top at 80vh | Rise on cards | `dur-reveal` | Δ60, capped at 6 | Fade only; carousel auto-advance disabled, manual only |
| S9 | Wholesale band | top at 80vh | Rise | `dur-reveal` | Δ60 ×2 | Fade only, 200 ms |
| S10 | Blog — three latest posts | top at 80vh | Rise, Lift on hover | `dur-reveal` | Δ60 ×3 | Fade only, 200 ms |
| S11 | Closing CTA (Inverted surface) — **the visit invitation**, then the newsletter | top at 80vh | Rise on the **heading group**; sheep mark enters `IDLE` | `dur-reveal` | Δ60 ×2 | Fade only, 200 ms; sheep mark static |

**No two adjacent sections may reveal simultaneously.** This is the design-level enforcement of
the ≤12 concurrent-animation budget named in
[06-homepage-wireframe.md](06-homepage-wireframe.md) §6.9, and it is why the shared trigger
fires at 80 vh rather than on first pixel: a section reaching 80 vh while its predecessor is
still animating means the two sections are too short, which is a spacing bug
([11-spacing-system.md](11-spacing-system.md) §11.2), not a motion bug.

### 34.3.3 Six notes the table cannot carry

**S2 is the most important shot on the page, and it is now a moving image.**
[06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2 specifies the S2 media as an **inline
clip** — 4:5, muted, looping, roughly 8 s, hands at the loom with a person visible — read from
`MediaAlbum key="production-proof"`, not as a still portrait. The Mask pattern (§13.4) still
exists primarily for this shot: a clip wipe from `inset(0 0 100% 0)` to `inset(0 0 0% 0)` over
`dur-cinematic` with `ease.expo`, paired with the frame's contents settling from `scale 1.08 → 1`
inside a fixed `overflow: hidden` box. Three consequences of it being video rather than a
photograph:

1. **The Mask plays against the poster, not against the decoded video.** The `<video>` element
   mounts on intersect under the §6.5 guard; the Mask is timed off the poster's paint, so a slow
   video fetch can never hold the reveal. A Mask waiting on a network response is a Mask that
   fires late and reads as jank.
2. **The loop is not choreography and is never staggered with the text.** It runs at its own
   rate, muted, with no entrance of its own beyond the Mask. It is evidence that happens to move.
3. **Reduced motion keeps the frame and drops the autoplay**, per §34.4.4's principle: the poster
   renders with an explicit play control, the caption and stat strip are present, and the section
   still makes its argument. Nothing about the evidence depends on the clip running by itself.

The photograph — or here the footage — is *presented* rather than loaded, which is
[01-brand-strategy.md](01-brand-strategy.md) §1.8 rank 2 expressed as motion. When S2 collapses
to its returning-visitor variant ([06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2
Challenge 2), the Mask is not played — a shorter section does not earn a cinematic reveal.

**The stat strip never counts up, and this is the second place that rule is load-bearing.** S2's
three stats are «30+ років», «7 етапів», «12 категорій», set in `tabular-nums`. §13.11 bans
animated numerals generally; here the ban is also the D1 safeguard restated at section scale, for
the same reason as frame 8a in §34.2.2 — a ticking counter implies a documented anniversary, and
no certificate exists. The stats Rise with their siblings as ordinary type.

**S11 is a visit invitation before it is a newsletter block, and the storyboard had it backwards.**
[00-client-decisions-3.md](00-client-decisions-3.md) F2 resolves the Яворів address as **shop and
production floor together**, and [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2 rebuilt
S11 around it: the heading, the visit line «Магазин і виробництво в одному місці», the full
address, the flexible-hours caveat, the Google Business Profile link, **two phone CTAs** and a
route CTA — and only then the newsletter field below a rule. An earlier revision of this table
animated "the form group only", which staggered the least important thing in the section and left
the invitation to appear without motion. Corrected: **Rise fires on the heading group**, the
newsletter block below the rule arrives with it and is not separately staggered.

Two constraints on that shot:

- **Nothing in the contact block animates as data.** The address, the hours sentence and both
  numbers are read from `Setting["contact.*"]` — the same keys the footer NAP and the
  `LocalBusiness` JSON-LD read, so they cannot drift ([16-footer-specification.md](16-footer-specification.md)
  §16.5). They Rise as part of the heading group and are otherwise inert. A phone number that
  animates independently invites a treatment that a phone number should never receive.
- **The sheep mark belongs here and is `IDLE` only.** §34.10.2 lists the surfaces; S11 is one of
  them, and it is the only *homepage* surface that carries the mark. Single-colour line drawing,
  breathing only, sleeping after 60 s, static under reduced motion and on touch
  ([01-brand-strategy.md](01-brand-strategy.md) §1.7). It is an inverted section carrying an
  invitation, which is the exact register the mark was designed for — and it is emphatically not
  a money surface, so the §1.7 denylist does not reach it.

**Parallax appears exactly once**, in S7. §13.4 permits three elements per viewport; using one
is deliberate, because parallax is the pattern most easily read as decoration and the one
[02-ux-research.md](02-ux-research.md) §2.6 names as a genuine nausea risk for the 60–75 segment.

**Stagger caps are enforced, not aspirational.** S3, S5 and S8 render more than six cards; items
7 and beyond animate with item 6's timing. A twelfth card arriving 720 ms after the first reads
as a bug, exactly as §13.4 warns.

**The origin rule is a motion constraint too.** [06-homepage-wireframe.md](06-homepage-wireframe.md)
§6.2 makes `origin = OWN_MANUFACTURE` a hard query predicate for every product, image, tile and
review on this page, so no shot in this storyboard can reveal a partner product on a brand
surface. Wood is not in v1, so S5 presents three material worlds, not four.

---

## 34.4 Production page scrollytelling

The production page is the only surface in the product that uses scroll-scrubbed animation. It
is also the surface where the brand's whole argument is made, so it earns the complexity.

### 34.4.1 Mechanics, shared by both pipelines

```
┌──────────────────────── viewport ────────────────────────┐
│  ┌──────────────────────┐   ┌─────────────────────────┐  │
│  │                      │   │  ▸ stage counter 03/07  │  │
│  │   STICKY MEDIA       │   │  Stage title            │  │
│  │   (pinned, 100vh)    │   │  Body copy              │  │
│  │                      │   │  Named person, year     │  │
│  └──────────────────────┘   └─────────────────────────┘  │
│                              ▲ scrolls normally          │
└──────────────────────────────────────────────────────────┘
   media cross-fades once per stage; text columns scroll past it
```

- The media column is `position: sticky`, pinned for the height of the stage stack. Pinning is
  CSS, not JavaScript — no scroll handler writes to the DOM (§13.5).
- Each stage owns **100 vh of scroll distance**. Below `md` (768 px,
  [11-spacing-system.md](11-spacing-system.md) §11.3) the sticky column unpins and the layout
  becomes a linear stack; scrubbed scrollytelling on a 375 px viewport with a soft keyboard and
  variable browser chrome is not worth defending.
- Stage media transitions are **cross-fades at `dur-cinematic` with `ease.expo`** triggered at
  stage boundaries, not continuously scrubbed. A discrete transition per stage costs one
  composited opacity animation; a scrubbed one costs work on every frame of a 2,000 px scroll,
  for a perceptually near-identical result.
- The stage counter increments with no motion. It is data, not choreography.
- Wind-in-grass (§34.11) runs in the section breaks between the two pipelines only.

### 34.4.2 Wool pipeline — the lead sequence

Wool leads the page because the brand is wool-led ([00-client-decisions.md](00-client-decisions.md)
D3) and because these seven stages are the only ones this blueprint can state with confidence:
[00-assumptions.md](00-assumptions.md) A4 fixes them as washing, drying, carding/combing,
spinning, weaving/felting, sewing, finishing, and D1 confirms the manufacturing has run
continuously since the early 1990s.

| Stage | Media shot | Entrance | Text | Ambient |
|---|---|---|---|---|
| 01 Washing | fleece in water, steam | Mask, `dur-cinematic`, `ease.expo` | Rise Δ0, Δ60, Δ120 | — |
| 02 Drying | racks, mountain light | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 03 Carding and combing | the card machine mid-run — **film the 30-year-old machine** (D1) | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 04 Spinning | the spindle, hands | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 05 Weaving and felting — the ліжник stage | the loom, the valyalo, the river | cross-fade `dur-cinematic` | Rise Δ0, Δ60, Δ120 | wind-in-grass in the preceding break |
| 06 Sewing | factory floor, named operator | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 07 Finishing and inspection | the finished ліжник, weight and density stated | cross-fade `dur-cinematic` | Rise Δ0, Δ60, Δ120 | — |

Stage 03 carries the heaviest narrative load in the product. D1 grants a 30-year manufacturing
claim with **no certificate behind it**, so the evidence has to be visual: the approved copy
«Понад 30 років виробляємо натуральні вовняні вироби в Карпатах» sits beside a photograph of
the machine that has been running that long. That pairing is the whole trust argument, and it is
why stage 03 gets a held shot rather than a passing one.

### 34.4.3 Sheepskin and leather pipeline — the second sequence

**The ownership question is closed; the stage list is not.**
[00-client-decisions-2.md](00-client-decisions-2.md) E6 confirms that Вівчарик runs the whole
process from raw material to finished goods — «самостійно проводить весь процес від сировини до
виробів» — so `Вироби з овчини` and `Шкіряні вироби` are unambiguously `OWN_MANUFACTURE` and this
second sequence may exist at all. What E6 does **not** supply is the stage names. Those remain
`{{HIDE_STAGES}}` below: a reasonable reconstruction, **not publishable until confirmed**.

E6 attaches one self-policing constraint, and it binds this sequence harder than any motion rule
in the document: **a stage that cannot be photographed is not asserted.** Each row below is a
held shot of a real process or it is deleted. If tanning is claimed, tanning is filmed; if the
drum room cannot be shot, stage 04 comes off the page rather than being softened into an
adjective. An unverifiable production claim on the page whose entire purpose is verifiable
production is worse than a shorter page — and the storyboard is where this fails first, because a
stage with no media has no shot and its row would quietly become a text card nobody notices is
evidence-free.

**No borrowed technique name appears in this sequence.** «Бельгійська технологія» belonged to the
adjacent business and is struck everywhere (E6). Stage 04's copy names what the photograph shows,
not a process the site inherited from a neighbour.

| Stage | Media shot | Entrance | Text | Ambient |
|---|---|---|---|---|
| 01 Receiving and curing | raw hides arriving, hands, date overlay | Mask, `dur-cinematic`, `ease.expo` | Rise Δ0, Δ60, Δ120 | — |
| 02 Soaking and liming | water, drum, motion blur in-camera not in CSS | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 03 Fleshing | tool, hand, close crop | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 04 Tanning | the drum room. **Photographed or deleted** (E6); the copy describes what is in frame and never names a borrowed technology | cross-fade `dur-cinematic` | Rise Δ0, Δ60, Δ120 | — |
| 05 Drying and staking | frames, light | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | wind-in-grass in the preceding break |
| 06 Combing and finishing | texture macro | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |
| 07 Cutting and sewing | machines, a named operator | cross-fade `dur-cinematic` | Rise Δ0, Δ60, Δ120 | — |
| 08 Inspection and dispatch | finished goods, a person, a label | cross-fade `dur-cinematic` | Rise Δ0, Δ60 | — |

Partner goods have no pipeline and appear nowhere on this page (D3.5, D3.6). The production page
is a claim about own manufacture, and putting a resold product anywhere near it would convert
the page's strongest asset into its biggest liability.

### 34.4.4 Reduced motion on this page

Pinning plus scrubbing is the highest-risk construction in the product for motion sensitivity.
Under `prefers-reduced-motion: reduce` the page is rebuilt, not degraded:

- Sticky pinning is removed. Each stage becomes a normal full-width block: image, then text.
- Cross-fades become instant swaps; the Mask on stage 01 becomes an unmasked image.
- The wind-in-grass layer is not rendered at all.
- **Every stage's media, caption, named person and date are still present and in order.** The
  story is told in full. This is the §13.6 rule — content still arrives, motion does not —
  applied to the most animated page in the product.

---

## 34.5 Product gallery choreography

The PDP carries no ambient systems and no mascot ([01-brand-strategy.md](01-brand-strategy.md)
§1.7). Its entire motion budget goes to the gallery, because the gallery is where a 9,800 UAH
purchase decision is actually made.

| Beat | Trigger | Motion | Token | Notes |
|---|---|---|---|---|
| **Rest** | — | Thumbnail rail static; main image static, `radius-none` ([11-spacing-system.md](11-spacing-system.md) §11.5) | — | The main image is the PDP's LCP candidate and **does not animate on entrance**. |
| **Open** (thumbnail → main) | click / Enter on a thumbnail | Morph via `layoutId` | `dur-slow`, `ease.inOut` | §13.4 pattern 5. The thumbnail and the main image are genuinely the same object, which is the condition for using Morph at all. |
| **Adjacent navigation** | arrow key, swipe, next/prev | cross-fade + 16 px x-translate in the swipe direction | `dur-base`, `ease.gentle` | Interaction clock — the user caused it, so it must feel instant. |
| **Zoom, pointer** | hover on desktop with `pointer: fine` | `scale 1 → 2`, `transform-origin` tracks the cursor | `dur-base` in; tracking uses `spring.cursor` | The scale is a transform. No `background-position` zoom — that repaints every frame. |
| **Zoom, touch** | double-tap or pinch | native pinch-zoom inside the fullscreen view | — | No custom gesture handler. Native pinch is better than anything hand-written and costs nothing. |
| **Fullscreen open** | click on the main image, or the expand control | Morph via `layoutId` into the lightbox; backdrop opacity 0 → 1 | `dur-slow`, `ease.inOut`; backdrop `dur-base` | `shadow-xl`, `z-modal` (§11.6). Focus moves to the lightbox, focus trapped, scroll locked. |
| **Fullscreen navigate** | arrows, swipe | cross-fade + 16 px x-translate | `dur-base`, `ease.gentle` | Preloads ±1 image; never more. |
| **Close** | Esc, backdrop click, close button | Morph back to the originating thumbnail; backdrop opacity → 0 | `dur-slow`, `ease.inOut`; backdrop `dur-fast`, `ease.in` | Focus returns to the exact thumbnail that opened it. The backdrop leaves faster than the image so the image is never seen against a dimmed page. |

**Image arrival inside the gallery** follows §13.9: the blurhash LQIP from `Media.blurhash`
cross-fades to the full image over **300 ms**, with dimensions reserved from the stored
`width`/`height` ([25-database-schema.md](25-database-schema.md) §25.4) so CLS is structurally
zero.

**[RM]:** Morph becomes an instant swap. Zoom becomes a static 2× view toggled by an explicit
control rather than tracked by the cursor. Cross-fades become instant. The gallery remains fully
navigable by keyboard, thumbnail, and swipe.

---

## 34.6 Add to cart

The most consequential 900 ms in the product. It has to confirm, unambiguously, that an
expensive object is now in a cart — without stealing control of the page.

```
press ──▶ loading ──▶ success ──▶ badge ──▶ toast ──▶ rest
 140      variable     400        140+220    340       —
```

| Beat | T | Element | Motion | Token |
|---|---|---|---|---|
| 1 | 0 | Add-to-cart button | `scale 1 → 0.98` | `dur-fast`, `ease.gentle` (§13.10) |
| 2 | 140 | Button | label replaced by spinner, **width preserved** | — ([08-design-system.md](08-design-system.md) §8.5) |
| 3 | on response | Button | label morphs to a check glyph, held 400 ms | 400 ms per §13.10 |
| 4 | +0 | Cart badge disc | `scale 1 → 1.04 → 1` | `dur-base`, `ease.gentle` — overshoot capped at 4% per §13.3 |
| 5 | +0 | Cart badge numeral | previous numeral translates up 8 px and fades; new numeral rises 8 px into place | `dur-fast`, `ease.out` |
| 6 | +140 | Toast | slides up 16 px + fades in, auto-dismiss 5 s, pauses on hover | `dur-slow` (§13.10) |
| 7 | +540 | Button | returns to rest label | `dur-base`, `ease.gentle` |

**The cart drawer does not auto-open.** On desktop it steals the user's position in a listing;
on mobile it buries the page they were reading. The toast carries a «Переглянути кошик» action,
which is the one decision offered ([08-design-system.md](08-design-system.md) §8.2 principle 4).

**Explicitly rejected:** the flying product image that arcs into the cart icon. It teaches
nothing the badge count does not, it requires a `position: fixed` clone measured against live
layout, and it is the canonical example of motion as decoration under §8.2 principle 5.

**[RM]:** press feedback becomes an instant background-tint change; the check appears without a
morph; the badge numeral swaps instantly; the toast appears without slide, fade only, 200 ms,
and its auto-dismiss timer is extended to 10 s because a user who suppresses motion is also
plausibly reading more slowly.

---

## 34.7 Cart drawer and checkout

### 34.7.1 Cart drawer

| Beat | Motion | Token |
|---|---|---|
| Backdrop in | opacity 0 → 1 at `z-overlay` | `dur-base`, `ease.gentle` |
| Panel in, ≥`md` | `translateX(100% → 0)` | `spring.drawer` |
| Panel in, <`md` | `translateY(100% → 0)`, bottom sheet | `spring.drawer` |
| Line items | Rise, stagger Δ60, capped at 6 | `dur-reveal`, `ease.out` |
| Quantity change | number swaps with no motion; line total swaps with no motion | — |
| Line removal | row collapses via `grid-template-rows: 1fr → 0fr` + opacity | `dur-base`, `ease.inOut` |
| Free-shipping progress | fill width animates via `transform: scaleX` | `dur-slow`, `ease.gentle` |
| Panel out | reverse translate | `dur-slow`, `ease.in` |
| Backdrop out | opacity → 0 | `dur-fast`, `ease.in` |

Line removal is the one place a size change is animated, and it uses the `grid-template-rows`
technique from §13.10 rather than animating `height`, which cannot be composited.

Prices never count up (§13.11). The free-shipping progress bar animates because it represents a
changing quantity the user just changed; the price it refers to does not.

### 34.7.2 Checkout

Per §13.11: *nothing in the payment flow moves more than it must.*

| Transition | Motion | Token |
|---|---|---|
| Step → step | cross-fade only, no translate | `dur-base`, `ease.gentle` |
| Step indicator tick | opacity 0 → 1 | `dur-fast`, `ease.out` |
| Field validation error | **no motion.** Appears instantly, `aria-live="polite"` | — |
| Order summary update | value swap, no motion | — |
| Submit button loading | spinner replaces label, width preserved | — |
| WayForPay redirect, if the integration mode requires one (E10 V6) | full-page cross-fade, no exit drift | `dur-base` |
| `/checkout/success` entrance | Rise on the confirmation block, Δ60 ×3; **sheep mascot permitted here** | `dur-reveal`, `ease.out` |

The mascot boundary is exact: it is forbidden on every `/checkout/*` step and permitted on
`/checkout/success`, because the first is a money surface and the second is a relief surface.
[00-client-decisions-2.md](00-client-decisions-2.md) E10 resolves the PSP to **WayForPay** and
leaves verification item V6 open — hosted redirect page, embedded widget, or direct API. That
answer changes the step count but not the motion, which is why it is safe to storyboard now and
wrong to write integration detail from memory.

**The international path has no extra motion, deliberately.** Under
[00-client-decisions-3.md](00-client-decisions-3.md) F4 a non-Ukrainian order is submitted, then
quoted, then paid. The submission confirmation is the same cross-fade as any other step, and the
awaiting-quote state renders as a **dated timeline step, not a spinner or a pulse**. An
indeterminate animation against a wait measured in hours is a lie told in motion: it implies
something is happening now. A date implies someone will act, which is what F4 actually promises.

---

## 34.8 Navigation

### 34.8.1 Desktop mega-menu

| Beat | Motion | Token |
|---|---|---|
| Intent — pointer rests on a top-level item for 120 ms, or click, or Enter/Space from the keyboard | none; the delay is the behaviour | 120 ms. The intent delay prevents the menu firing on a cursor merely crossing the bar |
| Panel in | `clip-path: inset(0 0 100% 0) → inset(0 0 0% 0)` + opacity | `dur-base`, `ease.gentle`, `z-dropdown` |
| Columns | Rise 12 px, stagger Δ60, capped at 6 | `dur-base`, `ease.out` |
| Preview image | blurhash → full cross-fade, 300 ms | §13.9 |
| Panel swap (item → adjacent item) | content cross-fades in place; the panel does not close and reopen | `dur-fast`, `ease.gentle` |
| Panel out | opacity → 0 | `dur-fast`, `ease.in` |
| Nav link underline | grows from the left | `dur-base` (§13.10) |

The panel uses `clip-path`, not `height` — §13.5 names `clip-path` as a composited exception and
`height` as forbidden. Only one panel is open at a time. Nav breadth is capped by
[02-ux-research.md](02-ux-research.md) §2.6: a 40-link mega-menu performs badly for the audience
regardless of how gracefully it animates.

### 34.8.2 Mobile menu

| Beat | Motion | Token |
|---|---|---|
| Backdrop in | opacity 0 → 1 | `dur-base`, `ease.gentle` |
| Panel in | `translateX(-100% → 0)`, full height, `z-modal` | `dur-slow`, `ease.out` |
| Level-1 items | Rise 16 px, stagger Δ60, capped at 6 | `dur-reveal`, `ease.out` |
| Drill into a category | incoming level slides in from the right, outgoing slides to `-24 px` and fades | `dur-slow`, `ease.inOut` |
| Drill back | mirrored | `dur-slow`, `ease.inOut` |
| Panel out | `translateX(0 → -100%)` | `dur-slow`, `ease.in` |

The drill-down direction carries the spatial relationship — forward is right, back is left —
which is the only thing the animation is there to teach. Focus is trapped while open, Esc
closes, and the toggle regains focus on close.

**[RM] for both:** panels appear and disappear with a 200 ms fade. No clip, no slide, no
stagger. The mobile drill-down becomes an instant level swap with an `aria-live` announcement of
the new level's name, since the spatial cue is no longer available.

---

## 34.9 Page transitions

Verbatim from §13.8, expanded into a sequence:

```
click ──▶ exit 180ms ──▶ route resolves ──▶ enter (LCP exempt)
   │                          │
   └── progress bar appears if the route has not resolved by 180 ms
```

| Beat | Motion | Token |
|---|---|---|
| Exit | outgoing content opacity → 0 with an 8 px downward drift | 180 ms (§13.8), `ease.in` |
| In-flight | 2 px progress bar in `--accent` at the viewport top | indeterminate, `linear` |
| Enter | incoming content Rises | `dur-reveal`, `ease.out` |
| Enter, LCP element | **no entrance animation whatsoever** | — |
| Scroll | restored on back/forward; set to 0 on a new route, before the enter animation starts | — |

The exit never blocks navigation: the route request is issued on click, in parallel with the
exit animation, and if the route resolves in under 180 ms the exit is cut short rather than
waited out. A transition that makes a fast site feel slow has inverted its own purpose.
Implementation uses the View Transitions API where supported with a Framer Motion
`AnimatePresence` fallback; both paths must produce identical timings.

**[RM]:** cross-fade, 150 ms, no drift. The progress bar is replaced by a static
«Завантаження…» label with `aria-busy`.

---

## 34.10 The sheep mascot state machine

**The mascot is brand core, not an optional delight.**
[00-client-decisions.md](00-client-decisions.md) D2 closes the risk
[01-brand-strategy.md](01-brand-strategy.md) §1.7 recorded and
[00-assumptions.md](00-assumptions.md) F8 left open: «Вівчарик» means *little shepherd*, and the
client has mandated the sheep/shepherd identity as the brand's centre. This section is therefore
no longer contingent on anything.

Promotion to brand core makes the §1.7 execution constraints **more** binding, not less, and D2
says so explicitly. A cartoon sheep cannot share a page with a 14,900 UAH ліжник; a
single-weight line drawing in a maker's-mark register can. Every state below is constrained by
that: no squash, no stretch, no eye highlights, no colour beyond Forest Green on light or Wool
White on dark, and no appearance on a money surface.

### 34.10.1 States

```
                   ┌───────────────────────────────────────────┐
                   │                                           │
   MOUNT ──▶ IDLE ─┼──── 60 s no input ────▶ SLEEP             │
                   │                           │               │
                   │                    any input              │
                   │                           ▼               │
                   │◀──── 340 ms ──────────  WAKE              │
                   │                                           │
                   ├── pointer within 400 px ──▶ TRACK ────────┤
                   │        (pointer: fine only)               │
                   │                                           │
                   ├── route pending >400 ms ──▶ WALK ─────────┤
                   │                                           │
                   └── surface forbidden ──▶ UNMOUNTED ────────┘
```

| State | Entry condition | Motion | Token | Loop |
|---|---|---|---|---|
| `IDLE` | mounted, input within 60 s | Breathing: the body outline scales `1 → 1.012 → 1` | `dur-ambient` (8 s cycle), `linear` | yes |
| `SLEEP` | 60 s with no pointer, key, scroll or touch event | Head lowers ~6°, eye line becomes a closed curve, a single ornament-derived "z" glyph fades in and out | transition `dur-slow`, `ease.gentle`; loop `dur-ambient` | yes |
| `WAKE` | any input while `SLEEP` | Head returns to rest with `spring.sheep` — the one permitted overshoot in the system (§13.3) | `spring.sheep` | no |
| `WALK` | a route change has been pending for more than 400 ms | Four-position leg cycle, body translates ≤24 px and returns; used *in place of* a spinner in the route loader | 900 ms cycle, `linear` | yes, while pending |
| `TRACK` | `pointer: fine` and the pointer is within 400 px | **Head rotation only, clamped to ±12°**, damped | `spring.sheep` | continuous while in range |
| `CELEBRATE` | order confirmation page mount | A single ear lift and settle | `dur-slow`, `spring.sheep` | no, fires once |
| `UNMOUNTED` | forbidden surface, or `prefers-reduced-motion` on a non-essential surface | not rendered | — | — |

`TRACK` is the state most at risk of becoming a toy. The ±12° clamp from §1.7 is a hard limit,
the rotation is applied to the head group only (never the body, never the whole mark), and the
damping comes from `spring.sheep`, which is specified as "deliberately woolly" precisely so the
head never snaps. On touch devices `TRACK` never engages — there is no cursor to follow, and
attaching it to touch coordinates produces a mark that lurches on every tap.

### 34.10.2 Where the mascot may and may not appear

| Surface | Mascot | Why |
|---|---|---|
| Wool-thread loader | ✓ `WALK` | The loading moment is the mascot's primary job |
| 404 and 500 pages | ✓ `IDLE` | 404 is a delight surface; 500 is *not* — see below |
| Empty states (empty cart contents list, zero search results, empty wishlist) | ✓ `IDLE` | [08-design-system.md](08-design-system.md) §8.8: empty states use the mascot |
| Error states | ✗ | §8.8: "An error is not a moment for charm." This overrides the 404 row for any state caused by a *failure*, including a failed payment or a failed form submission |
| Order confirmation `/checkout/success` | ✓ `CELEBRATE` | §1.7 names it |
| **Homepage S11, the closing visit-and-newsletter band** | ✓ `IDLE` | [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2 places it there. An inverted section carrying an invitation to visit the shop is a warmth surface, not a money surface. It is the mark's only appearance on the homepage |
| Footer mark | ✓ static, no state machine | It is a mark, not a character, at this size |
| Seasonal easter egg | ✓ see §34.10.3 | |
| **Product detail page** | ✗ | §1.7 — trust-critical |
| **Cart** | ✗ | §1.7 — money-critical. The empty-cart illustration is the exception, because there is no money on the surface yet |
| **Every `/checkout/*` step** | ✗ | §1.7 — money-critical |
| **Wholesale page** | ✗ | §1.7 — a trade buyer evaluating MOQ and capacity is the audience least served by charm ([02-ux-research.md](02-ux-research.md) §2.3, persona 3) |
| Admin panel | ✗ | §13.11 — staff see it 40 times a day |

This list is enforced by a single `<SheepMascot>` component that reads the current route and
refuses to render on a denylisted path, rather than by remembering not to place it. A rule kept
by discipline is a rule that will be broken in month four.

### 34.10.3 Seasonal variants

| Variant | Window | Change | Constraint |
|---|---|---|---|
| Winter | 01 Dec – 28 Feb | A snow line on the back; two falling flakes on a `dur-ambient` loop | Still one colour. No blue, no white-on-white |
| Closure | `{{CLOSURE_DATES}}` | `SLEEP` is the default state; a dated closure notice sits beside it | The only time `SLEEP` is entered without a 60 s timeout |
| Spring | 01 Mar – 31 May | A single line-drawn flower at the feet | No colour change |
| Autumn | 01 Sep – 30 Nov | One falling leaf, `dur-ambient` | No colour change |

Variants are asset swaps, not new animation code. They are driven by a server-rendered date so
the variant is correct in the HTML and never flips after hydration.

**[RM] for all mascot states:** a single static pose. No breathing, no sleep, no walk, no
tracking, no seasonal loop. §13.6 specifies exactly this. The mascot still appears on every
permitted surface — it is the brand mark, and D2 makes its presence non-negotiable — it simply
holds still.

---

## 34.11 Ambient systems

Three systems, no more. Parameters are fixed in §13.7 and reproduced here with their
storyboard placement and their full guard set.

| System | Technique | Parameters | Where | Cost ceiling |
|---|---|---|---|---|
| **Mountain fog** | Two layered SVG noise masks, CSS `translateX` loop | Layer A 90 s, layer B 140 s, both `linear`, both `filter: blur()` on a static source layer | Homepage hero, about hero | 0 JS after mount |
| **Wool particles** | Canvas 2D | ≤40 particles, capped at 30 fps, drift only, no collision, no mouse interaction | Homepage hero only | ≤3 ms/frame |
| **Wind in grass** | CSS `transform: skewX()` on a masked SVG | 6 s loop, `linear` | Production page section breaks | 0 JS |

### 34.11.1 The guard chain

Every one of the three evaluates the same guard chain before it renders a single frame. The
chain is implemented once, in a shared hook, and returns a boolean.

```
render ambient?
  ├─ prefers-reduced-motion: reduce ............... NO   (§13.6 — disabled, not slowed)
  ├─ navigator.connection.saveData === true ....... NO   (§13.7)
  ├─ navigator.hardwareConcurrency <= 4 ........... NO   (§13.7)
  ├─ navigator.getBattery(): charging === false
  │    && level < 0.2 ............................. NO   (progressive — absent API means pass)
  ├─ document.hidden === true ..................... PAUSE
  ├─ IntersectionObserver ratio === 0 ............. PAUSE
  └─ otherwise .................................... YES
```

**NO** means the system never starts and its canvas is never created. **PAUSE** means
`cancelAnimationFrame` and no further work until the condition clears. A canvas running at
30 fps behind a backgrounded tab costs battery for zero benefit, and "a laptop fan spinning up
is an anti-luxury signal" (§13.7). The Battery Status API is unavailable in several target
browsers; its absence is treated as a pass, never a failure — a guard that disables a feature
because it cannot measure something disables it for most users.

Ambient systems never appear on the PDP, the cart, any checkout step, the wholesale page, or the
admin panel — the same reasoning as the mascot's denylist.

---

## 34.12 Loading and skeleton choreography

| Situation | Treatment | Token |
|---|---|---|
| First load of the session | Wool-thread loader, §34.2 | capped 1,400 ms |
| Every repeat navigation | 2 px `--accent` progress bar only; never the full loader | §13.9 |
| Route pending >400 ms | Mascot enters `WALK` beside the progress bar, on permitted surfaces only | 900 ms cycle |
| Data fetch into an existing layout | Skeleton blocks matching the final layout's **exact** dimensions | shimmer: opacity 0.6 → 1 → 0.6, `dur-ambient` (1.6 s cycle), `linear` |
| Image arrival | blurhash LQIP cross-fade to full | 300 ms (§13.9) |
| Button awaiting a response | spinner replaces the label, width preserved | §8.5 |
| Infinite-scroll / "load more" | new rows Rise, stagger Δ60 capped at 6; the button stays in place | `dur-reveal` |

A skeleton whose dimensions differ from the loaded content causes CLS and is worse than no
skeleton (§13.9). The skeleton components therefore consume the *same* layout primitives as the
real components — same `Stack` gaps, same grid, same aspect ratios derived from
`Media.width/height` — rather than being drawn to look approximately right.

**[RM]:** the shimmer does not pulse. Skeletons render as flat `--bg-alt` blocks. The loader is
a static mark plus a text progress indicator (§13.6).

---

## 34.13 Micro-interaction timing table

Reproduced from §13.10 with the storyboard's addition — the column that says what the motion
teaches. Any row where that column would read "it looks nice" is a row that should be deleted.

| Element | Rest → Hover | Press | Focus | What it teaches |
|---|---|---|---|---|
| Primary button | bg `forest-800 → forest-700`, `dur-instant` | `scale 0.98`, `dur-fast` | 2 px `--accent` ring, 2 px offset | This is the one action here, and the press was received |
| Secondary button | border `stone-300 → forest-800` | `scale 0.98`, `dur-fast` | as above | Actionable, but subordinate |
| Product card | Lift: `y -4px`, `shadow-sm → md`, inner image `scale 1 → 1.04`, `dur-base`, `ease.gentle` | `scale 0.995` | ring on the card, image unchanged | The whole card is one target, not a set of links |
| Nav link | underline grows from the left, `dur-base` | — | ring on the text box | Directional: this is where you are going |
| Colour swatch | ring expands 0 → 2 px | `scale 0.94`, `dur-fast` | 2 px ring + 2 px offset | Selection is a property of the swatch, not a separate control |
| Quantity stepper | bg tint, `dur-instant` | `scale 0.9` on the glyph | ring on the button | The glyph moved, so the number will |
| Input | border `stone-300 → forest-600`, `dur-instant` | — | border + 3 px `emerald-100` glow | Focus is here; nothing else is |
| Add to cart | see §34.6 | — | — | The item is in the cart, and here is where the cart is |
| Wishlist | outline → fill with a `scale 1.15` pulse, 260 ms | — | ring | Saved, reversibly |
| Accordion | chevron rotates 180°, `dur-base`; content via `grid-template-rows: 0fr → 1fr` | — | ring on the header | The content belongs to this header |
| Toast | slides up 16 px + fades, `dur-slow`, auto-dismiss 5 s, pauses on hover | — | focusable, Esc dismisses | Something happened elsewhere on the page |
| Filter chip removal | chip scales to 0.9 and fades, `dur-fast`; the grid reflows with no animation | — | ring | The filter is gone; the results changed because of it |
| Sticky PDP purchase panel | appears when the main buy block scrolls out, opacity + 8 px rise, `dur-base` | — | — | The action followed you; it is the same action, not a new one |

The Lift pattern's image scale happens inside a fixed-size `overflow: hidden` frame so the
card's layout box never changes (§13.4). On listing pages with more than ~24 cards, the shadow
is carried by a pseudo-element whose *opacity* animates rather than the `box-shadow` itself, per
the §13.5 exception note.

---

## 34.14 The complete reduced-motion storyboard

A user with `prefers-reduced-motion: reduce` must receive the whole story, not a stripped site.
This section is the walkthrough of that experience end to end, so it can be reviewed as a
designed artefact rather than inferred from a table of negations.

**Arrival.** The page paints. There is no thread draw; the wordmark is simply present, with a
text progress indicator if the page is genuinely still loading. The hero photograph is there —
it was never animated for anyone. The headline, subline, CTA and trust strip fade in together
over 200 ms, without translation. There is no fog and there are no particles. The hero is
quieter, and it is not emptier.

**Scrolling the homepage.** Each section's content fades in over 200 ms as it enters. Nothing
translates, nothing masks, nothing parallaxes. The makers' portrait in section 2 appears
unmasked and at full size — the photograph does all the work the Mask was there to support. The
material-world cards do not lift on hover; they change border colour instantly, which is a
clearer affordance for the audience [02-ux-research.md](02-ux-research.md) §2.6 describes than
the lift was.

**The production page.** This is where the reduced-motion design has to be genuinely designed
rather than disabled. Sticky pinning is removed entirely and the page becomes a linear editorial
sequence — stage number, photograph, title, body, named person, year — seven times for wool,
eight times for sheepskin and leather. Every stage is present, in order, with its media. A
reader who reaches the bottom has read the same story with the same evidence. What they have not
had is the sensation of the media column holding still while the text moved past it, and that
sensation was never the argument.

**A product page.** The gallery opens instantly. Zoom is a toggle control with a visible label
rather than a cursor-tracked scale. Thumbnails swap without cross-fade. Adding to cart tints the
button, shows the check, updates the badge numeral and raises a toast without slide — and the
toast holds for 10 s rather than 5.

**Checkout** is almost unchanged, because it was already specified as near-motionless (§13.11).
Steps cross-fade at 150 ms instead of 220 ms; errors appear instantly, as they do for everyone.
**The mascot** is present in one static pose on exactly the surfaces §34.10.2 permits, still
recognisably the same mark because it was designed as a mark and not as a character.

**What is measurably different:** zero canvas work, zero scroll-linked animation, zero
`requestAnimationFrame` loops, and roughly 34 KB of Framer Motion that is never fetched. The
reduced-motion build is also the fastest build in the product, which is a useful thing to be
able to say to a client who suspects accessibility work is a tax.

---

## 34.15 Performance verification procedure

Each budget in §13.5 is asserted by a named procedure with a named DevTools measurement. "It
feels smooth" is not a measurement, and on the mid-range Android hardware that represents a
meaningful share of the Ukrainian audience it is usually wrong. All traces are recorded at
**4× CPU throttle** unless stated otherwise.

| # | Budget under test | DevTools procedure | Pass criterion |
|---|---|---|---|
| **P1** | LCP is not delayed by the loader or by an entrance animation | Performance → record with 4× CPU + Fast 3G, hard reload. Read the LCP marker in the Timings track and confirm the LCP node is the hero `<img>`. Record a second trace with the loader force-disabled by a query flag | The two LCP values differ by **<50 ms**, and the LCP node is the image in both. Fail → apply the §34.2.3 fallback |
| **P2** | 0 long tasks during scroll | Performance → record a continuous top-to-bottom scroll of the homepage, then of the production page. Main track → filter tasks >50 ms | **Zero** long tasks inside the scroll window. Usual offenders: an `IntersectionObserver` callback doing layout reads, and a scrollytelling handler that should have been CSS |
| **P3** | ≤12 concurrently animating elements | Rendering → Paint flashing + Layer borders, and sample `document.getAnimations().filter(a => a.playState === 'running').length` at 100 ms through a scripted scroll | Sampled maximum **≤12** |
| **P4** | 0 CLS contributed by animation | Rendering → **Layout Shift Regions** on. Run first load, then hover every card in a listing, then open and close the gallery, cart drawer, mega-menu and mobile menu | No shift regions highlight, and the Experience track logs no layout-shift entries for those interactions. Lift's inner-image scale and the accordion's `grid-template-rows` are the two most likely failures |
| **P5** | Ambient canvas ≤4 ms/frame | Performance → record 10 s with the hero in view. Filter Main to the particle frame callback; read average and p99 self time | Average **≤3 ms** (§13.7), p99 **≤4 ms** (§13.5). Reduce particle count before dropping below 30 fps — a sparse 30 fps drift is invisible, 15 fps is not |
| **P6** | Ambient systems pause off-screen and on hidden tabs | Background the tab and re-record; then scroll the hero out of view and re-record | **Zero** scripted frames in both conditions. Also covered by an automated test ([35-implementation-roadmap.md](35-implementation-roadmap.md) §35.11) because it is the guard most easily broken by a refactor |
| **P7** | ≤0 KB animation JS on the critical path | Network → filter JS, hard reload, confirm no Framer chunk is requested before the LCP marker. Coverage panel → inspect the initial bundle | No animation library bytes in the initial bundle; Framer chunk **≤34 KB gzip**, lazily requested |
| **P8** | `will-change` is never left on | Console, 2 s after animations settle: `Array.from(document.querySelectorAll('*')).filter(el => getComputedStyle(el).willChange !== 'auto').length` | **0.** A permanent `will-change` on many elements exhausts GPU memory and slows the whole page (§13.5) |
| **P9** | The reduced-motion build is designed, not merely disabled | Rendering → emulate `prefers-reduced-motion: reduce`, walk §34.14 end to end | Every §34.14 behaviour matches; `document.getAnimations()` returns only zero-duration or paused animations; **no canvas element exists in the DOM** |

P1 through P9 run on every release candidate and are recorded against the build hash. The
per-component reduced-motion and no-layout-shift checks in
[08-design-system.md](08-design-system.md) §8.10 remain separately required — these nine are
system-level confirmations, not a substitute for them.

---

## 34.16 Open tokens introduced by this document

| Token | Meaning | Severity | Blocked on |
|---|---|---|---|
| `{{HIDE_STAGES}}` | The real in-house stage list for sheepskin and leather. E6 confirms the cycle is **in-house**; it does not name the stages, and [00-assumptions.md](00-assumptions.md) A4 documents only the wool cycle. Each named stage must also be photographable (E6) | BLOCKER for §34.4.3 | Client interview reconciliation, and the Яворів shoot |
| `{{CLOSURE_DATES}}` | Holiday closure dates, driving the mascot's `Closure` variant (§34.10.3) | LOW | Client confirmation |
| WayForPay integration mode (**V6**) | Whether checkout has a redirect step, an embedded widget, or a direct API call (§34.7.2). This is what `{{PSP}}` was standing in for | HIGH | [00-client-decisions-2.md](00-client-decisions-2.md) E10 verification V6, read from current official documentation — never from memory |

### Resolved since the previous revision

| Token | Resolution | Effect on this document |
|---|---|---|
| `{{FACTORY_CITY}}` | **вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644** ([00-client-decisions-2.md](00-client-decisions-2.md) E2). Not Вербовець, which is the adjacent business's village | S6's caption in §34.3.2 names the place directly. No longer a blocker |
| `{{PSP}}` | **WayForPay** (E10) | §34.7.2's redirect row stands as written; only the *mode* is open, now tracked as V6 above |
| `{{MASCOT_APPROVED}}` | **Yes** (D2) | Already recorded below |

`{{MASCOT_APPROVED}}` is no longer a token. It resolved to *yes* in
[00-client-decisions.md](00-client-decisions.md) D2, and §34.10 is now a fixed part of the
system rather than a removable one. Nothing else in this storyboard changed as a result, which
is the useful consequence of having specified the mascot as a self-contained component with an
explicit denylist from the start.
