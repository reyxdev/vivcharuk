# 31 — Analytics Architecture

> **Round 16:** ONEKNIGHT ok.js (optional, later) loads only with `ONEKNIGHT_PUBLIC_KEY` and after analytics consent; templates carry its `data-ok-*` attributes from the start; the privacy policy must name ONEKNIGHT before it is switched on — [00-client-decisions-16.md](00-client-decisions-16.md) O2 #4.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - **Google Analytics chosen** (part 7), loaded only after «Прийняти всі» through Consent Mode v2. Buyer-source reporting in the admin uses the attribution stored on each order, not the GA API.

Governed by [00-client-decisions-5.md](00-client-decisions-5.md) first,
[00-client-decisions-4.md](00-client-decisions-4.md) second,
[00-client-decisions-3.md](00-client-decisions-3.md) third,
[00-client-decisions-2.md](00-client-decisions-2.md) fourth and
[00-client-decisions.md](00-client-decisions.md) fifth. Nine facts shape this document:

1. The site is a **cold start** with near-zero organic traffic for two quarters (D2), which means
   early analytics must be readable at low volume rather than tuned for statistical power.
2. The catalogue mixes **own-manufacture and partner goods** (D3), which must be a dimension on
   every commerce event or the single most important merchandising question — *what is the margin
   mix* — cannot be answered. Round 3 confirms both are sold under the Вівчарик brand
   ([00-client-decisions-3.md](00-client-decisions-3.md) F3), which changes nothing in the
   taxonomy: `product_origin` was never a brand dimension and remains a manufacturing one.
3. **Guest checkout is permanent. There are no customer accounts and there never will be**
   ([00-client-decisions-2.md](00-client-decisions-2.md) E12). Every user-ID, logged-in-state and
   cross-device dimension is therefore removed from the taxonomy rather than deferred. Identity in
   this system is **per-order and per-device only**, and §31.11's attribution limits are
   structural rather than temporary.
4. **There is no social media** ([00-client-decisions-2.md](00-client-decisions-2.md) E3). The
   launch-channel branch of the KPI tree (§31.7) previously assumed one; it no longer does.
5. **The Яворів site is a shop as well as a factory**
   ([00-client-decisions-3.md](00-client-decisions-3.md) F2). This creates a demand channel that is
   entirely outside the measurement system — a person walks in, looks, and buys there or online
   later from a different device. It is a **launch channel independent of search**, which makes it
   commercially important and analytically near-invisible at the same time. **§31.13 is new** and
   deals with that honestly, including the parts that cannot be measured at all.
6. **International orders are quoted, not calculated**
   ([00-client-decisions-3.md](00-client-decisions-3.md) F4, confirmed by
   [00-client-decisions-5.md](00-client-decisions-5.md) H4 — all carriers, chosen per order). The
   enquiry-then-invoice model means an international order is a multi-day workflow rather than a
   checkout completion, so it cannot sit in the same funnel as a domestic order without corrupting
   both. §31.4 and §31.7 separate them.
7. **A Ukrainian COD order's money arrives in two parts, at two different times**
   ([00-client-decisions-5.md](00-client-decisions-5.md) H1.3). The buyer pays forward shipping and
   a return-shipping deposit online at checkout; the goods are paid at the branch on acceptance,
   less the deposit credited against them. This breaks the single implicit assumption underneath
   every standard e-commerce `purchase` event — that one order produces one captured amount at one
   moment — and §31.5 is rewritten around it. It is **Ukraine-only**: the mechanic is forbidden for
   `en`, `pl` and `de` under the EU right of withdrawal, so locale is not a cosmetic dimension on
   these events.
8. **Made-to-order items are prepaid in full and take 14 days of production before dispatch**
   ([00-client-decisions-5.md](00-client-decisions-5.md) H1.1,
   [00-client-decisions-4.md](00-client-decisions-4.md) G2). A made-to-order line is therefore a
   different commercial object from a stocked one — different payment methods available, different
   fulfilment clock, different cancellation exposure — and `is_made_to_order` stops being a
   descriptive flag and becomes a segmenting dimension.
9. **The workshop can be toured, accompanied by the owner, arranged by phone**
   ([00-client-decisions-4.md](00-client-decisions-4.md) G3). This is the project's strongest trust
   asset and it is **very close to unmeasurable**. §31.13 states honestly what can and cannot be
   known about it, and explains why the two instruments that would close the gap are forbidden by
   the same ruling that created the asset.

## 31.1 Measurement strategy

Analytics exists to answer questions someone will act on. Every metric below traces to a decision.
A metric that changes nothing is a dashboard ornament and is deleted.

The strategy derives directly from the success criteria in
[01-brand-strategy.md](01-brand-strategy.md) §1.10.

| §1.10 criterion | Target | Instrumented by | Decision it drives |
|---|---|---|---|
| Homepage → production or about entry rate | >18% | `select_content` on provenance CTAs + path analysis | Whether the provenance story is placed where it is seen, or needs to move up the homepage |
| PDP scroll depth to the origin block | >55% | `provenance_view` (§31.4) | Whether the origin block is too far down the PDP |
| Wholesale qualified enquiries | `{{WHOLESALE_LEADS_TARGET}}`/month | `generate_lead` with `lead_kind` | Whether the wholesale page qualifies or merely collects |
| Checkout completion | >65% | Funnel from `begin_checkout` to `purchase` | Which checkout step loses people. Every checkout is a guest checkout (E12), so this is the whole population, not a segment |
| Returning visitor share by month 6 | >25% | Returning-device segment, from the first-party analytics cookie | Whether the brand is remembered or only transacted with. **Device-level, not person-level** — with no accounts there is no way to recognise a returning *person*, and the metric is labelled accordingly wherever it appears |
| AOV vs category median | +40% | `purchase.value` | Whether premium positioning holds under real traffic |

Four principles:

1. **Instrument the brand thesis, not just the funnel.** Standard e-commerce analytics would
   measure everything except the one thing this brand is betting on — that showing production
   sells the product. §31.4's brand-specific events exist for that reason.
2. **Server-side is the system of record for money.** Client-side purchase tracking is unreliable
   by design (§31.5). Revenue is never read from an analytics tool.
3. **Nothing fires before consent in the EU locales** (§31.3).
4. **At cold-start volumes, read direction, not significance.** Twelve checkouts a month cannot
   support an A/B test. Saying so up front prevents a quarter of decisions made on noise.
5. **Identity is per-order and per-device.** There is no user ID, no logged-in state, and no way
   to join a phone session to a desktop purchase ([00-client-decisions-2.md](00-client-decisions-2.md)
   E12). This is a permanent property of the design, not a launch limitation, and every report
   that implies a person-level view is wrong. The upside is that it also removes an entire class
   of personal data from the analytics surface — see §31.3 and
   [32-security-architecture.md](32-security-architecture.md) §32.15.

---

## 31.2 Tooling

### The decision: both, with clearly separated jobs

| Tool | Role | Why |
|---|---|---|
| **Plausible** (self-hosted or EU-hosted) | Primary traffic analytics for all locales | Cookieless, no personal data, EU-hosted, ~1 KB script, works **before consent** in every locale. Provides the one number that must never have a gap: how many people came and where from |
| **GA4** | E-commerce funnel, enhanced measurement, Search Console link, Google Ads link | Consent-gated. Free, ubiquitous, and the only tool that joins Search Console and Ads data to on-site behaviour |
| **First-party event store** (Postgres) | Money, leads, search queries, admin metrics | The system of record. Never sampled, never blocked, never subject to a vendor's retention policy |
| **Sentry** | Errors and exceptions | §31.10 |
| **`web-vitals` → first-party endpoint** | Core Web Vitals field data | §31.9 |

### Why not GA4 alone

