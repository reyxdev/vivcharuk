# 25 — Database Schema (canonical)

PostgreSQL 16 + Prisma. This document is the single source of truth for data shapes. Any API,
admin, or UI spec that contradicts it is wrong.

## 25.1 Governing decisions

| Decision | Choice | Why |
|---|---|---|
| Primary keys | `cuid2` strings | Non-guessable in URLs, sortable enough, no cross-shard coordination. Sequential integers leak order volume to competitors — a real concern for a business that will not want its monthly order count inferred from `/orders/1042`. |
| Money | `Int` minor units (kopiyky) + `Currency` enum | Never `Float`. Never `Decimal` for arithmetic in JS. All maths in integers, formatted at the edge. |
| Translations | Side tables, one row per locale | Not JSONB. Side tables give per-locale indexes, per-locale uniqueness on slugs, partial-translation states, and referential integrity that JSONB cannot. |
| Soft delete | `deletedAt` on business entities | Required by the audit and restore requirements. Enforced via Prisma middleware, not per-query discipline. |
| Time | `timestamptz`, UTC | Ukraine observes DST. Storing local time guarantees a bug twice a year. |
| Enums | Postgres native enums | Type-safe, small, and they force schema migration for new states — which is correct for an order state machine. |
| Audit | Append-only table, never updated | An audit log that can be edited is not an audit log. |

## 25.2 Localisation pattern

Every user-facing entity follows the same shape. Learn it once, apply everywhere.

```prisma
model Product {
  id           String                @id @default(cuid())
  sku          String                @unique
  // ... locale-independent fields
  translations ProductTranslation[]
}

model ProductTranslation {
  id              String  @id @default(cuid())
  productId       String
  locale          Locale
  name            String
  slug            String
  description     String  @db.Text
  // SEO overrides — null means "generate from content"
  metaTitle       String?
  metaDescription String?

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, locale])
  @@unique([locale, slug])          // slug unique per locale, not globally
  @@index([locale])
}

enum Locale { uk en pl de }
```

`@@unique([locale, slug])` is the important line. It permits `/uk/blankets` and `/en/blankets`
to coexist while preventing two Ukrainian products from colliding.

**Fallback rule:** if a translation row is missing, the API serves the `uk` row and sets
`x-translation-fallback: true`. Missing translations never 404 and never render an empty page.
The admin surfaces translation completeness per entity so gaps are visible.

## 25.3 Catalogue

```prisma
model Category {
  id          String   @id @default(cuid())
  parentId    String?
  sortOrder   Int      @default(0)
  isFeatured  Boolean  @default(false)
  isActive    Boolean  @default(true)

  // Seed value for the admin product form ONLY — copied into Product on create, then never
  // referenced again. Pricing reads Product.customSizeRatePerSqmMinor exclusively.
  // A live fallback was rejected: editing this would silently reprice every product that
  // never overrode it, including ones deliberately priced by someone who left the field
  // alone because the inherited value happened to be right. See 00-client-decisions-5 §H3c.
  defaultCustomSizeRatePerSqmMinor Int?
  heroMediaId String?
  iconKey     String?                        // references the icon registry, not a file path
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parent       Category?             @relation("CategoryTree", fields: [parentId], references: [id])
  children     Category[]            @relation("CategoryTree")
  heroMedia    Media?                @relation(fields: [heroMediaId], references: [id])
  products     ProductCategory[]
  translations CategoryTranslation[]

  @@index([parentId, sortOrder])
  @@index([isActive, isFeatured])
}

model CategoryTranslation {
  id              String  @id @default(cuid())
  categoryId      String
  locale          Locale
  name            String
  slug            String
  description     String? @db.Text
  metaTitle       String?
  metaDescription String?
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@unique([categoryId, locale])
  @@unique([locale, slug])
}

enum ProductStatus { DRAFT ACTIVE ARCHIVED }
enum PricingUnit   { PIECE KILOGRAM SKEIN METRE }

// Own manufacture vs resold partner goods. This is a first-class field rather than a
// category tag because it changes structured data (brand/manufacturer), badge treatment,
// filter facets, and eligibility for the homepage and production storytelling.
// See 00-client-decisions.md §D3 and 01-brand-strategy.md §1.7b.
enum ProductOrigin { OWN_MANUFACTURE PARTNER_MANUFACTURE }

model Product {
  id              String        @id @default(cuid())
  sku             String        @unique
  status          ProductStatus @default(DRAFT)
  pricingUnit     PricingUnit   @default(PIECE)

  origin          ProductOrigin @default(OWN_MANUFACTURE)
  partnerName     String?                         // required when origin = PARTNER_MANUFACTURE
  partnerRegion   String?                         // "Косівщина", "Закарпаття"

  // Denormalised from variants for listing performance. Maintained in a transaction
  // whenever a variant price changes; never written by hand.
  priceMinMinor   Int
  priceMaxMinor   Int
  currency        Currency      @default(UAH)
  inStock         Boolean       @default(false)

  isHandmade      Boolean       @default(false)   // drives the gold "handmade tier" badge
  isUniquePiece   Boolean       @default(false)   // stock == 1, one-of-one

  // Made-to-order is a property of WHICH SIZE the customer picks, not of the product.
  // The same лiжник is stocked at 150×200 and a 14-day build at 180×240.
  // allowsCustomSize is the per-product admin toggle (00-client-decisions-5.md §H3b);
  // madeToOrderDays applies ONLY to the custom-size configuration. Standard variants keep
  // normal stock behaviour and remain eligible for cash on delivery.
  allowsCustomSize Boolean      @default(false)
  madeToOrderDays Int?                            // 14 when a custom size is chosen

  // Custom-size pricing (00-client-decisions-5.md §H3c): the owner sets the rate in the
  // admin, the system computes price = max(area_m2 × rate, minPrice). The browser's figure
  // is informational; the server recomputes at checkout and that is what is charged.
  customSizeRatePerSqmMinor Int?
  customSizeMinPriceMinor   Int?                  // floor — setup labour outweighs a tiny piece
  // Loom and frame limits. These are PHYSICAL constraints, not preferences: without them the
  // shop can sell a width that cannot be woven, and the order dies after payment.
  customSizeMinWidthCm      Int?
  customSizeMaxWidthCm      Int?
  customSizeMinLengthCm     Int?
  customSizeMaxLengthCm     Int?

  // Provenance block — the strategic differentiator, so it is first-class schema,
  // not a free-text field. See 01-brand-strategy.md §1.8.
  woolOrigin      String?
  woolMicron      Int?
  productionStage String[]                        // ordered stage keys performed in-house

  publishedAt     DateTime?
  deletedAt       DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  translations ProductTranslation[]
  variants     ProductVariant[]
  categories   ProductCategory[]
  media        ProductMedia[]
  attributes   ProductAttributeValue[]
  reviews      Review[]
  relatedFrom  ProductRelation[] @relation("RelSource")
  relatedTo    ProductRelation[] @relation("RelTarget")

  @@index([status, publishedAt])
  @@index([status, inStock, priceMinMinor])
  @@index([isHandmade])
  @@index([origin, status])
}

model ProductCategory {
  productId  String
  categoryId String
  sortOrder  Int @default(0)
  product  Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([productId, categoryId])
  @@index([categoryId, sortOrder])
}
```

### Variants

