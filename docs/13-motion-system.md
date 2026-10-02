# 13 — Motion System

> **Round 11 — motion interview:** interaction and motion decisions in this document are superseded, where they differ, by [36-motion-interaction-system.md](36-motion-interaction-system.md) (thread motif, hero ambience without particles, button and card states, page stitch, degradation ladder).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - The hero now carries the shepherd-and-sheep animation (see [34-animation-storyboard.md](34-animation-storyboard.md) banner). It must not delay LCP: the photograph renders first, the SVG animation starts after `load`, and it pauses when the hero leaves the viewport.


Motion is the most expensive thing to get wrong on this project. Done well it is the difference
between "nice site" and Awwwards. Done badly it destroys the Performance target, the
accessibility target, and the credibility of a brand built on patience and precision.

## 13.1 Two clocks

The single most important rule in this system, derived from the "Patient" brand trait in
[01-brand-strategy.md](01-brand-strategy.md) §1.4:

| Clock | Range | Applies to |
|---|---|---|
| **Interaction clock** | 80–220 ms | Anything the user directly caused — hover, press, focus, toggle, input feedback |
| **Narrative clock** | 450–900 ms | Anything the page does on its own — scroll reveals, section transitions, storytelling |

Confusing the two is the classic failure. A 600 ms button hover feels broken. A 150 ms
cinematic reveal feels cheap. The brief's "unhurried, Apple-quality" motion refers to the
narrative clock only; interaction must be near-instant.

## 13.2 Duration scale

| Token | ms | Use |
|---|---|---|
| `dur-instant` | 80 | Colour and opacity on hover, focus ring |
| `dur-fast` | 140 | Button press, checkbox, small state changes |
| `dur-base` | 220 | Dropdown, tooltip, tab switch, card lift |
| `dur-slow` | 340 | Drawer, modal, mobile menu |
| `dur-reveal` | 560 | Scroll-triggered content reveal |
| `dur-cinematic` | 820 | Hero entrance, chapter transition, image mask |
| `dur-ambient` | 8000+ | Fog drift, particle float, looping background |

**Rule:** larger objects travel longer. A full-screen drawer at 140 ms feels violent; a 24 px
checkbox at 340 ms feels laggy. Duration scales with distance and area, not with importance.

## 13.3 Easing

```ts
export const ease = {
  out:      [0.22, 1, 0.36, 1],      // default for entrances — decisive start, soft landing
  inOut:    [0.65, 0, 0.35, 1],      // moves between two on-screen states
  in:       [0.55, 0, 1, 0.45],      // exits only
  expo:     [0.16, 1, 0.3, 1],       // cinematic, large travel
  gentle:   [0.4, 0, 0.2, 1],        // UI default, Material-adjacent, unremarkable on purpose
} as const;

export const spring = {
  card:   { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 },
  drawer: { type: 'spring', stiffness: 220, damping: 32, mass: 1.1 },
  cursor: { type: 'spring', stiffness: 150, damping: 20, mass: 0.6 },
  sheep:  { type: 'spring', stiffness: 90,  damping: 14, mass: 1.4 },  // deliberately woolly
} as const;
```

`linear` is permitted only for continuous ambient loops (fog, particles, marquee) where an
eased loop would visibly pulse at the seam.

**No bounce, no overshoot above 4%.** Overshoot reads as playful; this brand is warm but not
playful. The one exception is the sheep mascot, which is allowed a soft, heavily damped
overshoot because it is the designated moment of delight.

## 13.4 Motion vocabulary

Five named patterns. Anything outside this list requires design review, and that constraint is
what keeps a heavily animated site feeling like one system instead of a showreel.

### 1. Rise
Content enters from 24 px below with opacity 0 → 1. The universal scroll reveal.
`y: 24 → 0`, `opacity: 0 → 1`, `dur-reveal`, `ease.out`. Stagger 60 ms between siblings, capped
at 6 items — beyond that the last item arrives so late it reads as a bug.

