#!/usr/bin/env bash
# On the developer's computer, every 5 minutes from cron (D22): is the site up?
#   ./deploy/uptime-check.sh https://vivcharuk.com
#   ./deploy/uptime-check.sh --print-cron https://vivcharuk.com    print the crontab line
# Checks the API (/api/v1/health = 200) and the storefront (/uk/ = 200, or 401 while the site is locked
# with a password). Sends a Telegram message when the site goes down and once when it is back; no
# repeats while it stays down (state in ~/.cache/vivcharyk-uptime). Bot token and chat id come from
# the repo's local .env (TELEGRAM_BOT_TOKEN, DEV_TELEGRAM_CHAT_ID) and are never printed.
set -euo pipefail
SELF="$(readlink -f "$0")"
ENV_FILE="$(dirname "$SELF")/../.env"
STATE_DIR="$HOME/.cache/vivcharyk-uptime"

if [ "${1:-}" = --print-cron ]; then
  URL="${2:?Вкажіть адресу: $0 --print-cron https://vivcharuk.com}"
  echo "# Кожні 5 хвилин (додайте рядок через: crontab -e)"
  printf '*/5 * * * * "%s" %s >> "$HOME/.cache/vivcharyk-uptime/log" 2>&1\n' "$SELF" "$URL"
  exit 0
fi
URL="${1:?Вкажіть адресу: $0 https://vivcharuk.com}"; URL="${URL%/}"
mkdir -p "$STATE_DIR"

env_get() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/' || true; }
TOKEN="$(env_get TELEGRAM_BOT_TOKEN)"
CHAT="$(env_get DEV_TELEGRAM_CHAT_ID)"
[ -n "$TOKEN" ] || { echo "У .env немає TELEGRAM_BOT_TOKEN." >&2; exit 1; }
[ -n "$CHAT" ] || { echo "У .env немає DEV_TELEGRAM_CHAT_ID: напишіть боту будь-що, відкрийте https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates і впишіть у .env число з \"chat\":{\"id\":…}." >&2; exit 1; }

code() { curl -s -o /dev/null -m 20 -w '%{http_code}' "$1" || true; }
probe() {
  local api web
  api="$(code "$URL/api/v1/health")"; web="$(code "$URL/uk/")"
  if [ "$api" = 200 ] && { [ "$web" = 200 ] || [ "$web" = 401 ]; }; then return 0; fi
  DETAIL="API $api, вітрина $web"; return 1
}
# The token goes to curl through stdin, so it never shows in the process list.
send() {
  printf 'url = "https://api.telegram.org/bot%s/sendMessage"\n' "$TOKEN" \
    | curl -s -f -m 20 -o /dev/null -K - --data-urlencode "chat_id=$CHAT" --data-urlencode "text=$1"
}

DETAIL=""
now=up
# A single failed probe could be a blip: check again after 20 s before calling it down.
if ! probe; then sleep 20; probe || now=down; fi
before="$(cat "$STATE_DIR/state" 2>/dev/null || echo up)"
if [ "$now" != "$before" ]; then
  if [ "$now" = down ]; then msg="Вівчарик НЕДОСТУПНИЙ: $URL ($DETAIL)"; else msg="Вівчарик знову працює: $URL"; fi
  # State changes only after the message went out, so a failed send is retried next run.
  if send "$msg"; then echo "$now" > "$STATE_DIR/state"; else echo "Не вдалося надіслати повідомлення в Telegram." >&2; fi
fi
echo "$(date '+%F %T') $now${DETAIL:+ ($DETAIL)}"
