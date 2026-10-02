# 08 — Design System

The design system is the contract that makes a 35-document blueprint buildable by more than one
person without drifting. It is deliberately small. A large design system on a project this size
is a liability, not an asset — every token that exists is a token someone must decide between.

## 8.1 Architecture

Three layers. Each layer may only reference the layer above it.

```
Layer 1 — PRIMITIVES     raw values: --c-forest-800, --space-6, --dur-base
                         ↓ referenced only by layer 2
Layer 2 — SEMANTICS      intent: --text-primary, --bg-page, --border-hairline
                         ↓ referenced by components
Layer 3 — COMPONENTS     React components consuming layer 2 only
```

**Enforcement:** a component that references a Layer-1 token directly is a code-review
rejection. This single rule is what makes a future dark mode, a seasonal theme, or a rebrand a
configuration change instead of a rewrite.

Canonical primitive definitions live in:
- Colour → [09-color-palette.md](09-color-palette.md)
- Type → [10-typography.md](10-typography.md)
- Space, radius, elevation, z-index → [11-spacing-system.md](11-spacing-system.md)
- Duration, easing → [13-motion-system.md](13-motion-system.md)

## 8.2 Design principles

Six principles, ordered. When two conflict, the higher-numbered one yields.

**1. Photography leads; the interface recedes.**
The UI's job is to frame the imagery and get out of the way. Any UI element competing with a
photograph for attention is wrong. This is why the palette is low-chroma, why product images
have no border radius, and why full-bleed layouts are the default rather than the exception.

**2. Evidence over assertion.**
Every claim on screen should be backed by something the visitor can see. This is a design
principle, not only a copy principle: it dictates that the trust row contains photographs of
the factory rather than icons of trust, and that the PDP surfaces measurable specifications
before it surfaces adjectives.

**3. Legible at 65.**
The audience runs to 75. 16 px minimum body text, AA contrast minimum, 48 px primary targets,
no thin weights below 20 px, no low-contrast placeholder-as-label patterns, no hover-only
affordances. These are constraints on the design, decided once, not accessibility fixes
applied at the end.

**4. One decision per screen.**
Each view has exactly one primary action, rendered in the primary style. Everything else is
secondary or tertiary. Two primary buttons in one viewport means the design has not decided
what it wants, and the visitor will not decide either.

**5. Motion explains, never decorates.**
Every animation must answer "what did this teach the user?" — spatial relationship, state
change, causality, or attention direction. Animation that answers none of these is deleted.
See [13-motion-system.md](13-motion-system.md) §13.11.

**6. Consistency beats cleverness.**
A slightly better one-off solution that breaks the system is worse than a slightly worse
solution that upholds it. The system's value is compounding; individual cleverness is not.

## 8.3 Surface model

Four surfaces. Their relationship is what gives the design depth without shadow-stacking.

| Surface | Background | Border | Content |
|---|---|---|---|
| **Page** | `--bg-page` (Wool White) | — | Default reading surface |
| **Alt** | `--bg-alt` (Warm Cream) | — | Alternating sections; creates rhythm without rules |
| **Raised** | `--bg-surface` | `1px --border-hairline` | Cards, panels, form groups |
| **Inverted** | `forest-900` | none | Footer, feature moments, admin |

Alternation rule: consecutive homepage sections alternate Page / Alt, with an Inverted section
appearing at most twice per page. Three tonal steps is enough to structure any page; a fourth
background colour makes the page look like it was assembled by different people.

## 8.4 Component taxonomy

```
primitives/     Box, Stack, Grid, Container, Text, VisuallyHidden, Portal
                — zero business logic, no colour decisions of their own

elements/       Button, IconButton, Link, Input, Select, Checkbox, Radio, Switch,
                Textarea, Badge, Tag, Avatar, Divider, Spinner, Tooltip, Rating
                — single-purpose, fully controlled, no data fetching

patterns/       Card, Accordion, Tabs, Modal, Drawer, Dropdown, Toast, Breadcrumb,
                Pagination, Carousel, Gallery, Stepper, EmptyState, SkeletonBlock
                — compositions of elements, still domain-agnostic

features/       ProductCard, ProductGallery, VariantSelector, AddToCart, CartDrawer,
                FilterPanel, SearchOverlay, ReviewList, TrustRow, ProductionTimeline,
                WholesaleForm, LocaleSwitcher, SheepMascot
                — domain-aware, may consume stores and server data

layouts/        SiteHeader, SiteFooter, PageShell, EditorialLayout, AdminShell
```

`features/` is the only layer that knows what a "product" is. Everything below it is reusable
in any project — which is the test for whether a component is in the right layer.

## 8.5 Button system