### 2. Mask
An image or block is revealed by an expanding clip, not a fade. This is the signature
"editorial" move and it is what makes photography feel like it is being *presented*.
`clip-path: inset(0 0 100% 0) → inset(0 0 0% 0)`, `dur-cinematic`, `ease.expo`. Paired with a
counter-translate on the inner image (`scale 1.08 → 1`) so the photo appears to settle.

### 3. Lift
Hover state for any card. `y: 0 → -4px`, shadow `sm → md`, inner image `scale 1 → 1.04`.
`dur-base`, `ease.gentle`. The image scales *inside* a fixed-size overflow-hidden frame, so the
card's layout box never changes and no reflow occurs.

### 4. Parallax
Background media translates at 0.82× scroll speed; foreground text at 1.0×. Maximum
displacement is 120 px. Parallax is applied to at most **three** elements per viewport. It is
driven by a single shared scroll listener via `useScroll`, never by per-element listeners.

### 5. Morph
A shared element transitions between two layouts — product card → PDP hero, thumbnail →
fullscreen gallery. Implemented with Framer Motion `layoutId`. `dur-slow`, `ease.inOut`.
Reserved for genuinely continuous objects; morphing unrelated elements is disorienting.

## 13.5 The performance contract

The brief targets Lighthouse Performance 98–100 *and* heavy animation. Those are compatible
only under strict rules.

**Animate only `transform` and `opacity`.** Animating `width`, `height`, `top`, `left`,
`margin`, `box-shadow`, or `background-color` triggers layout or paint on every frame.
Exceptions:
- `clip-path` — composited in all target browsers, used by Mask.
- `box-shadow` on hover — permitted only because it is a one-shot 220 ms transition on a
  single element, not a scroll-linked animation. Prefer animating the opacity of a pseudo-element
  carrying the shadow where a card list is large.
- `filter: blur()` — permitted only on ambient background layers that are themselves static.

**Scroll-linked animation runs on the compositor.** Use CSS `animation-timeline: view()` where
supported, with a Framer Motion `useScroll` fallback. Never attach a `scroll` event handler
that writes to the DOM — it guarantees jank on mid-range Android, which is a meaningful share
of the Ukrainian mobile audience.

**Budgets, enforced in CI:**

| Metric | Budget |
|---|---|
| Animation JS on the critical path | ≤0 KB — all above-the-fold motion is CSS |
| Framer Motion bundle | ≤34 KB gzip, lazy-loaded below the fold |
| Concurrently animating elements | ≤12 |
| Long tasks during scroll | 0 over 50 ms |
| CLS contributed by animation | 0 |
| Ambient canvas frame cost | ≤4 ms on a 4× CPU throttle |

**Every animated element declares its own containment**: `will-change` is applied on
interaction start and removed on completion, never left permanently in CSS. A permanent
`will-change: transform` on many elements exhausts GPU memory and makes the whole page slower.

## 13.6 Reduced motion

`prefers-reduced-motion: reduce` is a hard requirement, not a fallback. The implementation
rule: **content still arrives, motion does not.**

| Normal | Reduced |
|---|---|
| Rise (translate + fade) | Fade only, 200 ms |
| Mask (clip reveal) | Immediate, no clip |
| Parallax | Disabled; elements are static at their resting position |
| Ambient fog, particles, wind | Fully disabled, not slowed |
| Sheep idle, walk, cursor tracking | Static pose only |
| Page transition | Cross-fade 150 ms |
| Loader thread animation | Static mark plus a text progress indicator |
| Autoplaying hero video | Poster frame plus an explicit play control |
| Carousel auto-advance | Disabled, manual only |

Implemented once, globally, rather than per component:

```ts
// useMotionSafe.ts — single source of reduced-motion truth
const prefersReduced = useReducedMotion();
const t = prefersReduced ? { duration: 0.2 } : { duration: 0.56, ease: ease.out };
```

Plus a global CSS backstop so that any animation added later without going through the hook is
still caught:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The backstop is a safety net, not the implementation. Relying on it alone produces a degraded
experience rather than a designed one.

## 13.7 Ambient systems

Three continuous background systems. Each is opt-out under reduced motion, each pauses when
off-screen via `IntersectionObserver`, and each pauses on `document.hidden`.

