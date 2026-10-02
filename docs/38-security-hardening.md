# 38 — Security Hardening Catalogue (140 controls)

> **Round 16:** egress may reach `oneknight.pro` only when `ONEKNIGHT_API_URL` is set; `ONEKNIGHT_SECRET_KEY` and `ONEKNIGHT_WEBHOOK_SECRET` are server-only; Checkbox leaves the egress list (round 14) — [00-client-decisions-16.md](00-client-decisions-16.md) O2.

> **Round 13 — cost:** no paid add-on services for now — free Cloudflare plan and free managed WAF ruleset; self-hosted Postgres with pgBackRest to a free-tier object-lock store; external pen test deferred in favour of self-run ZAP and ASVS; see [00-client-decisions-13.md](00-client-decisions-13.md) N7.

The client's brief: «максимальний захист… щоб навіть команда RedTeam не могла зламати сайт, чи
видалити його, чи щось міняти», while the site stays fast and nothing breaks. This document
extends [32-security-architecture.md](32-security-architecture.md); it does not repeat it. Where a
control already exists there, the row says so and adds only what is new.

## 38.0 What «unbreakable» honestly means

No internet-facing system can be proven unhackable, and a document that claims otherwise is the
first thing a red team reads. The design goal is the achievable one, in three layers:

1. **Make attacks fail** — every input distrusted, every privilege minimal, every layer assuming
   the one before it has fallen (defence in depth).
2. **Make a successful attack small** — a stolen admin session cannot refund, delete or change
   roles without a second factor; a compromised server cannot read the backups or delete them.
3. **Make destruction impossible to keep** — the site, its data and its media can be rebuilt from
   immutable, off-site copies within hours, whatever an attacker deletes.

Legend — **Status:** `new` or `§32.x` (exists; row adds the delta). **Cost:** runtime cost to
page speed — `0` none on the request path, `~` microseconds, `L` login or rare actions only.

---

## 38.1 Edge and network (Cloudflare in front of everything)

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 1 | All public hostnames proxied through Cloudflare; the origin IP is never published (no direct A records, mail through Cloudflare Email Routing) | Direct-to-origin attacks bypassing every edge control | new | 0 |
| 2 | Origin firewall accepts HTTP(S) **only from Cloudflare IP ranges**; everything else dropped | Origin discovery via scans or old DNS history | new | 0 |
| 3 | **Authenticated Origin Pulls** (mTLS Cloudflare → origin); the origin rejects any TLS client without Cloudflare's certificate | Attackers who find the IP and spoof Cloudflare headers | new | 0 |
| 4 | Cloudflare WAF with managed rules (OWASP core set) — **log mode two weeks, then block** | Known injection, traversal and scanner patterns | new | 0 |
| 5 | Edge rate limits per IP on `/v1/auth/*`, `/v1/quick-orders`, `/v1/checkout/*`, `/v1/orders/lookup`, `/v1/reviews`, search | Credential stuffing, form spam, enumeration, scraping bursts | §32.13 → moved to the edge first | 0 |
| 6 | Cloudflare DDoS protection and «Under Attack» runbook switch | Volumetric and L7 floods | new | 0 |
| 7 | **`/admin` and `/v1/admin/*` behind Cloudflare Access (Zero Trust)** — only the staff e-mail list, one-time code, allowed countries; the panel's own login + 2FA come *after* | The admin panel is invisible to the internet; stolen passwords are useless without passing Access first | new | L |
| 8 | Turnstile (invisible) on quick order, reviews, order lookup; escalates only on suspicion | Bots without hurting older buyers | §32.13 | 0 |
| 9 | TLS 1.2+ only, HSTS with `preload`, HTTP → HTTPS at the edge | Downgrade and cookie theft on networks | §32.11 → preload added | 0 |
| 10 | DNSSEC on `vivcharyk.shop`; CAA records allowing only the chosen CA | DNS spoofing, rogue certificates | new | 0 |
| 11 | Registrar lock, auto-renew, registrar and Cloudflare accounts on **hardware-key 2FA**, recovery to an external address | Domain hijack — the one attack that takes everything at once | new (extends §32.16a) | 0 |
| 12 | Bot management: block known bad bots and AI scrapers of checkout/admin paths; allow search engines by verified bot list | Scraping and automated abuse | new | 0 |

