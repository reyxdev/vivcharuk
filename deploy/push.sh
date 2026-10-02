#!/usr/bin/env bash
# From your own computer: upload the code to the VPS and install or update the site there.
#   ./deploy/push.sh root@203.0.113.10 vivcharuk.com
# Uses your SSH access (a key is best; a password is typed into ssh itself, never here).
# The server's .env, database and certificates are never overwritten.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")/.."
TARGET="${1:?Вкажіть сервер: ./deploy/push.sh root@IP домен}"
DOMAIN="${2:?Вкажіть домен: ./deploy/push.sh root@IP vivcharuk.com}"
command -v rsync >/dev/null || { echo "Немає rsync: sudo apt install -y rsync"; exit 1; }

ssh "$TARGET" 'command -v rsync >/dev/null || (apt-get update -y && apt-get install -y rsync) >/dev/null; mkdir -p /opt/vivcharyk'
rsync -az --delete \
  --exclude node_modules --exclude '.env' --exclude '.env.local' --exclude '.git' \
  --exclude 'apps/*/build' --exclude 'apps/admin/dist' --exclude 'packages/tokens/dist' --exclude '.react-router' \
  --exclude 'shkuri.tar.gz' --exclude '*.tsbuildinfo' --exclude 'mail-store' --exclude 'mail-outbox' \
  ./ "$TARGET:/opt/vivcharyk/"
ssh -t "$TARGET" "bash /opt/vivcharyk/deploy/install.sh '$DOMAIN'"
