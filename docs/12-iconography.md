# 12 — Iconography

Icons are the smallest surface in the design system and the one most likely to betray it. A stock
set is instantly recognisable to the exact audience Вівчарик needs to convince, and it has no glyph
for a lizhnyk, a hunia, a carding drum, or a skein of rovnytsia. This document defines a set that
is drawn rather than downloaded, and constrains it hard enough that drawing it stays affordable.

> **Authority note.** This document was written against Round 1 and revised in this audit pass
> against [00-client-decisions-4.md](00-client-decisions-4.md),
> [00-client-decisions-3.md](00-client-decisions-3.md) and
> [00-client-decisions-2.md](00-client-decisions-2.md), which outrank it on every point they
> touch. Four rulings changed this registry: **E3 — no social accounts exist**, which collapses
> the `social.*` namespace to a single mark (§12.5); **E8 — dye lots are not tracked**, which
> deletes `material.dye-lot` (§12.6); **E7 and F3 — partner goods carry the Вівчарик brand and
> the partner is never named**, which rewrites what `trust.partner` labels (§12.5); and **F2 —
> the Яворів address is a shop as well as a factory**, which changes what `commerce.pickup` means
> (§12.5). `{{FACTORY_CITY}}` is resolved throughout to **с. Яворів** (E2).

Governed by [08-design-system.md](08-design-system.md) §8.7; colour from
[09-color-palette.md](09-color-palette.md), sizing and hit areas from
[11-spacing-system.md](11-spacing-system.md), motion from [13-motion-system.md](13-motion-system.md).
Category, material, and origin marks follow the confirmed architecture in
[00-client-decisions.md](00-client-decisions.md) §D3, which outranks every other source here.

## 12.1 The decision — a house set, seeded but not borrowed

| Option | Cost | Outcome |
|---|---|---|
| **A. Ship a library as-is** (Lucide, Phosphor, Heroicons) | ~0 days | Free, complete, generic — and it has nothing for the ~22 icons this business actually needs, so the catalogue's most distinctive categories get the vaguest marks on the site |
| **B. Draw all ~90 icons bespoke** | 9–12 designer-days | Maximum identity at maximum cost. Nobody notices a hand-drawn chevron except when it is drawn badly |
| **C. House set** — utility glyphs redrawn on the house grid from an ISC-licensed geometric base, domain glyphs drawn from scratch | ~4 designer-days | Differentiating value is concentrated in ~22 domain icons, which get full attention; ~68 utility icons inherit proven geometry and take a mechanical weight-and-terminal pass |

**Decision: Option C.** The argument is [01-brand-strategy.md](01-brand-strategy.md) §1.1 — this
brand loses by looking like the marketplace listings it competes with and wins on specificity. A
generic "blanket" glyph where a lizhnyk belongs is exactly that vagueness; a bespoke chevron buys
nothing. Lucide is the seed base because it is ISC-licensed (no attribution obligation in a
commercial UI), drawn on a 24 px grid, and close enough to §12.2 that redrawing is an adjustment
rather than a reconstruction.

**Icon fonts are banned.** They render `.notdef` boxes during font swap, are announced as Private
Use Area codepoints, and break under a user-imposed font stack — which the 60–75 segment in
[02-ux-research.md](02-ux-research.md) §2.6 demonstrably applies. The 85 KB webfont budget in
[10-typography.md](10-typography.md) §10.7 also has no room for one.

**The shepherd mark is not an icon.** [00-client-decisions.md](00-client-decisions.md) §D2 makes
the sheep/shepherd identity the brand core — Вівчарик means *little shepherd* — but the mark lives
in the `SheepMascot` component ([14-component-library.md](14-component-library.md) §14.5) and in the
wordmark lockup, not in this registry. The relationship runs the other way: the mascot's
single-weight, one-colour, ink-on-paper register set by [01-brand-strategy.md](01-brand-strategy.md)
§1.7 is the reason the icon set is stroke-only at a single weight. If the icons were filled or
multi-weight, the mascot would read as a foreign object on its own site.

## 12.2 Construction rules

Every icon is drawn on a **24 × 24 grid with a 20 × 20 live area**, so an icon flush against a
48 px control edge still reads as optically inset. Keylines: square 20 × 20, circle 21 diameter,
portrait rect 16 × 20, landscape rect 20 × 16. The circle is 1 px larger because an inscribed
circle reads smaller than a square of equal bounding box — the optical-correction principle of
[11-spacing-system.md](11-spacing-system.md) §11.4 rule 4, applied at glyph scale.

