# 22 — Blog Specification

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - Index as a photo grid; under an article only the products it mentions and share buttons — no comments, no «more articles» (part 7). Not on the homepage.

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Author: Іван, no fixed cadence.** Recommended method: record him on each topic and edit the transcripts ([00-client-decisions-9.md](00-client-decisions-9.md) §P5.2).
> - Six pillars: догляд за вовною, історія ліжникарства, Яворів і Карпати, як ми виробляємо, як обрати ліжник, в'язання з нашої пряжі.
> - **No newsletter**: the double opt-in and sign-up forms are removed; the blog has no owned channel beyond the parcel card (G4).


Routes: `/{locale}/zhurnal` (`uk`), `/en/journal`, `/pl/dziennik`, `/de/magazin`.
Article: `/{locale}/zhurnal/{slug}`.

> **Authority note.** Written against [00-client-decisions.md](00-client-decisions.md) and revised
> against [00-client-decisions-2.md](00-client-decisions-2.md), which is now the highest-authority
> document. D2 **cancels the content-migration workstream** that
> [00-existing-site-audit.md](00-existing-site-audit.md) §0.8 specified, and simultaneously
> **promotes the blog from a supporting asset to the primary organic channel.** Both changes are
> structural. See §22.3 and §22.1.
>
> **Round 2 is more consequential for this document than for any other in the blueprint.** E5
> grants permission to reuse the adjacent business's content — and attaches a constraint that
> lands precisely here: that site **stays live**, so blog and care-guide articles must be written
> **fresh, never copied**. E3 removes social media entirely, which promotes this channel again.
> E2 supplies three original article subjects that the adjacent site cannot compete on. E6 strikes
> a phrase that appears in pillar 8's example title. Each is applied below.
>
> **Round 3 leaves this document's core intact and strengthens one pillar.**
> [00-client-decisions-3.md](00-client-decisions-3.md) is now the highest-authority source:
>
> | Round-3 ruling | Blog consequence |
> |---|---|
> | F6 — the tagline reverts to **«в Карпатах»**; Яворів moves out of the hero and the navbar | Pillar 1, **«Яворів і гуцульське ліжникарство», is unchanged** — and becomes more load-bearing, because the blog is now the site's primary place for the Яворів argument rather than one of several. §22.2 |
> | F2 — the Яворів site is a **retail shop as well as a factory** | The museum and place articles acquire a real conversion path, and the tourist audience becomes an offline-to-online funnel rather than a readership. §22.2, §22.8 |
> | F3 — partner goods are sold **under the Вівчарик brand** | The §22.8 embed label and the prose prohibition matter more, not less. §22.8 |
> | F5 — transactional mail cannot be sent from `@gmail.com` | The blog's newsletter double opt-in depends on authenticated sending from `{{DOMAIN}}`. §22.14 |
>
> The pattern F6 establishes — **«Карпати» to be understood, «Яворів» to be believed** — is the
> reason this document needs no rewrite. A journal article is the surface on which a reader has
> already agreed to be told something at length. It is where a proper noun is an asset rather than
> a toll, and it is precisely the layer F6 moves Яворів *into*.
>
> **Round 4 gives pillar 1 something to end on, and gives this channel its first physical
> distribution surface.**
>
> | Round-4 ruling | Blog consequence |
> |---|---|
> | G3 — visitors may tour the workshop **with Іван**, arranged by phone | The place articles' closing block upgrades from «приїздіть у магазин» to an offer to be walked through the workshop by its owner. §22.2. The prohibitions travel with it: no times, no booking, no drop-in |
> | G4 — **a business card already ships in every parcel** | The blog's distribution problem is not solved, but it stops being total: there is one printed surface reaching every buyer, including the counter-sale buyer the site has no other route to. §22.1 |
> | G2 — made-to-order is **14 days of production before dispatch** | A pillar-9 buying-guide subject, and a phrase the §22.6 deny-list lint must catch when an editor writes it as "14 days to your door". §22.2 |
> | G1 — **Іван primary, Любов fallback** | Wherever an article renders the visit line, it carries that order. §22.2 |
>
> **Round 5 adds two buying-guide subjects and one lint rule.**
> [00-client-decisions-5.md](00-client-decisions-5.md) H1.2 and H1.3 introduce COD with inspection
> at the branch and the return-shipping deposit — the deposit being, on the client's own
> assessment, the one rule on the site that can be misread as a hidden fee (§H5 item 4). Explaining
> it once, properly, in a buying guide is cheaper than explaining it repeatedly in support. H3b's
> per-product custom sizing is the second subject. Both are pillar 9. §22.2.

## 22.1 Editorial strategy — and why the blog is now load-bearing

### The default manufacturer's blog is a traffic-chasing exercise, and it fails

The pattern is familiar: pick keywords by volume, write around them, publish, watch nothing
convert. It fails for a manufacturer because high-volume queries in this category («купити плед»,
«вовняна ковдра») are commercial head terms owned by marketplaces with a decade of authority, and
because traffic that arrives with no purchase intent does not become a customer at 9,800 UAH.

**The correct strategy for this business is the inverse: answer the questions that block a
purchase, in public, before the purchase.** Every anxiety in [02-ux-research.md](02-ux-research.md)
§2.4 — is it real wool, will it itch, is this a real factory, will it survive washing — is an
article. Each article ranks for the long tail *and* becomes the link the PDP uses to resolve the
same objection. A single piece on micron and itch serves SEO, the PDP, the care page, the AI
citation surface, and a customer-service reply. Content written for traffic serves one.

### Cold start makes this the primary channel, not a supporting one

[00-client-decisions.md](00-client-decisions.md) D2 is explicit, and it changes the blog's
priority in the roadmap:

> Organic traffic will be near zero for the first 3–6 months… Long-tail informational content
> (care guides, «що таке ліжник», «гуня vs накидка», wool-versus-synthetic comparisons) is the
> realistic early organic entry point, because commercial head terms will not rank on a new
> domain for a year.

| Consequence | What it changes |
|---|---|
| The blog is the **only** page type with a realistic path to organic traffic in year one | It moves from Phase 3 to Phase 1 in [35-implementation-roadmap.md](35-implementation-roadmap.md) |
| Articles must carry commercial intent internally | Every article links to categories and products, because the article is the entry point and the PDP is not |
| Depth beats frequency | One authoritative 1,800-word piece on lizhnyk care outranks six 400-word posts, and a new domain has no authority to spread thin |
| Informational queries are winnable; commercial ones are not | Target «як прати ліжник», not «ліжник купити». The commercial query is served by the category page, which will not rank for a year regardless |

### Round 2 removes the one channel that was buying time

[00-client-decisions-2.md](00-client-decisions-2.md) E3 states that the owners run **no social
media accounts at all**. The previous draft's cold-start picture assumed Instagram was carrying
traffic while the blog matured. It is not, because it does not exist.

| Channel | Status after Round 2 | Time to first traffic |
|---|---|---|
| Google Business Profile | Exists, and is the launch's primary channel (E4) | Immediate, but local and low-volume |
| Offline and word-of-mouth customers | Exists | Immediate, but finite |
| Yavoriv tourist footfall | Exists, and is genuinely useful in a craft village | Seasonal |
| Instagram | **Does not exist** | — |
| **The card in every parcel** | **Exists, and already paid for** ([00-client-decisions-4.md](00-client-decisions-4.md) G4) | Immediate, but bounded by order volume |
| Long-tail editorial — this document | To be built | Months |

Five channels, four of which are bounded by how many people physically pass through a village in
Ivano-Frankivsk oblast or buy something. **The blog is the only channel on that list with unbounded
upside**, and the only one that compounds.

**Round 4 adds the card, and it is worth being precise about what it does and does not do for this
document.** [00-client-decisions-4.md](00-client-decisions-4.md) G4 confirms a business card ships
in every parcel, carrying a short URL and a QR code printed both ways. It is the first owned,
physical distribution surface this channel has. It does **not** solve acquisition — a card reaches
someone who has already bought — and it must not be allowed to soften the conclusion above. What it
does solve is *return*, which is the half of the problem a newsletter would otherwise carry alone
and which the newsletter cannot currently carry at all, because double opt-in depends on
authenticated mail from `{{DOMAIN}}` (F5, §22.14 item 9).

The card's short link resolves to a review-and-reorder page, not to the journal. Pointing it at the
blog instead would be a mistake: a customer holding a product they like is at the highest-converting
moment for a review, and a review is the scarcest asset at launch — the site starts with zero, and
`AggregateRating` stays suppressed until three verified ones exist. The journal's claim on that
printed space is weaker than the review page's, and the correct relationship is that the landing
page links onward to the journal rather than competing with it for the card. E3's recommendation that an Instagram account be created before
launch is on record and is not a decision; this document must be planned as though it is the
whole growth strategy, because at present it is.

The practical consequence is not "write more" — §22.13's two-per-month floor is already set
against realistic staffing — but **write the pieces that compound**: definitional and care
articles that stay relevant for years, are linked from every PDP, and are the shape an AI
assistant quotes (§22.12). A seasonal listicle that is dead in six weeks was an acceptable use of
a spare slot when Instagram was covering the gap. It is not now.

