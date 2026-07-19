# Build Progress

Append one verified entry after every numbered prompt.

---

## Prompt 002 — Repository Foundation & Engineering Architecture

**Date:** 2026-07-17 · **Volume:** Foundation

Note: executed with the user's custom "Prompt 002" (engineering foundation),
which bundles what the kit splits across steps 004–008 and 022–024. Hybrid mode:
custom prompt for this step, then rejoin the kit sequence. Kit Prompt 001 (repo
audit) was not run separately; its intent (baseline + risk capture) is covered
here and in `docs/BACKLOG.md`.

### Files changed (created/modified)

- **Tooling/config:** `package.json`, `tsconfig.json`, `next.config.ts`,
  `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`,
  `.nvmrc`, `.env.example`, `.gitignore`, `.dockerignore`, `Dockerfile`,
  `docker-compose.yml`, `.github/workflows/ci.yml`, `.husky/pre-commit`,
  `.vscode/{settings,extensions}.json`, `components.json`, `vitest.config.ts`,
  `vitest.setup.ts`, `playwright.config.ts`, `prisma/schema.prisma`.
- **Design tokens:** `src/styles/tokens.css`, `src/app/globals.css`, `src/lib/tokens.ts`.
- **Engineering utilities (`src/lib/*`):** `result`, `errors`, `logging`, `env`,
  `config`, `feature-flags`, `validation`, `id`, `datetime` (each with tests).
- **UI:** `src/ui/cn.ts`, `src/ui/primitives/button.tsx`, `src/ui/page-header.tsx`,
  `src/ui/shell/{app-shell,sidebar,top-nav,nav-links,nav-config}`.
- **App shell:** `src/app/layout.tsx`, `src/app/providers.tsx`, `src/app/page.tsx`,
  `src/app/(app)/layout.tsx`, and empty `dashboard`, `projects`, `settings` pages.
- **Tests:** 10 Vitest files (42 tests) + `e2e/shell.spec.ts` (Playwright).
- **Docs:** `README.md`, `docs/ARCHITECTURE.md`, `docs/LOCAL_DEVELOPMENT.md`,
  `docs/CODING_STANDARDS.md`.

### Decisions

- **Modular monolith**, single Next.js app (per `REFERENCE_ARCHITECTURE.md`).
- **Next.js 16 / React 19 / Tailwind v4** — current stable (satisfies "Next 15+").
- **Tailwind v4 CSS-first `@theme`** chosen to back the design-token system.
- **Dark-first** theming: dark palette is the `:root` default, `.light` opts out.
- **Prisma pinned to v6** (not v7): Prisma 7 removed `url` from the schema and
  requires `prisma.config.ts` + a driver adapter — a breaking change the kit's
  later domain/migration prompts are not written against. Documented deviation
  from "latest" for compatibility and stability.
- **Architecture boundaries enforced by ESLint** (`no-restricted-imports`), not
  convention: pure domain layer; UI cannot import server internals.
- Node installed to `~/.local/node` (no-sudo) because Homebrew requires an
  interactive admin password unavailable in this environment.

### Tests executed and results

All run locally on Node 24.18.0:

| Check          | Result |
| -------------- | ------ |
| `format:check` | ✅ pass |
| `lint`         | ✅ pass |
| `typecheck`    | ✅ pass (strict) |
| `test`         | ✅ 42/42 pass (10 files) |
| `build`        | ✅ pass (routes: /, /dashboard, /projects, /settings) |

Playwright specs are written but not executed here (browser binaries not yet
installed; `npx playwright install` required).

### Known limitations

- No auth, DB models, AI, uploads, transcripts, or API endpoints (out of scope).
- `public/` is empty (default Next assets removed); favicon lives in `src/app`.
- E2E not yet run in this environment.

### Recommended next prompt

Rejoin the kit sequence. Either kit Prompt 001 (repository audit/baseline docs:
`MVP_SCOPE.md`, `TECHNICAL_DECISIONS.md`) or kit Prompt 003 (Architecture
Decision Records) to formalize the decisions recorded above.

