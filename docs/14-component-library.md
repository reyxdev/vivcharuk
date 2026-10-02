# 14 — Component Library

The taxonomy is fixed by [08-design-system.md](08-design-system.md) §8.4 and is not negotiable
per component: `primitives/` → `elements/` → `patterns/` → `features/` → `layouts/`, each layer
composing only from the layers above it. A `Button` that imports a product type is in the wrong
folder, and the import-boundary lint rule fails the build rather than the review.

Every entry below states five things: **props**, **variants**, **states**, the **accessibility
contract**, and the **motion behaviour** referencing [13-motion-system.md](13-motion-system.md).
Where a component has composition constraints that are not obvious, they are stated too. Anything
not specified here does not exist; adding a component requires a new entry, not a new file.

Business facts come from [00-client-decisions.md](00-client-decisions.md) and
[00-client-decisions-2.md](00-client-decisions-2.md), the latter now outranking every other
source. Three Round-1 decisions shape components rather than content, and they are called out
where they land: the `ProductOrigin` split between own manufacture and partner goods (§D3), the
by-weight categories пряжа / ровниця / вовна для рукоділля (§D4), and the cold start — a new brand
on a new domain with no catalogue and no reviews (§D2). The last of these is why every list,
gallery, and review surface in this library treats the empty state as a first-class design rather
than an afterthought: on this project the empty state is what launch day actually looks like.

Note one Round-2 correction to that list: [00-client-decisions-2.md](00-client-decisions-2.md) E5
permits the adjacent business's **photographs** to be reused after re-crop, re-grade, EXIF strip,
semantic rename and new per-locale `alt` text. There is therefore a media library at launch, which
changes the *severity* of the empty gallery state without changing the requirement to design it —
`ProductGallery` still needs its zero-image state for a newly authored product.

### Components this library does not contain, and never will

[00-client-decisions-2.md](00-client-decisions-2.md) E12 settles customer accounts permanently:
«Сайт назавжди працює в режимі гостьових покупок.» The following are **out of scope by decision,
not by backlog**, and the list exists so nobody later reads the absence as an oversight and adds
one back:

| Not built | Replaced by |
|---|---|
| `LoginForm`, `RegisterForm`, `PasswordResetForm`, `EmailVerification` | Nothing. There is no customer identity to authenticate |
| `AccountMenu`, `AccountNav`, `AccountShell`, `OrderHistory`, `SavedAddresses`, `SavedPaymentMethods` | `OrderLookupForm` (§14.5) — order number + email, no session |
| Wishlist merge-on-login | Nothing. `WishlistButton` is `localStorage`-only and device-local (§14.5) |
| Any customer auth state in [28-state-management-architecture.md](28-state-management-architecture.md) | The `Cart.token` cookie and `localStorage`, neither of which identifies a person |
| `SocialLinks` | Nothing. E3: the owners run no accounts on any platform |

This removes real surface area: no customer credential storage, no customer session management, no
credential-stuffing exposure, and a materially smaller GDPR footprint. It is the cheapest
simplification in the project and it was granted rather than argued for. **Staff authentication is
unaffected** — `AdminShell` and
[24-employee-permission-architecture.md](24-employee-permission-architecture.md) stand in full.

Two further Round-2 rulings land across several components at once, and are stated here rather than
repeated eight times:

- **E7 — partner manufacturers cannot be named.** `Product.partnerName` stays null and is never
  rendered by any component in this library. Where a partner is disclosed the label is «Відібрано
  Вівчариком» plus «Виготовлено карпатським майстром» where `partnerRegion` is known, or
  «Виготовлено іншим виробником» where it is not — at **equal visual weight** to «Власне
  виробництво». Affects `Badge`, `ProductCard`, `FilterPanel`, `SearchOverlay`, `AdminShell`.
- **E2 — the workshop is in Яворів, not Вербовець.** Every place-name string in this library's
  copy examples changes accordingly, and «Карпати» was replaced by «Яворів» wherever the point
  being made is specificity. **The second half of that rule is reversed by Round 3** — see below.
  Affects `TrustRow`, `ProductionTimeline`, `SiteFooter`.

### Round 3

[00-client-decisions-3.md](00-client-decisions-3.md) now outranks both earlier rounds. Three of
its rulings land across several components at once and are stated here rather than repeated:

- **F6 — the tagline reverts to «в Карпатах».** The client reviewed the Яворів substitution and
  rejected it: «Ні, напиши краще "в Карпатах".» The approved copy from
  [00-client-decisions.md](00-client-decisions.md) D1 stands unchanged. Яворів is **not** deleted
  from this library; it moves one layer down, to the surfaces where the reader already has
  context — the NAP block, the contact block, the production and about surfaces, and structured
  data. The governing pattern, applied wherever a place-name string appears below:
  **«Карпати» to be understood, «Яворів» to be believed.** The headline earns attention; the
  surfaces beneath it earn trust. Different jobs. Affects `TrustRow`, `SiteHeader`, `SiteFooter`.
- **F3 — partner goods are sold under the Вівчарик brand.** This resolves E7's open question and
  it **raises** the importance of the on-page origin label rather than lowering it, because the
  brand name now appears on goods the brand did not make. Nothing in `Badge`'s origin pair is
  softened. The structured-data rule that comes with it is stated at `Badge` and enforced at
  `AdminShell`. Affects `Badge`, `ProductCard`, `FilterPanel`, `AdminShell`.
- **F2 — the Яворів site is a retail shop as well as a factory.** «Там знаходиться і магазин і
  виробництво.» A visitable shop attached to a production floor is the strongest available answer
  to "is this a real factory or a reseller", and the components that render the address must
  convey a destination rather than a registration detail. Affects `SiteFooter`, `SiteHeader`,
  `TrustRow`.

## 14.1 Conventions that apply to every component

| Convention | Rule | Why it beats the alternative |
|---|---|---|
| Ref forwarding | Every component that renders a DOM node forwards its ref | Focus management, measurement, and Framer Motion `layoutId` all require it. Retrofitting refs later touches every file |
| Polymorphism | Primitives take `as`; elements and above do not | Unconstrained `as` on a `Button` lets a caller render a `<div>` and lose the entire keyboard contract. Where a link must look like a button, that is the `Link` component's `variant="button"`, not a polymorphic `Button` |
| Styling | `className` merged last via `cn()`; no `style` prop except for CSS custom properties | A `style` prop is an escape hatch straight past the token layer. Custom properties (`--card-aspect`) stay inside the system |
| Colour | Semantic tokens only (`--text-muted`), never ramp tokens | [08-design-system.md](08-design-system.md) §8.1, enforced by a stylelint rule on `--c-*` in component files |
| Control mode | Every stateful component is controllable (`value` + `onChange`) and falls back to internal state (`defaultValue`) | Uncontrolled-only components cannot participate in URL-synced filter state; controlled-only components make every trivial usage verbose |
| State exposure | `data-state="open \| closed \| checked \| loading"` on the root | Lets CSS and tests target state without reading class strings, and keeps Framer Motion variants declarative |
| Spacing | Components carry internal padding and **zero outer margin** | [11-spacing-system.md](11-spacing-system.md) §11.4 rule 1 — the parent owns the gap |
| i18n | No literal user-facing string in a component; all via `useTranslation()` | Layouts are verified against the longest German string per [10-typography.md](10-typography.md) §10.4 |
| Motion | Every animated component reads `useMotionSafe()`; no component implements its own `prefers-reduced-motion` check | One source of reduced-motion truth, [13-motion-system.md](13-motion-system.md) §13.6 |
| Focus ring | Inherited from a global `:focus-visible` rule; components never remove or redefine it | A per-component ring is how a ring silently disappears on one surface |

Shared primitives used throughout: `useMotionSafe()`, `useFocusTrap()`, `useScrollLock()`,
`useId()`, `useRovingTabIndex()`, `useDismissable()` (Esc + outside-pointer + route change).
Focus trapping, scroll locking, and dismissal are implemented **once** and reused by Modal,
Drawer, Dropdown, SearchOverlay, FilterPanel, and CartDrawer — six chances to get it wrong,
reduced to one.

---

## 14.2 `primitives/`

Zero business logic, no colour decisions of their own.

### Box

```ts
interface BoxProps<T extends ElementType = 'div'> {
  as?: T; p?: SpaceToken; px?: SpaceToken; py?: SpaceToken;
  surface?: 'page' | 'alt' | 'raised' | 'inverted';   // 08-design-system §8.3
  radius?: RadiusToken; border?: boolean; elevation?: ElevationToken;
  className?: string; children?: ReactNode;
}
```

**Variants** the four surfaces only. **States** none. **A11y** renders exactly what `as` says and
adds nothing; a `Box` is never interactive. **Motion** none. **Composition** the only component
permitted to emit a background colour directly, which is what makes the surface model auditable —
grep for `surface=` and you have every tonal step on the site.

### Stack

```ts
interface StackProps { direction?: 'column' | 'row'; gap: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch'; justify?: JustifyToken;
  wrap?: boolean; divider?: ReactNode; as?: ElementType; }
```

**Variants** column (default) and row. **States** none. **A11y** none of its own; if used for a
list, the caller passes `as="ul"` and children render `<li>`. **Motion** none. **Composition**
`gap` is required with no default — [11-spacing-system.md](11-spacing-system.md) §11.4 rule 3 says
one gap value per group, and a default invites two different gaps in one list.

### Grid

```ts
interface GridProps { cols?: 1|2|3|4|6|12; colsMd?: …; colsLg?: …;
  gap: SpaceToken; gapY?: SpaceToken; flow?: 'row' | 'dense'; as?: ElementType; }
```

**Variants** the column counts that divide the 12-column grid in
[11-spacing-system.md](11-spacing-system.md) §11.3. **States** none. **A11y** none; a product grid
passes `as="ul"`. **Motion** children may stagger via `Rise`, capped at 6 per §13.4. **Composition**
arbitrary column counts (5, 7) are not offered — they break the gutter rhythm at every breakpoint.

### Container

```ts
interface ContainerProps { size?: 'full' | 'wide' | 'default' | 'narrow' | 'form';
  as?: ElementType; children: ReactNode; }
```

**Variants** the five from [11-spacing-system.md](11-spacing-system.md) §11.3. **States** none.
**A11y** none. **Motion** none. **Composition** containers never nest except `full` wrapping
another container for a full-bleed background with contained content — the single legitimate case.

### Text

```ts
interface TextProps<T extends ElementType = 'p'> {
  as?: T; token: TypeToken;                 // 10-typography §10.3
  color?: 'primary' | 'body' | 'muted' | 'accent' | 'danger' | 'inverse';
  measure?: 'editorial' | 'product' | 'ui' | 'display' | 'none';
  tabular?: boolean; balance?: boolean; truncate?: number;
}
```

**Variants** every token in the type scale. **States** none. **A11y** `as` and `token` are
independent — a visually small heading is still an `h2`, which is what keeps the heading outline
gapless per [10-typography.md](10-typography.md) §10.8. **Motion** none. **Composition** `tabular`
is mandatory on every price, quantity, and SKU (§10.6); `truncate` uses `-webkit-line-clamp` and is
banned on prices and product names, where truncation hides purchase-relevant information.

### VisuallyHidden

```ts
interface VisuallyHiddenProps { as?: ElementType; focusable?: boolean; children: ReactNode; }
```

**Variants** static and `focusable` (the skip link, which becomes visible on focus). **States**
hidden, visible-on-focus. **A11y** the clip-rect technique, never `display:none` or
`visibility:hidden`, both of which remove the content from the accessibility tree — which is the
opposite of the point. **Motion** none. **Composition** the mechanism behind every icon-only button
name and every live-region announcement in this document.

