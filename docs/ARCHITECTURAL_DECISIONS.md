# Architectural Decisions

A lightweight ADR log for Stroman OS. Each record states the context, the
decision, and its consequences. Records are append-only; supersede rather than
edit once accepted. Captured from Prompt 002 (foundation) and Prompt 002.5
(Gate 1 review).

Status legend: **Accepted** · **Superseded** · **Deprecated**

---

## ADR-0001 — Modular monolith for the MVP
**Status:** Accepted (Prompt 002)

**Context.** The product will grow to many features and eventually multiple
runtime concerns (web, background jobs, AI gateway). We must balance early
velocity against future extraction.

**Decision.** Ship a single Next.js application (modular monolith), per
`engineering/REFERENCE_ARCHITECTURE.md`. Extract services only under measured
pressure.

**Consequences.** Fast to build and reason about now. Clear internal module
boundaries (below) make later extraction a lift-and-shift rather than a rewrite.
Risk: a monolith invites accidental coupling — mitigated by ADR-0004.

---

## ADR-0002 — Next.js 16 + React 19 + TypeScript (strict) + Tailwind v4
**Status:** Accepted (Prompt 002)

**Context.** The kit specifies Next.js 15+, TypeScript, and Tailwind. We chose
exact versions from current stable.

**Decision.** Next.js 16 (App Router), React 19, TypeScript with `strict` plus
`noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`.
Tailwind CSS v4 (CSS-first `@theme`).

**Consequences.** Modern RSC-first rendering; strong compile-time guarantees.
Tailwind v4's CSS-variable model directly backs the design-token system
(ADR-0005). Some libraries lag on the newest majors — see ADR-0008.

---

## ADR-0003 — Layered structure: app/ui → server → domain, with lib
**Status:** Accepted (Prompt 002)

**Context.** A large, multi-engineer codebase needs predictable placement and a
pure core that is insulated from framework and vendor churn.

**Decision.** `src/app` (routing only), `src/ui` (presentation), `src/server`
(server-only services/data/authz), `src/domain` (pure logic/types), `src/lib`
(single-purpose cross-cutting infrastructure). Every folder has one
responsibility; no `utils`/`helpers`/`misc` dumping grounds.

**Consequences.** Predictable navigation and testability. `domain` and `server`
start empty but real (documented READMEs) so the boundaries exist from day one.

---

## ADR-0004 — Enforce dependency boundaries with ESLint
**Status:** Accepted (Prompt 002)

**Context.** Conventions decay under many contributors. Boundaries must be
mechanical.

**Decision.** `no-restricted-imports` rules: the domain layer cannot import
React/Next/Prisma/UI/server; UI cannot import server internals. Dependencies
point inward only.

**Consequences.** Violations fail CI, not code review alone. This is the primary
guard against the monolith degrading into a tangle, and the enabler of ADR-0009.

---

## ADR-0005 — Design tokens as the single source of truth; dark-first
**Status:** Accepted (Prompt 002), refined in Gate 1

**Context.** Consistent, themeable UI at scale requires that no component
hardcodes visual values.

**Decision.** All color/radius/elevation/motion/focus/z-index tokens live in
`src/styles/tokens.css` (OKLCH), mapped into Tailwind via `@theme`. The interface
is dark-first: the dark palette is the `:root` default; `.light` is an explicit
opt-out. Gate 1 added `color-scheme` so native controls follow the theme.

**Consequences.** Theming and rebranding are localized. A JS mirror
(`src/lib/tokens.ts`) exposes breakpoints/z-index/motion for programmatic use.
Runtime theme switching (a toggle) is deferred (see Known Limitations).

---

## ADR-0006 — Result type + AppError taxonomy for error handling
**Status:** Accepted (Prompt 002)

**Context.** Mixed throw/return error handling is hard to reason about and leaks
internals.

**Decision.** Use `Result<T,E>` for expected, recoverable outcomes; throw
`AppError` subclasses (stable code → HTTP status, operational flag, safe
`toJSON`) for exceptional conditions. Boundary input is validated with Zod via
`lib/validation`, returning `Result`.