## 38.2 Server, operating system, containers

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 13 | Minimal Debian stable host, unattended security updates, reboot window | Unpatched OS exploits | new | 0 |
| 14 | **SSH only over WireGuard**, keys only, no root login, no passwords; port 22 closed to the internet | SSH brute force, exposed management | new | 0 |
| 15 | Host firewall (nftables) default-deny both directions | Lateral movement, reverse shells calling out | new | 0 |
| 16 | Containers run as non-root, **read-only root filesystem**, `no-new-privileges`, all Linux capabilities dropped, default seccomp | Container escape, persistence after RCE | new | 0 |
| 17 | Database never exposed publicly; private network only; `sslmode=verify-full` | Direct DB attacks, sniffing | new | 0 |
| 18 | **Egress allowlist**: the app may call out only to WayForPay, Nova Poshta, Ukrposhta, Cloudinary, the ESP, Telegram, Checkbox, Google, Anthropic, R2; everything else blocked | SSRF payoff, data exfiltration, malware downloads | new | ~ |
| 19 | CPU/memory/pids limits per container | Resource-exhaustion DoS, fork bombs | new | 0 |
| 20 | File-integrity monitoring on the host (AIDE) and container image digests checked at start | Silent tampering with binaries | new | 0 |
| 21 | auditd + central log shipping; logs leave the host within seconds | Attackers erasing their tracks | new | 0 |
| 22 | Secrets delivered as files with `0400` permissions (sops-encrypted in the repo, decrypted only on deploy); never in images or env dumps | Secret leakage through images, crash dumps, `/proc` | §32.17 → mechanism fixed | 0 |
| 23 | No unused services, no package managers or shells in production images (distroless) | Tools an attacker would use after a foothold | new | 0 |
| 24 | Separate host or project for staging; staging data is synthetic | Pivot from staging to production; leaked real data | new | 0 |

## 38.3 Injection and input handling

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 25 | One Zod schema per endpoint, `strict()` — unknown fields rejected | Malformed and extra-field payloads | §32.7 → strict | ~ |
| 26 | Prisma only; **`$queryRawUnsafe` / `$executeRawUnsafe` banned by lint and CI**; raw SQL only as tagged templates | SQL injection | §32.10 → CI ban | 0 |
| 27 | Search uses `websearch_to_tsquery` / `plainto_tsquery` with bound parameters; sort and filter keys from an allowlist | Injection through search, ORDER BY and column names | new | ~ |
| 28 | **Mass-assignment guard**: handlers pick allowed fields explicitly; no request body spread into Prisma | Setting `price`, `role`, `status` through extra fields | new | ~ |
| 29 | Prototype-pollution guard: JSON parsed with `secure-json-parse`; keys `__proto__`, `constructor`, `prototype` rejected | Server-side prototype pollution | new | ~ |
| 30 | No user-controlled file paths anywhere; media referenced by validated Cloudinary public IDs | Path traversal | new | 0 |
| 31 | **No server fetch of user-supplied URLs**; the only outbound calls are to fixed hosts (plus control 18) | SSRF | new | 0 |
| 32 | React output escaping; `dangerouslySetInnerHTML` only for server-sanitised rich text (DOMPurify allowlist) — enforced by lint | Stored and reflected XSS | §32.8–32.9 → lint | 0 |
| 33 | **Strict CSP with nonces + Trusted Types**; report-only for two weeks, then enforced | XSS that slips past escaping | §32.11 → Trusted Types | 0 |
| 34 | Typed e-mail templates with escaped variables; header values stripped of CR/LF | E-mail template and header injection | new | ~ |
| 35 | **CSV/Excel export escapes formulas** (`=`, `+`, `-`, `@`, tab) | Formula injection into staff spreadsheets | new | 0 |
| 36 | Excel import parsed in an isolated worker with size, row, and zip-ratio limits; macros ignored | Zip bombs, parser exploits, oversized files | new | 0 |
| 37 | Regex safety lint (no catastrophic backtracking); request body limit 100 KB (uploads bypass the app) | ReDoS, memory exhaustion | new | ~ |
| 38 | Open-redirect guard: return URLs only relative and allowlisted | Phishing via the site's own domain | new | ~ |
| 39 | Host header pinned to the canonical host; unknown hosts get 421 | Password-reset poisoning, cache poisoning | new | ~ |
| 40 | **AI output is untrusted data**: translations and description drafts are sanitised text, never executed, never given tools, and never published without a human save (round 10 §P8a) | Prompt injection through product text or inbound mail | new | 0 |

