# 16 — Footer Specification

> **Round 11 — art direction:** the footer becomes the illustrated «Вечір у горах» meadow (variant Б) above the dark footer body — [00-client-decisions-11.md](00-client-decisions-11.md), «Art direction».

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Dark green** (`forest-900`). Contents: information (delivery, returns, FAQ), contacts, messengers, payment icons, plus a mandatory legal row (offer, privacy, cookie settings, ФОП and `{{LEGAL_ID}}`, Impressum on `de`). **No category links** (part 7).

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Newsletter sign-up removed** (part 5 answer 20).
> - **Messenger buttons: Viber, Telegram, WhatsApp**, to Іван's number +380679973450.
> - The mascot no longer appears in the footer; the simplified ram mark does.
> - Workshop tours: a mention with the phone number, no separate page.


The footer is the most under-designed component on most commercial sites and the one that
carries the most legal risk. It is also, on a cold-start domain, one of the few internal-linking
assets the site owns from day one. This specification treats it as a designed surface with jobs,
constraints and exclusions, not as a place where links go when nobody knows where else to put
them.

**Authority note.** Written against [00-client-decisions.md](00-client-decisions.md) and revised
against [00-client-decisions-2.md](00-client-decisions-2.md), which is now the highest-authority
document in the blueprint. D2 — new brand, new domain, no migration — changes this document
materially and the changes are flagged where they occur. Round 2 changes four things in the
footer specifically: the NAP is resolved and is **Яворів, not Вербовець** (E2), opening hours are
**variable and must not be published** (E3), the social row is **deleted outright** because no
accounts exist (E3), and the seller of record is named — **ФОП Гондурак Любов Юріївна** (E1).

**Round 3 changes five more**, and [00-client-decisions-3.md](00-client-decisions-3.md) now
outranks both earlier rounds:

| Round-3 ruling | Footer consequence |
|---|---|
| F2 — the Яворів site is a **retail shop as well as a factory** | The NAP block stops being a registered address and becomes a visitable place. §16.3, §16.5, §16.6 |
| F5 — an interim contact address exists, `gif19601@gmail.com`, and it has **two separate problems** | `{{BRANDED_EMAIL}}` is now an upgrade rather than a creation, and the technical problem is the more serious of the two. §16.5 |
| F4 — the **buyer pays shipping and all customs**; international is quoted per order | The delivery band and the delivery page state DAP terms; free shipping is `uk`-only. §16.4, §16.6 |
| F1 — `{{LEGAL_ID}}` **exists and is pending delivery** | It stops being a general blocker. The Impressum link stays gated on it; nothing else in the footer waits. §16.10, §16.14 |
| F6 — the tagline stays **«в Карпатах»** | The brand column's 30-year line reverts. Яворів stays in the NAP, where it is required and where the reader has context. §16.3, §16.10 |

The pattern behind F6, which this document applies in both directions on the same screen:
**«Карпати» to be understood, «Яворів» to be believed.** The brand column's opening sentence is
read by someone who may have landed on a deep page and knows nothing; the contacts column is read
by someone who has decided to find out where this is. Different jobs, different words, one
footer.

**Rounds 4 and 5 change four more things**, and
[00-client-decisions-5.md](00-client-decisions-5.md) now outranks every document above:

| Round-4/5 ruling | Footer consequence |
|---|---|
| G1 — **Іван is the primary phone, Любов the fallback** | The NAP already renders both, Іван first. What changes is that the ordering is now a **ruling rather than an editorial choice**, and the footer is the surface where the "who trades / who answers" split is visible in one screen: Іван at the top of the contacts column, ФОП Гондурак Любов Юріївна on the legal line. §16.5, §16.10 |
| G4 — **a business card already ships in every parcel** | The review page acquires a second entry point that is not a link on this site at all: a short URL plus QR printed on the card. `/vidhuky/` stops being a page nobody navigates to and becomes a destination with offline traffic. §16.4c |
| H1.2 — COD is **«наложений платіж з оглядом», Ukraine only** | The payment band's third mark is renamed and **locale-gated**. «Готівка при отриманні» was both the wrong name and an international promise the checkout cannot keep. §16.6 |
| H1.1, H1.3, H2, H3c — prepayment for made-to-order, the return-shipping deposit, quote SLA, custom-size pricing | All four land on `/oplata-i-dostavka/`, whose required statements table grows accordingly. The footer links to that page and states none of it itself. §16.4 |

One rule governs every item in that table: **the footer links to terms, it never states them.** A
sitewide band that says «наложений платіж» to a German visitor, or a legal line that implies the
deposit applies everywhere, is worse than silence — and this document's existing discipline about
the delivery band carrying no figures (§16.6) is the same discipline applied to a harder case.

## 16.1 The footer's jobs

Four jobs, in the order they justify space.

| # | Job | What it means concretely |
|---|---|---|
| 1 | **Navigation of last resort** | The visitor has scrolled to the bottom because the page did not answer them. The footer must contain every destination the header omitted: policies, care guide, wholesale, contact, blog, the full category list |
| 2 | **Trust, stated plainly** | Real address, real phones, an honest statement of availability, a named legal entity, unhedged policy statements. [01-brand-strategy.md](01-brand-strategy.md) §1.8 ranks policy clarity sixth out of seven trust signals — above badges, which rank last and which this footer does not use at all. Note that «real hours» has been replaced by «honest availability»: per [00-client-decisions-2.md](00-client-decisions-2.md) E3 the hours genuinely vary, and printing a schedule the workshop does not keep is a trust *liability* dressed as a trust signal |
| 3 | **SEO internal linking** | A new domain has no backlinks and no crawl history (D2, consequence 2). Sitewide footer links are one of the only signals under the site's own control for distributing crawl budget to twelve wool categories that nothing else links to |
| 4 | **Legal compliance** | Ukrainian distance-selling disclosure, plus Polish and German obligations that are materially stricter and carry real penalties. §16.10 |

Job 3 is doing more work here than on a typical build and is the reason the category column lists
every category rather than a curated subset. Job 4 is the reason the legal line is not optional.

## 16.2 What must NOT go in the footer

Stated first, because footers fail by accretion. Every item below has been proposed on some
project and is banned on this one.

| Excluded | Reason |
|---|---|
| **Certification marks, trust seals, "guaranteed quality" badges** | [00-client-decisions.md](00-client-decisions.md) D1 is explicit: **no certificates exist.** A seal-shaped graphic implies accreditation the business does not hold. This is the single highest-risk item on the page |
| **"Заснована 1992 року" or any founding-date claim** | D1 attaches the 30-year claim to the *manufacturing*, never to a legal entity. The approved copy is «Понад 30 років виробляємо…». A founding year next to a ФОП registration line is a contradiction a regulator can read |
| Any Prom.ua or BOTEY reference | D2: the audited site is a separate business belonging to the client's wife and must not appear |
| A second full copy of the primary navigation | Duplicate sitewide link sets dilute rather than distribute. The footer complements the header; it does not mirror it |
| Keyword-stuffed location or product link lists | «ліжник Київ · ліжник Львів · ліжник Одеса» is a spam signal, and on a domain with zero authority it is a risk with no upside |
| Cookie consent | It is a dialog, not footer content |
| Live chat widget | It is a floating element with its own z-index and its own accessibility contract |
| "As seen in" / press logos | None exist. When they do, they belong on the about page with a link to the source |
| Animated mascot behaviours | The footer mark is static. §16.12 |
| **Social media icons of any kind** | [00-client-decisions-2.md](00-client-decisions-2.md) E3: the owners run no accounts. A row of grey glyphs pointing nowhere, or worse pointing at `@fabryka_shkur`, is the clearest possible signal of an abandoned site. §16.7 |
| **Fixed opening hours** | E3: hours vary day to day. A printed schedule that is wrong twice a week produces "permanently closed" user reports on the Google Business Profile, which is the launch's primary channel (E4). §16.5 |
| **Login, registration or account links** | E12: guest checkout is permanent. There is no account to link to, and an «Увійти» link that leads to a 404 or to a form that creates nothing is worse than its absence. Order tracking replaces it — §16.4b |
| Partner-goods promotion | D3 rule 5 confines partner goods to catalogue and search. A footer rail promoting them is a brand surface promoting them |
| Autoplaying anything | Including a muted looping video of the factory, which has been proposed and is refused: the footer is below the fold on every page and would burn bandwidth no visitor asked for |
| **A QR code to the review page** | The QR belongs on the printed business card ([00-client-decisions-4.md](00-client-decisions-4.md) G4, §16.4c). Rendering one on a screen the visitor is already holding asks them to photograph a page they could tap. It is the standard misapplication of the pattern |
| **A workshop-visit booking widget or calendar** | G3 is explicit: a calendar implies capacity that does not exist and creates no-shows nobody chases. Tours are arranged by phone, with Іван, in advance. This is banned at every breakpoint and on every page, not only here |
| **The return-shipping deposit, in any summarised form** | [00-client-decisions-5.md](00-client-decisions-5.md) H1.3 requires a worked example in three real numbers. A footer cannot know an order's figures, and the compressed version — a percentage, or the word «депозит» alone — converts a fair rule into a suspected hidden fee. §16.6 |

