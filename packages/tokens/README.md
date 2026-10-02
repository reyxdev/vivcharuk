# @vivcharyk/tokens

Design tokens authored once in TypeScript (`src/`), emitted as CSS by `npm run build`
(`dist/` is generated and git-ignored; never hand-edit it). Blueprint: `docs/27-folder-architecture.md` §27.9,
values from `docs/09`, `docs/10`, `docs/11`, `docs/36` §36.3 (+ `docs/13` §13.3 easings/springs).

## Tailwind v4 adaptation of §27.9

§27.9 specifies `emit-tailwind.ts → dist/tailwind-preset.js` spread into `tailwind.config.ts`.
The project uses Tailwind CSS v4, which is configured in CSS and has no JS presets, so the
script emits `dist/theme.css` instead: one `@theme inline { … }` block. Colours and fluid
sizes point at the runtime vars in `tokens.css`, so `[data-theme="dark"]` switches them
without rebuilding classes. Tailwind's default colours, font sizes, radii, shadows, easings
and breakpoints are reset (`--*: initial`), so only documented values produce utilities.

```css
/* app entry css */
@import "tailwindcss";
@import "@vivcharyk/tokens/tokens.css";
@import "@vivcharyk/tokens/theme.css";
```

```ts
import { duration, ease, spring, motionDuration } from '@vivcharyk/tokens';
```

Import `tokens.css` unlayered (no `layer(...)`).

## Utility names

- Colours are the semantic names only (§8.1): `bg-bg-page`, `text-text-muted`,
  `border-border-hairline`, `stroke-thread`; decorative `fill-meadow-luka` etc.
- Type: `text-h1`, `text-body`, `text-caption` … (size, line height, tracking, weight).
  Non-fluid steps that grow on desktop also have `text-body-desktop` (`lg:text-body-desktop`).
- Spacing: `--spacing` is 4 px, so `p-4` = `space-4` = 16 px; `py-section-y-md`.
- Durations and z-index have no Tailwind v4 namespace: `duration-(--dur-base)`, `z-(--z-modal)`.
