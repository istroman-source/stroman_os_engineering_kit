# Build Progress

## Prompt 017 — Database Indexes and Constraints

**Date:** 2026-08-10 · **Volume:** Foundation · **Status:** Complete — READY FOR HUMAN TESTING

Hardened the older Memory, Story Reasoning, and Knowledge Acquisition persistence domains
so PostgreSQL—not only application services—rejects cross-owner references. Composite
candidate keys and foreign keys now align every relationship that already carries an
`owner_id`; Knowledge observations additionally align their source document and optional
acquisition run to the same owner and source. Existing project, provenance, ordering, human
authority, and append-only behavior are unchanged. No media binaries or new product surface
were introduced.

Replaced single-column owner/list indexes with query-backed compound indexes that match
repository filters and deterministic `created_at` ordering, while retaining the indexes
needed for composite referential checks. The two knowledge-observation alignment indexes now
have explicit catalog-safe names shared by the migration and Prisma mappings. Added
real-PostgreSQL negative-path tests for every owner-aligned relationship, including independent
source-document and acquisition-run lineage mismatches, plus exact runtime catalog checks for
both renamed indexes.

Files changed: the reusable Prompt 017 instructions, `prisma/schema.prisma`, migration
`20260810120000_harden_workspace_indexes_constraints`, focused database integration tests,
the persistence architecture, roadmap, and release notes. The inner Codex sandbox could not
start PostgreSQL or fetch the existing Google font, so Autopilot reran the canonical gate in
the authorized host environment after remediation. All nine configured checks passed there:
Prisma format/generate, typecheck, lint, format check, unit tests, real-PostgreSQL integration
tests, production build, and diff validation. Exact-head CI passed, independent Claude review
approved commit `99105274997530ea3d6988df73acecbbe25cac2e` with only OPTIONAL findings,
PR #25 merged atomically, and post-merge `main` CI passed at merge commit
`59010285c4e8249e6cb23de7e27be570c3f3d5e1`. Manual SQL inspection is not represented as
runtime evidence.

Known limitation: this milestone hardens relationships that already persist workspace scope;
it does not add speculative tenant columns to global or child-only tables. Prompt 018 remains
outside the approved rollout and is not recommended until a new roadmap decision authorizes it.

---

## Continuous Autopilot First-Rollout Activation

**Date:** 2026-08-10 · **Status:** Complete — first bounded rollout verified

Activated the repository-owned continuous loop for one bounded rollout through Prompt 017.
Continuous mode now requires automatic exact-SHA merge and a three-digit stop milestone;
the configured stop must match an existing, explicitly roadmap-approved milestone. Dry runs
select only one milestone, and explicit milestone requests remain single-run by default.
The approved boundary stops after Prompt 017 at **READY FOR HUMAN TESTING** and cannot drift
into Prompt 018 without a new roadmap and configuration change through the same review gates.

Local verification, exact-head CI, independent Claude review, bounded remediation, merge
integrity, protected paths, approval policies, and repository safeguards remain unchanged.

## Milestone 5A — General Creative Reasoning Domain

**Status:** Complete (domain-only foundation)

- Added form-neutral creative sessions, directions, critiques, questions, human context,
  immutable revision lineage, explicit approvals, and ordered project plans.
- Preserved strict source-evidence versus memory/insight-context distinctions and kept human
  context separate from all three.
- Proved documentary/interview, commercial/product, and music/performance planning without
  a shared beat, device, or narrative structure.
- Intentionally reused branded Project, Owner, EvidenceReference, Memory, and Insight IDs.
- Intentionally deferred repositories, persistence, services, HTTP/OpenAPI/UI, provider
  integrations, prompt generation, and connection to the existing Prompt Handoff path.

---

## Prompt 016 — Audit and Integration Domain Model

**Date:** 2026-08-07 · **Volume:** Foundation

