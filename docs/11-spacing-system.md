# 11 — Spacing, Grid & Layout System (canonical)

## 11.1 Base unit

**8 px base, 4 px half-step.** Every margin, padding, gap, and offset is a multiple of 4, and
values below 32 px should prefer multiples of 8. The 4 px step exists for optical corrections —
icon-to-label gaps, badge padding — not as a general-purpose escape hatch.

| Token | px | rem | Typical use |
|---|---|---|---|
| `space-0` | 0 | 0 | Reset |
| `space-1` | 4 | 0.25 | Icon/label gap, badge padding-y |
| `space-2` | 8 | 0.5 | Tight inline gaps, chip padding |
| `space-3` | 12 | 0.75 | Input padding-y, dense list rows |
| `space-4` | 16 | 1 | **Default gap.** Card padding on mobile |
| `space-5` | 20 | 1.25 | Button padding-x |
| `space-6` | 24 | 1.5 | Card padding, form field stack |
| `space-8` | 32 | 2 | Component group separation |
| `space-10` | 40 | 2.5 | Sub-section separation |
| `space-12` | 48 | 3 | Section padding on mobile |
| `space-16` | 64 | 4 | Section padding on tablet |
| `space-20` | 80 | 5 | Section padding on desktop |
| `space-24` | 96 | 6 | Major section separation |
| `space-32` | 128 | 8 | Editorial breathing room |
| `space-40` | 160 | 10 | Hero-adjacent, chapter breaks |

## 11.2 Vertical rhythm

Section padding is fluid, not stepped, so the page never has a moment where it looks
"almost" right between breakpoints.

```css
--section-y-sm:  clamp(3rem,  2.2rem + 3.4vw, 5rem);    /*  48 →  80px */
--section-y-md:  clamp(4.5rem, 3.2rem + 5.5vw, 8rem);   /*  72 → 128px */
--section-y-lg:  clamp(6rem,  4rem + 8.5vw, 11rem);     /*  96 → 176px */
```

| Density | Token | Where |
|---|---|---|
| Compact | `--section-y-sm` | Product listings, cart, checkout, admin, utility pages |
| Standard | `--section-y-md` | Most homepage sections, PDP blocks |
| Editorial | `--section-y-lg` | About, production, blog article, brand narrative moments |

Whitespace is the primary carrier of "premium" in this design language. Under commercial
pressure the instinct is to compress vertical space to fit more above the fold; that instinct
is what makes a site look cheap. Section padding is a design-system value, not a per-page
decision.

## 11.3 Grid

**12 columns, fluid gutters, fixed max-width.**

| Breakpoint | Range | Columns | Gutter | Margin | Max content |
|---|---|---|---|---|---|
| `xs` | 320–479 | 4 | 16 | 20 | fluid |
| `sm` | 480–767 | 4 | 16 | 24 | fluid |
| `md` | 768–1023 | 8 | 24 | 40 | fluid |
| `lg` | 1024–1439 | 12 | 24 | 56 | 1120 |
| `xl` | 1440–1919 | 12 | 32 | 80 | 1320 |
| `2xl` | 1920+ | 12 | 32 | auto | 1440 |

Above 1920 px the content container stops growing and margins absorb the rest. Editorial line
length, not viewport width, sets the ceiling — see [10-typography.md](10-typography.md) §10.4.

### Container variants

| Name | Max-width | Use |
|---|---|---|
| `container-full` | 100vw | Hero, full-bleed imagery, production scrollytelling |
| `container-wide` | 1440px | Product grids, gallery, admin tables |
| `container` | 1120–1320px | Default page content |
| `container-narrow` | 760px | Editorial body, blog articles, legal pages |
| `container-form` | 520px | Checkout steps, auth, single-column forms |

### Asymmetric editorial grid

Story pages (about, production, blog) use a 12-column grid with a deliberate offset: body text
occupies columns 3–9, pull quotes break left to column 2, and images break right to column 11
or bleed to the edge. This asymmetry is what separates an editorial layout from a centred
template, and it is specified per-page rather than left to the implementer.

