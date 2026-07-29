# Build Progress

## Filmmaking Intelligence Workflow Restructuring

The repository was audited against the filmmaking-intelligence north star. Primary
navigation now leads directly to Story Studio; Memory and Knowledge Acquisition remain
validated backend capabilities but are no longer user setup destinations. Creating a
project immediately opens its concept and intent workflow, and the existing deterministic
Creative Blueprint is presented as a current-story and edit-recommendation workspace.

No domain records, APIs, migrations, provenance, or source data were removed. The revised
roadmap prioritizes project source intake, automatic editorial context, the evidence-
grounded Edit Engine, and prompt handoff. Generic knowledge-management and SaaS expansion
are postponed. Full audit and ranked follow-ups are recorded in
`docs/FILMMAKING_INTELLIGENCE_DIRECTION.md`.

Append one verified entry after every numbered prompt.

## Repository Autopilot

**Date:** 2026-07-23 · **Volume:** Engineering automation

Added the repository-owned `./autopilot` lifecycle coordinator. Its TypeScript state
machine provides guarded preflight and milestone selection, branch and interrupted-run
state, exact implementation/review prompts, canonical verification with redacted logs,
commit/PR/CI orchestration, structured independent review, bounded objective remediation,
strict merge gates, cleanup, and continuous-run intent. Agent commands are optional and
disabled by default; unavailable agents produce explicit actionable waiting states.

Runtime state and logs are gitignored, configuration is version controlled without
secrets, and Git/GitHub execution uses argument arrays rather than shell interpolation.
Seventeen focused tests cover dirty/auth failures, selection and prerequisite protection,
branch naming, verification, resume, CI rejection, review/merge gates, remediation limits,
cleanup, dry-run behavior, machine-readable state, and concurrent-run locking.

## Prompt 013 — Analysis and Decision Domain Model

**Date:** 2026-07-23 · **Volume:** Foundation

Added project-owned, versioned `AnalysisRun` lifecycle aggregates, immutable typed
outputs and editorial recommendations, optional confidence and durable Evidence links,
plus optional linkage to the existing human-authoritative Decision aggregate. Authorized
application workflows create, start, fail, complete, and read runs through owner-free
views. Prisma persistence adds lifecycle constraints, project-owner alignment,
project-version uniqueness, CAS updates, explicit corruption-safe mappers, and atomic
completion of runs, outputs, recommendations, and evidence links. Composition and test
fakes implement the same repository contract.

Recommendations remain advisory; only the existing Decision aggregate records a human
choice. Completed outputs and prior versions are immutable. No HTTP, UI, provider call,
analysis engine, or extraction was added. Domain, application, mapper, and PostgreSQL
tests cover lifecycle rules, validation, ownership, version uniqueness, CAS, atomic
completion, and rollback. Prompt 014 — Review and rubric domain model — is next.

## Prompt 012 — Evidence Domain Model

**Date:** 2026-07-22 · **Volume:** Foundation

### Files and behavior

Added the distinct Evidence bounded context, immutable `EvidenceReference` aggregate,
branded identifier, discriminated media/segment provenance, and narrow insert/read/list
repository. Added authorized application services and owner-free views; explicit Prisma
mappers and an insert-only repository; schema, migration, CHECK constraints, composite
alignment foreign keys, indexes, composition wiring, and equivalent in-memory storage.

### Decisions

- Evidence points only to source material already modeled by Prompt 011: a whole media
  asset or an exact transcript segment with its complete transcript/media chain.
- Existing Story Evidence, Decision advisory evidence, and Knowledge Acquisition
  provenance remain separate domain-specific concepts; no cross-domain link was added.
- Evidence is immutable and source deletion is restricted. No generic repository,
  update/delete operation, HTTP route, UI, bookmark workflow, or AI grounding was added.

### Tests executed

Domain, application, mapper-corruption, and real-PostgreSQL repository/migration tests
cover both provenance kinds, authorization, project alignment, missing segments,
deterministic lists, repository failures, malformed persistence shapes, foreign keys,
duplicate identifiers, and source deletion protection. The final verification results
are recorded in the implementation handoff.

### Known limitations and next prompt

Prompt 012 provides the resolvable domain/application/persistence foundation only.
Bookmark creation UI is deferred to Prompt 044, citation presentation to Prompt 045,
and AI citation validation to Prompt 067. The next strict roadmap step is Prompt 013 —
Analysis and decision domain model.

## Prompt 011 — Media and Transcript Domain Model

**Date:** 2026-07-22 · **Volume:** Knowledge Acquisition foundation

Added the immutable `MediaAsset` and `TranscriptDocument` domain model, including
transcript-local speakers, ordered segments, timestamp and reference invariants, and
narrow repository ports. Added project-owned application services for registering and
reading media metadata and creating and reading normalized transcripts. Added Prisma
tables, hand-written constraints, explicit mappers, transactional repositories,
composition wiring, in-memory fakes, and domain/application/mapper/integration tests.

Deferred by design: file storage and upload adapters, transcript importers, HTTP and
OpenAPI delivery, UI/viewers, search, and AI extraction. These belong to later prompts.

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
