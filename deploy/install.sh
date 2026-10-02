#!/usr/bin/env bash
# Вівчарик on a VPS (Debian 13 trixie; also Debian 12 / Ubuntu 22.04+), run as root:
#   sudo bash /opt/vivcharyk/deploy/install.sh vivcharuk.com [SOURCE_DIR]
# deploy/push.sh runs it with SOURCE_DIR = the code it uploaded to the SSH user's home; the code is
# then copied into /opt/vivcharyk here, so the upload itself needs no root.
# Safe to run again: it is also the update step (migrations, build, restart) and does not take the
# site down: new builds go to fresh directories under releases/ and are switched in atomically, the
# API and the storefront restart one after another, and Caddy holds requests while each restarts.
# Installs Docker, Node.js 22, Postgres 16 (Docker, local only), Caddy (Docker, automatic HTTPS),
# two systemd services, a firewall, fail2ban, automatic security updates and backups.
# Card payments and the test tariffs stay off.
set -euo pipefail
DOMAIN="${1:?Вкажіть домен: sudo bash deploy/install.sh vivcharuk.com}"
SRC="${2:-}"
APP=/opt/vivcharyk
REL=$APP/releases
HERE="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "Запустіть від root: sudo bash $0 $DOMAIN"
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l

# 1. System packages (all checked to exist on Debian 13). Only missing ones are installed, so an
#    update run does not touch apt at all.
missing() { local p; for p in "$@"; do dpkg-query -W -f='${Status}' "$p" 2>/dev/null | grep -q 'ok installed' || printf '%s ' "$p"; done; }
PKGS="$(missing ca-certificates curl gnupg rsync xz-utils ufw docker.io docker-cli fail2ban python3-systemd unattended-upgrades)"
# ImageMagick converts photos uploaded from iPhone Safari to WebP (round 20 product wizard). Debian 13
# ships v7 (`magick`), older releases v6 (`convert`); the API accepts either. No recommends: no X/fonts.
IM="$(command -v magick >/dev/null || command -v convert >/dev/null || echo imagemagick)"
if [ -n "$PKGS$IM" ]; then
  say "Встановлюю системні пакети: $PKGS$IM"
  apt-get update -y
  # shellcheck disable=SC2086
  [ -z "$PKGS" ] || apt-get install -y $PKGS
  [ -z "$IM" ] || apt-get install -y --no-install-recommends imagemagick
fi
systemctl enable --now docker >/dev/null

# Node.js 22. NodeSource's repository is distro-independent ("nodistro") and its setup script only
# requires a Debian-based system, but NodeSource does not list Debian 13 officially; Debian 13's own
# nodejs is 20.x (too old). So: NodeSource first, the official nodejs.org build as the fallback.
node_major() { node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }
node_from_tarball() {
  local base=https://nodejs.org/dist/latest-v22.x arch file tmp
  case "$(uname -m)" in x86_64) arch=x64 ;; aarch64) arch=arm64 ;; *) return 1 ;; esac
  tmp="$(mktemp -d)"
  curl -fsSL "$base/SHASUMS256.txt" -o "$tmp/SHASUMS256.txt" || return 1
  file="$(awk -v s="-linux-$arch.tar.xz" 'substr($2, length($2) - length(s) + 1) == s { print $2 }' "$tmp/SHASUMS256.txt")"
  [ -n "$file" ] && curl -fsSL "$base/$file" -o "$tmp/$file" || return 1
  (cd "$tmp" && grep " $file\$" SHASUMS256.txt | sha256sum -c --quiet -) || return 1
  tar -xJf "$tmp/$file" -C /usr/local --strip-components=1 --exclude CHANGELOG.md --exclude README.md --exclude LICENSE
  rm -rf "$tmp"
}
if [ "$(node_major)" -lt 22 ]; then
  say "Встановлюю Node.js 22"
  if ! { curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && bash /tmp/nodesource_setup.sh && apt-get install -y nodejs; }; then
    warn "NodeSource не спрацював — ставлю офіційну збірку з nodejs.org у /usr/local"
    node_from_tarball || die "Не вдалося встановити Node.js 22."
  fi
  hash -r
  [ "$(node_major)" -ge 22 ] || die "Node.js $(node -v 2>/dev/null || echo '—') замість 22+: перевірте, чи немає старого node у PATH."
