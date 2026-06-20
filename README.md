# AI Cosmetology Platform

AI-powered platform for cosmetologists with CRM, consultations, SMM, and analytics.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **ORM**: Drizzle ORM + PostgreSQL
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use a local one via Docker)

### Installation

```bash
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable            | Description                         |
| ------------------- | ----------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string         |
| `NEXT_PUBLIC_APP_URL` | Application URL (default: http://localhost:3000) |
| `OPENAI_API_KEY`    | OpenAI API key for AI features       |

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

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/           # shadcn/ui components
├── db/               # Drizzle ORM: schema, client
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── types/            # TypeScript type definitions
```

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server             |
| `npm run build`        | Build for production                 |
| `npm run start`        | Start production server              |
| `npm run lint`         | Run ESLint                           |
| `npm run format`       | Format code with Prettier            |
| `npm run db:generate`  | Generate Drizzle migrations          |
| `npm run db:migrate`   | Run Drizzle migrations               |
| `npm run db:push`      | Push schema changes to database      |
| `npm run db:studio`    | Open Drizzle Studio (DB GUI)         |

## License

Private