| System | Technique | Cost ceiling | Where |
|---|---|---|---|
| **Mountain fog** | Two layered SVG noise masks, CSS `translateX` loop at 90 s and 140 s | 0 JS after mount | Homepage hero, about hero |
| **Wool particles** | Canvas 2D, ≤40 particles, capped at 30 fps | ≤3 ms/frame | Homepage hero only |
| **Wind in grass** | CSS `transform: skewX()` on a masked SVG, 6 s loop | 0 JS | Production page section breaks |

Battery and thermal guard: all three disable when `navigator.connection.saveData` is true, when
the device reports ≤4 logical cores, or when the tab has been backgrounded. A laptop fan
spinning up is an anti-luxury signal.

## 13.8 Page transitions

Route changes use a two-part transition so the site never shows a blank frame:

1. **Exit** — outgoing content fades to 0 over 180 ms with a 8 px downward drift.
2. **Enter** — incoming content Rises over `dur-reveal`, with the LCP element exempt from any
   entrance animation.

**The LCP element is never animated on entrance.** Fading in a hero image delays LCP by exactly
the animation duration, which is the single most common way an award-winning design scores 70
on Lighthouse. The hero image is present and opaque on first paint; everything around it
animates.

## 13.9 Loading states

- **Route-level:** a thin 2 px progress bar in `--accent`, plus the wool-thread loader for
  first load only. Repeat navigations never show the full loader.
- **Data-level:** skeleton screens matching the final layout's exact dimensions. A skeleton
  whose size differs from the loaded content causes CLS and is worse than no skeleton.
- **The wool-thread loader** draws a single continuous thread along an SVG path using
  `stroke-dashoffset`, resolving into the wordmark. Runs once per session, capped at 1,400 ms,
  and is skipped entirely if the page is interactive sooner. It must never delay a ready page.
- **Image loading:** blurhash LQIP from `Media.blurhash` ([25-database-schema.md](25-database-schema.md))
  cross-fades to the full image over 300 ms. Dimensions are always reserved from the stored
  `width`/`height` so CLS is structurally zero.

## 13.10 Micro-interaction catalogue

| Element | Rest → Hover | Active/Press | Focus |
|---|---|---|---|
| Primary button | bg `forest-800 → forest-700`, `dur-instant` | `scale 0.98`, `dur-fast` | 2 px `--accent` ring, 2 px offset |
| Secondary button | border `stone-300 → forest-800` | `scale 0.98` | as above |
| Product card | Lift pattern | `scale 0.995` | ring on the card, image unchanged |
| Nav link | Underline grows from left, `dur-base` | — | ring on the text box |
| Colour swatch | ring expands 0 → 2 px | `scale 0.94` | 2 px ring + 2 px offset |
| Quantity stepper | bg tint | `scale 0.9` on the glyph | ring on the button |
| Input | border `stone-300 → forest-600` | — | border + 3 px `emerald-100` glow |
| Add to cart | on success: label morphs to a check, 400 ms, then the cart badge counts up | — | — |
| Wishlist | heart outline → fill with a 1.15 scale pulse, 260 ms | — | — |
| Accordion | chevron rotates 180°, content height auto-animated via `grid-template-rows` | — | — |
| Toast | slides up 16 px + fades, `dur-slow`, auto-dismiss 5 s, pauses on hover | — | focusable, dismissible by Esc |

Accordion height uses `grid-template-rows: 0fr → 1fr`, which animates smoothly without
measuring content or animating `height: auto` — the latter cannot be composited.

## 13.11 What is deliberately not animated

Listed explicitly, because restraint has to be specified or it will not survive implementation:

- Price. It appears; it never counts up. Animated pricing reads as a sales gimmick.
- Stock counts and "only 2 left" indicators. Urgency is stated plainly or not at all.
- Form validation errors. They appear instantly, without motion, because a user who has made a
  mistake wants information, not choreography.
- Checkout steps beyond a simple cross-fade. Nothing in the payment flow moves more than it
  must.
- Anything in the admin panel beyond `dur-fast` state changes. Staff use it 40 times a day;
  animation that delights on visit one is friction on visit four hundred.