fi
NODE="$(command -v node)"

# 2. Code: from the uploaded copy into /opt/vivcharyk. Server-only state is excluded, so --delete never
#    touches it: .env, node_modules, builds/releases, uploaded media and mail.
if [ -n "$SRC" ]; then
  [ -f "$SRC/deploy/install.sh" ] || die "У $SRC немає коду сайту."
  say "Копіюю код у $APP"
  mkdir -p "$APP"
  rsync -a --delete \
    --exclude node_modules --exclude /.env --exclude /media --exclude /mail-store --exclude /mail-outbox \
    --exclude /releases --exclude 'apps/*/build' --exclude dist --exclude .react-router --exclude '*.tsbuildinfo' \
    --exclude /.cache --exclude /.npm \
    "$SRC/" "$APP/"
  # Media from the computer is added, never mirrored: photos uploaded in the panel stay.
  mkdir -p "$APP/media"
  if [ -d "$SRC/media" ]; then rsync -a "$SRC/media/" "$APP/media/"; fi
fi
cd "$APP"
mkdir -p media mail-store "$REL"

# 3. A system user that runs the site
id vivcharyk >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin vivcharyk

# 4. Production .env with fresh secrets (once; never overwritten)
if [ ! -f .env ]; then
  say "Створюю .env з новими секретами"
  node -e '
    const fs = require("fs"), c = require("crypto"), d = process.argv[1];
    const db = c.randomBytes(16).toString("hex"), hex = () => c.randomBytes(32).toString("hex");
    fs.writeFileSync(".env", [
      "NODE_ENV=production",
      `DATABASE_URL=postgresql://vivcharyk:${db}@127.0.0.1:5434/vivcharyk`,
      `DATABASE_DIRECT_URL=postgresql://vivcharyk:${db}@127.0.0.1:5434/vivcharyk`,
      `JWT_ACCESS_SECRET=${hex()}`, `COOKIE_SECRET=${hex()}`, `STAFF_TOKEN_SECRET=${hex()}`,
      `MFA_ENCRYPTION_KEY=${c.randomBytes(32).toString("base64")}`,
      `SITE_URL=https://${d}`, `ADMIN_URL=https://${d}/admin`,
      "HOST=127.0.0.1", "PORT=3000", "WEB_PORT=3001",
      "SHIPPING_TEST_RATES=0", "PAYMENTS_STUB=0",
      "# Filled in later (empty = off): NOVA_POSHTA_API_KEY, CLOUDINARY_URL, TELEGRAM_BOT_TOKEN, VITE_GA_ID",
      "NOVA_POSHTA_API_KEY=", "CLOUDINARY_URL=", "TELEGRAM_BOT_TOKEN=",
      "# Outgoing mail through Resend (round 18 C15): fill on the server, then restart vivcharyk-api.",
      "# SMTP_HOST=smtp.resend.com  SMTP_USER=resend  SMTP_PASS=<Resend API key>  MAIL_FROM=Вівчарик <no-reply@vivcharuk.com>  MAIL_REPLY_TO=info@vivcharuk.com",
      "SMTP_HOST=", "SMTP_PORT=587", "SMTP_USER=", "SMTP_PASS=", "MAIL_FROM=", "MAIL_REPLY_TO=",
      "# «Пошта» in the panel reads info@ (round 19 D1): the mailbox password from Porkbun, then restart vivcharyk-api.",
      "MAILBOX_ADDRESS=info@" + d, "MAILBOX_PASSWORD=", "",
    ].join("\n"), { mode: 0o600 });' "$DOMAIN"
fi
chown vivcharyk:vivcharyk .env; chmod 600 .env
DB_URL="$(grep -E '^DATABASE_URL=' .env | cut -d= -f2-)"
read -r DB_USER DB_PASS DB_NAME < <(node -e 'const u=new URL(process.argv[1]);console.log(decodeURIComponent(u.username),decodeURIComponent(u.password),u.pathname.slice(1))' "$DB_URL")

# 5. Database: Postgres 16, reachable only from this machine
if ! docker container inspect vivcharyk-db >/dev/null 2>&1; then
  say "Створюю базу даних"
  docker run -d --name vivcharyk-db --restart unless-stopped \
    -e POSTGRES_USER="$DB_USER" -e POSTGRES_PASSWORD="$DB_PASS" -e POSTGRES_DB="$DB_NAME" \
    -p 127.0.0.1:5434:5432 -v vivcharyk-db-data:/var/lib/postgresql/data postgres:16-alpine >/dev/null