GA4 alone produces a **systematically incomplete picture in exactly the two locales with the most
demanding legal regime**. In `de` and `pl`, GA4 requires consent; consent rates for analytics
cookies in German-speaking markets are commonly well under half. Half the German traffic would be
invisible, and the half that is visible is not a random sample — privacy-conscious users are
systematically excluded. Decisions about the German market would then be made on a biased sample
without anyone noticing.

Ad-blocker attrition compounds it. GA4 is blocked far more often than a first-party cookieless
script. On a site targeting a technically-literate diaspora audience, that is not a rounding error.

### Why not a privacy-first tool alone

Plausible cannot do what GA4 does: no Search Console integration, no Google Ads conversion import,
a much thinner e-commerce funnel model, and no path/exploration analysis. For a store that will
eventually spend on Google Ads, dropping GA4 means flying blind on paid.

### Why not self-hosted GA alternatives as the only stack

Matomo self-hosted is a credible single-tool answer and was considered. It is rejected on
operational cost: it is a database-backed application that needs hosting, upgrades, and tuning,
and this team is one owner, one or two managers and a content person
([00-assumptions.md](00-assumptions.md) E2). Adding an application to operate is a real cost that
a small team pays every month.

### GDPR reasoning for `de` and `pl`

| Question | Position |
|---|---|
| Do `de`/`pl` visitors fall under GDPR? | Yes. The site offers goods to EU data subjects, so GDPR applies regardless of where the business or the servers sit. |
| Does Plausible need consent? | No cookies, no persistent identifier, no personal data retained. It runs pre-consent. The DPIA position is documented, not assumed. |
| Does GA4 need consent? | Yes. It sets identifiers and transfers data to Google. Prior, explicit, opt-in consent under ePrivacy + GDPR. |
| Is US transfer an issue? | Google is certified under the EU–US Data Privacy Framework, which is the current legal basis. It has been invalidated twice before. Plausible-as-primary is partly a hedge against a third invalidation. |
| `uk` visitors? | Ukraine's data-protection law is less prescriptive, but the site applies the **EU standard to all locales**. Two consent regimes in one codebase is a defect generator, and the stricter one is a reasonable default. |
| Does permanent guest checkout change the position? | It **shrinks it materially**. With no accounts ([00-client-decisions-2.md](00-client-decisions-2.md) E12) there is no customer password, no profile, no saved-payment record, no order history behind a login, and no persistent cross-session identifier to disclose in a privacy policy or export in a DSAR. The personal data this system holds is order data plus a device cookie. That is a smaller and more defensible processing inventory, and it is worth saying to the client as a benefit of a decision made for other reasons. |
| Do `de`/`pl` sales change it? | Yes — they make GDPR unambiguously applicable rather than applicable-by-caution, because [00-client-decisions-2.md](00-client-decisions-2.md) E11 makes those locales transactional. See [32-security-architecture.md](32-security-architecture.md) §32.15. |

---

## 31.3 Consent architecture

### What fires before consent

| Runs pre-consent | Reason |
|---|---|
| Plausible pageview | Cookieless, no personal data |
| Core Web Vitals beacon (§31.9) | Anonymous, aggregated, no identifier |
| Sentry error capture, PII-scrubbed | Legitimate interest: service integrity. No IP retention, no session replay |
| Server-side request logging | Legitimate interest: security and abuse |
| Strictly necessary cookies — cart token, CSRF token, locale | Exempt under ePrivacy |
| Device-local wishlist in `localStorage` | No server record, no identifier, never transmitted ([00-client-decisions-2.md](00-client-decisions-2.md) E12) |

The **address-prefill cookie** is a separate case and is *not* exempt. E12 replaces the saved-address
feature with a first-party cookie that prefills the checkout on the same device. That cookie holds
name, phone and delivery address — personal data by any reading — so it is placed under the
**functionality** consent category, not under strictly-necessary, it is set only after the
customer's first completed order, and the checkout states plainly that it is device-local:
«Збережено на цьому пристрої». Classifying a convenience cookie containing a postal address as
strictly necessary because the feature is convenient is the most common consent misclassification
there is.

### What does not

GA4 (any hit), Google Ads and Meta pixels, any marketing tag, any A/B tooling, any session replay,
any cross-site identifier.

### Implementation

