# Client Decisions — Round 11 (motion and interaction interview)

Started 2026-09-30. **Highest-authority document in the blueprint** for motion and interaction.
The existing system in [13-motion-system.md](13-motion-system.md) and
[34-animation-storyboard.md](34-animation-storyboard.md) — the two clocks (interaction 80–220 ms,
narrative 450–900 ms), the duration and easing tokens, the five-pattern vocabulary, the
performance contract and reduced-motion rules — stands. This round decides character and the
places rounds 9–10 changed. The consolidated audit, motion system and interaction map follow
the last block; no code before then.

---

## Block 1 — character, first screen, header, buttons

| # | Question | Answer | Consequence |
|---|---|---|---|
| 01 | Overall character | **B — craft-warm**: more living detail — thread, wool, flock | The **wool thread becomes the signature motif** (answers 04, 05, 13, and the production path): one recurring, recognisable movement instead of many unrelated effects |
| 02 | Words | **Преміальний, ремісничий, природний, теплий** | Tie-breaker for every later choice: warm and natural over technological or cinematic |
| 03 | Hero liveliness | Mountains shift slightly on scroll (parallax), fog between the ridges, the flock follows the cursor and the sheep turn their heads to it | Parallax on the photo layers (≤ 120 px travel, 0.82× rule of §13.4); fog per §13.7; wool particles **not** used. Phones and low-power devices: no parallax, no fog, ~8 sheep (§13.7 guard) |
| 04 | Hero text entrance | **D — a thread writes the name** «Вівчарик» | The real `<h1>` text is in the HTML from the first byte (SEO, screen readers); the thread is an SVG overlay that draws, then hands over to the text. The hero photograph stays the LCP element and is never animated in |
| 05 | First-visit loader | **A — keep** | Merged with answer 04 into **one** sequence, so the thread is not shown twice: first visit — the thread forms the ram mark, then continues and writes «Вівчарик»; later visits — only the name is written. Hard cap 1.4 s; skipped when the page is ready sooner (§13.9) |
| 06 | Idle flock | **A — grazing**: heads down, the odd step, the shepherd walks | Loop paused off-screen and on hidden tabs |
| 07 | Following the cursor | **B — noticeable**: the flock clearly drifts after the cursor | `spring.sheep` (§13.3); on touch, toward the last tap; off under reduced motion |
| 08 | Cursor | **B — native cursor + contextual hints** | Native arrow everywhere; over the PDP photo a «лупа» cue, over video a «play» cue. No custom cursor follower |
| 09 | Header on scroll | **B — a thin shadow appears** after scrolling | Height and logo size never change |
| 10 | Mega menu | **A — slides down, category photos appear in sequence** | `dur-base`, stagger 40 ms, ≤ 6 items |
| 11 | Primary button | **B — premium**: smooth colour change, the arrow moves forward | Arrow icon added to primary CTAs that navigate; `dur-instant` colour, `dur-base` arrow 4 px |
| 12 | Secondary button | **A — fills with colour** from the bottom | Text colour inverts at the same moment for contrast |
| 13 | While an important action runs | **C — a wool thread runs through the button** | The label also changes to «Зачекайте…» and the button gets `aria-busy` — the thread alone would not tell an older buyer or a screen reader what is happening |
| 14 | Reference sites | None known | — |

---

## Block 2 — cards, catalogue, filters, search

| # | Question | Answer | Consequence |
|---|---|---|---|
| 15 | Second photo on hover | **A — cross-fade** | `dur-base`; desktop pointer devices only |
| 16 | Card on hover | **B — lifts 4 px with a soft shadow** | The Lift pattern of §13.4 minus the inner-image scale (the photo is already changing) |
| 17 | Wishlist heart | **A — always visible** | |
| 18 | Heart tap | **A — fills with a light pulse** | §13.10 as specified |
| 19 | Badges | **A — static** | |
| 20 | Category circles | **B — a thread draws around the circle** | Signature motif; `dur-reveal` stroke draw on hover and on keyboard focus |
| 21 | After «Показати N товарів» | **A — old items fade out, new ones rise in sequence** | Exit 120 ms, Rise with 60 ms stagger capped at 6; scroll position kept at the top of the results |
| 22 | Count on the apply button | **A — digits roll softly** | Allowed: a filter count is not a price or a stock figure (§13.11 still forbids those) |
| 23 | After «Показати ще» | **A — new cards rise in sequence** | The page does not jump; focus moves to the first new card for keyboard users |
| 24 | Skeleton | **B — cream blocks with a thread running across** | Shown only if loading exceeds 400 ms; static under reduced motion |
| 25 | Phone filters | **A — full-screen sheet from the bottom** | `dur-slow`, drag-down to close |
| 26 | Search | **A — field expands from the header icon**, suggestions below | |
| 27 | Mascot on an empty result | **B — the shepherd searches for a sheep with a lantern** | A short scene (~2 s) played once, then a resting pose; a still frame under reduced motion |
| 28 | Out-of-stock cards on hover | **A — no reaction** | |

