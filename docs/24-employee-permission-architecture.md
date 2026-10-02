# 24 — Employee & Permission Architecture

> **Round 12 — product admin:** New permissions `templates.manage` ⚠, `libraries.manage`, `stock.shop_sale`; `products.publish` Owner + Administrator only; hard `products.delete` Owner only — [37-product-admin-system.md](37-product-admin-system.md) §37.10.
>
> **Round 14 — receipts:** `payments.refund` (refund with a return receipt) and viewing fiscal receipts: Owner + Administrator — [00-client-decisions-14.md](00-client-decisions-14.md) F6.

> **Round 10 — interface questionnaire ([00-client-decisions-10.md](00-client-decisions-10.md)) supersedes this document on:**
>
> - `leads.*` permissions are removed with the Leads module (round 10 §P7a); `mail.*` no longer links threads to leads.

> **Round 9 — client questionnaire ([00-client-decisions-9.md](00-client-decisions-9.md)) supersedes this document on:**
>
> - **Любов is seeded later by Іван as Administrator**, not as a second Owner (follow-up §F3). An Administrator cannot reset the Owner's 2FA; sole-Owner recovery stays break-glass (§24.11).
> - Quick-order requests are gated by `orders.read` (view) and `orders.create` (convert to an order); no new resource.


> **Authority note.** Revised against [00-client-decisions-5.md](00-client-decisions-5.md) and
> [00-client-decisions-4.md](00-client-decisions-4.md), which outrank
> [00-client-decisions-3.md](00-client-decisions-3.md) and this document. The guest-checkout
> consequences of §E12 were already carried and stand.
>
> | Ruling | Effect here |
> |---|---|
> | **F4** (round 3) | The consistency audit added **`orders.quote`** (§24.3, §24.4), already referenced as existing by [26-api-architecture.md](26-api-architecture.md) §26.10 and [18-checkout-specification.md](18-checkout-specification.md) §18.23 |
> | **H3** — Любов owns international quotes | `orders.quote` acquires a **default assignee** rather than a new key. §24.5 |
> | **H1.3** — the return-shipping deposit | Adds **`payments.waive_deposit`** ⚠ (§24.4). The audit found the gap: waiving a deposit is not covered by `payments.refund`, because it is a pricing decision taken *before* money moves |
> | **H3b** — custom sizing is a per-product admin toggle | Adds **`products.manage_custom_size`** (§24.4), separated from `products.update` for the same reason `products.manage_price` is |
> | **G2** — `OrderStatus.IN_PRODUCTION` | **No new permission.** It is an ordinary transition under `orders.change_status` |
> | **G1** — Іван primary phone, Любов ФОП seller of record | Nothing in the authorisation model branches on either fact; both stay comments in the seed (§24.16) |

This document specifies who may do what inside
[23-admin-panel-architecture.md](23-admin-panel-architecture.md), how that is decided, how it is
enforced, and how it is proven afterwards. The data shapes are fixed by
[25-database-schema.md](25-database-schema.md) §25.7 and are obeyed exactly; nothing here
introduces a table or a column that document does not define.

The operating context is a small team — **two owners**
([00-client-decisions-2.md](00-client-decisions-2.md) §E1), one to two managers, one content
person, plus warehouse staff ([00-assumptions.md](00-assumptions.md) E2) — handling real money
through manual bank reconciliation, real customer personal data across four locales, and a
catalogue that is the business's entire commercial surface. That combination is why the
permission model is more careful than the headcount suggests. Seven people with unrestricted
access to a payment-settings page is not a small-team simplification; it is an unbounded
liability with no audit trail.

**Staff authentication is the only authentication in this system.** The storefront has none:
[00-client-decisions-2.md](00-client-decisions-2.md) §E12 makes guest checkout permanent, so
there are no customer accounts, no customer login and no customer passwords. Everything in this
document therefore describes the *entire* identity surface of the product, which raises rather
than lowers the stakes on getting it right — there is no second, lower-privilege auth system to
absorb mistakes, and every credential that exists is a credential into the back office.

---

## 24.1 The model from first principles

Three primitives, and nothing else.

```
Permission   an atomic, named capability: "payments.refund"
Role         a named bundle of permissions: "manager"
Grant        a per-user override on a single permission: ALLOW or DENY
```

They compose in exactly one direction:

```
    StaffUser
       │
       ├── StaffRoleAssignment ──► Role ──► RolePermission ──► Permission
       │        (many roles per user, union of their permissions)
       │
       └── StaffPermissionGrant ──────────────────────────────► Permission
                (effect = ALLOW | DENY, optionally expiring)
```

Four rules, stated once and never bent:

1. **Roles grant permissions.** A user's base capability set is the *union* of the permissions
   of every role assigned to them. Union, not intersection — a person holding both
   `content_editor` and `warehouse` can do both jobs, which is precisely why they hold both.
2. **Per-user grants override roles.** A `StaffPermissionGrant` with `effect = ALLOW` adds a
   single capability without inventing a role for one person.
3. **DENY always beats ALLOW.** A `DENY` grant removes a permission regardless of how many
   roles supply it. This is stated in [25-database-schema.md](25-database-schema.md) §25.7 as
   a comment on the model and it is the load-bearing rule of the whole system.
4. **Absence is denial.** No permission is implied by any other. `products.update` does not
   imply `products.publish`; `orders.read` does not imply `orders.export`. Implicit hierarchies
   are where privilege escalation hides.

### Why DENY-wins rather than most-specific-wins or ALLOW-wins

Three orderings were available.

| Ordering | Consequence |
|---|---|
| **ALLOW wins** | A DENY can be defeated by adding any role that grants the permission. Revoking access then requires auditing every role the user holds — the revocation is not reliable, which makes it useless in the one situation it exists for. |
| **Most specific wins** (grant beats role, later grant beats earlier) | Requires a total ordering over grants and a timestamp comparison to answer "can this person refund?". Correct answers that are hard to compute are answered wrongly in practice. |
| **DENY wins** (chosen) | The answer is computable in one pass, independent of order, and monotone: adding roles can never re-enable something explicitly denied. |

The decisive case is concrete. A manager is suspected of mishandling refunds. The owner adds
`DENY payments.refund` at 09:00 while the investigation runs. Under ALLOW-wins, assigning that
person to cover an absent Administrator at 11:00 — a role that also grants `payments.refund`
(§24.5) — silently restores the refund capability. Under DENY-wins it cannot. A security control
that a routine administrative action can accidentally undo is not a control.

The cost is real and accepted: DENY is invisible in the role matrix, so a user with an
unexpected DENY appears to have a permission they do not have. §24.15 answers this by making
the effective-permission API return the *reason* for every decision, and the admin's employee
detail screen renders DENY grants as a prominent, separate block rather than a footnote.

### The resolution algorithm

```ts
export type Decision = {
  allowed: boolean;
  reason: 'role' | 'grant_allow' | 'grant_deny' | 'no_permission' | 'inactive_user';
  /** Which role or grant produced the decision — surfaced in the UI and in 403 bodies. */
  source?: string;
};

export function resolve(
  permission: PermissionKey,
  subject: {
    status: StaffStatus;
    roles: Array<{ key: string; permissions: ReadonlySet<PermissionKey> }>;
    grants: Array<{ permission: PermissionKey; effect: 'ALLOW' | 'DENY'; expiresAt: Date | null }>;
  },
  now: Date,
): Decision {
  // 0. Status gate. Only ACTIVE users hold any capability at all.
  if (subject.status !== 'ACTIVE') {
    return { allowed: false, reason: 'inactive_user', source: subject.status };
  }

  const live = subject.grants.filter(g => g.expiresAt === null || g.expiresAt > now);

  // 1. DENY first, unconditionally. Nothing below can overturn it.
  const deny = live.find(g => g.permission === permission && g.effect === 'DENY');
  if (deny) return { allowed: false, reason: 'grant_deny', source: 'explicit deny' };

  // 2. Explicit ALLOW.
  const allow = live.find(g => g.permission === permission && g.effect === 'ALLOW');
  if (allow) return { allowed: true, reason: 'grant_allow', source: 'explicit grant' };

  // 3. Union over roles.
  const role = subject.roles.find(r => r.permissions.has(permission));
  if (role) return { allowed: true, reason: 'role', source: role.key };

  // 4. Absence is denial.
  return { allowed: false, reason: 'no_permission' };
}
```

Step 0 matters more than it looks. Because the status gate lives inside resolution rather than
beside it, suspending a user removes every capability everywhere at once — API, UI, background
job — without touching a single role or grant row, and without any caller needing to remember
to check status separately.

Grant expiry (`StaffPermissionGrant.expiresAt`) is the mechanism for temporary elevation:
"Марія covers refunds until the 14th" is a grant with an end date, not a role change that
someone must remember to reverse. Nobody remembers to reverse it.

---

## 24.2 Why this beats a flat role enum

The obvious alternative for a seven-person business is `enum Role { OWNER, ADMIN, MANAGER, … }`
on `StaffUser`, with permission checks written as role comparisons. It is smaller, faster to
build, and wrong. The reasons are ordered by how soon each one bites.

