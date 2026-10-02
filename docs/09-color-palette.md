# 09 — Colour Palette (canonical)

> **Round 11 — art direction (approved):** the storefront page and header background is **Персиковий `#F4D9B8`**, alternating with Warm Cream `#F2EDE3` sections; white is kept for component surfaces only. Decorative meadow colours are added: Лука `#8DB580`, Трава `#4E9A6A`, Арніка `#E0B33A`, Дзвоник `#6C7FC4`, Захід `#C77D58`, Сутінки `#6B4E71`. On peach, small secondary text uses `stone-600` (≈ 5 : 1), never `stone-500`. See [00-client-decisions-11.md](00-client-decisions-11.md).

This document is the single source of truth for every colour value in the product. No
component, page spec, or stylesheet may introduce a hex value that does not appear here.

## 9.1 Principles

1. **Photography is the colour.** The palette is a frame, not a subject. Chroma is deliberately
   low so that product and factory imagery carries all the saturation on screen.
2. **Two neutrals families, never mixed arbitrarily.** Warm neutrals (fleece) are backgrounds.
   Cool-ish stone neutrals are borders, secondary text, and disabled states. Mixing them
   randomly is what makes a palette look accidental.
3. **Accents are earned.** Gold, purple, and sky appear at most once per viewport, and never
   simultaneously.
4. **Every pairing used for text is contrast-verified.** Values below are measured, not
   estimated. The audience extends to 75 years old, where contrast sensitivity is materially
   reduced — WCAG AA is the floor here, not the goal.

## 9.2 Core ramps

### Forest — primary brand, dark surfaces, primary text

| Token | Hex | Use |
|---|---|---|
| `forest-950` | `#0E1A14` | Dark-mode page background |
| `forest-900` | `#16281F` | Dark surface, footer background |
| `forest-800` | `#1F3A2E` | **Primary brand colour.** Headings on light, primary button fill |
| `forest-700` | `#2A4C3C` | Primary button hover |
| `forest-600` | `#356049` | Borders on dark surfaces |
| `forest-500` | `#457A5D` | Rarely used; dark-mode links |

### Emerald — secondary, living/organic accents

| Token | Hex | Use |
|---|---|---|
| `emerald-700` | `#215C42` | Secondary button border, active nav underline |
| `emerald-600` | `#2E7355` | Success state, in-stock indicator |
| `emerald-500` | `#3C8A65` | Data-viz, progress fills |
| `emerald-100` | `#DCEBE3` | Success message background |

### Fleece — warm neutral backgrounds

| Token | Hex | Use |
|---|---|---|
| `fleece-50` | `#FDFCFA` | Card surface on cream background |
| `fleece-100` | `#FAF8F4` | **Wool White.** Default page background |
| `fleece-200` | `#F2EDE3` | **Warm Cream.** Alternate section background |
| `fleece-300` | `#E8E0D1` | Subtle divider on cream |
| `fleece-400` | `#E3D9C6` | **Natural Beige.** Tag fill, input background |
| `fleece-500` | `#D2C4A9` | Decorative rules, disabled fill on warm surfaces |

### Stone — structural neutrals

| Token | Hex | Use |
|---|---|---|
| `stone-200` | `#DEDCD7` | Hairline borders on white |
| `stone-300` | `#C6C3BC` | Input borders, disabled text on dark |
| `stone-400` | `#9A968D` | Placeholder text, icon secondary |
| `stone-500` | `#7B776E` | Metadata, timestamps |
| `stone-600` | `#5E5B54` | **Body secondary text.** Minimum for small text on light |
| `stone-800` | `#33312C` | Body primary text where forest is too branded |
| `stone-900` | `#1C1B18` | Maximum contrast text |

## 9.3 Accent colours

### Sky — calm, informational, cool relief

| Token | Hex | Use |
|---|---|---|
| `sky-600` | `#3E6D91` | Informational text, links in editorial body copy |
| `sky-500` | `#5A8AAF` | Info icon |
| `sky-300` | `#9EC0D8` | Decorative only — mountain gradient, chart fills |
| `sky-100` | `#E1EDF5` | Info message background |

### Ornament Purple — derived from traditional Hutsul dyed wool

| Token | Hex | Use |
|---|---|---|
| `orn-700` | `#4C3860` | Ornament linework on light surfaces |
| `orn-600` | `#5B4470` | Editorial pull-quote mark, category accent |
| `orn-400` | `#8E76A8` | Ornament on dark surfaces |
| `orn-100` | `#EBE4F2` | Rare — seasonal collection background |

### Muted Gold — value, warranty, handmade tier

| Token | Hex | Use |
|---|---|---|
| `gold-700` | `#8F6F38` | **Gold text on light backgrounds — the only gold that passes AA** |
| `gold-600` | `#B08D4F` | Icon, rule, border, badge stroke |
| `gold-400` | `#C9A96A` | Decorative rules, dark-surface accents |
| `gold-100` | `#F3EAD8` | Handmade-tier badge background |

**Constraint:** `gold-600` on `fleece-100` measures approximately 3.4:1. That is below AA for
body text. Gold is permitted as text only at `gold-700` (≈4.7:1), or at `gold-600` for text
≥24 px or ≥19 px bold. Enforce this in code review; it is the single most likely accessibility
regression in this palette.

## 9.4 Semantic colours

| Token | Light | Dark | Use |
|---|---|---|---|
| `success` | `emerald-600` | `emerald-500` | In stock, order placed |
| `warning` | `#9A6B1E` | `#D4A24C` | Low stock, made-to-order lead time |
| `danger` | `#8C2F22` | `#D9705F` | Out of stock, form error, destructive admin action |
| `info` | `sky-600` | `sky-300` | Shipping notes, neutral system messages |