- **Google Consent Mode v2**, default-denied, is initialised **before** the GA4 tag loads:

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
```

Consent Mode matters for the EU locales for a specific reason: denied-state GA4 sends cookieless
pings that let Google model conversions without storing an identifier. Without it, a non-consenting
visitor is simply absent, and Google Ads bidding degrades with no signal at all. It is not a
loophole around consent — no identifier is stored either way — and it is the difference between a
modelled number and a missing one.

- **The banner does not block content, does not shift layout, and does not use a dark pattern.**
  Accept and Reject are the same size, the same weight, the same prominence. A rejected banner does
  not reappear for 180 days. Space is reserved in the layout so the banner cannot cost CLS
  ([29-seo-architecture.md](29-seo-architecture.md) §29.14).
- **Granular categories:** necessary (always on), analytics, marketing. No pre-ticked boxes.
- **Withdrawal is as easy as granting**, via a persistent footer link, and revocation immediately
  clears the relevant cookies.
- **Consent is stored as a first-party cookie** with a version stamp. A change to the tag list
  bumps the version and re-asks. Re-using stale consent for a new purpose is a violation.
- **The consent UI is dynamically imported after `requestIdleCallback`**, so it never competes with
  the LCP.

---

## 31.4 Event taxonomy

GA4 naming conventions are used throughout, so the recommended e-commerce reports work without
remapping. Every event carries these parameters unless noted:

| Parameter | Values |
|---|---|
| `locale` | `uk` \| `en` \| `pl` \| `de` |
| `currency` | `UAH` \| `EUR` \| `PLN` |
| `page_type` | `home` \| `category` \| `pdp` \| `cart` \| `checkout` \| `editorial` \| `wholesale` \| `production` |
| `device_class` | `mobile` \| `tablet` \| `desktop` |

Every item in an `items[]` array carries `product_origin` (`own` \| `partner`). This is the D3
requirement made operational: without it, nobody can answer what share of revenue comes from own
manufacture, which is the question that determines whether the brand thesis is commercially real.

**`partner_name` is removed from the taxonomy.** [00-client-decisions-2.md](00-client-decisions-2.md)
E7 forbids naming partner manufacturers, and a parameter that must never be populated is a
parameter that will eventually be populated by someone who does not know why it is empty. Partner
attribution in analytics is `product_origin: partner` plus `partner_region` where known
(`Косівщина`, `Гуцульщина`), which is enough to answer every merchandising question the split
exists for. Nothing in reporting needs a supplier name that the site is not permitted to publish.

### What is deliberately absent: identity

There is **no `user_id`, no `is_logged_in`, no `customer_type`, no account-state dimension of any
kind** on any event ([00-client-decisions-2.md](00-client-decisions-2.md) E12). Guest checkout is
permanent, so these fields would be constants — and a constant dimension is worse than a missing
one, because it occupies a slot, appears in every report, and invites someone to segment on it.

| Removed | Why |
|---|---|
| `user_id` (GA4 User-ID feature) | Requires an authenticated identity. There is none, and there never will be |
| `is_guest` on `begin_checkout` and `purchase` | Always `true`. A field with one value carries zero information |
| Logged-in vs guest funnel comparison | Not a comparison that exists |
| Cross-device user journeys | Structurally unavailable (§31.11) |

What *is* retained: `client_id` (a first-party device identifier, used to join the server-side
`purchase` back to the client-side funnel — §31.5) and `transaction_id` (`Order.number`). Both are
per-device or per-order. Neither identifies a person across visits, and the distinction is stated
in the reporting template rather than left to be inferred.

`Customer` still exists in the schema as an **order-derived record** rather than an authenticated
identity ([00-client-decisions-2.md](00-client-decisions-2.md) E12), so repeat-buyer analysis by
email is possible *retrospectively, in the database*, for support and for the repeat-rate KPI. It
is a Postgres query, not an analytics dimension, and it cannot see anyone who has not yet ordered.

### E-commerce funnel

| Event | Trigger | Key parameters |
|---|---|---|
| `view_item_list` | A product grid enters the viewport (50%, debounced 500 ms) | `item_list_id`, `item_list_name`, `items[]`, `filters_applied[]`, `sort_order`, `result_count` |
| `view_item` | PDP render | `items[]` (with `price`, `item_category`, `product_origin`), `availability`, `is_unique_piece`, `is_made_to_order` |
| `select_item` | Click on a product card | `item_list_id`, `index`, `items[]` |
| `add_to_cart` | Successful cart mutation (server-confirmed, not on click) | `items[]` with `quantity`, `variant_id`, `value`, `add_source` (`pdp` \| `quick_add` \| `cart_upsell` \| `wishlist`). `wishlist` is a `localStorage`, device-local list (E12) — there is no server-side wishlist and no merge-on-login event |
| `remove_from_cart` | Removal or decrement | `items[]`, `value`, `remove_source` |
| `view_cart` | Cart drawer opened or cart page rendered | `items[]`, `value`, `item_count` |
| `begin_checkout` | Checkout step 1 rendered | `items[]`, `value`, `coupon` |
| `add_shipping_info` | Shipping method confirmed | `shipping_tier` (`np_branch` \| `np_courier` \| `ukrposhta` \| `pickup` \| `international`), `shipping_cost`, `value` |
| `add_payment_info` | Payment method confirmed | `payment_type` (`card_online` \| `cod` \| `bank_transfer`), `value`, **`cod_available`** (bool) and **`cod_suppressed_reason`** (`made_to_order` \| `international` \| `null`). The suppression reason is the point: COD disappearing from a cart is a **derived server-side outcome** ([00-client-decisions-5.md](00-client-decisions-5.md) H1.1), and without the reason recorded, a drop in COD share is indistinguishable from a bug |
| `payment_method_unavailable` | The COD option is absent from the server's response for a cart that would otherwise qualify | `reason` (`made_to_order` \| `international`), `cart_value`, `locale` | **New.** H1.1 removes COD server-side for made-to-order carts. This event is how the business learns what that restriction costs: if carts containing a custom-size line abandon at materially higher rates at this step, the disclosure moved too late (see `custom_size_terms_view`) or the restriction itself needs revisiting |
| `deposit_disclosure_view` | The return-shipping deposit block enters the viewport on the COD path | `forward_minor`, `return_minor`, `locale` | **New, and Ukraine-only** ([00-client-decisions-5.md](00-client-decisions-5.md) H1.3). Two jobs: it is the leading indicator on the site's most misreadable rule, and its **absence on a `de`, `pl` or `en` session is a compliance alarm** — the deposit is forbidden in those locales, so this event firing there means a Ukraine-only rule has leaked into an EU checkout |
| `purchase` | **Server-side on payment confirmation** (§31.5) | `transaction_id` (`Order.number`), `value`, `tax`, `shipping`, `coupon`, `items[]`, `payment_type`, `shipping_tier`, `own_manufacture_value`, `partner_value`, **`is_made_to_order_order`** (bool), **`deposit_minor`**, **`capture_stage`** (`full` \| `deposit_only` \| `cod_settlement`) |
| `refund` | Server-side on refund webhook or admin refund | `transaction_id`, `value`, `items[]` for partial refunds, **`refund_reason`** (`cod_refused` \| `return` \| `cancellation` \| `other`) |

Three deliberate deviations from the default implementation:

1. **`add_to_cart` fires on server confirmation**, not on click. A click that fails on an
   out-of-stock one-of-one item ([00-assumptions.md](00-assumptions.md) B4) is not an add to cart,
   and counting it inflates the top of the funnel and hides a stock bug.
2. **`purchase` is server-side only.** §31.5.
3. **`own_manufacture_value` / `partner_value`** split the order total by origin at purchase time,
   so the revenue mix is a first-class metric rather than a query someone has to remember to run.
4. **`capture_stage` exists because a COD order does not have one revenue moment.** See §31.5. A
   taxonomy that assumes it does will either double-count the deposit or lose it, and both errors
   are silent.

### Brand-specific events

These are where the brand thesis becomes measurable. Standard e-commerce tracking would miss all
of them.

| Event | Trigger | Parameters | Question answered |
|---|---|---|---|
| `production_depth` | Production page scroll passes each named stage anchor | `stage_key`, `stage_index`, `depth_pct`, `time_on_stage_ms` | Do people actually read the production story, and where do they stop? Feeds §1.10's 18% target |
| `provenance_view` | PDP origin block ≥50% visible for ≥1 s | `product_id`, `product_origin`, `scroll_depth_pct`, `time_to_view_ms` | Is provenance reaching the purchase decision (§1.10, >55%)? |
| `factory_video_play` | Video play starts | `video_id`, `placement` (`home_hero` \| `production` \| `pdp`), `autoplay` (bool) | Is rank-1 trust evidence ([01-brand-strategy.md](01-brand-strategy.md) §1.8) being consumed? |
| `factory_video_progress` | 25 / 50 / 75 / 100% | `video_id`, `percent` | Completion, not just starts. A 4% completion rate means the video is too long or wrongly placed |
| `generate_lead` | Wholesale/lead form submitted successfully | `lead_kind` (`wholesale` \| `private_label` \| `dropship` \| `press` \| `general`), `business_type`, `estimated_volume`, `country`, `has_product_interest` | Which B2B path actually converts |
| `lead_form_start` | First field focus | `lead_kind`, `source_path` | Form abandonment rate, separately from page bounce |
| `dropship_enquiry` | Dropshipping path selected in the wholesale form | `country`, `estimated_volume` | A distinct offer the brief never mentioned; needs its own number |
| `care_guide_view` | Care article or PDP care block viewed ≥10 s | `article_slug`, `from_pdp` (bool), `product_category` | Whether the care content answers anxiety A2 ([02-ux-research.md](02-ux-research.md) §2.4) pre- or post-purchase |
| `search` | Site search submitted | `search_term`, `result_count`, `locale` | — |
| `search_zero_results` | Search returns 0 | `search_term`, `locale`, `suggested_shown` | **The highest-signal merchandising input the store has.** §31.8 |
| `search_select` | A search result is clicked | `search_term`, `result_position`, `product_id` | Whether search ranks correctly |
| `filter_apply` | A facet is applied | `facet_key`, `facet_value`, `category_id`, `result_count`, `facet_count_total` | Which facets earn their place; which are never touched and can be removed |
| `filter_zero_results` | A facet combination returns 0 | `filters_applied[]`, `category_id` | An IA or stock problem, not a user problem |
| `origin_filter_apply` | The own-manufacture facet is applied | `value`, `category_id`, `is_wholesale_session` | Does anyone actually care about the D3 distinction? A direct test of a strategic assumption |
| `locale_switch` | Locale changed | `from_locale`, `to_locale`, `page_type`, `trigger` (`banner` \| `footer` \| `header`) | Whether the locale detection banner is helping or fighting people |
| `size_guide_open` | Size guide opened | `product_id`, `category_id` | Sizing friction, a leading indicator of returns |
| `spec_table_expand` | Rows 4+ of the spec table expanded | `product_id` | Whether the first three visible rows are the right three |
| `contact_intent` | Phone, Viber, email or map click | `channel`, `page_type`, **`person`** (`ivan` \| `lyubov`) | Offline conversion, which matters disproportionately at cold start (D2). The `person` dimension exists because [00-client-decisions-4.md](00-client-decisions-4.md) G1 makes Іван the primary number and Любов the fallback: **a fallback carrying a significant share of taps means the primary is not being answered**, which is an operational finding no other instrument surfaces. Two numbers rendered as one undifferentiated `phone` channel would hide it. With the Google Business Profile as the primary channel and no social presence ([00-client-decisions-2.md](00-client-decisions-2.md) E3, E4), and with hours deliberately absent from the site so visitors are told to phone ahead ([29-seo-architecture.md](29-seo-architecture.md) §29.16), a phone click is a **designed** outcome here rather than a leak. It is the closest thing to a conversion event the offline path has |
| `visit_intent` | Click on directions, the embedded map, the address, or the «як доїхати» block | `channel` (`directions` \| `map` \| `address_copy` \| `gbp_link`), `page_type` | **New in round 3** ([00-client-decisions-3.md](00-client-decisions-3.md) F2). The shop is a real destination, so a directions click is a distinct intent from a phone click and should not be averaged into it. §31.13 |
| `tour_intent` | The `tel:` link **inside a workshop-tour block** is activated — [20-production-page-specification.md](20-production-page-specification.md) §20.11, [21-about-page-specification.md](21-about-page-specification.md) §21.9, [19-wholesale-page-specification.md](19-wholesale-page-specification.md) §19.7 and §19.17 | `page_type`, `placement`, `locale` | **New in round 4** ([00-client-decisions-4.md](00-client-decisions-4.md) G3). Kept separate from `contact_intent` and `visit_intent` because the three express different questions — "I have a question", "I want to come to the shop", "I want to see the floor". Merging them makes all three unreadable. **This event is the ceiling of what is knowable here**; see §31.13 |
| `custom_size_select` | «Свій розмір» chosen in the PDP size selector | `product_id`, `category_id` | **New in round 5** ([00-client-decisions-5.md](00-client-decisions-5.md) H3b). The head of a funnel that did not previously exist. Because the toggle is per-product, this also measures *which* products buyers wish were available to measure — a merchandising input on which products should carry `allowsCustomSize` next |
| `custom_size_terms_view` | The made-to-order terms block — 14 days, full prepayment, no COD — is rendered in the buy box after a custom size is selected | `product_id` | The three facts must land at size selection, not at checkout ([00-client-decisions-4.md](00-client-decisions-4.md) G2, H1.1). This event is the evidence they did, and the gap between it and `add_to_cart` is the honest measure of how costly the terms are |
| `mixed_cart_split_shown` | The cart contains both a stocked and a made-to-order line and the split-into-two-orders explanation is displayed | `stocked_value`, `made_to_order_value` | H3b makes the mixed cart the **expected** case, not an edge case. Whether the split is understood — accepted, versus one of the two lines being removed immediately afterwards — is the question this answers |
| `card_landing_view` | The parcel card's short URL resolves | `source` (`qr` \| `typed`), `locale` | **New in round 4** ([00-client-decisions-4.md](00-client-decisions-4.md) G4). The `qr` / `typed` split is the one genuinely useful thing this event produces: it settles empirically whether the 25–75 audience scans or types, and therefore whether both printings continue to earn their space on the card. It does **not** attribute a sale — see §31.13 |
| `newsletter_subscribe` | Double opt-in **confirmed**, not submitted | `locale`, `source` | The `de` locale requires confirmed opt-in ([25-database-schema.md](25-database-schema.md) §25.9) |
| `intl_quote_request` | International enquiry submitted ([00-client-decisions-3.md](00-client-decisions-3.md) F4) | `country`, `items[]`, `value_goods`, `locale` | The head of the international funnel. It is **not** `begin_checkout` — no price is known yet |
| `intl_quote_sent` | Server-side, when the admin sends the quote | `quote_id`, `hours_to_quote`, `shipping_quoted`, `country` | Response latency, which is the variable the client's team actually controls (§31.13) |
| `intl_quote_paid` | Server-side on payment of a quoted order | `quote_id`, `hours_quote_to_pay`, `value` | Quote → payment conversion. A quote that is never paid is the international model's characteristic failure |
| `duty_disclosure_view` | The customs/duties disclosure enters the viewport on the international path | `country`, `locale` | Evidence that the pre-payment disclosure was displayed. This is a **compliance artefact**, not a marketing metric ([32-security-architecture.md](32-security-architecture.md) §32.15) |

**On the international events.** [00-client-decisions-3.md](00-client-decisions-3.md) F4 replaces
international checkout with enquiry-then-invoice, and that is a different funnel with a different
shape: a request, a human response, a wait, a payment. Modelling it as `begin_checkout` →
`purchase` would report an international checkout-completion rate that is really a measure of how
fast the client answers email, and it would drag the domestic completion rate — §1.10's >65% target
— down with it. The two funnels are reported separately and never summed into one conversion rate.

`hours_to_quote` is the number that matters most in that set, and it is deliberately the first
metric named. The enquiry-then-invoice model puts a human in the critical path of every
international sale, so the sale's probability decays with the client's response time. That is an
operational capacity question rather than a website question
([35-implementation-roadmap.md](35-implementation-roadmap.md) §35.11), and this event is what turns
it from an opinion into a measurement.

---

## 31.5 Server-side purchase tracking

**Client-side purchase tracking loses 10–30% of transactions**, and the loss is not random. Ad
blockers, a closed tab before the confirmation page renders, a PSP redirect that lands somewhere
unexpected, a failed network call, a mobile browser suspending a background tab — every one of
these silently drops revenue. A business whose average order is 5,000–15,000 UAH cannot have a
revenue figure that is wrong by a quarter and wrong in an unknown direction.

### The architecture

`{{PSP}}` is **WayForPay** ([00-client-decisions-2.md](00-client-decisions-2.md) E10). The webhook
shape, the acknowledgement response it expects and its retry behaviour are all unverified (E10 V8)
and must be read from WayForPay's current documentation before this path is built. The
architecture below is provider-independent and does not change with the answer; only the parsing
and acknowledgement details do.

```
WayForPay service URL  ──►  /api/webhooks/wayforpay
                        │   signature verified, idempotency key checked
                        │   (32-security-architecture.md §32.10)
                        ▼
                  PaymentTransaction written, Order.paymentStatus = PAID
                        │
          ┌─────────────┼──────────────────────┐
          ▼             ▼                      ▼
   First-party     GA4 Measurement        Internal
   event store       Protocol             notifications
   (system of        (best effort)
    record)
