#!/usr/bin/env bash
# Вівчарик — the whole site locally with one command (Kali / Debian / Ubuntu):
#   ./start.sh
# First run: creates .env with fresh random secrets, the Postgres container, installs packages,
# migrates and seeds the database (with demo products). Every run: starts the API (which also
# serves the admin panel) and the storefront. Ctrl+C stops everything; the database keeps its data.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }
has()  { command -v "$1" >/dev/null 2>&1; }

DB_CONTAINER="${VK_DB_CONTAINER:-vivcharyk-db}"

# 1. Tools
has node || die "Немає Node.js (потрібна версія 22 або новіша). Встановіть: sudo apt install -y nodejs npm — і перевірте: node -v"
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ] || die "Node.js $(node -v) застарий, потрібна 22+. Найпростіше через nvm: https://github.com/nvm-sh/nvm, потім: nvm install 22"
has npm || die "Немає npm. Встановіть: sudo apt install -y npm"
has docker || die "Немає Docker. Встановіть: sudo apt install -y docker.io && sudo systemctl enable --now docker && sudo usermod -aG docker \$USER — потім вийдіть із сеансу й увійдіть знову"
has pgrep || die "Немає pgrep. Встановіть: sudo apt install -y procps"
docker info >/dev/null 2>&1 || die "Docker не запущений або немає прав. Спробуйте: sudo systemctl start docker; якщо «permission denied» — sudo usermod -aG docker \$USER і перезайдіть у сеанс"

for port in 3000 5173; do
  if (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then die "Порт $port уже зайнятий — сайт, мабуть, уже запущений в іншому терміналі. Зупиніть його (Ctrl+C там) і спробуйте ще раз."; fi
done

# 2. .env with fresh secrets (only when it does not exist yet)
if [ ! -f .env ]; then
  say "Створюю .env з новими випадковими секретами"
  node -e '
    const fs = require("fs"), c = require("crypto");
    const db = c.randomBytes(12).toString("hex");
    const out = fs.readFileSync(".env.example", "utf8")
      .replaceAll("__DB_PASSWORD__", db)
      .replace(/__HEX32__/g, () => c.randomBytes(32).toString("hex"))
      .replace(/__B64KEY__/g, () => c.randomBytes(32).toString("base64"));
    fs.writeFileSync(".env", out, { mode: 0o600 });'
fi

# 3. Database (Postgres 16 in Docker; credentials and port come from DATABASE_URL in .env)
DB_URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2-)"
[ -n "$DB_URL" ] || die "У .env немає DATABASE_URL"
read -r DB_USER DB_PASS DB_NAME DB_PORT < <(node -e 'const u = new URL(process.argv[1]); console.log(decodeURIComponent(u.username), decodeURIComponent(u.password), u.pathname.slice(1), u.port || 5432)' "$DB_URL")
if docker container inspect "$DB_CONTAINER" >/dev/null 2>&1; then
  say "Запускаю базу даних ($DB_CONTAINER)"
  docker start "$DB_CONTAINER" >/dev/null
else
  say "Створюю базу даних ($DB_CONTAINER, порт $DB_PORT)"
  docker run -d --name "$DB_CONTAINER" --restart unless-stopped \
    -e POSTGRES_USER="$DB_USER" -e POSTGRES_PASSWORD="$DB_PASS" -e POSTGRES_DB="$DB_NAME" \
    -p "127.0.0.1:$DB_PORT:5432" -v "$DB_CONTAINER-data:/var/lib/postgresql/data" postgres:16-alpine >/dev/null
fi
# Over TCP: a fresh container first runs a temporary socket-only server for its init scripts, then restarts.
ready() { docker exec "$DB_CONTAINER" pg_isready -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; }
for _ in $(seq 1 60); do ready && break; sleep 1; done
ready || die "База даних не відповідає. Подивіться: docker logs $DB_CONTAINER"

# 4. Packages, schema, data, assets
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  say "Встановлюю пакети (перший раз кілька хвилин)"
  npm ci --no-audit --no-fund
fi
say "Готую базу: Prisma, міграції, початкові й демо-дані"
npx prisma generate >/dev/null
npx prisma migrate deploy
# Idempotent; prints a one-time Owner password only when the database has no Owner yet.
SEED_DEMO=1 npx tsx --env-file=.env prisma/seed/index.ts
say "Збираю токени дизайну й панель керування"
npm run -s build:tokens >/dev/null
npm run -s build -w @vivcharyk/admin >/dev/null

# 5. Run API (+ admin panel) and storefront; Ctrl+C stops both
say "Запускаю сайт"
# Stop the whole process tree started here (npm -> sh -> node), however the script is stopped.
stop_tree() { local c; for c in $(pgrep -P "$1"); do stop_tree "$c"; done; kill "$1" 2>/dev/null || true; }
stop_all() { trap - EXIT INT TERM; local c; for c in $(pgrep -P $$); do stop_tree "$c"; done; exit 0; }
trap stop_all EXIT INT TERM
npm run -s dev:api 2>&1 | sed -u 's/^/[api] /' &
npm run -s dev -w @vivcharyk/storefront -- --host 127.0.0.1 2>&1 | sed -u 's/^/[сайт] /' &

up=0
for _ in $(seq 1 90); do
  if node -e 'Promise.all(["http://127.0.0.1:3000/api/v1/health","http://127.0.0.1:5173/uk/"].map(u=>fetch(u).then(r=>{if(!r.ok)throw 0}))).then(()=>process.exit(0),()=>process.exit(1))' 2>/dev/null; then up=1; break; fi
  sleep 1
done
if [ "$up" = 1 ]; then
  printf '\n\033[1;32m%s\033[0m\n' "Сайт працює:"
  printf '  Вітрина:          http://127.0.0.1:5173/uk/\n'
  printf '  Панель керування: http://127.0.0.1:3000/admin/\n'
  printf '  Зупинити:         Ctrl+C\n\n'
else
  warn "Сайт ще не відповідає — подивіться повідомлення [api] і [сайт] вище."
fi
wait
