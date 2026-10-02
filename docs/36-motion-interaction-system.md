# 36 — Motion and Interaction System

> **Round 15:** hero flock is 12 sheep (one a lamb) on desktop; new §36.3.6 «Pick up a sheep» and §36.3.7 «The living flock and the shepherd on his hat» — [00-client-decisions-15.md](00-client-decisions-15.md).

The consolidated result of the motion interview recorded in
[00-client-decisions-11.md](00-client-decisions-11.md) (80 answers, six blocks). It builds on, and
does not replace, [13-motion-system.md](13-motion-system.md) (clocks, tokens, vocabulary,
performance contract, reduced motion) and [34-animation-storyboard.md](34-animation-storyboard.md)
(frame-level choreography). Where this document and those two disagree, **this one wins** for
the points it names; everything it does not mention stands as written there.

No code is written against this document until it is approved. Implementation order is §36.6.

---

## 36.1 The idea in one line

**Преміальний, ремісничий, природний, теплий** (answer 02), carried by **one recurring motif —
the wool thread** — and one cast — **the shepherd and his flock**. Everything else moves as
little as it can.

Every movement on the site must do one of four jobs: confirm an action, show where something
went, direct attention, or carry the brand. A movement that does none of them is not built.

---

## 36.2 UX and motion audit

"Current" is the state of the blueprint before round 11 (there is no running site yet).
Priority: **M** must, **S** should, **N** nice, **E** experimental. Complexity: **1** CSS only ·
**2** small component logic · **3** choreography or asset work.

| # | Area | Current | Problem | Decision | Why | P | C |
|---|---|---|---|---|---|---|---|
| A1 | Hero ambience | Fog + wool particles + (round 9) flock | Three systems at once; heavy on phones | Photo parallax + fog + flock (12 on desktop, round 15); **no particles**; phones: flock ≈ 8, no fog, no parallax | Atmosphere without a laptop fan | M | 3 |
| A2 | Hero title | Title rises with the page | Generic | **Thread writes «Вівчарик»**; real `<h1>` in the HTML from the first byte | Signature moment, SEO intact | S | 3 |
| A3 | First-visit loader | Thread → wordmark | Would repeat the title's thread | **One sequence**: thread forms the ram mark → writes the name; later visits: name only; ≤ 1.4 s; skipped when ready | No double animation | S | 3 |
| A4 | Flock behaviour | Follow cursor, sleep | Idle state undefined | Idle grazing; noticeable following; heads track the cursor (clamped ±25°) | The hero feels alive, not looping | M | 3 |
| A5 | Header | Sticky, no scroll state | Content slides under a flat edge | Thin shadow after 8 px of scroll | Separation without size change | M | 1 |
| A6 | Mega menu | Spec'd, not choreographed | — | Slides down, photos appear in sequence (40 ms) | Shows structure | S | 2 |
| A7 | Primary button | Colour change only | Feels flat | Colour + arrow nudges 4 px; press 0.98 | Premium, quiet | M | 1 |
| A8 | Secondary button | Border darkens | Weak affordance | Fills from the bottom; text inverts | Clear, warm | M | 1 |
| A9 | Pending actions | Spinner unspecified | No feedback while paying | Thread runs through the button + «Зачекайте…» + `aria-busy` | Nobody double-clicks «Оплатити» | M | 2 |
| A10 | Product card | Lift + inner scale | Second photo now shown | Cross-fade to second photo + lift 4 px, no inner scale | One hover idea, not three | M | 1 |
| A11 | Category circles | Static | — | Thread draws round the circle on hover/focus | Motif, cheap | N | 1 |
| A12 | Filters | Apply unspecified | Results change silently | Old fade out 120 ms, new rise (60 ms stagger, ≤ 6); counter digits roll | The buyer sees the list changed | M | 2 |
| A13 | Load more | Unspecified | Page jump risk | New cards rise; focus moves to the first new card | No lost place | M | 2 |
| A14 | Skeletons | Shimmer | Generic | Cream blocks with a passing thread; only after 400 ms | Brand, no flash | S | 2 |
| A15 | Empty states | Mascot static | — | Empty cart: sheep peeks, shepherd shrugs · empty filter: lantern search · 404 · thank-you: wave + sheep hop | Delight where nothing else is happening | S | 3 |
| A16 | Gallery | Spec'd morph | Zoom and swipe undefined | Cross-fade · in-place zoom under the cursor · swipe with snap · full-screen grows from the photo | Fabric texture is the product | M | 2 |
| A17 | Price change | Never animated | Change can go unnoticed | Instant change + 600 ms highlight; custom size after 400 ms pause, announced politely | Noticed, not gimmicky | M | 1 |
| A18 | Add to cart | Label → check | Where did it go? | «✓ Додано» + announcement first → photo flies to the header cart (desktop) → badge bounce → drawer | Unmistakable confirmation | M | 3 |
| A19 | Cart removal | Instant | Accidental taps | Row collapses + «Повернути» for 5 s | Forgiveness | M | 2 |
| A20 | Forms | Floating labels possible | Hard for older readers | Labels always above; errors on blur, instant, no motion; green check on valid fields | Legibility first | M | 1 |
| A21 | Page transitions | Fade + rise | Plain | Stitching thread ≤ 450 ms, never waiting on data; not in checkout, admin, or card→PDP | Brand between pages | S | 3 |
| A22 | Card → PDP | Morph planned | — | Photo flies to the PDP gallery (takes precedence over A21) | Continuity | S | 3 |
| A23 | Scroll | Rise + mask | Production path static | Thread path **follows scroll** (no scroll-jacking); dividers drawn once; mask reveals on large photos; parallax only in the hero | Story you move through | S | 2 |
| A24 | Production page | Pinned storytelling | Heavy on phones | Pinned on desktop/tablet; stacked on phones; clips autoplay muted when visible (phones: Wi-Fi only) | Works everywhere | S | 3 |
| A25 | Phones | Hover-based ideas | Hover does not exist | Press states on everything tappable; swipe-to-close; bottom bar always visible; sticky buy bar replaces it on the PDP | Touch-first | M | 2 |
| A26 | Admin | `dur-fast` only | New orders silent | New order card slides in, highlighted, quiet sound (after first interaction, mutable) | Staff notice orders | S | 2 |
| A28 | Collection cards | Static photos | Three large cards read as flat on a craft site | **Rotating photos: slow drift + cross-dissolve** (§36.3.5), staggered, pausing on hover/focus/off-screen | Keeps the lower homepage alive without a carousel's controls | S | 2 |
| A27 | Weak devices | Static guards | Frame drops possible | Runtime degradation ladder (§36.5) | Speed wins | M | 2 |