Added project-owned, append-only external connections, terminal sync receipts, external
identifier mappings, and audit events. Authorized application services register connections,
record idempotent sync results, and read integration history without exposing owner ids.
Provider credentials, provider SDKs, network synchronization, webhooks, jobs, HTTP routes, and
UI are explicitly outside this domain-foundation milestone.

Prisma persistence atomically records connection+audit and sync+identifier+audit units.
Composite foreign keys preserve owner/project/connection/run alignment; unique constraints
protect request idempotency and both sides of external mappings; CHECK constraints preserve
terminal success/failure shape and bounded values. Duplicate concurrent request keys return
the committed receipt. Explicit mappers reject corrupt persistence, and the in-memory adapter
matches atomic, idempotent, deterministic behavior.

Focused domain, application, mapper, and real-PostgreSQL tests cover validation,
authorization, project isolation, migration order, transaction rollback, concurrent duplicate
requests, external-id conflicts, deterministic ordering, and mapper corruption. Prompt 017 —
Database indexes and constraints — is next.

---

## Prompt 003 — Architecture Decision Records

**Date:** 2026-08-07 · **Volume:** Foundation

Completed explicit ADR coverage for the application framework, database, authentication,
jobs, storage, search, and AI-provider abstractions. Existing accepted records remain the
single authority for framework, PostgreSQL/Prisma, Supabase authentication, and provider-
neutral AI. New records make the current jobs, source-storage, and PostgreSQL-first search
boundaries explicit without introducing runtime infrastructure.

The decisions preserve inward dependency direction, project-scoped authorization,
provenance, source integrity, deterministic behavior, and honest readiness claims. Queues,
workers, production object storage, signed access, search indexes, embeddings, external
search services, and AI-provider adapters remain deferred until approved workflows require
them and can prove their real delivery boundaries.

A focused documentation contract test verifies that all seven required areas map to
accepted ADRs. The canonical verification gate is recorded in the PR handoff. The completion
audit below identifies Prompt 008 — Database development environment — as the next genuinely
incomplete prerequisite; Prompt 004 is Monorepo and folder structure and is already complete
through bundled foundation work.

---

## Prompt 004 — Monorepo and Folder Structure

**Classification:** COMPLETE THROUGH PREVIOUS BUNDLED WORK

Concrete evidence: `src/app`, `src/ui`, `src/application`, `src/domain`, `src/server`,
`src/infrastructure`, and focused `src/lib` modules implement the documented modular-monolith
layout; `docs/ARCHITECTURE.md` defines responsibilities and dependency direction; ESLint
enforces the boundaries. No duplicate repository structure is required.

## Prompt 005 — Local Development Environment

**Classification:** COMPLETE THROUGH PREVIOUS BUNDLED WORK

Concrete evidence: `.nvmrc`, `.env.example`, `docker-compose.yml`, `Dockerfile`, environment
validation under `src/lib/env`, and `docs/LOCAL_DEVELOPMENT.md` provide the Node, PostgreSQL,
configuration, and documented local workflow foundation.

## Prompt 006 — Code Quality Toolchain

**Classification:** COMPLETE THROUGH PREVIOUS BUNDLED WORK

Concrete evidence: strict `tsconfig.json`, `eslint.config.mjs` architecture rules, Prettier
configuration, Husky/lint-staged pre-commit checks, and the package verification scripts are
active and exercised by CI.

## Prompt 007 — Continuous Integration Baseline

**Classification:** COMPLETE THROUGH PREVIOUS BUNDLED WORK

Concrete evidence: `.github/workflows/ci.yml` performs locked installation, Prisma generation,
lint, strict typechecking, tests, production build, and Playwright checks with least-privilege
repository permissions.

## Prompt 008 — Database Development Environment

**Classification:** COMPLETE AS WRITTEN after completing previous bundled work

