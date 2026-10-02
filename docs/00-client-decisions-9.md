# Client Decisions — Round 9 (questionnaire)

Received 2026-09-30 through a five-part questionnaire. Superseded where it differs by
[00-client-decisions-10.md](00-client-decisions-10.md). **Propagated** on 2026-09-30: canonical changes in [10-typography.md](10-typography.md),
[25-database-schema.md](25-database-schema.md) §25.8d and [26-api-architecture.md](26-api-architecture.md);
every other affected document carries a «Round 9» banner under its title listing what this round
supersedes there.

```
00-client-decisions-9.md    ← this file
00-client-decisions-8.md
…
```

---

## Part 1 — impression, colour, type, logo, photography

| # | Question | Answer | Blueprint impact |
|---|---|---|---|
| 1 | Mood | Skipped; answer 2 settles it | — |
| 2 | Three words | «luxury brand, дорогий, зрозумілий для старшого покоління, handmade craft, wow» | Shifts the register **toward boutique** from "middle, leaning boutique". The 25–75 legibility requirement stands and is now explicitly the client's |
| 3 | Liked sites | `karpatu.shop` — brand, design style, artistic look, clarity | Reference to review in [01-brand-strategy.md](01-brand-strategy.md) |
| 4 | Disliked sites | `karpathia.com.ua` — template look, poor conversion. `suvenirkarpat.com.ua` — generic shop, no brand, unclear what to do, duplicated categories, badly placed blocks | Anti-references. Confirms the IA decisions in [03-information-architecture.md](03-information-architecture.md): one category per product family, no duplicates |
| 5 | First five seconds | The brand, the atmosphere of production and sheep — «наприклад побачити прикольну анімацію на сайті як пастух пасе овець» | **Changes the hero.** The mascot was excluded from the hero; the client wants a shepherd-and-sheep animation there. See §P1.1 |
| 6 | Audience | Buyers in Ukraine first | `uk` is primary; `en`/`pl`/`de` stay but are secondary in effort and launch order |
| 7 | Typical buyer | Unknown | `{{AUDIENCE_MIX}}` stays open; measured post-launch |
| 8 | Sells most now | Ліжники, пледи, шкарпетки, пряжа, овчина | Best-seller defaults |
| 9 | Wants to sell more | **Пряжа, овчина, опт** | Yarn and sheepskin get more homepage and navigation weight than the wool-textile-first ordering assumed. Yarn is by-weight (D4) |
| 10 | Advantage | Own production, clean process, quality of sheep yarn and wool | Confirms §1.2 positioning |
| 11 | Homepage priority | Balance: production first, then products | Current S1–S11 order confirmed |
| 12 | Palette | **Forest green and wool white — confirmed** | [09-color-palette.md](09-color-palette.md) unchanged |
| 13 | Colours to avoid | Anything outside the style; no overload | Confirms the restraint rules |
| 14 | Dark theme for buyers | Not needed | Unchanged |
| 15 | Heading font | **Modern sans-serif** | **Changes [10-typography.md](10-typography.md)**: the serif display face is replaced. See §P1.2 |
| 16 | Ornament | Thin, as dividers — confirmed | Unchanged |
| 17 | Logo | Exists — sent as a file | Saved as [assets/logo-draft-ram.webp](assets/logo-draft-ram.webp). See §P1.3 |
| 18 | Logo form | Word and the mark side by side | Horizontal lockup |
| 19 | Photography | Light, airy | Consistent with the light-only site |
| 20 | People in photos | **Model wearing the product; products alone** | Masters and the family are not in the photographs. Conflicts with the production and about pages — see §P1.4 |

### P1.1 The hero gets an animated shepherd and sheep

[01-brand-strategy.md](01-brand-strategy.md) §1.7 kept the mascot out of the hero and off every
money page. The client now wants a shepherd herding sheep as the first thing a visitor sees. That
is the client's call and it is compatible with the premium register **if the drawing stays a
drawn mark** — ink line, one colour, calm motion — rather than a cartoon. Constraints that follow:

- The animation is SVG or a lightweight vector animation, not video; it must not become the
  Largest Contentful Paint element or push the page past the §6.9 budget.
- `prefers-reduced-motion` shows a still frame.
- The PDP, cart, checkout and wholesale page exclusion stands unless part 2 says otherwise.

