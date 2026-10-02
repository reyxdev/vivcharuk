#!/usr/bin/env bash
# Backups on the server (D18–D20), run as root by systemd timers that install.sh sets up.
# install.sh copies this script to /usr/local/sbin/vivcharyk-backup (root-owned).
#   vivcharyk-backup db      daily:  database dump db-YYYY-MM-DD.sql.gz, kept 14 days
#   vivcharyk-backup files   weekly: media + mail-store files-YYYY-MM-DD.tar.gz, newest 4 kept
# Files land in /var/backups/vivcharyk: group vivcharyk-backup (setgid dir), mode 640, so the SSH
# user that is in that group can pull them with deploy/pull-backups.sh without sudo.
set -euo pipefail
DIR=/var/backups/vivcharyk
APP=/opt/vivcharyk
umask 027
cd "$DIR"
day="$(date +%F)"

case "${1:-}" in
  db)
    # Credentials come from the container's own POSTGRES_USER / POSTGRES_DB. No owners or grants
    # in the dump, so it restores into any database (a new server, the local restore drill).
    docker exec vivcharyk-db sh -c 'pg_dump --no-owner --no-acl -U "$POSTGRES_USER" "$POSTGRES_DB"' > .db.sql.tmp
    gzip -c .db.sql.tmp > .db.sql.gz.tmp
    mv -f .db.sql.gz.tmp "db-$day.sql.gz"
    rm -f .db.sql.tmp
    find "$DIR" -maxdepth 1 -name 'db-*.sql.gz' -mtime +14 -delete
    ;;
  files)
    # tar exits 1 when a file changed while being read (a photo uploaded meanwhile): still a usable archive.
    rc=0
    tar -C "$APP" --warning=no-file-changed -czf .files.tar.gz.tmp media mail-store || rc=$?
    [ "$rc" -le 1 ] || exit "$rc"
    mv -f .files.tar.gz.tmp "files-$day.tar.gz"
    # Keep the newest 4 weekly archives.
    find "$DIR" -maxdepth 1 -name 'files-*.tar.gz' -printf '%T@ %p\n' | sort -rn | tail -n +5 | cut -d' ' -f2- | xargs -r -d '\n' rm -f
    ;;
  *)
    echo "Використання: vivcharyk-backup db|files" >&2; exit 2 ;;
esac