### Editorial principles

1. **Every article answers a question a real buyer asked.** Sources: the enquiry inbox, Viber
   messages, phone calls taken by Любов and Іван, questions asked by visitors in the workshop, and
   `SearchQueryLog` zero-result rows ([25-database-schema.md](25-database-schema.md) §25.9).
   Invented topics are the ones that underperform. The previous draft listed Instagram comments;
   per E3 that source does not exist, which makes the **phone log and the workshop conversation**
   the primary demand signal — and they are better sources anyway, because the person asking has
   already decided to spend money.
2. **A manufacturer writes from the floor.** «Ми чешемо вовну двічі» is content only this business
   can produce. A general article about wool fibre is content anyone can produce, and it will lose
   to whoever has more authority.
3. **Name things.** The machine, the village, the stage, the person
   ([01-brand-strategy.md](01-brand-strategy.md) §1.5). Named entities are what AI search extracts
   and cites (§22.12).
4. **Sell nothing in the body; sell structurally.** No "buy now" paragraphs. Product embeds sit in
   designated slots and are relevant or absent.
5. **Publish nothing the factory cannot back up.** The deny list in
   [21-about-page-specification.md](21-about-page-specification.md) §21.12 applies verbatim —
   especially no certification or «еко» claims, since D1 confirms no certificates exist.

## 22.2 Content pillars

Eleven pillars. Each names the job it does, so an article that fits no pillar does not get
commissioned.

| # | Pillar | Job | Example titles (`uk`) | Intent |
|---|---|---|---|---|
| 1 | **Яворів і гуцульське ліжникарство** | Provenance; the story a buyer retells ([02-ux-research.md](02-ux-research.md) J1, J5). **Renamed in Round 2** — see below | «Чому Яворів називають столицею ліжникарства» | Informational, brand |
| 2 | **Догляд за вовною** | Answers anxiety A5 and prevents returns | «Як прати ліжник, щоб він не сів» | Transactional-adjacent, high value |
| 3 | **Догляд за шкурою та овчиною** | Same, for the hide categories | «Як чистити овечу шкуру вдома» | Same |
| 4 | **Натуральне проти синтетики** | Answers A1 and justifies the price | «Вовна чи поліестер: що насправді гріє» | Comparative, top of funnel |
| 5 | **Історія ліжника** | Category education; «ліжник» is not universally understood ([02-ux-research.md](02-ux-research.md) §2.8 R3) | «Що таке ліжник і чим він відрізняється від пледа» | Definitional — the single best cold-start format |
| 6 | **Історія гуні** | Same, for a garment most buyers cannot name | «Гуня: як карпатський одяг став інтер'єрною річчю» | Definitional |
| 7 | **Як роблять ковдру** | Process; feeds [20-production-page-specification.md](20-production-page-specification.md) | «Сім етапів: від немитої вовни до ковдри» | Informational, trust |
| 8 | **Як вичиняють шкуру** | Same, hide track. E6 confirms this is **own manufacture**, so the pillar is written from the floor rather than as general education | «Як вичиняють овечу шкуру: від сирої шкури до готової овчини» | Informational, trust |
| 9 | **Гайди покупця** | Converts; sits closest to the sale. **Round 5 adds the transaction itself to this pillar** — see below | «Який розмір ліжника обрати на двоспальне ліжко»; «Як працює оплата при отриманні з оглядом»; «Індивідуальний розмір: що це означає для строків і оплати» | Commercial investigation |
| 10 | **Вовна в інтер'єрі** | Serves the designer and HoReCa audiences | «Ліжник у сучасному інтер'єрі: чотири способи» | Inspirational, B2B-adjacent |
| 11 | **Подарункові гайди** | Seasonal; serves J5 | «Що привезти з Яворова, крім магніту» | Seasonal, commercial |

**Definitional pillars 5 and 6 are the cold-start priority.** «Що таке ліжник» has modest volume,
almost no commercial competition, and near-perfect intent match for a manufacturer. It is also
the query shape that AI assistants answer by quoting a source, which is the citation mechanism
described in [30-ai-search-optimization.md](30-ai-search-optimization.md).

### Pillar 1 is rewritten around Яворів, and it is now the strongest pillar on the list