`docker-compose.yml`, Prisma 6, 16 ordered migrations, real-PostgreSQL test setup,
constraints, and migration deployment came from previous bundled work. Prompt 008 adds the
missing fail-closed developer reset and seed commands. Both require explicit local
confirmation, reject production, remote, malformed, non-PostgreSQL, and reserved database
targets without exposing credentials, and accept only the named local Stroman development or
test databases. Reset reapplies migrations before verifying seed readiness.

No product or demonstration rows are created because Prompt 018 owns that scope. Focused
tests cover command confirmation and target safety; the canonical full gate supplies real
migration and database-boundary coverage. Prompt 016 — Audit and integration domain model —
is the next genuinely incomplete prerequisite after the audited Prompt 004–015 completion map.

## Prompt 009 — Core Domain Glossary

**Classification:** COMPLETE THROUGH PREVIOUS BUNDLED WORK

Concrete evidence: `docs/DOMAIN_GLOSSARY.md` defines the implemented bounded-context vocabulary,
distinguishes overloaded concepts, and corresponds to branded domain types and module names.

## Prompt 010 — Initial Domain Model

**Classification:** COMPLETE THROUGH PREVIOUS BUNDLED WORK

Concrete evidence: `src/domain/shared`, `project`, `content`, `evaluation`, `decision`, and `ai`
contain validated values, aggregates, lifecycle rules, repository/provider ports, and focused
tests; `docs/DOMAIN_MODEL.md` and ADR-0014 document the boundaries and human-authority rule.

Prompts 011–015 are **COMPLETE AS WRITTEN**. Their concrete evidence is recorded in the
individual Prompt 011–015 entries below and includes domain/application contracts, Prisma
migrations and constraints, corruption-safe mappers, in-memory adapters, focused tests, and
real-PostgreSQL integration coverage for media/transcripts, Evidence, analysis/decisions,
reviews/rubrics, and learning/retrospectives.

---

## Prompt 001 — Repository Audit and Baseline

**Date:** 2026-08-07 · **Volume:** Foundation

Audited the repository at merge commit `9814d412da9e90b460f5ae6343a1e4997041c812`
and recorded the current file inventory, implemented architecture, assumptions, exclusions,
gaps, risks, and evidence boundaries in `docs/REPOSITORY_BASELINE.md`. The audit distinguishes
repository/static proof from historical CI evidence and from production/provider evidence that
remains unverified.

No product code, schema, migration, dependency, runtime configuration, or deployment behavior
changed. Missing consolidated MVP/technical-decision documents, production readiness proof,
dependency advisories, external-provider acceptance, and later operational work are explicitly
deferred to their own reviewed milestones.

Focused validation checks the documented inventory against the tracked repository. The full
canonical verification gate is recorded in the PR handoff. Prompt 003 — Architecture decision
records — is the next incomplete numbered dependency because Prompt 002 is already represented
by the repository foundation entry below.

---

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

## Accelerated Delivery Plan — Beta Readiness Gate

**Date:** 2026-08-03 · **Status:** Implemented; awaiting CI and independent review

Added global browser hardening headers, a beta-readiness evaluation covering safe health
responses and log redaction, and a Playwright keyboard/accessibility smoke test for the
signed-out onboarding flow. Added explicit internal-alpha onboarding and a deployment
gate with a truthful **NOT READY FOR LIMITED BETA** verdict. Authentication documentation
was corrected to reflect the already-implemented server-side session refresh.

The gate does not authorize deployment. Durable OTP abuse controls, isolated staging,
backup/restore and rollback rehearsal, a signed-in browser journey, manual WCAG 2.2 AA
review, deployment-compatible storage/database configuration, and legal/privacy
readiness remain blocking before public beta.

## Accelerated Delivery Plan — Internal-Alpha Reliability and Evaluation Gate

**Date:** 2026-08-03 · **Status:** Implemented; awaiting CI and independent review

