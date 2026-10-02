# 15 — Navbar Specification

> **Round 13:** «Відгуки» joins the header navigation between «Про нас» and «Контакти», and the phone menu — [00-client-decisions-13.md](00-client-decisions-13.md) N2.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Sticky, compact (≤64 px), **white, logo centred**; left: Каталог (hover mega menu with category photos, best sellers, promo banner; ~150 ms hover intent; click/keyboard/tap also open), Опт, Про нас, Контакти; right: search icon (products with photo and price in suggestions), phone icon, flag + code language switch, wishlist with counter, cart with item count (part 1).
> - Phone: ☰ on the left; **bottom bar Каталог · Кошик · Обране · Зв'язок**; on the PDP the sticky buy bar replaces it. Floating messenger button desktop only (bottom-right); back-to-top bottom-left. Breadcrumbs on. Closable announcement strip. No «A+», no mascot in the header.

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - Menu = the seven categories of §P3.1; Добірки and Опт beside them. Headings in `e-Ukraine Head` (round 9 typography change). The logo lockup is the ram mark beside the wordmark.


The header is the only component rendered on every route, in every locale, at every breakpoint,
for every audience. It is therefore the most expensive component in the build to get wrong and
the most expensive to change after launch. Every decision below is written to be implemented
literally.

**Authority note.** Written against [00-client-decisions.md](00-client-decisions.md) and revised
against [00-client-decisions-2.md](00-client-decisions-2.md), which is now the highest-authority
document in the blueprint. The three-material-world split proposed in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.3 is **superseded**: that audit
describes an adjacent business belonging to the client's wife, not this one. The navigation tree
here is the confirmed D3 tree and nothing else.

Round 2 removes three things from this header and changes one:

| Round-2 ruling | Header consequence |
|---|---|
| E12 — guest checkout is permanent, no customer accounts ever | **No account or login entry point exists**, at any breakpoint. The utility slot it would have occupied is not reassigned; order tracking lives in the footer. §15.11b |
| E3 — the owners run no social accounts | **No social icons in the header.** There were none specified, and none may be added; the reserve slot is in the footer (§16.7), not here |
| E3 — opening hours vary day to day | **The live open/closed pill is deleted.** §15.14 |
| E2 — the business is in **Яворів**, the recognised centre of Hutsul lizhnyk weaving | The descriptor in the logo lockup changed from a generic regional claim to the village. **Reversed in Round 3 by F6.** §15.5 |

**Round 3 reverses one of those changes and adds two.**
[00-client-decisions-3.md](00-client-decisions-3.md) is now the highest-authority document:

| Round-3 ruling | Header consequence |
|---|---|
| F6 — the tagline stays **«в Карпатах»**; the Яворів substitution is withdrawn | The logo descriptor reverts to Carpathian framing. Яворів stays in the mega-menu's featured caption, which sits behind a deliberate interaction. §15.5, §15.7 |
| F2 — the Яворів site is a **shop as well as a factory** | The announcement bar's pickup line stops being a delivery option and becomes an invitation, and the village it names is corrected. §15.4 |
| F4 — the buyer pays shipping and all customs; free shipping **never applies internationally** | `{{FREE_SHIPPING_THRESHOLD}}` becomes locale-scoped. The bar renders no threshold at all under `de`, `pl` and `en`. §15.4 |

The governing pattern behind F6, applied throughout this document: **«Карпати» to be understood,
«Яворів» to be believed.** Persistent chrome exists to be understood in under a second by a
visitor who has done nothing yet; surfaces that open on demand exist to be believed by a visitor
who has already leaned in. The descriptor is the first kind of surface and the mega-menu panel is
the second, which is why they now carry different words.

**Round 4 reverses this document's most consequential single decision.**
[00-client-decisions-4.md](00-client-decisions-4.md) is now outranked only by
[00-client-decisions-5.md](00-client-decisions-5.md):

| Round-4/5 ruling | Header consequence |
|---|---|
| G1 — **Іван `+380679973450` is the primary number, Любов is the fallback** | The utility strip rendered Любов's number on the reasoning that the seller of record should be the public voice. **The client overrode that.** The header now carries **Іван only**. §15.3, §15.14, §15.17 |
| G3 — the workshop can be toured, **with Іван, arranged in advance by phone** | The header's `tel:` link is the booking mechanism for the project's strongest trust asset. There is **no booking widget at any breakpoint**. §15.1 job 6, §15.14 |
| G2 — made-to-order is **14 days of production before dispatch** | The announcement bar may carry a lead-time notice, but only phrased as production time. «14 днів до дверей» is forbidden in persistent chrome, where it cannot be qualified. §15.4 |
| H1.2 — COD with inspection is **Ukraine-only**; card is the only international method | Sharpens §15.12: switching locale removes a payment method, and the citation moves from E11 to the explicit rule |

The header does **not** gain a made-to-order affordance, a payment-method summary or a deposit
notice. Those belong to the PDP and the checkout, where the visitor is deciding; a header that
explains commercial terms is a header that has stopped navigating.

## 15.1 The header's jobs, ranked

Ranking matters because the header is space-constrained and every job competes for the same
1,120–1,440 px. When two jobs conflict, the higher-ranked one wins.

| # | Job | Served by | Why it ranks here |
|---|---|---|---|
| 1 | Reach any category in one interaction, wool first | Mega-menu over the D3 tree | Вовна alone holds twelve categories ([00-client-decisions.md](00-client-decisions.md) D3) and the brand is wool-led. Discovery is the primary failure mode. |
| 2 | Say what this business is, in under one second | Shepherd mark + wordmark + descriptor | Вівчарик is a new brand on a new domain with zero recognition. The header is the only place a first-time visitor learns what the name means. |
| 3 | Distinguish own manufacture from partner goods | Nav ordering and labelling | D3 requires this structurally. A resale category sitting undifferentiated beside own manufacture destroys the verified-origin thesis the moment it is noticed. |
| 4 | Make search reachable without hunting | Persistent, labelled search control | Product names are proper nouns (Ліжник «Мозаїка»), and a cold-start site has no accumulated landing pages to arrive on. |
| 5 | Keep the cart visible and its state honest | Cart control + count badge | A cart that vanishes on scroll is a cart the visitor stops trusting. |
| 6 | Let a hesitant buyer phone a human — **and let a visitor arrange a workshop tour** | `tel:` link, named | Organic traffic is near zero for 3–6 months (D2), and [00-client-decisions-2.md](00-client-decisions-2.md) E3 removes Instagram from the launch channel set entirely. What remains — Google Business Profile, the offline base, word of mouth, and footfall through the Яворів **shop** ([00-client-decisions-3.md](00-client-decisions-3.md) F2) — is **phone-native**, and F2 makes the last of those a real channel rather than a hoped-for one. [00-client-decisions-4.md](00-client-decisions-4.md) G3 adds a second job to the same link: the workshop may be visited **with Іван, arranged in advance by phone**, and the phone is the only mechanism — G3 forbids a booking widget. This job therefore ranks higher in practice than its position suggests. |
| 7 | Give B2B its own front door | «Оптом» in the utility strip | Wholesale is a named audience with lead value far above a single retail order, and it will not be inferred from a product grid. |
| 8 | Let a non-Ukrainian visitor switch language without losing their place | Locale switcher with slug-aware routing | Four locales, and a switcher that dumps the visitor on the homepage is worse than no switcher. |
| 9 | Carry one time-boxed merchandising message | Announcement bar | One. Not a carousel. |
| 10 | Hold a saved-items list **on this device** | Wishlist, `localStorage` only | Real but secondary; first thing demoted at narrow widths. E12 makes it permanently device-local — see §15.11. |

Jobs 1–5 are present at every breakpoint without exception. Jobs 6–10 relocate as width
decreases; the relocation rules are in §15.3 and §15.15.

**A job that does not exist:** *let a returning customer sign in*. E12 settles this permanently —
there are no customer accounts, so there is no eleventh job, no account icon, and no reserved
slot for one. This is a genuine simplification of the most space-constrained component in the
build, and it is recorded as a job-level absence rather than a to-do so that nobody later reads
the empty space as an omission. §15.11b.

## 15.2 Structural decisions, and what was rejected

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Desktop structure | Two rows: utility strip + main bar | One tall row | Ten jobs do not fit one row without shrinking targets below 44 px or truncating `de` labels. Two rows also give condensation something to condense. |
| Вовна exposure | Full-width mega-menu panel | Vertical dropdown | A 12-item vertical list is a linear scan — the pattern [02-ux-research.md](02-ux-research.md) §2.6 identifies as failing the 60+ segment. A panel permits parallel scanning of three short columns. |
| Nav source of truth | A `Setting` row | Rendering `Category.parentId` directly | The panel's sub-headings («Для дому», «Для рукоділля») are merchandising constructs with no node in the tree, and «Партнерські вироби» must be pinned last regardless of `sortOrder`. See §15.6. |
| Partner goods in the nav | Present, last, plainly labelled | Hidden, or mixed into the wool panel | D3 rule 2: confident labelling, not a disclaimer. Hiding it converts a curation story into a discovered deception. |
| Scroll behaviour | Sticky, condensing, never hiding | Hide-on-scroll-down | §15.8 |
| Mobile menu | Fullscreen panel | 320 px side drawer | §15.15 |
| Announcement bar | In normal flow, scrolls away | Sticky | Sticky promotional chrome taxes the smallest viewport permanently for a message read once. |

