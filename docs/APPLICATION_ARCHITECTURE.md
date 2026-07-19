# Application Architecture (MVP)

The application layer performs business operations by orchestrating domain
behavior. It answers: *how does Stroman OS carry out a specific operation using
the domain, without knowing about HTTP, React, Prisma, or AI-provider SDKs?*

## Dependency direction

```
delivery/infra (later)  →  application  →  domain
                               │
                               └→ @/lib/{result, errors, id, datetime}
```

Application code depends on domain modules, application-owned ports
(`Clock`, `IdGenerator`), and safe shared primitives. It must **not** import
Next/React, Prisma/SQL, provider SDKs, `@/server`, `@/ui`, `@/app`, or
`@/lib/{env,logging,config,feature-flags}`. Enforced by ESLint
(`src/application/**`).

## Structure

```
src/application/
  shared/     clock port, id-generator port, application errors, attempt(), ensureOwner()
  project/    create · get · list-for-owner · lifecycle (activate/complete/archive)
  content/    create · get-by-slug · lifecycle (publish/revise/archive)
  evaluation/ create-rubric · get-rubric · record-evaluation · get-evaluation · list-for-project
  decision/   propose · attach-advisory · record-human-decision · get · list-for-project
  ai/         request-recommendation
```

Use cases are plain functions `(deps, input) => Promise<Result<Output, Errors>>`.
There is **no** command bus, mediator, handler registry, DI container, or
`BaseUseCase` — dependencies are passed explicitly per call.

## Workflow map

Actor is the authenticated user (`OwnerId`) unless noted. Every use case:
validates input → loads state through ports → invokes domain behavior → persists
→ returns a typed `Result`. Saves happen only after domain behavior succeeds.

| Use case | Actor · intent | Loads | Domain op | Saves | Auth | Notable failures |
|----------|----------------|-------|-----------|-------|------|------------------|
| createProject | owner creates work | — | `createProject` | project | actor becomes owner | invalid name |
| getProject | owner views | project | — | — | owner-only | not found, denied |
| listProjectsForOwner | owner lists own | projects by owner | — | — | actor==owner | — |
| activate/complete/archiveProject | owner transitions | project | project transitions | project | owner-only | not found, denied, invalid transition |
| createContentItem | author adds KB item | slug existence | `createContentItem` | item | *deferred* (see auth) | duplicate slug, invalid type |
| getContentItemBySlug | read KB item | item by slug | — | — | public read | not found |
| publish/revise/archiveContentItem | author transitions | item | content transitions | item | *deferred* | not found, invalid transition |
| createRubric | author defines rubric | — | `createRubric` | rubric | *deferred* | empty/duplicate/weight |
| getRubric | load rubric | rubric | — | — | *deferred* | not found |
| recordEvaluation | owner scores project | project, rubric | `createEvaluation` | evaluation | owner of project | denied, missing rubric, unknown criterion, bad score |
| getEvaluation | owner views | evaluation, project | — | — | owner of project | not found, denied |
| listEvaluationsForProject | owner lists | project | — | — | owner of project | not found, denied |
| proposeDecision | owner opens a decision | project | `createDecision` | decision | owner of project | denied, invalid options |
| attachAdvisory | owner records AI advice | decision, project | `attachAdvisory` | decision | owner of project | not found, denied, already decided |
| recordHumanDecision | **human** decides | decision, project | `decide` | decision | owner of project == decider | denied, unknown option, already decided |
| getDecision / listDecisionsForProject | owner views | decision/project | — | — | owner of project | not found, denied |
| requestRecommendation | request AI advice | — | (port) | — | *deferred* | AI unavailable |

## Inputs and outputs

- **Inputs** are plain, transport-free objects. They carry the acting identity
  (`actorId`) separately from the target id, and raw primitives (`name: string`,
  `score: number`); domain value objects are constructed at the use-case boundary.
- **Outputs** are application-owned **projections (views)**, not domain
  aggregates (see Output policy). No Prisma, framework, or provider types cross
  the boundary, and there is no universal response envelope.

## Output policy

The output boundary is deliberate — delivery layers (API/UI, later) must not be
coupled to the domain's aggregate structure, and must never auto-serialize a
domain object.

**Rule of thumb — return the smallest stable shape a workflow needs:**

- **Query and command use cases return application-owned views** (`ProjectView`,
  `ContentItemView`, `RubricView`, `EvaluationView`, `DecisionView`). Views are
  flat, readonly, plain-data projections mapped by explicit `to*View` functions.
  They may omit fields irrelevant to output (e.g. `ProjectView` omits `ownerId`,
  an authorization detail) and shield transport from domain refactors.
- **A use case may return a domain aggregate only for internal orchestration**
  that feeds further domain behavior — never as a public output. Today the only
  aggregate-returning helpers are internal (`loadOwnedDecision`, lifecycle
  helpers); their callers map to views before returning.
- **`requestRecommendation` returns `AiRecommendation` as-is.** This is a
  provider-neutral **value contract**, not a persistence aggregate — it is the
  exact shape delivery is meant to render, so no separate view is warranted.