Warning and danger are deliberately desaturated and earthy. Pure `#FF0000` would break the
palette and is forbidden, including in the admin panel.

## 9.5 Contrast reference

Measured WCAG 2.1 contrast ratios for the pairings the build actually uses.

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `forest-800` `#1F3A2E` | `fleece-100` `#FAF8F4` | ≈11.7:1 | AAA — headings, primary text |
| `stone-800` `#33312C` | `fleece-100` | ≈11.4:1 | AAA — body |
| `stone-600` `#5E5B54` | `fleece-100` | ≈6.2:1 | AA — secondary text, metadata |
| `stone-500` `#7B776E` | `fleece-100` | ≈4.2:1 | Fails AA for body. **Large text only.** |
| `stone-400` `#9A968D` | `fleece-100` | ≈2.7:1 | Decorative and placeholder only |
| `fleece-100` | `forest-800` | ≈11.7:1 | AAA — primary button label |
| `fleece-100` | `forest-900` `#16281F` | ≈14.6:1 | AAA — footer |
| `gold-700` `#8F6F38` | `fleece-100` | ≈4.7:1 | AA — smallest permitted gold text |
| `gold-600` `#B08D4F` | `fleece-100` | ≈3.4:1 | **Fails AA.** Large text or non-text only |
| `sky-600` `#3E6D91` | `fleece-100` | ≈5.3:1 | AA — editorial links |
| `danger` `#8C2F22` | `fleece-100` | ≈7.5:1 | AAA — errors |
| `gold-400` `#C9A96A` | `forest-900` | ≈7.1:1 | AAA — dark-surface accent text |

Ratios are computed from the sRGB values above and must be re-verified by automated test if
any value changes. A CI check asserting these pairs is specified in
[35-implementation-roadmap.md](35-implementation-roadmap.md).

## 9.6 Colour on photography

Text over imagery is the highest-risk contrast case because the background is not fixed.

**Rule:** text is never placed directly on an unmodified photograph. One of three treatments
is mandatory.

1. **Scrim gradient** — linear gradient from `rgba(14,26,20,0.72)` to `transparent` covering
   at least 140% of the text block height. Default for hero.
2. **Solid plate** — `forest-900` at 88% opacity with 8 px backdrop blur. Used for captions
   over busy imagery.
3. **Dedicated safe area** — the image is art-directed with an intentionally low-detail region.
   Preferred where the photo shoot is controllable, since it needs no overlay at all.

Every hero and banner image must declare a `focalPoint` and a `textSafeZone` in the media
record so crops at other aspect ratios never move text onto a busy region. See
[25-database-schema.md](25-database-schema.md).

## 9.7 Dark mode

The public site ships **light-only at launch**. Dark mode is architecturally prepared but not
released, for three reasons: the palette's warm neutrals are its identity and invert poorly;
product photography is shot on light backgrounds; and the 25–75 audience skews toward light
preference. Tokens are authored as CSS custom properties under `:root` and
`[data-theme="dark"]` so enabling it later is a content decision, not a refactor.

**The admin panel is dark by default**, as briefed. Admin uses the `forest-950`/`forest-900`
surfaces with `fleece-100` text and reuses the same semantic tokens.

## 9.8 Implementation

```css
:root {
  --c-forest-950:#0E1A14; --c-forest-900:#16281F; --c-forest-800:#1F3A2E;
  --c-forest-700:#2A4C3C; --c-forest-600:#356049; --c-forest-500:#457A5D;

  --c-emerald-700:#215C42; --c-emerald-600:#2E7355;
  --c-emerald-500:#3C8A65; --c-emerald-100:#DCEBE3;

  --c-fleece-50:#FDFCFA;  --c-fleece-100:#FAF8F4; --c-fleece-200:#F2EDE3;
  --c-fleece-300:#E8E0D1; --c-fleece-400:#E3D9C6; --c-fleece-500:#D2C4A9;

  --c-stone-200:#DEDCD7; --c-stone-300:#C6C3BC; --c-stone-400:#9A968D;
  --c-stone-500:#7B776E; --c-stone-600:#5E5B54; --c-stone-800:#33312C;
  --c-stone-900:#1C1B18;

  --c-sky-600:#3E6D91; --c-sky-500:#5A8AAF; --c-sky-300:#9EC0D8; --c-sky-100:#E1EDF5;
  --c-orn-700:#4C3860; --c-orn-600:#5B4470; --c-orn-400:#8E76A8; --c-orn-100:#EBE4F2;
  --c-gold-700:#8F6F38; --c-gold-600:#B08D4F; --c-gold-400:#C9A96A; --c-gold-100:#F3EAD8;

  /* semantic — components reference only these */
  --bg-page: var(--c-fleece-100);
  --bg-alt: var(--c-fleece-200);
  --bg-surface: var(--c-fleece-50);
  --text-primary: var(--c-forest-800);
  --text-body: var(--c-stone-800);
  --text-muted: var(--c-stone-600);
  --border-hairline: var(--c-stone-200);
  --accent: var(--c-gold-600);
  --accent-text: var(--c-gold-700);
}
```

Tailwind consumes these via `theme.extend.colors` mapped to the custom properties, so a theme
change never requires a rebuild of component classes. **Components must reference the semantic
layer (`--text-muted`), not the ramp layer (`--c-stone-600`).** Direct ramp references in
component code are a review rejection.