### P1.2 Headings move to a sans-serif

`--font-display` changes from the serif to a sans-serif. The candidate to verify is a Ukrainian
sans with full Polish and German coverage, checked under the existing V1 proof-sheet gate
(B4). Body stays `e-Ukraine`. Italic and serif accents may survive for editorial quotes only, to
be decided in propagation.

### P1.3 The logo drawing

A detailed line drawing of a **ram with spiral horns standing on a rock ledge**, set against a
tilted double-line rectangle, with rock fragments falling from the ledge.

For propagation — these are design points, not objections:

1. **It is a ram, not a shepherd.** «Вівчарик» means *little shepherd*. The D2 mandate is
   "sheep / shepherd identity", so a ram satisfies it; the brand story then reads «the
   shepherd's ram». Part 2 settles who the animated mascot is.
2. **It is too detailed for small sizes.** Fur strokes and horn ridges fill in below about
   48 px. The system needs a simplified mark for the favicon, app icon, admin sidebar and
   footer, derived from the same silhouette.
3. **The falling rock fragments read as instability** — the ledge is breaking under the animal.
   For a brand selling 30 years of reliability, a solid ledge may say more. Client to decide.
4. **Rights.** Whoever drew it must transfer the rights in writing before it becomes a
   trademark-bearing logo. Part 2 asks where it came from.
5. Line weights vary, where [01-brand-strategy.md](01-brand-strategy.md) §1.7 specified a
   single-weight line. The client's drawing wins; §1.7 is revised in propagation.

### P1.4 People in photographs versus the production story

The production page, the about page and the video the project lead will shoot
([00-client-decisions-8.md](00-client-decisions-8.md) §L10) all show people working. Answer 20
excludes masters and the family from the *photography*. To confirm in part 2: are **hands at
work** acceptable in video and stills, with faces kept out?

---

## Part 2 — logo, mascot, animation, homepage

| # | Question | Answer | Blueprint impact |
|---|---|---|---|
| 1 | Origin of the ram drawing | Drawn by the client's side or an acquaintance | **A written rights assignment is needed from whoever drew it** before it is used as a logo or registered as a mark |
| 2 | Falling rock fragments | **Keep** — it is dynamism | P1.3 point 3 closed |
| 3 | Simplified small mark | **Yes** | Favicon, app icon, admin sidebar and footer use a simplified ram silhouette |
| 4 | Main mascot | **Shepherd and sheep.** The ram stays the logo | Two roles: ram = logo, shepherd with flock = animated mascot |
| 5 | Hero animation | **Animation over a photograph of the mountains** | Hero = mountain photograph (the LCP element, optimised) + SVG line animation layer on top |
| 6 | Sheep react to the pointer | **Sheep follow the cursor** | On touch devices there is no cursor: sheep walk toward the last tap point. Off under `prefers-reduced-motion` |
| 7 | Character | **Cheerful** | Revises §1.7's "drawn mark, not a cartoon" toward warmer; the line-drawing style of the logo is kept so it still sits next to premium prices |
| 8 | Name | None | — |
| 9 | Costume | **Кептар, капелюх з пір'ям, топірець** | Hutsul dress, drawn in the logo's line style |
| 10 | Where else | **Empty cart, 404, order thank-you** | Removed from the loader and the footer. Still never on PDP, checkout or wholesale |
| 11 | Falls asleep when idle | Yes | Kept (§1.7) |
| 12 | Seasonal looks | **Christmas, Easter** | Two seasonal variants, switched by date |
| 13 | Speaks lines | **Yes** | Short lines on the three mascot surfaces, per locale; copy to write in propagation |
| 14 | Hands at work | **Hands yes, faces no** | P1.4 closed: production video and stills show hands and process, not faces |
| 15 | Hero buttons | **Both**: «Переглянути каталог» and «Як ми виробляємо» | Primary = catalogue, secondary = production |
| 16 | Categories higher | **Yes, directly under the hero** | **Homepage order changes**: categories move from S5 to S2; the manufacturing proof follows. Resolves Challenge 1 in [06-homepage-wireframe.md](06-homepage-wireframe.md) §6.2 |
| 17 | Prices in best sellers | Yes | Unchanged |
| 18 | «Приїжджайте до нас у Яворів» with a map on the homepage | **Yes** | New homepage block, near the end (before the final CTA) |
| 19 | Numbers that are real | **Only «30+ років»** | No counters block; no invented figures. «30+» already approved (D1) |
| 20 | Announcement bar | «Відправка по Україні за 2–4 дні» | Wording to confirm in part 4: dispatch within 2–4 days, or delivery? |
| 21 | Seasonal banner edited by Іван | Yes | Unchanged (§23.12) |
| 22 | Reviews on the homepage | **Video reviews** | None exist yet. The block renders only when at least 3 video reviews are published; until then it is hidden, not filled with placeholders |