fi
docker start vivcharyk-db >/dev/null
for _ in $(seq 1 60); do docker exec vivcharyk-db pg_isready -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1 && break; sleep 1; done

# 6. Packages, migrations, data. The running site keeps serving meanwhile.
say "Пакети, міграції, початкові дані"
# npm ci only when the lockfile or Node changed: it deletes node_modules, which the running services use.
LOCK_KEY="$(sha256sum package-lock.json | cut -d' ' -f1) $(node -v)"
if [ "$(cat node_modules/.vivcharyk-lock 2>/dev/null || true)" != "$LOCK_KEY" ]; then
  npm ci --no-audit --no-fund
  printf '%s\n' "$LOCK_KEY" > node_modules/.vivcharyk-lock
fi
npx prisma generate >/dev/null
npx prisma migrate deploy
# Production seed: permissions, roles, categories, the Owner. No demo products.
# On the very first run it prints a ONE-TIME OWNER PASSWORD: write it down.
npx tsx --env-file=.env prisma/seed/index.ts
# Round 22 category tree (split «Подушки та постіль», drop the «Від партнерів» category); runs once, repeatable.
npx tsx --env-file=.env scripts/categories-round22.ts
# Product batches and production-stage videos (their files come in media/ with the code); repeatable.
for batch in scripts/data/products/*.json; do
  case "$batch" in *.media.json) continue ;; esac
  npx tsx --env-file=.env scripts/import-products.ts "$batch"
done
for batch in scripts/data/videos/*.json; do
  case "$batch" in *.media.json) continue ;; esac
  npx tsx --env-file=.env scripts/import-stage-videos.ts "$batch"
done

# 7. Build into fresh directories. Nothing the running site reads is touched until the switch below:
#    - admin:      vite builds straight into releases/admin-<ts>; the API serves apps/admin/dist,
#                  a symlink to releases/admin-current -> admin-<ts>.
#    - storefront: React Router builds into apps/storefront/build (no longer served from there), which
#                  is then copied with server.mjs into releases/web-<ts>; vivcharyk-web runs from
#                  releases/web-current -> web-<ts>. Node resolves packages from /opt/vivcharyk/node_modules.
say "Збираю сайт і панель (у нові теки, працюючий сайт не зачіпається)"
TS="$(date +%Y%m%d-%H%M%S)"
npm run -s build:tokens
npm run -s build -w @vivcharyk/admin -- --outDir "$REL/admin-$TS" --emptyOutDir
npm run -s build -w @vivcharyk/storefront
mkdir -p "$REL/web-$TS"
cp -a apps/storefront/build apps/storefront/server.mjs apps/storefront/package.json "$REL/web-$TS/"
[ -f "$REL/web-$TS/build/server/index.js" ] && [ -f "$REL/admin-$TS/index.html" ] || die "Збірка неповна — працюючий сайт не змінено."
chown -R vivcharyk:vivcharyk "$APP"

# Atomic switch: a new symlink is renamed over the old one, so readers see either the old or the new
# build, never a half-written one.
switch_link() { ln -sfn "$1" "$2.new"; mv -Tf "$2.new" "$2"; }
# One-time: apps/admin/dist used to be a real directory.
if [ -d apps/admin/dist ] && [ ! -L apps/admin/dist ]; then rm -rf apps/admin/dist; fi
[ -L apps/admin/dist ] || ln -sfn "$REL/admin-current" apps/admin/dist
# First install: point the links somewhere before the services start.
[ -e "$REL/admin-current" ] || switch_link "admin-$TS" "$REL/admin-current"
[ -e "$REL/web-current" ] || switch_link "web-$TS" "$REL/web-current"

# 8. Services
cat > /etc/systemd/system/vivcharyk-api.service <<EOF
[Unit]
Description=Вівчарик API, background jobs and admin panel
After=network-online.target docker.service
Wants=network-online.target

[Service]
User=vivcharyk
WorkingDirectory=$APP/apps/api
EnvironmentFile=$APP/.env
ExecStart=$APP/node_modules/.bin/tsx src/server.ts
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/vivcharyk-web.service <<EOF
[Unit]
Description=Вівчарик storefront
After=network-online.target vivcharyk-api.service

[Service]
User=vivcharyk
# A symlink to the current release, resolved when the service starts.
WorkingDirectory=$REL/web-current
EnvironmentFile=$APP/.env
ExecStart=$NODE server.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable vivcharyk-api vivcharyk-web >/dev/null

# One after another, each waits until healthy; Caddy retries requests meanwhile (lb_try_duration).
wait_ok() { for _ in $(seq 1 90); do curl -sf -o /dev/null "$1" && return 0; sleep 1; done; return 1; }
say "Перезапускаю API"
systemctl restart vivcharyk-api
wait_ok http://127.0.0.1:3000/api/v1/health || die "API не запустився. Подивіться: journalctl -u vivcharyk-api -n 100"
switch_link "admin-$TS" "$REL/admin-current"
say "Перезапускаю вітрину"
switch_link "web-$TS" "$REL/web-current"
systemctl restart vivcharyk-web
wait_ok http://127.0.0.1:3001/uk/ || die "Вітрина не запустилася. Подивіться: journalctl -u vivcharyk-web -n 100"

# Keep the 3 newest releases of each kind (the current one always stays).
for kind in admin web; do
  cur="$(readlink -f "$REL/$kind-current")"
  find "$REL" -maxdepth 1 -name "$kind-2*" -type d | sort -r | tail -n +4 | while read -r d; do
    [ "$(readlink -f "$d")" = "$cur" ] || rm -rf "$d"
  done
done

# 9. HTTPS in front (Caddy gets and renews the certificate by itself). /etc/caddy is mounted as a
#    directory so that files replaced by rename (Caddyfile, site-lock snippet) are seen by the
#    container; config changes are applied with `caddy reload` (no restart, no dropped requests).
say "Caddy (HTTPS)"
install -d -m 755 /etc/caddy
install -m 755 -o root -g root "$HERE/unlock-site.sh" /usr/local/sbin/vivcharyk-unlock-site
# Site lock (D13): a fresh server starts locked; on the first run this prints the password once.
# The message is kept in memory and repeated at the end, where it is not lost in the build output.
LOCK_MSG="$(/usr/local/sbin/vivcharyk-unlock-site --apply)"
[ -z "$LOCK_MSG" ] || printf '%s\n' "$LOCK_MSG"
sed "s/__DOMAIN__/$DOMAIN/g" "$HERE/Caddyfile" > /etc/caddy/Caddyfile.new
docker pull -q caddy:2 >/dev/null || warn "Не вдалося оновити образ caddy:2 — працюю з наявним."
docker run --rm -v /etc/caddy:/etc/caddy:ro caddy:2 caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile >/dev/null 2>&1 \
  || die "Caddyfile з помилкою — Caddy працює зі старими налаштуваннями. Перевірте: docker run --rm -v /etc/caddy:/etc/caddy:ro caddy:2 caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile"
mv -f /etc/caddy/Caddyfile.new /etc/caddy/Caddyfile
CADDY_IMAGE="$(docker image inspect -f '{{.Id}}' caddy:2)"
CADDY_RUNNING="$(docker inspect -f '{{.State.Running}} {{.Image}} {{index .Config.Labels "vivcharyk.caddy"}}' vivcharyk-caddy 2>/dev/null || true)"
if [ "$CADDY_RUNNING" = "true $CADDY_IMAGE 2" ]; then
  docker exec vivcharyk-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null
else
  # First run, an older container layout, or a newer Caddy image: (re)create (a second or two).
  docker rm -f vivcharyk-caddy >/dev/null 2>&1 || true
  docker run -d --name vivcharyk-caddy --restart unless-stopped --network host --label vivcharyk.caddy=2 \
    -v /etc/caddy:/etc/caddy:ro -v vivcharyk-caddy-data:/data -v vivcharyk-caddy-config:/config caddy:2 >/dev/null
fi

# 10. Firewall: SSH, HTTP, HTTPS only (IPv4 and IPv6)
ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

# 11. fail2ban for SSH: 5 failed logins in 10 minutes = a 1-hour ban for that IP. Debian 13 logs to
#     the journal only (no auth.log) and OpenSSH 10 logs failures from `sshd-session`.
cat > /etc/fail2ban/jail.d/vivcharyk.local <<'EOF'
[sshd]
enabled = true
backend = systemd
journalmatch = _SYSTEMD_UNIT=ssh.service + _SYSTEMD_UNIT=sshd.service + _COMM=sshd + _COMM=sshd-session
maxretry = 5
findtime = 10m
bantime = 1h
EOF
fail2ban-client -t >/dev/null 2>&1 || warn "fail2ban: перевірка налаштувань не пройшла — подивіться: fail2ban-client -t"
systemctl enable fail2ban >/dev/null
systemctl restart fail2ban

# 12. Automatic security updates (unattended-upgrades): Debian security repository only, daily,
#     no automatic reboot. Other updates stay manual (apt upgrade) so nothing changes unexpectedly.
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
cat > /etc/apt/apt.conf.d/52vivcharyk-unattended-upgrades <<'EOF'
// Вівчарик: security updates only (replaces the list from 50unattended-upgrades).
#clear Unattended-Upgrade::Origins-Pattern;
Unattended-Upgrade::Origins-Pattern {
	"origin=Debian,codename=${distro_codename}-security,label=Debian-Security";
	"origin=Debian,codename=${distro_codename},label=Debian-Security";
};
Unattended-Upgrade::Automatic-Reboot "false";
EOF
systemctl enable --now unattended-upgrades >/dev/null 2>&1 || true

# 13. Backups in /var/backups/vivcharyk (D18–D20): database daily (14 days), media + mail weekly
#     (newest 4). Readable by the group vivcharyk-backup, which the SSH user who runs this script
#     (sudo) joins, so deploy/pull-backups.sh needs no root on the server.
getent group vivcharyk-backup >/dev/null || groupadd --system vivcharyk-backup
if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != root ]; then usermod -aG vivcharyk-backup "$SUDO_USER"; fi
install -d -m 2750 -o root -g vivcharyk-backup /var/backups/vivcharyk
find /var/backups/vivcharyk -maxdepth 1 -type f -exec chgrp vivcharyk-backup {} + -exec chmod 640 {} +
install -m 755 -o root -g root "$HERE/server-backup.sh" /usr/local/sbin/vivcharyk-backup
rm -f /etc/cron.daily/vivcharyk-backup   # the older cron job; systemd timers need no cron package
cat > /etc/systemd/system/vivcharyk-backup@.service <<'EOF'
[Unit]
Description=Вівчарик backup (%i)
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/vivcharyk-backup %i
Nice=10
IOSchedulingClass=idle
EOF
cat > /etc/systemd/system/vivcharyk-backup-db.timer <<'EOF'
[Unit]
Description=Вівчарик: daily database backup

[Timer]
OnCalendar=*-*-* 03:15
RandomizedDelaySec=10m
Persistent=true
Unit=vivcharyk-backup@db.service

[Install]
WantedBy=timers.target
EOF
cat > /etc/systemd/system/vivcharyk-backup-files.timer <<'EOF'
[Unit]
Description=Вівчарик: weekly media and mail backup

[Timer]
OnCalendar=Sun *-*-* 03:45
RandomizedDelaySec=10m
Persistent=true
Unit=vivcharyk-backup@files.service

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now vivcharyk-backup-db.timer vivcharyk-backup-files.timer >/dev/null

say "Готово"
printf '  Сайт:   https://%s/uk/\n  Панель: https://%s/admin/\n' "$DOMAIN" "$DOMAIN"
printf '  Сертифікат HTTPS з'"'"'явиться за хвилину, коли домен уже вказує на IP цього сервера (A/AAAA-записи).\n'
printf '  Логи:   journalctl -u vivcharyk-api -f   |   journalctl -u vivcharyk-web -f\n'
printf '  Відкрити сайт для всіх (запуск):  sudo vivcharyk-unlock-site   |   закрити знову: sudo vivcharyk-unlock-site --lock\n'
printf '  Копії:  /var/backups/vivcharyk   (зараз зробити копію бази: sudo systemctl start vivcharyk-backup@db)\n'
if [ -n "$LOCK_MSG" ]; then printf '%s\n' "$LOCK_MSG"; else /usr/local/sbin/vivcharyk-unlock-site --status; fi