## 15.3 Anatomy by breakpoint

Breakpoints are those in [11-spacing-system.md](11-spacing-system.md) §11.3. Heights are fixed,
not fluid, because the header is the one place a fluid height would produce a visible reflow
during the condense transition.

### `2xl` / `xl` / `lg` — 1024 px and above

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ✦ Безкоштовна доставка від {{FREE_SHIPPING_THRESHOLD}} ₴ · Магазин у Яворові   ✕ │ 44px  announcement
├──────────────────────────────────────────────────────────────────────────────────┤
│ ☎ +38 067 997 34 50 · Іван    Графік гнучкий — телефонуйте │ Оптом │ UA ▾       │ 36px  utility strip
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ⌇ ВІВЧАРИК        Вовна ▾  Овчина та шкіра ▾  │ Партнерські вироби             │ 80px  main bar
│    Вовна з Карпат       Виробництво  Про нас       ⌕ Пошук  ♡ Обране  ⛒ 2       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
   ↑ container (1120 / 1320 / 1440 max-width, margins per §11.3)
```

Header height at rest: 116 px (utility 36 + main 80), plus 44 px of announcement bar while it is
on screen. Condensed: 80 px. The logo does not resize between states. The thin vertical rule
before «Партнерські вироби» is load-bearing, not decorative — it is the visual boundary between
what Вівчарик makes and what Вівчарик selects — and is a 1 px `--border-hairline` with `space-5`
each side.

The utility strip carries **no account control and no social glyphs** — see the authority note.
It also carries no open/closed pill: that component is deleted in Round 2 (§15.14) and the space
it held now carries the availability sentence, which is shorter and true on every day of the
year.

### `md` — 768–1023 px

The utility strip is removed, not condensed. Phone becomes an icon button in the main bar,
«Оптом» becomes the last primary nav item, and the locale switcher joins the utility cluster.
The availability sentence is not carried down to `md` — it is contact-page and footer content
([16-footer-specification.md](16-footer-specification.md) §16.5), and at this width the phone
affordance alone conveys «call us» without spending a line on it.

```
┌────────────────────────────────────────────────────────────────────┐
│ ✦ Безкоштовна доставка від {{FREE_SHIPPING_THRESHOLD}} ₴        ✕  │ 48px
├────────────────────────────────────────────────────────────────────┤
│  ⌇ ВІВЧАРИК   Вовна ▾  Овчина ▾  Партнерські  Оптом  ☎ ⌕ UA ⛒ 2   │ 72px
└────────────────────────────────────────────────────────────────────┘
```

Labels shorten to tested short forms at this width («Овчина та шкіра» → «Овчина»). Short forms
are content, stored as a `CategoryTranslation` variant — `text-overflow: ellipsis` on a
navigation label is a defect, not a responsive technique. The Вовна panel narrows to two link
columns and drops the featured column.

### `sm` / `xs` — below 768 px

```
┌──────────────────────────────────────────────┐
│ ✦ Безкоштовна доставка від {{THRESHOLD}} ₴ ✕  │ 48px
├──────────────────────────────────────────────┤
│  ☰      ⌇ В І В Ч А Р И К          ⌕   ⛒ 2  │ 64px
└──────────────────────────────────────────────┘
   48px          centred logo        48px 48px
