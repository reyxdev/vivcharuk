# 30 — AI Search Optimisation (GEO)

Companion to [29-seo-architecture.md](29-seo-architecture.md). Governed by
[00-client-decisions-3.md](00-client-decisions-3.md) first,
[00-client-decisions-2.md](00-client-decisions-2.md) second and
[00-client-decisions.md](00-client-decisions.md) third. Five rulings shape this document:

1. The site is a **cold start** on a new domain with no authority (D2).
2. The catalogue contains **partner-manufactured goods alongside own manufacture** (D3), the
   partners **cannot be named** ([00-client-decisions-2.md](00-client-decisions-2.md) E7), and the
   goods are **sold under the Вівчарик brand**
   ([00-client-decisions-3.md](00-client-decisions-3.md) F3). Every entity claim about
   *manufacturing* is therefore scoped to own-manufacture products, while the *brand* claim spans
   both. Partner goods carry a brand entity and no manufacturer entity at all — §30.3 sets out why
   that distinction is the whole game for this document.
3. **The place entity is Яворів**, not Вербовець and not «Карпати»
   ([00-client-decisions-2.md](00-client-decisions-2.md) E2). §30.3 is built around it. **Round 3
   does not change this**, and §30.3 now says so explicitly, because
   [00-client-decisions-3.md](00-client-decisions-3.md) F6 reverts the *tagline* to «в Карпатах»
   and it would be easy to read that as a reversal here. It is not. Headline copy and entity
   resolution are different problems with different constraints.
4. **The Яворів premises are a shop as well as a factory**
   ([00-client-decisions-3.md](00-client-decisions-3.md) F2). This adds a second, retail predicate
   to the business entity and makes the site a legitimate answer to «де купити» questions rather
   than only «хто робить» questions. §30.3 and §30.6 absorb it.
5. **There is no social media of any kind** ([00-client-decisions-2.md](00-client-decisions-2.md)
   E3). Off-site brand-mention signals — §30.11's grade-B lever — start at effectively zero, and
   that is a real constraint on citability rather than a gap to be filled later by default.

## 30.1 What GEO is, and what it is not

"Generative Engine Optimisation" is the practice of making a site's content easy for an AI
assistant to **retrieve, parse, quote and attribute**. That is the whole of it.

**It is not a ranking system.** There is no GEO algorithm to reverse-engineer, no published
ranking factors, no equivalent of Search Console for assistants, and no vendor who can honestly
sell a guaranteed position in a generated answer. Anyone claiming otherwise is selling
speculation.

### Evidence grading

Every tactic in this document carries a grade. This is not hedging — it determines how much
budget each one deserves.

| Grade | Meaning |
|---|---|
| **A — Established** | Documented by the platform, or a direct mechanical consequence of how retrieval works. Would be done anyway for conventional SEO. |
| **B — Reasoned** | Strongly implied by how retrieval-augmented generation works, consistent with observed behaviour, but not documented or independently verified at scale. |
| **C — Speculative** | Plausible, cheap, unverified. Do it if it costs nothing. Never build a plan on it. |

| Tactic | Grade | Note |
|---|---|---|
| Server-rendered HTML (§30.2) | **A** | Most retrieval crawlers do not execute JavaScript. Mechanical. |
| Allowing AI crawlers in `robots.txt` (§30.9) | **A** | A blocked crawler cannot cite you. Mechanical. |
| Valid, consistent structured data (§30.4) | **A** | Documented input to Google's systems; parsed reliably by everything else. |
| Clear heading hierarchy and semantic HTML (§30.6) | **A** | Determines chunk boundaries in any sane chunking strategy. |
| Self-contained, factual passages (§30.5) | **B** | Follows from how passages are embedded and retrieved. Consistent with observed citation patterns. |
| Q&A pairs, comparison tables, spec tables (§30.6) | **B** | High extraction success in practice; no platform guarantees it. |
| Entity consistency across site and off-site profiles (§30.3) | **B** | Established for knowledge graphs; extrapolated to LLM retrieval. |
| Off-site brand mentions (§30.11) | **B** | Third-party corpora are retrieval sources. Volume required is unknown. **Currently near zero** — no social accounts exist ([00-client-decisions-2.md](00-client-decisions-2.md) E3) and the only off-site surface is the Google Business Profile. This is the binding constraint on citability, and no amount of on-site work relieves it. |
| `llms.txt` (§30.8) | **C** | Zero confirmed consumers. Trivial cost. |
| Keyword-style "optimisation for AI" copy | — | **Rejected.** No evidence, and it degrades the copy for humans. |

**The honest summary: roughly 80% of effective GEO is good technical SEO plus good, specific,
factual writing.** The remaining 20% is structural choices about how facts are packaged. A team
that does [29-seo-architecture.md](29-seo-architecture.md) properly has already done most of this
document. That should be reassuring, not disappointing — it means there is no second budget.

### The one genuine advantage this business has

Assistants synthesise from many sources. What they cannot synthesise is **first-hand, specific,
verifiable fact that exists nowhere else**: the micron of the wool from a named Carpathian flock,
what fulling a ліжник in water actually does to the fabric, the difference between ровниця and
пряжа in practice, how a гуня is cut. A reseller cannot write those paragraphs. A manufacturer
that has run for over 30 years can. That is not an SEO tactic; it is the same
[01-brand-strategy.md](01-brand-strategy.md) §1.5 voice principle — *show the work, don't claim
the quality* — arriving at the same conclusion from a different direction.

Round 2 sharpened this considerably. The business is not merely *a* Carpathian manufacturer; it
operates in **Яворів, the village that Hutsul lizhnyk weaving is named for**
([00-client-decisions-2.md](00-client-decisions-2.md) E2). An assistant answering «де роблять
справжні ліжники» is resolving a place before it resolves a vendor, and this business sits at the
centre of the place. §30.3 is where that is turned into an entity strategy.

---

## 30.2 How assistants actually retrieve and cite

Three mechanisms, each with different implications.

### Mechanism 1 — live retrieval at query time

**Who:** Perplexity, ChatGPT search mode, Claude with web search, Bing Copilot, Google AI
Overviews / AI Mode.

The assistant issues one or more search queries, fetches a handful of results, extracts text, and
generates an answer with citations. This is the mechanism that matters most, because it is the
only one where fresh content and fresh pages can appear the day they are published.

**Implications, all grade A:**

- **The page must return complete content in the initial HTML response.** Retrieval fetchers
  generally do not execute JavaScript. This is the single strongest argument for the SSR decision
  in [29-seo-architecture.md](29-seo-architecture.md) §29.1 — a client-rendered site is not merely
  disadvantaged here, it is invisible.