---

## Block 3 — product page, add to cart, cart

| # | Question | Answer | Consequence |
|---|---|---|---|
| 29 | Thumbnail switch | **A — cross-fade** | `dur-base` |
| 30 | Phone swipe | **A — follows the finger and snaps** | Native scroll-snap, no JS physics |
| 31 | Hover zoom | **A — zooms in place under the cursor** | Frame size fixed; transform-origin follows the pointer; the «лупа» cursor hint (block 1, 08) |
| 32 | Full-screen photo | **A — grows out of its place** | The Morph pattern (§13.4) |
| 33 | Colour change | **A — photos cross-fade**, the swatch ring draws | |
| 34 | Price on size change | **A — changes instantly with a brief highlight** | 600 ms background tint fading out; the number itself never animates |
| 35 | Custom-size price | **A — updates after a pause in typing** | 400 ms debounce, then the same highlight as 34; `aria-live="polite"` announces the new price |
| 36 | Add to cart | **B — the product photo flies to the cart** | See §B3a |
| 37 | Cart badge | **A — the icon bounces lightly, the digit changes** | ≤ 4% overshoot, per §13.3 |
| 38 | Remove from cart | **A — the row collapses + «Повернути» for 5 s** | Undo restores the line and the reservation if still valid |
| 39 | Empty cart mascot | **A — a sheep peers into the empty basket, the shepherd shrugs** | Plays once, then rests; still frame under reduced motion |
| 40 | «Купити в 1 клік» form | **A — small centred dialog**; bottom sheet on phones | |
| 41 | Sticky buy bar on phones | **A — slides up once the main button scrolls out of view** | Replaces the bottom navigation bar while visible (round 10 part 4) |
| 42 | Size calculator | **A — centred dialog**; bottom sheet on phones | |

### B3a Flying photo, then the drawer

The sequence on desktop: the button label becomes «✓ Додано» at once → a copy of the product
photo flies along a soft arc to the header cart icon (≈ 500 ms, `ease.inOut`) → the badge bounces
and changes → the drawer slides in. The label change and an `aria-live` announcement «Додано в
кошик» happen **first**, so confirmation never waits for the animation.

Two cases where the flight is replaced by the label change and the drawer alone:
- **Phones**: the cart lives in the bottom bar, and on the product page that bar is replaced by
  the sticky buy bar — the flight would have nowhere visible to land.
- **Reduced motion**: no flight.

---

## Block 4 — checkout, forms, messages, dialogs, page transitions

| # | Question | Answer | Consequence |
|---|---|---|---|
| 43 | Field labels | **A — always above the field** | No floating labels anywhere |
| 44 | Focused field | **A — border darkens + soft green glow** | §13.10 as specified |
| 45 | When errors show | **A — on leaving the field** | Then re-validated as the user types, so a fixed error clears immediately; errors appear without motion (§13.11) |
| 46 | Valid field | **A — small green check** | Only on fields with a real rule (phone, email, city); not on optional free text |
| 47 | Option cards (delivery, payment) | **A — border and background change smoothly** | `dur-base` |
| 48 | «Є промокод?» | **A — expands smoothly**; the discount line appears highlighted | Accordion technique of §13.10 |
| 49 | Thank-you page | **B — the shepherd waves, the sheep hop with joy** | Sheep hops use the mascot's permitted soft overshoot (§13.3); plays once |
| 50 | Payment failed | **A — a clear message, no motion** | |
| 51 | Toasts | **A — bottom centre**, above the bottom bar on phones | |
| 52 | Dialogs | **A — fade in with a slight scale-up**, backdrop dims | Scale 0.96 → 1, `dur-slow`; bottom sheet on phones |
| 53 | Page transitions | **B — a thread stitches across the screen** | See §B4a |
| 54 | Card → product page | **A — the card photo flies to the product page** | Morph pattern; takes precedence over 53 on that route |

### B4a The stitching thread — where it runs, and where it does not

The thread crosses the viewport once as the old page fades and the new one rises (≤ 450 ms in
total). It never waits for data: if the next page is ready, the stitch finishes over it; if it is
not, the stitch runs once and the 2 px progress bar of §13.9 takes over.