## 38.4 Authentication, sessions, authorisation

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 41 | Mandatory TOTP 2FA, recovery codes, replay guard | Stolen passwords | §24.11 | L |
| 42 | Argon2id, breached-password check, lockout, no user enumeration | Cracking, stuffing, account probing | §32.6 | L |
| 43 | Session cookies `__Host-` prefixed, `HttpOnly`, `Secure`, `SameSite=Strict`, scoped to `/admin` | Cookie theft and injection | §32.4 → `__Host-` | 0 |
| 44 | CSRF: SameSite **plus** `Origin` check **plus** per-session token on every state-changing admin request | Cross-site request forgery | §32.10 → triple | ~ |
| 45 | Refresh rotation with reuse detection revoking every session | Token theft | §24.9 | 0 |
| 46 | **Step-up re-authentication** (TOTP again, valid 5 min) for refunds, payment settings, role and permission changes, hard delete, bulk price change, exports, mailbox and template management | A hijacked live session doing the damage that matters | new | L |
| 47 | Server-side permission check on every route (CI gate: no route without a guard) | Missing authorisation | §24.16 | ~ |
| 48 | **Object-level checks** in handlers; cuid2 IDs; guest order access by token + e-mail | IDOR | §32.5 | ~ |
| 49 | **Two-person rule** for the most dangerous actions: granting Owner/Administrator, disabling 2FA for someone, deleting a template — needs the second Owner's approval once a second Owner exists; until then, a Telegram alert to the Owner with a 10-minute undo | A single compromised admin changing who controls the shop | new | L |
| 50 | Idle timeout and absolute session cap (round 8: 12 h or 7 days remembered) | Abandoned sessions | §24.11 | 0 |
| 51 | New-device and new-country login alert to Telegram and e-mail | Unnoticed takeovers | §32.6 → Telegram | L |
| 52 | Admin cannot raise own privileges; roles cannot exceed their creator's | Privilege escalation | §24.6 | ~ |
| 53 | Permission cache invalidated on every role change (`permVersion`) | Revoked access lingering | §32.4 | ~ |
| 54 | Passkeys (WebAuthn) as an optional second factor for Owners | Phishing of TOTP codes | new (phase 2) | L |
| 55 | Staff login e-mails never on the site's domain (recovery loop) | Lock-out and domain-level takeover | §32.16a | 0 |
| 56 | Guest order lookup rate-limited and shows status only | Order enumeration and data leakage | round 10 | ~ |

## 38.5 Data protection

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 57 | TLS for every internal hop (app ↔ DB, app ↔ R2, app ↔ providers) | Sniffing inside the provider network | new | 0 |
| 58 | Encryption at rest for the database volume and object storage | Disk or snapshot theft | new | 0 |
| 59 | Application-level encryption (AEAD) for 2FA secrets, API keys stored in settings, bot tokens | Database dump yielding live credentials | §24.11 → extended | ~ |
| 60 | **Least-privilege database roles**: the app role cannot `DROP`, `TRUNCATE`, `ALTER` or `DELETE` from protected tables; migrations run under a separate role only in CI | «Delete the database» through any app bug | new | 0 |
| 61 | Row-level protections: `AuditLog`, `StockMovement`, `ProductRevision`, `PaymentTransaction` are **append-only** (DB triggers reject UPDATE/DELETE) | Rewriting history to hide fraud | new | ~ |
| 62 | **Hash-chained audit log** (each row carries the hash of the previous); daily chain head anchored off-site | Silent tampering with the audit trail | §24.13 → chain | ~ |
| 63 | `statement_timeout` and per-role connection limits in Postgres | Slow-query DoS, pool exhaustion | new | 0 |
| 64 | PII redaction in logs and error reports (e-mail, phone, address masked) | Data leakage through logs | §26.18 → enforced | ~ |
| 65 | Data minimisation and retention jobs (mail 8 months, quick orders 8 months) | Breach impact | round 8/9 | 0 |
| 66 | Secret scanning (gitleaks) on every commit; rotation schedule for every key | Leaked keys | §32.17 → CI | 0 |