**Consequences.** Failure handling is explicit and type-safe; internal causes are
never serialized to clients.

---

## ADR-0007 — Environment split (client/server) guarded by `server-only`
**Status:** Accepted (Gate 1) — supersedes the single env module from Prompt 002

**Context.** The original single env module mixed `DATABASE_URL` (a secret) with
`NEXT_PUBLIC_APP_URL`. `config` imported it and was in turn imported by shell
components — a future client import would have bundled a secret.

**Decision.** Split into `env.client.ts` (public `NEXT_PUBLIC_*` only),
`env.server.ts` (secrets; `import "server-only"`), and a shared `error.ts`.
`@/lib/env` exposes only the client-safe surface; secrets require the explicit
`@/lib/env/env.server` path. Config likewise split: client-safe `constants.ts`
vs server-only `app-config.ts`.

**Consequences.** Secrets cannot reach the client bundle (build error if
attempted). Server modules are unit-tested via a Vitest `server-only` alias.

---

## ADR-0008 — Pin Prisma to v6 (not v7)
**Status:** Accepted (Prompt 002)

**Context.** Prisma 7 removed `url` from the schema and requires a
`prisma.config.ts` plus a driver adapter — a breaking change the kit's later
domain/migration prompts are not written against.

**Decision.** Pin `prisma` and `@prisma/client` to v6 (conventional
`url = env("DATABASE_URL")`).

**Consequences.** Compatibility and stability now; a documented deviation from
"latest." Migration to v7 is a tracked future task (see Known Limitations).

---

## ADR-0009 — Provider-neutral AI architecture
**Status:** Accepted (Prompt 002)

**Context.** The platform must support OpenAI, Anthropic, Gemini, OpenRouter,
local LLMs, and future providers without rewriting business logic.

**Decision.** The domain is forbidden (by ADR-0004) from importing provider SDKs.
Providers will sit behind adapters implementing app/domain-owned contracts. The
concrete provider contract is intentionally deferred to a later build step.

**Consequences.** Swapping or adding providers is an adapter change, not a
business-logic change. No provider code exists yet — the readiness is structural.

---

## ADR-0010 — Testing: Vitest (unit/component) + Playwright (e2e); deterministic
**Status:** Accepted (Prompt 002)

**Context.** Tests must be fast, isolated, and non-flaky.

**Decision.** Vitest + Testing Library for co-located unit/component tests;
Playwright for end-to-end against a real build. Time and IO are injected (clocks,
log sinks) so nothing depends on the wall clock or global state.

**Consequences.** Stable suite (currently 51 unit + 2 e2e). Coverage thresholds
and automated accessibility checks are deferred.

---

## ADR-0011 — Conventional production server (no standalone output)
**Status:** Accepted (Gate 1) — supersedes standalone output from Prompt 002

**Context.** `output: "standalone"` broke `next start` (surfaced by the e2e web
server) and added complexity not yet needed.

**Decision.** Remove standalone; the Dockerfile uses the conventional
`next start` production server.

**Consequences.** Simpler, warning-free local/CI/prod parity. Standalone can be
reintroduced later (with a tested runner) if smaller images are required.

---

## ADR-0012 — Structured logging with default redaction
**Status:** Accepted (Prompt 002), hardened in Gate 1

**Context.** A logger that can print credentials is a security liability.

**Decision.** JSON-per-line structured logger with an injectable sink; sensitive
keys (password/token/secret/apiKey/authorization/cookie/…) are redacted by
default, recursively and cycle-safe, with an extensible `redactKeys` option.

**Consequences.** Accidental credential logging is prevented at the foundation.
Richer AI-specific redaction arrives in a later step.

---

## ADR-0013 — Local toolchain installed to `~/.local/node`
**Status:** Accepted (Prompt 002)

**Context.** Homebrew could not be installed non-interactively (it requires an
admin password unavailable in the build environment).

**Decision.** Install Node 24 LTS to `~/.local/node` (no sudo) and add it to PATH.

