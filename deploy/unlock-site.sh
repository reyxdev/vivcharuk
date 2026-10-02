#!/usr/bin/env bash
# Site lock before launch (D13), on the server, as root. install.sh copies this script to
# /usr/local/sbin/vivcharyk-unlock-site (root-owned, so the site's own user cannot change it).
#   sudo vivcharyk-unlock-site                 open the site to everyone (launch)
#   sudo vivcharyk-unlock-site --lock          lock again with the stored password (a new one if none)
#   sudo vivcharyk-unlock-site --new-password  lock with a fresh password (printed once)
#   sudo vivcharyk-unlock-site --status        locked or open
#   vivcharyk-unlock-site --apply              used by install.sh: write the Caddy snippet for the
#                                              current state, no reload; a fresh server starts locked
# Locked = Caddy basic auth + "X-Robots-Tag: noindex" on the storefront only; /api, /admin and /media
# stay open (the panel has its own login, the site's pages call /api). Only the bcrypt hash of the
# password is stored; the password itself is printed once and never written anywhere.
set -euo pipefail
STATE=/etc/vivcharyk
HASH_FILE=$STATE/site-lock.hash   # bcrypt hash only
OPEN_FLAG=$STATE/site-unlocked    # present = open; absent = locked (the default until launch)
SNIPPET=/etc/caddy/site-lock.caddy
LOGIN=vivcharuk
CADDY=vivcharyk-caddy
die() { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "Запустіть від root: sudo $0 ${1:-}"
mkdir -p "$STATE" /etc/caddy; chmod 700 "$STATE"

new_password() {
  local pw hash
  # 16 letters/digits; read from a file, so no SIGPIPE under pipefail.
  pw="$(head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | cut -c1-16)"
  # Hash inside the Caddy image; the password goes through stdin, not the command line (ps).
  hash="$(printf '%s\n' "$pw" | docker run --rm -i caddy:2 caddy hash-password)" || die "Не вдалося запустити caddy hash-password (Docker працює?)."
  case "$hash" in '$2'*) ;; *) die "Не вдалося отримати хеш пароля від Caddy." ;; esac
  (umask 077; printf '%s\n' "$hash" > "$HASH_FILE")
  printf '\n\033[1;33m%s\033[0m\n' "Сайт закрито паролем. Збережіть його — він показується ЛИШЕ ЗАРАЗ:"
  printf '  Логін:  %s\n  Пароль: %s\n\n' "$LOGIN" "$pw"
}

write_snippet() {
  local tmp="$SNIPPET.tmp"
  if [ -f "$OPEN_FLAG" ]; then
    # A harmless directive, so the import is never empty.
    printf '# Site is open (vivcharyk-unlock-site).\nvars site_locked 0\n' > "$tmp"
  else
    [ -s "$HASH_FILE" ] || new_password
    printf '# Site is locked until launch (vivcharyk-unlock-site).\nheader X-Robots-Tag "noindex, nofollow"\nbasic_auth {\n\t%s %s\n}\n' \
      "$LOGIN" "$(cat "$HASH_FILE")" > "$tmp"
  fi
  chmod 640 "$tmp"; mv -f "$tmp" "$SNIPPET"
}

reload_caddy() {
  if [ "$(docker inspect -f '{{.State.Running}}' "$CADDY" 2>/dev/null || true)" = true ]; then
    docker exec "$CADDY" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null
  else
    printf '%s\n' "Caddy не запущений — зміна застосується під час наступного install.sh."
  fi
}

case "${1:-}" in
  "")             touch "$OPEN_FLAG"; write_snippet; reload_caddy; echo "Сайт відкрито для всіх." ;;
  --lock)         rm -f "$OPEN_FLAG"; write_snippet; reload_caddy; echo "Сайт закрито паролем (логін $LOGIN)." ;;
  --new-password) rm -f "$OPEN_FLAG" "$HASH_FILE"; write_snippet; reload_caddy ;;
  --status)       if [ -f "$OPEN_FLAG" ]; then echo "Сайт відкритий."; else echo "Сайт закритий паролем (логін $LOGIN)."; fi ;;
  --apply)        write_snippet ;;
  *)              die "Невідомий параметр: $1 (можна: --lock, --new-password, --status)" ;;
esac