```

Four targets, each 48 × 48 px with ≥8 px separation
([11-spacing-system.md](11-spacing-system.md) §11.7). Wishlist, locale, phone and wholesale move
inside the panel (§15.15). At 320 px the logo drops the descriptor line and the layout still
clears minimum target sizes with 20 px page margins.

Four targets, not five. On most storefronts the fifth is the account icon; here there is no
account (E12), which is why this row fits at 320 px without the usual fight over which control
gets demoted.

## 15.4 The announcement bar

**Content model.** Driven by `Banner` ([25-database-schema.md](25-database-schema.md) §25.8),
`placement = "announcement_bar"`. The resolver selects `isActive` rows whose `[startsAt, endsAt]`
window contains `now`, orders by `position`, and **takes exactly one**. A second simultaneous
announcement is not a future feature; it is a merchandising failure the resolver refuses to
render.

**Schema gap — blocks build.** `Banner.translations` references `BannerTranslation`, declared as
a relation but never defined as a model in §25.8. Required shape:

```prisma
model BannerTranslation {
  id        String @id @default(cuid())
  bannerId  String
  locale    Locale
  headline  String                         // ≤90 chars, measured in de
  linkLabel String?
  banner Banner @relation(fields: [bannerId], references: [id], onDelete: Cascade)
  @@unique([bannerId, locale])
}
```

| Aspect | Rule |
|---|---|
| Permitted content | Exactly one of: shipping threshold, a date-boxed `Promotion`, a production lead-time warning, a seasonal closure notice (`{{CLOSURE_DATES}}`) |
| Forbidden content | Newsletter prompt, cookie notice, review request, a second link, any partner-goods promotion (D3 rule 5 keeps brand surfaces own-manufacture only), **any statement of total delivery time** (see below) |
| Media | None. No background photograph, no text-as-image ([10-typography.md](10-typography.md) §10.8). `Banner.mediaId` / `mobileMediaId` are ignored for this placement |
| Length | ≤90 characters, counted against the **German** string per [10-typography.md](10-typography.md) §10.4 |
| Semantics | `<section aria-label="Оголошення">`, **not** `aria-live` — it is present at load, and announcing it would interrupt the reading the user asked for |

### The shipping threshold is locale-scoped, and the pickup line is corrected

Two Round-3 rulings land on this 90-character string, and both of them would otherwise ship a
promise the business cannot keep.

**F4 — the buyer pays everything.** [00-client-decisions-3.md](00-client-decisions-3.md) resolves
the shipping model: carriage and all customs duties and import taxes fall to the buyer,
effectively DAP, and **free shipping never applies internationally at any order value**. A
threshold rendered in persistent chrome on every page of a `de` or `pl` locale is therefore not a
merchandising message; it is a misstatement made at the top of every screen the visitor sees.

| Locale | Announcement slot 1 |
|---|---|
| `uk` | «Безкоштовна доставка від `{{FREE_SHIPPING_THRESHOLD}}` ₴» — as specified |
| `de`, `pl`, `en` | **No threshold string exists.** The resolver has no free-shipping row for these locales, and the slot falls through to the next eligible `Banner` or renders nothing |

Implemented as an absent row rather than a suppressed one: a row that exists and is hidden by a
render-time locale branch is a row an admin can un-hide. The `de` and `pl` `BannerTranslation`
records for a shipping-threshold banner are simply never authored, and the admin surfaces that
as an untranslated banner rather than as a toggle ([23-admin-panel-architecture.md](23-admin-panel-architecture.md)).

**F2 — the pickup line names the wrong village and does the wrong job.** The draft read
«Самовивіз у Косові». Косів is the raion town, not the site;
[00-client-decisions-2.md](00-client-decisions-2.md) E2 places the business in с. Яворів, and
[00-client-decisions-3.md](00-client-decisions-3.md) F2 adds that the Яворів site is a **retail
shop as well as a production floor**. That changes the register of the line as well as its
content. «Самовивіз» is a logistics option a visitor evaluates against a delivery fee; «Магазин у
Яворові» is a place a visitor can go, and in a village that already receives craft tourists it is
the single strongest thing this bar can say on a domain with no ranking history and no social
accounts.

The bar therefore carries «Магазин у Яворові», not «Самовивіз у Яворові». It does **not** carry
opening hours in any form — E3 is absolute, the hours vary day to day, and a header is the worst
possible place to publish a schedule that is wrong twice a week. The hours caveat and both phone
numbers live in the utility strip and the footer ([16-footer-specification.md](16-footer-specification.md)
§16.5), which is where a visitor who has decided to visit will look.

### A lead-time notice, if it renders at all, states production time only

[00-client-decisions-4.md](00-client-decisions-4.md) G2 fixes `{{MADE_TO_ORDER_DAYS}}` at **14**
and attaches a binding rule to the number: the fortnight is **production before dispatch**, not
total delivery time, and carrier transit is added on top. The announcement bar is the single worst
surface on which to break that rule, because it is 90 characters wide, has no room for a
qualification, and renders on every route.

| String | Verdict |
|---|---|
| «Індивідуальні розміри — 14 днів до дверей» | **Forbidden.** It is the exact misstatement G2 names, and it will generate complaints on day 15 |
| «Виготовлення на індивідуальний розмір — 14 днів, далі доставка» | Permitted, and it is the only permitted shape: a production duration followed by the word that says transit is separate |
| «Замовлення до 20 грудня — встигаємо до свят» | Permitted as a date-boxed seasonal notice. A date the customer can check beats a duration they must remember (G2 rule 4) |

The lead time's real home is the **buy box**, per G2 rule 2 — a customer must not discover it at
checkout and must never discover it after paying. The bar may reinforce it seasonally; it may not
be the place the fact lives.

**Dismissal.** A 48 × 48 px button, `aria-label="Закрити повідомлення"`, writing
`announcement:dismissed:<bannerId>` to `localStorage`. Scoping the key to the banner id is what
makes a *new* announcement reappear for a returning visitor; a global `announcementDismissed`
flag silences every future message and is the standard bug in this component. `localStorage`
rather than a cookie because the value is never needed server-side, and a cookie would add bytes
to every request and raise a `de`-locale consent question for no benefit.

**No flash, no CLS.** The bar is server-rendered so its 44/48 px is reserved in the first layout,
and a 380-byte inline script in `<head>` reads `localStorage` and sets
`data-announcement="hidden"` on `<html>` before first paint. This is a documented exception to
the no-blocking-script rule: the alternatives are a visible flash of a dismissed bar or a
post-hydration shift, and [13-motion-system.md](13-motion-system.md) §13.5 budgets zero CLS.

## 15.5 Logo lockup

Inline SVG, never an `<img>`, so it inherits `currentColor` and costs no extra request.

The lockup is **mark + wordmark**. The mark is the shepherd/sheep in the maker's-mark register of
[01-brand-strategy.md](01-brand-strategy.md) §1.7 — single-weight line, no fill, one colour.
[00-client-decisions.md](00-client-decisions.md) D2 mandates the sheep/shepherd identity as the
brand core: «Вівчарик» means *little shepherd*, and a wordmark without the mark throws away the
one thing that makes the name legible to a visitor who has never seen it.

| Breakpoint | Lockup | Width × height | Composition |
|---|---|---|---|
| `lg`+ | Mark + wordmark + descriptor | 208 × 44 | Mark 32 px, wordmark `Kyiv*Type Serif` 500, descriptor «Вовна з Карпат» in `overline` |
| `md` | Mark + wordmark + descriptor | 176 × 40 | as above, descriptor at 11 px tracked |
| `sm` / `xs` | Mark + wordmark | 148 × 28 | Descriptor dropped — it truncates before it informs |

### The descriptor: «Вовна з Карпат», reverted from «Вовна з Яворова»

The Round-2 draft of this section replaced «Карпатська фабрика» with «Вовна з Яворова», on the
appellation argument: «Карпатська» is a claim thousands of Ukrainian sellers make and none can be
distinguished by, whereas «Яворів» resolves on a map and can be checked.

**The client reviewed that proposal and rejected it.**
[00-client-decisions-3.md](00-client-decisions-3.md) F6: «Ні, напиши краще "в Карпатах".» The
descriptor reverts to Carpathian framing and reads **«Вовна з Карпат»**.

The revert is not a restoration of «Карпатська фабрика». Two of the three changes Round 2 made to
this string were about grammar and register rather than about the place-name, and they stand:

| | Original | Round 2 | Round 3 |
|---|---|---|---|
| Place | Карпатська | Яворів | **Карпати** — reverted per F6 |
| What is being sold | «фабрика» — a building | «вовна» — the material | **вовна** — kept |
| Form | Adjective attached to a noun about the company | Noun plus prepositional place | **Noun plus prepositional place** — kept |

«Вовна з Карпат» is fourteen characters and says wool and a place. «Карпатська фабрика» is
eighteen and says neither — «фабрика» describes the premises, which is the least interesting true
thing about the business, and the adjective is doing all the work.

**Why the descriptor takes «Карпати» while the mega-menu caption keeps «Яворів».** The logo
descriptor is persistent chrome: it is on screen on every route, in every locale, for a visitor
who has not yet done anything and has not agreed to learn anything. A proper noun placed there
must be understood on first sight by a German buyer, a Kyiv gift-shopper and a Косів neighbour
alike, and «Яворів» is understood by exactly one of those three. The mega-menu's featured caption
(§15.7) sits behind a deliberate hover or tap — the visitor has leaned in, and specificity now
reads as evidence rather than as homework. **«Карпати» to be understood, «Яворів» to be believed.**
The descriptor's job is the first; the panel's job is the second.

Three constraints on the descriptor:

1. **It names wool and a place, not a superlative.** «Столиця ліжникарства» is a claim about the
   *village*, and it is true, but in a persistent chrome descriptor it reads as a claim about
   Вівчарик. The long form belongs further down the page, where there is room to attribute it
   ([06-homepage-wireframe.md](06-homepage-wireframe.md) §6.3).
2. **It never implies heritage accreditation.** E2's verification constraint is absolute: the
   *craft* may be inscribed on Ukraine's intangible-heritage register; a *company* is not. No
   heritage wording, no register reference and no seal-shaped graphic appears in the lockup.
3. **It is one string per locale, not a translation of the Ukrainian.** «Wool from the
   Carpathians», «Wolle aus den Karpaten», «Wełna z Karpat» all fit the 208 px lockup; a
   machine-translated string does not get to decide the width of the most-rendered component on
   the site.

**The static mark is in the header; the animated mascot is not.** §1.7 restricts mascot
*behaviour* — idle, cursor tracking, sleep — to loader, empty states, 404, order confirmation and
the footer mark. The header mark never animates. Persistent chrome is where charm decays into
noise by page three, and spending the brand's delight allowance there wastes it.

Colour is `--text-primary` on the light header, `--bg-page` on the inverted variant used over a
full-bleed hero. Clear space equals the wordmark's cap height and is implemented as padding on the
link, so clear space and hit area are the same rectangle. The logo links to the locale root, is
`aria-current="page"` on the homepage, and is named «Вівчарик — на головну» — "logo" is not a
destination.

## 15.6 Primary navigation over the D3 tree

The confirmed tree ([00-client-decisions.md](00-client-decisions.md) D3) maps to the header as
follows. Дерево is absent entirely — D3 states the architecture is prepared but the category is
not launched, and a navigation entry pointing at a draft category is a promise the catalogue
cannot keep.

| Nav item | Type | Children | Position |
|---|---|---|---|
| **Вовна** | Mega-menu panel | 12 | First, always. The brand is wool-led |
| **Овчина та шкіра** | Two-item dropdown | 2 (Вироби з овчини, Шкіряні вироби) | Second |
| **Партнерські вироби** | Plain link | — | Third, after a hairline rule |
| **Виробництво** | Plain link | — | Fourth |
| **Про нас** | Plain link | — | Fifth |

Five top-level items, under the seven-item ceiling in the restructuring rule below.

### The Вовна panel's grouping

Twelve categories are too many for one ungrouped column, and they are grouped by *what the buyer
is doing* rather than by material — all twelve are wool, so material discriminates nothing here.

| Group | Categories |
|---|---|
| **Для дому** | Ліжники · Ковдри вовняні · Подушки · Накидки |
| **Одяг і взуття** | Гуні · Камізельки · Шкарпетки · Капці · Пояси |
| **Для рукоділля** | Вовняна пряжа · Ровниця · Вовна для рукоділля |

«Для рукоділля» is a buying mode, not a product family: Persona 4
([02-ux-research.md](02-ux-research.md) §2.3) buys by колір + метраж + товщина, by weight rather
than by unit (D4), and buys repeatedly. It is also the group most likely to convert on a
cold-start site, because it is reached through informational long-tail search rather than
commercial head terms (D2, consequence 2). Its own column is cheaper than making it hunt.

### Three structural rules

**1. The nav is a projection, not the tree.** Structure is read from a `Setting` row keyed
`nav.primary`, an ordered list of `{ key, categoryIds[], groupLabels, featuredMediaId }`. The
group labels have no `Category` node and must not acquire one — inventing three intermediate
categories to satisfy a menu would add a URL level, a breadcrumb level and three thin landing
pages for no buyer benefit. The tree stays canonical for URLs, breadcrumbs and structured data.

**2. Rendering follows child count:** ≥3 children → full-width panel; exactly 2 → compact
trigger-aligned dropdown with no featured column; 1 or 0 → plain link, or absent if inactive.
That is why Вовна is a panel, Овчина та шкіра is a dropdown and Дерево does not appear, and it is
what lets the header restructure itself when the wooden range launches without a code change.

**3. Partner goods are labelled, separated, and never featured.** «Партнерські вироби» sits after
a hairline rule, carries a one-line description in the mobile panel, and is excluded from every
panel's featured column — D3 rule 5 confines partner goods to catalogue and search, and featured
imagery is a brand surface.

`{{PARTNER_NAMES}}` is now **resolved as permanently unavailable**:
[00-client-decisions-2.md](00-client-decisions-2.md) E7 answers «Ні» to naming the partners, so
`Product.partnerName` stays null and is never rendered anywhere on the site. The nav description
therefore reads **«Відібрано Вівчариком — вироби карпатських майстрів»**, using
`Product.partnerRegion` («Косівщина», «Гуцульщина») as the specificity that the company name
would otherwise have supplied.

This is not a degraded fallback, and the previous draft's «degrades to» framing is withdrawn.
E7 states the principle directly: being unable to name the partner is a reason to be **more**
explicit that the item is not own-made, not less. The nav item keeps its hairline separation, its
own label and its own description — the three affordances that carry the disclosure — and loses
only a proper noun that most visitors would not have recognised anyway. What it gains is a first
person singular: «відібрано **Вівчариком**» is a curation claim the brand signs, and a signed
selection is a stronger trust object than an unsigned supplier list.

### The restructuring rule

| Measure | Ceiling | What happens on breach |
|---|---|---|
| Links in one panel column | 8 | Split into another column |
| Link columns in one panel | 3 (24 links) | Introduce curated sub-grouping with sub-headings |
| Links in one panel, total | 24 | The panel shows the top 8 plus «Усі категорії» and the rest moves to a category landing page |
| Top-level items in the main bar | 7 | A nav item is demoted to the footer or into a world |

The 24-link ceiling derives from [02-ux-research.md](02-ux-research.md) §2.6: mega-menus at
around 40 links measurably fail the older half of this audience. Вовна sits at 12, which is
comfortable. The ceiling exists so catalogue growth cannot quietly erode the header.

## 15.7 The mega-menu panel

```
┌─ main bar ─────────────────────────────────────────────────────────────────────┐
│  ⌇ ВІВЧАРИК    [Вовна ▾]  Овчина та шкіра ▾ │ Партнерські  Виробництво  Про нас│
├────────────────────────────────────────────────────────────────────────────────┤
│  ДЛЯ ДОМУ          ОДЯГ І ВЗУТТЯ      ДЛЯ РУКОДІЛЛЯ   ┌───────────────────────┐ │
│  Ліжники           Гуні               Вовняна пряжа   │  [featured photo:     │ │
│  Ковдри вовняні    Камізельки         Ровниця         │   own manufacture     │ │
│  Подушки           Шкарпетки          Вовна для       │   in process]         │ │
│  Накидки           Капці              рукоділля       │                       │ │
│                    Пояси                              │  Ліжники              │ │
│  ────────────────  ────────────────   ─────────────   │  Ткані вручну         │ │
│  Уся вовна →       Догляд за вовною → Як обрати →     │  в Яворові            │ │
└───────────────────────────────────────────────────────┴───────────────────────┘ │
      col 1–3            col 4–6             col 7–8            col 10–12
