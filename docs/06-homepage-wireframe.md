# 06 — Homepage Wireframe

> **Round 11 — art direction:** sections meet with soft hill edges and the page background is on trial as warm peach — [00-client-decisions-11.md](00-client-decisions-11.md), «Art direction».

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Final homepage order in [00-client-decisions-10.md](00-client-decisions-10.md) part 2**: strip → hero (seasonal photo, 70% height, «Вівчарик» + tagline, flock 15+ led by a walking shepherd, sound off by default) → 4 category circles + «Усі категорії» → animated path «від сирої вовни до готового виробу» → 4 best sellers (auto, Іван can pin) → 4 trust points → yarn block → collections → video reviews (hidden until 3) → Яворів map (click-to-load) → phone and messengers.
> - Removed from the homepage: family story, wholesale, blog. The seasonal banner is the announcement strip.

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Section order changes: categories move to S2**, directly under the hero; the manufacturing proof follows (Challenge 1 in §6.2 resolved by the client).
> - **Hero:** mountain photograph (the LCP image) with an SVG line animation of the shepherd and sheep on top; sheep follow the cursor (last tap on touch); still frame under reduced motion. **Two buttons:** «Переглянути каталог» (primary), «Як ми виробляємо».
> - **New block «Приїжджайте до нас у Яворів» with a map**, before the final CTA. Tours mentioned, arranged by phone (G3).
> - Numbers: **only «30+ років»**. No counters block.
> - Reviews: **video reviews**, block hidden until at least 3 exist; the Google rating is shown as a linked badge (not as own `AggregateRating`).
> - Announcement bar: «Відправляємо по Україні за 2–4 дні після замовлення».
> - **No newsletter sign-up** in the final CTA (part 5 answer 20); the CTA offers the phone and the messenger buttons (Viber, Telegram, WhatsApp — Іван's number).
> - Best sellers and category emphasis give **пряжа and овчина** more weight — the families the client wants to grow.


The homepage serves four audiences at once without asking any of them a question, and is judged
in five seconds. Everything below is written against that constraint. It specifies structure,
slots, data bindings, and motion — not final copy, which is drafted per locale against the
character limits here with `uk` as source.

**Authority.** This document is built on [00-client-decisions.md](00-client-decisions.md) and
revised against [00-client-decisions-2.md](00-client-decisions-2.md), which now outranks every
other input. Two rulings from Round 1 still shape this page more than anything else: Вівчарик
launches as a **new brand on a new domain** with zero SEO history (§D2), and the catalogue
contains **partner-manufactured goods alongside own manufacture** (§D3). The first makes the
homepage the brand's only reliable traffic destination for two quarters; the second makes origin
labelling a homepage-level concern rather than a PDP detail.

Round 2 changes four things on this page, and one of them is the most valuable single edit in the
blueprint:

| Round-2 ruling | Homepage consequence |
|---|---|
| E2 — the workshop is in **Яворів**, the village called «столиця ліжникарства» | The hero's specificity claim moved from «карпатський» to «яворівський». **Reversed in Round 3 by F6** — see below. §6.3, S1 |
| E6 — the **full cycle is confirmed, including hides** | S2 and S7 may claim wool, sheepskin and leather as own manufacture, subject to the photograph rule. «Бельгійська технологія» is struck — it belonged to the adjacent business |
| E7 — partners **cannot be named** | The §6.2 origin rule's «Вироблено партнерами {{PARTNER}}» wording is withdrawn and replaced |
| E3 — **no social media exists** | Job 0's channel list loses Instagram, which makes this page's job harder, not easier |

[00-existing-site-audit.md](00-existing-site-audit.md) describes an **adjacent business**
belonging to the client's wife. Round 2 confirms that its NAP was also wrong for Вівчарик: the
audited village was Вербовець, and Вівчарик is in Яворів, roughly 20 km away. Every «Вербовець»
in earlier drafts of this document is a transcription of the wrong business and is corrected
below. Its prices, contacts, delivery tariffs and catalogue size remain market reference only and
carry no authority here; where this document uses one of those figures it is rendered as a
`{{TOKEN}}` awaiting confirmation for Вівчарик specifically.

**Round 3 revises this page again, and one of its rulings reverses a Round-2 edit made here.**
[00-client-decisions-3.md](00-client-decisions-3.md) now outranks both earlier rounds:

| Round-3 ruling | Homepage consequence |
|---|---|
| F6 — the tagline stays **«в Карпатах»**; the Яворів substitution is withdrawn | S1's overline, H1 and subheadline revert to Carpathian framing. Яворів drops one section down, to S2 and below. §6.3, S1, S2 |
| F2 — the Яворів site is a **retail shop as well as a factory** | S11 stops being an address that can be verified and becomes a place that can be entered. S11 |
| F4 — the **buyer pays shipping and all customs**; international shipping is quoted per order, never calculated | S4 item 3 gains an international qualifier, and free shipping never applies abroad. S4 |
| F5 — an interim contact address exists, `gif19601@gmail.com` | `{{BRANDED_EMAIL}}` moves from "does not exist" to "exists, and must be replaced for a technical reason as well as a commercial one". §6.10 |
| F1 — `{{LEGAL_ID}}` exists and is pending delivery | It stops being a general blocker. It blocks WayForPay, the offer contract and the German Impressum, none of which this page renders. §6.10 |
| F3 — partner goods are sold **under the Вівчарик brand** | The §6.2 origin rule is unchanged in substance and stronger in justification: the brand name now appears on goods the brand did not make. §6.2 |

## 6.1 What the homepage has to do

Ranked. When two jobs conflict, the lower number wins.

| # | Job | Measured by |
|---|---|---|
| 1 | Prove visually that this is a factory, not a reseller | Anxiety A3, [02-ux-research.md](02-ux-research.md) §2.4 |
| 2 | Route into a category or product within two interactions | Homepage → listing entry rate |
| 3 | Establish the premium register before the first price is seen | Bounce on first price exposure |
| 4 | Route the wholesale buyer out of the consumer funnel | Wholesale entry rate from home |
| 5 | Answer "will it arrive, can I return it" without scrolling to the footer | Footer-policy click rate stays low |

Job 3 is the one usually lost. A Carpathian lizhnyk is a four-figure purchase. A visitor who
meets that number before meeting the factory experiences it as expensive; a visitor who meets
the factory first experiences it as *priced*. Section order is the mechanism that decides which
happens.

**Job 0, added by [00-client-decisions.md](00-client-decisions.md) §D2 and narrowed by
[00-client-decisions-2.md](00-client-decisions-2.md) E3.** On a new domain with no ranking
history, this page is not the top of a search funnel — it is the landing page for whatever
channels exist. Round 2 removes one of them: **there is no Instagram, and no social media at
all.** The channel set is:

| Channel | What the visitor arrives with |
|---|---|
| Google Business Profile | A map pin, a photo, a phone number, and no idea what the brand is |
| Existing offline and word-of-mouth customers | A name they were told, and an expectation set by someone they trust |
| Long-tail editorial (months away) | A specific question — how to wash a lizhnyk, what ровниця is |
| Yavoriv's tourist footfall | Having physically been in the shop, which is the highest-context arrival there is |

Every one of those arrives **with curiosity rather than intent**, and three of the four arrive
knowing the *place* before they know the brand. That is the strongest possible case for S2 at
position two.

**[00-client-decisions-3.md](00-client-decisions-3.md) F2 upgrades the fourth channel from a
possibility to a real one.** The Яворів site is a retail shop as well as a production floor —
«там знаходиться і магазин і виробництво». A visitor who has stood in that shop is not merely a
tourist who drove past a village; she is a person who has already seen the looms and can be sold
to again online. On a domain with no ranking history and no social accounts, physical footfall in
a craft-tourism village is the one launch channel that does not depend on search at all. It is
why S11 is specified below as an invitation rather than a contact block.

That channel does **not**, however, argue for putting the village name in the hero. The three
other channels arrive knowing nothing, and F6 settles the question against it — see §6.3.

The thinner channel set raises the stakes on two sections in particular. S10 (blog) is now the
**primary** organic channel rather than a supporting one
([22-blog-specification.md](22-blog-specification.md)), and S11's Google Business Profile bridge
is no longer one of several local-signal surfaces — it is the main one.

## 6.2 The mandated section order, and whether it survives scrutiny

The order is retained. Below is the reasoning, and the two places it is weaker than an
alternative.

| # | Section | Job | Verdict |
|---|---|---|---|
| S1 | Hero | Place, scale, register, one action | Correct at 1; nothing else can open |
| S2 | Manufacturing proof | Answers A3 before any price | **Strongest decision in the brief.** Competitors put products here |
| S3 | Best sellers | Converts the ready-to-buy visitor | Defensible — first price lands after the proof |
| S4 | Why customers trust us | Delivery, returns, payment stated plainly | Correct: follows first price exposure, when the anxiety fires |
| S5 | Categories | Routes 15 own-manufacture families across three material worlds | **Weak at 5** — see Challenge 1 |
| S6 | Story | Converts interest into brand memory | Correct: narrative after commerce, not before |
| S7 | Production journey | Deepens A3 with process, not assertion | Correct, and the natural home for the Inverted surface |
| S8 | Reviews | Third-party corroboration after first-party claims | Correct: own claims, then others' |
| S9 | Wholesale | Exits Persona 3 from a consumer page | Late is right — B2B arrives with intent and scrolls |
| S10 | Blog | Living business; feeds SEO and AI retrieval | Correct at 10 |
| S11 | CTA | Last exit: newsletter, phone, visit | Correct |

**Challenge 1 — Categories at S5 is late for a catalogue this broad.** Twelve wool families plus
sheepskin, leather, and a partner range is a lot to hide behind four sections. A visitor who
wants шкарпетки, not a four-figure ліжник, scrolls past four sections before a route. The
order is kept because routing is solved better elsewhere: the header carries a persistent
category entry point ([15-navbar-specification.md](15-navbar-specification.md)) and S1 carries a
four-item rail at the hero's lower edge. Navigation is a header job; using a homepage section as
the primary navigational affordance is what creates the scroll in the first place. Recorded as
the first post-launch A/B test (swap S3 and S5) in
[31-analytics-architecture.md](31-analytics-architecture.md).

**Challenge 2 — S2 before S3 costs conversion on returning traffic.** A returning buyer does not
need the factory proved twice. Mitigation rather than reordering: S2 collapses to a single-row
variant when a prior session is detected (`localStorage`, no cookie-consent implication —
*height* is personalised, not content). The full section stays in the HTML, so SEO and the no-JS
experience are unchanged.

**Rejected outright:** rotating hero slider, countdown bar, auto-advancing "хіти продажів"
carousel, discount ribbon. All four are the Archetype C signature
([02-ux-research.md](02-ux-research.md) §2.5.3) and all four cap the achievable price point.

### The origin rule — binding on every section of this page

[00-client-decisions.md](00-client-decisions.md) §D3 introduces a partner-manufactured range.
The rule for this page is absolute and is repeated in each section spec below:

> **Every product, image, statistic, category tile and review shown on the homepage must have
> `Product.origin = OWN_MANUFACTURE`.** Partner goods exist in the catalogue, in search, and in
> listings. They never appear in the hero, the manufacturing proof, the best-seller rail, the
> production storytelling, or the category tiles.

This is not squeamishness about resale. The homepage's entire job is claim-making, and a claim
is only as strong as its weakest exhibit. A single partner-made item in the best-seller rail
converts the S2 manufacturing film from evidence into decoration, because the visitor can no
longer tell which of the two the rail is illustrating. Implementation: the homepage queries carry
`origin: OWN_MANUFACTURE` as a hard predicate, not a sort weighting, so a merchandiser cannot
accidentally promote a partner product into the rail.

**The partner label wording is superseded.** The previous draft specified «Вироблено партнерами
{{PARTNER}}». [00-client-decisions-2.md](00-client-decisions-2.md) E7 answers «Ні» to naming
partners, permanently. `Product.partnerName` stays null and is **never rendered anywhere on the
site**. The replacement, used on the listing and PDP surfaces where partner goods legitimately
appear:

| Condition | Label |
|---|---|
| Always, on every partner item | «Відібрано Вівчариком» |
| `partnerRegion` known | plus «Виготовлено карпатським майстром», with the region named — «Косівщина», «Гуцульщина» |
| `partnerRegion` unknown | plus «Виготовлено іншим виробником» |

E7's principle governs the treatment: **being unable to name the partner is a reason to be more
explicit that the item is not own-made, not less.** The mark keeps equal visual weight to «Власне
виробництво» — same size, same position, same typographic treatment — because a disclosure
rendered smaller than the claim it qualifies is a disclosure designed not to be read. The origin
facet stays pinned at the top of the filter panel.

The curation argument survives the loss of the name, and arguably improves. «Відібрано
**Вівчариком**» is a selection the brand signs in the first person; «вироблено партнерами
[company]» delegated the credibility to a company the visitor had never heard of. A signed
selection from a factory that also manufactures is a stronger object than an unsigned supplier
credit.

**Round 3 raises the stakes on the label rather than lowering them.**
[00-client-decisions-3.md](00-client-decisions-3.md) F3 confirms that partner goods are sold
**under the Вівчарик brand**. That is ordinary retail practice and entirely legitimate, but it
means the brand name now appears on items the brand did not make — which is exactly the
circumstance under which a disclosure stops being a courtesy and starts being the thing that
keeps the homepage's own claim honest. Nothing about the rule is softened: the mark keeps equal
visual weight, the origin facet stays pinned at the top of the filter panel, and partner goods
stay off this page entirely. A customer who discovers the distinction for herself feels misled; a
customer who was told plainly feels informed, and branding the goods is what makes the difference
between the two matter.

The structured-data consequence is recorded here because the homepage's `Organization` and
`Product` graphs share a serialiser: `brand` is **Вівчарик for both origins**, and `manufacturer`
is Вівчарик for `OWN_MANUFACTURE` and is **omitted entirely** for `PARTNER_MANUFACTURE` — never
set to Вівчарик, and never set to the partner, whose name is not public
([29-seo-architecture.md](29-seo-architecture.md)). Omission states the fact without asserting
anything false, which is precisely the distinction schema.org draws between the two properties.

## 6.3 The first five seconds

Five seconds is one viewport, one image decode, one sentence. In that budget the page must
communicate four things, in this visual priority:

1. **A place with a name** — a specific mountain workshop, photographed, in a village the visitor
   can look up. The hero media occupies ≥68% of the first viewport at every breakpoint.
2. **A maker, not a shop** — carried by the H1, which names craft and place rather than an offer.
3. **That this is expensive on purpose** — carried by whitespace, type scale, and the absence of
   promotional furniture. A negative signal: communicated by what is missing.
4. **Where to go next** — exactly one primary action plus the category rail.

### Point 1 was rewritten in Round 2 and is rewritten back in Round 3

The Round-2 draft of this section moved the hero's place-claim from «Карпати» to «Яворів», on the
appellation argument: «карпатський» is a category descriptor thousands of sellers use and none
can be distinguished by, whereas «яворівський» is a geographically bounded claim a reseller in
Kyiv cannot copy without lying.

**The client reviewed that proposal and rejected it.**
[00-client-decisions-3.md](00-client-decisions-3.md) F6: «Ні, напиши краще "в Карпатах".» The
approved copy from [00-client-decisions.md](00-client-decisions.md) §D1 stands unchanged —
«Понад 30 років виробляємо натуральні вовняні вироби **в Карпатах**» — and the hero reverts to
it.

The reasoning behind the reversal is sound and worth stating, because the same trade-off recurs
on every page of this blueprint:

| | «Карпати» | «Яворів» |
|---|---|---|
| Recognised by a first-time visitor | Immediately, in every locale including `de` and `pl` | Only by someone who already knows the craft |
| Distinguishes the brand from a reseller | No — everyone claims it | Yes — it resolves on a map and can be checked |
| Costs the reader anything to parse | Nothing | A proper noun they must learn mid-headline |

Both columns are true at once, which is why the answer is not to pick one word but to give each
word the job it is good at. **The governing pattern, applied throughout this document:
«Карпати» to be understood, «Яворів» to be believed.** The headline earns attention; the pages
beneath it earn trust. Different jobs.

Concretely, on this page:

| Surface | Word | Why |
|---|---|---|
| S1 overline, H1, subheadline | **Карпати** | Five seconds, no context, no scroll. A tagline is not the place to teach a new proper noun |
| S2 body, immediately below the fold | **Яворів**, named and explained | The reader has just been told what the business does and is now being shown where. This is the first point at which the village earns its keep |
| S6 story, S7 production, S11 visit block | **Яворів** | Narrative and address surfaces, where specificity is the whole point |
| Meta title and description | Both, per query | «Карпати» in the general title, «Яворів» where it answers a specific query ([29-seo-architecture.md](29-seo-architecture.md)) |
| `LocalBusiness` / `PostalAddress` JSON-LD | **Яворів** | Required, non-negotiable, and read by machines rather than by a five-second visitor |

Яворів is therefore not removed from the homepage. It moves one section down, to the first place
where the reader has enough context to be persuaded by it — and Яворів remains what it is: the
recognised centre of Hutsul lizhnyk weaving, commonly called «столиця ліжникарства», home to a
dedicated [Музей ліжникарства](https://kosiv.life/lizhnykarstva/), to annual lizhnyk-weaving
plein airs attended by art historians, and to the Шкрібляк and Корпанюк woodcarving dynasties.
None of that material is lost. It is placed where it works.

**Hard verification constraint, binding on every slot on this page.** E2 states it and it is
repeated here because the hero is where it would most plausibly be breached: the *craft* of
Hutsul lizhnyk weaving is widely described as inscribed on Ukraine's national register of
intangible cultural heritage, and the exact status and wording must be confirmed before any such
reference is published. **Вівчарик itself holds no heritage designation, and the page must never
imply that it does.** A company is not inscribed on a heritage register; a craft may be. Concrete
prohibitions: no «спадщина ЮНЕСКО» wording, no register reference beside the brand name, no
seal-shaped or rosette graphic, and no phrasing in which the subject of the heritage sentence is
Вівчарик rather than the craft or the village. Saying «село, яке називають столицею
ліжникарства» is a statement about Яворів and is safe; «наша спадщина» is a statement about the
company and is not.

Must **not** appear in five seconds: a price, a discount, a popup, a cookie wall over the hero,
or a locale question. Locale resolves from `Accept-Language` with a dismissible inline
suggestion bar, never a blocking modal ([03-information-architecture.md](03-information-architecture.md) §3.5).

## 6.4 Above the fold, by breakpoint

Viewport height net of browser chrome: 375×667 (iPhone SE floor), 768×1024, 1440×900.

| Breakpoint | Visible without scrolling | Deliberately below the fold |
|---|---|---|
| **375×667** | Header 64 px · hero media 420 px · H1 ×2 lines · primary CTA · first 2 rail chips | Subheadline, secondary CTA, all of S2 |
| **768×1024** | Header 72 px · hero 640 px · H1 · subheadline · primary CTA · full 4-chip rail | S2 peeks 40 px — deliberate, it invites the scroll |
| **1440×900** | Header 80 px · hero 820 px · H1 · subheadline · both CTAs · rail · scroll cue | Everything from S2 |

**The 375 case drives the design.** At 667 px there is room for media, three lines of type, and
one button. The subheadline is therefore written to be *disposable* — it carries nothing
required to understand the page, because a large share of mobile visitors will never see it.
Load-bearing content goes in the H1 or the media.

**The hero never fills 100 vh.** Capped at `min(82vh, 820px)` so a strip of S2 is always
mathematically able to peek. A full-height hero with no visible continuation is the commonest
cause of "visitor believes the page is one screen".

## 6.5 Hero media strategy

**Video, conditionally, with a still as the guaranteed baseline.** *Video of the actual factory
in motion* is rank-1 trust evidence ([01-brand-strategy.md](01-brand-strategy.md) §1.8) and
nothing on the site outranks it. But Persona 1 opens the site on degraded mobile data in a
mountain valley, and a hero that fails for her fails for the highest-intent visitor there is.
The resolution: the video is **never on the critical path**. The poster is the page.

```
Request → SSR HTML with <img> poster, eager, fetchpriority=high
            └─ LCP fires here. Always. Video is irrelevant to it.
window 'load' + IntersectionObserver(hero) + guard passes
            └─ <video> mounts behind poster, plays, poster fades 300 ms
               (guard fails → poster stays forever; nothing else changes)
```

**The exact LCP element:** `<img class="hero-poster">` — one AVIF still, 1600×900 at 1×,
`srcset` at 750/1100/1600/2200, `sizes="100vw"`, `loading="eager"`, `fetchpriority="high"`,
`decoding="sync"`, explicit `width`/`height` from `Media.width/height`, `Media.blurhash` painted
as an inline data URI on the wrapper. It wins LCP by design: the H1 at `display-xl` is the only
competing candidate and loses because the poster's painted area is ~30× larger and because
`font-display: optional` on the display family ([10-typography.md](10-typography.md) §10.7) means
the H1 may render in the fallback on first visit — a smaller, less certain candidate. Budget
**≤120 KB at the 1600 w step**, `f_auto,q_auto:good`, preloaded via a server-emitted
`<link rel="preload" as="image" imagesrcset=…>` sharing the element's exact `srcset` string so
the two cannot diverge. The poster is **never animated on entrance**
([13-motion-system.md](13-motion-system.md) §13.8) — the H1, subheadline, CTAs and rail Rise
around an image that is already opaque at first paint.

**Autoplay policy:** `muted` + `playsinline` + `loop` always; no `controls` in the default state;
**the audio track is stripped from the file**, not merely muted, because a muted attribute can be
undone by an extension and a file with no audio track cannot surprise anyone. A 48×48 px
play/pause control renders whenever the video is actually playing — WCAG 2.2.2 requires a
mechanism to stop motion running over five seconds, and a looping hero runs indefinitely. Under
`prefers-reduced-motion` the video never mounts; poster plus explicit play control
([13-motion-system.md](13-motion-system.md) §13.6).

**Bandwidth and thermal guard.** The video mounts only if all hold:

```
!connection?.saveData && !/^(slow-)?2g$|^3g$/.test(connection?.effectiveType ?? '4g')
&& (deviceMemory ?? 8) >= 4 && (hardwareConcurrency ?? 8) > 4
&& !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden
```

AV1 primary, H.264 High fallback, ≤1.8 MB for a 6 s loop at 1280×720 — not 1080p, which is
indistinguishable at this scrim opacity and playback size. Playback pauses on `document.hidden`
and on leaving the viewport (§13.7): a fan spinning up is an anti-luxury signal.

## 6.6 Render and hydration strategy

The page is server-rendered HTML in full; hydration is per-island. Nothing here is a client-only
route.

| Section | SSR | Hydration | Why |
|---|---|---|---|
| Header | Yes | Eager — search overlay + cart | The first things a returning visitor reaches for |
| S1 Hero | Yes | Lazy (`requestIdleCallback`), video only | Poster and type need no JS |
| S2 Manufacturing | Yes | Lazy on intersect — inline clip | Clip is an enhancement |
| S3 Best sellers | Yes | Lazy on intersect — quick-add only | Cards are `<a>`; they work with zero JS |
| S4 Trust row | Yes | **Never hydrates** | Static text and inline SVG |
| S5 Categories | Yes | **Never hydrates** | Links with a CSS-only Lift |
| S6 Story | Yes | Lazy on intersect — parallax only | Content complete without motion |
| S7 Production | Yes | Lazy on intersect — scroll reveal | Degrades to a static stacked list |
| S8 Reviews | Yes | Lazy on intersect — carousel controls | Renders as a scrollable list without JS |
| S9 Wholesale | Yes | **Never hydrates** | A link to `/wholesale`, not an inline form |
| S10 Blog | Yes | **Never hydrates** | Three links |
| S11 CTA | Yes | Lazy on intersect — form validation | Form posts natively if JS never arrives |

Six of eleven sections ship zero JavaScript. That is how a heavily animated page reaches 98–100
Performance: the animation budget ([13-motion-system.md](13-motion-system.md) §13.5) is spent on
four islands, not eleven.

---

## 6.7 Section specifications

Character limits are maxima set against the **German** string, which sets 8–12% longer
([10-typography.md](10-typography.md) §10.4); Ukrainian source copy always fits if German does.

### S1 — Hero

**Purpose.** Establish place, scale and register in one viewport, and offer exactly one action.
**Trust job.** Rank-1 evidence delivered before any commercial content — it answers "who is
this" so that nothing below has to.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ▣LOGO Каталог Виробництво Опт Журнал ⌕⛌ │   │ ☰ ▣LOGO      ⌕ ⛌2 │
├──────────────────────────────────────────┤   ├────────────────────┤
│ ░░ POSTER/VIDEO min(82vh,820px) ░░░░░░░ │   │ ░ POSTER 420px   ░ │
│ ░ scrim .72→transparent, left 58%  ░░░░ │   │ ░ focal honoured ░ │
│ ░ КАРПАТИ · КОСІВСЬКИЙ РАЙОН  overline░ │   │ ░ КАРПАТИ·КОСІВ  ░ │
│ ░ Ліжники з Карпат     h1 display-xl  ░ │   │ ░ Ліжники з      ░ │
│ ░                      cols 2–7       ░ │   │ ░ Карпат         ░ │
│ ░ Понад 30 років виробляємо натуральні░ │   │ ░┌──────────────┐░ │
│ ░ вовняні вироби в Карпатах.          ░ │   │ ░│Дивитись катал│░ │
│ ░ ┌───────────────┐ ┌────────────────┐░ │   │ ░└──────────────┘░ │
│ ░ │Дивитись катало│ │Як ми це робимо│░ │   │ ░ Ліжники›Ковдри› ░ │
│ ░ └───────────────┘ └────────────────┘░ │   └────────────────────┘
│ ░ ─Ліжники─┬─Ковдри─┬─Пряжа─┬─Овчина─░ │    ▽ subheadline + 2nd
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ [▶/⏸] ░░ │      CTA below the fold
│                ↓ scroll cue              │
└──────────────────────────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline | 32 | **Range and raion, not village and not country** (F6). «КАРПАТИ · КОСІВСЬКИЙ РАЙОН» — the raion narrows the range to something checkable without demanding a proper noun the visitor has to learn, and the country is never named because a Ukrainian visitor does not need it and a German one reads the delivery terms |
| H1 | 48 / 2 lines | The page's only `h1`. A maker's statement, not an offer. Suggested: «Ліжники з Карпат» |
| Subheadline | 120 | Disposable on mobile by design. Carries the client-approved line **verbatim**: «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.» (62 chars, well inside the German expansion) |
| Primary CTA | 22 | → `/catalog` |
| Secondary CTA | 26 | → `/production` |
| Rail | 4 × 16 | Wool-led: Ліжники, Ковдри, Пряжа, Овчина. Own manufacture only |

| Facet | Value |
|---|---|
| **Data** | `Banner` where `placement="home_hero"`, `isActive`, date-windowed, `position` asc → `BannerTranslation`; `Media` (`kind=VIDEO`, `posterId`, `focalX/Y`, `textSafeZone`, `blurhash`) + `MediaTranslation.alt`; rail from `Category` `isFeatured && isActive` order `sortOrder` take 4, restricted to the own-manufacture subtree ([25-database-schema.md](25-database-schema.md) §25.3–25.4, §25.8) |
| **Type** | `overline` · `display-xl` · `body-lg` · `button` |
| **Spacing** | `container-full`; inner text block `container` with `space-20` bottom inset desktop / `space-12` mobile; CTA gap `space-4`; rail gap `space-6` |
| **Surface** | Media with scrim treatment 1 ([09-color-palette.md](09-color-palette.md) §9.6) — not a §8.3 surface; text is `fleece-100` on scrim |
| **Motion** | Type block **Rise**, 60 ms stagger capped at 4. Poster: none. Scroll cue: 2.4 s `translateY` loop, `linear`, off under reduced motion |
| **LCP** | Owns LCP — §6.5. Preload emitted server-side; no webfont blocks it |
| **Fallback** | No active `Banner` → `Setting["home.hero.defaultMediaId"]`. That missing too → a `forest-900` panel with H1 and CTA and no image. Never a broken frame or a stretched placeholder |

`textSafeZone` is load-bearing: at 375 px the 16:9 poster crops to ~4:5, and without the stored
zone the crop routinely lands the H1 on a high-detail region where the scrim stops sufficing. It
is authored per media record in the admin, not guessed at render time.

**The copy direction, and why the H1 carries the place rather than the sensation.** The original
draft's «Вовна, яку ми знаємо на дотик» is a good sentence and a weak position: it is a claim
about care that any competent competitor can also write, and it is unfalsifiable, which is
exactly the register [01-brand-strategy.md](01-brand-strategy.md) §1.5 rejects. «Ліжники з
Карпат» is the opposite kind of sentence — product plus place, no adjective — and it puts the
approved tagline directly beneath it rather than paraphrasing it.

The Round-2 draft substituted «Ліжники з Яворова» here.
[00-client-decisions-3.md](00-client-decisions-3.md) F6 withdraws that substitution, and this
slot table is the revert. See §6.3 for the full reasoning; in one line: «Карпати» to be
understood, «Яворів» to be believed, and the hero's only job is to be understood.

Split across the two slots so the H1 stays inside 48 characters and so the mobile visitor who
never sees the subheadline still gets the load-bearing half:

| Slot | Carries | Survives the 375 px crop? |
|---|---|---|
| Overline | The range and the raion, as a location stamp | Yes |
| H1 | «Ліжники з Карпат» — product + place | Yes |
| Subheadline | «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.» — the approved line, verbatim | No, by design |

The mobile loss is acceptable and was checked against F6 rather than assumed. At 375 px the
visitor gets product, place and register from the H1 and the media; what she loses is the
duration claim, which S2 restates 600 px later at `display-lg` in the stat strip. Nothing
load-bearing is lost to the crop.

Three constraints on this copy:

1. **No superlative is asserted in the hero at all.** The «столиця ліжникарства» line was
   attributed («села, яке **називають**») and was safe, but it belongs to Яворів and Яворів has
   moved to S2. Where the phrase is used it must stay attributed: «Ми — столиця ліжникарства»
   would be a claim Вівчарик makes about itself, and it is both false and the kind of false that
   is easy to catch.
2. **The 30-year line attaches to the manufacturing, never to a company** (§D1, and see S2).
   «Понад 30 років виробляємо» is continuity of practice, which is what it is. «Компанія
   заснована 1992 року» is a registration claim, which is not.
3. **No heritage-register wording**, per the verification constraint in §6.3.

`{{YEARS_EXPERIENCE}}` continues to render from the token in all four locales. The Carpathian
line also translates without a footnote — «Carpathian wool», «Karpatenwolle», «wełna z Karpat»
all land on first reading, whereas «from Yavoriv» would require a `de` or `pl` visitor to accept
a place name they cannot place. That was the weakest point of the Round-2 proposal and it is the
one F6 turns on.

**Хутро caveat for the hero rail.** The fourth rail chip is «Овчина». Under `de` and `pl` it is
suppressed and replaced by the next own-manufacture wool family, because E11 recommends those
locales launch wool-only pending EU species-declaration paperwork
([15-navbar-specification.md](15-navbar-specification.md) §15.12). The rail reads from the same
locale-scoped `Setting` as the nav projection, so this is data, not a branch.

**The hero footage must contain wool being worked, and a person working it.** Wool leads the
brand ([00-client-decisions.md](00-client-decisions.md) §D3); sheepskin and leather are
catalogue breadth, not the opening statement. Filming the 30-year-old machines is what
substantiates the age claim in the absence of any certificate (§D1) — the machinery is the
document.

---

### S2 — Manufacturing proof

**Purpose.** Convert the hero's atmosphere into verifiable manufacturing fact, before any price.
**Trust job.** Answers A3 ("real factory or reseller?") — the objection that kills the sale for
Personas 1 and 3. Placing it second is the brief's strongest structural decision; kept unamended.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ВИРОБНИЦТВО                              │   │ ВИРОБНИЦТВО        │
│ Ми не перепродаємо.   ┌────────────────┐ │   │ Ми не перепродаємо.│
│ Ми виробляємо.        │ INLINE CLIP 4:5│ │   │ Ми виробляємо.     │
│                       │ muted·loop·8s  │ │   │ ┌────────────────┐ │
│ Понад 30 років        │ hands at loom, │ │   │ │ CLIP 4:5 320px │ │
│ виробляємо натуральні │ person visible │ │   │ └────────────────┘ │
│ вовняні вироби в      │ cols 7–12      │ │   │ Понад 30 років…    │
│ Карпатах. Точніше —   │ mask reveal    │ │   │ ┌─────┬─────┬────┐ │
│ у с. Яворів.          └────────────────┘ │   │ │30+  │  7  │ 12 │ │
│ ┌──────┬──────┬─────┐  display-lg,       │   │ │років│етапів│кат.│ │
│ │ 30+  │  7   │ 12  │  tabular-nums      │   │ └─────┴─────┴────┘ │
│ │років │етапів│ кат.│                    │   │ Подивитись етапи → │
│ └──────┴──────┴─────┘                    │   └────────────────────┘
│ Подивитись усі етапи →                   │
└──────────────────────────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline | 24 | |
| Heading | 40 / 2 lines | `display-md` |
| Body | 200 | Opens with the approved line **verbatim** — «Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.» — and then, in the second sentence, narrows it: «Точніше — у с. Яворів, селі, яке називають столицею ліжникарства.» This is the first place on the page where the village appears, and it is the right one. Specificity is the signal ([01-brand-strategy.md](01-brand-strategy.md) §1.4, "Rooted"), but specificity only reads as evidence once the reader knows what is being evidenced |
| Stat value ×3 | 6 | `tabular-nums`, never a counting animation |
| Stat label ×3 | 22 | Pattern C, [10-typography.md](10-typography.md) §10.5 |
| Link | 28 | → `/production` |

| Facet | Value |
|---|---|
| **Data** | `MediaAlbum` `key="production-proof"` → first `Media` with `kind=VIDEO` + `posterId`; stats from `Setting["home.proof.stats"]` (JSON, per-locale labels). Footage and stats cover own manufacture only, which per E6 now legitimately includes the hide pipeline |
| **Type** | `overline` · `display-md` · `body-lg` · stats `display-lg` + `caption` |
| **Spacing** | `--section-y-md`; text cols 1–6, media cols 7–12; stat gap `space-8`; `space-10` above the link |
| **Surface** | **Page** (`--bg-page`) |
| **Motion** | Media **Mask** (`clip-path` inset 100%→0, `dur-cinematic`, `ease.expo`, inner `scale 1.08→1`); text and stats **Rise**, 60 ms stagger |
| **LCP** | Not LCP. Clip poster `loading="lazy"`; `<video>` mounts on intersect under the §6.5 guard |
| **Fallback** | No album → text-and-stats at full width, no empty media frame. Missing a stat → that column is omitted and the rest re-flow; a stat slot never renders a dash or a zero |

**The 30-year claim — how it must be rendered.** [00-client-decisions.md](00-client-decisions.md)
§D1 resolves the age question and approves one line verbatim: «Понад 30 років виробляємо
натуральні вовняні вироби в Карпатах.» Three constraints bind this section and every locale of
it:

1. **The claim attaches to the manufacturing, never to a company.** "виробляємо понад 30 років",
   never "компанія заснована 1992 року". The operating ФОПs are newer than the craft; conflating
   the two turns a defensible continuity claim into an unsupportable registration claim.
2. **No certificate exists, so nothing may look like one.** No accreditation marks, no seal
   graphics, no "офіційно", no anniversary medallion in the stat strip. The stat renders as
   plain tabular numerals on the page background.
3. **`Organization.foundingDate` is not set to 1992.** The 30-year story lives in on-page prose
   and in `description`, where it is editorial, not machine-asserted
   ([29-seo-architecture.md](29-seo-architecture.md)).

**This section is where Яворів enters the page**, per
[00-client-decisions-3.md](00-client-decisions-3.md) F6. The sequencing is the whole argument: the
hero states what the business does in words every visitor already understands, and S2 — with a
loom running beside it and a stat strip under it — names the village. A reader who meets «Яворів»
here meets it as corroboration of something she has just been told. A reader who met it in the
H1 met it as a proper noun she had to accept on faith. «Карпати» to be understood, «Яворів» to be
believed; this is the section where belief becomes the job.

The body must stay inside 200 characters with both sentences, which is achievable in Ukrainian
and tight in German. If the German string overruns, the clause that is cut is «селі, яке
називають столицею ліжникарства», never the village name — the name is the evidence, the epithet
is the colour.

`{{YEARS_EXPERIENCE}}` resolves to `понад 30` / `over 30` / `ponad 30` / `über 30`. It is still
rendered from the token rather than typed into four translation files, so a future correction is
one edit.

The stat strip changed from the earlier draft: "2016 — швейний цех" and "14 категорій" were
figures from the adjacent business and have been removed. The three stats are now years of
manufacturing, production stages performed in-house, and own-manufacture families.

### The full cycle may now be claimed here — including hides

[00-client-decisions-2.md](00-client-decisions-2.md) E6 closes the tanning question left open in
§D3: «Вівчарик самостійно проводить весь процес від сировини до виробів.» Wool, sheepskin and
leather are all `OWN_MANUFACTURE`. This section may therefore state the full cycle without
qualification, and S7's stage rail may carry the hide pipeline alongside the wool one.

**Two constraints come with it.**

1. **Any stage claimed must be photographed.** E6's self-policing rule, inherited from
   [01-brand-strategy.md](01-brand-strategy.md) §1.8: a manufacturing claim is only as strong as
   the evidence beside it. If tanning is claimed, tanning is photographed; if a stage cannot be
   photographed it is not asserted. This keeps the page honest without anyone auditing it, and it
   folds the requirement into the Yavoriv shoot E5 already schedules. Operationally: the stat
   «7 етапів» and S7's stage rail read from the **same** array, and a stage with no `Media` row
   renders as a numbered panel — which is visible, and therefore self-correcting, in a way a
   silently inflated stat is not.
2. **«Бельгійська технологія» is struck from this document and from the site.** E6 is explicit
   that the phrase belonged to the adjacent business and must not be inherited. It appears
   nowhere on the homepage, nowhere in S2's body copy, and nowhere in the production page's stage
   descriptions ([20-production-page-specification.md](20-production-page-specification.md)).
   Borrowed technical vocabulary is the easiest kind of false claim to make accidentally and the
   easiest for a wholesale buyer to catch.

The hide cycle is **not** promoted to the hero. S1 stays wool-led per §D3 — wool leads the brand,
hides are catalogue breadth — and E6 changes what may be *claimed*, not what leads.

---

### S3 — Best-selling products

**Purpose.** Give the ready-to-buy visitor a route to purchase without navigating.
**Conversion job.** First price exposure, staged *after* the manufacturing proof so price reads
as justified rather than high (§6.1 job 3).

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ НАЙЧАСТІШЕ ОБИРАЮТЬ        Усі товари →  │   │ НАЙЧАСТІШЕ ОБИРАЮТЬ│
│ Що купують найчастіше                    │   │ Що купують найчас. │
│ ┌────────┐┌────────┐┌────────┐┌────────┐ │   │ ┌───────┐┌───────┐→│
│ │ 4:5 IMG││ 4:5 IMG││ 4:5 IMG││ 4:5 IMG│ │   │ │ 4:5   ││ 4:5   │ │
│ │radius 0││        ││◆ ручна ││        │ │   │ │       ││◆ ручна│ │
│ ├────────┤├────────┤├────────┤├────────┤ │   │ ├───────┤├───────┤ │
│ │Ліжники ││Ковдри  ││Гуні    ││Шкарпетк│ │   │ │Ліжники││Ковдри │ │
│ │Черемош ││Полонина││Верховин││Гуцулка │ │   │ │Черемош││Полонин│ │
│ │ ○○○○ ₴ ││ ○○○○ ₴ ││ ○○○○ ₴ ││  ○○○ ₴ │ │   │ │ ○○○○ ₴││ ○○○○ ₴│ │
│ │150×200 ││140×200 ││◔14 днів││36–45   │ │   │ └───────┘└───────┘ │
│ └────────┘└────────┘└────────┘└────────┘ │   │ ●○○○  2.15 peek    │
└──────────────────────────────────────────┘   │ [   Усі товари   ] │
                                                └────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline / heading / link | 24 / 36 / 20 | Link → `/catalog` |
| Card family | 24 | `CategoryTranslation.name`, caption, muted |
| Card name | 44 | `ProductTranslation.name` |
| Card price | — | From `priceMinMinor`/`priceMaxMinor`; a range renders `5 300 – 7 300 ₴`, never "from" |
| Card meta | 28 | Dominant variant axis, or `madeToOrderDays` lead time |
| Card badge | 1 max | `isHandmade` → gold tier; `isUniquePiece` → «остання». Never both. No origin badge is needed here, because everything in this rail is own manufacture by construction |

| Facet | Value |
|---|---|
| **Data** | `Product` where `origin = OWN_MANUFACTURE`, `status=ACTIVE`, `publishedAt ≤ now`, `deletedAt = null`, `inStock`, take 4 desktop / 8 mobile rail. The origin predicate is enforced in the query, not by curation discipline. Ordering: no order history exists at launch, so the list is curated via `Setting["home.bestsellers.productIds"]`, replaced post-launch by a nightly materialised view over `OrderItem.quantity` (30 d). **Schema addenda requested** against [25-database-schema.md](25-database-schema.md): `ProductOrigin`/`partnerName`/`partnerRegion` per [00-client-decisions.md](00-client-decisions.md) §D3, plus the sales view per §25.10 |
| **Type** | `overline` · `display-md` · Pattern B per card (`caption` / `h3` / `h3` price, `tabular-nums`) |
| **Spacing** | `--section-y-md`; grid gap `space-6` desktop / `space-4` mobile; card padding `space-4`, **zero outer margin** ([11-spacing-system.md](11-spacing-system.md) §11.4 rule 1) |
| **Surface** | **Alt** (`--bg-alt`); cards on `--bg-surface` with a hairline |
| **Motion** | Cards **Rise**, 60 ms stagger capped at 6. Hover **Lift** — `y -4`, shadow `sm→md`, inner image `scale 1→1.04` inside an `overflow:hidden` frame so the layout box never changes |
| **LCP** | Not LCP; all images lazy. Card imagery is `radius-none` ([11-spacing-system.md](11-spacing-system.md) §11.5) |
| **Fallback** | Fewer than 4 qualifying products → 2 or 3 columns at full card width, never padded with placeholders. Zero → the section is omitted server-side and S4 moves up. A homepage never renders an empty product grid |

Price never animates ([13-motion-system.md](13-motion-system.md) §13.11). No strike-through RRP
appears here even where `compareAtMinor` is set — discount theatre is forfeited by
[01-brand-strategy.md](01-brand-strategy.md) §1.9. Prices are shown as `○○○○ ₴` in the wireframe
because no Вівчарик price list is confirmed; the figures in
[00-existing-site-audit.md](00-existing-site-audit.md) §0.6 belong to the adjacent business and
must not be copied into mockups where they can be mistaken for approved pricing.

**Yarn, ровниця and вовна для рукоділля need a different card.** They are priced by weight
(`PricingUnit.KILOGRAM` / `SKEIN`, [00-client-decisions.md](00-client-decisions.md) §D4), so the
price slot renders `___ ₴ / 100 г` and the meta slot carries метраж and товщина rather than a
dimension. A weight-priced product rendered with a unit-priced card is the kind of small
inconsistency the needleworker audience reads as incompetence.

---

### S4 — Why customers trust us

**Purpose.** State delivery, returns, payment and origin plainly at the moment a price has just
been seen.
**Trust job.** Answers A4 (will it arrive) and A5 (can I return it) without a scroll to the
footer. Rank-6 evidence placed adjacent to rank-1 evidence so it inherits its credibility.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ┌────────┬────────┬────────┬───────────┐ │   │ ⬡ Власне виробницт.│
│ │ ⬡      │ ⬡      │ ⬡      │ ⬡         │ │   │   Яворів, Косівщина│
│ │ Власне │{{RET}} │ Нова   │ Оплата    │ │   │ ───────────────────│
│ │ вироб- │днів на │ пошта  │ карткою   │ │   │ ⬡ {{RET}} днів на  │
│ │ ництво │поверне-│{{NP}} ₴│ або при   │ │   │   повернення       │
│ │повний  │ння     │        │ отриманні │ │   │ ───────────────────│
│ │цикл    │Без по- │Укрпошта│ Онлайн і  │ │   │ ⬡ Нова пошта {{NP}}│
│ │Яворів, │яснення │{{UP}} ₴│ накладним │ │   │   Укрпошта {{UP}}  │
│ │Косівщи-│причин  │Самовивіз│платежем  │ │   │ ───────────────────│
│ └────────┴────────┴────────┴───────────┘ │   │ ⬡ Оплата карткою   │
│  hairline dividers · no cards · no shadow│   └────────────────────┘
└──────────────────────────────────────────┘     2×2 grid at 768
```

| Slot | Limit | Note |
|---|---|---|
| Item title ×4 | 28 | German sets longest — verify «Rückgabe innerhalb von 14 Tagen» fits at 2 lines |
| Item body ×4 | 64 | |
| Icon ×4 | — | Icon registry via `iconKey` ([12-iconography.md](12-iconography.md)). Custom-drawn, single weight, never an emoji |

| Facet | Value |
|---|---|
| **Data** | `Setting["home.trust.items"]` (JSON, per-locale). Figures read from the same settings keys checkout reads, so a shipping change cannot leave the homepage stating a stale price. `{{RETURN_DAYS}}`, `{{NP_BRANCH_PRICE}}`, `{{UKRPOSHTA_PRICE}}` are **unresolved**: the 14-day and 80/55 UAH figures were observed on the adjacent business ([00-existing-site-audit.md](00-existing-site-audit.md) §0.5–0.6) and carry no authority for Вівчарик |
| **Type** | `h4` titles · `body-sm` bodies. No overline, no section heading — this is a statement band, not a section |
| **Spacing** | `--section-y-sm` (compact by intent); column gap `space-8`; 1 px `--border-hairline` dividers, not card edges |
| **Surface** | **Page** (`--bg-page`), hairlines only — [08-design-system.md](08-design-system.md) §8.3: the default treatment is a hairline on a tonal background, not a shadow |
| **Motion** | **Rise**, 60 ms stagger. No hover state; these are statements, not controls, and they are not links |
| **LCP** | Not LCP. Icons are inline SVG in the server response: no request, no CLS |
| **Fallback** | The list is fixed at 4 and validated at build. A missing setting renders the compiled default from the content package rather than an empty cell — a trust row with a hole in it is worse than no trust row |

These are the weakest trust signals in the ranking ([01-brand-strategy.md](01-brand-strategy.md)
§1.8 rank 6–7) and are deliberately rendered in the plainest available form. Dressing up a weak
signal is what makes it read as marketing.

**Item 1 is doing different work from items 2–4.** «Власне виробництво» is the origin claim from
§6.2 stated as policy, and it is first in the row for that reason. It is also the only one of the
four that the partner range makes contestable, which is precisely why it must be said plainly on
the homepage and then honoured by a visible per-product label everywhere else
([00-client-decisions.md](00-client-decisions.md) §D3). A trust row that claims own manufacture
while the catalogue quietly mixes origins is worse than no trust row at all.

Item 1's body now reads «повний цикл — Яворів, Косівщина», which E6 and E2 together make
defensible: the cycle is genuinely full, and the place is genuinely specific. It carries no
hours, per E3 — this row states policy, and policy does not vary by day. The village name is
retained here even though F6 removes it from the hero: S4 sits below the first price, the visitor
has scrolled past S2, and this is a supporting surface, which is exactly where
[00-client-decisions-3.md](00-client-decisions-3.md) F6 places it.

**Item 3 changes under F4, and the change is not cosmetic.**
[00-client-decisions-3.md](00-client-decisions-3.md) resolves the shipping model: the **buyer
pays everything** — carriage and all customs duties and import taxes, effectively DAP. Carriers
are Nova Poshta, Ukrposhta and others chosen case by case, so an international rate cannot be
computed at render time.

| Locale | Item 3 body |
|---|---|
| `uk` | Nova Poshta `{{NP_BRANCH_PRICE}}` ₴ · Ukrposhta `{{UKRPOSHTA_PRICE}}` ₴ · самовивіз у Яворові. Unchanged |
| `de`, `pl`, `en` | **No figure at all.** «Доставка за кордон — розраховуємо під замовлення» in the locale's own words, plus the customs sentence below |

The customs sentence is required on the international variants of this row and is stated in full
on the checkout path before the pay button
([18-checkout-specification.md](18-checkout-specification.md) §18.23):

> «Ціна не включає митні збори та податки країни призначення. Їх сплачує отримувач при
> отриманні.»

Three consequences bind this row:

1. **A number is never shown where a number cannot be honoured.** Publishing a flat international
   figure in a trust row and then quoting a different one at checkout destroys the row's entire
   function. An honest «розраховуємо під замовлення» is a weaker sentence and a stronger signal.
2. **Free shipping never applies internationally**, at any order value. If a free-shipping
   threshold is ever introduced for `uk`, the copy must be locale-scoped, not global — a
   threshold stated globally and honoured domestically is a promise broken at the worst possible
   moment, after payment.
3. **The disclosure happens before payment, not after.** An EU buyer surprised by an import VAT
   bill refuses the parcel and the shop absorbs an international return. This is the commonest
   way a small cross-border shop loses money, and it is prevented by one sentence placed where it
   has to be read rather than inside a collapsed accordion.

The recommended international model is **enquiry-then-invoice** rather than published flat-rate
zones (F4): the customer submits the order, receives a quote, then pays. It is slower and it is
what the business actually does, and a trust row that describes the real process outperforms one
that describes a tidier imaginary one.

`{{RETURN_DAYS}}` acquires a second constraint from E11. The `de` and `pl` locales are
transactional, which triggers the EU 14-day right of withdrawal as a **statutory minimum** rather
than a merchant policy. Under those locales item 2 must state the statutory right and link to the
withdrawal page and the model form ([16-footer-specification.md](16-footer-specification.md)
§16.10); it must not present the statutory right as a generosity. Under `uk` it states the
Ukrainian distance-selling minimum. One `Setting` key per locale, not one global number.

**No certification claim appears here, or anywhere on this page.** §D1 is explicit that no
certificates exist. The fourth slot is payment, not a quality seal, and the icon set contains no
rosette, medal, or shield form ([12-iconography.md](12-iconography.md)).

---

### S5 — Categories

**Purpose.** Route the visitor into one of the three own-manufacture material worlds, wool first.
**Conversion job.** The primary *navigational* conversion on the page, and the place where the
site states structurally that it is wool-led with sheepskin and leather as breadth — the
architecture confirmed in [00-client-decisions.md](00-client-decisions.md) §D3.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ВЛАСНЕ ВИРОБНИЦТВО                       │   │ ВЛАСНЕ ВИРОБНИЦТВО │
│ Вовна передусім.                         │   │ Вовна передусім.   │
│ ┌──────────────────┐┌────────┐┌────────┐ │   │ ┌────────────────┐ │
│ │ ВОВНА            ││ ОВЧИНА ││ ШКІРА  │ │   │ │IMG 4:3  ВОВНА  │ │
│ │ Ліжники, ковдри, ││        ││        │ │   │ │     12 кат. →  │ │
│ │ гуні, пряжа,     ││        ││        │ │   │ └────────────────┘ │
│ │ шкарпетки, пояси ││        ││        │ │   │ ┌────────────────┐ │
│ │ 12 категорій →   ││ кат. → ││ кат. → │ │   │ │IMG 4:3  ОВЧИНА │ │
│ │ cols 1–6, 4:3    ││cols 7–9││cols10–12│ │   │ └────────────────┘ │
│ └──────────────────┘└────────┘└────────┘ │   │ ┌────────────────┐ │
│ Ліжники · Ковдри вовняні · Гуні ·        │   │ │IMG 4:3  ШКІРА  │ │
│ Камізельки · Подушки · Шкарпетки · Капці │   │ └────────────────┘ │
│ · Пояси · Накидки · Вовняна пряжа ·      │   │ ▸ Усі категорії    │
│ Ровниця · Вовна для рукоділля            │   │   Ліжники · Ковдри…│
│  ← flat crawlable index, always in HTML  │   └────────────────────┘
└──────────────────────────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline / heading | 20 / 36 | Overline names own manufacture explicitly — it is the section's whole claim |
| Tile title ×3 | 22 | `CategoryTranslation.name` |
| Tile subtitle ×3 | 56 | Child names comma-joined, truncated at the word |
| Tile count ×3 | 16 | Live child count, never hard-coded |
| Flat index | 12 × 32 | Every wool family, always present in the HTML |

| Facet | Value |
|---|---|
| **Data** | `Category` where `parentId = <own-manufacture root> && isActive` order `sortOrder`, with `heroMedia` and `_count.children`; `CategoryTranslation` for the active locale ([25-database-schema.md](25-database-schema.md) §25.3) |
| **Type** | `overline` · `display-md` · tile title `h3` · subtitle `body-sm` · index `body-sm` |
| **Spacing** | `--section-y-md`; asymmetric 6/3/3 split; gap `space-6`; index `space-10` below the tiles |
| **Surface** | **Alt** (`--bg-alt`); tiles are full-bleed imagery with scrim treatment 1 — no card chrome |
| **Motion** | Tiles **Rise** on entry; hover **Lift** with inner image `scale 1.04`, `dur-base`, `ease.gentle`; tile → listing uses **Morph** (`layoutId` on the tile image) where supported |
| **LCP** | Not LCP; lazy, `sizes="(max-width:767px) 100vw, (max-width:1023px) 50vw, 33vw"` |
| **Fallback** | A category with no `heroMedia` renders as a `forest-800` tile with the title only — never a grey box, never a stock image. A category with zero active products is excluded server-side; routing a visitor to an empty listing is worse than not offering the route |

**Three tiles, not four.** ПАРТНЕРСЬКІ ВИРОБИ is deliberately absent, per the origin rule in
§6.2. It is reachable from the header, the catalogue root, and search — it is not hidden — but
it is not presented as one of the brand's material worlds, because it is not one. ДЕРЕВО is
likewise absent: [00-client-decisions.md](00-client-decisions.md) §D3 keeps the wooden category
in `DRAFT` with an inactive node, and putting an unpopulated tile on the homepage to signal a
roadmap is how a site acquires a dead end.

The tile weighting is 6/3/3, not 4/4/4. Wool gets half the row because wool leads the brand;
equal thirds would state that the three are equally central, which contradicts §D3 and dilutes
the one story the homepage is telling.

The flat 12-item wool index exists for two independent reasons on a cold-start domain: it gives
crawlers and AI retrieval a complete, link-equity-passing family list on the only page with any
authority ([30-ai-search-optimization.md](30-ai-search-optimization.md)), and it gives keyboard
and screen-reader users a route that does not require interpreting three photographic tiles. On
a domain with no ranking history this index is doing more work than it would on an established
site, because it is one of very few internal-link surfaces Google will crawl early.

---

### S6 — Story

**Purpose.** Convert a transactional visit into brand memory, in the brand's own voice.
**Trust job.** Rank-2 evidence — named, faced people. This is what separates "I bought a
blanket" from "I bought it from them".

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ┌──────────────────┐                     │   │ ┌────────────────┐ │
│ │ PORTRAIT 4:5     │ НАША ІСТОРІЯ        │   │ │ PORTRAIT 4:5   │ │
│ │ named person,    │                     │   │ │ full bleed     │ │
│ │ hands visible    │ Ті самі машини.     │   │ └────────────────┘ │
│ │ bleeds to left   │ Ті самі руки.       │   │ НАША ІСТОРІЯ       │
│ │ edge             │                     │   │ Ті самі машини.    │
│ │ parallax 0.82×   │ Чесальні машини ста-│   │ Ті самі руки.      │
│ │ cols 1–5         │ ли тут на початку   │   │ Чесальні машини…   │
│ │                  │ 90-х. Відтоді прала,│   │                    │
│ └──────────────────┘ чесала, пряла, ткала│   │ «Вовну не можна    │
│                      і шила — тут.       │   │  поспішати.»       │
│                     «Вовну не можна      │   │ — {{FOUNDER_NAME}} │
│                      поспішати.»         │   │                    │
│                      — {{FOUNDER_NAME}}  │   │ Про нас →          │
│                      Про нас →  cols 7–12│   └────────────────────┘
└──────────────────────────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline / heading | 20 / 48 (2 lines) | |
| Body | 320 | Processes, machines and places, no adjectives ([01-brand-strategy.md](01-brand-strategy.md) §1.5). **No registration dates and no company-founding language** — §D1 binds this slot as tightly as it binds S2 |
| Pull quote | 140 | Guillemets « » applied by the CMS on save |
| Attribution | 48 | Requires `{{FOUNDER_NAME}}` — unresolved |
| Link | 20 | → `/about` |

| Facet | Value |
|---|---|
| **Data** | `Setting["home.story"]` (JSON: per-locale heading, body, quote, attribution, `mediaId`) — a `Setting` row rather than a new model because this content changes about twice a year, and a dedicated CMS table for one block is exactly the single-use abstraction [08-design-system.md](08-design-system.md) §8.2 principle 6 rejects. Portrait from `Media` + `MediaTranslation.alt` |
| **Type** | `overline` · `display-md` · `body-lg` at 62–68ch · pull quote in Display 500 at `h3` size with an `orn-600` quote mark |
| **Spacing** | `--section-y-lg` (editorial density, [11-spacing-system.md](11-spacing-system.md) §11.2); asymmetric editorial grid per §11.3 — image bleeds left, text cols 7–12 |
| **Surface** | **Page** (`--bg-page`) |
| **Motion** | Portrait **Mask** on entry, then **Parallax** at 0.82× with the 120 px displacement ceiling — one of the at-most-three parallax elements permitted per viewport ([13-motion-system.md](13-motion-system.md) §13.4). Text **Rise** |
| **LCP** | Not LCP, but the largest below-fold image; `sizes="(max-width:767px) 100vw, 42vw"`, AVIF/WebP pair |
| **Fallback** | Missing portrait → text occupies cols 3–9 centred and the parallax island never mounts. Missing `{{FOUNDER_NAME}}` → quote and attribution are both suppressed; an unattributed quote is a weaker signal than no quote |

This section carries the 30-year story in its narrative register, which is where
[00-client-decisions.md](00-client-decisions.md) §D1 wants it: prose, not structured data, not a
badge. The portrait should show a person at one of the original machines. With no certificate to
photograph, the machine *is* the evidence, and the same frame does double duty as provenance and
as the "Warm" trait's requirement that every production image contain a person
([01-brand-strategy.md](01-brand-strategy.md) §1.4).

---

### S7 — Production journey

**Purpose.** Show the full cycle as a sequence, so "повний цикл" becomes something the visitor
has seen rather than a phrase they have read.
**Trust job.** Rank-3 evidence — photographed process with dates and locations. Also qualifies
Persona 3: a wholesale buyer reads a stage list as capacity evidence.

```
DESKTOP 1440                                    MOBILE 375
┌══════════════════════════════════════════┐   ┌════════════════════┐
║ INVERTED — forest-900                    ║   ║ ПОВНИЙ ЦИКЛ        ║
║ ПОВНИЙ ЦИКЛ                              ║   ║ Сім етапів.Один цех║
║ Сім етапів. Один цех.                    ║   ║ ┌───────┐┌───────┐→║
║ 01──02──03──04──05──06──07  gold-400 rule║   ║ │ 01    ││ 02    │ ║
║  │   │   │   │   │   │   │  stroke-dash  ║   ║ │IMG 3:4││IMG 3:4│ ║
║ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐             ║   ║ │Миття  ││Сушіння│ ║
║ │3:4││3:4││3:4││3:4││3:4││3:4││3:4│      ║   ║ └───────┘└───────┘ ║
║ └──┘└──┘└──┘└──┘└──┘└──┘└──┘             ║   ║ ━━━━━░░░░░  2 / 7  ║
║ Миття Суші Чеса Пряд Ткан Пошив Оздоб    ║   ║ [Дивитись виробн.] ║
║ scroll-linked translateX, view() timeline║   ║ scroll-snap only   ║
║ Дивитись виробництво →                   ║   └════════════════════┘
└══════════════════════════════════════════┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline / heading | 20 / 36 | |
| Stage number ×7 | 2 | `tabular-nums`, `gold-400` |
| Stage label ×7 | 20 | Must match `Product.productionStage[]` keys exactly, so a PDP badge can deep-link to its stage |
| Link | 30 | → `/production` |

| Facet | Value |
|---|---|
| **Data** | Stage vocabulary from the seeded `productionStage` key list ([25-database-schema.md](25-database-schema.md) §25.3, §25.11); imagery from `MediaAlbum` `key="production-stages"`, one `Media` per stage key. The client names five stages directly in [00-client-decisions.md](00-client-decisions.md) §D1 — промислове миття, чесання, прядіння, ткання, пошиття — which substantially corroborates [00-assumptions.md](00-assumptions.md) A4. Drying and finishing are still inferred, so the **count** is unconfirmed even though the sequence is not; the layout must therefore tolerate 5, 6 or 7 stages without a redesign. [00-client-decisions-2.md](00-client-decisions-2.md) E6 additionally confirms an in-house **hide** pipeline, which is a second sequence, not extra stages appended to this one |
| **Type** | `overline` in `gold-400` · `display-md` in `fleece-100` · stage number `h3` `tabular-nums` · label `body-sm` |
| **Spacing** | `--section-y-lg`; `container-full` with a `container` inset for the heading; rail gap `space-6` |
| **Surface** | **Inverted** (`forest-900`) — the first of the two permitted Inverted sections ([08-design-system.md](08-design-system.md) §8.3) |
| **Motion** | Desktop: scroll-linked `translateX` via CSS `animation-timeline: view()` with a `useScroll` fallback, plus the connecting rule drawn by `stroke-dashoffset`. Mobile: native scroll-snap, no scroll-linked motion. Reduced motion: both degrade to a static vertical stack of all seven stages |
| **LCP** | Not LCP. Seven small renders at `sizes="(max-width:767px) 45vw, 13vw"` — total under 140 KB |
| **Fallback** | A stage with no image renders as a numbered `forest-800` panel with its label; the sequence is the content, photography is the enhancement. Fewer than 3 stages with imagery → degrade to the S4 statement-band treatment rather than showing a sparse rail |

`gold-400` on `forest-900` measures ≈7.1:1 ([09-color-palette.md](09-color-palette.md) §9.5) and
is safe for the small stage numbers. `gold-600` would not be, and is the likeliest accessibility
regression in this section.

The rail is built as a CSS grid with `grid-auto-flow: column` over the stage array, so the
number of stages is data, not layout. The heading's numeral is interpolated from the array
length rather than typed — «Сім етапів» becomes wrong the moment the client confirms six.

**The homepage shows the wool sequence only.** E6 confirms the hide pipeline is also in-house,
and the temptation is to render both here. It is refused: two rails on one section doubles the
horizontal scroll, halves each stage's image, and forces the visitor to understand a branching
process in a section whose entire value is that it reads as one line. The hide pipeline is a
first-class sequence on the production page
([20-production-page-specification.md](20-production-page-specification.md)), and this section's
closing link is what routes there. The heading stays «Сім етапів. Один цех.» — «один цех» is the
claim E6 licenses, and it is true of both pipelines.

The photograph rule from S2 binds hardest here, because this is the section that enumerates
stages by name. A stage key with no `Media` row renders as a numbered `forest-800` panel with its
label, which is honest but visibly thinner than its neighbours — deliberately so. It is the
cheapest possible mechanism for making an unphotographed claim uncomfortable to ship.

---

### S8 — Reviews

**Purpose.** Corroborate with third-party voices after seven sections of first-party claims.
**Trust job.** Rank-5 evidence. Placement after the story and the process is deliberate: a
review confirming a claim the visitor has already seen evidence for is worth more than one read
cold.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ВІДГУКИ                 Усі відгуки(128)→│   │ ВІДГУКИ            │
│ ★★★★★ 4.8 — 128 підтверджених покупок    │   │ ★★★★★ 4.8 — 128    │
│ ┌────────────┐┌────────────┐┌───────────┐│   │ ┌────────────────┐ │
│ │ ★★★★★      ││ ★★★★★      ││ ★★★★☆     ││   │ │ ★★★★★          │ │
│ │«Ліжник важ-││«Замовляли  ││«Доставка  ││   │ │«Ліжник важчий  │ │
│ │ чий ніж    ││ для готелю,││ 3 дні,все ││   │ │ ніж очікувала…»│ │
│ │ очікувала.»││ 40 шт.»    ││ як на фото││   │ │ Марія К.       │ │
│ │ Марія К.   ││ Андрій С.  ││┌──┐┌──┐   ││   │ │ ✓ покупка      │ │
│ │ ✓ покупка  ││ ✓ покупка  ││└──┘└──┘   ││   │ │ Ліжник«Мозаїка»│ │
│ │ Ліжник     ││ Шкури корів││ Оксана В. ││   │ └────────────────┘ │
│ │ «Мозаїка»  ││            ││ ✓ покупка ││   │ ━━━━░░░░░  1 / 12  │
│ └────────────┘└────────────┘└───────────┘│   │ Усі відгуки (128) →│
└──────────────────────────────────────────┘   └────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Aggregate | — | Computed from `APPROVED && isVerifiedPurchase` only |
| Quote | 180 | Truncated at a word; the card links to the full review |
| Author | 32 | First name plus an initial. Never a full surname |
| Verified badge | — | Rendered only when `isVerifiedPurchase && orderId != null` |
| Product link | 44 | → PDP |

| Facet | Value |
|---|---|
| **Data** | `Review` `status=APPROVED` order `createdAt` desc take 12, joined to `Product` → `ProductTranslation` for name and slug; `mediaIds[]` for photo reviews ([25-database-schema.md](25-database-schema.md) §25.6) |
| **Type** | `overline` · aggregate `h3` `tabular-nums` · quote `body-lg` · author `caption` |
| **Spacing** | `--section-y-md`; card padding `space-6`; grid gap `space-6` |
| **Surface** | **Page** (`--bg-page`); cards on `--bg-surface` with a hairline |
| **Motion** | **Rise**, 60 ms stagger. Carousel advance is **manual only** — auto-advance is disabled outright, not merely under reduced motion, because an auto-advancing testimonial is the Archetype C signature |
| **LCP** | Not LCP. Review photos lazy at 200×200 — the only user-generated imagery on the homepage, passing the same moderation gate as the text |
| **Fallback** | Fewer than 3 approved reviews → the section is omitted server-side, and it **will be omitted at launch**. There is no review migration: [00-client-decisions.md](00-client-decisions.md) §D2 cancels the migration workstream entirely, so this section starts empty and fills from real orders. Any seeded testimonial must carry `isVerifiedPurchase=false`, render **without a badge, and be excluded from the aggregate** — an inflated `AggregateRating` is both a structured-data violation and a trust failure |

**Launch reality.** S8 renders nothing on day one and that is the correct outcome. The
alternative — writing plausible testimonials, or importing the adjacent business's — is the one
failure on this page that is unrecoverable, because a customer who recognises a borrowed review
disbelieves the factory film too. The homepage is designed to look complete at ten sections: the
surface alternation in §6.8 still resolves with S8 absent, because S7 (Inverted) is followed by
S9 (Alt), which is a legal transition.

**Round 2 makes this binding rather than advisory.** [00-client-decisions-2.md](00-client-decisions-2.md)
E5 permits products and photographs to be reused from the adjacent business's site — and
explicitly **excludes reviews**: «Do not copy. They were given to a different seller.» That
exclusion is stronger than the duplicate-content reasoning that governs product text. A copied
product description is a ranking problem; a copied review is a false statement about who a named
person did business with, rendered into `AggregateRating` structured data, on a page whose entire
purpose is credibility. There is no version of it that is recoverable.

So the permission granted in E5 does not reach this section at all. S8 stays empty until real
`Order`-linked reviews exist, and the first one will arrive weeks after launch.

---

### S9 — Wholesale

**Purpose.** Remove Persona 3 from the consumer funnel and hand them a qualified path.
**Conversion job.** The only place on the homepage where the `accent` button variant is
permitted ([08-design-system.md](08-design-system.md) §8.5). It is the second decision on the
page and it must be legible as a *different* decision.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ┌────────────────────┐ ОПТОВИКАМ         │   │ ┌────────────────┐ │
│ │ IMG 16:10          │                   │   │ │ IMG 16:10      │ │
│ │ pallets, roll      │ Повний цикл.      │   │ └────────────────┘ │
│ │ stock, loaded van  │ Одні руки.        │   │ ОПТОВИКАМ          │
│ │ volume, not craft  │                   │   │ Повний цикл.       │
│ │ cols 1–7           │ Знижки до 20%.    │   │ Одні руки.         │
│ │                    │ Дропшипінг.       │   │ Знижки до 20%.     │
│ │                    │ Пошиття на замов- │   │ Дропшипінг.        │
│ └────────────────────┘ лення: колір,     │   │ ┌────────────────┐ │
│                        розмір, хутро.    │   │ │ Умови співпраці│ │
│                        ┌────────────────┐│   │ └────────────────┘ │
│                        │Умови співпраці ││   │ Відповідаємо до    │
│                        └───[accent gold]┘│   │ {{SLA}} год        │
│                        Відповідь {{SLA}}г│   └────────────────────┘
└──────────────────────────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline / heading | 16 / 40 | Heading is tagline #2 from [01-brand-strategy.md](01-brand-strategy.md) §1.5 |
| Body | 200 | Must name all three offers: volume discount, dropshipping, custom production |
| CTA | 24 | → `/wholesale`, `accent` variant |
| SLA line | 40 | `{{WHOLESALE_SLA_HOURS}}` — unresolved |

| Facet | Value |
|---|---|
| **Data** | `Setting["home.wholesale"]`. The form lives on `/wholesale` — [00-assumptions.md](00-assumptions.md) D1 fixes wholesale as enquiry-led, and an inline homepage form would collect leads that `Lead.businessType` cannot classify |
| **Type** | `overline` · `display-md` · `body-lg` · `button` |
| **Spacing** | `--section-y-md`; 7/5 asymmetric split; `space-8` between body and CTA |
| **Surface** | **Alt** (`--bg-alt`) |
| **Motion** | Image **Mask**; text **Rise**. The accent button has no entrance animation of its own — it arrives with its Rise group |
| **LCP** | Not LCP |
| **Fallback** | Never omitted: it is the only route to a `LeadKind.WHOLESALE` conversion on this page. Missing image → text at cols 3–9 |

Dropshipping must be named here. It was absent from the brief, is offered by the live business
([00-existing-site-audit.md](00-existing-site-audit.md) §0.6), and is a distinct lead type
requiring a `DROPSHIP` member on `LeadKind`.

**It is named without scope here, and scoped on the wholesale page.**
[00-client-decisions-2.md](00-client-decisions-2.md) E7 restricts both dropshipping and private
label to **own manufacture only** — a partner whose name cannot be disclosed cannot be resold
under a third party's label, and cannot be committed to a fulfilment SLA the brand does not
control ([19-wholesale-page-specification.md](19-wholesale-page-specification.md) §19.9). A
200-character homepage body cannot carry that qualification without spending a third of itself on
it, and a qualification the visitor cannot act on is noise at this position. The section's job is
to route Persona 3 to a page that states the terms in full; the terms belong on that page.

---

### S10 — Blog

**Purpose.** Demonstrate a living business and expose editorial content to search and AI
retrieval from the domain's highest-authority page.
**Conversion job.** Low direct, high assisted. It is also the answer to "why does a lizhnyk cost
more than a blanket", which no product page can credibly answer about itself.

**This section is more important than its position suggests, and Round 2 raises it further.**
[00-client-decisions.md](00-client-decisions.md) §D2 makes long-tail informational content the
only realistic organic entry point for the first two quarters — commercial head terms will not
rank on a new domain inside a year. [00-client-decisions-2.md](00-client-decisions-2.md) E3 then
removes Instagram from the channel set entirely, which promotes the blog from *one* of the
cold-start channels to the **primary** one
([22-blog-specification.md](22-blog-specification.md)). The three articles surfaced here are
therefore the internal links that get new editorial content crawled at all. Article selection is
chronological rather than curated for exactly that reason: the newest post is the one that needs
discovery.

**The launch articles must be original, not copied.** E5 permits photographs to be reused from
the adjacent business's site after reprocessing, and explicitly forbids copying its blog and
care-guide text: that site stays live, so copied text would put two live sites in competition on
identical content, and the zero-authority domain loses. The Yavoriv material E2 supplies — the
lizhnyk-weaving tradition, the Музей ліжникарства, the Шкрібляк and Корпанюк woodcarving lineage
— is original subject matter the adjacent site cannot compete on, and is the natural source for
the first posts this section surfaces.

```
DESKTOP 1440                                    MOBILE 375
┌──────────────────────────────────────────┐   ┌────────────────────┐
│ ЖУРНАЛ                      Усі статті → │   │ ЖУРНАЛ             │
│ ┌────────────┐┌────────────┐┌───────────┐│   │ ┌────────────────┐ │
│ │  IMG 3:2   ││  IMG 3:2   ││  IMG 3:2  ││   │ │ IMG 3:2        │ │
│ ├────────────┤├────────────┤├───────────┤│   │ │ ДОГЛЯД · 6 хв  │ │
│ │ДОГЛЯД·6 хв ││РЕМЕСЛО·9 хв││ПРЯЖА·4 хв ││   │ │ Як прати ліжник│ │
│ │Як прати    ││Гуня чи     ││Що таке    ││   │ │ 12 бер. 2026   │ │
│ │ліжник, щоб ││накидка:    ││ровниця і  ││   │ └────────────────┘ │
│ │він пережив ││            ││на дотик   ││   │  … 2 more stacked  │
│ │вас         ││            ││           ││   │ [   Усі статті   ] │
│ │12 бер.2026 ││28 лют.2026 ││14 лют.2026││   └────────────────────┘
│ └────────────┘└────────────┘└───────────┘│
└──────────────────────────────────────────┘
```

| Slot | Limit | Note |
|---|---|---|
| Overline | 16 | |
| Tag ×3 | 18 | `PostTag` |
| Read time ×3 | 8 | `Post.readMinutes` |
| Title ×3 | 72 / 3 lines | `PostTranslation.title` |
| Date ×3 | 16 | Locale-formatted from `publishedAt` |

| Facet | Value |
|---|---|
| **Data** | `Post` `status=PUBLISHED && publishedAt ≤ now && deletedAt = null` order `publishedAt` desc take 3, with `coverMedia` and `PostTranslation` ([25-database-schema.md](25-database-schema.md) §25.8) |
| **Type** | `overline` · tag `overline` in `--accent-text` · title `h3` · date `caption` |
| **Spacing** | `--section-y-md`; grid gap `space-6`; card is image + `space-4` + text, no padding box |
| **Surface** | **Page** (`--bg-page`) |
| **Motion** | **Rise**, 60 ms stagger. Hover: image `scale 1.04` only, **no card lift** — these are editorial cards, not product cards, and the hover carries the distinction |
| **LCP** | Not LCP |
| **Fallback** | Fewer than 3 posts in the active locale → serve the `uk` rows with `x-translation-fallback` ([25-database-schema.md](25-database-schema.md) §25.2); a missing translation must never blank a section. Fewer than 3 in any locale → omitted server-side |

---

### S11 — Closing CTA

**Purpose.** The last exit: newsletter, two phone numbers, and an invitation to a shop the
visitor can walk into.
**Trust job.** Captures the interested non-buyer and converts "is this a real place" into an
invitation. A visitable workshop in a tourist village is named in
[00-client-decisions.md](00-client-decisions.md) §D2 as a strong local asset; Round 2 made it
stronger by resolving the village to Яворів, which tourists already visit for the Музей
ліжникарства (E2); Round 3 makes it stronger again, and this time materially.

### F2 — the address is a shop, and this section is where the homepage says so

[00-client-decisions-3.md](00-client-decisions-3.md) F2: «Там знаходиться і магазин і
виробництво.» The Яворів site houses **retail and production together**.

That single fact is the best answer this page has to anxiety A3 — "is this a real factory or a
reseller" ([02-ux-research.md](02-ux-research.md) §2.4) — and it outperforms every on-page
element built to answer it. S2's film is evidence the visitor has to trust the site to have shot
honestly. S7's stage rail is a claim the visitor has to trust the site not to have inflated. A
shop attached to the production floor, in a village tourists already travel to for this exact
craft, is something the visitor can go and check. A factory you can only read about is a claim; a
shop you can walk into is proof, and proof that costs the site one line of copy.

**The line, added to the heading group:**

> «Приїздіть: магазин і виробництво в одному місці, с. Яворів»

**Why this section and not a twelfth one.** The obvious alternative — a dedicated "visit us"
section — is rejected. S11 already renders the address, the flexible-hours caveat, both phone
numbers and the route CTA from `Setting["contact.*"]`; a new section would either duplicate those
four elements or split them across two places, and a NAP rendered twice on one page is the
commonest way a site's own address drifts out of sync with its Google Business Profile. The other
candidates were considered and rejected:

| Candidate | Rejected because |
|---|---|
| A twelfth section | Duplicates S11's NAP, hours line, phones and route CTA. Two renderings of one address is a divergence waiting to happen |
| S4, the trust row | S4 is a statement band of four parallel policy items with no place-specific content and no controls. An invitation with a phone number in it is not a policy |
| S2, the manufacturing proof | Would put a conversion affordance above the first price and interrupt the one section whose job is uninterrupted evidence. It also pulls Яворів forward to compete with the hero, which F6 has just settled against |
| The footer | The footer carries the NAP for machines and for the visitor who is looking for it. S11 is for the visitor who was not looking for it, which is the entire point of an invitation |

S11 wins on all four counts, and F2's own recommendation places the line in the homepage's
closing band. The production page carries the same line
([20-production-page-specification.md](20-production-page-specification.md)); the contact page is
promoted by F2 from a utility page to a destination page and carries directions, parking and what
is on display, which is out of scope here.

**«Самовивіз» is reframed everywhere it appears.** It is no longer a cost-saving fallback in a
delivery list — it is an invitation, and the copy reads as one. This binds S4 item 3, the cart,
and checkout ([18-checkout-specification.md](18-checkout-specification.md)).

**On a cold-start domain this section is also the Google Business Profile bridge**, and with
Instagram gone (E3) it is the **only** one. §D2 and E4 make GBP the highest-leverage early
channel, which means a large share of first-time visitors arrive *from* a map pin and a second
share need to be pushed *toward* one. The address, phone and route CTA rendered here must be
byte-identical to the GBP listing — NAP consistency is a direct local-ranking factor, and a
one-character divergence between the site and the profile is the commonest way a small business
loses it.

F2 sharpens what that profile should be. A profile carrying retail attributes — in-store
shopping, in-store pickup — surfaces for «де купити ліжник» queries that a manufacturer-only
profile cannot answer, while a shop-only category discards the manufacturing story this page is
built on. Confirming that the primary category reflects **both** functions is open item 3 in
[00-client-decisions-3.md](00-client-decisions-3.md) F7, and it materially changes how much
traffic this section receives rather than how it looks.

**Hours are not rendered here, and the previous draft's Sunday-opening claim is withdrawn.** E3:
the hours are flexible and differ day to day, and Google Maps is the live source. The block
carries «Графік гнучкий — телефонуйте перед візитом», both numbers, and a link to the Google
Business Profile labelled as the authoritative source. Publishing a schedule that is wrong twice
a week produces "permanently closed" reports against the one profile carrying the launch, which
is a worse outcome than an honest sentence. The full reasoning, including the options rejected,
is in [16-footer-specification.md](16-footer-specification.md) §16.5; this section renders the
same strings from the same `Setting` so the two cannot drift.

```
DESKTOP 1440                                    MOBILE 375
┌══════════════════════════════════════════┐   ┌════════════════════┐
║ INVERTED — forest-900, sheep mark ↘ 1 col║   ║ Приїжджайте поди-  ║
║                                          ║   ║ витись, як це      ║
║   Приїжджайте подивитись, як це робиться ║   ║ робиться           ║
║   display-lg, fleece-100, centred, 20ch  ║   ║ Магазин і вироб-   ║
║   Магазин і виробництво в одному місці   ║   ║ ництво в одному    ║
║   body-lg, fleece-300              (F2)  ║   ║ місці              ║
║                                          ║   ║ вул. Петруші,      ║
║   вул. Петруші, с. Яворів, Косівський    ║   ║ с. Яворів, 78644   ║
║   район, Івано-Франківська обл., 78644   ║   ║ Косівський р-н     ║
║   Графік гнучкий — телефонуйте перед     ║   ║ Графік гнучкий —   ║
║   візитом · Актуальний графік у Google → ║   ║ телефонуйте перед  ║
║                                          ║   ║ візитом            ║
║  ┌──────────────────┐┌──────────────────┐║   ║ ┌────────────────┐ ║
║  │+38 067 960 47 69 ││+38 067 997 34 50 │║   ║ │+38 067 960 47 6│ ║
║  │Любов             ││Іван              │║   ║ │Любов           │ ║
║  └──────────────────┘└──────────────────┘║   ║ └────────────────┘ ║
║  ┌──────────────────────────────────────┐║   ║ ┌────────────────┐ ║
║  │ Прокласти маршрут →                  │║   ║ │+38 067 997 34 5│ ║
║  └──────────────────────────────────────┘║   ║ │Іван            │ ║
║  ────────────────────────────────────    ║   ║ └────────────────┘ ║
║  Раз на місяць — про вовну й нові партії ║   ║ │Прокласти марш.→│ ║
║  ┌──────────────────┐┌────────────┐  ⌒⌒ ║   ║ └────────────────┘ ║
║  │ Ваш email        ││ Підписатись│ (••)║   ║ ──────────────────  ║
║  └──────────────────┘└────────────┘     ║   ║ │Ваш email       │ ║
║  ☐ Погоджуюсь з політикою конфіденційно. ║   ║ │  Підписатись   │ ║
└══════════════════════════════════════════┘   ║ ☐ Погоджуюсь…      ║
                                                └════════════════════┘
```

| Slot | Limit | Note |
|---|---|---|
| Heading | 44 | An invitation, not an offer |
| **Visit line** | **56** | **New in Round 3 (F2).** «Магазин і виробництво в одному місці» — the fact that carries the section. Sits directly under the heading, above the address, because it is the reason to read the address |
| Address | 80 | вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, 78644. Must match the GBP listing **byte for byte** (E4) |
| Availability line | 56 | «Графік гнучкий — телефонуйте перед візитом». **Never a schedule** (E3). The caveat is load-bearing precisely *because* F2 turns this into an invitation: inviting someone to drive to a village and then being closed is worse than not inviting them |
| GBP link | 32 | «Актуальний графік у Google →», labelled as the authoritative source rather than as a map |
| Phone CTA ×2 | 2 × 24 | `tel:+380679604769` (Любов) and `tel:+380679973450` (Іван), each labelled with the name |
| Route CTA | 24 | Opens the map at the confirmed coordinates |
| Newsletter label | 64 | States frequency and topic; vague newsletter asks underperform |
| Consent | 56 | Unticked checkbox linking to `/privacy` |

| Facet | Value |
|---|---|
| **Data** | `Setting["contact.*"]` for address, visit line, availability line, GBP URL and both phones — the **same** keys the footer NAP reads ([16-footer-specification.md](16-footer-specification.md) §16.5), so the two blocks and the `LocalBusiness` JSON-LD cannot diverge. `contact.visitLine` is added in Round 3 (F2) and is per-locale. There is no `contact.hours` key, by design. `NewsletterSubscriber` on submit with `confirmedAt` null until double opt-in completes ([25-database-schema.md](25-database-schema.md) §25.9) |
| **Type** | `display-lg` heading · `body-lg` address and hours · `button` |
| **Spacing** | `--section-y-lg`; centred `container-narrow`; `space-10` between the visit block and the newsletter rule |
| **Surface** | **Inverted** (`forest-900`) — the second and last permitted Inverted section |
| **Motion** | **Rise** on the heading group. Sheep mark: idle only, single-colour line drawing, `spring.sheep`, sleeps after 60 s, static under reduced motion and on touch ([01-brand-strategy.md](01-brand-strategy.md) §1.7) |
| **LCP** | Not LCP. Zero imagery here by design — type and controls only |
| **Fallback** | The form posts natively to `/api/newsletter` if its island never hydrates. A failed submission renders an inline `danger` message with a retry, **never a toast** — a message that disappears is the wrong pattern for the 60–75 segment ([02-ux-research.md](02-ux-research.md) §2.6) |

Double opt-in is mandatory: the `de` locale is in scope and single opt-in is not defensible
under GDPR for a German-language subscriber. E11 makes `de` transactional as well as
informational, which removes the last argument for treating it as a lower-stakes locale.

**No social row here either.** The closing CTA is the section most likely to attract one on a
later pass — it is the page's sign-off, and sign-offs conventionally carry social icons. E3
forbids it: no accounts exist, and the adjacent business's `@fabryka_shkur` must never be used.
The section's outbound affordances are the two phone numbers, the route link, the Google Business
Profile link and the newsletter field, which is a complete set for the channels that actually
exist. If an Instagram account is created before launch (E3, recommended but not decided), it
slots into the **footer** (§16.7), not here — one icon in one place, not two.

**The sheep mark is brand core, not decoration.**
[00-client-decisions.md](00-client-decisions.md) §D2 closes the risk recorded in
[01-brand-strategy.md](01-brand-strategy.md) §1.7 and [00-assumptions.md](00-assumptions.md) F8:
the client mandates the shepherd identity, and «Вівчарик» means *little shepherd*. The mascot is
the brand's name made visible. That raises the execution stakes rather than lowering them — the
§1.7 constraints (single-weight line drawing, one colour, maker's-mark register, no
eyes-with-highlights) are what let a shepherd coexist with four-figure textiles, and a cartoon
sheep would not. On this page the mark appears exactly once, here, at idle. It remains
**forbidden** on the PDP, cart, checkout and wholesale page.

---

## 6.8 Surface alternation audit

```
S1  Hero          media + scrim      S7  Production   █ INVERTED (1 of 2)
S2  Manufacturing ░ Page             S8  Reviews      ░ Page
S3  Best sellers  ▒ Alt              S9  Wholesale    ▒ Alt
S4  Trust         ░ Page             S10 Blog         ░ Page
S5  Categories    ▒ Alt              S11 CTA          █ INVERTED (2 of 2)
S6  Story         ░ Page             Footer           █ forest-900, gold-400 hairline
```

Conforms to [08-design-system.md](08-design-system.md) §8.3: strict Page/Alt alternation,
exactly two Inverted sections, no fourth background colour. S11 and the footer share a
background deliberately — the page ends in one dark block rather than two, which reads as a
close rather than a stack.

## 6.9 Performance budget for this page

| Item | Budget | Enforcement |
|---|---|---|
| LCP (hero poster) | ≤1.8 s on 4G; ≤2.5 s on the CI throttle profile | Lighthouse CI, fails the build |
| Image bytes above the fold | ≤160 KB | Bundle analyser step |
| Webfont payload on first paint | ≤85 KB | [10-typography.md](10-typography.md) §10.7 |
| Animation JS on the critical path | 0 KB | [13-motion-system.md](13-motion-system.md) §13.5 |
| Framer Motion | ≤34 KB gzip, lazy, below the fold only | Same |
| CLS | 0 | `width`/`height` from `Media` on every image; no late-injected banners |
| Concurrently animating elements | ≤12 | Design constraint: no two adjacent sections reveal simultaneously |
| Hero video | ≤1.8 MB, never on the critical path | §6.5 guard |

## 6.10 Unresolved tokens introduced here

### Resolved by [00-client-decisions-2.md](00-client-decisions-2.md)

| Token / dependency | Resolution | Reference |
|---|---|---|
| `{{FACTORY_ADDRESS}}`, `{{POSTAL_CODE}}` | вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область, **78644**. Not Вербовець | E2 — S1, S2, S4, S11 |
| `{{PHONE_PRIMARY}}` | **+380 67 960 47 69** (Любов, seller of record); **+380 67 997 34 50** (Іван) as the second line | E3 — S11 |
| Opening hours | **Variable, never published.** «Графік гнучкий — телефонуйте перед візитом» + a GBP link | E3 — S11 |
| `{{PARTNER}}` | **Never rendered.** «Відібрано Вівчариком» + «Виготовлено карпатським майстром» / «іншим виробником», at equal weight to «Власне виробництво» | E7 — §6.2 |
| Hide-pipeline ownership | **Own manufacture, confirmed.** Wool, sheepskin and leather are all `OWN_MANUFACTURE`; «бельгійська технологія» is struck | E6 — S2, S7 |
| `{{SKU_COUNT}}` | **Several hundred to roughly a thousand**, following the catalogue import. The 1,000+ audit figure is withdrawn, but the resolved range overlaps it; the faceting architecture already holds across it, so nothing on this page changes | E5 |
| Catalogue and photography source | Products and photographs **may be reused** from the adjacent site after rewrite/reprocessing. Reviews and editorial text **may not** | E5 — S3, S8, S10 |
| Social links | **None exist.** No social row on this page, at any position | E3 — S11 |
| Customer accounts | **None, ever.** No account affordance appears on this page or in the header it renders under | E12 |

### Resolved by [00-client-decisions-3.md](00-client-decisions-3.md)

| Token / dependency | Resolution | Reference |
|---|---|---|
| Hero place-claim | **«в Карпатах», as originally approved.** The Round-2 Яворів substitution is withdrawn. Яворів moves to S2 and below | F6 — §6.3, S1, S2 |
| Nature of the Яворів site | **Shop and production floor together.** S11 becomes an invitation; «самовивіз» is reframed as one | F2 — S11, S4 |
| Partner brand | **Вівчарик, for both origins.** `manufacturer` is set for `OWN_MANUFACTURE` and **omitted entirely** for `PARTNER_MANUFACTURE`. `partnerName` still never rendered; `partnerRegion` used where known | F3 — §6.2 |
| Who pays shipping and customs | **Buyer, all destinations** — effectively DAP. International shipping is **quoted per order**, never calculated; free shipping never applies internationally | F4 — S4 |
| `{{LEGAL_ID}}` | **Exists, pending delivery.** It blocks WayForPay onboarding, the offer contract and the German Impressum. It does not block this page, and it is no longer treated as a general blocker | F1 |
| Public contact address | `gif19601@gmail.com` **exists as an interim address.** It is not the launch address — see below | F5 |

### Still unresolved

| Token / dependency | Blocks | Source |
|---|---|---|
| `{{DOMAIN}}` | Canonical URLs, the wordmark lockup, and — newly urgent under F5 — transactional email authentication | E9, F5 |
| `{{BRANDED_EMAIL}}` | S11 and the footer. An interim address now exists (`gif19601@gmail.com`), so this is an **upgrade rather than a creation** — but it is still blocking, for a technical reason as well as a commercial one. Order confirmations cannot be sent from `@gmail.com`: SPF and DKIM cannot be published for `gmail.com` by a third-party system, and Gmail's consumer DMARC policy rejects such mail, so confirmations land in spam or are refused. The full statement is in [16-footer-specification.md](16-footer-specification.md) §16.5 | F5 |
| `{{LEGAL_ID}}` | Not this page, and no longer a general blocker (F1). It blocks the `de` Impressum in the footer this page renders above, the offer contract, and WayForPay | F1 |
| `{{RETURN_DAYS}}`, `{{NP_BRANCH_PRICE}}`, `{{UKRPOSHTA_PRICE}}` | S4 entirely. Now also locale-dependent: `de`/`pl` carry the statutory EU 14-day right | Client; E11 |
| `{{FOUNDER_NAME}}` | S6 attribution. E1 names Іван Гондурак (owner of production) and Любов Гондурак — confirm which is attributed in the pull quote, and that they consent to being named | Client, narrowed by E1 |
| `{{WHOLESALE_SLA_HOURS}}` | S9 SLA line | Client |
| Heritage wording | Any reference to the intangible-heritage status of Hutsul lizhnyk weaving, anywhere on the page | E13.4, §6.3 |
| Google Business Profile verification | S11's NAP block must be confirmed against the live profile before launch | E13.3, E4 |
| Production stage count | S7 heading numeral and rail width | §D1 names five stages; drying and finishing inferred |
| `ProductOrigin` schema addition | S3, S5, and the §6.2 origin rule | Addendum to [25-database-schema.md](25-database-schema.md) per §D3 |
| Best-seller ordering source | S3 | Addendum to [25-database-schema.md](25-database-schema.md) §25.10 |
| Yavoriv factory photography and video | S1, S2, S6, S7 — the page's entire thesis | **Descoped, not cancelled.** E5 permits reuse of the adjacent site's catalogue photography, which solves S3 and S5. It does **not** solve S1, S2, S6 or S7: those need *Yavoriv* production, and the reused library documents a different workshop in a different village. One or two days of shooting in Yavoriv, not a full catalogue production |

**Resolved since the first draft:** `{{BRAND_NAME}}` is Вівчарик (§D2); `{{YEARS_EXPERIENCE}}`
is «понад 30» (§D1); the mascot question is closed in favour of building it (§D2);
`{{LEGAL_ENTITY_NAME}}` is ФОП Гондурак Любов Юріївна (E1); `{{PSP}}` is WayForPay (E10).

No build ships with an unresolved token; CI blocks on `{{` in rendered output. The photography
dependency is not a token and CI cannot catch it — it is the one line in this table that can
fail silently, by shipping a beautiful layout wrapped around stock imagery, which would forfeit
the entire strategy while passing every automated check.