- **The page must be reachable by a conventional search first.** Live retrieval runs *on top of* a
  search index (Bing's, Google's, or the assistant's own crawl). A page that does not rank at all
  is rarely retrieved. On a cold-start domain (D2) this is the binding constraint, and it means
  GEO cannot outrun the 3–6 month sandbox described in
  [29-seo-architecture.md](29-seo-architecture.md) §29.15.
- **Speed matters.** Fetchers use short timeouts. A slow page is a dropped source.
- **Bing's index is disproportionately important.** Copilot uses it directly and other products
  have used it via API. Bing Webmaster Tools is therefore not optional
  ([29-seo-architecture.md](29-seo-architecture.md) §29.17).

### Mechanism 2 — training-corpus knowledge

**Who:** every model, for anything it answers without searching.

Content is absorbed into training data via crawls (GPTBot, ClaudeBot, CCBot / Common Crawl) and
surfaces as unattributed general knowledge months or years later. **No citation, no link, no
traffic.** For a brand this is close to worthless directly; its value is indirect, in whether the
model knows that a ліжник is fulled and that Kosiv district is where it comes from.

**Implication:** training-crawler access is a *brand-awareness* decision with a long horizon and
no measurable return, not a traffic decision. It is argued in §30.9.

### Mechanism 3 — knowledge-graph and entity grounding

**Who:** Google AI Overviews most visibly.

Answers are grounded against structured entity data — the Knowledge Graph, business profiles,
structured markup. This is why §30.3 and §30.4 exist, and why the Google Business Profile
(§29.16) does double duty: it is simultaneously the primary early traffic channel and the most
authoritative machine-readable statement of what this business is.

### What follows for the build

| Requirement | Where it is satisfied |
|---|---|
| Full HTML without JavaScript | [29-seo-architecture.md](29-seo-architecture.md) §29.1 |
| Fast response | §29.14 budgets |
| Crawler access | §30.9 |
| Conventional indexing | §29.15 cold-start plan |
| Extractable structure | §30.5, §30.6 |
| Consistent entity identity | §30.3, §30.4 |

---

## 30.3 Entity strategy

An assistant answering «де купити справжній ліжник» is resolving entities: a *product type*, a
*place*, a *craft*, and candidate *businesses*. The site's job is to be unambiguously associated
with all four.

### The four entity layers

| Layer | Entities | Where asserted |
|---|---|---|
| **Business** | `{{BRAND_NAME}}` / Вівчарик — a wool manufacturer in Яворів **with a shop at the same address** ([00-client-decisions-3.md](00-client-decisions-3.md) F2) | `Organization` carries the manufacturing predicate; the `["Store", "LocalBusiness"]` node carries the retail predicate ([29-seo-architecture.md](29-seo-architecture.md) §29.6); About page, contact page, Google Business Profile, `sameAs` |
| **Place** | **Яворів → Косівський район → Івано-Франківська область → Гуцульщина → Українські Карпати** | `PostalAddress`, `GeoCoordinates`, on-page prose, production page, article `about` |
| **Craft** | Ліжникарство, ліжник, гуня, ровниця, вичинка овчини, гуцульське ткацтво, валяння, прядіння, чесання | `knowsAbout`, editorial hubs, production stage pages, FAQ |
| **Product** | Named products — Ліжник «Мозаїка», Ліжник «Яворівський» | `Product` nodes, PDP `h1`, internal links |

### The place chain matters more than the brand — and Яворів is the link that carries it

A new domain has no brand recognition (D2). It does, however, sit inside an entity chain that is
already well-established in every model's knowledge. **Associating the business with an entity
that already exists is far cheaper than establishing a new one**, and
[00-client-decisions-2.md](00-client-decisions-2.md) E2 supplies a far better entity than the one
this section previously used.

The chain, and what each link is worth:

| Link | Strength as an entity | Competitive value |
|---|---|---|
| **Яворів (Косівський район)** | Well-documented as the centre of Hutsul lizhnyk weaving — «столиця ліжникарства». Has a dedicated Музей ліжникарства, annual weaving plein airs attended by art historians from Kyiv, Lviv and Ivano-Frankivsk, and is the home village of the Шкрібляк and Корпанюк woodcarving dynasties | **Highest.** Strong recognition, almost no competing claimants. This is the association to build |
| **Косівщина** | Well-documented centre of Hutsul craft generally | High. Broader, still specific, still few claimants |
| **Гуцульщина** | Well-documented cultural region | Medium. Recognised everywhere, claimed by many |
| **Українські Карпати** | Universally recognised | **Near zero as a differentiator.** Thousands of sellers assert it; an assistant resolving it retrieves a saturated field |

The decisive property is the combination: **Яворів has high pre-existing recognition and a very
small set of businesses entitled to claim it.** Most entity-building advice trades one against the
other — you can be specific and unknown, or general and contested. Яворів is specific *and* known,
which is rare enough that it should drive the strategy rather than decorate it.

This is [01-brand-strategy.md](01-brand-strategy.md) §1.4 ("Rooted": name the specific valley, not
"Карпати") arriving at the same place from a different direction. Naming Яворів and Косівський
район puts the business inside a resolvable, pre-existing entity graph next to a museum and a
recurring cultural event. "Карпатська вовна" puts it nowhere.

### Why the tagline reversion does not touch this strategy

[00-client-decisions-3.md](00-client-decisions-3.md) F6 confirms the tagline as «Понад 30 років
виробляємо натуральні вовняні вироби **в Карпатах**» and withdraws the proposal to substitute «у
Яворові». That is a change to [29-seo-architecture.md](29-seo-architecture.md) §29.4's title
templates. **It is not a change to anything in this section, and the chain above stands exactly as
written: Яворів → Косівщина → Гуцульщина.** Stating this explicitly is worth the paragraph,
because the two decisions look like the same decision and are not.

The reason they diverge is that they solve different problems under different constraints:

| | Tagline / headline copy | Entity resolution |
|---|---|---|
| Read by | A human, once, in under two seconds, before they have decided to care | A retrieval system, repeatedly, with unlimited patience and no comprehension cost |
| Failure mode | The reader does not recognise the word and stops reading | The system cannot disambiguate the business from thousands of others making the same claim |
| What a rare, specific word costs | **A lot.** «Яворів» in a headline is a proper noun the reader may never have seen, spent at the exact moment attention is most fragile | **Nothing.** A machine does not find a word confusing; it either resolves to a known entity or it does not |
| What a common, general word costs | **Nothing.** «Карпати» is instantly understood by every audience including foreign buyers | **Almost everything.** «Карпати» resolves to a saturated field where thousands of sellers assert the same association, and an entity in a saturated field is an entity that does not get named in an answer |

The two columns have opposite signs in both rows. That is why one document reverts and the other
does not, and why the correct answer is to do both rather than to pick one.

Concretely, F6 changes no assertion in this document: `PostalAddress` still carries с. Яворів,
`knowsAbout` still carries Яворів and Косівщина, the production and about pages still name the
village and explain it, `Place` and article `about` nodes are untouched, and the editorial clusters
in [29-seo-architecture.md](29-seo-architecture.md) §29.13 still target the яворівський term set.
The only surface that changes is the one a human reads first.

**«Карпати» to be understood, «Яворів» to be believed** ([00-client-decisions-3.md](00-client-decisions-3.md)
F6). Retrieval systems are in the believing business.

**The craft entity carries the place entity.** An assistant that knows what ліжникарство is very
likely knows where it comes from, because the two facts travel together in every source that
discusses either. Writing well about the craft therefore strengthens the place association even on
pages that never mention the address — which is why the editorial clusters in
[29-seo-architecture.md](29-seo-architecture.md) §29.13 are an entity investment and not only a
traffic one.

### The heritage claim — a hard constraint on this section

Hutsul lizhnyk weaving is widely described as inscribed on Ukraine's national register of
intangible cultural heritage. That is a powerful entity signal and it is exactly the kind of fact
an assistant will repeat.

**It may not be published until the exact status and wording are verified**
([00-client-decisions-2.md](00-client-decisions-2.md) E2, E13.4;
[29-seo-architecture.md](29-seo-architecture.md) §29.6). And the scoping rule is absolute: **a
craft may be listed; a company is not.** Nothing on this site may be phrased so that an assistant
could reasonably extract "Вівчарик holds a heritage designation" — because if it does, that
sentence will be repeated, unattributed and uncorrectable, in answers the business never sees.
This is the one place where the citability the whole document is optimising for works against the
business, and it is worth being paranoid about.

Permitted: a sentence about the craft, with the register named, in editorial prose that also names
its source. Forbidden: the designation anywhere near the brand name, in any `Organization`
property, or in any meta field.

### Entity consistency rules

1. **One canonical name form per locale**, used everywhere without variation. A brand that appears
   as three strings is three weak entities instead of one.
2. **Place names use the full chain on first mention** on every significant page: «с. Яворів,
   Косівський район, Івано-Франківська область». Subsequent mentions may shorten to «Яворів». The
   first mention is what makes the entity resolvable; the shortened ones are what make the page
   readable.
3. **Craft terms are defined at first use** on any page where a non-expert might land. An
   undefined term cannot be extracted as a definition. `ліжникарство` is now on that list alongside
   `ліжник`, `гуня` and `ровниця`.
4. **NAP is byte-identical** across site, JSON-LD, Google Business Profile and every directory
   ([29-seo-architecture.md](29-seo-architecture.md) §29.16). A single source of truth in the
   `Setting` table. The address is вул. Петруші, с. Яворів, 78644 — **not Вербовець**, which
   belongs to the adjacent business.
5. **`sameAs` is an identity claim, not a link list.** It asserts "these profiles are this
   organisation". It currently carries the Google Business Profile URL and nothing else, because
   nothing else exists ([00-client-decisions-2.md](00-client-decisions-2.md) E3). The adjacent
   business's `@fabryka_shkur` handle and `shkura.ovecha@gmail.com` address must **not** appear;
   asserting them merges two separate businesses in every graph that consumes the markup, which is
   a far more expensive error than an empty field.

### The origin constraint — D3 and F3, restated for entities

The business is three things at once: a manufacturer of wool goods, a **shop** at the same address
([00-client-decisions-3.md](00-client-decisions-3.md) F2), and a retailer that sells partner-made
goods **under its own brand** ([00-client-decisions-3.md](00-client-decisions-3.md) F3). An entity
strategy that flattens any of the three produces a false claim.

| Claim | Scope |
|---|---|
| "Виготовляє вовняні вироби понад 30 років" | The **business** and its **own-manufacture** products |
| "Повний цикл: від сировини до виробу — миття, чесання, прядіння, ткання, пошиття, вичинка" | Own manufacture only. [00-client-decisions-2.md](00-client-decisions-2.md) E6 confirms the full cycle including hides, so this claim is now broader than it was — and §E6's self-policing constraint applies: a stage that cannot be photographed is not asserted |
| "Виробництво у Яворові на Косівщині" | Own manufacture only |
| "Продає вироби карпатських майстрів" | The business, including partner goods |
| **"Продається під брендом Вівчарик"** | **Both origins.** F3. The `brand` property is asserted identically on own-manufacture and partner goods |
| **"Магазин у Яворові, де можна купити на місці"** | The **place**, not the products. Carried by the `["Store", "LocalBusiness"]` node and the GBP retail categories ([29-seo-architecture.md](29-seo-architecture.md) §29.16) |
| Product-level manufacturing claims | Present on `OWN_MANUFACTURE` only. `PARTNER_MANUFACTURE` emits **no `manufacturer` node at all** ([29-seo-architecture.md](29-seo-architecture.md) §29.6) |

**E7 and F3 together make scoping more important, not less.** The partners cannot be named, so a
partner product has no manufacturer entity to attribute to — and now the product carries the
Вівчарик brand name, so the empty `manufacturer` field sits directly beside a populated `brand`
field holding exactly the string a developer would be tempted to copy into it. The temptation is
structural rather than careless: an adjacent, populated, correct-looking value is the single most
likely source of a wrong one.

Setting `manufacturer` to Вівчарик would assert, in the format knowledge graphs consume most
reliably, that this business made goods it did not make. An assistant would then repeat it, and the
correction would have to chase the claim across every system that ingested it. **This is the one
field in the project where a two-character change produces an unretractable false claim**, which is
why [29-seo-architecture.md](29-seo-architecture.md) §29.6 guards it with a CI assertion rather
than a code comment, and why
[23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6 surfaces the consequence in
the admin at the moment the origin is flipped.

**Omission is the correct output, and it must be deliberate rather than accidental.** The
serialiser treats `manufacturer` as optional on partner goods and a test asserts its absence, while
`brand` is required on both and a test asserts its presence
([29-seo-architecture.md](29-seo-architecture.md) §29.6). What the partner product *does* carry is
a brand, a region — «Косівщина», «Гуцульщина» — and a curation statement, «Відібрано Вівчариком».

**Why the brand claim does not contaminate the manufacturing claim.** A retrieval system reading
`brand: Вівчарик` on a product with no `manufacturer` has been told precisely what is true: this is
sold as a Вівчарик product and the maker is not stated. That is a weaker claim than own manufacture
and it should be — but it is not a false one, and schema.org's separation of the two properties is
exactly the distinction the business needs. The risk is not the markup; the risk is prose that
blurs them, which §30.7's opening-paragraph template handles by putting the scope in the same
sentence as the claim.

Practically: the homepage, production page and about page describe own manufacture and show only
own-manufacture products (D3.5). The curation framing in D3.2 — *a factory that also selects is a
more credible authority than one that only sells itself* — is weaker without a named partner, but
it is not gone: an expert stating their selection criteria is making an expert statement whether or
not they name the supplier.

### Off-site entity building

The same entity, asserted consistently in places assistants retrieve from. Note the starting
position: **the business currently has exactly one off-site surface.** Everything else on this list
is a surface that has to be created.

| Surface | Priority | Status | Note |
|---|---|---|---|
| Google Business Profile | Highest | **Exists**, unverified against the checklist | The only off-site assertion the business currently has, and also the primary early traffic channel ([29-seo-architecture.md](29-seo-architecture.md) §29.16). Audit it before launch — a profile carrying the wrong village asserts the wrong entity |
| **Музей ліжникарства (Яворів)** | High | Does not exist | A listing, mention or partnership page from the museum documenting this craft *in this village* is the most topically precise third-party assertion available anywhere. It ties the business to the place entity directly |
| **Ліжникарський пленер** | High | Does not exist | Participation produces both a listing and press coverage, and it is recurring rather than one-off |
| Ukrainian craft and manufacturer directories | Medium | Do not exist | Real citations, real links, low volume |
| Kosiv-district tourism listings | Medium | Do not exist | Reinforces the place chain specifically — and the place chain is now the strategy |
| Regional press and craft publications | Medium | Do not exist | The most credible third-party assertion available. A 30-year family workshop in the lizhnyk capital is a genuine story |
| Wikidata entry | Medium | Does not exist | Structured, freely licensed, widely ingested. Requires genuine notability — attempt only *after* real third-party coverage exists, and never fabricate it |
| Instagram | Medium | **Does not exist, recommended** | [00-client-decisions-2.md](00-client-decisions-2.md) E3. Not a decision. If created, the bio carries the same name, place and craft terms and it is added to `sameAs` |
| OpenStreetMap entry | Low, cheap | Does not exist | Freely licensed; feeds many downstream datasets, including some an assistant may reach |

The honest reading of that table: **the entity currently has one assertion, and an entity with one
assertion is an entity a retrieval system has little reason to trust.** §30.11 quantifies what
follows from that.

---

## 30.4 A knowledge-graph-ready data model

The schema in [25-database-schema.md](25-database-schema.md) already stores facts as fields
rather than prose, which is the precondition for emitting them as machine-readable claims. This
section names the mapping so it is not re-derived per page.

| Schema field | Emitted as | Consumer |
|---|---|---|
| `Product.woolOrigin` | `additionalProperty` "Походження вовни" + prose in the origin block | Provenance queries |
| `Product.woolMicron` | `additionalProperty` with `unitText` "мкм" + a plain-language band | "Will it itch" queries |
| `Product.productionStage[]` | Prose list + deep links to production-page stage anchors | Manufacturing claims |
| `Product.origin` / `partnerRegion` | `brand` = Вівчарик on **both** origins (F3); `manufacturer` emitted **only** on own manufacture and **omitted entirely** on partner goods (§29.6). `partnerName` is never emitted — E7 | Correct attribution |
| `ProductAttributeValue` + `AttributeDefinition.unit` | Spec table + `additionalProperty` | Comparison queries |
| `ProductVariant.priceMinor`, denormalised min/max | `AggregateOffer` low/high | Price queries |
| `MediaTranslation.alt` / `caption` | `ImageObject.description` / `caption` | Multimodal retrieval |
| `PostTranslation.bodyPlain` | The extraction surface — see below | Passage retrieval |
| `Category` tree | `BreadcrumbList`, `ItemList` | Taxonomy grounding |
| `Setting` NAP | `PostalAddress`, `GeoCoordinates`, `telephone`. **No `OpeningHoursSpecification`** — hours are variable and live on the Google Business Profile only ([29-seo-architecture.md](29-seo-architecture.md) §29.6) | Local queries |

### `PostTranslation.bodyPlain` as the extraction surface

[25-database-schema.md](25-database-schema.md) §25.8 stores rich text twice: `bodyJson` renders,
`bodyPlain` is generated for full-text search **and for AI extraction**. Three concrete uses:

1. **Internal retrieval.** The on-site search and the on-site assistant (if one ships) embed
   `bodyPlain` chunks. Deriving plain text at query time would be unusably slow — hence the stored
   column.
2. **Structural QA.** `bodyPlain` is what an external extractor sees after markup is stripped. A
   CI check reads it and fails a post where a paragraph is under 25 words (too fragmentary to
   stand alone), where a heading is followed by no prose, or where the text depends on an image
   caption to make sense. This is the cheapest available proxy for "is this passage citable".
3. **Passage export.** `bodyPlain` plus the heading path is what any future embedding index or
   `llms-full.txt` (§30.8) is generated from. Generating it from `bodyJson` at export time would
   duplicate the serialiser.

The generator preserves paragraph boundaries as double newlines and prefixes each section with
its heading path (`Догляд > Прання`). Chunk boundaries follow headings, so the heading must
travel with the text — a chunk that arrives without its heading loses the context that made it
answerable.

---

## 30.5 Passage-level citability

An assistant does not cite a page. It cites a **passage** — typically 40–120 words — that answers
the question on its own. A paragraph that only makes sense after reading the two above it is not
citable, however good the page is.

### The six writing rules

Applied to every editorial paragraph, every FAQ answer, every category intro and every product
origin block. They are in the content style guide and are checked at editorial review.

1. **Self-contained.** No unresolved "це", "той", "як згадано вище". Each paragraph restates its
   subject. *Not* «Його валяють у воді близько години» but «Ліжник валяють у воді близько
   години».
2. **One claim per paragraph, stated in the first sentence.** The answer comes first; the
   elaboration follows. An assistant extracting the first sentence should still be correct.
3. **Specific and checkable.** Numbers, units, place names, dates, named processes. «Вовна 27–30
   мкм» is extractable; «дуже м'яка вовна» is not. This is
   [01-brand-strategy.md](01-brand-strategy.md) §1.5 rule 2 restated.
4. **Attributed where it is a claim about us.** «Ми виготовляємо ліжники у Яворові на
   Косівщині» — first person, locatable, falsifiable. An unattributed claim is unusable as a
   citation, because the assistant cannot say who said it. Naming Яворів rather than «Карпати»
   also makes the claim *checkable*, which is what separates a citation from a marketing line.
5. **Unambiguous about scope.** A claim about own manufacture says so (D3). «Усі наші ліжники
   виготовлені на власному виробництві» is precise; «Усі наші вироби виготовлені нами» is false
   the moment a partner product exists.
6. **Plain syntax.** Short sentences for facts, longer only for narrative. Nested clauses survive
   chunking badly.

### What this rules out

Marketing paragraphs that assert without specifying; paragraphs whose subject is only in the
heading; copy that depends on an adjacent photograph; "click here to learn more" as a substitute
for the sentence that would have answered the question; and any paragraph that would be wrong if
quoted without the one before it.

### Worked example

**Not citable:**

> Це справді унікальний виріб. Його роблять вручну за давньою технологією, і він неймовірно
> теплий. Ви точно відчуєте різницю.

Three unresolved pronouns, no subject, no number, no place, nothing falsifiable, and no
attribution. Extracted into an answer it says nothing about anything.

**Citable:**

> Ліжник — це гуцульське вовняне покривало, зіткане на верстаті й потім заваляне у воді. Валяння
> ущільнює полотно, після чого ворс піднімають вручну. Наші ліжники виготовлені зі 100% вівчої
> вовни тониною 27–30 мкм на власному виробництві у селі Яворів Косівського району — селі, яке
> називають столицею ліжникарства.

Subject named, process defined, two checkable numbers, a place chain, first-person attribution,
and the manufacturing claim scoped to own production. It answers «що таке ліжник», «з чого його
роблять» and «де його виробляють» simultaneously, and it is correct in isolation.

The final clause does specific work. «Столиця ліжникарства» is a phrase that appears in
independent sources about Яворів, so a retrieval system encountering it in this passage can
corroborate it elsewhere — which is the property that turns a sentence from a claim into a
citable fact. Note also what it does *not* say: it attributes the reputation to the village, not
to the business. That distinction is the §30.3 heritage constraint applied at sentence level.

---

## 30.6 Content structures that extract well

Grade B throughout: these structures extract reliably in practice, and no platform documents a
preference.

| Structure | Shape | Where used |
|---|---|---|
| **Definition block** | Term, then a one-sentence definition in the first sentence, then 2–3 sentences of elaboration | Opening of every craft-term article; category intro; PDP glossary terms |
| **Comparison table** | 3–6 rows, one attribute per row, values in the same unit | «Ліжник vs плед», «Гуня vs накидка», «Ровниця vs пряжа», wool vs synthetic |
| **Step list** | Ordered `<ol>`, one action per item, each starting with a verb | Production stages; care instructions; how to measure for a size |
| **FAQ pair** | Question as an `h3` phrased exactly as a person would ask it; answer self-contained in ≤90 words | PDP, category, care guide, wholesale |
| **Specification table** | Attribute, value, unit — from `ProductAttributeValue`, never hand-typed | PDP, above the description |
| **Numbered fact strip** | Standalone claims with units | Production page, about page, wholesale capability block |
| **Visit block** | A self-contained paragraph naming the address, what is on the premises, and that goods can be bought on site — no pronouns, no dependency on surrounding text | Contact page, production page, about page. Added after [00-client-decisions-3.md](00-client-decisions-3.md) F2 |

**On the visit block.** «Де купити ліжник» is a question an assistant answers by naming places, and
a place answer requires a passage that states the place, the goods and the fact of retail in one
extractable unit. A contact page that lists an address in a footer and sells in a separate
paragraph provides no such passage — the chunk containing the address does not contain the fact
that you can buy there. The canonical form:

> Магазин і виробництво «Вівчарик» розташовані за однією адресою: вул. Петруші, с. Яворів,
> Косівський район, Івано-Франківська область. У магазині можна подивитися і купити ліжники,
> ковдри, гуні, пряжу та ровницю власного виготовлення. Графік гнучкий — телефонуйте перед
> візитом: +380679973450.

Every fact an assistant needs to answer «де купити ліжник на Косівщині» is inside one paragraph,
and the paragraph survives chunking. This is §30.5 rule 1 applied to a retail fact rather than a
manufacturing one, and it is the single highest-value passage F2 makes available.

Rules that make them work:

- **Real semantic HTML.** `<table>` with `<th scope>`, `<ol>`, `<dl>`. A CSS grid of `<div>`s
  reads as undifferentiated text after markup stripping.
- **The question is the heading.** «Чи колеться вовна?» as an `h3`, not «Про комфорт».
- **Comparison tables use consistent units down a column.** A column mixing "тепло" and "1,900 г"
  is not comparable and will be extracted as noise.
- **Every table has a caption or a preceding sentence stating what is being compared.** A table
  extracted without its subject is unusable.
- **Structure and markup agree.** An FAQ block emits `FAQPage`
  ([29-seo-architecture.md](29-seo-architecture.md) §29.6); a spec table emits
  `additionalProperty`. Visible content and markup never diverge — that is both a Google policy
  requirement and the thing that makes the markup trustworthy to any other consumer.

---

## 30.7 The semantic product description template

A buyer asking an assistant about a product asks roughly eight questions. The PDP answers all
eight in a fixed order, so extraction succeeds regardless of which one was asked.

| # | Buyer's question | Section | Source |
|---|---|---|---|
| 1 | What is this, exactly? | Opening paragraph — definition sentence | `ProductTranslation.description` |
| 2 | What is it made of? | Spec table, first rows | `ProductAttributeValue` |
| 3 | Who made it, and where? | Origin block | `woolOrigin`, `productionStage[]`, `origin`, `partnerRegion`. Never `partnerName` — E7 |
| 4 | Will it itch / shed / smell? | Micron + plain-language band; tanning method for hide goods | `woolMicron`, attributes |
| 5 | What size, and how heavy? | Size table + `weightGrams` | `ProductVariant` |
| 6 | How do I care for it? | Care block + link to the guide | Care attribute → article |
| 7 | What does it cost, and what does delivery cost? | Price range + delivery block | `priceMin/MaxMinor`, carrier table |
| 8 | Can I return it? | Trust row — 14 days, buyer pays return unless defective | `Setting` |

### The opening paragraph template

```
{Product name} — це {product-type definition in one clause}.
{Material and one distinguishing construction fact, with a number}.
{Origin sentence — scoped to origin}.
```

Own manufacture:

> Ліжник «Мозаїка» — це гуцульське вовняне покривало ручного ткання. Виготовлений зі 100% вівчої
> вовни тониною 27–30 мкм, заваляний у воді та з піднятим вручну ворсом, вага 1,9 кг у розмірі
> 150×200 см. Ми тчемо його на власному виробництві у селі Яворів Косівського району.

Partner manufacture — **without naming the partner**
([00-client-decisions-2.md](00-client-decisions-2.md) E7):

> Ліжник «Черемош» — це гуцульське вовняне покривало ручного ткання зі 100% вівчої вовни,
> вага 1,8 кг у розмірі 150×200 см. Виготовлений майстром на Косівщині, не на нашому
> виробництві. Ми відібрали його за щільністю полотна та якістю вовни.

The second paragraph is weaker than it would be with a name, and there is no point pretending
otherwise: a named workshop is a resolvable entity and «майстром на Косівщині» is not. But it is
still a *different true claim* with its own credibility, and the two sentences that matter most
survive intact — the explicit statement that this was **not** made in-house, and the statement of
what the selection criteria were.

The construction to get right is the disclaimer's position. «Не на нашому виробництві» sits in the
same sentence as the origin, not in a later one, because §30.5 rule 1 means a chunk containing the
first sentence and not the second would otherwise be extracted as an own-manufacture claim. **The
scoping has to survive chunking**, and the only way to guarantee that is to put the scope in the
same sentence as the claim.

Where `partnerRegion` is unknown, the sentence becomes «Виготовлений іншим виробником, не на
нашому виробництві» — shorter and less useful, but not false. Nothing invents a region.

**F3 does not soften the partner paragraph.** [00-client-decisions-3.md](00-client-decisions-3.md)
F3 confirms partner goods are sold under the Вівчарик brand, which means the brand name now appears
on the page, in the product title, and in the `brand` property of a product whose origin sentence
says it was made elsewhere. The instinct is to reconcile those by softening the origin sentence.
**Do the opposite.** The origin sentence stays exactly as written, «не на нашому виробництві»
stays in the same sentence as the origin claim, and the «Відібрано Вівчариком» mark stays at equal
visual weight to «Власне виробництво» ([00-client-decisions-3.md](00-client-decisions-3.md) F3,
[01-brand-strategy.md](01-brand-strategy.md) §1.7b).

The reasoning is the same one that governs everything in this document. A page where the brand name
sits beside an explicit "we did not make this" is a page whose claims an extractor can trust,
because the page is visibly willing to state something against its own interest. A page where the
brand name sits beside a vague origin sentence is a page whose *own-manufacture* claims become
unverifiable too — the reader and the retrieval system both have to assume every claim is
marketing. Branding the partner goods raises the value of the disclosure rather than lowering it,
and a customer who discovers the distinction themselves rather than being told is the outcome that
costs the most.

Banned in both: «ексклюзивний», «елітний», «неперевершений», «100% натуральний» without evidence,
«еко» standalone, «автентичний» in a headline ([01-brand-strategy.md](01-brand-strategy.md)
§1.5). None of them is extractable, all of them are unfalsifiable, and unfalsifiable claims are
exactly what an assistant declines to repeat.

---

## 30.8 `llms.txt` — an honest assessment

`llms.txt` is a community proposal: a markdown file at `/llms.txt` listing a site's key pages with
one-line descriptions, intended as a curated map for language models.

**Status, stated plainly:**

- **Google has said it does not use it.** It is not a Search signal.
- No major assistant vendor has documented consuming it.
- There is no verified evidence of it affecting retrieval or citation for anyone.
- It is, in effect, a sitemap for a consumer that has not agreed to read it.

**Decision: ship it, budget nothing against it.** Grade C. It costs one generated file and roughly
an hour, it is trivially derived from data the site already has, and the downside is zero. It
appears in no roadmap phase as a deliverable with a success metric, because it has none.

```
# {{BRAND_NAME}}

> Родинне карпатське виробництво вовняних виробів у селі Яворів, Косівський район,
> Івано-Франківська область — селі, яке називають столицею ліжникарства. Понад 30 років
> переробляємо вовну: миття, чесання, прядіння, ткання, пошиття. Виготовляємо ліжники, вовняні
> ковдри, гуні, камізельки, шкарпетки, капці, пояси, накидки, пряжу, ровницю та вовну для
> рукоділля. Також продаємо відібрані вироби інших карпатських майстрів, які позначені окремо.

## Виробництво
- [Повний цикл виробництва](https://{{DOMAIN}}/vyrobnytstvo/): сім етапів від немитої вовни до готового виробу, з фотографіями цеху.
- [Про нас](https://{{DOMAIN}}/pro-nas/): історія родинного виробництва, люди, обладнання.

## Каталог
- [Ліжники](https://{{DOMAIN}}/katalog/vovna/lizhnyky/): вовняні покривала ручного ткання.
- [Вовняна пряжа та ровниця](https://{{DOMAIN}}/katalog/vovna/priazha/): для ручного в'язання і ткання.

## Знання
- [Що таке ліжник](https://{{DOMAIN}}/blog/shcho-take-lizhnyk/): визначення, технологія валяння, відмінність від пледа.
- [Яворів і ліжникарство](https://{{DOMAIN}}/blog/yavoriv-lizhnykarstvo/): чому це село називають столицею ліжникарства.
- [Догляд за вовняними виробами](https://{{DOMAIN}}/dohliad/): прання, сушіння, зберігання, міль.

## Контакти
- [Контакти та адреса](https://{{DOMAIN}}/kontakty/): вул. Петруші, с. Яворів, Косівський район, 78644; телефони. Графік гнучкий — телефонуйте перед візитом.
```

Generated from the same route registry that produces the sitemap, per locale (`/llms.txt` for
`uk`, `/en/llms.txt` and so on), so it cannot go stale independently. An `llms-full.txt`
containing concatenated `bodyPlain` for the editorial hubs (§30.4) is a further grade-C option;
it is not built at launch.

---

## 30.9 Crawler access policy

The decision is commercial, not technical, and the two sides are genuinely in tension. Both are
stated before the recommendation.

### The crawlers

| Agent | Operator | Purpose | Blocked by |
|---|---|---|---|
| `GPTBot` | OpenAI | Training | `robots.txt` |
| `OAI-SearchBot` | OpenAI | Search index for ChatGPT search | `robots.txt` |
| `ChatGPT-User` | OpenAI | Live fetch on a user's request | `robots.txt` |
| `ClaudeBot` | Anthropic | Training | `robots.txt` |
| `Claude-Web` / `Claude-User` | Anthropic | Live fetch on a user's request | `robots.txt` |
| `PerplexityBot` | Perplexity | Index + live citation | `robots.txt` |
| `Google-Extended` | Google | Gemini training / grounding. **Does not affect Search ranking or indexing** | `robots.txt` |
| `CCBot` | Common Crawl | Open corpus, ingested by many models | `robots.txt` |
| `Bingbot` | Microsoft | Search index — and therefore Copilot | Never block |
| `Applebot-Extended` | Apple | Apple Intelligence training | `robots.txt` |

Note the asymmetry that matters: `Googlebot` cannot be disallowed without leaving Search, but
`Google-Extended` can be disallowed *without any effect on Search*. That makes it the only
crawler on the list with a genuinely free opt-out, which is precisely why it is the one most
often blocked reflexively.

### The case for blocking

1. **The content is the asset.** Photography, first-hand craft description and provenance writing
   are what [01-brand-strategy.md](01-brand-strategy.md) §1.8 rests on. Training crawlers consume
   it and return nothing attributable.
2. **Answer-without-click.** An assistant that can answer «що таке ліжник» from absorbed knowledge
   removes the need to visit the page that taught it.
3. **Competitors benefit.** Copy absorbed into a general model becomes available to anyone
   generating product descriptions — including the resellers this brand is differentiating against.
4. **No compensation, no attribution.** Training use gives neither a link nor a mention.

### The case for allowing

1. **A blocked crawler cannot cite you.** This is the decisive asymmetry. Blocking removes the
   upside entirely while the downside — being described inaccurately by a model that learned about
   Carpathian wool from resellers — persists.
2. **Cold start (D2).** A domain with zero authority needs every discovery surface. Assistants are
   a discovery surface that does not price on domain age, which is the one ranking factor this
   business cannot buy.
3. **Live-retrieval agents are the ones that send traffic**, and they are the ones with the
   clearest citation behaviour. Blocking them is blocking referrals.
4. **Blocking is not protection.** Content remains scrapeable by agents that ignore `robots.txt`.
   The file constrains the well-behaved and nobody else.
5. **The moat is physical.** The differentiator is a factory, a village, named people and
   photographs of real machines — not sentences. A model can reproduce a description of fulling.
   It cannot reproduce being the manufacturer.

### Recommendation

**Allow all retrieval and search agents. Allow training agents.** Keep the option to narrow later.

```
# --- AI search and retrieval: allowed ---
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-User
Allow: /

# --- AI training: allowed, reviewed quarterly ---
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# --- Commercial and checkout paths: closed to everything ---
User-agent: *
Disallow: /kosh/
Disallow: /oformlennia/
Disallow: /kabinet/
Disallow: /admin/
Disallow: /api/
```

The recommendation would flip if the business's primary asset became written content that is
licensable on its own — it is not, and is unlikely to become so. **The decision is the client's**,
it is reversible in one commit, and it is reviewed quarterly against the server-log analysis in
§30.13. If AI crawlers turn out to consume meaningful bandwidth while sending no measurable
referrals over two quarters, training agents are the first to be withdrawn; retrieval agents are
withdrawn last or never.

One non-negotiable regardless: **`Terms of Use` and an image licence page are published**
([29-seo-architecture.md](29-seo-architecture.md) §29.11 `license`), stating that photography is
not licensed for redistribution. It does not stop a crawler, but it is the prerequisite for any
later claim.

---

## 30.10 Zero-click, and converting a citation into a visit

An AI summary that fully answers the question removes the click. This is real, it is not
reversible, and pretending otherwise produces a content plan that quietly fails.

### What to accept

Purely informational queries will increasingly be answered without a visit — «що таке ровниця»,
«при якій температурі прати вовну». Chasing those with more content is chasing a shrinking
return. Their value is now **entity association** (§30.3), not traffic: being the source the
answer was built from keeps the brand inside the answer even when nobody clicks.

### What converts anyway

A manufacturer has an advantage a publisher does not: the thing being sold is physical, and no
summary substitutes for it.

| Lever | Mechanism | Grade |
|---|---|---|
| **The brand name inside the answer** | An answer citing «фабрика у Яворові на Косівщині» produces a later branded search, which converts far better than the click that was lost | B |
| **Content that cannot be summarised** | Photographs of the actual workshop, video of the loom, a named weaver. A summary can state that the factory exists; it cannot show it. [01-brand-strategy.md](01-brand-strategy.md) §1.8 ranks these 1–3 | A |
| **Transactional intent** | Nobody buys a 9,800 UAH ліжник from a summary. Price, variant, delivery and return questions all require the page | A |
| **Local intent** | «Де купити ліжник у Косові», «де купити ліжник у Яворові» resolve to a map entry and a direction request, not a summary. [29-seo-architecture.md](29-seo-architecture.md) §29.16 is the answer, and Яворів is a place a visitor can actually be standing in | A |
| **Specificity the summary must attribute** | A claim with a number and a place invites attribution; a generic claim gets absorbed unattributed | B |
| **Depth beyond the answer** | The page a summary cites should contain the next three questions too — size selection, care, price | B |

**The content-mix consequence.** Purely informational articles are written to build the entity and
feed retrieval, and are not measured on clicks. Commercial and comparison content — «як обрати
розмір ліжника», «гуня чи накидка», «ровниця чи пряжа для мого проєкту» — is where the click
still happens, because the answer depends on the reader's situation and ends in a product choice.
The editorial calendar weights the second more heavily than a pure-SEO plan would.

---

## 30.11 Brand mentions and off-site signals

Retrieval draws on the whole web, not just the site. An assistant asked for a recommendation
synthesises from listings, directories, forums, press and reviews — most of which the business
does not control.

Unlinked brand mentions appear to matter here in a way they do not for classical link-based
ranking: a model summarising «українські виробники ліжників» is reading text, and a name that
appears in five independent texts is a stronger candidate than one that appears in one. Grade B —
the mechanism is sound, the required volume is unknown.

### The starting position: effectively zero

This needs stating plainly rather than being left as an implication of §30.3's table.
[00-client-decisions-2.md](00-client-decisions-2.md) E3 establishes that **the owners run no
social accounts of any kind**, and D2 establishes that the brand is new. The consequence is that
outside the Google Business Profile, **the business does not currently appear anywhere on the web
under this name.** There is no Instagram bio, no Facebook page, no directory listing, no press
mention, no forum post, no Wikidata item.

For classical SEO that is a known, quantified handicap — it is the cold start
([29-seo-architecture.md](29-seo-architecture.md) §29.15) and the forecast already accounts for
it. For AI retrieval it is a **distinct and additional constraint**, and it works differently:

1. **Citability depends on corroboration.** A retrieval system building an answer about Ukrainian
   lizhnyk makers has to decide which candidates to name. A business whose every statement about
   itself originates from its own domain is a single-source entity. A business named in a museum
   listing, a regional article and a craft directory is corroborated. Corroboration is cheap to
   check and expensive to fake, which is precisely why it carries weight.
2. **Training-corpus presence lags by years.** §30.2 mechanism 2 means anything absorbed into
   model weights was crawled long before the answer is generated. A brand that does not exist
   off-site today is absent from every model trained this year and next, regardless of how good
   the on-site content is.
3. **It cannot be fixed by writing more pages.** This is the one constraint in this document that
   on-site work does not address. Adding a tenth excellent article changes nothing about how many
   independent sources name the business.

**The realistic assessment: AI-search citability is materially constrained for at least the first
two quarters, and the constraint is off-site, not on-site.** The §30.13 audit will reflect that,
and the reporting should say so rather than attributing a flat result to the content.

The mitigation is the table below. Two items on it changed in round 3: the single cheapest is still
the one that is only a recommendation, and the **fastest** is now a consequence of
[00-client-decisions-3.md](00-client-decisions-3.md) F2 — a shop with people in it is a source of
independent, dated, third-party assertions that requires no outreach, no budget and no waiting for
a publication to be interested.

| Signal | Action | Priority | Exists |
|---|---|---|---|
| Google Business Profile + reviews | [29-seo-architecture.md](29-seo-architecture.md) §29.16. Also the most-ingested structured description of the business, and currently the only one. F2's retail categories widen the query space it can be retrieved for | Highest | **Yes** |
| **Reviews from shop visitors** | [00-client-decisions-3.md](00-client-decisions-3.md) F2 makes this the fastest corroboration route on the list. A visitor standing in the shop can be asked in person, and a Google review written by someone who was physically there is an independent, dated, third-party assertion that the business exists and makes what it claims. Nothing else on this table can be obtained this week | Highest | **Available now** |
| **Музей ліжникарства and the ліжникарський пленер** (Яворів) | The most topically precise mentions obtainable. A craft museum in the same village listing a working workshop is a corroboration no competitor outside Яворів can match. Approach in person — this is a client task, not an outreach campaign | Highest | No |
| Regional press, craft and tourism publications | Pitch the real story: a family operation weaving in the village that lizhnyk weaving is named for, over 30 years, with photographs. This is a genuine story, not a placement | High | No |
| **Instagram** | [00-client-decisions-2.md](00-client-decisions-2.md) E3 records this as a recommendation. From this document's perspective it is the cheapest available fix for the corroboration problem: a public, crawlable, dated record that the business exists and makes what it says it makes | High | **No — recommended** |
| Ukrainian craft marketplaces and directories | Listings with consistent NAP and a link | High | No |
| Wikipedia / Wikidata on the *craft* and *the village* | Improving the articles on ліжник, ліжникарство, Яворів and Hutsul weaving — accurately, with sources, without self-promotion — strengthens the entity chain the brand sits in. Editing to promote the business is against policy and will be reverted | Medium | No |
| Reddit, forums, Ukrainian craft communities | Participate as the manufacturer, disclosed. Answering a technical wool question with real expertise is the highest-quality mention available. Undisclosed promotion is both a ban and a trust risk | Medium | No |
| YouTube | Mirror the production films ([29-seo-architecture.md](29-seo-architecture.md) §29.12). Heavily indexed, heavily cited | Medium | No |
| Wholesale partners' sites | A supplier credit and link from each B2B customer | Medium | No |

**Removed from this list: reciprocal mentions with partner manufacturers.** E7 forbids naming
them, which forecloses the option in both directions.

The one thing not on this list is paid link building. On a domain with zero history it is the
fastest available way to acquire a penalty, and the citations above are slower but real.

---

## 30.12 The multilingual dimension

The four locales do not retrieve alike, and treating them as one market with four translations
would misallocate the entire content budget.

**`en`, `pl` and `de` are now transactional, not informational**
([00-client-decisions-2.md](00-client-decisions-2.md) E11): the client accepts international
orders. That raises the stakes on every claim in those locales, because a claim on a page that
takes money is subject to consumer law rather than only to taste. The legal consequences are in
[32-security-architecture.md](32-security-architecture.md) §32.15; the content consequences are
below.

| Locale | Query behaviour | Retrieval reality | Content strategy |
|---|---|---|---|
| `uk` | Craft-specific terms with real volume and almost no competent content: `ліжник`, `гуня`, `ровниця`, `вовна для рукоділля` | Ukrainian-language training data is comparatively thin, and thin corpora are where a well-written source has the most influence. The single largest opportunity in this document | Full depth. Every cluster, every definition, every FAQ. `uk` is the source of truth |
| `en` | Descriptive, not term-based: "Ukrainian wool blanket", "Carpathian sheep wool", "hand-woven wool throw" | Dense, competitive corpus. Global craft and interiors content is saturated | Fewer, better pages. Lead with provenance and the craft explanation, which is what is scarce in English |
| `pl` | Closest market culturally and logistically. Terms partly overlap (`koc wełniany`, `runo`), but `ліжник` has no Polish equivalent | Moderate corpus. Realistic competition | Mid depth. Explain the Carpathian craft to a neighbouring audience that already recognises it |
| `de` | High-intent, specification-driven: `Schurwolle`, `Wolldecke`, `Mikron`, `kbT` | Dense, quality-sensitive corpus. German buyers verify claims | Fewest pages, most precise. Specification and traceability first |

### Rules that follow

1. **Craft terms are transliterated and then explained, never translated away.** `Lizhnyk
   (Ukrainian wool blanket)`, `Hunia (Carpathian wool coat)`. Translating ліжник to "blanket"
   destroys the distinguishing entity and puts the page into the most competitive term space
   available. Keeping the term creates an entity nobody else owns.
   **The place name travels untranslated on the same principle.** `Yavoriv`, `Jaworiw`,
   `Jaworów` — transliterated per locale convention, then explained once: "Yavoriv, the Carpathian
   village at the centre of Hutsul lizhnyk weaving". The explanation is what makes the place
   resolvable to a reader and a retrieval system that have never heard of it; the untranslated
   name is what keeps it a single entity across four locales instead of four descriptions of a
   generic mountain village.
2. **Translation is not localisation.** Each locale's FAQ answers *that market's* questions.
   German buyers ask about mulesing, `kbT` certification and washing temperature; Ukrainian buyers
   ask about моль, усадка and whether it will itch. A translated Ukrainian FAQ answers a German
   buyer's questions only by accident.
3. **The `de` and `pl` locales launch wool-only.** This is now a recommendation on record rather
   than an open question ([00-client-decisions-2.md](00-client-decisions-2.md) E11): sheepskin and
   leather goods entering the EU face species-declaration requirements and, for some materials,
   CITES documentation, while wool faces neither. The German market's ethical sensitivity to fur,
   which wool does not attract, points the same way. The practical content consequence is that the
   German and Polish catalogues are **a subset**, not a translation — the hide categories are not
   merely untranslated, they are not offered — and the `de`/`pl` sitemaps, hreflang sets and
   `llms.txt` files reflect a smaller catalogue by design rather than by omission. If hide
   categories are enabled later, the ethical framing must lead and it must be **true and
   specific**, because a vague ethical claim in the German market is worse than no claim.
4. **`de` and `pl` carry the strictest legal exposure, and they now carry it on transactional
   pages.** Every claim in those locales is subject to EU consumer law, and E11 makes those pages
   the point of sale rather than a brochure. "Понад 30 років" is defensible as a statement about
   manufacturing continuity (D1); any implication of certification, award or documented
   anniversary is not, and none exists. The heritage reference (§30.3) is in the same category and
   is subject to the same verification gate — an unverifiable heritage claim on a page that takes
   a German customer's money is a materially worse exposure than the same sentence on a Ukrainian
   informational page.
5. **Untranslated pages are `noindex` and are excluded from hreflang**
   ([29-seo-architecture.md](29-seo-architecture.md) §29.3 rule 6). A machine-translated German
   page retrieved and quoted by an assistant is a brand liability, not a reach gain.
6. **Quality over coverage.** Four locales × sixteen categories × full editorial depth is not
   fundable. The honest sequencing is `uk` complete, then `pl` and `de` commercially,
   then `en`. Attempting all four at equal depth produces four mediocre sites.

---

## 30.13 Measurement, and its honest limits

**Attribution here is genuinely poor, and no tooling fixes it.** Anyone presenting a confident
"AI search traffic" number is presenting an estimate dressed as a measurement. The approach below
is a set of weak signals read together.

### What can be measured

| Signal | Method | Confidence |
|---|---|---|
| **AI crawler access** | Server access logs filtered by user-agent: request volume, paths, status codes, bytes. The only hard data in this section | High |
| **Referral traffic** | `chat.openai.com`, `perplexity.ai`, `claude.ai`, `copilot.microsoft.com`, `gemini.google.com` as referrers in [31-analytics-architecture.md](31-analytics-architecture.md). Volume is small and referrers are often stripped | Medium — a floor, never a total |
| **Branded search volume** | Search Console brand-query impressions over time. A rise without a corresponding campaign is consistent with assistant exposure | Low, directional |
| **Direct traffic to deep URLs** | Someone landing directly on `/blog/shcho-take-lizhnyk/` with no referrer did not type it | Low, directional |
| **Manual citation audits** | A fixed set of ~20 questions per locale, asked quarterly across ChatGPT, Perplexity, Gemini and Copilot, recording whether the brand appears and whether the facts are correct | Low precision, **high diagnostic value** |
| **Google Search Console AI-surface data** | Reported inside existing Search totals; not separable at the time of writing | Unavailable |

### The quarterly citation audit

The single most useful practice in this section, despite having no statistical validity. Twenty
fixed questions per locale, recorded in a spreadsheet, asked the same way each quarter:

- «Що таке ліжник?» / «What is a lizhnyk?»
- «Де купити справжній карпатський ліжник?»
- «Чим ровниця відрізняється від пряжі?»
- «Який виробник вовняних виробів є в Косівському районі?»
- «Гуня — це що?»
- «Wo kann ich echte Karpaten-Wolldecken kaufen?»

**Place-entity questions, added after round 2.** These test the §30.3 strategy directly and are
the ones most likely to move first, because the corpus already contains material about the village:

- «Що таке ліжникарство і де воно збереглося?»
- «Чому Яворів називають столицею ліжникарства?»
- «Хто тче ліжники в Яворові?»
- «Where are Hutsul lizhnyk blankets actually made?»

Recorded per run: is the brand mentioned; is it cited with a link; **are the stated facts
correct**; which competitors appear; which source was cited instead. The third question is the
most valuable output — a model confidently stating something false about ліжники, attributing a
partner's product to this manufacturer, or stating that Вівчарик holds a heritage designation, is
a content gap with a known fix.

One expectation to set before the first run: **a flat result in the first two quarters is the
predicted outcome, and it is an off-site problem** (§30.11), not evidence that the content is
wrong. Reading it as a content failure would trigger exactly the wrong response — more pages on a
domain nobody else references.

### Reporting rule

AI-search performance is reported as **a qualitative section with the audit results and the crawler
log summary**, never as a traffic number in the KPI table. Fabricating a metric to fill a slot in a
dashboard is how a channel gets over-invested. The honest statement is: crawler access is
confirmed and measurable, referral traffic is small and under-counted, citation presence is
sampled quarterly, and causal attribution to revenue is not currently possible.

### What success looks like at 12 months

1. All major retrieval agents fetch the site successfully and regularly, confirmed in logs.
2. The quarterly audit shows the brand appearing for at least the craft-term questions in `uk`.
3. Facts stated about ліжник, ліжникарство, гуня and ровниця by assistants are correct, and where
   they are traceable, they are traceable to this site.
4. **The business is named in at least three independent off-site sources** — realistically the
   Google Business Profile plus two of: a museum or plein-air listing, a regional article, a craft
   directory (§30.11). This is the leading indicator for everything else on this list, and it is
   the one that is entirely outside the build.
5. No assistant attributes partner-manufactured goods to own manufacture, or vice versa (D3/E7),
   and no assistant states that the business holds a heritage designation (§30.3).
6. Branded search volume is rising faster than total organic — the signature of awareness built
   somewhere other than the click.

None of the six is a revenue number. That is the honest shape of this channel at this stage, and
[31-analytics-architecture.md](31-analytics-architecture.md) §31.11 says the same thing about
attribution generally.