---

## Part 3 — catalogue, search, product page

| # | Question | Answer | Blueprint impact |
|---|---|---|---|
| 1 | Categories | «Не знаю, придумай сам» | Proposal in §P3.1, confirmed in part 4 |
| 2 | Filters | Size, colour, material, price, in stock, own / partner | Matches [03-information-architecture.md](03-information-architecture.md) facets; yarn thickness and weight are not global facets (they appear inside the yarn category only) |
| 3 | Default sort | Popular | Unchanged |
| 4 | Second photo on hover | Yes | Desktop only; touch shows the first photo |
| 5 | Quick view | **No** | Removed |
| 6 | Add to cart from the listing | **No, product page only** | Listing cards carry no cart button |
| 7 | Badges | Хіт, Новинка, Останній, Знижка | «Під розмір» and «Ручна робота» are not badges |
| 8 | Low-stock count | Only when low | Threshold `{{LOW_STOCK_THRESHOLD}}`, default 3. One-of-one items (sheepskins) show «Єдиний екземпляр» instead |
| 9 | Voice search | No | Unchanged |
| 10 | Collections | На подарунок, Весільні, Для дітей | Three editorial collections, curated in the admin, not categories |
| 11 | Photos per product | 3–5 | Gallery spec assumes 3–5; no 360° |
| 12 | Video on the product page | **Yes, for all** | A short silent clip (5–10 s) per product. **Content load:** one clip per product *family* where variants differ only in size, otherwise the shoot does not fit the ~2026-10-06 visit. Recorded against R2 |
| 13 | 360° | No | — |
| 14 | In-room photos | Yes | At least one interior frame per textile family |
| 15 | Size calculator | **Yes** | For ліжники, ковдри, пледи: bed size in, recommended product size out |
| 16 | Yarn skein calculator | No | — |
| 17 | Yarn attributes shown | Metres per skein, thickness | `ProductVariant.lengthMetres`, `plyThickness` already in the schema |
| 18 | Sheepskins | **Each skin is its own product with its own photo** | One-of-one items, stock 1, auto-archived when sold. Admin needs a fast "duplicate and replace photo" path (§23.6.10) |
| 19 | Specs shown | Weight, composition, density, size | Specification table on every textile PDP |
| 20 | Care instructions | **One shared page** | PDP links to the relevant section by material; no per-product care text |
| 21 | «З цим купують» | Yes | Kept |
| 22 | Recently viewed | **No** | Removed |
| 23 | Back-in-stock alert | No | Not built |
| 24 | Compare | No | Not built |
| 25 | Wishlist | Yes | `localStorage` only, as specified |

### P3.1 Proposed customer-facing categories

The client asked for a proposal. Built from the confirmed D3 tree
([00-client-decisions.md](00-client-decisions.md)), reordered so the two families the client
wants to grow (yarn, sheepskin — part 1 answer 9) sit second and third, and with **пледи**
added: they are a best-seller (part 1 answer 8) and were missing from D3.

| # | Menu item | Contains |
|---|---|---|
| 1 | Ліжники та пледи | Ліжники, пледи, ковдри вовняні, подушки |
| 2 | Пряжа та рукоділля | Вовняна пряжа, ровниця, вовна для рукоділля |
| 3 | Овчина | Шкури (кожна окремо), вироби з овчини |
| 4 | Вовняний одяг | Гуні, камізельки, накидки, пояси |
| 5 | Шкарпетки та капці | Шкарпетки, капці |
| 6 | Шкіра | Шкіряні вироби |
| 7 | Від партнерів | Partner goods, labelled per §1.7b |

Beside the menu, not in it: **Добірки** (На подарунок, Весільні, Для дітей) and **Опт**.
Seven items is the ceiling for a first-level menu that a 70-year-old can scan without scrolling.