```

Rules:

1. **The first-party write is the system of record.** GA4 is a downstream copy. Revenue reported
   to the client comes from Postgres, never from an analytics UI.
2. **Idempotency.** `PaymentTransaction.idempotencyKey` is unique
   ([25-database-schema.md](25-database-schema.md) §25.5). A replayed webhook cannot double-count.
   PSPs retry; this is not hypothetical.
3. **GA4 Measurement Protocol** sends the `purchase` event server-side with the client's
   `client_id` — captured at `begin_checkout` and stored on the order — so the server-side purchase
   joins the same session as the client-side funnel. Without the `client_id`, every purchase is
   attributed to "direct" and all channel attribution collapses. **No `user_id` is sent**, because
   there is none ([00-client-decisions-2.md](00-client-decisions-2.md) E12); `client_id` is a
   device identifier and the join it produces is a device-level join, which is the ceiling for
   this system.
4. **Client-side `purchase` is not sent.** One event source, no deduplication problem. The
   confirmation page fires `purchase_confirmation_view` instead, purely as a UX metric.
5. **COD orders** emit `purchase` at order confirmation, with `payment_type: cod`, and a `refund`
   if the parcel is refused. COD abuse is a real threat
   ([32-security-architecture.md](32-security-architecture.md) §32.1) and the refusal rate is
   therefore a tracked metric, not an afterthought. **Round 5 makes this rule insufficient on its
   own** — see below.
6. **A daily reconciliation job** compares order count and revenue between Postgres, GA4 and the
   PSP dashboard. Any divergence above 2% raises an alert. Discovering a tracking break three
   months later, from a monthly report, is the normal outcome without this job.
7. **Consent and server-side events.** Server-side sending does not bypass consent. Where marketing
   consent was refused, the purchase is recorded first-party for accounting and sent to GA4 without
   advertising identifiers. Server-side tagging is a reliability measure, not a consent workaround,
   and treating it as one is a compliance failure.

### The COD order has two money moments, and the event model must say which one it is reporting

[00-client-decisions-5.md](00-client-decisions-5.md) H1.3 introduces a mechanic that quietly
invalidates the assumption underneath every off-the-shelf e-commerce measurement plan: **one order,
one captured amount, one moment.** On a Ukrainian COD order with inspection:

```
t0  checkout, online, by card
       forward shipping  +  return shipping deposit        ← money moves. Goods unpaid.