| Property | Rule | Why this rather than the alternative |
|---|---|---|
| Style | **Stroke only.** No fills except the four toggles in §12.4 | A filled set competes with photography for weight, violating design principle 1 in [08-design-system.md](08-design-system.md) §8.2 |
| Stroke | **1.5 px at the 24 grid** | 2 px (Lucide's default) is heavy beside `e-Ukraine` at 400; 1 px vanishes against `--bg-alt`. 1.5 px matches the body font's stem weight at 17 px, which is what makes icon and label read as one system |
| Terminals | **Butt caps, flat** | Round caps are the largest single contributor to the soft, pillowy failure mode that [01-brand-strategy.md](01-brand-strategy.md) §1.6 reference 3 ("machine and mountain") exists to prevent |
| Joins | Mitre above 120°, round below | An acute mitre produces a spike that reads as a rendering artefact at 16 px |
| Corner radius | **2 px** outer, **1 px** inner | Half of `radius-sm`, because a glyph is half the scale of a badge. 0 px reads brutalist; 4 px reads app-UI |
| Angles | 0°, 45°, 90°, plus one 30° exception per glyph for a natural form | Holds the set to "machine and mountain" geometry while letting a fleece curl look like fleece |
| Counters | ≥2 px between strokes | Below 2 px the gap fills in at 16 px on a 1× display |

**Optical sizing — three masters, not one scaled file.** A 24 px master scaled to 16 px yields a
1.0 px stroke that anti-aliases to grey and falls below the contrast floor in
[09-color-palette.md](09-color-palette.md) §9.5.

| Master | Grid | Live area | Stroke | Detail budget |
|---|---|---|---|---|
| `sm` | 16 | 14 | 1.25 px | Silhouette only. Interior detail deleted, not shrunk |
| `md` | 24 | 20 | 1.5 px | **Reference master.** Every icon is authored here first |
| `lg` | 32 | 28 | 1.75 px | Interior detail permitted; used by the material and ornament sets |

Stroke grows sub-linearly (×1.17 per step) because perceived weight tracks stroke-to-area ratio,
not stroke width; a linear scale makes `lg` look bold. Only the 22 domain icons in §12.6–12.7
carry all three masters; utility icons have `md` only and may render at `sm` with the 1.5 px
stroke, because their silhouettes survive it. The build fails if an icon flagged `optical: true`
is missing a master.

## 12.3 Size scale

| Token | px | Default use | Hit area |
|---|---|---|---|
| `icon-sm` | 16 | Inline with `body-sm`/`caption`, table cells, tag affixes, breadcrumb separators | not interactive |
| `icon-md` | 20 | Inline with `body`, field affixes, dropdown items, admin row actions | 44 × 44 |
| `icon-lg` | 24 | **Default.** Buttons, navigation, cards, status rows, everything unspecified | 48 × 48 |
| `icon-xl` | 32 | Trust row, material badges, empty states, category tiles | 48 × 48 |

24 px is the default because it pairs optically with `body` at 17 px and leaves 12 px of optical
padding inside the 48 px `md` button from [08-design-system.md](08-design-system.md) §8.5. Sizes
outside this scale do not exist; a 28 px icon is a review rejection and the fix is the adjacent
token, not a new step. Sizes are authored in `rem`, so 200 % text zoom scales icons with their
labels ([10-typography.md](10-typography.md) §10.8).

Icons **inherit `currentColor` and never carry a colour of their own** — the Layer-2-only rule of
[08-design-system.md](08-design-system.md) §8.1 applied to SVG. An icon takes the colour of the
text it accompanies, so it passes the contrast check that text already passed.

## 12.4 The label rule

> **On the storefront, an icon never appears without a text label on primary navigation or any
> commerce control.**

[02-ux-research.md](02-ux-research.md) §2.6 records that icon-only controls are *not discovered* by
the 60–75 segment, and header, cart, search, and filter are the four places where non-discovery
costs a transaction. The label is visible text, never a tooltip — hover-only affordances are banned
by the same research.

| Exception | Condition | Required compensation |
|---|---|---|
| `nav.close` | Universally understood; a labelled close in a modal corner is worse | Localised `aria-label`, 48 px hit area |
| Chevrons, arrows | Directional affordance on an already-named control | `aria-hidden="true"`; the parent carries the name |
| Gallery thumbnails | The thumbnail is the label | `aria-label` naming position, e.g. «Фото 3 з 9» |
| Rating stars | Numeric rating rendered adjacent as text | One `role="img"` for the group with a text alternative |
| Quantity `+` / `−` | The adjacent numeric field is the label | `aria-label`, plus `aria-live` on the value |
| Admin panel | Staff use it 40 times a day; labels become noise | Sidebar labels always visible; icon-only allowed in dense row-action clusters, each with `aria-label` and a tooltip |

An earlier revision carried a seventh exception for a footer social row. It is **deleted**:
[00-client-decisions-2.md](00-client-decisions-2.md) E3 records that no social accounts exist, so
the row does not render and the exception has nothing to except (§12.5, and
[16-footer-specification.md](16-footer-specification.md) §16.7).

Four icons take a **filled** variant, only as the "on" state of a binary toggle where the
outline/fill pair is itself the state: `commerce.wishlist`, `commerce.compare`,
`trust.rating-star`, `admin.pin`. Fill is never the sole indication — `aria-pressed` carries it for
assistive technology and a colour change accompanies it for anyone who cannot resolve a fill at
20 px.

## 12.5 Inventory — utility domains

Keys are namespaced `domain.name`. The namespace is load-bearing: it is what lets the registry in
§12.10 prove a `Category.iconKey` comes from `category.*` and not from `admin.*`.

### Navigation — `nav.*`

| Key | Glyph | Meaning | Used in |
|---|---|---|---|
| `nav.menu` | Three 20 px rules, 6 px apart | Open mobile navigation | SiteHeader below `md` |
| `nav.close` | 16 px X at 45° | Dismiss any overlay | Modal, Drawer, SearchOverlay, FilterPanel, Toast |
| `nav.chevron-down` / `-right` / `-left` | 10 px chevron, rotated | Expand; drill in; back one level | Accordion, Select, Dropdown, Breadcrumb, mobile nav |
| `nav.arrow-right` / `-left` / `-up` | Shaft and head, 20 px | Continue; return; back to top | Section links, pagination, checkout steps, PDP |
| `nav.search` | 13 px circle, 7 px handle at 45° | Open search | SiteHeader, SearchOverlay, admin |
| `nav.external` | Box with escaping arrow | Leaves the site or opens a tab | Nova Poshta tracking, the Google Business Profile link, press |
| `nav.globe` | Circle, two meridians, equator | Locale switching | LocaleSwitcher |
| `nav.grid` / `nav.list` | 2 × 2 squares / three ruled rows | Listing density | Listing toolbar, admin |
| `nav.filter` | Three graduated rules with node markers | Open filters | FilterPanel trigger |

### Commerce — `commerce.*`

| Key | Glyph | Meaning | Used in |
|---|---|---|---|
| `commerce.cart` | Flat-bottomed basket, two struts | The cart | SiteHeader, CartDrawer |
| `commerce.cart-add` | Cart with `+` in the upper counter | Add to cart | ProductCard quick-add |
| `commerce.wishlist` | Heart, outline/filled pair | Saved item | ProductCard, PDP |
| `commerce.compare` | Two bars of unequal height | Add to comparison | ProductCard, listing toolbar |
| `commerce.plus` / `commerce.minus` | 14 px cross / rule | Quantity change | Stepper |
| `commerce.trash` | Lidded bin, two interior rules | Remove line item | CartDrawer, admin |
| `commerce.tag` | Angled rectangle with a counter hole | Price, promotion, discount | Promotion badge, sale pricing |
| `commerce.truck` | Cab and box, flat wheels | Courier delivery | TrustRow, checkout, PDP |
| `commerce.parcel-locker` | Six cells, one ajar | Nova Poshta branch or locker | Checkout delivery choice |
| `commerce.pickup` | Roof over an open door | **«Магазин у Яворові»** — the shop, not a collection point | Checkout, contact, announcement bar |
| `commerce.package` | Cube with a taped seam | Order, shipment | Order status, admin orders |
| `commerce.return` | Box with a counter-clockwise arrow | {{RETURN_DAYS}}-day returns | TrustRow, PDP, policy pages |
| `commerce.card` | Landscape rect with a magnetic rule | Online card payment | Checkout |
| `commerce.cash` | Banknote with a centred circle | Cash on delivery | Checkout |
| `commerce.bank` | Pediment on four columns | Bank transfer / IBAN | Checkout, wholesale invoicing |

### Trust and provenance — `trust.*`

| Key | Glyph | Meaning | Used in |
|---|---|---|---|
| `trust.own-manufacture` | `trust.factory` roofline enclosed by a single unbroken rule | «Власне виробництво» — `ProductOrigin.OWN_MANUFACTURE` | ProductCard, PDP, filter facet, wholesale |
| `trust.partner` | Two roofs, the second offset and lighter-weighted | «Відібрано Вівчариком» — `ProductOrigin.PARTNER_MANUFACTURE`. The partner is **never** named ([00-client-decisions-2.md](00-client-decisions-2.md) E7); the adjacent text carries «Виготовлено карпатським майстром» where `partnerRegion` is known and «Виготовлено іншим виробником» where it is not | ProductCard, PDP, filter facet |
| `trust.factory` | Two pitched roofs and a chimney | The manufacturing operation itself | TrustRow, homepage, about, wholesale |
| `trust.mountain` | Two overlapping peaks, one snow-lined | Carpathian origin, Kosiv district | Hero overline, about, editorial |
| `trust.hands` | Two open palms, fingers undetailed | Human labour | Product attribute, TrustRow |
| `trust.shield` | Heater shield with a tick | Warranty, secure payment | Checkout, footer |
| `trust.map-pin` | Teardrop with a counter hole | A visitable address — **shop and production floor together**, вул. Петруші, с. Яворів ([00-client-decisions-3.md](00-client-decisions-3.md) F2) | Contact, footer, LocalBusiness block, GBP surfaces |
| `trust.clock` | Circle, hands at 10:10 | **Made-to-order lead time only** — 14 days ([00-client-decisions-4.md](00-client-decisions-4.md) G2). It never marks opening hours: hours are variable and are not published on the site or in structured data (E3) | PDP buy box, cart, order status |
| `trust.phone` | Handset at 45° | Call. The header renders **one** number — Іван, `+380679973450` ([00-client-decisions-4.md](00-client-decisions-4.md) G1); the footer and contact page render both, Іван first | Header utility bar, footer, contact |
| `trust.rating-star` | Five-point star, outline/filled pair | Review rating | Rating, ReviewList, ProductCard |

**There is deliberately no certificate, award, seal, or accreditation glyph in this system.**
[00-client-decisions.md](00-client-decisions.md) §D1 confirms that no certificates or anniversary
documents exist and forbids any implication of one; a rosette or seal icon implies exactly that
even with honest adjacent text, because a seal is read as a symbol before it is read as a label.
{{CERTIFICATIONS}} is resolved to *none*, so the icon does not get drawn "just in case" — an unused
glyph is a glyph someone eventually uses. The «понад 30 років» claim attaches to the manufacturing
and is carried by `trust.factory` beside editorial prose and factory photography, which is trust
rank 1–3 in [01-brand-strategy.md](01-brand-strategy.md) §1.8 rather than rank 7.

`trust.own-manufacture` and `trust.partner` are the icon-level expression of
[00-client-decisions.md](00-client-decisions.md) §D3. They are drawn as a *pair with equal weight*
and not as a good mark and a warning mark: partner goods are curated, not confessed, and an icon
that looks like a caveat turns a curation story into a discovered deception. Both always carry
visible text — «Власне виробництво» or «Відібрано Вівчариком» — never the mark alone.
**Neither label names a partner.** [00-client-decisions-2.md](00-client-decisions-2.md) E7 keeps
`partnerName` unrendered, so the curation story is carried by the selection, not by a
credential. [00-client-decisions-3.md](00-client-decisions-3.md) F3 raises the stakes on this
rather than lowering them: partner goods are sold **under the Вівчарик brand**, so the mark is
the only thing on the card that distinguishes what the brand made from what the brand chose. It
stays at equal visual weight to «Власне виробництво» for exactly that reason.

### Status — `status.*`

| Key | Glyph | Meaning | Semantic colour |
|---|---|---|---|
| `status.check` / `status.check-circle` | 45° tick, plain or inscribed | Success; order placed; step complete | `success` |
| `status.alert-triangle` | Triangle, bar and dot | Low stock, long lead time | `warning` |
| `status.alert-circle` | Circle, bar and dot | Form error, failed payment | `danger` |
| `status.info` | Circle, dot above a bar | Neutral system note | `info` |
| `status.x-circle` | X inscribed in a circle | Out of stock, cancelled, rejected | `danger` |
| `status.dot` | 8 px disc — the one solid glyph in the set | Stock and order-state indicator | contextual |
| `status.spinner` | 270° arc, butt terminals | Indeterminate loading | `currentColor` |
| `status.clock-pending` | Clock, hands at 2 o'clock | Awaiting payment, review pending | `warning` |
| `status.truck-moving` | `commerce.truck` plus two speed rules | Shipped | `info` |
| `status.unique` | Single ornament rhombus (§12.7) | `Product.isUniquePiece` | `--accent-text` |

`status.dot` is solid because an 8 px outlined circle is indistinguishable from a filled one at 1×.
It always carries adjacent text («В наявності», «Немає») — colour-only status coding fails WCAG 1.4.1.

### Social — `social.*`, reduced to one mark

**The namespace contains exactly one icon: `social.google-business`.**

[00-client-decisions-2.md](00-client-decisions-2.md) E3 resolves `{{SOCIAL_PROFILES}}` to
**none** — the owners run no accounts on any platform. `social.instagram`, `social.viber`,
`social.telegram`, `social.facebook`, `social.youtube` and `social.pinterest` are therefore
**not drawn**. This is a deletion rather than a deferral, for the reason §12.8's dead-icon rule
exists: a drawn platform mark sitting in the registry is a mark someone eventually wires to a
handle, and the only handles available belong to the adjacent business audited in
[00-existing-site-audit.md](00-existing-site-audit.md). `@fabryka_shkur` is not this brand
([00-client-decisions.md](00-client-decisions.md) §D2), and a footer icon that sends Вівчарик's
visitors to a different seller's shopfront is the single most expensive error available in this
system ([16-footer-specification.md](16-footer-specification.md) §16.7).

`social.google-business` survives, and it is the only one that should. A Google Business Profile
**exists** (E4) and §D2 names it the highest-leverage channel of the first two quarters on a
cold-start domain; F2 strengthens it further, because the profile can now legitimately carry
retail attributes for a site that is a shop as well as a factory. The mark appears in the header
utility row, on the contact page and in the S11 closing band
([06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2), labelled as the authoritative source
for the opening hours the site does not publish (E3) — not only in the footer.

| Question | Answer |
|---|---|
| Is `social.google-business` a social mark? | Functionally no — it is a link to a listing, not to a feed. It keeps the `social.*` namespace only because it is reproduced to Google's brand guidelines rather than drawn on the house grid, which is the property the namespace actually governs |
| What happens if an Instagram account is created? | E3 records this as a **recommendation, not a decision**. If it is taken, one mark is drawn at that point and slots into `SiteFooter` only ([14-component-library.md](14-component-library.md) §14, `SiteFooter`). It is not drawn in advance and it is not listed in `pendingIconKeys` — an unresolved recommendation is not the same as a confirmed future requirement |
| Is a row of greyed-out platform marks acceptable? | No. An absence is invisible; a row of glyphs pointing nowhere is the clearest possible signal of an abandoned site |

Platform marks are the **only** icons reproduced to a third party's guidelines rather than the
house grid: redrawing a platform mark to a house stroke weight is a trademark violation and also
makes it less recognisable. They are normalised to a 24 px bounding box and nothing else.

### Admin — `admin.*`

Navigation marks, one per AdminShell sidebar destination: `admin.dashboard`, `admin.orders`,
`admin.products`, `admin.categories`, `admin.media`, `admin.customers`, `admin.reviews`,
`admin.leads`, `admin.promotions`, `admin.content`, `admin.staff`, `admin.settings`, `admin.audit`.

Action marks for toolbars and row-action clusters: `admin.import` (CSV), `admin.export`,
`admin.duplicate` (clone a product), `admin.bulk-edit`, `admin.translate` (per-locale
completeness), `admin.drag` (six-dot reorder handle), `admin.preview` (view on storefront),
`admin.lock` (permission denied), `admin.pin` (outline/filled pair).

`admin.translate`, `admin.duplicate`, and `admin.bulk-edit` are Phase 1 rather than later, and
[00-client-decisions-2.md](00-client-decisions-2.md) E5 makes the case stronger than the earlier
draft did. `{{SKU_COUNT}}` is no longer unknown: E5 permits the adjacent business's products and
photographs to be reused, so the catalogue resolves to **several hundred to roughly a thousand
SKUs**, rebuilt onto the §D3 tree. That is a reuse source, not a migration — **every product
description must be rewritten**, because `fabryka-shkur.com.ua` stays online and copied text puts
two live sites in competition that the zero-authority domain loses. Twelve confirmed wool
categories plus sheepskin, leather and partner goods must therefore be authored across `uk`,
`en`, `pl` and `de`. Per-locale completeness and duplication tooling is what makes that
tractable, and `admin.translate` is consequently the most-used action glyph in the panel.

## 12.6 Material, care, and category icons — the set no library has

These justify the §12.1 decision. Keys map onto `AttributeDefinition.key` in
[25-database-schema.md](25-database-schema.md) §25.3, so a filter facet and a PDP spec row render
the same mark without a translation table.

| Key | Construction | Meaning | Rendered where |
|---|---|---|---|
| `material.wool` | Three nested irregular arcs — a fleece curl; the glyph that spends the 30° exception | Wool content. The lead material of the whole brand | Facet, spec table, card attribute strip |
| `material.sheepskin` | Hide silhouette, four legs, fleece-textured upper edge | Вироби з овчини | Sheepskin category, facets |
| `material.hide` | Same silhouette, smooth upper edge | Шкіряні вироби | Leather category, facets |
| `material.yarn` | Wound skein, figure-of-eight | Вовняна пряжа, `PricingUnit.SKEIN` | Facets, PDP buy box |
| `material.roving` | Untwisted sliver, two parallel soft strokes leaving a drum | Ровниця and вовна для рукоділля — distinct from spun yarn | Facets, PDP |
| `material.by-weight` | Pan balance, single beam | Sold by weight, `PricingUnit.KILOGRAM` | Yarn/rovnytsia/raw-wool PDP, cart line |
| `material.loom` | Warp verticals, one weft rule, a beater bar | Loom-woven, not machine-knitted | Ліжники, накидки, гуні PDPs |
| `material.handmade` | `trust.hands` above a single thread arc | `Product.isHandmade`; drives the gold tier badge | PDP, ProductCard, facets |
| `material.natural-dye` | Leaf over three droplets | Plant-dyed, undyed, naturally pigmented | Colour facet, spec table |
| `material.density` | Stacked rules at decreasing intervals | `woolMicron`, weave density, g/m², yarn thickness | Spec table, comparison |
| `material.wood` | Concentric arcs with a radial split — end grain | Wooden products | **Drawn but not rendered at launch** — ДЕРЕВО is architecture-only per §D3 |

`material.roving` and `material.by-weight` exist because
[00-client-decisions.md](00-client-decisions.md) §D4 confirms пряжа, ровниця, and вовна для
рукоділля as launch stock sold by weight, and identifies the needleworker's buying pattern —
колір + метраж + товщина. A generic "yarn" glyph across all three would erase the distinction
between spun yarn and unspun roving, which is the first thing that audience checks and the
fastest way to generate a return.

**`material.dye-lot` is deleted from the set.** An earlier revision drew it for a "same lot
guaranteed" badge and parked it as `pending`. [00-client-decisions-2.md](00-client-decisions-2.md)
E8 closes the question the other way: **dye lots are not tracked.** `ProductVariant.dyeLot`
remains in the schema, nullable and unused, with no admin field, no facet and no PDP display —
so there is nothing for the icon to mark. Drawing it anyway would be worse than useless: a badge
implying a lot guarantee the business cannot honour generates exactly the returns the glyph was
meant to prevent. The yarn PDP carries E8's honest sentence instead — «Відтінок може незначно
відрізнятися між партіями» — which is prose, not a pictogram. If lot tracking is ever introduced,
the icon is drawn then.

`material.wood` is the only icon still drawn and unreferenced. It is declared `pending: true` in
the icon manifest, which exempts it from the dead-icon build failure in §12.8 and instead prints
it in the build summary. An exemption that is enumerated and printed on every build is a
reminder; a blanket "unreferenced icons are fine" rule is how a set accumulates fifty dead
glyphs.

**Care — `care.*`.** Care symbols are a regulated pictogram system (ISO 3758 / GINETEX), not a
design surface. They are reproduced to the standard and normalised to the 24 px box but **not**
redrawn on the house grid — the platform-mark reasoning plus a legal one: an altered care symbol on
a textile sold into the `de` and `pl` locales is a labelling defect. The set is
`care.machine-wash-30`, `care.hand-wash`, `care.no-wash` (hides and fur), `care.no-bleach`,
`care.no-tumble`, `care.dry-flat`, `care.iron-low`, `care.dry-clean-p`. Every care icon on a PDP
carries expanded text in the active locale; the pictogram alone is not comprehensible to most
buyers in any of the four locales. Care content is **authored, not copied** —
[00-client-decisions-2.md](00-client-decisions-2.md) E5 permits product photographs to be reused
from the adjacent business but forbids copying its blog and care-guide articles outright — and it is
also the long-tail informational content that §D2 identifies as the realistic early organic entry
point on a cold-start domain. The care icons are therefore a content-surface investment, not
decoration on a spec table.

**Category — `category.*`.** One mark per category node in the confirmed §D3 tree, each composed
from the material set plus one silhouette element, which keeps the set coherent instead of sixteen
unrelated drawings.

| Branch | Keys |
|---|---|
| Вовна (own manufacture, brand-leading) | `category.lizhnyk`, `category.blankets`, `category.hunia`, `category.vest`, `category.pillows`, `category.socks`, `category.slippers`, `category.belt`, `category.cape`, `category.yarn`, `category.roving`, `category.craft-wool` |
| Own manufacture, other materials | `category.sheepskin`, `category.leather` |
| Партнерські вироби | `category.partner` |
| ДЕРЕВО | `category.woodenware` — `pending: true`, not navigable at launch |

`category.lizhnyk`, `category.hunia`, and `category.cape` are authored at `lg` first, because each
carries a woven or draped interior that must be designed at 32 px and then simplified downward —
simplifying a complex mark is reliable, elaborating a simple one is not. `category.yarn`,
`category.roving`, and `category.craft-wool` must be visually separable at 24 px, because §D3 notes
that вовна для рукоділля is a distinct category from ровниця and пряжа and the needleworker
audience navigates between exactly those three.

`category.partner` reuses the `trust.partner` construction rather than inventing a second mark, so
the category tile, the product badge, and the filter facet are visibly the same concept. It is the
only category mark that is not a material or a product silhouette, because the category is defined
by origin rather than by what is in it — which is precisely the point of §D3.

## 12.7 The ornament-derived subset

[01-brand-strategy.md](01-brand-strategy.md) §1.6 permits Hutsul ornament as "the shape language of
custom icons" and forbids it as decoration. In iconography that resolves into three permissions and
one test.

1. **Four motifs as functional marks** — `orn.rhombus`, `orn.cross`, `orn.star8`, `orn.comb`,
   derived from {{ORNAMENT_SOURCE}}. They serve as the one-of-one indicator (`status.unique`), the
   section-divider terminal, the wool-thread loader's resolution mark
   ([13-motion-system.md](13-motion-system.md) §13.9), and the editorial pull-quote mark.
2. **Interior geometry of the two woven-category marks**, because that is what the product looks
   like. Depiction, not decoration.
3. **Stroke and angle discipline** — the 45° constraint in §12.2 is itself ornament-derived. Hutsul
   weaving geometry is a 45° rhombic lattice, so the whole set inherits the ornament's structure
   without ever displaying the ornament.

**Forbidden:** ornament framing an icon, ornament in a second accent colour, ornament as a button
affix, ornament repeated as a background behind an icon grid, ornament above `icon-xl`.

**The test, restated for icons:** delete the ornament element. If the icon stops meaning anything —
`status.unique` becomes a blank square — it was structural and stays. If it merely becomes plainer,
it was decoration and is removed. Motifs must be reviewed by the client for regional correctness:
Kosiv district has a specific vocabulary, and a Pokuttia or Bukovyna motif in a Kosiv brand is an
error this audience detects immediately.

## 12.8 Delivery — inline components with a page-local sprite escape hatch

**Decision: SVGR-generated React components, tree-shaken per route. No external sprite, no runtime
fetch, no icon font.**

| Approach | Verdict |
|---|---|
| External sprite + `<use href="/icons.svg#key">` | **Rejected.** The sprite is a request the preload scanner cannot discover, so first icon paint lands after FCP — visible icon pop in the header. `<use>` also carries focus-order and `aria` quirks in Safari, and the shadow boundary blocks per-instance styling |
| Sprite inlined into the HTML document | **Rejected.** Every route pays for every icon, uncached, on every navigation — a fixed ~14 KB tax on a document that should be under 20 KB |
| Runtime `import()` per icon | **Rejected.** Up to ~90 requests and a waterfall on the header |
| **Inline components, SVGO-optimised, tree-shaken** | **Accepted.** A route ships only what it renders, 240–520 bytes gzip each, inside a chunk that already loads. Full `currentColor` inheritance, no shadow boundary, no extra request, no pop |

**The counter-case is repetition.** A 60-card grid rendering `commerce.wishlist`,
`commerce.cart-add`, and `trust.rating-star` produces ~300 duplicated paths, where the cost is DOM
nodes rather than bytes. For any icon rendered **more than 8 times on one route**, `<Icon>` switches
to a **page-local sprite** — one hidden `<symbol>` block emitted into the route root, instances
becoming `<use href="#…">`. The switch is decided at build time by static analysis, so there is no
runtime measurement cost, and same-document `<use>` has none of the cross-document defects above.

| Budget, CI-enforced alongside [13-motion-system.md](13-motion-system.md) §13.5 | Value |
|---|---|
| Total icon payload, whole site | ≤11 KB gzip |
| Icon payload on the critical path (header + hero) | ≤2.5 KB gzip |
| Distinct icons on the critical path | ≤9 |
| SVGO output per icon / `path` elements per icon | ≤520 bytes gzip / ≤6 |
| Unreferenced icons in the registry | 0 outside `pendingIconKeys` — a dead icon fails the build |

SVGO config is fixed: `removeViewBox: false` (removing it breaks responsive sizing),
`convertPathData` at 2-decimal precision, `removeDimensions: true`, and all `fill`/`stroke`
attributes stripped so `currentColor` cannot be overridden by a stray authored value.

## 12.9 Accessibility contract

Every icon is in exactly one of two cases, chosen by the author. There is no default that "probably
works".

**Case 1 — decorative** (the overwhelming majority): the icon accompanies visible text and carries
nothing the text does not.

```tsx
<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24">
```

`focusable="false"` is not redundant with `aria-hidden`: legacy engines and some assistive tooling
still place SVG elements in the tab order without it, producing a phantom tab stop between the
label and the next control.

**Case 2 — meaningful**, only where §12.4 permits an unlabelled icon:

```tsx
<svg role="img" aria-labelledby={titleId} focusable="false" viewBox="0 0 24 24">
  <title id={titleId}>{t('icon.close')}</title>
</svg>
```

- `role="img"` is required; without it, an SVG with a `<title>` is announced inconsistently across
  NVDA, JAWS, and VoiceOver.
- `<title>` must be the **first child** of the `<svg>`; placed later, several screen readers do not
  associate it.
- The string is localised through the normal i18n pipeline in all four locales. An English `<title>`
  on a Ukrainian page is a WCAG 3.1.2 failure.
- Where the icon sits inside a button, prefer a visually-hidden `<span>` on the button over
  `aria-label` on the SVG: better supported, and it survives translation tooling that skips attributes.

**Hit area.** Per [11-spacing-system.md](11-spacing-system.md) §11.7, visual size and hit area are
decoupled: a 24 px icon button presents a **48 × 48 px** target (44 × 44 px absolute floor for
secondary actions) via padding or a pseudo-element, with no visual indication of the extra area.
Adjacent icon targets — steppers, gallery thumbnails, the two phone CTAs in the closing band —
keep ≥8 px separation.

**Colour is never the sole carrier of meaning.** `status.dot` in `success` and in `danger` is the
same shape; the adjacent text distinguishes them. Stroke-only construction with `currentColor`
survives Windows High Contrast automatically; `status.dot`, the one solid glyph, declares
`forced-color-adjust: auto` and is explicitly tested.

**No icon animates on entrance.** The only animated icons are `status.spinner` (continuous rotation,
`linear`, replaced by a static mark plus text under `prefers-reduced-motion`), `nav.chevron-down` on
accordion open (180°, `dur-base`), and the wishlist fill pulse — all specified in
[13-motion-system.md](13-motion-system.md) §13.10.

## 12.10 The icon registry

`Category.iconKey` in [25-database-schema.md](25-database-schema.md) §25.3 is a `String?` annotated
"references the icon registry, not a file path". This is that registry.

```ts
// src/design/icons/registry.ts — generated, never hand-edited
export const iconRegistry = {
  'nav.menu':              nav.Menu,
  'commerce.cart':         commerce.Cart,
  'trust.own-manufacture': trust.OwnManufacture,
  'material.roving':       material.Roving,
  'category.lizhnyk':      category.Lizhnyk,
  // …
} as const;

/** Drawn, registered, and intentionally unreferenced — exempt from the dead-icon check (§12.8).
 *  `material.dye-lot` was removed from this list and from the set entirely: dye lots are not
 *  tracked (00-client-decisions-2.md E8), so there is no future reference to wait for. */
export const pendingIconKeys = ['material.wood', 'category.woodenware'] as const;

export type IconKey         = keyof typeof iconRegistry;
export type CategoryIconKey = Extract<IconKey, `category.${string}`>;

export const categoryIconKeys = Object.keys(iconRegistry)
  .filter((k): k is CategoryIconKey => k.startsWith('category.'));
```

It is generated by the same build step that runs SVGR over `src/design/icons/svg/**`. Hand-editing
it is a review rejection, for the reason hand-editing `tokens.css` is
([08-design-system.md](08-design-system.md) §8.9): two sources of truth diverge.

A database column holding a component key is a dangling-reference risk. Four defences, in the order
they fire:

1. **The admin input is a picker, not a text field** — a searchable grid of `categoryIconKeys` with
   live previews. An invalid key cannot be typed.
2. **API-layer validation** — the category endpoint validates against a Zod enum built from the
   registry at module load and rejects unknown keys with 422. Postgres cannot express a constraint
   against a TypeScript object, so it lives at the API boundary, the same placement decision as the
   required-`alt` rule in [25-database-schema.md](25-database-schema.md) §25.4.
3. **A CI check** — `SELECT DISTINCT "iconKey" FROM "Category"` against the seeded database,
   asserting every value resolves. Renaming or deleting an icon therefore requires a data migration,
   and forgetting it fails the build rather than production.
4. **A render-time fallback** — an unresolvable key renders nothing, logs once, never throws. A
   missing category icon degrades to a text-only category tile.

`categoryIconKeys` excludes anything in `pendingIconKeys`, so the admin picker cannot assign
`category.woodenware` to a live category before ДЕРЕВО launches. Enabling the wooden category is
then a one-line manifest change plus a content decision, which is what
[00-client-decisions.md](00-client-decisions.md) §D3 means by "architecture prepared, not launched".

```tsx
interface IconProps {
  name: IconKey;
  size?: 'sm' | 'md' | 'lg' | 'xl';   // 16 | 20 | 24 | 32 — default 'lg'
  title?: string;                      // presence switches to the meaningful contract (§12.9)
  className?: string;                  // layout only; colour comes from currentColor
}
```

There is no `color` prop. Adding one would let a caller set a colour outside the semantic layer —
the exact Layer-1 violation [08-design-system.md](08-design-system.md) §8.1 exists to prevent. An
icon needing a different colour sits inside an element that already has it.

## 12.11 Pipeline and per-icon quality gate

```
figma/icons.fig → src/design/icons/svg/<domain>/<name>.svg   (committed, strokes NOT outlined)
    → svgo.config.mjs (fixed, §12.8) → @svgr/cli --typescript --ref
    → src/design/icons/generated/**  (gitignored) → registry.ts + IconKey union
    → Storybook: Design System / Icons — full grid, four sizes, light and dark
```

Strokes are not outlined on export: outlining doubles path data, breaks `currentColor` stroke
inheritance, and makes the three optical masters impossible to maintain from one source.

- [ ] Drawn on the 24 grid inside the 20 live area — 1.5 px stroke, butt terminals, 2 px outer radius
- [ ] Legible at 16 px on a 1× display, verified from a rendered screenshot, not in the editor
- [ ] `sm`/`lg` masters drawn if `optical: true`, with each master's detail budget respected
- [ ] ≤6 paths, no `fill`/`stroke` attribute committed, ≤520 bytes gzip after SVGO
- [ ] Passes AA at its semantic colour on every surface in [08-design-system.md](08-design-system.md) §8.3
- [ ] Localised `<title>` authored in `uk`, `en`, `pl`, `de` if it is ever rendered unlabelled
- [ ] Added to the Storybook grid and visually diffed
- [ ] Referenced by at least one component, or explicitly listed in `pendingIconKeys` with the
      open question it is waiting on