---

## Part 4 — categories, cart, checkout, delivery, payment, returns

| # | Question | Answer | Blueprint impact |
|---|---|---|---|
| 1 | Category menu (§P3.1) | **Approved** | [03-information-architecture.md](03-information-architecture.md), [15-navbar-specification.md](15-navbar-specification.md) take the seven items |
| 2 | «2–4 дні» means | **Dispatch** within 2–4 days of the order | Announcement copy made unambiguous: «Відправляємо по Україні за 2–4 дні після замовлення». `{{DISPATCH_DAYS}}` = 2–4 |
| 3 | Buy in one click | **Yes** | See §P4.1 |
| 4 | Callback button | No | Not built |
| 5 | Cart | **Side drawer only** | The separate cart page is removed; everything it carried moves to the drawer or to checkout. Promo-code entry moves to checkout only |
| 6 | Gift wrapping | No | Not built |
| 7 | Gift note in parcel | No | Not built (the business card of G4 still ships) |
| 8 | Gift certificates | No | Not built |
| 9 | Promo codes for | Holidays | Promotion module unchanged; used seasonally |
| 10 | Order comment | **No** | `Order.customerNote` field removed from checkout. Custom-size dimensions are captured by their own fields, not a comment |
| 11 | Nova Poshta branch picker | List with search **and** map | Both |
| 12 | Nova Poshta courier to address | Yes | Address delivery added as a Nova Poshta option |
| 13 | Ukrposhta | For all goods | Unchanged |
| 14 | Same-day dispatch | **Never** | No cut-off time anywhere in the copy |
| 15 | Instalments | No | Not built |
| 16 | Apple Pay / Google Pay | Yes | Through WayForPay; added to V6–V11 verification |
| 17 | Return shipping when the item simply does not suit | **Buyer pays** | Stated in the offer contract and returns page; lawful in Ukraine and under the EU directive when disclosed before purchase |
| 18 | First foreign market | **Poland** | `pl` becomes the second locale in effort and launch order, ahead of `en` and `de` |
| 19 | Prices for foreigners | **In euro** | See §P4.2 |
| 20 | Minimum order | None | `{{MOQ_VALUE}}` = none (already) |
| 21 | Branded packaging | Not needed | — |

### P4.1 «Купити в 1 клік»

The buyer leaves only a phone number; the business calls back. That is **not an order**: an order
needs a delivery point, a payment method and the prepayment rules of rounds 5–8. So:

- The button creates a **quick-order request** (product, variant, quantity, phone, time) — a new
  admin inbox beside Leads, with the same SLA colouring.
- The manager calls, then creates the real order in the admin and sends the buyer a payment link.
  Prepayment, the 460 ₴ floor and the deposit apply at that point, unchanged.
- Ukraine only; not offered for custom-size items (they need dimensions) or on non-`uk` locales.
- Phone numbers are personal data: covered by the retention and erasure rules.

### P4.2 Euro prices

Prices on non-`uk` locales are **displayed** in euro, converted from UAH at the NBU rate, updated
daily and rounded to whole euros. Whether the card is **charged** in euro or in UAH depends on
WayForPay (V11). If UAH, checkout states it plainly: «Оплата списується в гривнях за курсом
вашого банку».

---

## Part 5 — content, admin, contact, launch