```

| Property | Value |
|---|---|
| Width | Full container width, aligned to the 12-column grid — not a dropdown pinned under its trigger |
| Padding | `space-10` block, container margins inline |
| Columns | `lg`+: 3 link columns + featured. `md`: 2 link columns, groups stack, no featured column |
| Surface | `--bg-surface`, `shadow-md`, 1 px `--border-hairline` top rule |
| Sub-headings | `overline`, `--text-muted` — grouping labels, not links |
| Links | `body` 17 px, 44 px hit area via padding, underline-from-left on hover per [13-motion-system.md](13-motion-system.md) §13.10 |
| Footer row | «Уся вовна →» plus one contextual editorial link per column |
| Featured item | `Category.heroMediaId` or a curated image via `nav.primary.featuredMediaId`. `radius-none` per §11.5, `focalPoint` respected. **Must be `origin = OWN_MANUFACTURE`**, and must be an in-process or in-situ photograph, never a cut-out on white |
| Max height | `min(560px, 100dvh - header)` with internal scroll |

The featured column is not decoration. It is the one place in the header where
[01-brand-strategy.md](01-brand-strategy.md) §1.1's thesis — show the production, not only the
product — reaches a visitor who has not scrolled anywhere yet. On a cold-start domain where the
first visitors arrive from the Google Business Profile, from word of mouth, or from having walked
past the workshop in Yavoriv — not from a ranked category page, and per
[00-client-decisions-2.md](00-client-decisions-2.md) E3 **not from Instagram either** — that
first impression is carrying more weight than it normally would. The channel set is thinner than
the previous draft assumed, which raises the value of every impression the site controls itself.

**The featured caption keeps «Яворів», and it is the only place in the header that does.** This
is deliberate and it is the direct application of the F6 pattern set out in §15.5: «Карпати» to
be understood, «Яворів» to be believed. The logo descriptor is on screen unconditionally and must
be understood by someone who has done nothing; this caption appears only after a visitor has
hovered or tapped a nav item, which is an act of interest. A reader who has opened the wool panel
is a reader who will accept a village name as corroboration rather than as an unexplained proper
noun — and the photograph beside it is doing the explaining.
[00-client-decisions-3.md](00-client-decisions-3.md) F6 keeps Яворів in every supporting surface
for exactly this reason; it removes it only from the surfaces that must work in one second.

Since the photograph must be own manufacture in process, and since E6 confirms the full cycle is
in-house including hides, the caption can name a real stage — weaving, fulling, carding — rather
than a mood. It must name only a stage that the photograph actually shows: E6's self-policing
rule is that any claimed stage must be photographed.

## 15.8 Scroll behaviour

**Decision: sticky and condensing. Never hide-on-scroll-down.**

Hide-on-scroll-down is the fashionable choice and it is wrong for this audience. It creates a
hidden state whose only recovery gesture is an upward scroll — the exact class of hidden
affordance [02-ux-research.md](02-ux-research.md) §2.6 finds is not discovered by the 60+
segment. It misfires on imprecise scrolling: a tremor-affected or inertia-heavy scroll produces a
header that flickers in and out, reading as broken rather than clever. And it removes the cart
and the phone number — jobs 5 and 6 — exactly when a deep-scrolling visitor most needs them.

```
rest (scrollY < 24px)              condensed (scrollY ≥ 24px)
┌────────────────────────┐          ┌────────────────────────┐
│ utility strip    36px  │  ─┐      │ main bar         80px  │
├────────────────────────┤   │      └────────────────────────┘
│ main bar         80px  │   └─ wrapper: translateY(-36px)
└────────────────────────┘
        116px visible                       80px visible
```

The wrapper is `position: fixed`, `height: 116px`; condensation is one
`transform: translateY(-36px)` on it. Nothing resizes, nothing reflows, no layout property is
animated, CLS is structurally zero — which is what [13-motion-system.md](13-motion-system.md)
§13.5 requires. The main bar's background is opaque, so the retreating strip is clipped by the
viewport edge. A 116 px spacer holds the document's initial offset.

| Property | Value |
|---|---|
| Trigger | `scrollY ≥ 24px`, 12 px hysteresis so a 25 px scroll cannot oscillate |
| Duration | `dur-base` 220 ms, `ease.gentle` |
| Added on condense | `shadow-sm` fades in over `dur-instant`; 1 px bottom hairline |
| Driver | `IntersectionObserver` on a spacer sentinel — never a `scroll` handler that writes to the DOM (§13.5) |
| Reduced motion | State change is instant, no transform transition |
| `md` and below | No condensation; the header is already minimal |

## 15.9 Search

**Entry point.** At `lg`+ a pill button carrying a magnifier glyph *and* the word «Пошук».
[02-ux-research.md](02-ux-research.md) §2.6 requires icon-only controls to carry a visible label
on the storefront, and search is the control that rule protects hardest — the magnifier is well
known to designers and not to everyone else. Below `lg` it is icon-only with an `aria-label`,
justified narrowly: at 375 px the label costs a 48 px target elsewhere, and magnifier, bag and
hamburger are the three most conventionalised glyphs in the medium. `Cmd/Ctrl + K` and `/` open
the overlay from anywhere except inside a text field.

```
┌──────────────────────────────────────────────────────────────┐
│  ⌕  ліжник                                            ✕      │  input, 64px, autofocus
├──────────────────────────────────────────────────────────────┤
│  КАТЕГОРІЇ                                                   │
│   Ліжники  ·  Ковдри вовняні                                 │
│  ТОВАРИ                                                      │
│   [img] Ліжник «Мозаїка» 150×200   ⌇ власне    від {{}} ₴    │  max 6
│   [img] Ліжник «Гармонія» 150×200  ⌇ власне    від {{}} ₴    │
│  СТОРІНКИ ТА СТАТТІ                                          │
│   Як доглядати за вовняним ліжником                          │
├──────────────────────────────────────────────────────────────┤
│  Усі результати для «ліжник» →                               │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Position | Drops from the header, full container width; scrim `forest-950` at 40% |
| Threshold | 2 characters, 220 ms debounce |
| Sections | Categories (max 3) → Products (max 6) → Pages and posts (max 3) |
| Origin marker | Every product row carries its origin: the shepherd glyph + «власне» for `OWN_MANUFACTURE`; for `PARTNER_MANUFACTURE`, **«відібрано» plus `partnerRegion` where known** («відібрано · Косівщина»), or «відібрано» alone where it is not. **Never a partner name** — [00-client-decisions-2.md](00-client-decisions-2.md) E7. Search is the one surface where the two origins legitimately sit side by side, so it is the surface that most needs the label, and the two markers are set at the same size and weight so neither reads as a footnote to the other |
| Empty query | Recent searches from `localStorage` (max 5, clearable) plus popular queries from `SearchQueryLog` |
| Zero results | The designed empty state from [08-design-system.md](08-design-system.md) §8.8 — names the query, offers the wool groups, offers the phone number |
| Logging | Every submitted query writes `SearchQueryLog` with `locale`, `resultCount`, and `clickedId` on selection ([25-database-schema.md](25-database-schema.md) §25.9) |
| Close | `Esc`, scrim click, or ✕; focus returns to the trigger |