### Portal

```ts
interface PortalProps { container?: HTMLElement; children: ReactNode; }   // default #portal-root
```

**Variants** none. **States** mounted, unmounted. **A11y** portalled content leaves the DOM order,
so every consumer must restore the relationship explicitly — `aria-controls` from the trigger,
`aria-labelledby` on the surface, and focus return on close. Portal does not do this for you and
deliberately does not pretend to. **Motion** none; exit animation is the consumer's `AnimatePresence`.
**Composition** the portal root sits as the last child of `<body>` so the z-index scale in
[11-spacing-system.md](11-spacing-system.md) §11.6 resolves without stacking-context surprises.

---

## 14.3 `elements/`

Single-purpose, fully controlled, no data fetching.

### Button

```ts
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean; loadingLabel?: string;
  iconStart?: IconKey; iconEnd?: IconKey; fullWidth?: boolean;
}
```

**Variants / sizes** exactly the table in [08-design-system.md](08-design-system.md) §8.5; `md` is
the default and `sm` is forbidden on storefront primary paths. **States** rest, hover, active,
focus-visible, disabled, loading. **A11y** native `<button>` always; `type` defaults to `"button"`
so a button in a form cannot submit it by accident. Loading sets `aria-busy="true"` and
`aria-live="polite"` on a hidden label, and keeps the accessible name — replacing the label with a
spinner alone leaves the control nameless. A disabled button is never the only explanation of why
an action is unavailable (§8.5). **Motion** background `dur-instant`, press `scale 0.98` at
`dur-fast` (§13.10); loading preserves the measured width so no layout shift occurs.
**Composition** icon-only usage is prohibited — that is `IconButton`.

### IconButton

```ts
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconKey; label: string;                       // required, localised
  variant?: 'ghost' | 'secondary' | 'inverse'; size?: 'sm' | 'md';
  pressed?: boolean;                                   // renders aria-pressed
}
```

**Variants** three; no `primary`, because an icon-only primary action violates the label rule in
[12-iconography.md](12-iconography.md) §12.4. **States** rest, hover, active, focus-visible,
disabled, pressed. **A11y** `label` is a required prop and renders as `VisuallyHidden` text rather
than `aria-label`, so it survives translation tooling. Hit area is 48 × 48 (44 floor) regardless of
the 20/24 px glyph, per [11-spacing-system.md](11-spacing-system.md) §11.7. `pressed` emits
`aria-pressed` and is always paired with a colour change, never fill alone. **Motion** `dur-fast`
background; wishlist gets the 1.15 scale pulse at 260 ms (§13.10). **Composition** permitted on the
storefront only for the §12.4 exception list.

### Link

```ts
interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string; variant?: 'inline' | 'standalone' | 'button' | 'nav' | 'quiet';
  external?: boolean; locale?: Locale;
}
```

**Variants** five; `button` renders button styling on a real anchor for navigational CTAs.
**States** rest, hover, visited (editorial only), focus-visible, current (`aria-current="page"`).
**A11y** underlined in body copy always — colour alone fails WCAG 1.4.1 for links in text.
`external` adds `rel="noopener noreferrer"`, the `nav.external` icon, and a `VisuallyHidden`
"(opens in a new tab)". Link text is self-describing; "детальніше" without context is a review
rejection. Hit area 44 px tall via padding, not line-height (§11.7). **Motion** underline grows
from the left at `dur-base` (§13.10). **Composition** `to` is locale-prefixed automatically; a raw
`<a>` to an internal route is lint-banned.

### Input

```ts
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string; hint?: string; error?: string;
  prefix?: ReactNode; suffix?: ReactNode; optional?: boolean;
}
```

**Variants** by native `type`; sizing is fixed at 48 px height, 16 px text (§8.6). **States** rest,
hover, focus, filled, error, disabled, readonly. **A11y** the label is a real `<label>`, always
visible, always above — placeholder-as-label is banned (§8.6). Errors render below the field in
`danger` with `status.alert-circle`, announced through `aria-live="polite"`; the field carries
`aria-invalid` and `aria-describedby` pointing at both hint and error. `autocomplete` and
`inputmode` are required props in checkout contexts, enforced by a typed wrapper. Validation fires
on blur first, then on change once invalid. **Motion** none — form errors appear instantly, by
[13-motion-system.md](13-motion-system.md) §13.11. **Composition** `optional` marks optional
fields, because everything else is required (§8.6).

### Select

```ts
interface SelectProps { label: string; value?: string; onChange(v: string): void;
  options: Array<{ value: string; label: string; disabled?: boolean; group?: string }>;
  placeholder?: string; error?: string; hint?: string; }
```

**Variants** one. **States** as Input. **A11y** wraps a **native `<select>`**, not a custom
listbox. The native control gets the platform picker on mobile, works with every screen reader
without maintenance, and survives 200 % zoom — a custom listbox buys a chevron animation and costs
a permanent accessibility liability. Where a visual swatch is genuinely required, that is
`VariantSelector`, which is a radio group, not a select. **Motion** none; the picker is the OS's.
**Composition** above ~12 options with search intent, use `Dropdown` with a filter field instead.

### Checkbox / Radio

```ts
interface CheckboxProps { label: ReactNode; checked?: boolean; indeterminate?: boolean;
  onChange(c: boolean): void; error?: string; description?: string; }
interface RadioGroupProps { label: string; name: string; value?: string;
  onChange(v: string): void; options: RadioOption[]; orientation?: 'vertical' | 'horizontal'; }
```

**Variants** standalone and card-style (the whole card is the label, used in checkout delivery
choice). **States** unchecked, checked, indeterminate (checkbox only), focus-visible, disabled,
error. **A11y** a native input visually hidden beneath a styled box — not `role="checkbox"` on a
div, which loses forced-colors rendering and form participation. The entire label is clickable and
is ≥44 px tall. `RadioGroup` renders a `<fieldset>` with a `<legend>`; arrow keys move between
radios natively, and the group is one tab stop. Indeterminate is set imperatively via ref because
it is a DOM property, not an attribute. **Motion** tick draws in over `dur-fast`, disabled under
reduced motion. **Composition** filter facets use Checkbox; anything mutually exclusive uses Radio.

### Switch

```ts
interface SwitchProps { label: string; checked: boolean; onChange(c: boolean): void;
  description?: string; disabled?: boolean; }
```

**Variants** one. **States** off, on, focus-visible, disabled. **A11y** `role="switch"` with
`aria-checked` on a native `<button>`; Space and Enter both toggle. On/off state is conveyed by
thumb position **and** by a text label, not by colour. **Motion** thumb translates `dur-fast`,
`ease.gentle`. **Composition** admin and preference surfaces only. A Switch applies its change
immediately; anything requiring a Save button is a Checkbox, and confusing the two is the usual
bug.

### Textarea

```ts
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string; hint?: string; error?: string; maxLength?: number; autoGrow?: boolean; }
```

**Variants** fixed and `autoGrow`. **States** as Input. **A11y** the character counter is
`aria-live="polite"` and announces only at the 80 % threshold and at the limit — announcing every
keystroke makes the field unusable with a screen reader. Never `resize: none`. **Motion** `autoGrow`
height change is instantaneous; animating it fights the caret. **Composition** used by
`WholesaleForm`, review submission, and admin editors.

### Badge / Tag

```ts
interface BadgeProps { tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  icon?: IconKey; children: ReactNode; }
interface TagProps { children: ReactNode; onRemove?(): void; removeLabel?: string; }
```

**Variants** Badge has six tones; `gold` is the handmade tier (`Product.isHandmade`) and uses
`gold-700` text on `gold-100`, the only gold pairing that passes AA
([09-color-palette.md](09-color-palette.md) §9.3). **States** Badge is static; Tag has rest, hover,
focus-visible on its remove control. **A11y** a Badge is text, not an image — "В наявності" is read
as text, and tone is never the only signal. Tag's remove control is an `IconButton` with a label
naming what is removed ("Прибрати фільтр: 150×200"). **Motion** Badge none; Tag removal fades at
`dur-fast`. **Composition** Badges never carry interaction. Tags appear in `FilterPanel` active
filters and in admin.

**The paired origin marks.** Both are Badges of tone `neutral` at **equal visual weight** —
rendering own manufacture in `gold` and partner goods in `warning` would turn
[00-client-decisions.md](00-client-decisions.md) §D3's curation story into a visible caveat, which
is exactly the outcome §D3 is written to avoid.

| `Product.origin` | Badge line 1 | Badge line 2 |
|---|---|---|
| `OWN_MANUFACTURE` | «Власне виробництво» | — |
| `PARTNER_MANUFACTURE`, `partnerRegion` set | «Відібрано Вівчариком» | «Виготовлено карпатським майстром · {partnerRegion}» |
| `PARTNER_MANUFACTURE`, `partnerRegion` null | «Відібрано Вівчариком» | «Виготовлено іншим виробником» |

The previous wording «Вироблено партнерами {{PARTNER}}» is **withdrawn**.
[00-client-decisions-2.md](00-client-decisions-2.md) E7 answers «Ні» to naming the partners,
permanently, so `partnerName` never reaches this component — it is absent from `OriginMarkProps`
rather than merely unused, which is the only way to guarantee it is never rendered:

```ts
type OriginMark =
  | { origin: 'OWN_MANUFACTURE' }
  | { origin: 'PARTNER_MANUFACTURE'; partnerRegion?: string };   // no partnerName field exists
```

E7's principle governs the treatment and is worth restating at the component level, because this
is the component where it would be quietly eroded: **being unable to name the partner is a reason
to be more explicit that the item is not own-made, not less.** The partner badge is therefore two
lines where the own badge is one — it carries *more* type, not less — and the second line is set
in the same size and tone as the first. Any implementation that renders the partner mark in
`--text-muted`, at a smaller size, or below the fold of a card fails review, regardless of how it
looks. A disclosure rendered smaller than the claim it qualifies is a disclosure designed not to
be read.

**Round 3 confirms partner goods are sold under the Вівчарик brand, and that makes this component
matter more.** [00-client-decisions-3.md](00-client-decisions-3.md) F3 answers the question E7
left open: «Так, продаються під брендом Вівчарик.»

The temptation this creates is to conclude that the label is now redundant — if everything in the
catalogue carries one brand, why distinguish? The opposite is true, and it is the reason this
paragraph exists in a component spec rather than in a strategy document. Selling another
workshop's goods under your own brand is ordinary retail practice and entirely legitimate, but it
sits in tension with [01-brand-strategy.md](01-brand-strategy.md) §1.2 — *the brand sells verified
origin* — because the brand name now appears on items the brand did not make. The badge is the
only thing standing between "informed customer" and "customer who worked it out later", and a
customer who works it out later feels misled by the brand they bought from.

Nothing in the table above changes. Specifically, and as review criteria:

| Rule | Status after F3 |
|---|---|
| Equal visual weight, both marks `neutral` | **Unchanged.** Not softened, not de-emphasised, not moved below the fold |
| Partner badge is two lines to the own badge's one | **Unchanged.** It carries more type, not less |
| `partnerName` absent from the prop type | **Unchanged.** Still absent, not merely unused (E7) |
| `partnerRegion` rendered where known | **Unchanged.** Used where it exists; the honest fallback renders where it does not |
| Origin facet pinned at the top of `FilterPanel` | **Unchanged** |

**The structured-data rule, stated here because this component is the visible half of it.** The
same `Product` record drives this badge and the JSON-LD emitted by
[29-seo-architecture.md](29-seo-architecture.md), and F3 fixes the mapping:

```jsonc
// OWN_MANUFACTURE
"brand":        { "@type": "Brand",        "name": "Вівчарик" },
"manufacturer": { "@type": "Organization", "name": "Вівчарик" }

// PARTNER_MANUFACTURE
"brand":        { "@type": "Brand",        "name": "Вівчарик" },
// "manufacturer" omitted entirely — never set to Вівчарик, never set to the partner
```

`brand` is Вівчарик for **both** origins, because that is what is true: it is the brand under
which the item is sold. `manufacturer` is set only for own manufacture, and for partner goods it
is **omitted** rather than filled — schema.org draws exactly this distinction, and omission
states the fact without asserting anything false. Setting `manufacturer` to Вівчарик on a partner
product would be a machine-readable false claim, which is the worst kind to make: it is
persistent, it is quotable, and it is exactly what an AI retrieval layer will repeat
([30-ai-search-optimization.md](30-ai-search-optimization.md)). The serialiser therefore derives
both properties from `Product.origin` with no editorial override, and `AdminShell` exposes no
field that can set them independently (§14.6).

### Avatar

```ts
interface AvatarProps { name: string; mediaId?: string; size?: 'sm' | 'md' | 'lg'; }
```

**Variants** image and initials fallback. **States** loading, loaded, error→initials. **A11y**
decorative when a name is rendered adjacent (`alt=""`), named otherwise. Initials are rendered
text, never an image. **Motion** blurhash cross-fade 300 ms (§13.9). **Composition** review authors,
admin staff, and the production page's named people — never a customer-facing stock photo.

### Divider

```ts
interface DividerProps { orientation?: 'horizontal' | 'vertical';
  variant?: 'hairline' | 'ornament'; label?: string; }
```

**Variants** hairline and `ornament`, the latter terminating the rule with `orn.rhombus`.
**States** none. **A11y** `role="separator"` when it separates content semantically, `aria-hidden`
when purely visual. A labelled divider uses the label as the separator's accessible name.
**Motion** none. **Composition** `ornament` is the structural-ornament permission from
[01-brand-strategy.md](01-brand-strategy.md) §1.6 and appears at most once per viewport.

### Spinner

```ts
interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; label?: string; inline?: boolean; }
```

**Variants** three sizes. **States** spinning only. **A11y** `role="status"` with a
`VisuallyHidden` label when standalone; `aria-hidden` when inside an already-`aria-busy` control.
**Motion** continuous `linear` rotation — one of the few legitimate uses of `linear` (§13.3). Under
`prefers-reduced-motion` it becomes a static mark plus a text progress indicator (§13.6).
**Composition** for content areas prefer `SkeletonBlock`; a spinner says "wait", a skeleton says
"here is what is coming", and the second is better.

### Tooltip

```ts
interface TooltipProps { content: string; side?: 'top'|'right'|'bottom'|'left';
  children: ReactElement; }
```

**Variants** one. **States** hidden, visible, focused-visible. **A11y** supplementary only — a
tooltip **never** carries information required to complete a task, because hover-only affordances
are banned by [02-ux-research.md](02-ux-research.md) §2.6. It opens on hover *and* on keyboard
focus, stays open while the pointer travels to it (WCAG 1.4.13 hoverable), dismisses on Esc without
moving focus, and is referenced by `aria-describedby` — not `aria-labelledby`, which would replace
the control's name. **Motion** fade plus 4 px rise, `dur-base`, 300 ms open delay, 0 ms close.
**Composition** banned on touch-primary surfaces and on anything in the checkout.

### Rating

```ts
interface RatingProps { value: number; count?: number; size?: 'sm'|'md';
  interactive?: boolean; onChange?(v: number): void; }
```

**Variants** display and interactive (review submission). **States** display; interactive adds
hover-preview, focus-visible, selected. **A11y** display mode is one `role="img"` with
`aria-label="4.6 з 5, 23 відгуки"` — five separate star elements produce five meaningless
announcements. Interactive mode is a radio group with visible numeric labels. Half-stars are
rendered with a clip, and the numeric value is always shown as text beside the stars.
**Motion** none in display mode. **Composition** aggregate values come only from `APPROVED`
reviews with `isVerifiedPurchase`, per [25-database-schema.md](25-database-schema.md) §25.6.

---

## 14.4 `patterns/`

Compositions of elements, still domain-agnostic. The six flagged below are where component
libraries usually fail WCAG, so their contracts are specified in full.

### Card

```ts
interface CardProps { as?: ElementType; interactive?: boolean; href?: string;
  media?: ReactNode; surface?: 'raised' | 'page'; padding?: SpaceToken; }
```

**Variants** static and interactive. **States** rest, hover, active, focus-visible. **A11y** the
whole-card link uses **one** anchor covering the title with a stretched pseudo-element, not a
wrapping anchor around everything — a wrapping anchor swallows the image alt, the badge, and the
price into a single 40-word link name. Secondary controls inside the card sit above the stretched
link with `position: relative`. **Motion** the `Lift` pattern from
[13-motion-system.md](13-motion-system.md) §13.4 — `y: -4`, shadow `sm → md`, inner image
`scale 1.04` inside a fixed overflow-hidden frame so the layout box never changes. **Composition**
media is `radius-none`; rounded product imagery is banned by
[11-spacing-system.md](11-spacing-system.md) §11.5.

### Accordion

```ts
interface AccordionProps { type: 'single' | 'multiple'; defaultValue?: string | string[];
  value?: string | string[]; onValueChange?(v): void; collapsible?: boolean;
  headingLevel?: 2 | 3 | 4; }
```

**Variants** single and multiple. **States** collapsed, expanded, focus-visible, disabled.

**A11y contract.** Each header is a real `<button>` wrapped in a heading of `headingLevel`, which
keeps the page outline intact — a `<div role="button">` inside no heading is the usual failure and
it removes every section from the screen-reader heading list. The button carries `aria-expanded`
and `aria-controls`; the panel carries `role="region"` and `aria-labelledby` pointing back at the
button. Headers are **normal tab stops**, not a roving tabindex group (the APG pattern), with
Up/Down moving between headers and Home/End jumping to first and last. The subtle failure this
component must avoid: the collapse animation uses `grid-template-rows: 1fr → 0fr` (§13.10), which
keeps the panel in the DOM at zero height, so collapsed content stays focusable and reachable by
Tab. The panel therefore receives `inert` and `visibility: hidden` at the end of the collapse
transition, and has them removed at the *start* of expansion. Without that, a keyboard user tabs
into invisible content — a WCAG 2.4.3 and 2.4.7 failure that no automated tool catches.

**Motion** `nav.chevron-down` rotates 180° at `dur-base`; height via `grid-template-rows`, never
`height: auto`. Under reduced motion the panel appears instantly and `inert` toggles synchronously.
**Composition** used by PDP specification blocks, FAQ (which also emits FAQPage structured data),
and mobile `FilterPanel` groups.

### Tabs

```ts
interface TabsProps { value?: string; defaultValue: string; onValueChange?(v: string): void;
  orientation?: 'horizontal' | 'vertical'; activation?: 'manual' | 'automatic';
  variant?: 'underline' | 'pill'; }
```

**Variants** underline (storefront) and pill (admin). **States** rest, hover, selected,
focus-visible, disabled.

**A11y contract.** `role="tablist"` on the container with `aria-orientation`; each tab is a
`<button role="tab">` with `aria-selected` and `aria-controls`; each panel is
`role="tabpanel"` with `aria-labelledby`. A **roving tabindex** puts exactly one tab in the tab
order: the selected tab has `tabindex="0"`, the rest `tabindex="-1"`. Arrow keys move between tabs
with wrap-around, Home/End jump to the ends. **Activation defaults to `manual`** — arrows move
focus, Enter or Space activates. Automatic activation is only acceptable when panels are free to
render, and the PDP's reviews panel fetches data, so automatic activation would fire a request for
every tab a keyboard user arrows past. The panel itself receives `tabindex="0"` **only when it
contains no focusable element**, so the panel content is reachable; giving every panel
`tabindex="0"` adds a useless tab stop. Hidden panels are unmounted or `hidden`, never merely
visually hidden.

**Motion** the underline translates between tabs with Framer Motion `layoutId` at `dur-base`,
`ease.gentle`; panel content cross-fades at `dur-fast`. No horizontal slide — sliding panels imply
a spatial relationship that tabs do not have. **Composition** never used to hide primary content
from a PDP; specifications and care information live in an Accordion instead, because tab content
is not found by in-page search or by Google.

### Modal

```ts
interface ModalProps { open: boolean; onOpenChange(open: boolean): void;
  title: string; description?: string; size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean; initialFocusRef?: RefObject<HTMLElement>;
  footer?: ReactNode; }
```

**Variants** three widths. **States** closed, opening, open, closing.

**A11y contract.** Rendered through `Portal` with `role="dialog"` and `aria-modal="true"`,
`aria-labelledby` bound to the rendered `title` and `aria-describedby` to `description` when
present. On open, focus moves to the **dialog container** (`tabindex="-1"`), not to the first
control, unless `initialFocusRef` is supplied — landing on the first input skips the title, so a
screen-reader user never hears what the dialog is for. Focus is trapped by `useFocusTrap()` using
sentinel nodes rather than a keydown handler, so focus cannot escape to browser chrome and back
into the page behind. Everything outside the dialog receives `inert`, which removes it from the
accessibility tree, from pointer events, and from the tab order in one attribute — `aria-hidden`
alone leaves the background mouse-operable. Esc closes when `dismissible`; a non-dismissible modal
(destructive confirmation only) still responds to its own Cancel button, and a modal with no way
out does not exist. On close, focus returns to the exact trigger element; if that element has
unmounted, focus moves to the nearest surviving landmark rather than to `<body>`, which would
reset the screen reader to the top of the page. Scroll lock uses `scrollbar-gutter: stable` so
locking does not shift the page by the scrollbar width. Nested modals are prohibited by the API —
there is no second portal layer, by design.

**Motion** backdrop fades at `dur-base`; panel rises 12 px and scales `0.98 → 1` at `dur-slow`,
`ease.out`. Exit is 0.6× the entrance duration — exits that match entrances feel sluggish. Under
reduced motion both are a 150 ms cross-fade (§13.6). **Composition** never used in checkout;
[13-motion-system.md](13-motion-system.md) §13.11 and the linear checkout rule in
[02-ux-research.md](02-ux-research.md) §2.6 both point the same way.

### Drawer

```ts
interface DrawerProps { open: boolean; onOpenChange(open: boolean): void;
  side?: 'right' | 'left' | 'bottom'; title: string; size?: 'sm' | 'md' | 'full';
  swipeToDismiss?: boolean; }
```

**Variants** three sides; `bottom` is the mobile sheet. **States** closed, opening, open, dragging,
closing.

**A11y contract.** Identical to Modal — `role="dialog"`, `aria-modal="true"`, labelled title,
focus to container, focus trap with sentinels, `inert` on the background, Esc to close, focus
returned to the trigger, scroll lock with stable gutter. Two additions. First, swipe-to-dismiss is
implemented with Pointer Events and must not become the only way to close: a visible 48 px close
`IconButton` is always present, because a drag gesture is invisible to a keyboard and unreliable
with a tremor ([02-ux-research.md](02-ux-research.md) §2.6). Second, on a `bottom` sheet the drag
handle is decorative and `aria-hidden` — it is not a control and must not be announced as one.
Content inside the drawer scrolls with `overscroll-behavior: contain` so a scroll gesture at the
list's end does not scroll the locked page behind it.