Added a deterministic CI evaluation gate for the complete internal-alpha intelligence
path. Fixtures measure citation validity, confidence bounds, repeatability, insufficient-
evidence behavior, prompt-injection containment, and honest manual-only integration
labeling. The gate exposed and fixed an empty-transcript crash in the development
analyzer and hardened generated prompts by placing authority rules before escaped,
delimited source-derived material.

The readiness verdict is limited to controlled internal alpha. Hosted-model editorial
quality, signed-in browser journey coverage, clipboard/download smoke testing, and
manual acceptance in the current Wideframe desktop product remain explicit manual checks
instead of being represented as automated proof.

## Accelerated Delivery Plan — Prompt Synthesis and Wideframe Handoff

**Date:** 2026-07-29 · **Status:** Implemented; awaiting CI and independent review

Added a provider-neutral, evidence-cited plain-text editorial intent package synthesized
from the current Edit Engine result. Filmmakers can inspect, copy, or download the exact
prompt before using it elsewhere. The package preserves the completed analysis version,
deduplicated evidence identifiers, current story, recommendations, alternatives, and
explicit non-invention and non-destructive-editing constraints.

Wideframe's public product material supports intent-driven editing and local,
non-destructive workflows, but no public API contract was verified. The UI therefore
labels the Wideframe path as manual copy only and makes no network request or automatic
transfer. Wideframe authentication, APIs, synchronization, project-file generation, and
claims of successful import remain deliberately deferred.

## Accelerated Delivery Plan — Edit Engine v1

**Date:** 2026-07-29 · **Status:** Implemented; awaiting CI and independent review

Added a read-only Edit Engine composition that brings the existing creative intent and
latest completed evidence-grounded analysis into one filmmaker-facing view: current
story, five strongest observations, advisory edit recommendations, and creative
alternatives. Evidence identifiers and confidence remain visible on grounded material,
and interrupted or failed analysis runs cannot replace the completed version shown.

The slice adds no persistence, provider, decision automation, or unrelated workflow.
It reuses the current project ownership boundary, creative blueprint, analysis history,
and analysis action. Completing a new analysis refreshes the Edit Engine in place.

## Accelerated Delivery Plan — Automatic Evidence-Grounded Analysis Pipeline

**Date:** 2026-07-29 · **Status:** Implemented; awaiting CI and independent review

Added a provider-neutral grounded editorial analysis boundary and a transparent,
deterministic development implementation. A project owner can run analysis directly
from imported transcripts; every finding and advisory recommendation must cite
project-owned transcript segments before it can be persisted. The application reuses
immutable Evidence references, creates versioned Analysis runs, records failed runs
when grounding or the analyzer fails, and exposes the latest completed result after
refresh through authenticated project-scoped HTTP delivery.

The filmmaker-facing workspace adds one calm analysis action and displays concise
findings, source counts, confidence, and an explicitly advisory next step. It does not
create Decisions, mutate source material, call a hosted AI provider, expose knowledge
administration, or add analysis dashboards. The deterministic adapter is a replaceable
baseline behind the existing architecture boundary; provider-backed intelligence and
the Edit Engine remain later gated work.

Focused coverage verifies deterministic output, mandatory source grounding, ownership
isolation, missing-source rejection, evidence reuse, version progression, latest-result
retrieval, and failed-run recording for unsupported claims. OpenAPI documents both the
run and latest-result operations.

## Accelerated Delivery Plan — Project Source Intake & Transcript Import

**Date:** 2026-07-29 · **Status:** Implemented; awaiting CI and independent review

PR #8 merged Prompt 013 into `main`, completing the versioned Analysis and
human-authoritative Decision foundation. A gap audit of Prompts 014–025 found no
additional prerequisite that must be implemented before source intake: existing rubric
and evaluation support, ownership authorization, project-isolation coverage, database
constraints, authentication, shell, design tokens, components, and CI are sufficient.