## 38.6 «Nobody can delete the site» — integrity and recovery

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 67 | Managed Postgres with point-in-time recovery (7–14 days) | Data loss, bad migrations | §32.17 | 0 |
| 68 | **Daily encrypted database dumps to a separate provider with Object Lock (WORM) for 35 days** — the production server has write-only credentials and cannot delete or overwrite them | An attacker with full server access wiping data *and* backups | new | 0 |
| 69 | Backup encryption key held offline by the Owner and the developer, not on any server | Backups being read after theft | new | 0 |
| 70 | Weekly export of Cloudinary media and R2 mail to the same locked storage | Media or mailbox deletion | new | 0 |
| 71 | **Monthly restore drill** into a scratch environment, timed, logged | Backups that do not actually restore | §32.17 → monthly | 0 |
| 72 | Infrastructure as code + runbook: a clean production rebuild in under 2 hours from repository + backups | Server destruction | new | 0 |
| 73 | Deploys **only from CI** via short-lived OIDC credentials; no human pushes to production; production SSH is break-glass only | Tampered deploys, stolen deploy keys | new | 0 |
| 74 | Signed, digest-pinned container images; the host runs only images signed by CI | Swapped images | new | 0 |
| 75 | Repository: protected main branch, required review, signed commits, org 2FA with hardware keys | Malicious code entering the codebase | new | 0 |
| 76 | Provider «deletion protection» on the database and storage; destructive admin operations capped (bulk actions ≤ 50 items, typed confirmation, soft delete + undo) | Mass destruction through the panel or the console | new | L |

## 38.7 Supply chain and CI

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 77 | `npm ci` from the lockfile only; install scripts disabled except an allowlist | Malicious install hooks | new | 0 |
| 78 | Dependency updates via Renovate with a **3-day cooling-off** and grouped review | Freshly published malicious versions | new | 0 |
| 79 | OSV / npm audit, Trivy image scan, Semgrep + CodeQL SAST — build fails on high findings | Known vulnerable code and images | §32.17 → gates | 0 |
| 80 | SBOM (CycloneDX) per release | Unknown exposure when a new CVE appears | new | 0 |
| 81 | GitHub Actions pinned by commit SHA, least-privilege tokens, no secrets on PRs from forks | CI hijack | new | 0 |
| 82 | **No third-party scripts except Google Analytics**, loaded with the CSP nonce after consent; any external script needs Subresource Integrity | Magecart-style card or data skimming | §32.11 → rule | 0 |
| 83 | New dependency requires a written reason in the PR; no packages under 6 months old or with a single maintainer for security-relevant code | Typosquatting and abandoned packages | new | 0 |
| 84 | OWASP ZAP baseline scan against staging on every release | Regressions a unit test cannot see | new | 0 |

## 38.8 Payments and business logic

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 85 | Every price, discount, shipping and prepayment computed server-side; client values ignored | Price tampering | §26 | ~ |
| 86 | WayForPay callbacks: signature, amount, currency and order match; idempotent; timestamp window | Forged or replayed payment confirmations | §32.10 | ~ |
| 87 | Order state machine enforced server-side; illegal transitions rejected | Skipping payment, reopening orders | §26 | ~ |
| 88 | Stock decrement atomic (`UPDATE … WHERE stock >= n`) inside the order transaction | Race conditions overselling one-of-one sheepskins | new | ~ |
| 89 | Per-device and per-IP cap on concurrent reservations | Bots holding all sheepskins | new | ~ |
| 90 | Promo codes: server validation, usage limits, no stacking (round 8) | Coupon abuse | §18.10 | ~ |
| 91 | Refunds: step-up, audit, Telegram alert, refund ≤ captured amount, fiscal return receipt | Refund fraud by an insider or hijacked session | new | L |
| 92 | Quick-order and review spam: Turnstile, rate limits, phone format validation, duplicate suppression | Inbox flooding | §32.13 | ~ |