**Motion** `spring.drawer` from [13-motion-system.md](13-motion-system.md) §13.3; backdrop fades at
`dur-base`. Drag follows the pointer 1:1 with a rubber-band beyond the open position; release past
40 % of width or above 500 px/s velocity commits the dismissal. Reduced motion replaces the slide
with a cross-fade. **Composition** the base of `CartDrawer`, mobile navigation, and mobile
`FilterPanel` — one implementation, three consumers.

### Dropdown

```ts
interface DropdownProps { trigger: ReactElement; align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom'; items: DropdownItem[]; }   // item | separator | group label
```

**Variants** menu and mega-menu (the header's category panel). **States** closed, open, item
hovered, item focused, item disabled.

**A11y contract.** The trigger carries `aria-haspopup="menu"`, `aria-expanded`, and
`aria-controls`. The surface is `role="menu"`; items are `role="menuitem"` (or `menuitemcheckbox`
for the listing sort state). Items are **not** in the document tab order — a roving tabindex is
used, so Tab leaves the menu entirely rather than walking through fifteen items, which is the
behaviour a keyboard user expects from a menu and the single most common mistake in this pattern.
Down/Up move with wrap, Home/End jump, printable-character typeahead jumps to a matching item, Esc
closes and returns focus to the trigger, Tab closes and moves to the next control after the
trigger. Opening with Enter, Space, or Down focuses the first item; opening with Up focuses the
last. The menu is not `aria-modal` and does not trap focus — a menu is not a dialog, and trapping
focus in one strands the user. Outside-pointer dismissal uses `pointerdown`, not `click`, so the
menu is gone before the click lands on what is underneath. Positioning is collision-aware and the
surface is rendered in the `Portal`, at `z-dropdown` per
[11-spacing-system.md](11-spacing-system.md) §11.6.

**Motion** fade plus 4 px rise at `dur-base`, transform origin at the trigger edge. The header
mega-menu opens on click, not hover — hover-only navigation is banned by
[02-ux-research.md](02-ux-research.md) §2.6. **Composition** for a select-one-value control use
`Select`; `role="menu"` semantics on a value picker mis-describe it to a screen reader.

### Carousel

```ts
interface CarouselProps { label: string; slidesPerView?: ResponsiveValue<number>;
  autoAdvanceMs?: number; loop?: boolean; showDots?: boolean; children: ReactNode; }
```

**Variants** single-slide (hero, testimonials) and multi-slide (related products). **States**
idle, dragging, auto-advancing, paused, at-start, at-end.

**A11y contract.** The container is `role="group"` with `aria-roledescription="carousel"` and an
`aria-label`; each slide is `role="group"` with `aria-roledescription="slide"` and an
`aria-label="3 з 9"`. Previous/Next are real buttons with `aria-controls` pointing at the slide
container, and they are **disabled at the ends when `loop` is false** rather than silently doing
nothing. Off-screen slides receive `inert`, so Tab never lands on an invisible product card — the
defect that makes most carousels a keyboard maze. If `autoAdvanceMs` is set, a visible Pause
control is mandatory (WCAG 2.2.2), auto-advance stops permanently on any user interaction and on
focus entering the carousel, and the slide container is `aria-live="off"` while rotating and
`aria-live="polite"` once manual — announcing automatic rotation is noise, announcing a user's own
navigation is feedback. Auto-advance is disabled outright under `prefers-reduced-motion`
([13-motion-system.md](13-motion-system.md) §13.6). The track is CSS `scroll-snap`, so the
component still works with JavaScript disabled and the browser supplies native touch physics.
Dots are buttons labelled "Перейти до слайда 3", with `aria-current` on the active one.

**Motion** snap-scroll transition at `dur-base`, `ease.gentle`; drag follows the pointer 1:1.
**Composition** never the only route to content — every carousel has a "see all" link beside it,
because carousel content past slide one is effectively unseen.

### Toast

```ts
interface ToastProps { id: string; tone: 'success'|'info'|'warning'|'danger';
  title: string; description?: string; action?: { label: string; onClick(): void };
  durationMs?: number; }
```

**Variants** four tones. **States** entering, visible, hovered (paused), exiting. **A11y** the
region is `role="status"` / `aria-live="polite"` for success and info, `role="alert"` /
`aria-live="assertive"` for danger only — assertive interrupts whatever the user is reading, and
overusing it makes the site hostile. Toasts are keyboard reachable via F6 to the region, dismiss on
Esc, and **auto-dismiss is disabled when the toast contains an action**, since a 5 s window is not
enough time to find and click "Undo". Maximum three visible; older ones collapse. **Motion** rise
16 px plus fade at `dur-slow`, pause on hover and on focus (§13.10). **Composition** never used for
form validation errors, which belong beside their field.

### Breadcrumb

```ts
interface BreadcrumbProps { items: Array<{ label: string; href?: string }>;
  collapseAfter?: number; }
```

**Variants** full and collapsed-middle. **States** rest, hover, current. **A11y** `<nav
aria-label="Хлібні крихти">` wrapping an `<ol>`; the last item is plain text with
`aria-current="page"`, not a link to the current page. Separators are CSS pseudo-elements, so they
are never read aloud. **Motion** none. **Composition** emits `BreadcrumbList` structured data from
the same data, so the visual and the markup cannot diverge.

### Pagination

```ts
interface PaginationProps { page: number; pageCount: number; onPageChange(p: number): void;
  hrefFor(p: number): string; siblingCount?: number; }
```

**Variants** numbered (default) and load-more. **States** rest, hover, current, disabled.
**A11y** `<nav aria-label="Пагінація">`; page links are real anchors with real hrefs so they are
crawlable and middle-clickable; current page carries `aria-current="page"`. After a page change,
focus moves to the results heading and an `aria-live` region announces "Сторінка 3 з 8". Load-more
appends and announces the count of newly added items. **Motion** none; the new page replaces
content without animation, because animating a full-page content swap delays reading.
**Composition** numbered pagination with crawlable hrefs is mandatory, not optional.
`{{SKU_COUNT}}` is **resolved** by [00-client-decisions-2.md](00-client-decisions-2.md) E5 to
several hundred to roughly a thousand products, following the catalogue import. That settles what
was previously an open question in [00-client-decisions.md](00-client-decisions.md) §D6 and
settles it in favour of this decision rather than against it: at that volume a listing genuinely
runs to dozens of pages, and on a cold-start domain with zero authority (§D2) every indexable URL
matters more than usual. Infinite scroll alone would leave page-two products with no address for
Google to find.

### Gallery

```ts
interface GalleryProps { items: MediaRef[]; initialIndex?: number;
  layout?: 'grid' | 'masonry'; lightbox?: boolean; }
```

**Variants** grid and masonry. **States** rest, hover, lightbox-open, zoomed. **A11y** the lightbox
is a Modal and inherits its entire contract. Arrow keys move between images, Esc closes, focus
returns to the thumbnail that opened it — not to the first thumbnail. Each image announces
"Зображення 4 з 12" plus its `MediaTranslation.alt`. Pinch and wheel zoom are mirrored by explicit
zoom buttons. **Motion** thumbnail → lightbox uses the `Morph` pattern with `layoutId` (§13.4);
reduced motion cross-fades. **Composition** backs the factory album and the production page. There
is no inherited image library ([00-client-decisions.md](00-client-decisions.md) §D2), so every
image it renders comes from the commissioned shoot that assumption E1 in
[00-assumptions.md](00-assumptions.md) still blocks on — the gallery's empty state is therefore a
real launch scenario, not a theoretical one.

### Stepper

```ts
interface StepperProps { steps: Array<{ id: string; label: string }>;
  current: number; completed: number[]; onStepClick?(i: number): void; }
```

**Variants** horizontal (desktop checkout) and compact "Крок 2 з 4" (mobile). **States** upcoming,
current, completed, error. **A11y** an `<ol>` with `aria-current="step"` on the active item;
completed steps are links back, upcoming steps are not focusable, and state is carried by text
("Виконано") as well as by the tick icon. **Motion** connector fill at `dur-base`; nothing else —
checkout motion is limited to a cross-fade (§13.11). **Composition** back navigation never
destroys entered data ([02-ux-research.md](02-ux-research.md) §2.6).

### EmptyState

```ts
interface EmptyStateProps { variant: 'no-data' | 'filtered-to-zero' | 'error';
  title: string; description: string; action?: ReactNode;
  clearableFilters?: Array<{ label: string; onClear(): void }>; }
```

**Variants** the three from [08-design-system.md](08-design-system.md) §8.8. **States** static.
**A11y** rendered inside the results region with `aria-live="polite"` so a filtered-to-zero result
is announced rather than silently emptying the page. **Motion** fade at `dur-fast`. **Composition**
`no-data` and `filtered-to-zero` render `SheepMascot`; `error` never does — an error is not a
moment for charm (§8.8). `filtered-to-zero` must list the active filters as individually clearable
`Tag`s, not offer a single "clear all".

### SkeletonBlock

```ts
interface SkeletonBlockProps { width?: string; height?: string; radius?: RadiusToken;
  lines?: number; aspect?: number; }
```

**Variants** block, text-lines, media-aspect. **States** one. **A11y** `aria-hidden="true"`, with
the loading state announced once by the parent region's `aria-busy` — announcing every skeleton bar
is meaningless. **Motion** a shimmer at 1.6 s `linear`, removed entirely under reduced motion.
**Composition** skeleton dimensions must equal the loaded content's dimensions; a mismatched
skeleton causes CLS and is worse than no skeleton (§13.9).

---

## 14.5 `features/`

Domain-aware. The only layer that knows what a product is.

### ProductCard

```ts
interface ProductCardProps { product: ProductListItem; priority?: boolean;
  showQuickAdd?: boolean; layout?: 'grid' | 'row';
  originDisplay?: 'badge' | 'inline' | 'none';   // 'none' only in own-manufacture-only contexts
}
```

**Variants** grid and row (search results, wishlist). **States** rest, hover, focus-within,
out-of-stock, loading skeleton. **A11y** built on `Card`'s single-stretched-link contract; the link
name is the product name only. Price is `Text tabular`; a range renders "4 990 – 7 400 ₴" from
`priceMinMinor`/`priceMaxMinor`. Badges (`isHandmade` gold tier, `isUniquePiece`, made-to-order
lead time, and the `ProductOrigin` mark) are text, not colour alone. For a by-weight product the
price renders with its unit — "від 620 ₴/100 г" — because an unqualified figure beside a skein
photograph will be read as the price of the skein. Quick-add is a separate button layered above the
stretched link, and is suppressed for by-weight products, which cannot be added in a single click.
**Motion** `Lift` (§13.4); the image is the LCP candidate on listing pages, so the first row sets
`priority` and is exempt from entrance animation (§13.8). **Composition** `radius-none` media;
1.25 aspect fixed so the grid never reflows at any catalogue size. `{{SKU_COUNT}}` is **resolved**
by [00-client-decisions-2.md](00-client-decisions-2.md) E5 to several hundred to roughly a
thousand, following the catalogue import — which sits comfortably inside the fixed-aspect grid's
envelope and confirms rather than challenges this decision.
`originDisplay="none"` is permitted **only** where the surrounding rail is already filtered to
`OWN_MANUFACTURE` — homepage, hero, best-sellers, production storytelling — which is the surface
rule in [00-client-decisions.md](00-client-decisions.md) §D3 point 5. Anywhere a partner product
can appear, every card in that view shows its origin, including the own-manufacture ones. Labelling
only the partner goods is how a neutral fact becomes a visible asterisk.

### ProductGallery

```ts
interface ProductGalleryProps { media: ProductMediaItem[]; productName: string;
  initialIndex?: number; }
```

**Variants** desktop (vertical thumbnail rail plus stage) and mobile (scroll-snap strip with
counter). **States** idle, zoomed, lightbox-open. **A11y** the thumbnail rail is a `tablist` with
the stage as a single `tabpanel` — thumbnails select a view, which is exactly the tab relationship,
and the full Tabs keyboard contract applies including manual activation. Each thumbnail is labelled
by position and role (`MediaRole.DETAIL`, `SCALE_REFERENCE`). Zoom is available via a button, not
hover alone. **Motion** stage cross-fades at `dur-fast`; lightbox uses `Morph`. **Composition** a
`SCALE_REFERENCE` image is required on every ліжник, накидка, гуня, and sheepskin PDP — scale is the
top unanswered question for a 200 × 220 cm object bought online. Yarn and rovnytsia PDPs instead
require a true-colour swatch shot, because colour fidelity, not scale, is what that audience
returns products over. `MediaRole.PRODUCTION` images are shown on own-manufacture PDPs only; a
production photograph beside a partner product is a false provenance claim
([00-client-decisions.md](00-client-decisions.md) §D3 point 6).

### VariantSelector

```ts
interface VariantSelectorProps { optionTypes: OptionTypeWithValues[];
  variants: VariantSummary[]; value: Record<string, string>;
  onChange(v: Record<string, string>): void;
  dyeLot?: { id: string; remaining: number } | null;   // yarn, rovnytsia, craft wool
}
```

**Variants** by `OptionDisplay` — `PILL`, `SWATCH`, `DROPDOWN`, `SIZE_GRID`
([25-database-schema.md](25-database-schema.md) §25.3). **States** available, selected,
unavailable-in-combination, out-of-stock, disabled. **A11y** each option type is a `<fieldset>`
with a `<legend>` and a radio group — not a button group, because the semantics are
select-one-of-many. Swatches carry the colour name as text, never colour alone. Combinations that
do not exist are `aria-disabled` and announced as "недоступно", and remain focusable so a
screen-reader user can discover *why*. Selection updates price and stock through one
`aria-live="polite"` region, not three. **Motion** swatch ring expands 0 → 2 px, `scale 0.94` on
press (§13.10). **Composition** size is a variant axis here and a facet in `FilterPanel`, never a
category. `dyeLot` renders the lot identifier and the quantity still available in that lot, because
[00-client-decisions.md](00-client-decisions.md) §D4 records that needleworkers buy several skeins
from one lot and that a mismatch generates a return. Until dye-lot tracking is confirmed (§D6
question 3) the prop is `null` and the component renders an honest statement that lots are not
guaranteed — silence on this point reads as a guarantee to that audience, which is the worse of the
two failure modes.

### AddToCart

```ts
interface AddToCartProps { variantId?: string; maxQty: number; disabledReason?: string;
  madeToOrderDays?: number | null; pricingUnit: PricingUnit;
  stepGrams?: number;                                   // KILOGRAM/SKEIN units only
  onAdd(variantId: string, qty: number): Promise<void>; }
```

**Variants** `PIECE` (stepper), and **by-weight** (`KILOGRAM`, `SKEIN`, `METRE`) which replaces the
stepper with a labelled quantity field plus preset chips, and shows the running line total as the
value changes. Layout variants: inline (PDP) and sticky (mobile PDP bar, `z-sticky`). **States**
idle, no-variant-selected, adding, success, error, unavailable. **A11y** when disabled,
`disabledReason` renders as adjacent visible text — never a disabled button alone (§8.5). Success is
announced via `aria-live="polite"` and names the unit: "Додано до кошика: пряжа «Смерека», 300 г".
The by-weight field is `inputmode="decimal"` with a visible unit suffix and a stated minimum, and it
is a real text input rather than a slider, because a slider cannot express 250 g precisely with
reduced motor precision ([02-ux-research.md](02-ux-research.md) §2.6). **Motion** on success the
label morphs to a tick over 400 ms and the header cart badge counts up (§13.10); button width is
preserved throughout. **Composition** made-to-order lead time is stated in the button's vicinity
before purchase, not after. The by-weight variant exists because
[00-client-decisions.md](00-client-decisions.md) §D4 confirms пряжа, ровниця, and вовна для
рукоділля as launch stock sold by weight; reusing a unit stepper for them produces a cart whose
arithmetic is wrong in the customer's favour or the business's, and both are damaging.

### CartDrawer

```ts
interface CartDrawerProps { open: boolean; onOpenChange(o: boolean): void; }
```

**Variants** one. **States** empty, populated, updating, error, free-shipping-threshold progress.
**A11y** a `Drawer`, inheriting its full dialog contract. Line-item quantity changes announce the
new line total and the new cart total through one polite region. Removal announces what was removed
and offers Undo in the same region. By-weight lines render quantity with the unit and, where a dye
lot is attached, the lot identifier — the cart is the last place a needleworker can catch a
mismatched lot before it ships. **Motion** `spring.drawer`; line removal collapses at `dur-fast`.
**Composition** the threshold progress bar renders only once {{FREE_SHIPPING_THRESHOLD}} is
confirmed. The component refuses to render an unresolved token rather than falling back to a
placeholder figure, because a threshold set too high relative to order value discourages rather
than encourages, and an invented one is worse than none.

By-weight lines carry no dye-lot identifier at launch:
[00-client-decisions-2.md](00-client-decisions-2.md) E8 resolves dye lots as **not tracked**.
`ProductVariant.dyeLot` stays in the schema, nullable and unused, and this component renders the
lot line only when the field is populated — which it never is today. Removing the branch would be
premature; rendering an empty lot label would imply a guarantee that cannot be honoured.

### WishlistButton

```ts
interface WishlistButtonProps {
  variantId: string;
  layout?: 'icon' | 'inline';        // icon on cards, inline with a label on the PDP
  onChange?(saved: boolean): void;
}
```

**Variants** `icon` (an `IconButton` on `ProductCard` and in the gallery) and `inline` (the PDP
control, carrying a visible label). **States** unsaved, saved, hydrating. **A11y** the accessible
name states the storage reality in both states — «Зберегти на цьому пристрої» / «Збережено на
цьому пристрої» — and `aria-pressed` reflects it. The `inline` variant renders «Збережено на цьому
пристрої» as **visible text**, not a tooltip and not fine print. **Motion** heart outline→fill with
the 1.15 scale pulse at 260 ms (§13.10); under reduced motion the fill swaps with no pulse. The
`hydrating` state renders the unsaved icon with no badge and no skeleton — see below.

**Composition — `localStorage` only, device-local, permanently.**
[00-client-decisions-2.md](00-client-decisions-2.md) E12 removes `WishlistItem` from the schema
and removes the merge-on-login flow specified in [25-database-schema.md](25-database-schema.md)
§25.8b. There is no server record, no sync, no account to attach one to, and no future in which
there is.

| Concern | Rule |
|---|---|
| Storage | `wishlist:v1` in `localStorage`, an array of `variantId` strings. Not a cookie — the value is never needed server-side and a cookie would add bytes to every request and raise a `de` consent question for nothing |
| Hydration | The server cannot know the count, so the button renders its unsaved state server-side and corrects after hydration. The header badge fades in rather than flickering `0 → 3` ([15-navbar-specification.md](15-navbar-specification.md) §15.19) |
| Stale ids | Variant ids that no longer resolve are dropped silently on read. A wishlist rendering a "product not found" card is worse than one rendering nine items instead of ten |
| Clearing | Clearing browser data clears the list. The `EmptyState` says so in plain language rather than implying data loss |

**Why the honest label beats pretending it syncs.** The alternative — an unqualified heart icon —
costs nothing on the day it is built and everything on the day it fails. Someone saves six ліжники
on a phone in a shop, opens a laptop at home, finds an empty list, and concludes the shop lost
their data. They do not file a bug; they leave, and they attribute the failure to the seller rather
than to a storage model nobody told them about. «Збережено на цьому пристрої» converts a future
breach of expectation into a present, minor, correctly-set one — and it prompts the behaviour that
actually survives, which is sending oneself the link.

It is the same principle [01-brand-strategy.md](01-brand-strategy.md) §1.8 applies to origin
labelling and that `Badge` applies above: **disclose the limit at the moment of the promise, not
at the moment of the failure.** A brand that labels a partner product honestly and then implies a
wishlist syncs has spent its credibility unevenly.

There is no «Поділитися списком» control. Sharing implies a server-side list; there is none.

### OrderLookupForm

```ts
interface OrderLookupFormProps { initialOrderNumber?: string; }   // prefilled from a query param
```

**Variants** one. **States** idle, validating, submitting, found, not-found, rate-limited.
**A11y** two labelled inputs — order number (`inputmode="numeric"`) and email
(`autocomplete="email"`, `inputmode="email"`) — with errors below each field in an `aria-live`
region and a summary at the top for the submit-level failure. The success state replaces the form
with the order's status and moves focus to it. **Motion** none (§13.11) — this is a
money-and-anxiety surface. **Composition** this is what replaces the account area removed by E12.
It takes **order number + email as a pair**, validated against `Order.guestToken`, and creates no
session and no account.

| Rule | Reason |
|---|---|
| Entry point is the **footer**, in the Покупцю column — not the header | The header's utility cluster is optimised for the pre-purchase visitor and is already at capacity. Tracking is a post-purchase task occurring at most once per order. Full reasoning in [16-footer-specification.md](16-footer-specification.md) §16.4b |
| The real primary path is the `guestToken` link in the confirmation email | This form is the fallback for a deleted email. Sizing the entry point to the actual frequency is why it is a footer link and not a header control |
| Never offers to «create an account to track future orders» | There are no accounts. A prompt for a thing that does not exist is the single most likely regression on this component |
| The not-found state does not reveal which of the two fields was wrong | Enumeration resistance. Rate limiting and the full threat model are in [32-security-architecture.md](32-security-architecture.md) |
| Labelled «Відстежити замовлення», never «Кабінет» | Plain language for the task, not a borrowed metaphor for a room that does not exist |

### FilterPanel

```ts
interface FilterPanelProps { facets: Facet[]; value: FilterState;
  onChange(v: FilterState): void; resultCount: number; loading?: boolean; }
```

**Variants** desktop sidebar (sticky, `z-sticky`) and mobile `Drawer`. **States** idle, applying,
zero-results. **A11y** each facet group is an `Accordion` item containing a `<fieldset>` of
checkboxes, and inherits the Accordion `inert`-on-collapse rule. The result count is a single
`aria-live="polite"` region debounced at 500 ms, so rapid multi-select announces once rather than
six times. Active filters render as removable `Tag`s above the results. The price range control
offers two number inputs as well as a slider, because a slider is unusable with reduced motor
precision. **Motion** none on the panel; results fade at `dur-fast`. **Composition** filter state
is URL-synced so a filtered view is shareable and survives a comparison tab
([02-ux-research.md](02-ux-research.md) §2.7). Facets come from `AttributeDefinition.isFilterable`,
plus two that are not attributes: **origin** (`OWN_MANUFACTURE` / `PARTNER_MANUFACTURE`) and
**composition**. The origin facet is mandated by [00-client-decisions.md](00-client-decisions.md)
§D3 point 4 and is pinned to the top of the panel rather than sorted alphabetically among the
others, because the wholesale audience — the most commercially valuable one — will reach for it
first, and burying it would look like reluctance.

### SearchOverlay

```ts
interface SearchOverlayProps { open: boolean; onOpenChange(o: boolean): void; }
```

**Variants** one. **States** empty (recent and popular queries), typing, results, no-results,
error. **A11y** a combobox, built to the APG pattern: the input has `role="combobox"`,
`aria-expanded`, `aria-controls`, and `aria-activedescendant`; the suggestion list is
`role="listbox"` with `role="option"` children. Focus **stays in the input** while arrows move
`aria-activedescendant` — moving DOM focus into the list breaks typing, which is the classic
autocomplete failure. Result count is announced politely and debounced at 300 ms. Esc clears the
query on the first press and closes on the second. The overlay is a modal dialog and traps focus.
**Motion** overlay fades at `dur-base`; results do not animate in — staggered search results delay
reading. **Composition** every query writes to `SearchQueryLog`; zero-result queries are the
merchandising signal that matters most.

### ReviewList

```ts
interface ReviewListProps { productId: string; summary: RatingSummary;
  initialReviews: Review[]; }
```

**Variants** PDP block and homepage excerpt. **States** loading, loaded, empty, submitting,
submitted-pending-moderation. **A11y** the histogram is a table with visible numeric values, not
bars alone. Each review is an `<article>` with a heading and a `<time datetime>`. "Корисно" is a
toggle with `aria-pressed` and a live count. Photo thumbnails open the `Gallery` lightbox.
**Motion** "load more" appends without animation. **Composition** only `APPROVED` reviews render;
only `APPROVED` + `isVerifiedPurchase` feed the aggregate and the `AggregateRating` structured data
([25-database-schema.md](25-database-schema.md) §25.6). There are no reviews to inherit — the
adjacent business's testimonials are not this brand's ([00-client-decisions.md](00-client-decisions.md)
§D2) — so **the empty state is the launch state** and is designed rather than tolerated: it invites
the first review and states the moderation policy, and the component emits no `AggregateRating`
markup at all until real reviews exist. Emitting a zero or a fabricated rating is a structured-data
violation and the exact trust failure this brand cannot afford in month one.

### TrustRow

```ts
interface TrustRowProps { items: TrustItem[]; variant?: 'photo' | 'compact'; }
```

**Variants** `photo` (default — each item is a real factory photograph with a caption) and
`compact` (icon plus text, PDP and checkout only). **States** static. **A11y** photographs carry
real `alt`; icons are `aria-hidden` beside their labels. **Motion** `Rise` with a 60 ms stagger
capped at 6 (§13.4). **Composition** this component is the direct expression of
[01-brand-strategy.md](01-brand-strategy.md) §1.8: badges rank seventh of seven trust signals, so
the `photo` variant is the default and `compact` is the exception. No claim may be rendered here
that is not confirmed, and the component refuses to render an item whose token is unresolved —
{{CAPACITY_MONTHLY}} is still one.

Two hard rules follow from [00-client-decisions.md](00-client-decisions.md) §D1. First,
{{YEARS_EXPERIENCE}} resolves to «понад 30» and must be rendered as a statement about
*manufacturing* — «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах» — never as a
founding date, a company age, or a registration year, because the operating entities are newer than
the craft and only the craft claim is defensible. The component therefore accepts a sentence, not a
number, and there is no numeric-stat variant for this item. Second, {{CERTIFICATIONS}} is resolved
to **none**: no certificate item, no seal, no accreditation mark, no award imagery, and no icon for
any of them exists in [12-iconography.md](12-iconography.md) §12.5. A TrustRow with nothing to
certify is honest; a TrustRow with a rosette on it is a fabricated credential.

Three amendments, the first of which was made in Round 2 and reversed in Round 3:

1. **«в Карпатах» stays «в Карпатах».** The Round-2 draft substituted «у Яворові» here, on the
   argument that a trust component's job is to make claims checkable and «Яворів» resolves on a
   map in under a minute while «Карпати» is a claim thousands of sellers make.
   [00-client-decisions-3.md](00-client-decisions-3.md) F6 rejects the substitution — «Ні, напиши
   краще "в Карпатах"» — and the approved D1 sentence is restored verbatim.

   The reasoning is not that specificity stopped mattering. It is that this component renders in
   two very different positions and the sentence was optimised for the wrong one. The 30-year
   sentence is a *headline* claim: it appears above the fold, it is read by a visitor who has
   committed nothing, and in `de` and `pl` it is read by someone who has never heard of the
   village. A headline is not the place to teach a proper noun. **«Карпати» to be understood,
   «Яворів» to be believed.**

   Where Яворів belongs in this component, and it does belong:

   | `TrustItem` | Place-name |
   |---|---|
   | The 30-year manufacturing sentence | **Карпати**, verbatim from D1 |
   | An own-manufacture / full-cycle item | **Яворів** — «повний цикл — Яворів, Косівщина». The reader is already past the headline and is now reading evidence |
   | A visit or availability item | **Яворів**, in full, with the address. See amendment 3 |
   | Photograph `alt` text | **Яворів** — it is a factual caption, and it is also the string an image search matches on |

2. **The heritage constraint is a third hard rule, ranking with the two above.** The *craft* may be
   inscribed on Ukraine's intangible-heritage register; **Вівчарик is not, and this component must
   never imply otherwise.** No heritage wording where the subject is the company, no register
   reference, and — reinforcing rule two — no seal-shaped graphic. Saying «Яворів називають
   столицею ліжникарства» is a statement about the village and is permitted once the wording is
   confirmed (E13.4). «Наша спадщина» is not.
3. **No opening-hours item — and, after Round 3, a visit item that is worth having.** E3 states
   the hours are flexible and differ day to day. Any availability item renders «Графік гнучкий —
   телефонуйте перед візитом» with both numbers and a link to the Google Business Profile as the
   live source. The component refuses a fixed-hours item the same way it refuses an unresolved
   token: a published schedule that is wrong twice a week is a trust component actively producing
   distrust.

   [00-client-decisions-3.md](00-client-decisions-3.md) F2 adds the item that makes the caveat
   worth carrying. The Яворів site is a **retail shop as well as a production floor**, which
   means this component can offer something no photograph and no statistic can: a place the
   reader can go and check. «Магазин і виробництво в одному місці, с. Яворів» outranks every
   other item this component renders, because it is the only one that does not ask to be
   believed. It ships with the flexible-hours caveat and both numbers, always — an invitation
   without the caveat sends someone into the mountains to find a locked door, which converts the
   strongest trust item on the site into the worst one.

### ProductionTimeline

```ts
interface ProductionTimelineProps { stages: ProductionStage[];
  mode?: 'scroll' | 'static'; activeStage?: string; }
```

**Variants** scrollytelling (production page) and static list (PDP origin block, driven by
`Product.productionStage`). **States** per-stage inactive, active, complete. **A11y** an ordered
list first and a scroll experience second: with JavaScript off or reduced motion on, it is a
readable `<ol>` with every image and caption present. Stage headings are real headings so the page
outline carries the narrative. No content is revealed only by scrolling. **Motion** `Mask` reveal
per stage plus at most three parallax layers (§13.4), driven by one shared `useScroll`; under
reduced motion everything sits at its resting position. **Composition** the in-house stages —
washing, combing, spinning, weaving, sewing, finishing — are content, not code, and the component
renders whatever stage list it is given ([00-assumptions.md](00-assumptions.md) A4). It renders on
`OWN_MANUFACTURE` products only; §D3 point 6 gives partner products a shorter specification block
with no in-house production claims, and the type system enforces that by making `stages` unavailable
on a partner product's view model rather than trusting a conditional. This component is also what
substantiates the 30-year claim in the absence of paperwork (§D1) — showing the machines is the
evidence.

**Round 2 confirms a second pipeline and adds one binding rule.**
[00-client-decisions-2.md](00-client-decisions-2.md) E6 closes the tanning question: Вівчарик runs
the full process from raw material to finished goods, so wool, sheepskin **and leather** are all
`OWN_MANUFACTURE` and this component may render a hide pipeline as well as a wool one. They are
two separate stage lists passed to two separate instances, never one merged rail — a branching
process rendered as a single sequence is a sequence the reader cannot follow.

| Rule | Detail |
|---|---|
| **A stage that is claimed must be photographed** | E6's self-policing constraint, inherited from [01-brand-strategy.md](01-brand-strategy.md) §1.8. A stage with no `Media` renders as a numbered panel with its label — visibly thinner than its neighbours, deliberately, so an unphotographed claim is uncomfortable to ship rather than invisible. The component never omits the stage silently, because silent omission is how a stage list quietly becomes aspirational |
| **«Бельгійська технологія» is struck** | E6: the phrase belonged to the adjacent business and must not be inherited. It is added to the deny-list lint ([21-about-page-specification.md](21-about-page-specification.md) §21.12) so it cannot re-enter through a stage description |
| Stage vocabulary is shared | Stage keys match `Product.productionStage[]` exactly, so a PDP badge can deep-link to its stage on the production page |

### WholesaleForm

```ts
interface WholesaleFormProps { kind: LeadKind; products?: string[]; sourcePath: string; }
```

**Variants** by `LeadKind` — `WHOLESALE`, `PRIVATE_LABEL`, `PRESS`, `GENERAL`. Dropshipping is an
offer of the adjacent business and is **not** carried over; adding a lead type for an offer this
brand has not confirmed would generate enquiries nobody can fulfil. If `{{DROPSHIP_OFFERED}}`
later resolves true, `DROPSHIP` joins the enum with its own branch fieldset
([19-wholesale-page-specification.md](19-wholesale-page-specification.md) §19.13) — and the form
must then state, in the branch itself, that dropshipping and private label cover **own manufacture
only**. [00-client-decisions-2.md](00-client-decisions-2.md) E7 makes that operational rather than
stylistic: a partner who cannot be named cannot be disclosed to a reseller, who therefore cannot
answer their own customer's "where is this made". The restriction belongs in the form because the
form is where the enquiry is scoped, not in the reply that declines it. **States** idle,
validating, submitting, success, error, spam-suspected. **A11y** a single `<form>` with grouped
`<fieldset>`s; errors summarised at the top in a focusable `role="alert"` region that links to each
offending field, *and* repeated beside each field — a summary alone makes a keyboard user hunt.
Success replaces the form with a confirmation that moves focus to itself and states what happens
next and when. Every field carries `autocomplete`. **Motion** none — [13-motion-system.md](13-motion-system.md)
§13.11. **Composition** desktop-first layout ([02-ux-research.md](02-ux-research.md) §2.7), still
correct at 320 px. Honeypot plus timing check, never a CAPTCHA, which would cost more conversions
than it saves. The wholesale variant offers an own-manufacture-only interest toggle that
pre-populates the origin filter, because a B2B buyer asking "what do you actually make" is the most
qualified enquiry this form receives ([00-client-decisions.md](00-client-decisions.md) §D3).

### LocaleSwitcher

```ts
interface LocaleSwitcherProps { current: Locale; alternates: Record<Locale, string>;
  variant?: 'header' | 'footer'; }
```

**Variants** header `Dropdown` and footer inline list. **States** rest, open, current. **A11y**
each locale is named in **its own language** ("Українська", "Deutsch") — a flag is a country, not a
language, and Ukrainian, English, Polish, and German are not interchangeable with flags. Current
locale carries `aria-current="true"`. Each option is a real anchor to the translated URL from
`alternates`, so it is crawlable and matches the hreflang set. **Motion** inherits `Dropdown`.
**Composition** switching preserves the current page when a translation exists and falls back to
the section index when it does not — never silently to the homepage.

**This is a commerce control, not a content control.**
[00-client-decisions-2.md](00-client-decisions-2.md) E11 accepts international orders, making
`en`, `pl` and `de` **transactional** locales. A content switcher moves a reader between
translations; a transactional one moves a buyer between price presentation, available payment
methods (no COD outside Ukraine), delivery options, legal terms and — under E11's wool-only
recommendation for `de` and `pl` — **a different catalogue**.

The component itself stays a plain list of four anchors. Everything consequential happens at the
destination, and that is deliberate: a switcher that warned «switching will change your prices»
would be a modal in disguise, and the visitor who reads it has not yet done anything that needs
warning about. The disclosure belongs where it is actionable — the cart and checkout
([18-checkout-specification.md](18-checkout-specification.md)) — and the catalogue difference is
handled by locale-scoped navigation ([15-navbar-specification.md](15-navbar-specification.md)
§15.12), not by this control.

One thing this component must **not** grow: a currency selector. E10 V11 leaves settlement currency
unconfirmed, and a currency control that does not control the currency is a lie with a caret on it.

### SheepMascot

```ts
interface SheepMascotProps { state: 'idle' | 'loading' | 'sleeping' | 'celebrating' | 'lost';
  size?: 'sm' | 'md' | 'lg'; trackCursor?: boolean; }
```

**Variants** the five states in [01-brand-strategy.md](01-brand-strategy.md) §1.7. **States** as
above, plus sleeping after 60 s idle. **A11y** `aria-hidden="true"` in every case — the mascot
carries no information, and announcing "sheep illustration" to a screen-reader user in an empty
cart is noise. **Motion** `spring.sheep`, the only component permitted soft overshoot (§13.3);
cursor tracking is head rotation only, max ±12°, damped, and disabled under reduced motion and on
touch. **Composition** permitted on loader, empty states, 404, order confirmation, and the footer
mark. **Forbidden on PDP, cart, checkout, and wholesale** — the trust- and money-critical surfaces
(§1.7). This is enforced by a lint rule on the route segment, not by reviewer memory.

The mascot is no longer a risk to be weighed. [00-client-decisions.md](00-client-decisions.md) §D2
makes the sheep/shepherd identity the brand core — Вівчарик means *little shepherd* — which closes
[00-assumptions.md](00-assumptions.md) F8 and promotes this from a delight component to a brand
system component. That raises the bar on the §1.7 execution constraints rather than relaxing them:
single-weight line drawing, one colour, maker's-mark register. A cartoon sheep cannot sit beside a
14,900 UAH price point; a woodcut one can, and the difference is entirely in the execution this
component is required to hold. It shares its line register with the icon set
([12-iconography.md](12-iconography.md) §12.1), so the mark and the interface read as one hand.

---

## 14.6 `layouts/`

### SiteHeader

```ts
interface SiteHeaderProps { variant?: 'default' | 'transparent'; categories: NavCategory[]; }
```

**Variants** default (solid) and transparent-over-hero, which becomes solid on scroll past 80 px.
**States** rest, scrolled, menu-open, search-open, mobile-drawer-open. **A11y** `<header>` with
`<nav aria-label="Головне меню">`; the skip link is the first focusable element on the page at
`z-max` (§11.6) so it is reachable even when an overlay misbehaves. Every header control carries a
visible text label — cart, search, and locale included (§12.4). The mega-menu is a `Dropdown`,
opened by click. The cart badge count is in the button's accessible name, not a bare superscript
numeral. **Motion** the transparent→solid change is a background and border opacity transition at
`dur-base`; the header never animates its height, which would cause CLS. **Composition** the
utility row carries **one phone number, an availability sentence, and the Google Business Profile
link**. That placement is deliberate: [00-client-decisions.md](00-client-decisions.md) §D2 and
[00-client-decisions-2.md](00-client-decisions-2.md) E4 make GBP the highest-leverage channel of
the first two quarters on a cold-start domain, and a visitable workshop in a tourist village is
the asset that outranks a new domain's organic prospects. `categories` is built from the §D3 tree
— wool families first, since the brand is wool-led — and the partner-goods node is present in
navigation but never in the mega-menu's featured imagery.

Three Round-2 removals, all of which make this component smaller:

| Removed | Ruling | Consequence |
|---|---|---|
| **Working hours and the live open/closed indicator** | E3 — hours vary day to day; Google Maps is the live source | The utility row states «Графік гнучкий — телефонуйте перед візитом». Deleting the indicator also deletes the header's only time-dependent value, which lets it stay in a fully static render ([15-navbar-specification.md](15-navbar-specification.md) §15.19) |
| **Any account or login control** | E12 — guest checkout is permanent | No account glyph, no «Увійти», no reserved slot. The freed space is **not reassigned** — a header that gets denser because a control was removed has not benefited from the removal. Order tracking lives in the footer (`OrderLookupForm`) |
| **Social icons** | E3 — no accounts exist | None render, and `@fabryka_shkur` belongs to the adjacent business and must never be linked. If an Instagram account is created before launch, its single icon slots into `SiteFooter`, not here |

The phone number rendered is **Любов Гондурак's**, labelled with her name. She is the seller of
record (E1), so an order question reaches the person who can act on it rather than being relayed.
Both numbers render in `SiteFooter` and in the mobile panel, where the visitor has deliberately
opened a destination and can afford to choose.

**Two Round-3 corrections to this component's copy.**

The logo descriptor reads **«Вовна з Карпат»**, not «Вовна з Яворова»
([00-client-decisions-3.md](00-client-decisions-3.md) F6,
[15-navbar-specification.md](15-navbar-specification.md) §15.5). Persistent chrome is the one
surface that cannot afford a proper noun the visitor has to learn: it is on screen on every
route, in every locale, before the visitor has done anything. The mega-menu's featured caption
keeps «Яворів» because it appears only after a deliberate hover or tap, by which point
specificity reads as evidence rather than homework. «Карпати» to be understood, «Яворів» to be
believed — and this component is the clearest case in the library of the two words sitting a
single interaction apart.

The announcement slot's pickup string reads **«Магазин у Яворові»**, not «Самовивіз у Косові» —
wrong village, and after F2 the site is a shop rather than a collection point. The slot carries
**no free-shipping threshold under `de`, `pl` or `en`**: F4 makes the buyer responsible for
carriage and all customs duties, and free shipping never applies internationally, so a threshold
rendered in sitewide chrome would be a misstatement at the top of every screen
([15-navbar-specification.md](15-navbar-specification.md) §15.4).

Net effect: four utility controls at `xs` rather than the conventional five, which is why the
320 px layout clears its 48 px targets without a fight over which control gets demoted.

### SiteFooter

```ts
interface SiteFooterProps { columns: FooterColumn[]; showNewsletter?: boolean; }
```

**Variants** full and minimal (checkout). **States** static; newsletter has idle, submitting,
success, error. **A11y** `<footer>` with each column in a `<nav>` carrying its own `aria-label`;
the inverted `forest-900` surface measures ≈14.6:1 with `fleece-100` text
([09-color-palette.md](09-color-palette.md) §9.5). Address is real markup, not an image.
**Motion** none. **Composition** policy links state {{RETURN_DAYS}} without hedging — policy
clarity is trust signal 6 of 7 (§1.8).

**There is no social row.** The previous rule — "social icons render only for confirmed profiles"
— is replaced by a flat absence: [00-client-decisions-2.md](00-client-decisions-2.md) E3 confirms
the owners run **no accounts on any platform**. `SocialLinks` is not built, `FooterColumnKind` has
no `social` member, and the `LocalBusiness` JSON-LD emits no `sameAs`. Greyed-out or
"coming soon" icons are specifically forbidden: three dead glyphs at the bottom of every page is
the visual signature of an abandoned site, and it converts a neutral absence into an active
negative signal. An absence nobody notices beats a link that goes nowhere.

If `{{INSTAGRAM}}` ever resolves — E3 records creating an account as a **recommendation, not a
decision** — a single icon renders in the brand column beneath the newsletter field, conditional on
a non-empty value, with the handle in its accessible name and the same value added to `sameAs`
([16-footer-specification.md](16-footer-specification.md) §16.7). The conditional is written now
so the empty state is structurally impossible rather than a discipline someone has to maintain.

Four further Round-2 obligations on this component:

| Obligation | Detail |
|---|---|
| **NAP block** | вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644, plus **both** phone numbers labelled by name — Любов `+380 67 960 47 69`, Іван `+380 67 997 34 50` (E2, E3). Real `<address>` markup, byte-identical to the Google Business Profile (E4). It is the single source rendered into `LocalBusiness` JSON-LD; it is not re-typed there |
| **No opening hours** | «Графік гнучкий — телефонуйте перед візитом» plus a link to the Google Business Profile as the authoritative source. `openingHoursSpecification` is omitted from the JSON-LD (E3) |
| **Legal line** | © ФОП **Гондурак Любов Юріївна** · РНОКПП `{{LEGAL_ID}}` (E1). The component refuses to render the identifier segment while the token is unresolved rather than printing a placeholder |
| **Locale-gated EU legal links** | Under `de`: Impressum, the 14-day right of withdrawal, and the model withdrawal form. Under `pl`: the latter two. Gated by locale, not rendered sitewide — a Ukrainian buyer does not need a German Impressum link, and indiscriminate compliance makes the real obligations harder to find (E11) |

**Three Round-3 amendments.**

1. **The NAP block leads with a visit line.** [00-client-decisions-3.md](00-client-decisions-3.md)
   F2 confirms the Яворів site is a **retail shop as well as a production floor**, and the block
   renders «Магазин і виробництво в одному місці» as its first line, above the street address.
   The ordering is the decision: a footer address is ordinarily a compliance artefact, and a
   reader scanning one does not infer "shop" from a street and a postal code. One line above it
   converts a disclosure into a destination — and a place the reader can walk into is the
   strongest available answer to "is this a real factory or a reseller"
   ([02-ux-research.md](02-ux-research.md) §2.4). It reads from the same `contact.visitLine`
   setting the homepage's closing section renders, so the two cannot drift
   ([06-homepage-wireframe.md](06-homepage-wireframe.md) S11).
2. **The brand column's 30-year sentence reads «в Карпатах».** F6 withdraws the Round-2 «у
   Яворові» substitution. Both words appear in this one component, forty pixels apart, doing
   different jobs: the brand column is read by a visitor who may have landed on a deep page and
   needs one understandable sentence; the contacts column is read by a visitor who has decided to
   find out where this is and needs a street. «Карпати» to be understood, «Яворів» to be
   believed. Neither is redundant and neither is doing the other's work.
3. **The email slot renders `{{BRANDED_EMAIL}}` on `{{DOMAIN}}`.** The value is `info@vivcharyk.shop`. The
   Gmail address F5 supplied is **never** displayed — it is the Owner's login ([00-client-decisions-8.md](00-client-decisions-8.md) §L1). Two independent problems bind here and the second is the harder one: a numeric
   personal Gmail on a site selling 5,000–15,000 UAH craft goods reads as an individual rather
   than a manufacturer with a shop and a production floor; and transactional mail cannot be sent
   from `@gmail.com` at all, because SPF and DKIM cannot be published for `gmail.com` by a
   third-party system and Gmail's consumer DMARC policy rejects such mail. The branded address
   is read in the admin panel ([00-client-decisions-7.md](00-client-decisions-7.md) §K2). Full
   statement in [16-footer-specification.md](16-footer-specification.md) §16.5.

`{{LEGAL_ID}}`'s status also changes in Round 3: F1 confirms it **exists and is pending
delivery**. It is no longer a general blocker — it blocks WayForPay onboarding, the offer
contract and the German Impressum, and nothing else this component renders. The refuse-to-render
rule on the identifier segment is unchanged, because a resolved-but-undelivered token is exactly
the condition under which a placeholder ships.

The footer also carries the `OrderLookupForm` entry point in the Покупцю column — the replacement
for the account area removed by E12, justified in
[16-footer-specification.md](16-footer-specification.md) §16.4b.

### PageShell

```ts
interface PageShellProps { title: string; breadcrumbs?: BreadcrumbItem[];
  header?: 'default' | 'transparent'; footer?: 'full' | 'minimal';
  children: ReactNode; }
```

**Variants** by header and footer combination. **States** route-transitioning, ready. **A11y**
owns the single `<main id="main">` landmark that the skip link targets, and moves focus to it on
route change while announcing the new page title in a polite live region — without this, an SPA
navigation is silent to a screen reader. Exactly one `<h1>` per page is enforced by a dev-mode
assertion. **Motion** the two-part page transition in [13-motion-system.md](13-motion-system.md)
§13.8, with the LCP element exempt from entrance animation. **Composition** the default shell for
every storefront route except the editorial set.

### EditorialLayout

```ts
interface EditorialLayoutProps { title: string; lead?: string; hero?: MediaRef;
  publishedAt?: Date; author?: StaffRef; toc?: boolean; children: ReactNode; }
```

**Variants** article (blog), narrative (about, production), legal (no hero, no TOC). **States**
static. **A11y** body text at `container-narrow` and `measure="editorial"`; the table of contents
is a `<nav aria-label="Зміст">` of in-page anchors, and headings are never skipped. Pull quotes are
`<blockquote>`, not styled paragraphs. **Motion** `Rise` on scroll for blocks; `Mask` for images;
the `--section-y-lg` editorial rhythm from [11-spacing-system.md](11-spacing-system.md) §11.2.
**Composition** the asymmetric 12-column grid of §11.3 — body in columns 3–9, pull quotes breaking
left to 2, images breaking right to 11 or bleeding. Specified per page, not improvised.

This is the highest-priority layout on the project, which is unusual and worth stating. On a
cold-start domain, commercial head terms will not rank for roughly a year
([00-client-decisions.md](00-client-decisions.md) §D2), and long-tail informational content — care
guides, «що таке ліжник», «гуня vs накидка», wool-versus-synthetic comparisons — is the realistic
early organic entry point. `EditorialLayout` is therefore the component that carries the first two
quarters of organic acquisition, not a nice-to-have for a blog nobody has written yet. It is built
in Phase 1 alongside the PDP.

### AdminShell

```ts
interface AdminShellProps { user: StaffUser; permissions: PermissionSet;
  nav: AdminNavItem[]; breadcrumbs?: BreadcrumbItem[]; children: ReactNode; }
```

**Variants** expanded and collapsed sidebar. **States** loading, ready, permission-denied,
session-expiring. **A11y** dark surface by default ([09-color-palette.md](09-color-palette.md)
§9.7) with the same AA floor as the storefront — an internal tool used all day has a *higher*
accessibility burden, not a lower one. Body text stays at 16 px minimum
([10-typography.md](10-typography.md) §10.3). Nav items the user lacks permission for are hidden,
not disabled; a disabled item leaks the existence of a capability. Session expiry warns 5 minutes
ahead in a `role="alert"` region and never discards an in-progress form. **Motion** nothing beyond
`dur-fast` state changes (§13.11) — staff use this forty times a day, and delight on visit one is
friction on visit four hundred. **Composition** hosts the bulk-edit, clone, and per-locale
translation tooling.

**That tooling is Phase 1, and Round 2 sharpens the reason rather than removing it.**
`{{SKU_COUNT}}` is now resolved: [00-client-decisions-2.md](00-client-decisions-2.md) E5 puts the
catalogue at several hundred to roughly a thousand products, following the import. The previous
justification — "not because the catalogue is large, it is unknown" — no longer applies, because
the catalogue **is** large, and the workstream it implies is larger still:

| Round-2 fact | Effect on the admin critical path |
|---|---|
| Several hundred to ~1,000 SKUs (E5) | Bulk edit, clone and a fast list view are load-bearing, not conveniences. A per-product form loop does not survive this volume |
| **Every product description must be rewritten**, no sentence copied verbatim (E5) | The single largest content workload in the project. `fabryka-shkur.com.ua` stays live, so copied text puts two live sites in competition and the zero-authority domain loses. The editor needs a per-locale completeness view and a "needs rewrite" state, not just draft/published |
| **Product names renamed where they overlap** (E5) | Distinct names are also better brand assets — «Ліжник Яворівський» beats a shared generic name. The editor must make an overlapping name visible at authoring time, not at launch |
| Photographs reusable after processing (E5) | The media tooling needs EXIF strip, semantic rename and a **per-locale `alt` field that starts empty**, because copied `alt` text reintroduces duplicate text at the exact point the image was meant to avoid it |
| Four locales, twelve wool categories plus hides and partner goods (§D2, §D3) | Unchanged, and still the reason translation completeness is a first-class admin view |

**The product editor's origin rules change.** It requires `ProductOrigin`; enforcing that at the
form level is what stops an unlabelled resold product from ever reaching the storefront, which is
the failure mode §D3 exists to prevent. But `partnerName` is **no longer conditionally required**
— E7 answers «Ні» to naming partners, permanently, so the field is never rendered publicly and
requiring it would be collecting data the site may not use. Instead:

| Field | Admin behaviour when `origin = PARTNER_MANUFACTURE` |
|---|---|
| `partnerName` | **Optional, internal only.** Visible in admin for purchasing and support; flagged in the UI as never public. If it is simpler to drop it entirely, dropping it is acceptable |
| `partnerRegion` | **Prompted, not required.** «Косівщина», «Гуцульщина». Where set, the storefront renders «Виготовлено карпатським майстром · {region}»; where not, «Виготовлено іншим виробником» |
| Public label preview | The editor shows the exact storefront badge pair (§14.3 `Badge`) beside the origin field, so the person choosing the origin sees what the buyer will see |
| JSON-LD | `manufacturer` is **omitted** for partner goods rather than set to Вівчарик. Omission is honest; misattribution is not (E7, and now confirmed by F3) |
| `brand` | **Not an editable field at all.** It is Вівчарик for both origins — see below |

**Round 3 confirms partner goods carry the Вівчарик brand, and the editor must not be able to
contradict that.** [00-client-decisions-3.md](00-client-decisions-3.md) F3: «Так, продаються під
брендом Вівчарик.» The mapping is fixed and derived from `Product.origin` alone:

| `Product.origin` | `brand` | `manufacturer` |
|---|---|---|
| `OWN_MANUFACTURE` | Вівчарик | Вівчарик |
| `PARTNER_MANUFACTURE` | Вівчарик | **omitted entirely** — never Вівчарик, never the partner |

Neither property is exposed as a form field. A `brand` input would let an editor type a partner's
name into a public, machine-readable, AI-quotable property that E7 forbids rendering anywhere; a
`manufacturer` input would let an editor assert own manufacture on a resold item with one
keystroke and no reviewer. Deriving both from the origin selector means the only way to change
what is asserted is to change what the product **is**, which is the correct amount of friction
for a claim of this kind.

F3 also raises rather than lowers the importance of the visible label the editor previews.
Branding partner goods means the brand name now appears on items the brand did not make, so the
badge is the only thing distinguishing informed customers from customers who work it out later.
The public-label preview row above is therefore a hard requirement, not a convenience: the person
selecting the origin must see the exact storefront badge pair before saving.

**Two Owner accounts, not one.** E1 confirms Любов Гондурак as the seller of record and deputy
owner of production. The seed creates Owner accounts for both Іван and Любов rather than weakening
the Administrator role to accommodate her — weakening it globally would hand payout control and
audit-export rights to every future employee holding that role
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.5).