[00-client-decisions-2.md](00-client-decisions-2.md) E2 supplies material this document did not
previously have. Яворів is not merely a village in the Carpathians — it is the recognised centre
of Hutsul lizhnyk weaving, «столиця ліжникарства». It holds a dedicated
[Музей ліжникарства](https://kosiv.life/lizhnykarstva/), hosts annual lizhnyk-weaving plein airs
attended by art historians from Kyiv, Lviv and Ivano-Frankivsk, and is the home village of the
**Шкрібляк** and **Корпанюк** families, the most celebrated dynasties in Hutsul woodcarving.

The pillar is therefore renamed from «Карпатська і гуцульська культура» to **«Яворів і гуцульське
ліжникарство»**, and the reason is editorial rather than cosmetic. «Карпатська культура» is a
subject on which a hundred better-resourced publishers already rank. «Яворів» is a subject on
which almost nobody publishes, on which this business has first-hand standing, and — decisively —
**on which the adjacent business cannot compete**, because it is in a different village.

Four article subjects, available immediately and requiring no photography the business does not
already have access to:

| Subject | Why it is defensible |
|---|---|
| Чому Яворів називають столицею ліжникарства | Definitional, place-specific, and the single best expression of the brand's positioning. **After Round 3 it is also the only page on the site that makes the Яворів argument at length** — the hero and the navbar no longer carry it, so this article is where a reader who wants the case goes to find it ([00-client-decisions-3.md](00-client-decisions-3.md) F6) |
| Музей ліжникарства у Яворові — що там можна побачити | Genuinely useful to the tourist audience E3 identifies as a live channel, and the natural pretext for an outreach link from a cultural or tourism site. **F2 gives it an ending it did not previously have**: the reader who has just been told what is worth seeing in the village can be told that the workshop's own shop and production floor are in the same village, with the flexible-hours caveat and both numbers |
| Пленери ліжникарства: навіщо ткачі збираються щороку | First-hand if anyone from the workshop has attended. Attaches the business to a documented tradition without claiming ownership of it |
| Шкрібляки і Корпанюки: чому одне село дало дві школи ремесла | Establishes the village as a craft centre in general, which is what makes the future ДЕРЕВО category (D3) read as provenance rather than as a gift-shop bolt-on |

The fourth is a strategic investment as much as an article. When the wooden range launches, the
site will already hold the piece explaining why a lizhnyk workshop in this particular village also
sells carved wood — and a link from an existing indexed article is worth more than a new page.

### Round 3 does not change this pillar. It increases what the pillar has to carry

[00-client-decisions-3.md](00-client-decisions-3.md) F6 withdraws Яворів from the homepage hero
([06-homepage-wireframe.md](06-homepage-wireframe.md) §6.3) and from the navbar descriptor
([15-navbar-specification.md](15-navbar-specification.md) §15.5), returning both to «в Карпатах».
The village stays in the NAP, the contact block, the about and production pages, meta titles for
specific queries, structured data — and here.

**This pillar is named in F6 as the right place for it, and nothing about it changes.** But the
consequence is worth stating plainly, because it is easy to read a reversal as a demotion and it
is not one:

| Before Round 3 | After Round 3 |
|---|---|
| The hero, the navbar and the wholesale subhead each made a compressed version of the Яворів case; the article elaborated it | Those three surfaces say «Карпати». The article is now the **only** place the case is made at all |
| The article competed with the hero for the same proposition | The article owns the proposition outright |
| A reader could absorb the argument without ever reaching the journal | A reader who wants the argument has to arrive here, which is a measurable event |

The pattern behind the ruling is **«Карпати» to be understood, «Яворів» to be believed** — the
headline earns attention, the pages beneath it earn trust, and they are different jobs. A journal
article is the purest example of the second job on the whole site: nobody reads one by accident,
the reader has consented to a thousand words, and a proper noun they have to look up is an
invitation rather than an obstacle. The article does not need to be shortened, hedged or made to
work in five seconds. That freedom is exactly what the hero does not have, and it is why the
material belongs here.

Two practical consequences:

1. **Pillar 1 stays at «All» in every locale** (§22.10), and the reasoning there is unchanged.
2. **Internal links to pillar 1 matter more.** The about page, the production page and the contact
   page each name Яворів without arguing for it; each should link here. On a cold-start domain
   that is also the only way this article accumulates internal link equity, since nothing above it
   in the hierarchy carries the keyword any more.

### F2 gives the place articles a destination as well as a subject

[00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms the Яворів site is a **retail
shop as well as a production floor** — «там знаходиться і магазин і виробництво». For this pillar
that is not a footnote; it changes what the tourist-facing articles are for.

Before F2, «Музей ліжникарства у Яворові» was a link-earning piece aimed at a reader who might
later buy online. After F2, the same reader can be told that the museum and a working workshop
with a shop attached are in the same village on the same trip. That converts an editorial asset
into an offline-to-online funnel of the kind [02-ux-research.md](02-ux-research.md) Audience 1 was
always assumed to want and never had a path for.

| Rule | Detail |
|---|---|
| Which articles carry the visit line | Pillar 1 only, and within it only the place-and-museum pieces. A care article about washing a lizhnyk does not need an address |
| What it says | «Магазин і виробництво в одному місці, с. Яворів», with the flexible-hours caveat and both phone numbers — **Іван first, Любов as the fallback** ([00-client-decisions-4.md](00-client-decisions-4.md) G1). It reads from the same `contact.visitLine` setting the footer and homepage render, so it cannot drift |
| Where it goes | The article's closing block, never the opening. The reader is here for the village, not for us; earning the visit takes the whole article |
| What it is not | Not a `productEmbed`, not a CTA button, not a banner. It is a sentence in the author's voice, which is the register the rest of the article is written in |

The caveat is non-negotiable for the same reason it is everywhere else: an article that sends a
tourist to a locked door is worse than one that sends them nowhere.

### G3 upgrades the closing line from a shop address to an invitation

[00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that a visitor may walk the
production floor **accompanied by Іван**, arranged in advance by phone. For pillar 1 this is the
strongest possible ending, and the reason is structural rather than promotional.

A place article spends 1,500 words establishing that Яворів is where this craft comes from. F2's
version of the closing block then offers a shop — which is a good offer and a slightly deflating
one, because the article's subject was a craft and the offer is retail. G3's version offers the
thing the article was actually about: the room where it happens, with the person who does it. The
ending stops being a commercial afterthought and becomes the article's natural conclusion.

| Rule | Detail |
|---|---|
| Wording | «Цех можна оглянути — разом із власником. Зателефонуйте заздалегідь, щоб домовитися про час.» Rendered from the shared setting, never retyped per article, so a copy revision reaches every place piece at once |
| Which articles | The same subset as the visit line — pillar 1's place-and-museum pieces. It is **not** added to care, definitional or comparative articles, where it would read as an unrelated advertisement |
| What is never written | Tour times, «екскурсії», «відкрито для відвідувачів», any suggestion of drop-in, any link to a booking form. G3 forbids all of them, and an editor writing a place article is exactly the person most likely to reach for «екскурсія» because it is the natural Ukrainian word for what is being described. §22.6's deny-list lint carries «екскурсі» as a warned stem for this reason |
| Locale scope | Translated unmodified into `en`, `pl` and `de`. It is not softened or dropped for readers unlikely to travel — an invitation that is cheap to make and impossible to fake does work on a reader who will never accept it |

**The failure this is guarding against.** A journal article is the surface where an editor has the
most room and the least supervision, and «екскурсія цехом щодня о 14:00» is a sentence that would
improve the article and destroy the asset. The prohibition is therefore enforced at the lint layer
and not left to editorial judgement (§22.6).

**The heritage constraint applies to every one of these.** E2 requires that the exact status and
wording of any intangible-cultural-heritage reference be confirmed before publication, and it is
absolute that **Вівчарик is never implied to hold a heritage designation** — the craft may be
inscribed on Ukraine's register; a company is not. In article prose this means the subject of any
heritage sentence is the craft or the village, never the business. «Ліжникарство внесене до…» is
checkable and safe once confirmed. «Наша спадщина внесена до…» is false. The §22.6 deny-list lint
gains «спадщин», «ЮНЕСКО» and «реєстр нематеріальної» as warned phrases so the distinction is
surfaced at the moment of writing.

### Round 5 puts the transaction into pillar 9, and that is a deliberate expansion

Pillar 9 was scoped to product-choice questions — which size, which weight, which family.
[00-client-decisions-5.md](00-client-decisions-5.md) adds three rules that a buyer meets *during*
the purchase and that are difficult to explain inside a checkout step:

| Subject | Ruling | Why it needs an article rather than a tooltip |
|---|---|---|
| **COD with inspection at the branch** | H1.2 — Ukraine only, stocked items only | It is the single strongest answer this brand has to "is this payment safe" ([02-ux-research.md](02-ux-research.md) A6), and it is also the one most buyers do not know is available until checkout. An article surfaces it *before* the decision, which is where it does its work. It is also a searchable query in its own right — «наложений платіж з оглядом» has real informational volume and almost no good Ukrainian answers |
| **The return-shipping deposit** | H1.3 — both legs paid online, the return leg credited against the goods on acceptance | The client's own assessment is that this is the one rule on the site that can be misread as a hidden fee (§H5 item 4). The checkout has room for a worked example and nothing more; an article has room for the example, the reason, and the sentence that closes it — «якщо не залишаєте, більше нічого не платите». Explaining it once here is cheaper than explaining it in every support call |
| **Custom sizing** | H3b — per-product toggle; G2 — 14 days of production before dispatch | Three facts arrive together at the moment a buyer selects «Свій розмір»: the wait, the prepayment, and the disappearance of cash on delivery. The buy box states them; it cannot *justify* them. An article can say why a factory commits two weeks of labour to a size nobody else will buy |

**Two editorial rules govern these three pieces**, because commerce explainers are where a journal
most easily degrades into help-desk copy:

1. **They are written from the floor, like every other pillar.** «Чому ми просимо повну оплату за
   індивідуальний розмір» is an article by someone who runs the loom. «Умови оплати» is a policy
   page, and a policy page already exists. If the piece could have been written by the payment
   processor, it is in the wrong section.
2. **They state the number, not the policy.** The deposit article shows arithmetic with real
   figures — the same construction the checkout uses (H1.3) — because that is what converts a
   suspicious-sounding rule into an obviously fair one. A paragraph of reassurance does not.

**Locale scope.** The COD and deposit articles are **`uk` only**. Both mechanics are Ukraine-only
by ruling: H1.2 restricts inspection to domestic orders and H1.3 forbids the deposit for `en`, `pl`
and `de` under the EU right of withdrawal. Translating them would describe to a German reader a
payment method they cannot use and a deposit that would be unlawful to charge them. §22.10's
translation table carries this as an explicit withholding, in the same register as the hide pillars.

### Two constraints on the hide pillars

Pillars 3 and 8 concern hide and sheepskin, and Round 2 changes both of their footings:

1. **They are now own-manufacture content.** E6 confirms Вівчарик runs the full cycle including
   hides, so pillar 8 is written from the floor — principle 2 — rather than as general education
   anyone could write. That is a substantial upgrade in defensibility.
2. **«Бельгійська технологія» is struck from the pillar's example title and from all article
   copy.** E6 is explicit that the phrase belonged to the adjacent business. It is also exactly
   the kind of borrowed technical vocabulary that would fail principle 5 — publish nothing the
   factory cannot back up — because the first reader question about it would be unanswerable.
   The replacement title describes the process the workshop actually performs.
3. **`de` translation stays gated.** D3's German-market sensitivity still applies, and E11 adds
   species-declaration paperwork to it: [00-client-decisions-2.md](00-client-decisions-2.md)
   recommends launching `de` and `pl` **wool-only**. Publishing German articles about sheepskin
   care for goods that cannot be shipped to Germany is worse than not publishing them. See §22.10.

## 22.3 Migration — cancelled, and what replaces it

### The plan that no longer applies

[00-existing-site-audit.md](00-existing-site-audit.md) §0.8 specified migrating `/blog/` and
`/uhod/` with original `publishedAt` dates preserved. **[00-client-decisions.md](00-client-decisions.md)
D2 revokes this.** That content belongs to the client's wife's business, which stays online as a
separate operation.

### Round 2 grants permission to copy — and it does not reach this document

This is the most important paragraph in this specification, because it is the one most likely to
be misread.

[00-client-decisions-2.md](00-client-decisions-2.md) E5 records that **the client permits products
and photographs to be taken from the adjacent business's site.** That is a real and substantial
de-risking: it closes the catalogue-coverage problem that was the largest open blocker in
[00-assumptions.md](00-assumptions.md) E1. Someone reading only that sentence would reasonably
conclude the blog can be copied too, and the content calendar would shrink by two months.

**It cannot.** E5 states it explicitly, in the same table that grants the permission:

> | Blog and care-guide articles | **Do not copy.** Write fresh, per
> [22-blog-specification.md](22-blog-specification.md) §22.3 |

The reason is not squeamishness and it is not the earlier "different entity" argument. It is
mechanical, and it is worth stating precisely because it survives any amount of goodwill between
the two businesses:

**`fabryka-shkur.com.ua` stays online.** Copying its article text onto `{{DOMAIN}}` produces two
*live* sites carrying identical content, competing for the same queries. Google selects one. It
selects the one with thirteen years of history, existing backlinks and established crawl
patterns — not the domain registered last month. The copied article does not rank; it consumes a
content slot, it dilutes the new domain's topical signal, and the effort spent formatting it is
spent producing something that will never receive a visitor.

This is not a theoretical penalty. It is a ranking outcome, and it is the outcome in every case
where a zero-authority domain duplicates a live one.

### What E5 permits, precisely, and what it forbids

| Asset | Rule | Applies to this document? |
|---|---|---|
| Product descriptions | **Rewrite every one.** No sentence copied verbatim | Indirectly — `productEmbed` renders live product copy (§22.8) |
| Product names | Rename where they overlap. Distinct names are better brand assets («Ліжник Яворівський» beats a shared generic name) | Indirectly — article prose naming a product must use the new name |
| Category and filter text | New, per the D3 structure | No |
| **Blog and care-guide articles** | **Do not copy. Write fresh** | **Yes — this is the binding rule for §22.3** |
| Photographs | **Reuse permitted**, after re-crop and re-grade to [01-brand-strategy.md](01-brand-strategy.md) §1.6, EXIF strip, semantic rename and **new `alt` text per locale** | **Yes — see below** |
| Reviews | **Do not copy.** They were given to a different seller | Yes — no reviews on editorial content anyway (§22.11) |

**Photographs are the one genuine shortcut available to this document**, and it is worth taking.
Article cover images and body figures may draw on the reused library, subject to all four
processing steps. The §22.7 requirements are unchanged and the fourth step deserves emphasis:
**`alt` text is authored new, per locale, never copied.** Copied alt text reintroduces duplicate
text at the exact point the image was supposed to avoid it, and it is the step most likely to be
skipped because it is invisible.

Two limits on the reused imagery:

1. **It does not document Yavoriv.** Process articles under pillars 7 and 8 describe *this*
   workshop. A figure captioned «наш цех» showing a different workshop in a different village
   fails principle 5 and is falsifiable by anyone who visits. Reused images are usable for
   product, material and detail shots; the process pieces wait for the Yavoriv shoot E5 schedules.
2. **Identical images across two live domains are a weaker signal than unique ones.** They are not
   penalised the way duplicate text is, which is why the reuse is permitted — but the re-crop and
   re-grade are not cosmetic, and an article whose cover is pixel-identical to a competitor's has
   given up a differentiator for no reason.

**Consequently:** no post import, no `Redirect` rows, no Search Console baseline, no preserved
publication dates, and no copied sentences. The `Redirect` model
([25-database-schema.md](25-database-schema.md) §25.9) remains in the schema for future internal
URL changes, but it is not populated at launch.

**The two remaining Round-1 reasons still hold** and are recorded so the idea does not resurface
as a shortcut when the calendar looks daunting: the content is not this business's to republish,
and it was written for a hide-and-fur business rather than a wool-led one with a partner category
to disclose (D3), so inherited copy would contradict the origin framing on day one.

### What replaces it — a launch content set

A blog with three articles reads as abandoned. Cold start means there is no traffic to lose by
publishing slowly, but there *is* credibility to lose by publishing thinly.

| Stage | Volume | Composition |
|---|---|---|
| **Launch (`uk` only)** | 8–12 articles | 3 definitional (pillars 5, 6), 3 care (2, 3), **2 Yavoriv/provenance (pillar 1)**, 2 comparative (4), 1–2 buying guides (9) — **and one of the buying-guide slots is now spoken for**: the return-shipping deposit explainer (H1.3), which ships at launch because the mechanic ships at launch |
| Launch + 3 months | +6 | Process (7, 8) once Yavoriv photography exists; the remaining Yavoriv subjects; first seasonal gift guide |
| Launch + 6 months | +6, plus first translations | `en` and `pl` on the 6 best performers (§22.10) |

**The 8–12 figure stands unchanged**, and Round 2 confirms rather than relaxes it. E5's permission
to reuse products and photographs shortens the *catalogue* workstream, not this one; the article
count is set by what a blog needs in order not to read as abandoned, and that number does not
move because a different workstream got cheaper. If anything the loss of Instagram (E3) argues
for the top of the range rather than the bottom.

What changes is the **composition**. Two of the launch slots are now Yavoriv provenance pieces
(pillar 1), taken from the definitional allocation. The trade is favourable: those articles are
definitional in form — «чому Яворів називають столицею ліжникарства» is a "what is X" question —
while also being the only subjects on the list that **no competitor and specifically not the
adjacent business can write.** They double as the editorial backing for the homepage hero and the
wholesale hero, both of which now stake the brand on this village.

Care content remains the highest priority within the launch set. It is what
[00-existing-site-audit.md](00-existing-site-audit.md) §0.7 correctly identified as high-intent
on the family site, it prevents returns, it is linked from every PDP, and it requires no
photography beyond what a phone can capture — which matters because the Yavoriv shoot (E5) is
still outstanding even though the catalogue library is not.

**Care articles are where the copy temptation is strongest, and where copying is most damaging.**
The adjacent site's care content is good and it is directly relevant — that is exactly why E5
names blog *and care-guide* articles together in its prohibition. Care queries are the ones this
domain can realistically win in year one; handing that category to a duplicate-content
determination against a thirteen-year-old site forfeits the single best organic opportunity the
business has. Rewriting from the same underlying facts is fine and unavoidable — wool is washed at
30 °C on both sites — but the sentences, the structure and the `keyFacts` blocks are authored
here.

**One launch slot is now fixed rather than discretionary, and it is unusual enough to justify
itself.** The return-shipping deposit explainer is not a topic chosen for traffic — it has almost
none — and it would normally have no claim on a launch slot. It gets one because it is the only
article in the set whose absence has a *cost*: the mechanic ships on day one, it sits directly in
front of the payment method that answers the category's largest objection
([02-ux-research.md](02-ux-research.md) A6), and the client's own read is that it can be misread as
a hidden fee ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 4). The article exists
so that checkout has somewhere to link to and support has something to send, which is a different
justification from every other slot in the table and should be recorded as such rather than
quietly folded into the count.

**One care article is not a blog post but a page.** «Догляд» deserves a permanent, linked-from-
every-PDP hub at `/{locale}/dogliad`, assembled from the care articles rather than duplicating
them. It is a `Post` with a pinned tag, surfaced in the footer and the PDP trust row, not buried
in a reverse-chronological feed.

## 22.4 Article template

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SiteHeader                                                                │
│ ═══════════════════════════════════ 34% ══════════╗  reading progress,   │
│                                                    ║  2px, --accent      │
├───────────────────────────────────────────────────────────────────────────┤
│  Журнал → Догляд за вовною                    breadcrumb, caption, muted │
│                                                                           │
│  ДОГЛЯД ЗА ВОВНОЮ                             overline, --accent-text    │
│  Як прати ліжник, щоб він                     h1, display-md, cols 3–9   │
│  не сів і не збився                           max 20ch per line          │
│                                                                           │
│  [avatar] Марія Ш., майстриня · 12 хв читання · 14 березня 2026          │
│           caption, --text-muted                                          │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ COVER IMAGE — 3:2, full editorial width (cols 2–11), radius-none    │ │
│  │ LCP element, eager, fetchpriority=high, NOT animated (13 §13.8)     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌ TOC, sticky ─┐ ┌────────────────────────────────────────────────────┐ │
│  │ У цій статті │ │ Lead paragraph — body-lg, 1.25rem                  │ │
│  │ ─────────────│ │                                                    │ │
│  │ ● Коротко    │ │ ┌ KEY FACTS ─────────────────────────────────────┐ │ │
│  │ ○ Температура│ │ │ • Прати при 30 °C або нижче                    │ │ │
│  │ ○ Засіб      │ │ │ • Не викручувати                               │ │ │
│  │ ○ Сушіння    │ │ │ • Сушити горизонтально                         │ │ │
│  │ ○ Чого не    │ │ └────────────────────────────────────────────────┘ │ │
│  │   робити     │ │   ↑ the AI-citable answer block (§22.12)          │ │
│  │ ○ Питання    │ │                                                    │ │
│  │              │ │ ## Температура                          h2         │ │
│  │ cols 1–2     │ │ Body text, cols 4–10, measure 62–68ch, max 72ch    │ │
│  │ desktop only │ │ (10-typography §10.4). Line height 1.7.            │ │
│  └──────────────┘ │                                                    │ │
│                   │ ┌──────────────────────────────────────────────┐   │ │
│                   │ │ FIGURE — breaks right to col 11 or bleeds    │   │ │
│                   │ │ [image] + caption, caption size, muted       │   │ │
│                   │ └──────────────────────────────────────────────┘   │ │
│                   │                                                    │ │
│                   │ ┃ PULL QUOTE — breaks LEFT to col 2              │ │
│                   │ ┃ display-md, Kyiv*Type Serif                    │ │
│                   │                                                    │ │
│                   │ ┌ CALLOUT ─────────────────────────────────────┐   │ │
│                   │ │ ⚠ Ніколи не сушіть ліжник на батареї         │   │ │
│                   │ └──────────────────────────────────────────────┘   │ │
│                   │                                                    │ │
│                   │ ┌ PRODUCT EMBED ───────────────────────────────┐   │ │
│                   │ │ [img] Ліжник «Мозаїка» 150×200               │   │ │
│                   │ │       Власне виробництво        5 300 грн    │   │ │
│                   │ │       [ Подивитись → ]                       │   │ │
│                   │ └──────────────────────────────────────────────┘   │ │
│                   │                                                    │ │
│                   │ ## Питання і відповіді            → FAQPage       │ │
│                   │ ▸ Чи можна прати в машинці?                       │ │
│                   │ ▸ Що робити, якщо вже сів?                        │ │
│                   └────────────────────────────────────────────────────┘ │
│  ┌ AUTHOR BOX — cols 3–10 ───────────────────────────────────────────┐   │
│  │ [portrait] Марія Ш. · майстриня, 14 років у цеху                  │   │
│  │ Two sentences of real credential. Not a job title alone.          │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│  RELATED ARTICLES — 3 cards          RELATED PRODUCTS — 4 cards          │
│ SiteFooter                                                               │
└───────────────────────────────────────────────────────────────────────────┘
```

### Mobile

```
┌────────────────────────┐   Notes
│ ═════ 34% ═════╗       │   progress bar under the header
│ Журнал → Догляд        │
│ OVERLINE               │
│ H1 display-md          │
│ [avatar] Марія Ш.      │
│ 12 хв · 14.03.2026     │
│ ┌────────────────────┐ │
│ │ COVER 3:2          │ │   LCP, eager, never animated
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ ▸ У цій статті (6) │ │   TOC collapses to an accordion,
│ └────────────────────┘ │   closed by default — an open 6-item
│ Lead ¶ body-lg         │   TOC pushes the article below the fold
│ ┌ KEY FACTS ────────┐  │
│ │ • 30 °C           │  │   always open, never collapsed —
│ │ • не викручувати  │  │   it is the answer
│ └───────────────────┘  │
│ ## Температура         │
│ Body, 16px min,        │   never below 16px (10 §10.3)
│ measure 62–68ch        │
│ [figure, full-bleed]   │
│ ┃ pull quote           │
│ [product embed]        │
│ ## Питання             │
│ [author box]           │
│ [related ×3]           │
└────────────────────────┘
```

## 22.5 The reading experience

| Property | Value | Source |
|---|---|---|
| Measure | 62–68 characters, hard max 72ch | [10-typography.md](10-typography.md) §10.4 |
| Container | `container-narrow` 760 px for body; figures and quotes break the grid | [11-spacing-system.md](11-spacing-system.md) §11.3 |
| Body size | `body` 1rem mobile / 1.0625rem desktop, line-height 1.7 | [10-typography.md](10-typography.md) §10.3 |
| Lead paragraph | `body-lg`, line-height 1.65 | Same |
| Section spacing | `--section-y-lg` editorial density | [11-spacing-system.md](11-spacing-system.md) §11.2 |
| Links in body | `sky-600` (≈5.3:1 on fleece, AA), underlined — never colour-only | [09-color-palette.md](09-color-palette.md) §9.5 |
| Heading levels | One `h1`; `h2`/`h3` only; no skipped levels | [10-typography.md](10-typography.md) §10.8 |
| Typographic conventions | « » guillemets, non-breaking space before `грн`, spaced em dash, applied by the CMS on save | [10-typography.md](10-typography.md) §10.6 |

**Measure is enforced in `ch`, not pixels**, so it survives font substitution. German sets 8–12%
longer than English for the same content; layouts are designed against the German string
([10-typography.md](10-typography.md) §10.4) and verified in Ukrainian.

**Table of contents.** Generated from `h2` nodes in `bodyJson` at render time, never hand-authored
— a hand-maintained TOC drifts on the first edit. Desktop: sticky in columns 1–2, `aria-current`
on the active entry driven by `IntersectionObserver`. Mobile: a closed accordion. Articles with
fewer than three `h2` nodes render no TOC at all.

**Progress indicator.** A 2 px bar in `--accent` beneath the header, driven by CSS
`animation-timeline: scroll()` where supported with a single shared `useScroll` fallback — never a
scroll event handler writing to the DOM ([13-motion-system.md](13-motion-system.md) §13.5). It is
decorative: `aria-hidden="true"`, since the scrollbar already conveys position to assistive
technology. Hidden entirely under reduced motion.

**Reading time** is stored in `Post.readMinutes` and computed from `bodyPlain` at save (200 wpm
for `uk`, adjusted per locale), never at render.

## 22.6 The content model — `bodyJson` and `bodyPlain`

[25-database-schema.md](25-database-schema.md) §25.8 defines `PostTranslation.bodyJson` as a
structured document and `bodyPlain` as its generated plain-text projection. This section fixes
what "structured" means, because an underspecified rich-text model is how a CMS becomes
unmaintainable.

### Node types the editor supports — the complete list

Anything not in this table cannot be authored. That constraint is the point: an editor that can
express anything produces articles that cannot be restyled, cannot be translated consistently,
and cannot be parsed for structured data.

| Node | Attributes | Renders as | Notes |
|---|---|---|---|
| `paragraph` | — | `<p>` | Default |
| `heading` | `level: 2 \| 3` | `<h2>`/`<h3>` | Levels 4+ are not offered. `h1` is the title, never in the body |
| `bulletList` / `orderedList` + `listItem` | — | `<ul>`/`<ol>`/`<li>` | |
| `blockquote` | `attribution?` | `<figure><blockquote>` | Renders as the pull quote breaking left |
| `figure` | `mediaId`, `size: inline \| wide \| bleed`, `caption?` | `<figure><img><figcaption>` | `mediaId` → `Media`; alt from `MediaTranslation` |
| `videoEmbed` | `mediaId`, `autoplay: false` | Poster + player | Self-hosted via Cloudinary only. No YouTube iframe (§22.7) |
| `callout` | `variant: note \| warning \| tip` | Bordered block | Maps to `info` / `warning` semantic colours ([09-color-palette.md](09-color-palette.md) §9.4) |
| `keyFacts` | `items: string[]` | Bordered summary list | **Required as the first block of every article.** The citable answer (§22.12) |
| `productEmbed` | `productId`, `variantId?` | Product card | Renders live price, stock, and the origin label (§22.8) |
| `categoryEmbed` | `categoryId` | Category link card | |
| `stageLink` | `stageId` | Inline link to a production stage anchor | Ties editorial to [20-production-page-specification.md](20-production-page-specification.md) |
| `table` | `header: bool` | `<table>` | Wrapped in an `overflow-x:auto` container; never nested |
| `faq` | `items: {q, a}[]` | `<details>` group | Feeds `FAQPage` structured data (§22.11) |
| `divider` | — | `<hr>` | |
| Marks | `bold`, `italic`, `link{href, rel}`, `code` | — | No `underline` (reads as a link), no colour, no font-size, no alignment marks |

**Deliberate exclusions:** arbitrary HTML, iframes, inline styles, colour pickers, font-size
controls, text alignment, and multi-column layout. Each of them breaks the design system the first
time an editor reaches for it, and none is necessary for any of the eleven pillars.

### `bodyPlain`

Generated on every save inside the same transaction, never at read time
([25-database-schema.md](25-database-schema.md) §25.8). Rules:

- Concatenate text from `paragraph`, `heading`, `listItem`, `blockquote`, `keyFacts.items`,
  `callout`, `table` cells, and `faq` q/a.
- Include `figure.caption` — captions carry real information and are frequently the most citable
  sentence in an article.
- **Exclude** `productEmbed` and `categoryEmbed` rendered text. Product names are transient, and
  indexing them here means an article's search relevance changes when a product is renamed.
- Preserve paragraph boundaries as double newlines so passage extraction has real boundaries.

`bodyPlain` feeds Postgres full-text search and the AI-extraction pipeline. Deriving it at query
time would make search unusably slow, which is the reasoning already recorded in §25.8.

### Validation at save

| Rule | Enforcement |
|---|---|
| First block is `keyFacts` | Blocks publish |
| Every `figure` has alt text in the article's locale | Blocks publish — this is how Accessibility 100 stays achievable ([08-design-system.md](08-design-system.md) §8.7) |
| Heading levels do not skip | Warning |
| No `h2` at all, on an article over 600 words | Warning |
| `productEmbed` references an `ACTIVE` product | Warning; a `DRAFT` or `ARCHIVED` reference blocks publish |
| Body contains none of the deny-list claims ([21-about-page-specification.md](21-about-page-specification.md) §21.12) | Warning with the matched phrase highlighted |
| **Body contains an access promise the business has not made** | Warning. Stems: «екскурсі», «відкрито для відвідувачів», «щодня о», «записатись на огляд». [00-client-decisions-4.md](00-client-decisions-4.md) G3 permits an invitation arranged by phone and nothing more specific |
| **Body states a made-to-order lead time without the transit clause** | Warning where «14 днів» appears without «відправ» or «доставк» nearby. G2 is explicit that the fourteen days are production before dispatch; «14 днів до дверей» is the phrasing that generates a justified complaint on day fifteen |

The last three rules are lints, not gates — false positives are inevitable — but surfacing
«сертифік», «еко», «100% натурал», «засновано 199», «екскурсі» and an unqualified «14 днів» at the
moment of writing is far cheaper than catching them in legal review, or than discovering them in a
one-star review from someone who drove to a locked door.

## 22.7 Images and video in articles

| Requirement | Detail |
|---|---|
| All images via the wrapper component | Raw `<img>` is lint-banned ([08-design-system.md](08-design-system.md) §8.7) |
| Explicit `width`/`height` from `Media` | CLS is structurally zero |
| Alt per locale, required | `MediaTranslation.alt`; enforced at the API layer |
| Cover image is LCP | `loading="eager"`, `fetchpriority="high"`, never animated ([13-motion-system.md](13-motion-system.md) §13.8) |
| Body images | `loading="lazy"`, blurhash LQIP, 300 ms cross-fade (§13.9) |
| Formats | AVIF with WebP fallback via Cloudinary `f_auto`; `srcset` at 1×/2× with `sizes` matching the real 760 px measure |
| Three widths | `inline` 760, `wide` 1120, `bleed` full |
| Captions | Real `<figcaption>`, included in `bodyPlain`. Never baked into the image ([10-typography.md](10-typography.md) §10.8) |
| **No third-party video embeds** | No YouTube or Vimeo iframes. A YouTube embed is 500–900 KB of third-party JavaScript, sets cookies before consent — a `de`-locale GDPR problem — and adds unreviewable third-party code to a page targeting Performance 98–100 |
| Self-hosted video | Cloudinary, poster frame, `preload="none"`, explicit play control, never autoplaying in article body |
| Captions on video | Mandatory, per locale (WCAG 1.2.2) |
| Budget | ≤450 KB mobile first view including the cover; ≤900 KB desktop |

## 22.8 Product embeds and the origin rule

Product embeds are the mechanism by which an informational article earns its place commercially,
and under cold start they are the primary path from organic traffic to the catalogue.

| Rule | Reason |
|---|---|
| Maximum **three** per article, never two consecutively | Beyond three the article reads as an advertorial, which destroys the credibility that made it rank |
| Never in the first screen | The reader must receive value before being sold to |
| Live data, not a snapshot | `productId` resolves at render: current price, current stock. A stale price in a two-year-old article is a customer-service incident |
| **The origin label renders on every embed** | `Product.origin` → «Власне виробництво», or for partner goods **«Відібрано Вівчариком»** plus «Виготовлено карпатським майстром» where `partnerRegion` is known and «Виготовлено іншим виробником» where it is not. **`partnerName` is never rendered** ([00-client-decisions-2.md](00-client-decisions-2.md) E7). Both labels carry equal visual weight. D3 item 5 keeps partner goods out of brand surfaces; an article is an editorial surface and may embed a partner product, but only labelled |
| Out-of-stock embeds degrade, not disappear | The card shows the state and links to the category. Vanishing content breaks the paragraph that referenced it |
| Embeds do not enter `bodyPlain` | §22.6 |

**Partner products in process articles are forbidden.** An article titled «Як ми робимо ліжник»
may only embed own-manufacture goods. Embedding a partner-made item in a piece describing our own
process is exactly the conflation D3 is built to prevent, and it is worse in an article than on a
listing page because the surrounding prose supplies a false claim the label then has to fight.

**And an article may never name a partner manufacturer in prose.** E7's prohibition is on the
fact, not on the field: it does not merely say `partnerName` is not rendered by the embed
component, it says the partners cannot be named. An editor who writes «цей килим тчуть у
майстерні [X]» in a paragraph has defeated the rule by a route the component cannot block. This
is added to the §22.6 deny-list lint as a review instruction rather than a phrase match — no
regular expression can catch an arbitrary workshop name — and it belongs in the editorial
briefing.

What an article **may** say is the region: «цей килим тчуть на Косівщині, у майстерні, з якою ми
працюємо роками». That is honest, specific, checkable as a region, and it is more interesting
prose than a company name would have been.

### Partner goods carry the Вівчарик brand, which makes the embed label harder to skip

[00-client-decisions-3.md](00-client-decisions-3.md) F3 resolves E7's open question: «Так,
продаються під брендом Вівчарик.» Partner goods are sold under the Вівчарик name.

In an article this matters more than it does on a listing page, and for a reason specific to
editorial surfaces. On a listing, the label sits beside a grid of other labels and the reader is
in a comparing frame of mind. In an article, the embed sits inside a paragraph written in the
brand's own voice, in a piece the reader trusts enough to have read to the halfway mark — and
everything on the page now carries one brand name. The surrounding prose is doing the opposite of
what the label does, and the label has to win anyway.

Nothing in the table above is softened. Specifically:

- The origin label renders on **every** embed, both origins, at equal visual weight. There is no
  "obvious from context" exemption, because in an article the context argues the other way.
- `partnerName` is still never rendered and is still absent from the embed component's props.
  `partnerRegion` renders where known.
- The prose prohibition is unchanged and is now the sharper of the two rules: an editor who names
  a workshop defeats a label the component enforces correctly.
- Partner products remain forbidden in process articles (above). That rule was written against
  D3's conflation risk and F3 makes it stricter in effect: a partner item embedded in «Як ми
  робимо ліжник», carrying the Вівчарик brand and no manufacturer distinction, is a false claim
  assembled from three individually true elements.

The structured-data rule that governs the embed's JSON-LD is the same one the catalogue uses:
`brand` is Вівчарик for both origins, and `manufacturer` is set for `OWN_MANUFACTURE` and
**omitted entirely** for `PARTNER_MANUFACTURE` — never set to Вівчарик
([14-component-library.md](14-component-library.md) §14.3,
[29-seo-architecture.md](29-seo-architecture.md)). This matters disproportionately here because
articles are the surface AI assistants quote ([30-ai-search-optimization.md](30-ai-search-optimization.md)),
and a machine-readable manufacturer claim extracted from an article is repeated without the
paragraph that qualified it.

## 22.9 The index, filtering, and related content

### Index

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ЖУРНАЛ                                          display-lg               │
│  Про вовну, догляд і Яворів.                     body-lg, muted, 62ch     │
│                                                                           │
│  [ Усі ] [ Догляд ] [ Яворів ] [ Як це роблять ] [ Гайди ] [ Інтер'єр ]  │
│   ↑ pills, horizontally scrollable on mobile, real links not JS filters   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ FEATURED — one article, 2-col: image left, text right, bg-alt       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                      │
│  │ [cover 3:2]  │ │ [cover 3:2]  │ │ [cover 3:2]  │  3-col lg, 2-col md, │
│  │ ПІЛАР        │ │ ПІЛАР        │ │ ПІЛАР        │  1-col sm            │
│  │ Заголовок h3 │ │ Заголовок h3 │ │ Заголовок h3 │                      │
│  │ Excerpt 2 ln │ │ Excerpt 2 ln │ │ Excerpt 2 ln │  Lift on hover       │
│  │ 8 хв · дата  │ │ 6 хв · дата  │ │ 11 хв · дата │  (13 §13.4)          │
│  └──────────────┘ └──────────────┘ └──────────────┘                      │
│                  [ Показати ще ]   ·   1 2 3 →                            │
└───────────────────────────────────────────────────────────────────────────┘
```

| Decision | Choice | Why |
|---|---|---|
| Filtering | Tag pills that are **real links** to `/{locale}/zhurnal/tema/{tag}` | Crawlable, linkable, shareable. A JS-only filter produces one indexable URL and wastes the pillar structure on a domain that needs every entry point it can get |
| Pagination | «Показати ще» **plus** numbered links | The button serves the reader; the links serve the crawler and are always present in the DOM. Infinite scroll alone is not indexable and breaks back-navigation |
| Page size | 12 | Three clean rows at `lg` |
| Sort | `publishedAt` descending, pinned care articles first | |
| Empty state | Names the filter causing zero results and offers to clear it ([08-design-system.md](08-design-system.md) §8.8) | |
| Canonical | Page 1 self-canonicals; pages 2+ self-canonical with `rel=prev/next` | Canonicalising pagination to page 1 hides articles from the index |

### Related articles

Deterministic, computed at publish, stored — not a runtime similarity query.

1. Same pillar tag, nearest `publishedAt` — up to 2.
2. Shared secondary tag — up to 1.
3. Backfill with the pillar's evergreen cornerstone article.

Never random, never "most popular". A care article must lead to another care article, because the
reader's question is not finished.

### Related products

1. Products explicitly embedded in the article — always shown first.
2. Products in categories the article's tags map to.
3. Filtered to `ACTIVE` and in stock.
4. **Own manufacture ranks above partner products**, and origin labels render on every card.

If fewer than two qualify, the block is replaced by a link to the relevant category. A related-
products rail padded with irrelevant items is worse than none.

## 22.10 Authorship, E-E-A-T, and the translation policy

### Bylines

Every article has a named human author. «Адміністратор» and an unattributed post both signal a
content farm, which is precisely the signal a new domain cannot afford.

| Element | Requirement |
|---|---|
| Name | Real. First name plus initial minimum |
| Role | Specific and relevant: «майстриня, 14 років у цеху», «технолог фарбування» |
| Portrait | Real photograph, 1:1, from the same shoot as [21-about-page-specification.md](21-about-page-specification.md) §21.10 |
| Author page | `/{locale}/zhurnal/avtor/{slug}` listing their articles, linked from every byline |
| Consent | Written, covering four locales, same register as §21.9 |

**Experience is this business's E-E-A-T advantage and it is unusual.** Most competing content is
written by copywriters who have never washed a fleece. An article about fulling written by the
person who operates the fulling machine is first-hand experience in the literal sense, and it
should be stated in the byline rather than left implicit. Where the factory's staff cannot write,
the correct pattern is an interview credited to both — «Записала …, розповів …» — not a ghostwritten
piece attributed to someone who did not write it.

`Post.authorId` already exists in [25-database-schema.md](25-database-schema.md) §25.8. An
`Author` model with per-locale bio translations is required and should be added alongside it.

### Translation policy — a subset, not everything

**Decision: translate a selected subset, not the full archive.** `uk` is the source of truth
([00-README.md](00-README.md)); other locales receive articles chosen deliberately.

| Pillar | `uk` | `en` | `pl` | `de` |
|---|---|---|---|---|
| Care (2, 3) | All | All | Wool care all; hide care **withheld** | Wool care all; hide care **withheld** |
| Definitional (5, 6) | All | All | All | All wool |
| Comparative (4) | All | All | All | All |
| Buying guides (9) | All | Selected | Selected wool | Selected wool |
| Process (7, 8) | All | All | Wool only | Wool only |
| **Яворів (1)** | All | **All** | **All** | **All** |
| Interior (10) | All | Selected | Selected | Selected |
| Gifting (11) | All | Rarely | Rarely | Rarely |

Two rows changed in Round 2.

**Pillar 1 moves from «Selected» to «All» in every locale.** It is the pillar that carries the
brand's differentiator, and the differentiator translates better than it reads in Ukrainian: a
German or Polish buyer has no prior sense of what «Карпати» means commercially, but «the village
that is the centre of this craft» is a proposition that lands in any language, and «Яворів» is a
proper noun they can search. For an international reader this pillar does the job that thirty
years of local reputation does domestically.

**Round 3 confirms this row rather than contradicting it**, and the apparent tension is worth
resolving explicitly. [00-client-decisions-3.md](00-client-decisions-3.md) F6 removes «Яворів»
from the hero and the navbar partly on the grounds that a `de` or `pl` reader cannot place the
name — which looks like an argument against translating this pillar into those locales. It is
not. It is an argument about *where* the name can be introduced. A German visitor cannot absorb an
unexplained proper noun in a five-second headline; a German visitor reading a thousand-word
article titled «Warum Jaworiw als Hauptstadt der Lischnyk-Weberei gilt» is being introduced to it
properly, which is the only way it ever becomes searchable for them. «Карпати» to be understood,
«Яворів» to be believed — and belief is what a full-length article is for. The hero borrows
recognition the reader already has; this pillar builds recognition the reader does not.

**The `pl` column now mirrors `de` on hide content.** The previous draft gated only `de`, on
market-sentiment grounds. E11 supplies a harder reason that applies to both: sheepskin and leather
face EU species-declaration requirements and, for some materials, CITES documentation, which is
why E11 recommends launching `de` and `pl` **wool-only**. Publishing sheepskin care articles in a
locale that cannot receive sheepskin is worse than not publishing them — it generates enquiries
that must be declined, which is a failed transaction rather than a missing one. The gate lifts per
locale when the export documentation is confirmed, from the same setting that governs the nav
([15-navbar-specification.md](15-navbar-specification.md) §15.12).

`en` is unaffected: it is not an EU locale and carries no species-declaration obligation of its
own.

**Round 5 adds a second category of `uk`-only article, and for a sharper reason than the hide
gate.** The COD-with-inspection and return-deposit explainers in pillar 9 describe mechanics that
**do not exist outside Ukraine**: [00-client-decisions-5.md](00-client-decisions-5.md) H1.2 limits
inspection at the branch to domestic orders, and H1.3 forbids the return-shipping deposit for `en`,
`pl` and `de` because the EU Consumer Rights Directive grants an unconditional 14-day right of
withdrawal and a trader may not require a deposit against exercising it.

| | Hide content | Commerce explainers (H1.2, H1.3) |
|---|---|---|
| Why withheld | The goods cannot currently be shipped there | The *mechanism described does not apply there*, and one of them would be unlawful if it did |
| When the gate lifts | When export documentation is confirmed | **Never.** This is not a phased rollout |
| Failure mode if published anyway | Enquiries that must be declined | A German reader told they may pay on inspection and pre-fund a return — neither of which is true for them, and the second of which is a legal claim about a deposit an EU trader may not take |

The distinction matters because the two look like the same rule in the translation table and are
not. Hide content is *deferred*; these are **permanently `uk`-only**, and the admin's translation
completeness indicator must not show them as missing work. A row that reads "untranslated" invites
someone to translate it.

Four reasons for a subset:

1. **Cost is linear in locales and the content budget is not.** Four locales means four times the
   translation, four times the review, four times the maintenance on every correction.
2. **Care and definitional content transfers; cultural and seasonal content does not.** «Як прати
   ліжник» is equally useful in Munich. A Ukrainian gift-giving guide keyed to domestic holidays is
   not, and a machine-translated one is actively bad.
3. **Partial translation is already a first-class state.** The fallback rule in
   [25-database-schema.md](25-database-schema.md) §25.2 serves the `uk` row with
   `x-translation-fallback: true` rather than 404ing, and the admin shows completeness per entity.
   The architecture expects gaps.
4. **Thin translated content damages a new domain.** A hundred machine-translated German articles
   with no engagement is a quality signal working against the site during exactly the sandbox
   period D2 describes.

**Hard rules:** no machine translation published without human review; `hreflang` reciprocal
across every translated pair plus `x-default`; an untranslated article is **absent** from the
foreign-locale index rather than shown in Ukrainian inside a German listing.

## 22.11 SEO and structured data

| Type | Use | Notes |
|---|---|---|
| `Article` | Every post | `headline` ≤110 chars, `datePublished`, `dateModified`, `author` → `Person`, `publisher` → `Organization`, `image` ≥1200 px wide, `inLanguage` |
| `Person` | Author | `jobTitle`, `worksFor`. Links to the author page |
| `FAQPage` | Articles containing an `faq` node | Generated from the node — never hand-written, so markup and visible content cannot drift |
| `HowTo` | Genuine step-by-step care and technique articles | Correct *here*, unlike on the production page ([20-production-page-specification.md](20-production-page-specification.md) §20.15), because the reader really can perform these steps |
| `BreadcrumbList` | Journal → pillar → article | |
| `ImageObject` | Cover and figures | `contentLocation` where shot at the workshop |
| ✗ `Review`, `AggregateRating` | — | Never on editorial content |

Per-locale `metaTitle` and `metaDescription` override slots already exist on `PostTranslation`;
null means generate from content ([25-database-schema.md](25-database-schema.md) §25.2).

**Cold-start specifics** ([00-client-decisions.md](00-client-decisions.md) D2):

- Every article is submitted through the Search Console URL inspector at publish. On a new domain
  discovery is slow and manual submission measurably accelerates it.
- Internal linking is the only link equity available. Every article links to at least two others
  and one category; cornerstone articles are linked from the footer and from PDPs.
- `dateModified` is maintained honestly. Editing a typo does not justify a new date; a substantive
  update does. Date-gaming is detectable and is not worth the risk on a domain with no authority
  to spend.
- Publishing cadence matters more than usual, because an abandoned blog on a new domain reads as
  an abandoned site. See §22.13.

## 22.12 AI-search citability

[30-ai-search-optimization.md](30-ai-search-optimization.md) governs; this section states what
article authoring must do to satisfy it. For a domain with no authority, being **quoted** by an
assistant is a faster route to visibility than being **ranked** by a search engine, which makes
this section commercially significant rather than speculative.

| Requirement | Implementation |
|---|---|
| **The answer comes first** | The mandatory `keyFacts` block (§22.6) sits above the prose. Assistants extract short, self-contained passages; an answer arriving in paragraph nine is not extracted |
| **Passages are self-contained** | Each `h2` section answers its heading without requiring the preceding section. «Як described above» is unresolvable out of context and makes a passage unusable |
| **Named entities, densely** | **Яворів**, Косівський район, Музей ліжникарства, Шкрібляк, Корпанюк, «ліжник», «гуня», «ровниця», machine names, temperatures, durations, micron values. Named entities are what gets extracted and attributed ([01-brand-strategy.md](01-brand-strategy.md) §1.5). Round 2 replaces Вербовець — that was the adjacent business's village ([00-client-decisions-2.md](00-client-decisions-2.md) E2) — and adds four entities that are genuinely rare in this corpus, which is what makes an extracted passage attributable to *this* source rather than to the category |
| **Numbers with units** | «30 °C», «1 400 г», «24 мікрони». A number with a unit is quotable; «тепла й важка» is not |
| **Definitional opening for pillars 5 and 6** | The first sentence is the dictionary answer: «Ліжник — це вовняна ковдра, ткана на верстаті й збита у валилі». Exactly the shape an assistant quotes |
| **`bodyPlain` is complete** | §22.6. The extraction pipeline reads `bodyPlain`; anything absent from it is invisible to AI search |
| **No JavaScript required** | The full article text is in the server-rendered HTML. AI crawlers largely do not execute JS |
| **Attributable claims** | «За нашою практикою», «у нашому цеху» — first-person manufacturer statements are citable with attribution in a way that unsourced generalities are not |
| **FAQ nodes on every commercially relevant article** | Question-shaped content maps directly onto assistant queries |

## 22.13 Editorial workflow and cadence

### Scheduling

`PostStatus` is `DRAFT | SCHEDULED | PUBLISHED | ARCHIVED` with `scheduledFor` and `publishedAt`
already in [25-database-schema.md](25-database-schema.md) §25.8, indexed on
`[status, scheduledFor]`.

| Step | Behaviour |
|---|---|
| Draft | Autosaves. Preview via a signed, expiring URL that requires no login — so a non-technical reviewer can read it on a phone. Note that «requires no login» is now the site-wide default rather than an exception for this one flow: E12 makes guest checkout permanent and there are no customer accounts at all. Staff authentication is unaffected ([24-employee-permission-architecture.md](24-employee-permission-architecture.md)); the preview URL's security is its signature and expiry, not a session |
| Ready for review | Validation from §22.6 runs; blocking failures listed explicitly |
| Schedule | `status = SCHEDULED`, `scheduledFor` set in the author's local time, stored `timestamptz` UTC (§25.1). Ukraine observes DST and storing local time guarantees a twice-yearly bug |
| Publish | A cron worker every 5 minutes promotes due rows, sets `publishedAt`, purges the index and sitemap caches, and pings Search Console |
| Per-locale | Each `PostTranslation` publishes independently. A `uk` article goes live while its `de` translation is still in draft |
| Unpublish | `ARCHIVED` returns 410, not 404, and a `Redirect` row can point it elsewhere |
| Editing live | Substantive edits update `dateModified`; a checkbox lets the editor mark a change as minor and leave it |

### Cadence

`{{BLOG_CADENCE}}` ([00-assumptions.md](00-assumptions.md) E6) is unconfirmed. The recommendation
is shaped by the cold start and by realistic staffing — [00-assumptions.md](00-assumptions.md) E2
allows one content person.

| Period | Cadence | Focus |
|---|---|---|
| Pre-launch | 8–12 articles banked | §22.3 launch set |
| Months 1–3 | **2 per month, `uk`** | Definitional and care. Depth over volume |
| Months 4–6 | 2 per month + first `en`/`pl` translations | Add process pieces as photography arrives |
| Months 7–12 | 2–3 per month | Buying guides and interior; seasonal gifting from October |
| Year 2+ | 2 per month, plus quarterly refresh of the top 10 | Refreshing an existing ranked article outperforms a new one |

**Two per month is a deliberate floor, not an ambition.** A cadence that is missed is worse than a
lower one that is kept: the first is visible as an abandoned blog, the second is a schedule. One
seasonal recurring slot — the gift guide, republished and updated each autumn rather than rewritten
— is worth more than four one-off pieces.

**The editorial calendar lives in the admin**, driven by `scheduledFor`, showing planned slots
with their pillar and their locale status, so a gap is visible a month before it happens rather
than the week it does.

## 22.14 Open items and tokens

### Closed by [00-client-decisions-2.md](00-client-decisions-2.md)

| # | Question | Resolution |
|---|---|---|
| 3 | Sheepskin and hide content in `de` | **Withheld in `de` and now also `pl`**, per E11's wool-only launch recommendation — species declarations, not only market sentiment. §22.10 |
| 4 | May partner manufacturers be named? | **No, permanently** (E7). Embeds render «Відібрано Вівчариком» + region; prose may name a region but never a workshop. §22.8 |
| 5 | Photography for process articles | **Partly.** E5 permits reuse of the adjacent site's library for product, material and detail images after reprocessing. Process articles still need the Yavoriv shoot, which is descoped to one or two days. §22.3 |
| — | May the adjacent site's articles be copied? | **No.** E5 is explicit: blog and care-guide articles are written fresh. That site stays live, so copying puts two live sites in competition and the new domain loses. §22.3 |
| — | Article subjects the competition cannot match | **Supplied by E2**: Яворів as «столиця ліжникарства», the Музей ліжникарства, the lizhnyk-weaving plein airs, and the Шкрібляк/Корпанюк woodcarving lineage. §22.2 |
| — | Instagram as a content-demand signal and distribution channel | **Does not exist** (E3). The phone log and workshop conversations replace it as a topic source; nothing replaces it as distribution, which is why this channel is now primary. §22.1 |
| — | `{{SKU_COUNT}}` | **Several hundred to roughly a thousand** (E5). Enough that `productEmbed` selection is a real editorial decision rather than a shortlist, and enough to justify the three-per-article ceiling |

### Closed by [00-client-decisions-3.md](00-client-decisions-3.md)

| # | Question | Resolution |
|---|---|---|
| — | Does the Яворів pillar survive the tagline reversal? | **Yes, unchanged, and it carries more.** F6 returns the hero, the navbar and the wholesale subhead to «в Карпатах» and names the journal as one of the surfaces Яворів stays on. Pillar 1 is now the only place the argument is made at length. §22.2, §22.10 |
| — | Are partner goods branded? | **Sold under the Вівчарик brand** (F3). The §22.8 embed label and the prose prohibition are unchanged and matter more. `brand` is Вівчарик for both origins; `manufacturer` is omitted for partner goods |
| — | What the tourist articles can offer a reader | **A visit.** F2 confirms the Яворів site is a shop as well as a production floor, which gives pillar 1's museum and place pieces a closing line and an offline-to-online path. §22.2 |

### Closed by [00-client-decisions-4.md](00-client-decisions-4.md)

| # | Question | Resolution |
|---|---|---|
| — | What can a place article offer a reader at the end? | **A tour of the workshop with Іван**, arranged in advance by phone (G3). Pillar 1's closing block is upgraded; the prohibitions — no times, no «екскурсія», no booking, no drop-in — are enforced at the §22.6 lint layer rather than left to editorial judgement |
| — | Does the blog have any owned distribution at all before `{{DOMAIN}}` resolves? | **One surface: the card already in every parcel** (G4). It reaches post-purchase readers, including counter-sale buyers the site cannot otherwise contact. It resolves to the review-and-reorder page, which links onward to the journal — the journal does not compete for the card |
| — | Which number does an article's visit line show first? | **Іван, with Любов as the fallback** (G1), from the shared `contact.visitLine` setting |

### Closed by [00-client-decisions-5.md](00-client-decisions-5.md)

| # | Question | Resolution |
|---|---|---|
| — | Does the transaction itself belong in the journal? | **Yes, in pillar 9, and one launch slot is reserved for it.** The return-deposit explainer (H1.3) ships at launch because the mechanic ships at launch. COD-with-inspection (H1.2) and custom sizing (H3b, G2) follow. §22.2, §22.3 |
| — | Are the commerce explainers translated? | **No — permanently `uk` only.** Both mechanics are Ukraine-only by ruling, and the deposit would be unlawful for an EU consumer. Distinct from the hide gate, which is deferred rather than permanent. §22.10 |

### Still open

| # | Question | Blocks |
|---|---|---|
| 1 | Who writes? Which staff can be credited and photographed? (§22.10) | Bylines, and the E-E-A-T advantage. E1 names Іван and Любов Гондурак; their written consent to be credited and photographed is still required |
| 10 | **Approval of the tour wording** ([00-client-decisions-4.md](00-client-decisions-4.md) G3 supplies it pending approval) | Pillar 1's closing block. The shared setting means one approval covers every place article; an unapproved improvisation would propagate the same way |
| 11 | **How is a custom size priced?** ([00-client-decisions-5.md](00-client-decisions-5.md) §H5 item 1) | The custom-sizing buying guide. An article explaining what a custom size costs cannot be written before anyone knows |
| 9 | `{{DOMAIN}}` with SPF, DKIM and DMARC configured | Newsletter double opt-in, which the blog depends on for its only owned distribution channel. F5 establishes that confirmation mail **cannot** be sent from `@gmail.com` — SPF and DKIM cannot be published for `gmail.com` by a third-party system and Gmail's consumer DMARC policy rejects such mail. An unconfirmable subscriber is an unreachable one, and with no social channel (E3) this is the blog's only way to reach a returning reader |
| 2 | `{{BLOG_CADENCE}}` — realistic commitment | §22.13. Materially more important now that this is the sole compounding channel |
| 6 | Is there an existing offline care leaflet worth adapting? | Accelerates the launch care set — and unlike the adjacent site's articles, the business's **own** leaflet is free to adapt |
| 7 | Exact status and wording of any Hutsul-lizhnyk heritage reference (E13.4) | Pillar 1 entirely. Nothing referencing the register may publish until this is confirmed |
| 8 | Whether an Instagram account is created before launch (E13.9) | Not a blocker, but it changes how launch articles are distributed and whether §22.1's "sole channel" framing holds |

Tokens introduced: none. Carried: `{{BLOG_CADENCE}}`, `{{DOMAIN}}`.
`{{SKU_COUNT}}` is **resolved** by E5 and no longer blocks anything in this document.

**Schema additions required by this document:** an `Author` model with `AuthorTranslation` for
per-locale bios, referenced by the existing `Post.authorId`; and a `PostTag` pillar taxonomy
seeded with the eleven pillars in §22.2.