Prices render with `tabular-nums` ([10-typography.md](10-typography.md) §10.6) so the right-hand
column does not jitter as results swap in. Zero-result queries are the highest-signal
merchandising input the store has and are surfaced on the admin dashboard — on a cold-start site
with no Search Console history, they are also the *only* first-party demand signal available for
the first quarter.

## 15.10 Cart

A bag glyph with a count badge, plus the label «Кошик» at `lg`+.

| Property | Value |
|---|---|
| Count source | `sum(CartItem.quantity)` for the cart identified by the `Cart.token` httpOnly cookie |
| By-weight lines | Yarn, ровниця and вовна для рукоділля are priced by weight (D4). The badge counts **lines**, not kilograms; a badge reading "2.4" is meaningless |
| Badge | 20 px pill, `--accent` fill, `forest-950` text, `tabular-nums`, hidden at zero, `9+` above nine |
| Accessible name | «Кошик, N товарів» on the button; the badge itself is `aria-hidden` |
| Announcement | A visually hidden `aria-live="polite"` region announces the new total once after add-to-cart, not on every re-render |
| Action | Opens the cart drawer; does not navigate — except at `xs`, where the drawer is full-screen anyway and a route is cheaper and back-button-correct |
| Drawer | Right side, 420 px at `md`+, full width below; `dur-slow` 340 ms, `spring.drawer`; `z-modal` over a `z-overlay` backdrop |
| Focus | Trapped while open, returned to the cart button on close, `Esc` closes |

Badge motion on add-to-cart is the count-up in [13-motion-system.md](13-motion-system.md) §13.10;
the price inside the drawer does not animate (§13.11). `Cart.expiresAt` is set generously: the
tourist persona's session is interrupted by definition and the cart must survive a three-day gap
([02-ux-research.md](02-ux-research.md) §2.7).

## 15.11 Wishlist

Heart glyph plus «Обране» at `lg`+; present at `lg` and `md`; below `md` it lives in the mobile
panel. Count badge only when non-zero, in `--text-muted` rather than `--accent` — the wishlist
must never out-shout the cart.

**Resolved: the wishlist is `localStorage`-only, forever.**
[00-client-decisions-2.md](00-client-decisions-2.md) E12 closes `{{ACCOUNTS_DECISION}}` in favour
of permanent guest checkout. `WishlistItem` is **removed from the schema**, there is no merge
flow, no server record and no cross-device sync. The list is an array of variant ids in
`localStorage`, scoped to this browser on this device.

| Aspect | Rule |
|---|---|
| Storage | `wishlist:v1` in `localStorage`, an array of `variantId` strings. No cookie — the value is never needed server-side, and a cookie would add bytes to every request and raise a `de` consent question for nothing |
| Count badge | Read after hydration only. The header renders no badge server-side, because the server genuinely does not know the count. It fades in rather than popping, per §15.18 |
| Honest labelling | The toggle's accessible name and the panel heading both carry **«Збережено на цьому пристрої»**. Not in fine print — in the control itself |
| Stale ids | Variant ids that no longer resolve are dropped silently on read. A wishlist that shows a "product not found" card is worse than one that shows nine items instead of ten |
| Clearing | Clearing browser data clears the wishlist. The empty state says so, rather than implying data loss |

**Why the honesty beats pretending it syncs.** The alternative — say nothing, and let the visitor
assume a server-side list — costs nothing on the day it is built and everything on the day it
fails. Someone saves six ліжники on a phone in a shop, opens a laptop at home, finds an empty
list, and concludes the site lost their data. That visitor does not file a bug; they leave, and
they attribute the failure to the shop rather than to a storage model they were never told about.
Stating «збережено на цьому пристрої» up front converts a future breach of expectation into a
present, minor, correctly-set expectation — and it prompts the one behaviour that actually
survives, which is sending oneself the link. This is the same principle
[01-brand-strategy.md](01-brand-strategy.md) §1.8 applies to origin labelling: disclose the limit
at the moment of the promise, not at the moment of the failure.

It is also the cheaper build. No `WishlistItem` table, no merge semantics, no last-write-wins
conflict rule, no guest-to-customer migration path, and no orphaned rows for customers who never
return. E12 is a simplification, and this section is where the header collects the saving.

## 15.11b No account entry point — what replaces it

E12 removes customer accounts permanently. Concretely, for this component:

**Removed, and not to be re-added:** «Увійти», «Реєстрація», «Мій кабінет», an account or
person glyph, a dropdown containing order history or saved addresses, and any "sign in to save
your wishlist" prompt attached to the heart control.

**What replaces it:** a lookup form at `/vidstezhyty/` taking **order number + email**, linked
from the **footer**, in the Покупцю column. The full justification is in
[16-footer-specification.md](16-footer-specification.md) §16.4b; the header's side of that
decision is stated here because the header is where the space was:

1. The utility cluster is the scarcest horizontal space on the site and is optimised for the
   **pre-purchase** visitor — search, cart, phone, wholesale. Order tracking is a post-purchase
   task that occurs at most once per order, after the money has moved. Spending permanent chrome
   on it inverts the priority the rest of §15.1 is built on.
2. The genuine primary path is the `guestToken` link in the confirmation email, which requires
   the buyer to type nothing. The footer link is the fallback for a deleted email, and that
   visitor is motivated enough to scroll.
3. The freed slot is **not reassigned**. A header that gets denser because a control was removed
   has not benefited from the removal.

**Address prefill instead of a profile.** Per E12, a repeat buyer's convenience comes from a
first-party cookie prefilling the checkout address on the same device — no account, no
server-side profile, and no header surface at all. The header is not involved and must not
advertise it.

## 15.12 Locale switcher

A button labelled with the current locale's ISO code and a globe glyph (`UA ▾`), opening a list
of the four locales **in their own language**: Українська, English, Polski, Deutsch. Never flags
— a flag is a country, and none of the four map cleanly.

| Question | Answer |
|---|---|
| Source of truth | The URL path prefix (`/uk/…`, `/en/…`) per [29-seo-architecture.md](29-seo-architecture.md). One canonical URL per locale, always |
| Persistence | A `locale` cookie, one year, `SameSite=Lax`, written **only on an explicit manual switch**. It records a decision; it never overrides a URL |
| Also written | `Cart.locale`, so confirmation emails arrive in the chosen language |
| Auto-redirect on `Accept-Language` | **No.** It breaks the back button, obstructs crawler access to alternate locales, and strands a Ukrainian visitor on a German page because of a borrowed laptop. On a cold-start domain, obstructing crawlers is the last thing this site can afford |
| Instead | A one-time dismissible suggestion strip below the header: «This page is available in English →». Never a modal |
| Route preservation | Resolves the equivalent slug via `ProductTranslation.slug` / `CategoryTranslation.slug`; with no translation it routes to the nearest translated ancestor and toasts why, rather than silently landing on the homepage |
| Placement | Utility strip at `lg`+, utility cluster at `md`, bottom of the mobile panel below `md` (§15.15) |

### The switcher is a commerce control now, not a content control

[00-client-decisions-2.md](00-client-decisions-2.md) E11 accepts international orders: `en`, `pl`
and `de` are **transactional** locales. That changes what this control is. A content-only
switcher moves a reader between translations; a transactional switcher moves a buyer between
**price, currency, delivery options, payment methods and legal terms** — and the switch is
therefore consequential in a way a translation toggle is not.

Three consequences for this component:

| Consequence | Behaviour |
|---|---|
| The switch changes commercial terms, not only language | Switching to `de` or `pl` may change the visible price presentation, **removes «наложений платіж з оглядом» and the return-shipping deposit that funds it** ([00-client-decisions-5.md](00-client-decisions-5.md) H1.2, H1.3 — both are Ukraine-only, the deposit for a legal reason under the EU right of withdrawal), and brings the EU withdrawal terms into force. The switcher itself stays a plain list; the **cart and checkout** are where the change is disclosed ([18-checkout-specification.md](18-checkout-specification.md)), because that is where it is actionable |
| Settlement currency is unconfirmed | E10 V11 is open. If WayForPay settles UAH only, prices display converted and charge in UAH, and the checkout must say so plainly. The header displays no currency selector until this is answered — a currency control that does not control the currency is a lie with a caret on it |
| Catalogue scope differs by locale | E11 recommends launching `de` and `pl` **wool-only**: sheepskin and leather face EU species-declaration paperwork, wool does not |