Four variant axes are required (size, colour, composition, weight) but not every family uses
all four. A fixed four-column design would be wrong for socks and wrong for yarn. Options are
therefore modelled generically while variants keep a resolved, indexable option map.

```prisma
model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  sku           String   @unique
  priceMinor    Int
  compareAtMinor Int?                    // strike-through price; null = no discount shown
  currency      Currency @default(UAH)

  stockQty      Int      @default(0)
  lowStockAt    Int      @default(3)
  allowBackorder Boolean @default(false)

  weightGrams   Int?
  // Packed parcel size, round 10 part 5: Nova Poshta parcel lockers are offered only when
  // the packed item fits a locker cell.
  packedLengthCm Int?
  packedWidthCm  Int?
  packedHeightCm Int?
  packedWeightGrams Int?
  dimensionsMm  Json?                    // { w, h, d } — shipping calculation input
  barcode       String?

  // Yarn, rovnytsia and raw wool only. Needleworkers buy several skeins at once and
  // colour varies between dye lots; shipping mixed lots generates returns. Nullable
  // because it is meaningless for every other category.
  // Pending client confirmation that lots are actually tracked — 00-client-decisions.md §D6.3
  dyeLot        String?
  lengthMetres  Int?                     // yarn: метраж
  plyThickness  String?                  // yarn: товщина
  position      Int      @default(0)
  isActive      Boolean  @default(true)
  deletedAt     DateTime?

  product   Product              @relation(fields: [productId], references: [id], onDelete: Cascade)
  options   VariantOptionValue[]
  mediaId   String?
  media     Media?               @relation(fields: [mediaId], references: [id])
  orderItems OrderItem[]

  @@index([productId, isActive, position])
  @@index([stockQty])
  @@index([productId, dyeLot])
}

model OptionType {
  id           String   @id @default(cuid())
  key          String   @unique          // "size" | "color" | "composition" | "weight"
  displayAs    OptionDisplay @default(PILL)
  position     Int      @default(0)
  values       OptionValue[]
  translations OptionTypeTranslation[]
}

enum OptionDisplay { PILL SWATCH DROPDOWN SIZE_GRID }

model OptionValue {
  id           String @id @default(cuid())
  optionTypeId String
  key          String
  hex          String?                   // colour swatches only
  swatchMediaId String?                  // texture swatch — wool colour photographs better
                                         // than it renders as a flat hex
  position     Int    @default(0)
  optionType   OptionType @relation(fields: [optionTypeId], references: [id], onDelete: Cascade)
  translations OptionValueTranslation[]
  variants     VariantOptionValue[]
  @@unique([optionTypeId, key])
}

model VariantOptionValue {
  variantId     String
  optionValueId String
  variant     ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  optionValue OptionValue    @relation(fields: [optionValueId], references: [id])
  @@id([variantId, optionValueId])
  @@index([optionValueId])
}
```

### Attributes — the specification table

Distinct from options. Options *select a variant*; attributes *describe the product*. Density,
composition percentage, care instructions, and origin are attributes. They feed the PDP spec
table, the filter facets, and the `Product` structured data.

```prisma
model AttributeDefinition {
  id           String        @id @default(cuid())
  key          String        @unique
  dataType     AttributeType
  unit         String?
  isFilterable Boolean       @default(false)
  isComparable Boolean       @default(false)
  position     Int           @default(0)
  translations AttributeDefinitionTranslation[]
  values       ProductAttributeValue[]
}

enum AttributeType { TEXT NUMBER BOOLEAN ENUM }

model ProductAttributeValue {
  id            String @id @default(cuid())
  productId     String
  definitionId  String
  valueText     String?
  valueNumber   Float?
  valueBool     Boolean?
  product    Product             @relation(fields: [productId], references: [id], onDelete: Cascade)
  definition AttributeDefinition @relation(fields: [definitionId], references: [id])
  @@unique([productId, definitionId])
  @@index([definitionId, valueNumber])
}

model ProductRelation {
  sourceId String
  targetId String
  kind     RelationKind
  position Int @default(0)
  source Product @relation("RelSource", fields: [sourceId], references: [id], onDelete: Cascade)
  target Product @relation("RelTarget", fields: [targetId], references: [id], onDelete: Cascade)
  @@id([sourceId, targetId, kind])
}

enum RelationKind { CROSS_SELL UP_SELL BUNDLE COMPLETES_SET }
```

## 25.4 Media

Photography is the product here, so media is a first-class entity with art-direction metadata,
not a URL string.

```prisma
model Media {
  id           String    @id @default(cuid())
  provider     String    @default("cloudinary")
  publicId     String                              // Cloudinary public_id
  format       String
  width        Int
  height       Int
  bytes        Int
  blurhash     String?                             // LQIP — protects CLS
  dominantHex  String?

  kind         MediaKind @default(IMAGE)
  durationSec  Int?
  posterId     String?                             // video poster frame

  // Art direction. See 09-color-palette.md §9.6.
  focalX       Float     @default(0.5)             // 0..1
  focalY       Float     @default(0.5)
  textSafeZone Json?                               // { x, y, w, h } in 0..1 units

  albumId      String?
  uploadedById String?
  createdAt    DateTime  @default(now())

  translations MediaTranslation[]                  // alt text and caption, per locale
  album        MediaAlbum? @relation(fields: [albumId], references: [id])
  products     ProductMedia[]
  @@index([albumId, createdAt])
  @@index([kind])
}

enum MediaKind { IMAGE VIDEO }

model MediaTranslation {
  id      String @id @default(cuid())
  mediaId String
  locale  Locale
  alt     String                                   // required — enforced at API layer
  caption String?
  media Media @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  @@unique([mediaId, locale])
}

model ProductMedia {
  productId String
  mediaId   String
  position  Int      @default(0)
  role      MediaRole @default(GALLERY)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  media   Media   @relation(fields: [mediaId], references: [id])
  @@id([productId, mediaId])
  @@index([productId, position])
}

enum MediaRole { PRIMARY GALLERY DETAIL LIFESTYLE PRODUCTION SCALE_REFERENCE }
```

`alt` being a required field on a translation row rather than an optional column on `Media` is
what makes the accessibility target achievable. It cannot be skipped by an editor in a hurry.

## 25.5 Orders

Guest checkout is the default, so `Order` does not require a `customerId`.