t1  the branch, on inspection
       ACCEPT  → customer pays (goods − deposit) in cash   ← money moves again
                 deposit is consumed as credit
       REFUSE  → nothing further is paid
                 the return leg is already funded
```

Two captures, days apart, with the second conditional on a human decision the site never sees. A
naive implementation picks one of them and is wrong in a specific, silent way:

| Naive choice | What it reports | Why it is wrong |
|---|---|---|
| Fire `purchase` with `value = goods` at t0 | Full revenue on day one | Reports money that has not been paid and may never be. Every refused parcel becomes a refund against revenue that never existed, and the refund rate becomes a fiction |
| Fire `purchase` with `value = deposit + forward` at t0 and nothing after | Shipping revenue only | Loses the entire goods value from the analytics, permanently. Every COD order looks like a 200 UAH sale |
| Fire once at t1 | Correct totals, late | Loses the deposit capture entirely, and produces a funnel in which `begin_checkout` is never followed by anything for days. Channel attribution windows expire in the gap |

**The specified model.** Two events, both server-side, both carrying `capture_stage`:

| Stage | Event | `value` | When |
|---|---|---|---|
| `deposit_only` | `purchase` | forward shipping + return deposit | The WayForPay webhook confirms the checkout card payment |
| `cod_settlement` | `purchase` | goods − `depositAppliedMinor` | Order transitions to `DELIVERED` |
| Refusal | `refund` with `refund_reason: cod_refused` | the `deposit_only` value, or zero if the deposit is retained to fund the return leg — whichever the accounting position is | Order transitions to a refused/returned state |

Three rules make this usable rather than merely correct:

1. **Revenue reporting sums `capture_stage` explicitly, never blindly.** "Revenue" in the admin
   dashboard and the monthly report means goods sold — the `full` and `cod_settlement` stages.
   Shipping and deposit captures are reported on their own line. A dashboard that sums all
   `purchase` events reports a business with suspiciously high order counts and suspiciously low
   average order values, and nobody will work out why.
2. **`depositAppliedMinor` is credited exactly once, on transition to `DELIVERED`**
   ([00-client-decisions-5.md](00-client-decisions-5.md) H1.3). This is stated in the source ruling
   as an invariant requiring a test, and it has a measurement consequence as well as a financial
   one: crediting on `SHIPPED` would emit `cod_settlement` for parcels later refused, and the
   analytics would carry the error even after the finance side was corrected.
3. **The reconciliation job in rule 6 above must reconcile per stage.** Comparing a Postgres total
   against a PSP total will diverge by exactly the cash collected at branches, every day, forever.
   Reconciling `deposit_only` against WayForPay and `cod_settlement` against the carrier's
   remittance file is the only version of that check that can ever be green.

**Locale is a hard filter on all of this.** The deposit mechanic is **Ukraine-only** (H1.3). A
`deposit_only` capture on an `en`, `pl` or `de` order is not an analytics anomaly — it is evidence
that a Ukraine-only rule has reached an EU consumer, which is a legal defect under the Consumer
Rights Directive's unconditional right of withdrawal. **An alert, not a chart.** International
orders stay card-only, with the buyer paying carriage and all customs charges (F4).

---

## 31.6 Dashboards

The client is one owner, one or two managers and a content person
([00-assumptions.md](00-assumptions.md) E2). Nobody will open GA4. **The admin dashboard is the
analytics product** for everyday operation; GA4 and Plausible are analyst tools.

Widget specification, aligned with
[23-admin-panel-architecture.md](23-admin-panel-architecture.md):

| Widget | Content | Source | Audience |
|---|---|---|---|
| Revenue today / 7d / 30d | Value, order count, AOV, vs previous period | Postgres | Owner |
| Revenue by origin | Own manufacture vs partner, value and share | Postgres, D3 split | Owner |
| Orders needing action | `PENDING`, `CONFIRMED`, unpaid past threshold | Postgres | Manager |
| Funnel, 7d | `view_item` → `add_to_cart` → `begin_checkout` → `purchase`, with step drop | Event store | Owner, manager |
| Checkout abandonment by step | Where in the four steps people leave | Event store | Owner |
| **Zero-result searches, 7d** | Query, count, locale, trend | `SearchQueryLog` | Manager, content |
| Top search terms | Query, count, click-through | `SearchQueryLog` | Manager |
| Low stock / sold-out one-of-ones | Variant, days at zero, lost `view_item` count | Postgres | Manager |
| New leads by kind | Wholesale / private label / dropship / press, with age | `Lead` | Owner |
| Lead response time | Median hours to first contact, vs `{{WHOLESALE_RESPONSE_SLA}}` | `Lead` + `AuditLog` | Owner |
| Reviews pending moderation | Count, age of oldest | `Review` | Manager |
| Traffic, 7d | Sessions, sources, top landing pages | Plausible API | Owner |
| Core Web Vitals, field | p75 LCP / INP / CLS by device | §31.9 | Developer |
| Content health | Translation completeness, missing alt text, missing meta, per locale | Postgres | Content |
| Error rate | 4xx/5xx trend, top errors | Sentry API | Developer |

Rules: every widget shows a comparison to the prior period, because an absolute number without a
trend prompts no decision; every widget links to the screen where the underlying thing can be
acted on; and no widget shows a metric nobody owns.

---

## 31.7 The KPI tree

```
REVENUE
├── Traffic
│   ├── Organic search            near zero for 2 quarters (D2) — do not read as failure in month 2
│   ├── Google Business Profile   THE primary early channel (29-seo §29.16) — profile exists (E4),
│   │                             and F2's retail categories widen what it can be found for
│   ├── Direct / offline          existing customer base, phone, print, packaging
│   ├── Parcel card               card_landing_view, split qr / typed (G4). Small, real, and the
│   │                             ONLY instrumented signal the offline channel produces
│   ├── Shop footfall             UNMEASURABLE AS TRAFFIC (F2). Demand created in the Яворів shop
│   │                             that converts online later. Tracked only by the proxies in §31.13
│   │                             and reported as a proxy every time
│   ├── Workshop tours            UNMEASURABLE BEYOND INTENT (G3). tour_intent is the ceiling.
│   │                             Outcome is a paper tally kept by Іван. Named here as a zero-data
│   │                             row so its absence is a decision, not an oversight
│   ├── Referral                  craft directories, Yavoriv museum and plein air, regional press
│   ├── Social                    ZERO. No accounts exist (E3). Tracked as a named zero, not
│   │                             omitted — an absent row reads as "not measured"
│   └── Paid                      paid search only if budgeted; paid social is unavailable
├── Conversion rate               DOMESTIC ONLY — international is a separate funnel, see below
│   ├── Product view rate         sessions reaching a PDP
│   ├── Add-to-cart rate          view_item → add_to_cart
│   ├── Checkout entry rate       view_cart → begin_checkout
│   ├── Checkout completion       begin_checkout → purchase   ← §1.10 target >65%
│   ├── Payment success rate      by method; WayForPay card vs COD (E10)
│   ├── COD share and refusal     cod_settlement vs refund(cod_refused). The deposit (H1.3) is
│   │                             designed to make a refusal cost-neutral, not rare — so a rising
│   │                             refusal rate is an inspection-quality signal, not a fraud one
│   ├── Deposit disclosure drop   deposit_disclosure_view → purchase(deposit_only). The single
│   │                             number that says whether H1.3's copy reads as fair (02 §2.8 R15)
│   └── Made-to-order funnel      custom_size_select → custom_size_terms_view → add_to_cart →
│                                 purchase. Separate from the stocked funnel: full prepayment and
│                                 a 14-day wait (H1.1, G2) are a different purchase decision and
│                                 averaging the two hides both
├── International (enquiry-then-invoice, F4)
│   ├── Quote requests            intl_quote_request
│   ├── Median hours to quote     intl_quote_sent.hours_to_quote — the client's own capacity
│   ├── Quote → paid rate         intl_quote_paid / intl_quote_sent
│   └── Abandoned quotes          quoted, never paid. The characteristic failure of this model
├── Average order value           ← §1.10 target: +40% vs category median
│   ├── Items per order
│   ├── Price per item
│   └── Origin mix                own manufacture vs partner (D3)
└── Repeat rate                   ← §1.10 target: >25% returning by month 6
    ├── Returning device          first-party cookie. The only live signal
    └── Repeat buyer              Postgres query on Order.email. Retrospective only, and it
                                  cannot see a repeat buyer who used a different email (E12)