**The `de`/`pl` catalogue restriction resolves the D6.5 open item.** Under those two locales the
«Овчина та шкіра» nav item is **suppressed at the locale level**, not hidden with CSS, and the
Вовна panel becomes the entire product navigation. A nav item the catalogue cannot legally
fulfil for that visitor is worse than no nav item: it converts a paperwork limitation into a
failed checkout, discovered after the buyer has invested attention. Suppression at the projection
layer (§15.6 rule 1) means the restriction is one `Setting` row per locale, not a code branch —
and it lifts by editing that row on the day the species declarations are confirmed.

`en` is unaffected: it is not an EU locale and carries no species-declaration obligation of its
own, so it renders the full tree.

## 15.13 The wholesale entry point

«Оптом» sits in the utility strip at `lg`+ and is a top-level nav item at `md`.

B2B needs a header entry point for reasons specific to this business: the wholesale buyer
evaluates in one long desktop session and will not dig ([02-ux-research.md](02-ux-research.md)
§2.3); one qualified reseller outvalues dozens of retail orders; and with organic traffic near
zero for two quarters (D2), inbound B2B is the revenue channel least dependent on search
rankings. The wholesale buyer is also the audience most likely to notice the own-manufacture /
partner distinction and the one for whom the `origin` filter facet (D3 rule 4) matters most, so
the wholesale page links straight into `?origin=own`.

[00-client-decisions-2.md](00-client-decisions-2.md) E3 strengthens this further. With Instagram
removed from the channel set, the header's wholesale link is one of the few standing invitations
the site issues to a B2B visitor who arrived by any route at all — and §19.1's framing of the
wholesale page as «a link you send someone» makes the header entry the second-best way to reach
it after a pasted URL.

The label is «Оптом». Dropshipping, offered by the adjacent audited business, is **not** confirmed
for this one — it enters the header only if `{{DROPSHIP_OFFERED}}` resolves true, at which point
the label becomes «Оптом і дропшипінг» and nothing else changes. Note that if it does resolve
true, E7 restricts both dropshipping and private label to **own manufacture only**
([19-wholesale-page-specification.md](19-wholesale-page-specification.md) §19.9) — the header
label does not carry that nuance, and must not try to.

Treatment: `body-sm` in `--text-body` with a 1 px `gold-600` underline — gold as a rule, not as
text, since `gold-600` fails AA at body size ([09-color-palette.md](09-color-palette.md) §9.3).
The `accent` button variant ([08-design-system.md](08-design-system.md) §8.5) is reserved for the
wholesale page's own CTA; a gold button in persistent chrome would break the
one-primary-action-per-screen principle on every page at once.

## 15.14 Phone in the header — and the deletion of the open/closed pill

At `lg`+ the utility strip renders **one** number as a `tel:` link, labelled with a name:

```
☎ +38 067 997 34 50 · Іван         Графік гнучкий — телефонуйте перед візитом
```

**Which number — reversed in Round 4, and this is the reversal.** The previous revision of this
section put **Любов's** number in the header, on the reasoning that the seller of record — the ФОП
on the offer contract, the invoice and the WayForPay merchant account (E1) — should be the public
voice. **The client overrode that.** [00-client-decisions-4.md](00-client-decisions-4.md) G1:

> «Основний телефон Іван +380679973450, а якщо недоступний перший, то ось другий, це вже Любові
> +380679604769.»

| Position | Number | Person | Rendered in the header |
|---|---|---|---|
| **Primary** | `+380679973450` | Гондурак Іван Федорович — owner of production | **Yes, and alone** |
| Fallback | `+380679604769` | Гондурак Любов Юріївна — ФОП seller of record | No. Footer NAP, mobile panel, contact page |

The overridden argument was not wrong about company law; it was wrong about the surface. A header
phone link is not a route to the contractual counterparty, it is a route to **whoever picks up**,
and the client — who knows which of the two of them answers a ringing phone during a working day —
has said that is Іван. G3 corroborates it from a different direction: the workshop tour is
conducted *by Іван*, arranged in advance by phone, and the number in persistent chrome is the one a
visitor will use to arrange it. A header pointing at the person who does not run the tour would
force a relay on the single highest-intent call the site generates.

**Still one number, not two.** G1 is explicit that the header carries Іван **only** — «one number,
no ambiguity at the moment of contact». Two unlabelled numbers in chrome force a decision the
visitor has no basis to make, and two labelled numbers cost a line the utility strip does not have.
Both render in the footer ([16-footer-specification.md](16-footer-specification.md) §16.5) and in
the mobile panel (§15.15), where the visitor has deliberately opened a surface and can afford a
choice.

**The split between "who trades" and "who answers" must not be flattened.** G1 states this as a
rule rather than a preference, and this document owns one half of it: the header, the mobile panel
and the contact page name **Іван first**, while the legal line, the Impressum and the offer
contract name **Любов**, because those identify the ФОП rather than the person on the phone
([16-footer-specification.md](16-footer-specification.md) §16.10). A future contributor
"correcting" one to match the other has introduced a defect in whichever one they changed.

`LocalBusiness.telephone` carries **Іван only** — the property is singular in practice, and Любов
belongs in `contactPoint` ([29-seo-architecture.md](29-seo-architecture.md)). The header is the
surface that must agree with `telephone`, and after this reversal it does.

The old numbers `+38 068 500 90 40` and `+38 098 788 95 06` belonged to the **adjacent business**
and are struck from this blueprint entirely.

**Viber is suspended, not specified.** The previous draft deep-linked Viber on the strength of the
audit, which described a different company. Neither Round-2 number is confirmed to carry Viber.
A Viber glyph opening a chat nobody reads is worse than a phone that rings, so the control does
not ship until one number is confirmed — at which point it renders beside that number only.

### The live open/closed pill is deleted

E3: the hours are flexible and differ day to day, and Google Maps is the live source. The pill
computed «Відчинено до 19:00» from a fixed schedule that does not exist. It is removed, along with
the `Europe/Kyiv` schedule computation, the server-render-then-hydrate correction, and the hourly
revalidation that supported it — a measurable simplification of the header's rendering path
(§15.19).

| Option | Verdict |
|---|---|
| Keep the pill, fed by a manually updated «today's hours» setting | **Rejected.** It is correct exactly as often as someone remembers to update it, and the failure mode — a green dot reading «Відчинено» beside a closed workshop — is worse than no dot at all. Systems that require daily human input to avoid lying will eventually lie |
| Keep the pill, fed from the Google Business Profile API | **Rejected for launch.** It adds an external dependency and a quota to the one component that renders on every route, to display information that a phone call answers better. Revisit only if hours stabilise |
| Replace with «Графік гнучкий — телефонуйте перед візитом» | **Chosen.** True every day, no computation, no state, and it routes the visitor to the action that actually resolves their question |

The GBP-corroboration argument from the previous draft still holds but now cuts the other way.
E4 makes the Google Business Profile the launch's primary channel, and NAP consistency between
profile and site is a direct local-ranking input. The site cannot corroborate hours it does not
know; what it **can** do is agree with the profile on name, address and phone, and defer to the
profile on hours by linking to it. Deferring is a consistency strategy, not an absence of one.

No hours appear anywhere in the header, at any breakpoint, in any locale.

## 15.15 The mobile menu

**Decision: a fullscreen panel, not a side drawer.** A 320 px side drawer works when the menu is a
short list. This one is not: three wool groups, twelve wool categories, two hide categories,
partner goods, four site pages, wholesale, wishlist, phone and a locale switcher. In a partial
drawer that becomes a narrow internally scrolling column where German and Ukrainian labels wrap to
two lines, with a strip of dimmed page competing for attention beside it. A fullscreen panel gets
the full 16 px-margin grid, so labels fit on one line in every locale, and it removes the
ambiguity about which surface is active — a meaningful simplification for the low-vision half of
the audience.

```
┌──────────────────────────────────────────────┐
│  ⌇ ВІВЧАРИК                            ✕     │  64px — mirrors the closed header
├──────────────────────────────────────────────┤
│   ▾ Вовна                                    │  56px accordion header, open by default
│       ДЛЯ ДОМУ                               │  overline sub-heading
│       Ліжники · Ковдри · Подушки · Накидки   │  52px rows
│       ОДЯГ І ВЗУТТЯ                          │
│       Гуні · Камізельки · Шкарпетки …        │
│       ДЛЯ РУКОДІЛЛЯ                          │
│       Пряжа · Ровниця · Вовна                │
│   ▸ Овчина та шкіра                          │
│  ──────────────────────────────────────────  │
│   Партнерські вироби                         │
│   Відібрано Вівчариком — вироби              │  caption, --text-muted
│   карпатських майстрів                       │
│  ──────────────────────────────────────────  │
│   Оптом                                      │
│   Виробництво · Про нас · Блог · Догляд      │
│   Обране (3)                                 │
│   Збережено на цьому пристрої                │  caption, --text-muted
│  ──────────────────────────────────────────  │
│   ☎ +38 067 997 34 50 · Іван                 │  56px, full-width — основний
│   ☎ +38 067 960 47 69 · Любов                │  56px, full-width — якщо не відповідає
│   Графік гнучкий — телефонуйте               │  caption
│   перед візитом                              │
│   Українська · EN · PL · DE                  │  48px
├──────────────────────────────────────────────┤
│                  Закрити                     │  56px, sticky bottom
└──────────────────────────────────────────────┘
```