It is **not** used:
- **card → product page**, where the photo morph (54) carries the transition;
- **inside checkout and payment**, where §13.11 limits motion to a simple cross-fade;
- **in the admin panel**;
- under **reduced motion** (a 150 ms cross-fade instead, §13.6).

---

## Block 5 — scroll, images, headings, video

| # | Question | Answer | Consequence |
|---|---|---|---|
| 55 | Large photos on scroll | **A — mask (curtain) reveal** | The Mask pattern of §13.4, once per image |
| 56 | «Від сирої вовни до виробу» path | **A — the thread follows the scroll** | Scroll-linked `stroke-dashoffset`, reversible, **no scroll-jacking** (the page scrolls normally; the thread only reflects position). Drawn fully under reduced motion |
| 57 | Production page | **A — pinned media, stages change on scroll** | Desktop and tablet; phones decided in block 6 |
| 58 | Stage clips | **A — autoplay muted while visible**, pause when scrolled away | Poster frame first; `preload="none"` until near the viewport; phones in block 6 |
| 59 | Parallax elsewhere | **A — nowhere else** | Hero mountains only |
| 60 | Section headings | **A — rise as a whole** | Rise pattern |
| 61 | «30+ років» | **A — static number, thread drawn underneath** | |
| 62 | Ornament dividers | Skipped — default **A: drawn by the thread when they enter the view** | Once each; static under reduced motion |
| 63 | Image loading | **A — blurred preview sharpens** | Blurhash cross-fade, 300 ms (§13.9) |
| 64 | Video reviews | **A — play on tap**, with sound | |
| 65 | Collections | **A — three cards in a row** | Stacked on phones |
| 66 | Back-to-top | **A — appears after two screens** of scrolling | Fades in |

---

## Block 6 — phones, accessibility, admin

| # | Question | Answer | Consequence |
|---|---|---|---|
| 67 | Tap on a phone button | **A — darkens and presses in** | `:active` scale 0.98 + tint, `dur-fast`; no ripple |
| 68 | ☰ menu | **A — slides in from the left, categories appear in sequence** | `dur-slow`, stagger 40 ms |
| 69 | ☰ icon | **A — morphs into ×** | `dur-base` |
| 70 | Bottom bar on scroll | **A — always visible** | Except where the sticky buy bar replaces it on the product page |
| 71 | Production page on phones | **A — stages stacked, each with its own clip** | No pinning on phones |
| 72 | Clips on phones | **A — autoplay only on Wi-Fi and without Data Saver**; otherwise poster + «Грати» | `navigator.connection` where available; poster + play when unknown |
| 73 | Vibration on add to cart | **B — no** | |
| 74 | Swipe to close drawer, sheets, dialogs | **A — yes**, plus the × button always | |
| 75 | Reduced motion | **A — the system setting only** | `prefers-reduced-motion`, per §13.6 |
| 76 | Hero sound | **A — off on every visit** | Not remembered |
| 77 | Keyboard focus | **A — clear green ring with offset** | 2 px `--accent`-family ring, 2 px offset (§13.10), never removed |
| 78 | Admin motion | **A — minimal and fast** | §13.11 stands |
| 79 | New order while the panel is open | **A — the card slides in at the top, highlighted, with a quiet sound** | Sound only after the user has interacted with the page once (browsers block audio before that); a mute switch in Settings |
| 80 | A heavy effect on a weak phone | **A — speed wins; the effect switches off** | The runtime degradation ladder in [36-motion-interaction-system.md](36-motion-interaction-system.md) §36.5 |

**Interview closed.** Consolidated into [36-motion-interaction-system.md](36-motion-interaction-system.md):
audit, motion system, interaction map, priorities.

---

## Art direction — more illustrative (2026-09-30)