TRUST (leading indicators — they move before revenue does)
├── Provenance block view rate    ← §1.10 target >55%
├── Production page entry rate    ← §1.10 target >18%
├── Factory video completion
├── Review submission rate        split by route: order-linked vs card-linked (G4). The two
│                                 behave differently and only the first can ever be verified
├── Verified-review count         gates AggregateRating (29-seo §29.6). Expect it to lag total
│                                 review count indefinitely — see §31.13 Tier 3
└── Tour intent                   tour_intent by page. A leading indicator with no known
                                  conversion rate. NEVER placed beside purchase (§31.13)

B2B
├── Wholesale page sessions
├── Lead form start → submit
├── Leads by kind                 wholesale / private label / dropship
├── Median first-response time    ← against the 48-working-hour SLA (H2), counted in WORKING
│                                 hours. Counting it in elapsed hours makes every Friday
│                                 enquiry a breach and the metric unusable
├── Quote validity expiry rate    quotes issued and never accepted inside 72h — 36h for
│                                 one-of-one items (H2). A high rate means the window is too
│                                 short or the quote is uncompetitive; opposite fixes
└── Lead → won conversion         `Lead.status` transitions
```

The trust branch is the part a generic e-commerce dashboard would not have, and it is the part
that tells the client whether the strategy in [01-brand-strategy.md](01-brand-strategy.md) is
working. At cold-start volumes these leading indicators are readable months before revenue is.

---

## 31.8 The search-query log as a merchandising instrument

[25-database-schema.md](25-database-schema.md) §25.9 defines `SearchQueryLog { query, locale,
resultCount, clickedId }` and states the case: **zero-result queries say exactly what customers
expect to find and cannot.**

| Pattern | Reading | Action |
|---|---|---|
| Zero results, high volume, product exists | A naming or synonym gap | Add a synonym; rename the product; add the term to the description |
| Zero results, high volume, product does not exist | Genuine demand | A product decision, escalated to the owner |
| Zero results in one locale only | A translation gap | Complete the translation |
| Results returned, no clicks | Results are irrelevant, or the card does not convey enough | Fix ranking or the card |
| High-volume term with results and clicks | A category candidate | Consider promoting it in navigation |
| Misspellings clustering | Fuzzy matching is too strict | Tune `unaccent` + trigram thresholds ([25-database-schema.md](25-database-schema.md) §25.10) |

Implementation notes: queries are logged server-side (never dependent on consent, as no personal
data is stored), normalised for case and whitespace but **stored verbatim otherwise** — the exact
misspelling is the signal. The admin widget is weekly and is the one report the manager is expected
to read every week. A "no results" state on the storefront also offers the nearest categories and a
contact prompt, so a failed search still has an exit
([08-design-system.md](08-design-system.md) §8.8).

At cold-start volumes this log will be thin. It is still worth reading from week one: twenty
zero-result queries in a month, on a site with 400 sessions, is a proportionally enormous signal.

---

## 31.9 Core Web Vitals field monitoring

Lab scores gate pull requests ([29-seo-architecture.md](29-seo-architecture.md) §29.14). Field
data is what Google ranks on and what users experience.

- The `web-vitals` library reports LCP, INP, CLS, TTFB and FCP to a **first-party** endpoint
  (`/api/vitals`) via `navigator.sendBeacon`. First-party because a third-party beacon is blocked
  by the same ad blockers that skew GA4, and because it needs no consent.
- Each beacon carries: metric, value, rating, `page_type`, `locale`, `device_class`, connection
  type, and the LCP element selector. **No identifier, no IP retention.** Aggregated hourly into a
  rollup table; raw rows are discarded after 30 days.
- Reported at **p75**, per metric, per device class, per page type — the same statistic Google
  uses. A mean hides the tail that the threshold is defined on.
- CrUX is cross-referenced monthly. It lags 28 days and needs traffic volume the site will not have
  for months, so first-party RUM is the primary source at cold start; CrUX becomes the check on it
  later.
- **Alert:** p75 LCP above 2.5 s on any page type for 24 hours, or a CLS regression above 0.1.
- The LCP element selector is recorded because the most common CWV regression is an unrelated
  change causing a different element to become the LCP.

---

## 31.10 Errors and exceptions

| Layer | Tool | Notes |
|---|---|---|
| Client | Sentry browser SDK | Source maps uploaded at build, not served publicly |
| SSR | Sentry Node SDK | The SSR process is now in the request path ([29-seo-architecture.md](29-seo-architecture.md) §29.1); an unhandled rejection is a blank page, not a degraded one |
| API | Sentry Node SDK + structured logs | Request ID correlates the two |
| Jobs | Sentry cron monitoring | A silently dead sitemap or reservation-sweep job is invisible without it |

Rules:

- **PII is scrubbed before send.** Emails, phones, addresses, tokens and card data are stripped by
  a `beforeSend` hook with a deny-list on parameter names plus a regex sweep. Verified by a test —
  an SDK default is not a compliance position.
- **Session replay is off.** It records personal data and would require consent, which would make
  it absent exactly when it is needed.
- **Business-critical errors page immediately**: payment webhook failure, checkout submit failure,
  order-write failure, 5xx rate above 1%.
- **Errors are tagged** with `locale`, `page_type` and `route` so a locale-specific bug — the most
  likely kind in a four-locale build — is visible rather than averaged away.
- **A weekly triage** assigns or closes every new issue type. An error tracker nobody reads is an
  expense.

---

## 31.11 Attribution, stated honestly

Every number in this document sits inside these limits. They are restated in the reporting
template so they are read every time, not read once and forgotten.

1. **Nobody buys on the first visit.** The average order is 5,000–15,000 UAH and the purchase is
   multi-session, multi-device and comparison-driven ([02-ux-research.md](02-ux-research.md) §2.3).
   The channel credited at purchase is usually not the channel that did the work.
2. **Last-click systematically understates SEO, content and social.** A purchase attributed to
   "direct" was very often an organic discovery three weeks earlier. Reports name this explicitly
   whenever a channel comparison appears.
3. **Cross-device is unresolvable, permanently.** Cross-device stitching requires a logged-in
   identity, and [00-client-decisions-2.md](00-client-decisions-2.md) E12 establishes that there
   will never be one — the site operates in guest mode forever. Phone discovery followed by
   desktop purchase, the "evening basket" pattern in [02-ux-research.md](02-ux-research.md) §2.3,
   breaks the chain entirely and no future feature will repair it.

   This was previously written as a default that a later account feature might relax. It is not.
   **It is a fixed property of the system**, and it should be presented to the client as a
   deliberate trade rather than a gap: the same decision that makes cross-device attribution
   impossible also removes customer password storage, credential-stuffing exposure, session
   management and a large part of the GDPR surface
   ([32-security-architecture.md](32-security-architecture.md) §32.3). That is a good trade for a
   four-person team selling a low-frequency, high-value product. It is simply not a free one, and
   this is the bill.
4. **Consent gaps bias the EU locales.** GA4 sees a non-random subset of `de` and `pl` traffic
   (§31.2). Plausible's totals are the denominator; GA4's funnel is the shape. Never divide one by
   the other.
5. **Offline conversion is invisible, and it is a larger share here than in a normal store.** A
   visitor who reads the site and then phones, writes on Viber, or drives to the workshop appears
   as a bounce. `contact_intent` and `visit_intent` (§31.4) are partial proxies and are explicitly
   labelled as such. Four decisions each push more conversion offline: the Google Business Profile
   is the primary channel ([00-client-decisions-2.md](00-client-decisions-2.md) E4), opening hours
   are deliberately not published so the site *instructs* visitors to phone ahead (E3), Яворів's
   tourist footfall converts in person, and **the premises are a shop, so a visit can complete a
   sale with no online step at all** ([00-client-decisions-3.md](00-client-decisions-3.md) F2).
   Treat the online conversion rate as a floor on commercial performance, not a measure of it.
   §31.13 sets out what can and cannot be recovered.
6. **There is no social channel to attribute to or from** ([00-client-decisions-2.md](00-client-decisions-2.md)
   E3). A referral report showing zero social traffic is correct, not broken.
7. **AI-assistant referrals are under-counted**, and the underlying channel is itself constrained
   by near-zero off-site brand mentions
   ([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.11, §30.13).
8. **Cold-start volumes cannot support significance testing.** With tens of transactions a month,
   no A/B test will reach significance in a usable timeframe. Decisions are made on qualitative
   evidence, funnel drop-off and judgement, and the reports say so rather than implying a rigour
   that is not there.

The operating rule: **directionally right beats precisely wrong.** A report that gives a
confidence interval on twelve orders is misleading in a way that a stated judgement is not.

---

## 31.12 Reporting cadence

| Report | Cadence | Audience | Contents | Delivery |
|---|---|---|---|---|
| Ops snapshot | Daily | Manager | Orders to action, leads to answer, reviews to moderate, stock alerts | Admin dashboard |
| Zero-result searches | Weekly | Manager, content | Query list with counts and trend | Admin widget + email |
| Trading summary | Weekly | Owner | Revenue, orders, AOV, origin mix, funnel, top products, traffic sources | One-page email, auto-generated |
| Content and SEO | Monthly | Owner, content | Indexation, impressions and clicks per locale, cluster performance, GBP insights, content health | Document |
| Technical health | Monthly | Developer | CWV field data, error rate, budget compliance, uptime | Document |
| Strategic review | Quarterly | Owner + team | §1.10 criteria vs target, KPI tree, AI citation audit ([30-ai-search-optimization.md](30-ai-search-optimization.md) §30.13), roadmap re-prioritisation | Meeting + document |
| Data-retention and consent audit | Annually | Owner | Retention compliance, vendor list, consent rates, DSAR log ([32-security-architecture.md](32-security-architecture.md) §32.15) | Document |

Two rules about the reports themselves. **Every report names an owner and an action** — a report
with no owner is not read, and a report with no action is not worth writing. And **the weekly
trading summary is one page.** A small team will read one page every week and will read nothing at
all if it is five.

One addition in round 3: the **monthly** content and SEO report and the **quarterly** strategic
review both carry the offline caveat from §31.13 as a fixed paragraph, not as a footnote someone
can delete. A report that presents an online conversion rate to a business with a shop, without
saying what it excludes, is not a neutral omission — it is an argument for defunding the channel
that may be producing the most revenue.

---

## 31.13 Measuring the shop and the workshop tour — what is possible, what is a proxy, and what is not measurable at all

[00-client-decisions-3.md](00-client-decisions-3.md) F2 confirms that the Яворів premises are a
retail shop as well as a production site, and
[29-seo-architecture.md](29-seo-architecture.md) §29.15 promotes physical footfall to the second
launch channel — one that does not depend on search at all. That is commercially good news and
analytically inconvenient, because the channel's most valuable path runs entirely outside every
system this document describes:

```
tourist arrives in Яворів for the museum or the plein air
 → walks into the shop
 → looks, touches, talks to the owner
 → buys nothing that day (a ліжник is 5,000–15,000 UAH and the car is full)
 → three weeks later, at home, searches the brand name or types the URL from the card
 → buys online