## 38.9 Monitoring and response

| # | Control | Stops | Status | Cost |
|---|---|---|---|---|
| 93 | Security alerts to Telegram (Іван, Любов, developer): new-device login, 2FA failures burst, role change, mass price change, refund, WAF spike, backup failure, certificate expiry | Attacks going unnoticed | new | 0 |
| 94 | External uptime monitoring every minute from two regions | Silent outages or defacement | new | 0 |
| 95 | Defacement check: hourly hash of key pages' critical content compared with the published revision | Content changed outside the panel | new | 0 |
| 96 | Error monitoring with PII scrubbing; CSP violation reports collected | Exploit attempts visible as errors | §26.18 | 0 |
| 97 | Anomaly thresholds: orders, refunds, stock changes, logins per hour | Automated fraud | new | 0 |
| 98 | Incident runbook with a contact tree, «Under Attack» switch, credential-rotation checklist, restore steps | Panic and slow response | §32.17 → expanded | 0 |
| 99 | Independent penetration test before launch and yearly; `security.txt` with a disclosure address | Blind spots of the builders | new | 0 |
| 100 | Acceptance standard: **OWASP ASVS Level 2** checklist passed and signed before launch | Unmeasured «secure enough» | new | 0 |

---

## 38.10 Speed stays intact

Security work lands where it costs nothing on the page path:

- **Edge first.** WAF, rate limits, bot filtering, TLS and DDoS live at Cloudflare (controls 1–12);
  they add no work to the origin and filter traffic before it arrives, which makes the site
  *faster* under attack, not slower.
- **Only `~` and `L` costs on the request path.** Validation and permission checks are
  microseconds; Argon2, TOTP and step-up run only at login and on rare dangerous actions.
- **Heavy checks in CI, not in production.** Scanning, SAST, image scans, ZAP and dependency
  audits (77–84) never run on a user's request.
- **Caching unchanged.** Public pages stay CDN-cached (§26.13); nothing in this catalogue
  personalises a cached page. CSP nonces are applied only to server-rendered HTML that is not
  shared-cached.
- **Performance budgets remain gates** ([13-motion-system.md](13-motion-system.md) §13.5,
  [35-implementation-roadmap.md](35-implementation-roadmap.md) §35.11): a security change that
  breaks LCP, INP or CLS budgets fails CI like any other change.

## 38.11 Rolling out without breaking the site

1. **Observe, then enforce.** CSP (33), WAF (4) and edge rate limits (5) start in report or log
   mode for two weeks on production traffic; rules that would have blocked real buyers are
   tuned before enforcement.
2. **Staging mirrors production security.** Every control is on in staging; the full end-to-end
   suite (checkout, payment test mode, admin flows, mail) must pass there before release.
3. **Feature flags for anything user-visible** (Access policy, step-up, Turnstile), so a
   misconfiguration is switched off in seconds without a deploy.
4. **One control per release where it can affect users**, with a rollback note.
5. **Break-glass documented and tested** for every lock (Access, 2FA, WireGuard, registrar), so a
   protection never becomes the outage.

## 38.12 Priority

- **Before any real data exists (Phase 1):** 2, 13–17, 22, 25–33, 41–48, 57–61, 66, 73–75, 77–81.
- **Before launch:** 1, 3–12, 18–21, 34–40, 49–53, 62–65, 67–72, 76, 82–100.
- **After launch:** 54 (passkeys), periodic re-tests, rule tuning.

---

## 38.13 Photo and video attack surface (controls 101–140)

Images and video are the most common way to smuggle an attack into a site that otherwise
validates everything: a file that is «just a photo» can carry script, crash an image library,
exhaust memory, leak a customer's location or put illegal content on the brand's domain. The
rule behind every control below: **an uploaded file is never trusted, never served as uploaded,
and never processed where it could reach anything that matters.**

### Upload surfaces — reduced first

| Surface | Who uploads | Decision |
|---|---|---|
| Product photos and video | Staff (authenticated, 2FA) | Kept — Cloudinary signed direct upload |
| **Review photos** | **Any buyer — the highest-risk surface** | Kept, with quarantine and moderation (below) |
| Inbound mail attachments | Anyone who can e-mail `info@` | Kept — isolated, download-only except re-encoded image thumbnails |
| Video reviews | Staff only — buyers send videos by messenger; Іван uploads the ones to publish | **No public video upload at all** |
| Staff avatars | — | **Removed** — initials only; one fewer upload path |

