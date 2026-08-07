# Repository Audit and Baseline

**Snapshot date:** 2026-08-07  
**Baseline commit:** `9814d412da9e90b460f5ae6343a1e4997041c812`  
**Scope:** Prompt 001 — inspection and documentation only

## Executive baseline

Stroman OS is an actively implemented Next.js modular monolith, not an empty engineering
kit. The repository contains the application, its 150-step prompt corpus, architecture and
product documentation, Prisma persistence, local and CI verification, and repository-owned
Autopilot automation. The current product path includes authenticated project workflows,
source and transcript intake, evidence-grounded analysis, edit recommendations, decision
records, prompt handoff, review runs, and approved project learning.

This audit made no product-code, schema, dependency, infrastructure, or runtime changes.
It records what can be demonstrated from the repository and separates that automated
evidence from manual or unavailable operational evidence.

## Inventory

The authoritative per-file inventory is `git ls-files` at the baseline commit. Summary:

| Area | Observed baseline |
| --- | --- |
| Tracked files | 784 |
| TypeScript/TSX files under `src/` | 495 |
| Automated test/spec files | 109 |
| Numbered prompt files | 150 |
| Prisma migration directories | 16 |
| App Router HTTP route modules | 64 |
| Application runtime | Next.js 16, React 19, TypeScript strict mode |
| Persistence | Prisma 6 and PostgreSQL |
| Verification | Vitest, embedded-PostgreSQL integration tests, Playwright, ESLint, Prettier, production build |

Top-level responsibilities are explicit: `src/` is the application, `prisma/` owns schema
history, `test/` contains shared test adapters and database support, `e2e/` contains browser
coverage, `docs/` records current decisions and readiness evidence, `prompts/` is the build
sequence, and `scripts/autopilot/` owns milestone orchestration. Generated, secret, runtime,
and dependency directories are excluded through `.gitignore`.

## Demonstrated architecture and behavior

- Domain code is framework-independent and accessed through application services and narrow
  repository/provider ports.
- Server composition wires Prisma, source storage, authentication, and analysis adapters.
- Project-owned records repeat ownership and cross-record alignment checks at application and
  database boundaries where applicable.
- Human-authoritative decisions, review overrides, and retrospective approvals are represented
  separately from AI advisory output.
- Source import preserves hashes, storage provenance, transcript ordering, idempotency, and
  compensating cleanup behavior.
- The checked-in CI workflow runs dependency installation, Prisma generation, lint, strict
  typechecking, unit tests, Autopilot tests, evaluation gates, production build, and Playwright.

These are repository observations, not claims that every production deployment or external
provider has been exercised.

## Existing decisions and assumptions

The audit treats the checked-in architecture as the current source of truth:

- modular monolith until measured extraction pressure exists;
- PostgreSQL as durable storage and provider-neutral ports at external boundaries;
- server-side authorization with a single-owner project model today;
- immutable provenance and append-only audit records where source/history integrity matters;
- optimistic concurrency for mutable lifecycle roots;
- AI output is advisory and evidence-grounded; humans retain approval and decision authority;
- filmmaker UI uses filmmaker concepts and does not expose repository or graph internals.

No new product or security architecture decision is approved by this audit. Proposed changes
to these assumptions require their own milestone and review.

## Gaps and risks

### Documentation and sequencing

- `docs/MVP_SCOPE.md` and `docs/TECHNICAL_DECISIONS.md`, referenced by the generic prompt
  template, do not exist. Related material is distributed across `PRODUCT_REQUIREMENTS.md`,
  `ARCHITECTURAL_DECISIONS.md`, `ARCHITECTURE.md`, and the roadmap. Consolidation belongs to
  the scope-lock/decision-record milestones, not this audit.
- The progress ledger previously omitted Prompt 001, so Autopilot correctly selected it even
  though later milestones were delivered. This entry repairs the ledger; it does not imply the
  numbered sequence was originally executed linearly.

### Operational evidence

- Beta readiness remains blocked where `docs/BETA_READINESS.md` records missing production
  runtime proof, including deployed security-header behavior. Configuration or source text is
  not accepted as substitute evidence.
- Hosted authentication acceptance requires an isolated Supabase project and separate secret
  environment; local fakes and unit tests do not prove that provider boundary.
- Backup/restore, staging, incident response, and production monitoring require later explicit
  operational milestones and real-environment evidence.

### Dependency and delivery risk

- The 2026-08-07 locked dependency install reported seven high-severity audit findings. No
  automated upgrade was attempted because dependency remediation is outside Prompt 001 and may
  introduce breaking changes; this requires a dedicated reviewed dependency/security task.
- The production build fetches Google Fonts. Restricted or offline environments need network
  access during build unless a later decision vendors those assets.
- Prisma remains intentionally pinned to major version 6; a major-version upgrade requires a
  migration plan rather than an opportunistic update.

## Verification evidence policy

For this audit, repository inventory and static consistency checks are automated evidence.
CI history and prior progress entries are historical evidence. Provider acceptance, deployed
headers, restore rehearsals, and production observability remain manual or unverified until
executed at their real delivery boundaries. Readiness must continue to report blocked when
required runtime evidence is absent.

## Explicit exclusions

Prompt 001 adds no feature, route, UI, schema, migration, adapter, provider, dependency, seed,
or deployment change. It does not execute Prompt 003 or later incomplete foundation prompts,
resolve optional PR findings, remediate dependency advisories, or declare beta readiness.

## Recommended next milestone

Prompt 002 is already represented in the progress ledger by the repository-foundation and MVP
scope work. The next incomplete numbered dependency is Prompt 003 — Architecture decision
records — subject to Autopilot selection after this audit is merged.