**Consequences.** Unblocked the build without system changes. Not a standard team
setup — a reproducible install (Homebrew/nvm/`.tool-versions`) should be adopted
before onboarding engineers (see Known Limitations).

---

## ADR-0014 — Initial domain architecture and core contracts
**Status:** Accepted (Prompt 003)

**Context.** Before feature work, the platform needs a pure domain layer that is
framework/provider-independent, hard to misuse, and cheap to evolve.

**Decision.** Introduce five domain modules — `project`, `content`, `evaluation`,
`decision`, `ai` — over a `shared` kernel (branded identifiers, `Confidence`,
`Score`, `Slug`, bounded-text validation, `DomainError` hierarchy, and a small
declarative state-machine helper). Key choices:
- **Value objects only where an invariant exists** (Confidence 0–1, Score 1–10,
  Slug format, bounded names/titles/justifications). Primitives elsewhere.
- **Branded, prefix-validated identifiers** (`proj_`, `cnt_`, `eval_`, `rbr_`,
  `crit_`, `dec_`, `usr_`); different id kinds are non-interchangeable.
- **Immutable aggregates**; lifecycle changes return new values via `Result`.
- **Explicit state machines** for Project, ContentItem (with monotonic version),
  and Decision; illegal transitions yield typed `InvalidStateTransitionError`.
- **Human authority in Decision** enforced structurally: the only path to
  `DECIDED` requires a human `decidedBy`, an explicit selected option, and a
  rationale. AI `Advisory` can never decide.
- **AI is provider-neutral**: an `AiRecommendation` value (observation/inference/
  unknown separation) plus an `AiRecommender` port; SDKs live behind adapters.
- **Cross-domain references by identifier only**, imported **type-only**, so
  domains have no runtime coupling and no cycles.
- **Narrow, intent-revealing repository contracts** per domain — no generic CRUD,
  no `BaseRepository`, no Prisma/query types. **No domain events** (none justified).
- **Determinism**: aggregate factories/transitions take an injected `now`; ids are
  generated at the boundary via `@/lib/id` and validated by `parse`.

**Consequences.** Persistence, providers, and UI can be added later without
changing business logic. The ESLint domain boundary was strengthened to also
forbid `@/lib/env`, `@/lib/logging`, `@/lib/config`, `@/lib/feature-flags`, and
provider/infra SDKs; the domain may use only `@/lib/result`, `@/lib/errors`,
`@/lib/id`, `@/lib/datetime`. See `docs/DOMAIN_MODEL.md` and `docs/DOMAIN_GLOSSARY.md`.

**Reconciliation (per prompt §2).** "Content" is modeled as the **knowledge base**
(`schemas/domain-model.md` authority), not media assets; media/transcripts are a
separate deferred domain.

---

## ADR-0015 — Use-case-oriented application layer
**Status:** Accepted (Prompt 004)

**Context.** The domain (Prompt 003) needed to be validated and exercised by real
MVP workflows without coupling to transport, persistence, or providers.

**Decision.** Introduce `src/application` as a framework-independent layer of
**plain use-case functions** `(deps, input) => Promise<Result<Output, Errors>>`,
one clear business operation each. Key choices:
- **No orchestration framework** — no command bus, mediator, handler registry,
  DI container, or `BaseUseCase`. Dependencies are passed explicitly per call.
- **Explicit actor identity** (`actorId`) distinct from target ids; ownership is
  enforced with `ensureOwner` where the model supports it. Authentication remains
  deferred; content/rubric authoring authorization is a documented gap.
- **Application-owned ports** `Clock` and `IdGenerator` keep time and id creation
  deterministic and out of the domain.
- **Typed application errors** (`NotFoundError`, `NotAuthorizedError`,
  `SlugAlreadyExistsError`, `UnknownRubricCriterionError`, `RepositoryError`)
  distinct from domain errors; **no HTTP mapping** here. Port/repository failures
  are translated to a safe `RepositoryError` via `attempt()`.