### Validation, processing, serving

| # | Control | Stops | Cost |
|---|---|---|---|
| 101 | **Format allowlist by content, not extension**: JPEG, PNG, WebP, AVIF, HEIC for photos; MP4 (H.264/AAC) and WebM for video. Client filename and MIME ignored; format taken from the decoded file | Double extensions (`photo.jpg.html`), spoofed MIME, null-byte names | 0 |
| 102 | **SVG, GIF, TIFF, BMP, PSD, RAW and PDF never accepted as images** from anyone; site SVGs live in code, not uploads | Script inside SVG, exotic parser bugs | 0 |
| 103 | **Every image is decoded and re-encoded** before anything serves it; the original is kept private and never delivered | Polyglot files (image + HTML/JS), payloads in trailing bytes and chunks | 0 |
| 104 | **All metadata stripped** (EXIF, XMP, IPTC, ICC except sRGB conversion, comments, thumbnails); orientation applied first | GPS leaks of buyers' homes, payloads in metadata, XSS via displayed EXIF | 0 |
| 105 | **Pixel-flood guard**: header dimensions read first; > 12 000 px on a side or > 50 MP rejected before full decode; `limitInputPixels` in any local decoder | Decompression bombs that exhaust memory | 0 |
| 106 | Multi-frame images (animated WebP/AVIF/HEIC sequences) flattened to the first frame for reviews; rejected for products | Frame bombs, flashing content | 0 |
| 107 | Size limits: product photo ≤ 25 MB, review photo ≤ 8 MB and ≤ 3 per review, product video ≤ 30 s and ≤ 100 MB | Storage and processing floods | 0 |
| 108 | **Random server-side names** (cuid2); user filenames stored only as escaped text for staff display | Path tricks, filename-based XSS in the admin | 0 |
| 109 | Uploaded media served **only from the media host** (`img.vivcharyk.shop` → Cloudinary), never from the site or API origin; that host sets no cookies | A malicious file executing with the site's origin and cookies | 0 |
| 110 | Every media response carries the correct `Content-Type`, `X-Content-Type-Options: nosniff` and, for anything not an image or video, `Content-Disposition: attachment` | Browser content sniffing turning a file into a page | 0 |
| 111 | **Cloudinary strict transformations**: only named, pre-approved transformations (card, gallery, zoom, thumbnail, social) can be generated; arbitrary URL transformations return 401 | Attackers generating thousands of variants to run up the bill or crash processing | 0 |
| 112 | Signed upload parameters scoped to one folder, one resource type, allowed formats, max bytes, a one-hour expiry and a **single-use nonce**; unsigned uploads disabled on the account | Reusing a signature to upload anything, anywhere | ~ |
| 113 | Uploads land in a **private quarantine folder**; the server verifies the Cloudinary record (format, dimensions, bytes, frames) through the Admin API before promoting it to the public folder | Files that passed the browser but break the rules | 0 |
| 114 | Local image processing (only for mail thumbnails) runs in an **isolated worker container**: no network, read-only filesystem, memory and CPU caps, 10 s timeout, seccomp; libvips (sharp), never ImageMagick | Parser exploits (libwebp CVE-2023-4863 class, ImageTragick) reaching the application | 0 |
| 115 | Image libraries in that worker patched within 72 h of a security release; Trivy fails the build on known-vulnerable decoders | Known codec exploits | 0 |
| 116 | **We never run ffmpeg on uploaded video.** Transcoding happens in Cloudinary; if a local probe is ever needed, ffmpeg runs with `-protocol_whitelist file`, no network, sandboxed | The classic ffmpeg HLS/playlist trick that reads local files or calls internal URLs (SSRF) | 0 |
| 117 | Video delivered as Cloudinary-transcoded renditions in a native `<video>` element; no third-party player scripts | Player vulnerabilities, script injection through players | 0 |
| 118 | Video captions, if added, are plain WebVTT generated by staff and escaped; no uploaded subtitle files from outside | Script and markup injection via captions | 0 |
| 119 | Alt text and titles are text only, escaped everywhere; auto-generated from product data | Media metadata becoming markup | 0 |
| 120 | Draft and unpublished product media delivered only through **authenticated, time-limited URLs** until the product is published | Leaks of unreleased products; guessable URLs | 0 |