**No customer-management surface.** E12 removes customer accounts, so there is no customer
password reset, no impersonation tool and no account-status field. `Customer` survives as an
order-derived record for support and analytics, with `passwordHash` removed from the model — the
admin reads it, and never authenticates against it.

---

## 14.7 Storybook structure

Storybook is the contract's executable form: if a state is not in a story, it is not implemented,
because nothing else forces it to be rendered.

```
Design System/          Colour · Typography · Spacing · Icons · Motion · Surfaces
Primitives/             Box · Stack · Grid · Container · Text · VisuallyHidden · Portal
Elements/               Button · IconButton · Link · Input · …
Patterns/               Card · Accordion · Tabs · Modal · Drawer · Dropdown · …
Features/               ProductCard · ProductGallery · VariantSelector · WishlistButton ·
                        OrderLookupForm · …
Layouts/                SiteHeader · SiteFooter · PageShell · EditorialLayout · AdminShell
Recipes/                PDP purchase panel · Checkout step · Category header · Wholesale block
```

There is no `Account/` group and no `Auth/` group. Their absence is a decision (E12), recorded at
the top of this document, and a reviewer who notices the gap should find this line rather than
file a ticket.

Every component file ships these stories, named identically across the library so a reviewer knows
what to look for without opening the source:

| Story | Content |
|---|---|
| `Default` | The single most common usage |
| `AllVariants` | Every variant in one frame, for visual regression diffing |
| `AllStates` | Rest, hover, active, focus-visible, disabled, loading, error |
| `Longest` | The longest German string plus the longest Ukrainian string (§10.4) |
| `Narrow` | Rendered at 320 px |
| `Zoom200` | Rendered at 200 % text zoom |
| `ReducedMotion` | With `prefers-reduced-motion: reduce` forced |
| `Interactive` | A play function driving the full keyboard path, asserting focus |