```

Every step before the last is invisible. The last one arrives as `direct` or as a branded organic
search, which is the same way a returning online visitor arrives. **There is no honest way to
distinguish them from inside the analytics.**

### The rule this section exists to enforce

**Do not build an offline-attribution system.** The available techniques — unique landing pages,
per-visit QR codes, a "how did you hear about us" field, coupon codes — each recover a fraction of
the truth, and each costs either the client's attention at the counter or the customer's patience
at checkout. On a business doing tens of orders a month with a four-person team, an attribution
apparatus that produces a partial number nobody trusts is worse than a stated unknown, because it
absorbs effort *and* invites false confidence. What follows is a short list of cheap, honest
partial signals, and an explicit statement of what remains dark.

### Tier 1 — genuinely measurable, cheap, worth doing

| Instrument | What it actually measures | Cost | Honest limit |
|---|---|---|---|
| **A printed card with a short, memorable URL and a QR code**, handed to every shop visitor | Visits to that URL. If the QR resolves to `{{DOMAIN}}/?from=shop` (a redirect to the canonical URL, never an indexable duplicate — [29-seo-architecture.md](29-seo-architecture.md) §29.7), the parameter can be read into a session dimension | One print run | Counts only the visitors who kept the card *and* used the code rather than typing the domain or searching the brand. Undercounts by an unknown, probably large, factor |
| **Google Business Profile direction requests and calls** ([29-seo-architecture.md](29-seo-architecture.md) §29.17) | Intent to visit, expressed through Google | Zero — already collected | Measures people who found the shop via Google. Invisible to it: everyone who walked past the sign, was told by the museum, or came with a tour group. It is a floor on visit intent, not a count of visits |
| **`visit_intent`** (§31.4) | On-site interest in visiting: directions clicks, map clicks, address copies | Trivial | Measures the online→offline direction, which is the *opposite* of the path this section is about. Worth having; does not answer this question |
| **Branded-search volume in Search Console** | Whether the brand name is being typed by people who did not arrive via a link | Zero — already collected | This is the **best available signal for offline demand**, precisely because a branded search almost always means someone encountered the brand somewhere else. A rise with no corresponding campaign is evidence of offline word of mouth. It is directional and unattributable, and that is the whole point |
| **Google review text** | Whether reviewers mention visiting | Zero | Qualitative, tiny sample, high signal. A review saying «були в магазині, потім замовили ще» is worth more than a chart |
| **`tour_intent`** (§31.4) | That a reader activated the `tel:` link inside a tour block, and on which page | Trivial | Measures the decision to call. It does **not** measure whether the call connected, whether a tour was agreed, whether it happened, or whether it ever became an order. See the tour analysis below |
| **`card_landing_view`** with `source` (§31.4) | Arrivals from the parcel card, split by QR versus typed | One print run, already committed ([00-client-decisions-4.md](00-client-decisions-4.md) G4) | Counts the fraction who used the printed route rather than searching the brand or typing the bare domain. The `qr` / `typed` split is reliable *within* that fraction and says nothing about its size |

### Tier 2 — possible, and deliberately not recommended

| Technique | Why it is rejected |
|---|---|
| Per-visit unique coupon codes | Requires the owner to issue and track a code at the counter, on every visit, forever. It will be done for two weeks. A discipline that degrades produces a time series whose decline is indistinguishable from a real decline in footfall — the worst failure mode a metric can have |
| «Звідки ви про нас дізналися?» at checkout | Adds a field to a checkout the whole of [18-checkout-specification.md](18-checkout-specification.md) works to shorten. Self-reported channel data is unreliable in every study that has checked it, and here it would be paid for in completion rate on a >65% target |
| A dedicated `/shop-visitors` landing page | Splits link equity and creates a near-duplicate of the contact page on a domain already managing a duplicate-content risk ([29-seo-architecture.md](29-seo-architecture.md) §29.18). The card's `?from=shop` parameter achieves the same thing at no SEO cost |
| Wi-Fi or beacon footfall counting | Disproportionate for a village workshop, and it places personal-data obligations on a business that currently has almost none ([32-security-architecture.md](32-security-architecture.md) §32.15) |
| Asking the owner to log visitor counts | A real cost on the client's time, producing a number with no denominator. If the client volunteers it, use it; do not require it |

### The workshop tour — the honest answer is "intent only", and the reason is not technical

[00-client-decisions-4.md](00-client-decisions-4.md) G3 confirms that visitors may walk the
production floor accompanied by Іван, arranged in advance by phone. It is described in
[01-brand-strategy.md](01-brand-strategy.md) and [02-ux-research.md](02-ux-research.md) as the
strongest trust asset on the project. The natural next request is a number for it. This section
exists to answer that request honestly rather than to satisfy it.

**What the site can observe.** Exactly one thing: `tour_intent` — that a `tel:` link inside a tour
block was activated, on which page, in which locale. That is the complete list.

**What the site cannot observe, and why each gap is structural rather than a missing feature:**

| Unknown | Why it cannot be closed |
|---|---|
| Whether the call connected | The phone is a personal mobile. There is no call-tracking number, and introducing one would put a rented number between a customer and the owner on the surface whose entire value is directness |
| Whether a tour was arranged | It is agreed in conversation. Nothing writes it down, and the ruling forbids the thing that would |
| Whether the tour happened | Same |
| Whether it produced an order | No accounts (E12), no cross-device identity, and typically weeks between the visit and the purchase — the same wall §31.11 describes for the shop, with a smaller sample |
| How many people took a tour at all | Only Іван knows, and only if he counts |

**The two instruments that would close most of this are forbidden by the same ruling that created
the asset**, which is the crux and is worth stating plainly rather than treating as an oversight:

| Instrument | Why it is unavailable |
|---|---|
| A booking form or calendar | G3 forbids it outright: a calendar implies capacity a two-person business does not have, and produces no-shows nobody chases. It would also produce excellent data — which is precisely the trap. The measurement value is real and the cost is the asset itself |
| A per-visitor code or personalised card | G3's framing is that the tour is an invitation, not a product. Handing a tracked token to someone who has just been shown round a workshop by its owner converts a personal gesture into a funnel step, and does so in front of the person it is being measured on |

**The recommendation, therefore: measure intent, do not build attribution, and say so in the
report.** Concretely:

1. **Ship `tour_intent`**, segmented by page. It costs nothing and it answers one genuinely useful
   question: *which page's framing of the tour gets acted on* — the production page's closing
   argument, the About page's line under Іван's card, or the wholesale credibility block. If the
   wholesale placement dominates, [02-ux-research.md](02-ux-research.md) §2.3's claim that the tour
   is worth more to a trade buyer is supported; if it is near zero there, that claim is wrong and
   the space should go to capacity figures instead. That is a real decision unblocked by a trivial
   event, and it is the only one.
2. **Ask, do not instrument.** The outcome side is a tally: Іван notes how many people came this
   month and, where it comes up naturally, how they heard about it. A notebook. This is recorded as
   R17 in [02-ux-research.md](02-ux-research.md) §2.8 and is deliberately framed as *low effort,
   abandonable*. A tally that stops after two months is a small loss; a coupon-code discipline that
   decays produces a declining series indistinguishable from declining demand, which is the failure
   mode named in Tier 2 above.
3. **Never report `tour_intent` as a conversion.** It is a leading indicator with no known
   conversion rate attached to it, and a dashboard that places it beside `purchase` will be read as
   though one causes the other. It belongs in the same reporting block as `visit_intent` and
   `contact_intent`, under a heading that says these measure *intent*.

**The uncomfortable conclusion, stated so nobody has to rediscover it.** The project's single
strongest trust asset will be close to invisible in every report this system produces, and its
value will show up — if it shows up at all — as unattributable branded search, wholesale leads that
arrive already convinced, and sentences in Google reviews. That is not a measurement failure to be
fixed in a later phase. It is the correct outcome of choosing an asset that works because it is
personal over one that works because it is trackable, and the alternative was not a better-measured
tour but a worse tour.

### Tier 3 — not measurable, stated so it is not silently assumed

- **How many people entered the shop.** No instrument in this project counts them.
- **What share of online orders were seeded by a visit.** Structurally unrecoverable: no accounts
  (E12), no cross-device identity, and a weeks-long gap between the visit and the order.
- **The revenue effect of the shop on online sales.** Follows from the above.
- **In-store sales**, unless the client records them somewhere this system can read. They are not
  in `Order` and the site does not know they happened. If the client wants a total revenue picture
  the sales have to be entered manually, and that is a decision about their time, not a build item.
- **Anything about the workshop tour beyond the intent to call.** Whether it happened, how it went,
  and what it was worth. See the analysis above — this is a consequence of
  [00-client-decisions-4.md](00-client-decisions-4.md) G3's prohibitions, which are correct, and not
  a gap to be closed later.
- **Which reviews came from the parcel card.** The card carries a single short link with no
  per-order code ([00-client-decisions-4.md](00-client-decisions-4.md) G4), deliberately, because
  variable printing is a workflow this team should not be asked to run. Reviews arriving that way
  therefore have **no order linkage**, stay `isVerifiedPurchase: false`, and are excluded from the
  aggregate rating ([25-database-schema.md](25-database-schema.md) §25.6). That is a correct
  constraint to honour rather than engineer around, and it has one reporting consequence worth
  stating in advance: **review count and `AggregateRating` will diverge**, possibly for a long
  time. A report showing twelve reviews and no star rating is not broken.

### How this is reported

One paragraph, fixed, in the monthly report and the quarterly review:

> Дані цього звіту покривають лише онлайн-канал. Продажі та попит, створені у магазині в Яворові,
> а також відвідування цеху, у ньому не відображені й виміряні бути не можуть. Брендові пошукові
> запити, запити маршруту в Google і кількість дзвінків — єдині доступні непрямі індикатори
> офлайн-попиту; вони показують напрямок, а не обсяг.

The purpose of that paragraph is defensive. Without it, a report showing modest online numbers in
month four reads as a failing project, when the same period may have produced good trade through a
door the report cannot see. **A measurement system that silently omits a channel does not report
zero for it — it reports zero for the whole business and blames the part it can see.** Naming the
gap every month is the only protection against that, and it costs three sentences.