### Review photos — public uploads

| # | Control | Stops | Cost |
|---|---|---|---|
| 121 | Review photo upload only for a real order: a one-time link in the review-request e-mail (or order lookup), bound to that order | Anonymous upload spam and abuse | ~ |
| 122 | Turnstile + per-order and per-IP limits (3 photos, 1 review per product per order) | Bot floods | ~ |
| 123 | **Nothing is public before Іван approves it** (round 10); pending photos stay private in quarantine and are shown to staff only as re-encoded previews | Offensive or illegal content ever appearing on the site | 0 |
| 124 | Illegal-content safety net: the Cloudflare CSAM Scanning Tool on the proxied media host, plus the moderation-first rule; a matched file is blocked, preserved for the authorities and never shown | Illegal material hosted under the brand | 0 |
| 125 | Moderation screen flags QR codes and visible URLs inside review photos | Phishing through «customer» photos | 0 |
| 126 | Gallery reuse only with the buyer's consent checkbox (round 10); faces of children are not published | Privacy complaints and GDPR exposure | 0 |
| 127 | Rejected or abandoned uploads deleted after 7 days | Storage growth, retention of personal images | 0 |

### Inbound mail attachments

| # | Control | Stops | Cost |
|---|---|---|---|
| 128 | Attachments stored privately in R2; images shown only as re-encoded thumbnails from control 114; every other type is download-only (§32.16a) | Malicious attachments executing in the panel | 0 |
| 129 | **ClamAV scan on ingest is on** (resolves `{{MAIL_AV_SCAN}}`), in the isolated worker; infected files quarantined, the thread marked | Malware delivered to staff | 0 |
| 130 | Executables, macro Office files, archives and disk images flagged with a red warning; archives are never unpacked by the system | Staff opening the one dangerous file | 0 |
| 131 | Attachment size cap 25 MB per message (provider limit) and 100 attachments per day per sender | Mailbox flooding | 0 |

### Accounts, cost abuse, recovery

| # | Control | Stops | Cost |
|---|---|---|---|
| 132 | Cloudinary account: hardware-key 2FA, separate API keys per environment, the production API secret only on the server (never in the browser), sub-account restrictions where supported | A media-account takeover deleting or replacing every photo | 0 |
| 133 | Cloudinary and R2 usage alerts (bandwidth, transformations, storage) to Telegram at 50% and 80% of plan | Cost-exhaustion attacks noticed before the bill | 0 |
| 134 | Hotlink limits: media host serves images only with cache-friendly headers through Cloudflare; abusive referrers blocked at the edge | Bandwidth theft | 0 |
| 135 | Weekly export of all media to the Object-Lock bucket (control 70) — photos and videos can be restored even if the Cloudinary account is wiped | Deletion of the brand's photography | 0 |
| 136 | Replacing a published photo keeps the previous version for 30 days (restore from the product's version history) | Silent swapping of product photos | 0 |

### Monitoring

| # | Control | Stops | Cost |
|---|---|---|---|
| 137 | Media webhook audit: every upload, promotion, rejection and deletion logged with who and from where | Unexplained media changes | 0 |
| 138 | Alert on unusual media activity: > 50 uploads/hour, mass deletions, strict-transformation 401 spikes | Automated abuse in progress | 0 |
| 139 | Hourly check that the key product and hero images still match their published hashes (extends control 95) | Defacement by media replacement | 0 |
| 140 | Media security included in the pre-launch penetration test scope: polyglots, pixel floods, SVG, HEIC, malformed MP4, signature reuse, transformation abuse | Blind spots in this very list | 0 |

**Speed.** Every control above runs at upload time, in Cloudinary, in the isolated worker or at
the edge — none on a buyer's page request. Re-encoding into AVIF/WebP with strict, pre-sized
transformations actually makes pages *lighter*: buyers only ever receive optimised renditions,
never multi-megabyte originals.