| # | Question | Answer | Blueprint impact |
|---|---|---|---|
| 1 | Family story told by | Іван | Interview with Іван during the ~2026-10-06 visit |
| 2 | Photo of Іван on «Про нас» | **No, no faces** | The about page carries no portrait. Trust moves to place, process and hands (P1.4) |
| 3 | Production stages | **Миття, чесання, прядіння, ткання, валяння, пошиття** — six | See §P5.1: shearing, dyeing and hide processing are not in the list, and the blueprint claims them |
| 4 | Workshop tours page | **No** — a mention on the contacts page only | Tours stay phone-arranged (G3); no separate page |
| 5 | Blog author | Іван | See §P5.2 |
| 6 | Cadence | No schedule | `{{BLOG_CADENCE}}` = irregular |
| 7 | Topics | Wool care, history of ліжникарство, Яворів and the Carpathians, how we make it, choosing a ліжник, knitting with our yarn | The six blog pillars |
| 8 | Frequent buyer questions | «Чи ви реально виробник?», «Чи є індивідуальні розміри?», «Чи це натуральні, екологічні вироби?» | The first three FAQ entries, and the three questions the homepage must answer without being asked. «Екологічні» needs care: no certificate exists (D1), so the answer describes the process, never a certification |
| 9 | Existing reviews | Google reviews | The only review source at launch |
| 10 | Show the Google rating on the site | **Yes** | Displayed as a Google widget or a linked badge. **Not** marked up as the site's own `AggregateRating` — Google does not accept third-party reviews as the site's structured data |
| 11 | Panel users | Любов: orders, calls, articles, product management. Other staff: «дай ідей» | See §P5.3 |
| 12 | New-order notifications | **Panel and Telegram** | New: a Telegram bot. See §P5.4 |
| 13 | Print Nova Poshta waybills from the panel | Yes | §23.8.4 unchanged |
| 14 | Sales and stock report | **Weekly** | Sent to Telegram and shown in the panel |
| 15 | Current stock records | A paper notebook | Initial stock is typed in by hand — counted as content work in Phase 6 |
| 16 | Admin theme | **A light/dark switch** | Admin gains a light theme (the storefront tokens already exist); dark stays the default |
| 17 | SMS or Viber status messages | Not needed | Email only |
| 18 | Messenger buttons | **Viber, Telegram, WhatsApp** | Buttons on contacts, the footer and the PDP help block, linked to Іван's number (G1) unless the client names another |
| 19 | Live chat | No | Not built |
| 20 | Email newsletter | **No** | Newsletter removed: the footer and homepage sign-ups, the double opt-in and `NewsletterSubscriber`. The blog loses its only owned channel; the parcel card (G4) remains |
| 21 | Languages at launch | **All four at once** | See §P5.5 |
| 22 | Launch date | **In one week** | See §P5.5 — not achievable for this scope |
| 23 | A feature seen elsewhere | None | — |

### P5.1 The production claim must match the six stages

The client lists six stages: washing, carding, spinning, weaving, felting, sewing. The blueprint
and E6 claim a **full cycle including hides**, and the production page describes hide processing
(R21). Three things are not in the client's list:

1. **Shearing** — is the wool from the family's own flock, or bought as raw fleece?
2. **Dyeing** — are colours dyed in-house, or is the palette natural wool colours only?
3. **Sheepskin and leather processing** — tanning and dressing in-house, or bought finished?

Until answered, the production page and every «повний цикл» sentence claim only the six stages.
A stage the client did not name is not claimed.

### P5.2 Blog written by Іван, without a schedule

The long-tail articles are the realistic early organic channel for a new domain
([00-client-decisions.md](00-client-decisions.md) D2, Consequence 2), and the launch plan assumed
8–10 of them. With Іван writing irregularly, the recommendation is: record him talking on each of
the six topics during the visit, and edit the transcripts into articles for his approval. His
voice, not his typing time.

### P5.3 Roles

| Person | Proposed role | Does |
|---|---|---|
| Іван | Owner | Everything |
| Любов | **Owner** (second) — recommended since round 8 | Orders, calls, quick-order requests, mail, articles, products. A second Owner is also the recovery path for the panel |
| A packer | Warehouse | Sees orders to pack, prints the Nova Poshta waybill, marks shipped, corrects stock. Nothing else |
| A photographer / content helper | Photographer + Content Editor | Uploads photos and video, edits descriptions and translations; no orders, no money |
| A sales helper, if one is hired | Manager | Orders, quick-order requests, mail, wholesale leads; no settings, no refunds |

