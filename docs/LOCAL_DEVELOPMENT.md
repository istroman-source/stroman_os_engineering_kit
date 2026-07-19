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

### Database (optional at this stage)

No domain models exist yet, so a running database is not required to develop the
foundation. When you need one:

```bash
docker compose up -d      # PostgreSQL + pgvector on localhost:5432
```

The default `DATABASE_URL` in `.env.example` matches the compose service.

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