```prisma
enum Currency      { UAH EUR PLN USD }
// AWAITING_QUOTE precedes PENDING and exists only for international orders. Ratified from
// 05-user-flows.md §5.9.4 after 00-client-decisions-3.md §F4 established that carriers are
// chosen per order, so international shipping is quoted rather than calculated.
//
// It is a distinct status rather than a flag on PENDING because the two differ in every way
// that matters operationally: no payment is possible yet, no stock is committed, the customer
// is waiting on the business rather than the reverse, and the admin queue that must act on it
// is a different queue. Overloading PENDING would hide these orders in the list staff use to
// pack parcels.
// IN_PRODUCTION sits between CONFIRMED and PACKING, for made-to-order items with a 14-day
// build time (00-client-decisions-4.md §G2). PACKING does not cover a fortnight of weaving,
// and a customer who paid for a custom lizhnyk and sees CONFIRMED for twelve days assumes the
// order is stuck. Naming what is actually happening removes a support contact and replaces
// anxiety with anticipation — the correct emotional state for a handmade purchase.
enum OrderStatus   { AWAITING_QUOTE PENDING CONFIRMED IN_PRODUCTION PACKING SHIPPED DELIVERED CANCELLED RETURNED }
enum PaymentStatus { UNPAID AUTHORIZED PAID PARTIALLY_REFUNDED REFUNDED FAILED }
enum PaymentMethod { CARD_ONLINE COD BANK_TRANSFER }
enum ShippingCarrier { NOVA_POSHTA UKRPOSHTA PICKUP INTERNATIONAL }

model Order {
  id            String   @id @default(cuid())
  number        String   @unique                   // human-facing, e.g. VCH-25-0417
  locale        Locale
  currency      Currency @default(UAH)

  status        OrderStatus   @default(PENDING)
  paymentStatus PaymentStatus @default(UNPAID)
  paymentMethod PaymentMethod

  // Captured at purchase time. Never joined live — a price change must not
  // retroactively alter a historical order.
  subtotalMinor Int
  discountMinor Int @default(0)
  discountSource    DiscountSource?                // which rule produced discountMinor; never both (18 §18.10a)
  volumeTierPercent Int?                           // snapshot of the wholesale tier applied, e.g. 10 or 20
  // Nullable, not zero-defaulted: an international order in AWAITING_QUOTE has no shipping
  // cost yet, and 0 would be indistinguishable from genuinely free shipping. The API must
  // refuse to render a total while this is null.
  shippingMinor Int?

  // Ukrainian COD-with-inspection only (00-client-decisions-5.md §H1.3). The buyer pays BOTH
  // shipping legs online at checkout; on acceptance the return deposit is credited against
  // the goods, so the amount collected at the branch is reduced by exactly that much.
  // Forbidden on en/pl/de orders — the EU right of withdrawal does not permit holding a
  // deposit against its exercise.
  shippingForwardMinor       Int?
  shippingReturnDepositMinor Int?
  // Credited exactly ONCE, on transition to DELIVERED. Crediting on SHIPPED would refund a
  // deposit for a parcel that is later refused; crediting twice gives away the goods.
  // This belongs in the state machine and requires a test.
  depositAppliedMinor        Int  @default(0)
  codAmountMinor             Int?   // subtotal − discount − depositAppliedMinor
  totalMinor    Int?                             // null until shippingMinor is known

  email         String
  phone         String
  customerId    String?
  guestToken    String?  @unique                   // lets a guest track an order without an account

  shippingCarrier ShippingCarrier
  shippingAddress Json                             // snapshot, not a relation
  billingAddress  Json?
  npWarehouseRef  String?                          // Nova Poshta branch/locker ref
  trackingNumber  String?

  customerNote  String?  @db.Text
  internalNote  String?  @db.Text                  // never exposed to the storefront

  couponCode    String?
  placedAt      DateTime @default(now())
  quotedAt      DateTime?                        // shipping quote issued — AWAITING_QUOTE exit
  quoteExpiresAt DateTime?                       // halved for one-of-one items, see 18 §18.23.7
  paidAt        DateTime?
  shippedAt     DateTime?
  deliveredAt   DateTime?
  cancelledAt   DateTime?

  items    OrderItem[]
  events   OrderEvent[]
  payments PaymentTransaction[]
  customer Customer? @relation(fields: [customerId], references: [id])

  @@index([status, placedAt])
  @@index([email])
  @@index([paymentStatus])
}

model OrderItem {
  id           String @id @default(cuid())
  orderId      String
  variantId    String?                             // nullable: variant may later be deleted

  // Full snapshot. An order line must render correctly a decade from now
  // even if the product no longer exists.
  sku          String
  nameSnapshot String
  optionsSnapshot Json
  // Custom-size builds only: the dimensions the customer specified, e.g.
  // { widthCm: 180, lengthCm: 240 }. Snapshotted like every other line field — a warranty
  // claim years later must be checkable against what was actually ordered.
  customSpec   Json?
  imageUrlSnapshot String?
  unitPriceMinor Int
  pricingUnitSnapshot PricingUnit                    // renders "2 шт" vs "1,5 кг" years later
  quantityMilli Int                                  // see CartItem.quantityMilli
  totalMinor   Int

  order   Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  @@index([orderId])
  @@index([variantId])
}

model OrderEvent {
  id        String   @id @default(cuid())
  orderId   String
  type      String                                  // status_changed | note_added | email_sent
  fromValue String?
  toValue   String?
  actorId   String?                                 // null = system
  payload   Json?
  createdAt DateTime @default(now())
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId, createdAt])
}

model PaymentTransaction {
  id            String        @id @default(cuid())
  orderId       String
  provider      String
  providerRef   String
  status        PaymentStatus
  amountMinor   Int
  currency      Currency
  rawPayload    Json                                // webhook body, retained for dispute resolution
  idempotencyKey String       @unique               // webhook replay protection
  createdAt     DateTime      @default(now())
  order Order @relation(fields: [orderId], references: [id])
  @@index([orderId])
  @@unique([provider, providerRef])
}
```

The snapshot-everything approach on `OrderItem` is non-negotiable. Joining live product data
into historical orders is the single most common source of accounting discrepancies in
e-commerce builds.

### Stock reservation

Stock is decremented on payment authorisation, not on add-to-cart, with a short-lived
reservation during checkout to prevent overselling the one-of-one handmade items
([00-assumptions.md](00-assumptions.md) B4).

```prisma
model StockReservation {
  id        String   @id @default(cuid())
  variantId String
  quantityMilli Int                                  // see CartItem.quantityMilli
  cartId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([variantId])
  @@index([expiresAt])                              // a cron job sweeps expired rows
}
```

## 25.6 Customers, carts, reviews, wishlist

```prisma
// Order-derived record only. There is NO customer authentication anywhere in this system —
// the site is permanently guest-checkout (00-client-decisions-2.md §E12). This model exists
// so repeat buyers can be recognised for support and analytics, never so they can log in.
// No passwordHash, no sessions, no email verification, no account pages.
model Customer {
  id           String    @id @default(cuid())
  email        String    @unique
  phone        String?
  firstName    String?
  lastName     String?
  locale       Locale    @default(uk)
  acceptsMarketing Boolean @default(false)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  orders    Order[]
  addresses CustomerAddress[]
  reviews   Review[]
}

model Cart {
  id        String   @id @default(cuid())
  token     String   @unique                        // httpOnly cookie value
  customerId String?
  locale    Locale   @default(uk)
  currency  Currency @default(UAH)
  couponCode String?
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  items CartItem[]
  @@index([expiresAt])
}

model CartItem {
  id        String @id @default(cuid())
  cartId    String
  variantId String

  // Integer thousandths of the variant's PricingUnit. A PIECE item ordering 2 units
  // stores 2000; yarn ordering 1.5 kg stores 1500. One field, integer maths, no float
  // drift, and no branching between counted and weighed goods in cart arithmetic.
  // Ratified from 26-api-architecture.md.
  quantityMilli Int
  addedAt   DateTime @default(now())
  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)
  @@unique([cartId, variantId])
}

enum ReviewStatus { PENDING APPROVED HIDDEN REJECTED }

enum ReviewSource { SITE PROM }

model Review {
  id          String       @id @default(cuid())
  productId   String
  customerId  String?
  authorName  String
  authorEmail String
  rating      Int                                   // 1..5, constrained in the DB
  title       String?
  body        String       @db.Text
  status      ReviewStatus @default(PENDING)
  isVerifiedPurchase Boolean @default(false)
  orderId     String?                               // proof for the verified badge
  reply       String?      @db.Text
  repliedById String?
  repliedAt   DateTime?
  helpfulCount Int         @default(0)
  mediaIds    String[]
  // Round 13 (N2): imported Prom reviews and shop-level reviews.
  source      ReviewSource @default(SITE)
  sourceDate  DateTime?                             // original date for imported reviews
  sourceRef   String?                               // original id, for de-duplicated re-imports
  // productId becomes optional in the migration: null = «Відгук про магазин».
  // Imported (source != SITE) reviews are excluded from AggregateRating.
  createdAt   DateTime     @default(now())
  product  Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  customer Customer? @relation(fields: [customerId], references: [id])
  @@index([productId, status, createdAt])
}
```