| Decision | Detail |
|---|---|
| **Footer = variant Б, «Вечір у горах»** | Peach sky, low sun/moon, terracotta and violet ridges, dark grass silhouettes with arnica, bellflower and white flowers rising into the `forest-900` footer. Footer text stays on the dark ground |
| **Hill transitions between sections** | On the homepage and the about page: each section's top edge is a soft hill in the colour of the section above (the first one in meadow green, continuing the hero). Decorative SVG behind the content (`z-index: -1` inside an isolated section, `pointer-events: none`), so **buttons in the hill zone stay clickable and visible**. Shop pages (catalogue, product, checkout) keep the quiet thread divider |
| **Page background = warm peach `#F4D9B8`** (trial) | Replaces white and `fleece-100` as the page and header background on the storefront; cream `#F2EDE3` sections alternate with it. White stays only for component surfaces (filter panel, form cards, dialogs). Admin unchanged |
| **Contrast consequence** | `stone-500` (#7B776E) falls to ≈ 3.3 : 1 on peach — below the 4.5 : 1 needed for small text. On peach, secondary and caption text use `stone-600` (#5E5B54, ≈ 5 : 1) |
| **Palette additions** | Лука #8DB580, Трава #4E9A6A, Арніка #E0B33A, Дзвоник #6C7FC4, Захід #C77D58, Сутінки #6B4E71, Персиковий фон #F4D9B8 — decorative and background use; text colours unchanged |

Marked a **trial** at the client's word («хочу спробувати»): it is applied to the canvas mock-ups
and recorded here; [09-color-palette.md](09-color-palette.md) is changed only once the client
confirms it after seeing the pages.

**Approved 2026-09-30:** «Вау, дуже круто, тоді зберігаєм» — the detailed layered Carpathian
landscape (four ridges with atmospheric depth and slope shading, spruce forests, fog bands,
sky with sun and clouds, meadow) in the hero, and the ridged dusk mountains in the footer.

---

## Uniqueness — details that keep the site from looking templated

| # | Question | Answer | Consequence |
|---|---|---|---|
| U11 | Scroll-progress thread | **No** | Not built |
| U12 | Seasonal site | **The footer changes too**: snow in winter, yellow grass in autumn | Four footer states switched by date with the hero photograph and the mascot: winter (snow on the ridges and grass tips, no flowers), spring (fresh green, many flowers), summer (as approved), autumn (ochre grass, few flowers). One SVG, colour tokens per season — no extra download |
| U13 | Easter eggs | **Click a sheep and it bleats** | Sound only if the hero sound is switched on (off by default, block 6 answer 76); otherwise the sheep gives a silent little hop. Keyboard-reachable is not required — decorative, `aria-hidden` |
| U14 | Voice of the copy | **Warm, with Hutsul words** («полонина», «ґазда», «ліжник») | Each regional word carries a short explanation on first use (a tooltip on desktop, a tap-to-reveal on phones); `pl`/`en`/`de` keep the word and explain it. Clarity for the 60–75 reader is never traded away |
| U1–U10 | Background, texture, category art, icons, badges, photo frames, headings, handwritten notes, product story, map | Not received in the reply — asked again | — |
| U1 | Peach background | **A — approved** | `#F4D9B8` becomes the storefront page background in [09-color-palette.md](09-color-palette.md) (trial status removed) |
| U2 | Background texture | **A — barely visible wool/linen weave** | A fine two-direction weave at ≤ 4% opacity over page and section backgrounds; never under body text blocks of cards and forms (white surfaces stay flat) |
| U3 | Category circles | **B — illustrations in the shepherd's style** | Ліжник stack, yarn ball with needles, sheepskin, socks — same ink line and palette as the mascot |
| U4 | Trust icons | **B — small illustrations in the mascot's style** | Колиба (own production), tape measure over a blanket (custom size), star with a ribbon (Google rating); «30+» stays typographic |
| U5 | Badges | **B — sewn-on labels** | Fabric-coloured tag with a dashed «stitch» inset |
| U6 | Product photo frames | **B — a thin stitch line inside the edge** | Dashed inset line, 8 px in from the edge; photos keep rounded corners |
| U7 | Section headings | **B — a small Hutsul rhombus before the heading** | Red-and-gold rhombus from the ornament subset (§12.7) |
| U8 | Handwritten notes from Іван | **B — no** | Not built |
| U9 | «Історія виробу» | **A — yes, a card with the stages** | On every own-manufacture product page: material → the stages it actually passed (round 9 §F1) → «Яворів». Never called a certificate. Partner goods get no card |
| U10 | Map | **B — an illustrated map of Яворів** | Hills, road toward Косів, the workshop pin, the Музей ліжникарства pin; a button opens Google Maps. Replaces the static Google image, so no Google request happens until the button is pressed |

---

## Wordmark, announcement strip, map (2026-09-30)

| Decision | Detail |
|---|---|
| **Wordmark font: Marck Script** | «Вівчарик» in title case, set in Marck Script (Google Fonts, Cyrillic) — header lockup beside the ram, hero H1, footer. **Wordmark only**: headings and body stay `e-Ukraine Head` / `e-Ukraine` (round 9), because a script face is not legible enough for the 60–75 reader at text sizes. It also suits the hero's thread «writing» the name (block 1, answer 04). A custom lettering by the illustrator may replace it later |
| **Announcement strip: slow ticker** | Messages separated by gold rhombi: «Відправляємо по Україні за 2–4 дні», «Огляд перед оплатою на пошті», «Понад 30 років виробляємо вовняні вироби в Карпатах», «Зроблено в Яворові»; the seasonal message joins the loop when active. ~40 px/s, pauses on hover and focus, **a visible pause button** (moving content longer than 5 s must be stoppable — WCAG 2.2.2), close ×; static first message under reduced motion; screen readers get the list once, not the duplicated loop |
| ~~Map: illustrated scheme~~ | **Withdrawn the same day** — replaced by the decision below |

### Map — Google Maps with the pin

> «Просто встав там Google Maps, намальовану мапу прибери, лиши тільки мапу Google Maps з точкою.»

The illustrated map (U10) is removed. The block shows an **embedded Google Map with the pin of the
business's Google Business Profile** (Maps Embed by place, so the pin, name and reviews link match
GBP). Consent is unchanged: the embed sets Google cookies, so it loads once the visitor has
accepted cookies, and otherwise shows a static preview with «Показати карту» that loads it on
tap — required on `pl`/`de`, applied everywhere for one behaviour. «Прокласти маршрут» stays
beside it.