Addons and CI wiring: `@storybook/addon-a11y` (axe on every story, violations fail CI),
`addon-viewport` pinned to the breakpoints in [11-spacing-system.md](11-spacing-system.md) §11.3,
a locale toolbar switching `uk`/`en`/`pl`/`de`, a theme toolbar for light and admin-dark, and
Chromatic visual diffs on the `AllVariants`, `Longest`, and `Narrow` stories. `Interactive` play
functions are the only automated keyboard coverage the project has, so Modal, Drawer, Dropdown,
Tabs, Carousel, and Accordion each require one asserting focus placement on open, movement under
each documented key, and focus restoration on close.

## 14.8 Per-component quality gate

The checklist from [08-design-system.md](08-design-system.md) §8.10, reproduced here because it is
the PR template and this is the document a component author reads:

- [ ] Renders correctly in `uk`, `en`, `pl`, `de` — including the longest German string
- [ ] Keyboard operable end-to-end; focus order matches visual order
- [ ] `focus-visible` ring present and visible on every surface it appears on
- [ ] Passes AA contrast on every background it is used on
- [ ] Behaves correctly at 320 px, 768 px, 1440 px, and 1920 px
- [ ] Survives 200 % browser text zoom
- [ ] Reduced-motion variant implemented and verified
- [ ] Loading, empty, error, and disabled states implemented
- [ ] No Layer-1 token referenced directly
- [ ] No layout shift on interaction, verified in DevTools with layout-shift regions on
- [ ] Storybook story covering every variant and state

Four additions specific to this library:

- [ ] Ref forwarded; `data-state` emitted on the root
- [ ] No user-facing string literal in the component source
- [ ] axe reports zero violations on every story, in both themes
- [ ] For any component rendering a dialog, menu, tablist, or carousel: an `Interactive` play
      function asserting focus on open, focus restoration on close, and every documented key

Three Round-2 additions, each guarding a rule that is easy to erode by accident:

- [ ] No component renders `partnerName`, and no prop of that name exists on any public-facing
      component (E7)
- [ ] No component renders a social link, a social icon, or an `openingHours` value (E3)
- [ ] No component links to, prompts for, or references a customer account, login, or registration
      (E12) — including "sign in to save your wishlist" copy attached to `WishlistButton`

A component that fails any line is not merged. The cost of the gate is paid once per component;
the cost of skipping it is paid on every page that uses it.