`Review.rating` carries a DB-level `CHECK (rating BETWEEN 1 AND 5)` added by migration. Prisma
does not express check constraints, so it lives in a hand-written migration step — recorded
here so it is not lost.

Only `APPROVED` reviews with `isVerifiedPurchase` contribute to the aggregate rating exposed in
structured data. Emitting an inflated `AggregateRating` is a Google structured-data violation
and a trust failure; the schema enforces the distinction rather than relying on a query
convention.

## 25.7 Staff, roles, permissions

Full rationale in [24-employee-permission-architecture.md](24-employee-permission-architecture.md).
The schema shape:

```prisma
model StaffUser {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String?
  firstName     String
  lastName      String
  avatarMediaId String?
  status        StaffStatus @default(INVITED)
  locale        Locale     @default(uk)

  twoFactorSecret     String?                       // AEAD-encrypted; MANDATORY for every staff account (round 8 §L14)
  twoFactorEnabledAt  DateTime?                     // null = must enrol before anything else
  twoFactorLastStep   Int?                          // last accepted TOTP time-step; replay guard
  passwordChangedAt   DateTime?
  lastLoginAt         DateTime?
  failedLoginCount    Int      @default(0)
  lockedUntil         DateTime?

  invitedById   String?
  invitedAt     DateTime?
  suspendedAt   DateTime?
  deletedAt     DateTime?
  createdAt     DateTime   @default(now())

  roles         StaffRoleAssignment[]
  grants        StaffPermissionGrant[]              // per-user overrides on top of roles
  sessions      StaffSession[]
  recoveryCodes StaffRecoveryCode[]
  auditEntries  AuditLog[]
  @@index([status])
}

enum StaffStatus { INVITED ACTIVE SUSPENDED BLOCKED DEACTIVATED }

model Role {
  id           String   @id @default(cuid())
  key          String   @unique                     // owner | administrator | manager | ...
  name         String
  description  String?
  isSystem     Boolean  @default(false)             // system roles cannot be deleted
  permissions  RolePermission[]
  assignments  StaffRoleAssignment[]
}

model Permission {
  id       String @id @default(cuid())
  key      String @unique                           // "products.publish", "orders.export"
  resource String                                   // "products"
  action   String                                   // "publish"
  isDangerous Boolean @default(false)               // forces a confirm step in the admin UI
  roles    RolePermission[]
  grants   StaffPermissionGrant[]
  @@unique([resource, action])
}

model RolePermission {
  roleId       String
  permissionId String
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
}

model StaffRoleAssignment {
  staffUserId String
  roleId      String
  assignedAt  DateTime @default(now())
  assignedById String?
  staffUser StaffUser @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  role      Role      @relation(fields: [roleId], references: [id])
  @@id([staffUserId, roleId])
}

// Per-user override. effect=DENY always beats any ALLOW from a role.
model StaffPermissionGrant {
  staffUserId  String
  permissionId String
  effect       GrantEffect
  grantedById  String?
  grantedAt    DateTime @default(now())
  expiresAt    DateTime?
  staffUser  StaffUser  @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([staffUserId, permissionId])
}

enum GrantEffect { ALLOW DENY }

model StaffSession {
  id           String   @id @default(cuid())
  staffUserId  String
  refreshTokenHash String @unique                   // hash only; the token itself is never stored
  ipAddress    String
  userAgent    String
  deviceLabel  String?
  createdAt    DateTime @default(now())
  lastSeenAt   DateTime @default(now())
  expiresAt    DateTime
  revokedAt    DateTime?
  revokedById  String?
  rememberDevice Boolean @default(false)           // «Запам'ятати на 7 днів»: 7 d absolute, else ≤ 12 h
  mfaVerifiedAt  DateTime                          // no session exists without a passed second factor
  staffUser StaffUser @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  @@index([staffUserId, revokedAt])
  @@index([expiresAt])
}

// 10 per user, shown once at enrolment. Hash only (Argon2id); single use.
model StaffRecoveryCode {
  id          String    @id @default(cuid())
  staffUserId String
  codeHash    String
  usedAt      DateTime?
  createdAt   DateTime  @default(now())
  staffUser StaffUser @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  @@index([staffUserId, usedAt])
}

model AuditLog {
  id           String   @id @default(cuid())
  actorId      String?
  actorEmail   String                               // denormalised: survives user deletion
  action       String                               // "product.price.updated"
  resourceType String
  resourceId   String?
  resourceLabel String?                             // "Ліжник «Черемош», 150×200"
  before       Json?
  after        Json?
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
  actor StaffUser? @relation(fields: [actorId], references: [id], onDelete: SetNull)
  @@index([resourceType, resourceId, createdAt])
  @@index([actorId, createdAt])
  @@index([createdAt])
}
```

`AuditLog` receives `REVOKE UPDATE, DELETE` for the application role in a migration. The
application connects as a user that can only `INSERT` and `SELECT` on this table. Without that
grant the audit requirement is decorative.

`actorEmail` is denormalised deliberately: when a staff member is deleted, the audit trail
must still say who did what.

## 25.8 Content: blog, pages, gallery, promotions, leads