Review-run overrides, learning/retrospectives, generic audit/integration administration,
seed expansion, generic workspace roles, and another foundation release gate are deferred
because they do not enable the intake vertical slice. The active milestone combines only
tightly coupled storage/upload and transcript-import work, preserving provenance,
ownership, project isolation, auditability, source integrity, idempotency, typed errors,
transaction safety, and test parity. It will not expose knowledge-management or graph
administration to filmmakers.

Forecast from the current merged-PR cadence, adjusted for higher integration complexity:
first visible demo by 2026-08-04, usable internal alpha by 2026-08-28, and product-quality
beta by 2026-10-23. Forecasts are recalculated after each merge from implementation,
review, CI, and blocked-time data.

The implemented slice adds a filmmaker-facing Source Material panel to each project,
project-scoped media and transcript upload, visible importing/completion states, and
normalized SRT, VTT, JSON, and text transcript ingestion. SHA-256 provenance, source
storage keys, idempotency receipts, transcript ordering, and atomic creation of receipts,
media, documents, speakers, and segments make completed material immediately resolvable
by the existing Evidence and Analysis foundations.

The persistence mapper rejects corrupt import rows, the database enforces owner/project
alignment and source relationships, and the test adapter mirrors idempotent atomic
behavior with storage compensation. Focused application, mapper, and real-PostgreSQL
tests cover parsing, ordering, ownership isolation, idempotency, rollback, and mapper
corruption.

Deferred remain review/rubric expansion, learning workflows, generic ingestion or asset
administration, transcript editing/search, background job infrastructure, cloud storage
providers, automatic analysis, and every nonessential roadmap item. The synchronous
first slice deliberately uses the existing server boundary and a provider-neutral local
storage adapter; production object storage and asynchronous workers are introduced only
when scale or deployment requirements make them necessary.

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

## Prompt 015 — Learning Domain Model

**Date:** 2026-08-07 · **Volume:** Foundation

Added project-owned retrospectives with an immutable project-context snapshot, ordered
categorized lessons, and an explicit human `DRAFT → APPROVED` lifecycle. Authorized
application services create, retrieve, list, and approve retrospectives while returning
owner-free views. Approval uses optimistic concurrency and can occur only once.

Prisma persistence stores roots and lessons transactionally. Composite project/owner
relationships, lifecycle-shape checks, bounded text checks, ordering constraints, and
indexes preserve ownership, project isolation, auditability, deterministic ordering, and
human authority. Corruption-safe mapping and an equivalent in-memory adapter complete the
boundary.

Focused domain, application, mapper, and PostgreSQL tests cover validation, authorization,
ordering, approval attribution, stale writes, atomic rollback, project isolation, and
corrupt persistence. No UI, HTTP contract, AI generation/reuse, export, generic audit
framework, or Prompt 016 work was added. Prompt 016 — Audit and integration domain model —
is next.

---

## Prompt 014 — Review and Rubric Domain Model

**Date:** 2026-08-06 · **Volume:** Foundation

Extended the existing rubric and immutable evaluation model with completed human review
runs and per-criterion score overrides. Each override preserves the evaluated score, the
human-selected score, criterion, rationale, reviewer, source evaluation, rubric, project,
and completion time. Authorized application services record, retrieve, and list reviews;
no HTTP, UI, AI execution, or generic workflow system was added.

PostgreSQL composite foreign keys enforce project-owner, evaluation-project-rubric,
criterion-rubric, and original-evaluation-score alignment. Review and override creation is
transactional and completed reviews are append-only. Prisma mappers reject corrupt IDs or
scores, and the in-memory adapter implements the same narrow repository contract.

Focused domain, application, mapper, and real-PostgreSQL tests cover validation, human
attribution, denied access, deterministic listing, source-score provenance, ownership
isolation, atomic rollback, and mapper corruption. The complete verification commands and
results are recorded in the PR handoff.

Known limitation: this foundation intentionally has no filmmaker-facing review screen or
HTTP contract; those require a later explicit product milestone. Prompt 015 — Learning and
retrospective domain model — is the next numbered foundation prompt.

---

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
