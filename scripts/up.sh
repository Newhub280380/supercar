#!/usr/bin/env bash
# Одна команда: локальный Postgres, схема, владелец, dev-сервер.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v psql >/dev/null 2>&1; then
  echo "PostgreSQL не найден, ставлю пакет…"
  sudo apt-get update
  sudo apt-get install -y postgresql postgresql-contrib
fi

if command -v service >/dev/null 2>&1; then
  sudo service postgresql start || true
fi

ready=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if sudo -u postgres pg_isready -q; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "Postgres не поднялся. Проверьте service postgresql status." >&2
  exit 1
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supercar') THEN
    CREATE USER supercar WITH PASSWORD 'supercar' SUPERUSER;
  END IF;
END
$$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='cosmetology_db'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE cosmetology_db OWNER supercar;"
fi

if [ ! -f .env.local ]; then
  jwt="$(openssl rand -hex 32)"
  cat > .env.local <<EOF
DATABASE_URL=postgresql://supercar:supercar@localhost:5432/cosmetology_db
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Zishel CRM"
JWT_SECRET=${jwt}
LOG_LEVEL=info
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
EMAIL_FROM=noreply@localhost
EMAIL_FROM_NAME="Zishel CRM"
WAZZUP_WEBHOOK_TOKEN=
LEADS_INGEST_TOKEN=
DEMO_EMAIL=owner@zishel.kz
DEMO_PASSWORD=Owner12345!
EOF
  echo "Создан .env.local (пароль владельца Owner12345!, почта owner@zishel.kz)"
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

npx drizzle-kit push --force
npx tsx src/db/ensure-owner.ts

echo "CRM: http://localhost:3000/auth/login"
echo "Вход: ${DEMO_EMAIL:-owner@zishel.kz}"
exec npm run dev