All of these roles exist already ([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.5).

### P5.4 Telegram notifications

A Telegram bot posts to a private chat or group: new order (number, total, delivery city,
payment method — **no** name, phone or address), new quick-order request, new mail thread, and
the weekly report. Personal data stays in the panel; the message links to it. Bot token in the
secrets store; the chat is chosen in Settings.

### P5.5 Launch in one week, in four languages — not achievable

This has to be said plainly. **No application code exists yet.** The blueprint's own estimate is
**22–26 weeks** from the close of Phase 0 with a senior engineer, a designer and a content
coordinator ([35-implementation-roadmap.md](35-implementation-roadmap.md) §35.2), and several
things block commerce outright regardless of effort:

- the domain is not registered;
- `{{LEGAL_ID}}` is not delivered, so there is no WayForPay contract and no card payments;
- the photography and video are not shot (planned ~2026-10-06);
- all four languages at launch means translating every product and page into Polish, English and
  German.

What **can** exist in about a week, and is worth doing: register `vivcharyk.shop`, point Google
Business Profile at it, and publish a **one-page site** in Ukrainian — the logo, «Понад 30 років
виробляємо натуральні вовняні вироби в Карпатах», the address, the phones, the messenger buttons,
the Google rating and «Магазин відкривається незабаром». That gives the domain its first weeks of
age and the profile a working link, while the real shop is built.

---

## Follow-up — production facts, launch approach, roles, translation

| # | Question | Answer | Blueprint impact |
|---|---|---|---|
| 1 | Wool source | **Raw wool is bought** — no own flock | See §F1 |
| 2 | Dyeing | **Bought already dyed** | No «фарбуємо самі» anywhere. See §F1 |
| 3 | Sheepskin and leather | **Processed fully in-house** | Hide processing confirmed (E6 stands); R21 — film the wet stages — stands |
| 4 | Launch approach | «Поки розробляєм, в кінці перед запуском просто підставимо всі дані та фото і домен» | Build against `{{TOKEN}}` values and placeholder media; resolve at the end. P5.5's one-page interim is not wanted. See §F2 |
| 5 | Messenger number | **Іван, +380679973450** | Viber, Telegram, WhatsApp buttons use it |
| 6 | Любов's role | **Administrator** | Not a second Owner. See §F3 |
| 7 | Translation | **AI only** | See §F4 |

### F1 What the production claim may say

Claimed stages, and only these: **вичинка шкур, миття, чесання, прядіння, ткання, валяння,
пошиття.** Not claimed: shearing, own flock, dyeing.

- «Повний цикл» is written as **«від сирої вовни до готового виробу»** — never «від вівці».
- **No «наші вівці», «з наших овець», «власна отара».** The shepherd-and-sheep animation and the
  name Вівчарик are brand imagery; copy never turns them into a claim about a flock.
- Colours are described as the colours of the product, never as the business's dyeing.
- `{{WOOL_SOURCE}}` stays open: where the raw wool comes from (Carpathian farms?) is worth
  stating if it can be stated truthfully.

**One question this raises, to ask at the visit:** the yarn sold in «Пряжа та рукоділля» — is it
spun in the workshop, or bought finished and dyed? If bought finished, it is
`PARTNER_MANUFACTURE` and labelled as such (§1.7b); if spun in the workshop from bought dyed
fibre, it is `OWN_MANUFACTURE`. The category the client most wants to grow depends on the answer.

### F2 Build first, fill at the end

Consistent with how the blueprint already treats unresolved facts: every client fact is a
`{{TOKEN}}`, and CI gate G1 blocks a production build while any remains. Two items still have
lead times that do not shrink by waiting, and are recorded so the end is not a surprise:

- **Domain:** registration is instant, but the email authentication ramp after it takes about two
  weeks and cannot be parallelised (§35.3.0). Registering early costs nothing and removes the
  risk of the name being taken.
- **WayForPay:** merchant onboarding needs `{{LEGAL_ID}}` and takes days to weeks; card payment
  cannot be tested end to end without it.

### F3 Любов as Administrator

Recorded. Іван stays the only Owner. Consequence already noted in round 8: an Administrator cannot
reset the Owner's 2FA — that would let the lower role take over the higher — so if Іван loses his
phone and his recovery codes, recovery is the developer's break-glass procedure
([24-employee-permission-architecture.md](24-employee-permission-architecture.md) §24.11). Іван
keeps his printed recovery codes somewhere Любов can reach them.

### F4 AI-only translation

Recorded for product and editorial content. **One exception is recommended, for legal reasons:**
the German Impressum, the withdrawal notice and model withdrawal form, the Polish and German
terms and returns pages. Errors there are legal exposure — in Germany, a defective Impressum or
withdrawal notice is a routine target for paid warning letters (Abmahnung). A one-time review of
those few pages by a human is cheap insurance. The heritage sentence (§L6) is checked by hand in
every language so that the designation stays with the craft (R16).
