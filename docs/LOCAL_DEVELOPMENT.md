# Local Development

## Prerequisites

- **Node 24** (see `.nvmrc`; run `nvm use`)
- **npm** (bundled with Node)
- **Docker** (optional, for local PostgreSQL)

## Setup

```bash
nvm use
npm install
cp .env.example .env      # fill in values; all vars are validated at startup
npm run db:generate       # generate the Prisma client
```

### Database

Start the local PostgreSQL service and apply committed migrations:

```bash
docker compose up -d      # PostgreSQL + pgvector on localhost:5432
npm run db:migrate
```

The default `DATABASE_URL` in `.env.example` matches the compose service.

Database maintenance is deliberately fail-closed. Seed and reset accept only a loopback
PostgreSQL URL whose database is `stroman_os` or a `stroman_*test` database, reject
`NODE_ENV=production`, and require explicit confirmation:

```bash
npm run db:seed -- --confirm-local   # verifies the migrated database; no product data yet
npm run db:reset -- --confirm-local  # destructive: reset migrations, then verify seed readiness
```

Prompt 008 does not create demonstration records; that content belongs to Prompt 018. The
seed command reports this explicitly rather than representing fixture data as product data.

## Everyday commands

```bash
npm run dev            # dev server at http://localhost:3000
npm run lint           # ESLint (includes architecture boundary rules)
npm run typecheck      # strict TypeScript, no emit
npm test               # Vitest (watch: npm run test:watch)
npm run test:e2e       # Playwright (builds + serves, then runs specs)
npm run format         # Prettier write
```

## Git hooks

Husky runs `lint-staged` on commit: ESLint `--fix` and Prettier on staged files.
The hook is installed automatically via the `prepare` script on `npm install`.

## Environment variables

All variables are validated by `src/lib/env` using Zod. An invalid or missing
required variable throws a descriptive `EnvironmentValidationError` rather than
failing silently. See `.env.example` for the full list.

## Playwright browsers

The first e2e run may prompt to install browsers:

```bash
npx playwright install
```