**Revised the same day — «зроби її в стилі сайту та більш детально».** The plain Google embed
cannot be restyled, so the map uses the **Google Maps JavaScript API with a custom map style**
instead of the iframe embed: peach land, soft green woods and fields, muted blue water, cream
streets with a golden main road, muted labels. On top of Google's live map:

- a **custom pin** in `forest-800` with a peach disc and the sheep, at the GBP location;
- an **info card** in the site style (stitched inset, «Вівчарик» in Marck Script, address, the
  Google rating, «Google Maps →»);
- **zoom buttons** restyled to the site's controls; Google's attribution kept, as its terms
  require.

Requirements this adds: a Maps JavaScript API key restricted to the site's domain, a Map ID
with the style, and Google Cloud billing enabled (the monthly free usage covers a site of this
size, but Google requires billing on the account). The consent rule is unchanged: nothing from
Google loads before cookies are accepted or «Показати карту» is pressed; until then a static
image of the same styled map is shown.

**Announcement strip removed** — «взагалі видали цю полоску, вона дивиться не преміально».
There is no strip above the header on any page. Consequences:
- the dispatch time («Відправляємо за 2–4 дні після замовлення») is stated on the delivery page
  and in checkout, where the buyer needs it;
- the seasonal message (round 10 part 2, answer 25) loses its slot: when a season or promotion
  is active it appears as a small label under the hero buttons, managed in the admin like the
  banner it replaces; with nothing active, nothing is shown.

**Floating buttons made visible on every background.** The back-to-top button was white with a
thin grey border and disappeared on peach and cream sections. Both floating buttons (back-to-top,
messengers) are now `forest-800` circles with a light arrow/icon, a 2 px `fleece-100` ring and a
soft shadow — dark enough on peach and cream, and the light ring keeps them visible over the dark
footer.

**Collection cards rotate their photographs** — «хай міняють фото раз в 2,5–3 секунди».

| Rule | Value |
|---|---|
| Interval | ≈ 2.8 s per card |
| Stagger | The three cards change one after another (≈ 0.9 s apart), never all at once |
| Transition | **Drift + dissolve**: each photo slowly zooms in by 5% while shown, changes with a 700 ms dissolve — chosen and specified in [36-motion-interaction-system.md](36-motion-interaction-system.md) §36.3.5 |
| Photos | 3–5 per collection, chosen in the admin (§23.12); only the next photo is preloaded |
| Indicator | Small dots in the corner show which photo is on screen |
| Pauses | On hover and keyboard focus of that card; when the section is off-screen; on a hidden tab |
| Reduced motion | No rotation — the first photo stays |
| Accessibility | Decorative change of the same subject: one `alt` per card describing the collection; the rotation is not announced |

**Phone hero buttons made compact.** Two full-width stacked buttons covered the landscape and read
as a form. On phones: «Переглянути каталог» is a centred pill sized to its label (with the arrow of
block 1, answer 11) and a soft shadow; «Як ми виробляємо» is a compact outlined pill beneath it
(light fill, 2 px dark border, arrow). *An underlined text link was tried and rejected by the
client the same day: a transparent control does not read as a button to older buyers.* Desktop keeps two buttons side
by side.

---

**Mock-ups approved as a whole — «все, макет ідеальний» (2026-09-30).** The canvas
[Вівчарик — макети](https://claude.ai/artifact/7eMmi9QbGYFH4CarbYuaBP) is the visual reference for
the build.

**Superseded by round 13 N7 (no paid services):** the map is shown as a static image of the styled map with «Відкрити в Google Maps», not the Maps JavaScript API — same look, no billing account.