**Accordion, not drill-down.** The hierarchy is two levels deep. Drill-down push navigation would
add a back-gesture round trip per world and hide the other worlds while the visitor is inside
one. Animation uses `grid-template-rows: 0fr → 1fr`
([13-motion-system.md](13-motion-system.md) §13.10) so no height is measured and nothing jumps.
Multiple worlds may be open at once; closing is not forced. Вовна is **open by default** on first
render — it is the brand's lead category and collapsing it costs a tap for the majority case.

### Thumb reachability

Reference device 390 × 844 CSS px (the modal Ukrainian-market handset class —
[33-responsive-strategy.md](33-responsive-strategy.md) §33.14), right-handed one-handed grip,
thumb pivot at the lower-right corner.

```
   0 ────────────────────────────── 390
   │   ▓▓▓▓▓  HARD — reposition grip   │  844–620px from bottom
   │   ▓▓▓▓▓▓▓▓▓                       │
   │   ░░░░░░░░░░░  STRETCH            │  620–420px
   │   ░░░░░░░░░░░░░░░░                │
   │   ███████████████████  EASY       │  420–0px
   │   ██████████████████████          │
   0 ────────────────────────────── 390  ↑ pivot
```

Five consequences, each acted on in the layout above:

1. The top-right ✕ sits in the hard zone. It stays — it is where people look — but is
   **duplicated** by a sticky full-width «Закрити» bar at the bottom, in the easy zone.
2. Panel content is `justify-content: flex-end` while its natural height is under the viewport,
   so on an 844 px screen the accordion headers land in the easy and stretch zones rather than at
   the top. Once expanded content exceeds the viewport it reverts to top-anchored scrolling,
   because reading order then outranks reach.
3. The locale switcher sits near the bottom: rarely used, but used urgently by someone who cannot
   read the page.
4. Accordion headers are 56 px and child links 52 px, both above the 48 px floor in
   [11-spacing-system.md](11-spacing-system.md) §11.7, with ≥8 px separation.
5. Legal links are absent — they belong in the footer, and scroll distance is most expensive here.
   The same applies to the order-tracking link (§15.11b): it is footer content, and a panel this
   long does not get a post-purchase entry appended to it.

**Both numbers render here, unlike the header strip, and the order is fixed.**
[00-client-decisions-4.md](00-client-decisions-4.md) G1 lists the mobile menu as a both-numbers
surface, with **Іван first**. The panel is a destination the visitor deliberately opened, not
chrome they are passing through, so the cost of presenting a choice is paid willingly and the
benefit — reaching the right person first time — is real. Order carries the meaning here: the
panel has room for two rows but not for the sentence «Якщо не відповідає — телефонуйте Любові»,
which is contact-page copy ([07-page-wireframes.md](07-page-wireframes.md)). Sequence plus names is
the compressed form of the same fact, and it is the most a 56 px row can carry honestly. They are
labelled by name and followed by the availability sentence, matching the footer
([16-footer-specification.md](16-footer-specification.md) §16.5) word for word so the two never
drift. No open/closed indicator appears here either; §15.14 deletes it globally.

**No social row and no account row.** Both are absent for the reasons in the authority note, and
the panel is the surface where their absence is most conspicuous by convention — which is exactly
why it is stated rather than left to be noticed and "fixed" by a later contributor.

**Behaviour.** `translateX(100%) → 0`, `dur-slow` 340 ms, `spring.drawer`. Body scroll locked with
position preserved and restored; focus trapped; `Esc` closes; route change closes automatically.
Sized in `100dvh`, not `100vh`, so the iOS toolbar cannot clip the close bar.

## 15.16 Keyboard interaction map and focus management

**The mega-menu is a set of disclosure widgets, not a menubar.** `role="menubar"` / `role="menu"`
is the ARIA pattern for application menus; applying it to site navigation makes screen readers
announce links as menu items, suppresses the links list, and imposes a roving-tabindex model that
surprises everyone. Triggers are `<button aria-expanded aria-controls>`; panel contents are an
ordinary `<ul>` of `<a>`.

| Context | Key | Behaviour |
|---|---|---|
| Page | `Tab` | Skip link first (`z-max`), then logo, then nav triggers in visual order, then utilities |
| Nav trigger | `Enter` / `Space` | Toggle the panel; focus stays on the trigger |
| Nav trigger | `ArrowDown` | Open the panel **and** move focus to its first link |
| Nav trigger | `ArrowLeft` / `ArrowRight` | Move between triggers; if a panel is open, the new trigger's panel opens in its place |
| Nav trigger | `Esc` | Close if open; no-op otherwise |
| Inside panel | `Tab` | Moves through panel links; `Tab` from the last link closes the panel and moves to the next header control |
| Inside panel | `Shift+Tab` | From the first link, closes the panel and returns focus to its trigger |
| Inside panel | `ArrowUp` / `ArrowDown` | Move within the current column, wrapping at the ends |
| Inside panel | `Esc` | Close and return focus to the trigger |
| Anywhere | `Cmd/Ctrl+K`, `/` | Open the search overlay and focus the input |
| Search overlay | `ArrowUp`/`ArrowDown`, `Enter`, `Esc` | Combobox behaviour per §15.17 |
| Cart drawer / mobile panel | `Esc` | Close and restore focus to the trigger |

**No focus trap in the mega-menu.** A disclosure is not a modal; trapping focus strands keyboard
users who expected `Tab` to continue through the page. The cart drawer and the mobile panel *are*
modal, *are* trapped, carry `aria-modal="true"`, and mark the rest of the page `inert`.

**Hover intent, on `hover:hover` pointers only.** Open after a 120 ms intent delay, close after a
240 ms grace period. The diagonal-travel problem — the cursor cuts across a neighbouring trigger
on the way to a link — is solved with an invisible bridge element spanning the gap between bar and
panel, not by widening the close delay. A hover-opened panel never moves focus. On coarse pointers
there is no hover path at all, and because the trigger is a `<button>` there is no phantom
navigation to suppress.

`:focus-visible` ring: 2 px `--accent`, 2 px offset ([13-motion-system.md](13-motion-system.md)
§13.10), verified against the light main bar, the `--bg-surface` panel, and the inverted header
variant used over hero imagery.

## 15.17 ARIA structure

```html
<a class="skip-link" href="#main">Перейти до вмісту</a>
<header role="banner">
  <section aria-label="Оголошення"> … <button aria-label="Закрити повідомлення"> </section>
  <div>  <!-- utility strip: chrome, not a landmark -->
    <a href="tel:+380679973450">+38 067 997 34 50 · Іван</a>  <!-- primary, G1; Любов is footer/panel -->  
    <p>Графік гнучкий — телефонуйте перед візитом</p>
    <a href="/uk/opt/">Оптом</a>
    <button aria-expanded="false" aria-controls="locale-menu">Мова: Українська</button>
  </div>
  <nav aria-label="Основна навігація">
    <a href="/uk/" aria-current="page">Вівчарик — на головну</a>
    <ul>
      <li><button aria-expanded="false" aria-controls="panel-wool">Вовна</button>
          <div id="panel-wool" hidden>
            <h2 id="g-home" class="sr-only">Для дому</h2>
            <ul aria-labelledby="g-home">…</ul>
          </div></li>
      <li><button aria-expanded="false" aria-controls="panel-hide">Овчина та шкіра</button>…</li>
      <li><a href="/uk/partnerski-vyroby/">Партнерські вироби</a></li>
      <li><a href="/uk/vyrobnytstvo/">Виробництво</a></li>
      <li><a href="/uk/pro-nas/">Про нас</a></li>
    </ul>
  </nav>
  <div>
    <button aria-expanded="false" aria-controls="search-overlay">Пошук</button>
    <a href="/uk/obrane/">Обране, 3 товари, збережено на цьому пристрої</a>
    <button aria-expanded="false" aria-controls="cart-drawer">Кошик, 2 товари</button>
    <!-- no account control: guest checkout is permanent (E12) -->
  </div>
</header>
<div id="search-overlay" role="dialog" aria-modal="true" aria-label="Пошук по сайту">
  <input role="combobox" aria-expanded="true" aria-controls="search-results"
         aria-activedescendant="result-3" autocomplete="off">
  <ul id="search-results" role="listbox"><li role="option" id="result-3">…</ul>
  <p aria-live="polite" class="sr-only">Знайдено 34 результати</p>
</div>
```

Rules that are easy to get wrong, and are therefore stated: `aria-expanded` lives on the
**trigger**, never on the panel; closed panels use the `hidden` attribute so their links leave
both the tab order and the accessibility tree (`opacity: 0` alone is the standard defect); panel
sub-headings are real headings associated to their list via `aria-labelledby`, so a screen-reader
user hears the same three-group structure a sighted user sees; `aria-current="page"` marks the
matching top-level item and `aria-current="true"` the matching category link; counts live in the
accessible name of the control, not in a separate `aria-live` badge firing on every render; and
there is exactly one `<nav aria-label>` per navigation region, the footer's being labelled
differently ([16-footer-specification.md](16-footer-specification.md) §16.3).