- **Outputs are domain aggregates**, not DTO hierarchies or response envelopes.
- **AI stays advisory**: `requestRecommendation` mutates nothing; attaching advice
  and deciding are separate; only a human `recordHumanDecision` finalizes.
- **No transaction/concurrency/idempotency machinery** beyond what a current
  workflow requires; atomicity and optimistic concurrency are documented as
  persistence-adapter responsibilities. Idempotency relies on domain invariants.
- The application boundary is enforced by ESLint (`src/application/**`), mirroring
  the domain rule.

**Consequences.** The domain proved practical **without changes** — no
Prompt 003 API required correction. Repository contracts were validated against
real use cases and all remained necessary and correctly shaped (none added,
changed, or removed). See `docs/APPLICATION_ARCHITECTURE.md`.

---

## ADR-0016 — Prisma/PostgreSQL persistence layer
**Status:** Accepted (Prompt 005)

**Context.** The repository contracts (Prompt 003) and use cases (Prompt 004)
needed a real production persistence implementation. Prisma/PostgreSQL was already
the approved stack (ADR-0008).

**Decision.** Implement persistence in `src/infrastructure/persistence/prisma`
behind the existing domain repository contracts. Material choices:
- **No ORM abstraction over Prisma** — the domain contracts are the boundary.
  Prisma types never leak above `src/infrastructure` (ESLint-enforced both ways).
- **Branded string PKs** (application-generated), never autoincrement; mappers
  validate persisted ids/values and reject corruption with `PersistenceMappingError`.
- **Explicit mappers** per aggregate (no reflection/auto-mapper); application
  views are not reused as persistence models.
- **Native PostgreSQL enums** for stable status/type sets; **CHECK constraints**
  (hand-authored migration) for numeric ranges Prisma can't express.
- **`timestamptz(3)`** columns carrying application-clock timestamps; the database
  does not override domain time values.
- **Composite PKs** on child tables enforce aggregate-owned uniqueness; **FKs**
  cascade only for owned children and `RESTRICT` for history (evaluations/decisions).
- **Intent-revealing save semantics** (finalized in the Prompt 005 review): `save`
  was replaced by `insert` (create; rejects existing id) and `update` (rejects
  missing id) for mutable aggregates; append-only aggregates (Rubric, Evaluation)
  expose only `insert`. No upsert — persistence never silently guesses create/update.
- **Optimistic concurrency implemented** for the mutable aggregates (Project,
  Content, Decision) via a provider-neutral integer `lockVersion` + compare-and-swap
  on update; a mismatch is a typed `OptimisticConcurrencyError`. Distinct from the
  Content domain `version` (revision) and not exposed in views. Append-only
  aggregates have none. This prevents lost updates — including a duplicate human
  decision finalization overwriting a valid decision — ahead of the Prompt 006
  delivery layer.
- **Neutral repository-failure contract in `@/lib/errors`** (`ConflictError`,
  `NotFoundError`, `OptimisticConcurrencyError`): infrastructure throws them and the
  application recognizes them, so neither layer imports the other's error classes.
- **Multi-table aggregate inserts are atomic** in a repository-local `$transaction`
  (no unit-of-work framework). Slug uniqueness is database-authoritative; the create
  use case maps the neutral conflict to `SlugAlreadyExistsError`.
- **Migrations via `migrate deploy`** (never `db push`); CHECK constraints and the
  `lock_version` columns are hand-authored/normal migrations applied in order.
  Adapters take a Prisma client by constructor for testability.
- **Integration tests run against real PostgreSQL 17** via `embedded-postgres`
  (userspace, no Docker/sudo) — not SQLite or an emulation.

**Consequences.** Persistence is verified against a real database (22 integration
tests: constraints, transactions, rollback, mapping, missing-row/duplicate-id
behavior, and stale-write rejection). Domain aggregates gained a `lockVersion`
concurrency token (Project, Content, Decision) and the repository contracts moved
from `save` to `insert`/`update`; application use cases and in-memory test doubles
were updated accordingly. See `docs/PERSISTENCE_ARCHITECTURE.md`.