---

## 36.3 Motion design system

### 36.3.1 Tokens (unchanged from §13.2–13.3, restated for one-page use)

| Token | ms | Easing | Used by |
|---|---|---|---|
| `dur-instant` | 80 | `gentle` | Colour, opacity, focus ring |
| `dur-fast` | 140 | `gentle` | Press, checkbox, admin state changes |
| `dur-base` | 220 | `gentle` | Hover lift, photo cross-fade, arrow nudge, mega menu, accordions, sticky buy bar, ☰ → × |
| `dur-slow` | 340 | `out` in / `in` out | Drawer, sheets, dialogs, mobile menu, toasts |
| `dur-reveal` | 560 | `out` | Scroll Rise, thread around category circles, dividers |
| `dur-cinematic` | 820 | `expo` | Mask reveals, the thread writing the title |
| `dur-ambient` | 8000+ | `linear` | Fog, grazing loops, the pending-thread loop (1 200 ms linear cycle) |

**Stagger:** 40 ms for menus, 60 ms for content; **capped at 6** items. **Overshoot:** ≤ 4%
everywhere except the mascot (`spring.sheep`), which may overshoot softly (hops, badge excluded).

### 36.3.2 Named durations added by round 11

| Name | Value | Where |
|---|---|---|
| First-visit sequence cap | 1 400 ms | Loader + title (A3) |
| Page stitch | ≤ 450 ms (exit 180 + stitch 300, overlapping) | A21 |
| Flying photo | 500 ms, `inOut`, soft arc | A18 |
| Price highlight | 600 ms fade-out | A17 |
| Input debounce | 400 ms | Custom-size price |
| Skeleton threshold | 400 ms | A14 |
| Undo window | 5 s | A19 |
| Toast | `dur-slow` in, 5 s visible, pauses on hover/focus | Toasts |
| Header shadow trigger | `scrollY > 8` | A5 |
| Back-to-top trigger | two viewport heights | Back-to-top |

### 36.3.3 The thread — one component, one look

The thread is a **single shared component** (`<Thread>`), never re-drawn per feature:

| Property | Value |
|---|---|
| Geometry | A hand-drawn, slightly wavy SVG path — never a ruler-straight line |
| Stroke | 2 px (3 px in the hero title), round caps |
| Colour | `forest-700` on light surfaces; `gold-400` (#C9A96A) on dark |
| Technique | `stroke-dasharray` / `stroke-dashoffset` — compositor-cheap, no JS per frame except scroll-linked uses |
| Modes | `draw` (once) · `loop` (pending buttons, skeletons) · `scroll` (production path; reversible) · `stitch` (page transitions) |
| Reduced motion | Drawn fully, no movement; `loop` becomes a static dashed line beside the text label |

Uses: loader and title (A2–A3), category circles (A11), pending buttons (A9), skeletons (A14),
production path (A23), dividers (A23), «30+ років» underline, page stitch (A21).

### 36.3.4 The cast — shepherd and flock

Artwork: the approved colour shepherd ([00-client-decisions-10.md](00-client-decisions-10.md)
part 9), delivered by the illustrator as **layered SVG** with named groups (head, torso,
staff arm, free arm, legs; sheep: body, head, legs) so each part can move on its own. Animated
with CSS and the existing Framer Motion — no new animation library, no video, no WebGL.

| State | Movement | Where |
|---|---|---|
| Graze (idle) | Heads down/up on randomised 3–6 s cycles; one sheep takes a step now and then; shepherd walks slowly behind | Hero |
| Follow | Flock drifts toward the cursor with `spring.sheep` (noticeable, answer 07); heads turn toward it, clamped ±25° | Hero, desktop |
| Tap follow | Flock walks toward the last tap | Hero, touch |
| Sleep | After 60 s without input: heads down, «z z» | Hero |
| Shrug | Sheep peeks into the empty basket, shepherd shrugs | Empty cart |
| Lantern | Shepherd searches for a sheep with a lantern (~2 s, once) | Empty filter result |
| Lost path | Shepherd on a mountain path | 404 |
| Wave + hop | Shepherd waves, sheep hop (soft overshoot allowed) | Thank-you |
| Seasonal | Christmas, Easter variants, by date | All mascot surfaces |

Every scene plays **once** and rests; only the hero loops, and it pauses off-screen and on hidden
tabs. Under reduced motion every surface shows its resting frame.

### 36.3.5 Rotating collection photos — slow drift and cross-dissolve

Client request ([00-client-decisions-11.md](00-client-decisions-11.md)): the three collection
cards change their photograph every 2.5–3 s. The transition was left to design.

**Chosen: a cross-dissolve over a slow drift** (the «Ken Burns» move), not a wipe or a slide.

| Considered | Verdict |
|---|---|
| Plain cross-fade | Correct but static between changes; the card looks like a slideshow |
| Mask (curtain) wipe | Rejected here. It is the signature reveal for large photos entering the view (block 5, answer 55); repeating it every 2.8 s on three cards would wear the signature out and make the section busy |
| Slide | Rejected. Sideways motion reads as a carousel and invites a swipe that does nothing |
| Thread wipe | Rejected. The thread is reserved for moments the user causes or the story needs (§36.3.3), not a loop |
| **Drift + dissolve** | **Chosen.** Each photograph is alive the whole time it is shown — it creeps in by 5% — and the change itself is a calm dissolve. Premium, natural, and the motion never competes with the text |

**Specification**

| Property | Value |
|---|---|
| Dwell per photo | 2 800 ms |
| Dissolve | 700 ms, `ease.inOut`, opacity only; outgoing and incoming overlap fully (no gap to the background) |
| Drift | `scale 1.00 → 1.05` over the dwell plus dissolve (≈ 3 400 ms), `linear`; each photo has its own `transform-origin` (e.g. 30% 40%, 70% 35%, 50% 70%, 40% 60%) so consecutive drifts do not repeat the same path |
| Stagger | Card 1, then card 2 ≈ 900 ms later, then card 3 — one change on screen at a time |
| Layers | Only two images mounted per card (current, next); the next one is `decode()`d before the swap, and if it has not loaded the current photo simply stays |
| Label and dots | Never move; dots cross-fade with the photo (`dur-reveal`) |
| Pauses | Hover or focus on that card; section off-screen (`IntersectionObserver`); `document.hidden` |
| Reduced motion | No rotation, no drift: the first photo, still |
| Weak devices | Drift dropped at step 2 of §36.5; the dissolve remains |
| Implementation | CSS transitions on `opacity` and `transform` only, driven by one shared timer for the three cards — no animation library needed |

### 36.3.6 Pick up a sheep (round 15)

Decisions: [00-client-decisions-15.md](00-client-decisions-15.md) S2. Hero only, one sheep in the
hand at a time; the shepherd is never draggable. Reference implementation: the demo script in
the canvas board «Головна · комп'ютер» (`sheepInit`), about 250 lines, no library.

**States of the lifted sheep:**

| State | Motion | Ends |
|---|---|---|
| Hover | Open-hand cursor; sheep looks at it, ears up | Pointer leaves |
| Press | A click under 4 px of movement → «Бе-е!» bubble (U13). Touch: hold 0.35 s | Drag starts |
| Held | The original hides; a jointed copy hangs from the гирлига cursor by the back (pivot at the wool top). Body angle is a damped spring toward the pointer's horizontal speed (±35°); legs counter-rotate toward the ground and swing with the body's angular speed; surprised face | Release, scroll, blur |
| Cling | Released above the navigation bar: vertical, front legs over the bar's lower edge, rear legs dangling, swinging pendulum decaying for 2 s | → Fall |
| Fall | Constant slow descent (1.6–2.2 s over the full height), ±14 px sideways sway with ±10° tilt on a 1.2 s cycle, release momentum decaying (e-folding 0.33 s), kept 60 px inside the screen edges | Feet reach its row's ground line |
| Land | Squash 12% for 0.15 s, 5 grass blades + 2 wool tufts with gravity; kneel (legs 45% length) 0.6 s, head shake 0.3 s, rise 0.25 s, wool shake 0.3 s; face back to happy | ~1.3 s |
| Rejoin | *Superseded by §36.3.7:* it stays where it landed in the depth-sorted flock and runs to the heap under the cursor (or grazes nearby) | — |

While any sheep is held, clinging or falling, the rest of the flock swaps to the heads-up pose
(`sheepu`, head rotated −16°). The shepherd turns his head (layered artwork, §36.3.4) and nods
once on landing.

**Guards:** reduced motion → no drag, the bleat stays; the degradation ladder (§36.5) switches this
off first; touch starts only after the 0.35 s hold so short swipes still scroll the page; the sheep
never covers the hero buttons after landing (ground rows are below them); decorative only —
`aria-hidden`, no keyboard path, nothing important depends on it. One analytics event per pick-up,
only with consent.

### 36.3.7 The living flock and the shepherd on his hat (round 15)

Decisions: [00-client-decisions-15.md](00-client-decisions-15.md) S3 and S4. Reference
implementation: `sheepInit` in the canvas board «Головна · комп'ютер» (Play). The shepherd and
every sheep are drawn from parts (legs, arms, head, hat, staff) so each moves on its own.

**Depth.** One ground layer, re-sorted about every 80 ms by feet position: lower on screen is in
front, and scale follows depth (0.68 at the back edge of the grass, 0.94 at the front). A lifted
sheep or the shepherd leaves for the air layer (above the navigation bar) and rejoins the sorted
ground layer on landing, so nothing snaps behind a neighbour.

**The flock.** 11 sheep and a lamb (58% size, bigger head, follows its mother, hops when running).
Characters set speed and habits: glutton 150 px/s, curious 220 (first to the cursor), lazy 120
(0.8 s late), timid 170 (stays on the heap's edge), ordinary 180. Idle activities drawn by
character weights, 3–8 s each: graze (head down 38°, jaw bob), chew, look around (may turn
round), lie down (at most two at a time), shake, scratch, a few steps, a rare bleat. After 60 s
without input they lie down one by one and sleep («z»).

**Following.** While the cursor is over the first screen each sheep runs to the nearest grass
point under it. Crowding is a soft constraint: centres keep at least a third of a body width
apart (an ellipse 14 px deep), so the heap pushes and jostles but never merges; now and then one
backs out 130 px and tries another side. After the cursor rests 3 s the gluttons, the lazy ones
and about a third of the rest graze where they stand. When the cursor leaves, the heap spreads by
a few steps each. Turning is a 0.4 s horizontal squash through a narrow front-on frame (never
thinner than 18%), head leading; a sheep turns only when its goal is more than 40 px behind it.
Heads track the cursor within ±25°.

**Knocking the shepherd over.** The shepherd is an obstacle the flock flows around. Four or more
sheep pressing on him for 0.5 s start a wobble (sway ±8°, arms flailing); two more seconds of
pressure and he falls on his back, legs up. Then he gets up, dusts off, straightens his кресаня
and swings the staff; sheep within 240 px scatter for a second.

**Carried by the hat.** Press and drag the кресаня: «Ой!» (0.15 s), then a 0.18 s jump onto the
hat, which sits exactly under the closed-hand cursor. He hangs by both hands from the brim (arms
up beside the head, tousled hair and clenched teeth showing). The swing is a spring on horizontal
speed (±45°, stiffness 55, damping 4), slower and wider than a sheep's, with legs kicking. His
staff drops and falls flat on the grass. Release: a hat-parachute fall of 1–1.4 s → crouch landing
with grass and dust → puts the hat on → straightens it → shakes a fist → walks home (110 px/s) →
picks up the staff. Released over the navigation bar: one hand on its edge, hat in the other,
2 s, then drops. Three lifts within 40 s → he holds the hat down for 5 s.

---

## 36.4 Interaction map

Only the states each component actually has. "—" means the state does not exist for it.

| Component | Default | Hover (pointer) | Focus (keyboard) | Pressed / tap | Loading | Success | Error | Disabled |
|---|---|---|---|---|---|---|---|---|
| Primary button | `forest-800` fill | `forest-700`, arrow +4 px | 2 px ring, 2 px offset | scale 0.98, darker | Thread loop + «Зачекайте…», `aria-busy` | Label → «✓ …» (where an action completes in place) | Label restores; message elsewhere | `stone` fill, no hover |
| Secondary button | Outline | Fills from bottom, text inverts | Ring | scale 0.98 | As primary | — | — | Muted outline |
| Text link | Underlined on body copy | Underline thickens | Ring | — | — | — | — | — |
| Icon button | Icon | Tint behind icon | Ring | scale 0.94 | — | — | — | Muted |
| Product card | Photo 1 | Cross-fade to photo 2, lift 4 px + shadow | Ring round the card | scale 0.995 | Skeleton with thread | — | — | Out of stock: greyed, no hover |
| Wishlist heart | Outline | Tint | Ring | Fill + pulse 1.15 | — | Toast «Додано в обране»; header counter updates | Toast on failure | — |
| Collection card | Rotating photo (§36.3.5) | Rotation pauses; label stays | Ring; rotation pauses | scale 0.99 | Next photo not decoded → current stays | — | Photo fails → collection colour + title | — |
| Category circle | Photo | Thread draws around | Thread + ring | scale 0.98 | — | — | — | — |
| Colour swatch | Swatch | Ring grows 0 → 2 px | Ring + offset | scale 0.94 | — | Photos cross-fade to that colour | — | Crossed out, not selectable |
| Size button | Outline | Border darkens | Ring | scale 0.98 | — | Selected: 2 px border; price highlight | — | Crossed out |
| «Свій розмір» fields | Fields above labels | — | Border + green glow | — | Price «рахуємо…» after 400 ms | New price highlighted + announced | Out-of-range message, instant | — |
| Quantity − / + | Glyphs | Tint | Ring | Glyph scale 0.9 | — | — | Max reached: + disabled with hint | At limit |
| Filter checkbox | Box + count | Tint | Ring | — | Apply-button count rolls | — | — | Zero-count options muted |
| Apply filters («Показати N») | Primary | As primary | Ring | 0.98 | Thread loop | Results swap (fade out / rise in) | Toast | — |
| Active-filter chip | Chip × | × darkens | Ring | Chip shrinks away | — | — | — | — |
| Search | Magnifier | Tint | Ring | Field expands from the icon | Thread in the field | Suggestions rise (40 ms stagger) | «Нічого не знайдено» + mascot link | — |
| Mega menu | Closed | Opens after 150 ms intent; slides down; photos stagger | Opens on Enter/↓ | — | — | — | — | — |
| ☰ menu (phone) | ☰ | — | Ring | Morphs to ×; panel slides from left, items stagger | — | — | — | — |
| Header | White | — | — | — | 2 px progress bar on slow navigation | — | — | Shadow after scroll |
| Bottom bar (phone) | Always visible | — | Ring | Press tint | — | Cart badge bounce | — | Replaced by sticky buy bar on the PDP |
| Gallery | Main + thumbs | In-place zoom, «лупа» cursor | Ring on thumbs | Swipe with snap; tap → full screen grows from the photo | Blur-up | — | Fallback frame | — |
| «Додати в кошик» | Primary | As primary | Ring | 0.98 | Thread loop | «✓ Додано» → flight (desktop) → badge → drawer | «Не вдалося додати» + retry | Unavailable variant: disabled with reason |
| «Купити в 1 клік» | Secondary | Fills | Ring | 0.98 | — | Dialog opens (fade + scale 0.96 → 1) | — | Hidden for custom size |
| Sticky buy bar (phone) | Hidden | — | — | — | Slides up when the main button leaves the view | — | — | — |
| Cart drawer | Closed | — | Focus trapped inside | Slides in; swipe or × closes | — | — | Sold-out line greyed with reason | — |
| Cart line «Видалити» | Trash icon | Tint | Ring | Row collapses | — | «Повернути» toast 5 s | — | — |
| Dialog | Closed | — | Focus trapped, returns on close | Fade + scale in; swipe/× closes | — | — | — | — |
| Accordion | Closed | Title tint | Ring | Chevron 180°, height via grid rows | — | — | — | — |
| Text input | Label above | Border darkens | Border + green glow | — | — | Green check (rule-bearing fields) | Message below, instant, on blur | Muted |
| Option card (delivery/payment) | Outline | Border darkens | Ring | Border + fill change | — | — | — | Locker disabled with reason |
| Promo «Є промокод?» | Link | Underline | Ring | Field expands | Thread | Discount line highlighted | Reason stated, instant | — |
| «Оплатити [сума]» | Primary | As primary | Ring | 0.98 | Thread + «Зачекайте…» | Redirect / thank-you with wave + hop | Message, no motion; «Спробувати ще раз», «Змінити спосіб» | Until terms checkbox is ticked: disabled with hint |
| Toast | — | Pauses | Focusable, Esc | — | — | Rises 16 px + fades, bottom centre | Same, danger colour | — |
| Messenger float (desktop) | Round button | Lift | Ring | Opens Viber / Telegram / WhatsApp fan | — | — | — | — |
| Back-to-top | Hidden | Tint | Ring | Smooth scroll (instant under reduced motion) | — | — | — | Appears after two screens |
| Video review | Poster + play | Play grows | Ring | Plays with sound | Blur-up poster | — | Fallback poster | — |
| Admin order card | Card | Tint | Ring | — | — | New order slides in, highlighted 2 s, quiet sound | — | — |

---

## 36.5 Performance and accessibility guards

**Degradation ladder** (answer 80 — speed wins). Checked at load and by a lightweight frame
monitor in the hero; each step switches off one thing, cheapest-to-lose first:

1. `prefers-reduced-motion: reduce` → everything static per §13.6; resting mascot frames; thread
   fully drawn.
2. `saveData`, ≤ 4 logical cores, or a phone → no fog, no parallax, flock ≈ 8.
3. Average frame time > 20 ms for 2 s in the hero → fog off, then parallax off, then flock
   follows with heads only.
4. Hidden tab or hero off-screen → every loop paused.

**Rules that do not bend:**
- Only `transform`, `opacity`, `clip-path` and `stroke-dashoffset` animate; never layout
  properties (except the accordion's `grid-template-rows`, per §13.10).
- The hero photograph is the LCP element and is never animated in.
- CSS transitions first; Framer Motion (already chosen) only for morphs, springs and
  scroll-linked values. No new animation libraries.
- Every state a movement communicates is also communicated in text or ARIA
  (`aria-busy`, `aria-live`, labels) — the site works fully with animation off.
- Focus rings are never removed; touch targets ≥ 44 px.
- Sound never autoplays; hero sound is off on every visit; admin sound only after first
  interaction and mutable.

---

## 36.6 Priority and build order

**MUST** — without these the site feels unfinished:
A1, A4, A5, A7, A8, A9, A10, A12, A13, A16, A17, A18, A19, A20, A25, A27.

**SHOULD** — strong UX and brand gain:
A2, A3, A6, A14, A15, A21, A22, A23, A24, A26, A28.

**NICE** — polish:
A11, «30+ років» underline, divider threads, seasonal mascot variants.

**EXPERIMENTAL** — try, keep only if it earns its cost:
the flock's head-tracking on touch (tap follow), the lantern scene length, fog density on
mid-range laptops.

**Build order:** tokens and the `<Thread>` component → buttons, inputs, focus → cards, gallery,
cart and add-to-cart → filters, search, skeletons → drawers, dialogs, toasts → page transitions
and morphs → hero and mascot scenes (after the illustrator's layered artwork) → degradation
ladder and reduced-motion verification on a mid-range Android phone.
