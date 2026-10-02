# 10 — Typography System (canonical)

> **Round 11 — wordmark:** the brand name «Вівчарик» is set in **Marck Script** (logo lockup, hero H1, footer) — wordmark use only; every heading and all text keep the families below. See [00-client-decisions-11.md](00-client-decisions-11.md).

Single source of truth for every type value. No spec may introduce a font size, weight, or
family not defined here.

## 10.1 The constraint that drives everything

The site ships in four locales: `uk` (Cyrillic), `en`, `pl` (Latin Extended-A), `de` (Latin-1
Supplement + ß). A font pairing that looks premium in Latin but has a weak or bolted-on
Cyrillic — which describes most "luxury editorial" typefaces — would make the canonical
locale the ugliest one. That is unacceptable.

**Selection criteria, in priority order:**

1. Native, designer-drawn Cyrillic — not an auto-generated extension.
2. Full Polish and German diacritic coverage.
3. Variable font, or ≤3 static weights, to protect the performance budget.
4. Licence permitting commercial web use without per-pageview fees.
5. Distinctive enough to avoid the Inter/Montserrat template signature.

## 10.2 The pairing

### Display — `e-Ukraine Head` (changed in round 9)

**The client chose a modern sans-serif for headings** ([00-client-decisions-9.md](00-client-decisions-9.md) part 1, answer 15). Display is
therefore `e-Ukraine Head`, the tighter companion of the body family: one Ukrainian superfamily
for the whole site, one V1 coverage check instead of two, and one fewer font file in the
performance budget. Hierarchy now comes from size, weight and spacing rather than from a change
of family — the sizes in §10.3 are unchanged; headings take the family's heavier weight and
slightly tighter tracking (−0.01em at H1–H2).

The previous choice is kept below for the reasoning, and because a serif may still be used for
one thing only: pull quotes in long editorial pages, if the design phase wants a contrast voice.

#### Previous display choice — `Kyiv*Type Serif` (superseded)

Ukrainian-designed, released free for commercial use, with Cyrillic as the *primary* script
rather than an afterthought. It carries a contemporary high-contrast serif structure that sits
comfortably next to Aesop- and Hermès-register typography while being unmistakably Ukrainian
in origin. Choosing a Ukrainian typeface for a Ukrainian manufacturer is itself a brand
argument, not merely a pragmatic one.

Used for: H1–H3, pull quotes, the wordmark lockup, large numerals in stat strips, product
family titles.

### Body / UI — `e-Ukraine`

A humanist grotesque from the Ukrainian government's design system, free for commercial use,
designed with accessibility as an explicit goal — which matters directly for the 60–75 segment
of the audience. `e-Ukraine Head` is the tighter companion for UI labels and buttons.

Used for: all body copy, UI, navigation, forms, tables, admin panel.

### Fallback stacks

```css
--font-display: "e-Ukraine Head", "e-Ukraine", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;  /* round 9 */
--font-quote: "Kyiv*Type Serif", "Noto Serif", Georgia, serif;   /* optional, editorial pull quotes only */
--font-body: "e-Ukraine", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
```

Mono appears only in the admin panel — SKUs, IDs, audit log entries, API keys.

### ⚠ Required verification before build — V1

Glyph coverage for both families must be verified against the full required character set
before a single line of CSS is written:

- Polish: `ą ć ę ł ń ó ś ź ż Ą Ć Ę Ł Ń Ó Ś Ź Ż`
- German: `ä ö ü ß Ä Ö Ü`
- Ukrainian: `ґ є і ї ' Ґ Є І Ї`

Verification method: render the string in the actual webfont build and inspect for `.notdef`
boxes and for fallback-font substitution via DevTools' computed-font panel — visual inspection
alone will miss a silent system-font substitution.

**If coverage fails**, the substitution plan is:
- Body → `Manrope` (native Cyrillic, variable, complete Latin Extended-A).
- Display → `Cormorant Garamond` (native Cyrillic, complete Latin Extended-A), accepting a
  loss of national specificity for guaranteed coverage.

Do not discover this after the design is signed off. It is scheduled as a Phase 0 task in
[35-implementation-roadmap.md](35-implementation-roadmap.md).

## 10.3 Type scale

A 1.25 (major third) ratio at the base, opening to 1.333 at display sizes for editorial drama.
All values are `rem` against a 16 px root. Fluid sizes use `clamp()` between the 375 px and
1440 px viewports.

| Token | Mobile | Desktop | `clamp()` | Family | Weight | Line height | Tracking |
|---|---|---|---|---|---|---|---|
| `display-xl` | 2.75rem | 6.25rem | `clamp(2.75rem, 1.2rem + 6.6vw, 6.25rem)` | Display | 500 | 0.96 | −0.03em |
| `display-lg` | 2.25rem | 4.5rem | `clamp(2.25rem, 1.3rem + 4.1vw, 4.5rem)` | Display | 500 | 1.02 | −0.025em |
| `display-md` | 1.875rem | 3.25rem | `clamp(1.875rem, 1.3rem + 2.4vw, 3.25rem)` | Display | 500 | 1.08 | −0.02em |
| `h1` | 2rem | 3rem | `clamp(2rem, 1.4rem + 2.6vw, 3rem)` | Display | 500 | 1.1 | −0.02em |
| `h2` | 1.625rem | 2.25rem | `clamp(1.625rem, 1.3rem + 1.4vw, 2.25rem)` | Display | 500 | 1.18 | −0.015em |
| `h3` | 1.375rem | 1.75rem | `clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)` | Display | 500 | 1.25 | −0.01em |
| `h4` | 1.125rem | 1.25rem | — | Body | 600 | 1.35 | 0 |
| `body-lg` | 1.125rem | 1.25rem | — | Body | 400 | 1.65 | 0 |
| `body` | 1rem | 1.0625rem | — | Body | 400 | 1.7 | 0 |
| `body-sm` | 0.9375rem | 0.9375rem | — | Body | 400 | 1.6 | 0 |
| `caption` | 0.875rem | 0.875rem | — | Body | 400 | 1.5 | 0.005em |
| `overline` | 0.75rem | 0.75rem | — | Body | 600 | 1.4 | 0.14em |
| `button` | 0.9375rem | 0.9375rem | — | Body Head | 600 | 1 | 0.01em |