## 16.3 Column structure by breakpoint

### `lg` and above — five columns on the 12-column grid

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                    │
│  ⌇                    ВОВНА            ВИРОБНИЦТВО     ПОКУПЦЮ        КОНТАКТИ     │
│  ВІВЧАРИК             Ліжники          Про нас         Оплата і       вул. Петруші │
│                       Ковдри вовняні   Виробництво     доставка       с. Яворів    │
│  Понад 30 років       Подушки          Наші майстри    Догляд за      Косівський   │
│  виробляємо           Накидки          Блог            виробами       район        │
│  натуральні           Гуні             Фотогалерея     Умови          Івано-Фр. обл│
│  вовняні вироби       Камізельки                       повернення     78644        │
│  в Карпатах.          Шкарпетки        ОПТ             Договір                     │
│                       Капці            Оптовим         оферти         Магазин і    │
│                       Пояси            покупцям        Політика       виробництво  │
│  ✉ Розсилка           Пряжа            Співпраця       конфіденц.     в одному місці│
│  [email        ] →    Ровниця          Партнерські                                 │
│                       Вовна для рук.   вироби          Відгуки        ☎ 067 997 34…│
│                       Овчина та шкіра                  Відстежити     ☎ 067 960 47…│
│                       Усі категорії →                  замовлення     ✉ email      │
│                                                                       Графік гнучкий│
│                                                                       — телефонуйте│
│                                                                       перед візитом│
│                                                                       Графік у Google│
│                                                                       [ Маршрут → ] │
│  ──────────────────────────────────────────────────────────────────────────────    │
│  Visa  Mastercard  │  Нова Пошта  Укрпошта  Магазин у Яворові    │   UA EN PL DE  │
│  ──────────────────────────────────────────────────────────────────────────────    │
│  © 2026 ФОП {{LEGAL_ENTITY_NAME}} · РНОКПП {{LEGAL_ID}} · Усі права застережено     │
│                                                                    ⌇ sheep mark    │
└────────────────────────────────────────────────────────────────────────────────────┘
   cols 1–3          cols 4–5        cols 6–7        cols 8–9       cols 10–12