```prisma
enum PostStatus { DRAFT SCHEDULED PUBLISHED ARCHIVED }

model Post {
  id           String     @id @default(cuid())
  status       PostStatus @default(DRAFT)
  coverMediaId String?
  authorId     String?
  readMinutes  Int?
  publishedAt  DateTime?
  scheduledFor DateTime?
  deletedAt    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  translations PostTranslation[]
  tags         PostTag[]
  @@index([status, publishedAt])
  @@index([status, scheduledFor])
}

model PostTranslation {
  id              String @id @default(cuid())
  postId          String
  locale          Locale
  title           String
  slug            String
  excerpt         String  @db.Text
  bodyJson        Json                              // rich text as a structured document
  bodyPlain       String  @db.Text                  // generated — full-text search + AI extraction
  metaTitle       String?
  metaDescription String?
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@unique([postId, locale])
  @@unique([locale, slug])
}

model MediaAlbum {
  id        String   @id @default(cuid())
  key       String   @unique                        // "production-2025-winter"
  coverMediaId String?
  isPublic  Boolean  @default(true)
  position  Int      @default(0)
  createdAt DateTime @default(now())
  media     Media[]
  translations MediaAlbumTranslation[]
}

enum PromotionType { PERCENTAGE FIXED FREE_SHIPPING BUNDLE }
enum DiscountSource { PROMO_CODE VOLUME }          // round 8 §L14 — volume tiers live in Setting pricing.volume_tiers

model Promotion {
  id            String        @id @default(cuid())
  code          String?       @unique               // null = automatic promotion
  type          PromotionType
  valueMinor    Int?
  percentage    Int?
  minSubtotalMinor Int?
  usageLimit    Int?
  usageCount    Int           @default(0)
  perCustomerLimit Int?
  appliesToProductIds  String[]
  appliesToCategoryIds String[]
  startsAt      DateTime?
  endsAt        DateTime?
  isActive      Boolean       @default(true)
  createdById   String?
  createdAt     DateTime      @default(now())
  @@index([isActive, startsAt, endsAt])
}

model Banner {
  id           String   @id @default(cuid())
  placement    String                               // "home_hero" | "category_top" | "announcement_bar"
  mediaId      String?
  mobileMediaId String?
  linkUrl      String?
  position     Int      @default(0)
  startsAt     DateTime?
  endsAt       DateTime?
  isActive     Boolean  @default(true)
  translations BannerTranslation[]
  @@index([placement, isActive, position])
}

// REMOVED from v1 by round 10 §P7a: the site has no contact or wholesale form, so Lead has no
// source. Kept for the record; not migrated. MailThread.leadId (§25.8c) is dropped with it.
enum LeadStatus { NEW CONTACTED QUALIFIED WON LOST SPAM }
enum LeadKind   { WHOLESALE PRIVATE_LABEL PRESS GENERAL }

model Lead {
  id           String     @id @default(cuid())
  kind         LeadKind   @default(WHOLESALE)
  status       LeadStatus @default(NEW)
  companyName  String?
  contactName  String
  email        String
  phone        String?
  country      String?
  website      String?
  businessType String?                              // shop | hotel | designer | reseller
  estimatedVolume String?
  message      String?    @db.Text
  interestedProductIds String[]
  sourcePath   String?
  utm          Json?
  assignedToId String?
  internalNote String?    @db.Text
  createdAt    DateTime   @default(now())
  @@index([status, createdAt])
  @@index([kind, status])
}
```

`bodyJson` plus a generated `bodyPlain` is deliberate. `bodyJson` renders; `bodyPlain` feeds
Postgres full-text search and the AI-search extraction pipeline described in
[30-ai-search-optimization.md](30-ai-search-optimization.md). Deriving plain text at query time
would make search unusably slow.

## 25.8b Models referenced above but not yet defined

Caught during the navbar and footer specification work. Several relations were declared on
parent models without their target model being written out. Defined here rather than inline so
the repetitive translation shape stays in one place.

### Remaining translation tables

Every one follows the §25.2 pattern exactly — composite unique on `(parentId, locale)`, cascade
delete, and a locale index.

```prisma
model OptionTypeTranslation {
  id           String @id @default(cuid())
  optionTypeId String
  locale       Locale
  name         String                                 // "Розмір", "Size", "Rozmiar", "Größe"
  optionType OptionType @relation(fields: [optionTypeId], references: [id], onDelete: Cascade)
  @@unique([optionTypeId, locale])
}

model OptionValueTranslation {
  id            String @id @default(cuid())
  optionValueId String
  locale        Locale
  label         String                                 // "Вишневий", "Cherry", …
  optionValue OptionValue @relation(fields: [optionValueId], references: [id], onDelete: Cascade)
  @@unique([optionValueId, locale])
}

model AttributeDefinitionTranslation {
  id           String @id @default(cuid())
  definitionId String
  locale       Locale
  name         String                                 // "Щільність"
  helpText     String?                                // shown in the PDP spec table tooltip
  definition AttributeDefinition @relation(fields: [definitionId], references: [id], onDelete: Cascade)
  @@unique([definitionId, locale])
}

model MediaAlbumTranslation {
  id      String @id @default(cuid())
  albumId String
  locale  Locale
  title   String
  description String? @db.Text
  album MediaAlbum @relation(fields: [albumId], references: [id], onDelete: Cascade)
  @@unique([albumId, locale])
}

model BannerTranslation {
  id       String @id @default(cuid())
  bannerId String
  locale   Locale
  headline String?
  subline  String?
  ctaLabel String?
  linkUrl  String?                                     // per-locale override of Banner.linkUrl
  banner Banner @relation(fields: [bannerId], references: [id], onDelete: Cascade)
  @@unique([bannerId, locale])
}
```

`BannerTranslation.linkUrl` overriding the parent matters because an announcement bar pointing
at a Ukrainian-only article should point somewhere else on the `de` site, rather than dumping a
German visitor into a language they cannot read.

### Customer addresses and blog tags

```prisma
model CustomerAddress {
  id         String  @id @default(cuid())
  customerId String
  label      String?                                   // "Дім", "Офіс"
  firstName  String
  lastName   String
  phone      String
  country    String  @default("UA")
  region     String?
  city       String
  carrier    ShippingCarrier
  npWarehouseRef String?                               // Nova Poshta branch/locker
  streetAddress  String?                               // courier delivery only
  postalCode String?
  isDefault  Boolean @default(false)
  createdAt  DateTime @default(now())
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  @@index([customerId, isDefault])
}

model Tag {
  id           String @id @default(cuid())
  key          String @unique
  translations TagTranslation[]
  posts        PostTag[]
}

model TagTranslation {
  id     String @id @default(cuid())
  tagId  String
  locale Locale
  name   String
  slug   String
  tag Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@unique([tagId, locale])
  @@unique([locale, slug])
}

model PostTag {
  postId String
  tagId  String
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([postId, tagId])
  @@index([tagId])
}
```

### Wishlist — deliberately not a database table

