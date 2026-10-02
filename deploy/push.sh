#!/usr/bin/env bash
# From your own computer: upload the code to the VPS and install or update the site there.
#   ./deploy/push.sh debian@57.131.198.10            (domain defaults to vivcharuk.com)
#   ./deploy/push.sh root@203.0.113.10 vivcharuk.com
# Works with root or with a sudo user (OVH Debian: `debian`). The code goes to ~/vivcharyk-src of the
# SSH user (no root needed), then install.sh copies it into /opt/vivcharyk as root and builds.
# One SSH connection is opened and reused for every step (ControlMaster), so an SSH password is
# typed once; sudo may ask for that user's password once more if it is not passwordless.
# The server's .env, database, certificates, uploaded photos and mail are never overwritten.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")/.."
TARGET="${1:?Вкажіть сервер: ./deploy/push.sh debian@57.131.198.10 [vivcharuk.com]}"
DOMAIN="${2:-vivcharuk.com}"
command -v rsync >/dev/null || { echo "Немає rsync: sudo apt install -y rsync"; exit 1; }

# The control socket lives in a private temporary directory; the master connection is closed at the end.
CTL_DIR="$(mktemp -d /tmp/vivcharyk-ssh.XXXXXX)"
SSH_OPTS="-o ControlMaster=auto -o ControlPath=$CTL_DIR/%C -o ControlPersist=10m -o ServerAliveInterval=30"
# shellcheck disable=SC2086
cleanup() { ssh $SSH_OPTS -O exit "$TARGET" >/dev/null 2>&1 || true; rm -rf "$CTL_DIR"; }
trap cleanup EXIT

# Remote side: `sudo` unless already root.
ROOT='S=; [ "$(id -u)" = 0 ] || S=sudo;'

echo "Підключаюся до $TARGET (пароль SSH, якщо спитає, вводиться один раз)…"
# shellcheck disable=SC2086
ssh -t $SSH_OPTS "$TARGET" "$ROOT"' command -v rsync >/dev/null || { $S apt-get update -qq && $S apt-get install -y -qq rsync; } >/dev/null; mkdir -p "$HOME/vivcharyk-src"'

echo "Завантажую код…"
rsync -az --delete -e "ssh $SSH_OPTS" \
  --exclude node_modules --exclude '.env' --exclude '.env.local' --exclude '.git' --exclude '.claude' \
  --exclude 'apps/*/build' --exclude dist --exclude '.react-router' --exclude coverage \
  --exclude 'shkuri.tar.gz' --exclude '*.tsbuildinfo' --exclude 'mail-store' --exclude 'mail-outbox' \
  ./ "$TARGET:vivcharyk-src/"

# shellcheck disable=SC2086
ssh -t $SSH_OPTS "$TARGET" "$ROOT"' $S bash "$HOME/vivcharyk-src/deploy/install.sh" '"'$DOMAIN'"' "$HOME/vivcharyk-src"'
