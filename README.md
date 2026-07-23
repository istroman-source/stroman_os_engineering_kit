# Stroman OS

Creative Intelligence Platform for filmmakers and creative teams. This repository
contains both the **application** (a Next.js modular monolith) and the original
**engineering kit** (specifications and the 150-step build sequence) that drives it.

> Product principle: every feature must measurably improve a creative decision.

## Quick start

```bash
nvm use                 # Node 24 (see .nvmrc)
npm install
cp .env.example .env     # then edit values
npm run db:generate      # generate the Prisma client
npm run dev              # http://localhost:3000
```

Optional local PostgreSQL (matches `.env.example`):

```bash
docker compose up -d
```

## Scripts

| Command                 | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start the dev server                       |
| `npm run build`         | Production build (Next standalone output)  |
| `npm run start`         | Serve the production build                 |
| `npm run lint`          | ESLint (incl. architecture boundary rules) |
| `npm run typecheck`     | `tsc --noEmit` (strict)                    |
| `npm test`              | Vitest unit/component tests                |
| `npm run test:e2e`      | Playwright end-to-end tests                |
| `npm run format`        | Prettier write                             |
| `npm run db:generate`   | Prisma client generation                   |
| `./autopilot`           | Run the guarded milestone lifecycle        |

## Documentation

- `docs/ARCHITECTURE.md` — engineering architecture, folder structure, boundaries
- `docs/LOCAL_DEVELOPMENT.md` — environment setup and workflow
- `docs/CODING_STANDARDS.md` — conventions and quality bar
- `docs/BUILD_PROGRESS.md` — verified log, one entry per build step
- `docs/AUTOPILOT.md` — one-command engineering automation, gates, and recovery

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui · TanStack Query · Zustand · Zod · Prisma 6 + PostgreSQL ·
Vitest · Playwright · ESLint · Prettier · Husky + lint-staged · Docker · GitHub Actions.

---

# Engineering Kit (specifications & build sequence)

The materials below are the developer-ready specification and sequential Claude
Code build system for Stroman OS.

## How the build sequence works

1. Open this folder in your editor and start Claude Code from the repository root.
2. Open `prompts/PROMPT_INDEX.md`.
3. Execute one numbered prompt at a time.
4. Verify its tests and stop condition before the next prompt.
5. Commit stable work after each prompt.

## Main materials

- `prompts/` — 150 individual copy-and-paste Claude Code prompts
- `product/` — product requirements
- `engineering/` — software, architecture, and API requirements
- `design/` — UX specification
- `ai/` — AI behavior and orchestration rules
- `security/` — security and privacy requirements
- `qa/` — test strategy
- `operations/` — deployment and operations
- `governance/` — development process and execution checklist
- `roadmap/` — staged product roadmap

## Important

Do not paste all 150 prompts at once. Do not allow Claude to claim undocumented
Wideframe APIs or other external capabilities. A human engineer should review
security, migrations, provider costs, and release readiness.