## 15.18 Motion specification

Every value is a token from [13-motion-system.md](13-motion-system.md). Nothing in the header uses
the narrative clock — everything here is directly user-caused, so it is interaction-clock
territory throughout.

| Interaction | Property | Duration | Easing | Reduced motion |
|---|---|---|---|---|
| Header condense | `translateY` on wrapper | `dur-base` 220 | `ease.gentle` | Instant, no transition |
| Condensed shadow | `opacity` of a shadow pseudo-element | `dur-instant` 80 | linear | Instant |
| Mega-menu open | `opacity` 0→1, `translateY` −8→0 | `dur-base` 220 | `ease.out` | Fade only, 120 ms |
| Mega-menu close | `opacity` 1→0 | `dur-fast` 140 | `ease.in` | Instant |
| Panel swap while open | Cross-fade of contents; container does not re-animate | `dur-fast` 140 | `ease.inOut` | Instant swap |
| Nav link hover | Underline `scaleX` 0→1 from left | `dur-base` 220 | `ease.gentle` | Static underline, no growth |
| Search overlay in | `opacity` + `translateY` −12→0, scrim `opacity` | `dur-base` 220 | `ease.out` | Fade only, 120 ms |
| Cart drawer | `translateX` 100%→0 | `dur-slow` 340 | `spring.drawer` | Fade only, 150 ms |
| Mobile panel | `translateX` 100%→0 | `dur-slow` 340 | `spring.drawer` | Fade only, 150 ms |
| Mobile accordion | `grid-template-rows` 0fr→1fr, chevron `rotate` 180° | `dur-base` 220 | `ease.gentle` | Instant open, chevron static |
| Cart badge on add | Count-up then `scale` 1→1.15→1 | 260 total | `spring.card` | Number updates, no scale |
| Wishlist toggle | Heart outline→fill, `scale` pulse 1.15 | 260 | `spring.card` | Fill swaps, no pulse |
| Wishlist badge on hydration | `opacity` 0→1 only — it cannot be server-rendered (§15.11) | `dur-fast` 140 | `ease.out` | Appears instantly |
| Locale menu | `opacity` + `translateY` −6→0 | `dur-base` 220 | `ease.gentle` | Fade only |
| Announcement dismiss | `opacity` 1→0, then removed from flow | `dur-fast` 140 | `ease.in` | Removed instantly |
| Header shepherd mark | **None.** Static at all times | — | — | — |

Constraints inherited from §13.5: only `transform`, `opacity` and `clip-path` animate;
`will-change` is set on interaction start and removed on completion; the header never contributes
to CLS; and panel contents are **not** staggered — a 60 ms stagger across twelve links takes
720 ms to finish, which is the narrative clock applied to an interaction, and it feels broken.

## 15.19 Rendering and performance

The header is server-rendered in full, including the announcement bar and the resolved nav
projection, so it is present in the first paint and in view-source. On a new domain with no crawl
history this is not a nicety: the header's internal links are the primary discovery path for every
category page the site has. Panel markup is server-rendered and `hidden`, and panel images are
`loading="lazy"` — correct, because they are not visible above the fold.

No Framer Motion on the critical path: condensation, nav hover and the announcement bar are CSS
transitions, and Framer Motion enters only for the cart drawer and mobile panel, lazy-loaded on
first open inside the ≤34 KB budget in §13.5. Cart count is hydrated from the `Cart.token` cookie
server-side, so the badge never flashes 0 → N.

**Two Round-2 simplifications land here.** Deleting the open/closed pill (§15.14) removes the
header's only time-dependent value, which removes the hourly revalidation and lets the header
stay in a fully static render. Deleting customer accounts (E12) removes the only per-visitor
authenticated state the header would have carried, so nothing in the header varies by identity —
only the cart cookie and the hydrated wishlist count, both of which are already handled. The
practical result is that the header is cacheable per `(locale, route)` with no user dimension at
all, which is the cheapest possible shape for the one component on every page.

The wishlist count is the single exception to "no hydration flash": it lives in `localStorage`
and the server cannot know it. It is handled by rendering no badge at all until hydration and
fading it in (§15.18) rather than by rendering a zero that corrects itself — a badge that
flickers 0 → 3 is read as a bug, whereas a badge that arrives late is read as a badge.

## 15.20 Open items

### Closed by Round 2

| Token / question | Resolution | Reference |
|---|---|---|
| `{{ACCOUNTS_DECISION}}` | **Guest checkout, permanently.** No account control in the header; the wishlist is `localStorage`-only | E12, §15.11, §15.11b |
| `{{PARTNER_NAMES}}` | **Never rendered.** The nav description uses «Відібрано Вівчариком» + `partnerRegion` | E7, §15.6 |
| Header phone numbers | **+38 067 960 47 69 (Любов)** in the strip; both numbers in the mobile panel and the footer. **Reversed by Round 4** — see below | E3, §15.14 |
| Open/closed status pill | **Deleted.** Hours are variable and are not published | E3, §15.14 |
| Logo descriptor | **«Вовна з Яворова»**, replacing «Карпатська фабрика». **Superseded by Round 3** — see below | E2, §15.5 |
| `de` sheepskin/leather decision | **Wool-only recommended for `de` and `pl`** on species-declaration grounds. «Овчина та шкіра» is suppressed at the locale level under both | E11, §15.12 |
| `{{SKU_COUNT}}` | **Several hundred to roughly a thousand**, following the catalogue import. That range sits inside Postgres full-text's comfortable envelope, so instant search ships on Postgres and a dedicated search engine is **not** a launch dependency. Re-evaluate only if the confirmed export exceeds ~2,000 rows or if `SearchQueryLog` shows latency above the 220 ms debounce | E5, §15.9 |
| Social icons in the header | **None exist and none may be added.** The reserve slot, if Instagram is ever created, is in the footer | E3, [16](16-footer-specification.md) §16.7 |

### Closed by Round 3

| Token / question | Resolution | Reference |
|---|---|---|
| Logo descriptor, final | **«Вовна з Карпат».** The Round-2 «Вовна з Яворова» is withdrawn; the grammatical improvement it made is kept and the place-name reverts | F6, §15.5 |
| Яворів in the header at all | **Once, in the mega-menu featured caption**, behind a deliberate interaction. Nowhere in persistent chrome | F6, §15.7 |
| Announcement pickup line | **«Магазин у Яворові»**, not «Самовивіз у Косові». Wrong village, and the site is a shop, not only a collection point | F2, §15.4 |
| Free shipping abroad | **Never applies.** `{{FREE_SHIPPING_THRESHOLD}}` is `uk`-only; no threshold banner is authored for `de`, `pl` or `en` | F4, §15.4 |

### Closed by Rounds 4 and 5

| Token / question | Resolution | Reference |
|---|---|---|
| Header phone number, **final** | **+38 067 997 34 50 (Іван), alone.** The Round-2 choice of Любов is reversed. Both numbers render in the mobile panel and the footer, Іван first | G1, §15.14, §15.15 |
| Who conducts a workshop visit, and how it is arranged | **Іван, by phone, in advance.** The header `tel:` link is the whole mechanism. **No booking widget at any breakpoint** | G3, §15.1, §15.14 |
| `{{MADE_TO_ORDER_DAYS}}` in chrome | **14, production only.** The bar may reinforce it seasonally; it may never state a total delivery time. The fact lives in the buy box | G2, §15.4 |
| What a locale switch does to payment | Removes COD-with-inspection and the return deposit — **Ukraine-only**, the deposit for an EU legal reason rather than an operational one | H1.2, H1.3, §15.12 |
| Custom sizing in the header | **Nothing.** `Product.allowsCustomSize` is a per-product PDP concern; the header does not gain a facet link, a badge or a filter shortcut for it | H3b, H3c |

### Still open

| Token / question | Blocks | Reference |
|---|---|---|
| `{{DOMAIN}}` | Locale routing, canonical URLs, the lockup's final artwork | E9 |
| `BannerTranslation` model | The announcement bar cannot be built | §15.4 |
| `{{FREE_SHIPPING_THRESHOLD}}` | The launch announcement copy, **for `uk` only** (F4). The 30,000 UAH figure belongs to the adjacent business and does not carry over | audit §0.6, demoted; F4 |
| `{{DROPSHIP_OFFERED}}` | The wholesale label. If true, E7 restricts the offer to own manufacture | §15.13 |
| Which number carries Viber, if either | Whether a Viber control renders at all. Note that after G1 the candidate to check **first** is Іван's, since that is the number in chrome | §15.14 |
| Confirmation of the `de`/`pl` wool-only scope | Whether the locale-level suppression in §15.12 ships at launch or is deferred | E11 |
| Short-form category labels per locale | The `md` main bar | §15.3 |