## 11.4 Component spacing rules

1. **Spacing belongs to the parent.** Components do not carry outer margins. A `ProductCard`
   has internal padding and zero margin; the grid that contains it owns the gap. This makes
   components reusable in any context without margin-collapse surprises.
2. **Stack primitive.** Vertical rhythm inside components is applied by a `<Stack gap="…">`
   primitive using `display:flex; flex-direction:column; gap:…`, not by margin on children.
3. **One gap value per group.** A visual group uses a single gap. Mixing 12 px and 16 px
   inside the same list is the most common source of "something looks off".
4. **Optical, not mathematical, alignment** for circular elements, icons, and glyphs with
   sidebearings. A 4 px optical correction is permitted and should be commented as such.

## 11.5 Radii, borders, elevation

### Radius

| Token | px | Use |
|---|---|---|
| `radius-none` | 0 | Full-bleed images, section dividers |
| `radius-sm` | 4 | Badges, chips, checkboxes |
| `radius-md` | 8 | Inputs, buttons, small cards |
| `radius-lg` | 12 | Cards, modals, dropdowns |
| `radius-xl` | 20 | Feature panels, promotional blocks |
| `radius-full` | 9999 | Avatars, icon buttons, pills |

Product imagery is **`radius-none`**. Rounded corners on product photography reads as app UI;
square edges read as print. This is a deliberate identity decision, applied consistently.

### Borders

Hairlines only: `1px solid var(--border-hairline)`. A 2 px border appears exactly once, as the
focus ring. Heavier borders belong to a different, more industrial design language than this
one.

### Elevation

Shadows are warm-tinted, never neutral grey — a grey shadow on a cream background reads as
dirty. All shadows derive from `rgba(31, 58, 46, …)` (forest).

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(31,58,46,.05)` | Input rest |
| `shadow-sm` | `0 2px 8px rgba(31,58,46,.06)` | Card rest |
| `shadow-md` | `0 8px 24px rgba(31,58,46,.08)` | Card hover, dropdown |
| `shadow-lg` | `0 16px 48px rgba(31,58,46,.12)` | Modal, drawer |
| `shadow-xl` | `0 32px 80px rgba(31,58,46,.16)` | Fullscreen gallery, lightbox |

Elevation is applied sparingly. The default surface treatment is a hairline border on a tonal
background, not a shadow. Shadow indicates *interactivity or transience*, not mere grouping.

## 11.6 Z-index scale

A flat, named scale. Arbitrary `z-index: 9999` is a review rejection.

| Token | Value | Layer |
|---|---|---|
| `z-base` | 0 | Page content |
| `z-raised` | 10 | Hovered card, sticky in-page element |
| `z-sticky` | 100 | Sticky filters, sticky PDP purchase panel |
| `z-header` | 200 | Site header |
| `z-dropdown` | 300 | Nav mega-menu, select, search suggestions |
| `z-overlay` | 400 | Drawer and modal backdrop |
| `z-modal` | 500 | Modal, cart drawer, mobile menu |
| `z-toast` | 600 | Toasts, add-to-cart confirmation |
| `z-tooltip` | 700 | Tooltips, popovers |
| `z-max` | 9000 | Skip link, focus trap sentinel, dev overlays |

The skip link sits above everything by design — it must be reachable even when a modal is open
and misbehaving.

## 11.7 Touch targets

| Context | Minimum | Notes |
|---|---|---|
| Primary actions | 48 × 48 px | WCAG 2.2 AAA, and the right default for a 25–75 audience |
| Secondary actions | 44 × 44 px | Absolute floor |
| Inline text links | 44 px tall hit area | Achieved with padding, not line-height inflation |
| Adjacent targets | ≥8 px separation | Prevents mis-taps on quantity steppers and swatches |

Visual size and hit area are decoupled. A 24 px icon button gets a 48 px hit area via padding
or a pseudo-element, and there is no visual indication of the extra area. This is how the
interface stays elegant and usable simultaneously.