One component, four variants, three sizes. Anything not expressible here does not exist.

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `forest-800` | `fleece-100` | none | The one action per screen |
| `secondary` | transparent | `forest-800` | `1px stone-300` | Alternative actions |
| `ghost` | transparent | `stone-600` | none | Tertiary, toolbar, dismissal |
| `accent` | `gold-600` | `forest-950` | none | Rare. Wholesale CTA, seasonal promotion only |

| Size | Height | Padding-x | Type |
|---|---|---|---|
| `sm` | 40 px | 16 px | `button` 15 px |
| `md` | 48 px | 24 px | `button` 15 px |
| `lg` | 56 px | 32 px | `body` 17 px |

`md` is the default everywhere. `sm` exists for dense admin tables and filter chips only — it
is below the 48 px comfortable target and is therefore forbidden on the storefront's primary
paths.

**States:** rest, hover, active, focus-visible, disabled, loading. Loading replaces the label
with a spinner while **preserving the button's width**, so the layout cannot shift. Disabled
buttons are never the only explanation of why an action is unavailable — an adjacent message
always says why.

## 8.6 Form system

- **Labels are always visible, always above the field.** Placeholder-as-label fails for screen
  readers, fails on autofill, and fails for anyone who looks away mid-entry. It is banned.
- **Field height 48 px**, 16 px text (which also prevents iOS zoom-on-focus).
- **Errors appear below the field**, in `danger`, with an icon, and are announced via
  `aria-live="polite"`. The field gets `aria-invalid` and `aria-describedby` pointing at the
  message.
- **Validation timing:** on blur for the first validation of a field, then on change once the
  field has been marked invalid. Validating on every keystroke from the start punishes users
  mid-typing.
- **Required is marked on the optional fields instead** where most fields are required — "all
  fields required unless marked optional" is less visually noisy and more honest.
- **Autocomplete attributes are mandatory** on every checkout field (`given-name`, `tel`,
  `postal-code`, `email`). This is the single highest-leverage checkout conversion change
  available and it costs nothing.
- **Inputmode and type** set correctly: `inputmode="numeric"` for postal codes and quantities,
  `type="tel"` for phone. Wrong keyboards on mobile are a measurable conversion loss.

## 8.7 Iconography and imagery contracts

Icons: see [12-iconography.md](12-iconography.md).

Image contract — every `<img>` in the codebase must satisfy all of:

1. Explicit `width` and `height` attributes from `Media.width/height` — never omitted, so CLS
   is structurally zero.
2. `alt` from `MediaTranslation.alt` in the active locale; decorative images use `alt=""` and
   `aria-hidden="true"` and must be marked decorative in the CMS.
3. `loading="lazy"` except the LCP image, which is `loading="eager"` + `fetchpriority="high"`.
4. `srcset` with Cloudinary-generated widths at 1×/2×, `sizes` matching the real layout.
5. AVIF with WebP fallback, negotiated by Cloudinary `f_auto`.
6. A blurhash placeholder for anything above the fold.

These are enforced by a wrapper component; raw `<img>` is lint-banned outside it.

## 8.8 Content and empty states

Every list, search, filter, and collection has four designed states. Shipping only the happy
path is the most common quality gap in e-commerce builds.

| State | Requirement |
|---|---|
| **Loading** | Skeleton matching final dimensions exactly |
| **Empty (no data yet)** | Explains what will appear here, offers the action that creates it |
| **Empty (filtered to zero)** | Names the filters causing it and offers to clear them individually |
| **Error** | States what failed in plain language, offers retry, never shows a stack trace or code |

Empty states use the sheep mascot; error states do not. An error is not a moment for charm.

## 8.9 Theming and tokens in code

Tokens are authored once in TypeScript, generating both the CSS custom properties and the
Tailwind config, so the two can never diverge:

```ts
// tokens/index.ts — the only place a raw value is written
export const tokens = {
  color: { forest: { 800: '#1F3A2E', /* … */ } },
  space: { 4: '1rem', 6: '1.5rem', /* … */ },
  duration: { base: 220, reveal: 560 },
} as const;
```

A build step emits `tokens.css` and feeds `tailwind.config.ts`. Hand-editing either output is
a review rejection.

## 8.10 Quality gates

A component is not "done" until all of the following hold. This checklist is in the PR
template.

- [ ] Renders correctly in `uk`, `en`, `pl`, `de` — including the longest German string
- [ ] Keyboard operable end-to-end; focus order matches visual order
- [ ] `focus-visible` ring present and visible on every surface it appears on
- [ ] Passes AA contrast on every background it is used on
- [ ] Behaves correctly at 320 px, 768 px, 1440 px, and 1920 px
- [ ] Survives 200% browser text zoom
- [ ] Reduced-motion variant implemented and verified
- [ ] Loading, empty, error, and disabled states implemented
- [ ] No Layer-1 token referenced directly
- [ ] No layout shift on interaction (verified in DevTools with layout-shift regions on)
- [ ] Storybook story covering every variant and state
