#!/usr/bin/env bash
# On the developer's computer: prove the newest backup restores (D18–D20).
#   ./deploy/restore-drill.sh                 newest ~/vivcharyk-backups/db-*.sql.gz
#   ./deploy/restore-drill.sh path/to/db.sql.gz
# Restores into a throwaway database in the local Postgres container that ./start.sh runs
# (vivcharyk-db, credentials from the repo's .env DATABASE_URL), prints row counts of key tables,
# and always drops the throwaway database. The local working database is not touched.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")/.."
die() { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }
C="${VK_DB_CONTAINER:-vivcharyk-db}"

DUMP="${1:-$(find "$HOME/vivcharyk-backups" -maxdepth 1 -name 'db-*.sql.gz' 2>/dev/null | sort | tail -1)}"
[ -n "$DUMP" ] && [ -f "$DUMP" ] || die "Немає копії бази. Спершу: ./deploy/pull-backups.sh debian@57.131.198.10"
[ "$(docker inspect -f '{{.State.Running}}' "$C" 2>/dev/null || true)" = true ] || die "Локальна база $C не запущена. Запустіть: docker start $C"
DB_URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2-)"
[ -n "$DB_URL" ] || die "У .env немає DATABASE_URL"
DB_USER="$(node -e 'console.log(decodeURIComponent(new URL(process.argv[1]).username))' "$DB_URL")"
DB_MAIN="$(node -e 'console.log(new URL(process.argv[1]).pathname.slice(1))' "$DB_URL")"
DRILL="restore_drill_$(date +%Y%m%d%H%M%S)"
# Inside the container over the local socket (trusted), so no password is needed or shown.
psql_() { docker exec -i "$C" psql -X -q -v ON_ERROR_STOP=1 -U "$DB_USER" "$@"; }

cleanup() { psql_ -d "$DB_MAIN" -c "DROP DATABASE IF EXISTS \"$DRILL\" WITH (FORCE)" >/dev/null 2>&1 || true; }
trap cleanup EXIT
echo "Відновлюю $(basename "$DUMP") у тимчасову базу $DRILL…"
psql_ -d "$DB_MAIN" -c "CREATE DATABASE \"$DRILL\"" >/dev/null
gunzip -c "$DUMP" | psql_ -d "$DRILL" >/dev/null
echo "Рядків у таблицях:"
psql_ -d "$DRILL" -A -F ' | ' -t -c '
  SELECT $$Order$$, count(*) FROM "Order" UNION ALL
  SELECT $$Product$$, count(*) FROM "Product" UNION ALL
  SELECT $$Customer$$, count(*) FROM "Customer" UNION ALL
  SELECT $$MailThread$$, count(*) FROM "MailThread"'
echo "Перевірка пройшла: копія відновлюється. Тимчасову базу видалено."