| # | Failure of the flat enum | Consequence here, specifically |
|---|---|---|
| 1 | **Every new capability edits every call site.** Checks read `if (role === ADMIN \|\| role === MANAGER)` and are duplicated across dozens of routes. | Adding `payments.reconcile` (§23.8.3) means finding every conditional that should include it. The one that is missed is a security hole, and it is invisible in review. |
| 2 | **No exceptions without a new role.** | The client's actual request — Owner, Administrator, Manager, Content Editor, Warehouse, Support, Photographer, *plus custom roles* — is not expressible. The first "let the photographer also edit product descriptions" produces `photographer_plus`, and role count grows without bound. |
| 3 | **No revocation.** There is no way to say "this person, not this one thing". | The refund-investigation scenario above has no solution except demotion, which removes their ability to work at all. |
| 4 | **Roles become implicitly ordered.** `ADMIN > MANAGER > EDITOR` is assumed by comparison logic. | Warehouse and Content Editor are not comparable — neither is "above" the other. An ordering that does not exist in the business gets invented in the code and then relied upon. |
| 5 | **Nothing to render.** The UI cannot ask "may this user publish?" without re-implementing the role table in the client. | [23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.4 hides sidebar sections by permission; that requires permissions to be data, not a compiled-in conditional. |
| 6 | **Nothing to audit.** "Who could have done this in March?" is unanswerable once the enum's meaning has changed. | `RolePermission` rows are history. A code constant is not. |
| 7 | **No dangerous-action marking.** | `Permission.isDangerous` (§25.7) drives the confirm step in the admin. A flat enum has nowhere to put that flag. |

The cost of the relational model is roughly one extra day of build, one seed script, and a
five-table join that is cached per session (§24.15). That is a small price for the capability
in row 3 alone.

---

## 24.3 Permission naming

Every permission is `resource.action`, lowercase, singular action verbs, matching
`Permission.resource` and `Permission.action` with `@@unique([resource, action])` (§25.7). The
`key` column is the concatenation and is what code references.

Conventions that keep 90+ permissions legible:

- `read` — view the list and detail of a resource.
- `create`, `update`, `delete` — the obvious three. `delete` is soft delete everywhere
  ([25-database-schema.md](25-database-schema.md) §25.1); hard deletion is not a staff
  capability at all.
- **Verbs, not nouns, for anything with different blast radius from `update`.** `publish`,
  `archive`, `restore`, `export`, `reconcile`, `refund`, `import`, `translate`, `reorder`.
  Splitting `publish` out of `update` is the single most useful separation in the catalogue: it
  is what lets a Content Editor write freely and a Manager decide what the public sees.
- **`manage_x` for a coherent sub-area** that is not worth four separate permissions —
  `products.manage_media`, `promotions.manage_banners`, `employees.manage_sessions`.

---

## 24.4 The permission catalogue

One TypeScript constant is the source of truth for the database rows, the type-level union, the
API middleware, the UI checks, and the seed. Drift between a permission the code checks and a
permission the database contains is the classic RBAC bug, and
[25-database-schema.md](25-database-schema.md) §25.11 requires it to be prevented structurally.
§24.16 describes the mechanism; this is the constant itself.

`isDangerous` is not "important". It means: **this action destroys data, moves money, changes
who can act, or is publicly visible and hard to reverse.** It forces a typed confirmation step
in the admin UI (§25.7) and it always writes an audit entry.

```ts
// packages/auth/permissions.ts
// The ONLY definition of a permission anywhere in the codebase.

export interface PermissionSpec {
  readonly action: string;
  readonly label: string;        // uk source string; other locales via i18n key perm.<key>
  readonly isDangerous?: true;
}

export const PERMISSION_CATALOGUE = {
  products: [
    { action: 'read',           label: 'Переглядати товари' },
    { action: 'create',         label: 'Створювати товари' },
    { action: 'update',         label: 'Редагувати товари' },
    { action: 'delete',         label: 'Видаляти товари',                 isDangerous: true },
    { action: 'publish',        label: 'Публікувати та знімати з публікації' },
    { action: 'archive',        label: 'Архівувати товари' },
    { action: 'restore',        label: 'Відновлювати видалені товари' },
    { action: 'bulk_edit',      label: 'Масове редагування',              isDangerous: true },
    { action: 'import',         label: 'Імпорт CSV',                      isDangerous: true },
    { action: 'export',         label: 'Експорт CSV' },
    { action: 'manage_price',   label: 'Змінювати ціни',                  isDangerous: true },
    { action: 'manage_stock',   label: 'Змінювати залишки' },
    { action: 'manage_media',   label: 'Керувати фото товару' },
    { action: 'manage_origin',  label: 'Змінювати походження товару',     isDangerous: true },
    { action: 'manage_custom_size', label: 'Вмикати індивідуальний розмір' },
    { action: 'translate',      label: 'Редагувати переклади товарів' },
  ],
  categories: [
    { action: 'read',           label: 'Переглядати категорії' },
    { action: 'create',         label: 'Створювати категорії' },
    { action: 'update',         label: 'Редагувати категорії' },
    { action: 'delete',         label: 'Видаляти категорії',              isDangerous: true },
    { action: 'reorder',        label: 'Змінювати порядок дерева' },
    { action: 'feature',       label: 'Позначати категорії рекомендованими' },
    { action: 'translate',      label: 'Редагувати переклади категорій' },
  ],
  orders: [
    { action: 'read',           label: 'Переглядати замовлення' },
    { action: 'create',         label: 'Створювати замовлення вручну' },
    { action: 'update',         label: 'Редагувати замовлення' },
    { action: 'change_status',  label: 'Змінювати статус замовлення' },
    { action: 'cancel',         label: 'Скасовувати замовлення',          isDangerous: true },
    { action: 'delete',         label: 'Видаляти замовлення',             isDangerous: true },
    { action: 'export',         label: 'Експорт замовлень',               isDangerous: true },
    { action: 'quote',          label: 'Виставляти рахунок на доставку',  isDangerous: true },
    { action: 'manage_shipping',label: 'Створювати ТТН і керувати доставкою' },
    { action: 'print_documents',label: 'Друкувати накладні та етикетки' },
    { action: 'note',           label: 'Додавати внутрішні нотатки' },
  ],
  payments: [
    { action: 'read',           label: 'Переглядати платежі' },
    { action: 'reconcile',      label: 'Звіряти ручні оплати',            isDangerous: true },
    { action: 'refund',         label: 'Повертати кошти',                 isDangerous: true },
    { action: 'waive_deposit',  label: 'Скасовувати депозит за зворотну доставку', isDangerous: true },
    { action: 'mark_cod_settled', label: 'Позначати розрахунок по НП' },
  ],
  payment_settings: [
    { action: 'read',           label: 'Переглядати платіжні реквізити' },
    { action: 'update',         label: 'Змінювати платіжні реквізити',    isDangerous: true },
  ],
  customers: [
    { action: 'read',           label: 'Переглядати клієнтів' },
    { action: 'update',         label: 'Редагувати клієнтів' },
    { action: 'delete',         label: 'Видаляти клієнтів',               isDangerous: true },
    { action: 'export',         label: 'Експорт персональних даних',      isDangerous: true },
    { action: 'anonymize',      label: 'Знеособлення на запит клієнта',   isDangerous: true },
  ],
  reviews: [
    { action: 'read',           label: 'Переглядати відгуки' },
    { action: 'moderate',       label: 'Схвалювати, приховувати, відхиляти' },
    { action: 'reply',          label: 'Відповідати на відгуки' },
    { action: 'delete',         label: 'Видаляти відгуки',                isDangerous: true },
  ],
  blog: [
    { action: 'read',           label: 'Переглядати статті' },
    { action: 'create',         label: 'Створювати статті' },
    { action: 'update',         label: 'Редагувати статті' },
    { action: 'delete',         label: 'Видаляти статті',                 isDangerous: true },
    { action: 'publish',        label: 'Публікувати статті' },
    { action: 'schedule',       label: 'Планувати публікацію' },
    { action: 'translate',      label: 'Редагувати переклади статей' },
  ],
  gallery: [
    { action: 'read',           label: 'Переглядати медіатеку' },
    { action: 'upload',         label: 'Завантажувати медіа' },
    { action: 'update',         label: 'Редагувати медіа, alt, фокус' },
    { action: 'delete',         label: 'Видаляти медіа',                  isDangerous: true },
    { action: 'manage_albums',  label: 'Керувати альбомами' },
  ],
  promotions: [
    { action: 'read',           label: 'Переглядати акції' },
    { action: 'create',         label: 'Створювати акції' },
    { action: 'update',         label: 'Редагувати акції' },
    { action: 'delete',         label: 'Видаляти акції',                  isDangerous: true },
    { action: 'manage_banners', label: 'Керувати банерами' },
    { action: 'manage_hero',    label: 'Керувати головним банером' },
  ],
  leads: [
    { action: 'read',           label: 'Переглядати заявки' },
    { action: 'assign',         label: 'Призначати відповідального' },
    { action: 'update',         label: 'Редагувати заявки та статус' },
    { action: 'delete',         label: 'Видаляти заявки',                 isDangerous: true },
    { action: 'export',         label: 'Експорт заявок',                  isDangerous: true },
  ],
  // 00-client-decisions-7.md §K2 — business mail is read and answered in the panel.
  // Mailbox membership is an object-level check in the handler, like Lead.assignedToId.
  mail: [
    { action: 'read',           label: 'Читати пошту' },
    { action: 'reply',          label: 'Відповідати та писати листи' },
    { action: 'assign',         label: 'Призначати відповідального за лист' },
    { action: 'update',         label: 'Статус, спам, прив\'язка до замовлення' },
    { action: 'delete',         label: 'Остаточно видаляти листи',        isDangerous: true },
    { action: 'manage_mailboxes', label: 'Керувати поштовими скриньками', isDangerous: true },
  ],
  analytics: [
    { action: 'read',           label: 'Переглядати відвідуваність і конверсію' },
    { action: 'read_revenue',   label: 'Переглядати дохід' },
    { action: 'read_search_queries', label: 'Переглядати пошукові запити' },
    { action: 'export',         label: 'Експорт аналітики' },
  ],
  settings: [
    { action: 'read',           label: 'Переглядати налаштування' },
    { action: 'update',         label: 'Змінювати налаштування' },
    { action: 'manage_integrations', label: 'Ключі та інтеграції',        isDangerous: true },
    { action: 'manage_redirects',label: 'Керувати перенаправленнями' },
  ],
  employees: [
    { action: 'read',           label: 'Переглядати співробітників' },
    { action: 'invite',         label: 'Запрошувати співробітників' },
    { action: 'create',         label: 'Створювати облікові записи вручну' },
    { action: 'update',         label: 'Редагувати профілі співробітників' },
    { action: 'suspend',        label: 'Призупиняти доступ',              isDangerous: true },
    { action: 'block',          label: 'Блокувати з міркувань безпеки',   isDangerous: true },
    { action: 'deactivate',     label: 'Деактивувати після звільнення',   isDangerous: true },
    { action: 'delete',         label: 'Видаляти співробітників',         isDangerous: true },
    { action: 'restore',        label: 'Відновлювати співробітників' },
    { action: 'assign_roles',   label: 'Призначати ролі',                 isDangerous: true },
    { action: 'manage_roles',   label: 'Створювати та змінювати ролі',    isDangerous: true },
    { action: 'manage_sessions',label: 'Завершувати чужі сесії',          isDangerous: true },
    { action: 'reset_mfa',      label: 'Скидати двоетапний вхід співробітнику', isDangerous: true },
  ],
  audit: [
    { action: 'read',           label: 'Переглядати журнал дій' },
    { action: 'export',         label: 'Експорт журналу дій',             isDangerous: true },
  ],
} as const satisfies Record<string, readonly PermissionSpec[]>;

/** The type-level union. Derived, never hand-written — this is the anti-drift mechanism. */
export type PermissionKey = {
  [R in keyof typeof PERMISSION_CATALOGUE]:
    `${R & string}.${(typeof PERMISSION_CATALOGUE)[R][number]['action']}`;
}[keyof typeof PERMISSION_CATALOGUE];

// e.g. "products.publish" | "payments.refund" | … — generated from the catalogue above and
// checked by the compiler. The member count is deliberately not written here; see below.

export const ALL_PERMISSIONS: readonly PermissionKey[] = Object.entries(PERMISSION_CATALOGUE)
  .flatMap(([resource, specs]) => specs.map(s => `${resource}.${s.action}` as PermissionKey));

export const DANGEROUS_PERMISSIONS: ReadonlySet<PermissionKey> = new Set(
  Object.entries(PERMISSION_CATALOGUE).flatMap(([resource, specs]) =>
    specs.filter(s => 'isDangerous' in s).map(s => `${resource}.${s.action}` as PermissionKey)),
);
```

**The size of the union is not written down, on purpose.** That comment previously read
"94 members" and was wrong: counting the catalogue printed directly above it gives **95**. It did
not drift into being wrong by one — three rulings added `orders.quote` (§F4),
`payments.waive_deposit` (§H1.3) and `products.manage_custom_size` (§H3b) and the line never
moved, so at no point since it was written has it matched the constant it describes.

A count typed into a comment is a second, hand-maintained copy of the catalogue, placed one line
below the mechanism whose entire purpose is to forbid second copies. It is the same defect as a
database row the constant does not know about, differing only in that no seed will ever fail
because of it — which makes it worse, not better, since nothing will ever tell anyone.

The count is `ALL_PERMISSIONS.length`, derived like everything else. Where a reviewer genuinely
wants a number — to confirm that a change added one key rather than eleven — the instrument is a
committed snapshot of `ALL_PERMISSIONS` that CI diffs on every build (§24.16, gate 4). It fails
loudly and shows *which* keys moved, instead of asserting an integer nobody can check by eye. As
of this revision the catalogue yields **95** permissions across fifteen resources; that sentence
is prose and will age, which is exactly the point.

The choices made in that constant are worth defending.

**`analytics.read_revenue` is separate from `analytics.read`.** Warehouse and Photographer
need to know what is selling; neither needs to know what the business earns. Splitting the two
is what lets the dashboard show widgets 2, 4, 5 and 9 to a warehouse user
([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.5) without hiding the
whole analytics area.

**`products.manage_price` is separate from `products.update`.** Price is the field with
financial consequence, it is the field a bulk operation can wreck at scale (§23.6.7), and it is
the field a content editor has no business touching. Every other scalar on a product is
recoverable by editing it back; a price that was live and wrong for a day is not.

**`products.manage_origin` exists at all** because
[00-client-decisions.md](00-client-decisions.md) D3 makes `ProductOrigin` a brand-integrity
field rather than a product attribute. Flipping a partner blanket to own manufacture is a false
provenance claim in structured data and on the page. It is dangerous in the precise sense the
flag means, and it is not something a routine product edit should be able to do.

**`orders.export` and `customers.export` are dangerous** because export is exfiltration. A CSV
of every customer's name, phone, address and order history leaves the building in one click,
and the audit log entry for it is the only thing that makes that fact discoverable.

**`products.manage_custom_size` is separated from `products.update`, and it is deliberately not
dangerous.** [00-client-decisions-5.md](00-client-decisions-5.md) §H3b makes custom sizing a
per-product admin toggle, and §H1.1 makes any custom-size configuration **full-prepayment only** —
cash on delivery disappears server-side for that line. Enabling the toggle therefore does two
things no other product edit does: it changes which payment methods a buyer is offered, and it
commits the workshop to fourteen days of labour on a size nobody else will buy
([00-client-decisions-4.md](00-client-decisions-4.md) §G2). That is the same class of authority as
`products.manage_price` and `products.manage_origin` — a consequence outside the product record —
and it is why a Content Editor who may rewrite every description may not switch it on.

| Option | Verdict |
|---|---|
| Fold into `products.update` | Rejected. The roles that may edit copy are not the roles that may commit production capacity, and the flag's whole risk is that its effect is invisible in the field it lives in |
| **Separate key, not `isDangerous`** | **Chosen.** The separation is about *who*; the confirm step is about *how carefully*, and a modal here would be the wrong instrument — see below |
| Separate key, `isDangerous` | Rejected. The toggle is reversible in one click and destroys nothing. §23.1 principle 4 is explicit that uniform friction trains people to click through confirmations, and this is exactly the action where the inline warning in [23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6.4a — «Індивідуальний розмір — лише повна передоплата, 14 днів виготовлення.» — informs better than a dialog the editor has learned to dismiss |

The **loom and frame limits** (`customSizeMinWidthCm` and the three siblings,
[25-database-schema.md](25-database-schema.md) §25.3) sit under this key too, because they are a
production fact rather than a commercial one: they describe what the equipment can weave.

**The custom-size rate is `products.manage_price`, not a new key and not `products.update`.**
[00-client-decisions-5.md](00-client-decisions-5.md) §H3c puts `customSizeRatePerSqmMinor` and
`customSizeMinPriceMinor` in the admin, with the system computing
`max(area_m2 × rate, minPrice)` from them. Those two fields **are** prices; the only thing that
distinguishes them from `ProductVariant.priceMinor` is the unit they are quoted in. A third key
would create a role that may price the catalogue but not price half of its configurations, which
is a gap nobody discovers until a manager cannot do their job — and it would split the audit trail
for "who changed what we charge" across two permissions. One question, one permission.

**`payments.waive_deposit` is separate from `payments.refund`, and it is not a narrower version of
it.** [00-client-decisions-5.md](00-client-decisions-5.md) §H1.3 has the buyer pay a
return-shipping deposit online at checkout on a Ukrainian COD-with-inspection order; on acceptance
it is credited against the goods, and on refusal it funds the return leg. Deciding that a
particular buyer will not pay one, or that a collected one will be released without having been
consumed, is a **pricing decision**, not a reversal of a captured payment. Three differences make
reusing `payments.refund` wrong:

| Difference | Consequence |
|---|---|
| It is taken before the money moves | `payments.refund` guards an outbound transfer against a payment that exists. A waiver at checkout guards a figure that has not been charged yet, so the refund permission is not even reachable at the moment the decision is made |
| Its blast radius is the policy, not the transaction | A refund returns one customer's money. A waiver, repeated, quietly repeals the rule that makes COD-with-inspection affordable at all — the refused-parcel cost comes back to the business one exception at a time, and no refund report ever shows it |
| It is invisible in payment reporting | A refund appears in the acquirer's ledger and in the reconciliation queue. A deposit that was never collected appears nowhere except as an order that does not have one. Without its own key and its own audit action, the only record that it happened is an absence |

The key covers **both** the pre-collection waiver and the post-collection release of a deposit
that was never consumed, because those are the same commercial decision taken at two moments;
splitting them would leave a manager able to waive at checkout and unable to correct the same
decision an hour later. It is `isDangerous`: it moves money, and the confirm step is what makes a
phone call from a persuasive customer slow enough to think about.

**`orders.quote` is a separate, dangerous permission and not part of `orders.update`.**
[00-client-decisions-3.md](00-client-decisions-3.md) F4 settles international shipping as
**enquiry-then-invoice**: the buyer submits an order, staff quote a carrier price, and only then
is payment taken. Issuing that quote writes `shippingMinor` and rewrites `totalMinor` on an order
the customer has not yet paid — it **sets the price a customer will be charged**, which is the
same class of authority as `products.manage_price` and is why it carries the ⚠ flag and stops at
Manager. Three properties make the separation worth a distinct key rather than a reuse of
`orders.update`:

| Property | Consequence |
|---|---|
| It is a pricing decision, not an order edit | A warehouse or support account may legitimately need to correct an address or add a note on an international order without being able to name its shipping price |
| It is quotable more than once | `POST /v1/admin/orders/:id/quote` issues or re-issues, and `…/quote/withdraw` retracts ([26-api-architecture.md](26-api-architecture.md) §26.10). A re-quote after the customer has seen the first figure is a commercially sensitive act and belongs in the audit log under its own event |
| It is bound to an SLA | The `AWAITING_QUOTE` queue carries an age counter and a breach indicator ([05-user-flows.md](05-user-flows.md) §5.9.4). A permission that is held by everyone is owned by no one — [00-client-decisions-5.md](00-client-decisions-5.md) §H3 now names the owner, and §H2 fixes the SLA at **48 working hours** with a **72-hour** quote validity, **36 hours** for one-of-one items |

Reading the queue is not quoting it: `orders.read` lists `quoteStatus = AWAITING_QUOTE` orders so
support can answer «де моє замовлення», and `orders.quote` is what turns one into a price.

`orders.quote` is the only permission in the catalogue with a **named default assignee** — Гондурак
Любов Юріївна, per [00-client-decisions-5.md](00-client-decisions-5.md) §H3. That is a seed value
and a queue default, not an authorisation rule; see §24.5.

### There is no `dashboard` resource, and that is the decision

`GET /v1/admin/dashboard` ([26-api-architecture.md](26-api-architecture.md) §26.10) is the admin's
landing page and the one admin route with no capability of its own. It composes nine widgets
([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.5) drawn from orders,
products, payments and analytics; every number on it belongs to a resource that already has a key,
and the screen owns none of them. Three answers were available.

| Option | Verdict |
|---|---|
| Gate the route on `analytics.read` | **Rejected outright — it contradicts this document.** §24.5 grants Warehouse no `analytics.read`, while §23.5 and the `analytics.read_revenue` split defended above both require a Warehouse user to keep widgets 2, 4, 5 and 9. This gate would blank the landing page for the exact role the split was invented to serve, and it would do so by asserting that reading a low-stock count is an analytics act |
| Add `dashboard.read`, held by every staff role | Rejected. It buys uniformity and pays for it in honesty. A gate that every role satisfies tells a reviewer the route is protected when the real authorisation is the per-widget filter behind it — a permission whose value is always `true` is not a boundary, it is a comment that looks like one. It also collides with §24.1 rule 4: a custom role authored without it lands on a 403 at the admin's front door, and the first support ticket is answered by adding the key to every role, which is where it started |
| **Staff-authenticated, no dedicated permission, widgets filtered server-side** | **Chosen.** The route's authorisation question is genuinely per-widget, so it is answered per widget rather than approximated once at the door |

**The filter is subtractive, and a widget the caller cannot access is absent from the response —
not returned and hidden.** This is the load-bearing half of the decision. Widget 1 is a revenue
figure; widget 3 is a list of customers who claim to have paid. Serving either to a client that
has been told to hide it puts the number in a JSON payload that any authenticated staff member can
read with the browser's network tab open, and the client bundle is public once authenticated
(§24.14 layer 3). A hidden widget still leaks the number it contains. The handler therefore
resolves the caller's effective permissions (§24.15), builds the widget list from them, and never
serialises a widget it excluded — the absence is the enforcement, and the client renders whatever
it is given without knowing what it did not receive.

Each widget names its key, and the mapping lives with the widget definition rather than in a route
table, so adding a tenth widget is a question about that widget rather than an edit to a gate:

| Widget (§23.5) | Key required |
|---|---|
| 1 Revenue · 6 Top products · 8 Conversion | `analytics.read_revenue` |
| 2 Orders by status · 5 Latest orders | `orders.read` |
| 3 Awaiting reconciliation | `payments.read` |
| 4 Low stock | `products.read` |
| 7 Visitors | `analytics.read` |
| 9 Announcements & quick actions | none — every staff user sees it; individual quick-action buttons are hidden by their own keys |

This is exactly the arrangement §24.14 already describes as object-level checks living in the
handler after the permission check: `orders.read` says a user may read orders, and something
narrower decides which ones. The dashboard is the limiting case where the entire response body is
object-level, so the permission check at the door has nothing left to decide.

The cost of choosing this over `dashboard.read` is that an ungated route is invisible to a CI gate
that looks for a missing decorator, and an authenticated-only route is a category that grows once
it exists. Both are answered by declaring the category instead of leaving it implicit: the route
carries an explicit `requireStaffOnly()` marker, absence of *any* marker still fails CI, and the
staff-only list stays short enough that a fourth entry is an argument rather than a shrug (§24.14,
§24.16 gate 3). A declared exception is reviewable; a forgotten one is not.

### Translation stays three keys, and the gaps report is scoped rather than gated

`products.translate`, `categories.translate` and `blog.translate` are three keys with nothing
spanning them, and `GET /v1/admin/translations/gaps`
([26-api-architecture.md](26-api-architecture.md) §26.10) reports missing translations across all
three at once. The endpoint is therefore the first thing in the system whose subject matter is
"translation" rather than "products" or "blog".

| Option | Verdict |
|---|---|
| Gate on `products.translate` with a note that the report also spans the other two | Rejected. It is the current state and it is a workaround, not an answer: it grants sight of blog gaps to whoever may translate products, and it denies the whole report to a role that may translate blog posts and nothing else. The note documents the inconsistency rather than resolving it |
| Add a spanning `content.translate` or `translations.read` | Rejected. It is a fourth key that no role needs on its own and that duplicates the union of three keys every holder already has. Worse, it must then be kept in step by hand: a future `promotions.translate` would silently fall outside a key whose name promises to cover it, which is the drift this section exists to prevent, moved from the database into the catalogue |
| **No new key — the endpoint returns only the resource types the caller may translate** | **Chosen** |

The chosen answer is the one the rest of this document already gives everywhere else. §24.1 rule 4
says absence is denial and no permission implies another; §24.14 says resource-level permission and
row-level scope are different questions and are never conflated. A cross-resource report is scope,
not a new capability. The handler computes the caller's translatable resource set from
`{products, categories, blog}.translate` and reports gaps for that set only, returning `403` solely
when the set is empty — because a caller who may translate nothing has no report to filter, and a
`200` with an empty body would read as "everything is translated".

The visible consequence is intended and should be stated so it is not later reported as a bug:
**two people legitimately see different gap reports.** A Content Editor holds all three translate
keys (§24.5) and sees the whole picture. A Photographer holds none and receives a `403`. A future
role holding only `blog.translate` sees blog gaps and is not told how many product descriptions are
missing German — which is correct, because the count of untranslated products is itself commercial
information about the catalogue, and because a completeness figure that includes work the reader
cannot do is a number that produces anxiety rather than action. The response names the resource
types it covers, so the report is never mistaken for a complete one:

```ts
// GET /v1/admin/translations/gaps
export interface TranslationGapsResponse {
  /** Exactly the resource types the caller may translate. Never a superset. */
  scope: ReadonlyArray<'products' | 'categories' | 'blog'>;
  gaps: Array<{ resource: string; id: string; label: string; missingLocales: string[] }>;
}
```

---

## 24.5 The role matrix

Seven system roles (`Role.isSystem = true`), plus one worked custom example. Legend: **✓**
granted, blank not granted, **⚠** in the permission column marks `isDangerous`.

Columns: **Own** Owner · **Adm** Administrator · **Mgr** Manager · **Cnt** Content Editor ·
**Whs** Warehouse · **Sup** Support · **Pht** Photographer · **✳Mer** custom
«Сезонний мерчендайзер».

### Catalogue

| Permission | Own | Adm | Mgr | Cnt | Whs | Sup | Pht | ✳Mer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `products.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `products.create` | ✓ | ✓ | ✓ | ✓ | | | | |
| `products.update` | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| `products.delete` ⚠ | ✓ | ✓ | | | | | | |
| `products.publish` | ✓ | ✓ | ✓ | | | | | ✓ |
| `products.archive` | ✓ | ✓ | ✓ | | | | | |
| `products.restore` | ✓ | ✓ | | | | | | |
| `products.bulk_edit` ⚠ | ✓ | ✓ | ✓ | | | | | ✓ |
| `products.import` ⚠ | ✓ | ✓ | | | | | | |
| `products.export` | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| `products.manage_price` ⚠ | ✓ | ✓ | ✓ | | | | | ✓ |
| `products.manage_stock` | ✓ | ✓ | ✓ | | ✓ | | | |
| `products.manage_media` | ✓ | ✓ | ✓ | ✓ | | | ✓ | |
| `products.manage_origin` ⚠ | ✓ | ✓ | | | | | | |
| `products.manage_custom_size` | ✓ | ✓ | ✓ | | | | | |
| `products.translate` | ✓ | ✓ | ✓ | ✓ | | | | |
| `categories.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `categories.create` | ✓ | ✓ | | | | | | |
| `categories.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `categories.delete` ⚠ | ✓ | ✓ | | | | | | |
| `categories.reorder` | ✓ | ✓ | ✓ | | | | | ✓ |
| `categories.feature` | ✓ | ✓ | ✓ | | | | | ✓ |
| `categories.translate` | ✓ | ✓ | ✓ | ✓ | | | | |

### Commerce

| Permission | Own | Adm | Mgr | Cnt | Whs | Sup | Pht | ✳Mer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `orders.read` | ✓ | ✓ | ✓ | | ✓ | ✓ | | ✓ |
| `orders.create` | ✓ | ✓ | ✓ | | | | | |
| `orders.update` | ✓ | ✓ | ✓ | | | | | |
| `orders.change_status` | ✓ | ✓ | ✓ | | ✓ | | | |
| `orders.cancel` ⚠ | ✓ | ✓ | ✓ | | | | | |
| `orders.delete` ⚠ | ✓ | ✓ | | | | | | |
| `orders.export` ⚠ | ✓ | ✓ | ✓ | | | | | |
| `orders.quote` ⚠ | ✓ | ✓ | ✓ | | | | | |
| `orders.manage_shipping` | ✓ | ✓ | ✓ | | ✓ | | | |
| `orders.print_documents` | ✓ | ✓ | ✓ | | ✓ | | | |
| `orders.note` | ✓ | ✓ | ✓ | | ✓ | ✓ | | |
| `payments.read` | ✓ | ✓ | ✓ | | | ✓ | | |
| `payments.reconcile` ⚠ | ✓ | ✓ | ✓ | | | | | |
| `payments.refund` ⚠ | ✓ | ✓ | ✓ | | | | | |
| `payments.waive_deposit` ⚠ | ✓ | ✓ | ✓ | | | | | |
| `payments.mark_cod_settled` | ✓ | ✓ | ✓ | | | | | |
| `payment_settings.read` | ✓ | ✓ | ✓ | | | | | |
| `payment_settings.update` ⚠ | ✓ | | | | | | | |
| `customers.read` | ✓ | ✓ | ✓ | | | ✓ | | |
| `customers.update` | ✓ | ✓ | ✓ | | | ✓ | | |
| `customers.delete` ⚠ | ✓ | ✓ | | | | | | |
| `customers.export` ⚠ | ✓ | ✓ | | | | | | |
| `customers.anonymize` ⚠ | ✓ | ✓ | | | | | | |

### Content and marketing

| Permission | Own | Adm | Mgr | Cnt | Whs | Sup | Pht | ✳Mer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `reviews.read` | ✓ | ✓ | ✓ | ✓ | | ✓ | | ✓ |
| `reviews.moderate` | ✓ | ✓ | ✓ | ✓ | | | | |
| `reviews.reply` | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| `reviews.delete` ⚠ | ✓ | ✓ | | | | | | |
| `blog.read` | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| `blog.create` | ✓ | ✓ | | ✓ | | | | |
| `blog.update` | ✓ | ✓ | | ✓ | | | | |
| `blog.delete` ⚠ | ✓ | ✓ | | | | | | |
| `blog.publish` | ✓ | ✓ | | ✓ | | | | |
| `blog.schedule` | ✓ | ✓ | | ✓ | | | | |
| `blog.translate` | ✓ | ✓ | | ✓ | | | | |
| `gallery.read` | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| `gallery.upload` | ✓ | ✓ | ✓ | ✓ | | | ✓ | |
| `gallery.update` | ✓ | ✓ | | ✓ | | | ✓ | |
| `gallery.delete` ⚠ | ✓ | ✓ | | | | | | |
| `gallery.manage_albums` | ✓ | ✓ | | ✓ | | | ✓ | |
| `promotions.read` | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| `promotions.create` | ✓ | ✓ | ✓ | | | | | ✓ |
| `promotions.update` | ✓ | ✓ | ✓ | | | | | ✓ |
| `promotions.delete` ⚠ | ✓ | ✓ | | | | | | |
| `promotions.manage_banners` | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| `promotions.manage_hero` | ✓ | ✓ | ✓ | | | | | ✓ |
| `leads.read` | ✓ | ✓ | ✓ | | | ✓ | | |
| `leads.assign` | ✓ | ✓ | ✓ | | | ✓ | | |
| `leads.update` | ✓ | ✓ | ✓ | | | ✓ | | |
| `leads.delete` ⚠ | ✓ | ✓ | | | | | | |
| `leads.export` ⚠ | ✓ | ✓ | | | | | | |
| `mail.read` | ✓ | ✓ | ✓ | | | ✓ | | |
| `mail.reply` | ✓ | ✓ | ✓ | | | ✓ | | |
| `mail.assign` | ✓ | ✓ | ✓ | | | ✓ | | |
| `mail.update` | ✓ | ✓ | ✓ | | | ✓ | | |
| `mail.delete` ⚠ | ✓ | ✓ | | | | | | |
| `mail.manage_mailboxes` ⚠ | ✓ | ✓ | | | | | | |

`mail.*` mirrors `leads.*`: whoever answers wholesale enquiries answers mail. `manage_mailboxes`
is dangerous because it decides where the business's mail goes and who reads it. A personal
mailbox (`isShared = false`) is visible only to its members regardless of role — an
Administrator does not read Іван's personal mail by holding `mail.read`
([00-client-decisions-7.md](00-client-decisions-7.md) §K2).

### System

| Permission | Own | Adm | Mgr | Cnt | Whs | Sup | Pht | ✳Mer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `analytics.read` | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| `analytics.read_revenue` | ✓ | ✓ | ✓ | | | | | ✓ |
| `analytics.read_search_queries` | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| `analytics.export` | ✓ | ✓ | ✓ | | | | | |
| `settings.read` | ✓ | ✓ | ✓ | | | | | |
| `settings.update` | ✓ | ✓ | | | | | | |
| `settings.manage_integrations` ⚠ | ✓ | ✓ | | | | | | |
| `settings.manage_redirects` | ✓ | ✓ | | ✓ | | | | |
| `employees.read` | ✓ | ✓ | ✓ | | | | | |
| `employees.invite` | ✓ | ✓ | | | | | | |
| `employees.create` | ✓ | ✓ | | | | | | |
| `employees.update` | ✓ | ✓ | | | | | | |
| `employees.suspend` ⚠ | ✓ | ✓ | | | | | | |
| `employees.block` ⚠ | ✓ | ✓ | | | | | | |
| `employees.deactivate` ⚠ | ✓ | ✓ | | | | | | |
| `employees.delete` ⚠ | ✓ | | | | | | | |
| `employees.restore` | ✓ | ✓ | | | | | | |
| `employees.assign_roles` ⚠ | ✓ | ✓ | | | | | | |
| `employees.manage_roles` ⚠ | ✓ | ✓ | | | | | | |
| `employees.manage_sessions` ⚠ | ✓ | ✓ | | | | | | |
| `employees.reset_mfa` ⚠ | ✓ | ✓ | | | | | | |
| `audit.read` | ✓ | ✓ | | | | | | |
| `audit.export` ⚠ | ✓ | | | | | | | |

### Reading the matrix

**Owner is the only role with the complete set**, and it is the only role holding
`payment_settings.update`, `employees.delete` and `audit.export`. Those three are the
owner-only reserve: where the money lands, who is permanently removed, and whether the record
of what everyone did can leave the building. An Administrator who can silently redirect
settlement and then export-and-delete the evidence is not an administrator, it is a second
owner. Separating exactly three permissions is what makes the Administrator role safe to hand
out.

#### The Administrator role is not weakened — a second Owner is created instead

[00-client-decisions-2.md](00-client-decisions-2.md) §E1 records the client's position that the
Administrator may equal the Owner *if* the Administrator is Любов. Taken literally that would
mean granting `payment_settings.update`, `employees.delete` and `audit.export` to the
Administrator role, and that is the wrong move for a reason that has nothing to do with trusting
Любов.

**A role is a permanent shape; a person is not.** Granting the owner-only three to the
Administrator *role* grants them to whoever holds that role in three years — a hired shop
manager, a seasonal contractor, a replacement after a departure. The client's intent is about one
person, so it must be expressed as a fact about that person, and the mechanism for that already
exists: assign her the `owner` role.

| Option | Effect | Verdict |
|---|---|---|
| Add the three permissions to the `administrator` role | Every future Administrator gains payout control, permanent-delete and audit export. The role's whole purpose — being safe to hand out — is destroyed. | **Rejected** |
| Grant Любов three `StaffPermissionGrant` ALLOW overrides on top of Administrator | Achieves the same access, but as three scattered exceptions that read as an anomaly in an audit and that nobody will remember the reason for | Rejected — technically correct, organisationally opaque |
| **Give Любов the `owner` role outright** | Exactly the intended access, expressed once, visible in one place, and it satisfies I2 (§24.6) which requires a second Owner for any self-service role change | **Chosen** |

The seed therefore creates **two Owner accounts** — ГОНДУРАК ІВАН ФЕДОРОВИЧ (owner of
production) and ГОНДУРАК ЛЮБОВ ЮРІЇВНА (deputy owner, and the ФОП seller of record on the offer
contract, the WayForPay merchant agreement and the German Impressum) — and the `administrator`
role keeps its three-permission restriction for everyone else. See §24.16 for the seed shape and
§24.6 I1 for why two is the healthier number.

#### `orders.quote` has a default assignee: Гондурак Любов Юріївна

[00-client-decisions-5.md](00-client-decisions-5.md) §H3 settles who runs the international quote
workflow, which [00-client-decisions-4.md](00-client-decisions-4.md) §G5 item 3 had left open.

| Property | Value |
|---|---|
| Default holder of the queue | **Гондурак Любов Юріївна** |
| Seeded into | `Lead.assignedToId` for international enquiries, and the `Потребують прорахунку` queue default in [23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.8.3a |
| Reassignable | **Yes.** This is a default, not a constraint |

The reasoning is a division of labour that already exists in the business rather than a
permission-model preference. Любов is the ФОП seller of record
([00-client-decisions-2.md](00-client-decisions-2.md) §E1) — she signs the offer contract, the
WayForPay merchant agreement and the Impressum — while Іван owns production and is the primary
public phone ([00-client-decisions-4.md](00-client-decisions-4.md) §G1). Quoting an international
parcel is a **commercial act**: it sets the price a customer will be charged and creates the
obligation the ФОП then has to honour. The person who signs the contract should price the
shipping, and the person who is on the loom should not be interrupted to do it.

Three consequences, stated because a default that is only a seed value tends to erode:

- **It is a default, not an authorisation rule.** Both Owners and every Administrator and Manager
  hold `orders.quote`; nothing in §24.1 resolution branches on identity. A default assignee that
  were enforced would mean the queue stalls entirely when one person is unavailable, which is the
  failure mode a two-person business can least afford.
- **The 48-hour SLA alert is addressed to the assignee first**, then to every holder of
  `orders.quote` on breach ([26-api-architecture.md](26-api-architecture.md) §26.17,
  `orders.quoteSlaAlert`). Alerting everyone immediately is how a shared inbox becomes nobody's
  inbox.
- **Reassignment is logged.** `lead.reassigned` and the order's `OrderEvent` both name the actor,
  because "who was supposed to answer this enquiry" is the first question asked when one is missed.

**`customers.*` covers order-derived records, not accounts.** With guest checkout permanent
([00-client-decisions-2.md](00-client-decisions-2.md) §E12) a `Customer` row is a support and
analytics artefact assembled from orders — it has no `passwordHash`, no sessions and no login.
`customers.update` therefore means correcting a name, phone or marketing flag, never resetting a
credential; `customers.anonymize` is the GDPR erasure path and remains the dangerous one. The
permission keys are unchanged, but the thing they guard is smaller and less sensitive than it was
when accounts were in scope.

**Content Editor can publish blog posts but not products.** Blog mistakes are cheap and
reversible; a product published with a wrong price or a missing German translation is a
customer-facing commercial error. `products.publish` therefore sits with Manager.

**Warehouse is deliberately tiny.** It is the role most likely to be used on
a shared or lost phone in the field
([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.17), so its blast radius
is kept to stock and shipping. Notably it has no `orders.read` restriction problem to solve
because it needs the full order to pack it, but it has no `payments.read` at all.

**Photographer touches nothing commercial.** It exists as a
distinct role rather than as a Content Editor variant because photography is frequently
contracted out, and a contractor should be able to fill the media library without being able to
read customer data.

**Support can read customers and reply, but cannot refund.** The most common social-engineering
path in a small store is a convincing phone call to the most junior person with account access.
`payments.waive_deposit` follows `payments.refund` exactly and for the same reason: the caller who
argues a deposit away is the same caller who argues a refund out, and the deposit is the cheaper
of the two to concede, which is precisely what makes it the one that will be conceded.

**`products.manage_custom_size` stops at Manager, one row above `products.manage_origin`.** Both
are commitments the business makes rather than facts about a product, but they differ in
recoverability: a false origin claim is published to Google and repeated by systems nobody can
correct, while a custom-size toggle set in error produces at worst a size option nobody ordered.
Manager is the level at which someone knows whether the loom can take the width, and keeping the
decision there is what stops it being escalated to an Owner every time a new ліжник is listed.
The **rate** behind it is `products.manage_price` (§24.4), so the seasonal merchandiser role — which
holds `manage_price` but not `manage_custom_size` — can re-price an existing made-to-measure
product for an autumn campaign without being able to open a new one.

**The custom role** demonstrates the mechanism: `Сезонний мерчендайзер` is a real shape — the
person who runs an autumn campaign. They may re-price, publish, bulk edit, feature categories,
build promotions and own the hero, and they may read revenue to know whether it worked. They
hold no delete, no employee, no settings, and no customer permission. Expressing that as a role
takes a seed row and a checklist; expressing it in a flat enum is impossible (§24.2 row 2).

---

## 24.6 Invariants

Four properties must hold at all times. Each is enforced in the service layer **and**, where it
is expressible, at the database level — because a service-layer-only invariant holds until
someone writes a script.

### I1 — At least one Owner always exists

There must always be at least one `StaffUser` with `status = ACTIVE`, `deletedAt = null`, and a
`StaffRoleAssignment` to the `owner` role. Without it the system is permanently unadministrable
and recovery means a database console.

Enforced by a deferred constraint trigger on `StaffRoleAssignment` and `StaffUser`:

```sql
CREATE OR REPLACE FUNCTION assert_owner_exists() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM "StaffRoleAssignment" sra
      JOIN "Role" r ON r.id = sra."roleId"
      JOIN "StaffUser" u ON u.id = sra."staffUserId"
      WHERE r.key = 'owner' AND u.status = 'ACTIVE' AND u."deletedAt" IS NULL) = 0
  THEN RAISE EXCEPTION 'INVARIANT_LAST_OWNER: at least one active owner must exist';
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_assert_owner_exists
  AFTER UPDATE OR DELETE ON "StaffUser"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_owner_exists();
-- plus the equivalent on StaffRoleAssignment DELETE
```

It is `DEFERRABLE INITIALLY DEFERRED` so that a legitimate ownership *handover* — remove role
from A, add to B in one transaction — succeeds, while removal alone fails at commit. The
service layer additionally blocks the action in the UI with a clear message, because a
constraint violation surfaced as a 500 is not an explanation.

**One is the minimum; two is the target.** The constraint enforces ≥ 1 because that is the
floor below which the system is unadministrable, but a single-Owner system has no recovery path
if that account is lost — a forgotten password on the only Owner, a lost 2FA device, an
unreachable inbox, or simply the one person who holds it being unavailable, and the only remaining
route is a database console. Two active Owners remove that single point of failure entirely, and
they are also what makes I2 workable: with one Owner, no Owner can ever change their own roles
through the product at all.

This is why [00-client-decisions-2.md](00-client-decisions-2.md) §E1's two-Owner seed (§24.5,
§24.16) is not merely a convenience for Любов — it is the configuration this invariant was
written hoping for. The admin panel surfaces a standing warning on the employees screen whenever
exactly one active Owner exists, worded as a recoverability risk rather than as an error, since
it is a legitimate transient state during a handover.

### I2 — A user cannot escalate their own permissions

No staff user may grant themselves a permission, assign themselves a role, or lift their own
DENY, regardless of what they hold. `employees.assign_roles` and `employees.manage_roles` are
checked *and* the target is compared to the actor:

```ts
if (target.id === actor.id) throw forbidden('SELF_ESCALATION');
```

This holds even for the Owner. An Owner who wishes to change their own roles must have another
Owner do it, which is the reason I1 tolerates more than one Owner rather than forcing exactly
one. The rule is absolute because "the Owner is trusted" is not the point — the point is that
the audit log must always name a second party for any privilege change, and a self-grant has
no second party.

Self-service is still permitted for everything that is not a capability: name, avatar, locale,
password, and one's own sessions.

### I3 — A user cannot create or edit a role granting more than they hold

The set of permissions on a role being created or modified must be a subset of the actor's own
effective permissions.

```ts
const actorEffective = await effectivePermissions(actor.id);
const excess = proposed.filter(p => !actorEffective.has(p));
if (excess.length) throw forbidden('ROLE_EXCEEDS_ACTOR', { excess });
```

Without this rule, `employees.manage_roles` is equivalent to owner: create a role with every
permission, assign it to a colleague, have the colleague act. The same subset check applies to
`employees.assign_roles` (you may not assign a role you could not have created) and to issuing
a `StaffPermissionGrant` with `effect = ALLOW`.

`DENY` grants are exempt from the subset check in one direction only: you may deny a permission
you do not hold. Restricting someone else's access is not escalation.

### I4 — System roles cannot be deleted, and their keys cannot change

`Role.isSystem` (§25.7) protects the seven roles the seed creates. They may be *renamed*, their
description edited, and their permission set adjusted within the I3 subset rule — because a
business will genuinely want a slightly different Manager. They may not be deleted and their
`key` may not change, because `key` is what the seed reconciles against (§24.16) and what code
and documentation refer to.

Deleting a custom role is permitted and reassigns nothing: affected users simply lose those
permissions. The confirmation dialog names the users who will be affected and what they will
lose, since a silent capability removal produces a support ticket phrased as "the site is
broken".

---

## 24.7 Employee lifecycle

`StaffStatus` has five members — `INVITED ACTIVE SUSPENDED BLOCKED DEACTIVATED` (§25.7) — plus
the orthogonal `deletedAt` soft delete. The states are not interchangeable and the distinction
between them is what makes the lifecycle auditable rather than merely functional.

```
                    ┌──────────► DEACTIVATED ──┐ (re-invite only)
                    │                          │
  invite ──► INVITED ──accept──► ACTIVE ◄──────┘
                │                 │  ▲
             expire               │  │ lift
                │            suspend  │
                ▼                 ▼  │
             (stays           SUSPENDED
              INVITED,            │
              token dead)     escalate / security
                                  ▼
                               BLOCKED ──lift + forced password reset──► ACTIVE

  any state ──soft delete──► deletedAt set ──restore within 30d──► prior state
```

| Status | Can sign in | Sessions | Holds permissions | What the person sees | Who can set it |
|---|---|---|---|---|---|
| `INVITED` | No | None | No (§24.1 step 0) | The invitation email only. Signing in is impossible because `passwordHash` is null and the status gate rejects them regardless. | `employees.invite` |
| `ACTIVE` | Yes | Yes | Yes | Normal operation. | Set automatically on invitation acceptance, or by lifting a suspension. |
| `SUSPENDED` | No | **All revoked immediately** | No | «Ваш доступ тимчасово призупинено. Зверніться до адміністратора.» Explicitly temporary wording, because it usually is: leave, a holiday, an unresolved question. | `employees.suspend` ⚠ |
| `BLOCKED` | No | **All revoked immediately** | No | «Доступ заблоковано з міркувань безпеки.» No hint about why, and no self-service path. | `employees.block` ⚠, or automatically by the lockout escalation in §24.10 |
| `DEACTIVATED` | No | All revoked | No | The same message as blocked, but the account is terminal. | `employees.deactivate` ⚠ |
| `deletedAt` set | No | All revoked | No | Nothing — the account no longer appears anywhere except the audit log and a Deleted filter. | `employees.delete` ⚠ (Owner only) |

### The difference between the three "no access" states, precisely

These three exist separately because they answer three different questions, and collapsing them
loses information that matters months later.

- **`SUSPENDED` is an HR state.** Reversible by design, expected to be reversed, roles and
  grants untouched. Lifting it restores exactly the previous capability set with no
  reconfiguration. Typical cause: unpaid leave, a disciplinary pause, a long absence.
- **`BLOCKED` is a security state.** Set when credentials are suspected compromised or after
  repeated failed authentication (§24.10). Lifting it requires `employees.block` **and** forces
  a password reset before the account becomes usable — the assumption is that the credential
  itself is untrustworthy, not the person. A suspension that was actually a compromise would
  otherwise be lifted straight back into the attacker's hands.
- **`DEACTIVATED` is a termination state.** The person has left. Roles are retained rather than
  stripped, because stripping them makes the audit log unreadable — "who approved this refund
  in March" must still resolve to "Марія, менеджер", not to a person with no role. The account
  cannot be reactivated; returning staff receive a fresh invitation, which produces a new
  `invitedAt` and a clean record of the second engagement.

**Soft delete is orthogonal to all three.** `deletedAt` is for mistakes — a duplicate account,
a wrong email address — not for departures. It hides the row from every list and is reversible
within {{STAFF_RESTORE_WINDOW_DAYS}} (default 30) via `employees.restore`. After the window a
scheduled job hard-deletes, and `AuditLog.actorId` becomes null while `AuditLog.actorEmail`
survives, exactly as §25.7 intends.

### Manual creation versus invitation

Both exist and they are not the same thing.

**Invitation** (`employees.invite`) is the default and the only one usable at a distance: the
administrator enters email, name, and roles; the account is created with `status = INVITED`,
`passwordHash = null`, `invitedById` and `invitedAt` set; an email goes out. The invitee chooses
their own password, which is the point — no administrator ever knows a colleague's password,
and no password is ever transmitted.

**Manual creation** (`employees.create`) exists for the warehouse case: a person standing in
the office who does not use email in any practical sense. The administrator sets a temporary
password, which is displayed exactly once, never emailed, and `passwordChangedAt` is left null
so the first sign-in forces a change. This path is deliberately the harder one and is logged
distinctly (`employee.created_manually`), because it is the only path where a second person has
ever known the credential.

---

## 24.8 Invitation and reset tokens

Neither token is stored. `StaffUser` in [25-database-schema.md](25-database-schema.md) §25.7
has no token column, and none is added — the tokens are **stateless, signed, and self-
invalidating against fields that already exist.** This is not a workaround; it is a better
design than a token table, because a token table needs its own expiry sweep, its own uniqueness
handling, and its own single-use logic, all of which can be got wrong.

```ts
type StaffTokenPurpose = 'staff_invite' | 'staff_password_reset';

interface StaffTokenClaims {
  sub: string;                 // StaffUser.id
  purpose: StaffTokenPurpose;
  /** Invitation: StaffUser.invitedAt.       Reset: StaffUser.passwordChangedAt ?? 0 */
  anchor: number;              // epoch ms of the field the token is bound to
  iat: number;
  exp: number;
  jti: string;                 // for audit correlation only, not for storage
}
```

Signed with a dedicated HS256 secret — separate from the session-token secret, so that leaking
one does not forge the other.

**Single use falls out of the state machine, not out of bookkeeping.**

| Token | Expiry | Invalidated by |
|---|---|---|
| Invitation | **72 hours.** Long enough to survive a weekend, short enough that a forwarded email is not a standing key. | Acceptance (`status` leaves `INVITED`, so the guard fails on replay); re-invitation (`invitedAt` moves, so `anchor` no longer matches); suspension, blocking, deactivation or deletion. |
| Password reset | **30 minutes.** A reset link is a live credential and is usually used within seconds. | Use (`passwordChangedAt` moves, so `anchor` no longer matches); any other password change; blocking. |

Acceptance validates: signature, `exp`, `purpose`, `sub` resolves to a live user, `status` is
exactly `INVITED`, and `anchor` equals the current `invitedAt` in milliseconds. It then sets
`passwordHash`, `passwordChangedAt`, `status = ACTIVE`, and writes `employee.invite_accepted`
to the audit log with the invitee as actor and the inviter recorded in `after`.

**Expired invitations do not auto-delete.** The account stays `INVITED` and the administrator
sees a "запрошення протерміноване" state with a Resend action. Deleting the row would lose the
record that someone was invited and never joined, which is occasionally the interesting fact.

**Resend rewrites `invitedAt`**, which kills every previously issued invitation token for that
user. That is the correct behaviour and it is worth stating explicitly: the third email is the
only one that works.

**Password reset does not disclose whether an account exists.** The response is identical for a
known and an unknown address, and it is rate limited per address and per IP. Staff email
addresses are guessable from a public About page; the reset endpoint must not confirm guesses.

---

## 24.9 Sessions

Authentication is JWT + RBAC. Two tokens, with different lifetimes and different storage,
because they have different jobs.

| Token | Lifetime | Storage | Contents |
|---|---|---|---|
| Access | 15 min | Memory only, never persisted | `sub`, `sid` (the `StaffSession.id`), `iat`, `exp`. **No permissions.** |
| Refresh | **7 days absolute** with «Запам'ятати на 7 днів»; otherwise browser-session, max 12 h (§24.11). Was 30 days sliding — changed by round 8 §L14 | `httpOnly`, `Secure`, `SameSite=Strict` cookie scoped to `/admin` | Opaque random 32 bytes |

**Permissions are not in the access token.** Embedding them would mean a revoked permission
stays live for up to 15 minutes, and the whole purpose of the DENY grant in §24.1 is immediate
effect. Permissions are resolved server-side per request from a short-lived cache keyed by
`staffUserId` and invalidated on any role, grant, or status write (§24.15).

`StaffSession` (§25.7) stores `refreshTokenHash` — **the hash only, never the token.** SHA-256
of the raw value, `@unique`, so a database dump does not yield usable sessions. Lookup is by
hash, which is why the column is unique rather than the row being found by user and compared.

Each session row also carries `ipAddress`, `userAgent`, `deviceLabel`, `createdAt`,
`lastSeenAt`, `expiresAt`, `revokedAt` and `revokedById` — everything the device list needs.

```
┌ Мої сесії ───────────────────────────────────────────────────────────────┐
│ ● Chrome · macOS · Косів, 46.211.…  ·  цей пристрій        [—]           │
│   Safari · iPhone · Косів, 46.211.…  ·  15 хв тому    [Завершити]        │
│   Firefox · Windows · Львів, 91.202.…  ·  3 дні тому  [Завершити]        │
│                                                                           │
│                                      [Завершити всі інші сесії]           │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Any user may view and revoke their own sessions**, individually or all-but-current. This is
  self-service and needs no permission, because it never increases capability.
- **Revoking another user's sessions requires `employees.manage_sessions`** ⚠ and is logged. It
  is the immediate response to a suspected compromise and is faster than blocking, which is why
  it exists separately.
- **Refresh rotation:** every refresh issues a new token and revokes the old row. Presenting an
  already-revoked refresh token is treated as theft: **every** session for that user is revoked
  and an audit row `session.reuse_detected` is written. Rotation without reuse detection catches
  nothing.
- **Sessions are revoked automatically** on password change, on any status change away from
  `ACTIVE`, and on role or grant changes for the affected user — the last of these so that a
  demotion takes effect without waiting for the access token to expire.
- `lastSeenAt` is updated at most once per five minutes, not per request. Writing a row on every
  API call turns the session table into the busiest table in the database for no benefit.
- Location is derived from `ipAddress` at display time and is labelled as approximate. Storing a
  resolved city would be personal data with no operational value.

---

## 24.10 Password policy, reset, and lockout

Policy follows NIST SP 800-63B rather than the older composition-rule tradition, because
composition rules demonstrably produce `Vivcharyk2026!` and then a sticky note.

| Rule | Value | Why |
|---|---|---|
| Minimum length | 12 characters | Length is the only input that reliably increases strength |
| Maximum length | 128 | Accepting passphrases; rejecting a denial-of-service via a 10 MB input to Argon2 |
| Composition rules | **None** | No mandatory symbol, digit, or case mix |
| Strength check | `zxcvbn` score ≥ 3, evaluated client-side for feedback and server-side for enforcement | Measures actual guessability, including the brand name, the user's own name and email, and Ukrainian keyboard patterns, which are added to the dictionary |
| Breach check | HIBP range API by k-anonymity prefix, {{HIBP_ENABLED}} | Never sends the password or its full hash. Fails open on network error — refusing sign-up because a third party is down is worse than the risk |
| Hashing | Argon2id, `m=19456 KiB, t=2, p=1` | OWASP baseline; re-tuned on the production instance and recorded in {{ARGON_PARAMS}} |
| Rotation | **Never forced on a schedule** | Scheduled rotation lowers password quality and is explicitly discouraged by 800-63B |
| Reuse of the current password | Rejected on change | The only reuse check that is worth the storage |

`passwordChangedAt` exists for two purposes only: invalidating reset tokens (§24.8) and forcing
a change after manual creation. It is not a rotation clock.

### Lockout

Two counters already exist on `StaffUser`: `failedLoginCount` and `lockedUntil` (§25.7).

| Consecutive failures | Effect |
|---|---|
| 1–4 | Nothing beyond the failed response and a per-IP rate limit |
| 5 | `lockedUntil = now + 15 min`. Counter is **not** reset |
| 10 | `lockedUntil = now + 60 min` |
| 15 | `status = BLOCKED`, all sessions revoked, audit row `employee.auto_blocked`, notification to every holder of `employees.block` |

A successful sign-in resets `failedLoginCount` to zero and clears `lockedUntil`. The response
to a locked account is identical to the response to a wrong password — including timing, padded
to a constant — so lockout state is not an oracle for which addresses are real.

Rate limiting is layered on top and is independent: per-IP and per-address sliding windows on
the sign-in, reset-request, and invitation-acceptance endpoints. Account lockout alone protects
one account at a time; rate limiting protects against spraying a known address list, which is
the more likely attack against a seven-person staff directory.

Escalation to `BLOCKED` rather than indefinite timed lockout is deliberate: fifteen consecutive
failures is not a person who forgot a password, and the recovery path should involve a human and
a credential rotation (§24.7).

---

## 24.11 2FA — mandatory for every staff account, at launch

[00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 4. The client asked for exactly this: login, password, then a 6-digit code from Google
Authenticator, with an option to stay signed in on a device for 7 days. It applies to the Owner
**and to every account he creates.** This replaces the earlier "ready, not enforced" position,
which deferred 2FA to a later phase; that reasoning is kept at the end of this section.

### The login flow

```
1. email + password            → verified as §24.10 (lockout, rate limits, constant time)
2. LoginResult.kind = 'mfa_required' — ALWAYS; there is no path that skips step 3
3. 6-digit TOTP, or one recovery code
   [▢ Запам'ятати цей пристрій на 7 днів]
4. session issued (§24.9)
```

```ts
export type LoginResult =
  | { kind: 'mfa_required'; challengeToken: string; methods: Array<'totp' | 'recovery_code'> }
  | { kind: 'mfa_enrolment_required'; enrolmentToken: string };   // first login only
// 'authenticated' is only ever returned by POST /v1/auth/staff/mfa, never by the password step.
```

The `challengeToken` is single-use, bound to the user and the IP, and expires in 5 minutes. It
grants nothing except the right to submit a code.

### TOTP parameters

| Parameter | Value | Why |
|---|---|---|
| Standard | RFC 6238, HMAC-SHA1, 6 digits, 30-second step | What Google Authenticator, Microsoft Authenticator and every mainstream app accept without configuration |
| Clock tolerance | ±1 step | Absorbs phone clock drift without widening the guess window meaningfully |
| Replay | A code's time-step is stored in `StaffUser.twoFactorLastStep`; a step ≤ the stored one is rejected | Stops a shoulder-surfed or phished code being reused inside its 30 seconds |
| Attempts | Failures count toward the §24.10 lockout counter; 5 wrong codes on one challenge void it | A 6-digit code is brute-forceable without a limit |
| Secret storage | `twoFactorSecret` encrypted at rest with the AEAD key from {{KMS_KEY_REF}} | A database dump must not yield working second factors |

### Enrolment — on first login, no grace period

An invited user sets a password (§24.8) and is taken straight to enrolment: a QR code
(`otpauth://totp/Вівчарик:<email>?issuer=Вівчарик&…`) plus the secret as text for manual entry,
then **one valid code to confirm** before the secret is saved. Nothing else in the panel is
reachable until enrolment completes. A grace period is how 2FA ends up enabled on half the
accounts.

Enrolment ends by showing **10 recovery codes**, once. Each is single-use, stored as an Argon2id
hash in `StaffRecoveryCode`, and the screen requires «Я зберіг коди» before continuing. The
Owner is asked to print them and keep them with the business papers.

### «Запам'ятати на 7 днів»

| Checkbox | Session |
|---|---|
| Ticked | Refresh cookie with `Max-Age` 7 days, **absolute** — not extended by activity. After 7 days: password and code again |
| Not ticked | Refresh cookie without `Max-Age` (ends when the browser closes), and never longer than 12 hours |

Either way the session is revoked immediately by: password change, 2FA reset, «Завершити всі
сесії», a role or status change (§24.9). Remembering is per device, visible in the session list
as «запам'ятовано до 06.10», and revocable there.

### Losing the phone

| Situation | Recovery |
|---|---|
| Staff member loses phone, has recovery codes | Signs in with a recovery code, re-enrols from «Мій профіль» |
| Staff member loses phone and codes | The Owner or an Administrator resets their 2FA — `employees.reset_mfa` ⚠. All sessions revoked; next login re-enrols. Audited |
| **The Owner** loses phone, has codes | As the first row |
| **The only Owner** loses phone **and** codes | Nobody inside the system can reset him. The developer runs the break-glass procedure: identity confirmed in person or by phone call to the numbers on record, `twoFactorSecret` cleared by a reviewed database command, audit row `employee.mfa_reset_breakglass` written by hand. **This is the strongest argument for a second Owner** ([00-client-decisions-8.md](00-client-decisions-8.md) §L1) |

Audit actions: `employee.2fa_enabled`, `employee.2fa_reset`, `employee.2fa_challenge_failed`,
`employee.recovery_code_used`, `employee.mfa_reset_breakglass`.

### What changed from the earlier position

The earlier text deferred enforcement, arguing that a small team learning a new panel would
share an account to avoid 2FA. The client has now chosen 2FA for everyone from day one, and the
risk it answers is real: the panel holds refunds, payment settings and, since round 7, the
business's entire mailbox. Onboarding covers the sharing risk instead — each person enrols on
their own phone, in person, at handover. WebAuthn remains a later option.

---

## 24.12 Audit log — what is recorded, and how

An audit log exists to answer three questions: *who changed this*, *what did it look like
before*, and *did anyone look at data they should not have*. `AuditLog` (§25.7) is shaped for
exactly those.

### What is logged

**Every mutation of a business entity**, without exception, plus a specific set of reads.

| Category | Examples | Notes |
|---|---|---|
| Catalogue mutations | `product.created`, `product.updated`, `product.published`, `product.price.updated`, `product.origin.changed`, `product.custom_size.toggled`, `product.custom_size.rate_changed`, `product.archived`, `product.deleted`, `product.restored`, `category.reordered` | Bulk operations write **one row per affected entity**, sharing an `auditBatchId` in `payload` ([23-admin-panel-architecture.md](23-admin-panel-architecture.md) §23.6.7). A batch that logs once is useless in an investigation and cannot drive a revert. `product.custom_size.rate_changed` is a **pricing** row and is emitted alongside `product.price.updated`, never instead of it — "what did we charge per square metre in March" and "what did the 150×200 cost in March" are the same question asked twice |
| Commerce mutations | `order.status_changed`, `order.cancelled`, `order.address_changed`, `order.split`, `payment.reconciled`, `payment.refunded`, `payment.deposit_waived`, `payment.deposit_applied`, `shipping.ttn_created` | `payment.reconciled` is the highest-value row in the table while payment is manual. `payment.deposit_applied` is written by the state machine with `actorId = null`, because the credit is a system consequence of `DELIVERED` and not a human act ([26-api-architecture.md](26-api-architecture.md) §26.10.4c); `payment.deposit_waived` always has a human actor, which is the whole point of separating them |
| Content mutations | `post.published`, `banner.updated`, `hero.updated`, `review.moderated`, `media.deleted` | |
| Configuration | `setting.updated`, `payment_settings.updated`, `integration.key_rotated`, `redirect.created` | Values redacted per §24.13 |
| People and access | `employee.invited`, `employee.invite_accepted`, `employee.created_manually`, `employee.suspended`, `employee.blocked`, `employee.auto_blocked`, `employee.deactivated`, `employee.deleted`, `employee.restored`, `role.assigned`, `role.revoked`, `grant.created`, `grant.revoked`, `role.permissions_changed` | The subset most likely to be read years later |
| Authentication | `auth.login_success`, `auth.login_failed`, `auth.password_changed`, `auth.session_revoked`, `session.reuse_detected` | |
| **Sensitive reads** | `customers.exported`, `orders.exported`, `audit.exported`, `payment_settings.viewed` | The only reads logged. Logging every `GET` produces a table nobody can search and hides the four events that matter |

Ordinary reads are not logged. That is a deliberate trade: the table stays small enough to
query without an index strategy of its own, and the sensitive-read set is chosen to cover every
way bulk personal data can leave the system.

### The before/after diff format

`before` and `after` are `Json` columns holding **only the fields that changed**, not whole
entity snapshots. A full snapshot of a product with four locales and forty variants makes the
row large, makes the change invisible inside it, and duplicates data that already exists.

```ts
export interface AuditDiff {
  /** Changed scalar fields. Absent key = unchanged. */
  fields?: Record<string, unknown>;
  /** Relations expressed as membership deltas rather than full lists. */
  added?:   Record<string, unknown[]>;
  removed?: Record<string, unknown[]>;
}

// product.price.updated
{
  before: { fields: { priceMinMinor: 530000, priceMaxMinor: 730000 } },
  after:  { fields: { priceMinMinor: 490000, priceMaxMinor: 690000 } },
}

// role.permissions_changed — relations as deltas
{
  before: {},
  after: {
    added:   { permissions: ['payments.refund'] },
    removed: { permissions: ['products.delete'] },
  },
}
```

Rules:

- **Secrets are redacted in both halves**, to the literal string `[redacted]`. The log must
  record *that* an API key changed without recording either key. A redaction list keyed by field
  name is maintained beside the settings registry and defaults to redacting anything unknown in
  the integrations group — fail closed.
- **Money is logged in minor units**, matching the schema, never as a formatted string.
- **`resourceLabel` is denormalised and human** — `Ліжник «Черемош», 150×200`, exactly as §25.7
  shows. It survives the entity being deleted, which is the case where the log matters most.
- **`actorEmail` is denormalised** for the same reason (§25.7): when a staff member is deleted,
  the trail must still say who did what.
- **`ipAddress` and `userAgent`** are captured on every row from the request context.
- System actions write `actorId = null` with `actorEmail = 'system@{{DOMAIN}}'` and a reason in
  `payload`, so a scheduled job's actions are attributable to the job.

### Reading the log

Filterable by actor, resource type, resource id, action, and date range — all four indexes
exist in §25.7 for precisely these queries. The entity detail screens embed a scoped view
("History" on an order, a product, an employee), which is how the log actually gets used: not
by browsing the whole table, but by asking what happened to *this* thing.

---

## 24.13 Audit retention and why the log is trustworthy

**An audit log that the application can edit is not an audit log.** [25-database-schema.md](25-database-schema.md)
§25.1 states it and §25.7 requires the grant; this is the implementation.

```sql
-- migration: make the audit log append-only for the application role
REVOKE UPDATE, DELETE, TRUNCATE ON "AuditLog" FROM app_rw;
GRANT  INSERT, SELECT                ON "AuditLog" TO   app_rw;

-- retention is executed by a different role the application cannot assume
GRANT  DELETE ON "AuditLog" TO audit_janitor;
```

The application connects as `app_rw` and therefore **cannot** alter or remove an audit row, even
with a code-level bug, even with SQL injection, even deliberately. Prisma's soft-delete
middleware is explicitly bypassed for this table, and an attempted `UPDATE` surfaces as a
database error rather than silently succeeding. Without this grant the audit requirement is
decorative, and a decorative audit log is worse than none because it is trusted.

Retention:

| Age | Treatment |
|---|---|
| 0–{{AUDIT_HOT_MONTHS}} (default 24) months | Live in `AuditLog`, fully queryable in the admin |
| Older | Exported by the `audit_janitor` job to compressed JSONL in object storage, then deleted from the hot table. The export is written before the delete, and the delete is conditional on the export's checksum |
| Access, employee, payment and settings actions | Retained **{{AUDIT_COLD_YEARS}} (default 7) years** in cold storage, separately from catalogue noise |
| Personal data inside audit rows | Subject to the same erasure obligations as the source records. `customers.anonymize` writes a tombstone row and redacts the personal fields of prior rows **through the `audit_janitor` role**, never through the application — the one narrow, logged, role-separated exception to immutability |

The table is partitioned by month on `createdAt`, so retention is a partition drop rather than a
mass delete, and the `@@index([createdAt])` in §25.7 stays useful as the table grows.

`audit.export` is Owner-only (§24.5) and is itself audited. The person who takes the record of
everything out of the building is named in the record.

---

## 24.14 Enforcement points

Three layers. **The rule is that UI hiding is never the only enforcement, and never an
enforcement at all** — it is an affordance. A hidden button is a courtesy to the user, not a
boundary. The boundary is the API.

### Layer 1 — API middleware (the only real boundary)

Every route declares its permission. Declaration is mandatory and is verified by a test, not by
review discipline.

```ts
router.post('/admin/orders/:id/refund',
  requireAuth(),
  requirePermission('payments.refund'),
  requireConfirmation(),            // auto-applied for isDangerous permissions
  handler);
```

- `requireAuth` validates the access token, loads the session, and rejects any status other
  than `ACTIVE`.
- `requirePermission` runs the §24.1 resolution and returns **403 with the reason**
  (`no_permission` / `grant_deny` / `inactive_user`) — never 404, because disguising
  authorisation as absence makes support impossible and buys nothing against an attacker who is
  already authenticated.
- `requireConfirmation` demands an `X-Confirm-Token` header echoed from the confirmation dialog
  for any permission in `DANGEROUS_PERMISSIONS`, so a dangerous action cannot be triggered by a
  stray fetch or a replayed link.
- **Object-level checks live in the handler**, after the permission check: `leads.update` says a
  user may edit leads, while `Lead.assignedToId` decides which ones. Resource-level permission
  and row-level ownership are different questions and are never conflated.

**A route with no single capability declares that explicitly.** The dashboard (§24.4) is the one
such route: its authorisation is per widget, and there is nothing left for a check at the door to
decide. It therefore carries `requireStaffOnly()` rather than no decorator at all —

```ts
router.get('/admin/dashboard',
  requireAuth(),
  requireStaffOnly('per-widget authorisation — see §24.4'),   // reason is mandatory
  handler);
```

— because the two situations that matter are otherwise indistinguishable in a diff: a route whose
gate was considered and found to be per-object, and a route whose gate was forgotten. The marker is
inert at runtime. Its entire job is to be a declaration that CI can count and a reviewer can
challenge.

**The guard against a forgotten decorator** is a test that enumerates the router and fails if any
route lacks both `requirePermission` and `requireStaffOnly` — for every method, not only non-`GET`,
because a `GET` is how data leaves the building. Every RBAC system eventually ships an unguarded
endpoint; the only reliable defence is a test that cannot be satisfied by remembering.

### Layer 2 — Route guards in the SPA

The admin router checks permissions before rendering a module and shows a designed 403 screen —
naming the permission required and offering a contact route — rather than a blank page or a
redirect loop. This is a usability layer: it turns a confusing API error into an explanation.

### Layer 3 — UI affordance hiding

`usePermission('products.publish')` hides or disables controls. Rules:

- **Hide** navigation entries and whole sections the user cannot read, to reduce noise.
- **Disable with a reason** for actions inside a section the user *can* see. A publish button
  that vanishes makes a user think the feature is broken; a disabled button that says
  «потрібен дозвіл на публікацію» makes them ask the right person
  ([08-design-system.md](08-design-system.md) §8.5: a disabled control is never the only
  explanation of why an action is unavailable).
- **Never rely on it.** The client bundle is public once authenticated; hiding a button removes
  neither the route nor the knowledge of it.

---

## 24.15 The permission-check API

One shape, used identically on the server and in the client, so the two can never disagree about
what a permission means.

```ts
export interface EffectivePermissions {
  staffUserId: string;
  status: StaffStatus;
  roles: Array<{ key: string; name: string }>;
  /** Flat, resolved, DENY already applied. The client's source of truth. */
  allowed: readonly PermissionKey[];
  /** Explicit denials, surfaced so the UI can explain an unexpected absence (§24.1). */
  denied: Array<{ permission: PermissionKey; expiresAt: string | null }>;
  /** Cache coherence: bumped on any role, grant, or status write for this user. */
  version: number;
}

// GET /admin/me/permissions → EffectivePermissions

export function can(p: EffectivePermissions, key: PermissionKey): boolean;
export function canAll(p: EffectivePermissions, ...keys: PermissionKey[]): boolean;
export function canAny(p: EffectivePermissions, ...keys: PermissionKey[]): boolean;
export function isDangerous(key: PermissionKey): boolean;

// React
export function usePermission(key: PermissionKey): boolean;
export function useCan(): (key: PermissionKey) => boolean;

// Server — throws ForbiddenError carrying the Decision from §24.1
export function assertPermission(actorId: string, key: PermissionKey): Promise<void>;

// Explains a decision for the employee detail screen: "allowed via role manager"
export function explain(actorId: string, key: PermissionKey): Promise<Decision>;
```

Notes that matter in practice:

- **`PermissionKey` is the derived union from §24.4**, so `can(p, 'products.publsh')` is a
  compile error rather than a silent `false`. This is the single largest practical benefit of
  generating the type from the catalogue.
- **`allowed` is flat and pre-resolved.** The client never re-implements the algorithm. There is
  exactly one implementation of §24.1 and it runs on the server.
- **`version` drives cache invalidation.** The server caches the resolved set per user for 60
  seconds; any write to `StaffRoleAssignment`, `StaffPermissionGrant`, `RolePermission` or
  `StaffUser.status` bumps the version and evicts. Combined with permissions being absent from
  the access token (§24.9), a revocation takes effect on the next request.
- **`explain` exists for the admin UI**, where "why can Марія not refund?" must be answerable
  without reading the database. It returns the `Decision`, including which role or grant
  produced it.

---

## 24.16 Seeding, and preventing drift

[25-database-schema.md](25-database-schema.md) §25.11 requires that the database permission rows
and the type-level permission union cannot drift, and that this be prevented structurally rather
than by discipline. Drift is the classic RBAC bug: code checks `payments.refund`, the database
contains `payments.refunds`, the check always fails, and nobody notices until a refund is needed.

The mechanism is one-directional. **`PERMISSION_CATALOGUE` (§24.4) is the source; the database
is a projection of it.** Nothing is ever authored in the database.

### What the constant does not protect

**The catalogue makes the code path unable to drift. It does nothing for the prose.** This
document is the demonstration. Until this revision, five passages — the worked example in §24.1,
the DENY scenario that justifies the whole resolution order, the comment on the derived union in
§24.4, the `role.permissions_changed` diff sample in §24.12, and the sentence immediately above —
all named a permission the catalogue has never contained: `orders.refund`. The key is
`payments.refund`. Nothing failed to compile, no seed complained and no CI gate fired, because
none of those sentences is code.

The mistake was easy to make and is worth naming, because the shape of it recurs. The route is
`POST /admin/orders/:id/refund` (§24.14) and the audit action is `payment.refunded` (§24.12), so
the word "refund" appears under three different owners in three different registries, and a key
written from memory lands on the wrong one. The rule that follows:

- **Permission keys in prose are quotations, not descriptions.** Any `resource.action` written
  outside a code block is copied from §24.4, not recalled. If it cannot be found there, it does
  not exist, and the sentence containing it is wrong regardless of how reasonable it reads.
- **The same applies to the sibling documents.** A key cited in
  [26-api-architecture.md](26-api-architecture.md) or
  [23-admin-panel-architecture.md](23-admin-panel-architecture.md) is a citation of this
  catalogue and is checked against it, because a route table that gates on a key nobody defines
  is a route that cannot be built.
- **A consistency audit is the only instrument that catches this class.** The CI gates below
  cover strings the compiler and the router can see; they cannot read English. That
  asymmetry is permanent and is the reason the audit exists as a recurring exercise rather than
  a one-off.

```ts
// prisma/seed/permissions.ts — idempotent, runs on every deploy
export async function syncPermissions(db: PrismaClient) {
  const desired = ALL_PERMISSIONS.map(key => {
    const [resource, action] = key.split('.');
    return { key, resource, action, isDangerous: DANGEROUS_PERMISSIONS.has(key) };
  });

  // 1. Upsert every permission in the catalogue.
  for (const p of desired) {
    await db.permission.upsert({ where: { key: p.key }, create: p, update: p });
  }

  // 2. Report — never silently delete — anything in the DB but not in the catalogue.
  const orphans = await db.permission.findMany({
    where: { key: { notIn: desired.map(p => p.key) } },
  });
  if (orphans.length) {
    throw new Error(
      `ORPHAN_PERMISSIONS: ${orphans.map(o => o.key).join(', ')}. ` +
      `Remove the RolePermission and StaffPermissionGrant rows in an explicit migration first.`,
    );
  }
}
```

Deleting an orphan automatically would cascade through `RolePermission` and
`StaffPermissionGrant` and silently strip capability from real users during a deploy. Failing
loudly and demanding an explicit migration is the correct behaviour: removing a permission is a
decision, not a side effect.

**Role seeds reference permission keys, not ids**, and are authored as data beside the
catalogue:

```ts
export const SYSTEM_ROLES = {
  owner:           { name: 'Власник',          permissions: ALL_PERMISSIONS },
  administrator:   { name: 'Адміністратор',    permissions: [/* all except the owner-only three */] },
  manager:         { name: 'Менеджер',         permissions: [/* §24.5 */] },
  content_editor:  { name: 'Контент-редактор', permissions: [/* §24.5 */] },
  warehouse:       { name: 'Склад',            permissions: [/* §24.5 */] },
  support:         { name: 'Підтримка',        permissions: [/* §24.5 */] },
  photographer:    { name: 'Фотограф',         permissions: [/* §24.5 */] },
} as const satisfies Record<string, { name: string; permissions: readonly PermissionKey[] }>;
```

Behaviour on re-seed:

- **System roles are upserted by `key`** with `isSystem = true`. Their permission sets are
  reconciled *additively* for newly introduced permissions and are **not** reset otherwise —
  because §24.6 I4 permits an owner to have adjusted them deliberately, and a deploy must not
  silently undo a business decision.
- **Custom roles are never touched.**
- **Both Owner accounts** are created only if no owner exists, each with a one-time password that
  must be rotated on first sign-in ([25-database-schema.md](25-database-schema.md) §25.11). On any
  subsequent run the whole block is a no-op, so a deploy can never mint a privileged account.

### The two-Owner seed

```ts
// prisma/seed/owners.ts — runs once, only when no owner exists at all.
// ONE Owner, per 00-client-decisions-8.md §L1 (supersedes the two-Owner seed of
// §E1). Іван creates every other account, Любов's included, from the panel.
// 24.6 I1 explains why a single Owner is a recoverability risk; §L1 records it.
export const SEED_OWNERS = [
  {
    email: 'gif19601@gmail.com',            // {{OWNER_EMAIL_IVAN}} — EXTERNAL, never on {{DOMAIN}} (§K2 rule 3)
    firstName: 'Іван',
    lastName: 'Гондурак',
    note: 'Owner of production',
    // §H3 names Любов as quote owner; until Іван creates her account the
    // routing default points at him (§L1 consequence 1).
    isDefaultQuoteAssignee: true,           // seeds Setting orders.quote.default_assignee_id
  },
] as const;

export async function seedOwners(db: PrismaClient) {
  const ownerRole = await db.role.findUniqueOrThrow({ where: { key: 'owner' } });
  const existing = await db.staffRoleAssignment.count({ where: { roleId: ownerRole.id } });
  if (existing > 0) return;                 // idempotent: never mint an owner on a live system

  for (const o of SEED_OWNERS) {
    const user = await db.staffUser.create({
      data: { ...pick(o, ['email', 'firstName', 'lastName']), status: 'INVITED' },
    });
    await db.staffRoleAssignment.create({
      data: { staffUserId: user.id, roleId: ownerRole.id },
    });
  }
}
```

Four details are deliberate. The seed runs under **one** `existing > 0` guard, so re-running it
on a live system can never mint a second Owner behind the real one's back. (It was written for two
accounts; [00-client-decisions-8.md](00-client-decisions-8.md) §L1 reduced it to one.) They start `INVITED` rather than `ACTIVE`, so the password is set by
the human through the §24.8 invitation-token flow and never exists in a seed file or a deploy
log. The seller-of-record fact is carried as a comment rather than a column, because it is a
legal attribute of the business ([00-client-decisions-2.md](00-client-decisions-2.md) §E1), not a
permission — nothing in the authorisation model should branch on it. And the quote assignment is
written to a **`Setting` row** rather than to a role or a grant, for the same reason: it is a
routing default, changeable by anyone with `settings.update` when Любов is on holiday, and an
authorisation model that encodes who is on shift this week is an authorisation model that will be
edited under pressure.

The login address is Іван's **personal, external** Gmail, and it stays that way. It is also
**never published** on the site ([00-client-decisions-8.md](00-client-decisions-8.md) §L1).
This reverses an earlier plan to migrate them to branded addresses once the domain existed:
[00-client-decisions-7.md](00-client-decisions-7.md) §K2 moves business mail into the panel, so a
login address on `{{DOMAIN}}` would deliver the password-reset email into the panel its owner is
locked out of. Validation on `StaffUser.email` rejects any address on `{{DOMAIN}}` or on a
`Mailbox` domain ([32-security-architecture.md](32-security-architecture.md) §32.16a). When Любов's
account is created it needs a different external address — `StaffUser.email` is unique.

**Four CI gates** make the whole arrangement enforceable rather than aspirational:

1. `syncPermissions` runs against a scratch database and must exit clean — catching a permission
   removed from the catalogue while still referenced.
2. A test asserts that every `requirePermission(...)` string in the router is a member of
   `PermissionKey` — catching a typo in a route decorator, which the type system already catches
   at the call site but not in a string built dynamically.
3. A test asserts that every admin route carries either a `requirePermission` or an explicit
   `requireStaffOnly()` (§24.14) — an absent decorator fails, and the staff-only list is short
   enough that its growth is visible in review.
4. A committed snapshot of `ALL_PERMISSIONS`, sorted, diffed on every build. Adding or removing a
   permission fails the gate until the snapshot is updated in the same commit, which puts the
   change in the diff where a reviewer will see it. This replaces the hand-written member count
   §24.4 used to carry: a machine-maintained list that must be updated deliberately, instead of a
   number that goes stale silently.

---

## 24.17 Open questions

1. ~~**Does the Owner want a second Owner account?**~~ **Resolved** by
   [00-client-decisions-2.md](00-client-decisions-2.md) §E1: two Owners, Іван and Любов. **Then
   reduced to one** by [00-client-decisions-8.md](00-client-decisions-8.md) §L1: only Іван is
   seeded, and he creates Любов's account from the panel. A second Owner remains the
   recommendation. The Administrator role is unchanged. See §24.5 and §24.16.
2. ~~**{{MFA_PHASE}}**~~ **Resolved:** 2FA is mandatory for every staff account at launch
   ([00-client-decisions-8.md](00-client-decisions-8.md) §L14 item 4, §24.11).
3. **{{AUDIT_HOT_MONTHS}} / {{AUDIT_COLD_YEARS}}** — retention must be checked against Ukrainian
   accounting-record obligations and against EU data-subject rights for the `pl` and `de`
   locales. Assumed 24 months hot, 7 years cold, pending legal confirmation.
4. **Photographer engagement model** — if photography is contracted out, the account should carry
   an expiring `StaffPermissionGrant` window or a scheduled `deactivate`. Contractor accounts that
   outlive the contract are the most common stale-access finding in any review.
5. **Shared warehouse device** — if one phone is used by several people, per-person accounts are
   still required, and the device needs a short session lifetime rather than the default 30 days.
   Confirm how the warehouse actually works before setting {{WAREHOUSE_SESSION_TTL}}.
6. **{{HIBP_ENABLED}}** — confirm that an outbound call to a third-party breach API at password-set
   time is acceptable to the client. It sends only a five-character hash prefix, but it is an
   outbound call and should be a decision, not an assumption.
7. ~~**Who owns international quotes?**~~ **Resolved** by
   [00-client-decisions-5.md](00-client-decisions-5.md) §H3: Гондурак Любов Юріївна, as a default
   assignee on `orders.quote` rather than as an authorisation rule (§24.5, §24.16).
8. **Should a waived deposit have a value ceiling?** `payments.waive_deposit` is currently
   unbounded: a Manager may waive any deposit on any order. A per-order or per-week ceiling above
   which an Owner must approve is the obvious hardening, and it is deliberately **not** specified
   yet because the deposit's typical size is unknown until real Nova Poshta return rates are seen
   ([00-client-decisions-5.md](00-client-decisions-5.md) §H1.3). Revisit once the first quarter's
   waivers can be counted; until then the audit action `payment.deposit_waived` is what makes the
   pattern visible at all.