**Why no universal DTO / response envelope:** a generic envelope or a mapper
framework would add indirection without value and couple every use case to one
shape. Instead there is one focused view per aggregate, mapped explicitly. No
inheritance, no generics, no registry.

**View invariants (enforced by review):** views contain no methods, no mutable
(non-`readonly`) collections, and no provider, persistence, framework, or secret
fields.

**Delivery-adapter obligation:** adapters must map views to transport shapes
explicitly. They must **not** reflectively serialize domain objects, and should
not assume a view's shape mirrors an aggregate.

## Error model

- **Domain failures** (from Prompt 003): `InvalidValueError`,
  `InvalidStateTransitionError`, `DuplicateCriterionError`, `UnknownOptionError`,
  `DecisionAlreadyDecidedError`, etc.
- **Application failures** (`src/application/shared/errors`): `NotFoundError`,
  `NotAuthorizedError`, `SlugAlreadyExistsError`, `UnknownRubricCriterionError`,
  `RepositoryError`.
- Errors are **never** mapped to HTTP here and never leak infrastructure detail.
  `RepositoryError` captures the cause for outer-layer logging but its message is
  generic. Repository/port failures are translated via `attempt()`.

## Authorization boundary

Authentication is deferred, but possession of an id never implies permission.
- Project-owned resources (projects, evaluations, decisions) enforce
  `ensureOwner(actorId, project.ownerId, …)`. For evaluations and decisions the
  owning project is loaded to authorize.
- **Documented gap:** knowledge-base **content and rubrics have no owner** in the
  current model, so authoring authorization is not yet enforced. This is honest,
  not an oversight — content is curated/global. Enforce when an author/role
  concept exists. `requestRecommendation` authorization is likewise deferred.

## Transaction boundaries

Operations requiring atomicity, and how they are handled now:
- **createContentItem** (check slug uniqueness → save): the DB unique constraint is
  authoritative (implemented in Prompt 005). The pre-check is a fast-path; a race
  that passes it surfaces as a repository `CONFLICT`, which the use case maps to
  `SlugAlreadyExistsError`. See `docs/PERSISTENCE_ARCHITECTURE.md`.
- **load-modify-save** (all transitions, recordHumanDecision): a read-modify-write
  that needs isolation under concurrency. No transaction manager is introduced;
  correctness is documented as a persistence-adapter responsibility.

No unit-of-work, transaction decorator, or outbox exists (none justified yet).
In-memory tests do **not** prove database-level atomicity.

## Concurrency posture

Optimistic-concurrency (expected-version) checks are **not** introduced — no
current workflow requires them, and adding version metadata now would leak a
persistence concern. Deferred to the persistence phase (see Known Limitations).

## Idempotency posture

Handled by domain invariants where it matters: `decide` rejects a second decision
(`DecisionAlreadyDecidedError`); re-attaching advisory is safe (replaces). No
idempotency keys are added; duplicate-submission protection for retrying delivery
mechanisms is a future delivery-layer responsibility.

## AI workflow behavior

`requestRecommendation` calls the provider-neutral `AiRecommender` port and
returns an `AiRecommendation` or a typed `AiError`. It performs **no** domain
mutation. Attaching advice (`attachAdvisory`) and deciding (`recordHumanDecision`)
are separate operations, and AI advice can never finalize a decision. No provider
SDK, prompt, model routing, retry, or token accounting exists here.

## Repository-contract validation

Every domain repository method is exercised by at least one use case:

| Method | Used by |
|--------|---------|
| Project.findById / listByOwner / save | get/lifecycle/record*/list*; listForOwner; create/lifecycle |
| Content.findById / findBySlug / existsBySlug / save | content lifecycle; get-by-slug; create; create/lifecycle |
| Rubric.findById / save | getRubric, recordEvaluation; createRubric |
| Evaluation.findById / listByProject / save | getEvaluation; listForProject; recordEvaluation |
| Decision.findById / listByProject / save | get/attach/record (via decision-access); listForProject; propose/attach/record |
| AiRecommender.recommend | requestRecommendation |

No method was found unnecessary; **none were added, changed, or removed**. No
pagination/filter/sort/predicate/transaction parameters were introduced (none
required by a current workflow).

## Testing strategy

Behavioral tests use in-memory adapters (`test/adapters/`) that satisfy the real
contracts, with a `fail` switch to exercise `RepositoryError` translation, a
`FixedClock`, a `SequentialIdGenerator`, and a `StubAiRecommender`. Tests cover
success paths, expected failures (not found, denial, duplicate slug, invalid
transition, missing aggregate, unknown option/criterion, AI failure, repository
failure), and interaction correctness (no save on failed domain behavior; AI
never decides; advisory and decision are separate). Test-only adapters live
outside `src` and are never exported from production runtime.

## Explicit exclusions

No Prisma, DB schema, migrations, production repositories, API routes, server
actions, UI, auth, sessions, RBAC, queues, workers, event bus, outbox, caching,
provider SDKs/adapters, prompts, or analytics. Delivery and persistence adapters
translate this layer's typed results later.