### Two rules that override the table

1. **Body text never renders below 16 px on any breakpoint, in any component, including the
   admin panel.** `body-sm` at 15 px is permitted only for genuinely secondary content —
   metadata, captions, table cells. This is the primary accommodation for the 60–75 audience
   and it is not negotiable for cosmetic reasons.
2. **Minimum tap-adjacent text is 14 px** (`caption`). Nothing smaller than 12 px
   (`overline`) exists in the system, and `overline` is reserved for uppercase, tracked labels
   where the letterforms are large relative to the point size.

## 10.4 Measure

| Context | Target | Max |
|---|---|---|
| Editorial body (blog, about, production) | 62–68 characters | 72ch |
| Product description | 55–62 characters | 66ch |
| UI text, cards | 40–50 characters | 54ch |
| Display headings | 12–20 characters | 24ch |

Enforced with `max-width` in `ch` units, not px, so measure stays correct when the font
substitutes. Ukrainian and German set roughly 8–12% longer than English for the same content —
layouts are designed against the *German* string length and verified against Ukrainian, not
the other way round. Designing against English is how multilingual layouts break.

## 10.5 Hierarchy patterns

Three approved heading constructions. A fourth requires design review.

**Pattern A — Editorial section opener** (default for homepage sections)
```
OVERLINE            overline, --accent-text, uppercase, tracked
Large Display Head  display-md, --text-primary
Supporting sentence body-lg, --text-muted, max 62ch
```

**Pattern B — Product / commerce** (PDP, cards, listings)
```
Family label        caption, --text-muted
Product Name        h2, --text-primary
Price               h3, --text-primary, tabular-nums
```

**Pattern C — Numeric proof** (stat strips, trust rows)
```
30                  display-lg, --text-primary, tabular-nums
років виробництва   caption, --text-muted, uppercase, tracked
```

## 10.6 OpenType and numerals

```css
/* Global */
font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
font-optical-sizing: auto;
text-rendering: optimizeLegibility;

/* Prices, SKUs, quantities, stat numerals, any aligned column */
.tabular { font-variant-numeric: tabular-nums lining-nums; }
```

Tabular numerals are mandatory for prices. Proportional figures in a price column cause visible
jitter on hover and quantity change, and that jitter reads as sloppiness on a site claiming
precision.

Ukrainian typographic conventions are enforced in content: « » guillemets for quotation,
non-breaking space before `грн`, and `—` em dash with spaces. The CMS applies these
automatically on save rather than relying on editors.

## 10.7 Loading strategy

Typography is the largest single lever on LCP, and the brief targets 98–100 Performance.

1. **Subset aggressively.** Separate `woff2` subsets per script: Cyrillic, Latin, Latin-Ext.
   `unicode-range` lets the browser download only what the page needs — a `de` page never
   fetches the Cyrillic subset.
2. **`font-display: swap`** for body, **`optional`** for display. Display is used at large
   sizes where a fallback swap causes a visible reflow; `optional` trades a first-visit
   fallback for zero layout shift, which is the correct trade against the near-zero CLS target.
3. **Preload exactly two files** — body 400 and display 500, in the primary locale's subset.
   Preloading more competes with the LCP image for bandwidth and makes LCP worse.
4. **Self-host.** No Google Fonts CDN. It adds a third-party connection, has GDPR implications
   for the `de` locale, and provides no caching benefit under modern cache partitioning.
5. **Size-adjusted fallbacks.** Declare `@font-face` metric overrides (`size-adjust`,
   `ascent-override`, `descent-override`) for the fallback stack so the swap does not shift
   layout. Values are measured per font, not guessed.

```css
@font-face {
  font-family: "e-Ukraine Fallback";
  src: local("Arial");
  size-adjust: 96.5%;          /* measure, do not copy this number */
  ascent-override: 92%;
  descent-override: 24%;
}
```

Budget: **≤85 KB total webfont payload on first paint**, across all files.

## 10.8 Accessibility

- All sizes in `rem`; browser font-size settings must scale the entire interface. No `px`
  font sizes anywhere in the codebase — lint-enforced.
- Layout survives 200% text zoom with no loss of content or functionality (WCAG 1.4.4), and
  400% at 320 px width (WCAG 1.4.10). Verified per-page in the accessibility audit.
- `letter-spacing`, `word-spacing`, `line-height`, and paragraph spacing are all overridable by
  user stylesheets without breaking layout (WCAG 1.4.12). This rules out fixed-height text
  containers.
- No text rendered as an image, including in hero compositions and promotional banners. The
  admin banner editor must not permit it.
- Headings form a strict, gapless outline per page — one `h1`, no skipped levels. Visual size
  is decoupled from semantic level via the token system, so a visually small heading can still
  be an `h2`.