An earlier revision modelled `WishlistItem` with a merge-on-login flow. **That model is
removed.** [00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout
permanent, so there is no login to merge on and no account to attach a wishlist to.

The wishlist lives in `localStorage` only: device-local, no server record, no personal data, no
GDPR surface, no synchronisation problem. The UI must say so plainly — «Збережено на цьому
пристрої» — because a saved list that silently vanishes on another device is worse than no
saved list at all.

Reintroducing a server-side wishlist would require reintroducing customer accounts, which §E12
rules out permanently.

## 25.8c Mail

Added by [00-client-decisions-7.md](00-client-decisions-7.md) §K2: business mail is read and
answered in the admin panel. Pipeline in [26-api-architecture.md](26-api-architecture.md)
§26.16.2, threat model in [32-security-architecture.md](32-security-architecture.md) §32.16a,
screen in [23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.13a.

```prisma
enum MailDirection     { INBOUND OUTBOUND }
enum MailMessageKind   { CUSTOMER STAFF_REPLY TRANSACTIONAL }
enum MailThreadStatus  { OPEN WAITING CLOSED SPAM }   // OPEN = needs a reply from us
enum MailDeliveryState { QUEUED SENT DELIVERED BOUNCED COMPLAINED FAILED }
enum MailSenderAction  { BLOCK ALLOW }

// One row per receiving address. At launch exactly one: info@ (00-client-decisions-8.md §L2).
model Mailbox {
  id            String   @id @default(cuid())
  address       String   @unique                  // lower-case, on {{DOMAIN}}
  displayName   String                            // «Вівчарик» — the From: display name
  isShared      Boolean  @default(true)           // false = visible to members only
  signatureHtml String?  @db.Text
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  members MailboxMember[]
  threads MailThread[]
}

model MailboxMember {
  mailboxId   String
  staffUserId String
  mailbox   Mailbox   @relation(fields: [mailboxId], references: [id], onDelete: Cascade)
  staffUser StaffUser @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  @@id([mailboxId, staffUserId])
}

model MailThread {
  id               String           @id @default(cuid())
  mailboxId        String
  subject          String
  counterpartEmail String                         // the customer side, lower-case
  counterpartName  String?
  status           MailThreadStatus @default(OPEN)
  assignedToId     String?
  orderId          String?
  leadId           String?
  lastMessageAt    DateTime
  lastInboundAt    DateTime?                      // drives SLA colouring
  createdAt        DateTime         @default(now())
  mailbox    Mailbox    @relation(fields: [mailboxId], references: [id])
  assignedTo StaffUser? @relation("MailThreadAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
  order      Order?     @relation(fields: [orderId], references: [id], onDelete: SetNull)
  lead       Lead?      @relation(fields: [leadId], references: [id], onDelete: SetNull)
  messages MailMessage[]
  reads    MailThreadRead[]
  drafts   MailDraft[]
  @@index([mailboxId, status, lastMessageAt])
  @@index([assignedToId, status])
  @@index([counterpartEmail])
  @@index([orderId])
  @@index([leadId])
}

model MailMessage {
  id                String             @id @default(cuid())
  threadId          String
  direction         MailDirection
  kind              MailMessageKind
  messageIdHeader   String                        // RFC 5322 Message-ID; generated by us on outbound
  inReplyTo         String?
  references        String[]
  fromEmail         String
  fromName          String?
  toEmails          String[]
  ccEmails          String[]
  subject           String
  textBody          String?            @db.Text   // null when bodyWithheld
  htmlSanitized     String?            @db.Text   // sanitised at ingest; raw HTML is never rendered
  bodyWithheld      Boolean            @default(false) // secret-bearing template: metadata only
  rawObjectKey      String?                       // R2 key of the original MIME, inbound only
  authVerdict       Json?                         // { spf, dkim, dmarc, lookalike }
  spamScore         Float?
  templateKey       String?                       // TRANSACTIONAL only
  sentById          String?                       // STAFF_REPLY only
  providerMessageId String?
  deliveryState     MailDeliveryState?            // OUTBOUND only, updated from {{ESP}} webhooks
  occurredAt        DateTime                      // received or sent
  createdAt         DateTime           @default(now())
  thread MailThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sentBy StaffUser? @relation("MailMessageSender", fields: [sentById], references: [id], onDelete: SetNull)
  attachments MailAttachment[]
  @@unique([threadId, messageIdHeader])           // one copy per thread, even if re-ingested
  @@index([messageIdHeader])                      // threading lookup
  @@index([threadId, occurredAt])
  @@index([providerMessageId])
}

model MailAttachment {
  id          String   @id @default(cuid())
  messageId   String
  filename    String
  contentType String                              // as declared; never trusted for rendering
  sizeBytes   Int
  sha256      String
  objectKey   String                              // private R2 bucket
  contentId   String?                             // cid: for inline images
  isInline    Boolean  @default(false)
  riskFlag    String?                             // executable | macro | archive | null
  message MailMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)
  @@index([messageId])
}

model MailThreadRead {
  threadId    String
  staffUserId String
  readAt      DateTime                          // = occurredAt of the last message SHOWN, not now()
  thread    MailThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  staffUser StaffUser  @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  @@id([threadId, staffUserId])
}

model MailDraft {
  threadId    String
  staffUserId String
  bodyHtml    String   @db.Text
  updatedAt   DateTime @updatedAt
  thread    MailThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  staffUser StaffUser  @relation(fields: [staffUserId], references: [id], onDelete: Cascade)
  @@id([threadId, staffUserId])
}

model MailSenderRule {
  id          String           @id @default(cuid())
  pattern     String           @unique            // "name@host" or "@host"
  action      MailSenderAction
  createdById String?
  createdAt   DateTime         @default(now())
}

// Idempotency and reconciliation for the inbound webhook.
model MailInboundReceipt {
  objectKey   String    @id                       // R2 key written by the Email Worker
  envelopeTo  String
  receivedAt  DateTime
  processedAt DateTime?
  attempts    Int       @default(0)
  lastError   String?
  @@index([processedAt, receivedAt])
}
```

Back-relations on `StaffUser`, `Order` and `Lead` follow from the relations above and are not
repeated here.

Design notes:

- **`MailThread` links to `Order` and `Lead`, never to `Customer`.** Guest checkout resolves
  history by email (§25.6), and so does mail: `counterpartEmail` is the join key to the customer
  panel.
- **Unread state is per person** (`MailThreadRead`), because once Іван adds staff, one person
  reading `info@` does not mean another has seen it. A thread is unread for a user when
  `lastInboundAt > readAt` or no row exists — so a new inbound message makes it unread again
  with no extra write ([00-client-decisions-8.md](00-client-decisions-8.md) §L8). «Позначити
  непрочитаним» deletes the row.
- **`bodyWithheld`** exists for the staff invitation, staff password reset and guest
  order-access templates. The panel records that they were sent and to whom; the token they
  carried never reaches the database a second time.
- **No soft delete.** Archiving is `status = CLOSED`; `mail.delete` is a hard delete of the row
  and its R2 objects, used for phishing and unlawful content, and audited.

## 25.8d Quick-order requests and Telegram

Added by [00-client-decisions-9.md](00-client-decisions-9.md) §P4.1 and §P5.4.

```prisma
enum QuickOrderStatus { NEW CALLED CONVERTED DECLINED SPAM }

// «Купити в 1 клік»: a phone number and a product, not an order. The manager calls,
// then creates the real Order in the admin; prepayment rules apply at that point.
model QuickOrderRequest {
  id           String           @id @default(cuid())
  status       QuickOrderStatus @default(NEW)
  phone        String                              // E.164, Ukrainian numbers only
  productId    String
  variantId    String?
  quantity     Int              @default(1)
  locale       Locale           @default(uk)
  sourcePath   String?
  assignedToId String?
  orderId      String?          @unique            // set on CONVERTED
  internalNote String?          @db.Text
  createdAt    DateTime         @default(now())
  calledAt     DateTime?
  @@index([status, createdAt])
}
```

Telegram configuration lives in `Setting` rows, not a table: `notify.telegram.chat_id`,
`notify.telegram.events` (`order_created`, `quick_order_created`, `mail_thread_opened`,
`weekly_report`). The bot token is a secret, never a `Setting`. Phone numbers in
`QuickOrderRequest` are personal data: erased by the anonymisation routine and purged 8 months
after `CONVERTED`, `DECLINED` or `SPAM`, like mail (§L8).


```prisma
// Ratified from 26-api-architecture.md. A dedicated table rather than keying on Cart.id,
// because idempotency must survive cart deletion and must cover non-cart operations
// (refunds, admin bulk writes) that have no cart to key on.
model IdempotencyKey {
  key          String   @id
  scope        String                                // "checkout" | "refund" | "bulk-import"
  requestHash  String                                // rejects key reuse with a different body
  responseCode Int?
  responseBody Json?
  lockedAt     DateTime?                             // in-flight guard against double submit
  createdAt    DateTime @default(now())
  expiresAt    DateTime
  @@index([expiresAt])
  @@index([scope, createdAt])
}

model Redirect {
  id         String @id @default(cuid())
  fromPath   String @unique
  toPath     String
  statusCode Int    @default(301)
  hitCount   Int    @default(0)
  createdAt  DateTime @default(now())
}

model SearchQueryLog {
  id          String   @id @default(cuid())
  query       String
  locale      Locale
  resultCount Int
  clickedId   String?
  createdAt   DateTime @default(now())
  @@index([query, createdAt])
}

// REMOVED by round 9 (no email newsletter, 00-client-decisions-9.md part 5). Kept here for
// the record; not migrated.
model NewsletterSubscriber {
  id           String   @id @default(cuid())
  email        String   @unique
  locale       Locale   @default(uk)
  confirmedAt  DateTime?                            // double opt-in — required for the de locale
  unsubscribedAt DateTime?
  source       String?
  createdAt    DateTime @default(now())
}

model Setting {
  key       String   @id
  value     Json
  updatedById String?
  updatedAt DateTime @updatedAt
}

// Return policy is PER LOCALE, not site-wide. Ratified from 29-seo-architecture.md after
// 00-client-decisions-2.md §E11 made en/pl/de transactional.
//
// The Ukrainian 14-day right and the EU 14-day right of withdrawal are different legal
// instruments with different triggers, different conditions and different refund
// obligations — they merely happen to share a number. Emitting one MerchantReturnPolicy
// for all four locales would misstate the law in at least one of them.
model ReturnPolicy {
  id             String  @id @default(cuid())
  locale         Locale  @unique
  returnDays     Int
  // Statutory basis differs by market; drives the copy and the schema.org enumeration.
  basis          String                              // "UA_CONSUMER_RIGHTS" | "EU_DISTANCE_SELLING"
  returnFeesPaidBy String                            // "CUSTOMER" | "MERCHANT" | "MERCHANT_IF_DEFECT"
  refundDays     Int                                 // days to refund after receipt
  restockingFeePercent Int @default(0)
  withdrawalFormUrl String?                          // EU model withdrawal form — de, pl
  notesMarkdown  String? @db.Text
  updatedAt      DateTime @updatedAt
}
```

`SearchQueryLog` is not analytics decoration. Zero-result queries are the highest-signal
merchandising input a store has — they say exactly what customers expect to find and cannot.
The admin dashboard surfaces them.

## 25.8e Round 10 additions — attribution, call confirmation, fiscal receipts, translation source

From [00-client-decisions-10.md](00-client-decisions-10.md).

```prisma
// On Order (fields added):
//   attribution        Json?       // { utm_source, utm_medium, utm_campaign, referrer, from } captured at checkout — feeds the "where buyers came from" report
//   confirmedByCallAt  DateTime?   // «Підтверджено дзвінком»; required before PACKING
//   confirmedByCallById String?
//   customerNote       — no longer written by checkout (round 9 part 4); column kept nullable

enum FiscalReceiptKind   { SALE RETURN }
enum FiscalReceiptStatus { PENDING ISSUED FAILED }

model FiscalReceipt {
  id            String              @id @default(cuid())
  orderId       String
  kind          FiscalReceiptKind
  status        FiscalReceiptStatus @default(PENDING)
  amountMinor   Int
  provider      String                            // "wayforpay" (built-in ПРРО); fallback "dps" (round 14)
  providerId    String?             @unique
  fiscalCode    String?                           // the receipt's fiscal number
  receiptUrl    String?                           // official receipt link, shown on the order page only
  // Round 14 (00-client-decisions-14.md):
  isPrepayment  Boolean             @default(false) // receipt for the 460 ₴ prepayment; the remainder is receipted by Nova Poshta
  qrPayload     String?                           // the tax service's verification QR content
  pdfUrl        String?                           // official PDF from the provider; the site never renders its own
  // Kept at least 3 years (F6 #49).
  lastError     String?
  createdAt     DateTime            @default(now())
  issuedAt      DateTime?
  order Order @relation(fields: [orderId], references: [id])
  @@index([orderId])
  @@index([status, createdAt])
}

// On every *Translation model (fields added):
//   source      TranslationSource @default(HUMAN)
//   sourceHash  String?            // hash of the uk text this translation was made from
enum TranslationSource { MACHINE HUMAN }
```

**Translation rule.** Saving `uk` text re-translates a locale's field only when that field's
`source = MACHINE`. A `HUMAN` field is never overwritten; when its `sourceHash` no longer matches
the current `uk` text, the admin flags it as stale. Legal pages are always `HUMAN`.

## 25.8f Product templates, libraries, revisions, stock movements

From [00-client-decisions-12.md](00-client-decisions-12.md); behaviour in
[37-product-admin-system.md](37-product-admin-system.md).

```prisma
model ProductTemplate {
  id              String   @id @default(cuid())
  key             String   @unique              // "lizhnyk" | "podushka" | "odyah" | ...
  typePrefix      String                        // «Ліжник» — prefixed to product names (uk; translated)
  defaultCategoryId String?
  pricingUnits    PricingUnit[]                 // allowed units, e.g. [SKEIN, KILOGRAM] for yarn
  axes            String[]                      // OptionType keys in order: ["size","color","pattern"]
  requiredFields  String[]                      // "name","price","photos>=3","size","color","composition","description","packedWeight"
  storyStages     String[]                      // «Історія виробу» defaults, e.g. ["washing","carding","spinning","weaving"]
  sizeCalcOverhangCm Int?                        // ліжник template: bed + overhang
  sizeTable       Json?                         // clothing: per size {chestCm, lengthCm}
  seoTitlePattern String?
  isHidden        Boolean  @default(false)      // the prepared ДЕРЕВО template
  createdAt       DateTime @default(now())
  attributes      ProductTemplateAttribute[]
}

model ProductTemplateAttribute {
  templateId    String
  attributeId   String                          // AttributeDefinition
  isRequired    Boolean  @default(false)
  sortOrder     Int      @default(0)
  @@id([templateId, attributeId])
}

// Product gains:
//   templateId        String        // immutable after creation
//   searchSynonyms    String[]      // «Інші назви»
//   pinnedRelatedIds  String[]      // pinned «З цим купують»
//   badgeOverride     Json?         // manual add/remove of Хіт / Новинка / Знижка
//   storyStagesOff    String[]      // unticked «Історія виробу» stages
//   liveRevisionId    String?
//   draftRevisionId   String?
//   editLockById      String?
//   editLockAt        DateTime?

// OptionValue gains (sizes, colours, patterns are OptionValues of template axes):
//   displayName       per locale via OptionValueTranslation
//   dimensions        Json?          // {widthCm, lengthCm} or {insoleCm} or {lengthCm}
//   sortKey           Int
//   colorFamily       String?        // «сірий», «багатоколірний» ...
//   isNaturalUndyed   Boolean @default(false)
//   isHidden          Boolean @default(false)   // replaces deletion once in use

// ProductVariant gains:
//   madeToOrderDays   Int?           // per-variant «Виготовимо під замовлення»
//   isMainColor       Boolean @default(false)
//   discountPercent   Int?
//   discountStartsAt  DateTime?
//   discountEndsAt    DateTime?     // compareAtMinor restored automatically at the end

model Material {
  id          String  @id @default(cuid())
  group       String                            // вовна | овчина | шкіра | змішані
  careSection String?                           // anchor on the shared care page
  isHidden    Boolean @default(false)
  translations MaterialTranslation[]
}

model ProductComposition {
  productId  String
  materialId String
  role       String  @default("main")           // main | warp | weft | filling
  percent    Int                                // per role, must total 100
  @@id([productId, materialId, role])
}

model GlossaryTerm {
  id    String @id @default(cuid())
  term  String @unique                          // «полонина»
  translations GlossaryTermTranslation[]        // explanation per locale
}

model ProductRevision {
  id          String   @id @default(cuid())
  productId   String
  snapshot    Json                              // full product + variants + media order + texts
  createdById String?
  createdAt   DateTime @default(now())
  publishedAt DateTime?
  @@index([productId, createdAt])
}

enum StockMovementSource { ORDER CANCELLATION SHOP_SALE MANUAL IMPORT }

model StockMovement {
  id          String              @id @default(cuid())
  variantId   String
  delta       Int                               // in quantityMilli units for weight-priced goods
  source      StockMovementSource
  orderId     String?
  reason      String?                           // required for MANUAL
  createdById String?
  createdAt   DateTime            @default(now())
  @@index([variantId, createdAt])
}
```

`Media.focalX/focalY` (§25.4) already hold the focal point; photo slots per colour reuse
`ProductMedia` with an optional `optionValueId`. Price history is read from `AuditLog` (§24.12).

## 25.8g Round 16 — ONEKNIGHT seams (not connected)

From [00-client-decisions-16.md](00-client-decisions-16.md). Nullable, unused until a port is
switched to `oneknight`; the site's own ids never change.

```prisma
// On Product, ProductVariant, Category, Order, Customer, Review (field added):
//   externalRef   String?  @unique   // "oneknight:<id>"
// On Order (field added):
//   externalNumber String?  @unique  // ONEKNIGHT's numeric order number; `number` stays VCH-YY-NNNN
//   okContext      Json?             // oneknight.context() captured at checkout, only if ok.js was loaded (after consent)

model ProcessedWebhookEvent {
  id          String   @id            // sender's event id — idempotency
  sender      String                  // "oneknight"
  type        String
  receivedAt  DateTime @default(now())
  processedAt DateTime?
  @@index([sender, receivedAt])
}
```

No outbox table: outgoing events are pg-boss jobs inserted in the same transaction, with the
idempotency key as `singletonKey` (round 16 O2 #2).

## 25.8h Build-time additions (round 17)

Gaps found while building, ratified here. None changes a client decision.

| Model | Field | Why |
|---|---|---|
| `Category` | `key String? @unique` | A stable machine key independent of translated slugs |
| `Category` | `hiddenLocales Locale[] @default([])` | The "three-row toggle" of 04 §4.2: Овчина and Шкіра (and their children) 404 in `pl`, `de`; their products too |
| `AttributeDefinition` | `options Json?` | Value lists for list attributes (yarn thickness тонка/середня/товста; pillow fillings when the owner adds them) |
| `Order` | `email String?` | Email is optional for ordinary `uk` orders (round 10 §P5a) |
| `Order` | `prepaymentMinor Int?` | The partial prepayment of round 8 §L14: `min(max(round(subtotal × 10%), 46000), total)` |
| `Order` | `amountDueNowMinor Int?` | What the «Оплатити …» button charges (round 10 part 5 #18) |
| `CartItem` | `customSpec Json?`, `specKey String @default("")`; unique `[cartId, variantId, specKey]` | A custom-size line (`{ widthCm, lengthCm }`) next to a stock-size line of the same variant |
| `Order` | `expectedDispatchAt DateTime?` | Stamped once on entering `IN_PRODUCTION`, never recomputed (23 §23.8.2, 18 §18.13) |
| — | sequence `order_number_seq` | `Order.number` = `VCH-YY-NNNN` |

## 25.8i Product editor working copy (build)

`ProductRevision` is append-only (§25.1), so autosave cannot overwrite a draft revision.

| Model | Field | Why |
|---|---|---|
| `Product` | `draftDocument Json?`, `draftUpdatedAt`, `draftUpdatedById` | The editor's working copy (37 §37.5), overwritten by autosave. `null` = no unpublished changes |
| `Post` | `draftDocument Json?`, `draftUpdatedAt` | Edits to a **published** article (title, excerpt, body, meta, tags) until «Опублікувати зміни»; unpublished articles are edited in place |

Publishing applies the document to the live tables in one transaction, writes a `ProductRevision`
with the same snapshot and `publishedAt`, sets `liveRevisionId`, and clears `draftDocument`.
«Повернути» copies an old revision's snapshot into `draftDocument`. `draftRevisionId` stays unused.
The storefront reads only the live tables. The uk slug is generated at first publish and then frozen.

### Production stages (20 §20.6)

| Model | Fields | Why |
|---|---|---|
| `ProductionStage` | `key @unique`, `track` (`WOOL` \| `HIDE`), `position`, `isActive`, `photoId?`, `videoId?` | The stages of «Як ми виробляємо», editable without a deploy. Keys match `ProductTemplate.storyStages` |
| `ProductionStageTranslation` | `title`, `body`, `duration?`, `temperature?`, `machine?`, `person?` per locale | The four fact slots stay `null` until the client states them and are then shown; never a placeholder |

Seeded create-only with the seven stages of round 9 §F1. The API drops a stage without a photo in
production (the §20.6 render rule); in development it returns it with `preview: true`.

### Review email (round 13 N2)

`Review.authorEmail` becomes optional: imported Prom reviews have no address. The public API still
requires it for reviews written on the site (moderation contact); it is never published.

### Collections (round 10 part 2 #18, round 12 T9)

| Model | Fields | Why |
|---|---|---|
| `Collection` | `key @unique`, `sortOrder`, `isActive` | На подарунок, Весільні, Для дітей (seeded create-only by key) |
| `CollectionTranslation` | `name`, `slug`, `description?`, `metaTitle?`, `metaDescription?` per locale | The collection page is a category page with its own text (round 10 part 7 #22) |
| `CollectionProduct` | `collectionId`, `productId`, `sortOrder` | Membership from the product editor's ticks (applied on publish); the order is set on the collection page |

The rotating card photographs of round 11 wait for media storage.

## 25.10 Indexing and performance notes

1. **Full-text search** uses a generated `tsvector` column per `ProductTranslation` with a GIN
   index and Ukrainian + English dictionaries. Postgres ships no Ukrainian stemmer by default;
   `unaccent` plus a simple configuration is the launch position, with a move to a dedicated
   search service only if [00-assumptions.md](00-assumptions.md) B6 exceeds ~2,000 SKUs.
2. **Facet counts** are computed by a single grouped query against `ProductAttributeValue`
   joined to the filtered product set, not by N queries per facet.
3. **Denormalised `Product.priceMinMinor` / `priceMaxMinor` / `inStock`** exist purely so the
   listing page never aggregates across `ProductVariant` at request time. They are recomputed
   inside the same transaction as any variant mutation — a Prisma extension enforces this so it
   cannot be forgotten.
4. **`deletedAt` filtering** is applied by Prisma middleware globally, with an explicit
   `withDeleted()` escape used only by the admin restore flow.
5. **Connection pooling** via PgBouncer in transaction mode; Prisma's `?pgbouncer=true` flag is
   required or prepared statements break.

## 25.11 Migration and seed policy

- Migrations are forward-only, reviewed, and never edited after being applied to production.
- Seeds create: the 8 system roles, the full permission catalogue, option types, attribute
  definitions, the `uk` locale rows for the category tree, and one owner account whose password
  must be rotated on first login.
- The permission catalogue is generated from a single TypeScript constant so that the DB rows
  and the type-level permission union cannot drift. Drift between them is the classic RBAC bug
  and it is prevented structurally, not by discipline.
