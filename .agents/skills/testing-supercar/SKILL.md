---
name: testing-supercar
description: How to bring up the supercar (AI Cosmetology Platform) Next.js 16 app locally with Postgres and run end-to-end UI tests of auth, dashboard, exports, UTM and landing pages.
---

# Runtime testing setup for the supercar app

## Bring-up (from a clean box)

1. Postgres is usually NOT installed and there is no systemd unit. Install and start it manually:
   ```bash
   sudo apt-get install -y postgresql postgresql-contrib
   sudo service postgresql start
   sudo -u postgres psql -c "CREATE USER supercar WITH PASSWORD 'supercar' SUPERUSER;"
   sudo -u postgres psql -c "CREATE DATABASE cosmetology_db OWNER supercar;"
   ```
2. Create `.env.local` in the repo root:
   ```
   DATABASE_URL=postgresql://supercar:supercar@localhost:5432/cosmetology_db
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=test-secret-for-local-testing-1234567890
   NEXT_PUBLIC_APP_NAME="AI Cosmetology Platform"
   ```
3. `npm run db:push` / `npm run db:seed` do NOT read `.env.local` (drizzle/tsx). Export the var inline:
   ```bash
   export DATABASE_URL=postgresql://supercar:supercar@localhost:5432/cosmetology_db
   npm run db:push && npm run db:seed
   ```
4. `npm run dev` (port 3000). A Next.js 16 warning about `middleware.ts` being deprecated in favour of
   `proxy.ts` is expected and harmless.

## Getting a usable logged-in account

- Seeded users have placeholder password hashes (`hashed_password_admin`), so you cannot log in as them.
  Register a fresh user through `/auth/register` instead.
- New users default to a non-cosmetologist role; `/dashboard` needs `cosmetologist`. Promote via SQL:
  ```sql
  update users set role='cosmetologist' where email='<your test email>';
  ```
  then log out/in (or reload) so the session picks it up.
- `/api/auth/me` is the quickest session probe: JSON user when authenticated, `{"error":"Unauthorized"}`
  after logout. Protected prefixes are `/dashboard`, `/chat`, `/profile` (redirect to `/auth/login?redirect=...`).
- The sidebar logout button is the small icon at the bottom-left of the dashboard sidebar.

## Things worth knowing when testing features

- Locale is ru-RU throughout the dashboard (`src/lib/format.ts`); expect `₽15 268`, `₽340k`,
  `четверг, 20 августа 2026 г.`. Watch for `NaN` / `Invalid Date` / `undefined` as failure signals.
- Analytics exports (`/dashboard/analytics`) write into `~/Downloads`; the CSV starts with a UTF-8 BOM
  (`efbbbf`) and Russian section headers.
- SEO page downloads hit `/api/seo/sitemap` and `/api/robots.txt`. To exercise the failure banner
  ("Не удалось скачать ..."), temporarily add an env-gated 500 in the route and restart the dev server
  with that env set; Chrome may serve a cached 200, so clear cached files (keep cookies) before retrying.
  Revert the temporary edit afterwards (`git checkout <route>`).
- UTM page (`/dashboard/promotion/utm`): the "Создать UTM" dialog submits to `POST /api/utm` (this was a
  no-op in older revisions — check git history before calling either behaviour a regression). The submit
  button is disabled until campaign name + source + medium + landing URL are all filled. `landingUrl` must
  be a relative path (`/pricing`); an absolute URL returns 400 `landingUrl must be a relative path
  starting with /`, which the dialog renders in red while keeping the entered values. The created campaign
  is only prepended to client-side state (mock data source), so it disappears on reload — that is expected.
- The campaign list card's copy button copies `generatedUrl`. To make clipboard content visible in a
  screenshot without devtools, paste (ctrl+v) into the "Поиск UTM-кампаний..." search input, press Home to
  show the start of the URL, then clear it.
- Baseline seeded UTM numbers (useful as fixed expectations): Общие клики `1 358`, Конверсии `107`,
  Средняя конверсия `7.9%`, 5 campaigns, first is "Instagram Весенняя акция".
- Scroll reveal (`src/components/ui/reveal.tsx`) needs real mouse-wheel scrolling; sections start at
  opacity-0 and should end fully visible — screenshot before and after scrolling.

## Verifying that a UI action really hit the API

Start the dev server with its output redirected to a file (`setsid nohup npm run dev > /tmp/dev.log 2>&1 &`;
plain `nohup ... &` from a one-shot shell dies when the shell exits). Then `grep "POST /api/utm" /tmp/dev.log`
shows lines like `POST /api/utm 201 in 12ms` — a reliable, devtools-free way to prove a request happened and
with which status. Note `npm run dev` rewrites the agent-rules block in `AGENTS.md`, so `git status` shows
`AGENTS.md` modified after any local run; that is not a test artifact.

A dev-overlay "1 Issue" badge with a `Console Error` from `src/components/auth/auth-provider.tsx`
("Can't perform a React state update on a component that hasn't mounted yet") appears on authenticated
pages and is pre-existing — confirm the file is untouched by the PR under test before reporting it.

## Devin Secrets Needed

- `OPENAI_API_KEY` — required for AI chat generation and the chat PDF/HTML export. Without it those
  flows cannot be tested and should be reported as untested.
