# AI Cosmetology Platform

AI-powered platform for cosmetologists with CRM, consultations, SMM, and analytics.
Это CRM BeautyArt (Next.js) — лиды, клиенты, контент, промо, AI-чат и «Дом» (office).

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Base UI
- **ORM**: Drizzle ORM + PostgreSQL (`postgres` driver)
- **Testing**: Vitest (unit), ESLint 9 + Prettier
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js **20.9+** (Next.js 16 requirement; CI uses Node 22), npm 10+
- PostgreSQL 14+ database (or use a local one via Docker)

### Одна команда

Поднимает локальный PostgreSQL (если его нет), создаёт базу `cosmetology_db`,
схему, владельца и dev-сервер:

```bash
npm run up
```

Вход после первого запуска: `owner@zishel.kz` / `Owner12345!`
(значения пишутся в `.env.local` как `DEMO_EMAIL` / `DEMO_PASSWORD`).
Контакты клиник: `/dashboard/contacts`. Пример CSV: `public/samples/contacts.csv`.

`OPENAI_API_KEY`, `SENDGRID_API_KEY` и `MAILGUN_API_KEY` можно оставить пустыми:
AI отвечает шаблоном из локальной базы и прямо говорит, что ключа нет;
письма и SMS не притворяются отправленными.

### Installation

```bash
npm ci        # lockfile-режим, как в CI
# или npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable            | Description                         |
| ------------------- | ----------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string (обязателен: без него падает импорт `src/db`) |
| `NEXT_PUBLIC_APP_URL` | Application URL (default: http://localhost:3000) |
| `OPENAI_API_KEY`    | OpenAI API key for AI features (без него AI работает в офлайн-фолбэке) |
| `OPENAI_MODEL`      | OpenAI model id (default: `gpt-4o`)  |
| `OPENAI_TIMEOUT_MS` | Per-request timeout in ms (default: `30000`) |
| `LOG_LEVEL`         | Log level: `debug` \| `info` \| `warn` \| `error` (default: `info`) |
| `JWT_SECRET`        | Secret used to sign auth JWTs        |
| `WAZZUP_WEBHOOK_TOKEN` | Токен вебхука Wazzup (WhatsApp) — проверка заголовка `x-wazzup-token` |
| `LEADS_INGEST_TOKEN`   | Токен внешней выгрузки лидов в `/api/leads` — заголовок `x-ingest-token` |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Учётка демо-пользователя для `npm run db:seed:demo` |
| `EMAIL_PROVIDER`, `SENDGRID_API_KEY`, `MAILGUN_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` | Отправка писем (SMTP-провайдер) |

Значения секретов в репозиторий не коммитятся (`.env*` в `.gitignore`, кроме `.env.example`).

### Database Setup

```bash
npm run db:generate
npm run db:push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tests

```bash
npm test           # vitest run — unit-тесты, без БД и внешних API
npm run test:watch
npm run test:coverage
```

Тесты не требуют подключения к БД, OpenAI или других внешних сервисов — они подменяют
`fetch` и чистят `process.env.OPENAI_API_KEY` перед каждым кейсом, поэтому результат
не зависит от ключей в окружении машины.

## CI

`.github/workflows/ci.yml` — на каждый push в `main` и на каждый PR в `main`:

1. `npm ci` (Node 22, кеш npm)
2. `npm run lint` (ESLint)
3. `npm run typecheck` (`tsc --noEmit`)
4. `npm test` (Vitest)
5. `npm run build` (`next build`)

Сборке подставляется заглушка `DATABASE_URL` (например `postgresql://ci:ci@127.0.0.1:5432/ci_db`):
реальное соединение не устанавливается — `postgres.js` подключается лениво, а страницы
с обращениями к БД помечены как динамические (`ƒ`). Полный прогон приложения (seed,
API-роуты с БД) требует настоящего `.env.local` с рабочим `DATABASE_URL`.

## Deployment

- Основное приложение: **Vercel** (Next.js), прод — <https://beautyarts-crm.vercel.app>.
  Переменные окружения задаются в настройках Vercel-проекта (Project Settings → Environment Variables);
  `vercel.json` в корне нет, сборка идёт стандартной командой `npm run build`.
- Статический «Дом» (`public/office/`) деплоится отдельным Vercel-проектом; его
  `public/office/vercel.json` редиректит `/` → `/house/index.html` и проксирует
  `/dashboard` на `https://supercar-cyan.vercel.app/dashboard`.
- Башня HQ (`public/office/hq-tower/`, склейка Дом × vr-house) открывается статическим
  сервером из `public/office` — пути `../vendor/` и `/hq-tower/` считаются от этого корня:

  ```bash
  cd public/office
  python3 -m http.server 5181
  ```

  Дальше [http://127.0.0.1:5181/hq-tower/](http://127.0.0.1:5181/hq-tower/)
  (облёт камеры: `?tour=1` или клавиша `T`). Заметки по склейке и коллабу с Nexus HQ /
  21st.dev лежат в `docs/office/`. Каталог `public/office/house/` остаётся как есть.
- Миграции БД на проде применяются вручную: `npm run db:generate && npm run db:migrate`.

## Project Structure

```
src/
├── app/              # Next.js App Router pages + API routes
├── components/       # React components
│   └── ui/           # shadcn/ui components
├── db/               # Drizzle ORM: schema, client, seed
├── hooks/            # Custom React hooks
├── lib/              # Утилиты, AI-слой, auth, api-обёртки
└── types/            # TypeScript type definitions
```

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server             |
| `npm run build`        | Build for production                 |
| `npm run start`        | Start production server              |
| `npm run lint`         | Run ESLint                           |
| `npm run typecheck`    | Run TypeScript type-checker          |
| `npm run test`         | Run unit tests (Vitest)              |
| `npm run format`       | Format code with Prettier            |
| `npm run db:generate`  | Generate Drizzle migrations          |
| `npm run db:migrate`   | Run Drizzle migrations               |
| `npm run db:push`      | Push schema changes to database      |
| `npm run db:studio`    | Open Drizzle Studio (DB GUI)         |
| `npm run db:seed`      | Seed the database                    |
| `npm run db:seed:demo` | Seed the demo account                |

> Prettier-дрейф в репозитории есть (исторически `npm run format:check` падает на ~180 файлах).
> Проверка форматирования намеренно **не** включена в CI, чтобы не блокировать PR;
> привести всё к одному стилю лучше отдельным PR (`npm run format`).

## License

Private