```

The brand column is widest because it carries the newsletter field, which needs a real input and
a real button, not a squeezed one. The category column is second-widest because it is the SEO
payload.

Two Round-2 changes are visible in this frame. The `IG FB YT` row is **gone**, not greyed out —
per [00-client-decisions-2.md](00-client-decisions-2.md) E3 there is nothing to link to, and the
vertical space it freed goes to the brand paragraph. The contacts column ends with an
availability statement and a link to the Google Business Profile instead of a three-line
schedule, which is both shorter and true.

Two Round-3 changes are visible as well. The brand paragraph reverts to the approved «в
Карпатах» line ([00-client-decisions-3.md](00-client-decisions-3.md) F6) and is consequently
three lines shorter. The contacts column gains a line **above** the address — «Магазин і
виробництво в одному місці» (F2) — and that ordering is the decision, not an accident: a heading
that tells the reader what the place *is* converts the address beneath it from a legal
disclosure into a destination. The freed vertical space from the brand column pays for it exactly.

### `md` — 768–1023 px: two rows of columns

```
┌──────────────────────────────────────────────────────────┐
│  ⌇ ВІВЧАРИК                          КОНТАКТИ            │
│  Понад 30 років виробляємо…          Магазин і виробництво│
│  ✉ [email            ] →             с. Яворів, 78644…   │
│                                      ☎ ☎ · ✉ · графік    │
├──────────────────────────────────────────────────────────┤
│  ВОВНА            ВИРОБНИЦТВО        ПОКУПЦЮ             │
│  (2 sub-columns)  (list)             (list)              │
├──────────────────────────────────────────────────────────┤
│  Visa Mastercard │ НП Укрпошта Магазин │ UA EN PL DE     │
│  © 2026 ФОП …                                    ⌇       │
└──────────────────────────────────────────────────────────┘
```

Brand and contacts pair on the first row because they are the two blocks a visitor actively
seeks. The link columns follow, because they are scanned rather than sought.

### `sm` / `xs` — below 768 px: accordions, except contacts

```
┌────────────────────────────────┐
│  ⌇ ВІВЧАРИК                    │
│  Понад 30 років виробляємо     │
│  натуральні вовняні вироби     │
│  в Карпатах.                   │
├────────────────────────────────┤
│  ▸ Вовна                  56px │  accordion, collapsed
│  ▸ Виробництво                 │
│  ▸ Покупцю                     │
├────────────────────────────────┤
│  КОНТАКТИ            always open│
│  Магазин і виробництво         │  ← F2, above the address
│  в одному місці                │
│  вул. Петруші, с. Яворів       │
│  Косівський р-н, Івано-Фр. обл.│
│  78644                         │
│  ☎ +38 067 997 34 50      56px │  tap target — Іван
│  ☎ +38 067 960 47 69      56px │  tap target — Любов
│  ✉ {{BRANDED_EMAIL}}           │
│  Графік гнучкий —              │
│  телефонуйте перед візитом     │
│  [ Графік у Google →     ] 56px│
│  [ Прокласти маршрут →   ] 56px│
├────────────────────────────────┤
│  ✉ Розсилка                    │
│  [email                 ]  →   │
├────────────────────────────────┤
│  Visa · Mastercard             │
│  НП · Укрпошта · Магазин       │
│  UA · EN · PL · DE             │
├────────────────────────────────┤
│  © 2026 ФОП Гондурак Л. Ю.     │
│  РНОКПП {{LEGAL_ID}}        ⌇  │
└────────────────────────────────┘
```

**The contacts block never collapses.** Everything else does. This is the whole mobile-footer
decision: the visitor who scrolled to the bottom of a mobile page is disproportionately looking
for a phone number or an address, and putting that behind a disclosure to save 200 px of scroll
trades the footer's most valuable content for its least valuable metric. Accordion behaviour
follows [13-motion-system.md](13-motion-system.md) §13.10 — `grid-template-rows: 0fr → 1fr`,
chevron rotation, `dur-base`.

Semantics: `<footer role="contentinfo">` containing `<nav aria-label="Додаткова навігація">` for
the link columns. The contacts block is an `<address>`, not a `<nav>`.

## 16.4 Link inventory

### Column: Вовна

Every wool category from [00-client-decisions.md](00-client-decisions.md) D3, plus «Овчина та
шкіра», «Партнерські вироби», and «Усі категорії». Fifteen links. This is deliberate: nothing
else on the site links to all twelve wool categories from every page, and on a domain with no
external authority that sitewide path is how the deeper categories get crawled and get their
first impressions. Дерево is absent — the category is not launched (D3).

### Column: Виробництво

Про нас · Виробництво · Наші майстри · Блог · Фотогалерея · Оптовим покупцям · Співпраця та
партнерство.

### Column: Покупцю — the policy pages

These are the pages the site must have. **They are not migrated.** D2 cancels the migration
workstream: the pages observed on `fabryka-shkur.com.ua` belong to a separate business and
neither their content nor their URLs carry over. What the audit establishes is the *inventory* —
the set of pages a Ukrainian wool business of this kind is expected to publish — and every one of
them must be authored fresh, in four locales.

| Page | Slug | Content owner | Notes |
|---|---|---|---|
| Оплата і доставка | `/oplata-i-dostavka/` | Client + legal | Nova Poshta, Ukrposhta, collection at the Яворів shop, and whatever `{{PSP}}` resolves to. Must not list methods that are not live. **Round 3 adds the international terms** — see below |
| Умови повернення | `/povernennya/` | Legal | 14 days, the Ukrainian statutory distance-selling minimum. Buyer pays return shipping unless a defect is confirmed |
| Договір оферти | `/oferta/` | Legal | Ukrainian public-offer contract. Required for a Ukrainian online seller; referenced from the checkout consent checkbox |
| Догляд за виробами | `/doglyad/` | Content | Care guide. The single highest-value content asset on a cold-start domain — it is informational long-tail, which is the only organic entry point available for the first two quarters (D2) |
| Політика конфіденційності | `/pryvatnist/` | Legal | GDPR-grade for `de`/`pl`; names the data controller, which requires §16.10 to be resolved |
| Співпраця та партнерство | `/spivpratsya/` | Client | Wholesale-adjacent: private label, partner manufacturers, retail stockists |
| Відгуки | `/vidhuky/` | Content | Launches empty. There is no review history to seed from — D2 revokes that assumption. An honest empty state ([08-design-system.md](08-design-system.md) §8.8) is required |
| Часті питання | `/pytannya/` | Content | Feeds `FAQPage` structured data |
| Відстежити замовлення | `/vidstezhyty/` | Product | New in Round 2 — §16.4b |
| Impressum | `/impressum/` | Legal | **`de` locale only.** Renders as an additional link in this column when `locale === "de"`, and nowhere else. §16.10 |
| Право на відмову (14 днів) | `/vidmova/` | Legal | Rendered for `de` and `pl`. §16.10 |
| Форма відмови від договору | `/vidmova/forma/` | Legal | The EU model withdrawal form, downloadable and linked directly rather than buried inside the withdrawal page. §16.10 |

**Slugs are proposals, not observations.** They are authored for a new domain and must be signed
off with [29-seo-architecture.md](29-seo-architecture.md) before any link is built against them.

### What `/oplata-i-dostavka/` must now state, per F4

[00-client-decisions-3.md](00-client-decisions-3.md) F4 resolves the shipping model and it is
blunt: «покупець оплачує все». The buyer pays carriage **and** all customs duties and import
taxes — effectively DAP, delivered duties unpaid. Carriers are Nova Poshta, Ukrposhta and others
chosen case by case, so `{{INTL_CARRIER}}` resolves to *multiple, quoted per order* rather than to
a single default.

| Statement | Where it must appear |
|---|---|
| The buyer pays shipping to every destination | `/oplata-i-dostavka/`, all four locales |
| The buyer pays customs, duties and import VAT | `/oplata-i-dostavka/` **and** the international checkout path, before the pay button ([18-checkout-specification.md](18-checkout-specification.md) §18.23) |
| International shipping is **quoted per order, not calculated** | `/oplata-i-dostavka/`; the recommended model is enquiry-then-invoice |
| **Free shipping never applies internationally**, at any order value | `/oplata-i-dostavka/`, and by omission in the footer delivery band (§16.6) |

### What `/oplata-i-dostavka/` must additionally state, per Round 5

[00-client-decisions-5.md](00-client-decisions-5.md) adds four commercial rules that have no
footer surface of their own and must therefore be findable on the page the footer links to. The
footer's obligation is unchanged — link, do not summarise — but the page's contract grows:

| Statement | Source | Locale scope |
|---|---|---|
| Online card payment (WayForPay) is available on every product, to every destination, and is the **only** method outside Ukraine | H1.2 | All four |
| **«Наложений платіж з оглядом»** — pay at the Nova Poshta or Ukrposhta counter *after opening the parcel* — is available on **stocked items, Ukraine only** | H1.2 | `uk` only |
| On a COD order the buyer pays **both shipping legs online at checkout**; if they keep the goods the return leg is **subtracted from what they pay at the counter**; if they refuse, nothing further is paid | H1.3 | `uk` only |
| A made-to-order item — any non-standard size — is **prepaid in full online**, because the workshop commits fourteen days of labour to a size nobody else will buy. COD is not offered for these | H1.1, G2 | All four |
| The fourteen days are **production before dispatch**; carrier transit is added on top | G2 rule 1 | All four |
| International orders are **quoted within two working days** («протягом 2 робочих днів»), and the quote is valid for three | H2 | `en`, `pl`, `de` |
| A custom size is priced **by area**, from a rate the workshop sets per product, with the permitted width and length range stated on the product itself | H3c | All four |

**The deposit statement is the one to get right, and it is not the footer's to get right.** H1.3
is explicit that the mechanic must be presented with a worked example in real numbers — «ви
доплатите {{PRICE − RETURN}} ₴ замість {{PRICE}} ₴» — and neither a policy page nor a footer can
carry a customer's actual figures. The page explains the rule in general terms; the **checkout**
carries the arithmetic with that order's numbers, expanded, above the pay button
([18-checkout-specification.md](18-checkout-specification.md),
[33-responsive-strategy.md](33-responsive-strategy.md) §33.4). Framed as prose or as a percentage
it reads as "pay extra for permission to look at the goods", which would be worse than not
offering inspection at all.

**The COD rules are `uk`-scoped in the content model, not in a render branch.** The `en`, `pl` and
`de` translations of `/oplata-i-dostavka/` do not contain a translated-then-hidden COD section.
They are authored without one — the same absent-row discipline the announcement bar uses
([15-navbar-specification.md](15-navbar-specification.md) §15.4) — because a section that exists
and is suppressed is a section someone can un-suppress. For the EU locales this is a legal
boundary rather than a merchandising one: under the Consumer Rights Directive a trader may not
require a deposit against the exercise of the 14-day right of withdrawal, so the deposit mechanic
is not available in `pl` or `de` in this form at all.

The customs disclosure is not a policy-page formality. An EU buyer surprised by an import VAT
bill at the door refuses the parcel, and the shop absorbs a return shipped from another country —
the single commonest way a small cross-border seller loses money. It must be placed where it will
be read rather than inside a collapsed accordion, and localised properly per locale rather than
machine-translated.

The footer's obligation is narrower than the page's: it links to the page, and it must not state
any delivery figure or promise that the page then qualifies. That is why §16.6's delivery band
carries carrier names and nothing numeric.

### Column: Контакти

Not links but the NAP block — §16.5.

## 16.4b Order tracking lives in the footer, not the header

[00-client-decisions-2.md](00-client-decisions-2.md) E12 makes guest checkout permanent. There
are no accounts, so there is no «Мій кабінет» and no «Увійти» anywhere on the site. What replaces
them is a single lookup form at `/vidstezhyty/` taking **order number + email**, validating them
as a pair against `Order.guestToken`.

**Decision: the entry point is the footer, in the Покупцю column. Not the header.**

| Considered | Verdict |
|---|---|
| Header utility slot, where the account icon would have been | **Rejected.** The header's utility cluster is already at capacity with search, wishlist, cart, phone and locale ([15-navbar-specification.md](15-navbar-specification.md) §15.3), and it is optimised for the pre-purchase visitor. Order tracking is a post-purchase task. Spending the scarcest horizontal space on the site on a task that occurs once per order, after the money has already moved, inverts the priority. |
| Footer, Покупцю column | **Chosen.** The footer is the conventional home for post-purchase service links, it is reachable from every page including the confirmation page, and the column already groups exactly this kind of content — payment, delivery, returns, care. It also inherits the slot the account link would have occupied, at zero layout cost. |

The honest framing is that **neither is the primary path.** The real primary path is the direct
`guestToken` link in the order-confirmation email, which requires the buyer to type nothing. The
footer link exists for the buyer who deleted the email, and that buyer is patient, motivated, and
willing to scroll — which is precisely the profile the footer serves well. Sizing the entry point
to the actual frequency of the task is the reason this is a link and not a header control.

Rate limiting, enumeration resistance and the no-account-creation guarantee for this form are
specified in [32-security-architecture.md](32-security-architecture.md); the footer's obligation
is only to link to it and to label it in plain language rather than as «Кабінет».

## 16.4c The review page has an entry point that is not on this site

[00-client-decisions-4.md](00-client-decisions-4.md) G4: «Так, відправляється візитка разом з
посилкою.» **A business card already ships in every parcel.** Nothing has to be invented, printed
from scratch or added to the packing workflow — the card is already in the box and already in the
hand of someone who has just unwrapped a blanket.

That changes what `/vidhuky/` is. In the link inventory above it is a policy-adjacent page that
launches empty and that almost nobody navigates to, because on a cold-start domain there is no
traffic to navigate with. G4 gives it a channel:

| Element on the card | Why | Footer consequence |
|---|---|---|
| A short URL — `{{DOMAIN}}/v` — resolving to a review-and-reorder landing page | Typed by the older half of a 25–75 audience | `/v` must be a real route, reserved now, and must **not** collide with a locale prefix or a category slug. It is recorded against the slug sign-off in §16.4 |
| A QR code to the same URL | Scanned by the younger half. Print both; the split is real | None — but the destination is the same page, so there is one landing page to maintain, not two |
| The primary phone (Іван) and the site address | The card is the fallback when someone loses the confirmation email | These must be **byte-identical to the NAP in §16.5**, which is already byte-identical to the Google Business Profile. Three surfaces, one string |

**Why this matters more than it looks.** The single scarcest asset at launch is reviews. The site
starts with zero ([00-client-decisions.md](00-client-decisions.md) D2), `AggregateRating` is
suppressed until three verified reviews exist ([29-seo-architecture.md](29-seo-architecture.md)),
and no social proof exists anywhere because there is no social media (E3). The card reaches the
one segment the site otherwise cannot reach at all: **the counter-sale customer**, who bought in
the Яворів shop, has no order number, no email in the system, and no route back. A footer link to
`/vidhuky/` is useless to that person. A card in their bag is not.

**The honest caveat, which must not be worked around.** A review arriving through `/v` has no
order linkage, so `isVerifiedPurchase` stays `false` and it is excluded from the aggregate rating
([25-database-schema.md](25-database-schema.md) §25.6). That is correct. The temptation — accept a
typed order number on the review form and treat it as verification — creates a field anyone can
guess, which is exactly the enumeration surface §16.4b's lookup form is rate-limited against.
Unverified reviews still render, still carry their honest label, and still do the job the card was
printed for.

**The footer's own obligation stays one link.** «Відгуки» in the Покупцю column, unchanged. The
card is not a footer element and no QR code appears on the site — a QR rendered on a screen the
visitor is already holding is the standard misapplication of the pattern.

## 16.5 NAP block and its relationship to LocalBusiness schema

**Resolved in Round 2.** [00-client-decisions-2.md](00-client-decisions-2.md) E2 supplies the
real address, and it is **not** the one recorded in
[00-existing-site-audit.md](00-existing-site-audit.md). Вербовець belonged to the adjacent
business. Вівчарик is in **Яворів**, a different village roughly 20 km away in the same raion.
Every previous rendering of the NAP in this blueprint is therefore wrong and is superseded here.

```
Магазин і виробництво в одному місці          ← F2, first line of the block
вул. Петруші, с. Яворів
Косівський район, Івано-Франківська область, 78644, Україна
+380 67 997 34 50   Іван Гондурак
+380 67 960 47 69   Любов Гондурак
{{BRANDED_EMAIL}}
Графік гнучкий — телефонуйте перед візитом
[ Актуальний графік у Google → ]   [ Прокласти маршрут → ]
```

### The NAP is a place you can walk into, and the block must say so

[00-client-decisions-3.md](00-client-decisions-3.md) F2: «Там знаходиться і магазин і
виробництво.» The Яворів site houses **retail and production together**. That is new information
and it changes what this block is for.

A footer address is ordinarily a compliance artefact — proof that a legal entity exists
somewhere. This one is evidence of a different kind. The primary purchase anxiety in this
category is A3, "is this a real factory or a reseller"
([02-ux-research.md](02-ux-research.md) §2.4), and a shop attached to a production floor, in a
village tourists already travel to for this exact craft, answers it better than any element the
site can render. A factory you can only read about is a claim. A shop you can walk into is proof.

| Treatment | Verdict |
|---|---|
| Address only, as before | **Rejected.** It reads as a registration detail. A visitor scanning a footer does not infer "shop" from a street and a postal code |
| Address with «Самовивіз» beside it | **Rejected.** «Самовивіз» frames the place as a way to avoid a delivery fee. It is the correct word in a checkout method list and the wrong word here |
| A one-line descriptor **above** the address | **Chosen.** «Магазин і виробництво в одному місці» costs one line, tells the reader what the address is before they read it, and turns a disclosure into a destination |
| A full visit section with directions and parking | **Rejected here, required elsewhere.** F2 promotes the contact page from a utility page to a destination page, and directions, parking and what is on display belong there. The footer's job is to make the visitor want to open that page |

Two constraints on the line:

1. **It carries no hours, in any form.** E3 is unchanged and the flexible-hours caveat below the
   phones is doing more work now, not less: inviting someone to drive into the mountains and then
   being closed is worse than never inviting them. The invitation and the caveat ship together or
   neither ships.
2. **It is the same `Setting` key the homepage renders** (`contact.visitLine`,
   [06-homepage-wireframe.md](06-homepage-wireframe.md) S11). One string, two render sites, no
   opportunity to drift.

There is a Google Business Profile consequence as well. A profile carrying retail attributes —
in-store shopping, in-store pickup — surfaces for «де купити ліжник» queries that a
manufacturer-only profile cannot answer, while a shop-only category discards the manufacturing
story. Confirming the primary category reflects **both** functions is open item 3 in
[00-client-decisions-3.md](00-client-decisions-3.md) F7 and is part of the same E4 verification
pass as the byte-identical check below.

**This block and the Google Business Profile listing must be byte-identical.** That is not a
style preference. [00-client-decisions.md](00-client-decisions.md) D2 makes Google Business
Profile the highest-leverage early channel — higher than organic search, for at least two
quarters — and NAP consistency between the profile and the site is a direct local-ranking input.
«вул. Петруші, 5» on the site and «вул. Петруші» in the profile is a real inconsistency to a
matching algorithm even though it is invisible to a human. E4 makes this a Phase 0 verification
task: the profile is checked against this block before the footer ships, not after.

**Both numbers render, both labelled with a name, Іван first.**
[00-client-decisions-4.md](00-client-decisions-4.md) G1 names the footer NAP as a both-numbers
surface and fixes the order: `+380679973450` (Іван, owner of production) above `+380679604769`
(Любов, ФОП seller of record). Two unlabelled phone numbers make a visitor guess which to call;
two named numbers in a stated order make the business feel small in the way this brand wants to
feel small. Naming them is consistent with [01-brand-strategy.md](01-brand-strategy.md) §1.5,
which asks the brand to speak as people rather than as a company.

**The footer is the one screen where the "who trades / who answers" split is fully visible, and it
must not be flattened.** Іван's number sits at the top of the contacts column; ФОП Гондурак Любов
Юріївна sits on the legal line at the bottom of the same screen (§16.10). G1 states that this
divergence is deliberate: a legal page naming the wrong person is a defect, and a contact block
naming the person who does not pick up is a different defect. A contributor who notices the two
names and "reconciles" them has broken whichever one they changed. The `<address>` block and the
`©` line are populated from **different** settings for exactly this reason — `contact.phones` and
`legal.entityName` — and there is no shared "owner" value that could tempt a single edit.

**The footer does not carry the workshop-tour invitation.** G3 lists five homes for it — the
production page, the contact page, the wholesale page, the about page and the Google Business
Profile — and the footer is deliberately not among them. The invitation cannot be compressed: it
requires «разом із власником» and «зателефонуйте заздалегідь» in the same breath, because an
invitation without the arrangement caveat produces a visitor who drives into the mountains and
finds nobody. Four lines is more than the contacts column can spend, and a two-line version is the
version that over-promises. The footer's job here is the one it already does: «Магазин і
виробництво в одному місці» plus a phone, which makes a reader want to open the contact page where
the tour is properly framed.

**Viber is not rendered until a number is confirmed to carry it.** The previous draft attached a
Viber deep link to the first number on the strength of the audit, which described the adjacent
business. A Viber link that opens a chat nobody reads is worse than a phone number that rings.
Re-add it as a labelled control on the specific number confirmed, or not at all.

### Opening hours are variable and are never published

E3 states the hours differ day to day and that Google Maps is the live source. The footer
therefore renders one sentence — «Графік гнучкий — телефонуйте перед візитом» — followed by both
numbers and a link to the Google Business Profile, which is labelled as the authoritative source
rather than as a map.

| Option | Why rejected / chosen |
|---|---|
| Print the most common hours | **Rejected.** They are wrong on the days they are wrong, and the failure mode is a visitor who drives to a closed workshop and reports it. Google surfaces those reports, and repeated "closed when listed open" signals degrade the profile that is carrying the entire launch |
| Print a wide range («9:00–19:00, можливі зміни») | **Rejected.** A hedge attached to a specific number is read as the number, not as the hedge |
| Print nothing and show only phones | **Rejected.** Silence reads as an unattended business |
| One honest sentence + both phones + a link to the live source | **Chosen.** It is true on every day of the year, it routes the visitor to a person, and it makes the Google profile more valuable rather than redundant |

This is not a downgrade dressed as a principle. For a workshop in a tourist village, «телефонуйте
перед візитом» is what a local would tell you anyway, and it converts a scheduling problem into a
conversation — which for a made-to-order manufacturer is the better outcome.

The footer NAP is the **single source** rendered into the `LocalBusiness` JSON-LD in
[29-seo-architecture.md](29-seo-architecture.md). It is not re-typed there. One data object
produces the visible block, the microdata, and the contact page, so the three cannot drift:

| Visible | Schema property |
|---|---|
| Address lines | `address` → `PostalAddress` with `streetAddress: "вул. Петруші"`, `addressLocality: "Яворів"`, `addressRegion: "Івано-Франківська область"`, `postalCode: "78644"`, `addressCountry: "UA"` |
| Both phones | **`telephone` carries Іван only** — the property is singular in practice and G1 rules it explicitly. Любов goes in `contactPoint` with a `contactType`, never as a second `telephone` value. An array there is how a business ends up with the wrong number in a knowledge panel |
| Hours | **`openingHoursSpecification` is omitted.** Per E3, publishing hours that are wrong twice a week is worse than publishing none. The JSON-LD carries `telephone`, `address`, `geo` and `url` only |
| Directions link | `hasMap` |
| — | `foundingDate` — **omitted.** D1 forbids asserting 1992 as a machine-readable founding date. The 30-year story lives in `description` and in on-page prose, where it is editorial rather than machine-asserted |
| — | `sameAs` — **omitted.** E3: no social profiles exist. An empty `sameAs` array is noise; a `sameAs` pointing at the adjacent business's Instagram would be a factual error in machine-readable form, which is the worst place to make one |

Omitting `openingHoursSpecification` costs a rich-result feature and buys accuracy. That trade is
correct here because the Google Business Profile — which the client already maintains and which
E4 makes the primary channel — is the surface where hours actually matter, and it is edited by
someone who knows today's schedule. The site should defer to it rather than compete with it.

### The email address — an interim one now exists, and it has two separate problems

**Superseded.** The previous draft recorded that no business email existed at all.
[00-client-decisions-3.md](00-client-decisions-3.md) F5 supplies one:

```
gif19601@gmail.com
```

It is usable as a contact address today. It is **not** usable as the site's identity, and the two
reasons are independent — one commercial, one technical. They are stated separately because they
have different severities and only one of them is negotiable.

**Problem 1 — it costs trust, for the price of one DNS record.** A site presenting 5,000–15,000
UAH craft goods with a numeric personal Gmail as its only published address undercuts its own
positioning. It reads as an individual selling things, not as a manufacturer with a shop and a
production floor — which, after F2, is exactly what the block above it has just claimed. This is
the cheapest upgrade available anywhere on the project, and it is the one the footer is most
responsible for, because the footer is where a hesitant buyer looks for it.

**Problem 2 — transactional email cannot be sent from `@gmail.com` at all.** This is the more
serious of the two and it is a hard technical constraint, not an aesthetic preference:

- Google does not permit third-party systems to publish SPF or DKIM records for `gmail.com`, so
  mail sent "from" a Gmail address by the application fails both.
- Gmail's DMARC policy for consumer accounts rejects such mail outright.
- The practical result is that order confirmations land in spam or are refused entirely. A
  customer who has paid and received nothing contacts support, or disputes the charge.

There is no configuration that makes this work. It is not a deliverability tuning problem; the
sending identity is simply not available to us.

| Address | Purpose | Resolution |
|---|---|---|
| `gif19601@gmail.com` | Іван's login to the admin panel and the mail fallback | **Never published** ([00-client-decisions-8.md](00-client-decisions-8.md) §L1) |
| `{{BRANDED_EMAIL}}` | Published in the footer, the NAP and the Impressum | On `{{DOMAIN}}`. **Read in the admin panel** ([00-client-decisions-7.md](00-client-decisions-7.md) §K2); forwarded to the Gmail above only until the panel mail ships |
| `{{TRANSACTIONAL_FROM}}` | `no-reply@{{DOMAIN}}` — order confirmations, shipping notices, newsletter double opt-in | On `{{DOMAIN}}`, with SPF, DKIM and DMARC published. **Phase 1 blocker**, not a polish item |

**What the footer displays, and when.** `info@vivcharyk.shop` ([00-client-decisions-8.md](00-client-decisions-8.md) §L1, §L2). The Gmail address
is **never** displayed, including before the domain resolves: it is the only Owner's login, and a
published admin login is a phishing target. If launch preceded the domain the footer would show
the phone numbers and no email. A branded
address that forwards is one DNS record and one alias; there is no scenario in which it is worth
shipping the numeric Gmail as the permanent public identity.

The dependency chain is worth stating because it has changed priority. `{{DOMAIN}}` (E9) was
previously deferred to deployment as a naming decision. F5 makes it a **prerequisite for the
checkout working end to end**, because a checkout that takes money and cannot confirm the order
is not a working checkout. For the `de` locale an email address is additionally a statutory
Impressum field (§16.10), not a nicety.

## 16.6 Payment and delivery marks

A single horizontal band above the legal line, `caption` labels, monochrome marks at
`--text-muted`, no coloured brand logos. Coloured payment logos are the visual register of a
template checkout and pull directly against the design system's low-chroma discipline
([09-color-palette.md](09-color-palette.md) §9.1).

| Group | Rendered |
|---|---|
| Payment, `uk` | Visa · Mastercard · **Наложений платіж з оглядом**, **only for methods actually enabled** |
| Payment, `en` / `pl` / `de` | Visa · Mastercard. **Nothing else** |
| Delivery | Нова Пошта · Укрпошта · Магазин у Яворові |

**Rule: the marks are generated from the enabled-methods setting, never hardcoded.** Rendering a
Visa mark before `{{PSP}}` is live is a promise the checkout cannot keep, and a buyer who reaches
payment and finds only a bank-transfer form has been misled by the footer. This is enforced by
deriving the band from the same configuration the checkout reads.

**Round-5 correction to the payment group.** The third mark read «Готівка при отриманні». That is
wrong twice over. [00-client-decisions-5.md](00-client-decisions-5.md) H1.2 names the method
«наложений платіж **з оглядом**» — cash on delivery *with inspection at the branch* — and the
inspection is the entire value of it. For a buyer spending 5,000–15,000 ₴ with an unfamiliar new
brand, the right to open the parcel at the Nova Poshta counter before paying removes the single
largest objection a cold-start domain faces, and «готівка при отриманні» throws that away by
describing the payment timing instead of the right. H1.2 asks for the method to be stated plainly
rather than buried, and a sitewide band is the cheapest place to state it.

**And it is locale-gated, which no other mark in this band is.** COD is Ukraine-only. A German
visitor who reads «наложений платіж» in the footer of every page and then finds a card-only
checkout has been misled by persistent chrome, which is the worst place to mislead anyone. The
gate uses the same locale resolution as §16.9 and the same absent-row discipline as the
announcement bar ([15-navbar-specification.md](15-navbar-specification.md) §15.4): the mark is not
authored for the EU locales rather than authored and hidden.

**The band states the method and never the mechanic.** It does not mention the return-shipping
deposit (H1.3), because a deposit stated without its arithmetic is the exact misreading H1.3 warns
against — «pay extra for permission to look at the goods» — and a monochrome mark row has no room
for three numbers. The deposit appears in exactly two places: the checkout, with the order's real
figures above the pay button, and `/oplata-i-dostavka/`, in general terms. Nowhere else, and
certainly not in sitewide chrome.

**The band also says nothing about made-to-order prepayment.** H1.1 removes COD for any
custom-size line, which means the `uk` band's third mark is true of the catalogue but not of every
cart. That is acceptable for a band that lists what the shop accepts; it is not acceptable for the
PDP or the checkout, which must state the restriction on the product it actually applies to
([17-product-page-specification.md](17-product-page-specification.md),
[18-checkout-specification.md](18-checkout-specification.md)). The rule the footer follows is the
one it already follows for shipping figures: name the method, never the conditions.

**Two Round-3 corrections to the delivery group.**

The third item read «Безкоштовний самовивіз у Косові». Both halves were wrong. The village is
Яворів, not Косів — Косів is the raion town
([00-client-decisions-2.md](00-client-decisions-2.md) E2) — and after
[00-client-decisions-3.md](00-client-decisions-3.md) F2 the site is a shop, not a collection
point. «Магазин у Яворові» is shorter, true, and does a job the old string could not: in a band
that otherwise lists two courier brands, it is the only item that says a human can be met. The
word «безкоштовний» is dropped because a shop is not a discounted delivery method and pricing it
as one throws away the thing that makes it valuable.

**The band carries no figures and no international claim**, per F4. The buyer pays carriage and
all customs duties and import taxes to every destination, and international shipping is quoted
per order rather than calculated (§16.4). A sitewide band is the worst possible place for a
number that depends on destination and carrier, and «безкоштовна доставка» must never appear
here at all: free shipping is `uk`-only and a global band cannot be locale-honest without
becoming a table. Carrier names only; the page states the terms.

## 16.7 Social links — removed

**There is no social row.** [00-client-decisions-2.md](00-client-decisions-2.md) E3: the owners
run no accounts, on any platform. The previous draft of this section specified Instagram,
Facebook and YouTube glyphs on the strength of the audit; the audit was describing the adjacent
business.

The component, the icon set and the `sameAs` array are all deleted rather than left empty:

| Rejected fallback | Why it is worse than deletion |
|---|---|
| Render the glyphs greyed out, "coming soon" | Three dead icons at the bottom of every page is the visual signature of an abandoned site. It converts a neutral absence into an active negative signal |
| Render them linking to the homepage | A link that goes nowhere useful is a broken link the visitor discovers by clicking. It also pollutes internal link equity |
| Link `@fabryka_shkur` | **Absolutely forbidden.** That account belongs to the adjacent business. Sending Вівчарик's visitors to a different seller's shopfront is the single most expensive error available in this footer, and it is also a factual misrepresentation of who operates the brand |
| Delete the row | **Chosen.** An absence is invisible. Nobody has ever noticed that a footer lacks an Instagram icon; everybody notices one that leads nowhere |

### Where Instagram slots in when it exists

E3 records a **recommendation, not a decision**, that an Instagram account be created before
launch — for a craft manufacturer it is where the product photography does its work, and it is
the cheapest proof-of-life signal a zero-authority domain can buy. The footer is built so that
adding it later is a data change, not a layout change:

| Aspect | Specification, held in reserve |
|---|---|
| Position | Brand column, directly beneath the newsletter field at `lg`+; beneath the newsletter block at `md` and below. It sits with the brand, not with the payment marks — it is a voice channel, not a transaction affordance |
| Rendering rule | The block renders **only when `{{INSTAGRAM}}` resolves to a non-empty value**. The conditional is written now so that the empty state is structurally impossible rather than a discipline anyone has to maintain |
| Count | One icon. A single well-kept account beats a row, and the row is what invites the dead-link problem back |
| Treatment | Monochrome 24 px glyph in a 48 px hit area, `rel="me noopener"`, `target="_blank"`, `aria-label` naming the network **and** the handle — «Вівчарик в Instagram, @handle» — so a screen-reader user knows which account they are being sent to |
| Schema | The handle is added to `sameAs` in the `LocalBusiness` JSON-LD at the same time, from the same value. One token, three render sites |

Until that token resolves, the space stays with the brand paragraph, which is now long enough to
fill it (§16.3).

## 16.8 Newsletter signup

Single field, visible label, 48 px height, `type="email"`, `autocomplete="email"`, per
[08-design-system.md](08-design-system.md) §8.6. No modal, no exit-intent popup, no incentive
discount — the brand does not discount ([01-brand-strategy.md](01-brand-strategy.md) §1.5,
"never apologise for the price").

| Aspect | Rule |
|---|---|
| Value proposition | Stated in one line and honest about frequency: «Раз на місяць — про нові вироби та ремесло» |
| Model | `NewsletterSubscriber` ([25-database-schema.md](25-database-schema.md) §25.9) |
| Consent | An unchecked checkbox, never pre-ticked, with the privacy-policy link inline |
| Double opt-in | **Mandatory for `de`, applied to all four locales.** `confirmedAt` stays null until the confirmation link is clicked; unconfirmed rows are never sent to |
| Why all four | German law requires documented double opt-in and Ukrainian law does not, but maintaining two subscription flows to save one email is how the compliant path eventually gets bypassed by a hurried change |
| Success state | Replaces the field in place with «Перевірте пошту — ми надіслали лист для підтвердження». Not a toast: the confirmation step must be read, and a toast that auto-dismisses after five seconds is designed to be missed |
| Errors | Inline, below the field, `aria-live="polite"`, no motion (§13.11) |
| Source | `NewsletterSubscriber.source = "footer"`, so footer performance is separable from other capture points |

## 16.9 Locale switcher in the footer

Four locales rendered as inline links rather than a dropdown: `Українська · English · Polski ·
Deutsch`. A dropdown in the header is right because space is scarce; a dropdown in the footer
would hide four short words behind a click for no reason.

Behaviour is identical to [15-navbar-specification.md](15-navbar-specification.md) §15.12 — the
same component, the same slug-aware route resolution, the same `locale` cookie written only on
explicit choice. The current locale renders as non-interactive text with `aria-current="true"`,
not as a link to itself.

## 16.10 Copyright and legal entity

```
© 2026 ФОП Гондурак Любов Юріївна · РНОКПП {{LEGAL_ID}} · Усі права застережено
```

**Half resolved in Round 2.** [00-client-decisions-2.md](00-client-decisions-2.md) E1 names the
seller of record: `{{LEGAL_ENTITY_NAME}}` → **ФОП Гондурак Любов Юріївна**. This is the entity on
the offer contract, on the invoice, in the WayForPay merchant account (E10) and in the German
Impressum. The question D1 left open — *which* of the several ФОПs sells — is closed, and with it
the risk that the footer, the contract and the PSP record named three different parties.

**`{{LEGAL_ID}}` exists and is pending delivery.**
[00-client-decisions-3.md](00-client-decisions-3.md) F1 changes its status from *missing* to
*supplied on request*, and that changes how it should be treated in planning. It is **no longer a
general blocker.** It blocks exactly three deliverables — WayForPay merchant onboarding, the
Договір оферти and the returns policy, and the German Impressum — and nothing else in this footer
waits on it. A ФОП is identified by РНОКПП; a legal entity by ЄДРПОУ.

The rendering rule is unchanged and is worth restating, because a resolved-but-undelivered token
is exactly the condition under which a placeholder ships: **the legal line refuses to render the
identifier segment while the token is unresolved**, rather than printing `{{LEGAL_ID}}` or a
dash. The line degrades to «© 2026 ФОП Гондурак Любов Юріївна · Усі права застережено», which is
incomplete but not wrong. CI blocks on `{{` in rendered output regardless.

The Impressum link stays gated on `{{LEGAL_ID}}` — see the locale table below. That gate is real:
publishing a German Impressum without the registration identifier is worse than not publishing
one, because it demonstrates awareness of the obligation alongside failure to meet it.

**For the EU locales this is not optional**, and E11 has raised the stakes: the `de` and `pl`
locales are now **transactional**, not informational. A locale that takes money is a locale that
owes the full consumer-law disclosure set.

| Locale | Requirement | Footer obligation |
|---|---|---|
| `de` | A statutory *Impressum* naming the operator, a physical address, contact details, and the registration identifier, reachable from every page. Non-compliance is directly actionable and the enforcement culture around it is aggressive | «Impressum» link in the Покупцю column, rendered only for `de`. It must name **ФОП Гондурак Любов Юріївна**, the Яворів address, `{{BRANDED_EMAIL}}` and a phone number — all four, not a subset |
| `de` + `pl` | The 14-day right of withdrawal under the EU Consumer Rights Directive, disclosed **before** payment, not in the confirmation email | «Право на відмову (14 днів)» link, rendered for both locales |
| `de` + `pl` | The model withdrawal form, made available in a form the buyer can retain | «Форма відмови від договору» linked **directly** from the footer rather than only from inside the withdrawal page. One click, not two — the obligation is availability, and a form buried one level deep invites the argument that it was not made available |
| `pl` | Seller identification and identifiers on distance-selling pages | Covered by the shared legal line above, which now carries a real entity name |
| `uk` | Public-offer contract disclosure | «Договір оферти», already in the column |
| `en` | No independent requirement, but the same block renders for consistency | — |

Three EU links appear in the `de` footer and two in the `pl` footer. They are **locale-gated, not
sitewide** — a Ukrainian buyer does not need a German Impressum link, and rendering it to everyone
is the kind of indiscriminate compliance that makes the real obligations harder to find. The
gating uses the same locale resolution as §16.9, so there is one source of truth for what locale
the page is in.

Launching `de` without the Impressum is a launch blocker, and it is recorded as such in
[35-implementation-roadmap.md](35-implementation-roadmap.md). Note also E11's recommendation that
`de` and `pl` launch **wool-only** — sheepskin and leather face EU species-declaration paperwork
— which does not change the footer's structure but does change which categories the Вовна column
renders under those locales.

**The 30-year line and the legal line must not sit adjacent.** The approved copy — «Понад 30
років виробляємо натуральні вовняні вироби **в Карпатах**» — lives in the brand column, at the
top of the footer. The ФОП registration line lives at the bottom. D1 draws this distinction
explicitly: the claim attaches to the manufacturing, never to the legal entity, and the footer is
the one place on the site where the two would otherwise be rendered within a few pixels of each
other.

**The Round-2 substitution of «у Яворові» into this line is withdrawn.**
[00-client-decisions-3.md](00-client-decisions-3.md) F6: «Ні, напиши краще "в Карпатах".» The
client-approved copy from [00-client-decisions.md](00-client-decisions.md) D1 stands unchanged
and is rendered verbatim, in every locale, on every page.

That is not a retreat from specificity, and this footer is the clearest illustration of why. The
same screen carries both words, forty pixels apart, doing different jobs:

| Column | Word | Job |
|---|---|---|
| Brand, top left | **Карпати** | Tell a visitor who may have landed on a deep page what this business is, in one sentence, with no proper noun to learn |
| Контакти, top right | **Яворів**, in full, with street and postal code | Tell a visitor who has decided to check where exactly to go, and give Google something to match against the Business Profile |

«Карпати» to be understood, «Яворів» to be believed. Neither word is doing the other's work, and
neither is redundant. If the brand column said «у Яворові» the contacts column would be repeating
it; if the contacts column said «в Карпатах» it would be useless to a map.

## 16.11 Surface treatment

The footer uses the **Inverted** surface from [08-design-system.md](08-design-system.md) §8.3:
`forest-900` `#16281F` background, no border, `fleece-100` text at ≈14.6:1 — AAA, and the
strongest contrast pairing in the system ([09-color-palette.md](09-color-palette.md) §9.5).

| Element | Token |
|---|---|
| Background | `forest-900` |
| Body text and links | `fleece-100` |
| Column headings | `overline`, `gold-400` — ≈7.1:1 on `forest-900`, AAA. `gold-600` is **not** used here; it is the ramp that fails AA on light surfaces and it is not worth the review risk |
| Rules and dividers | `forest-600` |
| Input background | `forest-950`, 1 px `forest-600` border, `fleece-100` text |
| Focus ring | 2 px `--accent` at 2 px offset, verified against `forest-900` |

§8.3 permits at most two inverted sections per page. The footer is always one of them, so a page
may contain **at most one further** inverted section above it. That constraint belongs to the
page specs, and it is stated here because the footer is the one that is always present and
therefore the one that must be budgeted around.

Vertical rhythm: `--section-y-md` above the columns, `space-10` between column groups,
`space-6` inside a column's link stack ([11-spacing-system.md](11-spacing-system.md) §11.2).
Link hit areas are 44 px tall via padding, not line-height inflation (§11.7).

## 16.12 The sheep mark

[01-brand-strategy.md](01-brand-strategy.md) §1.7 names the footer as one of the mascot's
permitted homes, and [00-client-decisions.md](00-client-decisions.md) D2 promotes the
sheep/shepherd identity from a weighed risk to the brand core — «Вівчарик» means *little
shepherd*.

| Property | Value |
|---|---|
| Placement | Bottom-right of the legal row, optically aligned to the baseline |
| Size | 40 px at `lg`+, 32 px below |
| Style | Single-weight line drawing, no fill, `fleece-100` on `forest-900` — one colour, per §1.7 |
| Motion | **Static on load.** No entrance animation, no idle, no cursor tracking |
| Interaction | One easter egg: after 60 s of no input *and* the footer in view, the mark adopts the sleep pose, `spring.sheep`, disabled under `prefers-reduced-motion` and on coarse pointers |
| Semantics | `aria-hidden="true"` — it carries no information a screen-reader user needs |

The restraint is the point. §1.7's resolution is that the mascot is a maker's mark rather than a
character, and a maker's mark that waves at you is a character. The footer earns the mark because
it is the end of the page — the equivalent of a signature on the back of the object — and the
sleep state rewards a second visit without demanding a first.

The mascot is absent from the PDP, cart, checkout and wholesale page (§1.7). The footer renders
on those pages too, and this is a deliberate exception: the footer mark is static and
below-the-fold, so it does not intrude on a trust-critical surface the way an in-page mascot
would. If usability testing (R4) contradicts this, the fix is to suppress the mark on those four
routes, which is a one-line change.

## 16.13 Accessibility and performance

- `<footer role="contentinfo">` appears once per page. The link columns are inside
  `<nav aria-label="Додаткова навігація">`; the NAP block is an `<address>`.
- Column headings are real `<h2>` elements, visually styled as `overline`. Visual size is
  decoupled from semantic level ([10-typography.md](10-typography.md) §10.8), and the page's
  heading outline must remain gapless with the footer included.
- Every link is reachable and visible on focus, including inside collapsed mobile accordions —
  collapsed panels use `hidden`, so their links leave the tab order entirely rather than becoming
  invisible focus traps.
- Contrast is verified for `gold-400`, `fleece-100` and the input border against `forest-900`.
- The footer is server-rendered and static. No client JavaScript except the mobile accordions and
  the newsletter submission, both of which degrade to a working page without it: the accordions
  render expanded when JavaScript has not loaded, and the newsletter form posts normally.
- No images. The sheep mark and all glyphs are inline SVG, so the footer costs zero additional
  network requests.

## 16.14 Open items

### Resolved in Round 2

| Token / question | Resolution | Reference |
|---|---|---|
| `{{LEGAL_ENTITY_NAME}}` | **ФОП Гондурак Любов Юріївна** | E1, §16.10 |
| `{{FACTORY_ADDRESS}}` | **вул. Петруші, с. Яворів, Косівський район, Івано-Франківська область** — not Вербовець | E2, §16.5 |
| `{{POSTAL_CODE}}` | **78644** | E2 |
| Phone numbers | **+380 67 997 34 50** (Іван), **+380 67 960 47 69** (Любов) | E3, §16.5 |
| Opening hours | **Variable. Never published.** One sentence + both phones + a link to the Google Business Profile | E3, §16.5 |
| `{{INSTAGRAM}}`, Facebook, YouTube | **No accounts exist. The social row is deleted**, not deferred | E3, §16.7 |
| `{{PSP}}` | **WayForPay.** Which marks render still depends on which methods go live | E10, §16.6 |
| `{{PARTNER_NAMES}}` | **Never rendered.** Partners cannot be named; the link description uses region only | E7 |
| Account / login links | **None, permanently.** Replaced by the order-tracking lookup | E12, §16.4b |

### Resolved in Round 3

| Token / question | Resolution | Reference |
|---|---|---|
| Nature of the address | **Shop and production floor together.** The NAP block leads with «Магазин і виробництво в одному місці»; «самовивіз» is retired from the delivery band in favour of «Магазин у Яворові» | F2, §16.5, §16.6 |
| Public contact address | **`info@vivcharyk.shop`** ([00-client-decisions-8.md](00-client-decisions-8.md) §L1, §L2). The Gmail is the Owner's login and never published | F5, §16.5 |
| Brand-column 30-year line | **«в Карпатах», verbatim.** The Round-2 «у Яворові» substitution is withdrawn. Яворів stays in the contacts column, where it is required | F6, §16.3, §16.10 |
| Who pays shipping and customs | **Buyer, every destination** — effectively DAP. International is quoted per order, never calculated; free shipping is `uk`-only and never appears in the sitewide delivery band | F4, §16.4, §16.6 |
| `{{LEGAL_ID}}` status | **Exists, pending delivery.** No longer a general blocker; it blocks WayForPay, the offer contract and the German Impressum only | F1, §16.10 |
| Partner brand | **Вівчарик, both origins.** `manufacturer` omitted for `PARTNER_MANUFACTURE`, never set to Вівчарик. No footer consequence beyond the existing ban on partner promotion (§16.2) | F3 |

### Resolved in Rounds 4 and 5

| Token / question | Resolution | Reference |
|---|---|---|
| Phone order in the NAP | **Іван first, Любов second, both named.** Now a ruling rather than an editorial choice. `LocalBusiness.telephone` carries Іван **only**; Любов goes in `contactPoint` | G1, §16.5 |
| Which name appears on the legal line | **ФОП Гондурак Любов Юріївна**, unchanged — and deliberately different from the contacts column. The split is a rule, not an inconsistency to reconcile | G1, E1, §16.5, §16.10 |
| How the review page gets traffic at launch | **A business card already ships in every parcel.** Short URL `{{DOMAIN}}/v` plus a QR code, reaching the counter-sale customer who has no order number. Reviews arriving this way stay `isVerifiedPurchase = false` | G4, §16.4c |
| The `/v` route | **Reserved now**, before slug sign-off, so it cannot collide with a locale prefix or a category slug | G4, §16.4c |
| Third payment mark | **«Наложений платіж з оглядом», `uk` only.** «Готівка при отриманні» is withdrawn — it named the timing and discarded the inspection right, which is the part that sells | H1.2, §16.6 |
| Whether the footer states the return-shipping deposit | **No.** A deposit without its arithmetic reads as a fee. It belongs at checkout with real numbers, and on `/oplata-i-dostavka/` in general terms | H1.3, §16.4, §16.6 |
| Whether the workshop tour appears in the footer | **No**, and this is a decision rather than an omission. The invitation and its «зателефонуйте заздалегідь» caveat ship together or not at all, and the contacts column cannot afford both | G3, §16.5 |

### Still open

| Token / question | Blocks | Reference |
|---|---|---|
| `{{LEGAL_ID}}` — delivery of the supplied value | The German Impressum, the offer contract, WayForPay onboarding. **Not** the footer's legal line, which degrades gracefully, and not the `pl` locale, which is covered by the entity name | F1, §16.10 |
| `{{BRANDED_EMAIL}}` | The NAP block and the Impressum. An interim address exists, so this is an **upgrade, not a creation** — but transactional mail cannot be sent from `@gmail.com` under any configuration, which makes it a Phase 1 blocker on the checkout rather than a polish item | F5, §16.5 |
| `{{TRANSACTIONAL_FROM}}` | Order confirmations, shipping notices and newsletter double opt-in. Requires SPF, DKIM and DMARC on `{{DOMAIN}}` | F5, §16.5, §16.8 |
| `{{DOMAIN}}` | Slugs, canonical URLs, the branded email, and — newly — email authentication, which promotes this from a naming decision to a checkout dependency | E9, F5 |
| Google Business Profile primary category | Whether the profile carries retail attributes as well as manufacturing ones. Affects which queries surface the block in §16.5 | F2, F7 item 3 |
| Google Business Profile verification | The NAP must be confirmed byte-for-byte against the live profile before the footer ships | E4, §16.5 |
| Which number carries Viber | Whether a Viber control renders at all | §16.5 |
| `{{FREE_SHIPPING_THRESHOLD}}` | The delivery page and any footer mention | [00-assumptions.md](00-assumptions.md) C7 |
| German Impressum page | `de` launch blocker | §16.10 |
| EU withdrawal page + model form | `de` and `pl` launch blocker, newly binding now that those locales sell | E11, §16.10 |
| Whether an Instagram account is created before launch | Whether the §16.7 reserve block ever renders | E13.9 |
