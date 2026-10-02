#!/usr/bin/env bash
# Вівчарик on a fresh VPS (Ubuntu 22.04/24.04 or Debian 12), run as root from the uploaded code:
#   bash /opt/vivcharyk/deploy/install.sh vivcharuk.com
# Safe to run again: it is also the update step (migrations, build, restart). Installs Docker,
# Node.js 22, Postgres 16 (Docker, local only), Caddy (Docker, automatic HTTPS), two systemd
# services, a firewall and a daily database backup. Card payments and the test tariffs stay off.
set -euo pipefail
DOMAIN="${1:?Вкажіть домен: bash deploy/install.sh vivcharuk.com}"
APP=/opt/vivcharyk
cd "$APP"
say() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "Запустіть від root: sudo bash $APP/deploy/install.sh $DOMAIN"

# 1. System packages
if ! command -v docker >/dev/null || ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -lt 22 ]; then
  say "Встановлюю Docker і Node.js 22"
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg rsync ufw docker.io
  systemctl enable --now docker
  # Node.js 22 from NodeSource's official repository (the distro's own Node is too old).
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# ImageMagick converts photos uploaded from iPhone Safari to WebP (round 20 product wizard).
command -v magick >/dev/null || command -v convert >/dev/null || apt-get install -y imagemagick

# 2. A system user that runs the site
id vivcharyk >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin vivcharyk

# 3. Production .env with fresh secrets (once; never overwritten)
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

# 4. Database: Postgres 16, reachable only from this machine
if ! docker container inspect vivcharyk-db >/dev/null 2>&1; then
  say "Створюю базу даних"
  docker run -d --name vivcharyk-db --restart unless-stopped \
    -e POSTGRES_USER="$DB_USER" -e POSTGRES_PASSWORD="$DB_PASS" -e POSTGRES_DB="$DB_NAME" \
    -p 127.0.0.1:5434:5432 -v vivcharyk-db-data:/var/lib/postgresql/data postgres:16-alpine >/dev/null
fi
docker start vivcharyk-db >/dev/null
for _ in $(seq 1 60); do docker exec vivcharyk-db pg_isready -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1 && break; sleep 1; done

# 5. Build
say "Пакети, міграції, початкові дані, збірка"
npm ci --no-audit --no-fund
npx prisma generate >/dev/null
npx prisma migrate deploy
# Production seed: permissions, roles, categories, the Owner. No demo products.
# On the very first run it prints a ONE-TIME OWNER PASSWORD: write it down.
npx tsx --env-file=.env prisma/seed/index.ts
# Product batches and production-stage videos (their files come in media/ with the code); repeatable.
for batch in scripts/data/products/*.json; do
  case "$batch" in *.media.json) continue ;; esac
  npx tsx --env-file=.env scripts/import-products.ts "$batch"
done
for batch in scripts/data/videos/*.json; do
  case "$batch" in *.media.json) continue ;; esac
  npx tsx --env-file=.env scripts/import-stage-videos.ts "$batch"
done
npm run -s build:tokens
npm run -s build -w @vivcharyk/admin
npm run -s build -w @vivcharyk/storefront
chown -R vivcharyk:vivcharyk "$APP"

# 6. Services
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
WorkingDirectory=$APP/apps/storefront
EnvironmentFile=$APP/.env
ExecStart=/usr/bin/node server.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable vivcharyk-api vivcharyk-web >/dev/null
systemctl restart vivcharyk-api vivcharyk-web

# 7. HTTPS in front (Caddy gets and renews the certificate by itself)
mkdir -p /etc/caddy
sed "s/__DOMAIN__/$DOMAIN/g" "$APP/deploy/Caddyfile" > /etc/caddy/Caddyfile
if docker container inspect vivcharyk-caddy >/dev/null 2>&1; then
  docker restart vivcharyk-caddy >/dev/null
else
  docker run -d --name vivcharyk-caddy --restart unless-stopped --network host \
    -v /etc/caddy/Caddyfile:/etc/caddy/Caddyfile:ro -v vivcharyk-caddy-data:/data -v vivcharyk-caddy-config:/config caddy:2 >/dev/null
fi

# 8. Firewall: SSH, HTTP, HTTPS only
ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

# 9. Daily database backup, kept 14 days, in /var/backups/vivcharyk
mkdir -p /var/backups/vivcharyk; chmod 700 /var/backups/vivcharyk
cat > /etc/cron.daily/vivcharyk-backup <<EOF
#!/bin/sh
docker exec vivcharyk-db pg_dump -U $DB_USER $DB_NAME | gzip > /var/backups/vivcharyk/db-\$(date +%F).sql.gz
find /var/backups/vivcharyk -name 'db-*.sql.gz' -mtime +14 -delete
EOF
chmod 700 /etc/cron.daily/vivcharyk-backup

say "Готово"
for _ in $(seq 1 30); do curl -sf http://127.0.0.1:3000/api/v1/health >/dev/null && curl -sf http://127.0.0.1:3001/uk/ >/dev/null && break; sleep 2; done
printf '  Сайт:   https://%s/uk/\n  Панель: https://%s/admin/\n' "$DOMAIN" "$DOMAIN"
printf '  Сертифікат HTTPS з'"'"'явиться за хвилину, коли домен уже вказує на IP цього сервера (A-запис).\n'
printf '  Логи:   journalctl -u vivcharyk-api -f   |   journalctl -u vivcharyk-web -f\n'
