#!/usr/bin/env bash
# On the developer's computer: copy the server's backups (/var/backups/vivcharyk) to ~/vivcharyk-backups.
#   ./deploy/pull-backups.sh debian@57.131.198.10
#   ./deploy/pull-backups.sh --print-cron debian@57.131.198.10   print the daily crontab line
# No sudo on the server: the backups are readable by the group vivcharyk-backup, which install.sh puts
# the SSH user in. Copies are only added here, never deleted because they vanished on the server
# (a broken or hacked server must not be able to wipe this copy); old local copies are pruned by
# their own rule below (database dumps older than 90 days, all but the newest 8 media archives).
# From cron it needs an SSH key (ssh-copy-id), because nobody is there to type a password.
set -euo pipefail
SELF="$(readlink -f "$0")"
DEST="$HOME/vivcharyk-backups"

if [ "${1:-}" = --print-cron ]; then
  TARGET="${2:?Вкажіть сервер: $0 --print-cron debian@57.131.198.10}"
  echo "# Щодня о 13:00 (додайте рядок через: crontab -e). Спершу один раз: ssh-copy-id $TARGET і запуск вручну."
  printf '0 13 * * * "%s" %s >> "$HOME/vivcharyk-backups/pull.log" 2>&1\n' "$SELF" "$TARGET"
  exit 0
fi
TARGET="${1:?Вкажіть сервер: $0 debian@57.131.198.10}"
command -v rsync >/dev/null || { echo "Немає rsync: sudo apt install -y rsync" >&2; exit 1; }
mkdir -p "$DEST"; chmod 700 "$DEST"

# Without a terminal (cron) never wait for a password prompt: fail at once instead.
SSH="ssh -o ConnectTimeout=20"
[ -t 0 ] || SSH="$SSH -o BatchMode=yes"

echo "$(date '+%F %T') Забираю копії з $TARGET"
# Dot files are the server's unfinished temporary files.
rsync -a --chmod=D700,F600 --exclude '.*' -e "$SSH" "$TARGET:/var/backups/vivcharyk/" "$DEST/"

find "$DEST" -maxdepth 1 -name 'db-*.sql.gz' -mtime +90 -delete
find "$DEST" -maxdepth 1 -name 'files-*.tar.gz' -printf '%T@ %p\n' | sort -rn | tail -n +9 | cut -d' ' -f2- | xargs -r -d '\n' rm -f

newest="$(find "$DEST" -maxdepth 1 -name 'db-*.sql.gz' -printf '%f\n' | sort | tail -1)"
echo "Готово: $DEST (найновіша копія бази: ${newest:-немає})"
